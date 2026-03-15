import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Download, DollarSign, Calculator, AlertTriangle, CheckCircle, Save, Users, Edit3, RotateCcw, Trash2, RefreshCw, PlusCircle } from 'lucide-react';
import { bungeService, BungeContractItem, BungeBilling, BungeBillingItem, HECalcResult, HEDayDetail, formatCurrency, formatMonthYear } from '../../services/bungeService';
import { exportHEPDF, exportBillingXLS } from '../../services/bungeExportService';
import FaturarModal from './FaturarModal';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const DAY_NAMES_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Props {
  contractId: string | null;
}

// Normaliza horário: "HH:MM:SS" → "HH:MM", "5:30" → "05:30", etc.
function normalizeTime(val: string | null | undefined): string {
  if (!val || val === '' || val === '-') return '';
  const str = String(val).trim();
  // HH:MM:SS → HH:MM
  if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str.slice(0, 5);
  // HH:MM
  if (/^\d{2}:\d{2}$/.test(str)) return str;
  // H:MM → 0H:MM
  if (/^\d{1}:\d{2}$/.test(str)) return `0${str}`;
  // HHMM → HH:MM
  if (/^\d{4}$/.test(str)) return `${str.slice(0, 2)}:${str.slice(2)}`;
  return str;
}

// Helper: recalcular HE de um dia editado
// REGRA BUNGE: Máquina = E.Op1 até S.Op2 (revezamento)
// Em feriados/domingos: TODAS as horas = HE (jornada normal = 0)
function recalcDay(day: HEDayDetail, normalMinutes: number): HEDayDetail {
  const toMin = (t: string | null) => {
    if (!t) return 0;
    const clean = normalizeTime(t);
    if (!clean) return 0;
    const [h, m] = clean.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  let machineStart: string | null = null;
  let machineEnd: string | null = null;
  let machineMinutes = 0;
  let overtimeMinutes = 0;

  // Em feriado/domingo, jornada normal = 0 (tudo vira HE)
  const effectiveNormal = day.isHoliday ? 0 : normalMinutes;

  // Máquina liga = E.Op1, Máquina desliga = S.Op2
  if (day.op1_entry && day.op2_exit) {
    const startMin = toMin(day.op1_entry);
    const endMin = toMin(day.op2_exit);
    machineStart = normalizeTime(day.op1_entry) || day.op1_entry;
    machineEnd = normalizeTime(day.op2_exit) || day.op2_exit;
    machineMinutes = endMin >= startMin ? endMin - startMin : (1440 - startMin) + endMin;
    overtimeMinutes = Math.max(0, machineMinutes - effectiveNormal);
  } else if (day.op1_entry && day.op1_exit && !day.op2_exit) {
    const startMin = toMin(day.op1_entry);
    const endMin = toMin(day.op1_exit);
    machineStart = normalizeTime(day.op1_entry) || day.op1_entry;
    machineEnd = normalizeTime(day.op1_exit) || day.op1_exit;
    machineMinutes = endMin >= startMin ? endMin - startMin : (1440 - startMin) + endMin;
    overtimeMinutes = Math.max(0, machineMinutes - effectiveNormal);
  } else if (day.op2_entry && day.op2_exit && !day.op1_entry) {
    const startMin = toMin(day.op2_entry);
    const endMin = toMin(day.op2_exit);
    machineStart = normalizeTime(day.op2_entry) || day.op2_entry;
    machineEnd = normalizeTime(day.op2_exit) || day.op2_exit;
    machineMinutes = endMin >= startMin ? endMin - startMin : (1440 - startMin) + endMin;
    overtimeMinutes = Math.max(0, machineMinutes - effectiveNormal);
  }

  return {
    ...day,
    machine_start: machineStart,
    machine_end: machineEnd,
    machine_minutes: machineMinutes,
    normal_minutes: effectiveNormal,
    overtime_minutes: overtimeMinutes,
  };
}

// Preencher todos os dias do mês, incluindo dias sem dados (para mostrar na tabela)
async function fillAllDaysOfMonthAsync(refMonth: string, existingDays: HEDayDetail[], normalMinutes: number): Promise<HEDayDetail[]> {
  const [year, month] = refMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Buscar feriados do mês
  const startDate = `${refMonth}-01`;
  const endDate = `${refMonth}-${String(daysInMonth).padStart(2, '0')}`;
  let holidays = new Map<string, string>();
  try {
    const { data: hol } = await supabase
      .from('holidays')
      .select('date, description')
      .gte('date', startDate)
      .lte('date', endDate);
    hol?.forEach((h: any) => holidays.set(h.date, h.description));
  } catch { /* ignore */ }

  // Mapear dias existentes por data
  const existing = new Map(existingDays.map(d => [d.date, d]));

  const allDays: HEDayDetail[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${refMonth}-${String(d).padStart(2, '0')}`;
    if (existing.has(dateStr)) {
      allDays.push(existing.get(dateStr)!);
    } else {
      const dt = new Date(dateStr + 'T12:00:00');
      const dayOfWeek = DAY_NAMES_PT[dt.getDay()];
      const isSunday = dt.getDay() === 0;
      const holidayName = holidays.get(dateStr) || (isSunday ? 'Domingo' : null);
      const isHoliday = isSunday || holidays.has(dateStr);
      allDays.push({
        date: dateStr,
        dayOfWeek,
        op1_entry: null,
        op1_exit: null,
        op2_entry: null,
        op2_exit: null,
        machine_start: null,
        machine_end: null,
        machine_minutes: 0,
        normal_minutes: isHoliday ? 0 : normalMinutes,
        overtime_minutes: 0,
        isHoliday,
        holidayName,
      });
    }
  }
  return allDays;
}

// Versão síncrona (para uso imediato, sem buscar feriados do banco)
function fillAllDaysOfMonth(refMonth: string, existingDays: HEDayDetail[], normalMinutes: number): HEDayDetail[] {
  const [year, month] = refMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const existing = new Map(existingDays.map(d => [d.date, d]));

  // Extrair feriados dos dias existentes (se já vêm com isHoliday)
  const knownHolidays = new Map<string, string>();
  existingDays.forEach(d => {
    if (d.isHoliday && d.holidayName) knownHolidays.set(d.date, d.holidayName);
  });

  const allDays: HEDayDetail[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${refMonth}-${String(d).padStart(2, '0')}`;
    if (existing.has(dateStr)) {
      allDays.push(existing.get(dateStr)!);
    } else {
      const dt = new Date(dateStr + 'T12:00:00');
      const dayOfWeek = DAY_NAMES_PT[dt.getDay()];
      const isSunday = dt.getDay() === 0;
      const holidayName = knownHolidays.get(dateStr) || (isSunday ? 'Domingo' : null);
      const isHoliday = isSunday || knownHolidays.has(dateStr);
      allDays.push({
        date: dateStr,
        dayOfWeek,
        op1_entry: null,
        op1_exit: null,
        op2_entry: null,
        op2_exit: null,
        machine_start: null,
        machine_end: null,
        machine_minutes: 0,
        normal_minutes: isHoliday ? 0 : normalMinutes,
        overtime_minutes: 0,
        isHoliday,
        holidayName,
      });
    }
  }
  return allDays;
}

const HoraExtraTab: React.FC<Props> = ({ contractId }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  });

  const [heCalc, setHeCalc] = useState<HECalcResult | null>(null);
  const [editedDays, setEditedDays] = useState<HEDayDetail[]>([]);
  const [hasEdits, setHasEdits] = useState(false);
  const [existingBilling, setExistingBilling] = useState<BungeBilling | null>(null);
  const [billingItems, setBillingItems] = useState<BungeBillingItem[]>([]);
  const [heItem, setHeItem] = useState<BungeContractItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editMode, setEditMode] = useState(false); // Permite editar ponto mesmo com billing existente
  const [showFaturarModal, setShowFaturarModal] = useState(false);
  // Set de datas que originalmente tinham dados (para não sumir ao editar)
  const originalDaysWithData = useRef<Set<string>>(new Set());

  // Operadores
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [op1Id, setOp1Id] = useState<string>('');
  const [op2Id, setOp2Id] = useState<string>('');
  const [savingOperators, setSavingOperators] = useState(false);

  useEffect(() => { loadEmployees(); }, []);
  useEffect(() => { if (contractId) loadData(); }, [contractId, selectedMonth]);

  const loadEmployees = async () => {
    try {
      const emps = await bungeService.listarFuncionarios();
      setEmployees(emps);
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err);
    }
  };

  const loadData = async () => {
    if (!contractId) return;
    setLoading(true);
    try {
      const [itensHE, existing] = await Promise.all([
        bungeService.listarItensContrato(contractId, 'HE'),
        bungeService.verificarDuplicidade(contractId, 'HE', selectedMonth),
      ]);

      const item = itensHE[0] || null;
      setHeItem(item);
      if (item) {
        setOp1Id(item.operator1_employee_id || '');
        setOp2Id(item.operator2_employee_id || '');
      }

      setExistingBilling(existing);

      if (existing) {
        const bItems = await bungeService.listarItensFaturamento(existing.id);
        setBillingItems(bItems);
        if (bItems[0]?.he_details) {
          const savedDays = bItems[0].he_details as HEDayDetail[];
          // Preencher todos os dias do mês (mesmo os sem dados)
          const fullDays = await fillAllDaysOfMonthAsync(selectedMonth, savedDays, item?.he_normal_shift_minutes || 1000);
          setHeCalc({
            days: fullDays,
            totalOvertimeMinutes: bItems[0].he_total_minutes || 0,
            totalOvertimeHours: bItems[0].he_total_hours_display || '00:00',
            ratePerHour: bItems[0].unit_value,
            totalValue: bItems[0].total_value,
            operator1Name: '', operator2Name: '',
            normalShiftMinutes: item?.he_normal_shift_minutes || 1000,
            month: selectedMonth.split('-')[1],
            year: selectedMonth.split('-')[0],
          });
          setEditedDays(fullDays);
          // Registrar dias que originalmente tinham dados
          originalDaysWithData.current = new Set(
            savedDays.filter(d => d.op1_entry || d.op2_entry || d.machine_minutes > 0).map(d => d.date)
          );
        }
      } else {
        setBillingItems([]);
        setHeCalc(null);
        setEditedDays([]);
        originalDaysWithData.current = new Set();
      }
      setHasEdits(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOperators = async () => {
    if (!heItem) return;
    if (!op1Id || !op2Id) { toast.error('Selecione os 2 operadores'); return; }
    if (op1Id === op2Id) { toast.error('Os operadores devem ser diferentes'); return; }
    setSavingOperators(true);
    try {
      await bungeService.atualizarItemContrato(heItem.id, {
        operator1_employee_id: op1Id, operator2_employee_id: op2Id,
      } as any);
      toast.success('Operadores salvos!');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar operadores');
    } finally {
      setSavingOperators(false);
    }
  };

  const handleCalcular = async () => {
    if (!contractId) return;
    if (!op1Id || !op2Id) { toast.error('Selecione os 2 operadores antes de calcular'); return; }
    setCalculating(true);
    try {
      const calc = await bungeService.calcularHE(contractId, selectedMonth);
      setHeCalc(calc);
      setEditedDays([...calc.days]);
      // Registrar dias originais
      originalDaysWithData.current = new Set(
        calc.days.filter(d => d.op1_entry || d.op2_entry || d.machine_minutes > 0).map(d => d.date)
      );
      setHasEdits(false);
      toast.success(`HE calculada: ${calc.totalOvertimeHours} = ${formatCurrency(calc.totalValue)}`);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao calcular HE');
    } finally {
      setCalculating(false);
    }
  };

  // Edição de um campo de horário na tabela (via input type="time")
  const handleEditDay = useCallback((dayIdx: number, field: keyof HEDayDetail, value: string) => {
    const normalMinutes = heItem?.he_normal_shift_minutes || 1000;
    setEditedDays(prev => {
      const updated = [...prev];
      // Normalizar: type="time" retorna "HH:MM" ou "" (vazio)
      const normalized = value ? normalizeTime(value) : null;
      const day = { ...updated[dayIdx], [field]: normalized || null };
      updated[dayIdx] = recalcDay(day, normalMinutes);
      return updated;
    });
    setHasEdits(true);
  }, [heItem]);

  // Resetar edições
  const handleResetEdits = () => {
    if (heCalc) {
      setEditedDays([...heCalc.days]);
      setHasEdits(false);
    }
  };

  // Totais calculados a partir dos dias editados
  const editedTotalMinutes = editedDays.reduce((s, d) => s + d.overtime_minutes, 0);
  const editedTotalHours = `${String(Math.floor(editedTotalMinutes / 60)).padStart(2, '0')}:${String(editedTotalMinutes % 60).padStart(2, '0')}`;
  const ratePerHour = heItem?.he_rate_per_hour || 165;
  const editedTotalValue = Math.round((editedTotalMinutes / 60) * ratePerHour * 100) / 100;

  const handleGerar = async () => {
    if (!contractId || !heCalc) return;
    setGenerating(true);
    try {
      const finalCalc: HECalcResult = {
        ...heCalc,
        days: editedDays,
        totalOvertimeMinutes: editedTotalMinutes,
        totalOvertimeHours: editedTotalHours,
        totalValue: editedTotalValue,
      };

      const existente = await bungeService.verificarDuplicidade(contractId, 'HE', selectedMonth);
      if (existente) {
        toast.error(`Já existe HE para ${formatMonthYear(selectedMonth)}`);
        setGenerating(false);
        return;
      }

      const billing = await bungeService.gerarHoraExtraComDados(contractId, selectedMonth, finalCalc);
      toast.success(`HE gerada! ${billing.billing_number} — ${formatCurrency(billing.total)}`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar HE');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!existingBilling) return;
    try {
      exportHEPDF(existingBilling, billingItems, heCalc || undefined);
      toast.success('PDF exportado!');
    } catch (err) { toast.error('Erro ao exportar PDF'); }
  };

  const handleExportXLS = async () => {
    if (!existingBilling) return;
    try { await exportBillingXLS(existingBilling, billingItems); toast.success('XLS exportado!'); }
    catch (err) { toast.error('Erro ao exportar XLS'); }
  };

  const handleFaturar = async (anexos: { pedido_compra: string | null; nota_fiscal: string | null; nota_locacao: string | null; }) => {
    if (!existingBilling) return;
    try {
      await bungeService.faturar(existingBilling.id, anexos);
      toast.success('Faturado! Conta a receber criada.');
      setShowFaturarModal(false);
      await loadData();
    } catch (err: any) { toast.error(err.message || 'Erro ao faturar'); }
  };

  const handleExcluir = async () => {
    if (!existingBilling) return;
    setDeleting(true);
    try {
      await bungeService.excluirFaturamento(existingBilling.id);
      toast.success('Faturamento excluído! Agora você pode editar e gerar novamente.');
      setConfirmDelete(false);
      setEditMode(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir');
    } finally {
      setDeleting(false);
    }
  };

  // Recalcular e atualizar faturamento existente com dados editados
  const handleAtualizarBilling = async () => {
    if (!existingBilling || !contractId || !heCalc) return;
    setGenerating(true);
    try {
      // Primeiro excluir o billing antigo
      await bungeService.excluirFaturamento(existingBilling.id);

      // Gerar novo com dados editados
      const finalCalc: HECalcResult = {
        ...heCalc,
        days: editedDays,
        totalOvertimeMinutes: editedTotalMinutes,
        totalOvertimeHours: editedTotalHours,
        totalValue: editedTotalValue,
      };

      const billing = await bungeService.gerarHoraExtraComDados(contractId, selectedMonth, finalCalc);
      toast.success(`HE atualizada! ${billing.billing_number} — ${formatCurrency(billing.total)}`);
      setEditMode(false);
      setHasEdits(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar');
    } finally {
      setGenerating(false);
    }
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Mostrar TODOS os dias do mês (editedDays já vem com todos os dias do calcularHE)
  const daysToShow = editedDays;

  const op1Name = employees.find(e => e.id === op1Id)?.full_name || '';
  const op2Name = employees.find(e => e.id === op2Id)?.full_name || '';

  return (
    <div className="space-y-6">
      {/* Info do item HE */}
      {heItem && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-6 text-sm">
          <div>
            <span className="text-slate-500 text-xs font-bold">Equipamento:</span>
            <p className="text-white font-bold">{heItem.equipment_description}</p>
          </div>
          <div>
            <span className="text-slate-500 text-xs font-bold">Valor/hora:</span>
            <p className="text-emerald-400 font-black">{formatCurrency(heItem.he_rate_per_hour || 0)}</p>
          </div>
          <div>
            <span className="text-slate-500 text-xs font-bold">Jornada normal:</span>
            <p className="text-white font-bold">{heItem.he_normal_shift_minutes ? `${Math.floor(heItem.he_normal_shift_minutes / 60)}h${String(heItem.he_normal_shift_minutes % 60).padStart(2, '0')}min` : '-'}</p>
          </div>
        </div>
      )}

      {/* Seleção de Operadores */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-blue-400" />
          <h4 className="text-sm font-black text-white uppercase tracking-widest">Operadores (Revezamento)</h4>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Selecione os 2 operadores que revezam na máquina. A HE é calculada pela entrada do Op1 e saída do Op2.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operador 1 (Entrada)</label>
            <select
              value={op1Id}
              onChange={(e) => setOp1Id(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none"
            >
              <option value="">Selecione...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operador 2 (Saída)</label>
            <select
              value={op2Id}
              onChange={(e) => setOp2Id(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none"
            >
              <option value="">Selecione...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>
        </div>
        {(op1Id !== (heItem?.operator1_employee_id || '') || op2Id !== (heItem?.operator2_employee_id || '')) && op1Id && op2Id && (
          <div className="mt-4">
            <button onClick={handleSaveOperators} disabled={savingOperators}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all flex items-center gap-2 disabled:opacity-50">
              <Save size={16} /> {savingOperators ? 'Salvando...' : 'Salvar Operadores'}
            </button>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mês de Referência</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-blue-500 outline-none">
            {monthOptions.map(m => <option key={m} value={m}>{formatMonthYear(m)}</option>)}
          </select>
        </div>

        {!existingBilling && (
          <>
            <button onClick={handleCalcular} disabled={calculating || !contractId || !op1Id || !op2Id}
              className="bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-600 transition-all flex items-center gap-2 disabled:opacity-50">
              <Calculator size={18} /> {calculating ? 'Calculando...' : 'Importar Ponto'}
            </button>
            {editedDays.length > 0 && editedTotalMinutes > 0 && (
              <button onClick={handleGerar} disabled={generating}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center gap-2 disabled:opacity-50">
                <Clock size={18} /> {generating ? 'Gerando...' : 'Gerar Faturamento HE'}
              </button>
            )}
          </>
        )}

        {existingBilling && (
          <>
            <button onClick={handleExportPDF}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-500 transition-all flex items-center gap-2">
              <Download size={18} /> Exportar PDF
            </button>
            <button onClick={handleExportXLS}
              className="bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-600 transition-all flex items-center gap-2">
              <Download size={18} /> XLS
            </button>
            {existingBilling.status !== 'FATURADO' && existingBilling.status !== 'RECEBIDO' && (
              <>
                <button onClick={() => setShowFaturarModal(true)}
                  className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-500 transition-all flex items-center gap-2">
                  <DollarSign size={18} /> Faturar
                </button>

                {/* Editar ponto do billing existente */}
                {!editMode ? (
                  <button onClick={() => setEditMode(true)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all flex items-center gap-2">
                    <Edit3 size={18} /> Editar Ponto
                  </button>
                ) : (
                  <>
                    <button onClick={handleAtualizarBilling} disabled={generating || !hasEdits}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-600/30">
                      <RefreshCw size={18} /> {generating ? 'Atualizando...' : 'Atualizar Faturamento'}
                    </button>
                    <button onClick={() => { setEditMode(false); setHasEdits(false); loadData(); }}
                      className="bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-600 transition-all">
                      Cancelar
                    </button>
                  </>
                )}

                {/* Excluir billing */}
                {!confirmDelete ? (
                  <button onClick={() => setConfirmDelete(true)}
                    className="bg-red-600/20 text-red-400 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-600/30 border border-red-500/30 transition-all flex items-center gap-2">
                    <Trash2 size={16} /> Excluir
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
                    <span className="text-xs text-red-300 font-bold">Tem certeza?</span>
                    <button onClick={handleExcluir} disabled={deleting}
                      className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500 disabled:opacity-50">
                      {deleting ? 'Excluindo...' : 'Sim, excluir'}
                    </button>
                    <button onClick={() => setConfirmDelete(false)}
                      className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1.5">
                      Não
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Status do billing existente */}
      {existingBilling && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          existingBilling.status === 'FATURADO' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-blue-500/10 border border-blue-500/30'
        }`}>
          {existingBilling.status === 'FATURADO' ? <CheckCircle size={20} className="text-emerald-400" /> : <AlertTriangle size={20} className="text-blue-400" />}
          <div>
            <p className="text-sm font-bold text-white">{existingBilling.billing_number} — {existingBilling.status}</p>
            <p className="text-xs text-slate-400">Total: {formatCurrency(existingBilling.total)}</p>
          </div>
        </div>
      )}

      {/* Resumo HE (valores editados) */}
      {editedDays.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 font-black uppercase">Total HE</p>
              <p className={`text-2xl font-black ${hasEdits ? 'text-orange-400' : 'text-amber-400'}`}>
                {editedTotalHours}
                {hasEdits && <span className="text-xs ml-2 text-orange-300">(editado)</span>}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 font-black uppercase">Valor/Hora</p>
              <p className="text-2xl font-black text-white">{formatCurrency(ratePerHour)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 font-black uppercase">Valor Total</p>
              <p className={`text-2xl font-black ${hasEdits ? 'text-orange-400' : 'text-emerald-400'}`}>
                {formatCurrency(editedTotalValue)}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 font-black uppercase">Dias com HE</p>
              <p className="text-2xl font-black text-white">
                {editedDays.filter(d => d.overtime_minutes > 0).length}
                {editedDays.filter(d => d.isHoliday && d.overtime_minutes > 0).length > 0 && (
                  <span className="text-xs ml-1 text-red-400 font-bold">
                    ({editedDays.filter(d => d.isHoliday && d.overtime_minutes > 0).length} feriado{editedDays.filter(d => d.isHoliday && d.overtime_minutes > 0).length > 1 ? 's' : ''})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Legenda feriados */}
          {editedDays.some(d => d.isHoliday && d.machine_minutes > 0) && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">F</span>
              <p className="text-xs text-slate-300">
                <span className="font-bold text-red-400">Feriados/Domingos:</span> Todas as horas trabalhadas contam como hora extra (jornada normal = 0).
                {' '}HE em feriado aparece em <span className="text-red-400 font-bold">vermelho</span>.
              </p>
            </div>
          )}
        </>
      )}

      {/* Botão para carregar todos os dias do mês (sem dados de ponto) */}
      {editedDays.length === 0 && !existingBilling && (
        <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-8 text-center">
          <p className="text-slate-400 text-sm mb-4">Nenhum dado carregado. Importe o ponto dos operadores ou carregue o mês manualmente.</p>
          <button
            onClick={async () => {
              const normalMinutes = heItem?.he_normal_shift_minutes || 1000;
              const allDays = await fillAllDaysOfMonthAsync(selectedMonth, [], normalMinutes);
              setEditedDays(allDays);
              toast.success(`${allDays.length} dias carregados para ${formatMonthYear(selectedMonth)}. Preencha os horários manualmente.`);
            }}
            className="bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-600 transition-all flex items-center gap-2 mx-auto"
          >
            <PlusCircle size={18} /> Carregar Mês Manual
          </button>
        </div>
      )}

      {/* Tabela editável de detalhamento diário */}
      {daysToShow.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit3 size={16} className="text-blue-400" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                Cálculo de Ponto — {(!existingBilling || editMode) ? 'Editável' : 'Visualização'}
              </h3>
              {editMode && (
                <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg">MODO EDIÇÃO</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {hasEdits && (!existingBilling || editMode) && (
                <button onClick={handleResetEdits}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                  <RotateCcw size={14} /> Resetar
                </button>
              )}
              <span className="text-xs text-slate-500 font-bold">{daysToShow.length} dias</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <th className="px-3 py-3 w-24">Data</th>
                  <th className="px-2 py-3 w-14">Dia</th>
                  <th className="px-1 py-3 text-center text-blue-400">E. Op1</th>
                  <th className="px-1 py-3 text-center text-blue-400">S. Op1</th>
                  <th className="px-1 py-3 text-center text-purple-400">E. Op2</th>
                  <th className="px-1 py-3 text-center text-purple-400">S. Op2</th>
                  <th className="px-2 py-3 text-center">Iníc.Máq</th>
                  <th className="px-2 py-3 text-center">Fim Máq</th>
                  <th className="px-2 py-3 text-center">Hrs Máq</th>
                  <th className="px-2 py-3 text-right">HE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {daysToShow.map((d, idx) => {
                  // Encontrar índice real no editedDays (para handleEditDay)
                  const realIdx = editedDays.findIndex(ed => ed.date === d.date);
                  const machineHrs = d.machine_minutes > 0 ? `${Math.floor(d.machine_minutes / 60)}:${String(d.machine_minutes % 60).padStart(2, '0')}` : '-';
                  const heHrs = d.overtime_minutes > 0 ? `${Math.floor(d.overtime_minutes / 60)}:${String(d.overtime_minutes % 60).padStart(2, '0')}` : '-';
                  const isEditable = !existingBilling || editMode;
                  const hasData = d.op1_entry || d.op2_entry || d.op1_exit || d.op2_exit || d.machine_minutes > 0;

                  return (
                    <tr key={d.date} className={`hover:bg-slate-800/30 transition-colors ${!hasData ? 'opacity-40' : d.overtime_minutes > 0 ? '' : 'opacity-60'} ${d.isHoliday ? 'bg-red-500/5' : ''}`}>
                      <td className="px-3 py-2 text-xs text-slate-300 font-mono">
                        <div className="flex items-center gap-1">
                          {d.date.split('-').reverse().join('/')}
                          {d.isHoliday && (
                            <span className="text-[8px] font-black px-1 py-0.5 rounded bg-red-500/15 text-red-400" title={d.holidayName || 'Feriado'}>
                              F
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-xs text-slate-400">
                        {d.dayOfWeek}
                        {d.isHoliday && d.holidayName && d.holidayName !== 'Domingo' && (
                          <span className="block text-[8px] text-red-400 truncate max-w-[60px]" title={d.holidayName}>{d.holidayName}</span>
                        )}
                      </td>
                      {/* E.Op1 */}
                      <td className="px-1 py-2 text-center">
                        {isEditable ? (
                          <input
                            type="time"
                            value={normalizeTime(d.op1_entry)}
                            onChange={(e) => handleEditDay(realIdx, 'op1_entry', e.target.value)}
                            className="w-[4.5rem] bg-slate-950 border border-slate-700 rounded px-1 py-1 text-center text-xs text-white font-mono focus:border-blue-500 outline-none [&::-webkit-calendar-picker-indicator]:invert"
                          />
                        ) : (
                          <span className="text-xs text-white font-mono">{normalizeTime(d.op1_entry) || '-'}</span>
                        )}
                      </td>
                      {/* S.Op1 */}
                      <td className="px-1 py-2 text-center">
                        {isEditable ? (
                          <input
                            type="time"
                            value={normalizeTime(d.op1_exit)}
                            onChange={(e) => handleEditDay(realIdx, 'op1_exit', e.target.value)}
                            className="w-[4.5rem] bg-slate-950 border border-slate-700 rounded px-1 py-1 text-center text-xs text-white font-mono focus:border-blue-500 outline-none [&::-webkit-calendar-picker-indicator]:invert"
                          />
                        ) : (
                          <span className="text-xs text-white font-mono">{normalizeTime(d.op1_exit) || '-'}</span>
                        )}
                      </td>
                      {/* E.Op2 */}
                      <td className="px-1 py-2 text-center">
                        {isEditable ? (
                          <input
                            type="time"
                            value={normalizeTime(d.op2_entry)}
                            onChange={(e) => handleEditDay(realIdx, 'op2_entry', e.target.value)}
                            className="w-[4.5rem] bg-slate-950 border border-slate-700 rounded px-1 py-1 text-center text-xs text-white font-mono focus:border-purple-500 outline-none [&::-webkit-calendar-picker-indicator]:invert"
                          />
                        ) : (
                          <span className="text-xs text-white font-mono">{normalizeTime(d.op2_entry) || '-'}</span>
                        )}
                      </td>
                      {/* S.Op2 */}
                      <td className="px-1 py-2 text-center">
                        {isEditable ? (
                          <input
                            type="time"
                            value={normalizeTime(d.op2_exit)}
                            onChange={(e) => handleEditDay(realIdx, 'op2_exit', e.target.value)}
                            className="w-[4.5rem] bg-slate-950 border border-slate-700 rounded px-1 py-1 text-center text-xs text-white font-mono focus:border-purple-500 outline-none [&::-webkit-calendar-picker-indicator]:invert"
                          />
                        ) : (
                          <span className="text-xs text-white font-mono">{normalizeTime(d.op2_exit) || '-'}</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-center text-xs text-blue-400 font-mono">{normalizeTime(d.machine_start) || '-'}</td>
                      <td className="px-2 py-2 text-center text-xs text-blue-400 font-mono">{normalizeTime(d.machine_end) || '-'}</td>
                      <td className="px-2 py-2 text-center text-xs text-white font-bold font-mono">{machineHrs}</td>
                      <td className={`px-2 py-2 text-xs font-black font-mono text-right ${d.isHoliday && d.overtime_minutes > 0 ? 'text-red-400' : d.overtime_minutes > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                        {heHrs}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-950 border-t-2 border-slate-700">
                  <td colSpan={8} className="px-2 py-3 text-right text-xs font-black text-slate-400 uppercase">Total</td>
                  <td className="px-2 py-3 text-center text-sm font-black text-white">{
                    (() => {
                      const totalMach = editedDays.reduce((s, d) => s + d.machine_minutes, 0);
                      return `${Math.floor(totalMach / 60)}:${String(totalMach % 60).padStart(2, '0')}`;
                    })()
                  }</td>
                  <td className="px-2 py-3 text-right text-sm font-black text-amber-400">{editedTotalHours}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
      {existingBilling && (
        <FaturarModal
          isOpen={showFaturarModal}
          billingNumber={existingBilling.billing_number}
          billingType="HE"
          total={existingBilling.total}
          onConfirm={handleFaturar}
          onClose={() => setShowFaturarModal(false)}
        />
      )}
    </div>
  );
};

export default HoraExtraTab;
