-- ============================================================
-- TERRAPRO ERP - Retiradas, NF Fornecedor, Centros de Custo
-- Executar no Supabase SQL Editor
-- ============================================================

-- A.1) CENTROS DE CUSTO
CREATE TABLE IF NOT EXISTS public.cost_centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'OTHER' CHECK (type IN ('ADMIN','SHOP','WORKSITE','ALMOX','OTHER')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.cost_centers (code, name, type)
VALUES
  ('ALMOX', 'Almoxarifado', 'ALMOX'),
  ('OFICINA', 'Oficina Mecanica', 'SHOP'),
  ('ADMIN', 'Administrativo', 'ADMIN')
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_cost_centers_type ON public.cost_centers(type);
CREATE INDEX IF NOT EXISTS idx_cost_centers_active ON public.cost_centers(is_active);

-- A.2) ASSETS - Centro de Custo por Equipamento
ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS default_cost_center_id UUID REFERENCES public.cost_centers(id),
  ADD COLUMN IF NOT EXISTS current_cost_center_id UUID REFERENCES public.cost_centers(id);

CREATE INDEX IF NOT EXISTS idx_assets_current_cc ON public.assets(current_cost_center_id);
CREATE INDEX IF NOT EXISTS idx_assets_default_cc ON public.assets(default_cost_center_id);

-- A.3) PURCHASE_RECEIPTS (cabecalho da retirada)
CREATE TABLE IF NOT EXISTS public.purchase_receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  supplier_id UUID,
  purchase_order_id UUID REFERENCES public.purchase_orders(id),
  receipt_number TEXT NOT NULL,
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','FINALIZED','PENDING_INVOICE','INVOICED','CANCELED')),
  notes TEXT,
  finalized_at TIMESTAMPTZ,
  finalized_by TEXT,
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_receipt_supplier_number UNIQUE (supplier_name, receipt_number)
);

CREATE INDEX IF NOT EXISTS idx_receipts_status ON public.purchase_receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON public.purchase_receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_receipts_supplier ON public.purchase_receipts(supplier_name);

-- A.4) PURCHASE_RECEIPT_ITEMS
CREATE TABLE IF NOT EXISTS public.purchase_receipt_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_receipt_id UUID NOT NULL REFERENCES public.purchase_receipts(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  qty NUMERIC(10,3) NOT NULL CHECK (qty > 0),
  unit_cost_estimated NUMERIC(12,4) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt ON public.purchase_receipt_items(purchase_receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_item ON public.purchase_receipt_items(inventory_item_id);

-- A.5) PURCHASE_RECEIPT_ITEM_ALLOCATIONS (rateio)
CREATE TABLE IF NOT EXISTS public.purchase_receipt_item_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_receipt_item_id UUID NOT NULL REFERENCES public.purchase_receipt_items(id) ON DELETE CASCADE,
  allocation_type TEXT NOT NULL CHECK (allocation_type IN ('EQUIPMENT','COST_CENTER','SERVICE_ORDER','STOCK')),
  equipment_id UUID REFERENCES public.assets(id),
  cost_center_id UUID REFERENCES public.cost_centers(id),
  service_order_id UUID REFERENCES public.service_orders(id),
  qty_allocated NUMERIC(10,3) NOT NULL CHECK (qty_allocated > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_equipment_has_cc CHECK (
    allocation_type != 'EQUIPMENT' OR cost_center_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_alloc_receipt_item ON public.purchase_receipt_item_allocations(purchase_receipt_item_id);
CREATE INDEX IF NOT EXISTS idx_alloc_equipment ON public.purchase_receipt_item_allocations(equipment_id);
CREATE INDEX IF NOT EXISTS idx_alloc_cost_center ON public.purchase_receipt_item_allocations(cost_center_id);

-- A.6) SUPPLIER_INVOICES (NF do fornecedor)
CREATE TABLE IF NOT EXISTS public.supplier_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  chave_nfe TEXT UNIQUE,
  serie TEXT,
  issue_date DATE,
  due_date DATE,
  total_invoice NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','PAID','CANCELED')),
  supplier_cnpj TEXT,
  xml_url TEXT,
  pdf_url TEXT,
  notes TEXT,
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sinv_status ON public.supplier_invoices(status);
CREATE INDEX IF NOT EXISTS idx_sinv_chave ON public.supplier_invoices(chave_nfe);
CREATE INDEX IF NOT EXISTS idx_sinv_supplier ON public.supplier_invoices(supplier_name);
CREATE INDEX IF NOT EXISTS idx_sinv_due ON public.supplier_invoices(due_date);

-- A.7) SUPPLIER_INVOICE_LINES (itens da NF)
CREATE TABLE IF NOT EXISTS public.supplier_invoice_lines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_invoice_id UUID NOT NULL REFERENCES public.supplier_invoices(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES public.inventory_items(id),
  description TEXT,
  ncm TEXT,
  cfop TEXT,
  ean TEXT,
  unit TEXT,
  qty NUMERIC(10,3) NOT NULL,
  unit_cost NUMERIC(12,4) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  matched_confidence TEXT DEFAULT 'NONE'
    CHECK (matched_confidence IN ('HIGH','MEDIUM','LOW','NONE','MANUAL')),
  needs_review BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sinv_lines_invoice ON public.supplier_invoice_lines(supplier_invoice_id);
CREATE INDEX IF NOT EXISTS idx_sinv_lines_item ON public.supplier_invoice_lines(inventory_item_id);

-- A.8) SUPPLIER_INVOICE_RECEIPT_LINKS (NF <-> Retiradas)
CREATE TABLE IF NOT EXISTS public.supplier_invoice_receipt_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_invoice_id UUID NOT NULL REFERENCES public.supplier_invoices(id) ON DELETE CASCADE,
  purchase_receipt_id UUID NOT NULL REFERENCES public.purchase_receipts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_invoice_receipt_link UNIQUE (supplier_invoice_id, purchase_receipt_id)
);

CREATE INDEX IF NOT EXISTS idx_link_invoice ON public.supplier_invoice_receipt_links(supplier_invoice_id);
CREATE INDEX IF NOT EXISTS idx_link_receipt ON public.supplier_invoice_receipt_links(purchase_receipt_id);

-- A.9) NFE_IMPORT_JOBS (rastreabilidade de importacao)
CREATE TABLE IF NOT EXISTS public.nfe_import_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_type TEXT NOT NULL CHECK (file_type IN ('XML','PDF','IMAGE','CHAVE_MANUAL')),
  file_name TEXT,
  file_url TEXT,
  chave_nfe TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','PROCESSING','PARSED','REVIEW','CONFIRMED','ERROR')),
  extracted_text TEXT,
  parsed_data JSONB,
  error_message TEXT,
  confidence_score NUMERIC(5,2),
  supplier_invoice_id UUID REFERENCES public.supplier_invoices(id),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nfe_jobs_status ON public.nfe_import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_nfe_jobs_chave ON public.nfe_import_jobs(chave_nfe);

-- A.10) ALTER INVENTORY_MOVEMENTS - Novos campos
ALTER TABLE public.inventory_movements
  DROP CONSTRAINT IF EXISTS inventory_movements_movement_type_check;

ALTER TABLE public.inventory_movements
  ADD CONSTRAINT inventory_movements_movement_type_check CHECK (movement_type IN (
    'ENTRADA_COMPRA','ENTRADA_DEVOLUCAO','ENTRADA_AJUSTE','ENTRADA_RETIRADA','ENTRADA_NF',
    'SAIDA_OS','SAIDA_VENDA','SAIDA_AJUSTE','SAIDA_PERDA','SAIDA_CONSUMO_INTERNO','SAIDA_EQUIPAMENTO',
    'TRANSFERENCIA'
  ));

ALTER TABLE public.inventory_movements
  ADD COLUMN IF NOT EXISTS receipt_id UUID REFERENCES public.purchase_receipts(id),
  ADD COLUMN IF NOT EXISTS supplier_invoice_id UUID REFERENCES public.supplier_invoices(id),
  ADD COLUMN IF NOT EXISTS destination_type TEXT CHECK (destination_type IN (
    'INTERNAL_CONSUMPTION','EQUIPMENT_MAINTENANCE','SERVICE_ORDER','WORKSITE','STOCK','TRANSFER','SALE','LOSS'
  )),
  ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id),
  ADD COLUMN IF NOT EXISTS equipment_id UUID REFERENCES public.assets(id),
  ADD COLUMN IF NOT EXISTS service_order_id UUID REFERENCES public.service_orders(id),
  ADD COLUMN IF NOT EXISTS hourmeter NUMERIC(10,1),
  ADD COLUMN IF NOT EXISTS responsible_technician_id UUID REFERENCES public.technicians(id);

CREATE INDEX IF NOT EXISTS idx_mov_receipt ON public.inventory_movements(receipt_id);
CREATE INDEX IF NOT EXISTS idx_mov_sinv ON public.inventory_movements(supplier_invoice_id);
CREATE INDEX IF NOT EXISTS idx_mov_equipment ON public.inventory_movements(equipment_id);
CREATE INDEX IF NOT EXISTS idx_mov_cost_center ON public.inventory_movements(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_mov_dest_type ON public.inventory_movements(destination_type);

-- Prevencao de duplicidade
CREATE UNIQUE INDEX IF NOT EXISTS uq_mov_receipt_item_equip
  ON public.inventory_movements(receipt_id, item_id, equipment_id)
  WHERE receipt_id IS NOT NULL AND equipment_id IS NOT NULL;

-- Toda saida com equipamento DEVE ter centro de custo
DO $$
BEGIN
  ALTER TABLE public.inventory_movements
    ADD CONSTRAINT chk_saida_equip_cc CHECK (equipment_id IS NULL OR cost_center_id IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- A.11) RPC: finalize_receipt
CREATE OR REPLACE FUNCTION public.finalize_receipt(p_receipt_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_receipt RECORD;
  v_item RECORD;
  v_alloc RECORD;
  v_total_items INT := 0;
  v_total_movements INT := 0;
  v_almox_cc_id UUID;
  v_alloc_sum NUMERIC;
  v_mov_type TEXT;
  v_dest_type TEXT;
  v_final_cc_id UUID;
BEGIN
  SELECT * INTO v_receipt FROM public.purchase_receipts WHERE id = p_receipt_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Retirada nao encontrada: %', p_receipt_id;
  END IF;
  IF v_receipt.status != 'DRAFT' THEN
    RAISE EXCEPTION 'Retirada ja finalizada (status: %)', v_receipt.status;
  END IF;

  SELECT id INTO v_almox_cc_id FROM public.cost_centers WHERE code = 'ALMOX' LIMIT 1;

  FOR v_item IN
    SELECT ri.*, ii.description AS item_desc, ii.code AS item_code, ii.unit AS item_unit
    FROM public.purchase_receipt_items ri
    JOIN public.inventory_items ii ON ii.id = ri.inventory_item_id
    WHERE ri.purchase_receipt_id = p_receipt_id
  LOOP
    v_total_items := v_total_items + 1;

    SELECT COALESCE(SUM(qty_allocated), 0) INTO v_alloc_sum
    FROM public.purchase_receipt_item_allocations
    WHERE purchase_receipt_item_id = v_item.id;

    IF v_alloc_sum != v_item.qty THEN
      RAISE EXCEPTION 'Item "%" (id: %): soma alocacoes (%) != quantidade (%).',
        v_item.item_desc, v_item.id, v_alloc_sum, v_item.qty;
    END IF;

    -- Entrada no almoxarifado
    INSERT INTO public.inventory_movements (
      item_id, movement_type, quantity, unit_cost, total_value,
      receipt_id, entity_name, reference_type, notes, cost_center_id
    ) VALUES (
      v_item.inventory_item_id, 'ENTRADA_RETIRADA', v_item.qty,
      v_item.unit_cost_estimated, v_item.qty * COALESCE(v_item.unit_cost_estimated, 0),
      p_receipt_id, v_receipt.supplier_name, 'RECEIPT',
      'Entrada via retirada #' || v_receipt.receipt_number, v_almox_cc_id
    );
    v_total_movements := v_total_movements + 1;

    -- Saidas por alocacao
    FOR v_alloc IN
      SELECT alloc.*,
        COALESCE(alloc.cost_center_id, a.current_cost_center_id, a.default_cost_center_id) AS resolved_cc_id
      FROM public.purchase_receipt_item_allocations alloc
      LEFT JOIN public.assets a ON a.id = alloc.equipment_id
      WHERE alloc.purchase_receipt_item_id = v_item.id
    LOOP
      v_final_cc_id := v_alloc.resolved_cc_id;

      CASE v_alloc.allocation_type
        WHEN 'EQUIPMENT' THEN
          v_mov_type := 'SAIDA_EQUIPAMENTO'; v_dest_type := 'EQUIPMENT_MAINTENANCE';
        WHEN 'SERVICE_ORDER' THEN
          v_mov_type := 'SAIDA_OS'; v_dest_type := 'SERVICE_ORDER';
        WHEN 'COST_CENTER' THEN
          v_mov_type := 'SAIDA_CONSUMO_INTERNO'; v_dest_type := 'INTERNAL_CONSUMPTION';
        WHEN 'STOCK' THEN
          v_final_cc_id := v_almox_cc_id;
          CONTINUE;
      END CASE;

      INSERT INTO public.inventory_movements (
        item_id, movement_type, quantity, unit_cost, total_value,
        receipt_id, entity_name, reference_type, notes,
        destination_type, cost_center_id, equipment_id, service_order_id
      ) VALUES (
        v_item.inventory_item_id, v_mov_type, v_alloc.qty_allocated,
        v_item.unit_cost_estimated, v_alloc.qty_allocated * COALESCE(v_item.unit_cost_estimated, 0),
        p_receipt_id, v_receipt.supplier_name, 'RECEIPT_ALLOC',
        'Saida via retirada #' || v_receipt.receipt_number,
        v_dest_type, v_final_cc_id, v_alloc.equipment_id, v_alloc.service_order_id
      );
      v_total_movements := v_total_movements + 1;
    END LOOP;
  END LOOP;

  IF v_total_items = 0 THEN
    RAISE EXCEPTION 'Retirada sem itens. Adicione pelo menos 1 item.';
  END IF;

  UPDATE public.purchase_receipts
  SET status = 'PENDING_INVOICE', finalized_at = NOW(), updated_at = NOW()
  WHERE id = p_receipt_id;

  RETURN jsonb_build_object(
    'success', true, 'receipt_id', p_receipt_id,
    'total_items', v_total_items, 'total_movements', v_total_movements
  );
END;
$$;

-- A.12) RPC: confirm_nf_entry
CREATE OR REPLACE FUNCTION public.confirm_nf_entry(p_invoice_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_invoice RECORD;
  v_line RECORD;
  v_total_entries INT := 0;
  v_has_unreviewed BOOLEAN;
BEGIN
  SELECT * INTO v_invoice FROM public.supplier_invoices WHERE id = p_invoice_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'NF nao encontrada'; END IF;
  IF v_invoice.status != 'OPEN' THEN
    RAISE EXCEPTION 'NF ja processada (status: %)', v_invoice.status;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.supplier_invoice_lines
    WHERE supplier_invoice_id = p_invoice_id AND needs_review = TRUE
  ) INTO v_has_unreviewed;

  IF v_has_unreviewed THEN
    RAISE EXCEPTION 'Existem itens pendentes de revisao. Revise todos antes de confirmar.';
  END IF;

  FOR v_line IN
    SELECT * FROM public.supplier_invoice_lines
    WHERE supplier_invoice_id = p_invoice_id AND inventory_item_id IS NOT NULL
  LOOP
    INSERT INTO public.inventory_movements (
      item_id, movement_type, quantity, unit_cost, total_value,
      supplier_invoice_id, entity_name, reference_type, invoice_number, notes
    ) VALUES (
      v_line.inventory_item_id, 'ENTRADA_COMPRA', v_line.qty,
      v_line.unit_cost, v_line.total, p_invoice_id,
      v_invoice.supplier_name, 'SUPPLIER_INVOICE', v_invoice.invoice_number,
      'Entrada via NF #' || v_invoice.invoice_number
    );
    v_total_entries := v_total_entries + 1;
  END LOOP;

  UPDATE public.purchase_receipts
  SET status = 'INVOICED', updated_at = NOW()
  WHERE id IN (
    SELECT purchase_receipt_id FROM public.supplier_invoice_receipt_links
    WHERE supplier_invoice_id = p_invoice_id
  ) AND status = 'PENDING_INVOICE';

  RETURN jsonb_build_object(
    'success', true, 'invoice_id', p_invoice_id,
    'total_entries', v_total_entries,
    'message', 'NF confirmada. ' || v_total_entries || ' entradas de estoque geradas.'
  );
END;
$$;

-- A.13) VIEWS para relatorios
CREATE OR REPLACE VIEW public.v_pending_invoices AS
SELECT pr.id, pr.supplier_name, pr.receipt_number, pr.receipt_date, pr.status,
  COUNT(pri.id) AS total_items,
  SUM(pri.qty) AS total_qty,
  SUM(pri.qty * COALESCE(pri.unit_cost_estimated, 0)) AS estimated_total
FROM public.purchase_receipts pr
LEFT JOIN public.purchase_receipt_items pri ON pri.purchase_receipt_id = pr.id
WHERE pr.status = 'PENDING_INVOICE'
GROUP BY pr.id, pr.supplier_name, pr.receipt_number, pr.receipt_date, pr.status
ORDER BY pr.receipt_date;

CREATE OR REPLACE VIEW public.v_cost_by_equipment_month AS
SELECT a.id AS equipment_id, a.name AS equipment_name, a.code AS equipment_code,
  cc.name AS cost_center_name,
  DATE_TRUNC('month', im.created_at) AS month,
  COUNT(im.id) AS movement_count,
  SUM(im.total_value) AS total_cost
FROM public.inventory_movements im
JOIN public.assets a ON a.id = im.equipment_id
LEFT JOIN public.cost_centers cc ON cc.id = im.cost_center_id
WHERE im.movement_type LIKE 'SAIDA_%' AND im.equipment_id IS NOT NULL
GROUP BY a.id, a.name, a.code, cc.name, DATE_TRUNC('month', im.created_at)
ORDER BY month DESC, total_cost DESC;

CREATE OR REPLACE VIEW public.v_cost_by_cost_center_month AS
SELECT cc.id AS cost_center_id, cc.name AS cost_center_name, cc.type AS cost_center_type,
  DATE_TRUNC('month', im.created_at) AS month,
  COUNT(im.id) AS movement_count,
  SUM(im.total_value) AS total_cost
FROM public.inventory_movements im
JOIN public.cost_centers cc ON cc.id = im.cost_center_id
WHERE im.movement_type LIKE 'SAIDA_%' AND im.cost_center_id IS NOT NULL
GROUP BY cc.id, cc.name, cc.type, DATE_TRUNC('month', im.created_at)
ORDER BY month DESC, total_cost DESC;

-- A.14) GRANTs
GRANT ALL ON public.cost_centers TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.cost_centers TO authenticated;
GRANT SELECT ON public.cost_centers TO anon;

GRANT ALL ON public.purchase_receipts TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.purchase_receipts TO authenticated;
GRANT SELECT ON public.purchase_receipts TO anon;

GRANT ALL ON public.purchase_receipt_items TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_receipt_items TO authenticated;
GRANT SELECT ON public.purchase_receipt_items TO anon;

GRANT ALL ON public.purchase_receipt_item_allocations TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_receipt_item_allocations TO authenticated;
GRANT SELECT ON public.purchase_receipt_item_allocations TO anon;

GRANT ALL ON public.supplier_invoices TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.supplier_invoices TO authenticated;
GRANT SELECT ON public.supplier_invoices TO anon;

GRANT ALL ON public.supplier_invoice_lines TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_invoice_lines TO authenticated;
GRANT SELECT ON public.supplier_invoice_lines TO anon;

GRANT ALL ON public.supplier_invoice_receipt_links TO postgres, service_role;
GRANT SELECT, INSERT, DELETE ON public.supplier_invoice_receipt_links TO authenticated;
GRANT SELECT ON public.supplier_invoice_receipt_links TO anon;

GRANT ALL ON public.nfe_import_jobs TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.nfe_import_jobs TO authenticated;
GRANT SELECT ON public.nfe_import_jobs TO anon;

GRANT SELECT ON public.v_pending_invoices TO anon, authenticated, service_role;
GRANT SELECT ON public.v_cost_by_equipment_month TO anon, authenticated, service_role;
GRANT SELECT ON public.v_cost_by_cost_center_month TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.finalize_receipt(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.confirm_nf_entry(UUID) TO authenticated, service_role;
