import React, { useEffect, useState } from 'react';
import { DollarSign, Clock, Truck, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import StatCard from '../StatCard';
import { bungeService, BungeBilling, BungeBillingItem, formatCurrency, formatMonthYear } from '../../services/bungeService';
import { exportFechamentoGeralPDF } from '../../services/bungeExportService';
import { toast } from 'react-hot-toast';

interface Props {
  contractId: string | null;
  onViewBilling: (billing: BungeBilling) => void;
}

const statusColors: Record<string, string> = {
  RASCUNHO: 'bg-slate-500/10 text-slate-400',
  GERADO: 'bg-blue-500/10 text-blue-400',
  ENVIADO: 'bg-amber-500/10 text-amber-400',
  FATURADO: 'bg-emerald-500/10 text-emerald-400',
  RECEBIDO: 'bg-green-500/10 text-green-400',
  CANCELADO: 'bg-red-500/10 text-red-400',
};

const statusLabels: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  GERADO: 'Gerado',
  ENVIADO: 'Enviado',
  FATURADO: 'Faturado',
  RECEBIDO: 'Recebido',
  CANCELADO: 'Cancelado',
};

const BungeDashboardTab: React.FC<Props> = ({ contractId, onViewBilling }) => {
  const [stats, setStats] = useState({
    totalMes: 0, totalMensalidade: 0, totalHE: 0, totalLocacao: 0,
    countGerados: 0, countFaturados: 0, countPendentes: 0,
  });
  const [recentBillings, setRecentBillings] = useState<BungeBilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingFechamento, setExportingFechamento] = useState(false);
  const [fechamentoMonth, setFechamentoMonth] = useState(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    loadData();
  }, [contractId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, billings] = await Promise.all([
        bungeService.obterStats(contractId || undefined),
        bungeService.listarFaturamentos({ contract_id: contractId || undefined }),
      ]);
      setStats(statsData);
      setRecentBillings(billings.slice(0, 10));
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportFechamento = async () => {
    if (!contractId) return;
    setExportingFechamento(true);
    try {
      // Buscar faturamentos do mês selecionado
      const billings = await bungeService.listarFaturamentos({
        contract_id: contractId,
        reference_month: fechamentoMonth,
      });

      const activeBillings = billings.filter(b => b.status !== 'CANCELADO');

      if (activeBillings.length === 0) {
        toast.error(`Nenhum faturamento encontrado para ${formatMonthYear(fechamentoMonth)}`);
        setExportingFechamento(false);
        return;
      }

      // Separar por tipo e buscar itens
      let mensalidadeData: { billing: BungeBilling; items: BungeBillingItem[] } | null = null;
      let heData: { billing: BungeBilling; items: BungeBillingItem[] } | null = null;
      let locacaoData: { billing: BungeBilling; items: BungeBillingItem[] } | null = null;

      for (const b of activeBillings) {
        const items = await bungeService.listarItensFaturamento(b.id);
        if (b.billing_type === 'MENSALIDADE') mensalidadeData = { billing: b, items };
        else if (b.billing_type === 'HE') heData = { billing: b, items };
        else if (b.billing_type === 'LOCACAO') locacaoData = { billing: b, items };
      }

      exportFechamentoGeralPDF(fechamentoMonth, mensalidadeData, heData, locacaoData);
      toast.success('Fechamento PDF exportado!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao exportar fechamento');
    } finally {
      setExportingFechamento(false);
    }
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mês Atual"
          value={formatCurrency(stats.totalMes)}
          icon={<DollarSign size={24} />}
          iconBg="bg-blue-600"
        />
        <StatCard
          title="Mensalidade"
          value={formatCurrency(stats.totalMensalidade)}
          icon={<FileText size={24} />}
          iconBg="bg-emerald-600"
        />
        <StatCard
          title="Hora Extra"
          value={formatCurrency(stats.totalHE)}
          icon={<Clock size={24} />}
          iconBg="bg-amber-600"
        />
        <StatCard
          title="Locação"
          value={formatCurrency(stats.totalLocacao)}
          icon={<Truck size={24} />}
          iconBg="bg-purple-600"
        />
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><FileText size={18} className="text-blue-400" /></div>
          <div>
            <p className="text-xs text-slate-500 font-bold">Gerados</p>
            <p className="text-lg font-black text-white">{stats.countGerados}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg"><CheckCircle size={18} className="text-emerald-400" /></div>
          <div>
            <p className="text-xs text-slate-500 font-bold">Faturados</p>
            <p className="text-lg font-black text-white">{stats.countFaturados}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg"><AlertTriangle size={18} className="text-amber-400" /></div>
          <div>
            <p className="text-xs text-slate-500 font-bold">Pendentes</p>
            <p className="text-lg font-black text-white">{stats.countPendentes}</p>
          </div>
        </div>
      </div>

      {/* Fechamento Geral PDF */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fechamento Mensal</label>
            <select
              value={fechamentoMonth}
              onChange={(e) => setFechamentoMonth(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none"
            >
              {monthOptions.map(m => (
                <option key={m} value={m}>{formatMonthYear(m)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExportFechamento}
            disabled={exportingFechamento}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <Download size={18} />
            {exportingFechamento ? 'Gerando...' : 'Gerar Fechamento PDF'}
          </button>
          <p className="text-xs text-slate-500">
            Gera o relatório consolidado (Mensalidade + HE + Locação) do mês selecionado.
          </p>
        </div>
      </div>

      {/* Tabela recentes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-950/30">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Faturamentos Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Número</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Mês Ref.</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentBillings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                    Nenhum faturamento gerado ainda. Use as abas acima para gerar.
                  </td>
                </tr>
              ) : (
                recentBillings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => onViewBilling(b)}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">{b.billing_number}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                        b.billing_type === 'MENSALIDADE' ? 'bg-emerald-500/10 text-emerald-400' :
                        b.billing_type === 'HE' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-purple-500/10 text-purple-400'
                      }`}>
                        {b.billing_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{formatMonthYear(b.reference_month)}</td>
                    <td className="px-6 py-4 font-black text-white text-sm">{formatCurrency(b.total)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusColors[b.status] || ''}`}>
                        {statusLabels[b.status] || b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BungeDashboardTab;
