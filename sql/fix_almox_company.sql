
-- Fix Almox user missing company_id
-- We will link them to the first company found in the DB (usually 'TerraPro Demo')

WITH company AS (
  SELECT id FROM companies LIMIT 1
)
UPDATE public.user_profiles
SET company_id = (SELECT id FROM company),
    role = 'gestor',
    status = 'APPROVED'
WHERE email = 'almox@almox.com.br';

-- Verify
SELECT * FROM public.user_profiles WHERE email = 'almox@almox.com.br';
