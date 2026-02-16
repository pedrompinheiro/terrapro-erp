
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

async function addColumn() {
    console.log('🔄 Adicionando coluna active na tabela employees...');

    // Como não posso executar DDL (ALTER TABLE) diretamente via API Supabase JS Client padrão (só via Rpc ou extensão),
    // Vou usar uma função RPC se existir, ou tentar um workaround via API REST raw se tiver permissão.
    // Mas o mais seguro aqui, dado que o `postgres-js` ou driver direto não está configurado,
    // é instruir o usuário a rodar o SQL no dashboard OU tentar usar a API REST `rpc` se tivermos uma função `exec_sql`.

    // TENTATIVA 1: Executar via RPC 'exec_sql' ou similar se existir (muitos projetos têm)
    const { error: rpcError } = await supabase.rpc('exec_sql', {
        query: "ALTER TABLE employees ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;"
    });

    if (rpcError) {
        console.error('❌ Falha via RPC (provável que a função exec_sql não exista):', rpcError.message);
        console.log('⚠️ Tentando via API REST (pg_query)...');
        // Se falhar, infelizmente precisamos pedir pro usuário rodar no SQL Editor do Supabase Dashboard.
        console.log('\n🚨 AÇÃO NECESSÁRIA: Por favor, vá ao SQL Editor do Supabase e rode:');
        console.log("ALTER TABLE employees ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;\n");
    } else {
        console.log('✅ Coluna active adicionada com sucesso!');
    }
}

addColumn();
