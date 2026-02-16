
const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev ? '/api/selsyn' : 'https://api.appselsyn.com.br/keek/rest';
const API_KEY = import.meta.env.VITE_SELSYN_API_KEY;

// Interface baseada na resposta da integração de Operador
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
        // Endpoint de Operador - Posição de TODOS os rastreáveis
        const url = `${API_BASE_URL}/v1/integracao/operador/posicao`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
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
