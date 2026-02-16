
-- Tabela de Registros de Abastecimento
DROP TABLE IF EXISTS public.fuel_records CASCADE;

CREATE TABLE public.fuel_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relacionamentos
  asset_id UUID NOT NULL,            -- Id do Caminhão/Máquina (FK lógica para tabela de assets)
  asset_name TEXT,                   -- Nome do veículo no momento do registro (snapshot)
  
  supplier_id UUID REFERENCES public.entities(id), -- Posto/Fornecedor
  supplier_name TEXT,                -- Nome do posto (snapshot)
  
  -- Dados do Abastecimento
  date TIMESTAMPTZ DEFAULT NOW(),
  liters NUMERIC(10, 2) NOT NULL,    -- Quantidade
  price_per_liter NUMERIC(10, 2),    -- Preço Unitário
  total_value NUMERIC(12, 2),        -- Valor Total
  
  horometer NUMERIC(10, 1),          -- Horímetro no momento
  odometer NUMERIC(10, 1),           -- Hodômetro (Opcional)
  
  -- Eficiência (Calculado)
  efficiency NUMERIC(10, 2),         -- Km/L ou L/h
  
  -- Fiscal
  invoice_number TEXT,               -- Número da NF
  invoice_date DATE,                 -- Data de emissão da NF
  
  operator_id UUID,                  -- Quem abasteceu (Motorista)
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.fuel_records ENABLE ROW LEVEL SECURITY;

-- Política Aberta (para desenvolvimento)
CREATE POLICY "Acesso Total Fuel" ON public.fuel_records FOR ALL USING (true) WITH CHECK (true);
