-- ============================================================
-- TERRAPRO ERP - MÓDULO ALMOXARIFADO COMPLETO
-- Schema SQL para Supabase (PostgreSQL)
-- Migração do OS Oficina 7.2 → Supabase
-- ============================================================

-- ============================================================
-- 1. CATEGORIAS DE PRODUTOS (GRUPOS)
-- Origem: GRUPOS.DBF (53 registros)
-- ============================================================
DROP TABLE IF EXISTS public.inventory_categories CASCADE;

CREATE TABLE public.inventory_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code INTEGER UNIQUE,                          -- CODIGO do OS Oficina
  name TEXT NOT NULL,                            -- DESCRICAO (ex: FILTROS, MOTOR, CORREIAS)
  margin_1 NUMERIC(10,2) DEFAULT 0,             -- MARGEM1 (margem padrão %)
  margin_2 NUMERIC(10,2) DEFAULT 0,             -- MARGEM2 (margem alternativa %)
  margin_3 NUMERIC(10,2) DEFAULT 0,             -- MARGEM3 (margem atacado %)
  notes TEXT,                                    -- OBS1-OBS4 concatenados
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. MARCAS DE PRODUTOS
-- Origem: MARCA.DBF (50 registros)
-- ============================================================
DROP TABLE IF EXISTS public.inventory_brands CASCADE;

CREATE TABLE public.inventory_brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code INTEGER UNIQUE,                          -- CODIGO do OS Oficina
  name TEXT NOT NULL,                            -- MARCA (ex: TECFIL, CATERPILLAR, DONALDSON)
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. PRODUTOS / PEÇAS / INSUMOS (TABELA PRINCIPAL)
-- Origem: PRODUTOS.DBF (1.881 registros)
-- ============================================================
DROP TABLE IF EXISTS public.inventory_items CASCADE;

CREATE TABLE public.inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identificação
  code INTEGER,                                 -- CODIGO (sequencial do OS Oficina)
  sku TEXT,                                      -- REFERENCIA (Part Number)
  barcode TEXT,                                  -- BARRA (EAN-13)
  description TEXT NOT NULL,                     -- DESCRICAO

  -- Classificação
  is_service BOOLEAN DEFAULT FALSE,              -- SERVICO
  is_product BOOLEAN DEFAULT TRUE,               -- PRODUTO
  item_type TEXT DEFAULT 'PRODUTO',              -- TIPO (PRODUTO/SERVICO)
  unit TEXT DEFAULT 'UNI',                       -- UNIDADE (UNI, PC, KG, LT, MT, CX)

  -- Categoria e Marca (FK)
  category_id UUID REFERENCES public.inventory_categories(id),
  category_name TEXT,                            -- CATEGORIA (desnormalizado para performance)
  brand_id UUID REFERENCES public.inventory_brands(id),
  brand_name TEXT,                               -- MARCA (desnormalizado)

  -- Controle de Estoque
  qty_minimum NUMERIC(10,3) DEFAULT 0,           -- QUANT_MINI
  qty_current NUMERIC(10,3) DEFAULT 0,           -- QUANT_ATUA
  qty_maximum NUMERIC(10,3) DEFAULT 0,           -- QUANT_MAX
  qty_unit NUMERIC(10,3) DEFAULT 1,              -- QUANT_UNID

  -- Movimentação (saldos calculados)
  qty_previous_in NUMERIC(10,3) DEFAULT 0,       -- ENTANT (entrada anterior)
  qty_previous_out NUMERIC(10,3) DEFAULT 0,      -- SAIANT (saída anterior)
  qty_previous_balance NUMERIC(10,3) DEFAULT 0,  -- SALDOANT
  qty_in NUMERIC(10,3) DEFAULT 0,                -- ENTRADA (período)
  qty_out NUMERIC(10,3) DEFAULT 0,               -- SAIDA (período)
  qty_balance NUMERIC(10,3) DEFAULT 0,           -- SALDO
  qty_shortage NUMERIC(10,3) DEFAULT 0,           -- FALTA

  -- Preços e Margens
  cost_price NUMERIC(12,2) DEFAULT 0,            -- P_CUSTO
  sell_price NUMERIC(12,2) DEFAULT 0,            -- P_VENDA
  margin_percent NUMERIC(10,2) DEFAULT 0,        -- MARGEM (%)
  wholesale_price NUMERIC(12,2) DEFAULT 0,       -- ATACADO
  margin_2_percent NUMERIC(10,2) DEFAULT 0,      -- MARGEM2 (%)
  margin_3_percent NUMERIC(10,2) DEFAULT 0,      -- MARGEM3 (atacado %)
  commission_percent NUMERIC(10,2) DEFAULT 0,    -- COMISSAO (%)

  -- Valores calculados
  total_cost NUMERIC(12,2) DEFAULT 0,            -- TOT_CUSTO (custo * estoque)
  profit NUMERIC(12,2) DEFAULT 0,                -- LUCRO
  profit_percent NUMERIC(10,2) DEFAULT 0,        -- LUCROP (%)

  -- Localização Física no Almoxarifado
  location TEXT,                                 -- LOCALIZA (ex: A-001-01, B-012-01, F2)

  -- Fotos
  photo_1_url TEXT,                              -- FOTO1
  photo_2_url TEXT,                              -- FOTO2

  -- Controle de Vencimento
  has_expiry BOOLEAN DEFAULT FALSE,              -- VENZER
  expiry_date DATE,                              -- VENCIMENTO

  -- Alertas
  alert_minimum BOOLEAN DEFAULT FALSE,           -- AVISOMIN
  alert_zero BOOLEAN DEFAULT FALSE,              -- AVISOZER
  sell_when_zero BOOLEAN DEFAULT FALSE,           -- VENZER (vende com estoque zerado)
  blocked BOOLEAN DEFAULT FALSE,                  -- BLOQUEARD

  -- Ranking/Estatísticas
  most_sold_value NUMERIC(10,2) DEFAULT 0,       -- MAIS_VEND
  most_sold_qty NUMERIC(10,3) DEFAULT 0,         -- MAIS_QUAN

  -- Fiscal (para futuro uso NF-e)
  ncm TEXT,                                      -- DESC_NCM
  cfop TEXT,                                     -- CFOP_VEND
  origin TEXT,                                   -- ORIG_PROD

  -- Observações
  notes TEXT,                                    -- MENSAGEM

  -- Dados de importação (referência ao sistema antigo)
  legacy_code INTEGER,                           -- código original OS Oficina
  last_purchase_date DATE,                       -- DATA (última compra)

  -- Metadata
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX idx_inventory_items_code ON public.inventory_items(code);
CREATE INDEX idx_inventory_items_sku ON public.inventory_items(sku);
CREATE INDEX idx_inventory_items_barcode ON public.inventory_items(barcode);
CREATE INDEX idx_inventory_items_description ON public.inventory_items USING gin(to_tsvector('portuguese', description));
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category_id);
CREATE INDEX idx_inventory_items_brand ON public.inventory_items(brand_id);
CREATE INDEX idx_inventory_items_location ON public.inventory_items(location);
CREATE INDEX idx_inventory_items_active ON public.inventory_items(active);

-- ============================================================
-- 4. MOVIMENTAÇÕES DE ESTOQUE (entrada/saída/ajuste)
-- Para rastrear toda movimentação de cada produto
-- ============================================================
DROP TABLE IF EXISTS public.inventory_movements CASCADE;

CREATE TABLE public.inventory_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  item_id UUID NOT NULL REFERENCES public.inventory_items(id),

  -- Tipo de Movimentação
  movement_type TEXT NOT NULL CHECK (movement_type IN (
    'ENTRADA_COMPRA',      -- Entrada por compra/NF
    'ENTRADA_DEVOLUCAO',   -- Devolução de peça
    'ENTRADA_AJUSTE',      -- Ajuste de inventário (+)
    'SAIDA_OS',            -- Saída para Ordem de Serviço
    'SAIDA_VENDA',         -- Venda de balcão
    'SAIDA_AJUSTE',        -- Ajuste de inventário (-)
    'SAIDA_PERDA',         -- Perda/avaria
    'TRANSFERENCIA'        -- Transferência entre locais
  )),

  -- Quantidades
  quantity NUMERIC(10,3) NOT NULL,               -- Quantidade movimentada
  unit_cost NUMERIC(12,4),                       -- Custo unitário no momento
  total_value NUMERIC(12,2),                     -- Valor total da movimentação

  -- Saldo pós-movimento
  balance_after NUMERIC(10,3),                   -- Saldo depois da movimentação

  -- Referências
  reference_type TEXT,                           -- 'OS', 'COMPRA', 'VENDA', 'AJUSTE'
  reference_id UUID,                             -- ID da OS/Compra/Venda
  reference_number INTEGER,                      -- Número da OS/Pedido (legacy)

  -- Fornecedor/Cliente
  entity_id UUID REFERENCES public.entities(id),
  entity_name TEXT,                              -- Nome (desnormalizado)

  -- Responsável
  user_id UUID,
  user_name TEXT,

  -- Documento fiscal
  invoice_number TEXT,                           -- Número NF
  invoice_date DATE,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_movements_item ON public.inventory_movements(item_id);
CREATE INDEX idx_inventory_movements_type ON public.inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_date ON public.inventory_movements(created_at);
CREATE INDEX idx_inventory_movements_ref ON public.inventory_movements(reference_type, reference_id);

-- ============================================================
-- 5. FORNECEDOR x PRODUTO (cotações)
-- Origem: FORPRO.DBF (141 registros) - até 3 fornecedores por produto
-- ============================================================
DROP TABLE IF EXISTS public.inventory_supplier_products CASCADE;

CREATE TABLE public.inventory_supplier_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  supplier_id UUID REFERENCES public.entities(id),
  supplier_name TEXT,                            -- FORNECE1/2/3
  supplier_phone TEXT,                           -- TEL1/2/3
  supplier_rep TEXT,                             -- REPRE1/2/3 (representante)

  cost_price NUMERIC(12,2),                      -- CUSTO1/2/3
  last_quote_date DATE,                          -- DATA1/2/3
  payment_terms TEXT,                            -- COND1/2/3 (condições)
  notes TEXT,                                    -- OBS1/2/3

  priority INTEGER DEFAULT 1,                   -- 1=principal, 2=alternativo, 3=terceiro

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_supplier_products_item ON public.inventory_supplier_products(item_id);
CREATE INDEX idx_supplier_products_supplier ON public.inventory_supplier_products(supplier_id);

-- ============================================================
-- 6. ORDENS DE SERVIÇO
-- Origem: ORDEM.DBF (994 registros) + ORDEM3.DBF (checklist/fotos)
-- ============================================================
DROP TABLE IF EXISTS public.service_orders CASCADE;

CREATE TABLE public.service_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identificação
  order_number INTEGER NOT NULL,                 -- NUMERO (sequencial)
  is_order BOOLEAN DEFAULT TRUE,                 -- ORDEM
  is_quote BOOLEAN DEFAULT FALSE,                -- ORCAMENTO
  is_call BOOLEAN DEFAULT FALSE,                 -- CHAMADO

  -- Datas
  entry_date DATE,                               -- DATAENT
  entry_time TEXT,                                -- HORAENT
  exit_date DATE,                                -- DATASAI
  exit_time TEXT,                                 -- HORASAI

  -- Cliente
  client_code INTEGER,                           -- CODCLI (legacy)
  client_name TEXT,                               -- CLIENTE
  client_contact TEXT,                            -- CONTATO
  client_phone TEXT,                              -- TELEFONE
  client_whatsapp TEXT,                           -- WHATSAPP

  -- Equipamento/Veículo
  equipment_code INTEGER,                        -- CODEQUI
  equipment_name TEXT,                            -- EQUIPA
  model_code INTEGER,                            -- CODMOD
  model_name TEXT,                                -- MODELO
  brand_code INTEGER,                            -- CODMAR
  brand_name TEXT,                                -- MARCA
  plate TEXT,                                    -- PLACA
  color TEXT,                                    -- COR
  km INTEGER DEFAULT 0,                          -- KM
  year_fab INTEGER,                              -- ANO
  year_model INTEGER,                            -- ANOMOD
  fuel_type TEXT,                                -- COMB
  serial_number TEXT,                            -- SERIE
  accessories TEXT,                               -- ACESSORIOS

  -- Situação
  situation_code INTEGER,                        -- CODSIT
  situation TEXT,                                -- SITUACAO (ex: Na bancada, Faltando peças, etc.)

  -- Defeito e Serviço
  defect_1 TEXT,                                 -- DEFEITO1
  defect_2 TEXT,                                 -- DEFEITO2
  service_1 TEXT,                                -- SERVICO1
  service_2 TEXT,                                -- SERVICO2
  service_3 TEXT,                                -- SERVICO3
  service_4 TEXT,                                -- SERVICO4
  service_5 TEXT,                                -- SERVICO5

  -- Técnico/Mecânico
  technician_code INTEGER,                       -- CODTEC
  technician_name TEXT,                          -- TECNICO
  responsible TEXT,                               -- RESPONSA

  -- Valores
  products_value NUMERIC(10,2) DEFAULT 0,        -- VLRPROD
  services_value NUMERIC(10,2) DEFAULT 0,        -- VLRSERV
  labor_value NUMERIC(10,2) DEFAULT 0,           -- MAO_OBRA
  displacement_value NUMERIC(10,2) DEFAULT 0,    -- DESLOCA
  discount_value NUMERIC(10,2) DEFAULT 0,        -- DESCONTO
  total_value NUMERIC(10,2) DEFAULT 0,           -- TOTAL

  -- Pagamento
  payment_form TEXT,                             -- FORMA
  payment_conditions TEXT,                       -- CONDICOES
  is_paid BOOLEAN DEFAULT FALSE,                 -- PAGO

  -- Observações (ORDEM.DBF tem OBS1-OBS8, ORDEM3.DBF tem memo fields)
  observations TEXT,                             -- OBS1-OBS8 concatenados
  defect_memo TEXT,                              -- ORDEM3.DEFEITO (memo)
  findings_memo TEXT,                            -- ORDEM3.CONSTA (memo - o que foi constatado)
  service_memo TEXT,                             -- ORDEM3.SERVICO (memo)
  general_notes_memo TEXT,                       -- ORDEM3.OBSGERAL (memo)

  -- Fotos (ORDEM3)
  photo_1_url TEXT,                              -- ORDEM3.FOTO1
  photo_2_url TEXT,                              -- ORDEM3.FOTO2
  photo_3_url TEXT,                              -- ORDEM3.FOTO3
  photo_4_url TEXT,                              -- ORDEM3.FOTO4
  photo_model_url TEXT,                          -- ORDEM3.FOTOMODELO

  -- Checklist Veicular (ORDEM3 - C1..C24 = labels, P1..P24 = check/uncheck)
  checklist JSONB DEFAULT '[]'::jsonb,           -- Array de {label, checked}
  checklist_fuel TEXT,                           -- CH_COMB (nível combustível)
  checklist_tire_front TEXT,                     -- CH_PNEU_T
  checklist_tire_right TEXT,                     -- CH_PNEU_D
  checklist_tire_left TEXT,                      -- CH_PNEU_E
  checklist_oil TEXT,                            -- CH_OLEO
  checklist_radiator TEXT,                       -- CH_RADIA
  has_checklist BOOLEAN DEFAULT FALSE,           -- ATIVACHECK
  print_checklist BOOLEAN DEFAULT FALSE,         -- IMPCHECK

  -- Controle
  status BOOLEAN DEFAULT TRUE,                   -- STATUS (aberta/fechada)
  control TEXT,                                  -- CONTROLE
  cancel_reason TEXT,                            -- MOTIVO (se cancelada)
  user_code INTEGER,                             -- CODUSU
  user_name TEXT,                                -- USUARIO

  -- Referência ao asset do ERP (se vinculado)
  asset_id UUID,                                 -- FK para assets do TerraPro

  -- Dados de importação
  legacy_number INTEGER,                         -- Número original OS Oficina

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_orders_number ON public.service_orders(order_number);
CREATE INDEX idx_service_orders_plate ON public.service_orders(plate);
CREATE INDEX idx_service_orders_client ON public.service_orders(client_code);
CREATE INDEX idx_service_orders_technician ON public.service_orders(technician_code);
CREATE INDEX idx_service_orders_date ON public.service_orders(entry_date);
CREATE INDEX idx_service_orders_situation ON public.service_orders(situation);

-- ============================================================
-- 7. ITENS DA ORDEM DE SERVIÇO (produtos/serviços usados)
-- Origem: ORDEM2.DBF (2.545 registros)
-- ============================================================
DROP TABLE IF EXISTS public.service_order_items CASCADE;

CREATE TABLE public.service_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  service_order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE,
  order_number INTEGER,                          -- NUMERO (legacy ref)

  -- Produto/Serviço
  item_id UUID REFERENCES public.inventory_items(id),
  product_code INTEGER,                          -- CODPRO (legacy)
  description TEXT,                              -- DESCRICAO
  reference TEXT,                                -- REFERENCIA

  -- Tipo
  is_service BOOLEAN DEFAULT FALSE,              -- SERVICO
  is_product BOOLEAN DEFAULT TRUE,               -- PRODUTO
  unit TEXT DEFAULT 'UNI',                       -- UNIDADE

  -- Valores
  unit_cost NUMERIC(14,4) DEFAULT 0,             -- CUSTO
  unit_price NUMERIC(14,4) DEFAULT 0,            -- VALOR
  quantity NUMERIC(10,3) DEFAULT 0,              -- QUANTIA
  discount NUMERIC(10,2) DEFAULT 0,              -- DESCONTO
  discount_percent NUMERIC(7,2) DEFAULT 0,       -- DESCONTOP
  total NUMERIC(10,2) DEFAULT 0,                 -- TOTAL

  -- Comissão mecânico
  commission NUMERIC(10,2) DEFAULT 0,            -- COMPRO
  commission_product NUMERIC(10,2) DEFAULT 0,    -- COMPRO_PRO

  -- Técnico que executou este item
  technician_code INTEGER,                       -- CODTEC
  technician_name TEXT,                          -- TECNICO

  -- Referências
  client_code INTEGER,                           -- CODCLI
  client_name TEXT,                               -- CLIENTE
  plate TEXT,                                    -- PLACA
  model_name TEXT,                                -- MODELO
  brand_name TEXT,                                -- MARCA

  -- Datas
  item_date DATE,                                -- DATA
  delivery_date DATE,                            -- ENTREGA

  -- Controle
  status BOOLEAN DEFAULT TRUE,                   -- STATUS
  control TEXT,                                  -- CONTROLE
  user_code INTEGER,                             -- CODUSU
  user_name TEXT,                                -- USUARIO

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_so_items_order ON public.service_order_items(service_order_id);
CREATE INDEX idx_so_items_item ON public.service_order_items(item_id);
CREATE INDEX idx_so_items_number ON public.service_order_items(order_number);

-- ============================================================
-- 8. PEDIDOS DE COMPRA
-- Origem: COMPRA.DBF (1.004 registros)
-- ============================================================
DROP TABLE IF EXISTS public.purchase_orders CASCADE;

CREATE TABLE public.purchase_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  order_number INTEGER NOT NULL,                 -- NUMERO
  is_order BOOLEAN DEFAULT TRUE,                 -- PEDIDO
  is_quote BOOLEAN DEFAULT FALSE,                -- ORCAMENTO

  -- Datas
  order_date DATE,                               -- DATA
  order_time TEXT,                                -- HORA
  delivery_date DATE,                            -- DATASAI
  delivery_time TEXT,                             -- HORASAI

  -- Fornecedor
  supplier_code INTEGER,                         -- CODFOR (legacy)
  supplier_id UUID REFERENCES public.entities(id),
  supplier_name TEXT,                             -- FORNECEDOR
  supplier_contact TEXT,                         -- CONTATO
  supplier_phone TEXT,                            -- TELEFONE

  -- Situação
  situation_code INTEGER,                        -- CODSIT
  situation TEXT,                                -- SITUACAO

  -- Técnico solicitante
  technician_code INTEGER,                       -- CODTEC
  technician_name TEXT,                          -- TECNICO

  -- Valores
  items_count INTEGER DEFAULT 0,                 -- ITENS
  total_qty NUMERIC(10,3) DEFAULT 0,             -- QUANTIA
  products_value NUMERIC(10,2) DEFAULT 0,        -- VLRPROD
  other_costs NUMERIC(10,2) DEFAULT 0,           -- OUTROS
  discount NUMERIC(10,2) DEFAULT 0,              -- DESCONTO
  total_value NUMERIC(10,2) DEFAULT 0,           -- TOTAL

  -- Pagamento
  payment_form TEXT,                             -- FORMA
  payment_conditions TEXT,                       -- CONDICOES
  is_paid BOOLEAN DEFAULT FALSE,                 -- PAGO

  -- NF
  invoice_number INTEGER,                        -- NF
  invoice_date DATE,                             -- DATANF

  -- Observações
  observations TEXT,                             -- OBS1
  cancel_reason TEXT,                            -- MOTIVO

  -- Controle
  status BOOLEAN DEFAULT TRUE,                   -- STATUS
  control TEXT,                                  -- CONTROLE
  user_code INTEGER,                             -- CODUSU
  user_name TEXT,                                -- USUARIO

  -- Dados de importação
  legacy_number INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_purchase_orders_number ON public.purchase_orders(order_number);
CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders(supplier_code);
CREATE INDEX idx_purchase_orders_date ON public.purchase_orders(order_date);

-- ============================================================
-- 9. ITENS DO PEDIDO DE COMPRA
-- Origem: COMPRA2.DBF (2.286 registros)
-- ============================================================
DROP TABLE IF EXISTS public.purchase_order_items CASCADE;

CREATE TABLE public.purchase_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  order_number INTEGER,                          -- NUMERO (legacy)

  -- Produto
  item_id UUID REFERENCES public.inventory_items(id),
  product_code INTEGER,                          -- CODPRO (legacy)
  description TEXT,                              -- DESCRICAO
  reference TEXT,                                -- REFERENCIA
  barcode TEXT,                                  -- BARRA

  -- Tipo
  is_product BOOLEAN DEFAULT TRUE,               -- PRODUTO
  unit TEXT DEFAULT 'UNI',                       -- UNIDADE

  -- Valores
  unit_cost NUMERIC(14,4) DEFAULT 0,             -- CUSTO
  unit_price NUMERIC(14,4) DEFAULT 0,            -- VALOR
  quantity NUMERIC(10,3) DEFAULT 0,              -- QUANTIA
  discount NUMERIC(10,2) DEFAULT 0,              -- DESCONTO
  discount_percent NUMERIC(7,2) DEFAULT 0,       -- DESCONTOP
  total NUMERIC(10,2) DEFAULT 0,                 -- TOTAL

  -- Entrega
  delivery_date DATE,                            -- DATA_ENTRE
  delivery_time TEXT,                            -- HORA_ENTRE
  shortage NUMERIC(10,3) DEFAULT 0,              -- FALTAS

  -- Fornecedor
  supplier_code INTEGER,                         -- CODFOR
  supplier_name TEXT,                             -- FORNECEDOR

  -- Controle
  status BOOLEAN DEFAULT TRUE,                   -- STATUS
  notes TEXT,                                    -- OBS

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_po_items_order ON public.purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_item ON public.purchase_order_items(item_id);

-- ============================================================
-- 10. SITUAÇÕES (STATUS DAS OS)
-- Origem: SITUA.DBF (8 registros)
-- ============================================================
DROP TABLE IF EXISTS public.service_order_statuses CASCADE;

CREATE TABLE public.service_order_statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code INTEGER UNIQUE,                           -- CODIGO
  name TEXT NOT NULL,                             -- SITUACAO
  color TEXT DEFAULT '#6B7280',                  -- Cor para UI
  icon TEXT,                                     -- Ícone para UI
  is_final BOOLEAN DEFAULT FALSE,                -- Se é status final (FINALIZADA, FECHAMENTO)
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir situações do OS Oficina
INSERT INTO public.service_order_statuses (code, name, color, is_final, sort_order) VALUES
  (1, 'Entrega via Motoboy', '#3B82F6', FALSE, 1),
  (3, 'Retornou', '#F59E0B', FALSE, 2),
  (6, 'Entrega pendente', '#8B5CF6', FALSE, 3),
  (7, 'Na bancada', '#10B981', FALSE, 4),
  (8, 'Faltando peças', '#EF4444', FALSE, 5),
  (9, 'Aguardando Aprovação', '#F97316', FALSE, 6),
  (10, 'FINALIZADA', '#22C55E', TRUE, 7),
  (11, 'FECHAMENTO', '#6B7280', TRUE, 8),
  (12, 'CANCELADO', '#DC2626', TRUE, 9),
  (13, 'Entrega direto para o cliente', '#06B6D4', FALSE, 10);

-- ============================================================
-- 11. MARCAS DE EQUIPAMENTOS/VEÍCULOS
-- Origem: MARCAS.DBF (554 registros) - diferente da MARCA de produtos
-- ============================================================
DROP TABLE IF EXISTS public.equipment_brands CASCADE;

CREATE TABLE public.equipment_brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code INTEGER,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. TÉCNICOS / MECÂNICOS
-- Origem: TECNICO.DBF (36 registros)
-- Vincula com employees existente quando possível
-- ============================================================
DROP TABLE IF EXISTS public.technicians CASCADE;

CREATE TABLE public.technicians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  code INTEGER UNIQUE,                           -- COD do OS Oficina
  name TEXT NOT NULL,                             -- NOM

  -- Funções
  is_technician BOOLEAN DEFAULT TRUE,            -- TECNICO
  is_mechanic BOOLEAN DEFAULT FALSE,             -- MECANICO
  is_seller BOOLEAN DEFAULT FALSE,               -- VENDEDOR
  is_attendant BOOLEAN DEFAULT FALSE,            -- ATENDENTE

  -- Comissão
  commission_percent NUMERIC(10,2) DEFAULT 0,    -- COMISSAO
  commission_on_products BOOLEAN DEFAULT FALSE,  -- COMI_PROD
  commission_on_services BOOLEAN DEFAULT FALSE,  -- COMI_SERV

  -- Contato
  phone TEXT,                                    -- TEL1
  cell_phone TEXT,                               -- CEL
  email TEXT,                                    -- EMAIL
  cpf TEXT,                                      -- CPF

  -- Status
  is_active BOOLEAN DEFAULT TRUE,                -- NOT INATIVO
  is_blocked BOOLEAN DEFAULT FALSE,              -- BLOQUEAR

  -- Estatísticas
  total_sales NUMERIC(14,2) DEFAULT 0,           -- MAIS_VEND
  total_qty NUMERIC(14,3) DEFAULT 0,             -- MAIS_QUAN
  revenue NUMERIC(14,2) DEFAULT 0,               -- RECEITA

  -- Vínculo com employee do ERP (se existir)
  employee_id UUID,

  -- Dados de importação
  legacy_code INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_technicians_code ON public.technicians(code);
CREATE INDEX idx_technicians_name ON public.technicians(name);

-- ============================================================
-- 13. VIEWS ÚTEIS
-- ============================================================

-- View: Produtos abaixo do estoque mínimo (sugestão de compra)
CREATE OR REPLACE VIEW public.v_inventory_below_minimum AS
SELECT
  i.id,
  i.code,
  i.sku,
  i.description,
  i.category_name,
  i.brand_name,
  i.unit,
  i.qty_current,
  i.qty_minimum,
  (i.qty_minimum - i.qty_current) AS qty_needed,
  i.cost_price,
  ((i.qty_minimum - i.qty_current) * i.cost_price) AS estimated_cost,
  i.location,
  i.last_purchase_date
FROM public.inventory_items i
WHERE i.active = TRUE
  AND i.qty_current < i.qty_minimum
  AND i.is_product = TRUE
ORDER BY (i.qty_minimum - i.qty_current) DESC;

-- View: Resumo do estoque por categoria
CREATE OR REPLACE VIEW public.v_inventory_summary_by_category AS
SELECT
  i.category_name,
  COUNT(*) AS total_items,
  SUM(CASE WHEN i.qty_current <= 0 THEN 1 ELSE 0 END) AS zero_stock,
  SUM(CASE WHEN i.qty_current > 0 AND i.qty_current < i.qty_minimum THEN 1 ELSE 0 END) AS below_minimum,
  SUM(i.qty_current * i.cost_price) AS total_cost_value,
  SUM(i.qty_current * i.sell_price) AS total_sell_value
FROM public.inventory_items i
WHERE i.active = TRUE AND i.is_product = TRUE
GROUP BY i.category_name
ORDER BY total_cost_value DESC;

-- View: Histórico de OS por equipamento
CREATE OR REPLACE VIEW public.v_service_orders_by_equipment AS
SELECT
  so.plate,
  so.model_name,
  so.brand_name,
  COUNT(*) AS total_os,
  SUM(so.total_value) AS total_spent,
  MAX(so.entry_date) AS last_os_date,
  STRING_AGG(DISTINCT so.situation, ', ') AS statuses
FROM public.service_orders so
WHERE so.plate IS NOT NULL AND so.plate != ''
GROUP BY so.plate, so.model_name, so.brand_name
ORDER BY total_spent DESC;

-- ============================================================
-- 14. RLS (Row Level Security)
-- ============================================================
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

-- Políticas: acesso para usuários autenticados
CREATE POLICY "inventory_categories_all" ON public.inventory_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "inventory_brands_all" ON public.inventory_brands FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "inventory_items_all" ON public.inventory_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "inventory_movements_all" ON public.inventory_movements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "inventory_supplier_products_all" ON public.inventory_supplier_products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "service_orders_all" ON public.service_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "service_order_items_all" ON public.service_order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "purchase_orders_all" ON public.purchase_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "purchase_order_items_all" ON public.purchase_order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "service_order_statuses_all" ON public.service_order_statuses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "equipment_brands_all" ON public.equipment_brands FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "technicians_all" ON public.technicians FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 15. TRIGGERS para updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_categories_updated_at BEFORE UPDATE ON public.inventory_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_supplier_products_updated_at BEFORE UPDATE ON public.inventory_supplier_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON public.service_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON public.technicians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 16. TRIGGER: Atualizar estoque automaticamente em movimentações
-- ============================================================
CREATE OR REPLACE FUNCTION update_stock_on_movement()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.movement_type LIKE 'ENTRADA_%' THEN
        UPDATE public.inventory_items
        SET qty_current = qty_current + NEW.quantity,
            qty_in = qty_in + NEW.quantity,
            qty_balance = qty_balance + NEW.quantity
        WHERE id = NEW.item_id;
    ELSIF NEW.movement_type LIKE 'SAIDA_%' THEN
        UPDATE public.inventory_items
        SET qty_current = qty_current - NEW.quantity,
            qty_out = qty_out + NEW.quantity,
            qty_balance = qty_balance - NEW.quantity
        WHERE id = NEW.item_id;
    END IF;

    -- Atualizar saldo no registro de movimentação
    SELECT qty_current INTO NEW.balance_after
    FROM public.inventory_items WHERE id = NEW.item_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_stock_movement
  BEFORE INSERT ON public.inventory_movements
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_movement();

-- ============================================================
-- PRONTO! Schema completo do Almoxarifado criado.
-- Próximo passo: executar script de migração DBF → Supabase
-- ============================================================
