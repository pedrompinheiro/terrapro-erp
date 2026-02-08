
-- 1. Criação das tabelas (se não existirem)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    registration_number TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    entry_time TIME,
    break_start TIME,
    break_end TIME,
    exit_time TIME,
    total_hours TEXT, -- Armazenando como texto HH:mm por simplicidade
    status TEXT DEFAULT 'REGULAR', -- 'REGULAR', 'ABSENT', 'MANUAL_EDIT', 'OVERTIME'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Habilitar RLS e criar políticas de leitura pública
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Employees" ON employees;
DROP POLICY IF EXISTS "Public Read Time Entries" ON time_entries;

CREATE POLICY "Public Read Employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Public Read Time Entries" ON time_entries FOR SELECT USING (true);

-- Política para permitir INSERT/UPDATE autenticado (se necessário)
CREATE POLICY "Enable insert for authenticated users only" ON employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON employees FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON time_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON time_entries FOR UPDATE TO authenticated USING (true);


-- 3. Inserir dados de teste (apenas se a tabela estiver vazia)
DO $$
DECLARE
    emp_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM employees LIMIT 1) THEN
        INSERT INTO employees (name, role, registration_number)
        VALUES ('João da Silva Teste', 'Motorista', '12345')
        RETURNING id INTO emp_id;

        INSERT INTO time_entries (employee_id, date, entry_time, break_start, break_end, exit_time, total_hours, status)
        VALUES 
            (emp_id, '2026-01-01', '08:00', '12:00', '13:00', '17:00', '08:00', 'REGULAR'),
            (emp_id, '2026-01-02', '08:05', '12:10', '13:05', '17:05', '08:00', 'REGULAR'),
            (emp_id, '2026-01-03', NULL, NULL, NULL, NULL, '00:00', 'ABSENT');
    END IF;
END $$;
