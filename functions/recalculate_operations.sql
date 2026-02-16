
-- Função para recalcular as operações diárias baseadas no histórico de GPS
-- Pode ser chamada via RPC do frontend: supabase.rpc('recalculate_operations', { target_asset_id: '...', start_date: '...', end_date: '...' })

CREATE OR REPLACE FUNCTION recalculate_operations(
    target_asset_id UUID DEFAULT NULL,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    processed_count INT,
    details TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_start DATE;
    v_end DATE;
    v_rec RECORD;
    v_total_processed INT := 0;
BEGIN
    -- Define período padrão se não informado (últimos 7 dias ou mês atual)
    v_start := COALESCE(start_date, CURRENT_DATE - INTERVAL '7 days');
    v_end := COALESCE(end_date, CURRENT_DATE);

    -- Loop pelos dias
    FOR i IN 0..(v_end - v_start)::INT LOOP
        DECLARE
            v_current_date DATE := v_start + i;
            v_day_start TIMESTAMPTZ := v_current_date::TIMESTAMPTZ;
            v_day_end TIMESTAMPTZ := v_current_date::TIMESTAMPTZ + INTERVAL '23 hours 59 minutes 59 seconds';
        BEGIN
            -- Loop pelos ativos (ou apenas o alvo)
            FOR v_rec IN 
                SELECT id, code, name FROM assets 
                WHERE (target_asset_id IS NULL OR id = target_asset_id)
            LOOP
                -- Lógica de processamento principal
                DECLARE
                    v_hours NUMERIC := 0;
                    v_start_time TIME;
                    v_end_time TIME;
                    v_location TEXT;
                    v_status TEXT := 'STANDBY';
                    v_positions_count INT;
                BEGIN
                    -- Calcula horas trabalhadas usando Window Functions (LAG)
                    -- Considera apenas intervalos menores que 1 hora para evitar distorções se GPS desligar
                    SELECT 
                        COALESCE(SUM(EXTRACT(EPOCH FROM (timestamp - prev_ts))/3600), 0),
                        MIN(timestamp)::TIME,
                        MAX(timestamp)::TIME,
                        COUNT(*)
                    INTO v_hours, v_start_time, v_end_time, v_positions_count
                    FROM (
                        SELECT 
                            timestamp,
                            ignition,
                            LAG(timestamp) OVER (ORDER BY timestamp) as prev_ts,
                            LAG(ignition) OVER (ORDER BY timestamp) as prev_ign
                        FROM asset_positions
                        WHERE asset_id = v_rec.id
                          AND timestamp >= v_day_start
                          AND timestamp <= v_day_end
                    ) sub
                    WHERE prev_ign = true -- Só conta tempo se ignição anterior estava ON
                      AND (timestamp - prev_ts) < INTERVAL '1 hour';


                    -- Se achou dados
                    IF v_positions_count > 0 THEN
                        -- Pega localização aproximada (primeira com ignição on, ou primeira geral)
                        SELECT CONCAT(latitude, ', ', longitude) INTO v_location
                        FROM asset_positions
                        WHERE asset_id = v_rec.id 
                          AND timestamp >= v_day_start 
                          AND timestamp <= v_day_end
                          AND (ignition = true OR v_hours = 0)
                        ORDER BY ignition DESC, timestamp ASC
                        LIMIT 1;

                        -- Define Status
                        IF v_hours > 0.1 THEN 
                            v_status := 'WORKED'; 
                        ELSE
                            -- Se tem sinal mas não computou horas, marca como LOCATED/STANDBY
                            v_status := 'STANDBY';
                        END IF;
                        
                        -- Upsert na tabela de operações (GARANTE CRIAÇÃO DO REGISTRO)
                        INSERT INTO asset_daily_operations (
                            asset_id, operation_date, status, work_site, 
                            start_time, end_time, total_hours, updated_at
                        ) VALUES (
                            v_rec.id, v_current_date, v_status, COALESCE(v_location, 'Localizado via GPS'),
                            v_start_time, v_end_time, ROUND(v_hours, 2), NOW()
                        )
                        ON CONFLICT (asset_id, operation_date) 
                        DO UPDATE SET 
                            status = EXCLUDED.status,
                            work_site = EXCLUDED.work_site,
                            start_time = EXCLUDED.start_time,
                            end_time = EXCLUDED.end_time,
                            total_hours = EXCLUDED.total_hours,
                            updated_at = NOW();
                            
                        v_total_processed := v_total_processed + 1;
                    END IF;
                END;
            END LOOP;
        END;
    END LOOP;

    RETURN QUERY SELECT v_total_processed, 'Processamento concluído com sucesso';
END;
$$;
