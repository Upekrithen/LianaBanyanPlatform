# Knight Session K416 — Full Route Audit (Pre-Opening Gambit)

**Author:** Bishop B101
**Date:** April 12, 2026
**Priority:** CRITICAL — blocks Opening Gambit
**Context:** Founder is about to release the Opening Gambit. Every page a visitor might click MUST resolve. ZERO 404s allowed. This session extracts every route from every app file, verifies each component exists and resolves, and produces a master route table.

---

## Phase 1 — Extract ALL Routes

Scan every router file in the codebase. The platform has multiple app shells:

1. `src/App.tsx` (main lianabanyan.com)
2. `src/MuseumApp.tsx` (museum.lianabanyan.com)
3. `src/BusinessApp.tsx` (lianabanyan.biz)
4. `src/DSSApp.tsx` (dss.lianabanyan.com)
5. `src/HexIsleApp.tsx` (hexisle.com)
6. `src/NetworkApp.tsx` (lianabanyan.net)
7. `src/NonprofitApp.tsx` (lianabanyan.org)
8. `src/UpekrithenApp.tsx` (upekrithen.com)

Also check:
- All files in `src/routes/` for additional route definitions
- Any `createBrowserRouter`, `<Route>`, `<Routes>`, or route config arrays
- Nested routes and child routes — capture the full resolved path

For EVERY route found, record:
- **Full path** (e.g., `/patent-portfolio`, `/helm/:id/bridge/:bridgeId`)
- **Component name** (e.g., `PatentPortfolioPage`)
- **Import path** (e.g., `./pages/PatentPortfolioPage`)
- **App shell** it belongs to (Main, Museum, Business, DSS, HexIsle, Network, Nonprofit, Upekrithen)

---

## Phase 2 — Verify Each Route

For every route extracted in Phase 1, check:

### 2A. Component File Exists
- Resolve the lazy import path to an actual file on disk
- If the file is missing, mark as **MISSING**
- If the import uses an index barrel (`/pages/index.ts`), follow the re-export

### 2B. Component Imports Resolve
- Open the component file
- Check that all named imports resolve to real files
- Focus on: hooks, utils, components, and types
- If any import would cause a build error, mark as **BROKEN** and note which import fails

### 2C. Supabase Table References
- Search each component for `.from('table_name')` calls
- For each table referenced, verify it exists in the Supabase schema
- Use `npx supabase db dump` or check `supabase/migrations/` to confirm table names
- If a component queries a non-existent table, mark as **BROKEN (TABLE)**

---

## Phase 3 — Master Route Table

Produce a markdown table saved to:
`BISHOP_DROPZONE/01_KnightPrompts/K416_ROUTE_AUDIT_RESULTS.md`

Format:

```
| # | Route Path | Component | App | Status | Notes |
|---|-----------|-----------|-----|--------|-------|
| 1 | / | LandingPage | Main | OK | |
| 2 | /helm | HelmPage | Main | OK | |
| 3 | /broken-thing | MissingPage | Main | MISSING | File not found |
```

Status values:
- **OK** — component exists, imports resolve, tables exist
- **MISSING** — component file not found on disk
- **BROKEN** — component exists but has unresolvable imports
- **BROKEN (TABLE)** — component queries a table that does not exist
- **ORPHAN** — component file exists but no route points to it (bonus, if time permits)

---

## Phase 4 — Navigation Link Audit

Check that every clickable link in the navigation UI points to a valid route:

### 4A. AppSidebar.tsx
- Extract every `to=` or `href=` value
- Confirm each one appears in the Phase 1 route list
- Flag any link that would 404

### 4B. CrossPortalNav
- Search for `CrossPortalNav` component and all files that render cross-portal links
- These link between app shells (e.g., main site linking to museum.lianabanyan.com)
- Verify the target route exists in the target app shell

### 4C. Footer
- Check all footer components across all app shells
- Extract every link
- Verify internal links resolve; flag any broken external links if obvious

### 4D. Any Other Nav
- Check for `MobileNav`, `TopNav`, `HeaderNav`, or similar components
- Check the landing page hero CTAs and any "Explore" or "Learn More" buttons
- Check the `/like-what` page cards — each card links somewhere

Output a second table:

```
| Nav Source | Link Text | Target | Valid? | Notes |
|-----------|-----------|--------|--------|-------|
| AppSidebar | Patent Portfolio | /patent-portfolio | YES | |
| Footer | Museum | https://museum.lianabanyan.com | YES | |
| CrossPortal | Business | /biz-page | NO | Route missing in BusinessApp |
```

---

## Phase 5 — 404 Risk Summary

At the top of the results file, write a **404 RISK SUMMARY**:

1. Total routes found across all apps
2. Count of OK / MISSING / BROKEN
3. Count of nav links that point to invalid routes
4. Ordered list of the most critical broken routes (pages a new visitor would likely hit)
5. Recommended fixes — one line per broken route

---

## Constraints

- Do NOT fix anything in this session. This is AUDIT ONLY. Fixes come in K417.
- Do NOT skip any app shell. All 8 must be scanned.
- Do NOT assume a route is OK just because the file exists — check imports too.
- Save results to `BISHOP_DROPZONE/01_KnightPrompts/K416_ROUTE_AUDIT_RESULTS.md`
- If the codebase uses `vite-plugin-pages` or file-based routing, scan `src/pages/` directory structure as well.

---

## MoneyPenny Checklist
- [ ] Run `brief_me("full route audit across all app shells")` at session start
- [ ] Use `get_page_info('list')` to cross-reference librarian's page index
- [ ] Use `get_schema('list')` to get the table list for Phase 2C verification
- [ ] Run `moneypenny_debrief` at session end with files_changed and summary
