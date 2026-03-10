/**
 * Serviço de Relatórios Financeiros
 * DRE, Fluxo de Caixa, Análises e Dashboards
 */

import { supabase } from '../lib/supabase';

interface PeriodoFiltro {
    data_inicio: string;
    data_fim: string;
    centro_custo_id?: string;
}

export interface EquipmentProfitabilityRow {
    asset_id: string;
    asset_code: string;
    asset_name: string;
    asset_model: string;
    revenue: number;
    revenue_count: number;
    maintenance_cost: number;
    maintenance_count: number;
    fuel_cost: number;
    fuel_liters: number;
    parts_cost: number;
    parts_count: number;
    total_cost: number;
    net_result: number;
    margin_percent: number;
}

class ReportService {
    /**
     * Fluxo de Caixa Consolidado
     */
    async fluxoCaixa(params: PeriodoFiltro & { realizado_apenas?: boolean }) {
        let query = supabase
            .from('vw_fluxo_caixa')
            .select('*')
            .gte('data', params.data_inicio)
            .lte('data', params.data_fim);

        if (params.realizado_apenas) {
            query = query.eq('realizado', 'REALIZADO');
        }

        if (params.centro_custo_id) {
            query = query.eq('centro_custo_id', params.centro_custo_id);
        }

        const { data, error } = await query.order('data', { ascending: true });

        if (error) throw error;

        // Calcular saldo acumulado
        let saldoAcumulado = 0;
        const resultado = data.map((item: any) => {
            saldoAcumulado += item.valor;
            return {
                ...item,
                saldo_acumulado: saldoAcumulado,
            };
        });

        return resultado;
    }

    /**
     * DRE (Demonstração de Resultado do Exercício)
     */
    async dre(params: PeriodoFiltro) {
        // Receitas
        const { data: receitas } = await supabase
            .from('contas_receber')
            .select(`
        valor_original,
        plano_contas:plano_contas(codigo, nome),
        centro_custo:centros_custo(codigo, nome)
      `)
            .gte('data_recebimento', params.data_inicio)
            .lte('data_recebimento', params.data_fim)
            .eq('status', 'RECEBIDO');

        // Despesas
        const { data: despesas } = await supabase
            .from('contas_pagar')
            .select(`
        valor_original,
        plano_contas:plano_contas(codigo, nome),
        centro_custo:centros_custo(codigo, nome)
      `)
            .gte('data_pagamento', params.data_inicio)
            .lte('data_pagamento', params.data_fim)
            .eq('status', 'PAGO');

        const totalReceitas = receitas?.reduce((sum, r) => sum + r.valor_original, 0) || 0;
        const totalDespesas = despesas?.reduce((sum, d) => sum + d.valor_original, 0) || 0;

        // Agrupar por plano de contas
        const receitasPorConta = this.agruparPorConta(receitas || []);
        const despesasPorConta = this.agruparPorConta(despesas || []);

        return {
            periodo: params,
            receitas: {
                total: totalReceitas,
                por_conta: receitasPorConta,
            },
            despesas: {
                total: totalDespesas,
                por_conta: despesasPorConta,
            },
            resultado: {
                bruto: totalReceitas - totalDespesas,
                margem_percentual: totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0,
            },
        };
    }

    /**
     * DRE Mensal (últimos 12 meses)
     */
    async dreMensal() {
        const { data, error } = await supabase
            .from('vw_dre_mensal')
            .select('*')
            .order('mes', { ascending: false })
            .limit(12);

        if (error) throw error;
        return data;
    }

    /**
     * Dashboard de Inadimplência
     */
    async dashboardInadimplencia() {
        const { data, error } = await supabase
            .from('vw_inadimplencia')
            .select('*')
            .order('valor_total_devido', { ascending: false });

        if (error) throw error;

        const totalDevido = data?.reduce((sum, item) => sum + item.valor_total_devido, 0) || 0;
        const totalTitulos = data?.reduce((sum, item) => sum + item.titulos_vencidos, 0) || 0;

        return {
            clientes: data,
            resumo: {
                total_clientes_inadimplentes: data?.length || 0,
                total_titulos_vencidos: totalTitulos,
                valor_total_devido: totalDevido,
            },
        };
    }

    /**
     * Dashboard Executivo
     */
    async dashboardExecutivo(mes?: string) {
        const mesRef = mes || new Date().toISOString().substring(0, 7);
        const hoje = new Date().toISOString().split('T')[0];

        // Contas a Pagar
        const { data: pagarHoje } = await supabase
            .from('contas_pagar')
            .select('valor_saldo')
            .eq('data_vencimento', hoje)
            .neq('status', 'PAGO');

        const { data: pagarMes } = await supabase
            .from('contas_pagar')
            .select('valor_saldo')
            .like('data_vencimento', `${mesRef}%`)
            .neq('status', 'PAGO');

        const { data: pagarVencidas } = await supabase
            .from('contas_pagar')
            .select('valor_saldo')
            .lt('data_vencimento', hoje)
            .neq('status', 'PAGO');

        // Contas a Receber
        const { data: receberHoje } = await supabase
            .from('contas_receber')
            .select('valor_saldo')
            .eq('data_vencimento', hoje)
            .neq('status', 'RECEBIDO');

        const { data: receberMes } = await supabase
            .from('contas_receber')
            .select('valor_saldo')
            .like('data_vencimento', `${mesRef}%`)
            .neq('status', 'RECEBIDO');

        const { data: receberVencidas } = await supabase
            .from('contas_receber')
            .select('valor_saldo')
            .lt('data_vencimento', hoje)
            .neq('status', 'RECEBIDO');

        // Saldos bancários
        const { data: contas } = await supabase
            .from('contas_bancarias')
            .select('saldo_atual')
            .eq('ativa', true);

        const saldoBancario = contas?.reduce((sum, c) => sum + c.saldo_atual, 0) || 0;

        const somarValores = (arr: any[]) =>
            arr?.reduce((sum, item) => sum + (item.valor_saldo || 0), 0) || 0;

        return {
            contas_pagar: {
                vencimento_hoje: somarValores(pagarHoje),
                vencimento_mes: somarValores(pagarMes),
                vencidas: somarValores(pagarVencidas),
            },
            contas_receber: {
                vencimento_hoje: somarValores(receberHoje),
                vencimento_mes: somarValores(receberMes),
                vencidas: somarValores(receberVencidas),
            },
            saldo_bancario: saldoBancario,
            saldo_previsto: saldoBancario + somarValores(receberMes) - somarValores(pagarMes),
        };
    }

    /**
     * Análise por Centro de Custo
     */
    async analiseCentroCusto(params: PeriodoFiltro) {
        const { data: receitas } = await supabase
            .from('contas_receber')
            .select(`
        valor_original,
        centro_custo:centros_custo(id, codigo, nome, tipo)
      `)
            .gte('data_recebimento', params.data_inicio)
            .lte('data_recebimento', params.data_fim)
            .eq('status', 'RECEBIDO')
            .not('centro_custo_id', 'is', null);

        const { data: despesas } = await supabase
            .from('contas_pagar')
            .select(`
        valor_original,
        centro_custo:centros_custo(id, codigo, nome, tipo)
      `)
            .gte('data_pagamento', params.data_inicio)
            .lte('data_pagamento', params.data_fim)
            .eq('status', 'PAGO')
            .not('centro_custo_id', 'is', null);

        const centros = new Map();

        // Processar receitas
        receitas?.forEach((r: any) => {
            if (!r.centro_custo) return;
            const id = r.centro_custo.id;
            if (!centros.has(id)) {
                centros.set(id, {
                    ...r.centro_custo,
                    receitas: 0,
                    despesas: 0,
                });
            }
            centros.get(id).receitas += r.valor_original;
        });

        // Processar despesas
        despesas?.forEach((d: any) => {
            if (!d.centro_custo) return;
            const id = d.centro_custo.id;
            if (!centros.has(id)) {
                centros.set(id, {
                    ...d.centro_custo,
                    receitas: 0,
                    despesas: 0,
                });
            }
            centros.get(id).despesas += d.valor_original;
        });

        // Calcular resultado
        const resultado = Array.from(centros.values()).map((c: any) => ({
            ...c,
            resultado: c.receitas - c.despesas,
            margem: c.receitas > 0 ? ((c.receitas - c.despesas) / c.receitas) * 100 : 0,
        }));

        return resultado;
    }

    /**
     * Análise de Categorias (Combustível, Manutenção, etc)
     */
    async analiseCategorias(params: PeriodoFiltro) {
        const { data: despesas } = await supabase
            .from('contas_pagar')
            .select('categoria, valor_original')
            .gte('data_pagamento', params.data_inicio)
            .lte('data_pagamento', params.data_fim)
            .eq('status', 'PAGO')
            .not('categoria', 'is', null);

        const categorias = new Map();

        despesas?.forEach((d) => {
            const cat = d.categoria || 'SEM_CATEGORIA';
            if (!categorias.has(cat)) {
                categorias.set(cat, 0);
            }
            categorias.set(cat, categorias.get(cat) + d.valor_original);
        });

        const total = Array.from(categorias.values()).reduce((sum, v) => sum + v, 0);

        const resultado = Array.from(categorias.entries())
            .map(([categoria, valor]) => ({
                categoria,
                valor,
                percentual: total > 0 ? (valor / total) * 100 : 0,
            }))
            .sort((a, b) => b.valor - a.valor);

        return resultado;
    }

    /**
     * Aging List (títulos por prazo)
     */
    async agingList() {
        const hoje = new Date();

        const { data: titulos } = await supabase
            .from('contas_receber')
            .select(`
        *,
        cliente:entities!cliente_id(name)
      `)
            .neq('status', 'RECEBIDO')
            .neq('status', 'CANCELADO');

        if (!titulos) return { faixas: [], total: 0 };

        const faixas = {
            a_vencer: [] as any[],
            vencido_0_30: [] as any[],
            vencido_31_60: [] as any[],
            vencido_61_90: [] as any[],
            vencido_90_mais: [] as any[],
        };

        titulos.forEach((t) => {
            const vencimento = new Date(t.data_vencimento);
            const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));

            if (diasAtraso < 0) {
                faixas.a_vencer.push(t);
            } else if (diasAtraso <= 30) {
                faixas.vencido_0_30.push(t);
            } else if (diasAtraso <= 60) {
                faixas.vencido_31_60.push(t);
            } else if (diasAtraso <= 90) {
                faixas.vencido_61_90.push(t);
            } else {
                faixas.vencido_90_mais.push(t);
            }
        });

        const calcularTotal = (arr: any[]) =>
            arr.reduce((sum, t) => sum + (t.valor_saldo || 0), 0);

        return {
            faixas: {
                a_vencer: {
                    titulos: faixas.a_vencer.length,
                    valor: calcularTotal(faixas.a_vencer),
                },
                vencido_0_30: {
                    titulos: faixas.vencido_0_30.length,
                    valor: calcularTotal(faixas.vencido_0_30),
                },
                vencido_31_60: {
                    titulos: faixas.vencido_31_60.length,
                    valor: calcularTotal(faixas.vencido_31_60),
                },
                vencido_61_90: {
                    titulos: faixas.vencido_61_90.length,
                    valor: calcularTotal(faixas.vencido_61_90),
                },
                vencido_90_mais: {
                    titulos: faixas.vencido_90_mais.length,
                    valor: calcularTotal(faixas.vencido_90_mais),
                },
            },
            total: titulos.length,
            total_valor: calcularTotal(titulos),
        };
    }

    /**
     * Exportar para Excel (dados)
     */
    async exportarExcel(tipo: 'DRE' | 'FLUXO' | 'CONTAS_PAGAR' | 'CONTAS_RECEBER', params: any) {
        let data: any[];

        switch (tipo) {
            case 'DRE':
                const dre = await this.dre(params);
                data = this.formatarDREParaExcel(dre);
                break;

            case 'FLUXO':
                data = await this.fluxoCaixa(params);
                break;

            case 'CONTAS_PAGAR':
                const { data: pagar } = await supabase.from('contas_pagar').select('*').gte('data_vencimento', params.data_inicio).lte('data_vencimento', params.data_fim);
                data = pagar || [];
                break;

            case 'CONTAS_RECEBER':
                const { data: receber } = await supabase.from('contas_receber').select('*').gte('data_vencimento', params.data_inicio).lte('data_vencimento', params.data_fim);
                data = receber || [];
                break;

            default:
                throw new Error('Tipo de exportação inválido');
        }

        return data;
    }

    // ============================================================
    // RENTABILIDADE POR EQUIPAMENTO
    // Cruza receita (billing) × custos (manutenção + combustível + peças)
    // ============================================================

    async rentabilidadeEquipamento(params: {
        data_inicio: string;
        data_fim: string;
        asset_id?: string;
    }): Promise<EquipmentProfitabilityRow[]> {
        // 1. Buscar assets (todos ou um específico)
        let assetsQuery = supabase.from('assets').select('id, code, name, model, brand');
        if (params.asset_id) assetsQuery = assetsQuery.eq('id', params.asset_id);
        const { data: assets } = await assetsQuery.order('name');
        if (!assets || assets.length === 0) return [];

        // Converter período YYYY-MM-DD para range de reference_month (YYYY-MM)
        const startMonth = params.data_inicio.substring(0, 7); // "2026-01"
        const endMonth = params.data_fim.substring(0, 7);       // "2026-12"

        // 2. Receita: billing items com asset_id
        const { data: billingData } = await supabase
            .from('bunge_billing_items')
            .select(`
                asset_id,
                total_value,
                billing:bunge_billings!billing_id(reference_month, status)
            `)
            .not('asset_id', 'is', null);

        // 3. Manutenção: OS completadas no período
        const { data: maintenanceData } = await supabase
            .from('maintenance_os')
            .select('asset_id, total_cost, opened_at')
            .gte('opened_at', params.data_inicio + 'T00:00:00')
            .lte('opened_at', params.data_fim + 'T23:59:59')
            .eq('status', 'COMPLETED');

        // 4. Combustível: abastecimentos (OUT) no período
        const { data: fuelData } = await supabase
            .from('fuel_records')
            .select('asset_id, total_value, liters, date')
            .eq('operation_type', 'OUT')
            .not('asset_id', 'is', null)
            .gte('date', params.data_inicio)
            .lte('date', params.data_fim);

        // 5. Peças/estoque: saídas para equipamento no período
        const { data: movData } = await supabase
            .from('inventory_movements')
            .select('equipment_id, total_value, created_at')
            .not('equipment_id', 'is', null)
            .in('movement_type', ['SAIDA_OS', 'SAIDA_EQUIPAMENTO', 'SAIDA_CONSUMO_INTERNO'])
            .gte('created_at', params.data_inicio + 'T00:00:00')
            .lte('created_at', params.data_fim + 'T23:59:59');

        // 6. Agregar por asset_id
        const assetMap = new Map<string, EquipmentProfitabilityRow>();

        for (const asset of assets) {
            assetMap.set(asset.id, {
                asset_id: asset.id,
                asset_code: asset.code || '',
                asset_name: asset.name || '',
                asset_model: asset.model || '',
                revenue: 0,
                revenue_count: 0,
                maintenance_cost: 0,
                maintenance_count: 0,
                fuel_cost: 0,
                fuel_liters: 0,
                parts_cost: 0,
                parts_count: 0,
                total_cost: 0,
                net_result: 0,
                margin_percent: 0,
            });
        }

        // Processar receitas (filtrar por reference_month no range)
        billingData?.forEach((item: any) => {
            if (!item.asset_id || !assetMap.has(item.asset_id)) return;
            const billing = item.billing as any;
            if (!billing || billing.status === 'CANCELADO') return;
            const refMonth = billing.reference_month;
            if (refMonth < startMonth || refMonth > endMonth) return;
            const row = assetMap.get(item.asset_id)!;
            row.revenue += item.total_value || 0;
            row.revenue_count += 1;
        });

        // Processar manutenção
        maintenanceData?.forEach((os: any) => {
            if (!os.asset_id || !assetMap.has(os.asset_id)) return;
            const row = assetMap.get(os.asset_id)!;
            row.maintenance_cost += os.total_cost || 0;
            row.maintenance_count += 1;
        });

        // Processar combustível
        fuelData?.forEach((fuel: any) => {
            if (!fuel.asset_id || !assetMap.has(fuel.asset_id)) return;
            const row = assetMap.get(fuel.asset_id)!;
            row.fuel_cost += fuel.total_value || 0;
            row.fuel_liters += fuel.liters || 0;
        });

        // Processar peças/estoque
        movData?.forEach((mov: any) => {
            if (!mov.equipment_id || !assetMap.has(mov.equipment_id)) return;
            const row = assetMap.get(mov.equipment_id)!;
            row.parts_cost += mov.total_value || 0;
            row.parts_count += 1;
        });

        // Calcular totais e margens
        const results = Array.from(assetMap.values())
            .map(row => {
                row.total_cost = row.maintenance_cost + row.fuel_cost + row.parts_cost;
                row.net_result = row.revenue - row.total_cost;
                row.margin_percent = row.revenue > 0
                    ? Math.round((row.net_result / row.revenue) * 10000) / 100
                    : (row.total_cost > 0 ? -100 : 0);
                // Arredondar valores
                row.revenue = Math.round(row.revenue * 100) / 100;
                row.maintenance_cost = Math.round(row.maintenance_cost * 100) / 100;
                row.fuel_cost = Math.round(row.fuel_cost * 100) / 100;
                row.parts_cost = Math.round(row.parts_cost * 100) / 100;
                row.total_cost = Math.round(row.total_cost * 100) / 100;
                row.net_result = Math.round(row.net_result * 100) / 100;
                return row;
            })
            // Filtrar apenas equipamentos com algum movimento
            .filter(row => row.revenue > 0 || row.total_cost > 0)
            .sort((a, b) => b.net_result - a.net_result);

        return results;
    }

    /**
     * Helpers privados
     */
    private agruparPorConta(registros: any[]) {
        const grupos = new Map();

        registros.forEach((r) => {
            if (!r.plano_contas) return;
            const codigo = r.plano_contas.codigo;
            if (!grupos.has(codigo)) {
                grupos.set(codigo, {
                    codigo,
                    nome: r.plano_contas.nome,
                    valor: 0,
                });
            }
            grupos.get(codigo).valor += r.valor_original;
        });

        return Array.from(grupos.values()).sort((a, b) => a.codigo.localeCompare(b.codigo));
    }

    private formatarDREParaExcel(dre: any) {
        const linhas = [];

        linhas.push({ tipo: 'TITULO', descricao: 'RECEITAS', valor: '' });
        dre.receitas.por_conta.forEach((c: any) => {
            linhas.push({ tipo: 'CONTA', descricao: `${c.codigo} - ${c.nome}`, valor: c.valor });
        });
        linhas.push({ tipo: 'SUBTOTAL', descricao: 'TOTAL RECEITAS', valor: dre.receitas.total });

        linhas.push({ tipo: 'TITULO', descricao: 'DESPESAS', valor: '' });
        dre.despesas.por_conta.forEach((c: any) => {
            linhas.push({ tipo: 'CONTA', descricao: `${c.codigo} - ${c.nome}`, valor: c.valor });
        });
        linhas.push({ tipo: 'SUBTOTAL', descricao: 'TOTAL DESPESAS', valor: dre.despesas.total });

        linhas.push({ tipo: 'RESULTADO', descricao: 'RESULTADO DO PERÍODO', valor: dre.resultado.bruto });

        return linhas;
    }
}

export const reportService = new ReportService();
export default reportService;
