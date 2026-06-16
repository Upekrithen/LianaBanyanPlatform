// ai_dispatch_ipc.ts -- BP077 v0.1.27 Mnem-as-interface substrate baked in
// Handles: ai-dispatch:query, list-local-models, test-connection, get-settings, save-settings
// Routes local queries through Ollama /api/chat with r10v3 substrate system-prompt layer.
// SKU gate: nano skips Mnem-DRT pipeline; core/lite use mnem_drt_enabled flag; full always runs.
// Eblet compose: top-3 local eblet snippets prepended to user message when Mnem-DRT active.

import { ipcMain } from 'electron';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { app } from 'electron';
import { FLOOR_MODEL } from '../shared/floor-model';
import {
  queryEbletStore,
  queryVerifiedEblets,
  substrateCounters,
  getEbletIndexStats,
} from './mnem_eblet_store';
import { ollamaManager } from './ollama_manager';
// BP083 SEG-3: MEMORY.md system-prompt injection (amnesia cure)
import { getMemoryMd } from './memory_scaffold';

const OLLAMA_API_BASE = 'http://127.0.0.1:11434';

// v0.1.57.1: module-scope streaming state — AbortController for in-flight stream,
// inference counter for cold-start detection.
let activeQueryController: AbortController | null = null;
let sessionInferenceCount = 0;

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
    try {
      const status = ollamaManager.getStatus();
      const reachable = status.running || (await ollamaManager.isReachable());
      if (!reachable) {
        return { ok: false, models: [], error: 'Local AI engine not running' };
      }
      const names = await ollamaManager.listModels();
      return { ok: true, models: names.map((name) => ({ name })) };
    } catch (err) {
      return { ok: false, models: [], error: String(err) };
    }
  });

  // ── ai-dispatch:test-connection ──────────────────────────────────────────
  ipcMain.handle('ai-dispatch:test-connection', async () => {
    try {
      const status = ollamaManager.getStatus();
      const reachable = status.running || (await ollamaManager.isReachable());
      if (!reachable) {
        return { ok: false, error: 'Local AI engine not running' };
      }
      const models = await ollamaManager.listModels();
      return { ok: true, model_count: models.length };
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
  // v0.1.57.1: returns { ok: true, streaming: true } immediately; content flows via
  // 'ask-token-progress' and 'ask-token-complete' IPC push events.
  // Pre-flight errors still return { ok: false, error } synchronously.
  ipcMain.handle(
    'ai-dispatch:query',
    async (
      event,
      args: {
        court_member: string;
        messages: Array<{ role: string; content: string }>;
        model_override?: string;
      },
    ) => {
      const settings = loadSettings();
      // SEG-1 v0.1.56: prefer family-matched Gemma model over hard-coded FLOOR_MODEL.
      const selectedGemmaModel = ollamaManager.getSelectedModel();
      const model = args.model_override ?? settings.preferred_model ?? selectedGemmaModel ?? FLOOR_MODEL;

      const status = ollamaManager.getStatus();
      const reachable = status.running || (await ollamaManager.isReachable());
      if (!reachable) {
        return { ok: false, error: 'Local AI engine not running' };
      }

      // SEG-1 v0.1.56: if no override/preference and no gemma model was found, signal SEG-2.
      if (!args.model_override && !settings.preferred_model && selectedGemmaModel === null) {
        return { ok: false, error: 'No compatible model — downloading now…' };
      }

      // Extract the user's message text for substrate + eblet lookups.
      const userMessage = args.messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .join(' ')
        .trim();

      // Step 1: Load r10v3 substrate (all SKUs).
      const substrateText = loadSubstrateText();

      // SEG-1 v0.1.57: HOT retrieve — query verified eblet store before LLM inference.
      // Runs unconditionally (not gated by Mnem-DRT). Fresh-install path: store absent → [].
      let verifiedHits: import('./mnem_eblet_store').VerifiedEbletEntry[] = [];
      try {
        verifiedHits = await queryVerifiedEblets(userMessage);
      } catch (err) {
        console.warn('[SubstrateHOT] queryVerifiedEblets failed:', err);
      }

      let verifiedContext = '';
      if (verifiedHits.length > 0) {
        substrateCounters.hotHits++;
        verifiedContext =
          'Based on previously-verified knowledge:\n\n' +
          verifiedHits.map((h) => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n') +
          '\n\nNow answer the following question:\n\n';
      } else {
        substrateCounters.coldCalls++;
      }
      console.log(
        `[SubstrateHOT] hits=${verifiedHits.length} hotTotal=${substrateCounters.hotHits} coldTotal=${substrateCounters.coldCalls}`,
      );

      // BP083 SEG-3: Load MEMORY.md self-context (amnesia cure — prepended before substrate).
      // Cached in-memory, invalidated by fs.watch on edit. Graceful degrade: fallback identity if fails.
      // SEG-2 v0.3.7: diagnostic logging per BP078 every-click-visible-feedback canon.
      let memoryMdContent = '';
      try {
        memoryMdContent = getMemoryMd();
        const memPath = join(app.getPath('appData'), 'MnemosyneC', 'MEMORY.md');
        console.log(`[Ask] MEMORY.md loaded: ${memoryMdContent.length} bytes from ${memPath}`);
      } catch (err) {
        const memPath = join(app.getPath('appData'), 'MnemosyneC', 'MEMORY.md');
        console.warn(`[Ask] MEMORY.md MISSING at ${memPath} — err:`, err);
      }

      // Step 2: SKU gate -- determine if Mnem-DRT eblet compose should run.
      // MEMORY.md is prepended first (self-identity), then r10v3 substrate, then eblet context.
      let systemContent = (memoryMdContent ? memoryMdContent + '\n\n' : '') + verifiedContext + (substrateText ?? '');

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
          // Compose: MEMORY.md + substrate + eblet context + user message framing.
          const knownContext = ebletSnippets.join('\n\n');
          const substrateLayer = substrateText
            ? `${substrateText}\n\n[Known context from local knowledge base]\n${knownContext}`
            : `[Known context from local knowledge base]\n${knownContext}`;
          systemContent = (memoryMdContent ? memoryMdContent + '\n\n' : '') + substrateLayer;
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

      // v0.1.57.1: Abort any in-flight stream before starting a new one (AbortController discipline)
      if (activeQueryController) {
        activeQueryController.abort();
        activeQueryController = null;
      }
      const queryController = new AbortController();
      activeQueryController = queryController;

      // v0.1.57.1: Cold-start detection — /api/ps check + sessionInferenceCount fallback
      let isColdStart = sessionInferenceCount === 0;
      if (!isColdStart) {
        try {
          const psCtrl = new AbortController();
          const psTmo = setTimeout(() => psCtrl.abort(), 3000);
          const psRes = await fetch(`${OLLAMA_API_BASE}/api/ps`, { signal: psCtrl.signal });
          clearTimeout(psTmo);
          const psData = await psRes.json() as { models?: Array<{ name: string }> };
          isColdStart = !(psData.models ?? []).some((m) => m.name === model);
        } catch {
          // /api/ps unavailable — fallback to sessionInferenceCount (already set above)
        }
      }

      if (isColdStart && !event.sender.isDestroyed()) {
        event.sender.send('ask-token-progress', { coldStart: true, delta: '', assembled: '' });
      }

      // v0.1.57.1: Stream NDJSON response tokens to renderer — fire-and-forget
      void (async () => {
        let assembled = '';
        const streamTimeout = setTimeout(() => queryController.abort(), 120_000);
        try {
          const res = await fetch(`${OLLAMA_API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              messages: chatMessages,
              stream: true,
              options: { num_predict: 1024, temperature: 0.7 },
            }),
            signal: queryController.signal,
          });
          clearTimeout(streamTimeout);

          if (!res.ok) {
            if (!event.sender.isDestroyed()) {
              event.sender.send('ask-token-complete', { content: '', error: `Ollama request failed: ${res.statusText}` });
            }
            return;
          }

          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n').filter((l) => l.trim())) {
              try {
                const parsed = JSON.parse(line) as { message?: { content?: string }; done?: boolean };
                if (parsed.message?.content) {
                  assembled += parsed.message.content;
                  if (!event.sender.isDestroyed()) {
                    event.sender.send('ask-token-progress', { delta: parsed.message.content, assembled });
                  }
                }
                if (parsed.done) {
                  sessionInferenceCount++;
                  if (activeQueryController === queryController) activeQueryController = null;
                  if (!event.sender.isDestroyed()) {
                  // substrate R1: write complete assembled content on done:true
                  // SEG-2 v0.3.7: include selfContextLoaded for renderer feedback badge
                  event.sender.send('ask-token-complete', {
                    content: assembled,
                    hotHits: substrateCounters?.hotHits,
                    selfContextLoaded: memoryMdContent.length > 0,
                  });
                  }
                }
              } catch { /* skip malformed NDJSON line */ }
            }
          }
        } catch (err) {
          clearTimeout(streamTimeout);
          const isAbort = (err as Error)?.name === 'AbortError';
          if (!event.sender.isDestroyed()) {
            event.sender.send('ask-token-complete', {
              content: assembled,
              error: isAbort ? 'Stream interrupted' : String(err),
            });
          }
        }
      })();

      return { ok: true, streaming: true };
    },
  );

  // ── ai-dispatch:eblet-index-stats (SEG-6 / SEG-5) ───────────────────────
  // Returns EbletIndexStats for the substrate counter UI panel.
  ipcMain.handle('ai-dispatch:eblet-index-stats', () => {
    try {
      const stats = getEbletIndexStats();
      const verifiedFile = resolve(app.getPath('userData'), 'substrate', 'verified_eblets.jsonl');
      let verifiedCount = 0;
      if (existsSync(verifiedFile)) {
        try {
          const raw = readFileSync(verifiedFile, 'utf-8');
          verifiedCount = raw.split('\n').filter((l) => l.trim()).length;
        } catch { /* graceful */ }
      }
      return { ok: true, stats, verifiedCount };
    } catch (err) {
      return { ok: false, error: String(err), stats: null, verifiedCount: 0 };
    }
  });
}
