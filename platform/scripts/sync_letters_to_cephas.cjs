#!/usr/bin/env node
/**
 * Cephas Letter Sync Script
 * =========================
 * Ensures all Cephas letters have:
 *   1. Proper Hugo frontmatter
 *   2. Red Carpet CTA at the bottom
 *   3. Sync from LAUNCH_DOCUMENTS_MASTER when source exists
 *
 * Usage:
 *   node platform/scripts/sync_letters_to_cephas.cjs           # dry run
 *   node platform/scripts/sync_letters_to_cephas.cjs --apply   # write changes
 *   node platform/scripts/sync_letters_to_cephas.cjs --report  # summary only
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CEPHAS_LETTERS = path.join(ROOT, 'Cephas', 'cephas-hugo', 'content', 'letters');
const SOURCE_LETTERS = path.join(ROOT, 'LAUNCH_DOCUMENTS_MASTER', 'letters');

const RED_CARPET_CTA = `
---

There is a walkthrough at [LianaBanyan.com/RedCarpet](https://lianabanyan.com/RedCarpet). No scheduling, no pitch deck, no salesman.

Help each other help ourselves.

As You Wish.`;

const CATEGORY_META = {
  'circle-1-investors': { type: 'Investor Letter', tags: ['circle-1', 'investor'] },
  'circle-2-media': { type: 'Media Letter', tags: ['circle-2', 'media'] },
  'circle-3-academics': { type: 'Academic Letter', tags: ['circle-3', 'academic'] },
  'crown-initiative': { type: 'Crown Letter', tags: ['crown-letter', 'initiative'] },
  'pitches': { type: 'Media Pitch', tags: ['media-pitch'] },
  'partnerships': { type: 'Partnership Letter', tags: ['partnership'] },
  'blessing': { type: 'Blessing Letter', tags: ['blessing'] },
  'health': { type: 'Health Letter', tags: ['health'] },
  'professional': { type: 'Professional Letter', tags: ['professional'] },
};

const INITIATIVE_MAP = {
  'maneet-chauhan': { initiative: "Let's Make Dinner", number: 1 },
  'jose-andres': { initiative: "Let's Make Dinner", number: 1 },
  'mary-beth-laughton': { initiative: "Let's Go Shopping", number: 3 },
  'marie-kondo': { initiative: 'Household Concierge', number: 4 },
  'ashton-applewhite': { initiative: 'The Family Table', number: 5 },
  'marc-freedman': { initiative: 'The Family Table', number: 5 },
  'alex-oshmyansky': { initiative: 'LifeLine Medications', number: 6 },
  'cathie-mahon': { initiative: 'VSL', number: 10 },
  'sallie-krawcheck': { initiative: 'VSL', number: 10 },
  'jessica-jackley': { initiative: 'VSL', number: 10 },
  'dale-dougherty': { initiative: "Let's Make Bread", number: 11 },
  'molly-hemstreet': { initiative: "Let's Make Bread", number: 11 },
  'sal-khan-chancellor': { initiative: 'Didasko', number: 14 },
  'kimberly-williams': { initiative: 'Rally Group', number: 9 },
  'ruth-glenn': { initiative: 'Defense Klaus', number: 8 },
  'robert-kaiser': { initiative: 'Defense Klaus', number: 8 },
  'brene-brown': { initiative: 'Harper Guild', number: 12 },
  'ai-jen-poo': { initiative: 'Harper Guild', number: 12 },
  'taylor-swift': { initiative: 'JukeBox', number: 13 },
  'michael-seibel-ceo': { initiative: 'Multiple', number: 0 },
  'mariaelena-huambachano': { initiative: 'International', number: 15 },
  'muhammad-yunus': { initiative: 'VSL', number: 10 },
};

function hasFrontmatter(content) {
  return content.trimStart().startsWith('---');
}

function parseFrontmatter(content) {
  if (!hasFrontmatter(content)) return { frontmatter: null, body: content };
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: null, body: content };
  return { frontmatter: match[1], body: match[2] };
}

function hasRedCarpetCTA(content) {
  return /LianaBanyan\.com\/RedCarpet/i.test(content);
}

function inferRecipient(filename, body) {
  const slug = filename.replace('.md', '').replace(/-v\d+$/, '');
  const titleCased = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return titleCased;
}

function inferTitle(filename, category, recipient) {
  const meta = CATEGORY_META[category];
  if (!meta) return recipient;
  if (category === 'crown-initiative') return `Crown Letter: ${recipient}`;
  if (category === 'pitches') return `Pitch: ${recipient}`;
  if (category === 'partnerships') return `Partnership Letter: ${recipient}`;
  return `Letter to ${recipient}`;
}

function generateFrontmatter(filename, category, body) {
  const slug = filename.replace('.md', '');
  const recipient = inferRecipient(filename, body);
  const title = inferTitle(filename, category, recipient);
  const meta = CATEGORY_META[category] || { type: 'Letter', tags: [] };
  const initiative = INITIATIVE_MAP[slug];

  let fm = `---\ntitle: "${title}"\n`;
  fm += `date: 2026-01-15\n`;
  fm += `letter_type: "${meta.type}"\n`;
  fm += `recipient: "${recipient}"\n`;

  if (initiative) {
    fm += `initiative: "${initiative.initiative}"\n`;
    if (initiative.number > 0) fm += `initiative_number: ${initiative.number}\n`;
  }

  const tagList = [...meta.tags, slug];
  fm += `tags: [${tagList.map(t => `"${t}"`).join(', ')}]\n`;
  fm += `---\n\n`;
  return fm;
}

function findSignoff(body) {
  const lines = body.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/jonathan\s+jones/i.test(lines[i]) ||
        /founding\s+manager/i.test(lines[i]) ||
        /founder.*general\s+manager/i.test(lines[i]) ||
        /support@lianabanyan/i.test(lines[i]) ||
        /406-578-1232/.test(lines[i])) {
      return i;
    }
  }
  return -1;
}

function addRedCarpetCTA(content) {
  const lines = content.split('\n');
  const signoffIdx = findSignoff(content);

  if (signoffIdx >= 0) {
    let insertAt = signoffIdx;
    while (insertAt > 0 && lines[insertAt - 1].trim() === '') insertAt--;
    while (insertAt > 0 && (
      lines[insertAt - 1].trim().startsWith('**Jonathan') ||
      lines[insertAt - 1].trim().startsWith('Jonathan') ||
      lines[insertAt - 1].trim().startsWith('With ') ||
      lines[insertAt - 1].trim().startsWith('Respectfully') ||
      lines[insertAt - 1].trim().startsWith('Sincerely') ||
      lines[insertAt - 1].trim().startsWith('---') ||
      lines[insertAt - 1].trim() === ''
    )) insertAt--;

    lines.splice(insertAt + 1, 0, RED_CARPET_CTA);
    return lines.join('\n');
  }

  return content + '\n' + RED_CARPET_CTA + '\n';
}

function processLetterFile(filePath, category, dryRun) {
  const filename = path.basename(filePath);
  if (filename === '_index.md') return null;

  const content = fs.readFileSync(filePath, 'utf-8');
  const changes = [];
  let newContent = content;

  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter) {
    changes.push('add-frontmatter');
    newContent = generateFrontmatter(filename, category, body) + body;
  }

  if (!hasRedCarpetCTA(newContent)) {
    changes.push('add-red-carpet-cta');
    newContent = addRedCarpetCTA(newContent);
  }

  if (changes.length === 0) return null;

  if (!dryRun) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }

  return { file: path.relative(ROOT, filePath), changes };
}

function scanSourceLetters() {
  if (!fs.existsSync(SOURCE_LETTERS)) return [];

  const entries = fs.readdirSync(SOURCE_LETTERS, { withFileTypes: true });
  const sources = [];

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('LETTER-')) {
      const dirPath = path.join(SOURCE_LETTERS, entry.name);
      const mdFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
      if (mdFiles.length > 0) {
        sources.push({
          sourceDir: entry.name,
          sourcePath: path.join(dirPath, mdFiles[0]),
        });
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      sources.push({
        sourceDir: entry.name.replace('.md', ''),
        sourcePath: path.join(SOURCE_LETTERS, entry.name),
      });
    }
  }

  return sources;
}

function generateSyncMapUpdate(cephasFiles) {
  const entries = [];
  for (const { relPath, filename } of cephasFiles) {
    const slug = filename.replace('.md', '').toUpperCase().replace(/-/g, '-');
    const key = `LETTER-${slug}`;
    entries.push(`  '${key}': '${relPath}',`);
  }
  return entries;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');
  const reportOnly = args.includes('--report');

  console.log(`\n📬  Cephas Letter Sync${dryRun ? ' (DRY RUN)' : ' (APPLYING CHANGES)'}\n`);

  if (!fs.existsSync(CEPHAS_LETTERS)) {
    console.error(`ERROR: Cephas letters directory not found: ${CEPHAS_LETTERS}`);
    process.exit(1);
  }

  // Collect all letter files
  const allFiles = [];
  const categories = fs.readdirSync(CEPHAS_LETTERS, { withFileTypes: true });

  // Root-level letters
  for (const entry of categories) {
    if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== '_index.md') {
      allFiles.push({
        filePath: path.join(CEPHAS_LETTERS, entry.name),
        category: 'crown-initiative',
        relPath: `letters/${entry.name}`,
        filename: entry.name,
      });
    }
  }

  // Category subdirectories
  for (const entry of categories) {
    if (!entry.isDirectory()) continue;
    const catDir = path.join(CEPHAS_LETTERS, entry.name);
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md') && f !== '_index.md');
    for (const file of files) {
      allFiles.push({
        filePath: path.join(catDir, file),
        category: entry.name,
        relPath: `letters/${entry.name}/${file}`,
        filename: file,
      });
    }
  }

  console.log(`Found ${allFiles.length} letters in Cephas\n`);

  // Check source letters
  const sources = scanSourceLetters();
  if (sources.length > 0) {
    console.log(`Found ${sources.length} source letters in LAUNCH_DOCUMENTS_MASTER\n`);
  }

  // Process each letter
  const results = [];
  let frontmatterAdded = 0;
  let ctaAdded = 0;

  for (const { filePath, category } of allFiles) {
    const result = processLetterFile(filePath, category, dryRun || reportOnly);
    if (result) {
      results.push(result);
      if (result.changes.includes('add-frontmatter')) frontmatterAdded++;
      if (result.changes.includes('add-red-carpet-cta')) ctaAdded++;
    }
  }

  // Report
  console.log(`\n━━━ RESULTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total letters scanned: ${allFiles.length}`);
  console.log(`Letters needing frontmatter: ${frontmatterAdded}`);
  console.log(`Letters needing Red Carpet CTA: ${ctaAdded}`);
  console.log(`Total changes: ${results.length} files\n`);

  if (results.length > 0) {
    console.log('Changed files:');
    for (const r of results) {
      console.log(`  ${r.file} → ${r.changes.join(', ')}`);
    }
  }

  if (dryRun && results.length > 0) {
    console.log(`\nRun with --apply to write changes.`);
  }

  // Generate comprehensive sync map
  if (args.includes('--sync-map')) {
    console.log(`\n━━━ SYNC MAP (for cephasSync.ts) ━━━━━━━`);
    const mapEntries = generateSyncMapUpdate(allFiles);
    for (const entry of mapEntries) {
      console.log(entry);
    }
  }

  return results.length;
}

const changedCount = main();
process.exit(0);
