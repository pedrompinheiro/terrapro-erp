import React, { useState } from 'react';
import { Lock, Mail, ChevronRight, User, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';

interface RegisterProps {
    onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Falha ao criar conta.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-2xl max-w-md w-full shadow-2xl">
                    <div className="w-16 h-16 bg-[#007a33]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={32} className="text-[#007a33]" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase mb-2">Cadastro Realizado!</h2>
                    <p className="text-slate-400 mb-8">Sua conta foi criada e está <span className="text-amber-400 font-bold">Aguardando Aprovação</span> do administrador. Você será notificado assim que o acesso for liberado.</p>
                    <button
                        onClick={onBackToLogin}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all uppercase tracking-widest"
                    >
                        Voltar para Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorativo igual ao Login */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#007a33]/5 rounded-full blur-[150px] animate-pulse"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-10 rounded-2xl shadow-2xl relative">
                    <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-[#007a33] to-transparent"></div>

                    <div className="mb-8 text-center">
                        <Logo size="lg" className="mx-auto mb-6" />
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Novo Operador</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Solicitação de Acesso ao Sistema</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-[#007a33] transition-colors" size={20} />
                                <input
                                    required
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu Nome"
                                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl py-3.5 pl-14 pr-4 text-white font-bold outline-none focus:border-[#007a33] transition-all placeholder:text-slate-800 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Corporativo</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-[#007a33] transition-colors" size={20} />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nome@terrapro.com.br"
                                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl py-3.5 pl-14 pr-4 text-white font-bold outline-none focus:border-[#007a33] transition-all placeholder:text-slate-800 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Criar Senha</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-[#007a33] transition-colors" size={20} />
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl py-3.5 pl-14 pr-4 text-white font-bold outline-none focus:border-[#007a33] transition-all placeholder:text-slate-800 shadow-inner"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-[#007a33] hover:bg-[#009a43] text-white font-black py-4 rounded-xl shadow-lg shadow-[#007a33]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50 mt-4"
                        >
                            {loading ? 'Processando...' : 'Solicitar Acesso'}
                            {!loading && <ChevronRight size={20} />}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
                        <button
                            onClick={onBackToLogin}
                            className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-wider transition-colors"
                        >
                            Já tenho conta? <span className="text-[#007a33]">Fazer Login</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
