import React, { useState, useEffect } from 'react';
import { InventoryMovement } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import { ArrowUpCircle, ArrowDownCircle, Clock, RefreshCw } from 'lucide-react';

const MOVEMENT_LABELS: Record<string, { label: string; isEntry: boolean }> = {
  'ENTRADA_COMPRA': { label: 'Compra', isEntry: true },
  'ENTRADA_DEVOLUCAO': { label: 'Devolução', isEntry: true },
  'ENTRADA_AJUSTE': { label: 'Ajuste (+)', isEntry: true },
  'SAIDA_OS': { label: 'Saída OS', isEntry: false },
  'SAIDA_VENDA': { label: 'Venda', isEntry: false },
  'SAIDA_AJUSTE': { label: 'Ajuste (-)', isEntry: false },
  'SAIDA_PERDA': { label: 'Perda', isEntry: false },
  'TRANSFERENCIA': { label: 'Transf.', isEntry: false },
};

interface Props {
  itemId: string;
}

const ItemMovementHistory: React.FC<Props> = ({ itemId }) => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await inventoryService.getMovementsForItem(itemId, 10);
      setMovements(data);
      setLoading(false);
    };
    load();
  }, [itemId]);

  const totalEntries = movements.filter(m => m.movement_type.startsWith('ENTRADA')).reduce((s, m) => s + Number(m.quantity), 0);
  const totalExits = movements.filter(m => m.movement_type.startsWith('SAIDA')).reduce((s, m) => s + Number(m.quantity), 0);

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.toLocaleDateString('pt-BR')}`;
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Clock size={14} /> Movimentações Recentes
      </h4>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <RefreshCw size={16} className="text-slate-500 animate-spin" />
        </div>
      ) : movements.length === 0 ? (
        <p className="text-[10px] text-slate-600 text-center py-2">Nenhuma movimentação registrada</p>
      ) : (
        <>
          <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
            {movements.map((m) => {
              const config = MOVEMENT_LABELS[m.movement_type] || { label: m.movement_type, isEntry: false };
              return (
                <div key={m.id} className="flex items-center justify-between text-[10px] py-1 border-b border-slate-800/50 last:border-0">
                  <div className="flex items-center gap-2">
                    {config.isEntry ? (
                      <ArrowUpCircle size={12} className="text-emerald-500" />
                    ) : (
                      <ArrowDownCircle size={12} className="text-red-500" />
                    )}
                    <span className={`font-bold ${config.isEntry ? 'text-emerald-400' : 'text-red-400'}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-black ${config.isEntry ? 'text-emerald-400' : 'text-red-400'}`}>
                      {config.isEntry ? '+' : '-'}{Number(m.quantity).toFixed(0)}
                    </span>
                    <span className="text-slate-600 w-20 text-right">{formatDate(m.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-800 text-[10px]">
            <div className="flex items-center gap-1">
              <ArrowUpCircle size={10} className="text-emerald-500" />
              <span className="text-emerald-400 font-bold">+{totalEntries.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowDownCircle size={10} className="text-red-500" />
              <span className="text-red-400 font-bold">-{totalExits.toFixed(0)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ItemMovementHistory;
