
import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, CheckCircle2, Zap, AlertTriangle, ScanLine, Smartphone, Send, Plus, Settings2, Bell, RefreshCw, Trash2, Globe, Server, RotateCw } from 'lucide-react';
import Modal from '../components/Modal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { evolutionService } from '../services/evolutionService';

// Interfaces
interface WhatsAppGroup {
    id: string;
    name: string;
    members_count: number;
    is_active: boolean;
}

interface WhatsAppMessage {
    id: string;
    sender_name: string;
    sender_phone?: string;
    content: string;
    received_at: string;
    ai_intent?: string;
    ai_asset?: string;
    ai_urgency?: string;
    ai_action?: string;
    status: 'PENDING' | 'PROCESSED' | 'IGNORED';
    group_id?: string;
    group_name?: string;
}

interface WhatsAppRule {
    id: string;
    name: string;
    trigger_condition: string;
    action_description: string;
    is_active: boolean;
}

interface WhatsAppCampaign {
    id: string;
    name: string;
    target_audience: string;
    status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT';
    sent_count: number;
    total_count: number;
}

const WhatsAppAutomation: React.FC = () => {
    const [status, setStatus] = useState<'DISCONNECTED' | 'CONNECTED' | 'Connecting'>('DISCONNECTED');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'STREAM' | 'CAMPAIGNS' | 'RULES'>('STREAM');
    const [showApiInfo, setShowApiInfo] = useState(false);
    const [connectionLog, setConnectionLog] = useState<string[]>([]);
    const [connectingStartTime, setConnectingStartTime] = useState<number | null>(null);

    // Modais
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

    // Forms
    const [campaignForm, setCampaignForm] = useState({ name: '', target: 'ALL_CLIENTS', message: '' });
    const [ruleForm, setRuleForm] = useState({ name: '', trigger: '', action: '' });

    // Helper para adicionar log
    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setConnectionLog(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
        console.log(message);
    };

    // --- Connection Logic with Evolution API ---

    const checkConnection = async () => {
        try {
            const state = await evolutionService.getConnectionState();

            if (state === 'open') {
                setStatus('CONNECTED');
                setQrCode(null);
                setConnectingStartTime(null);
                updateSystemStatus('CONNECTED');
                addLog('✅ WhatsApp conectado com sucesso!');
            } else if (state === 'connecting') {
                setStatus('Connecting');

                // Detectar se está travado há muito tempo
                if (!connectingStartTime) {
                    setConnectingStartTime(Date.now());
                } else {
                    const elapsed = Date.now() - connectingStartTime;
                    if (elapsed > 45000) { // 45 segundos
                        addLog('⚠️ Conexão travada há mais de 45s. Use o botão "Reset Forçado".');
                    }
                }

                // Tentar buscar QR Code se estiver conectando
                fetchQrCode();
            } else {
                setStatus('DISCONNECTED');
                setConnectingStartTime(null);
                updateSystemStatus('DISCONNECTED');
            }
        } catch (error) {
            console.error("API Error", error);
            setStatus('DISCONNECTED');
            addLog('❌ Erro ao verificar conexão');
        }
    };

    // Check on load and every 10s
    useEffect(() => {
        checkConnection();
        const interval = setInterval(checkConnection, 10000);
        return () => clearInterval(interval);
    }, [connectingStartTime]);

    const fetchQrCode = async () => {
        try {
            const data = await evolutionService.connectInstance();

            if (data && (data.base64 || data.qrcode?.base64)) {
                setQrCode(data.base64 || data.qrcode.base64);
                addLog('📱 QR Code gerado! Escaneie agora.');
            } else if (data?.count === 0) {
                // Silencioso - não loga toda vez
            }
        } catch (e) {
            console.error("Erro ao buscar QR:", e);
        }
    };

    const handleConnect = async () => {
        setStatus('Connecting');
        setConnectingStartTime(Date.now());
        addLog('🔄 Iniciando conexão...');

        try {
            // 1. Tenta criar (se ja existir, ignora erro ou retorna dados)
            try {
                await evolutionService.createInstance();
                addLog('✅ Instância criada');
            } catch (e) {
                addLog('ℹ️ Instância já existe, conectando...');
            }

            // 2. Loop de tentativas para pegar o QR Code (max 5x)
            let attempts = 0;
            const tryGetQr = async () => {
                attempts++;
                addLog(`🔍 Tentativa ${attempts}/5 de obter QR Code...`);
                const data = await evolutionService.connectInstance();

                if (data && (data.base64 || data.qrcode?.base64)) {
                    setQrCode(data.base64 || data.qrcode.base64);
                    addLog('✅ QR Code obtido!');
                } else {
                    if (attempts < 5) {
                        setTimeout(tryGetQr, 2000);
                    } else {
                        addLog('❌ Não foi possível obter QR Code após 5 tentativas');
                        setStatus('DISCONNECTED');
                    }
                }
            };

            tryGetQr();

        } catch (error) {
            addLog('❌ Erro ao conectar. Verifique se o Docker está rodando.');
            setStatus('DISCONNECTED');
        }
    };

    const handleForceReset = async () => {
        if (!confirm('⚠️ Isso vai deletar e recriar a instância do zero. Continuar?')) return;

        setStatus('Connecting');
        setQrCode(null);
        setConnectingStartTime(Date.now());
        addLog('🔄 RESET FORÇADO iniciado...');

        try {
            const result = await evolutionService.resetInstance();

            if (result && (result.base64 || result.qrcode?.base64)) {
                setQrCode(result.base64 || result.qrcode.base64);
                addLog('✅ Reset concluído! QR Code gerado.');
            } else {
                addLog('⚠️ Reset concluído, mas QR Code não foi gerado imediatamente. Aguarde...');
                // Tentar buscar QR Code após alguns segundos
                setTimeout(() => fetchQrCode(), 3000);
            }
        } catch (error) {
            addLog('❌ Erro no reset forçado');
            setStatus('DISCONNECTED');
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Desconectar o WhatsApp?")) return;
        addLog('🔌 Desconectando...');
        await evolutionService.logoutInstance();
        setStatus('DISCONNECTED');
        setQrCode(null);
        setConnectingStartTime(null);
        updateSystemStatus('DISCONNECTED');
        addLog('✅ Desconectado');
    };

    const updateSystemStatus = async (newStatus: 'CONNECTED' | 'DISCONNECTED') => {
        await supabase.from('system_integrations').upsert({
            service_name: 'WHATSAPP',
            status: newStatus,
            connected_at: newStatus === 'CONNECTED' ? new Date().toISOString() : null
        }, { onConflict: 'service_name' });
    };

    // --- Existing Logic ---

    const { data: groups = [], refetch: refetchGroups } = useQuery({
        queryKey: ['whatsapp_groups'],
        queryFn: async () => {
            const { data } = await supabase.from('whatsapp_groups').select('*').order('name');
            return data as WhatsAppGroup[] || [];
        }
    });

    const { data: messages = [], refetch: refetchMessages } = useQuery({
        queryKey: ['whatsapp_messages'],
        queryFn: async () => {
            const { data } = await supabase
                .from('whatsapp_messages')
                .select('*')
                .order('received_at', { ascending: false })
                .limit(20);
            return data as WhatsAppMessage[] || [];
        },
        refetchInterval: 5000
    });

    const { data: rules = [], refetch: refetchRules } = useQuery({
        queryKey: ['whatsapp_rules'],
        queryFn: async () => {
            const { data } = await supabase.from('whatsapp_rules').select('*').order('created_at');
            return data as WhatsAppRule[] || [];
        }
    });

    const { data: campaigns = [], refetch: refetchCampaigns } = useQuery({
        queryKey: ['whatsapp_campaigns'],
        queryFn: async () => {
            const { data } = await supabase.from('whatsapp_campaigns').select('*').order('created_at', { ascending: false });
            return data as WhatsAppCampaign[] || [];
        }
    });

    // --- Actions ---

    const handleCreateRule = async () => {
        if (!ruleForm.name || !ruleForm.trigger) return alert("Preencha Nome e Gatilho");
        await supabase.from('whatsapp_rules').insert({
            name: ruleForm.name,
            trigger_condition: ruleForm.trigger,
            action_description: ruleForm.action,
            is_active: true
        });
        setRuleForm({ name: '', trigger: '', action: '' }); // Reset
        setIsRuleModalOpen(false);
        refetchRules();
    };

    const handleToggleRule = async (id: string, currentStatus: boolean) => {
        await supabase.from('whatsapp_rules').update({ is_active: !currentStatus }).eq('id', id);
        refetchRules();
    };

    const handleDeleteRule = async (id: string) => {
        if (!confirm("Excluir regra?")) return;
        await supabase.from('whatsapp_rules').delete().eq('id', id);
        refetchRules();
    };

    const handleCreateCampaign = async () => {
        if (!campaignForm.name || !campaignForm.message) return alert("Preencha Nome e Mensagem");

        await supabase.from('whatsapp_campaigns').insert({
            name: campaignForm.name,
            target_audience: campaignForm.target,
            message_content: campaignForm.message,
            status: 'SCHEDULED',
            sent_count: 0,
            total_count: 0
        });

        setCampaignForm({ name: '', target: 'ALL_CLIENTS', message: '' });
        setIsCampaignModalOpen(false);
        refetchCampaigns();
        alert("Campanha criada! Clique em Enviar para disparar.");
    };

    // --- Webhook ---
    const handleConfigureWebhook = async () => {
        try {
            const webhookUrl = `https://xpufmosdhhemcubzswcv.supabase.co/functions/v1/whatsapp-webhook`;
            await evolutionService.setWebhook(webhookUrl);
            addLog('✅ Webhook configurado! Mensagens reais vão aparecer no Stream.');
        } catch (error) {
            addLog('❌ Erro ao configurar webhook. Verifique a conexão.');
        }
    };

    // --- Approve / Ignore messages ---
    const handleApproveMessage = async (id: string, action?: string) => {
        await supabase.from('whatsapp_messages').update({ status: 'PROCESSED' }).eq('id', id);
        refetchMessages();
    };

    const handleIgnoreMessage = async (id: string) => {
        await supabase.from('whatsapp_messages').update({ status: 'IGNORED' }).eq('id', id);
        refetchMessages();
    };

    // --- Execute Campaign ---
    const handleExecuteCampaign = async (campaignId: string) => {
        if (!confirm('Iniciar envio da campanha? As mensagens serão enviadas para todos os contatos do público-alvo.')) return;
        try {
            const { data, error } = await supabase.functions.invoke('whatsapp-campaign', {
                body: { action: 'execute', campaign_id: campaignId }
            });
            if (error) {
                alert('Erro ao executar campanha: ' + error.message);
            } else if (data?.success) {
                alert(`Campanha concluída! ${data.sent} enviados, ${data.failed} falharam.`);
            } else {
                alert('Erro: ' + (data?.error || 'Desconhecido'));
            }
            refetchCampaigns();
        } catch (err) {
            alert('Erro ao executar campanha');
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto custom-scrollbar pb-24">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Automação WhatsApp & AI</h2>
                    <p className="text-slate-500 mt-1">Status da API Local: <span className="font-mono text-emerald-500">http://localhost:8080</span></p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => checkConnection()}
                        className="text-slate-500 hover:text-white p-2"
                        title="Verificar Conexão Manualmente"
                    >
                        <RotateCw size={18} />
                    </button>

                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${status === 'CONNECTED'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : status === 'Connecting' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-xs font-black uppercase tracking-widest">
                            {status === 'CONNECTED' ? 'Robô Online' : status === 'Connecting' ? 'Conectando...' : 'Robô Offline'}
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
                                    <p className="text-slate-500 text-sm mt-2">Instância: <span className="font-mono text-emerald-500">terrapro_bot</span></p>
                                    <div className="flex gap-3 mt-6 justify-center">
                                        <button onClick={handleConfigureWebhook} className="text-xs text-blue-400 font-bold hover:text-blue-300 uppercase tracking-widest border border-blue-900/30 px-4 py-2 rounded-lg bg-blue-950/20">
                                            Configurar Webhook
                                        </button>
                                        <button onClick={handleDisconnect} className="text-xs text-red-400 font-bold hover:text-red-300 uppercase tracking-widest border border-red-900/30 px-4 py-2 rounded-lg bg-red-950/20">
                                            Desconectar Robô
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    {qrCode ? (
                                        <div className="bg-white p-2 mx-auto w-fit rounded-xl mb-4">
                                            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                        </div>
                                    ) : (
                                        <div className="bg-white p-4 w-48 h-48 mx-auto rounded-xl flex items-center justify-center">
                                            <ScanLine size={40} className="text-slate-600" />
                                        </div>
                                    )}

                                    <p className="text-slate-400 text-sm mt-4 font-bold">
                                        {qrCode ? "Escaneie agora com seu celular!" : "O robô está desconectado."}
                                    </p>

                                    <div className="flex gap-2 mt-4 justify-center">
                                        {!qrCode && (
                                            <button onClick={handleConnect} className="bg-[#007a33] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#006028] transition-all flex items-center gap-2">
                                                <Zap size={16} /> Gerar QR Code
                                            </button>
                                        )}

                                        {status === 'Connecting' && connectingStartTime && (Date.now() - connectingStartTime > 30000) && (
                                            <button onClick={handleForceReset} className="bg-orange-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-orange-500 transition-all flex items-center gap-2">
                                                <RefreshCw size={16} /> Reset Forçado
                                            </button>
                                        )}
                                    </div>

                                    {/* Painel de Logs */}
                                    {connectionLog.length > 0 && (
                                        <div className="mt-6 bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-48 overflow-y-auto">
                                            <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Log de Conexão</h5>
                                            <div className="space-y-1 text-left">
                                                {connectionLog.map((log, idx) => (
                                                    <p key={idx} className="text-xs font-mono text-slate-400">{log}</p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Grupos Monitorados</h3>
                                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md font-bold">{groups.filter(g => g.is_active).length} Ativos</span>
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
                                                <p className="text-[10px] text-slate-500">{group.members_count} membros</p>
                                            </div>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${group.is_active ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                                    </div>
                                ))}
                                {groups.length === 0 && <p className="text-slate-500 text-sm italic">Nenhum grupo encontrado.</p>}
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
                                {messages.length === 0 && (
                                    <div className="text-center py-20 text-slate-500">
                                        <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>Aguardando novas mensagens...</p>
                                    </div>
                                )}
                                {messages.map((msg) => (
                                    <div key={msg.id} className="relative pl-8 before:absolute before:left-3.5 before:top-0 before:bottom-0 before:w-px before:bg-slate-800 last:before:bottom-auto last:before:h-full">
                                        <div className="absolute left-0 top-0 w-7 h-7 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center">
                                            <MessageSquare size={14} className="text-slate-500" />
                                        </div>

                                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">Novo</span>
                                                    <span className="text-xs font-bold text-slate-400">{new Date(msg.received_at).toLocaleTimeString().slice(0, 5)}</span>
                                                </div>
                                                {/* Se tivermos linkado group_id futuramente, exibimos nome do grupo */}
                                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Grupo Monitorado</span>
                                            </div>

                                            <div className="flex gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 uppercase">
                                                    {msg.sender_name?.charAt(0) || '?'}
                                                </div>
                                                <div className="bg-slate-900 p-3 rounded-xl rounded-tl-none border border-slate-800/50 w-full">
                                                    <p className="text-sm font-bold text-slate-400 mb-1">{msg.sender_name}</p>
                                                    <p className="text-sm text-slate-300 italic">"{msg.content}"</p>
                                                </div>
                                            </div>

                                            {/* AI Analysis Block - Only shows if AI data exists */}
                                            {(msg.ai_intent || msg.ai_asset) && (
                                                <div className="bg-[#007a33]/10 border border-[#007a33]/20 rounded-xl p-4 ml-11">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Zap size={14} className="text-[#007a33]" />
                                                        <span className="text-xs font-black text-[#007a33] uppercase tracking-widest">Análise da IA</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-[10px] uppercase text-slate-500 font-bold">Intenção Detectada</p>
                                                            <p className="text-sm font-bold text-white">{msg.ai_intent || 'Desconhecida'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase text-slate-500 font-bold">Alvo / Ativo</p>
                                                            <p className="text-sm font-bold text-white">{msg.ai_asset || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase text-slate-500 font-bold">Urgência</p>
                                                            <p className={`text-sm font-bold ${msg.ai_urgency === 'HIGH' ? 'text-red-400' : msg.ai_urgency === 'MEDIUM' ? 'text-amber-400' : 'text-slate-300'}`}>
                                                                {msg.ai_urgency || '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {msg.status === 'PENDING' && (
                                                        <div className="flex gap-3 mt-4 pt-4 border-t border-[#007a33]/20">
                                                            <button onClick={() => handleApproveMessage(msg.id, msg.ai_action)} className="flex-1 bg-[#007a33] text-white py-2 rounded-lg text-xs font-bold uppercase hover:bg-[#006028] transition-colors">
                                                                Aprovar: {msg.ai_action || 'Processar'}
                                                            </button>
                                                            <button onClick={() => handleIgnoreMessage(msg.id)} className="px-4 bg-slate-800 text-slate-400 py-2 rounded-lg text-xs font-bold uppercase hover:text-white hover:bg-slate-700 transition-colors">
                                                                Ignorar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
                        <button
                            onClick={() => setIsRuleModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                        >
                            <Plus size={18} /> Nova Regra
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rules.map(rule => (
                            <div key={rule.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/50 transition-colors relative group">
                                <button
                                    onClick={() => handleDeleteRule(rule.id)}
                                    className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition-colors"
                                    title="Excluir Regra"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="mb-4 bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-blue-500"><Zap size={24} /></div>
                                <h4 className="font-bold text-white mb-2">{rule.name}</h4>
                                <div className="space-y-3">
                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Gatilho (Se...)</p>
                                        <p className="text-xs font-bold text-slate-300">{rule.trigger_condition}</p>
                                    </div>
                                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Ação (Então...)</p>
                                        <p className="text-xs font-bold text-slate-300">{rule.action_description}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${rule.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-700/50 text-slate-500'}`}>
                                        {rule.is_active ? 'Ativa' : 'Inativa'}
                                    </span>
                                    <div
                                        onClick={() => handleToggleRule(rule.id, rule.is_active)}
                                        className="w-10 h-5 bg-slate-700 rounded-full relative cursor-pointer"
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0 transition-all ${rule.is_active ? 'right-0 bg-emerald-500' : 'left-0'}`}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {rules.length === 0 && <p className="text-slate-500 col-span-3 text-center italic">Nenhuma regra ativa.</p>}
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
                                        <td className="px-8 py-5 text-slate-400">{cp.target_audience}</td>
                                        <td className="px-8 py-5 text-center font-mono">
                                            {cp.sent_count} <span className="text-slate-600">/ {cp.total_count || '-'}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                cp.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500' :
                                                cp.status === 'SENDING' ? 'bg-blue-500/10 text-blue-500 animate-pulse' :
                                                'bg-amber-500/10 text-amber-500'
                                            }`}>
                                                {cp.status === 'SENT' ? 'Enviado' : cp.status === 'SENDING' ? 'Enviando...' : 'Agendado'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {cp.status === 'SCHEDULED' ? (
                                                <button onClick={() => handleExecuteCampaign(cp.id)} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 ml-auto" title="Enviar Campanha">
                                                    <Send size={16} /> <span className="text-xs font-bold">Enviar</span>
                                                </button>
                                            ) : (
                                                <button onClick={() => refetchCampaigns()} className="text-slate-400 hover:text-white"><RefreshCw size={16} /></button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {campaigns.length === 0 && (
                                    <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-500 italic">Nenhuma campanha criada.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Nova Campanha */}
            <Modal isOpen={isCampaignModalOpen} onClose={() => setIsCampaignModalOpen(false)} title="Nova Campanha de WhatsApp">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome da Campanha</label>
                        <input
                            value={campaignForm.name}
                            onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })}
                            placeholder="Ex: Aviso de Férias Coletivas"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Público Alvo (Lista)</label>
                        <select
                            value={campaignForm.target}
                            onChange={e => setCampaignForm({ ...campaignForm, target: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                        >
                            <option value="ALL_CLIENTS">Todos os Clientes</option>
                            <option value="SUPPLIERS">Fornecedores Ativos</option>
                            <option value="EMPLOYEES">Colaboradores (RH)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Mensagem</label>
                        <textarea
                            value={campaignForm.message}
                            onChange={e => setCampaignForm({ ...campaignForm, message: e.target.value })}
                            placeholder="Digite sua mensagem aqui..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none h-32 resize-none"
                        />
                    </div>
                    <button
                        onClick={handleCreateCampaign}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-2"
                    >
                        <Send size={18} /> Disparar Agora
                    </button>
                </div>
            </Modal>

            {/* Modal Nova Regra */}
            <Modal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)} title="Nova Regra Automática">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome da Regra</label>
                        <input
                            value={ruleForm.name}
                            onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })}
                            placeholder="Ex: Auto-resposta Boleto"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Gatilho (Quando acontecer...)</label>
                        <input
                            value={ruleForm.trigger}
                            onChange={e => setRuleForm({ ...ruleForm, trigger: e.target.value })}
                            placeholder="Ex: Mensagem contém 'preço'"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Ação (Fazer isso...)</label>
                        <input
                            value={ruleForm.action}
                            onChange={e => setRuleForm({ ...ruleForm, action: e.target.value })}
                            placeholder="Ex: Enviar tabela de preços PDF"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={handleCreateRule}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-2"
                    >
                        <Plus size={18} /> Criar Regra
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default WhatsAppAutomation;
