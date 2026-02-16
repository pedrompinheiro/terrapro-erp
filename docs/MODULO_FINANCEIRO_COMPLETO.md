# 📊 MÓDULO FINANCEIRO COMPLETO - TerraPro ERP

**Data:** 13/02/2026 22:00  
**Arquiteto:** Sistema ERP Nível TOTVS/SAP  
**Empresa:** Transportadora e Terraplanagem Terra LTDA

---

## 🎯 VISÃO GERAL DO MÓDULO

### Escopo
Sistema financeiro completo para empresa de terraplanagem e locação de máquinas, incluindo:
- ✅ Contas a Pagar/Receber
- ✅ Fluxo de Caixa (Previsto vs Realizado)
- ✅ Conciliação Bancária (CNAB 240/400, OFX, CSV)
- ✅ Integração Fiscal (NFS-e, NF-e)
- ✅ Plano de Contas + DRE
- ✅ Centro de Custo (Obra, Máquina, Filial)
- ✅ Dashboards Gerenciais

### Arquitetura
```
┌─────────────────────────────────────────────┐
│         Frontend (React + TypeScript)        │
│  Financial.tsx → FinancialService.ts         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│      Backend Services (Node.js/NestJS)       │
│ ├─ PaymentService.ts (Contas Pagar)         │
│ ├─ ReceivableService.ts (Contas Receber)    │
│ ├─ BankingService.ts (Conciliação)          │
│ ├─ FiscalService.ts (NF-e/NFS-e)            │
│ ├─ CNABService.ts (Remessa/Retorno)         │
│ └─ ReportService.ts (DRE/Dashboards)        │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│     PostgreSQL (Supabase) + Event Queue     │
│ ├─ Tabelas Financeiras (20+)                │
│ ├─ Triggers de Auditoria                    │
│ ├─ Views Materializadas (DRE)               │
│ └─ Fila de Jobs (integraç

ões assíncronas)   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        Integrações Externas                  │
│ ├─ Bancos (CNAB, OFX, Open Finance)         │
│ ├─ SEFAZ (NF-e, Consulta Status)            │
│ ├─ Prefeituras (NFS-e)                       │
│ ├─ APIs de Boleto/PIX (Sicoob, BB, etc)     │
│ └─ ERP Contábil (XML export)                │
└──────────────────────────────────────────────┘
```

---

## 📐 MODELAGEM DE BANCO DE DADOS

### 1. PLANO DE CONTAS
```sql
-- Estrutura hierárquica de contas contábeis
CREATE TABLE plano_contas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,           -- Ex: 1.1.01.001
    nome VARCHAR(200) NOT NULL,                   -- Ex: Caixa Geral
    tipo VARCHAR(20) NOT NULL,                     -- ATIVO, PASSIVO, RECEITA, DESPESA, PATRIMONIO
    natureza VARCHAR(10) NOT NULL,                 -- DEBITO, CREDITO
    nivel INT NOT NULL,                            -- 1, 2, 3, 4 (hierarquia)
    conta_pai_id UUID REFERENCES plano_contas(id), -- Auto-referência
    aceita_lancamento BOOLEAN DEFAULT TRUE,        -- Conta sintética = false
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_plano_contas_codigo ON plano_contas(codigo);
CREATE INDEX idx_plano_contas_tipo ON plano_contas(tipo);
CREATE INDEX idx_plano_contas_pai ON plano_contas(conta_pai_id);
```

### 2. CENTROS DE CUSTO
```sql
-- Classificação de despesas/receitas
CREATE TABLE centros_custo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,          -- CC-001
    nome VARCHAR(200) NOT NULL,                  -- Obra ABC, Máquina XYZ
    tipo VARCHAR(50) NOT NULL,                    -- OBRA, MAQUINA, FILIAL, DEPARTAMENTO
    responsavel_id UUID REFERENCES employees(id),
    orcamento_mensal DECIMAL(15,2),
    ativo BOOLEAN DEFAULT TRUE,
    
    -- Vinculação com outros módulos
    obra_id UUID,                                 -- Referência a obras
    maquina_id UUID REFERENCES assets(id),        -- Referência a máquinas
    filial_id UUID REFERENCES companies(id),      -- Referência a filiais
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_centros_custo_tipo ON centros_custo(tipo);
CREATE INDEX idx_centros_custo_ativo ON centros_custo(ativo);
```

### 3. FORNECEDORES E CLIENTES (USA TABELA entities EXISTENTE)
```sql
-- Já existe: entities table
-- Apenas adicionar campos específicos financeiros

ALTER TABLE entities ADD COLUMN IF NOT EXISTS banco_nome VARCHAR(100);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS banco_agencia VARCHAR(10);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS banco_conta VARCHAR(20);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS pix_chave VARCHAR(200);
ALTER TABLE entities ADD COLUMN IF NOT EXISTS limite_credito DECIMAL(15,2) DEFAULT 0;
ALTER TABLE entities ADD COLUMN IF NOT EXISTS dias_prazo_padrao INT DEFAULT 30;
ALTER TABLE entities ADD COLUMN IF NOT EXISTS inadimplente BOOLEAN DEFAULT FALSE;
```

### 4. CONTAS A PAGAR
```sql
CREATE TABLE contas_pagar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_titulo VARCHAR(50) UNIQUE NOT NULL,    -- CP-2024-0001
    
    -- Fornecedor
    fornecedor_id UUID NOT NULL REFERENCES entities(id),
    fornecedor_nome VARCHAR(200) NOT NULL,        -- Desnormalizado para histórico
    
    -- Valores
    valor_original DECIMAL(15,2) NOT NULL,
    valor_juros DECIMAL(15,2) DEFAULT 0,
    valor_multa DECIMAL(15,2) DEFAULT 0,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    valor_pago DECIMAL(15,2) DEFAULT 0,
    valor_saldo AS (valor_original + valor_juros + valor_multa - valor_desconto - valor_pago) STORED,
    
    -- Datas
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    
    -- Classificação
    plano_contas_id UUID NOT NULL REFERENCES plano_contas(id),
    centro_custo_id UUID REFERENCES centros_custo(id),
    categoria VARCHAR(100),                       -- COMBUSTIVEL, MANUTENCAO, FORNECEDOR, etc
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    -- PENDENTE, APROVADO, EM_PAGAMENTO, PAGO, CANCELADO, VENCIDO
    
    -- Pagamento
    forma_pagamento VARCHAR(50),                  -- PIX, BOLETO, TED, CHEQUE, DINHEIRO
    banco_id UUID REFERENCES contas_bancarias(id),
    nosso_numero VARCHAR(50),                     -- Para boleto
    linha_digitavel TEXT,
    codigo_barras VARCHAR(100),
    
    -- Observações
    descricao TEXT NOT NULL,
    observacao TEXT,
    numero_documento VARCHAR(50),                 -- NF, Recibo, etc
    
    -- Parcelamento
    parcela_numero INT DEFAULT 1,
    parcela_total INT DEFAULT 1,
    titulo_pai_id UUID REFERENCES contas_pagar(id), -- Se for parcela
    
    -- Integração
    conciliado BOOLEAN DEFAULT FALSE,
    conciliacao_id UUID,
    cnab_remessa_id UUID,
    cnab_retorno_id UUID,
    
    -- Auditoria
    criado_por_id UUID REFERENCES profiles(id),
    aprovado_por_id UUID REFERENCES profiles(id),
    data_aprovacao TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices essenciais
CREATE INDEX idx_contas_pagar_fornecedor ON contas_pagar(fornecedor_id);
CREATE INDEX idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX idx_contas_pagar_plano ON contas_pagar(plano_contas_id);
CREATE INDEX idx_contas_pagar_centro ON contas_pagar(centro_custo_id);
CREATE INDEX idx_contas_pagar_conciliado ON contas_pagar(conciliado);

-- Trigger para atualizar status automático
CREATE OR REPLACE FUNCTION atualizar_status_contas_pagar()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.valor_saldo <= 0 AND NEW.data_pagamento IS NOT NULL THEN
        NEW.status = 'PAGO';
    ELSIF NEW.data_vencimento < CURRENT_DATE AND NEW.status = 'PENDENTE' THEN
        NEW.status = 'VENCIDO';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_status_contas_pagar
    BEFORE INSERT OR UPDATE ON contas_pagar
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_status_contas_pagar();
```

### 5. CONTAS A RECEBER
```sql
CREATE TABLE contas_receber (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_titulo VARCHAR(50) UNIQUE NOT NULL,    -- CR-2024-0001
    
    -- Cliente
    cliente_id UUID NOT NULL REFERENCES entities(id),
    cliente_nome VARCHAR(200) NOT NULL,           -- Desnormalizado
    
    -- Valores
    valor_original DECIMAL(15,2) NOT NULL,
    valor_juros DECIMAL(15,2) DEFAULT 0,
    valor_multa DECIMAL(15,2) DEFAULT 0,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    valor_recebido DECIMAL(15,2) DEFAULT 0,
    valor_saldo AS (valor_original + valor_juros + valor_multa - valor_desconto - valor_recebido) STORED,
    
    -- Datas
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    data_recebimento DATE,
    
    -- Classificação
    plano_contas_id UUID NOT NULL REFERENCES plano_contas(id),
    centro_custo_id UUID REFERENCES centros_custo(id),
    categoria VARCHAR(100),                       -- LOCACAO, SERVICO, VENDA, etc
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    -- PENDENTE, CONFIRMADO, RECEBIDO, CANCELADO, VENCIDO, INADIMPLENTE
    
    -- Recebimento
    forma_recebimento VARCHAR(50),                -- PIX, BOLETO, TRANSFERENCIA, CARTAO, DINHEIRO
    banco_id UUID REFERENCES contas_bancarias(id),
    nosso_numero VARCHAR(50),
    linha_digitavel TEXT,
    codigo_barras VARCHAR(100),
    pix_qrcode TEXT,
    pix_txid VARCHAR(100),
    
    -- Cobrança
    dias_atraso INT GENERATED ALWAYS AS (
        CASE 
            WHEN data_vencimento < CURRENT_DATE AND status != 'RECEBIDO' 
            THEN CURRENT_DATE - data_vencimento 
            ELSE 0 
        END
    ) STORED,
    taxa_juros_dia DECIMAL(5,4) DEFAULT 0.0333,  -- 1% ao mês / 30 dias
    percentual_multa DECIMAL(5,2) DEFAULT 2.00,   -- 2%
    
    -- Observações
    descricao TEXT NOT NULL,
    observacao TEXT,
    numero_documento VARCHAR(50),
    
    -- Parcelamento
    parcela_numero INT DEFAULT 1,
    parcela_total INT DEFAULT 1,
    titulo_pai_id UUID REFERENCES contas_receber(id),
    
    -- Recorrência (contratos mensais)
    recorrente BOOLEAN DEFAULT FALSE,
    recorrencia_dia INT,                          -- Dia do mês (1-31)
    contrato_id UUID,
    
    -- Integração Fiscal
    nota_fiscal_id UUID,
    nota_fiscal_numero VARCHAR(50),
    nota_fiscal_serie VARCHAR(10),
    
    -- Integração Bancária
    conciliado BOOLEAN DEFAULT FALSE,
    conciliacao_id UUID,
    
    -- Auditoria
    criado_por_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índ

ices
CREATE INDEX idx_contas_receber_cliente ON contas_receber(cliente_id);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX idx_contas_receber_status ON contas_receber(status);
CREATE INDEX idx_contas_receber_plano ON contas_receber(plano_contas_id);
CREATE INDEX idx_contas_receber_recorrente ON contas_receber(recorrente) WHERE recorrente = TRUE;
CREATE INDEX idx_contas_receber_dias_atraso ON contas_receber(dias_atraso) WHERE dias_atraso > 0;

-- Trigger para juros e multa automáticos
CREATE OR REPLACE FUNCTION calcular_juros_multa_receber()
RETURNS TRIGGER AS $$
DECLARE
    dias_atraso_calc INT;
BEGIN
    IF NEW.status != 'RECEBIDO' AND NEW.data_vencimento < CURRENT_DATE THEN
        dias_atraso_calc := CURRENT_DATE - NEW.data_vencimento;
        NEW.valor_juros := NEW.valor_original * NEW.taxa_juros_dia * dias_atraso_calc;
        NEW.valor_multa := NEW.valor_original * (NEW.percentual_multa / 100);
        NEW.status := 'INADIMPLENTE';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_juros_multa_receber
    BEFORE UPDATE ON contas_receber
    FOR EACH ROW
    WHEN (OLD.data_vencimento IS DISTINCT FROM NEW.data_vencimento 
          OR OLD.valor_recebido IS DISTINCT FROM NEW.valor_recebido)
    EXECUTE FUNCTION calcular_juros_multa_receber();
```

### 6. CONTAS BANCÁRIAS
```sql
CREATE TABLE contas_bancarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banco_codigo VARCHAR(10) NOT NULL,            -- 001 = BB, 237 = Bradesco, etc
    banco_nome VARCHAR(100) NOT NULL,
    agencia VARCHAR(10) NOT NULL,
    agencia_dv VARCHAR(2),
    conta VARCHAR(20) NOT NULL,
    conta_dv VARCHAR(2),
    tipo_conta VARCHAR(20) NOT NULL,              -- CONTA_CORRENTE, POUPANCA, APLICACAO
    
    -- Empresa
    empresa_id UUID NOT NULL REFERENCES companies(id),
    empresa_cnpj VARCHAR(18),
    
    -- Controle
    saldo_atual DECIMAL(15,2) DEFAULT 0,
    saldo_previsto DECIMAL(15,2) DEFAULT 0,
    limite_cheque_especial DECIMAL(15,2) DEFAULT 0,
    ativa BOOLEAN DEFAULT TRUE,
    padrao BOOLEAN DEFAULT FALSE,
    
    -- PIX
    pix_chave VARCHAR(200),
    pix_tipo VARCHAR(20),                         -- CPF, CNPJ, EMAIL, TELEFONE, ALEATORIA
    
    -- CNAB
    layout_cnab VARCHAR(10) DEFAULT '240',        -- 240 ou 400
    convenio_numero VARCHAR(50),
    carteira VARCHAR(10),
    variacao_carteira VARCHAR(10),
    
    -- Integração
    ultimo_saldo_atualizado_em TIMESTAMPTZ,
    ultima_conciliacao_em TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contas_bancarias_empresa ON contas_bancarias(empresa_id);
CREATE INDEX idx_contas_bancarias_ativa ON contas_bancarias(ativa);
```

### 7. MOVIMENTOS BANCÁRIOS
```sql
CREATE TABLE movimentos_bancarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conta_bancaria_id UUID NOT NULL REFERENCES contas_bancarias(id),
    
    -- Data e Documento
    data_movimento DATE NOT NULL,
    data_valor DATE,
    numero_documento VARCHAR(50),
    historico TEXT NOT NULL,
    
    -- Valores
    valor DECIMAL(15,2) NOT NULL,                 -- Positivo=Crédito, Negativo=Débito
    saldo_anterior DECIMAL(15,2),
    saldo_final DECIMAL(15,2),
    
    -- Tipo
    tipo_movimento VARCHAR(30) NOT NULL,          -- DEBITO, CREDITO, TARIFA, JUROS, etc
    origem VARCHAR(50) NOT NULL,                  -- EXTRATO_OFX, CNAB_RETORNO, MANUAL, CONCILIACAO
    
    -- Conciliação
    conciliado BOOLEAN DEFAULT FALSE,
    conciliacao_id UUID,
    lancamento_financeiro_id UUID,                -- Link com contas_pagar ou contas_receber
    lancamento_tipo VARCHAR(20),                  -- PAGAR ou RECEBER
    
    -- Arquivo original
    arquivo_origem VARCHAR(255),
    linha_arquivo INT,
    hash_linha VARCHAR(64),                       -- Para evitar duplicatas
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_movimentos_conta ON movimentos_bancarios(conta_bancaria_id);
CREATE INDEX idx_movimentos_data ON movimentos_bancarios(data_movimento);
CREATE INDEX idx_movimentos_conciliado ON movimentos_bancarios(conciliado);
CREATE INDEX idx_movimentos_hash ON movimentos_bancarios(hash_linha);
CREATE UNIQUE INDEX idx_movimentos_unique ON movimentos_bancarios(conta_bancaria_id, hash_linha);
```

### 8. CONCILIAÇÃO BANCÁRIA
```sql
CREATE TABLE conciliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conta_bancaria_id UUID NOT NULL REFERENCES contas_bancarias(id),
    
    -- Período
    data_inicial DATE NOT NULL,
    data_final DATE NOT NULL,
    
    -- Saldos
    saldo_bancario_inicial DECIMAL(15,2),
    saldo_bancario_final DECIMAL(15,2),
    saldo_contabil_inicial DECIMAL(15,2),
    saldo_contabil_final DECIMAL(15,2),
    diferenca DECIMAL(15,2),
    
    -- Status
    status VARCHAR(30) DEFAULT 'EM_ANDAMENTO',    -- EM_ANDAMENTO, CONCLUIDA, PARCIAL
    total_movimentos INT DEFAULT 0,
    movimentos_conciliados INT DEFAULT 0,
    percentual_conciliado DECIMAL(5,2),
    
    -- Auditoria
    conciliado_por_id UUID REFERENCES profiles(id),
    data_conciliacao TIMESTAMPTZ,
    observacoes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de sugestões automáticas
CREATE TABLE conciliacao_sugestoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conciliacao_id UUID NOT NULL REFERENCES conciliacoes(id),
    movimento_bancario_id UUID NOT NULL REFERENCES movimentos_bancarios(id),
    lancamento_id UUID NOT NULL,
    lancamento_tipo VARCHAR(20) NOT NULL,         -- PAGAR ou RECEBER
    
    -- Match scoring
    score_valor INT DEFAULT 0,                    -- 0-100
    score_data INT DEFAULT 0,
    score_documento INT DEFAULT 0,
    score_total INT GENERATED ALWAYS AS (score_valor + score_data + score_documento) STORED,
    
    status VARCHAR(30) DEFAULT 'PENDENTE',        -- PENDENTE, ACEITA, REJEITADA
    aceita_em TIMESTAMPTZ,
    aceita_por_id UUID REFERENCES profiles(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sugestoes_conciliacao ON conciliacao_sugestoes(conciliacao_id);
CREATE INDEX idx_sugestoes_score ON conciliacao_sugestoes(score_total DESC);
```

### 9. NOTAS FISCAIS (NF-e e NFS-e)
```sql
CREATE TABLE notas_fiscais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tipo
    tipo_nota VARCHAR(10) NOT NULL,               -- NFE (Produto), NFSE (Serviço)
    modelo VARCHAR(10) NOT NULL,                  -- 55 (NF-e), diversos para NFS-e
    serie VARCHAR(10) NOT NULL,
    numero INT NOT NULL,
    chave_acesso VARCHAR(44) UNIQUE,              -- 44 dígitos
    
    -- Emissão
    data_emissao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_saida TIMESTAMPTZ,
    tipo_operacao VARCHAR(20) NOT NULL,           -- ENTRADA, SAIDA
    natureza_operacao VARCHAR(100) NOT NULL,      -- Venda, Prestação de Serviço, etc
    
    -- Partes
    emitente_id UUID NOT NULL REFERENCES companies(id),
    destinatario_id UUID NOT NULL REFERENCES entities(id),
    destinatario_nome VARCHAR(200),
    destinatario_documento VARCHAR(18),
    
    -- Valores
    valor_total DECIMAL(15,2) NOT NULL,
    valor_produtos DECIMAL(15,2) DEFAULT 0,
    valor_servicos DECIMAL(15,2) DEFAULT 0,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    valor_frete DECIMAL(15,2) DEFAULT 0,
    valor_seguro DECIMAL(15,2) DEFAULT 0,
    valor_outras_despesas DECIMAL(15,2) DEFAULT 0,
    
    -- Impostos
    base_calculo_icms DECIMAL(15,2) DEFAULT 0,
    valor_icms DECIMAL(15,2) DEFAULT 0,
    base_calculo_icms_st DECIMAL(15,2) DEFAULT 0,
    valor_icms_st DECIMAL(15,2) DEFAULT 0,
    valor_ipi DECIMAL(15,2) DEFAULT 0,
    valor_pis DECIMAL(15,2) DEFAULT 0,
    valor_cofins DECIMAL(15,2) DEFAULT 0,
    valor_iss DECIMAL(15,2) DEFAULT 0,
    iss_retido BOOLEAN DEFAULT FALSE,
    
    -- Status SEFAZ
    status_sefaz VARCHAR(50) DEFAULT 'EM_DIGITACAO',
    -- EM_DIGITACAO, AUTORIZADA, CANCELADA, DENEGADA, REJEITADA
    protocolo_autorizacao VARCHAR(50),
    data_autorizacao TIMESTAMPTZ,
    motivo_cancelamento TEXT,
    data_cancelamento TIMESTAMPTZ,
    
    -- Arquivos
    xml_original TEXT,
    xml_processado TEXT,
    pdf_danfe_url TEXT,
    
    -- Integração Financeira
    gera_financeiro BOOLEAN DEFAULT TRUE,
    conta_receber_id UUID REFERENCES contas_receber(id),
    centro_custo_id UUID REFERENCES centros_custo(id),
    
    -- RPS (NFS-e)
    rps_numero INT,
    rps_serie VARCHAR(10),
    rps_tipo VARCHAR(10),
    codigo_verificacao VARCHAR(50),               -- Para NFS-e
    
    -- Observações
    informacoes_complementares TEXT,
    informacoes_fisco TEXT,
    
    -- Auditoria
    criado_por_id UUID REFERENCES profiles(id),
    cancelado_por_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nf_chave ON notas_fiscais(chave_acesso);
CREATE INDEX idx_nf_destinatario ON notas_fiscais(destinatario_id);
CREATE INDEX idx_nf_emissao ON notas_fiscais(data_emissao);
CREATE INDEX idx_nf_status ON notas_fiscais(status_sefaz);
CREATE INDEX idx_nf_financeiro ON notas_fiscais(conta_receber_id);
```

### 10. ITENS DE NOTA FISCAL
```sql
CREATE TABLE nota_fiscal_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nota_fiscal_id UUID NOT NULL REFERENCES notas_fiscais(id) ON DELETE CASCADE,
    
    numero_item INT NOT NULL,
    codigo_produto VARCHAR(60),
    descricao TEXT NOT NULL,
    ncm VARCHAR(8),                               -- Nomenclatura Comum do Mercosul
    un VARCHAR(6) NOT NULL,                       -- Unidade (UN, KG, M3, HORA, etc)
    
    quantidade DECIMAL(15,4) NOT NULL,
    valor_unitario DECIMAL(15,4) NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    
    -- Impostos
    cfop VARCHAR(10) NOT NULL,                    -- Código Fiscal de Operação
    cst_icms VARCHAR(3),
    aliquota_icms DECIMAL(5,2),
    valor_icms DECIMAL(15,2) DEFAULT 0,
    cst_pis VARCHAR(2),
    aliquota_pis DECIMAL(5,2),
    valor_pis DECIMAL(15,2) DEFAULT 0,
    cst_cofins VARCHAR(2),
    aliquota_cofins DECIMAL(5,2),
    valor_cofins DECIMAL(15,2) DEFAULT 0,
    
    -- Serviços (NFS-e)
    codigo_servico VARCHAR(20),                   -- LC 116/2003
    aliquota_iss DECIMAL(5,2),
    valor_iss DECIMAL(15,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nf_itens_nota ON nota_fiscal_itens(nota_fiscal_id);
```

### 11. ARQUIVOS CNAB (Remessa e Retorno)
```sql
CREATE TABLE cnab_arquivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conta_bancaria_id UUID NOT NULL REFERENCES contas_bancarias(id),
    
    tipo VARCHAR(20) NOT NULL,                    -- REMESSA, RETORNO
    layout VARCHAR(10) NOT NULL,                  -- 240, 400
    numero_sequencial INT NOT NULL,
    data_geracao DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_geracao TIME NOT NULL DEFAULT CURRENT_TIME,
    
    -- Arquivo
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo TEXT,
    tamanho_bytes BIGINT,
    hash_md5 VARCHAR(32),
    
    -- Estatísticas
    total_registros INT DEFAULT 0,
    total_titulos INT DEFAULT 0,
    valor_total DECIMAL(15,2) DEFAULT 0,
    
    -- Processamento
    processado BOOLEAN DEFAULT FALSE,
    data_processamento TIMESTAMPTZ,
    processado_por_id UUID REFERENCES profiles(id),
    erros_processamento TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cnab_conta ON cnab_arquivos(conta_bancaria_id);
CREATE INDEX idx_cnab_tipo ON cnab_arquivos(tipo);
CREATE INDEX idx_cnab_processado ON cnab_arquivos(processado);
```

### 12. DETALHES CNAB (Linhas do arquivo)
```sql
CREATE TABLE cnab_detalhes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnab_arquivo_id UUID NOT NULL REFERENCES cnab_arquivos(id) ON DELETE CASCADE,
    
    numero_linha INT NOT NULL,
    tipo_registro VARCHAR(10) NOT NULL,          -- HEADER, DETALHE, TRAILER
    conteudo_linha TEXT NOT NULL,
    
    -- Se for título
    nosso_numero VARCHAR(50),
    seu_numero VARCHAR(50),
    valor_titulo DECIMAL(15,2),
    data_vencimento DATE,
    data_ocorrencia DATE,
    ocorrencia_codigo VARCHAR(10),
    ocorrencia_descricao VARCHAR(200),
    
    -- Link com financeiro
    conta_pagar_id UUID REFERENCES contas_pagar(id),
    conta_receber_id UUID REFERENCES contas_receber(id),
    
    processado BOOLEAN DEFAULT FALSE,
    erro_processamento TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cnab_detalhes_arquivo ON cnab_detalhes(cnab_arquivo_id);
CREATE INDEX idx_cnab_detalhes_nosso_numero ON cnab_detalhes(nosso_numero);
```

### 13. FLUXO DE CAIXA (VIEW MATERIALIZADA)
```sql
CREATE MATERIALIZED VIEW fluxo_caixa AS
WITH movimentos AS (
    -- Contas a Pagar
    SELECT 
        data_vencimento AS data,
        'PAGAR' AS tipo,
        valor_original * -1 AS valor,
        status,
        CASE 
            WHEN status = 'PAGO' THEN 'REALIZADO'
            ELSE 'PREVISTO'
        END AS realizado,
        centro_custo_id,
        plano_contas_id
    FROM contas_pagar
    WHERE status NOT IN ('CANCELADO')
    
    UNION ALL
    
    -- Contas a Receber
    SELECT 
        data_vencimento AS data,
        'RECEBER' AS tipo,
        valor_original AS valor,
        status,
        CASE 
            WHEN status = 'RECEBIDO' THEN 'REALIZADO'
            ELSE 'PREVISTO'
        END AS realizado,
        centro_custo_id,
        plano_contas_id
    FROM contas_receber
    WHERE status NOT IN ('CANCELADO')
)
SELECT 
    data,
    tipo,
    realizado,
    SUM(valor) AS valor_total,
    SUM(CASE WHEN tipo = 'RECEBER' THEN valor ELSE 0 END) AS receitas,
    SUM(CASE WHEN tipo = 'PAGAR' THEN ABS(valor) ELSE 0 END) AS despesas,
    SUM(valor) AS saldo_dia,
    centro_custo_id,
    plano_contas_id
FROM movimentos
GROUP BY data, tipo, realizado, centro_custo_id, plano_contas_id
ORDER BY data;

-- Índice para performance
CREATE INDEX idx_fluxo_caixa_data ON fluxo_caixa(data);
CREATE INDEX idx_fluxo_caixa_realizado ON fluxo_caixa(realizado);

-- Refresh automático (via cron ou trigger)
CREATE OR REPLACE FUNCTION refresh_fluxo_caixa()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY fluxo_caixa;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### 14. DRE (Demonstração de Resultado do Exercício) - VIEW
```sql
CREATE OR REPLACE VIEW dre_mensal AS
WITH receitas AS (
    SELECT 
        DATE_TRUNC('month', data_recebimento) AS mes,
        pc.codigo AS conta_codigo,
        pc.nome AS conta_nome,
        SUM(cr.valor_original) AS valor
    FROM contas_receber cr
    INNER JOIN plano_contas pc ON cr.plano_contas_id = pc.id
    WHERE cr.status = 'RECEBIDO'
      AND pc.tipo = 'RECEITA'
    GROUP BY DATE_TRUNC('month', data_recebimento), pc.codigo, pc.nome
),
despesas AS (
    SELECT 
        DATE_TRUNC('month', data_pagamento) AS mes,
        pc.codigo AS conta_codigo,
        pc.nome AS conta_nome,
        SUM(cp.valor_original) AS valor
    FROM contas_pagar cp
    INNER JOIN plano_contas pc ON cp.plano_contas_id = pc.id
    WHERE cp.status = 'PAGO'
      AND pc.tipo = 'DESPESA'
    GROUP BY DATE_TRUNC('month', data_pagamento), pc.codigo, pc.nome
)
SELECT 
    COALESCE(r.mes, d.mes) AS mes,
    r.conta_codigo AS receita_codigo,
    r.conta_nome AS receita_nome,
    COALESCE(r.valor, 0) AS receita_valor,
    d.conta_codigo AS despesa_codigo,
    d.conta_nome AS despesa_nome,
    COALESCE(d.valor, 0) AS despesa_valor,
    COALESCE(r.valor, 0) - COALESCE(d.valor, 0) AS resultado
FROM receitas r
FULL OUTER JOIN despesas d ON r.mes = d.mes
ORDER BY mes DESC;
```

### 15. AUDITORIA FINANCEIRA
```sql
CREATE TABLE auditoria_financeira (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    tabela VARCHAR(100) NOT NULL,
    registro_id UUID NOT NULL,
    operacao VARCHAR(20) NOT NULL,               -- INSERT, UPDATE, DELETE
    
    dados_antigos JSONB,
    dados_novos JSONB,
    campos_alterados TEXT[],
    
    usuario_id UUID REFERENCES profiles(id),
    usuario_nome VARCHAR(200),
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auditoria_tabela ON auditoria_financeira(tabela);
CREATE INDEX idx_auditoria_registro ON auditoria_financeira(registro_id);
CREATE INDEX idx_auditoria_usuario ON auditoria_financeira(usuario_id);
CREATE INDEX idx_auditoria_data ON auditoria_financeira(created_at);

-- Função genérica de auditoria
CREATE OR REPLACE FUNCTION auditar_alteracao()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO auditoria_financeira (tabela, registro_id, operacao, dados_antigos)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD)::jsonb);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO auditoria_financeira (tabela, registro_id, operacao, dados_antigos, dados_novos)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO auditoria_financeira (tabela, registro_id, operacao, dados_novos)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW)::jsonb);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de auditoria
CREATE TRIGGER audit_contas_pagar
    AFTER INSERT OR UPDATE OR DELETE ON contas_pagar
    FOR EACH ROW EXECUTE FUNCTION auditar_alteracao();

CREATE TRIGGER audit_contas_receber
    AFTER INSERT OR UPDATE OR DELETE ON contas_receber
    FOR EACH ROW EXECUTE FUNCTION auditar_alteracao();

CREATE TRIGGER audit_movimentos_bancarios
    AFTER INSERT OR UPDATE OR DELETE ON movimentos_bancarios
    FOR EACH ROW EXECUTE FUNCTION auditar_alteracao();
```

---

## 🚀 IMPLEMENTAÇÃO COMPLETA

Criei o schema SQL completo. Agora vou criar os serviços, APIs e código exemplo.

Quer que eu continue com:
1. ✅ Código dos serviços (PaymentService, etc)?
2. ✅ Exemplos de integração CNAB?
3. ✅ Frontend Financial.tsx expandido?
4. ✅ APIs REST completas?

**Continuo?**
