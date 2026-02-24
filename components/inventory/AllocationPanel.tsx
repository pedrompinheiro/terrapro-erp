import React, { useState, useEffect, useCallback } from 'react';
import { PurchaseReceiptItemAllocation, CostCenter, Asset } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import { Plus, Trash2, Save, Truck, Building2, Wrench, Package, Loader2 } from 'lucide-react';
import { showToast as toast } from '../../lib/toast';

interface AllocationPanelProps {
  receiptItemId: string;
  totalQty: number;
  onChanged: () => void;
}

type AllocType = 'EQUIPMENT' | 'COST_CENTER' | 'SERVICE_ORDER' | 'STOCK';

interface AllocRow extends Partial<PurchaseReceiptItemAllocation> {
  _dirty?: boolean;
  _saving?: boolean;
  _equipSearch?: string;
  _equipResults?: Asset[];
}

const TYPE_ICONS: Record<AllocType, React.ReactNode> = {
  EQUIPMENT: <Truck className="w-3 h-3" />,
  COST_CENTER: <Building2 className="w-3 h-3" />,
  SERVICE_ORDER: <Wrench className="w-3 h-3" />,
  STOCK: <Package className="w-3 h-3" />,
};

const TYPE_LABELS: Record<AllocType, string> = {
  EQUIPMENT: 'Equipamento',
  COST_CENTER: 'Centro Custo',
  SERVICE_ORDER: 'Ordem Serv.',
  STOCK: 'Estoque',
};

export default function AllocationPanel({ receiptItemId, totalQty, onChanged }: AllocationPanelProps) {
  const [rows, setRows] = useState<AllocRow[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);

  const sumAllocated = rows.reduce((s, r) => s + (r.qty_allocated || 0), 0);
  const pct = totalQty > 0 ? Math.min((sumAllocated / totalQty) * 100, 100) : 0;
  const barColor = sumAllocated === totalQty ? 'bg-emerald-500' : sumAllocated > totalQty ? 'bg-red-500' : 'bg-amber-500';

  const load = useCallback(async () => {
    setLoading(true);
    const [allocs, ccs] = await Promise.all([
      inventoryService.getReceiptAllocations(receiptItemId),
      inventoryService.getCostCenters(),
    ]);
    setRows(allocs.map(a => ({ ...a, _dirty: false })));
    setCostCenters(ccs);
    setLoading(false);
  }, [receiptItemId]);

  useEffect(() => { load(); }, [load]);

  const addRow = () => {
    setRows(prev => [...prev, {
      purchase_receipt_item_id: receiptItemId,
      allocation_type: 'STOCK',
      qty_allocated: 0,
      _dirty: true,
    }]);
  };

  const updateRow = (idx: number, patch: Partial<AllocRow>) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, ...patch, _dirty: true } : r));
  };

  const handleTypeChange = (idx: number, type: AllocType) => {
    updateRow(idx, {
      allocation_type: type,
      equipment_id: undefined,
      cost_center_id: undefined,
      service_order_id: undefined,
      equipment_name: undefined,
      cost_center_name: undefined,
      _equipSearch: '',
      _equipResults: [],
    });
  };

  const searchEquipments = async (idx: number, term: string) => {
    updateRow(idx, { _equipSearch: term });
    if (term.length < 2) { updateRow(idx, { _equipResults: [] }); return; }
    const results = await inventoryService.getEquipments(term);
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, _equipResults: results } : r));
  };

  const selectEquipment = (idx: number, eq: Asset) => {
    const ccId = (eq as any).current_cost_center_id || (eq as any).default_cost_center_id;
    const cc = costCenters.find(c => c.id === ccId);
    updateRow(idx, {
      equipment_id: eq.id,
      equipment_name: eq.name,
      cost_center_id: ccId || undefined,
      cost_center_name: cc?.name,
      _equipSearch: eq.name,
      _equipResults: [],
    });
  };

  const saveRow = async (idx: number) => {
    const row = rows[idx];
    if (!row.qty_allocated || row.qty_allocated <= 0) { toast.error('Quantidade deve ser > 0'); return; }
    updateRow(idx, { _saving: true });
    try {
      const payload: Partial<PurchaseReceiptItemAllocation> = {
        ...(row.id && { id: row.id }),
        purchase_receipt_item_id: receiptItemId,
        allocation_type: row.allocation_type,
        qty_allocated: row.qty_allocated,
        equipment_id: row.allocation_type === 'EQUIPMENT' ? row.equipment_id : undefined,
        cost_center_id: ['EQUIPMENT', 'COST_CENTER'].includes(row.allocation_type!) ? row.cost_center_id : undefined,
        service_order_id: row.allocation_type === 'SERVICE_ORDER' ? row.service_order_id : undefined,
      };
      await inventoryService.upsertAllocation(payload);
      toast.success('Alocacao salva');
      await load();
      onChanged();
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar');
    } finally {
      setRows(prev => prev.map((r, i) => i === idx ? { ...r, _saving: false } : r));
    }
  };

  const deleteRow = async (idx: number) => {
    const row = rows[idx];
    if (row.id) {
      await inventoryService.deleteAllocation(row.id);
      toast.success('Alocacao removida');
      onChanged();
    }
    setRows(prev => prev.filter((_, i) => i !== idx));
    if (row.id) await load();
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex items-center gap-2 text-xs text-slate-400">
        <Loader2 className="w-3 h-3 animate-spin" /> Carregando alocacoes...
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">Alocacoes</span>
        <button onClick={addRow} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
          <Plus className="w-3 h-3" /> Alocacao
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>{sumAllocated} / {totalQty}</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Rows */}
      {rows.length === 0 && (
        <p className="text-[10px] text-slate-500 text-center py-2">Nenhuma alocacao. Clique em "+ Alocacao".</p>
      )}

      <div className="space-y-1.5">
        {rows.map((row, idx) => (
          <div key={row.id || `new-${idx}`} className="bg-slate-900/40 border border-slate-700/60 rounded-lg p-2 space-y-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Type select */}
              <div className="flex items-center gap-1">
                {TYPE_ICONS[row.allocation_type as AllocType]}
                <select
                  value={row.allocation_type}
                  onChange={e => handleTypeChange(idx, e.target.value as AllocType)}
                  className="bg-slate-800 border border-slate-600 rounded text-xs text-slate-200 px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {(Object.keys(TYPE_LABELS) as AllocType[]).map(t => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic selector */}
              <div className="flex-1 min-w-[120px] relative">
                {row.allocation_type === 'EQUIPMENT' && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar equipamento..."
                      value={row._equipSearch ?? row.equipment_name ?? ''}
                      onChange={e => searchEquipments(idx, e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded text-xs text-slate-200 px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {row._equipResults && row._equipResults.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-0.5 bg-slate-800 border border-slate-600 rounded shadow-lg max-h-32 overflow-y-auto">
                        {row._equipResults.map(eq => (
                          <button key={eq.id} onClick={() => selectEquipment(idx, eq)}
                            className="w-full text-left px-2 py-1 text-xs text-slate-200 hover:bg-slate-700 transition-colors">
                            {eq.code} - {eq.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {row.cost_center_name && (
                      <span className="text-[10px] text-slate-500 mt-0.5 block">CC: {row.cost_center_name}</span>
                    )}
                  </div>
                )}
                {row.allocation_type === 'COST_CENTER' && (
                  <select
                    value={row.cost_center_id || ''}
                    onChange={e => updateRow(idx, { cost_center_id: e.target.value, cost_center_name: costCenters.find(c => c.id === e.target.value)?.name })}
                    className="w-full bg-slate-800 border border-slate-600 rounded text-xs text-slate-200 px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    {costCenters.map(cc => (
                      <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>
                    ))}
                  </select>
                )}
                {row.allocation_type === 'SERVICE_ORDER' && (
                  <input
                    type="text"
                    placeholder="ID da OS"
                    value={row.service_order_id || ''}
                    onChange={e => updateRow(idx, { service_order_id: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded text-xs text-slate-200 px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                )}
                {row.allocation_type === 'STOCK' && (
                  <span className="text-[10px] text-slate-500 italic">Estoque geral</span>
                )}
              </div>

              {/* Qty */}
              <input
                type="number"
                min={0}
                value={row.qty_allocated || ''}
                onChange={e => updateRow(idx, { qty_allocated: Number(e.target.value) })}
                placeholder="Qtd"
                className="w-16 bg-slate-800 border border-slate-600 rounded text-xs text-slate-200 text-center px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              {/* Actions */}
              <div className="flex items-center gap-0.5">
                <button onClick={() => saveRow(idx)} disabled={row._saving}
                  className="p-1 rounded text-emerald-400 hover:bg-emerald-400/10 disabled:opacity-40 transition-colors" title="Salvar">
                  {row._saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                </button>
                <button onClick={() => deleteRow(idx)}
                  className="p-1 rounded text-red-400 hover:bg-red-400/10 transition-colors" title="Remover">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
