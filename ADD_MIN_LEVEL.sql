
-- Adiciona coluna de nível mínimo para alerta
ALTER TABLE fuel_tanks 
ADD COLUMN IF NOT EXISTS min_level NUMERIC DEFAULT 500;

-- Atualiza o tanque padrão para 500L de alerta
UPDATE fuel_tanks SET min_level = 500 WHERE min_level IS NULL;
