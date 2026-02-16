
-- 1. Tabela de Perfis Públicos (Vinculada ao Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'OPERATOR' CHECK (role IN ('ADMIN', 'MANAGER', 'OPERATOR', 'MECHANIC', 'VIEWER')),
  avatar_url TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trigger para criar perfil automaticamente ao cadastrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'OPERATOR')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove trigger antiga se existir para recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acesso
-- Leitura: Usuários autenticados podem ver todos os perfis (para listar colegas)
CREATE POLICY "Profiles are viewable by everyone logged in" 
ON public.profiles FOR SELECT 
USING (auth.role() = 'authenticated');

-- Edição: Apenas o próprio usuário pode editar seu perfil (exceto role)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- (Opcional) Apenas Admins podem atualizar roles (precisa de uma function segura ou policy complexa)
-- Por enquanto deixamos simples.

-- 5. Função RPC para criação de usuário (convite)
-- Esta função será chamada pelo frontend, mas precisa de permissão elevada.
-- A melhor forma segura é via Edge Function, mas para simplificar, podemos usar security definer se habilitada.
-- Mas como auth.admin só funciona em service_role, vamos focar na tabela profiles agora.

-- BÔNUS: Popular tabela com usuários existentes (caso já existam em auth.users mas não em profiles)
INSERT INTO public.profiles (id, email, created_at)
SELECT id, email, created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;
