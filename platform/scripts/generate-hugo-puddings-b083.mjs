#!/usr/bin/env node
/**
 * Generate Hugo .md files for Puddings #160-#181 from BISHOP_DROPZONE source files.
 * Outputs to Cephas/cephas-hugo/content/pudding/
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DROPZONE = join(process.cwd(), '..', 'BISHOP_DROPZONE', '05_Puddings');
const OUTPUT_DIR = join(process.cwd(), '..', 'Cephas', 'cephas-hugo', 'content', 'pudding');

const PUDDING_META = {
  160: { slug: 'the-ratchet', tags: ['credits', 'economics', 'one-way-valve', 'cost-plus-twenty'], spice: 'garlic' },
  161: { slug: 'your-castle-ready-on-day-one', tags: ['cold-start', 'helm', 'onboarding', 'new-member'], spice: 'sugar' },
  162: { slug: 'the-board-game-lobby', tags: ['crew-call', 'team-formation', 'projects', 'collaboration'], spice: 'cumin' },
  163: { slug: 'the-red-queen', tags: ['ai', 'moneypenny', 'personal-assistant', 'helm'], spice: 'cinnamon' },
  164: { slug: 'portal-doors', tags: ['navigation', 'portals', 'nine-surfaces', 'guilds', 'tribes'], spice: 'oregano' },
  165: { slug: 'the-flywheel', tags: ['economics', 'growth', 'feedback-loop', 'cooperative'], spice: 'garlic' },
  166: { slug: 'the-labyrinth', tags: ['gamification', 'bugs', 'qa', 'rewards'], spice: 'pepper' },
  167: { slug: 'project-seed', tags: ['production-levels', 'milestones', 'project-lifecycle'], spice: 'basil' },
  168: { slug: 'build-your-kingdom', tags: ['castle', 'helm', 'workspace', 'customization'], spice: 'sugar' },
  169: { slug: 'scaas-star-chamber-as-a-service', tags: ['star-chamber', 'verification', 'b2b', 'api'], spice: 'pepper' },
  170: { slug: 'the-compensation-slider', tags: ['compensation', 'cash-credit-ratio', 'service-providers'], spice: 'ginger' },
  171: { slug: 'the-chronicle-keeper', tags: ['gaming', 'game-master', 'business', 'narrative'], spice: 'cumin' },
  172: { slug: 'leave-the-corners', tags: ['generosity', 'boaz-principle', 'gleaning', 'community'], spice: 'basil' },
  173: { slug: 'from-campaign-to-novel', tags: ['gaming', 'publishing', 'collaboration', 'scribes-workshop'], spice: 'cinnamon' },
  174: { slug: 'montana-principle', tags: ['manufacturing', 'local-production', 'decentralized'], spice: 'garlic' },
  175: { slug: 'the-birthright', tags: ['marks', 'redemption', 'membership', 'benefits'], spice: 'ginger' },
  176: { slug: 'daily-mazes', tags: ['gamification', 'code-challenges', 'rewards', 'community'], spice: 'pepper' },
  177: { slug: 'your-island-your-rules', tags: ['hexisle', 'governance', 'island-ownership', 'self-rule'], spice: 'oregano' },
  178: { slug: 'the-twenty-percent-rule', tags: ['b2b', 'company-island', 'workforce', 'integration'], spice: 'garlic' },
  179: { slug: 'the-drink-cookbook', tags: ['recipes', 'documentation', 'knowledge-sharing'], spice: 'sugar' },
  180: { slug: 'wave-pricing', tags: ['pricing', 'impatience-tax', 'self-funding', 'manufacturing'], spice: 'garlic' },
  181: { slug: 'bandwagon', tags: ['bandwagon', 'taste', 'curation', 'saa', 'cooperative'], spice: 'ginger' },
};

const files = readdirSync(DROPZONE).filter(f => f.match(/PUDDING_1[6-8]\d.*B083\.md$/)).sort();

let count = 0;
for (const file of files) {
  const numMatch = file.match(/PUDDING_(\d+)/);
  if (!numMatch) continue;
  const num = parseInt(numMatch[1]);
  if (num < 160 || num > 181) continue;

  const meta = PUDDING_META[num];
  if (!meta) { console.warn(`No meta for #${num}, skipping`); continue; }

  const raw = readFileSync(join(DROPZONE, file), 'utf-8');

  // Extract title from first line
  const titleMatch = raw.match(/^#\s+Pudding #\d+\s*[—–-]\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : `Pudding #${num}`;

  // Extract content after the metadata header block
  // Find "## The Pudding" section
  const puddingIdx = raw.indexOf('## The Pudding');
  const notPuddingIdx = raw.indexOf('## This is NOT Pudding');

  let puddingContent = '';
  let notPuddingContent = '';

  if (puddingIdx !== -1 && notPuddingIdx !== -1) {
    puddingContent = raw.substring(puddingIdx, notPuddingIdx).trim();
    notPuddingContent = raw.substring(notPuddingIdx).trim();
  } else if (puddingIdx !== -1) {
    puddingContent = raw.substring(puddingIdx).trim();
  } else {
    // Fallback: skip header lines and use everything
    const lines = raw.split('\n');
    const startIdx = lines.findIndex((l, i) => i > 0 && l.startsWith('---'));
    puddingContent = lines.slice(startIdx !== -1 ? startIdx + 1 : 6).join('\n').trim();
  }

  // Build description from first paragraph of pudding content
  const firstPara = puddingContent
    .replace(/^##.*\n+/, '')
    .split('\n\n')[0]
    .replace(/\n/g, ' ')
    .trim()
    .substring(0, 200);
  const description = firstPara.length >= 200 ? firstPara.substring(0, firstPara.lastIndexOf(' ')) + '...' : firstPara;

  // Estimate reading time (~200 words per minute)
  const wordCount = raw.split(/\s+/).length;
  const readTime = Math.max(3, Math.ceil(wordCount / 200));

  const hugo = `---
title: "${title.replace(/"/g, '\\"')}"
date: 2026-04-06
draft: false
description: "${description.replace(/"/g, '\\"')}"
tags: ${JSON.stringify(meta.tags)}
categories: ["Pudding"]
weight: ${num}
author: "Bishop"
reading_time: "${readTime} min"
pudding_number: ${num}
spice: "${meta.spice}"
bishop_session: "B083"
---

${puddingContent}

---

${notPuddingContent}
`;

  const outPath = join(OUTPUT_DIR, `${meta.slug}.md`);
  writeFileSync(outPath, hugo, 'utf-8');
  count++;
  console.log(`[${count}/22] #${num} -> ${meta.slug}.md (${wordCount} words, ~${readTime} min read)`);
}

console.log(`\nDone: ${count} Hugo pudding files written to ${OUTPUT_DIR}`);
