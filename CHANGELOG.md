# CHANGELOG - TerraPro ERP

Todas as mudanças notáveis do sistema serão documentadas neste arquivo.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [v4.3.0] - 2026-03-09

### Adicionado
- **Módulo Folha de Pagamento**: importação de planilha XLSX, editor de dados, cruzamento com RH, geração automática de contas a pagar
- Componentes: PayrollUpload, PayrollEditor, PayrollGenerate, PayrollMatch, PayrollCrossRef, PayrollPreview
- SQL de setup da folha de pagamento (`sql/setup_folha_pagamento.sql`)
- Parser XLSX dedicado para folha (`services/payrollXlsxParser.ts`)

### Corrigido
- Fix importação NF: fallback IA client-side quando Edge Function falha
- Fix coluna 'status' não encontrada ao salvar item do almoxarifado

---

## [v4.2.0] - 2026-03-06

### Adicionado
- Importação de fatura CSV + anexo de documentos nos lançamentos financeiros
- Rateio multi centro de custo no financeiro
- TerraPro AI: chatbot real com dados do ERP via Supabase
- Busca inteligente global (smartSearch) em todos os módulos
- Bloqueio de cadastro duplicado de CNPJ/CPF

### Corrigido
- Fix fotos produto + código entidade + soft-delete com FK
- Fix paginação global: fetchAll para tabelas com 1000+ registros
- Fix smartSearch: palavras curtas não matcham falsamente

---

## [v4.1.0] - 2026-03-04

### Adicionado
- Almoxarifado: fotos com IA + módulo de compras
- Financeiro Fase 1: lançamentos, contas a pagar/receber
- Sistema completo de OS (Ordem de Serviço) com CRUD, impressão e fluxogramas
- Exportar relatório geral de ponto em XLSX
- Colunas HE 50% e HE 100% no relatório de ponto
- Cálculo de Ponto: relatório em lote, deslocar por linha, justificativa inline
- Justificativas de abono (Atestado, Chuva, Dispensado, Sobreaviso)

### Corrigido
- Fix valor piscando ao salvar batida no Cálculo de Ponto
- Fix Supabase saves + TimeInput mask no Controle de Ponto

---

## [v4.0.0] - 2026-03-01

### Adicionado
- Módulo Integrações & Habilitações v2.0: 3 abas, auto-status e dossiê PDF
- Multi-provider IA (GPT/Gemini/Groq)
- TimeInput com máscara HH:MM e seletor mês/ano no ponto
- WhatsApp: automação completa com webhook, IA, campanhas e cobranças
- Consulta NF-e via Certificado Digital A1 na SEFAZ
- Edge Function nfe-parser para PDF/Imagem

### Corrigido
- Fix 45 erros TypeScript e remoção de código morto
- Fix save do cartão de ponto: company_id, datas e permissões

---

## [v3.0.0] - 2026-02-25

### Adicionado
- Módulo Almoxarifado completo com 6 abas: Estoque, Movimentações, OS, Compras, Técnicos e Relatórios
- Módulo Retiradas/NF/Rateio: SQL, serviços, UI completa e Edge Function
- RLS policies para segurança do Supabase

### Corrigido
- Fix migração: correção de permissões (GRANT) e migração de PRODUTOS via JSON
- Fix RLS policies: permitir SELECT público para o frontend

---

## [v2.0.0] - 2026-02-20

### Adicionado
- Controle de Acesso (RBAC) com roles e permissões
- Módulo RH e Frota expandidos
- Funcionalidades de segurança

---

## [v1.0.0] - 2026-02-15

### Adicionado
- Versão inicial do TerraPro ERP
- OCR Inteligente para documentos
- Dashboard operacional
- Cadastros gerais
- Mapa de operações
