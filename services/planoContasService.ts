/**
 * Servico de Plano de Contas Hierarquico
 * CRUD para a tabela plano_contas
 */

import { supabase } from '../lib/supabase';

export interface PlanoContas {
    id?: string;
    codigo: string;
    nome: string;
    tipo: 'ATIVO' | 'PASSIVO' | 'RECEITA' | 'DESPESA' | 'PATRIMONIO';
    natureza: 'DEBITO' | 'CREDITO';
    nivel: number;
    conta_pai_id?: string | null;
    aceita_lancamento: boolean;
    ativo: boolean;
    created_at?: string;
    updated_at?: string;
    // Relacao
    conta_pai?: PlanoContas | null;
    filhos?: PlanoContas[];
}

class PlanoContasService {
    /**
     * Listar plano de contas (flat)
     */
    async listar(apenasAtivos = true) {
        let query = supabase
            .from('plano_contas')
            .select('*, conta_pai:plano_contas!conta_pai_id(id, codigo, nome)')
            .order('codigo', { ascending: true });

        if (apenasAtivos) {
            query = query.eq('ativo', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as PlanoContas[];
    }

    /**
     * Listar hierarquicamente (arvore)
     */
    async listarHierarquico() {
        const contas = await this.listar();
        return this.construirArvore(contas);
    }

    /**
     * Listar apenas contas lancaveis (aceita_lancamento = true)
     */
    async listarLancaveis(tipo?: string) {
        let query = supabase
            .from('plano_contas')
            .select('id, codigo, nome, tipo, natureza')
            .eq('aceita_lancamento', true)
            .eq('ativo', true)
            .order('codigo', { ascending: true });

        if (tipo) {
            query = query.eq('tipo', tipo);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    /**
     * Buscar por ID
     */
    async buscarPorId(id: string) {
        const { data, error } = await supabase
            .from('plano_contas')
            .select('*, conta_pai:plano_contas!conta_pai_id(id, codigo, nome)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as PlanoContas;
    }

    /**
     * Criar nova conta
     */
    async criar(conta: Omit<PlanoContas, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('plano_contas')
            .insert(conta)
            .select()
            .single();

        if (error) throw error;
        return data as PlanoContas;
    }

    /**
     * Atualizar conta
     */
    async atualizar(id: string, dados: Partial<PlanoContas>) {
        const { data, error } = await supabase
            .from('plano_contas')
            .update(dados)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as PlanoContas;
    }

    /**
     * Desativar conta (soft delete)
     */
    async desativar(id: string) {
        const { error } = await supabase
            .from('plano_contas')
            .update({ ativo: false })
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Construir arvore hierarquica a partir de lista flat
     */
    private construirArvore(contas: PlanoContas[]): PlanoContas[] {
        const mapa = new Map<string, PlanoContas>();
        const raizes: PlanoContas[] = [];

        contas.forEach(c => {
            mapa.set(c.id!, { ...c, filhos: [] });
        });

        contas.forEach(c => {
            const node = mapa.get(c.id!)!;
            if (c.conta_pai_id && mapa.has(c.conta_pai_id)) {
                mapa.get(c.conta_pai_id)!.filhos!.push(node);
            } else {
                raizes.push(node);
            }
        });

        return raizes;
    }
}

export const planoContasService = new PlanoContasService();
export default planoContasService;
