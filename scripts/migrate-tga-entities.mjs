/**
 * Migração TGA (Firebird) → TerraPro ERP (Supabase)
 *
 * Importa clientes, fornecedores e contatos do sistema TGA
 * para a tabela `entities` do Supabase.
 *
 * Uso: node scripts/migrate-tga-entities.mjs [--dry-run] [--limit N]
 */
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

// ─── Config ─────────────────────────────────────────────────
const SUPABASE_URL = 'https://xpufmosdhhemcubzswcv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = process.argv.includes('--limit')
  ? parseInt(process.argv[process.argv.indexOf('--limit') + 1])
  : null;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Set SUPABASE_SERVICE_ROLE_KEY env var');
  console.error('   export SUPABASE_SERVICE_ROLE_KEY="eyJ..."');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Firebird helpers ───────────────────────────────────────
function fbQuery(sql) {
  const cmd = `docker exec -i firebird-tga /usr/local/firebird/bin/isql -user SYSDBA -password masterkey /firebird/data/tga.fdb`;
  const input = `SET HEADING OFF;\nSET LIST OFF;\nSET COUNT OFF;\nSET BLOB ALL;\n${sql}`;
  const result = execSync(cmd, { input, encoding: 'latin1', maxBuffer: 50 * 1024 * 1024 });
  return result;
}

function parseDelimited(raw, fieldCount) {
  const lines = raw.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && l.includes('||'));

  return lines.map(line => {
    const parts = line.split('||');
    // Pad or trim to expected field count
    while (parts.length < fieldCount) parts.push('');
    return parts.map(p => p.trim());
  });
}

// ─── Extract from Firebird ──────────────────────────────────
console.log('📥 Extraindo dados do TGA (Firebird)...');

const fcfoRaw = fbQuery(`
SELECT
  TRIM(CODCFO) || '||' ||
  TRIM(TIPO) || '||' ||
  TRIM(COALESCE(PESSOAFISJUR,'')) || '||' ||
  TRIM(COALESCE(NOME,'')) || '||' ||
  TRIM(COALESCE(NOMEFANTASIA,'')) || '||' ||
  TRIM(COALESCE(CGCCFO,'')) || '||' ||
  TRIM(COALESCE(INSCRESTADUAL,'')) || '||' ||
  TRIM(COALESCE(INSCRMUNICIPAL,'')) || '||' ||
  TRIM(COALESCE(RUA,'')) || '||' ||
  TRIM(COALESCE(NUMERO,'')) || '||' ||
  TRIM(COALESCE(COMPLEMENTO,'')) || '||' ||
  TRIM(COALESCE(BAIRRO,'')) || '||' ||
  TRIM(COALESCE(CIDADE,'')) || '||' ||
  TRIM(COALESCE(CODETD,'')) || '||' ||
  TRIM(COALESCE(CEP,'')) || '||' ||
  TRIM(COALESCE(TELEFONE,'')) || '||' ||
  TRIM(COALESCE(TELEFONE2,'')) || '||' ||
  TRIM(COALESCE(EMAIL,'')) || '||' ||
  TRIM(COALESCE(HOMEPAGE,'')) || '||' ||
  TRIM(COALESCE(CONTATO,'')) || '||' ||
  CAST(COALESCE(LIMITECREDITO,0) AS VARCHAR(20)) || '||' ||
  COALESCE(CAST(DATANASC AS VARCHAR(10)),'') || '||' ||
  TRIM(COALESCE(ATIVO,'F')) || '||' ||
  COALESCE(CAST(DATACRIACAO AS VARCHAR(24)),'') || '||' ||
  COALESCE(CAST(DATAULTMOVIMENTO AS VARCHAR(24)),'') || '||' ||
  TRIM(COALESCE(RUAENTREGA,'')) || '||' ||
  TRIM(COALESCE(NUMEROENTREGA,'')) || '||' ||
  TRIM(COALESCE(COMPLEMENTREGA,'')) || '||' ||
  TRIM(COALESCE(BAIRROENTREGA,'')) || '||' ||
  TRIM(COALESCE(CIDADEENTREGA,'')) || '||' ||
  TRIM(COALESCE(CODETDENTREGA,'')) || '||' ||
  TRIM(COALESCE(CEPENTREGA,'')) || '||' ||
  TRIM(COALESCE(TELEFONEENTREGA,'')) || '||' ||
  TRIM(COALESCE(PRODUTORRURAL,'F'))
FROM FCFO
ORDER BY CODCFO;
`);

const fcfoRows = parseDelimited(fcfoRaw, 34);
console.log(`  FCFO: ${fcfoRows.length} registros`);

// ─── Contatos PJ ────────────────────────────────────────────
const contatosRaw = fbQuery(`
SELECT
  TRIM(CODCFO) || '||' ||
  TRIM(COALESCE(NOME,'')) || '||' ||
  TRIM(COALESCE(CARGO,'')) || '||' ||
  TRIM(COALESCE(DEPARTAMENTO,'')) || '||' ||
  TRIM(COALESCE(TELEFONE,'')) || '||' ||
  TRIM(COALESCE(EMAIL,'')) || '||' ||
  TRIM(COALESCE(TELEFONE2,''))
FROM FCFOCONTATOPJ
ORDER BY CODCFO;
`);

const contatoRows = parseDelimited(contatosRaw, 7);
console.log(`  Contatos PJ: ${contatoRows.length} registros`);

// Build contacts map: codcfo -> [{name, role, email, phone}]
const contactsMap = new Map();
for (const [codcfo, nome, cargo, depto, tel, email, tel2] of contatoRows) {
  if (!nome) continue;
  if (!contactsMap.has(codcfo)) contactsMap.set(codcfo, []);
  const contact = { name: nome };
  if (cargo) contact.role = cargo;
  else if (depto) contact.role = depto;
  else contact.role = 'Contato';
  if (email) contact.email = email;
  if (tel) contact.phone = tel;
  else if (tel2) contact.phone = tel2;
  contactsMap.get(codcfo).push(contact);
}

// ─── Observações ────────────────────────────────────────────
const obsRaw = fbQuery(`
SELECT
  TRIM(CODCFO) || '||' ||
  COALESCE(CAST(OBSERVACAO AS VARCHAR(2000)),'')
FROM FCFOOBS
ORDER BY CODCFO;
`);

const obsMap = new Map();
for (const line of obsRaw.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || !trimmed.includes('||')) continue;
  const idx = trimmed.indexOf('||');
  const codcfo = trimmed.substring(0, idx).trim();
  const obs = trimmed.substring(idx + 2).trim();
  // Filtrar obs que são apenas códigos de referência (ex: "C04481")
  if (obs && obs.length > 5 && !/^[CF]\d{4,6}$/.test(obs)) {
    // Remover o código de referência do início se houver texto real depois
    const cleaned = obs.replace(/^[CF]\d{4,6}\s*/i, '').trim();
    if (cleaned.length > 3) {
      obsMap.set(codcfo, cleaned);
    }
  }
}
console.log(`  Observações: ${obsMap.size} com conteúdo`);

// ─── Transform ──────────────────────────────────────────────
console.log('\n🔄 Transformando dados...');

function cleanDoc(doc) {
  if (!doc) return null;
  const clean = doc.replace(/[.\-\/\s]/g, '');
  if (clean === '00000000000' || clean === '00000000000000' || clean.length < 11) return null;
  return doc; // Keep formatted
}

function cleanCep(cep) {
  if (!cep) return null;
  const clean = cep.replace(/\D/g, '');
  if (clean.length < 8) return null;
  return `${clean.substring(0, 5)}-${clean.substring(5, 8)}`;
}

function cleanPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return null; // Telefones com menos de 8 dígitos são inválidos
  return phone;
}

function parseDate(d) {
  if (!d || d.includes('1900')) return null;
  const dateStr = d.split(' ')[0]; // "2021-06-05" from "2021-06-05 00:00:00.0000"
  if (dateStr.length < 10) return null;
  return dateStr;
}

function parseTimestamp(d) {
  if (!d || d.includes('1900')) return null;
  return d.replace('.0000', '');
}

// Dedup by document - merge C+F into is_client+is_supplier
const byDocument = new Map();
const noDocument = [];

for (const row of fcfoRows) {
  const [
    codcfo, tipo, pf, nome, fantasia, documento, ie, im,
    rua, numero, complemento, bairro, cidade, uf, cep,
    telefone, telefone2, email, homepage, contato,
    limitecredito, datanasc, ativo, datacriacao, dataultmov,
    ruaEnt, numEnt, complEnt, bairroEnt, cidadeEnt, ufEnt, cepEnt, telEnt,
    prodRural
  ] = row;

  const doc = cleanDoc(documento);
  const entity = {
    legacy_code: codcfo,
    is_client: tipo === 'C' || tipo === 'A',
    is_supplier: tipo === 'F' || tipo === 'A',
    type: pf === 'J' ? 'PJ' : 'PF',
    name: fantasia || nome || 'SEM NOME',
    social_reason: pf === 'J' && nome !== fantasia ? nome : null,
    document: doc,
    state_registration: ie || null,
    municipal_registration: im || null,
    birth_date: parseDate(datanasc),
    credit_limit: parseFloat(limitecredito) || 0,
    email: email || null,
    phone: cleanPhone(telefone),
    phone2: cleanPhone(telefone2),
    website: homepage || null,
    zip_code: cleanCep(cep),
    street: rua || null,
    number: numero || null,
    complement: complemento || null,
    neighborhood: bairro || null,
    city: cidade || null,
    state: uf || null,
    delivery_zip_code: cleanCep(cepEnt),
    delivery_street: ruaEnt || null,
    delivery_number: numEnt || null,
    delivery_complement: complEnt || null,
    delivery_neighborhood: bairroEnt || null,
    delivery_city: cidadeEnt || null,
    delivery_state: ufEnt || null,
    is_rural_producer: prodRural === 'T',
    last_purchase_date: parseDate(dataultmov),
    active: ativo === 'T',
    contacts: contactsMap.get(codcfo) || [],
    notes: obsMap.get(codcfo) || null,
    created_at: parseTimestamp(datacriacao) || new Date().toISOString(),
  };

  // Merge contact from FCFO.CONTATO into contacts array
  if (contato) {
    entity.contacts.unshift({ name: contato, role: 'Contato Principal' });
  }

  if (doc && byDocument.has(doc)) {
    // Merge: same document, different role (C vs F)
    const existing = byDocument.get(doc);
    if (entity.is_client) existing.is_client = true;
    if (entity.is_supplier) existing.is_supplier = true;
    if (entity.credit_limit > existing.credit_limit) existing.credit_limit = entity.credit_limit;
    if (entity.email && !existing.email) existing.email = entity.email;
    if (entity.phone && !existing.phone) existing.phone = entity.phone;
    if (entity.phone2 && !existing.phone2) existing.phone2 = entity.phone2;
    if (entity.notes && !existing.notes) existing.notes = entity.notes;
    if (entity.contacts.length > 0) {
      existing.contacts = [...existing.contacts, ...entity.contacts];
    }
    // Keep the newer legacy_code as secondary
    existing.legacy_code = `${existing.legacy_code},${entity.legacy_code}`;
  } else if (doc) {
    byDocument.set(doc, entity);
  } else {
    noDocument.push(entity);
  }
}

const allEntities = [...byDocument.values(), ...noDocument];
console.log(`  Entidades únicas: ${allEntities.length} (${byDocument.size} com doc + ${noDocument.length} sem doc)`);
console.log(`  Merges por duplicata: ${fcfoRows.length - allEntities.length}`);

// ─── Stats ──────────────────────────────────────────────────
const stats = {
  total: allEntities.length,
  clients: allEntities.filter(e => e.is_client).length,
  suppliers: allEntities.filter(e => e.is_supplier).length,
  both: allEntities.filter(e => e.is_client && e.is_supplier).length,
  pf: allEntities.filter(e => e.type === 'PF').length,
  pj: allEntities.filter(e => e.type === 'PJ').length,
  withContacts: allEntities.filter(e => e.contacts.length > 0).length,
  withNotes: allEntities.filter(e => e.notes).length,
  withDelivery: allEntities.filter(e => e.delivery_street).length,
  active: allEntities.filter(e => e.active).length,
};

console.log('\n📊 Estatísticas:');
console.log(`  Total: ${stats.total}`);
console.log(`  Clientes: ${stats.clients} | Fornecedores: ${stats.suppliers} | Ambos: ${stats.both}`);
console.log(`  PF: ${stats.pf} | PJ: ${stats.pj}`);
console.log(`  Com contatos: ${stats.withContacts} | Com notas: ${stats.withNotes}`);
console.log(`  Com end. entrega: ${stats.withDelivery} | Ativos: ${stats.active}`);

// ─── Insert into Supabase ───────────────────────────────────
if (DRY_RUN) {
  console.log('\n🔍 DRY RUN - nenhum dado inserido');
  console.log('Amostra (primeiros 3):');
  for (const e of allEntities.slice(0, 3)) {
    console.log(JSON.stringify(e, null, 2));
  }
  process.exit(0);
}

console.log('\n📤 Inserindo no Supabase...');

const BATCH_SIZE = 500;
const toInsert = LIMIT ? allEntities.slice(0, LIMIT) : allEntities;
let inserted = 0;
let errors = 0;

for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
  const batch = toInsert.slice(i, i + BATCH_SIZE).map(e => ({
    ...e,
    contacts: JSON.stringify(e.contacts),
  }));

  const { error } = await supabase.from('entities').insert(batch);

  if (error) {
    console.error(`\n  ❌ Batch ${i}-${i + batch.length}: ${error.message}`);
    // Fallback: insert one by one to find the problematic record
    for (const entity of batch) {
      const { error: err2 } = await supabase.from('entities').insert(entity);
      if (err2) {
        console.error(`    ⚠️ ${entity.legacy_code} (${entity.name}): ${err2.message}`);
        errors++;
      } else {
        inserted++;
      }
    }
  } else {
    inserted += batch.length;
  }

  process.stdout.write(`\r  Progresso: ${Math.min(i + BATCH_SIZE, toInsert.length)}/${toInsert.length}`);
}

console.log(`\n\n✅ Migração concluída!`);
console.log(`  Inseridos: ${inserted}`);
console.log(`  Erros: ${errors}`);
