# Configuração do Plano de Centros de Custo (DRE)

Para habilitar o novo sistema de Centros de Custo hierárquico (DRE), siga os passos abaixo no seu banco de dados Supabase:

## 1. Atualizar Estrutura do Banco (Migração)

Copie e execute o conteúdo do arquivo `sql/migrate_centros_custo_dre.sql` no SQL Editor do Supabase.
Este script adiciona as colunas `codigo`, `tipo`, `grupo_dre` e `empresa_cnpj` à tabela `centros_custo`.

## 2. Povoar o Plano de Contas (Seed)

Copie e execute o conteúdo do arquivo `sql/seed_centros_custo_terra_maquinas.sql` no SQL Editor.
Este script irá limpar os centros de custo existentes (opcional) e inserir todo o catálogo da Terra Máquinas já categorizado.

Após isso, recarregue a página Financeiro no navegador.

---
**Observação:**
Se você receber erro de "column does not exist", certifique-se de rodar o passo 1 primeiro.
