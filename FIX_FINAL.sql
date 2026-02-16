
-- 🚨 CORREÇÃO DEFINITIVA (ESTE SCRIPT NÃO DÁ ERRO) 🚨

-- --- PARTE 1: VEÍCULOS ---
-- Garante Grants (Fundamental caso a tabela tenha perdido permissões)
GRANT ALL ON TABLE assets TO service_role;
GRANT ALL ON TABLE assets TO postgres;
GRANT ALL ON TABLE assets TO anon;
GRANT ALL ON TABLE assets TO authenticated;

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Remove a política se ela já existir (para não dar erro)
DROP POLICY IF EXISTS "Liberar Geral Assets" ON assets;
DROP POLICY IF EXISTS "Allow All Authenticated" ON assets;
DROP POLICY IF EXISTS "Enable read access for all users" ON assets;

-- Cria novamente
CREATE POLICY "Liberar Geral Assets" ON assets
FOR ALL 
USING (true) 
WITH CHECK (true);


-- --- PARTE 2: HISTÓRICO ---
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

-- Grants para Histórico
GRANT ALL ON TABLE asset_positions TO service_role;
GRANT ALL ON TABLE asset_positions TO postgres;
GRANT ALL ON TABLE asset_positions TO anon;
GRANT ALL ON TABLE asset_positions TO authenticated;

ALTER TABLE asset_positions ENABLE ROW LEVEL SECURITY;

-- Remove a política se ela já existir
DROP POLICY IF EXISTS "Liberar Geral Historico" ON asset_positions;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON asset_positions;

-- Cria novamente
CREATE POLICY "Liberar Geral Historico" ON asset_positions
FOR ALL 
USING (true) 
WITH CHECK (true);
-- FIM! Se aparecer Success, está resolvido.
