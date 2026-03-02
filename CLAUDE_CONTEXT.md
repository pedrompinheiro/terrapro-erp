# CONTEXTO DO PROJETO TERRAPRO ERP - SESSAO ATIVA

> **IMPORTANTE**: Este arquivo deve ser lido no inicio de cada sessao para recuperar o contexto.
> Ultima atualizacao: 2026-02-25

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
- **Servico**: `services/timecardCalculator.ts` - Engine CLT
- **Componente**: `components/hr/WorkShiftForm.tsx` - 3 abas
- **SQL**: `sql/migrate_work_shifts.sql`, `sql/import_seculum_shifts.sql`

### 7. Financeiro
- **Pagina**: `pages/Financial.tsx`
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

## COMO RODAR

```bash
npm install
npm run dev
# Acessa em http://localhost:5173
# Precisa do .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
```
