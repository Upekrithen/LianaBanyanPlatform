#!/usr/bin/env node
/**
 * SEG-V0147-FIX-0 — electron-builder afterPack hook
 *
 * Root cause: electron-builder's extraResources respects .gitignore.
 * resources/ollama/ollama.exe is gitignored → skipped in NSIS payload.
 * win-unpacked gets the file, but the NSIS installer does not.
 *
 * This hook runs AFTER file collection but BEFORE NSIS installer generation.
 * It explicitly copies ollama.exe (and any sibling DLLs) into the packaged
 * app output directory, guaranteeing inclusion in the NSIS installer.
 *
 * If ollama.exe is not found in resources/ollama/, the build FAILS with a clear
 * error message instead of silently shipping a broken installer.
 */

import { existsSync, copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

export default async function afterPack(context) {
  const { appOutDir, electronPlatformName } = context;

  // Ollama bundling is Windows-only for now
  if (electronPlatformName !== 'win32') {
    console.log('[after-pack] Skipping Ollama copy (non-win32 platform)');
    return;
  }

  const projectRoot = context.packager.projectDir;
  const srcDir = join(projectRoot, 'resources', 'ollama');
  const destDir = join(appOutDir, 'resources', 'ollama');

  mkdirSync(destDir, { recursive: true });

  // --- Copy ollama.exe (REQUIRED) ---
  const exeSrc = join(srcDir, 'ollama.exe');
  if (!existsSync(exeSrc)) {
    console.error('[after-pack] ✗ FAIL: resources/ollama/ollama.exe NOT FOUND');
    console.error('[after-pack]   Run: npm run prepare:ollama-binary');
    console.error(`[after-pack]   Expected at: ${exeSrc}`);
    process.exit(1);
  }

  const exeDest = join(destDir, 'ollama.exe');
  copyFileSync(exeSrc, exeDest);
  const exeSize = statSync(exeDest).size;
  console.log(`[after-pack] ✓ Copied ollama.exe (${(exeSize / 1024 / 1024).toFixed(1)} MB) → resources/ollama/ollama.exe`);

  // Sanity check: reject suspiciously small binaries (corrupt download guard)
  const MIN_SIZE = 20 * 1024 * 1024;
  if (exeSize < MIN_SIZE) {
    console.error(`[after-pack] ✗ FAIL: ollama.exe is only ${exeSize} bytes — expected >${MIN_SIZE} bytes`);
    console.error('[after-pack]   Delete resources/ollama/ollama.exe and re-run: npm run prepare:ollama-binary');
    process.exit(1);
  }

  // --- Copy sibling DLLs (GPU runtime libs — optional, copy all .dll files) ---
  let dllCount = 0;
  try {
    const entries = readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (extname(entry.name).toLowerCase() !== '.dll') continue;
      const dllSrc = join(srcDir, entry.name);
      const dllDest = join(destDir, entry.name);
      copyFileSync(dllSrc, dllDest);
      dllCount++;
      console.log(`[after-pack] ✓ Copied ${entry.name}`);
    }
  } catch (err) {
    console.warn(`[after-pack] DLL copy warning (non-fatal): ${err.message}`);
  }

  // --- Copy non-binary ancillary files (Modelfile, etc.) ---
  try {
    const entries = readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = extname(entry.name).toLowerCase();
      if (ext === '.exe' || ext === '.dll') continue; // already handled
      if (entry.name.startsWith('.')) continue; // skip dotfiles (.gitkeep etc.)
      const fileSrc = join(srcDir, entry.name);
      const fileDest = join(destDir, entry.name);
      copyFileSync(fileSrc, fileDest);
      console.log(`[after-pack] ✓ Copied ${entry.name}`);
    }
  } catch (err) {
    console.warn(`[after-pack] Ancillary file copy warning (non-fatal): ${err.message}`);
  }

  console.log(`[after-pack] ✓ Ollama staging complete. ollama.exe + ${dllCount} DLL(s) → ${destDir}`);
}
