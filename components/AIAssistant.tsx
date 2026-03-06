import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Bot, User, Loader2, ChevronRight, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateText, getProviderLabel } from '../lib/aiService';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const SUGGESTIONS = [
    "Qual máquina gastou mais combustível?",
    "Resumo financeiro do mês",
    "Tem Pedro Miranda cadastrado?",
    "Quantos produtos tem no almoxarifado?",
];

// ─── System Prompt ────────────────────────────────────────────
const SYSTEM_PROMPT = `Você é a **TerraPro AI**, assistente inteligente do sistema TerraPro ERP — um ERP de gestão de ativos pesados, frotas, manutenção, estoque e financeiro.

Regras:
- Responda SEMPRE em Português (pt-BR)
- Seja direto, objetivo e profissional
- Use **negrito** para destaques e números importantes
- Use listas quando fizer sentido
- Se não encontrar dados, diga claramente que não há registros
- Não invente dados — use SOMENTE o que está no CONTEXTO abaixo
- Formate valores monetários como R$ X.XXX,XX
- Formate datas no padrão DD/MM/AAAA
- Mantenha respostas concisas (máx 300 palavras)

Você tem acesso aos seguintes módulos do ERP:
- Cadastros (clientes, fornecedores, funcionários)
- Almoxarifado (produtos, estoque, ordens de serviço, compras)
- Equipamentos/Frota (máquinas, veículos)
- Combustível (abastecimentos)
- Financeiro (contas a pagar, contas a receber)
- RH (funcionários, ponto)
`;

// ─── Buscar contexto relevante do Supabase ────────────────────
async function fetchERPContext(question: string): Promise<string> {
    const q = question.toLowerCase();
    const parts: string[] = [];

    try {
        // Detectar intenção e buscar dados relevantes
        const wantsEntity = /cadastr|cliente|fornecedor|parceiro|cnpj|cpf|quem é|tem .*cadastrado|buscar pessoa/i.test(q);
        const wantsInventory = /almox|estoque|produto|peça|item|material|quantidade/i.test(q);
        const wantsFuel = /combustível|abastec|diesel|gasolina|litro|consumo/i.test(q);
        const wantsFinancial = /financ|receber|pagar|fatura|boleto|saldo|receita|despesa|fluxo|dre/i.test(q);
        const wantsEquipment = /máquina|equipamento|frota|escavadeira|trator|caminhão|veículo|horímetro/i.test(q);
        const wantsEmployee = /funcionário|colaborador|empregado|rh|ponto|hora extra|folha/i.test(q);
        const wantsOS = /ordem de serviço|os |manutenção|reparo|parad/i.test(q);
        const wantsSummary = /resumo|visão geral|dashboard|status geral|como está/i.test(q);

        // Se busca uma pessoa/entidade específica
        if (wantsEntity || /quem|tem .*no sistema/i.test(q)) {
            // Extrair possível nome da busca
            const nameMatch = q.match(/(?:tem|buscar?|procur|cadastr|quem é)\s+(?:o |a |um |uma )?(.+?)(?:\s+(?:cadastrado|no sistema|aqui)|\?|$)/i);
            if (nameMatch) {
                const searchName = nameMatch[1].trim();
                const { data } = await supabase
                    .from('entities')
                    .select('id, name, document, email, phone, city, state, is_client, is_supplier, active, legacy_code')
                    .or(`name.ilike.%${searchName}%,social_reason.ilike.%${searchName}%,document.ilike.%${searchName}%`)
                    .limit(10);
                if (data && data.length > 0) {
                    parts.push(`📋 CADASTROS ENCONTRADOS (busca: "${searchName}"):\n${data.map(e =>
                        `- ${e.name} | Cód: ${e.legacy_code || e.id.slice(0, 6)} | Doc: ${e.document || 'N/A'} | ${e.is_client ? 'Cliente' : ''}${e.is_supplier ? 'Fornecedor' : ''} | ${e.city || ''}/${e.state || ''} | Tel: ${e.phone || 'N/A'} | ${e.active ? 'Ativo' : 'INATIVO'}`
                    ).join('\n')}`);
                } else {
                    parts.push(`📋 CADASTROS: Nenhum resultado encontrado para "${searchName}"`);
                }
            } else {
                // Stats gerais de cadastro
                const { count: totalEntities } = await supabase.from('entities').select('id', { count: 'exact', head: true });
                const { count: clients } = await supabase.from('entities').select('id', { count: 'exact', head: true }).eq('is_client', true);
                const { count: suppliers } = await supabase.from('entities').select('id', { count: 'exact', head: true }).eq('is_supplier', true);
                parts.push(`📋 CADASTROS: ${totalEntities || 0} entidades (${clients || 0} clientes, ${suppliers || 0} fornecedores)`);
            }
        }

        if (wantsInventory || wantsSummary) {
            const { count: totalItems } = await supabase.from('inventory_items').select('id', { count: 'exact', head: true });
            const { count: lowStock } = await supabase.from('inventory_items').select('id', { count: 'exact', head: true }).lt('qty_current', 3).eq('active', true).eq('is_product', true);
            const { data: topItems } = await supabase.from('inventory_items').select('description, qty_current, unit, cost_price').eq('active', true).eq('is_product', true).order('cost_price', { ascending: false }).limit(5);
            parts.push(`📦 ALMOXARIFADO: ${totalItems || 0} itens cadastrados | ${lowStock || 0} com estoque baixo (<3 un)`);
            if (topItems?.length) {
                parts.push(`Produtos mais caros: ${topItems.map(i => `${i.description} (${i.qty_current} ${i.unit}, R$ ${(i.cost_price || 0).toFixed(2)})`).join(' | ')}`);
            }
        }

        if (wantsFuel || wantsSummary) {
            const { data: recentFuel } = await supabase
                .from('fuel_records')
                .select('date, liters, total_cost, equipment:equipment_id(name)')
                .order('date', { ascending: false })
                .limit(10);
            if (recentFuel?.length) {
                const totalLiters = recentFuel.reduce((s, r) => s + (r.liters || 0), 0);
                const totalCost = recentFuel.reduce((s, r) => s + (r.total_cost || 0), 0);
                parts.push(`⛽ COMBUSTÍVEL (últimos ${recentFuel.length} abastecimentos): ${totalLiters.toFixed(0)}L | R$ ${totalCost.toFixed(2)}`);
                parts.push(`Detalhes: ${recentFuel.slice(0, 5).map(r => `${r.date} - ${(r.equipment as any)?.name || 'N/I'}: ${r.liters}L (R$ ${(r.total_cost || 0).toFixed(2)})`).join(' | ')}`);
            } else {
                parts.push('⛽ COMBUSTÍVEL: Sem registros recentes');
            }
        }

        if (wantsFinancial || wantsSummary) {
            const { data: receber } = await supabase
                .from('contas_receber')
                .select('valor_total, valor_pago, status')
                .in('status', ['pendente', 'parcial', 'vencido']);
            const { data: pagar } = await supabase
                .from('contas_pagar')
                .select('valor_total, valor_pago, status')
                .in('status', ['pendente', 'parcial', 'vencido']);

            if (receber) {
                const totalReceber = receber.reduce((s, r) => s + ((r.valor_total || 0) - (r.valor_pago || 0)), 0);
                const vencidos = receber.filter(r => r.status === 'vencido');
                parts.push(`💰 A RECEBER: R$ ${totalReceber.toFixed(2)} em aberto (${receber.length} títulos) | ${vencidos.length} vencidos`);
            }
            if (pagar) {
                const totalPagar = pagar.reduce((s, r) => s + ((r.valor_total || 0) - (r.valor_pago || 0)), 0);
                const vencidos = pagar.filter(r => r.status === 'vencido');
                parts.push(`💸 A PAGAR: R$ ${totalPagar.toFixed(2)} em aberto (${pagar.length} títulos) | ${vencidos.length} vencidos`);
            }
        }

        if (wantsEquipment || wantsSummary) {
            const { count: totalEquip } = await supabase.from('equipment').select('id', { count: 'exact', head: true });
            const { data: equips } = await supabase
                .from('equipment')
                .select('name, type, status, brand, model, year, current_hours')
                .order('name')
                .limit(10);
            parts.push(`🚜 EQUIPAMENTOS: ${totalEquip || 0} cadastrados`);
            if (equips?.length) {
                parts.push(`Lista: ${equips.map(e => `${e.name} (${e.brand || ''} ${e.model || ''} ${e.year || ''}) - ${e.status || 'N/I'} - ${e.current_hours || 0}h`).join(' | ')}`);
            }
        }

        if (wantsEmployee) {
            const { count: totalEmp } = await supabase.from('employees').select('id', { count: 'exact', head: true });
            const { data: emps } = await supabase
                .from('employees')
                .select('full_name, job_title, status, department')
                .eq('status', 'active')
                .order('full_name')
                .limit(15);
            parts.push(`👷 FUNCIONÁRIOS: ${totalEmp || 0} cadastrados (${emps?.length || 0} ativos)`);
            if (emps?.length) {
                parts.push(`Ativos: ${emps.map(e => `${e.full_name} - ${e.job_title || 'N/I'}`).join(' | ')}`);
            }
        }

        if (wantsOS) {
            const { data: orders } = await supabase
                .from('service_orders')
                .select('code, description, status, priority, equipment_name, created_at')
                .order('created_at', { ascending: false })
                .limit(10);
            if (orders?.length) {
                parts.push(`🔧 ORDENS DE SERVIÇO (últimas ${orders.length}):`);
                parts.push(orders.map(o => `- ${o.code}: ${o.description?.slice(0, 50) || 'S/D'} | ${o.equipment_name || 'N/I'} | ${o.status} | ${o.priority || 'normal'}`).join('\n'));
            }
        }

        // Se nenhum módulo específico detectado, dar visão geral
        if (parts.length === 0) {
            const { count: ent } = await supabase.from('entities').select('id', { count: 'exact', head: true });
            const { count: inv } = await supabase.from('inventory_items').select('id', { count: 'exact', head: true });
            const { count: equip } = await supabase.from('equipment').select('id', { count: 'exact', head: true });
            const { count: emp } = await supabase.from('employees').select('id', { count: 'exact', head: true });
            parts.push(`📊 VISÃO GERAL DO ERP:`);
            parts.push(`- Cadastros: ${ent || 0} entidades`);
            parts.push(`- Almoxarifado: ${inv || 0} itens`);
            parts.push(`- Equipamentos: ${equip || 0}`);
            parts.push(`- Funcionários: ${emp || 0}`);
        }
    } catch (err) {
        console.error('[TerraPro AI] Erro ao buscar contexto:', err);
        parts.push(`⚠️ Erro ao consultar banco: ${(err as Error).message}`);
    }

    return parts.join('\n\n');
}

// ─── Renderizar markdown simples ─────────────────────────────
function renderMarkdown(text: string) {
    return text.split('\n').map((line, i) => {
        // Bold
        let html = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
        // Bullet list
        const isBullet = line.trimStart().startsWith('- ') || line.trimStart().startsWith('• ');
        return (
            <p
                key={i}
                className={`${isBullet ? 'ml-3 text-slate-300' : ''} ${line.trim() === '' ? 'h-2' : ''}`}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    });
}

// ─── Componente Principal ─────────────────────────────────────
const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Olá! Sou a **TerraPro AI**. Pergunte sobre cadastros, estoque, financeiro, frota ou qualquer dado do ERP!',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [providerName, setProviderName] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Detectar provider no mount
    useEffect(() => {
        getProviderLabel().then(label => setProviderName(label)).catch(() => {});
    }, []);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || isTyping) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // 1. Buscar contexto real do ERP
            const erpContext = await fetchERPContext(text);

            // 2. Montar prompt com contexto
            const prompt = `CONTEXTO DO ERP (dados reais do banco):\n${erpContext}\n\n---\n\nPERGUNTA DO USUÁRIO: ${text}`;

            // 3. Chamar IA real
            const aiResponse = await generateText(prompt, SYSTEM_PROMPT);

            const newAiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse || 'Desculpe, não consegui gerar uma resposta. Tente novamente.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, newAiMsg]);
        } catch (err: any) {
            console.error('[TerraPro AI] Erro:', err);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `⚠️ **Erro ao processar:** ${err.message || 'Erro desconhecido'}\n\nVerifique se a chave de API está configurada em **Configurações > Integrações & API**.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[400px] h-[620px] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Bot className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-white text-sm">TerraPro AI</h3>
                                <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                    {providerName || 'Online'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                    }`}>
                                    {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                                </div>

                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                                    }`}>
                                    {renderMarkdown(msg.content)}
                                    <span className="text-[9px] opacity-50 block mt-1 text-right">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                                    <Loader2 size={14} className="animate-spin" />
                                </div>
                                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                    </div>
                                    <span className="text-[9px] text-slate-500 mt-1 block">Consultando ERP...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length < 3 && !isTyping && (
                        <div className="px-4 pb-2 flex gap-2 overflow-x-auto custom-scrollbar">
                            {SUGGESTIONS.map((sugg, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(sugg)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-[10px] text-slate-300 font-medium transition-colors"
                                >
                                    {sugg}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800">
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 focus-within:border-indigo-500 transition-colors">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pergunte algo sobre sua operação..."
                                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none px-2"
                                disabled={isTyping}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isTyping}
                                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg"
                            >
                                <ChevronRight size={18} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen
                    ? 'bg-slate-800 text-slate-400 rotate-90'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white animate-bounce-slow'
                    }`}
            >
                {isOpen ? <X size={24} /> : <Sparkles size={24} />}
            </button>
        </div>
    );
};

export default AIAssistant;
