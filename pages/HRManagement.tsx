
import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, FileText, User, Save, Search, Download, Edit2, AlertCircle, Plus, Minus, Folder, Loader2, Camera, Upload, Trash2, CheckCircle, AlertTriangle, X, Calculator } from 'lucide-react';
import Modal from '../components/Modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Tesseract from 'tesseract.js';
import EmployeeForm from '../components/hr/EmployeeForm';
import TimeInput from '../components/TimeInput';
import { supabase } from '../lib/supabase';

interface OCRResult {
    file: File;
    preview: string;
    status: 'pending' | 'processing' | 'success' | 'error';
    extractedText?: string;
    matchedEmployeeId?: string;
    matchedEmployeeName?: string;
    detectedDate?: string;
    detectedTimes?: string[];
    confidence?: number;
    logs: string[];
    manualDate?: string;
    manualEntry1?: string;
    manualExit1?: string;
    manualEntry2?: string;
    manualExit2?: string;
    parsedRecords?: Array<{
        data: string;
        entrada1: string;
        saida1: string;
        entrada2: string;
        saida2: string;
        selected?: boolean;
    }>;
}
import { dashboardService } from '../services/api';
import { TimeRecord, PayrollEntry } from '../services/mockData'; // tipos apenas — sem dados mock
import { ERPDocument } from '../types';

interface Employee {
    id: string;
    name: string;
    role: string;
    registration_number: string;
    company_id?: string;
    company_name?: string;
    active?: boolean;
    work_shift_id?: string;
    work_shift?: {
        name: string;
        work_days: string[];
        start_time: string;
        end_time: string;
    } | null;
}

type HRTab = 'TIMEKEEPING' | 'PAYROLL' | 'DOCUMENTS';

const HRManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<HRTab>('TIMEKEEPING');
    const [employees, setEmployees] = useState<Employee[]>([]);

    // Employee Form State
    const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
    const [editingEmpId, setEditingEmpId] = useState<string | null>(null);

    // OCR / Upload States
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [ocrFiles, setOcrFiles] = useState<File[]>([]);
    const [ocrResults, setOcrResults] = useState<OCRResult[]>([]);
    const [isProcessingOCR, setIsProcessingOCR] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Novos estados de filtro
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');
    const [companies, setCompanies] = useState<string[]>([]);
    const [availableCompanies, setAvailableCompanies] = useState<{ id: string, name: string }[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string>('TODAS');

    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [isValeModalOpen, setIsValeModalOpen] = useState(false);
    const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
    const [payrollData, setPayrollData] = useState<PayrollEntry[]>([]);
    const [documents, setDocuments] = useState<ERPDocument[]>([]);

    const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Estados de Período (Padrão: Mês Anterior Completo)
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        // 1º dia do mês anterior
        return new Date(date.getFullYear(), date.getMonth() - 1, 1).toISOString().split('T')[0];
    });

    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        // Último dia do mês anterior (dia 0 do mês atual)
        return new Date(date.getFullYear(), date.getMonth(), 0).toISOString().split('T')[0];
    });

    // Cálculo simples de saldo (exemplo: soma total - (dias úteis * 8h))
    // Por enquanto, apenas soma as horas trabalhadas vs horas esperadas
    // (Função calculateBalance movida para junto dos helpers de tempo abaixo)

    // --- SELEÇÃO MÚLTIPLA ---
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

    const handleEmployeeClick = (empId: string, e: React.MouseEvent) => {
        let newSelected = [...selectedIds];

        // Se clicar sem modificadores e o item já estiver na seleção múltipla, mantemos assim pra evitar deselecionar tudo acidentalmente?
        // Padrão Explorer: Clique simples limpa seleção e seleciona só o novo.

        if (e.shiftKey && lastSelectedId) {
            const startIdx = filteredEmployees.findIndex(emp => emp.id === lastSelectedId);
            const endIdx = filteredEmployees.findIndex(emp => emp.id === empId);

            if (startIdx !== -1 && endIdx !== -1) {
                const min = Math.min(startIdx, endIdx);
                const max = Math.max(startIdx, endIdx);
                const range = filteredEmployees.slice(min, max + 1).map(emp => emp.id);

                // Lógica Melhorada: Shift ADICIONA o range à seleção existente, não substitui.
                // Isso permite selecionar um grupo, depois rolar e selecionar outro grupo com Shift.
                // Para desmarcar, o usuário deve usar Ctrl+Click.
                newSelected = Array.from(new Set([...newSelected, ...range]));
            }
        } else if (e.metaKey || e.ctrlKey) {
            // Ctrl/Cmd: Toggle individual e define nova âncora
            if (newSelected.includes(empId)) {
                newSelected = newSelected.filter(id => id !== empId);
            } else {
                newSelected.push(empId);
            }
            setLastSelectedId(empId); // Define nova âncora
        } else {
            // Clique simples: Limpa e seleciona um novo
            newSelected = [empId];
            setLastSelectedId(empId); // Define nova âncora
        }

        setSelectedIds(newSelected);

        // Sincroniza com o painel de detalhes (Single Selection view)
        if (newSelected.length === 1) {
            setSelectedEmployee(newSelected[0]);
        } else {
            setSelectedEmployee(null); // Esconde detalhes individuais se múltiplo ou zero
        }
    };

    const handleMassAction = async (action: 'DEACTIVATE' | 'REACTIVATE') => {
        if (!window.confirm(`Confirma ${action === 'DEACTIVATE' ? 'desligar' : 'reativar'} ${selectedIds.length} colaboradores selecionados?`)) return;

        try {


            const statusBool = action === 'REACTIVATE';

            const { error } = await supabase
                .from('employees')
                .update({ active: statusBool })
                .in('id', selectedIds);

            if (error) throw error;

            setEmployees(prev => prev.map(e =>
                selectedIds.includes(e.id) ? { ...e, active: statusBool } : e
            ));

            setSelectedIds([]);
            setSelectedEmployee(null);
            setLastSelectedId(null);

        } catch (error: any) {
            alert('Erro na ação em massa: ' + error.message);
        }
    };

    const loadData = async () => {
        console.log('🔄 Iniciando carga de dados do RH (Modo Direto)...');
        try {
            // BYPASS: Conexão direta para ignorar falhas no api.ts


            // Fetch empresas primeiro para montar o mapa
            const { data: companiesData, error: companyError } = await supabase.from('companies').select('id, name');
            if (companyError && companyError.code !== 'PGRST116') {
                console.warn('⚠️ Erro ao carregar empresas:', companyError);
            }

            const companyMap: Record<string, string> = {};
            if (companiesData) {
                companiesData.forEach((c: any) => { companyMap[c.id] = c.name; });
                // Atualiza lista de filtro
                setCompanies(companiesData.map((c: any) => c.name));
                setAvailableCompanies(companiesData.map((c: any) => ({ id: c.id, name: c.name })));
            }

            // Fetch funcionários - Tentativa com Turnos
            let { data: emps, error } = await supabase
                .from('employees')
                .select('*, work_shift:work_shifts(name, work_days, start_time, end_time)')
                .order('full_name');

            // FALLBACK: Se falhar (ex: tabela work_shifts não existe), tenta carregar sem o join
            if (error) {
                console.warn("⚠️ Falha ao carregar turnos (Migration pendente?). Carregando dados básicos.", error);
                const res = await supabase
                    .from('employees')
                    .select('*')
                    .order('full_name');
                emps = res.data;
                error = res.error;
            }

            if (error) {
                console.error('❌ Erro Supabase Direto:', error);
                throw error;
            }

            console.log(`✅ ${emps?.length} Funcionários carregados.`);

            if (emps) {
                // Mapeamento de Schema (DB -> Frontend)
                const mappedEmployees: Employee[] = emps.map((e: any) => ({
                    id: e.id,
                    name: e.full_name || e.name || 'Sem Nome',
                    role: e.job_title || e.role || 'Colaborador',
                    registration_number: e.registration_number,
                    company_id: e.company_id,
                    company_name: companyMap[e.company_id] || 'N/A', // Nome da empresa mapeado
                    active: e.active !== false, // Padrão true se undefined
                    work_shift_id: e.work_shift_id,
                    work_shift: e.work_shift
                }));

                setEmployees(mappedEmployees);
            }

        } catch (error: any) {
            console.error('❌ Erro fatal ao carregar dados:', error);
            // alert('Erro ao carregar dados iniciais: ' + (error.message || error));
        }
    };

    React.useEffect(() => {
        let filtered = employees;

        // 1. Filtro de Texto
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(e =>
                e.name.toLowerCase().includes(lower) ||
                (e.registration_number && e.registration_number.includes(lower))
            );
        }

        // 2. Filtro de Status (Ativo/Inativo)
        if (activeFilter !== 'ALL') {
            filtered = filtered.filter(e => {
                const isActive = (e as any).active !== false;
                return activeFilter === 'ACTIVE' ? isActive : !isActive;
            });
        }

        // 3. Filtro de Empresa
        if (selectedCompany !== 'TODAS') {
            filtered = filtered.filter(e => e.company_name === selectedCompany);
        }

        setFilteredEmployees(filtered);
    }, [searchTerm, employees, activeFilter, selectedCompany]);

    // Função auxiliar para calcular diferença de horas
    const calculateTimeDiff = (start: string, end: string) => {
        if (!start || !end) return 0;
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diffMinutes < 0) diffMinutes += 1440; // Adiciona 24h (1440 min) se virou o dia
        return diffMinutes;
    };

    const formatMinutesToHHMM = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const getDailyExpected = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        const dayOfWeek = date.getDay(); // 0=Dom, 6=Sab
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[dayOfWeek];

        // Se o funcionário selecionado tiver turno, usa a regra do turno
        if (selectedEmployee) {
            const emp = employees.find(e => e.id === selectedEmployee);
            if (emp && emp.work_shift && emp.work_shift.work_days) {
                // Se o dia não estiver nos dias de trabalho do turno, expected = 0
                if (!emp.work_shift.work_days.includes(dayName)) {
                    return 0;
                }
                // Se estiver, calcula horas do turno (start - end - break)
                if (emp.work_shift.start_time && emp.work_shift.end_time) {
                    // Deduz 1h de almoço por padrão se não tiver break_start/end no objeto
                    const totalShift = calculateTimeDiff(emp.work_shift.start_time, emp.work_shift.end_time);
                    return totalShift - 60; // Tira 1h de almoço
                }
            }
        }

        // Fallback para quem não tem turno: Seg a Sex = 8h48
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        return isWeekend ? 0 : 528; // 08:48
    };


    // --- NOVO MOTOR DE CÁLCULO CLT (Tolerância, Noturno Reduzido, Extras 100%/50%) ---

    // --- HELPER: Lista de Feriados Nacionais (Mock 2024/2025) ---
    const holidays = [
        '2025-01-01', '2025-04-21', '2025-05-01', '2025-09-07', '2025-10-12', '2025-11-02', '2025-11-15', '2025-12-25',
        '2026-01-01', '2026-04-21' // Adicione mais conforme necessário
    ];

    const isHoliday = (dateStr: string) => holidays.includes(dateStr);

    // --- HELPER: Cálculo de Minutos com Adicional Noturno (22:00 - 05:00) ---
    // Retorna { totalMinutes, nightlyMinutes }
    // As horas noturnas já vem cruas aqui. A redução (fator 1.1428) é aplicada no saldo.
    const calculateIntervalStats = (start: string, end: string) => {
        if (!start || !end) return { total: 0, nightly: 0 };

        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);

        // Converter para minutos absolutos do dia (0..1440)
        let startMin = h1 * 60 + m1;
        let endMin = h2 * 60 + m2;

        // Tratamento de virada de dia
        if (endMin < startMin) endMin += 1440; // Ex: 22:00 (1320) as 05:00 (300+1440=1740)

        const total = endMin - startMin;

        // Janelas Noturnas:
        // 1. 22:00 (1320) até 24:00 (1440) do dia
        // 2. 00:00 (0) até 05:00 (300) do dia
        // 3. 24:00 (1440) até 29:00 (1740) - dia seguinte (00h-05h)

        let nightly = 0;

        // Verifica intersecção com janela noturna extendida (22h dia 1 até 05h dia 2) -> 1320 min a 1740 min
        // Também considerar start na madrugada (00h-05h do dia 1) -> 0 a 300

        // Simplificação: Iterar minuto a minuto (pode ser lento? Não para poucos registros. Seguro.)
        // Ou matemática de intervalos. Vamos de intervalos.

        // Intervalos de "Risco Noturno" relevantes para o período startMin..endMin
        const nightRanges = [
            { s: 0, e: 300 },       // 00:00 - 05:00
            { s: 1320, e: 1740 }    // 22:00 - 05:00 (dia seguinte)
            // Se o turno for > 24h (improvável), precisaria mais logica. Assumindo max 24h.
        ];

        for (const range of nightRanges) {
            // Intersecção: Max(Starts) até Min(Ends)
            const overlapStart = Math.max(startMin, range.s);
            const overlapEnd = Math.min(endMin, range.e);

            if (overlapEnd > overlapStart) {
                nightly += (overlapEnd - overlapStart);
            }
        }

        return { total, nightly };
    };

    interface DailyStats {
        totalWorked: number;       // Minutos relógio
        nightlyMinutes: number;    // Minutos feitos em horário noturno
        nightlyAdd: number;        // Minutos adicionais ganhos pela redução (nightly * 0.1428)
        finalWorked: number;       // totalWorked + nightlyAdd

        expected: number;
        balance: number;           // finalWorked - expected

        extra50: number;
        extra100: number;
        missing: number;

        isTolerance: boolean;
    }

    const calculateDailyStats = (record: TimeRecord): DailyStats => {
        // 1. Calcular tempos brutos e noturnos
        const p1 = calculateIntervalStats(record.entry1, record.exit1);
        const p2 = calculateIntervalStats(record.entry2, record.exit2);

        const totalWorked = p1.total + p2.total;
        const totalNightly = p1.nightly + p2.nightly;

        // 2. Aplicar Redução da Hora Noturna (52m30s = 1.142857...)
        // Fator extra é 0.142857 (aprox 14.28%)
        const reductionFactor = (60 / 52.5) - 1; // ~0.1428
        const nightlyAdd = Math.floor(totalNightly * reductionFactor);

        const finalWorked = totalWorked + nightlyAdd;

        // 3. Obter Expectativa (Considerando Turno)
        const expected = getDailyExpected(record.date);

        // 4. Saldo Bruto
        let balance = finalWorked - expected;
        const absBalance = Math.abs(balance);
        let isTolerance = false;

        // 5. Aplicar Tolerância CLT (10 min diários) - "Tudo ou Nada"
        if (absBalance <= 10) {
            balance = 0;
            isTolerance = true;
        }

        // 6. Classificar Extras e Faltas
        let extra50 = 0;
        let extra100 = 0;
        let missing = 0;

        if (balance < 0) {
            // Status de abono?
            const upperStatus = (record.status || '').toUpperCase();
            if (upperStatus.includes('FÉRIAS') || upperStatus.includes('ATESTADO')) {
                balance = 0;
            } else {
                missing = Math.abs(balance);
            }
        } else if (balance > 0) {
            // Verificar regra de 100% (Domingo ou Feriado E NÃO é dia de escala normal)
            const date = new Date(record.date + 'T12:00:00');
            const isSun = date.getDay() === 0;
            const isHol = isHoliday(record.date);

            // Se for feriado é 100%.
            // Se for domingo: Depende. Se o funcionário tem escala que inclui domingo, é 50% (dia normal).
            // MAS se ele trabalhou num domingo que NÃO estava na escala, é 100%.

            let isDayOffWork = false;
            if (selectedEmployee) {
                const emp = employees.find(e => e.id === selectedEmployee);
                const shiftDays = emp?.work_shift?.work_days; // ex: ['Monday', 'Tuesday'...]
                if (shiftDays) {
                    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
                    if (!shiftDays.includes(dayName)) {
                        isDayOffWork = true; // Trabalhou na folga
                    }
                } else {
                    // Sem turno definido: Domingo é folga padrão
                    if (isSun) isDayOffWork = true;
                }
            }

            if (isHol || (isSun && isDayOffWork)) {
                extra100 = balance;
            } else {
                extra50 = balance;
            }
        }

        return {
            totalWorked,
            nightlyMinutes: totalNightly,
            nightlyAdd,
            finalWorked,
            expected,
            balance,
            extra50,
            extra100,
            missing,
            isTolerance
        };
    };

    // Mantendo compatibilidade com código antigo UI chamando getDailyBalance
    // Retorna string formatada para exibir no card simples, mas a tabela usará stats completos
    const getDailyBalance = (record: TimeRecord) => {
        const stats = calculateDailyStats(record);
        return stats.balance;
    };

    const getDailyExtras = (balance: number) => {
        return balance > 0 ? balance : 0;
    };

    const getDailyMissing = (balance: number) => {
        return balance < 0 ? Math.abs(balance) : 0;
    };

    const formatBalanceString = (minutes: number) => {
        const absMin = Math.abs(minutes);
        const h = Math.floor(absMin / 60);
        const m = absMin % 60;
        const sign = minutes >= 0 ? '+' : '-';
        return `${sign} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const calculateBalance = () => {
        if (!timeRecords || timeRecords.length === 0) return "00:00";
        let total = 0;
        timeRecords.forEach(r => {
            const stats = calculateDailyStats(r);
            total += stats.balance;
        });
        return formatBalanceString(total);
    };


    // --- OCR Functions ---
    const handleOcrFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setOcrFiles(prev => [...prev, ...files]);

            // Iniciar processamento automático
            const newResults: OCRResult[] = files.map(f => ({
                file: f,
                preview: URL.createObjectURL(f),
                status: 'pending',
                logs: [],
                manualDate: new Date().toISOString().split('T')[0],
                manualEntry1: '',
                manualExit1: '',
                manualEntry2: '',
                manualExit2: ''
            }));

            setOcrResults(prev => [...prev, ...newResults]);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                let encoded = reader.result?.toString().replace(/^data:(.*,)?/, '') || '';
                if ((encoded.length % 4) > 0) {
                    encoded += '='.repeat(4 - (encoded.length % 4));
                }
                resolve(encoded);
            };
            reader.onerror = error => reject(error);
        });
    };

    const processImages = async () => {
        setIsProcessingOCR(true);
        const { getGeminiKey } = await import('../lib/getGeminiKey');
        const geminiKey = await getGeminiKey();
        const newResults = [...ocrResults];

        for (let i = 0; i < newResults.length; i++) {
            if (newResults[i].status === 'success') continue;

            newResults[i].status = 'processing';
            setOcrResults([...newResults]);

            try {
                if (geminiKey) {
                    // --- MODO TURBO (GEMINI AI) ---
                    const base64 = await fileToBase64(newResults[i].file);

                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [
                                    { text: "Extraia os dados deste cartão de ponto. Retorne APENAS um JSON válido (sem markdown) no formato: { \"funcionario\": \"Nome Completo\", \"registros\": [ { \"data\": \"YYYY-MM-DD\", \"entrada1\": \"HH:MM\", \"saida1\": \"HH:MM\", \"entrada2\": \"HH:MM\", \"saida2\": \"HH:MM\" } ] }. Se não achar alguma hora, mande null. Tente corrigir datas baseadas no cabeçalho se houver (ex: 1a Quinzena). O ano atual é 2024 ou 2025." },
                                    { inline_data: { mime_type: newResults[i].file.type, data: base64 } }
                                ]
                            }]
                        })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(`Gemini API Error: ${data.error?.message || response.statusText}`);
                    }

                    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

                    // Limpar Markdown do JSON (```json ... ```)
                    const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsedData = JSON.parse(jsonString);

                    newResults[i].extractedText = JSON.stringify(parsedData, null, 2);
                    newResults[i].status = 'success';

                    // Tentar Match de Funcionário Inteligente
                    if (parsedData.funcionario) {
                        const foundEmp = employees.find(e =>
                            e.name.toLowerCase().includes(parsedData.funcionario.toLowerCase()) ||
                            parsedData.funcionario.toLowerCase().includes(e.name.toLowerCase())
                        );
                        if (foundEmp) {
                            newResults[i].matchedEmployeeId = foundEmp.id;
                            newResults[i].matchedEmployeeName = foundEmp.name;
                        }
                    }

                    // Pega o primeiro registro encontrado para preencher o form manual
                    if (parsedData.registros && parsedData.registros.length > 0) {
                        const rec = parsedData.registros[0];
                        newResults[i].manualDate = rec.data || new Date().toISOString().split('T')[0];
                        newResults[i].manualEntry1 = rec.entrada1 || '';
                        newResults[i].manualExit1 = rec.saida1 || '';
                        newResults[i].manualEntry2 = rec.entrada2 || '';
                        newResults[i].manualExit2 = rec.saida2 || '';

                        // POPULAR TODOS OS REGISTROS PARA A TABELA
                        newResults[i].parsedRecords = parsedData.registros.map((r: any) => ({
                            data: r.data,
                            entrada1: r.entrada1 || '',
                            saida1: r.saida1 || '',
                            entrada2: r.entrada2 || '',
                            saida2: r.saida2 || '',
                            selected: true
                        }));

                        // Guardar todos os detected times para referencia
                        newResults[i].detectedTimes = parsedData.registros.map((r: any) => `${r.data}: ${r.entrada1}-${r.saida1}`).filter((x: string) => x.length > 5);
                    }

                } else {
                    // --- MODO CLÁSSICO (TESSERACT) ---
                    const result = await Tesseract.recognize(newResults[i].file, 'por');
                    const text = result.data.text;
                    newResults[i].extractedText = text;
                    newResults[i].status = 'success';

                    // Extrair Horários (Regex HH:MM)
                    const timeRegex = /(0[0-9]|1[0-9]|2[0-3]|[0-9]):\s?([0-5][0-9])/g;
                    const foundTimes = text.match(timeRegex);
                    newResults[i].detectedTimes = foundTimes ? [...new Set(foundTimes)].sort() : [];

                    const foundEmp = employees.find(e =>
                        text.toLowerCase().includes(e.name.toLowerCase()) ||
                        (e.name.split(' ').length > 1 && text.toLowerCase().includes(e.name.split(' ')[0].toLowerCase() + ' ' + e.name.split(' ')[1].toLowerCase()))
                    );

                    if (foundEmp) {
                        newResults[i].matchedEmployeeId = foundEmp.id;
                        newResults[i].matchedEmployeeName = foundEmp.name;
                    }
                }

            } catch (err) {
                console.error(err);
                newResults[i].status = 'error';
                const msg = err instanceof Error ? err.message : String(err);
                newResults[i].logs.push(msg);
            }

            setOcrResults([...newResults]);
        }
        setIsProcessingOCR(false);
    };

    const saveOcrResults = async () => {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);

        let savedCount = 0;
        const newResults = [...ocrResults];

        // Process loop backward to allow splicing
        for (let i = newResults.length - 1; i >= 0; i--) {
            const res = newResults[i];

            if (res.status !== 'success' || !res.matchedEmployeeId) continue;

            // MODO NOVO: Salvar múltiplos registros da IA
            if (res.parsedRecords && res.parsedRecords.length > 0) {
                const recordsToSave = res.parsedRecords.filter(r => r.selected !== false); // Default true

                const matchedEmp = employees.find(e => e.id === res.matchedEmployeeId);
                for (const record of recordsToSave) {
                    const { error } = await supabase.from('time_entries').upsert({
                        employee_id: res.matchedEmployeeId,
                        company_id: matchedEmp?.company_id || null,
                        date: record.data,
                        entry_time: record.entrada1 || null,
                        break_start: record.saida1 || null,
                        break_end: record.entrada2 || null,
                        exit_time: record.saida2 || null,
                        status: 'REGULAR'
                    }, { onConflict: 'employee_id,date' as any });

                    if (!error) savedCount++;
                    else console.error("Erro ao salvar registro", record, error);
                }
                // Remove da lista se processou
                newResults.splice(i, 1);

            } else {
                // MODO ANTIGO (Fallback / Manual Único)
                if (!res.manualDate) continue;

                const manualEmp = employees.find(e => e.id === res.matchedEmployeeId);
                const { error } = await supabase.from('time_entries').upsert({
                    employee_id: res.matchedEmployeeId,
                    company_id: manualEmp?.company_id || null,
                    date: res.manualDate,
                    entry_time: res.manualEntry1 || null,
                    break_start: res.manualExit1 || null,
                    break_end: res.manualEntry2 || null,
                    exit_time: res.manualExit2 || null,
                    status: 'REGULAR'
                }, { onConflict: 'employee_id,date' as any });

                if (!error) {
                    savedCount++;
                    newResults.splice(i, 1);
                } else {
                    console.error("Erro ao salvar manual", error);
                }
            }
        }

        setOcrResults(newResults);
        if (savedCount > 0) {
            fetchTimeRecords(); // Atualiza fundo
            if (newResults.length === 0) setShowUploadModal(false); // Fecha se acabou
        } else {
            if (ocrResults.some(r => !r.matchedEmployeeId)) {
                alert("Selecione o funcionário para salvar.");
            }
        }
    };

    const removeOcrFile = (idx: number) => {
        const newFiles = [...ocrFiles];
        newFiles.splice(idx, 1);
        setOcrFiles(newFiles);

        const newResults = [...ocrResults];
        newResults.splice(idx, 1);
        setOcrResults(newResults);
    };

    const updateRecordField = (index: number, field: keyof TimeRecord, value: string) => {
        const newRecords = [...timeRecords];
        newRecords[index] = { ...newRecords[index], [field]: value };
        setTimeRecords(newRecords);
    };

    const handleInlineSave = async (index: number) => {
        const record = { ...timeRecords[index] };

        // Recalcular Total de Horas
        const t1 = calculateTimeDiff(record.entry1, record.exit1);
        const t2 = calculateTimeDiff(record.entry2, record.exit2);
        const totalMinutes = t1 + t2;
        record.totalHours = formatMinutesToHHMM(totalMinutes);

        // Atualiza estado visualmente
        const newRecords = [...timeRecords];
        newRecords[index] = record;
        setTimeRecords(newRecords);

        // Salvar no Backend
        await saveRecordToSupabase(record);
    };

    const saveRecordToSupabase = async (record: TimeRecord) => {
        // Remove temp ID se for inserção
        const payload = { ...record };
        if (String(payload.id).startsWith('temp-')) {
            delete payload.id;
        }

        // Buscar company_id do funcionário selecionado
        const emp = employees.find(e => e.id === selectedEmployee);

        const { data, error } = await supabase
            .from('time_entries')
            .upsert({
                employee_id: selectedEmployee,
                company_id: emp?.company_id || null,
                date: payload.date,
                entry_time: payload.entry1 || null,
                break_start: payload.exit1 || null,
                break_end: payload.entry2 || null,
                exit_time: payload.exit2 || null,
                status: 'MANUAL_EDIT'
            }, { onConflict: 'employee_id,date' as any })
            .select()
            .single();

        if (error) {
            console.error('Erro ao salvar inline:', error);
        }
        return { data, error };
    };

    const handleSaveAll = async () => {
        if (!selectedEmployee || timeRecords.length === 0) return;

        const recordsToSave = timeRecords.filter(r =>
            r.entry1 || r.exit1 || r.entry2 || r.exit2
        );

        if (recordsToSave.length === 0) {
            alert('Nenhum registro com dados para salvar.');
            return;
        }

        let saved = 0;
        let errors = 0;

        for (const record of recordsToSave) {
            const { error } = await saveRecordToSupabase(record);
            if (error) errors++;
            else saved++;
        }

        if (errors > 0) {
            alert(`${saved} registros salvos, ${errors} com erro.`);
        } else {
            alert(`${saved} registros salvos com sucesso!`);
        }

        // Recarrega do banco
        fetchTimeRecords();
    };

    const fetchTimeRecords = async () => {
        if (!selectedEmployee) return;

        setIsLoading(true);
        console.log(`🔄 Buscando pontos para ${selectedEmployee} entre ${startDate} e ${endDate}...`);

        try {


            const { data, error } = await supabase
                .from('time_entries') // Nome correto da tabela no DB
                .select('*')
                .eq('employee_id', selectedEmployee)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date');

            if (error) throw error;

            console.log('✅ Pontos recebidos:', data?.length);

            if (data) {
                const mappedRecords: TimeRecord[] = data.map((r: any) => {
                    // Mapeia colunas do banco para variáveis locais
                    const e1 = r.entry_time || r.entry1 || '';
                    const s1 = r.break_start || r.exit1 || '';
                    const e2 = r.break_end || r.entry2 || '';
                    const s2 = r.exit_time || r.exit2 || '';

                    // Calcula total de minutos usando as variáveis locais já tratadas
                    const totalMinutes = calculateTimeDiff(e1, s1) + calculateTimeDiff(e2, s2);

                    return {
                        id: r.id,
                        date: r.date,
                        entry1: e1 ? e1.slice(0, 5) : '',
                        exit1: s1 ? s1.slice(0, 5) : '',
                        entry2: e2 ? e2.slice(0, 5) : '',
                        exit2: s2 ? s2.slice(0, 5) : '',
                        totalHours: formatMinutesToHHMM(totalMinutes),
                        status: r.status || 'REGULAR'
                    };
                });

                // Generate full date range and merge with existing records
                const fullDateRange: TimeRecord[] = [];
                const start = new Date(startDate + 'T12:00:00');
                const end = new Date(endDate + 'T12:00:00');

                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    const existingRecord = mappedRecords.find((r: TimeRecord) => r.date === dateStr);

                    if (existingRecord) {
                        fullDateRange.push(existingRecord);
                    } else {
                        // Create placeholder for missing date
                        fullDateRange.push({
                            id: `temp-${dateStr}-${selectedEmployee}`, // Temporary ID
                            date: dateStr,
                            entry1: '',
                            exit1: '',
                            entry2: '',
                            exit2: '',
                            totalHours: '00:00',
                            status: 'MISSING' // New status for missing records
                        });
                    }
                }

                setTimeRecords(fullDateRange);
            } else {
                // Even without data, show empty slots
                const fullDateRange: TimeRecord[] = [];
                const start = new Date(startDate + 'T12:00:00');
                const end = new Date(endDate + 'T12:00:00');

                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    fullDateRange.push({
                        id: `temp-${dateStr}-${selectedEmployee}`,
                        date: dateStr,
                        entry1: '',
                        exit1: '',
                        entry2: '',
                        exit2: '',
                        totalHours: '00:00',
                        status: 'MISSING'
                    });
                }
                setTimeRecords(fullDateRange);
            }
        } catch (err: any) {
            console.error('Erro ao buscar pontos:', err);
            alert(`Erro ao buscar dados: ${err.message || err}`);
            setTimeRecords([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Atualiza ao mudar funcionário
    React.useEffect(() => {
        if (selectedEmployee) {
            fetchTimeRecords();
        }
    }, [selectedEmployee]);

    // Carrega dados iniciais da lista de funcionários
    React.useEffect(() => {
        loadData();
    }, []);

    // Botão de atualizar data chama fetchTimeRecords manualmente
    const handleDateRefresh = () => {
        console.log('Botão Atualizar Clicado');
        if (!selectedEmployee) {
            alert('Por favor, selecione um colaborador na lista à esquerda.');
            return;
        }
        fetchTimeRecords();
    };

    const openEditTimeModal = (record: TimeRecord) => {
        setEditingRecord({ ...record });
        setIsTimeModalOpen(true);
    };

    const handleSaveTimeRecord = async () => {
        if (!editingRecord || !selectedEmployee) return;

        const updated: any = {
            ...editingRecord,
            status: editingRecord.status === 'MISSING' ? 'MANUAL_EDIT' : 'MANUAL_EDIT', // Force status change
            employee_id: selectedEmployee // Ensure employee_id is set
        };

        // Remove temporary ID to ensure insertion/upsert
        if (updated.id && String(updated.id).startsWith('temp-')) {
            delete updated.id;
        }

        try {
            // Direct Supabase upsert to handle both insert (new) and update (existing)


            // Buscar company_id do funcionário selecionado
            const emp = employees.find(e => e.id === selectedEmployee);

            const { data, error } = await supabase
                .from('time_entries')
                .upsert({
                    employee_id: selectedEmployee,
                    company_id: emp?.company_id || null,
                    date: updated.date,
                    entry_time: updated.entry1 || null,
                    break_start: updated.exit1 || null,
                    break_end: updated.entry2 || null,
                    exit_time: updated.exit2 || null,
                    status: 'MANUAL_EDIT'
                }, { onConflict: 'employee_id,date' as any })
                .select()
                .single();

            if (error) throw error;

            // Update local state with the returned record (which now has a real ID)
            // DB usa entry_time/break_start/break_end/exit_time
            const newRecord: TimeRecord = {
                id: data.id,
                date: data.date,
                entry1: (data.entry_time || '').slice(0, 5),
                exit1: (data.break_start || '').slice(0, 5),
                entry2: (data.break_end || '').slice(0, 5),
                exit2: (data.exit_time || '').slice(0, 5),
                totalHours: formatMinutesToHHMM(
                    calculateTimeDiff(data.entry_time || '', data.break_start || '') +
                    calculateTimeDiff(data.break_end || '', data.exit_time || '')
                ),
                status: data.status
            };

            setTimeRecords(prev => prev.map(r => r.date === newRecord.date ? newRecord : r));
            setIsTimeModalOpen(false);
            setEditingRecord(null);

        } catch (err: any) {
            console.error('Erro ao salvar ponto:', err);
            alert('Erro ao salvar registro: ' + (err.message || err));
        }
    };

    const toggleEmployeeStatus = async (empId: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        const action = currentStatus ? 'desligar (inativar)' : 'reativar';
        if (!window.confirm(`Deseja realmente ${action} este colaborador?`)) return;

        try {


            const { error } = await supabase
                .from('employees')
                .update({ active: !currentStatus })
                .eq('id', empId);

            if (error) throw error;

            // Atualiza estado local para refletir a mudança instantaneamente e remover da lista atual se estiver filtrada
            setEmployees(prev => prev.map(emp =>
                emp.id === empId ? { ...emp, active: !currentStatus } : emp
            ));

            // Se o funcionário selecionado for o que foi alterado, limpa a seleção
            if (selectedEmployee === empId) {
                setSelectedEmployee(null);
            }

        } catch (error: any) {
            alert('Erro ao atualizar status: ' + (error.message || error));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'REGULAR': return 'text-emerald-500 bg-emerald-500/10';
            case 'ABSENT': return 'text-red-500 bg-red-500/10';
            case 'MANUAL_EDIT': return 'text-blue-500 bg-blue-500/10';
            case 'OVERTIME': return 'text-amber-500 bg-amber-500/10';
            case 'MISSING': return 'text-slate-500 opacity-50 border border-slate-700 border-dashed';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    // ─── RECALCULAR PONTOS DO PERÍODO SELECIONADO ───────────
    const [isRecalculating, setIsRecalculating] = useState(false);

    const handleRecalcAll = async () => {
        // Recalcula APENAS os registros visíveis na tela (período startDate→endDate)
        if (timeRecords.length === 0) return;
        if (!confirm(`Recalcular ${timeRecords.length} registros do período ${startDate} a ${endDate}?`)) return;
        setIsRecalculating(true);

        try {
            const updated = timeRecords.map(record => {
                const t1 = calculateTimeDiff(record.entry1, record.exit1);
                const t2 = calculateTimeDiff(record.entry2, record.exit2);
                const totalMinutes = t1 + t2;
                return { ...record, totalHours: formatMinutesToHHMM(totalMinutes) };
            });

            // Salvar em batch (apenas o período carregado na tela)
            let savedCount = 0;
            for (const rec of updated) {
                if (!selectedEmployee) continue;
                const { error } = await supabase
                    .from('time_entries')
                    .upsert({
                        employee_id: selectedEmployee,
                        date: rec.date,
                        entry1: rec.entry1 || null,
                        exit1: rec.exit1 || null,
                        entry2: rec.entry2 || null,
                        exit2: rec.exit2 || null,
                        total_hours: rec.totalHours,
                        status: 'RECALCULADO'
                    }, { onConflict: 'employee_id,date' as any });
                if (!error) savedCount++;
            }

            setTimeRecords(updated);
            alert(`${savedCount} registros recalculados e salvos!`);
        } catch (err) {
            console.error('Erro ao recalcular:', err);
            alert('Erro ao recalcular pontos.');
        } finally {
            setIsRecalculating(false);
        }
    };

    const handleExportPDF = () => {
        const emp = employees.find(e => e.id === selectedEmployee);
        if (!emp) return;

        const doc = new jsPDF();
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('TerraPro ERP', 14, 20);
        doc.setFontSize(12);
        doc.text('Relatório de Ponto Eletrônico', 14, 30);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Colaborador: ${emp.name} (Matrícula: ${emp.registration_number})`, 14, 50);
        doc.text(`Cargo: ${emp.role}`, 14, 55);
        doc.text(`Período de Referência: ${startDate ? startDate.split('-').reverse().join('/') : ''} a ${endDate ? endDate.split('-').reverse().join('/') : ''}`, 14, 60);
        doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 150, 50);

        const tableColumn = ["Data", "E1", "S1", "E2", "S2", "Carga", "Trab", "Fal", "E50", "E100", "AdN", "Saldo"];
        const tableRows = timeRecords.map(record => {
            const stats = calculateDailyStats(record);
            return [
                record.date.split('-').reverse().slice(0, 2).join('/'), // DD/MM
                record.entry1,
                record.exit1,
                record.entry2,
                record.exit2,
                formatMinutesToHHMM(stats.expected),
                record.totalHours,
                stats.missing > 0 ? formatBalanceString(stats.missing).replace('+', '-') : '',
                stats.extra50 > 0 ? formatBalanceString(stats.extra50) : '',
                stats.extra100 > 0 ? formatBalanceString(stats.extra100) : '',
                stats.nightlyAdd > 0 ? `+${Math.floor(stats.nightlyAdd)}m` : '',
                formatBalanceString(stats.balance)
            ];
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 8 },
            styles: { fontSize: 7, cellPadding: 2, halign: 'center' },
            alternateRowStyles: { fillColor: [241, 245, 249] },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 12 },
                11: { fontStyle: 'bold', cellWidth: 14 }
            }
        });
        const finalY = (doc as any).lastAutoTable.finalY + 40;
        if (finalY < 250) {
            doc.setDrawColor(0, 0, 0);
            doc.line(14, finalY, 90, finalY);
            doc.text(emp.name, 14, finalY + 5);
            doc.setFontSize(8);
            doc.text('Assinatura do Colaborador', 14, finalY + 10);
            doc.line(110, finalY, 196, finalY);
            doc.setFontSize(10);
            doc.text('Gestor Responsável', 110, finalY + 5);
            doc.setFontSize(8);
            doc.text('TerraPro Gestão de Ativos', 110, finalY + 10);
        }
        doc.save(`espelho_ponto_${emp.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    };

    const groupedDocs = documents.reduce((acc, doc) => {
        const key = doc.relatedTo || 'Outros / Geral';
        if (!acc[key]) acc[key] = [];
        acc[key].push(doc);
        return acc;
    }, {} as Record<string, ERPDocument[]>);

    const selectedEmpObj = employees.find(e => e.id === selectedEmployee);

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <User size={32} className="text-slate-500" />
                        Recursos Humanos (RH)
                    </h2>
                    <p className="text-slate-500 mt-1 ml-11">Gestão de Ponto, Folha de Pagamento e Documentos.</p>
                </div>
            </div>

            <div className="bg-slate-900 p-1 rounded-xl inline-flex border border-slate-800">
                <button onClick={() => setActiveTab('TIMEKEEPING')} className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'TIMEKEEPING' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}>
                    <Clock size={16} /> Controle de Ponto
                </button>
                <button onClick={() => setActiveTab('PAYROLL')} className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'PAYROLL' ? 'bg-emerald-600 text-white shadow-lg comments-shadow-emerald-600/20' : 'text-slate-400 hover:text-white'}`}>
                    <DollarSign size={16} /> Folha & Vales
                </button>
                <button onClick={() => setActiveTab('DOCUMENTS')} className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'DOCUMENTS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}>
                    <Folder size={16} /> Documentos
                </button>
            </div>

            {activeTab === 'TIMEKEEPING' && (
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-slate-800 space-y-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-3 text-slate-500" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar Colaborador..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mb-2">
                                <button
                                    onClick={() => setActiveFilter('ACTIVE')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${activeFilter === 'ACTIVE' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${activeFilter === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                                    Ativos ({employees.filter(e => e.active !== false).length})
                                </button>
                                <button
                                    onClick={() => setActiveFilter('INACTIVE')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${activeFilter === 'INACTIVE' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${activeFilter === 'INACTIVE' ? 'bg-red-500' : 'bg-slate-600'}`}></span>
                                    Desligados ({employees.filter(e => e.active === false).length})
                                </button>
                            </div>

                            <div className="flex gap-2">
                                {/* Removido o Select de Status antigo, mantendo apenas o de Empresa se necessário */}

                                <select
                                    value={selectedCompany}
                                    onChange={(e) => setSelectedCompany(e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-400 focus:border-blue-500 outline-none"
                                >
                                    <option value="TODAS">🏢 Todas Emp.</option>
                                    {companies.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={() => { setEditingEmpId(null); setIsEmployeeFormOpen(true); }}
                                className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all mb-2 group"
                            >
                                <div className="p-1 bg-emerald-500 rounded text-white group-hover:scale-110 transition-transform">
                                    <Plus size={12} />
                                </div>
                                Novo Colaborador
                            </button>

                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all group"
                            >
                                <div className="p-1 bg-indigo-500 rounded text-white group-hover:scale-110 transition-transform">
                                    <Camera size={12} />
                                </div>
                                Importação Inteligente (OCR)
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                            {filteredEmployees.map(emp => (
                                <div
                                    key={emp.id}
                                    onClick={(e) => handleEmployeeClick(emp.id, e)}
                                    className={`p-4 rounded-xl cursor-pointer border transition-all relative group/item ${selectedIds.includes(emp.id) ? 'bg-blue-600/20 border-blue-600' : 'bg-slate-950/50 border-transparent hover:bg-slate-800'}`}
                                >
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingEmpId(emp.id); setIsEmployeeFormOpen(true); }}
                                        className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white opacity-0 group-hover/item:opacity-100 transition-opacity z-10 hover:bg-blue-600"
                                        title="Editar Cadastro"
                                    >
                                        <Edit2 size={12} />
                                    </button>

                                    <button
                                        onClick={(e) => toggleEmployeeStatus(emp.id, emp.active !== false, e)}
                                        className={`absolute right-9 top-2 p-1.5 rounded-lg text-white opacity-0 group-hover/item:opacity-100 transition-opacity z-10 ${emp.active !== false ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}
                                        title={emp.active !== false ? "Desligar Colaborador" : "Reativar Colaborador"}
                                    >
                                        {emp.active !== false ? <Minus size={12} /> : <CheckCircle size={12} />}
                                    </button>

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`font-bold text-sm ${selectedIds.includes(emp.id) ? 'text-blue-400' : 'text-white'}`}>{emp.name}</h4>
                                            <p className="text-xs text-slate-500">{emp.role || 'Funcionário'} • Matr: {emp.registration_number}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px]">
                        {selectedIds.length > 1 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                <div className="p-4 bg-slate-800 rounded-full text-blue-500">
                                    <User size={48} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{selectedIds.length} Colaboradores Selecionados</h3>
                                    <p className="text-slate-500">Selecione uma ação em massa abaixo</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleMassAction('DEACTIVATE')}
                                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-bold flex items-center gap-2 transition-all"
                                    >
                                        <Minus size={20} /> Desligar Selecionados
                                    </button>
                                    <button
                                        onClick={() => handleMassAction('REACTIVATE')}
                                        className="px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl font-bold flex items-center gap-2 transition-all"
                                    >
                                        <CheckCircle size={20} /> Reativar Selecionados
                                    </button>
                                </div>
                            </div>
                        ) : selectedEmpObj ? (
                            <>
                                {/* HEADER TIPO SECULLUM */}
                                <div className="p-4 border-b border-slate-800 bg-slate-950/30 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/50">
                                                {selectedEmpObj.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white leading-tight">{selectedEmpObj.name}</h3>
                                                <p className="text-xs text-slate-400 font-mono">MAT: {selectedEmpObj.registration_number} • {selectedEmpObj.role.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            {(() => {
                                                const totalExtras = timeRecords.reduce((acc, r) => acc + getDailyExtras(getDailyBalance(r)), 0);
                                                const totalMissing = timeRecords.reduce((acc, r) => acc + getDailyMissing(getDailyBalance(r)), 0);
                                                return (
                                                    <>
                                                        <div className="text-right bg-slate-950 px-3 py-1 rounded border border-slate-800">
                                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Extras</div>
                                                            <div className="text-lg font-mono font-bold text-emerald-400 drop-shadow-sm">
                                                                {formatBalanceString(totalExtras)}
                                                            </div>
                                                        </div>
                                                        <div className="text-right bg-slate-950 px-3 py-1 rounded border border-slate-800">
                                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Faltas</div>
                                                            <div className="text-lg font-mono font-bold text-red-400 drop-shadow-sm">
                                                                {formatBalanceString(totalMissing).replace('+', '-')}
                                                            </div>
                                                        </div>
                                                        <div className="text-right bg-slate-950 px-3 py-1 rounded border border-slate-800">
                                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Saldo Final</div>
                                                            <div className={`text-lg font-mono font-bold drop-shadow-sm ${totalExtras >= totalMissing ? 'text-blue-400' : 'text-amber-400'}`}>
                                                                {calculateBalance()}
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* BARRA DE FERRAMENTAS / FILTROS */}
                                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex items-center gap-4">
                                        <div className="flex bg-slate-900 rounded p-1 border border-slate-800 items-center">
                                            <Calendar size={14} className="text-slate-500 ml-2 mr-2" />
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={e => setStartDate(e.target.value)}
                                                className="bg-transparent text-xs text-white outline-none border-none w-28 font-mono"
                                            />
                                            <span className="text-slate-600 mx-2 text-xs">até</span>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={e => setEndDate(e.target.value)}
                                                className="bg-transparent text-xs text-white outline-none border-none w-28 font-mono"
                                            />
                                            <button
                                                onClick={handleDateRefresh}
                                                disabled={isLoading}
                                                className={`ml-2 p-1.5 rounded-md transition-colors ${isLoading ? 'bg-blue-800 cursor-wait' : 'bg-blue-600 hover:bg-blue-500'} text-white`}
                                                title="Atualizar Período"
                                            >
                                                {isLoading ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : (
                                                    <Search size={12} />
                                                )}
                                            </button>
                                        </div>

                                        <div className="h-4 w-px bg-slate-800"></div>

                                        <button onClick={handleRecalcAll} disabled={isRecalculating || timeRecords.length === 0}
                                            title={`Recalcula as horas de ${timeRecords.length} registros do período selecionado`}
                                            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-amber-900/20 disabled:opacity-30 disabled:cursor-not-allowed">
                                            {isRecalculating ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />} Recalcular Período
                                        </button>

                                        <div className="h-4 w-px bg-slate-800"></div>

                                        <button onClick={handleExportPDF} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-800">
                                            <Download size={14} /> PDF
                                        </button>
                                        <button onClick={handleSaveAll} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors ml-auto px-2 py-1 rounded hover:bg-blue-900/20">
                                            <Save size={14} /> Salvar Tudo
                                        </button>
                                    </div>
                                </div>

                                {/* TABELA TÉCNICA */}
                                <div className="flex-1 overflow-y-auto bg-slate-900 p-0">
                                    {timeRecords.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                            <Clock size={40} className="mb-4 opacity-50" />
                                            <p className="font-bold">Nenhum registro no período.</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-950 sticky top-0 z-10 shadow-sm border-b border-slate-800">
                                                <tr>
                                                    <th className="px-3 py-2 text-[9px] uppercase font-bold text-slate-500 w-24">Data</th>
                                                    <th className="px-1 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50">Ent. 1</th>
                                                    <th className="px-1 py-2 text-[9px] uppercase font-bold text-slate-500 text-center">Sai. 1</th>
                                                    <th className="px-1 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50">Ent. 2</th>
                                                    <th className="px-1 py-2 text-[9px] uppercase font-bold text-slate-500 text-center">Sai. 2</th>

                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50">Carga</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50 bg-slate-950/50">Hs Trab.</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50">Faltas</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-emerald-600 text-center border-l border-slate-800/50" title="Extra 50%">Ext 50%</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-emerald-500 text-center border-l border-slate-800/50" title="Extra 100%">Ext 100%</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-indigo-400 text-center border-l border-slate-800/50" title="Adicional Noturno (Redução)">Ad. Not.</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50">Saldo</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50">Status</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-slate-500 text-center w-10">...</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-xs font-mono">
                                                {timeRecords.map((record, idx) => {
                                                    const dayOfWeek = new Date(record.date + 'T12:00:00').getDay();
                                                    const isSat = dayOfWeek === 6;
                                                    const isSun = dayOfWeek === 0;
                                                    const rowClass = isSun ? 'bg-red-900/10 text-red-200' : isSat ? 'bg-slate-800/30 text-slate-300' : 'text-slate-400 hover:bg-slate-800/50';

                                                    const stats = calculateDailyStats(record);

                                                    return (
                                                        <tr key={idx} className={`${rowClass} border-b border-slate-800/30 group transition-colors`}>
                                                            <td className={`px-3 py-1.5 whitespace-nowrap ${isSun ? 'font-bold' : ''}`}>
                                                                {record.date.split('-').reverse().join('/')}
                                                                <span className="opacity-50 ml-1 text-[10px]">
                                                                    {isSun ? 'DOM' : isSat ? 'SÁB' : ''}
                                                                </span>
                                                            </td>

                                                            <td className="px-1 py-0.5 text-center border-l border-slate-800/50">
                                                                <TimeInput
                                                                    value={record.entry1}
                                                                    onChange={(v) => updateRecordField(idx, 'entry1', v)}
                                                                    onBlurSave={() => handleInlineSave(idx)}
                                                                    placeholder="--:--"
                                                                    dark
                                                                />
                                                            </td>
                                                            <td className="px-1 py-0.5 text-center">
                                                                <TimeInput
                                                                    value={record.exit1}
                                                                    onChange={(v) => updateRecordField(idx, 'exit1', v)}
                                                                    onBlurSave={() => handleInlineSave(idx)}
                                                                    placeholder="--:--"
                                                                    dark
                                                                />
                                                            </td>
                                                            <td className="px-1 py-0.5 text-center border-l border-slate-800/50">
                                                                <TimeInput
                                                                    value={record.entry2}
                                                                    onChange={(v) => updateRecordField(idx, 'entry2', v)}
                                                                    onBlurSave={() => handleInlineSave(idx)}
                                                                    placeholder="--:--"
                                                                    dark
                                                                />
                                                            </td>
                                                            <td className="px-1 py-0.5 text-center">
                                                                <TimeInput
                                                                    value={record.exit2}
                                                                    onChange={(v) => updateRecordField(idx, 'exit2', v)}
                                                                    onBlurSave={() => handleInlineSave(idx)}
                                                                    placeholder="--:--"
                                                                    dark
                                                                />
                                                            </td>

                                                            <td className="px-2 py-0.5 text-center opacity-50 border-l border-slate-800/50">{formatMinutesToHHMM(stats.expected)}</td>
                                                            <td className={`px-2 py-0.5 text-center font-bold border-l border-slate-800/50 ${record.totalHours === '00:00' ? 'opacity-30' : 'text-white'}`}>{record.totalHours}</td>
                                                            <td className="px-2 py-0.5 text-center border-l border-slate-800/50 text-red-400 font-bold">{stats.missing > 0 ? formatBalanceString(stats.missing).replace('+', '-') : ''}</td>

                                                            <td className="px-2 py-0.5 text-center border-l border-slate-800/50 text-emerald-600 font-bold">{stats.extra50 > 0 ? formatBalanceString(stats.extra50) : ''}</td>
                                                            <td className="px-2 py-0.5 text-center border-l border-slate-800/50 text-emerald-400 font-bold">{stats.extra100 > 0 ? formatBalanceString(stats.extra100) : ''}</td>
                                                            <td className="px-2 py-0.5 text-center border-l border-slate-800/50 text-indigo-400 font-bold" title={`${stats.nightlyMinutes} min noturnos`}>
                                                                {stats.nightlyAdd > 0 ? `+${formatBalanceString(stats.nightlyAdd).replace('+', '').replace(' 00:', '')}m` : ''}
                                                            </td>
                                                            <td className={`px-2 py-0.5 text-center border-l border-slate-800/50 font-bold ${stats.balance >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>{formatBalanceString(stats.balance)}</td>

                                                            <td className="px-2 py-0.5 text-center border-l border-slate-800/50">
                                                                {record.status !== 'REGULAR' && (
                                                                    <span className={`text-[9px] uppercase px-1 rounded ${getStatusColor(record.status)}`}>
                                                                        {record.status}
                                                                    </span>
                                                                )}
                                                            </td>

                                                            <td className="px-1 py-0.5 text-center">
                                                                <button onClick={() => openEditTimeModal(record)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-blue-400 transition-all">
                                                                    <Edit2 size={12} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                                <User size={48} className="mb-4 opacity-50" />
                                <p className="font-bold">Selecione um colaborador na lista</p>
                            </div>
                        )}
                    </div>
                </div>
            )
            }

            {
                activeTab === 'PAYROLL' && (
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                                <h3 className="font-black text-white flex items-center gap-2">
                                    <FileText size={20} className="text-emerald-500" />
                                    Gestão da Folha de Pagamento
                                </h3>
                                <div className="flex gap-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase self-center mr-4">Competência: Janeiro/2026</span>
                                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700">
                                        <Download size={14} /> Exportar Folha
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-950 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                        <tr>
                                            <th className="px-8 py-4">Colaborador</th>
                                            <th className="px-8 py-4 text-right">Salário Base</th>
                                            <th className="px-8 py-4 text-right text-emerald-500">Extras / DSR</th>
                                            <th className="px-8 py-4 text-right text-amber-500">Adiantamentos (Vales)</th>
                                            <th className="px-8 py-4 text-right text-rose-500">Descontos (INSS/IR)</th>
                                            <th className="px-8 py-4 text-right text-white">Líquido a Receber</th>
                                            <th className="px-8 py-4 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {payrollData.map(p => {
                                            const netSalary = p.baseSalary + p.overtimeValue - p.advances - p.discounts;
                                            return (
                                                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <p className="font-bold text-white">{p.employeeName}</p>
                                                        <p className="text-xs text-slate-500">{p.role}</p>
                                                    </td>
                                                    <td className="px-8 py-5 text-right text-slate-300 font-mono">R$ {p.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-8 py-5 text-right text-emerald-400 font-mono">+ R$ {p.overtimeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-8 py-5 text-right text-amber-400 font-mono font-bold">- R$ {p.advances.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-8 py-5 text-right text-rose-400 font-mono">- R$ {p.discounts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-8 py-5 text-right font-black text-lg text-white font-mono border-l border-slate-800 bg-slate-950/30">
                                                        R$ {netSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={() => setIsValeModalOpen(true)} className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/50 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1">
                                                                <Minus size={10} /> Vale
                                                            </button>
                                                            <button className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-600/50 rounded-lg text-[10px] font-bold uppercase transition-all">
                                                                Holerite
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'DOCUMENTS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(groupedDocs).map(([groupName, docs]) => (
                            <div key={groupName} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:border-indigo-500/30 transition-all">
                                <div className="p-5 border-b border-slate-800 bg-slate-950/20 flex items-center justify-between">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Folder className="text-indigo-500" size={18} />
                                        {groupName}
                                    </h3>
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg">
                                        {docs.length} Docs
                                    </span>
                                </div>
                                <div className="p-2">
                                    {docs.map(doc => (
                                        <div key={doc.id} className="p-3 hover:bg-slate-800 rounded-xl flex items-center justify-between group transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
                                                    <FileText size={14} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{doc.title}</p>
                                                    <p className="text-[10px] text-slate-500">{doc.uploadDate} • {doc.fileSize}</p>
                                                </div>
                                            </div>
                                            <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-all">
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {Object.keys(groupedDocs).length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <Folder size={48} className="mx-auto text-slate-600 mb-4" />
                                <h3 className="text-white font-bold">Nenhum documento de RH encontrado</h3>
                                <p className="text-slate-500 text-sm mt-1">Adicione documentos com a categoria "Recursos Humanos" no módulo de Documentos.</p>
                            </div>
                        )}
                    </div>
                )
            }

            <Modal isOpen={isValeModalOpen} onClose={() => setIsValeModalOpen(false)} title="Lançar Vale / Adiantamento">
                <div className="space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <div>
                            <h4 className="text-sm font-bold text-amber-500 mb-1">Atenção ao Desconto</h4>
                            <p className="text-xs text-amber-200/80">O valor lançado aqui será descontado integralmente na próxima folha de pagamento.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Colaborador</label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none">
                            <option>João da Silva</option>
                            <option>Maria Oliveira</option>
                            <option>Carlos Santos</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Valor do Vale (R$)</label>
                            <input type="number" placeholder="0,00" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none font-mono" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Data Lançamento</label>
                            <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Motivo / Observação</label>
                        <textarea placeholder="Ex: Adiantamento para conserto de carro..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none h-24 resize-none" />
                    </div>
                    <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 mt-2">
                        <Save size={18} /> Confirmar Lançamento de Vale
                    </button>
                </div>
            </Modal>

            <Modal isOpen={isTimeModalOpen} onClose={() => setIsTimeModalOpen(false)} title="Ajuste Manual de Ponto">
                {editingRecord && (
                    <div className="space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
                            <Edit2 className="text-blue-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="text-sm font-bold text-blue-500 mb-1">Registro de Ajuste Manual</h4>
                                <p className="text-xs text-blue-200/80">Editando data: <strong>{editingRecord.date}</strong>. Qualquer alteração manual ficará registrada.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Entrada 1</label>
                                <input
                                    type="time"
                                    value={editingRecord.entry1}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, entry1: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Saída 1</label>
                                <input
                                    type="time"
                                    value={editingRecord.exit1}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, exit1: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Entrada 2</label>
                                <input
                                    type="time"
                                    value={editingRecord.entry2}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, entry2: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Saída 2</label>
                                <input
                                    type="time"
                                    value={editingRecord.exit2}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, exit2: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Justificativa do Ajuste</label>
                            <textarea placeholder="Ex: Esqueceu de bater o ponto..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none h-24 resize-none" />
                        </div>
                        <button
                            onClick={handleSaveTimeRecord}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-2"
                        >
                            <Save size={18} /> Salvar Ajuste
                        </button>
                    </div>
                )}
            </Modal>

            {
                showUploadModal && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Camera className="text-blue-500" /> Importação Inteligente (OCR)</h3>
                                    <p className="text-slate-400 text-sm mt-1">Envie fotos dos pontos. O sistema identificará automaticamente o funcionário e as datas.</p>
                                </div>
                                <button onClick={() => setShowUploadModal(false)} className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors text-slate-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {ocrResults.length === 0 && (
                                    <div className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-2xl h-64 flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all cursor-pointer relative">
                                        <input type="file" multiple accept="image/*" onChange={handleOcrFiles} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <div className="bg-slate-800 p-4 rounded-full text-blue-500"><Upload size={32} /></div>
                                        <div className="text-center"><p className="text-lg font-bold text-white">Arraste fotos ou clique para selecionar</p><p className="text-sm text-slate-500">Suporta JPG, PNG. Você pode enviar várias de uma vez.</p></div>
                                    </div>
                                )}
                                {ocrResults.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-white">Arquivos ({ocrResults.length})</h4>
                                            <div className="flex gap-2 items-center">
                                                <div className="hidden md:flex text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-1 rounded items-center gap-1 font-bold mr-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> IA Ativada (Forçada)
                                                </div>
                                                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"><Plus size={14} /> Adicionar Mais<input type="file" multiple accept="image/*" onChange={handleOcrFiles} className="hidden" /></label>
                                                <button onClick={processImages} disabled={isProcessingOCR} className={`text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isProcessingOCR ? 'bg-blue-800 cursor-wait text-white/50' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>{isProcessingOCR ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}{isProcessingOCR ? 'Processando (IA)...' : 'Processar Tudo'}</button>
                                                <button onClick={saveOcrResults} className="text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"><Save size={14} /> Salvar Verificados</button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {ocrResults.map((result, idx) => (
                                                <div key={idx} className={`bg-slate-950 border rounded-xl overflow-hidden flex ${result.status === 'success' ? 'border-emerald-500/30' : result.status === 'error' ? 'border-red-500/30' : 'border-slate-800'}`}>
                                                    <div className="w-24 h-24 bg-slate-900 relative">
                                                        <img src={result.preview} className="w-full h-full object-cover" />
                                                        {result.status === 'success' && <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center"><CheckCircle className="text-emerald-400 drop-shadow-md" /></div>}
                                                    </div>
                                                    <div className="p-3 flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start">
                                                                <div className="text-xs font-mono text-slate-500 truncate w-32">{result.file.name}</div>
                                                                <button onClick={() => removeOcrFile(idx)} className="text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
                                                            </div>
                                                            {result.status === 'pending' && <div className="text-xs text-slate-400 mt-2">Aguardando...</div>}
                                                            {result.status === 'processing' && <div className="text-xs text-blue-400 mt-2 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Lendo texto...</div>}
                                                            {result.status === 'success' && (
                                                                <div className="mt-3 space-y-3 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                                                    <div>
                                                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Funcionário</label>
                                                                        <select
                                                                            className={`w-full text-xs bg-slate-950 border rounded px-2 py-1.5 outline-none ${result.matchedEmployeeId ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-slate-700 text-slate-300'}`}
                                                                            value={result.matchedEmployeeId || ''}
                                                                            onChange={(e) => {
                                                                                const newEmpId = e.target.value;
                                                                                const emp = employees.find(ep => ep.id === newEmpId);
                                                                                const newResults = [...ocrResults];
                                                                                newResults[idx].matchedEmployeeId = newEmpId;
                                                                                newResults[idx].matchedEmployeeName = emp?.name;
                                                                                setOcrResults(newResults);
                                                                            }}
                                                                        >
                                                                            <option value="">Selecione...</option>
                                                                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                                                        </select>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] text-slate-500 font-bold uppercase block">Dados do Ponto</label>
                                                                        {result.parsedRecords && result.parsedRecords.length > 0 ? (
                                                                            <div className="max-h-48 overflow-y-auto border border-slate-700 rounded bg-slate-950/50 custom-scrollbar">
                                                                                <table className="w-full text-[10px]">
                                                                                    <thead className="bg-slate-900 text-slate-400 sticky top-0 font-bold">
                                                                                        <tr>
                                                                                            <th className="p-1 text-center w-6"><input type="checkbox" checked={result.parsedRecords.every(r => r.selected !== false)} onChange={(e) => {
                                                                                                const newVal = e.target.checked;
                                                                                                const newR = [...ocrResults];
                                                                                                if (newR[idx].parsedRecords) newR[idx].parsedRecords!.forEach(r => r.selected = newVal);
                                                                                                setOcrResults(newR);
                                                                                            }} className="rounded bg-slate-800 border-slate-600" /></th>
                                                                                            <th className="p-1 w-14">Data</th>
                                                                                            <th className="p-1 text-center">E1</th>
                                                                                            <th className="p-1 text-center">S1</th>
                                                                                            <th className="p-1 text-center">E2</th>
                                                                                            <th className="p-1 text-center">S2</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="text-slate-300 font-mono">
                                                                                        {result.parsedRecords.map((rec, rIdx) => (
                                                                                            <tr key={rIdx} className={`border-b border-slate-800/50 hover:bg-slate-800/30 ${rec.selected === false ? 'opacity-50' : ''}`}>
                                                                                                <td className="p-1 text-center"><input type="checkbox" checked={rec.selected !== false} onChange={(e) => {
                                                                                                    const newR = [...ocrResults];
                                                                                                    if (newR[idx].parsedRecords) newR[idx].parsedRecords![rIdx].selected = e.target.checked;
                                                                                                    setOcrResults(newR);
                                                                                                }} className="rounded bg-slate-800 border-slate-600" /></td>
                                                                                                <td className="p-1 text-blue-300">{rec.data.split('-').reverse().join('/').slice(0, 5)}</td>
                                                                                                <td className="p-0"><input value={rec.entrada1} onChange={e => {
                                                                                                    const newR = [...ocrResults];
                                                                                                    if (newR[idx].parsedRecords) newR[idx].parsedRecords![rIdx].entrada1 = e.target.value;
                                                                                                    setOcrResults(newR);
                                                                                                }} className="w-full bg-transparent text-center outline-none focus:bg-slate-800 p-1" /></td>
                                                                                                <td className="p-0"><input value={rec.saida1} onChange={e => {
                                                                                                    const newR = [...ocrResults];
                                                                                                    if (newR[idx].parsedRecords) newR[idx].parsedRecords![rIdx].saida1 = e.target.value;
                                                                                                    setOcrResults(newR);
                                                                                                }} className="w-full bg-transparent text-center outline-none focus:bg-slate-800 p-1" /></td>
                                                                                                <td className="p-0"><input value={rec.entrada2} onChange={e => {
                                                                                                    const newR = [...ocrResults];
                                                                                                    if (newR[idx].parsedRecords) newR[idx].parsedRecords![rIdx].entrada2 = e.target.value;
                                                                                                    setOcrResults(newR);
                                                                                                }} className="w-full bg-transparent text-center outline-none focus:bg-slate-800 p-1" /></td>
                                                                                                <td className="p-0"><input value={rec.saida2} onChange={e => {
                                                                                                    const newR = [...ocrResults];
                                                                                                    if (newR[idx].parsedRecords) newR[idx].parsedRecords![rIdx].saida2 = e.target.value;
                                                                                                    setOcrResults(newR);
                                                                                                }} className="w-full bg-transparent text-center outline-none focus:bg-slate-800 p-1" /></td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                <input
                                                                                    type="date"
                                                                                    className="col-span-2 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                                                                                    value={result.manualDate}
                                                                                    onChange={e => { const r = [...ocrResults]; r[idx].manualDate = e.target.value; setOcrResults(r); }}
                                                                                />
                                                                                <input type="time" className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500" value={result.manualEntry1} onChange={e => { const r = [...ocrResults]; r[idx].manualEntry1 = e.target.value; setOcrResults(r); }} />
                                                                                <input type="time" className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500" value={result.manualExit1} onChange={e => { const r = [...ocrResults]; r[idx].manualExit1 = e.target.value; setOcrResults(r); }} />
                                                                                <input type="time" className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500" value={result.manualEntry2} onChange={e => { const r = [...ocrResults]; r[idx].manualEntry2 = e.target.value; setOcrResults(r); }} />
                                                                                <input type="time" className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500" value={result.manualExit2} onChange={e => { const r = [...ocrResults]; r[idx].manualExit2 = e.target.value; setOcrResults(r); }} />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <details className="text-[10px] text-slate-600 cursor-pointer">
                                                                        <summary>Ver texto extraído ({result.detectedTimes?.length || 0} horas)</summary>
                                                                        <div className="mt-1 p-1 bg-black/20 rounded font-mono max-h-20 overflow-y-auto text-xs">
                                                                            <p className="mb-1 text-blue-400 font-bold">{result.detectedTimes?.join(' | ')}</p>
                                                                            <p className="text-slate-500 whitespace-pre-wrap opacity-50">{result.extractedText?.substring(0, 100)}...</p>
                                                                        </div>
                                                                    </details>
                                                                </div>
                                                            )}
                                                            {result.status === 'error' && (
                                                                <div className="mt-2 text-[10px] text-red-400 bg-red-950/30 p-2 rounded border border-red-500/20 font-mono">
                                                                    {result.logs.join('\n')}
                                                                    <button onClick={() => { const r = [...ocrResults]; r[idx].status = 'pending'; setOcrResults(r); }} className="block mt-1 text-red-300 underline">Tentar de novo</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {
                isEmployeeFormOpen && (
                    <EmployeeForm
                        employeeId={editingEmpId}
                        companiesList={availableCompanies}
                        onClose={() => setIsEmployeeFormOpen(false)}
                        onSuccess={() => {
                            setIsEmployeeFormOpen(false);
                            loadData();
                        }}
                    />
                )
            }

        </div >
    );
};

export default HRManagement;
