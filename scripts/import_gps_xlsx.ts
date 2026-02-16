
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

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

async function importGpsXlsx(filePath: string, forcedAssetCode?: string) {
    console.log(`📂 Lendo arquivo Excel: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error('❌ Arquivo não encontrado!');
        return;
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Pega a primeira aba
    const worksheet = workbook.Sheets[sheetName];

    // Converte para JSON bruto
    const rows: any[] = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

    console.log(`📊 Encontradas ${rows.length} linhas. Processando...`);

    // Buscar ativos para mapear ID
    const { data: assets } = await supabase.from('assets').select('id, code, name');
    const assetMap = new Map();
    assets?.forEach(a => {
        assetMap.set(a.code.toUpperCase().replace(/[\W_]+/g, ''), a.id);
        assetMap.set(a.name.toUpperCase().replace(/[\W_]+/g, ''), a.id);
    });

    let targetAssetId: string | null = null;

    if (forcedAssetCode) {
        const cleanCode = forcedAssetCode.toUpperCase().replace(/[\W_]+/g, '');
        targetAssetId = assetMap.get(cleanCode);
        if (!targetAssetId) {
            console.error(`❌ Ativo '${forcedAssetCode}' não encontrado no banco.`);
            return;
        }
        console.log(`🎯 Importando para o ativo: ${forcedAssetCode} (${targetAssetId})`);
    }

    let insertedCount = 0;
    let errorCount = 0;
    const BATCH_SIZE = 1000;
    let batch = [];

    for (const row of rows) {
        // Tenta identificar colunas (baseado no print do usuário)
        // Colunas: 'Data/Hora Evento', 'Latitude', 'Longitude', 'Velocidade (km/h)', 'Ignição'

        let plate = row['Placa'] || row['Identificador'] || row['Veículo'] || '';

        // Se não tem coluna placa, usa o forçado
        if (!plate && targetAssetId) {
            // OK, já temos o ID
        } else if (plate) {
            const cleanPlate = plate.toUpperCase().replace(/[\W_]+/g, '');
            targetAssetId = assetMap.get(cleanPlate);
        } else if (!targetAssetId) {
            // Sem placa na linha e sem ativo forçado -> Pular ou Erro
            // No print do usuário NÃO TEM coluna de placa visível.
            // Provavelmente o arquivo é específico de UM veículo.
            console.warn('⚠️ Linha sem identificação de veículo e nenhum veículo padrão definido. Use --asset=CODIGO');
            break;
        }

        if (!targetAssetId) continue;

        // Tratar Data
        // Excel pode vir como número serial OU string
        let dateVal = row['Data/Hora Evento'] || row['Data'] || row['DataHora'];
        let timestamp = null;

        if (typeof dateVal === 'number') {
            // Conversão de data Excel (dias desde 1900) para JS Date
            // (Excel Serial Date to JS Date)
            const excelEpoch = new Date(1899, 11, 30);
            const days = Math.floor(dateVal);
            const ms = Math.round((dateVal - days) * 86400000); // 24*60*60*1000
            const jsDate = new Date(excelEpoch.getTime() + days * 86400000 + ms);
            // Ajuste de fuso horário? Excel serial geralmente é local.
            // Vamos assumir UTC-3 ou UTC?
            // Vamos converter para ISO String
            timestamp = jsDate.toISOString();
        } else if (typeof dateVal === 'string') {
            // Formato DD/MM/YYYY HH:mm:ss
            if (dateVal.includes('/')) {
                const parts = dateVal.split(' ');
                const [d, m, y] = parts[0].split('/');
                const time = parts[1] || '00:00:00';
                timestamp = `${y}-${m}-${d}T${time}.000Z`; // Assumindo UTC para simplificar ou adicionar offset -03:00?
                // Se for horário local sem timezone, ISO assume Z (UTC).
                // Ajuste simples para -4h (AMT) ou -3h (BRT)?
                // Vou salvar como está (UTC) por enquanto.
            } else {
                timestamp = new Date(dateVal).toISOString();
            }
        }

        if (!timestamp) continue;

        // Tratar Numéricos (Lat/Long com vírgula)
        const parseNum = (val: any) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') return parseFloat(val.replace(',', '.'));
            return 0;
        };

        const lat = parseNum(row['Latitude']);
        const lng = parseNum(row['Longitude']);
        const speed = parseNum(row['Velocidade (km/h)'] || row['Velocidade']);

        // Tratar Ignição (VERDADEIRO/FALSO)
        let ignVal = row['Ignição'] || row['Ignition'] || 'FALSO';
        let ignition = false;
        if (typeof ignVal === 'boolean') ignition = ignVal;
        else {
            const s = String(ignVal).toUpperCase();
            ignition = s === 'VERDADEIRO' || s === 'TRUE' || s === 'ON' || s === 'LIGADA' || s === '1';
        }

        if (lat === 0 || lng === 0) continue;

        batch.push({
            asset_id: targetAssetId,
            timestamp: timestamp,
            latitude: lat,
            longitude: lng,
            speed: speed,
            ignition: ignition,
            meta: { source: 'xlsx_import', original_row: row }
        });

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

    if (batch.length > 0) {
        const { error } = await supabase.from('asset_positions').insert(batch);
        if (error) console.error('Erro no lote final:', error.message);
        else insertedCount += batch.length;
    }

    console.log(`\n✅ Importação concluída para ${forcedAssetCode || 'veículos detectados'}!`);
    console.log(`📥 Inseridos: ${insertedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
}

// Argumentos
const args = process.argv.slice(2);
// Ex: npx tsx scripts/import_gps_xlsx.ts arquivo.xlsx --asset=AAA-0001
const filePath = args.find(a => !a.startsWith('--'));
const assetArg = args.find(a => a.startsWith('--asset='));
const assetCode = assetArg ? assetArg.split('=')[1] : undefined;

if (filePath) {
    importGpsXlsx(filePath, assetCode);
} else {
    console.log('Uso: npx tsx scripts/import_gps_xlsx.ts <arquivo.xlsx> [--asset=CODIGO_ATIVO]');
}
