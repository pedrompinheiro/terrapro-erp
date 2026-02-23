-- ============================================
-- FIX: GRANT permissões para service_role e authenticated
-- Execute ANTES de rodar o script de migração
-- ============================================

-- Dar permissão total para service_role em todas as tabelas do almoxarifado
GRANT ALL ON TABLE inventory_categories TO service_role;
GRANT ALL ON TABLE inventory_brands TO service_role;
GRANT ALL ON TABLE inventory_items TO service_role;
GRANT ALL ON TABLE inventory_movements TO service_role;
GRANT ALL ON TABLE inventory_supplier_products TO service_role;
GRANT ALL ON TABLE service_orders TO service_role;
GRANT ALL ON TABLE service_order_items TO service_role;
GRANT ALL ON TABLE service_order_statuses TO service_role;
GRANT ALL ON TABLE purchase_orders TO service_role;
GRANT ALL ON TABLE purchase_order_items TO service_role;
GRANT ALL ON TABLE equipment_brands TO service_role;
GRANT ALL ON TABLE technicians TO service_role;

-- Também dar permissão para authenticated (para o app funcionar)
GRANT ALL ON TABLE inventory_categories TO authenticated;
GRANT ALL ON TABLE inventory_brands TO authenticated;
GRANT ALL ON TABLE inventory_items TO authenticated;
GRANT ALL ON TABLE inventory_movements TO authenticated;
GRANT ALL ON TABLE inventory_supplier_products TO authenticated;
GRANT ALL ON TABLE service_orders TO authenticated;
GRANT ALL ON TABLE service_order_items TO authenticated;
GRANT ALL ON TABLE service_order_statuses TO authenticated;
GRANT ALL ON TABLE purchase_orders TO authenticated;
GRANT ALL ON TABLE purchase_order_items TO authenticated;
GRANT ALL ON TABLE equipment_brands TO authenticated;
GRANT ALL ON TABLE technicians TO authenticated;

-- Dar permissão de leitura para anon
GRANT SELECT ON TABLE inventory_categories TO anon;
GRANT SELECT ON TABLE inventory_brands TO anon;
GRANT SELECT ON TABLE inventory_items TO anon;
GRANT SELECT ON TABLE inventory_movements TO anon;
GRANT SELECT ON TABLE inventory_supplier_products TO anon;
GRANT SELECT ON TABLE service_orders TO anon;
GRANT SELECT ON TABLE service_order_items TO anon;
GRANT SELECT ON TABLE service_order_statuses TO anon;
GRANT SELECT ON TABLE purchase_orders TO anon;
GRANT SELECT ON TABLE purchase_order_items TO anon;
GRANT SELECT ON TABLE equipment_brands TO anon;
GRANT SELECT ON TABLE technicians TO anon;

-- GRANT nas views
GRANT SELECT ON TABLE v_inventory_below_minimum TO service_role, authenticated, anon;
GRANT SELECT ON TABLE v_inventory_summary_by_category TO service_role, authenticated, anon;

-- Desabilitar RLS temporariamente para migração
ALTER TABLE inventory_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_supplier_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_statuses DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE technicians DISABLE ROW LEVEL SECURITY;

-- Limpar dados parciais de tentativas anteriores
TRUNCATE TABLE inventory_supplier_products CASCADE;
TRUNCATE TABLE purchase_order_items CASCADE;
TRUNCATE TABLE purchase_orders CASCADE;
TRUNCATE TABLE service_order_items CASCADE;
TRUNCATE TABLE service_orders CASCADE;
TRUNCATE TABLE inventory_movements CASCADE;
TRUNCATE TABLE inventory_items CASCADE;
TRUNCATE TABLE technicians CASCADE;
TRUNCATE TABLE equipment_brands CASCADE;
TRUNCATE TABLE inventory_brands CASCADE;
TRUNCATE TABLE inventory_categories CASCADE;
-- NÃO truncar entities (tem dados de outras partes do sistema)
