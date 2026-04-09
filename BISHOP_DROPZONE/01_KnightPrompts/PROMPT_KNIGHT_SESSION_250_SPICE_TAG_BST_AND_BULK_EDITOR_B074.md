# KNIGHT SESSION 250 — Spice-Tag BST Episodes + Bulk Spice Editor UI
## Dispatched by: Bishop B074
## Date: April 4, 2026
## Priority: HIGH — 194 BST episodes untagged; need spice taxonomy for Grid Scheduler to work

---

## MISSION

1. Auto-tag all 194 BST episodes with primary + secondary spice tags using the keyword-ranking system from `auto-tag-spices`
2. Build a bulk Spice Editor page in the platform so staff can review/override auto-tags
3. Wire the editor to the existing `tag-spice` edge function for saves

---

## CONTEXT

### What Exists
- `auto-tag-spices` edge function (K246 DEPLOYED): accepts `{ chapter_id }`, ranks keywords per spice domain, assigns primary + secondary
- `tag-spice` edge function (K246 DEPLOYED): accepts `{ episode_id, primary_spice, secondary_spices }` for manual override
- `spice_rack` lookup table with 10 spices: salt (operations), garlic (business), sugar (marketing), cinnamon (community), pepper (legal), ginger (innovation), cumin (engineering), paprika (leadership), basil (education), oregano (governance)
- 550 Spoonfuls already spice-tagged from Bishop production (Batches 01-11)
- 194 BST episodes staged (after K249) with `primary_spice = NULL`

### The Spice Rack (Innovation #2142)
Ten spices = ten business skill domains. Every piece of content gets a primary spice (main skill) and 0-3 secondary spices. This enables:
- Skill-based content filtering on the Viewing Schedule
- "Bring your Garlic to our Pot" matching in Recipe Pot
- Spice-distribution analytics in the Self-Referencing Loop

---

## IMPLEMENTATION

### Part A: Auto-Tag BST Episodes

After K249 stages all BST episodes, call `auto-tag-spices` for each BST chapter:

```bash
# For each BST chapter (1-4):
curl -X POST "$SUPABASE_URL/functions/v1/auto-tag-spices" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"chapter_id": "<chapter-1-uuid>"}'
```

The auto-tagger uses keyword frequency analysis per spice domain. Expected dominant spices per chapter:

| Chapter | Source Paper | Expected Primary | Expected Secondaries |
|---------|-------------|------------------|----------------------|
| 1 StarScreaming | Building in Public | Paprika (leadership) | Ginger (innovation), Cinnamon (community) |
| 2 Blizzard | 100 innovations | Ginger (innovation) | Cumin (engineering), Garlic (business) |
| 3 Genesis | Genesis compilation | Paprika (leadership) | Basil (education), Oregano (governance) |
| 4 AI Cake | How AI Works | Basil (education) | Cumin (engineering), Ginger (innovation) |

### Part B: Bulk Spice Editor Page

File: `platform/src/pages/staff/SpiceEditorPage.tsx`
Route: `/staff/spice-editor`

#### Layout

```
+----------------------------------------------------------+
| SPICE EDITOR                           [Chapter ▼] [Save All] |
+----------------------------------------------------------+
| Filter: [All Spices ▼] [Channel ▼] [Tagged/Untagged ▼]  |
+----------------------------------------------------------+
| # | Content (truncated)        | Primary   | Secondary      |
|---|---------------------------|-----------|----------------|
| 1 | "The cooperative has..."  | [Garlic ▼]| [☑Pepper ☑Sugar] |
| 2 | "Four agents, one..."     | [Cumin  ▼]| [☑Ginger]        |
| 3 | "Sell for $5, keep..."    | [Garlic ▼]| [☑Paprika]       |
| ...                                                       |
+----------------------------------------------------------+
| Showing 52 of 194 | Page [1] [2] [3] [4]                 |
+----------------------------------------------------------+
```

#### Components

**SpiceEditorPage.tsx** — Main page:
- Fetches episodes from `crewman_episodes` filtered by chapter_id / channel
- Paginated (50 per page) with filter sidebar
- "Save All" button batches all changes into individual `tag-spice` calls
- Color-coded spice badges (reuse `SpiceBadge.tsx`)

**SpiceDropdown.tsx** — Reusable select for primary spice:
- 10 options with emoji + color
- Salt 🧂, Garlic 🧄, Sugar 🍬, Cinnamon 🫕, Pepper 🌶️, Ginger 🫚, Cumin 🫘, Paprika 🌿, Basil 🌱, Oregano 🍃

**SpiceCheckboxGroup.tsx** — Multi-select for secondary spices:
- Checkboxes for all 10 spices (excluding the selected primary)
- Max 3 secondary selections

**SpiceDistributionBar.tsx** — Visual summary at top of page:
- Horizontal stacked bar showing spice distribution across all visible episodes
- Helps staff see if coverage is balanced

#### Data Flow

1. Page loads → fetch episodes with current spice tags
2. Staff adjusts tags via dropdowns/checkboxes
3. Changes tracked in local state (dirty flag per episode)
4. "Save All" → POST each dirty episode to `tag-spice` endpoint
5. Success toast with count

#### Queries

```typescript
// Fetch episodes for editing
const { data: episodes } = await supabase
  .from('crewman_episodes')
  .select('id, sequence_number, content, primary_spice, secondary_spices, channel, tags')
  .eq('chapter_id', selectedChapterId)
  .order('sequence_number')
  .range(page * 50, (page + 1) * 50 - 1);

// Fetch chapter list for dropdown
const { data: chapters } = await supabase
  .from('crewman_chapters')
  .select('id, chapter_number, title, episode_count')
  .order('chapter_number');
```

### Part C: Add Route + Navigation

- Add route `/staff/spice-editor` to router
- Add "Spice Editor" link to staff/admin sidebar (alongside existing Content Command Center, Librarian Dashboard)
- Gate behind staff role check (same pattern as other `/staff/` routes)

---

## DELIVERABLES

1. All 194 BST episodes auto-tagged with primary + secondary spices
2. `SpiceEditorPage.tsx` — bulk editor with pagination, filters, batch save
3. `SpiceDropdown.tsx` + `SpiceCheckboxGroup.tsx` + `SpiceDistributionBar.tsx` components
4. Route wired + sidebar navigation added
5. Verification: `SELECT primary_spice, COUNT(*) FROM crewman_episodes WHERE channel = 'bst' GROUP BY primary_spice` shows all 194 tagged

---

## IMPORTANT NOTES

- Do NOT auto-tag Spoonfuls — they're already tagged from Bishop production
- The auto-tagger is a starting point — the bulk editor exists so staff can review and correct
- SpiceBadge.tsx already exists — reuse it, don't duplicate
- Keep the editor simple — no drag-and-drop, no inline editing of content, just spice tag management
- The 10 spices are FIXED (Innovation #2142). Do not add new ones.
