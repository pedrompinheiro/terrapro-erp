
import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, FileText, Filter, Plus, Save, Banknote, QrCode, Calculator, CheckCircle, Archive } from 'lucide-react';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

import { Transaction, PaymentStatus } from '../types';
import { dashboardService } from '../services/api';

const Financial: React.FC = () => {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [generateBoleto, setGenerateBoleto] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    client: '',
    amount: 0,
    dueDate: '',
    status: PaymentStatus.PENDING,
    type: 'INCOME' // Default
  });

  // Settlement States
  const [applyInterest, setApplyInterest] = useState(true);
  const [calculatedValues, setCalculatedValues] = useState({ interest: 0, fine: 0, total: 0 });

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getTransactions();
      setTransactions(data as Transaction[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Effect to calculate interest on selection
  React.useEffect(() => {
    if (selectedTransaction && isSettleModalOpen) {
      const originalValue = Math.abs(selectedTransaction.amount);

      // Should be calculation based on DUE DATE vs TODAY. For mock, we simply assume if status is 'OVERDUE' it's 30 days late.
      let interest = 0;
      let fine = 0;

      if (selectedTransaction.status === PaymentStatus.OVERDUE) {
        const daysOverdue = 45;
        interest = (originalValue * 0.01 / 30) * daysOverdue;
        fine = originalValue * 0.02;
      }

      if (applyInterest) {
        setCalculatedValues({
          interest,
          fine,
          total: originalValue + interest + fine
        });
      } else {
        setCalculatedValues({
          interest: 0,
          fine: 0,
          total: originalValue
        });
      }
    }
  }, [selectedTransaction, isSettleModalOpen, applyInterest]);

  const handleTransactionClick = (tr: Transaction) => {
    setSelectedTransaction(tr);
    if (tr.status !== PaymentStatus.PAID) {
      setIsSettleModalOpen(true);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.client || !newTransaction.amount || !newTransaction.dueDate) return;

    const transaction: Transaction = {
      id: `TR-${Math.floor(Math.random() * 10000)}`,
      client: newTransaction.client,
      project: 'Geral', // Default project
      amount: newTransaction.type === 'EXPENSE' ? -Math.abs(Number(newTransaction.amount)) : Math.abs(Number(newTransaction.amount)),
      dueDate: newTransaction.dueDate,
      status: newTransaction.status as PaymentStatus,
      type: newTransaction.type as 'INCOME' | 'EXPENSE'
    };

    await dashboardService.addTransaction(transaction);
    await fetchTransactions();
    setIsModalOpen(false);
    setNewTransaction({ client: '', amount: 0, dueDate: '', status: PaymentStatus.PENDING, type: 'INCOME' });
  };

  const handleSettleTransaction = async () => {
    if (!selectedTransaction) return;

    const updated = {
      ...selectedTransaction,
      status: PaymentStatus.PAID,
      amount: selectedTransaction.amount // In real app, we might update amount with interest
    } as Transaction;

    await dashboardService.updateTransaction(updated);
    await fetchTransactions();
    setIsSettleModalOpen(false);
  };

  const handleDeleteTransaction = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      await dashboardService.deleteTransaction(id);
      await fetchTransactions();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#007a33] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Financeiro Integrado</h2>
          <p className="text-slate-500 mt-1">Gestão de contas, fluxo de caixa e integração SEFAZ.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700">Conciliação Bancária</button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <Plus size={18} /> Nova Receita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Saldo em Conta" value="R$ 1.250.400,00" trend="5.2%" trendUp={true} icon={<DollarSign size={24} />} iconBg="bg-blue-600" />
        <StatCard title="A Receber (30d)" value="R$ 380.000,00" trend="12%" trendUp={true} icon={<ArrowUpRight size={24} />} iconBg="bg-emerald-600" />
        <StatCard title="A Pagar (30d)" value="R$ 145.200,00" trend="2%" trendUp={false} icon={<ArrowDownLeft size={24} />} iconBg="bg-rose-600" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Transações Recentes</h3>
          <button className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"><Filter size={18} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-8 py-4">Transação</th>
                <th className="px-8 py-4">Entidade / Fornecedor</th>
                <th className="px-8 py-4">Data</th>
                <th className="px-8 py-4">Valor</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.map((tr) => (
                <tr
                  key={tr.id}
                  onClick={() => handleTransactionClick(tr)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="px-8 py-5 font-mono text-xs text-slate-400 group-hover:text-blue-400">{tr.id}</td>
                  <td className="px-8 py-5 font-bold text-white">{tr.client}</td>
                  <td className="px-8 py-5 text-slate-500">{tr.dueDate}</td>
                  <td className={`px-8 py-5 font-black ${tr.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tr.amount >= 0 ? '+' : '-'} R$ {Math.abs(tr.amount).toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${tr.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                        tr.status === 'OVERDUE' ? 'bg-red-500 text-white' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                        {tr.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <button
                        onClick={(e) => handleDeleteTransaction(e, tr.id)}
                        className="p-2 hover:bg-slate-800 rounded text-slate-500 hover:text-red-500 transition-colors"
                      >
                        <Archive size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Settlement / Baixa */}
      <Modal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        title="Detalhes e Baixa de Título"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            {selectedTransaction.status === 'OVERDUE' && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white"><Calculator size={20} /></div>
                  <div>
                    <h4 className="font-bold text-rose-500 text-sm">Título em Atraso</h4>
                    <p className="text-xs text-rose-300">Cálculo automático de Juros e Multa aplicado.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Dias de Atraso</p>
                  <p className="text-lg font-black text-rose-500 font-mono">45 dias</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Valor Original</label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 font-mono">
                  R$ {Math.abs(selectedTransaction.amount).toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Vencimento Original</label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 font-mono">
                  {selectedTransaction.dueDate}
                </div>
              </div>
            </div>

            {selectedTransaction.status === 'OVERDUE' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    Aplicar Juros (1% a.m) e Multa (2%)?
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={applyInterest} onChange={() => setApplyInterest(!applyInterest)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                {applyInterest && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Multa por Atraso (2%)</span>
                      <span className="text-rose-400 font-mono font-bold">+ R$ {calculatedValues.fine.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Juros Mora (1% a.m - Pro Rata)</span>
                      <span className="text-rose-400 font-mono font-bold">+ R$ {calculatedValues.interest.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Atualizado a Pagar</p>
                <p className="text-3xl font-black text-emerald-500 tracking-tighter">
                  R$ {calculatedValues.total.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleSettleTransaction}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2">
                <CheckCircle size={20} /> Confirmar Baixa
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Nova Receita (Existing) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Transação (Receita ou Despesa)"
      >
        <div className="space-y-6">
          {/* Section 1: Basic Info */}
          <div>
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Dados do Título</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição do Lançamento</label>
                <input
                  placeholder="Ex: Mensalidade Contrato 001/24"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  value={newTransaction.client}
                  onChange={(e) => setNewTransaction({ ...newTransaction, client: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
                  >
                    <option value="INCOME">Receita</option>
                    <option value="EXPENSE">Despesa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    value={newTransaction.status}
                    onChange={(e) => setNewTransaction({ ...newTransaction, status: e.target.value as any })}
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="PAID">Pago</option>
                    <option value="OVERDUE">Atrasado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Centro de Custo</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none">
                    <option>Receita Operacional</option>
                    <option>Aluguel de Máquinas</option>
                    <option>Serviços Técnicos</option>
                    <option>Despesas Gerais</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Vencimento</label>
                  <input
                    type="date"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    value={newTransaction.dueDate}
                    onChange={(e) => setNewTransaction({ ...newTransaction, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Valor (R$)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-mono"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddTransaction}
              className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {generateBoleto ? 'Salvar e Emitir Boleto' : 'Salvar Transação'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Financial;
