# KNIGHT SESSION 122: WildFire Verification Tour + Platform Polish

## Brief
Call `brief_me("wildfire verification, portal tour, broken pages, empty states, cross-portal consistency")`

## Context
K116-K117 deployed. K118-K121 queued. Before launching outreach (maker templates, Reddit posts, Crown Letters), we need to verify that every page on every portal WORKS. The WildFire Verification Tour is a systematic walk-through of all 7 portals checking for broken pages, missing data, empty states, and inconsistencies.

This is a POLISH session. No new features. Just making everything bulletproof.

Canonical stats: 2,000 innovations | 1,511 claims | 10 provisionals | 22 production systems

## Deliverable 1: Portal Verification Checklist

### For EACH of the 7 portals, verify:

**Navigation:**
- [ ] CrossPortalNav renders correctly
- [ ] All nav links resolve (no 404s)
- [ ] UnifiedNavigation sidebar works
- [ ] "Start a Project" link works
- [ ] Mobile responsive — nav collapses correctly

**Authentication:**
- [ ] Login page loads
- [ ] Signup page loads
- [ ] Protected routes redirect to login
- [ ] Explorer routes allow anonymous browsing
- [ ] Auth state persists across portal navigation

**Core Pages:**
- [ ] Homepage loads with content (not empty state)
- [ ] Marketplace/product directory loads
- [ ] Projects directory loads (Turn-Key projects)
- [ ] Cue Cards campaigns library loads
- [ ] Red Carpet showcased projects display correctly

**Empty States:**
- [ ] Every page that can be empty has a helpful empty state message
- [ ] Empty states include a CTA (e.g., "Be the first to list a product")
- [ ] No raw "undefined" or "null" text visible anywhere

**Canonical Stats:**
- [ ] Footer or about section shows 2,000 innovations
- [ ] Stats are current (not stale/cached)

**Images:**
- [ ] No broken image links
- [ ] Placeholder images display correctly where no real images exist

### Portal-Specific Checks

**lianabanyan.com (Marketplace)**
- [ ] Product catalog with seed products
- [ ] Turn-Key project directory
- [ ] Cue Card campaigns (7 seed cards)
- [ ] Red Carpet showcased projects
- [ ] Membership page

**lianabanyan.org (Charitable)**
- [ ] Mission ONE page
- [ ] Gleaner's Corner
- [ ] Charitable subscriptions
- [ ] Earmark Credits flow

**lianabanyan.net (Network)**
- [ ] Production schedules
- [ ] B2B contracts
- [ ] Supply chain view
- [ ] Factory Node page

**hexisle.com (HexIsle)**
- [ ] SlottedTop showcase
- [ ] Terrain product catalog
- [ ] HexIsle-specific content

**hexislo.com (Hexislo)**
- [ ] Spanish language elements (where implemented)
- [ ] Same product catalog as HexIsle

**dss.lianabanyan.com (DSS)**
- [ ] STL Vault
- [ ] Test Pilot program
- [ ] Digital design catalog

**upekrithen.com (Upekrithen)**
- [ ] World-building content
- [ ] Game design catalog

## Deliverable 2: Fix All Issues Found

For each issue found during verification:
1. Log the issue (portal, page, description)
2. Fix it immediately if possible
3. If not fixable in this session, document in a TODO comment in the code

### Common Issues to Watch For:
- Import errors from missing components
- TypeScript type mismatches from new tables not in Supabase types
- RLS policies blocking reads that should be public
- Lazy-loaded pages that fail to render
- CSS/layout issues on mobile viewports
- Stale data in cached queries

## Deliverable 3: Empty State Enhancement

Every page that can display an empty state should show:

```
┌─────────────────────────────────────────┐
│  [Relevant Icon]                         │
│                                          │
│  No [items] yet                          │
│                                          │
│  [Helpful explanation of what goes here] │
│                                          │
│  [Primary CTA Button]                    │
└─────────────────────────────────────────┘
```

Pages to check:
- /projects (no Turn-Key projects yet)
- /projects/:slug (project not found)
- /cue-cards/campaigns (no campaigns — should show 7 seed cards)
- /contests (no contests yet)
- /marketplace (no products — should show seed products)
- /dashboard (new user, nothing to show)
- /treasure-map/:slug (map not found)

## Deliverable 4: Performance Quick Wins

While touring, look for:
- Unnecessary re-renders (wrap expensive components in React.memo)
- Missing query staleTime (add 5-min stale time to read-heavy queries)
- Large bundle chunks that should be split
- Images without lazy loading
- Queries that fetch too much data (add pagination/limits)

## Deliverable 5: Console Error Cleanup

Open browser console on every page. Fix any:
- React key warnings
- Missing dependency warnings in useEffect
- Failed network requests
- TypeScript runtime errors
- Deprecated API warnings

## Build + Deploy
Build and deploy all 8 hosting targets when all fixes are applied.

## Quality Checks
- [ ] Every page on every portal loads without error
- [ ] No console errors on any page
- [ ] All empty states display helpful messages with CTAs
- [ ] CrossPortalNav works from every portal
- [ ] Canonical stats show 2,000 everywhere
- [ ] Mobile responsive on all key pages
- [ ] All 8 Firebase targets deployed

## FOR THE KEEP.
