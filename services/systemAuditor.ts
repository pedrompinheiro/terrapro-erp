
import { supabase } from '../lib/supabase';
import { logger } from './logger';
import { fleetManagementService } from './fleetService';
import { fetchFleetPositions } from './selsyn';

export const runSystemDiagnostics = async () => {
    const timestamp = new Date().toISOString();
    const TEST_CODE = `SYS-CHECK-${Math.floor(Math.random() * 1000)}`;
    let successCount = 0;
    let failCount = 0;

    await logger.info('SystemAuditor', `🚀 Iniciando Diagnóstico do Sistema... Código: ${TEST_CODE}`);

    // --- 1. TESTE DE FROTA (FLEET) ---
    try {
        await logger.info('SystemAuditor', '🧪 Testando Módulo de Frota (CRUD)...');

        // CREATE
        const newAsset = {
            name: `Veículo Teste Auditor`,
            code: TEST_CODE,
            model: 'TestModel',
            brand: 'TestBrand',
            status: 'AVAILABLE',
            horometer_total: 0,
            odometer_total: 0
        };

        // Nota: createAsset pega company_id do user logado
        // Precisamos garantir que não falhe se o perfil não existir (o método createAsset lança erro hoje)
        // Se falhar, é um erro legítimo de teste
        const created = await fleetManagementService.createAsset(newAsset as any); // Cast any para partial
        if (created && created.id) {
            await logger.success('SystemAuditor', `✅ Frota: Criação OK. ID: ${created.id}`);
        } else {
            throw new Error("Falha na criação: ID nulo");
        }

        // UPDATE
        const updated = await fleetManagementService.updateAsset({
            ...created,
            model: 'Model Updated'
        });
        if (updated.model === 'Model Updated') {
            await logger.success('SystemAuditor', `✅ Frota: Edição OK.`);
        } else {
            throw new Error("Falha na edição: Modelo não atualizou");
        }

        // DELETE
        await fleetManagementService.deleteAsset(created.id);

        // VERIFY DELETION (Double Check)
        const check = await supabase.from('assets').select('id').eq('id', created.id);
        if (check.data && check.data.length === 0) {
            await logger.success('SystemAuditor', `✅ Frota: Exclusão OK.`);
            successCount++;
        } else {
            throw new Error("Falha na exclusão: Item ainda existe no banco");
        }

    } catch (e: any) {
        failCount++;
        await logger.error('SystemAuditor', `❌ FALHA NO MÓDULO FROTA: ${e.message}`, e);
    }

    // --- 2. TESTE DE RH (EMPLOYEES) ---
    try {
        await logger.info('SystemAuditor', '🧪 Testando Módulo RH (Banco de Dados)...');

        // Como não temos um hrService exportado, vamos testar o acesso direto ao Supabase
        // Isso valida se o usuário tem permissões na tabela

        // GET COMPANY ID (Necessário para INSERT)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não logado");

        const { data: profile } = await supabase.from('user_profiles').select('company_id').eq('id', user.id).maybeSingle();
        let companyId = profile?.company_id;

        if (!companyId) {
            // Tenta pegar primeira empresa (Fallback igual ao importer)
            const { data: c } = await supabase.from('companies').select('id').limit(1);
            if (c && c.length) companyId = c[0].id;
            else throw new Error("Sem company_id para teste de RH");
        }

        // CREATE
        const empCode = `EMP-${Math.floor(Math.random() * 9999)}`;
        const { data: emp, error: createErr } = await supabase.from('employees').insert({
            company_id: companyId,
            full_name: `Agente Auditor Teste`,
            registration_number: empCode,
            active: true
        }).select().single();

        if (createErr) throw createErr;
        await logger.success('SystemAuditor', `✅ RH: Criação OK. ID: ${emp.id}`);

        // UPDATE
        const { error: updateErr } = await supabase.from('employees').update({
            job_title: 'Auditor Senior'
        }).eq('id', emp.id);

        if (updateErr) throw updateErr;
        await logger.success('SystemAuditor', `✅ RH: Edição OK.`);

        // DELETE (HARD DELETE PARA NÃO SUJAR)
        const { error: delErr } = await supabase.from('employees').delete().eq('id', emp.id);

        if (delErr) throw delErr;
        await logger.success('SystemAuditor', `✅ RH: Exclusão OK.`);
        successCount++;

    } catch (e: any) {
        failCount++;
        await logger.error('SystemAuditor', `❌ FALHA NO MÓDULO RH: ${e.message}`, e);
    }

    // --- 3. TESTE DE CONECTIVIDADE GPS (SELSYN) ---
    try {
        await logger.info('SystemAuditor', '🧪 Testando Conexão API Selsyn...');
        const positions = await fetchFleetPositions();

        if (Array.isArray(positions)) {
            await logger.success('SystemAuditor', `✅ GPS: Conexão OK. Veículos retornados: ${positions.length}`);
            successCount++;
        } else {
            throw new Error("API não retornou um array válido");
        }

    } catch (e: any) {
        failCount++;
        await logger.error('SystemAuditor', `❌ FALHA NO MÓDULO GPS: ${e.message}`, e);
    }

    // RESUMO
    if (failCount === 0) {
        await logger.success('SystemAuditor', `🏁 DIAGNÓSTICO COMPLETO: TUDO OK! (${successCount} módulos verificados)`);
    } else {
        await logger.warn('SystemAuditor', `⚠️ DIAGNÓSTICO FINALIZADO COM ${failCount} FALHAS.`);
    }
};
