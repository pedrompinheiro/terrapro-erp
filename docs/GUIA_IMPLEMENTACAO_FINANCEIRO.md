# 🚀 GUIA DE IMPLEMENTAÇÃO - MÓDULO FINANCEIRO

**Projeto:** TerraPro ERP - Módulo Financeiro Completo  
**Data:** 13/02/2026  
**Status:** Pronto para implementação

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### FASE 1: MVP BÁSICO (1-2 semanas)

#### ✅ Banco de Dados
- [ ] Executar `sql/setup_financeiro_completo.sql` no Supabase
- [ ] Configurar RLS (Row Level Security) nas tabelas financeiras
- [ ] Popular plano de contas padrão
- [ ] Popular centros de custo iniciais
- [ ] Testar triggers e views

#### ✅ Backend Services
- [ ] Integrar `paymentService.ts` (Contas a Pagar)
- [ ] Integrar `receivableService.ts` (Contas a Receber)
- [ ] Testar CRUD básico de lançamentos
- [ ] Testar parcelamento automático
- [ ] Testar cálculo de juros/multa

#### ✅ Frontend Básico
- [ ] Tela de Contas a Pagar
  - [ ] Listagem com filtros
  - [ ] Cadastro de nova conta
  - [ ] Parcelamento
  - [ ] Aprovação
  - [ ] Pagamento
- [ ] Tela de Contas a Receber
  - [ ] Listagem com filtros
  - [ ] Cadastro de receita
  - [ ] Recebimento
  - [ ] Ver títulos vencidos

#### ✅ Dashboards Iniciais
- [ ] Cards de resumo (hoje, mês, vencidas)
- [ ] Gráfico de fluxo de caixa previsto vs realizado
- [ ] Lista de inadimplentes

---

### FASE 2: INTEGRAÇÃO BANCÁRIA (2-3 semanas)

#### ✅ Contas Bancárias
- [ ] Cadastro de contas bancárias
- [ ] Configuração CNAB (layout, convênio, carteira)
- [ ] Seleção de conta padrão

#### ✅ CNAB
- [ ] Integrar `cnabService.ts`
- [ ] Testar geração de remessa CNAB 240
- [ ] Testar leitura de retorno CNAB 240
- [ ] Implementar processamento automático de retorno
- [ ] Tela de visualização de arquivos CNAB
- [ ] Download de arquivo de remessa
- [ ] Upload de arquivo de retorno

#### ✅ Conciliação Bancária
- [ ] Importação de extrato OFX
- [ ] Importação de extrato CSV
- [ ] Matching automático (valor + data + documento)
- [ ] Tela de conciliação interativa
- [ ] Aprovar/rejeitar sugestões
- [ ] Visualizar diferenças

#### ✅ Movimentos Bancários
- [ ] Listagem de movimentos
- [ ] Filtros por período/conta
- [ ] Status de conciliação
- [ ] Vincular manualmente a lançamentos

---

### FASE 3: INTEGRAÇÃO FISCAL (2-3 semanas)

#### ✅ Nota Fiscal Eletrônica (NF-e)
- [ ] Integrar API SEFAZ
- [ ] Emissão de NF-e de produto
- [ ] Consulta de status SEFAZ
- [ ] Download de XML
- [ ] Geração de DANFE (PDF)
- [ ] Cancelamento de NF-e
- [ ] Integração NF-e → Contas a Receber (automática)

#### ✅ Nota Fiscal de Serviço (NFS-e)
- [ ] Integrar API da Prefeitura
- [ ] Emissão de NFS-e
- [ ] Consulta por código de verificação
- [ ] Download de PDF
- [ ] Cálculo automático de ISS
- [ ] Retenção de impostos
- [ ] Integração NFS-e → Contas a Receber

#### ✅ Fiscal + Financeiro
- [ ] Ao emitir NF: criar conta a receber automaticamente
- [ ] Ao cancelar NF: estornar financeiro
- [ ] Relatório fiscal (livro de notas)

---

### FASE 4: AUTOMAÇÕES E RECORRÊNCIAS (1-2 semanas)

#### ✅ Cobranças Recorrentes
- [ ] Cadastro de contratos recorrentes
- [ ] Job mensal: gerar faturas automaticamente
- [ ] Envio automático de boleto/email no vencimento
- [ ] Envio de lembretes (3 dias antes, no dia, após vencida)

#### ✅ Geração Automática Boleto/PIX
- [ ] Integração com API de banco (ex: Sicoob, BB, Inter)
- [ ] Geração de boleto ao criar conta a receber
- [ ] Geração de QR Code PIX
- [ ] Validação de pagamento PIX via webhook
- [ ] Baixa automática ao receber webhook

#### ✅ Cobrança Inteligente
- [ ] Envio de cobrança por email
- [ ] Envio de cobrança por WhatsApp (via Evolution API)
- [ ] Escalonamento de cobrança (lembrete → cobrança → urgente)

---

### FASE 5: RELATÓRIOS E ANÁLISES (1 semana)

#### ✅ Relatórios Gerenciais
- [ ] DRE (Demonstração de Resultado) mensal
- [ ] DRE por centro de custo
- [ ] Fluxo de caixa consolidado
- [ ] Fluxo de caixa por conta bancária
- [ ] Análise de inadimplência
- [ ] Aging list (títulos por prazo de vencimento)

#### ✅ Dashboards Avançados
- [ ] Dashboard executivo (resumo geral)
- [ ] Dashboard por obra
- [ ] Dashboard por máquina
- [ ] Dashboard por cliente
- [ ] Gráficos de tendência (receita, despesa, resultado)
- [ ] Indicadores (margem, liquidez, endividamento)

#### ✅ Exportações
- [ ] Exportar para Excel
- [ ] Exportar para PDF
- [ ] Exportar XML para contabilidade
- [ ] Integração com software contábil (opcional)

---

### FASE 6: AUDITORIA E SEGURANÇA (1 semana)

#### ✅ Auditoria
- [ ] Ver histórico de alterações (auditoria_financeira)
- [ ] Filtrar por usuário/data/tabela
- [ ] Exportar logs de auditoria
- [ ] Alertas de alterações críticas

#### ✅ Permissões
- [ ] Configurar RLS por usuário
- [ ] Perfis: Admin, Financeiro, Consulta, Aprovador
- [ ] Aprovar pagamentos (fluxo de aprovação)
- [ ] Limite de aprovação por usuário

#### ✅ Backup e Segurança
- [ ] Backup automático diário (Supabase native)
- [ ] Criptografia de dados sensíveis (chaves PIX, contas)
- [ ] 2FA para operações críticas (pagamentos > R$ X)

---

## 🎯 PRIORIDADES POR URGÊNCIA

### 🔴 URGENTE (Implementar AGORA)
1. **Banco de Dados** - Executar SQL
2. **Contas a Pagar/Receber** - CRUD básico
3. **Dashboard Inicial** - Visão geral

### 🟡 IMPORTANTE (Próximo Sprint)
4. **CNAB** - Remessa e Retorno
5. **Conciliação** - OFX/CSV
6. **Nota Fiscal** - NF-e e NFS-e

### 🟢 DESEJÁVEL (Médio Prazo)
7. **Recorrência** - Contratos mensais
8. **Boleto/PIX** - Automático
9. **Relatórios** - DRE, Fluxo de Caixa

---

## 📊 INTEGRAÇÕES OBRIGATÓRIAS

### 1. **Bancos** (CNAB)
- Banco do Brasil: CNAB 240
- Bradesco: CNAB 240
- Itaú: CNAB 240
- Sicoob: CNAB 240
- Santander: CNAB 240

### 2. **Fiscal**
- SEFAZ (NF-e): API oficial
- Prefeitura (NFS-e): Padrão nacional ou específico da cidade
- Contabilidade: XML export

### 3. **Pagamentos**
- Boleto: API do banco ou gateway (Asaas, Juno, PagSeguro)
- PIX: API do banco ou Bacen (DICT)
- Cartão: Gateway (opcional)

### 4. **Comunicação**
- Email: SendGrid, AWS SES, Mailgun
- WhatsApp: Evolution API (já integrado no projeto)
- SMS: Twilio, Zenvia (opcional)

---

## 🛠️ STACK TÉCNICA

### Frontend
```
- React 19 + TypeScript
- TanStack Query (cache e sincronização)
- Recharts (gráficos)
- React Hook Form + Zod (validação)
- React Hot Toast (notificações)
- Lucide React (ícones)
```

### Backend
```
- Supabase (PostgreSQL + Auth + Realtime)
- Edge Functions (processamento CNAB, webhooks)
- Cron Jobs (faturas recorrentes, lembretes)
```

### Serviços
```
- paymentService.ts (contas a pagar)
- receivableService.ts (contas a receber)
- cnabService.ts (remessa/retorno)
- bankingService.ts (conciliação)
- fiscalService.ts (NF-e/NFS-e)
- reportService.ts (relatórios)
```

---

## 📖 EXEMPLOS DE USO

### 1. Criar Conta a Pagar Parcelada
```typescript
import { paymentService } from './services/paymentService';

await paymentService.criarParcelado(
  {
    fornecedor_id: 'uuid-fornecedor',
    fornecedor_nome: 'Posto de Combustível XYZ',
    descricao: 'Abastecimento Mensal - Frota',
    plano_contas_id: 'uuid-combustivel',
    centro_custo_id: 'uuid-frota',
    categoria: 'COMBUSTIVEL',
    status: 'PENDENTE',
    data_emissao: '2026-02-13',
  },
  {
    valor_total: 50000,
    numero_parcelas: 10,
    data_primeiro_vencimento: '2026-03-10',
    intervalo_dias: 30,
  }
);
```

### 2. Gerar Remessa CNAB
```typescript
import { cnabService } from './services/cnabService';

const { data: titulos } = await supabase
  .from('contas_pagar')
  .select('*')
  .eq('status', 'APROVADO')
  .eq('banco_id', 'uuid-banco-sicoob');

const remessa = await cnabService.gerarRemessa({
  banco_id: 'uuid-banco-sicoob',
  tipo: 'PAGAMENTO',
  titulos: titulos.map(t => ({
    id: t.id,
    nosso_numero: t.nosso_numero,
    seu_numero: t.numero_titulo,
    valor: t.valor_saldo,
    vencimento: t.data_vencimento,
    pagador_nome: t.fornecedor_nome,
    pagador_documento: t.fornecedor_documento,
    tipo: 'PAGAR',
  })),
});

// Download do arquivo
downloadFile(remessa.conteudo, remessa.nome_arquivo);
```

### 3. Processar Retorno CNAB
```typescript
// Upload do arquivo retorno.ret
const arquivo = event.target.files[0];
const conteudo = await arquivo.text();

const resultado = await cnabService.processarRetorno({
  banco_id: 'uuid-banco-sicoob',
  arquivo_nome: arquivo.name,
  conteudo,
});

console.log(`Processados: ${resultado.sucessos}`);
console.log(`Erros: ${resultado.erros}`);
```

### 4. Gerar Fatura Recorrente
```typescript
import { receivableService } from './services/receivableService';

// Criar contrato recorrente
await receivableService.criarRecorrente({
  cliente_id: 'uuid-cliente',
  cliente_nome: 'Cliente ABC Terraplanagem',
  descricao: 'Locação Retroescavadeira CAT 416',
  valor_mensal: 15000,
  dia_vencimento: 10,
  plano_contas_id: 'uuid-locacao',
  centro_custo_id: 'uuid-maquina-001',
  contrato_id: 'CONTRATO-2026-001',
});

// Gerar faturas do mês (executar via cron no dia 1)
const faturas = await receivableService.gerarFaturasRecorrentes('2026-03');
// Retorna array com todas as faturas criadas
```

### 5. Conciliação Bancária
```typescript
import { bankingService } from './services/bankingService';

// Importar extrato OFX
const ofxFile = await uploadFile();
const movimentos = await bankingService.importarOFX(ofxFile);

// Conciliação automática
const sugestoes = await bankingService.conciliarAutomatico({
  conta_bancaria_id: 'uuid-conta',
  data_inicio: '2026-02-01',
  data_fim: '2026-02-29',
});

// Aprovar sugestão
await bankingService.aprovarSugestao(sugestao.id);
```

---

## 🔧 CONFIGURAÇÃO INICIAL

### 1. Executar SQL
```bash
# No Supabase SQL Editor
psql < sql/setup_financeiro_completo.sql
```

### 2. Configurar Variáveis de Ambiente
```env
# .env.local
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx

# APIs Externas
VITE_NF

E_API_URL=https://api.sefaz.gov.br
VITE_NFSE_API_URL=https://nfse.prefeitura.gov.br
VITE_BOLETO_API_URL=https://api.sicoob.com.br
VITE_PIX_API_URL=https://pix.bcb.gov.br

# Chaves API
VITE_SEFAZ_CERTIFICADO=certificado.pfx
VITE_BANCO_SICOOB_CONVENIO=123456
```

### 3. Instalar Dependências
```bash
npm install zod react-hook-form @hookform/resolvers
npm install date-fns # Para manipulação de datas
```

---

## 🎯 RESULTADOS ESPERADOS

Após implementação completa:

### ✅ Funcionalidades
- ✅ Contas a Pagar/Receber com parcelamento
- ✅ Geração automática CNAB 240
- ✅ Processamento de retorno bancário
- ✅ Conciliação bancária automática (80%+ de acurácia)
- ✅ Emissão NF-e e NFS-e integrada
- ✅ Geração boleto/PIX automática
- ✅ Cobranças recorrentes
- ✅ DRE e Fluxo de Caixa em tempo real
- ✅ Dashboard executivo
- ✅ Auditoria completa

### 📊 Métricas
- ⏱️ **Tempo de lançamento:** 80% mais rápido (automação)
- 🎯 **Acurácia conciliação:** 90%+ (matching inteligente)
- 📉 **Inadimplência:** -30% (cobrança automática)
- 💰 **Economia:** -50% tempo financeiro
- 📈 **Visibilidade:** 100% tempo real

---

## 📞 SUPORTE

### Documentação
- `docs/MODULO_FINANCEIRO_COMPLETO.md` - Arquitetura completa
- `services/paymentService.ts` - Código comentado
- `services/receivableService.ts` - Código comentado
- `services/cnabService.ts` - Código comentado

### Próximos Passos
1. Executar SQL de instalação
2. Testar services no console
3. Criar telas básicas de Pagar/Receber
4. Implementar CNAB
5. Integrar NF-e

---

**🚀 PRONTO PARA IMPLEMENTAR!**

**Data:** 13/02/2026  
**Status:** ✅ Completo e documentado
