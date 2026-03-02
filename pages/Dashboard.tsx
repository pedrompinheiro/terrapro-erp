
import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Clock, MapPin, DollarSign, MessageSquare, Plus, BarChart3 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { dashboardService } from '../services/api';
import { bankService } from '../services/bankService';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saldoFinanceiro, setSaldoFinanceiro] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getActivities()
        ]);
        setStats(statsData as any[]);
        setActivities(activitiesData as any[]);

        // Buscar saldo real das contas bancárias
        try {
          const accounts = await bankService.listar();
          const total = accounts?.reduce((acc: number, curr: any) => acc + (curr.saldo_atual || 0), 0) || 0;
          setSaldoFinanceiro(total);
        } catch { /* fallback silencioso */ }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'activity': return <Activity size={24} />;
      case 'clock': return <Clock size={24} />;
      case 'alert': return <AlertCircle size={24} />;
      case 'map': return <MapPin size={24} />;
      default: return <Activity size={24} />;
    }
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
          <h2 className="text-3xl font-black text-white tracking-tight">Painel Operacional</h2>
          <p className="text-slate-500 mt-1">Status em tempo real das frentes de serviço e ativos.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-[#007a33] bg-[#007a33]/10 px-4 py-2 rounded-xl uppercase tracking-widest border border-[#007a33]/20">
          <span className="w-2 h-2 bg-[#007a33] rounded-full animate-pulse"></span>
          Live: Sincronizado com Satélite
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Saldo Financeiro"
          value={saldoFinanceiro !== null ? `R$ ${saldoFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Carregando...'}
          trend="Caixa + Bancos"
          trendUp={saldoFinanceiro !== null && saldoFinanceiro >= 0}
          icon={<DollarSign size={24} />}
          iconBg="bg-blue-600"
          onClick={() => navigate('/financial')}
        />
        <StatCard
          title="Ativos Monitorados"
          value="12 / 12"
          trend="100% Online"
          trendUp={true}
          icon={<MapPin size={24} />}
          iconBg="bg-emerald-600"
          onClick={() => navigate('/fleet')}
        />
        <StatCard
          title="Alertas Manutenção"
          value="03 Críticos"
          trend="Ação Imediata"
          trendUp={false}
          icon={<AlertCircle size={24} />}
          iconBg="bg-rose-600"
          onClick={() => navigate('/maintenance')}
        />
        <StatCard
          title="Automação WhatsApp"
          value="Ativo"
          trend="Ouvindo..."
          trendUp={true}
          icon={<MessageSquare size={24} />}
          iconBg="bg-purple-600"
          onClick={() => navigate('/whatsapp')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Atividade das Frentes</h3>
            <button
              onClick={() => navigate('/operations-map')}
              className="text-[10px] font-bold text-[#007a33] hover:underline uppercase"
            >
              Ver Log Completo
            </button>
          </div>
          <div className="p-6 space-y-6">
            {activities.map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="text-[10px] font-mono text-slate-500 mt-1">{item.time}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{item.action}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{item.user} • {item.project}</p>
                </div>
                <CheckCircle2 size={16} className="text-[#007a33]" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Acesso Rápido</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/billing')}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group cursor-pointer"
              >
                <Plus size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-400">Nova Receita</span>
              </button>
              <button
                onClick={() => navigate('/whatsapp')}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group cursor-pointer"
              >
                <MessageSquare size={20} className="text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-400">Campanha Zap</span>
              </button>
              <button
                onClick={() => navigate('/rh')}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group cursor-pointer"
              >
                <Clock size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-400">Lançar Ponto</span>
              </button>
              <button
                onClick={() => navigate('/bi')}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group cursor-pointer"
              >
                <BarChart3 size={20} className="text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-400">Relatório Geral</span>
              </button>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Alertas Críticos</h3>
            <div className="p-4 bg-orange-600/10 border border-orange-600/20 rounded-2xl flex gap-3 items-start cursor-pointer hover:bg-orange-600/20 transition-colors" onClick={() => navigate('/maintenance')}>
              <AlertCircle size={18} className="text-orange-500 shrink-0" />
              <p className="text-[10px] text-orange-200/70 font-bold leading-tight uppercase tracking-tight">
                03 Ordens de serviço preventivas vencem em 48h.
              </p>
            </div>
            <div className="p-4 bg-rose-600/10 border border-rose-600/20 rounded-2xl flex gap-3 items-start cursor-pointer hover:bg-rose-600/20 transition-colors" onClick={() => navigate('/financial')}>
              <AlertCircle size={18} className="text-rose-500 shrink-0" />
              <p className="text-[10px] text-rose-200/70 font-bold leading-tight uppercase tracking-tight">
                Título #8923 (Prefeitura) em atraso há 45 dias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
