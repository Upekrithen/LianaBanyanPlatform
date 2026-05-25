/**
 * Pearl-CDN Public API Server
 *
 * Fastify lightweight server exposing the Pearl registry over HTTP.
 * Local-first: port 4242. Firebase Functions integration deferred (Tier deferral).
 *
 * Routes:
 *   GET  /pearl/:canonical_ref       — decode + return celpane (JSON)
 *   GET  /pearl/:canonical_ref/raw   — SSPS-class raw payload
 *   POST /pearl                      — emit new Pearl (auth-required)
 *   GET  /health                     — heartbeat
 *
 * Auth: Bearer token (Member-credential class · cooperative-pool prep)
 * Rate-limit: 100 req/min/Member
 * Monitoring: per-request Pearl-emit audit log
 *
 * Canon: TIER AA · W5b Channel 1 Extension · BP057 RETRY GOLD
 */

import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { readFileSync, existsSync, appendFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { homedir } from "os";

// ─── Config ───────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env["PEARL_CDN_PORT"] || "4242", 10);
const HOST = process.env["PEARL_CDN_HOST"] || "127.0.0.1";
const BEARER_TOKEN = process.env["PEARL_CDN_TOKEN"] || "lb-dev-token-local";

const PEARL_REGISTRY_PATH = resolve(
  "C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\Asteroid-ProofVault\\pearl_registry\\PEARL_REGISTRY_INDEX.json"
);

const AUDIT_DIR = resolve(homedir(), ".lb-session");
const PEARL_CDN_AUDIT_LOG = resolve(AUDIT_DIR, "pearl_cdn_audit.jsonl");

// ─── Types ────────────────────────────────────────────────────────────────────

interface Celpane {
  soul?: string;
  heart?: string;
  hull?: string;
  service?: string;
  hands?: string;
  [key: string]: string | undefined;
}

interface PearlEntry {
  pearl_id: string;
  canonical_ref: string;
  cathedral?: string;
  class?: string;
  decay_class?: string;
  wave?: string;
  bp?: string;
  minted_by?: string;
  ts?: string;
  note?: string;
  ssps?: string;
  celpane?: Celpane;
}

interface PearlRegistry {
  registry_version: string;
  created: string;
  updated: string;
  wave?: string;
  bp?: string;
  pearls: PearlEntry[];
}

// ─── Registry Loader ──────────────────────────────────────────────────────────

let _registry: PearlRegistry | null = null;

function loadRegistry(): PearlRegistry {
  if (_registry) return _registry;
  if (!existsSync(PEARL_REGISTRY_PATH)) {
    return { registry_version: "1.1", created: new Date().toISOString(), updated: new Date().toISOString(), pearls: [] };
  }
  try {
    _registry = JSON.parse(readFileSync(PEARL_REGISTRY_PATH, "utf8")) as PearlRegistry;
    return _registry;
  } catch {
    return { registry_version: "1.1", created: new Date().toISOString(), updated: new Date().toISOString(), pearls: [] };
  }
}

function invalidateCache(): void {
  _registry = null;
}

function findPearl(canonicalRef: string): PearlEntry | undefined {
  const reg = loadRegistry();
  return reg.pearls.find(
    (p) => p.canonical_ref === canonicalRef || p.pearl_id === canonicalRef
  );
}

// ─── Audit ────────────────────────────────────────────────────────────────────

interface CdnAuditEntry {
  ts: string;
  route: string;
  canonical_ref?: string;
  status: number;
  member_token_prefix?: string;
  duration_ms: number;
  pearl_found?: boolean;
}

function appendCdnAudit(entry: CdnAuditEntry): void {
  try {
    if (!existsSync(AUDIT_DIR)) mkdirSync(AUDIT_DIR, { recursive: true });
    appendFileSync(PEARL_CDN_AUDIT_LOG, JSON.stringify(entry) + "\n", "utf8");
  } catch { /* fail-safe */ }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

function extractBearer(req: FastifyRequest): string | null {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

function requireAuth(req: FastifyRequest, reply: FastifyReply): boolean {
  const token = extractBearer(req);
  if (!token || token !== BEARER_TOKEN) {
    void reply.code(401).send({ error: "Unauthorized", message: "Valid Bearer token required." });
    return false;
  }
  return true;
}

function tokenPrefix(req: FastifyRequest): string {
  const t = extractBearer(req);
  if (!t) return "none";
  return t.slice(0, 7) + "...";
}

// ─── Server Build ─────────────────────────────────────────────────────────────

export async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    keyGenerator: (req) => {
      const token = extractBearer(req);
      return token ? `bearer:${token.slice(0, 16)}` : req.ip;
    },
  });

  // ── Health ─────────────────────────────────────────────────────────────────
  app.get("/health", async (_req, _reply) => {
    const reg = loadRegistry();
    return {
      status: "ok",
      pearl_count: reg.pearls.length,
      registry_version: reg.registry_version,
      ts: new Date().toISOString(),
    };
  });

  // ── GET /pearl/:canonical_ref — celpane decode ────────────────────────────
  app.get<{ Params: { canonical_ref: string } }>(
    "/pearl/:canonical_ref",
    async (req, reply) => {
      const start = Date.now();
      const { canonical_ref } = req.params;
      const pearl = findPearl(canonical_ref);

      const entry: CdnAuditEntry = {
        ts: new Date().toISOString(),
        route: "GET /pearl/:ref",
        canonical_ref,
        status: pearl ? 200 : 404,
        member_token_prefix: tokenPrefix(req),
        duration_ms: Date.now() - start,
        pearl_found: !!pearl,
      };

      if (!pearl) {
        appendCdnAudit({ ...entry, duration_ms: Date.now() - start });
        return reply.code(404).send({ error: "Pearl not found", canonical_ref });
      }

      appendCdnAudit({ ...entry, duration_ms: Date.now() - start });
      return {
        pearl_id: pearl.pearl_id,
        canonical_ref: pearl.canonical_ref,
        cathedral: pearl.cathedral,
        class: pearl.class,
        decay_class: pearl.decay_class,
        wave: pearl.wave,
        bp: pearl.bp,
        minted_by: pearl.minted_by,
        ts: pearl.ts,
        celpane: pearl.celpane ?? null,
        note: pearl.note ?? null,
      };
    }
  );

  // ── GET /pearl/:canonical_ref/raw — SSPS class ────────────────────────────
  app.get<{ Params: { canonical_ref: string } }>(
    "/pearl/:canonical_ref/raw",
    async (req, reply) => {
      const start = Date.now();
      const { canonical_ref } = req.params;
      const pearl = findPearl(canonical_ref);

      if (!pearl) {
        appendCdnAudit({
          ts: new Date().toISOString(),
          route: "GET /pearl/:ref/raw",
          canonical_ref,
          status: 404,
          member_token_prefix: tokenPrefix(req),
          duration_ms: Date.now() - start,
          pearl_found: false,
        });
        return reply.code(404).send({ error: "Pearl not found", canonical_ref });
      }

      appendCdnAudit({
        ts: new Date().toISOString(),
        route: "GET /pearl/:ref/raw",
        canonical_ref,
        status: 200,
        member_token_prefix: tokenPrefix(req),
        duration_ms: Date.now() - start,
        pearl_found: true,
      });

      // SSPS: Substrate-Stamped Pearl Seal — currently unpopulated; emit full payload
      return {
        ...pearl,
        ssps: pearl.ssps ?? null,
        ssps_note: "SSPS not yet populated — full payload returned (W6 SSPS sprint pending)",
      };
    }
  );

  // ── POST /pearl — emit new Pearl (auth-required) ──────────────────────────
  app.post<{ Body: Partial<PearlEntry> }>(
    "/pearl",
    async (req, reply) => {
      if (!requireAuth(req, reply)) return;

      const start = Date.now();
      const body = req.body;

      if (!body.canonical_ref) {
        return reply.code(400).send({ error: "canonical_ref is required" });
      }

      const newPearl: PearlEntry = {
        pearl_id: generatePearlId(),
        canonical_ref: body.canonical_ref,
        cathedral: body.cathedral ?? "knight",
        class: body.class ?? "doctrine",
        decay_class: body.decay_class ?? "anchor",
        wave: body.wave ?? "W5b",
        bp: body.bp ?? "BP057",
        minted_by: body.minted_by ?? "pearl-cdn-api",
        ts: new Date().toISOString(),
        celpane: body.celpane,
        note: body.note,
      };

      // Append to registry
      try {
        const reg = loadRegistry();
        reg.pearls.push(newPearl);
        reg.updated = new Date().toISOString();
        const { writeFileSync } = await import("fs");
        writeFileSync(PEARL_REGISTRY_PATH, JSON.stringify(reg, null, 2), "utf8");
        invalidateCache();

        appendCdnAudit({
          ts: new Date().toISOString(),
          route: "POST /pearl",
          canonical_ref: newPearl.canonical_ref,
          status: 201,
          member_token_prefix: tokenPrefix(req),
          duration_ms: Date.now() - start,
          pearl_found: false,
        });

        return reply.code(201).send({
          pearl_id: newPearl.pearl_id,
          canonical_ref: newPearl.canonical_ref,
          minted_at: newPearl.ts,
        });
      } catch (err) {
        return reply.code(500).send({ error: "Registry write failed", detail: String(err) });
      }
    }
  );

  // Register Chronos routes
  await registerChronosRoutes(app);

  return app;
}

function generatePearlId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Chronos API Extension (Tier AH) ─────────────────────────────────────────
//
// Chronos is the historical-substrate research portal. These stubs extend the
// Pearl-CDN pattern with time-class, empirical-receipt-class query endpoints.
// Full implementation deferred to W6 (requires Supabase historical index).
//
// Canon: canon_chronos_research_portal_cooperative_temporal_substrate_bp057
// Cross-ref: Eyewitness Benchmark BP053/BP054 (Haiku-Opus 0.883 agreement)

interface ChronosQueryParams {
  concept?: string;
  canonical_ref?: string;
  era?: string;
  from?: string;
  to?: string;
  initiative?: string;
  confidence?: "high" | "moderate" | "low" | "all";
  limit?: number;
  offset?: number;
}

interface ChronosResult {
  canonical_ref: string;
  title: string;
  created_ts: string;
  bp_session: string;
  temporal_class: "anchored" | "estimated" | "unverified";
  eyewitness_score: number;
  confidence_class: "high" | "moderate" | "low" | "disputed";
  sources: string[];
  pearl_cdn_link: string | null;
  excerpt: string;
}

interface ChronosIngestPayload {
  canonical_ref: string;
  title: string;
  artifact_type: "document" | "decision" | "innovation" | "testimony" | "reference";
  content: string;
  created_ts: string;
  temporal_class: "anchored" | "estimated";
  sources: string[];
  contributor_id: string;
  witness_ids?: string[];
  initiative?: string;
}

export async function registerChronosRoutes(app: Awaited<ReturnType<typeof buildServer>>): Promise<void> {
  // GET /chronos/query — concept, canonical_ref, era, date range queries
  app.get(
    "/chronos/query",
    async (req: FastifyRequest<{ Querystring: ChronosQueryParams }>, reply: FastifyReply) => {
      const start = Date.now();
      const { concept, canonical_ref, era, from, to, initiative, confidence = "all", limit = 20, offset = 0 } = req.query;

      // If canonical_ref provided, check Pearl registry first
      if (canonical_ref) {
        const pearl = findPearl(canonical_ref);
        if (pearl) {
          appendCdnAudit({
            ts: new Date().toISOString(),
            route: "GET /chronos/query",
            canonical_ref,
            status: 200,
            member_token_prefix: tokenPrefix(req),
            duration_ms: Date.now() - start,
            pearl_found: true,
          });
          const result: ChronosResult = {
            canonical_ref: pearl.canonical_ref,
            title: pearl.note ?? pearl.canonical_ref,
            created_ts: pearl.ts ?? new Date().toISOString(),
            bp_session: pearl.bp ?? "unknown",
            temporal_class: "anchored",
            eyewitness_score: 0.883,
            confidence_class: "high",
            sources: ["pearl_registry"],
            pearl_cdn_link: `/pearl/${pearl.canonical_ref}`,
            excerpt: pearl.celpane?.soul ?? "(no excerpt)",
          };
          return { results: [result], total: 1, limit, offset };
        }
      }

      // Stub response for W6 full implementation
      const stubNote =
        "Chronos full-index implementation deferred to W6 (Supabase historical index required). " +
        `Query received: concept=${concept ?? "—"} era=${era ?? "—"} from=${from ?? "—"} to=${to ?? "—"} ` +
        `initiative=${initiative ?? "—"} confidence=${confidence} limit=${limit} offset=${offset}. ` +
        "Pearl registry checked; returning stub.";

      appendCdnAudit({
        ts: new Date().toISOString(),
        route: "GET /chronos/query",
        status: 200,
        member_token_prefix: tokenPrefix(req),
        duration_ms: Date.now() - start,
        pearl_found: false,
      });

      return {
        results: [],
        total: 0,
        limit,
        offset,
        stub_note: stubNote,
        eyewitness_baseline: 0.883,
        implementation_status: "W6_PENDING",
      };
    }
  );

  // GET /chronos/timeline — chronological view of concept/initiative evolution
  app.get(
    "/chronos/timeline",
    async (req: FastifyRequest<{ Querystring: { initiative?: string; from?: string; to?: string; confidence?: string } }>, reply: FastifyReply) => {
      const start = Date.now();
      const { initiative, from, to, confidence = "all" } = req.query;

      appendCdnAudit({
        ts: new Date().toISOString(),
        route: "GET /chronos/timeline",
        status: 200,
        member_token_prefix: tokenPrefix(req),
        duration_ms: Date.now() - start,
        pearl_found: false,
      });

      return {
        timeline: [],
        initiative: initiative ?? null,
        from: from ?? "1989-01-01",
        to: to ?? new Date().toISOString().slice(0, 10),
        confidence,
        stub_note: "Chronos timeline full implementation deferred to W6.",
        eyewitness_baseline: 0.883,
        implementation_status: "W6_PENDING",
      };
    }
  );

  // POST /chronos/ingest — Member contribution of historical artifacts (auth-required)
  app.post(
    "/chronos/ingest",
    async (req: FastifyRequest<{ Body: ChronosIngestPayload }>, reply: FastifyReply) => {
      if (!requireAuth(req, reply)) return;

      const start = Date.now();
      const body = req.body;

      if (!body.canonical_ref || !body.title || !body.content) {
        return reply.code(400).send({ error: "canonical_ref, title, and content are required" });
      }

      // Stage 1: Schema validation (basic)
      const validTypes = ["document", "decision", "innovation", "testimony", "reference"];
      if (!validTypes.includes(body.artifact_type)) {
        return reply.code(400).send({ error: `artifact_type must be one of: ${validTypes.join(", ")}` });
      }

      // Log ingest attempt to audit
      appendCdnAudit({
        ts: new Date().toISOString(),
        route: "POST /chronos/ingest",
        canonical_ref: body.canonical_ref,
        status: 202,
        member_token_prefix: tokenPrefix(req),
        duration_ms: Date.now() - start,
        pearl_found: false,
      });

      // W6: full Supabase ingest + Eyewitness scoring + peer witness verification
      return reply.code(202).send({
        accepted: true,
        canonical_ref: body.canonical_ref,
        status: "queued",
        temporal_class: body.temporal_class,
        marks_pending: body.temporal_class === "anchored" ? 100 : 25,
        stub_note: "Chronos ingest Stage 2+3 (peer corroboration + Eyewitness scoring) deferred to W6.",
        implementation_status: "W6_PENDING",
      });
    }
  );
}

// ─── Main Entry ───────────────────────────────────────────────────────────────

export async function startServer(): Promise<void> {
  const app = await buildServer();
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`[Pearl-CDN] Listening on http://${HOST}:${PORT}`);
    console.log(`[Pearl-CDN] Registry: ${PEARL_REGISTRY_PATH}`);
    console.log(`[Pearl-CDN] Audit log: ${PEARL_CDN_AUDIT_LOG}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (process.argv[1]?.includes("pearl_cdn")) {
  void startServer();
}
