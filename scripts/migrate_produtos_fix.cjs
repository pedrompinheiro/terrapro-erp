/**
 * Fix: Migra PRODUTOS.DBF (via JSON exportado pelo Python) e FORPRO.DBF
 *
 * O PRODUTOS.DBF tem campo duplicado "QUANTIDADE" que a lib dbffile não suporta.
 * Solução: Python exportou para PRODUTOS.json, este script lê o JSON.
 *
 * Uso: node scripts/migrate_produtos_fix.cjs
 */

const { DBFFile } = require('dbffile');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const BACKUP_DIR = path.join(__dirname, '..', 'BACKUP_OSOFICINA7.2_000009');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function cleanStr(val) {
  if (!val) return '';
  return String(val).trim();
}

function cleanNum(val, decimals = 2) {
  if (val === null || val === undefined) return 0;
  return Number(Number(val).toFixed(decimals));
}

function cleanDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) return val.split('T')[0];
  return null;
}

function cleanBool(val) {
  return val === true || val === 'T' || val === 't' || val === 1;
}

async function insertBatch(table, data, batchSize = 50) {
  if (data.length === 0) {
    console.log(`  ⏭️  ${table}: Nenhum dado para inserir`);
    return [];
  }

  const allResults = [];
  let errors = 0;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const { data: result, error } = await supabase.from(table).insert(batch).select('id');

    if (error) {
      // Tentar um por um
      for (const item of batch) {
        const { data: single, error: singleErr } = await supabase.from(table).insert(item).select('id');
        if (singleErr) {
          errors++;
          if (errors <= 5) {
            console.error(`    ❌ ${JSON.stringify(item).slice(0, 120)}`);
            console.error(`       ${singleErr.message}`);
          }
        } else if (single) {
          allResults.push(...single);
        }
      }
    } else if (result) {
      allResults.push(...result);
    }

    const pct = Math.min(100, Math.round(((i + batch.length) / data.length) * 100));
    process.stdout.write(`\r  📊 ${table}: ${pct}% (${Math.min(i + batchSize, data.length)}/${data.length})`);
  }
  if (errors > 5) console.log(`\n  ⚠️  +${errors - 5} erros omitidos`);
  console.log(`\n  ✅ ${table}: ${allResults.length} registros inseridos (${errors} erros)`);
  return allResults;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  FIX: Migrar PRODUTOS + FORNECEDOR x PRODUTO    ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Carregar mapa de categorias e marcas já migradas
  const idMaps = { categories: {}, brands: {}, items: {} };

  const { data: cats } = await supabase.from('inventory_categories').select('id, code');
  if (cats) cats.forEach(r => { idMaps.categories[r.code] = r.id; });
  console.log(`📂 Categorias carregadas: ${Object.keys(idMaps.categories).length}`);

  const { data: brands } = await supabase.from('inventory_brands').select('id, code');
  if (brands) brands.forEach(r => { idMaps.brands[r.code] = r.id; });
  console.log(`🏷️  Marcas carregadas: ${Object.keys(idMaps.brands).length}`);

  // ============================================================
  // 1. PRODUTOS (via JSON)
  // ============================================================
  console.log('\n📦 Migrando PRODUTOS (PRODUTOS.json - 1.881 registros)...');

  const jsonPath = path.join(BACKUP_DIR, 'PRODUTOS.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ PRODUTOS.json não encontrado! Execute o script Python primeiro.');
    process.exit(1);
  }

  const records = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`  📄 ${records.length} registros lidos do JSON`);

  const prodData = records.map(r => ({
    code: r.CODIGO,
    sku: cleanStr(r.REFERENCIA) || null,
    barcode: cleanStr(r.BARRA) || null,
    description: cleanStr(r.DESCRICAO),
    is_service: cleanBool(r.SERVICO),
    is_product: cleanBool(r.PRODUTO),
    item_type: cleanBool(r.SERVICO) ? 'SERVICO' : 'PRODUTO',
    unit: cleanStr(r.UNIDADE) || 'UNI',
    category_id: idMaps.categories[r.CODCAT] || null,
    category_name: cleanStr(r.CATEGORIA) || null,
    brand_id: idMaps.brands[r.CODMAR] || null,
    brand_name: cleanStr(r.MARCA) || null,
    qty_minimum: cleanNum(r.QUANT_MINI, 3),
    qty_current: cleanNum(r.QUANT_ATUA, 3),
    qty_maximum: cleanNum(r.QUANT_MAX, 3),
    qty_unit: cleanNum(r.QUANT_UNID, 3),
    qty_previous_in: cleanNum(r.ENTANT, 3),
    qty_previous_out: cleanNum(r.SAIANT, 3),
    qty_previous_balance: cleanNum(r.SALDOANT, 3),
    qty_in: cleanNum(r.ENTRADA, 3),
    qty_out: cleanNum(r.SAIDA, 3),
    qty_balance: cleanNum(r.SALDO, 3),
    qty_shortage: cleanNum(r.FALTA, 3),
    cost_price: cleanNum(r.P_CUSTO),
    sell_price: cleanNum(r.P_VENDA),
    margin_percent: cleanNum(r.MARGEM),
    wholesale_price: cleanNum(r.ATACADO),
    margin_2_percent: cleanNum(r.MARGEM2),
    margin_3_percent: cleanNum(r.MARGEM3),
    commission_percent: cleanNum(r.COMISSAO),
    total_cost: cleanNum(r.TOT_CUSTO),
    profit: cleanNum(r.LUCRO),
    profit_percent: cleanNum(r.LUCROP),
    location: cleanStr(r.LOCALIZA) || null,
    photo_1_url: cleanStr(r.FOTO1) || null,
    photo_2_url: cleanStr(r.FOTO2) || null,
    has_expiry: cleanBool(r.VENZER),
    expiry_date: cleanDate(r.VENCIMENTO),
    alert_minimum: cleanBool(r.AVISOMIN),
    alert_zero: cleanBool(r.AVISOZER),
    blocked: cleanBool(r.BLOQUEARD),
    most_sold_value: cleanNum(r.MAIS_VEND),
    most_sold_qty: cleanNum(r.MAIS_QUAN, 3),
    ncm: cleanStr(r.DESC_NCM) || null,
    cfop: cleanStr(r.CFOP_VEND) || null,
    origin: cleanStr(r.ORIG_PROD) || null,
    notes: cleanStr(r.MENSAGEM) || null,
    legacy_code: r.CODIGO,
    last_purchase_date: cleanDate(r.DATA),
    active: true
  })).filter(r => r.description);

  const prodResults = await insertBatch('inventory_items', prodData, 30);

  // Carregar mapa de produtos
  const { data: allItems } = await supabase.from('inventory_items').select('id, code');
  if (allItems) {
    allItems.forEach(r => { idMaps.items[r.code] = r.id; });
  }
  console.log(`  🗂️  Mapa de produtos: ${Object.keys(idMaps.items).length} itens`);

  // ============================================================
  // 2. FORNECEDOR x PRODUTO (FORPRO.DBF)
  // ============================================================
  console.log('\n🔗 Migrando FORNECEDOR x PRODUTO (FORPRO.DBF)...');

  const forproPath = path.join(BACKUP_DIR, 'FORPRO.DBF');
  let forproRecords = [];
  try {
    const dbf = await DBFFile.open(forproPath, { encoding: 'latin1' });
    forproRecords = await dbf.readRecords(dbf.recordCount);
    console.log(`  📄 ${forproRecords.length} registros lidos`);
  } catch (e) {
    console.error(`  ❌ Erro ao ler FORPRO.DBF: ${e.message}`);
  }

  const forproData = [];
  let skipped = 0;
  for (const r of forproRecords) {
    const itemId = idMaps.items[r.CODIGO] || null;
    if (!itemId) { skipped++; continue; }

    for (let i = 1; i <= 3; i++) {
      const name = cleanStr(r[`FORNECE${i}`]);
      if (name) {
        forproData.push({
          item_id: itemId,
          supplier_name: name,
          supplier_phone: cleanStr(r[`TEL${i}`]) || null,
          supplier_rep: cleanStr(r[`REPRE${i}`]) || null,
          cost_price: cleanNum(r[`CUSTO${i}`]),
          last_quote_date: cleanDate(r[`DATA${i}`]),
          payment_terms: cleanStr(r[`COND${i}`]) || null,
          notes: cleanStr(r[`OBS${i}`]) || null,
          priority: i
        });
      }
    }
  }
  if (skipped > 0) console.log(`  ⚠️  ${skipped} registros sem item_id (produto não encontrado)`);

  await insertBatch('inventory_supplier_products', forproData, 30);

  // ============================================================
  // 3. Atualizar service_order_items e purchase_order_items com item_id
  // ============================================================
  console.log('\n🔄 Atualizando item_id nos itens das OS e compras...');

  // Atualizar service_order_items que têm item_id null mas product_code válido
  let updatedSO = 0;
  for (const [code, uuid] of Object.entries(idMaps.items)) {
    const { data: updated, error } = await supabase
      .from('service_order_items')
      .update({ item_id: uuid })
      .eq('product_code', Number(code))
      .is('item_id', null)
      .select('id');
    if (updated) updatedSO += updated.length;
  }
  console.log(`  ✅ service_order_items: ${updatedSO} registros atualizados com item_id`);

  // Atualizar purchase_order_items
  let updatedPO = 0;
  for (const [code, uuid] of Object.entries(idMaps.items)) {
    const { data: updated, error } = await supabase
      .from('purchase_order_items')
      .update({ item_id: uuid })
      .eq('product_code', Number(code))
      .is('item_id', null)
      .select('id');
    if (updated) updatedPO += updated.length;
  }
  console.log(`  ✅ purchase_order_items: ${updatedPO} registros atualizados com item_id`);

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║        ✅ FIX CONCLUÍDO COM SUCESSO!             ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Produtos:         ${Object.keys(idMaps.items).length}`);
  console.log(`║  Fornec x Prod:    ${forproData.length}`);
  console.log(`║  OS items fixados: ${updatedSO}`);
  console.log(`║  PO items fixados: ${updatedPO}`);
  console.log('╚══════════════════════════════════════════════════╝');
}

main().catch(err => {
  console.error('\n❌ ERRO FATAL:', err.message);
  process.exit(1);
});
