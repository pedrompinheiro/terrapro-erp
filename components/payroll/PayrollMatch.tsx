/**
 * PayrollMatch.tsx — Step 3: Matching de funcionários (automático + manual)
 */

import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Search, RefreshCw, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { payrollService, FolhaItem } from '../../services/payrollService';
import toast from 'react-hot-toast';

interface Props {
    folhaId: string;
    itens: FolhaItem[];
    onRefresh: () => void;
    onNext: () => void;
    onBack: () => void;
}

const MATCH_COLORS: Record<string, string> = {
    'MATCHED': 'text-green-400',
    'MANUAL': 'text-amber-400',
    'NAO_ENCONTRADO': 'text-red-400',
    'PENDENTE': 'text-slate-500',
};

const MATCH_LABELS: Record<string, string> = {
    'MATCHED': 'Encontrado',
    'MANUAL': 'Revisar',
    'NAO_ENCONTRADO': 'Não encontrado',
    'PENDENTE': 'Pendente',
};

const PayrollMatch: React.FC<Props> = ({ folhaId, itens, onRefresh, onNext, onBack }) => {
    const [running, setRunning] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [searchItem, setSearchItem] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        const { data } = await supabase
            .from('employees')
            .select('id, name, registration_number, company_id, active')
            .eq('active', true)
            .order('name');
        setEmployees(data || []);
    };

    const runAutoMatch = async () => {
        setRunning(true);
        try {
            const result = await payrollService.matchEmployees(folhaId);
            toast.success(`Match: ${result.matched} encontrados, ${result.unmatched} pendentes`);
            onRefresh();
        } catch (err: any) {
            toast.error(`Erro no matching: ${err.message}`);
        } finally {
            setRunning(false);
        }
    };

    const handleManualMatch = async (itemId: string, employeeId: string) => {
        try {
            await payrollService.updateItemMatch(itemId, employeeId);
            toast.success('Match manual salvo');
            setSearchItem(null);
            onRefresh();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const matched = itens.filter(i => i.match_status === 'MATCHED').length;
    const manual = itens.filter(i => i.match_status === 'MANUAL').length;
    const notFound = itens.filter(i => i.match_status === 'NAO_ENCONTRADO').length;
    const pending = itens.filter(i => i.match_status === 'PENDENTE').length;

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.registration_number && e.registration_number.includes(searchTerm))
    );

    return (
        <div className="space-y-6">
            {/* Stats + Botão Match */}
            <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                    <span className="text-green-400 font-bold">{matched} encontrados</span>
                    <span className="text-amber-400 font-bold">{manual} revisar</span>
                    <span className="text-red-400 font-bold">{notFound} não encontrados</span>
                    {pending > 0 && <span className="text-slate-500">{pending} pendentes</span>}
                </div>
                <button
                    onClick={runAutoMatch}
                    disabled={running}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-2 text-sm disabled:opacity-50"
                >
                    {running ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                        <RefreshCw size={16} />
                    )}
                    {pending > 0 ? 'Executar Match Automático' : 'Re-executar Match'}
                </button>
            </div>

            {/* Tabela de matching */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-slate-500 border-b border-slate-800 bg-slate-800/50">
                            <th className="px-4 py-2.5 text-left">Planilha</th>
                            <th className="px-4 py-2.5 text-left">Empresa</th>
                            <th className="px-4 py-2.5 text-center">Score</th>
                            <th className="px-4 py-2.5 text-left">Funcionário Encontrado</th>
                            <th className="px-4 py-2.5 text-center">Status</th>
                            <th className="px-4 py-2.5 text-center">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itens.map(item => {
                            const matchedEmp = item.employee_id
                                ? employees.find(e => e.id === item.employee_id)
                                : null;

                            return (
                                <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                    <td className="px-4 py-2 text-white font-medium">
                                        {item.employee_name}
                                        {item.employee_code && (
                                            <span className="text-slate-600 ml-1">#{item.employee_code}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-slate-400">{item.company_section}</td>
                                    <td className="px-4 py-2 text-center">
                                        {item.match_score !== null && item.match_score !== undefined ? (
                                            <span className={`font-bold ${
                                                item.match_score >= 80 ? 'text-green-400' :
                                                item.match_score >= 60 ? 'text-amber-400' : 'text-red-400'
                                            }`}>
                                                {item.match_score}%
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {matchedEmp ? (
                                            <span className="text-green-300">
                                                {matchedEmp.name}
                                                {matchedEmp.registration_number && (
                                                    <span className="text-slate-500 ml-1">#{matchedEmp.registration_number}</span>
                                                )}
                                            </span>
                                        ) : (
                                            <span className="text-slate-600 italic">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`font-bold ${MATCH_COLORS[item.match_status]}`}>
                                            {MATCH_LABELS[item.match_status]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {(item.match_status === 'NAO_ENCONTRADO' || item.match_status === 'MANUAL') && (
                                            <button
                                                onClick={() => {
                                                    setSearchItem(item.id!);
                                                    setSearchTerm(item.employee_name.split(' ')[0]);
                                                }}
                                                className="text-blue-400 hover:text-blue-300 text-[10px] font-bold"
                                            >
                                                <Search size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal de busca manual */}
            {searchItem && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSearchItem(null)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-800">
                            <h3 className="text-white font-bold text-sm mb-2">Selecionar Funcionário</h3>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nome ou código..."
                                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm"
                                autoFocus
                            />
                        </div>
                        <div className="overflow-y-auto flex-1 p-2">
                            {filteredEmployees.slice(0, 20).map(emp => (
                                <button
                                    key={emp.id}
                                    onClick={() => handleManualMatch(searchItem, emp.id)}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-lg text-sm text-white flex items-center justify-between"
                                >
                                    <span>
                                        {emp.name}
                                        {emp.registration_number && (
                                            <span className="text-slate-500 ml-2">#{emp.registration_number}</span>
                                        )}
                                    </span>
                                    <UserCheck size={14} className="text-green-400" />
                                </button>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <p className="text-slate-600 text-sm text-center py-4">Nenhum funcionário encontrado</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
                <button onClick={onBack} className="px-4 py-2 text-slate-400 hover:text-white text-sm">
                    Voltar
                </button>
                <button
                    onClick={onNext}
                    disabled={pending > 0}
                    className="px-6 py-3 bg-[#007a33] hover:bg-[#009a40] text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                    Conferir com Ponto <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default PayrollMatch;
