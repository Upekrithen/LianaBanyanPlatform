import { readFileSync } from 'fs';
const env = {};
readFileSync('C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\Asteroid-ProofVault\\LockBox\\SDS.env','utf8')
  .split('\n').forEach(l => { const m = l.match(/^([A-Z_]+)=(.+)$/); if (m) env[m[1]] = m[2].trim(); });
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const URL = 'https://ruuxzilgmuwddcofqecc.supabase.co';
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

// All 28 puddings for anecdote-pattern detection
const allPuddRes = await fetch(
  `${URL}/rest/v1/cephas_content_registry?category=eq.pudding&select=id,slug,title,content_markdown`,
  { headers: H }
);
const allPudds = await allPuddRes.json();

// Anecdote indicators: first-person narrative, blockquotes with "I ", specific dates/places
const anecPatterns = [/>\s*"(I |My |When I)/, /\*\*Montana\*\*/, /\*\*Age \d/, /born|grew up|father|mother|son|daughter|family/i, /\bI was\b.*\bwhen\b/i, /\bOne time\b/i, /\bI remember\b/i];

console.log('\n── All 28 Puddings — Anecdote Pattern Detection ──');
const candidates = [];
for (const p of allPudds) {
  const body = p.content_markdown || '';
  const hits = anecPatterns.filter(pat => pat.test(body));
  if (hits.length > 0) {
    candidates.push(p);
    const excerpt = body.substring(0, 350).replace(/\n/g, ' ');
    console.log(`\n  [CANDIDATE] "${p.title || p.slug}" (slug: ${p.slug})`);
    console.log(`  Patterns: ${hits.map(h=>h.toString().substring(0,30)).join(', ')}`);
    console.log(`  Excerpt: ${excerpt}...`);
  }
}

// Founder category
const founderRes = await fetch(
  `${URL}/rest/v1/cephas_content_registry?category=eq.founder&select=id,slug,title,content_markdown`,
  { headers: H }
);
const founders = await founderRes.json();
console.log(`\n── Founder Category (${founders.length} items) ──`);
for (const f of founders) {
  console.log(`  [${f.id}] slug=${f.slug} title="${f.title || '(none)'}" — ${(f.content_markdown||'').substring(0,100)}...`);
}

// Crown letters with embedded anecdotes
const crownRes = await fetch(
  `${URL}/rest/v1/cephas_content_registry?category=eq.crown_letter&select=id,slug,title,content_markdown&limit=5`,
  { headers: H }
);
const crowns = await crownRes.json();
console.log(`\n── Crown Letters — Anecdote pattern check (first 5) ──`);
for (const c of crowns) {
  const body = c.content_markdown || '';
  const hasAnec = anecPatterns.some(p => p.test(body));
  if (hasAnec) {
    const excerpt = body.substring(0, 200).replace(/\n/g, ' ');
    console.log(`  [CANDIDATE] "${c.title || c.slug}" → ${excerpt}...`);
  }
}
