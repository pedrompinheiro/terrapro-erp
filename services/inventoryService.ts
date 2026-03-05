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
  CostCenter, PurchaseReceipt, PurchaseReceiptItem, PurchaseReceiptItemAllocation,
  SupplierInvoice, SupplierInvoiceLine, NfeImportJob, Asset,
  ServiceOrderLineItem,
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
      const raw = params.search.trim();
      const term = `%${raw}%`;
      const digits = raw.replace(/\D/g, '');
      let orParts = [
        `description.ilike.${term}`,
        `sku.ilike.${term}`,
        `brand_name.ilike.${term}`,
        `category_name.ilike.${term}`,
        `location.ilike.${term}`,
        `notes.ilike.${term}`,
      ];
      if (digits) {
        orParts.push(`barcode.ilike.%${digits}%`);
        const num = parseInt(digits);
        if (!isNaN(num) && num > 0) orParts.push(`code.eq.${num}`);
      }
      query = query.or(orParts.join(','));
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
      const raw = params.search.trim();
      const term = `%${raw}%`;
      const num = parseInt(raw.replace(/\D/g, ''));
      let orParts = [
        `client_name.ilike.${term}`,
        `plate.ilike.${term}`,
        `equipment_name.ilike.${term}`,
        `description.ilike.${term}`,
        `technician_name.ilike.${term}`,
      ];
      if (!isNaN(num) && num > 0) orParts.push(`order_number.eq.${num}`);
      query = query.or(orParts.join(','));
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

  // ==================== SERVICE ORDERS - CRUD ====================

  getNextServiceOrderNumber: async (): Promise<number> => {
    const { data } = await supabase
      .from('service_orders')
      .select('order_number')
      .order('order_number', { ascending: false })
      .limit(1);
    if (!data || data.length === 0) return 1;
    return (data[0].order_number || 0) + 1;
  },

  createServiceOrder: async (order: Partial<ServiceOrder>): Promise<ServiceOrder> => {
    const { data, error } = await supabase
      .from('service_orders')
      .insert(order)
      .select()
      .single();
    if (error) { console.error('Erro ao criar OS:', error); throw new Error(error.message); }
    return data;
  },

  updateServiceOrder: async (id: string, updates: Partial<ServiceOrder>): Promise<ServiceOrder> => {
    const { data, error } = await supabase
      .from('service_orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('Erro ao atualizar OS:', error); throw new Error(error.message); }
    return data;
  },

  updateServiceOrderStatus: async (id: string, situation: string, situationCode?: number): Promise<boolean> => {
    const isFinal = ['FINALIZADA', 'FECHAMENTO', 'CANCELADO'].includes(situation);
    const { error } = await supabase
      .from('service_orders')
      .update({
        situation,
        situation_code: situationCode ?? null,
        status: !isFinal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) { console.error('Erro ao atualizar situação:', error); throw new Error(error.message); }
    return true;
  },

  cancelServiceOrder: async (id: string, cancelReason: string): Promise<boolean> => {
    const { error } = await supabase
      .from('service_orders')
      .update({
        situation: 'CANCELADO',
        situation_code: 12,
        cancel_reason: cancelReason,
        status: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },

  // --- Service Order Items CRUD ---

  createServiceOrderItem: async (item: Partial<ServiceOrderItem>): Promise<ServiceOrderItem> => {
    const { data, error } = await supabase
      .from('service_order_items')
      .insert(item)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  deleteServiceOrderItem: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('service_order_items')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },

  saveServiceOrderItems: async (
    serviceOrderId: string,
    orderNumber: number,
    items: ServiceOrderLineItem[],
    clientName?: string,
    plate?: string,
  ): Promise<boolean> => {
    // 1. Fetch existing
    const existing = await inventoryService.getServiceOrderItems(serviceOrderId);
    const existingIds = new Set(existing.map(e => e.id));
    const incomingIds = new Set(items.filter(i => i.id).map(i => i.id!));

    // 2. Delete removed items
    for (const e of existing) {
      if (!incomingIds.has(e.id)) {
        await inventoryService.deleteServiceOrderItem(e.id);
      }
    }

    // 3. Upsert items
    for (const item of items) {
      const payload: any = {
        service_order_id: serviceOrderId,
        order_number: orderNumber,
        item_id: item.item_id || null,
        product_code: item.product_code ?? null,
        description: item.description,
        reference: item.reference || null,
        is_service: item.is_service,
        is_product: item.is_product,
        unit: item.unit || 'UNI',
        unit_cost: item.unit_cost,
        unit_price: item.unit_price,
        quantity: item.quantity,
        discount: item.discount,
        discount_percent: item.discount_percent,
        total: item.total,
        commission: item.commission || 0,
        technician_code: item.technician_code ?? null,
        technician_name: item.technician_name || null,
        client_name: clientName || null,
        plate: plate || null,
        item_date: item.item_date || new Date().toISOString().slice(0, 10),
        status: true,
      };

      if (item.id && existingIds.has(item.id)) {
        const { error } = await supabase
          .from('service_order_items')
          .update(payload)
          .eq('id', item.id);
        if (error) throw new Error(error.message);
      } else {
        await inventoryService.createServiceOrderItem(payload);
      }
    }

    return true;
  },

  finalizeServiceOrder: async (
    serviceOrderId: string,
    items: ServiceOrderLineItem[],
    userName: string,
    clientName?: string,
  ): Promise<boolean> => {
    // 1. Create SAIDA_OS movements for each product item with item_id
    const productItems = items.filter(i => i.is_product && i.item_id);
    for (const item of productItems) {
      await inventoryService.createMovement({
        item_id: item.item_id!,
        movement_type: 'SAIDA_OS',
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_value: item.unit_cost * item.quantity,
        reference_type: 'OS',
        entity_name: clientName || '',
        notes: `OS - ${item.description}`,
        user_name: userName,
      });
    }

    // 2. Mark OS as FINALIZADA
    await inventoryService.updateServiceOrder(serviceOrderId, {
      situation: 'FINALIZADA',
      situation_code: 10,
      status: false,
      exit_date: new Date().toISOString().slice(0, 10),
      exit_time: new Date().toTimeString().slice(0, 5),
    } as any);

    return true;
  },

  // --- Client Search (entities) ---

  searchClients: async (search: string): Promise<{
    id: string; name: string; document?: string; phone?: string;
    phone2?: string; email?: string; city?: string; state?: string;
  }[]> => {
    const raw = search.trim();
    const term = `%${raw}%`;
    const digits = raw.replace(/\D/g, '');
    let orParts = [`name.ilike.${term}`, `social_reason.ilike.${term}`, `email.ilike.${term}`, `city.ilike.${term}`];
    if (digits.length >= 3) orParts.push(`document.ilike.%${digits}%`);
    if (raw.length >= 3) orParts.push(`phone.ilike.${term}`);
    const { data, error } = await supabase
      .from('entities')
      .select('id, name, document, phone, phone2, email, city, state')
      .eq('is_client', true)
      .eq('active', true)
      .or(orParts.join(','))
      .order('name')
      .limit(15);
    if (error) { console.error('Erro ao buscar clientes:', error); return []; }
    return data || [];
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
      const raw = params.search.trim();
      const term = `%${raw}%`;
      const num = parseInt(raw.replace(/\D/g, ''));
      let orParts = [`supplier_name.ilike.${term}`, `notes.ilike.${term}`, `payment_form.ilike.${term}`];
      if (!isNaN(num) && num > 0) orParts.push(`order_number.eq.${num}`);
      query = query.or(orParts.join(','));
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
      const { smartSearch } = await import('../lib/smartSearch');
      result = smartSearch(result, params.search, [
        { key: 'name', weight: 3 },
        { key: 'email', weight: 1.5 },
        { key: 'cpf', isDocument: true, weight: 2 },
        { key: 'phone', isPhone: true },
        { key: 'specialty', weight: 1 },
      ]);
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

  // ==================== COST CENTERS ====================

  getCostCenters: async (type?: string): Promise<CostCenter[]> => {
    let query = supabase.from('cost_centers').select('*').eq('is_active', true).order('name');
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) { console.error('Erro ao buscar centros de custo:', error); return []; }
    return data || [];
  },

  createCostCenter: async (cc: Partial<CostCenter>): Promise<CostCenter | null> => {
    const { data, error } = await supabase.from('cost_centers').insert(cc).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  updateCostCenter: async (id: string, updates: Partial<CostCenter>): Promise<CostCenter | null> => {
    const { data, error } = await supabase.from('cost_centers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  // ==================== EQUIPMENTS (autocomplete) ====================

  getEquipments: async (search?: string): Promise<Asset[]> => {
    let query = supabase.from('assets').select('id, code, name, model, brand, status, current_cost_center_id, default_cost_center_id').order('name');
    if (search) {
      const term = `%${search.trim()}%`;
      query = query.or(`name.ilike.${term},code.ilike.${term},model.ilike.${term},brand.ilike.${term}`);
    }
    const { data, error } = await query.limit(50);
    if (error) { console.error('Erro ao buscar equipamentos:', error); return []; }
    return (data || []) as unknown as Asset[];
  },

  // ==================== PURCHASE RECEIPTS (Retiradas) ====================

  getPurchaseReceipts: async (params?: {
    search?: string; status?: string; dateFrom?: string; dateTo?: string; page?: number; pageSize?: number;
  }): Promise<{ data: PurchaseReceipt[]; count: number }> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('purchase_receipts').select('*', { count: 'exact' })
      .order('receipt_date', { ascending: false }).range(from, to);

    if (params?.search) {
      const raw = params.search.trim();
      const term = `%${raw}%`;
      let orParts = [`supplier_name.ilike.${term}`, `receipt_number.ilike.${term}`, `notes.ilike.${term}`];
      query = query.or(orParts.join(','));
    }
    if (params?.status) query = query.eq('status', params.status);
    if (params?.dateFrom) query = query.gte('receipt_date', params.dateFrom);
    if (params?.dateTo) query = query.lte('receipt_date', params.dateTo);

    const { data, error, count } = await query;
    if (error) { console.error('Erro ao buscar retiradas:', error); return { data: [], count: 0 }; }

    // Enrich with items count
    if (data && data.length > 0) {
      const ids = data.map((r: any) => r.id);
      const { data: itemsData } = await supabase
        .from('purchase_receipt_items')
        .select('purchase_receipt_id, qty, unit_cost_estimated')
        .in('purchase_receipt_id', ids);

      const itemsMap = new Map<string, { count: number; totalQty: number; totalValue: number }>();
      (itemsData || []).forEach((i: any) => {
        const current = itemsMap.get(i.purchase_receipt_id) || { count: 0, totalQty: 0, totalValue: 0 };
        current.count++;
        current.totalQty += Number(i.qty) || 0;
        current.totalValue += (Number(i.qty) || 0) * (Number(i.unit_cost_estimated) || 0);
        itemsMap.set(i.purchase_receipt_id, current);
      });

      return {
        data: data.map((r: any) => {
          const stats = itemsMap.get(r.id);
          return { ...r, items_count: stats?.count || 0, total_qty: stats?.totalQty || 0, estimated_total: stats?.totalValue || 0 };
        }),
        count: count || 0,
      };
    }
    return { data: data || [], count: count || 0 };
  },

  getPurchaseReceiptById: async (id: string): Promise<PurchaseReceipt | null> => {
    const { data, error } = await supabase.from('purchase_receipts').select('*').eq('id', id).single();
    if (error) { console.error('Erro ao buscar retirada:', error); return null; }
    return data;
  },

  getReceiptItems: async (receiptId: string): Promise<PurchaseReceiptItem[]> => {
    const { data, error } = await supabase
      .from('purchase_receipt_items').select('*').eq('purchase_receipt_id', receiptId).order('created_at');
    if (error) { console.error('Erro ao buscar itens da retirada:', error); return []; }

    if (data && data.length > 0) {
      const itemIds = [...new Set(data.map((i: any) => i.inventory_item_id))];
      const { data: items } = await supabase.from('inventory_items').select('id, code, description, unit').in('id', itemIds);
      const itemMap = new Map((items || []).map((i: any) => [i.id, i]));
      return data.map((ri: any) => {
        const item = itemMap.get(ri.inventory_item_id);
        return { ...ri, item_description: item?.description, item_code: item?.code, item_unit: item?.unit };
      });
    }
    return data || [];
  },

  getReceiptAllocations: async (receiptItemId: string): Promise<PurchaseReceiptItemAllocation[]> => {
    const { data, error } = await supabase
      .from('purchase_receipt_item_allocations').select('*').eq('purchase_receipt_item_id', receiptItemId).order('created_at');
    if (error) { console.error('Erro ao buscar alocacoes:', error); return []; }

    if (data && data.length > 0) {
      const equipIds = data.filter((a: any) => a.equipment_id).map((a: any) => a.equipment_id);
      const ccIds = data.filter((a: any) => a.cost_center_id).map((a: any) => a.cost_center_id);

      const [equipRes, ccRes] = await Promise.all([
        equipIds.length > 0 ? supabase.from('assets').select('id, name').in('id', equipIds) : { data: [] },
        ccIds.length > 0 ? supabase.from('cost_centers').select('id, name').in('id', ccIds) : { data: [] },
      ]);

      const equipMap = new Map((equipRes.data || []).map((e: any) => [e.id, e.name]));
      const ccMap = new Map((ccRes.data || []).map((c: any) => [c.id, c.name]));

      return data.map((a: any) => ({
        ...a,
        equipment_name: a.equipment_id ? equipMap.get(a.equipment_id) : undefined,
        cost_center_name: a.cost_center_id ? ccMap.get(a.cost_center_id) : undefined,
      }));
    }
    return data || [];
  },

  createPurchaseReceipt: async (receipt: Partial<PurchaseReceipt>): Promise<PurchaseReceipt | null> => {
    const { data, error } = await supabase.from('purchase_receipts').insert(receipt).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  updatePurchaseReceipt: async (id: string, updates: Partial<PurchaseReceipt>): Promise<PurchaseReceipt | null> => {
    const { data, error } = await supabase.from('purchase_receipts')
      .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  addReceiptItem: async (item: { purchase_receipt_id: string; inventory_item_id: string; qty: number; unit_cost_estimated?: number; notes?: string }): Promise<PurchaseReceiptItem | null> => {
    const { data, error } = await supabase.from('purchase_receipt_items').insert(item).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  updateReceiptItem: async (id: string, updates: Partial<PurchaseReceiptItem>): Promise<PurchaseReceiptItem | null> => {
    const { data, error } = await supabase.from('purchase_receipt_items').update(updates).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  deleteReceiptItem: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('purchase_receipt_items').delete().eq('id', id);
    if (error) { console.error('Erro ao excluir item:', error); return false; }
    return true;
  },

  upsertAllocation: async (alloc: Partial<PurchaseReceiptItemAllocation>): Promise<PurchaseReceiptItemAllocation | null> => {
    if (alloc.id) {
      const { data, error } = await supabase.from('purchase_receipt_item_allocations').update(alloc).eq('id', alloc.id).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    const { data, error } = await supabase.from('purchase_receipt_item_allocations').insert(alloc).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  deleteAllocation: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('purchase_receipt_item_allocations').delete().eq('id', id);
    if (error) { console.error('Erro ao excluir alocacao:', error); return false; }
    return true;
  },

  finalizeReceipt: async (receiptId: string): Promise<any> => {
    const { data, error } = await supabase.rpc('finalize_receipt', { p_receipt_id: receiptId });
    if (error) throw new Error(error.message);
    return data;
  },

  cancelReceipt: async (receiptId: string): Promise<boolean> => {
    const { error } = await supabase.from('purchase_receipts')
      .update({ status: 'CANCELED', updated_at: new Date().toISOString() }).eq('id', receiptId);
    if (error) throw new Error(error.message);
    return true;
  },

  getReceiptStats: async (): Promise<{ total: number; drafts: number; pendingInvoice: number; estimatedPending: number }> => {
    const { count: total } = await supabase.from('purchase_receipts').select('*', { count: 'exact', head: true });
    const { count: drafts } = await supabase.from('purchase_receipts').select('*', { count: 'exact', head: true }).eq('status', 'DRAFT');
    const { data: pendingData } = await supabase.from('v_pending_invoices').select('estimated_total');
    const pendingInvoice = pendingData?.length || 0;
    const estimatedPending = (pendingData || []).reduce((s, r) => s + (Number(r.estimated_total) || 0), 0);
    return { total: total || 0, drafts: drafts || 0, pendingInvoice, estimatedPending: Math.round(estimatedPending * 100) / 100 };
  },

  // ==================== SUPPLIER INVOICES (NF Fornecedor) ====================

  getSupplierInvoices: async (params?: {
    search?: string; status?: string; dateFrom?: string; dateTo?: string; page?: number; pageSize?: number;
  }): Promise<{ data: SupplierInvoice[]; count: number }> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('supplier_invoices').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range(from, to);

    if (params?.search) {
      const raw = params.search.trim();
      const term = `%${raw}%`;
      const digits = raw.replace(/\D/g, '');
      let orParts = [`supplier_name.ilike.${term}`, `invoice_number.ilike.${term}`];
      if (digits.length >= 5) orParts.push(`chave_nfe.ilike.%${digits}%`);
      else orParts.push(`chave_nfe.ilike.${term}`);
      query = query.or(orParts.join(','));
    }
    if (params?.status) query = query.eq('status', params.status);
    if (params?.dateFrom) query = query.gte('issue_date', params.dateFrom);
    if (params?.dateTo) query = query.lte('issue_date', params.dateTo);

    const { data, error, count } = await query;
    if (error) { console.error('Erro ao buscar NFs:', error); return { data: [], count: 0 }; }
    return { data: data || [], count: count || 0 };
  },

  getSupplierInvoiceById: async (id: string): Promise<SupplierInvoice | null> => {
    const { data, error } = await supabase.from('supplier_invoices').select('*').eq('id', id).single();
    if (error) { console.error('Erro ao buscar NF:', error); return null; }
    return data;
  },

  getInvoiceLines: async (invoiceId: string): Promise<SupplierInvoiceLine[]> => {
    const { data, error } = await supabase.from('supplier_invoice_lines').select('*').eq('supplier_invoice_id', invoiceId).order('created_at');
    if (error) { console.error('Erro ao buscar linhas NF:', error); return []; }

    if (data && data.length > 0) {
      const itemIds = data.filter((l: any) => l.inventory_item_id).map((l: any) => l.inventory_item_id);
      if (itemIds.length > 0) {
        const { data: items } = await supabase.from('inventory_items').select('id, description').in('id', itemIds);
        const itemMap = new Map((items || []).map((i: any) => [i.id, i.description]));
        return data.map((l: any) => ({ ...l, matched_item_description: l.inventory_item_id ? itemMap.get(l.inventory_item_id) : undefined }));
      }
    }
    return data || [];
  },

  createSupplierInvoice: async (invoice: Partial<SupplierInvoice>): Promise<SupplierInvoice | null> => {
    const { data, error } = await supabase.from('supplier_invoices').insert(invoice).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  updateInvoiceLine: async (id: string, updates: Partial<SupplierInvoiceLine>): Promise<SupplierInvoiceLine | null> => {
    const { data, error } = await supabase.from('supplier_invoice_lines').update(updates).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  createInvoiceLines: async (lines: Partial<SupplierInvoiceLine>[]): Promise<SupplierInvoiceLine[]> => {
    const { data, error } = await supabase.from('supplier_invoice_lines').insert(lines).select();
    if (error) throw new Error(error.message);
    return data || [];
  },

  linkInvoiceToReceipts: async (invoiceId: string, receiptIds: string[]): Promise<boolean> => {
    const links = receiptIds.map(rid => ({ supplier_invoice_id: invoiceId, purchase_receipt_id: rid }));
    const { error } = await supabase.from('supplier_invoice_receipt_links').insert(links);
    if (error) throw new Error(error.message);
    return true;
  },

  getLinkedReceipts: async (invoiceId: string): Promise<PurchaseReceipt[]> => {
    const { data: links } = await supabase.from('supplier_invoice_receipt_links').select('purchase_receipt_id').eq('supplier_invoice_id', invoiceId);
    if (!links || links.length === 0) return [];
    const ids = links.map((l: any) => l.purchase_receipt_id);
    const { data } = await supabase.from('purchase_receipts').select('*').in('id', ids);
    return data || [];
  },

  confirmNfEntry: async (invoiceId: string): Promise<any> => {
    const { data, error } = await supabase.rpc('confirm_nf_entry', { p_invoice_id: invoiceId });
    if (error) throw new Error(error.message);
    return data;
  },

  getPendingReceipts: async (supplierName?: string): Promise<PurchaseReceipt[]> => {
    let query = supabase.from('purchase_receipts').select('*').eq('status', 'PENDING_INVOICE').order('receipt_date', { ascending: false });
    if (supplierName) query = query.ilike('supplier_name', `%${supplierName}%`);
    const { data, error } = await query;
    if (error) { console.error('Erro ao buscar retiradas pendentes:', error); return []; }
    return data || [];
  },

  // ==================== NFE IMPORT JOBS ====================

  createImportJob: async (job: Partial<NfeImportJob>): Promise<NfeImportJob | null> => {
    const { data, error } = await supabase.from('nfe_import_jobs').insert(job).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  updateImportJob: async (id: string, updates: Partial<NfeImportJob>): Promise<NfeImportJob | null> => {
    const { data, error } = await supabase.from('nfe_import_jobs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  // ==================== PRODUCT MATCHING (para NF) ====================

  matchProductByEan: async (ean: string): Promise<InventoryItem | null> => {
    const { data } = await supabase.from('inventory_items').select('*').eq('barcode', ean).eq('active', true).limit(1).single();
    return data ? enrichItem(data) : null;
  },

  matchProductBySku: async (sku: string): Promise<InventoryItem | null> => {
    const { data } = await supabase.from('inventory_items').select('*').eq('sku', sku).eq('active', true).limit(1).single();
    return data ? enrichItem(data) : null;
  },

  matchProductByDescription: async (desc: string): Promise<InventoryItem[]> => {
    const term = `%${desc}%`;
    const { data } = await supabase.from('inventory_items').select('*').ilike('description', term).eq('active', true).limit(5);
    return (data || []).map(enrichItem);
  },

  // ==================== REPORT VIEWS ====================

  getPendingInvoiceSummary: async (): Promise<{ count: number; estimated_total: number }> => {
    const { data } = await supabase.from('v_pending_invoices').select('estimated_total');
    return {
      count: data?.length || 0,
      estimated_total: (data || []).reduce((s, r) => s + (Number(r.estimated_total) || 0), 0),
    };
  },

  getCostByEquipmentMonth: async (month?: string): Promise<any[]> => {
    let query = supabase.from('v_cost_by_equipment_month').select('*');
    if (month) query = query.eq('month', month);
    const { data, error } = await query.limit(50);
    if (error) { console.error('Erro ao buscar custo por equipamento:', error); return []; }
    return data || [];
  },

  getCostByCostCenterMonth: async (month?: string): Promise<any[]> => {
    let query = supabase.from('v_cost_by_cost_center_month').select('*');
    if (month) query = query.eq('month', month);
    const { data, error } = await query.limit(50);
    if (error) { console.error('Erro ao buscar custo por centro:', error); return []; }
    return data || [];
  },
};
