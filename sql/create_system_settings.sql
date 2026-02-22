-- ============================================
-- system_settings — Configurações globais do sistema (chaves API, parâmetros)
-- Criado: 18/02/2026
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,                    -- ex: 'gemini_api_key', 'selsyn_api_key'
    value TEXT,                                  -- valor (pode ser criptografado no futuro)
    label TEXT NOT NULL,                         -- nome amigável: 'Chave Gemini AI'
    description TEXT,                            -- descrição de onde obter, pra que serve
    category TEXT NOT NULL DEFAULT 'api_keys',   -- agrupamento: 'api_keys', 'system', 'notifications'
    is_secret BOOLEAN DEFAULT true,              -- se true, exibe mascarado na UI (*****)
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Índice por categoria
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_system_settings_updated ON system_settings;
CREATE TRIGGER trg_system_settings_updated
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_system_settings_timestamp();

-- RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Somente admins podem ler/escrever (via service role ou RLS policy)
CREATE POLICY "Admins podem ler system_settings" ON system_settings
    FOR SELECT USING (true);  -- Todos autenticados podem ler (necessário para o front carregar as chaves)

CREATE POLICY "Admins podem alterar system_settings" ON system_settings
    FOR ALL USING (true);  -- Em produção, restringir a role = 'ADMIN'

-- ============================================
-- Pré-cadastro das chaves conhecidas do sistema
-- ============================================

INSERT INTO system_settings (key, label, description, category, is_secret, value) VALUES
    ('gemini_api_key', 'Google Gemini AI', 'Chave da API Gemini para OCR de cartão de ponto e análise de frota. Obtenha em aistudio.google.com/apikey', 'api_keys', true, null),
    ('selsyn_api_key', 'Selsyn GPS (Token)', 'Token de autenticação da API Selsyn para rastreamento GPS. Fornecido pelo suporte Selsyn.', 'api_keys', true, null),
    ('selsyn_api_url', 'Selsyn GPS (URL Base)', 'URL base da API Selsyn. Padrão: https://integra.sfrota.com.br', 'api_keys', false, 'https://integra.sfrota.com.br'),
    ('whatsapp_api_token', 'WhatsApp Business API', 'Token da API do WhatsApp Business (Meta) para automação de mensagens.', 'api_keys', true, null),
    ('company_cnpj', 'CNPJ Principal', 'CNPJ da empresa principal para integrações fiscais.', 'system', false, null),
    ('smtp_host', 'Servidor SMTP', 'Host do servidor de email para notificações (ex: smtp.gmail.com)', 'notifications', false, null),
    ('smtp_port', 'Porta SMTP', 'Porta do servidor SMTP (ex: 587)', 'notifications', false, '587'),
    ('smtp_user', 'Usuário SMTP', 'Email de envio para notificações do sistema', 'notifications', false, null),
    ('smtp_password', 'Senha SMTP', 'Senha ou App Password do email de envio', 'notifications', true, null)
ON CONFLICT (key) DO NOTHING;

-- Grants
GRANT ALL ON system_settings TO authenticated;
GRANT ALL ON system_settings TO service_role;
