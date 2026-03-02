/**
 * Backfill centro_custo_id nos lançamentos financeiros a partir do TGA FLAN.CCUSTO
 *
 * Mapeia CCUSTO (código hierárquico ex: "1.01.001") → centros_custo.tga_code → UUID
 * Apenas ~6% dos lançamentos TGA têm CCUSTO preenchido.
 *
 * Uso: SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-centro-custo.mjs [--dry-run]
 */
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

const SUPABASE_URL = 'https://xpufmosdhhemcubzswcv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.argv.includes('--dry-run');

if (!SUPABASE_SERVICE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function fbQuery(sql) {
  const cmd = `docker exec -i firebird-tga /usr/local/firebird/bin/isql -user SYSDBA -password masterkey /firebird/data/tga.fdb`;
  const input = `SET HEADING OFF;\nSET LIST OFF;\nSET COUNT OFF;\n${sql}`;
  return execSync(cmd, { input, encoding: 'latin1', maxBuffer: 50 * 1024 * 1024 });
}

// ─── 1. Carregar centros de custo do Supabase ──────────────
console.log('1. Carregando centros de custo do Supabase...');
const { data: centrosCusto } = await supabase
  .from('centros_custo')
  .select('id, tga_code, nome')
  .eq('ativo', true)
  .not('tga_code', 'is', null);

const ccMap = new Map(); // tga_code → UUID
for (const cc of centrosCusto || []) {
  ccMap.set(cc.tga_code, cc.id);
}
console.log(`  ${ccMap.size} centros de custo com tga_code`);

// ─── 2. Extrair FLAN com CCUSTO do TGA ─────────────────────
console.log('\n2. Extraindo FLAN com CCUSTO do TGA...');
const raw = fbQuery(`
  SELECT IDLAN || '||' || TRIM(CCUSTO)
  FROM FLAN
  WHERE CODEMPRESA = 1 AND CCUSTO IS NOT NULL
  ORDER BY IDLAN;
`);

const lines = raw.split('\n').filter(l => l.includes('||'));
console.log(`  ${lines.length} lançamentos com CCUSTO no TGA`);

// ─── 3. Parsear mapa IDLAN → centro_custo_id ───────────────
const idlanToCC = new Map(); // IDLAN → centro_custo_id (UUID)
let unmapped = 0;
for (const line of lines) {
  const [idlanStr, ccusto] = line.trim().split('||').map(s => s.trim());
  const idlan = parseInt(idlanStr);
  if (!idlan || !ccusto) continue;

  const ccId = ccMap.get(ccusto);
  if (ccId) {
    idlanToCC.set(idlan, ccId);
  } else {
    unmapped++;
  }
}
console.log(`  ${idlanToCC.size} mapeados, ${unmapped} sem correspondência no Supabase`);

if (DRY_RUN) {
  console.log('\n[DRY RUN] Nenhum dado alterado.');
  process.exit(0);
}

// ─── 4. Atualizar contas_receber ────────────────────────────
console.log('\n3. Atualizando contas_receber...');
let crUpdated = 0, crErrors = 0;
let offset = 0;
const PAGE = 1000;

while (true) {
  const { data: records } = await supabase
    .from('contas_receber')
    .select('id, numero_titulo')
    .is('centro_custo_id', null)
    .range(offset, offset + PAGE - 1);

  if (!records || records.length === 0) break;

  const updates = [];
  for (const r of records) {
    // Extrair IDLAN do numero_titulo: TGA-CR-000123 → 123
    const match = r.numero_titulo?.match(/TGA-CR-(\d+)/);
    if (!match) continue;
    const idlan = parseInt(match[1]);
    const ccId = idlanToCC.get(idlan);
    if (ccId) {
      updates.push({ id: r.id, centro_custo_id: ccId });
    }
  }

  // Batch update
  for (const u of updates) {
    const { error } = await supabase
      .from('contas_receber')
      .update({ centro_custo_id: u.centro_custo_id })
      .eq('id', u.id);
    if (error) crErrors++;
    else crUpdated++;
  }

  if (records.length < PAGE) break;
  offset += PAGE;
  if (offset % 10000 === 0) console.log(`  Processados ${offset}...`);
}
console.log(`  contas_receber: ${crUpdated} atualizados, ${crErrors} erros`);

// ─── 5. Atualizar contas_pagar ──────────────────────────────
console.log('\n4. Atualizando contas_pagar...');
let cpUpdated = 0, cpErrors = 0;
offset = 0;

while (true) {
  const { data: records } = await supabase
    .from('contas_pagar')
    .select('id, numero_titulo')
    .is('centro_custo_id', null)
    .range(offset, offset + PAGE - 1);

  if (!records || records.length === 0) break;

  const updates = [];
  for (const r of records) {
    const match = r.numero_titulo?.match(/TGA-CP-(\d+)/);
    if (!match) continue;
    const idlan = parseInt(match[1]);
    const ccId = idlanToCC.get(idlan);
    if (ccId) {
      updates.push({ id: r.id, centro_custo_id: ccId });
    }
  }

  for (const u of updates) {
    const { error } = await supabase
      .from('contas_pagar')
      .update({ centro_custo_id: u.centro_custo_id })
      .eq('id', u.id);
    if (error) cpErrors++;
    else cpUpdated++;
  }

  if (records.length < PAGE) break;
  offset += PAGE;
  if (offset % 10000 === 0) console.log(`  Processados ${offset}...`);
}
console.log(`  contas_pagar: ${cpUpdated} atualizados, ${cpErrors} erros`);

// ─── 6. Verificação ─────────────────────────────────────────
console.log('\n5. Verificação final...');
const { count: crCC } = await supabase.from('contas_receber').select('*', { count: 'exact', head: true }).not('centro_custo_id', 'is', null);
const { count: cpCC } = await supabase.from('contas_pagar').select('*', { count: 'exact', head: true }).not('centro_custo_id', 'is', null);
console.log(`  contas_receber com centro_custo: ${crCC}`);
console.log(`  contas_pagar com centro_custo: ${cpCC}`);
console.log('\nBackfill concluído!');
