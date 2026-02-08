
-- Adiciona a coluna active se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'active') THEN
        ALTER TABLE employees ADD COLUMN active BOOLEAN DEFAULT true;
    END IF;
    
    -- Se não existir company_id na tabela employees (o setup original tinha, mas vamos garantir)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'company_id') THEN
         ALTER TABLE employees ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;
END $$;

-- Atualiza funcionários existentes para ativos por padrão
UPDATE employees SET active = true WHERE active IS NULL;

-- Atualiza types para o Supabase pegar
NOTIFY pgrst, 'reload schema';
