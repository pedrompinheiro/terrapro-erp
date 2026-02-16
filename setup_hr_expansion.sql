-- Adiciona campos essenciais para Folha de Pagamento e Gestão de RH

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS admission_date DATE,
ADD COLUMN IF NOT EXISTS job_title TEXT, -- Cargo formal
ADD COLUMN IF NOT EXISTS department TEXT,

-- Dados Financeiros
ADD COLUMN IF NOT EXISTS base_salary NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2), -- Valor da hora
ADD COLUMN IF NOT EXISTS weekly_hours NUMERIC(10, 2) DEFAULT 44.0, -- Carga horária semanal
ADD COLUMN IF NOT EXISTS transport_fare NUMERIC(10, 2) DEFAULT 0.0, -- Vale Transporte diário
ADD COLUMN IF NOT EXISTS meal_allowance NUMERIC(10, 2) DEFAULT 0.0, -- Vale Refeição diário

-- Dados Bancários
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_agency TEXT,
ADD COLUMN IF NOT EXISTS bank_account TEXT,
ADD COLUMN IF NOT EXISTS bank_account_type TEXT, -- Corrente/Poupança
ADD COLUMN IF NOT EXISTS pix_key TEXT,

-- Documentos
ADD COLUMN IF NOT EXISTS rg TEXT,
ADD COLUMN IF NOT EXISTS cnh_number TEXT,
ADD COLUMN IF NOT EXISTS cnh_category TEXT,
ADD COLUMN IF NOT EXISTS cnh_expiry DATE;

-- Criação da tabela de Folha de Pagamento (Payrolls)
CREATE TABLE IF NOT EXISTS payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id),
    reference_month DATE NOT NULL, -- Primeiro dia do mês de referência (ex: 2026-01-01)
    
    base_salary NUMERIC(10, 2) NOT NULL,
    total_hours NUMERIC(10, 2) DEFAULT 0,
    extra_hours_50 NUMERIC(10, 2) DEFAULT 0,
    extra_hours_100 NUMERIC(10, 2) DEFAULT 0,
    missing_hours NUMERIC(10, 2) DEFAULT 0,
    
    additions NUMERIC(10, 2) DEFAULT 0, -- Adicionais (Periculosidade, etc)
    discounts NUMERIC(10, 2) DEFAULT 0, -- INSS, IRRF, Faltas
    
    net_salary NUMERIC(10, 2) NOT NULL, -- Salário Líquido
    status TEXT DEFAULT 'DRAFT', -- DRAFT, APPROVED, PAID
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS para Payrolls
ALTER TABLE payrolls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Payrolls" ON payrolls FOR SELECT USING (true);
CREATE POLICY "Auth Insert Payrolls" ON payrolls FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth Update Payrolls" ON payrolls FOR UPDATE TO authenticated USING (true);
