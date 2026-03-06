/**
 * Smart Search Engine — TerraPro ERP
 *
 * Busca inteligente reutilizável com:
 * - Normalização de acentos (José → Jose, São → Sao)
 * - Tokenização (busca por múltiplas palavras)
 * - Fuzzy match (tolera erros de digitação via Levenshtein)
 * - Busca por documento sem formatação (CNPJ/CPF)
 * - Ranking por relevância (score)
 */

// Remove acentos: José → Jose, São Paulo → Sao Paulo
export const normalize = (str: string): string =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Extrai apenas dígitos
export const onlyDigits = (str: string): string => str.replace(/\D/g, '');

// Similaridade entre duas strings (0 a 1) — Levenshtein
export const similarity = (a: string, b: string): number => {
  if (a === b) return 1;
  if (!a || !b) return 0;

  const la = a.length;
  const lb = b.length;
  const minLen = Math.min(la, lb);
  const maxLen = Math.max(la, lb);

  // Substring match: só conta se a parte menor tem >= 3 chars
  // e representa pelo menos 40% da maior (evita "e" matchando "dieselcom")
  if (minLen >= 3 && (a.includes(b) || b.includes(a))) {
    return 0.5 + 0.4 * (minLen / maxLen); // 0.5~0.9 proporcional ao tamanho
  }

  // Se as strings são muito diferentes em tamanho, não calcula Levenshtein
  if (Math.abs(la - lb) > maxLen * 0.4) return 0;

  const matrix: number[][] = [];
  for (let i = 0; i <= la; i++) matrix[i] = [i];
  for (let j = 0; j <= lb; j++) matrix[0][j] = j;
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return maxLen === 0 ? 1 : 1 - matrix[la][lb] / maxLen;
};

// Score de um campo contra tokens de busca
export const fieldScore = (field: string | undefined | null, tokens: string[]): number => {
  if (!field) return 0;
  const norm = normalize(field);
  let score = 0;
  for (const token of tokens) {
    if (norm.includes(token)) {
      // Match exato parcial — peso alto
      score += (token.length / Math.max(norm.length, 1)) * 10;
    } else {
      // Fuzzy: checa cada palavra do campo (ignora palavras < 3 chars)
      const words = norm.split(/\s+/).filter(w => w.length >= 3);
      let bestSim = 0;
      for (const word of words) {
        const sim = similarity(word, token);
        if (sim > bestSim) bestSim = sim;
      }
      // Só conta se similaridade > 0.65 (tolera ~2 letras erradas em 6)
      if (bestSim >= 0.65) score += bestSim * 5;
    }
  }
  return score;
};

// Score de match por documento (CNPJ/CPF/RG) — só dígitos
export const documentScore = (docField: string | undefined | null, searchDigits: string): number => {
  if (!docField || searchDigits.length < 3) return 0;
  const docDigits = onlyDigits(docField);
  if (!docDigits) return 0;
  if (docDigits === searchDigits) return 100;
  if (docDigits.includes(searchDigits)) return 80;
  if (searchDigits.includes(docDigits) && docDigits.length > 3) return 60;
  return 0;
};

/**
 * Configura campos de busca com pesos
 */
export interface SearchField {
  /** Nome do campo no objeto */
  key: string;
  /** Peso do campo na relevância (padrão 1) */
  weight?: number;
  /** Campo é um documento (CNPJ/CPF) — busca por dígitos */
  isDocument?: boolean;
  /** Campo é telefone — busca por dígitos */
  isPhone?: boolean;
  /** Campo é numérico (converter para string antes) */
  isNumeric?: boolean;
}

/**
 * Busca inteligente genérica
 *
 * @param items Array de objetos para filtrar
 * @param searchTerm Texto digitado pelo usuário
 * @param fields Configuração dos campos de busca
 * @returns Array filtrado e ordenado por relevância
 *
 * @example
 * ```ts
 * const results = smartSearch(products, searchTerm, [
 *   { key: 'description', weight: 3 },
 *   { key: 'sku', weight: 2 },
 *   { key: 'brand_name', weight: 1.5 },
 *   { key: 'barcode', isDocument: true },
 * ]);
 * ```
 */
export function smartSearch<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  fields: SearchField[]
): T[] {
  const term = searchTerm?.trim();
  if (!term) return items;

  const normTerm = normalize(term);
  const digits = onlyDigits(term);
  const tokens = normTerm.split(/\s+/).filter(t => t.length > 0);

  if (tokens.length === 0) return items;

  const scored = items.map(item => {
    let score = 0;

    for (const f of fields) {
      const val = item[f.key];
      const weight = f.weight ?? 1;

      if (f.isDocument) {
        score += documentScore(val, digits) * weight;
      } else if (f.isPhone) {
        if (digits.length >= 4) {
          const phoneDigits = onlyDigits(val || '');
          if (phoneDigits.includes(digits)) score += 30 * weight;
        }
      } else if (f.isNumeric) {
        const strVal = val != null ? String(val) : '';
        if (strVal && strVal.includes(term)) score += 20 * weight;
      } else {
        score += fieldScore(val, tokens) * weight;
      }
    }

    return { item, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.item);
}
