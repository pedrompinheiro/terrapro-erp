
import { supabase } from '../lib/supabase';

export interface ContaBancaria {
    id: string;
    banco_nome: string;
    banco_codigo: string;
    agencia: string;
    conta: string;
    tipo_conta: string;
    saldo_atual: number;
    ativa: boolean;
    padrao: boolean;
    pix_chave?: string;
}

export interface MovimentoBancario {
    id?: string;
    conta_bancaria_id: string;
    data_movimento: string;
    historico: string;
    valor: number;
    tipo_movimento: 'CREDITO' | 'DEBITO';
    origem: string;
    lancamento_financeiro_id?: string;
    lancamento_tipo?: string;
}

class BankService {
    /**
     * Listar todas as contas bancárias ativas
     */
    async listar(filial_id?: string) {
        let query = supabase
            .from('contas_bancarias')
            .select('*')
            .eq('ativa', true)
            .order('padrao', { ascending: false });

        if (filial_id) {
            query = query.eq('filial_id', filial_id);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as ContaBancaria[];
    }

    /**
     * Buscar saldo atual de uma conta
     */
    async getSaldo(id: string) {
        const { data, error } = await supabase
            .from('contas_bancarias')
            .select('saldo_atual')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data?.saldo_atual || 0;
    }

    /**
     * Atualizar saldo manualmente (uso interno ou correção)
     */
    async atualizarSaldo(id: string, novoSaldo: number) {
        const { error } = await supabase
            .from('contas_bancarias')
            .update({ saldo_atual: novoSaldo, ultimo_saldo_atualizado_em: new Date() })
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Criar conta bancária
     */
    async criar(conta: Omit<ContaBancaria, 'id'>) {
        const { data, error } = await supabase
            .from('contas_bancarias')
            .insert(conta)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Excluir (lógica) conta bancária
     */
    async excluir(id: string) {
        const { error } = await supabase
            .from('contas_bancarias')
            .update({ ativa: false }) // Soft delete
            .eq('id', id);

        if (error) throw error;
    }
}

export const bankService = new BankService();
export default bankService;
