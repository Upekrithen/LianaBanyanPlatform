#!/usr/bin/env node
/**
 * BP080 / SEG-V0147-FIX-4 — Download Microsoft VC++ 2019 x64 Redistributable
 *
 * Pulls vc_redist.x64.exe from https://aka.ms/vs/17/release/vc_redist.x64.exe
 * into resources/vcredist/. Pins SHA-256 to a sidecar file for assert verification.
 *
 * Required by Ollama v0.30.7+ on Windows — silently fails to spawn without it.
 *
 * Usage:
 *   npm run prepare:vcredist
 *
 * On first run: downloads and pins SHA-256 to resources/vcredist/vc_redist.x64.exe.sha256
 * On subsequent runs: verifies existing file against pinned SHA-256; re-downloads if changed.
 *
 * Wire into: dist:win and publish:win before electron-builder (see package.json scripts).
 */

import { createWriteStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { get } from 'https';
import { createHash } from 'crypto';

const VCREDIST_URL = 'https://aka.ms/vs/17/release/vc_redist.x64.exe';
const DEST_DIR = join(process.cwd(), 'resources', 'vcredist');
const DEST_PATH = join(DEST_DIR, 'vc_redist.x64.exe');
const SHA256_PATH = join(DEST_DIR, 'vc_redist.x64.exe.sha256');

// Sanity bounds — vc_redist.x64.exe is typically ~25 MB (never < 10 MB, never > 50 MB)
const MIN_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_SIZE_BYTES = 50 * 1024 * 1024;

function sha256File(filePath) {
  const hash = createHash('sha256');
  hash.update(readFileSync(filePath));
  return hash.digest('hex').toUpperCase();
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    let totalBytes = 0;
    let downloadedBytes = 0;
    let lastPct = -1;

    const doGet = (u) => {
      get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          doGet(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          reject(new Error(`HTTP ${res.statusCode} from ${u}`));
          return;
        }
        totalBytes = parseInt(res.headers['content-length'] || '0', 10);
        res.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          if (totalBytes > 0) {
            const pct = Math.round((downloadedBytes / totalBytes) * 100);
            if (pct !== lastPct && pct % 10 === 0) {
              lastPct = pct;
              const mb = (downloadedBytes / 1_048_576).toFixed(1);
              const total = (totalBytes / 1_048_576).toFixed(1);
              process.stdout.write(`\r[download-vcredist] ${pct}% (${mb} / ${total} MB)   `);
            }
          }
        });
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          process.stdout.write('\n');
          resolve();
        });
        res.on('error', (err) => {
          file.close();
          reject(err);
        });
      }).on('error', reject);
    };

    doGet(url);
  });
}

async function main() {
  mkdirSync(DEST_DIR, { recursive: true });

  // Check if already present with matching pinned SHA-256
  if (existsSync(DEST_PATH) && existsSync(SHA256_PATH)) {
    const size = statSync(DEST_PATH).size;
    if (size >= MIN_SIZE_BYTES && size <= MAX_SIZE_BYTES) {
      const pinnedHash = readFileSync(SHA256_PATH, 'utf8').trim();
      const actualHash = sha256File(DEST_PATH);
      if (pinnedHash === actualHash) {
        console.log(`[download-vcredist] Already present: ${DEST_PATH} (${(size / 1_048_576).toFixed(1)} MB)`);
        console.log(`[download-vcredist] SHA-256 verified: ${actualHash}`);
        return;
      }
      console.log(`[download-vcredist] SHA-256 mismatch vs pinned (Microsoft may have updated). Re-downloading.`);
      console.log(`[download-vcredist]   Pinned: ${pinnedHash}`);
      console.log(`[download-vcredist]   Actual: ${actualHash}`);
    }
  } else if (existsSync(DEST_PATH)) {
    const size = statSync(DEST_PATH).size;
    if (size >= MIN_SIZE_BYTES && size <= MAX_SIZE_BYTES) {
      // File exists but no SHA-256 sidecar — compute and pin it now
      const sha256 = sha256File(DEST_PATH);
      writeFileSync(SHA256_PATH, sha256 + '\n', 'utf8');
      console.log(`[download-vcredist] Already present: ${DEST_PATH} (${(size / 1_048_576).toFixed(1)} MB)`);
      console.log(`[download-vcredist] SHA-256 computed and pinned: ${sha256}`);
      return;
    }
  }

  console.log(`[download-vcredist] Downloading VC++ 2019 x64 Redistributable from:`);
  console.log(`  ${VCREDIST_URL}`);
  console.log(`[download-vcredist] Destination: ${DEST_PATH}`);
  console.log(`[download-vcredist] This is required by Ollama v0.30.7+ on Windows.`);

  try {
    await downloadFile(VCREDIST_URL, DEST_PATH);
  } catch (err) {
    console.error(`[download-vcredist] Download failed: ${err.message}`);
    process.exit(1);
  }

  const size = statSync(DEST_PATH).size;
  if (size < MIN_SIZE_BYTES) {
    console.error(`[download-vcredist] FAIL: Downloaded file too small (${size} bytes < ${MIN_SIZE_BYTES} min).`);
    console.error(`[download-vcredist] Possible redirect to error page. Check URL: ${VCREDIST_URL}`);
    process.exit(1);
  }
  if (size > MAX_SIZE_BYTES) {
    console.error(`[download-vcredist] FAIL: Downloaded file unusually large (${size} bytes > ${MAX_SIZE_BYTES} max).`);
    console.error(`[download-vcredist] Check URL: ${VCREDIST_URL}`);
    process.exit(1);
  }

  const sha256 = sha256File(DEST_PATH);
  writeFileSync(SHA256_PATH, sha256 + '\n', 'utf8');

  console.log(`[download-vcredist] Done. vc_redist.x64.exe (${(size / 1_048_576).toFixed(1)} MB)`);
  console.log(`[download-vcredist] SHA-256: ${sha256}`);
  console.log(`[download-vcredist] Pinned to: ${SHA256_PATH}`);
  console.log(`[download-vcredist] Ready for electron-builder extraResources.`);
}

main();
