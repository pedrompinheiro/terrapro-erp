import React, { useState, useEffect } from 'react';
import { Truck, Download, DollarSign, Plus, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { bungeService, BungeContractItem, BungeBilling, BungeBillingItem, LocacaoItemInput, formatCurrency, formatMonthYear } from '../../services/bungeService';
import { exportLocacaoPDF, exportBillingXLS } from '../../services/bungeExportService';
import { toast } from 'react-hot-toast';

interface Props {
  contractId: string | null;
}

interface LocacaoRow {
  contractItem: BungeContractItem;
  quantity: number;
  included: boolean;
}

const LocacaoTab: React.FC<Props> = ({ contractId }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  });

  const [locacaoRows, setLocacaoRows] = useState<LocacaoRow[]>([]);
  const [existingBilling, setExistingBilling] = useState<BungeBilling | null>(null);
  const [billingItems, setBillingItems] = useState<BungeBillingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (contractId) loadData();
  }, [contractId, selectedMonth]);

  const loadData = async () => {
    if (!contractId) return;
    setLoading(true);
    try {
      // Buscar itens de locação (diária + mensal)
      const allItems = await bungeService.listarItensContrato(contractId);
      const locItems = allItems.filter(i => i.billing_type === 'LOCACAO_DIARIA' || i.billing_type === 'LOCACAO_MENSAL');

      // Verificar billing existente
      const existing = await bungeService.verificarDuplicidade(contractId, 'LOCACAO', selectedMonth);
      setExistingBilling(existing);

      if (existing) {
        const bItems = await bungeService.listarItensFaturamento(existing.id);
        setBillingItems(bItems);
        // Montar rows a partir do billing existente
        setLocacaoRows(locItems.map(ci => {
          const bItem = bItems.find(bi => bi.contract_item_id === ci.id);
          return {
            contractItem: ci,
            quantity: bItem?.quantity || 0,
            included: !!bItem,
          };
        }));
      } else {
        setBillingItems([]);
        setLocacaoRows(locItems.map(ci => ({
          contractItem: ci,
          quantity: 0,
          included: false,
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (idx: number, qty: number) => {
    if (existingBilling) return; // Não editar se já gerado
    setLocacaoRows(prev => prev.map((r, i) => {
      if (i !== idx) return r;
      const newQty = Math.max(0, qty);
      return { ...r, quantity: newQty, included: newQty > 0 };
    }));
  };

  const toggleIncluded = (idx: number) => {
    if (existingBilling) return;
    setLocacaoRows(prev => prev.map((r, i) => {
      if (i !== idx) return r;
      const newIncluded = !r.included;
      return { ...r, included: newIncluded, quantity: newIncluded ? (r.quantity || 1) : 0 };
    }));
  };

  const handleGerar = async () => {
    if (!contractId) return;
    const itensToGenerate = locacaoRows
      .filter(r => r.included && r.quantity > 0)
      .map(r => ({
        contract_item_id: r.contractItem.id,
        asset_id: r.contractItem.asset_id || null,
        equipment_description: r.contractItem.notes || r.contractItem.equipment_description,
        quantity: r.quantity,
        unit_value: r.contractItem.unit_value,
        unit_label: r.contractItem.unit_label,
      } as LocacaoItemInput));

    if (itensToGenerate.length === 0) {
      toast.error('Selecione ao menos um equipamento com quantidade > 0');
      return;
    }

    setGenerating(true);
    try {
      const billing = await bungeService.gerarLocacao(contractId, selectedMonth, itensToGenerate);
      toast.success(`Locação gerada! ${billing.billing_number}`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar locação');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!existingBilling) return;
    try {
      exportLocacaoPDF(existingBilling, billingItems);
      toast.success('PDF exportado!');
      bungeService.atualizarFaturamento(existingBilling.id, { exported_at: new Date().toISOString() });
    } catch (err) {
      toast.error('Erro ao exportar PDF');
    }
  };

  const handleExportXLS = async () => {
    if (!existingBilling) return;
    try {
      await exportBillingXLS(existingBilling, billingItems);
      toast.success('XLS exportado!');
    } catch (err) {
      toast.error('Erro ao exportar XLS');
    }
  };

  const handleFaturar = async () => {
    if (!existingBilling) return;
    try {
      await bungeService.faturar(existingBilling.id);
      toast.success('Faturado! Conta a receber criada.');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao faturar');
    }
  };

  // Calcular total
  const totalPreview = locacaoRows
    .filter(r => r.included && r.quantity > 0)
    .reduce((s, r) => s + (r.quantity * r.contractItem.unit_value), 0);

  // Gerar meses
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mês de Referência</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none"
          >
            {monthOptions.map(m => (
              <option key={m} value={m}>{formatMonthYear(m)}</option>
            ))}
          </select>
        </div>

        {!existingBilling && (
          <button
            onClick={handleGerar}
            disabled={generating || !contractId || totalPreview === 0}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Truck size={18} />
            {generating ? 'Gerando...' : 'Gerar Locação'}
          </button>
        )}

        {existingBilling && (
          <>
            <button
              onClick={handleExportPDF}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-500 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              Exportar PDF
            </button>
            <button
              onClick={handleExportXLS}
              className="bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-600 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              XLS
            </button>
            {existingBilling.status !== 'FATURADO' && existingBilling.status !== 'RECEBIDO' && (
              <button
                onClick={handleFaturar}
                className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-500 transition-all flex items-center gap-2"
              >
                <DollarSign size={18} />
                Faturar
              </button>
            )}
          </>
        )}
      </div>

      {/* Status */}
      {existingBilling && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          existingBilling.status === 'FATURADO' ? 'bg-emerald-500/10 border border-emerald-500/30' :
          'bg-blue-500/10 border border-blue-500/30'
        }`}>
          {existingBilling.status === 'FATURADO' ? (
            <CheckCircle size={20} className="text-emerald-400" />
          ) : (
            <AlertTriangle size={20} className="text-blue-400" />
          )}
          <p className="text-sm font-bold text-white">
            {existingBilling.billing_number} — {existingBilling.status} — {formatCurrency(existingBilling.total)}
          </p>
        </div>
      )}

      {/* Tabela de equipamentos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            {existingBilling ? 'Itens da Locação' : 'Equipamentos Disponíveis'}
          </h3>
          {!existingBilling && totalPreview > 0 && (
            <span className="text-sm font-black text-emerald-400">
              Total: {formatCurrency(totalPreview)}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {!existingBilling && <th className="px-4 py-4 w-10"></th>}
                  <th className="px-4 py-4">Equipamento</th>
                  <th className="px-4 py-4">Tipo</th>
                  <th className="px-4 py-4 text-center">Valor Unit.</th>
                  <th className="px-4 py-4 text-center">Unidade</th>
                  <th className="px-4 py-4 text-center">Qtd</th>
                  <th className="px-4 py-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {existingBilling ? (
                  billingItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-sm text-white">{item.equipment_description}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">-</td>
                      <td className="px-4 py-3 text-center text-sm text-white">{formatCurrency(item.unit_value)}</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-400">{item.unit_label}</td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-white">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-black text-white text-sm">{formatCurrency(item.total_value)}</td>
                    </tr>
                  ))
                ) : (
                  locacaoRows.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-slate-800/30 transition-colors ${!row.included ? 'opacity-40' : ''}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={row.included}
                          onChange={() => toggleIncluded(idx)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{row.contractItem.notes || row.contractItem.equipment_description}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                          row.contractItem.billing_type === 'LOCACAO_DIARIA'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-purple-500/10 text-purple-400'
                        }`}>
                          {row.contractItem.billing_type === 'LOCACAO_DIARIA' ? 'DIÁRIA' : 'MENSAL'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-white">{formatCurrency(row.contractItem.unit_value)}</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-400">{row.contractItem.unit_label}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateQuantity(idx, row.quantity - 1)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            value={row.quantity}
                            onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                            className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center text-white text-sm font-bold"
                            min={0}
                          />
                          <button
                            onClick={() => updateQuantity(idx, row.quantity + 1)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-white text-sm">
                        {row.included && row.quantity > 0 ? formatCurrency(row.quantity * row.contractItem.unit_value) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-950 border-t-2 border-slate-700">
                  <td colSpan={existingBilling ? 5 : 6} className="px-4 py-4 text-right text-sm font-black text-slate-300 uppercase">
                    Total a Faturar
                  </td>
                  <td className="px-4 py-4 text-right font-black text-emerald-400 text-lg">
                    {formatCurrency(existingBilling?.total || totalPreview)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocacaoTab;
