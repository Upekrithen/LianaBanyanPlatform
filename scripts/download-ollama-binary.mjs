#!/usr/bin/env node
/**
 * BP075 / v0.1.46 hotfix -- Download Ollama binary for the current platform into resources/ollama/.
 *
 * Run before `npm run dist` on any build machine:
 *   npm run prepare:ollama-binary
 *
 * Downloads the latest Ollama release from GitHub for the current platform.
 * The binary is placed at resources/ollama/ollama[.exe] so electron-builder
 * picks it up via the extraResources rule.
 *
 * resources/ollama/ollama.exe is .gitignored (too large for git; regenerate on each build).
 *
 * BREAKING CHANGE (Ollama >= v0.30.7):
 *   Windows no longer ships a direct ollama-windows-amd64.exe binary.
 *   The release asset is now ollama-windows-amd64.zip (contains ollama.exe + GPU libs).
 *   This script downloads the zip, extracts ollama.exe, and cleans up.
 */
import { createWriteStream, existsSync, mkdirSync, statSync, chmodSync, unlinkSync, readdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { get } from 'https';
import { tmpdir } from 'os';
import { execSync } from 'child_process';

const DEST_DIR = join(process.cwd(), 'resources', 'ollama');
const BINARY_NAME = process.platform === 'win32' ? 'ollama.exe' : 'ollama';
const DEST_PATH = join(DEST_DIR, BINARY_NAME);

// Minimum acceptable size: 20 MB (guards against corrupt/truncated downloads)
const MIN_SIZE_BYTES = 20 * 1024 * 1024;

// Win32: download a zip and extract ollama.exe + required DLLs from it.
// The zip URL changes were introduced in Ollama v0.30.7.
const WIN32_ZIP_URL = 'https://github.com/ollama/ollama/releases/latest/download/ollama-windows-amd64.zip';

function getDownloadURL() {
  switch (process.platform) {
    case 'win32':
      // v0.30.7+: Windows ships as a zip (not a direct .exe).
      // downloadAndExtractWin32() handles the download+extract for this platform.
      return WIN32_ZIP_URL;
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

/**
 * Win32 zip extraction: downloads the zip to a temp path, uses PowerShell
 * Expand-Archive to extract, finds ollama.exe in the extracted tree, copies
 * it to DEST_DIR, and also copies any .dll files alongside it (GPU libs).
 * Cleans up temp artifacts on completion.
 */
async function downloadAndExtractWin32() {
  mkdirSync(DEST_DIR, { recursive: true });

  const zipName = `ollama_win32_${Date.now()}.zip`;
  const zipPath = join(tmpdir(), zipName);
  const extractDir = join(tmpdir(), `ollama_extract_${Date.now()}`);

  console.log(`[download-ollama-binary] Win32: downloading zip from:\n  ${WIN32_ZIP_URL}`);
  console.log(`[download-ollama-binary] Temp zip: ${zipPath}`);

  try {
    await downloadFile(WIN32_ZIP_URL, zipPath);
  } catch (err) {
    console.error(`[download-ollama-binary] Download failed: ${err.message}`);
    process.exit(1);
  }

  const zipSize = statSync(zipPath).size;
  if (zipSize < MIN_SIZE_BYTES) {
    console.error(`[download-ollama-binary] Downloaded zip too small (${zipSize} bytes) — possible redirect/error page. Aborting.`);
    process.exit(1);
  }
  console.log(`[download-ollama-binary] Downloaded ${(zipSize / 1_048_576).toFixed(1)} MB. Extracting...`);

  mkdirSync(extractDir, { recursive: true });
  try {
    execSync(
      `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${extractDir}' -Force"`,
      { stdio: 'inherit', timeout: 120_000 },
    );
  } catch (err) {
    console.error(`[download-ollama-binary] Extraction failed: ${err.message}`);
    process.exit(1);
  }

  // Recursively find ollama.exe in extracted tree
  function findFile(dir, name) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = findFile(full, name);
        if (found) return found;
      } else if (entry.name.toLowerCase() === name.toLowerCase()) {
        return full;
      }
    }
    return null;
  }

  const exeSrc = findFile(extractDir, 'ollama.exe');
  if (!exeSrc) {
    console.error('[download-ollama-binary] ollama.exe not found in extracted archive. Directory listing:');
    try {
      execSync(`dir /s /b "${extractDir}" 2>&1`, { stdio: 'inherit', shell: true });
    } catch {}
    process.exit(1);
  }

  console.log(`[download-ollama-binary] Found ollama.exe at: ${exeSrc}`);
  copyFileSync(exeSrc, DEST_PATH);
  const exeSize = statSync(DEST_PATH).size;
  console.log(`[download-ollama-binary] Copied ollama.exe (${(exeSize / 1_048_576).toFixed(1)} MB) → ${DEST_PATH}`);

  // Also copy any DLLs from the same directory as ollama.exe (GPU runtime libs)
  const exeDir = dirname(exeSrc);
  const dlls = readdirSync(exeDir).filter((f) => f.toLowerCase().endsWith('.dll'));
  for (const dll of dlls) {
    const src = join(exeDir, dll);
    const dst = join(DEST_DIR, dll);
    copyFileSync(src, dst);
  }
  if (dlls.length > 0) {
    console.log(`[download-ollama-binary] Copied ${dlls.length} DLL(s) alongside ollama.exe.`);
  }

  // Cleanup temp files
  try { unlinkSync(zipPath); } catch {}
  try { execSync(`powershell -NoProfile -Command "Remove-Item -Recurse -Force '${extractDir}'"`, { stdio: 'ignore' }); } catch {}

  console.log(`[download-ollama-binary] Done. resources/ollama/ ready for electron-builder.`);
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

  // Win32: zip download + extract (Ollama >= v0.30.7 ships zip, not direct exe)
  if (process.platform === 'win32') {
    await downloadAndExtractWin32();
    return;
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
