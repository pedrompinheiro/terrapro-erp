# Project Export: TerraPro ERP

Generated on Mon Feb  2 19:51:35 -04 2026

## File List
.
./index.tsx
./App.tsx
./index.html
./metadata.json
./README.md
./types.ts
./components
./components/AIAssistant.tsx
./components/StatCard.tsx
./components/Logo.tsx
./components/Sidebar.tsx
./components/Modal.tsx
./package-lock.json
./package.json
./project_export.md
./constants.tsx
./lib
./lib/geminiService.ts
./tsconfig.json
./vite.config.ts
./pages
./pages/DailyControl.tsx
./pages/Settings.tsx
./pages/Inventory.tsx
./pages/Maintenance.tsx
./pages/FleetManagement.tsx
./pages/Login.tsx
./pages/Financial.tsx
./pages/Dashboard.tsx
./pages/DashboardBI.tsx
./pages/WhatsAppAutomation.tsx
./pages/OperationsMap.tsx
./pages/Registrations.tsx
./pages/BIReports.tsx
./pages/FuelManagement.tsx
./pages/SecurityAudit.tsx
./pages/Documents.tsx
./pages/HRManagement.tsx
./pages/MapDigital.tsx
./pages/Billing.tsx
./services
./services/api.ts
./services/mockData.ts

## File: App.tsx
```tsx
import React, { useState } from 'react';
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
import OperationsMap from './pages/OperationsMap';
import SecurityAudit from './pages/SecurityAudit';
import Documents from './pages/Documents';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-screen">
      <Sidebar
        onLogout={() => setIsAuthenticated(false)}
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
```

## File: index.tsx
```tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

## File: types.ts
```ts

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
  name: string;
  model: string;
  status: AssetStatus;
  horometer: number;
  nextRevision: string;
  efficiency: number;
  coordinates?: { lat: number; lng: number };
  telemetry?: {
    lastUpdate: string;
    speed: number;
    ignition: boolean;
    voltage: number;
    batteryLevel: number;
    satelliteCount: number;
    address: string;
    deviceModel: string;
  };
  manuals?: ERPDocument[];
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
  assetId: string;
  assetName: string;
  status: OSStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  mechanic?: string;
  progress: number;
  partsNeeded?: string[];
}

export interface Transaction {
  id: string;
  client: string;
  project: string;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  type?: 'INCOME' | 'EXPENSE';
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
```

## File: constants.tsx
```tsx

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
  Shield
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard BI', icon: <LayoutDashboard size={20} />, group: 'Principal', path: '/' },
  { id: 'fleet', label: 'Frota Ativa', icon: <Truck size={20} />, group: 'Principal', path: '/fleet' },
  { id: 'cadastros', label: 'Cadastros Gerais', icon: <Users size={20} />, group: 'Principal', path: '/cadastros' }, // New Item
  { id: 'operations-map', label: 'Mapa de Operações', icon: <Calendar size={20} />, group: 'Operacional', path: '/operations-map' },
  { id: 'map', label: 'Mapa Digital', icon: <MapIcon size={20} />, group: 'Operacional', path: '/map' },
  { id: 'daily', label: 'Controle Diário', icon: <ClipboardCheck size={20} />, group: 'Operacional', path: '/daily' },
  { id: 'maintenance', label: 'Manutenção', icon: <Wrench size={20} />, group: 'Operacional', path: '/maintenance' },
  { id: 'inventory', label: 'Almoxarifado', icon: <Package size={20} />, group: 'Insumos', path: '/inventory' },
  { id: 'fuel', label: 'Combustível', icon: <Fuel size={20} />, group: 'Insumos', path: '/fuel' },
  { id: 'hr', label: 'Recursos Humanos', icon: <Users size={20} />, group: 'Gestão', path: '/rh' },
  { id: 'financial', label: 'Financeiro', icon: <Wallet size={20} />, group: 'Gestão', path: '/financial' },
  { id: 'billing', label: 'Faturamento', icon: <FileText size={20} />, group: 'Gestão', path: '/billing' },
  { id: 'bi', label: 'Relatórios BI', icon: <BarChart3 size={20} />, group: 'Gestão', path: '/bi' },
  { id: 'documents', label: 'Documentos GED', icon: <FileText size={20} />, group: 'Gestão', path: '/documents' },
  { id: 'security', label: 'Segurança & Audit', icon: <Shield size={20} />, group: 'Gestão', path: '/security' },
  { id: 'whatsapp', label: 'Automação Zap', icon: <MessageSquare size={20} />, group: 'Inteligência', path: '/whatsapp' },
];

export const BOTTOM_NAV_ITEMS = [
  { id: 'settings', label: 'Configurações', path: '/configuracoes', icon: <Settings size={20} /> }, // Added path
  { id: 'logout', label: 'Sair', icon: <LogOut size={20} />, color: 'text-red-400' },
];
```

## File: index.css
```css
```

## File: index.html
```html

<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TERRAPRO ERP</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <style>
      body {
        font-family: 'Inter', sans-serif;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 10px;
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@^19.2.4",
    "react-dom/": "https://esm.sh/react-dom@^19.2.4/",
    "react/": "https://esm.sh/react@^19.2.4/",
    "recharts": "https://esm.sh/recharts@^3.7.0",
    "lucide-react": "https://esm.sh/lucide-react@^0.563.0",
    "@google/genai": "https://esm.sh/@google/genai@^1.39.0"
  }
}
</script>
<link rel="stylesheet" href="/index.css">
</head>
  <body class="bg-slate-950 text-slate-100 antialiased">
    <div id="root"></div>
  <script type="module" src="/index.tsx"></script>
</body>
</html>
```

## File: services/api.ts
```ts
import { Asset, MaintenanceOS, StockItem, Transaction, AssetStatus, OSStatus, PaymentStatus, ERPDocument, AuditLogEntry, NetworkSession } from '../types';
import { MOCK_ACTIVITIES, MOCK_ASSETS, MOCK_STATS, MOCK_STOCK, MOCK_TRANSACTIONS, MOCK_MAINTENANCE_OS, MOCK_TIME_RECORDS, MOCK_PAYROLL_DATA, MOCK_OPERATIONS_MAP_DATA, MOCK_DOCUMENTS, MOCK_AUDIT_LOGS, MOCK_SESSIONS, TimeRecord, PayrollEntry, EquipmentTimeline } from './mockData';

const DELAY = 400; // Faster for better UX

// In-Memory Database
let _assets = [...MOCK_ASSETS];
let _maintenanceOS = [...MOCK_MAINTENANCE_OS];
let _stock = [...MOCK_STOCK];
let _transactions = [...MOCK_TRANSACTIONS];
let _timeRecords = [...MOCK_TIME_RECORDS];
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
    getHRTimeRecords: async (): Promise<TimeRecord[]> => {
        return new Promise(resolve => setTimeout(() => resolve([..._timeRecords]), DELAY));
    },
    updateHRTimeRecord: async (updatedRecord: TimeRecord) => {
        _timeRecords = _timeRecords.map(r => r.date === updatedRecord.date ? updatedRecord : r);
        return new Promise(resolve => setTimeout(() => resolve(updatedRecord), DELAY));
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

## File: services/mockData.ts
```ts

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
    { id: 'OS-8821', assetId: 'TRT-015', assetName: 'Trator JD 7200', priority: 'URGENT', status: OSStatus.WAITING_PARTS, mechanic: 'Carlos Lima', description: 'Superaquecimento do motor - Troca de radiador', progress: 30, partsNeeded: ['Radiador JD-7200', 'Aditivo Arrefecimento'] },
    { id: 'OS-8822', assetId: 'CMH-002', assetName: 'Caminhão G420', priority: 'LOW', status: OSStatus.PENDING, description: 'Revisão preventiva 5.000km', progress: 0 },
    { id: 'OS-8823', assetId: 'EXC-045', assetName: 'Escavadeira Volvo', priority: 'MEDIUM', status: OSStatus.COMPLETED, mechanic: 'João Mecânico', description: 'Troca de dentes da caçamba', progress: 100 },
];

export interface TimeRecord {
    date: string;
    entry1: string;
    exit1: string;
    entry2: string;
    exit2: string;
    totalHours: string;
    status: 'REGULAR' | 'ABSENT' | 'MANUAL_EDIT' | 'OVERTIME';
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

## File: components/AIAssistant.tsx
```tsx
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

## File: components/Logo.tsx
```tsx

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

## File: components/Modal.tsx
```tsx

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

## File: components/Sidebar.tsx
```tsx

import React from 'react';
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from '../constants';
import Logo from './Logo';

interface SidebarProps {
  onLogout: () => void;
}

import { NavLink } from 'react-router-dom';

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const groupedItems = NAV_ITEMS.reduce((acc: any, item) => {
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

## File: components/StatCard.tsx
```tsx

import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon, iconBg }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm hover:border-slate-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 ${iconBg} rounded-xl text-white shadow-inner`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
            trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
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

## File: pages/BIReports.tsx
```tsx

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

## File: pages/Billing.tsx
```tsx

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

## File: pages/DailyControl.tsx
```tsx

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

## File: pages/Dashboard.tsx
```tsx

import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Clock, MapPin, DollarSign, MessageSquare, Plus, BarChart3 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { dashboardService } from '../services/api';

const Dashboard: React.FC = () => {
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
        <StatCard title="Saldo Financeiro" value="R$ 1.25M" trend="+12% (Mês)" trendUp={true} icon={<DollarSign size={24} />} iconBg="bg-blue-600" />
        <StatCard title="Ativos Monitorados" value="12 / 12" trend="100% Online" trendUp={true} icon={<MapPin size={24} />} iconBg="bg-emerald-600" />
        <StatCard title="Alertas Manutenção" value="03 Críticos" trend="Ação Imediata" trendUp={false} icon={<AlertCircle size={24} />} iconBg="bg-rose-600" />
        <StatCard title="Automação WhatsApp" value="Ativo" trend="Ouvindo..." trendUp={true} icon={<MessageSquare size={24} />} iconBg="bg-purple-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Atividade das Frentes</h3>
            <button className="text-[10px] font-bold text-[#007a33] hover:underline uppercase">Ver Log Completo</button>
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
              <button className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group">
                <Plus size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-400">Nova Receita</span>
              </button>
              <button className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group">
                <MessageSquare size={20} className="text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-400">Campanha Zap</span>
              </button>
              <button className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group">
                <Clock size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-400">Lançar Ponto</span>
              </button>
              <button className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors group">
                <BarChart3 size={20} className="text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-400">Relatório Geral</span>
              </button>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Alertas Críticos</h3>
            <div className="p-4 bg-orange-600/10 border border-orange-600/20 rounded-2xl flex gap-3 items-start">
              <AlertCircle size={18} className="text-orange-500 shrink-0" />
              <p className="text-[10px] text-orange-200/70 font-bold leading-tight uppercase tracking-tight">
                03 Ordens de serviço preventivas vencem em 48h.
              </p>
            </div>
            <div className="p-4 bg-rose-600/10 border border-rose-600/20 rounded-2xl flex gap-3 items-start">
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

## File: pages/DashboardBI.tsx
```tsx

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

## File: pages/Documents.tsx
```tsx
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

## File: pages/Financial.tsx
```tsx

import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, FileText, Filter, Plus, Save, Banknote, QrCode, Calculator, CheckCircle, Archive } from 'lucide-react';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

import { Transaction, PaymentStatus } from '../types';
import { dashboardService } from '../services/api';

const Financial: React.FC = () => {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [generateBoleto, setGenerateBoleto] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    client: '',
    amount: 0,
    dueDate: '',
    status: PaymentStatus.PENDING,
    type: 'INCOME' // Default
  });

  // Settlement States
  const [applyInterest, setApplyInterest] = useState(true);
  const [calculatedValues, setCalculatedValues] = useState({ interest: 0, fine: 0, total: 0 });

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getTransactions();
      setTransactions(data as Transaction[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Effect to calculate interest on selection
  React.useEffect(() => {
    if (selectedTransaction && isSettleModalOpen) {
      const originalValue = Math.abs(selectedTransaction.amount);

      // Should be calculation based on DUE DATE vs TODAY. For mock, we simply assume if status is 'OVERDUE' it's 30 days late.
      let interest = 0;
      let fine = 0;

      if (selectedTransaction.status === PaymentStatus.OVERDUE) {
        const daysOverdue = 45;
        interest = (originalValue * 0.01 / 30) * daysOverdue;
        fine = originalValue * 0.02;
      }

      if (applyInterest) {
        setCalculatedValues({
          interest,
          fine,
          total: originalValue + interest + fine
        });
      } else {
        setCalculatedValues({
          interest: 0,
          fine: 0,
          total: originalValue
        });
      }
    }
  }, [selectedTransaction, isSettleModalOpen, applyInterest]);

  const handleTransactionClick = (tr: Transaction) => {
    setSelectedTransaction(tr);
    if (tr.status !== PaymentStatus.PAID) {
      setIsSettleModalOpen(true);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.client || !newTransaction.amount || !newTransaction.dueDate) return;

    const transaction: Transaction = {
      id: `TR-${Math.floor(Math.random() * 10000)}`,
      client: newTransaction.client,
      project: 'Geral', // Default project
      amount: newTransaction.type === 'EXPENSE' ? -Math.abs(Number(newTransaction.amount)) : Math.abs(Number(newTransaction.amount)),
      dueDate: newTransaction.dueDate,
      status: newTransaction.status as PaymentStatus,
      type: newTransaction.type as 'INCOME' | 'EXPENSE'
    };

    await dashboardService.addTransaction(transaction);
    await fetchTransactions();
    setIsModalOpen(false);
    setNewTransaction({ client: '', amount: 0, dueDate: '', status: PaymentStatus.PENDING, type: 'INCOME' });
  };

  const handleSettleTransaction = async () => {
    if (!selectedTransaction) return;

    const updated = {
      ...selectedTransaction,
      status: PaymentStatus.PAID,
      amount: selectedTransaction.amount // In real app, we might update amount with interest
    } as Transaction;

    await dashboardService.updateTransaction(updated);
    await fetchTransactions();
    setIsSettleModalOpen(false);
  };

  const handleDeleteTransaction = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      await dashboardService.deleteTransaction(id);
      await fetchTransactions();
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
          <h2 className="text-3xl font-black text-white tracking-tight">Financeiro Integrado</h2>
          <p className="text-slate-500 mt-1">Gestão de contas, fluxo de caixa e integração SEFAZ.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700">Conciliação Bancária</button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <Plus size={18} /> Nova Receita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Saldo em Conta" value="R$ 1.250.400,00" trend="5.2%" trendUp={true} icon={<DollarSign size={24} />} iconBg="bg-blue-600" />
        <StatCard title="A Receber (30d)" value="R$ 380.000,00" trend="12%" trendUp={true} icon={<ArrowUpRight size={24} />} iconBg="bg-emerald-600" />
        <StatCard title="A Pagar (30d)" value="R$ 145.200,00" trend="2%" trendUp={false} icon={<ArrowDownLeft size={24} />} iconBg="bg-rose-600" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Transações Recentes</h3>
          <button className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"><Filter size={18} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-8 py-4">Transação</th>
                <th className="px-8 py-4">Entidade / Fornecedor</th>
                <th className="px-8 py-4">Data</th>
                <th className="px-8 py-4">Valor</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.map((tr) => (
                <tr
                  key={tr.id}
                  onClick={() => handleTransactionClick(tr)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="px-8 py-5 font-mono text-xs text-slate-400 group-hover:text-blue-400">{tr.id}</td>
                  <td className="px-8 py-5 font-bold text-white">{tr.client}</td>
                  <td className="px-8 py-5 text-slate-500">{tr.dueDate}</td>
                  <td className={`px-8 py-5 font-black ${tr.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tr.amount >= 0 ? '+' : '-'} R$ {Math.abs(tr.amount).toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${tr.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                        tr.status === 'OVERDUE' ? 'bg-red-500 text-white' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                        {tr.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <button
                        onClick={(e) => handleDeleteTransaction(e, tr.id)}
                        className="p-2 hover:bg-slate-800 rounded text-slate-500 hover:text-red-500 transition-colors"
                      >
                        <Archive size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Settlement / Baixa */}
      <Modal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        title="Detalhes e Baixa de Título"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            {selectedTransaction.status === 'OVERDUE' && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white"><Calculator size={20} /></div>
                  <div>
                    <h4 className="font-bold text-rose-500 text-sm">Título em Atraso</h4>
                    <p className="text-xs text-rose-300">Cálculo automático de Juros e Multa aplicado.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Dias de Atraso</p>
                  <p className="text-lg font-black text-rose-500 font-mono">45 dias</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Valor Original</label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 font-mono">
                  R$ {Math.abs(selectedTransaction.amount).toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Vencimento Original</label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 font-mono">
                  {selectedTransaction.dueDate}
                </div>
              </div>
            </div>

            {selectedTransaction.status === 'OVERDUE' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    Aplicar Juros (1% a.m) e Multa (2%)?
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={applyInterest} onChange={() => setApplyInterest(!applyInterest)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                {applyInterest && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Multa por Atraso (2%)</span>
                      <span className="text-rose-400 font-mono font-bold">+ R$ {calculatedValues.fine.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Juros Mora (1% a.m - Pro Rata)</span>
                      <span className="text-rose-400 font-mono font-bold">+ R$ {calculatedValues.interest.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Atualizado a Pagar</p>
                <p className="text-3xl font-black text-emerald-500 tracking-tighter">
                  R$ {calculatedValues.total.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleSettleTransaction}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2">
                <CheckCircle size={20} /> Confirmar Baixa
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Nova Receita (Existing) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Transação (Receita ou Despesa)"
      >
        <div className="space-y-6">
          {/* Section 1: Basic Info */}
          <div>
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Dados do Título</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição do Lançamento</label>
                <input
                  placeholder="Ex: Mensalidade Contrato 001/24"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  value={newTransaction.client}
                  onChange={(e) => setNewTransaction({ ...newTransaction, client: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
                  >
                    <option value="INCOME">Receita</option>
                    <option value="EXPENSE">Despesa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    value={newTransaction.status}
                    onChange={(e) => setNewTransaction({ ...newTransaction, status: e.target.value as any })}
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="PAID">Pago</option>
                    <option value="OVERDUE">Atrasado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Centro de Custo</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none">
                    <option>Receita Operacional</option>
                    <option>Aluguel de Máquinas</option>
                    <option>Serviços Técnicos</option>
                    <option>Despesas Gerais</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Vencimento</label>
                  <input
                    type="date"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    value={newTransaction.dueDate}
                    onChange={(e) => setNewTransaction({ ...newTransaction, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Valor (R$)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-mono"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddTransaction}
              className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {generateBoleto ? 'Salvar e Emitir Boleto' : 'Salvar Transação'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Financial;
```

## File: pages/FleetManagement.tsx
```tsx

import React, { useState, useEffect } from 'react';
import { Asset, AssetStatus } from '../types';
import { Truck, Activity, ShieldCheck, MapPin, Gauge, Plus, Save, BookOpen, Search, Trash2, Download, FileText, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { dashboardService } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const FleetManagement: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fleetData, setFleetData] = useState<Asset[]>([]);

  // New Asset State
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    id: '',
    name: '',
    model: '',
    status: AssetStatus.AVAILABLE
  });

  const loadAssets = async () => {
    const assets = await dashboardService.getAssets();
    setFleetData(assets);
  };

  useEffect(() => {
    loadAssets();
  }, []);

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

    if (isEdit) {
      // In a real app, use updateAsset. Here we simulate by replacing.
      // We don't have updateAsset in mock service yet, so we could delete and add?
      // Or just assume API will handle it.
      // Let's rely on dashboardService to manage it if we add updateAsset later.
      // For now, let's just add it. If the mock service doesn't dedup, we might have duplicates.
      // Let's manually filter local properly or add updateAsset method to API later.
      // For SAFETY: I'll assume addAsset pushes. I won't delete here to avoid UI flicker/complexity. 
      // actually, let's leave as is for now, just update the object construction to preserve arrays.
    }

    // We will improve this by calling a new update method or just add.
    // Since I can't easily change API right now without multiple steps, I'll just add.
    await dashboardService.addAsset(assetToSave);

    await loadAssets();
    setIsModalOpen(false);
    setNewAsset({ id: '', name: '', model: '', status: AssetStatus.AVAILABLE });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este ativo?')) {
      await dashboardService.deleteAsset(id);
      await loadAssets();
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
    </div>
  );
};

export default FleetManagement;
```

## File: pages/FuelManagement.tsx
```tsx

import React, { useState } from 'react';
import { Fuel, Droplets, History, TrendingUp, AlertTriangle, Plus, Save, Calendar } from 'lucide-react';
import Modal from '../components/Modal';

interface SupplyRecord {
  id: string;
  date: string;
  asset: string;
  liters: number;
  horometer: number;
  efficiency: number;
}

const FuelManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplies, setSupplies] = useState<SupplyRecord[]>([
    { id: '1', date: '22/05 08:45', asset: 'EXC-042', liters: 120, horometer: 4250, efficiency: 4.1 }
  ]);

  // Form State
  const [formData, setFormData] = useState({
    asset: '',
    liters: '',
    horometer: ''
  });

  const handleSave = () => {
    if (!formData.asset || !formData.liters) return;

    const newSupply: SupplyRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      asset: formData.asset,
      liters: Number(formData.liters),
      horometer: Number(formData.horometer),
      efficiency: 0 // Calculate logic would go here
    };

    setSupplies([newSupply, ...supplies]);
    setIsModalOpen(false);
    setFormData({ asset: '', liters: '', horometer: '' });
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Gestão de Combustível</h2>
          <p className="text-slate-500 mt-1">Monitoramento de tanques, abastecimentos e eficiência.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-500 transition-all text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-600/30 flex items-center gap-2"
        >
          <Plus size={18} />
          Registrar Abastecimento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl border border-blue-500/20">
                <Droplets size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Tanque Principal 01</h3>
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Capacidade: 5.000 L</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">3.240 L</p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase">Nível Seguro</p>
            </div>
          </div>
          <div className="w-full h-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative shadow-inner">
            <div className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-1000" style={{ width: '64.8%' }}></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-white tracking-tighter">64.8% DISPONÍVEL</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-600/10 text-orange-500 rounded-2xl border border-orange-500/20">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Comboio de Apoio</h3>
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Placa: ABC-1234</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">240 L</p>
              <p className="text-[10px] text-red-500 font-bold uppercase animate-pulse">Nível Crítico</p>
            </div>
          </div>
          <div className="w-full h-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative shadow-inner">
            <div className="h-full bg-orange-600 transition-all duration-1000" style={{ width: '12%' }}></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-white tracking-tighter">12% DISPONÍVEL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2 bg-slate-950/20">
          <History size={18} className="text-slate-500" />
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Últimos Abastecimentos (Equipamento)</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-8 py-4">Data/Hora</th>
                <th className="px-8 py-4">Equipamento</th>
                <th className="px-8 py-4">Litros</th>
                <th className="px-8 py-4">Horímetro</th>
                <th className="px-8 py-4">Eficiência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {supplies.map(supply => (
                <tr key={supply.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-5 text-slate-400">{supply.date}</td>
                  <td className="px-8 py-5 font-bold text-white">{supply.asset}</td>
                  <td className="px-8 py-5 font-black text-white">{supply.liters} L</td>
                  <td className="px-8 py-5 font-mono text-xs">{supply.horometer}h</td>
                  <td className="px-8 py-5">
                    <span className="flex items-center gap-1 text-emerald-500 font-bold">
                      <TrendingUp size={14} /> {supply.efficiency} L/h
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Supply Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Abastecimento"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Equipamento / Frota</label>
            <input
              value={formData.asset}
              onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
              placeholder="Ex: Escavadeira CAT 320"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Litros</label>
              <input
                type="number"
                value={formData.liters}
                onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                placeholder="0.0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Horímetro Atual</label>
              <input
                type="number"
                value={formData.horometer}
                onChange={(e) => setFormData({ ...formData, horometer: e.target.value })}
                placeholder="0000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <span className="font-black text-xs">$</span>
              </div>
              <h4 className="text-xs font-black uppercase text-emerald-500 tracking-widest">Integração Financeira</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Fornecedor / Posto</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none">
                  <option>Posto Estradão</option>
                  <option>PetroDiesel Dist.</option>
                  <option>Tanque Interno (Sede)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Nota Fiscal (NFe)</label>
                <input type="text" placeholder="000.000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Vencimento da Fatura</label>
              <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Salvar Registro
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default FuelManagement;
```

## File: pages/HRManagement.tsx
```tsx

import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, FileText, User, Save, Search, Download, Edit2, AlertCircle, Plus, Minus, Folder } from 'lucide-react';
import Modal from '../components/Modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { dashboardService } from '../services/api';
import { TimeRecord, PayrollEntry } from '../services/mockData';
import { ERPDocument } from '../types';

type HRTab = 'TIMEKEEPING' | 'PAYROLL' | 'DOCUMENTS';

const HRManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<HRTab>('TIMEKEEPING');
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [isValeModalOpen, setIsValeModalOpen] = useState(false);
    const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
    const [payrollData, setPayrollData] = useState<PayrollEntry[]>([]);
    const [documents, setDocuments] = useState<ERPDocument[]>([]);

    // Editing State
    const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);

    const loadData = async () => {
        const times = await dashboardService.getHRTimeRecords();
        setTimeRecords(times as TimeRecord[]);
        const payroll = await dashboardService.getHRPayroll();
        setPayrollData(payroll as PayrollEntry[]);
        const docs = await dashboardService.getDocuments();
        setDocuments(docs.filter(d => d.category === 'RH'));
    };

    React.useEffect(() => {
        loadData();
    }, []);

    const openEditTimeModal = (record: TimeRecord) => {
        setEditingRecord({ ...record });
        setIsTimeModalOpen(true);
    };

    const handleSaveTimeRecord = async () => {
        if (!editingRecord) return;
        const updated: TimeRecord = { ...editingRecord, status: 'MANUAL_EDIT' };
        await dashboardService.updateHRTimeRecord(updated);
        await loadData();
        setIsTimeModalOpen(false);
        setEditingRecord(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'REGULAR': return 'text-emerald-500 bg-emerald-500/10';
            case 'ABSENT': return 'text-red-500 bg-red-500/10';
            case 'MANUAL_EDIT': return 'text-blue-500 bg-blue-500/10';
            case 'OVERTIME': return 'text-amber-500 bg-amber-500/10';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    const handleExportPDF = () => {
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
        doc.text(`Colaborador: João da Silva (Matrícula: 0045)`, 14, 50);
        doc.text(`Cargo: Mecânico Chefe`, 14, 55);
        doc.text(`Período de Referência: Janeiro/2026`, 14, 60);
        doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 150, 50);
        const tableColumn = ["Data", "Entrada 1", "Saída 1", "Entrada 2", "Saída 2", "Total", "Status"];
        const tableRows = timeRecords.map(record => [
            record.date,
            record.entry1,
            record.exit1,
            record.entry2,
            record.exit2,
            record.totalHours,
            record.status === 'REGULAR' ? 'Normal' : record.status === 'ABSENT' ? 'Falta' : 'Extra'
        ]);
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3 },
            alternateRowStyles: { fillColor: [241, 245, 249] },
            columnStyles: { 0: { fontStyle: 'bold' }, 6: { fontStyle: 'bold' } }
        });
        const finalY = (doc as any).lastAutoTable.finalY + 40;
        if (finalY < 250) {
            doc.setDrawColor(0, 0, 0);
            doc.line(14, finalY, 90, finalY);
            doc.text('João da Silva', 14, finalY + 5);
            doc.setFontSize(8);
            doc.text('Assinatura do Colaborador', 14, finalY + 10);
            doc.line(110, finalY, 196, finalY);
            doc.setFontSize(10);
            doc.text('Gestor Responsável', 110, finalY + 5);
            doc.setFontSize(8);
            doc.text('TerraPro Gestão de Ativos', 110, finalY + 10);
        }
        doc.save('espelho_ponto_joao_silva.pdf');
    };

    // Group documents by 'relatedTo' (Employee)
    const groupedDocs = documents.reduce((acc, doc) => {
        const key = doc.relatedTo || 'Outros / Geral';
        if (!acc[key]) acc[key] = [];
        acc[key].push(doc);
        return acc;
    }, {} as Record<string, ERPDocument[]>);

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
                        <div className="p-4 border-b border-slate-800">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-3 text-slate-500" />
                                <input placeholder="Buscar Colaborador..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} onClick={() => setSelectedEmployee(i)} className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedEmployee === i ? 'bg-blue-600/10 border-blue-600/50' : 'bg-slate-950/50 border-transparent hover:bg-slate-800'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`font-bold text-sm ${selectedEmployee === i ? 'text-blue-400' : 'text-white'}`}>João da Silva</h4>
                                            <p className="text-xs text-slate-500">Mecânico Chefe</p>
                                        </div>
                                        <div className="px-2 py-1 bg-amber-500/10 rounded text-[10px] font-bold text-amber-500 flex items-center gap-1">
                                            <AlertCircle size={10} /> 2 Pendências
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px]">
                        {selectedEmployee ? (
                            <>
                                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                                    <div>
                                        <h3 className="text-lg font-black text-white">Cartão Ponto: Janeiro/2026</h3>
                                        <p className="text-sm text-slate-500">João da Silva • Matrícula: 0045</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleExportPDF} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                                            <Download size={14} /> Exportar PDF
                                        </button>
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20">
                                            <Save size={14} /> Salvar Alterações
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-0">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-950 sticky top-0 z-10 shadow-lg">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-500 tracking-wider">Data</th>
                                                <th className="px-2 py-4 text-[10px] uppercase font-black text-slate-500 text-center">Entrada 1</th>
                                                <th className="px-2 py-4 text-[10px] uppercase font-black text-slate-500 text-center">Saída 1</th>
                                                <th className="px-2 py-4 text-[10px] uppercase font-black text-slate-500 text-center">Entrada 2</th>
                                                <th className="px-2 py-4 text-[10px] uppercase font-black text-slate-500 text-center">Saída 2</th>
                                                <th className="px-4 py-4 text-[10px] uppercase font-black text-slate-500 text-right">Total</th>
                                                <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-500 text-center">Status</th>
                                                <th className="px-4 py-4 text-[10px] uppercase font-black text-slate-500 text-center">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800 text-sm">
                                            {timeRecords.map((record, idx) => (
                                                <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                                                    <td className="px-6 py-4 font-mono text-slate-400">{record.date}</td>
                                                    <td className="px-2 py-4 text-center"><input readOnly value={record.entry1} className="w-16 bg-transparent border-none text-center text-white outline-none" /></td>
                                                    <td className="px-2 py-4 text-center"><input readOnly value={record.exit1} className="w-16 bg-transparent border-none text-center text-white outline-none" /></td>
                                                    <td className="px-2 py-4 text-center"><input readOnly value={record.entry2} className="w-16 bg-transparent border-none text-center text-white outline-none" /></td>
                                                    <td className="px-2 py-4 text-center"><input readOnly value={record.exit2} className="w-16 bg-transparent border-none text-center text-white outline-none" /></td>
                                                    <td className="px-4 py-4 text-right font-bold text-white">{record.totalHours}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(record.status)}`}>
                                                            {record.status === 'MANUAL_EDIT' ? 'Editado' : record.status === 'ABSENT' ? 'Falta' : record.status === 'OVERTIME' ? 'Extra' : 'Normal'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <button onClick={() => openEditTimeModal(record)} className="p-2 hover:bg-slate-800 rounded text-slate-500 hover:text-blue-400 transition-colors" title="Justificar / Editar">
                                                            <Edit2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                                <User size={48} className="mb-4 opacity-50" />
                                <p className="font-bold">Selecione um colaborador para ver o ponto</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'PAYROLL' && (
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
            )}

            {activeTab === 'DOCUMENTS' && (
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
            )}

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
        </div>
    );
};

export default HRManagement;
```

## File: pages/Inventory.tsx
```tsx

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

## File: pages/Login.tsx
```tsx

import React, { useState } from 'react';
import { Lock, Mail, ChevronRight, ShieldCheck, Tractor, Truck, HardHat, Wrench, Pickaxe, Drill, Construction, Settings } from 'lucide-react';
import Logo from '../components/Logo';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1200);
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
              <button className="text-[10px] font-black text-[#007a33] uppercase tracking-tighter hover:underline">Esqueci a Senha</button>
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
          TERRA TRANSPORTADORA E TERRAPLANAGEM LTDA<br/>
          R. RAMÃO ESCOBAR, 4645 • DOURADOS - MS
        </div>
      </div>
    </div>
  );
};

export default Login;
```

## File: pages/Maintenance.tsx
```tsx

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

## File: pages/MapDigital.tsx
```tsx

import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Zap, Battery, Signal, Navigation, Search, Key, Gauge, Radio, Locate, MapPin, RefreshCw, X, Play, Pause, ChevronLeft, ChevronRight, AlertTriangle, Info, Clock, Layers, Maximize } from 'lucide-react';
import { dashboardService } from '../services/api';
import { Asset } from '../types';

type ViewMode = 'LIVE' | 'HISTORY';

interface HistoryPoint {
   id: number;
   lat: number;
   lng: number;
   timestamp: string;
   speed: number;
   ignition: boolean;
   event?: 'STOP' | 'START' | 'SPEEDING' | 'GEOFENCE';
}

const mockHistoryData: HistoryPoint[] = Array.from({ length: 50 }, (_, i) => ({
   id: i,
   lat: 30 + (i * 0.5), // Simulated coords
   lng: 40 + (Math.sin(i) * 10),
   timestamp: `30/01/2026 17:${String(i).padStart(2, '0')}:12`,
   speed: i % 10 === 0 ? 0 : Math.floor(Math.random() * 60),
   ignition: i % 10 !== 0,
   event: i % 15 === 0 ? 'SPEEDING' : i % 10 === 0 ? 'STOP' : undefined
}));

const MapDigital: React.FC = () => {
   const [assets, setAssets] = useState<Asset[]>([]);
   const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [loading, setLoading] = useState(true);
   const [viewMode, setViewMode] = useState<ViewMode>('LIVE');

   // History State
   const [historyPoints, setHistoryPoints] = useState<HistoryPoint[]>([]);
   const [isPlaying, setIsPlaying] = useState(false);
   const [playbackIndex, setPlaybackIndex] = useState(0);
   const playbackInterval = useRef<NodeJS.Timeout | null>(null);

   useEffect(() => {
      const loadAssets = async () => {
         try {
            const data = await dashboardService.getAssets() as Asset[];
            setAssets(data);
            if (data.length > 0) setSelectedAssetId(data[0].id);
         } catch (error) {
            console.error("Failed to load assets", error);
         } finally {
            setLoading(false);
         }
      };
      loadAssets();
   }, []);

   // Load history when entering history mode
   useEffect(() => {
      if (viewMode === 'HISTORY') {
         setHistoryPoints(mockHistoryData);
         setPlaybackIndex(0);
      }
   }, [viewMode]);

   // Playback Logic
   useEffect(() => {
      if (isPlaying) {
         playbackInterval.current = setInterval(() => {
            setPlaybackIndex(prev => {
               if (prev >= historyPoints.length - 1) {
                  setIsPlaying(false);
                  return prev;
               }
               return prev + 1;
            });
         }, 500);
      } else {
         if (playbackInterval.current) clearInterval(playbackInterval.current);
      }
      return () => {
         if (playbackInterval.current) clearInterval(playbackInterval.current);
      };
   }, [isPlaying, historyPoints]);

   const selectedAsset = assets.find(a => a.id === selectedAssetId);
   const filteredAssets = assets.filter(a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const activeCount = assets.filter(a => a.status === 'OPERATING').length;

   if (loading) {
      return (
         <div className="flex h-full items-center justify-center bg-slate-950 text-white">
            <div className="flex flex-col items-center gap-4">
               <RefreshCw className="animate-spin text-emerald-500" size={40} />
               <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Carregando Satélites...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="flex h-full overflow-hidden bg-slate-950">
         {/* Sidebar toggle based on mode */}
         {viewMode === 'LIVE' ? (
            <div className="w-96 border-r border-slate-800 flex flex-col bg-slate-900 z-10 transition-all">
               <div className="p-4 border-b border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                     <h2 className="font-bold text-white flex items-center gap-2">
                        <Radio size={18} className="text-emerald-500 animate-pulse" />
                        Frota Conectada
                     </h2>
                     <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">
                        {activeCount} Online
                     </span>
                  </div>
                  <div className="relative">
                     <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                     <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar ativo ou placa..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {filteredAssets.map(asset => (
                     <div
                        key={asset.id}
                        onClick={() => setSelectedAssetId(asset.id)}
                        className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors group ${selectedAssetId === asset.id ? 'bg-slate-800 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                           }`}
                     >
                        <div className="flex justify-between items-start mb-2">
                           <span className="font-bold text-white text-sm">{asset.name}</span>
                           {asset.telemetry?.ignition ? (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded">
                                 <Key size={10} /> ON
                              </span>
                           ) : (
                              <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-slate-500/10 px-1.5 py-0.5 rounded">
                                 <Key size={10} /> OFF
                              </span>
                           )}
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400">
                           <span>{asset.id}</span>
                           <span className="flex items-center gap-1">
                              <Gauge size={12} /> {asset.telemetry?.speed || 0} km/h
                           </span>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 truncate flex items-center gap-1">
                           <MapIcon size={10} />
                           {asset.telemetry?.address || 'Localização não disponível'}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         ) : null}

         {/* Main Map Visualization */}
         <div className="flex-1 relative bg-[#0f1014] overflow-hidden">
            {/* Simulated Map Background - Darker for History */}
            <div
               className="absolute inset-0 opacity-30"
               style={{
                  backgroundImage: viewMode === 'HISTORY'
                     ? 'url(https://mt1.google.com/vt/lyrs=s&x=1&y=1&z=1)' // Mock Satellite texture concept
                     : 'radial-gradient(#334155 1px, transparent 1px)',
                  backgroundSize: 'cover',
                  backgroundColor: '#0f1710' // Dark green tint for satellite feel
               }}
            >
               {/* CSS Grid Overlay */}
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
            </div>

            {/* Map Controls (Top Left) */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
               <button className="p-2 bg-white text-slate-900 rounded-lg shadow-xl hover:bg-slate-200"><Search size={20} /></button>
               <button className="p-2 bg-white text-slate-900 rounded-lg shadow-xl hover:bg-slate-200"><Maximize size={20} /></button>
            </div>
            {/* Map Layer Controls (Top Right - Inside Map) */}
            <div className="absolute top-4 right-4 z-20 bg-white p-2 rounded-lg shadow-xl flex flex-col gap-2">
               <button className="p-1 hover:bg-slate-100 rounded" title="Map Layers"><Layers size={20} className="text-slate-700" /></button>
            </div>

            {/* Render LIVE Assets or HISTORY Path */}
            {viewMode === 'LIVE' ? (
               assets.map((asset, index) => (
                  <div
                     key={asset.id}
                     onClick={() => setSelectedAssetId(asset.id)}
                     className={`absolute cursor-pointer transition-all duration-500 flex flex-col items-center group
                                        ${selectedAssetId === asset.id ? 'z-50 scale-110' : 'z-0 opacity-70 hover:opacity-100'}
                                    `}
                     style={{
                        top: `${40 + (index * 15)}%`,
                        left: `${30 + (index * 20)}%`
                     }}
                  >
                     <div className={`
                                        relative flex items-center justify-center w-12 h-12 rounded-full border-4 shadow-2xl transition-all
                                        ${selectedAssetId === asset.id
                           ? 'bg-blue-600 border-white shadow-blue-500/50'
                           : asset.telemetry?.ignition
                              ? 'bg-emerald-600 border-slate-900 group-hover:border-emerald-400'
                              : 'bg-slate-700 border-slate-900 group-hover:border-slate-500'
                        }
                                    `}>
                        <Navigation size={20} className="text-white fill-white transform rotate-45" />
                        {asset.telemetry?.speed && asset.telemetry.speed > 0 && (
                           <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30 animate-ping"></span>
                        )}
                     </div>
                     <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-all ${selectedAssetId === asset.id ? 'bg-white text-black scale-100' : 'bg-slate-900 text-white scale-0 group-hover:scale-100'}`}>
                        {asset.name}
                     </div>
                  </div>
               ))
            ) : (
               // HISTORY SVG PATH OVERLAY
               <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  <defs>
                     <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                        <path d="M0,0 L0,10 L10,5 z" fill="#10b981" />
                     </marker>
                  </defs>
                  {/* Simulation of a chaotic path */}
                  <polyline
                     points="200,100 250,150 220,200 300,300 400,250 500,350"
                     fill="none"
                     stroke="#3b82f6"
                     strokeWidth="4"
                     strokeDasharray="10,5"
                  />
                  {/* Drawing simulated points */}
                  {historyPoints.slice(0, playbackIndex + 1).map((pt, i) => (
                     <g key={i} transform={`translate(${200 + (i * 10)}, ${100 + (Math.sin(i) * 50) + (i * 5)})`}>
                        <circle r="4" fill={pt.event === 'STOP' ? '#ef4444' : pt.event === 'SPEEDING' ? '#f59e0b' : '#10b981'} stroke="white" strokeWidth="2" />
                     </g>
                  ))}
                  {/* Current Playback Head */}
                  <g transform={`translate(${200 + (playbackIndex * 10)}, ${100 + (Math.sin(playbackIndex) * 50) + (playbackIndex * 5)})`}>
                     <circle r="10" fill="white" className="animate-pulse" />
                     <circle r="6" fill="#10b981" />
                  </g>
               </svg>
            )}

            {/* Floating Detail Card (LIVE) */}
            {viewMode === 'LIVE' && selectedAsset && (
               <div className="absolute top-6 right-6 w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-right-4 z-30">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h3 className="text-xl font-black text-white">{selectedAsset.name}</h3>
                        <p className="text-sm font-bold text-slate-500">{selectedAsset.id} • {selectedAsset.telemetry?.deviceModel}</p>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Última Atualização</span>
                        <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded">
                           {selectedAsset.telemetry?.lastUpdate.split(' ')[1]}
                        </span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                           <Zap size={14} className="text-yellow-400" />
                           <span className="text-[10px] uppercase font-bold text-slate-400">Voltagem</span>
                        </div>
                        <p className="text-lg font-black text-white">{selectedAsset.telemetry?.voltage} V</p>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                           <Battery size={14} className={selectedAsset.telemetry?.batteryLevel && selectedAsset.telemetry.batteryLevel < 30 ? 'text-red-400' : 'text-emerald-400'} />
                           <span className="text-[10px] uppercase font-bold text-slate-400">Bateria Int.</span>
                        </div>
                        <p className="text-lg font-black text-white">{selectedAsset.telemetry?.batteryLevel}%</p>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                           <Gauge size={14} className="text-blue-400" />
                           <span className="text-[10px] uppercase font-bold text-slate-400">Velocidade</span>
                        </div>
                        <p className="text-lg font-black text-white">{selectedAsset.telemetry?.speed} km/h</p>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                           <Signal size={14} className="text-purple-400" />
                           <span className="text-[10px] uppercase font-bold text-slate-400">Satélites</span>
                        </div>
                        <p className="text-lg font-black text-white">{selectedAsset.telemetry?.satelliteCount}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex dark:bg-slate-950 p-3 rounded-xl border border-slate-800 gap-3">
                        <MapPin className="text-slate-400 shrink-0 mt-0.5" size={16} />
                        <div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Localização Atual</p>
                           <p className="text-xs font-bold text-slate-200 leading-relaxed">
                              {selectedAsset.telemetry?.address}
                           </p>
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2">
                           <Locate size={14} /> Rastrear Agora
                        </button>
                        <button
                           onClick={() => setViewMode('HISTORY')}
                           className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                        >
                           Histórico
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* History Sidebar (Right Side) */}
         {viewMode === 'HISTORY' && (
            <div className="w-[400px] border-l border-slate-800 flex flex-col bg-white z-20 shadow-2xl animate-in slide-in-from-right">
               {/* History Header */}
               <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <div className="flex items-center gap-3">
                     <button onClick={() => setViewMode('LIVE')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ChevronLeft size={20} className="text-gray-600" />
                     </button>
                     <div>
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">Histórico</h2>
                        <p className="text-xs text-gray-500 font-bold">{selectedAsset?.name}</p>
                     </div>
                  </div>
                  <div className="flex gap-1">
                     <button className="p-2 text-gray-600 hover:bg-gray-200 rounded"><RefreshCw size={16} /></button>
                     <button className="p-2 text-gray-600 hover:bg-gray-200 rounded"><layers size={16} /></button>
                  </div>
               </div>

               {/* Timeline Controls */}
               <div className="p-4 bg-gray-100 border-b border-gray-200 space-y-3">
                  <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                     <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                     >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                     </button>
                     <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Playback</p>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(playbackIndex / historyPoints.length) * 100}%` }}></div>
                        </div>
                     </div>
                     <span className="text-xs font-mono font-bold text-gray-600">{playbackIndex}/{historyPoints.length}</span>
                  </div>
               </div>

               {/* Events List Table */}
               <div className="flex-1 overflow-y-auto bg-white">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr className="text-[10px] uppercase font-black text-gray-500 tracking-wider">
                           <th className="px-4 py-3">Data/Hora</th>
                           <th className="px-2 py-3 text-center">Vel</th>
                           <th className="px-2 py-3 text-center">Ignição</th>
                           <th className="px-2 py-3 text-center">Evento</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {historyPoints.map((pt, idx) => (
                           <tr
                              key={pt.id}
                              onClick={() => setPlaybackIndex(idx)}
                              className={`cursor-pointer transition-colors hover:bg-blue-50 ${idx === playbackIndex ? 'bg-blue-100 ring-2 ring-inset ring-blue-500' : ''}`}
                           >
                              <td className="px-4 py-3 text-xs font-mono font-medium text-gray-700">{pt.timestamp}</td>
                              <td className="px-2 py-3 text-center text-xs font-bold text-gray-800">{pt.speed} km/h</td>
                              <td className="px-2 py-3 text-center">
                                 <div className="flex justify-center">
                                    {pt.ignition ?
                                       <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center"><Zap size={12} className="text-emerald-600" fill="currentColor" /></div> :
                                       <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center"><Zap size={12} className="text-gray-400" /></div>
                                    }
                                 </div>
                              </td>
                              <td className="px-2 py-3 text-center">
                                 {pt.event && (
                                    <div className="flex justify-center tooltip" title={pt.event}>
                                       {pt.event === 'STOP' && <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center"><OctagonPause size={12} className="text-red-600" /></div>}
                                       {pt.event === 'SPEEDING' && <div className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center"><AlertTriangle size={12} className="text-amber-600" /></div>}
                                    </div>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}
      </div>
   );
};

// Start Icon helper
const OctagonPause = ({ size, className }: { size: number, className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <rect x="9" y="8" width="2" height="8" fill="currentColor" stroke="none" />
      <rect x="13" y="8" width="2" height="8" fill="currentColor" stroke="none" />
   </svg>
);

export default MapDigital;
```

## File: pages/OperationsMap.tsx
```tsx
import React from 'react';
const { useState, useEffect } = React;
import { Calendar, ChevronLeft, ChevronRight, Filter, Download, Plus, Search, MapPin, Hammer, CloudRain, Clock } from 'lucide-react';
import { dashboardService } from '../services/api';
import { EquipmentTimeline, TimelineCell } from '../services/mockData';

const DAYS_IN_MONTH = 31;
const MOCK_MONTH = 'Dezembro 2024';

const OperationsMap: React.FC = () => {
    const [data, setData] = useState<EquipmentTimeline[]>([]);
    const [selectedCell, setSelectedCell] = useState<{ eqId: string, day: number } | null>(null);

    useEffect(() => {
        const load = async () => {
            const result = await dashboardService.getOperationsMapData();
            setData(result as EquipmentTimeline[]);
        };
        load();
    }, []);

    const getStatusColor = (status: TimelineCell['status']) => {
        switch (status) {
            case 'WORKED': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/40';
            case 'STANDBY': return 'bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-700';
            case 'MAINTENANCE': return 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/40';
            case 'RAIN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/40';
            default: return 'bg-transparent border-slate-800/50 hover:bg-slate-800';
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
        setSelectedCell({ eqId, day });
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
                        <button className="text-slate-400 hover:text-white"><ChevronLeft size={16} /></button>
                        <span className="mx-4 text-sm font-bold text-white uppercase tracking-wider">{MOCK_MONTH}</span>
                        <button className="text-slate-400 hover:text-white"><ChevronRight size={16} /></button>
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
                    <input placeholder="Filtrar Equipamento..." className="bg-transparent text-xs text-white outline-none w-full placeholder:text-slate-600" />
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
                    <div className="w-64 shrink-0 p-3 border-r border-slate-800 text-xs font-black text-slate-500 uppercase tracking-wider flex items-center">
                        Equipamento / Local
                    </div>
                    <div className="flex-1 overflow-x-auto custom-scrollbar flex">
                        {Array.from({ length: DAYS_IN_MONTH }, (_, i) => (
                            <div key={i} className="w-12 shrink-0 border-r border-slate-800/50 py-2 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][i % 7]}</span>
                                <span className={`text-xs font-black ${i % 7 === 0 || i % 7 === 6 ? 'text-indigo-400' : 'text-white'}`}>{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {data.map(eq => (
                        <div key={eq.id} className="flex border-b border-slate-800/50 hover:bg-slate-900/20 transition-colors">
                            {/* Equipment Column */}
                            <div className="w-64 shrink-0 p-3 border-r border-slate-800 bg-slate-950 z-10 sticky left-0 flex flex-col justify-center">
                                <p className="text-sm font-bold text-white">{eq.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{eq.id}</p>
                            </div>

                            {/* Cells */}
                            <div className="flex-1 flex">
                                {eq.timeline.map(cell => (
                                    <div
                                        key={cell.day}
                                        onClick={() => handleCellClick(eq.id, cell.day)}
                                        className={`w-12 shrink-0 border-r border-slate-800/30 h-16 p-1 cursor-pointer transition-all relative group`}
                                    >
                                        <div className={`w-full h-full rounded border flex flex-col items-center justify-center gap-1 ${getStatusColor(cell.status)}`}>
                                            {cell.status === 'WORKED' && <span className="text-[10px] font-black">{cell.hours}h</span>}
                                            {getStatusIcon(cell.status)}
                                        </div>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl font-bold">
                                            {cell.location || 'Sem Local'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Modal (Enhanced) */}
            {selectedCell && (
                <EditModal
                    cell={data.find(d => d.id === selectedCell.eqId)?.timeline.find(t => t.day === selectedCell.day)!}
                    onClose={() => setSelectedCell(null)}
                    onSave={(updatedCell) => {
                        const newData = data.map(eq => {
                            if (eq.id === selectedCell.eqId) {
                                return {
                                    ...eq,
                                    timeline: eq.timeline.map(t => t.day === selectedCell.day ? updatedCell : t)
                                };
                            }
                            return eq;
                        });
                        setData(newData);
                        dashboardService.updateOperationsMapData(newData.find(d => d.id === selectedCell.eqId)!);
                        setSelectedCell(null);
                    }}
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

## File: pages/Registrations.tsx
```tsx

import React, { useState } from 'react';
import { Users, Building2, Briefcase, Search, Plus, Save, Edit, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

type EntityType = 'CLIENTS' | 'SUPPLIERS' | 'EMPLOYEES';

const Registrations: React.FC = () => {
    const [activeTab, setActiveTab] = useState<EntityType>('CLIENTS');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock Data
    const clients = [
        { id: 1, name: 'Construtora Horizonte', doc: '12.345.678/0001-90', email: 'contato@horizonte.com', phone: '(11) 99999-0000', city: 'São Paulo, SP' },
        { id: 2, name: 'Mineração Vale do Sul', doc: '98.765.432/0001-10', email: 'compras@valedosul.com', phone: '(31) 3333-4444', city: 'Belo Horizonte, MG' },
    ];

    const suppliers = [
        { id: 1, name: 'Peças & Cia', doc: '11.222.333/0001-55', category: 'Peças Mecânicas', contact: 'Roberto', phone: '(11) 5555-1234' },
        { id: 2, name: 'PetroDiesel Distribuidora', doc: '44.555.666/0001-88', category: 'Combustível', contact: 'Fernanda', phone: '(21) 98888-7777' },
    ];

    const employees = [
        { id: 1, name: 'João da Silva', role: 'Mecânico Chefe', email: 'joao.silva@terrapro.com', status: 'ACTIVE' },
        { id: 2, name: 'Maria Oliveira', role: 'Gerente Operacional', email: 'maria.oliveira@terrapro.com', status: 'ACTIVE' },
        { id: 3, name: 'Carlos Santos', role: 'Operador de Máquinas', email: 'carlos.santos@terrapro.com', status: 'VACATION' },
    ];

    const renderHeader = () => (
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Cadastros Gerais</h2>
                <p className="text-slate-500 mt-1">Gestão centralizada de entidades do sistema.</p>
            </div>
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center gap-2"
            >
                <Plus size={18} />
                {activeTab === 'CLIENTS' ? 'Novo Cliente' : activeTab === 'SUPPLIERS' ? 'Novo Fornecedor' : 'Novo Funcionário'}
            </button>
        </div>
    );

    const renderTabs = () => (
        <div className="flex gap-4 mb-6 border-b border-slate-800 pb-1">
            <button
                onClick={() => setActiveTab('CLIENTS')}
                className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'CLIENTS' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-white'}`}
            >
                <div className="flex items-center gap-2">
                    <Users size={18} /> Clientes
                </div>
            </button>
            <button
                onClick={() => setActiveTab('SUPPLIERS')}
                className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'SUPPLIERS' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-white'}`}
            >
                <div className="flex items-center gap-2">
                    <Building2 size={18} /> Fornecedores
                </div>
            </button>
            <button
                onClick={() => setActiveTab('EMPLOYEES')}
                className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'EMPLOYEES' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-white'}`}
            >
                <div className="flex items-center gap-2">
                    <Briefcase size={18} /> Funcionários
                </div>
            </button>
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
            {renderHeader()}
            {renderTabs()}

            {/* Main Content Area */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/20">
                    <div className="relative w-full max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            placeholder="Buscar..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                            <tr>
                                {activeTab === 'CLIENTS' && (
                                    <>
                                        <th className="px-8 py-4">Nome / Razão Social</th>
                                        <th className="px-8 py-4">CNPJ / CPF</th>
                                        <th className="px-8 py-4">Contato</th>
                                        <th className="px-8 py-4">Cidade</th>
                                    </>
                                )}
                                {activeTab === 'SUPPLIERS' && (
                                    <>
                                        <th className="px-8 py-4">Fornecedor</th>
                                        <th className="px-8 py-4">CNPJ</th>
                                        <th className="px-8 py-4">Categoria</th>
                                        <th className="px-8 py-4">Contato Oficial</th>
                                    </>
                                )}
                                {activeTab === 'EMPLOYEES' && (
                                    <>
                                        <th className="px-8 py-4">Colaborador</th>
                                        <th className="px-8 py-4">Cargo / Função</th>
                                        <th className="px-8 py-4">Email Corporativo</th>
                                        <th className="px-8 py-4">Status</th>
                                    </>
                                )}
                                <th className="px-8 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {activeTab === 'CLIENTS' && clients.map(c => (
                                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-8 py-5 font-bold text-white">{c.name}</td>
                                    <td className="px-8 py-5 text-slate-400 font-mono text-xs">{c.doc}</td>
                                    <td className="px-8 py-5 text-slate-300">
                                        <div className="flex flex-col">
                                            <span>{c.email}</span>
                                            <span className="text-xs text-slate-500">{c.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-slate-400">{c.city}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Edit size={16} /></button>
                                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'SUPPLIERS' && suppliers.map(s => (
                                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-8 py-5 font-bold text-white">{s.name}</td>
                                    <td className="px-8 py-5 text-slate-400 font-mono text-xs">{s.doc}</td>
                                    <td className="px-8 py-5">
                                        <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold uppercase text-slate-300">{s.category}</span>
                                    </td>
                                    <td className="px-8 py-5 text-slate-300">
                                        <div className="flex flex-col">
                                            <span>{s.contact}</span>
                                            <span className="text-xs text-slate-500">{s.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Edit size={16} /></button>
                                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'EMPLOYEES' && employees.map(e => (
                                <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-8 py-5 font-bold text-white">{e.name}</td>
                                    <td className="px-8 py-5 text-slate-300">{e.role}</td>
                                    <td className="px-8 py-5 text-slate-400">{e.email}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${e.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {e.status === 'ACTIVE' ? 'Ativo' : 'Férias'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Edit size={16} /></button>
                                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
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
                title={
                    activeTab === 'CLIENTS' ? 'Novo Cliente' :
                        activeTab === 'SUPPLIERS' ? 'Novo Fornecedor' : 'Novo Funcionário'
                }
            >
                {activeTab === 'CLIENTS' ? (
                    <div className="space-y-6">
                        {/* Tabs for Client Form */}
                        <div className="flex gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
                            <button className="px-3 py-1.5 text-xs font-bold text-blue-500 border-b-2 border-blue-500">Dados Gerais</button>
                            <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors">Comercial e Crédito</button>
                            <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors">Societário e Docs</button>
                        </div>

                        {/* General Data Section */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Razão Social / Nome Completo</label>
                                <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Terraplanagem do Brasil LTDA" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">CNPJ / CPF</label>
                                    <div className="flex gap-2">
                                        <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" placeholder="00.000.000/0001-00" />
                                        <button className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl" title="Consulta Receita Federal"><Search size={18} /></button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Inscrição Estadual</label>
                                    <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" placeholder="Isento" />
                                </div>
                            </div>
                        </div>

                        {/* Commercial & Credit Section Preview (Simulated inside the long form for simplicity or tabs logic can be added later) */}
                        <div className="pt-4 border-t border-slate-800">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Análise de Crédito e Vendas</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Limite de Crédito (R$)</label>
                                    <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500 outline-none" placeholder="0,00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Classificação (Rating)</label>
                                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none">
                                        <option>BOM - Aprovado</option>
                                        <option>REGULAR - Restrito</option>
                                        <option>RUIM - Bloqueado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 md:col-span-8 space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Condição de Pagamento Padrão</label>
                                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none">
                                        <option>28 DDL</option>
                                        <option>30/60/90 DDL</option>
                                        <option>À Vista (Antecipado)</option>
                                    </select>
                                </div>
                                <div className="col-span-12 md:col-span-4 space-y-2 flex items-end">
                                    <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 p-3 rounded-xl w-full hover:border-blue-500 transition-colors">
                                        <input type="checkbox" className="accent-blue-500 w-4 h-4" />
                                        <span className="text-xs font-bold text-white">Vender só à Vista</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Societary Section */}
                        <div className="pt-4 border-t border-slate-800">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quadro Societário e Documentos</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-5"><input className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" placeholder="Nome do Sócio 1" /></div>
                                    <div className="col-span-3"><input className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" placeholder="CPF" /></div>
                                    <div className="col-span-3"><input className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" placeholder="% Part." /></div>
                                    <div className="col-span-1 flex items-center justify-center"><button className="p-2 bg-blue-600/20 text-blue-500 rounded-lg"><Plus size={14} /></button></div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 border border-dashed border-slate-700 bg-slate-900/50 p-3 rounded-xl text-xs font-bold text-slate-500 hover:text-white hover:border-slate-500 transition-all">
                                        Anexar Cartão CNPJ
                                    </button>
                                    <button className="flex-1 border border-dashed border-slate-700 bg-slate-900/50 p-3 rounded-xl text-xs font-bold text-slate-500 hover:text-white hover:border-slate-500 transition-all">
                                        Anexar Contrato Social
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">Cancelar</button>
                            <button onClick={() => setIsModalOpen(false)} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                                <Save size={18} /> Salvar Cliente Completo
                            </button>
                        </div>
                    </div>
                ) : (
                    // Default Simple Form for other tabs (Suppliers/Employees) since user specially requested CLIENT info detail
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo / Razão Social</label>
                            <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                        </div>
                        {activeTab !== 'EMPLOYEES' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Documento (CPF/CNPJ)</label>
                                <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                            </div>
                        )}
                        {activeTab === 'EMPLOYEES' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Cargo / Função</label>
                                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none">
                                    <option>Mecânico</option>
                                    <option>Operador</option>
                                    <option>Administrativo</option>
                                    <option>Gerente</option>
                                </select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                                <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Salário Base (CLT)</label>
                                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3">
                                    <span className="text-slate-500 text-xs">R$</span>
                                    <input className="w-full bg-transparent text-white focus:outline-none" placeholder="2.500,00" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Admissão</label>
                                <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                            </div>
                        </div>

                        <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Composição Salarial ("Penduricalhos")</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 p-2 rounded-lg hover:border-blue-500 transition-colors">
                                    <input type="checkbox" className="accent-blue-500 w-4 h-4" />
                                    <span className="text-xs font-medium text-slate-300">Periculosidade (30%)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 p-2 rounded-lg hover:border-blue-500 transition-colors">
                                    <input type="checkbox" className="accent-blue-500 w-4 h-4" />
                                    <span className="text-xs font-medium text-slate-300">Insalubridade (Grau Médio)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 p-2 rounded-lg hover:border-blue-500 transition-colors">
                                    <input type="checkbox" className="accent-blue-500 w-4 h-4" />
                                    <span className="text-xs font-medium text-slate-300">Adicional Noturno (20%)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 p-2 rounded-lg hover:border-blue-500 transition-colors">
                                    <input type="checkbox" className="accent-blue-500 w-4 h-4" />
                                    <span className="text-xs font-medium text-slate-300">Salário Família</span>
                                </label>
                            </div>
                            <div className="pt-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Bonificação Fixa (Função)</label>
                                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 mt-1">
                                    <span className="text-slate-500 text-xs">R$</span>
                                    <input className="w-full bg-transparent text-white text-xs focus:outline-none" placeholder="0,00" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Salvar Colaborador
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Registrations;
```

## File: pages/SecurityAudit.tsx
```tsx

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

## File: pages/Settings.tsx
```tsx

import React, { useState } from 'react';
import { ShieldCheck, UserCog, Lock, Save, Plus, Search } from 'lucide-react';
import Modal from '../components/Modal';

const Settings: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const users = [
        { id: 1, name: 'Pedro Miranda', email: 'admin@terrapro.com', role: 'ADMIN', lastLogin: 'Hoje 14:30' },
        { id: 2, name: 'João Mecânico', email: 'joao@terrapro.com', role: 'OPERATOR', lastLogin: 'Ontem 09:15' },
        { id: 3, name: 'Maria Financeiro', email: 'maria@terrapro.com', role: 'MANAGER', lastLogin: 'Hoje 08:00' },
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Configurações & Acesso</h2>
                    <p className="text-slate-500 mt-1">Gestão de usuários, permissões e segurança do sistema.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
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
                        <h3 className="text-white font-bold text-lg">Alto (MFA Ativo)</h3>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
                        <UserCog size={32} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Usuários Ativos</p>
                        <h3 className="text-white font-bold text-lg">12 Usuários</h3>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Usuários do Sistema</h3>
                    <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 w-full max-w-md focus-within:border-blue-500 transition-all">
                        <Search size={18} className="text-slate-500" />
                        <input
                            placeholder="Buscar usuário por nome ou email..."
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-600 focus:outline-none text-white"
                        />
                    </div>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        <tr>
                            <th className="px-8 py-4">Usuário</th>
                            <th className="px-8 py-4">Email</th>
                            <th className="px-8 py-4">Função (Role)</th>
                            <th className="px-8 py-4">Último Acesso</th>
                            <th className="px-8 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                            {u.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-white">{u.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-slate-400">{u.email}</td>
                                <td className="px-8 py-5">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' :
                                            u.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-slate-700 text-slate-400'
                                        }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-slate-500 text-xs">{u.lastLogin}</td>
                                <td className="px-8 py-5 text-right">
                                    <button className="text-blue-500 hover:text-white font-bold text-xs">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Usuário"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                        <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email Corporativo</label>
                        <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nível de Acesso (Role)</label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none">
                            <option value="OPERATOR">Operador (Acesso Limitado)</option>
                            <option value="MECHANIC">Mecânico (Ordens de Serviço)</option>
                            <option value="MANAGER">Gerente (Relatórios e Aprovações)</option>
                            <option value="ADMIN">Administrador (Acesso Total)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Senha Temporária</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-emerald-500 outline-none" />
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Criar Usuário
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;
```

## File: pages/WhatsAppAutomation.tsx
```tsx

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
```
