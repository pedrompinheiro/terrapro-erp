/**
 * Serviço de Contas a Receber
 * Gerencia clientes, faturas, recebimentos, recorrências e cobrança
 */

import { supabase } from '../lib/supabase';

export interface ContaReceber {
    id?: string;
    numero_titulo: string;
    cliente_id: string;
    cliente_nome: string;
    valor_original: number;
    valor_juros?: number;
    valor_multa?: number;
    valor_desconto?: number;
    valor_recebido?: number;
    valor_saldo?: number;
    data_emissao: string;
    data_vencimento: string;
    data_recebimento?: string;
    plano_contas_id?: string;
    centro_custo_id?: string;
    categoria?: string;
    status: 'PENDENTE' | 'CONFIRMADO' | 'RECEBIDO' | 'CANCELADO' | 'VENCIDO' | 'INADIMPLENTE';
    forma_recebimento?: string;
    banco_id?: string;
    nosso_numero?: string;
    pix_qrcode?: string;
    pix_txid?: string;
    dias_atraso?: number;
    taxa_juros_dia?: number;
    percentual_multa?: number;
    descricao: string;
    observacao?: string;
    numero_documento?: string;
    parcela_numero?: number;
    parcela_total?: number;
    recorrente?: boolean;
    recorrencia_dia?: number;
    contrato_id?: string;
    nota_fiscal_id?: string;
    conciliado?: boolean;
}

class ReceivableService {
    /**
     * Listar contas a receber
     */
    async listar(filtros?: {
        cliente_id?: string;
        status?: string;
        vencidas?: boolean;
        inadimplentes?: boolean;
        recorrentes?: boolean;
    }) {
        let query = supabase
            .from('contas_receber')
            .select(`
        *,
        cliente:entities!cliente_id(id, name, document, inadimplente),
        plano_contas:plano_contas(codigo, nome),
        centro_custo:centros_custo(codigo, nome)
      `)
            .order('data_vencimento', { ascending: false });

        if (filtros?.cliente_id) {
            query = query.eq('cliente_id', filtros.cliente_id);
        }

        if (filtros?.status) {
            query = query.eq('status', filtros.status);
        }

        if (filtros?.vencidas) {
            query = query.lt('data_vencimento', new Date().toISOString().split('T')[0])
                .neq('status', 'RECEBIDO');
        }

        if (filtros?.inadimplentes) {
            query = query.eq('status', 'INADIMPLENTE');
        }

        if (filtros?.recorrentes) {
            query = query.eq('recorrente', true);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    /**
     * Criar nova conta a receber
     */
    async criar(conta: ContaReceber) {
        if (!conta.numero_titulo) {
            conta.numero_titulo = await this.gerarNumeroTitulo();
        }

        // Configurar juros padrão se não fornecido
        if (!conta.taxa_juros_dia) conta.taxa_juros_dia = 0.0333; // 1% a.m.
        if (!conta.percentual_multa) conta.percentual_multa = 2.0;

        const { data, error } = await supabase
            .from('contas_receber')
            .insert(conta)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Criar cobrança recorrente (contratos mensais)
     */
    async criarRecorrente(dados: {
        cliente_id: string;
        cliente_nome: string;
        descricao: string;
        valor_mensal: number;
        dia_vencimento: number;
        plano_contas_id?: string;
        centro_custo_id?: string;
        contrato_id?: string;
    }) {
        const conta = await this.criar({
            ...dados,
            numero_titulo: '', // Será gerado automaticamente
            valor_original: dados.valor_mensal,
            data_emissao: new Date().toISOString().split('T')[0],
            data_vencimento: this.calcularProximoVencimento(dados.dia_vencimento),
            status: 'PENDENTE',
            recorrente: true,
            recorrencia_dia: dados.dia_vencimento,
        });

        return conta;
    }

    /**
     * Gerar faturas recorrentes do mês
     */
    async gerarFaturasRecorrentes(mes?: string) {
        // Buscar todos os títulos recorrentes
        const { data: recorrentes } = await supabase
            .from('contas_receber')
            .select('*')
            .eq('recorrente', true)
            .neq('status', 'CANCELADO');

        if (!recorrentes || recorrentes.length === 0) return [];

        const mesReferencia = mes || new Date().toISOString().substring(0, 7);
        const faturasGeradas: any[] = [];

        for (const titulo of recorrentes) {
            // Verificar se já existe fatura para este mês
            const { data: jaExiste } = await supabase
                .from('contas_receber')
                .select('id')
                .eq('contrato_id', titulo.contrato_id)
                .like('data_vencimento', `${mesReferencia}%`)
                .single();

            if (jaExiste) continue; // Já foi gerada

            // Calcular data de vencimento
            const dataVencimento = this.calcularVencimentoMes(
                mesReferencia,
                titulo.recorrencia_dia
            );

            // Criar nova fatura
            const novaFatura = await this.criar({
                ...titulo,
                id: undefined,
                numero_titulo: '',
                data_emissao: new Date().toISOString().split('T')[0],
                data_vencimento: dataVencimento,
                status: 'PENDENTE',
                valor_recebido: 0,
                valor_juros: 0,
                valor_multa: 0,
                descricao: `${titulo.descricao} - ${this.formatarMes(mesReferencia)}`,
            });

            faturasGeradas.push(novaFatura);
        }

        return faturasGeradas;
    }

    /**
     * Efetuar recebimento
     */
    async receber(id: string, dados: {
        valor_recebido: number;
        data_recebimento: string;
        forma_recebimento: string;
        banco_id?: string;
        valor_desconto?: number;
        observacao?: string;
    }) {
        // Buscar título
        const { data: titulo } = await supabase
            .from('contas_receber')
            .select('*')
            .eq('id', id)
            .single();

        if (!titulo) throw new Error('Título não encontrado');

        // Atualizar título
        const { data, error } = await supabase
            .from('contas_receber')
            .update({
                valor_recebido: dados.valor_recebido,
                valor_desconto: dados.valor_desconto || 0,
                data_recebimento: dados.data_recebimento,
                forma_recebimento: dados.forma_recebimento,
                banco_id: dados.banco_id,
                observacao: dados.observacao,
                status: 'RECEBIDO',
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Criar movimento bancário e atualizar saldo
        if (dados.banco_id) {
            const { error: movError } = await supabase.from('movimentos_bancarios').insert({
                conta_bancaria_id: dados.banco_id,
                data_movimento: dados.data_recebimento,
                historico: `Recebimento ${titulo.numero_titulo} - ${titulo.descricao}`,
                valor: dados.valor_recebido,
                tipo_movimento: 'CREDITO',
                origem: 'RECEBIMENTO',
                lancamento_financeiro_id: id,
                lancamento_tipo: 'RECEBER',
            });

            if (!movError) {
                // Atualizar saldo da conta (Incrementar)
                const { data: conta } = await supabase
                    .from('contas_bancarias')
                    .select('saldo_atual')
                    .eq('id', dados.banco_id)
                    .single();

                if (conta) {
                    await supabase
                        .from('contas_bancarias')
                        .update({ saldo_atual: (conta.saldo_atual || 0) + dados.valor_recebido, ultimo_saldo_atualizado_em: new Date() })
                        .eq('id', dados.banco_id);
                }
            }
        }

        // Se cliente estava inadimplente, verificar se pode remover flag
        await this.verificarInadimplencia(titulo.cliente_id);

        return data;
    }

    /**
     * Gerar boleto/PIX
     */
    async gerarBoleto(id: string) {
        const { data: titulo } = await supabase
            .from('contas_receber')
            .select('*')
            .eq('id', id)
            .single();

        if (!titulo) throw new Error('Título não encontrado');

        // INTEGRAÇÃO COM API DE BOLETO (exemplo genérico)
        // Aqui você integraria com Sicoob, BB, Inter, etc
        const boletoResponse = await this.integracaoBoleto({
            nosso_numero: titulo.nosso_numero || await this.gerarNossoNumero(titulo.banco_id!),
            valor: titulo.valor_saldo,
            vencimento: titulo.data_vencimento,
            pagador: {
                nome: titulo.cliente_nome,
                documento: '', // Buscar da entities
            },
            descricao: titulo.descricao,
        });

        // Atualizar título com dados do boleto
        await supabase
            .from('contas_receber')
            .update({
                nosso_numero: boletoResponse.nosso_numero,
                linha_digitavel: boletoResponse.linha_digitavel,
                codigo_barras: boletoResponse.codigo_barras,
            })
            .eq('id', id);

        return boletoResponse;
    }

    /**
     * Gerar QR Code PIX
     */
    async gerarPixQRCode(id: string) {
        const { data: titulo } = await supabase
            .from('contas_receber')
            .select('*')
            .eq('id', id)
            .single();

        if (!titulo) throw new Error('Título não encontrado');

        // INTEGRAÇÃO COM API PIX (Bacen ou banco)
        const pixResponse = await this.integracaoPix({
            valor: titulo.valor_saldo,
            chave_pix: '', // Chave PIX da empresa
            txid: this.gerarTxId(),
            descricao: titulo.descricao,
        });

        // Atualizar com QR Code
        await supabase
            .from('contas_receber')
            .update({
                pix_qrcode: pixResponse.qrcode,
                pix_txid: pixResponse.txid,
            })
            .eq('id', id);

        return pixResponse;
    }

    /**
     * Enviar cobrança por email/WhatsApp
     */
    async enviarCobranca(id: string, metodo: 'EMAIL' | 'WHATSAPP') {
        const { data: titulo } = await supabase
            .from('contas_receber')
            .select(`
        *,
        cliente:entities!cliente_id(name, email, phone)
      `)
            .eq('id', id)
            .single();

        if (!titulo) throw new Error('Título não encontrado');

        const mensagem = `
🔔 *Cobrança - ${titulo.numero_titulo}*

Olá ${titulo.cliente.name},

Você possui um título em aberto:

💰 Valor: R$ ${titulo.valor_saldo.toFixed(2)}
📅 Vencimento: ${new Date(titulo.data_vencimento).toLocaleDateString('pt-BR')}
📝 Descrição: ${titulo.descricao}

${titulo.pix_qrcode ? '💸 Pague via PIX com o QR Code em anexo' : ''}
${titulo.linha_digitavel ? `🏦 Linha digitável: ${titulo.linha_digitavel}` : ''}

Att,
Equipe Financeira
    `.trim();

        if (metodo === 'EMAIL') {
            // Integração com serviço de email
            await this.enviarEmail(titulo.cliente.email, 'Cobrança Pendente', mensagem);
        } else {
            // Integração com WhatsApp (Evolution API)
            await this.enviarWhatsApp(titulo.cliente.phone, mensagem, titulo.pix_qrcode);
        }

        return { sucesso: true, mensagem };
    }

    /**
     * Dashboard de inadimplência
     */
    async dashboardInadimplencia() {
        const { data } = await supabase
            .rpc('vw_inadimplencia'); // View criada no SQL

        return data || [];
    }

    /**
     * Calcular juros e multa para títulos vencidos
     */
    async calcularEncargos(id: string) {
        const { data: titulo } = await supabase
            .from('contas_receber')
            .select('*')
            .eq('id', id)
            .single();

        if (!titulo || titulo.status === 'RECEBIDO') {
            return null;
        }

        const hoje = new Date();
        const vencimento = new Date(titulo.data_vencimento);

        if (vencimento >= hoje) {
            return { juros: 0, multa: 0, total: titulo.valor_original };
        }

        const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
        const juros = titulo.valor_original * titulo.taxa_juros_dia * diasAtraso;
        const multa = titulo.valor_original * (titulo.percentual_multa / 100);

        return {
            dias_atraso: diasAtraso,
            juros,
            multa,
            total: titulo.valor_original + juros + multa,
        };
    }

    /**
     * Helpers privados
     */
    private async gerarNumeroTitulo(): Promise<string> {
        const ano = new Date().getFullYear();
        const { count } = await supabase
            .from('contas_receber')
            .select('*', { count: 'exact', head: true })
            .like('numero_titulo', `CR-${ano}%`);

        const numero = (count || 0) + 1;
        return `CR-${ano}-${String(numero).padStart(6, '0')}`;
    }

    private calcularProximoVencimento(dia: number): string {
        const hoje = new Date();
        const mes = hoje.getDate() >= dia ? hoje.getMonth() + 1 : hoje.getMonth();
        const data = new Date(hoje.getFullYear(), mes, dia);
        return data.toISOString().split('T')[0];
    }

    private calcularVencimentoMes(mesReferencia: string, dia: number): string {
        const [ano, mes] = mesReferencia.split('-').map(Number);
        const data = new Date(ano, mes - 1, dia);
        return data.toISOString().split('T')[0];
    }

    private formatarMes(mesReferencia: string): string {
        const [ano, mes] = mesReferencia.split('-');
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${meses[parseInt(mes) - 1]}/${ano}`;
    }

    private async verificarInadimplencia(cliente_id: string) {
        const { data: pendentes } = await supabase
            .from('contas_receber')
            .select('id')
            .eq('cliente_id', cliente_id)
            .in('status', ['VENCIDO', 'INADIMPLENTE']);

        const inadimplente = (pendentes?.length || 0) > 0;

        await supabase
            .from('entities')
            .update({ inadimplente })
            .eq('id', cliente_id);
    }

    private async gerarNossoNumero(banco_id: string): Promise<string> {
        // Implementar lógica específica de cada banco
        const timestamp = Date.now().toString().slice(-8);
        return timestamp;
    }

    private gerarTxId(): string {
        return `TERRAPRO${Date.now()}`.slice(0, 35);
    }

    private async integracaoBoleto(dados: any): Promise<any> {
        // TODO: Integrar com API real do banco
        return {
            nosso_numero: dados.nosso_numero,
            linha_digitavel: '12345.67890 12345.678901 12345.678901 1 23456789012345',
            codigo_barras: '12345678901234567890123456789012345678901234',
            pdf_url: 'https://exemplo.com/boleto.pdf',
        };
    }

    private async integracaoPix(dados: any): Promise<any> {
        // TODO: Integrar com API PIX real
        return {
            txid: dados.txid,
            qrcode: 'iVBORw0KGgoAAAANSUhEUgAA...', // Base64 do QR Code
            qrcode_text: '00020126...', // Copia e cola
        };
    }

    private async enviarEmail(email: string, assunto: string, mensagem: string) {
        // TODO: Integrar com SendGrid, AWS SES, etc
        console.log('Email enviado para:', email);
    }

    private async enviarWhatsApp(telefone: string, mensagem: string, anexo?: string) {
        // TODO: Integrar com Evolution API
        console.log('WhatsApp enviado para:', telefone);
    }
}

export const receivableService = new ReceivableService();
export default receivableService;
