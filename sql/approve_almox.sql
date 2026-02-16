
-- Script to Approve User 'almox@almox.com.br'
-- Run this in the Supabase SQL Editor

-- 1. Update the status to APPROVED
UPDATE public.user_profiles
SET status = 'APPROVED'
WHERE email = 'almox@almox.com.br';

-- 2. Ensure the role is correct (MANAGER)
UPDATE public.user_profiles
SET role = 'MANAGER'
WHERE email = 'almox@almox.com.br';

-- 3. Verify the result
SELECT * FROM public.user_profiles WHERE email = 'almox@almox.com.br';
