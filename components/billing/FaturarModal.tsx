import React, { useState } from 'react';
import { X, DollarSign, FileText, Truck, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../services/bungeService';

interface Props {
  isOpen: boolean;
  billingNumber: string;
  billingType: string;
  total: number;
  onConfirm: (anexos: {
    pedido_compra: string | null;
    nota_fiscal: string | null;
    nota_locacao: string | null;
  }) => void;
  onClose: () => void;
}

const FaturarModal: React.FC<Props> = ({ isOpen, billingNumber, billingType, total, onConfirm, onClose }) => {
  const [pedidoCompra, setPedidoCompra] = useState('');
  const [notaFiscal, setNotaFiscal] = useState('');
  const [notaLocacao, setNotaLocacao] = useState('');
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm({
        pedido_compra: pedidoCompra.trim() || null,
        nota_fiscal: notaFiscal.trim() || null,
        nota_locacao: notaLocacao.trim() || null,
      });
    } finally {
      setConfirming(false);
    }
  };

  if (!isOpen) return null;

  const showLocacao = billingType === 'LOCACAO' || billingType === 'HE';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Faturar</h3>
              <p className="text-xs text-slate-500">Gerar conta a receber</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Info */}
        <div className="px-6 pt-5">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-bold">{billingNumber}</p>
              <p className="text-sm font-black text-white mt-0.5">{billingType}</p>
            </div>
            <p className="text-xl font-black text-emerald-400">{formatCurrency(total)}</p>
          </div>
        </div>

        {/* Campos de Anexo */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-400 font-bold">Anexar documentos (opcional):</p>

          {/* Pedido de Compra */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <ShoppingCart size={12} />
              Pedido de Compra
            </label>
            <input
              type="text"
              value={pedidoCompra}
              onChange={(e) => setPedidoCompra(e.target.value)}
              placeholder="Nº do pedido de compra..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none placeholder:text-slate-600"
            />
          </div>

          {/* Nota Fiscal */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <FileText size={12} />
              Nota Fiscal
            </label>
            <input
              type="text"
              value={notaFiscal}
              onChange={(e) => setNotaFiscal(e.target.value)}
              placeholder="Nº da nota fiscal..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none placeholder:text-slate-600"
            />
          </div>

          {/* Nota de Locação */}
          {showLocacao && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Truck size={12} />
                Nota de Locação
              </label>
              <input
                type="text"
                value={notaLocacao}
                onChange={(e) => setNotaLocacao(e.target.value)}
                placeholder="Nº da nota de locação..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none placeholder:text-slate-600"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-600/30 hover:bg-amber-500 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <DollarSign size={16} />
            {confirming ? 'Faturando...' : 'Confirmar Faturamento'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaturarModal;
