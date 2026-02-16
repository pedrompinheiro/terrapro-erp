# Migração para Cadastro Unificado de Entidades

## Visão Geral
Em Fevereiro de 2026, o sistema TerraPro ERP passou por uma reestruturação no módulo de cadastros. As antigas tabelas `clients` e `suppliers` foram unificadas em uma única tabela chamada `entities`.

## Mudanças no Banco de Dados

### Nova Tabela: `public.entities`
Esta tabela centraliza todos os parceiros de negócios (Pessoas Físicas e Jurídicas).

**Principais Colunas:**
- `id`: UUID (Chave Primária)
- `name`: Nome Fantasia ou Nome Completo
- `social_reason`: Razão Social (para PJ)
- `document`: CPF ou CNPJ
- `type`: 'PF' ou 'PJ'
- `is_client`: Boleano (Define se é Cliente)
- `is_supplier`: Boleano (Define se é Fornecedor)
- `supplier_category`: Categoria específica para fornecedores
- `credit_limit`: Limite de crédito específico para clientes
- ... (endereço, contatos, etc)

### Vantagens
1. **Unificação**: Um mesmo parceiro pode ser simultaneamente Cliente e Fornecedor (basta marcar ambas as flags).
2. **Manutenção**: Redução de código duplicado no Frontend e Backend.
3. **Simplicidade**: Uma única tela para gerenciar todos os cadastros.

## Mudanças no Frontend

- **Nova Rota**: `/cadastros`
- **Novo Componente**: `pages/Registrations.tsx`
- **Menu Lateral**: Item "Cadastros Gerais" substitui "Clientes" e "Fornecedores".

## Como Usar
1. Acesse o menu **Cadastros Gerais**.
2. Use as abas superiores para filtrar a visualização entre **Clientes** e **Fornecedores**.
3. Ao criar um **Novo Parceiro**, você pode marcar se ele é Cliente, Fornecedor ou Ambos.
   - Campos específicos aparecem dinamicamente conforme as opções selecionadas (ex: Limite de Crédito para Clientes).

## Scripts de Migração e Correção
- `FIX_PERMISSIONS.sql`: Script para corrigir permissões RLS na nova tabela `entities`.
