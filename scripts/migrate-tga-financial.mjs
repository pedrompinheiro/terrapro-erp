/**
 * Migração Financeira TGA (Firebird) → TerraPro ERP (Supabase)
 *
 * Importa contas a receber e contas a pagar do sistema TGA (tabela FLAN)
 * para as tabelas `contas_receber` e `contas_pagar` do Supabase.
 *
 * Uso: node scripts/migrate-tga-financial.mjs [--dry-run] [--only-open]
 */
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

// ─── Config ─────────────────────────────────────────────────
const SUPABASE_URL = 'https://xpufmosdhhemcubzswcv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_OPEN = process.argv.includes('--only-open');

if (!SUPABASE_SERVICE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Firebird helpers ───────────────────────────────────────
function fbQuery(sql) {
  const cmd = `docker exec -i firebird-tga /usr/local/firebird/bin/isql -user SYSDBA -password masterkey /firebird/data/tga.fdb`;
  const input = `SET HEADING OFF;\nSET LIST OFF;\nSET COUNT OFF;\nSET BLOB ALL;\n${sql}`;
  return execSync(cmd, { input, encoding: 'latin1', maxBuffer: 150 * 1024 * 1024 });
}

function parseDelimited(raw, fieldCount) {
  const lines = raw.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && l.includes('||'));
  return lines.map(line => {
    const parts = line.split('||');
    while (parts.length < fieldCount) parts.push('');
    return parts.map(p => p.trim());
  });
}

// ─── Reference tables (TGA) ─────────────────────────────────
const docTypeMap = {
  'AD': 'Adiantamento', 'ALM': 'Almoxarifado', 'BO': 'Boleto',
  'CAT': 'Cartao', 'CRT': 'Conhecimento Transporte', 'DP': 'Duplicata',
  'DV': 'Devolucao', 'ND': 'Nota de Debito', 'NF': 'Nota Fiscal',
  'PRV': 'Previsao', 'PS': 'Pagamento Salario', 'RE': 'Recibo',
};

const paymentMethodMap = {
  '01': 'Dinheiro', '02': 'PIX/Transferencia', '03': 'Cartao Debito',
  '04': 'Cartao Credito', '05': 'Alimentacao', '06': 'Cheque', '07': 'Deposito',
};

// ─── Build entity lookup ─────────────────────────────────────
console.log('Carregando entidades do Supabase...');

const entityMap = new Map();
let entityPage = 0;
while (true) {
  const { data, error } = await supabase.from('entities')
    .select('id, name, legacy_code')
    .not('legacy_code', 'is', null)
    .range(entityPage * 1000, (entityPage + 1) * 1000 - 1);
  if (error) { console.error('Erro entities:', error.message); break; }
  if (data.length === 0) break;
  for (const e of data) {
    for (const code of e.legacy_code.split(',')) {
      entityMap.set(code.trim(), { id: e.id, name: e.name });
    }
  }
  entityPage++;
}
console.log(`  ${entityMap.size} codigos mapeados`);

// ─── SQL template ────────────────────────────────────────────
const statusFilter = ONLY_OPEN ? "AND STATUSLAN = 'A'" : '';
const hoje = new Date().toISOString().split('T')[0];

function buildFlanSQL(pageSize, offset) {
  return `
SELECT FIRST ${pageSize} SKIP ${offset}
  TRIM(CAST(IDLAN AS VARCHAR(10))) || '||' ||
  TRIM(CODCFO) || '||' ||
  TRIM(COALESCE(PAGREC,'')) || '||' ||
  TRIM(COALESCE(CODTDO,'')) || '||' ||
  TRIM(COALESCE(NUMERODOCUMENTO,'')) || '||' ||
  COALESCE(CAST(PARCELA AS VARCHAR(5)),'') || '||' ||
  COALESCE(CAST(NPARCELA AS VARCHAR(5)),'') || '||' ||
  TRIM(COALESCE(STATUSLAN,'')) || '||' ||
  COALESCE(CAST(DATAEMISSAO AS VARCHAR(10)),'') || '||' ||
  COALESCE(CAST(DATAVENCIMENTO AS VARCHAR(10)),'') || '||' ||
  COALESCE(CAST(DATABAIXA AS VARCHAR(10)),'') || '||' ||
  COALESCE(CAST(VALORORIGINAL AS VARCHAR(20)),'0') || '||' ||
  COALESCE(CAST(VALORBAIXADO AS VARCHAR(20)),'0') || '||' ||
  COALESCE(CAST(VALORJUROS AS VARCHAR(20)),'0') || '||' ||
  COALESCE(CAST(VALORDESCONTO AS VARCHAR(20)),'0') || '||' ||
  COALESCE(CAST(VALORMULTA AS VARCHAR(20)),'0') || '||' ||
  COALESCE(CAST(VLR_SALDO AS VARCHAR(20)),'0') || '||' ||
  TRIM(COALESCE(HISTORICO,'')) || '||' ||
  TRIM(COALESCE(CODFORMA,'')) || '||' ||
  TRIM(COALESCE(CODPORT,'')) || '||' ||
  TRIM(COALESCE(OBSERVACOES,'')) || '||' ||
  TRIM(COALESCE(BOL_NUMERO,'')) || '||' ||
  COALESCE(CAST(JUROSDIA AS VARCHAR(20)),'0') || '||' ||
  COALESCE(CAST(PERCMULTA AS VARCHAR(20)),'0') || '||' ||
  COALESCE(CAST(DATADIGITACAO AS VARCHAR(24)),'') || '||' ||
  TRIM(COALESCE(CODBARRABOLETO,'')) || '||' ||
  TRIM(COALESCE(LINHADIGITAVELBOLETO,'')) || '||' ||
  TRIM(COALESCE(CCUSTO,''))
FROM FLAN
WHERE PAGREC IN ('R','P') ${statusFilter}
ORDER BY IDLAN;`;
}

// ─── Transform function ──────────────────────────────────────
function transformRow(row) {
  const [
    idlan, codcfo, pagrec, codtdo, numdoc,
    parcela, nparcela, statuslan,
    dataEmissao, dataVencimento, dataBaixa,
    valorOriginal, valorBaixado, valorJuros, valorDesconto, valorMulta, vlrSaldo,
    historico, codforma, codport, observacoes,
    bolNumero, jurosDia, percMulta, dataDigitacao,
    codBarras, linhaDigitavel, ccusto
  ] = row;

  const entity = entityMap.get(codcfo);
  if (!entity) return null;

  const valOrig = parseFloat(valorOriginal) || 0;
  const valBaixado = parseFloat(valorBaixado) || 0;
  const valJuros = parseFloat(valorJuros) || 0;
  const valDesconto = parseFloat(valorDesconto) || 0;
  const valMulta = parseFloat(valorMulta) || 0;
  const valSaldo = parseFloat(vlrSaldo) || 0;

  if (valOrig === 0 && valBaixado === 0) return null;

  let status;
  if (statuslan === 'C') {
    status = 'CANCELADO';
  } else if (statuslan === 'B') {
    status = pagrec === 'R' ? 'RECEBIDO' : 'PAGO';
  } else if (statuslan === 'A') {
    status = (dataVencimento && dataVencimento < hoje) ? 'VENCIDO' : 'PENDENTE';
  } else {
    status = 'PENDENTE';
  }

  const formaText = codforma ? (paymentMethodMap[codforma] || codforma) : null;
  const categoria = codtdo ? (docTypeMap[codtdo] || codtdo) : null;
  const prefixo = pagrec === 'R' ? 'TGA-CR' : 'TGA-CP';
  const numeroTitulo = `${prefixo}-${String(idlan).padStart(6, '0')}`;
  const parcelaNum = parseInt(parcela) || null;
  const parcelaTotal = parseInt(nparcela) || null;

  if (pagrec === 'R') {
    return {
      table: 'contas_receber',
      data: {
        numero_titulo: numeroTitulo,
        cliente_id: entity.id,
        cliente_nome: entity.name,
        valor_original: valOrig,
        valor_juros: valJuros,
        valor_multa: valMulta,
        valor_desconto: valDesconto,
        valor_recebido: valBaixado,
        data_emissao: dataEmissao || null,
        data_vencimento: dataVencimento || null,
        data_recebimento: dataBaixa || null,
        status,
        forma_recebimento: formaText,
        categoria,
        descricao: historico || `${categoria || 'Titulo'} ${numdoc}`,
        observacao: observacoes || null,
        numero_documento: numdoc || null,
        parcela_numero: parcelaNum,
        parcela_total: parcelaTotal,
        nosso_numero: bolNumero || null,
        taxa_juros_dia: parseFloat(jurosDia) || 0,
        percentual_multa: parseFloat(percMulta) || 0,
        codigo_barras: codBarras || null,
        linha_digitavel: linhaDigitavel || null,
        conciliado: statuslan === 'B',
      },
    };
  } else {
    return {
      table: 'contas_pagar',
      data: {
        numero_titulo: numeroTitulo,
        fornecedor_id: entity.id,
        fornecedor_nome: entity.name,
        valor_original: valOrig,
        valor_juros: valJuros,
        valor_multa: valMulta,
        valor_desconto: valDesconto,
        valor_pago: valBaixado,
        data_emissao: dataEmissao || null,
        data_vencimento: dataVencimento || null,
        data_pagamento: dataBaixa || null,
        status,
        forma_pagamento: formaText,
        categoria,
        descricao: historico || `${categoria || 'Titulo'} ${numdoc}`,
        observacao: observacoes || null,
        numero_documento: numdoc || null,
        parcela_numero: parcelaNum,
        parcela_total: parcelaTotal,
        nosso_numero: bolNumero || null,
        codigo_barras: codBarras || null,
        linha_digitavel: linhaDigitavel || null,
        conciliado: statuslan === 'B',
      },
    };
  }
}

// ─── Process in streaming pages ──────────────────────────────
console.log('\nMigrando FLAN do TGA...');

const PAGE_SIZE = 5000;
const BATCH_SIZE = 500;
let offset = 0;
let totalExtracted = 0;
let orphans = 0;
let skipped = 0;
const stats = { cr_inserted: 0, cr_errors: 0, cp_inserted: 0, cp_errors: 0 };

async function insertRecords(table, records) {
  if (records.length === 0) return;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).insert(batch);
    if (error) {
      // Fallback: one by one
      for (const rec of batch) {
        const { error: err2 } = await supabase.from(table).insert(rec);
        if (err2) {
          if (table === 'contas_receber') stats.cr_errors++;
          else stats.cp_errors++;
        } else {
          if (table === 'contas_receber') stats.cr_inserted++;
          else stats.cp_inserted++;
        }
      }
    } else {
      if (table === 'contas_receber') stats.cr_inserted += batch.length;
      else stats.cp_inserted += batch.length;
    }
  }
}

while (true) {
  const sql = buildFlanSQL(PAGE_SIZE, offset);
  const raw = fbQuery(sql);
  const rows = parseDelimited(raw, 28);

  if (rows.length === 0) break;
  totalExtracted += rows.length;

  // Transform
  const crBatch = [];
  const cpBatch = [];

  for (const row of rows) {
    const result = transformRow(row);
    if (!result) {
      if (!entityMap.has(row[1])) orphans++;
      else skipped++;
      continue;
    }
    if (result.table === 'contas_receber') crBatch.push(result.data);
    else cpBatch.push(result.data);
  }

  if (DRY_RUN) {
    if (offset === 0) {
      console.log('\nDRY RUN - amostra contas_receber:');
      for (const r of crBatch.slice(0, 2)) console.log(JSON.stringify(r, null, 2));
      console.log('\nDRY RUN - amostra contas_pagar:');
      for (const p of cpBatch.slice(0, 2)) console.log(JSON.stringify(p, null, 2));
    }
  } else {
    await insertRecords('contas_receber', crBatch);
    await insertRecords('contas_pagar', cpBatch);
  }

  process.stdout.write(`\r  Progresso: ${totalExtracted} extraidos | CR: ${stats.cr_inserted} | CP: ${stats.cp_inserted}`);

  offset += PAGE_SIZE;
  if (rows.length < PAGE_SIZE) break;
}

console.log(`\n\nMigracao ${DRY_RUN ? '(DRY RUN) ' : ''}concluida!`);
console.log(`  Extraidos do Firebird: ${totalExtracted}`);
console.log(`  Orfaos (sem entidade): ${orphans}`);
console.log(`  Zerados (ignorados):   ${skipped}`);
console.log(`  contas_receber: ${stats.cr_inserted} inseridos, ${stats.cr_errors} erros`);
console.log(`  contas_pagar:   ${stats.cp_inserted} inseridos, ${stats.cp_errors} erros`);
console.log(`  Total inseridos: ${stats.cr_inserted + stats.cp_inserted}`);
