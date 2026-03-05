/**
 * Servico de Transferencias entre Contas
 * Gera 2 movimentos bancarios (debito na origem, credito no destino)
 */

import { supabase } from '../lib/supabase';

export interface Transferencia {
    id?: string;
    data_transferencia: string;
    conta_origem_id: string;
    conta_destino_id: string;
    valor: number;
    descricao?: string;
    movimento_debito_id?: string;
    movimento_credito_id?: string;
    created_by?: string;
    created_at?: string;
}

class TransferenciaService {
    /**
     * Listar transferencias
     */
    async listar(filtros?: { data_inicio?: string; data_fim?: string }) {
        let query = supabase
            .from('transferencias')
            .select(`
                *,
                conta_origem:contas_bancarias!conta_origem_id(id, banco_nome, agencia, conta),
                conta_destino:contas_bancarias!conta_destino_id(id, banco_nome, agencia, conta)
            `)
            .order('data_transferencia', { ascending: false });

        if (filtros?.data_inicio) {
            query = query.gte('data_transferencia', filtros.data_inicio);
        }
        if (filtros?.data_fim) {
            query = query.lte('data_transferencia', filtros.data_fim);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    /**
     * Realizar transferencia entre contas
     * Gera 2 movimentos bancarios e atualiza saldos
     */
    async transferir(dados: {
        conta_origem_id: string;
        conta_destino_id: string;
        valor: number;
        data_transferencia: string;
        descricao?: string;
    }) {
        if (dados.conta_origem_id === dados.conta_destino_id) {
            throw new Error('Conta de origem e destino devem ser diferentes');
        }
        if (dados.valor <= 0) {
            throw new Error('Valor da transferencia deve ser positivo');
        }

        // Buscar nomes das contas para historico
        const { data: contaOrigem } = await supabase
            .from('contas_bancarias')
            .select('banco_nome, saldo_atual')
            .eq('id', dados.conta_origem_id)
            .single();

        const { data: contaDestino } = await supabase
            .from('contas_bancarias')
            .select('banco_nome, saldo_atual')
            .eq('id', dados.conta_destino_id)
            .single();

        if (!contaOrigem || !contaDestino) {
            throw new Error('Conta bancaria nao encontrada');
        }

        // 1. Criar movimento de DEBITO na conta de origem
        const { data: movDebito, error: errDebito } = await supabase
            .from('movimentos_bancarios')
            .insert({
                conta_bancaria_id: dados.conta_origem_id,
                data_movimento: dados.data_transferencia,
                historico: `Transferencia para ${contaDestino.banco_nome}${dados.descricao ? ' - ' + dados.descricao : ''}`,
                valor: -dados.valor,
                tipo_movimento: 'DEBITO',
                origem: 'TRANSFERENCIA',
                tipo_origem: 'TRANSFERENCIA',
                saldo_apos: (contaOrigem.saldo_atual || 0) - dados.valor,
            })
            .select()
            .single();

        if (errDebito) throw errDebito;

        // 2. Criar movimento de CREDITO na conta de destino
        const { data: movCredito, error: errCredito } = await supabase
            .from('movimentos_bancarios')
            .insert({
                conta_bancaria_id: dados.conta_destino_id,
                data_movimento: dados.data_transferencia,
                historico: `Transferencia de ${contaOrigem.banco_nome}${dados.descricao ? ' - ' + dados.descricao : ''}`,
                valor: dados.valor,
                tipo_movimento: 'CREDITO',
                origem: 'TRANSFERENCIA',
                tipo_origem: 'TRANSFERENCIA',
                saldo_apos: (contaDestino.saldo_atual || 0) + dados.valor,
            })
            .select()
            .single();

        if (errCredito) throw errCredito;

        // 3. Atualizar saldos
        await supabase
            .from('contas_bancarias')
            .update({ saldo_atual: (contaOrigem.saldo_atual || 0) - dados.valor })
            .eq('id', dados.conta_origem_id);

        await supabase
            .from('contas_bancarias')
            .update({ saldo_atual: (contaDestino.saldo_atual || 0) + dados.valor })
            .eq('id', dados.conta_destino_id);

        // 4. Registrar transferencia
        const { data: transferencia, error: errTransf } = await supabase
            .from('transferencias')
            .insert({
                data_transferencia: dados.data_transferencia,
                conta_origem_id: dados.conta_origem_id,
                conta_destino_id: dados.conta_destino_id,
                valor: dados.valor,
                descricao: dados.descricao,
                movimento_debito_id: movDebito.id,
                movimento_credito_id: movCredito.id,
            })
            .select()
            .single();

        if (errTransf) throw errTransf;

        return transferencia;
    }
}

export const transferenciaService = new TransferenciaService();
export default transferenciaService;
