// =============================================================================
// Edge Function: nfe-consulta
// Consulta NF-e na SEFAZ via Certificado Digital A1 (mTLS)
// Usa NFeDistribuicaoDFe (consChNFe) para baixar XML pela chave de acesso
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import forge from 'https://esm.sh/node-forge@1.3.1';
import { inflateRawSync } from 'node:zlib';

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------
interface ParsedNfe {
  supplier_name: string;
  supplier_cnpj: string;
  invoice_number: string;
  serie: string;
  chave_nfe: string;
  issue_date: string;
  total: number;
  items: ParsedNfeItem[];
}

interface ParsedNfeItem {
  description: string;
  ncm: string;
  cfop: string;
  ean: string;
  unit: string;
  qty: number;
  unit_cost: number;
  total: number;
}

// ---------------------------------------------------------------------------
// SEFAZ CONSTANTS
// ---------------------------------------------------------------------------
const SEFAZ_DIST_URL = 'https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx';
const SEFAZ_SOAP_ACTION = 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe/nfeDistDFeInteresse';
const UF_MS = '50';
const TP_AMB_PRODUCAO = '1';

// ---------------------------------------------------------------------------
// PFX → PEM conversion via node-forge
// ---------------------------------------------------------------------------
function pfxToPem(pfxBase64: string, password: string): { certChain: string; privateKey: string } {
  const pfxDer = forge.util.decode64(pfxBase64);
  const pfxAsn1 = forge.asn1.fromDer(pfxDer);
  const p12 = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);

  // Extract certificate(s)
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  const certs = certBags[forge.pki.oids.certBag] || [];
  if (certs.length === 0) throw new Error('Nenhum certificado encontrado no arquivo PFX');

  const certChain = certs
    .map((bag: any) => forge.pki.certificateToPem(bag.cert))
    .join('\n');

  // Extract private key
  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  const keys = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag] || [];
  if (keys.length === 0) throw new Error('Nenhuma chave privada encontrada no arquivo PFX');

  const privateKey = forge.pki.privateKeyToPem(keys[0].key);

  return { certChain, privateKey };
}

// ---------------------------------------------------------------------------
// Extract certificate info (subject CN, expiry)
// ---------------------------------------------------------------------------
function getCertInfo(pfxBase64: string, password: string): { cn: string; expiry: string; issuer: string } {
  const pfxDer = forge.util.decode64(pfxBase64);
  const pfxAsn1 = forge.asn1.fromDer(pfxDer);
  const p12 = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  const certs = certBags[forge.pki.oids.certBag] || [];
  if (certs.length === 0) throw new Error('Certificado não encontrado');

  const cert = certs[0].cert;
  const cn = cert.subject.getField('CN')?.value || 'Desconhecido';
  const expiry = cert.validity.notAfter.toISOString();
  const issuer = cert.issuer.getField('CN')?.value || 'Desconhecido';

  return { cn, expiry, issuer };
}

// ---------------------------------------------------------------------------
// Build SOAP envelope for NFeDistribuicaoDFe (consChNFe)
// ---------------------------------------------------------------------------
function buildSoapConsChNFe(cnpj: string, chaveNfe: string): string {
  const nfeDist = `<distDFeInt xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.01"><tpAmb>${TP_AMB_PRODUCAO}</tpAmb><cUFAutor>${UF_MS}</cUFAutor><CNPJ>${cnpj}</CNPJ><consChNFe><chNFe>${chaveNfe}</chNFe></consChNFe></distDFeInt>`;

  return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                 xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <nfeDistDFeInteresse xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe">
      <nfeDadosMsg>${nfeDist}</nfeDadosMsg>
    </nfeDistDFeInteresse>
  </soap12:Body>
</soap12:Envelope>`;
}

// ---------------------------------------------------------------------------
// Parse SOAP response and extract docZip content
// ---------------------------------------------------------------------------
function extractDocZips(soapXml: string): string[] {
  const docZips: string[] = [];
  const regex = /<docZip[^>]*>([\s\S]*?)<\/docZip>/gi;
  let match;
  while ((match = regex.exec(soapXml)) !== null) {
    docZips.push(match[1].trim());
  }
  return docZips;
}

function extractSoapStatus(soapXml: string): { cStat: string; xMotivo: string } {
  const cStatMatch = soapXml.match(/<cStat>(.*?)<\/cStat>/);
  const xMotivoMatch = soapXml.match(/<xMotivo>(.*?)<\/xMotivo>/);
  return {
    cStat: cStatMatch?.[1] || '',
    xMotivo: xMotivoMatch?.[1] || 'Resposta desconhecida',
  };
}

// ---------------------------------------------------------------------------
// Decompress docZip (gzip/deflate base64)
// ---------------------------------------------------------------------------
function decompressDocZip(base64Content: string): string {
  const binaryStr = atob(base64Content);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  // SEFAZ uses raw deflate (no gzip header)
  const decompressed = inflateRawSync(bytes);
  return new TextDecoder().decode(decompressed);
}

// ---------------------------------------------------------------------------
// Parse NFe XML into structured data
// ---------------------------------------------------------------------------
function parseNfeXml(xml: string): ParsedNfe {
  // Helper to extract text from tag
  const tag = (name: string, source?: string): string => {
    const src = source || xml;
    const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i');
    const m = src.match(re);
    return m?.[1]?.trim() || '';
  };

  // Supplier (emit)
  const emitBlock = xml.match(/<emit>([\s\S]*?)<\/emit>/i)?.[1] || '';
  const supplier_name = tag('xNome', emitBlock) || tag('xFant', emitBlock);
  const supplier_cnpj = tag('CNPJ', emitBlock);

  // Invoice info (ide)
  const ideBlock = xml.match(/<ide>([\s\S]*?)<\/ide>/i)?.[1] || '';
  const invoice_number = tag('nNF', ideBlock);
  const serie = tag('serie', ideBlock);
  const issue_date = tag('dhEmi', ideBlock).slice(0, 10) || tag('dEmi', ideBlock);

  // Access key (from infNFe or protNFe)
  const chaveMatch = xml.match(/Id="NFe(\d{44})"/);
  const chave_nfe = chaveMatch?.[1] || '';

  // Total
  const totalBlock = xml.match(/<ICMSTot>([\s\S]*?)<\/ICMSTot>/i)?.[1] || '';
  const total = parseFloat(tag('vNF', totalBlock)) || 0;

  // Items (det)
  const items: ParsedNfeItem[] = [];
  const detRegex = /<det\s[^>]*>([\s\S]*?)<\/det>/gi;
  let detMatch;
  while ((detMatch = detRegex.exec(xml)) !== null) {
    const det = detMatch[1];
    const prodBlock = det.match(/<prod>([\s\S]*?)<\/prod>/i)?.[1] || '';
    const impostoBlock = det.match(/<imposto>([\s\S]*?)<\/imposto>/i)?.[1] || '';

    const ean = tag('cEAN', prodBlock) || tag('cEANTrib', prodBlock);
    const description = tag('xProd', prodBlock);
    const ncm = tag('NCM', prodBlock);
    const cfop = tag('CFOP', prodBlock) || tag('CFOP', impostoBlock);
    const unit = tag('uCom', prodBlock) || tag('uTrib', prodBlock) || 'UN';
    const qty = parseFloat(tag('qCom', prodBlock)) || parseFloat(tag('qTrib', prodBlock)) || 0;
    const unit_cost = parseFloat(tag('vUnCom', prodBlock)) || parseFloat(tag('vUnTrib', prodBlock)) || 0;
    const itemTotal = parseFloat(tag('vProd', prodBlock)) || 0;

    items.push({
      description,
      ncm,
      cfop,
      ean: ean === 'SEM GTIN' ? '' : ean,
      unit,
      qty,
      unit_cost,
      total: itemTotal,
    });
  }

  return {
    supplier_name,
    supplier_cnpj,
    invoice_number,
    serie,
    chave_nfe,
    issue_date,
    total,
    items,
  };
}

// ---------------------------------------------------------------------------
// MAIN HANDLER
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // Init Supabase client (service role for system_settings access)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read certificate settings
    const settingsKeys = ['nfe_certificate_pfx', 'nfe_certificate_password', 'company_cnpj'];
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', settingsKeys);

    if (settingsError) throw new Error('Erro ao ler configurações: ' + settingsError.message);

    const settingsMap: Record<string, string> = {};
    for (const s of settings || []) {
      if (s.value) settingsMap[s.key] = s.value;
    }

    const pfxBase64 = settingsMap['nfe_certificate_pfx'];
    const pfxPassword = settingsMap['nfe_certificate_password'];
    const companyCnpj = settingsMap['company_cnpj'];

    // =========================================================================
    // ACTION: test — Validate certificate and test connection
    // =========================================================================
    if (action === 'test') {
      if (!pfxBase64 || !pfxPassword) {
        return jsonResponse({
          success: false,
          error: 'Certificado digital não configurado. Faça upload do .pfx em Configurações.',
        }, 400);
      }

      try {
        const certInfo = getCertInfo(pfxBase64, pfxPassword);
        const now = new Date();
        const expiry = new Date(certInfo.expiry);
        const expired = expiry < now;
        const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return jsonResponse({
          success: true,
          certificate: {
            cn: certInfo.cn,
            issuer: certInfo.issuer,
            expiry: certInfo.expiry,
            expired,
            days_remaining: daysRemaining,
          },
          cnpj_configured: !!companyCnpj,
          cnpj: companyCnpj || null,
        });
      } catch (e: any) {
        return jsonResponse({
          success: false,
          error: 'Erro ao ler certificado: ' + (e.message || 'Senha incorreta ou arquivo inválido'),
        }, 400);
      }
    }

    // =========================================================================
    // ACTION: certInfo — Return certificate details (for Settings page)
    // =========================================================================
    if (action === 'certInfo') {
      if (!pfxBase64 || !pfxPassword) {
        return jsonResponse({ success: true, configured: false });
      }
      try {
        const certInfo = getCertInfo(pfxBase64, pfxPassword);
        const expiry = new Date(certInfo.expiry);
        const now = new Date();
        return jsonResponse({
          success: true,
          configured: true,
          cn: certInfo.cn,
          issuer: certInfo.issuer,
          expiry: certInfo.expiry,
          expired: expiry < now,
          days_remaining: Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        });
      } catch {
        return jsonResponse({ success: true, configured: false, error: 'Certificado inválido' });
      }
    }

    // =========================================================================
    // ACTION: consultaChNFe — Download NFe by access key from SEFAZ
    // =========================================================================
    if (action === 'consultaChNFe') {
      const { chave } = body;

      // Validate inputs
      if (!chave || chave.length !== 44 || !/^\d{44}$/.test(chave)) {
        return jsonResponse({ success: false, error: 'Chave de acesso inválida. Deve conter 44 dígitos numéricos.' }, 400);
      }
      if (!pfxBase64 || !pfxPassword) {
        return jsonResponse({ success: false, error: 'Certificado digital não configurado. Faça upload do .pfx em Configurações.' }, 400);
      }
      if (!companyCnpj) {
        return jsonResponse({ success: false, error: 'CNPJ da empresa não configurado em Configurações > Sistema.' }, 400);
      }

      // 1. Convert PFX to PEM
      const { certChain, privateKey } = pfxToPem(pfxBase64, pfxPassword);

      // 2. Create mTLS HTTP client
      const httpClient = Deno.createHttpClient({
        certChain,
        privateKey,
      });

      // 3. Build SOAP envelope
      const soapBody = buildSoapConsChNFe(companyCnpj, chave);

      // 4. Send request to SEFAZ
      const sefazResponse = await fetch(SEFAZ_DIST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8; action="' + SEFAZ_SOAP_ACTION + '"',
        },
        body: soapBody,
        // @ts-ignore - Deno-specific option
        client: httpClient,
      });

      if (!sefazResponse.ok) {
        const errorText = await sefazResponse.text();
        throw new Error(`SEFAZ retornou HTTP ${sefazResponse.status}: ${errorText.slice(0, 500)}`);
      }

      const responseXml = await sefazResponse.text();
      httpClient.close();

      // 5. Check SEFAZ status
      const { cStat, xMotivo } = extractSoapStatus(responseXml);

      // cStat 138 = Documento localizado
      if (cStat !== '138') {
        return jsonResponse({
          success: false,
          error: `SEFAZ: [${cStat}] ${xMotivo}`,
          cStat,
        }, 400);
      }

      // 6. Extract and decompress docZip
      const docZips = extractDocZips(responseXml);
      if (docZips.length === 0) {
        return jsonResponse({
          success: false,
          error: 'SEFAZ retornou sucesso mas nenhum documento foi encontrado.',
        }, 400);
      }

      // 7. Decompress first document (the NFe XML)
      const nfeXml = decompressDocZip(docZips[0]);

      // 8. Parse NFe XML
      const parsed = parseNfeXml(nfeXml);

      // If chave_nfe wasn't extracted from XML, use the one provided
      if (!parsed.chave_nfe) {
        parsed.chave_nfe = chave;
      }

      return jsonResponse({
        success: true,
        source: 'SEFAZ',
        confidence: 99,
        data: parsed,
        raw_xml_length: nfeXml.length,
      });
    }

    // Unknown action
    return jsonResponse({ success: false, error: `Ação desconhecida: ${action}` }, 400);

  } catch (error: any) {
    console.error('[nfe-consulta] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
