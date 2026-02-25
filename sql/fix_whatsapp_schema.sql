-- =============================================================================
-- Fix WhatsApp Schema - Colunas faltantes + Settings para Edge Functions
-- =============================================================================

-- Colunas extras em whatsapp_messages
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS sender_phone text;
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS ai_urgency text;
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text';
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS remote_jid text;

-- JID para vincular grupo da Evolution API
ALTER TABLE whatsapp_groups ADD COLUMN IF NOT EXISTS jid text UNIQUE;

-- Settings para Edge Functions acessarem a Evolution API
INSERT INTO system_settings (key, value, label, description, category, is_secret)
VALUES
  ('evolution_api_url', 'http://localhost:8080', 'Evolution API URL', 'URL da Evolution API (Docker)', 'api_keys', false),
  ('evolution_api_key', 'terrapro123', 'Evolution API Key', 'Chave de autenticacao da Evolution API', 'api_keys', true),
  ('evolution_instance_name', 'terrapro_bot', 'Instancia WhatsApp', 'Nome da instancia na Evolution API', 'api_keys', false)
ON CONFLICT (key) DO NOTHING;
