import { supabase } from './supabase';

const cache: Record<string, { value: string; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export async function getSettingValue(key: string): Promise<string> {
  const now = Date.now();
  const cached = cache[key];
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.value;
  }

  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .single();

  const value = data?.value || '';
  cache[key] = { value, timestamp: now };
  return value;
}

export async function getGeminiKey(): Promise<string> {
  const dbKey = await getSettingValue('gemini_api_key');
  return dbKey || import.meta.env.VITE_GEMINI_API_KEY || '';
}
