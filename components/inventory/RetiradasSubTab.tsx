import React, { useState, useEffect, useCallback } from 'react';
import { PurchaseReceipt } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import {
  Search, Plus, ChevronLeft, ChevronRight, X,
  Calendar, FileText, Clock, CheckCircle, Package,
} from 'lucide-react';

const PAGE_SIZE = 50;

interface RetiradasSubTabProps {
  onOpenReceipt: (receipt?: PurchaseReceipt) => void;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const formatDate = (d?: string) => {
  if (!d) return '-';
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: 'Rascunho', cls: 'bg-blue-500/10 text-blue-400' },
  PENDING_INVOICE: { label: 'Pendente NF', cls: 'bg-amber-500/10 text-amber-400' },
  INVOICED: { label: 'Faturada', cls: 'bg-emerald-500/10 text-emerald-400' },
  FINALIZED: { label: 'Finalizada', cls: 'bg-emerald-500/10 text-emerald-400' },
  CANCELED: { label: 'Cancelada', cls: 'bg-red-500/10 text-red-400' },
};

const RetiradasSubTab: React.FC<RetiradasSubTabProps> = ({ onOpenReceipt }) => {
  const [receipts, setReceipts] = useState<PurchaseReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const [stats, setStats] = useState({ total: 0, drafts: 0, pendingInvoice: 0, estimatedPending: 0 });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 350);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const loadReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await inventoryService.getPurchaseReceipts({
        search: debouncedSearch || undefined,
        status: filters.status || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setReceipts(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error('Erro ao carregar retiradas:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.status, filters.dateFrom, filters.dateTo, page]);

  const loadStats = useCallback(async () => {
    try {
      const s = await inventoryService.getReceiptStats();
      setStats(s);
    } catch (err) {
      console.error('Erro ao carregar stats de retiradas:', err);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadReceipts(); }, [loadReceipts]);
  useEffect(() => { setPage(1); }, [debouncedSearch, filters.status, filters.dateFrom, filters.dateTo]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl"><Package size={20} className="text-blue-400" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Retiradas</p>
              <h3 className="text-2xl font-black text-white">{stats.total.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl"><FileText size={20} className="text-blue-400" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rascunhos</p>
              <h3 className="text-2xl font-black text-blue-400">{stats.drafts}</h3>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl"><Clock size={20} className="text-amber-400" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pendentes NF</p>
              <h3 className="text-2xl font-black text-amber-400">{stats.pendingInvoice}</h3>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl"><CheckCircle size={20} className="text-emerald-400" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor Est. Pendente</p>
              <h3 className="text-xl font-black text-emerald-400">{formatCurrency(stats.estimatedPending)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 flex-1 min-w-[200px] max-w-md focus-within:border-blue-500 transition-all">
              <Search size={18} className="text-slate-500" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Buscar fornecedor, n. requisicao..."
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-600 focus:outline-none text-white"
              />
              {filters.search && (
                <button onClick={() => setFilters({ ...filters, search: '' })} className="text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
            >
              <option value="">Todos Status</option>
              <option value="DRAFT">Rascunho</option>
              <option value="PENDING_INVOICE">Pendente NF</option>
              <option value="INVOICED">Faturada</option>
              <option value="CANCELED">Cancelada</option>
            </select>

            {/* Date Range */}
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

            {/* Nova Retirada */}
            <button
              onClick={() => onOpenReceipt()}
              className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> Nova Retirada
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Fornecedor</th>
                <th className="px-4 py-3">N. Requisicao</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Itens</th>
                <th className="px-4 py-3 text-right">Valor Est.</th>
                <th className="px-4 py-3 text-center">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {receipts.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onOpenReceipt(r)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(r.receipt_date)}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-white truncate max-w-[200px]">{r.supplier_name || '-'}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm font-bold text-white">
                    {r.receipt_number || '-'}
                  </td>
                  <td className="px-4 py-3">{renderBadge(r.status)}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 text-right font-bold">{r.items_count ?? 0}</td>
                  <td className="px-4 py-3 text-sm text-emerald-400 text-right font-mono font-bold">
                    {formatCurrency(r.estimated_total ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpenReceipt(r); }}
                      className="px-2 py-1 text-[10px] font-bold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-all"
                    >
                      Abrir
                    </button>
                  </td>
                </tr>
              ))}
              {receipts.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Package size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold">Nenhuma retirada encontrada</p>
                    <p className="text-xs mt-1">Tente ajustar os filtros ou crie uma nova retirada</p>
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
              <>Exibindo {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, totalCount)} de {totalCount.toLocaleString()} retiradas</>
            ) : (
              'Nenhuma retirada'
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
    </div>
  );
};

export default RetiradasSubTab;
