-- Adiciona colunas necessárias para rastreamento
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS telemetry JSONB DEFAULT '{"speed": 0, "ignition": false, "voltage": 12.0, "satelliteCount": 0, "lastUpdate": "N/A"}'::jsonb,
ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT '{"lat": -23.5505, "lng": -46.6333}'::jsonb;

-- Cria um veículo de teste para validar o mapa (apenas se não houver nenhum)
INSERT INTO assets (id, name, model, brand, status, company_id, coordinates, telemetry)
SELECT 
    'FROTA-001', 
    'Caminhão Demo', 
    'Volvo FH', 
    'Volvo', 
    'OPERATING', 
    (SELECT id FROM companies LIMIT 1),
    '{"lat": -23.5505, "lng": -46.6333}'::jsonb,
    '{"speed": 45, "ignition": true, "voltage": 24.2, "satelliteCount": 12, "lastUpdate": "10:00:00"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM assets LIMIT 1);
