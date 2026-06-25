# YOKE RETURN — Eblet Recursive Scan · MnemosyneC Full Substrate Access
## BP084 · Knight Session · June 15, 2026

**Model used: Sonnet 4.6**

---

## Summary

All 6 SEGs of the BP084 Eblet Recursive Scan task have been implemented and committed.
MnemosyneC now walks all subdirectories of every configured eblet root rather than
reading only the flat root directory. The flat `readdirSync` at line 55 of
`mnem_eblet_store.ts` has been replaced with a recursive `walkEbletStore` function.
A persistent index, category weighting, and a UI counter panel complete the substrate
access upgrade.

**Commit SHA:** `84df4d4231da265fc661944326596ff4802473cb`

---

## SEG Status

| SEG | Description | Status | Notes |
|-----|-------------|--------|-------|
| SEG-1 | Recursive `walkEbletStore` function | ✅ LANDED | Lines 95–113 in `mnem_eblet_store.ts`; replaces flat `readdirSync` at old line 55 |
| SEG-2 | `category` field on `EbletEntry`; `EbletCategory` type | ✅ LANDED | `EbletCategory` exported at L48; `deriveCategory()` at L79; category on entry at L295 |
| SEG-3 | Persistent `eblet_index.jsonl` with delta re-scan | ✅ LANDED | `getIndexPath()` at L130; `loadOrRebuildIndex()` at L138–228; mtime-delta guard |
| SEG-4 | Category-weighted BM25 + `category:pixie-dust` prefix | ✅ LANDED | `CATEGORY_WEIGHT` at L58; `bm25Score` signature updated at L307; `PRIORITY_CATEGORIES` at L325 |
| SEG-5 | `verified` category via `getEbletIndexStats()` + IPC | ✅ LANDED | IPC handler `ai-dispatch:eblet-index-stats` added to `ai_dispatch_ipc.ts` L367–386 |
| SEG-6 | Substrate counter UI panel in SettingsTab | ✅ LANDED | `SubstrateCounterPanel` component at `SettingsTab.tsx` L2702; wired at L2138 |

---

## Truth-Always Sharps

| Sharp | Verification | Result |
|-------|-------------|--------|
| Sharp 1 | `npx tsc --noEmit --project tsconfig.main.json` | ✅ **PASS** — exit 0, zero errors. Renderer pre-existing errors in unmodified files (App.tsx, BenchmarkModal.tsx, etc.) — none introduced by this PR. |
| Sharp 2 | `walkEbletStore` present in `mnem_eblet_store.ts`, not flat `readdirSync` | ✅ **PASS** — function at **line 95**; called at L202; `readdirSync` at L100 is inside the walker (reading one dir at a time), not a flat root scan |
| Sharp 3 | `category` field present in `EbletEntry` type | ✅ **PASS** — `EbletCategory` type at **line 48**; field on `EbletEntry` at **line 295**; `deriveCategory()` at L79 |
| Sharp 4 | `eblet_index.jsonl` path logic coded | ✅ **PASS** — `getIndexPath()` returns `resolve(app.getPath('userData'), 'mnemosynec', 'substrate', 'eblet_index.jsonl')` at **line 130** |
| Sharp 5 | Substrate counter UI code exists | ✅ **PASS** — `SubstrateCounterPanel` function at **line 2702** of `SettingsTab.tsx`; rendered at L2138 |

---

## Exact Change Line Numbers

### `src/main/mnem_eblet_store.ts`

| Change | Lines |
|--------|-------|
| File header updated (SEG references) | L1–20 |
| `EBLET_STORE_ROOTS` array (3 roots) | L23–27 |
| `EbletCategory` type export | L48–56 |
| `CATEGORY_WEIGHT` record | L58–68 |
| `deriveCategory(fullPath)` function | L79–91 |
| **`walkEbletStore(root)` function** (replaces flat `readdirSync`) | L95–113 |
| `EbletIndexEntry` interface | L117–124 |
| `getIndexPath()` function | L127–131 |
| `loadOrRebuildIndex()` async function | L138–228 |
| `invalidateIndexCache()` export | L231–233 |
| `EbletIndexStats` interface + `getEbletIndexStats()` | L237–271 |
| `EbletEntry` interface (now includes `fullPath`, `category`) | L290–297 |
| `bm25Score()` updated with `category` weight param | L302–317 |
| `PRIORITY_CATEGORIES` constant | L325 |
| `queryEbletStore()` rewritten (SEG-4, lazy body load) | L328–391 |

### `src/main/ai_dispatch_ipc.ts`

| Change | Lines |
|--------|-------|
| Import `getEbletIndexStats` added | L12–17 |
| Import `resolve` added to path imports | L9 |
| IPC handler `ai-dispatch:eblet-index-stats` | L367–386 |

### `src/renderer/components/SettingsTab.tsx`

| Change | Lines |
|--------|-------|
| `<SubstrateCounterPanel />` render call | L2138 |
| `EbletIndexStatsPayload` interface | L2694–2699 |
| `SubstrateCounterPanel` function component | L2702–2800 |

---

## Total Estimated Indexed Count

Live count from this machine as of June 15, 2026:

| Root | Eblet files on disk |
|------|-------------------|
| `Asteroid-ProofVault` (all subdirs, recursive) | ~158 |
| `AntigravityWorkspace/source_snapshot_readonly/canon` | ~37 |
| `LianaBanyanPlatform/Asteroid-ProofVault/canon` | ~12 |
| **Total currently on disk** | **~207** |

Note: The design spec targets 431,865 when CANON and PIXIE_DUST directories are
fully populated. The recursive walker is architecture-ready for that scale.
Cold-index target < 60s; subsequent startups < 3s (design targets documented in code).

---

## BM25 Category Priority Order

```
verified (6×) > canon (5×) > active (4×) > snapshot-canon (3×) > trail (2×) > session (1.5×) > pixie-dust (1×)
```

"Just want the answers" default: surfaces `verified`, `canon`, `active`, `snapshot-canon` only.
Historical-mine (pixie-dust): query with `category:pixie-dust <your question>` prefix.

---

## Architecture Notes

- **No full-body reads on index build**: only `snippet[0:200]` + `title` stored per entry
- **Lazy body fetch**: full 500-char snippet read only for top-3 BM25 winners
- **Atomic index writes**: temp file + rename; no partial index corruption
- **Delta detection**: index rebuilds only when any root directory mtime > index mtime
- **In-memory cache TTL**: 60s (balances freshness vs. I/O overhead)

---

*Knight session BP084 · FOR THE KEEP.*
