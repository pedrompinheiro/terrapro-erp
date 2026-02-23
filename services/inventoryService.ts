/**
 * TERRAPRO ERP - Inventory Service
 *
 * Conecta o frontend ao Supabase para o módulo Almoxarifado.
 * Substitui o mock data por dados reais do banco de dados.
 */

import { supabase } from '../lib/supabase';
import { InventoryItem, InventoryCategory, InventoryBrand, InventoryMovement, ServiceOrder, PurchaseOrder, Technician } from '../types';

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
// INVENTORY ITEMS (PRODUTOS / PEÇAS)
// ============================================================

export const inventoryService = {

  // ---------- ITEMS ----------

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

    // Filtrar por status calculado no frontend
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
    // Soft delete
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

  // ---------- CATEGORIES ----------

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

  // ---------- BRANDS ----------

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

  // ---------- STATS ----------

  getStats: async (): Promise<{
    totalItems: number;
    totalProducts: number;
    totalServices: number;
    belowMinimum: number;
    outOfStock: number;
    totalStockValue: number;
    totalCostValue: number;
  }> => {
    // Total de itens ativos
    const { count: totalItems } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    // Produtos vs serviços
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

    // Abaixo do mínimo
    const { data: belowMinData } = await supabase
      .from('inventory_items')
      .select('id')
      .eq('active', true)
      .eq('is_product', true)
      .not('qty_minimum', 'eq', 0)
      .filter('qty_current', 'lte', 'qty_minimum');

    // Sem estoque
    const { count: outOfStock } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
      .eq('is_product', true)
      .lte('qty_current', 0);

    // Valor total em estoque (custo * qty)
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

  // ---------- SERVICE ORDERS ----------

  getServiceOrders: async (limit = 20): Promise<ServiceOrder[]> => {
    const { data, error } = await supabase
      .from('service_orders')
      .select('id, order_number, is_order, is_quote, entry_date, exit_date, client_name, client_phone, equipment_name, model_name, brand_name, plate, km, situation, technician_name, products_value, services_value, total_value, is_paid, status, created_at')
      .order('order_number', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar OS:', error);
      return [];
    }

    return data || [];
  },

  // ---------- PURCHASE ORDERS ----------

  getPurchaseOrders: async (limit = 20): Promise<PurchaseOrder[]> => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('id, order_number, is_order, is_quote, order_date, supplier_name, situation, total_value, is_paid, status, created_at')
      .order('order_number', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      return [];
    }

    return data || [];
  },

  // ---------- TECHNICIANS ----------

  getTechnicians: async (): Promise<Technician[]> => {
    const { data, error } = await supabase
      .from('technicians')
      .select('id, code, name, is_technician, is_mechanic, phone, cell_phone, email, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Erro ao buscar técnicos:', error);
      return [];
    }

    return data || [];
  },
};
