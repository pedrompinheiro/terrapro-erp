
# Plano de Implementação e Verificação Automática - TerraPro ERP

Este documento detalha o estado atual dos módulos e o plano para verificação automática de integridade (CRUD Check).

## 1. Módulos Implementados

### 🟢 Gestão de Frota (Fleet)
- **Status:** Completo e Integrado com Supabase.
- **Tabelas:** `assets`
- **Funcionalidades:** Cadastro, Edição, Exclusão, Listagem, Integração GPS (Selsyn).
- **Verificação Automática:** ✅ Possível via `FleetService`.

### 🟢 Recursos Humanos (HR)
- **Status:** Completo e Integrado com Supabase.
- **Tabelas:** `employees`, `time_entries`, `work_shifts`, `companies`
- **Funcionalidades:** Cadastro de Funcionários, Ponto Eletrônico, OCR, Turnos.
- **Verificação Automática:** ✅ Possível via scripts diretos no banco.

### 🟡 Manutenção (Maintenance)
- **Status:** Parcial / Mock Data.
- **Tabelas:** `maintenance_orders` (A migrar).
- **Ação:** Precisa ser migrado de `api.ts` (mock) para Supabase.

### 🟡 Financeiro, Estoque, Combustível
- **Status:** Mock Data (Dados Fictícios).
- **Ação:** Migração futura necessária.

---

## 2. Estratégia de Checagem Automática

Para garantir que o sistema não regrida, implementaremos um **Auditor de Sistema** (`SystemAuditor`) que executará testes ponta-a-ponta nas camadas de serviço.

### O que será testado?

1.  **Ciclo de Vida de Ativo (Veículo):**
    *   Criar um veículo de teste (`TEST-AUTO-001`).
    *   Ler o veículo criado.
    *   Atualizar o odômetro.
    *   Excluir o veículo.

2.  **Ciclo de Vida de Funcionário (RH):**
    *   Criar funcionário de teste (`TEST-EMP-001`).
    *   Atualizar cargo.
    *   Inativar funcionário.
    *   Excluir funcionário (Hard Delete para limpeza).

3.  **Conectividade GPS:**
    *   Ping na API Selsyn.

## 3. Como Executar

Um novo botão **"Diagnóstico do Sistema"** será adicionado na tela de **Configurações**.
Ao clicar, o sistema executará os testes acima e gerará um relatório detalhado nos Logs do Sistema.

---
**Próximos Passos Imediatos:**
1. Criar `services/systemAuditor.ts`.
2. Adicionar UI de disparo em `Settings.tsx` (Configurações) ou `TestConnection.tsx`.
