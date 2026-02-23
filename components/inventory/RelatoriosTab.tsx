import React, { useState, useEffect } from 'react';
import { CategorySummary, BelowMinimumItem } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { BarChart3, AlertTriangle, TrendingUp, Package, DollarSign } from 'lucide-react';

// ============================================================
// DARK THEME CONFIG
// ============================================================

const CHART_THEME = {
  grid: { stroke: '#1e293b' },
  axis: { tick: { fill: '#64748b', fontSize: 11 } },
  tooltip: {
    contentStyle: {
      backgroundColor: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '12px',
      color: '#e2e8f0',
      fontSize: '12px',
    },
  },
};

const PIE_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
];

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ============================================================
// COMPONENT
// ============================================================

interface Props {
  onRefresh?: () => void;
}

interface TopProduct {
  code: number;
  description: string;
  qty_out: number;
  category_name: string;
}

interface MovementMonth {
  month: string;
  entries: number;
  exits: number;
}

const PANEL = 'bg-slate-900 border border-slate-800 rounded-2xl p-6';
const HEADER = 'text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4';

const RelatoriosTab: React.FC<Props> = ({ onRefresh }) => {
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [belowMinimumItems, setBelowMinimumItems] = useState<BelowMinimumItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [movementHistory, setMovementHistory] = useState<MovementMonth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [categories, belowMin, top, history] = await Promise.all([
          inventoryService.getCategorySummary(),
          inventoryService.getBelowMinimumItems(),
          inventoryService.getTopUsedProducts(10),
          inventoryService.getMovementHistory(6),
        ]);
        setCategorySummary(categories);
        setBelowMinimumItems(belowMin);
        setTopProducts(top);
        setMovementHistory(history);
      } catch (err) {
        console.error('Erro ao carregar relatórios:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derived data
  const barData = categorySummary.slice(0, 15);
  const pieData = [...categorySummary]
    .sort((a, b) => b.total_sell_value - a.total_sell_value)
    .slice(0, 8);
  const pieTotal = pieData.reduce((s, c) => s + c.total_sell_value, 0);
  const maxQtyOut = topProducts.length > 0
    ? Math.max(...topProducts.map(p => p.qty_out))
    : 1;

  const formatMonth = (m: string) => {
    const [year, month] = m.split('-');
    const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${names[parseInt(month, 10) - 1]}/${year.slice(2)}`;
  };

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Panel 1 - Estoque por Categoria (full width) */}
      <div className={`${PANEL} lg:col-span-2`}>
        <h3 className={HEADER}>
          <BarChart3 size={16} className="text-emerald-500" />
          Estoque por Categoria
        </h3>
        {barData.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">Sem dados de categoria</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid.stroke} />
              <XAxis
                dataKey="category_name"
                tick={{ ...CHART_THEME.axis.tick }}
                angle={-35}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis tick={{ ...CHART_THEME.axis.tick }} tickFormatter={(v) => formatBRL(v)} />
              <Tooltip
                contentStyle={CHART_THEME.tooltip.contentStyle}
                formatter={(value: number) => [formatBRL(value), 'Valor Custo']}
                labelStyle={{ color: '#94a3b8', fontWeight: 700 }}
              />
              <Bar dataKey="total_cost_value" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Panel 2 - Valor em Estoque (left) */}
      <div className={PANEL}>
        <h3 className={HEADER}>
          <DollarSign size={16} className="text-blue-500" />
          Valor em Estoque
        </h3>
        {pieData.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">Sem dados</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="total_sell_value"
                nameKey="category_name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                labelLine={false}
                label={renderPieLabel}
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={CHART_THEME.tooltip.contentStyle}
                formatter={(value: number, name: string) => [formatBRL(value), name]}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                formatter={(value) => <span className="text-slate-400 text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Panel 3 - Top 10 Produtos Mais Utilizados (right) */}
      <div className={PANEL}>
        <h3 className={HEADER}>
          <TrendingUp size={16} className="text-amber-500" />
          Top 10 Produtos Mais Utilizados
        </h3>
        {topProducts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">Sem dados de utilização</p>
        ) : (
          <div className="overflow-y-auto max-h-[300px] custom-scrollbar">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="text-left py-2 w-8">#</th>
                  <th className="text-left py-2">Código</th>
                  <th className="text-left py-2">Descrição</th>
                  <th className="text-left py-2 hidden md:table-cell">Categoria</th>
                  <th className="text-right py-2">Saídas</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="py-2 text-slate-500 font-bold">#{idx + 1}</td>
                    <td className="py-2 text-slate-300 font-mono">{p.code}</td>
                    <td className="py-2 text-slate-200 max-w-[160px] truncate">{p.description}</td>
                    <td className="py-2 text-slate-500 hidden md:table-cell truncate max-w-[100px]">{p.category_name}</td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(p.qty_out / maxQtyOut) * 100}%` }}
                          />
                        </div>
                        <span className="text-amber-400 font-bold w-10 text-right">{p.qty_out}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panel 4 - Produtos Abaixo do Mínimo (full width) */}
      <div className={`${PANEL} lg:col-span-2`}>
        <h3 className={HEADER}>
          <AlertTriangle size={16} className="text-red-500" />
          Produtos Abaixo do Mínimo
          {belowMinimumItems.length > 0 && (
            <span className="ml-2 bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {belowMinimumItems.length}
            </span>
          )}
        </h3>
        {belowMinimumItems.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">Nenhum produto abaixo do estoque mínimo</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="text-left py-2">Código</th>
                  <th className="text-left py-2">Descrição</th>
                  <th className="text-left py-2">Categoria</th>
                  <th className="text-right py-2">Atual</th>
                  <th className="text-right py-2">Mínimo</th>
                  <th className="text-right py-2">Falta</th>
                  <th className="text-right py-2">Custo Est.</th>
                  <th className="text-left py-2">Localização</th>
                </tr>
              </thead>
              <tbody>
                {belowMinimumItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="py-2 text-slate-300 font-mono">{item.code}</td>
                    <td className="py-2 text-slate-200 max-w-[200px] truncate">{item.description}</td>
                    <td className="py-2 text-slate-500">{item.category_name || '-'}</td>
                    <td className="py-2 text-right text-slate-300">{item.qty_current}</td>
                    <td className="py-2 text-right text-slate-400">{item.qty_minimum}</td>
                    <td className="py-2 text-right text-red-400 font-bold">{item.qty_needed}</td>
                    <td className="py-2 text-right text-slate-300">{formatBRL(item.estimated_cost)}</td>
                    <td className="py-2 text-slate-500">{item.location || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panel 5 - Histórico de Movimentações (full width) */}
      <div className={`${PANEL} lg:col-span-2`}>
        <h3 className={HEADER}>
          <Package size={16} className="text-cyan-500" />
          Histórico de Movimentações
        </h3>
        {movementHistory.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">Sem histórico de movimentações</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={movementHistory} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid.stroke} />
              <XAxis
                dataKey="month"
                tick={{ ...CHART_THEME.axis.tick }}
                tickFormatter={formatMonth}
              />
              <YAxis tick={{ ...CHART_THEME.axis.tick }} />
              <Tooltip
                contentStyle={CHART_THEME.tooltip.contentStyle}
                labelFormatter={formatMonth}
                labelStyle={{ color: '#94a3b8', fontWeight: 700 }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => (
                  <span className="text-slate-400 text-xs">
                    {value === 'entries' ? 'Entradas' : 'Saídas'}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="entries"
                name="entries"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="exits"
                name="exits"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4, fill: '#ef4444' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RelatoriosTab;
