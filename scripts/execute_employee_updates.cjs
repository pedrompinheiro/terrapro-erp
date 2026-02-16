
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 1. Configuração de Ambiente Manual (igual ao diagnose_db.mjs)
const envPath = path.resolve(process.cwd(), '.env.local');
let envConfig = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envConfig = envContent.split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key.trim()] = value.trim();
        return acc;
    }, {});
} catch (e) {
    console.error("⚠️ Erro ao ler .env.local:", e.message);
    process.exit(1);
}

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Credenciais do Supabase não encontradas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Funções Auxiliares de Parsing
function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function parseCurrency(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        return parseFloat(value.replace('.', '').replace(',', '.'));
    }
    return 0;
}

function formatDate(dateStr) {
    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    return null;
}

function extractName(rawString) {
    let clean = rawString.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    clean = clean.replace(/Código.*?Nome do Funcionário/i, '').trim();
    clean = clean.replace(/Nome do Funcionário/i, '').trim();
    clean = clean.replace(/^\d+\s+/, '');
    clean = clean.replace(/\d{2}\/\d{2}\/\d{4}/g, '');
    clean = clean.replace(/CBO\s*\d+/i, '');

    // Lista de cargos para remover do nome
    const roles = ['AUXILIAR', 'VENDEDOR', 'AJUDANTE', 'GERENTE', 'MOTORISTA', 'OPERADOR', 'MESTRE', 'PEDREIRO', 'SERVENTE', 'ENCARREGADO', 'ANALISTA', 'ASSISTENTE', 'SUPERVISOR', 'ENGENHEIRO', 'ESTAGIARIO', 'APRENDIZ', 'COORDENADOR', 'DIRETOR', 'ALMOXARIFE', 'OPERADOR'];

    for (const role of roles) {
        const regex = new RegExp(`\\b${role}\\b.*`, 'i');
        clean = clean.replace(regex, '');
    }
    return clean.trim();
}

function extractCNPJ(rawString) {
    const match = rawString.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/);
    return match ? match[1] : null;
}

// 3. Script Principal
async function run() {
    console.log('🔄 Iniciando atualização de funcionários via API...');

    // A. Carregar dados auxiliares do Banco
    console.log('📡 Buscando Empresas e Funcionários...');

    const { data: companies, error: errComp } = await supabase.from('companies').select('id, document');
    if (errComp) { console.error('Erro ao buscar empresas:', errComp); return; }

    const { data: employees, error: errEmp } = await supabase.from('employees').select('id, full_name, company_id');
    if (errEmp) { console.error('Erro ao buscar funcionários:', errEmp); return; }

    console.log(`✅ Carregados: ${companies.length} empresas, ${employees.length} funcionários existentes.`);

    // Criar Maps para busca rápida
    const companyMap = {}; // 'CNPJ' -> 'ID'
    companies.forEach(c => {
        if (c.document) companyMap[c.document] = c.id;
    });

    const files = [
        '../backups/MeP 01-2026.xlsx',
        '../backups/construterra 01-2026.xlsx',
        '../backups/terra 01-2026.xlsx'
    ];

    let updateCount = 0;
    let notFoundCount = 0;

    for (const file of files) {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ Arquivo não encontrado: ${file}`);
            continue;
        }

        console.log(`📂 Processando arquivo: ${file}`);
        const workbook = xlsx.readFile(filePath);

        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 0, defval: '' });
            if (rows.length < 5) continue;

            const headerText = rows[0].join(' ');
            const cnpj = extractCNPJ(headerText);

            const targetCompanyId = cnpj ? companyMap[cnpj] : null;

            // Extrair Nome
            const infoText = rows.slice(1, 3).map(r => r.join(' ')).join(' ');
            const rawName = extractName(infoText);

            if (!rawName || rawName.length < 3) continue;

            const nameParts = rawName.split(' ');
            const firstName = normalizeString(nameParts[0]);
            const lastName = nameParts.length > 1 ? normalizeString(nameParts[nameParts.length - 1]) : '';

            // Extrair Dados Salariais
            let baseSalary = 0;
            const admission = formatDate(infoText);

            for (let i = 3; i < rows.length; i++) {
                const row = rows[i];
                if (row[1] && typeof row[1] === 'string' && row[1].includes('DIAS NORMAIS')) {
                    const valor = typeof row[6] === 'number' ? row[6] : parseFloat(String(row[6]).replace(',', '.'));
                    const ref = typeof row[5] === 'number' ? row[5] : parseFloat(String(row[5]).replace(',', '.'));
                    if (valor && ref) baseSalary = (valor / ref) * 30;
                    break;
                }
            }
            if (baseSalary === 0) {
                for (let i = 3; i < rows.length; i++) {
                    const row = rows[i];
                    if (row[1] && typeof row[1] === 'string' && row[1].includes('SALARIO')) {
                        const valor = typeof row[6] === 'number' ? row[6] : parseFloat(String(row[6]).replace(',', '.'));
                        if (valor) baseSalary = valor;
                    }
                }
            }

            // Encontrar funcionário no banco (Busca "Fuzzy" simples)
            // Procura alguém que contenha o StartName e EndName
            const foundEmployee = employees.find(e => {
                const dbName = normalizeString(e.full_name || '');
                return dbName.includes(firstName) && (lastName ? dbName.includes(lastName) : true);
            });

            if (foundEmployee) {
                // Atualizar
                const updateData = {
                    active: true,
                    base_salary: parseFloat(baseSalary.toFixed(2)),
                };

                if (targetCompanyId) updateData.company_id = targetCompanyId;
                if (admission) updateData.admission_date = admission;

                const { error } = await supabase
                    .from('employees')
                    .update(updateData)
                    .eq('id', foundEmployee.id);

                if (error) {
                    console.error(`❌ Erro ao atualizar ${foundEmployee.full_name}:`, error.message);
                } else {
                    console.log(`✅ Atualizado: ${foundEmployee.full_name} | R$ ${updateData.base_salary} | ${updateData.admission_date}`);
                    updateCount++;
                }
            } else {
                console.warn(`⚠️ Funcionário não encontrado no banco: ${rawName} (${firstName} ${lastName})`);
                notFoundCount++;
            }
        }
    }

    console.log('------------------------------------------------');
    console.log(`🏁 Processo Finalizado.`);
    console.log(`✅ Total Atualizados: ${updateCount}`);
    console.log(`⚠️ Total Não Encontrados: ${notFoundCount}`);
}

run();
