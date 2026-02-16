
-- 1. Cria tabela de Tanques
CREATE TABLE IF NOT EXISTS fuel_tanks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('STATIONARY', 'MOBILE')) DEFAULT 'STATIONARY',
    capacity NUMERIC NOT NULL DEFAULT 0,
    current_level NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilita RLS para Tanques
ALTER TABLE fuel_tanks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total Tanques" ON fuel_tanks FOR ALL USING (true) WITH CHECK (true);

-- 2. Modifica Tabela de Registros para suportar Entrada/Saída
-- Adiciona colunas novas
ALTER TABLE fuel_records 
ADD COLUMN IF NOT EXISTS tank_id UUID REFERENCES fuel_tanks(id),
ADD COLUMN IF NOT EXISTS operation_type TEXT CHECK (operation_type IN ('IN', 'OUT')) DEFAULT 'OUT',
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Torna asset_id opcional (pois na COMPRA não tem asset, vai pro tanque)
ALTER TABLE fuel_records ALTER COLUMN asset_id DROP NOT NULL;
ALTER TABLE fuel_records ALTER COLUMN asset_name DROP NOT NULL;

-- 3. Cria Trigger para Atualizar Estoque Automaticamente
CREATE OR REPLACE FUNCTION update_tank_level() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.operation_type = 'IN') THEN
            -- Entrada (Compra): Aumenta estoque
            UPDATE fuel_tanks SET current_level = current_level + NEW.liters, updated_at = NOW() WHERE id = NEW.tank_id;
        ELSIF (NEW.operation_type = 'OUT') THEN
            -- Saída (Abastecimento): Diminui estoque
            UPDATE fuel_tanks SET current_level = current_level - NEW.liters, updated_at = NOW() WHERE id = NEW.tank_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Reverte se apagar registro
        IF (OLD.operation_type = 'IN') THEN
            UPDATE fuel_tanks SET current_level = current_level - OLD.liters, updated_at = NOW() WHERE id = OLD.tank_id;
        ELSIF (OLD.operation_type = 'OUT') THEN
            UPDATE fuel_tanks SET current_level = current_level + OLD.liters, updated_at = NOW() WHERE id = OLD.tank_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_tank_level ON fuel_records;
CREATE TRIGGER trg_update_tank_level
AFTER INSERT OR DELETE ON fuel_records
FOR EACH ROW EXECUTE FUNCTION update_tank_level();

-- 4. Cria um Tanque Padrão se não existir nenhum
INSERT INTO fuel_tanks (name, type, capacity, current_level)
SELECT 'Tanque Principal 01', 'STATIONARY', 15000, 5000
WHERE NOT EXISTS (SELECT 1 FROM fuel_tanks);

-- 5. Atualiza registros antigos para apontar para o tanque padrão (como Saída)
UPDATE fuel_records 
SET tank_id = (SELECT id FROM fuel_tanks LIMIT 1), operation_type = 'OUT'
WHERE tank_id IS NULL;
