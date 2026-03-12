-- ==========================================
-- SETUP FILIAIS + CENTROS DE CUSTO HIERÁRQUICOS
-- Rodar no Supabase Dashboard → SQL Editor
-- ==========================================

-- 1. METADATA NAS COMPANIES (filiais já existem na tabela)
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS short_name TEXT,
ADD COLUMN IF NOT EXISTS tga_codfilial INTEGER;

UPDATE companies SET tga_codfilial=1, short_name='Transportadora Terra' WHERE document='14.628.837/0001-94';
UPDATE companies SET tga_codfilial=2, short_name='Construtora Terra'    WHERE document='06.152.273/0001-38';
UPDATE companies SET tga_codfilial=3, short_name='Douradão Materiais'   WHERE document='03.334.384/0001-77';
UPDATE companies SET tga_codfilial=4, short_name='M&P Materiais'        WHERE document='25.214.690/0001-02';

-- 2. FILIAL_ID NAS TABELAS FINANCEIRAS
ALTER TABLE contas_receber ADD COLUMN IF NOT EXISTS filial_id UUID REFERENCES companies(id);
ALTER TABLE contas_pagar   ADD COLUMN IF NOT EXISTS filial_id UUID REFERENCES companies(id);
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS filial_id UUID REFERENCES companies(id);

CREATE INDEX IF NOT EXISTS idx_cr_filial ON contas_receber(filial_id);
CREATE INDEX IF NOT EXISTS idx_cp_filial ON contas_pagar(filial_id);
CREATE INDEX IF NOT EXISTS idx_cb_filial ON contas_bancarias(filial_id);

-- Índices compostos para queries filtradas por filial + vencimento
CREATE INDEX IF NOT EXISTS idx_cr_filial_venc ON contas_receber(filial_id, data_vencimento);
CREATE INDEX IF NOT EXISTS idx_cp_filial_venc ON contas_pagar(filial_id, data_vencimento);

-- Coluna para rastrear código original do TGA
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS tga_codcaixa TEXT;

-- Backfill contas_bancarias de empresa_cnpj → filial_id
UPDATE contas_bancarias cb SET filial_id = c.id
FROM companies c WHERE cb.empresa_cnpj = c.document AND cb.filial_id IS NULL;

-- 3. ENRIQUECER CENTROS_CUSTO PARA HIERARQUIA TGA
ALTER TABLE centros_custo
ADD COLUMN IF NOT EXISTS tga_code TEXT,
ADD COLUMN IF NOT EXISTS natureza TEXT DEFAULT 'D',
ADD COLUMN IF NOT EXISTS fixo_variavel TEXT,
ADD COLUMN IF NOT EXISTS nivel INTEGER DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_cc_tga_code ON centros_custo(tga_code);

-- 4. APP_CONFIG (senha admin e configs globais)
CREATE TABLE IF NOT EXISTS app_config (
    chave TEXT PRIMARY KEY,
    valor TEXT,
    descricao TEXT
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_app_config') THEN
    CREATE POLICY allow_all_app_config ON app_config FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

INSERT INTO app_config (chave, valor, descricao)
VALUES ('admin_password', '1234', 'Senha Mestra Financeiro')
ON CONFLICT (chave) DO UPDATE SET valor = '1234';

-- 5. RLS para companies (garantir leitura)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'allow_read_companies') THEN
    CREATE POLICY allow_read_companies ON companies FOR SELECT USING (true);
  END IF;
END $$;
