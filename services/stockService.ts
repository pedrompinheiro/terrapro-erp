/**
 * Serviço de Almoxarifado e Estoque
 * CRUD de itens, movimentações, compras, dashboard KPIs e features inteligentes
 */

import { supabase } from '../lib/supabase';
import type {
  StockItem, StockCategory, StockBrand, StockLocation,
  StockMovement, PurchaseRequisition, PurchaseOrder, PurchaseOrderItem,
  StockDashboardKPIs, StockAlert, MovementType, MovementReason,
} from '../types';

class StockService {

  // ============================================================
  // ITENS DE ESTOQUE
  // ============================================================

  async listarItems(filtros?: {
    search?: string;
    category_id?: string;
    brand_id?: string;
    stock_status?: string;
    status?: string;
    abc_classification?: string;
    page?: number;
    per_page?: number;
    order_by?: string;
    order_dir?: 'asc' | 'desc';
  }): Promise<{ data: StockItem[]; count: number }> {
    const page = filtros?.page || 1;
    const perPage = filtros?.per_page || 50;
    const offset = (page - 1) * perPage;

    let query = supabase
      .from('stock_items')
      .select(`
        *,
        category:stock_categories(id, code, name),
        brand:stock_brands(id, name)
      `, { count: 'exact' });

    // Filtros
    if (filtros?.search) {
      const s = filtros.search.trim();
      query = query.or(`description.ilike.%${s}%,code.ilike.%${s}%,reference.ilike.%${s}%,barcode.ilike.%${s}%`);
    }

    if (filtros?.category_id) {
      query = query.eq('category_id', filtros.category_id);
    }

    if (filtros?.brand_id) {
      query = query.eq('brand_id', filtros.brand_id);
    }

    if (filtros?.stock_status) {
      query = query.eq('stock_status', filtros.stock_status);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.abc_classification) {
      query = query.eq('abc_classification', filtros.abc_classification);
    }

    // Ordenação
    const orderBy = filtros?.order_by || 'description';
    const orderDir = filtros?.order_dir === 'desc' ? false : true;
    query = query.order(orderBy, { ascending: orderDir });

    // Paginação
    query = query.range(offset, offset + perPage - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: (data || []) as unknown as StockItem[], count: count || 0 };
  }

  async getItem(id: string): Promise<StockItem | null> {
    const { data, error } = await supabase
      .from('stock_items')
      .select(`
        *,
        category:stock_categories(id, code, name),
        brand:stock_brands(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as unknown as StockItem;
  }

  async criarItem(item: Partial<StockItem>): Promise<StockItem> {
    // Remover campos virtuais/joins antes de inserir
    const { category, brand, primary_supplier, stock_status, compatible_assets, equivalent_items, technical_specs, photos, ...insertData } = item as any;

    // Remove empty FK refs to avoid constraint errors
    if (!insertData.primary_supplier_id) delete insertData.primary_supplier_id;
    if (!insertData.category_id) delete insertData.category_id;
    if (!insertData.brand_id) delete insertData.brand_id;
    if (!insertData.location_id) delete insertData.location_id;

    // Remove any undefined/null values that could cause issues
    Object.keys(insertData).forEach(k => {
      if (insertData[k] === undefined) delete insertData[k];
    });

    const { data, error } = await supabase
      .from('stock_items')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data as StockItem;
  }

  async atualizarItem(id: string, updates: Partial<StockItem>): Promise<StockItem> {
    const { category, brand, primary_supplier, stock_status, compatible_assets, equivalent_items, technical_specs, photos, ...updateData } = updates as any;
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    // Remove empty FK refs
    if (!updateData.primary_supplier_id) delete updateData.primary_supplier_id;
    if (updateData.category_id === '') delete updateData.category_id;
    if (updateData.brand_id === '') delete updateData.brand_id;

    // Remove undefined values
    Object.keys(updateData).forEach(k => {
      if (updateData[k] === undefined) delete updateData[k];
    });

    const { data, error } = await supabase
      .from('stock_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as StockItem;
  }

  /**
   * Soft delete — marca como INACTIVE em vez de excluir permanentemente.
   * Preserva o histórico de movimentações e permite reativação futura.
   */
  async desativarItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('stock_items')
      .update({ status: 'INACTIVE' })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Reativar um item que foi desativado (soft delete)
   */
  async reativarItem(id: string): Promise<StockItem> {
    const { data, error } = await supabase
      .from('stock_items')
      .update({ status: 'ACTIVE' })
      .eq('id', id)
      .select(`
        *,
        category:stock_categories(id, code, name),
        brand:stock_brands(id, name)
      `)
      .single();

    if (error) throw error;
    return data as unknown as StockItem;
  }

  /**
   * Busca produtos similares para detecção de duplicatas.
   * Compara: código exato, barcode exato, referência exata,
   * e descrição por similaridade (palavras em comum).
   * Inclui itens INACTIVE para sugerir reativação.
   */
  async buscarDuplicatas(item: {
    code?: string;
    barcode?: string;
    reference?: string;
    description?: string;
  }, excludeId?: string): Promise<{ item: StockItem; matchType: string; score: number }[]> {
    const matches: { item: StockItem; matchType: string; score: number }[] = [];
    const seenIds = new Set<string>();

    // 1. Código exato
    if (item.code?.trim()) {
      const { data } = await supabase
        .from('stock_items')
        .select(`*, category:stock_categories(id, code, name), brand:stock_brands(id, name)`)
        .ilike('code', item.code.trim())
        .limit(5);

      for (const d of data || []) {
        if (d.id === excludeId) continue;
        seenIds.add(d.id);
        matches.push({ item: d as unknown as StockItem, matchType: 'Código idêntico', score: 100 });
      }
    }

    // 2. Barcode exato
    if (item.barcode?.trim()) {
      const { data } = await supabase
        .from('stock_items')
        .select(`*, category:stock_categories(id, code, name), brand:stock_brands(id, name)`)
        .eq('barcode', item.barcode.trim())
        .limit(5);

      for (const d of data || []) {
        if (d.id === excludeId || seenIds.has(d.id)) continue;
        seenIds.add(d.id);
        matches.push({ item: d as unknown as StockItem, matchType: 'Código de barras idêntico', score: 95 });
      }
    }

    // 3. Referência exata
    if (item.reference?.trim()) {
      const { data } = await supabase
        .from('stock_items')
        .select(`*, category:stock_categories(id, code, name), brand:stock_brands(id, name)`)
        .ilike('reference', item.reference.trim())
        .limit(5);

      for (const d of data || []) {
        if (d.id === excludeId || seenIds.has(d.id)) continue;
        seenIds.add(d.id);
        matches.push({ item: d as unknown as StockItem, matchType: 'Referência idêntica', score: 90 });
      }
    }

    // 4. Descrição similar — busca por palavras-chave (3+ caracteres)
    if (item.description?.trim()) {
      const words = item.description.trim().toUpperCase()
        .split(/\s+/)
        .filter(w => w.length >= 3)
        .slice(0, 5); // máximo 5 palavras

      if (words.length > 0) {
        // Busca itens que contenham a primeira palavra significativa
        const mainWord = words[0];
        const { data } = await supabase
          .from('stock_items')
          .select(`*, category:stock_categories(id, code, name), brand:stock_brands(id, name)`)
          .ilike('description', `%${mainWord}%`)
          .limit(50);

        for (const d of data || []) {
          if (d.id === excludeId || seenIds.has(d.id)) continue;
          const descUpper = (d.description || '').toUpperCase();
          const matchCount = words.filter(w => descUpper.includes(w)).length;
          const score = Math.round((matchCount / words.length) * 80); // max 80 para descrição

          if (score >= 40) { // pelo menos metade das palavras coincide
            seenIds.add(d.id);
            matches.push({
              item: d as unknown as StockItem,
              matchType: `Descrição similar (${matchCount}/${words.length} palavras)`,
              score,
            });
          }
        }
      }
    }

    // Ordenar por score (maior primeiro)
    return matches.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  // ============================================================
  // CATEGORIAS
  // ============================================================

  async listarCategorias(): Promise<StockCategory[]> {
    const { data, error } = await supabase
      .from('stock_categories')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) throw error;
    return (data || []) as StockCategory[];
  }

  async criarCategoria(cat: Partial<StockCategory>): Promise<StockCategory> {
    const { data, error } = await supabase
      .from('stock_categories')
      .insert(cat)
      .select()
      .single();

    if (error) throw error;
    return data as StockCategory;
  }

  // ============================================================
  // MARCAS
  // ============================================================

  async listarMarcas(): Promise<StockBrand[]> {
    const { data, error } = await supabase
      .from('stock_brands')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) throw error;
    return (data || []) as StockBrand[];
  }

  async criarMarca(brand: Partial<StockBrand>): Promise<StockBrand> {
    const { data, error } = await supabase
      .from('stock_brands')
      .insert(brand)
      .select()
      .single();

    if (error) throw error;
    return data as StockBrand;
  }

  // ============================================================
  // LOCALIZAÇÕES
  // ============================================================

  async listarLocais(): Promise<StockLocation[]> {
    const { data, error } = await supabase
      .from('stock_locations')
      .select('*')
      .eq('active', true)
      .order('code');

    if (error) throw error;
    return (data || []) as StockLocation[];
  }

  // ============================================================
  // MOVIMENTAÇÕES DE ESTOQUE
  // ============================================================

  async registrarMovimento(mov: {
    item_id: string;
    type: MovementType;
    reason: MovementReason;
    quantity: number;
    direction: 1 | -1;
    unit_cost?: number;
    purchase_order_id?: string;
    maintenance_os_id?: string;
    asset_id?: string;
    asset_name?: string;
    supplier_id?: string;
    invoice_number?: string;
    from_location?: string;
    to_location?: string;
    notes?: string;
    performed_by_name?: string;
  }): Promise<StockMovement> {
    // Remove supplier_id if it's empty to avoid FK constraint issues
    const insertData: any = { ...mov };
    if (!insertData.supplier_id) delete insertData.supplier_id;
    if (!insertData.asset_id) delete insertData.asset_id;
    if (!insertData.purchase_order_id) delete insertData.purchase_order_id;

    const { data, error } = await supabase
      .from('stock_movements')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data as StockMovement;
  }

  async listarMovimentos(filtros?: {
    item_id?: string;
    type?: string;
    reason?: string;
    asset_id?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: StockMovement[]; count: number }> {
    const page = filtros?.page || 1;
    const perPage = filtros?.per_page || 50;
    const offset = (page - 1) * perPage;

    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        item:stock_items!item_id(id, code, description, unit)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filtros?.item_id) query = query.eq('item_id', filtros.item_id);
    if (filtros?.type) query = query.eq('type', filtros.type);
    if (filtros?.reason) query = query.eq('reason', filtros.reason);
    if (filtros?.asset_id) query = query.eq('asset_id', filtros.asset_id);
    if (filtros?.date_from) query = query.gte('created_at', filtros.date_from);
    if (filtros?.date_to) query = query.lte('created_at', filtros.date_to);

    query = query.range(offset, offset + perPage - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: (data || []) as unknown as StockMovement[], count: count || 0 };
  }

  // ============================================================
  // REQUISIÇÕES DE COMPRA
  // ============================================================

  async listarRequisicoes(filtros?: {
    status?: string;
  }): Promise<PurchaseRequisition[]> {
    let query = supabase
      .from('purchase_requisitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filtros?.status) query = query.eq('status', filtros.status);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as PurchaseRequisition[];
  }

  async criarRequisicao(req: Partial<PurchaseRequisition>): Promise<PurchaseRequisition> {
    if (!req.number) {
      req.number = await this.gerarNumero('RC');
    }

    const { data, error } = await supabase
      .from('purchase_requisitions')
      .insert(req)
      .select()
      .single();

    if (error) throw error;
    return data as PurchaseRequisition;
  }

  async aprovarRequisicao(id: string, aprovador?: string): Promise<void> {
    const { error } = await supabase
      .from('purchase_requisitions')
      .update({
        status: 'APROVADA',
        approved_by_name: aprovador || 'Admin',
        approved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  }

  async recusarRequisicao(id: string): Promise<void> {
    const { error } = await supabase
      .from('purchase_requisitions')
      .update({ status: 'RECUSADA' })
      .eq('id', id);

    if (error) throw error;
  }

  // ============================================================
  // PEDIDOS DE COMPRA
  // ============================================================

  async listarPedidos(filtros?: {
    status?: string;
    supplier_id?: string;
  }): Promise<PurchaseOrder[]> {
    let query = supabase
      .from('purchase_orders')
      .select(`
        *,
        items:purchase_order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (filtros?.status) query = query.eq('status', filtros.status);
    if (filtros?.supplier_id) query = query.eq('supplier_id', filtros.supplier_id);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as PurchaseOrder[];
  }

  async criarPedido(
    po: Partial<PurchaseOrder>,
    items: Partial<PurchaseOrderItem>[]
  ): Promise<PurchaseOrder> {
    if (!po.number) {
      po.number = await this.gerarNumero('PO');
    }

    // Calcular totais
    const subtotal = items.reduce((sum, i) => sum + ((i.quantity || 0) * (i.unit_price || 0)), 0);
    po.subtotal = subtotal;
    po.total = subtotal + (po.freight || 0) - (po.discount || 0);

    // Inserir PO
    const poInsert: any = {
      number: po.number,
      supplier_name: po.supplier_name,
      status: po.status || 'RASCUNHO',
      requisition_id: po.requisition_id,
      payment_terms: po.payment_terms,
      delivery_deadline: po.delivery_deadline,
      subtotal: po.subtotal,
      freight: po.freight,
      discount: po.discount,
      total: po.total,
      notes: po.notes,
      created_by_name: po.created_by_name,
    };
    // Only include supplier_id if it's a valid UUID
    if (po.supplier_id) poInsert.supplier_id = po.supplier_id;

    const { data: poData, error: poError } = await supabase
      .from('purchase_orders')
      .insert(poInsert)
      .select()
      .single();

    if (poError) throw poError;

    // Inserir itens
    if (items.length > 0) {
      const poItems = items.map(i => ({
        purchase_order_id: poData.id,
        item_id: i.item_id,
        description: i.description || '',
        quantity: i.quantity || 0,
        unit: i.unit || 'UNI',
        unit_price: i.unit_price || 0,
        total_price: (i.quantity || 0) * (i.unit_price || 0),
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(poItems);

      if (itemsError) throw itemsError;
    }

    return poData as PurchaseOrder;
  }

  async receberPedido(
    po_id: string,
    received_items: { poi_id: string; item_id: string; qty_received: number; unit_cost: number; description: string }[],
    performer_name?: string
  ): Promise<void> {
    for (const ri of received_items) {
      if (ri.qty_received <= 0) continue;

      // Atualizar qtd recebida no item do PO
      const { data: poi } = await supabase
        .from('purchase_order_items')
        .select('qty_received')
        .eq('id', ri.poi_id)
        .single();

      await supabase
        .from('purchase_order_items')
        .update({ qty_received: (poi?.qty_received || 0) + ri.qty_received })
        .eq('id', ri.poi_id);

      // Criar movimento de ENTRADA
      await this.registrarMovimento({
        item_id: ri.item_id,
        type: 'ENTRADA',
        reason: 'COMPRA',
        quantity: ri.qty_received,
        direction: 1,
        unit_cost: ri.unit_cost,
        purchase_order_id: po_id,
        performed_by_name: performer_name || 'Sistema',
        notes: `Recebimento PO - ${ri.description}`,
      });
    }

    // Verificar se todos os itens foram recebidos completamente
    const { data: allItems } = await supabase
      .from('purchase_order_items')
      .select('quantity, qty_received')
      .eq('purchase_order_id', po_id);

    const allReceived = allItems?.every(i => (i.qty_received || 0) >= i.quantity);
    const anyReceived = allItems?.some(i => (i.qty_received || 0) > 0);

    const newStatus = allReceived ? 'RECEBIDA' : anyReceived ? 'PARCIAL' : 'CONFIRMADA';

    await supabase
      .from('purchase_orders')
      .update({
        status: newStatus,
        received_at: allReceived ? new Date().toISOString() : null,
      })
      .eq('id', po_id);
  }

  // ============================================================
  // DASHBOARD KPIs
  // ============================================================

  async getDashboardKPIs(): Promise<StockDashboardKPIs> {
    // Total de itens ativos
    const { count: totalItems } = await supabase
      .from('stock_items')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE');

    // Itens por stock_status
    const { data: allItems } = await supabase
      .from('stock_items')
      .select('current_qty, min_qty, cost_price, avg_cost, stock_status, last_movement_at, total_consumed_ytd')
      .eq('status', 'ACTIVE');

    const items = allItems || [];

    const totalValue = items.reduce((sum, i) => sum + ((i.current_qty || 0) * (i.avg_cost || i.cost_price || 0)), 0);
    // Use client-side logic for stock_status (GENERATED column) for reliability
    const belowMin = items.filter(i => {
      if (i.stock_status) return i.stock_status === 'CRITICAL';
      return (i.current_qty || 0) > 0 && (i.current_qty || 0) <= (i.min_qty || 0);
    }).length;
    const outOfStock = items.filter(i => {
      if (i.stock_status) return i.stock_status === 'OUT_OF_STOCK';
      return (i.current_qty || 0) <= 0;
    }).length;
    const warning = items.filter(i => {
      if (i.stock_status) return i.stock_status === 'WARNING';
      return (i.current_qty || 0) > (i.min_qty || 0) && (i.current_qty || 0) <= (i.min_qty || 0) * 1.5;
    }).length;

    // Estoque parado (>90 dias sem movimento)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const deadItems = items.filter(i =>
      !i.last_movement_at || new Date(i.last_movement_at) < ninetyDaysAgo
    );
    const deadStockValue = deadItems.reduce((sum, i) => sum + ((i.current_qty || 0) * (i.avg_cost || i.cost_price || 0)), 0);

    // Consumo total do mês
    const totalConsumedMonth = items.reduce((sum, i) => sum + (i.total_consumed_ytd || 0), 0);

    // POs pendentes
    const { count: pendingOrders } = await supabase
      .from('purchase_orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['ENVIADA', 'CONFIRMADA', 'PARCIAL']);

    return {
      total_items: totalItems || 0,
      total_value: totalValue,
      below_minimum: belowMin,
      out_of_stock: outOfStock,
      dead_stock_count: deadItems.length,
      dead_stock_value: deadStockValue,
      avg_turnover: totalItems ? totalConsumedMonth / (totalItems || 1) : 0,
      items_warning: warning,
      total_consumed_month: totalConsumedMonth,
      pending_orders: pendingOrders || 0,
    };
  }

  async getABCAnalysis(): Promise<{ classification: string; count: number; value: number; percentage: number }[]> {
    const { data } = await supabase
      .from('stock_items')
      .select('abc_classification, current_qty, cost_price, avg_cost')
      .eq('status', 'ACTIVE');

    const items = data || [];

    const groups: Record<string, { count: number; value: number }> = { A: { count: 0, value: 0 }, B: { count: 0, value: 0 }, C: { count: 0, value: 0 } };
    const totalValue = items.reduce((sum, i) => {
      const val = (i.current_qty || 0) * (i.avg_cost || i.cost_price || 0);
      const cls = i.abc_classification || 'C';
      if (groups[cls]) {
        groups[cls].count++;
        groups[cls].value += val;
      }
      return sum + val;
    }, 0);

    return Object.entries(groups).map(([cls, g]) => ({
      classification: cls,
      count: g.count,
      value: g.value,
      percentage: totalValue > 0 ? (g.value / totalValue) * 100 : 0,
    }));
  }

  async getTopConsumed(limit = 10): Promise<{ item_id: string; code: string; description: string; total: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from('stock_movements')
      .select(`
        item_id, quantity,
        item:stock_items!item_id(code, description)
      `)
      .eq('direction', -1)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (!data || data.length === 0) return [];

    // Agrupar por item
    const grouped: Record<string, { code: string; description: string; total: number }> = {};
    for (const m of data) {
      const item = m.item as any;
      if (!grouped[m.item_id]) {
        grouped[m.item_id] = { code: item?.code || '', description: item?.description || '', total: 0 };
      }
      grouped[m.item_id].total += m.quantity || 0;
    }

    return Object.entries(grouped)
      .map(([item_id, g]) => ({ item_id, ...g }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }

  async getStockAlerts(): Promise<StockAlert[]> {
    const alerts: StockAlert[] = [];
    const now = new Date().toISOString();

    // Itens com estoque crítico ou zerado (filter client-side for GENERATED column compatibility)
    const { data: lowStockItems } = await supabase
      .from('stock_items')
      .select('id, code, description, current_qty, min_qty, stock_status')
      .eq('status', 'ACTIVE')
      .order('current_qty')
      .limit(100);

    const criticalItems = (lowStockItems || []).filter(i =>
      i.stock_status === 'CRITICAL' || i.stock_status === 'OUT_OF_STOCK' ||
      (i.current_qty || 0) <= (i.min_qty || 0)
    ).slice(0, 20);

    for (const item of criticalItems || []) {
      alerts.push({
        id: `alert-${item.id}`,
        type: item.stock_status === 'OUT_OF_STOCK' ? 'CRITICAL' : 'WARNING',
        category: item.stock_status === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        title: item.stock_status === 'OUT_OF_STOCK' ? 'Estoque Zerado' : 'Estoque Abaixo do Mínimo',
        description: `${item.code} - ${item.description} | Atual: ${item.current_qty} | Mín: ${item.min_qty}`,
        item_id: item.id,
        item_code: item.code,
        created_at: now,
      });
    }

    // POs atrasados
    const { data: overduePOs } = await supabase
      .from('purchase_orders')
      .select('id, number, supplier_name, delivery_deadline')
      .in('status', ['ENVIADA', 'CONFIRMADA'])
      .lt('delivery_deadline', new Date().toISOString().split('T')[0])
      .limit(10);

    for (const po of overduePOs || []) {
      alerts.push({
        id: `alert-po-${po.id}`,
        type: 'WARNING',
        category: 'OVERDUE_PO',
        title: 'Pedido de Compra Atrasado',
        description: `PO ${po.number} - ${po.supplier_name} | Prazo: ${po.delivery_deadline}`,
        created_at: now,
      });
    }

    return alerts.sort((a, b) => {
      const order: Record<string, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };
      return (order[a.type] ?? 9) - (order[b.type] ?? 9);
    });
  }

  // ============================================================
  // FEATURES INTELIGENTES
  // ============================================================

  async calculateABCClassification(): Promise<{ updated: number }> {
    const { data: items } = await supabase
      .from('stock_items')
      .select('id, current_qty, cost_price, avg_cost')
      .eq('status', 'ACTIVE')
      .gt('current_qty', 0);

    if (!items || items.length === 0) return { updated: 0 };

    // Calcular valor de cada item
    const itemValues = items.map(i => ({
      id: i.id,
      value: (i.current_qty || 0) * (i.avg_cost || i.cost_price || 0),
    })).sort((a, b) => b.value - a.value);

    const totalValue = itemValues.reduce((sum, i) => sum + i.value, 0);
    let cumulative = 0;
    let updated = 0;

    for (const item of itemValues) {
      cumulative += item.value;
      const pct = (cumulative / totalValue) * 100;

      let classification = 'C';
      if (pct <= 70) classification = 'A';
      else if (pct <= 90) classification = 'B';

      await supabase
        .from('stock_items')
        .update({ abc_classification: classification })
        .eq('id', item.id);

      updated++;
    }

    return { updated };
  }

  async calculateReorderPoints(): Promise<{ updated: number }> {
    const { data: items } = await supabase
      .from('stock_items')
      .select('id, consumption_avg_monthly, lead_time_days, min_qty')
      .eq('status', 'ACTIVE');

    if (!items) return { updated: 0 };

    let updated = 0;
    for (const item of items) {
      const avgDaily = (item.consumption_avg_monthly || 0) / 30;
      const safetyStock = avgDaily * 1.5; // 1.5 dias de segurança
      const reorderPoint = (avgDaily * (item.lead_time_days || 7)) + safetyStock;
      const reorderQty = Math.max((item.consumption_avg_monthly || 0) * 2, item.min_qty || 0);

      if (reorderPoint > 0) {
        await supabase
          .from('stock_items')
          .update({ reorder_point: Math.ceil(reorderPoint * 100) / 100, reorder_qty: Math.ceil(reorderQty) })
          .eq('id', item.id);
        updated++;
      }
    }

    return { updated };
  }

  async getConsumptionForecast(item_id: string): Promise<{ month: string; actual: number; predicted: number }[]> {
    // Buscar últimos 12 meses de saídas
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: movements } = await supabase
      .from('stock_movements')
      .select('quantity, created_at')
      .eq('item_id', item_id)
      .eq('direction', -1)
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at');

    // Agrupar por mês
    const monthly: Record<string, number> = {};
    for (const m of movements || []) {
      const month = new Date(m.created_at).toISOString().substring(0, 7);
      monthly[month] = (monthly[month] || 0) + (m.quantity || 0);
    }

    // Gerar histórico + previsão (média móvel 3 meses)
    const months = Object.keys(monthly).sort();
    const result: { month: string; actual: number; predicted: number }[] = [];

    for (let i = 0; i < months.length; i++) {
      const actual = monthly[months[i]];
      const prev3 = months.slice(Math.max(0, i - 2), i + 1).map(m => monthly[m]);
      const predicted = prev3.reduce((a, b) => a + b, 0) / prev3.length;
      result.push({ month: months[i], actual, predicted: Math.round(predicted * 100) / 100 });
    }

    // Projetar próximos 3 meses
    const last3 = Object.values(monthly).slice(-3);
    const avgLast3 = last3.length > 0 ? last3.reduce((a, b) => a + b, 0) / last3.length : 0;

    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);
      result.push({
        month: futureDate.toISOString().substring(0, 7),
        actual: 0,
        predicted: Math.round(avgLast3 * 100) / 100,
      });
    }

    return result;
  }

  async getReorderSuggestions(): Promise<StockItem[]> {
    // stock_status is a GENERATED column; filter on concrete columns for reliability
    const { data, error } = await supabase
      .from('stock_items')
      .select(`
        *,
        category:stock_categories(id, code, name),
        brand:stock_brands(id, name)
      `)
      .eq('status', 'ACTIVE')
      .lte('current_qty', 0) // start with worst case
      .order('current_qty');

    if (error) throw error;

    // Also grab items below minimum (CRITICAL)
    const { data: critItems } = await supabase
      .from('stock_items')
      .select(`
        *,
        category:stock_categories(id, code, name),
        brand:stock_brands(id, name)
      `)
      .eq('status', 'ACTIVE')
      .gt('current_qty', 0);

    // Filter client-side: items where current_qty <= min_qty
    const belowMin = (critItems || []).filter(i => (i.current_qty || 0) <= (i.min_qty || 0) && (i.min_qty || 0) > 0);

    // Merge and deduplicate
    const allItems = [...(data || []), ...belowMin];
    const seen = new Set<string>();
    const unique = allItems.filter(i => {
      if (seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    });

    return unique.sort((a, b) => (a.current_qty || 0) - (b.current_qty || 0)) as unknown as StockItem[];
  }

  // ============================================================
  // FORNECEDORES (do entities)
  // ============================================================

  async listarFornecedores(): Promise<{ id: string; name: string; document?: string }[]> {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('id, name, document')
        .eq('is_supplier', true)
        .order('name');

      if (error) {
        console.warn('Tabela entities não disponível:', error.message);
        return [];
      }
      return data || [];
    } catch {
      return [];
    }
  }

  // ============================================================
  // ATIVOS (para integração manutenção)
  // ============================================================

  async listarAtivos(): Promise<{ id: string; name: string; code: string }[]> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('id, name, code')
        .order('name');

      if (error) {
        console.warn('Tabela assets não disponível:', error.message);
        return [];
      }
      return data || [];
    } catch {
      return [];
    }
  }

  // ============================================================
  // CONSUMO POR EQUIPAMENTO
  // ============================================================

  async getConsumoPorEquipamento(asset_id: string): Promise<{
    items: { code: string; description: string; quantity: number; total_cost: number }[];
    total_cost: number;
  }> {
    const { data } = await supabase
      .from('stock_movements')
      .select(`
        quantity, total_cost,
        item:stock_items!item_id(code, description)
      `)
      .eq('asset_id', asset_id)
      .eq('direction', -1);

    if (!data) return { items: [], total_cost: 0 };

    const grouped: Record<string, { code: string; description: string; quantity: number; total_cost: number }> = {};
    let totalCost = 0;

    for (const m of data) {
      const item = m.item as any;
      const key = item?.code || 'N/A';
      if (!grouped[key]) {
        grouped[key] = { code: key, description: item?.description || '', quantity: 0, total_cost: 0 };
      }
      grouped[key].quantity += m.quantity || 0;
      grouped[key].total_cost += m.total_cost || 0;
      totalCost += m.total_cost || 0;
    }

    return {
      items: Object.values(grouped).sort((a, b) => b.total_cost - a.total_cost),
      total_cost: totalCost,
    };
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private async gerarNumero(prefix: string): Promise<string> {
    const ano = new Date().getFullYear();
    const table = prefix === 'RC' ? 'purchase_requisitions' : 'purchase_orders';

    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .like('number', `${prefix}-${ano}%`);

    const numero = (count || 0) + 1;
    return `${prefix}-${ano}-${String(numero).padStart(5, '0')}`;
  }
}

export const stockService = new StockService();
export default stockService;
