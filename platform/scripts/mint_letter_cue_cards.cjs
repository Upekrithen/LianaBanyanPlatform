#!/usr/bin/env node
/**
 * Letter → Cue Card Minting Pipeline
 * ===================================
 * Reads letters from Cephas Hugo content, extracts key messages,
 * and generates cue card templates for Hofund Studio.
 *
 * Outputs:
 *   1. SQL migration for cue_card_templates (Supabase)
 *   2. TypeScript data file for client-side rendering
 *
 * Usage:
 *   node platform/scripts/mint_letter_cue_cards.cjs              # preview
 *   node platform/scripts/mint_letter_cue_cards.cjs --generate   # write files
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CEPHAS_LETTERS = path.join(ROOT, 'Cephas', 'cephas-hugo', 'content', 'letters');

const GRADIENT_PALETTE = [
  'from-blue-900/80 to-indigo-800/80',
  'from-emerald-900/80 to-teal-800/80',
  'from-purple-900/80 to-violet-800/80',
  'from-orange-900/80 to-amber-800/80',
  'from-rose-900/80 to-pink-800/80',
  'from-cyan-900/80 to-sky-800/80',
  'from-slate-800/80 to-zinc-700/80',
  'from-red-900/80 to-orange-800/80',
  'from-lime-900/80 to-green-800/80',
  'from-fuchsia-900/80 to-purple-800/80',
];

const INITIATIVE_SLUGS = {
  "Let's Make Dinner": 'lmd',
  "Let's Get Groceries": 'groceries',
  "Let's Go Shopping": 'shopping',
  'Household Concierge': 'concierge',
  'The Family Table': 'family-table',
  'LifeLine Medications': 'lifeline',
  'MSA': 'msa',
  'Defense Klaus': 'defense-klaus',
  'Rally Group': 'rally-group',
  'VSL': 'vsl',
  "Let's Make Bread": 'bread',
  'Harper Guild': 'harper-guild',
  'JukeBox': 'jukebox',
  'Didasko': 'didasko',
  'International': 'international',
  'Power to the People': 'political-expedition',
};

function parseFrontmatter(content) {
  if (!content.trimStart().startsWith('---')) return { meta: {}, body: content };
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) {
      let val = kv[2].trim().replace(/^"(.*)"$/, '$1');
      meta[kv[1]] = val;
    }
  }
  return { meta, body: match[2] };
}

function extractKeyQuote(body) {
  const lines = body.split('\n').filter(l => l.trim().length > 20);

  // Look for strong opening lines (first paragraph after salutation)
  const dearIdx = lines.findIndex(l => /^Dear\s/.test(l.trim()));
  if (dearIdx >= 0 && dearIdx + 1 < lines.length) {
    const nextParagraph = lines.slice(dearIdx + 1, dearIdx + 4)
      .filter(l => !l.startsWith('#') && !l.startsWith('---') && l.trim().length > 0);
    if (nextParagraph.length > 0) {
      const quote = nextParagraph[0].trim();
      if (quote.length <= 200) return quote;
      return quote.substring(0, 197) + '...';
    }
  }

  // Fallback: first non-header, non-empty line
  const candidate = lines.find(l =>
    !l.startsWith('#') && !l.startsWith('---') && !l.startsWith('Dear') && !l.startsWith('**')
  );
  if (candidate) {
    const trimmed = candidate.trim();
    return trimmed.length <= 200 ? trimmed : trimmed.substring(0, 197) + '...';
  }

  return 'Help each other help ourselves.';
}

function extractPlatformAsk(body) {
  const asks = [];
  const lines = body.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/what\s+i.m\s+asking|what\s+we.re\s+asking|the\s+ask|what\s+this\s+is/i.test(line)) {
      const nextLines = lines.slice(i + 1, i + 5)
        .filter(l => l.trim().length > 0 && !l.startsWith('#') && !l.startsWith('---'));
      if (nextLines.length > 0) {
        asks.push(nextLines[0].trim());
      }
    }
  }

  if (asks.length > 0) {
    const ask = asks[0];
    return ask.length <= 180 ? ask : ask.substring(0, 177) + '...';
  }
  return null;
}

function buildCueCard(filename, category, meta, body) {
  const slug = filename.replace('.md', '');
  const recipient = meta.recipient || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const title = meta.title || `Letter to ${recipient}`;
  const initiative = meta.initiative || null;
  const initiativeSlug = initiative ? (INITIATIVE_SLUGS[initiative] || category) : category;

  const keyQuote = extractKeyQuote(body);
  const platformAsk = extractPlatformAsk(body);

  const front = [
    `📬 ${title.toUpperCase()}`,
    '',
    keyQuote,
    '',
    'Cost + 20% = Creators keep 83.3%',
    '$5/year membership. Worker-owned.',
    '',
    'lianabanyan.com/RedCarpet',
  ].join('\n');

  const backParts = [
    `WHY ${recipient.toUpperCase()}?`,
    '',
  ];
  if (initiative) {
    backParts.push(`Initiative: ${initiative}`);
    backParts.push('');
  }
  if (platformAsk) {
    backParts.push(platformAsk);
    backParts.push('');
  }
  backParts.push(
    'Liana Banyan is a cooperative economic',
    'ecosystem where communities pool resources',
    'and share services.',
    '',
    '16 initiatives. 1,754 innovations.',
    '8 provisional patents. $5/year.',
    '',
    'Help Each Other Help Ourselves.',
  );

  const back = backParts.join('\n');

  const tags = [category, slug, 'letter', 'LianaBanyan'];
  if (initiative) tags.push(initiativeSlug);

  const twitterText = `📬 ${title}\n\n${keyQuote.substring(0, 180)}\n\nCost + 20%. Creators keep 83.3%. $5/year.\n\nlianabanyan.com/RedCarpet\n\n#LianaBanyan #WorkerOwned`;
  const linkedinText = `${title}\n\n${keyQuote}\n\nLiana Banyan is building cooperative economic infrastructure:\n• Cost + 20% (creators keep 83.3%)\n• 16 integrated initiatives\n• 1,754 innovations, 8 provisional patents\n• $5/year membership\n\nlianabanyan.com/RedCarpet`;

  return {
    id: `letter-${slug}`,
    title,
    subtitle: initiative ? `${meta.letter_type || 'Letter'} — ${initiative}` : (meta.letter_type || 'Letter'),
    front,
    back,
    category: category,
    tags,
    initiative_slug: initiativeSlug,
    background_value: GRADIENT_PALETTE[Math.abs(hashCode(slug)) % GRADIENT_PALETTE.length],
    twitter_text: twitterText,
    linkedin_text: linkedinText,
  };
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function escapeSQL(str) {
  return str.replace(/'/g, "''");
}

function generateSQL(cards) {
  const lines = [
    '-- Letter Cue Card Templates (auto-generated)',
    `-- Generated: ${new Date().toISOString().split('T')[0]}`,
    `-- Total: ${cards.length} cards from Cephas letters`,
    '',
  ];

  for (const card of cards) {
    lines.push(`INSERT INTO public.cue_card_templates (`);
    lines.push(`  template_type, initiative_slug, title, subtitle, body_text, hashtags,`);
    lines.push(`  background_type, background_value, card_style, twitter_text, linkedin_text,`);
    lines.push(`  is_active, sort_order`);
    lines.push(`) VALUES (`);
    lines.push(`  'letter', '${escapeSQL(card.initiative_slug)}',`);
    lines.push(`  '${escapeSQL(card.title)}', '${escapeSQL(card.subtitle)}',`);
    lines.push(`  E'${escapeSQL(card.front)}',`);
    lines.push(`  ARRAY[${card.tags.map(t => `'${escapeSQL(t)}'`).join(', ')}],`);
    lines.push(`  'gradient', '${card.background_value}', 'bold',`);
    lines.push(`  E'${escapeSQL(card.twitter_text)}',`);
    lines.push(`  E'${escapeSQL(card.linkedin_text)}',`);
    lines.push(`  true, ${cards.indexOf(card) + 1}`);
    lines.push(`) ON CONFLICT DO NOTHING;`);
    lines.push('');
  }

  return lines.join('\n');
}

function generateTS(cards) {
  const lines = [
    '/**',
    ' * LETTER CUE CARDS (Auto-generated from Cephas letters)',
    ' * =====================================================',
    ` * Generated: ${new Date().toISOString().split('T')[0]}`,
    ` * Total: ${cards.length} cards`,
    ' * Re-generate: node scripts/mint_letter_cue_cards.cjs --generate',
    ' */',
    '',
    'export const LETTER_CUE_CARDS = [',
  ];

  for (const card of cards) {
    lines.push('  {');
    lines.push(`    id: '${card.id}',`);
    lines.push(`    title: ${JSON.stringify(card.title)},`);
    lines.push(`    subtitle: ${JSON.stringify(card.subtitle)},`);
    lines.push(`    front: ${JSON.stringify(card.front)},`);
    lines.push(`    back: ${JSON.stringify(card.back)},`);
    lines.push(`    category: '${card.category}',`);
    lines.push(`    tags: ${JSON.stringify(card.tags)},`);
    if (card.initiative_slug !== card.category) {
      lines.push(`    endpoint: 'https://cephas.lianabanyan.com/${card.category === 'pitches' ? 'letters/pitches' : 'letters/' + card.category}/',`);
    }
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');
  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const generate = args.includes('--generate');

  console.log(`\n🃏  Letter → Cue Card Minting Pipeline${generate ? ' (GENERATING)' : ' (PREVIEW)'}\n`);

  const cards = [];
  const categories = fs.readdirSync(CEPHAS_LETTERS, { withFileTypes: true });

  // Root-level letters
  for (const entry of categories) {
    if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== '_index.md') {
      const content = fs.readFileSync(path.join(CEPHAS_LETTERS, entry.name), 'utf-8');
      const { meta, body } = parseFrontmatter(content);
      cards.push(buildCueCard(entry.name, 'crown-letter', meta, body));
    }
  }

  // Category subdirectories
  const targetCategories = ['circle-1-investors', 'circle-2-media', 'circle-3-academics', 'crown-initiative', 'blessing'];
  for (const entry of categories) {
    if (!entry.isDirectory() || !targetCategories.includes(entry.name)) continue;
    const catDir = path.join(CEPHAS_LETTERS, entry.name);
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md') && f !== '_index.md');
    for (const file of files) {
      const content = fs.readFileSync(path.join(catDir, file), 'utf-8');
      const { meta, body } = parseFrontmatter(content);
      cards.push(buildCueCard(file, entry.name, meta, body));
    }
  }

  console.log(`Generated ${cards.length} cue cards from letters\n`);
  console.log('Categories:');
  const byCat = {};
  for (const card of cards) {
    byCat[card.category] = (byCat[card.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(byCat)) {
    console.log(`  ${cat}: ${count}`);
  }

  if (generate) {
    const sqlPath = path.join(ROOT, 'platform', 'supabase', 'migrations', '20260319000001_letter_cue_card_templates.sql');
    const tsPath = path.join(ROOT, 'platform', 'src', 'data', 'letterCueCards.ts');

    fs.writeFileSync(sqlPath, generateSQL(cards), 'utf-8');
    console.log(`\n✅ SQL migration: ${path.relative(ROOT, sqlPath)}`);

    fs.writeFileSync(tsPath, generateTS(cards), 'utf-8');
    console.log(`✅ TypeScript data: ${path.relative(ROOT, tsPath)}`);
  } else {
    console.log('\nSample card:');
    console.log(JSON.stringify(cards[0], null, 2));
    console.log(`\nRun with --generate to write SQL migration and TS data file.`);
  }

  return cards.length;
}

main();
