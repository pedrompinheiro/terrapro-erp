
-- Habilita as extensões necessárias para agendamento e requisições HTTP
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Limpa agendamentos antigos (remova o comentário abaixo apenas se precisar atualizar o job existente)
-- SELECT cron.unschedule('process-gps-every-minute');

-- Cria o agendamento para rodar a cada minuto (* * * * *)
-- Substitua 'YOUR_PROJECT_REF' pela referência do seu projeto (ex: abcdefghijklm)
-- E 'YOUR_CRON_SECRET' pela chave de serviço (service_role key)
SELECT cron.schedule(
    'process-gps-every-minute', -- Nome da tarefa
    '* * * * *',                -- Cron expression (todo minuto)
    $$
    SELECT
        net.http_post(
            -- URL da sua Edge Function
            url:='https://xpufmosdhhemcubzswcv.supabase.co/functions/v1/gps-processor',
            
            -- Headers (Autenticação)
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdWZtb3NkaGhlbWN1Ynpzd2N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE1NTUzNCwiZXhwIjoyMDg1NzMxNTM0fQ.r_3HlVZxnG2zEwY4B7y1m8TiK20jLBQc4XVr5uvXL08"}'::jsonb,
            
            -- Corpo da requisição (opcional)
            body:='{}'::jsonb
        ) as request_id;
    $$
);

-- Para verificar se está rodando, use:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
