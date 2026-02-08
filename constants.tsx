
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
  { id: 'connection', label: 'Status Conexão', path: '/teste', icon: <Database size={20} /> },
  { id: 'settings', label: 'Configurações', path: '/configuracoes', icon: <Settings size={20} /> }, // Added path
  { id: 'logout', label: 'Sair', icon: <LogOut size={20} />, color: 'text-red-400' },
];
