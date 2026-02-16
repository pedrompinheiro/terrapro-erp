-- Adicionar colunas novas para suportar a estrutura DRE avançada e Multi-empresa
ALTER TABLE IF EXISTS centros_custo 
ADD COLUMN IF NOT EXISTS codigo TEXT,
ADD COLUMN IF NOT EXISTS tipo TEXT, -- RECEITA, CUSTO_DIRETO, DESPESA_FIXA, DESPESA_FINANCEIRA, INVESTIMENTO
ADD COLUMN IF NOT EXISTS grupo_dre TEXT, -- Agrupador para relatórios (Ex: Receita Bruta, EBITDA)
ADD COLUMN IF NOT EXISTS empresa_cnpj TEXT DEFAULT '00.000.000/0001-91'; -- Default para a Matriz se não especificado

-- Criar índice para performance em relatórios
CREATE INDEX IF NOT EXISTS idx_centros_custo_tipo ON centros_custo(tipo);
CREATE INDEX IF NOT EXISTS idx_centros_custo_grupo ON centros_custo(grupo_dre);
CREATE INDEX IF NOT EXISTS idx_centros_custo_empresa ON centros_custo(empresa_cnpj);

-- (Os dados serão inseridos pelo seed_centros_custo_terra_maquinas.sql)
