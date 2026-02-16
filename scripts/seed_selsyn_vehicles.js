
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

console.log(`Carregando chave Service Role: ${supabaseKey.substring(0, 10)}...`);

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Caminho do CSV
const csvPath = path.resolve(__dirname, '../backups/Lista-Rastreáveis-10-02-2026-20-04.csv');

async function seedVehicles() {
    console.log('Lendo arquivo CSV...');
    try {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim() !== '');
        const dataLines = lines.slice(1); // Pular header

        console.log(`Encontrados ${dataLines.length} veículos para importar.`);

        // Obter Company ID
        const { data: companies, error: companyError } = await supabase.from('companies').select('id').limit(1);

        if (companyError || !companies || companies.length === 0) {
            console.error('Erro ao buscar empresa:', companyError);
            // Fallback: tentar criar empresa default se nao existir
            return;
        }
        const companyId = companies[0].id;
        console.log(`Vinculando à empresa ID: ${companyId}`);

        let successCount = 0;
        let errorCount = 0;

        for (const line of dataLines) {
            const cols = line.split(';');
            if (cols.length < 5) continue;

            const placa = cols[0]?.trim(); // Identificador
            const tipo = cols[1]?.trim();
            const descricao = cols[2]?.trim();
            const marca = cols[3]?.trim();
            const modelo = cols[4]?.trim();

            if (!placa) continue;

            const status = 'AVAILABLE';

            const assetPayload = {
                company_id: companyId,
                name: descricao || placa,
                code: placa,
                model: modelo || tipo,
                brand: marca || 'GENERIC',
                status: status,
                horometer_total: 0,
                odometer_total: 0,
                telemetry: {
                    deviceType: tipo,
                    originalCsvData: { tipo, descricao, marca, modelo }
                }
            };

            // Upsert logic
            const { data: existing } = await supabase
                .from('assets')
                .select('id')
                .eq('code', placa)
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('assets')
                    .update(assetPayload)
                    .eq('id', existing.id);

                if (error) {
                    console.error(`Erro update ${placa}:`, error.message);
                    errorCount++;
                } else {
                    console.log(`Atualizado: ${placa}`);
                    successCount++;
                }
            } else {
                const { error } = await supabase
                    .from('assets')
                    .insert(assetPayload);

                if (error) {
                    console.error(`Erro insert ${placa}:`, error.message);
                    errorCount++;
                } else {
                    console.log(`Inserido: ${placa}`);
                    successCount++;
                }
            }
        }

        console.log(`\nImportação Finalizada!`);
        console.log(`Sucessos: ${successCount}`);
        console.log(`Erros: ${errorCount}`);

    } catch (err) {
        console.error("Erro fatal:", err);
    }
}

seedVehicles();
