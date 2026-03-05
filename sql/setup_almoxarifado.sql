-- ============================================================
-- TERRAPRO ERP — Módulo Almoxarifado Completo
-- Migração: Tabelas, Indexes, Triggers, RLS, Seed Data
-- ============================================================

-- 1. CATEGORIAS DE PRODUTOS
DROP TABLE IF EXISTS public.stock_categories CASCADE;
CREATE TABLE public.stock_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.stock_categories(id),
  abc_classification TEXT DEFAULT 'C' CHECK (abc_classification IN ('A', 'B', 'C')),
  xyz_classification TEXT DEFAULT 'Z' CHECK (xyz_classification IN ('X', 'Y', 'Z')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stock_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_categories_all" ON public.stock_categories FOR ALL USING (true) WITH CHECK (true);

-- 2. MARCAS / FABRICANTES
DROP TABLE IF EXISTS public.stock_brands CASCADE;
CREATE TABLE public.stock_brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stock_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_brands_all" ON public.stock_brands FOR ALL USING (true) WITH CHECK (true);

-- 3. LOCALIZAÇÕES NO ALMOXARIFADO
DROP TABLE IF EXISTS public.stock_locations CASCADE;
CREATE TABLE public.stock_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  corridor TEXT,
  shelf TEXT,
  position TEXT,
  warehouse TEXT DEFAULT 'PRINCIPAL',
  description TEXT,
  capacity_kg NUMERIC(10,2),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stock_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_locations_all" ON public.stock_locations FOR ALL USING (true) WITH CHECK (true);

-- 4. ITENS DE ESTOQUE (PRODUTOS / PEÇAS)
DROP TABLE IF EXISTS public.stock_items CASCADE;
CREATE TABLE public.stock_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identificação
  code TEXT NOT NULL UNIQUE,
  barcode TEXT,
  reference TEXT,
  description TEXT NOT NULL,

  -- Classificação
  category_id UUID REFERENCES public.stock_categories(id),
  brand_id UUID REFERENCES public.stock_brands(id),
  unit TEXT DEFAULT 'UNI',

  -- Controle de Estoque
  current_qty NUMERIC(12,3) DEFAULT 0,
  min_qty NUMERIC(12,3) DEFAULT 0,
  max_qty NUMERIC(12,3),
  reorder_point NUMERIC(12,3),
  reorder_qty NUMERIC(12,3),

  -- Preços
  cost_price NUMERIC(12,4) DEFAULT 0,
  sale_price NUMERIC(12,4) DEFAULT 0,
  last_purchase_price NUMERIC(12,4),
  avg_cost NUMERIC(12,4),
  markup_percent NUMERIC(5,2),

  -- Localização
  location_id UUID REFERENCES public.stock_locations(id),
  location_code TEXT,

  -- Fornecedor Principal
  primary_supplier_id UUID REFERENCES public.entities(id),
  lead_time_days INTEGER DEFAULT 7,

  -- Equipamentos Compatíveis
  compatible_assets JSONB DEFAULT '[]'::jsonb,
  equivalent_items JSONB DEFAULT '[]'::jsonb,
  technical_specs JSONB DEFAULT '{}'::jsonb,

  -- Mídia
  photos JSONB DEFAULT '[]'::jsonb,

  -- Analytics
  abc_classification TEXT DEFAULT 'C' CHECK (abc_classification IN ('A', 'B', 'C')),
  consumption_avg_monthly NUMERIC(12,3) DEFAULT 0,
  last_movement_at TIMESTAMPTZ,
  last_purchase_at TIMESTAMPTZ,
  total_consumed_ytd NUMERIC(12,3) DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DISCONTINUED', 'BLOCKED')),
  stock_status TEXT GENERATED ALWAYS AS (
    CASE
      WHEN current_qty <= 0 THEN 'OUT_OF_STOCK'
      WHEN current_qty <= min_qty THEN 'CRITICAL'
      WHEN current_qty <= min_qty * 1.5 THEN 'WARNING'
      ELSE 'NORMAL'
    END
  ) STORED,

  -- Audit
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_items_all" ON public.stock_items FOR ALL USING (true) WITH CHECK (true);

-- Indexes para performance
CREATE INDEX idx_stock_items_code ON public.stock_items(code);
CREATE INDEX idx_stock_items_barcode ON public.stock_items(barcode);
CREATE INDEX idx_stock_items_reference ON public.stock_items(reference);
CREATE INDEX idx_stock_items_category ON public.stock_items(category_id);
CREATE INDEX idx_stock_items_brand ON public.stock_items(brand_id);
CREATE INDEX idx_stock_items_location ON public.stock_items(location_id);
CREATE INDEX idx_stock_items_status ON public.stock_items(status);
CREATE INDEX idx_stock_items_stock_status ON public.stock_items(stock_status);
CREATE INDEX idx_stock_items_supplier ON public.stock_items(primary_supplier_id);
CREATE INDEX idx_stock_items_abc ON public.stock_items(abc_classification);
CREATE INDEX idx_stock_items_last_movement ON public.stock_items(last_movement_at);

-- Full-text search em português
CREATE INDEX idx_stock_items_fts ON public.stock_items
  USING gin(to_tsvector('portuguese', coalesce(description, '') || ' ' || coalesce(reference, '') || ' ' || coalesce(code, '')));


-- 5. MOVIMENTAÇÕES DE ESTOQUE
DROP TABLE IF EXISTS public.stock_movements CASCADE;
CREATE TABLE public.stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  item_id UUID NOT NULL REFERENCES public.stock_items(id) ON DELETE CASCADE,

  -- Tipo e Motivo
  type TEXT NOT NULL CHECK (type IN ('ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'AJUSTE', 'DEVOLUCAO')),
  reason TEXT NOT NULL CHECK (reason IN (
    'COMPRA', 'NF_ENTRADA', 'DEVOLUCAO_CLIENTE', 'BONIFICACAO',
    'CONSUMO_OS', 'CONSUMO_DIRETO', 'PERDA', 'VENCIMENTO',
    'TRANSFERENCIA_SAIDA', 'TRANSFERENCIA_ENTRADA',
    'INVENTARIO', 'CORRECAO'
  )),

  -- Quantidades
  quantity NUMERIC(12,3) NOT NULL,
  direction INTEGER NOT NULL CHECK (direction IN (1, -1)),
  balance_after NUMERIC(12,3),

  -- Custo
  unit_cost NUMERIC(12,4),
  total_cost NUMERIC(12,4),

  -- Referências
  purchase_order_id UUID,
  maintenance_os_id TEXT,
  asset_id UUID,
  asset_name TEXT,
  supplier_id UUID REFERENCES public.entities(id),
  invoice_number TEXT,

  -- Transferência
  from_location TEXT,
  to_location TEXT,

  -- Audit
  notes TEXT,
  performed_by UUID,
  performed_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_movements_all" ON public.stock_movements FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_stock_movements_item ON public.stock_movements(item_id);
CREATE INDEX idx_stock_movements_type ON public.stock_movements(type);
CREATE INDEX idx_stock_movements_reason ON public.stock_movements(reason);
CREATE INDEX idx_stock_movements_date ON public.stock_movements(created_at);
CREATE INDEX idx_stock_movements_asset ON public.stock_movements(asset_id);
CREATE INDEX idx_stock_movements_po ON public.stock_movements(purchase_order_id);


-- 6. REQUISIÇÕES DE COMPRA
DROP TABLE IF EXISTS public.purchase_requisitions CASCADE;
CREATE TABLE public.purchase_requisitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,

  status TEXT DEFAULT 'RASCUNHO' CHECK (status IN (
    'RASCUNHO', 'PENDENTE', 'APROVADA', 'RECUSADA', 'CONVERTIDA', 'CANCELADA'
  )),

  priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('BAIXA', 'NORMAL', 'ALTA', 'URGENTE')),

  items JSONB NOT NULL DEFAULT '[]'::jsonb,

  requested_by UUID,
  requested_by_name TEXT,
  approved_by UUID,
  approved_by_name TEXT,

  justification TEXT,
  department TEXT DEFAULT 'MANUTENCAO',

  total_estimated NUMERIC(12,2),

  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.purchase_requisitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "purchase_requisitions_all" ON public.purchase_requisitions FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_purchase_req_status ON public.purchase_requisitions(status);
CREATE INDEX idx_purchase_req_date ON public.purchase_requisitions(created_at);


-- 7. PEDIDOS DE COMPRA
DROP TABLE IF EXISTS public.purchase_order_items CASCADE;
DROP TABLE IF EXISTS public.purchase_orders CASCADE;

CREATE TABLE public.purchase_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,

  supplier_id UUID REFERENCES public.entities(id),
  supplier_name TEXT,

  status TEXT DEFAULT 'RASCUNHO' CHECK (status IN (
    'RASCUNHO', 'ENVIADA', 'CONFIRMADA', 'PARCIAL', 'RECEBIDA', 'CANCELADA'
  )),

  requisition_id UUID REFERENCES public.purchase_requisitions(id),

  payment_terms TEXT,
  delivery_deadline DATE,

  subtotal NUMERIC(12,2) DEFAULT 0,
  freight NUMERIC(12,2) DEFAULT 0,
  discount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,

  notes TEXT,

  created_by UUID,
  created_by_name TEXT,

  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "purchase_orders_all" ON public.purchase_orders FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_po_status ON public.purchase_orders(status);
CREATE INDEX idx_po_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX idx_po_date ON public.purchase_orders(created_at);


-- 8. ITENS DO PEDIDO DE COMPRA
CREATE TABLE public.purchase_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.stock_items(id),

  description TEXT NOT NULL,
  quantity NUMERIC(12,3) NOT NULL,
  unit TEXT DEFAULT 'UNI',
  unit_price NUMERIC(12,4) DEFAULT 0,
  total_price NUMERIC(12,4) DEFAULT 0,

  qty_received NUMERIC(12,3) DEFAULT 0,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "po_items_all" ON public.purchase_order_items FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_po_items_po ON public.purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_item ON public.purchase_order_items(item_id);


-- ============================================================
-- TRIGGER: Atualizar estoque automaticamente ao inserir movimento
-- ============================================================

CREATE OR REPLACE FUNCTION update_stock_on_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular saldo após
  NEW.balance_after := (
    SELECT COALESCE(current_qty, 0) FROM public.stock_items WHERE id = NEW.item_id
  ) + (NEW.quantity * NEW.direction);

  -- Calcular custo total
  IF NEW.unit_cost IS NOT NULL THEN
    NEW.total_cost := NEW.quantity * NEW.unit_cost;
  END IF;

  -- Atualizar estoque do item
  UPDATE public.stock_items
  SET
    current_qty = current_qty + (NEW.quantity * NEW.direction),
    last_movement_at = NOW(),
    updated_at = NOW(),
    -- Atualizar último preço de compra se for entrada de compra
    last_purchase_price = CASE
      WHEN NEW.type = 'ENTRADA' AND NEW.unit_cost IS NOT NULL THEN NEW.unit_cost
      ELSE last_purchase_price
    END,
    last_purchase_at = CASE
      WHEN NEW.type = 'ENTRADA' THEN NOW()
      ELSE last_purchase_at
    END,
    -- Acumular consumo YTD se for saída
    total_consumed_ytd = CASE
      WHEN NEW.direction = -1 THEN total_consumed_ytd + NEW.quantity
      ELSE total_consumed_ytd
    END
  WHERE id = NEW.item_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_stock_movement ON public.stock_movements;
CREATE TRIGGER trigger_stock_movement
BEFORE INSERT ON public.stock_movements
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_movement();


-- ============================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_stock_items_updated ON public.stock_items;
CREATE TRIGGER trigger_stock_items_updated
BEFORE UPDATE ON public.stock_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- REGISTRAR MÓDULO NO RBAC
-- ============================================================

INSERT INTO public.system_modules (slug, name, category, is_sensitive, is_active)
VALUES ('almoxarifado', 'Almoxarifado e Estoque', 'Logística', false, true)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SEED: Categorias do backup OS Oficina 7.2
-- ============================================================

INSERT INTO public.stock_categories (code, name) VALUES
  ('MOTOR', 'Motor'),
  ('FREIO', 'Freio'),
  ('ELETRICA', 'Elétrica'),
  ('ACESSORIO', 'Acessório'),
  ('LUBRIFICANTES', 'Lubrificantes'),
  ('COMBUSTIVEL', 'Combustível'),
  ('SUSPENSAO', 'Suspensão'),
  ('FILTROS', 'Filtros'),
  ('LIMPEZA', 'Limpeza'),
  ('LAVAGEM', 'Lavagem'),
  ('CORREIAS', 'Correias'),
  ('PECAS', 'Peças'),
  ('FERRAMENTA', 'Ferramenta'),
  ('MANGUEIRA', 'Mangueira'),
  ('ANEL', 'Anel'),
  ('EPI', 'EPI - Equipamento de Proteção'),
  ('BATERIA', 'Bateria'),
  ('TINTA', 'Tinta'),
  ('REPARO', 'Reparo'),
  ('ROLAMENTO', 'Rolamento'),
  ('SISTEMA_AR', 'Sistema de Ar'),
  ('ADESIVO', 'Adesivo'),
  ('PARAFUSO', 'Parafuso'),
  ('LANTERNA', 'Lanterna'),
  ('FAROL', 'Farol'),
  ('LAMPADA', 'Lâmpada'),
  ('RETENTOR', 'Retentor'),
  ('TAMPA', 'Tampa'),
  ('COXIM', 'Coxim'),
  ('BUCHA', 'Bucha'),
  ('INTERRUPTOR', 'Interruptor'),
  ('CALCO', 'Calço'),
  ('JUNTA', 'Junta'),
  ('CRUZETA', 'Cruzeta'),
  ('SOLENOIDE', 'Solenoide'),
  ('LENTES', 'Lentes'),
  ('COLA', 'Cola'),
  ('ADITIVOS', 'Aditivos'),
  ('RADIO', 'Rádio'),
  ('USO', 'Uso Geral'),
  ('DISCO', 'Disco'),
  ('LIXA', 'Lixa'),
  ('TURBO', 'Turbo'),
  ('HIDRAULICA', 'Hidráulica'),
  ('ARAME', 'Arame'),
  ('SOLDA', 'Solda'),
  ('VALVULA', 'Válvula'),
  ('PALHETA', 'Palheta'),
  ('PINTURA', 'Pintura'),
  ('BORRACHARIA', 'Borracharia'),
  ('CONDENSADORES', 'Condensadores e Ventiladores'),
  ('MOLA', 'Mola'),
  ('PNEU', 'Pneu'),
  ('GERAL', 'Geral')
ON CONFLICT (code) DO NOTHING;


-- ============================================================
-- SEED: Principais marcas do backup (top 100)
-- ============================================================

INSERT INTO public.stock_brands (name) VALUES
  ('BOSCH'), ('CATERPILLAR'), ('3M'), ('TECFIL'), ('CONTINENTAL'),
  ('WIX'), ('DONALDSON'), ('LUBRAX'), ('TEXACO'), ('SHELL'),
  ('MOBIL'), ('CASTROL'), ('PARKER'), ('GATES'), ('DAYCO'),
  ('SKF'), ('NSK'), ('FAG'), ('TIMKEN'), ('ZF'),
  ('WABCO'), ('KNORR'), ('BENDIX'), ('MERITOR'), ('DANA'),
  ('SPICER'), ('MAHLE'), ('METAL LEVE'), ('COFAP'), ('MONROE'),
  ('NAKATA'), ('URBA'), ('SABÓ'), ('FREMAX'), ('FRASLE'),
  ('JURID'), ('LONAFLEX'), ('VARGA'), ('EATON'), ('CLARK'),
  ('CUMMINS'), ('PERKINS'), ('MWM'), ('VOLVO'), ('SCANIA'),
  ('MERCEDES'), ('FORD'), ('IVECO'), ('JOHN DEERE'), ('CASE'),
  ('KOMATSU'), ('HYUNDAI'), ('LIEBHERR'), ('RANDON'), ('MARCOPOLO'),
  ('GOODYEAR'), ('FIRESTONE'), ('PIRELLI'), ('BRIDGESTONE'), ('MICHELIN'),
  ('HELLA'), ('OSRAM'), ('PHILIPS'), ('VALEO'), ('DENSO'),
  ('DELPHI'), ('REMY'), ('PRESTOLITE'), ('BROSOL'), ('WEBER'),
  ('SACHS'), ('LUK'), ('BORG WARNER'), ('HOLSET'), ('GARRETT'),
  ('KS'), ('KOLBENSCHMIDT'), ('GLYCO'), ('FEDERAL MOGUL'), ('VICTOR REINZ'),
  ('ELRING'), ('CORTECO'), ('FREUDENBERG'), ('PARKER HANNIFIN'), ('HIDROVAC'),
  ('WEGA'), ('MANN'), ('FLEETGUARD'), ('BALDWIN'), ('FRAM'),
  ('ACDelco'), ('MOPAR'), ('GENUINE'), ('MOTORCRAFT'), ('NACHI'),
  ('KOYO'), ('INA'), ('SCHAEFFLER'), ('NTN'), ('TORRINGTON')
ON CONFLICT (name) DO NOTHING;


-- ============================================================
-- SEED: Localizações padrão do almoxarifado
-- ============================================================

INSERT INTO public.stock_locations (code, corridor, shelf, warehouse, description) VALUES
  ('A-01', 'A', '01', 'PRINCIPAL', 'Corredor A - Prateleira 01'),
  ('A-02', 'A', '02', 'PRINCIPAL', 'Corredor A - Prateleira 02'),
  ('A-03', 'A', '03', 'PRINCIPAL', 'Corredor A - Prateleira 03'),
  ('B-01', 'B', '01', 'PRINCIPAL', 'Corredor B - Prateleira 01'),
  ('B-02', 'B', '02', 'PRINCIPAL', 'Corredor B - Prateleira 02'),
  ('B-03', 'B', '03', 'PRINCIPAL', 'Corredor B - Prateleira 03'),
  ('C-01', 'C', '01', 'PRINCIPAL', 'Corredor C - Prateleira 01'),
  ('C-02', 'C', '02', 'PRINCIPAL', 'Corredor C - Prateleira 02'),
  ('D-01', 'D', '01', 'PRINCIPAL', 'Corredor D - Prateleira 01'),
  ('E-01', 'E', '01', 'PRINCIPAL', 'Corredor E - Prateleira 01'),
  ('F-01', 'F', '01', 'PRINCIPAL', 'Corredor F - Prateleira 01'),
  ('F-02', 'F', '02', 'PRINCIPAL', 'Corredor F - Prateleira 02'),
  ('T-01', 'T', '01', 'TANQUES', 'Área de Tanques - Posição 01'),
  ('T-02', 'T', '02', 'TANQUES', 'Área de Tanques - Posição 02'),
  ('EXT-01', 'EXT', '01', 'EXTERNO', 'Área Externa - Posição 01'),
  ('EXT-02', 'EXT', '02', 'EXTERNO', 'Área Externa - Posição 02'),
  ('OFICINA', 'OF', '01', 'OFICINA', 'Bancada da Oficina')
ON CONFLICT (code) DO NOTHING;
