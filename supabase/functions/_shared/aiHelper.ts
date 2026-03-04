/**
 * AI Helper - Multi-Provider para Edge Functions (Deno)
 *
 * Le provider e API keys da tabela system_settings.
 * Suporta: OpenAI (GPT), Google Gemini, Groq (Llama).
 */

type AIProvider = 'openai' | 'gemini' | 'groq'

interface AIConfig {
  provider: AIProvider
  apiKey: string
  model: string
}

const PROVIDER_MODELS: Record<AIProvider, { model: string; visionModel?: string }> = {
  openai: { model: 'gpt-4o-mini' },
  gemini: { model: 'gemini-2.5-flash' },
  groq: { model: 'llama-3.3-70b-versatile', visionModel: 'llama-3.2-90b-vision-preview' },
}

/**
 * Le config de IA da tabela system_settings
 */
export async function getAIConfig(supabase: any): Promise<AIConfig | null> {
  // Buscar provider ativo
  const { data: providerSetting } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'ai_provider')
    .single()

  const provider = (providerSetting?.value || 'gemini') as AIProvider

  // Buscar API key do provider
  const keyMap: Record<AIProvider, string> = {
    openai: 'openai_api_key',
    gemini: 'gemini_api_key',
    groq: 'groq_api_key',
  }

  const { data: keySetting } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', keyMap[provider])
    .single()

  const apiKey = keySetting?.value
  if (!apiKey) {
    console.error(`[aiHelper] API key nao encontrada para provider: ${provider} (key: ${keyMap[provider]})`)
    return null
  }

  return {
    provider,
    apiKey,
    model: PROVIDER_MODELS[provider].model,
  }
}

/**
 * Gera texto com o provider configurado
 */
export async function analyzeText(supabase: any, prompt: string): Promise<string | null> {
  const config = await getAIConfig(supabase)
  if (!config) return null

  try {
    if (config.provider === 'gemini') {
      return await callGemini(config, prompt)
    }
    return await callOpenAICompatible(config, prompt)
  } catch (err) {
    console.error(`[aiHelper] ${config.provider} error:`, err)
    return null
  }
}

/**
 * Gera texto com imagem (vision/OCR) com o provider configurado
 */
export async function analyzeWithImage(
  supabase: any,
  prompt: string,
  imageBase64: string,
  mimeType: string
): Promise<string | null> {
  const config = await getAIConfig(supabase)
  if (!config) return null

  try {
    if (config.provider === 'gemini') {
      return await callGeminiWithImage(config, prompt, imageBase64, mimeType)
    }
    return await callOpenAICompatibleWithImage(config, prompt, imageBase64, mimeType)
  } catch (err) {
    console.error(`[aiHelper] ${config.provider} vision error:`, err)
    return null
  }
}

// =============================================================================
// Implementacoes internas
// =============================================================================

async function callGemini(config: AIConfig, prompt: string): Promise<string> {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 },
      }),
    }
  )

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Gemini ${resp.status}: ${err}`)
  }

  const data = await resp.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

async function callGeminiWithImage(
  config: AIConfig, prompt: string, imageBase64: string, mimeType: string
): Promise<string> {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
          ],
        }],
        generationConfig: { temperature: 0.1 },
      }),
    }
  )

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Gemini Vision ${resp.status}: ${err}`)
  }

  const data = await resp.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

async function callOpenAICompatible(config: AIConfig, prompt: string): Promise<string> {
  const baseUrl = config.provider === 'groq'
    ? 'https://api.groq.com/openai/v1'
    : 'https://api.openai.com/v1'

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`${config.provider} ${resp.status}: ${err}`)
  }

  const data = await resp.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callOpenAICompatibleWithImage(
  config: AIConfig, prompt: string, imageBase64: string, mimeType: string
): Promise<string> {
  const baseUrl = config.provider === 'groq'
    ? 'https://api.groq.com/openai/v1'
    : 'https://api.openai.com/v1'

  const model = config.provider === 'groq'
    ? (PROVIDER_MODELS.groq.visionModel || config.model)
    : config.model

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        ],
      }],
      temperature: 0.1,
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`${config.provider} Vision ${resp.status}: ${err}`)
  }

  const data = await resp.json()
  return data.choices?.[0]?.message?.content || ''
}
