
import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Clock, MapPin, DollarSign, MessageSquare, Plus, BarChart3 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { dashboardService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ─── Alertas Críticos dinâmicos ───────────────────────────────
const DashboardAlerts: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [alerts, setAlerts] = useState<{ color: string; text: string; route: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      const items: { color: string; text: string; route: string }[] = [];
      // Ordens de manutenção urgentes
      const { count: osCount } = await supabase
        .from('maintenance_os')
        .select('id', { count: 'exact', head: true })
        .in('status', ['URGENT', 'PENDING']);
      if (osCount && osCount > 0) {
        items.push({ color: 'orange', text: `${osCount} ordem(s) de manutenção pendente(s).`, route: '/maintenance' });
      }
      // Títulos vencidos
      const hoje = new Date().toISOString().split('T')[0];
      const { count: titulosCount } = await supabase
        .from('contas_receber')
        .select('id', { count: 'exact', head: true })
        .lt('data_vencimento', hoje)
        .not('status', 'in', '("RECEBIDO","CANCELADO")');
      if (titulosCount && titulosCount > 0) {
        items.push({ color: 'rose', text: `${titulosCount} título(s) a receber em atraso.`, route: '/financial' });
      }
      setAlerts(items);
    };
    load();
  }, []);

  if (alerts.length === 0) return (
    <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-white mb-3">Alertas Críticos</h3>
      <p className="text-slate-600 text-xs text-center py-2">Nenhum alerta crítico no momento.</p>
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 space-y-4">
      <h3 className="text-sm font-black uppercase tracking-widest text-white">Alertas Críticos</h3>
      {alerts.map((a, i) => (
        <div key={i}
          className={`p-4 bg-${a.color}-600/10 border border-${a.color}-600/20 rounded-2xl flex gap-3 items-start cursor-pointer hover:bg-${a.color}-600/20 transition-colors`}
          onClick={() => navigate(a.route)}
        >
          <AlertCircle size={18} className={`text-${a.color}-500 shrink-0`} />
          <p className={`text-[10px] text-${a.color}-200/70 font-bold leading-tight uppercase tracking-tight`}>{a.text}</p>
        </div>
      ))}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getActivities()
        ]);
        setStats(statsData as any[]);
        setActivities(activitiesData as any[]);
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
        {stats.length > 0 ? stats.map((s, i) => (
          <StatCard
            key={i}
            title={s.title}
            value={s.value}
            trend={s.trend}
            trendUp={s.trendUp}
            icon={getIcon(s.type)}
            iconBg={s.iconBg}
            onClick={() => s.route && navigate(s.route)}
          />
        )) : (
          // Fallback enquanto carrega
          [
            { title: 'Saldo Financeiro', icon: <DollarSign size={24} />, iconBg: 'bg-blue-600', route: '/financial' },
            { title: 'Ativos Monitorados', icon: <MapPin size={24} />, iconBg: 'bg-emerald-600', route: '/fleet' },
            { title: 'Alertas Manutenção', icon: <AlertCircle size={24} />, iconBg: 'bg-rose-600', route: '/maintenance' },
            { title: 'WhatsApp', icon: <MessageSquare size={24} />, iconBg: 'bg-purple-600', route: '/whatsapp' },
          ].map((s, i) => (
            <StatCard key={i} title={s.title} value="—" trend="Carregando..." trendUp={true}
              icon={s.icon} iconBg={s.iconBg} onClick={() => navigate(s.route)} />
          ))
        )}
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
            {activities.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-4">Nenhuma atividade registrada ainda.</p>
            ) : activities.map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="text-[10px] font-mono text-slate-500 mt-1 shrink-0">{item.time}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{item.action}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{item.user} • {item.project}</p>
                </div>
                <CheckCircle2 size={16} className="text-[#007a33] shrink-0" />
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

          {/* Critical Alerts — dinâmico */}
          <DashboardAlerts navigate={navigate} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
