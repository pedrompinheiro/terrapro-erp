import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, FileText, Filter, ChevronLeft, ChevronRight, X,
  DollarSign, User, Truck, Wrench, Calendar, Phone,
  CheckCircle, XCircle, AlertTriangle, Clock, Plus, Pencil, Printer,
} from 'lucide-react';
import { ServiceOrder, ServiceOrderItem, ServiceOrderStatus } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import Modal from '../Modal';
import ServiceOrderFormModal from './ServiceOrderFormModal';
import showToast from '../../lib/toast';

interface OrdensServicoTabProps {
  onRefresh?: () => void;
}

const PAGE_SIZE = 50;

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function OrdensServicoTab({ onRefresh }: OrdensServicoTabProps) {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statuses, setStatuses] = useState<ServiceOrderStatus[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, openOrders: 0, totalRevenue: 0, unpaidCount: 0 });
  const [filters, setFilters] = useState({
    search: '',
    situation: '',
    dateFrom: '',
    dateTo: '',
    isPaid: null as boolean | null,
  });
  const [detailModal, setDetailModal] = useState<ServiceOrder | null>(null);
  const [detailItems, setDetailItems] = useState<ServiceOrderItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [formModal, setFormModal] = useState<{ open: boolean; order?: ServiceOrder | null }>({ open: false });
  const [printOS, setPrintOS] = useState<{ order: ServiceOrder; items: ServiceOrderItem[] } | null>(null);

  // Load statuses and stats on mount
  useEffect(() => {
    const init = async () => {
      const [statusData, statsData] = await Promise.all([
        inventoryService.getServiceOrderStatuses(),
        inventoryService.getServiceOrderStats(),
      ]);
      setStatuses(statusData);
      setStats(statsData);
    };
    init();
  }, []);

  // Load orders when filters/page change
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await inventoryService.getServiceOrders({
        search: filters.search || undefined,
        situation: filters.situation || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        isPaid: filters.isPaid,
        page,
        pageSize: PAGE_SIZE,
      });
      setOrders(result.data);
      setTotalCount(result.count);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const openDetail = async (order: ServiceOrder) => {
    setDetailModal(order);
    setLoadingDetail(true);
    try {
      const items = await inventoryService.getServiceOrderItems(order.id);
      setDetailItems(items);
    } finally {
      setLoadingDetail(false);
    }
  };

  const reloadAll = async () => {
    await Promise.all([loadOrders(), inventoryService.getServiceOrderStats().then(setStats)]);
  };

  const handleQuickStatusChange = async (orderId: string, newSituation: string) => {
    try {
      const st = statuses.find(s => s.name === newSituation);
      await inventoryService.updateServiceOrderStatus(orderId, newSituation, st?.code);
      showToast.success(`Situacao alterada para "${newSituation}"`);
      setDetailModal(null);
      reloadAll();
    } catch (err: any) {
      showToast.error('Erro: ' + (err.message || 'Falha ao atualizar situacao'));
    }
  };

  const handlePrintOS = async (order: ServiceOrder) => {
    const items = await inventoryService.getServiceOrderItems(order.id);
    setPrintOS({ order, items });
    // Open print in new window
    setTimeout(() => {
      const el = document.getElementById('os-print-area');
      if (el) {
        const win = window.open('', '_blank', 'width=800,height=600');
        if (win) {
          win.document.write(`<html><head><title>OS #${order.order_number}</title>
            <style>
              body{font-family:Arial,sans-serif;color:#333;padding:20px;font-size:12px}
              table{width:100%;border-collapse:collapse;margin:10px 0}
              th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
              th{background:#f5f5f5;font-size:10px;text-transform:uppercase}
              .header{text-align:center;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:15px}
              .section{margin:12px 0}
              .section-title{font-weight:bold;font-size:11px;text-transform:uppercase;border-bottom:1px solid #ccc;padding-bottom:4px;margin-bottom:8px}
              .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
              .total-row{font-weight:bold;font-size:14px}
              .signatures{display:flex;justify-content:space-around;margin-top:60px}
              .sig-line{text-align:center;width:200px}
              .sig-line hr{margin-bottom:5px}
              @media print{body{padding:10px}}
            </style></head><body>${el.innerHTML}</body></html>`);
          win.document.close();
          win.print();
        }
      }
      setPrintOS(null);
    }, 100);
  };

  const isOrderFinal = (situation?: string) =>
    ['FINALIZADA', 'FECHAMENTO', 'CANCELADO'].includes(situation || '');

  const getStatusColor = (situationName?: string): string => {
    const match = statuses.find(s => s.name === situationName);
    return match?.color || '#64748b';
  };

  const StatusBadge = ({ situation }: { situation?: string }) => {
    const color = getStatusColor(situation);
    return (
      <span
        style={{ backgroundColor: `${color}20`, color }}
        className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase"
      >
        {situation || '-'}
      </span>
    );
  };

  // ---- RENDER ----

  return (
    <div className="space-y-6">
      {/* Stats Cards + Nova OS */}
      <div className="flex items-start gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10">
            <FileText size={22} className="text-blue-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total OS</p>
            <p className="text-2xl font-black text-white">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10">
            <Clock size={22} className="text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">OS Abertas</p>
            <p className="text-2xl font-black text-white">{stats.openOrders}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10">
            <DollarSign size={22} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Receita Total</p>
            <p className="text-2xl font-black text-white">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
      </div>
      <button
        onClick={() => setFormModal({ open: true, order: null })}
        className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 whitespace-nowrap h-fit mt-1"
      >
        <Plus size={16} />
        Nova OS
      </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar cliente, placa, equipamento, n. OS..."
            value={filters.search}
            onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={filters.situation}
          onChange={e => { setFilters(f => ({ ...f, situation: e.target.value })); setPage(1); }}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todas Situacoes</option>
          {statuses.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => { setFilters(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={e => { setFilters(f => ({ ...f, dateTo: e.target.value })); setPage(1); }}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <div className="flex items-center gap-1">
          <button
            onClick={() => { setFilters(f => ({ ...f, isPaid: f.isPaid === true ? null : true })); setPage(1); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${filters.isPaid === true ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'}`}
          >
            Pago
          </button>
          <button
            onClick={() => { setFilters(f => ({ ...f, isPaid: f.isPaid === false ? null : false })); setPage(1); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${filters.isPaid === false ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'}`}
          >
            Pendente
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-4 py-3 text-left">N. OS</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Equipamento / Placa</th>
                <th className="px-4 py-3 text-left">Situacao</th>
                <th className="px-4 py-3 text-left">Tecnico</th>
                <th className="px-4 py-3 text-right">Valor Total</th>
                <th className="px-4 py-3 text-left">Data Entrada</th>
                <th className="px-4 py-3 text-center">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    <FileText size={32} className="mx-auto mb-2 opacity-40" />
                    Nenhuma ordem de servico encontrada
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => openDetail(order)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-bold text-white">{order.order_number}</td>
                    <td className="px-4 py-3">
                      {order.is_order ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/15 text-blue-400">OS</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 text-purple-400">Orcamento</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{order.client_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {order.equipment_name || '-'}
                      {order.plate && <span className="ml-2 text-[10px] font-bold text-slate-500">{order.plate}</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge situation={order.situation} /></td>
                    <td className="px-4 py-3 text-sm text-slate-400">{order.technician_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-white">{formatCurrency(order.total_value)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{formatDate(order.entry_date)}</td>
                    <td className="px-4 py-3 text-center">
                      {order.is_paid
                        ? <CheckCircle size={16} className="inline text-emerald-400" />
                        : <XCircle size={16} className="inline text-red-400" />}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <span className="text-xs text-slate-500">
              {totalCount} registro{totalCount !== 1 && 's'} - Pagina {page} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => { setDetailModal(null); setDetailItems([]); }}
        title={`OS #${detailModal?.order_number || ''}`}
        size="4xl"
      >
        {detailModal && (
          <div className="space-y-5">
            {/* Header badges + actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusBadge situation={detailModal.situation} />
                {detailModal.is_order ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/15 text-blue-400">Ordem de Servico</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 text-purple-400">Orcamento</span>
                )}
                {detailModal.is_paid ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400">Pago</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/15 text-red-400">Pendente</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setDetailModal(null); setFormModal({ open: true, order: detailModal }); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-all active:scale-95">
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => handlePrintOS(detailModal)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg transition-all">
                  <Printer size={12} /> Imprimir
                </button>
                {!isOrderFinal(detailModal.situation) && (
                  <select
                    onChange={e => e.target.value && handleQuickStatusChange(detailModal.id, e.target.value)}
                    value=""
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-white font-bold outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>Alterar Situacao...</option>
                    {statuses.filter(s => s.active).map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Two column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-4">
                {/* Client info */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User size={14} /> Cliente
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-white font-bold">{detailModal.client_name || '-'}</p>
                    {detailModal.client_phone && (
                      <p className="text-slate-400 flex items-center gap-2">
                        <Phone size={12} /> {detailModal.client_phone}
                      </p>
                    )}
                    {detailModal.client_whatsapp && (
                      <p className="text-slate-400 flex items-center gap-2">
                        <Phone size={12} /> WhatsApp: {detailModal.client_whatsapp}
                      </p>
                    )}
                  </div>
                </div>

                {/* Equipment info */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Truck size={14} /> Equipamento
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500 text-[11px]">Nome</span>
                      <p className="text-white">{detailModal.equipment_name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Modelo</span>
                      <p className="text-white">{detailModal.model_name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Marca</span>
                      <p className="text-white">{detailModal.brand_name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Placa</span>
                      <p className="text-white">{detailModal.plate || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">KM</span>
                      <p className="text-white">{detailModal.km ?? '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Ano</span>
                      <p className="text-white">{detailModal.year_fab || '-'}{detailModal.year_model ? ` / ${detailModal.year_model}` : ''}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Cor</span>
                      <p className="text-white">{detailModal.color || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Serial</span>
                      <p className="text-white">{detailModal.serial_number || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Defects */}
                {(detailModal.defect_1 || detailModal.defect_2) && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <AlertTriangle size={14} /> Defeitos
                    </h4>
                    <div className="space-y-1 text-sm text-slate-300">
                      {detailModal.defect_1 && <p>{detailModal.defect_1}</p>}
                      {detailModal.defect_2 && <p>{detailModal.defect_2}</p>}
                    </div>
                  </div>
                )}

                {/* Services performed */}
                {(detailModal.service_1 || detailModal.service_2 || detailModal.service_3 || detailModal.service_4 || detailModal.service_5) && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Wrench size={14} /> Servicos Realizados
                    </h4>
                    <ul className="space-y-1 text-sm text-slate-300 list-disc list-inside">
                      {[detailModal.service_1, detailModal.service_2, detailModal.service_3, detailModal.service_4, detailModal.service_5]
                        .filter(Boolean)
                        .map((svc, i) => <li key={i}>{svc}</li>)}
                    </ul>
                  </div>
                )}

                {/* Financial summary */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <DollarSign size={14} /> Resumo Financeiro
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Produtos</span>
                      <span className="text-white font-mono">{formatCurrency(detailModal.products_value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Servicos</span>
                      <span className="text-white font-mono">{formatCurrency(detailModal.services_value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mao de Obra</span>
                      <span className="text-white font-mono">{formatCurrency(detailModal.labor_value)}</span>
                    </div>
                    {detailModal.discount_value > 0 && (
                      <div className="flex justify-between">
                        <span className="text-red-400">Desconto</span>
                        <span className="text-red-400 font-mono">-{formatCurrency(detailModal.discount_value)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-800 pt-2 mt-2">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-white font-black font-mono text-lg">{formatCurrency(detailModal.total_value)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment info */}
                {(detailModal.payment_form || detailModal.payment_conditions) && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <DollarSign size={14} /> Pagamento
                    </h4>
                    <div className="space-y-1 text-sm">
                      {detailModal.payment_form && (
                        <p className="text-slate-300">Forma: <span className="text-white">{detailModal.payment_form}</span></p>
                      )}
                      {detailModal.payment_conditions && (
                        <p className="text-slate-300">Condicao: <span className="text-white">{detailModal.payment_conditions}</span></p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Line items table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider px-4 pt-4 pb-2">
                Itens da OS
              </h4>
              {loadingDetail ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Carregando itens...
                </div>
              ) : detailItems.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">Nenhum item registrado</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-800">
                        <th className="px-4 py-2 text-left">Descricao</th>
                        <th className="px-4 py-2 text-center">Tipo</th>
                        <th className="px-4 py-2 text-right">Qtd</th>
                        <th className="px-4 py-2 text-right">Unitario</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-left">Tecnico</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {detailItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-900/50">
                          <td className="px-4 py-2 text-slate-300">{item.description}</td>
                          <td className="px-4 py-2 text-center">
                            {item.is_product ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/15 text-cyan-400">P</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-violet-500/15 text-violet-400">S</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right text-white font-mono">{item.quantity}</td>
                          <td className="px-4 py-2 text-right text-slate-400 font-mono">{formatCurrency(item.unit_price)}</td>
                          <td className="px-4 py-2 text-right text-white font-mono">{formatCurrency(item.total)}</td>
                          <td className="px-4 py-2 text-slate-400">{item.technician_name || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Observations / memos */}
            {(detailModal.observations || detailModal.defect_memo || detailModal.findings_memo || detailModal.service_memo || detailModal.general_notes_memo) && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Observacoes</h4>
                {detailModal.defect_memo && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 mb-1">Defeito</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{detailModal.defect_memo}</p>
                  </div>
                )}
                {detailModal.findings_memo && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 mb-1">Constatacoes</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{detailModal.findings_memo}</p>
                  </div>
                )}
                {detailModal.service_memo && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 mb-1">Servicos</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{detailModal.service_memo}</p>
                  </div>
                )}
                {detailModal.general_notes_memo && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 mb-1">Notas Gerais</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{detailModal.general_notes_memo}</p>
                  </div>
                )}
                {detailModal.observations && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 mb-1">Observacoes Gerais</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{detailModal.observations}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Form Modal (Create/Edit) */}
      <ServiceOrderFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false })}
        onSaved={reloadAll}
        editOrder={formModal.order}
        statuses={statuses}
      />

      {/* Hidden print area */}
      {printOS && (
        <div id="os-print-area" className="hidden">
          <div className="header">
            <h1 style={{ margin: 0, fontSize: '18px' }}>Transportadora e Terraplanagem Terra LTDA</h1>
            <p style={{ margin: '4px 0', fontSize: '11px', color: '#666' }}>Dourados/MS</p>
            <h2 style={{ margin: '8px 0 0', fontSize: '16px' }}>
              ORDEM DE SERVICO N. {printOS.order.order_number}
            </h2>
            <p style={{ fontSize: '11px', color: '#666' }}>
              {printOS.order.is_quote ? 'ORCAMENTO' : printOS.order.is_call ? 'CHAMADO' : 'OS'} | Situacao: {printOS.order.situation || '-'}
            </p>
          </div>

          <div className="section">
            <div className="section-title">Datas</div>
            <div className="grid">
              <p>Entrada: {formatDate(printOS.order.entry_date)} {printOS.order.entry_time || ''}</p>
              <p>Saida: {formatDate(printOS.order.exit_date)} {printOS.order.exit_time || ''}</p>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Cliente</div>
            <p><strong>{printOS.order.client_name || '-'}</strong></p>
            <div className="grid">
              <p>Contato: {printOS.order.client_contact || '-'}</p>
              <p>Telefone: {printOS.order.client_phone || '-'} | WhatsApp: {printOS.order.client_whatsapp || '-'}</p>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Equipamento</div>
            <div className="grid">
              <p>Nome: {printOS.order.equipment_name || '-'}</p>
              <p>Modelo: {printOS.order.model_name || '-'} | Marca: {printOS.order.brand_name || '-'}</p>
              <p>Placa: {printOS.order.plate || '-'} | KM: {printOS.order.km || '-'}</p>
              <p>Ano: {printOS.order.year_fab || '-'} | Serial: {printOS.order.serial_number || '-'}</p>
            </div>
          </div>

          {(printOS.order.defect_1 || printOS.order.defect_2 || printOS.order.defect_memo) && (
            <div className="section">
              <div className="section-title">Defeitos</div>
              {printOS.order.defect_1 && <p>{printOS.order.defect_1}</p>}
              {printOS.order.defect_2 && <p>{printOS.order.defect_2}</p>}
              {printOS.order.defect_memo && <p style={{ whiteSpace: 'pre-wrap' }}>{printOS.order.defect_memo}</p>}
            </div>
          )}

          {(printOS.order.service_1 || printOS.order.service_memo) && (
            <div className="section">
              <div className="section-title">Servicos Realizados</div>
              <ul>
                {[printOS.order.service_1, printOS.order.service_2, printOS.order.service_3, printOS.order.service_4, printOS.order.service_5]
                  .filter(Boolean).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
              {printOS.order.service_memo && <p style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{printOS.order.service_memo}</p>}
            </div>
          )}

          {printOS.items.length > 0 && (
            <div className="section">
              <div className="section-title">Itens</div>
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Descricao</th><th>Tipo</th><th style={{ textAlign: 'right' }}>Qtd</th>
                    <th style={{ textAlign: 'right' }}>Unitario</th><th style={{ textAlign: 'right' }}>Total</th><th>Tecnico</th>
                  </tr>
                </thead>
                <tbody>
                  {printOS.items.map((item, i) => (
                    <tr key={item.id}>
                      <td>{i + 1}</td>
                      <td>{item.description}</td>
                      <td>{item.is_product ? 'Peca' : 'Servico'}</td>
                      <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.total)}</td>
                      <td>{item.technician_name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="section">
            <div className="section-title">Resumo Financeiro</div>
            <table>
              <tbody>
                <tr><td>Produtos</td><td style={{ textAlign: 'right' }}>{formatCurrency(printOS.order.products_value)}</td></tr>
                <tr><td>Servicos</td><td style={{ textAlign: 'right' }}>{formatCurrency(printOS.order.services_value)}</td></tr>
                <tr><td>Mao de Obra</td><td style={{ textAlign: 'right' }}>{formatCurrency(printOS.order.labor_value)}</td></tr>
                {printOS.order.displacement_value > 0 && <tr><td>Deslocamento</td><td style={{ textAlign: 'right' }}>{formatCurrency(printOS.order.displacement_value)}</td></tr>}
                {printOS.order.discount_value > 0 && <tr><td style={{ color: 'red' }}>Desconto</td><td style={{ textAlign: 'right', color: 'red' }}>-{formatCurrency(printOS.order.discount_value)}</td></tr>}
                <tr className="total-row"><td><strong>TOTAL</strong></td><td style={{ textAlign: 'right' }}><strong>{formatCurrency(printOS.order.total_value)}</strong></td></tr>
              </tbody>
            </table>
            <p style={{ marginTop: '8px' }}>
              Pagamento: {printOS.order.payment_form || '-'} | Condicao: {printOS.order.payment_conditions || '-'} | Status: {printOS.order.is_paid ? 'PAGO' : 'PENDENTE'}
            </p>
          </div>

          {(printOS.order.observations || printOS.order.general_notes_memo) && (
            <div className="section">
              <div className="section-title">Observacoes</div>
              {printOS.order.observations && <p style={{ whiteSpace: 'pre-wrap' }}>{printOS.order.observations}</p>}
              {printOS.order.general_notes_memo && <p style={{ whiteSpace: 'pre-wrap' }}>{printOS.order.general_notes_memo}</p>}
            </div>
          )}

          <div className="signatures">
            <div className="sig-line"><hr /><p>Cliente</p></div>
            <div className="sig-line"><hr /><p>Tecnico: {printOS.order.technician_name || '_______________'}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
