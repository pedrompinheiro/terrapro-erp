
import axios from 'axios';

// Configurações (Lendo do .env ou usando padrão local)
const API_URL = import.meta.env.VITE_EVOLUTION_API_URL || 'http://localhost:8080';
const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || '';
const INSTANCE_NAME = 'terrapro_bot'; // Nome fixo da instância para facilitar

// Configuração do Axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
    }
});

export const evolutionService = {
    // 1. Checar se a instância existe e qual o status
    async getConnectionState() {
        try {
            // Tenta buscar o estado da conexão
            const response = await api.get(`/instance/connectionState/${INSTANCE_NAME}`);
            // Retorna: { instance: "terrapro_bot", state: "open" | "close" | "connecting" }
            return response.data?.instance?.state || 'orphaned';
        } catch (error: any) {
            if (error.response?.status === 404) {
                return 'not_found'; // Instância nem existe ainda
            }
            console.error('Erro ao checar status:', error);
            return 'error';
        }
    },

    // 2. Criar a Instância (Se não existir)
    async createInstance() {
        try {
            const response = await api.post('/instance/create', {
                instanceName: INSTANCE_NAME,
                description: "TerraPro ERP Bot",
                qrcode: true, // Retorna QR Code na resposta se conectar
                integration: "WHATSAPP-BAILEYS"
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar instância:', error);
            throw error;
        }
    },

    // 3. Conectar e Pegar QR Code
    async connectInstance() {
        try {
            // Na V2, o connect retorna o base64 do QR code se estiver desconectado
            const response = await api.get(`/instance/connect/${INSTANCE_NAME}`);
            return response.data; // Espera-se { base64: "...", code: "..." }
        } catch (error) {
            console.error('Erro ao conectar:', error);
            throw error;
        }
    },

    // 4. Desconectar (Logout)
    async logoutInstance() {
        try {
            await api.delete(`/instance/logout/${INSTANCE_NAME}`);
        } catch (error) {
            console.error('Erro ao deslogar:', error);
        }
    },

    // 5. Deletar Instância (Reset Total)
    async deleteInstance() {
        try {
            await api.delete(`/instance/delete/${INSTANCE_NAME}`);
        } catch (error) {
            console.error('Erro ao deletar:', error);
        }
    },

    // 5.1 Reset Completo (Deleta + Recria + Conecta)
    async resetInstance() {
        try {
            console.log('🔄 Iniciando reset forçado...');

            // 1. Deletar instância existente
            try {
                await this.deleteInstance();
                console.log('✅ Instância deletada');
            } catch (e) {
                console.log('⚠️ Nada para deletar');
            }

            // 2. Aguardar 2s para garantir limpeza
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 3. Criar nova instância
            console.log('🔨 Criando nova instância...');
            const createResult = await this.createInstance();
            console.log('✅ Instância criada:', createResult);

            // 4. Aguardar 3s para inicialização
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 5. Tentar obter QR Code
            console.log('📱 Solicitando QR Code...');
            const connectResult = await this.connectInstance();

            return connectResult;
        } catch (error) {
            console.error('❌ Erro no reset:', error);
            throw error;
        }
    },

    // 6. Enviar Mensagem de Texto
    async sendText(phone: string, text: string) {
        try {
            const cleanPhone = phone.replace(/\D/g, '');
            const remoteJid = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@s.whatsapp.net`;

            const response = await api.post(`/message/sendText/${INSTANCE_NAME}`, {
                number: remoteJid,
                options: {
                    delay: 1200,
                    presence: "composing",
                },
                textMessage: {
                    text: text
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            throw error;
        }
    },

    // 7. Enviar Mídia (PDF, imagem, documento)
    async sendMedia(phone: string, mediaUrl: string, caption?: string, mediaType: 'document' | 'image' = 'document', fileName?: string) {
        try {
            const cleanPhone = phone.replace(/\D/g, '');
            const remoteJid = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@s.whatsapp.net`;

            const response = await api.post(`/message/sendMedia/${INSTANCE_NAME}`, {
                number: remoteJid,
                options: {
                    delay: 1200,
                    presence: "composing",
                },
                mediaMessage: {
                    mediatype: mediaType,
                    media: mediaUrl,
                    caption: caption || '',
                    fileName: fileName || 'documento.pdf'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao enviar mídia:', error);
            throw error;
        }
    },

    // 8. Configurar Webhook (aponta Evolution API → Supabase Edge Function)
    async setWebhook(webhookUrl: string) {
        try {
            const response = await api.post(`/webhook/set/${INSTANCE_NAME}`, {
                webhook: {
                    enabled: true,
                    url: webhookUrl,
                    webhookByEvents: false,
                    webhookBase64: false,
                    events: [
                        "MESSAGES_UPSERT",
                        "GROUPS_UPSERT",
                        "CONNECTION_UPDATE"
                    ]
                }
            });
            console.log('✅ Webhook configurado:', webhookUrl);
            return response.data;
        } catch (error) {
            console.error('Erro ao configurar webhook:', error);
            throw error;
        }
    },

    // 9. Buscar configuração atual do webhook
    async getWebhook() {
        try {
            const response = await api.get(`/webhook/find/${INSTANCE_NAME}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar webhook:', error);
            return null;
        }
    }
};
