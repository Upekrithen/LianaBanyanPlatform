#!/usr/bin/env node
/**
 * K419 — Triple Scrambler Hook Installer
 * Adds/updates Cursor hooks for automatic verification triggers.
 * Run: node librarian-mcp/scripts/install-hooks.js
 */

const fs = require("fs");
const path = require("path");

const WORKSPACE_ROOT = path.resolve(__dirname, "..", "..");
const HOOKS_JSON = path.join(WORKSPACE_ROOT, ".cursor", "hooks.json");
const HOOKS_DIR = path.join(WORKSPACE_ROOT, ".cursor", "hooks");
const HOOK_SCRIPT = path.join(HOOKS_DIR, "scrambler-sweep.ps1");

const REQUIRED_HOOKS = {
  postToolUse: [
    {
      command: "powershell -ExecutionPolicy Bypass -File .cursor/hooks/scrambler-sweep.ps1",
      matcher: "MCP: user-librarian/moneypenny_debrief",
      timeout: 35,
    },
    {
      command: "powershell -ExecutionPolicy Bypass -File .cursor/hooks/scrambler-sweep.ps1",
      matcher: "MCP: user-librarian/touchstone_complete",
      timeout: 35,
    },
  ],
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function loadExisting() {
  if (!fs.existsSync(HOOKS_JSON)) {
    return { version: 1, hooks: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(HOOKS_JSON, "utf-8"));
  } catch {
    console.warn("Could not parse existing hooks.json — creating fresh.");
    return { version: 1, hooks: {} };
  }
}

function mergeHooks(existing) {
  const config = { ...existing, version: 1 };
  config.hooks = config.hooks || {};

  for (const [event, newHooks] of Object.entries(REQUIRED_HOOKS)) {
    const eventHooks = config.hooks[event] || [];

    for (const newHook of newHooks) {
      const existingIdx = eventHooks.findIndex(
        (h) => h.matcher === newHook.matcher
      );
      if (existingIdx >= 0) {
        eventHooks[existingIdx] = { ...eventHooks[existingIdx], ...newHook };
        console.log(`Updated hook: ${event} / ${newHook.matcher}`);
      } else {
        eventHooks.push(newHook);
        console.log(`Added hook: ${event} / ${newHook.matcher}`);
      }
    }

    config.hooks[event] = eventHooks;
  }

  return config;
}

function ensureHookScript() {
  if (fs.existsSync(HOOK_SCRIPT)) {
    console.log(`Hook script already exists: ${HOOK_SCRIPT}`);
    return;
  }

  const script = `# K419 Triple Scrambler — Post-tool-use hook
$env:PYTHONIOENCODING = "utf-8"
$ScramberDir = Join-Path $PSScriptRoot "..\\..\\librarian-mcp\\scrambler"
$ReportDir = Join-Path $PSScriptRoot "..\\..\\librarian-mcp\\data\\scrambler-reports"

if (-Not (Test-Path $ReportDir)) {
    New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyy-MM-ddTHH-mm-ss"
$ReportPath = Join-Path $ReportDir "$Timestamp.json"

try {
    $input_json = [Console]::In.ReadToEnd()
    $result = python (Join-Path $ScramberDir "reconcile.py") "hook_trigger" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $result | Out-File -FilePath $ReportPath -Encoding utf8
    }
} catch {}

Write-Output '{}'
`;

  fs.writeFileSync(HOOK_SCRIPT, script, "utf-8");
  console.log(`Created hook script: ${HOOK_SCRIPT}`);
}

// Main
console.log("K419 Triple Scrambler Hook Installer");
console.log("====================================\n");

ensureDir(HOOKS_DIR);
ensureHookScript();

const existing = loadExisting();
const merged = mergeHooks(existing);
fs.writeFileSync(HOOKS_JSON, JSON.stringify(merged, null, 2) + "\n", "utf-8");

console.log(`\nWrote: ${HOOKS_JSON}`);
console.log("Done. Cursor will auto-reload hooks on save.");
