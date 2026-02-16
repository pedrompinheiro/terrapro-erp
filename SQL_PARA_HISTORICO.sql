
-- ⚠️ Copie e cole APENAS este código no Supabase SQL Editor ⚠️

-- 1. Cria a tabela para guardar o histórico
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
    meta JSONB, -- Para dados brutos da API
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cria índices para deixar o histórico rápido
CREATE INDEX IF NOT EXISTS idx_asset_positions_asset_time ON asset_positions(asset_id, timestamp DESC);

-- 3. Habilita segurança
ALTER TABLE asset_positions ENABLE ROW LEVEL SECURITY;

-- 4. Libera permissão para o site gravar o histórico
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON asset_positions;

CREATE POLICY "Enable all access for authenticated users" ON asset_positions
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);
