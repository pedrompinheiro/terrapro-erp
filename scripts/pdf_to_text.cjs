
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const files = [
    '../backups/MeP 01-2026.pdf',
    '../backups/construterra 01-2026.pdf',
    '../backups/terra 01-2026.pdf'
];

async function extractText() {
    let combinedText = '';

    for (const file of files) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`Lendo arquivo: ${file}...`);
            const dataBuffer = fs.readFileSync(filePath);
            try {
                // Tenta chamar a função principal. Se falhar, tenta pdf.default
                let data;
                if (typeof pdf === 'function') {
                    data = await pdf(dataBuffer);
                } else if (typeof pdf.default === 'function') {
                    data = await pdf.default(dataBuffer);
                } else {
                    throw new Error('PDF Parse não é uma função compatível.');
                }

                combinedText += `\n\n--- INÍCIO DO ARQUIVO: ${file} ---\n`;
                combinedText += data.text;
                combinedText += `\n--- FIM DO ARQUIVO: ${file} ---\n`;
            } catch (e) {
                console.error(`Erro ao ler ${file}:`, e.message);
            }
        } else {
            console.log(`Arquivo não encontrado: ${filePath}`);
        }
    }

    // Salva o resultado
    fs.writeFileSync(path.join(__dirname, 'holerites_extraidos.txt'), combinedText);
    console.log('Texto extraído com sucesso para scripts/holerites_extraidos.txt');
}

extractText();
