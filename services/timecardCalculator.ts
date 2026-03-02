/**
 * ============================================================
 * TerraPro ERP — Engine de Cálculo Trabalhista
 * ============================================================
 *
 * Baseado no sistema Seculum 4 e nas regras da CLT:
 * - Hora extra por faixas (50%, 100%) por tipo de dia
 * - Adicional noturno (22:00-05:00, hora reduzida 52:30)
 * - DSR (Descanso Semanal Remunerado)
 * - Tolerâncias (CLT Art. 58 §1º)
 * - Banco de Horas
 *
 * Autor: Claude Code Session (16-17/02/2026)
 */

import { supabase } from '../lib/supabase';

// ============================================================
// INTERFACES
// ============================================================

export interface WorkShift {
    id: string;
    name: string;
    start_time: string;
    break_start: string;
    break_end: string;
    end_time: string;
    work_days: string[];
    schedule_by_day: Record<string, ScheduleDay | null> | null;
    tolerance_overtime: number;
    tolerance_absence: number;
    workload_type: 'daily' | 'weekly' | 'monthly';
    weekly_hours: number;
    monthly_hours: number;
    is_compensated: boolean;
    is_free_lunch: boolean;
    consider_holidays: boolean;
    deduct_late: boolean;
    add_early: boolean;
    night_shift_start: string;
    night_shift_end: string;
    night_shift_reduction: boolean;
    use_hour_bank: boolean;
}

export interface ScheduleDay {
    entrada1: string;
    saida1: string;
    entrada2: string;
    saida2: string;
    entrada3?: string;
    saida3?: string;
    is_off?: boolean;
}

export interface OvertimeRule {
    day_type: 'weekday' | 'saturday' | 'sunday' | 'holiday';
    tier1_hours: number;
    tier1_percentage: number;
    tier2_hours: number | null;
    tier2_percentage: number;
    tier3_hours: number | null;
    tier3_percentage: number | null;
    daily_limit: number | null;
}

export interface TimeEntry {
    id: string;
    employee_id: string;
    date: string; // YYYY-MM-DD
    entry_time: string | null;   // HH:MM — Entrada 1
    break_start: string | null;  // HH:MM — Saída 1 (intervalo)
    break_end: string | null;    // HH:MM — Entrada 2 (volta intervalo)
    exit_time: string | null;    // HH:MM — Saída 2
    entry_time2: string | null;  // HH:MM — Entrada 3
    break_start2: string | null; // HH:MM — Saída 3 (usando campo disponível)
    entry_time3: string | null;  // Entrada extra
    exit_time3: string | null;   // Saída extra
    is_compensated: boolean;
    is_off_day: boolean;
    justification: string | null;
    work_shift_id: string | null;
}

export interface DayCalculation {
    date: string;
    dayOfWeek: number; // 0=Dom, 1=Seg, ..., 6=Sab
    dayType: 'weekday' | 'saturday' | 'sunday' | 'holiday' | 'compensated' | 'off';
    isHoliday: boolean;
    holidayName: string | null;

    // Batidas reais
    punches: { entrada1: string; saida1: string; entrada2: string; saida2: string; entrada3?: string; saida3?: string };

    // Horário esperado do turno
    expected: ScheduleDay | null;

    // Minutos
    workedMinutes: number;          // Total trabalhado bruto
    expectedMinutes: number;        // Total esperado pelo turno
    normalMinutes: number;          // Horas normais (limitado ao esperado)
    overtimeMinutes: number;        // Horas extras brutas (acima do esperado)
    absenceMinutes: number;         // Falta (abaixo do esperado)
    nightMinutes: number;           // Minutos noturnos (22:00-05:00)
    nightReducedMinutes: number;    // Minutos noturnos com redução CLT

    // Extras por faixa
    overtimeTiers: { percentage: number; minutes: number }[];

    // Flags
    hasAbsence: boolean;
    isComplete: boolean;
    isMissing: boolean; // Dia sem nenhuma batida

    // Justificativa
    justification: string | null;
}

export interface MonthCalculation {
    employeeId: string;
    employeeName: string;
    year: number;
    month: number;
    shiftName: string;
    shiftId: string;

    // Totais em minutos
    totalWorked: number;
    totalExpected: number;
    totalNormal: number;
    totalAbsence: number;

    // Extras por tipo de dia
    overtimeWeekday: number;
    overtimeSaturday: number;
    overtimeSunday: number;
    overtimeHoliday: number;

    // Extras por faixa (para folha de pagamento)
    overtime50: number;  // Minutos a 50%
    overtime100: number; // Minutos a 100%

    // Noturno
    nightHours: number;
    nightReducedHours: number;

    // DSR
    dsrCredit: number;
    dsrDebit: number;

    // Banco de Horas
    hourBankCredit: number;
    hourBankDebit: number;
    hourBankBalance: number;

    // Contadores
    daysWorked: number;
    daysAbsent: number;
    daysHoliday: number;
    daysWeekend: number;

    // Detalhamento diário
    days: DayCalculation[];

    // Saldo
    balance: number; // Positivo = extra, negativo = falta
}

export interface AbsenceJustificationType {
    id: string;
    code: string;
    name: string;
    excuses_absence: boolean;
    affects_dsr: boolean;
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/** Converte "HH:MM" para minutos desde 00:00 */
const toMinutes = (time: string | null | undefined): number => {
    if (!time) return 0;
    const parts = time.split(':').map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
};

/** Converte minutos para "HH:MM" */
export const minutesToHHMM = (minutes: number): string => {
    const sign = minutes < 0 ? '-' : '';
    const abs = Math.abs(Math.round(minutes));
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** Calcula minutos trabalhados entre pares de entrada/saída */
const calculateWorkedMinutes = (
    e1: string | null, s1: string | null,
    e2: string | null, s2: string | null,
    e3?: string | null, s3?: string | null
): number => {
    let total = 0;

    const calc = (entrada: string | null, saida: string | null) => {
        if (!entrada || !saida) return 0;
        const e = toMinutes(entrada);
        const s = toMinutes(saida);
        if (s > e) return s - e;
        if (s < e) return (1440 - e) + s; // Virada de dia
        return 0;
    };

    total += calc(e1, s1);
    total += calc(e2, s2);
    if (e3 && s3) total += calc(e3, s3);

    return total;
};

/** Calcula minutos dentro do período noturno (22:00-05:00 CLT) */
const calculateNightMinutes = (
    e1: string | null, s1: string | null,
    e2: string | null, s2: string | null,
    e3: string | null, s3: string | null,
    nightStart: number, // em minutos (ex: 22*60 = 1320)
    nightEnd: number    // em minutos (ex: 5*60 = 300)
): number => {
    let nightMin = 0;

    const calcPeriod = (entrada: string | null, saida: string | null) => {
        if (!entrada || !saida) return 0;
        const e = toMinutes(entrada);
        let s = toMinutes(saida);
        if (s < e) s += 1440; // Virada de dia

        let mins = 0;
        // Período noturno pode cruzar meia-noite (22:00-05:00 = 1320-1740 se ajustado)
        // Dividir em dois segmentos: 22:00-23:59 e 00:00-05:00

        // Segmento 1: nightStart até 1440 (meia-noite)
        const ns1Start = nightStart;
        const ns1End = 1440;
        const overlapStart1 = Math.max(e, ns1Start);
        const overlapEnd1 = Math.min(s, ns1End);
        if (overlapEnd1 > overlapStart1) mins += overlapEnd1 - overlapStart1;

        // Segmento 2: 0 até nightEnd (no dia seguinte)
        // Se a saída cruza meia-noite
        if (s > 1440) {
            const eAdj = Math.max(0, e - 1440);
            const sAdj = s - 1440;
            const overlapStart2 = Math.max(eAdj, 0);
            const overlapEnd2 = Math.min(sAdj, nightEnd);
            if (overlapEnd2 > overlapStart2) mins += overlapEnd2 - overlapStart2;
        } else {
            // Se a entrada é antes da meia-noite, verificar também 0-nightEnd
            const overlapStart2 = Math.max(e, 0);
            const overlapEnd2 = Math.min(s, nightEnd);
            if (overlapEnd2 > overlapStart2) mins += overlapEnd2 - overlapStart2;
        }

        return mins;
    };

    nightMin += calcPeriod(e1, s1);
    nightMin += calcPeriod(e2, s2);
    if (e3 && s3) nightMin += calcPeriod(e3, s3);

    return nightMin;
};

/** Mapeia dia da semana JS (0=Dom) para key do work_days */
const dayOfWeekToKey = (dow: number): string => {
    const map: Record<number, string> = {
        0: 'Sunday', 1: 'Monday', 2: 'Tuesday',
        3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'
    };
    return map[dow];
};

/** Mapeia dia da semana JS (0=Dom) para número usado em schedule_by_day (1=Seg...7=Dom) */
const dayOfWeekToNum = (dow: number): string => {
    const map: Record<number, string> = {
        1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 0: '7'
    };
    return map[dow];
};

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/** Busca feriados de um mês/ano */
export const fetchHolidays = async (year: number, month: number): Promise<Map<string, string>> => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const { data } = await supabase
        .from('holidays')
        .select('date, description')
        .gte('date', startDate)
        .lte('date', endDate);

    const map = new Map<string, string>();
    data?.forEach((h: any) => map.set(h.date, h.description));
    return map;
};

/** Busca turno completo com overtime_rules */
export const fetchShiftWithRules = async (shiftId: string): Promise<{ shift: WorkShift; rules: OvertimeRule[] } | null> => {
    const { data: shift } = await supabase
        .from('work_shifts')
        .select('*')
        .eq('id', shiftId)
        .single();

    if (!shift) return null;

    const { data: rules } = await supabase
        .from('overtime_rules')
        .select('*')
        .eq('work_shift_id', shiftId);

    return {
        shift: shift as WorkShift,
        rules: (rules || []) as OvertimeRule[]
    };
};

/** Obtém o horário esperado para um dia da semana baseado no turno */
const getExpectedSchedule = (shift: WorkShift, dayOfWeek: number): ScheduleDay | null => {
    const dayKey = dayOfWeekToKey(dayOfWeek);
    const dayNum = dayOfWeekToNum(dayOfWeek);

    // Verifica se é dia de trabalho
    if (!shift.work_days?.includes(dayKey)) return null;

    // Se tem schedule_by_day, usa ele
    if (shift.schedule_by_day && shift.schedule_by_day[dayNum]) {
        const sched = shift.schedule_by_day[dayNum]!;
        if (sched.is_off) return null;
        return sched;
    }

    // Senão, usa horário padrão
    return {
        entrada1: shift.start_time,
        saida1: shift.break_start,
        entrada2: shift.break_end,
        saida2: shift.end_time,
    };
};

/** Determina o tipo do dia */
const getDayType = (
    date: Date,
    shift: WorkShift,
    holidays: Map<string, string>,
    entry?: TimeEntry
): { dayType: DayCalculation['dayType']; isHoliday: boolean; holidayName: string | null } => {
    const dateStr = date.toISOString().split('T')[0];
    const dow = date.getDay();

    if (entry?.is_compensated) return { dayType: 'compensated', isHoliday: false, holidayName: null };
    if (entry?.is_off_day) return { dayType: 'off', isHoliday: false, holidayName: null };

    // Verificar feriado
    if (shift.consider_holidays && holidays.has(dateStr)) {
        return { dayType: 'holiday', isHoliday: true, holidayName: holidays.get(dateStr)! };
    }

    if (dow === 0) return { dayType: 'sunday', isHoliday: false, holidayName: null };
    if (dow === 6) return { dayType: 'saturday', isHoliday: false, holidayName: null };
    return { dayType: 'weekday', isHoliday: false, holidayName: null };
};

/** Distribui minutos de extra nas faixas de overtime_rules */
const distributeOvertime = (
    overtimeMin: number,
    dayType: DayCalculation['dayType'],
    rules: OvertimeRule[]
): { percentage: number; minutes: number }[] => {
    // Encontrar regra para este tipo de dia
    const typesToCheck: string[] = [];
    if (dayType === 'weekday') typesToCheck.push('weekday');
    else if (dayType === 'saturday') typesToCheck.push('saturday', 'weekday');
    else if (dayType === 'sunday') typesToCheck.push('sunday');
    else if (dayType === 'holiday') typesToCheck.push('holiday');
    else return [{ percentage: 100, minutes: overtimeMin }]; // fallback

    const rule = rules.find(r => typesToCheck.includes(r.day_type)) ||
        rules.find(r => r.day_type === 'weekday'); // fallback

    if (!rule) return [{ percentage: 100, minutes: overtimeMin }];

    const tiers: { percentage: number; minutes: number }[] = [];
    let remaining = overtimeMin;

    // Aplicar limite diário
    if (rule.daily_limit) {
        remaining = Math.min(remaining, rule.daily_limit);
    }

    // Faixa 1
    if (remaining > 0 && rule.tier1_percentage > 0) {
        const tier1Max = rule.tier1_hours * 60; // horas → minutos
        if (tier1Max > 0) {
            const tier1Min = Math.min(remaining, tier1Max);
            tiers.push({ percentage: rule.tier1_percentage, minutes: tier1Min });
            remaining -= tier1Min;
        } else {
            // tier1_hours = 0 significa que toda extra vai nesta faixa
            tiers.push({ percentage: rule.tier1_percentage, minutes: remaining });
            remaining = 0;
        }
    }

    // Faixa 2
    if (remaining > 0 && rule.tier2_percentage > 0) {
        if (rule.tier2_hours) {
            const tier2Max = rule.tier2_hours * 60;
            const tier2Min = Math.min(remaining, tier2Max);
            tiers.push({ percentage: rule.tier2_percentage, minutes: tier2Min });
            remaining -= tier2Min;
        } else {
            tiers.push({ percentage: rule.tier2_percentage, minutes: remaining });
            remaining = 0;
        }
    }

    // Faixa 3
    if (remaining > 0 && rule.tier3_percentage) {
        tiers.push({ percentage: rule.tier3_percentage, minutes: remaining });
        remaining = 0;
    }

    // Se ainda sobrar, coloca na maior faixa
    if (remaining > 0) {
        const lastPercentage = tiers.length > 0 ? tiers[tiers.length - 1].percentage : 100;
        tiers.push({ percentage: lastPercentage, minutes: remaining });
    }

    return tiers;
};

/** Calcula um dia individual */
export const calculateDay = (
    date: Date,
    entry: TimeEntry | undefined,
    shift: WorkShift,
    rules: OvertimeRule[],
    holidays: Map<string, string>,
    justificationTypes?: AbsenceJustificationType[]
): DayCalculation => {
    const dow = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    const { dayType, isHoliday, holidayName } = getDayType(date, shift, holidays, entry);

    const expected = getExpectedSchedule(shift, dow);
    const expectedMin = expected ? calculateWorkedMinutes(
        expected.entrada1, expected.saida1,
        expected.entrada2, expected.saida2,
        expected.entrada3, expected.saida3
    ) : 0;

    // Verificar se o dia tem justificativa que abona a falta
    const entryJustification = entry?.justification || null;
    const justType = entryJustification && justificationTypes
        ? justificationTypes.find(j => j.code === entryJustification)
        : null;
    const isExcused = justType?.excuses_absence === true;
    const justAffectsDsr = justType?.affects_dsr === true;

    // Se não tem entry para este dia
    if (!entry || (!entry.entry_time && !entry.break_end)) {
        const rawAbsence = (dayType === 'weekday' || dayType === 'saturday') && expected ? expectedMin : 0;
        const rawHasAbsence = dayType === 'weekday' && expected !== null;
        const rawIsMissing = dayType === 'weekday' || (dayType === 'saturday' && expected !== null);

        return {
            date: dateStr,
            dayOfWeek: dow,
            dayType,
            isHoliday,
            holidayName,
            punches: { entrada1: '', saida1: '', entrada2: '', saida2: '' },
            expected,
            workedMinutes: 0,
            expectedMinutes: expectedMin,
            normalMinutes: isExcused ? expectedMin : 0,
            overtimeMinutes: 0,
            absenceMinutes: isExcused ? 0 : rawAbsence,
            nightMinutes: 0,
            nightReducedMinutes: 0,
            overtimeTiers: [],
            hasAbsence: isExcused ? justAffectsDsr : rawHasAbsence,
            isComplete: false,
            isMissing: isExcused ? false : rawIsMissing,
            justification: entryJustification,
        };
    }

    // Batidas reais
    const punches = {
        entrada1: entry.entry_time || '',
        saida1: entry.break_start || '',
        entrada2: entry.break_end || '',
        saida2: entry.exit_time || '',
        entrada3: entry.entry_time2 || undefined,
        saida3: entry.break_start2 || undefined,
    };

    // Horas trabalhadas
    const workedMin = calculateWorkedMinutes(
        punches.entrada1, punches.saida1,
        punches.entrada2, punches.saida2,
        punches.entrada3, punches.saida3
    );

    // Aplicar tolerâncias
    let diff = workedMin - expectedMin;
    let overtimeMin = 0;
    let absenceMin = 0;
    let normalMin = 0;

    if (dayType === 'off' || dayType === 'compensated') {
        // Dia de folga/compensado — tudo é extra
        normalMin = 0;
        overtimeMin = workedMin;
        absenceMin = 0;
    } else if (!expected) {
        // Dia sem turno definido (domingo/feriado sem escala) — tudo extra
        normalMin = 0;
        overtimeMin = workedMin;
        absenceMin = 0;
    } else if (diff >= 0) {
        // Trabalhou mais ou igual ao esperado
        if (diff <= shift.tolerance_overtime) {
            // Dentro da tolerância — não conta extra
            normalMin = expectedMin;
            overtimeMin = 0;
        } else {
            normalMin = expectedMin;
            overtimeMin = diff - shift.tolerance_overtime;
        }
        absenceMin = 0;
    } else {
        // Trabalhou menos que o esperado
        if (Math.abs(diff) <= shift.tolerance_absence) {
            // Dentro da tolerância — não desconta
            normalMin = expectedMin;
            absenceMin = 0;
        } else {
            normalMin = workedMin;
            absenceMin = Math.abs(diff) - shift.tolerance_absence;
        }
        overtimeMin = 0;
    }

    // Horas noturnas
    const nightStart = toMinutes(shift.night_shift_start || '22:00');
    const nightEnd = toMinutes(shift.night_shift_end || '05:00');
    const nightMin = calculateNightMinutes(
        punches.entrada1, punches.saida1,
        punches.entrada2, punches.saida2,
        punches.entrada3 || null, punches.saida3 || null,
        nightStart, nightEnd
    );

    // Hora noturna reduzida (52:30 = cada 52.5 min noturna = 60 min normais)
    // Fator: 60/52.5 = 1.142857
    const nightReduced = shift.night_shift_reduction
        ? Math.round(nightMin * (60 / 52.5))
        : nightMin;

    // Distribuir extras nas faixas
    const overtimeTiers = overtimeMin > 0
        ? distributeOvertime(overtimeMin, dayType, rules)
        : [];

    // Aplicar justificativa de abono
    let finalAbsenceMin = absenceMin;
    let finalHasAbsence = absenceMin > 0;
    let finalIsMissing = workedMin === 0 && expectedMin > 0;
    let finalNormalMin = normalMin;

    if (isExcused && absenceMin > 0) {
        finalAbsenceMin = 0;
        finalHasAbsence = justAffectsDsr; // só marca falta para DSR se affects_dsr
        finalNormalMin = expectedMin; // considera como se tivesse trabalhado o esperado
    }
    if (isExcused && finalIsMissing) {
        finalIsMissing = false;
        finalHasAbsence = justAffectsDsr;
        finalNormalMin = expectedMin;
    }

    return {
        date: dateStr,
        dayOfWeek: dow,
        dayType,
        isHoliday,
        holidayName,
        punches,
        expected,
        workedMinutes: workedMin,
        expectedMinutes: expectedMin,
        normalMinutes: finalNormalMin,
        overtimeMinutes: overtimeMin,
        absenceMinutes: finalAbsenceMin,
        nightMinutes: nightMin,
        nightReducedMinutes: nightReduced,
        overtimeTiers,
        hasAbsence: finalHasAbsence,
        isComplete: workedMin > 0 && !!(punches.entrada1 && punches.saida1),
        isMissing: finalIsMissing,
        justification: entryJustification,
    };
};

/** Calcula DSR (Descanso Semanal Remunerado) */
const calculateDSR = (days: DayCalculation[], shift: WorkShift): { credit: number; debit: number } => {
    // DSR: Se o funcionário cumpriu toda a jornada na semana, tem direito ao DSR
    // Se teve falta, perde proporcionalmente o DSR

    // Agrupar por semana (Dom-Sab)
    let dsrCredit = 0;
    let dsrDebit = 0;

    // Calcular por semana ISO
    const weeks = new Map<number, DayCalculation[]>();
    days.forEach(d => {
        const date = new Date(d.date + 'T12:00:00');
        // Semana começa no domingo
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.getTime();
        if (!weeks.has(weekKey)) weeks.set(weekKey, []);
        weeks.get(weekKey)!.push(d);
    });

    weeks.forEach(weekDays => {
        const workDays = weekDays.filter(d =>
            d.dayType === 'weekday' || d.dayType === 'saturday'
        );
        const restDays = weekDays.filter(d =>
            d.dayType === 'sunday' || d.dayType === 'holiday'
        );

        if (workDays.length === 0 || restDays.length === 0) return;

        // Verificar se cumpriu toda a semana
        const hadAbsence = workDays.some(d => d.hasAbsence || d.isMissing);

        // DSR = média de horas normais da semana * dias de descanso
        const totalNormal = workDays.reduce((sum, d) => sum + d.normalMinutes, 0);
        const avgDaily = totalNormal / workDays.length;
        const dsrValue = Math.round(avgDaily * restDays.length);

        if (hadAbsence) {
            // Perde DSR proporcional
            const daysAbsent = workDays.filter(d => d.hasAbsence || d.isMissing).length;
            const proportional = Math.round(dsrValue * (daysAbsent / workDays.length));
            dsrCredit += dsrValue;
            dsrDebit += proportional;
        } else {
            dsrCredit += dsrValue;
        }
    });

    return { credit: dsrCredit, debit: dsrDebit };
};

// ============================================================
// FUNÇÃO PRINCIPAL: Cálculo Mensal
// ============================================================

export const calculateMonth = async (
    employeeId: string,
    employeeName: string,
    year: number,
    month: number,
    shiftId: string
): Promise<MonthCalculation | null> => {
    // 1. Buscar turno com regras
    const shiftData = await fetchShiftWithRules(shiftId);
    if (!shiftData) return null;
    const { shift, rules } = shiftData;

    // 2. Buscar feriados
    const holidays = await fetchHolidays(year, month);

    // 2b. Buscar tipos de justificativa
    const { data: justTypesData } = await supabase
        .from('absence_justifications')
        .select('id, code, name, excuses_absence, affects_dsr')
        .eq('active', true);
    const justificationTypes: AbsenceJustificationType[] = justTypesData || [];

    // 3. Buscar batidas do mês
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const { data: entries } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');

    const entryMap = new Map<string, TimeEntry>();
    entries?.forEach((e: any) => entryMap.set(e.date, e as TimeEntry));

    // 4. Calcular cada dia do mês
    const days: DayCalculation[] = [];
    for (let d = 1; d <= lastDay; d++) {
        const date = new Date(year, month - 1, d);
        const dateStr = date.toISOString().split('T')[0];
        const entry = entryMap.get(dateStr);
        const dayCalc = calculateDay(date, entry, shift, rules, holidays, justificationTypes);
        days.push(dayCalc);
    }

    // 5. Totalizar
    let totalWorked = 0;
    let totalExpected = 0;
    let totalNormal = 0;
    let totalAbsence = 0;
    let overtimeWeekday = 0;
    let overtimeSaturday = 0;
    let overtimeSunday = 0;
    let overtimeHoliday = 0;
    let overtime50 = 0;
    let overtime100 = 0;
    let nightHours = 0;
    let nightReducedHours = 0;
    let daysWorked = 0;
    let daysAbsent = 0;
    let daysHoliday = 0;
    let daysWeekend = 0;

    days.forEach(day => {
        totalWorked += day.workedMinutes;
        totalExpected += day.expectedMinutes;
        totalNormal += day.normalMinutes;
        totalAbsence += day.absenceMinutes;
        nightHours += day.nightMinutes;
        nightReducedHours += day.nightReducedMinutes;

        if (day.workedMinutes > 0) daysWorked++;
        if (day.hasAbsence || day.isMissing) daysAbsent++;
        if (day.isHoliday) daysHoliday++;
        if (day.dayType === 'sunday' || day.dayType === 'saturday') daysWeekend++;

        // Extras por tipo de dia
        if (day.overtimeMinutes > 0) {
            switch (day.dayType) {
                case 'weekday': overtimeWeekday += day.overtimeMinutes; break;
                case 'saturday': overtimeSaturday += day.overtimeMinutes; break;
                case 'sunday': overtimeSunday += day.overtimeMinutes; break;
                case 'holiday': overtimeHoliday += day.overtimeMinutes; break;
            }
        }

        // Extras por faixa
        day.overtimeTiers.forEach(tier => {
            if (tier.percentage <= 50) overtime50 += tier.minutes;
            else overtime100 += tier.minutes;
        });
    });

    // 6. DSR
    const dsr = calculateDSR(days, shift);

    // 7. Banco de horas (se habilitado)
    const totalOvertime = overtimeWeekday + overtimeSaturday + overtimeSunday + overtimeHoliday;
    let hourBankCredit = 0;
    let hourBankDebit = 0;
    let hourBankBalance = 0;

    if (shift.use_hour_bank) {
        hourBankCredit = totalOvertime;
        hourBankDebit = totalAbsence;
        hourBankBalance = hourBankCredit - hourBankDebit;
    }

    const balance = totalWorked - totalExpected;

    return {
        employeeId,
        employeeName,
        year,
        month,
        shiftName: shift.name,
        shiftId: shift.id,
        totalWorked,
        totalExpected,
        totalNormal,
        totalAbsence,
        overtimeWeekday,
        overtimeSaturday,
        overtimeSunday,
        overtimeHoliday,
        overtime50,
        overtime100,
        nightHours,
        nightReducedHours,
        dsrCredit: dsr.credit,
        dsrDebit: dsr.debit,
        hourBankCredit,
        hourBankDebit,
        hourBankBalance,
        daysWorked,
        daysAbsent,
        daysHoliday,
        daysWeekend,
        days,
        balance,
    };
};

/** Salva o resultado do cálculo no banco */
export const saveCalculation = async (calc: MonthCalculation): Promise<void> => {
    const payload = {
        employee_id: calc.employeeId,
        year: calc.year,
        month: calc.month,
        work_shift_id: calc.shiftId,
        work_shift_name: calc.shiftName,
        normal_hours: calc.totalNormal,
        absence_hours: calc.totalAbsence,
        overtime_weekday: calc.overtimeWeekday,
        overtime_saturday: calc.overtimeSaturday,
        overtime_sunday: calc.overtimeSunday,
        overtime_holiday: calc.overtimeHoliday,
        overtime_50_hours: calc.overtime50,
        overtime_100_hours: calc.overtime100,
        dsr_hours: calc.dsrCredit,
        dsr_debit: calc.dsrDebit,
        night_hours: calc.nightHours,
        night_reduced_hours: calc.nightReducedHours,
        hour_bank_credit: calc.hourBankCredit,
        hour_bank_debit: calc.hourBankDebit,
        hour_bank_balance: calc.hourBankBalance,
        total_worked: calc.totalWorked,
        total_expected: calc.totalExpected,
        balance: calc.balance,
        days_worked: calc.daysWorked,
        days_absent: calc.daysAbsent,
        days_holiday: calc.daysHoliday,
        days_weekend: calc.daysWeekend,
        status: 'CALCULATED',
        calculated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from('timecard_calculations')
        .upsert(payload, { onConflict: 'employee_id,year,month' });

    if (error) {
        console.error('Erro ao salvar cálculo:', error);
        throw error;
    }
};
