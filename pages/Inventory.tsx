
import React, { useState } from 'react';
import { StockItem } from '../types';
import { Search, Plus, Filter, Download, AlertTriangle, Image as ImageIcon, Barcode, DollarSign, Camera, Save } from 'lucide-react';
import { dashboardService } from '../services/api';
import Modal from '../components/Modal';

const Inventory: React.FC = () => {
  const [stockData, setStockData] = React.useState<StockItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [editingSku, setEditingSku] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<Partial<StockItem>>({
    sku: '',
    description: '',
    category: 'PEÇAS',
    currentQty: 0,
    minQty: 0,
    location: '',
    status: 'NORMAL'
  });

  const loadStock = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getStock();
      setStockData(data as StockItem[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadStock();
  }, []);

  const handleSave = async () => {
    if (!formData.sku || !formData.description) return;

    const newItem: StockItem = {
      sku: formData.sku!,
      description: formData.description!,
      category: formData.category || 'GERAL',
      currentQty: Number(formData.currentQty) || 0,
      minQty: Number(formData.minQty) || 0,
      location: formData.location || 'ESTOQUE',
      status: (Number(formData.currentQty) || 0) <= (Number(formData.minQty) || 0) ? 'CRITICAL' : 'NORMAL'
    };

    if (editingSku) {
      await dashboardService.updateStockItem(newItem);
    } else {
      await dashboardService.addStockItem(newItem);
    }

    await loadStock();
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (sku: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Excluir este item do estoque?')) {
      await dashboardService.deleteStockItem(sku);
      await loadStock();
    }
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: StockItem) => {
    setEditingSku(item.sku);
    setFormData(item);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingSku(null);
    setFormData({
      sku: '',
      description: '',
      category: 'PEÇAS',
      currentQty: 0,
      minQty: 0,
      location: '',
      status: 'NORMAL'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#007a33] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Almoxarifado e Estoque</h2>
          <p className="text-slate-500 mt-1">Gestão de inventário e insumos críticos para operações pesadas.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openNewModal}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Novo Item
          </button>
          <button className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700 hover:bg-slate-700 transition-all">
            Entrada de Nota Fiscal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total de Itens</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-black text-white tracking-tight">{stockData.length}</h3>
            <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">+2.4%</span>
          </div>
        </div>
        <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
            <AlertTriangle size={80} className="text-red-500" />
          </div>
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Abaixo do Mínimo</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-black text-red-500 tracking-tight">{stockData.filter(i => i.status === 'CRITICAL').length}</h3>
            <span className="text-red-400 text-[10px] font-black uppercase tracking-tighter animate-pulse">Ação Necessária</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Valor em Estoque</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-black text-white tracking-tight">R$ 450.200</h3>
            <span className="text-slate-500 text-[10px] font-bold">Tempo Real</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 w-full max-w-md focus-within:border-blue-500 transition-all">
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder="Buscar peça ou SKU..."
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-600 focus:outline-none text-white"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all">
              <Filter size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all">
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Código/SKU</th>
                <th className="px-6 py-4">Descrição do Item</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Qtd. Atual</th>
                <th className="px-6 py-4">Mínimo</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stockData.map((item) => (
                <tr
                  key={item.sku}
                  onClick={() => openEditModal(item)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.sku}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white">{item.description}</p>
                    <p className="text-[10px] text-slate-500">Caterpillar 320D/320E</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-lg uppercase">{item.category}</span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-black ${item.status === 'CRITICAL' ? 'text-red-500' : 'text-white'}`}>
                    {item.currentQty} un
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-bold">{item.minQty} un</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{item.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-500' :
                        item.status === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-red-500/10 text-red-500 animate-pulse'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'NORMAL' ? 'bg-emerald-500' :
                          item.status === 'WARNING' ? 'bg-amber-500' :
                            'bg-red-500'
                          }`} />
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => handleDelete(item.sku, e)}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/20 rounded transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir Item"
                    >
                      <AlertTriangle size={16} /> {/* Using AlertTriangle as delete icon since Trash2 is not imported or available? Actually I think I can use Trash2 if imported. But imports are at top. I see AlertTriangle is imported. */}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-between items-center bg-slate-950/50">
          <p className="text-xs text-slate-500 font-medium">Exibindo {stockData.length} de {stockData.length} itens</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg hover:text-white transition-all">Anterior</button>
            <button className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg">1</button>
            <button className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg hover:text-white transition-all">Próximo</button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSku ? `Editar Produto: ${editingSku}` : "Cadastro de Produto de Venda / Insumo"}
      >
        <div className="flex gap-6">
          {/* Left Column - Images */}
          <div className="w-1/3 space-y-4">
            {/* ... Keep images section as static mock ... */}
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer group relative overflow-hidden">
                <Camera size={32} className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-bold uppercase text-center px-2">Foto Própria</span>
              </div>
              <div className="aspect-square bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-emerald-500 relative overflow-hidden">
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <ImageIcon size={32} className="mb-2" />
                <span className="text-[10px] font-bold uppercase text-center px-2">Sugestão Web (IA)</span>
                <button className="absolute bottom-2 inset-x-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 rounded text-[9px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/20">
                  Usar
                </button>
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/20 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Search size={16} />
                <h4 className="text-xs font-black uppercase tracking-widest">Sugestão de Compra</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Última Compra:</span>
                  <span className="text-white font-bold">R$ 14,80 (Peças & Cia)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Menor Preço Web:</span>
                  <span className="text-emerald-500 font-bold">R$ 12,50 (MercadoLivre)</span>
                </div>
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all">
                  Ver Ofertas Online
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Form Data */}
          <div className="flex-1 space-y-5">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-emerald-500 w-4 h-4" />
                <span className="text-xs font-bold text-white uppercase">Produto</span>
              </label>

              <div className="ml-auto flex gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Código / SKU</label>
                  <input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="235338"
                    className="w-24 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1 text-amber-500 text-xs font-bold text-center focus:outline-none"
                    readOnly={!!editingSku}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-10 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Descrição do Produto / Serviço</label>
                <input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="BUCHA DE FERRO DO PISTÃO..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm font-bold focus:border-emerald-500 outline-none uppercase"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Unidade</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white text-xs focus:border-emerald-500 outline-none">
                  <option>UNI</option>
                  <option>KG</option>
                  <option>LT</option>
                  <option>PC</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Referência / Part Number</label>
                <input placeholder="233-2613" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 outline-none uppercase" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Localização Física</label>
                <input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="C-005-01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 outline-none uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Marca / Fabricante</label>
                <input placeholder="USINA" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 outline-none uppercase" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Grupo / Categoria</label>
                <input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="BUCHA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 outline-none uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-2">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2">Controle de Estoque</h4>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <label className="text-xs text-slate-400 text-right">Mínimo</label>
                  <input
                    type="number"
                    value={formData.minQty}
                    onChange={(e) => setFormData({ ...formData, minQty: Number(e.target.value) })}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right text-xs text-white w-20"
                  />

                  <label className="text-xs text-slate-400 text-right">Atual</label>
                  <input
                    type="number"
                    value={formData.currentQty}
                    onChange={(e) => setFormData({ ...formData, currentQty: Number(e.target.value) })}
                    className="bg-slate-950 border border-emerald-500/50 rounded px-2 py-1 text-right text-xs text-emerald-500 font-bold w-20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t border-slate-800 mt-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-6 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-700 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm flex items-center gap-2"
          >
            <Save size={18} />
            {editingSku ? 'Salvar Alterações' : 'Salvar Produto'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
