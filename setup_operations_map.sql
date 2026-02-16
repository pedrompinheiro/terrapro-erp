
-- Tabela de Operações Diárias de Equipamentos (Mapa)

CREATE TABLE IF NOT EXISTS asset_daily_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    operation_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('WORKED', 'STANDBY', 'MAINTENANCE', 'RAIN', 'NO_OPERATOR', 'TRANSPORT')),
    
    -- Dados de Localização e Cliente
    client_name TEXT, -- Ex: PREFEITURA DOURADOS
    work_site TEXT,   -- Ex: PEDREIRA, OBRA X
    
    -- Horários
    start_time TIME WITHOUT TIME ZONE,
    end_time TIME WITHOUT TIME ZONE,
    break_start TIME WITHOUT TIME ZONE,
    break_end TIME WITHOUT TIME ZONE,
    total_hours NUMERIC(5,2) DEFAULT 0, -- Calculado (horas trabalhadas)

    -- Horímetro
    start_horometer NUMERIC(10,2),
    end_horometer NUMERIC(10,2),
    
    -- Financeiro (Opcional por enquanto, mas útil)
    daily_rate NUMERIC(10,2), -- Valor da diária se aplicável
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Garantir 1 registro por dia por equipamento? 
    -- Se um equipamento puder trabalhar em 2 lugares no mesmo dia, removemos essa constraint unica.
    -- Vamos assumir por enquanto que é um apontamento principal por dia, ou múltiplos se necessário.
    -- Deixarei sem constraint unica para permitir quebras no dia.
    CONSTRAINT ensure_valid_times CHECK (end_time >= start_time)
);

-- Habilitar RLS
ALTER TABLE asset_daily_operations ENABLE ROW LEVEL SECURITY;

-- Permissões
GRANT ALL ON TABLE asset_daily_operations TO service_role;
GRANT ALL ON TABLE asset_daily_operations TO postgres;
GRANT ALL ON TABLE asset_daily_operations TO anon;
GRANT ALL ON TABLE asset_daily_operations TO authenticated;

-- Políticas
DROP POLICY IF EXISTS "Enable read access for all users" ON asset_daily_operations;
CREATE POLICY "Enable read access for all users" ON asset_daily_operations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON asset_daily_operations;
CREATE POLICY "Enable insert access for authenticated users" ON asset_daily_operations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for authenticated users" ON asset_daily_operations;
CREATE POLICY "Enable update access for authenticated users" ON asset_daily_operations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON asset_daily_operations;
CREATE POLICY "Enable delete access for authenticated users" ON asset_daily_operations FOR DELETE USING (true);
