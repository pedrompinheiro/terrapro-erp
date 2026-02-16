
-- Inserir dados de exemplo para o Mês Atual na tabela asset_daily_operations

do $$
declare
    v_today date := current_date;
    v_start_of_month date := date_trunc('month', v_today);
    v_asset_id uuid;
begin
    -- 1. Pega um ID de ativo aleatório
    SELECT id INTO v_asset_id FROM assets LIMIT 1;
    
    IF v_asset_id IS NOT NULL THEN
        
        -- Dia 1: Trabalhou - Pedreira
        INSERT INTO asset_daily_operations (asset_id, operation_date, status, work_site, start_time, end_time, break_start, break_end, total_hours)
        VALUES (v_asset_id, v_start_of_month + interval '0 days', 'WORKED', 'PEDREIRA', '07:30', '17:00', '12:00', '13:00', 8.5)
        ON CONFLICT DO NOTHING;

        -- Dia 2: Trabalhou - Obra Estrada
        INSERT INTO asset_daily_operations (asset_id, operation_date, status, work_site, start_time, end_time, break_start, break_end, total_hours)
        VALUES (v_asset_id, v_start_of_month + interval '1 days', 'WORKED', 'OBRA ESTRADA', '07:00', '16:00', '11:00', '12:00', 8.0)
        ON CONFLICT DO NOTHING;

        -- Dia 3: Manutenção
        INSERT INTO asset_daily_operations (asset_id, operation_date, status, work_site, start_time, end_time, total_hours)
        VALUES (v_asset_id, v_start_of_month + interval '2 days', 'MAINTENANCE', 'OFICINA', '08:00', '12:00', 0)
        ON CONFLICT DO NOTHING;

        -- Dia 4: Chuva
        INSERT INTO asset_daily_operations (asset_id, operation_date, status, work_site, total_hours)
        VALUES (v_asset_id, v_start_of_month + interval '3 days', 'RAIN', 'PEDREIRA', 0)
        ON CONFLICT DO NOTHING;

         -- Dia 5: Trabalhou
        INSERT INTO asset_daily_operations (asset_id, operation_date, status, work_site, start_time, end_time, break_start, break_end, total_hours)
        VALUES (v_asset_id, v_start_of_month + interval '4 days', 'WORKED', 'PEDREIRA', '07:30', '17:30', '12:00', '13:00', 9.0)
        ON CONFLICT DO NOTHING;

    END IF;

    -- Pega OUTRO ativo se houver
    SELECT id INTO v_asset_id FROM assets OFFSET 1 LIMIT 1;

    IF v_asset_id IS NOT NULL THEN
        -- Dia 1: Parado (Standby)
        INSERT INTO asset_daily_operations (asset_id, operation_date, status, work_site, total_hours)
        VALUES (v_asset_id, v_start_of_month + interval '0 days', 'STANDBY', 'OBRA TAPA BURACO', 0)
        ON CONFLICT DO NOTHING;
    END IF;

end;
$$;
