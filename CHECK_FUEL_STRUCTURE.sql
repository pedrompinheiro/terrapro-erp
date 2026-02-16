
-- Tenta ver se existe tabela de tanques
SELECT EXISTS (
    SELECT FROM information_schema.tables WHERE table_name = 'fuel_tanks'
);

-- Vê estrutura atual de fuel_records
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fuel_records';
