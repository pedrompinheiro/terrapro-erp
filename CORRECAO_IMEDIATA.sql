
-- 🚨 SCRIPT DE CORREÇÃO DE PERMISSÃO (ERRO 403) 🚨
-- O erro 403 que apareceu no seu print significa que o banco está BLOQUEANDO o acesso.
-- Rode este código no Supabase SQL Editor para LIBERAR O ACESSO TOTALMENTE (Modo Debug).

-- 1. Desbloquear Tabela de Veículos
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas que podem estar bloqueando
DROP POLICY IF EXISTS "Enable read access for all users" ON assets;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON assets;
DROP POLICY IF EXISTS "Allow All Authenticated" ON assets;
DROP POLICY IF EXISTS "Public Assets Access" ON assets;

-- CRIA POLÍTICA PÚBLICA (Funciona mesmo se o login estiver bugado)
CREATE POLICY "Liberar Geral Assets" ON assets
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 2. Desbloquear Tabela de Histórico
CREATE TABLE IF NOT EXISTS asset_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    ignition BOOLEAN,
    timestamp TIMESTAMPTZ,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE asset_positions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON asset_positions;

-- CRIA POLÍTICA PÚBLICA
CREATE POLICY "Liberar Geral Historico" ON asset_positions
FOR ALL 
USING (true) 
WITH CHECK (true);

-- PRONTO! AGORA O ERRO 403 VAI SUMIR.
