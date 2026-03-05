
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const selsynKey = process.env.VITE_SELSYN_API_KEY || '';

if (!supabaseUrl || !supabaseKey || !selsynKey) {
    console.error("Missing env vars (Supabase or Selsyn Key)");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper Normalize
const normalize = (s: string) => s ? s.replace(/[\s-]/g, '').toUpperCase() : '';

// Fetch Positions (Standalone)
async function fetchPositions() {
    // Documentação Selsyn: apikey como query parameter (não header)
    const url = `https://api.appselsyn.com.br/keek/rest/v1/integracao/posicao?apikey=${selsynKey}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data: any = await response.json();
        return Array.isArray(data) ? data : (data.list || []);
    } catch (e) {
        console.error("Erro API Selsyn:", e);
        return [];
    }
}

async function runDaemon() {
    console.log("🚀 Iniciando Coletor de Histórico GPS (Daemon)...");
    console.log("Pressione Ctrl+C para parar.");

    // Loop Infinito
    while (true) {
        const start = Date.now();
        console.log(`\n[${new Date().toLocaleTimeString()}] Buscando atualizações...`);

        try {
            // 1. Pega Dados da API
            const positions = await fetchPositions();
            console.log(`📡 API Selsyn: ${positions.length} posições recebidas.`);

            if (positions.length > 0) {
                // 2. Pega Assets do Banco para Match
                const { data: assets, error } = await supabase.from('assets').select('id, code, name');

                if (error) {
                    console.error("❌ Erro ao ler assets do banco:", error.message);
                } else if (!assets || assets.length === 0) {
                    console.warn("⚠️ Nenhum asset encontrado no banco para vincular.");
                } else {
                    let inserts = [];
                    let matched = 0;

                    for (const pos of positions) {
                        // Tenta Match
                        const pPlate = normalize(pos.identificador);
                        const pName = normalize(pos.rastreavel);

                        const asset = assets.find(a => {
                            const aCode = normalize(a.code);
                            const aName = normalize(a.name);
                            return pPlate === aCode || pPlate === aName || (pName && (pName === aCode || pName === aName));
                        });

                        if (asset) {
                            matched++;
                            inserts.push({
                                asset_id: asset.id,
                                latitude: pos.latitude,
                                longitude: pos.longitude,
                                speed: pos.velocidade || 0,
                                ignition: pos.ignicao || false,
                                timestamp: pos.dataHora || new Date().toISOString(),
                                // Removendo colunas que não existem (voltage, address)
                                // Tudo fica salvo no JSON 'meta' para consulta futura
                                meta: pos
                            });
                        }
                    }

                    console.log(`🧩 Vínculos encontrados: ${matched}/${positions.length}`);

                    if (inserts.length > 0) {
                        const { error: insertError } = await supabase.from('asset_positions').insert(inserts);
                        if (insertError) {
                            console.error("❌ Falha ao salvar histórico:", insertError.message);
                        } else {
                            console.log(`💾 Sucesso! ${inserts.length} registros de histórico salvos.`);
                        }
                    }
                }
            }

        } catch (err) {
            console.error("Erro no ciclo:", err);
        }

        // Wait 60 seconds
        const elapsed = Date.now() - start;
        const wait = Math.max(5000, 60000 - elapsed); // Garante min 5s, alvo 60s
        console.log(`💤 Aguardando ${Math.round(wait / 1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, wait));
    }
}

runDaemon();
