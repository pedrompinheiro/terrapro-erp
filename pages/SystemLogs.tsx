
import React, { useEffect, useState } from 'react';
import { logger, AutomationLog, LogLevel } from '../services/logger';
import { supabase } from '../lib/supabase';

// Helper de icons
const getLevelIcon = (level: LogLevel) => {
    switch (level) {
        case 'ERROR': return 'text-red-500 font-bold';
        case 'WARNING': return 'text-yellow-400 font-semibold';
        case 'SUCCESS': return 'text-green-400 font-bold';
        default: return 'text-gray-300';
    }
}

export default function SystemLogs() {
    const [logs, setLogs] = useState<AutomationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterName, setFilterName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const refreshLogs = async () => {
        try {
            setLoading(true);
            const data: any = await logger.fetchLogs(200);
            setLogs(data);
            setErrorMsg('');
        } catch (e: any) {
            console.error(e);
            setErrorMsg('Falha ao carregar logs. Verifique se a tabela "automation_logs" existe.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh a cada 5s
    useEffect(() => {
        refreshLogs();
        const interval = setInterval(refreshLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    // Função para criar a tabela se não existir (Admin Tool)
    const createTable = async () => {
        try {
            // RPC call if exists, or direct SQL via postgres role? Usually not possible from client.
            // However, we can TRY creating via JS if the user is admin/postgres.
            // But here we'll just show the SQL command to copy.
            alert("Copie este SQL e execute no Supabase SQL Editor:\n\n" +
                "CREATE TABLE IF NOT EXISTS automation_logs (\n" +
                "  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,\n" +
                "  automation_name text NOT NULL,\n" +
                "  level text NOT NULL,\n" +
                "  message text,\n" +
                "  details jsonb,\n" +
                "  created_at timestamptz DEFAULT now()\n" +
                ");\n\n" +
                "ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;\n" +
                "CREATE POLICY \"Enable ALL for authenticated users\" ON automation_logs FOR ALL USING (auth.role() = 'authenticated');"
            );
        } catch (e) {
            alert('Erro: ' + e);
        }
    }

    const filteredLogs = logs.filter(log =>
        log.automation_name.toLowerCase().includes(filterName.toLowerCase()) ||
        log.message.toLowerCase().includes(filterName.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-slate-900 text-slate-200 font-sans">
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <header className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            📜 Logs de Automação
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">Monitoramento em tempo real das integrações (GPS, Imports, Syncs)</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={refreshLogs}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-sm transition border border-slate-700"
                        >
                            🔄 Atualizar
                        </button>
                        <button
                            onClick={async () => {
                                const btn = document.getElementById('btn-diag');
                                if (btn) btn.innerText = "⏳ Rodando...";
                                try {
                                    const { runSystemDiagnostics } = await import('../services/systemAuditor');
                                    await runSystemDiagnostics();
                                    alert("Diagnóstico Finalizado! Verifique os logs abaixo.");
                                    refreshLogs();
                                } catch (e) {
                                    alert('Erro no diagnóstico: ' + e);
                                } finally {
                                    if (btn) btn.innerText = "🚀 Diagnóstico de Sistema";
                                }
                            }}
                            id="btn-diag"
                            className="bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 px-4 py-2 rounded text-sm transition border border-blue-800"
                        >
                            🚀 Diagnóstico de Sistema
                        </button>
                        <button
                            onClick={createTable}
                            className="bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 px-4 py-2 rounded text-sm transition border border-purple-800"
                        >
                            🛠️ Criar Tabela (SQL)
                        </button>
                    </div>
                </header>

                <div className="mb-4 flex gap-4">
                    <input
                        type="text"
                        placeholder="Filtrar logs..."
                        value={filterName}
                        onChange={e => setFilterName(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm text-white w-full max-w-md focus:border-blue-500 outline-none"
                    />
                    {errorMsg && (
                        <div className="text-red-400 text-sm flex items-center bg-red-900/20 px-3 py-1 rounded border border-red-900/50">
                            ⚠️ {errorMsg}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-auto bg-slate-950 rounded-lg border border-slate-800 shadow-xl">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-900 text-slate-400 sticky top-0 z-10 shadow-md">
                            <tr>
                                <th className="p-3 border-b border-slate-800 font-medium">Data/Hora</th>
                                <th className="p-3 border-b border-slate-800 font-medium">Nível</th>
                                <th className="p-3 border-b border-slate-800 font-medium">Automação</th>
                                <th className="p-3 border-b border-slate-800 font-medium w-1/2">Mensagem</th>
                                <th className="p-3 border-b border-slate-800 font-medium">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading && logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 animate-pulse">Carregando logs...</td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Nenhum log encontrado.</td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, index) => (
                                    <tr key={log.id || index} className="hover:bg-slate-900/50 transition-colors group">
                                        <td className="p-3 text-slate-400 whitespace-nowrap font-mono text-xs">
                                            {log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : '-'}
                                        </td>
                                        <td className={`p-3 font-mono text-xs uppercase tracking-wide ${getLevelIcon(log.level)}`}>
                                            {log.level}
                                        </td>
                                        <td className="p-3 font-medium text-blue-300">
                                            {log.automation_name}
                                        </td>
                                        <td className="p-3 text-slate-300">
                                            {log.message}
                                        </td>
                                        <td className="p-3 text-slate-500 font-mono text-xs truncate max-w-xs group-hover:whitespace-normal group-hover:break-words group-hover:max-w-none">
                                            {log.details ? JSON.stringify(log.details) : ''}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
