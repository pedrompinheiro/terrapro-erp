
-- Script to Approve User 'almox@almox.com.br' (Corrected for ENUM)
-- Run this in the Supabase SQL Editor

-- 1. Update the status to APPROVED
-- Note: 'admin' might be lowercase in the database enum definition based on the error "MANAGER" invalid
-- Let's try to set to 'admin' or 'gestor' based on types.ts

UPDATE public.user_profiles
SET status = 'APPROVED', role = 'gestor'
WHERE email = 'almox@almox.com.br';

-- 3. Verify the result
SELECT * FROM public.user_profiles WHERE email = 'almox@almox.com.br';
