
-- SCRIPT DE CORREÇÃO (SCHEMA ATUALIZADO)
-- Este script respeita as colunas reais do seu banco (full_name, job_title, etc)

DO $$
DECLARE
    v_company_id UUID;
    v_emp_id UUID;
BEGIN
    -- 1. Tenta recuperar uma empresa existente para vincular o funcionário
    SELECT id INTO v_company_id FROM companies LIMIT 1;

    -- Se não existir empresa, cria uma (assumindo tabela companies padrao)
    IF v_company_id IS NULL THEN
        INSERT INTO companies (name) VALUES ('TerraPro Transportadora') 
        RETURNING id INTO v_company_id;
    END IF;

    -- 2. Inserir Funcionário (Usando full_name e job_title)
    -- Verifica se já existe para não duplicar
    SELECT id INTO v_emp_id FROM employees WHERE registration_number = 'SQL-FIX-01';

    IF v_emp_id IS NULL THEN
        INSERT INTO employees (
            company_id, 
            full_name, 
            job_title, 
            registration_number, 
            created_at
        )
        VALUES (
            v_company_id, 
            'Funcionário Teste SQL', 
            'Motorista', 
            'SQL-FIX-01', 
            NOW()
        )
        RETURNING id INTO v_emp_id;
    END IF;

    -- 3. Inserir Registro de Ponto (Usando numeric para total_hours)
    IF NOT EXISTS (SELECT 1 FROM time_entries WHERE employee_id = v_emp_id AND date = CURRENT_DATE) THEN
        INSERT INTO time_entries (
            company_id,
            employee_id,
            date,
            entry_time,
            exit_time,
            total_hours,
            status,
            source
        )
        VALUES (
            v_company_id,
            v_emp_id,
            CURRENT_DATE,
            '08:00:00',
            '17:00:00',
            8.0, -- Numeric, não string
            'APPROVED',
            'MANUAL'
        );
    END IF;
    
    RAISE NOTICE 'Seed realizado com sucesso para Company ID: % e Employee ID: %', v_company_id, v_emp_id;
END $$;

-- 4. Ajustar Permissões (RLS)
-- Liberando acesso geral para facilitar o desenvolvimento
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access Employees" ON employees;
CREATE POLICY "Public Full Access Employees" ON employees FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access TimeEntries" ON time_entries;
CREATE POLICY "Public Full Access TimeEntries" ON time_entries FOR ALL USING (true) WITH CHECK (true);
