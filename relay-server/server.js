// Designed-to-be-Copied — MnemosyneC WAN Relay Server
// BP071 Scopes 5 + 14-15 · Cloud Run · Node 20
//
// Protocol (mirrors RelayClient in src/main/federation/relay-client.ts):
//   Client → relay_join  → server registers peerId → stores WS connection
//   Client → relay_route → server forwards innerMsg to toPeerId
//   Client → ping        → server replies pong
//   HTTP GET  /          → health {status,peers,ts}
//   HTTP POST /invite    → register authorized peer pair (RELAY_SECRET auth)
//   HTTP GET  /peers     → list connected peerIds

'use strict';

const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');

const PORT = parseInt(process.env.PORT || '8080', 10);
const RELAY_SECRET = process.env.RELAY_SECRET;

if (!RELAY_SECRET) {
  console.error('[relay] FATAL: RELAY_SECRET env var is not set — refusing to start');
  process.exit(1);
}

// ── State ──────────────────────────────────────────────────────────────────

/** @type {Map<string, import('ws').WebSocket>} peerId → socket */
const peers = new Map();

/** @type {Set<string>} authorised "peerA|peerB" pairs (sorted so order doesn't matter) */
const authorisedPairs = new Set();

function pairKey(a, b) {
  return [a, b].sort().join('|');
}

function isAuthorised(a, b) {
  return authorisedPairs.has(pairKey(a, b));
}

// ── Express HTTP ───────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

// Health
app.get('/', (_req, res) => {
  res.json({ status: 'ok', peers: peers.size, ts: new Date().toISOString() });
});

// Register an authorised peer pair
app.post('/invite', (req, res) => {
  const { secret, peerA, peerB } = req.body || {};
  if (secret !== RELAY_SECRET) {
    return res.status(403).json({ error: 'forbidden' });
  }
  if (!peerA || !peerB) {
    return res.status(400).json({ error: 'peerA and peerB required' });
  }
  const key = pairKey(peerA, peerB);
  authorisedPairs.add(key);
  console.log(`[relay] invite registered pair=${key} ts=${new Date().toISOString()}`);
  res.json({ ok: true, pair: key });
});

// List connected peers
app.get('/peers', (req, res) => {
  const secret = req.headers['x-relay-secret'] || req.query.secret;
  if (secret !== RELAY_SECRET) {
    return res.status(403).json({ error: 'forbidden' });
  }
  res.json({ peers: [...peers.keys()], ts: new Date().toISOString() });
});

// ── HTTP + WebSocket server ────────────────────────────────────────────────

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  // Peer may self-identify via header before relay_join
  let peerId = req.headers['x-mnemosyne-peerid'] || null;

  if (peerId) {
    peers.set(peerId, ws);
    console.log(`[relay] connected via header peerId=${peerId} total=${peers.size} ts=${new Date().toISOString()}`);
  }

  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { return; }

    // relay_join — peer registers itself
    if (msg.type === 'relay_join') {
      const id = msg.peerId || (msg.payload && msg.payload.peerId);
      if (id) {
        if (peerId && peerId !== id) peers.delete(peerId);
        peerId = id;
        peers.set(peerId, ws);
        console.log(`[relay] relay_join peerId=${peerId} total=${peers.size} ts=${new Date().toISOString()}`);
      }
      return;
    }

    // ping → pong
    if (msg.type === 'ping') {
      safeSend(ws, { type: 'pong', peerId: 'relay', ts: new Date().toISOString() });
      return;
    }

    // relay_route — forward innerMsg to toPeerId
    if (msg.type === 'relay_route') {
      const payload = msg.payload || {};
      const { toPeerId, innerMsg } = payload;
      if (!toPeerId || !innerMsg) return;

      const fromId = msg.peerId || peerId;

      // Enforce authorised-pair check
      if (fromId && !isAuthorised(fromId, toPeerId)) {
        console.warn(`[relay] relay_route DENIED from=${fromId} to=${toPeerId} — pair not registered`);
        return;
      }

      const target = peers.get(toPeerId);
      if (target && target.readyState === target.OPEN) {
        // Wrap as relay_route so the client's _handleMessage unwraps it
        safeSend(target, {
          type: 'relay_route',
          peerId: fromId || 'relay',
          payload: { toPeerId, innerMsg },
          ts: new Date().toISOString(),
        });
      }
      return;
    }
  });

  ws.on('close', () => {
    if (peerId) {
      peers.delete(peerId);
      console.log(`[relay] disconnected peerId=${peerId} total=${peers.size} ts=${new Date().toISOString()}`);
    }
  });

  ws.on('error', (err) => {
    console.warn(`[relay] ws error peerId=${peerId || 'unknown'}: ${err.message}`);
  });
});

function safeSend(ws, obj) {
  try {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
  } catch (e) {
    console.warn('[relay] safeSend error:', e.message);
  }
}

// ── Boot ───────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`[relay] MnemosyneC relay listening on port=${PORT} ts=${new Date().toISOString()}`);
});

// Graceful shutdown for Cloud Run SIGTERM
process.on('SIGTERM', () => {
  console.log('[relay] SIGTERM received — shutting down gracefully');
  server.close(() => process.exit(0));
});
