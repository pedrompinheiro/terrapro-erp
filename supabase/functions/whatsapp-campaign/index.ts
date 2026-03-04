/**
 * TERRAPRO ERP - WhatsApp Campaign Edge Function
 *
 * Executa campanhas de mensagens em massa via Evolution API.
 * Busca contatos por target_audience (clientes, fornecedores, funcionarios)
 * e envia mensagens com delay entre cada para evitar bloqueio.
 *
 * Deploy: supabase functions deploy whatsapp-campaign
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getSupabase() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

// ---------------------------------------------------------------------------
// SEND TEXT via Evolution API
// ---------------------------------------------------------------------------
async function sendEvolutionText(
  apiUrl: string,
  apiKey: string,
  instanceName: string,
  phone: string,
  text: string
): Promise<boolean> {
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length < 10) return false

  const remoteJid = `${cleanPhone}@s.whatsapp.net`

  try {
    const resp = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: remoteJid,
        options: { delay: 1200, presence: 'composing' },
        textMessage: { text }
      })
    })

    if (!resp.ok) {
      console.error(`Falha ao enviar para ${cleanPhone}: HTTP ${resp.status}`)
      return false
    }
    return true
  } catch (err) {
    console.error(`Erro ao enviar para ${cleanPhone}:`, err)
    return false
  }
}

// ---------------------------------------------------------------------------
// RESOLVE CONTACTS by target audience
// ---------------------------------------------------------------------------
async function resolveContacts(
  supabase: any,
  targetAudience: string
): Promise<{ name: string; phone: string }[]> {
  const contacts: { name: string; phone: string }[] = []

  if (targetAudience === 'ALL_CLIENTS' || targetAudience === 'CLIENTS') {
    const { data } = await supabase
      .from('entities')
      .select('name, phone')
      .eq('is_client', true)
      .eq('active', true)
      .not('phone', 'is', null)
    if (data) contacts.push(...data.filter((c: any) => c.phone))
  }

  if (targetAudience === 'SUPPLIERS') {
    const { data } = await supabase
      .from('entities')
      .select('name, phone')
      .eq('is_supplier', true)
      .eq('active', true)
      .not('phone', 'is', null)
    if (data) contacts.push(...data.filter((c: any) => c.phone))
  }

  if (targetAudience === 'EMPLOYEES') {
    const { data } = await supabase
      .from('employees')
      .select('full_name, phone, cell_phone')
      .eq('active', true)
    if (data) {
      for (const emp of data) {
        const phone = emp.cell_phone || emp.phone
        if (phone) contacts.push({ name: emp.full_name, phone })
      }
    }
  }

  if (targetAudience === 'ALL_CLIENTS') {
    // Ja incluido acima
  }

  return contacts
}

// ---------------------------------------------------------------------------
// EXECUTE CAMPAIGN
// ---------------------------------------------------------------------------
async function executeCampaign(campaignId: string) {
  const supabase = getSupabase()

  // 1. Buscar campanha
  const { data: campaign, error: campError } = await supabase
    .from('whatsapp_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()

  if (campError || !campaign) {
    return { success: false, error: 'Campanha nao encontrada' }
  }

  if (campaign.status === 'SENT') {
    return { success: false, error: 'Campanha ja foi enviada' }
  }

  // 2. Buscar config da Evolution API
  const { data: settings } = await supabase
    .from('system_settings')
    .select('key, value')
    .in('key', ['evolution_api_url', 'evolution_api_key', 'evolution_instance_name'])

  const settingsMap: Record<string, string> = {}
  for (const s of settings || []) settingsMap[s.key] = s.value

  const apiUrl = settingsMap.evolution_api_url
  const apiKey = settingsMap.evolution_api_key
  const instanceName = settingsMap.evolution_instance_name || 'terrapro_bot'

  if (!apiUrl || !apiKey) {
    return { success: false, error: 'Evolution API nao configurada em system_settings' }
  }

  // 3. Resolver contatos
  const contacts = await resolveContacts(supabase, campaign.target_audience)

  if (contacts.length === 0) {
    return { success: false, error: 'Nenhum contato encontrado para o publico-alvo' }
  }

  // 4. Atualizar campanha: SENDING
  await supabase
    .from('whatsapp_campaigns')
    .update({ status: 'SENDING', total_count: contacts.length, sent_count: 0 })
    .eq('id', campaignId)

  // 5. Enviar mensagens com delay
  let sent = 0
  let failed = 0

  for (const contact of contacts) {
    // Personalizar mensagem (substituir {nome})
    const personalizedMsg = campaign.message_content
      .replace(/\{nome\}/gi, contact.name || 'Cliente')

    const success = await sendEvolutionText(apiUrl, apiKey, instanceName, contact.phone, personalizedMsg)

    if (success) {
      sent++
    } else {
      failed++
    }

    // Atualizar progresso a cada 5 envios
    if ((sent + failed) % 5 === 0) {
      await supabase
        .from('whatsapp_campaigns')
        .update({ sent_count: sent })
        .eq('id', campaignId)
    }

    // Delay randomizado entre 3-5 segundos (anti-spam)
    const delay = 3000 + Math.random() * 2000
    await new Promise(r => setTimeout(r, delay))
  }

  // 6. Finalizar campanha
  await supabase
    .from('whatsapp_campaigns')
    .update({ status: 'SENT', sent_count: sent })
    .eq('id', campaignId)

  return { success: true, sent, failed, total: contacts.length }
}

// ---------------------------------------------------------------------------
// MAIN HANDLER
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, campaign_id } = await req.json()

    if (action === 'execute' && campaign_id) {
      const result = await executeCampaign(campaign_id)
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Acao invalida. Use: { action: "execute", campaign_id: "..." }' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[campaign] Erro:', err)
    return new Response(
      JSON.stringify({ error: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
