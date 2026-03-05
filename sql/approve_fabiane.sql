-- Aprovar a usuária Fabiane
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/xpufmosdhhemcubzswcv/sql)

-- 1. Encontrar a Fabiane
SELECT id, email, full_name, status, role
FROM public.user_profiles
WHERE full_name ILIKE '%fabiane%' OR email ILIKE '%fabiane%';

-- 2. Aprovar (altere o WHERE se necessário)
UPDATE public.user_profiles
SET status = 'APPROVED'
WHERE full_name ILIKE '%fabiane%';

-- 3. Confirmar
SELECT id, email, full_name, status, role
FROM public.user_profiles
WHERE full_name ILIKE '%fabiane%';
