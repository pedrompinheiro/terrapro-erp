import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://xpufmosdhhemcubzswcv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let page = 0;
let fixed = 0;

while (true) {
  const { data, error } = await sb.from('entities')
    .select('id, contacts')
    .not('legacy_code', 'is', null)
    .range(page * 500, (page + 1) * 500 - 1);

  if (error) { console.error(error.message); break; }
  if (data.length === 0) break;

  for (const e of data) {
    if (typeof e.contacts === 'string') {
      try {
        const parsed = JSON.parse(e.contacts);
        await sb.from('entities').update({ contacts: parsed }).eq('id', e.id);
        fixed++;
      } catch { /* skip */ }
    }
  }
  page++;
  process.stdout.write(`\rFixed: ${fixed}`);
}

console.log(`\nTotal corrigidos: ${fixed}`);
