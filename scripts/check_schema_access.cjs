
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
    console.error("❌ Faltando VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    console.log("🔍 Checking profiles table definition...");

    // Check tables via Supabase if possible (using RPC) or just select
    // Since we can't run full DDL easily, we'll try to select from information_schema via standard query if permitted
    // This usually works with Service Role unless restricted

    // We will use a hacky select from pg_catalog if we could, but let's try reading information_schema via .from()
    // Supabase exposes information_schema somewhat via API if policies allow

    const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables') // This might fail if not exposed
        .select('*')
        .limit(1);

    if (tableError) {
        console.log("⚠️ Cannot query information_schema directly via API:", tableError.message);

        // Fallback: Try selecting 1 row from 'user_profiles' and 'profiles' to infer
        console.log("Trying to read 'user_profiles'...");
        const { data: up, error: upError } = await supabase.from('user_profiles').select('*').limit(1);
        if (upError) console.log("❌ user_profiles error:", upError.message);
        else console.log("✅ user_profiles exists! Sample:", up ? up[0] : "Empty");

        console.log("Trying to read 'profiles'...");
        const { data: p, error: pError } = await supabase.from('profiles').select('*').limit(1);
        if (pError) console.log("❌ profiles error:", pError.message);
        else console.log("✅ profiles exists! Sample:", p ? p[0] : "Empty");

    } else {
        console.log("Tables:", tables);
    }
}

run();
