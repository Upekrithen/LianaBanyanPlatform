// ai_dispatch_ipc.ts — BP060 Application 002 Steps 3+4 · UI-8 AI Dispatch backend
// Handles: ai-dispatch:query, list-local-models, test-connection, get-settings, save-settings
// Routes local queries through Ollama; frontier queries require LB session (future).

import { ipcMain } from 'electron';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';
import { FLOOR_MODEL } from '../shared/floor-model';

const OLLAMA_API_BASE = 'http://localhost:11434';

interface AiDispatchSettings {
  local_runtime_url: string;
  preferred_model?: string;
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
    (_event, settings: { local_runtime_url?: string; preferred_model?: string }) => {
      const current = loadSettings();
      const updated: AiDispatchSettings = {
        ...current,
        ...(settings.local_runtime_url !== undefined && {
          local_runtime_url: settings.local_runtime_url,
        }),
        ...(settings.preferred_model !== undefined && {
          preferred_model: settings.preferred_model,
        }),
      };
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

      // Build prompt from messages (Ollama /api/generate doesn't do chat natively in all versions)
      const prompt = args.messages
        .map((m) => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
        .join('\n') + '\nAssistant:';

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 120_000);
        const res = await fetch(`${base}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            prompt,
            stream: false,
            options: { num_predict: 1024, temperature: 0.7 },
          }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeout));

        if (!res.ok) {
          return { ok: false, error: `Ollama request failed: ${res.statusText}` };
        }
        const data = await res.json() as { response?: string };
        return { ok: true, text: data.response ?? '', model_used: model };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    },
  );
}
