-- Remover a restrição antiga que limitava os tipos de centros de custo
ALTER TABLE centros_custo DROP CONSTRAINT IF EXISTS centros_custo_tipo_check;

-- Adicionar nova restrição Aceitando TODOS os tipos do novo DRE
ALTER TABLE centros_custo ADD CONSTRAINT centros_custo_tipo_check 
CHECK (tipo IN (
    'RECEITA', 
    'DESPESA', 
    'CUSTO_DIRETO', 
    'DESPESA_FIXA', 
    'DESPESA_VARIAVEL', 
    'DESPESA_FINANCEIRA', 
    'RECEITA_FINANCEIRA', 
    'INVESTIMENTO'
));
