import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Filter, Plus, Archive, Wallet, Landmark, CreditCard, Trash2, Folder, Paperclip } from 'lucide-react';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { ContaReceber } from '../services/receivableService';
import { ContaPagar } from '../services/paymentService';
import { ContaBancaria } from '../services/bankService';

// Interface unificada para a View
export interface UnifiedTransaction {
  id: string;
  originalId: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  entityName: string;
  entityId: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELADO';
  originalStatus: string;
  costCenterId?: string;
  costCenterGroup?: string;
  costCenterName?: string;
  rateioCount?: number;
  anexoUrl?: string;
}

interface Props {
  transactions: UnifiedTransaction[];
  bankAccounts: ContaBancaria[];
  stats: { balance: number; income30d: number; expense30d: number; totalAvailable: number };
  entities: { id: string; name: string }[];
  costCenters: { id: string; nome: string; codigo?: string; tipo?: string; grupo_dre?: string }[];
  loading: boolean;
  onTransactionClick: (tr: UnifiedTransaction) => void;
  onDelete: (e: React.MouseEvent, tr: UnifiedTransaction) => void;
  onDeleteBank: (e: React.MouseEvent, id: string) => void;
  onOpenNewTransaction: () => void;
  onOpenBankModal: () => void;
  onOpenDRE: () => void;
  onOpenSettings: () => void;
  onOpenCostCenters: () => void;
}

const FinancialDashboard: React.FC<Props> = ({
  transactions,
  bankAccounts,
  stats,
  loading,
  onTransactionClick,
  onDelete,
  onDeleteBank,
  onOpenNewTransaction,
  onOpenBankModal,
  onOpenDRE,
  onOpenSettings,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const filteredTransactions = transactions.filter(t => {
    if (filterText && !t.description.toLowerCase().includes(filterText.toLowerCase()) && !t.entityName.toLowerCase().includes(filterText.toLowerCase())) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    return true;
  });

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* BANK ACCOUNTS CAROUSEL */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Caixa e Bancos</h3>
        <button
          onClick={onOpenBankModal}
          className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
        >
          <CreditCard size={14} /> Gerenciar Contas
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {bankAccounts.length === 0 ? (
          <div className="col-span-4 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-6 text-center text-slate-500">
            Nenhuma conta bancaria cadastrada.
          </div>
        ) : (
          bankAccounts.map(acc => (
            <div key={acc.id} className={`group relative p-5 rounded-2xl border ${acc.padrao ? 'bg-slate-800 border-emerald-500/50 shadow-emerald-900/10 shadow-lg' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="bg-slate-950 p-2 rounded-lg text-slate-300">
                  {acc.tipo_conta === 'CAIXA_FISICO' ? <Wallet size={20} /> : <Landmark size={20} />}
                </div>
                {acc.padrao && <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Padrao</span>}
              </div>
              <h4 className="font-bold text-slate-300 text-sm truncate">{acc.banco_nome}</h4>
              <p className="text-xs text-slate-500 mb-2 truncate">Ag: {acc.agencia} • CC: {acc.conta}</p>
              <div className="text-xl font-black text-white tracking-tight">
                R$ {acc.saldo_atual?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <button
                onClick={(e) => onDeleteBank(e, acc.id)}
                className="absolute top-2 right-2 p-1.5 bg-rose-500/20 text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                title="Excluir Conta"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Disponibilidade Total (Caixa + Bancos)"
          value={`R$ ${stats.totalAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend="Atualizado agora"
          trendUp={true}
          icon={<Wallet size={24} />}
          iconBg="bg-blue-600"
        />
        <StatCard
          title="Previsao de Recebimento"
          value={`R$ ${stats.income30d.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend="A receber"
          trendUp={true}
          icon={<ArrowUpRight size={24} />}
          iconBg="bg-emerald-600"
        />
        <StatCard
          title="Previsao de Pagamento"
          value={`R$ ${stats.expense30d.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend="A pagar"
          trendUp={false}
          icon={<ArrowDownLeft size={24} />}
          iconBg="bg-rose-600"
        />
      </div>

      {/* Tabela de Transacoes */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-col gap-4 bg-slate-950/30">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Extrato Unificado</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-all ${showFilters ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
            >
              <Filter size={18} />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800 animate-in slide-in-from-top-2">
              <input
                placeholder="Buscar por descricao, cliente..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
              />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
              >
                <option value="ALL">Todas as Movimentacoes</option>
                <option value="INCOME">Apenas Receitas</option>
                <option value="EXPENSE">Apenas Despesas</option>
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
              >
                <option value="ALL">Todos os Status</option>
                <option value="PENDING">Pendente</option>
                <option value="PAID">Pago / Recebido</option>
                <option value="OVERDUE">Vencido</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
              <button
                onClick={() => { setFilterText(''); setFilterType('ALL'); setFilterStatus('ALL'); }}
                className="text-xs text-slate-500 hover:text-white underline"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Descricao / Entidade</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Nenhuma transacao encontrada.</td>
                </tr>
              ) : (
                filteredTransactions.map((tr) => (
                  <tr
                    key={tr.id}
                    onClick={() => onTransactionClick(tr)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${tr.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        tr.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          tr.status === 'CANCELADO' ? 'bg-slate-700 text-slate-400 border-slate-600' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                        {tr.status === 'PAID' ? 'Pago' : tr.status === 'OVERDUE' ? 'Atrasado' : tr.status === 'CANCELADO' ? 'Cancelado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-bold text-white mb-0.5 flex items-center gap-1.5">
                          {tr.description}
                          {tr.anexoUrl && (
                            <a
                              href={tr.anexoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              title="Ver documento anexado"
                              className="text-blue-400 hover:text-blue-300 transition shrink-0"
                            >
                              <Paperclip size={13} />
                            </a>
                          )}
                        </div>
                        {tr.rateioCount && tr.rateioCount > 0 ? (
                          <span className="text-[9px] w-fit px-1.5 py-0.5 bg-purple-500/20 rounded text-purple-400 border border-purple-500/30 mb-1 flex items-center gap-1">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 010 20M12 2v20M2 12h20"/></svg>
                            Rateio ({tr.rateioCount} CCs)
                          </span>
                        ) : tr.costCenterName ? (
                          <span className="text-[9px] w-fit px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700 truncate max-w-[150px] mb-1">
                            {tr.costCenterName}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        {tr.type === 'INCOME' ? <ArrowUpRight size={10} className="text-emerald-500" /> : <ArrowDownLeft size={10} className="text-rose-500" />}
                        {tr.entityName}
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-mono text-xs ${tr.status === 'OVERDUE' ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                      {new Date(tr.dueDate).toLocaleDateString('pt-BR')}
                      {tr.status === 'OVERDUE' && <span className="ml-2 text-[9px] bg-rose-500/20 px-1 rounded">VENCIDO</span>}
                    </td>
                    <td className={`px-6 py-4 text-right font-black text-sm ${tr.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tr.amount >= 0 ? '+' : '-'} R$ {Math.abs(tr.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => onDelete(e, tr)}
                        className="p-2 rounded-lg text-slate-600 hover:text-red-500 hover:bg-slate-800 transition-colors"
                        title="Cancelar Lancamento"
                      >
                        <Archive size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default FinancialDashboard;
