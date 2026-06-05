#!/usr/bin/env node
/**
 * BP075 -- Download Ollama binary for the current platform into resources/ollama/.
 *
 * Run before `npm run dist` on any build machine:
 *   npm run prepare:ollama-binary
 *
 * Downloads the latest Ollama release from GitHub for the current platform.
 * The binary is placed at resources/ollama/ollama[.exe] so electron-builder
 * picks it up via the extraResources rule.
 *
 * resources/ollama/ollama.exe is .gitignored (too large for git; regenerate on each build).
 */
import { createWriteStream, existsSync, mkdirSync, statSync, chmodSync } from 'fs';
import { join } from 'path';
import { get } from 'https';
import { platform } from 'os';

const DEST_DIR = join(process.cwd(), 'resources', 'ollama');
const BINARY_NAME = process.platform === 'win32' ? 'ollama.exe' : 'ollama';
const DEST_PATH = join(DEST_DIR, BINARY_NAME);

// Minimum acceptable size: 20 MB (guards against corrupt/truncated downloads)
const MIN_SIZE_BYTES = 20 * 1024 * 1024;

function getDownloadURL() {
  switch (process.platform) {
    case 'win32':
      return 'https://github.com/ollama/ollama/releases/latest/download/ollama-windows-amd64.exe';
    case 'darwin':
      return 'https://github.com/ollama/ollama/releases/latest/download/ollama-darwin';
    case 'linux':
      return 'https://github.com/ollama/ollama/releases/latest/download/ollama-linux-amd64';
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
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
          // Follow redirect
          doGet(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
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
              process.stdout.write(`\r[download-ollama-binary] ${pct}% (${mb} / ${total} MB)   `);
            }
          }
        });
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          process.stdout.write('\n');
          resolve();
        });
      }).on('error', reject);
    };

    doGet(url);
  });
}

async function main() {
  mkdirSync(DEST_DIR, { recursive: true });

  // Check if already present and large enough
  if (existsSync(DEST_PATH)) {
    const size = statSync(DEST_PATH).size;
    if (size >= MIN_SIZE_BYTES) {
      console.log(`[download-ollama-binary] Already present: ${DEST_PATH} (${(size / 1_048_576).toFixed(1)} MB). Skipping download.`);
      return;
    }
    console.log(`[download-ollama-binary] Existing binary too small (${size} bytes) -- re-downloading.`);
  }

  const url = getDownloadURL();
  console.log(`[download-ollama-binary] Downloading Ollama binary for ${process.platform} from:\n  ${url}`);
  console.log(`[download-ollama-binary] Destination: ${DEST_PATH}`);

  try {
    await downloadFile(url, DEST_PATH);
  } catch (err) {
    console.error(`[download-ollama-binary] Download failed: ${err.message}`);
    process.exit(1);
  }

  const size = statSync(DEST_PATH).size;
  if (size < MIN_SIZE_BYTES) {
    console.error(`[download-ollama-binary] Downloaded file too small (${size} bytes). Aborting.`);
    process.exit(1);
  }

  // Make executable on Unix
  if (process.platform !== 'win32') {
    chmodSync(DEST_PATH, 0o755);
  }

  console.log(`[download-ollama-binary] Done. ${DEST_PATH} (${(size / 1_048_576).toFixed(1)} MB)`);
  console.log('[download-ollama-binary] Ready for electron-builder extraResources.');
}

main();
