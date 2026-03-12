/**
 * PayrollGenerate.tsx — Step 5: Configuração e geração de contas a pagar
 */

import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, CheckCircle, Building2, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { payrollService, FolhaItem, GerarContasConfig } from '../../services/payrollService';
import toast from 'react-hot-toast';

interface Props {
    folhaId: string;
    ano: number;
    mes: number;
    itens: FolhaItem[];
    onDone: () => void;
    onBack: () => void;
}

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PayrollGenerate: React.FC<Props> = ({ folhaId, ano, mes, itens, onDone, onBack }) => {
    const [centrosCusto, setCentrosCusto] = useState<any[]>([]);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<{ contasSalario: number; contasIfood: number; errors: string[] } | null>(null);

    // Config defaults
    const hoje = new Date().toISOString().split('T')[0];
    const proximoMes = new Date(ano, mes, 5); // dia 5 do mês seguinte
    const vencSalario = proximoMes.toISOString().split('T')[0];

    const [config, setConfig] = useState<GerarContasConfig>({
        data_emissao: hoje,
        data_vencimento_salario: vencSalario,
        data_vencimento_ifood: hoje,
        centro_custo_id: '',
    });

    useEffect(() => {
        loadCentrosCusto();
    }, []);

    const loadCentrosCusto = async () => {
        const { data } = await supabase
            .from('centros_custo')
            .select('id, nome, codigo')
            .eq('ativo', true)
            .order('codigo');

        setCentrosCusto(data || []);

        // Auto-selecionar "Salários" (código 6.01)
        const salarioCC = (data || []).find(cc => cc.codigo === '6.01');
        if (salarioCC) {
            setConfig(prev => ({ ...prev, centro_custo_id: salarioCC.id }));
        }
    };

    const elegiveis = itens.filter(i => i.incluir && (i.match_status === 'MATCHED' || i.match_status === 'MANUAL'));
    const comSalario = elegiveis.filter(i => i.salario_liquido > 0);
    const comIfood = elegiveis.filter(i => i.ifood_valor > 0);
    const totalSalario = comSalario.reduce((s, i) => s + i.salario_liquido, 0);
    const totalIfood = comIfood.reduce((s, i) => s + i.ifood_valor, 0);

    const handleGenerate = async () => {
        if (!config.centro_custo_id) {
            toast.error('Selecione um Centro de Custo');
            return;
        }

        setGenerating(true);
        try {
            const res = await payrollService.gerarContasPagar(folhaId, config);
            setResult(res);

            if (res.errors.length > 0) {
                toast.error(`Gerado com ${res.errors.length} erro(s)`);
            } else {
                toast.success(`${res.contasSalario} salários + ${res.contasIfood} iFood gerados!`);
            }
        } catch (err: any) {
            toast.error(`Erro: ${err.message}`);
        } finally {
            setGenerating(false);
        }
    };

    // Resultado final
    if (result) {
        return (
            <div className="space-y-6">
                <div className="bg-slate-900 border border-[#007a33]/50 rounded-xl p-8 text-center">
                    <CheckCircle size={48} className="text-[#007a33] mx-auto mb-4" />
                    <h3 className="text-white font-bold text-xl mb-2">Contas a Pagar Geradas!</h3>
                    <p className="text-slate-400 text-sm mb-6">
                        Competência {MESES[mes - 1]}/{ano}
                    </p>

                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                        <div className="bg-slate-800 rounded-xl p-4">
                            <div className="text-[#007a33] text-2xl font-black">{result.contasSalario}</div>
                            <div className="text-slate-500 text-xs">Contas Salário</div>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-4">
                            <div className="text-orange-400 text-2xl font-black">{result.contasIfood}</div>
                            <div className="text-slate-500 text-xs">Contas iFood</div>
                        </div>
                    </div>

                    {result.errors.length > 0 && (
                        <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3 text-left mb-4 max-w-lg mx-auto">
                            <p className="text-red-300 text-xs font-bold mb-1">Erros ({result.errors.length}):</p>
                            {result.errors.map((e, i) => (
                                <p key={i} className="text-red-400/70 text-xs">• {e}</p>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={onDone}
                        className="px-6 py-3 bg-[#007a33] hover:bg-[#009a40] text-white font-bold rounded-xl"
                    >
                        Concluído
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Resumo */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-white font-bold flex items-center gap-2 mb-4">
                    <FileText size={18} className="text-[#007a33]" />
                    Resumo da Geração — {MESES[mes - 1]}/{ano}
                </h3>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-slate-500 text-xs uppercase tracking-wider mb-2">Salários</h4>
                        <div className="text-2xl font-black text-[#007a33]">{fmt(totalSalario)}</div>
                        <div className="text-slate-500 text-xs mt-1">{comSalario.length} contas a gerar</div>
                    </div>
                    <div>
                        <h4 className="text-slate-500 text-xs uppercase tracking-wider mb-2">iFood</h4>
                        <div className="text-2xl font-black text-orange-400">{fmt(totalIfood)}</div>
                        <div className="text-slate-500 text-xs mt-1">{comIfood.length} contas a gerar</div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Total Geral</span>
                        <span className="text-white font-black text-lg">{fmt(totalSalario + totalIfood)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span className="text-slate-600">Total de contas a pagar</span>
                        <span className="text-slate-400">{comSalario.length + comIfood.length}</span>
                    </div>
                </div>
            </div>

            {/* Configuração */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-white font-bold text-sm mb-4">Configuração</h3>

                <div className="grid grid-cols-2 gap-4">
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
                            {centrosCusto.map(cc => (
                                <option key={cc.id} value={cc.id}>
                                    {cc.codigo} - {cc.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
                <button onClick={onBack} className="px-4 py-2 text-slate-400 hover:text-white text-sm flex items-center gap-1">
                    <ArrowLeft size={16} /> Voltar
                </button>
                <button
                    onClick={handleGenerate}
                    disabled={generating || !config.centro_custo_id}
                    className="px-8 py-3 bg-[#007a33] hover:bg-[#009a40] text-white font-bold rounded-xl flex items-center gap-2 text-lg disabled:opacity-50"
                >
                    {generating ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Gerando...
                        </>
                    ) : (
                        <>
                            <DollarSign size={20} />
                            Gerar {comSalario.length + comIfood.length} Contas a Pagar
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PayrollGenerate;
