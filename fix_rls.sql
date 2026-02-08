-- Script para corrigir permissões de leitura (RLS)
-- Rode isso no SQL Editor do Supabase se a tela de RH estiver vazia ou com erro de permissão.

-- 1. Garantir que RLS está ativo (boa prática)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas de leitura para evitar duplicidade
DROP POLICY IF EXISTS "Enable read access for all users" ON employees;
DROP POLICY IF EXISTS "Enable read access for all users" ON time_entries;
DROP POLICY IF EXISTS "Public Read Employees" ON employees;
DROP POLICY IF EXISTS "Public Read Time Entries" ON time_entries;

-- 3. Criar políticas permissivas para Leitura (SELECT)
-- Isso permite que a aplicação (com a chave anon) leia os dados.
CREATE POLICY "Public Read Employees" ON employees 
FOR SELECT 
USING (true);

CREATE POLICY "Public Read Time Entries" ON time_entries 
FOR SELECT 
USING (true);

-- (Opcional) Permitir Insert/Update se você for editar pela aplicação
-- CREATE POLICY "Public Write Time Entries" ON time_entries FOR ALL USING (true);
