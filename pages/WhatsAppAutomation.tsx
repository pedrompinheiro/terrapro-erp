
import React, { useState } from 'react';
import { MessageSquare, Users, CheckCircle2, Zap, AlertTriangle, ScanLine, Smartphone, Send, Plus, Settings2, Bell, RefreshCw } from 'lucide-react';
import Modal from '../components/Modal';

const WhatsAppAutomation: React.FC = () => {
    const [status, setStatus] = useState<'DISCONNECTED' | 'CONNECTED'>('CONNECTED');
    const [activeTab, setActiveTab] = useState<'STREAM' | 'CAMPAIGNS' | 'RULES'>('STREAM');
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

    // Mock Data for demonstration
    const groups = [
        { id: 1, name: '🚜 Manutenção Campo', members: 14, active: true },
        { id: 2, name: '💰 Financeiro Urgente', members: 5, active: true },
        { id: 3, name: '🚛 Logística Dourados', members: 8, active: false },
    ];

    const messageLog = [
        {
            id: 101,
            group: 'Manutenção Campo',
            user: 'João Mecânico',
            time: '10:42',
            text: 'A escavadeira 04 quebrou a mangueira hidráulica no setor B, preciso de uma urgente.',
            aiAnalysis: {
                intent: 'MAINTENANCE_REQUEST',
                asset: 'Escavadeira 04 (EXC-04)',
                urgency: 'HIGH',
                action: 'Criar O.S. Corretiva'
            },
            status: 'PROCESSED'
        },
        {
            id: 102,
            group: 'Financeiro Urgente',
            user: 'Maria Compras',
            time: '10:45',
            text: 'NF-e 4590 da Peças & Cia chegou para pagamento hoje.',
            aiAnalysis: {
                intent: 'PAYMENT_ALERT',
                document: 'NF-e 4590',
                urgency: 'MEDIUM',
                action: 'Agendar Pagamento'
            },
            status: 'PENDING'
        }
    ];

    const rules = [
        { id: 1, name: 'Auto-Responder Boleto', trigger: 'Mensagem contém "Boleto"', action: 'Enviar Link do Portal', active: true },
        { id: 2, name: 'Alerta de Parada', trigger: 'Sistema detecta falha > 30min', action: 'Notificar Grupo Manutenção', active: true },
        { id: 3, name: 'Lembrete Vencimento', trigger: '2 dias antes do vencimento', action: 'Enviar msg p/ Cliente', active: false },
    ];

    const campaigns = [
        { id: 1, name: 'Promoção Peças Agrícolas', target: 'Lista Clientes VIP', status: 'SENT', sent: 150, opened: 120 },
        { id: 2, name: 'Aviso Feriado', target: 'Todos Clientes', status: 'SCHEDULED', sent: 0, opened: 0 },
    ];

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Automação WhatsApp & AI</h2>
                    <p className="text-slate-500 mt-1">Monitore grupos, crie regras e envie campanhas em massa.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${status === 'CONNECTED'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-xs font-black uppercase tracking-widest">
                            {status === 'CONNECTED' ? 'Sistema Online' : 'Desconectado'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-slate-900 p-1 rounded-xl inline-flex border border-slate-800">
                <button onClick={() => setActiveTab('STREAM')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'STREAM' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Stream IA</button>
                <button onClick={() => setActiveTab('RULES')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'RULES' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Regras Automáticas</button>
                <button onClick={() => setActiveTab('CAMPAIGNS')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'CAMPAIGNS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Campanhas em Massa</button>
            </div>

            {activeTab === 'STREAM' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-left-4">
                    {/* Left Column: Connection & Groups */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Smartphone size={120} className="text-white" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Status da Conexão</h3>

                            {status === 'CONNECTED' ? (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500">
                                        <CheckCircle2 size={40} className="text-emerald-500" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white">WhatsApp Conectado</h4>
                                    <p className="text-slate-500 text-sm mt-2">Sincronizado com número <span className="text-emerald-500 font-mono">(67) 999xx-xxxx</span></p>
                                    <button onClick={() => setStatus('DISCONNECTED')} className="mt-6 text-xs text-red-400 font-bold hover:text-red-300 uppercase tracking-widest border border-red-900/30 px-4 py-2 rounded-lg bg-red-950/20">
                                        Desconectar
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="bg-white p-4 w-48 h-48 mx-auto rounded-xl">
                                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                            <ScanLine size={40} className="text-slate-600 animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-sm mt-4 font-bold">Escaneie o QR Code para conectar</p>
                                    <button onClick={() => setStatus('CONNECTED')} className="mt-4 bg-[#007a33] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#006028] transition-all">
                                        Simular Conexão
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Grupos Monitorados</h3>
                                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md font-bold">3 Ativos</span>
                            </div>
                            <div className="space-y-3">
                                {groups.map(group => (
                                    <div key={group.id} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-800 p-2 rounded-full">
                                                <Users size={16} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{group.name}</p>
                                                <p className="text-[10px] text-slate-500">{group.members} membros</p>
                                            </div>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${group.active ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI Stream */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl h-[600px] flex flex-col">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                                <div className="flex items-center gap-3">
                                    <Zap size={20} className="text-amber-400 fill-amber-400" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Stream de Inteligência</h3>
                                </div>
                                <div className="flex gap-2">
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-emerald-500">Ouvindo em tempo real...</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {messageLog.map((log) => (
                                    <div key={log.id} className="relative pl-8 before:absolute before:left-3.5 before:top-0 before:bottom-0 before:w-px before:bg-slate-800 last:before:bottom-auto last:before:h-full">
                                        <div className="absolute left-0 top-0 w-7 h-7 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center">
                                            <MessageSquare size={14} className="text-slate-500" />
                                        </div>

                                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">Novo</span>
                                                    <span className="text-xs font-bold text-slate-400">{log.time}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{log.group}</span>
                                            </div>

                                            <div className="flex gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                                                    {log.user.charAt(0)}
                                                </div>
                                                <div className="bg-slate-900 p-3 rounded-xl rounded-tl-none border border-slate-800/50">
                                                    <p className="text-sm text-slate-300 italic">"{log.text}"</p>
                                                </div>
                                            </div>

                                            <div className="bg-[#007a33]/10 border border-[#007a33]/20 rounded-xl p-4 ml-11">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Zap size={14} className="text-[#007a33]" />
                                                    <span className="text-xs font-black text-[#007a33] uppercase tracking-widest">Análise da IA</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-[10px] uppercase text-slate-500 font-bold">Intenção Detectada</p>
                                                        <p className="text-sm font-bold text-white">{log.aiAnalysis.intent}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase text-slate-500 font-bold">Alvo / Ativo</p>
                                                        <p className="text-sm font-bold text-white">{log.aiAnalysis.asset || log.aiAnalysis.document}</p>
                                                    </div>
                                                </div>
                                                {log.status === 'PENDING' && (
                                                    <div className="flex gap-3 mt-4 pt-4 border-t border-[#007a33]/20">
                                                        <button className="flex-1 bg-[#007a33] text-white py-2 rounded-lg text-xs font-bold uppercase hover:bg-[#006028] transition-colors">
                                                            Aprovar: {log.aiAnalysis.action}
                                                        </button>
                                                        <button className="px-4 bg-slate-800 text-slate-400 py-2 rounded-lg text-xs font-bold uppercase hover:text-white hover:bg-slate-700 transition-colors">
                                                            Ignorar
                                                        </button>
                                                    </div>
                                                )}
                                                {log.status === 'PROCESSED' && (
                                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#007a33]/20 text-[#007a33]">
                                                        <CheckCircle2 size={16} />
                                                        <span className="text-xs font-bold uppercase tracking-wide">Tarefa Criada Automáticamente</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'RULES' && (
                <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-right-4">
                    <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                        <div>
                            <h3 className="text-lg font-bold text-white">Regras de Resposta Automática</h3>
                            <p className="text-slate-500 text-sm">Configure gatilhos para que o robô responda sozinho.</p>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                            <Plus size={18} /> Nova Regra
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rules.map(rule => (
                            <div key={rule.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/50 transition-colors relative group">
                                <div className="absolute top-4 right-4 text-slate-600 group-hover:text-blue-500"><Settings2 size={18} /></div>
                                <div className="mb-4 bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-blue-500"><Zap size={24} /></div>
                                <h4 className="font-bold text-white mb-2">{rule.name}</h4>
                                <div className="space-y-3">
                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Gatilho (Se...)</p>
                                        <p className="text-xs font-bold text-slate-300">{rule.trigger}</p>
                                    </div>
                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Ação (Então...)</p>
                                        <p className="text-xs font-bold text-slate-300">{rule.action}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${rule.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-700/50 text-slate-500'}`}>
                                        {rule.active ? 'Ativa' : 'Inativa'}
                                    </span>
                                    <div className="w-10 h-5 bg-slate-700 rounded-full relative cursor-pointer">
                                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0 transition-all ${rule.active ? 'right-0 bg-emerald-500' : 'left-0'}`}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'CAMPAIGNS' && (
                <div className="animate-in slide-in-from-right-4 space-y-6">
                    <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                        <div>
                            <h3 className="text-lg font-bold text-white">Disparo em Massa (Campanhas)</h3>
                            <p className="text-slate-500 text-sm">Envie comunicados para grupos de clientes ou fornecedores.</p>
                        </div>
                        <button onClick={() => setIsCampaignModalOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                            <Send size={18} /> Criar Campanha
                        </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">Nome da Campanha</th>
                                    <th className="px-8 py-4">Público Alvo</th>
                                    <th className="px-8 py-4 text-center">Enviados</th>
                                    <th className="px-8 py-4 text-center">Status</th>
                                    <th className="px-8 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {campaigns.map(cp => (
                                    <tr key={cp.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-8 py-5 font-bold text-white">{cp.name}</td>
                                        <td className="px-8 py-5 text-slate-400">{cp.target}</td>
                                        <td className="px-8 py-5 text-center font-mono">
                                            {cp.sent} <span className="text-slate-600">/ {cp.sent + 20}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${cp.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {cp.status === 'SENT' ? 'Enviado' : 'Agendado'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-slate-400 hover:text-white"><RefreshCw size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={isCampaignModalOpen} onClose={() => setIsCampaignModalOpen(false)} title="Nova Campanha de WhatsApp">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome da Campanha</label>
                        <input placeholder="Ex: Aviso de Férias Coletivas" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Público Alvo (Lista)</label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none">
                            <option>Todos os Clientes</option>
                            <option>Fornecedores Ativos</option>
                            <option>Colaboradores (RH)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Mensagem</label>
                        <textarea placeholder="Digite sua mensagem aqui..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none h-32 resize-none" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Anexar Imagem / PDF</span>
                        <button className="text-xs bg-slate-800 text-white px-3 py-1 rounded-lg hover:bg-slate-700">Escolher Arquivo</button>
                    </div>
                    <button onClick={() => setIsCampaignModalOpen(false)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-2">
                        <Send size={18} /> Disparar Agora
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default WhatsAppAutomation;
