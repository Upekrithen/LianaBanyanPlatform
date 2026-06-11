import { IncomingMessage } from "http";
import { Duplex } from "stream";
import { WebSocket, WebSocketServer } from "ws";
import { getCooperativeEpoch } from "../lib/epoch";
import { isValidSid } from "../types";

const HEARTBEAT_MS = 30_000;

interface CircuitPeer {
  ws: WebSocket;
  peerSid: string;
  heartbeat: ReturnType<typeof setInterval>;
}

interface CircuitRoom {
  targetSid: string;
  peers: Map<string, CircuitPeer>;
  epoch: number;
}

const rooms = new Map<string, CircuitRoom>();

function circuitKey(targetSid: string): string {
  return targetSid;
}

function safeSend(ws: WebSocket, data: string | Buffer): void {
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

  clearInterval(peer.heartbeat);
  room.peers.delete(peerSid);

  if (peer.ws.readyState === WebSocket.OPEN) {
    peer.ws.close(1000, "peer disconnected");
  }

  for (const other of room.peers.values()) {
    clearInterval(other.heartbeat);
    if (other.ws.readyState === WebSocket.OPEN) {
      other.ws.close(1000, "circuit closed");
    }
  }
  room.peers.clear();
  rooms.delete(circuitKey(room.targetSid));
}

function attachPeer(room: CircuitRoom, peerSid: string, ws: WebSocket): void {
  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, HEARTBEAT_MS);

  const peer: CircuitPeer = { ws, peerSid, heartbeat };
  room.peers.set(peerSid, peer);

  ws.on("message", (data, isBinary) => {
    for (const [otherSid, other] of room.peers) {
      if (otherSid !== peerSid && other.ws.readyState === WebSocket.OPEN) {
        other.ws.send(data, { binary: isBinary });
      }
    }
  });

  ws.on("pong", () => {
    /* NAT keepalive */
  });

  ws.on("close", () => closePeer(room, peerSid));
  ws.on("error", () => closePeer(room, peerSid));

  if (room.peers.size === 2) {
    notifyCircuitOpen(room);
  }
}

export function handleCircuitUpgrade(
  wss: WebSocketServer,
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer,
): void {
  const url = new URL(req.url ?? "/", "http://localhost");
  const match = url.pathname.match(/^\/circuit\/([0-9a-f]{32})$/);

  if (!match) {
    socket.destroy();
    return;
  }

  const targetSid = match[1];
  if (!isValidSid(targetSid)) {
    socket.destroy();
    return;
  }

  const peerSidHeader = req.headers["x-wan-sid"];
  const peerSid = Array.isArray(peerSidHeader) ? peerSidHeader[0] : peerSidHeader;

  if (!peerSid || !isValidSid(peerSid)) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
    return;
  }

  const currentEpoch = getCooperativeEpoch();
  const key = circuitKey(targetSid);
  let room = rooms.get(key);

  if (room) {
    if (room.epoch !== currentEpoch) {
      for (const p of room.peers.values()) {
        clearInterval(p.heartbeat);
        if (p.ws.readyState === WebSocket.OPEN) {
          p.ws.close(1001, "epoch expired");
        }
      }
      rooms.delete(key);
      room = undefined;
    }
  }

  if (!room) {
    room = { targetSid, peers: new Map(), epoch: currentEpoch };
    rooms.set(key, room);
  }

  if (room.peers.has(peerSid)) {
    socket.write("HTTP/1.1 409 Conflict\r\n\r\n");
    socket.destroy();
    return;
  }

  if (room.peers.size >= 2) {
    socket.write("HTTP/1.1 503 Service Unavailable\r\n\r\n");
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
    attachPeer(room!, peerSid, ws);
  });
}

/** Close all circuits when cooperative epoch rotates. */
export function startEpochWatcher(): ReturnType<typeof setInterval> {
  let lastEpoch = getCooperativeEpoch();

  return setInterval(() => {
    const epoch = getCooperativeEpoch();
    if (epoch === lastEpoch) return;

    lastEpoch = epoch;
    for (const [key, room] of rooms) {
      for (const peer of room.peers.values()) {
        clearInterval(peer.heartbeat);
        if (peer.ws.readyState === WebSocket.OPEN) {
          peer.ws.close(1001, "epoch expired");
        }
      }
      rooms.delete(key);
    }
    console.log(`[circuit] epoch rotated to ${epoch}; all circuits closed`);
  }, 60_000);
}
