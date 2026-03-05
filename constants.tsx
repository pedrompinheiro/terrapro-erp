
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
  Database,
  Calculator,
  Camera
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
  { id: 'ponto', label: 'Cálculo de Ponto', icon: <Calculator size={20} />, group: 'Gestão', path: '/ponto/calculos', slug: 'rh_folha_ponto' },
  { id: 'ocr', label: 'Importação OCR Ponto', icon: <Camera size={20} />, group: 'Gestão', path: '/ponto/ocr', slug: 'rh_folha_ponto' },
  { id: 'integracoes', label: 'Integrações', icon: <ClipboardCheck size={20} />, group: 'Gestão', path: '/integracoes', slug: 'rh_folha_ponto' },
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
