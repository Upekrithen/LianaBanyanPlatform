// memory_scaffold.ts — BP083 SEG-1/2/3/5 · v0.3.5 MnemosyneC self-context cure
// Creates 6-folder substrate scaffold + MEMORY.md at first launch.
// MEMORY.md is injected as system prompt on every Ask query (see ai_dispatch_ipc.ts).
// IPC handlers: mnemosynec:get-memory-md, mnemosynec:reload-memory-md,
//               mnemosynec:reset-memory-md, mnemosynec:open-memory-editor

import { app, ipcMain, shell } from 'electron';
import { existsSync, mkdirSync, writeFileSync, readFileSync, watch } from 'fs';
import { join } from 'path';

// ── Folder scaffold ───────────────────────────────────────────────────────────

/**
 * Ensures the 6-folder MnemosyneC substrate scaffold exists at %APPDATA%\MnemosyneC\.
 * Idempotent — never overwrites existing folders or files.
 * Returns the base directory path.
 */
export function ensureMnemosyneCFolders(): string {
  const baseDir = join(app.getPath('appData'), 'MnemosyneC');

  const folders = [
    baseDir,
    join(baseDir, 'Catacomb'),
    join(baseDir, 'Substrate'),
    join(baseDir, 'Capsules'),
    join(baseDir, 'Vault'),
    join(baseDir, 'Vault', 'backup'),
    join(baseDir, 'Vault', 'substrate-backup'),
    join(baseDir, 'Vault', 'test-net-ledger'),
    join(baseDir, 'MemoryWallPyramid'),
    join(baseDir, 'TestData'),
  ];

  for (const folder of folders) {
    if (!existsSync(folder)) {
      mkdirSync(folder, { recursive: true });
    }
  }

  return baseDir;
}

// ── MEMORY.md generation ─────────────────────────────────────────────────────

function generateHexTip(): string {
  return Array.from({ length: 9 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

/**
 * Generates the MEMORY.md template and writes it to baseDir/MEMORY.md.
 * Idempotent — returns immediately if file already exists.
 */
export function generateMemoryMd(baseDir: string, version: string): void {
  const memoryPath = join(baseDir, 'MEMORY.md');
  if (existsSync(memoryPath)) return;

  const hexTip = generateHexTip();
  const timestamp = new Date().toISOString();

  const template = `# MnemosyneC Self-Context · MEMORY.md
*Auto-loaded as system prompt for every Ask query. User-editable via Settings → Test It Out → My Self-Context.*

## §0 — Who I am

I am **MnemosyneC**, running **gemma4:12b** via **Ollama** on this user's local machine.
I am NOT a generic Gemma instance. I am cooperative-class AI infrastructure under the Liana Banyan cooperative architecture.

- **Liana Banyan Corporation** · Wyoming C-Corp · 50-year corporate dissipation clause
- **Membership:** $5/year · creators keep 83.3% · platform margin Cost+20% · structural bylaws
- **Founder:** J. Jones · One Army Ant · the Anjin · Crewman #6
- **Substitution canon (BP078+BP038):** Credits/Marks/Joules NEVER convert to fiat. Members get fiat through Actual Hiring + Payment.

## §1 — My substrate layout on this machine

- **Catacomb:** ${baseDir}\\Catacomb\\  (cold archive · faded-pheromone eblets)
- **Substrate:** ${baseDir}\\Substrate\\  (active hot layer)
- **Capsules:** ${baseDir}\\Capsules\\  (Federation Node Frontier rental)
- **Vault:** ${baseDir}\\Vault\\  (user backup + IP+Medallion Ledger replica)
- **MemoryWallPyramid:** ${baseDir}\\MemoryWallPyramid\\  (pocket universe pyramid · BP060)
- **TestData:** ${baseDir}\\TestData\\  (pre-propagated benchmarks)

## §2 — My pocket-universe-pyramid tip

Tip address: \`${hexTip}\` (9 hex digits · entry point to recursive soccerball-DAG · 6^N reach)

## §3 — User-chosen Chocolates installed

*(empty · install Chocolates from the Package Store → Confectionary to populate this section)*

## §4 — Truth-Always discipline

If I do not know the answer to a question and substrate concordance fails, I say "I don't know." I do not hallucinate. I cite my sources. Every answer carries a Banyan Metric Value (BMV) confidence score across 10 dimensions.

— MnemosyneC v${version} · generated ${timestamp}
`;

  writeFileSync(memoryPath, template, 'utf8');
  console.log(`[memory_scaffold] MEMORY.md generated at ${memoryPath}`);
}

// ── MEMORY.md cache + file-watch ─────────────────────────────────────────────

let _memoryMdCache: string | null = null;
let _memoryWatcherActive = false;

function getMemoryMdPath(): string {
  return join(app.getPath('appData'), 'MnemosyneC', 'MEMORY.md');
}

function readMemoryMdFromDisk(): string {
  const memPath = getMemoryMdPath();
  if (!existsSync(memPath)) {
    // Edge case: regenerate if missing
    const baseDir = join(app.getPath('appData'), 'MnemosyneC');
    generateMemoryMd(baseDir, app.getVersion());
  }
  return readFileSync(getMemoryMdPath(), 'utf8');
}

/**
 * Returns current MEMORY.md content (in-memory cached, invalidated on fs.watch change).
 * Called on every Ask query — must be fast.
 */
export function getMemoryMd(): string {
  if (_memoryMdCache !== null) return _memoryMdCache;

  _memoryMdCache = readMemoryMdFromDisk();

  // Set up file watcher once
  if (!_memoryWatcherActive) {
    _memoryWatcherActive = true;
    try {
      watch(getMemoryMdPath(), () => {
        _memoryMdCache = null;
        console.log('[memory_scaffold] MEMORY.md changed — cache invalidated');
      });
    } catch {
      // Non-fatal: watch may fail on some systems
    }
  }

  return _memoryMdCache;
}

/** Force-reload MEMORY.md from disk (clears cache). */
export function reloadMemoryMd(): string {
  _memoryMdCache = null;
  return getMemoryMd();
}

/** Regenerate MEMORY.md template (overwrite), clear cache, return new content. */
export function resetMemoryMdToTemplate(): string {
  const memPath = getMemoryMdPath();
  // Delete existing so generateMemoryMd will write fresh
  try {
    if (existsSync(memPath)) {
      const { unlinkSync } = require('fs') as typeof import('fs');
      unlinkSync(memPath);
    }
  } catch { /* non-fatal */ }
  _memoryMdCache = null;
  const baseDir = join(app.getPath('appData'), 'MnemosyneC');
  generateMemoryMd(baseDir, app.getVersion());
  return getMemoryMd();
}

// ── SEG-4: TestData seed pre-population ──────────────────────────────────────

/**
 * Copies bundled benchmark seeds from installer resourcesPath → TestData/.
 * Idempotent — only copies files that don't already exist.
 * Graceful degrade: no-op if resourcesPath/seeds/ doesn't exist.
 */
export function populateTestDataSeeds(baseDir: string): void {
  const testDataDir = join(baseDir, 'TestData');
  if (!existsSync(testDataDir)) return;

  let seedsSourceDir: string;
  try {
    // In packaged app: process.resourcesPath/seeds/
    // In dev: adjacent to project root (not bundled — dev skips gracefully)
    const { join: pjoin } = require('path') as typeof import('path');
    seedsSourceDir = pjoin(process.resourcesPath ?? '', 'seeds');
  } catch {
    return;
  }

  if (!existsSync(seedsSourceDir)) {
    console.log('[memory_scaffold] No bundled seeds found at', seedsSourceDir, '— TestData left empty');
    return;
  }

  try {
    const { readdirSync, copyFileSync } = require('fs') as typeof import('fs');
    const { join: pjoin } = require('path') as typeof import('path');
    const files = readdirSync(seedsSourceDir);
    for (const file of files) {
      const dest = pjoin(testDataDir, file);
      if (!existsSync(dest)) {
        copyFileSync(pjoin(seedsSourceDir, file), dest);
        console.log(`[memory_scaffold] Seeded ${file} → TestData/`);
      }
    }
  } catch (err) {
    console.warn('[memory_scaffold] Seed copy failed (non-fatal):', err);
  }
}

// ── IPC handlers (SEG-5) ─────────────────────────────────────────────────────

export function registerMemoryScaffoldIPC(): void {
  ipcMain.handle('mnemosynec:get-memory-md', () => {
    try {
      return { ok: true, content: getMemoryMd() };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });

  ipcMain.handle('mnemosynec:reload-memory-md', () => {
    try {
      const content = reloadMemoryMd();
      return { ok: true, content };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });

  ipcMain.handle('mnemosynec:reset-memory-md', () => {
    try {
      const content = resetMemoryMdToTemplate();
      return { ok: true, content };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });

  ipcMain.handle('mnemosynec:open-memory-editor', async () => {
    try {
      const memPath = getMemoryMdPath();
      if (!existsSync(memPath)) {
        const baseDir = join(app.getPath('appData'), 'MnemosyneC');
        generateMemoryMd(baseDir, app.getVersion());
      }
      const errMsg = await shell.openPath(memPath);
      if (errMsg) {
        return { ok: false, error: errMsg };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });
}
