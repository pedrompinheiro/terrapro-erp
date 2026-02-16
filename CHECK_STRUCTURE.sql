
-- Verifica estrutura da tabela entities
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'entities';

-- Verifica estrutura da tabela fuel_records
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fuel_records';

-- Tenta um select simples em entities para ver se não quebra
SELECT id, name, is_supplier FROM entities LIMIT 5;
