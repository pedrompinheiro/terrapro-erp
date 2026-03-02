/**
 * Backfill filial_id nos 101k registros financeiros
 *
 * Estratégia:
 * 1. Consultar TGA FLAN: IDLAN → CODFILIAL
 * 2. Consultar companies no Supabase: CODFILIAL → UUID
 * 3. Para cada contas_receber/pagar com numero_titulo TGA-C*-NNNNNN, extrair IDLAN
 * 4. Fazer UPDATE em batch atribuindo filial_id
 *
 * Uso: SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-filial-id.mjs [--dry-run]
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

// ─── Firebird helper ───────────────────────────────────────
function fbQuery(sql) {
  const cmd = `docker exec -i firebird-tga /usr/local/firebird/bin/isql -user SYSDBA -password masterkey /firebird/data/tga.fdb`;
  const input = `SET HEADING OFF;\nSET LIST OFF;\nSET COUNT OFF;\n${sql}`;
  return execSync(cmd, { input, encoding: 'latin1', maxBuffer: 150 * 1024 * 1024 });
}

// ─── 1. Carregar mapa CODFILIAL → company UUID ─────────────
console.log('1. Carregando filiais do Supabase...');
const { data: companies } = await supabase
  .from('companies')
  .select('id, tga_codfilial, short_name')
  .not('tga_codfilial', 'is', null);

if (!companies || companies.length === 0) {
  console.error('Nenhuma filial encontrada com tga_codfilial. Rode o SQL 005 primeiro.');
  process.exit(1);
}

const filialMap = new Map(); // CODFILIAL (number) → UUID
for (const c of companies) {
  filialMap.set(String(c.tga_codfilial), c.id);
  console.log(`  CODFILIAL=${c.tga_codfilial} → ${c.short_name} (${c.id})`);
}

const defaultFilialId = filialMap.get('1'); // Transportadora Terra como fallback

// ─── 2. Carregar mapa IDLAN → CODFILIAL do TGA ────────────
console.log('\n2. Carregando FLAN do TGA (IDLAN → CODFILIAL)...');
const raw = fbQuery(`
  SELECT TRIM(CAST(IDLAN AS VARCHAR(10))) || '||' || TRIM(CAST(CODFILIAL AS VARCHAR(5)))
  FROM FLAN
  WHERE PAGREC IN ('R','P');
`);

const flanMap = new Map(); // IDLAN (string) → CODFILIAL (string)
const lines = raw.split('\n').filter(l => l.includes('||'));
for (const line of lines) {
  const [idlan, codfilial] = line.trim().split('||').map(s => s.trim());
  if (idlan && codfilial) {
    flanMap.set(idlan, codfilial);
  }
}
console.log(`  ${flanMap.size} registros FLAN mapeados`);

// ─── 3. Processar contas_receber ───────────────────────────
console.log('\n3. Atualizando contas_receber...');
await processTable('contas_receber', 'TGA-CR-');

// ─── 4. Processar contas_pagar ─────────────────────────────
console.log('\n4. Atualizando contas_pagar...');
await processTable('contas_pagar', 'TGA-CP-');

async function processTable(table, prefix) {
  const stats = { total: 0, matched: 0, fallback: 0, errors: 0, skipped: 0 };
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('id, numero_titulo, filial_id')
      .is('filial_id', null) // Só registros sem filial
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) { console.error(`  Erro leitura:`, error.message); break; }
    if (!data || data.length === 0) break;

    const updates = [];
    for (const rec of data) {
      stats.total++;

      // Extrair IDLAN do numero_titulo (ex: TGA-CR-000123 → 123)
      if (!rec.numero_titulo?.startsWith(prefix)) {
        // Registro não é migrado do TGA (criado manualmente no ERP)
        updates.push({ id: rec.id, filial_id: defaultFilialId });
        stats.fallback++;
        continue;
      }

      const idlan = String(parseInt(rec.numero_titulo.replace(prefix, ''), 10));
      const codfilial = flanMap.get(idlan);

      if (codfilial && filialMap.has(codfilial)) {
        updates.push({ id: rec.id, filial_id: filialMap.get(codfilial) });
        stats.matched++;
      } else {
        updates.push({ id: rec.id, filial_id: defaultFilialId });
        stats.fallback++;
      }
    }

    // Batch UPDATE
    if (!DRY_RUN && updates.length > 0) {
      // Agrupar por filial_id para fazer updates em bloco
      const byFilial = new Map();
      for (const u of updates) {
        if (!byFilial.has(u.filial_id)) byFilial.set(u.filial_id, []);
        byFilial.get(u.filial_id).push(u.id);
      }

      for (const [filialId, ids] of byFilial) {
        // Supabase limita .in() a ~300 IDs por vez
        for (let i = 0; i < ids.length; i += 300) {
          const batch = ids.slice(i, i + 300);
          const { error: updateErr } = await supabase
            .from(table)
            .update({ filial_id: filialId })
            .in('id', batch);
          if (updateErr) {
            stats.errors += batch.length;
            console.error(`  Erro update batch:`, updateErr.message);
          }
        }
      }
    }

    if (data.length < pageSize) break;
    page++;
    if (page % 10 === 0) console.log(`  Processados ${stats.total}...`);
  }

  console.log(`  ${table}: total=${stats.total} matched=${stats.matched} fallback=${stats.fallback} errors=${stats.errors}`);
  return stats;
}

// ─── 5. Verificação final ──────────────────────────────────
console.log('\n5. Verificação...');
for (const table of ['contas_receber', 'contas_pagar']) {
  const { count: withFilial } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .not('filial_id', 'is', null);

  const { count: withoutFilial } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .is('filial_id', null);

  console.log(`  ${table}: com filial=${withFilial}, sem filial=${withoutFilial}`);
}

console.log(DRY_RUN ? '\n[DRY RUN - nenhum dado alterado]' : '\nBackfill concluído!');
