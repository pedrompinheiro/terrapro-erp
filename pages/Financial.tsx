import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Filter, Plus, Save, Calculator, CheckCircle, Archive, AlertCircle, Calendar, Landmark, Wallet, CreditCard, Trash2, Lock, Unlock, Settings, Folder, Pencil, Building2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

import { receivableService, ContaReceber } from '../services/receivableService';
import { paymentService, ContaPagar } from '../services/paymentService';
import { bankService, ContaBancaria } from '../services/bankService';
import { filialService, Filial } from '../services/filialService';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Interface unificada para a View
interface UnifiedTransaction {
  id: string;
  originalId: string; // ID real no banco
  type: 'INCOME' | 'EXPENSE';
  description: string;
  entityName: string; // Cliente ou Fornecedor
  entityId: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELADO';
  originalStatus: string;
  costCenterId?: string; // ID do Centro de Custo
  costCenterGroup?: string; // Grupo DRE (Ex: Receita Operacional)
  costCenterName?: string; // Nome do Centro
  documentNumber?: string;
  observacao?: string;
  valorOriginal: number; // Valor sempre positivo (raw do BD)
  filialId?: string;
  filialName?: string;
}


const Financial: React.FC = () => {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<ContaBancaria[]>([]);
  const [loading, setLoading] = useState(true);

  // Filiais
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [selectedFilialId, setSelectedFilialId] = useState<string>('ALL');

  // Edição
  const [editingId, setEditingId] = useState<string | null>(null);

  // Multi-seleção
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false); // New Bank Modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // New Settings Modal

  // Seleção
  const [selectedTransaction, setSelectedTransaction] = useState<UnifiedTransaction | null>(null);

  // Estados de Formulário
  const [entities, setEntities] = useState<{ id: string, name: string }[]>([]);
  const [costCenters, setCostCenters] = useState<{ id: string, nome: string, codigo?: string, tipo?: string, grupo_dre?: string }[]>([]); // New Cost Centers State
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    entityId: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    costCenter: '',
    documentNumber: '',
    observacao: ''
  });

  // Novo Banco State
  const [newBank, setNewBank] = useState({
    banco_nome: '',
    agencia: '',
    conta: '',
    tipo_conta: 'CONTA_CORRENTE',
    saldo_atual: 0,
    padrao: false
  });

  // Senha Admin (Alteração)
  const [changePasswordData, setChangePasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Gestão de Centro de Custos
  const [isCostCenterModalOpen, setIsCostCenterModalOpen] = useState(false);
  const [newCostCenterName, setNewCostCenterName] = useState('');
  const [newCostCenterType, setNewCostCenterType] = useState('DESPESA_FIXA'); // Default

  const handleAddCostCenter = async () => {
    if (!newCostCenterName) {
      toast.error("Digite o nome do centro de custo");
      return;
    }

    // Inferir Grupo DRE baseado no Tipo (Simplificação)
    let grupo = 'Outros';
    if (newCostCenterType === 'RECEITA') grupo = 'Receita Operacional';
    else if (newCostCenterType === 'CUSTO_DIRETO') grupo = 'Custos Diretos (CPV)';
    else if (newCostCenterType === 'DESPESA_FIXA') grupo = 'Despesas Operacionais Fixas';
    else if (newCostCenterType.includes('FINANCEIRA')) grupo = 'Resultado Financeiro';
    else if (newCostCenterType === 'INVESTIMENTO') grupo = 'CAPEX / Imobilizado';

    try {
      const { error } = await supabase.from('centros_custo').insert({
        nome: newCostCenterName,
        tipo: newCostCenterType,
        grupo_dre: grupo,
        ativo: true,
        empresa_cnpj: '00.000.000/0001-91',
        codigo: 'MANUAL' // Indica que foi criado manualmente
      });

      if (error) throw error;
      toast.success("Centro de Custo criado!");
      setNewCostCenterName('');
      loadCostCenters();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar centro de custo");
    }
  };

  // Filtros da Tabela
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

  // DRE REPORT LOGIC
  const [isDREModalOpen, setIsDREModalOpen] = useState(false);
  const [dreMonth, setDreMonth] = useState(new Date().toISOString().slice(0, 7));

  const dreData = React.useMemo(() => {
    const [year, month] = dreMonth.split('-').map(Number);
    const filtered = transactions.filter(t => {
      const d = new Date(t.dueDate);
      // Filtra pelo mês de competência (Vencimento como proxy, idealmente Data Emissão)
      return d.getFullYear() === year && d.getMonth() + 1 === month && t.status !== 'CANCELADO';
    });

    // Totais
    let receitaBruta = 0;
    let custosDiretos = 0;
    let despesasFixas = 0;
    let resultadoFinanceiro = 0;

    // Detalhes para drill-down
    const details = {
      receitas: [] as any[],
      custos: [] as any[],
      despesas: [] as any[]
    };

    filtered.forEach(t => {
      if (t.type === 'INCOME') {
        if (t.costCenterGroup?.includes('Receita')) {
          receitaBruta += t.amount;
          // Agrupar por sub-centro
          const existing = details.receitas.find(d => d.nome === t.costCenterName);
          if (existing) existing.valor += t.amount;
          else details.receitas.push({ nome: t.costCenterName || 'Outros', valor: t.amount });
        } else if (t.costCenterGroup?.includes('Financeiro')) {
          resultadoFinanceiro += t.amount;
        }
      } else {
        // Expense
        if (t.costCenterGroup?.includes('Custos Diretos') || t.costCenterGroup?.includes('CPV')) {
          custosDiretos += t.amount; // Valor negativo
          const existing = details.custos.find(d => d.nome === t.costCenterName);
          if (existing) existing.valor += t.amount;
          else details.custos.push({ nome: t.costCenterName || 'Outros', valor: t.amount });
        } else if (t.costCenterGroup?.includes('Despesas')) {
          despesasFixas += t.amount;
          const existing = details.despesas.find(d => d.nome === t.costCenterName);
          if (existing) existing.valor += t.amount;
          else details.despesas.push({ nome: t.costCenterName || 'Outros', valor: t.amount });
        } else if (t.costCenterGroup?.includes('Financeiro')) {
          resultadoFinanceiro += t.amount;
        }
      }
    });

    return { receitaBruta, custosDiretos, despesasFixas, resultadoFinanceiro, details };
  }, [transactions, dreMonth]);

  const handleDeleteCostCenter = (id: string, name: string) => {
    handleSecurityCheck(async () => {
      try {
        // Validar se tem uso? Por enquanto soft delete
        const { error } = await supabase
          .from('centros_custo')
          .update({ ativo: false })
          .eq('id', id);

        if (error) throw error;
        toast.success(`Centro de Custo "${name}" desativado.`);
        loadCostCenters();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao remover centro de custo");
      }
    });
  };

  // Estados de Baixa (Settlement)
  const [settleDate, setSettleDate] = useState(new Date().toISOString().split('T')[0]);
  const [settlePaymentMethod, setSettlePaymentMethod] = useState('PIX');
  const [selectedBankId, setSelectedBankId] = useState<string>(''); // Selected Bank for Settlement
  const [applyInterest, setApplyInterest] = useState(true);
  const [settlementValues, setSettlementValues] = useState({
    original: 0,
    interest: 0,
    fine: 0,
    discount: 0,
    total: 0,
    daysOverdue: 0
  });

  // Estatísticas
  const [stats, setStats] = useState({
    balance: 0,
    income30d: 0,
    expense30d: 0,
    totalAvailable: 0 // Total in banks
  });

  // Security (Admin Password)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [securityAction, setSecurityAction] = useState<(() => Promise<void>) | null>(null);

  const handleSecurityCheck = (action: () => Promise<void>) => {
    setSecurityAction(() => action);
    setAdminPassword('');
    setIsSecurityModalOpen(true);
  };

  const confirmSecurityAction = async () => {
    try {
      // Validar senha com o banco
      const { data, error } = await supabase
        .from('app_config')
        .select('valor')
        .eq('chave', 'admin_password')
        .single();

      if (!data?.valor) {
        toast.error("Senha mestra não configurada. Vá em Configurações para definir.", { icon: '⚙️' });
        return;
      }

      if (adminPassword === data.valor) {
        if (securityAction) {
          await securityAction();
        }
        setIsSecurityModalOpen(false);
        setAdminPassword('');
        setSecurityAction(null);
      } else {
        toast.error("Senha de administrador incorreta!", { icon: '🔒' });
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao validar senha");
    }
  };

  const handleChangePassword = async () => {
    if (!changePasswordData.current || !changePasswordData.new || !changePasswordData.confirm) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (changePasswordData.new !== changePasswordData.confirm) {
      toast.error("A nova senha e a confirmação não conferem");
      return;
    }

    try {
      // Validar senha atual
      const { data } = await supabase.from('app_config').select('valor').eq('chave', 'admin_password').single();
      const currentReal = data?.valor;
      if (!currentReal) {
        toast.error("Senha mestra não configurada. Defina uma senha primeiro.");
        return;
      }

      if (changePasswordData.current !== currentReal) {
        toast.error("Senha atual incorreta");
        return;
      }

      // Salvar nova senha
      const { error } = await supabase.from('app_config').upsert({
        chave: 'admin_password',
        valor: changePasswordData.new,
        descricao: 'Senha Mestra Financeiro'
      });

      if (error) throw error;
      toast.success("Senha de administrador alterada com sucesso!");
      setIsSettingsModalOpen(false);
      setChangePasswordData({ current: '', new: '', confirm: '' });

    } catch (err) {
      console.error(err);
      toast.error("Erro ao alterar senha");
    }
  };

  useEffect(() => {
    loadFiliais();
    loadEntities();
    loadCostCenters();
  }, []);

  // Recarregar dados financeiros quando filial muda
  useEffect(() => {
    loadData();
    loadBankAccounts();
    setSelectedIds(new Set());
  }, [selectedFilialId]);

  const loadFiliais = async () => {
    try {
      const data = await filialService.listar();
      setFiliais(data);
    } catch { /* silencioso se companies não tiver os campos ainda */ }
  };

  const loadEntities = async () => {
    const allEntities: { id: string, name: string }[] = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
      const { data } = await supabase
        .from('entities')
        .select('id, name')
        .order('name')
        .range(page * pageSize, (page + 1) * pageSize - 1);
      if (!data || data.length === 0) break;
      allEntities.push(...data);
      if (data.length < pageSize) break;
      page++;
    }
    setEntities(allEntities);
  };

  const loadCostCenters = async () => {
    try {
      // Tentar buscar com a nova estrutura, fallback para ordenação por nome se falhar (ex: migração pendente)
      const { data, error } = await supabase
        .from('centros_custo')
        .select('id, nome, codigo, tipo, grupo_dre')
        .eq('ativo', true)
        .order('codigo', { ascending: true }); // Preferencialmente por código (1.01, 2.01...)

      if (!error && data) {
        setCostCenters(data);
      } else {
        // Fallback se a coluna codigo não existir ainda
        const { data: simpleData } = await supabase.from('centros_custo').select('id, nome').eq('ativo', true).order('nome');
        if (simpleData) setCostCenters(simpleData);
      }
    } catch (error) {
      console.error("Erro ao carregar centros de custo:", error);
    }
  };

  // ... loadBankAccounts ...
  const loadBankAccounts = async () => {
    try {
      const filialFilter = selectedFilialId !== 'ALL' ? selectedFilialId : undefined;
      const accounts = await bankService.listar(filialFilter);
      setBankAccounts(accounts || []);
      // Calculate total available based on accounts
      const total = accounts?.reduce((acc, curr) => acc + (curr.saldo_atual || 0), 0) || 0;
      setStats(prev => ({ ...prev, totalAvailable: total }));

      // Set default bank if available
      if (accounts && accounts.length > 0) {
        const defaultAcc = accounts.find(a => a.padrao) || accounts[0];
        setSelectedBankId(defaultAcc.id);
      }
    } catch (error) {
      console.error("Erro ao carregar contas bancárias:", error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const filialFilter = selectedFilialId !== 'ALL' ? selectedFilialId : undefined;

      // 1. Buscar Contas a Receber
      const receivables = await receivableService.listar({ filial_id: filialFilter }) || [];

      // 2. Buscar Contas a Pagar
      const payables = await paymentService.listar({ filial_id: filialFilter }) || [];

      // 3. Unificar dados
      const unified: UnifiedTransaction[] = [];

      // Mapear Receitas
      receivables.forEach((r: any) => {
        let status: UnifiedTransaction['status'] = 'PENDING';
        if (r.status === 'RECEBIDO') status = 'PAID';
        else if (r.status === 'CANCELADO') status = 'CANCELADO';
        else if (new Date(r.data_vencimento) < new Date() && r.status !== 'RECEBIDO') status = 'OVERDUE';

        const cc = costCenters.find(c => c.id === r.centro_custo_id);

        unified.push({
          id: `REC-${r.id}`,
          originalId: r.id,
          type: 'INCOME',
          description: r.descricao,
          entityName: r.cliente?.name || 'Cliente Desconhecido',
          entityId: r.cliente_id,
          amount: r.valor_saldo || r.valor_original,
          valorOriginal: r.valor_original,
          dueDate: r.data_vencimento,
          status,
          originalStatus: r.status,
          costCenterId: r.centro_custo_id,
          costCenterGroup: cc?.grupo_dre || 'Outros',
          costCenterName: cc?.nome,
          documentNumber: r.numero_documento,
          observacao: r.observacao,
          filialId: r.filial_id,
          filialName: r.filial?.short_name
        });
      });

      // Mapear Despesas
      payables.forEach((p: any) => {
        let status: UnifiedTransaction['status'] = 'PENDING';
        if (p.status === 'PAGO') status = 'PAID';
        else if (p.status === 'CANCELADO') status = 'CANCELADO';
        else if (new Date(p.data_vencimento) < new Date() && p.status !== 'PAGO') status = 'OVERDUE';

        const cc = costCenters.find(c => c.id === p.centro_custo_id);

        unified.push({
          id: `PAY-${p.id}`,
          originalId: p.id,
          type: 'EXPENSE',
          description: p.descricao,
          entityName: p.fornecedor?.name || 'Fornecedor Desconhecido',
          entityId: p.fornecedor_id,
          amount: -(p.valor_saldo || p.valor_original),
          valorOriginal: p.valor_original,
          dueDate: p.data_vencimento,
          status,
          originalStatus: p.status,
          costCenterId: p.centro_custo_id,
          costCenterGroup: cc?.grupo_dre || 'Outros',
          costCenterName: cc?.nome,
          documentNumber: p.numero_documento,
          observacao: p.observacao,
          filialId: p.filial_id,
          filialName: p.filial?.short_name
        });
      });

      // Ordenar por Vencimento
      unified.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      setTransactions(unified);

      // Calcular Stats Básicos (Previsão)
      const income = unified.filter(t => t.type === 'INCOME' && t.status !== 'CANCELADO' && t.status !== 'PAID').reduce((acc, t) => acc + t.amount, 0);
      const expense = unified.filter(t => t.type === 'EXPENSE' && t.status !== 'CANCELADO' && t.status !== 'PAID').reduce((acc, t) => acc + Math.abs(t.amount), 0);

      setStats(prev => ({
        ...prev,
        balance: income - expense, // Saldo Previsão
        income30d: income,
        expense30d: expense
      }));

    } catch (error) {
      console.error("Erro ao carregar financeiro:", error);
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNewTransaction({
      description: '',
      entityId: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      type: 'INCOME',
      costCenter: '',
      documentNumber: '',
      observacao: ''
    });
  };

  const openEditModal = (e: React.MouseEvent, tr: UnifiedTransaction) => {
    e.stopPropagation();
    // Garantir que a entidade esteja na lista (pode não ter carregado ainda na paginação)
    if (tr.entityId && !entities.find(ent => ent.id === tr.entityId)) {
      setEntities(prev => [...prev, { id: tr.entityId, name: tr.entityName }].sort((a, b) => a.name.localeCompare(b.name)));
    }
    setEditingId(tr.originalId);
    setNewTransaction({
      description: tr.description,
      entityId: tr.entityId,
      amount: tr.valorOriginal,
      dueDate: tr.dueDate,
      type: tr.type,
      costCenter: tr.costCenterId || '',
      documentNumber: tr.documentNumber || '',
      observacao: tr.observacao || ''
    });
    setIsModalOpen(true);
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.entityId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const entityName = entities.find(e => e.id === newTransaction.entityId)?.name || '';
    const filialId = selectedFilialId !== 'ALL' ? selectedFilialId : (filiais[0]?.id || undefined);

    try {
      if (editingId) {
        // UPDATE
        if (newTransaction.type === 'INCOME') {
          await receivableService.atualizar(editingId, {
            descricao: newTransaction.description,
            cliente_id: newTransaction.entityId,
            cliente_nome: entityName,
            valor_original: Number(newTransaction.amount),
            data_vencimento: newTransaction.dueDate,
            numero_documento: newTransaction.documentNumber,
            centro_custo_id: newTransaction.costCenter || undefined,
            observacao: newTransaction.observacao || undefined
          });
        } else {
          await paymentService.atualizar(editingId, {
            descricao: newTransaction.description,
            fornecedor_id: newTransaction.entityId,
            fornecedor_nome: entityName,
            valor_original: Number(newTransaction.amount),
            data_vencimento: newTransaction.dueDate,
            numero_documento: newTransaction.documentNumber,
            centro_custo_id: newTransaction.costCenter || undefined,
            observacao: newTransaction.observacao || undefined
          });
        }
        toast.success("Lançamento atualizado com sucesso!");
      } else {
        // CREATE
        if (newTransaction.type === 'INCOME') {
          await receivableService.criar({
            descricao: newTransaction.description,
            cliente_id: newTransaction.entityId,
            cliente_nome: entityName,
            valor_original: Number(newTransaction.amount),
            data_emissao: new Date().toISOString().split('T')[0],
            data_vencimento: newTransaction.dueDate,
            status: 'PENDENTE',
            numero_titulo: '',
            numero_documento: newTransaction.documentNumber,
            centro_custo_id: newTransaction.costCenter,
            filial_id: filialId
          } as ContaReceber);
        } else {
          await paymentService.criar({
            descricao: newTransaction.description,
            fornecedor_id: newTransaction.entityId,
            fornecedor_nome: entityName,
            valor_original: Number(newTransaction.amount),
            data_emissao: new Date().toISOString().split('T')[0],
            data_vencimento: newTransaction.dueDate,
            status: 'PENDENTE',
            numero_titulo: '',
            numero_documento: newTransaction.documentNumber,
            centro_custo_id: newTransaction.costCenter,
            filial_id: filialId
          } as ContaPagar);
        }
        toast.success("Transação criada com sucesso!");
      }

      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error(error);
      toast.error(editingId ? "Erro ao atualizar lançamento" : "Erro ao salvar transação");
    }
  };

  const handleTransactionClick = (tr: UnifiedTransaction) => {
    setSelectedTransaction(tr);
    if (tr.status !== 'PAID' && tr.status !== 'CANCELADO') {
      calculateSettlement(tr);
      setIsSettleModalOpen(true);
    }
  };

  const handleSaveBank = async () => {
    if (!newBank.banco_nome || !newBank.agencia || !newBank.conta) {
      toast.error("Preencha os dados obrigatórios do banco");
      return;
    }

    try {
      await bankService.criar({
        ...newBank,
        ativa: true,
        banco_codigo: '000' // Default ou adicionar input
      });
      toast.success("Conta bancária adicionada!");
      setIsBankModalOpen(false);
      loadBankAccounts();
      setNewBank({
        banco_nome: '',
        agencia: '',
        conta: '',
        tipo_conta: 'CONTA_CORRENTE',
        saldo_atual: 0,
        padrao: false
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar conta bancária");
    }
  };

  const handleDeleteBank = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente desativar esta conta bancária?')) return;

    handleSecurityCheck(async () => {
      try {
        await bankService.excluir(id);
        toast.success("Conta bancária removida!");
        loadBankAccounts();
      } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir conta");
      }
    });
  };

  const calculateSettlement = (tr: UnifiedTransaction) => {
    const original = Math.abs(tr.amount);
    const dueDate = new Date(tr.dueDate);
    const today = new Date();

    // Cálculo Real de Dias em Atraso
    const diffTime = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let interest = 0;
    let fine = 0;

    if (daysOverdue > 0 && tr.type === 'INCOME') {
      // Regra de Negócio: 2% Multa + 1% Juros a.m (pro rata)
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

  // Recalcular quando toggle de juros muda
  useEffect(() => {
    if (isSettleModalOpen && selectedTransaction) {
      const base = settlementValues.original;
      if (applyInterest) {
        // Recalcular (já tinha os valores salvos no state? ou recalcular do zero?)
        // Simplificando: vamos recalcular sempre baseados no daysOverdue atual salvo
        // Mas a lógica completa estava no calculateSettlement.
        // Vamos apenas somar ou zerar juros/multa visualmente
        const currentInterest = settlementValues.daysOverdue > 0 && selectedTransaction.type === 'INCOME'
          ? (base * 0.01 / 30 * settlementValues.daysOverdue) : 0;
        const currentFine = settlementValues.daysOverdue > 0 && selectedTransaction.type === 'INCOME'
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

  const handleSettleConfirm = async () => {
    if (!selectedTransaction) return;
    if (!selectedBankId) {
      toast.error("Selecione uma conta bancária/caixa para movimentação");
      return;
    }

    try {
      if (selectedTransaction.type === 'INCOME') {
        await receivableService.receber(selectedTransaction.originalId, {
          valor_recebido: settlementValues.total,
          data_recebimento: settleDate,
          forma_recebimento: settlePaymentMethod,
          banco_id: selectedBankId,
          valor_desconto: settlementValues.discount,
          observacao: applyInterest ? `Com Juros/Multa` : ''
        });
      } else {
        await paymentService.pagar(selectedTransaction.originalId, {
          valor_pago: settlementValues.total,
          data_pagamento: settleDate,
          forma_pagamento: settlePaymentMethod,
          banco_id: selectedBankId,
          observacao: 'Pagamento via ERP'
        });
      }

      toast.success(selectedTransaction.type === 'INCOME' ? "Recebimento confirmado!" : "Pagamento realizado!");
      setIsSettleModalOpen(false);
      loadData();
      loadBankAccounts(); // Refresh balances
    } catch (error) {
      console.error(error);
      toast.error("Erro ao baixar título");
    }
  };

  const handleDelete = (e: React.MouseEvent, tr: UnifiedTransaction) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente excluir/cancelar este lançamento?')) return;

    handleSecurityCheck(async () => {
      try {
        if (tr.type === 'INCOME') {
          const { error } = await supabase.from('contas_receber').delete().eq('id', tr.originalId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('contas_pagar').delete().eq('id', tr.originalId);
          if (error) throw error;
        }
        toast.success("Lançamento removido permanentemente");
        loadData();
      } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir lançamento");
      }
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Deseja realmente excluir ${selectedIds.size} lançamento(s)?`)) return;

    handleSecurityCheck(async () => {
      const selected = transactions.filter(t => selectedIds.has(t.id));
      const crIds = selected.filter(t => t.type === 'INCOME').map(t => t.originalId);
      const cpIds = selected.filter(t => t.type === 'EXPENSE').map(t => t.originalId);
      let errors = 0;

      if (crIds.length > 0) {
        const { error } = await supabase.from('contas_receber').delete().in('id', crIds);
        if (error) errors++;
      }
      if (cpIds.length > 0) {
        const { error } = await supabase.from('contas_pagar').delete().in('id', cpIds);
        if (error) errors++;
      }

      if (errors === 0) {
        toast.success(`${selectedIds.size} lançamento(s) excluído(s)`);
      } else {
        toast.error("Alguns lançamentos não puderam ser excluídos");
      }
      setSelectedIds(new Set());
      loadData();
    });
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <DollarSign className="text-emerald-500" size={32} />
            Financeiro Integrado
          </h2>
          <p className="text-slate-500 mt-1">Fluxo de Caixa, Tesouraria e Conciliação.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700 hover:bg-slate-700 transition"
            title="Configurações / Senha Admin"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => setIsDREModalOpen(true)}
            className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700 hover:bg-slate-700 transition flex items-center gap-2"
          >
            <Calendar size={16} /> DRE Gerencial
          </button>
          <button
            onClick={() => toast('Conciliação bancária em desenvolvimento', { icon: '🏗️' })}
            className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700 hover:bg-slate-700 transition"
          >
            Conciliação
          </button>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
          >
            <Plus size={18} /> Novo Lançamento
          </button>
        </div>
      </div>



      {/* SELETOR DE FILIAL */}
      {filiais.length > 0 && (
        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-2xl p-3 mb-4">
          <Building2 className="text-blue-400 shrink-0" size={20} />
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest shrink-0">Filial:</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedFilialId('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedFilialId === 'ALL'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600'
              }`}
            >
              Todas
            </button>
            {filiais.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilialId(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedFilialId === f.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600'
                }`}
              >
                {f.short_name || f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BANK ACCOUNTS CAROUSEL */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Caixa e Bancos</h3>
        <button
          onClick={() => setIsBankModalOpen(true)}
          className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
        >
          <CreditCard size={14} /> Gerenciar Contas
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {bankAccounts.length === 0 ? (
          <div className="col-span-4 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-6 text-center text-slate-500">
            Nenhuma conta bancária cadastrada.
          </div>
        ) : (
          bankAccounts.map(acc => (
            <div key={acc.id} className={`group relative p-5 rounded-2xl border ${acc.padrao ? 'bg-slate-800 border-emerald-500/50 shadow-emerald-900/10 shadow-lg' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="bg-slate-950 p-2 rounded-lg text-slate-300">
                  {acc.tipo_conta === 'CAIXA_FISICO' ? <Wallet size={20} /> : <Landmark size={20} />}
                </div>
                {acc.padrao && <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Padrão</span>}
              </div>
              <h4 className="font-bold text-slate-300 text-sm truncate">{acc.banco_nome}</h4>
              <p className="text-xs text-slate-500 mb-2 truncate">Ag: {acc.agencia} • CC: {acc.conta}</p>
              <div className="text-xl font-black text-white tracking-tight">
                R$ {acc.saldo_atual?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>

              {/* Delete Button (Hover) */}
              <button
                onClick={(e) => handleDeleteBank(e, acc.id)}
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
          title="Previsão de Recebimento"
          value={`R$ ${stats.income30d.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend="A receber"
          trendUp={true}
          icon={<ArrowUpRight size={24} />}
          iconBg="bg-emerald-600"
        />
        <StatCard
          title="Previsão de Pagamento"
          value={`R$ ${stats.expense30d.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend="A pagar"
          trendUp={false}
          icon={<ArrowDownLeft size={24} />}
          iconBg="bg-rose-600"
        />
      </div>

      {/* Tabela de Transações */}
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

          {/* Painel de Filtros */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800 animate-in slide-in-from-top-2">
              <input
                placeholder="Buscar por descrição, cliente..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
              />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
              >
                <option value="ALL">Todas as Movimentações</option>
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

        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 mb-2">
            <span className="text-sm text-blue-400 font-bold">
              {selectedIds.size} lançamento{selectedIds.size > 1 ? 's' : ''} selecionado{selectedIds.size > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Limpar Seleção
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={14} />
                Excluir Selecionados
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                <th className="px-3 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredTransactions.length > 0 && selectedIds.size === filteredTransactions.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Descrição / Entidade</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Nenhuma transação encontrada.</td>
                </tr>
              ) : (
                filteredTransactions.map((tr) => (
                  <tr
                    key={tr.id}
                    onClick={() => handleTransactionClick(tr)}
                    className={`hover:bg-slate-800/50 transition-colors cursor-pointer group ${selectedIds.has(tr.id) ? 'bg-blue-500/5' : ''}`}
                  >
                    <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(tr.id)}
                        onChange={() => toggleSelect(tr.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-blue-500 cursor-pointer"
                      />
                    </td>
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
                        <div className="font-bold text-white mb-0.5">{tr.description}</div>
                        {tr.costCenterName && (
                          <span className="text-[9px] w-fit px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700 truncate max-w-[150px] mb-1">
                            {tr.costCenterName}
                          </span>
                        )}
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
                      <div className="flex items-center justify-center gap-1">
                        {tr.status !== 'PAID' && tr.status !== 'CANCELADO' && (
                          <button
                            onClick={(e) => openEditModal(e, tr)}
                            className="p-2 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                            title="Editar Lançamento"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, tr)}
                          className="p-2 rounded-lg text-slate-600 hover:text-red-500 hover:bg-slate-800 transition-colors"
                          title="Excluir Lançamento"
                        >
                          <Archive size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: GERENCIAR CONTAS BANCÁRIAS */}
      <Modal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} title="Nova Conta Bancária">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome do Banco / Caixa</label>
            <input
              value={newBank.banco_nome}
              onChange={e => setNewBank(prev => ({ ...prev, banco_nome: e.target.value }))}
              placeholder="Ex: Banco do Brasil, Nubank, Caixa Pequeno"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Agência</label>
              <input
                value={newBank.agencia}
                onChange={e => setNewBank(prev => ({ ...prev, agencia: e.target.value }))}
                placeholder="0000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Conta</label>
              <input
                value={newBank.conta}
                onChange={e => setNewBank(prev => ({ ...prev, conta: e.target.value }))}
                placeholder="00000-0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tipo</label>
              <select
                value={newBank.tipo_conta}
                onChange={e => setNewBank(prev => ({ ...prev, tipo_conta: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="CONTA_CORRENTE">Conta Corrente</option>
                <option value="POUPANCA">Poupança</option>
                <option value="CAIXA_FISICO">Caixa Físico</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Saldo Inicial (R$)</label>
              <input
                type="number"
                value={newBank.saldo_atual}
                onChange={e => setNewBank(prev => ({ ...prev, saldo_atual: parseFloat(e.target.value) }))}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={newBank.padrao}
              onChange={e => setNewBank(prev => ({ ...prev, padrao: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
            <label className="text-xs text-slate-300">Definir como conta padrão</label>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveBank}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Save size={20} /> Salvar Conta
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: NOVO LANÇAMENTO */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={editingId ? "Editar Lançamento Financeiro" : "Novo Lançamento Financeiro"}>
        <div className="space-y-4">
          <div className={`flex gap-4 p-1 bg-slate-900 rounded-xl border border-slate-800 ${editingId ? 'opacity-60' : ''}`}>
            <button
              onClick={() => !editingId && setNewTransaction(prev => ({ ...prev, type: 'INCOME' }))}
              disabled={!!editingId}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${newTransaction.type === 'INCOME' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'} ${editingId ? 'cursor-not-allowed' : ''}`}
            >
              Receita (Entrada)
            </button>
            <button
              onClick={() => !editingId && setNewTransaction(prev => ({ ...prev, type: 'EXPENSE' }))}
              disabled={!!editingId}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${newTransaction.type === 'EXPENSE' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'} ${editingId ? 'cursor-not-allowed' : ''}`}
            >
              Despesa (Saída)
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Descrição</label>
            <input
              value={newTransaction.description}
              onChange={e => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Pagamento Fornecedor X"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nº Documento / Nota Fiscal</label>
            <input
              value={newTransaction.documentNumber}
              onChange={e => setNewTransaction(prev => ({ ...prev, documentNumber: e.target.value }))}
              placeholder="Ex: NF-e 12345, Contrato 001"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Valor (R$)</label>
              <input
                type="number"
                value={newTransaction.amount || ''}
                onChange={e => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 font-mono"
                placeholder="0.00"
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

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              {newTransaction.type === 'INCOME' ? 'Cliente / Pagador' : 'Fornecedor / Beneficiário'}
            </label>
            <select
              value={newTransaction.entityId}
              onChange={e => setNewTransaction(prev => ({ ...prev, entityId: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="">Selecione...</option>
              {entities.map(ent => (
                <option key={ent.id} value={ent.id}>{ent.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Centro de Custo</label>
            <div className="relative">
              <select
                value={newTransaction.costCenter}
                onChange={e => setNewTransaction(prev => ({ ...prev, costCenter: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 appearance-none"
                style={{ backgroundImage: 'none' }} // Remove default arrow to custom style implies
              >
                <option value="">Selecione o Centro de Custo...</option>

                {/* Lógica de Agrupamento e Filtragem */}
                {Object.entries(
                  costCenters
                    .filter(cc => {
                      // Filtro Inteligente: Receita vs Despesa
                      if (newTransaction.type === 'INCOME') {
                        return cc.tipo === 'RECEITA' || cc.tipo === 'RECEITA_FINANCEIRA';
                      } else {
                        return cc.tipo !== 'RECEITA' && cc.tipo !== 'RECEITA_FINANCEIRA';
                      }
                    })
                    .reduce((groups, cc) => {
                      // Agrupamento por Grupo DRE
                      const group = cc.grupo_dre || 'Outros';
                      if (!groups[group]) groups[group] = [];
                      groups[group].push(cc);
                      return groups;
                    }, {} as Record<string, typeof costCenters>)
                ).map(([groupName, items]) => (
                  <optgroup key={groupName} label={
                    // Adicionar Emojis para facilitar leitura visual
                    groupName.includes('Receita') ? `💰 ${groupName}` :
                      groupName.includes('Custos Diretos') ? `🚜 ${groupName}` :
                        groupName.includes('Despesas') ? `🏢 ${groupName}` :
                          groupName.includes('Financeiro') ? `📉 ${groupName}` :
                            groupName.includes('CAPEX') ? `🏗️ ${groupName}` :
                              groupName
                  } className="font-bold text-slate-300 bg-slate-900">
                    {items.map(cc => (
                      <option key={cc.id} value={cc.id} className="text-slate-100 bg-slate-950 px-4 py-2">
                        {cc.codigo ? `${cc.codigo} • ${cc.nome.replace(groupName.includes('Receita') ? 'Receita – ' : '', '').replace(groupName.includes('Custos Diretos') ? ' – ' : 'XXX', ' – ')}` : cc.nome}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                <Folder size={16} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Observação</label>
            <textarea
              value={newTransaction.observacao}
              onChange={e => setNewTransaction(prev => ({ ...prev, observacao: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleAddTransaction}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 ${newTransaction.type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}`}
            >
              <Save size={20} /> {editingId ? 'Salvar Alterações' : 'Salvar Lançamento'}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: BAIXA / SETTLEMENT - COM SELEÇÃO DE BANCO */}
      <Modal isOpen={isSettleModalOpen} onClose={() => setIsSettleModalOpen(false)} title="Baixar / Liquidar Título">
        {selectedTransaction && (
          <div className="space-y-6">

            {/* Warning Card se Atrasado */}
            {settlementValues.daysOverdue > 0 && selectedTransaction.type === 'INCOME' && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-rose-500 p-2 rounded-full text-white"><AlertCircle size={20} /></div>
                <div>
                  <h4 className="font-bold text-rose-400 text-sm">Título em Atraso: {settlementValues.daysOverdue} dias</h4>
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
                <div className="text-sm font-mono text-slate-300">{new Date(selectedTransaction.dueDate).toLocaleDateString('pt-BR')}</div>
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

            {/* SELEÇÃO DE CONTA BANCÁRIA (NOVO) */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Conta de Movimentação</label>
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

            {/* Forma de Pagamento */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Forma de Pagamento</label>
              <select
                value={settlePaymentMethod}
                onChange={e => setSettlePaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="PIX">PIX / Transferência</option>
                <option value="Boleto">Boleto</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cheque">Cheque</option>
                <option value="Cartao Debito">Cartão Débito</option>
                <option value="Cartao Credito">Cartão Crédito</option>
                <option value="Deposito">Depósito</option>
              </select>
            </div>

            {/* Total Final */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-end">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Total a {selectedTransaction.type === 'INCOME' ? 'Receber' : 'Pagar'}</label>
                <div className={`text-3xl font-black tracking-tighter ${selectedTransaction.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
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
                <button onClick={handleSettleConfirm} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition shadow-lg">
                  Confirmar Baixa
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: SECURITY CHALLENGE */}
      <Modal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} title="Confirmação de Segurança">
        <div className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-rose-500 mb-2 border border-slate-800">
            <Lock size={32} />
          </div>
          <h3 className="text-white font-bold text-lg">Senha do Administrador</h3>
          <p className="text-slate-400 text-sm">Esta ação é destrutiva e requer autorização superior.</p>

          <input
            type="password"
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            placeholder="Digite a senha..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 text-center tracking-widest"
            autoFocus
          />

          <button
            onClick={confirmSecurityAction}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Unlock size={20} /> Desbloquear e Confirmar
          </button>
        </div>
      </Modal>

      {/* MODAL: SETTINGS (ADMIN PASSWORD) */}
      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Configurações de Segurança">
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 mb-4">
            <div className="bg-slate-800 p-3 rounded-full text-slate-400"><Lock size={24} /></div>
            <div>
              <h4 className="font-bold text-white text-sm">Senha do Administrador</h4>
              <p className="text-xs text-slate-500">Defina a senha exigida para ações sensíveis.</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Senha Atual</label>
            <input
              type="password"
              value={changePasswordData.current}
              onChange={e => setChangePasswordData(prev => ({ ...prev, current: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nova Senha</label>
              <input
                type="password"
                value={changePasswordData.new}
                onChange={e => setChangePasswordData(prev => ({ ...prev, new: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Confirmar</label>
              <input
                type="password"
                value={changePasswordData.confirm}
                onChange={e => setChangePasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleChangePassword}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Save size={20} /> Atualizar Senha
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: COST CENTERS */}
      {/* MODAL: COST CENTERS */}
      <Modal isOpen={isCostCenterModalOpen} onClose={() => setIsCostCenterModalOpen(false)} title="Gerenciar Centros de Custo (Plano DRE)">
        <div className="space-y-6">

          {/* Aviso */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 text-blue-400 text-sm">
            <AlertCircle size={20} className="shrink-0" />
            <p>O plano de contas DRE padrão foi carregado. Você pode adicionar novos sub-centros, mas evite remover os principais para não quebrar relatórios.</p>
          </div>

          {/* New Cost Center Form */}
          <div className="flex gap-2 items-end">
            <div className="w-1/3">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tipo</label>
              <select
                value={newCostCenterType}
                onChange={e => setNewCostCenterType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-blue-500"
              >
                <option value="RECEITA">💰 Receita</option>
                <option value="CUSTO_DIRETO">🚜 Custo Direto (CPV)</option>
                <option value="DESPESA_FIXA">🏢 Despesa Fixa</option>
                <option value="INVESTIMENTO">🏗️ CAPEX / Investimento</option>
                <option value="DESPESA_FINANCEIRA">📉 Financeiro</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome</label>
              <input
                value={newCostCenterName}
                onChange={e => setNewCostCenterName(e.target.value)}
                placeholder="Ex: Obra Shopping..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleAddCostCenter}
              className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl shadow-lg transition"
            >
              <Plus size={24} />
            </button>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 sticky top-0 bg-slate-900 py-2">Estrutura DRE</h4>
            {costCenters.length === 0 ? (
              <p className="text-slate-500 text-center py-4 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">Carregando plano de contas...</p>
            ) : (
              costCenters.map(cc => (
                <div key={cc.id} className="flex justify-between items-center bg-slate-950 border border-slate-800 p-3 rounded-xl group hover:border-slate-700 transition">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-lg shrink-0 ${cc.tipo === 'RECEITA' ? 'bg-emerald-500/10 text-emerald-500' :
                      cc.tipo?.includes('CUSTO') ? 'bg-amber-500/10 text-amber-500' :
                        'bg-rose-500/10 text-rose-500'
                      }`}>
                      <Folder size={16} />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-slate-300 text-sm truncate">
                        {cc.codigo ? <span className="text-slate-500 mr-2 font-mono">{cc.codigo}</span> : null}
                        {cc.nome}
                      </h5>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate">
                        {cc.grupo_dre || cc.tipo || 'Geral'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCostCenter(cc.id, cc.nome)}
                    className="text-slate-600 hover:text-rose-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ml-2"
                    title="Excluir (Requer Senha Admin)"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL: RELATÓRIO DRE */}
      <Modal isOpen={isDREModalOpen} onClose={() => setIsDREModalOpen(false)} title={`DRE Gerencial — ${selectedFilialId === 'ALL' ? 'Consolidado' : filiais.find(f => f.id === selectedFilialId)?.short_name || 'Todas'}`}>
        <div className="space-y-6">
          {/* Filtros */}
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-4">
              <Calendar className="text-slate-500" size={20} />
              <input
                type="month"
                value={dreMonth}
                onChange={(e) => setDreMonth(e.target.value)}
                className="bg-slate-950 text-white border border-slate-800 rounded-lg px-3 py-2 outline-none focus:border-blue-500 cursor-pointer"
              />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase">Regime de Competência</p>
              <p className="text-sm font-bold text-white">Consolidado</p>
            </div>
          </div>

          {/* Tabela DRE */}
          <div className="border border-slate-800 rounded-xl overflow-hidden max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-800">
                {/* RECEITA BRUTA */}
                <tr className="bg-slate-900 sticky top-0 z-10">
                  <td className="p-4 font-black text-emerald-400">1. RECEITA OPERACIONAL BRUTA</td>
                  <td className="p-4 text-right font-black text-emerald-400">
                    R$ {dreData.receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {dreData.details.receitas.length === 0 && <tr className="bg-slate-950/50"><td colSpan={2} className="p-2 text-center text-xs text-slate-600">Sem registros</td></tr>}
                {dreData.details.receitas.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="px-8 py-2 text-slate-400 text-xs flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500/50"></div>{item.nome}</td>
                    <td className="px-4 py-2 text-right text-slate-400 text-xs font-mono">
                      {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}

                {/* DEDUÇÕES (Placeholder) */}
                <tr className="bg-slate-950/50">
                  <td className="p-3 font-bold text-rose-400 pl-6 text-xs">(-) Impostos / Deduções (Simulado 6%)</td>
                  <td className="p-3 text-right font-bold text-rose-400 text-xs">
                    (R$ {(dreData.receitaBruta * 0.06).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </td>
                </tr>

                {/* RECEITA LÍQUIDA */}
                <tr className="bg-slate-800 border-t border-slate-700">
                  <td className="p-3 font-black text-white text-xs uppercase tracking-wider">= RECEITA LÍQUIDA</td>
                  <td className="p-3 text-right font-black text-white">
                    R$ {(dreData.receitaBruta * 0.94).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* CPV */}
                <tr className="bg-slate-900 mt-4 border-t-2 border-slate-800 sticky top-10">
                  <td className="p-4 font-black text-amber-500">2. CUSTOS DIRETOS (CPV)</td>
                  <td className="p-4 text-right font-black text-amber-500">
                    (R$ {Math.abs(dreData.custosDiretos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </td>
                </tr>
                {dreData.details.custos.length === 0 && <tr className="bg-slate-950/50"><td colSpan={2} className="p-2 text-center text-xs text-slate-600">Sem registros</td></tr>}
                {dreData.details.custos.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="px-8 py-2 text-slate-400 text-xs flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-amber-500/50"></div>{item.nome}</td>
                    <td className="px-4 py-2 text-right text-slate-400 text-xs font-mono text-rose-400">
                      ({Math.abs(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                    </td>
                  </tr>
                ))}

                {/* LUCRO BRUTO */}
                <tr className="bg-slate-800 border-t border-slate-700">
                  <td className="p-3 font-black text-white text-xs uppercase tracking-wider">= LUCRO BRUTO</td>
                  <td className="p-3 text-right font-black text-white">
                    R$ {(dreData.receitaBruta * 0.94 - Math.abs(dreData.custosDiretos)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* DESPESAS OP */}
                <tr className="bg-slate-900 mt-4 border-t-2 border-slate-800">
                  <td className="p-4 font-black text-rose-500">3. DESPESAS OPERACIONAIS</td>
                  <td className="p-4 text-right font-black text-rose-500">
                    (R$ {Math.abs(dreData.despesasFixas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </td>
                </tr>
                {dreData.details.despesas.length === 0 && <tr className="bg-slate-950/50"><td colSpan={2} className="p-2 text-center text-xs text-slate-600">Sem registros</td></tr>}
                {dreData.details.despesas.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="px-8 py-2 text-slate-400 text-xs flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-rose-500/50"></div>{item.nome}</td>
                    <td className="px-4 py-2 text-right text-slate-400 text-xs font-mono text-rose-400">
                      ({Math.abs(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                    </td>
                  </tr>
                ))}

                {/* EBITDA */}
                <tr className="bg-slate-800 border-t-2 border-slate-600">
                  <td className="p-4 font-black text-white text-lg">= EBITDA</td>
                  <td className={`p-4 text-right font-black text-lg ${(dreData.receitaBruta * 0.94 - Math.abs(dreData.custosDiretos) - Math.abs(dreData.despesasFixas)) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    R$ {(dreData.receitaBruta * 0.94 - Math.abs(dreData.custosDiretos) - Math.abs(dreData.despesasFixas)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Financial;
