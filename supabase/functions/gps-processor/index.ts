
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const SELSYN_API_KEY = Deno.env.get('VITE_SELSYN_API_KEY') || Deno.env.get('SELSYN_API_KEY') || '';

// Setup Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper Normalize
const normalize = (s: string) => s ? s.replace(/[\s-]/g, '').toUpperCase() : '';

Deno.serve(async (req: Request) => {
    try {
        // 1. Fetch Latest GPS Data from Selsyn (USING VALIDATED ENDPOINT)
        console.log('Fetching GPS Data...');
        const url = `https://api.appselsyn.com.br/keek/rest/v1/integracao/operador/posicao`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': SELSYN_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Selsyn API Error: ${response.status} ${response.statusText}`);
        }

        const rawData = await response.json();
        // A API de Operador pode retornar Array direto ou { list: [] }
        const positions = Array.isArray(rawData) ? rawData : (rawData.list || []);
        console.log(`📡 API Selsyn: ${positions.length} posições recebidas.`);

        if (positions.length === 0) {
            return new Response(JSON.stringify({ message: 'No positions found' }), { headers: { 'Content-Type': 'application/json' } });
        }

        // 2. Map Selsyn Data to Local DB Structure
        // Get all assets to map External ID -> Internal UUID
        const { data: assets, error: assetError } = await supabase.from('assets').select('id, code, name');
        if (assetError) throw assetError;

        const timestamp = new Date().toISOString();
        const batch = [];
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
                batch.push({
                    asset_id: asset.id,
                    latitude: pos.latitude,
                    longitude: pos.longitude,
                    speed: pos.velocidade || 0,
                    ignition: pos.ignicao || false,
                    timestamp: pos.dataHora || timestamp,
                    // Sem colunas extras como voltage/address
                    meta: pos
                });
            }
        }

        console.log(`🧩 Vínculos encontrados: ${matched}/${positions.length}`);

        // 3. Insert into Database
        if (batch.length > 0) {
            const { error: insertError } = await supabase.from('asset_positions').insert(batch);
            if (insertError) throw insertError;
            console.log(`Saved ${batch.length} positions to DB.`);
        }

        // 4. Trigger Operations Recalculation for Today
        // Define "Today" in Brazil Time (UTC-3)
        // Como o Cloud roda em UTC, precisamos garantir que 'today' seja a data de hoje no Brasil
        // Pega data atual - 3 horas
        const nowBRT = new Date(new Date().getTime() - 3 * 3600 * 1000);
        const today = nowBRT.toISOString().split('T')[0];

        console.log(`Triggering recalculation for date: ${today}`);
        const { error: rpcError } = await supabase.rpc('recalculate_operations', {
            start_date: today,
            end_date: today
        });

        if (rpcError) throw rpcError;

        return new Response(
            JSON.stringify({
                success: true,
                processed: batch.length,
                recalculated: true,
                date: today
            }),
            { headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
