/**
 * Serviço CNAB - Geração de Remessa e Leitura de Retorno
 * Suporta CNAB 240 e CNAB 400
 * Bancos: Banco do Brasil, Bradesco, Itaú, Sicoob, Santander
 */

import { supabase } from '../lib/supabase';
import { createHash } from 'crypto';

interface TituloRemessa {
    id: string;
    nosso_numero: string;
    seu_numero: string;
    valor: number;
    vencimento: string;
    pagador_nome: string;
    pagador_documento: string;
    tipo: 'PAGAR' | 'RECEBER';
}

interface OcorrenciaRetorno {
    codigo: string;
    descricao: string;
    nosso_numero: string;
    valor_pago?: number;
    data_ocorrencia: string;
    data_credito?: string;
}

class CNABService {
    /**
     * Gerar arquivo de REMESSA (pagamentos ou cobranças)
     */
    async gerarRemessa(params: {
        banco_id: string;
        tipo: 'PAGAMENTO' | 'COBRANCA';
        titulos: TituloRemessa[];
    }) {
        // Buscar dados da conta bancária
        const { data: conta } = await supabase
            .from('contas_bancarias')
            .select('*')
            .eq('id', params.banco_id)
            .single();

        if (!conta) throw new Error('Conta bancária não encontrada');

        const layout = conta.layout_cnab || '240';

        // Gerar número sequencial do arquivo
        const { count } = await supabase
            .from('cnab_arquivos')
            .select('*', { count: 'exact', head: true })
            .eq('conta_bancaria_id', params.banco_id)
            .eq('tipo', 'REMESSA');

        const numeroSequencial = (count || 0) + 1;

        // Gerar conteúdo do arquivo baseado no layout
        let conteudo: string;
        if (layout === '240') {
            conteudo = this.gerarCNAB240Remessa(conta, params.titulos, numeroSequencial, params.tipo);
        } else {
            conteudo = this.gerarCNAB400Remessa(conta, params.titulos, numeroSequencial, params.tipo);
        }

        const nomeArquivo = this.gerarNomeArquivo(conta, 'REMESSA', numeroSequencial);
        const hash = createHash('md5').update(conteudo).digest('hex');

        // Salvar registro do arquivo
        const { data: arquivo } = await supabase
            .from('cnab_arquivos')
            .insert({
                conta_bancaria_id: params.banco_id,
                tipo: 'REMESSA',
                layout,
                numero_sequencial: numeroSequencial,
                nome_arquivo: nomeArquivo,
                total_registros: params.titulos.length + 2, // Header + Títulos + Trailer
                total_titulos: params.titulos.length,
                valor_total: params.titulos.reduce((sum, t) => sum + t.valor, 0),
                hash_md5: hash,
            })
            .select()
            .single();

        // Salvar detalhes (cada linha)
        const linhas = conteudo.split('\n');
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            if (!linha.trim()) continue;

            const tipo_registro = linha.charAt(7); // Posição do tipo no CNAB240
            const titulo = params.titulos[i - 1]; // -1 por causa do header

            await supabase.from('cnab_detalhes').insert({
                cnab_arquivo_id: arquivo.id,
                numero_linha: i + 1,
                tipo_registro: tipo_registro === '0' ? 'HEADER' : tipo_registro === '9' ? 'TRAILER' : 'DETALHE',
                conteudo_linha: linha,
                nosso_numero: titulo?.nosso_numero,
                seu_numero: titulo?.seu_numero,
                valor_titulo: titulo?.valor,
                data_vencimento: titulo?.vencimento,
                conta_pagar_id: titulo?.tipo === 'PAGAR' ? titulo.id : undefined,
                conta_receber_id: titulo?.tipo === 'RECEBER' ? titulo.id : undefined,
            });
        }

        // Atualizar títulos com ID da remessa
        const tituloIds = params.titulos.map(t => t.id);
        if (params.tipo === 'PAGAMENTO') {
            await supabase
                .from('contas_pagar')
                .update({ cnab_remessa_id: arquivo.id, status: 'EM_PAGAMENTO' })
                .in('id', tituloIds);
        } else {
            await supabase
                .from('contas_receber')
                .update({ status: 'CONFIRMADO' })
                .in('id', tituloIds);
        }

        return {
            arquivo_id: arquivo.id,
            nome_arquivo: nomeArquivo,
            conteudo,
            numero_sequencial: numeroSequencial,
        };
    }

    /**
     * Processar arquivo de RETORNO do banco
     */
    async processarRetorno(params: {
        banco_id: string;
        arquivo_nome: string;
        conteudo: string;
    }) {
        const { data: conta } = await supabase
            .from('contas_bancarias')
            .select('*')
            .eq('id', params.banco_id)
            .single();

        if (!conta) throw new Error('Conta bancária não encontrada');

        const layout = this.detectarLayout(params.conteudo);
        const hash = createHash('md5').update(params.conteudo).digest('hex');

        // Verificar se arquivo já foi processado
        const { data: jaProcessado } = await supabase
            .from('cnab_arquivos')
            .select('id')
            .eq('hash_md5', hash)
            .single();

        if (jaProcessado) {
            throw new Error('Arquivo já foi processado anteriormente');
        }

        // Parse do arquivo
        const ocorrencias = layout === '240'
            ? this.parseCNAB240Retorno(params.conteudo)
            : this.parseCNAB400Retorno(params.conteudo);

        // Salvar registro do arquivo
        const { data: arquivo } = await supabase
            .from('cnab_arquivos')
            .insert({
                conta_bancaria_id: params.banco_id,
                tipo: 'RETORNO',
                layout,
                numero_sequencial: ocorrencias.length,
                nome_arquivo: params.arquivo_nome,
                total_registros: params.conteudo.split('\n').length,
                total_titulos: ocorrencias.length,
                valor_total: ocorrencias.reduce((sum, o) => sum + (o.valor_pago || 0), 0),
                hash_md5: hash,
                processado: false,
            })
            .select()
            .single();

        // Processar cada ocorrência
        let sucessos = 0;
        let erros = 0;
        const resultados: any[] = [];

        for (const ocorrencia of ocorrencias) {
            try {
                const resultado = await this.processarOcorrencia(ocorrencia, arquivo.id);
                resultados.push({ ...ocorrencia, status: 'SUCESSO', resultado });
                sucessos++;
            } catch (error: any) {
                resultados.push({ ...ocorrencia, status: 'ERRO', erro: error.message });
                erros++;
            }
        }

        // Marcar arquivo como processado
        await supabase
            .from('cnab_arquivos')
            .update({
                processado: true,
                data_processamento: new Date().toISOString(),
                erros_processamento: erros > 0 ? `${erros} erros de ${ocorrencias.length} registros` : undefined,
            })
            .eq('id', arquivo.id);

        return {
            arquivo_id: arquivo.id,
            total: ocorrencias.length,
            sucessos,
            erros,
            resultados,
        };
    }

    /**
     * Gerar CNAB 240 - Remessa
     */
    private gerarCNAB240Remessa(
        conta: any,
        titulos: TituloRemessa[],
        sequencial: number,
        tipo: string
    ): string {
        const linhas: string[] = [];

        // === HEADER DO ARQUIVO (Registro 0) ===
        const header = [
            conta.banco_codigo.padStart(3, '0'),          // 001-003: Código do Banco
            '0000',                                       // 004-007: Lote de Serviço
            '0',                                          // 008-008: Tipo de Registro (0=Header)
            ''.padEnd(9, ' '),                            // 009-017: Uso exclusivo FEBRABAN
            '2',                                          // 018-018: Tipo de Inscrição (2=CNPJ)
            (conta.empresa_cnpj || '').replace(/\D/g, '').padStart(14, '0'), // 019-032: CNPJ
            (conta.convenio_numero || '').padEnd(20, ' '), // 033-052: Convênio
            conta.agencia.padStart(5, '0'),              // 053-057: Agência
            ' ',                                          // 058-058: DV Agência
            conta.conta.padStart(12, '0'),               // 059-070: Conta
            conta.conta_dv[0] || ' ',                    // 071-071: DV Conta
            ' ',                                          // 072-072: DV Ag/Conta
            'TRANSPORTADORA TERRA LTDA'.padEnd(30, ' '),  // 073-102: Nome da Empresa
            conta.banco_nome.padEnd(30, ' '),            // 103-132: Nome do Banco
            ''.padEnd(10, ' '),                          // 133-142: Uso exclusivo
            '1',                                          // 143-143: Código Remessa (1)
            new Date().toISOString().split('T')[0].replace(/-/g, '').substring(2), // 144-151: Data
            new Date().toTimeString().substring(0, 8).replace(/:/g, ''), // 152-157: Hora
            String(sequencial).padStart(6, '0'),         // 158-163: Sequencial
            '103',                                        // 164-166: Versão layout
            '00000',                                      // 167-171: Densidade
            ''.padEnd(69, ' '),                          // 172-240: Uso Banco/FEBRABAN
        ].join('');

        linhas.push(header);

        // === DETALHES (Segmento P + Q para cada título) ===
        titulos.forEach((titulo, index) => {
            // Segmento P (principal)
            const segmentoP = [
                conta.banco_codigo.padStart(3, '0'),
                '0001',                                     // Lote
                '3',                                        // Tipo (3=Detalhe)
                String(index * 2 + 1).padStart(5, '0'),    // Sequencial
                'P',                                        // Segmento P
                ' ',                                        // Uso exclusivo
                '01',                                       // Código movimento (01=Entrada)
                conta.agencia.padStart(5, '0'),
                ' ',
                conta.conta.padStart(12, '0'),
                conta.conta_dv[0] || ' ',
                ' ',
                titulo.nosso_numero.padStart(20, '0'),
                (conta.carteira || '1').padStart(1, '0'),
                '1',                                        // Forma cadastro (1=Com cadastro)
                '1',                                        // Tipo documento (1=Tradicional)
                '2',                                        // Identificação emissão (2=Cliente)
                '2',                                        // Identificação distribuição (2=Cliente)
                titulo.seu_numero.padEnd(15, ' '),
                titulo.vencimento.replace(/-/g, ''),
                String(Math.round(titulo.valor * 100)).padStart(15, '0'), // Valor em centavos
                '00000',                                    // Agência cobradora
                ' ',
                '01',                                       // Espécie título (01=Duplicata)
                'N',                                        // Aceite
                titulo.vencimento.replace(/-/g, ''),
                '0'.repeat(15),                            // Juros
                '0',                                        // Tipo desconto
                '0'.repeat(8),                             // Data desconto
                '0'.repeat(15),                            // Valor desconto
                '0'.repeat(15),                            // Valor IOF
                '0'.repeat(15),                            // Abatimento
                titulo.seu_numero.padEnd(25, ' '),
                '0',                                        // Protestar (0=Não)
                '00',                                       // Prazo
                '0',                                        // Baixar (0=Não)
                '000',
                '00',                                       // Moeda (00=Real)
                '0'.repeat(10),
                ' ',
            ].join('').substring(0, 240).padEnd(240, ' ');

            linhas.push(segmentoP);

            // Segmento Q (sacado/pagador)
            const segmentoQ = [
                conta.banco_codigo.padStart(3, '0'),
                '0001',
                '3',
                String(index * 2 + 2).padStart(5, '0'),
                'Q',
                ' ',
                '01',
                '2',                                        // Tipo inscrição (2=CNPJ)
                titulo.pagador_documento.replace(/\D/g, '').padStart(15, '0'),
                titulo.pagador_nome.substring(0, 40).padEnd(40, ' '),
                ''.padEnd(40, ' '),                        // Endereço
                ''.padEnd(15, ' '),                        // Bairro
                ''.padEnd(8, '0'),                         // CEP
                ''.padEnd(15, ' '),                        // Cidade
                ''.padEnd(2, ' '),                         // UF
                '0',                                        // Tipo inscrição sacador
                ''.padEnd(15, '0'),                        // CPF/CNPJ sacador
                ''.padEnd(40, ' '),                        // Nome sacador
                ''.padEnd(3, ' '),
                ''.padEnd(20, ' '),
                ' ',
            ].join('').substring(0, 240).padEnd(240, ' ');

            linhas.push(segmentoQ);
        });

        // === TRAILER DO ARQUIVO (Registro 9) ===
        const trailer = [
            conta.banco_codigo.padStart(3, '0'),
            '9999',
            '9',
            ''.padEnd(9, ' '),
            String(linhas.length + 1).padStart(6, '0'), // Qtd registros
            String(titulos.length).padStart(6, '0'),    // Qtd títulos
            String(Math.round(titulos.reduce((s, t) => s + t.valor, 0) * 100)).padStart(17, '0'),
            ''.padEnd(199, '0'),
        ].join('').substring(0, 240).padEnd(240, ' ');

        linhas.push(trailer);

        return linhas.join('\n');
    }

    /**
     * Gerar CNAB 400 - Remessa (simplificado)
     */
    private gerarCNAB400Remessa(
        conta: any,
        titulos: TituloRemessa[],
        sequencial: number,
        tipo: string
    ): string {
        // TODO: Implementar CNAB 400
        throw new Error('CNAB 400 não implementado neste exemplo. Use CNAB 240.');
    }

    /**
     * Parse CNAB 240 - Retorno
     */
    private parseCNAB240Retorno(conteudo: string): OcorrenciaRetorno[] {
        const linhas = conteudo.split('\n').filter(l => l.trim());
        const ocorrencias: OcorrenciaRetorno[] = [];

        for (const linha of linhas) {
            const tipoRegistro = linha.charAt(7);

            if (tipoRegistro === '3') { // Detalhe
                const segmento = linha.charAt(13);

                if (segmento === 'T') { // Segmento T = Retorno
                    const ocorrenciaCodigo = linha.substring(15, 17);
                    const nossoNumero = linha.substring(37, 57).trim();
                    const valorPago = parseInt(linha.substring(77, 92)) / 100;
                    const dataOcorrencia = linha.substring(93, 101);
                    const dataCredito = linha.substring(101, 109);

                    ocorrencias.push({
                        codigo: ocorrenciaCodigo,
                        descricao: this.getDescricaoOcorrencia(ocorrenciaCodigo),
                        nosso_numero: nossoNumero,
                        valor_pago: valorPago,
                        data_ocorrencia: this.parseDateCNAB(dataOcorrencia),
                        data_credito: this.parseDateCNAB(dataCredito),
                    });
                }
            }
        }

        return ocorrencias;
    }

    /**
     * Parse CNAB 400 - Retorno
     */
    private parseCNAB400Retorno(conteudo: string): OcorrenciaRetorno[] {
        // TODO: Implementar parse CNAB 400
        return [];
    }

    /**
     * Processar uma ocorrência do retorno
     */
    private async processarOcorrencia(ocorrencia: OcorrenciaRetorno, arquivo_id: string) {
        // Buscar título pelo nosso número
        const { data: tituloReceber } = await supabase
            .from('contas_receber')
            .select('*')
            .eq('nosso_numero', ocorrencia.nosso_numero)
            .single();

        const { data: tituloPagar } = await supabase
            .from('contas_pagar')
            .select('*')
            .eq('nosso_numero', ocorrencia.nosso_numero)
            .single();

        const titulo = tituloReceber || tituloPagar;
        const tabela = tituloReceber ? 'contas_receber' : 'contas_pagar';
        const tipo = tituloReceber ? 'RECEBER' : 'PAGAR';

        if (!titulo) {
            throw new Error(`Título não encontrado: ${ocorrencia.nosso_numero}`);
        }

        // Processar baseado no código de ocorrência
        switch (ocorrencia.codigo) {
            case '06': // Liquidação
                await supabase.from(tabela).update({
                    status: tipo === 'RECEBER' ? 'RECEBIDO' : 'PAGO',
                    [`valor_${tipo === 'RECEBER' ? 'recebido' : 'pago'}`]: ocorrencia.valor_pago,
                    [`data_${tipo === 'RECEBER' ? 'recebimento' : 'pagamento'}`]: ocorrencia.data_credito,
                    cnab_retorno_id: arquivo_id,
                }).eq('id', titulo.id);
                break;

            case '02': // Entrada confirmada
                await supabase.from(tabela).update({
                    status: 'CONFIRMADO',
                    cnab_retorno_id: arquivo_id,
                }).eq('id', titulo.id);
                break;

            case '09': // Baixado
            case '10': // Baixa solicitada
                await supabase.from(tabela).update({
                    status: 'CANCELADO',
                    observacao: `Baixado pelo banco: ${ocorrencia.descricao}`,
                    cnab_retorno_id: arquivo_id,
                }).eq('id', titulo.id);
                break;

            default:
                // Apenas registrar a ocorrência
                await supabase.from('cnab_detalhes').update({
                    ocorrencia_codigo: ocorrencia.codigo,
                    ocorrencia_descricao: ocorrencia.descricao,
                    processado: true,
                    [tipo === 'RECEBER' ? 'conta_receber_id' : 'conta_pagar_id']: titulo.id,
                }).eq('cnab_arquivo_id', arquivo_id)
                    .eq('nosso_numero', ocorrencia.nosso_numero);
        }

        return { titulo_id: titulo.id, ocorrencia: ocorrencia.descricao };
    }

    /**
     * Helpers
     */
    private detectarLayout(conteudo: string): '240' | '400' {
        const primeiraLinha = conteudo.split('\n')[0];
        return primeiraLinha.length >= 240 ? '240' : '400';
    }

    private gerarNomeArquivo(conta: any, tipo: string, sequencial: number): string {
        const data = new Date().toISOString().split('T')[0].replace(/-/g, '');
        return `${tipo}_${conta.banco_codigo}_${sequencial}_${data}.REM`;
    }

    private parseDateCNAB(dataCNAB: string): string {
        if (!dataCNAB || dataCNAB === '00000000') return '';
        const dia = dataCNAB.substring(0, 2);
        const mes = dataCNAB.substring(2, 4);
        const ano = dataCNAB.substring(4, 8);
        return `${ano}-${mes}-${dia}`;
    }

    private getDescricaoOcorrencia(codigo: string): string {
        const map: Record<string, string> = {
            '02': 'Entrada Confirmada',
            '03': 'Entrada Rejeitada',
            '04': 'Transferência de Carteira/Entrada',
            '05': 'Transferência de Carteira/Baixa',
            '06': 'Liquidação',
            '07': 'Confirmação do Recebimento da Instrução de Desconto',
            '08': 'Confirmação do Recebimento do Cancelamento do Desconto',
            '09': 'Baixa',
            '10': 'Baixa Solicitada',
            '11': 'Títulos em Carteira',
            '12': 'Confirmação Recebimento Instrução de Abatimento',
            '13': 'Confirmação Recebimento Cancelamento Abatimento',
            '14': 'Confirmação Recebimento Instrução Alteração de Vencimento',
            '15': 'Franco de Pagamento',
            '17': 'Liquidação Após Baixa',
            '19': 'Confirmação Recebimento Instrução de Protesto',
            '20': 'Confirmação Recebimento Instrução de Sustação/Cancelamento de Protesto',
            '23': 'Remessa a Cartório',
            '24': 'Retirada de Cartório',
            '25': 'Protestado e Baixado',
            '26': 'Instrução Rejeitada',
            '27': 'Confirmação do Pedido de Alteração de Outros Dados',
            '28': 'Débito de Tarifas/Custas',
            '29': 'Ocorrências do Pagador',
            '30': 'Alteração de Dados Rejeitada',
        };
        return map[codigo] || `Ocorrência ${codigo}`;
    }
}

export const cnabService = new CNABService();
export default cnabService;
