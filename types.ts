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
