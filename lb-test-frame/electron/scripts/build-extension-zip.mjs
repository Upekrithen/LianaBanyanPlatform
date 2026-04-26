/**
 * Build Chrome Web Store submission ZIP.
 * Run from lb-test-frame/electron/:  node scripts/build-extension-zip.mjs
 *
 * Output: dist/lb-test-frame-extension.zip
 * Ready for upload at: https://chrome.google.com/webstore/devconsole/
 *
 * K502 / B124
 */

import { createWriteStream, mkdirSync, existsSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import archiver from 'archiver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const EXT_DIR = resolve(ROOT, 'extension');
const OUT_DIR = resolve(__dirname, '../dist');
const OUT_FILE = resolve(OUT_DIR, 'lb-test-frame-extension.zip');

// Files included in the Chrome Web Store submission
const INCLUDE_PATTERNS = [
  'manifest.json',
  'background.js',
  'content.js',
  'injected.js',   // K508: MAIN world fetch interceptor for Perplexity
  'popup.js',
  'onboarding.js',
  'verify.js',
  'pages/**',
  'icons/**',
];

// Files excluded (dev artifacts, submission docs)
const EXCLUDE = [
  'CHROME_STORE_SUBMISSION.md',
  '*.md',
  'node_modules/**',
];

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const output = createWriteStream(OUT_FILE);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('warning', (err) => {
    if (err.code !== 'ENOENT') throw err;
    console.warn('[WARN]', err.message);
  });
  archive.on('error', (err) => { throw err; });

  archive.pipe(output);

  // Add extension files
  archive.glob('**', {
    cwd: EXT_DIR,
    ignore: EXCLUDE,
    dot: false,
  });

  // Bundle shared question bank into the extension
  archive.directory(resolve(ROOT, 'shared'), 'shared');

  await pipeline(
    archive,
    output,
    { end: false }
  );
  archive.finalize();

  await new Promise((resolve, reject) => {
    output.on('close', () => {
      const kb = (archive.pointer() / 1024).toFixed(1);
      console.log(`✓ Extension ZIP built: ${relative(process.cwd(), OUT_FILE)} (${kb} KB)`);
      console.log(`  Upload at: https://chrome.google.com/webstore/devconsole/`);
      resolve();
    });
    output.on('error', reject);
  });
}

main().catch((err) => {
  console.error('[ERROR] Build failed:', err.message);
  process.exit(1);
});
