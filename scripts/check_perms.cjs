
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
} catch (e) { console.error(e); }

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const serviceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function check() {
    console.log('Testando criação de registro na tabela employees (que sabemos que existe)...');

    // Tenta ler employees com service role (que funcionou antes no diagnose_db)
    const { data: emp, error: errEmp } = await supabase.from('employees').select('count').limit(1);

    if (errEmp) {
        console.error('❌ Erro ao ler employees:', errEmp);
    } else {
        console.log('✅ Leitura de employees OK. Service Role funciona para employees.');
    }

    console.log('\nTestando assets...');
    const { data: asset, error: errAsset } = await supabase.from('assets').select('*').limit(1);
    if (errAsset) {
        console.error('❌ Erro assets:', errAsset);
        // Tenta ver se a tabela existe de fato
        if (errAsset.code === '42P01') console.error('TABELA NAO EXISTE');
    } else {
        console.log('✅ Leitura de assets OK.');
    }
}

check();
