import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, ShieldCheck, ChevronRight, AlertTriangle } from 'lucide-react';
import Logo from '../components/Logo';
import { useNavigate } from 'react-router-dom';

const UpdatePassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Ensure we have a session (magic link should have logged us in)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setError('Sessão expirada. Solicite o reset novamente.');
            }
        });
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;
            setSuccess(true);
            setTimeout(() => navigate('/'), 3000);
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar senha.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-24 h-24 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                    <ShieldCheck className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">Senha Atualizada!</h2>
                <p className="text-slate-400 mb-8">Você será redirecionado para o sistema em instantes...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorativo */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#007a33]/5 rounded-full blur-[150px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-black/50 rounded-full blur-[150px]"></div>

            <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-10 rounded-2xl shadow-2xl relative z-10">
                <div className="flex justify-center mb-8">
                    <Logo size="lg" />
                </div>

                <div className="text-center mb-8">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Definir Nova Senha</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Crie uma senha segura para seu acesso</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2">
                            <AlertTriangle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-[#007a33] transition-colors" size={20} />
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nova Senha"
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl py-4 pl-14 pr-4 text-white font-bold outline-none focus:border-[#007a33] transition-all placeholder:text-slate-800 shadow-inner"
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-[#007a33] transition-colors" size={20} />
                            <input
                                required
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirmar Nova Senha"
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl py-4 pl-14 pr-4 text-white font-bold outline-none focus:border-[#007a33] transition-all placeholder:text-slate-800 shadow-inner"
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-[#007a33] hover:bg-[#009a43] text-white font-black py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Atualizando...' : 'Confirmar Alteração'}
                        {!loading && <ChevronRight size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePassword;
