/**
 * TERRAPRO ERP - WhatsApp Send Message Edge Function
 *
 * Envia mensagens no WhatsApp via Evolution API.
 * Usado pelo painel para enviar respostas aprovadas.
 *
 * Deploy: supabase functions deploy whatsapp-send --no-verify-jwt
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { remoteJid, text } = await req.json()

    if (!remoteJid || !text) {
      return new Response(
        JSON.stringify({ error: 'remoteJid e text são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar config da Evolution API
    const keys = ['evolution_api_url', 'evolution_api_key', 'evolution_instance_name']
    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', keys)

    const config: Record<string, string> = {}
    for (const row of (settings || [])) {
      config[row.key] = row.value
    }

    const evoUrl = config.evolution_api_url
    const evoKey = config.evolution_api_key
    const instance = config.evolution_instance_name

    if (!evoUrl || !instance) {
      return new Response(
        JSON.stringify({ error: 'Evolution API não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enviar mensagem via Evolution API
    const resp = await fetch(`${evoUrl}/message/sendText/${instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evoKey || '',
      },
      body: JSON.stringify({
        number: remoteJid,
        text: text,
      }),
    })

    if (!resp.ok) {
      const err = await resp.text()
      console.error(`[whatsapp-send] Erro ${resp.status}: ${err}`)
      return new Response(
        JSON.stringify({ error: `Evolution API error: ${resp.status}`, details: err }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await resp.json()
    console.log(`[whatsapp-send] Mensagem enviada para ${remoteJid}`)

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[whatsapp-send] Erro:', err)
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
