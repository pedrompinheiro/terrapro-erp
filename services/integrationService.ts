import { supabase } from '../lib/supabase';

// ============ TYPES ============

export interface IntegrationTemplate {
  id: string;
  company_id?: string;
  client_name: string;
  client_code?: string;
  is_active: boolean;
  alert_days_before: number;
  block_on_expiry: boolean;
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
  validity_months?: number;
  sort_order: number;
  notes?: string;
  created_at: string;
}

export interface EmployeeIntegration {
  id: string;
  employee_id: string;
  template_id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  blocked_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: { id: string; full_name: string; cpf?: string; role?: string };
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
  status: string;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  template_item?: IntegrationTemplateItem;
}

export interface IntegrationAlert {
  id: string;
  employee_integration_id: string;
  doc_id?: string;
  alert_type: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// ============ TEMPLATES (Clientes) ============

export async function fetchTemplates(): Promise<IntegrationTemplate[]> {
  const { data, error } = await supabase
    .from('integration_templates')
    .select('*, items:integration_template_items(*)')
    .order('client_name');
  if (error) throw error;
  return data || [];
}

export async function createTemplate(template: Partial<IntegrationTemplate>): Promise<IntegrationTemplate> {
  const { data, error } = await supabase
    .from('integration_templates')
    .insert({
      client_name: template.client_name,
      client_code: template.client_code,
      alert_days_before: template.alert_days_before ?? 30,
      block_on_expiry: template.block_on_expiry ?? true,
      notes: template.notes,
      is_active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTemplate(id: string, updates: Partial<IntegrationTemplate>): Promise<IntegrationTemplate> {
  const { data, error } = await supabase
    .from('integration_templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('integration_templates')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ============ TEMPLATE ITEMS (Checklist) ============

export async function addTemplateItem(item: Partial<IntegrationTemplateItem>): Promise<IntegrationTemplateItem> {
  const { data, error } = await supabase
    .from('integration_template_items')
    .insert({
      template_id: item.template_id,
      document_name: item.document_name,
      document_category: item.document_category ?? 'GERAL',
      is_required: item.is_required ?? true,
      validity_months: item.validity_months,
      sort_order: item.sort_order ?? 0,
      notes: item.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeTemplateItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('integration_template_items')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ============ EMPLOYEE INTEGRATIONS ============

export async function fetchEmployeeIntegrations(): Promise<EmployeeIntegration[]> {
  const { data, error } = await supabase
    .from('employee_integrations')
    .select(`
      *,
      employee:employees(id, full_name, cpf, role),
      template:integration_templates(id, client_name, client_code),
      docs:employee_integration_docs(*, template_item:integration_template_items(id, document_name, document_category, is_required, validity_months))
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createEmployeeIntegration(employeeId: string, templateId: string): Promise<EmployeeIntegration> {
  const { data, error } = await supabase
    .from('employee_integrations')
    .insert({
      employee_id: employeeId,
      template_id: templateId,
      status: 'PENDENTE',
    })
    .select()
    .single();
  if (error) throw error;

  // Auto-create doc entries for each template item
  const { data: items } = await supabase
    .from('integration_template_items')
    .select('id')
    .eq('template_id', templateId);

  if (items && items.length > 0) {
    const docEntries = items.map(item => ({
      employee_integration_id: data.id,
      template_item_id: item.id,
      status: 'PENDENTE',
    }));
    await supabase.from('employee_integration_docs').insert(docEntries);
  }

  return data;
}

export async function deleteEmployeeIntegration(id: string): Promise<void> {
  const { error } = await supabase
    .from('employee_integrations')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ============ DOCS (Upload/Status) ============

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

export async function uploadDocFile(file: File, integrationId: string, docId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `integrations/${integrationId}/${docId}.${ext}`;
  const { error } = await supabase.storage.from('documents').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
  return urlData.publicUrl;
}

// ============ EMPLOYEES (for selection) ============

export async function fetchEmployees(): Promise<{ id: string; full_name: string; cpf?: string; role?: string }[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('id, full_name, cpf, role')
    .order('full_name');
  if (error) throw error;
  return data || [];
}

// ============ ALERTS ============

export async function fetchAlerts(): Promise<IntegrationAlert[]> {
  const { data, error } = await supabase
    .from('integration_alerts')
    .select('*')
    .eq('is_read', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function markAlertRead(id: string): Promise<void> {
  await supabase
    .from('integration_alerts')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id);
}
