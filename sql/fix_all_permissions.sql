-- =============================================================================
-- FIX ALL TABLE PERMISSIONS
-- Corrige GRANT + RLS policies para TODAS as tabelas do TerraPro ERP
-- Execute uma unica vez no Supabase Dashboard > SQL Editor
-- =============================================================================

-- =====================
-- GRANTS (SELECT, INSERT, UPDATE, DELETE)
-- =====================

-- RH / Ponto
GRANT SELECT, INSERT, UPDATE, DELETE ON time_entries TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON work_shifts TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON holidays TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON overtime_rules TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON timecard_calculations TO anon, authenticated, service_role;

-- Almoxarifado
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory_items TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory_categories TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory_brands TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory_movements TO anon, authenticated, service_role;

-- Ordens de Servico
GRANT SELECT, INSERT, UPDATE, DELETE ON service_orders TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON service_order_items TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON maintenance_os TO anon, authenticated, service_role;

-- Compras / NF
GRANT SELECT, INSERT, UPDATE, DELETE ON purchase_orders TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON purchase_order_items TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON purchase_receipts TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON purchase_receipt_items TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON purchase_receipt_item_allocations TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON supplier_invoices TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON supplier_invoice_lines TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON supplier_invoice_receipt_links TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON nfe_import_jobs TO anon, authenticated, service_role;

-- Financeiro
GRANT SELECT, INSERT, UPDATE, DELETE ON contas_pagar TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON contas_receber TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON contas_bancarias TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON movimentos_bancarios TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON cnab_arquivos TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON cnab_detalhes TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON conciliacoes TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON conciliacao_sugestoes TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON centros_custo TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON plano_contas TO anon, authenticated, service_role;

-- Empresa / Cadastros
GRANT SELECT, INSERT, UPDATE, DELETE ON companies TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON technicians TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON cost_centers TO anon, authenticated, service_role;

-- WhatsApp
GRANT SELECT, INSERT, UPDATE, DELETE ON whatsapp_rules TO anon, authenticated, service_role;

-- Sistema
GRANT SELECT, INSERT, UPDATE, DELETE ON automation_logs TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON system_modules TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_permissions TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON system_integrations TO anon, authenticated, service_role;

-- =====================
-- RLS POLICIES (public access)
-- =====================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'time_entries', 'work_shifts', 'holidays', 'overtime_rules', 'timecard_calculations',
    'inventory_items', 'inventory_categories', 'inventory_brands', 'inventory_movements',
    'service_orders', 'service_order_items', 'maintenance_os',
    'purchase_orders', 'purchase_order_items', 'purchase_receipts', 'purchase_receipt_items',
    'purchase_receipt_item_allocations', 'supplier_invoices', 'supplier_invoice_lines',
    'supplier_invoice_receipt_links', 'nfe_import_jobs',
    'contas_pagar', 'contas_receber', 'contas_bancarias', 'movimentos_bancarios',
    'cnab_arquivos', 'cnab_detalhes', 'conciliacoes', 'conciliacao_sugestoes',
    'centros_custo', 'plano_contas',
    'companies', 'technicians', 'cost_centers',
    'whatsapp_rules', 'automation_logs',
    'system_modules', 'user_permissions', 'system_integrations'
  ])
  LOOP
    -- Habilitar RLS se nao estiver habilitado
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);

    -- Criar policy se nao existir
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = t AND policyname = t || '_public_access'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR ALL USING (true) WITH CHECK (true)',
        t || '_public_access', t
      );
    END IF;
  END LOOP;
END $$;

-- =====================
-- VERIFICACAO
-- =====================
SELECT tablename, policyname
FROM pg_policies
WHERE policyname LIKE '%_public_access'
ORDER BY tablename;
