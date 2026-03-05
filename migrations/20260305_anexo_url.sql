-- ============================================
-- Migration: Adicionar coluna anexo_url
-- Data: 2026-03-05
-- Descrição: Permite anexar documentos (PDF, XLS, imagens)
--            nos lançamentos de contas a pagar e a receber
-- ============================================

-- Contas a Pagar
ALTER TABLE contas_pagar
ADD COLUMN IF NOT EXISTS anexo_url TEXT;

COMMENT ON COLUMN contas_pagar.anexo_url IS 'URL do documento anexado (PDF, XLS, imagem) no Supabase Storage';

-- Contas a Receber
ALTER TABLE contas_receber
ADD COLUMN IF NOT EXISTS anexo_url TEXT;

COMMENT ON COLUMN contas_receber.anexo_url IS 'URL do documento anexado (PDF, XLS, imagem) no Supabase Storage';

-- Índice para facilitar consultas de documentos anexados
CREATE INDEX IF NOT EXISTS idx_contas_pagar_anexo ON contas_pagar (anexo_url) WHERE anexo_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contas_receber_anexo ON contas_receber (anexo_url) WHERE anexo_url IS NOT NULL;
