-- 1. Cria a coluna active se não existir
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- 2. Atualiza os funcionários existentes para active = true
UPDATE employees SET active = TRUE WHERE active IS NULL;
