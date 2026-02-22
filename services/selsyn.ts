
const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev ? '/api/selsyn' : 'https://api.appselsyn.com.br/keek/rest';
const API_KEY = import.meta.env.VITE_SELSYN_API_KEY;

// ========== Verificação de Expiração da Chave Selsyn ==========
export interface SelsynKeyStatus {
    valid: boolean;
    expiresAt: Date | null;
    hoursRemaining: number;
    expired: boolean;
    message: string;
}

export const checkSelsynKeyExpiration = (): SelsynKeyStatus => {
    if (!API_KEY) {
        return { valid: false, expiresAt: null, hoursRemaining: 0, expired: true, message: 'Chave Selsyn não configurada.' };
    }

    try {
        const decoded = JSON.parse(atob(API_KEY));
        if (!decoded.sc) {
            return { valid: true, expiresAt: null, hoursRemaining: 999, expired: false, message: 'Chave sem data de expiração detectada.' };
        }

        const expiresAt = new Date(decoded.sc * 1000);
        const now = new Date();
        const hoursRemaining = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursRemaining <= 0) {
            return { valid: false, expiresAt, hoursRemaining: 0, expired: true, message: `Chave Selsyn EXPIRADA em ${expiresAt.toLocaleString('pt-BR')}.` };
        }

        if (hoursRemaining <= 2) {
            return { valid: true, expiresAt, hoursRemaining, expired: false, message: `⚠️ Chave Selsyn expira em ${Math.round(hoursRemaining * 60)} minutos!` };
        }

        if (hoursRemaining <= 6) {
            return { valid: true, expiresAt, hoursRemaining, expired: false, message: `Chave Selsyn expira em ${Math.round(hoursRemaining)} horas.` };
        }

        return { valid: true, expiresAt, hoursRemaining, expired: false, message: 'Chave Selsyn válida.' };
    } catch {
        return { valid: true, expiresAt: null, hoursRemaining: 999, expired: false, message: 'Não foi possível verificar expiração da chave.' };
    }
};

// Interface baseada na resposta da API de Integração
export interface SelsynPosition {
    identificador: string;       // Placa/ID (Ex: AAA0033)
    rastreavel: string;          // Nome Exibição (Ex: PC09 - PA CARREGADEIRA)
    latitude: number;
    longitude: number;
    velocidade: number;          // km/h
    ignicao: boolean;            // true=ligado
    dataHora: string;            // ISO Date (Ex: 2026-02-10T14:34:09.000Z)

    fonteEnergia?: number;       // Voltagem Bateria
    odometro?: number;
    horimetro?: number;
    tipo?: string;               // Ex: CARREGADEIRA

    // Campos legados mapeados (opcional)
    endereco?: string;
}

export const fetchFleetPositions = async (): Promise<SelsynPosition[]> => {
    if (!API_KEY) {
        console.warn('Selsyn API Key not found in environment variables.');
        return [];
    }

    try {
        // Endpoint de Integração Passiva - Posição de TODOS os rastreáveis
        // Documentação: apikey como query parameter (NÃO como header)
        const url = `${API_BASE_URL}/v1/integracao/posicao?apikey=${API_KEY}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Selsyn API Error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data = await response.json();

        // A API de Operador retorna Array direto
        if (Array.isArray(data)) {
            return data;
        } else if (data && Array.isArray(data.list)) {
            return data.list;
        }

        return [];
    } catch (error) {
        console.error('Error fetching Selsyn positions:', error);
        return [];
    }
};

export const getVehicleStatus = (pos: SelsynPosition): 'moving' | 'stopped' | 'idle' | 'offline' => {
    if (!pos.dataHora) return 'offline';

    const now = new Date();
    // Ajuste fuso horário se necessário, mas ISO string é UTC geralmente
    const posDate = new Date(pos.dataHora);
    const diffMinutes = (now.getTime() - posDate.getTime()) / 60000;

    // Se a diferença for muito grande (testando > 3h pois pode haver fuso horário errado no servidor)
    // Selsyn geralmente manda UTC.
    if (diffMinutes > 180) return 'offline'; // 3 horas tolerância (devido a fuso)

    if (pos.velocidade > 0) return 'moving';
    if (pos.ignicao && pos.velocidade === 0) return 'idle';
    return 'stopped';
};
