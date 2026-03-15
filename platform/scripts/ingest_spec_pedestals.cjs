/**
 * Ingest Bishop's SPEC_EXPANSION_BATCH files into cephas_content_registry as Innovation Pedestals.
 * Run: cd platform && node scripts/ingest_spec_pedestals.cjs
 * Requires: VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in .env
 */

const fs = require('fs');
const path = require('path');

const DROPZONE = path.resolve(__dirname, '..', '..', 'BISHOP_DROPZONE');
const PLATFORM_ROOT = path.resolve(__dirname, '..');

function parseSpecFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = [];
  const regex = /## Innovation #(\d+)\s*[—–-]\s*(.+?)[\r\n]+(?:\*\*Category:\*\*\s*(.+?)(?:\s*\||\s*[\r\n]))?\s*(?:\*\*Patent Bag:\*\*\s*(.+?)[\r\n]+)?[\r\n]*(A system comprises:[\s\S]*?)(?=\n## Innovation #|\n---\s*\n## |$)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const num = parseInt(match[1], 10);
    const title = match[2].trim();
    const category = (match[3] || '').trim();
    const patentBag = (match[4] || '').trim();
    let spec = match[5].trim().replace(/\n---\s*$/, '').trim();
    if (num && spec.length > 50) {
      results.push({ num, title, category, patentBag, spec });
    }
  }
  return results;
}

async function main() {
  const dotenv = path.join(PLATFORM_ROOT, '.env');
  if (fs.existsSync(dotenv)) {
    fs.readFileSync(dotenv, 'utf8').split('\n').forEach((line) => {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    });
  }
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in platform/.env');
    process.exit(1);
  }
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  const files = fs.readdirSync(DROPZONE)
    .filter(f => f.startsWith('SPEC_EXPANSION_BATCH_') && f.endsWith('.md'))
    .sort()
    .map(f => path.join(DROPZONE, f));

  let all = [];
  for (const f of files) {
    const specs = parseSpecFile(f);
    console.log(`${path.basename(f)}: ${specs.length} innovations`);
    all = all.concat(specs);
  }
  const byNum = new Map();
  for (const s of all) byNum.set(s.num, s);
  const deduped = Array.from(byNum.values()).sort((a, b) => a.num - b.num);
  console.log(`Total unique: ${deduped.length}`);

  let inserted = 0, errors = 0;
  for (const { num, title, category, patentBag, spec } of deduped) {
    const slug = `innovation-${num}`;
    const row = {
      slug,
      title: `#${num}: ${title}`.slice(0, 500),
      category: 'innovation',
      subcategory: category || null,
      source_path: `BISHOP_DROPZONE/SPEC_EXPANSION_BATCH (innovation #${num})`,
      content_markdown: spec.slice(0, 500000),
      style: 'pudding',
      version: '1.0',
      technical_summary: spec.split(',').slice(0, 2).join(',').slice(0, 500),
      innovation_ids: [`#${num}`],
      related_patents: patentBag ? [patentBag] : [],
      system_components: [],
      implementation_status: 'planned',
      creation_context: `Harvested from academic papers, patent bags, Pawn screening — Bishop Session 12 continued`,
      revision_history: [],
      bishop_session: 'Session 12 continued',
      knight_session: 'Session 20',
      decision_log: ['Founder directed spec expansion harvest from existing sources', 'SEC-safe language enforced'],
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('cephas_content_registry').upsert(row, { onConflict: 'slug', ignoreDuplicates: false });
    if (error) {
      console.error(`Error #${num}:`, error.message);
      errors++;
    } else inserted++;
  }
  console.log(`Done. Inserted/updated: ${inserted}, errors: ${errors}`);
}

main();
