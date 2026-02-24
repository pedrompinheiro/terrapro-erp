import React, { useState, useCallback, useRef } from 'react';
import { SupplierInvoice, SupplierInvoiceLine, PurchaseReceipt, InventoryItem } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import Modal from '../Modal';
import { Upload, FileText, Search, CheckCircle, AlertTriangle, X, ChevronRight, Loader2, Link, Package } from 'lucide-react';
import { showToast } from '../../lib/toast';

// ============================================================
// TYPES
// ============================================================

interface NfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

type FileType = 'XML' | 'PDF' | 'IMAGE';
type MatchConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' | 'MANUAL';

interface ParsedNfeItem {
  description: string;
  ncm: string;
  cfop: string;
  ean: string;
  unit: string;
  qty: number;
  unitCost: number;
  total: number;
  matchedItem?: InventoryItem;
  matchConfidence: MatchConfidence;
  needs_review: boolean;
}

interface ParsedNfeData {
  supplier: string;
  supplierCnpj?: string;
  invoiceNumber: string;
  serie: string;
  chaveNfe: string;
  issueDate: string;
  total: number;
  items: ParsedNfeItem[];
}

// ============================================================
// XML PARSER (basic client-side NFe)
// ============================================================

function getTagText(parent: Element | Document, tag: string): string {
  const el = parent.getElementsByTagName(tag)[0];
  return el?.textContent?.trim() || '';
}

function parseNFeXml(xmlText: string): ParsedNfeData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const infNFe = doc.getElementsByTagName('infNFe')[0];
  const chaveNfe = infNFe?.getAttribute('Id')?.replace('NFe', '') || '';

  const emit = doc.getElementsByTagName('emit')[0];
  const ide = doc.getElementsByTagName('ide')[0];
  const totalTag = doc.getElementsByTagName('ICMSTot')[0];

  const supplier = emit ? getTagText(emit, 'xNome') : '';
  const supplierCnpj = emit ? getTagText(emit, 'CNPJ') : '';
  const invoiceNumber = ide ? getTagText(ide, 'nNF') : '';
  const serie = ide ? getTagText(ide, 'serie') : '';
  const issueDate = ide ? getTagText(ide, 'dhEmi').substring(0, 10) : '';
  const total = totalTag ? parseFloat(getTagText(totalTag, 'vNF')) || 0 : 0;

  const detElements = doc.getElementsByTagName('det');
  const items: ParsedNfeItem[] = [];

  for (let i = 0; i < detElements.length; i++) {
    const prod = detElements[i].getElementsByTagName('prod')[0];
    if (!prod) continue;

    items.push({
      description: getTagText(prod, 'xProd'),
      ncm: getTagText(prod, 'NCM'),
      cfop: getTagText(prod, 'CFOP'),
      ean: getTagText(prod, 'cEAN'),
      unit: getTagText(prod, 'uCom'),
      qty: parseFloat(getTagText(prod, 'qCom')) || 0,
      unitCost: parseFloat(getTagText(prod, 'vUnCom')) || 0,
      total: parseFloat(getTagText(prod, 'vProd')) || 0,
      matchConfidence: 'NONE',
      needs_review: true,
    });
  }

  return { supplier, supplierCnpj, invoiceNumber, serie, chaveNfe, issueDate, total, items };
}

// ============================================================
// CONFIDENCE BADGE
// ============================================================

const confidenceBadge: Record<MatchConfidence, { label: string; cls: string }> = {
  HIGH: { label: 'Alta', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  MEDIUM: { label: 'Média', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  LOW: { label: 'Baixa', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  NONE: { label: 'Sem match', cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  MANUAL: { label: 'Manual', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

// ============================================================
// STEP INDICATOR
// ============================================================

const StepIndicator: React.FC<{ current: number }> = ({ current }) => {
  const steps = ['Upload', 'Revisão', 'Confirmar'];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((label, idx) => {
        const step = idx + 1;
        const active = step === current;
        const done = step < current;
        return (
          <React.Fragment key={step}>
            {idx > 0 && <ChevronRight size={14} className="text-slate-600" />}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors
              ${active ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : done ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              {done ? <CheckCircle size={12} /> : <span>{step}</span>}
              {label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================================
// COMPONENT
// ============================================================

const NfImportModal: React.FC<NfImportModalProps> = ({ isOpen, onClose, onImported }) => {
  const [step, setStep] = useState(1);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [chaveManual, setChaveManual] = useState('');
  const [parsedData, setParsedData] = useState<ParsedNfeData | null>(null);
  const [pendingReceipts, setPendingReceipts] = useState<PurchaseReceipt[]>([]);
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search state for manual matching
  const [searchIdx, setSearchIdx] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Reset on open/close ----
  const resetState = useCallback(() => {
    setStep(1);
    setFileType(null);
    setFileName('');
    setFileContent('');
    setChaveManual('');
    setParsedData(null);
    setPendingReceipts([]);
    setSelectedReceipts([]);
    setProcessing(false);
    setConfirming(false);
    setDragOver(false);
    setSearchIdx(null);
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  // ---- File handling ----
  const detectFileType = (name: string): FileType | null => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'xml') return 'XML';
    if (ext === 'pdf') return 'PDF';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'IMAGE';
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const type = detectFileType(file.name);
    if (!type) {
      showToast.error('Formato nao suportado. Use XML, PDF, JPG ou PNG.');
      return;
    }
    setFileType(type);
    setFileName(file.name);

    if (type === 'XML') {
      const reader = new FileReader();
      reader.onload = (e) => setFileContent(e.target?.result as string || '');
      reader.readAsText(file);
    } else {
      setFileContent('');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ---- Step 1 -> 2: Process file ----
  const handleProcess = useCallback(async () => {
    if (!fileType && !chaveManual) {
      showToast.error('Selecione um arquivo ou informe a chave NFe.');
      return;
    }

    setProcessing(true);

    try {
      if (fileType === 'XML' && fileContent) {
        const data = parseNFeXml(fileContent);
        // Attempt auto-matching by EAN and description
        for (const item of data.items) {
          if (item.ean && item.ean !== 'SEM GTIN') {
            const match = await inventoryService.matchProductByEan(item.ean);
            if (match) {
              item.matchedItem = match;
              item.matchConfidence = 'HIGH';
              item.needs_review = false;
              continue;
            }
          }
          const descMatches = await inventoryService.matchProductByDescription(item.description);
          if (descMatches.length > 0) {
            item.matchedItem = descMatches[0];
            item.matchConfidence = descMatches.length === 1 ? 'MEDIUM' : 'LOW';
            item.needs_review = true;
          }
        }
        setParsedData(data);
        setStep(2);
      } else if (fileType === 'PDF' || fileType === 'IMAGE') {
        showToast.error('Processamento de PDF/Imagem requer Edge Function nfe-parser (em desenvolvimento)');
      } else if (chaveManual && chaveManual.length === 44) {
        setParsedData({
          supplier: '',
          invoiceNumber: '',
          serie: '',
          chaveNfe: chaveManual,
          issueDate: new Date().toISOString().substring(0, 10),
          total: 0,
          items: [],
        });
        setStep(2);
      } else if (chaveManual) {
        showToast.error('Chave NFe deve ter exatamente 44 digitos.');
      }
    } catch (err: any) {
      showToast.error(`Erro ao processar: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  }, [fileType, fileContent, chaveManual]);

  // ---- Manual item search ----
  const handleItemSearch = useCallback((term: string, idx: number) => {
    setSearchTerm(term);
    setSearchIdx(idx);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const results = await inventoryService.matchProductByDescription(term);
      setSearchResults(results);
      setSearching(false);
    }, 300);
  }, []);

  const handleSelectMatch = useCallback((idx: number, item: InventoryItem) => {
    if (!parsedData) return;
    const updated = { ...parsedData };
    updated.items[idx] = {
      ...updated.items[idx],
      matchedItem: item,
      matchConfidence: 'MANUAL',
      needs_review: false,
    };
    setParsedData(updated);
    setSearchIdx(null);
    setSearchTerm('');
    setSearchResults([]);
  }, [parsedData]);

  // ---- Step 2 -> 3: Move to confirm ----
  const handleGoToConfirm = useCallback(async () => {
    if (!parsedData) return;
    const receipts = await inventoryService.getPendingReceipts(parsedData.supplier);
    setPendingReceipts(receipts);
    setStep(3);
  }, [parsedData]);

  // ---- Step 3: Confirm entry ----
  const handleConfirm = useCallback(async () => {
    if (!parsedData) return;
    setConfirming(true);

    try {
      // 1. Create supplier invoice
      const invoice = await inventoryService.createSupplierInvoice({
        supplier_name: parsedData.supplier,
        supplier_cnpj: parsedData.supplierCnpj,
        invoice_number: parsedData.invoiceNumber,
        serie: parsedData.serie,
        chave_nfe: parsedData.chaveNfe,
        issue_date: parsedData.issueDate,
        total_invoice: parsedData.total,
        status: 'OPEN',
      });

      if (!invoice) throw new Error('Falha ao criar NF');

      // 2. Create invoice lines
      const lines: Partial<SupplierInvoiceLine>[] = parsedData.items.map((item) => ({
        supplier_invoice_id: invoice.id,
        inventory_item_id: item.matchedItem?.id || undefined,
        description: item.description,
        ncm: item.ncm,
        cfop: item.cfop,
        ean: item.ean,
        unit: item.unit,
        qty: item.qty,
        unit_cost: item.unitCost,
        total: item.total,
        matched_confidence: item.matchConfidence,
        needs_review: item.needs_review,
      }));

      await inventoryService.createInvoiceLines(lines);

      // 3. Link receipts if selected
      if (selectedReceipts.length > 0) {
        await inventoryService.linkInvoiceToReceipts(invoice.id, selectedReceipts);
      }

      // 4. Confirm NF entry (generates ENTRADA_COMPRA movements)
      await inventoryService.confirmNfEntry(invoice.id);

      showToast.success('NF importada e entrada confirmada com sucesso!');
      onImported();
      handleClose();
    } catch (err: any) {
      showToast.error(`Erro ao confirmar: ${err.message}`);
    } finally {
      setConfirming(false);
    }
  }, [parsedData, selectedReceipts, onImported, handleClose]);

  // ---- Toggle receipt selection ----
  const toggleReceipt = (id: string) => {
    setSelectedReceipts((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (!isOpen) return null;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importar NF Fornecedor" size="4xl">
      <StepIndicator current={step} />

      {/* ===================== STEP 1: UPLOAD ===================== */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
              ${dragOver ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml,.pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleInputChange}
            />
            <Upload size={36} className={`mx-auto mb-3 ${dragOver ? 'text-amber-400' : 'text-slate-500'}`} />
            {fileName ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <FileText size={16} className="text-amber-400" />
                  <span className="text-white font-semibold">{fileName}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">{fileType}</span>
                </div>
                <p className="text-xs text-slate-500">Clique para trocar o arquivo</p>
              </div>
            ) : (
              <div>
                <p className="text-white font-semibold">Arraste o arquivo XML, PDF ou Imagem da NF</p>
                <p className="text-xs text-slate-500 mt-1">Prioridade: XML &gt; PDF &gt; Imagem | Aceito: .xml .pdf .jpg .png</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-500 font-medium">ou informe a chave manualmente</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Manual key input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Chave NFe (44 digitos)</label>
            <input
              type="text"
              maxLength={44}
              value={chaveManual}
              onChange={(e) => setChaveManual(e.target.value.replace(/\D/g, ''))}
              placeholder="00000000000000000000000000000000000000000000"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50"
            />
            <p className="text-xs text-slate-500 mt-1">{chaveManual.length}/44 digitos</p>
          </div>

          {/* Process button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleProcess}
              disabled={processing || (!fileType && chaveManual.length !== 44)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {processing ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
              Processar
            </button>
          </div>
        </div>
      )}

      {/* ===================== STEP 2: REVIEW (DRAFT) ===================== */}
      {step === 2 && parsedData && (
        <div className="space-y-5">
          {/* Invoice header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Fornecedor', value: parsedData.supplier || 'N/A' },
              { label: 'NF Numero', value: parsedData.invoiceNumber || 'N/A' },
              { label: 'Data Emissao', value: parsedData.issueDate || 'N/A' },
              { label: 'Total NF', value: fmt(parsedData.total) },
            ].map((f) => (
              <div key={f.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{f.label}</p>
                <p className="text-sm text-white font-bold truncate">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Items table */}
          <div className="border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-3 py-2.5">Descricao</th>
                    <th className="text-left px-3 py-2.5 w-20">NCM</th>
                    <th className="text-right px-3 py-2.5 w-16">Qtd</th>
                    <th className="text-right px-3 py-2.5 w-24">Vl Unit</th>
                    <th className="text-right px-3 py-2.5 w-24">Total</th>
                    <th className="text-center px-3 py-2.5 w-24">Match</th>
                    <th className="text-center px-3 py-2.5 w-20">Acao</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {parsedData.items.map((item, idx) => {
                    const badge = confidenceBadge[item.matchConfidence];
                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            {item.needs_review && <AlertTriangle size={13} className="text-yellow-500 flex-shrink-0" />}
                            <div>
                              <p className="text-white text-xs font-medium truncate max-w-[200px]">{item.description}</p>
                              {item.matchedItem && (
                                <p className="text-[10px] text-emerald-400 truncate max-w-[200px]">
                                  {item.matchedItem.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-400 text-xs font-mono">{item.ncm}</td>
                        <td className="px-3 py-2.5 text-right text-white text-xs">{item.qty}</td>
                        <td className="px-3 py-2.5 text-right text-slate-300 text-xs">{fmt(item.unitCost)}</td>
                        <td className="px-3 py-2.5 text-right text-white text-xs font-semibold">{fmt(item.total)}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => { setSearchIdx(idx); setSearchTerm(''); setSearchResults([]); }}
                            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-colors"
                            title="Buscar produto"
                          >
                            <Search size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {parsedData.items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-slate-500 text-sm">
                        Nenhum item encontrado na NF. Adicione itens manualmente ou verifique o arquivo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inline search panel for manual matching */}
          {searchIdx !== null && (
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-300">
                  <Package size={13} className="inline mr-1" />
                  Buscar produto para: <span className="text-amber-400">{parsedData.items[searchIdx]?.description}</span>
                </p>
                <button onClick={() => setSearchIdx(null)} className="text-slate-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleItemSearch(e.target.value, searchIdx)}
                  placeholder="Buscar por descricao..."
                  autoFocus
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 animate-spin" />}
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectMatch(searchIdx, item)}
                      className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-700/60 transition-colors"
                    >
                      <div>
                        <p className="text-xs text-white font-medium">{item.description}</p>
                        <p className="text-[10px] text-slate-500">Cod: {item.code} | Estoque: {item.qty_current} {item.unit}</p>
                      </div>
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
              Voltar
            </button>
            <button
              onClick={handleGoToConfirm}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors"
            >
              Confirmar Itens <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ===================== STEP 3: CONFIRM ===================== */}
      {step === 3 && parsedData && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-black text-white">Resumo da NF</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
              <span className="text-slate-400">Fornecedor</span>
              <span className="text-white font-semibold">{parsedData.supplier || 'N/A'}</span>
              <span className="text-slate-400">NF Numero / Serie</span>
              <span className="text-white font-semibold">{parsedData.invoiceNumber || 'N/A'} / {parsedData.serie || '-'}</span>
              <span className="text-slate-400">Data Emissao</span>
              <span className="text-white font-semibold">{parsedData.issueDate || 'N/A'}</span>
              <span className="text-slate-400">Total</span>
              <span className="text-amber-400 font-bold">{fmt(parsedData.total)}</span>
              <span className="text-slate-400">Itens</span>
              <span className="text-white font-semibold">{parsedData.items.length}</span>
              <span className="text-slate-400">Itens com match</span>
              <span className="text-emerald-400 font-semibold">
                {parsedData.items.filter((i) => i.matchedItem).length} / {parsedData.items.length}
              </span>
            </div>
          </div>

          {/* Pending receipts from same supplier */}
          {pendingReceipts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Link size={14} className="text-amber-400" />
                Vincular Retiradas Pendentes
              </h4>
              <p className="text-[11px] text-slate-500">
                Retiradas com status PENDING_INVOICE do mesmo fornecedor. Selecione para vincular a esta NF.
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                {pendingReceipts.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors
                      ${selectedReceipts.includes(r.id) ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedReceipts.includes(r.id)}
                      onChange={() => toggleReceipt(r.id)}
                      className="accent-amber-500 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-semibold">Retirada #{r.receipt_number}</p>
                      <p className="text-[10px] text-slate-500">{r.receipt_date} | {r.supplier_name}</p>
                    </div>
                    {r.estimated_total != null && (
                      <span className="text-xs text-slate-400 font-mono">{fmt(r.estimated_total)}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {pendingReceipts.length === 0 && (
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-slate-500">Nenhuma retirada pendente para vincular.</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
              Voltar
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Confirmar Entrada
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default NfImportModal;
