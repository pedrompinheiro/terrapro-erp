
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Carregar .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let envConfig = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            envConfig[match[1].trim()] = match[2].trim();
        }
    }
} catch (e) {
    console.error("⚠️ Erro ao ler .env.local:", e.message);
    process.exit(1);
}

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const serviceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error("❌ Faltando VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function diagnoseUser() {
    const email = 'almox@almox.com.br';
    console.log(`🔍 Diagnosticando usuário: ${email}`);

    // 1. Buscar em auth.users (usando listUsers ou RPC se necessário, mas admin.listUsers é melhor)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error("❌ Erro ao listar usuários do Auth:", listError);
        return;
    }

    const authUser = users.find(u => u.email === email);

    if (!authUser) {
        console.error("❌ Usuário NÃO ENCONTRADO em auth.users.");
        console.log("👉 Solução Provável: O usuário precisa ser convidado ou criado no painel do Supabase > Authentication > Users.");
        return;
    }

    console.log(`✅ Usuário encontrado em auth.users (ID: ${authUser.id})`);
    console.log(`   - Email Confirmado? ${authUser.email_confirmed_at ? 'Sim' : 'NÃO'}`);
    console.log(`   - Último Login: ${authUser.last_sign_in_at || 'Nunca'}`);
    console.log(`   - Metadados:`, authUser.user_metadata);

    // 2. Buscar em user_profiles
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

    if (profileError && profileError.code === 'PGRST116') {
        console.error("❌ Usuário NÃO encontrado na tabela public.profiles.");
        console.log("👉 Solução Provável: O trigger de criação de perfil falhou ou o usuário foi criado antes da tabela existir.");
        console.log("   Rode o comando: INSERT INTO public.profiles (id, email) VALUES ('" + authUser.id + "', '" + email + "');");
    } else if (profileError) {
        console.error("❌ Erro ao consultar profiles:", profileError);
    } else {
        console.log(`✅ Usuário encontrado em public.profiles`);
        console.log(`   - Role: ${profile.role}`);
        console.log(`   - Nome: ${profile.full_name}`);

        if (profile.role !== 'MANAGER' && profile.role !== 'ADMIN') {
            console.log("⚠️ AVISO: Role é '" + profile.role + "'. Se ele precisa de acesso total, talvez precise ser MANAGER ou ADMIN.");
        }
    }
}

diagnoseUser();
