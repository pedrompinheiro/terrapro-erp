-- Conta quantos registros de GPS (posições) temos para hoje
SELECT count(*) as total_gps_positions_today
FROM asset_positions 
WHERE timestamp >= '2026-02-13T00:00:00' 
  AND timestamp <= '2026-02-13T23:59:59';

-- Mostra os últimos registros de GPS para ver quando parou
SELECT * FROM asset_positions ORDER BY timestamp DESC LIMIT 5;
