import React, { useState, useEffect } from 'react';
import { Plus, Save, Calculator, CheckCircle, Lock, Unlock, Settings, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Modal from '../components/Modal';

import { receivableService, ContaReceber } from '../services/receivableService';
import { paymentService, ContaPagar } from '../services/paymentService';
import { bankService, ContaBancaria } from '../services/bankService';
import { adminSecurityService } from '../services/adminSecurityService';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

import FinancialDashboard, { UnifiedTransaction } from './FinancialDashboard';
import FinancialSettle from './FinancialSettle';
import FinancialDRE from './FinancialDRE';
import FinancialCostCenters from './FinancialCostCenters';
import FinancialBanks from './FinancialBanks';

const Financial: React.FC = () => {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<ContaBancaria[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isDREModalOpen, setIsDREModalOpen] = useState(false);
  const [isCostCenterModalOpen, setIsCostCenterModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Entidades e Centros de Custo
  const [entities, setEntities] = useState<{ id: string; name: string }[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);

  // Transacao selecionada (para settle)
  const [selectedTransaction, setSelectedTransaction] = useState<UnifiedTransaction | null>(null);

  // Security
  const [securityPassword, setSecurityPassword] = useState('');
  const [pendingSecureAction, setPendingSecureAction] = useState<(() => Promise<void>) | null>(null);

  // Settings
  const [settingsAdminPass, setSettingsAdminPass] = useState('');
  const [settingsNewAdminPass, setSettingsNewAdminPass] = useState('');

  // Novo lancamento
  const [newTransaction, setNewTransaction] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    description: '',
    entityId: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    costCenterId: '',
  });

  // Stats
  const [stats, setStats] = useState({
    balance: 0,
    income30d: 0,
    expense30d: 0,
    totalAvailable: 0,
  });

  useEffect(() => {
    loadData();
    loadEntities();
    loadBankAccounts();
    loadCostCenters();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recebiveis, pagaveis] = await Promise.all([
        receivableService.listar(),
        paymentService.listar(),
      ]);

      const unified: UnifiedTransaction[] = [];
      const today = new Date().toISOString().split('T')[0];

      (recebiveis || []).forEach((r: any) => {
        const isOverdue = r.data_vencimento < today && r.status !== 'RECEBIDO' && r.status !== 'CANCELADO';
        unified.push({
          id: `R-${r.id}`,
          originalId: r.id,
          type: 'INCOME',
          description: r.descricao || r.numero_titulo,
          entityName: r.cliente?.name || r.cliente_nome || 'Cliente',
          entityId: r.cliente_id,
          amount: r.valor_original,
          dueDate: r.data_vencimento,
          status: r.status === 'RECEBIDO' ? 'PAID' : r.status === 'CANCELADO' ? 'CANCELADO' : isOverdue ? 'OVERDUE' : 'PENDING',
          originalStatus: r.status,
          costCenterId: r.centro_custo_id,
          costCenterGroup: r.centro_custo?.grupo_dre,
          costCenterName: r.centro_custo?.nome,
        });
      });

      (pagaveis || []).forEach((p: any) => {
        const isOverdue = p.data_vencimento < today && p.status !== 'PAGO' && p.status !== 'CANCELADO';
        unified.push({
          id: `P-${p.id}`,
          originalId: p.id,
          type: 'EXPENSE',
          description: p.descricao || p.numero_titulo,
          entityName: p.fornecedor?.name || p.fornecedor_nome || 'Fornecedor',
          entityId: p.fornecedor_id,
          amount: -p.valor_original,
          dueDate: p.data_vencimento,
          status: p.status === 'PAGO' ? 'PAID' : p.status === 'CANCELADO' ? 'CANCELADO' : isOverdue ? 'OVERDUE' : 'PENDING',
          originalStatus: p.status,
          costCenterId: p.centro_custo_id,
          costCenterGroup: p.centro_custo?.grupo_dre,
          costCenterName: p.centro_custo?.nome,
        });
      });

      // Ordenar por data de vencimento (mais recente primeiro)
      unified.sort((a, b) => b.dueDate.localeCompare(a.dueDate));
      setTransactions(unified);

      // Calcular stats
      const pendingIncome = unified.filter(t => t.type === 'INCOME' && t.status !== 'PAID' && t.status !== 'CANCELADO')
        .reduce((sum, t) => sum + t.amount, 0);
      const pendingExpense = unified.filter(t => t.type === 'EXPENSE' && t.status !== 'PAID' && t.status !== 'CANCELADO')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      setStats(prev => ({
        ...prev,
        income30d: pendingIncome,
        expense30d: pendingExpense,
      }));
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const loadEntities = async () => {
    try {
      const { data } = await supabase
        .from('entities')
        .select('id, name')
        .order('name');
      setEntities(data || []);
    } catch (error) {
      console.error('Erro ao carregar entidades:', error);
    }
  };

  const loadBankAccounts = async () => {
    try {
      const data = await bankService.listar();
      setBankAccounts(data || []);
      const totalSaldo = (data || []).reduce((sum: number, acc: ContaBancaria) => sum + (acc.saldo_atual || 0), 0);
      setStats(prev => ({ ...prev, totalAvailable: totalSaldo, balance: totalSaldo }));
    } catch (error) {
      console.error('Erro ao carregar contas bancarias:', error);
    }
  };

  const loadCostCenters = async () => {
    try {
      const { data } = await supabase
        .from('centros_custo')
        .select('id, nome, codigo, tipo, grupo_dre')
        .eq('ativo', true)
        .order('nome');
      setCostCenters(data || []);
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
    }
  };

  // ============================================================
  // SECURITY CHECK (via Edge Function, com fallback legado)
  // ============================================================
  const requireSecurity = (action: () => Promise<void>) => {
    setPendingSecureAction(() => action);
    setSecurityPassword('');
    setIsSecurityModalOpen(true);
  };

  const handleSecurityConfirm = async () => {
    if (!securityPassword) {
      toast.error('Digite a senha do administrador');
      return;
    }

    try {
      // Tentar via Edge Function (novo)
      const valid = await adminSecurityService.verify(securityPassword);
      if (valid) {
        setIsSecurityModalOpen(false);
        if (pendingSecureAction) {
          await pendingSecureAction();
          setPendingSecureAction(null);
        }
        return;
      }
      toast.error('Senha incorreta');
    } catch {
      // Fallback: verificar diretamente na app_config (legado)
      try {
        const { data } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'admin_password')
          .single();

        if (data?.value === securityPassword) {
          setIsSecurityModalOpen(false);
          if (pendingSecureAction) {
            await pendingSecureAction();
            setPendingSecureAction(null);
          }
          return;
        }
        toast.error('Senha incorreta');
      } catch {
        toast.error('Erro ao verificar senha');
      }
    }
  };

  // ============================================================
  // CANCELAR TITULO (soft delete via service)
  // ============================================================
  const handleDelete = (e: React.MouseEvent, tr: UnifiedTransaction) => {
    e.stopPropagation();
    if (tr.status === 'PAID') {
      toast.error('Nao e possivel cancelar titulo ja pago/recebido');
      return;
    }
    if (tr.status === 'CANCELADO') {
      toast.error('Titulo ja cancelado');
      return;
    }

    requireSecurity(async () => {
      try {
        if (tr.type === 'INCOME') {
          await receivableService.cancelar(tr.originalId, 'Cancelado pelo operador via painel financeiro');
        } else {
          await paymentService.cancelar(tr.originalId, 'Cancelado pelo operador via painel financeiro');
        }
        toast.success('Titulo cancelado com sucesso');
        loadData();
      } catch (error) {
        console.error(error);
        toast.error('Erro ao cancelar titulo');
      }
    });
  };

  // ============================================================
  // DELETAR BANCO
  // ============================================================
  const handleDeleteBank = (e: React.MouseEvent, bankId: string) => {
    e.stopPropagation();
    requireSecurity(async () => {
      try {
        await bankService.excluir(bankId);
        toast.success('Conta bancaria removida');
        loadBankAccounts();
      } catch (error) {
        console.error(error);
        toast.error('Erro ao excluir conta');
      }
    });
  };

  // ============================================================
  // SETTLE (BAIXA)
  // ============================================================
  const handleTransactionClick = (tr: UnifiedTransaction) => {
    if (tr.status === 'PAID' || tr.status === 'CANCELADO') return;
    setSelectedTransaction(tr);
    setIsSettleModalOpen(true);
  };

  const handleSettleConfirm = async (data: {
    total: number;
    settleDate: string;
    bankId: string;
    applyInterest: boolean;
    discount: number;
  }) => {
    if (!selectedTransaction) return;

    try {
      if (selectedTransaction.type === 'INCOME') {
        await receivableService.receber(selectedTransaction.originalId, {
          valor_recebido: data.total,
          data_recebimento: data.settleDate,
          forma_recebimento: 'TRANSFERENCIA',
          banco_id: data.bankId,
        });
        toast.success('Recebimento confirmado!');
      } else {
        await paymentService.pagar(selectedTransaction.originalId, {
          valor_pago: data.total,
          data_pagamento: data.settleDate,
          forma_pagamento: 'TRANSFERENCIA',
          banco_id: data.bankId,
        });
        toast.success('Pagamento confirmado!');
      }

      setIsSettleModalOpen(false);
      setSelectedTransaction(null);
      loadData();
      loadBankAccounts();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao liquidar titulo');
    }
  };

  // ============================================================
  // CRIAR LANCAMENTO
  // ============================================================
  const handleSaveTransaction = async () => {
    if (!newTransaction.description || !newTransaction.entityId || !newTransaction.amount) {
      toast.error('Preencha todos os campos obrigatorios');
      return;
    }

    const entityName = entities.find(e => e.id === newTransaction.entityId)?.name || '';

    try {
      if (newTransaction.type === 'INCOME') {
        await receivableService.criar({
          numero_titulo: '',
          cliente_id: newTransaction.entityId,
          cliente_nome: entityName,
          valor_original: newTransaction.amount,
          data_emissao: new Date().toISOString().split('T')[0],
          data_vencimento: newTransaction.dueDate,
          status: 'PENDENTE',
          descricao: newTransaction.description,
          centro_custo_id: newTransaction.costCenterId || undefined,
        });
      } else {
        await paymentService.criar({
          fornecedor_id: newTransaction.entityId,
          fornecedor_nome: entityName,
          valor_original: newTransaction.amount,
          data_emissao: new Date().toISOString().split('T')[0],
          data_vencimento: newTransaction.dueDate,
          status: 'PENDENTE',
          descricao: newTransaction.description,
          centro_custo_id: newTransaction.costCenterId || undefined,
        });
      }

      toast.success('Lancamento criado!');
      setIsModalOpen(false);
      setNewTransaction({
        type: 'EXPENSE',
        description: '',
        entityId: '',
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        costCenterId: '',
      });
      loadData();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar lancamento');
    }
  };

  // ============================================================
  // ALTERAR SENHA
  // ============================================================
  const handleChangePassword = async () => {
    if (!settingsAdminPass || !settingsNewAdminPass) {
      toast.error('Preencha ambas as senhas');
      return;
    }

    try {
      const success = await adminSecurityService.changePassword(settingsAdminPass, settingsNewAdminPass);
      if (success) {
        toast.success('Senha alterada com sucesso!');
        setSettingsAdminPass('');
        setSettingsNewAdminPass('');
        setIsSettingsModalOpen(false);
      }
    } catch (error: any) {
      // Fallback legado
      try {
        const { data } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'admin_password')
          .single();

        if (data?.value === settingsAdminPass) {
          await supabase
            .from('app_config')
            .update({ value: settingsNewAdminPass })
            .eq('key', 'admin_password');
          toast.success('Senha alterada com sucesso!');
          setSettingsAdminPass('');
          setSettingsNewAdminPass('');
          setIsSettingsModalOpen(false);
        } else {
          toast.error('Senha atual incorreta');
        }
      } catch {
        toast.error(error?.message || 'Erro ao alterar senha');
      }
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header com Acoes */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Financeiro</h2>
          <p className="text-xs text-slate-500">Contas a Pagar, Receber, Caixa e DRE</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCostCenterModalOpen(true)}
            className="p-2 text-slate-500 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition"
            title="Centros de Custo"
          >
            <Calculator size={18} />
          </button>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 text-slate-500 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition"
            title="Configuracoes"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={() => setIsDREModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition border border-slate-700"
          >
            DRE
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg transition flex items-center gap-2"
          >
            <Plus size={18} /> Novo Lancamento
          </button>
        </div>
      </div>

      {/* DASHBOARD */}
      <FinancialDashboard
        transactions={transactions}
        bankAccounts={bankAccounts}
        stats={stats}
        entities={entities}
        costCenters={costCenters}
        loading={loading}
        onTransactionClick={handleTransactionClick}
        onDelete={handleDelete}
        onDeleteBank={handleDeleteBank}
        onOpenNewTransaction={() => setIsModalOpen(true)}
        onOpenBankModal={() => setIsBankModalOpen(true)}
        onOpenDRE={() => setIsDREModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenCostCenters={() => setIsCostCenterModalOpen(true)}
      />

      {/* SETTLE MODAL */}
      <FinancialSettle
        isOpen={isSettleModalOpen}
        onClose={() => { setIsSettleModalOpen(false); setSelectedTransaction(null); }}
        transaction={selectedTransaction}
        bankAccounts={bankAccounts}
        onConfirm={handleSettleConfirm}
      />

      {/* DRE MODAL */}
      <FinancialDRE
        isOpen={isDREModalOpen}
        onClose={() => setIsDREModalOpen(false)}
      />

      {/* COST CENTERS MODAL */}
      <FinancialCostCenters
        isOpen={isCostCenterModalOpen}
        onClose={() => setIsCostCenterModalOpen(false)}
        costCenters={costCenters}
        onRefresh={loadCostCenters}
        onSecurityCheck={requireSecurity}
      />

      {/* BANK MODAL */}
      <FinancialBanks
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onRefresh={loadBankAccounts}
      />

      {/* ====== NOVO LANCAMENTO MODAL ====== */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Lancamento Financeiro">
        <div className="space-y-4">
          {/* Tipo */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setNewTransaction(prev => ({ ...prev, type: 'INCOME' }))}
              className={`p-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition ${newTransaction.type === 'INCOME'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
            >
              <ArrowUpRight size={18} /> A Receber
            </button>
            <button
              onClick={() => setNewTransaction(prev => ({ ...prev, type: 'EXPENSE' }))}
              className={`p-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition ${newTransaction.type === 'EXPENSE'
                ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
            >
              <ArrowDownLeft size={18} /> A Pagar
            </button>
          </div>

          {/* Descricao */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Descricao</label>
            <input
              value={newTransaction.description}
              onChange={e => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Aluguel, Servico de terraplanagem..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Entidade */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              {newTransaction.type === 'INCOME' ? 'Cliente' : 'Fornecedor'}
            </label>
            <select
              value={newTransaction.entityId}
              onChange={e => setNewTransaction(prev => ({ ...prev, entityId: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="">Selecione...</option>
              {entities.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          {/* Valor e Vencimento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Valor (R$)</label>
              <input
                type="number"
                value={newTransaction.amount}
                onChange={e => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Vencimento</label>
              <input
                type="date"
                value={newTransaction.dueDate}
                onChange={e => setNewTransaction(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Centro de Custo */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Centro de Custo (DRE)</label>
            <select
              value={newTransaction.costCenterId}
              onChange={e => setNewTransaction(prev => ({ ...prev, costCenterId: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="">Nenhum (opcional)</option>
              {costCenters.map(cc => (
                <option key={cc.id} value={cc.id}>{cc.codigo ? `${cc.codigo} - ` : ''}{cc.nome}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveTransaction}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Save size={20} /> Salvar Lancamento
          </button>
        </div>
      </Modal>

      {/* ====== SECURITY MODAL ====== */}
      <Modal isOpen={isSecurityModalOpen} onClose={() => { setIsSecurityModalOpen(false); setPendingSecureAction(null); }} title="Verificacao de Seguranca">
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
            <Lock className="text-amber-500 shrink-0" size={24} />
            <p className="text-sm text-amber-300">Esta acao requer a senha do administrador para continuar.</p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Senha do Administrador</label>
            <input
              type="password"
              value={securityPassword}
              onChange={e => setSecurityPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSecurityConfirm()}
              placeholder="Digite a senha..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
          <button
            onClick={handleSecurityConfirm}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition"
          >
            <Unlock size={18} /> Confirmar
          </button>
        </div>
      </Modal>

      {/* ====== SETTINGS MODAL ====== */}
      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Configuracoes do Financeiro">
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Lock size={16} /> Alterar Senha Mestra</h4>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Senha Atual</label>
              <input
                type="password"
                value={settingsAdminPass}
                onChange={e => setSettingsAdminPass(e.target.value)}
                placeholder="Senha atual..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nova Senha</label>
              <input
                type="password"
                value={settingsNewAdminPass}
                onChange={e => setSettingsNewAdminPass(e.target.value)}
                placeholder="Nova senha..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleChangePassword}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition"
            >
              <CheckCircle size={18} /> Salvar Nova Senha
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Financial;
