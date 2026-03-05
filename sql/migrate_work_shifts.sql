-- ============================================
-- Migração: work_shifts (evolução) + overtime_rules + holidays
-- Autor: Claude Code Session (16-17/02/2026)
-- ============================================

-- ============================================
-- 1. Evolução da tabela work_shifts
-- ============================================

-- Campos novos para suportar configurações avançadas do turno
-- (Similar ao Seculum 4: tolerâncias, compensado, almoco livre, noturno, etc.)

-- Tolerância de extras e faltas (em minutos)
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS tolerance_overtime INTEGER DEFAULT 10;
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS tolerance_absence INTEGER DEFAULT 10;

-- Tipo de carga horária: diaria, semanal, mensal
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS workload_type TEXT DEFAULT 'daily' CHECK (workload_type IN ('daily', 'weekly', 'monthly'));
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS weekly_hours NUMERIC(5,2) DEFAULT 44;
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS monthly_hours NUMERIC(6,2) DEFAULT 220;

-- Flags de comportamento
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS is_compensated BOOLEAN DEFAULT FALSE;
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS is_free_lunch BOOLEAN DEFAULT FALSE;
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS consider_holidays BOOLEAN DEFAULT TRUE;
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS deduct_late BOOLEAN DEFAULT TRUE;
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS add_early BOOLEAN DEFAULT FALSE;

-- Horários por dia da semana (JSONB) — permite configuração diferente por dia
-- Formato: { "1": { "entrada1": "07:00", "saida1": "11:00", "entrada2": "13:00", "saida2": "17:00" }, "6": { "entrada1": "07:00", "saida1": "11:00" }, "7": null }
-- Dia: 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab, 7=Dom
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS schedule_by_day JSONB DEFAULT NULL;

-- Adicional Noturno
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS night_shift_start TIME DEFAULT '22:00';
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS night_shift_end TIME DEFAULT '05:00';
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS night_shift_reduction BOOLEAN DEFAULT TRUE;

-- Banco de horas
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS use_hour_bank BOOLEAN DEFAULT FALSE;

-- Observações
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS notes TEXT;

-- Cor (para exibição no calendário)
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6';

-- Ativo
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Timestamps
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.work_shifts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- 2. Tabela: overtime_rules (Faixas de hora extra)
-- ============================================
-- Define percentuais de hora extra por turno e tipo de dia
-- Baseado no sistema Seculum 4 (tabela "faixas")

CREATE TABLE IF NOT EXISTS public.overtime_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_shift_id UUID REFERENCES public.work_shifts(id) ON DELETE CASCADE,

    -- Tipo de dia
    day_type TEXT NOT NULL DEFAULT 'weekday' CHECK (day_type IN ('weekday', 'saturday', 'sunday', 'holiday')),

    -- Faixas de hora extra (até 4 faixas)
    -- Exemplo: faixa 1 = até 2h → 50%, faixa 2 = acima de 2h → 100%
    tier1_hours NUMERIC(5,2) DEFAULT 2,      -- Até quantas horas vale a faixa 1
    tier1_percentage NUMERIC(5,2) DEFAULT 50, -- Percentual da faixa 1

    tier2_hours NUMERIC(5,2),                 -- Até quantas horas vale a faixa 2
    tier2_percentage NUMERIC(5,2) DEFAULT 100,-- Percentual da faixa 2

    tier3_hours NUMERIC(5,2),
    tier3_percentage NUMERIC(5,2),

    tier4_hours NUMERIC(5,2),
    tier4_percentage NUMERIC(5,2),

    -- Limite máximo de horas extras por dia (minutos). NULL = sem limite
    daily_limit INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Único por turno + tipo de dia
    UNIQUE(work_shift_id, day_type)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_overtime_rules_shift ON public.overtime_rules(work_shift_id);

-- RLS
ALTER TABLE public.overtime_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "overtime_rules_select" ON public.overtime_rules;
CREATE POLICY "overtime_rules_select" ON public.overtime_rules
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "overtime_rules_insert" ON public.overtime_rules;
CREATE POLICY "overtime_rules_insert" ON public.overtime_rules
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "overtime_rules_update" ON public.overtime_rules;
CREATE POLICY "overtime_rules_update" ON public.overtime_rules
    FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "overtime_rules_delete" ON public.overtime_rules;
CREATE POLICY "overtime_rules_delete" ON public.overtime_rules
    FOR DELETE TO authenticated USING (true);

GRANT ALL ON public.overtime_rules TO authenticated;

-- ============================================
-- 3. Tabela: holidays (Feriados)
-- ============================================

CREATE TABLE IF NOT EXISTS public.holidays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    type TEXT DEFAULT 'national' CHECK (type IN ('national', 'state', 'municipal', 'custom')),
    recurring BOOLEAN DEFAULT FALSE, -- Se true, repete todo ano (usa só mês/dia)
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_holidays_date ON public.holidays(date);

-- RLS
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "holidays_select" ON public.holidays;
CREATE POLICY "holidays_select" ON public.holidays
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "holidays_insert" ON public.holidays;
CREATE POLICY "holidays_insert" ON public.holidays
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "holidays_update" ON public.holidays;
CREATE POLICY "holidays_update" ON public.holidays
    FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "holidays_delete" ON public.holidays;
CREATE POLICY "holidays_delete" ON public.holidays
    FOR DELETE TO authenticated USING (true);

GRANT ALL ON public.holidays TO authenticated;

-- Inserir feriados nacionais 2026 (recorrentes)
INSERT INTO public.holidays (date, description, type, recurring) VALUES
    ('2026-01-01', 'Confraternização Universal', 'national', true),
    ('2026-02-16', 'Carnaval', 'national', true),
    ('2026-02-17', 'Carnaval', 'national', true),
    ('2026-04-03', 'Sexta-Feira Santa', 'national', true),
    ('2026-04-21', 'Tiradentes', 'national', true),
    ('2026-05-01', 'Dia do Trabalho', 'national', true),
    ('2026-06-04', 'Corpus Christi', 'national', true),
    ('2026-09-07', 'Independência do Brasil', 'national', true),
    ('2026-10-12', 'Nossa Senhora Aparecida', 'national', true),
    ('2026-11-02', 'Finados', 'national', true),
    ('2026-11-15', 'Proclamação da República', 'national', true),
    ('2026-11-20', 'Consciência Negra', 'national', true),
    ('2026-12-25', 'Natal', 'national', true)
ON CONFLICT (date) DO NOTHING;

-- Feriados municipais de Dourados-MS
INSERT INTO public.holidays (date, description, type, recurring) VALUES
    ('2026-10-11', 'Divisão do Estado (MS)', 'state', false),
    ('2026-12-08', 'Imaculada Conceição (Padroeira)', 'municipal', false),
    ('2026-12-20', 'Aniversário de Dourados', 'municipal', false)
ON CONFLICT (date) DO NOTHING;

-- ============================================
-- 4. Tabela: timecard_calculations (resultados de cálculo mensal)
-- ============================================

CREATE TABLE IF NOT EXISTS public.timecard_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL,

    -- Período
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),

    -- Turno usado no cálculo
    work_shift_id UUID,
    work_shift_name TEXT,

    -- Resultados (todos em minutos para precisão)
    normal_hours INTEGER DEFAULT 0,          -- Horas normais trabalhadas
    absence_hours INTEGER DEFAULT 0,         -- Horas de falta

    -- Extras por tipo de dia
    overtime_weekday INTEGER DEFAULT 0,      -- HE dias úteis
    overtime_saturday INTEGER DEFAULT 0,     -- HE sábados
    overtime_sunday INTEGER DEFAULT 0,       -- HE domingos
    overtime_holiday INTEGER DEFAULT 0,      -- HE feriados

    -- Extras por faixa/percentual (valor monetário calculado)
    overtime_50_hours INTEGER DEFAULT 0,     -- Total minutos a 50%
    overtime_100_hours INTEGER DEFAULT 0,    -- Total minutos a 100%

    -- DSR
    dsr_hours INTEGER DEFAULT 0,             -- DSR creditado
    dsr_debit INTEGER DEFAULT 0,             -- DSR debitado (por faltas)

    -- Adicional noturno
    night_hours INTEGER DEFAULT 0,           -- Horas noturnas
    night_reduced_hours INTEGER DEFAULT 0,   -- Horas noturnas com redução CLT

    -- Banco de Horas
    hour_bank_credit INTEGER DEFAULT 0,
    hour_bank_debit INTEGER DEFAULT 0,
    hour_bank_balance INTEGER DEFAULT 0,

    -- Totais
    total_worked INTEGER DEFAULT 0,          -- Total bruto trabalhado
    total_expected INTEGER DEFAULT 0,        -- Total esperado pelo turno
    balance INTEGER DEFAULT 0,               -- Saldo (positivo=extra, negativo=falta)

    -- Dias
    days_worked INTEGER DEFAULT 0,
    days_absent INTEGER DEFAULT 0,
    days_holiday INTEGER DEFAULT 0,
    days_weekend INTEGER DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'CALCULATED' CHECK (status IN ('CALCULATED', 'REVIEWED', 'APPROVED', 'EXPORTED')),
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by UUID,
    approved_at TIMESTAMPTZ,

    -- Período único por funcionário
    UNIQUE(employee_id, year, month)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_timecard_calc_employee ON public.timecard_calculations(employee_id);
CREATE INDEX IF NOT EXISTS idx_timecard_calc_period ON public.timecard_calculations(year, month);

-- RLS
ALTER TABLE public.timecard_calculations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "timecard_calc_select" ON public.timecard_calculations;
CREATE POLICY "timecard_calc_select" ON public.timecard_calculations
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "timecard_calc_insert" ON public.timecard_calculations;
CREATE POLICY "timecard_calc_insert" ON public.timecard_calculations
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "timecard_calc_update" ON public.timecard_calculations;
CREATE POLICY "timecard_calc_update" ON public.timecard_calculations
    FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "timecard_calc_delete" ON public.timecard_calculations;
CREATE POLICY "timecard_calc_delete" ON public.timecard_calculations
    FOR DELETE TO authenticated USING (true);

GRANT ALL ON public.timecard_calculations TO authenticated;

-- ============================================
-- 5. Evolução da tabela time_entries (adicionar campos)
-- ============================================

-- Suporte a 3 pares de entrada/saída (como Seculum 4)
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS entry_time2 TEXT;
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS break_start2 TEXT;
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS entry_time3 TEXT;
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS exit_time3 TEXT;

-- Campos calculados do dia
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS normal_minutes INTEGER;
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS overtime_minutes INTEGER;
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS absence_minutes INTEGER;
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS night_minutes INTEGER;
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS day_type TEXT DEFAULT 'weekday' CHECK (day_type IN ('weekday', 'saturday', 'sunday', 'holiday', 'compensated', 'off'));

-- Flags
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS is_compensated BOOLEAN DEFAULT FALSE;
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS is_off_day BOOLEAN DEFAULT FALSE;
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS justification TEXT;
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS work_shift_id UUID;

-- ============================================
-- 6. Trigger updated_at para work_shifts
-- ============================================

CREATE OR REPLACE FUNCTION update_work_shifts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_work_shifts_updated ON public.work_shifts;
CREATE TRIGGER trg_work_shifts_updated
    BEFORE UPDATE ON public.work_shifts
    FOR EACH ROW
    EXECUTE FUNCTION update_work_shifts_timestamp();
