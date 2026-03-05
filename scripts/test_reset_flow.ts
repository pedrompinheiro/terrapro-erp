import axios from 'axios';

const API_URL = 'http://localhost:8080';
const API_KEY = process.env.VITE_EVOLUTION_API_KEY || '';
const INSTANCE_NAME = 'terrapro_bot';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
    }
});

async function testResetFlow() {
    console.log('\n🔄 ===== TESTE DE RESET FORÇADO =====\n');

    try {
        // 1. Deletar instância existente
        console.log('1️⃣ Deletando instância existente...');
        try {
            await api.delete(`/instance/delete/${INSTANCE_NAME}`);
            console.log('   ✅ Instância deletada com sucesso');
        } catch (e: any) {
            console.log('   ⚠️ Nenhuma instância para deletar (OK)');
        }

        // 2. Aguardar 2s
        console.log('\n2️⃣ Aguardando 2s para limpeza...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('   ✅ Aguardado');

        // 3. Criar nova instância
        console.log('\n3️⃣ Criando nova instância...');
        const createResult = await api.post('/instance/create', {
            instanceName: INSTANCE_NAME,
            description: "TerraPro ERP Bot",
            qrcode: true,
            integration: "WHATSAPP-BAILEYS"
        });
        console.log('   ✅ Instância criada:');
        console.log('   📊 Status:', createResult.data.instance.status);
        console.log('   🆔 ID:', createResult.data.instance.instanceId);

        // 4. Aguardar 5s para inicialização
        console.log('\n4️⃣ Aguardando 5s para inicialização do Baileys...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('   ✅ Aguardado');

        // 5. Tentar obter QR Code (múltiplas tentativas)
        console.log('\n5️⃣ Tentando obter QR Code...');
        let qrCodeObtido = false;

        for (let i = 1; i <= 8; i++) {
            console.log(`\n   🔍 Tentativa ${i}/8...`);

            const connectResult = await api.get(`/instance/connect/${INSTANCE_NAME}`);

            if (connectResult.data.base64 || connectResult.data.qrcode?.base64) {
                const qrBase64 = connectResult.data.base64 || connectResult.data.qrcode.base64;
                console.log('   ✅ QR CODE OBTIDO COM SUCESSO!');
                console.log('   📏 Tamanho:', qrBase64.length, 'caracteres');
                console.log('   🔗 Prefixo:', qrBase64.substring(0, 50) + '...');
                qrCodeObtido = true;
                break;
            } else {
                console.log('   ⏳ Ainda não disponível (count:', connectResult.data.count, ')');
                if (i < 8) {
                    console.log('   ⏰ Aguardando 3s antes da próxima tentativa...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
        }

        if (!qrCodeObtido) {
            console.log('\n   ❌ QR Code não foi gerado após 8 tentativas');
            console.log('   ℹ️ Isso pode indicar problema de rede ou DNS no Docker');
        }

        // 6. Verificar status final
        console.log('\n6️⃣ Verificando status final...');
        const statusResult = await api.get(`/instance/connectionState/${INSTANCE_NAME}`);
        console.log('   📊 Estado:', statusResult.data.instance.state);

        console.log('\n✅ ===== TESTE CONCLUÍDO =====\n');

    } catch (error: any) {
        console.error('\n❌ ERRO NO TESTE:', error.response?.data || error.message);
    }
}

testResetFlow();
