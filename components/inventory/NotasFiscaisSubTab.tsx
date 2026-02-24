import React, { useState, useEffect, useCallback } from 'react';
import { SupplierInvoice, SupplierInvoiceLine, PurchaseReceipt } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import Modal from '../Modal';
import NfImportModal from './NfImportModal';
import {
  Search, FileText, Plus, ChevronLeft, ChevronRight, X, Calendar,
  DollarSign, CheckCircle, XCircle, Package, Upload, Link,
} from 'lucide-react';

const PAGE_SIZE = 50;

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const formatDate = (d?: string) => {
  if (!d) return '-';
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
};

const truncateKey = (key?: string) => {
  if (!key) return '-';
  if (key.length <= 20) return key;
  return `${key.slice(0, 10)}...${key.slice(-6)}`;
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  OPEN: { label: 'Aberta', cls: 'bg-blue-500/10 text-blue-400' },
  PAID: { label: 'Paga', cls: 'bg-emerald-500/10 text-emerald-400' },
  CANCELED: { label: 'Cancelada', cls: 'bg-red-500/10 text-red-400' },
};

const confidenceConfig: Record<string, { label: string; cls: string }> = {
  HIGH: { label: 'Alto', cls: 'text-emerald-400' },
  MEDIUM: { label: 'Medio', cls: 'text-amber-400' },
  LOW: { label: 'Baixo', cls: 'text-orange-400' },
  NONE: { label: 'Nenhum', cls: 'text-red-400' },
  MANUAL: { label: 'Manual', cls: 'text-blue-400' },
};

const NotasFiscaisSubTab: React.FC = () => {
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [stats, setStats] = useState({ total: 0, open: 0, totalValue: 0 });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Detail modal
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);
  const [invoiceLines, setInvoiceLines] = useState<SupplierInvoiceLine[]>([]);
  const [linkedReceipts, setLinkedReceipts] = useState<PurchaseReceipt[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 350);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Load invoices
  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const result = await inventoryService.getSupplierInvoices({
        search: debouncedSearch || undefined,
        status: filters.status || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setInvoices(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error('Erro ao carregar NFs:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.status, filters.dateFrom, filters.dateTo, page]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const all = await inventoryService.getSupplierInvoices({ pageSize: 9999 });
      const total = all.count;
      const open = all.data.filter(i => i.status === 'OPEN').length;
      const totalValue = all.data.reduce((s, i) => s + (i.total_invoice || 0), 0);
      setStats({ total, open, totalValue: Math.round(totalValue * 100) / 100 });
    } catch (err) {
      console.error('Erro ao carregar stats NF:', err);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadInvoices(); }, [loadInvoices]);
  useEffect(() => { setPage(1); }, [debouncedSearch, filters.status, filters.dateFrom, filters.dateTo]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Open detail modal
  const openDetail = async (invoice: SupplierInvoice) => {
    setSelectedInvoice(invoice);
    setDetailLoading(true);
    try {
      const [lines, receipts] = await Promise.all([
        inventoryService.getInvoiceLines(invoice.id),
        inventoryService.getLinkedReceipts(invoice.id),
      ]);
      setInvoiceLines(lines);
      setLinkedReceipts(receipts);
    } catch (err) {
      console.error('Erro ao carregar detalhes NF:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedInvoice(null);
    setInvoiceLines([]);
    setLinkedReceipts([]);
  };

  const renderBadge = (status?: string) => {
    const cfg = statusConfig[status || ''];
    if (!cfg) return null;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${cfg.cls}`}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl"><FileText size={20} className="text-blue-400" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total NFs</p>
              <h3 className="text-2xl font-black text-white">{stats.total.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl"><CheckCircle size={20} className="text-blue-400" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NFs Abertas</p>
              <h3 className="text-2xl font-black text-blue-400">{stats.open}</h3>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl"><DollarSign size={20} className="text-emerald-400" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor Total</p>
              <h3 className="text-xl font-black text-emerald-400">{formatCurrency(stats.totalValue)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 flex-1 min-w-[200px] max-w-md focus-within:border-blue-500 transition-all">
              <Search size={18} className="text-slate-500" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Buscar fornecedor, n. NF, chave NFe..."
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-600 focus:outline-none text-white"
              />
              {filters.search && (
                <button onClick={() => setFilters({ ...filters, search: '' })} className="text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
            >
              <option value="">Todos Status</option>
              <option value="OPEN">Aberta</option>
              <option value="PAID">Paga</option>
              <option value="CANCELED">Cancelada</option>
            </select>

            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-500" />
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:border-blue-500 outline-none"
              />
              <span className="text-slate-600 text-xs">ate</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:border-blue-500 outline-none"
              />
            </div>

            <button
              onClick={() => setImportModalOpen(true)}
              className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
            >
              <Upload size={16} /> Importar NF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-4 py-3">N. NF</th>
                <th className="px-4 py-3">Fornecedor</th>
                <th className="px-4 py-3">Chave NFe</th>
                <th className="px-4 py-3">Emissao</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => openDetail(inv)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3 font-mono text-sm font-bold text-white">{inv.invoice_number || '-'}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-white truncate max-w-[200px]">{inv.supplier_name || '-'}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400" title={inv.chave_nfe || ''}>
                    {truncateKey(inv.chave_nfe)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(inv.issue_date)}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(inv.due_date)}</td>
                  <td className="px-4 py-3 text-sm text-emerald-400 text-right font-mono font-bold">
                    {formatCurrency(inv.total_invoice || 0)}
                  </td>
                  <td className="px-4 py-3 text-center">{renderBadge(inv.status)}</td>
                </tr>
              ))}
              {invoices.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <FileText size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold">Nenhuma nota fiscal encontrada</p>
                    <p className="text-xs mt-1">Tente ajustar os filtros ou importe uma NF</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/50">
          <p className="text-xs text-slate-500 font-medium">
            {totalCount > 0 ? (
              <>Exibindo {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, totalCount)} de {totalCount.toLocaleString()} NFs</>
            ) : (
              'Nenhuma NF'
            )}
            {loading && <span className="ml-2 text-blue-400 animate-pulse">Carregando...</span>}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg hover:text-white transition-all disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-400 font-bold px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg hover:text-white transition-all disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedInvoice} onClose={closeDetail} title={`NF ${selectedInvoice?.invoice_number || ''}`} size="4xl">
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fornecedor</p>
                <p className="text-sm font-bold text-white mt-1">{selectedInvoice.supplier_name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CNPJ</p>
                <p className="text-sm font-mono text-slate-300 mt-1">{selectedInvoice.supplier_cnpj || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Emissao</p>
                <p className="text-sm text-slate-300 mt-1">{formatDate(selectedInvoice.issue_date)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vencimento</p>
                <p className="text-sm text-slate-300 mt-1">{formatDate(selectedInvoice.due_date)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chave NFe</p>
                <p className="text-xs font-mono text-slate-400 mt-1 break-all">{selectedInvoice.chave_nfe || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</p>
                <p className="text-lg font-black text-emerald-400 mt-1">{formatCurrency(selectedInvoice.total_invoice)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                <div className="mt-1">{renderBadge(selectedInvoice.status)}</div>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Observacoes</p>
                <p className="text-xs text-slate-400">{selectedInvoice.notes}</p>
              </div>
            )}

            {/* Invoice Lines */}
            <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Package size={14} /> Itens da NF
              </h4>
              {detailLoading ? (
                <p className="text-xs text-blue-400 animate-pulse py-4 text-center">Carregando...</p>
              ) : invoiceLines.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Nenhum item encontrado</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <th className="px-3 py-2">Descricao</th>
                        <th className="px-3 py-2">NCM</th>
                        <th className="px-3 py-2">Un</th>
                        <th className="px-3 py-2 text-right">Qtd</th>
                        <th className="px-3 py-2 text-right">Custo Un.</th>
                        <th className="px-3 py-2 text-right">Total</th>
                        <th className="px-3 py-2 text-center">Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {invoiceLines.map((line) => {
                        const conf = confidenceConfig[line.matched_confidence] || confidenceConfig.NONE;
                        return (
                          <tr key={line.id} className="hover:bg-slate-800/20">
                            <td className="px-3 py-2">
                              <p className="text-xs font-bold text-white truncate max-w-[220px]">{line.description || '-'}</p>
                              {line.matched_item_description && (
                                <p className="text-[10px] text-slate-500 truncate max-w-[220px]">
                                  Vinculado: {line.matched_item_description}
                                </p>
                              )}
                            </td>
                            <td className="px-3 py-2 font-mono text-[10px] text-slate-400">{line.ncm || '-'}</td>
                            <td className="px-3 py-2 text-xs text-slate-400">{line.unit || '-'}</td>
                            <td className="px-3 py-2 text-xs text-white text-right font-bold">{line.qty}</td>
                            <td className="px-3 py-2 text-xs text-slate-300 text-right font-mono">{formatCurrency(line.unit_cost)}</td>
                            <td className="px-3 py-2 text-xs text-emerald-400 text-right font-mono font-bold">{formatCurrency(line.total)}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`text-[10px] font-black ${conf.cls}`}>{conf.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Linked Receipts */}
            <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Link size={14} /> Retiradas Vinculadas
              </h4>
              {detailLoading ? (
                <p className="text-xs text-blue-400 animate-pulse py-4 text-center">Carregando...</p>
              ) : linkedReceipts.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Nenhuma retirada vinculada</p>
              ) : (
                <div className="space-y-2">
                  {linkedReceipts.map((r) => (
                    <div key={r.id} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-blue-400" />
                        <div>
                          <p className="text-sm font-bold text-white">{r.receipt_number}</p>
                          <p className="text-[10px] text-slate-500">{r.supplier_name} - {formatDate(r.receipt_date)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        r.status === 'FINALIZED' ? 'bg-emerald-500/10 text-emerald-400' :
                        r.status === 'CANCELED' ? 'bg-red-500/10 text-red-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* NF Import Modal */}
      <NfImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={() => { setImportModalOpen(false); loadInvoices(); loadStats(); }}
      />
    </div>
  );
};

export default NotasFiscaisSubTab;
