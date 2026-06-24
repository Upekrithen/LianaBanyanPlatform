#!/usr/bin/env node
/**
 * generate-license-screen.js
 * BP090 Marathon 11 -- Block 2
 *
 * Generates the phase-gated RTF content for the NSIS installer click-through screen.
 * Called during electron-builder pre-pack step.
 *
 * Usage:
 *   node scripts/generate-license-screen.js
 *   BUILD_DATE=2026-07-15 node scripts/generate-license-screen.js
 *
 * Output: build-resources/LICENSE_SCREEN_BP087.rtf
 */

const fs = require('fs');
const path = require('path');

// --- Phase date boundaries (Central time) ---
const SOFT_LAUNCH_START = new Date('2026-06-22T00:00:00-05:00');
const SOFT_LAUNCH_END   = new Date('2026-06-30T23:59:59-05:00');
const DECAY_WINDOWS = [
  { id: 1, start: new Date('2026-07-01T00:00:00-05:00'), end: new Date('2026-07-30T23:59:59-05:00'), discount: '50% off for 5 years' },
  { id: 2, start: new Date('2026-07-31T00:00:00-05:00'), end: new Date('2026-08-29T23:59:59-05:00'), discount: '50% off for 4 years' },
  { id: 3, start: new Date('2026-08-30T00:00:00-05:00'), end: new Date('2026-09-28T23:59:59-05:00'), discount: '50% off for 3 years' },
  { id: 4, start: new Date('2026-09-29T00:00:00-05:00'), end: new Date('2026-10-28T23:59:59-05:00'), discount: '50% off for 2 years' },
  { id: 5, start: new Date('2026-10-29T00:00:00-05:00'), end: new Date('2026-11-27T23:59:59-06:00'), discount: '50% off for 1 year' },
];
const DECAY_END = new Date('2026-11-27T23:59:59-06:00');

// --- Determine build date ---
const buildDateStr = process.env.BUILD_DATE;
const now = buildDateStr ? new Date(buildDateStr + 'T12:00:00-05:00') : new Date();

// --- Compute phase ---
function computePhase(date) {
  if (date >= SOFT_LAUNCH_START && date <= SOFT_LAUNCH_END) return 'A';
  for (const w of DECAY_WINDOWS) {
    if (date >= w.start && date <= w.end) return 'B:' + w.id;
  }
  if (date > DECAY_END) return 'C';
  // Before soft-launch start
  return 'PRE';
}

const phase = computePhase(now);
console.log('[generate-license-screen] BUILD_DATE=' + (buildDateStr || 'now') + ' phase=' + phase);

// --- RTF builders ---
function rtfEscape(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/[^\x00-\x7F]/g, (c) => '\\u' + c.charCodeAt(0) + '?');
}

const HEADER_BLOCK = `Welcome to MnemosyneC. Dr. Mnemosynec is here to give your AI memory.`;

const BODY_BLOCK = `This software is free under the Server Side Public License (SSPL v1) for personal and cooperative use. If you wrap it as a service for paying customers, SSPL Section 13 requires you to open-source your service stack OR obtain a commercial license. Library extractions are available under Apache 2.0 for for-profit AI integrations.`;

const TWO_AXIS_MODEL = `FOUNDING LICENSEE PROGRAM -- TWO-AXIS MODEL\r\nLiana Banyan Corporation is offering Founding Licensee terms to AI companies whose products materially benefit from cooperative substrate integration. The program is structured on two independent axes: amount paid determines the discount percentage; adoption-milestone-tier-at-signing determines how long that discount lasts.\r\n\r\nMinimum participation: $1,000,000 USD. Below $1M, standard FRAND only.\r\n\r\nAxis 1 -- Amount Paid to Discount Percentage (locked at signing):\r\n$1M: 5%\r\n$2M: 12%\r\n$5M: 25%\r\n$10M: 40%\r\n$20M: 50% (maximum; linear interpolation for intermediate amounts)\r\n\r\nAxis 2 -- Adoption Milestone Tier at Signing to Discount Duration:\r\nTier 1 (0-250 users): 5 years (maximum)\r\nTier 2 (251-1,000 users): 4 years\r\nTier 3 (1,001-5,000 users): 3 years\r\nTier 4 (5,001-10,000 users): 2 years\r\nAfter 10,000 users: standard FRAND, program closed\r\n\r\nSame-day rule: Founding Licensees executing within 24 hours of each other share the same milestone tier.\r\n\r\nFounding Licensee Status (All Founding Licensees):\r\n- Named placement in launch communications\r\n- Listed on lianabanyan.com/companies-joining-in\r\n- Named in the Founder's first published Substack on the cooperative substrate\r\n\r\nProgram closes permanently when Liana Banyan reaches 10,000 platform users.\r\nContact: hello@upekrithen.com`;

const PATENT_BLOCK = `Patent Pledge #2260: by installing, you acknowledge that any patent litigation against a cooperative member revokes your patent peace.`;

const WARRANTY_BLOCK = `This software is provided as-is, without warranty of any kind. Use at your own discretion.`;

const LINK_LINE = `Read the full SSPL, Apache 2.0 extractions list, Pledge #2260, and TUP at mnemosynec.org/licensing.`;

function buildPhaseAContent() {
  return `{\\rtf1\\ansi\\deff0\r\n{\\fonttbl{\\f0 Arial;}}\r\n\\f0\\fs20\r\n${rtfEscape(HEADER_BLOCK)}\\par\\par\r\n${rtfEscape(BODY_BLOCK)}\\par\\par\r\n{\\pard\\sb200\\sa200\\brdrl\\brdrdb\\brdrw20\\brsp80\\brdrdb\\clcbpat16767648\r\nSOFT-LAUNCH EXCLUSIVE -- Available 2026-06-22 to 2026-06-30 only.\\par\r\nCommercial AI vendors: a SOFT-LAUNCH rate of 60 percent off commercial licensing (Window 1 50% + extra 10%) for a 5-year term is available through June 30, 2026.\\par\\par\r\n${rtfEscape(TWO_AXIS_MODEL).replace(/\\r\\n/g, '\\\\par\\r\n')}\\par\r\n\\pard}\\par\r\n${rtfEscape(PATENT_BLOCK)}\\par\\par\r\n{\\fs16\\cf8 ${rtfEscape(WARRANTY_BLOCK)}}\\par\\par\r\n${rtfEscape(LINK_LINE)}\\par\r\n}`;
}

function buildPhaseBContent(windowId) {
  const w = DECAY_WINDOWS.find((x) => x.id === windowId);
  const windowNote = w ? `Commercial AI vendors: Window ${w.id} terms are active -- ${w.discount} for new commercial licenses.` : 'Contact hello@upekrithen.com for current window terms.';
  return `{\\rtf1\\ansi\\deff0\r\n{\\fonttbl{\\f0 Arial;}}\r\n\\f0\\fs20\r\n${rtfEscape(HEADER_BLOCK)}\\par\\par\r\n${rtfEscape(BODY_BLOCK)}\\par\\par\r\n${rtfEscape(windowNote)}\\par\r\n${rtfEscape('Full commercial terms at mnemosynec.org/licensing. Contact: hello@upekrithen.com')}\\par\\par\r\n${rtfEscape(PATENT_BLOCK)}\\par\\par\r\n{\\fs16\\cf8 ${rtfEscape(WARRANTY_BLOCK)}}\\par\\par\r\n${rtfEscape(LINK_LINE)}\\par\r\n}`;
}

function buildPhaseCContent() {
  return `{\\rtf1\\ansi\\deff0\r\n{\\fonttbl{\\f0 Arial;}}\r\n\\f0\\fs20\r\n${rtfEscape(HEADER_BLOCK)}\\par\\par\r\n${rtfEscape(BODY_BLOCK)}\\par\\par\r\n${rtfEscape('Commercial licensing is available at full FRAND rate. Contact: hello@upekrithen.com')}\\par\\par\r\n${rtfEscape(PATENT_BLOCK)}\\par\\par\r\n{\\fs16\\cf8 ${rtfEscape(WARRANTY_BLOCK)}}\\par\\par\r\n${rtfEscape(LINK_LINE)}\\par\r\n}`;
}

// --- Generate RTF based on phase ---
let rtfContent;
if (phase === 'A') {
  rtfContent = buildPhaseAContent();
} else if (phase.startsWith('B:')) {
  const windowId = parseInt(phase.split(':')[1], 10);
  rtfContent = buildPhaseBContent(windowId);
} else {
  // Phase C or PRE -- use FRAND content
  rtfContent = buildPhaseCContent();
}

// --- Write output ---
const outputPath = path.join(__dirname, '..', 'build-resources', 'LICENSE_SCREEN_BP087.rtf');
fs.writeFileSync(outputPath, rtfContent, 'utf8');
console.log('[generate-license-screen] Written: ' + outputPath + ' (phase=' + phase + ')');
