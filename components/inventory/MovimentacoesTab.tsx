import React, { useState, useCallback, useEffect } from 'react';
import { Search, Plus, Filter, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight, X, RefreshCw } from 'lucide-react';
import { InventoryMovement, InventoryCategory } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import MovementFormModal from './MovementFormModal';

// ============================================================
// TYPES
// ============================================================

interface MovimentacoesTabProps {
  categories: InventoryCategory[];
  onRefresh?: () => void;
}

interface Filters {
  movementType: string;
  dateFrom: string;
  dateTo: string;
}

// ============================================================
// MOVEMENT TYPE CONFIG
// ============================================================

const movementTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
  ENTRADA_COMPRA:    { label: 'Compra',          color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ENTRADA_DEVOLUCAO: { label: 'Devolução',       color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ENTRADA_AJUSTE:    { label: 'Ajuste (+)',       color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  SAIDA_OS:          { label: 'Saída OS',         color: 'text-red-400',     bg: 'bg-red-500/10' },
  SAIDA_VENDA:       { label: 'Venda',            color: 'text-red-400',     bg: 'bg-red-500/10' },
  SAIDA_AJUSTE:      { label: 'Ajuste (-)',       color: 'text-red-400',     bg: 'bg-red-500/10' },
  SAIDA_PERDA:       { label: 'Perda',            color: 'text-red-400',     bg: 'bg-red-500/10' },
  TRANSFERENCIA:     { label: 'Transferência',    color: 'text-blue-400',    bg: 'bg-blue-500/10' },
};

// ============================================================
// HELPERS
// ============================================================

const PAGE_SIZE = 50;

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ============================================================
// COMPONENT
// ============================================================

const MovimentacoesTab: React.FC<MovimentacoesTabProps> = ({ categories, onRefresh }) => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    movementType: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showNewMovementModal, setShowNewMovementModal] = useState(false);

  // ---- Load movements ----
  const loadMovements = useCallback(async () => {
    setLoading(true);
    try {
      const result = await inventoryService.getMovements({
        movementType: filters.movementType || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setMovements(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error('Erro ao carregar movimentações:', err);
      setMovements([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(p => p + 1);
  };

  // ---- Filter helpers ----
  const setMovementType = (type: string) => {
    setFilters(prev => ({ ...prev, movementType: type }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ movementType: '', dateFrom: '', dateTo: '' });
    setPage(1);
  };

  const hasActiveFilters = filters.movementType || filters.dateFrom || filters.dateTo;

  // ---- Handle new movement saved ----
  const handleMovementSaved = () => {
    loadMovements();
    onRefresh?.();
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-4">
      {/* ---- Filter Bar ---- */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Type toggle buttons */}
          <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => setMovementType('')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                !filters.movementType
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setMovementType('ENTRADA')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                filters.movementType === 'ENTRADA'
                  ? 'bg-emerald-500/20 text-emerald-400 shadow'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <ArrowDownCircle size={14} />
              Entradas
            </button>
            <button
              onClick={() => setMovementType('SAIDA')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                filters.movementType === 'SAIDA'
                  ? 'bg-red-500/20 text-red-400 shadow'
                  : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <ArrowUpCircle size={14} />
              Saídas
            </button>
          </div>

          {/* Date filters */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => { setFilters(prev => ({ ...prev, dateFrom: e.target.value })); setPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
              title="Data inicial"
            />
            <span className="text-slate-600 text-xs">até</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => { setFilters(prev => ({ ...prev, dateTo: e.target.value })); setPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
              title="Data final"
            />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-white transition"
              title="Limpar filtros"
            >
              <X size={14} />
              Limpar
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* New Movement button */}
          <button
            onClick={() => setShowNewMovementModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
          >
            <Plus size={16} />
            Nova Movimentação
          </button>
        </div>
      </div>

      {/* ---- Table ---- */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <RefreshCw size={48} className="mb-4 opacity-30" />
            <p className="text-sm font-medium">Nenhuma movimentação encontrada</p>
            <p className="text-xs mt-1">Ajuste os filtros ou registre uma nova movimentação</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50">
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Produto</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Custo Unit</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor Total</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Saldo</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Referência / Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {movements.map((mov) => {
                    const typeInfo = movementTypeConfig[mov.movement_type] || {
                      label: mov.movement_type,
                      color: 'text-slate-400',
                      bg: 'bg-slate-500/10',
                    };

                    return (
                      <tr key={mov.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Date */}
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                          {formatDate(mov.created_at)}
                        </td>

                        {/* Type badge */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${typeInfo.color} ${typeInfo.bg}`}>
                            {mov.movement_type.startsWith('ENTRADA') ? (
                              <ArrowDownCircle size={10} />
                            ) : mov.movement_type.startsWith('SAIDA') ? (
                              <ArrowUpCircle size={10} />
                            ) : null}
                            {typeInfo.label}
                          </span>
                        </td>

                        {/* Product */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-white font-medium truncate max-w-[200px]">
                              {mov.item_description || 'Item desconhecido'}
                            </span>
                            {mov.item_code ? (
                              <span className="text-slate-500 text-[10px]">
                                Cód. {mov.item_code}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="px-4 py-3 text-right font-mono text-white font-bold">
                          {mov.quantity}
                        </td>

                        {/* Unit cost */}
                        <td className="px-4 py-3 text-right font-mono text-slate-400">
                          {formatCurrency(mov.unit_cost || 0)}
                        </td>

                        {/* Total value */}
                        <td className="px-4 py-3 text-right font-mono text-white font-bold">
                          {formatCurrency(mov.total_value || 0)}
                        </td>

                        {/* Balance after */}
                        <td className="px-4 py-3 text-right font-mono text-slate-300">
                          {mov.balance_after ?? '-'}
                        </td>

                        {/* Reference / Notes */}
                        <td className="px-4 py-3 text-slate-400 max-w-[200px]">
                          <div className="flex flex-col gap-0.5 truncate">
                            {mov.entity_name && (
                              <span className="text-slate-300 text-[10px] font-medium">{mov.entity_name}</span>
                            )}
                            {mov.invoice_number && (
                              <span className="text-[10px]">NF: {mov.invoice_number}</span>
                            )}
                            {mov.notes && (
                              <span className="text-[10px] truncate" title={mov.notes}>{mov.notes}</span>
                            )}
                            {!mov.entity_name && !mov.invoice_number && !mov.notes && (
                              <span className="text-slate-600">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ---- Pagination ---- */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/30">
              <span className="text-xs text-slate-500">
                {totalCount} movimentação{totalCount !== 1 ? 'ões' : ''} encontrada{totalCount !== 1 ? 's' : ''}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-slate-400 font-medium">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ---- New Movement Modal ---- */}
      <MovementFormModal
        isOpen={showNewMovementModal}
        onClose={() => setShowNewMovementModal(false)}
        onSaved={handleMovementSaved}
      />
    </div>
  );
};

export default MovimentacoesTab;
