
# Cadastro Universal de Parceiros (Clientes & Fornecedores)

O sistema foi atualizado para usar uma estrutura unificada de **Entidades** (Business Partners).

## O que mudou?
- Não existem mais tabelas separadas de `clients` e `suppliers`.
- Existe uma única tabela `entities`.
- Cada cadastro tem flags: `É Cliente` e `É Fornecedor`.
- Isso permite que uma mesma empresa (Ex: "Posto Ipiranga") seja fornecedor de combustível e cliente de serviços ao mesmo tempo, sem duplicar dados.

## Instrução de Instalação (OBRIGATÓRIO):

1.  Acesse o **Supabase Dashboard** > **SQL Editor**.
2.  Copie o conteúdo de `setup_clients_db.sql`.
3.  Execute o script.
    *   **Atenção:** Isso irá apagar as tabelas antigas `clients` e `suppliers` e criar a nova `entities`. Se você já tinha dados reais nelas, faça backup antes.

## Funcionalidades do Frontend:
- Abas separadas visualmente ("Clientes" e "Fornecedores") para organização.
- Cadastro unificado: Marque as caixinhas "Cliente" e/ou "Fornecedor" no topo do modal.
- Consulta de CNPJ continua funcionando.
- Suporte a Pessoa Física (CPF) e Jurídica (CNPJ).
