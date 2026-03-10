import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Clock, Truck, History, ArrowLeft, ChevronRight, Building2, Plus } from 'lucide-react';
import { bungeService, BungeContract, BungeBilling, formatCurrency } from '../services/bungeService';
import BungeDashboardTab from '../components/billing/BungeDashboardTab';
import MensalidadeTab from '../components/billing/MensalidadeTab';
import HoraExtraTab from '../components/billing/HoraExtraTab';
import LocacaoTab from '../components/billing/LocacaoTab';
import BillingHistoryTab from '../components/billing/BillingHistoryTab';
import NovoClienteModal from '../components/billing/NovoClienteModal';
import StatCard from '../components/StatCard';
import { toast } from 'react-hot-toast';

// ============================================================
// Sub-tabs para quando está dentro de um cliente
// ============================================================
type ClientTabId = 'dashboard' | 'mensalidade' | 'he' | 'locacao' | 'historico';

const CLIENT_TABS: { id: ClientTabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'mensalidade', label: 'Mensalidade', icon: <FileText size={18} /> },
  { id: 'he', label: 'Hora Extra', icon: <Clock size={18} /> },
  { id: 'locacao', label: 'Locação', icon: <Truck size={18} /> },
  { id: 'historico', label: 'Histórico', icon: <History size={18} /> },
];

// Cores rotativas para ícones dos contratos
const CONTRACT_COLORS = [
  { bg: 'bg-amber-600/20', text: 'text-amber-400' },
  { bg: 'bg-blue-600/20', text: 'text-blue-400' },
  { bg: 'bg-emerald-600/20', text: 'text-emerald-400' },
  { bg: 'bg-purple-600/20', text: 'text-purple-400' },
  { bg: 'bg-rose-600/20', text: 'text-rose-400' },
];

interface ContractStats {
  total: number;
  pendentes: number;
  faturados: number;
}

// ============================================================
// Página principal de Faturamento
// ============================================================
const Billing: React.FC = () => {
  // Visão principal vs detalhes de um cliente
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [contracts, setContracts] = useState<BungeContract[]>([]);
  const [contractStats, setContractStats] = useState<Record<string, ContractStats>>({});
  const [clientTab, setClientTab] = useState<ClientTabId>('dashboard');
  const [loading, setLoading] = useState(true);
  const [showNovoCliente, setShowNovoCliente] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allContracts = await bungeService.listarContratos();
      const activeContracts = allContracts.filter(c => c.is_active);
      setContracts(activeContracts);

      // Carregar stats de cada contrato
      const statsMap: Record<string, ContractStats> = {};
      await Promise.all(
        activeContracts.map(async (contract) => {
          try {
            const stats = await bungeService.obterStats(contract.id);
            statsMap[contract.id] = {
              total: stats.totalMes,
              pendentes: stats.countPendentes,
              faturados: stats.countFaturados,
            };
          } catch {
            statsMap[contract.id] = { total: 0, pendentes: 0, faturados: 0 };
          }
        })
      );
      setContractStats(statsMap);
    } catch (err) {
      console.error('Erro ao carregar faturamento:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedContract = contracts.find(c => c.id === selectedContractId) || null;

  const handleViewBilling = (billing: BungeBilling) => {
    if (billing.billing_type === 'MENSALIDADE') setClientTab('mensalidade');
    else if (billing.billing_type === 'HE') setClientTab('he');
    else setClientTab('locacao');
  };

  // Stats agregados de todos os contratos
  const totalStats = Object.values(contractStats).reduce(
    (acc, s) => ({
      total: acc.total + s.total,
      pendentes: acc.pendentes + s.pendentes,
      faturados: acc.faturados + s.faturados,
    }),
    { total: 0, pendentes: 0, faturados: 0 }
  );

  // ============================================================
  // RENDER: Detalhes do cliente selecionado
  // ============================================================
  if (selectedContract) {
    return (
      <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Breadcrumb + Header */}
        <div>
          <button
            onClick={() => setSelectedContractId(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold mb-3 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para Faturamento
          </button>
          <h2 className="text-3xl font-black text-white tracking-tight">{selectedContract.client_name}</h2>
          <p className="text-slate-500 mt-1">
            Contrato: <span className="text-slate-300 font-bold">{selectedContract.contract_number}</span>
            {' — CNPJ: '}
            <span className="text-slate-400">{selectedContract.cnpj}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-950 border border-slate-800 rounded-2xl p-1.5 overflow-x-auto">
          {CLIENT_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setClientTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                clientTab === tab.id
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
          {clientTab === 'dashboard' && (
            <BungeDashboardTab contractId={selectedContract.id} onViewBilling={handleViewBilling} />
          )}
          {clientTab === 'mensalidade' && (
            <MensalidadeTab contractId={selectedContract.id} />
          )}
          {clientTab === 'he' && (
            <HoraExtraTab contractId={selectedContract.id} />
          )}
          {clientTab === 'locacao' && (
            <LocacaoTab contractId={selectedContract.id} />
          )}
          {clientTab === 'historico' && (
            <BillingHistoryTab contractId={selectedContract.id} />
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
          onClick={() => setShowNovoCliente(true)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-blue-500 hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      {/* Stats Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Faturamento Mês"
          value={formatCurrency(totalStats.total)}
          icon={<FileText size={24} />}
          iconBg="bg-blue-600"
        />
        <StatCard
          title="Pendentes"
          value={String(totalStats.pendentes)}
          icon={<Clock size={24} />}
          iconBg="bg-amber-600"
        />
        <StatCard
          title="Faturados"
          value={String(totalStats.faturados)}
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
        ) : contracts.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 text-sm font-bold">Nenhum contrato cadastrado.</p>
            <p className="text-slate-600 text-xs mt-1">Clique em "Novo Cliente" para cadastrar o primeiro contrato.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {contracts.map((contract, idx) => {
              const stats = contractStats[contract.id] || { total: 0, pendentes: 0, faturados: 0 };
              const color = CONTRACT_COLORS[idx % CONTRACT_COLORS.length];

              return (
                <div
                  key={contract.id}
                  onClick={() => { setSelectedContractId(contract.id); setClientTab('dashboard'); }}
                  className="p-6 hover:bg-slate-800/30 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 ${color.bg} rounded-2xl flex items-center justify-center`}>
                      <Building2 size={28} className={color.text} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white">{contract.client_name}</h4>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">
                        {contract.contract_number} — CNPJ: {contract.cnpj}
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
                      <p className="text-xl font-black text-white">{formatCurrency(stats.total)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {stats.pendentes > 0 && (
                        <span className="text-[10px] font-black px-2 py-1 rounded-full bg-amber-500/10 text-amber-400">
                          {stats.pendentes} pendente{stats.pendentes > 1 ? 's' : ''}
                        </span>
                      )}
                      <ChevronRight size={20} className="text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Novo Cliente */}
      <NovoClienteModal
        isOpen={showNovoCliente}
        onClose={() => setShowNovoCliente(false)}
        onCreated={loadData}
      />
    </div>
  );
};

export default Billing;
