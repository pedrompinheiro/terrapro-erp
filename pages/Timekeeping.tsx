/**
 * Timekeeping.tsx — Importação Inteligente de Cartão de Ponto via OCR (Gemini AI)
 *
 * Upload múltiplo de fotos → IA extrai dados → matching de funcionários → revisão → salvar
 * Suporta até 3 pares de entrada/saída por dia (CLT).
 *
 * Autor: Claude Code Session (17/02/2026)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Camera, Upload, FileText, Loader2, Trash2, CheckCircle, AlertTriangle,
    X, User, ChevronDown, ChevronUp, Eye, Save, RefreshCw, ImagePlus,
    Sparkles, AlertCircle, Clock, Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import TimeInput from '../components/TimeInput';
import {
    processTimecardImage,
    processTimecardBatch,
    matchEmployee,
    ocrEntriesToTimeEntries,
    TimecardData,
    TimecardEntry,
    BatchResult
} from '../services/TimecardService';

// ============================================
// Tipos internos
// ============================================

interface Employee {
    id: string;
    name: string;
    registration_number: string;
    company_id?: string;
}

interface OcrCard {
    file: File;
    preview: string;
    status: 'pending' | 'processing' | 'success' | 'error' | 'saved';
    data?: TimecardData;
    error?: string;
    matchedEmployeeId: string;
    matchedEmployeeName: string;
    matchScore: number;
    expanded: boolean;
    editedEntries?: TimecardEntry[];
    selectedDays: Set<number>; // dias selecionados para salvar
    overrideMonth?: number;   // mês manual (1-12)
    overrideYear?: number;    // ano manual
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// ============================================
// Helper: validação de mês/ano
// ============================================

/** Corrige ano absurdo da IA (ex: 2006 vira 2026 se mês bate) */
function autoCorrectYear(detectedYear: number): number {
    const now = new Date();
    const currentYear = now.getFullYear();
    // Se o ano detectado é > 20 anos atrás ou no futuro distante, provavelmente a IA errou o século/década
    if (detectedYear < currentYear - 2 || detectedYear > currentYear + 1) {
        // Tenta corrigir mantendo os últimos 2 dígitos e usando o século correto
        const last2 = detectedYear % 100;
        const corrected = Math.floor(currentYear / 100) * 100 + last2;
        // Se o corrigido fica próximo (±2 anos), usa ele
        if (Math.abs(corrected - currentYear) <= 2) {
            return corrected;
        }
        // Senão, retorna ano atual
        return currentYear;
    }
    return detectedYear;
}

/** Verifica se mês/ano é o atual ou anterior */
function isCurrentOrPreviousMonth(month: number, year: number): boolean {
    const now = new Date();
    const curM = now.getMonth() + 1;
    const curY = now.getFullYear();

    // Mês atual
    if (month === curM && year === curY) return true;

    // Mês anterior
    let prevM = curM - 1;
    let prevY = curY;
    if (prevM === 0) { prevM = 12; prevY--; }
    if (month === prevM && year === prevY) return true;

    return false;
}

interface DateConfirmation {
    cardIdx: number;
    month: number;
    year: number;
    action: 'saveCard' | 'saveAll';
}

// ============================================
// Componente Principal
// ============================================

const Timekeeping: React.FC = () => {
    const [cards, setCards] = useState<OcrCard[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedCount, setSavedCount] = useState(0);
    const [totalToSave, setTotalToSave] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const [hasGeminiKey, setHasGeminiKey] = useState(true);
    const [dateConfirmation, setDateConfirmation] = useState<DateConfirmation | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Verificar chave IA (multi-provider)
    useEffect(() => {
        const checkKey = async () => {
            const { getConfig } = await import('../lib/aiService');
            const config = await getConfig();
            setHasGeminiKey(!!config.apiKey);
        };
        checkKey();
    }, []);

    // Carregar lista de funcionários
    useEffect(() => {
        const fetchEmployees = async () => {
            const { data, error } = await supabase
                .from('employees')
                .select('id, full_name, registration_number, company_id')
                .eq('active', true)
                .order('full_name');

            if (data && !error) {
                setEmployees(data.map((e: any) => ({
                    id: e.id,
                    name: e.full_name || 'Sem Nome',
                    registration_number: e.registration_number || '',
                    company_id: e.company_id
                })));
            }
        };
        fetchEmployees();
    }, []);

    // ============================================
    // Upload de Arquivos
    // ============================================

    const handleFiles = useCallback((files: FileList | File[]) => {
        const newCards: OcrCard[] = Array.from(files)
            .filter(f => f.type.startsWith('image/'))
            .map(f => ({
                file: f,
                preview: URL.createObjectURL(f),
                status: 'pending' as const,
                matchedEmployeeId: '',
                matchedEmployeeName: '',
                matchScore: 0,
                expanded: false,
                selectedDays: new Set<number>(),
            }));

        setCards(prev => [...prev, ...newCards]);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
            e.target.value = ''; // Reset para permitir re-upload do mesmo arquivo
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const removeCard = (idx: number) => {
        setCards(prev => {
            const copy = [...prev];
            URL.revokeObjectURL(copy[idx].preview);
            copy.splice(idx, 1);
            return copy;
        });
    };

    // ============================================
    // Processamento OCR
    // ============================================

    const processAll = async () => {
        setIsProcessing(true);
        const updated = [...cards];

        for (let i = 0; i < updated.length; i++) {
            if (updated[i].status !== 'pending') continue;

            updated[i].status = 'processing';
            setCards([...updated]);

            try {
                const data = await processTimecardImage(updated[i].file);

                // Auto-corrigir ano absurdo da IA (ex: 2006 → 2026)
                if (data.year) {
                    const correctedYear = autoCorrectYear(data.year);
                    if (correctedYear !== data.year) {
                        console.log(`[OCR] Ano corrigido automaticamente: ${data.year} → ${correctedYear}`);
                        data.year = correctedYear;
                        // Recalcular datas das entries
                        data.entries = data.entries.map(e => ({
                            ...e,
                            date: `${correctedYear}-${String(data.month).padStart(2, '0')}-${String(e.day).padStart(2, '0')}`,
                        }));
                    }
                }

                updated[i].status = 'success';
                updated[i].data = data;
                updated[i].editedEntries = [...data.entries];
                updated[i].expanded = true;

                // Selecionar todos os dias que têm pelo menos 1 batida
                const daysWithData = new Set<number>();
                data.entries.forEach(e => {
                    if (e.entrada1 || e.saida1 || e.entrada2 || e.saida2) {
                        daysWithData.add(e.day);
                    }
                });
                updated[i].selectedDays = daysWithData;

                // Auto-match de funcionário
                const match = matchEmployee(data.employeeName, employees);
                if (match) {
                    updated[i].matchedEmployeeId = match.id;
                    updated[i].matchedEmployeeName = match.name;
                    updated[i].matchScore = match.score;
                }

            } catch (err) {
                updated[i].status = 'error';
                updated[i].error = err instanceof Error ? err.message : String(err);
            }

            setCards([...updated]);
        }

        setIsProcessing(false);
    };

    const retryCard = async (idx: number) => {
        const updated = [...cards];
        updated[idx].status = 'processing';
        updated[idx].error = undefined;
        setCards([...updated]);

        try {
            const data = await processTimecardImage(updated[idx].file);

            // Auto-corrigir ano absurdo da IA
            if (data.year) {
                const correctedYear = autoCorrectYear(data.year);
                if (correctedYear !== data.year) {
                    console.log(`[OCR] Ano corrigido automaticamente: ${data.year} → ${correctedYear}`);
                    data.year = correctedYear;
                    data.entries = data.entries.map(e => ({
                        ...e,
                        date: `${correctedYear}-${String(data.month).padStart(2, '0')}-${String(e.day).padStart(2, '0')}`,
                    }));
                }
            }

            updated[idx].status = 'success';
            updated[idx].data = data;
            updated[idx].editedEntries = [...data.entries];
            updated[idx].expanded = true;

            const daysWithData = new Set<number>();
            data.entries.forEach(e => {
                if (e.entrada1 || e.saida1 || e.entrada2 || e.saida2) {
                    daysWithData.add(e.day);
                }
            });
            updated[idx].selectedDays = daysWithData;

            const match = matchEmployee(data.employeeName, employees);
            if (match) {
                updated[idx].matchedEmployeeId = match.id;
                updated[idx].matchedEmployeeName = match.name;
                updated[idx].matchScore = match.score;
            }
        } catch (err) {
            updated[idx].status = 'error';
            updated[idx].error = err instanceof Error ? err.message : String(err);
        }

        setCards([...updated]);
    };

    // ============================================
    // Edição de dados extraídos
    // ============================================

    const updateEntryField = (cardIdx: number, entryIdx: number, field: keyof TimecardEntry, value: string) => {
        setCards(prev => {
            const copy = [...prev];
            if (copy[cardIdx].editedEntries) {
                const entries = [...copy[cardIdx].editedEntries!];
                entries[entryIdx] = { ...entries[entryIdx], [field]: value || null };
                copy[cardIdx] = { ...copy[cardIdx], editedEntries: entries };
            }
            return copy;
        });
    };

    const toggleDay = (cardIdx: number, day: number) => {
        setCards(prev => {
            const copy = [...prev];
            const selected = new Set(copy[cardIdx].selectedDays);
            if (selected.has(day)) {
                selected.delete(day);
            } else {
                selected.add(day);
            }
            copy[cardIdx] = { ...copy[cardIdx], selectedDays: selected };
            return copy;
        });
    };

    const toggleAllDays = (cardIdx: number) => {
        setCards(prev => {
            const copy = [...prev];
            const entries = copy[cardIdx].editedEntries || copy[cardIdx].data?.entries || [];
            const allDays = entries.filter(e => e.entrada1 || e.saida1).map(e => e.day);
            const currentSelected = copy[cardIdx].selectedDays;

            if (currentSelected.size === allDays.length) {
                copy[cardIdx] = { ...copy[cardIdx], selectedDays: new Set<number>() };
            } else {
                copy[cardIdx] = { ...copy[cardIdx], selectedDays: new Set(allDays) };
            }
            return copy;
        });
    };

    const changeMonthYear = (cardIdx: number, month: number, year: number) => {
        setCards(prev => {
            const copy = [...prev];
            const card = copy[cardIdx];
            const entries = card.editedEntries || card.data?.entries || [];

            // Recalcular as datas de cada entry com o novo mês/ano
            const updatedEntries = entries.map(e => ({
                ...e,
                date: `${year}-${String(month).padStart(2, '0')}-${String(e.day).padStart(2, '0')}`,
            }));

            copy[cardIdx] = {
                ...card,
                overrideMonth: month,
                overrideYear: year,
                editedEntries: updatedEntries,
            };
            return copy;
        });
    };

    const changeEmployee = (cardIdx: number, empId: string) => {
        setCards(prev => {
            const copy = [...prev];
            const emp = employees.find(e => e.id === empId);
            copy[cardIdx] = {
                ...copy[cardIdx],
                matchedEmployeeId: empId,
                matchedEmployeeName: emp?.name || '',
                matchScore: empId ? 100 : 0, // Manual override = 100
            };
            return copy;
        });
    };

    // ============================================
    // Validação de mês/ano antes de salvar
    // ============================================

    /** Verifica se algum card tem mês/ano fora do esperado e pede confirmação */
    const getCardMonthYear = (card: OcrCard) => {
        const month = card.overrideMonth || card.data?.month || new Date().getMonth() + 1;
        const year = card.overrideYear || card.data?.year || new Date().getFullYear();
        return { month, year };
    };

    const requestSaveAll = () => {
        // Verificar se algum card tem mês/ano fora do atual/anterior
        const cardsToSave = cards.filter(
            c => c.status === 'success' && c.matchedEmployeeId && c.selectedDays.size > 0
        );
        const unusual = cardsToSave.find(c => {
            const { month, year } = getCardMonthYear(c);
            return !isCurrentOrPreviousMonth(month, year);
        });

        if (unusual) {
            const { month, year } = getCardMonthYear(unusual);
            setDateConfirmation({ cardIdx: -1, month, year, action: 'saveAll' });
        } else {
            doSaveAll();
        }
    };

    const requestSaveCard = (idx: number) => {
        const card = cards[idx];
        if (!card) return;
        const { month, year } = getCardMonthYear(card);

        if (!isCurrentOrPreviousMonth(month, year)) {
            setDateConfirmation({ cardIdx: idx, month, year, action: 'saveCard' });
        } else {
            doSaveCard(idx);
        }
    };

    const handleDateConfirm = () => {
        if (!dateConfirmation) return;
        if (dateConfirmation.action === 'saveAll') {
            doSaveAll();
        } else {
            doSaveCard(dateConfirmation.cardIdx);
        }
        setDateConfirmation(null);
    };

    // ============================================
    // Salvar no Supabase
    // ============================================

    const doSaveAll = async () => {
        setIsSaving(true);
        setSavedCount(0);

        const cardsToSave = cards.filter(
            c => c.status === 'success' && c.matchedEmployeeId && c.selectedDays.size > 0
        );
        console.log('[SAVE] Cards to save:', cardsToSave.length, cardsToSave.map(c => ({
            emp: c.matchedEmployeeName,
            empId: c.matchedEmployeeId,
            days: c.selectedDays.size,
            status: c.status
        })));
        setTotalToSave(cardsToSave.reduce((sum, c) => sum + c.selectedDays.size, 0));

        let count = 0;
        const updated = [...cards];

        for (let i = 0; i < updated.length; i++) {
            const card = updated[i];
            if (card.status !== 'success' || !card.matchedEmployeeId || card.selectedDays.size === 0) {
                console.log(`[SAVE] Skipping card ${i}: status=${card.status}, empId=${card.matchedEmployeeId}, days=${card.selectedDays?.size}`);
                continue;
            }

            // Pegar mês/ano correto: override > OCR > atual
            const saveMonth = card.overrideMonth || card.data?.month || new Date().getMonth() + 1;
            const saveYear = card.overrideYear || card.data?.year || new Date().getFullYear();

            const entries = (card.editedEntries || card.data?.entries || [])
                .filter(e => card.selectedDays.has(e.day))
                .map(e => ({
                    ...e,
                    // SEMPRE recalcular a data com mês/ano correto
                    date: `${saveYear}-${String(saveMonth).padStart(2, '0')}-${String(e.day).padStart(2, '0')}`,
                }));

            const emp = employees.find(e => e.id === card.matchedEmployeeId);
            console.log(`[SAVE] Card ${i}: emp=${emp?.name}, company_id=${emp?.company_id}, month=${saveMonth}/${saveYear}, entries=${entries.length}`);
            const records = ocrEntriesToTimeEntries(entries, card.matchedEmployeeId, emp?.company_id);
            console.log(`[SAVE] Records to upsert:`, records.length, records.length > 0 ? records[0] : 'EMPTY');

            let allOk = true;
            for (const record of records) {
                console.log(`[SAVE] Upserting:`, JSON.stringify(record));
                const { error, data } = await supabase
                    .from('time_entries')
                    .upsert(record, { onConflict: 'employee_id,date' as any });

                if (error) {
                    console.error('[SAVE] ERRO ao salvar:', record.date, JSON.stringify(error));
                    allOk = false;
                } else {
                    console.log(`[SAVE] OK: ${record.date}`, data);
                    count++;
                    setSavedCount(count);
                }
            }

            if (allOk) {
                updated[i] = { ...updated[i], status: 'saved' };
            }
        }

        setCards([...updated]);
        setIsSaving(false);
    };

    // ============================================
    // Salvar card individual
    // ============================================

    const doSaveCard = async (idx: number) => {
        const card = cards[idx];
        if (!card || card.status !== 'success' || !card.matchedEmployeeId || card.selectedDays.size === 0) return;

        const saveMonth = card.overrideMonth || card.data?.month || new Date().getMonth() + 1;
        const saveYear = card.overrideYear || card.data?.year || new Date().getFullYear();

        const entries = (card.editedEntries || card.data?.entries || [])
            .filter(e => card.selectedDays.has(e.day))
            .map(e => ({
                ...e,
                date: `${saveYear}-${String(saveMonth).padStart(2, '0')}-${String(e.day).padStart(2, '0')}`,
            }));

        const emp = employees.find(e => e.id === card.matchedEmployeeId);
        const records = ocrEntriesToTimeEntries(entries, card.matchedEmployeeId, emp?.company_id);

        let allOk = true;
        for (const record of records) {
            const { error } = await supabase
                .from('time_entries')
                .upsert(record, { onConflict: 'employee_id,date' as any });
            if (error) {
                console.error('[SAVE] ERRO:', record.date, JSON.stringify(error));
                allOk = false;
            }
        }

        if (allOk) {
            setCards(prev => {
                const copy = [...prev];
                copy[idx] = { ...copy[idx], status: 'saved' };
                return copy;
            });
        }
    };

    // ============================================
    // Contadores
    // ============================================

    const pendingCount = cards.filter(c => c.status === 'pending').length;
    const successCount = cards.filter(c => c.status === 'success').length;
    const errorCount = cards.filter(c => c.status === 'error').length;
    const savedCards = cards.filter(c => c.status === 'saved').length;
    const readyToSave = cards.filter(c => c.status === 'success' && c.matchedEmployeeId && c.selectedDays.size > 0).length;

    // ============================================
    // Render
    // ============================================

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Camera size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">
                                Importação OCR — Cartão de Ponto
                            </h1>
                            <p className="text-sm text-slate-500">
                                Fotografe os cartões e a IA extrai os dados automaticamente
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Status badges */}
                        {cards.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                                {pendingCount > 0 && (
                                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                        {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
                                    </span>
                                )}
                                {successCount > 0 && (
                                    <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                                        {successCount} lido{successCount > 1 ? 's' : ''}
                                    </span>
                                )}
                                {errorCount > 0 && (
                                    <span className="px-2 py-1 rounded-full bg-red-50 text-red-600">
                                        {errorCount} erro{errorCount > 1 ? 's' : ''}
                                    </span>
                                )}
                                {savedCards > 0 && (
                                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                        {savedCards} salvo{savedCards > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Ações */}
                        {pendingCount > 0 && (
                            <button
                                onClick={processAll}
                                disabled={isProcessing || !hasGeminiKey}
                                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
                            >
                                {isProcessing ? (
                                    <><Loader2 size={16} className="animate-spin" /> Processando...</>
                                ) : (
                                    <><Sparkles size={16} /> Processar com IA ({pendingCount})</>
                                )}
                            </button>
                        )}

                        {readyToSave > 0 && (
                            <button
                                onClick={requestSaveAll}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
                            >
                                {isSaving ? (
                                    <><Loader2 size={16} className="animate-spin" /> Salvando {savedCount}/{totalToSave}...</>
                                ) : (
                                    <><Save size={16} /> Salvar Tudo ({readyToSave})</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* API Key Warning */}
                {!hasGeminiKey && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-amber-800">Chave Gemini AI necessária</p>
                            <p className="text-sm text-amber-700 mt-1">
                                Configure sua chave Gemini em <strong>Configurações → Integrações & API</strong> para usar a leitura por IA.
                                Obtenha sua chave em <span className="underline">aistudio.google.com</span>.
                            </p>
                        </div>
                    </div>
                )}

                {/* Upload Zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                        transition-all duration-200
                        ${dragOver
                            ? 'border-violet-400 bg-violet-50 scale-[1.01]'
                            : 'border-slate-300 hover:border-violet-300 hover:bg-slate-50'
                        }
                        ${cards.length > 0 ? 'py-6' : 'py-12'}
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                    />

                    <div className="flex flex-col items-center gap-2">
                        {cards.length === 0 ? (
                            <>
                                <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-2">
                                    <ImagePlus size={32} className="text-violet-500" />
                                </div>
                                <p className="text-lg font-semibold text-slate-700">
                                    Arraste fotos dos cartões de ponto aqui
                                </p>
                                <p className="text-sm text-slate-500">
                                    ou clique para selecionar • JPG, PNG • múltiplas fotos
                                </p>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <ImagePlus size={18} className="text-violet-500" />
                                <span>Adicionar mais fotos</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cards List */}
                {cards.length > 0 && (
                    <div className="mt-6 space-y-4">
                        {cards.map((card, idx) => (
                            <OcrCardComponent
                                key={idx}
                                card={card}
                                index={idx}
                                employees={employees}
                                onRemove={() => removeCard(idx)}
                                onRetry={() => retryCard(idx)}
                                onToggleExpand={() => {
                                    setCards(prev => {
                                        const copy = [...prev];
                                        copy[idx] = { ...copy[idx], expanded: !copy[idx].expanded };
                                        return copy;
                                    });
                                }}
                                onChangeEmployee={(empId) => changeEmployee(idx, empId)}
                                onChangeMonthYear={(month, year) => changeMonthYear(idx, month, year)}
                                onUpdateEntry={(entryIdx, field, value) =>
                                    updateEntryField(idx, entryIdx, field, value)
                                }
                                onToggleDay={(day) => toggleDay(idx, day)}
                                onToggleAllDays={() => toggleAllDays(idx)}
                                onSaveCard={() => requestSaveCard(idx)}
                            />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {cards.length === 0 && (
                    <div className="mt-12 text-center text-slate-400">
                        <Camera size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="text-sm">Nenhuma imagem carregada ainda</p>
                    </div>
                )}
            </div>

            {/* Modal de confirmação de mês/ano incomum */}
            {dateConfirmation && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle size={22} className="text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">
                                Data fora do período esperado
                            </h3>
                        </div>

                        <p className="text-sm text-slate-600 mb-2">
                            O cartão está configurado para salvar em:
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-center">
                            <span className="text-xl font-bold text-amber-800">
                                {MONTH_NAMES[dateConfirmation.month - 1]}/{dateConfirmation.year}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">
                            Esse período é diferente do mês atual ou anterior. A IA pode ter detectado o mês/ano incorretamente.
                            Deseja continuar mesmo assim?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDateConfirmation(null)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                            >
                                Cancelar e Corrigir
                            </button>
                            <button
                                onClick={handleDateConfirm}
                                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors text-sm"
                            >
                                Salvar mesmo assim
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================
// Componente: Card individual de OCR
// ============================================

interface OcrCardProps {
    card: OcrCard;
    index: number;
    employees: Employee[];
    onRemove: () => void;
    onRetry: () => void;
    onToggleExpand: () => void;
    onChangeEmployee: (empId: string) => void;
    onChangeMonthYear: (month: number, year: number) => void;
    onUpdateEntry: (entryIdx: number, field: keyof TimecardEntry, value: string) => void;
    onToggleDay: (day: number) => void;
    onToggleAllDays: () => void;
    onSaveCard: () => void | Promise<void>;
}

const OcrCardComponent: React.FC<OcrCardProps> = ({
    card, index, employees, onRemove, onRetry, onToggleExpand,
    onChangeEmployee, onChangeMonthYear, onUpdateEntry, onToggleDay, onToggleAllDays, onSaveCard
}) => {
    const [isSavingThis, setIsSavingThis] = useState(false);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
    const [empSearch, setEmpSearch] = useState('');

    const statusColors: Record<string, string> = {
        pending: 'bg-slate-100 text-slate-600 border-slate-200',
        processing: 'bg-violet-50 text-violet-700 border-violet-200',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        error: 'bg-red-50 text-red-600 border-red-200',
        saved: 'bg-blue-50 text-blue-700 border-blue-200',
    };

    const statusLabels: Record<string, string> = {
        pending: 'Aguardando',
        processing: 'Lendo...',
        success: 'Lido com sucesso',
        error: 'Erro',
        saved: 'Salvo',
    };

    const entries = card.editedEntries || card.data?.entries || [];
    const entriesWithData = entries.filter(e => e.entrada1 || e.saida1 || e.entrada2 || e.saida2);
    const filteredEmps = employees.filter(e =>
        e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
        e.registration_number.includes(empSearch)
    );

    const confidenceColor = (card.data?.confidence || 0) >= 80 ? 'text-emerald-600' :
        (card.data?.confidence || 0) >= 50 ? 'text-amber-600' : 'text-red-500';

    // Verificar se mês/ano é incomum (fora do mês atual/anterior)
    const selMonth = card.overrideMonth || card.data?.month || new Date().getMonth() + 1;
    const selYear = card.overrideYear || card.data?.year || new Date().getFullYear();
    const isDateUnusual = card.status === 'success' && !isCurrentOrPreviousMonth(selMonth, selYear);

    return (
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
            card.status === 'saved' ? 'border-blue-200 opacity-75' : 'border-slate-200'
        }`}>
            {/* Header */}
            <div className="flex items-center gap-4 p-4">
                {/* Thumbnail */}
                <img
                    src={card.preview}
                    alt={`Cartão ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-slate-200"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[card.status]}`}>
                            {card.status === 'processing' && <Loader2 size={12} className="animate-spin mr-1" />}
                            {card.status === 'success' && <CheckCircle size={12} className="mr-1" />}
                            {card.status === 'error' && <AlertTriangle size={12} className="mr-1" />}
                            {card.status === 'saved' && <CheckCircle size={12} className="mr-1" />}
                            {statusLabels[card.status]}
                        </span>

                        {card.data && (
                            <>
                                <span className={`text-xs font-medium ${confidenceColor}`}>
                                    {card.data.confidence}% confiança
                                </span>
                                <span className="text-xs text-slate-400">
                                    • {entriesWithData.length} dias detectados
                                </span>
                                {card.data.period !== 'full' && (
                                    <span className="text-xs text-slate-400">
                                        • {card.data.period === '1' ? '1ª' : '2ª'} Quinzena
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {/* Nome detectado + Match */}
                    {card.data && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">IA detectou:</span>
                            <span className="text-sm font-medium text-slate-700 italic">
                                "{card.data.employeeName}"
                            </span>
                            {card.matchedEmployeeName && (
                                <span className={`text-xs ${card.matchScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    → {card.matchedEmployeeName} ({card.matchScore}%)
                                </span>
                            )}
                        </div>
                    )}

                    {/* Error message */}
                    {card.error && (
                        <p className="text-xs text-red-500 mt-1">{card.error}</p>
                    )}

                    {/* Warnings */}
                    {card.data?.warnings && card.data.warnings.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle size={12} className="text-amber-500" />
                            <span className="text-xs text-amber-600">
                                {card.data.warnings.join(' • ')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Seletor de Mês/Ano */}
                {card.status === 'success' && (
                    <div className={`flex items-center gap-1.5 flex-shrink-0 ${isDateUnusual ? 'ring-2 ring-amber-400 rounded-lg px-1.5 py-0.5 bg-amber-50' : ''}`}>
                        {isDateUnusual && <AlertTriangle size={14} className="text-amber-500" />}
                        <Calendar size={14} className={isDateUnusual ? 'text-amber-500' : 'text-slate-400'} />
                        <select
                            value={card.overrideMonth || card.data?.month || new Date().getMonth() + 1}
                            onChange={e => {
                                const m = Number(e.target.value);
                                const y = card.overrideYear || card.data?.year || new Date().getFullYear();
                                onChangeMonthYear(m, y);
                            }}
                            className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none"
                        >
                            {MONTH_NAMES.map((name, i) => (
                                <option key={i + 1} value={i + 1}>{name}</option>
                            ))}
                        </select>
                        <select
                            value={card.overrideYear || card.data?.year || new Date().getFullYear()}
                            onChange={e => {
                                const y = Number(e.target.value);
                                const m = card.overrideMonth || card.data?.month || new Date().getMonth() + 1;
                                onChangeMonthYear(m, y);
                            }}
                            className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none"
                        >
                            {[2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Seletor de Funcionário */}
                {card.status === 'success' && (
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                                card.matchedEmployeeId
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-amber-200 bg-amber-50 text-amber-700'
                            }`}
                        >
                            <User size={14} />
                            <span className="max-w-[160px] truncate">
                                {card.matchedEmployeeName || 'Selecionar funcionário'}
                            </span>
                            <ChevronDown size={14} />
                        </button>

                        {showEmployeeDropdown && (
                            <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-64 overflow-hidden">
                                <div className="p-2 border-b border-slate-100">
                                    <input
                                        type="text"
                                        value={empSearch}
                                        onChange={e => setEmpSearch(e.target.value)}
                                        placeholder="Buscar funcionário..."
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                        autoFocus
                                    />
                                </div>
                                <div className="overflow-y-auto max-h-48">
                                    {filteredEmps.map(emp => (
                                        <button
                                            key={emp.id}
                                            onClick={() => {
                                                onChangeEmployee(emp.id);
                                                setShowEmployeeDropdown(false);
                                                setEmpSearch('');
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between ${
                                                emp.id === card.matchedEmployeeId ? 'bg-violet-50 text-violet-700' : 'text-slate-700'
                                            }`}
                                        >
                                            <span className="truncate">{emp.name}</span>
                                            <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                                                {emp.registration_number}
                                            </span>
                                        </button>
                                    ))}
                                    {filteredEmps.length === 0 && (
                                        <p className="text-sm text-slate-400 text-center py-4">Nenhum encontrado</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Botões */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {card.status === 'success' && card.matchedEmployeeId && card.selectedDays.size > 0 && (
                        <button
                            onClick={async () => {
                                setIsSavingThis(true);
                                await onSaveCard();
                                setIsSavingThis(false);
                            }}
                            disabled={isSavingThis}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
                            title="Salvar este cartão"
                        >
                            {isSavingThis ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Salvar
                        </button>
                    )}
                    {card.status === 'error' && (
                        <button onClick={onRetry} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" title="Tentar novamente">
                            <RefreshCw size={16} />
                        </button>
                    )}
                    {(card.status === 'success' || card.status === 'saved') && (
                        <button onClick={onToggleExpand} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" title="Expandir/Recolher">
                            {card.expanded ? <ChevronUp size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                    {card.status !== 'saved' && (
                        <button onClick={onRemove} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500" title="Remover">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Tabela de registros expandida */}
            {card.expanded && entries.length > 0 && (
                <div className="border-t border-slate-100 px-4 pb-4">
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase">
                                Registros Detectados
                            </span>
                            {card.data && (
                                <span className="text-xs text-slate-400">
                                    <Calendar size={12} className="inline mr-1" />
                                    {card.data.month && MONTHS_SHORT[card.data.month - 1]}/{card.data.year}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onToggleAllDays}
                            className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                        >
                            {card.selectedDays.size === entriesWithData.length ? 'Desmarcar todos' : 'Marcar todos'}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-slate-500 uppercase">
                                    <th className="px-2 py-2 text-center w-8">✓</th>
                                    <th className="px-2 py-2 text-center w-12">Dia</th>
                                    <th className="px-2 py-2 text-center">Entrada 1</th>
                                    <th className="px-2 py-2 text-center">Saída 1</th>
                                    <th className="px-2 py-2 text-center">Entrada 2</th>
                                    <th className="px-2 py-2 text-center">Saída 2</th>
                                    <th className="px-2 py-2 text-center">Entrada 3</th>
                                    <th className="px-2 py-2 text-center">Saída 3</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {entries.map((entry, eIdx) => {
                                    const hasData = !!(entry.entrada1 || entry.saida1 || entry.entrada2 || entry.saida2);
                                    const isSelected = card.selectedDays.has(entry.day);
                                    const isWeekend = entry.date ? [0, 6].includes(new Date(entry.date + 'T12:00:00').getDay()) : false;

                                    return (
                                        <tr
                                            key={eIdx}
                                            className={`
                                                ${!hasData ? 'opacity-40' : ''}
                                                ${isWeekend && hasData ? 'bg-amber-50/50' : ''}
                                                ${isSelected ? '' : 'bg-slate-50/50'}
                                            `}
                                        >
                                            <td className="px-2 py-1.5 text-center">
                                                {hasData && card.status !== 'saved' && (
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => onToggleDay(entry.day)}
                                                        className="w-3.5 h-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-2 py-1.5 text-center">
                                                <span className={`font-mono font-bold text-xs ${isWeekend ? 'text-amber-600' : 'text-slate-700'}`}>
                                                    {String(entry.day).padStart(2, '0')}
                                                </span>
                                            </td>
                                            {(['entrada1', 'saida1', 'entrada2', 'saida2', 'entrada3', 'saida3'] as const).map(field => (
                                                <td key={field} className="px-1 py-1.5 text-center">
                                                    {card.status !== 'saved' ? (
                                                        <TimeInput
                                                            value={entry[field]}
                                                            onChange={v => onUpdateEntry(eIdx, field, v)}
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-mono text-slate-600">
                                                            {entry[field] || '-'}
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Resumo */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                        <span>
                            <CheckCircle size={12} className="inline mr-1 text-emerald-500" />
                            {card.selectedDays.size} dia{card.selectedDays.size !== 1 ? 's' : ''} selecionado{card.selectedDays.size !== 1 ? 's' : ''}
                        </span>
                        <span>
                            <Clock size={12} className="inline mr-1" />
                            {entriesWithData.length} dia{entriesWithData.length !== 1 ? 's' : ''} com dados
                        </span>
                        {entries.length - entriesWithData.length > 0 && (
                            <span className="text-slate-400">
                                {entries.length - entriesWithData.length} dia{(entries.length - entriesWithData.length) !== 1 ? 's' : ''} em branco (folga/falta)
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper
const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default Timekeeping;
// Date validation v1
