
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
const anonKey = envConfig.VITE_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Tem Service Key?', !!serviceKey);
console.log('Tem Anon Key?', !!anonKey);

async function testConnection(keyType, key) {
    console.log(`\nTestando com ${keyType}...`);
    if (!key) {
        console.log(`❌ Chave ${keyType} não encontrada.`);
        return;
    }
    const supabase = createClient(supabaseUrl, key);
    const { data, error } = await supabase.from('assets').select('*').limit(1);

    if (error) {
        console.error(`❌ Erro (${keyType}):`, error.message);
    } else {
        console.log(`✅ Sucesso (${keyType})! Registros encontrados: ${data.length}`);
    }
}

async function run() {
    await testConnection('SERVICE_ROLE', serviceKey);
    await testConnection('ANON', anonKey);
}

run();
