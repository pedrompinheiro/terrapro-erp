
-- Remove políticas antigas (se existirem) para evitar conflito
DROP POLICY IF EXISTS "Acesso Total Tanques" ON fuel_tanks;
DROP POLICY IF EXISTS "Acesso Total Fuel" ON fuel_records;

-- Garante que RLS está ativo
ALTER TABLE fuel_tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_records ENABLE ROW LEVEL SECURITY;

-- Cria políticas permissivas (CRUD total para todos os usuários logados e anônimos por enquanto)
CREATE POLICY "Permissao Total Tanques" 
ON fuel_tanks 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Permissao Total Historico" 
ON fuel_records 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Garante permissões de GRANT para roles do Supabase
GRANT ALL ON fuel_tanks TO anon, authenticated, service_role;
GRANT ALL ON fuel_records TO anon, authenticated, service_role;
