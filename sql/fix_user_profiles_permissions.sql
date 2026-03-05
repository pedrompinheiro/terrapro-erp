-- =====================================================
-- FIX: Permissões da tabela user_profiles
-- Executar no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xpufmosdhhemcubzswcv/sql
-- =====================================================

-- 1. Conceder permissões para os roles do Supabase
GRANT ALL ON public.user_profiles TO postgres;
GRANT ALL ON public.user_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- 2. Verificar registros existentes
SELECT id, email, full_name, status, role FROM public.user_profiles;

-- 3. Aprovar a Fabiane (financeiro)
UPDATE public.user_profiles
SET status = 'APPROVED'
WHERE full_name ILIKE '%fabiane%'
   OR email = 'financeiro@transportadoraterra.com.br';

-- 4. Aprovar TODOS os usuários pendentes (se quiser)
-- UPDATE public.user_profiles SET status = 'APPROVED' WHERE status = 'PENDING';

-- 5. Confirmar resultado
SELECT id, email, full_name, status, role FROM public.user_profiles;
