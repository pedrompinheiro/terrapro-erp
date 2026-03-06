/**
 * payrollXlsxParser.ts — Parser de planilha XLSX de folha de pagamento
 *
 * Detecta automaticamente as 3 seções (DOURADÃO, CONSTRUTERRA, TRANS TERRA)
 * e extrai nome, código, salário, descontos, iFood, forma de pagamento.
 */

import * as XLSX from 'xlsx';

// ============================================
// Tipos
// ============================================

export interface ParsedPayrollRow {
    employee_name: string;
    employee_code: string | null;        // ex: "44" de "André Martins - 44"
    company_section: string;             // DOURADAO | CONSTRUTERRA | TRANS_TERRA
    salario_mensal: number;
    adiantamento: number;
    gastos_loja: number;
    coopercred_uniodonto: number;
    marmita_outros: number;
    salario_liquido: number;
    forma_pagamento: string | null;
    forma_pagamento_detalhes: string | null; // chave PIX, agência, etc.
    ifood_valor: number;
    observacoes: string | null;
    planilha_menciona_he: boolean;       // se menciona "H.E" ou "hora extra"
    row_index: number;                   // linha original na planilha
}

export interface ParseResult {
    rows: ParsedPayrollRow[];
    warnings: string[];
    sections: string[];
    competencia: string | null;          // ex: "02/2026" extraído do título
    totalBruto: number;
    totalLiquido: number;
    totalIfood: number;
}

// ============================================
// Mapeamento de seções
// ============================================

const SECTION_MAP: Record<string, string> = {
    'DOURADAO': 'DOURADAO',
    'DOURADÃO': 'DOURADAO',
    'CONSTRUTERRA': 'CONSTRUTERRA',
    'TRANS TERRA': 'TRANS_TERRA',
    'TRANS_TERRA': 'TRANS_TERRA',
    'TRANSPORTADORA TERRA': 'TRANS_TERRA',
};

// ============================================
// Helpers
// ============================================

function normalize(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim();
}

function parseCurrency(value: any): number {
    if (value === null || value === undefined || value === '' || value === '-') return 0;
    if (typeof value === 'number') return Math.round(value * 100) / 100;
    const str = String(value)
        .replace(/[R$\s]/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

function extractNameAndCode(raw: string): { name: string; code: string | null } {
    if (!raw || typeof raw !== 'string') return { name: '', code: null };
    const trimmed = raw.trim();

    // Padrão: "André Martins - 44" ou "Adriano - 38" ou "Carla - 186 / 12612"
    const match = trimmed.match(/^(.+?)\s*[-–]\s*(\d+)/);
    if (match) {
        return {
            name: match[1].trim(),
            code: match[2].trim(),
        };
    }

    // Sem código: "Anderson" ou "Fabio"
    return { name: trimmed, code: null };
}

function detectSection(row: any[]): string | null {
    for (const cell of row) {
        if (!cell || typeof cell !== 'string') continue;
        const norm = normalize(cell);
        for (const [key, value] of Object.entries(SECTION_MAP)) {
            if (norm.includes(normalize(key))) {
                return value;
            }
        }
    }
    return null;
}

function isHeaderRow(row: any[]): boolean {
    // Linhas de cabeçalho contêm "SALÁRIO", "ADIANT", "GASTOS", "LIQUIDO"
    const text = row.map(c => normalize(String(c || ''))).join(' ');
    return (text.includes('SALARIO') && text.includes('LIQUIDO')) ||
           (text.includes('MENSAL') && text.includes('SALARIAL'));
}

function isEmptyRow(row: any[]): boolean {
    return row.every(c => c === null || c === undefined || c === '' || String(c).trim() === '');
}

function isDataRow(row: any[]): boolean {
    // Uma linha de dados deve ter algo na coluna A (nome) e pelo menos um valor numérico
    const name = String(row[0] || '').trim();
    if (!name || name === '-') return false;

    // Verifica se não é um header de seção
    const norm = normalize(name);
    for (const key of Object.keys(SECTION_MAP)) {
        if (norm.includes(normalize(key))) return false;
    }
    if (norm.includes('EMPRESA') || norm.includes('PGTO') || norm.includes('SALARIO')) return false;

    return true;
}

function detectHoraExtra(obs: string | null): boolean {
    if (!obs) return false;
    const norm = normalize(obs);
    return norm.includes('H.E') ||
           norm.includes('HE ') ||
           norm.includes('HORA EXTRA') ||
           norm.includes('H E ') ||
           norm.includes('H.E.') ||
           /H\.?E\s/.test(norm);
}

function extractFormaPagamento(col_h: string | null, col_i_extra?: string | null): {
    tipo: string | null;
    detalhes: string | null;
} {
    if (!col_h || typeof col_h !== 'string' || col_h.trim() === '' || col_h.trim() === '-') {
        return { tipo: null, detalhes: null };
    }

    const raw = col_h.trim();
    const upper = raw.toUpperCase();

    // PIX com chave
    if (upper.includes('PIX')) {
        const pixMatch = raw.match(/PIX[:\s]*(.*)/i);
        return {
            tipo: 'PIX',
            detalhes: pixMatch ? pixMatch[1].trim() : null,
        };
    }

    // Email como chave PIX
    if (raw.includes('@')) {
        return { tipo: 'PIX', detalhes: raw };
    }

    // Telefone como chave PIX (padrão: (67) 99xxx ou 67 99xxx)
    if (/^\(?\d{2}\)?[\s-]?\d{4,5}/.test(raw)) {
        return { tipo: 'PIX', detalhes: raw };
    }

    // Itaú (várias grafias)
    if (upper.includes('ITAU') || upper.includes('ITAÚ')) {
        // Pode ter detalhes de agência/conta após
        const extra = col_i_extra ? String(col_i_extra).trim() : null;
        const detalhes = extra && extra.toLowerCase().startsWith('ag') ? extra : null;
        return { tipo: 'TED_ITAU', detalhes };
    }

    // BB
    if (upper.includes('BB') || upper.includes('BANCO DO BRASIL')) {
        return { tipo: 'TED_BB', detalhes: null };
    }

    // Dep. em conta
    if (upper.includes('DEP') || upper.includes('DEPOSITO')) {
        return { tipo: 'DEPOSITO', detalhes: null };
    }

    return { tipo: raw, detalhes: null };
}

function extractCompetencia(data: any[][]): string | null {
    // Procura no título algo como "COMP. 02/2026" ou "COMPETÊNCIA 02/2026"
    for (let i = 0; i < Math.min(5, data.length); i++) {
        const row = data[i];
        for (const cell of row) {
            if (!cell || typeof cell !== 'string') continue;
            const match = cell.match(/COMP[.\s]*(\d{2})[/-](\d{4})/i);
            if (match) return `${match[1]}/${match[2]}`;
        }
    }
    return null;
}

// ============================================
// Parser Principal
// ============================================

/**
 * Detecta a coluna do iFood e observações no header de cada seção.
 * Escaneia as linhas de header ANTES e DEPOIS da linha da seção,
 * porque na planilha real o header vem 1 linha ANTES do nome da seção:
 *   Row N:   ["EMPRESA","SALÁRIO",...,"IFOOD"]
 *   Row N+1: ["CONSTRUTERRA"]
 *   Row N+2: [dados...]
 */
function detectColumnLayout(data: any[][], sectionRowIndex: number): {
    ifoodCol: number;
    obsCol: number;
} {
    // Default: iFood na col 8 (I), obs na col 9 (J)
    let ifoodCol = 8;
    let obsCol = 9;
    let found = false;

    // Escaneia as 3 linhas ANTES e 3 linhas DEPOIS da seção procurando headers
    const offsets = [-3, -2, -1, 1, 2, 3];
    for (const offset of offsets) {
        const ri = sectionRowIndex + offset;
        if (ri < 0 || ri >= data.length) continue;

        const headerRow = data[ri];
        for (let c = 0; c < Math.min(headerRow.length, 15); c++) {
            const cell = normalize(String(headerRow[c] || ''));
            if (cell === 'IFOOD' || cell === 'I.FOOD' || cell === 'I FOOD') {
                ifoodCol = c;
                found = true;
            }
            if (cell.includes('OBS') || cell === 'OBSERVACAO' || cell === 'OBSERVACOES') {
                obsCol = c;
            }
        }
        // Se achou o IFOOD, para de procurar (prioriza o mais próximo)
        if (found) break;
    }

    // Se não encontrou obs, assume que é a coluna depois do iFood
    if (obsCol <= ifoodCol) {
        obsCol = ifoodCol + 1;
    }

    return { ifoodCol, obsCol };
}

export function parsePayrollXlsx(buffer: ArrayBuffer): ParseResult {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    const rows: ParsedPayrollRow[] = [];
    const warnings: string[] = [];
    const sections: string[] = [];
    let currentSection: string | null = null;
    let skipNextHeaders = 0;

    // Layout de colunas por seção (detectado dinamicamente do header)
    let ifoodCol = 8;  // default col I
    let obsCol = 9;    // default col J

    const competencia = extractCompetencia(data);

    for (let i = 0; i < data.length; i++) {
        const row = data[i];

        // Detecta nova seção
        const section = detectSection(row);
        if (section) {
            currentSection = section;
            if (!sections.includes(section)) sections.push(section);

            // Detecta layout de colunas para esta seção
            const layout = detectColumnLayout(data, i);
            ifoodCol = layout.ifoodCol;
            obsCol = layout.obsCol;

            skipNextHeaders = 2; // pula a linha de labels e a linha de sub-labels
            continue;
        }

        // Pula linhas de header
        if (skipNextHeaders > 0) {
            if (isHeaderRow(row) || isEmptyRow(row)) {
                skipNextHeaders--;
                continue;
            }
            // Se não é header, resetar o skip
            skipNextHeaders = 0;
        }

        // Pula linhas vazias
        if (isEmptyRow(row)) continue;

        // Se não temos seção ainda, pular
        if (!currentSection) continue;

        // Verifica se é uma linha de dados válida
        if (!isDataRow(row)) continue;

        // Parse da linha
        const { name, code } = extractNameAndCode(String(row[0] || ''));
        if (!name) {
            warnings.push(`Linha ${i + 1}: nome vazio, pulada`);
            continue;
        }

        const salario_mensal = parseCurrency(row[1]);
        const adiantamento = parseCurrency(row[2]);
        const gastos_loja = parseCurrency(row[3]);
        const coopercred_uniodonto = parseCurrency(row[4]);
        const marmita_outros = parseCurrency(row[5]);
        const salario_liquido = parseCurrency(row[6]);

        // Se tudo é zero e não tem salário, provavelmente é uma linha incompleta
        if (salario_mensal === 0 && salario_liquido === 0 && adiantamento === 0) {
            warnings.push(`Linha ${i + 1}: ${name} sem valores, incluído com zeros`);
        }

        // Forma de pagamento (col H = index 7)
        // Detalhes bancários: colunas entre forma_pgto e iFood (se houver espaço)
        const formaPagCol = 7;
        const bankDetailCol = ifoodCol > formaPagCol + 1 ? formaPagCol + 1 : -1;

        const { tipo, detalhes } = extractFormaPagamento(
            String(row[formaPagCol] || ''),
            bankDetailCol >= 0 ? String(row[bankDetailCol] || '') : null
        );

        // iFood - posição detectada dinamicamente do header da seção
        const ifood_valor = parseCurrency(row[ifoodCol]);

        // Observações - posição após iFood
        let observacoes: string | null = null;
        const obsRaw = String(row[obsCol] || '').trim();
        if (obsRaw && obsRaw !== '0' && obsRaw !== '-') {
            observacoes = obsRaw;
        }

        // Observação extra em colunas mais à frente
        for (let c = obsCol + 1; c < Math.min(row.length, obsCol + 4); c++) {
            const val = String(row[c] || '').trim();
            if (val && val !== '0' && val !== '-') {
                observacoes = observacoes ? `${observacoes}; ${val}` : val;
            }
        }

        const planilha_menciona_he = detectHoraExtra(observacoes);

        rows.push({
            employee_name: name,
            employee_code: code,
            company_section: currentSection,
            salario_mensal,
            adiantamento,
            gastos_loja,
            coopercred_uniodonto,
            marmita_outros,
            salario_liquido,
            forma_pagamento: tipo,
            forma_pagamento_detalhes: detalhes,
            ifood_valor,
            observacoes,
            planilha_menciona_he,
            row_index: i,
        });
    }

    // Totais
    const totalBruto = rows.reduce((sum, r) => sum + r.salario_mensal, 0);
    const totalLiquido = rows.reduce((sum, r) => sum + r.salario_liquido, 0);
    const totalIfood = rows.reduce((sum, r) => sum + r.ifood_valor, 0);

    return {
        rows,
        warnings,
        sections,
        competencia,
        totalBruto: Math.round(totalBruto * 100) / 100,
        totalLiquido: Math.round(totalLiquido * 100) / 100,
        totalIfood: Math.round(totalIfood * 100) / 100,
    };
}
