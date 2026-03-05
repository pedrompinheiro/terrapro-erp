-- Fix COMPLETO: Adicionar TODAS as colunas faltantes em fuel_records
-- Garante que todas as colunas usadas pelo FuelManagement.tsx existam

ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS operation_type TEXT DEFAULT 'OUT';
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS total_value NUMERIC;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS price_per_liter NUMERIC;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS asset_id UUID;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS asset_name TEXT;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS supplier_id UUID;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS supplier_name TEXT;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS responsible_id UUID;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS responsible_name TEXT;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS installment_interval INTEGER DEFAULT 30;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS first_due_date DATE;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS horometer NUMERIC;
