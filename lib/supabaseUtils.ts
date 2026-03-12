import { supabase } from './supabase';

/**
 * Fetch all rows from a Supabase table, paginating automatically.
 * Supabase default limit is 1000 rows. This function fetches in batches.
 */
export async function fetchAll<T = any>(
  table: string,
  options?: {
    select?: string;
    order?: { column: string; ascending?: boolean };
    filters?: (query: any) => any;
    pageSize?: number;
  }
): Promise<T[]> {
  const PAGE_SIZE = options?.pageSize || 1000;
  const allData: T[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase.from(table).select(options?.select || '*');

    if (options?.filters) {
      query = options.filters(query);
    }

    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
    }

    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, error } = await query;

    if (error) {
      console.error(`fetchAll(${table}) error:`, error);
      break;
    }

    if (data && data.length > 0) {
      allData.push(...(data as T[]));
      from += PAGE_SIZE;
      hasMore = data.length === PAGE_SIZE;
    } else {
      hasMore = false;
    }
  }

  return allData;
}
