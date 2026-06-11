// BP080 · SEG-WAN-2 · wan-relay-circuit
// ============================================================
// WS /functions/v1/wan-relay-circuit/:targetSid
// WebSocket circuit broker: two peers both addressed by SID.
// Uses Deno.upgradeWebSocket() (Supabase Edge Function native).
// --no-verify-jwt: SID is the auth token (intentionally anonymous).
//
// Handshake:
//   Upgrade header: Connection: Upgrade, Upgrade: websocket
//   x-wan-sid: <peerSid>  (caller's own 32-char hex SID)
//   Path:  /functions/v1/wan-relay-circuit/<targetSid>  (target SID)
//
// Protocol:
//   - First peer to connect waits in room keyed by targetSid
//   - Second peer joins → both receive { type:"circuit_open", peerSid:<otherSid> }
//   - All subsequent binary/text frames are relayed verbatim to the other peer
//   - When either peer disconnects → room is torn down, other peer receives close(1000)
//   - Epoch boundary (cooperative epoch rotation) → all rooms are evicted (1001)
//   - Max 2 peers per room; 3rd connect → 503
//   - Duplicate peerSid in same room → 409
//
// Authored: 2026-06-11 · Bishop SEG-WAN-2 (Option A ratify)
// ============================================================

// ── SID validation ────────────────────────────────────────────
const SID_RE = /^[0-9a-f]{32}$/;

function isValidSid(sid: string): boolean {
  return sid.length === 32 && SID_RE.test(sid);
}

// ── Epoch helpers ─────────────────────────────────────────────
const EPOCH_ORIGIN_MS = new Date("2026-01-01T00:00:00Z").getTime();
const MS_PER_DAY = 86_400_000;

function getCooperativeEpoch(nowMs: number = Date.now()): number {
  return Math.floor((nowMs - EPOCH_ORIGIN_MS) / MS_PER_DAY);
}

// ── Room state ────────────────────────────────────────────────
const HEARTBEAT_MS = 30_000;

interface CircuitPeer {
  ws: WebSocket;
  peerSid: string;
  heartbeatTimer: ReturnType<typeof setInterval>;
}

interface CircuitRoom {
  targetSid: string;
  peers: Map<string, CircuitPeer>;
  epoch: number;
}

const rooms = new Map<string, CircuitRoom>();

function safeSend(ws: WebSocket, data: string): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(data);
  }
}

function notifyCircuitOpen(room: CircuitRoom): void {
  const peerList = [...room.peers.values()];
  if (peerList.length !== 2) return;
  const [a, b] = peerList;
  safeSend(a.ws, JSON.stringify({ type: "circuit_open", peerSid: b.peerSid }));
  safeSend(b.ws, JSON.stringify({ type: "circuit_open", peerSid: a.peerSid }));
}

function closePeer(room: CircuitRoom, peerSid: string): void {
  const peer = room.peers.get(peerSid);
  if (!peer) return;

  clearInterval(peer.heartbeatTimer);
  room.peers.delete(peerSid);

  // Notify and close all remaining peers
  for (const other of room.peers.values()) {
    clearInterval(other.heartbeatTimer);
    if (other.ws.readyState === WebSocket.OPEN) {
      other.ws.close(1000, "peer disconnected");
    }
  }
  room.peers.clear();
  rooms.delete(room.targetSid);
}

function attachPeer(room: CircuitRoom, peerSid: string, ws: WebSocket): void {
  const heartbeatTimer = setInterval(() => {
    // Deno WebSocket: send a ping-equivalent JSON frame for NAT keepalive
    if (ws.readyState === WebSocket.OPEN) {
      safeSend(ws, JSON.stringify({ type: "ping", ts: Date.now() }));
    }
  }, HEARTBEAT_MS);

  const peer: CircuitPeer = { ws, peerSid, heartbeatTimer };
  room.peers.set(peerSid, peer);

  ws.onmessage = (evt) => {
    // Relay message to the OTHER peer only
    for (const [otherSid, other] of room.peers) {
      if (otherSid !== peerSid && other.ws.readyState === WebSocket.OPEN) {
        other.ws.send(evt.data);
      }
    }
  };

  ws.onclose = () => closePeer(room, peerSid);
  ws.onerror = () => closePeer(room, peerSid);

  if (room.peers.size === 2) {
    notifyCircuitOpen(room);
  }
}

// ── Epoch watcher — evict all rooms on epoch rotation ─────────
let lastEpoch = getCooperativeEpoch();

function checkEpochRotation(): void {
  const epoch = getCooperativeEpoch();
  if (epoch === lastEpoch) return;
  lastEpoch = epoch;

  for (const [key, room] of rooms) {
    for (const peer of room.peers.values()) {
      clearInterval(peer.heartbeatTimer);
      if (peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.close(1001, "epoch expired");
      }
    }
    rooms.delete(key);
  }
  console.log(`[wan-relay-circuit] epoch rotated to ${epoch}; all circuits closed ts=${new Date().toISOString()}`);
}

// ── Handler ───────────────────────────────────────────────────
Deno.serve((req) => {
  // Check epoch rotation on every request (lightweight)
  checkEpochRotation();

  // Extract targetSid from path
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const targetSid = pathParts[pathParts.length - 1];

  if (!targetSid || !isValidSid(targetSid)) {
    return new Response("invalid targetSid: must be 32-char hex", { status: 400 });
  }

  // Require WebSocket upgrade
  const upgradeHeader = req.headers.get("upgrade");
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("expected WebSocket upgrade", { status: 426 });
  }

  // Caller's own SID from header
  const peerSid = req.headers.get("x-wan-sid");
  if (!peerSid || !isValidSid(peerSid)) {
    return new Response("x-wan-sid header missing or invalid (must be 32-char hex)", { status: 400 });
  }

  // Room management
  const currentEpoch = getCooperativeEpoch();
  let room = rooms.get(targetSid);

  if (room && room.epoch !== currentEpoch) {
    // Stale room from previous epoch — evict
    for (const peer of room.peers.values()) {
      clearInterval(peer.heartbeatTimer);
      if (peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.close(1001, "epoch expired");
      }
    }
    rooms.delete(targetSid);
    room = undefined;
  }

  if (!room) {
    room = { targetSid, peers: new Map(), epoch: currentEpoch };
    rooms.set(targetSid, room);
  }

  if (room.peers.has(peerSid)) {
    return new Response("conflict: peerSid already in room", { status: 409 });
  }

  if (room.peers.size >= 2) {
    return new Response("room full", { status: 503 });
  }

  // Upgrade to WebSocket
  const { socket, response } = Deno.upgradeWebSocket(req);
  const capturedRoom = room;

  socket.onopen = () => {
    attachPeer(capturedRoom, peerSid, socket);
  };

  return response;
});
