import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User, Loader2, ChevronRight } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const SUGGESTIONS = [
    "Qual máquina gastou mais combustível?",
    "Resumo financeiro da semana",
    "Status da Escavadeira CAT 320",
    "Criar ordem de serviço para o Trator D6"
];

const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Olá! Sou a **TerraPro AI**. Como posso ajudar na gestão da sua frota hoje?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInput('');
        setIsTyping(true);

        // Mock AI Response (placeholder for real GenAI integration)
        setTimeout(() => {
            let response = "Entendi. Estou analisando os dados do ERP para você...";

            if (text.toLowerCase().includes('combustível')) {
                response = "Com base nos registros recentes, a **Escavadeira Volvo (EC200)** teve o maior consumo hoje: **145 Litros**. Isso é 15% acima da média. Recomendo verificar o sistema de injeção.";
            } else if (text.toLowerCase().includes('financeiro') || text.toLowerCase().includes('resumo')) {
                response = "Resumo Financeiro Semanal: \n- **Receitas:** R$ 125.000,00 \n- **Despesas:** R$ 45.300,00 \n- **Saldo:** R$ 79.700,00 (Positivo). \n\nExistem 3 boletos vencendo amanhã.";
            } else if (text.toLowerCase().includes('cat 320')) {
                response = "A **Escavadeira CAT 320 (EXC-042)** está operando normalmente na Rodovia BR-163. \n- Horímetro: 12.450h \n- Próxima Revisão: Em 50h.";
            } else if (text.toLowerCase().includes('risco') || text.toLowerCase().includes('análise') || text.toLowerCase().includes('auditoria') || text.toLowerCase().includes('revise')) {
                response = `🔎 **Relatório de Análise de Riscos & Compliance**

🚨 **Riscos Operacionais (Críticos):**
1. **Trator JD 7200 (OS-8821):** Parado aguardando peças (Radiador). Custo diário estimado de ociosidade: R$ 2.500,00.
2. **Estoque Crítico:** Pneu 295/80 R22.5 abaixo do mínimo (2 un). Risco de parada de caminhões.
3. **Escavadeira Volvo (EXC-045):** Eficiência registrando 0% (Manutenção Corretiva).

💸 **Riscos Financeiros:**
1. **Fatura em Atraso (FAT-003):** R$ 8.200,00 (Prefeitura Dourados). Vencida em 30/01. Ação recomendada: Cobrança imediata.
2. **HE Excessiva:** Colaborador João da Silva com 10h extras em 31/01. Risco de passivo trabalhista.

⚠️ **Conformidade RH:**
- Registro de ponto inconsistente (Falta não justificada) em 30/01.`;
            }

            const newAiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newAiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Exanded Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[380px] h-[600px] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-700 bg-slate-950 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Bot className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-white text-sm">TerraPro AI</h3>
                                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                    Online
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

                    {/* Messages Area */}
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
                                    {msg.content.split('\n').map((line, i) => (
                                        <p key={i} className={line.startsWith('-') ? 'ml-2' : ''}>{line}</p>
                                    ))}
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
                                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions - Only show if new conversation */}
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

                    {/* Input Area */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800">
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 focus-within:border-indigo-500 transition-colors">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pergunte algo sobre sua operação..."
                                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none px-2"
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
