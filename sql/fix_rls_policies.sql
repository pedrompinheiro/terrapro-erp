-- ============================================
-- FIX: Ajustar RLS policies para permitir acesso
--
-- Problema: As policies originais exigiam auth.role() = 'authenticated'
-- mas o frontend usa anon key (sem login). Isso bloqueia todas as queries.
--
-- Solução: Criar policies que permitem SELECT para anon (leitura pública)
-- e ALL para authenticated (CRUD quando logado).
-- ============================================

-- Helper: Dropar policies antigas e criar novas

-- 1. INVENTORY_CATEGORIES
DROP POLICY IF EXISTS "inventory_categories_select_policy" ON inventory_categories;
DROP POLICY IF EXISTS "inventory_categories_all_policy" ON inventory_categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON inventory_categories;
CREATE POLICY "Allow read access to categories" ON inventory_categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to categories" ON inventory_categories FOR ALL USING (auth.role() = 'authenticated');

-- 2. INVENTORY_BRANDS
DROP POLICY IF EXISTS "inventory_brands_select_policy" ON inventory_brands;
DROP POLICY IF EXISTS "inventory_brands_all_policy" ON inventory_brands;
DROP POLICY IF EXISTS "Authenticated users can manage brands" ON inventory_brands;
CREATE POLICY "Allow read access to brands" ON inventory_brands FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to brands" ON inventory_brands FOR ALL USING (auth.role() = 'authenticated');

-- 3. INVENTORY_ITEMS
DROP POLICY IF EXISTS "inventory_items_select_policy" ON inventory_items;
DROP POLICY IF EXISTS "inventory_items_all_policy" ON inventory_items;
DROP POLICY IF EXISTS "Authenticated users can manage items" ON inventory_items;
CREATE POLICY "Allow read access to items" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to items" ON inventory_items FOR ALL USING (auth.role() = 'authenticated');

-- 4. INVENTORY_MOVEMENTS
DROP POLICY IF EXISTS "inventory_movements_select_policy" ON inventory_movements;
DROP POLICY IF EXISTS "inventory_movements_all_policy" ON inventory_movements;
DROP POLICY IF EXISTS "Authenticated users can manage movements" ON inventory_movements;
CREATE POLICY "Allow read access to movements" ON inventory_movements FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to movements" ON inventory_movements FOR ALL USING (auth.role() = 'authenticated');

-- 5. INVENTORY_SUPPLIER_PRODUCTS
DROP POLICY IF EXISTS "inventory_supplier_products_select_policy" ON inventory_supplier_products;
DROP POLICY IF EXISTS "inventory_supplier_products_all_policy" ON inventory_supplier_products;
DROP POLICY IF EXISTS "Authenticated users can manage supplier products" ON inventory_supplier_products;
CREATE POLICY "Allow read access to supplier products" ON inventory_supplier_products FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to supplier products" ON inventory_supplier_products FOR ALL USING (auth.role() = 'authenticated');

-- 6. SERVICE_ORDERS
DROP POLICY IF EXISTS "service_orders_select_policy" ON service_orders;
DROP POLICY IF EXISTS "service_orders_all_policy" ON service_orders;
DROP POLICY IF EXISTS "Authenticated users can manage service orders" ON service_orders;
CREATE POLICY "Allow read access to service orders" ON service_orders FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to service orders" ON service_orders FOR ALL USING (auth.role() = 'authenticated');

-- 7. SERVICE_ORDER_ITEMS
DROP POLICY IF EXISTS "service_order_items_select_policy" ON service_order_items;
DROP POLICY IF EXISTS "service_order_items_all_policy" ON service_order_items;
DROP POLICY IF EXISTS "Authenticated users can manage service order items" ON service_order_items;
CREATE POLICY "Allow read access to service order items" ON service_order_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to service order items" ON service_order_items FOR ALL USING (auth.role() = 'authenticated');

-- 8. SERVICE_ORDER_STATUSES
DROP POLICY IF EXISTS "service_order_statuses_select_policy" ON service_order_statuses;
DROP POLICY IF EXISTS "service_order_statuses_all_policy" ON service_order_statuses;
DROP POLICY IF EXISTS "Authenticated users can manage statuses" ON service_order_statuses;
CREATE POLICY "Allow read access to statuses" ON service_order_statuses FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to statuses" ON service_order_statuses FOR ALL USING (auth.role() = 'authenticated');

-- 9. PURCHASE_ORDERS
DROP POLICY IF EXISTS "purchase_orders_select_policy" ON purchase_orders;
DROP POLICY IF EXISTS "purchase_orders_all_policy" ON purchase_orders;
DROP POLICY IF EXISTS "Authenticated users can manage purchase orders" ON purchase_orders;
CREATE POLICY "Allow read access to purchase orders" ON purchase_orders FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to purchase orders" ON purchase_orders FOR ALL USING (auth.role() = 'authenticated');

-- 10. PURCHASE_ORDER_ITEMS
DROP POLICY IF EXISTS "purchase_order_items_select_policy" ON purchase_order_items;
DROP POLICY IF EXISTS "purchase_order_items_all_policy" ON purchase_order_items;
DROP POLICY IF EXISTS "Authenticated users can manage purchase order items" ON purchase_order_items;
CREATE POLICY "Allow read access to purchase order items" ON purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to purchase order items" ON purchase_order_items FOR ALL USING (auth.role() = 'authenticated');

-- 11. EQUIPMENT_BRANDS
DROP POLICY IF EXISTS "equipment_brands_select_policy" ON equipment_brands;
DROP POLICY IF EXISTS "equipment_brands_all_policy" ON equipment_brands;
DROP POLICY IF EXISTS "Authenticated users can manage equipment brands" ON equipment_brands;
CREATE POLICY "Allow read access to equipment brands" ON equipment_brands FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to equipment brands" ON equipment_brands FOR ALL USING (auth.role() = 'authenticated');

-- 12. TECHNICIANS
DROP POLICY IF EXISTS "technicians_select_policy" ON technicians;
DROP POLICY IF EXISTS "technicians_all_policy" ON technicians;
DROP POLICY IF EXISTS "Authenticated users can manage technicians" ON technicians;
CREATE POLICY "Allow read access to technicians" ON technicians FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to technicians" ON technicians FOR ALL USING (auth.role() = 'authenticated');
