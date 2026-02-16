
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

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

async function importGpsHistory(filePath: string) {
    console.log(`📂 Lendo arquivo: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error('❌ Arquivo não encontrado!');
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse CSV
    Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const rows = results.data;
            console.log(`📊 Encontradas ${rows.length} linhas. Processando...`);

            // Buscar ativos para mapear ID
            const { data: assets } = await supabase.from('assets').select('id, code, name');
            const assetMap = new Map();
            assets?.forEach(a => {
                assetMap.set(a.code.toUpperCase().replace(/[\W_]+/g, ''), a.id);
                assetMap.set(a.name.toUpperCase().replace(/[\W_]+/g, ''), a.id);
            });

            let insertedCount = 0;
            let errorCount = 0;
            const BATCH_SIZE = 1000;
            let batch = [];

            for (const row of rows as any[]) {
                // Tenta identificar colunas comuns
                const plate = row['Placa'] || row['Identificador'] || row['Asset'] || row['Veículo'] || '';
                const dateStr = row['Data'] || row['DataHora'] || row['Timestamp'] || '';
                const lat = parseFloat(row['Latitude'] || row['Lat'] || '0');
                const lng = parseFloat(row['Longitude'] || row['Lng'] || row['Long'] || '0');
                const speed = parseFloat(row['Velocidade'] || row['Speed'] || '0');
                const ignition = (row['Ignição'] || row['Ignition'] || 'OFF').toString().toUpperCase().includes('ON') ||
                    (row['Ignição'] || row['Ignition'] || '0') == '1' ||
                    (row['Ignição'] || row['Ignition'] || '').toString().toUpperCase() === 'LIGADA';

                if (!plate || !dateStr || lat === 0 || lng === 0) {
                    continue;
                }

                // Normaliza Placa
                const cleanPlate = plate.toUpperCase().replace(/[\W_]+/g, '');
                const assetId = assetMap.get(cleanPlate);

                if (assetId) {
                    // Tenta converter data (DD/MM/YYYY HH:mm ou ISO)
                    let isoDate = null;
                    if (dateStr.includes('/')) {
                        // Assume DD/MM/YYYY HH:mm
                        const [datePart, timePart] = dateStr.split(' ');
                        const [day, month, year] = datePart.split('/');
                        isoDate = `${year}-${month}-${day}T${timePart || '00:00:00'}`;
                    } else {
                        isoDate = new Date(dateStr).toISOString();
                    }

                    if (isoDate) {
                        batch.push({
                            asset_id: assetId,
                            timestamp: isoDate,
                            latitude: lat,
                            longitude: lng,
                            speed: speed,
                            ignition: ignition,
                            meta: { source: 'csv_import', original: row }
                        });
                    }
                }

                if (batch.length >= BATCH_SIZE) {
                    const { error } = await supabase.from('asset_positions').insert(batch);
                    if (error) {
                        console.error('Erro no lote:', error.message);
                        errorCount += batch.length;
                    } else {
                        insertedCount += batch.length;
                        process.stdout.write('.');
                    }
                    batch = [];
                }
            }

            // Último lote
            if (batch.length > 0) {
                const { error } = await supabase.from('asset_positions').insert(batch);
                if (error) console.error('Erro no lote final:', error.message);
                else insertedCount += batch.length;
            }

            console.log(`\n✅ Importação concluída!`);
            console.log(`📥 Inseridos: ${insertedCount}`);
            console.log(`❌ Erros: ${errorCount}`);
        }
    });
}

// Pega o arquivo do argumento (ex: npx tsx scripts/import_gps_csv.ts dados.csv)
const args = process.argv.slice(2);
if (args.length > 0) {
    importGpsHistory(args[0]);
} else {
    console.log('Uso: npx tsx scripts/import_gps_csv.ts <caminho_do_arquivo.csv>');
}
