/**
 * TERRAPRO ERP - Maintenance Plan Service
 * CRUD para planos de manutenção + seed dos 16 equipamentos + relatório por período
 */

import { supabase } from '../lib/supabase';

// ============================================================
// TYPES
// ============================================================

export interface MaintenancePlanTemplate {
  id?: string;
  company_id?: string;
  asset_id?: string;
  asset_name: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  fleet_number?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MaintenancePlanItem {
  id?: string;
  template_id: string;
  interval_type: string; // '500H', 'SEMANAL', 'DIARIO', '1000H', '250H', 'MENSAL'
  category: string;      // 'MOTOR', 'HIDRAULICO', 'LUBRIFICACAO', 'ELETRICA', 'PNEUS'
  service_name: string;
  action_check: boolean;
  action_clean: boolean;
  action_replace: boolean;
  action_adjust: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface MaintenancePlanExecution {
  id?: string;
  template_id: string;
  executed_by?: string;
  executed_at?: string;
  horimeter_reading?: number;
  odometer_reading?: number;
  notes?: string;
  items_checked?: any[];
  maintenance_os_id?: string;
  signed_by?: string;
  pdf_url?: string;
  created_at?: string;
}

export interface MaintenanceReportData {
  template: MaintenancePlanTemplate;
  serviceOrders: any[];
  maintenanceOrders: any[];
  totalCost: number;
  totalPreventive: number;
  totalCorrective: number;
}

// ============================================================
// INTERVAL / CATEGORY LABELS
// ============================================================

export const INTERVAL_LABELS: Record<string, string> = {
  '500H': 'A CADA 500 HORAS',
  '1000H': 'A CADA 1000 HORAS',
  '250H': 'A CADA 250 HORAS',
  'SEMANAL': 'SEMANALMENTE',
  'DIARIO': 'DIARIAMENTE',
  'MENSAL': 'MENSALMENTE',
};

export const INTERVAL_ORDER = ['500H', '1000H', '250H', 'SEMANAL', 'DIARIO', 'MENSAL'];

export const CATEGORY_LABELS: Record<string, string> = {
  'MOTOR': 'MOTOR',
  'HIDRAULICO': 'HIDRÁULICO',
  'LUBRIFICACAO': 'LUBRIFICAÇÃO',
  'ELETRICA': 'ELÉTRICA',
  'PNEUS': 'PNEUS',
  'TRANSMISSAO': 'TRANSMISSÃO',
  'RODANTE': 'RODANTE',
  'GERAL': 'GERAL',
};

// ============================================================
// SERVICE
// ============================================================

export const maintenancePlanService = {

  // ==================== TEMPLATES ====================

  async getTemplates(): Promise<MaintenancePlanTemplate[]> {
    const { data, error } = await supabase
      .from('maintenance_plan_templates')
      .select('*')
      .eq('is_active', true)
      .order('asset_name');
    if (error) throw error;
    return data || [];
  },

  async getTemplateById(id: string): Promise<{ template: MaintenancePlanTemplate; items: MaintenancePlanItem[] }> {
    const [tRes, iRes] = await Promise.all([
      supabase.from('maintenance_plan_templates').select('*').eq('id', id).single(),
      supabase.from('maintenance_plan_items').select('*').eq('template_id', id).order('sort_order'),
    ]);
    if (tRes.error) throw tRes.error;
    if (iRes.error) throw iRes.error;
    return { template: tRes.data, items: iRes.data || [] };
  },

  async createTemplate(data: Partial<MaintenancePlanTemplate>): Promise<MaintenancePlanTemplate> {
    const { data: result, error } = await supabase
      .from('maintenance_plan_templates')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async updateTemplate(id: string, data: Partial<MaintenancePlanTemplate>): Promise<void> {
    const { error } = await supabase
      .from('maintenance_plan_templates')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('maintenance_plan_templates')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
  },

  // ==================== ITEMS ====================

  async addItem(templateId: string, item: Partial<MaintenancePlanItem>): Promise<MaintenancePlanItem> {
    const { data, error } = await supabase
      .from('maintenance_plan_items')
      .insert({ ...item, template_id: templateId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateItem(itemId: string, data: Partial<MaintenancePlanItem>): Promise<void> {
    const { error } = await supabase
      .from('maintenance_plan_items')
      .update(data)
      .eq('id', itemId);
    if (error) throw error;
  },

  async removeItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('maintenance_plan_items')
      .delete()
      .eq('id', itemId);
    if (error) throw error;
  },

  async addItems(templateId: string, items: Partial<MaintenancePlanItem>[]): Promise<void> {
    const rows = items.map((item, idx) => ({
      ...item,
      template_id: templateId,
      sort_order: item.sort_order ?? idx,
    }));
    const { error } = await supabase
      .from('maintenance_plan_items')
      .insert(rows);
    if (error) throw error;
  },

  // ==================== EXECUTIONS ====================

  async createExecution(data: Partial<MaintenancePlanExecution>): Promise<MaintenancePlanExecution> {
    const { data: result, error } = await supabase
      .from('maintenance_plan_executions')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async getExecutions(templateId: string): Promise<MaintenancePlanExecution[]> {
    const { data, error } = await supabase
      .from('maintenance_plan_executions')
      .select('*')
      .eq('template_id', templateId)
      .order('executed_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // ==================== REPORT (cross-reference) ====================

  async getMaintenanceReport(dateFrom: string, dateTo: string, assetId?: string): Promise<MaintenanceReportData[]> {
    // 1. Get templates (optionally filtered by asset)
    let tQuery = supabase.from('maintenance_plan_templates').select('*').eq('is_active', true);
    if (assetId) tQuery = tQuery.eq('asset_id', assetId);
    const { data: templates, error: tErr } = await tQuery.order('asset_name');
    if (tErr) throw tErr;
    if (!templates || templates.length === 0) return [];

    // 2. Get ALL service orders in the period
    let soQuery = supabase
      .from('service_orders')
      .select('*, service_order_items(*)')
      .gte('entry_date', dateFrom)
      .lte('entry_date', dateTo)
      .order('entry_date', { ascending: true });
    if (assetId) soQuery = soQuery.eq('asset_id', assetId);
    const { data: serviceOrders } = await soQuery;

    // 3. Get maintenance OS in the period
    let moQuery = supabase
      .from('maintenance_os')
      .select('*')
      .gte('opened_at', dateFrom)
      .lte('opened_at', dateTo)
      .order('opened_at', { ascending: true });
    if (assetId) moQuery = moQuery.eq('asset_id', assetId);
    const { data: maintenanceOrders } = await moQuery;

    // 4. Group by template/asset - matching preciso
    const results: MaintenanceReportData[] = templates.map(template => {
      const assetSOs = (serviceOrders || []).filter(so =>
        matchesEquipment(so, template, 'so')
      );

      const assetMOs = (maintenanceOrders || []).filter(mo =>
        matchesEquipment(mo, template, 'mo')
      );

      let totalCost = 0;
      assetSOs.forEach(so => {
        // Real field is total_value (not total_cost)
        totalCost += Number(so.total_value || so.total_cost || 0);
      });

      const totalPreventive = assetMOs.filter(m => m.type === 'PREVENTIVE').length
        + assetSOs.filter(s => (s.service_type || '').toUpperCase().includes('PREVENT')).length;
      const totalCorrective = assetMOs.filter(m => m.type === 'CORRECTIVE').length
        + assetSOs.filter(s => (s.service_type || '').toUpperCase().includes('CORRET')).length;

      return {
        template,
        serviceOrders: assetSOs,
        maintenanceOrders: assetMOs,
        totalCost,
        totalPreventive,
        totalCorrective,
      };
    });

    return results.filter(r => r.serviceOrders.length > 0 || r.maintenanceOrders.length > 0);
  },

  // ==================== SEED (16 equipamentos da planilha) ====================

  async seedFromSpreadsheet(): Promise<number> {
    // Check if already seeded
    const { data: existing } = await supabase
      .from('maintenance_plan_templates')
      .select('id')
      .limit(1);
    if (existing && existing.length > 0) {
      throw new Error('Planos já existem! Delete os existentes antes de re-importar.');
    }

    const equipments = getSpreadsheetEquipments();
    let count = 0;

    for (const eq of equipments) {
      // Create template
      const { data: template, error: tErr } = await supabase
        .from('maintenance_plan_templates')
        .insert({
          asset_name: eq.asset_name,
          brand: eq.brand,
          model: eq.model,
          serial_number: eq.serial_number,
          fleet_number: eq.fleet_number,
        })
        .select()
        .single();

      if (tErr) {
        console.error(`Erro ao criar template ${eq.asset_name}:`, tErr);
        continue;
      }

      // Generate items based on equipment type
      const items = generateDefaultItems(eq.type);
      const rows = items.map((item, idx) => ({
        template_id: template.id,
        interval_type: item.interval_type,
        category: item.category,
        service_name: item.service_name,
        action_check: item.action_check || false,
        action_clean: item.action_clean || false,
        action_replace: item.action_replace || false,
        action_adjust: item.action_adjust || false,
        sort_order: idx,
      }));

      if (rows.length > 0) {
        const { error: iErr } = await supabase
          .from('maintenance_plan_items')
          .insert(rows);
        if (iErr) console.error(`Erro ao inserir items para ${eq.asset_name}:`, iErr);
      }

      count++;
    }

    return count;
  },
};

// ============================================================
// MATCHING LOGIC - OS ↔ Equipment (preciso)
// ============================================================

/**
 * Verifica se uma OS pertence a um equipamento específico.
 *
 * Campos reais da tabela service_orders:
 *   - equipment_name: quase sempre null
 *   - model_name: contém código+nome+marca (ex: "PC-04-PÁ CARREGADEIRA VOLVO L-")
 *   - brand_name: marca (ex: "VOLVO", "CATERPILLAR")
 *   - plate: frota/placa (ex: "PC04", "GXA2216")
 *   - serial_number: geralmente null
 *   - asset_id: geralmente null
 *
 * Campos da tabela maintenance_os:
 *   - asset_name: nome do equipamento
 *   - asset_id: id do ativo
 */
function matchesEquipment(
  record: any,
  template: MaintenancePlanTemplate,
  type: 'so' | 'mo',
): boolean {
  // 1. Match by asset_id (ONLY when both are defined and non-empty)
  if (template.asset_id && record.asset_id && template.asset_id === record.asset_id) {
    return true;
  }

  const fleet = (template.fleet_number || '').toUpperCase().trim();
  if (!fleet) return false;

  if (type === 'so') {
    // ===== SERVICE_ORDERS =====
    // Build a searchable text combining all relevant fields
    const plate = (record.plate || '').toUpperCase().trim();
    const modelName = (record.model_name || '').toUpperCase();
    const brandName = (record.brand_name || '').toUpperCase();
    const equipName = (record.equipment_name || '').toUpperCase();
    const serialNum = (record.serial_number || '').toUpperCase();

    // Strategy A: plate field matches fleet_number directly
    // plate="PC04" vs fleet="PC04", plate="GXA2216" vs serial="GXA2216"
    if (plate) {
      const plateClean = plate.replace(/[\s-]/g, '');
      const fleetClean = fleet.replace(/[\s-]/g, '');
      if (plateClean === fleetClean) return true;
      // plate can also be a license plate — match against template serial
      const tSerial = (template.serial_number || '').toUpperCase().trim();
      if (tSerial && tSerial.length >= 5 && plate.includes(tSerial)) return true;
      if (tSerial && plateClean === tSerial.replace(/[\s-]/g, '')) return true;
    }

    // Strategy B: fleet_number appears in model_name or equipment_name
    // model_name="PC-04-PÁ CARREGADEIRA VOLVO L-" contains "PC04" (after cleaning)
    const allText = `${modelName} ${equipName}`;
    const allTextClean = allText.replace(/[\s-]/g, '');
    const fleetClean = fleet.replace(/[\s-]/g, '');

    if (fleetClean.length >= 3 && allTextClean.includes(fleetClean)) return true;

    // Strategy C: brand + model combination in model_name
    const tModel = (template.model || '').toUpperCase().trim();
    const tBrand = (template.brand || '').toUpperCase().trim();
    if (tModel && tModel.length >= 3 && tBrand) {
      // model_name="CB-05-CAMINHÃO BASCULANTE VW 31.320" → contains "31320" and brand_name="VOLKSWAGEM"
      const modelClean = tModel.replace(/[\s.-]/g, '');
      const modelNameClean = modelName.replace(/[\s.-]/g, '');
      // Check brand in brand_name field OR model_name
      const brandMatches = brandName.includes(tBrand) || modelName.includes(tBrand)
        || (tBrand === 'VOLKSWAGEN' && (brandName.includes('VOLKSWAGEM') || brandName.includes('VW')))
        || (tBrand === 'CATERPILLAR' && (brandName.includes('CAT') || modelName.includes('CAT')));
      const modelMatches = modelName.includes(tModel) || modelNameClean.includes(modelClean);
      if (brandMatches && modelMatches) return true;
    }

    // Strategy D: serial/plate number match
    const tSerial = (template.serial_number || '').toUpperCase().trim();
    if (tSerial && tSerial.length >= 5) {
      if (serialNum.includes(tSerial)) return true;
      if (plate.includes(tSerial)) return true;
    }

    return false;

  } else {
    // ===== MAINTENANCE_OS =====
    const assetName = (record.asset_name || '').toUpperCase();
    if (!assetName || assetName.trim() === '') return false;

    // Fleet number in asset_name
    if (fleet.length >= 3) {
      if (assetName.includes(fleet)) return true;
      const fleetClean = fleet.replace(/[\s-]/g, '');
      const nameClean = assetName.replace(/[\s-]/g, '');
      if (nameClean.includes(fleetClean)) return true;
    }

    // Brand + model
    const tModel = (template.model || '').toUpperCase().trim();
    const tBrand = (template.brand || '').toUpperCase().trim();
    if (tModel && tModel.length >= 3 && tBrand) {
      if (assetName.includes(tModel) && assetName.includes(tBrand)) return true;
    }

    // Serial number
    const tSerial = (template.serial_number || '').toUpperCase().trim();
    if (tSerial && tSerial.length >= 5 && assetName.includes(tSerial)) return true;

    return false;
  }
}

// ============================================================
// EQUIPMENT DATA (from Excel spreadsheet)
// ============================================================

interface EquipmentDef {
  asset_name: string;
  brand: string;
  model: string;
  serial_number: string;
  fleet_number: string;
  type: 'PA_CARREGADEIRA' | 'MINI_CARREGADEIRA' | 'ESCAVADEIRA' | 'TRATOR' | 'CAMINHAO';
}

function getSpreadsheetEquipments(): EquipmentDef[] {
  return [
    // Pás Carregadeiras
    { asset_name: 'PÁ CARREGADEIRA', brand: 'VOLVO', model: 'L60F', serial_number: 'VCE0L60FC00072652', fleet_number: 'PC04', type: 'PA_CARREGADEIRA' },
    { asset_name: 'PÁ CARREGADEIRA', brand: 'VOLVO', model: 'L60F', serial_number: 'VCE0L60FCE0072772', fleet_number: 'PC06', type: 'PA_CARREGADEIRA' },
    { asset_name: 'PÁ CARREGADEIRA', brand: 'CATERPILLAR', model: '924K', serial_number: 'CAT0924KCKW401418', fleet_number: '924K', type: 'PA_CARREGADEIRA' },
    { asset_name: 'PÁ CARREGADEIRA', brand: 'VOLVO', model: 'L60F', serial_number: 'VCE0L60FKJ0073418', fleet_number: 'PC08', type: 'PA_CARREGADEIRA' },
    // Mini Pá
    { asset_name: 'MINI PÁ CARREGADEIRA', brand: 'CATERPILLAR', model: '242D3', serial_number: 'CAT0242DCR2L00507', fleet_number: 'MINI 242', type: 'MINI_CARREGADEIRA' },
    // Escavadeiras
    { asset_name: 'ESCAVADEIRA', brand: 'VOLVO', model: 'EC140 BLCM', serial_number: 'VCEC140BEE0040648', fleet_number: 'EC-140', type: 'ESCAVADEIRA' },
    { asset_name: 'ESCAVADEIRA', brand: 'SDLG', model: 'LG6150', serial_number: 'VLG6150ETF0400106', fleet_number: 'EC03', type: 'ESCAVADEIRA' },
    // Tratores
    { asset_name: 'TRATOR', brand: 'JOHN DEERE', model: '6605', serial_number: 'A034364', fleet_number: 'TRATOR 02', type: 'TRATOR' },
    { asset_name: 'TRATOR', brand: 'VALTRA', model: 'BH185I', serial_number: 'BH85EA01437', fleet_number: 'TRATOR VALTRA 03', type: 'TRATOR' },
    // Caminhões Basculantes
    { asset_name: 'CAMINHÃO BASCULANTE', brand: 'FORD', model: '1418', serial_number: 'HQR7D64', fleet_number: 'CB01', type: 'CAMINHAO' },
    { asset_name: 'CAMINHÃO BASCULANTE', brand: 'FORD', model: '2631', serial_number: 'MCM8836', fleet_number: 'CB03', type: 'CAMINHAO' },
    { asset_name: 'CAMINHÃO BASCULANTE', brand: 'VOLKSWAGEN', model: '26260', serial_number: 'ISP6F11', fleet_number: 'CB04', type: 'CAMINHAO' },
    { asset_name: 'CAMINHÃO BASCULANTE', brand: 'VOLKSWAGEN', model: '31320', serial_number: 'GXA2216', fleet_number: 'CB05', type: 'CAMINHAO' },
    { asset_name: 'CAMINHÃO BASCULANTE', brand: 'VOLKSWAGEN', model: '31320', serial_number: 'HOA8960', fleet_number: 'CB06', type: 'CAMINHAO' },
    { asset_name: 'CAMINHÃO BASCULANTE', brand: 'VOLKSWAGEN', model: '31320', serial_number: 'HNC9I30', fleet_number: 'CB07', type: 'CAMINHAO' },
    { asset_name: 'CAMINHÃO BASCULANTE', brand: 'VOLKSWAGEN', model: '31260', serial_number: 'EFU4J78', fleet_number: 'CB08', type: 'CAMINHAO' },
  ];
}

// ============================================================
// DEFAULT ITEMS PER EQUIPMENT TYPE
// ============================================================

interface ItemDef {
  interval_type: string;
  category: string;
  service_name: string;
  action_check?: boolean;
  action_clean?: boolean;
  action_replace?: boolean;
  action_adjust?: boolean;
}

function generateDefaultItems(type: string): ItemDef[] {
  const common500Motor: ItemDef[] = [
    { interval_type: '500H', category: 'MOTOR', service_name: 'ÓLEO MOTOR', action_replace: true },
    { interval_type: '500H', category: 'MOTOR', service_name: 'FILTRO ÓLEO MOTOR', action_replace: true },
    { interval_type: '500H', category: 'MOTOR', service_name: 'FILTRO COMBUSTÍVEL', action_replace: true },
    { interval_type: '500H', category: 'MOTOR', service_name: 'LÍQUIDO DE ARREFECIMENTO', action_check: true, action_adjust: true },
    { interval_type: '500H', category: 'MOTOR', service_name: 'REGULAGEM DE VÁLVULAS', action_check: true },
    { interval_type: '500H', category: 'MOTOR', service_name: 'FILTRO AR PRIMÁRIO', action_clean: true, action_replace: true },
    { interval_type: '500H', category: 'MOTOR', service_name: 'FILTRO AR SECUNDÁRIO', action_replace: true },
    { interval_type: '500H', category: 'MOTOR', service_name: 'PRÉ FILTRO RACOR', action_clean: true },
    { interval_type: '500H', category: 'MOTOR', service_name: 'AR CONDICIONADO', action_check: true },
    { interval_type: '500H', category: 'MOTOR', service_name: 'FILTRO AR CONDICIONADO', action_clean: true, action_replace: true },
    { interval_type: '500H', category: 'MOTOR', service_name: 'CORREIA COMPRESSOR AC', action_check: true },
  ];

  const common500Hidraulico: ItemDef[] = [
    { interval_type: '500H', category: 'HIDRAULICO', service_name: 'SISTEMA HIDRÁULICO', action_check: true },
    { interval_type: '500H', category: 'HIDRAULICO', service_name: 'RESERVATÓRIO ÓLEO HIDRÁULICO', action_check: true },
    { interval_type: '500H', category: 'HIDRAULICO', service_name: 'ÓLEO RODA MOTRIZ', action_check: true },
    { interval_type: '500H', category: 'HIDRAULICO', service_name: 'ÓLEO REDUTOR TRANSLAÇÃO', action_check: true },
    { interval_type: '500H', category: 'HIDRAULICO', service_name: 'FILTRO RETORNO', action_replace: true },
    { interval_type: '500H', category: 'HIDRAULICO', service_name: 'FILTRO ÓLEO HIDRÁULICO', action_replace: true },
    { interval_type: '500H', category: 'HIDRAULICO', service_name: 'ÓLEO HIDRÁULICO', action_check: true, action_replace: true },
  ];

  const commonSemanalLubrificacao: ItemDef[] = [
    { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'ARTICULAÇÕES CENTRAL CHASSIS', action_check: true },
    { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'ARTICULAÇÃO H', action_check: true },
    { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'BALANÇA TRASEIRA', action_check: true },
    { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'EIXO CARDAM 1', action_check: true },
    { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'EIXO CARDAM 2', action_check: true },
    { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'EIXO CARDAM 3', action_check: true },
  ];

  const commonDiarioEletrica: ItemDef[] = [
    { interval_type: 'DIARIO', category: 'ELETRICA', service_name: 'ALTERNADOR', action_check: true },
    { interval_type: 'DIARIO', category: 'ELETRICA', service_name: 'ILUMINAÇÃO GERAL', action_check: true },
    { interval_type: 'DIARIO', category: 'ELETRICA', service_name: 'BATERIAS', action_check: true },
    { interval_type: 'DIARIO', category: 'ELETRICA', service_name: 'MOTOR DE PARTIDA', action_check: true },
  ];

  const commonDiarioPneus: ItemDef[] = [
    { interval_type: 'DIARIO', category: 'PNEUS', service_name: 'CALIBRAGEM', action_check: true },
  ];

  switch (type) {
    case 'PA_CARREGADEIRA':
      return [
        ...common500Motor,
        ...common500Hidraulico,
        ...commonSemanalLubrificacao,
        ...commonDiarioEletrica,
        ...commonDiarioPneus,
      ];

    case 'MINI_CARREGADEIRA':
      return [
        ...common500Motor,
        { interval_type: '500H', category: 'HIDRAULICO', service_name: 'SISTEMA HIDRÁULICO', action_check: true },
        { interval_type: '500H', category: 'HIDRAULICO', service_name: 'FILTRO ÓLEO HIDRÁULICO', action_replace: true },
        { interval_type: '500H', category: 'HIDRAULICO', service_name: 'ÓLEO HIDRÁULICO', action_check: true, action_replace: true },
        { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'PINOS E BUCHAS', action_check: true },
        { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'CORRENTES', action_check: true, action_adjust: true },
        ...commonDiarioEletrica,
      ];

    case 'ESCAVADEIRA':
      return [
        ...common500Motor,
        ...common500Hidraulico,
        { interval_type: '500H', category: 'RODANTE', service_name: 'ESTEIRAS', action_check: true, action_adjust: true },
        { interval_type: '500H', category: 'RODANTE', service_name: 'SAPATAS', action_check: true },
        { interval_type: '500H', category: 'RODANTE', service_name: 'ROLETES INFERIORES', action_check: true },
        { interval_type: '500H', category: 'RODANTE', service_name: 'ROLETES SUPERIORES', action_check: true },
        { interval_type: '500H', category: 'RODANTE', service_name: 'RODA GUIA', action_check: true },
        { interval_type: '500H', category: 'RODANTE', service_name: 'COROA DE GIRO', action_check: true },
        { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'PINOS DO BRAÇO', action_check: true },
        { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'PINOS DA LANÇA', action_check: true },
        { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'PINO CAÇAMBA', action_check: true },
        { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'GIRO', action_check: true },
        ...commonDiarioEletrica,
      ];

    case 'TRATOR':
      return [
        ...common500Motor,
        { interval_type: '500H', category: 'TRANSMISSAO', service_name: 'ÓLEO TRANSMISSÃO', action_check: true, action_replace: true },
        { interval_type: '500H', category: 'TRANSMISSAO', service_name: 'FILTRO TRANSMISSÃO', action_replace: true },
        { interval_type: '500H', category: 'HIDRAULICO', service_name: 'SISTEMA HIDRÁULICO', action_check: true },
        { interval_type: '500H', category: 'HIDRAULICO', service_name: 'FILTRO ÓLEO HIDRÁULICO', action_replace: true },
        { interval_type: '500H', category: 'RODANTE', service_name: 'ESTEIRAS', action_check: true, action_adjust: true },
        { interval_type: '500H', category: 'RODANTE', service_name: 'SAPATAS', action_check: true },
        { interval_type: '500H', category: 'RODANTE', service_name: 'ROLETES', action_check: true },
        { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'MANCAIS', action_check: true },
        { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'ARTICULAÇÕES LÂMINA', action_check: true },
        { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'PINOS E BUCHAS', action_check: true },
        ...commonDiarioEletrica,
      ];

    case 'CAMINHAO':
      return [
        ...common500Motor,
        { interval_type: '500H', category: 'TRANSMISSAO', service_name: 'ÓLEO CÂMBIO', action_check: true, action_replace: true },
        { interval_type: '500H', category: 'TRANSMISSAO', service_name: 'ÓLEO DIFERENCIAL', action_check: true, action_replace: true },
        { interval_type: '500H', category: 'HIDRAULICO', service_name: 'ÓLEO BASCULANTE', action_check: true },
        { interval_type: '500H', category: 'HIDRAULICO', service_name: 'CILINDRO BASCULANTE', action_check: true },
        { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'CRUZETAS CARDAM', action_check: true },
        { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'MOLAS FEIXES', action_check: true },
        { interval_type: 'SEMANAL', category: 'LUBRIFICACAO', service_name: 'PINOS CAÇAMBA', action_check: true },
        { interval_type: 'DIARIO', category: 'GERAL', service_name: 'FREIOS', action_check: true },
        ...commonDiarioEletrica,
        ...commonDiarioPneus,
      ];

    default:
      return [...common500Motor, ...commonDiarioEletrica];
  }
}
