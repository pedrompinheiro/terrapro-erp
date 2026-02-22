
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_URL = process.env.VITE_EVOLUTION_API_URL || 'http://localhost:8080';
const API_KEY = process.env.VITE_EVOLUTION_API_KEY || '';
const INSTANCE_NAME = 'terrapro_bot';

console.log(`Testing Evolution API at ${API_URL}`);
console.log(`Instance: ${INSTANCE_NAME}`);

async function test() {
    try {
        // 1. Check Status
        console.log('\n--- 1. Checking Status ---');
        try {
            const statusRes = await axios.get(`${API_URL}/instance/connectionState/${INSTANCE_NAME}`, {
                headers: { apikey: API_KEY }
            });
            console.log('Status Response:', JSON.stringify(statusRes.data, null, 2));
        } catch (e: any) {
            console.log('Status Check Failed (Expected if instance does not exist):', e.response?.status, e.response?.data);
        }

        // 2. Create/Connect
        console.log('\n--- 2. Try Create & Connect ---');
        try {
            // Create
            try {
                const createRes = await axios.post(`${API_URL}/instance/create`, {
                    instanceName: INSTANCE_NAME,
                    qrcode: true,
                    integration: "WHATSAPP-BAILEYS"
                }, { headers: { apikey: API_KEY } });
                console.log('Create Response:', JSON.stringify(createRes.data, null, 2));
            } catch (e: any) {
                console.log('Create Failed (Maybe exists):', e.response?.data || e.message);
            }

            // Connect
            const connectRes = await axios.get(`${API_URL}/instance/connect/${INSTANCE_NAME}`, {
                headers: { apikey: API_KEY }
            });
            console.log('Connect Response:', JSON.stringify(connectRes.data, null, 2));

            if (connectRes.data.base64) console.log('✅ Has base64 at root');
            if (connectRes.data.qrcode?.base64) console.log('✅ Has base64 inside qrcode object');

        } catch (e: any) {
            console.error('Connect Error:', e.response?.data || e.message);
        }

    } catch (err) {
        console.error("Fatal Error:", err);
    }
}

test();
