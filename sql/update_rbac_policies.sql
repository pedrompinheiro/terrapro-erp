-- ALERTA: Rodar manualmente no SQL Editor do Supabase se o MCP falhar

-- 1. Política para permitir ADMIN ler TODAS as Permissões
CREATE POLICY "Admins Read All Permissions" ON user_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- 2. Política para permitir ADMIN INSERIR Permissões
CREATE POLICY "Admins Insert Permissions" ON user_permissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- 3. Política para permitir ADMIN ATUALIZAR Permissões
CREATE POLICY "Admins Update Permissions" ON user_permissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- 4. Política para permitir ADMIN DELETAR Permissões
CREATE POLICY "Admins Delete Permissions" ON user_permissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Política para permitir que o ADMIN leia os PERFIS DE USUÁRIO (necessário para listar na tela Settings)
-- Pode já existir, mas reforçando:
CREATE POLICY "Admins Read All User Profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        ) OR auth.uid() = id -- Usuário vê a si mesmo
    );
