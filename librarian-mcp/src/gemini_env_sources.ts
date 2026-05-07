/**
 * BP028 — Resolve GEMINI_API_KEY for Rook / Google AI when MCP child process
 * does not inherit the parent shell env. Priority:
 *   1. process.env.GEMINI_API_KEY
 *   2. ~/.gemini/settings.json → mcpServers.librarian.env.GEMINI_API_KEY
 *   3. Asteroid-ProofVault/LockBox/SDS.env
 *
 * Never logs key values.
 * Filename avoids * _KEY * .gitignore credential pattern.
 */

import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__dirname, "..");

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
}

function readGeminiFromSdsEnv(): { key: string; sourcePath: string } | null {
  const sdsPath = resolve(LIBRARIAN_ROOT, "..", "Asteroid-ProofVault", "LockBox", "SDS.env");
  if (!existsSync(sdsPath)) return null;
  const text = readFileSync(sdsPath, "utf-8");
  const prefix = "GEMINI_API_KEY=";
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith(prefix)) {
      const v = line.slice(prefix.length).trim().replace(/^["']|["']$/g, "");
      if (v) return { key: v, sourcePath: sdsPath };
    }
  }
  return null;
}

function readGeminiFromGeminiSettings(): { key: string; sourcePath: string } | null {
  const settingsPath = resolve(homedir(), ".gemini", "settings.json");
  if (!existsSync(settingsPath)) return null;
  try {
    const raw = stripBom(readFileSync(settingsPath, "utf-8"));
    const j = JSON.parse(raw) as Record<string, unknown>;
    const mcp = j["mcpServers"] as Record<string, unknown> | undefined;
    const librarian = mcp?.["librarian"] as Record<string, unknown> | undefined;
    const envBlock = librarian?.["env"] as Record<string, unknown> | undefined;
    const k = envBlock?.["GEMINI_API_KEY"];
    if (typeof k === "string" && k.trim()) {
      return {
        key: k.trim(),
        sourcePath: `${settingsPath} → mcpServers.librarian.env.GEMINI_API_KEY`,
      };
    }
  } catch {
    /* malformed settings */
  }
  return null;
}

/** Resolution order per BP028. */
export function resolveGeminiApiKey(): { key: string | undefined; sourcePath: string } {
  const envKey = process.env["GEMINI_API_KEY"];
  if (envKey?.trim()) {
    return { key: envKey.trim(), sourcePath: "process.env:GEMINI_API_KEY" };
  }
  const fromSettings = readGeminiFromGeminiSettings();
  if (fromSettings) return { key: fromSettings.key, sourcePath: fromSettings.sourcePath };

  const fromSds = readGeminiFromSdsEnv();
  if (fromSds) return { key: fromSds.key, sourcePath: fromSds.sourcePath };

  return { key: undefined, sourcePath: "(none)" };
}

/** One-line health payload: source path only, no secret material. */
export function getGeminiKeyHealth(): {
  ok: boolean;
  key_source: string | null;
  hint?: string;
} {
  const r = resolveGeminiApiKey();
  if (r.key) return { ok: true, key_source: r.sourcePath };
  return {
    ok: false,
    key_source: null,
    hint:
      "No GEMINI_API_KEY found. Configure one of: process.env.GEMINI_API_KEY; " +
      "~/.gemini/settings.json at mcpServers.librarian.env.GEMINI_API_KEY; " +
      "Asteroid-ProofVault/LockBox/SDS.env (GEMINI_API_KEY=...).",
  };
}
