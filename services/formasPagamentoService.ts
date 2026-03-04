/**
 * Servico de Formas de Pagamento/Recebimento
 * CRUD para a tabela formas_pagamento
 */

import { supabase } from '../lib/supabase';

export interface FormaPagamento {
    id?: string;
    codigo: string;
    nome: string;
    tipo: 'VISTA' | 'PRAZO' | 'CARTAO' | 'TRANSFERENCIA';
    gera_movimento_bancario: boolean;
    conta_bancaria_padrao_id?: string | null;
    ativo: boolean;
    created_at?: string;
}

class FormasPagamentoService {
    /**
     * Listar formas de pagamento ativas
     */
    async listar(apenasAtivas = true) {
        let query = supabase
            .from('formas_pagamento')
            .select('*, conta_bancaria_padrao:contas_bancarias!conta_bancaria_padrao_id(id, banco_nome)')
            .order('nome', { ascending: true });

        if (apenasAtivas) {
            query = query.eq('ativo', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as FormaPagamento[];
    }

    /**
     * Buscar por codigo
     */
    async buscarPorCodigo(codigo: string) {
        const { data, error } = await supabase
            .from('formas_pagamento')
            .select('*')
            .eq('codigo', codigo)
            .single();

        if (error) throw error;
        return data as FormaPagamento;
    }

    /**
     * Criar nova forma de pagamento
     */
    async criar(forma: Omit<FormaPagamento, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('formas_pagamento')
            .insert(forma)
            .select()
            .single();

        if (error) throw error;
        return data as FormaPagamento;
    }

    /**
     * Atualizar forma de pagamento
     */
    async atualizar(id: string, dados: Partial<FormaPagamento>) {
        const { data, error } = await supabase
            .from('formas_pagamento')
            .update(dados)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as FormaPagamento;
    }

    /**
     * Desativar forma de pagamento (soft delete)
     */
    async desativar(id: string) {
        const { error } = await supabase
            .from('formas_pagamento')
            .update({ ativo: false })
            .eq('id', id);

        if (error) throw error;
    }
}

export const formasPagamentoService = new FormasPagamentoService();
export default formasPagamentoService;
