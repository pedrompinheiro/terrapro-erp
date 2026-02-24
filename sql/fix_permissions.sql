-- ============================================================
-- FIX: Permissões de tabela para os roles do Supabase
-- Rodar no SQL Editor do Supabase Dashboard
-- ============================================================

-- GRANT acesso completo para anon e authenticated em todas as tabelas do almoxarifado

GRANT ALL ON public.stock_categories TO anon, authenticated;
GRANT ALL ON public.stock_brands TO anon, authenticated;
GRANT ALL ON public.stock_locations TO anon, authenticated;
GRANT ALL ON public.stock_items TO anon, authenticated;
GRANT ALL ON public.stock_movements TO anon, authenticated;
GRANT ALL ON public.purchase_requisitions TO anon, authenticated;
GRANT ALL ON public.purchase_orders TO anon, authenticated;
GRANT ALL ON public.purchase_order_items TO anon, authenticated;

-- GRANT USAGE nas sequences (para INSERT com gen_random_uuid funcionar)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Garantir que as policies RLS existem e estão corretas
-- (Re-criar apenas se não existirem)

DO $$
BEGIN
  -- stock_categories
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_categories' AND policyname = 'stock_categories_all') THEN
    CREATE POLICY "stock_categories_all" ON public.stock_categories FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- stock_brands
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_brands' AND policyname = 'stock_brands_all') THEN
    CREATE POLICY "stock_brands_all" ON public.stock_brands FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- stock_locations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_locations' AND policyname = 'stock_locations_all') THEN
    CREATE POLICY "stock_locations_all" ON public.stock_locations FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- stock_items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_items' AND policyname = 'stock_items_all') THEN
    CREATE POLICY "stock_items_all" ON public.stock_items FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- stock_movements
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stock_movements' AND policyname = 'stock_movements_all') THEN
    CREATE POLICY "stock_movements_all" ON public.stock_movements FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- purchase_requisitions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_requisitions' AND policyname = 'purchase_requisitions_all') THEN
    CREATE POLICY "purchase_requisitions_all" ON public.purchase_requisitions FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- purchase_orders
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_orders' AND policyname = 'purchase_orders_all') THEN
    CREATE POLICY "purchase_orders_all" ON public.purchase_orders FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- purchase_order_items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_order_items' AND policyname = 'po_items_all') THEN
    CREATE POLICY "po_items_all" ON public.purchase_order_items FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
