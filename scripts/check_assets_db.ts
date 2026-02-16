

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

async function main() {
    console.log("Checking DB Assets...");
    const { data: assets, error } = await supabase.from('assets').select('id, name, code, model').limit(10);
    if (error) {
        console.error(error);
        return;
    }
    console.log(`✅ Found ${assets.length} Assets.`);
    if (assets.length > 0) {
        console.table(assets);
        console.log("Sample Asset Name:", assets[0].name);
        console.log("Sample Asset Code:", assets[0].code);
    } else {
        console.warn("⚠️ No assets found! Import script needed.");
    }
}

main();
