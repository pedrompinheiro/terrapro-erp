/**
 * PayrollUpload.tsx — Step 1: Upload XLSX + seleção de competência
 */

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Calendar, AlertTriangle } from 'lucide-react';
import { parsePayrollXlsx, ParseResult } from '../../services/payrollXlsxParser';

interface Props {
    onParsed: (result: ParseResult, file: File, ano: number, mes: number) => void;
    existingFolha?: { id: string; status: string } | null;
    onViewExisting?: () => void;
    onReimport?: () => void;
}

const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const PayrollUpload: React.FC<Props> = ({ onParsed, existingFolha, onViewExisting, onReimport }) => {
    const now = new Date();
    const [mes, setMes] = useState(now.getMonth()); // mês anterior como padrão
    const [ano, setAno] = useState(now.getFullYear());
    const [dragOver, setDragOver] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            setError('Formato inválido. Envie um arquivo .xlsx ou .xls');
            return;
        }

        setParsing(true);
        setError(null);

        try {
            const buffer = await file.arrayBuffer();
            const result = parsePayrollXlsx(buffer);

            if (result.rows.length === 0) {
                setError('Nenhum dado encontrado na planilha. Verifique se o formato está correto.');
                setParsing(false);
                return;
            }

            onParsed(result, file, ano, mes + 1);
        } catch (err: any) {
            setError(`Erro ao ler planilha: ${err.message}`);
        } finally {
            setParsing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    return (
        <div className="space-y-6">
            {/* Seletor de Competência */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-white font-bold flex items-center gap-2 mb-4">
                    <Calendar size={18} className="text-[#007a33]" />
                    Competência
                </h3>
                <div className="flex gap-4">
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Mês</label>
                        <select
                            value={mes}
                            onChange={e => setMes(Number(e.target.value))}
                            className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            {MESES.map((m, i) => (
                                <option key={i} value={i}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Ano</label>
                        <select
                            value={ano}
                            onChange={e => setAno(Number(e.target.value))}
                            className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            {[2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Aviso de folha existente */}
            {existingFolha && (
                <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={20} className="text-amber-400" />
                        <span className="text-amber-200 text-sm">
                            Já existe uma folha para {MESES[mes]}/{ano} (Status: <strong>{existingFolha.status}</strong>)
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onViewExisting}
                            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded-lg"
                        >
                            Ver Existente
                        </button>
                        {existingFolha.status === 'RASCUNHO' && (
                            <button
                                onClick={onReimport}
                                className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-lg"
                            >
                                Reimportar
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                    dragOver
                        ? 'border-[#007a33] bg-[#007a33]/10'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
                } ${parsing ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                />

                {parsing ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin w-10 h-10 border-2 border-[#007a33] border-t-transparent rounded-full" />
                        <p className="text-slate-400 text-sm">Lendo planilha...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center">
                            <FileSpreadsheet size={32} className="text-[#007a33]" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg">Arraste a planilha de folha aqui</p>
                            <p className="text-slate-500 text-sm mt-1">ou clique para selecionar • Formato: .xlsx</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                            <Upload size={14} />
                            <span>Suporta: DOURADÃO • CONSTRUTERRA • TRANS TERRA</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Erro */}
            {error && (
                <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3 text-red-300 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default PayrollUpload;
