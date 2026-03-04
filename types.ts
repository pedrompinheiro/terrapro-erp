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

  nextRevision?: string;
  efficiency?: number;
  manuals?: ERPDocument[];

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

export type InventoryTab = 'ESTOQUE' | 'MOVIMENTACOES' | 'ORDENS_SERVICO' | 'COMPRAS' | 'TECNICOS' | 'RELATORIOS';

export interface InventoryMovement {
  id: string;
  item_id: string;
  movement_type:
    | 'ENTRADA_COMPRA' | 'ENTRADA_DEVOLUCAO' | 'ENTRADA_AJUSTE' | 'ENTRADA_RETIRADA' | 'ENTRADA_NF'
    | 'SAIDA_OS' | 'SAIDA_VENDA' | 'SAIDA_AJUSTE' | 'SAIDA_PERDA' | 'SAIDA_CONSUMO_INTERNO' | 'SAIDA_EQUIPAMENTO'
    | 'TRANSFERENCIA';
  quantity: number;
  unit_cost: number;
  total_value: number;
  balance_after: number;
  reference_type?: string;
  reference_id?: string;
  reference_number?: number;
  entity_id?: string;
  entity_name?: string;
  user_id?: string;
  user_name?: string;
  invoice_number?: string;
  invoice_date?: string;
  notes?: string;
  receipt_id?: string;
  supplier_invoice_id?: string;
  destination_type?: 'INTERNAL_CONSUMPTION' | 'EQUIPMENT_MAINTENANCE' | 'SERVICE_ORDER' | 'WORKSITE' | 'STOCK' | 'TRANSFER' | 'SALE' | 'LOSS';
  cost_center_id?: string;
  equipment_id?: string;
  service_order_id?: string;
  hourmeter?: number;
  responsible_technician_id?: string;
  created_at: string;
  // Joined fields
  item_description?: string;
  item_code?: number;
  item_unit?: string;
  equipment_name?: string;
  cost_center_name?: string;
}

export interface ServiceOrder {
  id: string;
  order_number: number;
  is_order: boolean;
  is_quote: boolean;
  is_call: boolean;
  entry_date?: string;
  entry_time?: string;
  exit_date?: string;
  exit_time?: string;
  client_code?: number;
  client_name?: string;
  client_contact?: string;
  client_phone?: string;
  client_whatsapp?: string;
  equipment_code?: number;
  equipment_name?: string;
  model_code?: number;
  model_name?: string;
  brand_code?: number;
  brand_name?: string;
  plate?: string;
  color?: string;
  km: number;
  year_fab?: number;
  year_model?: number;
  fuel_type?: string;
  serial_number?: string;
  situation_code?: number;
  situation?: string;
  defect_1?: string;
  defect_2?: string;
  service_1?: string;
  service_2?: string;
  service_3?: string;
  service_4?: string;
  service_5?: string;
  technician_code?: number;
  technician_name?: string;
  responsible?: string;
  products_value: number;
  services_value: number;
  labor_value: number;
  displacement_value: number;
  discount_value: number;
  total_value: number;
  payment_form?: string;
  payment_conditions?: string;
  is_paid: boolean;
  observations?: string;
  defect_memo?: string;
  findings_memo?: string;
  service_memo?: string;
  general_notes_memo?: string;
  status: boolean;
  created_at?: string;
}

export interface ServiceOrderItem {
  id: string;
  service_order_id: string;
  order_number: number;
  item_id?: string;
  product_code?: number;
  description: string;
  reference?: string;
  is_service: boolean;
  is_product: boolean;
  unit: string;
  unit_cost: number;
  unit_price: number;
  quantity: number;
  discount: number;
  discount_percent: number;
  total: number;
  commission: number;
  technician_code?: number;
  technician_name?: string;
  client_name?: string;
  plate?: string;
  item_date?: string;
  status: boolean;
  created_at: string;
}

export interface ServiceOrderStatus {
  id: string;
  code: number;
  name: string;
  color: string;
  icon?: string;
  is_final: boolean;
  sort_order: number;
  active: boolean;
}

export interface PurchaseOrder {
  id: string;
  order_number: number;
  is_order: boolean;
  is_quote: boolean;
  order_date?: string;
  order_time?: string;
  delivery_date?: string;
  delivery_time?: string;
  supplier_code?: number;
  supplier_name?: string;
  supplier_contact?: string;
  supplier_phone?: string;
  situation_code?: number;
  situation?: string;
  technician_code?: number;
  technician_name?: string;
  items_count: number;
  total_qty: number;
  products_value: number;
  other_costs: number;
  discount: number;
  total_value: number;
  payment_form?: string;
  payment_conditions?: string;
  is_paid: boolean;
  invoice_number?: number;
  invoice_date?: string;
  observations?: string;
  status: boolean;
  created_at?: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  order_number: number;
  item_id?: string;
  product_code?: number;
  description: string;
  reference?: string;
  barcode?: string;
  is_product: boolean;
  unit: string;
  unit_cost: number;
  unit_price: number;
  quantity: number;
  discount: number;
  discount_percent: number;
  total: number;
  delivery_date?: string;
  shortage: number;
  supplier_code?: number;
  supplier_name?: string;
  status: boolean;
  notes?: string;
  created_at: string;
}

export interface Technician {
  id: string;
  code: number;
  name: string;
  is_technician: boolean;
  is_mechanic: boolean;
  is_seller: boolean;
  is_attendant: boolean;
  commission_percent: number;
  commission_on_products: boolean;
  commission_on_services: boolean;
  phone?: string;
  cell_phone?: string;
  email?: string;
  cpf?: string;
  is_active: boolean;
  is_blocked: boolean;
  total_sales: number;
  total_qty: number;
  revenue: number;
}

export interface CategorySummary {
  category_name: string;
  total_items: number;
  zero_stock: number;
  below_minimum: number;
  total_cost_value: number;
  total_sell_value: number;
}

export interface BelowMinimumItem {
  id: string;
  code: number;
  sku?: string;
  description: string;
  category_name?: string;
  brand_name?: string;
  unit: string;
  qty_current: number;
  qty_minimum: number;
  qty_needed: number;
  cost_price: number;
  estimated_cost: number;
  location?: string;
  last_purchase_date?: string;
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

// ============================================================
// MÓDULO RETIRADAS / NF FORNECEDOR
// ============================================================

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  type: 'ADMIN' | 'SHOP' | 'WORKSITE' | 'ALMOX' | 'OTHER';
  is_active: boolean;
  created_at?: string;
}

export interface PurchaseReceipt {
  id: string;
  supplier_name: string;
  supplier_id?: string;
  purchase_order_id?: string;
  receipt_number: string;
  receipt_date: string;
  status: 'DRAFT' | 'FINALIZED' | 'PENDING_INVOICE' | 'INVOICED' | 'CANCELED';
  notes?: string;
  finalized_at?: string;
  finalized_by?: string;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
  // Computed (joined)
  items_count?: number;
  total_qty?: number;
  estimated_total?: number;
}

export interface PurchaseReceiptItem {
  id: string;
  purchase_receipt_id: string;
  inventory_item_id: string;
  qty: number;
  unit_cost_estimated: number;
  notes?: string;
  created_at?: string;
  // Joined
  item_description?: string;
  item_code?: number;
  item_unit?: string;
}

export interface PurchaseReceiptItemAllocation {
  id: string;
  purchase_receipt_item_id: string;
  allocation_type: 'EQUIPMENT' | 'COST_CENTER' | 'SERVICE_ORDER' | 'STOCK';
  equipment_id?: string;
  cost_center_id?: string;
  service_order_id?: string;
  qty_allocated: number;
  created_at?: string;
  // Joined
  equipment_name?: string;
  cost_center_name?: string;
}

export interface SupplierInvoice {
  id: string;
  supplier_name: string;
  invoice_number: string;
  chave_nfe?: string;
  serie?: string;
  issue_date?: string;
  due_date?: string;
  total_invoice: number;
  status: 'OPEN' | 'PAID' | 'CANCELED';
  supplier_cnpj?: string;
  xml_url?: string;
  pdf_url?: string;
  notes?: string;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierInvoiceLine {
  id: string;
  supplier_invoice_id: string;
  inventory_item_id?: string;
  description?: string;
  ncm?: string;
  cfop?: string;
  ean?: string;
  unit?: string;
  qty: number;
  unit_cost: number;
  total: number;
  matched_confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' | 'MANUAL';
  needs_review: boolean;
  created_at?: string;
  // Joined
  matched_item_description?: string;
}

export interface NfeImportJob {
  id: string;
  file_type: 'XML' | 'PDF' | 'IMAGE' | 'CHAVE_MANUAL';
  file_name?: string;
  file_url?: string;
  chave_nfe?: string;
  status: 'PENDING' | 'PROCESSING' | 'PARSED' | 'REVIEW' | 'CONFIRMED' | 'ERROR';
  extracted_text?: string;
  parsed_data?: any;
  error_message?: string;
  confidence_score?: number;
  supplier_invoice_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// MÓDULO OS - CRIAÇÃO / EDIÇÃO
// ============================================================

export type OSFormTab = 'cliente' | 'servicos' | 'financeiro' | 'extras';

export interface ChecklistItem {
  label: string;
  checked: boolean;
  notes?: string;
}

export interface ServiceOrderLineItem {
  _key: string;
  id?: string;
  item_id?: string;
  product_code?: number;
  description: string;
  reference: string;
  is_service: boolean;
  is_product: boolean;
  unit: string;
  unit_cost: number;
  unit_price: number;
  quantity: number;
  discount: number;
  discount_percent: number;
  total: number;
  commission: number;
  technician_code?: number;
  technician_name: string;
  item_date: string;
  // UI-only
  _searchText?: string;
  _stockQty?: number;
  _stockWarning?: boolean;
}
