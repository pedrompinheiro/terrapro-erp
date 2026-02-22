import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { fleetManagementService } from '../services/fleetService';
import {
  BarChart3, Filter, Download, Fuel, TrendingDown, TrendingUp, Clock,
  Calendar, Truck, Users, Building2, ChevronDown, ChevronUp, ArrowLeft,
  FileText, Droplets, DollarSign, Gauge
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Interfaces
interface FuelRecord {
  id: string;
  date: string;
  operation_type: 'IN' | 'OUT';
  liters: number;
  asset_id?: string;
  asset_name?: string;
  supplier_id?: string;
  supplier_name?: string;
  responsible_id?: string;
  responsible_name?: string;
  tank_id: string;
  invoice_number?: string;
  horometer?: number;
  total_value?: number;
  price_per_liter?: number;
  payment_method?: string;
}

interface ConsumptionRecord {
  assetId: string;
  assetName: string;
  records: FuelRecord[];
  totalLiters: number;
  totalHours: number;
  avgLitersPerHour: number;
  avgCostPerHour: number;
  fillCount: number;
  intervals: {
    date: string;
    liters: number;
    horometerStart: number;
    horometerEnd: number;
    hoursWorked: number;
    litersPerHour: number;
    cost: number;
  }[];
}

type ReportTab = 'GERAL' | 'CONSUMO' | 'COMPRAS' | 'FRENTISTAS';

const FuelReports: React.FC = () => {
  const navigate = useNavigate();

  // Filters
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterAssetId, setFilterAssetId] = useState('');
  const [filterSupplierId, setFilterSupplierId] = useState('');
  const [filterResponsibleId, setFilterResponsibleId] = useState('');
  const [filterOperationType, setFilterOperationType] = useState<'' | 'IN' | 'OUT'>('');
  const [activeTab, setActiveTab] = useState<ReportTab>('GERAL');
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);

  // Data Queries
  const { data: allRecords = [], isLoading } = useQuery({
    queryKey: ['fuel_records_report', dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fuel_records')
        .select('*')
        .gte('date', `${dateFrom}T00:00:00`)
        .lte('date', `${dateTo}T23:59:59`)
        .order('date', { ascending: true });
      if (error) throw error;
      return data as FuelRecord[];
    }
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['fleet_report'],
    queryFn: fleetManagementService.getAssets,
    staleTime: 1000 * 60 * 5,
  });

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  React.useEffect(() => {
    supabase.from('entities').select('id, name').then(({ data }) => setSuppliers(data || []));
    fleetManagementService.getEmployees().then(data => setEmployees(data)).catch(() => {});
  }, []);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      if (filterAssetId && r.asset_id !== filterAssetId) return false;
      if (filterSupplierId && r.supplier_id !== filterSupplierId) return false;
      if (filterResponsibleId && r.responsible_id !== filterResponsibleId) return false;
      if (filterOperationType && r.operation_type !== filterOperationType) return false;
      return true;
    });
  }, [allRecords, filterAssetId, filterSupplierId, filterResponsibleId, filterOperationType]);

  // Summary Stats
  const stats = useMemo(() => {
    const purchases = filteredRecords.filter(r => r.operation_type === 'IN');
    const supplies = filteredRecords.filter(r => r.operation_type === 'OUT');

    const totalPurchasedLiters = purchases.reduce((s, r) => s + r.liters, 0);
    const totalSuppliedLiters = supplies.reduce((s, r) => s + r.liters, 0);
    const totalSpent = purchases.reduce((s, r) => s + (r.total_value || 0), 0);
    const avgPricePerLiter = totalPurchasedLiters > 0 ? totalSpent / totalPurchasedLiters : 0;

    return {
      totalRecords: filteredRecords.length,
      purchases: purchases.length,
      supplies: supplies.length,
      totalPurchasedLiters,
      totalSuppliedLiters,
      totalSpent,
      avgPricePerLiter,
    };
  }, [filteredRecords]);

  // Consumption Analysis (L/hora por equipamento)
  const consumptionData = useMemo((): ConsumptionRecord[] => {
    const outRecords = filteredRecords
      .filter(r => r.operation_type === 'OUT' && r.asset_id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group by asset
    const byAsset: Record<string, FuelRecord[]> = {};
    outRecords.forEach(r => {
      const key = r.asset_id!;
      if (!byAsset[key]) byAsset[key] = [];
      byAsset[key].push(r);
    });

    const results: ConsumptionRecord[] = [];

    for (const [assetId, records] of Object.entries(byAsset)) {
      const intervals: ConsumptionRecord['intervals'] = [];
      let totalLiters = 0;
      let totalHours = 0;

      // Calcular consumo entre abastecimentos consecutivos
      for (let i = 1; i < records.length; i++) {
        const prev = records[i - 1];
        const curr = records[i];

        if (prev.horometer && curr.horometer && curr.horometer > prev.horometer) {
          const hoursWorked = curr.horometer - prev.horometer;
          const litersUsed = curr.liters; // Litros abastecidos = consumidos no período anterior
          const litersPerHour = hoursWorked > 0 ? litersUsed / hoursWorked : 0;

          // Custo estimado do período (usando preço médio do período)
          const avgPrice = stats.avgPricePerLiter || 0;
          const cost = litersUsed * avgPrice;

          intervals.push({
            date: curr.date,
            liters: litersUsed,
            horometerStart: prev.horometer,
            horometerEnd: curr.horometer,
            hoursWorked,
            litersPerHour,
            cost,
          });

          totalLiters += litersUsed;
          totalHours += hoursWorked;
        }
      }

      const fillCount = records.length;
      const avgLitersPerHour = totalHours > 0 ? totalLiters / totalHours : 0;
      const avgCostPerHour = totalHours > 0 ? (totalLiters * (stats.avgPricePerLiter || 0)) / totalHours : 0;

      results.push({
        assetId,
        assetName: records[0]?.asset_name || 'Desconhecido',
        records,
        totalLiters,
        totalHours,
        avgLitersPerHour,
        avgCostPerHour,
        fillCount,
        intervals,
      });
    }

    // Sort by total consumed (desc)
    return results.sort((a, b) => b.totalLiters - a.totalLiters);
  }, [filteredRecords, stats.avgPricePerLiter]);

  // Purchase Analysis (por fornecedor)
  const purchaseData = useMemo(() => {
    const purchases = filteredRecords.filter(r => r.operation_type === 'IN');
    const bySupplier: Record<string, { name: string; liters: number; total: number; count: number; invoices: string[] }> = {};

    purchases.forEach(r => {
      const key = r.supplier_id || 'sem_fornecedor';
      if (!bySupplier[key]) bySupplier[key] = { name: r.supplier_name || 'Sem Fornecedor', liters: 0, total: 0, count: 0, invoices: [] };
      bySupplier[key].liters += r.liters;
      bySupplier[key].total += (r.total_value || 0);
      bySupplier[key].count++;
      if (r.invoice_number) bySupplier[key].invoices.push(r.invoice_number);
    });

    return Object.values(bySupplier).sort((a, b) => b.total - a.total);
  }, [filteredRecords]);

  // Attendant Analysis (por frentista)
  const attendantData = useMemo(() => {
    const supplies = filteredRecords.filter(r => r.operation_type === 'OUT');
    const byAttendant: Record<string, { name: string; liters: number; count: number; assets: Set<string> }> = {};

    supplies.forEach(r => {
      const key = r.responsible_id || 'sem_frentista';
      if (!byAttendant[key]) byAttendant[key] = { name: r.responsible_name || 'Sem Frentista', liters: 0, count: 0, assets: new Set() };
      byAttendant[key].liters += r.liters;
      byAttendant[key].count++;
      if (r.asset_name) byAttendant[key].assets.add(r.asset_name);
    });

    return Object.entries(byAttendant).map(([, v]) => ({
      ...v,
      assetsCount: v.assets.size,
      assetsList: Array.from(v.assets),
    })).sort((a, b) => b.liters - a.liters);
  }, [filteredRecords]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Data', 'Tipo', 'Litros', 'Equipamento', 'Fornecedor', 'Frentista', 'Horímetro', 'Valor Total', 'R$/L', 'NF'];
    const rows = filteredRecords.map(r => [
      new Date(r.date).toLocaleDateString('pt-BR'),
      r.operation_type === 'IN' ? 'Compra' : 'Abastecimento',
      r.liters.toFixed(2),
      r.asset_name || '-',
      r.supplier_name || '-',
      r.responsible_name || '-',
      r.horometer?.toString() || '-',
      r.total_value?.toFixed(2) || '-',
      r.price_per_liter?.toFixed(4) || '-',
      r.invoice_number || '-',
    ]);

    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_combustivel_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Consumption CSV
  const handleExportConsumptionCSV = () => {
    const headers = ['Equipamento', 'Abastecimentos', 'Total Litros', 'Total Horas', 'Média L/h', 'Custo R$/h'];
    const rows = consumptionData.map(c => [
      c.assetName,
      c.fillCount.toString(),
      c.totalLiters.toFixed(2),
      c.totalHours.toFixed(1),
      c.avgLitersPerHour.toFixed(2),
      c.avgCostPerHour.toFixed(2),
    ]);

    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consumo_equipamentos_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilterAssetId('');
    setFilterSupplierId('');
    setFilterResponsibleId('');
    setFilterOperationType('');
  };

  const tabs: { key: ReportTab; label: string; icon: React.ReactNode }[] = [
    { key: 'GERAL', label: 'Geral', icon: <BarChart3 size={16} /> },
    { key: 'CONSUMO', label: 'Média Consumo', icon: <Gauge size={16} /> },
    { key: 'COMPRAS', label: 'Compras', icon: <DollarSign size={16} /> },
    { key: 'FRENTISTAS', label: 'Frentistas', icon: <Users size={16} /> },
  ];

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto custom-scrollbar pb-24">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/fuel')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <BarChart3 className="text-amber-500" size={28} />
              Relatórios de Combustível
            </h2>
            <p className="text-slate-500 mt-1">Análise detalhada de consumo, compras e operações.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={activeTab === 'CONSUMO' ? handleExportConsumptionCSV : handleExportCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtros</span>
          {(filterAssetId || filterSupplierId || filterResponsibleId || filterOperationType) && (
            <button onClick={clearFilters} className="ml-auto text-xs text-blue-400 hover:text-blue-300 font-bold">
              Limpar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Data Início</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Data Fim</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Equipamento</label>
            <select
              value={filterAssetId}
              onChange={e => setFilterAssetId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
            >
              <option value="">Todos</option>
              {assets.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Fornecedor</label>
            <select
              value={filterSupplierId}
              onChange={e => setFilterSupplierId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
            >
              <option value="">Todos</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Frentista</label>
            <select
              value={filterResponsibleId}
              onChange={e => setFilterResponsibleId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
            >
              <option value="">Todos</option>
              {employees.map((e: any) => (
                <option key={e.id} value={e.id}>{e.full_name || e.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo</label>
            <select
              value={filterOperationType}
              onChange={e => setFilterOperationType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
            >
              <option value="">Todos</option>
              <option value="IN">Compras</option>
              <option value="OUT">Abastecimentos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <FileText size={20} className="text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Registros</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.totalRecords}</p>
          <p className="text-xs text-slate-500 mt-1">{stats.purchases} compras • {stats.supplies} abastecimentos</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Litros Comprados</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.totalPurchasedLiters.toLocaleString('pt-BR')} L</p>
          <p className="text-xs text-slate-500 mt-1">R$ {stats.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <TrendingDown size={20} className="text-orange-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Litros Consumidos</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.totalSuppliedLiters.toLocaleString('pt-BR')} L</p>
          <p className="text-xs text-slate-500 mt-1">{consumptionData.length} equipamentos abastecidos</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <DollarSign size={20} className="text-amber-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Preço Médio/L</span>
          </div>
          <p className="text-2xl font-black text-white">
            R$ {stats.avgPricePerLiter.toLocaleString('pt-BR', { minimumFractionDigits: 4 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Preço médio por litro no período</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-800 gap-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Tab GERAL - Listagem com todos os registros */}
          {activeTab === 'GERAL' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 border-b border-slate-800">
                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="px-5 py-4">Data</th>
                      <th className="px-5 py-4">Tipo</th>
                      <th className="px-5 py-4">Litros</th>
                      <th className="px-5 py-4">Equipamento</th>
                      <th className="px-5 py-4">Fornecedor</th>
                      <th className="px-5 py-4">Frentista</th>
                      <th className="px-5 py-4">Horímetro</th>
                      <th className="px-5 py-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredRecords.slice().reverse().map(r => (
                      <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-4 text-sm text-slate-300">
                          {new Date(r.date).toLocaleDateString('pt-BR')}
                          <span className="text-slate-600 ml-1 text-xs">
                            {new Date(r.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                            r.operation_type === 'IN'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          }`}>
                            {r.operation_type === 'IN' ? 'Compra' : 'Abastec.'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-white">{r.liters.toLocaleString('pt-BR')} L</td>
                        <td className="px-5 py-4 text-sm text-slate-300">{r.asset_name || '-'}</td>
                        <td className="px-5 py-4 text-sm text-slate-300">{r.supplier_name || '-'}</td>
                        <td className="px-5 py-4 text-sm text-slate-300">{r.responsible_name || '-'}</td>
                        <td className="px-5 py-4 text-sm text-slate-400 font-mono">{r.horometer || '-'}</td>
                        <td className="px-5 py-4 text-sm text-right">
                          {r.total_value ? (
                            <span className="text-emerald-400 font-bold">R$ {r.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          ) : r.price_per_liter ? (
                            <span className="text-slate-400">R$ {(r.price_per_liter * r.liters).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                    {filteredRecords.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-5 py-16 text-center text-slate-500">
                          <Droplets size={40} className="mx-auto mb-3 opacity-30" />
                          <p className="font-bold">Nenhum registro encontrado</p>
                          <p className="text-xs mt-1">Ajuste os filtros ou período para ver dados.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredRecords.length > 0 && (
                <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-500 flex justify-between">
                  <span>{filteredRecords.length} registros encontrados</span>
                  <span>
                    Total: {filteredRecords.reduce((s, r) => s + r.liters, 0).toLocaleString('pt-BR')} L |
                    R$ {filteredRecords.reduce((s, r) => s + (r.total_value || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tab CONSUMO - Média de consumo por equipamento */}
          {activeTab === 'CONSUMO' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-xs text-amber-400 font-bold flex items-center gap-2">
                  <Gauge size={14} />
                  O cálculo de consumo utiliza o horímetro registrado em cada abastecimento. Entre dois abastecimentos consecutivos,
                  a diferença de horímetro indica as horas trabalhadas, e os litros abastecidos indicam o consumo do período.
                </p>
              </div>

              {consumptionData.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
                  <Gauge size={48} className="mx-auto mb-4 text-slate-700" />
                  <p className="text-slate-500 font-bold">Dados insuficientes para calcular consumo</p>
                  <p className="text-xs text-slate-600 mt-2">
                    São necessários pelo menos 2 abastecimentos do mesmo equipamento com horímetro preenchido.
                  </p>
                </div>
              ) : (
                consumptionData.map(asset => (
                  <div key={asset.assetId} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    {/* Asset Header */}
                    <div
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-all"
                      onClick={() => setExpandedAsset(expandedAsset === asset.assetId ? null : asset.assetId)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Truck size={24} className="text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{asset.assetName}</h3>
                          <p className="text-xs text-slate-500">{asset.fillCount} abastecimentos • {asset.intervals.length} intervalos calculados</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Consumo Médio</p>
                          <p className={`text-xl font-black ${
                            asset.avgLitersPerHour > 25 ? 'text-red-400' :
                            asset.avgLitersPerHour > 15 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {asset.avgLitersPerHour > 0 ? asset.avgLitersPerHour.toFixed(2) : '—'} L/h
                          </p>
                        </div>
                        <div className="text-right hidden md:block">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Total Litros</p>
                          <p className="text-lg font-bold text-white">{asset.totalLiters.toLocaleString('pt-BR')} L</p>
                        </div>
                        <div className="text-right hidden md:block">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Total Horas</p>
                          <p className="text-lg font-bold text-white">{asset.totalHours.toFixed(1)} h</p>
                        </div>
                        <div className="text-right hidden lg:block">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Custo/Hora</p>
                          <p className="text-lg font-bold text-amber-400">R$ {asset.avgCostPerHour.toFixed(2)}</p>
                        </div>
                        {expandedAsset === asset.assetId ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedAsset === asset.assetId && (
                      <div className="border-t border-slate-800">
                        {/* Visual Bars */}
                        <div className="p-5 space-y-3">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Consumo por Intervalo (L/hora)</p>
                          {asset.intervals.map((interval, idx) => {
                            const maxLph = Math.max(...asset.intervals.map(i => i.litersPerHour), 1);
                            const barWidth = (interval.litersPerHour / maxLph) * 100;
                            const barColor = interval.litersPerHour > 25 ? 'bg-red-500' :
                              interval.litersPerHour > 15 ? 'bg-amber-500' : 'bg-emerald-500';

                            return (
                              <div key={idx} className="flex items-center gap-4">
                                <div className="w-24 text-xs text-slate-500 shrink-0">
                                  {new Date(interval.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                </div>
                                <div className="flex-1 bg-slate-950 rounded-full h-6 overflow-hidden relative">
                                  <div
                                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                                    style={{ width: `${barWidth}%` }}
                                  />
                                  <span className="absolute inset-0 flex items-center px-3 text-xs font-bold text-white">
                                    {interval.litersPerHour.toFixed(2)} L/h
                                  </span>
                                </div>
                                <div className="w-28 text-xs text-slate-500 text-right shrink-0">
                                  {interval.liters}L / {interval.hoursWorked.toFixed(1)}h
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="bg-slate-950/50 border-t border-b border-slate-800">
                              <tr className="text-[10px] font-black text-slate-500 uppercase">
                                <th className="px-5 py-3">Data</th>
                                <th className="px-5 py-3">Litros</th>
                                <th className="px-5 py-3">Horímetro Início</th>
                                <th className="px-5 py-3">Horímetro Fim</th>
                                <th className="px-5 py-3">Horas Trab.</th>
                                <th className="px-5 py-3">L/Hora</th>
                                <th className="px-5 py-3 text-right">Custo Est.</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                              {asset.intervals.map((interval, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/20">
                                  <td className="px-5 py-3 text-sm text-slate-300">
                                    {new Date(interval.date).toLocaleDateString('pt-BR')}
                                  </td>
                                  <td className="px-5 py-3 text-sm font-bold text-white">{interval.liters} L</td>
                                  <td className="px-5 py-3 text-sm text-slate-400 font-mono">{interval.horometerStart}</td>
                                  <td className="px-5 py-3 text-sm text-slate-400 font-mono">{interval.horometerEnd}</td>
                                  <td className="px-5 py-3 text-sm text-slate-300">{interval.hoursWorked.toFixed(1)}h</td>
                                  <td className="px-5 py-3">
                                    <span className={`text-sm font-bold ${
                                      interval.litersPerHour > 25 ? 'text-red-400' :
                                      interval.litersPerHour > 15 ? 'text-amber-400' : 'text-emerald-400'
                                    }`}>
                                      {interval.litersPerHour.toFixed(2)} L/h
                                    </span>
                                  </td>
                                  <td className="px-5 py-3 text-sm text-right text-amber-400">
                                    R$ {interval.cost.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab COMPRAS - Análise por fornecedor */}
          {activeTab === 'COMPRAS' && (
            <div className="space-y-4">
              {purchaseData.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
                  <Building2 size={48} className="mx-auto mb-4 text-slate-700" />
                  <p className="text-slate-500 font-bold">Nenhuma compra no período</p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950 border-b border-slate-800">
                        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <th className="px-6 py-4">Fornecedor</th>
                          <th className="px-6 py-4">Compras</th>
                          <th className="px-6 py-4">Total Litros</th>
                          <th className="px-6 py-4">R$/L Médio</th>
                          <th className="px-6 py-4 text-right">Valor Total</th>
                          <th className="px-6 py-4">Notas Fiscais</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {purchaseData.map((sup, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                  <Building2 size={16} className="text-emerald-400" />
                                </div>
                                <span className="text-white font-bold text-sm">{sup.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-300">{sup.count}x</td>
                            <td className="px-6 py-4 text-sm font-bold text-white">{sup.liters.toLocaleString('pt-BR')} L</td>
                            <td className="px-6 py-4 text-sm text-slate-300">
                              R$ {sup.liters > 0 ? (sup.total / sup.liters).toFixed(4) : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-emerald-400 text-right">
                              R$ {sup.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate">
                              {sup.invoices.join(', ') || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-slate-700 bg-slate-950">
                        <tr className="text-sm font-bold">
                          <td className="px-6 py-4 text-white">TOTAL</td>
                          <td className="px-6 py-4 text-white">{purchaseData.reduce((s, p) => s + p.count, 0)}x</td>
                          <td className="px-6 py-4 text-white">{purchaseData.reduce((s, p) => s + p.liters, 0).toLocaleString('pt-BR')} L</td>
                          <td className="px-6 py-4 text-slate-400">—</td>
                          <td className="px-6 py-4 text-emerald-400 text-right">
                            R$ {purchaseData.reduce((s, p) => s + p.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab FRENTISTAS - Análise por responsável */}
          {activeTab === 'FRENTISTAS' && (
            <div className="space-y-4">
              {attendantData.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
                  <Users size={48} className="mx-auto mb-4 text-slate-700" />
                  <p className="text-slate-500 font-bold">Nenhum abastecimento registrado no período</p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 border-b border-slate-800">
                      <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <th className="px-6 py-4">Frentista</th>
                        <th className="px-6 py-4">Abastecimentos</th>
                        <th className="px-6 py-4">Total Litros</th>
                        <th className="px-6 py-4">Média/Abast.</th>
                        <th className="px-6 py-4">Equipamentos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {attendantData.map((att, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm font-bold">
                                {att.name.charAt(0)}
                              </div>
                              <span className="text-white font-bold text-sm">{att.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">{att.count}x</td>
                          <td className="px-6 py-4 text-sm font-bold text-white">{att.liters.toLocaleString('pt-BR')} L</td>
                          <td className="px-6 py-4 text-sm text-slate-300">
                            {att.count > 0 ? (att.liters / att.count).toFixed(1) : '—'} L
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {att.assetsList.slice(0, 3).map((a, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-bold">
                                  {a}
                                </span>
                              ))}
                              {att.assetsCount > 3 && (
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-500 rounded text-[10px]">
                                  +{att.assetsCount - 3}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-700 bg-slate-950">
                      <tr className="text-sm font-bold">
                        <td className="px-6 py-4 text-white">TOTAL</td>
                        <td className="px-6 py-4 text-white">{attendantData.reduce((s, a) => s + a.count, 0)}x</td>
                        <td className="px-6 py-4 text-white">{attendantData.reduce((s, a) => s + a.liters, 0).toLocaleString('pt-BR')} L</td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FuelReports;
