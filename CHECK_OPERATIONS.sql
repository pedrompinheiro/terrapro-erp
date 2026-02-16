-- Verifica se existem apontamentos para o dia 13/02/2026
SELECT 
    count(*) as total_apontamentos_hoje
FROM 
    asset_daily_operations 
WHERE 
    operation_date = '2026-02-13';

-- Lista os últimos 5 apontamentos gerais para confirmar se tem algo no banco
SELECT * FROM asset_daily_operations ORDER BY operation_date DESC LIMIT 5;

-- Verifica as permissões da tabela (Policies RLS)
SELECT * FROM pg_policies WHERE tablename = 'asset_daily_operations';
