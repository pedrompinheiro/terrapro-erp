import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calculator, Calendar, Clock, User, ChevronLeft, ChevronRight, Download, Loader2, Moon, AlertCircle, CheckCircle, Sun, CloudSun, Briefcase, RefreshCw, Shield, Printer, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
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
    // Impressão em lote
    const [bulkPrinting, setBulkPrinting] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, name: '' });
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkStartDate, setBulkStartDate] = useState('');
    const [bulkEndDate, setBulkEndDate] = useState('');

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

        try {
            const { data: existing } = await supabase
                .from('time_entries')
                .select('id')
                .eq('employee_id', selectedEmployee)
                .eq('date', day.date)
                .maybeSingle();

            if (existing) {
                const { error } = await supabase
                    .from('time_entries')
                    .update({ justification: justCode })
                    .eq('id', existing.id);
                if (error) { console.error('Erro ao atualizar justificativa:', error); alert('Erro: ' + error.message); return; }
            } else if (justCode) {
                const { error } = await supabase
                    .from('time_entries')
                    .insert({
                        employee_id: selectedEmployee,
                        company_id: emp?.company_id || null,
                        date: day.date,
                        justification: justCode,
                    });
                if (error) { console.error('Erro ao salvar justificativa:', error); alert('Erro: ' + error.message); return; }
            }

            await handleCalculate(true);
        } catch (err: any) {
            console.error('Erro na justificativa:', err);
            alert('Erro ao salvar justificativa: ' + (err.message || err));
        }
    };

    // Mapa de campo local → coluna no banco
    const punchFieldToColumn: Record<string, string> = {
        entrada1: 'entry_time',
        saida1: 'break_start',
        entrada2: 'break_end',
        saida2: 'exit_time',
        entrada3: 'entry_time2',
        saida3: 'break_start2',
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

        // Limpa APENAS o campo salvo do editedPunches (preserva edições em outros campos)
        setEditedPunches(prev => {
            const copy = { ...prev };
            if (copy[day.date]) {
                const { [field]: _, ...rest } = copy[day.date];
                if (Object.keys(rest).length === 0) {
                    delete copy[day.date];
                } else {
                    copy[day.date] = rest;
                }
            }
            return copy;
        });

        // Recalcular silenciosamente (sem piscar loading)
        await handleCalculate(true);
    }, [selectedEmployee, employees, editedPunches]);

    // Pega o valor do punch: prioriza edição local, senão usa o calculado
    const getPunchValue = useCallback((day: DayCalculation, field: string): string => {
        if (editedPunches[day.date] && field in editedPunches[day.date]) {
            return editedPunches[day.date][field];
        }
        return (day.punches as any)[field] || '';
    }, [editedPunches]);

    // Salvar justificativa por período (1 ou 2)
    const handleSetPeriodJustification = async (day: DayCalculation, period: 1 | 2, justCode: string | null) => {
        if (!selectedEmployee) return;
        const emp = employees.find(e => e.id === selectedEmployee);
        const dbField = period === 1 ? 'justification' : 'justification2';

        try {
            const { data: existing } = await supabase
                .from('time_entries')
                .select('id')
                .eq('employee_id', selectedEmployee)
                .eq('date', day.date)
                .maybeSingle();

            if (existing) {
                const { error } = await supabase
                    .from('time_entries')
                    .update({ [dbField]: justCode })
                    .eq('id', existing.id);
                if (error) { console.error('Erro ao atualizar justificativa:', error); alert('Erro: ' + error.message); return; }
            } else if (justCode) {
                const { error } = await supabase
                    .from('time_entries')
                    .insert({
                        employee_id: selectedEmployee,
                        company_id: emp?.company_id || null,
                        date: day.date,
                        [dbField]: justCode,
                    });
                if (error) { console.error('Erro ao inserir justificativa:', error); alert('Erro: ' + error.message); return; }
            }

            setJustPopover(null);
            await handleCalculate(true);
        } catch (err: any) {
            console.error('Erro na justificativa:', err);
            alert('Erro ao salvar justificativa: ' + (err.message || err));
        }
    };

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

    const handleCalculate = async (silent = false) => {
        if (!selectedEmployee) return !silent && alert('Selecione um funcionário');

        const emp = employees.find(e => e.id === selectedEmployee);
        if (!emp) return;
        if (!emp.work_shift_id) return !silent && alert('Este funcionário não tem turno definido. Atribua um turno no cadastro de funcionários.');

        if (!silent) setCalculating(true);
        try {
            const result = await calculateMonth(
                emp.id,
                emp.full_name,
                year,
                month,
                emp.work_shift_id
            );
            setCalculation(result);
            // Só limpa edições locais em recálculo explícito (botão "Calcular").
            // Em recálculo silencioso (após salvar batida), preserva edições
            // em andamento para evitar perder dados que o usuário está digitando.
            if (!silent) {
                setEditedPunches({});
            }
        } catch (err: any) {
            console.error(err);
            if (!silent) alert('Erro ao calcular: ' + (err.message || err));
        } finally {
            if (!silent) setCalculating(false);
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

    const [shiftingDay, setShiftingDay] = useState<string | null>(null);

    /** Desloca as batidas de UM único dia para a data anterior ou seguinte */
    const shiftSingleDay = async (date: string, direction: -1 | 1) => {
        if (!selectedEmployee || shiftingDay) return;

        const newDate = (() => {
            const d = new Date(date + 'T12:00:00');
            d.setDate(d.getDate() + direction);
            return d.toISOString().split('T')[0];
        })();

        // Verificar se já existe entry na data destino
        const { data: destEntry } = await supabase
            .from('time_entries')
            .select('id')
            .eq('employee_id', selectedEmployee)
            .eq('date', newDate)
            .maybeSingle();

        if (destEntry) {
            const ok = confirm(`Já existe um registro em ${newDate.split('-').reverse().join('/')}. Deseja sobrescrever?`);
            if (!ok) return;
        }

        setShiftingDay(date);
        try {
            // Buscar entry do dia
            const { data: entry, error: fetchErr } = await supabase
                .from('time_entries')
                .select('*')
                .eq('employee_id', selectedEmployee)
                .eq('date', date)
                .maybeSingle();

            if (fetchErr || !entry) {
                setShiftingDay(null);
                return;
            }

            // Deletar da data original
            await supabase.from('time_entries').delete().eq('id', entry.id);

            // Inserir na nova data (sobrescreve se existir)
            if (destEntry) {
                await supabase.from('time_entries').delete().eq('id', destEntry.id);
            }

            const { id, created_at, ...rest } = entry;
            await supabase.from('time_entries').insert({ ...rest, date: newDate });

            // Recalcular silenciosamente
            await handleCalculate(true);
        } catch (err: any) {
            console.error('Erro ao deslocar dia:', err);
            alert('Erro: ' + (err.message || err));
        } finally {
            setShiftingDay(null);
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

    // ============================================
    // Impressão em lote de todos os funcionários
    // ============================================
    const handleBulkPrint = async () => {
        if (!bulkStartDate || !bulkEndDate) {
            alert('Selecione o período inicial e final.');
            return;
        }
        if (bulkStartDate > bulkEndDate) {
            alert('A data inicial deve ser anterior à data final.');
            return;
        }

        // Extrair mês/ano da data inicial para o calculateMonth
        const [sy, sm] = bulkStartDate.split('-').map(Number);
        const [ey, em] = bulkEndDate.split('-').map(Number);

        setBulkPrinting(true);
        setBulkProgress({ current: 0, total: 0, name: 'Buscando funcionários...' });

        try {
            // 1. Buscar todos employee_ids que têm batidas no período
            const { data: entriesData, error: entriesErr } = await supabase
                .from('time_entries')
                .select('employee_id')
                .gte('date', bulkStartDate)
                .lte('date', bulkEndDate);

            if (entriesErr) throw entriesErr;
            if (!entriesData || entriesData.length === 0) {
                alert(`Nenhum funcionário tem batidas registradas no período selecionado.`);
                setBulkPrinting(false);
                return;
            }

            // IDs únicos
            const uniqueIds = [...new Set(entriesData.map(e => e.employee_id))];

            // 2. Filtrar apenas funcionários com turno definido
            const empsWithShift = employees.filter(e => uniqueIds.includes(e.id) && e.work_shift_id);

            if (empsWithShift.length === 0) {
                alert('Nenhum funcionário com turno definido encontrado com batidas neste período.');
                setBulkPrinting(false);
                return;
            }

            setBulkProgress({ current: 0, total: empsWithShift.length, name: '' });

            // 3. Calcular cada funcionário (usa mês da data inicial)
            // Se o período cruza meses, calcula o mês inicial (os dias serão filtrados no HTML)
            const allCalculations: MonthCalculation[] = [];
            for (let i = 0; i < empsWithShift.length; i++) {
                const emp = empsWithShift[i];
                setBulkProgress({ current: i + 1, total: empsWithShift.length, name: emp.full_name });

                try {
                    const result = await calculateMonth(emp.id, emp.full_name, sy, sm, emp.work_shift_id!);
                    if (result) allCalculations.push(result);
                } catch (err) {
                    console.warn(`Erro ao calcular ${emp.full_name}:`, err);
                }
            }

            if (allCalculations.length === 0) {
                alert('Nenhum cálculo gerado. Verifique se os turnos estão configurados corretamente.');
                setBulkPrinting(false);
                return;
            }

            // 4. Gerar HTML de visualização — filtra dias pelo período escolhido
            const printHtml = generateBulkPrintHtml(allCalculations, sm, sy, bulkStartDate, bulkEndDate);

            // 5. Abrir janela de visualização
            const printWindow = window.open('', '_blank', 'width=1100,height=900');
            if (printWindow) {
                printWindow.document.write(printHtml);
                printWindow.document.close();
            }

            setShowBulkModal(false);
        } catch (err: any) {
            console.error('Erro na impressão em lote:', err);
            alert('Erro: ' + (err.message || err));
        } finally {
            setBulkPrinting(false);
        }
    };

    const handleBulkExportXlsx = async () => {
        if (!bulkStartDate || !bulkEndDate) { alert('Selecione o período inicial e final.'); return; }
        if (bulkStartDate > bulkEndDate) { alert('A data inicial deve ser anterior à data final.'); return; }

        const [sy, sm] = bulkStartDate.split('-').map(Number);
        const DOW = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

        setBulkPrinting(true);
        setBulkProgress({ current: 0, total: 0, name: 'Buscando funcionários...' });

        try {
            const { data: entriesData, error: entriesErr } = await supabase
                .from('time_entries')
                .select('employee_id')
                .gte('date', bulkStartDate)
                .lte('date', bulkEndDate);

            if (entriesErr) throw entriesErr;
            if (!entriesData || entriesData.length === 0) { alert('Nenhum funcionário tem batidas no período.'); setBulkPrinting(false); return; }

            const uniqueIds = [...new Set(entriesData.map(e => e.employee_id))];
            const empsWithShift = employees.filter(e => uniqueIds.includes(e.id) && e.work_shift_id);
            if (empsWithShift.length === 0) { alert('Nenhum funcionário com turno definido.'); setBulkPrinting(false); return; }

            setBulkProgress({ current: 0, total: empsWithShift.length, name: '' });

            const wb = XLSX.utils.book_new();

            for (let i = 0; i < empsWithShift.length; i++) {
                const emp = empsWithShift[i];
                setBulkProgress({ current: i + 1, total: empsWithShift.length, name: emp.full_name });

                try {
                    const calc = await calculateMonth(emp.id, emp.full_name, sy, sm, emp.work_shift_id!);
                    if (!calc) continue;

                    const filteredDays = calc.days.filter(d => d.date >= bulkStartDate && d.date <= bulkEndDate);

                    // Header rows
                    const shiftInfo = shifts.find(s => s.id === calc.shiftId);
                    const headerRows = [
                        ['CARTÃO DE PONTO — ' + emp.full_name],
                        ['Mat: ' + (emp.registration_number || 'S/M'), 'Cargo: ' + (emp.job_title || '-'), 'Turno: ' + (shiftInfo?.name || '-')],
                        [],
                        ['Dia', 'DS', 'Tp', 'Ent.1', 'Saí.1', 'Ent.2', 'Saí.2', 'Ent.3', 'Saí.3', 'Trab.', 'Esp.', 'HE 50%', 'HE 100%', 'Extra', 'Falta', 'Not.'],
                    ];

                    // Day rows
                    let fTotalWorked = 0, fTotalExpected = 0, fTotalAbsence = 0, fOvertime50 = 0, fOvertime100 = 0;
                    let fOvertimeTotal = 0, fNightHours = 0, fDaysWorked = 0, fDaysAbsent = 0;

                    const dayRows = filteredDays.map(d => {
                        const dow = DOW[d.dayOfWeek];
                        const tp = d.isHoliday ? 'FER' : d.dayType === 'compensated' ? 'CMP' : '';
                        const he50 = d.overtimeTiers.filter(t => t.percentage <= 50).reduce((s, t) => s + t.minutes, 0);
                        const he100 = d.overtimeTiers.filter(t => t.percentage > 50).reduce((s, t) => s + t.minutes, 0);

                        fTotalWorked += d.workedMinutes;
                        fTotalExpected += d.expectedMinutes;
                        fTotalAbsence += d.absenceMinutes;
                        fNightHours += d.nightMinutes;
                        fOvertime50 += he50;
                        fOvertime100 += he100;
                        fOvertimeTotal += d.overtimeMinutes;
                        if (d.workedMinutes > 0) fDaysWorked++;
                        if (d.hasAbsence || d.isMissing) fDaysAbsent++;

                        return [
                            d.date.split('-')[2],
                            dow,
                            tp,
                            d.punches.entrada1 || '',
                            d.punches.saida1 || '',
                            d.punches.entrada2 || '',
                            d.punches.saida2 || '',
                            d.punches.entrada3 || '',
                            d.punches.saida3 || '',
                            minutesToHHMM(d.workedMinutes),
                            minutesToHHMM(d.expectedMinutes),
                            he50 > 0 ? minutesToHHMM(he50) : '',
                            he100 > 0 ? minutesToHHMM(he100) : '',
                            d.overtimeMinutes > 0 ? minutesToHHMM(d.overtimeMinutes) : '',
                            d.absenceMinutes > 0 ? minutesToHHMM(d.absenceMinutes) : '',
                            d.nightMinutes > 0 ? minutesToHHMM(d.nightMinutes) : '',
                        ];
                    });

                    const fBalance = fTotalWorked - fTotalExpected;
                    const summaryRows = [
                        [],
                        ['Trabalhado:', minutesToHHMM(fTotalWorked), '', 'Esperado:', minutesToHHMM(fTotalExpected), '', 'HE 50%:', minutesToHHMM(fOvertime50), '', 'HE 100%:', minutesToHHMM(fOvertime100)],
                        ['Faltas:', minutesToHHMM(fTotalAbsence), '', 'Noturno:', minutesToHHMM(fNightHours), '', 'Dias Trab:', String(fDaysWorked), '', 'Dias Falta:', String(fDaysAbsent)],
                        ['Saldo:', (fBalance >= 0 ? '+' : '') + minutesToHHMM(fBalance)],
                    ];

                    const allRows = [...headerRows, ...dayRows, ...summaryRows];
                    const ws = XLSX.utils.aoa_to_sheet(allRows);

                    // Ajustar largura das colunas
                    ws['!cols'] = [
                        { wch: 5 }, { wch: 5 }, { wch: 5 },
                        { wch: 7 }, { wch: 7 }, { wch: 7 }, { wch: 7 }, { wch: 7 }, { wch: 7 },
                        { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
                    ];

                    // Nome da aba (max 31 chars, sem caracteres especiais)
                    const sheetName = emp.full_name.substring(0, 31).replace(/[\\/*?:\[\]]/g, '');
                    XLSX.utils.book_append_sheet(wb, ws, sheetName);
                } catch (err) {
                    console.warn(`Erro ao calcular ${emp.full_name}:`, err);
                }
            }

            if (wb.SheetNames.length === 0) { alert('Nenhum cálculo gerado.'); setBulkPrinting(false); return; }

            const formatDateFile = (d: string) => d.split('-').reverse().join('-');
            XLSX.writeFile(wb, `Cartao_Ponto_${formatDateFile(bulkStartDate)}_a_${formatDateFile(bulkEndDate)}.xlsx`);
            setShowBulkModal(false);
        } catch (err: any) {
            console.error('Erro ao exportar XLSX:', err);
            alert('Erro: ' + (err.message || err));
        } finally {
            setBulkPrinting(false);
        }
    };

    /** Gera HTML completo para impressão de múltiplos cartões de ponto */
    const generateBulkPrintHtml = (calculations: MonthCalculation[], m: number, y: number, filterStart?: string, filterEnd?: string): string => {
        const DOW = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

        // Formatar período para exibição
        const formatDateBR = (d: string) => {
            const [yy, mm, dd] = d.split('-');
            return `${dd}/${mm}/${yy}`;
        };
        const periodLabel = filterStart && filterEnd
            ? `${formatDateBR(filterStart)} a ${formatDateBR(filterEnd)}`
            : `${MONTHS[m - 1].toUpperCase()} / ${y}`;

        const employeePages = calculations.map((calc, idx) => {
            // Filtrar dias pelo período selecionado
            const filteredDays = (filterStart && filterEnd)
                ? calc.days.filter(d => d.date >= filterStart && d.date <= filterEnd)
                : calc.days;

            // Recalcular totais para o período filtrado
            let fTotalWorked = 0, fTotalExpected = 0, fTotalAbsence = 0;
            let fOvertime50 = 0, fOvertime100 = 0;
            let fOvertimeWeekday = 0, fOvertimeSaturday = 0, fOvertimeSunday = 0, fOvertimeHoliday = 0;
            let fNightHours = 0, fDaysWorked = 0, fDaysAbsent = 0;

            filteredDays.forEach(d => {
                fTotalWorked += d.workedMinutes;
                fTotalExpected += d.expectedMinutes;
                fTotalAbsence += d.absenceMinutes;
                fNightHours += d.nightMinutes;
                if (d.workedMinutes > 0) fDaysWorked++;
                if (d.hasAbsence || d.isMissing) fDaysAbsent++;
                if (d.overtimeMinutes > 0) {
                    switch (d.dayType) {
                        case 'weekday': fOvertimeWeekday += d.overtimeMinutes; break;
                        case 'saturday': fOvertimeSaturday += d.overtimeMinutes; break;
                        case 'sunday': fOvertimeSunday += d.overtimeMinutes; break;
                        case 'holiday': fOvertimeHoliday += d.overtimeMinutes; break;
                    }
                }
                d.overtimeTiers.forEach(tier => {
                    if (tier.percentage <= 50) fOvertime50 += tier.minutes;
                    else fOvertime100 += tier.minutes;
                });
            });

            const fBalance = fTotalWorked - fTotalExpected;

            const rows = filteredDays.map(d => {
                const dow = DOW[d.dayOfWeek];
                const isWeekend = d.dayOfWeek === 0 || d.dayOfWeek === 6;
                const isHoliday = d.isHoliday;
                const bgClass = isHoliday ? 'background:#fff0f0;' : isWeekend ? 'background:#fffbeb;' : '';
                const dayLabel = d.date.split('-')[2];

                return `<tr style="${bgClass}">
                    <td style="text-align:center;font-weight:bold;">${dayLabel}</td>
                    <td style="text-align:center;font-size:10px;">${dow}</td>
                    <td style="text-align:center;font-size:10px;">${isHoliday ? 'FER' : d.dayType === 'compensated' ? 'CMP' : ''}</td>
                    <td style="text-align:center;font-family:monospace;">${d.punches.entrada1 || ''}</td>
                    <td style="text-align:center;font-family:monospace;">${d.punches.saida1 || ''}</td>
                    <td style="text-align:center;font-family:monospace;">${d.punches.entrada2 || ''}</td>
                    <td style="text-align:center;font-family:monospace;">${d.punches.saida2 || ''}</td>
                    <td style="text-align:center;font-family:monospace;">${d.punches.entrada3 || ''}</td>
                    <td style="text-align:center;font-family:monospace;">${d.punches.saida3 || ''}</td>
                    <td style="text-align:center;font-weight:bold;">${minutesToHHMM(d.workedMinutes)}</td>
                    <td style="text-align:center;">${minutesToHHMM(d.expectedMinutes)}</td>
                    <td style="text-align:center;color:#059669;">${(() => { const m50 = d.overtimeTiers.filter(t => t.percentage <= 50).reduce((s, t) => s + t.minutes, 0); return m50 > 0 ? minutesToHHMM(m50) : ''; })()}</td>
                    <td style="text-align:center;color:#2563eb;">${(() => { const m100 = d.overtimeTiers.filter(t => t.percentage > 50).reduce((s, t) => s + t.minutes, 0); return m100 > 0 ? minutesToHHMM(m100) : ''; })()}</td>
                    <td style="text-align:center;color:#059669;font-weight:bold;">${d.overtimeMinutes > 0 ? minutesToHHMM(d.overtimeMinutes) : ''}</td>
                    <td style="text-align:center;color:#dc2626;font-weight:bold;">${d.absenceMinutes > 0 ? minutesToHHMM(d.absenceMinutes) : ''}</td>
                    <td style="text-align:center;color:#4f46e5;">${d.nightMinutes > 0 ? minutesToHHMM(d.nightMinutes) : ''}</td>
                </tr>`;
            }).join('');

            const empInfo = employees.find(e => e.id === calc.employeeId);
            const shiftInfo = shifts.find(s => s.id === calc.shiftId);

            return `
            <div class="page" style="${idx > 0 ? 'page-break-before:always;' : ''}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;border-bottom:2px solid #000;padding-bottom:8px;">
                    <div>
                        <h2 style="margin:0;font-size:16px;">CARTÃO DE PONTO</h2>
                        <p style="margin:2px 0 0;font-size:11px;color:#666;">TERRA TRANSPORTADORA — ${periodLabel}</p>
                    </div>
                    <div style="text-align:right;font-size:11px;">
                        <strong>${calc.employeeName}</strong><br/>
                        Mat: ${empInfo?.registration_number || 'S/M'} &nbsp;|&nbsp; Cargo: ${empInfo?.job_title || '-'}<br/>
                        Turno: ${shiftInfo?.name || '-'}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width:30px;">Dia</th>
                            <th style="width:30px;">DS</th>
                            <th style="width:30px;">Tp</th>
                            <th>Ent.1</th>
                            <th>Saí.1</th>
                            <th>Ent.2</th>
                            <th>Saí.2</th>
                            <th>Ent.3</th>
                            <th>Saí.3</th>
                            <th>Trab.</th>
                            <th>Esp.</th>
                            <th>50%</th>
                            <th>100%</th>
                            <th>Extra</th>
                            <th>Falta</th>
                            <th>Not.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>

                <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;font-size:10px;border-top:1px solid #ccc;padding-top:8px;">
                    <div class="summary-box"><strong>Trabalhado:</strong> ${minutesToHHMM(fTotalWorked)}</div>
                    <div class="summary-box"><strong>Esperado:</strong> ${minutesToHHMM(fTotalExpected)}</div>
                    <div class="summary-box" style="color:#059669;"><strong>HE 50%:</strong> ${minutesToHHMM(fOvertime50)}</div>
                    <div class="summary-box" style="color:#2563eb;"><strong>HE 100%:</strong> ${minutesToHHMM(fOvertime100)}</div>
                    <div class="summary-box"><strong>HE Útil:</strong> ${minutesToHHMM(fOvertimeWeekday)}</div>
                    <div class="summary-box"><strong>HE Sáb:</strong> ${minutesToHHMM(fOvertimeSaturday)}</div>
                    <div class="summary-box"><strong>HE Dom:</strong> ${minutesToHHMM(fOvertimeSunday)}</div>
                    <div class="summary-box"><strong>HE Fer:</strong> ${minutesToHHMM(fOvertimeHoliday)}</div>
                    <div class="summary-box" style="color:#dc2626;"><strong>Faltas:</strong> ${minutesToHHMM(fTotalAbsence)}</div>
                    <div class="summary-box" style="color:#4f46e5;"><strong>Noturno:</strong> ${minutesToHHMM(fNightHours)}</div>
                    <div class="summary-box"><strong>Dias Trab:</strong> ${fDaysWorked}</div>
                    <div class="summary-box"><strong>Dias Falta:</strong> ${fDaysAbsent}</div>
                    <div class="summary-box" style="font-weight:bold;font-size:11px;${fBalance >= 0 ? 'color:#059669;' : 'color:#dc2626;'}"><strong>Saldo:</strong> ${fBalance >= 0 ? '+' : ''}${minutesToHHMM(fBalance)}</div>
                </div>

                <div style="margin-top:24px;display:flex;justify-content:space-between;font-size:10px;">
                    <div style="border-top:1px solid #000;width:200px;text-align:center;padding-top:4px;">Assinatura do Funcionário</div>
                    <div style="border-top:1px solid #000;width:200px;text-align:center;padding-top:4px;">Assinatura do Gestor</div>
                </div>
            </div>`;
        }).join('');

        const totalEmployees = calculations.length;

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cartão de Ponto — ${periodLabel} — Todos os Funcionários</title>
    <style>
        @page { size: A4 portrait; margin: 10mm 8mm; }
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; margin: 0; padding: 0; }
        .page { padding: 8px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th, td { border: 1px solid #ccc; padding: 3px 4px; }
        th { background: #f1f5f9; font-size: 9px; text-transform: uppercase; font-weight: bold; text-align: center; }
        .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 3px 6px; border-radius: 3px; }
        .toolbar {
            position: sticky; top: 0; z-index: 100;
            background: #1e293b; color: white; padding: 12px 24px;
            display: flex; align-items: center; justify-content: space-between;
            border-bottom: 2px solid #334155; box-shadow: 0 2px 8px rgba(0,0,0,.3);
        }
        .toolbar h3 { margin: 0; font-size: 14px; }
        .toolbar .info { font-size: 12px; color: #94a3b8; }
        .toolbar button {
            padding: 8px 20px; border: none; border-radius: 8px; font-size: 13px;
            font-weight: bold; cursor: pointer; margin-left: 8px; transition: all .15s;
        }
        .btn-print { background: #3b82f6; color: white; }
        .btn-print:hover { background: #2563eb; }
        .btn-pdf { background: #059669; color: white; }
        .btn-pdf:hover { background: #047857; }
        .btn-close { background: #475569; color: white; }
        .btn-close:hover { background: #64748b; }
        .content { padding: 16px 24px; max-width: 210mm; margin: 0 auto; }
        @media print {
            .toolbar { display: none !important; }
            .content { padding: 0; max-width: 100%; }
            .page { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <div>
            <h3>📋 Cartão de Ponto — ${periodLabel}</h3>
            <span class="info">${totalEmployees} funcionário(s) • Pronto para impressão ou download</span>
        </div>
        <div>
            <button class="btn-print" onclick="window.print()" title="Ctrl+P para imprimir">🖨️ Imprimir</button>
            <button class="btn-pdf" onclick="window.print()" title="No diálogo de impressão, selecione 'Salvar como PDF'">📄 Salvar PDF</button>
            <button class="btn-close" onclick="window.close()">✕ Fechar</button>
        </div>
    </div>
    <div class="content">
        ${employeePages}
    </div>
</body>
</html>`;
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
                        <button
                            onClick={() => {
                                const sd = `${year}-${String(month).padStart(2, '0')}-01`;
                                const lastDay = new Date(year, month, 0).getDate();
                                const ed = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
                                setBulkStartDate(sd);
                                setBulkEndDate(ed);
                                setShowBulkModal(true);
                            }}
                            disabled={employees.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm hover:bg-slate-700 hover:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Gerar relatório de ponto de todos os funcionários"
                        >
                            <Printer size={16} />
                            Relatório Geral
                        </button>
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
                                            <button onClick={() => handleCalculate()} disabled={calculating}
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
                                                            <th className="px-1 py-2.5 text-center w-[52px]" title="Deslocar dia">Mov.</th>
                                                            <th className="px-3 py-2.5 text-left">Data</th>
                                                            <th className="px-2 py-2.5 text-center">Dia</th>
                                                            <th className="px-2 py-2.5 text-center">Tipo</th>
                                                            <th className="px-2 py-2.5 text-center font-mono text-emerald-600">Ent.1</th>
                                                            <th className="px-2 py-2.5 text-center font-mono text-rose-600">Saí.1</th>
                                                            <th className="px-2 py-2.5 text-center font-mono text-emerald-600">Ent.2</th>
                                                            <th className="px-2 py-2.5 text-center font-mono text-rose-600">Saí.2</th>
                                                            <th className="px-2 py-2.5 text-center font-mono text-emerald-600">Ent.3</th>
                                                            <th className="px-2 py-2.5 text-center font-mono text-rose-600">Saí.3</th>
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
                                                                <tr key={day.date} className={`border-t border-slate-800/30 hover:bg-slate-800/20 transition-colors group ${rowColor}`}>
                                                                    {/* Botões deslocar por linha */}
                                                                    <td className="px-1 py-1 text-center">
                                                                        <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            {shiftingDay === day.date ? (
                                                                                <Loader2 size={12} className="animate-spin text-amber-400" />
                                                                            ) : (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => shiftSingleDay(day.date, -1)}
                                                                                        disabled={!!shiftingDay}
                                                                                        title={`Mover batidas de ${day.date.split('-').reverse().join('/')} para dia anterior`}
                                                                                        className="p-1 rounded bg-amber-600/20 text-amber-400 hover:bg-amber-600/40 transition-all disabled:opacity-30"
                                                                                    >
                                                                                        <ChevronLeft size={11} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => shiftSingleDay(day.date, 1)}
                                                                                        disabled={!!shiftingDay}
                                                                                        title={`Mover batidas de ${day.date.split('-').reverse().join('/')} para dia seguinte`}
                                                                                        className="p-1 rounded bg-amber-600/20 text-amber-400 hover:bg-amber-600/40 transition-all disabled:opacity-30"
                                                                                    >
                                                                                        <ChevronRight size={11} />
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </td>
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
                                                                    {/* PERÍODO 3: Ent.3 + Saí.3 */}
                                                                    <td className="px-1 py-1 text-center">
                                                                        <TimeInput
                                                                            value={getPunchValue(day, 'entrada3')}
                                                                            onChange={(v) => handleUpdatePunch(day.date, 'entrada3', v)}
                                                                            onBlurSave={() => handleSavePunch(day, 'entrada3')}
                                                                            placeholder="--:--"
                                                                            dark
                                                                        />
                                                                    </td>
                                                                    <td className="px-1 py-1 text-center">
                                                                        <TimeInput
                                                                            value={getPunchValue(day, 'saida3')}
                                                                            onChange={(v) => handleUpdatePunch(day.date, 'saida3', v)}
                                                                            onBlurSave={() => handleSavePunch(day, 'saida3')}
                                                                            placeholder="--:--"
                                                                            dark
                                                                        />
                                                                    </td>
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
                                                            <td colSpan={9} className="px-3 py-3 text-slate-400 uppercase text-[10px]">TOTAIS DO MÊS</td>
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
                                                <button onClick={() => handleCalculate()}
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

            {/* Modal de Relatório Geral */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={e => { if (e.target === e.currentTarget && !bulkPrinting) setShowBulkModal(false); }}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-600/20 p-2.5 rounded-xl">
                                <Printer size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Relatório Geral de Ponto</h3>
                                <p className="text-xs text-slate-500">Cartão de ponto de todos os funcionários</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Período</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1.5 block">De</label>
                                        <input
                                            type="date"
                                            value={bulkStartDate}
                                            onChange={e => setBulkStartDate(e.target.value)}
                                            disabled={bulkPrinting}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1.5 block">Até</label>
                                        <input
                                            type="date"
                                            value={bulkEndDate}
                                            onChange={e => setBulkEndDate(e.target.value)}
                                            disabled={bulkPrinting}
                                            min={bulkStartDate}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                                {bulkStartDate && bulkEndDate && (
                                    <div className="mt-2 bg-blue-600/10 border border-blue-600/20 rounded-lg px-3 py-2 text-xs text-blue-300">
                                        Período: {bulkStartDate.split('-').reverse().join('/')} a {bulkEndDate.split('-').reverse().join('/')}
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-xs text-slate-400">
                                <p>• O relatório incluirá <strong className="text-white">todos os funcionários</strong> com batidas no período selecionado.</p>
                                <p className="mt-1">• Uma nova aba será aberta com a visualização. Você pode <strong className="text-white">imprimir</strong> ou <strong className="text-white">salvar como PDF</strong>.</p>
                            </div>
                        </div>

                        {bulkPrinting && (
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Processando...</span>
                                    <span>{bulkProgress.current}/{bulkProgress.total}</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: bulkProgress.total > 0 ? `${(bulkProgress.current / bulkProgress.total) * 100}%` : '0%' }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1 truncate">{bulkProgress.name}</p>
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowBulkModal(false)}
                                disabled={bulkPrinting}
                                className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-all disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBulkExportXlsx}
                                disabled={bulkPrinting || employees.length === 0}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {bulkPrinting ? (
                                    <><Loader2 size={14} className="animate-spin" /> Gerando...</>
                                ) : (
                                    <><FileSpreadsheet size={14} /> Salvar XLSX</>
                                )}
                            </button>
                            <button
                                onClick={handleBulkPrint}
                                disabled={bulkPrinting || employees.length === 0}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {bulkPrinting ? (
                                    <><Loader2 size={14} className="animate-spin" /> Gerando...</>
                                ) : (
                                    <><Printer size={14} /> Imprimir / PDF</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
