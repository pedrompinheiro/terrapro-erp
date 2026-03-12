import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, Check, CheckSquare, Square, AlertTriangle, Paperclip, ArrowDownLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';

interface ParsedLine {
    idx: number;
    date: string;
    description: string;
    value: number;
    isCredit: boolean;
}

interface ImportStatementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ImportStatementModal: React.FC<ImportStatementModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [parsedLines, setParsedLines] = useState<ParsedLine[]>([]);
    const [selectedIdxs, setSelectedIdxs] = useState<Set<number>>(new Set());
    const [fornecedorId, setFornecedorId] = useState('');
    const [costCenterId, setCostCenterId] = useState('');
    const [chartAccountId, setChartAccountId] = useState('');
    const [vencimento, setVencimento] = useState('');
    const [loading, setLoading] = useState(false);
    const [partners, setPartners] = useState<any[]>([]);
    const [costCenters, setCostCenters] = useState<any[]>([]);
    const [chartAccounts, setChartAccounts] = useState<any[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            loadDeps();
            resetState();
        }
    }, [isOpen]);

    const resetState = () => {
        setStep('upload');
        setFile(null);
        setParsedLines([]);
        setSelectedIdxs(new Set());
        setFornecedorId('');
        setCostCenterId('');
        setChartAccountId('');
        setVencimento(new Date().toISOString().split('T')[0]);
        setLoading(false);
    };

    const loadDeps = async () => {
        const [{ data: entities }, { data: costs }, { data: accounts }] = await Promise.all([
            supabase.from('entities').select('id, name, is_supplier').order('name'),
            supabase.from('centros_custo').select('id, nome, codigo').eq('ativo', true).order('nome'),
            supabase.from('plano_contas').select('id, nome, codigo, tipo').eq('tipo', 'DESPESA').order('codigo'),
        ]);
        // Preferir fornecedores, fallback pra todos
        const suppliers = (entities || []).filter((e: any) => e.is_supplier);
        setPartners(suppliers.length > 0 ? suppliers : (entities || []));
        setCostCenters(costs || []);
        setChartAccounts(accounts || []);
    };

    const parseCSV = (text: string) => {
        // Remove BOM
        const clean = text.replace(/^\uFEFF/, '');
        const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
            showToast.error('CSV vazio ou com menos de 2 linhas');
            return;
        }

        // Detect header
        const header = lines[0].toLowerCase();
        const hasHeader = header.includes('data') || header.includes('date') || header.includes('lançamento') || header.includes('lancamento');

        const dataLines = hasHeader ? lines.slice(1) : lines;
        const parsed: ParsedLine[] = [];

        dataLines.forEach((line, idx) => {
            // Split by comma - handle possible quotes
            const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
            if (parts.length < 3) return;

            const date = parts[0].trim();
            // Description: everything between first and last comma
            const desc = parts.slice(1, -1).join(', ').trim();
            const valueStr = parts[parts.length - 1].trim().replace(/[^\d.,-]/g, '');
            const value = parseFloat(valueStr);

            if (!date || !desc || isNaN(value)) return;

            parsed.push({
                idx,
                date,
                description: desc,
                value: Math.abs(value),
                isCredit: value < 0,
            });
        });

        if (parsed.length === 0) {
            showToast.error('Nenhum lançamento válido encontrado no CSV');
            return;
        }

        setParsedLines(parsed);

        // Auto-select non-credit (positive) lines only
        const selected = new Set<number>();
        parsed.forEach(l => { if (!l.isCredit) selected.add(l.idx); });
        setSelectedIdxs(selected);

        setStep('preview');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);

        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            parseCSV(text);
        };
        reader.readAsText(f, 'UTF-8');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (!f) return;
        if (!f.name.endsWith('.csv') && !f.name.endsWith('.txt')) {
            showToast.error('Apenas arquivos CSV são suportados para importação');
            return;
        }
        setFile(f);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            parseCSV(text);
        };
        reader.readAsText(f, 'UTF-8');
    };

    const toggleLine = (idx: number) => {
        setSelectedIdxs(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    const toggleAll = () => {
        const nonCredits = parsedLines.filter(l => !l.isCredit);
        if (selectedIdxs.size === nonCredits.length) {
            setSelectedIdxs(new Set());
        } else {
            const all = new Set<number>();
            nonCredits.forEach(l => all.add(l.idx));
            setSelectedIdxs(all);
        }
    };

    const selectedLines = parsedLines.filter(l => selectedIdxs.has(l.idx));
    const totalSelected = selectedLines.reduce((sum, l) => sum + l.value, 0);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const handleImport = async () => {
        if (selectedLines.length === 0) {
            showToast.error('Selecione pelo menos um lançamento');
            return;
        }

        setLoading(true);
        try {
            const partner = partners.find(p => p.id === fornecedorId);
            const timestamp = Date.now();

            // Upload original file first
            let anexoUrl: string | null = null;
            if (file) {
                const ext = file.name.split('.').pop() || 'csv';
                const path = `financial/import_${timestamp}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from('integration-docs')
                    .upload(path, file, { cacheControl: '3600', upsert: false });
                if (!uploadErr) {
                    const { data: urlData } = supabase.storage.from('integration-docs').getPublicUrl(path);
                    anexoUrl = urlData?.publicUrl || null;
                }
            }

            // Build payloads
            const payloads = selectedLines.map((line, i) => ({
                fornecedor_id: fornecedorId || null,
                fornecedor_nome: partner?.name || 'Importação Fatura',
                descricao: line.description,
                valor_original: line.value,
                data_emissao: line.date,
                data_vencimento: vencimento || line.date,
                centro_custo_id: costCenterId || null,
                plano_contas_id: chartAccountId || null,
                status: 'PENDENTE',
                numero_titulo: `IMP-${timestamp}-${i + 1}`,
                tipo_documento: 'FATURA',
                observacao: `Importado de: ${file?.name || 'CSV'}`,
                ...(anexoUrl ? { anexo_url: anexoUrl } : {}),
            }));

            // Insert in batches of 50
            let totalInserted = 0;
            for (let i = 0; i < payloads.length; i += 50) {
                const batch = payloads.slice(i, i + 50);
                const { data: inserted, error } = await supabase
                    .from('contas_pagar')
                    .insert(batch)
                    .select('id');
                if (error) {
                    // If anexo_url column doesn't exist, retry without it
                    if (error.message?.includes('anexo_url')) {
                        const batchNoAnexo = batch.map(({ anexo_url, ...rest }: any) => rest);
                        const { error: retryErr } = await supabase
                            .from('contas_pagar')
                            .insert(batchNoAnexo);
                        if (retryErr) throw retryErr;
                        totalInserted += batch.length;
                    } else {
                        throw error;
                    }
                } else {
                    totalInserted += inserted?.length || batch.length;
                }
            }

            showToast.success(`${totalInserted} lançamentos importados com sucesso!`);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            showToast.error('Erro na importação: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-orange-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                            <FileSpreadsheet className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Importar Fatura / Extrato</h2>
                            <p className="text-slate-400 text-sm">
                                {step === 'upload'
                                    ? 'Selecione um arquivo CSV para importar lançamentos'
                                    : `${parsedLines.length} lançamentos encontrados • ${selectedIdxs.size} selecionados`
                                }
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition p-2 hover:bg-slate-800 rounded-lg">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'upload' ? (
                        /* ============ STEP 1: UPLOAD ============ */
                        <div className="space-y-6">
                            <div
                                onClick={() => fileRef.current?.click()}
                                onDragOver={e => e.preventDefault()}
                                onDrop={handleDrop}
                                className="border-2 border-dashed border-slate-700 hover:border-orange-500/50 rounded-2xl p-12 text-center cursor-pointer transition-all hover:bg-orange-500/5 group"
                            >
                                <Upload className="mx-auto h-16 w-16 text-slate-600 group-hover:text-orange-400 transition mb-4" />
                                <p className="text-lg font-bold text-slate-300 mb-2">Arraste o arquivo CSV aqui</p>
                                <p className="text-sm text-slate-500 mb-4">ou clique para selecionar</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 border border-slate-700">.CSV</span>
                                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 border border-slate-700">.TXT</span>
                                </div>
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".csv,.txt"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Formato Esperado do CSV</h4>
                                <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
                                    <div className="text-slate-500">data,lançamento,valor</div>
                                    <div>2025-12-17,ABEVE AGUA B-CT,53.76</div>
                                    <div>2025-12-16,AMAZON BR,151.81</div>
                                    <div className="text-slate-600">...</div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Colunas: <strong>data</strong> (YYYY-MM-DD), <strong>lançamento</strong> (descrição), <strong>valor</strong> (número com ponto decimal)
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* ============ STEP 2: PREVIEW ============ */
                        <div className="space-y-6">
                            {/* File info */}
                            <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                                <Paperclip size={16} className="text-orange-400" />
                                <span className="text-sm text-slate-300 font-bold flex-1 truncate">{file?.name}</span>
                                <button
                                    onClick={resetState}
                                    className="text-xs text-slate-500 hover:text-white px-3 py-1 bg-slate-800 rounded-lg transition"
                                >
                                    Trocar arquivo
                                </button>
                            </div>

                            {/* Config row */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-1">Fornecedor</label>
                                    <select
                                        value={fornecedorId}
                                        onChange={e => setFornecedorId(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="">Selecione...</option>
                                        {partners.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-1">Centro de Custo</label>
                                    <select
                                        value={costCenterId}
                                        onChange={e => setCostCenterId(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="">Geral...</option>
                                        {costCenters.map(cc => (
                                            <option key={cc.id} value={cc.id}>{cc.codigo ? `${cc.codigo} - ` : ''}{cc.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-1">Categoria</label>
                                    <select
                                        value={chartAccountId}
                                        onChange={e => setChartAccountId(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="">Sem categoria...</option>
                                        {chartAccounts.map(c => (
                                            <option key={c.id} value={c.id}>{c.codigo} - {c.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-1">Vencimento</label>
                                    <input
                                        type="date"
                                        value={vencimento}
                                        onChange={e => setVencimento(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Summary bar */}
                            <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={toggleAll}
                                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition px-3 py-1.5 bg-slate-800 rounded-lg"
                                    >
                                        {selectedIdxs.size === parsedLines.filter(l => !l.isCredit).length
                                            ? <><CheckSquare size={14} className="text-orange-400" /> Desmarcar Todos</>
                                            : <><Square size={14} /> Selecionar Todos</>
                                        }
                                    </button>
                                    <span className="text-xs text-slate-500">
                                        {selectedIdxs.size} de {parsedLines.filter(l => !l.isCredit).length} lançamentos
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500">Total selecionado</div>
                                    <div className="text-lg font-black text-orange-400">{formatCurrency(totalSelected)}</div>
                                </div>
                            </div>

                            {/* Lines table */}
                            <div className="bg-slate-950/50 rounded-xl border border-slate-700/50 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                            <th className="px-4 py-3 w-10"></th>
                                            <th className="px-4 py-3">Data</th>
                                            <th className="px-4 py-3">Lançamento</th>
                                            <th className="px-4 py-3 text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {parsedLines.map(line => (
                                            <tr
                                                key={line.idx}
                                                onClick={() => !line.isCredit && toggleLine(line.idx)}
                                                className={`transition-colors ${
                                                    line.isCredit
                                                        ? 'opacity-40 cursor-not-allowed bg-slate-900/30'
                                                        : selectedIdxs.has(line.idx)
                                                            ? 'bg-orange-500/5 hover:bg-orange-500/10 cursor-pointer'
                                                            : 'hover:bg-slate-800/50 cursor-pointer'
                                                }`}
                                            >
                                                <td className="px-4 py-2.5 text-center">
                                                    {line.isCredit ? (
                                                        <AlertTriangle size={14} className="text-slate-600 mx-auto" title="Crédito/Pagamento — não importável" />
                                                    ) : selectedIdxs.has(line.idx) ? (
                                                        <CheckSquare size={16} className="text-orange-400 mx-auto" />
                                                    ) : (
                                                        <Square size={16} className="text-slate-600 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-400 font-mono text-xs whitespace-nowrap">
                                                    {line.date.includes('-')
                                                        ? new Date(line.date + 'T00:00:00').toLocaleDateString('pt-BR')
                                                        : line.date
                                                    }
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`font-medium ${line.isCredit ? 'text-slate-500 line-through' : 'text-white'}`}>
                                                        {line.description}
                                                    </span>
                                                    {line.isCredit && (
                                                        <span className="ml-2 text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">CRÉDITO</span>
                                                    )}
                                                </td>
                                                <td className={`px-4 py-2.5 text-right font-bold ${
                                                    line.isCredit ? 'text-emerald-400/50' : 'text-rose-400'
                                                }`}>
                                                    {line.isCredit ? '+' : ''}{formatCurrency(line.value)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-between items-center rounded-b-2xl">
                    <div className="text-xs text-slate-500">
                        {step === 'preview' && (
                            <span className="flex items-center gap-1">
                                <FileSpreadsheet size={12} className="text-orange-400" />
                                {selectedIdxs.size} lançamentos → Contas a Pagar
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
                        {step === 'preview' && (
                            <button
                                onClick={handleImport}
                                disabled={loading || selectedIdxs.size === 0}
                                className={`px-6 py-2.5 rounded-lg text-white font-bold shadow-lg flex items-center gap-2 transform active:scale-95 transition-all
                                    bg-orange-600 hover:bg-orange-500 shadow-orange-900/20
                                    ${loading || selectedIdxs.size === 0 ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Importando...
                                    </span>
                                ) : (
                                    <>
                                        <ArrowDownLeft className="h-5 w-5" />
                                        Importar {selectedIdxs.size} Lançamentos
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportStatementModal;
