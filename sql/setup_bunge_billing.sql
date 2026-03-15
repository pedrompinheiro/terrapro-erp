-- ============================================================
-- MÓDULO FATURAMENTO BUNGE
-- Tabelas para gestão de contratos e faturamento mensal
-- ============================================================

-- 1. CONTRATOS BUNGE
DROP TABLE IF EXISTS public.bunge_billing_items CASCADE;
DROP TABLE IF EXISTS public.bunge_billings CASCADE;
DROP TABLE IF EXISTS public.bunge_contract_items CASCADE;
DROP TABLE IF EXISTS public.bunge_contracts CASCADE;

CREATE TABLE public.bunge_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number TEXT NOT NULL,
    client_name TEXT NOT NULL DEFAULT 'Bunge Alimentos S.A.',
    client_id UUID REFERENCES public.entities(id),
    cnpj TEXT DEFAULT '84.046.101/0001-93',
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ITENS DO CONTRATO (tabela de preços)
CREATE TABLE public.bunge_contract_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.bunge_contracts(id) ON DELETE CASCADE,

    equipment_description TEXT NOT NULL,
    equipment_code TEXT,
    asset_id UUID,

    billing_type TEXT NOT NULL CHECK (billing_type IN (
        'MENSALIDADE',
        'HE',
        'LOCACAO_DIARIA',
        'LOCACAO_MENSAL'
    )),

    unit_value NUMERIC(15,2) NOT NULL,
    unit_label TEXT DEFAULT 'mês',

    -- HE: valor por hora extra e jornada normal em minutos
    he_rate_per_hour NUMERIC(15,2),
    he_normal_shift_minutes INTEGER,

    -- Operadores vinculados (para cálculo HE)
    operator1_employee_id UUID,
    operator2_employee_id UUID,

    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FATURAMENTOS GERADOS
CREATE TABLE public.bunge_billings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.bunge_contracts(id),

    billing_number TEXT NOT NULL,
    billing_type TEXT NOT NULL CHECK (billing_type IN (
        'MENSALIDADE', 'HE', 'LOCACAO'
    )),

    reference_month TEXT NOT NULL,          -- 'YYYY-MM'
    reference_period TEXT,

    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    discount NUMERIC(15,2) DEFAULT 0,
    total NUMERIC(15,2) NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'RASCUNHO' CHECK (status IN (
        'RASCUNHO',
        'GERADO',
        'ENVIADO',
        'FATURADO',
        'RECEBIDO',
        'CANCELADO'
    )),

    conta_receber_id UUID,
    exported_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    notes TEXT,

    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ITENS DO FATURAMENTO
CREATE TABLE public.bunge_billing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    billing_id UUID REFERENCES public.bunge_billings(id) ON DELETE CASCADE,
    contract_item_id UUID REFERENCES public.bunge_contract_items(id),

    equipment_description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_label TEXT DEFAULT 'mês',
    unit_value NUMERIC(15,2) NOT NULL,
    total_value NUMERIC(15,2) NOT NULL,

    -- Campos específicos HE
    he_total_minutes INTEGER,
    he_total_hours_display TEXT,
    he_details JSONB,

    sort_order INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_bunge_contracts_active ON public.bunge_contracts(is_active);
CREATE INDEX idx_bunge_contract_items_contract ON public.bunge_contract_items(contract_id);
CREATE INDEX idx_bunge_contract_items_type ON public.bunge_contract_items(billing_type);
CREATE INDEX idx_bunge_billings_contract ON public.bunge_billings(contract_id);
CREATE INDEX idx_bunge_billings_month ON public.bunge_billings(reference_month);
CREATE INDEX idx_bunge_billings_type ON public.bunge_billings(billing_type);
CREATE INDEX idx_bunge_billings_status ON public.bunge_billings(status);
CREATE INDEX idx_bunge_billing_items_billing ON public.bunge_billing_items(billing_id);

-- ============================================================
-- PERMISSÕES (GRANT)
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bunge_contracts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bunge_contract_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bunge_billings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bunge_billing_items TO authenticated;

GRANT SELECT ON public.bunge_contracts TO anon;
GRANT SELECT ON public.bunge_contract_items TO anon;
GRANT SELECT ON public.bunge_billings TO anon;
GRANT SELECT ON public.bunge_billing_items TO anon;

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE public.bunge_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bunge_contract_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bunge_billings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bunge_billing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bunge_contracts_all" ON public.bunge_contracts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "bunge_contract_items_all" ON public.bunge_contract_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "bunge_billings_all" ON public.bunge_billings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "bunge_billing_items_all" ON public.bunge_billing_items FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================
CREATE TRIGGER update_bunge_contracts_updated_at BEFORE UPDATE ON public.bunge_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bunge_billings_updated_at BEFORE UPDATE ON public.bunge_billings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED: 7º Aditivo ao Contrato (Set/2022)
-- MRO 24072017 – CW2265403
-- ============================================================
INSERT INTO public.bunge_contracts (contract_number, client_name, cnpj, start_date, end_date, is_active, notes)
VALUES (
    '7º Aditivo - MRO 24072017 – CW2265403',
    'Bunge Alimentos S.A.',
    '84.046.101/0001-93',
    '2022-09-01',
    '2023-08-01',
    true,
    'Contrato principal de prestação de serviços de movimentação de carga em Dourados e Monteverde. Vigência prorrogada.'
);

-- Inserir itens do contrato
DO $$
DECLARE
    v_contract_id UUID;
BEGIN
    SELECT id INTO v_contract_id FROM public.bunge_contracts WHERE contract_number LIKE '7º Aditivo%' LIMIT 1;

    -- === MENSALIDADES (fixas mensais) ===
    INSERT INTO public.bunge_contract_items (contract_id, equipment_description, billing_type, unit_value, unit_label, sort_order, notes) VALUES
    (v_contract_id, 'Pá-carregadeira L-60F ano 2014 (Com auto-reverso, manutenção preventiva Volvo autorizada e seguro total Volvo) e mão de obra especializada, com Diesel por conta da contratante', 'MENSALIDADE', 66637.42, 'mês', 1, 'Operação principal'),
    (v_contract_id, 'Pá-carregadeira L-60F ano 2014 TURNO DOIS - SEG A SAB DAS 05:00 ÀS 21:40 (Com auto-reverso, manutenção preventiva Volvo autorizada e seguro total Volvo) e mão de obra especializada, com Diesel por conta da contratante', 'MENSALIDADE', 48892.21, 'mês', 2, 'Turno dois - Farelo'),
    (v_contract_id, 'Mini-Carregadeira CATERPILLAR 2020, com cabina pressurizada, seguro total e equipada com vassourão e com Diesel por conta da CONTRATANTE', 'MENSALIDADE', 14338.48, 'mês', 3, 'Mini-carregadeira');

    -- === SERVIÇOS COMPLEMENTARES MENSAIS ===
    INSERT INTO public.bunge_contract_items (contract_id, equipment_description, billing_type, unit_value, unit_label, sort_order, notes) VALUES
    (v_contract_id, 'Volvo EC 220BLCM 1,2m³ para Desmonte de barreiras no interior da armazenagem de farelo - locado por diária de acordo com a solicitação prévia com turno administrativo', 'LOCACAO_MENSAL', 1733.08, 'mês', 10, 'Escavadeira desmonte barreiras'),
    (v_contract_id, 'Pá-carregadeira L-60F 2019 (Com auto reverso, manutenção Volvo autorizada e seguro total Volvo) e mão de obra especializada e com Diesel por conta da CONTRATANTE (serviço) com operação 24h de segunda a segunda', 'LOCACAO_MENSAL', 53915.19, 'mês', 11, 'PA 24h operação'),
    (v_contract_id, 'Pá-carregadeira L-60F 2019 (Com auto reverso, manutenção Volvo autorizada e seguro total Volvo) e mão de obra especializada e com Diesel por conta da CONTRATANTE (serviço) com operação de 10h solicitada mediante demanda da planta', 'LOCACAO_MENSAL', 46836.87, 'mês', 12, 'PA 10h sob demanda'),
    (v_contract_id, 'Pá carregadeira Volvo L-60F 2019, e mão de obra especializada e com Diesel por conta da CONTRATANTE com operação de 07h30min às 17h00min', 'LOCACAO_MENSAL', 28500.00, 'mês', 15, 'PA horário comercial'),
    (v_contract_id, 'Trator John Deere 140HP 6605, e mão de obra especializada e com Diesel por conta da CONTRATANTE com operação de 07h30min às 17h00min', 'LOCACAO_MENSAL', 23303.36, 'mês', 16, 'Trator JD'),
    (v_contract_id, 'Caminhão Basculante tipo meia cana 6X4 capacidade 20m³, e mão de obra especializada e com Diesel por conta da CONTRATANTE com operação de 07h30min às 17h00min', 'LOCACAO_MENSAL', 24989.66, 'mês', 18, 'Caminhão basculante mensal');

    -- === LOCAÇÕES POR DIÁRIA ===
    INSERT INTO public.bunge_contract_items (contract_id, equipment_description, billing_type, unit_value, unit_label, sort_order, notes) VALUES
    (v_contract_id, 'Pá carregadeira Volvo L-60F 2019, solicitada mediante demanda da planta com franquia de 8 horas trabalhadas', 'LOCACAO_DIARIA', 1600.00, 'diária', 20, 'PA diária'),
    (v_contract_id, 'Caminhão Basculante tipo meia cana 6X4 capacidade 20m³, solicitada mediante demanda da planta com franquia de 8 horas trabalhadas', 'LOCACAO_DIARIA', 1200.00, 'diária', 21, 'Caminhão diária'),
    (v_contract_id, 'Retro-escavadeira CAT416F2 2020, solicitada mediante demanda da planta com franquia de 8 horas trabalhadas', 'LOCACAO_DIARIA', 1934.39, 'diária', 22, 'Retro diária'),
    (v_contract_id, 'Empilhadeira 3,5 ton com 3 estágios diesel/mini-carregadeira CATERPILLAR 2020, com gabina pressurizada, solicitada mediante demanda da planta com franquia de 8 horas trabalhadas', 'LOCACAO_DIARIA', 1499.38, 'diária', 23, 'Empilhadeira diária');

    -- === HORA EXTRA ===
    INSERT INTO public.bunge_contract_items (contract_id, equipment_description, billing_type, unit_value, unit_label, he_rate_per_hour, he_normal_shift_minutes, sort_order, notes) VALUES
    (v_contract_id, 'L-60F (Farelo) - Hora Extra', 'HE', 0, 'hora', 165.00, 1000, 30, 'HE calculada do ponto dos operadores. Jornada normal: 16h40 (1000 min). Valor/hora: ~R$165 (baseado em 60h46=R$10.026,50)');

END $$;
