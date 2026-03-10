-- =============================================================
-- Adicionar asset_id ao bunge_billing_items
-- Permite vincular cada item de faturamento a um equipamento
-- da frota, habilitando relatório de rentabilidade por máquina.
-- =============================================================

ALTER TABLE bunge_billing_items
ADD COLUMN IF NOT EXISTS asset_id UUID;

-- Índice para consultas de relatório por equipamento
CREATE INDEX IF NOT EXISTS idx_billing_items_asset
  ON bunge_billing_items(asset_id);

-- Backfill: preencher asset_id dos itens existentes via contract_item
UPDATE bunge_billing_items bi
SET asset_id = ci.asset_id
FROM bunge_contract_items ci
WHERE bi.contract_item_id = ci.id
  AND ci.asset_id IS NOT NULL
  AND bi.asset_id IS NULL;
