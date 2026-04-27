import { readFileSync } from 'fs';

const envPath = 'C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\Asteroid-ProofVault\\LockBox\\SDS.env';
const env = {};
readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([A-Z_]+)=(.+)$/);
  if (m) env[m[1]] = m[2].trim();
});

const SUPABASE_URL = 'https://ruuxzilgmuwddcofqecc.supabase.co';
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const res = await fetch(`${SUPABASE_URL}/rest/v1/anecdotes?select=id,title,created_at&order=id`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Accept': 'application/json' },
});
const text = await res.text();
console.log('Status:', res.status);
const rows = JSON.parse(text);
if (!Array.isArray(rows)) { console.log('Error:', text); process.exit(1); }
console.log(`Total: ${rows.length} anecdotes`);
rows.forEach(r => console.log(`  id=${r.id} | "${r.title}"`));
