import React, { useState, useEffect } from 'react';
import { FileText, Download, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { bungeService, BungeContractItem, BungeBilling, BungeBillingItem, formatCurrency, formatMonthYear } from '../../services/bungeService';
import { exportMensalidadePDF, exportBillingXLS } from '../../services/bungeExportService';
import { toast } from 'react-hot-toast';

interface Props {
  contractId: string | null;
}

const MensalidadeTab: React.FC<Props> = ({ contractId }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [contractItems, setContractItems] = useState<BungeContractItem[]>([]);
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
      const [items, existing] = await Promise.all([
        bungeService.listarItensContrato(contractId, 'MENSALIDADE'),
        bungeService.verificarDuplicidade(contractId, 'MENSALIDADE', selectedMonth),
      ]);
      setContractItems(items);
      setExistingBilling(existing);

      if (existing) {
        const bItems = await bungeService.listarItensFaturamento(existing.id);
        setBillingItems(bItems);
      } else {
        setBillingItems([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGerar = async () => {
    if (!contractId) return;
    setGenerating(true);
    try {
      const billing = await bungeService.gerarMensalidade(contractId, selectedMonth);
      toast.success(`Mensalidade gerada! ${billing.billing_number}`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar mensalidade');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!existingBilling) return;
    try {
      exportMensalidadePDF(existingBilling, billingItems);
      toast.success('PDF exportado!');
      bungeService.atualizarFaturamento(existingBilling.id, { exported_at: new Date().toISOString() });
    } catch (err: any) {
      toast.error('Erro ao exportar PDF');
    }
  };

  const handleExportXLS = async () => {
    if (!existingBilling) return;
    try {
      await exportBillingXLS(existingBilling, billingItems);
      toast.success('XLS exportado!');
    } catch (err: any) {
      toast.error('Erro ao exportar XLS');
    }
  };

  const handleFaturar = async () => {
    if (!existingBilling) return;
    try {
      await bungeService.faturar(existingBilling.id);
      toast.success('Faturado! Conta a receber criada no Financeiro.');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao faturar');
    }
  };

  const total = contractItems.reduce((s, i) => s + i.unit_value, 0);
  const displayItems = existingBilling ? billingItems : contractItems.map(i => ({
    ...i,
    equipment_description: i.equipment_description,
    total_value: i.unit_value,
    unit_label: i.unit_label,
  }));

  // Gerar meses para seleção (últimos 12 meses)
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
            disabled={generating || !contractId}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <FileText size={18} />
            {generating ? 'Gerando...' : 'Gerar Mensalidade'}
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
                Faturar (Gerar Conta a Receber)
              </button>
            )}
          </>
        )}
      </div>

      {/* Status do billing existente */}
      {existingBilling && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          existingBilling.status === 'FATURADO' || existingBilling.status === 'RECEBIDO'
            ? 'bg-emerald-500/10 border border-emerald-500/30'
            : 'bg-blue-500/10 border border-blue-500/30'
        }`}>
          {existingBilling.status === 'FATURADO' || existingBilling.status === 'RECEBIDO' ? (
            <CheckCircle size={20} className="text-emerald-400" />
          ) : (
            <AlertTriangle size={20} className="text-blue-400" />
          )}
          <div>
            <p className="text-sm font-bold text-white">
              {existingBilling.billing_number} — Status: {existingBilling.status}
            </p>
            <p className="text-xs text-slate-400">
              {existingBilling.status === 'FATURADO' ? 'Conta a receber já criada no financeiro.' :
               existingBilling.status === 'GERADO' ? 'Pronto para exportar PDF e enviar ao cliente.' :
               existingBilling.status}
            </p>
          </div>
        </div>
      )}

      {/* Tabela de itens */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            {existingBilling ? 'Itens do Faturamento' : 'Preview - Itens do Contrato'}
          </h3>
          <span className="text-xs text-slate-500 font-bold">{formatMonthYear(selectedMonth)}</span>
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
                  <th className="px-6 py-4 w-8">#</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4 text-right">Valor Total (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {displayItems.map((item: any, idx: number) => (
                  <tr key={item.id || idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm text-white">{item.equipment_description}</td>
                    <td className="px-6 py-4 text-right font-black text-white text-sm">
                      {formatCurrency(item.total_value || item.unit_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-950 border-t-2 border-slate-700">
                  <td colSpan={2} className="px-6 py-4 text-right text-sm font-black text-slate-300 uppercase">
                    Valor à Faturar
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-400 text-lg">
                    {formatCurrency(existingBilling?.total || total)}
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

export default MensalidadeTab;
