
import React, { useState, useEffect, useCallback } from 'react';
import { InventoryCategory, InventoryBrand, InventoryTab } from '../types';
import { inventoryService } from '../services/inventoryService';
import {
  Package, ArrowLeftRight, ClipboardList, ShoppingCart,
  Users, BarChart3
} from 'lucide-react';

// Tab components
import EstoqueTab from '../components/inventory/EstoqueTab';
import MovimentacoesTab from '../components/inventory/MovimentacoesTab';
import OrdensServicoTab from '../components/inventory/OrdensServicoTab';
import ComprasTab from '../components/inventory/ComprasTab';
import TecnicosTab from '../components/inventory/TecnicosTab';
import RelatoriosTab from '../components/inventory/RelatoriosTab';

const TABS: { key: InventoryTab; label: string; icon: React.ReactNode }[] = [
  { key: 'ESTOQUE', label: 'Estoque', icon: <Package size={16} /> },
  { key: 'MOVIMENTACOES', label: 'Movimentações', icon: <ArrowLeftRight size={16} /> },
  { key: 'ORDENS_SERVICO', label: 'Ordens de Serviço', icon: <ClipboardList size={16} /> },
  { key: 'COMPRAS', label: 'Compras', icon: <ShoppingCart size={16} /> },
  { key: 'TECNICOS', label: 'Técnicos', icon: <Users size={16} /> },
  { key: 'RELATORIOS', label: 'Relatórios', icon: <BarChart3 size={16} /> },
];

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InventoryTab>('ESTOQUE');
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [brands, setBrands] = useState<InventoryBrand[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0, totalProducts: 0, totalServices: 0,
    belowMinimum: 0, outOfStock: 0, totalStockValue: 0, totalCostValue: 0,
  });
  const [metaLoading, setMetaLoading] = useState(true);

  const loadMeta = useCallback(async () => {
    setMetaLoading(true);
    try {
      const [cats, brs, st] = await Promise.all([
        inventoryService.getCategories(),
        inventoryService.getBrands(),
        inventoryService.getStats(),
      ]);
      setCategories(cats);
      setBrands(brs);
      setStats(st);
    } catch (err) {
      console.error('Erro ao carregar metadados:', err);
    } finally {
      setMetaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const renderTab = () => {
    switch (activeTab) {
      case 'ESTOQUE':
        return (
          <EstoqueTab
            categories={categories}
            brands={brands}
            onRefresh={loadMeta}
          />
        );
      case 'MOVIMENTACOES':
        return <MovimentacoesTab categories={categories} onRefresh={loadMeta} />;
      case 'ORDENS_SERVICO':
        return <OrdensServicoTab />;
      case 'COMPRAS':
        return <ComprasTab />;
      case 'TECNICOS':
        return <TecnicosTab />;
      case 'RELATORIOS':
        return <RelatoriosTab />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Almoxarifado e Estoque</h2>
        <p className="text-slate-500 mt-1">
          {metaLoading ? 'Carregando...' : (
            <>{stats.totalProducts} produtos e {stats.totalServices} serviços cadastrados · Dados do OS Oficina migrados</>
          )}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      {renderTab()}
    </div>
  );
};

export default Inventory;
