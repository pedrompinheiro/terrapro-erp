
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { DollarSign, Clock, Filter, Download, Briefcase, Wrench, Package, Truck, Wallet, FileText, Calendar, Users, TrendingUp, AlertTriangle, Fuel } from 'lucide-react';
import StatCard from '../components/StatCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// MOCK DATA FOR ALL MODULES
const financialData = [
  { month: 'Jan', receita: 4000, despesa: 2400, lucro: 1600 },
  { month: 'Fev', receita: 3000, despesa: 1398, lucro: 1602 },
  { month: 'Mar', receita: 2000, despesa: 9800, lucro: -7800 },
  { month: 'Abr', receita: 2780, despesa: 3908, lucro: -1128 },
  { month: 'Mai', receita: 1890, despesa: 4800, lucro: -2910 },
  { month: 'Jun', receita: 2390, despesa: 3800, lucro: -1410 },
];

const fleetData = [
  { name: 'Caminhão 01', km: 4000, consumo: 2.8 },
  { name: 'Escavadeira', km: 120, consumo: 12.5 },
  { name: 'Pá Carr.', km: 200, consumo: 8.4 },
  { name: 'Fiorino', km: 2800, consumo: 10.2 },
];

const hrData = [
  { name: 'João S.', horas: 176, extra: 24 },
  { name: 'Maria M.', horas: 176, extra: 4 },
  { name: 'Carlos', horas: 160, extra: 0 },
  { name: 'Pedro', horas: 180, extra: 32 },
];

const inventoryABC = [
  { name: 'Classe A (Alto Valor)', value: 70 },
  { name: 'Classe B (Médio)', value: 20 },
  { name: 'Classe C (Baixo)', value: 10 },
];

type ReportTab = 'FINANCIAL' | 'FLEET' | 'HR' | 'INVENTORY' | 'MAINTENANCE';

const BIReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('FINANCIAL');

  const renderTabButton = (id: ReportTab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all border-b-2
                ${activeTab === id
          ? 'bg-slate-800 text-blue-400 border-blue-500'
          : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-900'
        }`}
    >
      {icon} {label}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'FINANCIAL':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Receita Líquida" value="R$ 1.2M" trend="+12%" trendUp={true} icon={<DollarSign size={24} />} iconBg="bg-emerald-600" />
              <StatCard title="EBITDA" value="R$ 450k" trend="+5%" trendUp={true} icon={<TrendingUp size={24} />} iconBg="bg-blue-600" />
              <StatCard title="Inadimplência" value="3.2%" trend="-0.5%" trendUp={true} icon={<AlertTriangle size={24} />} iconBg="bg-amber-600" />
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-white font-bold mb-4">Fluxo de Caixa (Receita x Despesa)</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    <Area type="monotone" dataKey="receita" stroke="#10b981" fillOpacity={1} fill="url(#colorReceita)" />
                    <Area type="monotone" dataKey="despesa" stroke="#ef4444" fillOpacity={1} fill="url(#colorDespesa)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'FLEET':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="KM Total Rodado" value="45.200" trend="+1.2%" trendUp={true} icon={<Truck size={24} />} iconBg="bg-blue-600" />
              <StatCard title="Consumo Médio" value="6.5 km/l" trend="-2%" trendUp={false} icon={<Fuel size={24} />} iconBg="bg-amber-600" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <h3 className="text-white font-bold mb-4">KM Rodado por Veículo</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fleetData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                      <Bar dataKey="km" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <h3 className="text-white font-bold mb-4">Custo Manutenção vs Combustível</h3>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ name: 'Combustível', value: 65 }, { name: 'Manutenção', value: 25 }, { name: 'Outros', value: 10 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                        {COLORS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
      case 'HR':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-white font-bold mb-4">Banco de Horas e Extras</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hrData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis dataKey="name" type="category" stroke="#64748b" width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    <Bar dataKey="horas" stackId="a" fill="#3b82f6" name="Horas Normais" />
                    <Bar dataKey="extra" stackId="a" fill="#f59e0b" name="Horas Extras" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'INVENTORY':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-white font-bold mb-4">Curva ABC de Estoque (Valor)</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryABC}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    <Bar dataKey="value" fill="#10b981">
                      {inventoryABC.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#64748b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'MAINTENANCE':
        return (
          <div className="flex flex-col items-center justify-center h-[400px] text-slate-500 animate-in fade-in slide-in-from-bottom-4">
            <Wrench size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white">Relatórios de Manutenção</h3>
            <p>Em desenvolvimento...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Central de Relatórios BI</h2>
          <p className="text-slate-500 mt-1">Visão 360º de todos os setores da empresa.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold border border-slate-700 flex items-center gap-2">
            <Calendar size={18} /> Jan/2026
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2">
            <Download size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-800 pb-1">
        {renderTabButton('FINANCIAL', 'Financeiro', <Wallet size={18} />)}
        {renderTabButton('FLEET', 'Frota', <Truck size={18} />)}
        {renderTabButton('HR', 'RH & Pessoal', <Users size={18} />)}
        {renderTabButton('INVENTORY', 'Estoque', <Package size={18} />)}
        {renderTabButton('MAINTENANCE', 'Manutenção', <Wrench size={18} />)}
      </div>

      {/* Dynamic Content */}
      <div className="min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default BIReports;
