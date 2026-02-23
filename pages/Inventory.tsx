
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { InventoryItem, InventoryCategory, InventoryBrand } from '../types';
import {
  Search, Plus, Filter, Download, AlertTriangle, Image as ImageIcon,
  Camera, Save, Package, Wrench, Trash2, ChevronLeft, ChevronRight,
  X, DollarSign, MapPin, Tag, BarChart3, Box, TrendingDown
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import Modal from '../components/Modal';

const PAGE_SIZE = 50;

const Inventory: React.FC = () => {
  // Data state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [brands, setBrands] = useState<InventoryBrand[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalItems: 0, totalProducts: 0, totalServices: 0,
    belowMinimum: 0, outOfStock: 0, totalStockValue: 0, totalCostValue: 0
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'products' | 'services'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    description: '',
    sku: '',
    barcode: '',
    unit: 'UNI',
    is_product: true,
    is_service: false,
    item_type: 'PRODUTO',
    category_name: '',
    brand_name: '',
    location: '',
    qty_minimum: 0,
    qty_current: 0,
    qty_maximum: 0,
    cost_price: 0,
    sell_price: 0,
    margin_percent: 0,
    notes: '',
    active: true,
  });

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load data
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await inventoryService.getItems({
        search: debouncedSearch || undefined,
        category: filterCategory || undefined,
        status: filterStatus || undefined,
        onlyProducts: filterType === 'products',
        onlyServices: filterType === 'services',
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error('Erro ao carregar itens:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterCategory, filterStatus, filterType, page]);

  const loadMeta = useCallback(async () => {
    const [cats, brs, st] = await Promise.all([
      inventoryService.getCategories(),
      inventoryService.getBrands(),
      inventoryService.getStats(),
    ]);
    setCategories(cats);
    setBrands(brs);
    setStats(st);
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterCategory, filterStatus, filterType]);

  // Pagination
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Format currency
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Form handlers
  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      description: '', sku: '', barcode: '', unit: 'UNI',
      is_product: true, is_service: false, item_type: 'PRODUTO',
      category_name: '', brand_name: '', location: '',
      qty_minimum: 0, qty_current: 0, qty_maximum: 0,
      cost_price: 0, sell_price: 0, margin_percent: 0,
      notes: '', active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.description) return;
    setSaving(true);

    try {
      // Calcular margem se tiver preços
      const cost = Number(formData.cost_price) || 0;
      const sell = Number(formData.sell_price) || 0;
      const margin = cost > 0 ? ((sell - cost) / cost) * 100 : 0;

      const payload: Partial<InventoryItem> = {
        ...formData,
        cost_price: cost,
        sell_price: sell,
        margin_percent: Math.round(margin * 100) / 100,
        qty_minimum: Number(formData.qty_minimum) || 0,
        qty_current: Number(formData.qty_current) || 0,
        qty_maximum: Number(formData.qty_maximum) || 0,
        item_type: formData.is_service ? 'SERVICO' : 'PRODUTO',
      };

      // Encontrar category_id e brand_id pelos nomes
      if (formData.category_name) {
        const cat = categories.find(c => c.name === formData.category_name);
        if (cat) payload.category_id = cat.id;
      }
      if (formData.brand_name) {
        const brand = brands.find(b => b.name === formData.brand_name);
        if (brand) payload.brand_id = brand.id;
      }

      if (editingItem) {
        await inventoryService.updateItem(editingItem.id, payload);
      } else {
        await inventoryService.createItem(payload);
      }

      setIsModalOpen(false);
      loadItems();
      loadMeta();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: InventoryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm(`Excluir "${item.description}" do estoque?`)) {
      await inventoryService.deleteItem(item.id);
      loadItems();
      loadMeta();
    }
  };

  // CSV Export
  const handleExport = () => {
    const headers = ['Codigo', 'SKU', 'Descricao', 'Categoria', 'Marca', 'Unidade', 'Qty Atual', 'Qty Min', 'Custo', 'Venda', 'Localizacao', 'Status'];
    const rows = items.map(i => [
      i.code, i.sku || '', i.description, i.category_name || '', i.brand_name || '', i.unit,
      i.qty_current, i.qty_minimum, i.cost_price, i.sell_price, i.location || '', i.status || ''
    ]);

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estoque_terrapro_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#007a33] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm">Carregando almoxarifado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Almoxarifado e Estoque</h2>
          <p className="text-slate-500 mt-1">
            {stats.totalProducts} produtos e {stats.totalServices} servi&ccedil;os cadastrados &middot; Dados do OS Oficina migrados
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openNewModal}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Novo Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl"><Package size={20} className="text-blue-400" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total de Itens</p>
              <h3 className="text-2xl font-black text-white">{stats.totalItems.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-red-950/20 border border-red-900/50 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10"><AlertTriangle size={60} className="text-red-500" /></div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl"><TrendingDown size={20} className="text-red-400" /></div>
            <div>
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Abaixo do M&iacute;nimo</p>
              <h3 className="text-2xl font-black text-red-500">{stats.belowMinimum}</h3>
            </div>
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-900/50 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl"><Box size={20} className="text-amber-400" /></div>
            <div>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Sem Estoque</p>
              <h3 className="text-2xl font-black text-amber-500">{stats.outOfStock}</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl"><DollarSign size={20} className="text-emerald-400" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor em Estoque</p>
              <h3 className="text-xl font-black text-white">{formatCurrency(stats.totalCostValue)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Search & Filters Bar */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 w-full max-w-md focus-within:border-blue-500 transition-all">
              <Search size={18} className="text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por descri&ccedil;&atilde;o, SKU, c&oacute;digo ou c&oacute;digo de barras..."
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-600 focus:outline-none text-white"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-white"><X size={16} /></button>
              )}
            </div>
            <div className="flex gap-2">
              {/* Type filter buttons */}
              <div className="flex bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-2 text-xs font-bold transition-all ${filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType('products')}
                  className={`px-3 py-2 text-xs font-bold transition-all flex items-center gap-1 ${filterType === 'products' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Package size={14} /> Produtos
                </button>
                <button
                  onClick={() => setFilterType('services')}
                  className={`px-3 py-2 text-xs font-bold transition-all flex items-center gap-1 ${filterType === 'services' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Wrench size={14} /> Servi&ccedil;os
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-xl transition-all ${showFilters ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800'}`}
              >
                <Filter size={20} />
              </button>
              <button onClick={handleExport} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all" title="Exportar CSV">
                <Download size={20} />
              </button>
            </div>
          </div>

          {/* Extended filters */}
          {showFilters && (
            <div className="flex gap-3 pt-2 border-t border-slate-800">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
              >
                <option value="">Todas Categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
              >
                <option value="">Todos Status</option>
                <option value="NORMAL">Normal</option>
                <option value="WARNING">Aten&ccedil;&atilde;o</option>
                <option value="CRITICAL">Cr&iacute;tico</option>
              </select>

              <button
                onClick={() => { setFilterCategory(''); setFilterStatus(''); setFilterType('all'); setSearchTerm(''); }}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-all"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-4 py-3 w-16">C&oacute;d</th>
                <th className="px-4 py-3">Descri&ccedil;&atilde;o</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Qtd Atual</th>
                <th className="px-4 py-3 text-right">M&iacute;nimo</th>
                <th className="px-4 py-3 text-right">Custo</th>
                <th className="px-4 py-3 text-right">Venda</th>
                <th className="px-4 py-3">Local</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => openEditModal(item)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.code}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-white truncate max-w-xs">{item.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.sku && <span className="text-[10px] text-slate-500 font-mono">{item.sku}</span>}
                      {item.brand_name && <span className="text-[10px] text-slate-600">&middot; {item.brand_name}</span>}
                      {item.is_service && <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-bold">SERV</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-lg uppercase truncate inline-block max-w-[120px]">
                      {item.category_name || '-'}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-black text-right ${
                    item.status === 'CRITICAL' ? 'text-red-500' :
                    item.status === 'WARNING' ? 'text-amber-500' : 'text-white'
                  }`}>
                    {item.is_product ? `${item.qty_current} ${item.unit}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-bold text-right">
                    {item.is_product && item.qty_minimum > 0 ? `${item.qty_minimum} ${item.unit}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 text-right font-mono">
                    {item.cost_price > 0 ? formatCurrency(item.cost_price) : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-emerald-400 text-right font-mono font-bold">
                    {item.sell_price > 0 ? formatCurrency(item.sell_price) : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 truncate max-w-[100px]">{item.location || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        item.status === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-500' :
                        item.status === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-red-500 animate-pulse'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'NORMAL' ? 'bg-emerald-500' :
                          item.status === 'WARNING' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => handleDelete(item, e)}
                      className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/20 rounded transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                    <Package size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold">Nenhum item encontrado</p>
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
              <>Exibindo {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, totalCount)} de {totalCount.toLocaleString()} itens</>
            ) : (
              'Nenhum item'
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
              <span className="text-xs text-slate-400 font-bold px-2">
                {page} / {totalPages}
              </span>
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

      {/* Modal - Cadastro/Edicao */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Editar: ${editingItem.description.slice(0, 40)}...` : 'Novo Produto / Servi\u00e7o'}
        size="4xl"
      >
        <div className="flex gap-6">
          {/* Left Column - Photos + Info */}
          <div className="w-1/3 space-y-4">
            {/* Photo placeholders */}
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer">
                <Camera size={28} className="mb-1 opacity-50" />
                <span className="text-[9px] font-bold uppercase">Foto 1</span>
              </div>
              <div className="aspect-square bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer">
                <ImageIcon size={28} className="mb-1 opacity-50" />
                <span className="text-[9px] font-bold uppercase">Foto 2</span>
              </div>
            </div>

            {/* Quick stats quando editando */}
            {editingItem && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 size={14} /> Resumo
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">C&oacute;digo:</span>
                    <span className="text-amber-400 font-bold font-mono">{editingItem.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipo:</span>
                    <span className={`font-bold ${editingItem.is_service ? 'text-purple-400' : 'text-blue-400'}`}>
                      {editingItem.is_service ? 'Servi\u00e7o' : 'Produto'}
                    </span>
                  </div>
                  {editingItem.is_product && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Entradas:</span>
                        <span className="text-emerald-400 font-bold">{editingItem.qty_in}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sa&iacute;das:</span>
                        <span className="text-red-400 font-bold">{editingItem.qty_out}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Saldo:</span>
                        <span className="text-white font-bold">{editingItem.qty_balance}</span>
                      </div>
                    </>
                  )}
                  {editingItem.last_purchase_date && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">&Uacute;lt. Compra:</span>
                      <span className="text-slate-300 font-bold">{editingItem.last_purchase_date}</span>
                    </div>
                  )}
                  {editingItem.most_sold_qty > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mais Vendido:</span>
                      <span className="text-slate-300 font-bold">{editingItem.most_sold_qty} un</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Purchase suggestion */}
            {editingItem && editingItem.is_product && editingItem.cost_price > 0 && (
              <div className="bg-blue-600/10 border border-blue-600/20 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <DollarSign size={14} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Pre&ccedil;os</h4>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Custo:</span>
                    <span className="text-white font-bold">{formatCurrency(editingItem.cost_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Venda:</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(editingItem.sell_price)}</span>
                  </div>
                  {editingItem.margin_percent > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Margem:</span>
                      <span className="text-blue-400 font-bold">{editingItem.margin_percent}%</span>
                    </div>
                  )}
                  {editingItem.wholesale_price > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Atacado:</span>
                      <span className="text-slate-300 font-bold">{formatCurrency(editingItem.wholesale_price)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Form */}
          <div className="flex-1 space-y-4">
            {/* Type toggle */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_product}
                  onChange={(e) => setFormData({
                    ...formData,
                    is_product: e.target.checked,
                    is_service: !e.target.checked,
                    item_type: e.target.checked ? 'PRODUTO' : 'SERVICO'
                  })}
                  className="accent-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-white uppercase">Produto</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_service}
                  onChange={(e) => setFormData({
                    ...formData,
                    is_service: e.target.checked,
                    is_product: !e.target.checked,
                    item_type: e.target.checked ? 'SERVICO' : 'PRODUTO'
                  })}
                  className="accent-purple-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-white uppercase">Servi&ccedil;o</span>
              </label>

              {editingItem && (
                <div className="ml-auto">
                  <span className="text-[10px] font-bold text-slate-500">COD</span>
                  <span className="ml-2 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500 text-xs font-bold font-mono">
                    {editingItem.code}
                  </span>
                </div>
              )}
            </div>

            {/* Description + Unit */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-10 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Descri&ccedil;&atilde;o</label>
                <input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="DESCRI&Ccedil;&Atilde;O DO PRODUTO OU SERVI&Ccedil;O"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm font-bold focus:border-emerald-500 outline-none uppercase"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Unid</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white text-xs focus:border-emerald-500 outline-none"
                >
                  <option>UNI</option><option>PC</option><option>PCA</option>
                  <option>KG</option><option>LT</option><option>MT</option>
                  <option>CX</option><option>JG</option><option>GL</option>
                </select>
              </div>
            </div>

            {/* SKU + Barcode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Refer&ecirc;ncia / SKU</label>
                <input
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Part Number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 outline-none uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">C&oacute;d. Barras</label>
                <input
                  value={formData.barcode || ''}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="EAN-13"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Category + Brand */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Categoria</label>
                <select
                  value={formData.category_name || ''}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 outline-none"
                >
                  <option value="">Selecione...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Marca</label>
                <select
                  value={formData.brand_name || ''}
                  onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 outline-none"
                >
                  <option value="">Selecione...</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <MapPin size={12} /> Localiza&ccedil;&atilde;o F&iacute;sica
              </label>
              <input
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: A-001-01, PRATELEIRA 3"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 outline-none uppercase"
              />
            </div>

            {/* Stock + Pricing (only for products) */}
            {formData.is_product && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Stock control */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1 flex items-center gap-1">
                    <Box size={12} /> Estoque
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400">M&iacute;nimo</label>
                      <input
                        type="number"
                        value={formData.qty_minimum}
                        onChange={(e) => setFormData({ ...formData, qty_minimum: Number(e.target.value) })}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-xs text-white w-24"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400">Atual</label>
                      <input
                        type="number"
                        value={formData.qty_current}
                        onChange={(e) => setFormData({ ...formData, qty_current: Number(e.target.value) })}
                        className="bg-slate-900 border border-emerald-500/50 rounded px-2 py-1 text-right text-xs text-emerald-400 font-bold w-24"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400">M&aacute;ximo</label>
                      <input
                        type="number"
                        value={formData.qty_maximum}
                        onChange={(e) => setFormData({ ...formData, qty_maximum: Number(e.target.value) })}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-xs text-white w-24"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1 flex items-center gap-1">
                    <DollarSign size={12} /> Pre&ccedil;os
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400">Custo</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cost_price}
                        onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-xs text-white w-24"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400">Venda</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.sell_price}
                        onChange={(e) => setFormData({ ...formData, sell_price: Number(e.target.value) })}
                        className="bg-slate-900 border border-emerald-500/50 rounded px-2 py-1 text-right text-xs text-emerald-400 font-bold w-24"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400">Margem</label>
                      <div className="text-xs text-blue-400 font-bold">
                        {(() => {
                          const c = Number(formData.cost_price) || 0;
                          const s = Number(formData.sell_price) || 0;
                          return c > 0 ? `${(((s - c) / c) * 100).toFixed(1)}%` : '-';
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Observa&ccedil;&otilde;es</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Notas internas..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-5 flex justify-end gap-3 border-t border-slate-800 mt-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-6 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-700 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.description}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Salvando...' : (editingItem ? 'Salvar Altera\u00e7\u00f5es' : 'Salvar Item')}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
