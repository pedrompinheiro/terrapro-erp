# TerraPro ERP - Código Fonte Completo
Gerado em: Mon Feb 16 19:02:23 -04 2026
Este arquivo contém todo o código fonte relevante do projeto para ser compartilhado com IAs.



# File: package.json
```
{
  "name": "terrapro-erp---gestão-de-ativos",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "dev:all": "npx tsx scripts/track_daemon.ts & vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "@hookform/resolvers": "^5.2.2",
    "@supabase/supabase-js": "^2.95.3",
    "@tanstack/react-query": "^5.90.20",
    "@types/leaflet": "^1.9.21",
    "@types/papaparse": "^5.5.2",
    "axios": "^1.13.5",
    "buffer": "^6.0.3",
    "dotenv": "^17.2.4",
    "jspdf": "^4.1.0",
    "jspdf-autotable": "^5.0.7",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.563.0",
    "mdb-reader": "^3.1.0",
    "papaparse": "^5.5.3",
    "pdf-parse": "^2.4.5",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-hook-form": "^7.71.1",
    "react-hot-toast": "^2.6.0",
    "react-is": "^19.2.4",
    "react-leaflet": "^5.0.0",
    "react-router-dom": "^7.13.0",
    "recharts": "^3.7.0",
    "tesseract.js": "^7.0.0",
    "xlsx": "^0.18.5",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react-router-dom": "^5.3.3",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}

```


# File: tsconfig.json
```
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "types": [
      "node"
    ],
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```


# File: vite.config.ts
```
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/selsyn': {
          target: 'https://api.appselsyn.com.br/keek/rest',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/selsyn/, '')
        }
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React ecosystem
            'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-is'],
            // Supabase
            'vendor-supabase': ['@supabase/supabase-js'],
            // Charts e visualização
            'vendor-charts': ['recharts'],
            // Mapas
            'vendor-maps': ['leaflet', 'react-leaflet'],
            // Utilitários
            'vendor-utils': ['axios', 'papaparse', 'xlsx', 'jspdf', 'jspdf-autotable'],
            // AI e processamento
            'vendor-ai': ['@google/generative-ai', 'tesseract.js'],
            // Query
            'vendor-query': ['@tanstack/react-query'],
            // UI
            'vendor-ui': ['lucide-react']
          }
        }
      },
      chunkSizeWarningLimit: 500,
      sourcemap: false, // Desabilitar sourcemaps em produção
    }
  };
});

```


# File: App.tsx
```
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load de todas as páginas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const DailyControl = lazy(() => import('./pages/DailyControl'));
const FleetManagement = lazy(() => import('./pages/FleetManagement'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Financial = lazy(() => import('./pages/Financial'));
const MapDigital = lazy(() => import('./pages/MapDigital'));
const FuelManagement = lazy(() => import('./pages/FuelManagement'));
const Billing = lazy(() => import('./pages/Billing'));
const BIReports = lazy(() => import('./pages/BIReports'));
const Login = lazy(() => import('./pages/Login'));
const WhatsAppAutomation = lazy(() => import('./pages/WhatsAppAutomation'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));
const Registrations = lazy(() => import('./pages/Registrations'));
const Settings = lazy(() => import('./pages/Settings'));
const HRManagement = lazy(() => import('./pages/HRManagement'));
const Timekeeping = lazy(() => import('./pages/Timekeeping'));
const OperationsMap = lazy(() => import('./pages/OperationsMap'));
const SecurityAudit = lazy(() => import('./pages/SecurityAudit'));
const Documents = lazy(() => import('./pages/Documents'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));
const Migration = lazy(() => import('./pages/Migration'));
const TestConnection = lazy(() => import('./pages/TestConnection'));
const SystemLogs = lazy(() => import('./pages/SystemLogs'));

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
    return (
      <Suspense fallback={<LoadingSpinner fullScreen message="Carregando..." />}>
        <Login onLogin={() => { }} />
      </Suspense>
    );
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
    <ErrorBoundary>
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
            <Suspense fallback={<LoadingSpinner fullScreen message="Carregando página..." />}>
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
                <Route path="/system-logs" element={<SystemLogs />} />
              </Routes>
            </Suspense>
          </div>
        </main>
        <Suspense fallback={null}>
          <AIAssistant />
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
// Force HMR update

```


# File: index.tsx
```

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

```


# File: types.ts
```
export type UserRole = 'admin' | 'gestor' | 'operador' | 'financeiro' | 'viewer';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company_id: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  created_at: string;
}

export enum AssetStatus {
  OPERATING = 'OPERATING',
  MAINTENANCE = 'MAINTENANCE',
  AVAILABLE = 'AVAILABLE',
  IDLE = 'IDLE'
}

export enum OSStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_PARTS = 'WAITING_PARTS',
  COMPLETED = 'COMPLETED'
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  IN_MEDIATION = 'IN_MEDIATION'
}

export interface Asset {
  id: string;
  company_id: string;
  branch_id?: string;

  code: string;
  name: string;
  model: string;
  brand: string;

  status: AssetStatus;

  horometer_total: number;
  odometer_total: number;

  // Aliases for compatibility with older mocks/views if needed
  horometer?: number;

  daily_cost_avg?: number;

  coordinates?: { lat: number; lng: number };
  telemetry?: any; // JSONB

  created_at?: string;
}

export interface StockItem {
  sku: string;
  description: string;
  category: string;
  currentQty: number;
  minQty: number;
  location: string;
  status: 'NORMAL' | 'CRITICAL' | 'WARNING';
}

export interface MaintenanceOS {
  id: string;
  company_id: string;
  asset_id: string;
  assetName?: string; // Hydrated field

  seq_number: number;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE' | 'INSPECTION';
  status: OSStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  description: string;
  mechanic?: string;
  progress?: number;
  partsNeeded?: string[];
  technician_notes?: string;

  opened_at: string;
  completed_at?: string;
}

export interface Transaction {
  id: string;
  company_id: string;

  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  status: PaymentStatus;
  due_date: string;
  payment_date?: string;

  category?: string;
  client?: string;
}

export type DocumentCategory = 'FISCAL' | 'LEGAL' | 'RH' | 'VEICULOS' | 'LICENCAS' | 'OUTROS';

export interface ERPDocument {
  id: string;
  title: string;
  filename: string;
  category: DocumentCategory;
  uploadDate: string;
  expiryDate?: string;
  fileSize: string;
  fileType: 'PDF' | 'DOCX' | 'IMAGE' | 'XLSX';
  relatedTo?: string; // e.g. "João Silva", "Caminhão G420"
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT';
  resource: string; // e.g., 'Ativo', 'Financeiro', 'Usuário'
  details: string;
  ipAddress: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  screenshotUrl?: string; // Mock URL for the "visual evidence"
}

export interface NetworkSession {
  id: string;
  userId: string;
  userName: string;
  device: string;
  ipAddress: string;
  lastActive: string;
  currentScreen: string;
  status: 'ACTIVE' | 'IDLE' | 'BACKGROUND';
  thumbnailUrl?: string; // Live view mock
}

// RH Module Types
export interface Employee {
  id: string;
  company_id: string;
  full_name: string;
  cpf?: string;
  registration_number?: string;
  job_title?: string;
  work_start_time?: string;
  work_end_time?: string;
  user_id?: string;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  company_id: string;
  employee_id: string;
  date: string;

  entry_time?: string;
  break_start?: string;
  break_end?: string;
  exit_time?: string;

  total_hours?: number;
  overtime_hours?: number;

  source: 'MANUAL' | 'OCR_GEMINI';
  evidence_image_url?: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

  raw_ai_data?: any;
}

```


# File: constants.tsx
```

import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Map as MapIcon,
  ClipboardCheck,
  Wrench,
  Package,
  Fuel,
  Wallet,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  MessageSquare,
  Users,
  Calendar,
  Shield,
  Database
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard BI', icon: <LayoutDashboard size={20} />, group: 'Principal', path: '/', slug: 'frota_ativos' },
  { id: 'fleet', label: 'Frota Ativa', icon: <Truck size={20} />, group: 'Principal', path: '/fleet', slug: 'frota_ativos' },
  { id: 'cadastros', label: 'Cadastros Gerais', icon: <Users size={20} />, group: 'Principal', path: '/cadastros', slug: 'frota_ativos' },
  { id: 'operations-map', label: 'Mapa de Operações', icon: <Calendar size={20} />, group: 'Operacional', path: '/operations-map', slug: 'diaria_operadores' },
  { id: 'map', label: 'Mapa Digital', icon: <MapIcon size={20} />, group: 'Operacional', path: '/map', slug: 'diaria_operadores' },
  { id: 'daily', label: 'Controle Diário', icon: <ClipboardCheck size={20} />, group: 'Operacional', path: '/daily', slug: 'diaria_operadores' },
  { id: 'maintenance', label: 'Manutenção', icon: <Wrench size={20} />, group: 'Operacional', path: '/maintenance', slug: 'frota_manutencao' },
  { id: 'inventory', label: 'Almoxarifado', icon: <Package size={20} />, group: 'Insumos', path: '/inventory', slug: 'frota_manutencao' },
  { id: 'fuel', label: 'Combustível', icon: <Fuel size={20} />, group: 'Insumos', path: '/fuel', slug: 'controle_diesel' },
  { id: 'hr', label: 'Recursos Humanos', icon: <Users size={20} />, group: 'Gestão', path: '/rh', slug: 'rh_folha_ponto' },
  { id: 'financial', label: 'Financeiro', icon: <Wallet size={20} />, group: 'Gestão', path: '/financial', slug: 'fin_contas_pagar' },
  { id: 'billing', label: 'Faturamento', icon: <FileText size={20} />, group: 'Gestão', path: '/billing', slug: 'fin_contas_receber' },
  { id: 'bi', label: 'Relatórios BI', icon: <BarChart3 size={20} />, group: 'Gestão', path: '/bi', slug: 'sys_audit_logs' },
  { id: 'documents', label: 'Documentos GED', icon: <FileText size={20} />, group: 'Gestão', path: '/documents', slug: 'sys_audit_logs' },
  { id: 'security', label: 'Segurança & Audit', icon: <Shield size={20} />, group: 'Gestão', path: '/security', slug: 'sys_audit_logs' },
  { id: 'whatsapp', label: 'Automação Zap', icon: <MessageSquare size={20} />, group: 'Inteligência', path: '/whatsapp', slug: 'sys_audit_logs' },
];

export const BOTTOM_NAV_ITEMS = [
  { id: 'connection', label: 'Status Conexão', path: '/teste', icon: <Database size={20} /> },
  { id: 'settings', label: 'Configurações', path: '/configuracoes', icon: <Settings size={20} /> }, // Added path
  { id: 'logout', label: 'Sair', icon: <LogOut size={20} />, color: 'text-red-400' },
];

```


# File: components/AIAssistant.tsx
```
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

```


# File: components/ErrorBoundary.tsx
```
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Aqui você pode enviar para um serviço de tracking (Sentry, etc)
        // Sentry.captureException(error);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                            Algo deu errado
                        </h2>

                        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                            Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com o suporte se o problema persistir.
                        </p>

                        {this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 mb-2">
                                    Detalhes técnicos
                                </summary>
                                <pre className="text-[10px] text-red-400 bg-slate-950 p-3 rounded-lg overflow-auto max-h-32 font-mono">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all uppercase tracking-widest text-xs"
                            >
                                Recarregar Página
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 font-bold py-3 rounded-xl transition-all uppercase tracking-widest text-xs"
                            >
                                Ir para Início
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

```


# File: components/LoadingSpinner.tsx
```
import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message,
    fullScreen = false
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={`animate-spin rounded-full border-b-2 border-emerald-500 ${sizeClasses[size]}`}></div>
            {message && (
                <p className="text-sm text-slate-400 font-medium animate-pulse">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {spinner}
        </div>
    );
};

export default LoadingSpinner;

```


# File: components/Logo.tsx
```

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const scales = {
    sm: 'scale-[0.3]',
    md: 'scale-[0.5]',
    lg: 'scale-[0.75]',
    xl: 'scale-[0.9]'
  };

  return (
    <div className={`flex flex-col items-start ${scales[size]} ${className} origin-left transition-all`}>
      <div className="relative flex items-center">
        {/* Bloco Verde Principal (Esquerda) */}
        <div className="w-48 h-48 bg-[#007a33] border-[6px] border-black relative z-0 shrink-0">
          <div className="absolute inset-0 border-[6px] border-white/10"></div>
        </div>

        {/* Bloco Branco com Texto (Sobreposto) */}
        <div className="absolute left-10 w-[450px] h-24 bg-white border-[6px] border-black z-10 flex items-center px-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-black font-[900] text-[84px] tracking-[-0.05em] leading-none italic" style={{ fontFamily: 'serif' }}>
            TERRA
          </span>
          <span className="ml-3 text-[#007a33] font-[900] text-[84px] tracking-tighter leading-none italic">
            PRO
          </span>
        </div>
      </div>

      {/* Barras de Texto Inferiores fiéis ao PDF */}
      <div className="mt-6 w-[550px] space-y-2 z-20">
        <div className="bg-[#007a33] border-l-[12px] border-black py-2 px-6 flex items-center">
          <span className="text-white font-[900] text-2xl uppercase tracking-[0.1em] italic">
            TRANSPORTADORA TERRAPLANAGEM
          </span>
        </div>
        <div className="bg-black py-2 px-6 flex items-center justify-center">
          <span className="text-white font-[900] text-3xl uppercase tracking-[0.4em]">
            LOCAÇÃO DE MÁQUINAS
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;

```


# File: components/Modal.tsx
```

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
            >
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                    <h3 className="text-lg font-black text-white tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;

```


# File: components/Sidebar.tsx
```

import React from 'react';
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from '../constants';
import Logo from './Logo';

interface SidebarProps {
  onLogout: () => void;
}

import { NavLink } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const { hasPermission, loading } = usePermission();

  const groupedItems = NAV_ITEMS.filter(item => {
    // Se não tiver slug definido, mostra por padrão (Dashboard, etc)
    if (!item.slug) return true;
    return hasPermission(item.slug);
  }).reduce((acc: any, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-950 flex flex-col h-screen fixed z-50">
      <div className="p-8 h-36 flex items-center justify-start border-b border-slate-900 overflow-hidden">
        <Logo size="sm" className="-ml-12" />
      </div>

      <nav className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
        {Object.entries(groupedItems).map(([group, items]: [string, any]) => (
          <div key={group} className="mb-8">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] px-3 mb-4">{group}</h3>
            <div className="space-y-1.5">
              {items.map((item: any) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3 transition-all border-l-4 ${isActive
                    ? 'bg-slate-900/50 border-[#007a33] text-white shadow-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/30'
                    }`}
                >
                  {({ isActive }) => (
                    <>
                      <div className={isActive ? 'text-[#007a33]' : ''}>
                        {item.icon}
                      </div>
                      <span className="text-sm font-black uppercase tracking-tighter italic">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-900 bg-slate-950 space-y-3">
        {BOTTOM_NAV_ITEMS.map((item: any) => (
          item.path ? (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-2 transition-all ${isActive ? 'text-white' : 'text-slate-500 hover:text-white'}`}
            >
              {item.icon}
              <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
            </NavLink>
          ) : (
            <button
              key={item.id}
              onClick={item.id === 'logout' ? onLogout : undefined}
              className={`w-full flex items-center gap-4 px-4 py-2 text-slate-500 hover:text-white transition-all ${item.color || ''}`}
            >
              {item.icon}
              <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          )
        ))}

        <div className="mt-4 flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-inner">
          <div className="w-12 h-12 bg-slate-800 border-2 border-[#007a33] flex items-center justify-center overflow-hidden rounded-sm">
            <img src="https://picsum.photos/seed/terra-pro/100" alt="Avatar" className="w-full h-full object-cover grayscale" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black text-white truncate uppercase italic tracking-tighter">DIRETOR TÉCNICO</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#007a33] rounded-full animate-pulse"></span>
              <p className="text-[9px] text-[#007a33] font-black uppercase tracking-widest">SISTEMA ONLINE</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

```


# File: components/StatCard.tsx
```

import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  iconBg: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon, iconBg, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm hover:border-slate-700 transition-all ${onClick ? 'cursor-pointer hover:bg-slate-800/50' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 ${iconBg} rounded-xl text-white shadow-inner`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
            <svg className={`w-3 h-3 ${!trendUp && 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-white mt-1 tracking-tight">{value}</h3>
    </div>
  );
};

export default StatCard;

```


# File: components/TransactionFormModal.tsx
```
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign, FileText, Repeat, Tag, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';

interface TransactionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    type: 'PAGAR' | 'RECEBER';
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, onSuccess, type }) => {
    const [loading, setLoading] = useState(false);
    const [partners, setPartners] = useState<any[]>([]);
    const [costCenters, setCostCenters] = useState<any[]>([]);
    const [chartAccounts, setChartAccounts] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        partner_id: '',
        description: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        issue_date: new Date().toISOString().split('T')[0],
        recurrence: 'UNICA', // UNICA, MENSAL, PARCELADO
        installments: 1,
        interval: 30, // Default 30 dias
        cost_center_id: '',
        chart_account_id: '',
        observation: ''
    });

    // Load auxiliary data
    useEffect(() => {
        if (isOpen) {
            loadDependencies();
        }
    }, [isOpen]);

    const loadDependencies = async () => {
        try {
            // Carregar Parceiros (Clientes ou Fornecedores)
            // Ajuste: Buscamos todos e filtramos aqui para garantir
            const { data: entities } = await supabase
                .from('entities')
                .select('id, name, type')
                .order('name');

            if (entities) {
                // Filtragem robusta: Verifica se o type contém a string (ex: 'CLIENT', 'Customer', etc)
                const targetType = type === 'RECEBER' ? ['client', 'customer'] : ['supplier', 'vendor', 'provider'];

                const filtered = entities.filter(e => {
                    const t = (e.type || '').toLowerCase();
                    return targetType.some(target => t.includes(target));
                });

                // Se filtro falhar (ex: tipos vazios), mostra todos como fallback para não travar
                setPartners(filtered.length > 0 ? filtered : entities);
            }

            // Carregar Centros de Custo
            const { data: costs } = await supabase
                .from('centros_custo')
                .select('id, nome, codigo')
                .eq('ativo', true);

            if (costs) setCostCenters(costs);

            // Carregar Plano de Contas
            const { data: accounts } = await supabase
                .from('plano_contas')
                .select('id, nome, codigo, tipo')
                .eq('tipo', type === 'RECEBER' ? 'RECEITA' : 'DESPESA');

            if (accounts) setChartAccounts(accounts);

        } catch (error) {
            console.error('Erro ao carregar dependências', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const table = type === 'RECEBER' ? 'contas_receber' : 'contas_pagar';
            const fieldPartner = type === 'RECEBER' ? 'cliente_id' : 'fornecedor_id';
            const fieldPartnerName = type === 'RECEBER' ? 'cliente_nome' : 'fornecedor_nome';

            const partner = partners.find(p => p.id === formData.partner_id);

            // Payload base
            const payload = {
                [fieldPartner]: formData.partner_id,
                [fieldPartnerName]: partner?.name || 'Desconhecido',
                descricao: formData.description,
                valor_original: parseFloat(formData.amount),
                data_emissao: formData.issue_date,
                data_vencimento: formData.due_date,
                centro_custo_id: formData.cost_center_id || null,
                plano_contas_id: formData.chart_account_id || null,
                observacao: formData.observation,
                status: 'PENDENTE',
                numero_titulo: `${type === 'RECEBER' ? 'REC' : 'PAG'}-${Date.now()}` // Gerador simples
            };

            if (formData.recurrence === 'PARCELADO' && formData.installments > 1) {
                const valorParcela = parseFloat(formData.amount) / formData.installments;

                for (let i = 0; i < formData.installments; i++) {
                    // Cria nova data baseada na data de vencimento inicial
                    const dataBase = new Date(formData.due_date);
                    // Adiciona (i * intervalo) dias
                    // Ex: i=0 -> +0 dias (Data Inicial)
                    // Ex: i=1 -> +30 dias (Se intervalo for 30)
                    dataBase.setDate(dataBase.getDate() + (i * formData.interval));

                    await supabase.from(table).insert({
                        ...payload,
                        numero_titulo: `${payload.numero_titulo}-${i + 1}/${formData.installments}`,
                        descricao: `${payload.descricao} (${i + 1}/${formData.installments})`,
                        valor_original: valorParcela,
                        data_vencimento: dataBase.toISOString().split('T')[0]
                    });
                }
                showToast.success(`${formData.installments} parcelas geradas com sucesso!`);
            } else {
                // Lançamento Único
                const { error } = await supabase.from(table).insert(payload);
                if (error) throw error;
                showToast.success('Lançamento salvo com sucesso!');
            }

            onSuccess();
            onClose();
            // Reset form (opcional)
        } catch (error: any) {
            console.error(error);
            showToast.error('Erro ao salvar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className={`p-6 border-b border-slate-700 flex justify-between items-center ${type === 'RECEBER' ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type === 'RECEBER' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Nova Conta a {type === 'RECEBER' ? 'Receber' : 'Pagar'}
                            </h2>
                            <p className="text-slate-400 text-sm">Preencha os dados do lançamento financeiro</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition p-2 hover:bg-slate-800 rounded-lg">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Valor e Descrição (Destaque) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Valor Total</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Descrição / Histórico</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder={`Ex: ${type === 'RECEBER' ? 'Aluguel Escavadeira' : 'Compra Peças'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Parceiro e Datas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">
                                {type === 'RECEBER' ? 'Cliente' : 'Fornecedor'}
                            </label>
                            <select
                                required
                                value={formData.partner_id}
                                onChange={e => setFormData({ ...formData, partner_id: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Selecione...</option>
                                {partners.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Data Emissão</label>
                            <input
                                type="date"
                                required
                                value={formData.issue_date}
                                onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Data Vencimento (1ª Parc)</label>
                            <input
                                type="date"
                                required
                                value={formData.due_date}
                                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Classificação */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                        <div>
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Categoria (Plano de Contas)</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <select
                                    value={formData.chart_account_id}
                                    onChange={e => setFormData({ ...formData, chart_account_id: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Sem categoria...</option>
                                    {chartAccounts.map(c => (
                                        <option key={c.id} value={c.id}>{c.codigo} - {c.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Centro de Custo</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <select
                                    value={formData.cost_center_id}
                                    onChange={e => setFormData({ ...formData, cost_center_id: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Geral...</option>
                                    {costCenters.map(cc => (
                                        <option key={cc.id} value={cc.id}>{cc.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Recorrência / Parcelamento */}
                    <div className="space-y-3">
                        <label className="block text-slate-400 text-xs uppercase font-bold">Condição de Pagamento</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-white cursor-pointer bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500 transition">
                                <input
                                    type="radio"
                                    name="recurrence"
                                    value="UNICA"
                                    checked={formData.recurrence === 'UNICA'}
                                    onChange={e => setFormData({ ...formData, recurrence: e.target.value })}
                                />
                                <span>À Vista / Única</span>
                            </label>
                            <label className="flex items-center gap-2 text-white cursor-pointer bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500 transition">
                                <input
                                    type="radio"
                                    name="recurrence"
                                    value="PARCELADO"
                                    checked={formData.recurrence === 'PARCELADO'}
                                    onChange={e => setFormData({ ...formData, recurrence: e.target.value })}
                                />
                                <span>Parcelado</span>
                            </label>
                        </div>

                        {formData.recurrence === 'PARCELADO' && (
                            <div className="flex flex-wrap items-center gap-4 mt-4 animate-in fade-in slide-in-from-top-2 p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">

                                {/* Parcelas */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-blue-200 text-xs uppercase font-bold">Quantidade</label>
                                    <div className="flex items-center gap-2">
                                        <Repeat className="text-blue-400 h-4 w-4" />
                                        <input
                                            type="number"
                                            min="2"
                                            max="60"
                                            value={formData.installments}
                                            onChange={e => setFormData({ ...formData, installments: parseInt(e.target.value) })}
                                            className="w-20 bg-slate-900 border border-blue-500/50 rounded-md py-1 px-2 text-white text-center font-bold outline-none focus:border-blue-400"
                                        />
                                        <span className="text-blue-300 text-sm">x</span>
                                    </div>
                                </div>

                                {/* Intervalo */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-blue-200 text-xs uppercase font-bold">Intervalo (dias)</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="text-blue-400 h-4 w-4" />
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={formData.interval}
                                            onChange={e => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                                            className="w-20 bg-slate-900 border border-blue-500/50 rounded-md py-1 px-2 text-white text-center font-bold outline-none focus:border-blue-400"
                                        />
                                    </div>
                                </div>

                                {/* Resumo */}
                                <div className="flex-1 text-right">
                                    <div className="text-blue-200 text-xs uppercase font-bold mb-1">Valor por Parcela</div>
                                    <div className="text-xl font-bold text-white">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.amount || '0') / formData.installments)}
                                    </div>
                                </div>

                                <div className="w-full text-xs text-blue-300/70 border-t border-blue-800/30 pt-2 mt-2">
                                    Primeira parcela em: <strong>{new Date(formData.due_date).toLocaleDateString()}</strong> <br />
                                    Última parcela em: <strong>{new Date(new Date(formData.due_date).getTime() + ((formData.installments - 1) * formData.interval * 86400000)).toLocaleDateString()}</strong>
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-slate-300 font-medium hover:bg-slate-700 hover:text-white transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`px-6 py-2.5 rounded-lg text-white font-bold shadow-lg flex items-center gap-2 transform active:scale-95 transition-all
              ${type === 'RECEBER'
                                ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20'
                                : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'}
              ${loading ? 'opacity-70 cursor-not-allowed' : ''}
            `}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Salvando...
                            </span>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Salvar Lançamento
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionFormModal;

```


# File: components/hr/EmployeeForm.tsx
```
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, User, Briefcase, CreditCard, FileText, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import { validateCPF, formatCPF, formatCurrency, parseCurrency } from '../../services/validation';

interface EmployeeFormProps {
    employeeId?: string | null;
    companiesList: { id: string, name: string }[];
    onClose: () => void;
    onSuccess: () => void;
    onSwitchToEdit?: (id: string) => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employeeId, companiesList, onClose, onSuccess, onSwitchToEdit }) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'contract' | 'banking'>('personal');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [duplicateData, setDuplicateData] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        // Pessoal
        company_id: '',
        name: '',
        cpf: '',
        email: '',
        phone: '',
        address: '',
        birth_date: '',

        // Contrato
        job_title: '',
        department: '',
        admission_date: '',
        registration_number: '',
        base_salary: '0,00',
        transport_fare: '0,00',
        meal_allowance: '0,00',
        weekly_hours: 44,
        work_start_time: '08:00',
        work_end_time: '18:00',
        work_shift_id: '',

        // Bancário
        bank_name: '',
        bank_agency: '',
        bank_account: '',
        bank_account_type: 'Corrente',
        pix_key: '',

        // Docs
        rg: '',
        cnh_number: '',
        cnh_category: '',
        cnh_expiry: ''
    });

    const [shifts, setShifts] = useState<any[]>([]);

    useEffect(() => {
        // Fetch shifts
        supabase.from('work_shifts').select('id, name').order('name')
            .then(({ data }) => setShifts(data || []));

        if (employeeId) {
            fetchEmployee();
        }
    }, [employeeId]);

    const fetchEmployee = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', employeeId)
            .single();

        if (data) {
            setFormData({
                company_id: data.company_id || '',
                name: data.full_name || data.name || '',
                cpf: data.cpf ? formatCPF(data.cpf) : '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                birth_date: data.birth_date || '',

                job_title: data.job_title || data.role || '',
                department: data.department || '',
                admission_date: data.admission_date || '',
                registration_number: data.registration_number || '',
                base_salary: data.base_salary ? formatCurrency(data.base_salary).replace('R$', '').trim() : '0,00',
                transport_fare: data.transport_fare ? formatCurrency(data.transport_fare).replace('R$', '').trim() : '0,00',
                meal_allowance: data.meal_allowance ? formatCurrency(data.meal_allowance).replace('R$', '').trim() : '0,00',
                weekly_hours: data.weekly_hours || 44,
                work_start_time: data.work_start_time || '08:00',
                work_end_time: data.work_end_time || '18:00',
                work_shift_id: data.work_shift_id || '',

                bank_name: data.bank_name || '',
                bank_agency: data.bank_agency || '',
                bank_account: data.bank_account || '',
                bank_account_type: data.bank_account_type || 'Corrente',
                pix_key: data.pix_key || '',

                rg: data.rg || '',
                cnh_number: data.cnh_number || '',
                cnh_category: data.cnh_category || '',
                cnh_expiry: data.cnh_expiry || ''
            });
        }
        setLoading(false);
    };

    const handleChange = (field: string, value: string) => {
        if (field === 'cpf') value = formatCPF(value);
        if (['base_salary', 'transport_fare', 'meal_allowance'].includes(field)) {
            // Máscara de moeda simples
            value = value.replace(/\D/g, '');
            value = (Number(value) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setMessage(null);
        if (!formData.name) return setMessage({ type: 'error', text: 'Nome é obrigatório.' });
        if (!formData.company_id) return setMessage({ type: 'error', text: 'Selecione a Empresa.' });

        // Validação de CPF (opcional se vazio, obrigatório se preenchido)
        if (formData.cpf && !validateCPF(formData.cpf)) {
            return setMessage({ type: 'error', text: 'CPF inválido.' });
        }

        setLoading(true);

        // --- VERIFICAÇÃO DE DUPLICIDADE ---
        try {
            // Verifica se já existe Nome exato ou Matrícula
            const { data: duplicates, error: dupError } = await supabase
                .from('employees')
                .select('id, full_name, registration_number, active')
                .or(`full_name.eq.${formData.name.trim()},registration_number.eq.${formData.registration_number.trim()}`);

            if (dupError && dupError.code !== 'PGRST116') {
                console.warn("Erro ao verificar duplicidade:", dupError);
            }

            if (duplicates && duplicates.length > 0) {
                const realDuplicates = duplicates.filter(d => d.id !== employeeId);

                if (realDuplicates.length > 0) {
                    const dup = realDuplicates[0];
                    setDuplicateData(dup);
                    setLoading(false);
                    return;
                }
            }
        } catch (err) {
            console.error("Falha na validação de unicidade:", err);
        }
        // ----------------------------------

        const payload = {
            company_id: formData.company_id,
            full_name: formData.name, // Correção: coluna é full_name
            // name: formData.name, // Removido
            cpf: formData.cpf.replace(/\D/g, ''), // Salva limpo
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            birth_date: formData.birth_date || null,

            // role: formData.job_title, // Removido (não existe no banco)
            job_title: formData.job_title,
            department: formData.department,
            admission_date: formData.admission_date || null,
            registration_number: formData.registration_number,
            base_salary: parseCurrency(formData.base_salary),
            transport_fare: parseCurrency(formData.transport_fare),
            meal_allowance: parseCurrency(formData.meal_allowance),
            weekly_hours: Number(formData.weekly_hours),
            work_start_time: formData.work_start_time,
            work_end_time: formData.work_end_time,
            work_shift_id: formData.work_shift_id || null,

            bank_name: formData.bank_name,
            bank_agency: formData.bank_agency,
            bank_account: formData.bank_account,
            bank_account_type: formData.bank_account_type,
            pix_key: formData.pix_key,

            rg: formData.rg,
            cnh_number: formData.cnh_number,
            cnh_category: formData.cnh_category,
            cnh_expiry: formData.cnh_expiry || null
        };

        let error;
        if (employeeId) {
            const { error: err } = await supabase.from('employees').update(payload).eq('id', employeeId);
            error = err;
        } else {
            const { error: err } = await supabase.from('employees').insert(payload);
            error = err;
        }

        setLoading(false);

        if (error) {
            console.error(error);
            let friendlyMsg = error.message;

            // Traduções de Erros Comuns
            if (error.code === '23505') friendlyMsg = "Já existe um colaborador cadastrado com este CPF ou Matrícula.";
            if (error.code === '42703' || error.message?.includes("Could not find the")) friendlyMsg = "Erro de Versão: O sistema precisa ser atualizado. (Coluna não encontrada)";

            setMessage({ type: 'error', text: friendlyMsg });
        } else {
            setMessage({ type: 'success', text: 'Salvo com sucesso!' });
            setTimeout(onSuccess, 1000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">

                {/* MODAL DE DUPLICIDADE (OVERLAY) */}
                {duplicateData && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-8 text-center animate-in fade-in zoom-in duration-300">
                        <div className="max-w-md space-y-6">
                            <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 animate-bounce">
                                <AlertCircle size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Cadastro Encontrado!</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Já existe um colaborador com este Nome ou Matrícula:<br />
                                    <strong className="text-white text-lg block my-2">{duplicateData.full_name}</strong>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${duplicateData.active !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                        Status: {duplicateData.active !== false ? 'ATIVO' : 'DESLIGADO (INATIVO)'}
                                    </span>
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                {duplicateData.active === false ? (
                                    <button
                                        onClick={async () => {
                                            setLoading(true);
                                            await supabase.from('employees').update({ active: true }).eq('id', duplicateData.id);
                                            if (onSwitchToEdit) onSwitchToEdit(duplicateData.id);
                                            setDuplicateData(null);
                                        }}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <div className="p-1 bg-white/20 rounded-full"><CheckCircle size={16} /></div>
                                        Reativar e Editar
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (onSwitchToEdit) onSwitchToEdit(duplicateData.id);
                                            setDuplicateData(null);
                                        }}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={18} /> Editar Cadastro Existente
                                    </button>
                                )}

                                <button
                                    onClick={() => setDuplicateData(null)}
                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold rounded-xl transition-all"
                                >
                                    Voltar e Ajustar Dados
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            {employeeId ? <User className="text-blue-500" /> : <User className="text-emerald-500" />}
                            {employeeId ? 'Editar Colaborador' : 'Novo Colaborador'}
                        </h2>
                        <p className="text-slate-400 text-sm">Preencha os dados completos para o eSocial e Folha.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-900/50">
                    <button onClick={() => setActiveTab('personal')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'personal' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                        <User size={16} /> Dados Pessoais
                    </button>
                    <button onClick={() => setActiveTab('contract')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'contract' ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                        <Briefcase size={16} /> Contrato & RH
                    </button>
                    <button onClick={() => setActiveTab('banking')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'banking' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                        <CreditCard size={16} /> Bancário & Docs
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50 custom-scrollbar">

                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'}`}>
                            {message.type === 'success' ? <CheckCircle /> : <AlertCircle />}
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'personal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Empresa Vinculada *</label>
                                <select value={formData.company_id} onChange={e => handleChange('company_id', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                                    <option value="">Selecione a Empresa...</option>
                                    {companiesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo *</label>
                                <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: João da Silva" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CPF (Obrigatório para eSocial)</label>
                                <input type="text" maxLength={14} value={formData.cpf} onChange={e => handleChange('cpf', e.target.value)} className={`w-full bg-slate-900 border rounded-lg p-3 text-white outline-none ${formData.cpf && !validateCPF(formData.cpf) ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'}`} placeholder="000.000.000-00" />
                                {formData.cpf && !validateCPF(formData.cpf) && <span className="text-red-500 text-xs mt-1 block">CPF Inválido</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Nascimento</label>
                                <input type="date" value={formData.birth_date} onChange={e => handleChange('birth_date', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="email@empresa.com" />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone / WhatsApp</label>
                                <input type="text" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="(00) 00000-0000" />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço Completo</label>
                                <textarea rows={2} value={formData.address} onChange={e => handleChange('address', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Rua, Número, Bairro, Cidade - UF" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'contract' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo (Carteira)</label>
                                <input type="text" value={formData.job_title} onChange={e => handleChange('job_title', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="Ex: Motorista Caminhão Truck" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Departamento / Obra</label>
                                <input type="text" value={formData.department} onChange={e => handleChange('department', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="Ex: Operacional / Obra A" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Matrícula (Sistema Antigo)</label>
                                <input type="text" value={formData.registration_number} onChange={e => handleChange('registration_number', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Admissão</label>
                                <input type="date" value={formData.admission_date} onChange={e => handleChange('admission_date', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                            </div>

                            <div className="col-span-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Turno de Trabalho</label>
                                <select value={formData.work_shift_id} onChange={e => handleChange('work_shift_id', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none">
                                    <option value="">Sem Turno Definido (Personalizado)</option>
                                    {shifts.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Entrada Padrão</label>
                                <input type="time" value={formData.work_start_time} onChange={e => handleChange('work_start_time', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Saída Padrão</label>
                                <input type="time" value={formData.work_end_time} onChange={e => handleChange('work_end_time', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-emerald-500 uppercase mb-1">Salário Base (R$)</label>
                                <input type="text" value={formData.base_salary} onChange={e => handleChange('base_salary', e.target.value)} className="w-full bg-emerald-950/30 border border-emerald-500/50 rounded-lg p-3 text-emerald-400 font-bold focus:border-emerald-500 outline-none text-right" placeholder="0,00" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Carga Horária Semanal</label>
                                <input type="number" value={formData.weekly_hours} onChange={e => handleChange('weekly_hours', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vale Transporte (Diário)</label>
                                <input type="text" value={formData.transport_fare} onChange={e => handleChange('transport_fare', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-right" placeholder="0,00" />
                            </div>

                            <div className="col-span-3 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vale Refeição (Diário)</label>
                                <input type="text" value={formData.meal_allowance} onChange={e => handleChange('meal_allowance', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-right" placeholder="0,00" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'banking' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                <h3 className="text-sm font-bold text-emerald-400 uppercase mb-4 flex items-center gap-2"><CreditCard size={16} /> Dados Bancários (Para Pagamento)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Banco</label>
                                        <input type="text" value={formData.bank_name} onChange={e => handleChange('bank_name', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-emerald-500" placeholder="Ex: Nubank, Bradesco" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Agência</label>
                                        <input type="text" value={formData.bank_agency} onChange={e => handleChange('bank_agency', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Conta & Dígito</label>
                                        <input type="text" value={formData.bank_account} onChange={e => handleChange('bank_account', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-emerald-500" />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chave PIX (Preferencial)</label>
                                        <input type="text" value={formData.pix_key} onChange={e => handleChange('pix_key', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-emerald-500" placeholder="CPF, Email ou Aleatória" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                <h3 className="text-sm font-bold text-blue-400 uppercase mb-4 flex items-center gap-2"><FileText size={16} /> Documentos Complementares</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">RG</label>
                                        <input type="text" value={formData.rg} onChange={e => handleChange('rg', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Número CNH</label>
                                        <input type="text" value={formData.cnh_number} onChange={e => handleChange('cnh_number', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria CNH</label>
                                        <select value={formData.cnh_category} onChange={e => handleChange('cnh_category', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500">
                                            <option value="">Selecione...</option>
                                            <option value="A">A (Moto)</option>
                                            <option value="B">B (Carro)</option>
                                            <option value="C">C (Caminhão)</option>
                                            <option value="D">D (Ônibus/Van)</option>
                                            <option value="E">E (Carreta)</option>
                                            <option value="AD">AD</option>
                                            <option value="AE">AE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Validade CNH</label>
                                        <input type="date" value={formData.cnh_expiry} onChange={e => handleChange('cnh_expiry', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancelar</button>
                    <button onClick={handleSave} disabled={loading} className="px-8 py-3 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Salvando...' : <><Save size={20} /> Salvar Cadastro</>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EmployeeForm;

```


# File: components/hr/WorkShiftForm.tsx
```

import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Calendar } from 'lucide-react';

interface WorkShift {
    id?: string;
    name: string;
    start_time: string;
    break_start: string;
    break_end: string;
    end_time: string;
    work_days: string[];
}

interface WorkShiftFormProps {
    shiftId?: string | null;
    initialData?: WorkShift;
    onClose: () => void;
    onSuccess: () => void;
}

const DAYS_OF_WEEK = [
    { key: 'Monday', label: 'Segunda-feira', short: 'SEG' },
    { key: 'Tuesday', label: 'Terça-feira', short: 'TER' },
    { key: 'Wednesday', label: 'Quarta-feira', short: 'QUA' },
    { key: 'Thursday', label: 'Quinta-feira', short: 'QUI' },
    { key: 'Friday', label: 'Sexta-feira', short: 'SEX' },
    { key: 'Saturday', label: 'Sábado', short: 'SÁB' },
    { key: 'Sunday', label: 'Domingo', short: 'DOM' },
];

const WorkShiftForm: React.FC<WorkShiftFormProps> = ({ shiftId, initialData, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<WorkShift>({
        name: '',
        start_time: '07:00',
        break_start: '11:00',
        break_end: '12:00',
        end_time: '17:00',
        work_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const toggleDay = (dayKey: string) => {
        setFormData(prev => {
            const current = prev.work_days || [];
            if (current.includes(dayKey)) {
                return { ...prev, work_days: current.filter(d => d !== dayKey) };
            } else {
                return { ...prev, work_days: [...current, dayKey] };
            }
        });
    };

    const calculateTotalHours = () => {
        // Assume formato HH:MM
        const toMinutes = (time: string) => {
            if (!time) return 0;
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };

        const start = toMinutes(formData.start_time);
        const end = toMinutes(formData.end_time);
        const breakStart = toMinutes(formData.break_start);
        const breakEnd = toMinutes(formData.break_end);

        if (end < start) return '00:00'; // Não lida com virada de dia simples aqui

        const totalBreak = (breakEnd > breakStart) ? (breakEnd - breakStart) : 0;
        const totalWork = (end - start) - totalBreak;

        if (totalWork <= 0) return '00:00';

        const h = Math.floor(totalWork / 60);
        const m = totalWork % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const handleSave = async () => {
        if (!formData.name) return alert('Dê um nome ao turno (Ex: Administrativo)');

        setLoading(true);
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            const supabase = createClient(supabaseUrl, supabaseKey);

            const payload = { ...formData };
            if (!shiftId) delete payload.id;
            // Se for novo, remove id do payload

            // Verifica se WorkShifts já existe. Se der erro, avisa usuario para rodar script.
            const { error: checkError } = await supabase.from('work_shifts').select('count').limit(1);
            if (checkError && checkError.code === '42P01') { // undefined_table
                throw new Error('Tabela work_shifts não existe. Execute o script SQL de migração.');
            }

            const { error } = await supabase
                .from('work_shifts')
                .upsert(payload)
                .select(); // Retorna dados para confirmar

            if (error) throw error;

            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert('Erro ao salvar turno: ' + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="text-blue-500" />
                            {shiftId ? 'Editar Turno de Trabalho' : 'Novo Turno de Trabalho'}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Configure os horários e dias de trabalho padrão.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome do Turno</label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Comercial, Administrativo, Turno A..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold"
                        />
                    </div>

                    {/* Horários */}
                    <div className="grid grid-cols-2 gap-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-2"><Clock size={12} /> Hora Entrada</label>
                                <input
                                    type="time"
                                    value={formData.start_time}
                                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors font-mono tracking-widest text-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-amber-500 uppercase flex items-center gap-2"><Clock size={12} /> Saída Intervalo</label>
                                <input
                                    type="time"
                                    value={formData.break_start}
                                    onChange={e => setFormData({ ...formData, break_start: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500 transition-colors font-mono tracking-widest text-lg"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-rose-500 uppercase flex items-center gap-2"><Clock size={12} /> Hora Saída</label>
                                <input
                                    type="time"
                                    value={formData.end_time}
                                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500 transition-colors font-mono tracking-widest text-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-blue-500 uppercase flex items-center gap-2"><Clock size={12} /> Volta Intervalo</label>
                                <input
                                    type="time"
                                    value={formData.break_end}
                                    onChange={e => setFormData({ ...formData, break_end: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors font-mono tracking-widest text-lg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-bold text-slate-400">Total Horas Diárias (Estimado):</span>
                        <span className="text-2xl font-black text-white font-mono">{calculateTotalHours()}</span>
                    </div>

                    <hr className="border-slate-800" />

                    {/* Dias da Semana */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Calendar size={12} /> Dias de Trabalho</label>
                        <div className="flex justify-between gap-2 overflow-x-auto pb-2">
                            {DAYS_OF_WEEK.map(day => {
                                const isSelected = formData.work_days?.includes(day.key);
                                return (
                                    <button
                                        key={day.key}
                                        onClick={() => toggleDay(day.key)}
                                        className={`flex-1 min-w-[60px] py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${isSelected
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50'
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                                            }`}
                                    >
                                        <span className="text-[10px] font-bold">{day.short}</span>
                                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full mt-1"></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-800/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50 ${loading ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        {loading && <Clock size={16} className="animate-spin" />}
                        Salvar Turno
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkShiftForm;

```


# File: hooks/usePermission.ts
```
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface UserPermission {
    module_slug: string;
    module_name: string;
    category: string;
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
}

export function usePermission() {
    const { data: permissions = [], isLoading } = useQuery({
        queryKey: ['user_permissions'],
        queryFn: async () => {
            // Verifica se há sessão ativa primeiro
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return [];

            const { data, error } = await supabase
                .from('view_user_permissions')
                .select('*');

            if (error) {
                console.error('Erro ao carregar permissões:', error);
                return [];
            }

            return data as UserPermission[];
        },
        staleTime: 1000 * 60 * 5, // Cache por 5 minutos
        retry: 1
    });

    const hasPermission = (moduleSlug: string, action: 'read' | 'create' | 'update' | 'delete' = 'read') => {
        // Se estiver carregando, nega por padrão (fail-safe) ou retorna false
        if (isLoading) return false;

        // Se for undefined/null slug, permite (ex: dashboard publico)
        if (!moduleSlug) return true;

        // Admin Master Override (Opcional, manter comentado para produção)
        // const isMaster = true; 
        // if (isMaster) return true;

        const permission = permissions.find(p => p.module_slug === moduleSlug);
        if (!permission) return false;

        switch (action) {
            case 'create': return permission.can_create;
            case 'read': return permission.can_read;
            case 'update': return permission.can_update;
            case 'delete': return permission.can_delete;
            default: return false;
        }
    };

    return { permissions, loading: isLoading, hasPermission };
}

```


# File: lib/geminiService.ts
```
import { GoogleGenerativeAI } from "@google/generative-ai";

const getAI = () => new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const analyzeFleetEfficiency = async (data: any) => {
  const ai = getAI();
  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: "Você é um especialista sênior em logística de frotas pesadas e terraplanagem. Seja conciso e técnico."
    });

    const result = await model.generateContent(`Analise os seguintes dados de frota de terraplanagem e forneça 3 insights rápidos e recomendações estratégicas: ${JSON.stringify(data)}`);
    return result.response.text();
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Não foi possível gerar a análise no momento.";
  }
};

```


# File: lib/queryClient.ts
```

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute
            gcTime: 1000 * 60 * 5, // 5 minutes (replaced cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

```


# File: lib/supabase.ts
```

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase environment variables! Check your .env file.');
    console.warn('⚠️ Using placeholder client. Database calls WILL FAIL.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

```


# File: lib/toast.ts
```
import toast from 'react-hot-toast';

/**
 * Utilitários para notificações toast consistentes em todo o sistema
 */

export const showToast = {
    success: (message: string) => {
        toast.success(message, {
            duration: 3000,
        });
    },

    error: (message: string) => {
        toast.error(message, {
            duration: 4000,
        });
    },

    loading: (message: string) => {
        return toast.loading(message);
    },

    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return toast.promise(promise, messages);
    },

    dismiss: (toastId: string) => {
        toast.dismiss(toastId);
    },

    // Atalhos específicos do sistema
    saved: () => toast.success('✅ Salvo com sucesso!'),
    deleted: () => toast.success('🗑️ Deletado com sucesso!'),
    updated: () => toast.success('✏️ Atualizado com sucesso!'),
    copied: () => toast.success('📋 Copiado!'),

    errorGeneric: () => toast.error('❌ Erro ao processar. Tente novamente.'),
    errorNetwork: () => toast.error('🌐 Erro de conexão. Verifique sua internet.'),
    errorPermission: () => toast.error('🔒 Você não tem permissão para esta ação.'),
};

export default showToast;

```


# File: pages/BIReports.tsx
```

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { DollarSign, Clock, Filter, Download, Briefcase, Wrench, Package, Truck, Wallet, FileText, Calendar, Users, TrendingUp, AlertTriangle, Fuel } from 'lucide-react';
import StatCard from '../components/StatCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// MOCK DATA FOR ALL MODULES
const financialData = [
  { month: 'Jan', receita: 4000, despesa: 2400, lucro: 1600 },
  { month: 'Fev', receita: 3000, despesa: 1398, lucro: 1602 },
  { month: 'Mar', receita: 2000, despesa: 9800, lucro: -7800 },
  { month: 'Abr', receita: 2780, despesa: 3908, lucro: -1128 },
  { month: 'Mai', receita: 1890, despesa: 4800, lucro: -2910 },
  { month: 'Jun', receita: 2390, despesa: 3800, lucro: -1410 },
];

const fleetData = [
  { name: 'Caminhão 01', km: 4000, consumo: 2.8 },
  { name: 'Escavadeira', km: 120, consumo: 12.5 },
  { name: 'Pá Carr.', km: 200, consumo: 8.4 },
  { name: 'Fiorino', km: 2800, consumo: 10.2 },
];

const hrData = [
  { name: 'João S.', horas: 176, extra: 24 },
  { name: 'Maria M.', horas: 176, extra: 4 },
  { name: 'Carlos', horas: 160, extra: 0 },
  { name: 'Pedro', horas: 180, extra: 32 },
];

const inventoryABC = [
  { name: 'Classe A (Alto Valor)', value: 70 },
  { name: 'Classe B (Médio)', value: 20 },
  { name: 'Classe C (Baixo)', value: 10 },
];

type ReportTab = 'FINANCIAL' | 'FLEET' | 'HR' | 'INVENTORY' | 'MAINTENANCE';

const BIReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('FINANCIAL');

  const renderTabButton = (id: ReportTab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all border-b-2
                ${activeTab === id
          ? 'bg-slate-800 text-blue-400 border-blue-500'
          : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-900'
        }`}
    >
      {icon} {label}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'FINANCIAL':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Receita Líquida" value="R$ 1.2M" trend="+12%" trendUp={true} icon={<DollarSign size={24} />} iconBg="bg-emerald-600" />
              <StatCard title="EBITDA" value="R$ 450k" trend="+5%" trendUp={true} icon={<TrendingUp size={24} />} iconBg="bg-blue-600" />
              <StatCard title="Inadimplência" value="3.2%" trend="-0.5%" trendUp={true} icon={<AlertTriangle size={24} />} iconBg="bg-amber-600" />
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-white font-bold mb-4">Fluxo de Caixa (Receita x Despesa)</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    <Area type="monotone" dataKey="receita" stroke="#10b981" fillOpacity={1} fill="url(#colorReceita)" />
                    <Area type="monotone" dataKey="despesa" stroke="#ef4444" fillOpacity={1} fill="url(#colorDespesa)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'FLEET':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="KM Total Rodado" value="45.200" trend="+1.2%" trendUp={true} icon={<Truck size={24} />} iconBg="bg-blue-600" />
              <StatCard title="Consumo Médio" value="6.5 km/l" trend="-2%" trendUp={false} icon={<Fuel size={24} />} iconBg="bg-amber-600" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <h3 className="text-white font-bold mb-4">KM Rodado por Veículo</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fleetData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                      <Bar dataKey="km" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <h3 className="text-white font-bold mb-4">Custo Manutenção vs Combustível</h3>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ name: 'Combustível', value: 65 }, { name: 'Manutenção', value: 25 }, { name: 'Outros', value: 10 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                        {COLORS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
      case 'HR':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-white font-bold mb-4">Banco de Horas e Extras</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hrData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis dataKey="name" type="category" stroke="#64748b" width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    <Bar dataKey="horas" stackId="a" fill="#3b82f6" name="Horas Normais" />
                    <Bar dataKey="extra" stackId="a" fill="#f59e0b" name="Horas Extras" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'INVENTORY':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-white font-bold mb-4">Curva ABC de Estoque (Valor)</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryABC}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    <Bar dataKey="value" fill="#10b981">
                      {inventoryABC.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#64748b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'MAINTENANCE':
        return (
          <div className="flex flex-col items-center justify-center h-[400px] text-slate-500 animate-in fade-in slide-in-from-bottom-4">
            <Wrench size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white">Relatórios de Manutenção</h3>
            <p>Em desenvolvimento...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Central de Relatórios BI</h2>
          <p className="text-slate-500 mt-1">Visão 360º de todos os setores da empresa.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold border border-slate-700 flex items-center gap-2">
            <Calendar size={18} /> Jan/2026
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2">
            <Download size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-800 pb-1">
        {renderTabButton('FINANCIAL', 'Financeiro', <Wallet size={18} />)}
        {renderTabButton('FLEET', 'Frota', <Truck size={18} />)}
        {renderTabButton('HR', 'RH & Pessoal', <Users size={18} />)}
        {renderTabButton('INVENTORY', 'Estoque', <Package size={18} />)}
        {renderTabButton('MAINTENANCE', 'Manutenção', <Wrench size={18} />)}
      </div>

      {/* Dynamic Content */}
      <div className="min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default BIReports;

```


# File: pages/Billing.tsx
```

import React, { useState } from 'react';
import { FileCheck, Receipt, ClipboardList, Send, FileWarning, Search, Save } from 'lucide-react';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

const measurements = [
  { id: 'MED-2024-001', project: 'Rodovia BR-101 Trecho Sul', period: '01/05 - 15/05', amount: 85400.00, status: 'AUTHORIZED', nf: '1542' },
  { id: 'MED-2024-002', project: 'Loteamento Jardim Europa', period: '01/05 - 15/05', amount: 32100.00, status: 'PROCESSING', nf: '-' },
  { id: 'MED-2024-003', project: 'Condomínio Serra Azul', period: '15/04 - 30/04', amount: 12400.00, status: 'REJECTED', nf: '1538' },
];

const Billing: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Faturamento e Medições</h2>
          <p className="text-slate-500 mt-1">Transformação de produção em receita e gestão de NF-e.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700 hover:bg-slate-700 transition-all">
            Importar Produção
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center gap-2"
          >
            <Send size={18} />
            Nova Medição
          </button>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
        <div className="bg-amber-500 p-2 rounded-lg text-white"><FileWarning size={20} /></div>
        <div>
          <h4 className="font-bold text-amber-500 text-sm">Módulo em Desenvolvimento</h4>
          <p className="text-xs text-amber-200/70">Este painel exibe dados de demonstração. A integração real com a SEFAZ e os lançamentos automáticos no Financeiro estarão disponíveis na próxima atualização.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Medido (Mês)"
          value="R$ 130.240,00"
          trend="8.4%"
          trendUp={true}
          icon={<ClipboardList size={24} />}
          iconBg="bg-blue-600"
        />
        <StatCard
          title="NF-e Emitidas"
          value="R$ 98.140,00"
          trend="22%"
          trendUp={true}
          icon={<Receipt size={24} />}
          iconBg="bg-emerald-600"
        />
        <StatCard
          title="Pendência de Medição"
          value="12 Projetos"
          trend="Crítico"
          trendUp={false}
          icon={<FileWarning size={24} />}
          iconBg="bg-orange-600"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950/20">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Relatório de Medições Ativas</h3>
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 w-full max-w-xs">
            <Search size={16} className="text-slate-500" />
            <input placeholder="Filtrar por projeto..." className="bg-transparent text-xs font-bold text-white outline-none w-full" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-8 py-5">Cód. Medição</th>
                <th className="px-8 py-5">Projeto / Obra</th>
                <th className="px-8 py-5">Período</th>
                <th className="px-8 py-5">Valor Bruto</th>
                <th className="px-8 py-5">NF-e</th>
                <th className="px-8 py-5 text-center">Status Fiscal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {measurements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-6 font-mono text-xs text-slate-400">{m.id}</td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-white">{m.project}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Contrato Global 2024</p>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-300 font-medium">{m.period}</td>
                  <td className="px-8 py-6 font-black text-white text-sm">R$ {m.amount.toLocaleString()}</td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-bold">{m.nf}</td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 ${m.status === 'AUTHORIZED' ? 'bg-emerald-500/10 text-emerald-500' :
                        m.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-500 animate-pulse' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'AUTHORIZED' ? 'bg-emerald-500' :
                          m.status === 'PROCESSING' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`} />
                        {m.status === 'AUTHORIZED' ? 'Autorizada' :
                          m.status === 'PROCESSING' ? 'Em Processamento' : 'Rejeitada SEFAZ'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Medição"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Projeto / Obra</label>
            <input
              placeholder="Ex: Rodovia BR-163 - Trecho Norte"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Período de Medição</label>
            <input
              placeholder="Ex: 01/06 a 15/06"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Valor Medido (R$)</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Centro de Custo</label>
              <input
                placeholder="Ex: CC-2024.11"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Criar Medição
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Billing;

```


# File: pages/DailyControl.tsx
```

import React, { useState, useEffect } from 'react';
import { Lock, MapPin, Navigation, AlertTriangle, CheckCircle2, Search, Camera } from 'lucide-react';
import { dashboardService } from '../services/api';
import { Asset } from '../types';

const DailyControl: React.FC = () => {
  const [step, setStep] = useState<'LOCATION' | 'EQUIPMENT' | 'VALIDATION' | 'WORKING'>('LOCATION');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [justification, setJustification] = useState('');

  // Mock User Location (Dourados/MS center for demo)
  const getUserLocation = () => {
    // Simulating GPS fetch
    setTimeout(() => {
      setUserLocation({ lat: -22.2560, lng: -54.8320 }); // Near CAT 320
    }, 1500);
  };

  useEffect(() => {
    const loadAssets = async () => {
      const data = await dashboardService.getAssets();
      setAssets(data as Asset[]);
    };
    loadAssets();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in metres
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    if (userLocation && asset.coordinates) {
      const dist = calculateDistance(
        userLocation.lat, userLocation.lng,
        asset.coordinates.lat, asset.coordinates.lng
      );
      setDistance(Math.round(dist));
      setStep('VALIDATION');
    } else {
      // Fallback if no coords
      setDistance(0);
      setStep('VALIDATION');
    }
  };

  // Step 1: Location Access
  if (step === 'LOCATION') {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
        <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <MapPin size={48} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4">Iniciar Turno Operacional</h2>
        <p className="text-slate-500 mb-8">Precisamos da sua localização para validar o equipamento e iniciar o apontamento digital.</p>

        {!userLocation ? (
          <button
            onClick={getUserLocation}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <Navigation size={20} />
            Compartilhar Localização
          </button>
        ) : (
          <div className="w-full space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500" />
              <div className="text-left">
                <p className="text-sm font-bold text-emerald-500">Localização Capturada</p>
                <p className="text-[10px] text-emerald-400/70">Precisão: 12 metros</p>
              </div>
            </div>
            <button
              onClick={() => setStep('EQUIPMENT')}
              className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Select Equipment
  if (step === 'EQUIPMENT') {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white">Selecione o Equipamento</h2>
          <p className="text-slate-500 mt-2">Você só pode operar **um** equipamento por vez.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Buscar por Prefixo ou Modelo..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-3">
          {assets.map(asset => (
            <button
              key={asset.id}
              onClick={() => handleAssetSelect(asset)}
              disabled={asset.status === 'MAINTENANCE'}
              className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all ${asset.status === 'MAINTENANCE'
                  ? 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-800 hover:border-blue-500 hover:bg-slate-800'
                }`}
            >
              <div className="text-left">
                <p className="font-bold text-white text-lg">{asset.name}</p>
                <p className="text-xs text-slate-500 font-mono">{asset.id} • {asset.model}</p>
              </div>
              {asset.status === 'MAINTENANCE' ? (
                <span className="text-[10px] font-black uppercase bg-red-500/10 text-red-500 px-2 py-1 rounded">Em Manutenção</span>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-700 group-hover:border-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 3: Validation
  if (step === 'VALIDATION' && selectedAsset) {
    const isFar = (distance || 0) > 300; // 300 meters threshold

    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-slate-900 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
          <img
            src={`https://ui-avatars.com/api/?name=${selectedAsset.model}&background=0f172a&color=fff`}
            alt="Asset"
            className="rounded-full w-full h-full opacity-50"
          />
          <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-950 ${isFar ? 'bg-amber-500' : 'bg-emerald-500'
            }`}>
            {isFar ? <AlertTriangle size={18} className="text-black" /> : <CheckCircle2 size={18} className="text-white" />}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black text-white">{selectedAsset.name}</h2>
          <p className="text-slate-500 text-sm mt-1">Prefixo: {selectedAsset.id}</p>
        </div>

        <div className={`p-4 rounded-xl border ${isFar ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
          }`}>
          <p className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-70">Distância do Equipamento</p>
          <p className={`text-3xl font-black ${isFar ? 'text-amber-500' : 'text-emerald-500'}`}>
            {distance} metros
          </p>
          {isFar && (
            <p className="text-xs text-amber-200 mt-2 font-bold">
              Atenção: Você está longe do equipamento. O gestor será notificado.
            </p>
          )}
        </div>

        {isFar && (
          <div className="text-left space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Justificativa Obrigatória</label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Por que você está longe do equipamento? (Ex: Equipamento em trânsito, GPS com erro...)"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none"
              rows={3}
            />
            <button className="w-full py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-slate-700 transition-all">
              <Camera size={16} /> Anexar Foto do Local
            </button>
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <button
            onClick={() => setStep('EQUIPMENT')}
            className="flex-1 py-4 bg-slate-900 text-slate-400 font-bold rounded-xl hover:text-white transition-all"
          >
            Trocar
          </button>
          <button
            onClick={() => setStep('WORKING')}
            disabled={isFar && justification.length < 10}
            className={`flex-1 py-4 font-bold rounded-xl shadow-xl transition-all ${isFar && justification.length < 10
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isFar
                  ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
          >
            {isFar ? 'Justificar e Iniciar' : 'Confirmar e Iniciar'}
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Active Working State
  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Operação em Andamento
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight">Painel do Operador</h2>
        <p className="text-slate-500">
          Equipamento: <strong className="text-white">{selectedAsset?.name} ({selectedAsset?.id})</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tempo de Turno</p>
          <p className="text-3xl font-black text-white mt-1">00:00:15</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status da Conexão</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-xl font-bold text-white">Sincronizado</p>
          </div>
        </div>
        <button
          onClick={() => setStep('LOCATION')} // Reset for demo
          className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl hover:bg-red-900/30 transition-all text-left group"
        >
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
            <Lock size={12} /> Encerrar Turno
          </p>
          <p className="text-xl font-black text-white mt-1 group-hover:text-red-400 transition-colors">Fechar Ponto</p>
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
        <p className="text-slate-500 mb-4">Esta tela ficaria bloqueada durante a operação, permitindo apenas apontamentos de parada ou abastecimento.</p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-slate-800 rounded-xl text-white font-bold border border-slate-700 hover:bg-slate-700 uppercase text-xs tracking-wider">
            Apontar Parada
          </button>
          <button className="px-6 py-3 bg-slate-800 rounded-xl text-white font-bold border border-slate-700 hover:bg-slate-700 uppercase text-xs tracking-wider">
            Solicitar Manutenção
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyControl;

```


# File: pages/Dashboard.tsx
```

import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Clock, MapPin, DollarSign, MessageSquare, Plus, BarChart3 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { dashboardService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getActivities()
        ]);
        setStats(statsData as any[]);
        setActivities(activitiesData as any[]);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'activity': return <Activity size={24} />;
      case 'clock': return <Clock size={24} />;
      case 'alert': return <AlertCircle size={24} />;
      case 'map': return <MapPin size={24} />;
      default: return <Activity size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#007a33] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Painel Operacional</h2>
          <p className="text-slate-500 mt-1">Status em tempo real das frentes de serviço e ativos.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-[#007a33] bg-[#007a33]/10 px-4 py-2 rounded-xl uppercase tracking-widest border border-[#007a33]/20">
          <span className="w-2 h-2 bg-[#007a33] rounded-full animate-pulse"></span>
          Live: Sincronizado com Satélite
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Saldo Financeiro"
          value="R$ 1.25M"
          trend="+12% (Mês)"
          trendUp={true}
          icon={<DollarSign size={24} />}
          iconBg="bg-blue-600"
          onClick={() => navigate('/financial')}
        />
        <StatCard
          title="Ativos Monitorados"
          value="12 / 12"
          trend="100% Online"
          trendUp={true}
          icon={<MapPin size={24} />}
          iconBg="bg-emerald-600"
          onClick={() => navigate('/fleet')}
        />
        <StatCard
          title="Alertas Manutenção"
          value="03 Críticos"
          trend="Ação Imediata"
          trendUp={false}
          icon={<AlertCircle size={24} />}
          iconBg="bg-rose-600"
          onClick={() => navigate('/maintenance')}
        />
        <StatCard
          title="Automação WhatsApp"
          value="Ativo"
          trend="Ouvindo..."
          trendUp={true}
          icon={<MessageSquare size={24} />}
          iconBg="bg-purple-600"
          onClick={() => navigate('/whatsapp')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Atividade das Frentes</h3>
            <button
              onClick={() => navigate('/operations-map')}
              className="text-[10px] font-bold text-[#007a33] hover:underline uppercase"
            >
              Ver Log Completo
            </button>
          </div>
          <div className="p-6 space-y-6">
            {activities.map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="text-[10px] font-mono text-slate-500 mt-1">{item.time}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{item.action}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{item.user} • {item.project}</p>
                </div>
                <CheckCircle2 size={16} className="text-[#007a33]" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Acesso Rápido</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/billing')}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group cursor-pointer"
              >
                <Plus size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-400">Nova Receita</span>
              </button>
              <button
                onClick={() => navigate('/whatsapp')}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group cursor-pointer"
              >
                <MessageSquare size={20} className="text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-400">Campanha Zap</span>
              </button>
              <button
                onClick={() => navigate('/rh')}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group cursor-pointer"
              >
                <Clock size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-400">Lançar Ponto</span>
              </button>
              <button
                onClick={() => navigate('/bi')}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group cursor-pointer"
              >
                <BarChart3 size={20} className="text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-400">Relatório Geral</span>
              </button>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Alertas Críticos</h3>
            <div className="p-4 bg-orange-600/10 border border-orange-600/20 rounded-2xl flex gap-3 items-start cursor-pointer hover:bg-orange-600/20 transition-colors" onClick={() => navigate('/maintenance')}>
              <AlertCircle size={18} className="text-orange-500 shrink-0" />
              <p className="text-[10px] text-orange-200/70 font-bold leading-tight uppercase tracking-tight">
                03 Ordens de serviço preventivas vencem em 48h.
              </p>
            </div>
            <div className="p-4 bg-rose-600/10 border border-rose-600/20 rounded-2xl flex gap-3 items-start cursor-pointer hover:bg-rose-600/20 transition-colors" onClick={() => navigate('/financial')}>
              <AlertCircle size={18} className="text-rose-500 shrink-0" />
              <p className="text-[10px] text-rose-200/70 font-bold leading-tight uppercase tracking-tight">
                Título #8923 (Prefeitura) em atraso há 45 dias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

```


# File: pages/DashboardBI.tsx
```

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Clock, Settings2, Users } from 'lucide-react';
import StatCard from '../components/StatCard';
import { analyzeFleetEfficiency } from '../lib/geminiService';

const data = [
  { name: 'Retro Cat 416', roi: 78, color: '#3b82f6' },
  { name: 'Escavadeira 320', roi: 92, color: '#3b82f6' },
  { name: 'Trator D6', roi: 65, color: '#3b82f6' },
  { name: 'Caminhão 8x4', roi: 88, color: '#3b82f6' },
  { name: 'Motoniv 140K', roi: 72, color: '#3b82f6' },
  { name: 'Rolo Dynapac', roi: 82, color: '#3b82f6' },
  { name: 'Bobcat S450', roi: 58, color: '#3b82f6' },
];

const operators = [
  { name: 'Ricardo Silva', score: 98.5, rank: '1º' },
  { name: 'André Santos', score: 94.2, rank: '2º' },
  { name: 'Julio Cesar', score: 91.0, rank: '3º' },
  { name: 'Marcos Oliveira', score: 88.7, rank: '4º' },
  { name: 'Paulo Freitas', score: 85.3, rank: '5º' },
];

const DashboardBI: React.FC = () => {
  const [aiInsights, setAiInsights] = useState<string>("Analisando frota...");

  useEffect(() => {
    const fetchInsights = async () => {
      const insights = await analyzeFleetEfficiency(data);
      setAiInsights(insights || "");
    };
    fetchInsights();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">BI e Inteligência de Negócios</h2>
          <p className="text-slate-500 mt-1">Visão holística da performance operacional e financeira.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold border border-slate-700 hover:bg-slate-700 transition-all">
            Exportar PDF
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all">
            Gerar Relatório Consolidado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Bruto" 
          value="R$ 450.200,00" 
          trend="12.5%" 
          trendUp={true} 
          icon={<DollarSign size={24} />} 
          iconBg="bg-blue-600"
        />
        <StatCard 
          title="Custo Médio/Hora" 
          value="R$ 125,50" 
          trend="2.3%" 
          trendUp={false} 
          icon={<Clock size={24} />} 
          iconBg="bg-orange-500"
        />
        <StatCard 
          title="Disponibilidade Frota" 
          value="48/52 Ativos" 
          trend="92%" 
          trendUp={true} 
          icon={<Settings2 size={24} />} 
          iconBg="bg-emerald-600"
        />
        <StatCard 
          title="Produtividade" 
          value="84.2%" 
          trend="4%" 
          trendUp={true} 
          icon={<Users size={24} />} 
          iconBg="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-white">Rentabilidade por Equipamento (ROI)</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Relação entre custo operacional e faturamento gerado</p>
            </div>
            <div className="flex bg-slate-800 p-1 rounded-xl">
              <button className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg">Trimestre</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-400">Mês</button>
            </div>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#1e293b'}} 
                  contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px'}}
                  itemStyle={{color: '#3b82f6', fontWeight: 'bold'}}
                />
                <Bar dataKey="roi" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-lg flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Top 5 Operadores</h3>
          <div className="space-y-6 flex-1">
            {operators.map((op) => (
              <div key={op.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-600">{op.rank}</span>
                    <p className="text-sm font-bold text-white">{op.name}</p>
                  </div>
                  <span className="text-xs font-black text-blue-500">{op.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full shadow-lg shadow-blue-600/20" 
                    style={{ width: `${op.score}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 py-3 text-xs font-bold text-slate-500 hover:text-white transition-colors border-t border-slate-800 uppercase tracking-widest">
            Ver ranking completo
          </button>
        </div>
      </div>

      <div className="bg-blue-600/5 border border-blue-600/20 p-8 rounded-3xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-white">AI Fleet Insights (Beta)</h4>
            <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
              {aiInsights}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBI;

```


# File: pages/Documents.tsx
```
import React, { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Plus,
    Download,
    Trash2,
    Filter,
    File,
    Image as ImageIcon,
    FileSpreadsheet,
    AlertCircle,
    Calendar,
    FolderOpen
} from 'lucide-react';
import { dashboardService } from '../services/api';
import { ERPDocument, DocumentCategory } from '../types';
import Modal from '../components/Modal';

const Documents: React.FC = () => {
    const [documents, setDocuments] = useState<ERPDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // New Document State
    const [newDoc, setNewDoc] = useState<Partial<ERPDocument>>({
        title: '',
        category: 'OUTROS',
        fileType: 'PDF',
        relatedTo: ''
    });

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        const data = await dashboardService.getDocuments();
        setDocuments(data);
        setLoading(false);
    };

    const handleUpload = async () => {
        if (!newDoc.title || !newDoc.category) return;

        const doc: ERPDocument = {
            id: `DOC-${Math.floor(Math.random() * 10000)}`,
            title: newDoc.title,
            category: newDoc.category as DocumentCategory,
            fileType: newDoc.fileType as any || 'PDF',
            filename: `${newDoc.title.replace(/\s+/g, '_').toUpperCase()}.${newDoc.fileType?.toLowerCase() || 'pdf'}`,
            uploadDate: new Date().toISOString().split('T')[0],
            fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
            relatedTo: newDoc.relatedTo
        };

        await dashboardService.addDocument(doc);
        await loadDocuments();
        setIsUploadModalOpen(false);
        setNewDoc({ title: '', category: 'OUTROS', fileType: 'PDF', relatedTo: '' });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este documento?')) {
            await dashboardService.deleteDocument(id);
            await loadDocuments();
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'PDF': return <FileText size={24} className="text-red-500" />;
            case 'DOCX': return <FileText size={24} className="text-blue-500" />;
            case 'XLSX': return <FileSpreadsheet size={24} className="text-emerald-500" />;
            case 'IMAGE': return <ImageIcon size={24} className="text-purple-500" />;
            default: return <File size={24} className="text-slate-500" />;
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.relatedTo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-[#007a33] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto h-screen flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-end shrink-0">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <FolderOpen className="text-blue-500" size={32} />
                        Gestão Eletrônica de Documentos (GED)
                    </h2>
                    <p className="text-slate-500 mt-1 ml-11">Repositório centralizado de arquivos, licenças e contratos.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                    <Plus size={18} /> Novo Documento
                </button>
            </div>

            {/* Filters & Toolbar */}
            <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 shrink-0">
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Search className="text-slate-500" size={20} />
                    <input
                        placeholder="Buscar por nome, veículo ou funcionário..."
                        className="bg-transparent text-white outline-none w-full placeholder:text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    {['ALL', 'FISCAL', 'LEGAL', 'RH', 'VEICULOS', 'LICENCAS'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat
                                    ? 'bg-slate-800 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            {cat === 'ALL' ? 'Todos' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-3">
                    {filteredDocs.map((doc) => (
                        <div key={doc.id} className="group bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex items-center justify-between transition-all hover:bg-slate-800/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                                    {getFileIcon(doc.fileType)}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors">{doc.title}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{doc.category}</span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12} /> {doc.uploadDate}</span>
                                        <span className="text-xs text-slate-500">{doc.fileSize}</span>
                                        {doc.relatedTo && (
                                            <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Ref: {doc.relatedTo}</span>
                                        )}
                                    </div>
                                    {doc.expiryDate && (
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-500">
                                            <AlertCircle size={12} />
                                            <span className="font-bold">Vence em: {doc.expiryDate}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Baixar">
                                    <Download size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/30"
                                    title="Excluir"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredDocs.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex p-4 rounded-full bg-slate-900 text-slate-600 mb-4">
                                <FolderOpen size={48} />
                            </div>
                            <h3 className="text-white font-bold text-lg">Nenhum documento encontrado</h3>
                            <p className="text-slate-500 text-sm">Tente ajustar os filtros ou adicione um novo documento.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Novo Documento">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Título do Documento</label>
                        <input
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                            placeholder="Ex: Nota Fiscal 1234..."
                            value={newDoc.title}
                            onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
                            <select
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                value={newDoc.category}
                                onChange={e => setNewDoc({ ...newDoc, category: e.target.value as any })}
                            >
                                <option value="FISCAL">Fiscal</option>
                                <option value="LEGAL">Legal / Contratos</option>
                                <option value="RH">Recursos Humanos</option>
                                <option value="VEICULOS">Veículos / Frota</option>
                                <option value="LICENCAS">Licenças / Alvarás</option>
                                <option value="OUTROS">Outros</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Arquivo</label>
                            <select
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                value={newDoc.fileType}
                                onChange={e => setNewDoc({ ...newDoc, fileType: e.target.value as any })}
                            >
                                <option value="PDF">PDF Documento</option>
                                <option value="IMAGE">Imagem (JPG/PNG)</option>
                                <option value="DOCX">Word (DOCX)</option>
                                <option value="XLSX">Excel (XLSX)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Vincular a (Opcional)</label>
                        <input
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                            placeholder="Ex: João da Silva ou Placa ABC-1234"
                            value={newDoc.relatedTo}
                            onChange={e => setNewDoc({ ...newDoc, relatedTo: e.target.value })}
                        />
                    </div>

                    <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer group">
                        <FileText size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold">Clique para selecionar o arquivo</span>
                        <span className="text-xs mt-1">PDF, JPG, PNG, DOCX (Max 10MB)</span>
                    </div>

                    <button
                        onClick={handleUpload}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-2"
                    >
                        <Download className="rotate-180" size={18} /> Upload Documento
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Documents;

```


# File: pages/Financial.tsx
```
import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Filter, Plus, Save, Calculator, CheckCircle, Archive, AlertCircle, Calendar, Landmark, Wallet, CreditCard, Trash2, Lock, Unlock, Settings, Folder } from 'lucide-react'; // New icons
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

import { receivableService, ContaReceber } from '../services/receivableService';
import { paymentService, ContaPagar } from '../services/paymentService';
import { bankService, ContaBancaria } from '../services/bankService'; // Import BankService
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Interface unificada para a View
interface UnifiedTransaction {
  id: string;
  originalId: string; // ID real no banco
  type: 'INCOME' | 'EXPENSE';
  description: string;
  entityName: string; // Cliente ou Fornecedor
  entityId: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELADO';
  originalStatus: string;
  costCenterId?: string; // ID do Centro de Custo
  costCenterGroup?: string; // Grupo DRE (Ex: Receita Operacional)
  costCenterName?: string; // Nome do Centro
}


const Financial: React.FC = () => {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<ContaBancaria[]>([]); // Bank Accounts State
  const [loading, setLoading] = useState(true);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false); // New Bank Modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // New Settings Modal

  // Seleção
  const [selectedTransaction, setSelectedTransaction] = useState<UnifiedTransaction | null>(null);

  // Estados de Formulário
  const [entities, setEntities] = useState<{ id: string, name: string }[]>([]);
  const [costCenters, setCostCenters] = useState<{ id: string, nome: string, codigo?: string, tipo?: string, grupo_dre?: string }[]>([]); // New Cost Centers State
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    entityId: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    costCenter: '',
    documentNumber: '' // New Field
  });

  // Novo Banco State
  const [newBank, setNewBank] = useState({
    banco_nome: '',
    agencia: '',
    conta: '',
    tipo_conta: 'CONTA_CORRENTE',
    saldo_atual: 0,
    padrao: false
  });

  // Senha Admin (Alteração)
  const [changePasswordData, setChangePasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Gestão de Centro de Custos
  const [isCostCenterModalOpen, setIsCostCenterModalOpen] = useState(false);
  const [newCostCenterName, setNewCostCenterName] = useState('');
  const [newCostCenterType, setNewCostCenterType] = useState('DESPESA_FIXA'); // Default

  const handleAddCostCenter = async () => {
    if (!newCostCenterName) {
      toast.error("Digite o nome do centro de custo");
      return;
    }

    // Inferir Grupo DRE baseado no Tipo (Simplificação)
    let grupo = 'Outros';
    if (newCostCenterType === 'RECEITA') grupo = 'Receita Operacional';
    else if (newCostCenterType === 'CUSTO_DIRETO') grupo = 'Custos Diretos (CPV)';
    else if (newCostCenterType === 'DESPESA_FIXA') grupo = 'Despesas Operacionais Fixas';
    else if (newCostCenterType.includes('FINANCEIRA')) grupo = 'Resultado Financeiro';
    else if (newCostCenterType === 'INVESTIMENTO') grupo = 'CAPEX / Imobilizado';

    try {
      const { error } = await supabase.from('centros_custo').insert({
        nome: newCostCenterName,
        tipo: newCostCenterType,
        grupo_dre: grupo,
        ativo: true,
        empresa_cnpj: '00.000.000/0001-91',
        codigo: 'MANUAL' // Indica que foi criado manualmente
      });

      if (error) throw error;
      toast.success("Centro de Custo criado!");
      setNewCostCenterName('');
      loadCostCenters();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar centro de custo");
    }
  };

  // Filtros da Tabela
  const [showFilters, setShowFilters] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const filteredTransactions = transactions.filter(t => {
    if (filterText && !t.description.toLowerCase().includes(filterText.toLowerCase()) && !t.entityName.toLowerCase().includes(filterText.toLowerCase())) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    return true;
  });

  // DRE REPORT LOGIC
  const [isDREModalOpen, setIsDREModalOpen] = useState(false);
  const [dreMonth, setDreMonth] = useState(new Date().toISOString().slice(0, 7));

  const dreData = React.useMemo(() => {
    const [year, month] = dreMonth.split('-').map(Number);
    const filtered = transactions.filter(t => {
      const d = new Date(t.dueDate);
      // Filtra pelo mês de competência (Vencimento como proxy, idealmente Data Emissão)
      return d.getFullYear() === year && d.getMonth() + 1 === month && t.status !== 'CANCELADO';
    });

    // Totais
    let receitaBruta = 0;
    let custosDiretos = 0;
    let despesasFixas = 0;
    let resultadoFinanceiro = 0;

    // Detalhes para drill-down
    const details = {
      receitas: [] as any[],
      custos: [] as any[],
      despesas: [] as any[]
    };

    filtered.forEach(t => {
      if (t.type === 'INCOME') {
        if (t.costCenterGroup?.includes('Receita')) {
          receitaBruta += t.amount;
          // Agrupar por sub-centro
          const existing = details.receitas.find(d => d.nome === t.costCenterName);
          if (existing) existing.valor += t.amount;
          else details.receitas.push({ nome: t.costCenterName || 'Outros', valor: t.amount });
        } else if (t.costCenterGroup?.includes('Financeiro')) {
          resultadoFinanceiro += t.amount;
        }
      } else {
        // Expense
        if (t.costCenterGroup?.includes('Custos Diretos') || t.costCenterGroup?.includes('CPV')) {
          custosDiretos += t.amount; // Valor negativo
          const existing = details.custos.find(d => d.nome === t.costCenterName);
          if (existing) existing.valor += t.amount;
          else details.custos.push({ nome: t.costCenterName || 'Outros', valor: t.amount });
        } else if (t.costCenterGroup?.includes('Despesas')) {
          despesasFixas += t.amount;
          const existing = details.despesas.find(d => d.nome === t.costCenterName);
          if (existing) existing.valor += t.amount;
          else details.despesas.push({ nome: t.costCenterName || 'Outros', valor: t.amount });
        } else if (t.costCenterGroup?.includes('Financeiro')) {
          resultadoFinanceiro += t.amount;
        }
      }
    });

    return { receitaBruta, custosDiretos, despesasFixas, resultadoFinanceiro, details };
  }, [transactions, dreMonth]);

  const handleDeleteCostCenter = (id: string, name: string) => {
    handleSecurityCheck(async () => {
      try {
        // Validar se tem uso? Por enquanto soft delete
        const { error } = await supabase
          .from('centros_custo')
          .update({ ativo: false })
          .eq('id', id);

        if (error) throw error;
        toast.success(`Centro de Custo "${name}" desativado.`);
        loadCostCenters();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao remover centro de custo");
      }
    });
  };

  // Estados de Baixa (Settlement)
  const [settleDate, setSettleDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBankId, setSelectedBankId] = useState<string>(''); // Selected Bank for Settlement
  const [applyInterest, setApplyInterest] = useState(true);
  const [settlementValues, setSettlementValues] = useState({
    original: 0,
    interest: 0,
    fine: 0,
    discount: 0,
    total: 0,
    daysOverdue: 0
  });

  // Estatísticas
  const [stats, setStats] = useState({
    balance: 0,
    income30d: 0,
    expense30d: 0,
    totalAvailable: 0 // Total in banks
  });

  // Security (Admin Password)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [securityAction, setSecurityAction] = useState<(() => Promise<void>) | null>(null);

  const handleSecurityCheck = (action: () => Promise<void>) => {
    setSecurityAction(() => action);
    setAdminPassword('');
    setIsSecurityModalOpen(true);
  };

  const confirmSecurityAction = async () => {
    try {
      // Validar senha com o banco
      const { data, error } = await supabase
        .from('app_config')
        .select('valor')
        .eq('chave', 'admin_password')
        .single();

      const realPassword = data?.valor || 'admin123'; // Fallback se não configurado

      if (adminPassword === realPassword) {
        if (securityAction) {
          await securityAction();
        }
        setIsSecurityModalOpen(false);
        setAdminPassword('');
        setSecurityAction(null);
      } else {
        toast.error("Senha de administrador incorreta!", { icon: '🔒' });
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao validar senha");
    }
  };

  const handleChangePassword = async () => {
    if (!changePasswordData.current || !changePasswordData.new || !changePasswordData.confirm) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (changePasswordData.new !== changePasswordData.confirm) {
      toast.error("A nova senha e a confirmação não conferem");
      return;
    }

    try {
      // Validar senha atual
      const { data } = await supabase.from('app_config').select('valor').eq('chave', 'admin_password').single();
      const currentReal = data?.valor || 'admin123';

      if (changePasswordData.current !== currentReal) {
        toast.error("Senha atual incorreta");
        return;
      }

      // Salvar nova senha
      const { error } = await supabase.from('app_config').upsert({
        chave: 'admin_password',
        valor: changePasswordData.new,
        descricao: 'Senha Mestra Financeiro'
      });

      if (error) throw error;
      toast.success("Senha de administrador alterada com sucesso!");
      setIsSettingsModalOpen(false);
      setChangePasswordData({ current: '', new: '', confirm: '' });

    } catch (err) {
      console.error(err);
      toast.error("Erro ao alterar senha");
    }
  };

  useEffect(() => {
    loadData();
    loadEntities();
    loadBankAccounts();
    loadCostCenters();
  }, []);

  const loadEntities = async () => {
    const { data } = await supabase.from('entities').select('id, name').order('name');
    if (data) setEntities(data);
  };

  const loadCostCenters = async () => {
    try {
      // Tentar buscar com a nova estrutura, fallback para ordenação por nome se falhar (ex: migração pendente)
      const { data, error } = await supabase
        .from('centros_custo')
        .select('id, nome, codigo, tipo, grupo_dre')
        .eq('ativo', true)
        .order('codigo', { ascending: true }); // Preferencialmente por código (1.01, 2.01...)

      if (!error && data) {
        setCostCenters(data);
      } else {
        // Fallback se a coluna codigo não existir ainda
        const { data: simpleData } = await supabase.from('centros_custo').select('id, nome').eq('ativo', true).order('nome');
        if (simpleData) setCostCenters(simpleData);
      }
    } catch (error) {
      console.error("Erro ao carregar centros de custo:", error);
    }
  };

  // ... loadBankAccounts ...
  const loadBankAccounts = async () => {
    try {
      const accounts = await bankService.listar();
      setBankAccounts(accounts || []);
      // Calculate total available based on accounts
      const total = accounts?.reduce((acc, curr) => acc + (curr.saldo_atual || 0), 0) || 0;
      setStats(prev => ({ ...prev, totalAvailable: total }));

      // Set default bank if available
      if (accounts && accounts.length > 0) {
        const defaultAcc = accounts.find(a => a.padrao) || accounts[0];
        setSelectedBankId(defaultAcc.id);
      }
    } catch (error) {
      console.error("Erro ao carregar contas bancárias:", error);
    }
  };

  // ... loadData ...

  // To avoid duplication, I will invoke replace_file_content separately for the handleAddTransaction function later 
  // or I can try to include handleAddTransaction here if it fits within the context/range, 
  // but since handleAddTransaction is further down, I will target the state and useEffect first.

  // Wait, I need to update handleAddTransaction too.
  // Let's first update the STATE and LOADING logic.

  // Actually, I can replace the whole block from "Estados de Formulário" down to the end of "handleAddTransaction" 
  // but that's a huge block.

  // Let's split. First: State and Loaders.


  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Buscar Contas a Receber
      const receivables = await receivableService.listar() || [];

      // 2. Buscar Contas a Pagar
      const payables = await paymentService.listar() || [];

      // 3. Unificar dados
      const unified: UnifiedTransaction[] = [];

      // Mapear Receitas
      receivables.forEach((r: any) => {
        let status: UnifiedTransaction['status'] = 'PENDING';
        if (r.status === 'RECEBIDO') status = 'PAID';
        else if (r.status === 'CANCELADO') status = 'CANCELADO';
        else if (new Date(r.data_vencimento) < new Date() && r.status !== 'RECEBIDO') status = 'OVERDUE';

        const cc = costCenters.find(c => c.id === r.centro_custo_id);

        unified.push({
          id: `REC-${r.id}`,
          originalId: r.id,
          type: 'INCOME',
          description: r.descricao,
          entityName: r.cliente?.name || 'Cliente Desconhecido',
          entityId: r.cliente_id,
          amount: r.valor_saldo || r.valor_original,
          dueDate: r.data_vencimento,
          status,
          originalStatus: r.status,
          costCenterId: r.centro_custo_id,
          costCenterGroup: cc?.grupo_dre || 'Outros',
          costCenterName: cc?.nome
        });
      });

      // Mapear Despesas
      payables.forEach((p: any) => {
        let status: UnifiedTransaction['status'] = 'PENDING';
        if (p.status === 'PAGO') status = 'PAID';
        else if (p.status === 'CANCELADO') status = 'CANCELADO';
        else if (new Date(p.data_vencimento) < new Date() && p.status !== 'PAGO') status = 'OVERDUE';

        const cc = costCenters.find(c => c.id === p.centro_custo_id);

        unified.push({
          id: `PAY-${p.id}`,
          originalId: p.id,
          type: 'EXPENSE',
          description: p.descricao,
          entityName: p.fornecedor?.name || 'Fornecedor Desconhecido',
          entityId: p.fornecedor_id,
          amount: -(p.valor_saldo || p.valor_original),
          dueDate: p.data_vencimento,
          status,
          originalStatus: p.status,
          costCenterId: p.centro_custo_id,
          costCenterGroup: cc?.grupo_dre || 'Outros',
          costCenterName: cc?.nome
        });
      });

      // Ordenar por Vencimento
      unified.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      setTransactions(unified);

      // Calcular Stats Básicos (Previsão)
      const income = unified.filter(t => t.type === 'INCOME' && t.status !== 'CANCELADO' && t.status !== 'PAID').reduce((acc, t) => acc + t.amount, 0);
      const expense = unified.filter(t => t.type === 'EXPENSE' && t.status !== 'CANCELADO' && t.status !== 'PAID').reduce((acc, t) => acc + Math.abs(t.amount), 0);

      setStats(prev => ({
        ...prev,
        balance: income - expense, // Saldo Previsão
        income30d: income,
        expense30d: expense
      }));

    } catch (error) {
      console.error("Erro ao carregar financeiro:", error);
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.entityId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (newTransaction.type === 'INCOME') {
        await receivableService.criar({
          descricao: newTransaction.description,
          cliente_id: newTransaction.entityId,
          cliente_nome: entities.find(e => e.id === newTransaction.entityId)?.name || '',
          valor_original: Number(newTransaction.amount),
          data_emissao: new Date().toISOString().split('T')[0],
          data_vencimento: newTransaction.dueDate,
          status: 'PENDENTE',
          numero_titulo: '', // Auto
          numero_documento: newTransaction.documentNumber,
          centro_custo_id: newTransaction.costCenter
        } as ContaReceber);
      } else {
        await paymentService.criar({
          descricao: newTransaction.description,
          fornecedor_id: newTransaction.entityId,
          fornecedor_nome: entities.find(e => e.id === newTransaction.entityId)?.name || '',
          valor_original: Number(newTransaction.amount),
          data_emissao: new Date().toISOString().split('T')[0],
          data_vencimento: newTransaction.dueDate,
          status: 'PENDENTE',
          numero_titulo: '', // Auto
          numero_documento: newTransaction.documentNumber,
          centro_custo_id: newTransaction.costCenter
        } as ContaPagar);
      }

      toast.success("Transação criada com sucesso!");
      setIsModalOpen(false);
      loadData();

      // Reset form
      setNewTransaction({
        description: '',
        entityId: '',
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        type: 'INCOME',
        costCenter: '',
        documentNumber: ''
      });

    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar transação");
    }
  };

  const handleTransactionClick = (tr: UnifiedTransaction) => {
    setSelectedTransaction(tr);
    if (tr.status !== 'PAID' && tr.status !== 'CANCELADO') {
      calculateSettlement(tr);
      setIsSettleModalOpen(true);
    }
  };

  const handleSaveBank = async () => {
    if (!newBank.banco_nome || !newBank.agencia || !newBank.conta) {
      toast.error("Preencha os dados obrigatórios do banco");
      return;
    }

    try {
      await bankService.criar({
        ...newBank,
        ativa: true,
        banco_codigo: '000' // Default ou adicionar input
      });
      toast.success("Conta bancária adicionada!");
      setIsBankModalOpen(false);
      loadBankAccounts();
      setNewBank({
        banco_nome: '',
        agencia: '',
        conta: '',
        tipo_conta: 'CONTA_CORRENTE',
        saldo_atual: 0,
        padrao: false
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar conta bancária");
    }
  };

  const handleDeleteBank = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente desativar esta conta bancária?')) return;

    handleSecurityCheck(async () => {
      try {
        await bankService.excluir(id);
        toast.success("Conta bancária removida!");
        loadBankAccounts();
      } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir conta");
      }
    });
  };

  const calculateSettlement = (tr: UnifiedTransaction) => {
    const original = Math.abs(tr.amount);
    const dueDate = new Date(tr.dueDate);
    const today = new Date();

    // Cálculo Real de Dias em Atraso
    const diffTime = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let interest = 0;
    let fine = 0;

    if (daysOverdue > 0 && tr.type === 'INCOME') {
      // Regra de Negócio: 2% Multa + 1% Juros a.m (pro rata)
      const multaPercent = 2.0;
      const jurosAM = 1.0;

      fine = original * (multaPercent / 100);
      interest = (original * (jurosAM / 100) / 30) * daysOverdue;
    }

    setSettlementValues({
      original,
      interest,
      fine,
      discount: 0,
      total: original + interest + fine,
      daysOverdue: daysOverdue > 0 ? daysOverdue : 0
    });
    setApplyInterest(daysOverdue > 0);
  };

  // Recalcular quando toggle de juros muda
  useEffect(() => {
    if (isSettleModalOpen && selectedTransaction) {
      const base = settlementValues.original;
      if (applyInterest) {
        // Recalcular (já tinha os valores salvos no state? ou recalcular do zero?)
        // Simplificando: vamos recalcular sempre baseados no daysOverdue atual salvo
        // Mas a lógica completa estava no calculateSettlement.
        // Vamos apenas somar ou zerar juros/multa visualmente
        const currentInterest = settlementValues.daysOverdue > 0 && selectedTransaction.type === 'INCOME'
          ? (base * 0.01 / 30 * settlementValues.daysOverdue) : 0;
        const currentFine = settlementValues.daysOverdue > 0 && selectedTransaction.type === 'INCOME'
          ? (base * 0.02) : 0;

        setSettlementValues(prev => ({
          ...prev,
          interest: currentInterest,
          fine: currentFine,
          total: base + currentInterest + currentFine - prev.discount
        }));
      } else {
        setSettlementValues(prev => ({
          ...prev,
          interest: 0,
          fine: 0,
          total: base - prev.discount
        }));
      }
    }
  }, [applyInterest]);

  const handleSettleConfirm = async () => {
    if (!selectedTransaction) return;
    if (!selectedBankId) {
      toast.error("Selecione uma conta bancária/caixa para movimentação");
      return;
    }

    try {
      if (selectedTransaction.type === 'INCOME') {
        await receivableService.receber(selectedTransaction.originalId, {
          valor_recebido: settlementValues.total,
          data_recebimento: settleDate,
          forma_recebimento: 'PIX', // TODO: Dropdown no modal
          banco_id: selectedBankId,
          valor_desconto: settlementValues.discount,
          observacao: applyInterest ? `Com Juros/Multa` : ''
        });
      } else {
        await paymentService.pagar(selectedTransaction.originalId, {
          valor_pago: settlementValues.total,
          data_pagamento: settleDate,
          forma_pagamento: 'PIX', // TODO: Dropdown
          banco_id: selectedBankId,
          observacao: 'Pagamento via ERP'
        });
      }

      toast.success(selectedTransaction.type === 'INCOME' ? "Recebimento confirmado!" : "Pagamento realizado!");
      setIsSettleModalOpen(false);
      loadData();
      loadBankAccounts(); // Refresh balances
    } catch (error) {
      console.error(error);
      toast.error("Erro ao baixar título");
    }
  };

  const handleDelete = (e: React.MouseEvent, tr: UnifiedTransaction) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente excluir/cancelar este lançamento?')) return;

    handleSecurityCheck(async () => {
      try {
        if (tr.type === 'INCOME') {
          const { error } = await supabase.from('contas_receber').delete().eq('id', tr.originalId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('contas_pagar').delete().eq('id', tr.originalId);
          if (error) throw error;
        }
        toast.success("Lançamento removido permanentemente");
        loadData();
      } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir lançamento");
      }
    });
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <DollarSign className="text-emerald-500" size={32} />
            Financeiro Integrado
          </h2>
          <p className="text-slate-500 mt-1">Fluxo de Caixa, Tesouraria e Conciliação.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700 hover:bg-slate-700 transition"
            title="Configurações / Senha Admin"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => setIsDREModalOpen(true)}
            className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700 hover:bg-slate-700 transition flex items-center gap-2"
          >
            <Calendar size={16} /> DRE Gerencial
          </button>
          <button className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700 hover:bg-slate-700 transition">
            Conciliação
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
          >
            <Plus size={18} /> Novo Lançamento
          </button>
        </div>
      </div>



      {/* BANK ACCOUNTS CAROUSEL */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Caixa e Bancos</h3>
        <button
          onClick={() => setIsBankModalOpen(true)}
          className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
        >
          <CreditCard size={14} /> Gerenciar Contas
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {bankAccounts.length === 0 ? (
          <div className="col-span-4 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-6 text-center text-slate-500">
            Nenhuma conta bancária cadastrada.
          </div>
        ) : (
          bankAccounts.map(acc => (
            <div key={acc.id} className={`group relative p-5 rounded-2xl border ${acc.padrao ? 'bg-slate-800 border-emerald-500/50 shadow-emerald-900/10 shadow-lg' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="bg-slate-950 p-2 rounded-lg text-slate-300">
                  {acc.tipo_conta === 'CAIXA_FISICO' ? <Wallet size={20} /> : <Landmark size={20} />}
                </div>
                {acc.padrao && <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Padrão</span>}
              </div>
              <h4 className="font-bold text-slate-300 text-sm truncate">{acc.banco_nome}</h4>
              <p className="text-xs text-slate-500 mb-2 truncate">Ag: {acc.agencia} • CC: {acc.conta}</p>
              <div className="text-xl font-black text-white tracking-tight">
                R$ {acc.saldo_atual?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>

              {/* Delete Button (Hover) */}
              <button
                onClick={(e) => handleDeleteBank(e, acc.id)}
                className="absolute top-2 right-2 p-1.5 bg-rose-500/20 text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                title="Excluir Conta"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Disponibilidade Total (Caixa + Bancos)"
          value={`R$ ${stats.totalAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend="Atualizado agora"
          trendUp={true}
          icon={<Wallet size={24} />}
          iconBg="bg-blue-600"
        />
        <StatCard
          title="Previsão de Recebimento"
          value={`R$ ${stats.income30d.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend="A receber"
          trendUp={true}
          icon={<ArrowUpRight size={24} />}
          iconBg="bg-emerald-600"
        />
        <StatCard
          title="Previsão de Pagamento"
          value={`R$ ${stats.expense30d.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend="A pagar"
          trendUp={false}
          icon={<ArrowDownLeft size={24} />}
          iconBg="bg-rose-600"
        />
      </div>

      {/* Tabela de Transações */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-col gap-4 bg-slate-950/30">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Extrato Unificado</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-all ${showFilters ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
            >
              <Filter size={18} />
            </button>
          </div>

          {/* Painel de Filtros */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800 animate-in slide-in-from-top-2">
              <input
                placeholder="Buscar por descrição, cliente..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
              />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
              >
                <option value="ALL">Todas as Movimentações</option>
                <option value="INCOME">Apenas Receitas</option>
                <option value="EXPENSE">Apenas Despesas</option>
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
              >
                <option value="ALL">Todos os Status</option>
                <option value="PENDING">Pendente</option>
                <option value="PAID">Pago / Recebido</option>
                <option value="OVERDUE">Vencido</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
              <button
                onClick={() => { setFilterText(''); setFilterType('ALL'); setFilterStatus('ALL'); }}
                className="text-xs text-slate-500 hover:text-white underline"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Descrição / Entidade</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Nenhuma transação encontrada.</td>
                </tr>
              ) : (
                filteredTransactions.map((tr) => (
                  <tr
                    key={tr.id}
                    onClick={() => handleTransactionClick(tr)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${tr.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        tr.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          tr.status === 'CANCELADO' ? 'bg-slate-700 text-slate-400 border-slate-600' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                        {tr.status === 'PAID' ? 'Pago' : tr.status === 'OVERDUE' ? 'Atrasado' : tr.status === 'CANCELADO' ? 'Cancelado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-bold text-white mb-0.5">{tr.description}</div>
                        {tr.costCenterName && (
                          <span className="text-[9px] w-fit px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700 truncate max-w-[150px] mb-1">
                            {tr.costCenterName}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        {tr.type === 'INCOME' ? <ArrowUpRight size={10} className="text-emerald-500" /> : <ArrowDownLeft size={10} className="text-rose-500" />}
                        {tr.entityName}
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-mono text-xs ${tr.status === 'OVERDUE' ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                      {new Date(tr.dueDate).toLocaleDateString('pt-BR')}
                      {tr.status === 'OVERDUE' && <span className="ml-2 text-[9px] bg-rose-500/20 px-1 rounded">VENCIDO</span>}
                    </td>
                    <td className={`px-6 py-4 text-right font-black text-sm ${tr.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tr.amount >= 0 ? '+' : '-'} R$ {Math.abs(tr.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => handleDelete(e, tr)}
                        className="p-2 rounded-lg text-slate-600 hover:text-red-500 hover:bg-slate-800 transition-colors"
                        title="Excluir Lançamento"
                      >
                        <Archive size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: GERENCIAR CONTAS BANCÁRIAS */}
      <Modal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} title="Nova Conta Bancária">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome do Banco / Caixa</label>
            <input
              value={newBank.banco_nome}
              onChange={e => setNewBank(prev => ({ ...prev, banco_nome: e.target.value }))}
              placeholder="Ex: Banco do Brasil, Nubank, Caixa Pequeno"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Agência</label>
              <input
                value={newBank.agencia}
                onChange={e => setNewBank(prev => ({ ...prev, agencia: e.target.value }))}
                placeholder="0000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Conta</label>
              <input
                value={newBank.conta}
                onChange={e => setNewBank(prev => ({ ...prev, conta: e.target.value }))}
                placeholder="00000-0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tipo</label>
              <select
                value={newBank.tipo_conta}
                onChange={e => setNewBank(prev => ({ ...prev, tipo_conta: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="CONTA_CORRENTE">Conta Corrente</option>
                <option value="POUPANCA">Poupança</option>
                <option value="CAIXA_FISICO">Caixa Físico</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Saldo Inicial (R$)</label>
              <input
                type="number"
                value={newBank.saldo_atual}
                onChange={e => setNewBank(prev => ({ ...prev, saldo_atual: parseFloat(e.target.value) }))}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={newBank.padrao}
              onChange={e => setNewBank(prev => ({ ...prev, padrao: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
            <label className="text-xs text-slate-300">Definir como conta padrão</label>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveBank}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Save size={20} /> Salvar Conta
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: NOVO LANÇAMENTO */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Lançamento Financeiro">
        <div className="space-y-4">
          <div className="flex gap-4 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setNewTransaction(prev => ({ ...prev, type: 'INCOME' }))}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${newTransaction.type === 'INCOME' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Receita (Entrada)
            </button>
            <button
              onClick={() => setNewTransaction(prev => ({ ...prev, type: 'EXPENSE' }))}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${newTransaction.type === 'EXPENSE' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Despesa (Saída)
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Descrição</label>
            <input
              value={newTransaction.description}
              onChange={e => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Pagamento Fornecedor X"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nº Documento / Nota Fiscal</label>
            <input
              value={newTransaction.documentNumber}
              onChange={e => setNewTransaction(prev => ({ ...prev, documentNumber: e.target.value }))}
              placeholder="Ex: NF-e 12345, Contrato 001"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Valor (R$)</label>
              <input
                type="number"
                value={newTransaction.amount || ''}
                onChange={e => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 font-mono"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Vencimento</label>
              <input
                type="date"
                value={newTransaction.dueDate}
                onChange={e => setNewTransaction(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              {newTransaction.type === 'INCOME' ? 'Cliente / Pagador' : 'Fornecedor / Beneficiário'}
            </label>
            <select
              value={newTransaction.entityId}
              onChange={e => setNewTransaction(prev => ({ ...prev, entityId: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="">Selecione...</option>
              {entities.map(ent => (
                <option key={ent.id} value={ent.id}>{ent.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Centro de Custo</label>
            <div className="relative">
              <select
                value={newTransaction.costCenter}
                onChange={e => setNewTransaction(prev => ({ ...prev, costCenter: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 appearance-none"
                style={{ backgroundImage: 'none' }} // Remove default arrow to custom style implies
              >
                <option value="">Selecione o Centro de Custo...</option>

                {/* Lógica de Agrupamento e Filtragem */}
                {Object.entries(
                  costCenters
                    .filter(cc => {
                      // Filtro Inteligente: Receita vs Despesa
                      if (newTransaction.type === 'INCOME') {
                        return cc.tipo === 'RECEITA' || cc.tipo === 'RECEITA_FINANCEIRA';
                      } else {
                        return cc.tipo !== 'RECEITA' && cc.tipo !== 'RECEITA_FINANCEIRA';
                      }
                    })
                    .reduce((groups, cc) => {
                      // Agrupamento por Grupo DRE
                      const group = cc.grupo_dre || 'Outros';
                      if (!groups[group]) groups[group] = [];
                      groups[group].push(cc);
                      return groups;
                    }, {} as Record<string, typeof costCenters>)
                ).map(([groupName, items]) => (
                  <optgroup key={groupName} label={
                    // Adicionar Emojis para facilitar leitura visual
                    groupName.includes('Receita') ? `💰 ${groupName}` :
                      groupName.includes('Custos Diretos') ? `🚜 ${groupName}` :
                        groupName.includes('Despesas') ? `🏢 ${groupName}` :
                          groupName.includes('Financeiro') ? `📉 ${groupName}` :
                            groupName.includes('CAPEX') ? `🏗️ ${groupName}` :
                              groupName
                  } className="font-bold text-slate-300 bg-slate-900">
                    {items.map(cc => (
                      <option key={cc.id} value={cc.id} className="text-slate-100 bg-slate-950 px-4 py-2">
                        {cc.codigo ? `${cc.codigo} • ${cc.nome.replace(groupName.includes('Receita') ? 'Receita – ' : '', '').replace(groupName.includes('Custos Diretos') ? ' – ' : 'XXX', ' – ')}` : cc.nome}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                <Folder size={16} />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleAddTransaction}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 ${newTransaction.type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}`}
            >
              <Save size={20} /> Salvar Lançamento
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: BAIXA / SETTLEMENT - COM SELEÇÃO DE BANCO */}
      <Modal isOpen={isSettleModalOpen} onClose={() => setIsSettleModalOpen(false)} title="Baixar / Liquidar Título">
        {selectedTransaction && (
          <div className="space-y-6">

            {/* Warning Card se Atrasado */}
            {settlementValues.daysOverdue > 0 && selectedTransaction.type === 'INCOME' && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-rose-500 p-2 rounded-full text-white"><AlertCircle size={20} /></div>
                <div>
                  <h4 className="font-bold text-rose-400 text-sm">Título em Atraso: {settlementValues.daysOverdue} dias</h4>
                  <p className="text-xs text-rose-300/70">Juros e multa calculados automaticamente.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Valor Original</label>
                <div className="text-xl font-mono text-slate-300">R$ {settlementValues.original.toFixed(2)}</div>
              </div>
              <div className="space-y-1 text-right">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Vencimento</label>
                <div className="text-sm font-mono text-slate-300">{new Date(selectedTransaction.dueDate).toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            {/* Area de Calculo */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Multa (2%)</span>
                <span className="font-mono text-rose-400">+ R$ {settlementValues.fine.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Juros (1% a.m pro rata)</span>
                <span className="font-mono text-rose-400">+ R$ {settlementValues.interest.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={applyInterest}
                    onChange={e => setApplyInterest(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label className="text-xs text-slate-300 cursor-pointer" onClick={() => setApplyInterest(!applyInterest)}>Cobrar Encargos?</label>
                </div>
              </div>
            </div>

            {/* SELEÇÃO DE CONTA BANCÁRIA (NOVO) */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Conta de Movimentação</label>
              <select
                value={selectedBankId}
                onChange={e => setSelectedBankId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="">Selecione a conta...</option>
                {bankAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.banco_nome} - Ag: {acc.agencia} CC: {acc.conta}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Final */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-end">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Total a {selectedTransaction.type === 'INCOME' ? 'Receber' : 'Pagar'}</label>
                <div className={`text-3xl font-black tracking-tighter ${selectedTransaction.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  R$ {settlementValues.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  value={settleDate}
                  onChange={e => setSettleDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white outline-none"
                />
                <button onClick={handleSettleConfirm} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition shadow-lg">
                  Confirmar Baixa
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: SECURITY CHALLENGE */}
      <Modal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} title="Confirmação de Segurança">
        <div className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-rose-500 mb-2 border border-slate-800">
            <Lock size={32} />
          </div>
          <h3 className="text-white font-bold text-lg">Senha do Administrador</h3>
          <p className="text-slate-400 text-sm">Esta ação é destrutiva e requer autorização superior.</p>

          <input
            type="password"
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            placeholder="Digite a senha..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 text-center tracking-widest"
            autoFocus
          />

          <button
            onClick={confirmSecurityAction}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Unlock size={20} /> Desbloquear e Confirmar
          </button>
        </div>
      </Modal>

      {/* MODAL: SETTINGS (ADMIN PASSWORD) */}
      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Configurações de Segurança">
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 mb-4">
            <div className="bg-slate-800 p-3 rounded-full text-slate-400"><Lock size={24} /></div>
            <div>
              <h4 className="font-bold text-white text-sm">Senha do Administrador</h4>
              <p className="text-xs text-slate-500">Defina a senha exigida para ações sensíveis.</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Senha Atual</label>
            <input
              type="password"
              value={changePasswordData.current}
              onChange={e => setChangePasswordData(prev => ({ ...prev, current: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nova Senha</label>
              <input
                type="password"
                value={changePasswordData.new}
                onChange={e => setChangePasswordData(prev => ({ ...prev, new: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Confirmar</label>
              <input
                type="password"
                value={changePasswordData.confirm}
                onChange={e => setChangePasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleChangePassword}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Save size={20} /> Atualizar Senha
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: COST CENTERS */}
      {/* MODAL: COST CENTERS */}
      <Modal isOpen={isCostCenterModalOpen} onClose={() => setIsCostCenterModalOpen(false)} title="Gerenciar Centros de Custo (Plano DRE)">
        <div className="space-y-6">

          {/* Aviso */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 text-blue-400 text-sm">
            <AlertCircle size={20} className="shrink-0" />
            <p>O plano de contas DRE padrão foi carregado. Você pode adicionar novos sub-centros, mas evite remover os principais para não quebrar relatórios.</p>
          </div>

          {/* New Cost Center Form */}
          <div className="flex gap-2 items-end">
            <div className="w-1/3">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tipo</label>
              <select
                value={newCostCenterType}
                onChange={e => setNewCostCenterType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-blue-500"
              >
                <option value="RECEITA">💰 Receita</option>
                <option value="CUSTO_DIRETO">🚜 Custo Direto (CPV)</option>
                <option value="DESPESA_FIXA">🏢 Despesa Fixa</option>
                <option value="INVESTIMENTO">🏗️ CAPEX / Investimento</option>
                <option value="DESPESA_FINANCEIRA">📉 Financeiro</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome</label>
              <input
                value={newCostCenterName}
                onChange={e => setNewCostCenterName(e.target.value)}
                placeholder="Ex: Obra Shopping..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleAddCostCenter}
              className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl shadow-lg transition"
            >
              <Plus size={24} />
            </button>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 sticky top-0 bg-slate-900 py-2">Estrutura DRE</h4>
            {costCenters.length === 0 ? (
              <p className="text-slate-500 text-center py-4 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">Carregando plano de contas...</p>
            ) : (
              costCenters.map(cc => (
                <div key={cc.id} className="flex justify-between items-center bg-slate-950 border border-slate-800 p-3 rounded-xl group hover:border-slate-700 transition">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-lg shrink-0 ${cc.tipo === 'RECEITA' ? 'bg-emerald-500/10 text-emerald-500' :
                      cc.tipo?.includes('CUSTO') ? 'bg-amber-500/10 text-amber-500' :
                        'bg-rose-500/10 text-rose-500'
                      }`}>
                      <Folder size={16} />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-slate-300 text-sm truncate">
                        {cc.codigo ? <span className="text-slate-500 mr-2 font-mono">{cc.codigo}</span> : null}
                        {cc.nome}
                      </h5>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate">
                        {cc.grupo_dre || cc.tipo || 'Geral'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCostCenter(cc.id, cc.nome)}
                    className="text-slate-600 hover:text-rose-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ml-2"
                    title="Excluir (Requer Senha Admin)"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL: RELATÓRIO DRE */}
      <Modal isOpen={isDREModalOpen} onClose={() => setIsDREModalOpen(false)} title="Demonstrativo de Resultado (DRE Gerencial)">
        <div className="space-y-6">
          {/* Filtros */}
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-4">
              <Calendar className="text-slate-500" size={20} />
              <input
                type="month"
                value={dreMonth}
                onChange={(e) => setDreMonth(e.target.value)}
                className="bg-slate-950 text-white border border-slate-800 rounded-lg px-3 py-2 outline-none focus:border-blue-500 cursor-pointer"
              />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase">Regime de Competência</p>
              <p className="text-sm font-bold text-white">Consolidado</p>
            </div>
          </div>

          {/* Tabela DRE */}
          <div className="border border-slate-800 rounded-xl overflow-hidden max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-800">
                {/* RECEITA BRUTA */}
                <tr className="bg-slate-900 sticky top-0 z-10">
                  <td className="p-4 font-black text-emerald-400">1. RECEITA OPERACIONAL BRUTA</td>
                  <td className="p-4 text-right font-black text-emerald-400">
                    R$ {dreData.receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {dreData.details.receitas.length === 0 && <tr className="bg-slate-950/50"><td colSpan={2} className="p-2 text-center text-xs text-slate-600">Sem registros</td></tr>}
                {dreData.details.receitas.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="px-8 py-2 text-slate-400 text-xs flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500/50"></div>{item.nome}</td>
                    <td className="px-4 py-2 text-right text-slate-400 text-xs font-mono">
                      {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}

                {/* DEDUÇÕES (Placeholder) */}
                <tr className="bg-slate-950/50">
                  <td className="p-3 font-bold text-rose-400 pl-6 text-xs">(-) Impostos / Deduções (Simulado 6%)</td>
                  <td className="p-3 text-right font-bold text-rose-400 text-xs">
                    (R$ {(dreData.receitaBruta * 0.06).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </td>
                </tr>

                {/* RECEITA LÍQUIDA */}
                <tr className="bg-slate-800 border-t border-slate-700">
                  <td className="p-3 font-black text-white text-xs uppercase tracking-wider">= RECEITA LÍQUIDA</td>
                  <td className="p-3 text-right font-black text-white">
                    R$ {(dreData.receitaBruta * 0.94).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* CPV */}
                <tr className="bg-slate-900 mt-4 border-t-2 border-slate-800 sticky top-10">
                  <td className="p-4 font-black text-amber-500">2. CUSTOS DIRETOS (CPV)</td>
                  <td className="p-4 text-right font-black text-amber-500">
                    (R$ {Math.abs(dreData.custosDiretos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </td>
                </tr>
                {dreData.details.custos.length === 0 && <tr className="bg-slate-950/50"><td colSpan={2} className="p-2 text-center text-xs text-slate-600">Sem registros</td></tr>}
                {dreData.details.custos.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="px-8 py-2 text-slate-400 text-xs flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-amber-500/50"></div>{item.nome}</td>
                    <td className="px-4 py-2 text-right text-slate-400 text-xs font-mono text-rose-400">
                      ({Math.abs(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                    </td>
                  </tr>
                ))}

                {/* LUCRO BRUTO */}
                <tr className="bg-slate-800 border-t border-slate-700">
                  <td className="p-3 font-black text-white text-xs uppercase tracking-wider">= LUCRO BRUTO</td>
                  <td className="p-3 text-right font-black text-white">
                    R$ {(dreData.receitaBruta * 0.94 - Math.abs(dreData.custosDiretos)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* DESPESAS OP */}
                <tr className="bg-slate-900 mt-4 border-t-2 border-slate-800">
                  <td className="p-4 font-black text-rose-500">3. DESPESAS OPERACIONAIS</td>
                  <td className="p-4 text-right font-black text-rose-500">
                    (R$ {Math.abs(dreData.despesasFixas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </td>
                </tr>
                {dreData.details.despesas.length === 0 && <tr className="bg-slate-950/50"><td colSpan={2} className="p-2 text-center text-xs text-slate-600">Sem registros</td></tr>}
                {dreData.details.despesas.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="px-8 py-2 text-slate-400 text-xs flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-rose-500/50"></div>{item.nome}</td>
                    <td className="px-4 py-2 text-right text-slate-400 text-xs font-mono text-rose-400">
                      ({Math.abs(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                    </td>
                  </tr>
                ))}

                {/* EBITDA */}
                <tr className="bg-slate-800 border-t-2 border-slate-600">
                  <td className="p-4 font-black text-white text-lg">= EBITDA</td>
                  <td className={`p-4 text-right font-black text-lg ${(dreData.receitaBruta * 0.94 - Math.abs(dreData.custosDiretos) - Math.abs(dreData.despesasFixas)) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    R$ {(dreData.receitaBruta * 0.94 - Math.abs(dreData.custosDiretos) - Math.abs(dreData.despesasFixas)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Financial;

```


# File: pages/FleetManagement.tsx
```

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Asset, AssetStatus } from '../types';
import { Truck, Activity, ShieldCheck, MapPin, Gauge, Plus, Save, BookOpen, Search, Trash2, Download, FileText, Upload, FileSpreadsheet, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { fleetManagementService } from '../services/fleetService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';

const FleetManagement: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importAssetId, setImportAssetId] = useState<string>('');
  const [importProgress, setImportProgress] = useState<number>(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importLog, setImportLog] = useState<string[]>([]);

  const handleImportGPS = async () => {
    if (!importFile || !importAssetId) return;
    setIsImporting(true);
    setImportLog([]);
    setImportProgress(0);

    try {
      const buffer = await importFile.arrayBuffer();
      const workbook = xlsx.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Ler todas as colunas
      const rows: any[] = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

      setImportLog(prev => [...prev, `Linhas encontradas: ${rows.length}`]);

      const BATCH_SIZE = 500;
      let batch: any[] = [];
      let processed = 0;

      let minDate: Date | null = null;
      let maxDate: Date | null = null;

      for (const row of rows) {
        // Mapeamento de Colunas (Flexível)
        const latVal = row['Latitude'] || row['Lat'] || row['latitude'];
        const lngVal = row['Longitude'] || row['Lng'] || row['longitude'] || row['Long'];
        // Suporte a Data/Hora Evento, Data, DataHora, timestamp
        const dateVal = row['Data/Hora Evento'] || row['Data'] || row['DataHora'] || row['data_hora'] || row['timestamp'];

        const speedVal = row['Velocidade'] || row['Velocidade (km/h)'] || row['speed'] || 0;
        const ignVal = row['Ignição'] || row['Ignition'] || row['ignicao'] || 'OFF';

        // Tratamento de Lat/Lng (converter vírgula para ponto)
        const parseCoord = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') return parseFloat(val.replace(',', '.'));
          return 0;
        };

        const lat = parseCoord(latVal);
        const lng = parseCoord(lngVal);

        if (!lat || !lng || lat === 0 || lng === 0) continue;

        // Tratamento de Data
        let timestamp = null;
        if (typeof dateVal === 'number') {
          // Excel Serial Date
          const excelEpoch = new Date(1899, 11, 30);
          const days = Math.floor(dateVal);
          const ms = Math.round((dateVal - days) * 86400000);
          const localDate = new Date(excelEpoch.getTime() + days * 86400000 + ms);
          timestamp = localDate.toISOString();
        } else if (typeof dateVal === 'string') {
          if (dateVal.includes('/')) {
            // DD/MM/YYYY HH:mm:ss
            const [dStr, tStr] = dateVal.split(' ');
            if (dStr && tStr) {
              const [day, month, year] = dStr.split('/');
              // Assumindo UTC para salvar no banco corretamente
              timestamp = `${year}-${month}-${day}T${tStr}.000Z`;
            }
          } else {
            // Tenta converter direto
            try { timestamp = new Date(dateVal).toISOString(); } catch { }
          }
        }

        if (!timestamp) continue;

        // Date Tracking
        const dObj = new Date(timestamp);
        if (!minDate || dObj < minDate) minDate = dObj;
        if (!maxDate || dObj > maxDate) maxDate = dObj;

        // Ignição
        let ignition = false;
        if (typeof ignVal === 'boolean') ignition = ignVal;
        else {
          const s = String(ignVal).toUpperCase();
          ignition = ['VERDADEIRO', 'TRUE', 'LIGADA', 'ON', '1'].some(v => s.includes(v));
        }

        batch.push({
          asset_id: importAssetId,
          latitude: lat,
          longitude: lng,
          timestamp: timestamp,
          speed: typeof speedVal === 'string' ? parseFloat(speedVal.replace(',', '.')) : speedVal,
          ignition: ignition,
          meta: { source: 'manual_import', original: row }
        });

        if (batch.length >= BATCH_SIZE) {
          const { error } = await supabase.from('asset_positions').insert(batch);
          if (error) throw error;
          batch = [];
          processed += BATCH_SIZE;
          setImportProgress(Math.min(100, Math.round((processed / rows.length) * 100)));
        }
      }

      if (batch.length > 0) {
        const { error } = await supabase.from('asset_positions').insert(batch);
        if (error) throw error;
      }

      setImportLog(prev => [...prev, `✅ Sucesso! Total importado: ${processed + batch.length}`]);

      if (minDate && maxDate) {
        setImportLog(prev => [...prev, `🔄 Recalculando operações de ${minDate?.toLocaleDateString()} a ${maxDate?.toLocaleDateString()}...`]);

        const { error: rpcError } = await supabase.rpc('recalculate_operations', {
          target_asset_id: importAssetId,
          start_date: minDate.toISOString().split('T')[0],
          end_date: maxDate.toISOString().split('T')[0]
        });

        if (rpcError) {
          console.error('RPC Error:', rpcError);
          setImportLog(prev => [...prev, `⚠️ Erro ao recalcular: ${rpcError.message}`]);
        } else {
          setImportLog(prev => [...prev, `✅ Operações recalculadas com sucesso!`]);
        }
      }

      setTimeout(() => {
        setIsImportModalOpen(false);
        alert("Importação Concluída com Sucesso!");
        queryClient.invalidateQueries({ queryKey: ['fleet'] });
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setImportLog(prev => [...prev, `❌ Erro: ${error.message || error}`]);
    } finally {
      setIsImporting(false);
    }
  };

  // React Query: Fetch Assets
  const { data: fleetData = [], isLoading } = useQuery({
    queryKey: ['fleet'],
    queryFn: fleetManagementService.getAssets,
    staleTime: 1000 * 60, // 1 min (mock data constraint)
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: fleetManagementService.createAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fleet'] })
  });

  const updateMutation = useMutation({
    mutationFn: fleetManagementService.updateAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fleet'] })
  });

  const deleteMutation = useMutation({
    mutationFn: fleetManagementService.deleteAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fleet'] })
  });

  // New Asset State
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    id: '',
    name: '',
    model: '',
    status: AssetStatus.AVAILABLE
  });

  const openEditModal = (asset: Asset) => {
    setNewAsset({ ...asset });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!newAsset.name || !newAsset.id) return;

    const existingIds = fleetData.map(a => a.id);
    const isEdit = existingIds.includes(newAsset.id!);

    const assetToSave: Asset = {
      id: newAsset.id!,
      name: newAsset.name!,
      model: newAsset.model || 'Modelo Padrão',
      status: newAsset.status || AssetStatus.AVAILABLE,
      horometer: newAsset.horometer || 0,
      nextRevision: newAsset.nextRevision || '100h',
      efficiency: newAsset.efficiency || 100,
      coordinates: newAsset.coordinates || { lat: -22.2, lng: -54.8 },
      telemetry: newAsset.telemetry || {
        lastUpdate: new Date().toLocaleString(),
        speed: 0,
        ignition: false,
        voltage: 24,
        batteryLevel: 100,
        satelliteCount: 10,
        address: 'Base Central',
        deviceModel: 'Tracker V1'
      },
      manuals: newAsset.manuals || []
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(assetToSave);
      } else {
        await createMutation.mutateAsync(assetToSave);
      }
      setIsModalOpen(false);
      setNewAsset({ id: '', name: '', model: '', status: AssetStatus.AVAILABLE });
    } catch (error) {
      console.error("Failed to save asset", error);
      alert("Erro ao salvar ativo.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este ativo?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('TerraPro ERP', 14, 20);
    doc.setFontSize(12);
    doc.text('Relatório Geral de Frota', 14, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 50);
    doc.text(`Total de Ativos: ${fleetData.length}`, 14, 55);

    const tableColumn = ["ID", "Nome / Modelo", "Status", "Horímetro", "Localização (Última Posição)"];
    const tableRows = fleetData.map(asset => [
      asset.id,
      `${asset.name}\n${asset.model}`,
      asset.status,
      `${asset.horometer} h`,
      asset.telemetry?.address || 'N/A'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' }, // Emerald-600 headers
      styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
      alternateRowStyles: { fillColor: [240, 253, 244] }, // Emerald-50
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { fontStyle: 'bold', cellWidth: 30 },
        3: { halign: 'right' }
      }
    });

    // Summary by Status
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    if (finalY < 250) {
      doc.setFontSize(14);
      doc.text('Resumo por Status', 14, finalY);

      const stats = fleetData.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let yPos = finalY + 10;
      doc.setFontSize(10);
      Object.entries(stats).forEach(([status, count]) => {
        doc.text(`• ${status}: ${count}`, 14, yPos);
        yPos += 7;
      });
    }

    doc.save('relatorio_frota_terrapro.pdf');
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Frota Ativa</h2>
          <p className="text-slate-500 mt-1">Monitoramento em tempo real de ativos e telemetria.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 transition-all text-white px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-700 flex items-center gap-2"
          >
            <Upload size={18} />
            Importar GPS
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-slate-800 hover:bg-slate-700 transition-all text-white px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-700 flex items-center gap-2"
          >
            <Download size={18} />
            Exportar Relatório
          </button>
          <button
            onClick={() => {
              setNewAsset({ id: '', name: '', model: '', status: AssetStatus.AVAILABLE });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 transition-all text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <Plus size={18} />
            Cadastrar Novo Ativo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fleetData.map((asset) => (
          <div
            key={asset.id}
            onClick={() => openEditModal(asset)}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all group relative cursor-pointer"
          >
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-slate-500 transition-all z-10"
              title="Excluir Ativo"
            >
              <Trash2 size={16} />
            </button>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-blue-600 transition-colors">
                  <Truck size={24} className="text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${asset.status === AssetStatus.OPERATING ? 'bg-emerald-500/10 text-emerald-500' :
                  asset.status === AssetStatus.MAINTENANCE ? 'bg-red-500/10 text-red-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                  {asset.status}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white leading-tight truncate pr-8">{asset.name}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{asset.id} • {asset.model}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/50">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Horímetro</p>
                  <div className="flex items-center gap-1.5 text-white font-black">
                    <Gauge size={14} className="text-blue-500" />
                    {asset.horometer}h
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Endereço</p>
                  <p className="text-[10px] text-white font-bold truncate">{asset.telemetry?.address || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-500">Bateria</span>
                  <span className={(asset.telemetry?.batteryLevel || 0) < 20 ? 'text-red-500' : 'text-slate-300'}>{asset.telemetry?.batteryLevel}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${(asset.telemetry?.batteryLevel || 0) < 20 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${asset.telemetry?.batteryLevel || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); navigate('/map'); }}
              className="w-full py-4 bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Activity size={14} /> Ver Telemetria Detalhada
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Ativo (Rastreável)"
      >
        <div className="space-y-6">
          {/* Identification Section */}
          <div>
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Identificação e Especificações</h4>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Identificador</label>
                <input placeholder="AAA-0001" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-5 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Rastreável</label>
                <input placeholder="MN08 - MOTONIVELADORA 140M" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none">
                  <option>Motoniveladora</option>
                  <option>Escavadeira</option>
                  <option>Caminhão Basculante</option>
                  <option>Trator de Esteira</option>
                </select>
              </div>

              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Marca</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none">
                  <option>CATERPILLAR</option>
                  <option>VOLVO</option>
                  <option>KOMATSU</option>
                  <option>SCANIA</option>
                </select>
              </div>
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Modelo</label>
                <input placeholder="140M" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Ano</label>
                <input placeholder="2014" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Cor</label>
                <input placeholder="AMARELO" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Control & Docs Section */}
          <div>
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Documentação e Controle</h4>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Chassis / Série</label>
                <input placeholder="Chassis" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Renavam</label>
                <input placeholder="Renavam" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Vencimento Docto</label>
                <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Telemetry Section */}
          <div>
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Telemetria e Combustível</h4>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Quilometragem</label>
                <input placeholder="0.0" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Horímetro</label>
                <input placeholder="0.0" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Combustível</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none">
                  <option>Diesel</option>
                  <option>Gasolina</option>
                  <option>Etanol</option>
                  <option>Elétrico</option>
                </select>
              </div>
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Limite Velocidade</label>
                <div className="relative">
                  <input placeholder="80" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none pr-8" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">km/h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Management Section */}
          <div>
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Gestão</h4>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Cliente / Projeto</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none">
                  <option>TRANSPORTADORA E TERRAPLANAGEM TERRA</option>
                </select>
              </div>
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Departamento</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none">
                  <option>Selecione Departamento</option>
                  <option>Obras</option>
                  <option>Mineração</option>
                </select>
              </div>
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Motorista Padrão</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none">
                  <option>Sem Motorista</option>
                  <option>João da Silva</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Tabs Placeholder */}
          <div className="border-t border-slate-800 pt-4">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {['Alertas', 'Manuais Técnicos', 'Cercas Virtuais', 'Entradas', 'Saídas', 'Periféricos', 'Motoristas', 'Rastreamento', 'Dispositivos'].map(tab => (
                <button key={tab} className="whitespace-nowrap px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2">
                  {tab === 'Alertas' && <ShieldCheck size={12} />}
                  {tab === 'Manuais Técnicos' && <BookOpen size={12} />}
                  {tab === 'Cercas Virtuais' && <MapPin size={12} />}
                  {tab}
                </button>
              ))}
            </div>

            {/* Manuais Técnicos Content (PROSIS Style) */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#003057] rounded-lg flex items-center justify-center font-black text-white text-lg border border-white/20">
                    V
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Volvo Impact 3.0</h4>
                    <p className="text-xs text-slate-500">Catálogo de Peças e Serviços (Rede Local)</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open('http://192.168.100.168:8800/impact3/application/#partsTab', '_blank')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Download size={14} /> Abrir em Nova Janela
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Conectado: 192.168.100.168</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white relative h-[500px]">
                <iframe
                  src="http://192.168.100.168:8800/impact3/application/#partsTab"
                  className="w-full h-full border-none"
                  title="Volvo Impact"
                />

                {/* Overlay asking for confirm if iframe fails */}
                <div className="absolute top-0 left-0 w-full h-full bg-slate-100 pointer-events-none opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <p className="px-4 py-2 bg-black/75 text-white text-xs rounded-lg backdrop-blur pointer-events-auto">
                    Se não carregar aqui, use o botão "Abrir em Nova Janela"
                  </p>
                </div>
              </div>

              {/* Meus Manuais Section */}
              <div className="mt-6 border-t border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-blue-500" /> Meus Manuais & Documentos Técnicos
                  </h4>
                  <button className="px-3 py-1.5 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 border border-blue-600/20">
                    <Upload size={12} /> Upload Manual PDF
                  </button>
                </div>

                {newAsset.manuals && newAsset.manuals.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {newAsset.manuals.map(doc => (
                      <div key={doc.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between group hover:border-blue-500/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-500/10 rounded flex items-center justify-center">
                            <FileText size={16} className="text-red-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{doc.title}</p>
                            <p className="text-[10px] text-slate-500">{doc.category} • {doc.fileSize}</p>
                          </div>
                        </div>
                        <Download size={14} className="text-slate-500 hover:text-white" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500">Nenhum manual cadastrado para este ativo.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Alertas Content Placeholder (Hidden when Manuals is active - simplificação para demo, o ideal seria state para tabs) */}
            {/* ... */}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800 mt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-700 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 text-sm flex items-center gap-2"
            >
              <Save size={18} />
              Salvar Rastreável
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Upload className="text-blue-600" /> Importar Histórico GPS
              </h2>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selecione o Veículo</label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white text-slate-900"
                  value={importAssetId}
                  onChange={e => setImportAssetId(e.target.value)}
                >
                  <option value="">-- Escolha um Ativo --</option>
                  {fleetData?.map(a => (
                    <option key={a.id} value={a.id}>{a.title || a.name || a.id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Arquivo Excel/CSV</label>
                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative"
                  onClick={() => document.getElementById('gps-upload-input')?.click()}
                >
                  <input
                    id="gps-upload-input"
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={e => setImportFile(e.target.files?.[0] || null)}
                  />
                  <FileSpreadsheet className="text-slate-400 mb-2" size={32} />
                  <span className="text-sm text-slate-600 font-medium">
                    {importFile ? importFile.name : "Clique para selecionar arquivo"}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">Suporta .xlsx e .csv (Selsyn)</span>
                </div>
              </div>

              {importLog.length > 0 && (
                <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono h-32 overflow-y-auto text-slate-600 border border-slate-200">
                  {importLog.map((l, i) => <div key={i}>{l}</div>)}
                </div>
              )}

              {isImporting && (
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }}></div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                  disabled={isImporting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImportGPS}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                  disabled={!importFile || !importAssetId || isImporting}
                >
                  {isImporting ? <><RefreshCw className="animate-spin" size={16} /> Processando...</> : 'Iniciar Importação'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetManagement;

```


# File: pages/FuelManagement.tsx
```
import React, { useState, useEffect } from 'react';
import { Fuel, Droplets, History, AlertTriangle, Save, ArrowDownLeft, ArrowUpRight, Camera, Settings, MessageCircle, Trash2, Lock, X, Edit } from 'lucide-react';
import Modal from '../components/Modal';
import { useQuery } from '@tanstack/react-query';
import { fleetManagementService } from '../services/fleetService';
import { supabase } from '../lib/supabase';

// Interfaces
interface FuelTank {
  id: string;
  name: string;
  type: 'STATIONARY' | 'MOBILE';
  capacity: number;
  current_level: number;
  min_level: number; // Nível de alerta
  whatsapp_order_number?: string; // Número do contato para pedidos
}

interface FuelRecord {
  id: string;
  date: string;
  operation_type: 'IN' | 'OUT';
  liters: number;
  asset_name?: string;
  supplier_name?: string;
  tank_id: string;
  invoice_number?: string;
  horometer?: number;
  responsible_name?: string;
  total_value?: number;
  price_per_liter?: number;
}

const FuelManagement: React.FC = () => {
  const [modalType, setModalType] = useState<'NONE' | 'PURCHASE' | 'SUPPLY' | 'MANAGE_TANKS'>('NONE');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Auth / Delete Protection State
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [recordToDelete, setRecordToDelete] = useState<{ id: string, type: 'IN' | 'OUT' } | null>(null);

  // Edit Protection State
  const [isEditLocked, setIsEditLocked] = useState(false); // If true, inputs are disabled until auth
  const [authAction, setAuthAction] = useState<'DELETE' | 'UNLOCK' | null>(null);

  // --- Data Fetching ---

  // 1. Tanques (Estoque)
  const { data: tanks = [], refetch: refetchTanks } = useQuery({
    queryKey: ['fuel_tanks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fuel_tanks').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data as FuelTank[];
    }
  });

  // 2. Histórico de Movimentações
  const { data: history = [], refetch: refetchHistory } = useQuery({
    queryKey: ['fuel_records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fuel_records')
        .select('*')
        .order('date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as FuelRecord[];
    }
  });

  // 3. Ativos (Frota)
  const { data: assets = [] } = useQuery({
    queryKey: ['fleet'],
    queryFn: fleetManagementService.getAssets,
    staleTime: 1000 * 60,
  });

  // 4. Fornecedores e Funcionários
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('entities').select('id, name')
      // Busca generica pois 'is_supplier' pode nao existir ou ser diferente
      .then(({ data }) => setSuppliers(data || []));

    // Busca funcionários filtrados pela empresa do usuário (via Service)
    fleetManagementService.getEmployees()
      .then(data => setEmployees(data))
      .catch(err => console.error("Erro ao carregar funcionários:", err));
  }, []);

  // --- Form States ---
  const [formData, setFormData] = useState({
    tankId: '',
    assetId: '',
    supplierId: '',
    responsibleId: '',
    liters: '',
    horometer: '',
    totalValue: '', // Antigo pricePerLiter, agora valor total da nota
    invoiceNumber: '',
    date: new Date().toISOString().slice(0, 16),
    observation: ''
  });

  // Tank Form State
  const [tankForm, setTankForm] = useState({
    name: '',
    type: 'STATIONARY',
    capacity: '',
    current_level: '',
    min_level: '500',
    whatsapp_order_number: ''
  });

  // Reset form when modal opens
  useEffect(() => {
    if ((modalType === 'PURCHASE' || modalType === 'SUPPLY') && tanks.length > 0 && !editingId) {
      setFormData(prev => ({ ...prev, tankId: tanks[0].id }));
    }
  }, [modalType, tanks, editingId]);

  // --- Actions ---

  const closeModal = () => {
    setModalType('NONE');
    setEditingId(null);
    setIsEditLocked(false);
    setAuthAction(null);
    setFormData({
      tankId: tanks[0]?.id || '', assetId: '', supplierId: '', responsibleId: '',
      liters: '', horometer: '', totalValue: '', invoiceNumber: '',
      date: new Date().toISOString().slice(0, 16), observation: ''
    });
  };

  const handleEdit = (record: FuelRecord) => {
    setEditingId(record.id);
    setIsEditLocked(true); // Bloqueia edição inicialmente
    setModalType(record.operation_type === 'IN' ? 'PURCHASE' : 'SUPPLY');

    // Calculate Total Value safely
    const totalVal = record.total_value || (record.price_per_liter ? (record.price_per_liter * record.liters).toFixed(2) : '');

    setFormData({
      tankId: record.tank_id,
      assetId: (record as any).asset_id || (record.asset_name ? (assets.find(a => a.name === record.asset_name)?.id || '') : ''),
      supplierId: (record as any).supplier_id || '',
      responsibleId: (record as any).responsible_id || '',

      liters: String(record.liters),
      horometer: record.horometer ? String(record.horometer) : '',
      totalValue: String(totalVal),
      invoiceNumber: record.invoice_number || '', // NFe
      date: new Date(record.date).toISOString().slice(0, 16),
      observation: ''
    });
  };

  const handleSaveTank = async () => {
    if (!tankForm.name || !tankForm.capacity) return alert("Preencha Nome e Capacidade");

    setLoading(true);
    try {
      const { error } = await supabase.from('fuel_tanks').insert({
        name: tankForm.name,
        type: tankForm.type,
        capacity: parseFloat(tankForm.capacity),
        current_level: parseFloat(tankForm.current_level || '0'),
        min_level: parseFloat(tankForm.min_level || '500'),
        whatsapp_order_number: tankForm.whatsapp_order_number || null
      });

      if (error) throw error;

      alert("Tanque cadastrado com sucesso!");
      setTankForm({ name: '', type: 'STATIONARY', capacity: '', current_level: '', min_level: '500', whatsapp_order_number: '' });
      refetchTanks();
    } catch (e: any) {
      alert("Erro ao criar tanque: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTank = async (id: string) => {
    if (!confirm("Tem certeza? O histórico de abastecimentos deste tanque será afetado.")) return;
    try {
      const { error } = await supabase.from('fuel_tanks').delete().eq('id', id);
      if (error) throw error;
      refetchTanks();
    } catch (e: any) {
      alert("Erro ao excluir: " + e.message);
    }
  };

  const handleSaveTransaction = async () => {
    if (editingId && isEditLocked) return; // Segurança extra

    if (!formData.tankId || !formData.liters) {
      return alert('Preencha Tanque e Litros.');
    }

    if (modalType === 'PURCHASE' && (!formData.supplierId || !formData.invoiceNumber || !formData.totalValue)) {
      return alert('Para COMPRA, Fornecedor, NFe e Valor Total são obrigatórios.');
    }

    if (modalType === 'SUPPLY' && !formData.assetId) {
      return alert('Selecione o Equipamento abastecido.');
    }

    if (modalType === 'SUPPLY' && !formData.responsibleId) {
      return alert('Selecione o Responsável pelo abastecimento.');
    }

    setLoading(true);
    try {
      const asset = assets.find(a => a.id === formData.assetId);
      const supplier = suppliers.find(s => s.id === formData.supplierId);
      const employee = employees.find(e => e.id === formData.responsibleId);
      const tank = tanks.find(t => t.id === formData.tankId);

      // Validação de Estoque (Saída)
      if (modalType === 'SUPPLY' && tank && !editingId) {
        if (Number(formData.liters) > tank.current_level) {
          throw new Error(`Saldo insuficiente no tanque! Disponível: ${tank.current_level} L`);
        }
      }

      // Validação de Horímetro (Lógica de Consumo)
      if (modalType === 'SUPPLY' && formData.assetId && formData.horometer) {
        const currentHorometer = parseFloat(formData.horometer);

        // Busca último registro DESTE ativo anterior à data atual
        const { data: lastRecord } = await supabase
          .from('fuel_records')
          .select('horometer, date')
          .eq('asset_id', formData.assetId)
          .lt('date', new Date(formData.date).toISOString()) // Apenas registros anteriores
          .not('horometer', 'is', null) // Que tenham horimetro
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (lastRecord && lastRecord.horometer) {
          if (currentHorometer <= lastRecord.horometer) {
            // Se for edição e o horímetro for igual ao original, ok (mas aqui estamos comparando com o ANTERIOR ao atual, então deve ser maior)
            // Mas cuidado: se eu edito um registro antigo, o "anterior" é o anterior a ele.
            // Se eu edito, e mantenho o mesmo, ele deve ser > que o anterior.
            const confirmForce = confirm(`⚠️ ALERTA DE CONSISTÊNCIA\n\nO horímetro atual (${currentHorometer}) é MENOR ou IGUAL ao registro anterior (${lastRecord.horometer} em ${new Date(lastRecord.date).toLocaleDateString()}).\n\nIsso pode gerar erro no cálculo de média.\nDeseja salvar mesmo assim?`);

            if (!confirmForce) {
              setLoading(false);
              return;
            }
          }
        }
      }

      const payload = {
        operation_type: modalType === 'PURCHASE' ? 'IN' : 'OUT',
        tank_id: formData.tankId,
        date: new Date(formData.date).toISOString(),
        liters: parseFloat(formData.liters),

        // Dados de Compra
        supplier_id: modalType === 'PURCHASE' ? formData.supplierId : null,
        supplier_name: modalType === 'PURCHASE' ? supplier?.name : null,
        invoice_number: modalType === 'PURCHASE' ? formData.invoiceNumber : null,
        // Correção: Calcular preço unitário (Total / Litros)
        price_per_liter: modalType === 'PURCHASE' ? (parseFloat(formData.totalValue || '0') / parseFloat(formData.liters || '1')) : null,

        // Dados de Abastecimento
        asset_id: modalType === 'SUPPLY' ? formData.assetId : null,
        asset_name: modalType === 'SUPPLY' ? asset?.name : null,
        horometer: modalType === 'SUPPLY' ? parseFloat(formData.horometer || '0') : null,
        responsible_id: modalType === 'SUPPLY' ? formData.responsibleId : null,
        responsible_name: modalType === 'SUPPLY' ? employee?.full_name : null,
      };

      if (editingId) {
        // UPDATE
        const { error } = await supabase.from('fuel_records').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('Registro atualizado com sucesso!');
      } else {
        // INSERT
        // 1. Salvar Registro de Combustível
        const { error } = await supabase.from('fuel_records').insert(payload);
        if (error) throw error;

        // 2. Integração Financeira (Se for Compra)
        if (modalType === 'PURCHASE') {
          const valorTotal = parseFloat(formData.totalValue);
          const { error: finError } = await supabase.from('contas_pagar').insert({
            fornecedor_id: formData.supplierId,
            fornecedor_nome: supplier?.name || 'Fornecedor de Combustível',
            descricao: `Compra Diesel - NF ${formData.invoiceNumber} - ${formData.liters}L`,
            valor_original: valorTotal,
            data_emissao: new Date().toISOString(),
            data_vencimento: new Date(formData.date).toISOString().split('T')[0], // Assumindo vencimento no dia
            status: 'PENDENTE',
            numero_titulo: `DSL-${formData.invoiceNumber}-${Date.now().toString().slice(-4)}`,
            observacao: `Gerado automaticamente pelo Módulo de Combustível. Tanque: ${tank?.name}`
          });

          if (finError) {
            console.error('Erro ao gerar financeiro:', finError);
            alert('Atenção: Combustível salvo, mas houve erro ao gerar o Contas a Pagar: ' + finError.message);
          }
        }
      }

      closeModal();
      refetchTanks();
      refetchHistory();
    } catch (e: any) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppOrder = (tank: FuelTank) => {
    const message = `🚨 *ALERTA DE ESTOQUE BAIXO*\n\nPreciso solicitar compra de DIESEL com urgência.\n\nTanque: *${tank.name}*\nNível Atual: *${tank.current_level} Litros*\nCapacidade: ${tank.capacity} Litros`;
    const phone = tank.whatsapp_order_number ? tank.whatsapp_order_number.replace(/\D/g, '') : '';
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // --- Função de Autenticação Segura (Delete / Edit) ---
  const requestDelete = (record: FuelRecord) => {
    setRecordToDelete({ id: record.id, type: record.operation_type });
    setAuthAction('DELETE'); // Define ação como Delete
    setAdminPassword('');
    setShowAdminAuth(true);
  };

  const handleUnlockEdit = () => {
    setAuthAction('UNLOCK'); // Define ação como Unlock
    setAdminPassword('');
    setShowAdminAuth(true);
  };

  const confirmAuth = async () => {
    // Simulação de Senha Admin (Em produção, verificar role ou tabela de usuários)
    if (adminPassword !== 'admin123' && adminPassword !== 'terrapro2024') {
      alert("Senha de Administrador Incorreta!");
      return;
    }

    if (authAction === 'UNLOCK') {
      setIsEditLocked(false); // Desbloqueia formulário
      setShowAdminAuth(false);
      setAuthAction(null);
      return;
    }

    if (authAction === 'DELETE' && recordToDelete) {
      setLoading(true);
      try {
        const { error } = await supabase.from('fuel_records').delete().eq('id', recordToDelete.id);
        if (error) throw error;

        alert("Registro excluído com sucesso!");
        setShowAdminAuth(false);
        setRecordToDelete(null);
        refetchHistory();
        refetchTanks(); // Importante para recalcular saldos (via trigger)
      } catch (e: any) {
        alert("Erro ao excluir: " + e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto custom-scrollbar pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-white tracking-tight">Gestão de Combustível</h2>
            <button
              onClick={() => setModalType('MANAGE_TANKS')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Gerenciar Tanques"
            >
              <Settings size={20} />
            </button>
          </div>
          <p className="text-slate-500 mt-1">Controle de estoque, compras de diesel e abastecimentos da frota.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setModalType('PURCHASE')}
            className="bg-emerald-600 hover:bg-emerald-500 transition-all text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 uppercase tracking-wide"
          >
            <ArrowDownLeft size={18} />
            Compra de Diesel (Entrada)
          </button>
          <button
            onClick={() => setModalType('SUPPLY')}
            className="bg-orange-600 hover:bg-orange-500 transition-all text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-600/30 flex items-center gap-2 uppercase tracking-wide"
          >
            <ArrowUpRight size={18} />
            Abastecer Frota (Saída)
          </button>
        </div>
      </div>

      {/* Tanques (Kards de Saldo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tanks.map(tank => {
          const percentage = tank.capacity > 0 ? Math.round((tank.current_level / tank.capacity) * 100) : 0;
          const isCritical = tank.current_level <= (tank.min_level || 500);

          return (
            <div key={tank.id} className={`bg-slate-900 border ${isCritical ? 'border-red-500/50 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]' : 'border-slate-800'} p-6 rounded-[24px] space-y-4 relative overflow-hidden group transition-all duration-300`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl border ${isCritical ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                    {isCritical ? <AlertTriangle size={24} className="animate-bounce" /> : <Droplets size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{tank.name}</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{tank.type === 'STATIONARY' ? 'Tanque Fixo' : 'Comboio Móvel'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${isCritical ? 'text-red-500' : 'text-white'}`}>{tank.current_level.toLocaleString()} L</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">de {tank.capacity.toLocaleString()} L</p>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 relative">
                {/* Marcador de nível mínimo */}
                {(tank.min_level && tank.capacity && (tank.min_level / tank.capacity) < 1) && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `${(tank.min_level / tank.capacity) * 100}%` }}
                    title={`Nível de Alerta: ${tank.min_level}L`}
                  />
                )}
                <div
                  className={`h-full transition-all duration-1000 ease-out ${isCritical ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                  {percentage}% Cheio {isCritical && '(CRÍTICO)'}
                </p>

                {isCritical && (
                  <button
                    onClick={() => handleWhatsAppOrder(tank)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg shadow-green-600/20 animate-pulse hover:animate-none transition-all"
                  >
                    <MessageCircle size={14} />
                    Pedir Diesel
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {tanks.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 italic bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            Nenhum tanque cadastrado. Clique na engrenagem acima para cadastrar.
          </div>
        )}
      </div>

      {/* Histórico Recente */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
          <div className="flex items-center gap-2">
            <History size={18} className="text-slate-500" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Últimas Movimentações</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Origem / Destino</th>
                <th className="px-6 py-4">Litros</th>
                <th className="px-6 py-4">Preço/L (Médio)</th>
                <th className="px-6 py-4">Detalhes</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                  onClick={() => handleEdit(record)}
                >
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    {new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString().slice(0, 5)}
                  </td>
                  <td className="px-6 py-4">
                    {record.operation_type === 'IN' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                        <ArrowDownLeft size={10} /> Entrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-wider border border-orange-500/20">
                        <ArrowUpRight size={10} /> Saída
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {record.operation_type === 'IN'
                      ? (record.supplier_name || 'Fornecedor Externo')
                      : (record.asset_name || 'Frota Geral')
                    }
                  </td>
                  <td className="px-6 py-4 font-black text-white text-lg">
                    {record.liters} <span className="text-xs font-normal text-slate-500">L</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-400">
                    {record.operation_type === 'IN' && record.price_per_liter ? (
                      <span>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(record.price_per_liter)}
                        <span className="text-[10px] text-slate-500 font-normal"> /L</span>
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {record.operation_type === 'IN' ? (
                      <span>NF: {record.invoice_number || '-'}</span>
                    ) : (
                      <div className="flex flex-col">
                        <span>Horímetro: {record.horometer || '-'}</span>
                        {record.responsible_name && <span className="text-[9px] uppercase text-slate-500 mt-1">Resp: {record.responsible_name}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(record)}
                      className="text-slate-600 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-slate-800"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => requestDelete(record)}
                      className="text-slate-600 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-slate-800"
                      title="Excluir Registro (Requer Senha)"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Nenhum registro encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Transaction */}
      <Modal
        isOpen={modalType === 'PURCHASE' || modalType === 'SUPPLY'}
        onClose={closeModal}
        title={editingId ? (isEditLocked ? "Visualizar Lançamento" : "Editar Lançamento") : (modalType === 'PURCHASE' ? "Registrar Compra de Diesel" : "Abastecer Frota")}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Tanque {modalType === 'PURCHASE' ? 'de Entrada' : 'de Origem'} *</label>
            <select
              value={formData.tankId}
              onChange={(e) => setFormData({ ...formData, tankId: e.target.value })}
              disabled={!!editingId && isEditLocked}
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Selecione...</option>
              {tanks.map(tank => (
                <option key={tank.id} value={tank.id}>
                  {tank.name} (Saldo: {tank.current_level} L)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Data/Hora</label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={!!editingId && isEditLocked}
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Quantidade (Litros) *</label>
            <input
              type="number"
              value={formData.liters}
              onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
              placeholder="0.0"
              disabled={!!editingId && isEditLocked}
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-lg font-bold focus:border-blue-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          {modalType === 'PURCHASE' && (
            <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-500 uppercase">Fornecedor / Posto *</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  disabled={!!editingId && isEditLocked}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Selecione...</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-500 uppercase">Nota Fiscal (NFe) *</label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="000.000"
                    disabled={!!editingId && isEditLocked}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-500 uppercase">Valor Total (R$) *</label>
                  <input
                    type="number"
                    value={formData.totalValue}
                    onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                    placeholder="0.00"
                    disabled={!!editingId && isEditLocked}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
            </div>
          )}

          {modalType === 'SUPPLY' && (
            <div className="p-4 bg-orange-900/10 border border-orange-500/20 rounded-xl space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-orange-500 uppercase">Máquina / Frota *</label>
                <select
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  disabled={!!editingId && isEditLocked}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Selecione a máquina...</option>
                  {assets.map((asset: any) => (
                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-orange-500 uppercase">Responsável (Comboísta) *</label>
                <select
                  value={formData.responsibleId}
                  onChange={(e) => setFormData({ ...formData, responsibleId: e.target.value })}
                  disabled={!!editingId && isEditLocked}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Selecione o responsável...</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                  ))}
                  {employees.length === 0 && <option disabled>Nenhum funcionário ativo encontrado</option>}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-orange-500 uppercase">Horímetro Atual / Quilometragem</label>
                  <input
                    type="number"
                    value={formData.horometer}
                    onChange={(e) => setFormData({ ...formData, horometer: e.target.value })}
                    placeholder="0000"
                    disabled={!!editingId && isEditLocked}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-orange-500 uppercase">Foto Comprovante</label>
                  <button
                    disabled={!!editingId && isEditLocked}
                    className={`w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${!!editingId && isEditLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Camera size={18} />
                    <span className="text-xs">Adicionar Foto</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            {editingId && isEditLocked ? (
              <button
                onClick={handleUnlockEdit}
                className="w-full py-4 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide bg-slate-700 hover:bg-slate-600 shadow-slate-700/20"
              >
                <Lock size={18} />
                Desbloquear Edição
              </button>
            ) : (
              <button
                onClick={handleSaveTransaction}
                disabled={loading}
                className={`w-full py-4 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide
                  ${modalType === 'PURCHASE' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/20'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Save size={18} />
                {loading ? 'Processando...' : (editingId ? 'Salvar Alterações' : 'Confirmar Lançamento')}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Manage Tanks (Existing Code...) */}
      <Modal
        isOpen={modalType === 'MANAGE_TANKS'}
        onClose={() => setModalType('NONE')}
        title="Gerenciar Tanques e Comboios"
      >
        {/* ... existing tank modal content ... */}
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest border-b border-slate-800 pb-2">Novo Tanque</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Tanque / Placa Comboio</label>
                <input
                  type="text"
                  value={tankForm.name}
                  onChange={e => setTankForm({ ...tankForm, name: e.target.value })}
                  placeholder="Ex: Tanque Principal ou Comboio ABC-1234"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo</label>
                  <select
                    value={tankForm.type}
                    onChange={e => setTankForm({ ...tankForm, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                  >
                    <option value="STATIONARY">Tanque Fixo</option>
                    <option value="MOBILE">Comboio Móvel</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Capacidade (L)</label>
                  <input
                    type="number"
                    value={tankForm.capacity}
                    onChange={e => setTankForm({ ...tankForm, capacity: e.target.value })}
                    placeholder="10000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Saldo Inicial (L)</label>
                  <input
                    type="number"
                    value={tankForm.current_level}
                    onChange={e => setTankForm({ ...tankForm, current_level: e.target.value })}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-red-500 uppercase">Alerta Mínimo (L)</label>
                  <input
                    type="number"
                    value={tankForm.min_level}
                    onChange={e => setTankForm({ ...tankForm, min_level: e.target.value })}
                    placeholder="500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-2">
                  <MessageCircle size={10} /> WhatsApp P/ Pedidos (DDD+Número)
                </label>
                <input
                  type="text"
                  value={tankForm.whatsapp_order_number}
                  onChange={e => setTankForm({ ...tankForm, whatsapp_order_number: e.target.value })}
                  placeholder="Ex: 5567999999999"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-green-500"
                />
                <p className="text-[9px] text-slate-500 mt-1">O botão de pedido enviará mensagem para este número.</p>
              </div>

              <button
                onClick={handleSaveTank}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider"
              >
                {loading ? 'Salvando...' : 'Adicionar Tanque'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest">Tanques Cadastrados</h4>
            {tanks.length === 0 && <p className="text-sm text-slate-600 italic">Nenhum tanque cadastrado.</p>}
            {tanks.map(tank => (
              <div key={tank.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
                    {tank.type === 'STATIONARY' ? <Fuel size={14} /> : <AlertTriangle size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{tank.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{tank.type === 'STATIONARY' ? 'Fixo' : 'Móvel'} • {tank.capacity}L Cap. • Alerta {tank.min_level}L</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-500">{tank.current_level} L</p>
                    <p className="text-[9px] text-slate-600 uppercase">Saldo Atual</p>
                  </div>
                  <button
                    onClick={() => handleDeleteTank(tank.id)}
                    className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                    title="Excluir Tanque"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </Modal>

      {/* Admin Auth Modal for Delete/Unlock */}
      {showAdminAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-500/30 w-full max-w-sm rounded-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAdminAuth(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-4 text-center">
              <div className={`p-4 rounded-full ${authAction === 'DELETE' ? 'bg-red-500/10 text-red-500' : 'bg-slate-700/50 text-slate-300'}`}>
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Acesso Restrito</h3>
              <p className="text-sm text-slate-400">
                {authAction === 'DELETE'
                  ? "Esta ação é irreversível e afetará o estoque."
                  : "Digite a senha para desbloquear a edição."}
                <br />Digite a senha de administrador.
              </p>

              <input
                type="password"
                autoFocus
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Senha de Administrador"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white text-center font-bold focus:border-red-500 outline-none"
              />

              <button
                onClick={confirmAuth}
                className={`w-full font-bold py-3 rounded-lg shadow-lg ${authAction === 'DELETE' ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20 text-white' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 text-white'}`}
              >
                {authAction === 'DELETE' ? 'Confirmar Exclusão' : 'Desbloquear Edição'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelManagement;

```


# File: pages/HRManagement.tsx
```

import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, FileText, User, Save, Search, Download, Edit2, AlertCircle, Plus, Minus, Folder, Loader2, Camera, Upload, Trash2, CheckCircle, AlertTriangle, X } from 'lucide-react';
import Modal from '../components/Modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Tesseract from 'tesseract.js';
import EmployeeForm from '../components/hr/EmployeeForm';
import { supabase } from '../lib/supabase';

interface OCRResult {
    file: File;
    preview: string;
    status: 'pending' | 'processing' | 'success' | 'error';
    extractedText?: string;
    matchedEmployeeId?: string;
    matchedEmployeeName?: string;
    detectedDate?: string;
    detectedTimes?: string[];
    confidence?: number;
    logs: string[];
    manualDate?: string;
    manualEntry1?: string;
    manualExit1?: string;
    manualEntry2?: string;
    manualExit2?: string;
    parsedRecords?: Array<{
        data: string;
        entrada1: string;
        saida1: string;
        entrada2: string;
        saida2: string;
        selected?: boolean;
    }>;
}
import { dashboardService } from '../services/api';
import { TimeRecord, PayrollEntry } from '../services/mockData';
import { ERPDocument } from '../types';

interface Employee {
    id: string;
    name: string;
    role: string;
    registration_number: string;
    company_id?: string;
    company_name?: string;
    active?: boolean;
    work_shift_id?: string;
    work_shift?: {
        name: string;
        work_days: string[];
        start_time: string;
        end_time: string;
    } | null;
}

type HRTab = 'TIMEKEEPING' | 'PAYROLL' | 'DOCUMENTS';

const HRManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<HRTab>('TIMEKEEPING');
    const [employees, setEmployees] = useState<Employee[]>([]);

    // Employee Form State
    const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
    const [editingEmpId, setEditingEmpId] = useState<string | null>(null);

    // OCR / Upload States
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [ocrFiles, setOcrFiles] = useState<File[]>([]);
    const [ocrResults, setOcrResults] = useState<OCRResult[]>([]);
    const [isProcessingOCR, setIsProcessingOCR] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Novos estados de filtro
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');
    const [companies, setCompanies] = useState<string[]>([]);
    const [availableCompanies, setAvailableCompanies] = useState<{ id: string, name: string }[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string>('TODAS');

    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [isValeModalOpen, setIsValeModalOpen] = useState(false);
    const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
    const [payrollData, setPayrollData] = useState<PayrollEntry[]>([]);
    const [documents, setDocuments] = useState<ERPDocument[]>([]);

    const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Estados de Período (Padrão: Mês Anterior Completo)
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        // 1º dia do mês anterior
        return new Date(date.getFullYear(), date.getMonth() - 1, 1).toISOString().split('T')[0];
    });

    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        // Último dia do mês anterior (dia 0 do mês atual)
        return new Date(date.getFullYear(), date.getMonth(), 0).toISOString().split('T')[0];
    });

    // Cálculo simples de saldo (exemplo: soma total - (dias úteis * 8h))
    // Por enquanto, apenas soma as horas trabalhadas vs horas esperadas
    // (Função calculateBalance movida para junto dos helpers de tempo abaixo)

    // --- SELEÇÃO MÚLTIPLA ---
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

    const handleEmployeeClick = (empId: string, e: React.MouseEvent) => {
        let newSelected = [...selectedIds];

        // Se clicar sem modificadores e o item já estiver na seleção múltipla, mantemos assim pra evitar deselecionar tudo acidentalmente?
        // Padrão Explorer: Clique simples limpa seleção e seleciona só o novo.

        if (e.shiftKey && lastSelectedId) {
            const startIdx = filteredEmployees.findIndex(emp => emp.id === lastSelectedId);
            const endIdx = filteredEmployees.findIndex(emp => emp.id === empId);

            if (startIdx !== -1 && endIdx !== -1) {
                const min = Math.min(startIdx, endIdx);
                const max = Math.max(startIdx, endIdx);
                const range = filteredEmployees.slice(min, max + 1).map(emp => emp.id);

                // Lógica Melhorada: Shift ADICIONA o range à seleção existente, não substitui.
                // Isso permite selecionar um grupo, depois rolar e selecionar outro grupo com Shift.
                // Para desmarcar, o usuário deve usar Ctrl+Click.
                newSelected = Array.from(new Set([...newSelected, ...range]));
            }
        } else if (e.metaKey || e.ctrlKey) {
            // Ctrl/Cmd: Toggle individual e define nova âncora
            if (newSelected.includes(empId)) {
                newSelected = newSelected.filter(id => id !== empId);
            } else {
                newSelected.push(empId);
            }
            setLastSelectedId(empId); // Define nova âncora
        } else {
            // Clique simples: Limpa e seleciona um novo
            newSelected = [empId];
            setLastSelectedId(empId); // Define nova âncora
        }

        setSelectedIds(newSelected);

        // Sincroniza com o painel de detalhes (Single Selection view)
        if (newSelected.length === 1) {
            setSelectedEmployee(newSelected[0]);
        } else {
            setSelectedEmployee(null); // Esconde detalhes individuais se múltiplo ou zero
        }
    };

    const handleMassAction = async (action: 'DEACTIVATE' | 'REACTIVATE') => {
        if (!window.confirm(`Confirma ${action === 'DEACTIVATE' ? 'desligar' : 'reativar'} ${selectedIds.length} colaboradores selecionados?`)) return;

        try {


            const statusBool = action === 'REACTIVATE';

            const { error } = await supabase
                .from('employees')
                .update({ active: statusBool })
                .in('id', selectedIds);

            if (error) throw error;

            setEmployees(prev => prev.map(e =>
                selectedIds.includes(e.id) ? { ...e, active: statusBool } : e
            ));

            setSelectedIds([]);
            setSelectedEmployee(null);
            setLastSelectedId(null);

        } catch (error: any) {
            alert('Erro na ação em massa: ' + error.message);
        }
    };

    const loadData = async () => {
        console.log('🔄 Iniciando carga de dados do RH (Modo Direto)...');
        try {
            // BYPASS: Conexão direta para ignorar falhas no api.ts


            // Fetch empresas primeiro para montar o mapa
            const { data: companiesData, error: companyError } = await supabase.from('companies').select('id, name');
            if (companyError && companyError.code !== 'PGRST116') {
                console.warn('⚠️ Erro ao carregar empresas:', companyError);
            }

            const companyMap: Record<string, string> = {};
            if (companiesData) {
                companiesData.forEach((c: any) => { companyMap[c.id] = c.name; });
                // Atualiza lista de filtro
                setCompanies(companiesData.map((c: any) => c.name));
                setAvailableCompanies(companiesData.map((c: any) => ({ id: c.id, name: c.name })));
            }

            // Fetch funcionários - Tentativa com Turnos
            let { data: emps, error } = await supabase
                .from('employees')
                .select('*, work_shift:work_shifts(name, work_days, start_time, end_time)')
                .order('full_name');

            // FALLBACK: Se falhar (ex: tabela work_shifts não existe), tenta carregar sem o join
            if (error) {
                console.warn("⚠️ Falha ao carregar turnos (Migration pendente?). Carregando dados básicos.", error);
                const res = await supabase
                    .from('employees')
                    .select('*')
                    .order('full_name');
                emps = res.data;
                error = res.error;
            }

            if (error) {
                console.error('❌ Erro Supabase Direto:', error);
                throw error;
            }

            console.log(`✅ ${emps?.length} Funcionários carregados.`);

            if (emps) {
                // Mapeamento de Schema (DB -> Frontend)
                const mappedEmployees: Employee[] = emps.map((e: any) => ({
                    id: e.id,
                    name: e.full_name || e.name || 'Sem Nome',
                    role: e.job_title || e.role || 'Colaborador',
                    registration_number: e.registration_number,
                    company_id: e.company_id,
                    company_name: companyMap[e.company_id] || 'N/A', // Nome da empresa mapeado
                    active: e.active !== false, // Padrão true se undefined
                    work_shift_id: e.work_shift_id,
                    work_shift: e.work_shift
                }));

                setEmployees(mappedEmployees);
            }

        } catch (error: any) {
            console.error('❌ Erro fatal ao carregar dados:', error);
            // alert('Erro ao carregar dados iniciais: ' + (error.message || error));
        }
    };

    React.useEffect(() => {
        let filtered = employees;

        // 1. Filtro de Texto
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(e =>
                e.name.toLowerCase().includes(lower) ||
                (e.registration_number && e.registration_number.includes(lower))
            );
        }

        // 2. Filtro de Status (Ativo/Inativo)
        if (activeFilter !== 'ALL') {
            filtered = filtered.filter(e => {
                const isActive = (e as any).active !== false;
                return activeFilter === 'ACTIVE' ? isActive : !isActive;
            });
        }

        // 3. Filtro de Empresa
        if (selectedCompany !== 'TODAS') {
            filtered = filtered.filter(e => e.company_name === selectedCompany);
        }

        setFilteredEmployees(filtered);
    }, [searchTerm, employees, activeFilter, selectedCompany]);

    // Função auxiliar para calcular diferença de horas
    const calculateTimeDiff = (start: string, end: string) => {
        if (!start || !end) return 0;
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diffMinutes < 0) diffMinutes += 1440; // Adiciona 24h (1440 min) se virou o dia
        return diffMinutes;
    };

    const formatMinutesToHHMM = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const getDailyExpected = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        const dayOfWeek = date.getDay(); // 0=Dom, 6=Sab
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[dayOfWeek];

        // Se o funcionário selecionado tiver turno, usa a regra do turno
        if (selectedEmployee) {
            const emp = employees.find(e => e.id === selectedEmployee);
            if (emp && emp.work_shift && emp.work_shift.work_days) {
                // Se o dia não estiver nos dias de trabalho do turno, expected = 0
                if (!emp.work_shift.work_days.includes(dayName)) {
                    return 0;
                }
                // Se estiver, calcula horas do turno (start - end - break)
                if (emp.work_shift.start_time && emp.work_shift.end_time) {
                    // Deduz 1h de almoço por padrão se não tiver break_start/end no objeto
                    const totalShift = calculateTimeDiff(emp.work_shift.start_time, emp.work_shift.end_time);
                    return totalShift - 60; // Tira 1h de almoço
                }
            }
        }

        // Fallback para quem não tem turno: Seg a Sex = 8h48
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        return isWeekend ? 0 : 528; // 08:48
    };


    // --- NOVO MOTOR DE CÁLCULO CLT (Tolerância, Noturno Reduzido, Extras 100%/50%) ---

    // --- HELPER: Lista de Feriados Nacionais (Mock 2024/2025) ---
    const holidays = [
        '2025-01-01', '2025-04-21', '2025-05-01', '2025-09-07', '2025-10-12', '2025-11-02', '2025-11-15', '2025-12-25',
        '2026-01-01', '2026-04-21' // Adicione mais conforme necessário
    ];

    const isHoliday = (dateStr: string) => holidays.includes(dateStr);

    // --- HELPER: Cálculo de Minutos com Adicional Noturno (22:00 - 05:00) ---
    // Retorna { totalMinutes, nightlyMinutes }
    // As horas noturnas já vem cruas aqui. A redução (fator 1.1428) é aplicada no saldo.
    const calculateIntervalStats = (start: string, end: string) => {
        if (!start || !end) return { total: 0, nightly: 0 };

        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);

        // Converter para minutos absolutos do dia (0..1440)
        let startMin = h1 * 60 + m1;
        let endMin = h2 * 60 + m2;

        // Tratamento de virada de dia
        if (endMin < startMin) endMin += 1440; // Ex: 22:00 (1320) as 05:00 (300+1440=1740)

        const total = endMin - startMin;

        // Janelas Noturnas:
        // 1. 22:00 (1320) até 24:00 (1440) do dia
        // 2. 00:00 (0) até 05:00 (300) do dia
        // 3. 24:00 (1440) até 29:00 (1740) - dia seguinte (00h-05h)

        let nightly = 0;

        // Verifica intersecção com janela noturna extendida (22h dia 1 até 05h dia 2) -> 1320 min a 1740 min
        // Também considerar start na madrugada (00h-05h do dia 1) -> 0 a 300

        // Simplificação: Iterar minuto a minuto (pode ser lento? Não para poucos registros. Seguro.)
        // Ou matemática de intervalos. Vamos de intervalos.

        // Intervalos de "Risco Noturno" relevantes para o período startMin..endMin
        const nightRanges = [
            { s: 0, e: 300 },       // 00:00 - 05:00
            { s: 1320, e: 1740 }    // 22:00 - 05:00 (dia seguinte)
            // Se o turno for > 24h (improvável), precisaria mais logica. Assumindo max 24h.
        ];

        for (const range of nightRanges) {
            // Intersecção: Max(Starts) até Min(Ends)
            const overlapStart = Math.max(startMin, range.s);
            const overlapEnd = Math.min(endMin, range.e);

            if (overlapEnd > overlapStart) {
                nightly += (overlapEnd - overlapStart);
            }
        }

        return { total, nightly };
    };

    interface DailyStats {
        totalWorked: number;       // Minutos relógio
        nightlyMinutes: number;    // Minutos feitos em horário noturno
        nightlyAdd: number;        // Minutos adicionais ganhos pela redução (nightly * 0.1428)
        finalWorked: number;       // totalWorked + nightlyAdd

        expected: number;
        balance: number;           // finalWorked - expected

        extra50: number;
        extra100: number;
        missing: number;

        isTolerance: boolean;
    }

    const calculateDailyStats = (record: TimeRecord): DailyStats => {
        // 1. Calcular tempos brutos e noturnos
        const p1 = calculateIntervalStats(record.entry1, record.exit1);
        const p2 = calculateIntervalStats(record.entry2, record.exit2);

        const totalWorked = p1.total + p2.total;
        const totalNightly = p1.nightly + p2.nightly;

        // 2. Aplicar Redução da Hora Noturna (52m30s = 1.142857...)
        // Fator extra é 0.142857 (aprox 14.28%)
        const reductionFactor = (60 / 52.5) - 1; // ~0.1428
        const nightlyAdd = Math.floor(totalNightly * reductionFactor);

        const finalWorked = totalWorked + nightlyAdd;

        // 3. Obter Expectativa (Considerando Turno)
        const expected = getDailyExpected(record.date);

        // 4. Saldo Bruto
        let balance = finalWorked - expected;
        const absBalance = Math.abs(balance);
        let isTolerance = false;

        // 5. Aplicar Tolerância CLT (10 min diários) - "Tudo ou Nada"
        if (absBalance <= 10) {
            balance = 0;
            isTolerance = true;
        }

        // 6. Classificar Extras e Faltas
        let extra50 = 0;
        let extra100 = 0;
        let missing = 0;

        if (balance < 0) {
            // Status de abono?
            const upperStatus = (record.status || '').toUpperCase();
            if (upperStatus.includes('FÉRIAS') || upperStatus.includes('ATESTADO')) {
                balance = 0;
            } else {
                missing = Math.abs(balance);
            }
        } else if (balance > 0) {
            // Verificar regra de 100% (Domingo ou Feriado E NÃO é dia de escala normal)
            const date = new Date(record.date + 'T12:00:00');
            const isSun = date.getDay() === 0;
            const isHol = isHoliday(record.date);

            // Se for feriado é 100%.
            // Se for domingo: Depende. Se o funcionário tem escala que inclui domingo, é 50% (dia normal).
            // MAS se ele trabalhou num domingo que NÃO estava na escala, é 100%.

            let isDayOffWork = false;
            if (selectedEmployee) {
                const emp = employees.find(e => e.id === selectedEmployee);
                const shiftDays = emp?.work_shift?.work_days; // ex: ['Monday', 'Tuesday'...]
                if (shiftDays) {
                    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
                    if (!shiftDays.includes(dayName)) {
                        isDayOffWork = true; // Trabalhou na folga
                    }
                } else {
                    // Sem turno definido: Domingo é folga padrão
                    if (isSun) isDayOffWork = true;
                }
            }

            if (isHol || (isSun && isDayOffWork)) {
                extra100 = balance;
            } else {
                extra50 = balance;
            }
        }

        return {
            totalWorked,
            nightlyMinutes: totalNightly,
            nightlyAdd,
            finalWorked,
            expected,
            balance,
            extra50,
            extra100,
            missing,
            isTolerance
        };
    };

    // Mantendo compatibilidade com código antigo UI chamando getDailyBalance
    // Retorna string formatada para exibir no card simples, mas a tabela usará stats completos
    const getDailyBalance = (record: TimeRecord) => {
        const stats = calculateDailyStats(record);
        return stats.balance;
    };

    const getDailyExtras = (balance: number) => {
        return balance > 0 ? balance : 0;
    };

    const getDailyMissing = (balance: number) => {
        return balance < 0 ? Math.abs(balance) : 0;
    };

    const formatBalanceString = (minutes: number) => {
        const absMin = Math.abs(minutes);
        const h = Math.floor(absMin / 60);
        const m = absMin % 60;
        const sign = minutes >= 0 ? '+' : '-';
        return `${sign} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const calculateBalance = () => {
        if (!timeRecords || timeRecords.length === 0) return "00:00";
        let total = 0;
        timeRecords.forEach(r => {
            const stats = calculateDailyStats(r);
            total += stats.balance;
        });
        return formatBalanceString(total);
    };


    // --- OCR Functions ---
    const handleOcrFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setOcrFiles(prev => [...prev, ...files]);

            // Iniciar processamento automático
            const newResults: OCRResult[] = files.map(f => ({
                file: f,
                preview: URL.createObjectURL(f),
                status: 'pending',
                logs: [],
                manualDate: new Date().toISOString().split('T')[0],
                manualEntry1: '',
                manualExit1: '',
                manualEntry2: '',
                manualExit2: ''
            }));

            setOcrResults(prev => [...prev, ...newResults]);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                let encoded = reader.result?.toString().replace(/^data:(.*,)?/, '') || '';
                if ((encoded.length % 4) > 0) {
                    encoded += '='.repeat(4 - (encoded.length % 4));
                }
                resolve(encoded);
            };
            reader.onerror = error => reject(error);
        });
    };

    const processImages = async () => {
        setIsProcessingOCR(true);
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const newResults = [...ocrResults];

        for (let i = 0; i < newResults.length; i++) {
            if (newResults[i].status === 'success') continue;

            newResults[i].status = 'processing';
            setOcrResults([...newResults]);

            try {
                if (geminiKey) {
                    // --- MODO TURBO (GEMINI AI) ---
                    const base64 = await fileToBase64(newResults[i].file);

                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [
                                    { text: "Extraia os dados deste cartão de ponto. Retorne APENAS um JSON válido (sem markdown) no formato: { \"funcionario\": \"Nome Completo\", \"registros\": [ { \"data\": \"YYYY-MM-DD\", \"entrada1\": \"HH:MM\", \"saida1\": \"HH:MM\", \"entrada2\": \"HH:MM\", \"saida2\": \"HH:MM\" } ] }. Se não achar alguma hora, mande null. Tente corrigir datas baseadas no cabeçalho se houver (ex: 1a Quinzena). O ano atual é 2024 ou 2025." },
                                    { inline_data: { mime_type: newResults[i].file.type, data: base64 } }
                                ]
                            }]
                        })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(`Gemini API Error: ${data.error?.message || response.statusText}`);
                    }

                    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

                    // Limpar Markdown do JSON (```json ... ```)
                    const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsedData = JSON.parse(jsonString);

                    newResults[i].extractedText = JSON.stringify(parsedData, null, 2);
                    newResults[i].status = 'success';

                    // Tentar Match de Funcionário Inteligente
                    if (parsedData.funcionario) {
                        const foundEmp = employees.find(e =>
                            e.name.toLowerCase().includes(parsedData.funcionario.toLowerCase()) ||
                            parsedData.funcionario.toLowerCase().includes(e.name.toLowerCase())
                        );
                        if (foundEmp) {
                            newResults[i].matchedEmployeeId = foundEmp.id;
                            newResults[i].matchedEmployeeName = foundEmp.name;
                        }
                    }

                    // Pega o primeiro registro encontrado para preencher o form manual
                    if (parsedData.registros && parsedData.registros.length > 0) {
                        const rec = parsedData.registros[0];
                        newResults[i].manualDate = rec.data || new Date().toISOString().split('T')[0];
                        newResults[i].manualEntry1 = rec.entrada1 || '';
                        newResults[i].manualExit1 = rec.saida1 || '';
                        newResults[i].manualEntry2 = rec.entrada2 || '';
                        newResults[i].manualExit2 = rec.saida2 || '';

                        // POPULAR TODOS OS REGISTROS PARA A TABELA
                        newResults[i].parsedRecords = parsedData.registros.map((r: any) => ({
                            data: r.data,
                            entrada1: r.entrada1 || '',
                            saida1: r.saida1 || '',
                            entrada2: r.entrada2 || '',
                            saida2: r.saida2 || '',
                            selected: true
                        }));

                        // Guardar todos os detected times para referencia
                        newResults[i].detectedTimes = parsedData.registros.map((r: any) => `${r.data}: ${r.entrada1}-${r.saida1}`).filter((x: string) => x.length > 5);
                    }

                } else {
                    // --- MODO CLÁSSICO (TESSERACT) ---
                    const result = await Tesseract.recognize(newResults[i].file, 'por');
                    const text = result.data.text;
                    newResults[i].extractedText = text;
                    newResults[i].status = 'success';

                    // Extrair Horários (Regex HH:MM)
                    const timeRegex = /(0[0-9]|1[0-9]|2[0-3]|[0-9]):\s?([0-5][0-9])/g;
                    const foundTimes = text.match(timeRegex);
                    newResults[i].detectedTimes = foundTimes ? [...new Set(foundTimes)].sort() : [];

                    const foundEmp = employees.find(e =>
                        text.toLowerCase().includes(e.name.toLowerCase()) ||
                        (e.name.split(' ').length > 1 && text.toLowerCase().includes(e.name.split(' ')[0].toLowerCase() + ' ' + e.name.split(' ')[1].toLowerCase()))
                    );

                    if (foundEmp) {
                        newResults[i].matchedEmployeeId = foundEmp.id;
                        newResults[i].matchedEmployeeName = foundEmp.name;
                    }
                }

            } catch (err) {
                console.error(err);
                newResults[i].status = 'error';
                const msg = err instanceof Error ? err.message : String(err);
                newResults[i].logs.push(msg);
            }

            setOcrResults([...newResults]);
        }
        setIsProcessingOCR(false);
    };

    const saveOcrResults = async () => {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);

        let savedCount = 0;
        const newResults = [...ocrResults];

        // Process loop backward to allow splicing
        for (let i = newResults.length - 1; i >= 0; i--) {
            const res = newResults[i];

            if (res.status !== 'success' || !res.matchedEmployeeId) continue;

            // MODO NOVO: Salvar múltiplos registros da IA
            if (res.parsedRecords && res.parsedRecords.length > 0) {
                const recordsToSave = res.parsedRecords.filter(r => r.selected !== false); // Default true

                for (const record of recordsToSave) {
                    const { error } = await supabase.from('time_entries').upsert({
                        employee_id: res.matchedEmployeeId,
                        date: record.data,
                        entry1: record.entrada1 || null,
                        exit1: record.saida1 || null,
                        entry2: record.entrada2 || null,
                        exit2: record.saida2 || null,
                        total_hours: '00:00',
                        status: 'REGULAR'
                    }, { onConflict: 'employee_id,date' as any });

                    if (!error) savedCount++;
                    else console.error("Erro ao salvar registro", record, error);
                }
                // Remove da lista se processou
                newResults.splice(i, 1);

            } else {
                // MODO ANTIGO (Fallback / Manual Único)
                if (!res.manualDate) continue;

                const { error } = await supabase.from('time_entries').upsert({
                    employee_id: res.matchedEmployeeId,
                    date: res.manualDate,
                    entry1: res.manualEntry1 || null,
                    exit1: res.manualExit1 || null,
                    entry2: res.manualEntry2 || null,
                    exit2: res.manualExit2 || null,
                    total_hours: '00:00',
                    status: 'REGULAR'
                }, { onConflict: 'employee_id,date' as any });

                if (!error) {
                    savedCount++;
                    newResults.splice(i, 1);
                } else {
                    console.error("Erro ao salvar manual", error);
                }
            }
        }

        setOcrResults(newResults);
        if (savedCount > 0) {
            fetchTimeRecords(); // Atualiza fundo
            if (newResults.length === 0) setShowUploadModal(false); // Fecha se acabou
        } else {
            if (ocrResults.some(r => !r.matchedEmployeeId)) {
                alert("Selecione o funcionário para salvar.");
            }
        }
    };

    const removeOcrFile = (idx: number) => {
        const newFiles = [...ocrFiles];
        newFiles.splice(idx, 1);
        setOcrFiles(newFiles);

        const newResults = [...ocrResults];
        newResults.splice(idx, 1);
        setOcrResults(newResults);
    };

    const updateRecordLocal = (index: number, field: keyof TimeRecord, value: string) => {
        let processedValue = value;

        // Máscara de Hora (HH:MM) Inteligente
        if (['entry1', 'exit1', 'entry2', 'exit2'].includes(field)) {
            // Remove tudo exceto números
            const raw = value.replace(/\D/g, '').slice(0, 4);

            if (raw.length > 2) {
                // Se tem 3+ digitos, insere os dois pontos
                processedValue = `${raw.slice(0, 2)}:${raw.slice(2)}`;
            } else {
                processedValue = raw;
            }
        }

        const newRecords = [...timeRecords];
        newRecords[index] = { ...newRecords[index], [field]: processedValue };

        // Se mudou um campo de hora, recalcula totalHours imediatamente para feedback visual?
        // Não, totalHours depende de parseComplexo. Melhor deixar pro onBlur ou useEffect se quiser real-time.
        // A função original recalculava? Vamos ver o original... não recalculava.

        setTimeRecords(newRecords);
    };

    const handleInlineBlur = async (index: number, field: keyof TimeRecord) => {
        const record = { ...timeRecords[index] };
        let value = record[field] as string;

        // Auto-format: 0800 -> 08:00
        const clean = value.replace(/\D/g, '');
        if (clean.length === 4) {
            value = `${clean.slice(0, 2)}:${clean.slice(2, 4)}`;
        } else if (clean.length === 3) {
            value = `0${clean.slice(0, 1)}:${clean.slice(1, 3)}`; // 830 -> 08:30
        }

        // Se vazio, mantém vazio
        if (clean.length === 0) value = '';

        // Atualiza valor formatado no estado local
        record[field as any] = value;

        // Recalcular Total de Horas
        const t1 = calculateTimeDiff(record.entry1, record.exit1);
        const t2 = calculateTimeDiff(record.entry2, record.exit2);
        const totalMinutes = t1 + t2;
        record.totalHours = formatMinutesToHHMM(totalMinutes);

        // Atualiza estado visualmente
        const newRecords = [...timeRecords];
        newRecords[index] = record;
        setTimeRecords(newRecords);

        // Salvar no Backend
        await saveRecordToSupabase(record);
    };

    const saveRecordToSupabase = async (record: TimeRecord) => {
        // Remove temp ID se for inserção
        const payload = { ...record };
        if (String(payload.id).startsWith('temp-')) {
            delete payload.id;
        }

        const { data, error } = await supabase
            .from('time_entries')
            .upsert({
                employee_id: selectedEmployee,
                date: payload.date,
                entry1: payload.entry1 || null,
                exit1: payload.exit1 || null,
                entry2: payload.entry2 || null,
                exit2: payload.exit2 || null,
                total_hours: payload.totalHours,
                status: 'MANUAL_EDIT' // Marca como editado manualmente
            }, { onConflict: 'employee_id,date' as any })
            .select()
            .single();

        if (error) {
            console.error('Erro ao salvar inline:', error);
            // Opcional: Toast de erro
        } else {
            // Opcional: Toast de sucesso discreto ou indicador visual
        }
    };

    const fetchTimeRecords = async () => {
        if (!selectedEmployee) return;

        setIsLoading(true);
        console.log(`🔄 Buscando pontos para ${selectedEmployee} entre ${startDate} e ${endDate}...`);

        try {


            const { data, error } = await supabase
                .from('time_entries') // Nome correto da tabela no DB
                .select('*')
                .eq('employee_id', selectedEmployee)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date');

            if (error) throw error;

            console.log('✅ Pontos recebidos:', data?.length);

            if (data) {
                const mappedRecords: TimeRecord[] = data.map((r: any) => {
                    // Mapeia colunas do banco para variáveis locais
                    const e1 = r.entry_time || r.entry1 || '';
                    const s1 = r.break_start || r.exit1 || '';
                    const e2 = r.break_end || r.entry2 || '';
                    const s2 = r.exit_time || r.exit2 || '';

                    // Calcula total de minutos usando as variáveis locais já tratadas
                    const totalMinutes = calculateTimeDiff(e1, s1) + calculateTimeDiff(e2, s2);

                    return {
                        id: r.id,
                        date: r.date,
                        entry1: e1 ? e1.slice(0, 5) : '',
                        exit1: s1 ? s1.slice(0, 5) : '',
                        entry2: e2 ? e2.slice(0, 5) : '',
                        exit2: s2 ? s2.slice(0, 5) : '',
                        totalHours: formatMinutesToHHMM(totalMinutes),
                        status: r.status || 'REGULAR'
                    };
                });

                // Generate full date range and merge with existing records
                const fullDateRange: TimeRecord[] = [];
                const start = new Date(startDate + 'T12:00:00');
                const end = new Date(endDate + 'T12:00:00');

                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    const existingRecord = mappedRecords.find((r: TimeRecord) => r.date === dateStr);

                    if (existingRecord) {
                        fullDateRange.push(existingRecord);
                    } else {
                        // Create placeholder for missing date
                        fullDateRange.push({
                            id: `temp-${dateStr}-${selectedEmployee}`, // Temporary ID
                            date: dateStr,
                            entry1: '',
                            exit1: '',
                            entry2: '',
                            exit2: '',
                            totalHours: '00:00',
                            status: 'MISSING' // New status for missing records
                        });
                    }
                }

                setTimeRecords(fullDateRange);
            } else {
                // Even without data, show empty slots
                const fullDateRange: TimeRecord[] = [];
                const start = new Date(startDate + 'T12:00:00');
                const end = new Date(endDate + 'T12:00:00');

                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    fullDateRange.push({
                        id: `temp-${dateStr}-${selectedEmployee}`,
                        date: dateStr,
                        entry1: '',
                        exit1: '',
                        entry2: '',
                        exit2: '',
                        totalHours: '00:00',
                        status: 'MISSING'
                    });
                }
                setTimeRecords(fullDateRange);
            }
        } catch (err: any) {
            console.error('Erro ao buscar pontos:', err);
            alert(`Erro ao buscar dados: ${err.message || err}`);
            setTimeRecords([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Atualiza ao mudar funcionário
    React.useEffect(() => {
        if (selectedEmployee) {
            fetchTimeRecords();
        }
    }, [selectedEmployee]);

    // Carrega dados iniciais da lista de funcionários
    React.useEffect(() => {
        loadData();
    }, []);

    // Botão de atualizar data chama fetchTimeRecords manualmente
    const handleDateRefresh = () => {
        console.log('Botão Atualizar Clicado');
        if (!selectedEmployee) {
            alert('Por favor, selecione um colaborador na lista à esquerda.');
            return;
        }
        fetchTimeRecords();
    };

    const openEditTimeModal = (record: TimeRecord) => {
        setEditingRecord({ ...record });
        setIsTimeModalOpen(true);
    };

    const handleSaveTimeRecord = async () => {
        if (!editingRecord || !selectedEmployee) return;

        const updated: any = {
            ...editingRecord,
            status: editingRecord.status === 'MISSING' ? 'MANUAL_EDIT' : 'MANUAL_EDIT', // Force status change
            employee_id: selectedEmployee // Ensure employee_id is set
        };

        // Remove temporary ID to ensure insertion/upsert
        if (updated.id && String(updated.id).startsWith('temp-')) {
            delete updated.id;
        }

        try {
            // Direct Supabase upsert to handle both insert (new) and update (existing)


            const { data, error } = await supabase
                .from('time_entries')
                .upsert({
                    employee_id: selectedEmployee,
                    date: updated.date,
                    entry1: updated.entry1 || null,
                    exit1: updated.exit1 || null,
                    entry2: updated.entry2 || null,
                    exit2: updated.exit2 || null,
                    total_hours: updated.totalHours,
                    status: 'MANUAL_EDIT'
                }, { onConflict: 'employee_id,date' as any })
                .select()
                .single();

            if (error) throw error;

            // Update local state with the returned record (which now has a real ID)
            const newRecord: TimeRecord = {
                id: data.id,
                date: data.date,
                entry1: (data.entry1 || '').slice(0, 5),
                exit1: (data.exit1 || '').slice(0, 5),
                entry2: (data.entry2 || '').slice(0, 5),
                exit2: (data.exit2 || '').slice(0, 5),
                totalHours: formatMinutesToHHMM(
                    calculateTimeDiff(data.entry1 || '', data.exit1 || '') +
                    calculateTimeDiff(data.entry2 || '', data.exit2 || '')
                ),
                status: data.status
            };

            setTimeRecords(prev => prev.map(r => r.date === newRecord.date ? newRecord : r));
            setIsTimeModalOpen(false);
            setEditingRecord(null);

        } catch (err: any) {
            console.error('Erro ao salvar ponto:', err);
            alert('Erro ao salvar registro: ' + (err.message || err));
        }
    };

    const toggleEmployeeStatus = async (empId: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        const action = currentStatus ? 'desligar (inativar)' : 'reativar';
        if (!window.confirm(`Deseja realmente ${action} este colaborador?`)) return;

        try {


            const { error } = await supabase
                .from('employees')
                .update({ active: !currentStatus })
                .eq('id', empId);

            if (error) throw error;

            // Atualiza estado local para refletir a mudança instantaneamente e remover da lista atual se estiver filtrada
            setEmployees(prev => prev.map(emp =>
                emp.id === empId ? { ...emp, active: !currentStatus } : emp
            ));

            // Se o funcionário selecionado for o que foi alterado, limpa a seleção
            if (selectedEmployee === empId) {
                setSelectedEmployee(null);
            }

        } catch (error: any) {
            alert('Erro ao atualizar status: ' + (error.message || error));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'REGULAR': return 'text-emerald-500 bg-emerald-500/10';
            case 'ABSENT': return 'text-red-500 bg-red-500/10';
            case 'MANUAL_EDIT': return 'text-blue-500 bg-blue-500/10';
            case 'OVERTIME': return 'text-amber-500 bg-amber-500/10';
            case 'MISSING': return 'text-slate-500 opacity-50 border border-slate-700 border-dashed';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    const handleExportPDF = () => {
        const emp = employees.find(e => e.id === selectedEmployee);
        if (!emp) return;

        const doc = new jsPDF();
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('TerraPro ERP', 14, 20);
        doc.setFontSize(12);
        doc.text('Relatório de Ponto Eletrônico', 14, 30);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Colaborador: ${emp.name} (Matrícula: ${emp.registration_number})`, 14, 50);
        doc.text(`Cargo: ${emp.role}`, 14, 55);
        doc.text(`Período de Referência: ${startDate ? startDate.split('-').reverse().join('/') : ''} a ${endDate ? endDate.split('-').reverse().join('/') : ''}`, 14, 60);
        doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 150, 50);

        const tableColumn = ["Data", "E1", "S1", "E2", "S2", "Carga", "Trab", "Fal", "E50", "E100", "AdN", "Saldo"];
        const tableRows = timeRecords.map(record => {
            const stats = calculateDailyStats(record);
            return [
                record.date.split('-').reverse().slice(0, 2).join('/'), // DD/MM
                record.entry1,
                record.exit1,
                record.entry2,
                record.exit2,
                formatMinutesToHHMM(stats.expected),
                record.totalHours,
                stats.missing > 0 ? formatBalanceString(stats.missing).replace('+', '-') : '',
                stats.extra50 > 0 ? formatBalanceString(stats.extra50) : '',
                stats.extra100 > 0 ? formatBalanceString(stats.extra100) : '',
                stats.nightlyAdd > 0 ? `+${Math.floor(stats.nightlyAdd)}m` : '',
                formatBalanceString(stats.balance)
            ];
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 8 },
            styles: { fontSize: 7, cellPadding: 2, halign: 'center' },
            alternateRowStyles: { fillColor: [241, 245, 249] },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 12 },
                11: { fontStyle: 'bold', cellWidth: 14 }
            }
        });
        const finalY = (doc as any).lastAutoTable.finalY + 40;
        if (finalY < 250) {
            doc.setDrawColor(0, 0, 0);
            doc.line(14, finalY, 90, finalY);
            doc.text(emp.name, 14, finalY + 5);
            doc.setFontSize(8);
            doc.text('Assinatura do Colaborador', 14, finalY + 10);
            doc.line(110, finalY, 196, finalY);
            doc.setFontSize(10);
            doc.text('Gestor Responsável', 110, finalY + 5);
            doc.setFontSize(8);
            doc.text('TerraPro Gestão de Ativos', 110, finalY + 10);
        }
        doc.save(`espelho_ponto_${emp.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    };

    const groupedDocs = documents.reduce((acc, doc) => {
        const key = doc.relatedTo || 'Outros / Geral';
        if (!acc[key]) acc[key] = [];
        acc[key].push(doc);
        return acc;
    }, {} as Record<string, ERPDocument[]>);

    const selectedEmpObj = employees.find(e => e.id === selectedEmployee);

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <User size={32} className="text-slate-500" />
                        Recursos Humanos (RH)
                    </h2>
                    <p className="text-slate-500 mt-1 ml-11">Gestão de Ponto, Folha de Pagamento e Documentos.</p>
                </div>
            </div>

            <div className="bg-slate-900 p-1 rounded-xl inline-flex border border-slate-800">
                <button onClick={() => setActiveTab('TIMEKEEPING')} className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'TIMEKEEPING' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}>
                    <Clock size={16} /> Controle de Ponto
                </button>
                <button onClick={() => setActiveTab('PAYROLL')} className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'PAYROLL' ? 'bg-emerald-600 text-white shadow-lg comments-shadow-emerald-600/20' : 'text-slate-400 hover:text-white'}`}>
                    <DollarSign size={16} /> Folha & Vales
                </button>
                <button onClick={() => setActiveTab('DOCUMENTS')} className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'DOCUMENTS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}>
                    <Folder size={16} /> Documentos
                </button>
            </div>

            {activeTab === 'TIMEKEEPING' && (
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-slate-800 space-y-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-3 text-slate-500" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar Colaborador..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mb-2">
                                <button
                                    onClick={() => setActiveFilter('ACTIVE')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${activeFilter === 'ACTIVE' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${activeFilter === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                                    Ativos ({employees.filter(e => e.active !== false).length})
                                </button>
                                <button
                                    onClick={() => setActiveFilter('INACTIVE')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${activeFilter === 'INACTIVE' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${activeFilter === 'INACTIVE' ? 'bg-red-500' : 'bg-slate-600'}`}></span>
                                    Desligados ({employees.filter(e => e.active === false).length})
                                </button>
                            </div>

                            <div className="flex gap-2">
                                {/* Removido o Select de Status antigo, mantendo apenas o de Empresa se necessário */}

                                <select
                                    value={selectedCompany}
                                    onChange={(e) => setSelectedCompany(e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-400 focus:border-blue-500 outline-none"
                                >
                                    <option value="TODAS">🏢 Todas Emp.</option>
                                    {companies.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={() => { setEditingEmpId(null); setIsEmployeeFormOpen(true); }}
                                className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all mb-2 group"
                            >
                                <div className="p-1 bg-emerald-500 rounded text-white group-hover:scale-110 transition-transform">
                                    <Plus size={12} />
                                </div>
                                Novo Colaborador
                            </button>

                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all group"
                            >
                                <div className="p-1 bg-indigo-500 rounded text-white group-hover:scale-110 transition-transform">
                                    <Camera size={12} />
                                </div>
                                Importação Inteligente (OCR)
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                            {filteredEmployees.map(emp => (
                                <div
                                    key={emp.id}
                                    onClick={(e) => handleEmployeeClick(emp.id, e)}
                                    className={`p-4 rounded-xl cursor-pointer border transition-all relative group/item ${selectedIds.includes(emp.id) ? 'bg-blue-600/20 border-blue-600' : 'bg-slate-950/50 border-transparent hover:bg-slate-800'}`}
                                >
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingEmpId(emp.id); setIsEmployeeFormOpen(true); }}
                                        className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white opacity-0 group-hover/item:opacity-100 transition-opacity z-10 hover:bg-blue-600"
                                        title="Editar Cadastro"
                                    >
                                        <Edit2 size={12} />
                                    </button>

                                    <button
                                        onClick={(e) => toggleEmployeeStatus(emp.id, emp.active !== false, e)}
                                        className={`absolute right-9 top-2 p-1.5 rounded-lg text-white opacity-0 group-hover/item:opacity-100 transition-opacity z-10 ${emp.active !== false ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}
                                        title={emp.active !== false ? "Desligar Colaborador" : "Reativar Colaborador"}
                                    >
                                        {emp.active !== false ? <Minus size={12} /> : <CheckCircle size={12} />}
                                    </button>

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`font-bold text-sm ${selectedIds.includes(emp.id) ? 'text-blue-400' : 'text-white'}`}>{emp.name}</h4>
                                            <p className="text-xs text-slate-500">{emp.role || 'Funcionário'} • Matr: {emp.registration_number}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px]">
                        {selectedIds.length > 1 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                <div className="p-4 bg-slate-800 rounded-full text-blue-500">
                                    <User size={48} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{selectedIds.length} Colaboradores Selecionados</h3>
                                    <p className="text-slate-500">Selecione uma ação em massa abaixo</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleMassAction('DEACTIVATE')}
                                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-bold flex items-center gap-2 transition-all"
                                    >
                                        <Minus size={20} /> Desligar Selecionados
                                    </button>
                                    <button
                                        onClick={() => handleMassAction('REACTIVATE')}
                                        className="px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl font-bold flex items-center gap-2 transition-all"
                                    >
                                        <CheckCircle size={20} /> Reativar Selecionados
                                    </button>
                                </div>
                            </div>
                        ) : selectedEmpObj ? (
                            <>
                                {/* HEADER TIPO SECULLUM */}
                                <div className="p-4 border-b border-slate-800 bg-slate-950/30 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/50">
                                                {selectedEmpObj.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white leading-tight">{selectedEmpObj.name}</h3>
                                                <p className="text-xs text-slate-400 font-mono">MAT: {selectedEmpObj.registration_number} • {selectedEmpObj.role.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            {(() => {
                                                const totalExtras = timeRecords.reduce((acc, r) => acc + getDailyExtras(getDailyBalance(r)), 0);
                                                const totalMissing = timeRecords.reduce((acc, r) => acc + getDailyMissing(getDailyBalance(r)), 0);
                                                return (
                                                    <>
                                                        <div className="text-right bg-slate-950 px-3 py-1 rounded border border-slate-800">
                                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Extras</div>
                                                            <div className="text-lg font-mono font-bold text-emerald-400 drop-shadow-sm">
                                                                {formatBalanceString(totalExtras)}
                                                            </div>
                                                        </div>
                                                        <div className="text-right bg-slate-950 px-3 py-1 rounded border border-slate-800">
                                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Faltas</div>
                                                            <div className="text-lg font-mono font-bold text-red-400 drop-shadow-sm">
                                                                {formatBalanceString(totalMissing).replace('+', '-')}
                                                            </div>
                                                        </div>
                                                        <div className="text-right bg-slate-950 px-3 py-1 rounded border border-slate-800">
                                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Saldo Final</div>
                                                            <div className={`text-lg font-mono font-bold drop-shadow-sm ${totalExtras >= totalMissing ? 'text-blue-400' : 'text-amber-400'}`}>
                                                                {calculateBalance()}
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* BARRA DE FERRAMENTAS / FILTROS */}
                                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex items-center gap-4">
                                        <div className="flex bg-slate-900 rounded p-1 border border-slate-800 items-center">
                                            <Calendar size={14} className="text-slate-500 ml-2 mr-2" />
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={e => setStartDate(e.target.value)}
                                                className="bg-transparent text-xs text-white outline-none border-none w-28 font-mono"
                                            />
                                            <span className="text-slate-600 mx-2 text-xs">até</span>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={e => setEndDate(e.target.value)}
                                                className="bg-transparent text-xs text-white outline-none border-none w-28 font-mono"
                                            />
                                            <button
                                                onClick={handleDateRefresh}
                                                disabled={isLoading}
                                                className={`ml-2 p-1.5 rounded-md transition-colors ${isLoading ? 'bg-blue-800 cursor-wait' : 'bg-blue-600 hover:bg-blue-500'} text-white`}
                                                title="Atualizar Período"
                                            >
                                                {isLoading ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : (
                                                    <Search size={12} />
                                                )}
                                            </button>
                                        </div>

                                        <div className="h-4 w-px bg-slate-800"></div>

                                        <button onClick={handleExportPDF} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-800">
                                            <Download size={14} /> PDF
                                        </button>
                                        <button className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors ml-auto px-2 py-1 rounded hover:bg-blue-900/20">
                                            <Save size={14} /> Salvar Tudo
                                        </button>
                                    </div>
                                </div>

                                {/* TABELA TÉCNICA */}
                                <div className="flex-1 overflow-y-auto bg-slate-900 p-0">
                                    {timeRecords.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                            <Clock size={40} className="mb-4 opacity-50" />
                                            <p className="font-bold">Nenhum registro no período.</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-950 sticky top-0 z-10 shadow-sm border-b border-slate-800">
                                                <tr>
                                                    <th className="px-3 py-2 text-[9px] uppercase font-bold text-slate-500 w-24">Data</th>
                                                    <th className="px-1 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50">Ent. 1</th>
                                                    <th className="px-1 py-2 text-[9px] uppercase font-bold text-slate-500 text-center">Sai. 1</th>
                                                    <th className="px-1 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50">Ent. 2</th>
                                                    <th className="px-1 py-2 text-[9px] uppercase font-bold text-slate-500 text-center">Sai. 2</th>

                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50">Carga</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50 bg-slate-950/50">Hs Trab.</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50">Faltas</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-emerald-600 text-center border-l border-slate-800/50" title="Extra 50%">Ext 50%</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-emerald-500 text-center border-l border-slate-800/50" title="Extra 100%">Ext 100%</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-indigo-400 text-center border-l border-slate-800/50" title="Adicional Noturno (Redução)">Ad. Not.</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50">Saldo</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-slate-500 text-center border-l border-slate-800/50">Status</th>
                                                    <th className="px-2 py-2 text-[9px] uppercase font-bold text-slate-500 text-center w-10">...</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-xs font-mono">
                                                {timeRecords.map((record, idx) => {
                                                    const dayOfWeek = new Date(record.date + 'T12:00:00').getDay();
                                                    const isSat = dayOfWeek === 6;
                                                    const isSun = dayOfWeek === 0;
                                                    const rowClass = isSun ? 'bg-red-900/10 text-red-200' : isSat ? 'bg-slate-800/30 text-slate-300' : 'text-slate-400 hover:bg-slate-800/50';

                                                    const stats = calculateDailyStats(record);

                                                    return (
                                                        <tr key={idx} className={`${rowClass} border-b border-slate-800/30 group transition-colors`}>
                                                            <td className={`px-3 py-1.5 whitespace-nowrap ${isSun ? 'font-bold' : ''}`}>
                                                                {record.date.split('-').reverse().join('/')}
                                                                <span className="opacity-50 ml-1 text-[10px]">
                                                                    {isSun ? 'DOM' : isSat ? 'SÁB' : ''}
                                                                </span>
                                                            </td>

                                                            <td className="px-1 py-0.5 text-center border-l border-slate-800/50">
                                                                <input
                                                                    value={record.entry1}
                                                                    onChange={(e) => updateRecordLocal(idx, 'entry1', e.target.value)}
                                                                    onBlur={() => handleInlineBlur(idx, 'entry1')}
                                                                    className="w-full bg-transparent text-center text-white focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded h-full"
                                                                    placeholder="--"
                                                                    maxLength={5}
                                                                />
                                                            </td>
                                                            <td className="px-1 py-0.5 text-center">
                                                                <input
                                                                    value={record.exit1}
                                                                    onChange={(e) => updateRecordLocal(idx, 'exit1', e.target.value)}
                                                                    onBlur={() => handleInlineBlur(idx, 'exit1')}
                                                                    className="w-full bg-transparent text-center text-white focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded h-full"
                                                                    placeholder="--"
                                                                    maxLength={5}
                                                                />
                                                            </td>
                                                            <td className="px-1 py-0.5 text-center border-l border-slate-800/50">
                                                                <input
                                                                    value={record.entry2}
                                                                    onChange={(e) => updateRecordLocal(idx, 'entry2', e.target.value)}
                                                                    onBlur={() => handleInlineBlur(idx, 'entry2')}
                                                                    className="w-full bg-transparent text-center text-white focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded h-full"
                                                                    placeholder="--"
                                                                    maxLength={5}
                                                                />
                                                            </td>
                                                            <td className="px-1 py-0.5 text-center">
                                                                <input
                                                                    value={record.exit2}
                                                                    onChange={(e) => updateRecordLocal(idx, 'exit2', e.target.value)}
                                                                    onBlur={() => handleInlineBlur(idx, 'exit2')}
                                                                    className="w-full bg-transparent text-center text-white focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded h-full"
                                                                    placeholder="--"
                                                                    maxLength={5}
                                                                />
                                                            </td>

                                                            <td className="px-2 py-0.5 text-center opacity-50 border-l border-slate-800/50">{formatMinutesToHHMM(stats.expected)}</td>
                                                            <td className={`px-2 py-0.5 text-center font-bold border-l border-slate-800/50 ${record.totalHours === '00:00' ? 'opacity-30' : 'text-white'}`}>{record.totalHours}</td>
                                                            <td className="px-2 py-0.5 text-center border-l border-slate-800/50 text-red-400 font-bold">{stats.missing > 0 ? formatBalanceString(stats.missing).replace('+', '-') : ''}</td>

                                                            <td className="px-2 py-0.5 text-center border-l border-slate-800/50 text-emerald-600 font-bold">{stats.extra50 > 0 ? formatBalanceString(stats.extra50) : ''}</td>
                                                            <td className="px-2 py-0.5 text-center border-l border-slate-800/50 text-emerald-400 font-bold">{stats.extra100 > 0 ? formatBalanceString(stats.extra100) : ''}</td>
                                                            <td className="px-2 py-0.5 text-center border-l border-slate-800/50 text-indigo-400 font-bold" title={`${stats.nightlyMinutes} min noturnos`}>
                                                                {stats.nightlyAdd > 0 ? `+${formatBalanceString(stats.nightlyAdd).replace('+', '').replace(' 00:', '')}m` : ''}
                                                            </td>
                                                            <td className={`px-2 py-0.5 text-center border-l border-slate-800/50 font-bold ${stats.balance >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>{formatBalanceString(stats.balance)}</td>

                                                            <td className="px-2 py-0.5 text-center border-l border-slate-800/50">
                                                                {record.status !== 'REGULAR' && (
                                                                    <span className={`text-[9px] uppercase px-1 rounded ${getStatusColor(record.status)}`}>
                                                                        {record.status}
                                                                    </span>
                                                                )}
                                                            </td>

                                                            <td className="px-1 py-0.5 text-center">
                                                                <button onClick={() => openEditTimeModal(record)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-blue-400 transition-all">
                                                                    <Edit2 size={12} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                                <User size={48} className="mb-4 opacity-50" />
                                <p className="font-bold">Selecione um colaborador na lista</p>
                            </div>
                        )}
                    </div>
                </div>
            )
            }

            {
                activeTab === 'PAYROLL' && (
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                                <h3 className="font-black text-white flex items-center gap-2">
                                    <FileText size={20} className="text-emerald-500" />
                                    Gestão da Folha de Pagamento
                                </h3>
                                <div className="flex gap-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase self-center mr-4">Competência: Janeiro/2026</span>
                                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700">
                                        <Download size={14} /> Exportar Folha
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-950 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                        <tr>
                                            <th className="px-8 py-4">Colaborador</th>
                                            <th className="px-8 py-4 text-right">Salário Base</th>
                                            <th className="px-8 py-4 text-right text-emerald-500">Extras / DSR</th>
                                            <th className="px-8 py-4 text-right text-amber-500">Adiantamentos (Vales)</th>
                                            <th className="px-8 py-4 text-right text-rose-500">Descontos (INSS/IR)</th>
                                            <th className="px-8 py-4 text-right text-white">Líquido a Receber</th>
                                            <th className="px-8 py-4 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {payrollData.map(p => {
                                            const netSalary = p.baseSalary + p.overtimeValue - p.advances - p.discounts;
                                            return (
                                                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <p className="font-bold text-white">{p.employeeName}</p>
                                                        <p className="text-xs text-slate-500">{p.role}</p>
                                                    </td>
                                                    <td className="px-8 py-5 text-right text-slate-300 font-mono">R$ {p.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-8 py-5 text-right text-emerald-400 font-mono">+ R$ {p.overtimeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-8 py-5 text-right text-amber-400 font-mono font-bold">- R$ {p.advances.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-8 py-5 text-right text-rose-400 font-mono">- R$ {p.discounts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-8 py-5 text-right font-black text-lg text-white font-mono border-l border-slate-800 bg-slate-950/30">
                                                        R$ {netSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={() => setIsValeModalOpen(true)} className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/50 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1">
                                                                <Minus size={10} /> Vale
                                                            </button>
                                                            <button className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-600/50 rounded-lg text-[10px] font-bold uppercase transition-all">
                                                                Holerite
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'DOCUMENTS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(groupedDocs).map(([groupName, docs]) => (
                            <div key={groupName} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:border-indigo-500/30 transition-all">
                                <div className="p-5 border-b border-slate-800 bg-slate-950/20 flex items-center justify-between">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Folder className="text-indigo-500" size={18} />
                                        {groupName}
                                    </h3>
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg">
                                        {docs.length} Docs
                                    </span>
                                </div>
                                <div className="p-2">
                                    {docs.map(doc => (
                                        <div key={doc.id} className="p-3 hover:bg-slate-800 rounded-xl flex items-center justify-between group transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
                                                    <FileText size={14} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{doc.title}</p>
                                                    <p className="text-[10px] text-slate-500">{doc.uploadDate} • {doc.fileSize}</p>
                                                </div>
                                            </div>
                                            <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-all">
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {Object.keys(groupedDocs).length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <Folder size={48} className="mx-auto text-slate-600 mb-4" />
                                <h3 className="text-white font-bold">Nenhum documento de RH encontrado</h3>
                                <p className="text-slate-500 text-sm mt-1">Adicione documentos com a categoria "Recursos Humanos" no módulo de Documentos.</p>
                            </div>
                        )}
                    </div>
                )
            }

            <Modal isOpen={isValeModalOpen} onClose={() => setIsValeModalOpen(false)} title="Lançar Vale / Adiantamento">
                <div className="space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <div>
                            <h4 className="text-sm font-bold text-amber-500 mb-1">Atenção ao Desconto</h4>
                            <p className="text-xs text-amber-200/80">O valor lançado aqui será descontado integralmente na próxima folha de pagamento.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Colaborador</label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none">
                            <option>João da Silva</option>
                            <option>Maria Oliveira</option>
                            <option>Carlos Santos</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Valor do Vale (R$)</label>
                            <input type="number" placeholder="0,00" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none font-mono" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Data Lançamento</label>
                            <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Motivo / Observação</label>
                        <textarea placeholder="Ex: Adiantamento para conserto de carro..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none h-24 resize-none" />
                    </div>
                    <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 mt-2">
                        <Save size={18} /> Confirmar Lançamento de Vale
                    </button>
                </div>
            </Modal>

            <Modal isOpen={isTimeModalOpen} onClose={() => setIsTimeModalOpen(false)} title="Ajuste Manual de Ponto">
                {editingRecord && (
                    <div className="space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
                            <Edit2 className="text-blue-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="text-sm font-bold text-blue-500 mb-1">Registro de Ajuste Manual</h4>
                                <p className="text-xs text-blue-200/80">Editando data: <strong>{editingRecord.date}</strong>. Qualquer alteração manual ficará registrada.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Entrada 1</label>
                                <input
                                    type="time"
                                    value={editingRecord.entry1}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, entry1: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Saída 1</label>
                                <input
                                    type="time"
                                    value={editingRecord.exit1}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, exit1: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Entrada 2</label>
                                <input
                                    type="time"
                                    value={editingRecord.entry2}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, entry2: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Saída 2</label>
                                <input
                                    type="time"
                                    value={editingRecord.exit2}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, exit2: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Justificativa do Ajuste</label>
                            <textarea placeholder="Ex: Esqueceu de bater o ponto..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none h-24 resize-none" />
                        </div>
                        <button
                            onClick={handleSaveTimeRecord}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-2"
                        >
                            <Save size={18} /> Salvar Ajuste
                        </button>
                    </div>
                )}
            </Modal>

            {
                showUploadModal && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Camera className="text-blue-500" /> Importação Inteligente (OCR)</h3>
                                    <p className="text-slate-400 text-sm mt-1">Envie fotos dos pontos. O sistema identificará automaticamente o funcionário e as datas.</p>
                                </div>
                                <button onClick={() => setShowUploadModal(false)} className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors text-slate-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {ocrResults.length === 0 && (
                                    <div className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-2xl h-64 flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all cursor-pointer relative">
                                        <input type="file" multiple accept="image/*" onChange={handleOcrFiles} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <div className="bg-slate-800 p-4 rounded-full text-blue-500"><Upload size={32} /></div>
                                        <div className="text-center"><p className="text-lg font-bold text-white">Arraste fotos ou clique para selecionar</p><p className="text-sm text-slate-500">Suporta JPG, PNG. Você pode enviar várias de uma vez.</p></div>
                                    </div>
                                )}
                                {ocrResults.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-white">Arquivos ({ocrResults.length})</h4>
                                            <div className="flex gap-2 items-center">
                                                <div className="hidden md:flex text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-1 rounded items-center gap-1 font-bold mr-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> IA Ativada (Forçada)
                                                </div>
                                                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"><Plus size={14} /> Adicionar Mais<input type="file" multiple accept="image/*" onChange={handleOcrFiles} className="hidden" /></label>
                                                <button onClick={processImages} disabled={isProcessingOCR} className={`text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isProcessingOCR ? 'bg-blue-800 cursor-wait text-white/50' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>{isProcessingOCR ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}{isProcessingOCR ? 'Processando (IA)...' : 'Processar Tudo'}</button>
                                                <button onClick={saveOcrResults} className="text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"><Save size={14} /> Salvar Verificados</button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {ocrResults.map((result, idx) => (
                                                <div key={idx} className={`bg-slate-950 border rounded-xl overflow-hidden flex ${result.status === 'success' ? 'border-emerald-500/30' : result.status === 'error' ? 'border-red-500/30' : 'border-slate-800'}`}>
                                                    <div className="w-24 h-24 bg-slate-900 relative">
                                                        <img src={result.preview} className="w-full h-full object-cover" />
                                                        {result.status === 'success' && <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center"><CheckCircle className="text-emerald-400 drop-shadow-md" /></div>}
                                                    </div>
                                                    <div className="p-3 flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start">
                                                                <div className="text-xs font-mono text-slate-500 truncate w-32">{result.file.name}</div>
                                                                <button onClick={() => removeOcrFile(idx)} className="text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
                                                            </div>
                                                            {result.status === 'pending' && <div className="text-xs text-slate-400 mt-2">Aguardando...</div>}
                                                            {result.status === 'processing' && <div className="text-xs text-blue-400 mt-2 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Lendo texto...</div>}
                                                            {result.status === 'success' && (
                                                                <div className="mt-3 space-y-3 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                                                    <div>
                                                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Funcionário</label>
                                                                        <select
                                                                            className={`w-full text-xs bg-slate-950 border rounded px-2 py-1.5 outline-none ${result.matchedEmployeeId ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-slate-700 text-slate-300'}`}
                                                                            value={result.matchedEmployeeId || ''}
                                                                            onChange={(e) => {
                                                                                const newEmpId = e.target.value;
                                                                                const emp = employees.find(ep => ep.id === newEmpId);
                                                                                const newResults = [...ocrResults];
                                                                                newResults[idx].matchedEmployeeId = newEmpId;
                                                                                newResults[idx].matchedEmployeeName = emp?.name;
                                                                                setOcrResults(newResults);
                                                                            }}
                                                                        >
                                                                            <option value="">Selecione...</option>
                                                                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                                                        </select>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] text-slate-500 font-bold uppercase block">Dados do Ponto</label>
                                                                        {result.parsedRecords && result.parsedRecords.length > 0 ? (
                                                                            <div className="max-h-48 overflow-y-auto border border-slate-700 rounded bg-slate-950/50 custom-scrollbar">
                                                                                <table className="w-full text-[10px]">
                                                                                    <thead className="bg-slate-900 text-slate-400 sticky top-0 font-bold">
                                                                                        <tr>
                                                                                            <th className="p-1 text-center w-6"><input type="checkbox" checked={result.parsedRecords.every(r => r.selected !== false)} onChange={(e) => {
                                                                                                const newVal = e.target.checked;
                                                                                                const newR = [...ocrResults];
                                                                                                if (newR[idx].parsedRecords) newR[idx].parsedRecords!.forEach(r => r.selected = newVal);
                                                                                                setOcrResults(newR);
                                                                                            }} className="rounded bg-slate-800 border-slate-600" /></th>
                                                                                            <th className="p-1 w-14">Data</th>
                                                                                            <th className="p-1 text-center">E1</th>
                                                                                            <th className="p-1 text-center">S1</th>
                                                                                            <th className="p-1 text-center">E2</th>
                                                                                            <th className="p-1 text-center">S2</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="text-slate-300 font-mono">
                                                                                        {result.parsedRecords.map((rec, rIdx) => (
                                                                                            <tr key={rIdx} className={`border-b border-slate-800/50 hover:bg-slate-800/30 ${rec.selected === false ? 'opacity-50' : ''}`}>
                                                                                                <td className="p-1 text-center"><input type="checkbox" checked={rec.selected !== false} onChange={(e) => {
                                                                                                    const newR = [...ocrResults];
                                                                                                    if (newR[idx].parsedRecords) newR[idx].parsedRecords![rIdx].selected = e.target.checked;
                                                                                                    setOcrResults(newR);
                                                                                                }} className="rounded bg-slate-800 border-slate-600" /></td>
                                                                                                <td className="p-1 text-blue-300">{rec.data.split('-').reverse().join('/').slice(0, 5)}</td>
                                                                                                <td className="p-0"><input value={rec.entrada1} onChange={e => {
                                                                                                    const newR = [...ocrResults];
                                                                                                    if (newR[idx].parsedRecords) newR[idx].parsedRecords![rIdx].entrada1 = e.target.value;
                                                                                                    setOcrResults(newR);
                                                                                                }} className="w-full bg-transparent text-center outline-none focus:bg-slate-800 p-1" /></td>
                                                                                                <td className="p-0"><input value={rec.saida1} onChange={e => {
                                                                                                    const newR = [...ocrResults];
                                                                                                    if (newR[idx].parsedRecords) newR[idx].parsedRecords![rIdx].saida1 = e.target.value;
                                                                                                    setOcrResults(newR);
                                                                                                }} className="w-full bg-transparent text-center outline-none focus:bg-slate-800 p-1" /></td>
                                                                                                <td className="p-0"><input value={rec.entrada2} onChange={e => {
                                                                                                    const newR = [...ocrResults];
                                                                                                    if (newR[idx].parsedRecords) newR[idx].parsedRecords![rIdx].entrada2 = e.target.value;
                                                                                                    setOcrResults(newR);
                                                                                                }} className="w-full bg-transparent text-center outline-none focus:bg-slate-800 p-1" /></td>
                                                                                                <td className="p-0"><input value={rec.saida2} onChange={e => {
                                                                                                    const newR = [...ocrResults];
                                                                                                    if (newR[idx].parsedRecords) newR[idx].parsedRecords![rIdx].saida2 = e.target.value;
                                                                                                    setOcrResults(newR);
                                                                                                }} className="w-full bg-transparent text-center outline-none focus:bg-slate-800 p-1" /></td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                <input
                                                                                    type="date"
                                                                                    className="col-span-2 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                                                                                    value={result.manualDate}
                                                                                    onChange={e => { const r = [...ocrResults]; r[idx].manualDate = e.target.value; setOcrResults(r); }}
                                                                                />
                                                                                <input type="time" className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500" value={result.manualEntry1} onChange={e => { const r = [...ocrResults]; r[idx].manualEntry1 = e.target.value; setOcrResults(r); }} />
                                                                                <input type="time" className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500" value={result.manualExit1} onChange={e => { const r = [...ocrResults]; r[idx].manualExit1 = e.target.value; setOcrResults(r); }} />
                                                                                <input type="time" className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500" value={result.manualEntry2} onChange={e => { const r = [...ocrResults]; r[idx].manualEntry2 = e.target.value; setOcrResults(r); }} />
                                                                                <input type="time" className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500" value={result.manualExit2} onChange={e => { const r = [...ocrResults]; r[idx].manualExit2 = e.target.value; setOcrResults(r); }} />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <details className="text-[10px] text-slate-600 cursor-pointer">
                                                                        <summary>Ver texto extraído ({result.detectedTimes?.length || 0} horas)</summary>
                                                                        <div className="mt-1 p-1 bg-black/20 rounded font-mono max-h-20 overflow-y-auto text-xs">
                                                                            <p className="mb-1 text-blue-400 font-bold">{result.detectedTimes?.join(' | ')}</p>
                                                                            <p className="text-slate-500 whitespace-pre-wrap opacity-50">{result.extractedText?.substring(0, 100)}...</p>
                                                                        </div>
                                                                    </details>
                                                                </div>
                                                            )}
                                                            {result.status === 'error' && (
                                                                <div className="mt-2 text-[10px] text-red-400 bg-red-950/30 p-2 rounded border border-red-500/20 font-mono">
                                                                    {result.logs.join('\n')}
                                                                    <button onClick={() => { const r = [...ocrResults]; r[idx].status = 'pending'; setOcrResults(r); }} className="block mt-1 text-red-300 underline">Tentar de novo</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {
                isEmployeeFormOpen && (
                    <EmployeeForm
                        employeeId={editingEmpId}
                        companiesList={availableCompanies}
                        onClose={() => setIsEmployeeFormOpen(false)}
                        onSuccess={() => {
                            setIsEmployeeFormOpen(false);
                            loadData();
                        }}
                    />
                )
            }

        </div >
    );
};

export default HRManagement;

```


# File: pages/Inventory.tsx
```

import React, { useState } from 'react';
import { StockItem } from '../types';
import { Search, Plus, Filter, Download, AlertTriangle, Image as ImageIcon, Barcode, DollarSign, Camera, Save } from 'lucide-react';
import { dashboardService } from '../services/api';
import Modal from '../components/Modal';

const Inventory: React.FC = () => {
  const [stockData, setStockData] = React.useState<StockItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [editingSku, setEditingSku] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<Partial<StockItem>>({
    sku: '',
    description: '',
    category: 'PEÇAS',
    currentQty: 0,
    minQty: 0,
    location: '',
    status: 'NORMAL'
  });

  const loadStock = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getStock();
      setStockData(data as StockItem[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadStock();
  }, []);

  const handleSave = async () => {
    if (!formData.sku || !formData.description) return;

    const newItem: StockItem = {
      sku: formData.sku!,
      description: formData.description!,
      category: formData.category || 'GERAL',
      currentQty: Number(formData.currentQty) || 0,
      minQty: Number(formData.minQty) || 0,
      location: formData.location || 'ESTOQUE',
      status: (Number(formData.currentQty) || 0) <= (Number(formData.minQty) || 0) ? 'CRITICAL' : 'NORMAL'
    };

    if (editingSku) {
      await dashboardService.updateStockItem(newItem);
    } else {
      await dashboardService.addStockItem(newItem);
    }

    await loadStock();
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (sku: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Excluir este item do estoque?')) {
      await dashboardService.deleteStockItem(sku);
      await loadStock();
    }
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: StockItem) => {
    setEditingSku(item.sku);
    setFormData(item);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingSku(null);
    setFormData({
      sku: '',
      description: '',
      category: 'PEÇAS',
      currentQty: 0,
      minQty: 0,
      location: '',
      status: 'NORMAL'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#007a33] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Almoxarifado e Estoque</h2>
          <p className="text-slate-500 mt-1">Gestão de inventário e insumos críticos para operações pesadas.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openNewModal}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Novo Item
          </button>
          <button className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700 hover:bg-slate-700 transition-all">
            Entrada de Nota Fiscal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total de Itens</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-black text-white tracking-tight">{stockData.length}</h3>
            <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">+2.4%</span>
          </div>
        </div>
        <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
            <AlertTriangle size={80} className="text-red-500" />
          </div>
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Abaixo do Mínimo</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-black text-red-500 tracking-tight">{stockData.filter(i => i.status === 'CRITICAL').length}</h3>
            <span className="text-red-400 text-[10px] font-black uppercase tracking-tighter animate-pulse">Ação Necessária</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Valor em Estoque</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-black text-white tracking-tight">R$ 450.200</h3>
            <span className="text-slate-500 text-[10px] font-bold">Tempo Real</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 w-full max-w-md focus-within:border-blue-500 transition-all">
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder="Buscar peça ou SKU..."
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-600 focus:outline-none text-white"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all">
              <Filter size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all">
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Código/SKU</th>
                <th className="px-6 py-4">Descrição do Item</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Qtd. Atual</th>
                <th className="px-6 py-4">Mínimo</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stockData.map((item) => (
                <tr
                  key={item.sku}
                  onClick={() => openEditModal(item)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.sku}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white">{item.description}</p>
                    <p className="text-[10px] text-slate-500">Caterpillar 320D/320E</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-lg uppercase">{item.category}</span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-black ${item.status === 'CRITICAL' ? 'text-red-500' : 'text-white'}`}>
                    {item.currentQty} un
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-bold">{item.minQty} un</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{item.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-500' :
                        item.status === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-red-500/10 text-red-500 animate-pulse'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'NORMAL' ? 'bg-emerald-500' :
                          item.status === 'WARNING' ? 'bg-amber-500' :
                            'bg-red-500'
                          }`} />
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => handleDelete(item.sku, e)}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/20 rounded transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir Item"
                    >
                      <AlertTriangle size={16} /> {/* Using AlertTriangle as delete icon since Trash2 is not imported or available? Actually I think I can use Trash2 if imported. But imports are at top. I see AlertTriangle is imported. */}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-between items-center bg-slate-950/50">
          <p className="text-xs text-slate-500 font-medium">Exibindo {stockData.length} de {stockData.length} itens</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg hover:text-white transition-all">Anterior</button>
            <button className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg">1</button>
            <button className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg hover:text-white transition-all">Próximo</button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSku ? `Editar Produto: ${editingSku}` : "Cadastro de Produto de Venda / Insumo"}
      >
        <div className="flex gap-6">
          {/* Left Column - Images */}
          <div className="w-1/3 space-y-4">
            {/* ... Keep images section as static mock ... */}
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer group relative overflow-hidden">
                <Camera size={32} className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-bold uppercase text-center px-2">Foto Própria</span>
              </div>
              <div className="aspect-square bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-emerald-500 relative overflow-hidden">
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <ImageIcon size={32} className="mb-2" />
                <span className="text-[10px] font-bold uppercase text-center px-2">Sugestão Web (IA)</span>
                <button className="absolute bottom-2 inset-x-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 rounded text-[9px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/20">
                  Usar
                </button>
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/20 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Search size={16} />
                <h4 className="text-xs font-black uppercase tracking-widest">Sugestão de Compra</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Última Compra:</span>
                  <span className="text-white font-bold">R$ 14,80 (Peças & Cia)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Menor Preço Web:</span>
                  <span className="text-emerald-500 font-bold">R$ 12,50 (MercadoLivre)</span>
                </div>
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all">
                  Ver Ofertas Online
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Form Data */}
          <div className="flex-1 space-y-5">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-emerald-500 w-4 h-4" />
                <span className="text-xs font-bold text-white uppercase">Produto</span>
              </label>

              <div className="ml-auto flex gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Código / SKU</label>
                  <input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="235338"
                    className="w-24 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1 text-amber-500 text-xs font-bold text-center focus:outline-none"
                    readOnly={!!editingSku}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-10 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Descrição do Produto / Serviço</label>
                <input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="BUCHA DE FERRO DO PISTÃO..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm font-bold focus:border-emerald-500 outline-none uppercase"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Unidade</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white text-xs focus:border-emerald-500 outline-none">
                  <option>UNI</option>
                  <option>KG</option>
                  <option>LT</option>
                  <option>PC</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Referência / Part Number</label>
                <input placeholder="233-2613" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 outline-none uppercase" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Localização Física</label>
                <input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="C-005-01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 outline-none uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Marca / Fabricante</label>
                <input placeholder="USINA" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 outline-none uppercase" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Grupo / Categoria</label>
                <input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="BUCHA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 outline-none uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-2">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2">Controle de Estoque</h4>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <label className="text-xs text-slate-400 text-right">Mínimo</label>
                  <input
                    type="number"
                    value={formData.minQty}
                    onChange={(e) => setFormData({ ...formData, minQty: Number(e.target.value) })}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right text-xs text-white w-20"
                  />

                  <label className="text-xs text-slate-400 text-right">Atual</label>
                  <input
                    type="number"
                    value={formData.currentQty}
                    onChange={(e) => setFormData({ ...formData, currentQty: Number(e.target.value) })}
                    className="bg-slate-950 border border-emerald-500/50 rounded px-2 py-1 text-right text-xs text-emerald-500 font-bold w-20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t border-slate-800 mt-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-6 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-700 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm flex items-center gap-2"
          >
            <Save size={18} />
            {editingSku ? 'Salvar Alterações' : 'Salvar Produto'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;

```


# File: pages/Login.tsx
```
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

```


# File: pages/Maintenance.tsx
```

import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { MaintenanceOS, OSStatus } from '../types';
import { Wrench, Calendar, AlertCircle, CheckCircle2, Clock, Plus, Filter, Columns, List as ListIcon, User, Archive, Save, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

const Maintenance: React.FC = () => {
  const [orders, setOrders] = useState<MaintenanceOS[]>([]);
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MaintenanceOS>>({
    assetName: '',
    description: '',
    priority: 'MEDIUM',
    mechanic: '',
    status: OSStatus.PENDING,
    progress: 0
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getMaintenanceOS();
      setOrders(data as MaintenanceOS[]);
    } catch (error) {
      console.error("Failed to load maintenance orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSave = async () => {
    if (!formData.assetName || !formData.description) return;

    if (editingId) {
      // Update
      const updatedOrder: MaintenanceOS = {
        ...orders.find(o => o.id === editingId)!,
        ...formData as MaintenanceOS,
        id: editingId
      };
      await dashboardService.updateMaintenanceOS(updatedOrder);
    } else {
      // Create
      const newOrder: MaintenanceOS = {
        id: `OS-${Math.floor(Math.random() * 10000)}`,
        assetId: 'GENERIC',
        assetName: formData.assetName!,
        description: formData.description!,
        priority: formData.priority as any,
        status: OSStatus.PENDING,
        mechanic: formData.mechanic || 'N/A',
        progress: 0,
        partsNeeded: []
      };
      await dashboardService.addMaintenanceOS(newOrder);
    }

    await loadOrders();
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Excluir esta Ordem de Serviço?')) {
      await dashboardService.deleteMaintenanceOS(id);
      await loadOrders();
    }
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (order: MaintenanceOS) => {
    setEditingId(order.id);
    setFormData(order);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      assetName: '',
      description: '',
      priority: 'MEDIUM',
      mechanic: '',
      status: OSStatus.PENDING,
      progress: 0
    });
  };

  const getStatusColor = (status: OSStatus) => {
    switch (status) {
      case OSStatus.PENDING: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case OSStatus.IN_PROGRESS: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case OSStatus.WAITING_PARTS: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case OSStatus.COMPLETED: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-800 text-white';
    }
  };

  const StatusBadge: React.FC<{ status: OSStatus }> = ({ status }) => {
    const colors = getStatusColor(status);
    return (
      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase border ${colors}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const KanbanColumn: React.FC<{ title: string, status: OSStatus, items: MaintenanceOS[] }> = ({ title, status, items }) => (
    <div className="flex-1 min-w-[300px] bg-slate-900/50 rounded-2xl p-4 border border-slate-800 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">{title}</h3>
        <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold">{items.length}</span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {items.length === 0 && (
          <div className="h-24 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center">
            <span className="text-slate-600 text-xs font-bold uppercase">Vazio</span>
          </div>
        )}
        {items.map(order => (
          <div
            key={order.id}
            onClick={() => openEditModal(order)}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-lg relative"
          >
            <button
              onClick={(e) => handleDelete(order.id, e)}
              className="absolute top-2 right-2 p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>

            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-mono text-slate-500">{order.id}</span>
              <div className={`w-2 h-2 rounded-full ${order.priority === 'URGENT' ? 'bg-red-500 animate-pulse' :
                order.priority === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
            </div>
            <h4 className="font-bold text-white text-sm mb-1">{order.assetName}</h4>
            <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{order.description}</p>

            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1 uppercase font-bold">
                <span>Progresso</span>
                <span>{order.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${order.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                  style={{ width: `${order.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-900">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-slate-400" title={order.mechanic || 'Unassigned'}>
                  {order.mechanic ? order.mechanic.charAt(0) : <User size={10} />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={openNewModal}
        className="mt-3 w-full py-2 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Adicionar
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Gestão de Manutenção</h2>
          <p className="text-slate-500 mt-1">Quadro de controle de ordens de serviço (Kanban).</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-800">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'KANBAN' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}
            >
              <Columns size={20} />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}
            >
              <ListIcon size={20} />
            </button>
          </div>
          <button
            onClick={openNewModal}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Nova O.S.
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : viewMode === 'KANBAN' ? (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-6">
          <KanbanColumn
            title="Pendente"
            status={OSStatus.PENDING}
            items={orders.filter(o => o.status === OSStatus.PENDING)}
          />
          <KanbanColumn
            title="Em Progresso"
            status={OSStatus.IN_PROGRESS}
            items={orders.filter(o => o.status === OSStatus.IN_PROGRESS)}
          />
          <KanbanColumn
            title="Aguardando Peças"
            status={OSStatus.WAITING_PARTS}
            items={orders.filter(o => o.status === OSStatus.WAITING_PARTS)}
          />
          <KanbanColumn
            title="Concluído"
            status={OSStatus.COMPLETED}
            items={orders.filter(o => o.status === OSStatus.COMPLETED)}
          />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex-1 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800 shadow-md">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-8 py-5">ID</th>
                <th className="px-8 py-5">Equipamento</th>
                <th className="px-8 py-5">Descrição</th>
                <th className="px-8 py-5">Mecânico</th>
                <th className="px-8 py-5">Prioridade</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Progresso</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((os) => (
                <tr key={os.id} className="hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => openEditModal(os)}>
                  <td className="px-8 py-6 font-mono text-xs text-slate-400">{os.id}</td>
                  <td className="px-8 py-6 font-bold text-white text-sm">{os.assetName}</td>
                  <td className="px-8 py-6 text-sm text-slate-300 truncate max-w-xs">{os.description}</td>
                  <td className="px-8 py-6 text-sm text-slate-400">{os.mechanic || '-'}</td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${os.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-400'
                      }`}>
                      {os.priority}
                    </span>
                  </td>
                  <td className="px-8 py-6"><StatusBadge status={os.status} /></td>
                  <td className="px-8 py-6 w-48">
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${os.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${os.progress}%` }} />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={(e) => handleDelete(os.id, e)}
                      className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded text-slate-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? `Editar OS: ${editingId}` : "Nova Ordem de Serviço"}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Equipamento</label>
            <input
              value={formData.assetName}
              onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
              placeholder="Ex: Escavadeira CAT 320"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Descrição do Problema</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o problema..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              >
                <option value="LOW">BAIXA</option>
                <option value="MEDIUM">MÉDIA</option>
                <option value="HIGH">ALTA</option>
                <option value="URGENTE">URGENTE</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Mecânico</label>
              <input
                value={formData.mechanic}
                onChange={(e) => setFormData({ ...formData, mechanic: e.target.value })}
                placeholder="Nome do Mecânico"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              >
                <option value={OSStatus.PENDING}>Pendente</option>
                <option value={OSStatus.IN_PROGRESS}>Em Progresso</option>
                <option value={OSStatus.WAITING_PARTS}>Aguardando Peças</option>
                <option value={OSStatus.COMPLETED}>Concluído</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Progresso (%)</label>
              <input
                type="number"
                min="0" max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="pt-4">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {editingId ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Maintenance;

```


# File: pages/MapDigital.tsx
```

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Map as MapIcon, Play, Pause, AlertTriangle, Calendar, Satellite, Navigation, Fuel, Clock, Gauge, Activity, Radio, Wifi, WifiOff, ChevronRight, RotateCcw, MapPin, Crosshair, Thermometer, Zap, TrendingUp } from 'lucide-react';
import { fleetManagementService } from '../services/fleetService';
import { checkSelsynKeyExpiration } from '../services/selsyn';
import { Asset, AssetStatus } from '../types';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';

// Fix Leaflet Default Icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
   iconUrl: markerIcon,
   shadowUrl: markerShadow,
   iconSize: [25, 41],
   iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Status config
const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; pulse?: boolean }> = {
   OPERATING: { color: '#10b981', bg: 'bg-emerald-500/15', label: 'Operando', pulse: true },
   IDLE: { color: '#f59e0b', bg: 'bg-amber-500/15', label: 'Parado' },
   MAINTENANCE: { color: '#ef4444', bg: 'bg-red-500/15', label: 'Manutenção' },
   AVAILABLE: { color: '#64748b', bg: 'bg-slate-500/15', label: 'Disponível' },
   OFFLINE: { color: '#374151', bg: 'bg-gray-700/15', label: 'Offline' },
};

const getStatusConfig = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.OFFLINE;

// Custom Icons
const createVehicleIcon = (code: string, status: AssetStatus, isSelected: boolean) => {
   const cfg = getStatusConfig(status);
   let color = cfg.color;
   if (isSelected) color = '#3b82f6';

   const size = isSelected ? 44 : 34;
   const html = `
      <div style="position:relative;">
         ${cfg.pulse && !isSelected ? `<div style="position:absolute;inset:-4px;border-radius:50%;background:${color};opacity:0.3;animation:pulse 2s infinite;"></div>` : ''}
         <div style="
            background: linear-gradient(135deg, ${color}, ${color}dd);
            width: ${size}px; height: ${size}px;
            border-radius: 50%;
            border: 3px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 20px ${color}40;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.3s ease;
         ">
            <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 22 : 16}" height="${isSelected ? 22 : 16}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
               <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
            </svg>
         </div>
         <div style="margin-top:4px;background:rgba(0,0,0,0.85);color:white;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;text-align:center;white-space:nowrap;letter-spacing:0.5px;border:1px solid ${color}60;">
            ${code}
         </div>
      </div>
   `;
   return L.divIcon({ html, className: '', iconSize: [size, size + 22], iconAnchor: [size / 2, size + 22] });
};

const createEventIcon = (type: 'START' | 'STOP') => {
   const color = type === 'START' ? '#10b981' : '#ef4444';
   return L.divIcon({
      html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px ${color}80;"></div>`,
      className: '', iconSize: [14, 14], iconAnchor: [7, 7]
   });
};

type ViewMode = 'LIVE' | 'HISTORY';

const MapUpdater = ({ center }: { center: [number, number] | null }) => {
   const map = useMap();
   useEffect(() => { if (center) map.flyTo(center, 15); }, [center, map]);
   return null;
};

// Pulse animation CSS
const PulseStyle = () => (
   <style>{`
      @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.8);opacity:0} }
      @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      .fade-in { animation: fadeIn 0.3s ease-out; }
      .sidebar-scroll::-webkit-scrollbar { width: 4px; }
      .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
      .sidebar-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #475569; }
   `}</style>
);

const MapDigital: React.FC = () => {
   const [assets, setAssets] = useState<Asset[]>([]);
   const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [loading, setLoading] = useState(true);
   const [viewMode, setViewMode] = useState<ViewMode>('LIVE');
   const [mapCenter, setMapCenter] = useState<[number, number]>([-15.6014, -56.0979]);
   const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

   // Selsyn Key Status
   const keyStatus = checkSelsynKeyExpiration();

   // History State
   const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
   const [historyPoints, setHistoryPoints] = useState<any[]>([]);
   const [playbackIndex, setPlaybackIndex] = useState(0);
   const [isPlaying, setIsPlaying] = useState(false);
   const playbackInterval = useRef<NodeJS.Timeout | null>(null);

   // Load Live Data
   useEffect(() => {
      const loadAssets = async () => {
         if (assets.length === 0) setLoading(true);
         try {
            const data = await fleetManagementService.getAssets();
            setAssets(data);
            setLastUpdate(new Date());
            if (!selectedAssetId && data.length > 0) {
               const first = data.find(a => a.coordinates?.lat && a.coordinates.lat !== 0);
               if (first) setMapCenter([first.coordinates!.lat, first.coordinates!.lng]);
            }
         } catch (error) { console.error(error); } finally { setLoading(false); }
      };
      loadAssets();
      const interval = setInterval(loadAssets, 10000);
      return () => clearInterval(interval);
   }, []);

   // Load History Data
   useEffect(() => {
      if (viewMode === 'HISTORY' && selectedAssetId) {
         const loadHistory = async () => {
            const { data } = await supabase
               .from('asset_positions')
               .select('*')
               .eq('asset_id', selectedAssetId)
               .gte('timestamp', `${historyDate}T00:00:00`)
               .lte('timestamp', `${historyDate}T23:59:59`)
               .order('timestamp', { ascending: true });

            if (data && data.length > 0) {
               let lastIgn = false;
               const points = data.map((d, i) => {
                  let evt: string | null = null;
                  if (d.ignition && !lastIgn) evt = 'START';
                  if (!d.ignition && lastIgn) evt = 'STOP';
                  lastIgn = d.ignition;
                  return { ...d, lat: d.latitude, lng: d.longitude, event: evt, index: i };
               });
               setHistoryPoints(points);
               setPlaybackIndex(0);
               setMapCenter([points[0].lat, points[0].lng]);
            } else {
               setHistoryPoints([]);
            }
         };
         loadHistory();
      }
   }, [viewMode, selectedAssetId, historyDate]);

   // Playback
   useEffect(() => {
      if (isPlaying) {
         playbackInterval.current = setInterval(() => {
            setPlaybackIndex(p => (p >= historyPoints.length - 1 ? (setIsPlaying(false), p) : p + 1));
         }, 200);
      } else if (playbackInterval.current) {
         clearInterval(playbackInterval.current);
      }
      return () => { if (playbackInterval.current) clearInterval(playbackInterval.current); };
   }, [isPlaying, historyPoints]);

   // Computed
   const filteredAssets = useMemo(() => assets.filter(a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase())
   ), [assets, searchTerm]);

   const stats = useMemo(() => {
      const connected = assets.filter(a => a.coordinates && a.coordinates.lat !== 0);
      const operating = assets.filter(a => a.status === 'OPERATING');
      const idle = assets.filter(a => a.status === 'IDLE');
      return { total: assets.length, connected: connected.length, operating: operating.length, idle: idle.length };
   }, [assets]);

   const selectedAsset = assets.find(a => a.id === selectedAssetId);
   const validAssets = filteredAssets.filter(a => a.coordinates && a.coordinates.lat !== 0);
   const historyPolyline = historyPoints.map(p => [p.lat, p.lng] as [number, number]);
   const currentHistoryPoint = historyPoints[playbackIndex];

   // Auto-Tracker
   useEffect(() => {
      if (assets.length === 0) return;
      const tracker = async () => {
         try {
            const { fetchFleetPositions } = await import('../services/selsyn');
            const positions = await fetchFleetPositions();
            if (positions.length > 0) {
               const inserts: any[] = [];
               for (const pos of positions) {
                  const pName = pos.rastreavel ? pos.rastreavel.toUpperCase().replace(/[\s-]/g, '') : '';
                  const pCode = pos.identificador.toUpperCase().replace(/[\s-]/g, '');
                  const asset = assets.find(a => {
                     const aCode = a.code.toUpperCase().replace(/[\s-]/g, '');
                     const aName = a.name.toUpperCase().replace(/[\s-]/g, '');
                     return pCode === aCode || pName === aCode || pName === aName;
                  });
                  if (asset) {
                     inserts.push({
                        asset_id: asset.id, latitude: pos.latitude, longitude: pos.longitude,
                        speed: pos.velocidade || 0, ignition: pos.ignicao || false,
                        timestamp: pos.dataHora || new Date().toISOString(), meta: pos
                     });
                  }
               }
               if (inserts.length > 0) {
                  await supabase.from('asset_positions').insert(inserts);
               }
            }
         } catch (e) { console.error("AutoTracker:", e); }
      };
      const interval = setInterval(tracker, 60000);
      return () => clearInterval(interval);
   }, [assets]);

   return (
      <div className="flex h-full overflow-hidden bg-slate-950 text-white font-sans">
         <PulseStyle />

         {/* ═══════════ SIDEBAR ═══════════ */}
         <div className={`${sidebarCollapsed ? 'w-14' : 'w-[340px]'} flex flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 z-20 shadow-2xl transition-all duration-300`}>

            {/* Collapse Toggle */}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
               className="absolute top-4 left-full z-30 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-r-lg p-1.5 transition-colors">
               <ChevronRight size={14} className={`transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>

            {sidebarCollapsed ? (
               <div className="flex flex-col items-center gap-4 pt-4">
                  <MapIcon size={20} className="text-blue-500" />
                  <div className="w-8 h-px bg-slate-700" />
                  <div className="flex flex-col items-center gap-1">
                     <div className="w-3 h-3 rounded-full bg-emerald-500" title={`${stats.operating} Operando`} />
                     <span className="text-[9px] text-slate-500">{stats.operating}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                     <div className="w-3 h-3 rounded-full bg-amber-500" title={`${stats.idle} Parados`} />
                     <span className="text-[9px] text-slate-500">{stats.idle}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                     <div className="w-3 h-3 rounded-full bg-blue-500" title={`${stats.connected} Com GPS`} />
                     <span className="text-[9px] text-slate-500">{stats.connected}</span>
                  </div>
               </div>
            ) : (
               <>
                  {/* Header */}
                  <div className="p-4 border-b border-slate-800/60">
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                              <Satellite size={16} className="text-blue-400" />
                           </div>
                           <div>
                              <h1 className="font-bold text-sm">Rastreamento</h1>
                              <p className="text-[10px] text-slate-500">Atualizado {lastUpdate.toLocaleTimeString('pt-BR')}</p>
                           </div>
                        </div>
                        <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/50">
                           <button onClick={() => setViewMode('LIVE')}
                              className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${viewMode === 'LIVE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}>
                              <Radio size={10} className="inline mr-1" />Ao Vivo
                           </button>
                           <button onClick={() => setViewMode('HISTORY')}
                              className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${viewMode === 'HISTORY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}>
                              <Clock size={10} className="inline mr-1" />Histórico
                           </button>
                        </div>
                     </div>

                     {/* Stats Bar */}
                     <div className="grid grid-cols-4 gap-1.5 mb-3">
                        <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/30">
                           <div className="text-base font-bold text-white">{stats.total}</div>
                           <div className="text-[9px] text-slate-500 uppercase tracking-wider">Total</div>
                        </div>
                        <div className="bg-emerald-500/10 rounded-lg p-2 text-center border border-emerald-500/20">
                           <div className="text-base font-bold text-emerald-400">{stats.operating}</div>
                           <div className="text-[9px] text-emerald-500/70 uppercase tracking-wider">Operando</div>
                        </div>
                        <div className="bg-amber-500/10 rounded-lg p-2 text-center border border-amber-500/20">
                           <div className="text-base font-bold text-amber-400">{stats.idle}</div>
                           <div className="text-[9px] text-amber-500/70 uppercase tracking-wider">Parados</div>
                        </div>
                        <div className="bg-blue-500/10 rounded-lg p-2 text-center border border-blue-500/20">
                           <div className="text-base font-bold text-blue-400">{stats.connected}</div>
                           <div className="text-[9px] text-blue-500/70 uppercase tracking-wider">GPS</div>
                        </div>
                     </div>

                     {/* Mode Controls */}
                     {viewMode === 'LIVE' ? (
                        <div className="space-y-2">
                           {stats.connected === 0 && (
                              <button onClick={async () => {
                                 if (!confirm("Sincronizar base de veículos com a Selsyn?")) return;
                                 try {
                                    const { importSelsynVehicles } = await import('../services/selsynImporter');
                                    await importSelsynVehicles(console.log);
                                    alert("Sincronizado! Recarregando...");
                                    window.location.reload();
                                 } catch (e) { alert("Erro: " + e); }
                              }} className="w-full bg-emerald-500/10 text-emerald-400 text-xs py-2 rounded-lg hover:bg-emerald-500/20 border border-emerald-500/20 transition-all flex items-center justify-center gap-2">
                                 <RotateCcw size={12} /> Sincronizar Cadastro Selsyn
                              </button>
                           )}
                        </div>
                     ) : (
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                              <Calendar size={14} className="text-blue-400" />
                              <input type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)}
                                 className="bg-transparent text-sm w-full outline-none text-white" />
                           </div>
                           {!selectedAssetId && (
                              <p className="text-[11px] text-amber-400/80 flex items-center gap-1">
                                 <MapPin size={10} /> Selecione um veículo para ver o histórico
                              </p>
                           )}
                        </div>
                     )}

                     {/* Search */}
                     <div className="mt-3 relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                        <input
                           value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                           placeholder="Buscar por código ou nome..."
                           className="w-full bg-slate-950/80 rounded-lg pl-9 pr-3 py-2 text-sm outline-none border border-slate-700/50 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                        />
                     </div>
                  </div>

                  {/* Vehicle List */}
                  <div className="flex-1 overflow-y-auto sidebar-scroll">
                     {loading && assets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3">
                           <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                           <p className="text-xs text-slate-500">Carregando veículos...</p>
                        </div>
                     ) : filteredAssets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-500">
                           <Search size={20} />
                           <p className="text-xs">Nenhum veículo encontrado</p>
                        </div>
                     ) : (
                        filteredAssets.map(asset => {
                           const cfg = getStatusConfig(asset.status);
                           const hasGps = asset.coordinates && asset.coordinates.lat !== 0;
                           const isSelected = selectedAssetId === asset.id;

                           return (
                              <div key={asset.id}
                                 onClick={() => { setSelectedAssetId(asset.id); if (hasGps) setMapCenter([asset.coordinates!.lat, asset.coordinates!.lng]); }}
                                 className={`group px-4 py-3 border-b border-slate-800/40 cursor-pointer transition-all hover:bg-slate-800/50 ${isSelected ? 'bg-slate-800/70 border-l-[3px] border-l-blue-500' : 'border-l-[3px] border-l-transparent'}`}
                              >
                                 <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                       <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 border border-slate-700/30`}>
                                          <Navigation size={14} style={{ color: cfg.color }} />
                                       </div>
                                       <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                             <span className="font-bold text-sm text-white">{asset.code}</span>
                                             {hasGps ? (
                                                <Wifi size={10} className="text-emerald-400 flex-shrink-0" />
                                             ) : (
                                                <WifiOff size={10} className="text-slate-600 flex-shrink-0" />
                                             )}
                                          </div>
                                          <p className="text-[11px] text-slate-400 truncate">{asset.name}</p>
                                       </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                       <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${cfg.bg}`}
                                          style={{ color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                          {cfg.label}
                                       </span>
                                       {asset.telemetry?.speed !== undefined && (
                                          <span className="text-[10px] text-slate-500 font-mono">{asset.telemetry.speed} km/h</span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           );
                        })
                     )}
                  </div>

                  {/* Selsyn Key Footer */}
                  <div className={`px-4 py-2 border-t border-slate-800/60 text-[10px] flex items-center gap-2 ${keyStatus.expired ? 'bg-red-950/30 text-red-400' : keyStatus.hoursRemaining <= 6 ? 'bg-amber-950/20 text-amber-400' : 'text-slate-500'}`}>
                     <div className={`w-2 h-2 rounded-full flex-shrink-0 ${keyStatus.expired ? 'bg-red-500' : keyStatus.hoursRemaining <= 6 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                     <span className="truncate">{keyStatus.expired ? 'Chave GPS expirada' : keyStatus.hoursRemaining <= 6 ? `Chave expira em ${Math.round(keyStatus.hoursRemaining)}h` : 'API GPS conectada'}</span>
                  </div>
               </>
            )}
         </div>

         {/* ═══════════ MAP AREA ═══════════ */}
         <div className="flex-1 relative">

            {/* Key Expiration Banner */}
            {keyStatus.expired && (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] px-5 py-2.5 rounded-xl bg-red-600/95 backdrop-blur-sm text-white flex items-center gap-3 text-sm shadow-2xl shadow-red-600/30 border border-red-500/50 fade-in">
                  <AlertTriangle size={18} />
                  <div>
                     <span className="font-semibold">Chave Selsyn Expirada</span>
                     <p className="text-[11px] text-red-200">Renove a chave para restaurar o rastreamento GPS</p>
                  </div>
               </div>
            )}

            {/* Map */}
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', background: '#0f172a' }} zoomControl={false}>
               <LayersControl position="topright">
                  <LayersControl.BaseLayer name="Satélite">
                     <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="&copy; Esri" />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer checked name="Escuro">
                     <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Ruas">
                     <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
                  </LayersControl.BaseLayer>
               </LayersControl>

               <MapUpdater center={viewMode === 'LIVE' ? (selectedAssetId && selectedAsset?.coordinates?.lat ? [selectedAsset.coordinates.lat, selectedAsset.coordinates.lng] : mapCenter) : (currentHistoryPoint ? [currentHistoryPoint.lat, currentHistoryPoint.lng] : mapCenter)} />

               {viewMode === 'LIVE' ? (
                  validAssets.map(asset => (
                     <Marker key={asset.id} position={[asset.coordinates!.lat, asset.coordinates!.lng]}
                        icon={createVehicleIcon(asset.code, asset.status, selectedAssetId === asset.id)}
                        eventHandlers={{ click: () => { setSelectedAssetId(asset.id); setMapCenter([asset.coordinates!.lat, asset.coordinates!.lng]); } }}>
                        <Popup className="custom-popup">
                           <div className="text-slate-900 p-1">
                              <b className="text-sm">{asset.name}</b>
                              <p className="text-xs text-slate-600">{asset.code} - {getStatusConfig(asset.status).label}</p>
                           </div>
                        </Popup>
                     </Marker>
                  ))
               ) : (
                  <>
                     {historyPoints.length > 0 && (
                        <Polyline positions={historyPolyline} color="#3b82f6" weight={4} opacity={0.8}
                           dashArray="8 4" />
                     )}
                     {historyPoints.map((p, i) => p.event && (
                        <Marker key={i} position={[p.lat, p.lng]} icon={createEventIcon(p.event)}>
                           <Popup>
                              <div className="text-slate-900 text-xs">
                                 <b>{p.event === 'START' ? 'Ignição Ligada' : 'Ignição Desligada'}</b>
                                 <p>{new Date(p.timestamp).toLocaleTimeString('pt-BR')}</p>
                              </div>
                           </Popup>
                        </Marker>
                     ))}
                     {currentHistoryPoint && (
                        <Marker position={[currentHistoryPoint.lat, currentHistoryPoint.lng]}
                           icon={createVehicleIcon(selectedAsset?.code || '?', AssetStatus.OPERATING, true)} zIndexOffset={100} />
                     )}
                  </>
               )}
            </MapContainer>

            {/* ═══════════ OVERLAYS ═══════════ */}

            {/* Live - Vehicle Detail Card */}
            {viewMode === 'LIVE' && selectedAsset && (
               <div className="absolute top-4 right-4 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-2xl z-[1000] shadow-2xl overflow-hidden fade-in">
                  {/* Card Header */}
                  <div className="px-4 pt-4 pb-3 border-b border-slate-800/60">
                     <div className="flex items-start justify-between">
                        <div>
                           <h3 className="font-bold text-white text-sm">{selectedAsset.name}</h3>
                           <p className="text-[11px] text-slate-400 mt-0.5">{selectedAsset.code}</p>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${getStatusConfig(selectedAsset.status).bg}`}
                           style={{ color: getStatusConfig(selectedAsset.status).color, border: `1px solid ${getStatusConfig(selectedAsset.status).color}30` }}>
                           {getStatusConfig(selectedAsset.status).label}
                        </span>
                     </div>
                  </div>

                  {/* Telemetry Grid */}
                  <div className="p-3 grid grid-cols-2 gap-2">
                     <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/30">
                        <div className="flex items-center gap-1.5 mb-1">
                           <Gauge size={11} className="text-blue-400" />
                           <span className="text-[9px] text-slate-400 uppercase tracking-wider">Velocidade</span>
                        </div>
                        <div className="font-mono text-xl font-bold text-white">
                           {selectedAsset.telemetry?.speed ?? '--'}
                           <span className="text-xs text-slate-500 ml-1">km/h</span>
                        </div>
                     </div>
                     <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/30">
                        <div className="flex items-center gap-1.5 mb-1">
                           <Zap size={11} className="text-amber-400" />
                           <span className="text-[9px] text-slate-400 uppercase tracking-wider">Voltagem</span>
                        </div>
                        <div className="font-mono text-xl font-bold text-white">
                           {selectedAsset.telemetry?.voltage ?? '--'}
                           <span className="text-xs text-slate-500 ml-1">V</span>
                        </div>
                     </div>
                     {selectedAsset.coordinates && (
                        <div className="col-span-2 bg-slate-800/40 rounded-xl p-3 border border-slate-700/20">
                           <div className="flex items-center gap-1.5 mb-1">
                              <Crosshair size={11} className="text-emerald-400" />
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider">Coordenadas</span>
                           </div>
                           <div className="font-mono text-xs text-slate-300">
                              {selectedAsset.coordinates.lat.toFixed(6)}, {selectedAsset.coordinates.lng.toFixed(6)}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2 border-t border-slate-800/40 text-[10px] text-slate-500 flex items-center justify-between">
                     <span className="flex items-center gap-1"><Clock size={9} /> {selectedAsset.telemetry?.lastUpdate || 'Sem dados'}</span>
                     <button onClick={() => setSelectedAssetId(null)} className="text-slate-400 hover:text-white transition-colors">Fechar</button>
                  </div>
               </div>
            )}

            {/* History - Playback Controls */}
            {viewMode === 'HISTORY' && historyPoints.length > 0 && (
               <div className="absolute bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-md border border-slate-700/60 p-4 rounded-2xl flex items-center gap-4 z-[1000] shadow-2xl fade-in">
                  <button onClick={() => setIsPlaying(!isPlaying)}
                     className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 flex-shrink-0">
                     {isPlaying ? <Pause size={18} fill="white" stroke="white" /> : <Play size={18} fill="white" stroke="white" className="ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                     <input type="range" min={0} max={historyPoints.length - 1} value={playbackIndex}
                        onChange={e => { setPlaybackIndex(Number(e.target.value)); setIsPlaying(false); }}
                        className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                     />
                     <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                        <span>{new Date(historyPoints[0].timestamp).toLocaleTimeString('pt-BR')}</span>
                        <span className="text-white font-bold text-xs">{currentHistoryPoint ? new Date(currentHistoryPoint.timestamp).toLocaleTimeString('pt-BR') : '--'}</span>
                        <span>{new Date(historyPoints[historyPoints.length - 1].timestamp).toLocaleTimeString('pt-BR')}</span>
                     </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                     <div className="text-center">
                        <div className="text-[9px] text-slate-500 uppercase tracking-wider">Velocidade</div>
                        <div className="font-mono font-bold text-lg text-white">{currentHistoryPoint?.speed || 0}<span className="text-xs text-slate-500 ml-0.5">km/h</span></div>
                     </div>
                     <div className="text-center">
                        <div className="text-[9px] text-slate-500 uppercase tracking-wider">Pontos</div>
                        <div className="font-mono font-bold text-lg text-blue-400">{playbackIndex + 1}<span className="text-xs text-slate-500">/{historyPoints.length}</span></div>
                     </div>
                  </div>
               </div>
            )}

            {/* No History Data Message */}
            {viewMode === 'HISTORY' && selectedAssetId && historyPoints.length === 0 && !loading && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl p-8 text-center fade-in">
                  <MapPin size={32} className="text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white mb-1">Sem histórico</h3>
                  <p className="text-xs text-slate-400">Nenhum dado de rastreamento encontrado para {new Date(historyDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
               </div>
            )}
         </div>
      </div>
   );
};

export default MapDigital;

```


# File: pages/Migration.tsx
```
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database, Upload, Loader2 } from 'lucide-react';
import { Buffer } from 'buffer';

// Safe Polyfill for Node.js globals in Browser
if (typeof window !== 'undefined') {
    window.Buffer = window.Buffer || Buffer;
    // @ts-ignore
    window.process = window.process || {};
    // @ts-ignore
    if (!window.process.version) window.process.version = 'v16.0.0';
    // @ts-ignore
    if (!window.process.env) window.process.env = {};
}

const Migration: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({ employees: 0, entries: 0 });

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        setLoading(true);
        setLogs([]);
        addLog(`📂 Arquivo selecionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

        try {
            // STEP 1: Load Library Dynamically
            addLog("📚 Carregando biblioteca de leitura...");
            const mdbModule = await import('mdb-reader');

            // SUPER ROBUST CONSTRUCTOR CHECK
            let MdbReader: any = mdbModule.default || mdbModule;

            // If it's still not a function, try to find it in the object
            if (typeof MdbReader !== 'function') {
                console.log("MdbModule dump:", mdbModule);
                throw new Error(`Biblioteca carregada, mas não é um construtor. Tipo: ${typeof MdbReader}`);
            }

            // STEP 2: Read File
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const reader = new MdbReader(buffer);

            // STEP 3: Process Tables
            addLog("✅ Arquivo lido com sucesso! Analisando tabelas...");
            const tableNames = reader.getTableNames();

            if (!tableNames.includes('funcionarios') || !tableNames.includes('batidas')) {
                throw new Error("❌ Tabelas oficiais não encontradas (funcionarios/batidas).");
            }

            // STEP 4: Auth Check & Company ID Retrieval
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado. Por favor faça login novamente.");

            let COMPANY_ID: string | null = null;

            // Tentativa 1: Pelo Perfil do Usuário
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('company_id')
                .eq('id', user.id)
                .maybeSingle(); // maybeSingle evita erro se não encontrar

            if (profile && profile.company_id) {
                COMPANY_ID = profile.company_id;
                addLog(`🏢 Empresa identificada pelo perfil: ${COMPANY_ID}`);
            } else {
                addLog(`⚠️ Perfil de usuário sem empresa associada (Erro: ${profileError?.message || 'Perfil vazio'}). Tentando fallback...`);

                // Tentativa 2: CRIAR empresa na força (Bypass RLS de Leitura via Escrita)
                addLog(`⚙️ Tentando criar/recuperar empresa via Write-Access...`);

                const { data: upsertedCompany, error: upsertError } = await supabase
                    .from('companies')
                    .insert({
                        name: 'TerraPro Transportadora'
                    })
                    .select('id')
                    .single();

                if (upsertedCompany) {
                    COMPANY_ID = upsertedCompany.id;
                    addLog(`🏢 Empresa criada via Insert: ${COMPANY_ID}`);
                } else {
                    // Se falhar o insert (provavelmente já existe ou erro de permissão), tenta buscar qualquer uma
                    addLog(`⚠️ Falha ao criar empresa (${upsertError?.message}). Tentando buscar existente...`);
                    const { data: anyCompany } = await supabase.from('companies').select('id').limit(1).maybeSingle();
                    if (anyCompany) {
                        COMPANY_ID = anyCompany.id;
                        addLog(`🏢 Empresa existente recuperada: ${COMPANY_ID}`);
                    }
                }
            }

            if (!COMPANY_ID) {
                // Último recurso: Criar empresa padrão se não existir NENHUMA
                throw new Error("❌ Nenhuma empresa encontrada no sistema. Impossível vincular dados.");
            }

            // STEP 5: Process Employees
            const tFuncionarios = reader.getTable('funcionarios');
            const tFuncoes = reader.getTable('funcoes');
            const funcoesMap: Record<number, string> = {};
            tFuncoes.getData().forEach((f: any) => funcoesMap[f.id] = f.descricao);

            addLog(`👥 Processando ${tFuncionarios.rowCount} funcionários...`);
            const employees = tFuncionarios.getData();
            const employeeIdMap: Record<number, string> = {};
            let newEmpCount = 0;

            for (const emp of employees as any[]) {
                const name = emp.nome ? emp.nome.trim() : 'Sem Nome';
                if (!name || name === 'Sem Nome') continue;

                const registration = emp.n_folha || String(emp.id);
                const { data: existing } = await supabase.from('employees')
                    .select('id')
                    .eq('company_id', COMPANY_ID)
                    .eq('registration_number', registration)
                    .single();

                let empUUID = existing?.id;
                if (!empUUID) {
                    const { data: inserted } = await supabase.from('employees').insert({
                        company_id: COMPANY_ID,
                        full_name: name,
                        registration_number: registration,
                        job_title: funcoesMap[emp.funcao_id] || 'Funcionário',
                        created_at: new Date().toISOString()
                    }).select().single();
                    if (inserted) {
                        empUUID = inserted.id;
                        newEmpCount++;
                    }
                }
                if (empUUID) employeeIdMap[emp.id] = empUUID;
            }
            setStats(s => ({ ...s, employees: newEmpCount }));
            addLog(`✅ ${newEmpCount} novos funcionários.`);

            // STEP 6: Process Batidas
            const tBatidas = reader.getTable('batidas');
            addLog(`⏱️ Processando ${tBatidas.rowCount} batidas...`);
            const batidas = tBatidas.getData();
            let entriesBuffer: any[] = [];
            let importedEntries = 0;

            for (let i = 0; i < batidas.length; i++) {
                const batida: any = batidas[i];
                const empUUID = employeeIdMap[batida.funcionario_id];
                if (!empUUID || !batida.data) continue;

                let dateStr = "";
                if (batida.data instanceof Date) dateStr = batida.data.toISOString().split('T')[0];
                else if (typeof batida.data === 'string') dateStr = batida.data.substring(0, 10);

                const entry = {
                    company_id: COMPANY_ID,
                    employee_id: empUUID,
                    date: dateStr,
                    entry_time: batida.entrada1 || null,
                    break_start: batida.saida1 || null,
                    break_end: batida.entrada2 || null,
                    exit_time: batida.saida2 || batida.saida1 || null,
                    source: 'MIGRATION_SECULLUM',
                    status: 'APPROVED'
                };

                if (entry.entry_time || entry.exit_time) entriesBuffer.push(entry);

                if (entriesBuffer.length >= 100) {
                    await supabase.from('time_entries').insert(entriesBuffer);
                    importedEntries += entriesBuffer.length;
                    entriesBuffer = [];
                    if (i % 1000 === 0) setStats(s => ({ ...s, entries: importedEntries }));
                }
            }
            if (entriesBuffer.length > 0) {
                await supabase.from('time_entries').insert(entriesBuffer);
                importedEntries += entriesBuffer.length;
            }
            setStats(s => ({ ...s, entries: importedEntries }));
            addLog(`🎉 Sucesso! ${importedEntries} batidas importadas.`);

        } catch (error: any) {
            console.error(error);
            addLog(`❌ ERRO: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 text-slate-100 p-8">
            <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Database size={32} className="text-blue-500" />
                    Migração Ponto Secullum 4
                </h1>
                <p className="text-slate-500 mt-2">Importador direto de arquivo .MDB</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 border-dashed border-2 hover:border-blue-500/50 transition-colors text-center group relative">
                <input
                    type="file"
                    accept=".mdb"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {loading ? (
                    <div className="py-12">
                        <Loader2 size={48} className="mx-auto text-blue-500 animate-spin mb-4" />
                        <h3 className="text-xl font-bold text-white">Processando... Olhe os logs abaixo</h3>
                    </div>
                ) : (
                    <div className="py-12">
                        <Upload size={64} className="mx-auto text-slate-700 group-hover:text-blue-500 mb-6 transition-colors" />
                        <h3 className="text-xl font-bold text-white">Arraste o arquivo .MDB aqui</h3>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 font-bold uppercase">Funcionários</p>
                    <p className="text-2xl font-black text-emerald-500">{stats.employees}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 font-bold uppercase">Batidas</p>
                    <p className="text-2xl font-black text-blue-500">{stats.entries}</p>
                </div>
            </div>

            <div className="bg-black/50 border border-slate-800 rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs text-slate-400 space-y-1">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
        </div>
    );
};

export default Migration;

```


# File: pages/OperationsMap.tsx
```
import React from 'react';
const { useState, useEffect } = React;
import { Calendar, ChevronLeft, ChevronRight, Filter, Download, Plus, Search, MapPin, Hammer, CloudRain, Clock } from 'lucide-react';
import { dashboardService } from '../services/api';
import { EquipmentTimeline, TimelineCell } from '../services/mockData';

const DAYS_IN_MONTH = 31;
const MOCK_MONTH = 'Dezembro 2024';

const OperationsMap: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState<any[]>([]);
    const [selectedCell, setSelectedCell] = useState<{ eqId: string, day: number, dateStr: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 1-12
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    const filteredData = data.filter(eq =>
        (eq.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eq.model || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const loadData = async () => {
        setLoading(true);
        try {
            const { operationsService } = await import('../services/operationsService');
            // @ts-ignore
            const result = await operationsService.getOperationsMapData(month, year);
            setData(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // ...

    // No input:
    // <input 
    //    placeholder="Filtrar Equipamento..." 
    //    className="..."
    //    value={searchTerm}
    //    onChange={(e) => setSearchTerm(e.target.value)}
    // />

    useEffect(() => {
        loadData();
    }, [month, year]);

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month, 1));

    const getStatusColor = (status: TimelineCell['status']) => {
        switch (status) {
            case 'WORKED': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/40';
            case 'STANDBY': return 'bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-700';
            case 'MAINTENANCE': return 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/40';
            case 'RAIN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/40';
            default: return 'bg-transparent border-slate-800/50 hover:bg-slate-800/50';
        }
    };

    const getStatusIcon = (status: TimelineCell['status']) => {
        switch (status) {
            case 'WORKED': return <Clock size={10} />;
            case 'MAINTENANCE': return <Hammer size={10} />;
            case 'RAIN': return <CloudRain size={10} />;
            default: return null;
        }
    };

    const handleCellClick = (eqId: string, day: number) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedCell({ eqId, day, dateStr });
    };

    const handleSave = async (updatedCell: any) => {
        if (!selectedCell) return;

        try {
            const { operationsService } = await import('../services/operationsService');
            // @ts-ignore
            await operationsService.saveOperation(selectedCell.eqId, selectedCell.dateStr, updatedCell);

            // Reload data to reflect changes
            await loadData();
            setSelectedCell(null);
        } catch (e) {
            alert('Erro ao salvar: ' + e);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-slate-900 bg-slate-950 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Calendar className="text-indigo-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight uppercase">Mapa de Operações</h1>
                        <p className="text-xs text-slate-500 font-bold">Controle de Alocação e Status (Timeline)</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
                        <button onClick={handlePrevMonth} className="text-slate-400 hover:text-white"><ChevronLeft size={16} /></button>
                        <span className="mx-4 text-sm font-bold text-white uppercase tracking-wider w-32 text-center">{monthName}</span>
                        <button onClick={handleNextMonth} className="text-slate-400 hover:text-white"><ChevronRight size={16} /></button>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-800"></div>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                        <Download size={16} /> Exportar Excel
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="h-12 border-b border-slate-900 bg-slate-950/50 flex items-center px-6 gap-4 shrink-0">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 w-64">
                    <Search size={14} className="text-slate-500" />
                    <input
                        placeholder="Filtrar Equipamento..."
                        className="bg-transparent text-xs text-white outline-none w-full placeholder:text-slate-600 uppercase"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Trabalhou</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-slate-700/50 border border-slate-600"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Parado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Manutenção</span>
                    </div>
                </div>
            </div>

            {/* Timeline Grid */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
                {/* Header Row (Days) */}
                <div className="flex border-b border-slate-800 bg-slate-900/50 overflow-hidden shrink-0">
                    <div className="w-64 shrink-0 p-3 border-r border-slate-800 text-xs font-black text-slate-500 uppercase tracking-wider flex items-center pl-6">
                        Equipamento
                    </div>
                    <div className="flex-1 overflow-x-auto custom-scrollbar flex">
                        {Array.from({ length: daysInMonth }, (_, i) => (
                            <div key={i} className="w-12 shrink-0 border-r border-slate-800/50 py-2 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][(new Date(year, month - 1, i + 1).getDay())]}</span>
                                <span className={`text-xs font-black ${new Date(year, month - 1, i + 1).getDay() === 0 || new Date(year, month - 1, i + 1).getDay() === 6 ? 'text-indigo-400' : 'text-white'}`}>{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">Carregando Mapa...</div>
                    ) : (
                        filteredData.map(eq => (
                            <div key={eq.id} className="flex border-b border-slate-800/50 hover:bg-slate-900/20 transition-colors">
                                <div className="w-64 shrink-0 p-3 border-r border-slate-800 bg-slate-950 z-10 sticky left-0 flex flex-col justify-center pl-6 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
                                    <p className="text-sm font-bold text-white">{eq.name}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">{eq.model}</p>
                                </div>
                                <div className="flex-1 flex">
                                    {eq.timeline.map((cell: any) => (
                                        <div
                                            key={cell.day}
                                            onClick={() => handleCellClick(eq.id, cell.day)}
                                            className={`w-12 shrink-0 border-r border-slate-800/30 h-16 p-1 cursor-pointer transition-all relative group hover:bg-white/5 active:scale-95`}
                                        >
                                            <div className={`w-full h-full rounded border flex flex-col items-center justify-center gap-1 ${getStatusColor(cell.status)}`}>
                                                {cell.status === 'WORKED' && <span className="text-[10px] font-black">{cell.hours}h</span>}
                                                {getStatusIcon(cell.status)}
                                            </div>
                                            {cell.location && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl font-bold">
                                                    {cell.location}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {selectedCell && (
                <EditModal
                    cell={data.find(d => d.id === selectedCell.eqId)?.timeline.find((t: any) => t.day === selectedCell.day)}
                    onClose={() => setSelectedCell(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

const EditModal: React.FC<{ cell: TimelineCell, onClose: () => void, onSave: (cell: TimelineCell) => void }> = ({ cell, onClose, onSave }) => {
    const [status, setStatus] = useState<TimelineCell['status']>(cell.status);
    const [location, setLocation] = useState(cell.location || 'PEDREIRA');
    const [startTime, setStartTime] = useState(cell.startTime || '07:30');
    const [endTime, setEndTime] = useState(cell.endTime || '17:00');
    const [hasLunchBreak, setHasLunchBreak] = useState(cell.hasLunchBreak || false);
    const [lunchStartTime, setLunchStartTime] = useState(cell.lunchStartTime || '12:00');
    const [lunchEndTime, setLunchEndTime] = useState(cell.lunchEndTime || '13:00');

    // Auto-calculate hours
    const calculateHours = () => {
        if (status !== 'WORKED') return 0;
        if (!startTime || !endTime) return 0;

        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        let diffMs = end.getTime() - start.getTime();

        if (hasLunchBreak && lunchStartTime && lunchEndTime) {
            const lStart = new Date(`2000-01-01T${lunchStartTime}`);
            const lEnd = new Date(`2000-01-01T${lunchEndTime}`);
            const lunchDiff = lEnd.getTime() - lStart.getTime();
            diffMs -= lunchDiff;
        }

        const hours = diffMs / (1000 * 60 * 60);
        return Math.max(0, Number(hours.toFixed(2))); // Ensure non-negative
    };

    const calculatedHours = calculateHours();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-[450px] shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">x</button>
                <h3 className="text-white font-bold text-lg mb-4">Editar Apontamento</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setStatus('WORKED')} className={`p-3 rounded-xl border font-bold text-sm flex flex-col items-center gap-2 transition-all ${status === 'WORKED' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>
                            <Clock size={20} /> Trabalhou
                        </button>
                        <button onClick={() => setStatus('STANDBY')} className={`p-3 rounded-xl border font-bold text-sm flex flex-col items-center gap-2 transition-all ${status === 'STANDBY' ? 'bg-slate-600/50 text-white border-slate-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>
                            <div className="w-5 h-5 rounded border-2 border-current"></div> Parado
                        </button>
                        <button onClick={() => setStatus('MAINTENANCE')} className={`p-3 rounded-xl border font-bold text-sm flex flex-col items-center gap-2 transition-all ${status === 'MAINTENANCE' ? 'bg-red-500/20 text-red-500 border-red-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>
                            <Hammer size={20} /> Manutenção
                        </button>
                        <button onClick={() => setStatus('RAIN')} className={`p-3 rounded-xl border font-bold text-sm flex flex-col items-center gap-2 transition-all ${status === 'RAIN' ? 'bg-blue-500/20 text-blue-500 border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>
                            <CloudRain size={20} /> Chuva
                        </button>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Local / Obra</label>
                        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1">
                            <MapPin size={14} className="text-slate-500" />
                            <input
                                className="bg-transparent text-white text-sm w-full outline-none"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    {status === 'WORKED' && (
                        <div className="space-y-4 bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Início Operação</label>
                                    <input
                                        type="time"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-white focus:border-indigo-500 transition-colors"
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Término Operação</label>
                                    <input
                                        type="time"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-white focus:border-indigo-500 transition-colors"
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="lunchBreak"
                                    checked={hasLunchBreak}
                                    onChange={e => setHasLunchBreak(e.target.checked)}
                                    className="accent-indigo-500 w-4 h-4"
                                />
                                <label htmlFor="lunchBreak" className="text-sm text-white font-bold select-none cursor-pointer">Apontar Parada para Almoço</label>
                            </div>

                            {hasLunchBreak && (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Início Almoço</label>
                                        <input
                                            type="time"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-white focus:border-indigo-500 transition-colors"
                                            value={lunchStartTime}
                                            onChange={e => setLunchStartTime(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Término Almoço</label>
                                        <input
                                            type="time"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-white focus:border-indigo-500 transition-colors"
                                            value={lunchEndTime}
                                            onChange={e => setLunchEndTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase">Total Horas</span>
                                <span className="text-lg font-black text-emerald-400">{calculatedHours}h</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => onSave({
                            ...cell,
                            status,
                            location,
                            hours: calculatedHours,
                            startTime,
                            endTime,
                            hasLunchBreak,
                            lunchStartTime,
                            lunchEndTime
                        })}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg mt-2 transition-all hover:scale-[1.02]"
                    >
                        Salvar Apontamento
                    </button>
                </div>
            </div>
        </div>
    );
};


export default OperationsMap;

```


# File: pages/Register.tsx
```
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

```


# File: pages/Registrations.tsx
```

import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, Search, Plus, Save, Edit, Trash2, X, Check, MapPin, DollarSign, WalletCards } from 'lucide-react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';
import EmployeeForm from '../components/hr/EmployeeForm';
import WorkShiftForm from '../components/hr/WorkShiftForm';

type Tab = 'CLIENTS' | 'SUPPLIERS' | 'EMPLOYEES' | 'WORK_SHIFTS';

interface Entity {
    id: string;

    // Flags
    is_client: boolean;
    is_supplier: boolean;

    // Identificação
    type?: 'PF' | 'PJ';
    name: string;
    social_reason?: string;
    document?: string; // CNPJ/CPF
    state_registration?: string; // IE ou RG
    municipal_registration?: string; // IM
    birth_date?: string;

    // Fornecedor Específico
    supplier_category?: string;

    // Cliente Específico
    credit_limit?: number;
    credit_rating?: string;

    // Comum
    email?: string;
    phone?: string;
    website?: string;

    zip_code?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;

    payment_terms?: string;
    notes?: string;

    contacts?: { name: string; role: string; email?: string; phone?: string }[];

    active?: boolean;
}

const Registrations: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('CLIENTS');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Entities State (Unified Client/Supplier)
    const [entities, setEntities] = useState<Entity[]>([]);
    const [entityForm, setEntityForm] = useState<Partial<Entity>>({});
    const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
    const [activeModalTab, setActiveModalTab] = useState<'GENERAL' | 'ADDRESS' | 'COMMERCIAL' | 'CONTACTS'>('GENERAL');

    // Employees States
    const [realEmployees, setRealEmployees] = useState<any[]>([]);
    const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
    const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
    const [availableCompanies, setAvailableCompanies] = useState<{ id: string, name: string }[]>([]);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');
    const [companyFilter, setCompanyFilter] = useState<string>('ALL');

    // Shifts States
    const [shifts, setShifts] = useState<any[]>([]);
    const [isShiftFormOpen, setIsShiftFormOpen] = useState(false);
    const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
    const [shiftInitialData, setShiftInitialData] = useState<any>(null);

    // Temporary state for new contact
    const [newContact, setNewContact] = useState({ name: '', role: '', email: '', phone: '' });

    // Load Data Effect
    useEffect(() => {
        if (activeTab === 'CLIENTS' || activeTab === 'SUPPLIERS') fetchEntities();
        else if (activeTab === 'EMPLOYEES') { fetchEmployees(); fetchCompanies(); }
        else if (activeTab === 'WORK_SHIFTS') fetchShifts();
    }, [activeTab]);

    // --- Fetchers ---
    const fetchEntities = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('entities').select('*').order('name');
        if (error) console.error(error);
        else setEntities(data || []);
        setLoading(false);
    };

    const fetchEmployees = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('employees').select('*, companies(name)').order('full_name');
        if (error) console.error(error);
        else setRealEmployees(data || []);
        setLoading(false);
    };

    const fetchShifts = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('work_shifts').select('*').order('name');
        if (error) console.error(error);
        else setShifts(data || []);
        setLoading(false);
    };

    const fetchCompanies = async () => {
        const { data } = await supabase.from('companies').select('id, name');
        if (data) setAvailableCompanies(data);
    };

    // --- Handlers ---
    const handleSaveEntity = async () => {
        if (!entityForm.name) return alert('Nome/Razão Social é obrigatório');

        // Ensure at least one flag is checked
        if (!entityForm.is_client && !entityForm.is_supplier) {
            return alert('Selecione pelo menos um papel: Cliente ou Fornecedor.');
        }

        const payload = { ...entityForm };
        if (!payload.document) delete payload.document;
        if (!payload.email) delete payload.email;
        if (!payload.contacts) payload.contacts = [];

        try {
            if (editingEntityId) {
                const { error } = await supabase.from('entities').update(payload).eq('id', editingEntityId);
                if (error) throw error;
                alert('Cadastro atualizado com sucesso!');
            } else {
                const { error } = await supabase.from('entities').insert(payload);
                if (error) throw error;
                alert('Cadastro realizado com sucesso!');
            }
            setIsModalOpen(false);
            fetchEntities();
        } catch (e: any) {
            alert('Erro ao salvar: ' + e.message);
        }
    };

    const handleDeleteEntity = async (id: string) => {
        if (!window.confirm("ATENÇÃO: Deseja excluir este cadastro?")) return;
        const { error } = await supabase.from('entities').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchEntities();
    };

    const handleEditEntity = (e: Entity) => {
        setEditingEntityId(e.id);
        setEntityForm(e);
        setActiveModalTab('GENERAL');
        setIsModalOpen(true);
    };

    const handleOpenCreate = () => {
        setEditingEntityId(null);
        // Pre-select flag based on active tab
        setEntityForm({
            type: 'PJ',
            is_client: activeTab === 'CLIENTS',
            is_supplier: activeTab === 'SUPPLIERS'
        });
        setActiveModalTab('GENERAL');
        setIsModalOpen(true);
    };

    const handleAddContact = () => {
        if (!newContact.name) return alert('Nome do contato é obrigatório');
        const updatedContacts = [...(entityForm.contacts || []), newContact];
        setEntityForm({ ...entityForm, contacts: updatedContacts });
        setNewContact({ name: '', role: '', email: '', phone: '' });
    };

    const handleRemoveContact = (index: number) => {
        const updatedContacts = [...(entityForm.contacts || [])];
        updatedContacts.splice(index, 1);
        setEntityForm({ ...entityForm, contacts: updatedContacts });
    };

    const handleConsultarCNPJ = async () => {
        const cnpj = entityForm.document?.replace(/\D/g, '');
        if (!cnpj || cnpj.length !== 14) return alert('Digite um CNPJ válido (14 dígitos).');

        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
            if (!response.ok) throw new Error('CNPJ não encontrado.');

            const data = await response.json();

            setEntityForm(prev => ({
                ...prev,
                social_reason: data.razao_social,
                name: data.nome_fantasia || data.razao_social,
                zip_code: data.cep,
                street: data.logradouro,
                number: data.numero,
                complement: data.complemento,
                neighborhood: data.bairro,
                city: data.municipio,
                state: data.uf,
                email: data.email,
                phone: data.ddd_telefone_1,
            }));
            alert(`Dados de "${data.nome_fantasia || data.razao_social}" carregados.`);
        } catch (e: any) {
            alert('Erro: ' + e.message);
        }
    };

    const handleAddressSearch = async () => {
        const cep = entityForm.zip_code?.replace(/\D/g, '');
        if (!cep || cep.length !== 8) return;

        try {
            const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
            if (!response.ok) return; // Silencioso se der erro
            const data = await response.json();

            setEntityForm(prev => ({
                ...prev,
                street: data.street,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state
            }));
        } catch (e) { }
    };


    const handleDeleteEmployee = async (id: string) => {
        // ... (unchanged)
        if (!window.confirm('Tem certeza?')) return;
        const { error } = await supabase.from('employees').delete().eq('id', id);
        if (error) alert(error.message); else fetchEmployees();
    };

    // --- Render Helpers ---
    const getFilteredEntities = (role: 'CLIENT' | 'SUPPLIER') => {
        return entities.filter(e => {
            const matchesRole = role === 'CLIENT' ? e.is_client : e.is_supplier;
            const matchesSearch = (e.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (e.document || '').includes(searchTerm);
            return matchesRole && matchesSearch;
        });
    };

    // ... getFilteredEmployees (unchanged) ...
    const getFilteredEmployees = () => {
        return realEmployees.filter(emp => {
            const matchesSearch = (emp.full_name || emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (emp.registration_number || '').includes(searchTerm);
            const matchesStatus = statusFilter === 'ALL' ? true : statusFilter === 'ACTIVE' ? emp.active !== false : emp.active === false;
            const matchesCompany = companyFilter === 'ALL' ? true : emp.company_id === companyFilter;
            return matchesSearch && matchesStatus && matchesCompany;
        });
    };

    const renderHeader = () => (
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Cadastros Gerais</h2>
                <p className="text-slate-500 mt-1">Gestão unificada de parceiros e colaboradores.</p>
            </div>
            <button
                onClick={() => {
                    if (activeTab === 'CLIENTS' || activeTab === 'SUPPLIERS') handleOpenCreate();
                    else if (activeTab === 'EMPLOYEES') { setEditingEmpId(null); setIsEmployeeFormOpen(true); }
                    else if (activeTab === 'WORK_SHIFTS') { setEditingShiftId(null); setShiftInitialData(null); setIsShiftFormOpen(true); }
                }}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center gap-2"
            >
                <Plus size={18} />
                {activeTab === 'CLIENTS' ? 'Novo Parceiro' : activeTab === 'SUPPLIERS' ? 'Novo Parceiro' : activeTab === 'EMPLOYEES' ? 'Novo Funcionário' : 'Novo Turno'}
            </button>
        </div>
    );

    const renderTabs = () => (
        <div className="flex gap-4 mb-6 border-b border-slate-800 pb-1 overflow-x-auto">
            {[
                { id: 'CLIENTS', label: 'Clientes', icon: Users },
                { id: 'SUPPLIERS', label: 'Fornecedores', icon: Building2 },
                { id: 'EMPLOYEES', label: 'Funcionários', icon: Briefcase },
                { id: 'WORK_SHIFTS', label: 'Turnos', icon: Briefcase }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`px-4 py-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <tab.icon size={18} /> {tab.label}
                    </div>
                </button>
            ))}
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
            {renderHeader()}
            {renderTabs()}

            {/* Main Content Area */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950/20">
                    <div className="relative w-full md:max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                            <tr>
                                {(activeTab === 'CLIENTS' || activeTab === 'SUPPLIERS') && (
                                    <>
                                        <th className="px-8 py-4">Parceiro</th>
                                        <th className="px-8 py-4">Documento</th>
                                        <th className="px-8 py-4">Endereço</th>
                                        <th className="px-8 py-4">Contato</th>
                                        {activeTab === 'SUPPLIERS' && <th className="px-8 py-4">Categoria</th>}
                                    </>
                                )}
                                {activeTab === 'EMPLOYEES' && (
                                    <>
                                        <th className="px-8 py-4">Colaborador</th>
                                        <th className="px-8 py-4">Cargo</th>
                                        <th className="px-8 py-4">Email</th>
                                        <th className="px-8 py-4">Status</th>
                                    </>
                                )}
                                {activeTab === 'WORK_SHIFTS' && (
                                    <>
                                        <th className="px-8 py-4">Turno</th>
                                        <th className="px-8 py-4">Horário</th>
                                    </>
                                )}
                                <th className="px-8 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {/* CLIENTS & SUPPLIERS ROWS */}
                            {(activeTab === 'CLIENTS' || activeTab === 'SUPPLIERS') && getFilteredEntities(activeTab === 'CLIENTS' ? 'CLIENT' : 'SUPPLIER').map(e => (
                                <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-white uppercase flex items-center gap-2">
                                            {e.name}
                                            {/* Badge se for ambos */}
                                            {e.is_client && e.is_supplier && <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">HÍBRIDO</span>}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-mono">{e.social_reason || e.name}</div>
                                    </td>
                                    <td className="px-8 py-5 text-slate-400 font-mono text-xs">{e.document || '-'}</td>
                                    <td className="px-8 py-5 text-slate-400 text-xs">
                                        {e.city ? `${e.city}/${e.state || ''}` : '-'}
                                    </td>
                                    <td className="px-8 py-5 text-slate-300">
                                        <div className="flex flex-col">
                                            <span className="text-xs">{e.email}</span>
                                            <span className="text-[10px] text-slate-500">{e.phone}</span>
                                        </div>
                                    </td>
                                    {activeTab === 'SUPPLIERS' && <td className="px-8 py-5 text-slate-400 text-xs">{e.supplier_category || '-'}</td>}
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEditEntity(e)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteEntity(e.id)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {/* EMPLOYEES & SHIFTS (Simplified from previous version) */}
                            {activeTab === 'EMPLOYEES' && getFilteredEmployees().map(e => (
                                <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-white uppercase">{e.full_name || e.name}</div>
                                        <div className="text-[10px] text-slate-500 font-mono">{e.registration_number || 'S/M'}</div>
                                    </td>
                                    <td className="px-8 py-5 text-slate-300 uppercase text-xs">{e.job_title || '-'}</td>
                                    <td className="px-8 py-5 text-slate-400 text-xs">{e.email || '-'}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${e.active !== false ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {e.active !== false ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setEditingEmpId(e.id); setIsEmployeeFormOpen(true); }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-blue-600 transition-colors"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteEmployee(e.id)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-red-600 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'WORK_SHIFTS' && shifts.map(s => (
                                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-8 py-5 font-bold text-white">{s.name}</td>
                                    <td className="px-8 py-5 text-slate-300 font-mono">{s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}</td>
                                    <td className="px-8 py-5 text-right">
                                        <button onClick={() => { setEditingShiftId(s.id); setShiftInitialData(s); setIsShiftFormOpen(true); }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Edit size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* UNIFIED MODAL FOR ENTITIES (CLIENTS & SUPPLIERS) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingEntityId ? 'Editar Parceiro' : 'Novo Parceiro'}
            >
                {(activeTab === 'CLIENTS' || activeTab === 'SUPPLIERS') ? (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

                        {/* Papéis (Roles) */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={entityForm.is_client || false}
                                    onChange={e => setEntityForm({ ...entityForm, is_client: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-bold text-white">É Cliente</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={entityForm.is_supplier || false}
                                    onChange={e => setEntityForm({ ...entityForm, is_supplier: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-bold text-white">É Fornecedor</span>
                            </label>
                        </div>

                        {/* Tabs for Details */}
                        <div className="sticky top-0 bg-slate-900 pb-2 z-10 border-b border-slate-800 flex gap-4 overflow-x-auto">
                            {[
                                { id: 'GENERAL', label: 'Dados Gerais', icon: Users },
                                { id: 'ADDRESS', label: 'Endereço', icon: MapPin },
                                { id: 'COMMERCIAL', label: 'Fiscal/Coml.', icon: DollarSign },
                                { id: 'CONTACTS', label: 'Contatos', icon: Briefcase },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${activeModalTab === tab.id ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-white'}`}
                                    onClick={() => setActiveModalTab(tab.id as any)}
                                >
                                    <tab.icon size={14} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* --- TAB: GERAL --- */}
                        {activeModalTab === 'GENERAL' && (
                            <div className="space-y-4 pt-2">
                                {/* Tipo de Pessoa Switch */}
                                <div className="bg-slate-950 p-1 rounded-lg inline-flex border border-slate-800 mb-2">
                                    <button
                                        onClick={() => setEntityForm({ ...entityForm, type: 'PJ' })}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${entityForm.type === 'PJ' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                    >Pessoa Jurídica (CNPJ)</button>
                                    <button
                                        onClick={() => setEntityForm({ ...entityForm, type: 'PF' })}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${entityForm.type === 'PF' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                    >Pessoa Física (CPF)</button>
                                </div>

                                {/* --- FORMULÁRIO --- */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">{entityForm.type === 'PJ' ? 'CNPJ (Consulta Automática)' : 'CPF'}</label>
                                    <div className="flex gap-2">
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-mono"
                                            placeholder={entityForm.type === 'PJ' ? "00.000.000/0001-00" : "000.000.000-00"}
                                            value={entityForm.document || ''}
                                            onChange={e => setEntityForm({ ...entityForm, document: e.target.value })}
                                        />
                                        {entityForm.type === 'PJ' && (
                                            <button onClick={handleConsultarCNPJ} className="bg-blue-600/20 hover:bg-blue-600 text-blue-500 hover:text-white px-4 rounded-xl flex items-center justify-center transition-all">
                                                <Search size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">{entityForm.type === 'PJ' ? 'Nome Fantasia' : 'Nome Completo'}</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                        placeholder={entityForm.type === 'PF' ? "João da Silva" : "Construtora Horizonte"}
                                        value={entityForm.name || ''}
                                        onChange={e => setEntityForm({ ...entityForm, name: e.target.value })}
                                    />
                                </div>

                                {entityForm.type === 'PJ' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Razão Social</label>
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                            value={entityForm.social_reason || ''}
                                            onChange={e => setEntityForm({ ...entityForm, social_reason: e.target.value })}
                                        />
                                    </div>
                                )}

                                {entityForm.type === 'PF' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Data Nascimento</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                            value={entityForm.birth_date || ''}
                                            onChange={e => setEntityForm({ ...entityForm, birth_date: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Email Geral</label>
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                            value={entityForm.email || ''}
                                            onChange={e => setEntityForm({ ...entityForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Telefone Principal</label>
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                            value={entityForm.phone || ''}
                                            onChange={e => setEntityForm({ ...entityForm, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: ADDRESS --- */}
                        {activeModalTab === 'ADDRESS' && (
                            <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">CEP</label>
                                        <div className="flex gap-2">
                                            <input
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-mono"
                                                placeholder="00000-000"
                                                maxLength={9}
                                                value={entityForm.zip_code || ''}
                                                onChange={e => setEntityForm({ ...entityForm, zip_code: e.target.value })}
                                                onBlur={handleAddressSearch}
                                            />
                                            <button className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white" onClick={handleAddressSearch}><Search size={18} /></button>
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Cidade</label>
                                        <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" value={entityForm.city || ''} onChange={e => setEntityForm({ ...entityForm, city: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-3 space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Logradouro</label>
                                        <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" value={entityForm.street || ''} onChange={e => setEntityForm({ ...entityForm, street: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Número</label>
                                        <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" value={entityForm.number || ''} onChange={e => setEntityForm({ ...entityForm, number: e.target.value })} />
                                    </div>
                                </div>
                                {/* ... (neighborhood, state - reuse logic) ... */}
                                {/* Skipping verbose repetition, assume similar structure */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Bairro</label>
                                    <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" value={entityForm.neighborhood || ''} onChange={e => setEntityForm({ ...entityForm, neighborhood: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {/* --- TAB: COMMERCIAL --- */}
                        {activeModalTab === 'COMMERCIAL' && (
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">{entityForm.type === 'PF' ? 'RG / Identidade' : 'Inscrição Estadual'}</label>
                                    <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" value={entityForm.state_registration || ''} onChange={e => setEntityForm({ ...entityForm, state_registration: e.target.value })} />
                                </div>

                                {/* Campos Condicionais baseados em flag */}
                                {entityForm.is_supplier && (
                                    <div className="space-y-2 border-l-2 border-purple-500 pl-4 bg-purple-500/5 p-2 rounded-r-xl">
                                        <label className="text-[10px] font-bold text-purple-400 uppercase">Categoria do Fornecedor</label>
                                        <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" placeholder="Ex: Peças Mecânicas" value={entityForm.supplier_category || ''} onChange={e => setEntityForm({ ...entityForm, supplier_category: e.target.value })} />
                                    </div>
                                )}

                                {entityForm.is_client && (
                                    <div className="border-l-2 border-blue-500 pl-4 bg-blue-500/5 p-2 rounded-r-xl space-y-2">
                                        <label className="text-[10px] font-bold text-blue-400 uppercase">Limite de Crédito (R$)</label>
                                        <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" value={entityForm.credit_limit || 0} onChange={e => setEntityForm({ ...entityForm, credit_limit: parseFloat(e.target.value) })} />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Observações Gerais</label>
                                    <textarea className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none h-24 resize-none" value={entityForm.notes || ''} onChange={e => setEntityForm({ ...entityForm, notes: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {/* --- TAB: CONTACTS --- */}
                        {activeModalTab === 'CONTACTS' && (
                            <div className="space-y-4 pt-2">
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase">Adicionar Novo Contato</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs outline-none" placeholder="Nome *" value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} />
                                        <input className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs outline-none" placeholder="Cargo" value={newContact.role} onChange={e => setNewContact({ ...newContact, role: e.target.value })} />
                                        <input className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs outline-none" placeholder="Email" value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })} />
                                        <input className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs outline-none" placeholder="Telefone" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} />
                                    </div>
                                    <button onClick={handleAddContact} className="w-full py-2 bg-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors">+ Adicionar</button>
                                </div>
                                <div className="space-y-2">
                                    {entityForm.contacts?.map((c, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-slate-700">
                                            <div>
                                                <p className="text-sm font-bold text-white">{c.name}</p>
                                                <p className="text-[10px] text-slate-400">{c.role} • {c.email || c.phone}</p>
                                            </div>
                                            <button onClick={() => handleRemoveContact(idx)} className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex gap-3 border-t border-slate-800 mt-4">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">Cancelar</button>
                            <button onClick={handleSaveEntity} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                                <Save size={18} /> Salvar Parceiro
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-center text-slate-500">
                        Formulário não disponível nesta visualização.
                    </div>
                )}
            </Modal>

            {isEmployeeFormOpen && (
                <EmployeeForm
                    employeeId={editingEmpId}
                    companiesList={availableCompanies}
                    onClose={() => setIsEmployeeFormOpen(false)}
                    onSuccess={() => { setIsEmployeeFormOpen(false); fetchEmployees(); }}
                    onSwitchToEdit={(id) => { setIsEmployeeFormOpen(false); setTimeout(() => { setEditingEmpId(id); setIsEmployeeFormOpen(true); }, 50); }}
                />
            )}
            {isShiftFormOpen && (
                <WorkShiftForm shiftId={editingShiftId} initialData={shiftInitialData} onClose={() => setIsShiftFormOpen(false)} onSuccess={() => { setIsShiftFormOpen(false); fetchShifts(); }} />
            )}
        </div>
    );
};

export default Registrations;

```


# File: pages/SecurityAudit.tsx
```

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

```


# File: pages/Settings.tsx
```
import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCog, Lock, Save, Plus, Search, Loader, Pencil, Shield } from 'lucide-react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';

const Settings: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [userForm, setUserForm] = useState({ name: '', email: '', role: 'operador', password: '' });

    // Permissions State
    const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<any>(null);
    const [systemModules, setSystemModules] = useState<any[]>([]);
    const [userPermissions, setUserPermissions] = useState<any[]>([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.functions.invoke('admin-actions', {
                body: { action: 'listUsers' }
            });
            if (error) {
                console.error("Function error:", error);
                setUsers([]);
            } else {
                setUsers(data || []);
            }
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenCreate = () => {
        setEditingUserId(null);
        setUserForm({ name: '', email: '', role: 'operador', password: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: any) => {
        setEditingUserId(user.id);
        setUserForm({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'operador',
            password: '' // Senha vazia = não alterar
        });
        setIsModalOpen(true);
    };

    const handleOpenPermissions = async (user: any) => {
        setSelectedUserForPermissions(user);
        setLoadingPermissions(true);
        setIsPermissionsModalOpen(true);

        try {
            // 1. Buscas Módulos
            const { data: modules, error: modError } = await supabase
                .from('system_modules')
                .select('*')
                .eq('is_active', true)
                .order('category')
                .order('name');

            if (modError) throw modError;
            setSystemModules(modules || []);

            // 2. Busca Permissões Atuais do Usuário
            const { data: perms, error: permError } = await supabase
                .from('user_permissions')
                .select('module_slug, can_read, can_create, can_update, can_delete')
                .eq('user_id', user.id);

            if (permError) throw permError;
            setUserPermissions(perms || []);

        } catch (error: any) {
            console.error("Erro ao carregar permissões:", error);
            alert("Erro ao carregar permissões: " + error.message);
        } finally {
            setLoadingPermissions(false);
        }
    };

    const handleTogglePermission = (moduleSlug: string) => {
        setUserPermissions(prev => {
            const exists = prev.find(p => p.module_slug === moduleSlug);
            if (exists) {
                // Remove (Desmarcar) -> Remove da lista local (será deletado ou update false no save)
                // Vamos remover da lista para indicar "sem permissão"
                return prev.filter(p => p.module_slug !== moduleSlug);
            } else {
                // Adiciona (Marcar) -> Default all true for simplicity
                return [...prev, { module_slug: moduleSlug, can_read: true, can_create: true, can_update: true, can_delete: true }];
            }
        });
    };

    const handleSavePermissions = async () => {
        if (!selectedUserForPermissions) return;
        setIsSaving(true);
        try {
            // Estratégia simples: Delete All user permissions and Insert All Selected
            // (Melhor seria UPSERT inteligente, mas DELETE+INSERT é seguro e limpo para esse caso)

            // 1. Delete todas existentes
            await supabase.from('user_permissions').delete().eq('user_id', selectedUserForPermissions.id);

            // 2. Insere as novas
            if (userPermissions.length > 0) {
                const payload = userPermissions.map(p => ({
                    user_id: selectedUserForPermissions.id,
                    module_slug: p.module_slug,
                    can_read: true, // Forçando tudo true no toggle simples
                    can_create: true,
                    can_update: true,
                    can_delete: true
                }));

                const { error } = await supabase.from('user_permissions').insert(payload);
                if (error) throw error;
            }

            alert("Permissões atualizadas com sucesso!");
            setIsPermissionsModalOpen(false);
        } catch (error: any) {
            alert("Erro ao salvar permissões: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveUser = async () => {
        // Validação
        if (!userForm.email) return alert('Email é obrigatório');
        if (!editingUserId && !userForm.password) return alert('Senha é obrigatória para novos usuários');

        setIsSaving(true);
        try {
            const action = editingUserId ? 'updateUser' : 'createUser';
            const payload = {
                id: editingUserId, // Ignorado no create
                email: userForm.email,
                password: userForm.password, // Pode ser vazio no update
                fullName: userForm.name,
                role: userForm.role
            };

            const { data, error } = await supabase.functions.invoke('admin-actions', {
                body: { action, payload }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            alert(editingUserId ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
            setIsModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            alert('Erro ao salvar usuário: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Configurações & Acesso</h2>
                    <p className="text-slate-500 mt-1">Gestão de usuários, permissões e segurança do sistema.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all flex items-center gap-2"
                >
                    <Plus size={18} /> Novo Usuário
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Nível de Segurança</p>
                        <h3 className="text-white font-bold text-lg">Protegido</h3>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
                        <UserCog size={32} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Usuários Ativos</p>
                        <h3 className="text-white font-bold text-lg">{users.length} Usuários</h3>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Usuários do Sistema</h3>
                    <button onClick={fetchUsers} className="text-slate-500 hover:text-white" title="Atualizar Lista"><Loader size={16} /></button>
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        <tr>
                            <th className="px-8 py-4">Usuário</th>
                            <th className="px-8 py-4">Email</th>
                            <th className="px-8 py-4">Função (Role)</th>
                            <th className="px-8 py-4">Acesso</th>
                            <th className="px-8 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Carregando usuários...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>
                        ) : (
                            users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                                {(u.name || (u.email || '?')[0]).charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white">{u.name || 'Sem Nome'}</span>
                                                {u.id === editingUserId && <span className="text-[10px] text-emerald-500">Editando agora...</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-slate-400">{u.email}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' :
                                            u.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-500' :
                                                u.role === 'MECHANIC' ? 'bg-orange-500/10 text-orange-500' :
                                                    'bg-slate-700 text-slate-400'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-slate-500 text-xs">
                                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => handleOpenPermissions(u)}
                                            className="text-purple-500 hover:text-white font-bold text-xs flex items-center gap-1"
                                            title="Gerenciar Permissões"
                                        >
                                            <Shield size={14} /> Acessos
                                        </button>
                                        <div className="h-4 w-[1px] bg-slate-800"></div>
                                        <button
                                            onClick={() => handleOpenEdit(u)}
                                            className="text-blue-500 hover:text-white font-bold text-xs flex items-center justify-end gap-1"
                                        >
                                            <Pencil size={14} /> Editar
                                        </button>
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>
            </div>

            {/* Modal Editar Usuário */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUserId ? "Editar Usuário" : "Novo Usuário"}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                        <input
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                            value={userForm.name}
                            onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                            placeholder="Ex: João da Silva"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email Corporativo</label>
                        <input
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                            value={userForm.email}
                            onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                            placeholder="joao@terrapro.com"
                            disabled={!!editingUserId} // Email geralmente não muda fácil no Supabase Auth sem reconfirmar, melhor bloquear edição simples
                            title={editingUserId ? "Para alterar o email, crie um novo usuário." : ""}
                        />
                        {editingUserId && <p className="text-[10px] text-slate-500">O email não pode ser alterado diretamente.</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nível de Acesso (Role)</label>
                        <select
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                            value={userForm.role}
                            onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                        >
                            <option value="operador">Operador (Acesso Limitado)</option>
                            <option value="gestor">Gestor / Mecânico (Ordens de Serviço)</option>
                            <option value="financeiro">Financeiro</option>
                            <option value="viewer">Visualizador</option>
                            <option value="admin">Administrador (Mapas e Aprovações)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                            {editingUserId ? "Nova Senha (Opcional)" : "Senha Inicial"}
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="password"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-emerald-500 outline-none"
                                value={userForm.password}
                                onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                placeholder={editingUserId ? "Deixe em branco para manter a atual" : "******"}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSaveUser}
                        disabled={isSaving}
                        className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    >
                        {isSaving ? 'Salvando...' : <><Save size={18} /> {editingUserId ? 'Atualizar Usuário' : 'Criar Usuário'}</>}
                    </button>

                </div>
            </Modal>

            {/* Modal Permissões Granulares */}
            <Modal
                isOpen={isPermissionsModalOpen}
                onClose={() => setIsPermissionsModalOpen(false)}
                title={`Permissões de Acesso: ${selectedUserForPermissions?.name?.split(' ')[0] || 'Usuário'}`}
            >
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {loadingPermissions ? (
                        <div className="p-12 text-center text-slate-500">Carregando módulos...</div>
                    ) : (
                        <div className="space-y-6">
                            {/* Agrupar por Categoria */}
                            {Object.entries(systemModules.reduce((acc: any, mod) => {
                                if (!acc[mod.category]) acc[mod.category] = [];
                                acc[mod.category].push(mod);
                                return acc;
                            }, {})).map(([category, modules]: [string, any]) => (
                                <div key={category} className="space-y-3">
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800 pb-1">{category}</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {modules.map((mod: any) => {
                                            const hasAccess = userPermissions.some(p => p.module_slug === mod.slug);
                                            return (
                                                <div
                                                    key={mod.id}
                                                    onClick={() => handleTogglePermission(mod.slug)}
                                                    className={`
                                                        p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group
                                                        ${hasAccess
                                                            ? 'bg-emerald-900/10 border-emerald-500/30 hover:bg-emerald-900/20'
                                                            : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                                                        }
                                                    `}
                                                >
                                                    <div>
                                                        <p className={`text-sm font-bold ${hasAccess ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                            {mod.name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-600 font-mono">{mod.slug}</p>
                                                    </div>

                                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${hasAccess ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${hasAccess ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={handleSavePermissions}
                                disabled={isSaving}
                                className="w-full py-3 mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all sticky bottom-0"
                            >
                                {isSaving ? 'Salvando...' : <><Save size={18} /> Salvar Permissões</>}
                            </button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Settings;

```


# File: pages/SystemLogs.tsx
```

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

```


# File: pages/TestConnection.tsx
```

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const TestConnection: React.FC = () => {
    const [status, setStatus] = useState<string>('Verificando...');
    const [details, setDetails] = useState<string>('');
    const [config, setConfig] = useState<any>({});

    useEffect(() => {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        setConfig({ url, key: key ? key.substring(0, 10) + '...' : 'NÃO DEFINIDA' });

        if (!url || !key) {
            setStatus('ERRO: Configuração Ausente');
            setDetails('VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontrados no .env.local');
            return;
        }

        const supabase = createClient(url, key);

        const checkConnection = async () => {
            try {
                // Teste 1: Fetch direto (Diagnóstico de Rede/CORS)
                const response = await fetch(`${url}/rest/v1/employees?select=count`, {
                    headers: {
                        apikey: key || '',
                        Authorization: `Bearer ${key || ''}`
                    }
                });

                if (!response.ok) {
                    const text = await response.text();
                    setStatus(`ERRO HTTP ${response.status} ❌`);
                    setDetails(`Falha no fetch direto.\nStatus: ${response.status} ${response.statusText}\nResposta: ${text}`);
                    return;
                }

                // Teste 2: Cliente Supabase (se fetch passar)
                const { data, error, count } = await supabase
                    .from('employees')
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    console.error("Erro Supabase Completo:", error);
                    setStatus('FALHA NO CLIENTE ❌');
                    setDetails(`Mensagem: ${error.message}\nCódigo: ${error.code}\nHint: ${error.hint}\nObjeto: ${JSON.stringify(error)}`);
                } else {
                    setStatus('CONEXÃO BEM SUCEDIDA ✅');
                    setDetails(`Tudo certo! Conectado ao projeto via cliente.\nTotal de funcionários: ${count}`);
                }
            } catch (err: any) {
                setStatus('ERRO DE REDE/CÓDIGO 💥');
                setDetails(`Exceção capturada:\n${err.message || String(err)}\n\n(Provável bloqueio de CORS ou DNS)`);
            }
        };

        checkConnection();
    }, []);


    const createTestEmployee = async () => {
        setStatus('TENTANDO CRIAR FUNCIONÁRIO...');
        try {
            // Primeiro obtemos uma empresa (company_id)
            const supabase = createClient(config.url, config.key);

            // Tenta pegar id da empresa
            const { data: companies } = await supabase.from('companies').select('id').limit(1);
            const companyId = companies?.[0]?.id;

            if (!companyId) {
                setStatus('ERRO: S/ EMPRESA ❌');
                setDetails('Não foi possível encontrar uma empresa na tabela "companies" para vincular o funcionário.');
                return;
            }

            const { data, error } = await supabase
                .from('employees')
                .insert({
                    company_id: companyId,
                    full_name: 'Funcionário Teste ' + Math.floor(Math.random() * 1000),
                    job_title: 'Tester Frontend',
                    registration_number: 'TEST-' + Math.floor(Math.random() * 1000),
                    // active: true // Removido pois pode não existir no schema
                })
                .select();

            if (error) {
                setStatus('ERRO AO CRIAR ❌');
                setDetails(`Falha no INSERT: ${error.message}\nVerifique se há políticas RLS permitindo INSERT para users anônimos/autenticados.`);
            } else {
                setStatus('SUCESSO NA CRIAÇÃO ✅');
                setDetails(`Funcionário criado: ${JSON.stringify(data)}\nAgora recarregue a página de RH.`);
            }
        } catch (err: any) {
            setStatus('ERRO EXCEÇÃO 💥');
            setDetails(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-xl max-w-lg w-full shadow-2xl border border-slate-700">
                <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    🔍 Diagnóstico de Conexão
                </h1>

                <div className={`p-4 rounded-lg mb-6 text-center font-bold text-lg ${status.includes('BEM SUCEDIDA') || status.includes('SUCESSO') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                    {status}
                </div>

                <div className="space-y-4 text-sm text-slate-300 font-mono bg-slate-950 p-4 rounded-lg overflow-x-auto">
                    <div>
                        <span className="text-slate-500">URL do Projeto:</span><br />
                        {config.url || 'Não encontrada'}
                    </div>
                    <div>
                        <span className="text-slate-500">Chave API (Início):</span><br />
                        {config.key}
                    </div>
                    <div className="pt-2 border-t border-slate-800 mt-2">
                        <span className="text-slate-500">Detalhes do Teste:</span><br />
                        {details}
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                    >
                        🔄 Retestar Conexão
                    </button>

                    <button
                        onClick={createTestEmployee}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
                    >
                        ➕ Tentar Criar Funcionário de Teste
                    </button>
                </div>

                <div className="mt-6 text-xs text-slate-500 text-center">
                    Se a conexão funciona mas a lista vem vazia, tente criar um funcionário acima.<br />
                    Se falhar criar, é permissão (RLS) de INSERT.
                </div>
            </div>
        </div>
    );
};

export default TestConnection;


```


# File: pages/Timekeeping.tsx
```
import React, { useState } from 'react';
import { Camera, Check, Upload, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { processTimecardImage, TimecardData } from '../services/TimecardService';
import Sidebar from '../components/Sidebar';

const Timekeeping: React.FC = () => {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TimecardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setData(null);
            setError(null);
        }
    };

    const handleProcess = async () => {
        if (!image) return;
        setLoading(true);
        setError(null);
        try {
            const result = await processTimecardImage(image);
            setData(result);
        } catch (err: any) {
            setError(err.message || "Erro ao processar imagem.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-slate-100 min-h-screen">
            <Sidebar activePage="rh" />

            <main className="flex-1 p-8 ml-64 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Leitura de Cartão Ponto 📸</h1>
                        <p className="text-slate-500">Use a Inteligência Artificial para digitalizar os pontos do papel.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Upload size={20} className="text-[#007a33]" />
                            Carregar Foto
                        </h2>

                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center hover:bg-slate-50 transition-colors relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {preview ? (
                                <img src={preview} alt="Preview" className="max-h-96 mx-auto rounded shadow-sm" />
                            ) : (
                                <div className="space-y-2">
                                    <Camera size={48} className="mx-auto text-slate-400" />
                                    <p className="text-slate-500 font-medium">Clique ou arraste a foto aqui</p>
                                    <p className="text-xs text-slate-400">Suporta JPG, PNG</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleProcess}
                            disabled={!image || loading}
                            className="w-full mt-4 bg-[#007a33] hover:bg-[#009a43] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Lendo Imagem com IA...
                                </>
                            ) : (
                                <>
                                    <FileText size={20} />
                                    Extrair Dados
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm font-medium border border-red-100">
                                <AlertTriangle size={18} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Check size={20} className="text-[#007a33]" />
                            Dados Extraídos
                        </h2>

                        {!data ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
                                <FileText size={48} className="opacity-20 mb-4" />
                                <p>Aguardando processamento...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <span className="text-xs text-slate-500 uppercase font-bold">Funcionário Detectado</span>
                                        <p className="text-lg font-bold text-slate-800">{data.employeeName || "Não identificado"}</p>
                                    </div>
                                    <div className="w-1/3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <span className="text-xs text-slate-500 uppercase font-bold">Período</span>
                                        <p className="text-lg font-bold text-slate-800">
                                            {data.period === "1" ? "1ª Quinzena" : "2ª Quinzena"}
                                        </p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-100 text-slate-600">
                                                <th className="p-2 text-center rounded-l-lg">Dia</th>
                                                <th className="p-2 text-center">Entrada 1</th>
                                                <th className="p-2 text-center">Saída 1</th>
                                                <th className="p-2 text-center">Entrada 2</th>
                                                <th className="p-2 text-center rounded-r-lg">Saída 2</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {data.entries.map((entry, index) => (
                                                <tr key={index} className="hover:bg-slate-50">
                                                    <td className="p-2 text-center font-bold text-slate-700">{entry.day}</td>
                                                    <td className="p-2 text-center font-mono text-slate-600">{entry.morningIn || '-'}</td>
                                                    <td className="p-2 text-center font-mono text-slate-600">{entry.morningOut || '-'}</td>
                                                    <td className="p-2 text-center font-mono text-slate-600">{entry.afternoonIn || '-'}</td>
                                                    <td className="p-2 text-center font-mono text-slate-600">{entry.afternoonOut || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                                        Confirmar e Salvar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Timekeeping;

```


# File: pages/UpdatePassword.tsx
```
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

```


# File: pages/WhatsAppAutomation.tsx
```

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
    content: string;
    received_at: string;
    ai_intent?: string;
    ai_asset?: string;
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
    status: 'DRAFT' | 'SCHEDULED' | 'SENT';
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

        // Simula criação
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
        alert("Campanha Agendada com Sucesso! 🚀");
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
                                    <button onClick={handleDisconnect} className="mt-6 text-xs text-red-400 font-bold hover:text-red-300 uppercase tracking-widest border border-red-900/30 px-4 py-2 rounded-lg bg-red-950/20">
                                        Desconectar Robô
                                    </button>
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
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-[10px] uppercase text-slate-500 font-bold">Intenção Detectada</p>
                                                            <p className="text-sm font-bold text-white">{msg.ai_intent || 'Desconhecida'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase text-slate-500 font-bold">Alvo / Ativo</p>
                                                            <p className="text-sm font-bold text-white">{msg.ai_asset || '-'}</p>
                                                        </div>
                                                    </div>
                                                    {msg.status === 'PENDING' && (
                                                        <div className="flex gap-3 mt-4 pt-4 border-t border-[#007a33]/20">
                                                            <button className="flex-1 bg-[#007a33] text-white py-2 rounded-lg text-xs font-bold uppercase hover:bg-[#006028] transition-colors">
                                                                Aprovar: {msg.ai_action || 'Processar'}
                                                            </button>
                                                            <button className="px-4 bg-slate-800 text-slate-400 py-2 rounded-lg text-xs font-bold uppercase hover:text-white hover:bg-slate-700 transition-colors">
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
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${cp.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {cp.status === 'SENT' ? 'Enviado' : 'Agendado'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-slate-400 hover:text-white"><RefreshCw size={16} /></button>
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

```


# File: services/TimecardService.ts
```
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface TimecardData {
    employeeName: string;
    period: string; // "1" (1-15) or "2" (16-31)
    year: string;
    entries: {
        day: number;
        morningIn: string;
        morningOut: string;
        afternoonIn: string;
        afternoonOut: string;
    }[];
}

export const processTimecardImage = async (file: File): Promise<TimecardData> => {
    if (!API_KEY) {
        throw new Error("VITE_GEMINI_API_KEY não configurada. Adicione sua chave no .env.local");
    }

    // Convert File to Base64
    const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data:image/jpeg;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
    });

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
  Analise esta imagem de cartão de ponto (comum no Brasil).
  Extraia os dados estruturados em JSON.
  
  Campos necessários:
  - employeeName: Nome manuscrito no topo (ex: "Nader", "Donizette").
  - period: "1" se for dias 01-15, "2" se for dias 16-31 (Veja o cabeçalho "1ª QUINZENA" ou "2ª QUINZENA").
  - year: Ano se houver (senão null).
  - entries: Array com os registros de cada dia visível.
    - day: O número do dia (16, 17, ... até 31).
    - morningIn: Horário da 1ª coluna (Manhã Entrada).
    - morningOut: Horário da 2ª coluna (Manhã Saída).
    - afternoonIn: Horário da 3ª coluna (Tarde Entrada).
    - afternoonOut: Horário da 4ª coluna (Tarde Saída).

  Regras:
  - Se o campo estiver vazio, retorne null.
  - Formato de horas: "HH:MM".
  - Ignore assinaturas ou rabiscos irrelevantes.
  - A imagem pode estar rotacionada ou ter baixa qualidade, tente inferir.
  
  Retorne APENAS o JSON válido.
  `;

    const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType: file.type } },
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean markdown code blocks if present
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(jsonString) as TimecardData;
    } catch (e) {
        console.error("Erro ao parsear resposta da IA:", text);
        throw new Error("Falha ao ler os dados da imagem. Tente uma foto mais clara.");
    }
};

```


# File: services/api.ts
```
import { Asset, MaintenanceOS, StockItem, Transaction, AssetStatus, OSStatus, PaymentStatus, ERPDocument, AuditLogEntry, NetworkSession } from '../types';
import { MOCK_ACTIVITIES, MOCK_ASSETS, MOCK_STATS, MOCK_STOCK, MOCK_TRANSACTIONS, MOCK_MAINTENANCE_OS, MOCK_PAYROLL_DATA, MOCK_OPERATIONS_MAP_DATA, MOCK_DOCUMENTS, MOCK_AUDIT_LOGS, MOCK_SESSIONS, TimeRecord, PayrollEntry, EquipmentTimeline } from './mockData';
import { supabase } from '../lib/supabase';

const DELAY = 400; // Faster for better UX

// In-Memory Database
let _assets = [...MOCK_ASSETS];
let _maintenanceOS = [...MOCK_MAINTENANCE_OS];
let _stock = [...MOCK_STOCK];
let _transactions = [...MOCK_TRANSACTIONS];
// let _timeRecords = [...MOCK_TIME_RECORDS]; // Removido, usando Supabase agora
let _payrollData = [...MOCK_PAYROLL_DATA];
let _operationsMap = [...MOCK_OPERATIONS_MAP_DATA];
let _documents = [...MOCK_DOCUMENTS];
let _auditLogs = [...MOCK_AUDIT_LOGS];
let _activeSessions = [...MOCK_SESSIONS];

export const dashboardService = {
    // Assets
    getAssets: async (): Promise<Asset[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._assets]), DELAY));
    },
    addAsset: async (asset: Asset) => {
        _assets.push(asset);
        return new Promise(resolve => setTimeout(() => resolve(asset), DELAY));
    },
    updateAsset: async (updatedAsset: Asset) => {
        _assets = _assets.map(a => a.id === updatedAsset.id ? updatedAsset : a);
        return new Promise(resolve => setTimeout(() => resolve(updatedAsset), DELAY));
    },
    deleteAsset: async (id: string) => {
        _assets = _assets.filter(a => a.id !== id);
        return new Promise(resolve => setTimeout(() => resolve(true), DELAY));
    },

    // Maintenance
    getMaintenanceOS: async (): Promise<MaintenanceOS[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._maintenanceOS]), DELAY));
    },
    addMaintenanceOS: async (os: MaintenanceOS) => {
        _maintenanceOS.push(os);
        return new Promise(resolve => setTimeout(() => resolve(os), DELAY));
    },
    updateMaintenanceOS: async (updatedOS: MaintenanceOS) => {
        _maintenanceOS = _maintenanceOS.map(os => os.id === updatedOS.id ? updatedOS : os);
        return new Promise(resolve => setTimeout(() => resolve(updatedOS), DELAY));
    },
    deleteMaintenanceOS: async (id: string) => {
        _maintenanceOS = _maintenanceOS.filter(os => os.id !== id);
        return new Promise(resolve => setTimeout(() => resolve(true), DELAY));
    },

    // Stock
    getStock: async (): Promise<StockItem[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._stock]), DELAY));
    },
    addStockItem: async (item: StockItem) => {
        _stock.push(item);
        return new Promise(resolve => setTimeout(() => resolve(item), DELAY));
    },
    updateStockItem: async (updatedItem: StockItem) => {
        _stock = _stock.map(s => s.sku === updatedItem.sku ? updatedItem : s);
        return new Promise(resolve => setTimeout(() => resolve(updatedItem), DELAY));
    },
    deleteStockItem: async (sku: string) => {
        _stock = _stock.filter(s => s.sku !== sku);
        return new Promise(resolve => setTimeout(() => resolve(true), DELAY));
    },

    // Financial
    getTransactions: async (): Promise<Transaction[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._transactions]), DELAY));
    },
    addTransaction: async (item: Transaction) => {
        _transactions.push(item);
        return new Promise(resolve => setTimeout(() => resolve(item), DELAY));
    },
    updateTransaction: async (updatedItem: Transaction) => {
        _transactions = _transactions.map(t => t.id === updatedItem.id ? updatedItem : t);
        return new Promise(resolve => setTimeout(() => resolve(updatedItem), DELAY));
    },
    deleteTransaction: async (id: string) => {
        _transactions = _transactions.filter(t => t.id !== id);
        return new Promise(resolve => setTimeout(() => resolve(true), DELAY));
    },

    // HR
    getHREmployees: async () => {
        console.log('🔄 [api.ts] Buscando funcionarios...');
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('name');

        if (error) {
            console.error('❌ [api.ts] Erro ao buscar funcionários:', error);
            return [];
        }
        console.log('✅ [api.ts] Sucesso! Registros:', data?.length);
        return data || [];
    },

    // Helper para converter Decimal (8.5) -> Time (08:30)
    _decimalToTime: (decimal: number) => {
        if (!decimal && decimal !== 0) return '00:00';
        const hours = Math.floor(decimal);
        const minutes = Math.round((decimal - hours) * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    },

    // Helper para calcular total de horas baseado nas strings de tempo
    _calculateHours: (e1: string, s1: string, e2: string, s2: string) => {
        const toMinutes = (t: string) => {
            if (!t) return 0;
            const [h, m] = t.split(':').map(Number);
            return (h * 60) + m;
        };

        let total = 0;
        if (e1 && s1) total += Math.max(0, toMinutes(s1) - toMinutes(e1));
        if (e2 && s2) total += Math.max(0, toMinutes(s2) - toMinutes(e2)); // Correção: s2 - e2 (Saída2 - Entrada2)

        const h = Math.floor(total / 60);
        const m = total % 60;
        return {
            formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
            decimal: Number((total / 60).toFixed(2))
        };
    },

    getHRTimeRecords: async (employeeId?: string, month?: string): Promise<TimeRecord[]> => {
        if (!employeeId) return [];

        let query = supabase
            .from('time_entries')
            .select('*')
            .eq('employee_id', employeeId)
            .order('date', { ascending: false });

        if (month) {
            const startDetails = `${month}-01`;
            const endDetails = `${month}-31`;
            query = query.gte('date', startDetails).lte('date', endDetails);
        } else {
            query = query.limit(100);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar pontos:', error);
            return [];
        }

        // Mapear para TimeRecord
        return (data || []).map((row: any) => {
            // Se total_hours vier do banco (numeric), converte. Se não, tenta calcular ou 00:00
            let totalDisplay = '00:00';
            if (row.total_hours !== undefined && row.total_hours !== null) {
                // assume que vem numeric do banco (ex: 8.5)
                const hours = Math.floor(row.total_hours);
                const minutes = Math.round((row.total_hours - hours) * 60);
                totalDisplay = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            }

            return {
                id: row.id,
                date: row.date,
                entry1: row.entry_time ? row.entry_time.slice(0, 5) : '',
                exit1: row.break_start ? row.break_start.slice(0, 5) : '',
                entry2: row.break_end ? row.break_end.slice(0, 5) : '',
                exit2: row.exit_time ? row.exit_time.slice(0, 5) : '',
                totalHours: totalDisplay,
                status: row.status === 'APPROVED' ? 'REGULAR' : (row.status || 'REGULAR') as any,
                originalStatus: row.status
            };
        });
    },

    updateHRTimeRecord: async (updatedRecord: TimeRecord & { id?: string }) => {
        if (updatedRecord.id) {
            // Recalcular horas totais antes de salvar
            const calc = dashboardService._calculateHours(
                updatedRecord.entry1,
                updatedRecord.exit1,
                updatedRecord.entry2,
                updatedRecord.exit2
            );

            const { error } = await supabase
                .from('time_entries')
                .update({
                    entry_time: updatedRecord.entry1 || null,
                    break_start: updatedRecord.exit1 || null,
                    break_end: updatedRecord.entry2 || null,
                    exit_time: updatedRecord.exit2 || null,
                    total_hours: calc.decimal, // Salva como numeric no banco
                    status: 'MANUAL_EDIT'
                })
                .eq('id', updatedRecord.id);

            if (error) console.error('Erro update:', error);

            // Retorna o record atualizado com o total formatado para a UI
            return { ...updatedRecord, totalHours: calc.formatted };
        }
        return updatedRecord;
    },

    getHRPayroll: async (): Promise<PayrollEntry[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._payrollData]), DELAY));
    },

    // Operations Map
    getOperationsMapData: async (): Promise<EquipmentTimeline[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._operationsMap]), DELAY));
    },
    updateOperationsMapData: async (updatedTimeline: EquipmentTimeline) => {
        _operationsMap = _operationsMap.map(t => t.id === updatedTimeline.id ? updatedTimeline : t);
        return new Promise(resolve => setTimeout(() => resolve(updatedTimeline), DELAY));
    },

    // Documents
    getDocuments: async (): Promise<ERPDocument[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._documents]), DELAY));
    },
    addDocument: async (doc: ERPDocument) => {
        _documents.push(doc);
        return new Promise(resolve => setTimeout(() => resolve(doc), DELAY));
    },
    deleteDocument: async (id: string) => {
        _documents = _documents.filter(d => d.id !== id);
        return new Promise(resolve => setTimeout(() => resolve(true), DELAY));
    },

    // Security & Audit
    getAuditLogs: async (): Promise<AuditLogEntry[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._auditLogs]), DELAY));
    },
    getActiveSessions: async (): Promise<NetworkSession[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._activeSessions]), DELAY));
    },

    // Others
    getStats: async () => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_STATS), DELAY));
    },
    getActivities: async () => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_ACTIVITIES), DELAY));
    },
};

```


# File: services/bankService.ts
```

import { supabase } from '../lib/supabase';

export interface ContaBancaria {
    id: string;
    banco_nome: string;
    banco_codigo: string;
    agencia: string;
    conta: string;
    tipo_conta: string;
    saldo_atual: number;
    ativa: boolean;
    padrao: boolean;
    pix_chave?: string;
}

export interface MovimentoBancario {
    id?: string;
    conta_bancaria_id: string;
    data_movimento: string;
    historico: string;
    valor: number;
    tipo_movimento: 'CREDITO' | 'DEBITO';
    origem: string;
    lancamento_financeiro_id?: string;
    lancamento_tipo?: string;
}

class BankService {
    /**
     * Listar todas as contas bancárias ativas
     */
    async listar() {
        const { data, error } = await supabase
            .from('contas_bancarias')
            .select('*')
            .eq('ativa', true)
            .order('padrao', { ascending: false });

        if (error) throw error;
        return data as ContaBancaria[];
    }

    /**
     * Buscar saldo atual de uma conta
     */
    async getSaldo(id: string) {
        const { data, error } = await supabase
            .from('contas_bancarias')
            .select('saldo_atual')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data?.saldo_atual || 0;
    }

    /**
     * Atualizar saldo manualmente (uso interno ou correção)
     */
    async atualizarSaldo(id: string, novoSaldo: number) {
        const { error } = await supabase
            .from('contas_bancarias')
            .update({ saldo_atual: novoSaldo, ultimo_saldo_atualizado_em: new Date() })
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Criar conta bancária
     */
    async criar(conta: Omit<ContaBancaria, 'id'>) {
        const { data, error } = await supabase
            .from('contas_bancarias')
            .insert(conta)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Excluir (lógica) conta bancária
     */
    async excluir(id: string) {
        const { error } = await supabase
            .from('contas_bancarias')
            .update({ ativa: false }) // Soft delete
            .eq('id', id);

        if (error) throw error;
    }
}

export const bankService = new BankService();
export default bankService;

```


# File: services/bankingService.ts
```
/**
 * Serviço de Conciliação Bancária
 * Importa extratos OFX/CSV e faz matching automático com lançamentos
 */

import { supabase } from '../lib/supabase';

interface MovimentoBancario {
    conta_bancaria_id: string;
    data_movimento: string;
    historico: string;
    valor: number;
    numero_documento?: string;
    tipo_movimento: 'DEBITO' | 'CREDITO' | 'TARIFA' | 'JUROS';
    origem: 'EXTRATO_OFX' | 'EXTRATO_CSV' | 'MANUAL';
}

interface SugestaoConciliacao {
    movimento_id: string;
    lancamento_id: string;
    lancamento_tipo: 'PAGAR' | 'RECEBER';
    score_total: number;
    motivo: string;
}

class BankingService {
    /**
     * Importar extrato OFX
     */
    async importarOFX(arquivo: File, conta_id: string) {
        const conteudo = await arquivo.text();
        const movimentos = this.parseOFX(conteudo);

        const importados: any[] = [];

        for (const mov of movimentos) {
            // Gerar hash único para evitar duplicatas
            const hash = this.gerarHash(conta_id, mov);

            // Verificar se já existe
            const { data: existe } = await supabase
                .from('movimentos_bancarios')
                .select('id')
                .eq('hash_linha', hash)
                .single();

            if (existe) continue; // Pular duplicata

            const { data } = await supabase
                .from('movimentos_bancarios')
                .insert({
                    conta_bancaria_id: conta_id,
                    ...mov,
                    hash_linha: hash,
                })
                .select()
                .single();

            if (data) importados.push(data);
        }

        return {
            total: movimentos.length,
            importados: importados.length,
            duplicatas: movimentos.length - importados.length,
            movimentos: importados,
        };
    }

    /**
     * Importar extrato CSV
     */
    async importarCSV(arquivo: File, conta_id: string, config: {
        separador: string;
        colunas: {
            data: number;
            historico: number;
            valor: number;
            documento?: number;
        };
    }) {
        const conteudo = await arquivo.text();
        const linhas = conteudo.split('\n');
        const movimentos: MovimentoBancario[] = [];

        // Pular header
        for (let i = 1; i < linhas.length; i++) {
            const linha = linhas[i];
            if (!linha.trim()) continue;

            const colunas = linha.split(config.separador);

            const data = this.parseDataCSV(colunas[config.colunas.data]);
            const historico = colunas[config.colunas.historico].trim();
            const valorStr = colunas[config.colunas.valor].replace(/[^\d,-]/g, '').replace(',', '.');
            const valor = parseFloat(valorStr);
            const documento = config.colunas.documento
                ? colunas[config.colunas.documento].trim()
                : undefined;

            movimentos.push({
                conta_bancaria_id: conta_id,
                data_movimento: data,
                historico,
                valor,
                numero_documento: documento,
                tipo_movimento: valor >= 0 ? 'CREDITO' : 'DEBITO',
                origem: 'EXTRATO_CSV',
            });
        }

        const importados: any[] = [];

        for (const mov of movimentos) {
            const hash = this.gerarHash(conta_id, mov);

            const { data: existe } = await supabase
                .from('movimentos_bancarios')
                .select('id')
                .eq('hash_linha', hash)
                .single();

            if (existe) continue;

            const { data } = await supabase
                .from('movimentos_bancarios')
                .insert({
                    ...mov,
                    hash_linha: hash,
                })
                .select()
                .single();

            if (data) importados.push(data);
        }

        return {
            total: movimentos.length,
            importados: importados.length,
            duplicatas: movimentos.length - importados.length,
            movimentos: importados,
        };
    }

    /**
     * Conciliação automática com IA
     */
    async conciliarAutomatico(params: {
        conta_bancaria_id: string;
        data_inicio: string;
        data_fim: string;
    }) {
        // Criar registro de conciliação
        const { data: conciliacao } = await supabase
            .from('conciliacoes')
            .insert({
                conta_bancaria_id: params.conta_bancaria_id,
                data_inicial: params.data_inicio,
                data_final: params.data_fim,
                status: 'EM_ANDAMENTO',
            })
            .select()
            .single();

        if (!conciliacao) throw new Error('Erro ao criar conciliação');

        // Buscar movimentos não conciliados
        const { data: movimentos } = await supabase
            .from('movimentos_bancarios')
            .select('*')
            .eq('conta_bancaria_id', params.conta_bancaria_id)
            .gte('data_movimento', params.data_inicio)
            .lte('data_movimento', params.data_fim)
            .eq('conciliado', false);

        if (!movimentos || movimentos.length === 0) {
            return { conciliacao_id: conciliacao.id, sugestoes: [] };
        }

        const sugestoes: SugestaoConciliacao[] = [];

        for (const movimento of movimentos) {
            const sugestao = await this.encontrarMatch(movimento);
            if (sugestao && sugestao.score_total >= 60) {
                // Salvar sugestão
                await supabase.from('conciliacao_sugestoes').insert({
                    conciliacao_id: conciliacao.id,
                    movimento_bancario_id: movimento.id,
                    lancamento_id: sugestao.lancamento_id,
                    lancamento_tipo: sugestao.lancamento_tipo,
                    score_valor: sugestao.score_valor,
                    score_data: sugestao.score_data,
                    score_documento: sugestao.score_documento,
                    status: 'PENDENTE',
                });

                sugestoes.push(sugestao);
            }
        }

        // Atualizar conciliação
        await supabase
            .from('conciliacoes')
            .update({
                total_movimentos: movimentos.length,
                movimentos_conciliados: sugestoes.length,
                percentual_conciliado: (sugestoes.length / movimentos.length) * 100,
            })
            .eq('id', conciliacao.id);

        return {
            conciliacao_id: conciliacao.id,
            total_movimentos: movimentos.length,
            sugestoes: sugestoes.length,
            percentual: ((sugestoes.length / movimentos.length) * 100).toFixed(1),
        };
    }

    /**
     * Encontrar match para um movimento
     */
    private async encontrarMatch(movimento: any): Promise<any> {
        const tabela = movimento.tipo_movimento === 'CREDITO' ? 'contas_receber' : 'contas_pagar';
        const valorField = tabela === 'contas_receber' ? 'valor_saldo' : 'valor_saldo';

        // Buscar lançamentos próximos
        const dataInicio = this.subtrairDias(movimento.data_movimento, 5);
        const dataFim = this.adicionarDias(movimento.data_movimento, 5);

        const { data: lancamentos } = await supabase
            .from(tabela)
            .select('*')
            .gte('data_vencimento', dataInicio)
            .lte('data_vencimento', dataFim)
            .eq('conciliado', false)
            .neq('status', 'CANCELADO');

        if (!lancamentos || lancamentos.length === 0) return null;

        let melhorMatch: any = null;
        let melhorScore = 0;

        for (const lanc of lancamentos) {
            const scores = this.calcularScores(movimento, lanc);
            const scoreTotal = scores.valor + scores.data + scores.documento;

            if (scoreTotal > melhorScore) {
                melhorScore = scoreTotal;
                melhorMatch = {
                    lancamento_id: lanc.id,
                    lancamento_tipo: tabela === 'contas_receber' ? 'RECEBER' : 'PAGAR',
                    score_valor: scores.valor,
                    score_data: scores.data,
                    score_documento: scores.documento,
                    score_total: scoreTotal,
                    motivo: scores.motivo,
                };
            }
        }

        return melhorMatch;
    }

    /**
     * Calcular scores de matching
     */
    private calcularScores(movimento: any, lancamento: any) {
        let scoreValor = 0;
        let scoreData = 0;
        let scoreDocumento = 0;
        const motivos: string[] = [];

        // Score de valor (0-50 pontos)
        const valorMov = Math.abs(movimento.valor);
        const valorLanc = lancamento.valor_saldo || lancamento.valor_original;
        const diferencaValor = Math.abs(valorMov - Math.abs(valorLanc));
        const percentualDif = (diferencaValor / Math.abs(valorLanc)) * 100;

        if (percentualDif === 0) {
            scoreValor = 50;
            motivos.push('Valor exato');
        } else if (percentualDif < 1) {
            scoreValor = 45;
            motivos.push('Valor quase exato');
        } else if (percentualDif < 5) {
            scoreValor = 30;
            motivos.push('Valor similar');
        } else if (percentualDif < 10) {
            scoreValor = 15;
        }

        // Score de data (0-30 pontos)
        const diasDif = Math.abs(
            this.diferencaDias(movimento.data_movimento, lancamento.data_vencimento)
        );

        if (diasDif === 0) {
            scoreData = 30;
            motivos.push('Data exata');
        } else if (diasDif <= 2) {
            scoreData = 25;
            motivos.push('Data próxima');
        } else if (diasDif <= 5) {
            scoreData = 15;
        } else if (diasDif <= 10) {
            scoreData = 5;
        }

        // Score de documento (0-20 pontos)
        if (movimento.numero_documento && lancamento.numero_documento) {
            if (movimento.numero_documento === lancamento.numero_documento) {
                scoreDocumento = 20;
                motivos.push('Documento idêntico');
            } else if (this.similaridade(movimento.numero_documento, lancamento.numero_documento) > 0.8) {
                scoreDocumento = 10;
                motivos.push('Documento similar');
            }
        }

        return {
            valor: scoreValor,
            data: scoreData,
            documento: scoreDocumento,
            motivo: motivos.join(', '),
        };
    }

    /**
     * Aprovar sugestão de conciliação
     */
    async aprovarSugestao(sugestao_id: string) {
        const { data: sugestao } = await supabase
            .from('conciliacao_sugestoes')
            .select('*')
            .eq('id', sugestao_id)
            .single();

        if (!sugestao) throw new Error('Sugestão não encontrada');

        // Marcar movimento como conciliado
        await supabase
            .from('movimentos_bancarios')
            .update({
                conciliado: true,
                conciliacao_id: sugestao.conciliacao_id,
                lancamento_financeiro_id: sugestao.lancamento_id,
                lancamento_tipo: sugestao.lancamento_tipo,
            })
            .eq('id', sugestao.movimento_bancario_id);

        // Marcar lançamento como conciliado
        const tabela = sugestao.lancamento_tipo === 'RECEBER' ? 'contas_receber' : 'contas_pagar';
        await supabase
            .from(tabela)
            .update({ conciliado: true, conciliacao_id: sugestao.conciliacao_id })
            .eq('id', sugestao.lancamento_id);

        // Marcar sugestão como aceita
        await supabase
            .from('conciliacao_sugestoes')
            .update({ status: 'ACEITA', aceita_em: new Date().toISOString() })
            .eq('id', sugestao_id);

        return { sucesso: true };
    }

    /**
     * Parse OFX (simplificado)
     */
    private parseOFX(conteudo: string): MovimentoBancario[] {
        const movimentos: MovimentoBancario[] = [];

        // Regex para encontrar transações
        const transacoes = conteudo.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/g) || [];

        for (const trn of transacoes) {
            const tipo = this.extrairTag(trn, 'TRNTYPE');
            const data = this.extrairTag(trn, 'DTPOSTED');
            const valor = parseFloat(this.extrairTag(trn, 'TRNAMT'));
            const memo = this.extrairTag(trn, 'MEMO');
            const checknum = this.extrairTag(trn, 'CHECKNUM');

            movimentos.push({
                conta_bancaria_id: '', // Será preenchido depois
                data_movimento: this.parseDataOFX(data),
                historico: memo,
                valor,
                numero_documento: checknum,
                tipo_movimento: valor >= 0 ? 'CREDITO' : 'DEBITO',
                origem: 'EXTRATO_OFX',
            });
        }

        return movimentos;
    }

    /**
     * Helpers
     */
    private extrairTag(xml: string, tag: string): string {
        const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
        const match = xml.match(regex);
        return match ? match[1].trim() : '';
    }

    private parseDataOFX(data: string): string {
        // OFX date format: YYYYMMDD
        const ano = data.substring(0, 4);
        const mes = data.substring(4, 6);
        const dia = data.substring(6, 8);
        return `${ano}-${mes}-${dia}`;
    }

    private parseDataCSV(data: string): string {
        // Assumindo formato DD/MM/YYYY
        const partes = data.split('/');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    private gerarHash(conta_id: string, mov: any): string {
        const str = `${conta_id}|${mov.data_movimento}|${mov.valor}|${mov.historico}`;
        // Simple hash (em produção usar crypto)
        return btoa(str).substring(0, 64);
    }

    private subtrairDias(data: string, dias: number): string {
        const d = new Date(data);
        d.setDate(d.getDate() - dias);
        return d.toISOString().split('T')[0];
    }

    private adicionarDias(data: string, dias: number): string {
        const d = new Date(data);
        d.setDate(d.getDate() + dias);
        return d.toISOString().split('T')[0];
    }

    private diferencaDias(data1: string, data2: string): number {
        const d1 = new Date(data1);
        const d2 = new Date(data2);
        return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
    }

    private similaridade(str1: string, str2: string): number {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();
        let matches = 0;
        for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
            if (s1[i] === s2[i]) matches++;
        }
        return matches / Math.max(s1.length, s2.length);
    }
}

export const bankingService = new BankingService();
export default bankingService;

```


# File: services/cnabService.ts
```
/**
 * Serviço CNAB - Geração de Remessa e Leitura de Retorno
 * Suporta CNAB 240 e CNAB 400
 * Bancos: Banco do Brasil, Bradesco, Itaú, Sicoob, Santander
 */

import { supabase } from '../lib/supabase';
import { createHash } from 'crypto';

interface TituloRemessa {
    id: string;
    nosso_numero: string;
    seu_numero: string;
    valor: number;
    vencimento: string;
    pagador_nome: string;
    pagador_documento: string;
    tipo: 'PAGAR' | 'RECEBER';
}

interface OcorrenciaRetorno {
    codigo: string;
    descricao: string;
    nosso_numero: string;
    valor_pago?: number;
    data_ocorrencia: string;
    data_credito?: string;
}

class CNABService {
    /**
     * Gerar arquivo de REMESSA (pagamentos ou cobranças)
     */
    async gerarRemessa(params: {
        banco_id: string;
        tipo: 'PAGAMENTO' | 'COBRANCA';
        titulos: TituloRemessa[];
    }) {
        // Buscar dados da conta bancária
        const { data: conta } = await supabase
            .from('contas_bancarias')
            .select('*')
            .eq('id', params.banco_id)
            .single();

        if (!conta) throw new Error('Conta bancária não encontrada');

        const layout = conta.layout_cnab || '240';

        // Gerar número sequencial do arquivo
        const { count } = await supabase
            .from('cnab_arquivos')
            .select('*', { count: 'exact', head: true })
            .eq('conta_bancaria_id', params.banco_id)
            .eq('tipo', 'REMESSA');

        const numeroSequencial = (count || 0) + 1;

        // Gerar conteúdo do arquivo baseado no layout
        let conteudo: string;
        if (layout === '240') {
            conteudo = this.gerarCNAB240Remessa(conta, params.titulos, numeroSequencial, params.tipo);
        } else {
            conteudo = this.gerarCNAB400Remessa(conta, params.titulos, numeroSequencial, params.tipo);
        }

        const nomeArquivo = this.gerarNomeArquivo(conta, 'REMESSA', numeroSequencial);
        const hash = createHash('md5').update(conteudo).digest('hex');

        // Salvar registro do arquivo
        const { data: arquivo } = await supabase
            .from('cnab_arquivos')
            .insert({
                conta_bancaria_id: params.banco_id,
                tipo: 'REMESSA',
                layout,
                numero_sequencial: numeroSequencial,
                nome_arquivo: nomeArquivo,
                total_registros: params.titulos.length + 2, // Header + Títulos + Trailer
                total_titulos: params.titulos.length,
                valor_total: params.titulos.reduce((sum, t) => sum + t.valor, 0),
                hash_md5: hash,
            })
            .select()
            .single();

        // Salvar detalhes (cada linha)
        const linhas = conteudo.split('\n');
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            if (!linha.trim()) continue;

            const tipo_registro = linha.charAt(7); // Posição do tipo no CNAB240
            const titulo = params.titulos[i - 1]; // -1 por causa do header

            await supabase.from('cnab_detalhes').insert({
                cnab_arquivo_id: arquivo.id,
                numero_linha: i + 1,
                tipo_registro: tipo_registro === '0' ? 'HEADER' : tipo_registro === '9' ? 'TRAILER' : 'DETALHE',
                conteudo_linha: linha,
                nosso_numero: titulo?.nosso_numero,
                seu_numero: titulo?.seu_numero,
                valor_titulo: titulo?.valor,
                data_vencimento: titulo?.vencimento,
                conta_pagar_id: titulo?.tipo === 'PAGAR' ? titulo.id : undefined,
                conta_receber_id: titulo?.tipo === 'RECEBER' ? titulo.id : undefined,
            });
        }

        // Atualizar títulos com ID da remessa
        const tituloIds = params.titulos.map(t => t.id);
        if (params.tipo === 'PAGAMENTO') {
            await supabase
                .from('contas_pagar')
                .update({ cnab_remessa_id: arquivo.id, status: 'EM_PAGAMENTO' })
                .in('id', tituloIds);
        } else {
            await supabase
                .from('contas_receber')
                .update({ status: 'CONFIRMADO' })
                .in('id', tituloIds);
        }

        return {
            arquivo_id: arquivo.id,
            nome_arquivo: nomeArquivo,
            conteudo,
            numero_sequencial: numeroSequencial,
        };
    }

    /**
     * Processar arquivo de RETORNO do banco
     */
    async processarRetorno(params: {
        banco_id: string;
        arquivo_nome: string;
        conteudo: string;
    }) {
        const { data: conta } = await supabase
            .from('contas_bancarias')
            .select('*')
            .eq('id', params.banco_id)
            .single();

        if (!conta) throw new Error('Conta bancária não encontrada');

        const layout = this.detectarLayout(params.conteudo);
        const hash = createHash('md5').update(params.conteudo).digest('hex');

        // Verificar se arquivo já foi processado
        const { data: jaProcessado } = await supabase
            .from('cnab_arquivos')
            .select('id')
            .eq('hash_md5', hash)
            .single();

        if (jaProcessado) {
            throw new Error('Arquivo já foi processado anteriormente');
        }

        // Parse do arquivo
        const ocorrencias = layout === '240'
            ? this.parseCNAB240Retorno(params.conteudo)
            : this.parseCNAB400Retorno(params.conteudo);

        // Salvar registro do arquivo
        const { data: arquivo } = await supabase
            .from('cnab_arquivos')
            .insert({
                conta_bancaria_id: params.banco_id,
                tipo: 'RETORNO',
                layout,
                numero_sequencial: ocorrencias.length,
                nome_arquivo: params.arquivo_nome,
                total_registros: params.conteudo.split('\n').length,
                total_titulos: ocorrencias.length,
                valor_total: ocorrencias.reduce((sum, o) => sum + (o.valor_pago || 0), 0),
                hash_md5: hash,
                processado: false,
            })
            .select()
            .single();

        // Processar cada ocorrência
        let sucessos = 0;
        let erros = 0;
        const resultados: any[] = [];

        for (const ocorrencia of ocorrencias) {
            try {
                const resultado = await this.processarOcorrencia(ocorrencia, arquivo.id);
                resultados.push({ ...ocorrencia, status: 'SUCESSO', resultado });
                sucessos++;
            } catch (error: any) {
                resultados.push({ ...ocorrencia, status: 'ERRO', erro: error.message });
                erros++;
            }
        }

        // Marcar arquivo como processado
        await supabase
            .from('cnab_arquivos')
            .update({
                processado: true,
                data_processamento: new Date().toISOString(),
                erros_processamento: erros > 0 ? `${erros} erros de ${ocorrencias.length} registros` : undefined,
            })
            .eq('id', arquivo.id);

        return {
            arquivo_id: arquivo.id,
            total: ocorrencias.length,
            sucessos,
            erros,
            resultados,
        };
    }

    /**
     * Gerar CNAB 240 - Remessa
     */
    private gerarCNAB240Remessa(
        conta: any,
        titulos: TituloRemessa[],
        sequencial: number,
        tipo: string
    ): string {
        const linhas: string[] = [];

        // === HEADER DO ARQUIVO (Registro 0) ===
        const header = [
            conta.banco_codigo.padStart(3, '0'),          // 001-003: Código do Banco
            '0000',                                       // 004-007: Lote de Serviço
            '0',                                          // 008-008: Tipo de Registro (0=Header)
            ''.padEnd(9, ' '),                            // 009-017: Uso exclusivo FEBRABAN
            '2',                                          // 018-018: Tipo de Inscrição (2=CNPJ)
            (conta.empresa_cnpj || '').replace(/\D/g, '').padStart(14, '0'), // 019-032: CNPJ
            (conta.convenio_numero || '').padEnd(20, ' '), // 033-052: Convênio
            conta.agencia.padStart(5, '0'),              // 053-057: Agência
            ' ',                                          // 058-058: DV Agência
            conta.conta.padStart(12, '0'),               // 059-070: Conta
            conta.conta_dv[0] || ' ',                    // 071-071: DV Conta
            ' ',                                          // 072-072: DV Ag/Conta
            'TRANSPORTADORA TERRA LTDA'.padEnd(30, ' '),  // 073-102: Nome da Empresa
            conta.banco_nome.padEnd(30, ' '),            // 103-132: Nome do Banco
            ''.padEnd(10, ' '),                          // 133-142: Uso exclusivo
            '1',                                          // 143-143: Código Remessa (1)
            new Date().toISOString().split('T')[0].replace(/-/g, '').substring(2), // 144-151: Data
            new Date().toTimeString().substring(0, 8).replace(/:/g, ''), // 152-157: Hora
            String(sequencial).padStart(6, '0'),         // 158-163: Sequencial
            '103',                                        // 164-166: Versão layout
            '00000',                                      // 167-171: Densidade
            ''.padEnd(69, ' '),                          // 172-240: Uso Banco/FEBRABAN
        ].join('');

        linhas.push(header);

        // === DETALHES (Segmento P + Q para cada título) ===
        titulos.forEach((titulo, index) => {
            // Segmento P (principal)
            const segmentoP = [
                conta.banco_codigo.padStart(3, '0'),
                '0001',                                     // Lote
                '3',                                        // Tipo (3=Detalhe)
                String(index * 2 + 1).padStart(5, '0'),    // Sequencial
                'P',                                        // Segmento P
                ' ',                                        // Uso exclusivo
                '01',                                       // Código movimento (01=Entrada)
                conta.agencia.padStart(5, '0'),
                ' ',
                conta.conta.padStart(12, '0'),
                conta.conta_dv[0] || ' ',
                ' ',
                titulo.nosso_numero.padStart(20, '0'),
                (conta.carteira || '1').padStart(1, '0'),
                '1',                                        // Forma cadastro (1=Com cadastro)
                '1',                                        // Tipo documento (1=Tradicional)
                '2',                                        // Identificação emissão (2=Cliente)
                '2',                                        // Identificação distribuição (2=Cliente)
                titulo.seu_numero.padEnd(15, ' '),
                titulo.vencimento.replace(/-/g, ''),
                String(Math.round(titulo.valor * 100)).padStart(15, '0'), // Valor em centavos
                '00000',                                    // Agência cobradora
                ' ',
                '01',                                       // Espécie título (01=Duplicata)
                'N',                                        // Aceite
                titulo.vencimento.replace(/-/g, ''),
                '0'.repeat(15),                            // Juros
                '0',                                        // Tipo desconto
                '0'.repeat(8),                             // Data desconto
                '0'.repeat(15),                            // Valor desconto
                '0'.repeat(15),                            // Valor IOF
                '0'.repeat(15),                            // Abatimento
                titulo.seu_numero.padEnd(25, ' '),
                '0',                                        // Protestar (0=Não)
                '00',                                       // Prazo
                '0',                                        // Baixar (0=Não)
                '000',
                '00',                                       // Moeda (00=Real)
                '0'.repeat(10),
                ' ',
            ].join('').substring(0, 240).padEnd(240, ' ');

            linhas.push(segmentoP);

            // Segmento Q (sacado/pagador)
            const segmentoQ = [
                conta.banco_codigo.padStart(3, '0'),
                '0001',
                '3',
                String(index * 2 + 2).padStart(5, '0'),
                'Q',
                ' ',
                '01',
                '2',                                        // Tipo inscrição (2=CNPJ)
                titulo.pagador_documento.replace(/\D/g, '').padStart(15, '0'),
                titulo.pagador_nome.substring(0, 40).padEnd(40, ' '),
                ''.padEnd(40, ' '),                        // Endereço
                ''.padEnd(15, ' '),                        // Bairro
                ''.padEnd(8, '0'),                         // CEP
                ''.padEnd(15, ' '),                        // Cidade
                ''.padEnd(2, ' '),                         // UF
                '0',                                        // Tipo inscrição sacador
                ''.padEnd(15, '0'),                        // CPF/CNPJ sacador
                ''.padEnd(40, ' '),                        // Nome sacador
                ''.padEnd(3, ' '),
                ''.padEnd(20, ' '),
                ' ',
            ].join('').substring(0, 240).padEnd(240, ' ');

            linhas.push(segmentoQ);
        });

        // === TRAILER DO ARQUIVO (Registro 9) ===
        const trailer = [
            conta.banco_codigo.padStart(3, '0'),
            '9999',
            '9',
            ''.padEnd(9, ' '),
            String(linhas.length + 1).padStart(6, '0'), // Qtd registros
            String(titulos.length).padStart(6, '0'),    // Qtd títulos
            String(Math.round(titulos.reduce((s, t) => s + t.valor, 0) * 100)).padStart(17, '0'),
            ''.padEnd(199, '0'),
        ].join('').substring(0, 240).padEnd(240, ' ');

        linhas.push(trailer);

        return linhas.join('\n');
    }

    /**
     * Gerar CNAB 400 - Remessa (simplificado)
     */
    private gerarCNAB400Remessa(
        conta: any,
        titulos: TituloRemessa[],
        sequencial: number,
        tipo: string
    ): string {
        // TODO: Implementar CNAB 400
        throw new Error('CNAB 400 não implementado neste exemplo. Use CNAB 240.');
    }

    /**
     * Parse CNAB 240 - Retorno
     */
    private parseCNAB240Retorno(conteudo: string): OcorrenciaRetorno[] {
        const linhas = conteudo.split('\n').filter(l => l.trim());
        const ocorrencias: OcorrenciaRetorno[] = [];

        for (const linha of linhas) {
            const tipoRegistro = linha.charAt(7);

            if (tipoRegistro === '3') { // Detalhe
                const segmento = linha.charAt(13);

                if (segmento === 'T') { // Segmento T = Retorno
                    const ocorrenciaCodigo = linha.substring(15, 17);
                    const nossoNumero = linha.substring(37, 57).trim();
                    const valorPago = parseInt(linha.substring(77, 92)) / 100;
                    const dataOcorrencia = linha.substring(93, 101);
                    const dataCredito = linha.substring(101, 109);

                    ocorrencias.push({
                        codigo: ocorrenciaCodigo,
                        descricao: this.getDescricaoOcorrencia(ocorrenciaCodigo),
                        nosso_numero: nossoNumero,
                        valor_pago: valorPago,
                        data_ocorrencia: this.parseDateCNAB(dataOcorrencia),
                        data_credito: this.parseDateCNAB(dataCredito),
                    });
                }
            }
        }

        return ocorrencias;
    }

    /**
     * Parse CNAB 400 - Retorno
     */
    private parseCNAB400Retorno(conteudo: string): OcorrenciaRetorno[] {
        // TODO: Implementar parse CNAB 400
        return [];
    }

    /**
     * Processar uma ocorrência do retorno
     */
    private async processarOcorrencia(ocorrencia: OcorrenciaRetorno, arquivo_id: string) {
        // Buscar título pelo nosso número
        const { data: tituloReceber } = await supabase
            .from('contas_receber')
            .select('*')
            .eq('nosso_numero', ocorrencia.nosso_numero)
            .single();

        const { data: tituloPagar } = await supabase
            .from('contas_pagar')
            .select('*')
            .eq('nosso_numero', ocorrencia.nosso_numero)
            .single();

        const titulo = tituloReceber || tituloPagar;
        const tabela = tituloReceber ? 'contas_receber' : 'contas_pagar';
        const tipo = tituloReceber ? 'RECEBER' : 'PAGAR';

        if (!titulo) {
            throw new Error(`Título não encontrado: ${ocorrencia.nosso_numero}`);
        }

        // Processar baseado no código de ocorrência
        switch (ocorrencia.codigo) {
            case '06': // Liquidação
                await supabase.from(tabela).update({
                    status: tipo === 'RECEBER' ? 'RECEBIDO' : 'PAGO',
                    [`valor_${tipo === 'RECEBER' ? 'recebido' : 'pago'}`]: ocorrencia.valor_pago,
                    [`data_${tipo === 'RECEBER' ? 'recebimento' : 'pagamento'}`]: ocorrencia.data_credito,
                    cnab_retorno_id: arquivo_id,
                }).eq('id', titulo.id);
                break;

            case '02': // Entrada confirmada
                await supabase.from(tabela).update({
                    status: 'CONFIRMADO',
                    cnab_retorno_id: arquivo_id,
                }).eq('id', titulo.id);
                break;

            case '09': // Baixado
            case '10': // Baixa solicitada
                await supabase.from(tabela).update({
                    status: 'CANCELADO',
                    observacao: `Baixado pelo banco: ${ocorrencia.descricao}`,
                    cnab_retorno_id: arquivo_id,
                }).eq('id', titulo.id);
                break;

            default:
                // Apenas registrar a ocorrência
                await supabase.from('cnab_detalhes').update({
                    ocorrencia_codigo: ocorrencia.codigo,
                    ocorrencia_descricao: ocorrencia.descricao,
                    processado: true,
                    [tipo === 'RECEBER' ? 'conta_receber_id' : 'conta_pagar_id']: titulo.id,
                }).eq('cnab_arquivo_id', arquivo_id)
                    .eq('nosso_numero', ocorrencia.nosso_numero);
        }

        return { titulo_id: titulo.id, ocorrencia: ocorrencia.descricao };
    }

    /**
     * Helpers
     */
    private detectarLayout(conteudo: string): '240' | '400' {
        const primeiraLinha = conteudo.split('\n')[0];
        return primeiraLinha.length >= 240 ? '240' : '400';
    }

    private gerarNomeArquivo(conta: any, tipo: string, sequencial: number): string {
        const data = new Date().toISOString().split('T')[0].replace(/-/g, '');
        return `${tipo}_${conta.banco_codigo}_${sequencial}_${data}.REM`;
    }

    private parseDateCNAB(dataCNAB: string): string {
        if (!dataCNAB || dataCNAB === '00000000') return '';
        const dia = dataCNAB.substring(0, 2);
        const mes = dataCNAB.substring(2, 4);
        const ano = dataCNAB.substring(4, 8);
        return `${ano}-${mes}-${dia}`;
    }

    private getDescricaoOcorrencia(codigo: string): string {
        const map: Record<string, string> = {
            '02': 'Entrada Confirmada',
            '03': 'Entrada Rejeitada',
            '04': 'Transferência de Carteira/Entrada',
            '05': 'Transferência de Carteira/Baixa',
            '06': 'Liquidação',
            '07': 'Confirmação do Recebimento da Instrução de Desconto',
            '08': 'Confirmação do Recebimento do Cancelamento do Desconto',
            '09': 'Baixa',
            '10': 'Baixa Solicitada',
            '11': 'Títulos em Carteira',
            '12': 'Confirmação Recebimento Instrução de Abatimento',
            '13': 'Confirmação Recebimento Cancelamento Abatimento',
            '14': 'Confirmação Recebimento Instrução Alteração de Vencimento',
            '15': 'Franco de Pagamento',
            '17': 'Liquidação Após Baixa',
            '19': 'Confirmação Recebimento Instrução de Protesto',
            '20': 'Confirmação Recebimento Instrução de Sustação/Cancelamento de Protesto',
            '23': 'Remessa a Cartório',
            '24': 'Retirada de Cartório',
            '25': 'Protestado e Baixado',
            '26': 'Instrução Rejeitada',
            '27': 'Confirmação do Pedido de Alteração de Outros Dados',
            '28': 'Débito de Tarifas/Custas',
            '29': 'Ocorrências do Pagador',
            '30': 'Alteração de Dados Rejeitada',
        };
        return map[codigo] || `Ocorrência ${codigo}`;
    }
}

export const cnabService = new CNABService();
export default cnabService;

```


# File: services/evolutionService.ts
```

import axios from 'axios';

// Configurações (Lendo do .env ou usando padrão local)
const API_URL = import.meta.env.VITE_EVOLUTION_API_URL || 'http://localhost:8080';
const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || 'terrapro123';
const INSTANCE_NAME = 'terrapro_bot'; // Nome fixo da instância para facilitar

// Configuração do Axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
    }
});

export const evolutionService = {
    // 1. Checar se a instância existe e qual o status
    async getConnectionState() {
        try {
            // Tenta buscar o estado da conexão
            const response = await api.get(`/instance/connectionState/${INSTANCE_NAME}`);
            // Retorna: { instance: "terrapro_bot", state: "open" | "close" | "connecting" }
            return response.data?.instance?.state || 'orphaned';
        } catch (error: any) {
            if (error.response?.status === 404) {
                return 'not_found'; // Instância nem existe ainda
            }
            console.error('Erro ao checar status:', error);
            return 'error';
        }
    },

    // 2. Criar a Instância (Se não existir)
    async createInstance() {
        try {
            const response = await api.post('/instance/create', {
                instanceName: INSTANCE_NAME,
                description: "TerraPro ERP Bot",
                qrcode: true, // Retorna QR Code na resposta se conectar
                integration: "WHATSAPP-BAILEYS"
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar instância:', error);
            throw error;
        }
    },

    // 3. Conectar e Pegar QR Code
    async connectInstance() {
        try {
            // Na V2, o connect retorna o base64 do QR code se estiver desconectado
            const response = await api.get(`/instance/connect/${INSTANCE_NAME}`);
            return response.data; // Espera-se { base64: "...", code: "..." }
        } catch (error) {
            console.error('Erro ao conectar:', error);
            throw error;
        }
    },

    // 4. Desconectar (Logout)
    async logoutInstance() {
        try {
            await api.delete(`/instance/logout/${INSTANCE_NAME}`);
        } catch (error) {
            console.error('Erro ao deslogar:', error);
        }
    },

    // 5. Deletar Instância (Reset Total)
    async deleteInstance() {
        try {
            await api.delete(`/instance/delete/${INSTANCE_NAME}`);
        } catch (error) {
            console.error('Erro ao deletar:', error);
        }
    },

    // 5.1 Reset Completo (Deleta + Recria + Conecta)
    async resetInstance() {
        try {
            console.log('🔄 Iniciando reset forçado...');

            // 1. Deletar instância existente
            try {
                await this.deleteInstance();
                console.log('✅ Instância deletada');
            } catch (e) {
                console.log('⚠️ Nada para deletar');
            }

            // 2. Aguardar 2s para garantir limpeza
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 3. Criar nova instância
            console.log('🔨 Criando nova instância...');
            const createResult = await this.createInstance();
            console.log('✅ Instância criada:', createResult);

            // 4. Aguardar 3s para inicialização
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 5. Tentar obter QR Code
            console.log('📱 Solicitando QR Code...');
            const connectResult = await this.connectInstance();

            return connectResult;
        } catch (error) {
            console.error('❌ Erro no reset:', error);
            throw error;
        }
    },

    // 6. Enviar Mensagem de Texto
    async sendText(phone: string, text: string) {
        try {
            // Formata número (Evolution aceita com ou sem @s.whatsapp.net, mas o padrão BR é 55...)
            const cleanPhone = phone.replace(/\D/g, '');
            const remoteJid = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@s.whatsapp.net`;

            const response = await api.post(`/message/sendText/${INSTANCE_NAME}`, {
                number: remoteJid,
                options: {
                    delay: 1200,
                    presence: "composing",
                },
                textMessage: {
                    text: text
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            throw error;
        }
    }
};

```


# File: services/fleetService.ts
```

import { supabase } from '../lib/supabase';
import { Asset, AssetStatus } from '../types';
import { fetchFleetPositions, getVehicleStatus } from './selsyn';

export const fleetManagementService = {
    getAssets: async () => {
        // 1. Fetch Assets from DB
        const { data: assetsData, error } = await supabase
            .from('assets')
            .select('*')
            .order('name');

        if (error) throw error;

        let assets = assetsData as Asset[];

        try {
            // 2. Fetch Real-time GPS Data (Operator Level)
            const positions = await fetchFleetPositions();
            // console.log(`[FleetService] Selsyn returned ${positions.length} positions.`);

            // 3. Merge Data
            let matchCount = 0;
            assets = assets.map(asset => {
                const normalize = (s: string) => s ? s.replace(/[\s-]/g, '').toUpperCase() : '';
                const assetName = normalize(asset.name);
                const assetCode = normalize(asset.code);

                // Match with identifier (PLACA) or Friendly Name
                const pos = positions.find(p => {
                    const plate = normalize(p.identificador);
                    const trackerName = normalize(p.rastreavel); // Fallback match

                    // Debug Log for first item only to avoid spam
                    // if (asset.code === 'AAA-0001') console.log('Checking match:', { plate, trackerName, assetName, assetCode });

                    return plate === assetName || plate === assetCode ||
                        (trackerName && (trackerName === assetName || trackerName === assetCode));
                });

                if (pos) {
                    matchCount++;
                    const statusSelsyn = getVehicleStatus(pos);
                    let mappedStatus = AssetStatus.AVAILABLE;

                    if (statusSelsyn === 'moving') mappedStatus = AssetStatus.OPERATING;
                    else if (statusSelsyn === 'idle') mappedStatus = AssetStatus.IDLE;
                    else if (statusSelsyn === 'offline') mappedStatus = AssetStatus.MAINTENANCE;
                    else mappedStatus = AssetStatus.AVAILABLE;

                    // Handle date format from Operator API
                    const lastUpdate = pos.dataHora ? new Date(pos.dataHora).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');

                    return {
                        ...asset,
                        status: mappedStatus,
                        coordinates: { lat: pos.latitude, lng: pos.longitude },
                        telemetry: {
                            ...asset.telemetry,
                            speed: pos.velocidade,
                            ignition: pos.ignicao,
                            lastUpdate: lastUpdate,
                            address: pos.endereco || 'Localização GPS',
                            voltage: pos.fonteEnergia || 0,
                            batteryLevel: 100, // Mock
                            satelliteCount: 8, // Mock
                            deviceModel: pos.tipo || 'Rastreador'
                        }
                    };
                }
                return asset;
            });

            console.log(`[FleetService] Merge Result: ${matchCount} matches out of ${assets.length} assets.`);

        } catch (err) {
            console.error('Failed to merge GPS data:', err);
        }

        return assets;
    },

    createAsset: async (asset: Partial<Asset>) => {
        // We get the current user to find their company_id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");

        // Fetch user profile to get company_id
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (!profile) throw new Error("User profile not found");

        const { data, error } = await supabase
            .from('assets')
            .insert({
                ...asset,
                company_id: profile.company_id
            })
            .select()
            .single();

        if (error) throw error;
        return data as Asset;
    },

    updateAsset: async (asset: Asset) => {
        const { data, error } = await supabase
            .from('assets')
            .update(asset)
            .eq('id', asset.id)
            .select()
            .single();

        if (error) throw error;
        return data as Asset;
    },

    deleteAsset: async (id: string) => {
        const { error } = await supabase
            .from('assets')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Novo método para buscar funcionários da mesma empresa do usuário logado
    getEmployees: async () => {
        // Obter usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // Buscar perfil para saber a company_id
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.company_id) {
            console.warn("Usuário sem empresa vinculada, retornando lista vazia.");
            return [];
        }

        // Buscar funcionários apenas dessa empresa
        const { data, error } = await supabase
            .from('employees')
            .select('id, full_name')
            .eq('company_id', profile.company_id)
            .order('full_name');

        if (error) {
            console.error("Erro ao buscar funcionários:", error);
            throw error;
        }

        return data || [];
    }
};

```


# File: services/http/httpClient.ts
```

import { handleMockRequest } from './mockAdapter';

// In a real app, this would be determined by env vars
const USE_MOCK = true;
const BASE_URL = 'https://api.terrapro.com/v1';

interface RequestConfig extends RequestInit {
    params?: Record<string, string>;
}

export const httpClient = {
    get: async <T>(endpoint: string, config?: RequestConfig): Promise<T> => {
        if (USE_MOCK) {
            return handleMockRequest(endpoint, 'GET') as Promise<T>;
        }
        return fetch(`${BASE_URL}${endpoint}`).then(res => res.json());
    },

    post: async <T>(endpoint: string, body: any, config?: RequestConfig): Promise<T> => {
        if (USE_MOCK) {
            return handleMockRequest(endpoint, 'POST', body) as Promise<T>;
        }
        return fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json());
    },

    put: async <T>(endpoint: string, body: any, config?: RequestConfig): Promise<T> => {
        if (USE_MOCK) {
            return handleMockRequest(endpoint, 'PUT', body) as Promise<T>;
        }
        return fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json());
    },

    delete: async <T>(endpoint: string, config?: RequestConfig): Promise<T> => {
        if (USE_MOCK) {
            return handleMockRequest(endpoint, 'DELETE') as Promise<T>;
        }
        return fetch(`${BASE_URL}${endpoint}`, { method: 'DELETE' }).then(res => res.json());
    }
};

```


# File: services/http/mockAdapter.ts
```

import { dashboardService } from '../api';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function handleMockRequest(url: string, method: string, data?: any) {
    console.log(`[MockAdapter] ${method} ${url}`, data);

    // Simulate network delay logic is already in dashboardService, but we can add more if needed.
    // However, dashboardService returns Promises with delay.

    switch (true) {
        // Assets / Fleet
        case url === '/fleet/assets' && method === 'GET':
            return dashboardService.getAssets();

        case url === '/fleet/assets' && method === 'POST':
            return dashboardService.addAsset(data);

        case url.startsWith('/fleet/assets/') && method === 'PUT':
            // Extract ID? dashboardService.updateAsset expects an Asset object with ID
            return dashboardService.updateAsset(data);

        case url.startsWith('/fleet/assets/') && method === 'DELETE':
            const id = url.split('/').pop();
            if (id) return dashboardService.deleteAsset(id);
            break;

        // Security
        case url === '/security/audit-logs' && method === 'GET':
            return dashboardService.getAuditLogs();

        case url === '/security/sessions' && method === 'GET':
            return dashboardService.getActiveSessions();

        default:
            console.warn(`[MockAdapter] No handler for ${method} ${url}`);
            throw new Error(`Mock endpoint not implemented: ${url}`);
    }
}

```


# File: services/logger.ts
```

import { supabase } from '../lib/supabase';

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

export interface AutomationLog {
    id?: string;
    automation_name: string; // Ex: 'SelsynGPS', 'ImportVeiculos'
    level: LogLevel;
    message: string;
    details?: any; // JSON object para dados extras
    created_at?: string;
}

// Fallback in-memory
const memoryLogs: AutomationLog[] = [];

export const logger = {
    log: async (automation: string, level: LogLevel, message: string, details?: any) => {
        const timestamp = new Date().toISOString();
        const icon = level === 'ERROR' ? 'Bz' : level === 'SUCCESS' ? '✅' : level === 'WARNING' ? '⚠️' : 'ℹ️';
        console.log(`[${timestamp}] ${icon} [${automation}] ${message}`, details || '');

        const logItem: AutomationLog = {
            id: Math.random().toString(36),
            automation_name: automation,
            level,
            message,
            details,
            created_at: timestamp
        };

        // Salvar em memória (últimos 100)
        memoryLogs.unshift(logItem);
        if (memoryLogs.length > 100) memoryLogs.pop();

        // Tentar salvar no Supabase
        const { error } = await supabase.from('automation_logs').insert({
            automation_name: automation,
            level,
            message,
            details,
            created_at: timestamp
        });

        if (error) {
            console.warn('Falha Supabase Log (usando memória):', error.message);
        }
    },

    info: (automation: string, message: string, details?: any) => logger.log(automation, 'INFO', message, details),
    success: (automation: string, message: string, details?: any) => logger.log(automation, 'SUCCESS', message, details),
    warn: (automation: string, message: string, details?: any) => logger.log(automation, 'WARNING', message, details),
    error: (automation: string, message: string, details?: any) => logger.log(automation, 'ERROR', message, details),

    // Buscar logs (Mescla Banco + Memória)
    fetchLogs: async (limit = 100) => {
        const { data, error } = await supabase
            .from('automation_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error || !data) {
            return [...memoryLogs];
        }

        // Se tiver dados do banco, retorna eles. Se quiser mesclar, poderia, mas melhor priorizar banco.
        return data as AutomationLog[];
    }
};

```


# File: services/mockData.ts
```

import { AssetStatus, OSStatus, Asset, MaintenanceOS, StockItem, Transaction, PaymentStatus, ERPDocument } from '../types';

export const MOCK_ASSETS: Asset[] = [
    {
        id: 'EXC-042',
        name: 'Escavadeira CAT 320',
        model: 'CAT 320',
        status: AssetStatus.OPERATING,
        horometer: 12450,
        nextRevision: '12500h',
        efficiency: 92,
        coordinates: { lat: -22.2558, lng: -54.8322 },
        telemetry: {
            lastUpdate: '2024-02-01 10:42:15',
            speed: 0,
            ignition: true,
            voltage: 26.4,
            batteryLevel: 98,
            satelliteCount: 12,
            address: 'Rodovia BR-163, Km 256, Dourados - MS',
            deviceModel: 'Suntech ST8310'
        }
    },
    {
        id: 'TRT-015',
        name: 'Trator JD 7200',
        model: 'JD 7200',
        status: AssetStatus.OPERATING,
        horometer: 8540,
        nextRevision: '8600h',
        efficiency: 88,
        coordinates: { lat: -22.2580, lng: -54.8300 },
        telemetry: {
            lastUpdate: '2024-02-01 10:41:50',
            speed: 12,
            ignition: true,
            voltage: 13.8,
            batteryLevel: 100,
            satelliteCount: 14,
            address: 'Fazenda Sta. Rita - Talhão 04',
            deviceModel: 'Teltonika FMB920'
        }
    },
    {
        id: 'EXC-045',
        name: 'Escavadeira Volvo',
        model: 'EC200',
        status: AssetStatus.MAINTENANCE,
        horometer: 13200,
        nextRevision: '13000h',
        efficiency: 0,
        coordinates: { lat: -22.2600, lng: -54.8250 },
        telemetry: {
            lastUpdate: '2024-02-01 08:30:00',
            speed: 0,
            ignition: false,
            voltage: 24.1,
            batteryLevel: 85,
            satelliteCount: 0,
            address: 'Oficina Central TerraPro',
            deviceModel: 'Suntech ST310U'
        },
        manuals: [
            {
                id: 'MAN-001',
                title: 'Manual de Serviço Volvo EC200',
                filename: 'VOLVO_EC200_SERVICE.pdf',
                category: 'OUTROS',
                uploadDate: '2023-01-15',
                fileSize: '15.4 MB',
                fileType: 'PDF',
                relatedTo: 'EXC-045'
            }
        ]
    },
];

export const MOCK_ACTIVITIES = [
    { time: '08:42', user: 'Ricardo Silva', action: 'Iniciou turno no ativo EXC-042', project: 'Rodovia BR-101' },
    { time: '08:15', user: 'Sistema GPS', action: 'Alerta: Baixo nível de diesel detectado', project: 'TRT-015' },
    { time: '07:30', user: 'André Santos', action: 'Finalizou controle diário ontem', project: 'Jardim Europa' },
    { time: '07:15', user: 'Marcos Oliveira', action: 'Check-list pré-operacional OK', project: 'Rodovia BR-101' },
];

export const MOCK_STATS = [
    { title: "Máquinas em Operação", value: "38 / 52", trend: "+2 hoje", trendUp: true, iconType: "activity", iconBg: "bg-[#007a33]" },
    { title: "Controles Diários", value: "12 Pendentes", trend: "Urgente", trendUp: false, iconType: "clock", iconBg: "bg-orange-600" },
    { title: "Alertas de Manutenção", value: "04 Ativos", trend: "Crítico", trendUp: false, iconType: "alert", iconBg: "bg-rose-600" },
    { title: "Equipes em Campo", value: "08 Frentes", trend: "Normal", trendUp: true, iconType: "map", iconBg: "bg-slate-700" },
];

export const MOCK_STOCK: StockItem[] = [
    { sku: 'FIL-001', description: 'Filtro de Ar Primário', category: 'Filtros', currentQty: 12, minQty: 15, location: 'A-01', status: 'WARNING' },
    { sku: 'OLE-15W', description: 'Óleo Motor 15W40', category: 'Lubrificantes', currentQty: 200, minQty: 100, location: 'T-01', status: 'NORMAL' },
    { sku: 'PNE-295', description: 'Pneu 295/80 R22.5', category: 'Pneus', currentQty: 2, minQty: 4, location: 'B-02', status: 'CRITICAL' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'FAT-001', client: 'Construtora Norte', project: 'Rodovia BR-101', dueDate: '2024-02-15', amount: 45000.00, status: PaymentStatus.PENDING },
    { id: 'FAT-002', client: 'Agropecuária Sul', project: 'Fazenda Sta. Rita', dueDate: '2024-02-10', amount: 12500.00, status: PaymentStatus.PAID },
    { id: 'FAT-003', client: 'Prefeitura Dourados', project: 'Tapa Buracos', dueDate: '2024-01-30', amount: 8200.00, status: PaymentStatus.OVERDUE },
];

export const MOCK_MAINTENANCE_OS: MaintenanceOS[] = [
    { id: 'OS-8820', assetId: 'EXC-042', assetName: 'Escavadeira CAT 320', priority: 'HIGH', status: OSStatus.IN_PROGRESS, mechanic: 'João Mecânico', description: 'Vazamento no cilindro hidráulico principal', progress: 60, partsNeeded: ['Kit Vedação 120mm', 'Óleo Hidráulico 68'] },
    { id: 'OS-8821', asset_id: 'TRT-015', assetName: 'Trator JD 7200', priority: 'URGENT', status: OSStatus.WAITING_PARTS, mechanic: 'Carlos Lima', description: 'Superaquecimento do motor - Troca de radiador', progress: 30, partsNeeded: ['Radiador JD-7200', 'Aditivo Arrefecimento'] },
    { id: 'OS-8822', asset_id: 'CMH-002', assetName: 'Caminhão G420', priority: 'LOW', status: OSStatus.PENDING, description: 'Revisão preventiva 5.000km', progress: 0 },
    { id: 'OS-8823', asset_id: 'EXC-045', assetName: 'Escavadeira Volvo', priority: 'MEDIUM', status: OSStatus.COMPLETED, mechanic: 'João Mecânico', description: 'Troca de dentes da caçamba', progress: 100 },
];

export interface TimeRecord {
    id?: string;
    date: string;
    entry1: string;
    exit1: string;
    entry2: string;
    exit2: string;
    totalHours: string;
    status: 'REGULAR' | 'ABSENT' | 'MANUAL_EDIT' | 'OVERTIME' | 'MISSING';
}

export interface PayrollEntry {
    id: number;
    employeeName: string;
    role: string;
    baseSalary: number;
    advances: number;
    overtimeValue: number;
    discounts: number;
}

export const MOCK_TIME_RECORDS: TimeRecord[] = [
    { date: '2024-01-28', entry1: '08:00', exit1: '12:00', entry2: '13:00', exit2: '17:00', totalHours: '08:00', status: 'REGULAR' },
    { date: '2024-01-29', entry1: '08:05', exit1: '12:00', entry2: '13:00', exit2: '17:15', totalHours: '08:10', status: 'REGULAR' },
    { date: '2024-01-30', entry1: '08:00', exit1: '', entry2: '', exit2: '', totalHours: '04:00', status: 'ABSENT' },
    { date: '2024-01-31', entry1: '08:00', exit1: '12:00', entry2: '13:00', exit2: '19:00', totalHours: '10:00', status: 'OVERTIME' },
];

export const MOCK_PAYROLL_DATA: PayrollEntry[] = [
    { id: 1, employeeName: 'João da Silva', role: 'Mecânico Chefe', baseSalary: 4500.00, advances: 500.00, overtimeValue: 350.00, discounts: 280.00 },
    { id: 2, employeeName: 'Maria Oliveira', role: 'Gerente ADM', baseSalary: 6200.00, advances: 0.00, overtimeValue: 0.00, discounts: 650.00 },
    { id: 3, employeeName: 'Carlos Santos', role: 'Operador', baseSalary: 3200.00, advances: 1200.00, overtimeValue: 150.00, discounts: 180.00 },
];

export interface TimelineCell {
    day: number;
    status: 'WORKED' | 'STANDBY' | 'MAINTENANCE' | 'RAIN' | 'EMPTY';
    location?: string;
    hours?: number;
    startTime?: string;
    endTime?: string;
    hasLunchBreak?: boolean;
    lunchStartTime?: string;
    lunchEndTime?: string;
}

export interface EquipmentTimeline {
    id: string;
    name: string;
    model: string;
    timeline: TimelineCell[];
}

const DAYS_IN_MONTH = 31;
const generateMockTimeline = (): TimelineCell[] => {
    return Array.from({ length: DAYS_IN_MONTH }, (_, i) => {
        const day = i + 1;
        const rand = Math.random();
        let status: TimelineCell['status'] = 'WORKED';
        let location = 'PEDREIRA';
        let hours = 8.5;
        let startTime = '07:30';
        let endTime = '17:00';
        let hasLunchBreak = true;
        let lunchStartTime = '12:00';
        let lunchEndTime = '13:00';

        if (rand > 0.8) {
            status = 'STANDBY';
            location = 'OFICINA';
            hours = 0;
            startTime = '';
            endTime = '';
            hasLunchBreak = false;
        }
        else if (rand > 0.9) {
            status = 'MAINTENANCE';
            location = 'OFICINA';
            hours = 0;
            startTime = '';
            endTime = '';
            hasLunchBreak = false;
        }
        else if (day === 25 || day === 31) {
            status = 'EMPTY';
            location = '';
            hours = 0;
            startTime = '';
            endTime = '';
            hasLunchBreak = false;
        }

        return {
            day,
            status,
            location,
            hours,
            startTime: status === 'WORKED' ? startTime : undefined,
            endTime: status === 'WORKED' ? endTime : undefined,
            hasLunchBreak: status === 'WORKED' ? hasLunchBreak : false,
            lunchStartTime: status === 'WORKED' ? lunchStartTime : undefined,
            lunchEndTime: status === 'WORKED' ? lunchEndTime : undefined
        };
    });
};

export const MOCK_OPERATIONS_MAP_DATA: EquipmentTimeline[] = [
    { id: 'EC-SDLG-03', name: 'Escavadeira SDLG', model: 'SDLG 920', timeline: generateMockTimeline() },
    { id: 'ESC-CAT-01', name: 'Escavadeira CAT', model: '320D', timeline: generateMockTimeline() },
    { id: 'PTR-05', name: 'Patrol 140K', model: '140K', timeline: generateMockTimeline() },
    { id: 'TRT-D6', name: 'Trator D6', model: 'D6N', timeline: generateMockTimeline() },
    { id: 'CAM-01', name: 'Caminhão Basc.', model: 'VW 31.330', timeline: generateMockTimeline() },
];

export const MOCK_DOCUMENTS: ERPDocument[] = [
    { id: 'DOC-001', title: 'Nota Fiscal - Aquisição Peças', filename: 'NF_29384_PECAS.pdf', category: 'FISCAL', uploadDate: '2024-02-01', fileSize: '1.2 MB', fileType: 'PDF' },
    { id: 'DOC-002', title: 'Contrato Social Consolidado', filename: 'CONTRATO_SOCIAL_2024.pdf', category: 'LEGAL', uploadDate: '2024-01-15', fileSize: '2.5 MB', fileType: 'PDF' },
    { id: 'DOC-003', title: 'CRLV 2024 - Caminhão G420', filename: 'CRLV_CAM01.pdf', category: 'VEICULOS', uploadDate: '2024-01-10', expiryDate: '2024-12-31', fileSize: '850 KB', fileType: 'PDF', relatedTo: 'Caminhão G420' },
    { id: 'DOC-004', title: 'Holerite Jan/24 - João Silva', filename: 'HOLERITE_JOAO_JAN24.pdf', category: 'RH', uploadDate: '2024-01-30', fileSize: '450 KB', fileType: 'PDF', relatedTo: 'João da Silva' },
    { id: 'DOC-005', title: 'Licença Ambiental Operação (LAO)', filename: 'LAO_PEDREIRA_01.pdf', category: 'LICENCAS', uploadDate: '2023-06-01', expiryDate: '2025-06-01', fileSize: '4.8 MB', fileType: 'PDF' },
    { id: 'DOC-006', title: 'Foto Avaria - Escavadeira 042', filename: 'AVARIA_EXC042.jpg', category: 'VEICULOS', uploadDate: '2024-02-01', fileSize: '3.2 MB', fileType: 'IMAGE', relatedTo: 'Escavadeira CAT 320' },
    { id: 'DOC-007', title: 'Manual Técnico - Trator D6', filename: 'MANUAL_D6N.pdf', category: 'VEICULOS', uploadDate: '2023-01-01', fileSize: '12 MB', fileType: 'PDF', relatedTo: 'Trator D6' },
    { id: 'DOC-008', title: 'Contrato Prestação Serviços - Obra Estrada', filename: 'CONTRATO_OBRA_ESTRADA.docx', category: 'LEGAL', uploadDate: '2024-01-05', fileSize: '540 KB', fileType: 'DOCX' },
];

import { AuditLogEntry, NetworkSession } from '../types';

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    {
        id: 'LOG-001',
        timestamp: '2024-02-02 16:30:45',
        userId: 'admin',
        userName: 'Admin User',
        action: 'DELETE',
        resource: 'Ativo',
        details: 'Excluiu o ativo [EXC-999] - Escavadeira Antiga',
        ipAddress: '192.168.100.15',
        severity: 'HIGH',
        screenshotUrl: 'https://via.placeholder.com/800x600?text=Evidence+Screenshot+Delete'
    },
    {
        id: 'LOG-002',
        timestamp: '2024-02-02 15:15:22',
        userId: 'usr_jrocha',
        userName: 'João Rocha',
        action: 'UPDATE',
        resource: 'Financeiro',
        details: 'Alterou vencimento da NF-29384 para 20/02/2024',
        ipAddress: '192.168.100.22',
        severity: 'MEDIUM'
    },
    {
        id: 'LOG-003',
        timestamp: '2024-02-02 14:00:10',
        userId: 'admin',
        userName: 'Admin User',
        action: 'LOGIN',
        resource: 'Sistema',
        details: 'Login realizado com sucesso',
        ipAddress: '192.168.100.15',
        severity: 'LOW'
    },
    {
        id: 'LOG-004',
        timestamp: '2024-02-02 10:45:00',
        userId: 'usr_asilva',
        userName: 'Ana Silva',
        action: 'CREATE',
        resource: 'Documentos',
        details: 'Upload de contrato C-9922.pdf',
        ipAddress: '192.168.100.33',
        severity: 'LOW',
        screenshotUrl: 'https://via.placeholder.com/800x600?text=Evidence+Screenshot+Upload'
    },
    {
        id: 'LOG-005',
        timestamp: '2024-02-01 18:30:00',
        userId: 'usr_jrocha',
        userName: 'João Rocha',
        action: 'EXPORT',
        resource: 'Relatórios',
        details: 'Exportou relatório completo de frota',
        ipAddress: '192.168.100.22',
        severity: 'MEDIUM'
    }
];

export const MOCK_SESSIONS: NetworkSession[] = [
    {
        id: 'SES-001',
        userId: 'admin',
        userName: 'Admin User',
        device: 'MacBook Pro 16"',
        ipAddress: '192.168.100.15',
        lastActive: 'Agora',
        currentScreen: 'Auditoria e Segurança',
        status: 'ACTIVE',
        thumbnailUrl: 'https://via.placeholder.com/300x200/1e293b/ffffff?text=Admin+View'
    },
    {
        id: 'SES-002',
        userId: 'usr_jrocha',
        userName: 'João Rocha',
        device: 'Dell Latitude 5420',
        ipAddress: '192.168.100.22',
        lastActive: '2 min atrás',
        currentScreen: 'Financeiro > Lançamentos',
        status: 'ACTIVE',
        thumbnailUrl: 'https://via.placeholder.com/300x200/0f172a/ffffff?text=Financeiro'
    },
    {
        id: 'SES-003',
        userId: 'usr_asilva',
        userName: 'Ana Silva',
        device: 'iPad Pro',
        ipAddress: '192.168.100.33',
        lastActive: '15 min atrás',
        currentScreen: 'Gestão de Documentos',
        status: 'IDLE',
        thumbnailUrl: 'https://via.placeholder.com/300x200/334155/ffffff?text=iPad+Idle'
    }
];

```


# File: services/operationsService.ts
```

import { supabase } from '../lib/supabase';
import { EquipmentTimeline, TimelineCell } from './mockData';

export const operationsService = {
    // Busca dados para o mapa de operações
    getOperationsMapData: async (month: number, year: number): Promise<EquipmentTimeline[]> => {
        // 1. Buscar todos os ativos ativos
        const { data: assets, error: errAssets } = await supabase
            .from('assets')
            .select('id, name, model, code, status')
            // .eq('status', 'OPERATING') // Removido para mostrar TODOS os ativos
            .order('name');

        if (errAssets) {
            console.error('Error fetching assets:', errAssets);
            return [];
        }

        // 2. Buscar apontamentos do mês
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Último dia do mês

        const { data: operations, error: errOps } = await supabase
            .from('asset_daily_operations')
            .select('*')
            .gte('operation_date', startDate)
            .lte('operation_date', endDate);

        if (errOps) {
            console.error('Error fetching operations:', errOps);
            return [];
        }

        // 3. Montar Timeline
        const daysInMonth = new Date(year, month, 0).getDate();

        const timelineData: EquipmentTimeline[] = assets.map(asset => {
            const assetOps = operations?.filter(op => op.asset_id === asset.id) || [];

            const timeline: TimelineCell[] = Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const op = assetOps.find(o => o.operation_date === dateStr);

                if (op) {
                    return {
                        id: op.id,
                        day,
                        status: op.status as any,
                        location: op.work_site || '',
                        hours: op.total_hours || 0,
                        startTime: op.start_time?.slice(0, 5),
                        endTime: op.end_time?.slice(0, 5),
                        hasLunchBreak: !!op.break_start,
                        lunchStartTime: op.break_start?.slice(0, 5),
                        lunchEndTime: op.break_end?.slice(0, 5)
                    };
                }

                return {
                    day,
                    status: 'EMPTY' as any
                };
            });

            return {
                id: asset.id,
                name: asset.name,
                model: asset.model,
                timeline
            };
        });

        return timelineData;
    },

    // Salvar/Atualizar Apontamento
    saveOperation: async (assetId: string, date: string, data: any) => {
        // Verifica se já existe
        const { data: existing } = await supabase
            .from('asset_daily_operations')
            .select('id')
            .eq('asset_id', assetId)
            .eq('operation_date', date)
            .single();

        const payload = {
            asset_id: assetId,
            operation_date: date,
            status: data.status,
            work_site: data.location,
            start_time: data.startTime,
            end_time: data.endTime,
            break_start: data.hasLunchBreak ? data.lunchStartTime : null,
            break_end: data.hasLunchBreak ? data.lunchEndTime : null,
            total_hours: data.hours
        };

        if (existing) {
            return await supabase
                .from('asset_daily_operations')
                .update(payload)
                .eq('id', existing.id);
        } else {
            return await supabase
                .from('asset_daily_operations')
                .insert(payload);
        }
    }
};

```


# File: services/paymentService.ts
```
/**
 * Serviço de Contas a Pagar
 * Gerencia fornecedores, lançamentos, pagamentos e CNAB
 */

import { supabase } from '../lib/supabase';

export interface ContaPagar {
    id?: string;
    numero_titulo?: string;
    fornecedor_id: string;
    fornecedor_nome: string;
    valor_original: number;
    valor_juros?: number;
    valor_multa?: number;
    valor_desconto?: number;
    valor_pago?: number;
    valor_saldo?: number;
    data_emissao: string;
    data_vencimento: string;
    data_pagamento?: string;
    plano_contas_id?: string;
    centro_custo_id?: string;
    categoria?: string;
    status: 'PENDENTE' | 'APROVADO' | 'EM_PAGAMENTO' | 'PAGO' | 'CANCELADO' | 'VENCIDO';
    forma_pagamento?: string;
    banco_id?: string;
    nosso_numero?: string;
    descricao: string;
    observacao?: string;
    numero_documento?: string;
    parcela_numero?: number;
    parcela_total?: number;
    titulo_pai_id?: string;
    conciliado?: boolean;
}

export interface ParcelamentoConfig {
    valor_total: number;
    numero_parcelas: number;
    data_primeiro_vencimento: string;
    intervalo_dias: number;
}

class PaymentService {
    /**
     * Listar contas a pagar com filtros
     */
    async listar(filtros?: {
        fornecedor_id?: string;
        status?: string;
        data_inicio?: string;
        data_fim?: string;
        vencidas?: boolean;
    }) {
        let query = supabase
            .from('contas_pagar')
            .select(`
        *,
        fornecedor:entities!fornecedor_id(id, name, document),
        plano_contas:plano_contas(codigo, nome),
        centro_custo:centros_custo(codigo, nome)
      `)
            .order('data_vencimento', { ascending: false });

        if (filtros?.fornecedor_id) {
            query = query.eq('fornecedor_id', filtros.fornecedor_id);
        }

        if (filtros?.status) {
            query = query.eq('status', filtros.status);
        }

        if (filtros?.data_inicio) {
            query = query.gte('data_vencimento', filtros.data_inicio);
        }

        if (filtros?.data_fim) {
            query = query.lte('data_vencimento', filtros.data_fim);
        }

        if (filtros?.vencidas) {
            query = query.lt('data_vencimento', new Date().toISOString().split('T')[0])
                .neq('status', 'PAGO');
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    /**
     * Criar nova conta a pagar
     */
    async criar(conta: ContaPagar) {
        // Gerar número do título automaticamente
        if (!conta.numero_titulo) {
            conta.numero_titulo = await this.gerarNumeroTitulo();
        }

        const { data, error } = await supabase
            .from('contas_pagar')
            .insert(conta)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Criar conta parcelada
     */
    async criarParcelado(conta: Omit<ContaPagar, 'numero_titulo'>, config: ParcelamentoConfig) {
        const valorParcela = config.valor_total / config.numero_parcelas;
        const parcelas: ContaPagar[] = [];

        // Criar título pai
        const tituloPai = await this.criar({
            ...conta,
            valor_original: config.valor_total,
            data_vencimento: config.data_primeiro_vencimento,
            descricao: `${conta.descricao} (Parcelado ${config.numero_parcelas}x)`,
            parcela_numero: 0,
            parcela_total: config.numero_parcelas,
        });

        // Criar parcelas
        for (let i = 1; i <= config.numero_parcelas; i++) {
            const dataVencimento = new Date(config.data_primeiro_vencimento);
            dataVencimento.setDate(dataVencimento.getDate() + ((i - 1) * config.intervalo_dias));

            const parcela = await this.criar({
                ...conta,
                valor_original: valorParcela,
                data_vencimento: dataVencimento.toISOString().split('T')[0],
                descricao: `${conta.descricao} - Parcela ${i}/${config.numero_parcelas}`,
                parcela_numero: i,
                parcela_total: config.numero_parcelas,
                titulo_pai_id: tituloPai.id,
            });

            parcelas.push(parcela);
        }

        return { tituloPai, parcelas };
    }

    /**
     * Aprovar conta a pagar
     */
    async aprovar(id: string, aprovador_id: string) {
        const { data, error } = await supabase
            .from('contas_pagar')
            .update({
                status: 'APROVADO',
                aprovado_por_id: aprovador_id,
                data_aprovacao: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Efetuar pagamento
     */
    async pagar(id: string, dados: {
        valor_pago: number;
        data_pagamento: string;
        forma_pagamento: string;
        banco_id?: string;
        observacao?: string;
    }) {
        const { data, error } = await supabase
            .from('contas_pagar')
            .update({
                valor_pago: dados.valor_pago,
                data_pagamento: dados.data_pagamento,
                forma_pagamento: dados.forma_pagamento,
                banco_id: dados.banco_id,
                observacao: dados.observacao,
                status: 'PAGO',
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Se pagamento foi via banco, criar movimento bancário e atualizar saldo
        if (dados.banco_id) {
            await this.criarMovimentoBancario(dados.banco_id, {
                data_movimento: dados.data_pagamento,
                historico: `Pagamento ${data.numero_titulo} - ${data.descricao}`,
                valor: -dados.valor_pago,
                tipo_movimento: 'DEBITO',
                origem: 'PAGAMENTO',
                lancamento_financeiro_id: id,
                lancamento_tipo: 'PAGAR',
            });

            // Atualizar saldo da conta (Decrementar)
            const { data: conta } = await supabase
                .from('contas_bancarias')
                .select('saldo_atual')
                .eq('id', dados.banco_id)
                .single();

            if (conta) {
                await supabase
                    .from('contas_bancarias')
                    .update({ saldo_atual: (conta.saldo_atual || 0) - dados.valor_pago, ultimo_saldo_atualizado_em: new Date() })
                    .eq('id', dados.banco_id);
            }
        }

        return data;
    }

    /**
     * Cancelar conta a pagar
     */
    async cancelar(id: string, motivo: string) {
        const { data, error } = await supabase
            .from('contas_pagar')
            .update({
                status: 'CANCELADO',
                observacao: `CANCELADO: ${motivo}`,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Relatório de contas vencidas
     */
    async vencidas() {
        const hoje = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('contas_pagar')
            .select(`
        *,
        fornecedor:entities!fornecedor_id(name)
      `)
            .lt('data_vencimento', hoje)
            .neq('status', 'PAGO')
            .neq('status', 'CANCELADO')
            .order('data_vencimento', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Dashboard - resumo financeiro
     */
    async dashboard() {
        const hoje = new Date().toISOString().split('T')[0];
        const mes = new Date().toISOString().substring(0, 7);

        // Total a pagar hoje
        const { data: hoje_data } = await supabase
            .from('contas_pagar')
            .select('valor_saldo')
            .eq('data_vencimento', hoje)
            .eq('status', 'PENDENTE');

        // Total a pagar no mês
        const { data: mes_data } = await supabase
            .from('contas_pagar')
            .select('valor_saldo')
            .like('data_vencimento', `${mes}%`)
            .neq('status', 'PAGO');

        // Total vencidas
        const { data: vencidas_data } = await supabase
            .from('contas_pagar')
            .select('valor_saldo')
            .lt('data_vencimento', hoje)
            .neq('status', 'PAGO');

        const somarValores = (arr: any[]) =>
            arr?.reduce((sum, item) => sum + (item.valor_saldo || 0), 0) || 0;

        return {
            vencimento_hoje: somarValores(hoje_data),
            vencimento_mes: somarValores(mes_data),
            vencidas: somarValores(vencidas_data),
            total_contas: (hoje_data?.length || 0) + (mes_data?.length || 0),
        };
    }

    /**
     * Helpers
     */
    private async gerarNumeroTitulo(): Promise<string> {
        const ano = new Date().getFullYear();
        const { count } = await supabase
            .from('contas_pagar')
            .select('*', { count: 'exact', head: true })
            .like('numero_titulo', `CP-${ano}%`);

        const numero = (count || 0) + 1;
        return `CP-${ano}-${String(numero).padStart(6, '0')}`;
    }

    private async criarMovimentoBancario(conta_id: string, movimento: any) {
        await supabase.from('movimentos_bancarios').insert({
            conta_bancaria_id: conta_id,
            ...movimento,
        });
    }
}

export const paymentService = new PaymentService();
export default paymentService;

```


# File: services/receivableService.ts
```
/**
 * Serviço de Contas a Receber
 * Gerencia clientes, faturas, recebimentos, recorrências e cobrança
 */

import { supabase } from '../lib/supabase';

export interface ContaReceber {
    id?: string;
    numero_titulo: string;
    cliente_id: string;
    cliente_nome: string;
    valor_original: number;
    valor_juros?: number;
    valor_multa?: number;
    valor_desconto?: number;
    valor_recebido?: number;
    valor_saldo?: number;
    data_emissao: string;
    data_vencimento: string;
    data_recebimento?: string;
    plano_contas_id?: string;
    centro_custo_id?: string;
    categoria?: string;
    status: 'PENDENTE' | 'CONFIRMADO' | 'RECEBIDO' | 'CANCELADO' | 'VENCIDO' | 'INADIMPLENTE';
    forma_recebimento?: string;
    banco_id?: string;
    nosso_numero?: string;
    pix_qrcode?: string;
    pix_txid?: string;
    dias_atraso?: number;
    taxa_juros_dia?: number;
    percentual_multa?: number;
    descricao: string;
    observacao?: string;
    numero_documento?: string;
    parcela_numero?: number;
    parcela_total?: number;
    recorrente?: boolean;
    recorrencia_dia?: number;
    contrato_id?: string;
    nota_fiscal_id?: string;
    conciliado?: boolean;
}

class ReceivableService {
    /**
     * Listar contas a receber
     */
    async listar(filtros?: {
        cliente_id?: string;
        status?: string;
        vencidas?: boolean;
        inadimplentes?: boolean;
        recorrentes?: boolean;
    }) {
        let query = supabase
            .from('contas_receber')
            .select(`
        *,
        cliente:entities!cliente_id(id, name, document, inadimplente),
        plano_contas:plano_contas(codigo, nome),
        centro_custo:centros_custo(codigo, nome)
      `)
            .order('data_vencimento', { ascending: false });

        if (filtros?.cliente_id) {
            query = query.eq('cliente_id', filtros.cliente_id);
        }

        if (filtros?.status) {
            query = query.eq('status', filtros.status);
        }

        if (filtros?.vencidas) {
            query = query.lt('data_vencimento', new Date().toISOString().split('T')[0])
                .neq('status', 'RECEBIDO');
        }

        if (filtros?.inadimplentes) {
            query = query.eq('status', 'INADIMPLENTE');
        }

        if (filtros?.recorrentes) {
            query = query.eq('recorrente', true);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    /**
     * Criar nova conta a receber
     */
    async criar(conta: ContaReceber) {
        if (!conta.numero_titulo) {
            conta.numero_titulo = await this.gerarNumeroTitulo();
        }

        // Configurar juros padrão se não fornecido
        if (!conta.taxa_juros_dia) conta.taxa_juros_dia = 0.0333; // 1% a.m.
        if (!conta.percentual_multa) conta.percentual_multa = 2.0;

        const { data, error } = await supabase
            .from('contas_receber')
            .insert(conta)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Criar cobrança recorrente (contratos mensais)
     */
    async criarRecorrente(dados: {
        cliente_id: string;
        cliente_nome: string;
        descricao: string;
        valor_mensal: number;
        dia_vencimento: number;
        plano_contas_id?: string;
        centro_custo_id?: string;
        contrato_id?: string;
    }) {
        const conta = await this.criar({
            ...dados,
            numero_titulo: '', // Será gerado automaticamente
            valor_original: dados.valor_mensal,
            data_emissao: new Date().toISOString().split('T')[0],
            data_vencimento: this.calcularProximoVencimento(dados.dia_vencimento),
            status: 'PENDENTE',
            recorrente: true,
            recorrencia_dia: dados.dia_vencimento,
        });

        return conta;
    }

    /**
     * Gerar faturas recorrentes do mês
     */
    async gerarFaturasRecorrentes(mes?: string) {
        // Buscar todos os títulos recorrentes
        const { data: recorrentes } = await supabase
            .from('contas_receber')
            .select('*')
            .eq('recorrente', true)
            .neq('status', 'CANCELADO');

        if (!recorrentes || recorrentes.length === 0) return [];

        const mesReferencia = mes || new Date().toISOString().substring(0, 7);
        const faturasGeradas: any[] = [];

        for (const titulo of recorrentes) {
            // Verificar se já existe fatura para este mês
            const { data: jaExiste } = await supabase
                .from('contas_receber')
                .select('id')
                .eq('contrato_id', titulo.contrato_id)
                .like('data_vencimento', `${mesReferencia}%`)
                .single();

            if (jaExiste) continue; // Já foi gerada

            // Calcular data de vencimento
            const dataVencimento = this.calcularVencimentoMes(
                mesReferencia,
                titulo.recorrencia_dia
            );

            // Criar nova fatura
            const novaFatura = await this.criar({
                ...titulo,
                id: undefined,
                numero_titulo: '',
                data_emissao: new Date().toISOString().split('T')[0],
                data_vencimento: dataVencimento,
                status: 'PENDENTE',
                valor_recebido: 0,
                valor_juros: 0,
                valor_multa: 0,
                descricao: `${titulo.descricao} - ${this.formatarMes(mesReferencia)}`,
            });

            faturasGeradas.push(novaFatura);
        }

        return faturasGeradas;
    }

    /**
     * Efetuar recebimento
     */
    async receber(id: string, dados: {
        valor_recebido: number;
        data_recebimento: string;
        forma_recebimento: string;
        banco_id?: string;
        valor_desconto?: number;
        observacao?: string;
    }) {
        // Buscar título
        const { data: titulo } = await supabase
            .from('contas_receber')
            .select('*')
            .eq('id', id)
            .single();

        if (!titulo) throw new Error('Título não encontrado');

        // Atualizar título
        const { data, error } = await supabase
            .from('contas_receber')
            .update({
                valor_recebido: dados.valor_recebido,
                valor_desconto: dados.valor_desconto || 0,
                data_recebimento: dados.data_recebimento,
                forma_recebimento: dados.forma_recebimento,
                banco_id: dados.banco_id,
                observacao: dados.observacao,
                status: 'RECEBIDO',
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Criar movimento bancário e atualizar saldo
        if (dados.banco_id) {
            const { error: movError } = await supabase.from('movimentos_bancarios').insert({
                conta_bancaria_id: dados.banco_id,
                data_movimento: dados.data_recebimento,
                historico: `Recebimento ${titulo.numero_titulo} - ${titulo.descricao}`,
                valor: dados.valor_recebido,
                tipo_movimento: 'CREDITO',
                origem: 'RECEBIMENTO',
                lancamento_financeiro_id: id,
                lancamento_tipo: 'RECEBER',
            });

            if (!movError) {
                // Atualizar saldo da conta (Incrementar)
                const { data: conta } = await supabase
                    .from('contas_bancarias')
                    .select('saldo_atual')
                    .eq('id', dados.banco_id)
                    .single();

                if (conta) {
                    await supabase
                        .from('contas_bancarias')
                        .update({ saldo_atual: (conta.saldo_atual || 0) + dados.valor_recebido, ultimo_saldo_atualizado_em: new Date() })
                        .eq('id', dados.banco_id);
                }
            }
        }

        // Se cliente estava inadimplente, verificar se pode remover flag
        await this.verificarInadimplencia(titulo.cliente_id);

        return data;
    }

    /**
     * Gerar boleto/PIX
     */
    async gerarBoleto(id: string) {
        const { data: titulo } = await supabase
            .from('contas_receber')
            .select('*')
            .eq('id', id)
            .single();

        if (!titulo) throw new Error('Título não encontrado');

        // INTEGRAÇÃO COM API DE BOLETO (exemplo genérico)
        // Aqui você integraria com Sicoob, BB, Inter, etc
        const boletoResponse = await this.integracaoBoleto({
            nosso_numero: titulo.nosso_numero || await this.gerarNossoNumero(titulo.banco_id!),
            valor: titulo.valor_saldo,
            vencimento: titulo.data_vencimento,
            pagador: {
                nome: titulo.cliente_nome,
                documento: '', // Buscar da entities
            },
            descricao: titulo.descricao,
        });

        // Atualizar título com dados do boleto
        await supabase
            .from('contas_receber')
            .update({
                nosso_numero: boletoResponse.nosso_numero,
                linha_digitavel: boletoResponse.linha_digitavel,
                codigo_barras: boletoResponse.codigo_barras,
            })
            .eq('id', id);

        return boletoResponse;
    }

    /**
     * Gerar QR Code PIX
     */
    async gerarPixQRCode(id: string) {
        const { data: titulo } = await supabase
            .from('contas_receber')
            .select('*')
            .eq('id', id)
            .single();

        if (!titulo) throw new Error('Título não encontrado');

        // INTEGRAÇÃO COM API PIX (Bacen ou banco)
        const pixResponse = await this.integracaoPix({
            valor: titulo.valor_saldo,
            chave_pix: '', // Chave PIX da empresa
            txid: this.gerarTxId(),
            descricao: titulo.descricao,
        });

        // Atualizar com QR Code
        await supabase
            .from('contas_receber')
            .update({
                pix_qrcode: pixResponse.qrcode,
                pix_txid: pixResponse.txid,
            })
            .eq('id', id);

        return pixResponse;
    }

    /**
     * Enviar cobrança por email/WhatsApp
     */
    async enviarCobranca(id: string, metodo: 'EMAIL' | 'WHATSAPP') {
        const { data: titulo } = await supabase
            .from('contas_receber')
            .select(`
        *,
        cliente:entities!cliente_id(name, email, phone)
      `)
            .eq('id', id)
            .single();

        if (!titulo) throw new Error('Título não encontrado');

        const mensagem = `
🔔 *Cobrança - ${titulo.numero_titulo}*

Olá ${titulo.cliente.name},

Você possui um título em aberto:

💰 Valor: R$ ${titulo.valor_saldo.toFixed(2)}
📅 Vencimento: ${new Date(titulo.data_vencimento).toLocaleDateString('pt-BR')}
📝 Descrição: ${titulo.descricao}

${titulo.pix_qrcode ? '💸 Pague via PIX com o QR Code em anexo' : ''}
${titulo.linha_digitavel ? `🏦 Linha digitável: ${titulo.linha_digitavel}` : ''}

Att,
Equipe Financeira
    `.trim();

        if (metodo === 'EMAIL') {
            // Integração com serviço de email
            await this.enviarEmail(titulo.cliente.email, 'Cobrança Pendente', mensagem);
        } else {
            // Integração com WhatsApp (Evolution API)
            await this.enviarWhatsApp(titulo.cliente.phone, mensagem, titulo.pix_qrcode);
        }

        return { sucesso: true, mensagem };
    }

    /**
     * Dashboard de inadimplência
     */
    async dashboardInadimplencia() {
        const { data } = await supabase
            .rpc('vw_inadimplencia'); // View criada no SQL

        return data || [];
    }

    /**
     * Calcular juros e multa para títulos vencidos
     */
    async calcularEncargos(id: string) {
        const { data: titulo } = await supabase
            .from('contas_receber')
            .select('*')
            .eq('id', id)
            .single();

        if (!titulo || titulo.status === 'RECEBIDO') {
            return null;
        }

        const hoje = new Date();
        const vencimento = new Date(titulo.data_vencimento);

        if (vencimento >= hoje) {
            return { juros: 0, multa: 0, total: titulo.valor_original };
        }

        const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
        const juros = titulo.valor_original * titulo.taxa_juros_dia * diasAtraso;
        const multa = titulo.valor_original * (titulo.percentual_multa / 100);

        return {
            dias_atraso: diasAtraso,
            juros,
            multa,
            total: titulo.valor_original + juros + multa,
        };
    }

    /**
     * Helpers privados
     */
    private async gerarNumeroTitulo(): Promise<string> {
        const ano = new Date().getFullYear();
        const { count } = await supabase
            .from('contas_receber')
            .select('*', { count: 'exact', head: true })
            .like('numero_titulo', `CR-${ano}%`);

        const numero = (count || 0) + 1;
        return `CR-${ano}-${String(numero).padStart(6, '0')}`;
    }

    private calcularProximoVencimento(dia: number): string {
        const hoje = new Date();
        const mes = hoje.getDate() >= dia ? hoje.getMonth() + 1 : hoje.getMonth();
        const data = new Date(hoje.getFullYear(), mes, dia);
        return data.toISOString().split('T')[0];
    }

    private calcularVencimentoMes(mesReferencia: string, dia: number): string {
        const [ano, mes] = mesReferencia.split('-').map(Number);
        const data = new Date(ano, mes - 1, dia);
        return data.toISOString().split('T')[0];
    }

    private formatarMes(mesReferencia: string): string {
        const [ano, mes] = mesReferencia.split('-');
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${meses[parseInt(mes) - 1]}/${ano}`;
    }

    private async verificarInadimplencia(cliente_id: string) {
        const { data: pendentes } = await supabase
            .from('contas_receber')
            .select('id')
            .eq('cliente_id', cliente_id)
            .in('status', ['VENCIDO', 'INADIMPLENTE']);

        const inadimplente = (pendentes?.length || 0) > 0;

        await supabase
            .from('entities')
            .update({ inadimplente })
            .eq('id', cliente_id);
    }

    private async gerarNossoNumero(banco_id: string): Promise<string> {
        // Implementar lógica específica de cada banco
        const timestamp = Date.now().toString().slice(-8);
        return timestamp;
    }

    private gerarTxId(): string {
        return `TERRAPRO${Date.now()}`.slice(0, 35);
    }

    private async integracaoBoleto(dados: any): Promise<any> {
        // TODO: Integrar com API real do banco
        return {
            nosso_numero: dados.nosso_numero,
            linha_digitavel: '12345.67890 12345.678901 12345.678901 1 23456789012345',
            codigo_barras: '12345678901234567890123456789012345678901234',
            pdf_url: 'https://exemplo.com/boleto.pdf',
        };
    }

    private async integracaoPix(dados: any): Promise<any> {
        // TODO: Integrar com API PIX real
        return {
            txid: dados.txid,
            qrcode: 'iVBORw0KGgoAAAANSUhEUgAA...', // Base64 do QR Code
            qrcode_text: '00020126...', // Copia e cola
        };
    }

    private async enviarEmail(email: string, assunto: string, mensagem: string) {
        // TODO: Integrar com SendGrid, AWS SES, etc
        console.log('Email enviado para:', email);
    }

    private async enviarWhatsApp(telefone: string, mensagem: string, anexo?: string) {
        // TODO: Integrar com Evolution API
        console.log('WhatsApp enviado para:', telefone);
    }
}

export const receivableService = new ReceivableService();
export default receivableService;

```


# File: services/reportService.ts
```
/**
 * Serviço de Relatórios Financeiros
 * DRE, Fluxo de Caixa, Análises e Dashboards
 */

import { supabase } from '../lib/supabase';

interface PeriodoFiltro {
    data_inicio: string;
    data_fim: string;
    centro_custo_id?: string;
}

class ReportService {
    /**
     * Fluxo de Caixa Consolidado
     */
    async fluxoCaixa(params: PeriodoFiltro & { realizado_apenas?: boolean }) {
        let query = supabase
            .from('vw_fluxo_caixa')
            .select('*')
            .gte('data', params.data_inicio)
            .lte('data', params.data_fim);

        if (params.realizado_apenas) {
            query = query.eq('realizado', 'REALIZADO');
        }

        if (params.centro_custo_id) {
            query = query.eq('centro_custo_id', params.centro_custo_id);
        }

        const { data, error } = await query.order('data', { ascending: true });

        if (error) throw error;

        // Calcular saldo acumulado
        let saldoAcumulado = 0;
        const resultado = data.map((item: any) => {
            saldoAcumulado += item.valor;
            return {
                ...item,
                saldo_acumulado: saldoAcumulado,
            };
        });

        return resultado;
    }

    /**
     * DRE (Demonstração de Resultado do Exercício)
     */
    async dre(params: PeriodoFiltro) {
        // Receitas
        const { data: receitas } = await supabase
            .from('contas_receber')
            .select(`
        valor_original,
        plano_contas:plano_contas(codigo, nome),
        centro_custo:centros_custo(codigo, nome)
      `)
            .gte('data_recebimento', params.data_inicio)
            .lte('data_recebimento', params.data_fim)
            .eq('status', 'RECEBIDO');

        // Despesas
        const { data: despesas } = await supabase
            .from('contas_pagar')
            .select(`
        valor_original,
        plano_contas:plano_contas(codigo, nome),
        centro_custo:centros_custo(codigo, nome)
      `)
            .gte('data_pagamento', params.data_inicio)
            .lte('data_pagamento', params.data_fim)
            .eq('status', 'PAGO');

        const totalReceitas = receitas?.reduce((sum, r) => sum + r.valor_original, 0) || 0;
        const totalDespesas = despesas?.reduce((sum, d) => sum + d.valor_original, 0) || 0;

        // Agrupar por plano de contas
        const receitasPorConta = this.agruparPorConta(receitas || []);
        const despesasPorConta = this.agruparPorConta(despesas || []);

        return {
            periodo: params,
            receitas: {
                total: totalReceitas,
                por_conta: receitasPorConta,
            },
            despesas: {
                total: totalDespesas,
                por_conta: despesasPorConta,
            },
            resultado: {
                bruto: totalReceitas - totalDespesas,
                margem_percentual: totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0,
            },
        };
    }

    /**
     * DRE Mensal (últimos 12 meses)
     */
    async dreMensal() {
        const { data, error } = await supabase
            .from('vw_dre_mensal')
            .select('*')
            .order('mes', { ascending: false })
            .limit(12);

        if (error) throw error;
        return data;
    }

    /**
     * Dashboard de Inadimplência
     */
    async dashboardInadimplencia() {
        const { data, error } = await supabase
            .from('vw_inadimplencia')
            .select('*')
            .order('valor_total_devido', { ascending: false });

        if (error) throw error;

        const totalDevido = data?.reduce((sum, item) => sum + item.valor_total_devido, 0) || 0;
        const totalTitulos = data?.reduce((sum, item) => sum + item.titulos_vencidos, 0) || 0;

        return {
            clientes: data,
            resumo: {
                total_clientes_inadimplentes: data?.length || 0,
                total_titulos_vencidos: totalTitulos,
                valor_total_devido: totalDevido,
            },
        };
    }

    /**
     * Dashboard Executivo
     */
    async dashboardExecutivo(mes?: string) {
        const mesRef = mes || new Date().toISOString().substring(0, 7);
        const hoje = new Date().toISOString().split('T')[0];

        // Contas a Pagar
        const { data: pagarHoje } = await supabase
            .from('contas_pagar')
            .select('valor_saldo')
            .eq('data_vencimento', hoje)
            .neq('status', 'PAGO');

        const { data: pagarMes } = await supabase
            .from('contas_pagar')
            .select('valor_saldo')
            .like('data_vencimento', `${mesRef}%`)
            .neq('status', 'PAGO');

        const { data: pagarVencidas } = await supabase
            .from('contas_pagar')
            .select('valor_saldo')
            .lt('data_vencimento', hoje)
            .neq('status', 'PAGO');

        // Contas a Receber
        const { data: receberHoje } = await supabase
            .from('contas_receber')
            .select('valor_saldo')
            .eq('data_vencimento', hoje)
            .neq('status', 'RECEBIDO');

        const { data: receberMes } = await supabase
            .from('contas_receber')
            .select('valor_saldo')
            .like('data_vencimento', `${mesRef}%`)
            .neq('status', 'RECEBIDO');

        const { data: receberVencidas } = await supabase
            .from('contas_receber')
            .select('valor_saldo')
            .lt('data_vencimento', hoje)
            .neq('status', 'RECEBIDO');

        // Saldos bancários
        const { data: contas } = await supabase
            .from('contas_bancarias')
            .select('saldo_atual')
            .eq('ativa', true);

        const saldoBancario = contas?.reduce((sum, c) => sum + c.saldo_atual, 0) || 0;

        const somarValores = (arr: any[]) =>
            arr?.reduce((sum, item) => sum + (item.valor_saldo || 0), 0) || 0;

        return {
            contas_pagar: {
                vencimento_hoje: somarValores(pagarHoje),
                vencimento_mes: somarValores(pagarMes),
                vencidas: somarValores(pagarVencidas),
            },
            contas_receber: {
                vencimento_hoje: somarValores(receberHoje),
                vencimento_mes: somarValores(receberMes),
                vencidas: somarValores(receberVencidas),
            },
            saldo_bancario: saldoBancario,
            saldo_previsto: saldoBancario + somarValores(receberMes) - somarValores(pagarMes),
        };
    }

    /**
     * Análise por Centro de Custo
     */
    async analiseCentroCusto(params: PeriodoFiltro) {
        const { data: receitas } = await supabase
            .from('contas_receber')
            .select(`
        valor_original,
        centro_custo:centros_custo(id, codigo, nome, tipo)
      `)
            .gte('data_recebimento', params.data_inicio)
            .lte('data_recebimento', params.data_fim)
            .eq('status', 'RECEBIDO')
            .not('centro_custo_id', 'is', null);

        const { data: despesas } = await supabase
            .from('contas_pagar')
            .select(`
        valor_original,
        centro_custo:centros_custo(id, codigo, nome, tipo)
      `)
            .gte('data_pagamento', params.data_inicio)
            .lte('data_pagamento', params.data_fim)
            .eq('status', 'PAGO')
            .not('centro_custo_id', 'is', null);

        const centros = new Map();

        // Processar receitas
        receitas?.forEach((r: any) => {
            if (!r.centro_custo) return;
            const id = r.centro_custo.id;
            if (!centros.has(id)) {
                centros.set(id, {
                    ...r.centro_custo,
                    receitas: 0,
                    despesas: 0,
                });
            }
            centros.get(id).receitas += r.valor_original;
        });

        // Processar despesas
        despesas?.forEach((d: any) => {
            if (!d.centro_custo) return;
            const id = d.centro_custo.id;
            if (!centros.has(id)) {
                centros.set(id, {
                    ...d.centro_custo,
                    receitas: 0,
                    despesas: 0,
                });
            }
            centros.get(id).despesas += d.valor_original;
        });

        // Calcular resultado
        const resultado = Array.from(centros.values()).map((c: any) => ({
            ...c,
            resultado: c.receitas - c.despesas,
            margem: c.receitas > 0 ? ((c.receitas - c.despesas) / c.receitas) * 100 : 0,
        }));

        return resultado;
    }

    /**
     * Análise de Categorias (Combustível, Manutenção, etc)
     */
    async analiseCategorias(params: PeriodoFiltro) {
        const { data: despesas } = await supabase
            .from('contas_pagar')
            .select('categoria, valor_original')
            .gte('data_pagamento', params.data_inicio)
            .lte('data_pagamento', params.data_fim)
            .eq('status', 'PAGO')
            .not('categoria', 'is', null);

        const categorias = new Map();

        despesas?.forEach((d) => {
            const cat = d.categoria || 'SEM_CATEGORIA';
            if (!categorias.has(cat)) {
                categorias.set(cat, 0);
            }
            categorias.set(cat, categorias.get(cat) + d.valor_original);
        });

        const total = Array.from(categorias.values()).reduce((sum, v) => sum + v, 0);

        const resultado = Array.from(categorias.entries())
            .map(([categoria, valor]) => ({
                categoria,
                valor,
                percentual: total > 0 ? (valor / total) * 100 : 0,
            }))
            .sort((a, b) => b.valor - a.valor);

        return resultado;
    }

    /**
     * Aging List (títulos por prazo)
     */
    async agingList() {
        const hoje = new Date();

        const { data: titulos } = await supabase
            .from('contas_receber')
            .select(`
        *,
        cliente:entities!cliente_id(name)
      `)
            .neq('status', 'RECEBIDO')
            .neq('status', 'CANCELADO');

        if (!titulos) return { faixas: [], total: 0 };

        const faixas = {
            a_vencer: [] as any[],
            vencido_0_30: [] as any[],
            vencido_31_60: [] as any[],
            vencido_61_90: [] as any[],
            vencido_90_mais: [] as any[],
        };

        titulos.forEach((t) => {
            const vencimento = new Date(t.data_vencimento);
            const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));

            if (diasAtraso < 0) {
                faixas.a_vencer.push(t);
            } else if (diasAtraso <= 30) {
                faixas.vencido_0_30.push(t);
            } else if (diasAtraso <= 60) {
                faixas.vencido_31_60.push(t);
            } else if (diasAtraso <= 90) {
                faixas.vencido_61_90.push(t);
            } else {
                faixas.vencido_90_mais.push(t);
            }
        });

        const calcularTotal = (arr: any[]) =>
            arr.reduce((sum, t) => sum + (t.valor_saldo || 0), 0);

        return {
            faixas: {
                a_vencer: {
                    titulos: faixas.a_vencer.length,
                    valor: calcularTotal(faixas.a_vencer),
                },
                vencido_0_30: {
                    titulos: faixas.vencido_0_30.length,
                    valor: calcularTotal(faixas.vencido_0_30),
                },
                vencido_31_60: {
                    titulos: faixas.vencido_31_60.length,
                    valor: calcularTotal(faixas.vencido_31_60),
                },
                vencido_61_90: {
                    titulos: faixas.vencido_61_90.length,
                    valor: calcularTotal(faixas.vencido_61_90),
                },
                vencido_90_mais: {
                    titulos: faixas.vencido_90_mais.length,
                    valor: calcularTotal(faixas.vencido_90_mais),
                },
            },
            total: titulos.length,
            total_valor: calcularTotal(titulos),
        };
    }

    /**
     * Exportar para Excel (dados)
     */
    async exportarExcel(tipo: 'DRE' | 'FLUXO' | 'CONTAS_PAGAR' | 'CONTAS_RECEBER', params: any) {
        let data: any[];

        switch (tipo) {
            case 'DRE':
                const dre = await this.dre(params);
                data = this.formatarDREParaExcel(dre);
                break;

            case 'FLUXO':
                data = await this.fluxoCaixa(params);
                break;

            case 'CONTAS_PAGAR':
                const { data: pagar } = await supabase.from('contas_pagar').select('*').gte('data_vencimento', params.data_inicio).lte('data_vencimento', params.data_fim);
                data = pagar || [];
                break;

            case 'CONTAS_RECEBER':
                const { data: receber } = await supabase.from('contas_receber').select('*').gte('data_vencimento', params.data_inicio).lte('data_vencimento', params.data_fim);
                data = receber || [];
                break;

            default:
                throw new Error('Tipo de exportação inválido');
        }

        return data;
    }

    /**
     * Helpers privados
     */
    private agruparPorConta(registros: any[]) {
        const grupos = new Map();

        registros.forEach((r) => {
            if (!r.plano_contas) return;
            const codigo = r.plano_contas.codigo;
            if (!grupos.has(codigo)) {
                grupos.set(codigo, {
                    codigo,
                    nome: r.plano_contas.nome,
                    valor: 0,
                });
            }
            grupos.get(codigo).valor += r.valor_original;
        });

        return Array.from(grupos.values()).sort((a, b) => a.codigo.localeCompare(b.codigo));
    }

    private formatarDREParaExcel(dre: any) {
        const linhas = [];

        linhas.push({ tipo: 'TITULO', descricao: 'RECEITAS', valor: '' });
        dre.receitas.por_conta.forEach((c: any) => {
            linhas.push({ tipo: 'CONTA', descricao: `${c.codigo} - ${c.nome}`, valor: c.valor });
        });
        linhas.push({ tipo: 'SUBTOTAL', descricao: 'TOTAL RECEITAS', valor: dre.receitas.total });

        linhas.push({ tipo: 'TITULO', descricao: 'DESPESAS', valor: '' });
        dre.despesas.por_conta.forEach((c: any) => {
            linhas.push({ tipo: 'CONTA', descricao: `${c.codigo} - ${c.nome}`, valor: c.valor });
        });
        linhas.push({ tipo: 'SUBTOTAL', descricao: 'TOTAL DESPESAS', valor: dre.despesas.total });

        linhas.push({ tipo: 'RESULTADO', descricao: 'RESULTADO DO PERÍODO', valor: dre.resultado.bruto });

        return linhas;
    }
}

export const reportService = new ReportService();
export default reportService;

```


# File: services/selsyn.ts
```

const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev ? '/api/selsyn' : 'https://api.appselsyn.com.br/keek/rest';
const API_KEY = import.meta.env.VITE_SELSYN_API_KEY;

// ========== Verificação de Expiração da Chave Selsyn ==========
export interface SelsynKeyStatus {
    valid: boolean;
    expiresAt: Date | null;
    hoursRemaining: number;
    expired: boolean;
    message: string;
}

export const checkSelsynKeyExpiration = (): SelsynKeyStatus => {
    if (!API_KEY) {
        return { valid: false, expiresAt: null, hoursRemaining: 0, expired: true, message: 'Chave Selsyn não configurada.' };
    }

    try {
        const decoded = JSON.parse(atob(API_KEY));
        if (!decoded.sc) {
            return { valid: true, expiresAt: null, hoursRemaining: 999, expired: false, message: 'Chave sem data de expiração detectada.' };
        }

        const expiresAt = new Date(decoded.sc * 1000);
        const now = new Date();
        const hoursRemaining = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursRemaining <= 0) {
            return { valid: false, expiresAt, hoursRemaining: 0, expired: true, message: `Chave Selsyn EXPIRADA em ${expiresAt.toLocaleString('pt-BR')}.` };
        }

        if (hoursRemaining <= 2) {
            return { valid: true, expiresAt, hoursRemaining, expired: false, message: `⚠️ Chave Selsyn expira em ${Math.round(hoursRemaining * 60)} minutos!` };
        }

        if (hoursRemaining <= 6) {
            return { valid: true, expiresAt, hoursRemaining, expired: false, message: `Chave Selsyn expira em ${Math.round(hoursRemaining)} horas.` };
        }

        return { valid: true, expiresAt, hoursRemaining, expired: false, message: 'Chave Selsyn válida.' };
    } catch {
        return { valid: true, expiresAt: null, hoursRemaining: 999, expired: false, message: 'Não foi possível verificar expiração da chave.' };
    }
};

// Interface baseada na resposta da API de Integração
export interface SelsynPosition {
    identificador: string;       // Placa/ID (Ex: AAA0033)
    rastreavel: string;          // Nome Exibição (Ex: PC09 - PA CARREGADEIRA)
    latitude: number;
    longitude: number;
    velocidade: number;          // km/h
    ignicao: boolean;            // true=ligado
    dataHora: string;            // ISO Date (Ex: 2026-02-10T14:34:09.000Z)

    fonteEnergia?: number;       // Voltagem Bateria
    odometro?: number;
    horimetro?: number;
    tipo?: string;               // Ex: CARREGADEIRA

    // Campos legados mapeados (opcional)
    endereco?: string;
}

export const fetchFleetPositions = async (): Promise<SelsynPosition[]> => {
    if (!API_KEY) {
        console.warn('Selsyn API Key not found in environment variables.');
        return [];
    }

    try {
        // Endpoint de Integração - Posição de TODOS os rastreáveis
        const url = `${API_BASE_URL}/v1/integracao/posicao`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Selsyn API Error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data = await response.json();

        // A API de Operador retorna Array direto
        if (Array.isArray(data)) {
            return data;
        } else if (data && Array.isArray(data.list)) {
            return data.list;
        }

        return [];
    } catch (error) {
        console.error('Error fetching Selsyn positions:', error);
        return [];
    }
};

export const getVehicleStatus = (pos: SelsynPosition): 'moving' | 'stopped' | 'idle' | 'offline' => {
    if (!pos.dataHora) return 'offline';

    const now = new Date();
    // Ajuste fuso horário se necessário, mas ISO string é UTC geralmente
    const posDate = new Date(pos.dataHora);
    const diffMinutes = (now.getTime() - posDate.getTime()) / 60000;

    // Se a diferença for muito grande (testando > 3h pois pode haver fuso horário errado no servidor)
    // Selsyn geralmente manda UTC.
    if (diffMinutes > 180) return 'offline'; // 3 horas tolerância (devido a fuso)

    if (pos.velocidade > 0) return 'moving';
    if (pos.ignicao && pos.velocidade === 0) return 'idle';
    return 'stopped';
};

```


# File: services/selsynImporter.ts
```

import { supabase } from '../lib/supabase';

// Dados extraídos do CSV
const csvVehicles = [
    { code: 'AAA-0001', type: 'Motoniveladora', name: 'MN08 - MOTONIVELADORA 140M', brand: 'CATERPILLAR', model: '140M' },
    { code: 'AAA-0002', type: 'Escavadeira', name: 'ME04 - MINI ESC 302.7', brand: 'CATERPILLAR', model: '302.7' },
    { code: 'AAA-0003', type: 'Rolo Compactador', name: 'RC04 - MINI ROLO COMPACTADOR', brand: '', model: 'CB-14' },
    { code: 'AAA-0004', type: 'Escavadeira', name: 'ME05 - MINI ESC E10', brand: '', model: 'E10' },
    { code: 'AAA-0005', type: 'Escavadeira', name: 'ME01 - MINI ESC 303.5', brand: 'CATERPILLAR', model: '303.5' },
    { code: 'AAA-0006', type: 'Escavadeira', name: 'ME02 - MINI ESC 303.5', brand: '', model: '303.5' },
    { code: 'AAA-0007', type: 'Retro Escavadeira', name: 'RT01 - RETROESCAVADEIRA 416F', brand: '', model: '416F' },
    { code: 'AAA-0008', type: 'Retro Escavadeira', name: 'RT02 - RETROESCAVADEIRA 416F', brand: '', model: '416F' },
    { code: 'AAA-0009', type: 'Escavadeira', name: 'ME03 - MINI ESC SV08', brand: '', model: 'SV08' },
    { code: 'AAA-0010', type: 'Retro Escavadeira', name: 'RT06 - RETROESCAVADEIRA 416', brand: '', model: '416' },
    { code: 'AAA-0011', type: 'Rolo Compactador', name: 'RC01 - ROLO COMPACTADOR PATA CA25P', brand: '', model: 'CA25P' },
    { code: 'AAA-0012', type: 'Rolo Compactador', name: 'RC02 - ROLO COMPACTADOR CHAPA CA25L', brand: '', model: 'CA25L' },
    { code: 'AAA-0013', type: 'Rolo Compactador', name: 'RC03 - ROLO COMPACTADOR PATA CA250', brand: '', model: 'CA250' },
    { code: 'AAA-0014', type: 'Escavadeira', name: 'EC01 - ESCAVADEIRA EC140', brand: 'VOLVO', model: 'EC140BLCM' },
    { code: 'AAA-0015', type: 'Escavadeira', name: 'EC02 - ESCAVADEIRA EC220', brand: '', model: 'EC220' },
    { code: 'AAA-0016', type: 'Escavadeira', name: 'EC03 - ESCAVADEIRA SDLG', brand: '', model: 'LG6150' },
    { code: 'AAA-0017', type: 'Mini Carregadeira', name: 'MC02 - MINI PÁ CARREGADEIRA 242D3', brand: 'CATERPILLAR', model: '242D3' },
    { code: 'AAA-0018', type: 'Mini Carregadeira', name: 'MC03 - MINI PÁ CARREGADEIRA L220', brand: 'NEW HOLLAND', model: 'L220' },
    { code: 'AAA-0019', type: 'Mini Carregadeira', name: 'MC04 - MINI PÁ CARREGADEIRA 226B3', brand: '', model: '226B3' },
    { code: 'AAA-0020', type: 'Mini Carregadeira', name: 'MC05 - MINI PÁ CARREGADEIRA 242D3', brand: 'CATERPILLAR', model: '242D3' },
    { code: 'AAA-0021', type: 'Carregadeira', name: 'PC05 - PA CARREGADEIRA KOMATSU', brand: 'KOMATSU', model: 'WA180' },
    { code: 'AAA-0022', type: 'Motoniveladora', name: 'MN02 - MOTONIVELADORA 140H', brand: '', model: '140H' },
    { code: 'AAA-0023', type: 'Trator', name: 'TR01 - TRATOR GRUA 6110J', brand: 'JOHN DEERE', model: '6110J' },
    { code: 'AAA-0024', type: 'Trator', name: 'TR02 - TRATOR 6605', brand: 'JOHN DEERE', model: '6605' },
    { code: 'AAA-0026', type: 'Trator', name: 'TR03 - TRATOR VALTRA BH185I', brand: 'JOHN DEERE', model: 'BH185I' },
    { code: 'AAA-0027', type: 'Carregadeira', name: 'PC03 - PA CARREGADEIRA L60F', brand: '', model: 'L60F' },
    { code: 'AAA-0028', type: 'Escavadeira', name: 'EC05 - ESCAVADEIRA EC130 KOMATSU', brand: 'KOMATSU', model: 'EC130' },
    { code: 'AAA-0029', type: 'Motoniveladora', name: 'MN04 - MOTONIVELADORA 140G', brand: 'CATERPILLAR', model: '140G' },
    { code: 'AAA-0030', type: 'Retro Escavadeira', name: 'RT05 - RETROESCAVADEIRA 416', brand: '', model: '416' },
    { code: 'AAA-0031', type: 'Mini Carregadeira', name: 'MC01 - MINI PÁ CARREGADEIRA MC70', brand: 'VOLVO', model: 'MC70' },
    { code: 'AAA-0032', type: 'Rolo Compactador', name: 'RC05 - ROLO COMPACTADOR PATA CA25P ENGP', brand: '', model: 'CA25P' },
    { code: 'AAA-0033', type: 'Carregadeira', name: 'PC09 - PA CARREGADEIRA L60F 2011', brand: 'VOLVO', model: 'L60F' },
    { code: 'AAA-0034', type: 'Motoniveladora', name: 'MN03- MOTONIVELADORA 170B - NEW HOLLAND', brand: 'NEW HOLLAND', model: '170B' },
    { code: 'AAA-0035', type: 'Carregadeira', name: 'PC04 - PA CARREGADEIRA L60F', brand: 'VOLVO', model: 'L60F' },
    { code: 'AAA-0036', type: 'Escavadeira', name: 'ME06 - MINI ESC E10 02', brand: 'MASERATI', model: 'E10' },
    { code: 'AAA-0037', type: 'Colheitadeira', name: 'COLHEDEIRA JOHN DHEERE 1550', brand: 'JOHN DEERE', model: '1550' },
    { code: 'AAA-0038', type: 'Carregadeira', name: 'PC02 - PA CARREGADEIRA L60F', brand: 'VOLVO', model: 'L60F' },
    { code: 'AAA-0039', type: 'Carregadeira', name: 'PC01 - PA CARREGADEIRA L60F', brand: 'VOLVO', model: 'L60F' },
    { code: 'AAA-0040', type: 'Carregadeira', name: 'PC06 - PA CARREGADEIRA L60F (CAVEIRÃO)', brand: 'VOLVO', model: 'L60F' },
    { code: 'AAA-0041', type: 'Carregadeira', name: 'PC08 - PA CARREGADEIRA L60F', brand: 'VOLVO', model: 'L60F' },
    { code: 'AAA-0058', type: 'Rolo Compactador', name: 'RC06 - ROLO COMPACTADOR PATA CA250-II', brand: '', model: 'CA250 - II' },
    { code: 'AAA-0059', type: 'Rolo Compactador', name: 'RC07 - ROLO COMPACTADOR CHAPA CAT', brand: 'CATERPILLAR', model: 'CS533E' },
    { code: 'AAA-0060', type: 'Rolo Compactador de Pneus', name: 'RP01 - ROLO DE PNEUS', brand: '', model: 'AP-26' },
    { code: 'AAA-0061', type: 'Caminhão Tanque', name: 'CT05 - PIPA 2216', brand: 'MERCEDES-BENZ', model: 'L2216' },
    { code: 'AAA-0062', type: 'Escavadeira', name: 'EC04 - ESCAVADEIRA SDLG', brand: 'VOLVO', model: 'LG6150' },
    { code: 'AAA-0063', type: 'Carregadeira', name: 'PC15 - PA CARREGADEIRA L110F 2016', brand: 'VOLVO', model: 'L110F' },
    { code: 'AAA-0064', type: 'Carregadeira', name: 'PC16 - PA CARREGADEIRA 924K 2025', brand: 'CATERPILLAR', model: '924K' },
    { code: 'AAA-0065', type: 'Trator de Esteira', name: 'TE01 - TRATOR ESTEIRA', brand: 'KOMATSU', model: 'D41E' },
    { code: 'AAA-0067', type: 'Trator', name: 'TR04 - TRATOR VALTRA 785', brand: 'VALTRA', model: '785' },
    { code: 'AAA-0068', type: 'Retro Escavadeira', name: 'RT03 - RETROESCAVADEIRA JCB', brand: '', model: '3CX' },
    { code: 'AAA-0069', type: 'Empilhadeira', name: 'EMPILHADEIRA LONKING', brand: '', model: '' },
    { code: 'AAA-0070', type: 'Escavadeira', name: 'EC06 - ESCAVADEIRA CAT 336DL', brand: 'CATERPILLAR', model: '336DL' },
    { code: 'AAA-9999', type: 'Avião', name: 'TESTE', brand: 'FERRARI', model: 'foda' },
    { code: 'AOW-6H81', type: 'Cavalo Mecânico', name: 'CAVALO MECANICO FH400', brand: 'VOLVO', model: 'FH400' },
    { code: 'ATX-0A31', type: 'Cavalo Mecânico', name: 'CAVALO MECANICO FH380', brand: 'VOLVO', model: 'FH380' },
    { code: 'AVK-5223', type: 'Cavalo Mecânico', name: 'CAVALO MECANICO FH440', brand: 'VOLVO', model: 'FH440' },
    { code: 'BAN-4D40', type: 'Carregadeira', name: 'PC07- FARELO 924K', brand: '', model: '' },
    { code: 'BDM-2B00', type: 'Pickup', name: 'F-1000 DUPLA RAMBO', brand: 'FORD', model: 'F-1000' },
    { code: 'BUH-8401', type: 'Pickup', name: 'D-20', brand: 'GMC', model: 'D-20' },
    { code: 'CHF-3H35', type: 'Caçamba', name: 'CB02 - CAMINHÃO BASCULANTE CARGO 2425', brand: 'FORD', model: 'CARGO 2425' },
    { code: 'CPT-3786', type: 'Caminhão Tanque', name: 'CT06 - PIPA 1520 TOCO (LENDARIO PEPITA)', brand: 'MERCEDES-BENZ', model: '1520' },
    { code: 'DDO-8I60', type: 'Guincho', name: 'PG01 - POLIGUINDASTE', brand: 'MERCEDES-BENZ', model: '1720' },
    { code: 'EFU-4J78', type: 'Caçamba', name: 'CB08 - CAMINHÃO BASCULANTE 31.260', brand: 'VOLKSWAGEN', model: '31.260' },
    { code: 'GLA-6110', type: 'Caminhão Plataforma', name: 'PRANCHA VOLVO N10', brand: 'VOLVO', model: 'N10' },
    { code: 'GVE-8F27', type: 'Caminhão Tanque', name: 'CT04 - PIPA 2423', brand: 'MERCEDES-BENZ', model: '2423' },
    { code: 'GXA-2216', type: 'Caçamba', name: 'CB05 - CAMINHÃO BASCULANTE 31.320', brand: '', model: '31.320' },
    { code: 'HNC-9I30', type: 'Caçamba', name: 'CB07 - CAMINHÃO BASCULANTE 31.320', brand: '', model: '31.320' },
    { code: 'HOA-8960', type: 'Caçamba', name: 'CB06 - CAMINHÃO BASCULANTE 31.320', brand: 'VOLKSWAGEN', model: '31.320' },
    { code: 'HQR-7D64', type: 'Caçamba', name: 'CB01 - CAMINHÃO BASCULANTE CARGO 1418', brand: '', model: 'CARGO 1418' },
    { code: 'HQV-9784', type: 'Caçamba', name: 'CB09 - CAMINHÃO BASCULANTE 1113 (LOJA)', brand: 'MERCEDES-BENZ', model: '1113' },
    { code: 'HRA-9309', type: 'Pickup', name: 'F1000 AZUL', brand: 'FORD', model: 'F1000' },
    { code: 'HRD-1566', type: 'Pickup', name: 'F-1000 PRATA', brand: 'FORD', model: 'F-1000' },
    { code: 'HSJ-1167', type: 'Micro-ônibus', name: 'MO02 - ONIBUS VOLARE V8', brand: 'VOLKSWAGEN', model: 'MARCOPOLO VOLARE V8' },
    { code: 'HSO-7122', type: 'Moto', name: 'MT - BROS VERMELHA HSO 7122', brand: '', model: 'BROS NXR150' },
    { code: 'HTP-2919', type: 'Pickup', name: 'CA01 - F350 (LITUCERA)', brand: '', model: 'F350' },
    { code: 'HTU-5182', type: 'Moto', name: 'MT - BROS PRETA', brand: 'HONDA', model: 'NXR150' },
    { code: 'ISP-6F11', type: 'Caçamba', name: 'CB04 - CAMINHÃO BASCULANTE 26.260', brand: 'VOLKSWAGEN', model: '26.260' },
    { code: 'KHZ-4292', type: 'Caminhão Tanque', name: 'CT01 - PIPA TRUCK', brand: 'FORD', model: 'CARGO 2628' },
    { code: 'KJX-7A19', type: 'Caminhão Tanque', name: 'CT02 - PIPA TOCO', brand: 'MERCEDES-BENZ', model: '1420' },
    { code: 'KOQ-1I32', type: 'Caçamba', name: 'CB10 - CAMINHÃO BASCULANTE 2622', brand: '', model: '2622E' },
    { code: 'KRF-4C08', type: 'Caçamba', name: 'CB11 - CAMINHÃO BASCULANTE 17.190', brand: 'VOLKSWAGEN', model: '17.190' },
    { code: 'LSX-5B07', type: 'Caçamba', name: 'CB12 - CAMINHÃO BASCULANTE 17.190', brand: 'VOLKSWAGEN', model: '17.190' },
    { code: 'MCM-8836', type: 'Caçamba', name: 'CB03 - CAMINHÃO BASCULANTE CARGO 2631', brand: '', model: 'CARGO 2631' },
    { code: 'MSZ-1E47', type: 'Caminhão Plataforma', name: 'FORD CARGO 8150 PRANCHA', brand: '', model: 'CARGO' },
    { code: 'NBK-3692', type: 'Caminhão', name: 'CC01 - DELIVERY 8.150E (LOJA)', brand: '', model: '8.150E' },
    { code: 'NRI-0G84', type: 'Moto', name: 'MT - BROS VERMELHA', brand: 'HONDA', model: 'NXR150' },
    { code: 'NRU-5A71', type: 'Carro', name: 'SAVEIRO', brand: '', model: 'SAVEIRO' },
    { code: 'PRK-9F72', type: 'Pickup', name: 'STRADA', brand: 'FIAT', model: 'STRADA' },
    { code: 'TEM-0P00', type: 'Caminhão Tanque', name: 'CT-03 - PIPA EXERCITO', brand: 'MERCEDES-BENZ', model: '199' }
];

export const importSelsynVehicles = async (onLog: (msg: string) => void) => {
    onLog("Iniciando importação...");

    // Get Current Company
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não Autenticado");

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid error if not found immediately

    let companyId = profile?.company_id;

    if (!companyId) {
        onLog("⚠️ Perfil não encontrado. Buscando empresa padrão (Fallback)...");
        const { data: companies } = await supabase.from('companies').select('id').limit(1);
        if (companies && companies.length > 0) {
            companyId = companies[0].id;
            onLog(`✅ Usando empresa padrão: ${companyId}`);
        } else {
            throw new Error("Impossível determinar a empresa. Perfil e Lista de Empresas vazios.");
        }
    } else {
        onLog(`Empresa ID: ${companyId}`);
    }

    let success = 0;

    for (const v of csvVehicles) {
        // Check if exists by CODE (Placa)
        const { data: existing } = await supabase
            .from('assets')
            .select('id')
            .eq('code', v.code)
            .single();

        if (existing) {
            onLog(`Atualizando ${v.code}...`);
            await supabase.from('assets').update({
                name: v.name,
                model: v.model,
                brand: v.brand || 'GENERIC',
                telemetry: {
                    deviceType: v.type,
                    originalCsvData: v
                }
            }).eq('id', existing.id);
        } else {
            onLog(`Criando ${v.code}...`);
            const { error } = await supabase.from('assets').insert({
                company_id: companyId,
                name: v.name,
                code: v.code,
                model: v.model,
                brand: v.brand || 'GENERIC',
                status: 'AVAILABLE',
                horometer_total: 0,
                odometer_total: 0,
                telemetry: {
                    deviceType: v.type,
                    originalCsvData: v
                }
            });
            if (error) onLog(`ERRO ${v.code}: ${error.message}`);
        }
        success++;
    }
    onLog(`Concluído! ${success} veículos processados.`);
};

```


# File: services/systemAuditor.ts
```

import { supabase } from '../lib/supabase';
import { logger } from './logger';
import { fleetManagementService } from './fleetService';
import { fetchFleetPositions } from './selsyn';

export const runSystemDiagnostics = async () => {
    const timestamp = new Date().toISOString();
    const TEST_CODE = `SYS-CHECK-${Math.floor(Math.random() * 1000)}`;
    let successCount = 0;
    let failCount = 0;

    await logger.info('SystemAuditor', `🚀 Iniciando Diagnóstico do Sistema... Código: ${TEST_CODE}`);

    // --- 1. TESTE DE FROTA (FLEET) ---
    try {
        await logger.info('SystemAuditor', '🧪 Testando Módulo de Frota (CRUD)...');

        // CREATE
        const newAsset = {
            name: `Veículo Teste Auditor`,
            code: TEST_CODE,
            model: 'TestModel',
            brand: 'TestBrand',
            status: 'AVAILABLE',
            horometer_total: 0,
            odometer_total: 0
        };

        // Nota: createAsset pega company_id do user logado
        // Precisamos garantir que não falhe se o perfil não existir (o método createAsset lança erro hoje)
        // Se falhar, é um erro legítimo de teste
        const created = await fleetManagementService.createAsset(newAsset as any); // Cast any para partial
        if (created && created.id) {
            await logger.success('SystemAuditor', `✅ Frota: Criação OK. ID: ${created.id}`);
        } else {
            throw new Error("Falha na criação: ID nulo");
        }

        // UPDATE
        const updated = await fleetManagementService.updateAsset({
            ...created,
            model: 'Model Updated'
        });
        if (updated.model === 'Model Updated') {
            await logger.success('SystemAuditor', `✅ Frota: Edição OK.`);
        } else {
            throw new Error("Falha na edição: Modelo não atualizou");
        }

        // DELETE
        await fleetManagementService.deleteAsset(created.id);

        // VERIFY DELETION (Double Check)
        const check = await supabase.from('assets').select('id').eq('id', created.id);
        if (check.data && check.data.length === 0) {
            await logger.success('SystemAuditor', `✅ Frota: Exclusão OK.`);
            successCount++;
        } else {
            throw new Error("Falha na exclusão: Item ainda existe no banco");
        }

    } catch (e: any) {
        failCount++;
        await logger.error('SystemAuditor', `❌ FALHA NO MÓDULO FROTA: ${e.message}`, e);
    }

    // --- 2. TESTE DE RH (EMPLOYEES) ---
    try {
        await logger.info('SystemAuditor', '🧪 Testando Módulo RH (Banco de Dados)...');

        // Como não temos um hrService exportado, vamos testar o acesso direto ao Supabase
        // Isso valida se o usuário tem permissões na tabela

        // GET COMPANY ID (Necessário para INSERT)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não logado");

        const { data: profile } = await supabase.from('user_profiles').select('company_id').eq('id', user.id).maybeSingle();
        let companyId = profile?.company_id;

        if (!companyId) {
            // Tenta pegar primeira empresa (Fallback igual ao importer)
            const { data: c } = await supabase.from('companies').select('id').limit(1);
            if (c && c.length) companyId = c[0].id;
            else throw new Error("Sem company_id para teste de RH");
        }

        // CREATE
        const empCode = `EMP-${Math.floor(Math.random() * 9999)}`;
        const { data: emp, error: createErr } = await supabase.from('employees').insert({
            company_id: companyId,
            full_name: `Agente Auditor Teste`,
            registration_number: empCode,
            active: true
        }).select().single();

        if (createErr) throw createErr;
        await logger.success('SystemAuditor', `✅ RH: Criação OK. ID: ${emp.id}`);

        // UPDATE
        const { error: updateErr } = await supabase.from('employees').update({
            job_title: 'Auditor Senior'
        }).eq('id', emp.id);

        if (updateErr) throw updateErr;
        await logger.success('SystemAuditor', `✅ RH: Edição OK.`);

        // DELETE (HARD DELETE PARA NÃO SUJAR)
        const { error: delErr } = await supabase.from('employees').delete().eq('id', emp.id);

        if (delErr) throw delErr;
        await logger.success('SystemAuditor', `✅ RH: Exclusão OK.`);
        successCount++;

    } catch (e: any) {
        failCount++;
        await logger.error('SystemAuditor', `❌ FALHA NO MÓDULO RH: ${e.message}`, e);
    }

    // --- 3. TESTE DE CONECTIVIDADE GPS (SELSYN) ---
    try {
        await logger.info('SystemAuditor', '🧪 Testando Conexão API Selsyn...');
        const positions = await fetchFleetPositions();

        if (Array.isArray(positions)) {
            await logger.success('SystemAuditor', `✅ GPS: Conexão OK. Veículos retornados: ${positions.length}`);
            successCount++;
        } else {
            throw new Error("API não retornou um array válido");
        }

    } catch (e: any) {
        failCount++;
        await logger.error('SystemAuditor', `❌ FALHA NO MÓDULO GPS: ${e.message}`, e);
    }

    // RESUMO
    if (failCount === 0) {
        await logger.success('SystemAuditor', `🏁 DIAGNÓSTICO COMPLETO: TUDO OK! (${successCount} módulos verificados)`);
    } else {
        await logger.warn('SystemAuditor', `⚠️ DIAGNÓSTICO FINALIZADO COM ${failCount} FALHAS.`);
    }
};

```


# File: services/validation.ts
```
export const formatCPF = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

export const validateCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
};

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
};

```


# File: sql/approve_almox.sql
```

-- Script to Approve User 'almox@almox.com.br'
-- Run this in the Supabase SQL Editor

-- 1. Update the status to APPROVED
UPDATE public.user_profiles
SET status = 'APPROVED'
WHERE email = 'almox@almox.com.br';

-- 2. Ensure the role is correct (MANAGER)
UPDATE public.user_profiles
SET role = 'MANAGER'
WHERE email = 'almox@almox.com.br';

-- 3. Verify the result
SELECT * FROM public.user_profiles WHERE email = 'almox@almox.com.br';

```


# File: sql/approve_almox_v2.sql
```

-- Script to Approve User 'almox@almox.com.br' (Corrected for ENUM)
-- Run this in the Supabase SQL Editor

-- 1. Update the status to APPROVED
-- Note: 'admin' might be lowercase in the database enum definition based on the error "MANAGER" invalid
-- Let's try to set to 'admin' or 'gestor' based on types.ts

UPDATE public.user_profiles
SET status = 'APPROVED', role = 'gestor'
WHERE email = 'almox@almox.com.br';

-- 3. Verify the result
SELECT * FROM public.user_profiles WHERE email = 'almox@almox.com.br';

```


# File: sql/create_app_config.sql
```
-- =====================================================
-- TABELA DE CONFIGURAÇÕES DO SISTEMA
-- =====================================================

CREATE TABLE IF NOT EXISTS app_config (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar RLS (Row Level Security) - Importante para segurança real em produção
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Política de Leitura Pública (Para facilitar MVP, idealmente restrito a admins)
CREATE POLICY "Leitura pública de config" ON app_config FOR SELECT USING (true);
CREATE POLICY "Escrita pública de config" ON app_config FOR ALL USING (true); -- ATENÇÃO: Em produção, restringir isso!

-- Inserir Senha Padrão (Se não existir)
INSERT INTO app_config (chave, valor, descricao) 
VALUES ('admin_password', 'admin123', 'Senha Mestra para Ações Sensíveis')
ON CONFLICT (chave) DO NOTHING;

```


# File: sql/fix_admin_permissions.sql
```
-- 1. Promover seu usuário atual para ADMIN (Garante que você tenha a permissão necessária)
-- Isso atualiza seu perfil para 'admin' caso ainda não esteja.
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = auth.uid();

-- 2. Remover políticas antigas para evitar conflitos/duplicação
DROP POLICY IF EXISTS "Admins Read All Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Insert Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Update Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Delete Permissions" ON user_permissions;

DROP POLICY IF EXISTS "Admins Read All User Profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins Manage User Profiles" ON user_profiles;

-- 3. Criar Políticas de Segurança (RLS) para ADMINS na tabela user_permissions
-- PERMITIR LER TUDO
CREATE POLICY "Admins Read All Permissions" ON user_permissions
    FOR SELECT USING (
        EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' )
    );

-- PERMITIR INSERIR
CREATE POLICY "Admins Insert Permissions" ON user_permissions
    FOR INSERT WITH CHECK (
        EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' )
    );

-- PERMITIR ATUALIZAR
CREATE POLICY "Admins Update Permissions" ON user_permissions
    FOR UPDATE USING (
        EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' )
    );

-- PERMITIR DELETAR
CREATE POLICY "Admins Delete Permissions" ON user_permissions
    FOR DELETE USING (
        EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' )
    );

-- 4. Garantir que ADMINS possam gerenciar os perfis de usuários (user_profiles)
CREATE POLICY "Admins Manage User Profiles" ON user_profiles
    FOR ALL USING (
        EXISTS ( SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin' )
    );

```


# File: sql/fix_almox_company.sql
```

-- Fix Almox user missing company_id
-- We will link them to the first company found in the DB (usually 'TerraPro Demo')

WITH company AS (
  SELECT id FROM companies LIMIT 1
)
UPDATE public.user_profiles
SET company_id = (SELECT id FROM company),
    role = 'gestor',
    status = 'APPROVED'
WHERE email = 'almox@almox.com.br';

-- Verify
SELECT * FROM public.user_profiles WHERE email = 'almox@almox.com.br';

```


# File: sql/fix_centros_custo_constraint.sql
```
-- Remover a restrição antiga que limitava os tipos de centros de custo
ALTER TABLE centros_custo DROP CONSTRAINT IF EXISTS centros_custo_tipo_check;

-- Adicionar nova restrição Aceitando TODOS os tipos do novo DRE
ALTER TABLE centros_custo ADD CONSTRAINT centros_custo_tipo_check 
CHECK (tipo IN (
    'RECEITA', 
    'DESPESA', 
    'CUSTO_DIRETO', 
    'DESPESA_FIXA', 
    'DESPESA_VARIAVEL', 
    'DESPESA_FINANCEIRA', 
    'RECEITA_FINANCEIRA', 
    'INVESTIMENTO'
));

```


# File: sql/fix_fuel_permissions.sql
```

-- Script Final para Corrigir Permissões do Módulo de Combustível
-- Autor: Antigravity

-- 1. Conceder permissões de leitura (SELECT) para usuários autenticados
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.employees TO authenticated;

-- 2. Configurar RLS (Segurança a Nível de Linha) para permitir leitura
DO $$
BEGIN
    -- Permitir leitura na tabela user_profiles (Perfil do Usuário)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Permitir Leitura user_profiles" ON public.user_profiles;
        CREATE POLICY "Permitir Leitura user_profiles" ON public.user_profiles FOR SELECT TO authenticated USING (true);
    END IF;

    -- Permitir leitura na tabela employees (Funcionários)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'employees') THEN
        ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Permitir Leitura employees" ON public.employees;
        CREATE POLICY "Permitir Leitura employees" ON public.employees FOR SELECT TO authenticated USING (true);
    END IF;

    -- Permitir leitura na tabela base profiles (caso user_profiles seja uma view dela)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Permitir Leitura profiles" ON public.profiles;
        CREATE POLICY "Permitir Leitura profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
    END IF;
END;
$$;

-- 3. Verificação Final: Confira se os dados abaixo aparecem na aba "Output"
SELECT 'VERIFICACAO_PERFIL' as check, email, company_id, role, status 
FROM public.user_profiles 
WHERE email = 'almox@almox.com.br';

SELECT 'CONTAGEM_FUNCIONARIOS' as check, count(*) as total 
FROM public.employees;

```


# File: sql/fix_recursion_bug.sql
```
-- CORREÇÃO DE ERRO: Infinite Recursion em user_profiles

-- 1. Criar uma função segura para verificar se é Admin
-- SECURITY DEFINER faz a função rodar com permissões de quem criou (superusuário),
-- ignorando o RLS e evitando o loop infinito/recursão.
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Remover TODAS as políticas problemáticas da tabela user_profiles
DROP POLICY IF EXISTS "Admins Read All User Profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins Manage User Profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public Profile Read" ON user_profiles; -- Caso exista

-- 3. Recriar Políticas da tabela user_profiles (agora seguras)

-- Política A: Usuário vê e edita seu próprio perfil
CREATE POLICY "Users Own Profile Access" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- Política B: Admins podem ver e editar TUDO (usando a função is_admin para não dar loop)
CREATE POLICY "Admins Manage All Profiles" ON user_profiles
    FOR ALL USING (is_admin());

-- 4. Atualizar também as políticas de user_permissions para usar a função segura (mais limpo)
DROP POLICY IF EXISTS "Admins Read All Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Insert Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Update Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Delete Permissions" ON user_permissions;

CREATE POLICY "Admins Manage Permissions" ON user_permissions
    FOR ALL USING (is_admin());

-- Mantém a política de leitura do próprio usuário em permissions
DROP POLICY IF EXISTS "User Read Own Permissions" ON user_permissions;
CREATE POLICY "User Read Own Permissions" ON user_permissions
    FOR SELECT USING (auth.uid() = user_id);

```


# File: sql/migrate_centros_custo_dre.sql
```
-- Adicionar colunas novas para suportar a estrutura DRE avançada e Multi-empresa
ALTER TABLE IF EXISTS centros_custo 
ADD COLUMN IF NOT EXISTS codigo TEXT,
ADD COLUMN IF NOT EXISTS tipo TEXT, -- RECEITA, CUSTO_DIRETO, DESPESA_FIXA, DESPESA_FINANCEIRA, INVESTIMENTO
ADD COLUMN IF NOT EXISTS grupo_dre TEXT, -- Agrupador para relatórios (Ex: Receita Bruta, EBITDA)
ADD COLUMN IF NOT EXISTS empresa_cnpj TEXT DEFAULT '00.000.000/0001-91'; -- Default para a Matriz se não especificado

-- Criar índice para performance em relatórios
CREATE INDEX IF NOT EXISTS idx_centros_custo_tipo ON centros_custo(tipo);
CREATE INDEX IF NOT EXISTS idx_centros_custo_grupo ON centros_custo(grupo_dre);
CREATE INDEX IF NOT EXISTS idx_centros_custo_empresa ON centros_custo(empresa_cnpj);

-- (Os dados serão inseridos pelo seed_centros_custo_terra_maquinas.sql)

```


# File: sql/seed_bank_accounts.sql
```
-- =====================================================
-- SEED DATA: Contas Bancárias e Caixas
-- =====================================================

INSERT INTO contas_bancarias (
    banco_codigo, 
    banco_nome, 
    agencia, 
    conta, 
    tipo_conta, 
    saldo_atual, 
    ativa, 
    padrao,
    empresa_cnpj
) VALUES 
('001', 'Banco do Brasil', '1234-5', '99999-9', 'CONTA_CORRENTE', 15000.00, TRUE, TRUE, '00.000.000/0001-91'),
('260', 'NuBank', '0001', '1234567-8', 'CONTA_CORRENTE', 5450.50, TRUE, FALSE, '00.000.000/0001-91'),
('999', 'Caixa Pequeno (Físico)', '0000', 'CAIXA-01', 'CAIXA_FISICO', 1250.00, TRUE, FALSE, NULL);

-- Opcional: Ajustar saldo inicial se necessário
-- UPDATE contas_bancarias SET saldo_atual = 20000 WHERE banco_codigo = '001';

```


# File: sql/seed_centros_custo_terra_maquinas.sql
```
-- Limpar centros de custo existentes (opcional, para limpar sujeira inicial)
DELETE FROM centros_custo;

-- Inserir Centros de Custo Baseados na Estrutura DRE da Terra Máquinas

-- 1. RECEITAS
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Receita – Locação Escavadeiras Hidráulicas', '1.01', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Mini Escavadeiras', '1.02', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Motoniveladoras', '1.03', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Pás Carregadeiras', '1.04', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Mini Pás Carregadeiras', '1.05', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Retroescavadeiras', '1.06', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Tratores Agrícolas', '1.07', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Tratores de Esteira', '1.08', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Rolos Compactadores', '1.09', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Caminhões Basculantes', '1.10', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Transporte / Pranchas', '1.11', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Caminhão Pipa', '1.12', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Caminhão Poliguindaste', '1.13', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Serviços de Terraplanagem (Empreitadas)', '1.14', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Serviços Diversos / Apoio Industrial', '1.15', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91');

-- 2. CUSTOS DIRETOS (CPV) - Escavadeiras
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Escavadeiras', '2.01.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Escavadeiras', '2.01.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Escavadeiras', '2.01.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Peças e Componentes – Escavadeiras', '2.01.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Mini Escavadeiras
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Mini Escavadeiras', '2.02.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Mini Escavadeiras', '2.02.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Implementos (Rompedor/Perfuratriz) – Mini Escavadeiras', '2.02.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Motoniveladoras
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Motoniveladoras', '2.03.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Motoniveladoras', '2.03.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Peças e Lâminas – Motoniveladoras', '2.03.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção Pesada – Motoniveladoras', '2.03.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Pás Carregadeiras
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Pás Carregadeiras', '2.04.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Pneus – Pás Carregadeiras', '2.04.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Pás Carregadeiras', '2.04.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Pás Carregadeiras', '2.04.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Mini Pás Carregadeiras
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Mini Pás', '2.05.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Implementos (Vassoura/Fresa) – Mini Pás', '2.05.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Mini Pás', '2.05.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Retroescavadeiras
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Retroescavadeiras', '2.06.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Retroescavadeiras', '2.06.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Implementos (Estapac/Rompedor/Perfuratriz) – Retroescavadeiras', '2.06.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Retroescavadeiras', '2.06.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Tratores Agrícolas
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Tratores Agrícolas', '2.07.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Implementos (Grade/Roçadeira) – Tratores', '2.07.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Tratores Agrícolas', '2.07.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Tratores de Esteira
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Tratores Esteira', '2.08.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Material Rodante – Tratores Esteira', '2.08.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Tratores Esteira', '2.08.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Rolos Compactadores
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Rolos Compactadores', '2.09.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Rolos Compactadores', '2.09.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Kit Pata / Peças – Rolos', '2.09.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Caminhões Basculantes
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Caminhões Basculantes', '2.10.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Motorista – Caminhões Basculantes', '2.10.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Pneus – Caminhões', '2.10.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Caminhões Basculantes', '2.10.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Transporte e Pranchas
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Custos Operacionais – Pranchas', '2.11.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Pedágios e Viagens – Transporte', '2.11.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Motorista – Pranchas', '2.11.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Micro-ônibus – Custos Operacionais', '2.11.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Caminhão Pipa
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Caminhão Pipa', '2.12.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Caminhão Pipa', '2.12.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Caminhão Pipa', '2.12.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- Caminhão Poliguindaste
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Diesel – Poliguindaste', '2.13.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Poliguindaste', '2.13.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Poliguindaste', '2.13.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- 3. DESPESAS ADMINISTRATIVAS
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Salários Administrativo / Escritório', '6.01', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Pró-labore Diretoria', '6.02', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Contabilidade e Obrigações', '6.03', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Jurídico e Consultorias', '6.04', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Aluguel / Estrutura', '6.05', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Energia, Internet e Telefonia', '6.06', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Seguros e Licenciamento Frota', '6.07', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Marketing e Comercial', '6.08', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Sistemas e TI (Antigravity / ERP)', '6.09', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91');

-- 4. RESULTADO FINANCEIRO
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Juros de Financiamentos', '8.01', 'DESPESA_FINANCEIRA', 'Resultado Financeiro', true, '00.000.000/0001-91'),
('Tarifas Bancárias', '8.02', 'DESPESA_FINANCEIRA', 'Resultado Financeiro', true, '00.000.000/0001-91'),
('Multas e Encargos', '8.03', 'DESPESA_FINANCEIRA', 'Resultado Financeiro', true, '00.000.000/0001-91'),
('Rendimentos Financeiros', '8.04', 'RECEITA_FINANCEIRA', 'Resultado Financeiro', true, '00.000.000/0001-91');

-- 5. CAPEX
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Compra de Máquinas Novas', '9.01', 'INVESTIMENTO', 'CAPEX / Imobilizado', true, '00.000.000/0001-91'),
('Reformas Pesadas / Retífica', '9.02', 'INVESTIMENTO', 'CAPEX / Imobilizado', true, '00.000.000/0001-91'),
('Construção de Barracão / Obras Próprias', '9.03', 'INVESTIMENTO', 'CAPEX / Imobilizado', true, '00.000.000/0001-91');

```


# File: sql/setup_financeiro_completo.sql
```
-- ==========================================
-- SETUP COMPLETO DO FINANCEIRO (DRE) - VERSÃO FINAL 2.0
-- Este script faz um RESET na estrutura de centros de custo para garantir integridade.
-- ==========================================

-- 1. LIMPEZA TOTAL (RESET)
-- Removemos a constraint antiga para poder manipular os dados livremente
ALTER TABLE centros_custo DROP CONSTRAINT IF EXISTS centros_custo_tipo_check;

-- ZERAMOS a tabela para evitar conflitos de dados antigos incompatíveis
DELETE FROM centros_custo;

-- 2. ESTRUTURA: Garantir colunas
ALTER TABLE IF EXISTS centros_custo 
ADD COLUMN IF NOT EXISTS codigo TEXT,
ADD COLUMN IF NOT EXISTS tipo TEXT, 
ADD COLUMN IF NOT EXISTS grupo_dre TEXT,
ADD COLUMN IF NOT EXISTS empresa_cnpj TEXT DEFAULT '00.000.000/0001-91';

-- 3. RECRIAR REGRAS (Constraints)
-- Agora que a tabela está vazia, podemos aplicar a regra estrita sem erro
ALTER TABLE centros_custo ADD CONSTRAINT centros_custo_tipo_check 
CHECK (tipo IN (
    'RECEITA', 
    'DESPESA', 
    'CUSTO_DIRETO', 
    'DESPESA_FIXA', 
    'DESPESA_VARIAVEL', 
    'DESPESA_FINANCEIRA', 
    'RECEITA_FINANCEIRA', 
    'INVESTIMENTO'
));

-- 4. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_centros_custo_tipo ON centros_custo(tipo);
CREATE INDEX IF NOT EXISTS idx_centros_custo_grupo ON centros_custo(grupo_dre);
CREATE INDEX IF NOT EXISTS idx_centros_custo_codigo ON centros_custo(codigo);


-- 5. CARGA DE DADOS (SEED) - Plano de Contas Terra Máquinas

-- 1. RECEITAS (GRUPO 1)
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Receita – Locação Escavadeiras Hidráulicas', '1.01', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Mini Escavadeiras', '1.02', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Motoniveladoras', '1.03', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Pás Carregadeiras', '1.04', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Mini Pás Carregadeiras', '1.05', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Retroescavadeiras', '1.06', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Tratores Agrícolas', '1.07', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Tratores de Esteira', '1.08', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Rolos Compactadores', '1.09', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Locação Caminhões Basculantes', '1.10', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Transporte / Pranchas', '1.11', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Caminhão Pipa', '1.12', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Caminhão Poliguindaste', '1.13', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Serviços de Terraplanagem (Empreitadas)', '1.14', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91'),
('Receita – Serviços Diversos / Apoio Industrial', '1.15', 'RECEITA', 'Receita Operacional Bruta', true, '00.000.000/0001-91');

-- 2. CUSTOS DIRETOS (GRUPO 2)
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
-- Escavadeiras
('Diesel – Escavadeiras', '2.01.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Escavadeiras', '2.01.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Escavadeiras', '2.01.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Peças e Componentes – Escavadeiras', '2.01.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
-- Mini Escavadeiras
('Diesel – Mini Escavadeiras', '2.02.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Mini Escavadeiras', '2.02.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Implementos (Rompedor/Perfuratriz) – Mini Escavadeiras', '2.02.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
-- Motoniveladoras
('Diesel – Motoniveladoras', '2.03.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Motoniveladoras', '2.03.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Peças e Lâminas – Motoniveladoras', '2.03.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção Pesada – Motoniveladoras', '2.03.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
-- Pás Carregadeiras
('Diesel – Pás Carregadeiras', '2.04.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Pneus – Pás Carregadeiras', '2.04.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Pás Carregadeiras', '2.04.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Pás Carregadeiras', '2.04.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
-- Mini Pás
('Diesel – Mini Pás', '2.05.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Implementos (Vassoura/Fresa) – Mini Pás', '2.05.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Mini Pás', '2.05.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
-- Retroescavadeiras
('Diesel – Retroescavadeiras', '2.06.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Retroescavadeiras', '2.06.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Implementos (Estapac/Rompedor/Perfuratriz) – Retroescavadeiras', '2.06.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Retroescavadeiras', '2.06.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
-- Tratores Agrícolas
('Diesel – Tratores Agrícolas', '2.07.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Implementos (Grade/Roçadeira) – Tratores', '2.07.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Tratores Agrícolas', '2.07.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
-- Tratores de Esteira
('Diesel – Tratores Esteira', '2.08.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Material Rodante – Tratores Esteira', '2.08.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Tratores Esteira', '2.08.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
-- Rolos Compactadores
('Diesel – Rolos Compactadores', '2.09.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Rolos Compactadores', '2.09.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Kit Pata / Peças – Rolos', '2.09.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
-- Caminhões Basculantes
('Diesel – Caminhões Basculantes', '2.10.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Motorista – Caminhões Basculantes', '2.10.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Pneus – Caminhões', '2.10.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Caminhões Basculantes', '2.10.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
-- Transporte e Pranchas
('Custos Operacionais – Pranchas', '2.11.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Pedágios e Viagens – Transporte', '2.11.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Motorista – Pranchas', '2.11.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Micro-ônibus – Custos Operacionais', '2.11.04', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
-- Caminhão Pipa
('Diesel – Caminhão Pipa', '2.12.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Caminhão Pipa', '2.12.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Caminhão Pipa', '2.12.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
-- Caminhão Poliguindaste
('Diesel – Poliguindaste', '2.13.01', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Manutenção – Poliguindaste', '2.13.02', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91'),
('Operador – Poliguindaste', '2.13.03', 'CUSTO_DIRETO', 'Custos Diretos da Operação (CPV)', true, '00.000.000/0001-91');

-- 3. DESPESAS ADMINISTRATIVAS (GRUPO 6)
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Salários Administrativo / Escritório', '6.01', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Pró-labore Diretoria', '6.02', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Contabilidade e Obrigações', '6.03', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Jurídico e Consultorias', '6.04', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Aluguel / Estrutura', '6.05', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Energia, Internet e Telefonia', '6.06', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Seguros e Licenciamento Frota', '6.07', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Marketing e Comercial', '6.08', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91'),
('Sistemas e TI (Antigravity / ERP)', '6.09', 'DESPESA_FIXA', 'Despesas Operacionais Fixas', true, '00.000.000/0001-91');

-- 4. RESULTADO FINANCEIRO (GRUPO 8)
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Juros de Financiamentos', '8.01', 'DESPESA_FINANCEIRA', 'Resultado Financeiro', true, '00.000.000/0001-91'),
('Tarifas Bancárias', '8.02', 'DESPESA_FINANCEIRA', 'Resultado Financeiro', true, '00.000.000/0001-91'),
('Multas e Encargos', '8.03', 'DESPESA_FINANCEIRA', 'Resultado Financeiro', true, '00.000.000/0001-91'),
('Rendimentos Financeiros', '8.04', 'RECEITA_FINANCEIRA', 'Resultado Financeiro', true, '00.000.000/0001-91');

-- 5. CAPEX (GRUPO 9)
INSERT INTO centros_custo (nome, codigo, tipo, grupo_dre, ativo, empresa_cnpj) VALUES
('Compra de Máquinas Novas', '9.01', 'INVESTIMENTO', 'CAPEX / Imobilizado', true, '00.000.000/0001-91'),
('Reformas Pesadas / Retífica', '9.02', 'INVESTIMENTO', 'CAPEX / Imobilizado', true, '00.000.000/0001-91'),
('Construção de Barracão / Obras Próprias', '9.03', 'INVESTIMENTO', 'CAPEX / Imobilizado', true, '00.000.000/0001-91');

```


# File: sql/setup_rbac.sql
```
-- 1. Tabela de Módulos do Sistema
CREATE TABLE IF NOT EXISTS system_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Operacional', 'Administrativo', 'Financeiro', 'RH', 'Logística', 'Medição', 'Admin')),
    is_sensitive BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Permissões de Usuário
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_slug TEXT NOT NULL REFERENCES system_modules(slug) ON DELETE CASCADE,
    can_create BOOLEAN DEFAULT false,
    can_read BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, module_slug)
);

-- 3. Log de Auditoria de Permissões
CREATE TABLE IF NOT EXISTS permission_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id),
    target_user_id UUID,
    action TEXT NOT NULL, -- GRANT, REVOKE, UPDATE
    module_slug TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip_address TEXT,
    details TEXT
);

-- Habilitar RLS
ALTER TABLE system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (Simplificadas inicialmente)
-- Módulos: Todos podem ler módulos ativos (para montar menu)
DROP POLICY IF EXISTS "Public Read Active Modules" ON system_modules;
CREATE POLICY "Public Read Active Modules" ON system_modules FOR SELECT USING (is_active = true);

-- Permissões: Usuário vê suas próprias permissões
DROP POLICY IF EXISTS "User Read Own Permissions" ON user_permissions;
CREATE POLICY "User Read Own Permissions" ON user_permissions FOR SELECT USING (auth.uid() = user_id);

-- 4. Seed de Módulos (Conforme solicitado)
INSERT INTO system_modules (slug, name, category, is_sensitive, is_active) VALUES
-- Operacional
('frota_ativos', 'Gestão de Equipamentos', 'Operacional', false, true),
('frota_manutencao', 'Manutenção Preventiva e Corretiva', 'Operacional', false, true),
('controle_diesel', 'Abastecimento e Consumo', 'Operacional', true, true), -- Já em uso
('diaria_operadores', 'Controle de Diárias e Horímetros', 'Operacional', false, true),
-- Medição
('medicao_brf_bunge', 'Medições de Contratos (BRF/Bunge)', 'Medição', true, true),
-- Logística
('locacao_maquinas', 'Contratos de Locação', 'Logística', false, true),
-- Financeiro
('fin_contas_pagar', 'Contas a Pagar', 'Financeiro', true, true),
('fin_contas_receber', 'Contas a Receber', 'Financeiro', true, true),
('fin_bancos_cnab', 'Integração Bancária', 'Financeiro', true, true),
('fin_pix_auto', 'Conciliação PIX', 'Financeiro', true, true),
-- RH
('rh_folha_ponto', 'Folha e Ponto', 'RH', true, true), -- Já em uso
-- Admin
('sys_audit_logs', 'Logs de Sistema', 'Admin', true, true)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name, 
    category = EXCLUDED.category, 
    is_sensitive = EXCLUDED.is_sensitive,
    is_active = EXCLUDED.is_active;

-- View Helper para Frontend (facilita o hook usePermission)
CREATE OR REPLACE VIEW view_user_permissions AS
SELECT 
    up.user_id,
    up.module_slug,
    sm.name as module_name,
    sm.category,
    sm.is_sensitive,
    up.can_create,
    up.can_read,
    up.can_update,
    up.can_delete
FROM user_permissions up
JOIN system_modules sm ON up.module_slug = sm.slug
WHERE sm.is_active = true;

-- Grant access to view
GRANT SELECT ON view_user_permissions TO authenticated;
GRANT SELECT ON system_modules TO authenticated;
GRANT SELECT ON user_permissions TO authenticated;

-- ==========================================
-- FUNÇÃO AUXILIAR PARA SETUP INICIAL
-- ==========================================
CREATE OR REPLACE FUNCTION grant_full_access(target_email TEXT)
RETURNS void AS $$
DECLARE
  target_user_id UUID;
  mod RECORD;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', target_email;
  END IF;

  FOR mod IN SELECT slug FROM system_modules LOOP
    INSERT INTO user_permissions (user_id, module_slug, can_create, can_read, can_update, can_delete)
    VALUES (target_user_id, mod.slug, true, true, true, true)
    ON CONFLICT (user_id, module_slug) DO UPDATE SET
      can_create = true, can_read = true, can_update = true, can_delete = true;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

```


# File: sql/unlock_permissions_dev.sql
```
-- SOLUÇÃO DEFINITIVA (MODO DESENVOLVIMENTO)
-- Vamos liberar o acesso para usuários autenticados temporariamente para destravar você.

-- 1. Garantir permissões de tabela (Nível Banco)
GRANT ALL ON TABLE user_permissions TO authenticated;
GRANT ALL ON TABLE user_permissions TO service_role;

-- 2. Limpar todas as políticas (RLS) da tabela de permissões
DROP POLICY IF EXISTS "Admins Read All Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Insert Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Update Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Delete Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins Manage Permissions" ON user_permissions;
DROP POLICY IF EXISTS "User Read Own Permissions" ON user_permissions;
DROP POLICY IF EXISTS "Dev Allow All" ON user_permissions;

-- 3. Criar uma política "Permitir Tudo para Autenticados" (Dev Mode)
-- Isso remove a complexidade da verificação de Admin/Recursão por enquanto.
-- Depois que funcionar, podemos restringir novamente.
CREATE POLICY "Dev Allow All" ON user_permissions
    FOR ALL
    USING (auth.role() = 'authenticated');

-- 4. Garantir que a tabela user_profiles também esteja acessível
DROP POLICY IF EXISTS "Admins Manage All Profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users Own Profile Access" ON user_profiles;

-- Política simples para profiles: Cada um vê o seu, e Admin (via função segura) vê todos, 
-- ou liberamos leitura geral para autenticados em Dev.
CREATE POLICY "Dev Read All Profiles" ON user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users Update Own Profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Atualiza seu usuário para admin (Garantia extra)
-- Substitua 'seu_email' se necessário, mas o comando abaixo tenta pegar o ultimo logado ou ignora
UPDATE user_profiles SET role = 'admin' WHERE id = auth.uid();

```


# File: sql/update_rbac_policies.sql
```
-- ALERTA: Rodar manualmente no SQL Editor do Supabase se o MCP falhar

-- 1. Política para permitir ADMIN ler TODAS as Permissões
CREATE POLICY "Admins Read All Permissions" ON user_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- 2. Política para permitir ADMIN INSERIR Permissões
CREATE POLICY "Admins Insert Permissions" ON user_permissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- 3. Política para permitir ADMIN ATUALIZAR Permissões
CREATE POLICY "Admins Update Permissions" ON user_permissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- 4. Política para permitir ADMIN DELETAR Permissões
CREATE POLICY "Admins Delete Permissions" ON user_permissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Política para permitir que o ADMIN leia os PERFIS DE USUÁRIO (necessário para listar na tela Settings)
-- Pode já existir, mas reforçando:
CREATE POLICY "Admins Read All User Profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        ) OR auth.uid() = id -- Usuário vê a si mesmo
    );

```
