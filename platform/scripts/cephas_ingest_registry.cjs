/**
 * Cephas Content Registry Ingestion (Session 19)
 * Reads markdown from repo source dirs and upserts into cephas_content_registry.
 * Run from platform dir: node scripts/cephas_ingest_registry.cjs
 * (Uses platform/.env and platform/node_modules.)
 * Requires: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY in platform/.env
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function parseFrontmatter(content) {
  if (!content || (content.charCodeAt && content.charCodeAt(0) === 0xFEFF)) content = content.slice(1);
  const match = content.match(/---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { body: content };
  const body = content.slice(match[0].length);
  const front = match[1];
  const data = { body };
  front.split(/\r?\n/).forEach((line) => {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      data[key] = val;
    }
  });
  return data;
}

function slugFromPath(relativePath) {
  return relativePath
    .replace(/\.md$/i, '')
    .replace(/\\/g, '/')
    .replace(/[^a-z0-9/-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'untitled';
}

function categoryAndStyle(relativePath, filename) {
  const p = relativePath.replace(/\\/g, '/').toLowerCase();
  const f = filename.toLowerCase();
  if (p.includes('academic-papers') || f.startsWith('paper_') || /^.*academic.*\.md$/i.test(f))
    return { category: 'academic_paper', style: 'clean_academic' };
  if (p.includes('crown') || f.includes('crown_letter') || p.includes('01 markupfiles'))
    return { category: 'crown_letter', style: 'pudding' };
  if (f.startsWith('letter') || f.startsWith('letter-') || p.includes('outreach'))
    return { category: 'outreach_letter', style: 'pudding' };
  if (p.includes('initiative_content') || f.includes('initiative'))
    return { category: 'initiative', style: 'pudding' };
  if (f.includes('innovation') || p.includes('innovation'))
    return { category: 'innovation', style: 'pudding' };
  if (p.includes('hexisle') || p.includes('fable') || p.includes('gaming'))
    return { category: 'hexisle', style: 'pudding' };
  if (f.startsWith('spec_') || p.includes('design') || p.includes('docs/'))
    return { category: 'system_design', style: 'pudding' };
  if (p.includes('article') || f.startsWith('article_'))
    return { category: 'article', style: 'pudding' };
  if (p.includes('vault') || p.includes('asteroid-proofvault') || p.includes('7holy'))
    return { category: 'vault_archive', style: 'pudding' };
  if (f.includes('open_letter') || p.includes('open_letter'))
    return { category: 'open_letter', style: 'pudding' };
  return { category: 'reference', style: 'pudding' };
}

function walkDir(dir, baseDir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') walkDir(filePath, baseDir, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push({ fullPath: filePath, relative: path.relative(baseDir, filePath), file });
    }
  }
  return fileList;
}

async function main() {
  const dotenv = path.join(REPO_ROOT, 'platform', '.env');
  if (fs.existsSync(dotenv)) {
    const envContent = fs.readFileSync(dotenv, 'utf8');
    envContent.split('\n').forEach((line) => {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) in platform/.env');
    process.exit(1);
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  const dirs = [
    path.join(REPO_ROOT, 'academic-papers'),
    path.join(REPO_ROOT, '01 MarkupFiles'),
    path.join(REPO_ROOT, 'BISHOP_DROPZONE'),
    path.join(REPO_ROOT, 'docs'),
    path.join(REPO_ROOT, 'Cephas', 'cephas-hugo', 'content'),
  ].filter((d) => fs.existsSync(d));

  const files = [];
  for (const dir of dirs) {
    walkDir(dir, REPO_ROOT, files);
  }
  const filteredFiles = files.filter((f) => f.relative && !f.relative.includes('node_modules'));

  console.log(`Found ${filteredFiles.length} markdown files. Ingesting into cephas_content_registry...`);

  let inserted = 0;
  let errors = 0;
  for (const { fullPath, relative, file } of filteredFiles) {
    try {
      const raw = fs.readFileSync(fullPath, 'utf8');
      const { body, title: fmTitle } = parseFrontmatter(raw);
      const { category, style } = categoryAndStyle(relative, file);
      const slug = slugFromPath(relative);
      const title = fmTitle || file.replace(/\.md$/i, '').replace(/-/g, ' ');

      const row = {
        slug,
        title: title.slice(0, 500),
        category,
        subcategory: null,
        source_path: relative,
        content_markdown: body ? body.slice(0, 500000) : null,
        style,
        version: '1.0',
        technical_summary: null,
        innovation_ids: [],
        related_patents: [],
        system_components: [],
        implementation_status: 'planned',
        creation_context: `Ingested from ${relative}`,
        revision_history: [],
        bishop_session: null,
        knight_session: 'Session 19',
        decision_log: [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('cephas_content_registry').upsert(row, {
        onConflict: 'slug',
        ignoreDuplicates: false,
      });
      if (error) {
        console.error('Error upserting', slug, error.message);
        errors++;
      } else inserted++;
    } catch (e) {
      console.error('Error processing', fullPath, e.message);
      errors++;
    }
  }

  console.log(`Done. Inserted/updated: ${inserted}, errors: ${errors}`);
}

main();
