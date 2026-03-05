-- ============================================
-- Importação de Turnos do Seculum 4
-- 30 turnos com horários por dia + faixas de extra
-- Autor: Claude Code Session (17/02/2026)
-- ============================================

-- Limpar turnos antigos (se quiser começar limpo)
-- DELETE FROM overtime_rules; DELETE FROM work_shifts;

-- Turno 1: LOJA
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('LOJA', '#10b981', '07:00', '11:00', '13:00', '17:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', '{"1": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "2": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "3": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "4": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "5": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "6": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "", "saida2": ""}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #1');

-- Turno 2: LOJA TURNO 02
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('LOJA TURNO 02', '#f59e0b', '07:30', '12:30', '14:00', '17:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', '{"1": {"entrada1": "07:30", "saida1": "12:30", "entrada2": "14:00", "saida2": "17:00"}, "2": {"entrada1": "07:30", "saida1": "12:30", "entrada2": "14:00", "saida2": "17:00"}, "3": {"entrada1": "07:30", "saida1": "12:30", "entrada2": "14:00", "saida2": "17:00"}, "4": {"entrada1": "07:30", "saida1": "12:30", "entrada2": "14:00", "saida2": "17:00"}, "5": {"entrada1": "07:30", "saida1": "12:30", "entrada2": "14:00", "saida2": "17:00"}, "6": {"entrada1": "07:30", "saida1": "11:30", "entrada2": "", "saida2": ""}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, false, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #2');

-- Turno 3: TURNO A BAL
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('TURNO A BAL', '#ef4444', '06:00', '11:00', '12:00', '14:20', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "06:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "14:20"}, "2": {"entrada1": "06:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "14:20"}, "3": {"entrada1": "06:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "14:20"}, "4": {"entrada1": "06:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "14:20"}, "5": {"entrada1": "06:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "14:20"}, "6": {"entrada1": "06:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "14:20"}, "7": {"entrada1": "06:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "14:20"}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #3');

-- Turno 4: TURNO B BAL
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('TURNO B BAL', '#8b5cf6', '13:40', '19:00', '20:00', '22:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "13:40", "saida1": "19:00", "entrada2": "20:00", "saida2": "22:00"}, "2": {"entrada1": "13:40", "saida1": "19:00", "entrada2": "20:00", "saida2": "22:00"}, "3": {"entrada1": "13:40", "saida1": "19:00", "entrada2": "20:00", "saida2": "22:00"}, "4": {"entrada1": "13:40", "saida1": "19:00", "entrada2": "20:00", "saida2": "22:00"}, "5": {"entrada1": "13:40", "saida1": "19:00", "entrada2": "20:00", "saida2": "22:00"}, "6": {"entrada1": "13:40", "saida1": "19:00", "entrada2": "20:00", "saida2": "22:00"}, "7": {"entrada1": "13:40", "saida1": "19:00", "entrada2": "20:00", "saida2": "22:00"}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #4');

-- Turno 5: TURNO C BAL
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('TURNO C BAL', '#ec4899', '21:40', '00:00', '01:00', '06:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "21:40", "saida1": "00:00", "entrada2": "01:00", "saida2": "06:00"}, "2": {"entrada1": "21:40", "saida1": "00:00", "entrada2": "01:00", "saida2": "06:00"}, "3": {"entrada1": "21:40", "saida1": "00:00", "entrada2": "01:00", "saida2": "06:00"}, "4": {"entrada1": "21:40", "saida1": "00:00", "entrada2": "01:00", "saida2": "06:00"}, "5": {"entrada1": "21:40", "saida1": "00:00", "entrada2": "01:00", "saida2": "06:00"}, "6": {"entrada1": "21:40", "saida1": "00:00", "entrada2": "01:00", "saida2": "06:00"}, "7": {"entrada1": "21:40", "saida1": "00:00", "entrada2": "01:00", "saida2": "06:00"}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #5');

-- Turno 6: BAL
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('BAL', '#06b6d4', '07:00', '11:00', '12:00', '17:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', '{"1": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "2": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "3": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "4": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "5": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "6": {"entrada1": "07:00", "saida1": "14:00", "entrada2": "", "saida2": ""}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #6');

-- Turno 7: TURNO A MTV 12HRS
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('TURNO A MTV 12HRS', '#84cc16', '07:00', '11:00', '12:30', '15:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}, "2": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}, "3": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}, "4": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}, "5": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}, "6": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}, "7": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #7');

-- Turno 8: TURNO A MTV 12HRS FOLGAS
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('TURNO A MTV 12HRS FOLGAS', '#f97316', '07:00', '11:00', '13:00', '17:00', '{}', '{"1": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}, "2": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}, "3": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}, "4": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}, "5": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}, "6": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #8');

-- Turno 9: BAL 2 turnos farelo
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('BAL 2 turnos farelo', '#6366f1', '05:00', '21:40', '13:00', '17:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', '{"1": {"entrada1": "05:00", "saida1": "21:40", "entrada2": "", "saida2": ""}, "2": {"entrada1": "05:00", "saida1": "21:40", "entrada2": "", "saida2": ""}, "3": {"entrada1": "05:00", "saida1": "21:40", "entrada2": "", "saida2": ""}, "4": {"entrada1": "05:00", "saida1": "21:40", "entrada2": "", "saida2": ""}, "5": {"entrada1": "05:00", "saida1": "21:40", "entrada2": "", "saida2": ""}, "6": {"entrada1": "05:00", "saida1": "21:40", "entrada2": "", "saida2": ""}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #9');

-- Turno 10: BAL Lenha 08-2017
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('BAL Lenha 08-2017', '#3b82f6', '08:00', '11:00', '12:00', '17:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', '{"1": {"entrada1": "08:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "2": {"entrada1": "08:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "3": {"entrada1": "08:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "4": {"entrada1": "08:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "5": {"entrada1": "08:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "6": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "", "saida2": ""}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #10');

-- Turno 11: TURNO A MTV
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('TURNO A MTV', '#10b981', '07:00', '11:00', '12:00', '15:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "15:00"}, "2": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "15:00"}, "3": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "15:00"}, "4": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "15:00"}, "5": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "15:00"}, "6": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "15:00"}, "7": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "15:00"}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #11');

-- Turno 12: TURNO B MTV
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('TURNO B MTV', '#f59e0b', '15:00', '19:00', '20:30', '23:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "15:00", "saida1": "19:00", "entrada2": "20:30", "saida2": "23:00"}, "2": {"entrada1": "15:00", "saida1": "19:00", "entrada2": "20:30", "saida2": "23:00"}, "3": {"entrada1": "15:00", "saida1": "19:00", "entrada2": "20:30", "saida2": "23:00"}, "4": {"entrada1": "15:00", "saida1": "19:00", "entrada2": "20:30", "saida2": "23:00"}, "5": {"entrada1": "15:00", "saida1": "19:00", "entrada2": "20:30", "saida2": "23:00"}, "6": {"entrada1": "15:00", "saida1": "19:00", "entrada2": "20:30", "saida2": "23:00"}, "7": {"entrada1": "15:00", "saida1": "19:00", "entrada2": "20:30", "saida2": "23:00"}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #12');

-- Turno 13: TURNO C MTV
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('TURNO C MTV', '#ef4444', '23:00', '03:00', '04:30', '07:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "23:00", "saida1": "03:00", "entrada2": "04:30", "saida2": "07:00"}, "2": {"entrada1": "23:00", "saida1": "03:00", "entrada2": "04:30", "saida2": "07:00"}, "3": {"entrada1": "23:00", "saida1": "03:00", "entrada2": "04:30", "saida2": "07:00"}, "4": {"entrada1": "23:00", "saida1": "03:00", "entrada2": "04:30", "saida2": "07:00"}, "5": {"entrada1": "23:00", "saida1": "03:00", "entrada2": "04:30", "saida2": "07:00"}, "6": {"entrada1": "23:00", "saida1": "03:00", "entrada2": "04:30", "saida2": "07:00"}, "7": {"entrada1": "23:00", "saida1": "03:00", "entrada2": "04:30", "saida2": "07:00"}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #13');

-- Turno 14: TURNO B MTV 12 HRS
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('TURNO B MTV 12 HRS', '#8b5cf6', '19:00', '23:00', '00:30', '02:30', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}, "2": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}, "3": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}, "4": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}, "5": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}, "6": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}, "7": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #14');

-- Turno 15: TURNO B MTV 12 HRS II
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('TURNO B MTV 12 HRS II', '#ec4899', '07:00', '11:00', '12:30', '15:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}, "2": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}, "3": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}, "4": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}, "5": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}, "6": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}, "7": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:30", "saida2": "15:00", "entrada3": "16:00", "saida3": "19:00"}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #15');

-- Turno 16: TURNO C MTV 12 HRS
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('TURNO C MTV 12 HRS', '#06b6d4', '19:00', '23:00', '00:30', '02:30', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}, "2": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}, "3": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}, "4": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}, "5": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}, "6": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}, "7": {"entrada1": "19:00", "saida1": "23:00", "entrada2": "00:30", "saida2": "02:30", "entrada3": "03:30", "saida3": "07:00"}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #16');

-- Turno 17: BAL FARELO TURNO A
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('BAL FARELO TURNO A', '#84cc16', '05:00', '11:00', '12:00', '13:20', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', '{"1": {"entrada1": "05:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "13:20"}, "2": {"entrada1": "05:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "13:20"}, "3": {"entrada1": "05:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "13:20"}, "4": {"entrada1": "05:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "13:20"}, "5": {"entrada1": "05:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "13:20"}, "6": {"entrada1": "05:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "13:20"}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #17');

-- Turno 18: BAL FARELO TURBO B
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('BAL FARELO TURBO B', '#f97316', '13:20', '19:00', '20:00', '21:40', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', '{"1": {"entrada1": "13:20", "saida1": "19:00", "entrada2": "20:00", "saida2": "21:40"}, "2": {"entrada1": "13:20", "saida1": "19:00", "entrada2": "20:00", "saida2": "21:40"}, "3": {"entrada1": "13:20", "saida1": "19:00", "entrada2": "20:00", "saida2": "21:40"}, "4": {"entrada1": "13:20", "saida1": "19:00", "entrada2": "20:00", "saida2": "21:40"}, "5": {"entrada1": "13:20", "saida1": "19:00", "entrada2": "20:00", "saida2": "21:40"}, "6": {"entrada1": "13:20", "saida1": "19:00", "entrada2": "20:00", "saida2": "21:40"}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #18');

-- Turno 19: BAL SILOS TEMPORARIOS
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('BAL SILOS TEMPORARIOS', '#6366f1', '07:30', '11:30', '12:30', '17:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', '{"1": {"entrada1": "07:30", "saida1": "11:30", "entrada2": "12:30", "saida2": "17:00"}, "2": {"entrada1": "07:30", "saida1": "11:30", "entrada2": "12:30", "saida2": "17:00"}, "3": {"entrada1": "07:30", "saida1": "11:30", "entrada2": "12:30", "saida2": "17:00"}, "4": {"entrada1": "07:30", "saida1": "11:30", "entrada2": "12:30", "saida2": "17:00"}, "5": {"entrada1": "07:30", "saida1": "11:30", "entrada2": "12:30", "saida2": "17:00"}, "6": {"entrada1": "07:30", "saida1": "12:00", "entrada2": "", "saida2": ""}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #19');

-- Turno 20: SEG A SEXTA
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('SEG A SEXTA', '#3b82f6', '07:00', '11:00', '12:00', '17:00', '{Monday,Tuesday,Wednesday,Thursday,Friday}', '{"1": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "2": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "3": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "4": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "17:00"}, "5": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "16:00"}, "6": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #20');

-- Turno 21: INPASA
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('INPASA', '#10b981', '07:00', '11:00', '13:00', '17:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', '{"1": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "2": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "3": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "4": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "5": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "6": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "", "saida2": ""}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #21');

-- Turno 23: teste turno c 2
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('teste turno c 2', '#ef4444', '07:00', '11:00', '13:00', '17:00', '{Tuesday,Wednesday,Thursday,Friday,Saturday}', '{"1": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}, "2": {"entrada1": "23:00", "saida1": "01:30", "entrada2": "02:30", "saida2": "07:00"}, "3": {"entrada1": "23:00", "saida1": "01:30", "entrada2": "02:30", "saida2": "07:00"}, "4": {"entrada1": "23:00", "saida1": "01:30", "entrada2": "02:30", "saida2": "07:00"}, "5": {"entrada1": "23:00", "saida1": "01:30", "entrada2": "02:30", "saida2": "07:00"}, "6": {"entrada1": "23:00", "saida1": "01:30", "entrada2": "02:30", "saida2": "07:00"}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #23');

-- Turno 24: ESTAGIARIO
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('ESTAGIARIO', '#8b5cf6', '13:00', '17:00', '13:00', '17:00', '{Monday,Tuesday,Wednesday,Thursday,Friday}', '{"1": {"entrada1": "13:00", "saida1": "17:00", "entrada2": "", "saida2": ""}, "2": {"entrada1": "13:00", "saida1": "17:00", "entrada2": "", "saida2": ""}, "3": {"entrada1": "13:00", "saida1": "17:00", "entrada2": "", "saida2": ""}, "4": {"entrada1": "13:00", "saida1": "17:00", "entrada2": "", "saida2": ""}, "5": {"entrada1": "13:00", "saida1": "17:00", "entrada2": "", "saida2": ""}, "6": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #24');

-- Turno 25: Oficina
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('Oficina', '#ec4899', '07:00', '11:00', '13:00', '17:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', '{"1": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "2": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "3": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "4": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "5": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "6": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "", "saida2": ""}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, false, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #25');

-- Turno 26: TRECHO
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('TRECHO', '#06b6d4', '07:00', '11:00', '13:00', '17:00', '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday}', '{"1": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "2": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "3": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "4": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "5": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00"}, "6": {"entrada1": "07:00", "saida1": "11:00", "entrada2": "", "saida2": ""}, "7": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}}'::jsonb, 5, 5, true, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #26');

-- Turno 27: Silo Temporário - Turno A
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('Silo Temporário - Turno A', '#84cc16', '07:00', '11:00', '13:00', '17:00', '{Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}, "2": {"entrada1": "05:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "13:20"}, "3": {"entrada1": "05:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "13:20"}, "4": {"entrada1": "05:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "13:20"}, "5": {"entrada1": "05:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "13:20"}, "6": {"entrada1": "05:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "13:20"}, "7": {"entrada1": "05:00", "saida1": "11:00", "entrada2": "12:00", "saida2": "13:20"}}'::jsonb, 5, 5, false, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #27');

-- Turno 28: SILO T1
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('SILO T1', '#f97316', '07:00', '11:00', '13:00', '17:00', '{Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}, "2": {"entrada1": "05:00", "saida1": "10:00", "entrada2": "11:00", "saida2": "13:20"}, "3": {"entrada1": "05:00", "saida1": "10:00", "entrada2": "11:00", "saida2": "13:20"}, "4": {"entrada1": "05:00", "saida1": "10:00", "entrada2": "11:00", "saida2": "13:20"}, "5": {"entrada1": "05:00", "saida1": "10:00", "entrada2": "11:00", "saida2": "13:20"}, "6": {"entrada1": "05:00", "saida1": "10:00", "entrada2": "11:00", "saida2": "13:20"}, "7": {"entrada1": "05:00", "saida1": "10:00", "entrada2": "11:00", "saida2": "13:20"}}'::jsonb, 5, 5, false, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #28');

-- Turno 29: SILO T2
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('SILO T2', '#6366f1', '07:00', '11:00', '13:00', '17:00', '{Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}, "2": {"entrada1": "13:40", "saida1": "16:00", "entrada2": "17:00", "saida2": "22:00"}, "3": {"entrada1": "13:40", "saida1": "16:00", "entrada2": "17:00", "saida2": "22:00"}, "4": {"entrada1": "13:40", "saida1": "16:00", "entrada2": "17:00", "saida2": "22:00"}, "5": {"entrada1": "13:40", "saida1": "16:00", "entrada2": "17:00", "saida2": "22:00"}, "6": {"entrada1": "13:40", "saida1": "16:00", "entrada2": "17:00", "saida2": "22:00"}, "7": {"entrada1": "13:40", "saida1": "16:00", "entrada2": "17:00", "saida2": "22:00"}}'::jsonb, 5, 5, false, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #29');

-- Turno 30: SILO T3
INSERT INTO work_shifts (name, color, start_time, break_start, break_end, end_time, work_days, schedule_by_day, tolerance_overtime, tolerance_absence, is_compensated, is_free_lunch, consider_holidays, deduct_late, add_early, night_shift_start, night_shift_end, night_shift_reduction, use_hour_bank, workload_type, weekly_hours, monthly_hours, active, notes)
VALUES ('SILO T3', '#3b82f6', '07:00', '11:00', '13:00', '17:00', '{Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{"1": {"entrada1": "", "saida1": "", "entrada2": "", "saida2": "", "is_off": true}, "2": {"entrada1": "22:00", "saida1": "01:30", "entrada2": "02:30", "saida2": "05:00"}, "3": {"entrada1": "22:00", "saida1": "01:30", "entrada2": "02:30", "saida2": "05:00"}, "4": {"entrada1": "22:00", "saida1": "01:30", "entrada2": "02:30", "saida2": "05:00"}, "5": {"entrada1": "22:00", "saida1": "01:30", "entrada2": "02:30", "saida2": "05:00"}, "6": {"entrada1": "22:00", "saida1": "01:30", "entrada2": "02:30", "saida2": "05:00"}, "7": {"entrada1": "22:00", "saida1": "01:30", "entrada2": "02:30", "saida2": "05:00"}}'::jsonb, 5, 5, false, false, true, false, false, '22:00', '05:00', true, false, 'weekly', 44, 220, true, 'Importado do Seculum 4 - Turno #30');


-- ============================================
-- Faixas de hora extra por turno
-- ============================================

DO $$
DECLARE
  v_shift_id UUID;
BEGIN
  -- Faixas para turno 1: LOJA
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'LOJA' AND notes LIKE '%Turno #1%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'saturday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'sunday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'holiday', 0.0, 100.0, NULL, 100);
  END IF;

  -- Faixas para turno 2: LOJA TURNO 02
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'LOJA TURNO 02' AND notes LIKE '%Turno #2%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 3: TURNO A BAL
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'TURNO A BAL' AND notes LIKE '%Turno #3%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'saturday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'sunday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'holiday', 2.0, 50.0, 2.0, 100.0);
  END IF;

  -- Faixas para turno 4: TURNO B BAL
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'TURNO B BAL' AND notes LIKE '%Turno #4%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'saturday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'sunday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'holiday', 2.0, 50.0, 2.0, 100.0);
  END IF;

  -- Faixas para turno 5: TURNO C BAL
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'TURNO C BAL' AND notes LIKE '%Turno #5%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'saturday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'sunday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'holiday', 2.0, 50.0, 2.0, 100.0);
  END IF;

  -- Faixas para turno 6: BAL
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'BAL' AND notes LIKE '%Turno #6%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 7: TURNO A MTV 12HRS
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'TURNO A MTV 12HRS' AND notes LIKE '%Turno #7%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'sunday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'holiday', 0.0, 100.0, NULL, 100);
  END IF;

  -- Faixas para turno 8: TURNO A MTV 12HRS FOLGAS
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'TURNO A MTV 12HRS FOLGAS' AND notes LIKE '%Turno #8%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'sunday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'holiday', 0.0, 100.0, NULL, 100);
  END IF;

  -- Faixas para turno 9: BAL 2 turnos farelo
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'BAL 2 turnos farelo' AND notes LIKE '%Turno #9%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 10: BAL Lenha 08-2017
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'BAL Lenha 08-2017' AND notes LIKE '%Turno #10%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 11: TURNO A MTV
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'TURNO A MTV' AND notes LIKE '%Turno #11%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 12: TURNO B MTV
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'TURNO B MTV' AND notes LIKE '%Turno #12%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 13: TURNO C MTV
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'TURNO C MTV' AND notes LIKE '%Turno #13%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 14: TURNO B MTV 12 HRS
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'TURNO B MTV 12 HRS' AND notes LIKE '%Turno #14%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 15: TURNO B MTV 12 HRS II
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'TURNO B MTV 12 HRS II' AND notes LIKE '%Turno #15%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 16: TURNO C MTV 12 HRS
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'TURNO C MTV 12 HRS' AND notes LIKE '%Turno #16%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 17: BAL FARELO TURNO A
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'BAL FARELO TURNO A' AND notes LIKE '%Turno #17%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'saturday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'sunday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'holiday', 0.0, 100.0, NULL, 100);
  END IF;

  -- Faixas para turno 18: BAL FARELO TURBO B
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'BAL FARELO TURBO B' AND notes LIKE '%Turno #18%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'saturday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'sunday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'holiday', 0.0, 100.0, NULL, 100);
  END IF;

  -- Faixas para turno 19: BAL SILOS TEMPORARIOS
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'BAL SILOS TEMPORARIOS' AND notes LIKE '%Turno #19%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 20: SEG A SEXTA
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'SEG A SEXTA' AND notes LIKE '%Turno #20%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 21: INPASA
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'INPASA' AND notes LIKE '%Turno #21%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 23: teste turno c 2
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'teste turno c 2' AND notes LIKE '%Turno #23%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 24: ESTAGIARIO
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'ESTAGIARIO' AND notes LIKE '%Turno #24%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 25: Oficina
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'Oficina' AND notes LIKE '%Turno #25%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 26: TRECHO
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'TRECHO' AND notes LIKE '%Turno #26%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 27: Silo Temporário - Turno A
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'Silo Temporário - Turno A' AND notes LIKE '%Turno #27%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'saturday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'sunday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'holiday', 2.0, 50.0, 2.0, 100.0);
  END IF;

  -- Faixas para turno 28: SILO T1
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'SILO T1' AND notes LIKE '%Turno #28%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'saturday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'sunday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'holiday', 2.0, 50.0, 2.0, 100.0);
  END IF;

  -- Faixas para turno 29: SILO T2
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'SILO T2' AND notes LIKE '%Turno #29%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2, 50, NULL, 100);
  END IF;

  -- Faixas para turno 30: SILO T3
  SELECT id INTO v_shift_id FROM work_shifts WHERE name = 'SILO T3' AND notes LIKE '%Turno #30%' LIMIT 1;
  IF v_shift_id IS NOT NULL THEN
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'weekday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'saturday', 0.0, 100.0, NULL, 100);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'sunday', 2.0, 50.0, 2.0, 100.0);
    INSERT INTO overtime_rules (work_shift_id, day_type, tier1_hours, tier1_percentage, tier2_hours, tier2_percentage) VALUES (v_shift_id, 'holiday', 2.0, 50.0, 2.0, 100.0);
  END IF;

END $$;