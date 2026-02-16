import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign, FileText, Repeat, Tag, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';

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
        recurrence: 'UNICA', // UNICA, MENSAL, PARCELADO
        installments: 1,
        interval: 30, // Default 30 dias
        cost_center_id: '',
        chart_account_id: '',
        observation: ''
    });

    // Load auxiliary data
    useEffect(() => {
        if (isOpen) {
            loadDependencies();
        }
    }, [isOpen]);

    const loadDependencies = async () => {
        try {
            // Carregar Parceiros (Clientes ou Fornecedores)
            // Ajuste: Buscamos todos e filtramos aqui para garantir
            const { data: entities } = await supabase
                .from('entities')
                .select('id, name, type')
                .order('name');

            if (entities) {
                // Filtragem robusta: Verifica se o type contém a string (ex: 'CLIENT', 'Customer', etc)
                const targetType = type === 'RECEBER' ? ['client', 'customer'] : ['supplier', 'vendor', 'provider'];

                const filtered = entities.filter(e => {
                    const t = (e.type || '').toLowerCase();
                    return targetType.some(target => t.includes(target));
                });

                // Se filtro falhar (ex: tipos vazios), mostra todos como fallback para não travar
                setPartners(filtered.length > 0 ? filtered : entities);
            }

            // Carregar Centros de Custo
            const { data: costs } = await supabase
                .from('centros_custo')
                .select('id, nome, codigo')
                .eq('ativo', true);

            if (costs) setCostCenters(costs);

            // Carregar Plano de Contas
            const { data: accounts } = await supabase
                .from('plano_contas')
                .select('id, nome, codigo, tipo')
                .eq('tipo', type === 'RECEBER' ? 'RECEITA' : 'DESPESA');

            if (accounts) setChartAccounts(accounts);

        } catch (error) {
            console.error('Erro ao carregar dependências', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const table = type === 'RECEBER' ? 'contas_receber' : 'contas_pagar';
            const fieldPartner = type === 'RECEBER' ? 'cliente_id' : 'fornecedor_id';
            const fieldPartnerName = type === 'RECEBER' ? 'cliente_nome' : 'fornecedor_nome';

            const partner = partners.find(p => p.id === formData.partner_id);

            // Payload base
            const payload = {
                [fieldPartner]: formData.partner_id,
                [fieldPartnerName]: partner?.name || 'Desconhecido',
                descricao: formData.description,
                valor_original: parseFloat(formData.amount),
                data_emissao: formData.issue_date,
                data_vencimento: formData.due_date,
                centro_custo_id: formData.cost_center_id || null,
                plano_contas_id: formData.chart_account_id || null,
                observacao: formData.observation,
                status: 'PENDENTE',
                numero_titulo: `${type === 'RECEBER' ? 'REC' : 'PAG'}-${Date.now()}` // Gerador simples
            };

            if (formData.recurrence === 'PARCELADO' && formData.installments > 1) {
                const valorParcela = parseFloat(formData.amount) / formData.installments;

                for (let i = 0; i < formData.installments; i++) {
                    // Cria nova data baseada na data de vencimento inicial
                    const dataBase = new Date(formData.due_date);
                    // Adiciona (i * intervalo) dias
                    // Ex: i=0 -> +0 dias (Data Inicial)
                    // Ex: i=1 -> +30 dias (Se intervalo for 30)
                    dataBase.setDate(dataBase.getDate() + (i * formData.interval));

                    await supabase.from(table).insert({
                        ...payload,
                        numero_titulo: `${payload.numero_titulo}-${i + 1}/${formData.installments}`,
                        descricao: `${payload.descricao} (${i + 1}/${formData.installments})`,
                        valor_original: valorParcela,
                        data_vencimento: dataBase.toISOString().split('T')[0]
                    });
                }
                showToast.success(`${formData.installments} parcelas geradas com sucesso!`);
            } else {
                // Lançamento Único
                const { error } = await supabase.from(table).insert(payload);
                if (error) throw error;
                showToast.success('Lançamento salvo com sucesso!');
            }

            onSuccess();
            onClose();
            // Reset form (opcional)
        } catch (error: any) {
            console.error(error);
            showToast.error('Erro ao salvar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

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

                    {/* Valor e Descrição (Destaque) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                    placeholder={`Ex: ${type === 'RECEBER' ? 'Aluguel Escavadeira' : 'Compra Peças'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Parceiro e Datas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">
                                {type === 'RECEBER' ? 'Cliente' : 'Fornecedor'}
                            </label>
                            <select
                                required
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
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Data Vencimento (1ª Parc)</label>
                            <input
                                type="date"
                                required
                                value={formData.due_date}
                                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Classificação */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                        <div>
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Categoria (Plano de Contas)</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <select
                                    value={formData.chart_account_id}
                                    onChange={e => setFormData({ ...formData, chart_account_id: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Sem categoria...</option>
                                    {chartAccounts.map(c => (
                                        <option key={c.id} value={c.id}>{c.codigo} - {c.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Centro de Custo</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <select
                                    value={formData.cost_center_id}
                                    onChange={e => setFormData({ ...formData, cost_center_id: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Geral...</option>
                                    {costCenters.map(cc => (
                                        <option key={cc.id} value={cc.id}>{cc.nome}</option>
                                    ))}
                                </select>
                            </div>
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

                                {/* Parcelas */}
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

                                {/* Intervalo */}
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

                                {/* Resumo */}
                                <div className="flex-1 text-right">
                                    <div className="text-blue-200 text-xs uppercase font-bold mb-1">Valor por Parcela</div>
                                    <div className="text-xl font-bold text-white">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.amount || '0') / formData.installments)}
                                    </div>
                                </div>

                                <div className="w-full text-xs text-blue-300/70 border-t border-blue-800/30 pt-2 mt-2">
                                    Primeira parcela em: <strong>{new Date(formData.due_date).toLocaleDateString()}</strong> <br />
                                    Última parcela em: <strong>{new Date(new Date(formData.due_date).getTime() + ((formData.installments - 1) * formData.interval * 86400000)).toLocaleDateString()}</strong>
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-slate-300 font-medium hover:bg-slate-700 hover:text-white transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`px-6 py-2.5 rounded-lg text-white font-bold shadow-lg flex items-center gap-2 transform active:scale-95 transition-all
              ${type === 'RECEBER'
                                ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20'
                                : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'}
              ${loading ? 'opacity-70 cursor-not-allowed' : ''}
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
    );
};

export default TransactionFormModal;
