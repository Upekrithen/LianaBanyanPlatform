// BP089 Mountain 3 · I-C · File Cabinet Abstraction
// Sealed-jar wrapper and Court Package lazy-load contract.
// Lazy-loads on first openCabinet() call; stays warm via 24h keep_alive.
// LRU eviction; seal integrity enforcement; Supabase audit log.

import { queryEbletStore } from '../mnem_eblet_store';

const KEEP_ALIVE_MS = 24 * 60 * 60 * 1000;
const CABINET_TIMEOUT_MS = 8_000;
const SUPABASE_URL: string = process.env['SUPABASE_URL'] ?? process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '';
const SUPABASE_ANON_KEY: string = process.env['SUPABASE_ANON_KEY'] ?? process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '';

export interface CabinetAddress {
  substratePath: string;
  coordinate?: string;
  partition: string;
}

export interface CabinetContents {
  address: CabinetAddress;
  jarId: string;
  content: string;
  sealStatus: 'intact' | 'SEAL_BROKEN' | 'not_sealed';
  openedAtMs: number;
  lazyLoadFirstAccessedAt: string | null;
  keepAliveUntil: string;
}

export interface CabinetError {
  code: 'NOT_FOUND' | 'SEAL_BROKEN' | 'TIMEOUT' | 'PARTITION_MISMATCH';
  address: CabinetAddress;
  message: string;
}

export interface CabinetLRUEntry {
  substratePath: string;
  lastAccessedAt: number;
  keepAliveUntil: number;
}

export interface SealResult {
  sealLogId: string;
  pearlEmitted: boolean;
}

const _cabinetLRU = new Map<string, CabinetLRUEntry>();
const _firstAccessLog = new Map<string, string>();
const _jarCache = new Map<string, CabinetContents>();

function supabaseHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` };
}

async function writeSealLog(params: {
  jarId: string; substratePath: string; partition: string; librarianRole: string;
  sealStatus: 'intact' | 'SEAL_BROKEN' | 'not_sealed'; latencyMs: number; lazyLoadFirstAccessedAt: string | null;
}): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/file_cabinet_seal_log`, {
      method: 'POST',
      headers: { ...supabaseHeaders(), 'Prefer': 'return=minimal' },
      body: JSON.stringify({ jar_id: params.jarId, substrate_path: params.substratePath, partition: params.partition, librarian_role: params.librarianRole, seal_status: params.sealStatus, latency_ms: params.latencyMs, lazy_load_first_accessed_at: params.lazyLoadFirstAccessedAt, session_bp: 'BP089' }),
      signal: AbortSignal.timeout(CABINET_TIMEOUT_MS),
    });
  } catch { /* non-fatal */ }
}

function generateJarId(address: CabinetAddress): string {
  const raw = `${address.partition}::${address.substratePath}::${address.coordinate ?? 'no-coord'}`;
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) { h ^= raw.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return `jar-${h.toString(16).padStart(8, '0')}`;
}

export async function verifySeal(jarId: string): Promise<'intact' | 'SEAL_BROKEN' | 'not_sealed'> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return 'not_sealed';
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/file_cabinet_seal_log?jar_id=eq.${encodeURIComponent(jarId)}&order=opened_at.desc&limit=1`, { headers: supabaseHeaders(), signal: AbortSignal.timeout(CABINET_TIMEOUT_MS) });
    if (!res.ok) return 'not_sealed';
    const rows = await res.json() as Array<{ seal_status: string }>;
    if (rows.length === 0) return 'not_sealed';
    const s = rows[0].seal_status;
    return s === 'intact' ? 'intact' : s === 'SEAL_BROKEN' ? 'SEAL_BROKEN' : 'not_sealed';
  } catch { return 'not_sealed'; }
}

export async function openCabinet(address: CabinetAddress, librarianRole = 'unknown_librarian'): Promise<CabinetContents | CabinetError> {
  const startMs = Date.now();
  const key = `${address.partition}::${address.substratePath}`;
  const cached = _jarCache.get(key);
  if (cached) {
    const lru = _cabinetLRU.get(key);
    if (lru && Date.now() < lru.keepAliveUntil) {
      lru.lastAccessedAt = Date.now();
      await writeSealLog({ jarId: cached.jarId, substratePath: address.substratePath, partition: address.partition, librarianRole, sealStatus: cached.sealStatus, latencyMs: Date.now() - startMs, lazyLoadFirstAccessedAt: _firstAccessLog.get(key) ?? null });
      return cached;
    }
    _jarCache.delete(key); _cabinetLRU.delete(key);
  }
  let snippets: string[] = [];
  try {
    const query = address.coordinate ? `${address.substratePath} ${address.coordinate}` : address.substratePath;
    snippets = await queryEbletStore(query.slice(0, 80));
  } catch { snippets = []; }
  if (snippets.length === 0) return { code: 'NOT_FOUND', address, message: `No jar content found: ${address.substratePath}` };
  const content = snippets.join('\n\n---\n\n');
  const jarId = generateJarId(address);
  const nowMs = Date.now(); const nowIso = new Date(nowMs).toISOString();
  const keepAliveUntil = new Date(nowMs + KEEP_ALIVE_MS).toISOString();
  const firstAccess = _firstAccessLog.get(key) ?? null;
  if (!firstAccess) _firstAccessLog.set(key, nowIso);
  const sealStatus = await verifySeal(jarId);
  if (sealStatus === 'SEAL_BROKEN') return { code: 'SEAL_BROKEN', address, message: `Seal violation on jar ${jarId}` };
  const contents: CabinetContents = { address, jarId, content, sealStatus, openedAtMs: nowMs, lazyLoadFirstAccessedAt: firstAccess ?? null, keepAliveUntil };
  _jarCache.set(key, contents);
  _cabinetLRU.set(key, { substratePath: address.substratePath, lastAccessedAt: nowMs, keepAliveUntil: nowMs + KEEP_ALIVE_MS });
  await writeSealLog({ jarId, substratePath: address.substratePath, partition: address.partition, librarianRole, sealStatus, latencyMs: Date.now() - startMs, lazyLoadFirstAccessedAt: firstAccess ?? null });
  return contents;
}

export async function sealCabinet(address: CabinetAddress): Promise<SealResult> {
  const jarId = generateJarId(address);
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { sealLogId: jarId, pearlEmitted: false };
  let sealLogId = jarId;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/file_cabinet_seal_log`, { method: 'POST', headers: { ...supabaseHeaders(), 'Prefer': 'return=representation' }, body: JSON.stringify({ jar_id: jarId, substrate_path: address.substratePath, partition: address.partition, librarian_role: 'seal_operation', seal_status: 'intact', latency_ms: 0, session_bp: 'BP089' }), signal: AbortSignal.timeout(CABINET_TIMEOUT_MS) });
    if (res.ok) { const rows = await res.json() as Array<{ id: string }>; if (rows[0]?.id) sealLogId = rows[0].id; }
  } catch { /* non-fatal */ }
  let pearlEmitted = false;
  try {
    const pearlRes = await fetch(`${SUPABASE_URL}/functions/v1/pearl-emit`, { method: 'POST', headers: { ...supabaseHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ pearl_id: `cabinet_sealed_${jarId}`, payload: { event: 'cabinet_sealed', jarId, substratePath: address.substratePath, partition: address.partition, sealedAtMs: Date.now(), bp: 'BP089' } }), signal: AbortSignal.timeout(CABINET_TIMEOUT_MS) });
    pearlEmitted = pearlRes.ok;
  } catch { pearlEmitted = false; }
  return { sealLogId, pearlEmitted };
}

export function evictLRU(registry: CabinetLRUEntry[], pressureThresholdBytes: number): CabinetLRUEntry[] {
  const nowMs = Date.now();
  const evicted: CabinetLRUEntry[] = [];
  const sorted = [...registry].sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
  for (const entry of sorted) {
    const expired = nowMs > entry.keepAliveUntil;
    if (expired || pressureThresholdBytes > 0) {
      for (const cacheKey of _jarCache.keys()) { if (cacheKey.endsWith(`::${entry.substratePath}`)) { _jarCache.delete(cacheKey); _cabinetLRU.delete(cacheKey); } }
      evicted.push(entry);
      if (!expired) break;
    }
  }
  return evicted;
}

export function getLRUSnapshot(): CabinetLRUEntry[] { return [..._cabinetLRU.values()]; }
