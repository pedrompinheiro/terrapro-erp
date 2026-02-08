import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import DailyControl from './pages/DailyControl';
import FleetManagement from './pages/FleetManagement';
import Maintenance from './pages/Maintenance';
import Financial from './pages/Financial';
import MapDigital from './pages/MapDigital';
import FuelManagement from './pages/FuelManagement';
import Billing from './pages/Billing';
import BIReports from './pages/BIReports';
import Login from './pages/Login';
import WhatsAppAutomation from './pages/WhatsAppAutomation';
import AIAssistant from './components/AIAssistant';
import Registrations from './pages/Registrations';
import Settings from './pages/Settings';
import HRManagement from './pages/HRManagement';
import Timekeeping from './pages/Timekeeping';
import OperationsMap from './pages/OperationsMap';
import SecurityAudit from './pages/SecurityAudit';
import Documents from './pages/Documents';
import UpdatePassword from './pages/UpdatePassword';
import Migration from './pages/Migration';
import TestConnection from './pages/TestConnection';

import { supabase } from './lib/supabase';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setUserProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) setUserProfile(data);
    } catch (e) {
      console.error("Error fetching profile", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold uppercase tracking-widest animate-pulse">Carregando Sistema TerraPro...</div>;
  }

  if (!session) {
    return <Login onLogin={() => { }} />;
  }

  // STATUS CHECK: Block access if Pending
  if (userProfile && userProfile.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">Aprovação Pendente</h2>
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md shadow-2xl">
          <p className="text-slate-400 mb-6 leading-relaxed">
            Olá, <span className="text-white font-bold">{userProfile.full_name}</span>.
            <br /><br />
            Sua solicitação de acesso foi recebida com sucesso. Por motivos de segurança, um administrador precisa liberar sua conta manualmente.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => window.location.reload()} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all uppercase tracking-widest text-xs">
              Verificar Novamente
            </button>
            <button onClick={() => supabase.auth.signOut()} className="w-full border border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 font-bold py-3 rounded-xl transition-all uppercase tracking-widest text-xs">
              Sair da Conta
            </button>
          </div>
        </div>
        <p className="mt-8 text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Terra Transportadora • Sistema Seguro</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-screen">
      <Sidebar
        onLogout={handleLogout}
      />

      <main className="flex-1 ml-72 min-h-screen flex flex-col">
        {/* Header Superior Industrial TERRAPRO */}
        <header className="h-16 border-b border-slate-900 bg-slate-950 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div className="text-[10px] font-black text-slate-500 border border-slate-800 px-3 py-1 uppercase tracking-[0.2em] bg-slate-900 shadow-inner">
              SISTEMA <span className="text-[#007a33]">TERRAPRO</span> v4.2.1
            </div>
            <div className="h-4 w-[1px] bg-slate-800"></div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
              Unidade: DOURADOS / MS
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#007a33] rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sincronização Ativa</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-900"></div>
            <button className="text-slate-600 hover:text-[#007a33] transition-colors relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#007a33]"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 custom-scrollbar">
          <Routes>
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/migracao" element={<Migration />} />
            <Route path="/teste" element={<TestConnection />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/bi" element={<BIReports />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/daily" element={<DailyControl />} />
            <Route path="/fleet" element={<FleetManagement />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/financial" element={<Financial />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/map" element={<MapDigital />} />
            <Route path="/fuel" element={<FuelManagement />} />
            <Route path="/whatsapp" element={<WhatsAppAutomation />} />
            <Route path="/rh" element={<HRManagement />} />
            <Route path="/cadastros" element={<Registrations />} />
            <Route path="/operations-map" element={<OperationsMap />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/security" element={<SecurityAudit />} />
            <Route path="/configuracoes" element={<Settings />} />
          </Routes>
        </div>
      </main>
      <AIAssistant />
    </div>
  );
};

export default App;
// Force HMR update
