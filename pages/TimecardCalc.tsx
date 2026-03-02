import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calculator, Calendar, Clock, User, ChevronLeft, ChevronRight, Download, Loader2, Moon, AlertCircle, CheckCircle, Sun, CloudSun, Briefcase, RefreshCw, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TimeInput from '../components/TimeInput';
import {
    calculateMonth,
    saveCalculation,
    minutesToHHMM,
    MonthCalculation,
    DayCalculation
} from '../services/timecardCalculator';

interface Employee {
    id: string;
    full_name: string;
    registration_number: string;
    work_shift_id: string | null;
    company_id: string;
    job_title: string;
    active: boolean;
}

interface ShiftOption {
    id: string;
    name: string;
    color: string;
    schedule_by_day: Record<string, any> | null;
    start_time: string;
    break_start: string;
    break_end: string;
    end_time: string;
    work_days: string[];
    tolerance_overtime: number;
    tolerance_absence: number;
    is_compensated: boolean;
    weekly_hours: number;
}

interface JustificationType {
    id: string;
    code: string;
    name: string;
    excuses_absence: boolean;
    affects_dsr: boolean;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DOW_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const TimecardCalc: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [shifts, setShifts] = useState<ShiftOption[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [calculation, setCalculation] = useState<MonthCalculation | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
    const [justificationTypes, setJustificationTypes] = useState<JustificationType[]>([]);
    // Estado local para edições de batidas (antes de salvar)
    const [editedPunches, setEditedPunches] = useState<Record<string, Record<string, string>>>({});
    // Seletor de justificativa inline: "date-period" (ex: "2026-03-02-1" ou "2026-03-02-2")
    const [justPopover, setJustPopover] = useState<string | null>(null);

    useEffect(() => {
        fetchEmployees();
        fetchShifts();
        fetchCompanies();
        fetchJustificationTypes();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('employees')
            .select('id, full_name, registration_number, work_shift_id, company_id, job_title, active')
            .eq('active', true)
            .order('full_name');
        setEmployees(data || []);
        setLoading(false);
    };

    const fetchShifts = async () => {
        const { data } = await supabase
            .from('work_shifts')
            .select('id, name, color, schedule_by_day, start_time, break_start, break_end, end_time, work_days, tolerance_overtime, tolerance_absence, is_compensated, weekly_hours')
            .eq('active', true)
            .order('name');
        setShifts(data || []);
    };

    const fetchCompanies = async () => {
        const { data } = await supabase
            .from('companies')
            .select('id, name')
            .order('name');
        setCompanies(data || []);
    };

    const fetchJustificationTypes = async () => {
        const { data } = await supabase
            .from('absence_justifications')
            .select('id, code, name, excuses_absence, affects_dsr')
            .eq('active', true)
            .order('name');
        setJustificationTypes(data || []);
    };

    const handleSetJustification = async (day: DayCalculation, justCode: string | null) => {
        if (!selectedEmployee) return;

        const emp = employees.find(e => e.id === selectedEmployee);

        // Tentar atualizar entry existente
        const { data: existing } = await supabase
            .from('time_entries')
            .select('id')
            .eq('employee_id', selectedEmployee)
            .eq('date', day.date)
            .maybeSingle();

        if (existing) {
            await supabase
                .from('time_entries')
                .update({ justification: justCode })
                .eq('id', existing.id);
        } else if (justCode) {
            // Criar entry se não existe (incluindo company_id obrigatório)
            const { error: insertErr } = await supabase
                .from('time_entries')
                .insert({
                    employee_id: selectedEmployee,
                    company_id: emp?.company_id || null,
                    date: day.date,
                    justification: justCode,
                });
            if (insertErr) {
                console.error('Erro ao salvar justificativa:', insertErr);
                alert('Erro ao salvar justificativa: ' + insertErr.message);
                return;
            }
        }

        // Recalcular
        await handleCalculate();
    };

    // Mapa de campo local → coluna no banco
    const punchFieldToColumn: Record<string, string> = {
        entrada1: 'entry_time',
        saida1: 'break_start',
        entrada2: 'break_end',
        saida2: 'exit_time',
    };

    const handleUpdatePunch = useCallback((date: string, field: string, value: string) => {
        setEditedPunches(prev => ({
            ...prev,
            [date]: { ...(prev[date] || {}), [field]: value }
        }));
    }, []);

    const handleSavePunch = useCallback(async (day: DayCalculation, field: string) => {
        if (!selectedEmployee) return;

        const emp = employees.find(e => e.id === selectedEmployee);
        const editedValue = editedPunches[day.date]?.[field] || '';
        const dbColumn = punchFieldToColumn[field];
        if (!dbColumn) return;

        // Verificar se já existe registro pra esse dia
        const { data: existing } = await supabase
            .from('time_entries')
            .select('id')
            .eq('employee_id', selectedEmployee)
            .eq('date', day.date)
            .maybeSingle();

        if (existing) {
            const { error } = await supabase
                .from('time_entries')
                .update({ [dbColumn]: editedValue || null })
                .eq('id', existing.id);
            if (error) {
                console.error('Erro ao salvar batida:', error);
                return;
            }
        } else {
            // Criar entry nova
            const { error } = await supabase
                .from('time_entries')
                .insert({
                    employee_id: selectedEmployee,
                    company_id: emp?.company_id || null,
                    date: day.date,
                    [dbColumn]: editedValue || null,
                });
            if (error) {
                console.error('Erro ao inserir batida:', error);
                return;
            }
        }

        // Limpar edições locais desse dia e recalcular
        setEditedPunches(prev => {
            const copy = { ...prev };
            delete copy[day.date];
            return copy;
        });
        await handleCalculate();
    }, [selectedEmployee, employees, editedPunches]);

    // Pega o valor do punch: prioriza edição local, senão usa o calculado
    const getPunchValue = useCallback((day: DayCalculation, field: string): string => {
        if (editedPunches[day.date] && field in editedPunches[day.date]) {
            return editedPunches[day.date][field];
        }
        return (day.punches as any)[field] || '';
    }, [editedPunches]);

    // Salvar justificativa por período (1 ou 2)
    const handleSetPeriodJustification = useCallback(async (day: DayCalculation, period: 1 | 2, justCode: string | null) => {
        if (!selectedEmployee) return;
        const emp = employees.find(e => e.id === selectedEmployee);
        const dbField = period === 1 ? 'justification' : 'justification2';

        const { data: existing } = await supabase
            .from('time_entries')
            .select('id')
            .eq('employee_id', selectedEmployee)
            .eq('date', day.date)
            .maybeSingle();

        if (existing) {
            await supabase
                .from('time_entries')
                .update({ [dbField]: justCode })
                .eq('id', existing.id);
        } else if (justCode) {
            await supabase
                .from('time_entries')
                .insert({
                    employee_id: selectedEmployee,
                    company_id: emp?.company_id || null,
                    date: day.date,
                    [dbField]: justCode,
                });
        }

        setJustPopover(null);
        await handleCalculate();
    }, [selectedEmployee, employees]);

    // Detecta se tecla é letra → abre seletor de justificativa
    const handleTimeKeyDown = useCallback((e: React.KeyboardEvent, day: DayCalculation, period: 1 | 2) => {
        const key = e.key;
        // Se digitou letra (não número, não tecla especial)
        if (key.length === 1 && /[a-zA-Z]/.test(key)) {
            e.preventDefault();
            setJustPopover(`${day.date}-${period}`);
        }
    }, []);

    const filteredEmployees = useMemo(() => {
        return employees.filter(e => {
            const matchSearch = !searchTerm ||
                e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.registration_number?.includes(searchTerm);
            const matchCompany = !companyFilter || e.company_id === companyFilter;
            return matchSearch && matchCompany;
        });
    }, [employees, searchTerm, companyFilter]);

    const handleCalculate = async () => {
        if (!selectedEmployee) return alert('Selecione um funcionário');

        const emp = employees.find(e => e.id === selectedEmployee);
        if (!emp) return;
        if (!emp.work_shift_id) return alert('Este funcionário não tem turno definido. Atribua um turno no cadastro de funcionários.');

        setCalculating(true);
        try {
            const result = await calculateMonth(
                emp.id,
                emp.full_name,
                year,
                month,
                emp.work_shift_id
            );
            setCalculation(result);
            setEditedPunches({}); // Limpa edições locais após recalcular
        } catch (err: any) {
            console.error(err);
            alert('Erro ao calcular: ' + (err.message || err));
        } finally {
            setCalculating(false);
        }
    };

    const handleSave = async () => {
        if (!calculation) return;
        try {
            await saveCalculation(calculation);
            alert('Cálculo salvo com sucesso!');
        } catch (err: any) {
            alert('Erro ao salvar: ' + (err.message || err));
        }
    };

    const [shifting, setShifting] = useState(false);

    const shiftDays = async (direction: -1 | 1) => {
        if (!selectedEmployee || !calculation) return;

        const emp = employees.find(e => e.id === selectedEmployee);
        if (!emp) return;

        const label = direction === -1 ? '-1 dia (recuar)' : '+1 dia (avançar)';
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

        // Buscar entries do mês
        const { data: entries, error: fetchErr } = await supabase
            .from('time_entries')
            .select('*')
            .eq('employee_id', selectedEmployee)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date');

        if (fetchErr || !entries || entries.length === 0) {
            alert('Nenhum registro encontrado neste mês para deslocar.');
            return;
        }

        const ok = confirm(`Deslocar ${entries.length} registros de ${emp.full_name} em ${label}?\n\nIsso vai alterar as datas no banco de dados.`);
        if (!ok) return;

        setShifting(true);
        try {
            // Deletar entries antigos
            const ids = entries.map(e => e.id);
            await supabase.from('time_entries').delete().in('id', ids);

            // Inserir com datas deslocadas
            const newEntries = entries.map(e => {
                const d = new Date(e.date + 'T12:00:00');
                d.setDate(d.getDate() + direction);
                const newDate = d.toISOString().split('T')[0];
                const { id, created_at, ...rest } = e;
                return { ...rest, date: newDate };
            });

            const { error: insertErr } = await supabase.from('time_entries').upsert(newEntries, { onConflict: 'employee_id,date' as any });
            if (insertErr) throw insertErr;

            // Recalcular
            await handleCalculate();
            alert(`${entries.length} registros deslocados com sucesso!`);
        } catch (err: any) {
            console.error(err);
            alert('Erro ao deslocar: ' + (err.message || err));
        } finally {
            setShifting(false);
        }
    };

    const handleExportCSV = () => {
        if (!calculation) return;

        const BOM = '\uFEFF';
        let csv = BOM + 'Data;Dia;Tipo;Ent.1;Saí.1;Ent.2;Saí.2;Ent.3;Saí.3;Trabalhado;Esperado;Extra;Falta;Noturno\n';

        calculation.days.forEach(d => {
            csv += [
                d.date.split('-').reverse().join('/'),
                DOW_SHORT[d.dayOfWeek],
                d.dayType === 'weekday' ? 'Útil' : d.dayType === 'saturday' ? 'Sáb' : d.dayType === 'sunday' ? 'Dom' : d.dayType === 'holiday' ? 'Feriado' : d.dayType,
                d.punches.entrada1 || '-',
                d.punches.saida1 || '-',
                d.punches.entrada2 || '-',
                d.punches.saida2 || '-',
                d.punches.entrada3 || '-',
                d.punches.saida3 || '-',
                minutesToHHMM(d.workedMinutes),
                minutesToHHMM(d.expectedMinutes),
                minutesToHHMM(d.overtimeMinutes),
                minutesToHHMM(d.absenceMinutes),
                minutesToHHMM(d.nightMinutes),
            ].join(';') + '\n';
        });

        csv += '\n';
        csv += `Total Trabalhado;${minutesToHHMM(calculation.totalWorked)}\n`;
        csv += `Total Esperado;${minutesToHHMM(calculation.totalExpected)}\n`;
        csv += `HE Úteis;${minutesToHHMM(calculation.overtimeWeekday)}\n`;
        csv += `HE Sábados;${minutesToHHMM(calculation.overtimeSaturday)}\n`;
        csv += `HE Domingos;${minutesToHHMM(calculation.overtimeSunday)}\n`;
        csv += `HE Feriados;${minutesToHHMM(calculation.overtimeHoliday)}\n`;
        csv += `HE 50%;${minutesToHHMM(calculation.overtime50)}\n`;
        csv += `HE 100%;${minutesToHHMM(calculation.overtime100)}\n`;
        csv += `Noturno;${minutesToHHMM(calculation.nightHours)}\n`;
        csv += `DSR;${minutesToHHMM(calculation.dsrCredit)}\n`;
        csv += `DSR Débito;${minutesToHHMM(calculation.dsrDebit)}\n`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ponto_${calculation.employeeName.replace(/\s/g, '_')}_${month}_${year}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const prevMonth = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
        setCalculation(null);
    };

    const nextMonth = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
        setCalculation(null);
    };

    const getDayTypeColor = (day: DayCalculation) => {
        if (day.isHoliday) return 'bg-red-500/10 text-red-400';
        if (day.dayType === 'sunday') return 'bg-orange-500/10 text-orange-400';
        if (day.dayType === 'saturday') return 'bg-amber-500/10 text-amber-400';
        if (day.dayType === 'compensated') return 'bg-purple-500/10 text-purple-400';
        if (day.dayType === 'off') return 'bg-slate-500/10 text-slate-400';
        return '';
    };

    const getDayIcon = (day: DayCalculation) => {
        if (day.isHoliday) return <Sun size={10} className="text-red-400" />;
        if (day.dayType === 'sunday') return <Sun size={10} className="text-orange-400" />;
        if (day.dayType === 'saturday') return <CloudSun size={10} className="text-amber-400" />;
        return null;
    };

    const getShiftForEmployee = (empId: string): ShiftOption | null => {
        const emp = employees.find(e => e.id === empId);
        if (!emp?.work_shift_id) return null;
        return shifts.find(s => s.id === emp.work_shift_id) || null;
    };

    const handleChangeShift = async (empId: string, shiftId: string) => {
        const { error } = await supabase
            .from('employees')
            .update({ work_shift_id: shiftId || null })
            .eq('id', empId);
        if (!error) {
            setEmployees(prev => prev.map(e => e.id === empId ? { ...e, work_shift_id: shiftId || null } : e));
            setCalculation(null);
        }
    };

    const getShiftScheduleForDay = (shift: ShiftOption, dayNum: number): { e1: string; s1: string; e2: string; s2: string; e3: string; s3: string; isOff: boolean } => {
        const empty = { e1: '', s1: '', e2: '', s2: '', e3: '', s3: '', isOff: true };
        if (shift.schedule_by_day && shift.schedule_by_day[String(dayNum)]) {
            const d = shift.schedule_by_day[String(dayNum)];
            if (d.is_off) return empty;
            return {
                e1: d.entrada1 || '',
                s1: d.saida1 || '',
                e2: d.entrada2 || '',
                s2: d.saida2 || '',
                e3: d.entrada3 || '',
                s3: d.saida3 || '',
                isOff: false,
            };
        }
        // Fallback to default schedule
        const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const isWorkDay = shift.work_days?.includes(dayNames[dayNum]);
        if (!isWorkDay) return empty;
        return {
            e1: shift.start_time?.slice(0, 5) || '',
            s1: shift.break_start?.slice(0, 5) || '',
            e2: shift.break_end?.slice(0, 5) || '',
            s2: shift.end_time?.slice(0, 5) || '',
            e3: '', s3: '',
            isOff: false,
        };
    };

    const selectedEmp = employees.find(e => e.id === selectedEmployee);
    const selectedShift = selectedEmp?.work_shift_id ? shifts.find(s => s.id === selectedEmp.work_shift_id) || null : null;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-6">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black flex items-center gap-3">
                                <Calculator className="text-blue-500" />
                                Cálculo de Ponto
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Calcule horas extras, adicional noturno, DSR e faltas por funcionário
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar: Lista de Funcionários */}
                    <div className="col-span-3">
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden sticky top-6">
                            <div className="p-4 border-b border-slate-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <User size={14} className="text-slate-500" />
                                    <span className="text-xs font-bold text-slate-400 uppercase">Funcionários</span>
                                    <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded ml-auto">{filteredEmployees.length}</span>
                                </div>
                                <input
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por nome ou matrícula..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 placeholder:text-slate-700"
                                />
                                {companies.length > 1 && (
                                    <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}
                                        className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none">
                                        <option value="">Todas Empresas</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                )}
                            </div>
                            <div className="max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                                {filteredEmployees.map(emp => {
                                    const shift = getShiftForEmployee(emp.id);
                                    const isSelected = selectedEmployee === emp.id;
                                    return (
                                        <button
                                            key={emp.id}
                                            onClick={() => { setSelectedEmployee(emp.id); setCalculation(null); }}
                                            className={`w-full text-left px-4 py-3 border-b border-slate-800/50 transition-all ${isSelected
                                                ? 'bg-blue-600/10 border-l-2 border-l-blue-500'
                                                : 'hover:bg-slate-800/50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className={`text-sm font-bold ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                                                        {emp.full_name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-mono">{emp.registration_number || 'S/M'}</div>
                                                </div>
                                                {shift && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: shift.color }} />
                                                        <span className="text-[9px] text-slate-500 max-w-[60px] truncate">{shift.name}</span>
                                                    </div>
                                                )}
                                                {!shift && (
                                                    <span className="text-[9px] text-red-500/60">Sem turno</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main: Resultado */}
                    <div className="col-span-9">
                        {!selectedEmployee ? (
                            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-20 text-center">
                                <Calculator size={48} className="mx-auto text-slate-700 mb-4" />
                                <h3 className="text-lg font-bold text-slate-500 mb-2">Selecione um Funcionário</h3>
                                <p className="text-sm text-slate-600">Escolha um funcionário na lista ao lado para calcular o ponto</p>
                            </div>
                        ) : (
                            <>
                                {/* Header: Nome + Turno + Ações */}
                                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 mb-4">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Info do funcionário + seletor de turno */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                                                    <User size={18} className="text-blue-400" />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-black text-white">{selectedEmp?.full_name}</h2>
                                                    <p className="text-[11px] text-slate-500 font-mono">{selectedEmp?.registration_number || 'S/M'} • {selectedEmp?.job_title || 'Sem cargo'}</p>
                                                </div>
                                            </div>
                                            {/* Seletor de Turno + Período */}
                                            <div className="flex items-center gap-4 mt-3 flex-wrap">
                                                {/* Turno */}
                                                <div className="flex items-center gap-2">
                                                    <Clock size={13} className="text-slate-500" />
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Turno:</span>
                                                    <select
                                                        value={selectedEmp?.work_shift_id || ''}
                                                        onChange={e => selectedEmp && handleChangeShift(selectedEmp.id, e.target.value)}
                                                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500 min-w-[200px]"
                                                    >
                                                        <option value="">Sem turno</option>
                                                        {shifts.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                    {selectedShift && (
                                                        <div className="w-3 h-3 rounded-full border-2 border-slate-700" style={{ backgroundColor: selectedShift.color }} />
                                                    )}
                                                </div>

                                                {/* Separador vertical */}
                                                <div className="w-px h-6 bg-slate-700" />

                                                {/* Período */}
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={13} className="text-slate-500" />
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Período:</span>
                                                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1">
                                                        <button onClick={prevMonth} className="p-1 hover:bg-slate-800 rounded transition-colors">
                                                            <ChevronLeft size={14} className="text-slate-400" />
                                                        </button>
                                                        <span className="text-sm font-bold text-white min-w-[120px] text-center">
                                                            {MONTHS[month - 1]} {year}
                                                        </span>
                                                        <button onClick={nextMonth} className="p-1 hover:bg-slate-800 rounded transition-colors">
                                                            <ChevronRight size={14} className="text-slate-400" />
                                                        </button>
                                                    </div>
                                                    <span className="text-[10px] text-slate-600 font-mono">
                                                        01/{String(month).padStart(2, '0')} a {new Date(year, month, 0).getDate()}/{String(month).padStart(2, '0')}/{year}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botões de ação */}
                                        <div className="flex gap-2 pt-1">
                                            <button onClick={handleCalculate} disabled={calculating}
                                                className={`px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-2 hover:bg-blue-500 transition-all text-sm ${calculating ? 'opacity-50 cursor-wait' : ''}`}>
                                                {calculating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                                Calcular
                                            </button>
                                            {calculation && (
                                                <>
                                                    <button onClick={handleSave}
                                                        className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all text-sm">
                                                        <CheckCircle size={14} />
                                                        Salvar
                                                    </button>
                                                    <button onClick={handleExportCSV}
                                                        className="px-4 py-2.5 rounded-xl bg-slate-700 text-white font-bold flex items-center gap-2 hover:bg-slate-600 transition-all text-sm">
                                                        <Download size={14} />
                                                        CSV
                                                    </button>
                                                    <div className="flex items-center gap-1 ml-2 border-l border-slate-700 pl-3">
                                                        <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Deslocar</span>
                                                        <button
                                                            onClick={() => shiftDays(-1)}
                                                            disabled={shifting}
                                                            className="px-2.5 py-2 rounded-lg bg-amber-600/20 text-amber-400 font-bold flex items-center gap-1 hover:bg-amber-600/30 transition-all text-xs disabled:opacity-50"
                                                            title="Recuar todos os registros em 1 dia"
                                                        >
                                                            <ChevronLeft size={12} /> -1d
                                                        </button>
                                                        <button
                                                            onClick={() => shiftDays(1)}
                                                            disabled={shifting}
                                                            className="px-2.5 py-2 rounded-lg bg-amber-600/20 text-amber-400 font-bold flex items-center gap-1 hover:bg-amber-600/30 transition-all text-xs disabled:opacity-50"
                                                            title="Avançar todos os registros em 1 dia"
                                                        >
                                                            +1d <ChevronRight size={12} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quadro Horário de Trabalho Semanal */}
                                    {selectedShift && (
                                        <div className="mt-4 pt-4 border-t border-slate-800">
                                            <div className="flex items-center gap-2 mb-2.5">
                                                <Calendar size={12} className="text-slate-500" />
                                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Horário de Trabalho — {selectedShift.name}</span>
                                                {selectedShift.is_compensated && (
                                                    <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold ml-1">COMPENSADO</span>
                                                )}
                                                <span className="text-[9px] text-slate-600 ml-auto">{selectedShift.weekly_hours}h/sem • Tol: ±{selectedShift.tolerance_overtime}min</span>
                                            </div>
                                            <div className="grid grid-cols-7 gap-1.5">
                                                {[1, 2, 3, 4, 5, 6, 7].map(dayNum => {
                                                    const dayNames = ['', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
                                                    const sched = getShiftScheduleForDay(selectedShift, dayNum);
                                                    const isSat = dayNum === 6;
                                                    const isSun = dayNum === 7;
                                                    return (
                                                        <div key={dayNum} className={`rounded-lg p-2 text-center border ${
                                                            sched.isOff
                                                                ? 'bg-slate-950/50 border-slate-800/50'
                                                                : isSun
                                                                    ? 'bg-orange-500/5 border-orange-500/20'
                                                                    : isSat
                                                                        ? 'bg-amber-500/5 border-amber-500/20'
                                                                        : 'bg-slate-950 border-slate-800'
                                                        }`}>
                                                            <div className={`text-[10px] font-black mb-1 ${
                                                                sched.isOff ? 'text-slate-600' : isSun ? 'text-orange-400' : isSat ? 'text-amber-400' : 'text-slate-400'
                                                            }`}>
                                                                {dayNames[dayNum]}
                                                            </div>
                                                            {sched.isOff ? (
                                                                <div className="text-[10px] text-slate-700 italic">Folga</div>
                                                            ) : (
                                                                <div className="space-y-0.5">
                                                                    {sched.e1 && sched.s1 && (
                                                                        <div className="text-[10px] font-mono text-slate-300">
                                                                            <span className="text-emerald-500">{sched.e1}</span>
                                                                            <span className="text-slate-600">-</span>
                                                                            <span className="text-rose-500">{sched.s1}</span>
                                                                        </div>
                                                                    )}
                                                                    {sched.e2 && sched.s2 && (
                                                                        <div className="text-[10px] font-mono text-slate-300">
                                                                            <span className="text-emerald-500">{sched.e2}</span>
                                                                            <span className="text-slate-600">-</span>
                                                                            <span className="text-rose-500">{sched.s2}</span>
                                                                        </div>
                                                                    )}
                                                                    {sched.e3 && sched.s3 && (
                                                                        <div className="text-[10px] font-mono text-slate-300">
                                                                            <span className="text-emerald-500">{sched.e3}</span>
                                                                            <span className="text-slate-600">-</span>
                                                                            <span className="text-rose-500">{sched.s3}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {!selectedShift && selectedEmp && (
                                        <div className="mt-4 pt-4 border-t border-slate-800">
                                            <div className="flex items-center gap-2 text-amber-500/70">
                                                <AlertCircle size={14} />
                                                <span className="text-xs">Selecione um turno de trabalho para este funcionário para poder calcular o ponto.</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {calculation ? (
                                    <>
                                        {/* Cards de Resumo */}
                                        <div className="grid grid-cols-6 gap-3 mb-4">
                                            <SummaryCard label="Trabalhado" value={minutesToHHMM(calculation.totalWorked)} color="text-white" />
                                            <SummaryCard label="Esperado" value={minutesToHHMM(calculation.totalExpected)} color="text-slate-400" />
                                            <SummaryCard label="HE 50%" value={minutesToHHMM(calculation.overtime50)} color="text-emerald-400" />
                                            <SummaryCard label="HE 100%" value={minutesToHHMM(calculation.overtime100)} color="text-blue-400" />
                                            <SummaryCard label="Faltas" value={minutesToHHMM(calculation.totalAbsence)} color="text-red-400" />
                                            <SummaryCard label="Noturno" value={minutesToHHMM(calculation.nightHours)} color="text-indigo-400" />
                                        </div>

                                        {/* Cards secundários */}
                                        <div className="grid grid-cols-8 gap-2 mb-4">
                                            <MiniCard label="HE Úteis" value={minutesToHHMM(calculation.overtimeWeekday)} />
                                            <MiniCard label="HE Sáb" value={minutesToHHMM(calculation.overtimeSaturday)} />
                                            <MiniCard label="HE Dom" value={minutesToHHMM(calculation.overtimeSunday)} />
                                            <MiniCard label="HE Feriado" value={minutesToHHMM(calculation.overtimeHoliday)} />
                                            <MiniCard label="DSR" value={minutesToHHMM(calculation.dsrCredit)} />
                                            <MiniCard label="DSR Déb." value={minutesToHHMM(calculation.dsrDebit)} />
                                            <MiniCard label="Dias Trab." value={String(calculation.daysWorked)} />
                                            <MiniCard label="Dias Falta" value={String(calculation.daysAbsent)} />
                                        </div>

                                        {/* Saldo */}
                                        <div className={`rounded-xl p-3 mb-4 flex items-center justify-between border ${calculation.balance >= 0
                                            ? 'bg-emerald-500/5 border-emerald-500/20'
                                            : 'bg-red-500/5 border-red-500/20'
                                            }`}>
                                            <span className="text-sm font-bold text-slate-400">Saldo do Mês:</span>
                                            <span className={`text-xl font-black font-mono ${calculation.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {calculation.balance >= 0 ? '+' : ''}{minutesToHHMM(calculation.balance)}
                                            </span>
                                        </div>

                                        {/* Tabela Detalhada */}
                                        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="bg-slate-800/50 text-slate-500 uppercase">
                                                            <th className="px-3 py-2.5 text-left">Data</th>
                                                            <th className="px-2 py-2.5 text-center">Dia</th>
                                                            <th className="px-2 py-2.5 text-center">Tipo</th>
                                                            <th className="px-2 py-2.5 text-center font-mono text-emerald-600">Ent.1</th>
                                                            <th className="px-2 py-2.5 text-center font-mono text-rose-600">Saí.1</th>
                                                            <th className="px-2 py-2.5 text-center font-mono text-emerald-600">Ent.2</th>
                                                            <th className="px-2 py-2.5 text-center font-mono text-rose-600">Saí.2</th>
                                                            <th className="px-2 py-2.5 text-center">Trab.</th>
                                                            <th className="px-2 py-2.5 text-center">Esper.</th>
                                                            <th className="px-2 py-2.5 text-center text-emerald-600">Extra</th>
                                                            <th className="px-2 py-2.5 text-center text-red-600">Falta</th>
                                                            <th className="px-2 py-2.5 text-center text-indigo-600">Not.</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {calculation.days.map((day, idx) => {
                                                            const rowColor = getDayTypeColor(day);
                                                            return (
                                                                <tr key={day.date} className={`border-t border-slate-800/30 hover:bg-slate-800/20 transition-colors ${rowColor}`}>
                                                                    <td className="px-3 py-2 font-mono font-bold text-slate-300">
                                                                        <div className="flex items-center gap-1.5">
                                                                            {getDayIcon(day)}
                                                                            {day.date.split('-')[2]}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-2 py-2 text-center text-[10px] font-bold text-slate-500">{DOW_SHORT[day.dayOfWeek]}</td>
                                                                    <td className="px-2 py-2 text-center">
                                                                        {day.isHoliday ? (
                                                                            <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold" title={day.holidayName || ''}>FER</span>
                                                                        ) : day.dayType === 'sunday' ? (
                                                                            <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold">DOM</span>
                                                                        ) : day.dayType === 'saturday' ? (
                                                                            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">SÁB</span>
                                                                        ) : day.dayType === 'compensated' ? (
                                                                            <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold">CMP</span>
                                                                        ) : (
                                                                            <span className="text-[9px] text-slate-600">ÚTL</span>
                                                                        )}
                                                                    </td>
                                                                    {/* PERÍODO 1: Ent.1 + Saí.1 */}
                                                                    {day.justification ? (
                                                                        <>
                                                                            <td colSpan={2} className="px-1 py-1 text-center relative">
                                                                                <button
                                                                                    onClick={() => setJustPopover(justPopover === `${day.date}-1` ? null : `${day.date}-1`)}
                                                                                    className="w-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded px-2 py-1 text-[10px] font-bold hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-1"
                                                                                    title="Clique para alterar ou remover justificativa"
                                                                                >
                                                                                    {justificationTypes.find(j => j.code === day.justification)?.name || day.justification}
                                                                                    <span className="text-cyan-600 text-[8px]">▼</span>
                                                                                </button>
                                                                                {justPopover === `${day.date}-1` && (
                                                                                    <div className="absolute z-50 top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[140px]">
                                                                                        <button onClick={() => handleSetPeriodJustification(day, 1, null)} className="w-full text-left px-3 py-1.5 text-[11px] text-red-400 hover:bg-slate-800 font-bold">✕ Remover</button>
                                                                                        {justificationTypes.map(jt => (
                                                                                            <button key={jt.code} onClick={() => handleSetPeriodJustification(day, 1, jt.code)}
                                                                                                className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-slate-800 ${day.justification === jt.code ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}>
                                                                                                {jt.name}
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <td className="px-1 py-1 text-center relative">
                                                                                <div onKeyDown={(e) => handleTimeKeyDown(e, day, 1)}>
                                                                                    <TimeInput
                                                                                        value={getPunchValue(day, 'entrada1')}
                                                                                        onChange={(v) => handleUpdatePunch(day.date, 'entrada1', v)}
                                                                                        onBlurSave={() => handleSavePunch(day, 'entrada1')}
                                                                                        placeholder="--:--"
                                                                                        dark
                                                                                    />
                                                                                </div>
                                                                                {justPopover === `${day.date}-1` && (
                                                                                    <div className="absolute z-50 top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[140px]">
                                                                                        <button onClick={() => setJustPopover(null)} className="w-full text-left px-3 py-1.5 text-[11px] text-slate-500 hover:bg-slate-800">Cancelar</button>
                                                                                        {justificationTypes.map(jt => (
                                                                                            <button key={jt.code} onClick={() => handleSetPeriodJustification(day, 1, jt.code)}
                                                                                                className="w-full text-left px-3 py-1.5 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-cyan-400">
                                                                                                {jt.name}
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-1 py-1 text-center">
                                                                                <div onKeyDown={(e) => handleTimeKeyDown(e, day, 1)}>
                                                                                    <TimeInput
                                                                                        value={getPunchValue(day, 'saida1')}
                                                                                        onChange={(v) => handleUpdatePunch(day.date, 'saida1', v)}
                                                                                        onBlurSave={() => handleSavePunch(day, 'saida1')}
                                                                                        placeholder="--:--"
                                                                                        dark
                                                                                    />
                                                                                </div>
                                                                            </td>
                                                                        </>
                                                                    )}
                                                                    {/* PERÍODO 2: Ent.2 + Saí.2 */}
                                                                    {day.justification2 ? (
                                                                        <>
                                                                            <td colSpan={2} className="px-1 py-1 text-center relative">
                                                                                <button
                                                                                    onClick={() => setJustPopover(justPopover === `${day.date}-2` ? null : `${day.date}-2`)}
                                                                                    className="w-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded px-2 py-1 text-[10px] font-bold hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-1"
                                                                                    title="Clique para alterar ou remover justificativa"
                                                                                >
                                                                                    {justificationTypes.find(j => j.code === day.justification2)?.name || day.justification2}
                                                                                    <span className="text-cyan-600 text-[8px]">▼</span>
                                                                                </button>
                                                                                {justPopover === `${day.date}-2` && (
                                                                                    <div className="absolute z-50 top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[140px]">
                                                                                        <button onClick={() => handleSetPeriodJustification(day, 2, null)} className="w-full text-left px-3 py-1.5 text-[11px] text-red-400 hover:bg-slate-800 font-bold">✕ Remover</button>
                                                                                        {justificationTypes.map(jt => (
                                                                                            <button key={jt.code} onClick={() => handleSetPeriodJustification(day, 2, jt.code)}
                                                                                                className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-slate-800 ${day.justification2 === jt.code ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}>
                                                                                                {jt.name}
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <td className="px-1 py-1 text-center relative">
                                                                                <div onKeyDown={(e) => handleTimeKeyDown(e, day, 2)}>
                                                                                    <TimeInput
                                                                                        value={getPunchValue(day, 'entrada2')}
                                                                                        onChange={(v) => handleUpdatePunch(day.date, 'entrada2', v)}
                                                                                        onBlurSave={() => handleSavePunch(day, 'entrada2')}
                                                                                        placeholder="--:--"
                                                                                        dark
                                                                                    />
                                                                                </div>
                                                                                {justPopover === `${day.date}-2` && (
                                                                                    <div className="absolute z-50 top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[140px]">
                                                                                        <button onClick={() => setJustPopover(null)} className="w-full text-left px-3 py-1.5 text-[11px] text-slate-500 hover:bg-slate-800">Cancelar</button>
                                                                                        {justificationTypes.map(jt => (
                                                                                            <button key={jt.code} onClick={() => handleSetPeriodJustification(day, 2, jt.code)}
                                                                                                className="w-full text-left px-3 py-1.5 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-cyan-400">
                                                                                                {jt.name}
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-1 py-1 text-center">
                                                                                <div onKeyDown={(e) => handleTimeKeyDown(e, day, 2)}>
                                                                                    <TimeInput
                                                                                        value={getPunchValue(day, 'saida2')}
                                                                                        onChange={(v) => handleUpdatePunch(day.date, 'saida2', v)}
                                                                                        onBlurSave={() => handleSavePunch(day, 'saida2')}
                                                                                        placeholder="--:--"
                                                                                        dark
                                                                                    />
                                                                                </div>
                                                                            </td>
                                                                        </>
                                                                    )}
                                                                    <td className="px-2 py-2 text-center font-mono font-bold text-white">{day.workedMinutes > 0 ? minutesToHHMM(day.workedMinutes) : <span className="text-slate-700">--:--</span>}</td>
                                                                    <td className="px-2 py-2 text-center font-mono text-slate-500">{day.expectedMinutes > 0 ? minutesToHHMM(day.expectedMinutes) : <span className="text-slate-700">--:--</span>}</td>
                                                                    <td className="px-2 py-2 text-center font-mono font-bold text-emerald-400">{day.overtimeMinutes > 0 ? minutesToHHMM(day.overtimeMinutes) : ''}</td>
                                                                    <td className="px-2 py-2 text-center font-mono font-bold text-red-400">{day.absenceMinutes > 0 ? minutesToHHMM(day.absenceMinutes) : ''}</td>
                                                                    <td className="px-2 py-2 text-center font-mono text-indigo-400">{day.nightMinutes > 0 ? minutesToHHMM(day.nightMinutes) : ''}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-slate-800/50 font-bold text-sm">
                                                            <td colSpan={7} className="px-3 py-3 text-slate-400 uppercase text-[10px]">TOTAIS DO MÊS</td>
                                                            <td className="px-2 py-3 text-center font-mono text-white">{minutesToHHMM(calculation.totalWorked)}</td>
                                                            <td className="px-2 py-3 text-center font-mono text-slate-400">{minutesToHHMM(calculation.totalExpected)}</td>
                                                            <td className="px-2 py-3 text-center font-mono text-emerald-400">{minutesToHHMM(calculation.overtime50 + calculation.overtime100)}</td>
                                                            <td className="px-2 py-3 text-center font-mono text-red-400">{minutesToHHMM(calculation.totalAbsence)}</td>
                                                            <td className="px-2 py-3 text-center font-mono text-indigo-400">{minutesToHHMM(calculation.nightHours)}</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Detalhamento de Faixas */}
                                        {(calculation.overtime50 > 0 || calculation.overtime100 > 0) && (
                                            <div className="mt-4 bg-slate-900 rounded-xl border border-slate-800 p-4">
                                                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                                    <Briefcase size={12} />
                                                    Detalhamento para Folha de Pagamento
                                                </h3>
                                                <div className="grid grid-cols-4 gap-4">
                                                    <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                                                        <span className="text-[10px] text-slate-500 block mb-1">HE 50%</span>
                                                        <span className="text-lg font-black font-mono text-emerald-400">{minutesToHHMM(calculation.overtime50)}</span>
                                                    </div>
                                                    <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                                                        <span className="text-[10px] text-slate-500 block mb-1">HE 100%</span>
                                                        <span className="text-lg font-black font-mono text-blue-400">{minutesToHHMM(calculation.overtime100)}</span>
                                                    </div>
                                                    <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                                                        <span className="text-[10px] text-slate-500 block mb-1">Adicional Noturno</span>
                                                        <span className="text-lg font-black font-mono text-indigo-400">{minutesToHHMM(calculation.nightHours)}</span>
                                                        {calculation.nightReducedHours !== calculation.nightHours && (
                                                            <span className="text-[9px] text-slate-600 block">Reduzido: {minutesToHHMM(calculation.nightReducedHours)}</span>
                                                        )}
                                                    </div>
                                                    <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                                                        <span className="text-[10px] text-slate-500 block mb-1">DSR Líquido</span>
                                                        <span className="text-lg font-black font-mono text-amber-400">{minutesToHHMM(calculation.dsrCredit - calculation.dsrDebit)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-16 text-center">
                                        {calculating ? (
                                            <>
                                                <Loader2 size={48} className="mx-auto text-blue-500 mb-4 animate-spin" />
                                                <h3 className="text-lg font-bold text-slate-400">Calculando...</h3>
                                                <p className="text-sm text-slate-600">Processando batidas e aplicando regras trabalhistas</p>
                                            </>
                                        ) : (
                                            <>
                                                <Calendar size={48} className="mx-auto text-slate-700 mb-4" />
                                                <h3 className="text-lg font-bold text-slate-500 mb-2">Pronto para Calcular</h3>
                                                <p className="text-sm text-slate-600 mb-6">
                                                    Clique em "Calcular" para processar o ponto de {MONTHS[month - 1]}/{year}
                                                </p>
                                                <button onClick={handleCalculate}
                                                    className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-2 hover:bg-blue-500 transition-all mx-auto">
                                                    <Calculator size={16} />
                                                    Calcular Ponto
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-3">
        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">{label}</span>
        <span className={`text-xl font-black font-mono ${color}`}>{value}</span>
    </div>
);

const MiniCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-slate-900/50 rounded-lg border border-slate-800/50 p-2 text-center">
        <span className="text-[9px] text-slate-600 uppercase font-bold block">{label}</span>
        <span className="text-sm font-bold font-mono text-slate-300">{value}</span>
    </div>
);

export default TimecardCalc;
