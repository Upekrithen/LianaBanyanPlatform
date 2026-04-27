import { readFileSync } from 'fs';
const env = {};
readFileSync('C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\Asteroid-ProofVault\\LockBox\\SDS.env','utf8')
  .split('\n').forEach(l => { const m = l.match(/^([A-Z_]+)=(.+)$/); if (m) env[m[1]] = m[2].trim(); });
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const URL = 'https://ruuxzilgmuwddcofqecc.supabase.co';
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

// Get full content of the 2 anecdote-candidate Puddings
const slugs = ['the-drink-cookbook-how-one-old-book-started-all-this', 'the-montana-principle-would-you-accept-your-own-deal'];
for (const slug of slugs) {
  const res = await fetch(`${URL}/rest/v1/cephas_content_registry?slug=eq.${slug}&select=id,title,content_markdown`, { headers: H });
  const rows = await res.json();
  if (rows.length) {
    const r = rows[0];
    console.log(`\n═══ "${r.title}" (${slug}) ═══`);
    console.log(r.content_markdown);
  }
}

// Also get the origin-story founder page
const res2 = await fetch(`${URL}/rest/v1/cephas_content_registry?slug=eq.origin-story&select=id,title,content_markdown`, { headers: H });
const os = await res2.json();
if (os.length) {
  console.log(`\n═══ Origin Story (${os[0].title}) ═══`);
  console.log(os[0].content_markdown.substring(0, 1000));
  console.log('...(truncated)');
}
