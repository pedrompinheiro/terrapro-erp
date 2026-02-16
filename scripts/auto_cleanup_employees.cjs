const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Usando ANON para simular o front, ou SERVICE_ROLE se tiver

if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runCleanup() {
    console.log('🧹 Iniciando Higienização de Funcionários Ativos/Inativos...');

    // 1. Definir Data de Corte (3 meses atrás)
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 2); // 3 meses (Atual, Anterior, Anterior-1)
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    console.log(`📅 Data de Corte: ${cutoffDateStr} (Quem não tem ponto desde esta data será inativado)`);

    // 2. Buscar todos os funcionários
    const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, full_name, active');

    if (empError) {
        console.error('Erro ao buscar funcionários:', empError);
        return;
    }

    console.log(`👥 Total de Funcionários Analisados: ${employees.length}`);

    let activeCount = 0;
    let inactiveCount = 0;
    let changedCount = 0;

    for (const emp of employees) {
        // 3. Checar se tem ponto recente
        const { data: points, error: pointError } = await supabase
            .from('time_entries')
            .select('id')
            .eq('employee_id', emp.id)
            .gte('date', cutoffDateStr)
            .limit(1);

        if (pointError) {
            console.error(`Erro ao checar pontos para ${emp.full_name}:`, pointError);
            continue;
        }

        const hasRecentActivity = points && points.length > 0;
        const shoudBeActive = hasRecentActivity; // Regra simples

        // Se o estado atual for diferente do calculado, atualiza
        // Nota: emp.active pode ser null (undefined), tratamos como true por padrão no front, mas aqui vamos ser explícitos
        const currentActiveStatus = emp.active !== false; // true ou null = true

        if (currentActiveStatus !== shoudBeActive) {
            console.log(`🔄 Atualizando: ${emp.full_name} -> ${shoudBeActive ? 'ATIVO' : 'INATIVO'} (Tem ponto recente? ${hasRecentActivity ? 'Sim' : 'Não'})`);

            const { error: updateError } = await supabase
                .from('employees')
                .update({ active: shoudBeActive })
                .eq('id', emp.id);

            if (updateError) {
                console.error(`Erro ao atualizar ${emp.full_name}:`, updateError);
            } else {
                changedCount++;
            }
        }

        if (shoudBeActive) activeCount++;
        else inactiveCount++;
    }

    console.log('\n📊 Resumo da Higienização:');
    console.log(`✅ Ativos Finais: ${activeCount}`);
    console.log(`🔴 Inativos Finais: ${inactiveCount}`);
    console.log(`📝 Registros Alterados Agora: ${changedCount}`);
    console.log('------------------------------------------------');
}

runCleanup();
