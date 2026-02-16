
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

        // 1. Listar Usuários
        if (action === 'listUsers') {
            const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
            if (error) throw error;

            // Mapeia para formato amigável
            const userList = users.users.map(u => ({
                id: u.id,
                email: u.email,
                name: u.user_metadata?.full_name || u.email?.split('@')[0],
                role: u.app_metadata?.role || u.user_metadata?.role || 'OPERATOR',
                lastLogin: u.last_sign_in_at,
                createdAt: u.created_at
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

        throw new Error('Ação inválida');

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
