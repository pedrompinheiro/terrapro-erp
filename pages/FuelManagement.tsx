import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, Droplets, History, AlertTriangle, Save, ArrowDownLeft, ArrowUpRight, Camera, Settings, MessageCircle, Trash2, Lock, X, Edit, BarChart3 } from 'lucide-react';
import Modal from '../components/Modal';
import { useQuery } from '@tanstack/react-query';
import { fleetManagementService } from '../services/fleetService';
import { supabase } from '../lib/supabase';
import { fetchAll } from '../lib/supabaseUtils';

// Interfaces
interface FuelTank {
  id: string;
  name: string;
  type: 'STATIONARY' | 'MOBILE';
  capacity: number;
  current_level: number;
  min_level: number; // Nível de alerta
  whatsapp_order_number?: string; // Número do contato para pedidos
}

interface FuelRecord {
  id: string;
  date: string;
  operation_type: 'IN' | 'OUT';
  liters: number;
  asset_name?: string;
  supplier_name?: string;
  tank_id: string;
  invoice_number?: string;
  horometer?: number;
  responsible_name?: string;
  total_value?: number;
  price_per_liter?: number;
}

const FuelManagement: React.FC = () => {
  const navigate = useNavigate();
  const [modalType, setModalType] = useState<'NONE' | 'PURCHASE' | 'SUPPLY' | 'MANAGE_TANKS'>('NONE');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Auth / Delete Protection State
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [recordToDelete, setRecordToDelete] = useState<{ id: string, type: 'IN' | 'OUT' } | null>(null);

  // Edit Protection State
  const [isEditLocked, setIsEditLocked] = useState(false); // If true, inputs are disabled until auth
  const [authAction, setAuthAction] = useState<'DELETE' | 'UNLOCK' | null>(null);

  // --- Data Fetching ---

  // 1. Tanques (Estoque)
  const { data: tanks = [], refetch: refetchTanks } = useQuery({
    queryKey: ['fuel_tanks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fuel_tanks').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data as FuelTank[];
    }
  });

  // 2. Histórico de Movimentações
  const { data: history = [], refetch: refetchHistory } = useQuery({
    queryKey: ['fuel_records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fuel_records')
        .select('*')
        .order('date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as FuelRecord[];
    }
  });

  // 3. Ativos (Frota)
  const { data: assets = [] } = useQuery({
    queryKey: ['fleet'],
    queryFn: fleetManagementService.getAssets,
    staleTime: 1000 * 60,
  });

  // 4. Fornecedores e Funcionários
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchAll('entities', {
      select: 'id, name',
      order: { column: 'name' },
      filters: (q: any) => q.eq('is_supplier', true)
    }).then(data => setSuppliers(data));

    // Busca funcionários filtrados pela empresa do usuário (via Service)
    fleetManagementService.getEmployees()
      .then(data => setEmployees(data))
      .catch(err => console.error("Erro ao carregar funcionários:", err));
  }, []);

  // --- Form States ---
  const [formData, setFormData] = useState({
    tankId: '',
    assetId: '',
    supplierId: '',
    responsibleId: '',
    liters: '',
    horometer: '',
    totalValue: '',
    invoiceNumber: '',
    date: new Date().toISOString().slice(0, 16),
    observation: '',
    // Campos de Pagamento (Compra)
    paymentMethod: 'BOLETO' as 'BOLETO' | 'PIX' | 'TRANSFERENCIA' | 'DINHEIRO' | 'CHEQUE',
    installments: '1',      // Número de parcelas
    installmentInterval: '30', // Intervalo em dias entre parcelas
    firstDueDate: '',        // Data do 1º vencimento (se vazio, usa data da compra + intervalo)
  });

  // Tank Form State
  const [tankForm, setTankForm] = useState({
    name: '',
    type: 'STATIONARY',
    capacity: '',
    current_level: '',
    min_level: '500',
    whatsapp_order_number: ''
  });

  // Reset form when modal opens
  useEffect(() => {
    if ((modalType === 'PURCHASE' || modalType === 'SUPPLY') && tanks.length > 0 && !editingId) {
      setFormData(prev => ({ ...prev, tankId: tanks[0].id }));
    }
  }, [modalType, tanks, editingId]);

  // --- Actions ---

  const closeModal = () => {
    setModalType('NONE');
    setEditingId(null);
    setIsEditLocked(false);
    setAuthAction(null);
    setFormData({
      tankId: tanks[0]?.id || '', assetId: '', supplierId: '', responsibleId: '',
      liters: '', horometer: '', totalValue: '', invoiceNumber: '',
      date: new Date().toISOString().slice(0, 16), observation: '',
      paymentMethod: 'BOLETO', installments: '1', installmentInterval: '30', firstDueDate: ''
    });
  };

  const handleEdit = (record: FuelRecord) => {
    setEditingId(record.id);
    setIsEditLocked(true); // Bloqueia edição inicialmente
    setModalType(record.operation_type === 'IN' ? 'PURCHASE' : 'SUPPLY');

    // Calculate Total Value safely
    const totalVal = record.total_value || (record.price_per_liter ? (record.price_per_liter * record.liters).toFixed(2) : '');

    setFormData({
      tankId: record.tank_id,
      assetId: (record as any).asset_id || (record.asset_name ? (assets.find(a => a.name === record.asset_name)?.id || '') : ''),
      supplierId: (record as any).supplier_id || '',
      responsibleId: (record as any).responsible_id || '',

      liters: String(record.liters),
      horometer: record.horometer ? String(record.horometer) : '',
      totalValue: String(totalVal),
      invoiceNumber: record.invoice_number || '',
      date: new Date(record.date).toISOString().slice(0, 16),
      observation: '',
      paymentMethod: (record as any).payment_method || 'BOLETO',
      installments: String((record as any).installments || 1),
      installmentInterval: String((record as any).installment_interval || 30),
      firstDueDate: (record as any).first_due_date || ''
    });
  };

  const handleSaveTank = async () => {
    if (!tankForm.name || !tankForm.capacity) return alert("Preencha Nome e Capacidade");

    setLoading(true);
    try {
      const { error } = await supabase.from('fuel_tanks').insert({
        name: tankForm.name,
        type: tankForm.type,
        capacity: parseFloat(tankForm.capacity),
        current_level: parseFloat(tankForm.current_level || '0'),
        min_level: parseFloat(tankForm.min_level || '500'),
        whatsapp_order_number: tankForm.whatsapp_order_number || null
      });

      if (error) throw error;

      alert("Tanque cadastrado com sucesso!");
      setTankForm({ name: '', type: 'STATIONARY', capacity: '', current_level: '', min_level: '500', whatsapp_order_number: '' });
      refetchTanks();
    } catch (e: any) {
      alert("Erro ao criar tanque: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTank = async (id: string) => {
    if (!confirm("Tem certeza? O histórico de abastecimentos deste tanque será afetado.")) return;
    try {
      const { error } = await supabase.from('fuel_tanks').delete().eq('id', id);
      if (error) throw error;
      refetchTanks();
    } catch (e: any) {
      alert("Erro ao excluir: " + e.message);
    }
  };

  const handleSaveTransaction = async () => {
    if (editingId && isEditLocked) return; // Segurança extra

    if (!formData.tankId || !formData.liters) {
      return alert('Preencha Tanque e Litros.');
    }

    if (modalType === 'PURCHASE' && (!formData.supplierId || !formData.invoiceNumber || !formData.totalValue)) {
      return alert('Para COMPRA, Fornecedor, NFe e Valor Total são obrigatórios.');
    }

    if (modalType === 'SUPPLY' && !formData.assetId) {
      return alert('Selecione o Equipamento abastecido.');
    }

    if (modalType === 'SUPPLY' && !formData.responsibleId) {
      return alert('Selecione o Responsável pelo abastecimento.');
    }

    setLoading(true);
    try {
      const asset = assets.find(a => a.id === formData.assetId);
      const supplier = suppliers.find(s => s.id === formData.supplierId);
      const employee = employees.find(e => e.id === formData.responsibleId);
      const tank = tanks.find(t => t.id === formData.tankId);

      // Validação de Estoque (Saída)
      if (modalType === 'SUPPLY' && tank && !editingId) {
        if (Number(formData.liters) > tank.current_level) {
          throw new Error(`Saldo insuficiente no tanque! Disponível: ${tank.current_level} L`);
        }
      }

      // Validação de Horímetro (Lógica de Consumo)
      if (modalType === 'SUPPLY' && formData.assetId && formData.horometer) {
        const currentHorometer = parseFloat(formData.horometer);

        // Busca último registro DESTE ativo anterior à data atual
        const { data: lastRecord } = await supabase
          .from('fuel_records')
          .select('horometer, date')
          .eq('asset_id', formData.assetId)
          .lt('date', new Date(formData.date).toISOString()) // Apenas registros anteriores
          .not('horometer', 'is', null) // Que tenham horimetro
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (lastRecord && lastRecord.horometer) {
          if (currentHorometer <= lastRecord.horometer) {
            // Se for edição e o horímetro for igual ao original, ok (mas aqui estamos comparando com o ANTERIOR ao atual, então deve ser maior)
            // Mas cuidado: se eu edito um registro antigo, o "anterior" é o anterior a ele.
            // Se eu edito, e mantenho o mesmo, ele deve ser > que o anterior.
            const confirmForce = confirm(`⚠️ ALERTA DE CONSISTÊNCIA\n\nO horímetro atual (${currentHorometer}) é MENOR ou IGUAL ao registro anterior (${lastRecord.horometer} em ${new Date(lastRecord.date).toLocaleDateString()}).\n\nIsso pode gerar erro no cálculo de média.\nDeseja salvar mesmo assim?`);

            if (!confirmForce) {
              setLoading(false);
              return;
            }
          }
        }
      }

      const valorTotal = modalType === 'PURCHASE' ? parseFloat(formData.totalValue || '0') : null;

      const numParcelas = modalType === 'PURCHASE' ? parseInt(formData.installments || '1') : 1;
      const intervaloDias = parseInt(formData.installmentInterval || '30');

      const payload = {
        operation_type: modalType === 'PURCHASE' ? 'IN' : 'OUT',
        tank_id: formData.tankId,
        date: new Date(formData.date).toISOString(),
        liters: parseFloat(formData.liters),

        // Dados de Compra
        supplier_id: modalType === 'PURCHASE' ? formData.supplierId : null,
        supplier_name: modalType === 'PURCHASE' ? supplier?.name : null,
        invoice_number: modalType === 'PURCHASE' ? formData.invoiceNumber : null,
        price_per_liter: modalType === 'PURCHASE' ? ((valorTotal || 0) / parseFloat(formData.liters || '1')) : null,
        total_value: valorTotal,
        payment_method: modalType === 'PURCHASE' ? formData.paymentMethod : null,
        installments: modalType === 'PURCHASE' ? numParcelas : null,
        installment_interval: modalType === 'PURCHASE' ? intervaloDias : null,

        // Dados de Abastecimento
        asset_id: modalType === 'SUPPLY' ? formData.assetId : null,
        asset_name: modalType === 'SUPPLY' ? asset?.name : null,
        horometer: modalType === 'SUPPLY' ? parseFloat(formData.horometer || '0') : null,
        responsible_id: modalType === 'SUPPLY' ? formData.responsibleId : null,
        responsible_name: modalType === 'SUPPLY' ? employee?.full_name : null,
      };

      // Helper: gerar número do título financeiro vinculado à NF
      const gerarNumeroTitulo = (nf: string) => `DSL-${nf}`;

      // Helper: calcular data de vencimento da parcela
      const calcularVencimento = (parcelaNum: number): string => {
        const base = formData.firstDueDate
          ? new Date(formData.firstDueDate + 'T12:00:00')
          : new Date(formData.date);
        const venc = new Date(base);
        if (formData.firstDueDate) {
          // Se tem data do 1º vencimento, adicionar intervalo a partir da 2ª parcela
          venc.setDate(venc.getDate() + (intervaloDias * (parcelaNum - 1)));
        } else {
          // Sem data específica: 1ª parcela = data + intervalo, 2ª = data + 2*intervalo, etc.
          venc.setDate(venc.getDate() + (intervaloDias * parcelaNum));
        }
        return venc.toISOString().split('T')[0];
      };

      // Mapear forma de pagamento para label legível
      const formaLabel: Record<string, string> = {
        'BOLETO': 'Boleto', 'PIX': 'PIX', 'TRANSFERENCIA': 'Transferência',
        'DINHEIRO': 'Dinheiro', 'CHEQUE': 'Cheque'
      };

      if (editingId) {
        // UPDATE
        const { error } = await supabase.from('fuel_records').update(payload).eq('id', editingId);
        if (error) throw error;

        // Sincronizar Financeiro (Se for Compra editada — atualiza apenas parcelas PENDENTES)
        if (modalType === 'PURCHASE' && formData.invoiceNumber && valorTotal) {
          const tituloRef = gerarNumeroTitulo(formData.invoiceNumber);
          const { data: contasExistentes } = await supabase
            .from('contas_pagar')
            .select('id, status, parcela_numero')
            .like('numero_titulo', `${tituloRef}%`)
            .eq('status', 'PENDENTE');

          if (contasExistentes && contasExistentes.length > 0) {
            // Recalcular valor por parcela
            const valorParcela = Math.round((valorTotal / numParcelas) * 100) / 100;
            for (const conta of contasExistentes) {
              await supabase.from('contas_pagar').update({
                fornecedor_id: formData.supplierId,
                fornecedor_nome: supplier?.name || 'Fornecedor de Combustível',
                valor_original: valorParcela,
                forma_pagamento: formData.paymentMethod,
              }).eq('id', conta.id);
            }
          }
        }

        alert('Registro atualizado com sucesso!');
      } else {
        // INSERT
        // 1. Salvar Registro de Combustível
        const { error } = await supabase.from('fuel_records').insert(payload);
        if (error) throw error;

        // 2. Integração Financeira (Se for Compra → Gerar Contas a Pagar com Parcelas)
        if (modalType === 'PURCHASE' && valorTotal) {
          const tituloRef = gerarNumeroTitulo(formData.invoiceNumber);
          const valorParcela = Math.round((valorTotal / numParcelas) * 100) / 100;
          // Ajuste de centavos na última parcela
          const valorUltimaParcela = Math.round((valorTotal - (valorParcela * (numParcelas - 1))) * 100) / 100;

          const parcelas = [];
          for (let i = 1; i <= numParcelas; i++) {
            parcelas.push({
              fornecedor_id: formData.supplierId,
              fornecedor_nome: supplier?.name || 'Fornecedor de Combustível',
              descricao: numParcelas > 1
                ? `Diesel NF ${formData.invoiceNumber} - Parcela ${i}/${numParcelas} (${formData.liters}L)`
                : `Compra Diesel - NF ${formData.invoiceNumber} - ${formData.liters}L`,
              valor_original: i === numParcelas ? valorUltimaParcela : valorParcela,
              data_emissao: new Date().toISOString().split('T')[0],
              data_vencimento: calcularVencimento(i),
              status: 'PENDENTE',
              categoria: 'COMBUSTIVEL',
              forma_pagamento: formData.paymentMethod,
              numero_titulo: `${tituloRef}-${i}/${numParcelas}`,
              numero_documento: formData.invoiceNumber,
              parcela_numero: i,
              parcela_total: numParcelas,
              observacao: `Gerado automaticamente - Combustível. Tanque: ${tank?.name}. ${formData.liters}L a R$ ${(valorTotal / parseFloat(formData.liters)).toFixed(4)}/L. Pgto: ${formaLabel[formData.paymentMethod] || formData.paymentMethod}`
            });
          }

          const { error: finError } = await supabase.from('contas_pagar').insert(parcelas);

          if (finError) {
            console.error('Erro ao gerar financeiro:', finError);
            alert(`⚠️ Combustível salvo, mas houve erro ao gerar ${numParcelas > 1 ? 'as parcelas no' : 'o'} Contas a Pagar: ${finError.message}`);
          }
        }
      }

      closeModal();
      refetchTanks();
      refetchHistory();
    } catch (e: any) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppOrder = (tank: FuelTank) => {
    const message = `🚨 *ALERTA DE ESTOQUE BAIXO*\n\nPreciso solicitar compra de DIESEL com urgência.\n\nTanque: *${tank.name}*\nNível Atual: *${tank.current_level} Litros*\nCapacidade: ${tank.capacity} Litros`;
    const phone = tank.whatsapp_order_number ? tank.whatsapp_order_number.replace(/\D/g, '') : '';
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // --- Função de Autenticação Segura (Delete / Edit) ---
  const requestDelete = (record: FuelRecord) => {
    setRecordToDelete({ id: record.id, type: record.operation_type });
    setAuthAction('DELETE'); // Define ação como Delete
    setAdminPassword('');
    setShowAdminAuth(true);
  };

  const handleUnlockEdit = () => {
    setAuthAction('UNLOCK'); // Define ação como Unlock
    setAdminPassword('');
    setShowAdminAuth(true);
  };

  const confirmAuth = async () => {
    // Validar senha com o banco (tabela app_config)
    try {
      const { data } = await supabase
        .from('app_config')
        .select('valor')
        .eq('chave', 'admin_password')
        .single();

      if (!data?.valor) {
        alert("Senha mestra não configurada. Configure no módulo Financeiro → Configurações.");
        return;
      }

      if (adminPassword !== data.valor) {
        alert("Senha de Administrador Incorreta!");
        return;
      }
    } catch {
      alert("Erro ao validar senha. Verifique a conexão.");
      return;
    }

    if (authAction === 'UNLOCK') {
      setIsEditLocked(false); // Desbloqueia formulário
      setShowAdminAuth(false);
      setAuthAction(null);
      return;
    }

    if (authAction === 'DELETE' && recordToDelete) {
      setLoading(true);
      try {
        // Se for registro de COMPRA (IN), cancelar o financeiro vinculado
        if (recordToDelete.type === 'IN') {
          // Buscar dados do registro para encontrar a NF
          const { data: fuelRec } = await supabase
            .from('fuel_records')
            .select('invoice_number')
            .eq('id', recordToDelete.id)
            .single();

          if (fuelRec?.invoice_number) {
            const tituloRef = `DSL-${fuelRec.invoice_number}`;
            // Cancelar conta a pagar vinculada (apenas se PENDENTE)
            const { data: contaVinculada } = await supabase
              .from('contas_pagar')
              .select('id, status')
              .like('numero_titulo', `${tituloRef}%`)
              .eq('status', 'PENDENTE')
              .single();

            if (contaVinculada) {
              await supabase.from('contas_pagar').update({
                status: 'CANCELADO',
                observacao: `Cancelado automaticamente: registro de combustível excluído em ${new Date().toLocaleDateString('pt-BR')}`
              }).eq('id', contaVinculada.id);
            }
          }
        }

        const { error } = await supabase.from('fuel_records').delete().eq('id', recordToDelete.id);
        if (error) throw error;

        alert("Registro excluído com sucesso!");
        setShowAdminAuth(false);
        setRecordToDelete(null);
        refetchHistory();
        refetchTanks(); // Importante para recalcular saldos (via trigger)
      } catch (e: any) {
        alert("Erro ao excluir: " + e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto custom-scrollbar pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-white tracking-tight">Gestão de Combustível</h2>
            <button
              onClick={() => setModalType('MANAGE_TANKS')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Gerenciar Tanques"
            >
              <Settings size={20} />
            </button>
          </div>
          <p className="text-slate-500 mt-1">Controle de estoque, compras de diesel e abastecimentos da frota.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/fuel/reports')}
            className="bg-slate-800 hover:bg-slate-700 transition-all text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-slate-700"
          >
            <BarChart3 size={18} />
            Relatórios
          </button>
          <button
            onClick={() => setModalType('PURCHASE')}
            className="bg-emerald-600 hover:bg-emerald-500 transition-all text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 uppercase tracking-wide"
          >
            <ArrowDownLeft size={18} />
            Compra de Diesel (Entrada)
          </button>
          <button
            onClick={() => setModalType('SUPPLY')}
            className="bg-orange-600 hover:bg-orange-500 transition-all text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-600/30 flex items-center gap-2 uppercase tracking-wide"
          >
            <ArrowUpRight size={18} />
            Abastecer Frota (Saída)
          </button>
        </div>
      </div>

      {/* Tanques (Kards de Saldo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tanks.map(tank => {
          const percentage = tank.capacity > 0 ? Math.round((tank.current_level / tank.capacity) * 100) : 0;
          const isCritical = tank.current_level <= (tank.min_level || 500);

          return (
            <div key={tank.id} className={`bg-slate-900 border ${isCritical ? 'border-red-500/50 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]' : 'border-slate-800'} p-6 rounded-[24px] space-y-4 relative overflow-hidden group transition-all duration-300`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl border ${isCritical ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                    {isCritical ? <AlertTriangle size={24} className="animate-bounce" /> : <Droplets size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{tank.name}</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{tank.type === 'STATIONARY' ? 'Tanque Fixo' : 'Comboio Móvel'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${isCritical ? 'text-red-500' : 'text-white'}`}>{tank.current_level.toLocaleString()} L</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">de {tank.capacity.toLocaleString()} L</p>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 relative">
                {/* Marcador de nível mínimo */}
                {(tank.min_level && tank.capacity && (tank.min_level / tank.capacity) < 1) && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `${(tank.min_level / tank.capacity) * 100}%` }}
                    title={`Nível de Alerta: ${tank.min_level}L`}
                  />
                )}
                <div
                  className={`h-full transition-all duration-1000 ease-out ${isCritical ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                  {percentage}% Cheio {isCritical && '(CRÍTICO)'}
                </p>

                {isCritical && (
                  <button
                    onClick={() => handleWhatsAppOrder(tank)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg shadow-green-600/20 animate-pulse hover:animate-none transition-all"
                  >
                    <MessageCircle size={14} />
                    Pedir Diesel
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {tanks.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 italic bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            Nenhum tanque cadastrado. Clique na engrenagem acima para cadastrar.
          </div>
        )}
      </div>

      {/* Histórico Recente */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
          <div className="flex items-center gap-2">
            <History size={18} className="text-slate-500" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Últimas Movimentações</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Origem / Destino</th>
                <th className="px-6 py-4">Litros</th>
                <th className="px-6 py-4">Preço/L (Médio)</th>
                <th className="px-6 py-4">Detalhes</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                  onClick={() => handleEdit(record)}
                >
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    {new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString().slice(0, 5)}
                  </td>
                  <td className="px-6 py-4">
                    {record.operation_type === 'IN' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                        <ArrowDownLeft size={10} /> Entrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-wider border border-orange-500/20">
                        <ArrowUpRight size={10} /> Saída
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {record.operation_type === 'IN'
                      ? (record.supplier_name || 'Fornecedor Externo')
                      : (record.asset_name || 'Frota Geral')
                    }
                  </td>
                  <td className="px-6 py-4 font-black text-white text-lg">
                    {record.liters} <span className="text-xs font-normal text-slate-500">L</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-400">
                    {record.operation_type === 'IN' && record.price_per_liter ? (
                      <span>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(record.price_per_liter)}
                        <span className="text-[10px] text-slate-500 font-normal"> /L</span>
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {record.operation_type === 'IN' ? (
                      <span>NF: {record.invoice_number || '-'}</span>
                    ) : (
                      <div className="flex flex-col">
                        <span>Horímetro: {record.horometer || '-'}</span>
                        {record.responsible_name && <span className="text-[9px] uppercase text-slate-500 mt-1">Resp: {record.responsible_name}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(record)}
                      className="text-slate-600 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-slate-800"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => requestDelete(record)}
                      className="text-slate-600 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-slate-800"
                      title="Excluir Registro (Requer Senha)"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Nenhum registro encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Transaction */}
      <Modal
        isOpen={modalType === 'PURCHASE' || modalType === 'SUPPLY'}
        onClose={closeModal}
        title={editingId ? (isEditLocked ? "Visualizar Lançamento" : "Editar Lançamento") : (modalType === 'PURCHASE' ? "Registrar Compra de Diesel" : "Abastecer Frota")}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Tanque {modalType === 'PURCHASE' ? 'de Entrada' : 'de Origem'} *</label>
            <select
              value={formData.tankId}
              onChange={(e) => setFormData({ ...formData, tankId: e.target.value })}
              disabled={!!editingId && isEditLocked}
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Selecione...</option>
              {tanks.map(tank => (
                <option key={tank.id} value={tank.id}>
                  {tank.name} (Saldo: {tank.current_level} L)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Data/Hora</label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={!!editingId && isEditLocked}
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Quantidade (Litros) *</label>
            <input
              type="number"
              value={formData.liters}
              onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
              placeholder="0.0"
              disabled={!!editingId && isEditLocked}
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-lg font-bold focus:border-blue-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          {modalType === 'PURCHASE' && (
            <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-500 uppercase">Fornecedor / Posto *</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  disabled={!!editingId && isEditLocked}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Selecione...</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-500 uppercase">Nota Fiscal (NFe) *</label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="000.000"
                    disabled={!!editingId && isEditLocked}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-500 uppercase">Valor Total (R$) *</label>
                  <input
                    type="number"
                    value={formData.totalValue}
                    onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                    placeholder="0.00"
                    disabled={!!editingId && isEditLocked}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              {/* --- Seção de Pagamento / Parcelamento --- */}
              <div className="mt-3 pt-3 border-t border-emerald-500/20 space-y-3">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  💳 Condição de Pagamento
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500 uppercase">Forma de Pagamento</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      disabled={!!editingId && isEditLocked}
                      className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="BOLETO">Boleto Bancário</option>
                      <option value="PIX">PIX</option>
                      <option value="TRANSFERENCIA">Transferência Bancária</option>
                      <option value="DINHEIRO">Dinheiro</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500 uppercase">Parcelas</label>
                    <select
                      value={formData.installments}
                      onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                      disabled={!!editingId && isEditLocked}
                      className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="1">À Vista (1x)</option>
                      <option value="2">2x</option>
                      <option value="3">3x</option>
                      <option value="4">4x</option>
                      <option value="5">5x</option>
                      <option value="6">6x</option>
                    </select>
                  </div>
                </div>

                {parseInt(formData.installments) > 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-500 uppercase">Intervalo entre Parcelas</label>
                      <select
                        value={formData.installmentInterval}
                        onChange={(e) => setFormData({ ...formData, installmentInterval: e.target.value })}
                        disabled={!!editingId && isEditLocked}
                        className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="7">7 dias</option>
                        <option value="14">14 dias</option>
                        <option value="15">15 dias</option>
                        <option value="21">21 dias</option>
                        <option value="28">28 dias</option>
                        <option value="30">30 dias</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-500 uppercase">1º Vencimento (Opcional)</label>
                      <input
                        type="date"
                        value={formData.firstDueDate}
                        onChange={(e) => setFormData({ ...formData, firstDueDate: e.target.value })}
                        disabled={!!editingId && isEditLocked}
                        className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>
                )}

                {/* Preview das Parcelas */}
                {formData.totalValue && parseInt(formData.installments) > 1 && (
                  <div className="bg-slate-950/50 rounded-lg p-3 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Prévia das Parcelas:</p>
                    {Array.from({ length: parseInt(formData.installments) }, (_, i) => {
                      const total = parseFloat(formData.totalValue || '0');
                      const valorParcela = Math.round((total / parseInt(formData.installments)) * 100) / 100;
                      const isLast = i === parseInt(formData.installments) - 1;
                      const valorFinal = isLast ? Math.round((total - (valorParcela * (parseInt(formData.installments) - 1))) * 100) / 100 : valorParcela;
                      const intervalo = parseInt(formData.installmentInterval || '30');
                      const base = formData.firstDueDate ? new Date(formData.firstDueDate + 'T12:00:00') : new Date(formData.date);
                      const venc = new Date(base);
                      if (formData.firstDueDate) {
                        venc.setDate(venc.getDate() + (intervalo * i));
                      } else {
                        venc.setDate(venc.getDate() + (intervalo * (i + 1)));
                      }
                      return (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">{i + 1}ª parcela — {venc.toLocaleDateString('pt-BR')}</span>
                          <span className="text-emerald-400 font-bold">R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800 mt-1">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-white font-bold">R$ {parseFloat(formData.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {modalType === 'SUPPLY' && (
            <div className="p-4 bg-orange-900/10 border border-orange-500/20 rounded-xl space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-orange-500 uppercase">Máquina / Frota *</label>
                <select
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  disabled={!!editingId && isEditLocked}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Selecione a máquina...</option>
                  {assets.map((asset: any) => (
                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-orange-500 uppercase">Responsável (Comboísta) *</label>
                <select
                  value={formData.responsibleId}
                  onChange={(e) => setFormData({ ...formData, responsibleId: e.target.value })}
                  disabled={!!editingId && isEditLocked}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Selecione o responsável...</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                  ))}
                  {employees.length === 0 && <option disabled>Nenhum funcionário ativo encontrado</option>}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-orange-500 uppercase">Horímetro Atual / Quilometragem</label>
                  <input
                    type="number"
                    value={formData.horometer}
                    onChange={(e) => setFormData({ ...formData, horometer: e.target.value })}
                    placeholder="0000"
                    disabled={!!editingId && isEditLocked}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-orange-500 uppercase">Foto Comprovante</label>
                  <button
                    disabled={!!editingId && isEditLocked}
                    className={`w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Camera size={18} />
                    <span className="text-xs">Adicionar Foto</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            {editingId && isEditLocked ? (
              <button
                onClick={handleUnlockEdit}
                className="w-full py-4 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide bg-slate-700 hover:bg-slate-600 shadow-slate-700/20"
              >
                <Lock size={18} />
                Desbloquear Edição
              </button>
            ) : (
              <button
                onClick={handleSaveTransaction}
                disabled={loading}
                className={`w-full py-4 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide
                  ${modalType === 'PURCHASE' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/20'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Save size={18} />
                {loading ? 'Processando...' : (editingId ? 'Salvar Alterações' : 'Confirmar Lançamento')}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Manage Tanks (Existing Code...) */}
      <Modal
        isOpen={modalType === 'MANAGE_TANKS'}
        onClose={() => setModalType('NONE')}
        title="Gerenciar Tanques e Comboios"
      >
        {/* ... existing tank modal content ... */}
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest border-b border-slate-800 pb-2">Novo Tanque</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Tanque / Placa Comboio</label>
                <input
                  type="text"
                  value={tankForm.name}
                  onChange={e => setTankForm({ ...tankForm, name: e.target.value })}
                  placeholder="Ex: Tanque Principal ou Comboio ABC-1234"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo</label>
                  <select
                    value={tankForm.type}
                    onChange={e => setTankForm({ ...tankForm, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                  >
                    <option value="STATIONARY">Tanque Fixo</option>
                    <option value="MOBILE">Comboio Móvel</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Capacidade (L)</label>
                  <input
                    type="number"
                    value={tankForm.capacity}
                    onChange={e => setTankForm({ ...tankForm, capacity: e.target.value })}
                    placeholder="10000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Saldo Inicial (L)</label>
                  <input
                    type="number"
                    value={tankForm.current_level}
                    onChange={e => setTankForm({ ...tankForm, current_level: e.target.value })}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-red-500 uppercase">Alerta Mínimo (L)</label>
                  <input
                    type="number"
                    value={tankForm.min_level}
                    onChange={e => setTankForm({ ...tankForm, min_level: e.target.value })}
                    placeholder="500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-2">
                  <MessageCircle size={10} /> WhatsApp P/ Pedidos (DDD+Número)
                </label>
                <input
                  type="text"
                  value={tankForm.whatsapp_order_number}
                  onChange={e => setTankForm({ ...tankForm, whatsapp_order_number: e.target.value })}
                  placeholder="Ex: 5567999999999"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-green-500"
                />
                <p className="text-[9px] text-slate-500 mt-1">O botão de pedido enviará mensagem para este número.</p>
              </div>

              <button
                onClick={handleSaveTank}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider"
              >
                {loading ? 'Salvando...' : 'Adicionar Tanque'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest">Tanques Cadastrados</h4>
            {tanks.length === 0 && <p className="text-sm text-slate-600 italic">Nenhum tanque cadastrado.</p>}
            {tanks.map(tank => (
              <div key={tank.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
                    {tank.type === 'STATIONARY' ? <Fuel size={14} /> : <AlertTriangle size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{tank.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{tank.type === 'STATIONARY' ? 'Fixo' : 'Móvel'} • {tank.capacity}L Cap. • Alerta {tank.min_level}L</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-500">{tank.current_level} L</p>
                    <p className="text-[9px] text-slate-600 uppercase">Saldo Atual</p>
                  </div>
                  <button
                    onClick={() => handleDeleteTank(tank.id)}
                    className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                    title="Excluir Tanque"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </Modal>

      {/* Admin Auth Modal for Delete/Unlock */}
      {showAdminAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-500/30 w-full max-w-sm rounded-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAdminAuth(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-4 text-center">
              <div className={`p-4 rounded-full ${authAction === 'DELETE' ? 'bg-red-500/10 text-red-500' : 'bg-slate-700/50 text-slate-300'}`}>
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Acesso Restrito</h3>
              <p className="text-sm text-slate-400">
                {authAction === 'DELETE'
                  ? "Esta ação é irreversível e afetará o estoque."
                  : "Digite a senha para desbloquear a edição."}
                <br />Digite a senha de administrador.
              </p>

              <input
                type="password"
                autoFocus
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Senha de Administrador"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white text-center font-bold focus:border-red-500 outline-none"
              />

              <button
                onClick={confirmAuth}
                className={`w-full font-bold py-3 rounded-lg shadow-lg ${authAction === 'DELETE' ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20 text-white' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 text-white'}`}
              >
                {authAction === 'DELETE' ? 'Confirmar Exclusão' : 'Desbloquear Edição'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelManagement;
