
-- Tabela de Histórico de Rastreamento (Telemetria)
CREATE TABLE IF NOT EXISTS asset_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION DEFAULT 0,
    ignition BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ NOT NULL,
    address TEXT,
    voltage DOUBLE PRECISION,
    satellite_count INTEGER,
    meta JSONB, -- Para dados brutos da API Selsyn
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas de histórico rápidas
CREATE INDEX IF NOT EXISTS idx_asset_positions_asset_time ON asset_positions(asset_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_asset_positions_timestamp ON asset_positions(timestamp DESC);

-- Habilitar RLS
ALTER TABLE asset_positions ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso (Permissiva para desenvolvimento)
-- Permitir leitura/escrita para usuários logados
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON asset_positions;
CREATE POLICY "Enable all access for authenticated users" ON asset_positions
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Permitir leitura/escrita para Service Role (Scripts de Backend)
DROP POLICY IF EXISTS "Enable all access for service role" ON asset_positions;
CREATE POLICY "Enable all access for service role" ON asset_positions
FOR ALL TO service_role
USING (true)
WITH CHECK (true);
