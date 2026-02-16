-- 1. Promover seu usuário atual para ADMIN (Garante que você tenha a permissão necessária)
-- Isso atualiza seu perfil para 'admin' caso ainda não esteja.
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = auth.uid();

-- 2. Remover políticas antigas para evitar conflitos/duplicação
DROP POLICY IF EXISTS "Admins Read All Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Insert Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Update Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Delete Permissions" ON user_permissions;

DROP POLICY IF EXISTS "Admins Read All User Profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins Manage User Profiles" ON user_profiles;

-- 3. Criar Políticas de Segurança (RLS) para ADMINS na tabela user_permissions
-- PERMITIR LER TUDO
CREATE POLICY "Admins Read All Permissions" ON user_permissions
    FOR SELECT USING (
        EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' )
    );

-- PERMITIR INSERIR
CREATE POLICY "Admins Insert Permissions" ON user_permissions
    FOR INSERT WITH CHECK (
        EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' )
    );

-- PERMITIR ATUALIZAR
CREATE POLICY "Admins Update Permissions" ON user_permissions
    FOR UPDATE USING (
        EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' )
    );

-- PERMITIR DELETAR
CREATE POLICY "Admins Delete Permissions" ON user_permissions
    FOR DELETE USING (
        EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' )
    );

-- 4. Garantir que ADMINS possam gerenciar os perfis de usuários (user_profiles)
CREATE POLICY "Admins Manage User Profiles" ON user_profiles
    FOR ALL USING (
        EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' )
    );
