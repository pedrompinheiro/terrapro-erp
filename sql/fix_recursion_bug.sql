-- CORREÇÃO DE ERRO: Infinite Recursion em user_profiles

-- 1. Criar uma função segura para verificar se é Admin
-- SECURITY DEFINER faz a função rodar com permissões de quem criou (superusuário),
-- ignorando o RLS e evitando o loop infinito/recursão.
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Remover TODAS as políticas problemáticas da tabela user_profiles
DROP POLICY IF EXISTS "Admins Read All User Profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins Manage User Profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public Profile Read" ON user_profiles; -- Caso exista

-- 3. Recriar Políticas da tabela user_profiles (agora seguras)

-- Política A: Usuário vê e edita seu próprio perfil
CREATE POLICY "Users Own Profile Access" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- Política B: Admins podem ver e editar TUDO (usando a função is_admin para não dar loop)
CREATE POLICY "Admins Manage All Profiles" ON user_profiles
    FOR ALL USING (is_admin());

-- 4. Atualizar também as políticas de user_permissions para usar a função segura (mais limpo)
DROP POLICY IF EXISTS "Admins Read All Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Insert Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Update Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Delete Permissions" ON user_permissions;

CREATE POLICY "Admins Manage Permissions" ON user_permissions
    FOR ALL USING (is_admin());

-- Mantém a política de leitura do próprio usuário em permissions
DROP POLICY IF EXISTS "User Read Own Permissions" ON user_permissions;
CREATE POLICY "User Read Own Permissions" ON user_permissions
    FOR SELECT USING (auth.uid() = user_id);
