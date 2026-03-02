import { supabase } from './supabase';

let cachedKey: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export async function getGeminiKey(): Promise<string> {
  const now = Date.now();
  if (cachedKey && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedKey;
  }

  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'gemini_api_key')
    .single();

  cachedKey = data?.value || import.meta.env.VITE_GEMINI_API_KEY || '';
  cacheTimestamp = now;
  return cachedKey;
}
