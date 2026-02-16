-- Atualizar a função no banco
\i /Users/pedromi/Downloads/terrapro-erp---gestão-de-ativos/functions/recalculate_operations.sql

-- Forçar o recálculo novamente
SELECT recalculate_operations(NULL, '2026-02-13', '2026-02-13');

-- Conferir se agora apareceram registros
SELECT * FROM asset_daily_operations WHERE operation_date = '2026-02-13';
