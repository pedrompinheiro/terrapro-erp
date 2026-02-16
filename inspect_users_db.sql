
-- Lista tabelas publicas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verifica colunas de 'employees'
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'employees';

-- Verifica se existe tabela 'profiles'
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
