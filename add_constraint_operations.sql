
-- Adicionar constraint UNIQUE para permitir automação sem duplicados

ALTER TABLE asset_daily_operations 
ADD CONSTRAINT unique_asset_date UNIQUE (asset_id, operation_date);

-- Se já houver registros duplicados (o que seria inválido para adicionar constraint), 
-- o comando falhará. Nesse caso, rodar antes:
-- DELETE FROM asset_daily_operations 
-- WHERE id NOT IN (
--     SELECT MIN(id) 
--     FROM asset_daily_operations 
--     GROUP BY asset_id, operation_date
-- );

-- Garantir acesso a sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
