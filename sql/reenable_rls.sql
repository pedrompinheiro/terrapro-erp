-- ============================================
-- REABILITAR RLS nas tabelas do Almoxarifado
-- Execute APÓS a migração ter sido concluída com sucesso
-- ============================================

ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

-- Verificar que as policies existem
-- (foram criadas no setup_almoxarifado_completo.sql)
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'inventory_categories', 'inventory_brands', 'inventory_items',
    'inventory_movements', 'inventory_supplier_products',
    'service_orders', 'service_order_items', 'service_order_statuses',
    'purchase_orders', 'purchase_order_items',
    'equipment_brands', 'technicians'
  )
ORDER BY tablename;
