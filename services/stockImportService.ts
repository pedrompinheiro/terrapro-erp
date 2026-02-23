/**
 * Serviço de Importação de Estoque
 * Importa dados de CSV/Excel com mapeamento automático do OS Oficina 7.2
 */

import { supabase } from '../lib/supabase';
import type { StockCategory, StockBrand } from '../types';

export interface ImportResult {
  imported: number;
  updated: number;
  errors: number;
  duplicates: number;
  errorDetails: string[];
}

export interface ColumnMapping {
  code: string;
  description: string;
  reference?: string;
  barcode?: string;
  category?: string;
  brand?: string;
  unit?: string;
  current_qty?: string;
  min_qty?: string;
  cost_price?: string;
  sale_price?: string;
  location_code?: string;
}

// Mapeamento padrão do OS Oficina 7.2
export const OS_OFICINA_MAPPING: ColumnMapping = {
  code: 'CODIGO',
  description: 'DESCRICAO',
  reference: 'REFERENCIA',
  barcode: 'BARRA',
  category: 'CATEGORIA',
  brand: 'MARCA',
  unit: 'UNIDADE',
  current_qty: 'QUANT_ATUA',
  min_qty: 'QUANT_MINI',
  cost_price: 'P_CUSTO',
  sale_price: 'P_VENDA',
  location_code: 'LOCALIZA',
};

class StockImportService {

  /**
   * Detectar automaticamente o mapeamento de colunas
   */
  detectMapping(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = { code: '', description: '' };
    const headerUpper = headers.map(h => h.toUpperCase().trim());

    // Mapeamentos conhecidos
    const maps: Record<keyof ColumnMapping, string[]> = {
      code: ['CODIGO', 'COD', 'CODE', 'SKU', 'CÓDIGO', 'ID'],
      description: ['DESCRICAO', 'DESCRIÇÃO', 'DESC', 'DESCRIPTION', 'NOME', 'NAME', 'PRODUTO', 'ITEM'],
      reference: ['REFERENCIA', 'REFERÊNCIA', 'REF', 'REFERENCE', 'PART_NUMBER', 'PARTNUMBER'],
      barcode: ['BARRA', 'BARCODE', 'EAN', 'CODIGO_BARRAS', 'COD_BARRA'],
      category: ['CATEGORIA', 'CATEGORY', 'GRUPO', 'GROUP', 'TIPO'],
      brand: ['MARCA', 'BRAND', 'FABRICANTE', 'MANUFACTURER'],
      unit: ['UNIDADE', 'UNIT', 'UN', 'UND', 'MEDIDA'],
      current_qty: ['QUANT_ATUA', 'QTD', 'QUANTIDADE', 'QUANTITY', 'ESTOQUE', 'STOCK', 'QTD_ATUAL'],
      min_qty: ['QUANT_MINI', 'QTD_MIN', 'MINIMO', 'MIN_QTY', 'ESTOQUE_MIN'],
      cost_price: ['P_CUSTO', 'CUSTO', 'COST', 'PRECO_CUSTO', 'COST_PRICE', 'VALOR_CUSTO'],
      sale_price: ['P_VENDA', 'VENDA', 'PRICE', 'PRECO_VENDA', 'SALE_PRICE', 'VALOR_VENDA'],
      location_code: ['LOCALIZA', 'LOCAL', 'LOCATION', 'LOCALIZACAO', 'LOCALIZAÇÃO', 'POSICAO'],
    };

    for (const [field, aliases] of Object.entries(maps)) {
      const found = headerUpper.findIndex(h => aliases.includes(h));
      if (found !== -1) {
        (mapping as any)[field] = headers[found];
      }
    }

    return mapping;
  }

  /**
   * Importar dados usando mapeamento
   */
  async importData(
    rows: Record<string, any>[],
    mapping: ColumnMapping,
    options?: { updateExisting?: boolean }
  ): Promise<ImportResult> {
    const result: ImportResult = {
      imported: 0,
      updated: 0,
      errors: 0,
      duplicates: 0,
      errorDetails: [],
    };

    if (!mapping.code || !mapping.description) {
      result.errorDetails.push('Mapeamento obrigatório: código e descrição');
      return result;
    }

    // Cache de categorias e marcas
    const categoriesCache = await this.loadCategoriesCache();
    const brandsCache = await this.loadBrandsCache();

    // Processar em lotes de 50
    const batchSize = 50;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const itemsToInsert: any[] = [];
      const itemsToUpdate: { id: string; data: any }[] = [];

      for (const row of batch) {
        try {
          const code = String(row[mapping.code] || '').trim();
          const description = String(row[mapping.description] || '').trim();

          if (!code || !description) {
            result.errors++;
            result.errorDetails.push(`Linha ignorada: código ou descrição vazio`);
            continue;
          }

          // Resolver categoria
          let categoryId: string | null = null;
          if (mapping.category && row[mapping.category]) {
            const catName = String(row[mapping.category]).trim().toUpperCase();
            categoryId = categoriesCache.get(catName) || null;

            if (!categoryId && catName) {
              // Criar categoria nova
              const { data: newCat } = await supabase
                .from('stock_categories')
                .insert({ code: catName.replace(/\s+/g, '_'), name: catName })
                .select('id')
                .single();

              if (newCat) {
                categoryId = newCat.id;
                categoriesCache.set(catName, newCat.id);
              }
            }
          }

          // Resolver marca
          let brandId: string | null = null;
          if (mapping.brand && row[mapping.brand]) {
            const brandName = String(row[mapping.brand]).trim().toUpperCase();
            brandId = brandsCache.get(brandName) || null;

            if (!brandId && brandName) {
              const { data: newBrand } = await supabase
                .from('stock_brands')
                .insert({ name: brandName })
                .select('id')
                .single();

              if (newBrand) {
                brandId = newBrand.id;
                brandsCache.set(brandName, newBrand.id);
              }
            }
          }

          const itemData: any = {
            code,
            description,
            reference: mapping.reference ? String(row[mapping.reference] || '').trim() || null : null,
            barcode: mapping.barcode ? String(row[mapping.barcode] || '').trim() || null : null,
            category_id: categoryId,
            brand_id: brandId,
            unit: mapping.unit ? String(row[mapping.unit] || 'UNI').trim() : 'UNI',
            current_qty: mapping.current_qty ? parseFloat(row[mapping.current_qty]) || 0 : 0,
            min_qty: mapping.min_qty ? parseFloat(row[mapping.min_qty]) || 0 : 0,
            cost_price: mapping.cost_price ? parseFloat(row[mapping.cost_price]) || 0 : 0,
            sale_price: mapping.sale_price ? parseFloat(row[mapping.sale_price]) || 0 : 0,
            location_code: mapping.location_code ? String(row[mapping.location_code] || '').trim() || null : null,
            avg_cost: mapping.cost_price ? parseFloat(row[mapping.cost_price]) || 0 : 0,
          };

          // Verificar se já existe
          const { data: existing } = await supabase
            .from('stock_items')
            .select('id')
            .eq('code', code)
            .single();

          if (existing) {
            if (options?.updateExisting) {
              itemsToUpdate.push({ id: existing.id, data: itemData });
            } else {
              result.duplicates++;
            }
          } else {
            itemsToInsert.push(itemData);
          }
        } catch (err: any) {
          result.errors++;
          result.errorDetails.push(`Erro: ${err.message}`);
        }
      }

      // Inserir novos em batch
      if (itemsToInsert.length > 0) {
        const { error } = await supabase
          .from('stock_items')
          .insert(itemsToInsert);

        if (error) {
          result.errors += itemsToInsert.length;
          result.errorDetails.push(`Erro no batch insert: ${error.message}`);
        } else {
          result.imported += itemsToInsert.length;
        }
      }

      // Atualizar existentes
      for (const upd of itemsToUpdate) {
        const { error } = await supabase
          .from('stock_items')
          .update(upd.data)
          .eq('id', upd.id);

        if (error) {
          result.errors++;
          result.errorDetails.push(`Erro ao atualizar ${upd.data.code}: ${error.message}`);
        } else {
          result.updated++;
        }
      }
    }

    return result;
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private async loadCategoriesCache(): Promise<Map<string, string>> {
    const cache = new Map<string, string>();
    const { data } = await supabase
      .from('stock_categories')
      .select('id, code, name');

    for (const cat of data || []) {
      cache.set(cat.code.toUpperCase(), cat.id);
      cache.set(cat.name.toUpperCase(), cat.id);
    }

    return cache;
  }

  private async loadBrandsCache(): Promise<Map<string, string>> {
    const cache = new Map<string, string>();
    const { data } = await supabase
      .from('stock_brands')
      .select('id, name');

    for (const brand of data || []) {
      cache.set(brand.name.toUpperCase(), brand.id);
    }

    return cache;
  }
}

export const stockImportService = new StockImportService();
export default stockImportService;
