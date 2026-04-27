/**
 * K522.7 Phase D — Embedded-Anecdote Audit
 * Detective sweep across Cephas content classes for anecdote-shaped narrative
 * NOT currently tracked in Master Registry or anecdotes table
 */
import { readFileSync } from 'fs';
const env = {};
readFileSync('C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\Asteroid-ProofVault\\LockBox\\SDS.env','utf8')
  .split('\n').forEach(l => { const m = l.match(/^([A-Z_]+)=(.+)$/); if (m) env[m[1]] = m[2].trim(); });
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const URL = 'https://ruuxzilgmuwddcofqecc.supabase.co';
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

// 1. Category breakdown of cephas_content_registry
const catRes = await fetch(`${URL}/rest/v1/cephas_content_registry?select=category&order=category`, { headers: H });
const catRows = await catRes.json();
const catCounts = {};
catRows.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
console.log('\n── Cephas Content Registry Categories ──');
Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).forEach(([c,n])=>console.log(`  ${n.toString().padStart(3)} ${c}`));

// 2. Pull Puddings (likely contain embedded anecdotes) — get title + first 200 chars of content
const puddingRes = await fetch(
  `${URL}/rest/v1/cephas_content_registry?category=eq.pudding&select=id,slug,title,content_markdown&limit=20`,
  { headers: H }
);
const puddings = await puddingRes.json();
console.log(`\n── Pudding Sample (first 20 of ${catCounts['pudding'] || '?'}) ──`);
for (const p of puddings) {
  const excerpt = (p.content_markdown || '').substring(0, 200).replace(/\n/g, ' ');
  console.log(`  [${p.id}] "${p.title || p.slug}" → ${excerpt}...`);
}

// 3. Pull BST Episodes
const bstRes = await fetch(
  `${URL}/rest/v1/cephas_content_registry?category=eq.bst_episode&select=id,slug,title,content_markdown&limit=10`,
  { headers: H }
);
const bst = await bstRes.json();
console.log(`\n── BST Episodes (${catCounts['bst_episode'] || 0} total) ──`);
for (const b of bst) {
  const excerpt = (b.content_markdown || '').substring(0, 150).replace(/\n/g, ' ');
  console.log(`  [${b.id}] "${b.title || b.slug}" → ${excerpt}...`);
}

// 4. Pull Spoonfuls
const spoonRes = await fetch(
  `${URL}/rest/v1/cephas_content_registry?category=eq.spoonful&select=id,slug,title,content_markdown&limit=10`,
  { headers: H }
);
const spoons = await spoonRes.json();
console.log(`\n── Spoonfuls (${catCounts['spoonful'] || 0} total) ──`);
for (const s of spoons) {
  const excerpt = (s.content_markdown || '').substring(0, 150).replace(/\n/g, ' ');
  console.log(`  [${s.id}] "${s.title || s.slug}" → ${excerpt}...`);
}

// 5. Innovations with anecdote-shaped prose (look for "I " or ">" quotes)
const innRes = await fetch(
  `${URL}/rest/v1/cephas_content_registry?category=eq.innovation&select=id,slug,title,content_markdown&limit=10`,
  { headers: H }
);
const inns = await innRes.json();
console.log(`\n── Innovation Sample (first 10 of ${catCounts['innovation'] || 0}) ──`);
for (const i of inns) {
  const hasQuote = (i.content_markdown || '').includes('> "');
  const excerpt = (i.content_markdown || '').substring(0, 120).replace(/\n/g, ' ');
  console.log(`  [${i.id}] ${hasQuote?'[HAS_QUOTE]':''} "${i.title || i.slug}"`);
}
