/**
 * Serviço de Contas a Pagar
 * Gerencia fornecedores, lançamentos, pagamentos e CNAB
 */

import { supabase } from '../lib/supabase';

export interface ContaPagar {
    id?: string;
    numero_titulo?: string;
    fornecedor_id: string;
    fornecedor_nome: string;
    valor_original: number;
    valor_juros?: number;
    valor_multa?: number;
    valor_desconto?: number;
    valor_pago?: number;
    valor_saldo?: number;
    data_emissao: string;
    data_vencimento: string;
    data_pagamento?: string;
    competencia?: string;
    data_liquidacao?: string;
    plano_contas_id?: string;
    centro_custo_id?: string;
    categoria?: string;
    status: 'PENDENTE' | 'APROVADO' | 'EM_PAGAMENTO' | 'PAGO' | 'CANCELADO' | 'VENCIDO';
    forma_pagamento?: string;
    banco_id?: string;
    nosso_numero?: string;
    descricao: string;
    observacao?: string;
    numero_documento?: string;
    parcela_numero?: number;
    parcela_total?: number;
    titulo_pai_id?: string;
    conciliado?: boolean;
    origem_tipo?: string;
    origem_id?: string;
    tipo_documento?: string;
    numero_nf?: string;
    created_by?: string;
    updated_by?: string;
    canceled_by?: string;
    motivo_cancelamento?: string;
}

export interface ParcelamentoConfig {
    valor_total: number;
    numero_parcelas: number;
    data_primeiro_vencimento: string;
    intervalo_dias: number;
}

class PaymentService {
    /**
     * Listar contas a pagar com filtros
     */
    async listar(filtros?: {
        fornecedor_id?: string;
        status?: string;
        data_inicio?: string;
        data_fim?: string;
        vencidas?: boolean;
    }) {
        let query = supabase
            .from('contas_pagar')
            .select(`
        *,
        fornecedor:entities!fornecedor_id(id, name, document),
        plano_contas:plano_contas(codigo, nome),
        centro_custo:centros_custo(codigo, nome)
      `)
            .order('data_vencimento', { ascending: false });

        if (filtros?.fornecedor_id) {
            query = query.eq('fornecedor_id', filtros.fornecedor_id);
        }

        if (filtros?.status) {
            query = query.eq('status', filtros.status);
        }

        if (filtros?.data_inicio) {
            query = query.gte('data_vencimento', filtros.data_inicio);
        }

        if (filtros?.data_fim) {
            query = query.lte('data_vencimento', filtros.data_fim);
        }

        if (filtros?.vencidas) {
            query = query.lt('data_vencimento', new Date().toISOString().split('T')[0])
                .neq('status', 'PAGO');
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    /**
     * Criar nova conta a pagar
     */
    async criar(conta: ContaPagar) {
        // Gerar número do título automaticamente
        if (!conta.numero_titulo) {
            conta.numero_titulo = await this.gerarNumeroTitulo();
        }

        // Preencher competencia automaticamente (fallback = mês do vencimento)
        if (!conta.competencia && conta.data_vencimento) {
            conta.competencia = conta.data_vencimento.substring(0, 7) + '-01';
        }

        // Preencher origem_tipo se não fornecido
        if (!conta.origem_tipo) {
            conta.origem_tipo = 'MANUAL';
        }

        const { data, error } = await supabase
            .from('contas_pagar')
            .insert(conta)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Criar conta parcelada
     */
    async criarParcelado(conta: Omit<ContaPagar, 'numero_titulo'>, config: ParcelamentoConfig) {
        const valorParcela = config.valor_total / config.numero_parcelas;
        const parcelas: ContaPagar[] = [];

        // Criar título pai
        const tituloPai = await this.criar({
            ...conta,
            valor_original: config.valor_total,
            data_vencimento: config.data_primeiro_vencimento,
            descricao: `${conta.descricao} (Parcelado ${config.numero_parcelas}x)`,
            parcela_numero: 0,
            parcela_total: config.numero_parcelas,
        });

        // Criar parcelas
        for (let i = 1; i <= config.numero_parcelas; i++) {
            const dataVencimento = new Date(config.data_primeiro_vencimento);
            dataVencimento.setDate(dataVencimento.getDate() + ((i - 1) * config.intervalo_dias));

            const parcela = await this.criar({
                ...conta,
                valor_original: valorParcela,
                data_vencimento: dataVencimento.toISOString().split('T')[0],
                descricao: `${conta.descricao} - Parcela ${i}/${config.numero_parcelas}`,
                parcela_numero: i,
                parcela_total: config.numero_parcelas,
                titulo_pai_id: tituloPai.id,
            });

            parcelas.push(parcela);
        }

        return { tituloPai, parcelas };
    }

    /**
     * Aprovar conta a pagar
     */
    async aprovar(id: string, aprovador_id: string) {
        const { data, error } = await supabase
            .from('contas_pagar')
            .update({
                status: 'APROVADO',
                aprovado_por_id: aprovador_id,
                data_aprovacao: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Efetuar pagamento
     */
    async pagar(id: string, dados: {
        valor_pago: number;
        data_pagamento: string;
        forma_pagamento: string;
        banco_id?: string;
        observacao?: string;
    }) {
        const { data, error } = await supabase
            .from('contas_pagar')
            .update({
                valor_pago: dados.valor_pago,
                data_pagamento: dados.data_pagamento,
                data_liquidacao: dados.data_pagamento,
                forma_pagamento: dados.forma_pagamento,
                banco_id: dados.banco_id,
                observacao: dados.observacao,
                status: 'PAGO',
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Se pagamento foi via banco, criar movimento bancário e atualizar saldo
        if (dados.banco_id) {
            await this.criarMovimentoBancario(dados.banco_id, {
                data_movimento: dados.data_pagamento,
                historico: `Pagamento ${data.numero_titulo} - ${data.descricao}`,
                valor: -dados.valor_pago,
                tipo_movimento: 'DEBITO',
                origem: 'PAGAMENTO',
                tipo_origem: 'PAGAMENTO',
                lancamento_financeiro_id: id,
                lancamento_id: id,
                lancamento_tipo: 'PAGAR',
            });

            // Atualizar saldo da conta (Decrementar)
            const { data: conta } = await supabase
                .from('contas_bancarias')
                .select('saldo_atual')
                .eq('id', dados.banco_id)
                .single();

            if (conta) {
                await supabase
                    .from('contas_bancarias')
                    .update({ saldo_atual: (conta.saldo_atual || 0) - dados.valor_pago, ultimo_saldo_atualizado_em: new Date() })
                    .eq('id', dados.banco_id);
            }
        }

        return data;
    }

    /**
     * Cancelar conta a pagar
     */
    async cancelar(id: string, motivo: string) {
        const { data, error } = await supabase
            .from('contas_pagar')
            .update({
                status: 'CANCELADO',
                motivo_cancelamento: motivo,
                observacao: `CANCELADO: ${motivo}`,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Relatório de contas vencidas
     */
    async vencidas() {
        const hoje = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('contas_pagar')
            .select(`
        *,
        fornecedor:entities!fornecedor_id(name)
      `)
            .lt('data_vencimento', hoje)
            .neq('status', 'PAGO')
            .neq('status', 'CANCELADO')
            .order('data_vencimento', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Dashboard - resumo financeiro
     */
    async dashboard() {
        const hoje = new Date().toISOString().split('T')[0];
        const mes = new Date().toISOString().substring(0, 7);

        // Total a pagar hoje
        const { data: hoje_data } = await supabase
            .from('contas_pagar')
            .select('valor_saldo')
            .eq('data_vencimento', hoje)
            .eq('status', 'PENDENTE');

        // Total a pagar no mês
        const { data: mes_data } = await supabase
            .from('contas_pagar')
            .select('valor_saldo')
            .like('data_vencimento', `${mes}%`)
            .neq('status', 'PAGO');

        // Total vencidas
        const { data: vencidas_data } = await supabase
            .from('contas_pagar')
            .select('valor_saldo')
            .lt('data_vencimento', hoje)
            .neq('status', 'PAGO');

        const somarValores = (arr: any[]) =>
            arr?.reduce((sum, item) => sum + (item.valor_saldo || 0), 0) || 0;

        return {
            vencimento_hoje: somarValores(hoje_data),
            vencimento_mes: somarValores(mes_data),
            vencidas: somarValores(vencidas_data),
            total_contas: (hoje_data?.length || 0) + (mes_data?.length || 0),
        };
    }

    /**
     * Helpers
     */
    private async gerarNumeroTitulo(): Promise<string> {
        const ano = new Date().getFullYear();
        const { count } = await supabase
            .from('contas_pagar')
            .select('*', { count: 'exact', head: true })
            .like('numero_titulo', `CP-${ano}%`);

        const numero = (count || 0) + 1;
        return `CP-${ano}-${String(numero).padStart(6, '0')}`;
    }

    private async criarMovimentoBancario(conta_id: string, movimento: any) {
        await supabase.from('movimentos_bancarios').insert({
            conta_bancaria_id: conta_id,
            ...movimento,
        });
    }
}

export const paymentService = new PaymentService();
export default paymentService;
