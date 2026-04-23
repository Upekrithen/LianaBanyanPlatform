/**
 * test_member_cathedral.mjs (K438b Phase F)
 * =========================================
 * Coverage for the K438b MCP tools (member_consult_scribes + member_fates_route)
 * and the standalone Python reader. Uses an in-memory Supabase stub so the
 * tests run anywhere — no live DB required.
 *
 * Cases (numbered to match the K438b prompt's Phase F enumeration):
 *
 *   member_consult_scribes (#10..#14):
 *     10. Returns member's own Scribes first when both own + shared match
 *     11. include_shared=false excludes shared Scribes
 *     12. since_ts filter excludes older entries
 *     13. Empty Cathedral returns empty array
 *     14. top_k cap honored
 *     14b. invalid member_id surfaces clear error
 *
 *   member_fates_route (#15..#17):
 *     15. Produces fates_log row with correct member_id
 *     16. Coverage-gap fires when content routes to <3 Scribes
 *     17. Latency under 500ms on benchmark input
 *     17b. dispatch_cap honored
 *     17c. invalid_member_id rejected
 */
import { test } from "node:test";
import assert from "node:assert/strict";

const { memberConsultScribes } = await import("../dist/cathedral_supabase/member_consult.js");
const { memberFatesRoute, clothoExtractForMember } = await import(
  "../dist/cathedral_supabase/member_fates.js"
);

// ─── Stubbed Supabase client ──────────────────────────────────────────────
//
// Implements just enough surface for the tools under test:
//   client.from(table).select(...).eq(...).neq(...).gt(...)
//                     .in(...).order(...).limit(...).maybeSingle().single()
//   client.from(table).insert(row).select(...).single()
//
// All chainable methods return `this`; terminal methods return a promise of
// { data, error }. The store is a plain {table -> rows[]} dict.

function makeFakeClient(seed = {}) {
  const store = {
    member_scribes: [...(seed.member_scribes ?? [])],
    scribe_entries: [...(seed.scribe_entries ?? [])],
    fates_log: [...(seed.fates_log ?? [])],
  };
  const inserted = { member_scribes: [], scribe_entries: [], fates_log: [] };

  function makeQuery(table) {
    const filters = [];
    let orderClause = null;
    let limitClause = null;
    let selectCols = "*";
    let mode = "select"; // 'select' | 'insert'
    let insertRows = null;
    let postSelectAfterInsert = false;

    const exec = async () => {
      if (mode === "insert") {
        const rows = (Array.isArray(insertRows) ? insertRows : [insertRows]).map((r) => ({
          ...r,
          // Synthetic IDs / timestamps so the rest of the system has values to work with.
          scribe_id: r.scribe_id ?? `synth-scribe-${Math.random().toString(36).slice(2, 10)}`,
          entry_id: r.entry_id ?? `synth-entry-${Math.random().toString(36).slice(2, 10)}`,
          log_id: r.log_id ?? `synth-log-${Math.random().toString(36).slice(2, 10)}`,
          ts: r.ts ?? new Date().toISOString(),
          shared_level: r.shared_level ?? "private",
          shared: r.shared ?? false,
        }));
        store[table].push(...rows);
        inserted[table].push(...rows);
        if (postSelectAfterInsert) {
          return { data: rows[0], error: null };
        }
        return { data: rows, error: null };
      }
      // SELECT path
      let rows = store[table] ?? [];
      for (const f of filters) {
        if (f.op === "eq") rows = rows.filter((r) => r[f.col] === f.val);
        else if (f.op === "neq") rows = rows.filter((r) => r[f.col] !== f.val);
        else if (f.op === "gt") rows = rows.filter((r) => r[f.col] > f.val);
        else if (f.op === "in") rows = rows.filter((r) => f.val.includes(r[f.col]));
      }
      if (orderClause) {
        const { col, ascending } = orderClause;
        rows = [...rows].sort((a, b) => {
          if (a[col] < b[col]) return ascending ? -1 : 1;
          if (a[col] > b[col]) return ascending ? 1 : -1;
          return 0;
        });
      }
      if (limitClause != null) rows = rows.slice(0, limitClause);
      return { data: rows, error: null };
    };

    const q = {
      select(cols) {
        selectCols = cols;
        return q;
      },
      insert(rows) {
        mode = "insert";
        insertRows = rows;
        return q;
      },
      eq(col, val) {
        filters.push({ op: "eq", col, val });
        return q;
      },
      neq(col, val) {
        filters.push({ op: "neq", col, val });
        return q;
      },
      gt(col, val) {
        filters.push({ op: "gt", col, val });
        return q;
      },
      in(col, val) {
        filters.push({ op: "in", col, val });
        return q;
      },
      order(col, opts) {
        orderClause = { col, ascending: opts?.ascending !== false };
        return q;
      },
      limit(n) {
        limitClause = n;
        return q;
      },
      single() {
        postSelectAfterInsert = true;
        return exec().then((r) => ({
          data: Array.isArray(r.data) ? r.data[0] : r.data,
          error: r.error,
        }));
      },
      maybeSingle() {
        return exec().then((r) => ({
          data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data,
          error: r.error,
        }));
      },
      then(resolve, reject) {
        return exec().then(resolve, reject);
      },
    };
    return q;
  }

  return {
    from(table) {
      return makeQuery(table);
    },
    __store: store,
    __inserted: inserted,
  };
}

// ─── Fixtures ────────────────────────────────────────────────────────────

const MEMBER_A = "11111111-1111-1111-1111-111111111111";
const MEMBER_B = "22222222-2222-2222-2222-222222222222";

function fixtureScribe({ scribe_id, member_id, name, primary_field, keywords, share_level = "private", adjacents = [], active = true }) {
  return {
    scribe_id,
    member_id,
    name,
    primary_field,
    adjacents,
    keywords,
    active,
    share_level,
    share_target_id: null,
    created_at: "2026-04-23T00:00:00Z",
    updated_at: "2026-04-23T00:00:00Z",
  };
}

function fixtureEntry({ entry_id, scribe_id, member_id, observation, ts, shared_level = "private", shared = false }) {
  return {
    entry_id,
    scribe_id,
    member_id,
    ts,
    session_id: "K438b-test",
    observation,
    source: "founder_dialogue",
    canonical_ref: null,
    tags: [],
    shared_level,
    shared,
  };
}

function buildFixture() {
  const scribes = [
    fixtureScribe({
      scribe_id: "s-a-work",
      member_id: MEMBER_A,
      name: "Work",
      primary_field: "Member A's professional domain",
      keywords: ["project", "deadline", "team"],
    }),
    fixtureScribe({
      scribe_id: "s-a-health",
      member_id: MEMBER_A,
      name: "Health",
      primary_field: "personal health context",
      keywords: ["medication", "doctor", "appointment"],
    }),
    fixtureScribe({
      scribe_id: "s-b-commons",
      member_id: MEMBER_B,
      name: "Public-Cooking",
      primary_field: "shared cooking knowledge",
      keywords: ["recipe", "ingredient", "kitchen"],
      share_level: "commons",
    }),
  ];
  const entries = [
    fixtureEntry({
      entry_id: "e1",
      scribe_id: "s-a-work",
      member_id: MEMBER_A,
      observation: "Shipped the K438a schema migration today",
      ts: "2026-04-22T10:00:00Z",
    }),
    fixtureEntry({
      entry_id: "e2",
      scribe_id: "s-a-work",
      member_id: MEMBER_A,
      observation: "Project deadline moved to next week",
      ts: "2026-04-23T10:00:00Z",
    }),
    fixtureEntry({
      entry_id: "e3",
      scribe_id: "s-a-health",
      member_id: MEMBER_A,
      observation: "Doctor appointment scheduled for May 1",
      ts: "2026-04-23T11:00:00Z",
    }),
    fixtureEntry({
      entry_id: "e4",
      scribe_id: "s-b-commons",
      member_id: MEMBER_B,
      observation: "Sourdough recipe — 24-hour fermentation works best in winter",
      ts: "2026-04-23T12:00:00Z",
      shared_level: "commons",
      shared: true,
    }),
  ];
  return { scribes, entries };
}

// ─── member_consult_scribes tests ────────────────────────────────────────

test("#10 member_consult_scribes returns member's own Scribes first when both own + shared match", async () => {
  const { scribes, entries } = buildFixture();
  // Force a query that hits both own AND shared via a generic theme.
  // Add a Scribe owned by A whose primary_field matches "recipe".
  scribes.push(
    fixtureScribe({
      scribe_id: "s-a-cooking",
      member_id: MEMBER_A,
      name: "Cooking",
      primary_field: "personal recipes and meal planning",
      keywords: ["recipe", "kitchen"],
    }),
  );
  entries.push(
    fixtureEntry({
      entry_id: "e5",
      scribe_id: "s-a-cooking",
      member_id: MEMBER_A,
      observation: "Tried a new pasta recipe last night",
      ts: "2026-04-23T13:00:00Z",
    }),
  );
  const client = makeFakeClient({ member_scribes: scribes, scribe_entries: entries });
  const result = await memberConsultScribes({
    member_id: MEMBER_A,
    query: "recipe",
    top_k: 10,
    client,
  });
  assert.equal(result.ok, true);
  assert.ok(result.entries.length >= 2, "should return both own + shared entries");
  // First entry must be from member A's own Scribe
  assert.equal(result.entries[0].is_own, true, "first entry must be member A's own");
  assert.equal(result.entries[0].scribe_name, "Cooking");
});

test("#11 member_consult_scribes with include_shared=false excludes shared Scribes", async () => {
  const { scribes, entries } = buildFixture();
  const client = makeFakeClient({ member_scribes: scribes, scribe_entries: entries });
  const result = await memberConsultScribes({
    member_id: MEMBER_A,
    query: "recipe",
    include_shared: false,
    client,
  });
  assert.equal(result.ok, true);
  // Member A has no Scribe matching "recipe" in this fixture (without the cooking add-on)
  // so the only candidate would be the shared B-commons; with include_shared=false, empty.
  for (const e of result.entries) {
    assert.equal(e.is_own, true, "no shared entries when include_shared=false");
  }
});

test("#12 member_consult_scribes since_ts filter excludes older entries", async () => {
  const { scribes, entries } = buildFixture();
  const client = makeFakeClient({ member_scribes: scribes, scribe_entries: entries });
  const result = await memberConsultScribes({
    member_id: MEMBER_A,
    query: "deadline",
    since_ts: "2026-04-22T23:59:59Z",
    client,
  });
  assert.equal(result.ok, true);
  for (const e of result.entries) {
    assert.ok(e.ts > "2026-04-22T23:59:59Z", `entry ${e.ts} should be newer than since_ts`);
  }
});

test("#13 member_consult_scribes empty Cathedral returns empty array (no error)", async () => {
  const client = makeFakeClient({ member_scribes: [], scribe_entries: [] });
  const result = await memberConsultScribes({
    member_id: MEMBER_A,
    query: "anything at all",
    client,
  });
  assert.equal(result.ok, true);
  assert.equal(result.entries.length, 0);
  assert.equal(result.scribes_consulted.length, 0);
});

test("#14 member_consult_scribes top_k cap honored", async () => {
  const { scribes, entries } = buildFixture();
  // Add 20 more entries on the Work Scribe so top_k matters
  for (let i = 0; i < 20; i++) {
    entries.push(
      fixtureEntry({
        entry_id: `e-bulk-${i}`,
        scribe_id: "s-a-work",
        member_id: MEMBER_A,
        observation: `team meeting note #${i}`,
        ts: `2026-04-${10 + (i % 14)}T10:00:00Z`,
      }),
    );
  }
  const client = makeFakeClient({ member_scribes: scribes, scribe_entries: entries });
  const result = await memberConsultScribes({
    member_id: MEMBER_A,
    query: "team",
    top_k: 3,
    client,
  });
  assert.equal(result.ok, true);
  assert.ok(result.entries.length <= 3, `top_k=3 must cap; got ${result.entries.length}`);
});

test("#14b member_consult_scribes invalid member_id surfaces clear error", async () => {
  const client = makeFakeClient();
  const result = await memberConsultScribes({
    member_id: "not-a-uuid",
    query: "anything",
    client,
  });
  assert.equal(result.ok, false);
  assert.equal(result.error, "invalid_member_id");
});

// ─── member_fates_route tests ────────────────────────────────────────────

test("#15 member_fates_route persists a fates_log row with correct member_id", async () => {
  const { scribes } = buildFixture();
  const client = makeFakeClient({ member_scribes: scribes, fates_log: [] });
  const result = await memberFatesRoute({
    member_id: MEMBER_A,
    session_id: "K438b-test",
    content: "Today's project deadline shifted; I need to talk to the team and update the doctor about the appointment too.",
    client,
  });
  assert.equal(result.ok, true);
  assert.equal(client.__inserted.fates_log.length, 1);
  assert.equal(client.__inserted.fates_log[0].member_id, MEMBER_A);
  assert.ok(result.fates_log_id, "fates_log_id should be populated on persist=true");
  assert.ok(Array.isArray(result.themes));
});

test("#16 member_fates_route coverage-gap fires when fewer than 3 Scribes match", async () => {
  // Only 2 Scribes match the content
  const scribes = [
    fixtureScribe({
      scribe_id: "s1",
      member_id: MEMBER_A,
      name: "Work",
      primary_field: "professional",
      keywords: ["project"],
    }),
    fixtureScribe({
      scribe_id: "s2",
      member_id: MEMBER_A,
      name: "Health",
      primary_field: "health",
      keywords: ["doctor"],
    }),
    fixtureScribe({
      scribe_id: "s3",
      member_id: MEMBER_A,
      name: "Cooking",
      primary_field: "cooking",
      keywords: ["recipe"],
    }),
  ];
  const client = makeFakeClient({ member_scribes: scribes });
  // Content matches only "project" — single Scribe.
  const result = await memberFatesRoute({
    member_id: MEMBER_A,
    content: "Working on the project today, no other context applies here.",
    client,
  });
  assert.equal(result.ok, true);
  assert.equal(result.triple_witness_met, false, "single-Scribe match must NOT meet triple-witness");
  assert.ok(
    result.coverage_gaps.some((g) => g.includes("triple-witness")),
    "should flag triple-witness gap",
  );
});

test("#17 member_fates_route latency < 500ms on a typical 5-Scribe input", async () => {
  const scribes = [];
  for (let i = 0; i < 10; i++) {
    scribes.push(
      fixtureScribe({
        scribe_id: `s-${i}`,
        member_id: MEMBER_A,
        name: `Scribe${i}`,
        primary_field: `field ${i} for testing`,
        keywords: [`kw${i}`, `project`, `team${i % 3}`, `meeting`, `deadline`],
        adjacents: [
          { level: 2, field: `adjacent A ${i}` },
          { level: 3, field: `adjacent B ${i}` },
        ],
      }),
    );
  }
  const client = makeFakeClient({ member_scribes: scribes });
  const content =
    "Project update: team0 hit the deadline, kw3 is at risk, and adjacent A 5 needs attention. The meeting yesterday surfaced kw7 + kw9 as new blockers.";
  const t0 = Date.now();
  const result = await memberFatesRoute({
    member_id: MEMBER_A,
    content,
    client,
  });
  const elapsed = Date.now() - t0;
  assert.equal(result.ok, true);
  assert.ok(elapsed < 500, `latency must be < 500ms, got ${elapsed}ms`);
});

test("#17b member_fates_route dispatch_cap honored", async () => {
  const scribes = [];
  for (let i = 0; i < 10; i++) {
    scribes.push(
      fixtureScribe({
        scribe_id: `s-${i}`,
        member_id: MEMBER_A,
        name: `Scribe${i}`,
        primary_field: `field ${i}`,
        keywords: [`project`, `team`, `deadline`, `meeting`],
      }),
    );
  }
  const client = makeFakeClient({ member_scribes: scribes });
  const result = await memberFatesRoute({
    member_id: MEMBER_A,
    content: "Project deadline meeting with the team today.",
    dispatch_cap: 3,
    client,
  });
  assert.equal(result.ok, true);
  assert.ok(result.dispatches.length <= 3, `dispatch_cap=3 honored; got ${result.dispatches.length}`);
});

test("#17c member_fates_route invalid member_id rejected", async () => {
  const client = makeFakeClient();
  const result = await memberFatesRoute({
    member_id: "garbage",
    content: "Some content here for the test of invalid member id rejection.",
    client,
  });
  assert.equal(result.ok, false);
  assert.equal(result.error, "invalid_member_id");
});

test("#17d clothoExtractForMember pulls keywords + entity regexes", () => {
  const scribes = [
    fixtureScribe({
      scribe_id: "s",
      member_id: MEMBER_A,
      name: "Test",
      primary_field: "x",
      keywords: ["recipe", "kitchen"],
    }),
  ];
  const out = clothoExtractForMember(
    "Tried a new recipe with K438 in the kitchen, ref #2270 SP-22 Prov 14",
    scribes,
  );
  assert.ok(out.themes.includes("recipe"));
  assert.ok(out.themes.includes("kitchen"));
  assert.ok(out.entities.includes("K438"));
  assert.ok(out.entities.includes("#2270"));
  assert.ok(out.entities.includes("SP-22"));
  assert.ok(out.entities.some((e) => e.toLowerCase().startsWith("prov")));
});
