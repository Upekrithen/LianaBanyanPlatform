# KNIGHT SESSION 274 — V2 Tracker Dependency Graph + Blocker Dashboard
## Bishop B075 | April 4, 2026

---

## MISSION

Close the loop between the compilation grind and the v2 redesign by adding:
1. A dependency graph view in `v2_redesign_tracker` showing compilation-family → tracker-page relationships
2. A "Blockers" dashboard showing pages stuck waiting for compilations
3. Auto-updating `blocked` status when a dependency is unmet

---

## CONTEXT

- `v2_redesign_tracker` has 36 pages (from K266) with a `dependencies TEXT[]` column
- `compilation_status` table (from K261) tracks which document families are compiled
- Right now: these two are disconnected. A page can be marked `pending` but its dependencies may not be ready.

Goal: When a tracker page has dependencies on compilation families that aren't `compiled`, auto-mark it `blocked`.

---

## STEP 1: Populate Dependencies

For each of the 36 tracker pages, determine which compilation families it depends on. Suggested mapping (Bishop recommendations, Knight verifies):

```sql
UPDATE v2_redesign_tracker SET dependencies = ARRAY['family_table_compilation', 'guild_tribe_rules'] WHERE page_name = 'Family Table Hub';
UPDATE v2_redesign_tracker SET dependencies = ARRAY['lb_card_program_brief', 'patent_bag_8'] WHERE page_name = 'LB Card';
UPDATE v2_redesign_tracker SET dependencies = ARRAY['patent_bag_9'] WHERE page_name = 'Storefront Builder';
UPDATE v2_redesign_tracker SET dependencies = ARRAY['patent_bag_5', 'patent_bag_6'] WHERE page_name = 'HexIsle Landing';
-- etc
```

(Knight should review each tracker page's spec_file to determine correct dependencies.)

## STEP 2: Create Dependency Status View

```sql
CREATE OR REPLACE VIEW v2_tracker_with_dependency_status AS
SELECT
  t.*,
  COALESCE(
    ARRAY_AGG(
      CASE WHEN cs.status != 'compiled' THEN cs.family_name END
    ) FILTER (WHERE cs.family_name IS NOT NULL),
    ARRAY[]::TEXT[]
  ) AS unmet_dependencies,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM unnest(t.dependencies) dep
      WHERE NOT EXISTS (
        SELECT 1 FROM compilation_status cs2
        WHERE cs2.family_name = dep AND cs2.status = 'compiled'
      )
    ) THEN true
    ELSE false
  END AS has_unmet_dependencies
FROM v2_redesign_tracker t
LEFT JOIN compilation_status cs ON cs.family_name = ANY(t.dependencies)
GROUP BY t.id;
```

## STEP 3: Auto-Update Blocked Status (Trigger)

```sql
CREATE OR REPLACE FUNCTION update_blocked_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE v2_redesign_tracker t
  SET status = CASE
    WHEN t.status IN ('completed', 'review') THEN t.status  -- don't regress completed/review
    WHEN EXISTS (
      SELECT 1 FROM unnest(t.dependencies) dep
      WHERE NOT EXISTS (
        SELECT 1 FROM compilation_status cs
        WHERE cs.family_name = dep AND cs.status = 'compiled'
      )
    ) THEN 'blocked'
    WHEN t.status = 'blocked' THEN 'pending'  -- auto-unblock when deps compile
    ELSE t.status
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on compilation_status changes
CREATE TRIGGER sync_v2_tracker_blocked
  AFTER INSERT OR UPDATE OF status ON compilation_status
  FOR EACH ROW
  EXECUTE FUNCTION update_blocked_status();
```

## STEP 4: Blockers Dashboard in V2RedesignTracker.tsx

Add a new section at the top:

```tsx
<Card>
  <CardHeader>
    <CardTitle>🚧 Blocked Pages ({blockedPages.length})</CardTitle>
    <CardDescription>Pages waiting for compilation dependencies</CardDescription>
  </CardHeader>
  <CardContent>
    {blockedPages.map(page => (
      <div key={page.id}>
        <strong>{page.page_name}</strong>
        <div>Waiting on: {page.unmet_dependencies.join(', ')}</div>
        <Button asChild>
          <Link to="/admin/compilation">Go compile →</Link>
        </Button>
      </div>
    ))}
  </CardContent>
</Card>
```

## STEP 5: Dependency Graph Visualization

Add a visual dependency graph showing:
- Tracker pages as nodes (left column)
- Compilation families as nodes (right column)
- Arrows connecting dependencies
- Color-code arrows: green (compiled), yellow (in_progress), red (pending/needs_review)

Use a simple SVG or D3 force-directed graph. Keep it lightweight.

## STEP 6: Update StaffPageHeader Actions

Add a "View Dependencies" action button on V2RedesignTracker page that opens the graph modal.

---

## ACCEPTANCE CRITERIA

- [ ] Dependencies populated for all 36 tracker pages
- [ ] `v2_tracker_with_dependency_status` view created
- [ ] Auto-update trigger working (test by toggling compilation_status)
- [ ] Blockers dashboard visible on V2RedesignTracker page
- [ ] Dependency graph renders (SVG or similar lightweight viz)
- [ ] `npm run build` passes

## DO NOT

- Hard-code dependencies (they should be editable via tracker UI)
- Regress `completed` or `review` pages to `blocked` (respect terminal states)
- Make the graph so complex it becomes unreadable
