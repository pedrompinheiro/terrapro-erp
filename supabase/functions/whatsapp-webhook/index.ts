/**
 * TERRAPRO ERP - WhatsApp Webhook Edge Function
 *
 * Recebe webhooks da Evolution API (mensagens, grupos, status de conexao).
 * Grava mensagens no Supabase, analisa com IA (multi-provider) para detectar
 * intencao, urgencia, equipamento mencionado e acao sugerida.
 * Responde automaticamente no WhatsApp e executa acoes no sistema.
 *
 * Deploy: supabase functions deploy whatsapp-webhook --no-verify-jwt
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { analyzeText } from '../_shared/aiHelper.ts'

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
// EVOLUTION API - Enviar mensagem de resposta no WhatsApp
// ---------------------------------------------------------------------------
async function getEvolutionConfig(supabase: any) {
  const keys = ['evolution_api_url', 'evolution_api_key', 'evolution_instance_name']
  const { data } = await supabase
    .from('system_settings')
    .select('key, value')
    .in('key', keys)

  const config: Record<string, string> = {}
  for (const row of (data || [])) {
    config[row.key] = row.value
  }

  return {
    url: config.evolution_api_url || '',
    apiKey: config.evolution_api_key || '',
    instance: config.evolution_instance_name || '',
  }
}

async function sendWhatsAppMessage(supabase: any, remoteJid: string, text: string) {
  try {
    const evo = await getEvolutionConfig(supabase)
    if (!evo.url || !evo.instance) {
      console.error('[sendWhatsApp] Evolution API nao configurada')
      return false
    }

    const resp = await fetch(`${evo.url}/message/sendText/${evo.instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evo.apiKey,
      },
      body: JSON.stringify({
        number: remoteJid,
        text: text,
      }),
    })

    if (!resp.ok) {
      const err = await resp.text()
      console.error(`[sendWhatsApp] Erro ${resp.status}: ${err}`)
      return false
    }

    console.log(`[sendWhatsApp] Mensagem enviada para ${remoteJid}`)
    return true
  } catch (err) {
    console.error('[sendWhatsApp] Erro:', err)
    return false
  }
}

// ---------------------------------------------------------------------------
// AI ANALYSIS (multi-provider via aiHelper)
// ---------------------------------------------------------------------------
async function analyzeMessage(content: string, supabase: any) {
  const prompt = `Voce e um assistente de uma empresa de terraplenagem e transporte pesado (Transportadora Terra LTDA, Dourados/MS).
A empresa opera escavadeiras, pas carregadeiras, tratores, caminhoes, patrolas e outros equipamentos pesados.
Codigos de equipamento: ME=Escavadeira, MC=Pa Carregadeira, RT=Trator, CM=Caminhao, PT=Patrola.

Analise a seguinte mensagem de WhatsApp e retorne APENAS um JSON valido (sem markdown):
{
  "intent": "MAINTENANCE_REQUEST|FUEL_REQUEST|PARTS_REQUEST|LOGISTICS|FINANCIAL|GENERAL",
  "asset": "nome ou codigo do equipamento mencionado, ou null se nenhum",
  "urgency": "LOW|MEDIUM|HIGH",
  "action": "acao sugerida em portugues curto, ex: Abrir OS corretiva para escavadeira 04",
  "response": "resposta curta e profissional para enviar no WhatsApp confirmando o recebimento e a acao que sera tomada. Use no maximo 2 frases. Se for GENERAL, responda normalmente."
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
- Na resposta, seja breve e profissional. Confirme o recebimento e a acao.
- Para GENERAL com urgencia LOW, NAO gere resposta (response = null)

Mensagem: "${content.replace(/"/g, '\\"').substring(0, 500)}"

Retorne SOMENTE o JSON.`

  try {
    const text = await analyzeText(supabase, prompt)
    if (!text) return null

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])
    return {
      ai_intent: parsed.intent || 'GENERAL',
      ai_asset: parsed.asset || null,
      ai_urgency: parsed.urgency || 'LOW',
      ai_action: parsed.action || null,
      ai_response: parsed.response || null,
    }
  } catch (err) {
    console.error('AI analysis failed:', err)
    return null
  }
}

// ---------------------------------------------------------------------------
// EXECUTE SYSTEM ACTION based on AI intent
// ---------------------------------------------------------------------------
async function executeAction(
  aiResult: any,
  messageId: string,
  senderName: string,
  content: string,
  supabase: any
) {
  const { ai_intent, ai_asset, ai_urgency } = aiResult

  try {
    switch (ai_intent) {
      case 'MAINTENANCE_REQUEST': {
        // Buscar equipamento pelo codigo
        let equipmentId = null
        let equipmentName = ai_asset

        if (ai_asset) {
          const { data: equip } = await supabase
            .from('equipment')
            .select('id, asset_id, name')
            .or(`asset_id.ilike.%${ai_asset}%,name.ilike.%${ai_asset}%`)
            .limit(1)
            .single()

          if (equip) {
            equipmentId = equip.id
            equipmentName = `${equip.asset_id} - ${equip.name}`
          }
        }

        // Criar OS corretiva
        const { data: os, error: osError } = await supabase
          .from('service_orders')
          .insert({
            equipment_id: equipmentId,
            type: 'CORRETIVA',
            priority: ai_urgency === 'HIGH' ? 'URGENTE' : ai_urgency === 'MEDIUM' ? 'ALTA' : 'NORMAL',
            status: 'ABERTA',
            description: `[WhatsApp - ${senderName}] ${content.substring(0, 500)}`,
            requested_by: senderName,
            source: 'WHATSAPP',
            whatsapp_message_id: messageId,
          })
          .select('id, order_number')
          .single()

        if (osError) {
          console.error('[executeAction] Erro ao criar OS:', osError)
          // Tentar formato alternativo da tabela
          const { data: os2 } = await supabase
            .from('maintenance_orders')
            .insert({
              equipment_id: equipmentId,
              type: 'corretiva',
              priority: ai_urgency === 'HIGH' ? 'urgente' : ai_urgency === 'MEDIUM' ? 'alta' : 'normal',
              status: 'aberta',
              description: `[WhatsApp - ${senderName}] ${content.substring(0, 500)}`,
              requested_by: senderName,
              source: 'whatsapp',
            })
            .select('id')
            .single()

          if (os2) {
            console.log(`[executeAction] OS criada (maintenance_orders): ${os2.id}`)
          }
        } else {
          console.log(`[executeAction] OS criada: ${os?.order_number || os?.id}`)
        }

        // Atualizar status da mensagem
        await supabase
          .from('whatsapp_messages')
          .update({ status: 'PROCESSED', ai_action: `OS corretiva criada para ${equipmentName || 'equipamento'}` })
          .eq('id', messageId)
        break
      }

      case 'FUEL_REQUEST': {
        // Registrar solicitacao de abastecimento
        console.log(`[executeAction] Solicitacao de combustivel de ${senderName}: ${ai_asset}`)
        await supabase
          .from('whatsapp_messages')
          .update({ status: 'PROCESSED' })
          .eq('id', messageId)
        break
      }

      case 'PARTS_REQUEST': {
        // Registrar solicitacao de pecas
        console.log(`[executeAction] Solicitacao de pecas de ${senderName}: ${content.substring(0, 100)}`)
        await supabase
          .from('whatsapp_messages')
          .update({ status: 'PROCESSED' })
          .eq('id', messageId)
        break
      }

      default:
        // GENERAL, LOGISTICS, FINANCIAL - apenas marcar como analisado
        break
    }
  } catch (err) {
    console.error('[executeAction] Erro:', err)
  }
}

// ---------------------------------------------------------------------------
// EXTRACT MESSAGE TEXT from various Evolution API message formats
// ---------------------------------------------------------------------------
function extractMessageText(message: any): string | null {
  if (!message) return null
  if (message.conversation) return message.conversation
  if (message.extendedTextMessage?.text) return message.extendedTextMessage.text
  if (message.imageMessage?.caption) return message.imageMessage.caption
  if (message.videoMessage?.caption) return message.videoMessage.caption
  if (message.documentMessage?.caption) return message.documentMessage.caption
  if (message.documentMessage?.fileName) return `[Arquivo: ${message.documentMessage.fileName}]`
  if (message.stickerMessage) return '[Sticker]'
  if (message.audioMessage) return '[Audio]'
  if (message.contactMessage) return `[Contato: ${message.contactMessage.displayName || ''}]`
  if (message.locationMessage) return `[Localizacao: ${message.locationMessage.degreesLatitude},${message.locationMessage.degreesLongitude}]`
  return null
}

// ---------------------------------------------------------------------------
// CHECK AUTO-REPLY SETTINGS
// ---------------------------------------------------------------------------
async function isAutoReplyEnabled(supabase: any): Promise<boolean> {
  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'whatsapp_auto_reply')
    .single()

  return data?.value === 'true' || data?.value === true
}

// ---------------------------------------------------------------------------
// HANDLE INCOMING MESSAGE
// ---------------------------------------------------------------------------
async function handleMessage(payload: any, supabase: any) {
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

  if (!content) return

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

  // Analise com IA (multi-provider)
  if (msgData?.id && messageType === 'text') {
    const aiResult = await analyzeMessage(content, supabase)
    if (aiResult) {
      // Atualizar mensagem com resultado da IA
      await supabase
        .from('whatsapp_messages')
        .update({
          ai_intent: aiResult.ai_intent,
          ai_asset: aiResult.ai_asset,
          ai_urgency: aiResult.ai_urgency,
          ai_action: aiResult.ai_action,
        })
        .eq('id', msgData.id)

      // Salvar resposta sugerida pela IA
      if (aiResult.ai_response) {
        await supabase
          .from('whatsapp_messages')
          .update({ ai_response: aiResult.ai_response })
          .eq('id', msgData.id)
      }

      // Verificar se auto-reply esta ativo
      const autoReply = await isAutoReplyEnabled(supabase)

      if (autoReply && aiResult.ai_response && aiResult.ai_intent !== 'GENERAL') {
        // Modo automatico: responde e executa acao direto
        const prefix = '🤖 *TerraPro Bot:*\n'
        await sendWhatsAppMessage(supabase, remoteJid, prefix + aiResult.ai_response)

        if (aiResult.ai_intent !== 'GENERAL') {
          await executeAction(aiResult, msgData.id, senderName, content, supabase)
        }
      }
      // Modo manual: nao faz nada, usuario aprova pelo painel
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const event = payload.event || ''
    const instance = payload.instance || ''

    console.log(`[webhook] event=${event} instance=${instance}`)

    const supabase = getSupabase()

    switch (event) {
      case 'messages.upsert':
        await handleMessage(payload, supabase)
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
