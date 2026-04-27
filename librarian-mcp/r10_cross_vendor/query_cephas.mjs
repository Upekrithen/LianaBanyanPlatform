// K522.6: Query cephas_content_registry to understand canonical content state
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sdsPath = join(__dirname, '../../Asteroid-ProofVault/LockBox/SDS.env');
const vars = {};
readFileSync(sdsPath, 'utf8').split('\n').forEach(l => {
  const m = l.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.+)$/);
  if (m) vars[m[1]] = m[2];
});

const URL = 'https://ruuxzilgmuwddcofqecc.supabase.co';
const KEY = vars['SUPABASE_SERVICE_ROLE_KEY'];
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Accept': 'application/json' };

// Query cephas_content_registry for category/subcategory breakdown
const res = await fetch(`${URL}/rest/v1/cephas_content_registry?select=slug,title,category,subcategory,implementation_status&order=category,slug`, { headers: h });
const rows = await res.json();

if (!Array.isArray(rows)) {
  console.log('Error:', JSON.stringify(rows).substring(0, 300));
  process.exit(1);
}

console.log(`Total cephas_content_registry rows: ${rows.length}`);
console.log('');

// Group by category
const byCategory = {};
for (const r of rows) {
  const cat = r.category || 'unknown';
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(r);
}

for (const [cat, items] of Object.entries(byCategory).sort()) {
  console.log(`[${cat}] (${items.length} rows)`);
  items.slice(0, 10).forEach(r => console.log(`  ${r.slug} | ${r.title?.substring(0,60)} | ${r.implementation_status}`));
  if (items.length > 10) console.log(`  ... +${items.length - 10} more`);
}
