/**
 * PayrollCrossRef.tsx — Step 4: Conferência cruzada com cálculo de ponto
 */

import React, { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { payrollService, FolhaItem } from '../../services/payrollService';
import toast from 'react-hot-toast';

interface Props {
    folhaId: string;
    ano: number;
    mes: number;
    itens: FolhaItem[];
    onRefresh: () => void;
    onNext: () => void;
    onBack: () => void;
}

function minutesToHHMM(min: number | null | undefined): string {
    if (!min) return '00:00';
    const h = Math.floor(Math.abs(min) / 60);
    const m = Math.abs(min) % 60;
    const sign = min < 0 ? '-' : '';
    return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const PayrollCrossRef: React.FC<Props> = ({ folhaId, ano, mes, itens, onRefresh, onNext, onBack }) => {
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<{ total: number; comPonto: number; discrepancias: number } | null>(null);

    const matchedItens = itens.filter(i => i.employee_id && (i.match_status === 'MATCHED' || i.match_status === 'MANUAL'));
    const itensComPonto = matchedItens.filter(i => i.tc_total_worked_min !== null && i.tc_total_worked_min !== undefined);
    const itensSemPonto = matchedItens.filter(i => i.tc_total_worked_min === null || i.tc_total_worked_min === undefined);
    const discrepancias = matchedItens.filter(i => i.discrepancia_flag);

    const runCrossRef = async () => {
        setRunning(true);
        try {
            const res = await payrollService.crossReferenceTimecard(folhaId, ano, mes);
            setResult(res);
            toast.success(`Conferência: ${res.comPonto} com ponto, ${res.discrepancias} discrepâncias`);
            onRefresh();
        } catch (err: any) {
            toast.error(`Erro na conferência: ${err.message}`);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Clock size={18} className="text-[#007a33]" />
                        Conferência com Ponto — {MESES[mes - 1]}/{ano}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">
                        Cruza dados da planilha com o cálculo de ponto do mesmo período
                    </p>
                </div>
                <button
                    onClick={runCrossRef}
                    disabled={running}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-2 text-sm disabled:opacity-50"
                >
                    {running ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                        <RefreshCw size={16} />
                    )}
                    {itensComPonto.length > 0 ? 'Re-conferir' : 'Executar Conferência'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-slate-500 text-xs">Com ponto calculado</div>
                    <div className="text-2xl font-black text-green-400 mt-1">{itensComPonto.length}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-slate-500 text-xs">Sem ponto</div>
                    <div className="text-2xl font-black text-slate-500 mt-1">{itensSemPonto.length}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-slate-500 text-xs">Discrepâncias</div>
                    <div className={`text-2xl font-black mt-1 ${discrepancias.length > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                        {discrepancias.length}
                    </div>
                </div>
            </div>

            {/* Tabela de conferência */}
            {itensComPonto.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-800/50">
                        <span className="text-white font-bold text-sm">Comparação Planilha vs Ponto</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-slate-500 border-b border-slate-800">
                                    <th className="px-3 py-2 text-left">Funcionário</th>
                                    <th className="px-3 py-2 text-center" colSpan={2}>HE 50%</th>
                                    <th className="px-3 py-2 text-center" colSpan={2}>HE 100%</th>
                                    <th className="px-3 py-2 text-center">Trabalhado</th>
                                    <th className="px-3 py-2 text-center">Faltas</th>
                                    <th className="px-3 py-2 text-center">Saldo</th>
                                    <th className="px-3 py-2 text-center">Status</th>
                                </tr>
                                <tr className="text-slate-600 border-b border-slate-800 text-[10px]">
                                    <th></th>
                                    <th className="px-1 py-1">Ponto</th>
                                    <th className="px-1 py-1">Planilha</th>
                                    <th className="px-1 py-1">Ponto</th>
                                    <th className="px-1 py-1">Planilha</th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {matchedItens.map(item => {
                                    const hasPonto = item.tc_total_worked_min !== null && item.tc_total_worked_min !== undefined;
                                    return (
                                        <tr
                                            key={item.id}
                                            className={`border-b border-slate-800/50 hover:bg-slate-800/30 ${
                                                item.discrepancia_flag ? 'bg-amber-950/20' : ''
                                            }`}
                                        >
                                            <td className="px-3 py-2 text-white font-medium whitespace-nowrap">
                                                {item.employee_name}
                                            </td>
                                            <td className="px-2 py-2 text-center text-blue-300">
                                                {hasPonto ? minutesToHHMM(item.tc_overtime_50_min) : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center text-slate-400">
                                                {item.planilha_menciona_he ? 'H.E.' : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center text-purple-300">
                                                {hasPonto ? minutesToHHMM(item.tc_overtime_100_min) : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center text-slate-400">-</td>
                                            <td className="px-2 py-2 text-center text-slate-300">
                                                {hasPonto ? minutesToHHMM(item.tc_total_worked_min) : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center text-red-400">
                                                {hasPonto && (item.tc_absence_min || 0) > 0
                                                    ? minutesToHHMM(item.tc_absence_min)
                                                    : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                {hasPonto ? (
                                                    <span className={`font-bold ${
                                                        (item.tc_balance_min || 0) > 0 ? 'text-green-400' :
                                                        (item.tc_balance_min || 0) < 0 ? 'text-red-400' : 'text-slate-400'
                                                    }`}>
                                                        {minutesToHHMM(item.tc_balance_min)}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                {!hasPonto ? (
                                                    <span className="text-slate-600 text-[10px]">S/ ponto</span>
                                                ) : item.discrepancia_flag ? (
                                                    <span className="text-amber-400" title={item.discrepancia_notas || ''}>
                                                        <AlertTriangle size={14} />
                                                    </span>
                                                ) : (
                                                    <span className="text-green-400">
                                                        <CheckCircle size={14} />
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Discrepâncias detalhadas */}
            {discrepancias.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-800/50 rounded-xl p-4">
                    <h4 className="text-amber-200 font-bold text-sm flex items-center gap-2 mb-3">
                        <AlertTriangle size={16} />
                        Discrepâncias Encontradas
                    </h4>
                    <div className="space-y-2">
                        {discrepancias.map(item => (
                            <div key={item.id} className="text-xs">
                                <span className="text-amber-300 font-bold">{item.employee_name}:</span>{' '}
                                <span className="text-amber-200/70">{item.discrepancia_notas}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info se não rodou ainda */}
            {itensComPonto.length === 0 && !running && (
                <div className="text-center py-8 text-slate-600">
                    <Clock size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Clique em "Executar Conferência" para cruzar com os dados de ponto</p>
                    <p className="text-xs mt-1">Funcionários sem ponto calculado serão exibidos como "S/ ponto"</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
                <button onClick={onBack} className="px-4 py-2 text-slate-400 hover:text-white text-sm">
                    Voltar
                </button>
                <button
                    onClick={onNext}
                    className="px-6 py-3 bg-[#007a33] hover:bg-[#009a40] text-white font-bold rounded-xl flex items-center gap-2"
                >
                    Gerar Contas a Pagar <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default PayrollCrossRef;
