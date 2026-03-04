/**
 * TERRAPRO ERP - NFe Parser Edge Function
 *
 * Recebe XML, PDF ou imagem de NF e extrai dados estruturados.
 * - XML: parsing direto via fast-xml-parser
 * - PDF/Imagem: envia para IA (multi-provider) para extracao inteligente
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse as parseXml } from 'https://esm.sh/fast-xml-parser@4.3.4'
import { analyzeText, analyzeWithImage } from '../_shared/aiHelper.ts'

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

const NF_PROMPT = `Voce e um assistente que extrai dados de Notas Fiscais brasileiras.
Analise o conteudo abaixo e retorne APENAS um JSON com a seguinte estrutura:
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

async function parseWithAI(content: string, fileType: string, supabase: any): Promise<ParsedNfe> {
  let text: string | null = null

  if (fileType === 'image') {
    text = await analyzeWithImage(supabase, NF_PROMPT, content, 'image/jpeg')
  } else {
    // PDF - envia como texto
    text = await analyzeText(supabase, `${NF_PROMPT}\n\nConteudo do documento:\n${content}`)
  }

  if (!text) throw new Error('IA nao retornou resposta. Verifique a configuracao do provider em Configuracoes.')

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('IA nao retornou JSON valido')

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
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      )

      parsed = await parseWithAI(content, type === 'pdf' ? 'pdf' : 'image', supabase)
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
