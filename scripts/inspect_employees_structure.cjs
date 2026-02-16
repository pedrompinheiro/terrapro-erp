
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

async function inspectEmployees() {
    console.log("🔍 Inspecionando tabela employees...");

    // Fetch a few rows to see structure and data
    const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .limit(5);

    if (error) {
        console.error("❌ Erro ao buscar employees:", error);
        return;
    }

    if (employees.length === 0) {
        console.log("⚠️ Tabela employees está vazia.");
        return;
    }

    console.log("📋 Exemplo de registro (chaves):", Object.keys(employees[0]));
    console.log("📋 Amostra de status/active:");
    employees.forEach(e => {
        console.log(`   - ${e.full_name}: status='${e.status}', active='${e.active}'`);
    });
}

inspectEmployees();
