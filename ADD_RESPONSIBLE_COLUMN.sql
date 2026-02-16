
-- Adicionar coluna de responsável na tabela de registros
ALTER TABLE fuel_records 
ADD COLUMN IF NOT EXISTS responsible_id UUID,        -- Link com tabela de funcionários (se houver)
ADD COLUMN IF NOT EXISTS responsible_name TEXT;      -- Nome salvo para histórico (ou caso não tenha ID)

-- Opcional: Se quiser linkar com a tabela de usuários do sistema (auth.users)
-- ADD COLUMN user_id UUID REFERENCES auth.users(id);
