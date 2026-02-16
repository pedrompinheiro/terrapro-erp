
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { AssetStatus } from '../types';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Caminho do CSV
const csvPath = path.resolve(__dirname, '../backups/Lista-Rastreáveis-10-02-2026-20-04.csv');

async function seedVehicles() {
    console.log('Lendo arquivo CSV...');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');

    // Pular cabeçalho
    const dataLines = lines.slice(1);

    console.log(`Encontrados ${dataLines.length} veículos para importar.`);

    // Obter Company ID (Assumindo a primeira empresa encontrada ou uma default)
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    if (!companies || companies.length === 0) {
        console.error('Nenhuma empresa encontrada no banco para vincular os ativos.');
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
        const tipo = cols[1]?.trim(); // Tipo
        const descricao = cols[2]?.trim(); // Descrição
        const marca = cols[3]?.trim(); // Marca
        const modelo = cols[4]?.trim(); // Modelo

        if (!placa) continue;

        // Normalizar Status (Assumindo Available inicialmente)
        const status = 'AVAILABLE';

        // Montar Objeto Asset
        // name = Descricao (ex: MN08 - MOTONIVELADORA...) - É mais amigável visualmente
        // code = Placa (IDENTIFICADOR REAL DE VINCULO) - Útil para busca e referência
        // MAS: O fleetService faz match com name OU code. 
        // Vamos usar: Name = Placa, Code = Descrição? Não.
        // Melhor: Name = Descrição (para ficar bonito no mapa), Code = Placa (para garantir match único).
        // O fleetService.ts atual faz match com: plate === assetName || plate === assetCode.
        // Então se Code for a Placa, vai funcionar!

        const assetPayload = {
            company_id: companyId,
            name: descricao || placa, // Ex: "MN08 - MOTONIVELADORA 140M"
            code: placa,              // Ex: "AAA-0001"
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

        // Upsert baseado no Code (Placa) se possível, mas assets não tem constraint unique no code por padrão.
        // Vamos tentar buscar primeiro pelo code.

        const { data: existing } = await supabase
            .from('assets')
            .select('id')
            .eq('code', placa)
            .single();

        if (existing) {
            // Update
            const { error } = await supabase
                .from('assets')
                .update(assetPayload)
                .eq('id', existing.id);

            if (error) {
                console.error(`Erro ao atualizar ${placa}:`, error.message);
                errorCount++;
            } else {
                console.log(`Atualizado: ${placa}`);
                successCount++;
            }
        } else {
            // Insert
            const { error } = await supabase
                .from('assets')
                .insert(assetPayload);

            if (error) {
                console.error(`Erro ao inserir ${placa}:`, error.message);
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
}

seedVehicles().catch(console.error);
