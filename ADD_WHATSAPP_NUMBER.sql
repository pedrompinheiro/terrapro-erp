
-- Adiciona número de WhatsApp para pedidos no tanque
ALTER TABLE fuel_tanks 
ADD COLUMN IF NOT EXISTS whatsapp_order_number TEXT DEFAULT '55'; -- Ex: 5567999999999
