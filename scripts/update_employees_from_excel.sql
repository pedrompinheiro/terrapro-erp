-- SCRIPT GERADO AUTOMATICAMENTE VIA IMPORTAÇÃO DE EXCEL (HOLERITES) --
CREATE EXTENSION IF NOT EXISTS unaccent;


-- Funcionário: ANTONIO DE (CNPJ: 25.214.690/0001-02)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1),
    base_salary = 2901.73,
    admission_date = '2012-09-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ANTONIO%DE%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ANTONIO DE (CNPJ: 25.214.690/0001-02)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1),
    base_salary = 2901.73,
    admission_date = '2012-09-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ANTONIO%DE%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ARNOBIO AGUEIRO (CNPJ: 25.214.690/0001-02)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2017-04-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ARNOBIO%AGUEIRO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ARNOBIO AGUEIRO (CNPJ: 25.214.690/0001-02)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2017-04-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ARNOBIO%AGUEIRO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: DEBORA ALVES DE ARAUJO (CNPJ: 25.214.690/0001-02)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1),
    base_salary = 1884.00,
    admission_date = '2025-02-24',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%DEBORA%ARAUJO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: DEBORA ALVES DE ARAUJO (CNPJ: 25.214.690/0001-02)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1),
    base_salary = 1884.00,
    admission_date = '2025-02-24',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%DEBORA%ARAUJO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: FABRICIO (CNPJ: 25.214.690/0001-02)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1),
    base_salary = 1869.16,
    admission_date = '2024-05-02',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%FABRICIO%FABRICIO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: FABRICIO (CNPJ: 25.214.690/0001-02)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1),
    base_salary = 1869.16,
    admission_date = '2024-05-02',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%FABRICIO%FABRICIO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: NEUZA CRISTINE RIBEIRO (CNPJ: 25.214.690/0001-02)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1),
    base_salary = 1973.51,
    admission_date = '2022-02-14',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%NEUZA%RIBEIRO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: NEUZA CRISTINE RIBEIRO (CNPJ: 25.214.690/0001-02)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1),
    base_salary = 1973.51,
    admission_date = '2022-02-14',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%NEUZA%RIBEIRO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '25.214.690/0001-02' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ALESSANDRO CANDIDO XAVIER (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 1568.00,
    admission_date = '2021-10-22',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ALESSANDRO%XAVIER%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ALESSANDRO CANDIDO XAVIER (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 1568.00,
    admission_date = '2021-10-22',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ALESSANDRO%XAVIER%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ARNOBIO RONEI BATISTA DOS (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 2435.00,
    admission_date = '2024-03-11',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ARNOBIO%DOS%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ARNOBIO RONEI BATISTA DOS (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 2435.00,
    admission_date = '2024-03-11',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ARNOBIO%DOS%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: CARLOS LUIS (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 1696.00,
    admission_date = '2026-01-13',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%CARLOS%LUIS%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: CARLOS LUIS (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 1696.00,
    admission_date = '2026-01-13',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%CARLOS%LUIS%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: EDGAR JOSÉ (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 2649.99,
    admission_date = '2026-01-12',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%EDGAR%JOSÉ%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: EDGAR JOSÉ (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 2649.99,
    admission_date = '2026-01-12',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%EDGAR%JOSÉ%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: KEVYN BRAYAN FIORAMONTE (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 2500.00,
    admission_date = '2025-10-10',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%KEVYN%FIORAMONTE%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: KEVYN BRAYAN FIORAMONTE (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 2500.00,
    admission_date = '2025-10-10',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%KEVYN%FIORAMONTE%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: LUCIANO FERREIRA DA SILVA (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-04-15',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%LUCIANO%SILVA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: LUCIANO FERREIRA DA SILVA (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-04-15',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%LUCIANO%SILVA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: THIAGO ALVES (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-05-05',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%THIAGO%ALVES%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: THIAGO ALVES (CNPJ: 06.152.273/0001-38)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-05-05',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%THIAGO%ALVES%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '06.152.273/0001-38' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ADRIANO EVANGELISTA IZIDORO (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2022-02-11',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ADRIANO%IZIDORO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ADRIANO EVANGELISTA IZIDORO (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2022-02-11',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ADRIANO%IZIDORO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ALESSANDRO (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3858.00,
    admission_date = '2025-08-16',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ALESSANDRO%ALESSANDRO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ALESSANDRO (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3858.00,
    admission_date = '2025-08-16',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ALESSANDRO%ALESSANDRO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ALEXSANDRO WILDNER (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2435.00,
    admission_date = '2018-10-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ALEXSANDRO%WILDNER%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ALEXSANDRO WILDNER (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2435.00,
    admission_date = '2018-10-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ALEXSANDRO%WILDNER%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ALTAIR APARECIDO DA SILVA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2025-04-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ALTAIR%SILVA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ALTAIR APARECIDO DA SILVA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2025-04-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ALTAIR%SILVA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ANDRE MARTINS PAEL (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2435.00,
    admission_date = '2023-10-30',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ANDRE%PAEL%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ANDRE MARTINS PAEL (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2435.00,
    admission_date = '2023-10-30',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ANDRE%PAEL%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Arculano Gonçalves da Luz (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-08-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Arculano%Luz%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Arculano Gonçalves da Luz (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-08-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Arculano%Luz%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ARNALDO DE LIMA BATISTA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2020-03-10',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ARNALDO%BATISTA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ARNALDO DE LIMA BATISTA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2020-03-10',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ARNALDO%BATISTA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Caio Felipe (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-09-04',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Caio%Felipe%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Caio Felipe (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-09-04',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Caio%Felipe%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: CARLOS JOSE (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2435.00,
    admission_date = '2018-03-12',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%CARLOS%JOSE%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: CARLOS JOSE (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2435.00,
    admission_date = '2018-03-12',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%CARLOS%JOSE%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: DANIEL JOSE FUNILEIRO LOPEZ COROY  Admissão: Departamento Filial 3 1  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2672.00,
    admission_date = '2024-02-26',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%DANIEL%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: DANIEL JOSE FUNILEIRO LOPEZ COROY  Admissão: Departamento Filial 3 1  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2672.00,
    admission_date = '2024-02-26',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%DANIEL%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: DILVO GARCIA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2021-05-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%DILVO%GARCIA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: DILVO GARCIA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2021-05-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%DILVO%GARCIA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Donizette (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2025-05-26',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Donizette%Donizette%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Donizette (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2025-05-26',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Donizette%Donizette%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: DORIVAL DOUGLAS SILVA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3136.00,
    admission_date = '2025-05-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%DORIVAL%SILVA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: DORIVAL DOUGLAS SILVA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3136.00,
    admission_date = '2025-05-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%DORIVAL%SILVA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Eder Francisco da Silva (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-09-29',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Eder%Silva%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Eder Francisco da Silva (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-09-29',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Eder%Silva%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: EDISON LOVERA PALHANO (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2435.00,
    admission_date = '2016-11-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%EDISON%PALHANO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: EDISON LOVERA PALHANO (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2435.00,
    admission_date = '2016-11-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%EDISON%PALHANO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: CBO Departamento Filial 102 Edmar de Almeida Soares 782510 3 1 (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2226.00,
    admission_date = '2025-08-11',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%CBO%1%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: CBO Departamento Filial 102 Edmar de Almeida Soares 782510 3 1 (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2226.00,
    admission_date = '2025-08-11',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%CBO%1%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: EDSON PIRES (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3500.00,
    admission_date = '2025-07-28',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%EDSON%PIRES%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: EDSON PIRES (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3500.00,
    admission_date = '2025-07-28',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%EDSON%PIRES%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ELIER COSTA DA SILVA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2226.00,
    admission_date = '2026-01-12',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ELIER%SILVA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ELIER COSTA DA SILVA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2226.00,
    admission_date = '2026-01-12',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ELIER%SILVA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: FABIANE CASSARI DE OLIVEIRA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2756.00,
    admission_date = '2021-12-11',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%FABIANE%OLIVEIRA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: FABIANE CASSARI DE OLIVEIRA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2756.00,
    admission_date = '2021-12-11',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%FABIANE%OLIVEIRA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: FERNANDO SPIER (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3136.00,
    admission_date = '2022-04-11',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%FERNANDO%SPIER%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: FERNANDO SPIER (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3136.00,
    admission_date = '2022-04-11',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%FERNANDO%SPIER%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: GLEICIELE (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2021-07-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%GLEICIELE%GLEICIELE%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: GLEICIELE (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2021-07-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%GLEICIELE%GLEICIELE%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ILSON MARQUES MIRANDA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2012-02-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ILSON%MIRANDA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ILSON MARQUES MIRANDA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2012-02-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ILSON%MIRANDA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Italo Almeida Alves (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2649.99,
    admission_date = '2025-04-08',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Italo%Alves%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Italo Almeida Alves (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2649.99,
    admission_date = '2025-04-08',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Italo%Alves%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Ivanésio Balt (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-09-10',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Ivanésio%Balt%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Ivanésio Balt (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-09-10',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Ivanésio%Balt%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: JAIR COSTA DE OLIVEIRA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3409.00,
    admission_date = '2020-03-13',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%JAIR%OLIVEIRA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: JAIR COSTA DE OLIVEIRA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3409.00,
    admission_date = '2020-03-13',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%JAIR%OLIVEIRA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: JOÃO RAMÃO ORTIZ NETO (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2026-01-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%JOÃO%NETO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: JOÃO RAMÃO ORTIZ NETO (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2026-01-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%JOÃO%NETO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: KAROLAYNE APARECIDA DE MORAES (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2024-09-10',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%KAROLAYNE%MORAES%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: KAROLAYNE APARECIDA DE MORAES (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2024-09-10',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%KAROLAYNE%MORAES%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: KAROLAYNE (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2024-09-10',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%KAROLAYNE%KAROLAYNE%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: KAROLAYNE (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2024-09-10',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%KAROLAYNE%KAROLAYNE%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: LEVI DE OLIVEIRA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2024-03-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%LEVI%OLIVEIRA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: LEVI DE OLIVEIRA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2024-03-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%LEVI%OLIVEIRA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: LEVI DE OLIVEIRA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2024-03-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%LEVI%OLIVEIRA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: LEVI DE OLIVEIRA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2024-03-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%LEVI%OLIVEIRA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: CBO Departamento Filial 95 LUCAS HENRIQUE MAGRO ASSUNÇÃO 715125 3 1 (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-07-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%CBO%1%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: CBO Departamento Filial 95 LUCAS HENRIQUE MAGRO ASSUNÇÃO 715125 3 1 (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-07-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%CBO%1%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: MARCELINO (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-09-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%MARCELINO%MARCELINO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: MARCELINO (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-09-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%MARCELINO%MARCELINO%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: MARCELO FRANCISCO FERREIRA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2022-02-14',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%MARCELO%FERREIRA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: MARCELO FRANCISCO FERREIRA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2022-02-14',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%MARCELO%FERREIRA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: MARCOS JOSE DOS SANTOS (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2198.01,
    admission_date = '2021-07-29',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%MARCOS%SANTOS%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: MARCOS JOSE DOS SANTOS (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2198.01,
    admission_date = '2021-07-29',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%MARCOS%SANTOS%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: MATEUS DELFIM VALENZUELA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 1735.00,
    admission_date = '2024-03-26',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%MATEUS%VALENZUELA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: MATEUS DELFIM VALENZUELA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 1735.00,
    admission_date = '2024-03-26',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%MATEUS%VALENZUELA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: OSVALDO MALDONADO VILHARVA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-09-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%OSVALDO%VILHARVA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: OSVALDO MALDONADO VILHARVA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-09-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%OSVALDO%VILHARVA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: PAULO CEZAR PIMENTEL MARQUES SOLDADOR  Admissão: Departamento Filial 3 1  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2020-10-16',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%PAULO%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: PAULO CEZAR PIMENTEL MARQUES SOLDADOR  Admissão: Departamento Filial 3 1  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2020-10-16',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%PAULO%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: PAULO CEZAR SOLDADOR PIMENTEL MARQUES  Admissão: Departamento Filial 3 1  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2020-10-16',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%PAULO%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: PAULO CEZAR SOLDADOR PIMENTEL MARQUES  Admissão: Departamento Filial 3 1  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2020-10-16',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%PAULO%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: PAULO CIPRIANO RIBEIRO MECANICO  Admissão: Departamento Filial 3 1  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3166.00,
    admission_date = '2020-03-14',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%PAULO%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: PAULO CIPRIANO RIBEIRO MECANICO  Admissão: Departamento Filial 3 1  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3166.00,
    admission_date = '2020-03-14',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%PAULO%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: PAULO VERMIEIRO DO NASCIMENTO SOLDADOR  Admissão: Departamento Filial 3 1  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2021-09-20',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%PAULO%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: PAULO VERMIEIRO DO NASCIMENTO SOLDADOR  Admissão: Departamento Filial 3 1  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2021-09-20',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%PAULO%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: CBO Departamento Filial 28 PAULO VERMIEIRO DO NASCIMENTO 724315 3 1 SOLDADOR Admissão:  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2021-09-20',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%CBO%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: CBO Departamento Filial 28 PAULO VERMIEIRO DO NASCIMENTO 724315 3 1 SOLDADOR Admissão:  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2021-09-20',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%CBO%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: RAMAO GABRIEL DELFIM (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2025-03-17',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%RAMAO%DELFIM%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: RAMAO GABRIEL DELFIM (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 0.00,
    admission_date = '2025-03-17',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%RAMAO%DELFIM%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Ramerson Santos Rodrigues (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-07-17',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Ramerson%Rodrigues%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: Ramerson Santos Rodrigues (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-07-17',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%Ramerson%Rodrigues%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ROBERSON MIRANDA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3136.00,
    admission_date = '2012-12-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ROBERSON%MIRANDA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: ROBERSON MIRANDA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 3136.00,
    admission_date = '2012-12-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%ROBERSON%MIRANDA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: RONILSON FERREIRA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2198.00,
    admission_date = '2014-07-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%RONILSON%FERREIRA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: RONILSON FERREIRA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2198.00,
    admission_date = '2014-07-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%RONILSON%FERREIRA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: SIMON LUIS ROJAS SILVA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 1735.00,
    admission_date = '2025-06-20',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%SIMON%SILVA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: SIMON LUIS ROJAS SILVA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 1735.00,
    admission_date = '2025-06-20',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%SIMON%SILVA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: VICTOR OLIVEIRA MIRANDA ALMOXARIFE  Admissão: Departamento Filial 3 1  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 1802.00,
    admission_date = '2024-09-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%VICTOR%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: VICTOR OLIVEIRA MIRANDA ALMOXARIFE  Admissão: Departamento Filial 3 1  Código Descrição Referência Vencimentos Descontos (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 1802.00,
    admission_date = '2024-09-19',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%VICTOR%Descontos%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: VIVIANE TEREZA DE SOUZA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-04-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%VIVIANE%SOUZA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 

-- Funcionário: VIVIANE TEREZA DE SOUZA (CNPJ: 14.628.837/0001-94)
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1),
    base_salary = 2650.00,
    admission_date = '2025-04-01',
    active = true
WHERE unaccent(full_name) ILIKE unaccent('%VIVIANE%SOUZA%')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 
