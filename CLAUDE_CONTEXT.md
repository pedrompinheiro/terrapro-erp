# CONTEXTO DO PROJETO TERRAPRO ERP - SESSAO ATIVA

> **IMPORTANTE**: Este arquivo deve ser lido no inicio de cada sessao para recuperar o contexto.
> Ultima atualizacao: 2026-03-04

---

## ESTADO ATUAL DO PROJETO

### Resumo Geral:
**ERP completo para Transportadora e Terraplanagem Terra LTDA** (Dourados/MS)
- Stack: React 19 + TypeScript + Vite + Supabase + Tailwind
- Oficina interna para maquinas pesadas (escavadeiras, pas carregadeiras, tratores, caminhoes)
- 36 mecanicos, 120 fornecedores, 1.881 produtos no estoque

---

## MODULOS IMPLEMENTADOS (100% Supabase)

### 1. Almoxarifado / Inventario - COMPLETO
- **Pagina**: `pages/Inventory.tsx` (6 abas)
- **Servico**: `services/inventoryService.ts` (1.164 linhas)
- **Tipos**: `types.ts` - InventoryItem com 50+ campos
- **13 Componentes** em `components/inventory/`:
  - `EstoqueTab.tsx` - CRUD de produtos, busca, filtros, paginacao
  - `MovimentacoesTab.tsx` - Rastreamento entrada/saida
  - `MovementFormModal.tsx` - Modal de nova movimentacao
  - `ItemMovementHistory.tsx` - Historico por item
  - `OrdensServicoTab.tsx` - 994 OS migradas, filtros, detail modal
  - `ComprasTab.tsx` - 3 sub-abas (Pedidos, Retiradas, NF)
  - `RetiradasSubTab.tsx` - Ciclo completo de retiradas com alocacao
  - `ReceiptModal.tsx` - Modal de recebimento
  - `AllocationPanel.tsx` - Painel de rateio por equipamento/centro de custo
  - `NotasFiscaisSubTab.tsx` - Import NF-e, matching, vinculacao
  - `NfImportModal.tsx` - Upload PDF/imagem com OCR via Edge Function
  - `TecnicosTab.tsx` - CRUD de mecanicos
  - `RelatoriosTab.tsx` - Dashboards, categorias, itens abaixo do minimo, tendencias
- **Banco**: 12+ tabelas (inventory_items, inventory_categories, inventory_brands, inventory_movements, service_orders, service_order_items, purchase_orders, purchase_order_items, technicians, etc.)
- **Views**: v_inventory_summary_by_category, v_inventory_below_minimum, v_pending_invoices, v_cost_by_equipment_month, v_cost_by_cost_center_month
- **RPCs**: finalize_receipt(), confirm_nf_entry()

### 2. Consulta NF-e via Certificado Digital A1
- **Edge Function**: `supabase/functions/nfe-consulta/`
- **SQL**: `sql/setup_nfe_certificate.sql`
- Consulta direto na SEFAZ com certificado .pfx

### 3. NF-e Parser (OCR)
- **Edge Function**: `supabase/functions/nfe-parser/`
- Upload de PDF/imagem de NF e extracao de dados via IA

### 4. GPS / Rastreamento (Selsyn)
- **Servico**: `services/selsyn.ts`
- **Edge Function**: `supabase/functions/gps-processor/`
- **Pagina**: `pages/MapDigital.tsx` - Mapa com Leaflet
- **Daemon**: `scripts/track_daemon.ts`

### 5. Combustivel
- **Pagina**: `pages/FuelManagement.tsx` - Registro, parcelamento, financeiro
- **Pagina**: `pages/FuelReports.tsx` - Relatorios
- **SQL**: `sql/fix_fuel_records_columns.sql`

### 6. RH / Ponto Eletronico
- **Pagina**: `pages/HRManagement.tsx`
- **Pagina**: `pages/TimecardCalc.tsx` - Calculo CLT completo
- **Pagina**: `pages/Timekeeping.tsx` - Importacao OCR (Gemini AI)
- **Servico**: `services/TimecardService.ts` - OCR reescrito, fuzzy matching
- **Servico**: `services/timecardCalculator.ts` - Engine CLT (875 linhas)
- **Componente**: `components/hr/WorkShiftForm.tsx` - 3 abas
- **Componente**: `components/TimeInput.tsx` - Input de horario com mascara HH:MM
- **SQL**: `sql/migrate_work_shifts.sql`, `sql/import_seculum_shifts.sql`
- **Funcionalidades TimecardCalc**:
  - Campos de horario editaveis inline com TimeInput
  - Justificativa por periodo (1 e 2) com popover inline (digita letra no campo)
  - Deslocar batidas por linha (botoes ‹/› no hover de cada dia)
  - Relatorio geral em lote: modal com periodo De/Ate, preview HTML com toolbar imprimir/PDF
  - Exportacao XLSX do relatorio geral (lib xlsx, uma aba por funcionario)
  - Colunas: Dia, DS, Tp(FER/CMP), Ent.1-Sai.3, Trab, Esp, HE 50%, HE 100%, Extra, Falta, Not.
  - Totais: Trabalhado, Esperado, HE 50/100%, HE Util/Sab/Dom/Fer, Faltas, Noturno, Saldo
  - Banco: tabela `absence_justifications` (Atestado, Chuva, Dispensado, Sobreaviso)
  - Banco: coluna `justification2` em `time_entries` para periodo 2

### 7. Financeiro — FASE 1 COMPLETA (Sessao 2026-03-04)
- **Pagina**: `pages/Financial.tsx` — Reescrito como container modular (~430 linhas vs 1523 original)
- **5 Sub-componentes extraidos**:
  - `pages/FinancialDashboard.tsx` — Painel principal
  - `pages/FinancialSettle.tsx` — Baixa de titulos
  - `pages/FinancialDRE.tsx` — Demonstracao de resultados
  - `pages/FinancialCostCenters.tsx` — Centros de custo
  - `pages/FinancialBanks.tsx` — Contas bancarias
- **4 Novos servicos**:
  - `services/adminSecurityService.ts` — Verificacao de senha admin (Edge Function)
  - `services/formasPagamentoService.ts` — CRUD formas de pagamento
  - `services/planoContasService.ts` — Plano de contas gerencial
  - `services/transferenciaService.ts` — Transferencias entre contas
- **Edge Function**: `supabase/functions/verify-admin-password/index.ts` — Deployada
- **SQL**: `migrations/20260303_fase1_fundacao.sql` — DDL completa (497 linhas)
- **Pagina**: `pages/Billing.tsx` - Faturamento
- **Servicos**: bankService.ts, bankingService.ts, cnabService.ts, paymentService.ts, receivableService.ts
- **SQL**: `sql/setup_financeiro_completo.sql`, `sql/seed_bank_accounts.sql`, `sql/migrate_centros_custo_dre.sql`

### 8. Manutencao
- **Pagina**: `pages/Maintenance.tsx` - Supabase (nao mais mock)
- **SQL**: `sql/create_maintenance_os.sql`

### 9. Frota / Cadastros
- **Pagina**: `pages/FleetManagement.tsx`
- **Pagina**: `pages/Registrations.tsx`
- **Servico**: `services/fleetService.ts`

### 10. Administracao
- **Pagina**: `pages/Settings.tsx` - 2 abas (Usuarios + Integracoes/API Keys)
- **Edge Function**: `supabase/functions/admin-actions/` - listUsers, setUserStatus
- **SQL**: `sql/create_system_settings.sql` - Tabela de configuracoes
- Sistema de aprovacao de usuarios (PENDING/APPROVED/BLOCKED)
- Painel de API Keys (Gemini, Selsyn, WhatsApp, SMTP)

### 11. Outros Modulos
- `pages/Dashboard.tsx` / `DashboardBI.tsx` - Paineis
- `pages/BIReports.tsx` - Relatorios BI
- `pages/OperationsMap.tsx` - Mapa de operacoes
- `pages/Documents.tsx` - GED
- `pages/SecurityAudit.tsx` - Auditoria
- `pages/SystemLogs.tsx` - Logs
- `pages/WhatsAppAutomation.tsx` - WhatsApp (Evolution API)
- `pages/DailyControl.tsx` - Controle diario

---

## BANCO DE DADOS SUPABASE

### Tabelas Principais:
| Grupo | Tabelas |
|-------|---------|
| Almoxarifado | inventory_items (1881), inventory_categories (53), inventory_brands (50), inventory_movements, service_orders (994), service_order_items (2543), purchase_orders (1941), purchase_order_items (4572), technicians (36) |
| RH | employees, time_entries, work_shifts |
| Frota | assets, fuel_records |
| Financeiro | centros_custo, bank_accounts, financial_transactions |
| Admin | user_profiles, system_settings |
| Geral | entities (clientes/fornecedores) |

### Edge Functions:
| Funcao | Status |
|--------|--------|
| admin-actions | Deployada |
| gps-processor | Pendente deploy (endpoint corrigido) |
| nfe-consulta | Deployada |
| nfe-parser | Deployada |
| verify-admin-password | Deployada (2026-03-04) |

---

## DADOS DA EMPRESA

- **Razao Social**: Transportadora e Terraplanagem Terra LTDA
- **Cidade**: Dourados/MS
- **Atividade**: Oficina interna para maquinas pesadas
- **Equipamentos**: Escavadeiras, pas carregadeiras, tratores, caminhoes
- **Codigo interno como "placa"**: ME01, MC02, RT03, etc.

---

## BANCO LEGADO (OS Oficina 7.2) - MIGRADO

- **Backup**: `backups/BACKUP_OSOFICINA7.2_000009.rar`
- **Formato**: DBF (dBase/Visual FoxPro), encoding latin-1
- **Script de migracao**: `scripts/migrate_osoficina_to_supabase.cjs`
- **Status**: MIGRADO COM SUCESSO (todos os registros conferidos)

---

## ARQUIVOS SQL EXECUTADOS

| Arquivo | Status |
|---------|--------|
| setup_almoxarifado_completo.sql | Executado |
| setup_retiradas_nf.sql | Executado |
| setup_nfe_certificate.sql | Executado |
| setup_financeiro_completo.sql | Executado |
| create_maintenance_os.sql | Executado |
| create_system_settings.sql | Executado |
| migrate_work_shifts.sql | Executado |
| import_seculum_shifts.sql | Executado |
| fix_fuel_records_columns.sql | Executado |
| migrate_centros_custo_dre.sql | Executado |
| seed_bank_accounts.sql | Executado |
| seed_centros_custo_terra_maquinas.sql | Executado |
| setup_rbac.sql | Executado |

---

## ROTAS DO APP

| Rota | Pagina | Modulo |
|------|--------|--------|
| / | Dashboard | Painel |
| /bi | BIReports | BI |
| /inventory | Inventory | Almoxarifado (6 abas) |
| /daily | DailyControl | Operacoes |
| /fleet | FleetManagement | Frota |
| /maintenance | Maintenance | Manutencao |
| /financial | Financial | Financeiro |
| /billing | Billing | Faturamento |
| /map | MapDigital | GPS/Mapa |
| /fuel | FuelManagement | Combustivel |
| /fuel/reports | FuelReports | Relatorios Combustivel |
| /whatsapp | WhatsAppAutomation | WhatsApp |
| /rh | HRManagement | RH |
| /cadastros | Registrations | Cadastros |
| /operations-map | OperationsMap | Mapa Operacoes |
| /documents | Documents | GED |
| /security | SecurityAudit | Auditoria |
| /configuracoes | Settings | Admin |
| /system-logs | SystemLogs | Logs |
| /ponto/calculos | TimecardCalc | Calculo Ponto |
| /ponto/ocr | Timekeeping | OCR Ponto |

---

## DEPLOY / HOSTING

### Producao: HostGator (www.terramaquinas.com.br)
- **Tipo**: Hospedagem cPanel (arquivos estaticos)
- **Processo de deploy**:
  1. `npm run build` — gera pasta `dist/`
  2. Adicionar `.htaccess` na dist (SPA routing + cache + gzip)
  3. Zipar: `cd dist && zip -r terrapro-deploy.zip .`
  4. Upload via cPanel > Gerenciador de Arquivos > `public_html`
  5. Extrair o zip por cima

### Desenvolvimento local
```bash
npm install
npm run dev
# Acessa em http://localhost:3000
# Precisa do .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
```

### .htaccess necessario no dist/
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## SESSAO 2026-03-03 — RESUMO DE ALTERACOES

### Branch: `claude/distracted-edison`

**Commits realizados:**
1. `e2aa8fc` — Relatorio em lote com periodo, deslocar por linha, fix justificativa
2. `954e0ca` — Colunas HE 50% e HE 100% no relatorio geral
3. `6e84f1b` — Exportacao XLSX e correcao coluna Tp

**O que foi feito nesta sessao:**

1. **Fix modal relatório geral** — Substituido selects `bulkMonth`/`bulkYear` (variaveis deletadas, causava crash) por inputs `type="date"` com `bulkStartDate`/`bulkEndDate`

2. **Fix justificativa travando/piscando/sumindo dados** — Removido `useCallback` com closure stale que capturava `handleCalculate` antigo. Adicionado try/catch e checagem de erro DB em `handleSetPeriodJustification` e `handleSetJustification`

3. **Deslocar batidas por linha** — Removido botoes DESLOCAR do header (avancava mes inteiro). Adicionado botoes ‹/› por linha na coluna "Mov." com hover reveal (Tailwind group/group-hover)

4. **Colunas HE 50% e HE 100%** — Adicionadas no relatorio geral entre ESP e EXTRA, tanto no HTML quanto no XLSX

5. **Coluna Tp corrigida** — Mostra apenas FER (feriado) e CMP (compensado), removido DOM/SAB redundante com coluna DS

6. **Exportacao XLSX** — Botao "Salvar XLSX" no modal, gera arquivo com uma aba por funcionario usando lib `xlsx`. Formato: `Cartao_Ponto_DD-MM-YYYY_a_DD-MM-YYYY.xlsx`

**Pendencias identificadas (nao implementadas):**
- Espelho de Ponto (Portaria 1510) — identificado como faltante vs Secullum, nao solicitado
- Faixas adicionais de HE (Ex75%) e ExNot (hora extra noturna separada) — Secullum tem, nao implementado
- Adin./Atras. (adicional/atraso) tracking por dia — Secullum tem, nao implementado

---

## SESSAO 2026-03-04 — RESUMO DE ALTERACOES

### Branch: `claude/strange-poincare` (merge com `distracted-edison`)

**Commits realizados:**
1. `3a15fed` — Fase 1 Financeiro + eliminar dados mocados + recalcular ponto
2. `a41bb55` — Merge claude/distracted-edison (35 commits)

**O que foi feito nesta sessao:**

### 1. Fase 1 Modulo Financeiro
- Reescrita completa do `Financial.tsx` como container modular (~430 linhas vs 1523)
- 5 sub-componentes extraidos (Dashboard, Settle, DRE, CostCenters, Banks)
- 4 novos servicos Supabase (adminSecurity, formasPagamento, planoContas, transferencia)
- Migracao SQL `20260303_fase1_fundacao.sql` (497 linhas)
- Edge Function `verify-admin-password` deployada no Supabase

### 2. Eliminacao de TODOS os dados mocados
- `services/http/httpClient.ts` — `USE_MOCK = false`
- `services/api.ts` — Reescrita completa: removidas 10 arrays MOCK_*, todas funcoes agora consultam Supabase
  - `getAssets()` → `supabase.from('assets')`
  - `getMaintenanceOS()` → `supabase.from('maintenance_os')` com join assets
  - `getDocuments()` → `supabase.from('documents')` com mapeamento ERPDocument
  - `getAuditLogs()` → `supabase.from('financial_audit_log')`
  - `getStats()` → Agregacoes reais de assets, maintenance_os, movimentos_bancarios
  - `getActivities()` → Ultimas 10 entradas de financial_audit_log
  - `getHRPayroll()` → `supabase.from('employees')`
- `pages/Dashboard.tsx` — Stats dinamicos do banco, DashboardAlerts com queries reais (OS pendentes, titulos vencidos), feed de atividades com empty state
- `pages/SecurityAudit.tsx` — Empty state para sessoes ativas

### 3. Botao "Recalcular Periodo" no RH
- `pages/HRManagement.tsx` — Botao amber que recalcula totalHours de todos os registros visiveis na tela
- Usa `calculateTimeDiff()` e `formatMinutesToHHMM()` existentes
- Upsert com status 'RECALCULADO' no Supabase
- Confirmacao com contagem e range de datas

### 4. Multi-provider IA (merge do distracted-edison)
- `lib/aiService.ts` — Suporta OpenAI (gpt-4o-mini), Gemini (2.5-flash), Groq (llama-3.3-70b)
- `lib/getGeminiKey.ts` — Busca chave de `system_settings` com cache de 5 min, fallback .env.local
- `services/TimecardService.ts` — OCR usando aiService (le chave das Configuracoes, nao mais .env.local)
- `lib/geminiService.ts` — Analise de frota via aiService
- **Chave Gemini agora lida das Configuracoes** (tela Settings > Google Gemini AI), nao precisa mais do .env.local

### 5. Correcao do calculo de ponto (tolerancia)
- `services/timecardCalculator.ts` — Removida tolerancia que descontava 5min de toda hora extra
- **Antes**: `overtimeMin = diff - shift.tolerance_overtime` (roubava 5 min)
- **Depois**: `overtimeMin = diff` (toda hora extra conta integralmente)
- Mesma correcao para faltas: `absenceMin = Math.abs(diff)` (sem tolerancia)

### 6. Deploy em producao (HostGator)
- Site online em **www.terramaquinas.com.br**
- Build estatico via `npm run build` (3.4MB)
- Upload via cPanel (zip + extract em public_html)
- `.htaccess` configurado para SPA routing + cache + gzip

### 7. Sincronizacao de branches
- Merge do `distracted-edison` no `strange-poincare` — trouxe 35 commits incluindo:
  - TimecardCalc completo (XLSX, relatorio em lote, justificativas, HE 50%/100%)
  - OCR com seletor mes/ano e confirmacao de data
  - TimeInput com mascara HH:MM
  - WhatsApp automacao
  - Integracoes v2
  - OS Oficina (ServiceOrderFormModal)
  - Diversos fixes

**Arquivos chave modificados/criados nesta sessao:**
| Arquivo | Acao |
|---------|------|
| pages/Financial.tsx | Reescrito (container modular) |
| pages/Financial{Dashboard,Settle,DRE,CostCenters,Banks}.tsx | Novos |
| services/{adminSecurity,formasPagamento,planoContas,transferencia}Service.ts | Novos |
| services/api.ts | Reescrito (100% Supabase) |
| services/http/httpClient.ts | USE_MOCK = false |
| services/timecardCalculator.ts | Fix tolerancia HE |
| pages/Dashboard.tsx | Stats + alertas dinamicos |
| pages/HRManagement.tsx | Botao Recalcular Periodo |
| pages/SecurityAudit.tsx | Empty state sessoes |
| lib/aiService.ts | Multi-provider IA (merge) |
| lib/getGeminiKey.ts | Chave do system_settings (merge) |
| services/TimecardService.ts | OCR via aiService (merge) |
| pages/TimecardCalc.tsx | Relatorio completo (merge) |
| pages/Timekeeping.tsx | Seletor mes/ano OCR (merge) |
| components/TimeInput.tsx | Mascara HH:MM (merge) |
| migrations/20260303_fase1_fundacao.sql | DDL Financeiro |
| supabase/functions/verify-admin-password/index.ts | Edge Function |

**Erros encontrados e resolvidos:**
- Write tool "File has not been read yet" — workaround com Bash heredoc
- ERPDocument type mismatch (name→title, size→fileSize) — corrigido mapeamento
- .env.local ausente no worktree — copiado do repo principal
- Edge Function deploy falhando — file nao estava no repo principal, copiado e deployado
- launch.json porta errada (5173→3000) — corrigido
- Gemini 1.5-flash descontinuado → atualizado para 2.5-flash via aiService
- Tolerancia de HE descontando 5min → removida

**Supabase project ref**: `xpufmosdhhemcubzswcv`
**Vite dev port**: 3000
**Worktree path**: `/Users/pedromi/Downloads/terrapro-erp---gestão-de-ativos/.claude/worktrees/strange-poincare/`
**Main repo path**: `/Users/pedromi/Downloads/terrapro-erp---gestão-de-ativos/`
