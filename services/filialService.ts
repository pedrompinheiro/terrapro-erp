/**
 * Serviço de Filiais (Branches)
 * Consulta a tabela `companies` que armazena as filiais
 */

import { supabase } from '../lib/supabase';

export interface Filial {
    id: string;
    name: string;
    short_name?: string;
    document: string;
    tga_codfilial?: number;
    is_active: boolean;
}

class FilialService {
    async listar(): Promise<Filial[]> {
        const { data, error } = await supabase
            .from('companies')
            .select('id, name, short_name, document, tga_codfilial, is_active')
            .eq('is_active', true)
            .not('tga_codfilial', 'is', null)
            .order('tga_codfilial', { ascending: true });

        if (error) throw error;
        return (data || []) as Filial[];
    }
}

export const filialService = new FilialService();
export default filialService;
