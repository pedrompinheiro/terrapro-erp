
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
let envConfig = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envConfig = envContent.split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key.trim()] = value.trim();
        return acc;
    }, {});
} catch (e) {
    console.error("⚠️ Erro ao ler .env.local:", e.message);
    process.exit(1);
}

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const serviceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function checkFleetEmployees() {
    console.log("🔍 Diagnóstico de Funcionários para Comboio...");

    const email = 'almox@almox.com.br';

    // 1. Get User ID
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        console.error("❌ Usuário almox não encontrado.");
        return;
    }
    console.log(`✅ Usuário encontrado: ${user.id}`);

    // 2. Get Profile & Company
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error("❌ Erro ao buscar perfil:", profileError);
        return;
    }

    console.log("👤 Perfil:", profile);

    if (!profile.company_id) {
        console.error("❌ O usuário NÃO tem company_id vinculado!");
        console.log("👉 Tentando encontrar uma empresa padrão para vincular...");

        const { data: companies } = await supabase.from('companies').select('*').limit(1);
        if (companies && companies.length > 0) {
            console.log(`ℹ️ Empresa encontrada: ${companies[0].name} (${companies[0].id})`);
            console.log("TODO: Vincular esta empresa ao usuário.");
        } else {
            console.error("❌ Nenhuma empresa encontrada no sistema.");
        }
        return;
    }

    // 3. Search Employees for this company
    const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, full_name, status, company_id')
        .eq('company_id', profile.company_id);

    if (empError) {
        console.error("❌ Erro ao buscar funcionários:", empError);
    } else {
        console.log(`📋 Funcionários encontrados para a empresa ${profile.company_id}: ${employees.length}`);
        employees.forEach(e => console.log(`   - ${e.full_name} (${e.status})`));

        const active = employees.filter(e => e.status === 'ACTIVE');
        console.log(`✅ Ativos: ${active.length}`);
    }
}

checkFleetEmployees();
