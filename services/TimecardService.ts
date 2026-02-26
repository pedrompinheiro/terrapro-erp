/**
 * TimecardService.ts — Serviço OCR unificado para leitura de cartão de ponto
 * Usa Gemini 1.5 Flash (Google AI) com prompt otimizado para cartões brasileiros.
 * Suporta até 3 pares de entrada/saída por dia (CLT).
 *
 * Autor: Claude Code Session (17/02/2026)
 */

import { generateWithImage, getProviderLabel, getConfig } from "../lib/aiService";

// ============================================
// Tipos
// ============================================

export interface TimecardEntry {
    day: number;
    date: string;         // YYYY-MM-DD
    entrada1: string | null;
    saida1: string | null;
    entrada2: string | null;
    saida2: string | null;
    entrada3: string | null;
    saida3: string | null;
}

export interface TimecardData {
    employeeName: string;
    period: string;       // "1" (1-15), "2" (16-31), or "full" (mês inteiro)
    month: number;        // 1-12
    year: number;
    entries: TimecardEntry[];
    confidence: number;   // 0-100 — confiança geral da leitura
    warnings: string[];   // avisos (ex: "dia 15 ilegível", "nome parcial")
}

// ============================================
// Prompt otimizado para Gemini
// ============================================

const buildOcrPrompt = () => {
    const currentYear = new Date().getFullYear();

    return `Você é um especialista em leitura de cartões de ponto brasileiros (folha de ponto manual).
Analise esta imagem de cartão de ponto e extraia TODOS os dados com máxima precisão.

CONTEXTO:
- Cartões de ponto brasileiros (CLT) podem ter até 3 pares de entrada/saída por dia
- Normalmente: Entrada1 (manhã), Saída1 (almoço), Entrada2 (volta almoço), Saída2 (fim expediente)
- Eventualmente: Entrada3 (hora extra noite), Saída3 (saída definitiva)
- Quinzenas: "1ª QUINZENA" = dias 1-15, "2ª QUINZENA" = dias 16-31
- Se cobrir o mês inteiro, period = "full"
- Horários são manuscritos e podem estar borrados ou tortos

REGRAS DE EXTRAÇÃO:
1. Nome do funcionário: geralmente no TOPO do cartão (manuscrito ou impresso)
2. Mês/Ano: procure no cabeçalho ("MÊS: ___", "COMPETÊNCIA: ___")
3. Para cada dia visível, extraia até 6 horários (3 pares entrada/saída)
4. Formato de hora: SEMPRE "HH:MM" com 2 dígitos (ex: "07:30", não "7:30")
5. Se um campo estiver vazio, em branco ou ilegível → retorne null
6. Se o dia inteiro estiver em branco (sem batida) → inclua o dia com todos null (pode ser folga/falta)
7. Ignore assinaturas, rabiscos decorativos, carimbos
8. Se a imagem estiver rotacionada ou invertida, corrija mentalmente
9. Ano padrão se não visível: ${currentYear}

RETORNE APENAS um JSON válido (sem markdown, sem \`\`\`) neste formato exato:
{
  "employeeName": "Nome Completo ou Parcial",
  "period": "1" | "2" | "full",
  "month": 1-12,
  "year": ${currentYear},
  "confidence": 0-100,
  "warnings": ["avisos opcionais"],
  "entries": [
    {
      "day": 1,
      "date": "${currentYear}-01-01",
      "entrada1": "07:00",
      "saida1": "11:00",
      "entrada2": "13:00",
      "saida2": "17:00",
      "entrada3": null,
      "saida3": null
    }
  ]
}`;
};

// ============================================
// Conversão de File para base64
// ============================================

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove o prefixo data:image/xxx;base64,
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
    });
};

// ============================================
// Função principal: processar imagem via Gemini
// ============================================

export const processTimecardImage = async (file: File): Promise<TimecardData> => {
    const config = getConfig();
    if (!config.apiKey) {
        throw new Error(`API key não configurada para ${config.provider}. Adicione no .env.local (ex: VITE_OPENAI_API_KEY, VITE_GEMINI_API_KEY ou VITE_GROQ_API_KEY)`);
    }

    const base64Data = await fileToBase64(file);
    const prompt = buildOcrPrompt();

    const text = await generateWithImage(prompt, base64Data, file.type);

    // Limpar possíveis blocos markdown
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        const parsed = JSON.parse(jsonString);

        // Normalizar e validar entradas
        const normalized: TimecardData = {
            employeeName: parsed.employeeName || 'Não identificado',
            period: parsed.period || 'full',
            month: parsed.month || new Date().getMonth() + 1,
            year: parsed.year || new Date().getFullYear(),
            confidence: parsed.confidence || 50,
            warnings: parsed.warnings || [],
            entries: (parsed.entries || []).map((e: any) => ({
                day: e.day,
                date: e.date || `${parsed.year || new Date().getFullYear()}-${String(parsed.month || 1).padStart(2, '0')}-${String(e.day).padStart(2, '0')}`,
                entrada1: normalizeTime(e.entrada1),
                saida1: normalizeTime(e.saida1),
                entrada2: normalizeTime(e.entrada2),
                saida2: normalizeTime(e.saida2),
                entrada3: normalizeTime(e.entrada3),
                saida3: normalizeTime(e.saida3),
            }))
        };

        return normalized;
    } catch (e) {
        console.error("Erro ao parsear resposta da IA:", text);
        throw new Error("Falha ao interpretar a imagem. Tente uma foto mais nítida ou com melhor iluminação.");
    }
};

// ============================================
// Processamento em lote (múltiplas imagens)
// ============================================

export interface BatchResult {
    file: File;
    preview: string;
    status: 'pending' | 'processing' | 'success' | 'error';
    data?: TimecardData;
    error?: string;
    matchedEmployeeId?: string;
    matchedEmployeeName?: string;
}

export const processTimecardBatch = async (
    files: File[],
    onProgress: (results: BatchResult[]) => void
): Promise<BatchResult[]> => {
    const results: BatchResult[] = files.map(f => ({
        file: f,
        preview: URL.createObjectURL(f),
        status: 'pending' as const,
    }));

    onProgress([...results]);

    for (let i = 0; i < results.length; i++) {
        results[i].status = 'processing';
        onProgress([...results]);

        try {
            const data = await processTimecardImage(results[i].file);
            results[i].status = 'success';
            results[i].data = data;
        } catch (err) {
            results[i].status = 'error';
            results[i].error = err instanceof Error ? err.message : String(err);
        }

        onProgress([...results]);
    }

    return results;
};

// ============================================
// Matching inteligente de funcionário
// ============================================

export const matchEmployee = (
    detectedName: string,
    employees: Array<{ id: string; name: string; registration_number?: string }>
): { id: string; name: string; score: number } | null => {
    if (!detectedName || detectedName === 'Não identificado') return null;

    const normalizedDetected = normalizeName(detectedName);
    const detectedParts = normalizedDetected.split(' ').filter(p => p.length > 2);

    let bestMatch: { id: string; name: string; score: number } | null = null;

    for (const emp of employees) {
        const normalizedEmp = normalizeName(emp.name);
        const empParts = normalizedEmp.split(' ').filter(p => p.length > 2);

        let score = 0;

        // Match exato (após normalização)
        if (normalizedDetected === normalizedEmp) {
            score = 100;
        }
        // Um nome contém o outro
        else if (normalizedEmp.includes(normalizedDetected) || normalizedDetected.includes(normalizedEmp)) {
            score = 85;
        }
        // Match por partes do nome (primeiro + último sobrenome)
        else {
            let matchedParts = 0;
            for (const part of detectedParts) {
                if (empParts.some(ep => ep === part || levenshtein(ep, part) <= 1)) {
                    matchedParts++;
                }
            }
            const maxParts = Math.max(detectedParts.length, empParts.length);
            score = maxParts > 0 ? Math.round((matchedParts / maxParts) * 80) : 0;

            // Bonus: primeiro nome igual
            if (detectedParts[0] && empParts[0] &&
                (detectedParts[0] === empParts[0] || levenshtein(detectedParts[0], empParts[0]) <= 1)) {
                score += 10;
            }
        }

        if (score > (bestMatch?.score || 0) && score >= 40) {
            bestMatch = { id: emp.id, name: emp.name, score };
        }
    }

    return bestMatch;
};

// ============================================
// Helpers
// ============================================

/** Normaliza horário para HH:MM. Se inválido, retorna null. */
const normalizeTime = (val: any): string | null => {
    if (!val || val === '' || val === '-') return null;

    const str = String(val).trim();

    // Já está no formato HH:MM
    if (/^\d{2}:\d{2}$/.test(str)) return str;

    // Formato H:MM
    if (/^\d{1}:\d{2}$/.test(str)) return `0${str}`;

    // Formato HHMM (sem separador)
    if (/^\d{4}$/.test(str)) return `${str.slice(0, 2)}:${str.slice(2)}`;

    // Formato HH.MM (ponto como separador)
    if (/^\d{1,2}\.\d{2}$/.test(str)) return str.replace('.', ':').padStart(5, '0');

    // Qualquer outro formato com : ou . que tem 2 partes numéricas
    const parts = str.split(/[:.]/).map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        if (parts[0] >= 0 && parts[0] <= 23 && parts[1] >= 0 && parts[1] <= 59) {
            return `${String(parts[0]).padStart(2, '0')}:${String(parts[1]).padStart(2, '0')}`;
        }
    }

    return null;
};

/** Normaliza nome: remove acentos, lowercase, trim, colapsa espaços */
const normalizeName = (name: string): string => {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
};

/** Distância de Levenshtein simples (para fuzzy matching de nomes) */
const levenshtein = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[b.length][a.length];
};

/** Converte dados OCR para formato de upsert no time_entries */
export const ocrEntriesToTimeEntries = (
    entries: TimecardEntry[],
    employeeId: string
) => {
    return entries
        .filter(e => e.entrada1 || e.saida1 || e.entrada2 || e.saida2)  // Pular dias totalmente vazios
        .map(e => ({
            employee_id: employeeId,
            date: e.date,
            entry_time: e.entrada1,
            break_start: e.saida1,
            break_end: e.entrada2,
            exit_time: e.saida2,
            entry_time2: e.entrada3,   // 3º par: campos da migração
            break_start2: e.saida3,
            status: 'REGULAR',
        }));
};
