/**
 * payrollService.ts — Serviço de Folha de Pagamento
 *
 * Gerencia importação XLSX, matching de funcionários, conferência com ponto
 * e geração de contas a pagar (salários + iFood individuais).
 */

import { supabase } from '../lib/supabase';
import { paymentService, ContaPagar } from './paymentService';
import type { ParsedPayrollRow } from './payrollXlsxParser';

// ============================================
// Interfaces
// ============================================

export interface FolhaPagamento {
    id?: string;
    competencia_ano: number;
    competencia_mes: number;
    status: 'RASCUNHO' | 'CONFERIDO' | 'APROVADO' | 'GERADO';
    total_bruto: number;
    total_liquido: number;
    total_ifood: number;
    total_funcionarios: number;
    observacoes?: string;
    imported_at?: string;
    imported_by?: string;
    contas_geradas_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface FolhaItem {
    id?: string;
    folha_id: string;
    employee_id?: string | null;
    employee_name: string;
    employee_code?: string | null;
    company_section: string;
    company_id?: string | null;
    salario_mensal: number;
    adiantamento: number;
    gastos_loja: number;
    coopercred_uniodonto: number;
    marmita_outros: number;
    salario_liquido: number;
    forma_pagamento?: string | null;
    ifood_valor: number;
    observacoes?: string | null;
    // Timecard cross-ref
    tc_overtime_50_min?: number | null;
    tc_overtime_100_min?: number | null;
    tc_total_worked_min?: number | null;
    tc_absence_min?: number | null;
    tc_balance_min?: number | null;
    planilha_menciona_he: boolean;
    discrepancia_flag: boolean;
    discrepancia_notas?: string | null;
    // Links
    entity_id?: string | null;
    conta_salario_id?: string | null;
    conta_ifood_id?: string | null;
    // Match
    match_status: string;
    match_score?: number | null;
    incluir: boolean;
}

export interface GerarContasConfig {
    data_emissao: string;
    data_vencimento_salario: string;
    data_vencimento_ifood: string;
    centro_custo_id: string;
    plano_contas_id?: string;
}

// Mapeamento empresa → company UUID (do banco)
const COMPANY_SECTION_MAP: Record<string, number> = {
    'DOURADAO': 3,
    'CONSTRUTERRA': 2,
    'TRANS_TERRA': 1,
};

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// ============================================
// Helpers de matching (inspirados no TimecardService.ts)
// ============================================

function normalizeName(name: string): string {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
}

function levenshtein(a: string, b: string): number {
    const la = a.length, lb = b.length;
    const dp: number[][] = Array.from({ length: la + 1 }, () => Array(lb + 1).fill(0));
    for (let i = 0; i <= la; i++) dp[i][0] = i;
    for (let j = 0; j <= lb; j++) dp[0][j] = j;
    for (let i = 1; i <= la; i++) {
        for (let j = 1; j <= lb; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
        }
    }
    return dp[la][lb];
}

function matchScore(planilhaName: string, employeeName: string): number {
    const a = normalizeName(planilhaName);
    const b = normalizeName(employeeName);

    // Exato
    if (a === b) return 100;

    // Contém
    if (b.includes(a) || a.includes(b)) return 90;

    // Primeiro nome igual
    const partsA = a.split(' ');
    const partsB = b.split(' ');
    if (partsA[0] === partsB[0]) {
        // Primeiro nome igual + último nome similar
        if (partsA.length > 1 && partsB.length > 1) {
            const lastA = partsA[partsA.length - 1];
            const lastB = partsB[partsB.length - 1];
            if (lastA === lastB) return 95;
            if (levenshtein(lastA, lastB) <= 2) return 80;
        }
        return 70;
    }

    // Levenshtein no nome completo
    const dist = levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length);
    const similarity = ((maxLen - dist) / maxLen) * 100;
    return Math.round(similarity);
}

// ============================================
// Service Class
// ============================================

class PayrollService {

    // ---- CRUD ----

    async listar(filtros?: { ano?: number; mes?: number; status?: string }) {
        let query = supabase
            .from('folha_pagamento')
            .select('*')
            .order('competencia_ano', { ascending: false })
            .order('competencia_mes', { ascending: false });

        if (filtros?.ano) query = query.eq('competencia_ano', filtros.ano);
        if (filtros?.mes) query = query.eq('competencia_mes', filtros.mes);
        if (filtros?.status) query = query.eq('status', filtros.status);

        const { data, error } = await query;
        if (error) throw error;
        return data as FolhaPagamento[];
    }

    async buscarPorCompetencia(ano: number, mes: number) {
        const { data: folha, error } = await supabase
            .from('folha_pagamento')
            .select('*')
            .eq('competencia_ano', ano)
            .eq('competencia_mes', mes)
            .maybeSingle();

        if (error) throw error;
        if (!folha) return null;

        const { data: itens, error: err2 } = await supabase
            .from('folha_pagamento_itens')
            .select('*')
            .eq('folha_id', folha.id)
            .order('company_section', { ascending: true })
            .order('employee_name', { ascending: true });

        if (err2) throw err2;

        return { folha: folha as FolhaPagamento, itens: (itens || []) as FolhaItem[] };
    }

    async criar(folha: Omit<FolhaPagamento, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('folha_pagamento')
            .insert(folha)
            .select()
            .single();

        if (error) throw error;
        return data as FolhaPagamento;
    }

    async atualizarStatus(folhaId: string, status: string) {
        const { error } = await supabase
            .from('folha_pagamento')
            .update({ status })
            .eq('id', folhaId);

        if (error) throw error;
    }

    async atualizarItem(itemId: string, campos: Partial<FolhaItem>) {
        const { error } = await supabase
            .from('folha_pagamento_itens')
            .update(campos)
            .eq('id', itemId);

        if (error) throw error;
    }

    async atualizarItens(itens: { id: string; campos: Partial<FolhaItem> }[]) {
        const errors: string[] = [];
        for (const item of itens) {
            try {
                await this.atualizarItem(item.id, item.campos);
            } catch (err: any) {
                errors.push(`Item ${item.id}: ${err.message}`);
            }
        }
        if (errors.length > 0) {
            throw new Error(`Erros ao salvar: ${errors.join(', ')}`);
        }
    }

    async recalcularTotais(folhaId: string) {
        const { data: itens } = await supabase
            .from('folha_pagamento_itens')
            .select('salario_mensal, salario_liquido, ifood_valor, incluir')
            .eq('folha_id', folhaId)
            .eq('incluir', true);

        if (!itens) return;

        const total_bruto = itens.reduce((s, i) => s + (i.salario_mensal || 0), 0);
        const total_liquido = itens.reduce((s, i) => s + (i.salario_liquido || 0), 0);
        const total_ifood = itens.reduce((s, i) => s + (i.ifood_valor || 0), 0);

        await supabase
            .from('folha_pagamento')
            .update({
                total_bruto: Math.round(total_bruto * 100) / 100,
                total_liquido: Math.round(total_liquido * 100) / 100,
                total_ifood: Math.round(total_ifood * 100) / 100,
                total_funcionarios: itens.length,
            })
            .eq('id', folhaId);
    }

    async deletar(folhaId: string) {
        // Só pode deletar rascunho
        const { data: folha } = await supabase
            .from('folha_pagamento')
            .select('status')
            .eq('id', folhaId)
            .single();

        if (folha?.status !== 'RASCUNHO') {
            throw new Error('Só é possível deletar folhas em RASCUNHO');
        }

        // Cascade vai deletar os itens
        const { error } = await supabase
            .from('folha_pagamento')
            .delete()
            .eq('id', folhaId);

        if (error) throw error;
    }

    // ---- IMPORTAÇÃO ----

    async importarItens(folhaId: string, parsedRows: ParsedPayrollRow[]) {
        // Buscar companies para mapear seção → company_id
        const { data: companies } = await supabase
            .from('companies')
            .select('id, tga_codfilial')
            .not('tga_codfilial', 'is', null);

        const companyMap: Record<string, string> = {};
        for (const c of (companies || [])) {
            for (const [section, codfilial] of Object.entries(COMPANY_SECTION_MAP)) {
                if (c.tga_codfilial === codfilial) {
                    companyMap[section] = c.id;
                }
            }
        }

        const items: any[] = parsedRows.map(row => ({
            folha_id: folhaId,
            employee_name: row.employee_name,
            employee_code: row.employee_code,
            company_section: row.company_section,
            company_id: companyMap[row.company_section] || null,
            salario_mensal: row.salario_mensal,
            adiantamento: row.adiantamento,
            gastos_loja: row.gastos_loja,
            coopercred_uniodonto: row.coopercred_uniodonto,
            marmita_outros: row.marmita_outros,
            salario_liquido: row.salario_liquido,
            forma_pagamento: row.forma_pagamento,
            ifood_valor: row.ifood_valor,
            observacoes: row.observacoes,
            planilha_menciona_he: row.planilha_menciona_he,
            match_status: 'PENDENTE',
            incluir: true,
        }));

        // Batch insert (50 por lote)
        const batchSize = 50;
        const inserted: any[] = [];

        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const { data, error } = await supabase
                .from('folha_pagamento_itens')
                .insert(batch)
                .select();

            if (error) throw error;
            if (data) inserted.push(...data);
        }

        // Atualizar totais no cabeçalho
        const totalBruto = parsedRows.reduce((s, r) => s + r.salario_mensal, 0);
        const totalLiquido = parsedRows.reduce((s, r) => s + r.salario_liquido, 0);
        const totalIfood = parsedRows.reduce((s, r) => s + r.ifood_valor, 0);

        await supabase
            .from('folha_pagamento')
            .update({
                total_bruto: Math.round(totalBruto * 100) / 100,
                total_liquido: Math.round(totalLiquido * 100) / 100,
                total_ifood: Math.round(totalIfood * 100) / 100,
                total_funcionarios: parsedRows.length,
                imported_at: new Date().toISOString(),
            })
            .eq('id', folhaId);

        return inserted as FolhaItem[];
    }

    // ---- MATCHING DE FUNCIONÁRIOS ----

    async matchEmployees(folhaId: string) {
        // Buscar itens da folha
        const { data: itens, error: err1 } = await supabase
            .from('folha_pagamento_itens')
            .select('*')
            .eq('folha_id', folhaId);

        if (err1) throw err1;
        if (!itens?.length) return { matched: 0, unmatched: 0 };

        // Buscar todos os employees ativos
        const { data: employees, error: err2 } = await supabase
            .from('employees')
            .select('id, name, registration_number, company_id, entity_id, active')
            .eq('active', true);

        if (err2) throw err2;

        let matched = 0;
        let unmatched = 0;

        for (const item of itens) {
            let bestMatch: any = null;
            let bestScore = 0;
            let matchMethod = '';

            for (const emp of (employees || [])) {
                // 1. Match por registration_number (código do funcionário)
                if (item.employee_code && emp.registration_number) {
                    if (String(item.employee_code).trim() === String(emp.registration_number).trim()) {
                        bestMatch = emp;
                        bestScore = 100;
                        matchMethod = 'registration_number';
                        break;
                    }
                }

                // 2. Match por nome (fuzzy)
                const score = matchScore(item.employee_name, emp.name);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = emp;
                    matchMethod = 'name_fuzzy';
                }
            }

            const update: any = {
                match_score: bestScore,
            };

            if (bestMatch && bestScore >= 60) {
                update.employee_id = bestMatch.id;
                update.entity_id = bestMatch.entity_id || null;
                update.match_status = bestScore >= 80 ? 'MATCHED' : 'MANUAL';
                if (!item.company_id && bestMatch.company_id) {
                    update.company_id = bestMatch.company_id;
                }
                matched++;
            } else {
                update.match_status = 'NAO_ENCONTRADO';
                unmatched++;
            }

            await supabase
                .from('folha_pagamento_itens')
                .update(update)
                .eq('id', item.id);
        }

        return { matched, unmatched };
    }

    async updateItemMatch(itemId: string, employeeId: string) {
        // Match manual: atualiza item com o employee selecionado
        const { data: emp } = await supabase
            .from('employees')
            .select('id, name, entity_id, company_id')
            .eq('id', employeeId)
            .single();

        if (!emp) throw new Error('Funcionário não encontrado');

        const { error } = await supabase
            .from('folha_pagamento_itens')
            .update({
                employee_id: emp.id,
                entity_id: emp.entity_id || null,
                company_id: emp.company_id || null,
                match_status: 'MANUAL',
                match_score: 100,
            })
            .eq('id', itemId);

        if (error) throw error;
    }

    // ---- CROSS-REFERENCE COM PONTO ----

    async crossReferenceTimecard(folhaId: string, ano: number, mes: number) {
        const { data: itens, error: err1 } = await supabase
            .from('folha_pagamento_itens')
            .select('*')
            .eq('folha_id', folhaId)
            .not('employee_id', 'is', null);

        if (err1) throw err1;
        if (!itens?.length) return { total: 0, comPonto: 0, discrepancias: 0 };

        // Buscar todos os cálculos de ponto do mês
        const employeeIds = itens.map(i => i.employee_id).filter(Boolean);
        const { data: timecards } = await supabase
            .from('timecard_calculations')
            .select('*')
            .eq('year', ano)
            .eq('month', mes)
            .in('employee_id', employeeIds);

        const tcMap: Record<string, any> = {};
        for (const tc of (timecards || [])) {
            tcMap[tc.employee_id] = tc;
        }

        let comPonto = 0;
        let discrepancias = 0;

        for (const item of itens) {
            const tc = tcMap[item.employee_id];
            if (!tc) continue;

            comPonto++;

            const update: any = {
                tc_overtime_50_min: tc.overtime_50_hours || 0,
                tc_overtime_100_min: tc.overtime_100_hours || 0,
                tc_total_worked_min: tc.total_worked || 0,
                tc_absence_min: tc.total_absence || 0,
                tc_balance_min: tc.balance || 0,
            };

            // Detectar discrepâncias
            const notas: string[] = [];

            // Se planilha menciona HE mas ponto não tem
            if (item.planilha_menciona_he && (tc.overtime_50_hours || 0) + (tc.overtime_100_hours || 0) === 0) {
                notas.push('Planilha menciona H.E. mas ponto não registrou hora extra');
            }

            // Se ponto tem HE significativa mas planilha não menciona
            if (!item.planilha_menciona_he && ((tc.overtime_50_hours || 0) + (tc.overtime_100_hours || 0)) > 60) {
                notas.push(`Ponto registrou ${minutesToHHMM((tc.overtime_50_hours || 0) + (tc.overtime_100_hours || 0))} de H.E. mas planilha não menciona`);
            }

            // Se tem faltas significativas
            if ((tc.total_absence || 0) > 120) {
                notas.push(`Ponto registrou ${minutesToHHMM(tc.total_absence)} de faltas`);
            }

            if (notas.length > 0) {
                update.discrepancia_flag = true;
                update.discrepancia_notas = notas.join('; ');
                discrepancias++;
            } else {
                update.discrepancia_flag = false;
                update.discrepancia_notas = null;
            }

            await supabase
                .from('folha_pagamento_itens')
                .update(update)
                .eq('id', item.id);
        }

        // Atualizar status da folha
        await supabase
            .from('folha_pagamento')
            .update({ status: 'CONFERIDO' })
            .eq('id', folhaId);

        return { total: itens.length, comPonto, discrepancias };
    }

    // ---- GERAÇÃO DE CONTAS A PAGAR ----

    async ensureEntities(folhaId: string) {
        // Buscar itens com employee_id mas sem entity_id
        const { data: itens } = await supabase
            .from('folha_pagamento_itens')
            .select('id, employee_id, employee_name')
            .eq('folha_id', folhaId)
            .not('employee_id', 'is', null)
            .is('entity_id', null);

        if (!itens?.length) return 0;

        let created = 0;

        for (const item of itens) {
            // Buscar dados do employee
            const { data: emp } = await supabase
                .from('employees')
                .select('id, name, cpf, email, phone, entity_id')
                .eq('id', item.employee_id)
                .single();

            if (!emp) continue;

            // Se employee já tem entity_id, usar
            if (emp.entity_id) {
                await supabase
                    .from('folha_pagamento_itens')
                    .update({ entity_id: emp.entity_id })
                    .eq('id', item.id);
                continue;
            }

            // Criar entity para o employee
            const { data: entity, error } = await supabase
                .from('entities')
                .insert({
                    name: emp.name,
                    type: 'PF',
                    is_client: false,
                    is_supplier: false,
                    document: emp.cpf || null,
                    email: emp.email || null,
                    phone: emp.phone || null,
                })
                .select()
                .single();

            if (error) {
                console.error(`Erro ao criar entity para ${emp.name}:`, error);
                continue;
            }

            // Atualizar employee com entity_id
            await supabase
                .from('employees')
                .update({ entity_id: entity.id })
                .eq('id', emp.id);

            // Atualizar item com entity_id
            await supabase
                .from('folha_pagamento_itens')
                .update({ entity_id: entity.id })
                .eq('id', item.id);

            created++;
        }

        return created;
    }

    async gerarContasPagar(folhaId: string, config: GerarContasConfig) {
        // Buscar itens incluídos e com match
        const { data: itens } = await supabase
            .from('folha_pagamento_itens')
            .select('*')
            .eq('folha_id', folhaId)
            .eq('incluir', true)
            .in('match_status', ['MATCHED', 'MANUAL']);

        if (!itens?.length) throw new Error('Nenhum item elegível para geração de contas');

        // Garantir entities
        await this.ensureEntities(folhaId);

        // Re-buscar itens com entity_id atualizado
        const { data: itensAtualizados } = await supabase
            .from('folha_pagamento_itens')
            .select('*')
            .eq('folha_id', folhaId)
            .eq('incluir', true)
            .in('match_status', ['MATCHED', 'MANUAL']);

        // Buscar folha para competência
        const { data: folha } = await supabase
            .from('folha_pagamento')
            .select('competencia_ano, competencia_mes')
            .eq('id', folhaId)
            .single();

        if (!folha) throw new Error('Folha não encontrada');

        const mesLabel = MESES[folha.competencia_mes - 1];
        const competenciaLabel = `${mesLabel}/${folha.competencia_ano}`;

        let contasSalario = 0;
        let contasIfood = 0;
        const errors: string[] = [];

        for (const item of (itensAtualizados || [])) {
            if (!item.entity_id) {
                errors.push(`${item.employee_name}: sem entity_id, pulado`);
                continue;
            }

            // 1. Conta a pagar - SALÁRIO
            if (item.salario_liquido > 0) {
                try {
                    const conta: ContaPagar = {
                        fornecedor_id: item.entity_id,
                        fornecedor_nome: item.employee_name,
                        valor_original: item.salario_liquido,
                        data_emissao: config.data_emissao,
                        data_vencimento: config.data_vencimento_salario,
                        centro_custo_id: config.centro_custo_id,
                        plano_contas_id: config.plano_contas_id || undefined,
                        status: 'PENDENTE',
                        forma_pagamento: item.forma_pagamento || 'PIX',
                        descricao: `Salário ${competenciaLabel} - ${item.employee_name}`,
                        observacao: item.observacoes || undefined,
                        categoria: 'SALARIO',
                    };

                    const created = await paymentService.criar(conta);

                    // Link a conta criada ao item
                    await supabase
                        .from('folha_pagamento_itens')
                        .update({ conta_salario_id: created.id })
                        .eq('id', item.id);

                    contasSalario++;
                } catch (err: any) {
                    errors.push(`Salário ${item.employee_name}: ${err.message}`);
                }
            }

            // 2. Conta a pagar - IFOOD (individual)
            if (item.ifood_valor > 0) {
                try {
                    const conta: ContaPagar = {
                        fornecedor_id: item.entity_id,
                        fornecedor_nome: item.employee_name,
                        valor_original: item.ifood_valor,
                        data_emissao: config.data_emissao,
                        data_vencimento: config.data_vencimento_ifood,
                        centro_custo_id: config.centro_custo_id,
                        plano_contas_id: config.plano_contas_id || undefined,
                        status: 'PENDENTE',
                        forma_pagamento: 'IFOOD',
                        descricao: `iFood ${competenciaLabel} - ${item.employee_name}`,
                        categoria: 'IFOOD',
                    };

                    const created = await paymentService.criar(conta);

                    await supabase
                        .from('folha_pagamento_itens')
                        .update({ conta_ifood_id: created.id })
                        .eq('id', item.id);

                    contasIfood++;
                } catch (err: any) {
                    errors.push(`iFood ${item.employee_name}: ${err.message}`);
                }
            }
        }

        // Atualizar status da folha
        await supabase
            .from('folha_pagamento')
            .update({
                status: 'GERADO',
                contas_geradas_at: new Date().toISOString(),
            })
            .eq('id', folhaId);

        return { contasSalario, contasIfood, errors };
    }
}

// ============================================
// Helper
// ============================================

function minutesToHHMM(minutes: number): string {
    const h = Math.floor(Math.abs(minutes) / 60);
    const m = Math.abs(minutes) % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ============================================
// Export singleton
// ============================================

export const payrollService = new PayrollService();
export default payrollService;
