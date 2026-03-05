-- ============================================
-- Tabela: maintenance_os (Ordens de Servico)
-- Autor: Claude Code Session (16-17/02/2026)
-- ============================================

-- Criar tabela
CREATE TABLE IF NOT EXISTS public.maintenance_os (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id),

    -- Dados do Equipamento
    asset_id UUID,
    asset_name TEXT NOT NULL,

    -- Dados da OS
    seq_number SERIAL,
    type TEXT NOT NULL DEFAULT 'CORRECTIVE' CHECK (type IN ('PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'INSPECTION')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'CANCELLED')),
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),

    description TEXT NOT NULL,
    mechanic TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    parts_needed TEXT[] DEFAULT '{}',
    technician_notes TEXT,

    -- Custos (para integracao financeira)
    labor_cost NUMERIC(12,2) DEFAULT 0,
    parts_cost NUMERIC(12,2) DEFAULT 0,
    total_cost NUMERIC(12,2) GENERATED ALWAYS AS (labor_cost + parts_cost) STORED,
    supplier_id UUID,
    supplier_name TEXT,

    -- Datas
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_maintenance_os_status ON public.maintenance_os(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_os_asset ON public.maintenance_os(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_os_priority ON public.maintenance_os(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_os_opened ON public.maintenance_os(opened_at DESC);

-- RLS
ALTER TABLE public.maintenance_os ENABLE ROW LEVEL SECURITY;

-- Politicas (permitir tudo para autenticados por enquanto)
DROP POLICY IF EXISTS "maintenance_os_select" ON public.maintenance_os;
CREATE POLICY "maintenance_os_select" ON public.maintenance_os
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "maintenance_os_insert" ON public.maintenance_os;
CREATE POLICY "maintenance_os_insert" ON public.maintenance_os
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "maintenance_os_update" ON public.maintenance_os;
CREATE POLICY "maintenance_os_update" ON public.maintenance_os
    FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "maintenance_os_delete" ON public.maintenance_os;
CREATE POLICY "maintenance_os_delete" ON public.maintenance_os
    FOR DELETE TO authenticated USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_maintenance_os_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_maintenance_os_updated ON public.maintenance_os;
CREATE TRIGGER trg_maintenance_os_updated
    BEFORE UPDATE ON public.maintenance_os
    FOR EACH ROW
    EXECUTE FUNCTION update_maintenance_os_timestamp();

-- Grant
GRANT ALL ON public.maintenance_os TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.maintenance_os_seq_number_seq TO authenticated;
