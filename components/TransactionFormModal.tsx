import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Calendar, DollarSign, FileText, Repeat, Tag, Briefcase, Plus, Trash2, Percent, PieChart, Paperclip, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';

interface RateioLine {
    id: string;
    centro_custo_id: string;
    percentual: number;
    valor: number;
}

interface TransactionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    type: 'PAGAR' | 'RECEBER';
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, onSuccess, type }) => {
    const [loading, setLoading] = useState(false);
    const [partners, setPartners] = useState<any[]>([]);
    const [costCenters, setCostCenters] = useState<any[]>([]);
    const [chartAccounts, setChartAccounts] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        partner_id: '',
        description: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        issue_date: new Date().toISOString().split('T')[0],
        recurrence: 'UNICA',
        installments: 1,
        interval: 30,
        cost_center_id: '',
        chart_account_id: '',
        observation: '',
        numero_nf: '',
        numero_documento: '',
        tipo_documento: 'AVULSO',
    });

    // Anexo State
    const [anexoFile, setAnexoFile] = useState<File | null>(null);
    const anexoRef = useRef<HTMLInputElement>(null);

    // Rateio State
    const [useRateio, setUseRateio] = useState(false);
    const [rateioLines, setRateioLines] = useState<RateioLine[]>([]);

    // Rateio helpers
    const totalAmount = parseFloat(formData.amount) || 0;
    const totalRateioPercent = rateioLines.reduce((sum, l) => sum + (l.percentual || 0), 0);
    const totalRateioValor = rateioLines.reduce((sum, l) => sum + (l.valor || 0), 0);
    const rateioIsValid = Math.abs(totalRateioPercent - 100) < 0.01 && rateioLines.length >= 2 && rateioLines.every(l => l.centro_custo_id);

    const addRateioLine = () => {
        setRateioLines(prev => [
            ...prev,
            { id: Date.now().toString(), centro_custo_id: '', percentual: 0, valor: 0 }
        ]);
    };

    const removeRateioLine = (id: string) => {
        setRateioLines(prev => prev.filter(l => l.id !== id));
    };

    const updateRateioPercent = (id: string, pct: number) => {
        setRateioLines(prev => prev.map(l =>
            l.id === id
                ? { ...l, percentual: pct, valor: Math.round(totalAmount * pct / 100 * 100) / 100 }
                : l
        ));
    };

    const updateRateioValor = (id: string, val: number) => {
        setRateioLines(prev => prev.map(l =>
            l.id === id
                ? { ...l, valor: val, percentual: totalAmount > 0 ? Math.round(val / totalAmount * 10000) / 100 : 0 }
                : l
        ));
    };

    const updateRateioCostCenter = (id: string, ccId: string) => {
        setRateioLines(prev => prev.map(l =>
            l.id === id ? { ...l, centro_custo_id: ccId } : l
        ));
    };

    // Distribuir restante igualmente
    const distribuirRestante = () => {
        if (rateioLines.length === 0) return;
        const equalPct = Math.round(10000 / rateioLines.length) / 100;
        const lastPct = Math.round((100 - equalPct * (rateioLines.length - 1)) * 100) / 100;
        setRateioLines(prev => prev.map((l, i) => {
            const pct = i === prev.length - 1 ? lastPct : equalPct;
            return { ...l, percentual: pct, valor: Math.round(totalAmount * pct / 100 * 100) / 100 };
        }));
    };

    // Quando muda modo rateio, inicializar
    useEffect(() => {
        if (useRateio && rateioLines.length === 0) {
            setRateioLines([
                { id: '1', centro_custo_id: '', percentual: 50, valor: totalAmount * 0.5 },
                { id: '2', centro_custo_id: '', percentual: 50, valor: totalAmount * 0.5 },
            ]);
        }
    }, [useRateio]);

    // Recalcular valores quando amount muda
    useEffect(() => {
        if (useRateio && totalAmount > 0) {
            setRateioLines(prev => prev.map(l => ({
                ...l,
                valor: Math.round(totalAmount * l.percentual / 100 * 100) / 100
            })));
        }
    }, [formData.amount]);

    // Load auxiliary data
    useEffect(() => {
        if (isOpen) {
            loadDependencies();
            // Reset rateio e anexo
            setUseRateio(false);
            setRateioLines([]);
            setAnexoFile(null);
        }
    }, [isOpen]);

    const loadDependencies = async () => {
        try {
            const { data: entities } = await supabase
                .from('entities')
                .select('id, name, is_client, is_supplier')
                .order('name');

            if (entities) {
                const filtered = entities.filter(e =>
                    type === 'RECEBER' ? e.is_client : e.is_supplier
                );
                setPartners(filtered.length > 0 ? filtered : entities);
            }

            const { data: costs } = await supabase
                .from('centros_custo')
                .select('id, nome, codigo')
                .eq('ativo', true)
                .order('nome');
            if (costs) setCostCenters(costs);

            const { data: accounts } = await supabase
                .from('plano_contas')
                .select('id, nome, codigo, tipo')
                .eq('tipo', type === 'RECEBER' ? 'RECEITA' : 'DESPESA')
                .order('codigo');
            if (accounts) setChartAccounts(accounts);
        } catch (error) {
            console.error('Erro ao carregar dependências', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar rateio
        if (useRateio) {
            if (rateioLines.length < 2) {
                showToast.error('Rateio precisa ter pelo menos 2 centros de custo');
                return;
            }
            if (!rateioLines.every(l => l.centro_custo_id)) {
                showToast.error('Selecione o centro de custo em todas as linhas do rateio');
                return;
            }
            // Verificar duplicatas
            const ccIds = rateioLines.map(l => l.centro_custo_id);
            if (new Set(ccIds).size !== ccIds.length) {
                showToast.error('Não pode repetir o mesmo centro de custo no rateio');
                return;
            }
            if (Math.abs(totalRateioPercent - 100) > 0.5) {
                showToast.error(`A soma dos percentuais deve ser 100% (atual: ${totalRateioPercent.toFixed(2)}%)`);
                return;
            }
        }

        setLoading(true);

        try {
            const table = type === 'RECEBER' ? 'contas_receber' : 'contas_pagar';
            const fieldPartner = type === 'RECEBER' ? 'cliente_id' : 'fornecedor_id';
            const fieldPartnerName = type === 'RECEBER' ? 'cliente_nome' : 'fornecedor_nome';
            const lancamentoTipo = type;

            const partner = partners.find(p => p.id === formData.partner_id);

            const payload: any = {
                [fieldPartner]: formData.partner_id || null,
                [fieldPartnerName]: partner?.name || 'Desconhecido',
                descricao: formData.description,
                valor_original: totalAmount,
                data_emissao: formData.issue_date,
                data_vencimento: formData.due_date,
                centro_custo_id: useRateio ? null : (formData.cost_center_id || null),
                plano_contas_id: formData.chart_account_id || null,
                observacao: formData.observation,
                status: 'PENDENTE',
                numero_titulo: `${type === 'RECEBER' ? 'REC' : 'PAG'}-${Date.now()}`,
                numero_nf: formData.numero_nf || null,
                numero_documento: formData.numero_documento || null,
                tipo_documento: formData.tipo_documento,
            };

            const insertRateio = async (lancamentoId: string, valorBase: number) => {
                if (!useRateio || rateioLines.length === 0) return;
                const rateioPayloads = rateioLines.map(l => ({
                    lancamento_id: lancamentoId,
                    lancamento_tipo: lancamentoTipo,
                    centro_custo_id: l.centro_custo_id,
                    percentual: l.percentual,
                    valor: Math.round(valorBase * l.percentual / 100 * 100) / 100,
                }));
                const { error } = await supabase.from('rateio_centro_custo').insert(rateioPayloads);
                if (error) console.error('Erro ao salvar rateio:', error);
            };

            // Upload anexo se houver
            let anexoUrl: string | null = null;
            if (anexoFile) {
                const ext = anexoFile.name.split('.').pop() || 'pdf';
                const path = `financial/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from('integration-docs')
                    .upload(path, anexoFile, { cacheControl: '3600', upsert: false });
                if (!uploadErr) {
                    const { data: urlData } = supabase.storage.from('integration-docs').getPublicUrl(path);
                    anexoUrl = urlData?.publicUrl || null;
                }
            }

            // Adicionar anexo_url ao payload se disponível
            if (anexoUrl) {
                payload.anexo_url = anexoUrl;
            }

            if (formData.recurrence === 'PARCELADO' && formData.installments > 1) {
                const valorParcela = totalAmount / formData.installments;

                for (let i = 0; i < formData.installments; i++) {
                    const dataBase = new Date(formData.due_date);
                    dataBase.setDate(dataBase.getDate() + (i * formData.interval));

                    const parcelaPayload = {
                        ...payload,
                        numero_titulo: `${payload.numero_titulo}-${i + 1}/${formData.installments}`,
                        descricao: `${payload.descricao} (${i + 1}/${formData.installments})`,
                        valor_original: Math.round(valorParcela * 100) / 100,
                        data_vencimento: dataBase.toISOString().split('T')[0],
                        parcela_numero: i + 1,
                        parcela_total: formData.installments,
                    };

                    let inserted: any = null;
                    const { data, error } = await supabase.from(table).insert(parcelaPayload).select('id').single();
                    if (error) {
                        // Se anexo_url não existe, tentar sem
                        if (error.message?.includes('anexo_url')) {
                            const { anexo_url, ...payloadSem } = parcelaPayload as any;
                            const { data: d2, error: e2 } = await supabase.from(table).insert(payloadSem).select('id').single();
                            if (e2) throw e2;
                            inserted = d2;
                        } else {
                            throw error;
                        }
                    } else {
                        inserted = data;
                    }

                    if (inserted) await insertRateio(inserted.id, Math.round(valorParcela * 100) / 100);
                }
                showToast.success(`${formData.installments} parcelas geradas com sucesso!`);
            } else {
                let inserted: any = null;
                const { data, error } = await supabase.from(table).insert(payload).select('id').single();
                if (error) {
                    if (error.message?.includes('anexo_url')) {
                        const { anexo_url, ...payloadSem } = payload as any;
                        const { data: d2, error: e2 } = await supabase.from(table).insert(payloadSem).select('id').single();
                        if (e2) throw e2;
                        inserted = d2;
                    } else {
                        throw error;
                    }
                } else {
                    inserted = data;
                }
                if (inserted) await insertRateio(inserted.id, totalAmount);
                showToast.success('Lançamento salvo com sucesso!');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            showToast.error('Erro ao salvar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className={`p-6 border-b border-slate-700 flex justify-between items-center ${type === 'RECEBER' ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type === 'RECEBER' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Nova Conta a {type === 'RECEBER' ? 'Receber' : 'Pagar'}
                            </h2>
                            <p className="text-slate-400 text-sm">Preencha os dados do lançamento financeiro</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition p-2 hover:bg-slate-800 rounded-lg">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Valor, Descrição e Documento */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Valor Total</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Descrição / Histórico</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder={`Ex: ${type === 'RECEBER' ? 'Aluguel Escavadeira' : 'Fatura Cartão / NF Compra'}`}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Nº Documento</label>
                            <input
                                type="text"
                                value={formData.numero_documento}
                                onChange={e => setFormData({ ...formData, numero_documento: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="NF / Fatura"
                            />
                        </div>
                    </div>

                    {/* Parceiro e Datas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">
                                {type === 'RECEBER' ? 'Cliente' : 'Fornecedor'}
                            </label>
                            <select
                                value={formData.partner_id}
                                onChange={e => setFormData({ ...formData, partner_id: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Selecione...</option>
                                {partners.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Data Emissão</label>
                            <input
                                type="date"
                                required
                                value={formData.issue_date}
                                onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Data Vencimento</label>
                            <input
                                type="date"
                                required
                                value={formData.due_date}
                                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Classificação — Plano de Contas */}
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 space-y-4">
                        <div>
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Categoria (Plano de Contas)</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <select
                                    value={formData.chart_account_id}
                                    onChange={e => setFormData({ ...formData, chart_account_id: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Sem categoria...</option>
                                    {chartAccounts.map(c => (
                                        <option key={c.id} value={c.id}>{c.codigo} - {c.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Toggle Centro Único / Rateio */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-slate-400 text-xs uppercase font-bold">Centro de Custo</label>
                                <button
                                    type="button"
                                    onClick={() => setUseRateio(!useRateio)}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                                        useRateio
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                                            : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
                                    }`}
                                >
                                    <PieChart size={12} />
                                    {useRateio ? 'Rateio Ativo' : 'Ratear entre centros'}
                                </button>
                            </div>

                            {!useRateio ? (
                                /* Modo Único */
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <select
                                        value={formData.cost_center_id}
                                        onChange={e => setFormData({ ...formData, cost_center_id: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Geral...</option>
                                        {costCenters.map(cc => (
                                            <option key={cc.id} value={cc.id}>{cc.codigo ? `${cc.codigo} - ` : ''}{cc.nome}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                /* Modo Rateio */
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    {/* Linhas de rateio */}
                                    <div className="space-y-2">
                                        {rateioLines.map((line, idx) => (
                                            <div key={line.id} className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
                                                <span className="text-slate-600 text-xs font-mono w-5 text-center">{idx + 1}</span>

                                                {/* Centro de Custo */}
                                                <select
                                                    value={line.centro_custo_id}
                                                    onChange={e => updateRateioCostCenter(line.id, e.target.value)}
                                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-2 text-white text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                                                >
                                                    <option value="">Selecione o CC...</option>
                                                    {costCenters
                                                        .filter(cc => !rateioLines.some(l => l.id !== line.id && l.centro_custo_id === cc.id))
                                                        .map(cc => (
                                                            <option key={cc.id} value={cc.id}>{cc.codigo ? `${cc.codigo} - ` : ''}{cc.nome}</option>
                                                        ))}
                                                </select>

                                                {/* Percentual */}
                                                <div className="relative w-24">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        max="100"
                                                        value={line.percentual || ''}
                                                        onChange={e => updateRateioPercent(line.id, parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 pl-2 pr-7 text-white text-xs font-bold text-right focus:ring-1 focus:ring-purple-500 outline-none"
                                                        placeholder="0"
                                                    />
                                                    <Percent size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
                                                </div>

                                                {/* Valor */}
                                                <div className="relative w-32">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">R$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={line.valor || ''}
                                                        onChange={e => updateRateioValor(line.id, parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 pl-7 pr-2 text-white text-xs font-bold text-right focus:ring-1 focus:ring-purple-500 outline-none"
                                                        placeholder="0,00"
                                                    />
                                                </div>

                                                {/* Remover */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeRateioLine(line.id)}
                                                    disabled={rateioLines.length <= 2}
                                                    className="p-1.5 text-slate-600 hover:text-red-400 disabled:opacity-20 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Ações e Totalizador */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={addRateioLine}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                <Plus size={12} /> Adicionar Centro
                                            </button>
                                            <button
                                                type="button"
                                                onClick={distribuirRestante}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                <PieChart size={12} /> Distribuir Igual
                                            </button>
                                        </div>

                                        <div className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                                            Math.abs(totalRateioPercent - 100) < 0.5
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                            {totalRateioPercent.toFixed(1)}% = {formatCurrency(totalRateioValor)}
                                            {Math.abs(totalRateioPercent - 100) > 0.5 && (
                                                <span className="ml-2 text-amber-300">
                                                    (faltam {(100 - totalRateioPercent).toFixed(1)}%)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recorrência / Parcelamento */}
                    <div className="space-y-3">
                        <label className="block text-slate-400 text-xs uppercase font-bold">Condição de Pagamento</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-white cursor-pointer bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500 transition">
                                <input
                                    type="radio"
                                    name="recurrence"
                                    value="UNICA"
                                    checked={formData.recurrence === 'UNICA'}
                                    onChange={e => setFormData({ ...formData, recurrence: e.target.value })}
                                />
                                <span>À Vista / Única</span>
                            </label>
                            <label className="flex items-center gap-2 text-white cursor-pointer bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500 transition">
                                <input
                                    type="radio"
                                    name="recurrence"
                                    value="PARCELADO"
                                    checked={formData.recurrence === 'PARCELADO'}
                                    onChange={e => setFormData({ ...formData, recurrence: e.target.value })}
                                />
                                <span>Parcelado</span>
                            </label>
                        </div>

                        {formData.recurrence === 'PARCELADO' && (
                            <div className="flex flex-wrap items-center gap-4 mt-4 animate-in fade-in slide-in-from-top-2 p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                                <div className="flex flex-col gap-1">
                                    <label className="text-blue-200 text-xs uppercase font-bold">Quantidade</label>
                                    <div className="flex items-center gap-2">
                                        <Repeat className="text-blue-400 h-4 w-4" />
                                        <input
                                            type="number"
                                            min="2"
                                            max="60"
                                            value={formData.installments}
                                            onChange={e => setFormData({ ...formData, installments: parseInt(e.target.value) })}
                                            className="w-20 bg-slate-900 border border-blue-500/50 rounded-md py-1 px-2 text-white text-center font-bold outline-none focus:border-blue-400"
                                        />
                                        <span className="text-blue-300 text-sm">x</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-blue-200 text-xs uppercase font-bold">Intervalo (dias)</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="text-blue-400 h-4 w-4" />
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={formData.interval}
                                            onChange={e => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                                            className="w-20 bg-slate-900 border border-blue-500/50 rounded-md py-1 px-2 text-white text-center font-bold outline-none focus:border-blue-400"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 text-right">
                                    <div className="text-blue-200 text-xs uppercase font-bold mb-1">Valor por Parcela</div>
                                    <div className="text-xl font-bold text-white">
                                        {formatCurrency(totalAmount / formData.installments)}
                                    </div>
                                </div>

                                <div className="w-full text-xs text-blue-300/70 border-t border-blue-800/30 pt-2 mt-2">
                                    Primeira parcela em: <strong>{new Date(formData.due_date).toLocaleDateString('pt-BR')}</strong> <br />
                                    Última parcela em: <strong>{new Date(new Date(formData.due_date).getTime() + ((formData.installments - 1) * formData.interval * 86400000)).toLocaleDateString('pt-BR')}</strong>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Anexar Documento */}
                    <div>
                        <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Anexar Documento</label>
                        <div
                            onClick={() => anexoRef.current?.click()}
                            className={`flex items-center gap-3 p-3 rounded-lg border border-dashed cursor-pointer transition-all ${
                                anexoFile
                                    ? 'bg-blue-500/5 border-blue-500/40 hover:bg-blue-500/10'
                                    : 'bg-slate-950 border-slate-700 hover:border-slate-500'
                            }`}
                        >
                            <Paperclip size={18} className={anexoFile ? 'text-blue-400' : 'text-slate-600'} />
                            {anexoFile ? (
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm text-blue-300 font-bold truncate block">{anexoFile.name}</span>
                                    <span className="text-xs text-slate-500">{(anexoFile.size / 1024).toFixed(0)} KB • Clique para trocar</span>
                                </div>
                            ) : (
                                <div className="flex-1">
                                    <span className="text-sm text-slate-500">Clique para anexar PDF, imagem ou planilha</span>
                                </div>
                            )}
                            {anexoFile && (
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); setAnexoFile(null); }}
                                    className="p-1 text-slate-600 hover:text-red-400 transition"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <input
                            ref={anexoRef}
                            type="file"
                            accept=".pdf,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={e => { if (e.target.files?.[0]) setAnexoFile(e.target.files[0]); }}
                            className="hidden"
                        />
                    </div>

                    {/* Observação */}
                    <div>
                        <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Observações</label>
                        <textarea
                            value={formData.observation}
                            onChange={e => setFormData({ ...formData, observation: e.target.value })}
                            rows={2}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Observações adicionais..."
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-between items-center rounded-b-2xl">
                    <div className="text-xs text-slate-500">
                        {useRateio && (
                            <span className="flex items-center gap-1">
                                <PieChart size={12} className="text-purple-400" />
                                Rateio: {rateioLines.length} centros de custo
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg text-slate-300 font-medium hover:bg-slate-700 hover:text-white transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (useRateio && !rateioIsValid)}
                            className={`px-6 py-2.5 rounded-lg text-white font-bold shadow-lg flex items-center gap-2 transform active:scale-95 transition-all
                                ${type === 'RECEBER'
                                    ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20'
                                    : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'}
                                ${loading || (useRateio && !rateioIsValid) ? 'opacity-70 cursor-not-allowed' : ''}
                            `}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Salvando...
                                </span>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Salvar Lançamento
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionFormModal;
