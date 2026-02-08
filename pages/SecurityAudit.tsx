
import React, { useState, useEffect } from 'react';
import { Shield, Eye, Clock, Activity, AlertTriangle, Monitor, Download, Search, X } from 'lucide-react';
import { dashboardService } from '../services/api';
import { AuditLogEntry, NetworkSession } from '../types';

const SecurityAudit: React.FC = () => {
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [activeSessions, setActiveSessions] = useState<NetworkSession[]>([]);
    const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const logs = await dashboardService.getAuditLogs();
        const sessions = await dashboardService.getActiveSessions();
        setAuditLogs(logs);
        setActiveSessions(sessions);
    };

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Shield className="text-emerald-500" size={32} />
                        Segurança e Auditoria
                    </h2>
                    <p className="text-slate-500 mt-1">Monitoramento de atividades de usuários e segurança da informação.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/30 border border-emerald-500/20 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-emerald-500 text-xs font-bold uppercase">Sistema Seguro</span>
                    </div>
                </div>
            </div>

            {/* Live Monitoring Grid */}
            <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={16} /> Monitoramento em Tempo Real ({activeSessions.length} Online)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSessions.map(session => (
                        <div key={session.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:border-blue-500/50 transition-all">
                            <div className="relative h-40 bg-slate-950 flex items-center justify-center border-b border-slate-800">
                                {session.thumbnailUrl ? (
                                    <img src={session.thumbnailUrl} alt="Screen Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <Monitor size={48} className="text-slate-700" />
                                )}
                                <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur rounded text-[10px] font-bold text-white border border-white/10 uppercase">
                                    {session.status}
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{session.userName}</h4>
                                        <p className="text-xs text-slate-500">{session.device}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 font-mono">{session.ipAddress}</p>
                                        <p className="text-[10px] text-blue-500 font-bold">{session.lastActive}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
                                    <Eye size={14} className="text-slate-500" />
                                    <p className="text-xs text-slate-400">Vendo: <span className="text-white font-bold">{session.currentScreen}</span></p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock size={20} className="text-blue-500" />
                        Registro de Auditoria (Logs)
                    </h3>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 w-64">
                            <Search size={16} className="text-slate-500" />
                            <input placeholder="Buscar logs..." className="bg-transparent text-sm text-white placeholder:text-slate-600 outline-none w-full" />
                        </div>
                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                            <Download size={16} /> Exportar Logs
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950 text-xs uppercase font-black text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Data / Hora</th>
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4">Ação</th>
                                <th className="px-6 py-4">Recurso</th>
                                <th className="px-6 py-4">Detalhes da Alteração</th>
                                <th className="px-6 py-4">IP Origem</th>
                                <th className="px-6 py-4 text-right">Evidência</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {auditLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors text-sm group">
                                    <td className="px-6 py-4 font-mono text-slate-400">{log.timestamp}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                                                {log.userName.charAt(0)}
                                            </div>
                                            <span className="text-white font-bold">{log.userName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${log.action === 'DELETE' ? 'bg-red-500/10 text-red-500' :
                                                log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-slate-700 text-slate-300'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 font-medium">{log.resource}</td>
                                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate" title={log.details}>{log.details}</td>
                                    <td className="px-6 py-4 font-mono text-slate-500 text-xs">{log.ipAddress}</td>
                                    <td className="px-6 py-4 text-right">
                                        {log.screenshotUrl && (
                                            <button
                                                onClick={() => setSelectedScreenshot(log.screenshotUrl!)}
                                                className="text-blue-500 hover:text-white flex items-center justify-end gap-1 ml-auto text-xs font-bold transition-colors"
                                            >
                                                <Eye size={14} /> Ver Tela
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Screenshot Modal */}
            {selectedScreenshot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8" onClick={() => setSelectedScreenshot(null)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Eye size={18} className="text-blue-500" />
                                Evidência Visual da Ação
                            </h3>
                            <button onClick={() => setSelectedScreenshot(null)} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-1 bg-slate-950">
                            <img src={selectedScreenshot} className="w-full h-auto rounded-lg border border-slate-800" alt="Evidence" />
                        </div>
                        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
                            <p className="text-xs text-slate-500">Captura de tela realizada automaticamente no momento do clique.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityAudit;
