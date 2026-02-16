
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Lista de arquivos para processar
const files = [
    '../backups/MeP 01-2026.xlsx',
    '../backups/construterra 01-2026.xlsx',
    '../backups/terra 01-2026.xlsx'
];

function parseCurrency(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        return parseFloat(value.replace('.', '').replace(',', '.'));
    }
    return 0;
}

function formatDate(dateStr) {
    // Tenta formato DD/MM/YYYY
    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    return null;
}

function extractName(rawString) {
    // Limpa quebras de linha e espaços extras
    let clean = rawString.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    // Remove cabeçalhos comuns "Nome do Funcionário", "Código"
    clean = clean.replace(/Código.*?Nome do Funcionário/i, '').trim();
    clean = clean.replace(/Nome do Funcionário/i, '').trim();

    // Remove números no início (Código do funcionário)
    clean = clean.replace(/^\d+\s+/, '');

    // Remove datas perdidas no meio do nome (ex: 10/09/2025) e CBO
    clean = clean.replace(/\d{2}\/\d{2}\/\d{4}/g, '');
    clean = clean.replace(/CBO\s*\d+/i, '');

    // Tenta remover Cargo no final (lista de cargos comuns)
    const roles = ['AUXILIAR', 'VENDEDOR', 'AJUDANTE', 'GERENTE', 'MOTORISTA', 'OPERADOR', 'MESTRE', 'PEDREIRO', 'SERVENTE', 'ENCARREGADO', 'ANALISTA', 'ASSISTENTE', 'SUPERVISOR', 'ENGENHEIRO', 'ESTAGIARIO', 'APRENDIZ', 'COORDENADOR', 'DIRETOR'];

    for (const role of roles) {
        const regex = new RegExp(`\\b${role}\\b.*`, 'i');
        clean = clean.replace(regex, '');
    }

    return clean.trim();
}

function extractCNPJ(rawString) {
    // Ex: "... CNPJ:   25.214.690/0001-02"
    const match = rawString.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/);
    return match ? match[1] : null;
}

let sqlOutput = `-- SCRIPT GERADO AUTOMATICAMENTE VIA IMPORTAÇÃO DE EXCEL (HOLERITES) --\nCREATE EXTENSION IF NOT EXISTS unaccent;\n\n`;

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return;

    console.log(`Processando ${file}...`);
    const workbook = xlsx.readFile(filePath);

    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 0, defval: '' });

        if (rows.length < 5) return; // Aba vazia ou inválida

        // 1. Extrair CNPJ da Linha 1 (índice 0)
        const headerText = rows[0].join(' ');
        const cnpj = extractCNPJ(headerText);

        if (!cnpj) return;

        // 2. Extrair Nome e Admissão das Linhas 2 e 3 (combinadas)
        // Isso ajuda se o PDF quebrou as linhas
        const infoText = rows.slice(1, 3).map(r => r.join(' ')).join(' ');
        const name = extractName(infoText);
        const admission = formatDate(infoText);

        if (!name || name.length < 3) return;

        // 3. Extrair Salário Base (Heurística: Item "DIAS NORMAIS")
        let baseSalary = 0;

        // Procura nas linhas de dados (row 3 até fim)
        for (let i = 3; i < rows.length; i++) {
            const row = rows[i];
            // row[1] é Descrição, row[5] Referência, row[6] Valor
            if (row[1] && typeof row[1] === 'string' && row[1].includes('DIAS NORMAIS')) {
                const valor = typeof row[6] === 'number' ? row[6] : parseFloat(String(row[6]).replace(',', '.'));
                const ref = typeof row[5] === 'number' ? row[5] : parseFloat(String(row[5]).replace(',', '.'));

                if (valor && ref) {
                    // Extrapola para 30 dias
                    baseSalary = (valor / ref) * 30;
                }
                break; // Achou base, para.
            }
        }

        // Se não achou DIAS NORMAIS, tenta SALARIO BASE
        if (baseSalary === 0) {
            for (let i = 3; i < rows.length; i++) {
                const row = rows[i];
                if (row[1] && typeof row[1] === 'string' && row[1].includes('SALARIO')) {
                    const valor = typeof row[6] === 'number' ? row[6] : parseFloat(String(row[6]).replace(',', '.'));
                    if (valor) baseSalary = valor; // Assume valor cheio
                }
            }
        }

        // Formata salário para SQL (ex: 2500.00)
        const salarySQL = baseSalary > 0 ? baseSalary.toFixed(2) : '0.00';

        // Match Name: Pega o primeiro e o último nome para buscar no banco
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : firstName;

        const matchPattern = `%${firstName}%${lastName}%`;

        // Gera o UPDATE
        sqlOutput += `
-- Funcionário: ${name} (CNPJ: ${cnpj})
UPDATE employees 
SET 
    company_id = (SELECT id FROM companies WHERE document = '${cnpj}' LIMIT 1),
    base_salary = ${salarySQL},
    admission_date = ${admission ? `'${admission}'` : 'admission_date'},
    active = true
WHERE unaccent(full_name) ILIKE unaccent('${matchPattern}')
  AND (company_id IS NULL OR company_id = (SELECT id FROM companies WHERE document = '${cnpj}' LIMIT 1) OR company_id = (SELECT id FROM companies WHERE document = '14.628.837/0001-94')); 
`;

    });
});

// Salva o SQL
fs.writeFileSync(path.join(__dirname, 'update_employees_from_excel.sql'), sqlOutput);
console.log('Script SQL gerado em scripts/update_employees_from_excel.sql');
