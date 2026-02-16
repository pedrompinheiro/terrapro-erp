
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

if (!supabaseUrl || !serviceKey) {
    console.error("❌ Faltando chaves no .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function diagnose() {
    console.log("🔍 Diagnóstico Detalhado...");

    // 1. Get User
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === 'almox@almox.com.br');

    if (!user) {
        console.log("❌ User almox not found");
        return;
    }
    console.log(`✅ User encontrado: ${user.id}`);

    // 2. Get Profile
    const { data: profile, error: pError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (pError) console.log("❌ Profile error:", pError);
    else console.log("👤 Profile:", profile);

    if (!profile?.company_id) {
        console.log("⚠️ User has no company_id! Fetching first company...");
        const { data: comps } = await supabase.from('companies').select('*').limit(1);

        if (comps && comps.length > 0) {
            const companyId = comps[0].id;
            console.log(`🏢 Linking to company: ${comps[0].name} (${companyId})`);

            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ company_id: companyId })
                .eq('id', user.id);

            if (updateError) console.log("❌ Update failed:", updateError);
            else console.log("✅ Company Linked Successfully!");

            // Re-fetch to confirm
            return;
        } else {
            console.log("❌ No companies found in DB!");
            return;
        }
    }

    const companyId = profile.company_id;

    // 3. List Employees for this company
    const { data: emps, error: eError } = await supabase
        .from('employees')
        .select('id, full_name, status, company_id')
        .eq('company_id', companyId);

    if (eError) console.log("❌ Employee fetch error:", eError);
    else {
        console.log(`📋 Total Employees for company ${companyId}: ${emps.length}`);
        const active = emps.filter(e => e.status === 'ACTIVE');
        console.log(`✅ Active Employees: ${active.length}`);
        if (emps.length > 0 && active.length === 0) {
            console.log("⚠️ Found employees but none are ACTIVE. Please check status column.");
            emps.slice(0, 5).forEach(e => console.log(`   - ${e.full_name}: ${e.status}`));
        }
    }
}

diagnose();
