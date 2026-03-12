/**
 * Importar contas bancárias e caixas do TGA (Firebird) → Supabase
 *
 * Lê a tabela FCAIXA do TGA e substitui os dados seed no Supabase.
 * Mapeia filial pelo nome da conta (TERRA→filial 1, CONSTRUTERRA→filial 2, DOURADAO→filial 3).
 *
 * Uso: SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-tga-contas-bancarias.mjs [--dry-run]
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

// ─── 1. Carregar mapa de filiais ────────────────────────────
console.log('1. Carregando filiais do Supabase...');
const { data: companies } = await supabase
  .from('companies')
  .select('id, name, short_name, document, tga_codfilial')
  .not('tga_codfilial', 'is', null);

if (!companies || companies.length === 0) {
  console.error('Nenhuma filial encontrada com tga_codfilial. Rode o SQL 005 primeiro.');
  process.exit(1);
}

const filialMap = new Map(); // tga_codfilial → UUID
const cnpjMap = new Map();   // tga_codfilial → CNPJ
for (const c of companies) {
  filialMap.set(String(c.tga_codfilial), c.id);
  cnpjMap.set(String(c.tga_codfilial), c.document);
  console.log(`  CODFILIAL=${c.tga_codfilial} → ${c.short_name} (${c.id})`);
}

// ─── 2. Extrair FCAIXA do TGA ───────────────────────────────
console.log('\n2. Extraindo contas bancárias do TGA...');
const raw = fbQuery(`
  SELECT
    TRIM(CODCAIXA) || '||' ||
    TRIM(COALESCE(DESCRICAO,'')) || '||' ||
    TRIM(COALESCE(CLASSIFICACAO,'C')) || '||' ||
    TRIM(COALESCE(NUMBANCO,'')) || '||' ||
    TRIM(COALESCE(NUMAGENCIA,'')) || '||' ||
    TRIM(COALESCE(NROCONTA,'')) || '||' ||
    TRIM(COALESCE(DIGITOCONTA,'')) || '||' ||
    TRIM(COALESCE(DIGITOAGENCIA,'')) || '||' ||
    COALESCE(CAST(SALDOINSTANTANEO AS VARCHAR(30)),'0') || '||' ||
    TRIM(COALESCE(INATIVO,'F')) || '||' ||
    TRIM(COALESCE(CAST(CODFILIAL AS VARCHAR(5)),'')) || '||' ||
    TRIM(COALESCE(CNPJ,''))
  FROM FCAIXA
  WHERE CODEMPRESA = 1
  ORDER BY CODCAIXA;
`);

const lines = raw.split('\n').filter(l => l.includes('||'));
console.log(`  ${lines.length} contas encontradas no TGA`);

// ─── 3. Mapear nome → filial ────────────────────────────────
function inferFilial(descricao) {
  const desc = descricao.toUpperCase();
  if (desc.includes('CONSTRUTERRA') || desc.includes('CONSTRU')) return '2';
  if (desc.includes('DOURADAO') || desc.includes('DOURADÃO')) return '3';
  if (desc.includes('M&P') || desc.includes('MEP')) return '4';
  if (desc.includes('TERRA')) return '1'; // Transportadora Terra
  return '1'; // Default: Transportadora Terra
}

// ─── 4. Parsear e transformar ───────────────────────────────
const contas = [];
for (const line of lines) {
  const parts = line.trim().split('||').map(s => s.trim());
  const [codcaixa, descricao, classificacao, numbanco, numagencia, nroconta, digitoconta, digitoagencia, saldoStr, inativo, codfilialStr, cnpj] = parts;

  if (!codcaixa || !descricao) continue;

  // Determinar filial
  const codfilial = codfilialStr || inferFilial(descricao);
  const filialId = filialMap.get(codfilial) || filialMap.get('1');
  const empresaCnpj = cnpjMap.get(codfilial) || cnpjMap.get('1');

  // Classificação: B=Banco, C=Caixa
  const tipoConta = classificacao === 'B' ? 'CONTA_CORRENTE' : 'CAIXA_FISICO';

  // Formatar agência e conta
  let agenciaFmt = '';
  if (numagencia) {
    agenciaFmt = digitoagencia ? `${numagencia}-${digitoagencia}` : numagencia;
  }

  let contaFmt = '';
  if (nroconta) {
    contaFmt = digitoconta ? `${nroconta}-${digitoconta}` : nroconta;
  }

  // Nome do banco (lookup de FBANCO pelo código)
  const bancoNomes = {
    '001': 'Banco do Brasil',
    '033': 'Santander',
    '104': 'Caixa Econômica',
    '237': 'Bradesco',
    '341': 'Itaú',
    '353': 'Santander',
    '399': 'HSBC',
    '422': 'Safra',
    '748': 'Sicredi',
    '756': 'Sicoob',
  };

  const bancoNome = classificacao === 'B'
    ? (bancoNomes[numbanco] || `Banco ${numbanco}`)
    : descricao;

  const saldo = parseFloat(saldoStr) || 0;

  contas.push({
    banco_codigo: numbanco || '000',
    banco_nome: bancoNome,
    agencia: agenciaFmt || '0000',
    conta: contaFmt || `CAIXA-${codcaixa}`,
    tipo_conta: tipoConta,
    saldo_atual: saldo,
    ativa: inativo !== 'V' && inativo !== '1',
    padrao: false,
    empresa_cnpj: empresaCnpj,
    filial_id: filialId,
    tga_codcaixa: codcaixa,
  });
}

console.log(`  ${contas.length} contas parseadas`);
console.log('\n  Resumo por filial:');
const byFilial = {};
for (const c of contas) {
  const key = c.filial_id;
  if (!byFilial[key]) byFilial[key] = { banco: 0, caixa: 0 };
  if (c.tipo_conta === 'CONTA_CORRENTE') byFilial[key].banco++;
  else byFilial[key].caixa++;
}
for (const [fid, counts] of Object.entries(byFilial)) {
  const comp = companies.find(c => c.id === fid);
  console.log(`    ${comp?.short_name || fid}: ${counts.banco} bancos, ${counts.caixa} caixas`);
}

if (DRY_RUN) {
  console.log('\n[DRY RUN] Contas a importar:');
  contas.forEach(c => console.log(`  ${c.tga_codcaixa} | ${c.banco_nome} | ${c.tipo_conta} | ag:${c.agencia} cc:${c.conta} | saldo:${c.saldo_atual}`));
  console.log('\nNenhum dado alterado.');
  process.exit(0);
}

// ─── 5. Verificar referências existentes ────────────────────
console.log('\n5. Verificando referências em movimentos...');
const { data: usedBankIds } = await supabase
  .from('movimentos_bancarios')
  .select('conta_bancaria_id')
  .not('conta_bancaria_id', 'is', null);

const referencedIds = new Set((usedBankIds || []).map(r => r.conta_bancaria_id));
console.log(`  ${referencedIds.size} contas referenciadas por movimentos`);

// ─── 6. Remover contas seed não referenciadas ───────────────
console.log('\n6. Removendo contas seed não referenciadas...');
const { data: existingContas } = await supabase
  .from('contas_bancarias')
  .select('id, banco_nome');

if (existingContas) {
  const toDelete = existingContas.filter(c => !referencedIds.has(c.id)).map(c => c.id);
  if (toDelete.length > 0) {
    await supabase.from('contas_bancarias').delete().in('id', toDelete);
    console.log(`  ${toDelete.length} contas removidas`);
  }
  console.log(`  ${existingContas.length - toDelete.length} contas preservadas (referenciadas)`);
}

// ─── 7. Inserir contas do TGA ───────────────────────────────
console.log('\n7. Inserindo contas bancárias do TGA...');
let inserted = 0, errors = 0;

for (const conta of contas) {
  const { error } = await supabase.from('contas_bancarias').insert(conta);
  if (error) {
    console.error(`  Erro em ${conta.tga_codcaixa} (${conta.banco_nome}): ${error.message}`);
    errors++;
  } else {
    inserted++;
  }
}

console.log(`  Inseridos: ${inserted}, Erros: ${errors}`);

// ─── 8. Marcar primeira conta como padrão ───────────────────
console.log('\n8. Definindo conta padrão...');
const { data: firstBank } = await supabase
  .from('contas_bancarias')
  .select('id')
  .eq('tipo_conta', 'CONTA_CORRENTE')
  .eq('ativa', true)
  .limit(1)
  .single();

if (firstBank) {
  await supabase.from('contas_bancarias').update({ padrao: true }).eq('id', firstBank.id);
  console.log(`  Conta padrão definida: ${firstBank.id}`);
}

// ─── 9. Verificação final ───────────────────────────────────
const { count } = await supabase
  .from('contas_bancarias')
  .select('*', { count: 'exact', head: true });

console.log(`\nTotal contas bancárias no Supabase: ${count}`);
console.log('Importação concluída!');
