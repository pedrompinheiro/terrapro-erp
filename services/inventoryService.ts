/**
 * TERRAPRO ERP - Inventory Service
 *
 * Conecta o frontend ao Supabase para o módulo Almoxarifado.
 * Cobre: Items, Movimentações, Ordens de Serviço, Compras, Técnicos, Relatórios.
 */

import { supabase } from '../lib/supabase';
import {
  InventoryItem, InventoryCategory, InventoryBrand, InventoryMovement,
  ServiceOrder, ServiceOrderItem, ServiceOrderStatus,
  PurchaseOrder, PurchaseOrderItem,
  Technician, CategorySummary, BelowMinimumItem,
} from '../types';

// ============================================================
// HELPERS
// ============================================================

function computeStatus(item: InventoryItem): 'NORMAL' | 'CRITICAL' | 'WARNING' {
  if (item.blocked) return 'CRITICAL';
  if (item.qty_current <= 0 && item.is_product) return 'CRITICAL';
  if (item.qty_current > 0 && item.qty_current <= item.qty_minimum) return 'WARNING';
  return 'NORMAL';
}

function enrichItem(item: any): InventoryItem {
  const enriched = { ...item } as InventoryItem;
  enriched.status = computeStatus(enriched);
  return enriched;
}

// ============================================================
// INVENTORY SERVICE
// ============================================================

export const inventoryService = {

  // ==================== ITEMS ====================

  getItems: async (params?: {
    search?: string;
    category?: string;
    status?: string;
    onlyProducts?: boolean;
    onlyServices?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: InventoryItem[]; count: number }> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('inventory_items')
      .select('*', { count: 'exact' })
      .eq('active', true)
      .order('description', { ascending: true })
      .range(from, to);

    if (params?.search) {
      const term = `%${params.search}%`;
      query = query.or(`description.ilike.${term},sku.ilike.${term},barcode.ilike.${term},code.eq.${parseInt(params.search) || 0}`);
    }

    if (params?.category) {
      query = query.eq('category_name', params.category);
    }

    if (params?.onlyProducts) {
      query = query.eq('is_product', true);
    }

    if (params?.onlyServices) {
      query = query.eq('is_service', true);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar itens:', error);
      return { data: [], count: 0 };
    }

    const items = (data || []).map(enrichItem);

    if (params?.status) {
      const filtered = items.filter(i => i.status === params.status);
      return { data: filtered, count: filtered.length };
    }

    return { data: items, count: count || 0 };
  },

  getItemById: async (id: string): Promise<InventoryItem | null> => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar item:', error);
      return null;
    }

    return enrichItem(data);
  },

  createItem: async (item: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar item:', error);
      throw new Error(error.message);
    }

    return enrichItem(data);
  },

  updateItem: async (id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar item:', error);
      throw new Error(error.message);
    }

    return enrichItem(data);
  },

  deleteItem: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('inventory_items')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir item:', error);
      return false;
    }

    return true;
  },

  // ==================== CATEGORIES ====================

  getCategories: async (): Promise<InventoryCategory[]> => {
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }

    return data || [];
  },

  // ==================== BRANDS ====================

  getBrands: async (): Promise<InventoryBrand[]> => {
    const { data, error } = await supabase
      .from('inventory_brands')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) {
      console.error('Erro ao buscar marcas:', error);
      return [];
    }

    return data || [];
  },

  // ==================== STATS ====================

  getStats: async (): Promise<{
    totalItems: number;
    totalProducts: number;
    totalServices: number;
    belowMinimum: number;
    outOfStock: number;
    totalStockValue: number;
    totalCostValue: number;
  }> => {
    const { count: totalItems } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    const { count: totalProducts } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
      .eq('is_product', true);

    const { count: totalServices } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
      .eq('is_service', true);

    // Usar a view para abaixo do mínimo
    const { data: belowMinData } = await supabase
      .from('v_inventory_below_minimum')
      .select('id');

    const { count: outOfStock } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
      .eq('is_product', true)
      .lte('qty_current', 0);

    const { data: valData } = await supabase
      .from('inventory_items')
      .select('cost_price, sell_price, qty_current')
      .eq('active', true)
      .eq('is_product', true)
      .gt('qty_current', 0);

    let totalStockValue = 0;
    let totalCostValue = 0;
    (valData || []).forEach(item => {
      totalStockValue += (item.sell_price || 0) * (item.qty_current || 0);
      totalCostValue += (item.cost_price || 0) * (item.qty_current || 0);
    });

    return {
      totalItems: totalItems || 0,
      totalProducts: totalProducts || 0,
      totalServices: totalServices || 0,
      belowMinimum: belowMinData?.length || 0,
      outOfStock: outOfStock || 0,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      totalCostValue: Math.round(totalCostValue * 100) / 100,
    };
  },

  // ==================== MOVEMENTS ====================

  getMovements: async (params?: {
    search?: string;
    movementType?: string;
    itemId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: InventoryMovement[]; count: number }> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('inventory_movements')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (params?.itemId) {
      query = query.eq('item_id', params.itemId);
    }

    if (params?.movementType) {
      if (params.movementType === 'ENTRADA') {
        query = query.like('movement_type', 'ENTRADA_%');
      } else if (params.movementType === 'SAIDA') {
        query = query.like('movement_type', 'SAIDA_%');
      } else {
        query = query.eq('movement_type', params.movementType);
      }
    }

    if (params?.dateFrom) {
      query = query.gte('created_at', `${params.dateFrom}T00:00:00`);
    }

    if (params?.dateTo) {
      query = query.lte('created_at', `${params.dateTo}T23:59:59`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar movimentações:', error);
      return { data: [], count: 0 };
    }

    // Enrich com dados do item (buscar descriptions)
    if (data && data.length > 0) {
      const itemIds = [...new Set(data.map((m: any) => m.item_id))];
      const { data: items } = await supabase
        .from('inventory_items')
        .select('id, code, description, unit')
        .in('id', itemIds);

      const itemMap = new Map((items || []).map((i: any) => [i.id, i]));

      return {
        data: data.map((m: any) => {
          const item = itemMap.get(m.item_id);
          return {
            ...m,
            item_description: item?.description || 'Item desconhecido',
            item_code: item?.code || 0,
            item_unit: item?.unit || 'UNI',
          };
        }),
        count: count || 0,
      };
    }

    return { data: data || [], count: count || 0 };
  },

  createMovement: async (movement: {
    item_id: string;
    movement_type: string;
    quantity: number;
    unit_cost?: number;
    total_value?: number;
    notes?: string;
    reference_type?: string;
    reference_number?: number;
    entity_name?: string;
    invoice_number?: string;
    user_name?: string;
  }): Promise<InventoryMovement | null> => {
    const payload = {
      ...movement,
      total_value: movement.total_value || (movement.quantity * (movement.unit_cost || 0)),
    };

    const { data, error } = await supabase
      .from('inventory_movements')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar movimentação:', error);
      throw new Error(error.message);
    }

    return data;
  },

  getMovementsForItem: async (itemId: string, limit = 10): Promise<InventoryMovement[]> => {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar movimentações do item:', error);
      return [];
    }

    return data || [];
  },

  // ==================== SERVICE ORDERS ====================

  getServiceOrders: async (params?: {
    search?: string;
    situation?: string;
    dateFrom?: string;
    dateTo?: string;
    isPaid?: boolean | null;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: ServiceOrder[]; count: number }> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('service_orders')
      .select('*', { count: 'exact' })
      .order('order_number', { ascending: false })
      .range(from, to);

    if (params?.search) {
      const term = `%${params.search}%`;
      query = query.or(`client_name.ilike.${term},plate.ilike.${term},equipment_name.ilike.${term},order_number.eq.${parseInt(params.search) || 0}`);
    }

    if (params?.situation) {
      query = query.eq('situation', params.situation);
    }

    if (params?.dateFrom) {
      query = query.gte('entry_date', params.dateFrom);
    }

    if (params?.dateTo) {
      query = query.lte('entry_date', params.dateTo);
    }

    if (params?.isPaid !== null && params?.isPaid !== undefined) {
      query = query.eq('is_paid', params.isPaid);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar OS:', error);
      return { data: [], count: 0 };
    }

    return { data: data || [], count: count || 0 };
  },

  getServiceOrderById: async (id: string): Promise<ServiceOrder | null> => {
    const { data, error } = await supabase
      .from('service_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar OS:', error);
      return null;
    }

    return data;
  },

  getServiceOrderItems: async (serviceOrderId: string): Promise<ServiceOrderItem[]> => {
    const { data, error } = await supabase
      .from('service_order_items')
      .select('*')
      .eq('service_order_id', serviceOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar itens da OS:', error);
      return [];
    }

    return data || [];
  },

  getServiceOrderStatuses: async (): Promise<ServiceOrderStatus[]> => {
    const { data, error } = await supabase
      .from('service_order_statuses')
      .select('*')
      .eq('active', true)
      .order('sort_order');

    if (error) {
      console.error('Erro ao buscar situações:', error);
      return [];
    }

    return data || [];
  },

  getServiceOrderStats: async (): Promise<{
    totalOrders: number;
    openOrders: number;
    totalRevenue: number;
    unpaidCount: number;
  }> => {
    const { count: totalOrders } = await supabase
      .from('service_orders')
      .select('*', { count: 'exact', head: true });

    const { count: openOrders } = await supabase
      .from('service_orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', true);

    const { count: unpaidCount } = await supabase
      .from('service_orders')
      .select('*', { count: 'exact', head: true })
      .eq('is_paid', false)
      .gt('total_value', 0);

    const { data: revData } = await supabase
      .from('service_orders')
      .select('total_value')
      .eq('is_paid', true);

    const totalRevenue = (revData || []).reduce((sum, o) => sum + (o.total_value || 0), 0);

    return {
      totalOrders: totalOrders || 0,
      openOrders: openOrders || 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      unpaidCount: unpaidCount || 0,
    };
  },

  // ==================== PURCHASE ORDERS ====================

  getPurchaseOrders: async (params?: {
    search?: string;
    situation?: string;
    dateFrom?: string;
    dateTo?: string;
    isPaid?: boolean | null;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: PurchaseOrder[]; count: number }> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('purchase_orders')
      .select('*', { count: 'exact' })
      .order('order_number', { ascending: false })
      .range(from, to);

    if (params?.search) {
      const term = `%${params.search}%`;
      query = query.or(`supplier_name.ilike.${term},order_number.eq.${parseInt(params.search) || 0}`);
    }

    if (params?.situation) {
      query = query.eq('situation', params.situation);
    }

    if (params?.dateFrom) {
      query = query.gte('order_date', params.dateFrom);
    }

    if (params?.dateTo) {
      query = query.lte('order_date', params.dateTo);
    }

    if (params?.isPaid !== null && params?.isPaid !== undefined) {
      query = query.eq('is_paid', params.isPaid);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      return { data: [], count: 0 };
    }

    return { data: data || [], count: count || 0 };
  },

  getPurchaseOrderById: async (id: string): Promise<PurchaseOrder | null> => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar pedido:', error);
      return null;
    }

    return data;
  },

  getPurchaseOrderItems: async (purchaseOrderId: string): Promise<PurchaseOrderItem[]> => {
    const { data, error } = await supabase
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', purchaseOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar itens do pedido:', error);
      return [];
    }

    return data || [];
  },

  getPurchaseOrderStats: async (): Promise<{
    totalOrders: number;
    pendingDeliveries: number;
    totalSpent: number;
    unpaidCount: number;
  }> => {
    const { count: totalOrders } = await supabase
      .from('purchase_orders')
      .select('*', { count: 'exact', head: true });

    const { count: pendingDeliveries } = await supabase
      .from('purchase_orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', true)
      .eq('is_paid', false);

    const { count: unpaidCount } = await supabase
      .from('purchase_orders')
      .select('*', { count: 'exact', head: true })
      .eq('is_paid', false)
      .gt('total_value', 0);

    const { data: spentData } = await supabase
      .from('purchase_orders')
      .select('total_value');

    const totalSpent = (spentData || []).reduce((sum, o) => sum + (o.total_value || 0), 0);

    return {
      totalOrders: totalOrders || 0,
      pendingDeliveries: pendingDeliveries || 0,
      totalSpent: Math.round(totalSpent * 100) / 100,
      unpaidCount: unpaidCount || 0,
    };
  },

  // ==================== TECHNICIANS ====================

  getTechnicians: async (params?: {
    search?: string;
    activeOnly?: boolean;
  }): Promise<Technician[]> => {
    let query = supabase
      .from('technicians')
      .select('*')
      .order('name');

    if (params?.activeOnly !== false) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar técnicos:', error);
      return [];
    }

    let result = data || [];

    if (params?.search) {
      const term = params.search.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(term) ||
        (t.email && t.email.toLowerCase().includes(term)) ||
        (t.cpf && t.cpf.includes(term))
      );
    }

    return result;
  },

  createTechnician: async (tech: Partial<Technician>): Promise<Technician | null> => {
    const { data, error } = await supabase
      .from('technicians')
      .insert(tech)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar técnico:', error);
      throw new Error(error.message);
    }

    return data;
  },

  updateTechnician: async (id: string, updates: Partial<Technician>): Promise<Technician | null> => {
    const { data, error } = await supabase
      .from('technicians')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar técnico:', error);
      throw new Error(error.message);
    }

    return data;
  },

  deleteTechnician: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('technicians')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Erro ao desativar técnico:', error);
      return false;
    }

    return true;
  },

  // ==================== REPORTS ====================

  getCategorySummary: async (): Promise<CategorySummary[]> => {
    const { data, error } = await supabase
      .from('v_inventory_summary_by_category')
      .select('*')
      .order('total_cost_value', { ascending: false });

    if (error) {
      console.error('Erro ao buscar resumo por categoria:', error);
      return [];
    }

    return data || [];
  },

  getBelowMinimumItems: async (): Promise<BelowMinimumItem[]> => {
    const { data, error } = await supabase
      .from('v_inventory_below_minimum')
      .select('*')
      .order('estimated_cost', { ascending: false });

    if (error) {
      console.error('Erro ao buscar itens abaixo do mínimo:', error);
      return [];
    }

    return data || [];
  },

  getTopUsedProducts: async (limit = 10): Promise<{
    code: number;
    description: string;
    qty_out: number;
    category_name: string;
  }[]> => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('code, description, qty_out, category_name')
      .eq('active', true)
      .eq('is_product', true)
      .gt('qty_out', 0)
      .order('qty_out', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar produtos mais usados:', error);
      return [];
    }

    return data || [];
  },

  getMovementHistory: async (months = 6): Promise<{
    month: string;
    entries: number;
    exits: number;
  }[]> => {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('movement_type, quantity, created_at')
      .gte('created_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }

    const monthMap = new Map<string, { entries: number; exits: number }>();

    (data || []).forEach((m: any) => {
      const date = new Date(m.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = monthMap.get(key) || { entries: 0, exits: 0 };

      if (m.movement_type.startsWith('ENTRADA')) {
        current.entries += Number(m.quantity) || 0;
      } else if (m.movement_type.startsWith('SAIDA')) {
        current.exits += Number(m.quantity) || 0;
      }

      monthMap.set(key, current);
    });

    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({ month, ...data }));
  },
};
