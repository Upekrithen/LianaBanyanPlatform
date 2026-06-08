// ai_dispatch_ipc.ts -- BP077 v0.1.27 Mnem-as-interface substrate baked in
// Handles: ai-dispatch:query, list-local-models, test-connection, get-settings, save-settings
// Routes local queries through Ollama /api/chat with r10v3 substrate system-prompt layer.
// SKU gate: nano skips Mnem-DRT pipeline; core/lite use mnem_drt_enabled flag; full always runs.
// Eblet compose: top-3 local eblet snippets prepended to user message when Mnem-DRT active.

import { ipcMain } from 'electron';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';
import { FLOOR_MODEL } from '../shared/floor-model';
import { queryEbletStore } from './mnem_eblet_store';

const OLLAMA_API_BASE = 'http://localhost:11434';

type Sku = 'nano' | 'core' | 'lite' | 'full';

interface AiDispatchSettings {
  local_runtime_url: string;
  preferred_model?: string;
  sku?: Sku;
  mnem_drt_enabled?: boolean;
  mnem_drt_specialists?: {
    wikipedia?: boolean;
    wikidata?: boolean;
    arxiv?: boolean;
    wolfram?: boolean;
  };
  filtration_pipeline_enabled?: boolean;
  eblet_store_quota?: '10mb' | '100mb' | '1gb' | 'unlimited';
  federation_exchange_enabled?: boolean;
}

function getSettingsPath(): string {
  return join(app.getPath('userData'), 'ai_dispatch_settings.json');
}

function loadSettings(): AiDispatchSettings {
  const p = getSettingsPath();
  if (!existsSync(p)) return { local_runtime_url: OLLAMA_API_BASE };
  try {
    return JSON.parse(readFileSync(p, 'utf-8')) as AiDispatchSettings;
  } catch {
    return { local_runtime_url: OLLAMA_API_BASE };
  }
}

function saveSettings(settings: AiDispatchSettings): void {
  const p = getSettingsPath();
  const dir = join(p, '..');
  mkdirSync(dir, { recursive: true });
  writeFileSync(p, JSON.stringify(settings, null, 2), 'utf-8');
}

// Read the r10v3 distilled substrate text bundled at build time.
// Graceful degrade: if file is missing, returns null and the query proceeds without it.
function loadSubstrateText(): string | null {
  try {
    const substrateFile = join(__dirname, 'data', 'r10v3_substrate.txt');
    if (!existsSync(substrateFile)) {
      console.warn('[ai_dispatch] r10v3_substrate.txt not found -- proceeding without substrate inject');
      return null;
    }
    return readFileSync(substrateFile, 'utf-8').trim();
  } catch (err) {
    console.warn('[ai_dispatch] Failed to read r10v3_substrate.txt:', err, '-- proceeding without substrate inject');
    return null;
  }
}

// Determine whether Mnem-DRT pipeline (eblet store compose) should run for this SKU + settings.
// r10v3 substrate inject applies to ALL SKUs (spec §3).
// Mnem-DRT pipeline (eblet store) is gated by SKU and mnem_drt_enabled flag.
function shouldRunMnemDrt(settings: AiDispatchSettings): boolean {
  const sku = settings.sku ?? 'core';
  if (sku === 'nano') return false;
  if (sku === 'full') return true;
  // core or lite: opt-in via mnem_drt_enabled
  return settings.mnem_drt_enabled === true;
}

export function registerAiDispatchIPC(): void {
  // ── ai-dispatch:list-local-models ────────────────────────────────────────
  ipcMain.handle('ai-dispatch:list-local-models', async () => {
    const settings = loadSettings();
    const base = settings.local_runtime_url ?? OLLAMA_API_BASE;
    try {
      const res = await fetch(`${base}/api/tags`);
      if (!res.ok) return { ok: false, models: [], error: `Ollama unreachable (${res.status})` };
      const data = await res.json() as { models?: Array<{ name: string; size?: number; modified_at?: string }> };
      const models = (data.models ?? []).map((m) => ({
        name: m.name,
        size_bytes: m.size,
        modified_at: m.modified_at,
      }));
      return { ok: true, models };
    } catch (err) {
      return { ok: false, models: [], error: String(err) };
    }
  });

  // ── ai-dispatch:test-connection ──────────────────────────────────────────
  ipcMain.handle('ai-dispatch:test-connection', async () => {
    const settings = loadSettings();
    const base = settings.local_runtime_url ?? OLLAMA_API_BASE;
    try {
      const res = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
      const data = await res.json() as { models?: unknown[] };
      return { ok: true, model_count: (data.models ?? []).length };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });

  // ── ai-dispatch:get-settings ─────────────────────────────────────────────
  ipcMain.handle('ai-dispatch:get-settings', () => {
    return { ok: true, settings: loadSettings() };
  });

  // ── ai-dispatch:save-settings ────────────────────────────────────────────
  ipcMain.handle(
    'ai-dispatch:save-settings',
    (_event, incoming: Partial<AiDispatchSettings>) => {
      const current = loadSettings();
      const updated: AiDispatchSettings = { ...current };
      if (incoming.local_runtime_url !== undefined) updated.local_runtime_url = incoming.local_runtime_url;
      if (incoming.preferred_model !== undefined) updated.preferred_model = incoming.preferred_model;
      if (incoming.sku !== undefined) updated.sku = incoming.sku;
      if (incoming.mnem_drt_enabled !== undefined) updated.mnem_drt_enabled = incoming.mnem_drt_enabled;
      if (incoming.mnem_drt_specialists !== undefined) updated.mnem_drt_specialists = incoming.mnem_drt_specialists;
      if (incoming.filtration_pipeline_enabled !== undefined) updated.filtration_pipeline_enabled = incoming.filtration_pipeline_enabled;
      if (incoming.eblet_store_quota !== undefined) updated.eblet_store_quota = incoming.eblet_store_quota;
      if (incoming.federation_exchange_enabled !== undefined) updated.federation_exchange_enabled = incoming.federation_exchange_enabled;
      try {
        saveSettings(updated);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    },
  );

  // ── ai-dispatch:query ────────────────────────────────────────────────────
  // args: { court_member: string; messages: [{role, content}]; model_override?: string }
  // Returns: { ok: boolean; text?: string; error?: string; model_used?: string }
  ipcMain.handle(
    'ai-dispatch:query',
    async (
      _event,
      args: {
        court_member: string;
        messages: Array<{ role: string; content: string }>;
        model_override?: string;
      },
    ) => {
      const settings = loadSettings();
      const base = settings.local_runtime_url ?? OLLAMA_API_BASE;
      const model = args.model_override ?? settings.preferred_model ?? FLOOR_MODEL;

      // Extract the user's message text for substrate + eblet lookups.
      const userMessage = args.messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .join(' ')
        .trim();

      // Step 1: Load r10v3 substrate (all SKUs).
      const substrateText = loadSubstrateText();

      // Step 2: SKU gate -- determine if Mnem-DRT eblet compose should run.
      let systemContent = substrateText ?? '';

      if (shouldRunMnemDrt(settings) && userMessage.length > 0) {
        // Step 3: Query local eblet store for context snippets.
        // W1 TODO: stub for DRT bridge (Python subprocess) -- replace this stub when Item 6 lands.
        let ebletSnippets: string[] = [];
        try {
          ebletSnippets = await queryEbletStore(userMessage);
        } catch (err) {
          console.warn('[ai_dispatch] queryEbletStore failed:', err);
        }

        if (ebletSnippets.length > 0) {
          // Compose: substrate + eblet context + user message framing.
          const knownContext = ebletSnippets.join('\n\n');
          systemContent = substrateText
            ? `${substrateText}\n\n[Known context from local knowledge base]\n${knownContext}`
            : `[Known context from local knowledge base]\n${knownContext}`;
        }
      }

      // Build the /api/chat messages array.
      // System message carries the substrate layer (r10v3 + optional eblet context).
      // User messages carry the conversation.
      const chatMessages: Array<{ role: string; content: string }> = [];
      if (systemContent) {
        chatMessages.push({ role: 'system', content: systemContent });
      }
      // Append the original messages from the caller (preserves multi-turn history).
      for (const m of args.messages) {
        chatMessages.push(m);
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 120_000);
        const res = await fetch(`${base}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: chatMessages,
            stream: false,
            options: { num_predict: 1024, temperature: 0.7 },
          }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeout));

        if (!res.ok) {
          return { ok: false, error: `Ollama request failed: ${res.statusText}` };
        }
        const data = await res.json() as { message?: { content?: string } };
        return { ok: true, text: data.message?.content ?? '', model_used: model };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    },
  );
}
