/**
 * TERRAPRO ERP - Migração OS Oficina 7.2 → Supabase
 *
 * Lê os arquivos DBF do backup do OS Oficina e insere no Supabase.
 *
 * Uso: node scripts/migrate_osoficina_to_supabase.cjs
 *
 * Pré-requisitos:
 *   npm install dbffile @supabase/supabase-js dotenv
 *
 * IMPORTANTE: Execute o SQL setup_almoxarifado_completo.sql no Supabase ANTES deste script.
 */

const { DBFFile } = require('dbffile');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
// Carregar .env.local da raiz do projeto
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// ============================================================
// CONFIGURAÇÃO
// ============================================================
const BACKUP_DIR = path.join(__dirname, '..', 'BACKUP_OSOFICINA7.2_000009');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Preferir SERVICE_ROLE_KEY (bypassa RLS)
const SUPABASE_KEY = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variáveis VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não encontradas!');
  console.error('   Configure no .env.local');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.warn('⚠️  Usando ANON KEY - pode falhar com RLS. Prefira SUPABASE_SERVICE_ROLE_KEY.');
} else {
  console.log('🔑 Usando SERVICE_ROLE_KEY (bypassa RLS)');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Mapa de IDs gerados (legacy_code → UUID)
const idMaps = {
  categories: {},    // code → uuid
  brands: {},        // code → uuid
  items: {},         // code → uuid
  technicians: {},   // code → uuid
  orders: {},        // number → uuid
  purchaseOrders: {} // number → uuid
};

// ============================================================
// HELPERS
// ============================================================
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
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  return null;
}

function cleanBool(val) {
  return val === true || val === 'T' || val === 't' || val === 1;
}

async function readDBF(filename) {
  const filepath = path.join(BACKUP_DIR, filename);
  try {
    const dbf = await DBFFile.open(filepath, { encoding: 'latin1' });
    const records = await dbf.readRecords(dbf.recordCount);
    console.log(`  📄 ${filename}: ${records.length} registros lidos`);
    return records;
  } catch (err) {
    console.error(`  ❌ Erro ao ler ${filename}: ${err.message}`);
    return [];
  }
}

async function insertBatch(table, data, batchSize = 50) {
  if (data.length === 0) {
    console.log(`  ⏭️  ${table}: Nenhum dado para inserir`);
    return [];
  }

  const allResults = [];
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const { data: result, error } = await supabase.from(table).insert(batch).select('id');

    if (error) {
      console.error(`  ❌ Erro ao inserir em ${table} (batch ${Math.floor(i/batchSize)+1}): ${error.message}`);
      // Tentar um por um para identificar o registro problemático
      for (const item of batch) {
        const { data: single, error: singleErr } = await supabase.from(table).insert(item).select('id');
        if (singleErr) {
          console.error(`    ❌ Registro falhou: ${JSON.stringify(item).slice(0, 200)}`);
          console.error(`    Erro: ${singleErr.message}`);
        } else if (single) {
          allResults.push(...single);
        }
      }
    } else if (result) {
      allResults.push(...result);
    }

    // Progresso
    const pct = Math.min(100, Math.round(((i + batch.length) / data.length) * 100));
    process.stdout.write(`\r  📊 ${table}: ${pct}% (${Math.min(i + batchSize, data.length)}/${data.length})`);
  }
  console.log(`\n  ✅ ${table}: ${allResults.length} registros inseridos`);
  return allResults;
}

// ============================================================
// MIGRAÇÕES
// ============================================================

async function migrateCategories() {
  console.log('\n📂 Migrando CATEGORIAS (GRUPOS.DBF)...');
  const records = await readDBF('GRUPOS.DBF');

  const data = records.map(r => ({
    code: r.CODIGO,
    name: cleanStr(r.DESCRICAO),
    margin_1: cleanNum(r.MARGEM1),
    margin_2: cleanNum(r.MARGEM2),
    margin_3: cleanNum(r.MARGEM3),
    notes: [cleanStr(r.OBS1), cleanStr(r.OBS2), cleanStr(r.OBS3), cleanStr(r.OBS4)]
      .filter(Boolean).join(' | ') || null,
    active: true
  })).filter(r => r.name);

  const results = await insertBatch('inventory_categories', data);

  // Mapear code → uuid
  if (results.length > 0) {
    const { data: all } = await supabase.from('inventory_categories').select('id, code');
    if (all) {
      all.forEach(r => { idMaps.categories[r.code] = r.id; });
    }
  }
}

async function migrateBrands() {
  console.log('\n🏷️  Migrando MARCAS DE PRODUTOS (MARCA.DBF)...');
  const records = await readDBF('MARCA.DBF');

  const data = records.map(r => ({
    code: r.CODIGO,
    name: cleanStr(r.MARCA),
    active: true
  })).filter(r => r.name);

  const results = await insertBatch('inventory_brands', data);

  if (results.length > 0) {
    const { data: all } = await supabase.from('inventory_brands').select('id, code');
    if (all) {
      all.forEach(r => { idMaps.brands[r.code] = r.id; });
    }
  }
}

async function migrateEquipmentBrands() {
  console.log('\n🚜 Migrando MARCAS DE EQUIPAMENTOS (MARCAS.DBF)...');
  const records = await readDBF('MARCAS.DBF');

  // MARCAS.DBF tem estrutura diferente - vamos verificar os campos
  if (records.length > 0) {
    const firstRec = records[0];
    const fields = Object.keys(firstRec);
    console.log(`  Campos: ${fields.join(', ')}`);
  }

  const data = records.map((r, i) => ({
    code: r.CODIGO || i + 1,
    name: cleanStr(r.MARCA || r.DESCRICAO || r.NOM || ''),
    active: true
  })).filter(r => r.name);

  await insertBatch('equipment_brands', data);
}

async function migrateTechnicians() {
  console.log('\n👨‍🔧 Migrando TÉCNICOS/MECÂNICOS (TECNICO.DBF)...');
  const records = await readDBF('TECNICO.DBF');

  const data = records.map(r => ({
    code: r.COD,
    name: cleanStr(r.NOM),
    is_technician: cleanBool(r.TECNICO),
    is_mechanic: cleanBool(r.MECANICO),
    is_seller: cleanBool(r.VENDEDOR),
    is_attendant: cleanBool(r.ATENDENTE),
    commission_percent: cleanNum(r.COMISSAO),
    commission_on_products: cleanBool(r.COMI_PROD),
    commission_on_services: cleanBool(r.COMI_SERV),
    phone: cleanStr(r.TEL1),
    cell_phone: cleanStr(r.CEL),
    email: cleanStr(r.EMAIL),
    cpf: cleanStr(r.CPF),
    is_active: !cleanBool(r.INATIVO),
    is_blocked: cleanBool(r.BLOQUEAR),
    total_sales: cleanNum(r.MAIS_VEND),
    total_qty: cleanNum(r.MAIS_QUAN, 3),
    revenue: cleanNum(r.RECEITA),
    legacy_code: r.COD
  })).filter(r => r.name);

  const results = await insertBatch('technicians', data);

  if (results.length > 0) {
    const { data: all } = await supabase.from('technicians').select('id, code');
    if (all) {
      all.forEach(r => { idMaps.technicians[r.code] = r.id; });
    }
  }
}

async function migrateProducts() {
  console.log('\n📦 Migrando PRODUTOS (PRODUTOS.DBF) - 1.881 registros...');
  const records = await readDBF('PRODUTOS.DBF');

  const data = records.map(r => ({
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

  const results = await insertBatch('inventory_items', data, 30);

  if (results.length > 0) {
    const { data: all } = await supabase.from('inventory_items').select('id, code');
    if (all) {
      all.forEach(r => { idMaps.items[r.code] = r.id; });
    }
  }
}

async function migrateSuppliers() {
  console.log('\n🏭 Migrando FORNECEDORES (FORNECE.DBF) para entities...');
  const records = await readDBF('FORNECE.DBF');

  // Verificar fornecedores que já existem na tabela entities
  const { data: existing } = await supabase.from('entities').select('id, name, document');

  const data = records.map(r => ({
    is_supplier: true,
    is_client: false,
    type: cleanStr(r.CGC) ? 'PJ' : 'PF',
    name: cleanStr(r.NOM),
    document: cleanStr(r.CGC) || cleanStr(r.CPF) || null,
    state_registration: cleanStr(r.IE) || null,
    email: cleanStr(r.EMAIL) || null,
    phone: cleanStr(r.TEL1) || null,
    street: cleanStr(r.RUA) || null,
    neighborhood: cleanStr(r.BAI) || null,
    city: cleanStr(r.CID) || null,
    state: cleanStr(r.UF) || null,
    zip_code: cleanStr(r.CEP) || null,
    supplier_category: cleanStr(r.TIPO) || null,
    notes: [cleanStr(r.OBS1), cleanStr(r.OBS2), cleanStr(r.OBS3)].filter(Boolean).join(' | ') || null,
    active: true
  })).filter(r => r.name);

  // Evitar duplicatas por nome
  const existingNames = new Set((existing || []).map(e => e.name?.toUpperCase()));
  const newData = data.filter(d => !existingNames.has(d.name?.toUpperCase()));

  if (newData.length > 0) {
    await insertBatch('entities', newData, 30);
  } else {
    console.log('  ⏭️  Todos os fornecedores já existem na tabela entities');
  }
}

async function migrateServiceOrders() {
  console.log('\n🔧 Migrando ORDENS DE SERVIÇO (ORDEM.DBF + ORDEM3.DBF)...');

  const ordemRecords = await readDBF('ORDEM.DBF');

  // Ler ORDEM3 para checklist e memo fields
  let ordem3Map = {};
  try {
    const ordem3Records = await readDBF('ORDEM3.DBF');
    ordem3Records.forEach(r => {
      ordem3Map[r.NUMERO] = r;
    });
  } catch (e) {
    console.log('  ⚠️  ORDEM3.DBF não pôde ser lido (memos). Continuando sem checklist.');
  }

  const data = ordemRecords.map(r => {
    const o3 = ordem3Map[r.NUMERO] || {};

    // Montar checklist do ORDEM3 (C1..C24 = labels, P1..P24 = checked)
    const checklist = [];
    for (let i = 1; i <= 24; i++) {
      const label = cleanStr(o3[`C${i}`]);
      const checked = cleanBool(o3[`P${i}`]);
      if (label) {
        checklist.push({ label, checked });
      }
    }

    // Concatenar observações
    const obs = [];
    for (let i = 1; i <= 8; i++) {
      const o = cleanStr(r[`OBS${i}`]);
      if (o) obs.push(o);
    }

    return {
      order_number: r.NUMERO,
      is_order: cleanBool(r.ORDEM),
      is_quote: cleanBool(r.ORCAMENTO),
      is_call: cleanBool(r.CHAMADO),
      entry_date: cleanDate(r.DATAENT),
      entry_time: cleanStr(r.HORAENT) || null,
      exit_date: cleanDate(r.DATASAI),
      exit_time: cleanStr(r.HORASAI) || null,
      client_code: r.CODCLI,
      client_name: cleanStr(r.CLIENTE),
      client_contact: cleanStr(r.CONTATO) || null,
      client_phone: cleanStr(r.TELEFONE) || null,
      client_whatsapp: cleanStr(r.WHATSAPP) || null,
      equipment_code: r.CODEQUI,
      equipment_name: cleanStr(r.EQUIPA) || null,
      model_code: r.CODMOD,
      model_name: cleanStr(r.MODELO) || null,
      brand_code: r.CODMAR,
      brand_name: cleanStr(r.MARCA) || null,
      plate: cleanStr(r.PLACA) || null,
      color: cleanStr(r.COR) || null,
      km: r.KM || 0,
      year_fab: r.ANO || null,
      year_model: r.ANOMOD || null,
      fuel_type: cleanStr(r.COMB) || null,
      serial_number: cleanStr(r.SERIE) || null,
      accessories: cleanStr(r.ACESSORIOS) || null,
      situation_code: r.CODSIT,
      situation: cleanStr(r.SITUACAO) || null,
      defect_1: cleanStr(r.DEFEITO1) || null,
      defect_2: cleanStr(r.DEFEITO2) || null,
      service_1: cleanStr(r.SERVICO1) || null,
      service_2: cleanStr(r.SERVICO2) || null,
      service_3: cleanStr(r.SERVICO3) || null,
      service_4: cleanStr(r.SERVICO4) || null,
      service_5: cleanStr(r.SERVICO5) || null,
      technician_code: r.CODTEC,
      technician_name: cleanStr(r.TECNICO) || null,
      responsible: cleanStr(r.RESPONSA) || null,
      products_value: cleanNum(r.VLRPROD),
      services_value: cleanNum(r.VLRSERV),
      labor_value: cleanNum(r.MAO_OBRA),
      displacement_value: cleanNum(r.DESLOCA),
      discount_value: cleanNum(r.DESCONTO),
      total_value: cleanNum(r.TOTAL),
      payment_form: cleanStr(r.FORMA) || null,
      payment_conditions: cleanStr(r.CONDICOES) || null,
      is_paid: cleanBool(r.PAGO),
      observations: obs.join('\n') || null,
      defect_memo: cleanStr(o3.DEFEITO) || null,
      findings_memo: cleanStr(o3.CONSTA) || null,
      service_memo: cleanStr(o3.SERVICO) || null,
      general_notes_memo: cleanStr(o3.OBSGERAL) || null,
      photo_1_url: cleanStr(o3.FOTO1) || null,
      photo_2_url: cleanStr(o3.FOTO2) || null,
      photo_3_url: cleanStr(o3.FOTO3) || null,
      photo_4_url: cleanStr(o3.FOTO4) || null,
      photo_model_url: cleanStr(o3.FOTOMODELO) || null,
      checklist: checklist.length > 0 ? JSON.stringify(checklist) : '[]',
      checklist_fuel: cleanStr(o3.CH_COMB) || null,
      checklist_tire_front: cleanStr(o3.CH_PNEU_T) || null,
      checklist_tire_right: cleanStr(o3.CH_PNEU_D) || null,
      checklist_tire_left: cleanStr(o3.CH_PNEU_E) || null,
      checklist_oil: cleanStr(o3.CH_OLEO) || null,
      checklist_radiator: cleanStr(o3.CH_RADIA) || null,
      has_checklist: cleanBool(r.ATIVACHECK),
      print_checklist: cleanBool(r.IMPCHECK),
      status: cleanBool(r.STATUS),
      control: cleanStr(r.CONTROLE) || null,
      cancel_reason: cleanStr(r.MOTIVO) || null,
      user_code: r.CODUSU,
      user_name: cleanStr(r.USUARIO) || null,
      legacy_number: r.NUMERO
    };
  });

  const results = await insertBatch('service_orders', data, 20);

  if (results.length > 0) {
    const { data: all } = await supabase.from('service_orders').select('id, order_number');
    if (all) {
      all.forEach(r => { idMaps.orders[r.order_number] = r.id; });
    }
  }
}

async function migrateServiceOrderItems() {
  console.log('\n📋 Migrando ITENS DAS OS (ORDEM2.DBF)...');
  const records = await readDBF('ORDEM2.DBF');

  const data = records.map(r => ({
    service_order_id: idMaps.orders[r.NUMERO] || null,
    order_number: r.NUMERO,
    item_id: idMaps.items[r.CODPRO] || null,
    product_code: r.CODPRO,
    description: cleanStr(r.DESCRICAO),
    reference: cleanStr(r.REFERENCIA) || null,
    is_service: cleanBool(r.SERVICO),
    is_product: cleanBool(r.PRODUTO),
    unit: cleanStr(r.UNIDADE) || 'UNI',
    unit_cost: cleanNum(r.CUSTO, 4),
    unit_price: cleanNum(r.VALOR, 4),
    quantity: cleanNum(r.QUANTIA, 3),
    discount: cleanNum(r.DESCONTO),
    discount_percent: cleanNum(r.DESCONTOP),
    total: cleanNum(r.TOTAL),
    commission: cleanNum(r.COMPRO),
    commission_product: cleanNum(r.COMPRO_PRO),
    technician_code: r.CODTEC,
    technician_name: cleanStr(r.TECNICO) || null,
    client_code: r.CODCLI,
    client_name: cleanStr(r.CLIENTE) || null,
    plate: cleanStr(r.PLACA) || null,
    model_name: cleanStr(r.MODELO) || null,
    brand_name: cleanStr(r.MARCA) || null,
    item_date: cleanDate(r.DATA),
    delivery_date: cleanDate(r.ENTREGA),
    status: cleanBool(r.STATUS),
    control: cleanStr(r.CONTROLE) || null,
    user_code: r.CODUSU,
    user_name: cleanStr(r.USUARIO) || null
  })).filter(r => r.description);

  await insertBatch('service_order_items', data, 30);
}

async function migratePurchaseOrders() {
  console.log('\n🛒 Migrando PEDIDOS DE COMPRA (COMPRA.DBF)...');
  const records = await readDBF('COMPRA.DBF');

  const data = records.map(r => ({
    order_number: r.NUMERO,
    is_order: cleanBool(r.PEDIDO),
    is_quote: cleanBool(r.ORCAMENTO),
    order_date: cleanDate(r.DATA),
    order_time: cleanStr(r.HORA) || null,
    delivery_date: cleanDate(r.DATASAI),
    delivery_time: cleanStr(r.HORASAI) || null,
    supplier_code: r.CODFOR,
    supplier_name: cleanStr(r.FORNECEDOR) || null,
    supplier_contact: cleanStr(r.CONTATO) || null,
    supplier_phone: cleanStr(r.TELEFONE) || null,
    situation_code: r.CODSIT,
    situation: cleanStr(r.SITUACAO) || null,
    technician_code: r.CODTEC,
    technician_name: cleanStr(r.TECNICO) || null,
    items_count: r.ITENS || 0,
    total_qty: cleanNum(r.QUANTIA, 3),
    products_value: cleanNum(r.VLRPROD),
    other_costs: cleanNum(r.OUTROS),
    discount: cleanNum(r.DESCONTO),
    total_value: cleanNum(r.TOTAL),
    payment_form: cleanStr(r.FORMA) || null,
    payment_conditions: cleanStr(r.CONDICOES) || null,
    is_paid: cleanBool(r.PAGO),
    invoice_number: r.NF || null,
    invoice_date: cleanDate(r.DATANF),
    observations: cleanStr(r.OBS1) || null,
    cancel_reason: cleanStr(r.MOTIVO) || null,
    status: cleanBool(r.STATUS),
    control: cleanStr(r.CONTROLE) || null,
    user_code: r.CODUSU,
    user_name: cleanStr(r.USUARIO) || null,
    legacy_number: r.NUMERO
  }));

  const results = await insertBatch('purchase_orders', data, 30);

  if (results.length > 0) {
    const { data: all } = await supabase.from('purchase_orders').select('id, order_number');
    if (all) {
      all.forEach(r => { idMaps.purchaseOrders[r.order_number] = r.id; });
    }
  }
}

async function migratePurchaseOrderItems() {
  console.log('\n📋 Migrando ITENS DOS PEDIDOS DE COMPRA (COMPRA2.DBF)...');
  const records = await readDBF('COMPRA2.DBF');

  const data = records.map(r => ({
    purchase_order_id: idMaps.purchaseOrders[r.NUMERO] || null,
    order_number: r.NUMERO,
    item_id: idMaps.items[r.CODPRO] || null,
    product_code: r.CODPRO,
    description: cleanStr(r.DESCRICAO),
    reference: cleanStr(r.REFERENCIA) || null,
    barcode: cleanStr(r.BARRA) || null,
    is_product: cleanBool(r.PRODUTO),
    unit: cleanStr(r.UNIDADE) || 'UNI',
    unit_cost: cleanNum(r.CUSTO, 4),
    unit_price: cleanNum(r.VALOR, 4),
    quantity: cleanNum(r.QUANTIA, 3),
    discount: cleanNum(r.DESCONTO),
    discount_percent: cleanNum(r.DESCONTOP),
    total: cleanNum(r.TOTAL),
    delivery_date: cleanDate(r.DATA_ENTRE),
    delivery_time: cleanStr(r.HORA_ENTRE) || null,
    shortage: cleanNum(r.FALTAS, 3),
    supplier_code: r.CODFOR,
    supplier_name: cleanStr(r.FORNECEDOR) || null,
    status: cleanBool(r.STATUS),
    notes: cleanStr(r.OBS) || null
  })).filter(r => r.description);

  await insertBatch('purchase_order_items', data, 30);
}

async function migrateSupplierProducts() {
  console.log('\n🔗 Migrando FORNECEDOR x PRODUTO (FORPRO.DBF)...');
  const records = await readDBF('FORPRO.DBF');

  const data = [];
  for (const r of records) {
    const itemId = idMaps.items[r.CODIGO] || null;

    // Até 3 fornecedores por produto
    for (let i = 1; i <= 3; i++) {
      const name = cleanStr(r[`FORNECE${i}`]);
      if (name) {
        data.push({
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

  await insertBatch('inventory_supplier_products', data, 30);
}

// ============================================================
// EXECUÇÃO PRINCIPAL
// ============================================================
async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  TERRAPRO ERP - Migração OS Oficina → Supabase  ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Supabase URL: ${SUPABASE_URL?.slice(0, 40)}...`);
  console.log(`║  Backup Dir:   ${BACKUP_DIR.slice(-50)}`);
  console.log('╚══════════════════════════════════════════════════╝');

  const startTime = Date.now();

  try {
    // Ordem importa! Tabelas referenciadas primeiro.

    // 1. Tabelas de referência (sem FK)
    await migrateCategories();
    await migrateBrands();
    await migrateEquipmentBrands();
    await migrateTechnicians();

    // 2. Fornecedores → entities
    await migrateSuppliers();

    // 3. Produtos (depende de categorias e marcas)
    await migrateProducts();

    // 4. Ordens de Serviço
    await migrateServiceOrders();
    await migrateServiceOrderItems();

    // 5. Pedidos de Compra
    await migratePurchaseOrders();
    await migratePurchaseOrderItems();

    // 6. Fornecedor x Produto
    await migrateSupplierProducts();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║           ✅ MIGRAÇÃO CONCLUÍDA!                ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  Tempo total: ${elapsed}s`);
    console.log(`║  Categorias:  ${Object.keys(idMaps.categories).length}`);
    console.log(`║  Marcas:      ${Object.keys(idMaps.brands).length}`);
    console.log(`║  Técnicos:    ${Object.keys(idMaps.technicians).length}`);
    console.log(`║  Produtos:    ${Object.keys(idMaps.items).length}`);
    console.log(`║  OS:          ${Object.keys(idMaps.orders).length}`);
    console.log(`║  Compras:     ${Object.keys(idMaps.purchaseOrders).length}`);
    console.log('╚══════════════════════════════════════════════════╝');

  } catch (err) {
    console.error('\n❌ ERRO FATAL:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
