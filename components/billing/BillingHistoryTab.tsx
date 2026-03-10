import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Trash2 } from 'lucide-react';
import { bungeService, BungeBilling, BungeBillingItem, formatCurrency, formatMonthYear } from '../../services/bungeService';
import { exportMensalidadePDF, exportHEPDF, exportLocacaoPDF, exportBillingXLS } from '../../services/bungeExportService';
import Modal from '../Modal';
import { toast } from 'react-hot-toast';

interface Props {
  contractId: string | null;
}

const statusColors: Record<string, string> = {
  RASCUNHO: 'bg-slate-500/10 text-slate-400',
  GERADO: 'bg-blue-500/10 text-blue-400',
  ENVIADO: 'bg-amber-500/10 text-amber-400',
  FATURADO: 'bg-emerald-500/10 text-emerald-400',
  RECEBIDO: 'bg-green-500/10 text-green-400',
  CANCELADO: 'bg-red-500/10 text-red-400',
};

const BillingHistoryTab: React.FC<Props> = ({ contractId }) => {
  const [billings, setBillings] = useState<BungeBilling[]>([]);
  const [filteredBillings, setFilteredBillings] = useState<BungeBilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Detail modal
  const [selectedBilling, setSelectedBilling] = useState<BungeBilling | null>(null);
  const [selectedItems, setSelectedItems] = useState<BungeBillingItem[]>([]);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadData();
  }, [contractId]);

  useEffect(() => {
    applyFilters();
  }, [billings, search, filterType, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await bungeService.listarFaturamentos({
        contract_id: contractId || undefined,
      });
      setBillings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...billings];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(b =>
        b.billing_number.toLowerCase().includes(s) ||
        b.reference_month.includes(s) ||
        formatMonthYear(b.reference_month).toLowerCase().includes(s)
      );
    }
    if (filterType) result = result.filter(b => b.billing_type === filterType);
    if (filterStatus) result = result.filter(b => b.status === filterStatus);
    setFilteredBillings(result);
  };

  const handleView = async (billing: BungeBilling) => {
    setSelectedBilling(billing);
    const items = await bungeService.listarItensFaturamento(billing.id);
    setSelectedItems(items);
    setShowDetail(true);
  };

  const handleExportPDF = async (billing: BungeBilling) => {
    const items = await bungeService.listarItensFaturamento(billing.id);
    if (billing.billing_type === 'MENSALIDADE') {
      exportMensalidadePDF(billing, items);
    } else if (billing.billing_type === 'HE') {
      exportHEPDF(billing, items);
    } else {
      exportLocacaoPDF(billing, items);
    }
    toast.success('PDF exportado!');
  };

  const handleCancelar = async (billing: BungeBilling) => {
    if (!confirm(`Cancelar faturamento ${billing.billing_number}?`)) return;
    try {
      await bungeService.cancelarFaturamento(billing.id);
      toast.success('Faturamento cancelado');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 flex-1 max-w-xs">
          <Search size={16} className="text-slate-500" />
          <input
            placeholder="Buscar por número ou mês..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs font-bold text-white outline-none w-full"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
        >
          <option value="">Todos os tipos</option>
          <option value="MENSALIDADE">Mensalidade</option>
          <option value="HE">Hora Extra</option>
          <option value="LOCACAO">Locação</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
        >
          <option value="">Todos os status</option>
          <option value="GERADO">Gerado</option>
          <option value="ENVIADO">Enviado</option>
          <option value="FATURADO">Faturado</option>
          <option value="RECEBIDO">Recebido</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Número</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Mês Ref.</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Criado em</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                  </td>
                </tr>
              ) : filteredBillings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-sm">
                    Nenhum faturamento encontrado.
                  </td>
                </tr>
              ) : (
                filteredBillings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">{b.billing_number}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                        b.billing_type === 'MENSALIDADE' ? 'bg-emerald-500/10 text-emerald-400' :
                        b.billing_type === 'HE' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-purple-500/10 text-purple-400'
                      }`}>
                        {b.billing_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{formatMonthYear(b.reference_month)}</td>
                    <td className="px-6 py-4 text-right font-black text-white">{formatCurrency(b.total)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusColors[b.status] || ''}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(b.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(b)}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleExportPDF(b)}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
                          title="Exportar PDF"
                        >
                          <Download size={16} />
                        </button>
                        {b.status !== 'FATURADO' && b.status !== 'RECEBIDO' && b.status !== 'CANCELADO' && (
                          <button
                            onClick={() => handleCancelar(b)}
                            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                            title="Cancelar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhe */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={`Faturamento ${selectedBilling?.billing_number || ''}`}
        size="2xl"
      >
        {selectedBilling && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 text-xs font-bold">Tipo</span>
                <p className="text-white font-bold">{selectedBilling.billing_type}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs font-bold">Mês Referência</span>
                <p className="text-white font-bold">{formatMonthYear(selectedBilling.reference_month)}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs font-bold">Status</span>
                <p className={`font-black ${
                  selectedBilling.status === 'FATURADO' ? 'text-emerald-400' :
                  selectedBilling.status === 'CANCELADO' ? 'text-red-400' :
                  'text-blue-400'
                }`}>{selectedBilling.status}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs font-bold">Total</span>
                <p className="text-emerald-400 font-black text-lg">{formatCurrency(selectedBilling.total)}</p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h4 className="text-xs font-black text-slate-500 uppercase mb-3">Itens</h4>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-500 uppercase">
                    <th className="py-2">Descrição</th>
                    <th className="py-2 text-center">Qtd</th>
                    <th className="py-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-sm text-white">{item.equipment_description}</td>
                      <td className="py-2 text-center text-sm text-slate-400">
                        {item.quantity} {item.unit_label}
                        {item.he_total_hours_display && ` (${item.he_total_hours_display})`}
                      </td>
                      <td className="py-2 text-right font-bold text-white">{formatCurrency(item.total_value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BillingHistoryTab;
