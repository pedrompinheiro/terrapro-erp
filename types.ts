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

// ============================================================
// MÓDULO ALMOXARIFADO - Tipos completos (Supabase)
// ============================================================

export interface InventoryCategory {
  id: string;
  code: number;
  name: string;
  margin_1: number;
  margin_2: number;
  margin_3: number;
  notes?: string;
  active: boolean;
}

export interface InventoryBrand {
  id: string;
  code: number;
  name: string;
  active: boolean;
}

export interface InventoryItem {
  id: string;
  code: number;
  sku?: string;
  barcode?: string;
  description: string;

  is_service: boolean;
  is_product: boolean;
  item_type: 'PRODUTO' | 'SERVICO';
  unit: string;

  category_id?: string;
  category_name?: string;
  brand_id?: string;
  brand_name?: string;

  // Estoque
  qty_minimum: number;
  qty_current: number;
  qty_maximum: number;
  qty_unit: number;
  qty_in: number;
  qty_out: number;
  qty_balance: number;
  qty_shortage: number;

  // Preços
  cost_price: number;
  sell_price: number;
  margin_percent: number;
  wholesale_price: number;
  margin_2_percent: number;
  margin_3_percent: number;
  commission_percent: number;
  total_cost: number;
  profit: number;
  profit_percent: number;

  // Localização
  location?: string;

  // Fotos
  photo_1_url?: string;
  photo_2_url?: string;

  // Validade
  has_expiry: boolean;
  expiry_date?: string;

  // Alertas
  alert_minimum: boolean;
  alert_zero: boolean;
  blocked: boolean;

  // Stats
  most_sold_value: number;
  most_sold_qty: number;

  // Fiscal
  ncm?: string;
  cfop?: string;
  origin?: string;

  // Observações
  notes?: string;

  // Legacy
  legacy_code?: number;
  last_purchase_date?: string;

  active: boolean;
  created_at?: string;
  updated_at?: string;

  // Computed status (não vem do BD, calculado no frontend)
  status?: 'NORMAL' | 'CRITICAL' | 'WARNING';
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  movement_type: 'ENTRADA_COMPRA' | 'ENTRADA_DEVOLUCAO' | 'ENTRADA_AJUSTE' | 'SAIDA_OS' | 'SAIDA_VENDA' | 'SAIDA_AJUSTE' | 'SAIDA_PERDA';
  quantity: number;
  unit_cost: number;
  total_value: number;
  balance_after: number;
  reference_type?: string;
  reference_id?: string;
  reference_number?: number;
  entity_id?: string;
  entity_name?: string;
  user_name?: string;
  invoice_number?: string;
  invoice_date?: string;
  notes?: string;
  created_at: string;
}

export interface ServiceOrder {
  id: string;
  order_number: number;
  is_order: boolean;
  is_quote: boolean;
  entry_date?: string;
  exit_date?: string;
  client_name?: string;
  client_phone?: string;
  equipment_name?: string;
  model_name?: string;
  brand_name?: string;
  plate?: string;
  km: number;
  situation?: string;
  technician_name?: string;
  products_value: number;
  services_value: number;
  total_value: number;
  is_paid: boolean;
  status: boolean;
  created_at?: string;
}

export interface PurchaseOrder {
  id: string;
  order_number: number;
  is_order: boolean;
  is_quote: boolean;
  order_date?: string;
  supplier_name?: string;
  situation?: string;
  total_value: number;
  is_paid: boolean;
  status: boolean;
  created_at?: string;
}

export interface Technician {
  id: string;
  code: number;
  name: string;
  is_technician: boolean;
  is_mechanic: boolean;
  phone?: string;
  cell_phone?: string;
  email?: string;
  is_active: boolean;
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
