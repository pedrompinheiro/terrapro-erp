-- ============================================
-- MÓDULO FOLHA DE PAGAMENTO
-- Tabelas para importação de holerites XLSX,
-- conferência com ponto e geração de contas a pagar
-- ============================================

-- 1. TABELA CABEÇALHO (uma por competência)
CREATE TABLE IF NOT EXISTS folha_pagamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competencia_ano INTEGER NOT NULL,
    competencia_mes INTEGER NOT NULL CHECK (competencia_mes BETWEEN 1 AND 12),
    status TEXT NOT NULL DEFAULT 'RASCUNHO'
        CHECK (status IN ('RASCUNHO', 'CONFERIDO', 'APROVADO', 'GERADO')),

    -- Totais calculados
    total_bruto NUMERIC(12,2) DEFAULT 0,
    total_liquido NUMERIC(12,2) DEFAULT 0,
    total_ifood NUMERIC(12,2) DEFAULT 0,
    total_funcionarios INTEGER DEFAULT 0,

    -- Metadata
    observacoes TEXT,
    imported_at TIMESTAMPTZ,
    imported_by TEXT,
    contas_geradas_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(competencia_ano, competencia_mes)
);

-- 2. TABELA ITENS (uma linha por funcionário por competência)
CREATE TABLE IF NOT EXISTS folha_pagamento_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folha_id UUID NOT NULL REFERENCES folha_pagamento(id) ON DELETE CASCADE,

    -- Identificação do funcionário
    employee_id UUID REFERENCES employees(id),
    employee_name TEXT NOT NULL,
    employee_code TEXT,                        -- código extraído (ex: "44" de "André - 44")
    company_section TEXT NOT NULL,             -- DOURADAO, CONSTRUTERRA, TRANS_TERRA
    company_id UUID,                           -- UUID da empresa em companies

    -- Valores da planilha
    salario_mensal NUMERIC(10,2) DEFAULT 0,
    adiantamento NUMERIC(10,2) DEFAULT 0,
    gastos_loja NUMERIC(10,2) DEFAULT 0,
    coopercred_uniodonto NUMERIC(10,2) DEFAULT 0,
    marmita_outros NUMERIC(10,2) DEFAULT 0,
    salario_liquido NUMERIC(10,2) DEFAULT 0,
    forma_pagamento TEXT,
    ifood_valor NUMERIC(10,2) DEFAULT 0,
    observacoes TEXT,

    -- Cross-reference com cálculo de ponto (timecard_calculations)
    tc_overtime_50_min INTEGER,
    tc_overtime_100_min INTEGER,
    tc_total_worked_min INTEGER,
    tc_absence_min INTEGER,
    tc_balance_min INTEGER,
    planilha_menciona_he BOOLEAN DEFAULT FALSE,
    discrepancia_flag BOOLEAN DEFAULT FALSE,
    discrepancia_notas TEXT,

    -- Links para contas a pagar geradas
    conta_salario_id UUID,
    conta_ifood_id UUID,

    -- Link com tabela entities (para fornecedor_id no contas_pagar)
    entity_id UUID,

    -- Status do matching com employees
    match_status TEXT DEFAULT 'PENDENTE'
        CHECK (match_status IN ('PENDENTE', 'MATCHED', 'MANUAL', 'NAO_ENCONTRADO')),
    match_score INTEGER,

    -- Controle
    incluir BOOLEAN DEFAULT TRUE,  -- checkbox de inclusão/exclusão
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_folha_pagamento_competencia
    ON folha_pagamento(competencia_ano, competencia_mes);
CREATE INDEX IF NOT EXISTS idx_folha_itens_folha
    ON folha_pagamento_itens(folha_id);
CREATE INDEX IF NOT EXISTS idx_folha_itens_employee
    ON folha_pagamento_itens(employee_id);
CREATE INDEX IF NOT EXISTS idx_folha_itens_company
    ON folha_pagamento_itens(company_id);
CREATE INDEX IF NOT EXISTS idx_folha_itens_match
    ON folha_pagamento_itens(match_status);

-- 4. COLUNA entity_id NA TABELA employees (link com entities para contas a pagar)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES entities(id);

-- 5. RLS (mesmo padrão existente do projeto)
ALTER TABLE folha_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE folha_pagamento_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Folha" ON folha_pagamento;
CREATE POLICY "Public Read Folha" ON folha_pagamento FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth Write Folha" ON folha_pagamento;
CREATE POLICY "Auth Write Folha" ON folha_pagamento FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Public Read Folha Itens" ON folha_pagamento_itens;
CREATE POLICY "Public Read Folha Itens" ON folha_pagamento_itens FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth Write Folha Itens" ON folha_pagamento_itens;
CREATE POLICY "Auth Write Folha Itens" ON folha_pagamento_itens FOR ALL TO authenticated USING (true);

-- 6. TRIGGER updated_at
CREATE OR REPLACE FUNCTION update_folha_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_folha_updated_at ON folha_pagamento;
CREATE TRIGGER trg_folha_updated_at
    BEFORE UPDATE ON folha_pagamento
    FOR EACH ROW
    EXECUTE FUNCTION update_folha_updated_at();

-- 7. GRANTS (padrão do projeto)
GRANT ALL ON folha_pagamento TO authenticated;
GRANT ALL ON folha_pagamento_itens TO authenticated;
GRANT SELECT ON folha_pagamento TO anon;
GRANT SELECT ON folha_pagamento_itens TO anon;
