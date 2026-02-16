
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- DADOS DO CSV (Copiados de selsynImporter.ts) ---
const csvVehicles = [
    { code: 'AAA-0001', type: 'Motoniveladora', name: 'MN08 - MOTONIVELADORA 140M', brand: 'CATERPILLAR', model: '140M' },
    { code: 'AAA-0040', type: 'Carregadeira', name: 'PC06 - PA CARREGADEIRA L60F (CAVEIRÃO)', brand: 'VOLVO', model: 'L60F' },
    // Adicione mais se necessário, mas vou focar no AAA-0040 para teste
    { code: 'AAA-0002', type: 'Escavadeira', name: 'ME04 - MINI ESC 302.7', brand: 'CATERPILLAR', model: '302.7' },
];

async function main() {
    console.log("🚀 Starting Backend Seed...");

    // Get Company ID (assume first company)
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    const companyId = companies?.[0]?.id;

    if (!companyId) {
        console.error("❌ No company found!");
        return;
    }
    console.log(`organization/company: ${companyId}`);

    for (const v of csvVehicles) {
        const { data: existing } = await supabase
            .from('assets')
            .select('id')
            .eq('code', v.code)
            .single();

        if (existing) {
            console.log(`Updating ${v.code}...`);
            await supabase.from('assets').update({
                name: v.name,
                model: v.model,
                brand: v.brand || 'GENERIC',
                telemetry: { deviceType: v.type }
            }).eq('id', existing.id);
        } else {
            console.log(`Creating ${v.code}...`);
            const { error } = await supabase.from('assets').insert({
                company_id: companyId,
                name: v.name,
                code: v.code,
                model: v.model,
                brand: v.brand || 'GENERIC',
                status: 'AVAILABLE',
                horometer_total: 0,
                odometer_total: 0,
                telemetry: { deviceType: v.type }
            });
            if (error) console.error(`ERRO ${v.code}:`, error);
        }
    }
    console.log("✅ Seed Completed!");
}

main();
