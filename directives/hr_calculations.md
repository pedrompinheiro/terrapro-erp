# Diretriz de Cálculo de Horas (CLT)

**Objetivo:** Padronizar o cálculo de jornada de trabalho, horas extras e adicionais noturnos conforme a legislação trabalhista brasileira (CLT) e regras de negócio do TerraPro ERP.

## Parâmetros Globais
- **Carga Horária Padrão:** Definida por turno (ex: 08:48 seg-sex) ou escala.
- **Tolerância (Art. 58 CLT):** Variações de até **10 minutos diários** (soma de atrasos e saídas antecipadas ou extras) são desconsideradas.
  - Se `|Saldo| <= 10 min` -> Saldo = 0.
  - Se `|Saldo| > 10 min` -> Considera-se o tempo integral.

## Regras de Processamento

### 1. Adicional Noturno
- **Horário:** Trabalho realizado entre **22:00 e 05:00**.
- **Fator de Redução:** A hora noturna tem 52 minutos e 30 segundos.
  - Fator de conversão: `60 / 52.5 ≈ 1.142857`.
  - Exemplo: 60 minutos relógio = ~68 minutos remunerados.
- **Extensão:** Se a jornada cumprida integralmente em horário noturno e prorrogada, o adicional incide sobre as horas prorrogadas (Súmula 60 TST). *Nota: Implementação atual foca no intervalo fixo 22h-05h.*

### 2. Classificação de Horas Extras
- **Extras 50%:**
  - Horas excedentes realizadas em **dias úteis** e **sábados** (salvo se sábado for dia de repouso na escala).
- **Extras 100% (Dobro):**
  - Horas trabalhadas em **Domingos** e **Feriados Nacionais**, exceto se o domingo for dia normal de trabalho conforme escala (ex: 12x36).
  - Se o funcionário trabalhar no domingo de sua folga (DSR), é 100%.

### 3. Faltas e Atrasos
- Saldo negativo superior à tolerância é contabilizado integralmente como falta/atraso.
- Exceções (Abonos): Registros com status `ATESTADO`, `FÉRIAS`, `FERIADO` (se não trabalhado) zeram o saldo negativo.

## Implementação Técnica
A lógica de cálculo reside na função `calculateDailyStats` em `pages/HRManagement.tsx`.

### Inputs
- Entradas e Saídas (`entry1`, `exit1`, `entry2`, `exit2`).
- Data do registro.
- ID do Funcionário (para consultar turno e escala).

### Outputs (DailyStats)
- `totalWorked`: Minutos totais de relógio.
- `nightlyAdd`: Minutos adicionais pela redução noturna.
- `balance`: Saldo final (Trabalhado + Noturno - Esperado).
- `extra50`: Minutos de HE 50%.
- `extra100`: Minutos de HE 100%.
- `missing`: Minutos de falta.

## Manutenção
Qualquer alteração na regra de tolerância ou percentuais deve ser refletida aqui e no código correspondente.
