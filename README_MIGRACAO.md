# Guia de Correção de Migração - RH TerraPro

Pedro, devido à codificação dos PDFs de Holerite, não consegui extrair os dados automaticamente. Mas já preparei a solução para você organizar tudo!

## 1. Passo Crítico: Criar as Empresas
Para que o erro `company_id violates not-null constraint` desapareça, você precisa cadastrar as empresas no banco.

👉 **Ação:** Abra o SQL Editor do Supabase, copie e rode o conteúdo do arquivo `insert_companies_fix.sql`.

O que ele faz:
- Cria as empresas: **Douradão, Terra, Construterra e MEP**.
- Vincula **todos** os funcionários atuais à **Transportadora Terra** (Matriz) temporariamente, para que eles apareçam na lista e você possa editar.

## 2. Passo: Organizar Funcionários
Agora vá em **Cadastros > Funcionários**:
1. Você verá todos os funcionários listados.
2. Clique no ícone de **Lápis (Editar)**.
3. No campo "Empresa Vinculada", mude para a empresa correta (ex: MEP).
4. Aproveite para preencher o "Salário Base" se souber.

## 3. Próximos Passos (Dados Adicionais)
Se puder me enviar os dados abaixo, eu automatizo o resto:
- **Lista de Funcionários (Excel/CSV):** Com colunas `Nome` e `Empresa`.
- **Regras de Ponto (Imagem/PDF):** Um exemplo de espelho de ponto antigo para eu calibrar os cálculos de horas extras.
