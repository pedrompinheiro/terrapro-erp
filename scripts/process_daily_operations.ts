
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Credenciais do Supabase não encontradas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function processDailyOperations(daysBack = 3) {
    console.log(`🚀 Iniciando processamento de diárias (retroativo ${daysBack} dias)...`);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysBack);

    // 1. Buscar todos os ativos
    const { data: assets, error: errAssets } = await supabase
        .from('assets')
        .select('id, name, code');

    if (errAssets) {
        console.error('Erro ao buscar ativos:', errAssets);
        return;
    }

    console.log(`📦 Processando ${assets.length} ativos...`);

    // Loop por cada dia no intervalo
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        console.log(`📅 Analisando data: ${dateStr}`);

        for (const asset of assets) {
            // 2. Buscar posições de GPS do dia para o ativo
            const { data: positions, error: errPos } = await supabase
                .from('asset_positions')
                .select('timestamp, ignition, latitude, longitude, speed')
                .eq('asset_id', asset.id)
                .gte('timestamp', `${dateStr}T00:00:00`)
                .lte('timestamp', `${dateStr}T23:59:59`)
                .order('timestamp', { ascending: true });

            if (errPos) {
                console.error(`Erro ao buscar posições para ${asset.code}:`, errPos);
                continue;
            }

            if (!positions || positions.length === 0) {
                // Sem dados de GPS -> Não faz nada (ou poderia marcar como 'NO_DATA' se quiséssemos)
                continue;
            }

            // 3. Processar métricas do dia
            let firstIgnitionTime: string | null = null;
            let lastIgnitionTime: string | null = null;
            let totalIgnitionMinutes = 0;
            let lastTime: Date | null = null;
            let wasIgnitionOn = false;

            // Algoritmo simples de cálculo de horas
            for (const pos of positions) {
                const currentTime = new Date(pos.timestamp);
                const isIgnitionOn = pos.ignition; // Assumindo booleano

                if (isIgnitionOn) {
                    if (!firstIgnitionTime) firstIgnitionTime = pos.timestamp;
                    lastIgnitionTime = pos.timestamp;
                }

                if (lastTime) {
                    const diffMs = currentTime.getTime() - lastTime.getTime();
                    // Se a diferença for muito grande (ex: perda de sinal > 1 hora), ignoramos ou interpolamos?
                    // Vamos ignorar gaps > 30 min para não inflar horas se o GPS desligou
                    const diffMinutes = diffMs / (1000 * 60);

                    if (diffMinutes < 60) {
                        if (wasIgnitionOn && isIgnitionOn) {
                            // Continuou ligado
                            totalIgnitionMinutes += diffMinutes;
                        } else if (!wasIgnitionOn && isIgnitionOn) {
                            // Ligou agora - não soma tempo anterior
                        } else if (wasIgnitionOn && !isIgnitionOn) {
                            // Desligou agora - soma o tempo até desligar
                            totalIgnitionMinutes += diffMinutes;
                        }
                    }
                }

                lastTime = currentTime;
                wasIgnitionOn = isIgnitionOn;
            }

            const totalHours = Number((totalIgnitionMinutes / 60).toFixed(2));

            // Localização aproximada (pega a primeira onde trabalhou ou a primeira do dia)
            const workPos = positions.find(p => p.ignition) || positions[0];
            const locationStr = workPos ? `${workPos.latitude.toFixed(4)}, ${workPos.longitude.toFixed(4)}` : 'Desconhecido';

            // Determinar Status
            let status = 'STANDBY';
            if (totalHours > 0.5) status = 'WORKED'; // Se trabalhou mais de 30 min

            // 4. Salvar na Tabela de Operações
            // Verifica se já existe apontamento MANUAL (que não queremos sobrescrever?)
            // Por enquanto, vamos sobrescrever ou criar se não existir.
            // Idealmente teríamos uma flag 'manual_override' na tabela.

            const payload = {
                asset_id: asset.id,
                operation_date: dateStr,
                status: status,
                work_site: `GPS: ${locationStr}`,
                start_time: firstIgnitionTime ? new Date(firstIgnitionTime).toTimeString().slice(0, 5) : null,
                end_time: lastIgnitionTime ? new Date(lastIgnitionTime).toTimeString().slice(0, 5) : null,
                total_hours: totalHours,
                updated_at: new Date().toISOString()
            };

            const { error: upsertErr } = await supabase
                .from('asset_daily_operations')
                .upsert(payload, { onConflict: 'asset_id, operation_date' }); // Precisa de constraint unique que removemos antes?

            // Ops, removemos a constraint unique no setup_operations_map.sql?
            // "Deixarei sem constraint unica para permitir quebras no dia."
            // Se não tem constraint unique, o UPSERT não funciona pelo 'onConflict'.
            // Precisamos checar se existe e fazer UPDATE, ou criar constraint.

            // Melhor estratégia agora: Buscar ID se existir e fazer UPDATE.

            const { data: existing } = await supabase
                .from('asset_daily_operations')
                .select('id')
                .eq('asset_id', asset.id)
                .eq('operation_date', dateStr)
                .limit(1)
                .single();

            if (existing) {
                await supabase
                    .from('asset_daily_operations')
                    .update(payload)
                    .eq('id', existing.id);
                console.log(`   🔄 Atualizado ${asset.code}: ${totalHours}h (${status})`);
            } else {
                await supabase
                    .from('asset_daily_operations')
                    .insert(payload);
                console.log(`   ✅ Criado ${asset.code}: ${totalHours}h (${status})`);
            }
        }
    }
    console.log('✅ Processamento concluído.');
}

processDailyOperations();
