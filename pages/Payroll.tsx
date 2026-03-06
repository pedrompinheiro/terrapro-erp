/**
 * Payroll.tsx — Módulo Folha de Pagamento
 *
 * Fluxo: Upload XLSX → Preview → Planilha Editável (match + ponto + gerar contas)
 */

import React, { useState, useEffect } from 'react';
import { DollarSign, Upload, Eye, Pencil, ChevronRight, History } from 'lucide-react';
import toast from 'react-hot-toast';

import PayrollUpload from '../components/payroll/PayrollUpload';
import PayrollPreview from '../components/payroll/PayrollPreview';
import PayrollEditor from '../components/payroll/PayrollEditor';

import { payrollService, FolhaPagamento, FolhaItem } from '../services/payrollService';
import type { ParseResult, ParsedPayrollRow } from '../services/payrollXlsxParser';

const STEPS = [
    { id: 1, label: 'Upload', icon: Upload },
    { id: 2, label: 'Preview', icon: Eye },
    { id: 3, label: 'Planilha', icon: Pencil },
];

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const Payroll: React.FC = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Dados do wizard
    const [ano, setAno] = useState(new Date().getFullYear());
    const [mes, setMes] = useState(new Date().getMonth()); // 0-indexed no state, 1-indexed no banco
    const [parseResult, setParseResult] = useState<ParseResult | null>(null);
    const [folhaId, setFolhaId] = useState<string | null>(null);
    const [folha, setFolha] = useState<FolhaPagamento | null>(null);
    const [itens, setItens] = useState<FolhaItem[]>([]);
    const [existingFolha, setExistingFolha] = useState<{ id: string; status: string } | null>(null);

    // Histórico
    const [folhas, setFolhas] = useState<FolhaPagamento[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    // Checar folha existente quando muda mês/ano
    useEffect(() => {
        checkExisting();
    }, [ano, mes]);

    const loadHistory = async () => {
        try {
            const data = await payrollService.listar();
            setFolhas(data);
        } catch { /* ignore */ }
    };

    const checkExisting = async () => {
        try {
            const result = await payrollService.buscarPorCompetencia(ano, mes + 1);
            if (result) {
                setExistingFolha({ id: result.folha.id!, status: result.folha.status });
            } else {
                setExistingFolha(null);
            }
        } catch {
            setExistingFolha(null);
        }
    };

    const refreshItens = async () => {
        if (!folhaId) return;
        try {
            const result = await payrollService.buscarPorCompetencia(ano, mes + 1);
            if (result) {
                setFolha(result.folha);
                setItens(result.itens);
            }
        } catch { /* ignore */ }
    };

    // Step 1 → Step 2: Upload feito
    const handleParsed = (result: ParseResult, file: File, parsedAno: number, parsedMes: number) => {
        setParseResult(result);
        setAno(parsedAno);
        setMes(parsedMes - 1);
        setStep(2);
    };

    // Step 2 → Step 3: Confirmou importação → Vai pro editor
    const handleConfirmImport = async (selectedRows: ParsedPayrollRow[]) => {
        setLoading(true);
        try {
            // Criar ou usar folha existente
            let currentFolhaId = folhaId;

            if (!currentFolhaId) {
                const created = await payrollService.criar({
                    competencia_ano: ano,
                    competencia_mes: mes + 1,
                    status: 'RASCUNHO',
                    total_bruto: 0,
                    total_liquido: 0,
                    total_ifood: 0,
                    total_funcionarios: 0,
                });
                currentFolhaId = created.id!;
                setFolhaId(currentFolhaId);
            }

            // Importar itens
            const imported = await payrollService.importarItens(currentFolhaId, selectedRows);
            setItens(imported);

            // Auto-match funcionários logo após importar
            try {
                const matchResult = await payrollService.matchEmployees(currentFolhaId);
                toast.success(`${imported.length} importados, ${matchResult.matched} vinculados`);

                // Recarregar itens com match atualizado
                const result = await payrollService.buscarPorCompetencia(ano, mes + 1);
                if (result) {
                    setFolha(result.folha);
                    setItens(result.itens);
                }
            } catch {
                toast.success(`${imported.length} funcionários importados`);
            }

            setStep(3); // Vai direto pro editor
        } catch (err: any) {
            toast.error(`Erro ao importar: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Carregar folha existente → vai pro editor
    const handleViewExisting = async () => {
        if (!existingFolha) return;
        try {
            const result = await payrollService.buscarPorCompetencia(ano, mes + 1);
            if (result) {
                setFolhaId(result.folha.id!);
                setFolha(result.folha);
                setItens(result.itens);
                setStep(3); // Sempre vai pro editor
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleReimport = async () => {
        if (!existingFolha) return;
        try {
            await payrollService.deletar(existingFolha.id);
            setExistingFolha(null);
            setFolhaId(null);
            setFolha(null);
            setItens([]);
            toast.success('Folha anterior deletada. Importe novamente.');
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDone = () => {
        loadHistory();
        setStep(1);
        setFolhaId(null);
        setFolha(null);
        setItens([]);
        setParseResult(null);
        setExistingFolha(null);
        checkExisting();
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <DollarSign size={28} className="text-[#007a33]" />
                        Folha de Pagamento
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Importe a planilha, edite os valores, confira com o ponto e gere contas a pagar
                    </p>
                </div>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-2 text-sm"
                >
                    <History size={16} />
                    Histórico ({folhas.length})
                </button>
            </div>

            {/* Histórico */}
            {showHistory && folhas.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
                    <h3 className="text-white font-bold text-sm mb-3">Folhas Importadas</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {folhas.map(f => {
                            const statusColors: Record<string, string> = {
                                'RASCUNHO': 'bg-slate-700 text-slate-300',
                                'CONFERIDO': 'bg-blue-800 text-blue-200',
                                'APROVADO': 'bg-amber-800 text-amber-200',
                                'GERADO': 'bg-green-800 text-green-200',
                            };
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => {
                                        setAno(f.competencia_ano);
                                        setMes(f.competencia_mes - 1);
                                        setExistingFolha({ id: f.id!, status: f.status });
                                        setShowHistory(false);
                                        // Carregar direto
                                        (async () => {
                                            const result = await payrollService.buscarPorCompetencia(f.competencia_ano, f.competencia_mes);
                                            if (result) {
                                                setFolhaId(result.folha.id!);
                                                setFolha(result.folha);
                                                setItens(result.itens);
                                                setStep(3);
                                            }
                                        })();
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 rounded-lg p-3 text-left transition-all"
                                >
                                    <div className="text-white font-bold text-sm">
                                        {MESES[f.competencia_mes - 1]}/{f.competencia_ano}
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-slate-500 text-xs">{f.total_funcionarios} func.</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColors[f.status]}`}>
                                            {f.status}
                                        </span>
                                    </div>
                                    <div className="text-slate-600 text-[10px] mt-1">
                                        Líq: {f.total_liquido?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Step Indicator */}
            <div className="flex items-center gap-1 mb-6 bg-slate-900 rounded-xl p-2">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = step === s.id;
                    const isDone = step > s.id;
                    return (
                        <React.Fragment key={s.id}>
                            <button
                                onClick={() => {
                                    if (isDone) setStep(s.id);
                                }}
                                disabled={!isDone && !isActive}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex-1 justify-center ${
                                    isActive
                                        ? 'bg-[#007a33] text-white shadow-lg'
                                        : isDone
                                        ? 'bg-slate-800 text-green-400 cursor-pointer hover:bg-slate-700'
                                        : 'text-slate-600 cursor-default'
                                }`}
                            >
                                <Icon size={16} />
                                <span className="hidden md:inline">{s.label}</span>
                            </button>
                            {i < STEPS.length - 1 && (
                                <ChevronRight size={14} className={`text-slate-700 flex-shrink-0 ${isDone ? 'text-green-600' : ''}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className={step === 3 ? '' : 'max-w-6xl'}>
                {step === 1 && (
                    <PayrollUpload
                        onParsed={handleParsed}
                        existingFolha={existingFolha}
                        onViewExisting={handleViewExisting}
                        onReimport={handleReimport}
                    />
                )}

                {step === 2 && parseResult && (
                    <PayrollPreview
                        rows={parseResult.rows}
                        warnings={parseResult.warnings}
                        sections={parseResult.sections}
                        totalBruto={parseResult.totalBruto}
                        totalLiquido={parseResult.totalLiquido}
                        totalIfood={parseResult.totalIfood}
                        onConfirm={handleConfirmImport}
                        onBack={() => setStep(1)}
                        loading={loading}
                    />
                )}

                {step === 3 && folhaId && (
                    <PayrollEditor
                        folhaId={folhaId}
                        ano={ano}
                        mes={mes + 1}
                        itens={itens}
                        onRefresh={refreshItens}
                        onDone={handleDone}
                        onBack={() => setStep(1)}
                    />
                )}
            </div>
        </div>
    );
};

export default Payroll;
