import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wrench, Fuel, Package, Filter, Download, BarChart3, Loader2 } from 'lucide-react';
import { reportService, EquipmentProfitabilityRow } from '../../services/reportService';
import { formatCurrency } from '../../services/bungeService';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// ============================================================
// Relatório de Rentabilidade por Equipamento
// Receita (billing) × Custos (manutenção + combustível + peças)
// ============================================================

type PeriodPreset = 'month' | 'quarter' | 'semester' | 'year' | 'custom';

function getPeriodDates(preset: PeriodPreset, customStart?: string, customEnd?: string): { start: string; end: string; label: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  switch (preset) {
    case 'month': {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        label: `${start.toLocaleString('pt-BR', { month: 'long' })} ${year}`,
      };
    }
    case 'quarter': {
      const qStart = Math.floor(month / 3) * 3;
      const start = new Date(year, qStart, 1);
      const end = new Date(year, qStart + 3, 0);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        label: `${Math.floor(month / 3) + 1}T ${year}`,
      };
    }
    case 'semester': {
      const sStart = month < 6 ? 0 : 6;
      const start = new Date(year, sStart, 1);
      const end = new Date(year, sStart + 6, 0);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        label: `${sStart === 0 ? '1' : '2'}S ${year}`,
      };
    }
    case 'year': {
      return {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
        label: `${year}`,
      };
    }
    case 'custom': {
      return {
        start: customStart || `${year}-01-01`,
        end: customEnd || `${year}-12-31`,
        label: 'Personalizado',
      };
    }
  }
}

const EquipmentProfitabilityReport: React.FC = () => {
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('year');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EquipmentProfitabilityRow[]>([]);
  const [assets, setAssets] = useState<{ id: string; code: string; name: string }[]>([]);

  // Carregar lista de equipamentos para filtro
  useEffect(() => {
    supabase.from('assets').select('id, code, name').order('name').then(({ data }) => {
      setAssets(data || []);
    });
  }, []);

  // Carregar dados ao mudar filtros
  useEffect(() => {
    loadData();
  }, [periodPreset, customStart, customEnd, selectedAssetId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { start, end } = getPeriodDates(periodPreset, customStart, customEnd);
      const result = await reportService.rentabilidadeEquipamento({
        data_inicio: start,
        data_fim: end,
        asset_id: selectedAssetId || undefined,
      });
      setData(result);
    } catch (err: any) {
      console.error('Erro ao carregar rentabilidade:', err);
      toast.error('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  // Totais
  const totalRevenue = data.reduce((s, r) => s + r.revenue, 0);
  const totalCost = data.reduce((s, r) => s + r.total_cost, 0);
  const totalNet = totalRevenue - totalCost;
  const totalMargin = totalRevenue > 0 ? Math.round((totalNet / totalRevenue) * 10000) / 100 : 0;
  const totalMaintenance = data.reduce((s, r) => s + r.maintenance_cost, 0);
  const totalFuel = data.reduce((s, r) => s + r.fuel_cost, 0);
  const totalParts = data.reduce((s, r) => s + r.parts_cost, 0);

  // Dados para gráfico (top 10)
  const chartData = data.slice(0, 10).map(r => ({
    name: r.asset_code || r.asset_name.substring(0, 15),
    Receita: r.revenue,
    Custos: r.total_cost,
  }));

  const { label: periodLabel } = getPeriodDates(periodPreset, customStart, customEnd);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-blue-400" />
          <h4 className="text-sm font-black text-white uppercase tracking-widest">Filtros</h4>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Periodo</label>
            <select
              value={periodPreset}
              onChange={(e) => setPeriodPreset(e.target.value as PeriodPreset)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none"
            >
              <option value="month">Mês Atual</option>
              <option value="quarter">Trimestre Atual</option>
              <option value="semester">Semestre Atual</option>
              <option value="year">Ano Atual</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {periodPreset === 'custom' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">De</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Até</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Equipamento</label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none min-w-[220px]"
            >
              <option value="">Todos os equipamentos</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.code ? `${a.code} - ` : ''}{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-blue-400 animate-spin" />
          <span className="ml-3 text-slate-400 font-bold">Calculando rentabilidade...</span>
        </div>
      ) : (
        <>
          {/* Cards resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-emerald-400" />
                <p className="text-[10px] text-slate-500 font-black uppercase">Receita Total</p>
              </div>
              <p className="text-2xl font-black text-emerald-400">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-slate-500 mt-1">{periodLabel}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={18} className="text-red-400" />
                <p className="text-[10px] text-slate-500 font-black uppercase">Custos Totais</p>
              </div>
              <p className="text-2xl font-black text-red-400">{formatCurrency(totalCost)}</p>
              <div className="flex gap-3 mt-1 text-[10px] text-slate-500">
                <span><Wrench size={10} className="inline" /> {formatCurrency(totalMaintenance)}</span>
                <span><Fuel size={10} className="inline" /> {formatCurrency(totalFuel)}</span>
                <span><Package size={10} className="inline" /> {formatCurrency(totalParts)}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className={totalNet >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                <p className="text-[10px] text-slate-500 font-black uppercase">Resultado Líquido</p>
              </div>
              <p className={`text-2xl font-black ${totalNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(totalNet)}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={18} className={totalMargin >= 0 ? 'text-blue-400' : 'text-red-400'} />
                <p className="text-[10px] text-slate-500 font-black uppercase">Margem</p>
              </div>
              <p className={`text-2xl font-black ${totalMargin >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {totalMargin.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">{data.length} equipamentos</p>
            </div>
          </div>

          {/* Gráfico */}
          {chartData.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">
                Receita vs Custos por Equipamento
              </h4>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Legend />
                  <Bar dataKey="Receita" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Custos" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabela detalhada */}
          {data.length > 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between">
                <h4 className="text-sm font-black text-white uppercase tracking-widest">
                  Detalhamento por Equipamento
                </h4>
                <span className="text-xs text-slate-500 font-bold">{data.length} equipamentos</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-950 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="px-4 py-3">Equipamento</th>
                      <th className="px-3 py-3 text-right text-emerald-500">Receita</th>
                      <th className="px-3 py-3 text-right text-orange-500">Manutenção</th>
                      <th className="px-3 py-3 text-right text-amber-500">Combustível</th>
                      <th className="px-3 py-3 text-right text-purple-500">Peças</th>
                      <th className="px-3 py-3 text-right text-red-500">Total Custos</th>
                      <th className="px-3 py-3 text-right">Resultado</th>
                      <th className="px-3 py-3 text-right">Margem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data.map((row) => (
                      <tr key={row.asset_id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-bold text-white">{row.asset_name}</p>
                            {row.asset_code && <p className="text-[10px] text-slate-500">{row.asset_code} • {row.asset_model}</p>}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right text-sm font-bold text-emerald-400">
                          {row.revenue > 0 ? formatCurrency(row.revenue) : '-'}
                        </td>
                        <td className="px-3 py-3 text-right text-sm text-orange-400">
                          {row.maintenance_cost > 0 ? formatCurrency(row.maintenance_cost) : '-'}
                          {row.maintenance_count > 0 && <span className="text-[9px] text-slate-500 block">{row.maintenance_count} OS</span>}
                        </td>
                        <td className="px-3 py-3 text-right text-sm text-amber-400">
                          {row.fuel_cost > 0 ? formatCurrency(row.fuel_cost) : '-'}
                          {row.fuel_liters > 0 && <span className="text-[9px] text-slate-500 block">{row.fuel_liters.toFixed(0)}L</span>}
                        </td>
                        <td className="px-3 py-3 text-right text-sm text-purple-400">
                          {row.parts_cost > 0 ? formatCurrency(row.parts_cost) : '-'}
                        </td>
                        <td className="px-3 py-3 text-right text-sm font-bold text-red-400">
                          {row.total_cost > 0 ? formatCurrency(row.total_cost) : '-'}
                        </td>
                        <td className={`px-3 py-3 text-right text-sm font-black ${row.net_result >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(row.net_result)}
                        </td>
                        <td className={`px-3 py-3 text-right text-sm font-black ${row.margin_percent >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                          {row.margin_percent.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-950 border-t-2 border-slate-700">
                      <td className="px-4 py-3 text-xs font-black text-white uppercase">Total</td>
                      <td className="px-3 py-3 text-right text-sm font-black text-emerald-400">{formatCurrency(totalRevenue)}</td>
                      <td className="px-3 py-3 text-right text-sm font-bold text-orange-400">{formatCurrency(totalMaintenance)}</td>
                      <td className="px-3 py-3 text-right text-sm font-bold text-amber-400">{formatCurrency(totalFuel)}</td>
                      <td className="px-3 py-3 text-right text-sm font-bold text-purple-400">{formatCurrency(totalParts)}</td>
                      <td className="px-3 py-3 text-right text-sm font-black text-red-400">{formatCurrency(totalCost)}</td>
                      <td className={`px-3 py-3 text-right text-sm font-black ${totalNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(totalNet)}
                      </td>
                      <td className={`px-3 py-3 text-right text-sm font-black ${totalMargin >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        {totalMargin.toFixed(1)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-12 text-center">
              <BarChart3 size={48} className="text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-bold">Nenhum dado encontrado para o período selecionado.</p>
              <p className="text-slate-500 text-xs mt-1">Vincule equipamentos aos itens de faturamento para ver a rentabilidade.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EquipmentProfitabilityReport;
