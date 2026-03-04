// =============================================================================
// AI Service - Multi-Provider (OpenAI / Gemini / Groq)
// Busca chaves da tabela system_settings (Supabase) com fallback pro .env.local
// =============================================================================

import { getSettingValue } from './getGeminiKey';

export type AIProvider = 'openai' | 'gemini' | 'groq';

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
}

const PROVIDER_DEFAULTS: Record<AIProvider, { model: string; baseUrl: string; envKey: string; dbKey: string }> = {
  openai: {
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
    envKey: 'VITE_OPENAI_API_KEY',
    dbKey: 'openai_api_key',
  },
  gemini: {
    model: 'gemini-2.5-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    envKey: 'VITE_GEMINI_API_KEY',
    dbKey: 'gemini_api_key',
  },
  groq: {
    model: 'llama-3.3-70b-versatile',
    baseUrl: 'https://api.groq.com/openai/v1',
    envKey: 'VITE_GROQ_API_KEY',
    dbKey: 'groq_api_key',
  },
};

/**
 * Detecta provider ativo e retorna config
 * Prioridade: VITE_AI_PROVIDER env var > primeira key disponivel (DB > env)
 */
export async function getConfig(): Promise<AIConfig> {
  const envProvider = (import.meta.env.VITE_AI_PROVIDER || '').toLowerCase() as AIProvider;

  // Se tem provider explicito, usa ele
  if (envProvider && PROVIDER_DEFAULTS[envProvider]) {
    const def = PROVIDER_DEFAULTS[envProvider];
    const dbKey = await getSettingValue(def.dbKey);
    const apiKey = dbKey || import.meta.env[def.envKey] || '';
    return { provider: envProvider, apiKey, model: def.model, baseUrl: def.baseUrl };
  }

  // Fallback: primeira key que existir (DB primeiro, depois env)
  for (const [prov, def] of Object.entries(PROVIDER_DEFAULTS)) {
    const dbKey = await getSettingValue(def.dbKey);
    const envKey = import.meta.env[def.envKey];
    const key = dbKey || envKey;
    if (key) {
      return { provider: prov as AIProvider, apiKey: key, model: def.model, baseUrl: def.baseUrl };
    }
  }

  // Nenhuma key configurada
  return { provider: 'gemini', apiKey: '', model: 'gemini-2.5-flash', baseUrl: '' };
}

/**
 * Gera texto com o provider ativo (sem imagem)
 */
export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const config = await getConfig();
  if (!config.apiKey) throw new Error(`API key não configurada para ${config.provider}. Configure em Configurações > Integrações & API.`);

  if (config.provider === 'gemini') {
    return callGemini(config, prompt, systemInstruction);
  }
  // OpenAI e Groq usam o mesmo formato (OpenAI-compatible)
  return callOpenAICompatible(config, prompt, systemInstruction);
}

/**
 * Gera texto com imagem (vision/OCR) com o provider ativo
 */
export async function generateWithImage(
  prompt: string,
  imageBase64: string,
  mimeType: string,
  systemInstruction?: string
): Promise<string> {
  const config = await getConfig();
  if (!config.apiKey) throw new Error(`API key não configurada para ${config.provider}. Configure em Configurações > Integrações & API.`);

  if (config.provider === 'gemini') {
    return callGeminiWithImage(config, prompt, imageBase64, mimeType, systemInstruction);
  }
  // OpenAI e Groq vision
  return callOpenAICompatibleWithImage(config, prompt, imageBase64, mimeType, systemInstruction);
}

/** Retorna nome amigavel do provider ativo */
export async function getProviderLabel(): Promise<string> {
  const config = await getConfig();
  const labels: Record<AIProvider, string> = {
    openai: `OpenAI (${config.model})`,
    gemini: `Google Gemini (${config.model})`,
    groq: `Groq (${config.model})`,
  };
  return labels[config.provider];
}

// =============================================================================
// Implementações internas
// =============================================================================

async function callGemini(config: AIConfig, prompt: string, systemInstruction?: string): Promise<string> {
  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2 },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const resp = await fetch(
    `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Gemini API error ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callGeminiWithImage(
  config: AIConfig, prompt: string, imageBase64: string, mimeType: string, systemInstruction?: string
): Promise<string> {
  const body: any = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: imageBase64 } },
      ]
    }],
    generationConfig: { temperature: 0.1 },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const resp = await fetch(
    `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Gemini Vision error ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callOpenAICompatible(config: AIConfig, prompt: string, systemInstruction?: string): Promise<string> {
  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const resp = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.2,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`${config.provider} API error ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callOpenAICompatibleWithImage(
  config: AIConfig, prompt: string, imageBase64: string, mimeType: string, systemInstruction?: string
): Promise<string> {
  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  // Groq vision usa llama-3.2-90b-vision-preview
  const model = config.provider === 'groq' ? 'llama-3.2-90b-vision-preview' : config.model;

  messages.push({
    role: 'user',
    content: [
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
    ],
  });

  const resp = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.1 }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`${config.provider} Vision error ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}
