-- ============================================
-- FIX: system_settings — Permissões e dados
-- Corrige permission denied (42501) para anon/authenticated
-- ============================================

-- 1) Garantir GRANTs para todos os roles relevantes
GRANT SELECT ON system_settings TO anon;
GRANT ALL ON system_settings TO authenticated;
GRANT ALL ON system_settings TO service_role;

-- 2) Recriar policies (DROP seguro se já existirem)
DROP POLICY IF EXISTS "Admins podem ler system_settings" ON system_settings;
DROP POLICY IF EXISTS "Admins podem alterar system_settings" ON system_settings;
DROP POLICY IF EXISTS "Leitura system_settings" ON system_settings;
DROP POLICY IF EXISTS "Escrita system_settings" ON system_settings;

-- SELECT: qualquer role (anon para edge functions, authenticated para frontend)
CREATE POLICY "Leitura system_settings" ON system_settings
    FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE: somente authenticated
CREATE POLICY "Escrita system_settings" ON system_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- 3) Inserir gemini_api_key se value estiver NULL
UPDATE system_settings
SET value = 'AIzaSyDbzl3A0no-pNGR6jH24mT4G0bZPXZP4FU'
WHERE key = 'gemini_api_key' AND (value IS NULL OR value = '');
