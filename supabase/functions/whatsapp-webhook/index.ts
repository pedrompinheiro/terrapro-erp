/**
 * TERRAPRO ERP - WhatsApp Webhook Edge Function
 *
 * Recebe webhooks da Evolution API (mensagens, grupos, status de conexao).
 * Grava mensagens no Supabase e analisa com Gemini AI para detectar
 * intencao, urgencia, equipamento mencionado e acao sugerida.
 *
 * Deploy: supabase functions deploy whatsapp-webhook --no-verify-jwt
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ---------------------------------------------------------------------------
// SUPABASE CLIENT
// ---------------------------------------------------------------------------
function getSupabase() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

// ---------------------------------------------------------------------------
// GEMINI AI ANALYSIS
// ---------------------------------------------------------------------------
async function analyzeWithGemini(content: string, geminiKey: string) {
  const prompt = `Voce e um assistente de uma empresa de terraplenagem e transporte pesado (Transportadora Terra LTDA, Dourados/MS).
A empresa opera escavadeiras, pas carregadeiras, tratores, caminhoes, patrolas e outros equipamentos pesados.
Codigos de equipamento: ME=Escavadeira, MC=Pa Carregadeira, RT=Trator, CM=Caminhao, PT=Patrola.

Analise a seguinte mensagem de WhatsApp e retorne APENAS um JSON valido (sem markdown):
{
  "intent": "MAINTENANCE_REQUEST|FUEL_REQUEST|PARTS_REQUEST|LOGISTICS|FINANCIAL|GENERAL",
  "asset": "nome ou codigo do equipamento mencionado, ou null se nenhum",
  "urgency": "LOW|MEDIUM|HIGH",
  "action": "acao sugerida em portugues curto, ex: Abrir OS corretiva para escavadeira 04"
}

Regras:
- MAINTENANCE_REQUEST: problemas mecanicos, vazamentos, quebras, revisoes
- FUEL_REQUEST: abastecimento, diesel, combustivel
- PARTS_REQUEST: pecas, filtros, oleos, pneus
- LOGISTICS: transporte, carga, descarga, localizacao, trajeto
- FINANCIAL: pagamento, boleto, nota fiscal, cobranca
- GENERAL: saudacoes, conversas gerais, assuntos nao classificaveis
- Urgencia HIGH: palavras como urgente, parou, quebrou, vazando, emergencia
- Urgencia MEDIUM: problemas que precisam atencao mas nao sao emergencia
- Urgencia LOW: informacoes gerais, perguntas, saudacoes

Mensagem: "${content.replace(/"/g, '\\"').substring(0, 500)}"

Retorne SOMENTE o JSON.`

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 }
        })
      }
    )

    if (!resp.ok) {
      console.error('Gemini API error:', resp.status, await resp.text())
      return null
    }

    const data = await resp.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Extrai JSON da resposta (pode vir com ```json ... ```)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])
    return {
      ai_intent: parsed.intent || 'GENERAL',
      ai_asset: parsed.asset || null,
      ai_urgency: parsed.urgency || 'LOW',
      ai_action: parsed.action || null
    }
  } catch (err) {
    console.error('Gemini analysis failed:', err)
    return null
  }
}

// ---------------------------------------------------------------------------
// EXTRACT MESSAGE TEXT from various Evolution API message formats
// ---------------------------------------------------------------------------
function extractMessageText(message: any): string | null {
  if (!message) return null
  // Texto simples
  if (message.conversation) return message.conversation
  // Texto estendido (com citacao, link preview, etc)
  if (message.extendedTextMessage?.text) return message.extendedTextMessage.text
  // Caption de imagem/video/documento
  if (message.imageMessage?.caption) return message.imageMessage.caption
  if (message.videoMessage?.caption) return message.videoMessage.caption
  if (message.documentMessage?.caption) return message.documentMessage.caption
  // Documento sem caption - retorna nome do arquivo
  if (message.documentMessage?.fileName) return `[Arquivo: ${message.documentMessage.fileName}]`
  // Sticker, audio, etc
  if (message.stickerMessage) return '[Sticker]'
  if (message.audioMessage) return '[Audio]'
  if (message.contactMessage) return `[Contato: ${message.contactMessage.displayName || ''}]`
  if (message.locationMessage) return `[Localizacao: ${message.locationMessage.degreesLatitude},${message.locationMessage.degreesLongitude}]`
  return null
}

// ---------------------------------------------------------------------------
// HANDLE INCOMING MESSAGE
// ---------------------------------------------------------------------------
async function handleMessage(payload: any, supabase: any, geminiKey: string | null) {
  const data = payload.data
  if (!data) return

  const key = data.key
  if (!key) return

  // Ignora mensagens proprias
  if (key.fromMe) return

  const remoteJid = key.remoteJid || ''
  const isGroup = remoteJid.endsWith('@g.us')
  const senderPhone = isGroup ? (key.participant || '') : remoteJid
  const senderName = data.pushName || 'Desconhecido'
  const content = extractMessageText(data.message)

  if (!content) return // Ignora mensagens sem texto extraivel

  // Determinar tipo da mensagem
  let messageType = 'text'
  if (data.message?.imageMessage) messageType = 'image'
  else if (data.message?.audioMessage) messageType = 'audio'
  else if (data.message?.documentMessage) messageType = 'document'
  else if (data.message?.videoMessage) messageType = 'video'
  else if (data.message?.stickerMessage) messageType = 'sticker'

  // Upsert grupo se for mensagem de grupo
  let groupId = null
  if (isGroup) {
    const groupName = data.pushName ? `Grupo ${remoteJid.split('@')[0]}` : remoteJid
    const { data: groupData } = await supabase
      .from('whatsapp_groups')
      .upsert(
        { jid: remoteJid, name: groupName, is_active: true },
        { onConflict: 'jid' }
      )
      .select('id')
      .single()
    groupId = groupData?.id || null
  }

  // Inserir mensagem
  const { data: msgData, error: msgError } = await supabase
    .from('whatsapp_messages')
    .insert({
      group_id: groupId,
      sender_name: senderName,
      sender_phone: senderPhone.replace('@s.whatsapp.net', '').replace('@g.us', ''),
      content: content,
      message_type: messageType,
      remote_jid: remoteJid,
      received_at: new Date().toISOString(),
      status: 'PENDING'
    })
    .select('id')
    .single()

  if (msgError) {
    console.error('Erro ao inserir mensagem:', msgError)
    return
  }

  // Analise com Gemini (nao bloqueia resposta ao webhook)
  if (geminiKey && msgData?.id && messageType === 'text') {
    const aiResult = await analyzeWithGemini(content, geminiKey)
    if (aiResult) {
      await supabase
        .from('whatsapp_messages')
        .update(aiResult)
        .eq('id', msgData.id)
    }
  }
}

// ---------------------------------------------------------------------------
// HANDLE GROUP UPDATE
// ---------------------------------------------------------------------------
async function handleGroupUpdate(payload: any, supabase: any) {
  const data = payload.data
  if (!data) return

  const jid = data.id || data.jid
  const name = data.subject || data.name
  const membersCount = data.participants?.length || data.size || 0

  if (jid) {
    await supabase
      .from('whatsapp_groups')
      .upsert(
        { jid, name: name || jid, members_count: membersCount, is_active: true },
        { onConflict: 'jid' }
      )
  }
}

// ---------------------------------------------------------------------------
// MAIN HANDLER
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const event = payload.event || ''
    const instance = payload.instance || ''

    console.log(`[webhook] event=${event} instance=${instance}`)

    const supabase = getSupabase()

    // Buscar chave Gemini da tabela system_settings
    let geminiKey: string | null = null
    const { data: settingData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'gemini_api_key')
      .single()
    geminiKey = settingData?.value || null

    // Rotear por tipo de evento
    switch (event) {
      case 'messages.upsert':
        await handleMessage(payload, supabase, geminiKey)
        break

      case 'groups.upsert':
      case 'groups.update':
        await handleGroupUpdate(payload, supabase)
        break

      case 'connection.update':
        console.log(`[webhook] Connection update: ${JSON.stringify(payload.data)}`)
        break

      default:
        console.log(`[webhook] Evento ignorado: ${event}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[webhook] Erro:', err)
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
