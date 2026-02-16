-- 🚨 SCRIPT DE "DESBLOQUEIO TOTAL" DA TABELA EMPLOYEES 🚨
-- Use apenas para corrigir erros de "Permission Denied" em desenvolvimento.

-- 1. Garante que as roles do Supabase (anon e authenticated) tenham permissão de ESCREVER na tabela
GRANT ALL ON TABLE employees TO anon;
GRANT ALL ON TABLE employees TO authenticated;
GRANT ALL ON TABLE employees TO service_role;

-- 2. Garante permissão nas sequências (caso o ID seja serial, embora seja UUID)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 3. DESABILITA A SEGURANÇA A NÍVEL DE LINHA (RLS) TEMPORARIAMENTE
-- Isso permite que qualquer um (mesmo sem estar logado) escreva na tabela.
-- Depois que funcionar, podemos reabilitar com políticas certas.
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- 4. Notifica o PostgREST para recarregar o schema (por via das dúvidas)
NOTIFY pgrst, 'reload schema';
