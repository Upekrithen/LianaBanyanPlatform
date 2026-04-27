import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const vars = {};
readFileSync(join(__dirname, '../../Asteroid-ProofVault/LockBox/SDS.env'), 'utf8').split('\n').forEach(l => {
  const m = l.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.+)$/);
  if (m) vars[m[1]] = m[2];
});
const URL = 'https://ruuxzilgmuwddcofqecc.supabase.co';
const KEY = vars['SUPABASE_SERVICE_ROLE_KEY'];
const h = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Accept': 'application/json' };
const res = await fetch(`${URL}/rest/v1/cephas_content_registry?select=*&limit=1`, { headers: h });
const data = await res.json();
if (data[0]) {
  console.log('Columns:', Object.keys(data[0]).join(', '));
  // Show sample (no content_markdown value to keep output short)
  const { content_markdown, ...meta } = data[0];
  console.log('Sample row meta:', JSON.stringify(meta, null, 2));
  console.log('content_markdown length:', content_markdown?.length ?? 0);
} else {
  console.log('Error:', JSON.stringify(data).substring(0, 300));
}
