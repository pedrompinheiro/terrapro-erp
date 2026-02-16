
import { supabase } from '../lib/supabase';

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

export interface AutomationLog {
    id?: string;
    automation_name: string; // Ex: 'SelsynGPS', 'ImportVeiculos'
    level: LogLevel;
    message: string;
    details?: any; // JSON object para dados extras
    created_at?: string;
}

// Fallback in-memory
const memoryLogs: AutomationLog[] = [];

export const logger = {
    log: async (automation: string, level: LogLevel, message: string, details?: any) => {
        const timestamp = new Date().toISOString();
        const icon = level === 'ERROR' ? 'Bz' : level === 'SUCCESS' ? '✅' : level === 'WARNING' ? '⚠️' : 'ℹ️';
        console.log(`[${timestamp}] ${icon} [${automation}] ${message}`, details || '');

        const logItem: AutomationLog = {
            id: Math.random().toString(36),
            automation_name: automation,
            level,
            message,
            details,
            created_at: timestamp
        };

        // Salvar em memória (últimos 100)
        memoryLogs.unshift(logItem);
        if (memoryLogs.length > 100) memoryLogs.pop();

        // Tentar salvar no Supabase
        const { error } = await supabase.from('automation_logs').insert({
            automation_name: automation,
            level,
            message,
            details,
            created_at: timestamp
        });

        if (error) {
            console.warn('Falha Supabase Log (usando memória):', error.message);
        }
    },

    info: (automation: string, message: string, details?: any) => logger.log(automation, 'INFO', message, details),
    success: (automation: string, message: string, details?: any) => logger.log(automation, 'SUCCESS', message, details),
    warn: (automation: string, message: string, details?: any) => logger.log(automation, 'WARNING', message, details),
    error: (automation: string, message: string, details?: any) => logger.log(automation, 'ERROR', message, details),

    // Buscar logs (Mescla Banco + Memória)
    fetchLogs: async (limit = 100) => {
        const { data, error } = await supabase
            .from('automation_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error || !data) {
            return [...memoryLogs];
        }

        // Se tiver dados do banco, retorna eles. Se quiser mesclar, poderia, mas melhor priorizar banco.
        return data as AutomationLog[];
    }
};
