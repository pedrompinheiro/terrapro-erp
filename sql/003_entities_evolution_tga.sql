-- ============================================================
-- EVOLUÇÃO DA TABELA entities
-- Aprendizados do sistema TGA (Firebird) → TerraPro ERP
-- ============================================================

-- 1. Segundo telefone (TGA: 207 registros com 2 telefones)
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS phone2 TEXT;

-- 2. Endereço de entrega separado (TGA tem 3 endereços: principal, pagamento, entrega)
--    Para material de construção, endereço de entrega é CRÍTICO
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS delivery_zip_code TEXT;
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS delivery_street TEXT;
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS delivery_number TEXT;
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS delivery_complement TEXT;
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS delivery_neighborhood TEXT;
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS delivery_city TEXT;
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS delivery_state TEXT;

-- 3. Flag produtor rural (importante para questões fiscais - ICMS, IE)
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS is_rural_producer BOOLEAN DEFAULT FALSE;

-- 4. Código legado TGA para rastreabilidade
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS legacy_code TEXT;

-- 5. Data da última compra (analytics - TGA: DATAULTMOVIMENTO)
ALTER TABLE public.entities ADD COLUMN IF NOT EXISTS last_purchase_date DATE;

-- 6. Remover constraint UNIQUE do document para permitir migração
--    (TGA tem ~100 duplicatas legítimas - mesmo CPF como cliente E fornecedor)
--    Depois limpar e re-adicionar se quiser
ALTER TABLE public.entities DROP CONSTRAINT IF EXISTS entities_document_key;

-- 7. Criar índice para busca por documento (não unique, permite duplicatas temporárias)
CREATE INDEX IF NOT EXISTS idx_entities_document ON public.entities (document);

-- 8. Criar índice para busca por legacy_code
CREATE INDEX IF NOT EXISTS idx_entities_legacy_code ON public.entities (legacy_code);

-- 9. Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_entities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_entities_updated_at ON public.entities;
CREATE TRIGGER trg_entities_updated_at
  BEFORE UPDATE ON public.entities
  FOR EACH ROW
  EXECUTE FUNCTION update_entities_updated_at();
