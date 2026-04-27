import { readFileSync } from 'fs';
const env = {};
readFileSync('C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\Asteroid-ProofVault\\LockBox\\SDS.env','utf8')
  .split('\n').forEach(l => { const m = l.match(/^([A-Z_]+)=(.+)$/); if (m) env[m[1]] = m[2].trim(); });
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const URL = 'https://ruuxzilgmuwddcofqecc.supabase.co';

const res = await fetch(`${URL}/rest/v1/anecdotes?id=in.(1,2,3,8,11,13)&select=id,title,body_markdown&order=id`,
  { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
const rows = await res.json();
for (const r of rows) {
  console.log(`\n=====ID=${r.id}=====`);
  console.log(r.body_markdown);
}
