
-- Libera permissões gerais na tabela entities para evitar erro de RLS
GRANT ALL ON public.entities TO anon, authenticated, service_role;

-- Remove políticas restritivas anteriores
DROP POLICY IF EXISTS "Entities accessible to authenticated" ON public.entities;
DROP POLICY IF EXISTS "Acesso Total Entidades" ON public.entities;

-- Cria uma política totalmente permissiva (Ideal para fase de desenvolvimento/migração)
CREATE POLICY "Acesso Total Entidades" 
ON public.entities 
FOR ALL 
USING (true) 
WITH CHECK (true);
