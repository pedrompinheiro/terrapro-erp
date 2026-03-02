
-- Tabela para guardar configurações de integrações e sistema
CREATE TABLE IF NOT EXISTS system_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name TEXT UNIQUE NOT NULL, -- ex: 'WHATSAPP'
    status TEXT DEFAULT 'DISCONNECTED', -- 'CONNECTED', 'DISCONNECTED'
    connected_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}'::jsonb, -- Para guardar número conectado, webhook url, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE system_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total Integrations" ON system_integrations FOR ALL USING (true) WITH CHECK (true);

-- Inserir configuração padrão do WhatsApp (Desconectado inicialmente)
INSERT INTO system_integrations (service_name, status, settings) 
VALUES ('WHATSAPP', 'DISCONNECTED', '{"phone": null, "instance_id": null}')
ON CONFLICT (service_name) DO NOTHING;
