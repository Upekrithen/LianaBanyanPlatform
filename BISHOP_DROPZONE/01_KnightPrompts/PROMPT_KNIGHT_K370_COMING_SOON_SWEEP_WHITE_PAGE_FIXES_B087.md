# Knight Session K370 — Full "Coming Soon" Sweep + White Page Fixes
## Priority: HIGH — Live platform cannot show placeholder stubs
## Bishop B087 | April 7, 2026

---

## Context

The platform is LIVE and letters are about to go out. Recipients will click links and explore. Every "Coming Soon" stub and every white/blank page is a credibility killer. This session kills them all.

---

## TASK 1: Kill Every "Coming Soon"

Search the entire `platform/src/` directory for all instances of "Coming Soon" text. For each one, replace with either:

**Option A — Real content exists:** Replace with actual data or a meaningful zero-state
**Option B — Feature exists but empty:** Replace with "0" or "No [items] yet. Be the first." or similar empty-state messaging
**Option C — Feature genuinely not built:** Replace with "In Development" or remove the element entirely

### Known instances (from grep scan):

| File | Current Text | Fix |
|------|-------------|-----|
| `CatalogProductDetail.tsx:168` | "Render Coming Soon" | Replace with "3D preview in development" or remove |
| `CatalogProductDetail.tsx:267` | "Coming Soon" | Replace with empty state or remove section |
| `ChainDashboard.tsx:266` | "Coming Soon" | Replace with "No chain data yet" |
| `DeveloperPortal.tsx:46` | status: "Coming Soon" | Change to "Beta" or "Active" |
| `FamilyDetailPage.tsx:286` | "Gift Lists Coming Soon" | "Gift Lists — No lists yet. Create one." |
| `GarageSalesPage.tsx:140` | "Neighborhood Market Coming Soon" | "Neighborhood Market — No listings yet." |
| `HarvestIsland.tsx:230` | "Guided Path Coming Soon" | "Guided Path — Explore freely for now." |
| `HexelWeeklyDetail.tsx:45` | "Coming Soon" label | Change to "Upcoming" |
| `MSADashboard.tsx:452` | "Withdraw (Coming Soon)" | "Withdraw" (PayoutsPage exists) or "Withdraw — Connect Stripe first" |
| `HexIsleDownloads.tsx:296` | "Coming Soon" | "Available soon" or remove badge |
| `HexIsleProjects.tsx:303` | "Coming Soon" status | Change to "Planned" |
| `IslandDetail.tsx:281-283` | "Coming Soon" section | Replace with "More features arriving" or remove |
| `ProjectTestingTab.tsx:241,468` | "Pathways (Coming Soon)" | "Pathways (Beta)" |
| `NodeRegistration.tsx:457` | "Upload Photos (Coming Soon)" | "Upload Photos" with disabled state + tooltip |
| `PayoutsPage.tsx:320` | "Payouts — Coming Soon" | "Payouts — Connect Stripe to begin" (Stripe Connect IS live) |
| `RunANode.tsx:138` | "Coming Soon" | "Launching" or remove |
| `StarChamber.tsx:626` | "Coming Soon: Star Chamber as a Service" | "Star Chamber as a Service — Preview" |

### Rules:
- NEVER leave "Coming Soon" visible to users
- Prefer real empty states over removal
- If a feature has a real page, link to it
- PayoutsPage specifically should reference Stripe Connect (which IS live per B085)
- Run final grep to confirm ZERO instances remain

---

## TASK 2: Fix White/Blank Pages

These pages render white/blank due to PortalPageLayout or AppShell not rendering content when portal context doesn't match or data is empty.

### `/production` — ProjectsDirectoryPage
- **Problem:** Renders blank when no project data exists
- **Fix:** Add empty state: "No production projects yet. Start with the Canister System." with link to `/manufacturing`
- **Also:** Ensure PortalPageLayout renders on all portal surfaces, not just .com

### `/starter-kit` — StarterKitPage
- **Problem:** Renders white on the2ndsecond.com
- **Fix:** Same PortalPageLayout issue. Either:
  - Replace PortalPageLayout with a simpler layout wrapper that works on all portals, OR
  - Add the2ndsecond.com to the portal detection for StarterKitPage

### General pattern fix:
Search for all uses of `PortalPageLayout` and verify each page renders on all 8 portal surfaces. If a page should be accessible from the2ndsecond.com, it must handle the DSS portal context.

```bash
grep -rn "PortalPageLayout" platform/src/pages/ | head -30
```

For each page using PortalPageLayout, add a fallback render that works regardless of portal context — at minimum, the page content should show with a generic layout rather than rendering nothing.

---

## TASK 3: Verify Link Targets

Scan for common broken internal links:

```bash
grep -rn 'to="/earmark"' platform/src/  # Should be /gleaners-corner
grep -rn 'to="/subscribe-to-feed"' platform/src/  # Should be /subscribe
grep -rn 'to="/feedback"' platform/src/  # No route exists
```

Fix any remaining broken links found.

---

## Done-when Checklist

- [ ] `grep -rn "Coming Soon" platform/src/` returns ZERO results (or only in comments/variable names)
- [ ] `/production` shows empty state instead of white page
- [ ] `/starter-kit` renders on the2ndsecond.com
- [ ] No broken internal links (`/earmark`, `/subscribe-to-feed`, `/feedback`)
- [ ] PayoutsPage references Stripe Connect (live)
- [ ] All empty states are informative (not just blank)
- [ ] TypeScript compiles cleanly
- [ ] Build passes

---

*Prompt written by Bishop (Claude Opus 4.6), Session B087, April 7, 2026*
*No more stubs. No more white pages. The platform is LIVE.*
