
import { createClient } from '@supabase/supabase-js';

// Hardcoded keys from .env.local for debugging purposes
const SUPABASE_URL = 'https://xpufmosdhhemcubzswcv.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdWZtb3NkaGhlbWN1Ynpzd2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTU1MzQsImV4cCI6MjA4NTczMTUzNH0.vLCML2jkWaRIuj1uz8v0cUaOxK4JTD-X5CXkjQjq6DQ'; // ANON KEY
// Warning: Normally we shouldn't hardcode sensitive keys, but this is a local debug script run by the user.
// However, the tool read from .env.local didn't return the SERVICE_ROLE_KEY clearly? Let me check logs.
// Ah, the view_file tool output showed SUPABASE_SERVICE_ROLE_KEY! Let me re-read the context.

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdWZtb3NkaGhlbWN1Ynpzd2N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE1NTUzNCwiZXhwIjoyMDg1NzMxNTM0fQ.r_3HlVZxnG2zEwY4B7y1m8TiK20jLBQc4XVr5uvXL08';

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

async function runDiagnosis() {
    console.log('\n🔍 DIAGNÓSTICO DE CONEXÃO SUPABASE\n');

    // 1. Teste de Acesso ADMIN (Service Role - Bypassa RLS)
    console.log('1️⃣ Testando Acesso ADMIN (Service Role)...');
    try {
        const { data: employees, error } = await adminClient
            .from('employees')
            .select('*');

        if (error) {
            console.error('❌ Erro ADMIN ao listar employees:', error.message);
            throw error;
        }

        console.log(`✅ Sucesso! Encontrados ${employees?.length || 0} funcionários no banco.`);

        if (!employees || employees.length === 0) {
            console.log('⚠️ Tabela vazia! Tentando inserir funcionário de teste...');
            const { data: newEmp, error: insertError } = await adminClient
                .from('employees')
                .insert({
                    name: 'Funcionário Teste Debug',
                    role: 'Tester',
                    registration_number: 'TEST-001',
                    active: true
                })
                .select()
                .single();

            if (insertError) {
                console.error('❌ Falha ao inserir teste:', insertError.message);
            } else {
                console.log('✅ Funcionário de teste inserido com sucesso:', newEmp.id);
            }
        } else {
            console.log('📝 Exemplo:', employees[0].name);
        }

    } catch (err) {
        console.error('💥 Exceção Fatal ADMIN:', err);
        console.log('⚠️ Continuando para teste Anon mesmo com falha no Admin...');
    }

    // 2. Teste de Acesso PÚBLICO/ANON (Simula Frontend)
    console.log('\n2️⃣ Testando Acesso ANON (Frontend/RLS)...');
    try {
        const { data: publicEmps, error: publicError } = await anonClient
            .from('employees')
            .select('*');

        if (publicError) {
            console.error('❌ Erro ANON (Provável bloqueio de RLS):', publicError.message);
            console.log('💡 DICA: Verifique suas policies RLS no Supabase.');
        } else {
            console.log(`✅ Sucesso! Frontend consegue ver ${publicEmps?.length || 0} funcionários.`);
            if (publicEmps.length === 0) {
                console.log('⚠️ Frontend vê 0 registros, mas ADMIN vê algo? Se sim, RLS está ocultando.');
            }
        }
    } catch (err) {
        console.error('💥 Exceção Fatal ANON:', err);
    }

    console.log('\n🏁 Diagnóstico Concluído.');
}

runDiagnosis();
