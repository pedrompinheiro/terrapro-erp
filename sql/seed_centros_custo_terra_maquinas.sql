-- Limpar centros de custo existentes (opcional, para limpar sujeira inicial)
DELETE FROM centros_custo;

-- Inserir Centros de Custo Baseados na Estrutura DRE da Terra Máquinas

-- 1. RECEITAS
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Receita – Locação Escavadeiras Hidráulicas', '1.01', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Mini Escavadeiras', '1.02', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Motoniveladoras', '1.03', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Pás Carregadeiras', '1.04', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Mini Pás Carregadeiras', '1.05', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Retroescavadeiras', '1.06', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Tratores Agrícolas', '1.07', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Tratores de Esteira', '1.08', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Rolos Compactadores', '1.09', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Caminhões Basculantes', '1.10', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Transporte / Pranchas', '1.11', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Caminhão Pipa', '1.12', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Caminhão Poliguindaste', '1.13', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Serviços de Terraplanagem (Empreitadas)', '1.14', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Serviços Diversos / Apoio Industrial', '1.15', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91');

-- 2. CUSTOS DIRETOS (CPV) - Escavadeiras
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Escavadeiras', '2.01.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Escavadeiras', '2.01.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Escavadeiras', '2.01.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Peças e Componentes – Escavadeiras', '2.01.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Mini Escavadeiras
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Mini Escavadeiras', '2.02.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Mini Escavadeiras', '2.02.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Implementos (Rompedor/Perfuratriz) – Mini Escavadeiras', '2.02.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Motoniveladoras
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Motoniveladoras', '2.03.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Motoniveladoras', '2.03.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Peças e Lâminas – Motoniveladoras', '2.03.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção Pesada – Motoniveladoras', '2.03.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Pás Carregadeiras
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Pás Carregadeiras', '2.04.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Pneus – Pás Carregadeiras', '2.04.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Pás Carregadeiras', '2.04.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Pás Carregadeiras', '2.04.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Mini Pás Carregadeiras
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Mini Pás', '2.05.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Implementos (Vassoura/Fresa) – Mini Pás', '2.05.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Mini Pás', '2.05.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Retroescavadeiras
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Retroescavadeiras', '2.06.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Retroescavadeiras', '2.06.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Implementos (Estapac/Rompedor/Perfuratriz) – Retroescavadeiras', '2.06.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Retroescavadeiras', '2.06.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Tratores Agrícolas
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Tratores Agrícolas', '2.07.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Implementos (Grade/Roçadeira) – Tratores', '2.07.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Tratores Agrícolas', '2.07.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Tratores de Esteira
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Tratores Esteira', '2.08.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Material Rodante – Tratores Esteira', '2.08.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Tratores Esteira', '2.08.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Rolos Compactadores
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Rolos Compactadores', '2.09.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Rolos Compactadores', '2.09.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Kit Pata / Peças – Rolos', '2.09.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Caminhões Basculantes
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Caminhões Basculantes', '2.10.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Motorista – Caminhões Basculantes', '2.10.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Pneus – Caminhões', '2.10.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Caminhões Basculantes', '2.10.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Transporte e Pranchas
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Custos Operacionais – Pranchas', '2.11.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Pedágios e Viagens – Transporte', '2.11.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Motorista – Pranchas', '2.11.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Micro-ônibus – Custos Operacionais', '2.11.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Caminhão Pipa
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Caminhão Pipa', '2.12.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Caminhão Pipa', '2.12.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Caminhão Pipa', '2.12.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Caminhão Poliguindaste
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Poliguindaste', '2.13.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Poliguindaste', '2.13.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Poliguindaste', '2.13.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- 3. DESPESAS ADMINISTRATIVAS
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Salários Administrativo / Escritório', '6.01', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Pró-labore Diretoria', '6.02', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Contabilidade e Obrigações', '6.03', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Jurídico e Consultorias', '6.04', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Aluguel / Estrutura', '6.05', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Energia, Internet e Telefonia', '6.06', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Seguros e Licenciamento Frota', '6.07', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Marketing e Comercial', '6.08', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Sistemas e TI (Antigravity / ERP)', '6.09', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91');

-- 4. RESULTADO FINANCEIRO
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Juros de Financiamentos', '8.01', 'DESPESA_FINANCEIRA', 'Resultado Financeiro', true, '00.000.000/0001-91'),
('Tarifas Bancárias', '8.02', 'DESPESA_FINANCEIRA', 'Resultado Financeiro', true, '00.000.000/0001-91'),
('Multas e Encargos', '8.03', 'DESPESA_FINANCEIRA', 'Resultado Financeiro', true, '00.000.000/0001-91'),
('Rendimentos Financeiros', '8.04', 'RECEITA_FINANCEIRA', 'Resultado Financeiro', true, '00.000.000/0001-91');

-- 5. CAPEX
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Compra de Máquinas Novas', '9.01', 'INVESTIMENTO', 'CAPEX / Imobilizado', true, '00.000.000/0001-91'),
('Reformas Pesadas / Retífica', '9.02', 'INVESTIMENTO', 'CAPEX / Imobilizado', true, '00.000.000/0001-91'),
('Construção de Barracão / Obras Próprias', '9.03', 'INVESTIMENTO', 'CAPEX / Imobilizado', true, '00.000.000/0001-91');
