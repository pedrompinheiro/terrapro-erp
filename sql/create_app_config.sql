-- =====================================================
-- TABELA DE CONFIGURAÇÕES DO SISTEMA
-- =====================================================

CREATE TABLE IF NOT EXISTS app_config (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar RLS (Row Level Security) - Importante para segurança real em produção
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Política de Leitura Pública (Para facilitar MVP, idealmente restrito a admins)
CREATE POLICY "Leitura pública de config" ON app_config FOR SELECT USING (true);
CREATE POLICY "Escrita pública de config" ON app_config FOR ALL USING (true); -- ATENÇÃO: Em produção, restringir isso!

-- Inserir Senha Padrão (Se não existir)
INSERT INTO app_config (chave, valor, descricao) 
VALUES ('admin_password', 'admin123', 'Senha Mestra para Ações Sensíveis')
ON CONFLICT (chave) DO NOTHING;
