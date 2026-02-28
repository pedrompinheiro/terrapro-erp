import { supabase } from '../lib/supabase';

// ============ TYPES ============

export interface IntegrationTemplate {
  id: string;
  company_id?: string;
  client_name: string;
  client_code?: string;
  unit_name?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  is_active: boolean;
  alert_days: number[];
  block_on_expiry: boolean;
  block_grace_days: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: IntegrationTemplateItem[];
}

export interface IntegrationTemplateItem {
  id: string;
  template_id: string;
  document_name: string;
  document_category: string;
  is_required: boolean;
  validity_value?: number;
  validity_unit: 'DAYS' | 'MONTHS' | 'YEARS';
  blocks_on_expiry: boolean;
  alert_only: boolean;
  sort_order: number;
  notes?: string;
  created_at: string;
}

export type DocStatus = 'PENDENTE' | 'OK' | 'A_VENCER' | 'VENCIDO' | 'BLOQUEADO' | 'EM_ANALISE' | 'REJEITADO';
export type IntegrationStatusType = 'PENDENTE' | 'ATIVO' | 'BLOQUEADO' | 'INATIVO';

export interface EmployeeIntegration {
  id: string;
  employee_id: string;
  template_id: string;
  status: IntegrationStatusType;
  started_at: string;
  completed_at?: string;
  blocked_at?: string;
  blocked_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: { id: string; full_name: string; cpf?: string; job_title?: string };
  template?: IntegrationTemplate;
  docs?: EmployeeIntegrationDoc[];
}

export interface EmployeeIntegrationDoc {
  id: string;
  employee_integration_id: string;
  template_item_id: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  issue_date?: string;
  expiry_date?: string;
  status: DocStatus;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  current_version: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  template_item?: IntegrationTemplateItem;
  versions?: DocVersion[];
}

export interface DocVersion {
  id: string;
  doc_id: string;
  version_number: number;
  file_url: string;
  file_name?: string;
  file_size?: number;
  issue_date?: string;
  expiry_date?: string;
  uploaded_by?: string;
  notes?: string;
  created_at: string;
}

export interface IntegrationAlert {
  id: string;
  employee_integration_id: string;
  doc_id?: string;
  alert_level: 'INFO' | 'WARNING' | 'CRITICAL' | 'BLOCK';
  alert_type: string;
  title: string;
  message: string;
  days_until_expiry?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface DashboardStats {
  totalIntegrations: number;
  activeIntegrations: number;
  blockedIntegrations: number;
  pendingIntegrations: number;
  docsExpiringSoon: DashboardDoc[];
  docsExpired: DashboardDoc[];
  blockedEmployees: DashboardDoc[];
  unreadAlerts: number;
}

export interface DashboardDoc {
  doc_id: string;
  doc_status: string;
  expiry_date: string;
  days_until_expiry: number;
  document_name: string;
  document_category: string;
  is_required: boolean;
  employee_name: string;
  employee_cpf?: string;
  client_name: string;
  client_code?: string;
  integration_id: string;
  integration_status: string;
  template_id: string;
}

// ============ AUTO STATUS CALCULATION ============

export function calcDocStatus(doc: { expiry_date?: string; file_url?: string }, alertDays: number[] = [30, 15, 7], blockOnExpiry = true): DocStatus {
  if (!doc.file_url) return 'PENDENTE';
  if (!doc.expiry_date) return 'OK';
  const daysLeft = Math.ceil((new Date(doc.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return blockOnExpiry ? 'BLOQUEADO' : 'VENCIDO';
  const firstAlert = Math.max(...alertDays);
  if (daysLeft <= firstAlert) return 'A_VENCER';
  return 'OK';
}

export function calcIntegrationStatus(docs: EmployeeIntegrationDoc[], items: IntegrationTemplateItem[]): IntegrationStatusType {
  const requiredItems = items.filter(i => i.is_required);
  if (requiredItems.length === 0) return 'ATIVO';
  const hasBlocked = docs.some(d => {
    const item = items.find(i => i.id === d.template_item_id);
    return item?.is_required && ['BLOQUEADO', 'VENCIDO'].includes(d.status);
  });
  if (hasBlocked) return 'BLOQUEADO';
  const allOk = requiredItems.every(item => {
    const doc = docs.find(d => d.template_item_id === item.id);
    return doc && ['OK', 'A_VENCER'].includes(doc.status);
  });
  if (allOk) return 'ATIVO';
  return 'PENDENTE';
}

// ============ DASHBOARD ============

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // Fetch integration counts
  const { data: integrations } = await supabase
    .from('employee_integrations')
    .select('id, status');

  const total = integrations?.length || 0;
  const active = integrations?.filter(i => i.status === 'ATIVO').length || 0;
  const blocked = integrations?.filter(i => i.status === 'BLOQUEADO').length || 0;
  const pending = integrations?.filter(i => i.status === 'PENDENTE').length || 0;

  // Fetch docs with details for dashboard
  const { data: allDocs } = await supabase
    .from('employee_integration_docs')
    .select(`
      id, status, expiry_date, file_url,
      template_item:integration_template_items(document_name, document_category, is_required),
      integration:employee_integrations(
        id, status,
        employee:employees(full_name, cpf),
        template:integration_templates(id, client_name, client_code)
      )
    `)
    .not('expiry_date', 'is', null)
    .order('expiry_date');

  const mapDoc = (d: any): DashboardDoc => ({
    doc_id: d.id,
    doc_status: d.status,
    expiry_date: d.expiry_date,
    days_until_expiry: Math.ceil((new Date(d.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    document_name: d.template_item?.document_name || '',
    document_category: d.template_item?.document_category || '',
    is_required: d.template_item?.is_required ?? true,
    employee_name: d.integration?.employee?.full_name || '',
    employee_cpf: d.integration?.employee?.cpf,
    client_name: d.integration?.template?.client_name || '',
    client_code: d.integration?.template?.client_code,
    integration_id: d.integration?.id || '',
    integration_status: d.integration?.status || '',
    template_id: d.integration?.template?.id || '',
  });

  const docs = (allDocs || []).map(mapDoc);
  const docsExpiringSoon = docs.filter(d => d.days_until_expiry > 0 && d.days_until_expiry <= 30).sort((a, b) => a.days_until_expiry - b.days_until_expiry);
  const docsExpired = docs.filter(d => d.days_until_expiry <= 0).sort((a, b) => a.days_until_expiry - b.days_until_expiry);
  const blockedEmployees = docs.filter(d => ['BLOQUEADO', 'VENCIDO'].includes(d.doc_status) && d.is_required);

  // Unread alerts count
  const { count } = await supabase
    .from('integration_alerts')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false);

  return {
    totalIntegrations: total,
    activeIntegrations: active,
    blockedIntegrations: blocked,
    pendingIntegrations: pending,
    docsExpiringSoon,
    docsExpired,
    blockedEmployees,
    unreadAlerts: count || 0,
  };
}

// ============ TEMPLATES (Clientes) ============

export async function fetchTemplates(): Promise<IntegrationTemplate[]> {
  const { data, error } = await supabase
    .from('integration_templates')
    .select('*, items:integration_template_items(*)')
    .order('client_name');
  if (error) throw error;
  return (data || []).map(t => ({ ...t, alert_days: t.alert_days || [30, 15, 7] }));
}

export async function createTemplate(template: Partial<IntegrationTemplate>): Promise<IntegrationTemplate> {
  // Only insert columns that definitely exist in the DB
  // Optional columns (unit_name, contact_*, alert_days, block_grace_days) may not exist yet
  const payload: Record<string, any> = {
    client_name: template.client_name,
    client_code: template.client_code || null,
    is_active: true,
  };

  // Try to insert with all columns first; fallback to minimal if it fails
  const fullPayload: Record<string, any> = {
    ...payload,
    unit_name: template.unit_name || null,
    contact_name: template.contact_name || null,
    contact_phone: template.contact_phone || null,
    contact_email: template.contact_email || null,
    alert_days: JSON.stringify(template.alert_days || [30, 15, 7]),
    block_on_expiry: template.block_on_expiry ?? true,
    block_grace_days: template.block_grace_days ?? 0,
    notes: template.notes || null,
  };

  let { data, error } = await supabase
    .from('integration_templates')
    .insert(fullPayload)
    .select()
    .single();

  // Fallback: if columns don't exist, insert minimal payload
  if (error && error.code === 'PGRST204') {
    ({ data, error } = await supabase
      .from('integration_templates')
      .insert(payload)
      .select()
      .single());
  }

  if (error) throw error;
  return data;
}

export async function updateTemplate(id: string, updates: Partial<IntegrationTemplate>): Promise<IntegrationTemplate> {
  const payload: any = { ...updates, updated_at: new Date().toISOString() };
  if (updates.alert_days) payload.alert_days = JSON.stringify(updates.alert_days);
  delete payload.items;

  let { data, error } = await supabase
    .from('integration_templates')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  // Fallback: remove unknown columns and retry
  if (error && error.code === 'PGRST204') {
    const safePayload: any = { client_name: payload.client_name, client_code: payload.client_code, is_active: payload.is_active, updated_at: payload.updated_at };
    ({ data, error } = await supabase
      .from('integration_templates')
      .update(safePayload)
      .eq('id', id)
      .select()
      .single());
  }

  if (error) throw error;
  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('integration_templates').delete().eq('id', id);
  if (error) throw error;
}

// ============ TEMPLATE ITEMS ============

export async function addTemplateItem(item: Partial<IntegrationTemplateItem>): Promise<IntegrationTemplateItem> {
  const { data, error } = await supabase
    .from('integration_template_items')
    .insert({
      template_id: item.template_id,
      document_name: item.document_name,
      document_category: item.document_category ?? 'GERAL',
      is_required: item.is_required ?? true,
      validity_value: item.validity_value,
      validity_unit: item.validity_unit ?? 'MONTHS',
      blocks_on_expiry: item.blocks_on_expiry ?? true,
      alert_only: item.alert_only ?? false,
      sort_order: item.sort_order ?? 0,
      notes: item.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTemplateItem(id: string, updates: Partial<IntegrationTemplateItem>): Promise<void> {
  const { error } = await supabase.from('integration_template_items').update(updates).eq('id', id);
  if (error) throw error;
}

export async function removeTemplateItem(id: string): Promise<void> {
  const { error } = await supabase.from('integration_template_items').delete().eq('id', id);
  if (error) throw error;
}

// ============ EMPLOYEE INTEGRATIONS ============

export async function fetchEmployeeIntegrations(): Promise<EmployeeIntegration[]> {
  const { data, error } = await supabase
    .from('employee_integrations')
    .select(`
      *,
      employee:employees(id, full_name, cpf, job_title, registration_number),
      template:integration_templates(*),
      docs:employee_integration_docs(*, template_item:integration_template_items(*))
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createEmployeeIntegration(employeeId: string, templateId: string): Promise<EmployeeIntegration> {
  const { data, error } = await supabase
    .from('employee_integrations')
    .insert({ employee_id: employeeId, template_id: templateId, status: 'PENDENTE' })
    .select()
    .single();
  if (error) throw error;

  // Auto-create doc entries
  const { data: items } = await supabase
    .from('integration_template_items')
    .select('id')
    .eq('template_id', templateId);

  if (items && items.length > 0) {
    await supabase.from('employee_integration_docs').insert(
      items.map(item => ({
        employee_integration_id: data.id,
        template_item_id: item.id,
        status: 'PENDENTE',
      }))
    );
  }
  return data;
}

export async function deleteEmployeeIntegration(id: string): Promise<void> {
  const { error } = await supabase.from('employee_integrations').delete().eq('id', id);
  if (error) throw error;
}

export async function updateIntegrationStatus(id: string, status: IntegrationStatusType): Promise<void> {
  const updates: any = { status, updated_at: new Date().toISOString() };
  if (status === 'BLOQUEADO') updates.blocked_at = new Date().toISOString();
  if (status === 'ATIVO') { updates.completed_at = new Date().toISOString(); updates.blocked_at = null; }
  const { error } = await supabase.from('employee_integrations').update(updates).eq('id', id);
  if (error) throw error;
}

// ============ DOCS ============

export async function updateDoc(docId: string, updates: Partial<EmployeeIntegrationDoc>): Promise<EmployeeIntegrationDoc> {
  const { data, error } = await supabase
    .from('employee_integration_docs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', docId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadDocFile(file: File, integrationId: string, docId: string, currentVersion: number): Promise<{ url: string; version: number }> {
  const newVersion = currentVersion + 1;
  const ext = file.name.split('.').pop();
  const path = `integrations/${integrationId}/${docId}_v${newVersion}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('integration-docs').upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('integration-docs').getPublicUrl(path);

  // Save version history (non-blocking - upload already succeeded)
  try {
    await supabase.from('integration_doc_versions').insert({
      doc_id: docId,
      version_number: newVersion,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
    });
  } catch (e) {
    console.warn('Falha ao salvar histórico de versão:', e);
  }

  return { url: urlData.publicUrl, version: newVersion };
}

export async function fetchDocVersions(docId: string): Promise<DocVersion[]> {
  const { data, error } = await supabase
    .from('integration_doc_versions')
    .select('*')
    .eq('doc_id', docId)
    .order('version_number', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============ EMPLOYEES ============

export async function fetchEmployees(): Promise<{ id: string; full_name: string; cpf?: string; job_title?: string }[]> {
  const { data, error } = await supabase.from('employees').select('id, full_name, cpf, job_title, registration_number').order('full_name');
  if (error) throw error;
  return data || [];
}

// ============ ALERTS ============

export async function fetchAlerts(unreadOnly = true): Promise<IntegrationAlert[]> {
  let query = supabase.from('integration_alerts').select('*').order('created_at', { ascending: false });
  if (unreadOnly) query = query.eq('is_read', false);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function markAlertRead(id: string): Promise<void> {
  await supabase.from('integration_alerts').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id);
}

export async function markAllAlertsRead(): Promise<void> {
  await supabase.from('integration_alerts').update({ is_read: true, read_at: new Date().toISOString() }).eq('is_read', false);
}

// ============ PDF DOSSIER ============

export function generateDossierData(integration: EmployeeIntegration): {
  employeeName: string;
  clientName: string;
  status: string;
  docs: { name: string; category: string; status: string; issueDate: string; expiryDate: string; required: boolean }[];
} {
  return {
    employeeName: integration.employee?.full_name || '',
    clientName: integration.template?.client_name || '',
    status: integration.status,
    docs: (integration.docs || []).map(d => ({
      name: d.template_item?.document_name || '',
      category: d.template_item?.document_category || '',
      status: d.status,
      issueDate: d.issue_date || '-',
      expiryDate: d.expiry_date || 'Sem validade',
      required: d.template_item?.is_required ?? true,
    })),
  };
}
