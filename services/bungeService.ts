/**
 * ============================================================
 * Serviço de Faturamento BUNGE
 * Gerencia contratos, itens, faturamentos mensais e cálculo HE
 * ============================================================
 */

import { supabase } from '../lib/supabase';

// ============================================================
// INTERFACES
// ============================================================

export interface BungeContract {
  id: string;
  contract_number: string;
  client_name: string;
  client_id: string | null;
  cnpj: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BungeContractItem {
  id: string;
  contract_id: string;
  equipment_description: string;
  equipment_code: string | null;
  asset_id: string | null;
  billing_type: 'MENSALIDADE' | 'HE' | 'LOCACAO_DIARIA' | 'LOCACAO_MENSAL';
  unit_value: number;
  unit_label: string;
  he_rate_per_hour: number | null;
  he_normal_shift_minutes: number | null;
  operator1_employee_id: string | null;
  operator2_employee_id: string | null;
  sort_order: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

export interface BungeBilling {
  id: string;
  contract_id: string;
  billing_number: string;
  billing_type: 'MENSALIDADE' | 'HE' | 'LOCACAO';
  reference_month: string; // YYYY-MM
  reference_period: string | null;
  subtotal: number;
  discount: number;
  total: number;
  status: 'RASCUNHO' | 'GERADO' | 'ENVIADO' | 'FATURADO' | 'RECEBIDO' | 'CANCELADO';
  conta_receber_id: string | null;
  exported_at: string | null;
  sent_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BungeBillingItem {
  id: string;
  billing_id: string;
  contract_item_id: string | null;
  asset_id: string | null;
  equipment_description: string;
  quantity: number;
  unit_label: string;
  unit_value: number;
  total_value: number;
  he_total_minutes: number | null;
  he_total_hours_display: string | null;
  he_details: HEDayDetail[] | null;
  sort_order: number;
  notes: string | null;
  created_at: string;
}

export interface HEDayDetail {
  date: string;
  dayOfWeek: string;
  op1_entry: string | null;
  op1_exit: string | null;
  op2_entry: string | null;
  op2_exit: string | null;
  machine_start: string | null;
  machine_end: string | null;
  machine_minutes: number;
  normal_minutes: number;
  overtime_minutes: number;
  isHoliday?: boolean;
  holidayName?: string | null;
}

export interface HECalcResult {
  days: HEDayDetail[];
  totalOvertimeMinutes: number;
  totalOvertimeHours: string; // "HH:MM"
  ratePerHour: number;
  totalValue: number;
  operator1Name: string;
  operator2Name: string;
  normalShiftMinutes: number;
  month: string;
  year: string;
}

export interface LocacaoItemInput {
  contract_item_id: string;
  asset_id?: string | null;
  equipment_description: string;
  quantity: number;
  unit_value: number;
  unit_label: string;
}

// ============================================================
// HELPERS
// ============================================================

const toMinutes = (time: string | null | undefined): number => {
  if (!time) return 0;
  const parts = time.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
};

const minutesToHHMM = (minutes: number): string => {
  const sign = minutes < 0 ? '-' : '';
  const abs = Math.abs(Math.round(minutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const MONTHS_PT: Record<string, string> = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março',
  '04': 'Abril', '05': 'Maio', '06': 'Junho',
  '07': 'Julho', '08': 'Agosto', '09': 'Setembro',
  '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
};

const DAY_NAMES_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const formatMonthYear = (refMonth: string): string => {
  const [year, month] = refMonth.split('-');
  return `${MONTHS_PT[month] || month} de ${year}`;
};

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// ============================================================
// SERVICE
// ============================================================

class BungeService {

  // ---- CONTRATOS ----

  async obterContratoAtivo(): Promise<BungeContract | null> {
    const { data, error } = await supabase
      .from('bunge_contracts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar contrato ativo:', error);
      return null;
    }
    return data;
  }

  async listarContratos(): Promise<BungeContract[]> {
    const { data, error } = await supabase
      .from('bunge_contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ---- ITENS DO CONTRATO ----

  async listarItensContrato(contractId: string, billingType?: string): Promise<BungeContractItem[]> {
    let query = supabase
      .from('bunge_contract_items')
      .select('*')
      .eq('contract_id', contractId)
      .eq('is_active', true)
      .order('sort_order');

    if (billingType) {
      query = query.eq('billing_type', billingType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async atualizarItemContrato(itemId: string, updates: Partial<BungeContractItem>): Promise<void> {
    const { error } = await supabase
      .from('bunge_contract_items')
      .update(updates)
      .eq('id', itemId);

    if (error) throw error;
  }

  // ---- FUNCIONÁRIOS (para seleção de operadores HE) ----

  async listarFuncionarios(): Promise<{ id: string; full_name: string }[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('id, full_name')
      .order('full_name');

    if (error) throw error;
    return data || [];
  }

  // ---- FATURAMENTOS ----

  async listarFaturamentos(filtros?: {
    contract_id?: string;
    billing_type?: string;
    reference_month?: string;
    status?: string;
  }): Promise<BungeBilling[]> {
    let query = supabase
      .from('bunge_billings')
      .select('*')
      .order('created_at', { ascending: false });

    if (filtros?.contract_id) query = query.eq('contract_id', filtros.contract_id);
    if (filtros?.billing_type) query = query.eq('billing_type', filtros.billing_type);
    if (filtros?.reference_month) query = query.eq('reference_month', filtros.reference_month);
    if (filtros?.status) query = query.eq('status', filtros.status);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async obterFaturamento(billingId: string): Promise<BungeBilling | null> {
    const { data, error } = await supabase
      .from('bunge_billings')
      .select('*')
      .eq('id', billingId)
      .single();

    if (error) return null;
    return data;
  }

  async listarItensFaturamento(billingId: string): Promise<BungeBillingItem[]> {
    const { data, error } = await supabase
      .from('bunge_billing_items')
      .select('*')
      .eq('billing_id', billingId)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  }

  // ---- VERIFICAR DUPLICIDADE ----

  async verificarDuplicidade(contractId: string, billingType: string, refMonth: string): Promise<BungeBilling | null> {
    const { data } = await supabase
      .from('bunge_billings')
      .select('*')
      .eq('contract_id', contractId)
      .eq('billing_type', billingType)
      .eq('reference_month', refMonth)
      .neq('status', 'CANCELADO')
      .limit(1)
      .maybeSingle();

    return data || null;
  }

  // ---- GERAR NÚMERO SEQUENCIAL ----

  private async gerarNumero(tipo: string): Promise<string> {
    const { count } = await supabase
      .from('bunge_billings')
      .select('*', { count: 'exact', head: true });

    const seq = (count || 0) + 1;
    const prefixo = tipo === 'MENSALIDADE' ? 'MENSAL' : tipo === 'HE' ? 'HE' : 'LOC';
    return `BAL-${prefixo}-${String(seq).padStart(4, '0')}`;
  }

  // ============================================================
  // GERAR MENSALIDADE
  // ============================================================

  async gerarMensalidade(contractId: string, refMonth: string): Promise<BungeBilling> {
    // Verificar duplicidade
    const existente = await this.verificarDuplicidade(contractId, 'MENSALIDADE', refMonth);
    if (existente) {
      throw new Error(`Já existe faturamento de MENSALIDADE para ${formatMonthYear(refMonth)} (${existente.billing_number}). Status: ${existente.status}`);
    }

    // Buscar itens do contrato tipo MENSALIDADE
    const itens = await this.listarItensContrato(contractId, 'MENSALIDADE');
    if (itens.length === 0) {
      throw new Error('Nenhum item de mensalidade encontrado no contrato.');
    }

    const subtotal = itens.reduce((sum, item) => sum + item.unit_value, 0);
    const numero = await this.gerarNumero('MENSALIDADE');

    // Criar faturamento
    const { data: billing, error: billingError } = await supabase
      .from('bunge_billings')
      .insert({
        contract_id: contractId,
        billing_number: numero,
        billing_type: 'MENSALIDADE',
        reference_month: refMonth,
        reference_period: formatMonthYear(refMonth),
        subtotal,
        discount: 0,
        total: subtotal,
        status: 'GERADO',
      })
      .select()
      .single();

    if (billingError) throw billingError;

    // Criar itens do faturamento
    const billingItems = itens.map((item, idx) => ({
      billing_id: billing.id,
      contract_item_id: item.id,
      asset_id: item.asset_id || null,
      equipment_description: item.equipment_description,
      quantity: 1,
      unit_label: item.unit_label,
      unit_value: item.unit_value,
      total_value: item.unit_value,
      sort_order: idx + 1,
    }));

    const { error: itemsError } = await supabase
      .from('bunge_billing_items')
      .insert(billingItems);

    if (itemsError) throw itemsError;

    return billing;
  }

  // ============================================================
  // GERAR HORA EXTRA (HE)
  // ============================================================

  async calcularHE(contractId: string, refMonth: string): Promise<HECalcResult> {
    // Buscar item HE do contrato
    const itensHE = await this.listarItensContrato(contractId, 'HE');
    if (itensHE.length === 0) {
      throw new Error('Nenhum item de Hora Extra configurado no contrato.');
    }

    const itemHE = itensHE[0];
    const ratePerHour = itemHE.he_rate_per_hour || 165;
    const normalShiftMinutes = itemHE.he_normal_shift_minutes || 1000;
    const op1Id = itemHE.operator1_employee_id;
    const op2Id = itemHE.operator2_employee_id;

    // Buscar nomes dos operadores
    let op1Name = 'Operador 1';
    let op2Name = 'Operador 2';

    if (op1Id) {
      const { data: emp1 } = await supabase.from('employees').select('full_name').eq('id', op1Id).single();
      if (emp1) op1Name = emp1.full_name;
    }
    if (op2Id) {
      const { data: emp2 } = await supabase.from('employees').select('full_name').eq('id', op2Id).single();
      if (emp2) op2Name = emp2.full_name;
    }

    // Determinar período do mês
    const [year, month] = refMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDate = `${refMonth}-01`;
    const endDate = `${refMonth}-${String(daysInMonth).padStart(2, '0')}`;

    // Buscar feriados do mês (nacionais, estaduais e municipais de Dourados-MS)
    const { data: holidayData } = await supabase
      .from('holidays')
      .select('date, description')
      .gte('date', startDate)
      .lte('date', endDate);

    const holidays = new Map<string, string>();
    holidayData?.forEach((h: any) => holidays.set(h.date, h.description));

    // Buscar batidas dos 2 operadores no mês
    const operatorIds = [op1Id, op2Id].filter(Boolean);

    let timeEntries: any[] = [];
    if (operatorIds.length > 0) {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .in('employee_id', operatorIds)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');

      if (error) throw error;
      timeEntries = data || [];
    }

    // Agrupar por data
    const entriesByDate: Record<string, { op1: any | null; op2: any | null }> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${refMonth}-${String(d).padStart(2, '0')}`;
      entriesByDate[dateStr] = { op1: null, op2: null };
    }

    for (const entry of timeEntries) {
      if (!entriesByDate[entry.date]) continue;
      if (entry.employee_id === op1Id) {
        entriesByDate[entry.date].op1 = entry;
      } else if (entry.employee_id === op2Id) {
        entriesByDate[entry.date].op2 = entry;
      }
    }

    // Calcular HE por dia
    // REGRA BUNGE FARELO: Operador 1 abre o turno (entrada), Operador 2 fecha (saída)
    // Máquina roda de E.Op1 até S.Op2 sem parar (revezamento)
    // Jornada normal = 16h40 (1000 min). Tudo acima = HE.
    const days: HEDayDetail[] = [];
    let totalOvertimeMinutes = 0;

    for (const [dateStr, { op1, op2 }] of Object.entries(entriesByDate)) {
      const dt = new Date(dateStr + 'T12:00:00');
      const dayOfWeek = DAY_NAMES_PT[dt.getDay()];
      const isSunday = dt.getDay() === 0;
      const isHoliday = holidays.has(dateStr) || isSunday;
      const holidayName = holidays.get(dateStr) || (isSunday ? 'Domingo' : null);

      // E.Op1 = primeira entrada do Op1 (quem abre o turno)
      // S.Op2 = última saída do Op2 (quem fecha o turno)
      const op1Entry = op1?.entry_time || null;  // Entrada Op1
      const op1Exit = op1?.exit_time || null;    // Saída Op1 (referência)
      const op2Entry = op2?.entry_time || null;  // Entrada Op2 (referência)
      const op2Exit = op2?.exit_time || null;    // Saída Op2

      let machineStart: string | null = null;
      let machineEnd: string | null = null;
      let machineMinutes = 0;
      let overtimeMinutes = 0;

      // Em feriados/domingos: TODAS as horas trabalhadas = hora extra (normal = 0)
      const effectiveNormalMinutes = isHoliday ? 0 : normalShiftMinutes;

      // Máquina liga = E.Op1, Máquina desliga = S.Op2
      if (op1Entry && op2Exit) {
        const startMin = toMinutes(op1Entry);
        const endMin = toMinutes(op2Exit);

        machineStart = op1Entry;
        machineEnd = op2Exit;

        if (endMin >= startMin) {
          machineMinutes = endMin - startMin;
        } else {
          machineMinutes = (1440 - startMin) + endMin; // virada de dia
        }

        overtimeMinutes = Math.max(0, machineMinutes - effectiveNormalMinutes);
      } else if (op1Entry && op1Exit && !op2Exit) {
        // Só Op1 trabalhou nesse dia (sem Op2)
        const startMin = toMinutes(op1Entry);
        const endMin = toMinutes(op1Exit);
        machineStart = op1Entry;
        machineEnd = op1Exit;
        machineMinutes = endMin >= startMin ? endMin - startMin : (1440 - startMin) + endMin;
        overtimeMinutes = Math.max(0, machineMinutes - effectiveNormalMinutes);
      } else if (op2Entry && op2Exit && !op1Entry) {
        // Só Op2 trabalhou nesse dia (sem Op1)
        const startMin = toMinutes(op2Entry);
        const endMin = toMinutes(op2Exit);
        machineStart = op2Entry;
        machineEnd = op2Exit;
        machineMinutes = endMin >= startMin ? endMin - startMin : (1440 - startMin) + endMin;
        overtimeMinutes = Math.max(0, machineMinutes - effectiveNormalMinutes);
      }

      totalOvertimeMinutes += overtimeMinutes;

      days.push({
        date: dateStr,
        dayOfWeek,
        op1_entry: op1Entry,
        op1_exit: op1Exit,
        op2_entry: op2Entry,
        op2_exit: op2Exit,
        machine_start: machineStart,
        machine_end: machineEnd,
        machine_minutes: machineMinutes,
        normal_minutes: effectiveNormalMinutes,
        overtime_minutes: overtimeMinutes,
        isHoliday,
        holidayName: holidayName || null,
      });
    }

    const totalHours = totalOvertimeMinutes / 60;
    const totalValue = totalHours * ratePerHour;

    return {
      days,
      totalOvertimeMinutes,
      totalOvertimeHours: minutesToHHMM(totalOvertimeMinutes),
      ratePerHour,
      totalValue: Math.round(totalValue * 100) / 100,
      operator1Name: op1Name,
      operator2Name: op2Name,
      normalShiftMinutes,
      month: String(month).padStart(2, '0'),
      year: String(year),
    };
  }

  async gerarHoraExtra(contractId: string, refMonth: string): Promise<BungeBilling> {
    // Verificar duplicidade
    const existente = await this.verificarDuplicidade(contractId, 'HE', refMonth);
    if (existente) {
      throw new Error(`Já existe faturamento de HE para ${formatMonthYear(refMonth)} (${existente.billing_number}). Status: ${existente.status}`);
    }

    // Calcular HE
    const heCalc = await this.calcularHE(contractId, refMonth);

    if (heCalc.totalOvertimeMinutes === 0) {
      throw new Error(`Nenhuma hora extra encontrada para ${formatMonthYear(refMonth)}.`);
    }

    const numero = await this.gerarNumero('HE');

    // Criar faturamento
    const { data: billing, error: billingError } = await supabase
      .from('bunge_billings')
      .insert({
        contract_id: contractId,
        billing_number: numero,
        billing_type: 'HE',
        reference_month: refMonth,
        reference_period: `HE Farelo - ${formatMonthYear(refMonth)}`,
        subtotal: heCalc.totalValue,
        discount: 0,
        total: heCalc.totalValue,
        status: 'GERADO',
      })
      .select()
      .single();

    if (billingError) throw billingError;

    // Buscar item HE do contrato para pegar asset_id
    const itensHE = await this.listarItensContrato(contractId, 'HE');
    const itemHE = itensHE[0] || null;

    // Criar item do faturamento
    const { error: itemError } = await supabase
      .from('bunge_billing_items')
      .insert({
        billing_id: billing.id,
        contract_item_id: itemHE?.id || null,
        asset_id: itemHE?.asset_id || null,
        equipment_description: itemHE?.equipment_description || 'L-60F (Farelo)',
        quantity: 1,
        unit_label: 'hora',
        unit_value: heCalc.ratePerHour,
        total_value: heCalc.totalValue,
        he_total_minutes: heCalc.totalOvertimeMinutes,
        he_total_hours_display: heCalc.totalOvertimeHours,
        he_details: heCalc.days as any,
        sort_order: 1,
        notes: `Op1: ${heCalc.operator1Name} | Op2: ${heCalc.operator2Name} | Jornada normal: ${minutesToHHMM(heCalc.normalShiftMinutes)}`,
      });

    if (itemError) throw itemError;

    return billing;
  }

  /**
   * Gerar HE com dados já editados pelo usuário (não recalcula do ponto)
   */
  async gerarHoraExtraComDados(contractId: string, refMonth: string, heCalc: HECalcResult): Promise<BungeBilling> {
    const existente = await this.verificarDuplicidade(contractId, 'HE', refMonth);
    if (existente) {
      throw new Error(`Já existe faturamento de HE para ${formatMonthYear(refMonth)}.`);
    }

    if (heCalc.totalOvertimeMinutes === 0) {
      throw new Error('Nenhuma hora extra nos dados editados.');
    }

    const numero = await this.gerarNumero('HE');

    const { data: billing, error: billingError } = await supabase
      .from('bunge_billings')
      .insert({
        contract_id: contractId,
        billing_number: numero,
        billing_type: 'HE',
        reference_month: refMonth,
        reference_period: `HE Farelo - ${formatMonthYear(refMonth)}`,
        subtotal: heCalc.totalValue,
        discount: 0,
        total: heCalc.totalValue,
        status: 'GERADO',
      })
      .select()
      .single();

    if (billingError) throw billingError;

    // Buscar item HE do contrato para asset_id
    const itensHE = await this.listarItensContrato(contractId, 'HE');
    const itemHE = itensHE[0] || null;

    const { error: itemError } = await supabase
      .from('bunge_billing_items')
      .insert({
        billing_id: billing.id,
        contract_item_id: itemHE?.id || null,
        asset_id: itemHE?.asset_id || null,
        equipment_description: itemHE?.equipment_description || 'L-60F (Farelo)',
        quantity: 1,
        unit_label: 'hora',
        unit_value: heCalc.ratePerHour,
        total_value: heCalc.totalValue,
        he_total_minutes: heCalc.totalOvertimeMinutes,
        he_total_hours_display: heCalc.totalOvertimeHours,
        he_details: heCalc.days as any,
        sort_order: 1,
        notes: `Op1: ${heCalc.operator1Name} | Op2: ${heCalc.operator2Name} | Jornada: ${minutesToHHMM(heCalc.normalShiftMinutes)} | Dados editados manualmente`,
      });

    if (itemError) throw itemError;

    return billing;
  }

  // ============================================================
  // GERAR LOCAÇÃO
  // ============================================================

  async gerarLocacao(contractId: string, refMonth: string, itens: LocacaoItemInput[]): Promise<BungeBilling> {
    // Verificar duplicidade
    const existente = await this.verificarDuplicidade(contractId, 'LOCACAO', refMonth);
    if (existente) {
      throw new Error(`Já existe faturamento de LOCAÇÃO para ${formatMonthYear(refMonth)} (${existente.billing_number}). Status: ${existente.status}`);
    }

    if (itens.length === 0) {
      throw new Error('Nenhum item de locação informado.');
    }

    const subtotal = itens.reduce((sum, item) => sum + (item.quantity * item.unit_value), 0);
    const numero = await this.gerarNumero('LOCACAO');

    // Criar faturamento
    const { data: billing, error: billingError } = await supabase
      .from('bunge_billings')
      .insert({
        contract_id: contractId,
        billing_number: numero,
        billing_type: 'LOCACAO',
        reference_month: refMonth,
        reference_period: `Locação - ${formatMonthYear(refMonth)}`,
        subtotal,
        discount: 0,
        total: subtotal,
        status: 'GERADO',
      })
      .select()
      .single();

    if (billingError) throw billingError;

    // Criar itens
    const billingItems = itens.map((item, idx) => ({
      billing_id: billing.id,
      contract_item_id: item.contract_item_id,
      asset_id: item.asset_id || null,
      equipment_description: item.equipment_description,
      quantity: item.quantity,
      unit_label: item.unit_label,
      unit_value: item.unit_value,
      total_value: Math.round(item.quantity * item.unit_value * 100) / 100,
      sort_order: idx + 1,
    }));

    const { error: itemsError } = await supabase
      .from('bunge_billing_items')
      .insert(billingItems);

    if (itemsError) throw itemsError;

    return billing;
  }

  // ============================================================
  // ATUALIZAR STATUS / DESCONTO
  // ============================================================

  async atualizarFaturamento(billingId: string, updates: Partial<BungeBilling>): Promise<BungeBilling> {
    const { data, error } = await supabase
      .from('bunge_billings')
      .update(updates)
      .eq('id', billingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async cancelarFaturamento(billingId: string): Promise<void> {
    await this.atualizarFaturamento(billingId, { status: 'CANCELADO' });
  }

  /**
   * Exclui um faturamento e seus itens do banco.
   * Só permite excluir se status for RASCUNHO, GERADO ou ENVIADO.
   * Faturamentos já FATURADOS/RECEBIDOS não podem ser excluídos.
   */
  async excluirFaturamento(billingId: string): Promise<void> {
    const billing = await this.obterFaturamento(billingId);
    if (!billing) throw new Error('Faturamento não encontrado.');

    if (billing.status === 'FATURADO' || billing.status === 'RECEBIDO') {
      throw new Error('Não é possível excluir um faturamento já faturado. Cancele primeiro se necessário.');
    }

    // Excluir itens primeiro (FK)
    const { error: itemsErr } = await supabase
      .from('bunge_billing_items')
      .delete()
      .eq('billing_id', billingId);
    if (itemsErr) throw new Error(`Erro ao excluir itens: ${itemsErr.message}`);

    // Excluir faturamento
    const { error: billingErr } = await supabase
      .from('bunge_billings')
      .delete()
      .eq('id', billingId);
    if (billingErr) throw new Error(`Erro ao excluir faturamento: ${billingErr.message}`);
  }

  // ============================================================
  // FATURAR → CONTAS A RECEBER
  // ============================================================

  async faturar(billingId: string): Promise<string> {
    const billing = await this.obterFaturamento(billingId);
    if (!billing) throw new Error('Faturamento não encontrado.');

    if (billing.status === 'FATURADO' || billing.status === 'RECEBIDO') {
      throw new Error('Este faturamento já foi faturado.');
    }

    // Buscar contrato para pegar client_id
    const { data: contract } = await supabase
      .from('bunge_contracts')
      .select('client_id, client_name')
      .eq('id', billing.contract_id)
      .single();

    if (!contract) throw new Error('Contrato não encontrado.');

    // Determinar categoria
    const categoriaMap: Record<string, string> = {
      'MENSALIDADE': 'MENSALIDADE BUNGE',
      'HE': 'HORA EXTRA BUNGE',
      'LOCACAO': 'LOCAÇÃO BUNGE',
    };

    // Criar conta a receber
    const contaReceber = {
      numero_titulo: billing.billing_number,
      cliente_id: contract.client_id || '',
      cliente_nome: contract.client_name,
      valor_original: billing.total,
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: this.calcularVencimento(billing.reference_month),
      categoria: categoriaMap[billing.billing_type] || 'FATURAMENTO BUNGE',
      descricao: `${billing.billing_type} - ${formatMonthYear(billing.reference_month)} - Bunge Alimentos S.A.`,
      status: 'PENDENTE' as const,
      observacao: `Origem: Módulo Faturamento Bunge | Nº ${billing.billing_number}`,
    };

    const { data: novaContaReceber, error: crError } = await supabase
      .from('contas_receber')
      .insert(contaReceber)
      .select()
      .single();

    if (crError) throw crError;

    // Atualizar billing com referência e status
    await this.atualizarFaturamento(billingId, {
      status: 'FATURADO',
      conta_receber_id: novaContaReceber.id,
    });

    return novaContaReceber.id;
  }

  private calcularVencimento(refMonth: string): string {
    // Vencimento no dia 15 do mês seguinte ao de referência
    const [year, month] = refMonth.split('-').map(Number);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    return `${nextYear}-${String(nextMonth).padStart(2, '0')}-15`;
  }

  // ============================================================
  // DASHBOARD STATS
  // ============================================================

  async obterStats(contractId?: string): Promise<{
    totalMes: number;
    totalMensalidade: number;
    totalHE: number;
    totalLocacao: number;
    countGerados: number;
    countFaturados: number;
    countPendentes: number;
  }> {
    const mesAtual = new Date().toISOString().slice(0, 7);

    let query = supabase
      .from('bunge_billings')
      .select('*')
      .neq('status', 'CANCELADO');

    if (contractId) query = query.eq('contract_id', contractId);

    const { data: billings } = await query;
    const list = billings || [];

    const doMes = list.filter(b => b.reference_month === mesAtual);

    return {
      totalMes: doMes.reduce((s, b) => s + b.total, 0),
      totalMensalidade: doMes.filter(b => b.billing_type === 'MENSALIDADE').reduce((s, b) => s + b.total, 0),
      totalHE: doMes.filter(b => b.billing_type === 'HE').reduce((s, b) => s + b.total, 0),
      totalLocacao: doMes.filter(b => b.billing_type === 'LOCACAO').reduce((s, b) => s + b.total, 0),
      countGerados: list.filter(b => b.status === 'GERADO').length,
      countFaturados: list.filter(b => b.status === 'FATURADO' || b.status === 'RECEBIDO').length,
      countPendentes: list.filter(b => b.status === 'RASCUNHO' || b.status === 'GERADO' || b.status === 'ENVIADO').length,
    };
  }
}

export const bungeService = new BungeService();
export default bungeService;
