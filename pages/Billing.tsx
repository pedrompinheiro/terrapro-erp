import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Clock, Truck, History, ArrowLeft, ChevronRight, Building2, Plus } from 'lucide-react';
import { bungeService, BungeContract, BungeBilling, formatCurrency } from '../services/bungeService';
import BungeDashboardTab from '../components/billing/BungeDashboardTab';
import MensalidadeTab from '../components/billing/MensalidadeTab';
import HoraExtraTab from '../components/billing/HoraExtraTab';
import LocacaoTab from '../components/billing/LocacaoTab';
import BillingHistoryTab from '../components/billing/BillingHistoryTab';
import StatCard from '../components/StatCard';
import { toast } from 'react-hot-toast';

// ============================================================
// Sub-tabs para quando está dentro de um cliente (ex: Bunge)
// ============================================================
type BungeTabId = 'dashboard' | 'mensalidade' | 'he' | 'locacao' | 'historico';

const BUNGE_TABS: { id: BungeTabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'mensalidade', label: 'Mensalidade', icon: <FileText size={18} /> },
  { id: 'he', label: 'Hora Extra', icon: <Clock size={18} /> },
  { id: 'locacao', label: 'Locação', icon: <Truck size={18} /> },
  { id: 'historico', label: 'Histórico', icon: <History size={18} /> },
];

// ============================================================
// Página principal de Faturamento
// ============================================================
const Billing: React.FC = () => {
  // Visão principal vs detalhes de um cliente
  const [selectedClient, setSelectedClient] = useState<'bunge' | null>(null);
  const [bungeContract, setBungeContract] = useState<BungeContract | null>(null);
  const [bungeTab, setBungeTab] = useState<BungeTabId>('dashboard');
  const [loading, setLoading] = useState(true);

  // Stats gerais
  const [bungeStats, setBungeStats] = useState({ total: 0, pendentes: 0, faturados: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const contract = await bungeService.obterContratoAtivo();
      setBungeContract(contract);

      if (contract) {
        const stats = await bungeService.obterStats(contract.id);
        setBungeStats({
          total: stats.totalMes,
          pendentes: stats.countPendentes,
          faturados: stats.countFaturados,
        });
      }
    } catch (err) {
      console.error('Erro ao carregar faturamento:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBilling = (billing: BungeBilling) => {
    if (billing.billing_type === 'MENSALIDADE') setBungeTab('mensalidade');
    else if (billing.billing_type === 'HE') setBungeTab('he');
    else setBungeTab('locacao');
  };

  // ============================================================
  // RENDER: Detalhes do cliente Bunge
  // ============================================================
  if (selectedClient === 'bunge' && bungeContract) {
    return (
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Breadcrumb + Header */}
        <div>
          <button
            onClick={() => setSelectedClient(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold mb-3 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para Faturamento
          </button>
          <h2 className="text-3xl font-black text-white tracking-tight">Bunge Alimentos S.A.</h2>
          <p className="text-slate-500 mt-1">
            Contrato: <span className="text-slate-300 font-bold">{bungeContract.contract_number}</span>
            {' — CNPJ: '}
            <span className="text-slate-400">{bungeContract.cnpj}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-950 border border-slate-800 rounded-2xl p-1.5 overflow-x-auto">
          {BUNGE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setBungeTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                bungeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-200">
          {bungeTab === 'dashboard' && (
            <BungeDashboardTab contractId={bungeContract.id} onViewBilling={handleViewBilling} />
          )}
          {bungeTab === 'mensalidade' && (
            <MensalidadeTab contractId={bungeContract.id} />
          )}
          {bungeTab === 'he' && (
            <HoraExtraTab contractId={bungeContract.id} />
          )}
          {bungeTab === 'locacao' && (
            <LocacaoTab contractId={bungeContract.id} />
          )}
          {bungeTab === 'historico' && (
            <BillingHistoryTab contractId={bungeContract.id} />
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Visão geral do módulo de Faturamento
  // ============================================================
  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Faturamento</h2>
          <p className="text-slate-500 mt-1">Gestão de contratos, faturamento mensal e geração de documentos fiscais.</p>
        </div>
        <button
          className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-2 opacity-50 cursor-not-allowed"
          disabled
        >
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      {/* Stats Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Faturamento Mês"
          value={formatCurrency(bungeStats.total)}
          icon={<FileText size={24} />}
          iconBg="bg-blue-600"
        />
        <StatCard
          title="Pendentes"
          value={String(bungeStats.pendentes)}
          icon={<Clock size={24} />}
          iconBg="bg-amber-600"
        />
        <StatCard
          title="Faturados"
          value={String(bungeStats.faturados)}
          icon={<Building2 size={24} />}
          iconBg="bg-emerald-600"
        />
      </div>

      {/* Lista de Clientes / Contratos */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-950/20">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Clientes & Contratos Ativos</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {/* BUNGE */}
            {bungeContract && (
              <div
                onClick={() => { setSelectedClient('bunge'); setBungeTab('dashboard'); }}
                className="p-6 hover:bg-slate-800/30 transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-amber-600/20 rounded-2xl flex items-center justify-center">
                    <Building2 size={28} className="text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">Bunge Alimentos S.A.</h4>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">
                      {bungeContract.contract_number} — CNPJ: {bungeContract.cnpj}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400">MENSALIDADE</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400">HORA EXTRA</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400">LOCAÇÃO</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-bold">Mês atual</p>
                    <p className="text-xl font-black text-white">{formatCurrency(bungeStats.total)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {bungeStats.pendentes > 0 && (
                      <span className="text-[10px] font-black px-2 py-1 rounded-full bg-amber-500/10 text-amber-400">
                        {bungeStats.pendentes} pendente{bungeStats.pendentes > 1 ? 's' : ''}
                      </span>
                    )}
                    <ChevronRight size={20} className="text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder para futuros clientes */}
            <div className="p-6 text-center">
              <p className="text-slate-600 text-sm">
                Outros contratos de faturamento aparecerão aqui conforme forem cadastrados.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
