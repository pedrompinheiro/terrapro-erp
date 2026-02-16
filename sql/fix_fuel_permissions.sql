
-- Script Final para Corrigir Permissões do Módulo de Combustível
-- Autor: Antigravity

-- 1. Conceder permissões de leitura (SELECT) para usuários autenticados
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.employees TO authenticated;

-- 2. Configurar RLS (Segurança a Nível de Linha) para permitir leitura
DO $$
BEGIN
    -- Permitir leitura na tabela user_profiles (Perfil do Usuário)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Permitir Leitura user_profiles" ON public.user_profiles;
        CREATE POLICY "Permitir Leitura user_profiles" ON public.user_profiles FOR SELECT TO authenticated USING (true);
    END IF;

    -- Permitir leitura na tabela employees (Funcionários)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'employees') THEN
        ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Permitir Leitura employees" ON public.employees;
        CREATE POLICY "Permitir Leitura employees" ON public.employees FOR SELECT TO authenticated USING (true);
    END IF;

    -- Permitir leitura na tabela base profiles (caso user_profiles seja uma view dela)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Permitir Leitura profiles" ON public.profiles;
        CREATE POLICY "Permitir Leitura profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
    END IF;
END;
$$;

-- 3. Verificação Final: Confira se os dados abaixo aparecem na aba "Output"
SELECT 'VERIFICACAO_PERFIL' as check, email, company_id, role, status 
FROM public.user_profiles 
WHERE email = 'almox@almox.com.br';

SELECT 'CONTAGEM_FUNCIONARIOS' as check, count(*) as total 
FROM public.employees;
