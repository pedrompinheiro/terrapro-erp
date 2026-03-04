/**
 * Importar 147 centros de custo do TGA (Firebird) → Supabase
 *
 * Lê a tabela FCCUSTO do TGA e substitui os centros_custo atuais no Supabase.
 * Preserva referências existentes: não exclui centros que têm lançamentos vinculados.
 *
 * Uso: SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-tga-centros-custo.mjs [--dry-run]
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

// ─── 1. Extrair FCCUSTO do TGA ─────────────────────────────
console.log('1. Extraindo centros de custo do TGA...');
const raw = fbQuery(`
  SELECT
    TRIM(COD) || '||' ||
    TRIM(COALESCE(DESCRICAO,'')) || '||' ||
    TRIM(COALESCE(TIPO,'D')) || '||' ||
    TRIM(COALESCE(FIXOOUVARIAVEL,''))  || '||' ||
    COALESCE(CAST(INATIVO AS VARCHAR(1)),'0')
  FROM FCCUSTO
  WHERE CODEMPRESA = 1
  ORDER BY COD;
`);

const lines = raw.split('\n').filter(l => l.includes('||'));
console.log(`  ${lines.length} centros de custo encontrados no TGA`);

// ─── 2. Parsear e transformar ──────────────────────────────
const centros = [];
for (const line of lines) {
  const [cod, descricao, tipo, fixoVar, inativo] = line.trim().split('||').map(s => s.trim());
  if (!cod || !descricao) continue;

  // Calcular nível pela quantidade de pontos: "1"→1, "1.01"→2, "1.01.001"→3
  const nivel = cod.split('.').length;

  // Mapear tipo TGA → tipo ERP
  let tipoERP, grupoDRE;
  const codNum = cod.split('.')[0];

  if (tipo === 'C') {
    tipoERP = 'RECEITA';
    grupoDRE = 'Receita Operacional Bruta';
  } else {
    // Classificar pelo grupo do código
    switch (codNum) {
      case '1':
        tipoERP = 'RECEITA';
        grupoDRE = 'Receita Operacional Bruta';
        break;
      case '2':
        tipoERP = 'CUSTO_DIRETO';
        grupoDRE = 'Custos Diretos da Operação (CPV)';
        break;
      case '3':
        tipoERP = 'DESPESA_FIXA';
        grupoDRE = 'Despesas Operacionais Fixas';
        break;
      case '4':
        tipoERP = 'DESPESA_VARIAVEL';
        grupoDRE = 'Despesas Operacionais Variáveis';
        break;
      case '5':
        tipoERP = 'DESPESA_FINANCEIRA';
        grupoDRE = 'Resultado Financeiro';
        break;
      case '6':
        tipoERP = 'RECEITA_FINANCEIRA';
        grupoDRE = 'Resultado Financeiro';
        break;
      case '7':
      case '8':
      case '9':
        tipoERP = 'INVESTIMENTO';
        grupoDRE = 'CAPEX / Imobilizado';
        break;
      default:
        tipoERP = 'DESPESA';
        grupoDRE = 'Outras Despesas';
    }
  }

  // Mapear fixo/variavel
  const fixoVariavel = fixoVar === 'F' ? 'FIXO' : fixoVar === 'V' ? 'VARIAVEL' : null;

  centros.push({
    nome: descricao,
    codigo: cod,
    tga_code: cod,
    tipo: tipoERP,
    natureza: tipo || 'D',
    fixo_variavel: fixoVariavel,
    grupo_dre: grupoDRE,
    nivel,
    ativo: inativo !== '1',
    empresa_cnpj: '00.000.000/0001-91' // Empresa-level (compartilhado entre filiais)
  });
}

console.log(`  ${centros.length} centros parseados`);

if (DRY_RUN) {
  console.log('\n[DRY RUN] Primeiros 20:');
  centros.slice(0, 20).forEach(c => console.log(`  ${c.codigo} | ${c.nome} | ${c.tipo} | ${c.grupo_dre} | N${c.nivel}`));
  console.log('\nNenhum dado alterado.');
  process.exit(0);
}

// ─── 3. Verificar referências existentes ───────────────────
console.log('\n3. Verificando referências existentes...');
const { data: usedCcIds } = await supabase
  .from('contas_receber')
  .select('centro_custo_id')
  .not('centro_custo_id', 'is', null);

const { data: usedCcIdsPagar } = await supabase
  .from('contas_pagar')
  .select('centro_custo_id')
  .not('centro_custo_id', 'is', null);

const referencedIds = new Set([
  ...(usedCcIds || []).map(r => r.centro_custo_id),
  ...(usedCcIdsPagar || []).map(r => r.centro_custo_id)
]);
console.log(`  ${referencedIds.size} centros de custo referenciados por lançamentos`);

// ─── 4. Remover centros NÃO referenciados ──────────────────
console.log('\n4. Removendo centros não referenciados...');
const { data: existingCc } = await supabase.from('centros_custo').select('id');

if (existingCc) {
  const toDelete = existingCc.filter(cc => !referencedIds.has(cc.id)).map(cc => cc.id);
  if (toDelete.length > 0) {
    for (let i = 0; i < toDelete.length; i += 300) {
      const batch = toDelete.slice(i, i + 300);
      await supabase.from('centros_custo').delete().in('id', batch);
    }
    console.log(`  ${toDelete.length} centros removidos`);
  }
  console.log(`  ${existingCc.length - toDelete.length} centros preservados (referenciados)`);
}

// ─── 5. Inserir centros do TGA ─────────────────────────────
console.log('\n5. Inserindo centros de custo do TGA...');
let inserted = 0, errors = 0;

for (let i = 0; i < centros.length; i += 50) {
  const batch = centros.slice(i, i + 50);
  const { error } = await supabase.from('centros_custo').insert(batch);

  if (error) {
    // Fallback: inserir um a um
    for (const cc of batch) {
      const { error: err2 } = await supabase.from('centros_custo').insert(cc);
      if (err2) {
        console.error(`  Erro em ${cc.codigo}: ${err2.message}`);
        errors++;
      } else {
        inserted++;
      }
    }
  } else {
    inserted += batch.length;
  }
}

console.log(`  Inseridos: ${inserted}, Erros: ${errors}`);

// ─── 6. Verificação ────────────────────────────────────────
const { count } = await supabase
  .from('centros_custo')
  .select('*', { count: 'exact', head: true });

console.log(`\nTotal centros de custo no Supabase: ${count}`);
console.log('Importação concluída!');
