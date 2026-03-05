-- ============================================================
-- FASE 1: FUNDACAO FINANCEIRA
-- TerraPro ERP — Migration segura (nao destrutiva)
-- ============================================================

-- ==================
-- 1. EXPANDIR TABELAS EXISTENTES (ALTER, nao CREATE)
-- ==================

-- Contas a Receber: adicionar campos faltantes
ALTER TABLE contas_receber
  ADD COLUMN IF NOT EXISTS competencia DATE,
  ADD COLUMN IF NOT EXISTS data_liquidacao DATE,
  ADD COLUMN IF NOT EXISTS nota_fiscal_id UUID,
  ADD COLUMN IF NOT EXISTS plano_contas_id UUID,
  ADD COLUMN IF NOT EXISTS origem_tipo VARCHAR(30),
  ADD COLUMN IF NOT EXISTS origem_id UUID,
  ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(20) DEFAULT 'AVULSO',
  ADD COLUMN IF NOT EXISTS numero_nf VARCHAR(20),
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID,
  ADD COLUMN IF NOT EXISTS canceled_by UUID,
  ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Contas a Pagar: adicionar campos faltantes
ALTER TABLE contas_pagar
  ADD COLUMN IF NOT EXISTS competencia DATE,
  ADD COLUMN IF NOT EXISTS data_liquidacao DATE,
  ADD COLUMN IF NOT EXISTS nota_fiscal_id UUID,
  ADD COLUMN IF NOT EXISTS plano_contas_id UUID,
  ADD COLUMN IF NOT EXISTS origem_tipo VARCHAR(30),
  ADD COLUMN IF NOT EXISTS origem_id UUID,
  ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(20) DEFAULT 'AVULSO',
  ADD COLUMN IF NOT EXISTS numero_nf VARCHAR(20),
  ADD COLUMN IF NOT EXISTS aprovado_por UUID,
  ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID,
  ADD COLUMN IF NOT EXISTS canceled_by UUID,
  ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Movimentos Bancarios: expandir para rastro completo
ALTER TABLE movimentos_bancarios
  ADD COLUMN IF NOT EXISTS tipo_origem VARCHAR(30),
  ADD COLUMN IF NOT EXISTS lancamento_id UUID,
  ADD COLUMN IF NOT EXISTS lancamento_tipo VARCHAR(10),
  ADD COLUMN IF NOT EXISTS conciliado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS conciliado_com_id UUID,
  ADD COLUMN IF NOT EXISTS conciliado_por UUID,
  ADD COLUMN IF NOT EXISTS conciliado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS saldo_apos DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS created_by UUID;

COMMENT ON COLUMN contas_receber.competencia IS 'Mes de competencia para DRE (independente do vencimento)';
COMMENT ON COLUMN contas_receber.data_liquidacao IS 'Data efetiva do recebimento (regime de caixa)';
COMMENT ON COLUMN contas_receber.origem_tipo IS 'MEDICAO, CONTRATO, NF_SAIDA, MANUAL, RECORRENTE';
COMMENT ON COLUMN contas_pagar.origem_tipo IS 'NF_ENTRADA, FOLHA, ABASTECIMENTO, CARTAO_FATURA, MANUAL';
COMMENT ON COLUMN movimentos_bancarios.tipo_origem IS 'BAIXA_RECEBER, PAGAMENTO, TRANSFERENCIA, TARIFA, RENDIMENTO, AJUSTE';


-- ==================
-- 2. NOVAS TABELAS
-- ==================

-- Plano de Contas Hierarquico
CREATE TABLE IF NOT EXISTS plano_contas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ATIVO','PASSIVO','RECEITA','DESPESA','PATRIMONIO')),
    natureza VARCHAR(10) NOT NULL CHECK (natureza IN ('DEBITO','CREDITO')),
    nivel INT NOT NULL CHECK (nivel BETWEEN 1 AND 5),
    conta_pai_id UUID REFERENCES plano_contas(id),
    aceita_lancamento BOOLEAN DEFAULT TRUE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plano_contas_codigo ON plano_contas(codigo);
CREATE INDEX IF NOT EXISTS idx_plano_contas_pai ON plano_contas(conta_pai_id);

-- Formas de Pagamento/Recebimento
CREATE TABLE IF NOT EXISTS formas_pagamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('VISTA','PRAZO','CARTAO','TRANSFERENCIA')),
    gera_movimento_bancario BOOLEAN DEFAULT TRUE,
    conta_bancaria_padrao_id UUID REFERENCES contas_bancarias(id),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rateio por Centro de Custo
CREATE TABLE IF NOT EXISTS rateio_centro_custo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lancamento_id UUID NOT NULL,
    lancamento_tipo VARCHAR(10) NOT NULL CHECK (lancamento_tipo IN ('PAGAR','RECEBER')),
    centro_custo_id UUID NOT NULL REFERENCES centros_custo(id),
    percentual DECIMAL(5,2) NOT NULL CHECK (percentual > 0 AND percentual <= 100),
    valor DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rateio_lancamento ON rateio_centro_custo(lancamento_id, lancamento_tipo);

-- Extrato Bancario Importado (separado dos movimentos internos)
CREATE TABLE IF NOT EXISTS extrato_bancario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conta_bancaria_id UUID NOT NULL REFERENCES contas_bancarias(id),
    data_movimento DATE NOT NULL,
    historico VARCHAR(500) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    numero_documento VARCHAR(50),
    tipo_movimento VARCHAR(10) NOT NULL CHECK (tipo_movimento IN ('DEBITO','CREDITO')),
    origem VARCHAR(20) NOT NULL DEFAULT 'OFX' CHECK (origem IN ('OFX','CSV','MANUAL')),
    hash_linha VARCHAR(64) UNIQUE,
    conciliado BOOLEAN DEFAULT FALSE,
    movimento_vinculado_id UUID REFERENCES movimentos_bancarios(id),
    conciliado_por UUID,
    conciliado_em TIMESTAMPTZ,
    importado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extrato_conta_data ON extrato_bancario(conta_bancaria_id, data_movimento);
CREATE INDEX IF NOT EXISTS idx_extrato_conciliado ON extrato_bancario(conciliado);

-- Transferencias entre contas proprias
CREATE TABLE IF NOT EXISTS transferencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_transferencia DATE NOT NULL,
    conta_origem_id UUID NOT NULL REFERENCES contas_bancarias(id),
    conta_destino_id UUID NOT NULL REFERENCES contas_bancarias(id),
    valor DECIMAL(15,2) NOT NULL CHECK (valor > 0),
    descricao VARCHAR(300),
    movimento_debito_id UUID REFERENCES movimentos_bancarios(id),
    movimento_credito_id UUID REFERENCES movimentos_bancarios(id),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT transferencia_contas_diferentes CHECK (conta_origem_id != conta_destino_id)
);

-- Audit Log financeiro (trigger automatico)
CREATE TABLE IF NOT EXISTS financial_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabela VARCHAR(50) NOT NULL,
    registro_id UUID NOT NULL,
    acao VARCHAR(10) NOT NULL CHECK (acao IN ('INSERT','UPDATE','DELETE')),
    dados_anteriores JSONB,
    dados_novos JSONB,
    usuario_id UUID,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tabela_registro ON financial_audit_log(tabela, registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_data ON financial_audit_log(created_at);


-- ==================
-- 3. SEED DE FORMAS DE PAGAMENTO
-- ==================

INSERT INTO formas_pagamento (codigo, nome, tipo, gera_movimento_bancario) VALUES
  ('DIN', 'Dinheiro', 'VISTA', TRUE),
  ('PIX', 'PIX', 'VISTA', TRUE),
  ('TED', 'TED/DOC', 'TRANSFERENCIA', TRUE),
  ('BOL', 'Boleto Bancario', 'PRAZO', TRUE),
  ('CHQ', 'Cheque', 'PRAZO', TRUE),
  ('CC',  'Cartao de Credito', 'CARTAO', FALSE),
  ('CD',  'Cartao de Debito', 'VISTA', TRUE),
  ('DEB', 'Debito em Conta', 'VISTA', TRUE)
ON CONFLICT (codigo) DO NOTHING;


-- ==================
-- 4. SEED BASICO DO PLANO DE CONTAS
-- ==================

INSERT INTO plano_contas (codigo, nome, tipo, natureza, nivel, aceita_lancamento) VALUES
  -- Nivel 1: Grupos
  ('1',   'ATIVO',                  'ATIVO',      'DEBITO',  1, FALSE),
  ('2',   'PASSIVO',                'PASSIVO',    'CREDITO', 1, FALSE),
  ('3',   'RECEITAS',               'RECEITA',    'CREDITO', 1, FALSE),
  ('4',   'CUSTOS E DESPESAS',      'DESPESA',    'DEBITO',  1, FALSE),
  -- Nivel 2: Subgrupos
  ('1.1', 'Ativo Circulante',       'ATIVO',      'DEBITO',  2, FALSE),
  ('1.2', 'Ativo Nao Circulante',   'ATIVO',      'DEBITO',  2, FALSE),
  ('2.1', 'Passivo Circulante',     'PASSIVO',    'CREDITO', 2, FALSE),
  ('3.1', 'Receita Operacional',    'RECEITA',    'CREDITO', 2, FALSE),
  ('3.2', 'Receita Financeira',     'RECEITA',    'CREDITO', 2, FALSE),
  ('4.1', 'Custos Diretos (CPV)',   'DESPESA',    'DEBITO',  2, FALSE),
  ('4.2', 'Despesas Operacionais',  'DESPESA',    'DEBITO',  2, FALSE),
  ('4.3', 'Despesas Financeiras',   'DESPESA',    'DEBITO',  2, FALSE),
  -- Nivel 3: Contas lancaveis
  ('1.1.01', 'Caixa Geral',             'ATIVO',   'DEBITO',  3, TRUE),
  ('1.1.02', 'Bancos Conta Movimento',   'ATIVO',   'DEBITO',  3, TRUE),
  ('1.1.03', 'Clientes a Receber',       'ATIVO',   'DEBITO',  3, TRUE),
  ('2.1.01', 'Fornecedores a Pagar',     'PASSIVO', 'CREDITO', 3, TRUE),
  ('2.1.02', 'Obrigacoes Trabalhistas',  'PASSIVO', 'CREDITO', 3, TRUE),
  ('2.1.03', 'Impostos a Recolher',      'PASSIVO', 'CREDITO', 3, TRUE),
  ('3.1.01', 'Receita de Locacao',       'RECEITA', 'CREDITO', 3, TRUE),
  ('3.1.02', 'Receita de Servicos',      'RECEITA', 'CREDITO', 3, TRUE),
  ('3.1.03', 'Receita de Transporte',    'RECEITA', 'CREDITO', 3, TRUE),
  ('3.2.01', 'Rendimentos Financeiros',  'RECEITA', 'CREDITO', 3, TRUE),
  ('4.1.01', 'Combustivel Operacional',  'DESPESA', 'DEBITO',  3, TRUE),
  ('4.1.02', 'Mao de Obra Operacional',  'DESPESA', 'DEBITO',  3, TRUE),
  ('4.1.03', 'Manutencao de Maquinas',   'DESPESA', 'DEBITO',  3, TRUE),
  ('4.1.04', 'Pecas e Componentes',      'DESPESA', 'DEBITO',  3, TRUE),
  ('4.1.05', 'Pneus',                    'DESPESA', 'DEBITO',  3, TRUE),
  ('4.2.01', 'Salarios Administrativo',  'DESPESA', 'DEBITO',  3, TRUE),
  ('4.2.02', 'Aluguel e Estrutura',      'DESPESA', 'DEBITO',  3, TRUE),
  ('4.2.03', 'Contabilidade',            'DESPESA', 'DEBITO',  3, TRUE),
  ('4.2.04', 'Seguros',                  'DESPESA', 'DEBITO',  3, TRUE),
  ('4.2.05', 'Sistemas e TI',            'DESPESA', 'DEBITO',  3, TRUE),
  ('4.3.01', 'Juros de Financiamento',   'DESPESA', 'DEBITO',  3, TRUE),
  ('4.3.02', 'Tarifas Bancarias',        'DESPESA', 'DEBITO',  3, TRUE),
  ('4.3.03', 'Multas e Encargos',        'DESPESA', 'DEBITO',  3, TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- Atualizar conta_pai_id baseado no codigo
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '1') WHERE codigo LIKE '1.%' AND nivel = 2;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '2') WHERE codigo LIKE '2.%' AND nivel = 2;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '3') WHERE codigo LIKE '3.%' AND nivel = 2;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '4') WHERE codigo LIKE '4.%' AND nivel = 2;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '1.1') WHERE codigo LIKE '1.1.%' AND nivel = 3;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '1.2') WHERE codigo LIKE '1.2.%' AND nivel = 3;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '2.1') WHERE codigo LIKE '2.1.%' AND nivel = 3;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '3.1') WHERE codigo LIKE '3.1.%' AND nivel = 3;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '3.2') WHERE codigo LIKE '3.2.%' AND nivel = 3;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '4.1') WHERE codigo LIKE '4.1.%' AND nivel = 3;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '4.2') WHERE codigo LIKE '4.2.%' AND nivel = 3;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '4.3') WHERE codigo LIKE '4.3.%' AND nivel = 3;


-- ==================
-- 5. VIEWS PARA RELATORIOS
-- ==================

-- View: Fluxo de Caixa Completo (previsto + realizado)
CREATE OR REPLACE VIEW vw_fluxo_caixa_completo AS

-- Receitas previstas (ainda nao recebidas)
SELECT
    cr.id,
    cr.data_vencimento AS data,
    'RECEBER' AS tipo,
    cr.descricao,
    cr.valor_saldo AS valor,
    'PREVISTO' AS natureza,
    cr.centro_custo_id,
    cr.status,
    cr.cliente_id AS entidade_id
FROM contas_receber cr
WHERE cr.status NOT IN ('RECEBIDO', 'CANCELADO')

UNION ALL

-- Receitas realizadas
SELECT
    cr.id,
    COALESCE(cr.data_liquidacao, cr.data_recebimento) AS data,
    'RECEBER' AS tipo,
    cr.descricao,
    cr.valor_recebido AS valor,
    'REALIZADO' AS natureza,
    cr.centro_custo_id,
    cr.status,
    cr.cliente_id AS entidade_id
FROM contas_receber cr
WHERE cr.status = 'RECEBIDO'

UNION ALL

-- Despesas previstas (ainda nao pagas)
SELECT
    cp.id,
    cp.data_vencimento AS data,
    'PAGAR' AS tipo,
    cp.descricao,
    -(cp.valor_saldo) AS valor,
    'PREVISTO' AS natureza,
    cp.centro_custo_id,
    cp.status,
    cp.fornecedor_id AS entidade_id
FROM contas_pagar cp
WHERE cp.status NOT IN ('PAGO', 'CANCELADO')

UNION ALL

-- Despesas realizadas
SELECT
    cp.id,
    COALESCE(cp.data_liquidacao, cp.data_pagamento) AS data,
    'PAGAR' AS tipo,
    cp.descricao,
    -(cp.valor_pago) AS valor,
    'REALIZADO' AS natureza,
    cp.centro_custo_id,
    cp.status,
    cp.fornecedor_id AS entidade_id
FROM contas_pagar cp
WHERE cp.status = 'PAGO';


-- View: DRE por Competencia
CREATE OR REPLACE VIEW vw_dre_competencia AS
SELECT
    COALESCE(cr.competencia, DATE_TRUNC('month', cr.data_vencimento)::DATE) AS mes_competencia,
    cc.grupo_dre,
    cc.codigo AS centro_codigo,
    cc.nome AS centro_nome,
    cc.tipo AS centro_tipo,
    SUM(cr.valor_original) AS valor_total,
    COUNT(*) AS qtd_titulos
FROM contas_receber cr
JOIN centros_custo cc ON cr.centro_custo_id = cc.id
WHERE cr.status != 'CANCELADO'
GROUP BY mes_competencia, cc.grupo_dre, cc.codigo, cc.nome, cc.tipo

UNION ALL

SELECT
    COALESCE(cp.competencia, DATE_TRUNC('month', cp.data_vencimento)::DATE) AS mes_competencia,
    cc.grupo_dre,
    cc.codigo AS centro_codigo,
    cc.nome AS centro_nome,
    cc.tipo AS centro_tipo,
    -SUM(cp.valor_original) AS valor_total,
    COUNT(*) AS qtd_titulos
FROM contas_pagar cp
JOIN centros_custo cc ON cp.centro_custo_id = cc.id
WHERE cp.status != 'CANCELADO'
GROUP BY mes_competencia, cc.grupo_dre, cc.codigo, cc.nome, cc.tipo;


-- View: Aging de Recebiveis
CREATE OR REPLACE VIEW vw_aging_receber AS
SELECT
    e.name AS cliente,
    e.document AS cnpj,
    COUNT(*) AS qtd_titulos,
    SUM(CASE WHEN cr.data_vencimento >= CURRENT_DATE THEN cr.valor_saldo ELSE 0 END) AS a_vencer,
    SUM(CASE WHEN CURRENT_DATE - cr.data_vencimento BETWEEN 1 AND 30 THEN cr.valor_saldo ELSE 0 END) AS vencido_1_30,
    SUM(CASE WHEN CURRENT_DATE - cr.data_vencimento BETWEEN 31 AND 60 THEN cr.valor_saldo ELSE 0 END) AS vencido_31_60,
    SUM(CASE WHEN CURRENT_DATE - cr.data_vencimento BETWEEN 61 AND 90 THEN cr.valor_saldo ELSE 0 END) AS vencido_61_90,
    SUM(CASE WHEN CURRENT_DATE - cr.data_vencimento > 90 THEN cr.valor_saldo ELSE 0 END) AS vencido_90_mais,
    SUM(cr.valor_saldo) AS total_aberto
FROM contas_receber cr
JOIN entities e ON cr.cliente_id = e.id
WHERE cr.status NOT IN ('RECEBIDO', 'CANCELADO')
GROUP BY e.name, e.document;


-- View: Posicao Bancaria
CREATE OR REPLACE VIEW vw_posicao_bancaria AS
SELECT
    cb.id,
    cb.banco_nome,
    cb.agencia,
    cb.conta,
    cb.tipo_conta,
    cb.saldo_atual,
    cb.padrao,
    (SELECT COUNT(*) FROM movimentos_bancarios mb WHERE mb.conta_bancaria_id = cb.id AND NOT COALESCE(mb.conciliado, FALSE)) AS movimentos_pendentes,
    (SELECT MAX(mb.data_movimento) FROM movimentos_bancarios mb WHERE mb.conta_bancaria_id = cb.id) AS ultimo_movimento
FROM contas_bancarias cb
WHERE cb.ativa = TRUE;


-- ==================
-- 6. TRIGGER DE AUDIT LOG
-- ==================

CREATE OR REPLACE FUNCTION fn_financial_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO financial_audit_log (tabela, registro_id, acao, dados_novos, usuario_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), COALESCE(NEW.created_by, auth.uid()));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO financial_audit_log (tabela, registro_id, acao, dados_anteriores, dados_novos, usuario_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), COALESCE(NEW.updated_by, auth.uid()));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO financial_audit_log (tabela, registro_id, acao, dados_anteriores, usuario_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger nas tabelas financeiras
DROP TRIGGER IF EXISTS trg_audit_contas_receber ON contas_receber;
CREATE TRIGGER trg_audit_contas_receber AFTER INSERT OR UPDATE OR DELETE ON contas_receber
    FOR EACH ROW EXECUTE FUNCTION fn_financial_audit();

DROP TRIGGER IF EXISTS trg_audit_contas_pagar ON contas_pagar;
CREATE TRIGGER trg_audit_contas_pagar AFTER INSERT OR UPDATE OR DELETE ON contas_pagar
    FOR EACH ROW EXECUTE FUNCTION fn_financial_audit();

DROP TRIGGER IF EXISTS trg_audit_movimentos ON movimentos_bancarios;
CREATE TRIGGER trg_audit_movimentos AFTER INSERT OR UPDATE OR DELETE ON movimentos_bancarios
    FOR EACH ROW EXECUTE FUNCTION fn_financial_audit();


-- ==================
-- 7. TRIGGER DE updated_at AUTOMATICO
-- ==================

CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_updated_contas_receber ON contas_receber;
CREATE TRIGGER trg_updated_contas_receber BEFORE UPDATE ON contas_receber
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_updated_contas_pagar ON contas_pagar;
CREATE TRIGGER trg_updated_contas_pagar BEFORE UPDATE ON contas_pagar
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();


-- ==================
-- 8. INDICES DE PERFORMANCE
-- ==================

CREATE INDEX IF NOT EXISTS idx_cr_competencia ON contas_receber(competencia);
CREATE INDEX IF NOT EXISTS idx_cr_vencimento ON contas_receber(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_cr_status ON contas_receber(status);
CREATE INDEX IF NOT EXISTS idx_cr_cliente ON contas_receber(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cr_centro_custo ON contas_receber(centro_custo_id);
CREATE INDEX IF NOT EXISTS idx_cr_origem ON contas_receber(origem_tipo, origem_id);

CREATE INDEX IF NOT EXISTS idx_cp_competencia ON contas_pagar(competencia);
CREATE INDEX IF NOT EXISTS idx_cp_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_cp_status ON contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_cp_fornecedor ON contas_pagar(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_cp_centro_custo ON contas_pagar(centro_custo_id);
CREATE INDEX IF NOT EXISTS idx_cp_origem ON contas_pagar(origem_tipo, origem_id);

CREATE INDEX IF NOT EXISTS idx_mb_conta_data ON movimentos_bancarios(conta_bancaria_id, data_movimento);
CREATE INDEX IF NOT EXISTS idx_mb_conciliado ON movimentos_bancarios(conciliado);
CREATE INDEX IF NOT EXISTS idx_mb_lancamento ON movimentos_bancarios(lancamento_id, lancamento_tipo);


-- ==================
-- 9. RLS POLICIES (reforcar por empresa)
-- ==================

ALTER TABLE plano_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE formas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE rateio_centro_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE extrato_bancario ENABLE ROW LEVEL SECURITY;
ALTER TABLE transferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies de leitura para autenticados (ajustar para multi-tenant depois)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated read plano_contas') THEN
    CREATE POLICY "Authenticated read plano_contas" ON plano_contas FOR SELECT TO authenticated USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated manage plano_contas') THEN
    CREATE POLICY "Authenticated manage plano_contas" ON plano_contas FOR ALL TO authenticated USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated read formas_pagamento') THEN
    CREATE POLICY "Authenticated read formas_pagamento" ON formas_pagamento FOR SELECT TO authenticated USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated read rateio') THEN
    CREATE POLICY "Authenticated read rateio" ON rateio_centro_custo FOR SELECT TO authenticated USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated all extrato') THEN
    CREATE POLICY "Authenticated all extrato" ON extrato_bancario FOR ALL TO authenticated USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated all transferencias') THEN
    CREATE POLICY "Authenticated all transferencias" ON transferencias FOR ALL TO authenticated USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated read audit') THEN
    CREATE POLICY "Authenticated read audit" ON financial_audit_log FOR SELECT TO authenticated USING (TRUE);
  END IF;
END $$;

-- Grants
GRANT SELECT ON vw_fluxo_caixa_completo TO authenticated;
GRANT SELECT ON vw_dre_competencia TO authenticated;
GRANT SELECT ON vw_aging_receber TO authenticated;
GRANT SELECT ON vw_posicao_bancaria TO authenticated;
