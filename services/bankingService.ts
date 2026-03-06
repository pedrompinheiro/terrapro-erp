/**
 * Serviço de Conciliação Bancária
 * Importa extratos OFX/CSV e faz matching automático com lançamentos
 */

import { supabase } from '../lib/supabase';

interface MovimentoBancario {
    conta_bancaria_id: string;
    data_movimento: string;
    historico: string;
    valor: number;
    numero_documento?: string;
    tipo_movimento: 'DEBITO' | 'CREDITO' | 'TARIFA' | 'JUROS';
    origem: 'EXTRATO_OFX' | 'EXTRATO_CSV' | 'MANUAL';
}

interface SugestaoConciliacao {
    movimento_id: string;
    lancamento_id: string;
    lancamento_tipo: 'PAGAR' | 'RECEBER';
    score_total: number;
    motivo: string;
}

class BankingService {
    /**
     * Importar extrato OFX
     */
    async importarOFX(arquivo: File, conta_id: string) {
        const conteudo = await arquivo.text();
        const movimentos = this.parseOFX(conteudo);

        const importados: any[] = [];

        for (const mov of movimentos) {
            // Gerar hash único para evitar duplicatas
            const hash = this.gerarHash(conta_id, mov);

            // Verificar se já existe na tabela extrato_bancario
            const { data: existe } = await supabase
                .from('extrato_bancario')
                .select('id')
                .eq('hash_linha', hash)
                .single();

            if (existe) continue; // Pular duplicata

            // Gravar em extrato_bancario (tabela de PROVA do banco)
            const { data } = await supabase
                .from('extrato_bancario')
                .insert({
                    conta_bancaria_id: conta_id,
                    data_movimento: mov.data_movimento,
                    historico: mov.historico,
                    valor: mov.valor,
                    numero_documento: mov.numero_documento,
                    tipo_movimento: mov.tipo_movimento === 'CREDITO' ? 'CREDITO' : 'DEBITO',
                    origem: 'OFX',
                    hash_linha: hash,
                })
                .select()
                .single();

            if (data) importados.push(data);
        }

        return {
            total: movimentos.length,
            importados: importados.length,
            duplicatas: movimentos.length - importados.length,
            movimentos: importados,
        };
    }

    /**
     * Importar extrato CSV
     */
    async importarCSV(arquivo: File, conta_id: string, config: {
        separador: string;
        colunas: {
            data: number;
            historico: number;
            valor: number;
            documento?: number;
        };
    }) {
        const conteudo = await arquivo.text();
        const linhas = conteudo.split('\n');
        const movimentos: MovimentoBancario[] = [];

        // Pular header
        for (let i = 1; i < linhas.length; i++) {
            const linha = linhas[i];
            if (!linha.trim()) continue;

            const colunas = linha.split(config.separador);

            const data = this.parseDataCSV(colunas[config.colunas.data]);
            const historico = colunas[config.colunas.historico].trim();
            const valorStr = colunas[config.colunas.valor].replace(/[^\d,-]/g, '').replace(',', '.');
            const valor = parseFloat(valorStr);
            const documento = config.colunas.documento
                ? colunas[config.colunas.documento].trim()
                : undefined;

            movimentos.push({
                conta_bancaria_id: conta_id,
                data_movimento: data,
                historico,
                valor,
                numero_documento: documento,
                tipo_movimento: valor >= 0 ? 'CREDITO' : 'DEBITO',
                origem: 'EXTRATO_CSV',
            });
        }

        const importados: any[] = [];

        for (const mov of movimentos) {
            const hash = this.gerarHash(conta_id, mov);

            // Verificar se já existe na tabela extrato_bancario
            const { data: existe } = await supabase
                .from('extrato_bancario')
                .select('id')
                .eq('hash_linha', hash)
                .single();

            if (existe) continue;

            // Gravar em extrato_bancario (tabela de PROVA do banco)
            const { data } = await supabase
                .from('extrato_bancario')
                .insert({
                    conta_bancaria_id: conta_id,
                    data_movimento: mov.data_movimento,
                    historico: mov.historico,
                    valor: mov.valor,
                    numero_documento: mov.numero_documento,
                    tipo_movimento: mov.tipo_movimento === 'CREDITO' ? 'CREDITO' : 'DEBITO',
                    origem: 'CSV',
                    hash_linha: hash,
                })
                .select()
                .single();

            if (data) importados.push(data);
        }

        return {
            total: movimentos.length,
            importados: importados.length,
            duplicatas: movimentos.length - importados.length,
            movimentos: importados,
        };
    }

    /**
     * Conciliação automática com IA
     */
    async conciliarAutomatico(params: {
        conta_bancaria_id: string;
        data_inicio: string;
        data_fim: string;
    }) {
        // Criar registro de conciliação
        const { data: conciliacao } = await supabase
            .from('conciliacoes')
            .insert({
                conta_bancaria_id: params.conta_bancaria_id,
                data_inicial: params.data_inicio,
                data_final: params.data_fim,
                status: 'EM_ANDAMENTO',
            })
            .select()
            .single();

        if (!conciliacao) throw new Error('Erro ao criar conciliação');

        // Buscar itens do extrato importado não conciliados
        const { data: movimentos } = await supabase
            .from('extrato_bancario')
            .select('*')
            .eq('conta_bancaria_id', params.conta_bancaria_id)
            .gte('data_movimento', params.data_inicio)
            .lte('data_movimento', params.data_fim)
            .eq('conciliado', false);

        if (!movimentos || movimentos.length === 0) {
            return { conciliacao_id: conciliacao.id, sugestoes: [] };
        }

        const sugestoes: SugestaoConciliacao[] = [];

        for (const movimento of movimentos) {
            const sugestao = await this.encontrarMatch(movimento);
            if (sugestao && sugestao.score_total >= 60) {
                // Salvar sugestão
                await supabase.from('conciliacao_sugestoes').insert({
                    conciliacao_id: conciliacao.id,
                    movimento_bancario_id: movimento.id,
                    lancamento_id: sugestao.lancamento_id,
                    lancamento_tipo: sugestao.lancamento_tipo,
                    score_valor: sugestao.score_valor,
                    score_data: sugestao.score_data,
                    score_documento: sugestao.score_documento,
                    status: 'PENDENTE',
                });

                sugestoes.push(sugestao);
            }
        }

        // Atualizar conciliação
        await supabase
            .from('conciliacoes')
            .update({
                total_movimentos: movimentos.length,
                movimentos_conciliados: sugestoes.length,
                percentual_conciliado: (sugestoes.length / movimentos.length) * 100,
            })
            .eq('id', conciliacao.id);

        return {
            conciliacao_id: conciliacao.id,
            total_movimentos: movimentos.length,
            sugestoes: sugestoes.length,
            percentual: ((sugestoes.length / movimentos.length) * 100).toFixed(1),
        };
    }

    /**
     * Encontrar match para um item do extrato bancario
     * Conecta extrato_bancario.movimento_vinculado_id -> movimentos_bancarios.id
     */
    private async encontrarMatch(extrato: any): Promise<any> {
        // Buscar movimentos internos nao conciliados na mesma conta
        const dataInicio = this.subtrairDias(extrato.data_movimento, 5);
        const dataFim = this.adicionarDias(extrato.data_movimento, 5);

        const { data: movimentos } = await supabase
            .from('movimentos_bancarios')
            .select('*')
            .eq('conta_bancaria_id', extrato.conta_bancaria_id)
            .gte('data_movimento', dataInicio)
            .lte('data_movimento', dataFim)
            .eq('conciliado', false);

        if (!movimentos || movimentos.length === 0) return null;

        let melhorMatch: any = null;
        let melhorScore = 0;

        for (const mov of movimentos) {
            const scores = this.calcularScores(extrato, mov);
            const scoreTotal = scores.valor + scores.data + scores.documento;

            if (scoreTotal > melhorScore) {
                melhorScore = scoreTotal;
                melhorMatch = {
                    movimento_id: mov.id,
                    lancamento_id: mov.lancamento_id || mov.lancamento_financeiro_id,
                    lancamento_tipo: mov.lancamento_tipo || 'PAGAR',
                    score_valor: scores.valor,
                    score_data: scores.data,
                    score_documento: scores.documento,
                    score_total: scoreTotal,
                    motivo: scores.motivo,
                };
            }
        }

        return melhorMatch;
    }

    /**
     * Calcular scores de matching
     */
    private calcularScores(movimento: any, lancamento: any) {
        let scoreValor = 0;
        let scoreData = 0;
        let scoreDocumento = 0;
        const motivos: string[] = [];

        // Score de valor (0-50 pontos)
        const valorMov = Math.abs(movimento.valor);
        const valorLanc = lancamento.valor_saldo || lancamento.valor_original;
        const diferencaValor = Math.abs(valorMov - Math.abs(valorLanc));
        const percentualDif = (diferencaValor / Math.abs(valorLanc)) * 100;

        if (percentualDif === 0) {
            scoreValor = 50;
            motivos.push('Valor exato');
        } else if (percentualDif < 1) {
            scoreValor = 45;
            motivos.push('Valor quase exato');
        } else if (percentualDif < 5) {
            scoreValor = 30;
            motivos.push('Valor similar');
        } else if (percentualDif < 10) {
            scoreValor = 15;
        }

        // Score de data (0-30 pontos)
        const diasDif = Math.abs(
            this.diferencaDias(movimento.data_movimento, lancamento.data_vencimento)
        );

        if (diasDif === 0) {
            scoreData = 30;
            motivos.push('Data exata');
        } else if (diasDif <= 2) {
            scoreData = 25;
            motivos.push('Data próxima');
        } else if (diasDif <= 5) {
            scoreData = 15;
        } else if (diasDif <= 10) {
            scoreData = 5;
        }

        // Score de documento (0-20 pontos)
        if (movimento.numero_documento && lancamento.numero_documento) {
            if (movimento.numero_documento === lancamento.numero_documento) {
                scoreDocumento = 20;
                motivos.push('Documento idêntico');
            } else if (this.similaridade(movimento.numero_documento, lancamento.numero_documento) > 0.8) {
                scoreDocumento = 10;
                motivos.push('Documento similar');
            }
        }

        return {
            valor: scoreValor,
            data: scoreData,
            documento: scoreDocumento,
            motivo: motivos.join(', '),
        };
    }

    /**
     * Aprovar sugestão de conciliação
     */
    async aprovarSugestao(sugestao_id: string) {
        const { data: sugestao } = await supabase
            .from('conciliacao_sugestoes')
            .select('*')
            .eq('id', sugestao_id)
            .single();

        if (!sugestao) throw new Error('Sugestao nao encontrada');

        // Marcar item do extrato como conciliado e vincular ao movimento interno
        await supabase
            .from('extrato_bancario')
            .update({
                conciliado: true,
                movimento_vinculado_id: sugestao.movimento_bancario_id,
                conciliado_em: new Date().toISOString(),
            })
            .eq('id', sugestao.extrato_id || sugestao.movimento_bancario_id);

        // Marcar movimento interno como conciliado
        await supabase
            .from('movimentos_bancarios')
            .update({
                conciliado: true,
                conciliado_em: new Date().toISOString(),
            })
            .eq('id', sugestao.movimento_bancario_id);

        // Marcar lancamento financeiro como conciliado
        if (sugestao.lancamento_id) {
            const tabela = sugestao.lancamento_tipo === 'RECEBER' ? 'contas_receber' : 'contas_pagar';
            await supabase
                .from(tabela)
                .update({ conciliado: true })
                .eq('id', sugestao.lancamento_id);
        }

        // Marcar sugestao como aceita
        await supabase
            .from('conciliacao_sugestoes')
            .update({ status: 'ACEITA', aceita_em: new Date().toISOString() })
            .eq('id', sugestao_id);

        return { sucesso: true };
    }

    /**
     * Parse OFX (simplificado)
     */
    private parseOFX(conteudo: string): MovimentoBancario[] {
        const movimentos: MovimentoBancario[] = [];

        // Regex para encontrar transações
        const transacoes = conteudo.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/g) || [];

        for (const trn of transacoes) {
            const tipo = this.extrairTag(trn, 'TRNTYPE');
            const data = this.extrairTag(trn, 'DTPOSTED');
            const valor = parseFloat(this.extrairTag(trn, 'TRNAMT'));
            const memo = this.extrairTag(trn, 'MEMO');
            const checknum = this.extrairTag(trn, 'CHECKNUM');

            movimentos.push({
                conta_bancaria_id: '', // Será preenchido depois
                data_movimento: this.parseDataOFX(data),
                historico: memo,
                valor,
                numero_documento: checknum,
                tipo_movimento: valor >= 0 ? 'CREDITO' : 'DEBITO',
                origem: 'EXTRATO_OFX',
            });
        }

        return movimentos;
    }

    /**
     * Helpers
     */
    private extrairTag(xml: string, tag: string): string {
        const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
        const match = xml.match(regex);
        return match ? match[1].trim() : '';
    }

    private parseDataOFX(data: string): string {
        // OFX date format: YYYYMMDD
        const ano = data.substring(0, 4);
        const mes = data.substring(4, 6);
        const dia = data.substring(6, 8);
        return `${ano}-${mes}-${dia}`;
    }

    private parseDataCSV(data: string): string {
        // Assumindo formato DD/MM/YYYY
        const partes = data.split('/');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    private gerarHash(conta_id: string, mov: any): string {
        const str = `${conta_id}|${mov.data_movimento}|${mov.valor}|${mov.historico}`;
        // Simple hash (em produção usar crypto)
        return btoa(str).substring(0, 64);
    }

    private subtrairDias(data: string, dias: number): string {
        const d = new Date(data);
        d.setDate(d.getDate() - dias);
        return d.toISOString().split('T')[0];
    }

    private adicionarDias(data: string, dias: number): string {
        const d = new Date(data);
        d.setDate(d.getDate() + dias);
        return d.toISOString().split('T')[0];
    }

    private diferencaDias(data1: string, data2: string): number {
        const d1 = new Date(data1);
        const d2 = new Date(data2);
        return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
    }

    private similaridade(str1: string, str2: string): number {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();
        let matches = 0;
        for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
            if (s1[i] === s2[i]) matches++;
        }
        return matches / Math.max(s1.length, s2.length);
    }
}

export const bankingService = new BankingService();
export default bankingService;
