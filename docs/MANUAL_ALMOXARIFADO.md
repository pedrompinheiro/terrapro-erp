# MANUAL DO ALMOXARIFADO - TerraPro ERP
## Transportadora Terra - Dourados/MS

**Versao:** 1.0 | **Data:** 24/02/2026

---

## SUMARIO

1. [Visao Geral](#1-visao-geral)
2. [Acesso ao Modulo](#2-acesso-ao-modulo)
3. [Aba ESTOQUE](#3-aba-estoque)
4. [Aba MOVIMENTACOES](#4-aba-movimentacoes)
5. [Aba ORDENS DE SERVICO](#5-aba-ordens-de-servico)
6. [Aba COMPRAS](#6-aba-compras)
   - 6.1 [Pedidos de Compra](#61-pedidos-de-compra)
   - 6.2 [Retiradas](#62-retiradas)
   - 6.3 [Notas Fiscais](#63-notas-fiscais)
7. [Aba TECNICOS](#7-aba-tecnicos)
8. [Aba RELATORIOS](#8-aba-relatorios)
9. [Fluxo Completo: Retirada + NF](#9-fluxo-completo-retirada--nf)
10. [Dicas e Atalhos](#10-dicas-e-atalhos)

---

## 1. VISAO GERAL

O modulo **Almoxarifado e Estoque** controla todo o ciclo de materiais da empresa:

- Cadastro de produtos e servicos
- Entradas e saidas de estoque
- Ordens de servico da oficina
- Pedidos de compra e retiradas de material
- Importacao de Notas Fiscais de fornecedores
- Rateio de custo por equipamento/centro de custo
- Relatorios e dashboards

O modulo possui **6 abas** principais, acessiveis pela barra de navegacao no topo da pagina.

---

## 2. ACESSO AO MODULO

1. Faca login no sistema em `http://localhost:3000`
2. No menu lateral, clique em **Almoxarifado** (icone de caixa)
3. A pagina abre na aba **Estoque** por padrao

No topo voce vera: `"X produtos e Y servicos cadastrados"`

---

## 3. ABA ESTOQUE

Aqui voce gerencia todos os **produtos** e **servicos** cadastrados.

### 3.1 Tela Principal

No topo da aba voce encontra:

- **Busca** - Digite o nome, codigo, SKU ou codigo de barras do item
- **Filtro por tipo** - Clique em `Todos`, `Produtos` ou `Servicos`
- **Filtro avancado** (icone de funil) - Filtra por categoria e status
- **Exportar CSV** (icone de download) - Gera planilha com todos os itens filtrados
- **Novo Item** (botao verde) - Abre formulario para cadastrar item

### 3.2 Tabela de Itens

| Coluna | O que mostra |
|--------|-------------|
| Cod | Codigo interno do item |
| Descricao | Nome do item + SKU + marca |
| Categoria | Categoria do item (ex: Filtros, Oleos) |
| Qtd Atual | Quantidade em estoque |
| Minimo | Estoque minimo configurado |
| Custo | Preco de custo |
| Venda | Preco de venda |
| Local | Localizacao fisica (prateleira, corredor) |
| Status | NORMAL (verde), ATENCAO (amarelo) ou CRITICO (vermelho piscando) |

**Clique em qualquer linha** para abrir o item e editar.

### 3.3 Cadastrar / Editar Item

Ao clicar em **Novo Item** ou em um item existente, abre o formulario:

**Lado esquerdo:**
- Area para fotos do produto (2 fotos)
- Historico das ultimas 10 movimentacoes (apenas ao editar)
- Informacao de margem de lucro

**Lado direito (formulario):**

| Campo | Descricao | Obrigatorio |
|-------|-----------|:-----------:|
| Tipo | Produto ou Servico | Sim |
| Descricao | Nome completo do item | Sim |
| Unidade | UNI, PC, KG, LT, MT, CX, etc. | Sim |
| Referencia/SKU | Codigo do fabricante | Nao |
| Cod. Barras | Codigo EAN-13 | Nao |
| Categoria | Selecione da lista | Nao |
| Marca | Selecione da lista | Nao |
| Localizacao | Ex: "A-001-01, PRATELEIRA 3" | Nao |
| Estoque Minimo | Quantidade minima desejada | Nao |
| Estoque Atual | Quantidade atual | Nao |
| Estoque Maximo | Quantidade maxima | Nao |
| Custo | Preco de custo | Nao |
| Venda | Preco de venda | Nao |
| Observacoes | Notas adicionais | Nao |

> A **margem de lucro** e calculada automaticamente: `((Venda - Custo) / Custo) x 100`

Clique em **Salvar Item** para confirmar.

### 3.4 Excluir Item

Passe o mouse sobre a linha do item e clique no icone de **lixeira** (vermelho). Confirme a exclusao na caixa de dialogo.

### 3.5 Exportar para Excel

Clique no icone de **download** no topo. O sistema gera um arquivo CSV com todos os itens filtrados. O arquivo abre corretamente no Excel.

---

## 4. ABA MOVIMENTACOES

Registra todas as **entradas** e **saidas** de estoque.

### 4.1 Filtros

- **Tipo**: `Todos`, `Entradas` (verde) ou `Saidas` (vermelho)
- **Periodo**: Data inicial e data final
- **Limpar**: Remove todos os filtros

### 4.2 Tipos de Movimentacao

**Entradas (verde):**
| Tipo | Quando usar |
|------|-------------|
| Compra | Material recebido de fornecedor |
| Devolucao | Material devolvido ao estoque |
| Ajuste (+) | Correcao de inventario para mais |

**Saidas (vermelho):**
| Tipo | Quando usar |
|------|-------------|
| Saida OS | Material usado em Ordem de Servico |
| Venda | Material vendido |
| Ajuste (-) | Correcao de inventario para menos |
| Perda | Material danificado ou perdido |

**Outro:**
| Tipo | Quando usar |
|------|-------------|
| Transferencia | Movimentacao entre locais |

### 4.3 Registrar Nova Movimentacao

1. Clique em **Nova Movimentacao** (botao verde)
2. No campo **Produto/Servico**, comece a digitar o nome - aparecera uma lista de sugestoes
3. Selecione o produto desejado
4. Escolha o **Tipo de Movimentacao**
5. Informe a **Quantidade**
6. O **Custo Unitario** e preenchido automaticamente (pode alterar)
7. O **Valor Total** e calculado automaticamente
8. Opcionalmente preencha: Observacoes, Fornecedor, Numero da NF
9. Clique em **Salvar Movimentacao**

> O estoque do produto e atualizado automaticamente apos salvar.

### 4.4 Tabela de Movimentacoes

| Coluna | O que mostra |
|--------|-------------|
| Data | Data e hora da movimentacao |
| Tipo | Badge colorido (verde=entrada, vermelho=saida) |
| Produto | Nome e codigo do item |
| Qty | Quantidade movimentada |
| Custo Unit | Custo unitario |
| Valor Total | Valor total da movimentacao |
| Saldo | Saldo do item apos a movimentacao |
| Referencia | Fornecedor, NF, observacoes |

---

## 5. ABA ORDENS DE SERVICO

Visualiza as **Ordens de Servico (OS)** vindas da oficina mecanica.

### 5.1 Cards de Resumo

- **Total OS** - Quantidade total de OS no periodo
- **OS Abertas** - Quantidade de OS em andamento
- **Receita Total** - Valor total faturado

### 5.2 Filtros

- **Busca** - Por cliente, placa, equipamento ou numero da OS
- **Situacao** - Filtre por status (Aberta, Fechada, etc.)
- **Periodo** - Data inicial e final
- **Pagamento** - Filtrar por Pago ou Pendente

### 5.3 Detalhes da OS

Clique em qualquer OS para ver os detalhes completos:

- **Cliente**: Nome, telefone, WhatsApp
- **Equipamento**: Nome, modelo, marca, placa, KM, ano, cor, serial
- **Defeitos**: Descricao dos problemas relatados
- **Servicos Realizados**: Lista de servicos executados
- **Itens Utilizados**: Tabela com produtos e servicos, quantidades e valores
- **Resumo Financeiro**: Produtos + Servicos + Mao de Obra - Desconto = Total
- **Pagamento**: Forma e condicao de pagamento

---

## 6. ABA COMPRAS

A aba Compras possui **3 sub-abas**:

### 6.1 Pedidos de Compra

Visualiza os pedidos de compra feitos a fornecedores.

**Cards de resumo:**
- Total de Pedidos | Entregas Pendentes | Total Gasto

**Filtros:** Busca por fornecedor/numero, situacao, periodo, pagamento.

**Ao clicar em um pedido**, abre os detalhes:
- Dados do fornecedor (nome, contato, telefone)
- Datas de pedido e entrega
- Itens do pedido com quantidades e valores
- Resumo financeiro (produtos + outros custos - desconto = total)
- Status do pagamento

---

### 6.2 Retiradas

As **retiradas** registram a saida de material do almoxarifado **antes** de receber a NF do fornecedor. Isso permite controlar o que foi retirado e depois vincular a Nota Fiscal.

**Cards de resumo:**
- Total Retiradas | Rascunhos | Pendentes NF | Valor Estimado Pendente

#### Como criar uma Retirada:

1. Clique em **Nova Retirada** (botao azul)
2. Preencha o cabecalho:
   - **Fornecedor**: Nome do fornecedor
   - **Numero da Retirada**: Ex: "RET-001"
   - **Data**: Data da retirada
   - **Observacoes**: Opcional
3. Adicione itens clicando em **Adicionar Item**:
   - Digite o nome do produto no campo de busca
   - Selecione o produto na lista de sugestoes
   - Informe a **Quantidade** e o **Custo Estimado**
4. Para cada item, clique em **Ratear** para alocar o custo (veja abaixo)
5. Clique em **Salvar Rascunho** para salvar sem finalizar
6. Quando tudo estiver correto, clique em **Finalizar Retirada**

#### Rateio de Custos (Alocacao):

O rateio permite distribuir o custo de cada item para diferentes destinos:

| Tipo | Uso | Exemplo |
|------|-----|---------|
| Equipamento | Material para manutencao de maquina especifica | "PC-03 - Escavadeira CAT 320" |
| Centro de Custo | Consumo de um setor | "OFICINA - Oficina Mecanica" |
| Ordem de Servico | Material para uma OS especifica | OS #12345 |
| Estoque | Material permanece no estoque | Estoque geral |

**Como ratear:**
1. Clique no botao **Ratear** ao lado do item
2. Clique em **+ Alocacao**
3. Escolha o tipo (Equipamento, Centro de Custo, OS ou Estoque)
4. Para Equipamento: digite o nome e selecione na lista
5. Informe a **Quantidade alocada**
6. Clique no botao **Salvar** (icone de disquete verde)
7. Repita para dividir entre varios destinos

> A **barra de progresso** mostra quanto ja foi alocado. Ela fica verde quando a soma das alocacoes bate com a quantidade total do item.

#### Status da Retirada:

| Status | Significado | Cor |
|--------|------------|-----|
| Rascunho | Ainda em edicao, pode alterar | Azul |
| Pendente NF | Finalizada, aguardando NF do fornecedor | Amarelo |
| Faturada | NF recebida e vinculada | Verde |
| Cancelada | Retirada cancelada | Vermelho |

**Fluxo:** `Rascunho` --> `Pendente NF` --> `Faturada`

---

### 6.3 Notas Fiscais

Gerencia as **Notas Fiscais de fornecedores** recebidas.

**Cards de resumo:**
- Total NFs | NFs Abertas | Valor Total

#### Como importar uma NF:

1. Clique em **Importar NF** (botao azul)
2. O assistente de importacao tem **3 etapas**:

**Etapa 1 - Upload:**
- Arraste o arquivo XML da NF para a area de upload
- OU digite a **Chave NFe** (44 digitos) manualmente
- Clique em **Processar**

> Formatos aceitos: XML (recomendado), PDF e Imagem (JPG/PNG)

**Etapa 2 - Revisao:**
- Confira os dados do fornecedor, numero da NF e data
- Revise cada item da NF:
  - Itens com **match Alto** (verde) foram encontrados automaticamente no estoque
  - Itens com **match Medio/Baixo** (amarelo/laranja) precisam de conferencia
  - Itens **sem match** (vermelho) precisam de vinculacao manual
- Para vincular manualmente: clique no icone de **lupa**, busque o produto e selecione
- Clique em **Confirmar Itens**

**Etapa 3 - Confirmacao:**
- Revise o resumo final da NF
- Selecione as **Retiradas Pendentes** que deseja vincular a esta NF (checkbox)
- Clique em **Confirmar Entrada**

> Ao confirmar, o sistema automaticamente:
> - Cria a NF no banco de dados
> - Vincula os itens aos produtos do estoque
> - Vincula as retiradas selecionadas
> - Gera as movimentacoes de entrada no estoque
> - Atualiza o status das retiradas para "Faturada"

#### Detalhes da NF:

Clique em qualquer NF para ver:
- Dados completos (fornecedor, CNPJ, chave, datas, valor)
- Todos os itens com match de confianca
- Retiradas vinculadas a esta NF

---

## 7. ABA TECNICOS

Gerencia os **tecnicos e mecanicos** que trabalham na oficina.

### 7.1 Tela Principal

- **Busca** por nome do tecnico
- **Novo Tecnico** (botao dourado)
- Tecnicos exibidos em **cards** com:
  - Nome e codigo
  - Funcoes: Tecnico, Mecanico, Vendedor, Atendente (badges coloridos)
  - Contato: Telefone e email
  - Comissao: Percentual sobre produtos e/ou servicos
  - Status: Ativo (verde) ou Bloqueado (vermelho)
  - Receita gerada e quantidade de vendas

### 7.2 Cadastrar / Editar Tecnico

| Campo | Descricao |
|-------|-----------|
| Nome | Nome completo |
| Funcoes | Marque: Tecnico, Mecanico, Vendedor, Atendente |
| Comissao % | Percentual de comissao (0 a 100) |
| Comissao Produtos | Se recebe comissao sobre produtos |
| Comissao Servicos | Se recebe comissao sobre servicos |
| Telefone | Telefone fixo |
| Celular | Celular/WhatsApp |
| Email | Email do tecnico |
| CPF | CPF do tecnico |
| Status | Ativo ou Bloqueado |

---

## 8. ABA RELATORIOS

Dashboard com **graficos e tabelas** para analise gerencial.

### 8.1 Cards de Alerta

| Card | O que mostra |
|------|-------------|
| NF Pendentes | Quantidade e valor estimado de NFs aguardando |
| Retiradas sem NF | Quantidade de retiradas pendentes de faturamento |
| Equipamentos c/ Custo | Total de equipamentos com movimentacao no mes |

### 8.2 Custo por Equipamento (Tabela)

Mostra o custo de materiais por equipamento no mes atual:
- Nome do equipamento
- Centro de custo associado
- Quantidade de movimentacoes
- Custo total

### 8.3 Estoque por Categoria (Grafico de Barras)

Grafico mostrando o **valor total em estoque** agrupado por categoria. Util para ver onde esta concentrado o investimento.

### 8.4 Valor em Estoque (Grafico de Pizza)

Mostra a distribuicao do valor de venda por categoria, em percentual.

### 8.5 Top 10 Produtos Mais Utilizados (Tabela)

Ranking dos 10 produtos com mais saidas:
- Posicao, codigo, descricao, categoria
- Barra visual de progresso mostrando volume relativo

### 8.6 Produtos Abaixo do Minimo (Tabela)

Lista de todos os produtos com estoque **abaixo do minimo configurado**:
- Codigo, descricao, categoria
- Quantidade atual vs minimo
- **Falta**: quanto precisa comprar (em vermelho)
- Custo estimado para reposicao
- Localizacao no almoxarifado

### 8.7 Historico de Movimentacoes (Grafico de Linhas)

Grafico dos ultimos **6 meses** mostrando:
- Linha verde: total de entradas por mes
- Linha vermelha: total de saidas por mes

---

## 9. FLUXO COMPLETO: RETIRADA + NF

Este e o fluxo principal de trabalho do almoxarifado:

```
1. MATERIAL CHEGA       2. CRIAR RETIRADA       3. ADICIONAR ITENS
   do fornecedor  --->     (Rascunho)      --->    + ratear custos
                                                     por equipamento

4. FINALIZAR            5. RECEBER NF           6. IMPORTAR NF
   RETIRADA       --->     do fornecedor   --->    (XML/PDF)
   (Pendente NF)                                    + vincular retirada

7. CONFIRMAR ENTRADA
   --> Estoque atualizado
   --> Custos registrados
   --> Retirada = Faturada
```

### Passo a Passo Detalhado:

**1)** O material chega do fornecedor na empresa.

**2)** Va em **Compras > Retiradas** e clique em **Nova Retirada**.

**3)** Preencha o fornecedor, numero, adicione os itens e faca o **rateio** (para qual equipamento ou setor vai cada item).

**4)** Clique em **Finalizar Retirada**. O status muda para **Pendente NF**.

**5)** Quando a NF do fornecedor chegar (XML por email, por exemplo):

**6)** Va em **Compras > Notas Fiscais** e clique em **Importar NF**. Faca o upload do XML, revise os itens e na etapa final, marque a retirada pendente para vincular.

**7)** Clique em **Confirmar Entrada**. O sistema faz tudo automaticamente:
- Cria as movimentacoes de estoque
- Atualiza as quantidades dos produtos
- Registra o custo por equipamento
- Muda o status da retirada para **Faturada**

---

## 10. DICAS E ATALHOS

- **Busca rapida**: Em qualquer aba, o campo de busca filtra em tempo real conforme voce digita.

- **Paginacao**: Todas as tabelas mostram 50 itens por pagina. Use as setas para navegar.

- **Status critico**: Itens com estoque abaixo do minimo ficam com o status **CRITICO** (vermelho piscando) para chamar a atencao.

- **XML e o melhor formato**: Ao importar NF, prefira o arquivo XML pois o sistema faz o match automatico dos produtos.

- **Rateio obrigatorio**: Ao finalizar uma retirada, a soma das alocacoes de cada item deve bater com a quantidade total. A barra de progresso ajuda a verificar.

- **Exportar CSV**: Use o botao de download na aba Estoque para gerar planilha para auditoria ou inventario.

- **Margem automatica**: Ao cadastrar preco de custo e venda, a margem de lucro e calculada automaticamente.

---

## 11. FLUXOGRAMAS POR OPERACAO

Abaixo estao os fluxogramas de cada situacao do dia a dia do almoxarifado.

---

### FLUXO 1: CHEGOU UM PEDIDO DE COMPRA (cotacao do fornecedor)

```
 INICIO
   |
   v
 Recebeu cotacao/pedido
 do fornecedor?
   |
   v
 Compras > Pedidos de Compra
   |
   v
 Conferir os dados do pedido:
   - Fornecedor
   - Itens e quantidades
   - Valores unitarios e total
   - Condicao de pagamento
   - Data de entrega
   |
   v
 Clicar no pedido para
 ver detalhes completos
   |
   v
 Conferir itens linha a linha:
   - Descricao confere?
   - Quantidade correta?
   - Preco esta dentro?
   |
   +--------+--------+
   |                 |
   v                 v
 OK, aguardar     Divergencia?
 entrega          Notificar o
   |              comprador
   v
 Quando material chegar
 fisicamente, ir para
 ---> FLUXO 2 (Entrada)
```

**Onde no sistema:** Almoxarifado > Compras > Pedidos de Compra

**Resumo rapido:**
1. Abra a aba **Compras > Pedidos de Compra**
2. Localize o pedido (busca por fornecedor ou numero)
3. Clique para ver detalhes
4. Confira itens, valores e prazos
5. Aguarde a chegada fisica do material

---

### FLUXO 2: CHEGOU MATERIAL DO FORNECEDOR (Entrada)

```
 INICIO
   |
   v
 Material chegou
 fisicamente?
   |
   v
 Conferir volumes e
 embalagens com o
 pedido/romaneio
   |
   +--------+--------+
   |                 |
   v                 v
 Confere?          Falta algo?
   |               Anotar e
   v               avisar compras
 Compras > Retiradas
   |
   v
 Clicar "Nova Retirada"
   |
   v
 Preencher cabecalho:
   - Fornecedor
   - Numero (ex: RET-001)
   - Data
   |
   v
 Adicionar cada item:
   1. Clicar "+ Adicionar Item"
   2. Digitar nome do produto
   3. Selecionar na lista
   4. Informar quantidade
   5. Informar custo estimado
   |
   v
 Para CADA item, clicar
 "Ratear" e alocar:
   |
   +------+------+------+------+
   |      |      |      |      |
   v      v      v      v      v
  Equip  C.C.   OS   Estoque  Misto
  (ex:  (ex:   (ex:  (fica    (divide
  PC-03) Ofici  OS    no      entre
         na)   #123)  almox)  varios)
   |      |      |      |      |
   +------+------+------+------+
   |
   v
 Barra de progresso
 ficou VERDE? (100%)
   |
   +--------+--------+
   |                 |
   v                 v
 SIM               NAO
   |               Ajustar
   v               alocacoes
 Clicar "Salvar Rascunho"
 (se quiser salvar parcial)
   |
   v
 Tudo certo?
 Clicar "Finalizar Retirada"
   |
   v
 Status muda para
 "Pendente NF" (amarelo)
   |
   v
 Aguardar NF do fornecedor
 ---> FLUXO 3
```

**Onde no sistema:** Almoxarifado > Compras > Retiradas

**Resumo rapido:**
1. Confira o material fisicamente
2. Crie uma **Nova Retirada** em Compras > Retiradas
3. Adicione todos os itens recebidos
4. Faca o **rateio** de cada item (para qual equipamento/setor vai)
5. Salve como rascunho ou **finalize** direto
6. Aguarde a NF chegar

---

### FLUXO 3: CHEGOU A NOTA FISCAL DO FORNECEDOR

```
 INICIO
   |
   v
 Recebeu NF do fornecedor?
 (XML por email, NF fisica,
  PDF ou foto)
   |
   v
 Compras > Notas Fiscais
   |
   v
 Clicar "Importar NF"
   |
   v
 ========== ETAPA 1: UPLOAD ==========
   |
   +--------+--------+
   |                 |
   v                 v
 Tem arquivo       So tem o
 XML/PDF/foto?     numero da
   |               chave NFe?
   v                 |
 Arrastar arquivo    v
 para a area de    Digitar os 44
 upload            digitos da chave
   |                 |
   +--------+--------+
   |
   v
 Clicar "Processar"
   |
   v
 ========== ETAPA 2: REVISAO ==========
   |
   v
 Conferir dados do cabecalho:
   - Fornecedor correto?
   - Numero da NF?
   - Data de emissao?
   - Valor total?
   |
   v
 Conferir cada item da NF:
   |
   +--------+--------+--------+
   |        |        |        |
   v        v        v        v
  VERDE    AMARELO  LARANJA  VERMELHO
  (Alto)   (Medio)  (Baixo)  (Nenhum)
  Match    Confere  Verificar Vincular
  auto-    o item?  e trocar  manual-
  matico   OK!      se neces  mente
   |        |       sario      |
   |        |        |         v
   |        |        |      Clicar lupa
   |        |        |      Buscar produto
   |        |        |      Selecionar
   |        |        |         |
   +--------+--------+--------+
   |
   v
 Todos os itens revisados?
 Clicar "Confirmar Itens"
   |
   v
 ========== ETAPA 3: CONFIRMACAO ==========
   |
   v
 Revisar resumo final:
   - Fornecedor, NF, data, valor
   - Qtd de itens vinculados
   |
   v
 Tem retiradas pendentes
 desse fornecedor?
   |
   +--------+--------+
   |                 |
   v                 v
 SIM               NAO
 Marcar checkbox    Seguir sem
 das retiradas      vincular
 para vincular
   |                 |
   +--------+--------+
   |
   v
 Clicar "Confirmar Entrada"
   |
   v
 SISTEMA FAZ AUTOMATICAMENTE:
   [x] Cria NF no banco
   [x] Vincula itens aos produtos
   [x] Gera movimentacoes de ENTRADA
   [x] Atualiza estoque dos produtos
   [x] Retiradas vinculadas = "Faturada"
   |
   v
 FIM - NF processada!
 Ver em Compras > Notas Fiscais
```

**Onde no sistema:** Almoxarifado > Compras > Notas Fiscais

**Resumo rapido:**
1. Clique em **Importar NF**
2. Faca upload do XML (ou digite a chave)
3. Revise os itens e vincule os que ficaram sem match
4. Na confirmacao, marque as retiradas pendentes
5. Clique em **Confirmar Entrada** - o estoque e atualizado automaticamente

---

### FLUXO 4: SAIDA DE MATERIAL PARA MANUTENCAO (OS)

```
 INICIO
   |
   v
 Mecanico/tecnico precisa
 de material para uma OS?
   |
   v
 Movimentacoes >
 "Nova Movimentacao"
   |
   v
 Buscar o produto
 (digitar nome, codigo ou SKU)
   |
   v
 Selecionar o produto
 na lista de sugestoes
   |
   v
 Tipo: "Saida OS"
   |
   v
 Informar:
   - Quantidade
   - Custo unitario (auto)
   - Observacoes (ex: "OS #123 - Troca de filtro PC-03")
   - Entidade/Fornecedor (nome do tecnico)
   |
   v
 Clicar "Salvar Movimentacao"
   |
   v
 SISTEMA AUTOMATICAMENTE:
   [x] Desconta do estoque
   [x] Registra a saida
   [x] Atualiza saldo do produto
   |
   v
 FIM - Material entregue
 Verificar em Movimentacoes
```

**Onde no sistema:** Almoxarifado > Movimentacoes

**Resumo rapido:**
1. Clique em **Nova Movimentacao**
2. Busque e selecione o produto
3. Tipo: **Saida OS**
4. Informe quantidade e observacoes
5. Salve - estoque atualizado

---

### FLUXO 5: SAIDA DE MATERIAL PARA VENDA

```
 INICIO
   |
   v
 Venda de material
 avulso para terceiros?
   |
   v
 Movimentacoes >
 "Nova Movimentacao"
   |
   v
 Buscar e selecionar o produto
   |
   v
 Tipo: "Venda"
   |
   v
 Informar:
   - Quantidade
   - Custo unitario
   - Entidade (nome do comprador)
   - Numero da NF (se emitida)
   - Observacoes
   |
   v
 Clicar "Salvar Movimentacao"
   |
   v
 Estoque descontado
 automaticamente
   |
   v
 FIM
```

**Onde no sistema:** Almoxarifado > Movimentacoes

---

### FLUXO 6: DEVOLUCAO DE MATERIAL AO ESTOQUE

```
 INICIO
   |
   v
 Material retornou ao
 almoxarifado?
 (sobra de OS, devolucao, etc.)
   |
   v
 Movimentacoes >
 "Nova Movimentacao"
   |
   v
 Buscar e selecionar o produto
   |
   v
 Tipo: "Devolucao"
   |
   v
 Informar:
   - Quantidade devolvida
   - Custo unitario
   - Observacoes (ex: "Sobra da OS #456")
   |
   v
 Clicar "Salvar Movimentacao"
   |
   v
 Estoque incrementado
 automaticamente
   |
   v
 FIM
```

---

### FLUXO 7: AJUSTE DE INVENTARIO (contagem fisica)

```
 INICIO
   |
   v
 Fez contagem fisica
 e encontrou divergencia?
   |
   +--------+--------+
   |                 |
   v                 v
 Estoque no        Estoque no
 sistema MAIOR     sistema MENOR
 que fisico        que fisico
   |                 |
   v                 v
 Tipo:             Tipo:
 "Ajuste (-)"      "Ajuste (+)"
   |                 |
   v                 v
 Informar a        Informar a
 diferenca         diferenca
   |                 |
   +--------+--------+
   |
   v
 Observacoes:
 "Ajuste inventario DD/MM/AAAA"
   |
   v
 Salvar Movimentacao
   |
   v
 Estoque corrigido
   |
   v
 FIM
```

**Onde no sistema:** Almoxarifado > Movimentacoes

---

### FLUXO 8: PERDA / EXTRAVIO DE MATERIAL

```
 INICIO
   |
   v
 Material danificado,
 extraviado ou vencido?
   |
   v
 Movimentacoes >
 "Nova Movimentacao"
   |
   v
 Buscar o produto
   |
   v
 Tipo: "Perda"
   |
   v
 Informar:
   - Quantidade perdida
   - Observacoes detalhadas
     (motivo da perda)
   |
   v
 Salvar
   |
   v
 Estoque descontado
 (perda registrada para
  controle e auditoria)
   |
   v
 FIM
```

---

### FLUXO 9: CADASTRAR PRODUTO NOVO

```
 INICIO
   |
   v
 Produto novo que ainda
 nao existe no sistema?
   |
   v
 Estoque > "Novo Item"
   |
   v
 Marcar tipo: PRODUTO
   |
   v
 Preencher dados obrigatorios:
   - Descricao (nome completo)
   - Unidade (UNI, PC, KG, etc.)
   |
   v
 Preencher dados complementares:
   - Referencia/SKU do fabricante
   - Codigo de barras (EAN)
   - Categoria (Filtros, Oleos, etc.)
   - Marca
   - Localizacao (prateleira)
   |
   v
 Definir estoques:
   - Minimo (alerta quando abaixo)
   - Atual (qtd em maos)
   - Maximo (limite)
   |
   v
 Definir precos:
   - Custo (compra)
   - Venda (revenda)
   - Margem: calculada automatica
   |
   v
 Clicar "Salvar Item"
   |
   v
 Produto cadastrado!
 Aparece na listagem do Estoque
   |
   v
 FIM
```

**Onde no sistema:** Almoxarifado > Estoque

---

### RESUMO VISUAL - QUAL FLUXO USAR?

```
+---------------------------+----------------------------------+-------------------+
|  O QUE ACONTECEU?         |  ONDE IR NO SISTEMA              |  FLUXO            |
+---------------------------+----------------------------------+-------------------+
| Chegou cotacao/pedido     | Compras > Pedidos de Compra      | FLUXO 1           |
| Chegou material fisico    | Compras > Retiradas              | FLUXO 2           |
| Chegou NF do fornecedor   | Compras > Notas Fiscais          | FLUXO 3           |
| Mecanico pediu material   | Movimentacoes > Nova Mov.        | FLUXO 4 (Saida OS)|
| Venda de material         | Movimentacoes > Nova Mov.        | FLUXO 5 (Venda)   |
| Devolveram material       | Movimentacoes > Nova Mov.        | FLUXO 6 (Devol.)  |
| Contagem deu diferenca    | Movimentacoes > Nova Mov.        | FLUXO 7 (Ajuste)  |
| Material perdido/quebrado | Movimentacoes > Nova Mov.        | FLUXO 8 (Perda)   |
| Produto novo no sistema   | Estoque > Novo Item              | FLUXO 9           |
+---------------------------+----------------------------------+-------------------+
```

---

**TerraPro ERP** - Transportadora Terra LTDA
Dourados/MS - 2026
