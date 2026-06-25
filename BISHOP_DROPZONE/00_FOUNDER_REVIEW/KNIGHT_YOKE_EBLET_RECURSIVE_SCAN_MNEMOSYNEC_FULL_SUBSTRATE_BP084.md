# KNIGHT YOKE · Eblet Recursive Scan · MnemosyneC Full Substrate Access · BP084

**Session:** BP084
**Date:** 2026-06-15
**Founder ratify:** DIRECT — *"I want Mnemosynec to have access to them all for HER substrate. It should all be connected, the substrate on the machine that has Mnemosynec should have full access to that substrate - while still following all the categorization rules and we just want the answers protocols."*

---

## 🩸 HARD BINDING — Sonnet 4.6 SEGs only

**USE Sonnet 4.6 SEGs FOR ALL WORK. DO NOT USE COMPOSER 2.5 OR ANY OTHER MODEL.**

Every SEG `model: 'sonnet'`. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## The bug

MnemosyneC currently sees **145 eblets out of 431,865 on disk**. That's 0.03% of her own substrate.

Root cause (Sonnet 4.6 SEG audit): `LianaBanyanPlatform\src\main\mnem_eblet_store.ts:55` does a **flat** `readdirSync(EBLET_STORE_PATH).filter(f => f.endsWith('.eblet.md'))` — reads only the root of `Asteroid-ProofVault\` and misses:

| Store | Count |
|---|---|
| `Asteroid-ProofVault\state\eblets\CANON\` | 287,995 |
| `Asteroid-ProofVault\state\eblets\PIXIE_DUST_BP051_FULL\` | 142,800 |
| `Asteroid-ProofVault\state\eblets\` (BP buckets + misc) | ~881 |

This is the "AI has Amnesia about herself" empirical Founder caught in BP083 — only partially addressed by MEMORY.md auto-load. The canonical knowledge store remains 99.97% invisible.

---

## SEG-1 — Recursive walker (Sonnet 4.6 SEG)

**File:** `LianaBanyanPlatform\src\main\mnem_eblet_store.ts`

Replace flat `readdirSync` with recursive walk:

```ts
async function walkEbletStore(root: string): Promise<string[]> {
  const out: string[] = []
  const stack = [root]
  while (stack.length) {
    const dir = stack.pop()!
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        stack.push(full)
      } else if (entry.name.endsWith('.eblet.md')) {
        out.push(full)
      }
    }
  }
  return out
}
```

Apply to ALL configured roots:
- `C:\Users\Administrator\Documents\Asteroid-ProofVault\` (primary)
- `C:\Users\Administrator\Documents\AntigravityWorkspace\source_snapshot_readonly\canon\` (37 read-only snapshot eblets)
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\canon\` (7 eblets)

---

## SEG-2 — Folder-name → category metadata (Sonnet 4.6 SEG)

Preserve "categorization rules" Founder named. Each eblet path's parent folder becomes a `category` tag in the EbletEntry struct:

| Folder | Category tag |
|---|---|
| `Asteroid-ProofVault\` (root flat) | `active` |
| `state\eblets\CANON\` | `canon` |
| `state\eblets\PIXIE_DUST_BP051_FULL\` | `pixie-dust` (or `historical-mine`) |
| `state\eblets\TRAILS\` | `trail` |
| `state\eblets\BP0NN\` | `session-{NN}` |
| `AntigravityWorkspace\…\canon\` | `snapshot-canon` |

BM25 scoring in `loadEblets()` weights by category — `canon` > `active` > `trail` > `historical-mine`. So "just want the answers" protocol surfaces ratified canons first, drops historical-mine to the back unless explicitly queried.

---

## SEG-3 — Indexing performance (Sonnet 4.6 SEG)

431k+ eblets is too many to load into memory naively on every Ask. Build a persistent index:

- On first launch (or eblet-store delta detected), walk all roots → write `%APPDATA%/mnemosynec/substrate/eblet_index.jsonl` (one line per eblet: `{path, category, title, snippet[0:500], mtime}`)
- On subsequent launches, read index file, only re-scan paths newer than index mtime
- BM25 query runs against the in-memory index (small enough to hold — ~431k × ~600 bytes ≈ 260MB; acceptable, but consider snippet-truncation to 200 bytes → 86MB)
- Full eblet body fetched lazily only for the top-3 BM25 winners

**Sharp:** cold startup with full re-index < 60s on M0. Subsequent startups < 3s.

---

## SEG-4 — "Just want the answers" protocol path (Sonnet 4.6 SEG)

Per Founder canon — when MnemosyneC answers, she should surface the canonical/answer-class eblet, not bury it under historical-mine clutter.

Wire `ai_dispatch_ipc.ts:231-237` (the existing eblet snippet composer) to:
1. Query top-K by BM25 score with category weighting
2. Filter to category ∈ {`canon`, `active`, `snapshot-canon`} for the snippet that goes into the LLM prompt
3. Show category badge in any UI receipt panel ("from canon: ..." vs "from historical-mine: ...")

Historical-mine eblets remain queryable via explicit `category:pixie-dust` query syntax — for power users only.

---

## SEG-5 — verified_eblets.jsonl integration (Sonnet 4.6 SEG)

The 17,274 entries in `%APPDATA%/mnemosynec/substrate/verified_eblets.jsonl` (runtime Plow-verified) should also surface through the same query interface, with category `verified`.

Category weighting: `verified` > `canon` > `active` > everything else. Verified-runtime > codified-canon > current-session > historical.

---

## SEG-6 — Substrate counter UI surface (Sonnet 4.6 SEG)

Settings → Substrate panel: show live counter — *"431,865 canon eblets + 17,274 verified-runtime eblets indexed. Last refresh: <timestamp>."*

This is the visible empirical answer to "AI has Amnesia about herself" — Founder + members can see at a glance she has full substrate access.

---

## Truth-Always Sharps

- Sharp 1: cold startup full re-index < 60s on M0
- Sharp 2: subsequent startup < 3s
- Sharp 3: query "What is 68/70?" surfaces the canonical receipt eblet within top-3 (canon-class)
- Sharp 4: total indexed count printed at startup ≥ 431,000
- Sharp 5: Settings → Substrate UI shows live count matching disk inventory

---

## Yoke-return spec

SEG statuses + commits + 5 Sharps with literal counter values + verbatim "Sonnet 4.6".

**FOR THE KEEP.**
