
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Clock, Settings2, Users } from 'lucide-react';
import StatCard from '../components/StatCard';
import { analyzeFleetEfficiency } from '../lib/geminiService';

const data = [
  { name: 'Retro Cat 416', roi: 78, color: '#3b82f6' },
  { name: 'Escavadeira 320', roi: 92, color: '#3b82f6' },
  { name: 'Trator D6', roi: 65, color: '#3b82f6' },
  { name: 'Caminhão 8x4', roi: 88, color: '#3b82f6' },
  { name: 'Motoniv 140K', roi: 72, color: '#3b82f6' },
  { name: 'Rolo Dynapac', roi: 82, color: '#3b82f6' },
  { name: 'Bobcat S450', roi: 58, color: '#3b82f6' },
];

const operators = [
  { name: 'Ricardo Silva', score: 98.5, rank: '1º' },
  { name: 'André Santos', score: 94.2, rank: '2º' },
  { name: 'Julio Cesar', score: 91.0, rank: '3º' },
  { name: 'Marcos Oliveira', score: 88.7, rank: '4º' },
  { name: 'Paulo Freitas', score: 85.3, rank: '5º' },
];

const DashboardBI: React.FC = () => {
  const [aiInsights, setAiInsights] = useState<string>("Analisando frota...");

  useEffect(() => {
    const fetchInsights = async () => {
      const insights = await analyzeFleetEfficiency(data);
      setAiInsights(insights || "");
    };
    fetchInsights();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">BI e Inteligência de Negócios</h2>
          <p className="text-slate-500 mt-1">Visão holística da performance operacional e financeira.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold border border-slate-700 hover:bg-slate-700 transition-all">
            Exportar PDF
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all">
            Gerar Relatório Consolidado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Bruto" 
          value="R$ 450.200,00" 
          trend="12.5%" 
          trendUp={true} 
          icon={<DollarSign size={24} />} 
          iconBg="bg-blue-600"
        />
        <StatCard 
          title="Custo Médio/Hora" 
          value="R$ 125,50" 
          trend="2.3%" 
          trendUp={false} 
          icon={<Clock size={24} />} 
          iconBg="bg-orange-500"
        />
        <StatCard 
          title="Disponibilidade Frota" 
          value="48/52 Ativos" 
          trend="92%" 
          trendUp={true} 
          icon={<Settings2 size={24} />} 
          iconBg="bg-emerald-600"
        />
        <StatCard 
          title="Produtividade" 
          value="84.2%" 
          trend="4%" 
          trendUp={true} 
          icon={<Users size={24} />} 
          iconBg="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-white">Rentabilidade por Equipamento (ROI)</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Relação entre custo operacional e faturamento gerado</p>
            </div>
            <div className="flex bg-slate-800 p-1 rounded-xl">
              <button className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg">Trimestre</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-400">Mês</button>
            </div>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#1e293b'}} 
                  contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                  itemStyle={{color: '#3b82f6', fontWeight: 'bold'}}
                />
                <Bar dataKey="roi" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-lg flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Top 5 Operadores</h3>
          <div className="space-y-6 flex-1">
            {operators.map((op) => (
              <div key={op.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-600">{op.rank}</span>
                    <p className="text-sm font-bold text-white">{op.name}</p>
                  </div>
                  <span className="text-xs font-black text-blue-500">{op.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full shadow-lg shadow-blue-600/20" 
                    style={{ width: `${op.score}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 py-3 text-xs font-bold text-slate-500 hover:text-white transition-colors border-t border-slate-800 uppercase tracking-widest">
            Ver ranking completo
          </button>
        </div>
      </div>

      <div className="bg-blue-600/5 border border-blue-600/20 p-8 rounded-3xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-white">AI Fleet Insights (Beta)</h4>
            <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
              {aiInsights}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBI;
