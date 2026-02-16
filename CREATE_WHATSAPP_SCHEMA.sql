
-- 1. Grupos Monitorados
CREATE TABLE IF NOT EXISTS whatsapp_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    members_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Mensagens (Chat Stream)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES whatsapp_groups(id), -- Opcional, pode ser msg direta
    sender_name TEXT NOT NULL,
    sender_phone TEXT,
    content TEXT NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Campos da Análise de IA
    ai_intent TEXT, -- ex: MAINTENANCE_REQUEST
    ai_asset TEXT,  -- ex: Escavadeira 04
    ai_urgency TEXT, -- LOW, MEDIUM, HIGH
    ai_action TEXT, -- Ação sugerida
    
    status TEXT DEFAULT 'PENDING' -- PENDING, PROCESSED, IGNORED
);

-- 3. Regras de Automação
CREATE TABLE IF NOT EXISTS whatsapp_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    trigger_condition TEXT NOT NULL, -- Descrição do gatilho
    action_description TEXT NOT NULL, -- Descrição da ação
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Campanhas em Massa
CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    target_audience TEXT NOT NULL, -- ex: 'ALL_CLIENTS', 'SUPPLIERS'
    message_content TEXT NOT NULL,
    status TEXT DEFAULT 'DRAFT', -- DRAFT, SCHEDULED, SENT
    sent_count INT DEFAULT 0,
    total_count INT DEFAULT 0,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissões (RLS Simplificado para uso interno)
ALTER TABLE whatsapp_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Total Grupos" ON whatsapp_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Mensagens" ON whatsapp_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Regras" ON whatsapp_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Campanhas" ON whatsapp_campaigns FOR ALL USING (true) WITH CHECK (true);

-- Dados Iniciais (Seed) para não ficar vazio
INSERT INTO whatsapp_groups (name, members_count, is_active) VALUES 
('🚜 Manutenção Campo', 14, true),
('💰 Financeiro Urgente', 5, true),
('🚛 Logística Dourados', 8, false);

INSERT INTO whatsapp_rules (name, trigger_condition, action_description, is_active) VALUES
('Auto-Responder Boleto', 'Mensagem contém "Boleto"', 'Enviar Link do Portal', true),
('Alerta de Parada', 'Sistema detecta falha > 30min', 'Notificar Grupo Manutenção', true);
