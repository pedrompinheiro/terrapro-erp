
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Cliente com permissões totais (Service Role)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req: Request) => {
    // CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { action, payload } = await req.json();

        // 1. Listar Usuários (com status do user_profiles)
        if (action === 'listUsers') {
            const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
            if (error) throw error;

            // Buscar status de todos os user_profiles
            const { data: profiles } = await supabaseAdmin
                .from('user_profiles')
                .select('id, status, full_name, company_id');

            const profileMap: Record<string, any> = {};
            if (profiles) {
                profiles.forEach((p: any) => { profileMap[p.id] = p; });
            }

            // Mapeia para formato amigável
            const userList = users.users.map(u => ({
                id: u.id,
                email: u.email,
                name: u.user_metadata?.full_name || profileMap[u.id]?.full_name || u.email?.split('@')[0],
                role: u.app_metadata?.role || u.user_metadata?.role || 'OPERATOR',
                lastLogin: u.last_sign_in_at,
                createdAt: u.created_at,
                profileStatus: profileMap[u.id]?.status || null,
                companyId: profileMap[u.id]?.company_id || null,
            }));

            return new Response(JSON.stringify(userList), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 2. Criar Usuário
        if (action === 'createUser') {
            const { email, password, fullName, role } = payload;

            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true, // Já confirma o email (para dev/demos)
                user_metadata: { full_name: fullName, role },
                app_metadata: { role } // Define role no app_metadata também
            });

            if (error) throw error;

            return new Response(JSON.stringify({ success: true, user: data.user }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 3. Atualizar Usuário
        if (action === 'updateUser') {
            const { id, password, fullName, role } = payload;

            const attrs: any = {
                user_metadata: { full_name: fullName, role },
                app_metadata: { role }
            };
            if (password) attrs.password = password;

            const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, attrs);

            if (error) throw error;
            return new Response(JSON.stringify({ success: true, user: data.user }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 4. Deletar Usuário
        if (action === 'deleteUser') {
            const { userId } = payload;
            const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
            if (error) throw error;
            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 5. Aprovar / Bloquear Usuário (atualiza user_profiles.status)
        if (action === 'setUserStatus') {
            const { userId, status } = payload; // status: 'APPROVED' | 'BLOCKED' | 'PENDING'

            const validStatuses = ['APPROVED', 'BLOCKED', 'PENDING', 'REJECTED'];
            if (!validStatuses.includes(status)) {
                throw new Error(`Status inválido: ${status}. Use: ${validStatuses.join(', ')}`);
            }

            const { error } = await supabaseAdmin
                .from('user_profiles')
                .update({ status })
                .eq('id', userId);

            if (error) throw error;

            return new Response(JSON.stringify({ success: true, userId, status }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Ação inválida');

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
