
-- Verifica se a tabela fuel_records existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'fuel_records'
);

-- Verifica RLS da tabela fuel_records
SELECT * FROM pg_policies WHERE tablename = 'fuel_records';

-- Tenta selecionar 1 registro pra ver se dá erro
SELECT * FROM fuel_records LIMIT 1;
