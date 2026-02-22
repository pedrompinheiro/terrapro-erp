# Changelog - Sessões Claude Code (16-18/02/2026)

## Resumo
Correções na integração GPS/Selsyn, redesign do Mapa Digital, integração financeira, sistema completo de cálculo trabalhista de ponto, importação OCR de cartão de ponto via IA, e painel de administração com aprovação de usuários e gestão de API Keys.

---

## Sessão 3 — 18/02/2026

### 17. Importação de Turnos Seculum 4 → Supabase
**Problema:** 29 turnos de trabalho estavam apenas no banco MDB do Seculum 4 (Access).
**Solução:** Script Python para exportar horários/faixas do MDB via CSV e gerar SQL de import completo.

**Arquivo criado:**
- `sql/import_seculum_shifts.sql` (~340 linhas) — 29 INSERTs com schedule_by_day JSONB + overtime_rules

**Turnos importados:** LOJA, LOJA TURNO 02, TURNO A/B/C BAL, BAL, TURNO A/B/C MTV, MTV 12HRS (variantes), BAL FARELO A/B, SILO T1/T2/T3, SEG A SEXTA, INPASA, ESTAGIÁRIO, Oficina, TRECHO, etc.

**Status:** ✅ Executado pelo usuário.

---

### 18. TimecardCalc — Seletor de Turno + Visualização Semanal
**Problema:** Não havia como atribuir/mudar turno diretamente na tela de cálculo, nem visualizar a escala semanal.
**Solução:** Duas adições ao TimecardCalc.tsx:

**Seletor de turno inline:**
- Dropdown ao lado do nome do funcionário para mudar turno
- Salva direto no `employees.work_shift_id` via Supabase

**Quadro semanal visual:**
- Grid de 7 colunas (SEG-DOM) mostrando entrada/saída por dia
- Cores: amber (sábado), orange (domingo), gray (folga)
- Badges: horas/semana, tolerância, COMPENSADO
- Baseado no `schedule_by_day` JSONB do turno

**Seletor de período:**
- Movido do header global para dentro do card do funcionário
- Mesma linha: `⏰ Turno: [LOJA ▼] | 📅 Período: [◀ Fev 2026 ▶]`

**Arquivo alterado:**
- `pages/TimecardCalc.tsx` — ShiftOption expandido, fetchShifts atualizado, handleChangeShift, getShiftScheduleForDay, componente visual semanal

---

### 19. Reescrita Completa do OCR — TimecardService.ts
**Problema:** OCR tinha duas implementações inconsistentes (TimecardService vs HRManagement), só suportava 4 campos por dia, prompt genérico, sem fuzzy matching de nomes.
**Solução:** Reescrita unificada do serviço.

**Arquivo alterado:**
- `services/TimecardService.ts` — reescrita completa (~280 linhas)

**Melhorias:**
- **Prompt otimizado:** Contexto CLT brasileiro, quinzenas, 3 pares entrada/saída, regras de extração detalhadas
- **6 campos por dia:** entrada1-3, saida1-3 (antes só tinha 4)
- **Confidence score:** 0-100 + warnings da IA
- **Processamento em lote:** `processTimecardBatch()` com callback de progresso
- **Fuzzy matching:** `matchEmployee()` com normalização de acentos, Levenshtein distance, score ponderado (≥40% para match)
- **normalizeTime():** Aceita HH:MM, H:MM, HHMM, HH.MM e variações
- **ocrEntriesToTimeEntries():** Converte direto para formato do Supabase (inclui entry_time2/break_start2)

---

### 20. Reescrita Completa da Página de OCR — Timekeeping.tsx
**Problema:** Página simples com upload único, save não implementado, sem seleção de funcionário.
**Solução:** Página completa e funcional de importação por IA.

**Arquivo alterado:**
- `pages/Timekeeping.tsx` — reescrita completa (~600 linhas)

**Funcionalidades:**
- Upload múltiplo com drag & drop
- Processamento Gemini 1.5 Flash com status por card (pendente/processando/sucesso/erro/salvo)
- Auto-match de funcionário por nome (fuzzy) + dropdown manual com busca
- Tabela editável com 6 colunas (3 pares entrada/saída) + checkbox por dia
- Destaque visual para finais de semana
- Marcar/desmarcar todos os dias
- Retry individual por card
- Upsert direto no `time_entries` com `onConflict: employee_id,date`
- Badge de confiança e warnings da IA
- Aviso quando chave Gemini não está configurada

**Rota adicionada:**
- `App.tsx` — `/ponto/ocr`
- `constants.tsx` — nav item "Importação OCR Ponto" (ícone Camera, grupo Gestão)

---

### 21. Sistema de Aprovação de Usuários
**Problema:** Quando um novo usuário se cadastrava, ficava com status PENDING e não havia como aprovar/bloquear pelo sistema — só via SQL no Supabase.
**Solução:** Botões de aprovação na tela de Configurações + Edge Function atualizada.

**Arquivos alterados:**
- `supabase/functions/admin-actions/index.ts` — nova action `setUserStatus`, `listUsers` agora retorna `profileStatus` do user_profiles
- `pages/Settings.tsx` — coluna Status, botões APROVAR/BLOQUEAR, banner de pendentes

**Funcionalidades:**
- Banner amarelo quando há usuários pendentes, com botão de aprovação rápida
- Coluna "Status" na tabela: badges PENDENTE (amber), APROVADO (green), BLOQUEADO (red)
- Botão APROVAR (verde) ao lado de cada usuário pendente
- Botão BLOQUEAR (ícone Ban) para negar acesso
- Botão "Reativar" para desbloquear usuários bloqueados
- Card "Pendentes" mostrando quantidade aguardando
- Confirmação via `window.confirm()` antes de qualquer alteração

**Status:** ✅ Edge Function deployada pelo usuário via Dashboard.

---

### 22. Painel de Integrações & API Keys (NOVO)
**Problema:** Chaves de API (Gemini, Selsyn, WhatsApp, SMTP) ficavam no `.env.local` — sem UI para configurar, sem teste de conexão.
**Solução:** Nova aba "Integrações & API" na tela de Configurações + tabela `system_settings` no Supabase.

**Arquivos criados/alterados:**
- `sql/create_system_settings.sql` — **NOVO** (tabela, RLS, trigger, 9 settings pré-cadastradas)
- `pages/Settings.tsx` — reescrita com 2 abas (Usuários + Integrações)

**Tabela `system_settings`:**
- Campos: key, value, label, description, category, is_secret, updated_at, updated_by
- Categorias: api_keys, system, notifications
- RLS habilitado + trigger para updated_at

**9 configurações pré-cadastradas:**
| Chave | Categoria | Secreta |
|-------|-----------|---------|
| `gemini_api_key` | API Keys | ✅ |
| `selsyn_api_key` | API Keys | ✅ |
| `selsyn_api_url` | API Keys | ❌ |
| `whatsapp_api_token` | API Keys | ✅ |
| `company_cnpj` | Sistema | ❌ |
| `smtp_host` | Notificações | ❌ |
| `smtp_port` | Notificações | ❌ |
| `smtp_user` | Notificações | ❌ |
| `smtp_password` | Notificações | ✅ |

**UI da aba Integrações:**
- Cards agrupados por categoria com ícones
- Input com máscara (****) para chaves secretas
- Botão 👁 mostrar/esconder valor
- Botão 📡 testar conexão (Gemini = testa via API, retorna OK ou erro)
- Botão 💾 salvar individual (fica roxo quando há alteração)
- Badge "Configurado" (verde) / "Não configurado" (vermelho) por chave
- Contador de chaves faltando no tab
- Data de última atualização

**Status:** ✅ SQL executado pelo usuário.

---

### 23. Fix Colunas Combustível
**Problema:** FuelManagement.tsx usava colunas que não existiam na tabela `fuel_records` (total_value, installment_interval, price_per_liter, etc).
**Solução:** SQL com ADD COLUMN IF NOT EXISTS para todas as 15 colunas necessárias.

**Arquivo criado:**
- `sql/fix_fuel_records_columns.sql` — 15 ALTERs com IF NOT EXISTS

**Colunas adicionadas:** operation_type, total_value, price_per_liter, asset_id, asset_name, supplier_id, supplier_name, responsible_id, responsible_name, payment_method, installments, installment_interval, first_due_date, invoice_number, horometer

**Status:** ✅ Executado pelo usuário.

---

## Sessão 2 — 17/02/2026

### 11-16. (Veja seção anterior)
- Estudo do Seculum 4, SQL de migração, WorkShiftForm, timecardCalculator, TimecardCalc, navegação

---

## Sessão 1 — 16/02/2026

### 1-10. (Veja seção anterior)
- GPS/Selsyn fixes, MapDigital redesign, senhas hardcoded, integração financeira combustível, parcelamento, FuelReports, Manutenção Supabase

---

## Todos os Arquivos Modificados/Criados (Sessões 1-3)

### Criados
- `pages/FuelReports.tsx` — relatórios de combustível
- `pages/TimecardCalc.tsx` — tela de cálculo de ponto
- `services/timecardCalculator.ts` — engine CLT
- `sql/create_maintenance_os.sql` — DDL manutenção
- `sql/migrate_work_shifts.sql` — migração turnos + tabelas cálculo
- `sql/import_seculum_shifts.sql` — 29 turnos do Seculum 4
- `sql/create_system_settings.sql` — tabela API keys
- `sql/fix_fuel_records_columns.sql` — colunas combustível

### Modificados
- `services/selsyn.ts` — endpoint, auth, expiration
- `services/TimecardService.ts` — reescrita OCR completa
- `services/evolutionService.ts` — remoção fallback senha
- `supabase/functions/gps-processor/index.ts` — endpoint, auth
- `supabase/functions/admin-actions/index.ts` — listUsers com status, setUserStatus
- `scripts/track_daemon.ts` — endpoint, auth
- `pages/MapDigital.tsx` — redesign completo
- `pages/FuelManagement.tsx` — senhas, financeiro, parcelamento, relatórios
- `pages/Financial.tsx` — remoção fallbacks
- `pages/Maintenance.tsx` — reescrita (mock → Supabase)
- `pages/Timekeeping.tsx` — reescrita OCR completa
- `pages/TimecardCalc.tsx` — turno inline, visual semanal, período
- `pages/Settings.tsx` — reescrita com 2 abas (usuários + API keys)
- `components/hr/WorkShiftForm.tsx` — reescrita (3 abas)
- `App.tsx` — rotas: /fuel/reports, /ponto/calculos, /ponto/ocr
- `constants.tsx` — nav items: Cálculo de Ponto, Importação OCR Ponto
- `.env.local` — chave Selsyn
- `CHANGELOG_CLAUDE.md` — este arquivo

---

## SQLs — Status de Execução

| # | Arquivo | Status | Sessão |
|---|---------|--------|--------|
| 1 | `create_maintenance_os.sql` | ✅ Executado | S1 |
| 2 | `migrate_work_shifts.sql` | ✅ Executado | S2 |
| 3 | `import_seculum_shifts.sql` | ✅ Executado | S2 |
| 4 | `fix_fuel_records_columns.sql` | ✅ Executado | S3 |
| 5 | `create_system_settings.sql` | ✅ Executado | S3 |

---

## Edge Functions — Status de Deploy

| Função | Status | Alteração |
|--------|--------|-----------|
| `admin-actions` | ✅ Deployada | +listUsers com profileStatus, +setUserStatus |
| `gps-processor` | ⚠️ Pendente deploy | Endpoint corrigido (S1) |

---

## Ações Pendentes do Usuário
1. **Selsyn GPS:** Habilitar "Integração Passiva" no painel da Selsyn para cada veículo
2. **Gemini AI:** Configurar chave na aba Integrações & API (Configurações) para usar OCR
3. **Edge Function `gps-processor`:** Deploy da versão corrigida (endpoint+auth) no Supabase Dashboard
4. **Testes recomendados:**
   - Aprovar a Viviane via botão na tela de Configurações
   - Testar nova compra de combustível (colunas fix)
   - Configurar chave Gemini e testar importação OCR com foto de cartão de ponto
