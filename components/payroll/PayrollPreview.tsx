/**
 * PayrollPreview.tsx — Step 2: Preview dos dados parseados com checkboxes
 */

import React, { useState } from 'react';
import { Check, X, Building2, Users, DollarSign, AlertTriangle } from 'lucide-react';
import type { ParsedPayrollRow } from '../../services/payrollXlsxParser';

interface Props {
    rows: ParsedPayrollRow[];
    warnings: string[];
    sections: string[];
    totalBruto: number;
    totalLiquido: number;
    totalIfood: number;
    onConfirm: (selectedRows: ParsedPayrollRow[]) => void;
    onBack: () => void;
    loading?: boolean;
}

const SECTION_LABELS: Record<string, string> = {
    'DOURADAO': 'Douradão Materiais',
    'CONSTRUTERRA': 'Construterra',
    'TRANS_TERRA': 'Transportadora Terra',
};

const SECTION_COLORS: Record<string, string> = {
    'DOURADAO': 'border-blue-600',
    'CONSTRUTERRA': 'border-purple-600',
    'TRANS_TERRA': 'border-[#007a33]',
};

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PayrollPreview: React.FC<Props> = ({
    rows, warnings, sections, totalBruto, totalLiquido, totalIfood,
    onConfirm, onBack, loading
}) => {
    const [selected, setSelected] = useState<Set<number>>(new Set(rows.map((_, i) => i)));

    const toggleRow = (idx: number) => {
        const next = new Set(selected);
        next.has(idx) ? next.delete(idx) : next.add(idx);
        setSelected(next);
    };

    const toggleAll = () => {
        if (selected.size === rows.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(rows.map((_, i) => i)));
        }
    };

    const selectedRows = rows.filter((_, i) => selected.has(i));
    const selectedBruto = selectedRows.reduce((s, r) => s + r.salario_mensal, 0);
    const selectedLiquido = selectedRows.reduce((s, r) => s + r.salario_liquido, 0);
    const selectedIfood = selectedRows.reduce((s, r) => s + r.ifood_valor, 0);

    const groupedBySection = sections.map(section => ({
        section,
        label: SECTION_LABELS[section] || section,
        color: SECTION_COLORS[section] || 'border-slate-600',
        rows: rows.map((r, i) => ({ ...r, originalIndex: i })).filter(r => r.company_section === section),
    }));

    return (
        <div className="space-y-6">
            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} className="text-amber-400" />
                        <span className="text-amber-200 text-sm font-bold">{warnings.length} aviso(s)</span>
                    </div>
                    <ul className="text-amber-300/70 text-xs space-y-1">
                        {warnings.slice(0, 5).map((w, i) => <li key={i}>• {w}</li>)}
                        {warnings.length > 5 && <li>... e mais {warnings.length - 5}</li>}
                    </ul>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-slate-500 text-xs flex items-center gap-1"><Users size={14} /> Funcionários</div>
                    <div className="text-2xl font-black text-white mt-1">{selectedRows.length}<span className="text-slate-600 text-sm">/{rows.length}</span></div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-slate-500 text-xs flex items-center gap-1"><DollarSign size={14} /> Bruto</div>
                    <div className="text-lg font-black text-white mt-1">{fmt(selectedBruto)}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-slate-500 text-xs flex items-center gap-1"><DollarSign size={14} /> Líquido</div>
                    <div className="text-lg font-black text-[#007a33] mt-1">{fmt(selectedLiquido)}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-slate-500 text-xs flex items-center gap-1"><DollarSign size={14} /> iFood</div>
                    <div className="text-lg font-black text-orange-400 mt-1">{fmt(selectedIfood)}</div>
                </div>
            </div>

            {/* Tables by section */}
            {groupedBySection.map(({ section, label, color, rows: sectionRows }) => (
                <div key={section} className={`bg-slate-900 border-l-4 ${color} rounded-xl overflow-hidden`}>
                    <div className="px-4 py-3 bg-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-slate-400" />
                            <span className="text-white font-bold text-sm">{label}</span>
                            <span className="text-slate-500 text-xs">({sectionRows.length} funcionários)</span>
                        </div>
                        <span className="text-slate-400 text-xs">
                            Líquido: {fmt(sectionRows.filter(r => selected.has(r.originalIndex)).reduce((s, r) => s + r.salario_liquido, 0))}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-slate-500 border-b border-slate-800">
                                    <th className="px-3 py-2 text-left w-8">
                                        <input
                                            type="checkbox"
                                            checked={sectionRows.every(r => selected.has(r.originalIndex))}
                                            onChange={toggleAll}
                                            className="accent-[#007a33]"
                                        />
                                    </th>
                                    <th className="px-2 py-2 text-left">Nome</th>
                                    <th className="px-2 py-2 text-right">Bruto</th>
                                    <th className="px-2 py-2 text-right">Adiant.</th>
                                    <th className="px-2 py-2 text-right">Loja</th>
                                    <th className="px-2 py-2 text-right">Cooper.</th>
                                    <th className="px-2 py-2 text-right">Marm.</th>
                                    <th className="px-2 py-2 text-right font-bold">Líquido</th>
                                    <th className="px-2 py-2 text-left">Pgto</th>
                                    <th className="px-2 py-2 text-right">iFood</th>
                                    <th className="px-2 py-2 text-left">Obs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sectionRows.map(row => {
                                    const isSelected = selected.has(row.originalIndex);
                                    const isZero = row.salario_mensal === 0 && row.salario_liquido === 0;
                                    return (
                                        <tr
                                            key={row.originalIndex}
                                            className={`border-b border-slate-800/50 ${
                                                isZero ? 'opacity-40' : ''
                                            } ${isSelected ? '' : 'opacity-30'} hover:bg-slate-800/30`}
                                        >
                                            <td className="px-3 py-1.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleRow(row.originalIndex)}
                                                    className="accent-[#007a33]"
                                                />
                                            </td>
                                            <td className="px-2 py-1.5 text-white font-medium whitespace-nowrap">
                                                {row.employee_name}
                                                {row.employee_code && (
                                                    <span className="text-slate-600 ml-1">#{row.employee_code}</span>
                                                )}
                                            </td>
                                            <td className="px-2 py-1.5 text-right text-slate-300">{row.salario_mensal > 0 ? fmt(row.salario_mensal) : '-'}</td>
                                            <td className="px-2 py-1.5 text-right text-red-400">{row.adiantamento > 0 ? fmt(row.adiantamento) : '-'}</td>
                                            <td className="px-2 py-1.5 text-right text-red-400/70">{row.gastos_loja > 0 ? fmt(row.gastos_loja) : '-'}</td>
                                            <td className="px-2 py-1.5 text-right text-red-400/70">{row.coopercred_uniodonto > 0 ? fmt(row.coopercred_uniodonto) : '-'}</td>
                                            <td className="px-2 py-1.5 text-right text-red-400/70">{row.marmita_outros > 0 ? fmt(row.marmita_outros) : '-'}</td>
                                            <td className="px-2 py-1.5 text-right text-[#007a33] font-bold">{row.salario_liquido > 0 ? fmt(row.salario_liquido) : '-'}</td>
                                            <td className="px-2 py-1.5 text-slate-400 whitespace-nowrap text-[10px]">{row.forma_pagamento || '-'}</td>
                                            <td className="px-2 py-1.5 text-right text-orange-400">{row.ifood_valor > 0 ? fmt(row.ifood_valor) : '-'}</td>
                                            <td className="px-2 py-1.5 text-slate-500 max-w-[120px] truncate">{row.observacoes || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {/* Actions */}
            <div className="flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                >
                    Voltar
                </button>
                <button
                    onClick={() => onConfirm(selectedRows)}
                    disabled={selectedRows.length === 0 || loading}
                    className="px-6 py-3 bg-[#007a33] hover:bg-[#009a40] text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                        <Check size={18} />
                    )}
                    Confirmar Importação ({selectedRows.length} funcionários)
                </button>
            </div>
        </div>
    );
};

export default PayrollPreview;
