import React, { useState } from 'react';
import { Lock, Mail, ChevronRight, ShieldCheck, Tractor, Truck, HardHat, Wrench, Pickaxe, Drill, Construction, Settings } from 'lucide-react';
import Logo from '../components/Logo';

interface LoginProps {
  onLogin: () => void;
}

import { supabase } from '../lib/supabase';
import Register from './Register';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForgot, setShowForgot] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  if (showRegister) {
    return <Register onBackToLogin={() => setShowRegister(false)} />;
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetMessage(null);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      setResetMessage('Verifique seu e-mail para redefinir a senha.');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  // UI for Forgot Password
  if (showForgot) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Same background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#007a33]/5 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-black/50 rounded-full blur-[150px]"></div>

        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-10 rounded-2xl shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <ShieldCheck size={48} className="mx-auto text-[#007a33] mb-4" />
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Recuperar Acesso</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Informe seu e-mail cadastrado</p>
          </div>

          {resetMessage ? (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl text-center mb-6">
              <p className="font-bold">{resetMessage}</p>
              <button
                onClick={() => setShowForgot(false)}
                className="mt-4 text-xs font-black uppercase tracking-widest underline hover:text-white"
              >
                Voltar ao Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-[#007a33] transition-colors" size={20} />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl py-4 pl-14 pr-4 text-white font-bold outline-none focus:border-[#007a33] transition-all placeholder:text-slate-800 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-[#007a33] hover:bg-[#009a43] text-white font-black py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {loading ? 'Enviando...' : 'Enviar Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="w-full text-slate-500 hover:text-white font-bold py-3 uppercase tracking-widest text-[10px]"
                >
                  Cancelar e Voltar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // onLogin is technically not needed as App.tsx listens to state, 
      // but we keep it if it was used for transitions.
      onLogin();
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setError('Credenciais inválidas. Verifique e-mail e senha.');
      } else {
        setError(err.message || 'Falha ao entrar');
      }
    } finally {
      setLoading(false);
    }
  };

  const machineryIcons = [
    <Tractor size={32} />, <Truck size={32} />, <Construction size={32} />, <Drill size={32} />,
    <HardHat size={32} />, <Wrench size={32} />, <Pickaxe size={32} />, <Settings size={32} />
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorativo Verde Profundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#007a33]/5 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-black/50 rounded-full blur-[150px]"></div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-16 relative z-10">

        {/* Lado Esquerdo: Branding e Maquinário */}
        <div className="flex-1 flex flex-col items-start gap-12">
          <Logo size="xl" />

          <div className="grid grid-cols-4 gap-4 mt-4">
            {machineryIcons.map((icon, i) => (
              <div key={i} className="w-16 h-16 bg-slate-900 border-2 border-[#007a33]/10 flex items-center justify-center text-[#007a33]/60 hover:text-[#007a33] hover:border-[#007a33]/40 transition-all cursor-default shadow-lg rounded-sm">
                {icon}
              </div>
            ))}
          </div>

          <div className="hidden lg:block space-y-4">
            <h2 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em]">Operação Integrada Dourados - MS</h2>
            <div className="flex gap-10">
              <div className="flex flex-col">
                <span className="text-white font-black text-2xl">TERRA</span>
                <span className="text-slate-600 text-[10px] uppercase font-black tracking-widest">A Força do Campo</span>
              </div>
              <div className="flex flex-col border-l border-slate-800 pl-10">
                <span className="text-[#007a33] font-black text-2xl">PRO</span>
                <span className="text-slate-600 text-[10px] uppercase font-black tracking-widest">Inteligência Digital</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Formulário Industrial */}
        <div className="w-full max-w-md">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-10 rounded-2xl shadow-2xl relative">
            {/* Indicador de Status Superior */}
            <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-[#007a33] to-transparent"></div>

            <div className="mb-10 text-center lg:text-left">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Login do Operador</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Ambiente de Produção Seguro</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuário / Registro</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-[#007a33] transition-colors" size={20} />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operador@terrapro.com.br"
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl py-4 pl-14 pr-4 text-white font-bold outline-none focus:border-[#007a33] transition-all placeholder:text-slate-800 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Senha de Acesso</label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-[#007a33] transition-colors" size={20} />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl py-4 pl-14 pr-4 text-white font-bold outline-none focus:border-[#007a33] transition-all placeholder:text-slate-800 shadow-inner"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-[#007a33] hover:bg-[#009a43] text-white font-black py-5 rounded-xl shadow-lg shadow-[#007a33]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Acessar TERRAPRO
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Auth v4.2</span>
              </div>
              <button type="button" onClick={() => setShowRegister(true)} className="text-[10px] font-black text-slate-500 uppercase tracking-tighter hover:text-white transition-colors">
                Criar Conta
              </button>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-[10px] font-black text-[#007a33] uppercase tracking-tighter hover:underline"
              >
                Esqueci a Senha
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-10 opacity-40">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-white p-1 rounded-sm mb-2 shadow-xl">
            <div className="w-full h-full bg-[#007a33] flex flex-wrap p-0.5">
              {[...Array(16)].map((_, i) => <div key={i} className={`w-1/4 h-1/4 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>)}
            </div>
          </div>
          <span className="text-[8px] font-black text-slate-500 uppercase">Validação QR</span>
        </div>
        <div className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] leading-relaxed text-center">
          TERRA TRANSPORTADORA E TERRAPLANAGEM LTDA<br />
          R. RAMÃO ESCOBAR, 4645 • DOURADOS - MS
        </div>
      </div>
    </div>
  );
};

export default Login;
