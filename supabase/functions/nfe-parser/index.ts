/**
 * TERRAPRO ERP - NFe Parser Edge Function
 *
 * Recebe XML, PDF ou imagem de NF e extrai dados estruturados.
 * - XML: parsing direto via fast-xml-parser
 * - PDF/Imagem: envia para Gemini AI para extração inteligente
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse as parseXml } from 'https://esm.sh/fast-xml-parser@4.3.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ParsedItem {
  description: string
  ncm: string
  cfop: string
  ean: string
  unit: string
  qty: number
  unit_cost: number
  total: number
}

interface ParsedNfe {
  supplier_name: string
  supplier_cnpj: string
  invoice_number: string
  serie: string
  chave_nfe: string
  issue_date: string
  total: number
  items: ParsedItem[]
}

function parseNFeXml(xmlText: string): ParsedNfe {
  const parsed = parseXml(xmlText, {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
  })

  const nfe = parsed?.nfeProc?.NFe || parsed?.NFe
  if (!nfe) throw new Error('XML nao contem NFe valida')

  const infNFe = nfe.infNFe || nfe
  const ide = infNFe.ide || {}
  const emit = infNFe.emit || {}
  const total = infNFe.total?.ICMSTot || {}
  const det = infNFe.det || []
  const chave = infNFe['@_Id']?.replace('NFe', '') || ''

  const items: ParsedItem[] = (Array.isArray(det) ? det : [det]).map((d: any) => {
    const prod = d.prod || {}
    return {
      description: prod.xProd || '',
      ncm: prod.NCM || '',
      cfop: prod.CFOP || '',
      ean: prod.cEAN || prod.cEANTrib || '',
      unit: prod.uCom || prod.uTrib || 'UN',
      qty: Number(prod.qCom || prod.qTrib || 0),
      unit_cost: Number(prod.vUnCom || prod.vUnTrib || 0),
      total: Number(prod.vProd || 0),
    }
  })

  return {
    supplier_name: emit.xNome || emit.xFant || '',
    supplier_cnpj: emit.CNPJ || emit.CPF || '',
    invoice_number: String(ide.nNF || ''),
    serie: String(ide.serie || '1'),
    chave_nfe: chave,
    issue_date: ide.dhEmi?.split('T')[0] || ide.dEmi || '',
    total: Number(total.vNF || 0),
    items,
  }
}

async function parseWithGemini(content: string, fileType: string, geminiKey: string): Promise<ParsedNfe> {
  const prompt = `Voce e um assistente que extrai dados de Notas Fiscais brasileiras.
Analise o conteudo abaixo (${fileType === 'pdf' ? 'texto de PDF' : 'imagem'} de uma DANFE/NF) e retorne APENAS um JSON com a seguinte estrutura:
{
  "supplier_name": "nome do fornecedor/emitente",
  "supplier_cnpj": "CNPJ",
  "invoice_number": "numero da NF",
  "serie": "serie",
  "chave_nfe": "chave de acesso 44 digitos",
  "issue_date": "YYYY-MM-DD",
  "total": 0.00,
  "items": [{"description":"","ncm":"","cfop":"","ean":"","unit":"","qty":0,"unit_cost":0,"total":0}]
}
Retorne SOMENTE o JSON, sem markdown ou explicacao.`

  const body: any = {
    contents: [{
      parts: [
        { text: prompt },
      ]
    }]
  }

  if (fileType === 'image') {
    body.contents[0].parts.push({
      inline_data: { mime_type: 'image/jpeg', data: content }
    })
  } else {
    body.contents[0].parts.push({ text: `\n\nConteudo do documento:\n${content}` })
  }

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Gemini API error: ${resp.status} - ${err}`)
  }

  const result = await resp.json()
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Gemini nao retornou JSON valido')

  return JSON.parse(jsonMatch[0])
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, content, file_name } = await req.json()

    if (!type || !content) {
      return new Response(
        JSON.stringify({ error: 'Campos type e content sao obrigatorios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let parsed: ParsedNfe
    let confidence = 0

    if (type === 'xml') {
      parsed = parseNFeXml(content)
      confidence = 95
    } else {
      // PDF ou imagem: usar Gemini
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      )

      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'gemini_api_key')
        .single()

      const geminiKey = settings?.value
      if (!geminiKey) {
        return new Response(
          JSON.stringify({ error: 'Chave Gemini nao configurada em system_settings' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      parsed = await parseWithGemini(content, type === 'pdf' ? 'pdf' : 'image', geminiKey)
      confidence = type === 'pdf' ? 75 : 60
    }

    return new Response(
      JSON.stringify({
        success: true,
        confidence,
        file_type: type,
        file_name: file_name || null,
        data: parsed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Erro ao processar NF' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
