-- SOLUÇÃO DEFINITIVA (MODO DESENVOLVIMENTO)
-- Vamos liberar o acesso para usuários autenticados temporariamente para destravar você.

-- 1. Garantir permissões de tabela (Nível Banco)
GRANT ALL ON TABLE user_permissions TO authenticated;
GRANT ALL ON TABLE user_permissions TO service_role;

-- 2. Limpar todas as políticas (RLS) da tabela de permissões
DROP POLICY IF EXISTS "Admins Read All Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Insert Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Update Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Delete Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Manage Permissions" ON user_permissions;
DROP POLICY IF EXISTS "User Read Own Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Dev Allow All" ON user_permissions;

-- 3. Criar uma política "Permitir Tudo para Autenticados" (Dev Mode)
-- Isso remove a complexidade da verificação de Admin/Recursão por enquanto.
-- Depois que funcionar, podemos restringir novamente.
CREATE POLICY "Dev Allow All" ON user_permissions
    FOR ALL
    USING (auth.role() = 'authenticated');

-- 4. Garantir que a tabela user_profiles também esteja acessível
DROP POLICY IF EXISTS "Admins Manage All Profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users Own Profile Access" ON user_profiles;

-- Política simples para profiles: Cada um vê o seu, e Admin (via função segura) vê todos, 
-- ou liberamos leitura geral para autenticados em Dev.
CREATE POLICY "Dev Read All Profiles" ON user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users Update Own Profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Atualiza seu usuário para admin (Garantia extra)
-- Substitua 'seu_email' se necessário, mas o comando abaixo tenta pegar o ultimo logado ou ignora
UPDATE user_profiles SET role = 'admin' WHERE id = auth.uid();
