import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'terrapro_salt_2026');
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(input: string, stored: string): Promise<boolean> {
    const hashed = await hashPassword(input);
    return hashed === stored;
}

Deno.serve(async (req: Request) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Verificar autenticacao
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Nao autenticado');

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) throw new Error('Token invalido');

        const { action, password, newPassword } = await req.json();

        if (action === 'verify') {
            // Buscar hash armazenado
            const { data } = await supabaseAdmin
                .from('app_config')
                .select('valor')
                .eq('chave', 'admin_password_hash')
                .single();

            if (!data?.valor) {
                // Primeira vez: criar hash da senha padrao e salvar
                const defaultHash = await hashPassword('admin123');
                await supabaseAdmin.from('app_config').upsert({
                    chave: 'admin_password_hash',
                    valor: defaultHash,
                    descricao: 'Hash da senha mestra financeira'
                });

                // Tambem tentar verificar contra a senha em texto claro legada
                const { data: legacyData } = await supabaseAdmin
                    .from('app_config')
                    .select('valor')
                    .eq('chave', 'admin_password')
                    .single();

                if (legacyData?.valor && password === legacyData.valor) {
                    // Migrar: criar hash da senha legada
                    const legacyHash = await hashPassword(legacyData.valor);
                    await supabaseAdmin.from('app_config').upsert({
                        chave: 'admin_password_hash',
                        valor: legacyHash,
                        descricao: 'Hash da senha mestra financeira'
                    });
                    // Remover senha em texto claro
                    await supabaseAdmin.from('app_config').delete().eq('chave', 'admin_password');

                    return new Response(JSON.stringify({ valid: true }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }

                const isValid = await verifyPassword(password, defaultHash);
                return new Response(JSON.stringify({ valid: isValid }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            const isValid = await verifyPassword(password, data.valor);
            return new Response(JSON.stringify({ valid: isValid }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'change') {
            // Verificar senha atual primeiro
            const { data } = await supabaseAdmin
                .from('app_config')
                .select('valor')
                .eq('chave', 'admin_password_hash')
                .single();

            let currentHash: string;
            if (!data?.valor) {
                // Tentar migrar da senha legada
                const { data: legacyData } = await supabaseAdmin
                    .from('app_config')
                    .select('valor')
                    .eq('chave', 'admin_password')
                    .single();
                currentHash = legacyData?.valor
                    ? await hashPassword(legacyData.valor)
                    : await hashPassword('admin123');
            } else {
                currentHash = data.valor;
            }

            const isCurrentValid = await verifyPassword(password, currentHash);
            if (!isCurrentValid) {
                return new Response(JSON.stringify({ error: 'Senha atual incorreta' }), {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // Salvar nova senha hasheada
            const newHash = await hashPassword(newPassword);
            await supabaseAdmin.from('app_config').upsert({
                chave: 'admin_password_hash',
                valor: newHash,
                descricao: 'Hash da senha mestra financeira'
            });

            // Remover senha antiga em texto claro se existir
            await supabaseAdmin.from('app_config').delete().eq('chave', 'admin_password');

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Acao invalida');

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
