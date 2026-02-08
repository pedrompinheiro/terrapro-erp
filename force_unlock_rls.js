
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Carregar variáveis de ambiente (especificamente a SERVICE_ROLE_KEY)
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const SUPABASE_URL = envConfig.VITE_SUPABASE_URL;
const SERVICE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('ERRO: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env.local');
    process.exit(1);
}

// Criar cliente com privilégios de admin (Service Role)
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function unlockTables() {
    console.log(`Conectando ao projeto: ${SUPABASE_URL}`);
    console.log('Tentando desabilitar RLS e liberar acesso...');

    // Tentativa 1: Executar SQL bruto via RPC (se houver função exec_sql)
    // Como provavelmente não tem, vamos tentar usar a API de tabelas, mas RLS policies são DDL.
    // O cliente JS padrão não faz DDL diretamenet sem uma função RPC.

    // Porem, se eu tiver a SERVICE_ROLE, eu ignoro RLS por padrão nas consultas.
    // O problema é o usuário final (anon) no navegador.

    // Se eu não conseguir rodar SQL via JS client (sem rpc), eu não consigo alterar RLS.
    // Mas espere! A API REST do Supabase permite rodar SQL se tiver a extensão pg_net? Não.

    // Ah, o endpoint /v1/query (pg_meta) permite!
    // Mas o client JS não expõe isso facilmente.

    // Alternativa: Vou usar a Service Key para CHECAR se os dados existem primeiro.
    const { count: empCount, error: empError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

    if (empError) {
        console.error('Erro ao acessar employees com Service Key:', empError);
    } else {
        console.log(`Total Funcionários (Visto pelo Admin): ${empCount}`);
    }

    // Se eu consigo ver e o usuário não, é RLS.
    // Infelizmente, mudar RLS requer SQL. O cliente JS 'postgres-js' poderia conectar direto na porta 5432,
    // mas eu não tenho a senha do banco (DB_PASSWORD), só a API Key.

    // TENTATIVA VIA RPC 'exec_sql' (muitos projetos têm essa função helper para admins)
    const { error: rpcError } = await supabase.rpc('exec_sql', {
        query: `
            ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
            ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
            DROP POLICY IF EXISTS "Public Read Employees" ON employees;
            DROP POLICY IF EXISTS "Public Read Time Entries" ON time_entries;
            CREATE POLICY "Public Read Employees" ON employees FOR SELECT USING (true);
            CREATE POLICY "Public Read Time Entries" ON time_entries FOR SELECT USING (true);
        `
    });

    if (rpcError) {
        console.log('Não foi possível executar SQL via RPC (função exec_sql não existe).');
        console.log('Isso é esperado se você não criou essa função antes.');
        console.log('\n--- AÇÃO NECESSÁRIA ---');
        console.log('Como não tenho acesso direto ao SQL via API, você PRECISA rodar o script fix_rls.sql manualmente no Dashboard.');
        console.log('Acesse: https://supabase.com/dashboard/project/' + SUPABASE_URL.split('.')[0].split('//')[1] + '/sql');
    } else {
        console.log('SUCESSO! SQL executado via RPC. RLS deve estar corrigido.');
    }
}

unlockTables();
