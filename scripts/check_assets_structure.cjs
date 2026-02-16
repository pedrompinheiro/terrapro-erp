
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
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStructure() {
    console.log('🔍 Verificando estrutura da tabela assets...');
    const { data, error } = await supabase
        .from('assets')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Erro ao ler assets:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('✅ Colunas encontradas em assets:', Object.keys(data[0]));
        console.log('📝 Exemplo de dados:', data[0]);
    } else {
        console.log('⚠️ Tabela assets vazia, mas existente.');
        // Tenta inserir dummy para ver colunas se a tabela estiver vazia, ou assume que precisa verificar de outra forma
    }
}

checkStructure();
