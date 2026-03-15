-- 1. Tabela de Módulos do Sistema
CREATE TABLE IF NOT EXISTS system_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Operacional', 'Administrativo', 'Financeiro', 'RH', 'Logística', 'Medição', 'Admin')),
    is_sensitive BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Permissões de Usuário
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_slug TEXT NOT NULL REFERENCES system_modules(slug) ON DELETE CASCADE,
    can_create BOOLEAN DEFAULT false,
    can_read BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, module_slug)
);

-- 3. Log de Auditoria de Permissões
CREATE TABLE IF NOT EXISTS permission_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id),
    target_user_id UUID,
    action TEXT NOT NULL, -- GRANT, REVOKE, UPDATE
    module_slug TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip_address TEXT,
    details TEXT
);

-- Habilitar RLS
ALTER TABLE system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (Simplificadas inicialmente)
-- Módulos: Todos podem ler módulos ativos (para montar menu)
DROP POLICY IF EXISTS "Public Read Active Modules" ON system_modules;
CREATE POLICY "Public Read Active Modules" ON system_modules FOR SELECT USING (is_active = true);

-- Permissões: Usuário vê suas próprias permissões
DROP POLICY IF EXISTS "User Read Own Permissions" ON user_permissions;
CREATE POLICY "User Read Own Permissions" ON user_permissions FOR SELECT USING (auth.uid() = user_id);

-- 4. Seed de Módulos (Conforme solicitado)
INSERT INTO system_modules (slug, name, category, is_sensitive, is_active) VALUES
-- Operacional
('frota_ativos', 'Gestão de Equipamentos', 'Operacional', false, true),
('frota_manutencao', 'Manutenção Preventiva e Corretiva', 'Operacional', false, true),
('controle_diesel', 'Abastecimento e Consumo', 'Operacional', true, true), -- Já em uso
('diaria_operadores', 'Controle de Diárias e Horímetros', 'Operacional', false, true),
('whatsapp_automacao', 'Automação WhatsApp', 'Operacional', true, true),
-- Medição
('medicao_brf_bunge', 'Medições de Contratos (BRF/Bunge)', 'Medição', true, true),
-- Logística
('locacao_maquinas', 'Contratos de Locação', 'Logística', false, true),
-- Financeiro
('fin_contas_pagar', 'Contas a Pagar', 'Financeiro', true, true),
('fin_contas_receber', 'Contas a Receber', 'Financeiro', true, true),
('fin_bancos_cnab', 'Integração Bancária', 'Financeiro', true, true),
('fin_pix_auto', 'Conciliação PIX', 'Financeiro', true, true),
-- RH
('rh_folha_ponto', 'Folha e Ponto', 'RH', true, true), -- Já em uso
-- Admin
('sys_audit_logs', 'Logs de Sistema', 'Admin', true, true)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name, 
    category = EXCLUDED.category, 
    is_sensitive = EXCLUDED.is_sensitive,
    is_active = EXCLUDED.is_active;

-- View Helper para Frontend (facilita o hook usePermission)
CREATE OR REPLACE VIEW view_user_permissions AS
SELECT 
    up.user_id,
    up.module_slug,
    sm.name as module_name,
    sm.category,
    sm.is_sensitive,
    up.can_create,
    up.can_read,
    up.can_update,
    up.can_delete
FROM user_permissions up
JOIN system_modules sm ON up.module_slug = sm.slug
WHERE sm.is_active = true;

-- Grant access to view
GRANT SELECT ON view_user_permissions TO authenticated;
GRANT SELECT ON system_modules TO authenticated;
GRANT SELECT ON user_permissions TO authenticated;

-- ==========================================
-- FUNÇÃO AUXILIAR PARA SETUP INICIAL
-- ==========================================
CREATE OR REPLACE FUNCTION grant_full_access(target_email TEXT)
RETURNS void AS $$
DECLARE
  target_user_id UUID;
  mod RECORD;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', target_email;
  END IF;

  FOR mod IN SELECT slug FROM system_modules LOOP
    INSERT INTO user_permissions (user_id, module_slug, can_create, can_read, can_update, can_delete)
    VALUES (target_user_id, mod.slug, true, true, true, true)
    ON CONFLICT (user_id, module_slug) DO UPDATE SET
      can_create = true, can_read = true, can_update = true, can_delete = true;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
