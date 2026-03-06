import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Shield, Users, FileWarning, Ban, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchDashboardStats, DashboardStats, DashboardDoc } from '../../services/integrationService';

const STATUS_BADGE: Record<string, string> = {
  OK: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  A_VENCER: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  VENCIDO: 'bg-red-500/10 text-red-400 border-red-500/30',
  BLOQUEADO: 'bg-red-500/10 text-red-400 border-red-500/30',
  PENDENTE: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  EM_ANALISE: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

const DashboardTab: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(e => toast.error('Erro ao carregar dashboard: ' + e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Carregando dashboard...</div>;
  if (!stats) return <div className="text-center py-20 text-slate-600">Sem dados disponíveis</div>;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} label="Total Integrações" value={stats.totalIntegrations} color="text-slate-300" bg="bg-slate-800" />
        <StatCard icon={<CheckCircle size={20} />} label="Ativos" value={stats.activeIntegrations} color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard icon={<Ban size={20} />} label="Bloqueados" value={stats.blockedIntegrations} color="text-red-400" bg="bg-red-500/10" alert={stats.blockedIntegrations > 0} />
        <StatCard icon={<Clock size={20} />} label="Pendentes" value={stats.pendingIntegrations} color="text-amber-400" bg="bg-amber-500/10" />
      </div>

      {/* Docs expiring soon */}
      <DocTable
        title="Documentos Vencendo em 30 Dias"
        icon={<AlertTriangle size={18} className="text-amber-400" />}
        docs={stats.docsExpiringSoon}
        emptyMessage="Nenhum documento vencendo nos próximos 30 dias"
        highlightColor="amber"
      />

      {/* Docs expired */}
      <DocTable
        title="Documentos Vencidos / Bloqueados"
        icon={<FileWarning size={18} className="text-red-400" />}
        docs={stats.docsExpired}
        emptyMessage="Nenhum documento vencido"
        highlightColor="red"
      />

      {/* Blocked employees */}
      {stats.blockedEmployees.length > 0 && (
        <div className="bg-slate-900 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-red-400 flex items-center gap-2 mb-4">
            <Shield size={18} /> Funcionários Bloqueados por Cliente
          </h3>
          <div className="space-y-2">
            {stats.blockedEmployees.map((d, i) => (
              <div key={i} className="flex items-center justify-between bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium text-sm">{d.employee_name}</span>
                  <span className="text-slate-500 text-xs">→</span>
                  <span className="text-[#007a33] font-bold text-sm">{d.client_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{d.document_name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${STATUS_BADGE[d.doc_status] || STATUS_BADGE.PENDENTE}`}>
                    {d.doc_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string; bg: string; alert?: boolean }> = ({ icon, label, value, color, bg, alert }) => (
  <div className={`${bg} border border-slate-800 rounded-xl p-5 ${alert ? 'border-red-500/30 animate-pulse' : ''}`}>
    <div className="flex items-center justify-between mb-3">
      <span className={color}>{icon}</span>
      {alert && <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />}
    </div>
    <p className="text-3xl font-black text-white">{value}</p>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

const DocTable: React.FC<{ title: string; icon: React.ReactNode; docs: DashboardDoc[]; emptyMessage: string; highlightColor: string }> = ({ title, icon, docs, emptyMessage, highlightColor }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
    <div className="p-5 border-b border-slate-800 flex items-center justify-between">
      <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">{icon} {title}</h3>
      <span className={`text-xs font-bold ${highlightColor === 'red' ? 'text-red-400' : 'text-amber-400'}`}>{docs.length} item(s)</span>
    </div>
    {docs.length === 0 ? (
      <div className="p-8 text-center text-slate-600 text-sm">{emptyMessage}</div>
    ) : (
      <div className="divide-y divide-slate-800/50">
        {docs.slice(0, 20).map((d, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/30 transition-all">
            <div className="flex items-center gap-4 flex-1">
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{d.employee_name}</p>
                <p className="text-[10px] text-slate-500">{d.client_name} {d.client_code ? `(${d.client_code})` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-300">{d.document_name}</p>
                <p className="text-[10px] text-slate-500">{d.document_category}</p>
              </div>
              <div className="text-right min-w-[80px]">
                <p className={`text-xs font-bold ${d.days_until_expiry <= 0 ? 'text-red-400' : d.days_until_expiry <= 7 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {d.days_until_expiry <= 0 ? `${Math.abs(d.days_until_expiry)}d vencido` : `${d.days_until_expiry}d restantes`}
                </p>
                <p className="text-[10px] text-slate-600">{d.expiry_date}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${STATUS_BADGE[d.doc_status] || STATUS_BADGE.PENDENTE}`}>
                {d.doc_status}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default DashboardTab;
