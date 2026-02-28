-- =============================================================================
-- MÓDULO INTEGRAÇÕES & HABILITAÇÕES POR CLIENTE/UNIDADE v2.0
-- Controle de documentação exigida por clientes (BRF, Bunge, etc.)
-- Execute no Supabase Dashboard > SQL Editor
-- =============================================================================

-- =====================
-- ENUMS
-- =====================
DO $$ BEGIN
  CREATE TYPE integration_doc_status AS ENUM ('PENDENTE','OK','A_VENCER','VENCIDO','BLOQUEADO','EM_ANALISE','REJEITADO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE integration_status AS ENUM ('PENDENTE','ATIVO','BLOQUEADO','INATIVO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE alert_level AS ENUM ('INFO','WARNING','CRITICAL','BLOCK');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE validity_unit AS ENUM ('DAYS','MONTHS','YEARS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================
-- 1. TEMPLATES (Clientes/Unidades)
-- =====================
CREATE TABLE IF NOT EXISTS integration_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    client_name TEXT NOT NULL,
    client_code TEXT,
    unit_name TEXT,
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    is_active BOOLEAN DEFAULT true,
    -- Configuração de alertas
    alert_days JSON DEFAULT '[30, 15, 7]',
    block_on_expiry BOOLEAN DEFAULT true,
    block_grace_days INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 2. ITENS DO CHECKLIST
-- =====================
CREATE TABLE IF NOT EXISTS integration_template_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES integration_templates(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_category TEXT DEFAULT 'GERAL',
    is_required BOOLEAN DEFAULT true,
    -- Validade configurável
    validity_value INTEGER,
    validity_unit validity_unit DEFAULT 'MONTHS',
    -- Regra de bloqueio individual
    blocks_on_expiry BOOLEAN DEFAULT true,
    alert_only BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 3. VÍNCULO FUNCIONÁRIO <-> TEMPLATE
-- =====================
CREATE TABLE IF NOT EXISTS employee_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    template_id UUID REFERENCES integration_templates(id) ON DELETE CASCADE,
    status integration_status DEFAULT 'PENDENTE',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    blocked_at TIMESTAMPTZ,
    blocked_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, template_id)
);

-- =====================
-- 4. DOCUMENTOS ENVIADOS
-- =====================
CREATE TABLE IF NOT EXISTS employee_integration_docs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_integration_id UUID REFERENCES employee_integrations(id) ON DELETE CASCADE,
    template_item_id UUID REFERENCES integration_template_items(id),
    -- Arquivo
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    -- Datas
    issue_date DATE,
    expiry_date DATE,
    -- Status automático
    status integration_doc_status DEFAULT 'PENDENTE',
    -- Verificação
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    -- Versão atual (link para doc_versions)
    current_version INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 5. HISTÓRICO DE VERSÕES
-- =====================
CREATE TABLE IF NOT EXISTS integration_doc_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doc_id UUID REFERENCES employee_integration_docs(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT,
    file_size INTEGER,
    issue_date DATE,
    expiry_date DATE,
    uploaded_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 6. ALERTAS
-- =====================
CREATE TABLE IF NOT EXISTS integration_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_integration_id UUID REFERENCES employee_integrations(id) ON DELETE CASCADE,
    doc_id UUID REFERENCES employee_integration_docs(id),
    alert_level alert_level DEFAULT 'INFO',
    alert_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    days_until_expiry INTEGER,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    read_by UUID,
    -- Canais de notificação
    sent_email BOOLEAN DEFAULT false,
    sent_whatsapp BOOLEAN DEFAULT false,
    sent_system BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 7. CONFIGURAÇÃO DE NOTIFICAÇÃO
-- =====================
CREATE TABLE IF NOT EXISTS integration_notification_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES integration_templates(id) ON DELETE CASCADE,
    alert_days_before INTEGER NOT NULL,
    notify_email BOOLEAN DEFAULT true,
    notify_whatsapp BOOLEAN DEFAULT false,
    notify_system BOOLEAN DEFAULT true,
    notify_manager BOOLEAN DEFAULT true,
    notify_employee BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(template_id, alert_days_before)
);

-- =====================
-- ÍNDICES OTIMIZADOS
-- =====================
CREATE INDEX IF NOT EXISTS idx_integration_templates_company ON integration_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_integration_templates_active ON integration_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_template_items_template ON integration_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_template_items_category ON integration_template_items(document_category);
CREATE INDEX IF NOT EXISTS idx_emp_integrations_employee ON employee_integrations(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_integrations_template ON employee_integrations(template_id);
CREATE INDEX IF NOT EXISTS idx_emp_integrations_status ON employee_integrations(status);
CREATE INDEX IF NOT EXISTS idx_emp_integration_docs_integration ON employee_integration_docs(employee_integration_id);
CREATE INDEX IF NOT EXISTS idx_emp_integration_docs_status ON employee_integration_docs(status);
CREATE INDEX IF NOT EXISTS idx_emp_integration_docs_expiry ON employee_integration_docs(expiry_date);
CREATE INDEX IF NOT EXISTS idx_emp_integration_docs_expiry_status ON employee_integration_docs(expiry_date, status) WHERE status != 'PENDENTE';
CREATE INDEX IF NOT EXISTS idx_doc_versions_doc ON integration_doc_versions(doc_id);
CREATE INDEX IF NOT EXISTS idx_alerts_integration ON integration_alerts(employee_integration_id);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON integration_alerts(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_alerts_level ON integration_alerts(alert_level);
CREATE INDEX IF NOT EXISTS idx_notification_config_template ON integration_notification_config(template_id);

-- =====================
-- FUNCTION: Calcular status automático do documento
-- =====================
CREATE OR REPLACE FUNCTION calc_doc_status(
    p_expiry_date DATE,
    p_file_url TEXT,
    p_alert_days JSON DEFAULT '[30, 15, 7]',
    p_block_on_expiry BOOLEAN DEFAULT true
) RETURNS TEXT AS $$
DECLARE
    days_left INTEGER;
    first_alert INTEGER;
BEGIN
    IF p_file_url IS NULL OR p_file_url = '' THEN
        RETURN 'PENDENTE';
    END IF;
    IF p_expiry_date IS NULL THEN
        RETURN 'OK';
    END IF;
    days_left := p_expiry_date - CURRENT_DATE;
    IF days_left < 0 THEN
        IF p_block_on_expiry THEN
            RETURN 'BLOQUEADO';
        ELSE
            RETURN 'VENCIDO';
        END IF;
    END IF;
    first_alert := (p_alert_days->>0)::INTEGER;
    IF days_left <= first_alert THEN
        RETURN 'A_VENCER';
    END IF;
    RETURN 'OK';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================
-- FUNCTION: Recalcular status da integração do funcionário
-- =====================
CREATE OR REPLACE FUNCTION recalc_integration_status(p_integration_id UUID) RETURNS void AS $$
DECLARE
    has_blocked BOOLEAN;
    has_pending BOOLEAN;
    all_ok BOOLEAN;
BEGIN
    SELECT
        BOOL_OR(d.status::text IN ('BLOQUEADO','VENCIDO') AND ti.is_required),
        BOOL_OR(d.status::text = 'PENDENTE' AND ti.is_required),
        BOOL_AND(d.status::text IN ('OK','A_VENCER') OR NOT ti.is_required)
    INTO has_blocked, has_pending, all_ok
    FROM employee_integration_docs d
    JOIN integration_template_items ti ON ti.id = d.template_item_id
    WHERE d.employee_integration_id = p_integration_id;

    IF has_blocked THEN
        UPDATE employee_integrations SET status = 'BLOQUEADO', blocked_at = NOW(), updated_at = NOW() WHERE id = p_integration_id;
    ELSIF all_ok THEN
        UPDATE employee_integrations SET status = 'ATIVO', blocked_at = NULL, completed_at = NOW(), updated_at = NOW() WHERE id = p_integration_id;
    ELSE
        UPDATE employee_integrations SET status = 'PENDENTE', blocked_at = NULL, updated_at = NOW() WHERE id = p_integration_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================
-- VIEW: Dashboard RH
-- =====================
CREATE OR REPLACE VIEW vw_integration_dashboard AS
SELECT
    d.id AS doc_id,
    d.status::text AS doc_status,
    d.expiry_date,
    (d.expiry_date - CURRENT_DATE) AS days_until_expiry,
    d.file_url,
    ti.document_name,
    ti.document_category,
    ti.is_required,
    ti.blocks_on_expiry,
    ei.id AS integration_id,
    ei.status::text AS integration_status,
    ei.employee_id,
    e.full_name AS employee_name,
    e.cpf AS employee_cpf,
    e.job_title AS employee_role,
    t.id AS template_id,
    t.client_name,
    t.client_code,
    t.unit_name
FROM employee_integration_docs d
JOIN integration_template_items ti ON ti.id = d.template_item_id
JOIN employee_integrations ei ON ei.id = d.employee_integration_id
JOIN employees e ON e.id = ei.employee_id
JOIN integration_templates t ON t.id = ei.template_id;

-- =====================
-- RLS
-- =====================
ALTER TABLE integration_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_integration_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_doc_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_notification_config ENABLE ROW LEVEL SECURITY;

-- Policies públicas (ajustar para produção com auth.uid())
DO $$ BEGIN
CREATE POLICY "integration_templates_access" ON integration_templates FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
CREATE POLICY "integration_template_items_access" ON integration_template_items FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
CREATE POLICY "employee_integrations_access" ON employee_integrations FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
CREATE POLICY "employee_integration_docs_access" ON employee_integration_docs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
CREATE POLICY "integration_doc_versions_access" ON integration_doc_versions FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
CREATE POLICY "integration_alerts_access" ON integration_alerts FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
CREATE POLICY "integration_notification_config_access" ON integration_notification_config FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================
-- GRANTS
-- =====================
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_templates TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_template_items TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON employee_integrations TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON employee_integration_docs TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_doc_versions TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_alerts TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_notification_config TO anon, authenticated, service_role;
GRANT SELECT ON vw_integration_dashboard TO anon, authenticated, service_role;
