/**
 * mnemosynec-message-store.mjs
 * SEG-MC-4 · Wave D · BP079 · 2026-06-10
 *
 * Canonical pearl-based message store for Knight-Bishop bridge replacement.
 * Replaces ARCHIVE2April2026/Agora/build/knight-bishop-bridge-mcp.js (dead)
 * and the fragile 3.2MB KNIGHT_BISHOP_MESSAGES.md flat file.
 *
 * Backing store: ~/.mnemosynec/messages.jsonl (append-only JSONL)
 * Used by: mnemosynec-mcp-stdio.mjs shim (SEG-MC-1) + Electron bridge IPC
 */

import path from 'path';
import os from 'os';
import fs from 'fs';
import crypto from 'crypto';

// Allow test override via env var (must be set before module load)
export const STORE_PATH =
  process.env.MNEMOSYNEC_STORE_PATH ||
  path.join(os.homedir(), '.mnemosynec', 'messages.jsonl');

// ── Internal helpers ─────────────────────────────────────────────────────────

function ensureDir() {
  const dir = path.dirname(STORE_PATH);
  fs.mkdirSync(dir, { recursive: true });
}

function readAllMessages() {
  try {
    const content = fs.readFileSync(STORE_PATH, 'utf8');
    return content
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

function writeAllMessages(messages) {
  ensureDir();
  const lines = messages.map((m) => JSON.stringify(m)).join('\n');
  fs.writeFileSync(STORE_PATH, lines + (messages.length > 0 ? '\n' : ''), 'utf8');
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Send a message (appends one JSONL line to the store).
 * @param {{ from: string, to: string, subject: string, body: string }} args
 * @returns {{ pearl_id: string, ok: boolean }}
 */
export function sendMessage({ from, to, subject, body }) {
  ensureDir();
  const pearl_id = crypto.randomUUID();
  const record = {
    pearl_id,
    from,
    to,
    subject,
    body,
    status: 'unread',
    ts: new Date().toISOString(),
  };
  // Append-only: single JSON line + newline
  fs.appendFileSync(STORE_PATH, JSON.stringify(record) + '\n', 'utf8');
  return { pearl_id, ok: true };
}

/**
 * Check messages addressed to clientId that are still unread.
 * @param {string} clientId
 * @returns {Array<{ pearl_id: string, from: string, subject: string, body: string, ts: string }>}
 */
export function checkMessages(clientId) {
  const messages = readAllMessages();
  return messages
    .filter((m) => m.to === clientId && m.status === 'unread')
    .map(({ pearl_id, from, subject, body, ts }) => ({ pearl_id, from, subject, body, ts }));
}

/**
 * Acknowledge a message (marks it read so it no longer appears in checkMessages).
 * Rewrites the full file — file is small, full rewrite is acceptable.
 * @param {string} pearlId
 * @returns {{ ok: boolean }}
 */
export function ackMessage(pearlId) {
  const messages = readAllMessages();
  let found = false;
  const updated = messages.map((m) => {
    if (m.pearl_id === pearlId && m.status === 'unread') {
      found = true;
      return { ...m, status: 'read' };
    }
    return m;
  });
  if (found) {
    writeAllMessages(updated);
  }
  return { ok: found };
}
