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

-- =============================================================================
-- RLS Policies - Permitir frontend acessar tabelas WhatsApp
-- =============================================================================
GRANT SELECT, INSERT, UPDATE ON whatsapp_messages TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON whatsapp_groups TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON whatsapp_campaigns TO anon, authenticated, service_role;

-- Policies de leitura/escrita
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_messages' AND policyname = 'whatsapp_messages_public_access') THEN
    CREATE POLICY whatsapp_messages_public_access ON whatsapp_messages FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_groups' AND policyname = 'whatsapp_groups_public_access') THEN
    CREATE POLICY whatsapp_groups_public_access ON whatsapp_groups FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_campaigns' AND policyname = 'whatsapp_campaigns_public_access') THEN
    CREATE POLICY whatsapp_campaigns_public_access ON whatsapp_campaigns FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
