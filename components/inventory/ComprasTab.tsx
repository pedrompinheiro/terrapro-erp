import React, { useState, useEffect, useCallback } from 'react';
import { PurchaseOrder, PurchaseOrderItem, PurchaseReceipt } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import Modal from '../Modal';
import RetiradasSubTab from './RetiradasSubTab';
import ReceiptModal from './ReceiptModal';
import NotasFiscaisSubTab from './NotasFiscaisSubTab';
import {
  Search, ShoppingCart, Filter, ChevronLeft, ChevronRight, X,
  DollarSign, Truck, Calendar, CheckCircle, XCircle, Package, Phone, User,
  FileText, ClipboardList, Plus, Loader2, Save, Trash2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const PAGE_SIZE = 50;

type ComprasSubTab = 'PEDIDOS' | 'RETIRADAS' | 'NOTAS_FISCAIS';

interface ComprasTabProps {
  onRefresh?: () => void;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const formatDate = (d?: string) => {
  if (!d) return '-';
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

const ComprasTab: React.FC<ComprasTabProps> = ({ onRefresh }) => {
  const [subTab, setSubTab] = useState<ComprasSubTab>('PEDIDOS');
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseReceipt | null>(null);
  const [retiradasKey, setRetiradasKey] = useState(0);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingDeliveries: 0,
    totalSpent: 0,
    unpaidCount: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    situation: '',
    dateFrom: '',
    dateTo: '',
    isPaid: null as boolean | null,
  });

  const [detailModal, setDetailModal] = useState<PurchaseOrder | null>(null);
  const [detailItems, setDetailItems] = useState<PurchaseOrderItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Novo Pedido
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string; phone?: string }[]>([]);
  const [newOrder, setNewOrder] = useState({
    supplier_name: '', supplier_phone: '', order_date: new Date().toISOString().split('T')[0],
    delivery_date: '', observations: '', payment_form: '', payment_conditions: '',
  });
  const [newOrderItems, setNewOrderItems] = useState<{ description: string; unit: string; quantity: number; unit_cost: number }[]>([
    { description: '', unit: 'UN', quantity: 1, unit_cost: 0 },
  ]);

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 350);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await inventoryService.getPurchaseOrders({
        search: debouncedSearch || undefined,
        situation: filters.situation || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        isPaid: filters.isPaid,
        page,
        pageSize: PAGE_SIZE,
      });
      setOrders(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.situation, filters.dateFrom, filters.dateTo, filters.isPaid, page]);

  const loadStats = useCallback(async () => {
    try {
      const s = await inventoryService.getPurchaseOrderStats();
      setStats(s);
    } catch (err) {
      console.error('Erro ao carregar stats de compras:', err);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadOrders(); }, [loadOrders]);
  useEffect(() => { setPage(1); }, [debouncedSearch, filters.situation, filters.dateFrom, filters.dateTo, filters.isPaid]);

  const openDetail = async (order: PurchaseOrder) => {
    setDetailModal(order);
    setLoadingDetail(true);
    try {
      const items = await inventoryService.getPurchaseOrderItems(order.id);
      setDetailItems(items);
    } catch (err) {
      console.error('Erro ao carregar itens do pedido:', err);
      setDetailItems([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const situationBadge = (situation?: string) => {
    if (!situation) return null;
    const lower = situation.toLowerCase();
    let cls = 'bg-slate-700/50 text-slate-400';
    if (lower.includes('aberto') || lower.includes('pendente')) cls = 'bg-amber-500/10 text-amber-400';
    else if (lower.includes('finaliz') || lower.includes('conclu') || lower.includes('fechad')) cls = 'bg-emerald-500/10 text-emerald-400';
    else if (lower.includes('cancel')) cls = 'bg-red-500/10 text-red-400';
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${cls}`}>
        {situation}
      </span>
    );
  };

  const openReceiptModal = (receipt?: PurchaseReceipt) => {
    setSelectedReceipt(receipt || null);
    setReceiptModalOpen(true);
  };

  const handleReceiptSaved = () => {
    setReceiptModalOpen(false);
    setSelectedReceipt(null);
    setRetiradasKey(k => k + 1);
  };

  // --- Novo Pedido ---
  const openNewOrder = async () => {
    setNewOrder({ supplier_name: '', supplier_phone: '', order_date: new Date().toISOString().split('T')[0], delivery_date: '', observations: '', payment_form: '', payment_conditions: '' });
    setNewOrderItems([{ description: '', unit: 'UN', quantity: 1, unit_cost: 0 }]);
    // Carregar fornecedores
    const { data } = await supabase.from('entities').select('id, name, phone').order('name');
    setSuppliers(data || []);
    setNewOrderModal(true);
  };

  const addOrderItem = () => setNewOrderItems(prev => [...prev, { description: '', unit: 'UN', quantity: 1, unit_cost: 0 }]);
  const removeOrderItem = (idx: number) => setNewOrderItems(prev => prev.filter((_, i) => i !== idx));
  const updateOrderItem = (idx: number, field: string, value: any) => {
    setNewOrderItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const saveNewOrder = async () => {
    const validItems = newOrderItems.filter(i => i.description.trim());
    if (!newOrder.supplier_name.trim()) return alert('Informe o fornecedor');
    if (validItems.length === 0) return alert('Adicione pelo menos 1 item');

    setSavingOrder(true);
    try {
      // Gerar próximo número de pedido
      const { data: maxOrder } = await supabase.from('purchase_orders').select('order_number').order('order_number', { ascending: false }).limit(1).single();
      const nextNumber = (maxOrder?.order_number || 0) + 1;

      const totalValue = validItems.reduce((sum, i) => sum + (i.quantity * i.unit_cost), 0);

      const { data: order, error } = await supabase.from('purchase_orders').insert({
        order_number: nextNumber,
        is_order: true,
        is_quote: false,
        order_date: newOrder.order_date,
        delivery_date: newOrder.delivery_date || null,
        supplier_name: newOrder.supplier_name,
        supplier_phone: newOrder.supplier_phone || null,
        situation: 'Aberto',
        situation_code: 1,
        items_count: validItems.length,
        total_qty: validItems.reduce((s, i) => s + i.quantity, 0),
        products_value: totalValue,
        total_value: totalValue,
        other_costs: 0,
        discount: 0,
        is_paid: false,
        payment_form: newOrder.payment_form || null,
        payment_conditions: newOrder.payment_conditions || null,
        observations: newOrder.observations || null,
        status: true,
      }).select().single();

      if (error) throw error;

      // Inserir itens
      const itemsToInsert = validItems.map((item, idx) => ({
        purchase_order_id: order.id,
        order_number: nextNumber,
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        unit_price: item.unit_cost,
        total: item.quantity * item.unit_cost,
        is_product: true,
        discount: 0,
        discount_percent: 0,
        shortage: 0,
      }));

      await supabase.from('purchase_order_items').insert(itemsToInsert);

      setNewOrderModal(false);
      loadOrders();
      loadStats();
    } catch (err) {
      console.error('Erro ao salvar pedido:', err);
      alert('Erro ao salvar pedido: ' + (err as Error).message);
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation */}
      <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1 gap-1">
        {([
          { key: 'PEDIDOS' as ComprasSubTab, label: 'Pedidos de Compra', icon: ShoppingCart },
          { key: 'RETIRADAS' as ComprasSubTab, label: 'Retiradas', icon: ClipboardList },
          { key: 'NOTAS_FISCAIS' as ComprasSubTab, label: 'Notas Fiscais', icon: FileText },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-1 justify-center ${
              subTab === tab.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-Tab Content */}
      {subTab === 'RETIRADAS' && (
        <RetiradasSubTab key={retiradasKey} onOpenReceipt={openReceiptModal} />
      )}

      {subTab === 'NOTAS_FISCAIS' && (
        <NotasFiscaisSubTab />
      )}

      {subTab === 'PEDIDOS' && (
      <>
      {/* Header com botão Novo */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-white uppercase tracking-widest">Pedidos de Compra</h2>
        <button onClick={openNewOrder} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl transition-all active:scale-95">
          <Plus size={16} /> Novo Pedido
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <ShoppingCart size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Pedidos</p>
              <h3 className="text-2xl font-black text-white">{stats.totalOrders.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Truck size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entregas Pendentes</p>
              <h3 className="text-2xl font-black text-amber-400">{stats.pendingDeliveries}</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <DollarSign size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Gasto</p>
              <h3 className="text-xl font-black text-emerald-400">{formatCurrency(stats.totalSpent)}</h3>
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
                placeholder="Buscar fornecedor, n. pedido..."
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-600 focus:outline-none text-white"
              />
              {filters.search && (
                <button onClick={() => setFilters({ ...filters, search: '' })} className="text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Situation */}
            <select
              value={filters.situation}
              onChange={(e) => setFilters({ ...filters, situation: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
            >
              <option value="">Todas Situacoes</option>
              <option value="Aberto">Aberto</option>
              <option value="Fechado">Fechado</option>
              <option value="Cancelado">Cancelado</option>
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

            {/* Paid Toggle */}
            <div className="flex bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <button
                onClick={() => setFilters({ ...filters, isPaid: null })}
                className={`px-3 py-2 text-xs font-bold transition-all ${filters.isPaid === null ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilters({ ...filters, isPaid: true })}
                className={`px-3 py-2 text-xs font-bold transition-all flex items-center gap-1 ${filters.isPaid === true ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <CheckCircle size={12} /> Pagos
              </button>
              <button
                onClick={() => setFilters({ ...filters, isPaid: false })}
                className={`px-3 py-2 text-xs font-bold transition-all flex items-center gap-1 ${filters.isPaid === false ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <XCircle size={12} /> Pendentes
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-4 py-3">N. Pedido</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Fornecedor</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Situacao</th>
                <th className="px-4 py-3 text-right">Itens</th>
                <th className="px-4 py-3 text-right">Valor Total</th>
                <th className="px-4 py-3 text-center">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => openDetail(order)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3 font-mono text-sm font-bold text-white">
                    #{order.order_number}
                  </td>
                  <td className="px-4 py-3">
                    {order.is_order ? (
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase rounded-full">
                        Pedido
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase rounded-full">
                        Orcamento
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-white truncate max-w-[200px]">
                      {order.supplier_name || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(order.order_date)}</td>
                  <td className="px-4 py-3">{situationBadge(order.situation)}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 text-right font-bold">{order.items_count}</td>
                  <td className="px-4 py-3 text-sm text-emerald-400 text-right font-mono font-bold">
                    {formatCurrency(order.total_value)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {order.is_paid ? (
                      <CheckCircle size={16} className="text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle size={16} className="text-red-500/50 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold">Nenhum pedido encontrado</p>
                    <p className="text-xs mt-1">Tente ajustar os filtros ou a busca</p>
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
              <>Exibindo {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, totalCount)} de {totalCount.toLocaleString()} pedidos</>
            ) : (
              'Nenhum pedido'
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
      <Modal
        isOpen={!!detailModal}
        onClose={() => { setDetailModal(null); setDetailItems([]); }}
        title={detailModal ? `Pedido #${detailModal.order_number}` : ''}
        size="4xl"
      >
        {detailModal && (
          <div className="space-y-6">
            {/* Header badge */}
            <div className="flex items-center gap-3">
              {detailModal.is_order ? (
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-black uppercase rounded-full">Pedido de Compra</span>
              ) : (
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-black uppercase rounded-full">Orcamento</span>
              )}
              {situationBadge(detailModal.situation)}
              {detailModal.is_paid ? (
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase rounded-full flex items-center gap-1">
                  <CheckCircle size={12} /> Pago
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-black uppercase rounded-full flex items-center gap-1">
                  <XCircle size={12} /> Pendente
                </span>
              )}
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left: Supplier + Delivery + Technician */}
              <div className="space-y-4">
                {/* Supplier */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} /> Fornecedor
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nome:</span>
                      <span className="text-white font-bold">{detailModal.supplier_name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contato:</span>
                      <span className="text-slate-300">{detailModal.supplier_contact || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1"><Phone size={10} /> Telefone:</span>
                      <span className="text-slate-300">{detailModal.supplier_phone || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Truck size={14} /> Entrega
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Data Pedido:</span>
                      <span className="text-white font-bold">{formatDate(detailModal.order_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hora Pedido:</span>
                      <span className="text-slate-300">{detailModal.order_time || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Data Entrega:</span>
                      <span className="text-amber-400 font-bold">{formatDate(detailModal.delivery_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hora Entrega:</span>
                      <span className="text-slate-300">{detailModal.delivery_time || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Technician */}
                {detailModal.technician_name && (
                  <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Solicitante</h4>
                    <p className="text-sm text-white font-bold">{detailModal.technician_name}</p>
                  </div>
                )}
              </div>

              {/* Right: Payment + Financial */}
              <div className="space-y-4">
                {/* Payment */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={14} /> Pagamento
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Forma:</span>
                      <span className="text-white font-bold">{detailModal.payment_form || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Condicoes:</span>
                      <span className="text-slate-300">{detailModal.payment_conditions || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nota Fiscal:</span>
                      <span className="text-slate-300 font-mono">{detailModal.invoice_number || '-'}</span>
                    </div>
                    {detailModal.invoice_date && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Data NF:</span>
                        <span className="text-slate-300">{formatDate(detailModal.invoice_date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 space-y-3">
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={14} /> Resumo Financeiro
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valor Produtos:</span>
                      <span className="text-white font-mono">{formatCurrency(detailModal.products_value)}</span>
                    </div>
                    {detailModal.other_costs > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Outros Custos:</span>
                        <span className="text-amber-400 font-mono">+{formatCurrency(detailModal.other_costs)}</span>
                      </div>
                    )}
                    {detailModal.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Desconto:</span>
                        <span className="text-red-400 font-mono">-{formatCurrency(detailModal.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-emerald-900/50">
                      <span className="text-white font-black">Total:</span>
                      <span className="text-emerald-400 font-black text-lg font-mono">{formatCurrency(detailModal.total_value)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                <Package size={14} className="text-slate-400" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Itens do Pedido ({detailItems.length})
                </h4>
              </div>

              {loadingDetail ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 mt-2">Carregando itens...</p>
                </div>
              ) : detailItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/50">
                        <th className="px-4 py-2">Descricao</th>
                        <th className="px-4 py-2">Ref</th>
                        <th className="px-4 py-2 text-right">Qtd</th>
                        <th className="px-4 py-2 text-right">Unit. Custo</th>
                        <th className="px-4 py-2 text-right">Unit. Preco</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {detailItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-2">
                            <p className="text-xs font-bold text-white truncate max-w-[250px]">{item.description}</p>
                          </td>
                          <td className="px-4 py-2 text-[10px] text-slate-400 font-mono">{item.reference || '-'}</td>
                          <td className="px-4 py-2 text-xs text-white text-right font-bold">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-400 text-right font-mono">
                            {formatCurrency(item.unit_cost)}
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-400 text-right font-mono">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-4 py-2 text-xs text-emerald-400 text-right font-mono font-bold">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs">Nenhum item neste pedido</div>
              )}
            </div>

            {/* Observations */}
            {detailModal.observations && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Observacoes</h4>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{detailModal.observations}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
      </>
      )}

      {/* Receipt Modal (shared across sub-tabs) */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => { setReceiptModalOpen(false); setSelectedReceipt(null); }}
        receipt={selectedReceipt}
        onSaved={handleReceiptSaved}
      />

      {/* Modal Novo Pedido de Compra */}
      <Modal isOpen={newOrderModal} onClose={() => setNewOrderModal(false)} title="Novo Pedido de Compra" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-1">
          {/* Fornecedor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Fornecedor *</label>
              <input list="supplier-list" value={newOrder.supplier_name}
                onChange={(e) => {
                  setNewOrder({ ...newOrder, supplier_name: e.target.value });
                  const match = suppliers.find(s => s.name === e.target.value);
                  if (match?.phone) setNewOrder(prev => ({ ...prev, supplier_name: e.target.value, supplier_phone: match.phone || '' }));
                }}
                placeholder="Digite ou selecione..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
              <datalist id="supplier-list">
                {suppliers.map(s => <option key={s.id} value={s.name} />)}
              </datalist>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Telefone</label>
              <input value={newOrder.supplier_phone} onChange={(e) => setNewOrder({ ...newOrder, supplier_phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Data do Pedido *</label>
              <input type="date" value={newOrder.order_date} onChange={(e) => setNewOrder({ ...newOrder, order_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Previsão Entrega</label>
              <input type="date" value={newOrder.delivery_date} onChange={(e) => setNewOrder({ ...newOrder, delivery_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Forma Pagamento</label>
              <input value={newOrder.payment_form} onChange={(e) => setNewOrder({ ...newOrder, payment_form: e.target.value })}
                placeholder="PIX, Boleto, etc."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
          </div>

          {/* Itens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Itens do Pedido</label>
              <button onClick={addOrderItem} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Plus size={12} /> Adicionar Item
              </button>
            </div>
            <div className="space-y-2">
              {newOrderItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                  <input value={item.description} onChange={(e) => updateOrderItem(idx, 'description', e.target.value)}
                    placeholder="Descrição do item" className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none placeholder:text-slate-600" />
                  <input value={item.unit} onChange={(e) => updateOrderItem(idx, 'unit', e.target.value)}
                    className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-white focus:outline-none" />
                  <input type="number" value={item.quantity} onChange={(e) => updateOrderItem(idx, 'quantity', Number(e.target.value))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-white focus:outline-none" min={0} step={1} />
                  <input type="number" value={item.unit_cost} onChange={(e) => updateOrderItem(idx, 'unit_cost', Number(e.target.value))}
                    placeholder="R$ Custo" className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-right text-white focus:outline-none" min={0} step={0.01} />
                  <span className="text-xs text-slate-400 w-20 text-right">{formatCurrency(item.quantity * item.unit_cost)}</span>
                  {newOrderItems.length > 1 && (
                    <button onClick={() => removeOrderItem(idx)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-2">
              <span className="text-sm font-black text-white">
                Total: {formatCurrency(newOrderItems.reduce((s, i) => s + i.quantity * i.unit_cost, 0))}
              </span>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Observações</label>
            <textarea value={newOrder.observations} onChange={(e) => setNewOrder({ ...newOrder, observations: e.target.value })}
              rows={2} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 outline-none resize-none" />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
          <button onClick={() => setNewOrderModal(false)} className="px-5 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">Cancelar</button>
          <button onClick={saveNewOrder} disabled={savingOrder}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50">
            {savingOrder ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {savingOrder ? 'Salvando...' : 'Salvar Pedido'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ComprasTab;
