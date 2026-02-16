-- SCRIPT DE CORREÇÃO (Versão Compatível - Sem Constraint Unique)
-- Cadastra as empresas verificando manualmente se já existem para evitar duplicidade.

-- 1. DOURADÃO MATERIAIS PARA CONSTRUÇÃO
INSERT INTO companies (name, document, plan, created_at)
SELECT 'DOURADÃO MATERIAIS PARA CONSTRUÇÃO', '03.334.384/0001-77', 'Enterprise', NOW()
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE document = '03.334.384/0001-77');

-- 2. TRANSPORTADORA E TERRAPLANAGEM TERRA (Matriz)
INSERT INTO companies (name, document, plan, created_at)
SELECT 'TRANSPORTADORA E TERRAPLANAGEM TERRA', '14.628.837/0001-94', 'Enterprise', NOW()
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE document = '14.628.837/0001-94');

-- 3. CONSTRUTERRA CONSTRUTORA DE OBRAS CIVIS
INSERT INTO companies (name, document, plan, created_at)
SELECT 'CONSTRUTERRA CONSTRUTORA DE OBRAS CIVIS', '06.152.273/0001-38', 'Enterprise', NOW()
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE document = '06.152.273/0001-38');

-- 4. MEP MATERIAIS PARA CONSTRUCAO
INSERT INTO companies (name, document, plan, created_at)
SELECT 'MEP MATERIAIS PARA CONSTRUCAO', '25.214.690/0001-02', 'Enterprise', NOW()
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE document = '25.214.690/0001-02');


-- VÍNCULO DE EMERGÊNCIA
-- Vincula todos os funcionários sem empresa à 'TRANSPORTADORA TERRA' (Matriz)
-- Isso permite que eles apareçam na lista para você editar depois.
UPDATE employees
SET company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1)
WHERE company_id IS NULL;

-- Garante permissões
GRANT SELECT ON companies TO authenticated;
GRANT SELECT ON companies TO anon;
