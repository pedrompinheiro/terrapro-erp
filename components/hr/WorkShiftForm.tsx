
import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Calendar, Settings, Percent, Moon, AlertCircle, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ScheduleDay {
    entrada1: string;
    saida1: string;
    entrada2: string;
    saida2: string;
    entrada3?: string;
    saida3?: string;
    is_off?: boolean;
}

interface OvertimeRule {
    day_type: 'weekday' | 'saturday' | 'sunday' | 'holiday';
    tier1_hours: number;
    tier1_percentage: number;
    tier2_hours: number | null;
    tier2_percentage: number;
    tier3_hours: number | null;
    tier3_percentage: number | null;
    daily_limit: number | null;
}

interface WorkShiftData {
    id?: string;
    name: string;
    color: string;

    // Horários básicos (mantidos para compatibilidade)
    start_time: string;
    break_start: string;
    break_end: string;
    end_time: string;
    work_days: string[];

    // Horários por dia (avançado)
    schedule_by_day: Record<string, ScheduleDay | null> | null;

    // Tolerâncias
    tolerance_overtime: number;
    tolerance_absence: number;

    // Carga horária
    workload_type: 'daily' | 'weekly' | 'monthly';
    weekly_hours: number;
    monthly_hours: number;

    // Flags
    is_compensated: boolean;
    is_free_lunch: boolean;
    consider_holidays: boolean;
    deduct_late: boolean;
    add_early: boolean;

    // Adicional Noturno
    night_shift_start: string;
    night_shift_end: string;
    night_shift_reduction: boolean;

    // Banco de Horas
    use_hour_bank: boolean;

    // Extras
    notes: string;
    active: boolean;
}

interface WorkShiftFormProps {
    shiftId?: string | null;
    initialData?: any;
    onClose: () => void;
    onSuccess: () => void;
}

const DAYS_OF_WEEK = [
    { key: 'Monday', num: '1', label: 'Segunda-feira', short: 'SEG' },
    { key: 'Tuesday', num: '2', label: 'Terça-feira', short: 'TER' },
    { key: 'Wednesday', num: '3', label: 'Quarta-feira', short: 'QUA' },
    { key: 'Thursday', num: '4', label: 'Quinta-feira', short: 'QUI' },
    { key: 'Friday', num: '5', label: 'Sexta-feira', short: 'SEX' },
    { key: 'Saturday', num: '6', label: 'Sábado', short: 'SÁB' },
    { key: 'Sunday', num: '7', label: 'Domingo', short: 'DOM' },
];

const SHIFT_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

const DEFAULT_OVERTIME: OvertimeRule[] = [
    { day_type: 'weekday', tier1_hours: 2, tier1_percentage: 50, tier2_hours: null, tier2_percentage: 100, tier3_hours: null, tier3_percentage: null, daily_limit: null },
    { day_type: 'saturday', tier1_hours: 0, tier1_percentage: 50, tier2_hours: null, tier2_percentage: 100, tier3_hours: null, tier3_percentage: null, daily_limit: null },
    { day_type: 'sunday', tier1_hours: 0, tier1_percentage: 100, tier2_hours: null, tier2_percentage: 100, tier3_hours: null, tier3_percentage: null, daily_limit: null },
    { day_type: 'holiday', tier1_hours: 0, tier1_percentage: 100, tier2_hours: null, tier2_percentage: 100, tier3_hours: null, tier3_percentage: null, daily_limit: null },
];

type FormTab = 'schedule' | 'overtime' | 'advanced';

const WorkShiftForm: React.FC<WorkShiftFormProps> = ({ shiftId, initialData, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<FormTab>('schedule');
    const [useAdvancedSchedule, setUseAdvancedSchedule] = useState(false);
    const [expandedDay, setExpandedDay] = useState<string | null>(null);

    const [formData, setFormData] = useState<WorkShiftData>({
        name: '',
        color: '#3b82f6',
        start_time: '07:00',
        break_start: '11:00',
        break_end: '12:00',
        end_time: '17:00',
        work_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        schedule_by_day: null,
        tolerance_overtime: 10,
        tolerance_absence: 10,
        workload_type: 'weekly',
        weekly_hours: 44,
        monthly_hours: 220,
        is_compensated: false,
        is_free_lunch: false,
        consider_holidays: true,
        deduct_late: true,
        add_early: false,
        night_shift_start: '22:00',
        night_shift_end: '05:00',
        night_shift_reduction: true,
        use_hour_bank: false,
        notes: '',
        active: true,
    });

    const [overtimeRules, setOvertimeRules] = useState<OvertimeRule[]>(DEFAULT_OVERTIME);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                tolerance_overtime: initialData.tolerance_overtime ?? 10,
                tolerance_absence: initialData.tolerance_absence ?? 10,
                workload_type: initialData.workload_type || 'weekly',
                weekly_hours: initialData.weekly_hours ?? 44,
                monthly_hours: initialData.monthly_hours ?? 220,
                color: initialData.color || '#3b82f6',
                night_shift_start: initialData.night_shift_start || '22:00',
                night_shift_end: initialData.night_shift_end || '05:00',
                night_shift_reduction: initialData.night_shift_reduction !== false,
                active: initialData.active !== false,
            }));
            if (initialData.schedule_by_day) {
                setUseAdvancedSchedule(true);
            }
        }
        if (shiftId) {
            fetchOvertimeRules(shiftId);
        }
    }, [initialData, shiftId]);

    const fetchOvertimeRules = async (id: string) => {
        const { data } = await supabase
            .from('overtime_rules')
            .select('*')
            .eq('work_shift_id', id);
        if (data && data.length > 0) {
            const merged = DEFAULT_OVERTIME.map(def => {
                const found = data.find((d: any) => d.day_type === def.day_type);
                return found ? { ...def, ...found } : def;
            });
            setOvertimeRules(merged);
        }
    };

    const toggleDay = (dayKey: string) => {
        setFormData(prev => {
            const current = prev.work_days || [];
            if (current.includes(dayKey)) {
                return { ...prev, work_days: current.filter(d => d !== dayKey) };
            } else {
                return { ...prev, work_days: [...current, dayKey] };
            }
        });
    };

    const getScheduleForDay = (dayNum: string): ScheduleDay => {
        if (formData.schedule_by_day && formData.schedule_by_day[dayNum]) {
            return formData.schedule_by_day[dayNum]!;
        }
        return {
            entrada1: formData.start_time,
            saida1: formData.break_start,
            entrada2: formData.break_end,
            saida2: formData.end_time,
        };
    };

    const updateDaySchedule = (dayNum: string, field: string, value: string | boolean) => {
        setFormData(prev => {
            const current = prev.schedule_by_day || {};
            const dayData = current[dayNum] || getScheduleForDay(dayNum);
            return {
                ...prev,
                schedule_by_day: {
                    ...current,
                    [dayNum]: { ...dayData, [field]: value }
                }
            };
        });
    };

    const calculateDailyHours = (schedule: ScheduleDay): string => {
        const toMin = (t: string) => {
            if (!t) return 0;
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };

        let total = 0;
        const e1 = toMin(schedule.entrada1);
        const s1 = toMin(schedule.saida1);
        const e2 = toMin(schedule.entrada2);
        const s2 = toMin(schedule.saida2);
        const e3 = toMin(schedule.entrada3 || '');
        const s3 = toMin(schedule.saida3 || '');

        if (s1 > e1) total += s1 - e1;
        if (s2 > e2) total += s2 - e2;
        if (e3 && s3 && s3 > e3) total += s3 - e3;

        // Handle overnight (saida < entrada)
        if (s1 > 0 && s1 < e1) total += (1440 - e1) + s1;
        if (s2 > 0 && s2 < e2) total += (1440 - e2) + s2;

        if (total <= 0) return '00:00';
        const h = Math.floor(total / 60);
        const m = total % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const calculateTotalWeeklyHours = (): string => {
        let totalMin = 0;
        DAYS_OF_WEEK.forEach(day => {
            if (formData.work_days?.includes(day.key)) {
                const sched = getScheduleForDay(day.num);
                if (!sched.is_off) {
                    const [h, m] = calculateDailyHours(sched).split(':').map(Number);
                    totalMin += h * 60 + m;
                }
            }
        });
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const updateOvertimeRule = (dayType: string, field: string, value: any) => {
        setOvertimeRules(prev => prev.map(r =>
            r.day_type === dayType ? { ...r, [field]: value } : r
        ));
    };

    const handleSave = async () => {
        if (!formData.name) return alert('Informe o nome do turno');

        setLoading(true);
        try {
            const payload: any = {
                name: formData.name,
                color: formData.color,
                start_time: formData.start_time,
                break_start: formData.break_start,
                break_end: formData.break_end,
                end_time: formData.end_time,
                work_days: formData.work_days,
                schedule_by_day: useAdvancedSchedule ? formData.schedule_by_day : null,
                tolerance_overtime: formData.tolerance_overtime,
                tolerance_absence: formData.tolerance_absence,
                workload_type: formData.workload_type,
                weekly_hours: formData.weekly_hours,
                monthly_hours: formData.monthly_hours,
                is_compensated: formData.is_compensated,
                is_free_lunch: formData.is_free_lunch,
                consider_holidays: formData.consider_holidays,
                deduct_late: formData.deduct_late,
                add_early: formData.add_early,
                night_shift_start: formData.night_shift_start,
                night_shift_end: formData.night_shift_end,
                night_shift_reduction: formData.night_shift_reduction,
                use_hour_bank: formData.use_hour_bank,
                notes: formData.notes,
                active: formData.active,
            };

            if (shiftId) {
                payload.id = shiftId;
            }

            const { data: savedShift, error } = await supabase
                .from('work_shifts')
                .upsert(payload)
                .select()
                .single();

            if (error) throw error;

            // Salvar overtime_rules
            if (savedShift) {
                // Deletar regras anteriores
                await supabase
                    .from('overtime_rules')
                    .delete()
                    .eq('work_shift_id', savedShift.id);

                // Inserir novas
                const rules = overtimeRules.map(r => ({
                    work_shift_id: savedShift.id,
                    day_type: r.day_type,
                    tier1_hours: r.tier1_hours,
                    tier1_percentage: r.tier1_percentage,
                    tier2_hours: r.tier2_hours,
                    tier2_percentage: r.tier2_percentage,
                    tier3_hours: r.tier3_hours,
                    tier3_percentage: r.tier3_percentage,
                    daily_limit: r.daily_limit,
                }));

                const { error: ruleErr } = await supabase
                    .from('overtime_rules')
                    .insert(rules);

                if (ruleErr) console.error('Erro ao salvar faixas:', ruleErr);
            }

            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert('Erro ao salvar turno: ' + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    const DAY_TYPE_LABELS: Record<string, { label: string; color: string }> = {
        weekday: { label: 'Dias Úteis', color: 'text-blue-400' },
        saturday: { label: 'Sábado', color: 'text-amber-400' },
        sunday: { label: 'Domingo', color: 'text-orange-400' },
        holiday: { label: 'Feriado', color: 'text-red-400' },
    };

    const tabs: { key: FormTab; label: string; icon: React.ReactNode }[] = [
        { key: 'schedule', label: 'Horários', icon: <Clock size={14} /> },
        { key: 'overtime', label: 'Horas Extras', icon: <Percent size={14} /> },
        { key: 'advanced', label: 'Avançado', icon: <Settings size={14} /> },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: formData.color }} />
                            {shiftId ? 'Editar Turno de Trabalho' : 'Novo Turno de Trabalho'}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Configure horários, faixas de extras e regras trabalhistas.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 py-3 text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all border-b-2 ${activeTab === tab.key
                                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                                : 'border-transparent text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar flex-1">
                    {/* ========== ABA HORÁRIOS ========== */}
                    {activeTab === 'schedule' && (
                        <>
                            {/* Nome + Cor */}
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Nome do Turno</label>
                                    <input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Comercial, Turno A BAL, Noturno..."
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Palette size={10} /> Cor</label>
                                    <div className="flex gap-1.5 flex-wrap w-32">
                                        {SHIFT_COLORS.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setFormData({ ...formData, color: c })}
                                                className={`w-6 h-6 rounded-full transition-all ${formData.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-110'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Horários Padrão */}
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Horário Padrão (aplicado a todos os dias)</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useAdvancedSchedule}
                                            onChange={e => {
                                                setUseAdvancedSchedule(e.target.checked);
                                                if (e.target.checked && !formData.schedule_by_day) {
                                                    // Inicializa com horário padrão
                                                    const sched: Record<string, ScheduleDay> = {};
                                                    DAYS_OF_WEEK.forEach(d => {
                                                        const isWork = formData.work_days?.includes(d.key);
                                                        sched[d.num] = {
                                                            entrada1: isWork ? formData.start_time : '',
                                                            saida1: isWork ? formData.break_start : '',
                                                            entrada2: isWork ? formData.break_end : '',
                                                            saida2: isWork ? formData.end_time : '',
                                                            is_off: !isWork,
                                                        };
                                                    });
                                                    setFormData(prev => ({ ...prev, schedule_by_day: sched }));
                                                }
                                            }}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500"
                                        />
                                        <span className="text-[10px] font-bold text-slate-500">Horário diferente por dia</span>
                                    </label>
                                </div>

                                {!useAdvancedSchedule && (
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-emerald-500 uppercase">Entrada</label>
                                            <input type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white outline-none focus:border-emerald-500 font-mono text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-amber-500 uppercase">Int. Saída</label>
                                            <input type="time" value={formData.break_start} onChange={e => setFormData({ ...formData, break_start: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white outline-none focus:border-amber-500 font-mono text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-blue-500 uppercase">Int. Volta</label>
                                            <input type="time" value={formData.break_end} onChange={e => setFormData({ ...formData, break_end: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white outline-none focus:border-blue-500 font-mono text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-rose-500 uppercase">Saída</label>
                                            <input type="time" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white outline-none focus:border-rose-500 font-mono text-sm" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Horários por dia da semana (avançado) */}
                            {useAdvancedSchedule && (
                                <div className="space-y-2">
                                    {DAYS_OF_WEEK.map(day => {
                                        const sched = getScheduleForDay(day.num);
                                        const isExpanded = expandedDay === day.num;
                                        const isWork = formData.work_days?.includes(day.key);
                                        const dailyH = !sched.is_off ? calculateDailyHours(sched) : '00:00';

                                        return (
                                            <div key={day.num} className={`rounded-xl border transition-all ${isWork ? 'border-slate-700 bg-slate-950/50' : 'border-slate-800/50 bg-slate-950/20 opacity-60'}`}>
                                                <button
                                                    onClick={() => setExpandedDay(isExpanded ? null : day.num)}
                                                    className="w-full flex items-center justify-between px-4 py-2.5"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isWork}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                toggleDay(day.key);
                                                                if (formData.schedule_by_day) {
                                                                    updateDaySchedule(day.num, 'is_off', isWork);
                                                                }
                                                            }}
                                                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500"
                                                            onClick={e => e.stopPropagation()}
                                                        />
                                                        <span className={`text-sm font-bold ${isWork ? 'text-white' : 'text-slate-500'}`}>{day.label}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {isWork && !sched.is_off && (
                                                            <span className="text-xs text-slate-400 font-mono">
                                                                {sched.entrada1}-{sched.saida1} | {sched.entrada2}-{sched.saida2}
                                                                {sched.entrada3 && ` | ${sched.entrada3}-${sched.saida3}`}
                                                            </span>
                                                        )}
                                                        <span className="text-xs font-bold text-blue-400 font-mono w-12 text-right">{dailyH}</span>
                                                        {isExpanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                                                    </div>
                                                </button>

                                                {isExpanded && isWork && (
                                                    <div className="px-4 pb-3 space-y-2 border-t border-slate-800/50 pt-3">
                                                        <div className="grid grid-cols-4 gap-2">
                                                            <div>
                                                                <label className="text-[9px] font-bold text-emerald-500">ENT. 1</label>
                                                                <input type="time" value={sched.entrada1} onChange={e => updateDaySchedule(day.num, 'entrada1', e.target.value)}
                                                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white outline-none font-mono text-xs" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-bold text-rose-500">SAÍ. 1</label>
                                                                <input type="time" value={sched.saida1} onChange={e => updateDaySchedule(day.num, 'saida1', e.target.value)}
                                                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white outline-none font-mono text-xs" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-bold text-emerald-500">ENT. 2</label>
                                                                <input type="time" value={sched.entrada2} onChange={e => updateDaySchedule(day.num, 'entrada2', e.target.value)}
                                                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white outline-none font-mono text-xs" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-bold text-rose-500">SAÍ. 2</label>
                                                                <input type="time" value={sched.saida2} onChange={e => updateDaySchedule(day.num, 'saida2', e.target.value)}
                                                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white outline-none font-mono text-xs" />
                                                            </div>
                                                        </div>
                                                        {/* 3º período */}
                                                        <div className="grid grid-cols-4 gap-2">
                                                            <div>
                                                                <label className="text-[9px] font-bold text-cyan-500">ENT. 3</label>
                                                                <input type="time" value={sched.entrada3 || ''} onChange={e => updateDaySchedule(day.num, 'entrada3', e.target.value)}
                                                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white outline-none font-mono text-xs" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-bold text-cyan-500">SAÍ. 3</label>
                                                                <input type="time" value={sched.saida3 || ''} onChange={e => updateDaySchedule(day.num, 'saida3', e.target.value)}
                                                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white outline-none font-mono text-xs" />
                                                            </div>
                                                            <div className="col-span-2 flex items-end">
                                                                <span className="text-[10px] text-slate-500 italic">3º período (opcional)</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Dias da Semana (modo simples) */}
                            {!useAdvancedSchedule && (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Calendar size={12} /> Dias de Trabalho</label>
                                    <div className="flex justify-between gap-2">
                                        {DAYS_OF_WEEK.map(day => {
                                            const isSelected = formData.work_days?.includes(day.key);
                                            return (
                                                <button
                                                    key={day.key}
                                                    onClick={() => toggleDay(day.key)}
                                                    className={`flex-1 min-w-[50px] py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${isSelected
                                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50'
                                                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                                                        }`}
                                                >
                                                    <span className="text-[10px] font-bold">{day.short}</span>
                                                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Resumo */}
                            <div className="flex items-center justify-between bg-slate-800/30 rounded-xl p-3 border border-slate-800/50">
                                <span className="text-sm font-bold text-slate-400">Carga Horária Semanal:</span>
                                <span className="text-2xl font-black text-white font-mono">{calculateTotalWeeklyHours()}</span>
                            </div>
                        </>
                    )}

                    {/* ========== ABA HORAS EXTRAS ========== */}
                    {activeTab === 'overtime' && (
                        <>
                            <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                <AlertCircle size={16} className="text-blue-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-300">
                                    Configure as faixas de hora extra para cada tipo de dia. Exemplo: dias úteis = até 2h a 50%, depois a 100%.
                                    Domingos e feriados geralmente são 100% desde a primeira hora.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {overtimeRules.map(rule => {
                                    const meta = DAY_TYPE_LABELS[rule.day_type];
                                    return (
                                        <div key={rule.day_type} className="bg-slate-950/50 rounded-xl border border-slate-800/50 p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm font-bold ${meta.color}`}>{meta.label}</span>
                                                {rule.daily_limit && (
                                                    <span className="text-[10px] text-slate-500">Limite: {Math.floor(rule.daily_limit / 60)}h{rule.daily_limit % 60 > 0 ? `${rule.daily_limit % 60}min` : ''}/dia</span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                {/* Faixa 1 */}
                                                <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 space-y-2">
                                                    <span className="text-[10px] font-bold text-slate-500">FAIXA 1</span>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <label className="text-[9px] text-slate-600">Até (h)</label>
                                                            <input type="number" step="0.5" min="0" value={rule.tier1_hours}
                                                                onChange={e => updateOvertimeRule(rule.day_type, 'tier1_hours', Number(e.target.value))}
                                                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-sm font-mono outline-none" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[9px] text-slate-600">%</label>
                                                            <input type="number" step="5" min="0" value={rule.tier1_percentage}
                                                                onChange={e => updateOvertimeRule(rule.day_type, 'tier1_percentage', Number(e.target.value))}
                                                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-sm font-mono outline-none" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Faixa 2 */}
                                                <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 space-y-2">
                                                    <span className="text-[10px] font-bold text-slate-500">FAIXA 2</span>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <label className="text-[9px] text-slate-600">Até (h)</label>
                                                            <input type="number" step="0.5" min="0" value={rule.tier2_hours ?? ''}
                                                                onChange={e => updateOvertimeRule(rule.day_type, 'tier2_hours', e.target.value ? Number(e.target.value) : null)}
                                                                placeholder="--"
                                                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-sm font-mono outline-none placeholder:text-slate-700" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[9px] text-slate-600">%</label>
                                                            <input type="number" step="5" min="0" value={rule.tier2_percentage}
                                                                onChange={e => updateOvertimeRule(rule.day_type, 'tier2_percentage', Number(e.target.value))}
                                                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-sm font-mono outline-none" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Faixa 3 */}
                                                <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 space-y-2 opacity-70">
                                                    <span className="text-[10px] font-bold text-slate-500">FAIXA 3 (Opc.)</span>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <label className="text-[9px] text-slate-600">Até (h)</label>
                                                            <input type="number" step="0.5" min="0" value={rule.tier3_hours ?? ''}
                                                                onChange={e => updateOvertimeRule(rule.day_type, 'tier3_hours', e.target.value ? Number(e.target.value) : null)}
                                                                placeholder="--"
                                                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-sm font-mono outline-none placeholder:text-slate-700" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[9px] text-slate-600">%</label>
                                                            <input type="number" step="5" min="0" value={rule.tier3_percentage ?? ''}
                                                                onChange={e => updateOvertimeRule(rule.day_type, 'tier3_percentage', e.target.value ? Number(e.target.value) : null)}
                                                                placeholder="--"
                                                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-sm font-mono outline-none placeholder:text-slate-700" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Limite diário */}
                                            <div className="flex items-center gap-3 pt-1">
                                                <label className="text-[10px] text-slate-500 font-bold">Limite diário (min):</label>
                                                <input type="number" min="0" value={rule.daily_limit ?? ''}
                                                    onChange={e => updateOvertimeRule(rule.day_type, 'daily_limit', e.target.value ? Number(e.target.value) : null)}
                                                    placeholder="Sem limite"
                                                    className="w-28 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono outline-none placeholder:text-slate-700" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Tolerâncias */}
                            <div className="bg-slate-950/50 rounded-xl border border-slate-800/50 p-4 space-y-3">
                                <span className="text-xs font-bold text-slate-400 uppercase">Tolerâncias (em minutos)</span>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-emerald-500">Extras (min antes de contar HE)</label>
                                        <input type="number" min="0" max="30" value={formData.tolerance_overtime}
                                            onChange={e => setFormData({ ...formData, tolerance_overtime: Number(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-rose-500">Faltas (min antes de contar falta)</label>
                                        <input type="number" min="0" max="30" value={formData.tolerance_absence}
                                            onChange={e => setFormData({ ...formData, tolerance_absence: Number(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-600 italic">
                                    CLT Art. 58 §1º: não serão descontadas nem computadas as variações de horário não excedentes de 5 min, até o limite de 10 min diários.
                                </p>
                            </div>
                        </>
                    )}

                    {/* ========== ABA AVANÇADO ========== */}
                    {activeTab === 'advanced' && (
                        <>
                            {/* Carga Horária */}
                            <div className="bg-slate-950/50 rounded-xl border border-slate-800/50 p-4 space-y-3">
                                <span className="text-xs font-bold text-slate-400 uppercase">Carga Horária</span>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500">Tipo</label>
                                        <select value={formData.workload_type}
                                            onChange={e => setFormData({ ...formData, workload_type: e.target.value as any })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm outline-none">
                                            <option value="daily">Diária</option>
                                            <option value="weekly">Semanal</option>
                                            <option value="monthly">Mensal</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500">Horas Semanais</label>
                                        <input type="number" step="1" min="0" max="60" value={formData.weekly_hours}
                                            onChange={e => setFormData({ ...formData, weekly_hours: Number(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white font-mono text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500">Horas Mensais</label>
                                        <input type="number" step="1" min="0" max="300" value={formData.monthly_hours}
                                            onChange={e => setFormData({ ...formData, monthly_hours: Number(e.target.value) })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white font-mono text-sm outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Adicional Noturno */}
                            <div className="bg-slate-950/50 rounded-xl border border-slate-800/50 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Moon size={14} className="text-indigo-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase">Adicional Noturno</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500">Início (CLT: 22:00)</label>
                                        <input type="time" value={formData.night_shift_start}
                                            onChange={e => setFormData({ ...formData, night_shift_start: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white font-mono text-sm outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500">Fim (CLT: 05:00)</label>
                                        <input type="time" value={formData.night_shift_end}
                                            onChange={e => setFormData({ ...formData, night_shift_end: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white font-mono text-sm outline-none" />
                                    </div>
                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.night_shift_reduction}
                                                onChange={e => setFormData({ ...formData, night_shift_reduction: e.target.checked })}
                                                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500" />
                                            <span className="text-[10px] font-bold text-slate-500">Hora reduzida (52:30)</span>
                                        </label>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-600 italic">
                                    CLT Art. 73 §1º: A hora noturna é computada como de 52 minutos e 30 segundos. Adicional mínimo de 20%.
                                </p>
                            </div>

                            {/* Flags */}
                            <div className="bg-slate-950/50 rounded-xl border border-slate-800/50 p-4 space-y-3">
                                <span className="text-xs font-bold text-slate-400 uppercase">Configurações</span>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { key: 'consider_holidays', label: 'Considerar Feriados', desc: 'Feriados contam como dia especial' },
                                        { key: 'deduct_late', label: 'Descontar Atrasos', desc: 'Deduz minutos de atraso' },
                                        { key: 'add_early', label: 'Somar Adiantados', desc: 'Conta como extra se chegar antes' },
                                        { key: 'is_compensated', label: 'Compensado', desc: 'Horas compensadas (sábado embutido)' },
                                        { key: 'is_free_lunch', label: 'Almoço Livre', desc: 'Intervalo flexível dentro do período' },
                                        { key: 'use_hour_bank', label: 'Banco de Horas', desc: 'Usar banco em vez de pagamento de HE' },
                                    ].map(flag => (
                                        <label key={flag.key} className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-3 border border-slate-800/30 cursor-pointer hover:border-slate-700 transition-colors">
                                            <input type="checkbox"
                                                checked={(formData as any)[flag.key] || false}
                                                onChange={e => setFormData({ ...formData, [flag.key]: e.target.checked })}
                                                className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-blue-500" />
                                            <div>
                                                <span className="text-xs font-bold text-white block">{flag.label}</span>
                                                <span className="text-[10px] text-slate-500">{flag.desc}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Observações */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Observações</label>
                                <textarea value={formData.notes} rows={3}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Notas sobre este turno..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 resize-none" />
                            </div>

                            {/* Status */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={formData.active}
                                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500" />
                                <span className="text-sm font-bold text-white">Turno Ativo</span>
                            </label>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-800 bg-slate-800/30 flex justify-between items-center">
                    <div className="text-[10px] text-slate-600">
                        {shiftId ? `ID: ${shiftId.substring(0, 8)}...` : 'Novo turno'}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors text-sm">
                            Cancelar
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className={`px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50 text-sm ${loading ? 'opacity-50 cursor-wait' : ''}`}>
                            {loading ? <Clock size={14} className="animate-spin" /> : <Save size={14} />}
                            Salvar Turno
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkShiftForm;
