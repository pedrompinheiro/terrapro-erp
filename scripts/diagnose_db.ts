
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
// Carrega env se possível, mas vou usar hardcoded para teste rápido se não achar
// O usuário tem .env.local? Sim.
// Mas ts-node precisa de config. Vou tentar ler o arquivo .env.local manualmente.

const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = envContent.split('\n').reduce((acc: any, line: string) => {
    const [key, value] = line.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
}, {});

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Credenciais não encontradas no .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('🔍 Diagnosticando tabela employees...');

    // Tenta selecionar todas as colunas de 1 registro
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Erro ao selecionar:', error);
    } else {
        console.log('✅ Sucesso ao selecionar *.');
        if (data && data.length > 0) {
            console.log('📋 Colunas encontradas no primeiro registro:', Object.keys(data[0]));
        } else {
            console.log('⚠️ Tabela vazia, não consigo listar colunas dinamicamente pelo select *. Tente inserir um dummy.');
        }
    }

    // Tenta inserir um registro com campos novos para ver se falha
    console.log('🛠 Tentando inserir registro de teste com novos campos...');
    const testEmployee = {
        name: 'Teste Diagnóstico ' + Date.now(),
        cpf: '00011122233', // Campo novo
        job_title: 'Tester', // Campo novo
        base_salary: 1000.00 // Campo novo
    };

    const { data: insertData, error: insertError } = await supabase
        .from('employees')
        .insert(testEmployee)
        .select();

    if (insertError) {
        console.error('❌ Erro ao inserir:', insertError);
        if (insertError.message.includes('column')) {
            console.error('🚨 CONFIRMADO: Coluna faltando!');
        }
    } else {
        console.log('✅ Inserção bem sucedida! As colunas existem.');
        // Limpar
        if (insertData && insertData[0]?.id) {
            await supabase.from('employees').delete().eq('id', insertData[0].id);
            console.log('🧹 Registro de teste limpo.');
        }
    }
}

diagnose();
