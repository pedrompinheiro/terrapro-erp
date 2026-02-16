
-- 🚨 SCRIPT DE CORREÇÃO TOTAL DO MAPA 🚨
-- Copie e cole TUDO isso no Supabase SQL Editor e clique em RUN.

--- PARTE 1: CORRIGIR CADASTRO DE VEÍCULOS (ASSETS) ---
-- Habilita segurança na tabela de veículos
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas que podiam estar bloqueando
DROP POLICY IF EXISTS "Enable read access for all users" ON assets;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON assets;
DROP POLICY IF EXISTS "Public Assets Access" ON assets;
DROP POLICY IF EXISTS "Allow All Authenticated" ON assets;

-- CRIA A POLÍTICA PERMISSIVA (Permite tudo para usuários logados)
CREATE POLICY "Allow All Authenticated" ON assets
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

--- PARTE 2: CRIAR TABELA DE HISTÓRICO DE POSIÇÕES ---
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
    meta JSONB, 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cria índices para deixar o histórico rápido
CREATE INDEX IF NOT EXISTS idx_asset_positions_asset_time ON asset_positions(asset_id, timestamp DESC);

-- Habilita segurança na tabela de histórico
ALTER TABLE asset_positions ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas de histórico
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON asset_positions;

-- Cria política permissiva para histórico
CREATE POLICY "Enable all access for authenticated users" ON asset_positions
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- FIM DO SCRIPT
