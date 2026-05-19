// DEPLOY-GATE: requires .github/workflows/supabase-pgtap.yml green on current SHA.

/**
 * cathedral-import edge function (K438b Phase E)
 * ==============================================
 * Symmetric inverse of cathedral-export. Accepts a multipart/form-data
 * POST with a ZIP bundle (produced by cathedral-export OR by a future
 * Liana Counterpart CLI ship) and restores it into the caller's Cathedral.
 *
 * Form fields:
 *   bundle              — the ZIP file
 *   collision_strategy  — 'merge' (default) | 'overwrite' | 'keep_existing'
 *   member_id           — optional; if absent we use the JWT's user id
 *
 * Per-Scribe collision handling:
 *   merge          — if a same-named Scribe exists, append imported
 *                    entries to it (existing entries kept; Scribe
 *                    metadata updated to imported version)
 *   overwrite      — delete existing same-named Scribe rows + entries,
 *                    then create fresh from bundle. Logs a tidbit
 *                    audit record before deleting.
 *   keep_existing  — skip imported Scribes whose name collides with
 *                    an existing one; report skipped names
 *
 * Auth: identical to cathedral-export — caller's JWT must match member_id.
 *
 * Returns: { ok: true, scribes_imported, entries_imported, skipped, ... }
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { unzipSync, strFromU8 } from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CollisionStrategy = "merge" | "overwrite" | "keep_existing";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface BundleScribe {
  id?: string;
  name: string;
  primary_field: string;
  adjacents: { level: number; field: string }[];
  keywords: string[];
  active?: boolean;
  share_level?: string;
}

interface BundleEntry {
  ts?: string;
  session?: string | null;
  observation: string;
  source?: string;
  canonical_ref?: string | null;
  tags?: string[];
}

function parseRegistry(zip: Record<string, Uint8Array>): BundleScribe[] {
  // Prefer registry.json (unambiguous); fall back to a tolerant YAML parse.
  if (zip["registry.json"]) {
    try {
      const obj = JSON.parse(strFromU8(zip["registry.json"]));
      if (Array.isArray(obj?.scribes)) return obj.scribes as BundleScribe[];
    } catch {
      // fall through
    }
  }
  if (zip["registry.yaml"]) {
    return parseRegistryYamlMinimal(strFromU8(zip["registry.yaml"]));
  }
  return [];
}

function parseRegistryYamlMinimal(raw: string): BundleScribe[] {
  // Mirror of the Python reader's parser. Only the shape produced by
  // cathedral-export is supported.
  const scribes: BundleScribe[] = [];
  let current: any = null;
  let currentListKey: string | null = null;
  let currentAdj: any = null;
  let inScribes = false;

  for (const rawLine of raw.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (line.trim() === "scribes:") {
      inScribes = true;
      continue;
    }
    if (!inScribes) continue;
    const stripped = line.replace(/^\s+/, "");
    const indent = line.length - stripped.length;
    if (indent === 2 && stripped.startsWith("- ")) {
      if (current) scribes.push(current);
      current = { adjacents: [], keywords: [] };
      currentListKey = null;
      currentAdj = null;
      const kv = stripped.slice(2);
      if (kv.includes(":")) {
        const idx = kv.indexOf(":");
        current[kv.slice(0, idx).trim()] = yamlScalar(kv.slice(idx + 1).trim());
      }
      continue;
    }
    if (indent === 4 && stripped.includes(":") && current) {
      const idx = stripped.indexOf(":");
      const k = stripped.slice(0, idx).trim();
      const v = stripped.slice(idx + 1).trim();
      if (v === "") {
        currentListKey = k;
        current[k] = [];
        currentAdj = null;
      } else {
        current[k] = yamlScalar(v);
        currentListKey = null;
      }
    } else if (indent === 6 && stripped.startsWith("- ") && currentListKey && current) {
      const item = stripped.slice(2).trim();
      if (item.includes(":")) {
        const idx = item.indexOf(":");
        currentAdj = {};
        currentAdj[item.slice(0, idx).trim()] = yamlScalar(item.slice(idx + 1).trim());
        current[currentListKey].push(currentAdj);
      } else {
        current[currentListKey].push(yamlScalar(item));
        currentAdj = null;
      }
    } else if (indent === 8 && stripped.includes(":") && currentAdj) {
      const idx = stripped.indexOf(":");
      currentAdj[stripped.slice(0, idx).trim()] = yamlScalar(stripped.slice(idx + 1).trim());
    }
  }
  if (current) scribes.push(current);
  return scribes;
}

function yamlScalar(v: string): unknown {
  v = v.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  return v;
}

function parseTablet(raw: string): { header: any; entries: BundleEntry[] } {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  let header: any = null;
  const entries: BundleEntry[] = [];
  for (const line of lines) {
    try {
      const row = JSON.parse(line);
      if (row?.type === "header") {
        header = row;
      } else {
        entries.push(row as BundleEntry);
      }
    } catch {
      // Skip malformed line silently — append-only tablets occasionally
      // accrue corrupt rows from prior tooling. Don't poison the import.
    }
  }
  return { header, entries };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "server_not_configured" }, 500);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "invalid_multipart_body" }, 400);
  }

  const bundleEntry = form.get("bundle");
  if (!(bundleEntry instanceof File)) return json({ error: "missing_bundle_file" }, 400);
  const collisionStrategy = (form.get("collision_strategy") as string) || "merge";
  if (!["merge", "overwrite", "keep_existing"].includes(collisionStrategy)) {
    return json({ error: "invalid_collision_strategy" }, 400);
  }
  const explicitMemberId = (form.get("member_id") as string) || null;

  // Verify caller JWT, derive member_id
  const auth = req.headers.get("Authorization") || req.headers.get("authorization");
  const jwt = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length) : null;
  if (!jwt) return json({ error: "missing_auth" }, 401);
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const userClient: SupabaseClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const userRes = await userClient.auth.getUser(jwt);
  if (userRes.error || !userRes.data.user) {
    return json({ error: "auth_failed", hint: userRes.error?.message }, 401);
  }
  const memberId = explicitMemberId ?? userRes.data.user.id;
  if (memberId !== userRes.data.user.id) return json({ error: "member_id_mismatch" }, 403);

  const admin: SupabaseClient = createClient(url, serviceKey, {
    db: { schema: "cathedral" },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Ensure the Cathedral exists before importing into it.
  await admin.rpc("ensure_member_cathedral", {
    p_member_id: memberId,
    p_professional_domain: null,
  });

  // Unzip
  const zipArr = new Uint8Array(await bundleEntry.arrayBuffer());
  let zip: Record<string, Uint8Array>;
  try {
    zip = unzipSync(zipArr);
  } catch (err) {
    return json({ error: "invalid_zip", hint: (err as Error).message }, 400);
  }

  const bundleScribes = parseRegistry(zip);
  if (bundleScribes.length === 0) {
    return json({ error: "empty_or_unparseable_registry" }, 400);
  }

  // Existing Scribes for collision detection
  const existingRes = await admin
    .from("member_scribes")
    .select("scribe_id, name")
    .eq("member_id", memberId);
  if (existingRes.error) {
    return json({ error: "existing_scribes_query_failed", hint: existingRes.error.message }, 500);
  }
  const existingByLower = new Map<string, { scribe_id: string; name: string }>();
  for (const s of (existingRes.data ?? []) as { scribe_id: string; name: string }[]) {
    existingByLower.set(s.name.toLowerCase(), s);
  }

  let scribesImported = 0;
  let entriesImported = 0;
  const skipped: string[] = [];
  const overwritten: string[] = [];

  for (const bs of bundleScribes) {
    const lname = (bs.name || "").toLowerCase().trim();
    if (!lname) continue;
    const existing = existingByLower.get(lname);

    let targetScribeId: string | null = null;

    if (existing) {
      if (collisionStrategy === "keep_existing") {
        skipped.push(bs.name);
        continue;
      }
      if (collisionStrategy === "overwrite") {
        // Audit log to tidbits BEFORE delete
        await admin.from("tidbits").insert({
          member_id: memberId,
          agent: "KNIGHT",
          category: "cathedral_import_overwrite",
          observation: `cathedral-import overwrote existing Scribe '${bs.name}' (scribe_id=${existing.scribe_id})`,
          artifact_served: "platform/supabase/functions/cathedral-import",
        });
        // Cascading FK on scribe_entries -> member_scribes deletes child entries.
        const delRes = await admin
          .from("member_scribes")
          .delete()
          .eq("scribe_id", existing.scribe_id);
        if (delRes.error) {
          return json({ error: "overwrite_delete_failed", hint: delRes.error.message }, 500);
        }
        overwritten.push(bs.name);
        // Fall through to insert below
      } else {
        // merge: keep existing scribe row; update editable metadata; reuse id
        targetScribeId = existing.scribe_id;
        const updRes = await admin
          .from("member_scribes")
          .update({
            primary_field: bs.primary_field,
            adjacents: bs.adjacents ?? [],
            keywords: bs.keywords ?? [],
            share_level: bs.share_level ?? "private",
            active: bs.active ?? true,
          })
          .eq("scribe_id", existing.scribe_id);
        if (updRes.error) {
          return json({ error: "merge_update_failed", hint: updRes.error.message }, 500);
        }
      }
    }

    if (!targetScribeId) {
      // Insert fresh Scribe (overwrite or no-collision path)
      const insRes = await admin
        .from("member_scribes")
        .insert({
          member_id: memberId,
          name: bs.name,
          primary_field: bs.primary_field,
          adjacents: bs.adjacents ?? [],
          keywords: bs.keywords ?? [],
          active: bs.active ?? true,
          share_level: bs.share_level ?? "private",
        })
        .select("scribe_id")
        .single();
      if (insRes.error) {
        return json({ error: "scribe_insert_failed", hint: insRes.error.message, scribe: bs.name }, 500);
      }
      targetScribeId = (insRes.data as { scribe_id: string }).scribe_id;
      scribesImported++;
    }

    // Find tablet file for this Scribe (try id then sanitized name + variants)
    const tabletRaw = findTabletForScribe(zip, bs);
    if (!tabletRaw) continue;
    const { entries } = parseTablet(tabletRaw);
    if (entries.length === 0) continue;

    // Bulk insert entries (batch of 500 to avoid timeouts on large tablets)
    const BATCH = 500;
    for (let i = 0; i < entries.length; i += BATCH) {
      const batch = entries.slice(i, i + BATCH).map((e) => ({
        scribe_id: targetScribeId,
        member_id: memberId,
        ts: e.ts ?? new Date().toISOString(),
        session_id: (e.session as string | null) ?? null,
        observation: e.observation,
        source: e.source ?? "founder_dialogue",
        canonical_ref: e.canonical_ref ?? null,
        tags: e.tags ?? [],
      }));
      const insRes = await admin.from("scribe_entries").insert(batch);
      if (insRes.error) {
        return json(
          {
            error: "entry_insert_failed",
            hint: insRes.error.message,
            scribe: bs.name,
            batch_offset: i,
            scribes_imported: scribesImported,
            entries_imported: entriesImported,
          },
          500,
        );
      }
      entriesImported += batch.length;
    }
  }

  return json({
    ok: true,
    member_id: memberId,
    collision_strategy: collisionStrategy,
    scribes_imported: scribesImported,
    entries_imported: entriesImported,
    skipped,
    overwritten,
    bundle_scribe_count: bundleScribes.length,
  });
});

function findTabletForScribe(
  zip: Record<string, Uint8Array>,
  scribe: BundleScribe,
): string | null {
  const candidates: string[] = [];
  const safe = (scribe.name || "").replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 64);
  candidates.push(`scribe_${safe}.jsonl`);
  for (let i = 1; i < 5; i++) candidates.push(`scribe_${safe}_${i}.jsonl`);
  if (scribe.id) candidates.push(`scribe_${scribe.id}.jsonl`);
  for (const c of candidates) {
    if (zip[c]) return strFromU8(zip[c]);
  }
  return null;
}
