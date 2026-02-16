const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../backups/MeP 01-2026.xlsx'); // Caminho do arquivo

try {
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;

    console.log(`Abas encontradas: ${sheetNames.join(', ')}`);
    console.log('--- AMOS TRAGIA DO CONTEÚDO (Primeiras 15 linhas de CADA ABA) ---');

    sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) return;

        console.log(`\n=== ABA: ${sheetName} ===`);

        // Pega as primeiras 15 linhas como JSON (array de arrays)
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 0, defval: '' });

        // Mostra as 15 primeiras linhas
        jsonData.slice(0, 15).forEach((row, index) => {
            console.log(`L${index + 1}: ${JSON.stringify(row)}`);
        });
    });

} catch (error) {
    console.error('Erro ao ler Excel:', error.message);
}
