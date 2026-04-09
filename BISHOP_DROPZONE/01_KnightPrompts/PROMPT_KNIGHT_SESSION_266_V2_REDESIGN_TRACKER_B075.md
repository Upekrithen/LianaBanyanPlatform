# KNIGHT SESSION 266 — Platform V2 Redesign Tracker Dashboard
## Bishop B075 | April 4, 2026

---

## MISSION

Build a staff dashboard that tracks which of the 36 Pawn-specified page redesigns have been implemented, which are in progress, and which are pending. This is the project management view for the platform-v2 redesign effort.

---

## CONTEXT

Pawn delivered 36 page design specs across three batches:
- **Batch 35 (Phase 3A)**: Family Table Hub, Crew Call Board, ADAPT Score Profile, Tribe Directory, Vehicle/Local Wheels, Design Democracy
- **Batch 36 (Phase 3B)**: HexIsle Landing, Storefront Builder, Red Carpet Landing, LB Card, Guided Tour, Pioneer Showcase
- **Batch 37 (Phase 3C)**: Backer Election, Content Shield, Subscription Channels, Coalition, Treasure Map Builder, Bounty Photography

Earlier batches (B30-B34) covered additional pages. The full spec set represents the complete v2 visual and functional redesign.

Additionally, 352 document families need compilation before redesign starts (to ensure nothing is lost). The compilation pipeline (K259, K261) is tracking this separately.

---

## DELIVERABLE: `/staff/v2-tracker` — V2RedesignTracker.tsx

### Layout

**Summary Bar**
- Total pages: 36 (or however many from all Pawn batches)
- Completed: X | In Progress: Y | Pending: Z | Blocked: W
- Compilation status: X/352 families compiled (link to `/admin/compilation`)

**Main Table**

| Page | Pawn Batch | Status | Current Route | Spec File | Assignee | Notes |
|------|-----------|--------|---------------|-----------|----------|-------|
| Family Table Hub | B35/3A | Pending | /family | PAWN_BATCH_35...md | - | Needs family table compilation first |
| Crew Call Board | B35/3A | Pending | /crew-call | PAWN_BATCH_35...md | - | |
| ... | | | | | | |

**Status Options:**
- `pending` — Spec exists, not started
- `in_progress` — Knight actively implementing
- `review` — Built, awaiting Founder review
- `completed` — Founder approved
- `blocked` — Waiting on dependency (compilation, data, etc.)

**Filters:**
- By status
- By Pawn batch
- By assignee (Knight session number)

**Detail Panel (click a row):**
- Shows the Pawn spec file path
- Lists dependencies (which compiled families are needed)
- Shows current page screenshots if available
- Knight session history (which K sessions touched this page)
- "Start Redesign" button that generates a Knight prompt template

---

## IMPLEMENTATION

### 1. Migration: v2_redesign_tracker table

```sql
CREATE TABLE IF NOT EXISTS v2_redesign_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name TEXT NOT NULL,
  page_route TEXT,
  pawn_batch TEXT, -- e.g., 'B35_3A', 'B36_3B', 'B37_3C'
  spec_file TEXT, -- path to Pawn spec in BISHOP_DROPZONE
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'blocked')),
  assignee TEXT, -- Knight session number, e.g., 'K270'
  dependencies TEXT[], -- compiled families needed
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Seed data

Insert all 36 pages from Pawn Batches 35-37 (and any from earlier batches):

```sql
INSERT INTO v2_redesign_tracker (page_name, page_route, pawn_batch, spec_file) VALUES
  ('Family Table Hub', '/family', 'B35_3A', 'PAWN_BATCH_35_V2_PAGE_DESIGN_SPECS_PHASE_3A.md'),
  ('Crew Call Board', '/crew-call', 'B35_3A', 'PAWN_BATCH_35_V2_PAGE_DESIGN_SPECS_PHASE_3A.md'),
  ('ADAPT Score Profile', '/adapt', 'B35_3A', 'PAWN_BATCH_35_V2_PAGE_DESIGN_SPECS_PHASE_3A.md'),
  ('Tribe Directory', '/tribes', 'B35_3A', 'PAWN_BATCH_35_V2_PAGE_DESIGN_SPECS_PHASE_3A.md'),
  ('Vehicle / Local Wheels', '/local-wheels', 'B35_3A', 'PAWN_BATCH_35_V2_PAGE_DESIGN_SPECS_PHASE_3A.md'),
  ('Design Democracy', '/design-democracy', 'B35_3A', 'PAWN_BATCH_35_V2_PAGE_DESIGN_SPECS_PHASE_3A.md'),
  ('HexIsle Landing', '/hexisle', 'B36_3B', 'PAWN_BATCH_36_V2_PAGE_DESIGN_SPECS_PHASE_3B.md'),
  ('Storefront Builder', '/storefront', 'B36_3B', 'PAWN_BATCH_36_V2_PAGE_DESIGN_SPECS_PHASE_3B.md'),
  ('Red Carpet Landing', '/red-carpet', 'B36_3B', 'PAWN_BATCH_36_V2_PAGE_DESIGN_SPECS_PHASE_3B.md'),
  ('LB Card', '/lb-card', 'B36_3B', 'PAWN_BATCH_36_V2_PAGE_DESIGN_SPECS_PHASE_3B.md'),
  ('Guided Tour', '/tour', 'B36_3B', 'PAWN_BATCH_36_V2_PAGE_DESIGN_SPECS_PHASE_3B.md'),
  ('Pioneer Showcase', '/pioneer', 'B36_3B', 'PAWN_BATCH_36_V2_PAGE_DESIGN_SPECS_PHASE_3B.md'),
  ('Backer Election', '/backer-election', 'B37_3C', 'PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C.md'),
  ('Content Shield', '/content-shield', 'B37_3C', 'PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C.md'),
  ('Subscription Channels', '/subscriptions', 'B37_3C', 'PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C.md'),
  ('Coalition', '/coalition', 'B37_3C', 'PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C.md'),
  ('Treasure Map Builder', '/treasure-map', 'B37_3C', 'PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C.md'),
  ('Bounty Photography', '/bounty-photo', 'B37_3C', 'PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C.md');
```

### 3. Create the page + route

Wire `/staff/v2-tracker` in App.tsx and sidebar.

### 4. Dashboard features

- Summary bar with status counts
- Filterable table with all pages
- Click-to-expand detail panel
- Status change dropdown (staff only)
- Link to compilation dashboard for dependency tracking

---

## ACCEPTANCE CRITERIA

- [ ] `v2_redesign_tracker` table created and seeded with 18+ pages
- [ ] `/staff/v2-tracker` page loads with summary + table
- [ ] Filters work by status and batch
- [ ] Detail panel shows spec file path and dependencies
- [ ] Status changes persist to DB
- [ ] `npm run build` passes

## DO NOT

- Start any actual page redesigns (this is tracking only)
- Modify existing page components
- Include pages from before Pawn Batch 35 without verifying they exist
