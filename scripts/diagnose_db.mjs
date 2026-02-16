
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Ler .env.local manualmente
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
    console.warn("⚠️ Não foi possível ler .env.local: " + e.message);
}

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas no .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('🔍 [DIAGNÓSTICO] Conectando ao Banco...');

    // Tenta selecionar todas as colunas de 1 registro
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ ERRO SELECT *:', error);
        if (error.code === '42P01') console.error('🚨 TABELA "employees" NÃO EXISTE!');
    } else {
        console.log('✅ SELECT * OK.');
        if (data && data.length > 0) {
            console.log('📋 Colunas Detectadas (Registro #1):', Object.keys(data[0]));
            if (!Object.keys(data[0]).includes('cpf')) console.error('🚨 ALERTA: Coluna CPF não encontrada! O script não rodou.');
        } else {
            console.log('⚠️ Tabela vazia. Tentando INSERT de teste...');
        }
    }

    // Tenta inserir um registro com campos novos
    console.log('🛠 TESTE INSERT com campos novos...');
    const testEmployee = {
        name: 'Teste Diagnóstico ' + Date.now(),
        // Coluna Nova
        cpf: '11122233344',
        job_title: 'Tester',
        base_salary: 1000.00
    };

    const { data: insertData, error: insertError } = await supabase
        .from('employees')
        .insert(testEmployee)
        .select();

    if (insertError) {
        console.error('❌ FALHA INSERT:', insertError);
        if (insertError.message.includes('column')) {
            console.error('🚨 CONFIRMADO: Coluna faltando! O banco DESCONHECE as colunas novas.');
            console.error('👉 Rode o comando SQL "NOTIFY pgrst, \'reload schema\';" no Dashboard.');
        }
    } else {
        console.log('✅ INSERT OK! As colunas existem e funcionam.');

        // Limpar
        if (insertData && insertData[0]?.id) {
            await supabase.from('employees').delete().eq('id', insertData[0].id);
            console.log('🧹 Registro de teste removido.');
        }
    }
}

diagnose();
