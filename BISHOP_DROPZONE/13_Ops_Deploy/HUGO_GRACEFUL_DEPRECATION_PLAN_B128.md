# Hugo Graceful Deprecation Plan — B128

**Filed**: K522.6 / B128, 2026-04-27  
**Status**: ACTIVE — Hugo is currently "Sync-Mirrored Relic" (maintained from Supabase until launch)  
**Canonical source**: Supabase (`cephas_content_registry`, `anecdotes`)  
**Relic surface**: `Cephas/cephas-hugo/` → deployed to `cephas.lianabanyan.com`

---

## Current State (B128, pre-launch)

| Surface | Status | Serves |
|---|---|---|
| React SPA (`platform/`) | **Primary** | lianabanyan.com, lianabanyan.biz, the2ndsecond.com, etc. |
| Hugo (`Cephas/cephas-hugo/`) | **Sync-Mirrored Relic** | cephas.lianabanyan.com (Cephas subdomain) |
| Supabase `cephas_content_registry` | **Canonical source** | Both via API (SPA) and via sync (Hugo) |

Hugo was deprecated to Relic-class in B091 when the React SPA became the primary surface. K522.6 re-establishes Hugo as "Sync-Mirrored Relic" — maintained from Supabase until launch, then gracefully wound down.

---

## Phase Timeline

### Phase 0: Now → Launch (Sync-Mirrored Relic)

**Duration**: Until Battery Dispatch fires (post-Prov 14 receipt)  
**Hugo status**: Active, synced from Supabase on-demand  
**Sync**: `node Cephas/scripts/sync_supabase_to_hugo.mjs` on content change  
**Deploy**: `cd Cephas/cephas-hugo; hugo --minify; firebase deploy`

**Why Hugo matters during this phase**:
- Op-eds and Crown Letters submitted to publications link to `cephas.lianabanyan.com/` URLs
- Pre-launch audience (grantees, columnists, press) may hit Cephas URLs from linked content
- Hugo provides a clean, standalone reading experience for long-form content

**Pre-launch gate**: Before Battery Dispatch firing, run sync + deploy once to ensure current canon is live at `cephas.lianabanyan.com`.

---

### Phase 1: Launch → 4-8 Weeks Post-Launch (Mirror Running)

**Trigger**: Battery Dispatch fires (first wave of outreach)  
**Hugo status**: Active; sync runs weekly (not on-demand)  
**Action required**: Schedule a weekly sync + deploy (can be manual or a GitHub Action)

**Why still needed**:
- Links in dispatched emails, op-eds, social media posts point to Cephas URLs
- Some press outlets may index Hugo pages before React SPA equivalents are indexed
- The React SPA routes for `/pudding/`, `/crowns/`, `/academic/` must be live and functional before Phase 2

**Exit criteria for Phase 2**:
- [ ] React SPA has live routes covering all content classes (pudding, crowns, articles, academic_papers, letters, founder)
- [ ] All dispatched-email Hugo URLs have React SPA equivalents
- [ ] Google/Bing have indexed the React SPA pages (check Search Console)

---

### Phase 2: 4-8 Weeks Post-Launch (301 Redirect Phase)

**Trigger**: React SPA routes confirmed live + indexed  
**Hugo status**: Serving 301 redirects only; content served from React SPA  
**Sync**: STOPPED (Hugo is no longer a content surface)

**Actions**:

1. Add Firebase hosting rewrites in `Cephas/cephas-hugo/` to 301 → React SPA:

```json
{
  "hosting": {
    "rewrites": [
      { "source": "/articles/**", "destination": "https://lianabanyan.com/cephas/articles" },
      { "source": "/pudding/**", "destination": "https://lianabanyan.com/pudding" },
      { "source": "/crowns/**", "destination": "https://lianabanyan.com/crowns" },
      { "source": "/founder/**", "destination": "https://lianabanyan.com/founder" },
      { "source": "/academic/**", "destination": "https://lianabanyan.com/academic" },
      { "source": "/**", "destination": "https://lianabanyan.com" }
    ]
  }
}
```

2. Deploy the redirect-only Hugo config (no content rebuild needed)
3. Verify that all URL-redirect-map entries resolve correctly (see section below)
4. Archive `Cephas/cephas-hugo/content/` → `archive/cephas-hugo-content-B128/`

**Exit criteria for Phase 3**:
- [ ] All Hugo URLs in URL-redirect-map return 301 → correct React SPA destination
- [ ] Zero traffic errors in Firebase hosting logs for Hugo target
- [ ] Content sync script decommissioned (remove cron if any)

---

### Phase 3: 12+ Weeks Post-Launch (Full Retirement)

**Trigger**: Phase 2 confirmed stable for 4+ weeks  
**Hugo status**: RETIRED  
**Actions**:
1. Delete the Firebase hosting target for `cephas.lianabanyan.com` OR point DNS to React SPA
2. Move `Cephas/cephas-hugo/` → `archive/cephas-hugo-B128/`
3. Remove `firebase deploy` step from any automation that references Cephas
4. Update `AGENTS.md` and `liana-banyan-context.mdc` to remove Hugo-specific deploy instructions
5. Add a permanent DNS-level redirect: `cephas.lianabanyan.com` → `lianabanyan.com/cephas`

**Note**: The `cephas.lianabanyan.com` subdomain may be retained as a React SPA route alias for brand continuity.

---

## URL Redirect Map

These Hugo URLs have been publicly linked (in Crown Letters, op-eds, or social posts) and MUST be preserved through Phase 2:

| Hugo URL (cephas.lianabanyan.com) | React SPA Destination | Status |
|---|---|---|
| `/founder/anecdotes` | `/founder/anecdotes` (React route) | React route needed |
| `/founder/creed` | `/founder` | React route needed |
| `/pudding/*` | `/pudding/{slug}` | React route needed |
| `/academic/*` | `/academic/{slug}` | React route needed |
| `/crowns/*` | `/crowns/{slug}` | React route needed |
| `/articles/*` | `/articles/{slug}` | React route needed |
| `/letters/professional/*` | `/letters/{slug}` | React route needed |
| `/architecture/*` | `/architecture/{slug}` | React route needed |

**Priority links** (highest risk of being publicly linked before Phase 2):
- Crown Letters (sent to 26 crown recipients): `/crowns/{slug}`
- Outreach Letters (52 recipients): `/letters/professional/{slug}`
- The To Blave Technique: `/founder/anecdotes#to-blave-technique`
- Academic papers referenced in patent applications

---

## Key Contacts / Responsibilities

| Role | Responsibility |
|---|---|
| **Knight** | Running sync script, Hugo builds, Firebase deploys |
| **Bishop** | Identifying content changes that need a sync run |
| **Founder** | Triggering pre-launch gate; approving Phase 2 / Phase 3 cutover |

---

## Files and Scripts

| File | Purpose |
|---|---|
| `Cephas/scripts/sync_supabase_to_hugo.mjs` | Supabase → Hugo one-way sync |
| `Cephas/scripts/SYNC_RUNBOOK.md` | Step-by-step sync instructions |
| `Cephas/sync_log.jsonl` | Sync run log (timestamped, per-class counts) |
| `Cephas/cephas-hugo/` | Hugo static site (Relic surface) |
| `platform/src/` | React SPA (Primary surface) |

---

*Filed K522.6 / B128, 2026-04-27. Hugo is Sync-Mirrored Relic until launch. By their fruits.*
