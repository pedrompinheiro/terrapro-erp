/**
 * PayrollEditor.tsx — Tela editável estilo planilha
 *
 * Consolidada: edição de valores + match + conferência ponto + gerar contas a pagar
 * Layout que replica a planilha Excel: agrupado por empresa, colunas editáveis
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Save, DollarSign, UserCheck, Clock, CreditCard, Building2, AlertTriangle,
    CheckCircle, Search, X, RefreshCw, Loader2, ArrowLeft, ChevronDown, ChevronRight, Pencil
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { payrollService, FolhaItem, GerarContasConfig } from '../../services/payrollService';
import toast from 'react-hot-toast';

interface Props {
    folhaId: string;
    ano: number;
    mes: number;
    itens: FolhaItem[];
    onRefresh: () => void;
    onDone: () => void;
    onBack: () => void;
}

const SECTION_LABELS: Record<string, string> = {
    'DOURADAO': 'Douradão Materiais',
    'CONSTRUTERRA': 'Construterra',
    'TRANS_TERRA': 'Transportadora Terra',
};

const SECTION_COLORS: Record<string, string> = {
    'DOURADAO': 'border-blue-600 bg-blue-950/20',
    'CONSTRUTERRA': 'border-purple-600 bg-purple-950/20',
    'TRANS_TERRA': 'border-[#007a33] bg-green-950/20',
};

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtShort = (v: number) => v > 0 ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';

// Campos editáveis
type EditableField = 'salario_mensal' | 'adiantamento' | 'gastos_loja' | 'coopercred_uniodonto' | 'marmita_outros' | 'salario_liquido' | 'ifood_valor' | 'forma_pagamento' | 'observacoes';

const PayrollEditor: React.FC<Props> = ({ folhaId, ano, mes, itens: initialItens, onRefresh, onDone, onBack }) => {
    const [itens, setItens] = useState<FolhaItem[]>(initialItens);
    const [modified, setModified] = useState<Set<string>>(new Set());
    const [editingCell, setEditingCell] = useState<{ id: string; field: EditableField } | null>(null);
    const [editValue, setEditValue] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);
    const [saving, setSaving] = useState(false);
    const [matching, setMatching] = useState(false);
    const [crossReffing, setCrossReffing] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

    // Match manual
    const [showMatchModal, setShowMatchModal] = useState<string | null>(null);
    const [matchSearch, setMatchSearch] = useState('');
    const [employeeResults, setEmployeeResults] = useState<any[]>([]);

    // Gerar contas
    const [showGenerar, setShowGenerar] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [centrosCusto, setCentrosCusto] = useState<any[]>([]);

    const hoje = new Date().toISOString().split('T')[0];
    const proximoMes = new Date(ano, mes, 5);
    const vencSalario = proximoMes.toISOString().split('T')[0];
    const [config, setConfig] = useState<GerarContasConfig>({
        data_emissao: hoje,
        data_vencimento_salario: vencSalario,
        data_vencimento_ifood: hoje,
        centro_custo_id: '',
    });

    // Atualizar itens quando props mudam
    useEffect(() => {
        setItens(initialItens);
        setModified(new Set());
    }, [initialItens]);

    // Focus no input de edição
    useEffect(() => {
        if (editingCell && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingCell]);

    // Carregar centros de custo
    useEffect(() => {
        (async () => {
            const { data } = await supabase
                .from('centros_custo')
                .select('id, nome, codigo')
                .eq('ativo', true)
                .order('codigo');
            setCentrosCusto(data || []);
            const cc = (data || []).find((c: any) => c.codigo === '6.01');
            if (cc) setConfig(prev => ({ ...prev, centro_custo_id: cc.id }));
        })();
    }, []);

    // -------- Edição inline --------

    const startEdit = (id: string, field: EditableField, currentValue: any) => {
        setEditingCell({ id, field });
        setEditValue(String(currentValue || ''));
    };

    const commitEdit = () => {
        if (!editingCell) return;
        const { id, field } = editingCell;

        setItens(prev => prev.map(item => {
            if (item.id !== id) return item;

            const updated = { ...item };
            const numericFields: EditableField[] = ['salario_mensal', 'adiantamento', 'gastos_loja', 'coopercred_uniodonto', 'marmita_outros', 'salario_liquido', 'ifood_valor'];

            if (numericFields.includes(field)) {
                const parsed = parseFloat(editValue.replace(/[^\d.,\-]/g, '').replace(',', '.'));
                (updated as any)[field] = isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;

                // Auto-recalcular líquido se editou componente do salário
                if (field !== 'salario_liquido' && field !== 'ifood_valor') {
                    updated.salario_liquido = Math.round(
                        (updated.salario_mensal - updated.adiantamento - updated.gastos_loja - updated.coopercred_uniodonto - updated.marmita_outros) * 100
                    ) / 100;
                    if (updated.salario_liquido < 0) updated.salario_liquido = 0;
                }
            } else {
                (updated as any)[field] = editValue || null;
            }

            return updated;
        }));

        setModified(prev => new Set(prev).add(id));
        setEditingCell(null);
    };

    const cancelEdit = () => {
        setEditingCell(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') commitEdit();
        if (e.key === 'Escape') cancelEdit();
        if (e.key === 'Tab') {
            e.preventDefault();
            commitEdit();
        }
    };

    // -------- Toggle incluir --------
    const toggleIncluir = (id: string) => {
        setItens(prev => prev.map(item => {
            if (item.id !== id) return item;
            return { ...item, incluir: !item.incluir };
        }));
        setModified(prev => new Set(prev).add(id));
    };

    // -------- Salvar --------
    const handleSave = async () => {
        if (modified.size === 0) {
            toast('Nenhuma alteração para salvar');
            return;
        }

        setSaving(true);
        try {
            const updates = Array.from(modified).map(id => {
                const item = itens.find(i => i.id === id);
                if (!item) return null;
                return {
                    id,
                    campos: {
                        salario_mensal: item.salario_mensal,
                        adiantamento: item.adiantamento,
                        gastos_loja: item.gastos_loja,
                        coopercred_uniodonto: item.coopercred_uniodonto,
                        marmita_outros: item.marmita_outros,
                        salario_liquido: item.salario_liquido,
                        ifood_valor: item.ifood_valor,
                        forma_pagamento: item.forma_pagamento,
                        observacoes: item.observacoes,
                        incluir: item.incluir,
                    } as Partial<FolhaItem>,
                };
            }).filter(Boolean) as { id: string; campos: Partial<FolhaItem> }[];

            await payrollService.atualizarItens(updates);
            await payrollService.recalcularTotais(folhaId);

            setModified(new Set());
            toast.success(`${updates.length} registro(s) salvos`);
            onRefresh();
        } catch (err: any) {
            toast.error(`Erro ao salvar: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // -------- Match automático --------
    const handleAutoMatch = async () => {
        setMatching(true);
        try {
            const result = await payrollService.matchEmployees(folhaId);
            toast.success(`Match: ${result.matched} encontrados, ${result.unmatched} não encontrados`);
            onRefresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setMatching(false);
        }
    };

    // -------- Match manual --------
    const searchEmployees = async (query: string) => {
        if (!query || query.length < 2) { setEmployeeResults([]); return; }
        const { data } = await supabase
            .from('employees')
            .select('id, name, registration_number, company_id')
            .eq('active', true)
            .ilike('name', `%${query}%`)
            .limit(10);
        setEmployeeResults(data || []);
    };

    const handleManualMatch = async (itemId: string, employeeId: string) => {
        try {
            await payrollService.updateItemMatch(itemId, employeeId);
            toast.success('Match manual aplicado');
            setShowMatchModal(null);
            setMatchSearch('');
            onRefresh();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // -------- Conferência ponto --------
    const handleCrossRef = async () => {
        setCrossReffing(true);
        try {
            const result = await payrollService.crossReferenceTimecard(folhaId, ano, mes);
            toast.success(`Conferência: ${result.comPonto} com ponto, ${result.discrepancias} discrepâncias`);
            onRefresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setCrossReffing(false);
        }
    };

    // -------- Gerar contas a pagar --------
    const handleGenerar = async () => {
        if (!config.centro_custo_id) { toast.error('Selecione um Centro de Custo'); return; }
        setGenerating(true);
        try {
            const result = await payrollService.gerarContasPagar(folhaId, config);
            if (result.errors.length > 0) {
                toast.error(`Gerado com ${result.errors.length} erro(s)`);
            } else {
                toast.success(`${result.contasSalario} salários + ${result.contasIfood} iFood gerados!`);
            }
            setShowGenerar(false);
            onRefresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setGenerating(false);
        }
    };

    // -------- Dados agrupados --------
    const sections = [...new Set(itens.map(i => i.company_section))];

    const matchedCount = itens.filter(i => i.match_status === 'MATCHED' || i.match_status === 'MANUAL').length;
    const unmatchedCount = itens.filter(i => i.match_status === 'NAO_ENCONTRADO' || i.match_status === 'PENDENTE').length;
    const totalBruto = itens.filter(i => i.incluir).reduce((s, i) => s + i.salario_mensal, 0);
    const totalLiquido = itens.filter(i => i.incluir).reduce((s, i) => s + i.salario_liquido, 0);
    const totalIfood = itens.filter(i => i.incluir).reduce((s, i) => s + i.ifood_valor, 0);
    const discrepancias = itens.filter(i => i.discrepancia_flag).length;

    const toggleSection = (sec: string) => {
        setCollapsedSections(prev => {
            const next = new Set(prev);
            next.has(sec) ? next.delete(sec) : next.add(sec);
            return next;
        });
    };

    // -------- Render célula editável --------
    const EditableCell = ({ item, field, isNum = true, className = '' }: {
        item: FolhaItem; field: EditableField; isNum?: boolean; className?: string;
    }) => {
        const isEditing = editingCell?.id === item.id && editingCell?.field === field;
        const value = (item as any)[field];
        const display = isNum ? fmtShort(value || 0) : (value || '-');

        if (isEditing) {
            return (
                <input
                    ref={editInputRef}
                    type={isNum ? 'text' : 'text'}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-slate-700 border border-[#007a33] text-white px-1 py-0.5 rounded text-xs text-right outline-none"
                    style={{ minWidth: '60px' }}
                />
            );
        }

        return (
            <span
                onClick={() => startEdit(item.id!, field, isNum ? (value || 0) : (value || ''))}
                className={`cursor-pointer hover:bg-slate-700/50 px-1 py-0.5 rounded transition-colors inline-block w-full text-right ${className}`}
                title="Clique para editar"
            >
                {display}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header com título e ações */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <DollarSign size={20} className="text-[#007a33]" />
                        Folha {MESES[mes - 1]}/{ano}
                        <span className="text-xs text-slate-500 font-normal ml-2">
                            {itens.length} funcionários • {sections.length} empresas
                        </span>
                    </h3>
                    {modified.size > 0 && (
                        <p className="text-amber-400 text-xs mt-0.5 flex items-center gap-1">
                            <Pencil size={10} /> {modified.size} alteração(ões) não salvas
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Salvar */}
                    <button
                        onClick={handleSave}
                        disabled={saving || modified.size === 0}
                        className={`px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm font-bold transition-all ${
                            modified.size > 0
                                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                : 'bg-slate-800 text-slate-500 cursor-default'
                        }`}
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Salvar {modified.size > 0 && `(${modified.size})`}
                    </button>

                    {/* Match */}
                    <button
                        onClick={handleAutoMatch}
                        disabled={matching}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 text-sm"
                    >
                        {matching ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                        Match
                    </button>

                    {/* Conferir Ponto */}
                    <button
                        onClick={handleCrossRef}
                        disabled={crossReffing}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 text-sm"
                    >
                        {crossReffing ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                        Ponto
                    </button>

                    {/* Gerar Contas */}
                    <button
                        onClick={() => setShowGenerar(!showGenerar)}
                        className="px-3 py-2 bg-[#007a33] hover:bg-[#009a40] text-white rounded-lg flex items-center gap-1.5 text-sm font-bold"
                    >
                        <CreditCard size={14} />
                        Gerar Contas a Pagar
                    </button>
                </div>
            </div>

            {/* Stats rápidos */}
            <div className="grid grid-cols-6 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider">Bruto</div>
                    <div className="text-white font-black text-sm mt-0.5">{fmt(totalBruto)}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider">Líquido</div>
                    <div className="text-[#007a33] font-black text-sm mt-0.5">{fmt(totalLiquido)}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider">iFood</div>
                    <div className="text-orange-400 font-black text-sm mt-0.5">{fmt(totalIfood)}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider">Vinculados</div>
                    <div className="text-green-400 font-black text-sm mt-0.5">{matchedCount}<span className="text-slate-600 text-xs">/{itens.length}</span></div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider">Não Vinculados</div>
                    <div className={`font-black text-sm mt-0.5 ${unmatchedCount > 0 ? 'text-amber-400' : 'text-slate-600'}`}>{unmatchedCount}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider">Discrepâncias</div>
                    <div className={`font-black text-sm mt-0.5 ${discrepancias > 0 ? 'text-red-400' : 'text-green-400'}`}>{discrepancias}</div>
                </div>
            </div>

            {/* Painel Gerar Contas a Pagar (expandível) */}
            {showGenerar && (
                <div className="bg-slate-900 border border-[#007a33]/30 rounded-xl p-5 space-y-4">
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                        <CreditCard size={16} className="text-[#007a33]" />
                        Configuração — Gerar Contas a Pagar
                    </h4>

                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Data Emissão</label>
                            <input
                                type="date"
                                value={config.data_emissao}
                                onChange={e => setConfig(prev => ({ ...prev, data_emissao: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Vencimento Salário</label>
                            <input
                                type="date"
                                value={config.data_vencimento_salario}
                                onChange={e => setConfig(prev => ({ ...prev, data_vencimento_salario: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Vencimento iFood</label>
                            <input
                                type="date"
                                value={config.data_vencimento_ifood}
                                onChange={e => setConfig(prev => ({ ...prev, data_vencimento_ifood: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1 flex items-center gap-1">
                                <Building2 size={12} /> Centro de Custo
                            </label>
                            <select
                                value={config.centro_custo_id}
                                onChange={e => setConfig(prev => ({ ...prev, centro_custo_id: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm"
                            >
                                <option value="">Selecione...</option>
                                {centrosCusto.map((cc: any) => (
                                    <option key={cc.id} value={cc.id}>{cc.codigo} - {cc.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <div className="text-xs text-slate-500">
                            {matchedCount} funcionários elegíveis •
                            Total: {fmt(totalLiquido + totalIfood)}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowGenerar(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleGenerar}
                                disabled={generating || !config.centro_custo_id}
                                className="px-6 py-2.5 bg-[#007a33] hover:bg-[#009a40] text-white font-bold rounded-xl flex items-center gap-2 text-sm disabled:opacity-50"
                            >
                                {generating ? (
                                    <><Loader2 size={16} className="animate-spin" /> Gerando...</>
                                ) : (
                                    <><DollarSign size={16} /> Gerar Contas</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabelas por seção */}
            {sections.map(section => {
                const sectionItens = itens.filter(i => i.company_section === section);
                const isCollapsed = collapsedSections.has(section);
                const sectionLabel = SECTION_LABELS[section] || section;
                const sectionColor = SECTION_COLORS[section] || 'border-slate-600 bg-slate-950';
                const sectionLiquido = sectionItens.filter(i => i.incluir).reduce((s, i) => s + i.salario_liquido, 0);
                const sectionIfood = sectionItens.filter(i => i.incluir).reduce((s, i) => s + i.ifood_valor, 0);

                return (
                    <div key={section} className={`border-l-4 rounded-xl overflow-hidden ${sectionColor}`}>
                        {/* Header da seção */}
                        <button
                            onClick={() => toggleSection(section)}
                            className="w-full px-4 py-3 bg-slate-800/50 flex items-center justify-between hover:bg-slate-800/80 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                <Building2 size={16} className="text-slate-400" />
                                <span className="text-white font-bold text-sm">{sectionLabel}</span>
                                <span className="text-slate-500 text-xs">({sectionItens.length})</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <span className="text-slate-400">Líquido: <span className="text-[#007a33] font-bold">{fmt(sectionLiquido)}</span></span>
                                {sectionIfood > 0 && (
                                    <span className="text-slate-400">iFood: <span className="text-orange-400 font-bold">{fmt(sectionIfood)}</span></span>
                                )}
                            </div>
                        </button>

                        {/* Tabela editável */}
                        {!isCollapsed && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-slate-500 border-b border-slate-800 bg-slate-900/50">
                                            <th className="px-2 py-2 text-center w-8" title="Incluir">
                                                <input
                                                    type="checkbox"
                                                    checked={sectionItens.every(i => i.incluir)}
                                                    onChange={() => {
                                                        const allIncluded = sectionItens.every(i => i.incluir);
                                                        setItens(prev => prev.map(item => {
                                                            if (item.company_section !== section) return item;
                                                            return { ...item, incluir: !allIncluded };
                                                        }));
                                                        sectionItens.forEach(i => i.id && setModified(prev => new Set(prev).add(i.id!)));
                                                    }}
                                                    className="accent-[#007a33]"
                                                />
                                            </th>
                                            <th className="px-2 py-2 text-left min-w-[160px]">EMPRESA</th>
                                            <th className="px-2 py-2 text-right min-w-[85px]">SALÁRIO</th>
                                            <th className="px-2 py-2 text-right min-w-[75px]">ADIANT.</th>
                                            <th className="px-2 py-2 text-right min-w-[70px]">LOJA</th>
                                            <th className="px-2 py-2 text-right min-w-[70px]">COOPER.</th>
                                            <th className="px-2 py-2 text-right min-w-[70px]">MARM.</th>
                                            <th className="px-2 py-2 text-right min-w-[85px] font-bold">LÍQUIDO</th>
                                            <th className="px-2 py-2 text-left min-w-[80px]">PGTO</th>
                                            <th className="px-2 py-2 text-right min-w-[75px]">IFOOD</th>
                                            <th className="px-2 py-2 text-left min-w-[60px]">STATUS</th>
                                            <th className="px-2 py-2 text-left min-w-[100px]">OBS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sectionItens.map(item => {
                                            const isZero = item.salario_mensal === 0 && item.salario_liquido === 0;
                                            const isModified = modified.has(item.id!);
                                            const matchColor = item.match_status === 'MATCHED' ? 'text-green-400'
                                                : item.match_status === 'MANUAL' ? 'text-blue-400'
                                                : item.match_status === 'NAO_ENCONTRADO' ? 'text-red-400'
                                                : 'text-slate-600';

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className={`border-b border-slate-800/30 transition-colors ${
                                                        !item.incluir ? 'opacity-30' :
                                                        isZero ? 'opacity-50' : ''
                                                    } ${isModified ? 'bg-amber-950/10' : 'hover:bg-slate-800/20'}
                                                    ${item.discrepancia_flag ? 'bg-red-950/10' : ''}`}
                                                >
                                                    <td className="px-2 py-1 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.incluir}
                                                            onChange={() => toggleIncluir(item.id!)}
                                                            className="accent-[#007a33]"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-white font-medium whitespace-nowrap">
                                                                {item.employee_name}
                                                            </span>
                                                            {item.employee_code && (
                                                                <span className="text-slate-600 text-[10px]">#{item.employee_code}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-1">
                                                        <EditableCell item={item} field="salario_mensal" className="text-slate-300" />
                                                    </td>
                                                    <td className="px-1 py-1">
                                                        <EditableCell item={item} field="adiantamento" className="text-red-400/70" />
                                                    </td>
                                                    <td className="px-1 py-1">
                                                        <EditableCell item={item} field="gastos_loja" className="text-red-400/60" />
                                                    </td>
                                                    <td className="px-1 py-1">
                                                        <EditableCell item={item} field="coopercred_uniodonto" className="text-red-400/60" />
                                                    </td>
                                                    <td className="px-1 py-1">
                                                        <EditableCell item={item} field="marmita_outros" className="text-red-400/60" />
                                                    </td>
                                                    <td className="px-1 py-1">
                                                        <EditableCell item={item} field="salario_liquido" className="text-[#007a33] font-bold" />
                                                    </td>
                                                    <td className="px-1 py-1">
                                                        <EditableCell item={item} field="forma_pagamento" isNum={false} className="text-slate-400 text-[10px] text-left" />
                                                    </td>
                                                    <td className="px-1 py-1">
                                                        <EditableCell item={item} field="ifood_valor" className="text-orange-400" />
                                                    </td>
                                                    <td className="px-1 py-1">
                                                        <div className="flex items-center gap-1">
                                                            <span className={matchColor}>
                                                                {item.match_status === 'MATCHED' ? <CheckCircle size={12} /> :
                                                                 item.match_status === 'MANUAL' ? <UserCheck size={12} /> :
                                                                 item.match_status === 'NAO_ENCONTRADO' ? (
                                                                    <button
                                                                        onClick={() => { setShowMatchModal(item.id!); setMatchSearch(item.employee_name); searchEmployees(item.employee_name); }}
                                                                        className="text-red-400 hover:text-red-300"
                                                                        title="Vincular manualmente"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                 ) : <span className="text-[10px]">—</span>}
                                                            </span>
                                                            {item.discrepancia_flag && (
                                                                <span className="text-amber-400" title={item.discrepancia_notas || 'Discrepância'}>
                                                                    <AlertTriangle size={11} />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-1">
                                                        <EditableCell item={item} field="observacoes" isNum={false} className="text-slate-500 text-[10px] text-left max-w-[120px] truncate" />
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {/* Totais da seção */}
                                        <tr className="bg-slate-800/30 border-t border-slate-700">
                                            <td colSpan={2} className="px-2 py-2 text-right text-slate-400 text-xs font-bold uppercase">
                                                Total {sectionLabel}
                                            </td>
                                            <td className="px-1 py-2 text-right text-white font-bold text-xs">
                                                {fmtShort(sectionItens.filter(i => i.incluir).reduce((s, i) => s + i.salario_mensal, 0))}
                                            </td>
                                            <td className="px-1 py-2 text-right text-red-400/70 text-xs">
                                                {fmtShort(sectionItens.filter(i => i.incluir).reduce((s, i) => s + i.adiantamento, 0))}
                                            </td>
                                            <td className="px-1 py-2 text-right text-red-400/60 text-xs">
                                                {fmtShort(sectionItens.filter(i => i.incluir).reduce((s, i) => s + i.gastos_loja, 0))}
                                            </td>
                                            <td className="px-1 py-2 text-right text-red-400/60 text-xs">
                                                {fmtShort(sectionItens.filter(i => i.incluir).reduce((s, i) => s + i.coopercred_uniodonto, 0))}
                                            </td>
                                            <td className="px-1 py-2 text-right text-red-400/60 text-xs">
                                                {fmtShort(sectionItens.filter(i => i.incluir).reduce((s, i) => s + i.marmita_outros, 0))}
                                            </td>
                                            <td className="px-1 py-2 text-right text-[#007a33] font-black text-xs">
                                                {fmtShort(sectionLiquido)}
                                            </td>
                                            <td className="px-1 py-2"></td>
                                            <td className="px-1 py-2 text-right text-orange-400 font-bold text-xs">
                                                {fmtShort(sectionIfood)}
                                            </td>
                                            <td colSpan={2} className="px-1 py-2"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Total Geral */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <span className="text-white font-black uppercase tracking-wider text-sm">TOTAL GERAL</span>
                    <div className="flex items-center gap-8">
                        <div>
                            <span className="text-slate-500 text-xs mr-2">Bruto</span>
                            <span className="text-white font-black">{fmt(totalBruto)}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-xs mr-2">Líquido</span>
                            <span className="text-[#007a33] font-black">{fmt(totalLiquido)}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-xs mr-2">iFood</span>
                            <span className="text-orange-400 font-black">{fmt(totalIfood)}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-xs mr-2">Total</span>
                            <span className="text-white font-black text-lg">{fmt(totalLiquido + totalIfood)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ações de navegação */}
            <div className="flex justify-between pt-2">
                <button onClick={onBack} className="px-4 py-2 text-slate-400 hover:text-white text-sm flex items-center gap-1">
                    <ArrowLeft size={16} /> Voltar
                </button>
                <button
                    onClick={onDone}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm"
                >
                    Concluído
                </button>
            </div>

            {/* Modal Match Manual */}
            {showMatchModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowMatchModal(null)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-[500px] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <UserCheck size={18} className="text-[#007a33]" />
                            Vincular Funcionário Manualmente
                        </h4>

                        <div className="text-slate-400 text-xs mb-3">
                            Planilha: <span className="text-white font-bold">
                                {itens.find(i => i.id === showMatchModal)?.employee_name}
                            </span>
                        </div>

                        <div className="relative mb-4">
                            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar funcionário..."
                                value={matchSearch}
                                onChange={e => { setMatchSearch(e.target.value); searchEmployees(e.target.value); }}
                                className="w-full bg-slate-800 border border-slate-700 text-white pl-9 pr-3 py-2 rounded-lg text-sm"
                                autoFocus
                            />
                        </div>

                        <div className="max-h-[250px] overflow-y-auto space-y-1">
                            {employeeResults.map(emp => (
                                <button
                                    key={emp.id}
                                    onClick={() => handleManualMatch(showMatchModal, emp.id)}
                                    className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white flex items-center justify-between"
                                >
                                    <span>{emp.name}</span>
                                    <span className="text-slate-500 text-xs">#{emp.registration_number}</span>
                                </button>
                            ))}
                            {employeeResults.length === 0 && matchSearch.length >= 2 && (
                                <p className="text-slate-600 text-xs text-center py-4">Nenhum resultado</p>
                            )}
                        </div>

                        <button
                            onClick={() => setShowMatchModal(null)}
                            className="mt-4 w-full px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollEditor;
