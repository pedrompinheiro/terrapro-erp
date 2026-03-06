import React, { useState, useEffect } from 'react';
import { AlertCircle, Unlock } from 'lucide-react';
import Modal from '../components/Modal';
import { ContaBancaria } from '../services/bankService';
import { UnifiedTransaction } from './FinancialDashboard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: UnifiedTransaction | null;
  bankAccounts: ContaBancaria[];
  onConfirm: (data: {
    total: number;
    settleDate: string;
    bankId: string;
    applyInterest: boolean;
    discount: number;
  }) => Promise<void>;
}

const FinancialSettle: React.FC<Props> = ({
  isOpen,
  onClose,
  transaction,
  bankAccounts,
  onConfirm,
}) => {
  const [settleDate, setSettleDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [applyInterest, setApplyInterest] = useState(true);
  const [settlementValues, setSettlementValues] = useState({
    original: 0,
    interest: 0,
    fine: 0,
    discount: 0,
    total: 0,
    daysOverdue: 0
  });

  useEffect(() => {
    if (isOpen && transaction) {
      calculateSettlement(transaction);
      // Set default bank
      const defaultAcc = bankAccounts.find(a => a.padrao) || bankAccounts[0];
      if (defaultAcc) setSelectedBankId(defaultAcc.id);
    }
  }, [isOpen, transaction]);

  useEffect(() => {
    if (isOpen && transaction) {
      const base = settlementValues.original;
      if (applyInterest) {
        const currentInterest = settlementValues.daysOverdue > 0 && transaction.type === 'INCOME'
          ? (base * 0.01 / 30 * settlementValues.daysOverdue) : 0;
        const currentFine = settlementValues.daysOverdue > 0 && transaction.type === 'INCOME'
          ? (base * 0.02) : 0;

        setSettlementValues(prev => ({
          ...prev,
          interest: currentInterest,
          fine: currentFine,
          total: base + currentInterest + currentFine - prev.discount
        }));
      } else {
        setSettlementValues(prev => ({
          ...prev,
          interest: 0,
          fine: 0,
          total: base - prev.discount
        }));
      }
    }
  }, [applyInterest]);

  const calculateSettlement = (tr: UnifiedTransaction) => {
    const original = Math.abs(tr.amount);
    const dueDate = new Date(tr.dueDate);
    const today = new Date();

    const diffTime = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let interest = 0;
    let fine = 0;

    if (daysOverdue > 0 && tr.type === 'INCOME') {
      const multaPercent = 2.0;
      const jurosAM = 1.0;
      fine = original * (multaPercent / 100);
      interest = (original * (jurosAM / 100) / 30) * daysOverdue;
    }

    setSettlementValues({
      original,
      interest,
      fine,
      discount: 0,
      total: original + interest + fine,
      daysOverdue: daysOverdue > 0 ? daysOverdue : 0
    });
    setApplyInterest(daysOverdue > 0);
  };

  const handleConfirm = async () => {
    await onConfirm({
      total: settlementValues.total,
      settleDate,
      bankId: selectedBankId,
      applyInterest,
      discount: settlementValues.discount,
    });
  };

  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Baixar / Liquidar Titulo">
      <div className="space-y-6">
        {/* Warning Card se Atrasado */}
        {settlementValues.daysOverdue > 0 && transaction.type === 'INCOME' && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-rose-500 p-2 rounded-full text-white"><AlertCircle size={20} /></div>
            <div>
              <h4 className="font-bold text-rose-400 text-sm">Titulo em Atraso: {settlementValues.daysOverdue} dias</h4>
              <p className="text-xs text-rose-300/70">Juros e multa calculados automaticamente.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Valor Original</label>
            <div className="text-xl font-mono text-slate-300">R$ {settlementValues.original.toFixed(2)}</div>
          </div>
          <div className="space-y-1 text-right">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Vencimento</label>
            <div className="text-sm font-mono text-slate-300">{new Date(transaction.dueDate).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        {/* Area de Calculo */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Multa (2%)</span>
            <span className="font-mono text-rose-400">+ R$ {settlementValues.fine.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Juros (1% a.m pro rata)</span>
            <span className="font-mono text-rose-400">+ R$ {settlementValues.interest.toFixed(2)}</span>
          </div>

          <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={applyInterest}
                onChange={e => setApplyInterest(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
              <label className="text-xs text-slate-300 cursor-pointer" onClick={() => setApplyInterest(!applyInterest)}>Cobrar Encargos?</label>
            </div>
          </div>
        </div>

        {/* Selecao de Conta Bancaria */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Conta de Movimentacao</label>
          <select
            value={selectedBankId}
            onChange={e => setSelectedBankId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
          >
            <option value="">Selecione a conta...</option>
            {bankAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.banco_nome} - Ag: {acc.agencia} CC: {acc.conta}
              </option>
            ))}
          </select>
        </div>

        {/* Total Final */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-end">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Total a {transaction.type === 'INCOME' ? 'Receber' : 'Pagar'}</label>
            <div className={`text-3xl font-black tracking-tighter ${transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
              R$ {settlementValues.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="date"
              value={settleDate}
              onChange={e => setSettleDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white outline-none"
            />
            <button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition shadow-lg">
              Confirmar Baixa
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FinancialSettle;
