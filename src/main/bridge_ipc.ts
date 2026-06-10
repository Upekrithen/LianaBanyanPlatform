// bridge_ipc.ts — BP060 Application 002 Steps 3+4 · UI-7 live Yoke wire
// Handles: bridge:check-messages, bridge:send-message
// In-memory message queue per session; no persistence needed for Yoke wire.

import { ipcMain } from 'electron';

interface BridgeMessage {
  id: string;
  to: string;
  from: string;
  type: string;
  content: string;
  ts: number;
  read: boolean;
}

const OLLAMA_API_BASE = 'http://127.0.0.1:11434';

const _inbox: BridgeMessage[] = [];
let _msgSeq = 0;

function makeMsgId(): string {
  return `bm_${Date.now()}_${++_msgSeq}`;
}

export function registerBridgeIPC(): void {
  // ── bridge:check-messages ────────────────────────────────────────────────
  // Returns up to `count` unread messages from the inbox.
  ipcMain.handle('bridge:check-messages', (_event, count: number = 20) => {
    const unread = _inbox.filter((m) => !m.read).slice(0, count);
    unread.forEach((m) => { m.read = true; });
    return { ok: true, messages: unread, total: _inbox.length };
  });

  // ── bridge:send-message ──────────────────────────────────────────────────
  // Dispatches a message to a local Yoke endpoint or the Ollama chat API.
  // For "local" recipients the message is echoed back via /api/generate.
  ipcMain.handle(
    'bridge:send-message',
    async (
      _event,
      args: { to: string; type: string; content: string; from?: string },
    ) => {
      const { to, type, content, from = 'user' } = args;

      if (type === 'ai' || to === 'floor-model') {
        // Route through Ollama
        try {
          const res = await fetch(`${OLLAMA_API_BASE}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gemma2:2b',
              prompt: content,
              stream: false,
              options: { num_predict: 512, temperature: 0.7 },
            }),
          });
          if (!res.ok) {
            return { ok: false, error: `Ollama request failed: ${res.statusText}` };
          }
          const data = await res.json() as { response?: string };
          const reply: BridgeMessage = {
            id: makeMsgId(),
            to: from,
            from: to,
            type: 'ai-reply',
            content: data.response ?? '(no response)',
            ts: Date.now(),
            read: false,
          };
          _inbox.push(reply);
          return { ok: true, message_id: reply.id };
        } catch (err) {
          return { ok: false, error: String(err) };
        }
      }

      // Generic peer message — store in inbox for recipient to poll
      const msg: BridgeMessage = {
        id: makeMsgId(),
        to,
        from,
        type,
        content,
        ts: Date.now(),
        read: false,
      };
      _inbox.push(msg);
      // Keep inbox bounded
      if (_inbox.length > 1000) _inbox.splice(0, _inbox.length - 1000);
      return { ok: true, message_id: msg.id };
    },
  );
}
