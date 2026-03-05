import React, { useState, useEffect, useCallback } from 'react';
import { InventoryItem, InventoryCategory, InventoryBrand } from '../../types';
import {
  Search, Plus, Filter, Download, Image as ImageIcon,
  Camera, Save, Package, Wrench, Trash2, ChevronLeft, ChevronRight,
  X, DollarSign, MapPin, BarChart3, Box, Sparkles, Upload, Loader2, RefreshCw,
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { supabase } from '../../lib/supabase';
import { getSettingValue } from '../../lib/getGeminiKey';
import Modal from '../Modal';
import ItemMovementHistory from './ItemMovementHistory';

const PAGE_SIZE = 50;

interface EstoqueTabProps {
  categories: InventoryCategory[];
  brands: InventoryBrand[];
  onRefresh?: () => void;
}

const EstoqueTab: React.FC<EstoqueTabProps> = ({ categories, brands, onRefresh }) => {
  // Data state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  // Image states
  const [searchingImage, setSearchingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const photo2Ref = React.useRef<HTMLInputElement>(null);

  // Buscar imagem via Gemini AI (gera URL de busca de imagem)
  const searchProductImage = async () => {
    const desc = formData.description || editingItem?.description;
    const brand = formData.brand_name || editingItem?.brand_name;
    const sku = formData.sku || editingItem?.sku;
    if (!desc) return alert('Preencha a descrição do produto primeiro');

    setSearchingImage(true);
    try {
      const apiKey = await getSettingValue('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) return alert('Configure a chave Google AI em Configurações');

      const prompt = `Você é um assistente de busca de imagens de produtos industriais/peças/ferramentas.
Dado o produto abaixo, retorne APENAS uma URL direta de imagem JPG ou PNG que represente este produto.
A URL deve ser de um site público confiável (ex: images.tcdn.com.br, cdn.leroymerlin.com.br, images-americanas.com, m.media-amazon.com, etc).
Retorne APENAS a URL, sem explicação, sem markdown.

Produto: ${desc}
${brand ? `Marca: ${brand}` : ''}
${sku ? `SKU/Ref: ${sku}` : ''}`;

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3 },
          }),
        }
      );

      if (!resp.ok) throw new Error(`API error: ${resp.status}`);

      const data = await resp.json();
      const text = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();

      // Extrair URL da resposta
      const urlMatch = text.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)/i);
      if (urlMatch) {
        setFormData(prev => ({ ...prev, photo_1_url: urlMatch[0] }));
      } else {
        // Fallback: gerar URL de placeholder
        const query = encodeURIComponent(`${desc} ${brand || ''}`);
        setFormData(prev => ({ ...prev, photo_1_url: `https://via.placeholder.com/400x400/1e293b/94a3b8?text=${encodeURIComponent(desc.slice(0, 25))}` }));
        alert('IA não encontrou imagem direta. Placeholder adicionado — tente "Buscar outra" ou faça upload manual.');
      }
    } catch (err) {
      console.error('Erro na busca de imagem:', err);
      alert('Erro ao buscar imagem: ' + (err as Error).message);
    } finally {
      setSearchingImage(false);
    }
  };

  // Upload manual de foto 2
  const handlePhoto2Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from('integration-docs').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('integration-docs').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, photo_2_url: urlData.publicUrl }));
    } catch (err) {
      console.error('Erro no upload:', err);
      alert('Erro ao fazer upload: ' + (err as Error).message);
    } finally {
      setUploadingImage(false);
    }
  };

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

  // Load items
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
      onRefresh?.();
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
      onRefresh?.();
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

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          {totalCount.toLocaleString()} itens cadastrados
        </p>
        <button
          onClick={openNewModal}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Novo Item
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Search & Filters Bar */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 w-full max-w-md focus-within:border-blue-500 transition-all">
              <Search size={18} className="text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por descri\u00e7\u00e3o, SKU, c\u00f3digo ou c\u00f3digo de barras..."
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
                  <Wrench size={14} /> Servi\u00e7os
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
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
              >
                <option value="">Todas Categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
              >
                <option value="">Todos Status</option>
                <option value="NORMAL">Normal</option>
                <option value="WARNING">Aten\u00e7\u00e3o</option>
                <option value="CRITICAL">Cr\u00edtico</option>
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
                <th className="px-4 py-3 w-16">C\u00f3d</th>
                <th className="px-4 py-3">Descri\u00e7\u00e3o</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Qtd Atual</th>
                <th className="px-4 py-3 text-right">M\u00ednimo</th>
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
            {/* Photos - Foto 1 (IA) + Foto 2 (Upload) */}
            <div className="grid grid-cols-2 gap-2">
              {/* Foto 1 — Busca IA */}
              <div className="relative group">
                {formData.photo_1_url ? (
                  <div className="aspect-square bg-slate-950 border border-slate-700 rounded-xl overflow-hidden relative">
                    <img src={formData.photo_1_url} alt="Foto 1" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <button onClick={searchProductImage} disabled={searchingImage}
                      className="absolute bottom-1 right-1 p-1.5 bg-slate-900/90 hover:bg-blue-600 text-white rounded-lg transition-all text-[9px] flex items-center gap-1">
                      {searchingImage ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    </button>
                    <button onClick={() => setFormData(prev => ({ ...prev, photo_1_url: '' }))}
                      className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-500 text-white rounded-lg">
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <button onClick={searchProductImage} disabled={searchingImage}
                    className="aspect-square w-full bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-purple-500 hover:text-purple-400 transition-all cursor-pointer">
                    {searchingImage ? (
                      <Loader2 size={24} className="animate-spin mb-1 text-purple-400" />
                    ) : (
                      <Sparkles size={24} className="mb-1 opacity-70" />
                    )}
                    <span className="text-[8px] font-bold uppercase">{searchingImage ? 'Buscando...' : 'Buscar via IA'}</span>
                  </button>
                )}
              </div>

              {/* Foto 2 — Upload manual */}
              <div className="relative">
                <input ref={photo2Ref} type="file" accept="image/*" onChange={handlePhoto2Upload} className="hidden" />
                {formData.photo_2_url ? (
                  <div className="aspect-square bg-slate-950 border border-slate-700 rounded-xl overflow-hidden relative">
                    <img src={formData.photo_2_url} alt="Foto 2" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <button onClick={() => photo2Ref.current?.click()} disabled={uploadingImage}
                      className="absolute bottom-1 right-1 p-1.5 bg-slate-900/90 hover:bg-blue-600 text-white rounded-lg transition-all">
                      {uploadingImage ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    </button>
                    <button onClick={() => setFormData(prev => ({ ...prev, photo_2_url: '' }))}
                      className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-500 text-white rounded-lg">
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => photo2Ref.current?.click()} disabled={uploadingImage}
                    className="aspect-square w-full bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-emerald-500 hover:text-emerald-400 transition-all cursor-pointer">
                    {uploadingImage ? (
                      <Loader2 size={24} className="animate-spin mb-1 text-emerald-400" />
                    ) : (
                      <Upload size={24} className="mb-1 opacity-70" />
                    )}
                    <span className="text-[8px] font-bold uppercase">{uploadingImage ? 'Enviando...' : 'Upload Foto'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick stats when editing */}
            {editingItem && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 size={14} /> Resumo
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">C\u00f3digo:</span>
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
                        <span className="text-slate-500">Sa\u00eddas:</span>
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
                      <span className="text-slate-500">\u00dalt. Compra:</span>
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

            {/* Movement History when editing */}
            {editingItem && (
              <ItemMovementHistory itemId={editingItem.id} />
            )}

            {/* Pricing info */}
            {editingItem && editingItem.is_product && editingItem.cost_price > 0 && (
              <div className="bg-blue-600/10 border border-blue-600/20 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <DollarSign size={14} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Pre\u00e7os</h4>
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
                <span className="text-xs font-bold text-white uppercase">Servi\u00e7o</span>
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
                <label className="text-[10px] font-bold text-slate-500 uppercase">Descri\u00e7\u00e3o</label>
                <input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="DESCRI\u00c7\u00c3O DO PRODUTO OU SERVI\u00c7O"
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
                <label className="text-[10px] font-bold text-slate-500 uppercase">Refer\u00eancia / SKU</label>
                <input
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Part Number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 outline-none uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">C\u00f3d. Barras</label>
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
                <MapPin size={12} /> Localiza\u00e7\u00e3o F\u00edsica
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
                      <label className="text-xs text-slate-400">M\u00ednimo</label>
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
                      <label className="text-xs text-slate-400">M\u00e1ximo</label>
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
                    <DollarSign size={12} /> Pre\u00e7os
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
              <label className="text-[10px] font-bold text-slate-500 uppercase">Observa\u00e7\u00f5es</label>
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

export default EstoqueTab;
