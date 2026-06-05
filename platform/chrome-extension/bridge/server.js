#!/usr/bin/env node
// Mnemosyne Bridge Server - scope 18-22
// Local HTTP bridge at http://localhost:11480
// Exposes /health, /substrate/query, /yoke/note with optional Bearer token auth.
// Run: node server.js
// Auth: set MNEMO_TOKEN env var to require token from the extension.

import http from 'node:http';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.MNEMO_PORT ?? '11480', 10);
const REQUIRED_TOKEN = process.env.MNEMO_TOKEN ?? ''; // empty = localhost trust mode
const DATA_DIR = process.env.MNEMO_DATA_DIR ?? join(__dirname, 'data');
const VERSION = '1.1.0';

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const NOTES_FILE = join(DATA_DIR, 'notes.json');
const EBLETS_FILE = join(DATA_DIR, 'eblets.json');

function loadJson(file, fallback) {
  try {
    if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  } catch { /* corrupt file */ }
  return fallback;
}

function saveJson(file, data) {
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// Simple in-memory eblet store (loaded from disk)
let eblets = loadJson(EBLETS_FILE, []);
let notes = loadJson(NOTES_FILE, []);

// Scope 22: Token auth check
function checkAuth(req) {
  if (!REQUIRED_TOKEN) return true; // localhost trust mode
  const authHeader = req.headers['authorization'] ?? '';
  const [scheme, token] = authHeader.split(' ');
  return scheme === 'Bearer' && token === REQUIRED_TOKEN;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function json(res, status, data) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

// Scope 19: /health endpoint
function handleHealth(req, res) {
  if (!checkAuth(req)) return json(res, 401, { error: 'Unauthorized - check MNEMO_TOKEN' });
  json(res, 200, {
    status: 'ok',
    version: VERSION,
    index_size: eblets.length,
    eblet_count: eblets.length,
    note_count: notes.length,
    auth_mode: REQUIRED_TOKEN ? 'token' : 'trust',
    port: PORT,
    uptime_s: Math.floor(process.uptime()),
  });
}

// Scope 20: /substrate/query endpoint
async function handleQuery(req, res) {
  if (!checkAuth(req)) return json(res, 401, { error: 'Unauthorized' });
  const body = await readBody(req);
  const query = (body.query ?? '').toLowerCase().trim();
  if (!query) return json(res, 400, { error: 'query is required' });

  const start = Date.now();

  // Search eblets + notes for relevant content
  const matches = [];

  for (const eblet of eblets) {
    const content = (eblet.content ?? eblet.text ?? '').toLowerCase();
    const tags = (eblet.tags ?? []).join(' ').toLowerCase();
    if (content.includes(query) || tags.includes(query)) {
      matches.push({ source: 'eblet', text: eblet.content ?? eblet.text, score: content.includes(query) ? 2 : 1 });
    }
  }

  for (const note of notes) {
    const content = (note.note ?? note.text ?? '').toLowerCase();
    if (content.includes(query)) {
      matches.push({ source: 'note', text: note.note ?? note.text, score: 1 });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  const latency_ms = Date.now() - start;

  if (matches.length > 0) {
    const topResults = matches.slice(0, 3).map((m) => m.text).join('\n\n');
    return json(res, 200, {
      hit: true,
      response: topResults,
      routing: 'substrate',
      latency_ms,
      match_count: matches.length,
    });
  }

  return json(res, 200, {
    hit: false,
    response: null,
    answer: `No memory found for: "${body.query}". Save notes to build your knowledge base.`,
    routing: 'miss',
    latency_ms,
    match_count: 0,
  });
}

// Scope 21 (server-side): /yoke/note endpoint
async function handleNote(req, res) {
  if (!checkAuth(req)) return json(res, 401, { error: 'Unauthorized' });
  const body = await readBody(req);
  const noteText = (body.note ?? '').trim();
  if (!noteText) return json(res, 400, { error: 'note is required' });

  const entry = {
    id: randomUUID(),
    note: noteText,
    tags: body.tags ?? [],
    urgency: body.urgency ?? 'low',
    saved_at: new Date().toISOString(),
    source: 'chrome-extension',
  };

  notes.push(entry);
  saveJson(NOTES_FILE, notes);

  json(res, 200, {
    saved: true,
    id: entry.id,
    note_count: notes.length,
  });
}

const server = http.createServer(async (req, res) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return handleHealth(req, res);
  }

  if (req.method === 'POST' && url.pathname === '/substrate/query') {
    return handleQuery(req, res);
  }

  if (req.method === 'POST' && url.pathname === '/yoke/note') {
    return handleNote(req, res);
  }

  cors(res);
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found', path: url.pathname }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mnemosyne Bridge v${VERSION} running at http://localhost:${PORT}`);
  console.log(`Auth mode: ${REQUIRED_TOKEN ? 'token (MNEMO_TOKEN set)' : 'trust (no token required)'}`);
  console.log(`Data dir: ${DATA_DIR}`);
  console.log(`Endpoints: GET /health  POST /substrate/query  POST /yoke/note`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Set MNEMO_PORT to a different port.`);
  } else {
    console.error('Bridge server error:', err.message);
  }
  process.exit(1);
});
