-- Analisa a densidade dos dados de GPS para ver se a lógica de cálculo está descartando tudo
SELECT 
    asset_id,
    timestamp,
    timestamp - LAG(timestamp) OVER (PARTITION BY asset_id ORDER BY timestamp) as diff,
    ignition
FROM asset_positions
WHERE timestamp >= '2026-02-13 00:00:00'::timestamptz
ORDER BY asset_id, timestamp
LIMIT 20;
