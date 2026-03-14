-- =============================================================================
-- RESTRINGIR ACESSO WHATSAPP: apenas mirandapinheiro@hotmail.com
-- =============================================================================

-- 1. Remover policies permissivas existentes
DROP POLICY IF EXISTS "Acesso Total Mensagens" ON whatsapp_messages;
DROP POLICY IF EXISTS "whatsapp_messages_public_access" ON whatsapp_messages;
DROP POLICY IF EXISTS "Acesso Total Grupos" ON whatsapp_groups;
DROP POLICY IF EXISTS "whatsapp_groups_public_access" ON whatsapp_groups;
DROP POLICY IF EXISTS "Acesso Total Regras" ON whatsapp_rules;
DROP POLICY IF EXISTS "whatsapp_rules_public_access" ON whatsapp_rules;
DROP POLICY IF EXISTS "Acesso Total Campanhas" ON whatsapp_campaigns;
DROP POLICY IF EXISTS "whatsapp_campaigns_public_access" ON whatsapp_campaigns;

-- 2. Policies restritivas - apenas mirandapinheiro@hotmail.com

-- Mensagens
CREATE POLICY "whatsapp_messages_owner_select" ON whatsapp_messages
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' = 'mirandapinheiro@hotmail.com');

CREATE POLICY "whatsapp_messages_owner_insert" ON whatsapp_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'mirandapinheiro@hotmail.com');

CREATE POLICY "whatsapp_messages_owner_update" ON whatsapp_messages
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'mirandapinheiro@hotmail.com');

CREATE POLICY "whatsapp_messages_owner_delete" ON whatsapp_messages
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'mirandapinheiro@hotmail.com');

-- Grupos
CREATE POLICY "whatsapp_groups_owner_select" ON whatsapp_groups
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' = 'mirandapinheiro@hotmail.com');

CREATE POLICY "whatsapp_groups_owner_insert" ON whatsapp_groups
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'mirandapinheiro@hotmail.com');

CREATE POLICY "whatsapp_groups_owner_update" ON whatsapp_groups
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'mirandapinheiro@hotmail.com');

-- Regras
CREATE POLICY "whatsapp_rules_owner_all" ON whatsapp_rules
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'mirandapinheiro@hotmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mirandapinheiro@hotmail.com');

-- Campanhas
CREATE POLICY "whatsapp_campaigns_owner_all" ON whatsapp_campaigns
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'mirandapinheiro@hotmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mirandapinheiro@hotmail.com');

-- 3. service_role (usado pela Edge Function/webhook) já bypassa RLS automaticamente

-- 4. Revogar acesso anon (ninguém sem login acessa)
REVOKE ALL ON whatsapp_messages FROM anon;
REVOKE ALL ON whatsapp_groups FROM anon;
REVOKE ALL ON whatsapp_rules FROM anon;
REVOKE ALL ON whatsapp_campaigns FROM anon;

-- Manter grants para authenticated e service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON whatsapp_messages TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON whatsapp_groups TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON whatsapp_rules TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON whatsapp_campaigns TO authenticated, service_role;
