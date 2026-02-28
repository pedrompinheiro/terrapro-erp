-- =============================================================================
-- MÓDULO INTEGRAÇÕES & HABILITAÇÕES POR CLIENTE/UNIDADE
-- Controle de documentação exigida por clientes (BRF, Bunge, etc.)
-- Execute no Supabase Dashboard > SQL Editor
-- =============================================================================

-- 1. Templates de integração por cliente
CREATE TABLE IF NOT EXISTS integration_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    client_name TEXT NOT NULL,
    client_code TEXT,
    is_active BOOLEAN DEFAULT true,
    alert_days_before INTEGER DEFAULT 30,
    block_on_expiry BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Itens do checklist (documentos exigidos por cliente)
CREATE TABLE IF NOT EXISTS integration_template_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES integration_templates(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_category TEXT DEFAULT 'GERAL',
    is_required BOOLEAN DEFAULT true,
    validity_months INTEGER,
    sort_order INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vínculo funcionário <-> template (integração do funcionário no cliente)
CREATE TABLE IF NOT EXISTS employee_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    template_id UUID REFERENCES integration_templates(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PENDENTE',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    blocked_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, template_id)
);

-- 4. Documentos enviados (comprovantes)
CREATE TABLE IF NOT EXISTS employee_integration_docs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_integration_id UUID REFERENCES employee_integrations(id) ON DELETE CASCADE,
    template_item_id UUID REFERENCES integration_template_items(id),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    issue_date DATE,
    expiry_date DATE,
    status TEXT DEFAULT 'PENDENTE',
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Alertas gerados
CREATE TABLE IF NOT EXISTS integration_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_integration_id UUID REFERENCES employee_integrations(id) ON DELETE CASCADE,
    doc_id UUID REFERENCES employee_integration_docs(id),
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ÍNDICES
-- =====================
CREATE INDEX IF NOT EXISTS idx_integration_templates_company ON integration_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_integration_template_items_template ON integration_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_employee_integrations_employee ON employee_integrations(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_integrations_template ON employee_integrations(template_id);
CREATE INDEX IF NOT EXISTS idx_employee_integrations_status ON employee_integrations(status);
CREATE INDEX IF NOT EXISTS idx_employee_integration_docs_integration ON employee_integration_docs(employee_integration_id);
CREATE INDEX IF NOT EXISTS idx_employee_integration_docs_status ON employee_integration_docs(status);
CREATE INDEX IF NOT EXISTS idx_employee_integration_docs_expiry ON employee_integration_docs(expiry_date);
CREATE INDEX IF NOT EXISTS idx_integration_alerts_integration ON integration_alerts(employee_integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_alerts_read ON integration_alerts(is_read);

-- =====================
-- RLS (Row Level Security)
-- =====================
ALTER TABLE integration_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_integration_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integration_templates_public_access" ON integration_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "integration_template_items_public_access" ON integration_template_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "employee_integrations_public_access" ON employee_integrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "employee_integration_docs_public_access" ON employee_integration_docs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "integration_alerts_public_access" ON integration_alerts FOR ALL USING (true) WITH CHECK (true);

-- =====================
-- GRANTS
-- =====================
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_templates TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_template_items TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON employee_integrations TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON employee_integration_docs TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_alerts TO anon, authenticated, service_role;

-- =====================
-- VERIFICAÇÃO
-- =====================
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN (
    'integration_templates',
    'integration_template_items',
    'employee_integrations',
    'employee_integration_docs',
    'integration_alerts'
)
ORDER BY tablename;
