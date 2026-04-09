# Knight Session K363 — Neighborhood Content Shield Enforcement UI
# Bishop B086 | Priority: CRITICAL | Depends on: K353 Phases 4-6 DEPLOYED

## CONTEXT
B086 created `NEIGHBORHOOD_CONTENT_SHIELD_B086.sql` — a 5-layer defense system that prevents neighborhoods from being used to circumvent platform rules (advertising, tracking, external scripts, competing platform links, financial fraud, impersonation). The migration adds:

1. `neighborhood_prohibited_patterns` table — regex rules by category
2. `validate_neighborhood_content()` function — checks all editable fields
3. Content shield triggers on `neighborhoods` and `trunk_mirror_submissions`
4. Immutable platform rules trigger (Cost+20%, creator keeps 83.3%, no hiding rules)
5. `neighborhood_content_shield_log` audit table

This session wires the UI enforcement and the Harper Guild reviewer dashboard.

## WHAT TO BUILD

### 1. Apply the Migration
Run `BISHOP_DROPZONE/13_Ops_Deploy/NEIGHBORHOOD_CONTENT_SHIELD_B086.sql` as a new migration:
- Copy to `platform/supabase/migrations/YYYYMMDDHHMMSS_b086_neighborhood_content_shield.sql`
- Verify it applies cleanly

### 2. Client-Side Content Validation (Preview)
Before submitting to Supabase, give the user real-time feedback. Create `useContentShield` hook:

```tsx
// platform/src/hooks/useContentShield.ts
export function useContentShield() {
  const validate = async (fields: {
    description?: string;
    welcome_message?: string;
    custom_css?: string;
    theme_config?: Record<string, unknown>;
    hero_image_url?: string;
  }) => {
    const { data } = await supabase.rpc('validate_neighborhood_content', {
      p_description: fields.description || null,
      p_welcome_message: fields.welcome_message || null,
      p_custom_css: fields.custom_css || null,
      p_theme_config: fields.theme_config || null,
      p_hero_image_url: fields.hero_image_url || null,
    });
    return data || [];
  };
  return { validate };
}
```

### 3. ContentShieldBanner Component
Shows violations in the editor before save:

```tsx
// Inline warning banner when editing neighborhood fields
// Red border for 'block' violations, yellow for 'flag'
// Lists each violation with category icon and description
// "This content cannot be saved" for blocks
// "This content will be flagged for Harper review" for flags
```

Wire this into:
- **NeighborhoodBuilderPage** — validate on each field blur + before submit
- **TrunkMirrorPage** — validate CSS draft + description before submit
- **NeighborhoodDetailPage** — validate inline edits (if any)

### 4. Harper Guild Reviewer Dashboard
Create `HarperReviewDashboardPage` (`/v2/governance/harper-review`):

**Queue View:**
- Trunk Mirror submissions with status = 'submitted' or 'under_review'
- Neighborhoods with `star_chamber_compliant = false`
- Content shield log entries (recent blocks + flags)

**Review Panel:**
- Side-by-side: current live neighborhood vs proposed changes
- Content Shield scan results (auto-run validation, show any violations)
- **Compliance Checklist** (reviewer must check all before approving):
  - [ ] No advertising or affiliate links
  - [ ] No external tracking/analytics
  - [ ] No platform bypass (embedding external checkout to skip LB economic rails — linking to your own Etsy/Shopify via Plugs is FINE)
  - [ ] Cost+20% floor preserved
  - [ ] Creator keeps 83.3% not hidden
  - [ ] No misleading financial claims
  - [ ] CSS is sandboxed (no external resources)
  - [ ] No impersonation of LB official status
- Approve / Reject buttons with required notes
- On approve: update trunk_mirror_submissions status, deploy changes to neighborhood
- On reject: update status, notify submitter with rejection reason

**RLS Update needed:**
```sql
-- Allow Harper reviewers to update trunk_mirror_submissions
CREATE POLICY tms_reviewer_update ON trunk_mirror_submissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND harper_guild_member = true)
  );
```

### 5. Immutable Platform Rules Display
On every neighborhood page, show a non-removable footer/badge:
- "Liana Banyan Platform Rules Apply"
- Cost+20% breakdown visible on every product
- Creator keeps 83.3% badge
- "No advertising" icon
- This element CANNOT be hidden by custom CSS:
  ```css
  .lb-platform-rules-badge {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: relative !important;
    pointer-events: auto !important;
  }
  ```

### 6. CSS Sandbox
Scope all custom_css to the neighborhood container only:
- Wrap custom CSS in `.neighborhood-custom-scope { ... }` at render time
- Block selectors that escape the scope: `body`, `html`, `#root`, `[class*="lb-"]`, `.lb-platform-rules-badge`
- Block `position: fixed` and `position: absolute` on body-level elements
- Block `z-index` values above 1000 (reserved for platform UI)

### 7. Content Shield Admin Page
Create `ContentShieldAdminPage` (`/v2/ops/content-shield`):
- View/edit prohibited patterns
- View audit log (blocks + flags over time)
- Add new patterns when new abuse vectors discovered
- Pattern testing tool: paste content, see which patterns match

## FILES TO CREATE
- `platform/supabase/migrations/YYYYMMDDHHMMSS_b086_neighborhood_content_shield.sql`
- `platform/src/hooks/useContentShield.ts`
- `platform/src/components/neighborhoods/ContentShieldBanner.tsx`
- `platform/src/components/neighborhoods/PlatformRulesBadge.tsx`
- `platform/src/pages/v2/governance/HarperReviewDashboardPage.tsx`
- `platform/src/pages/v2/ops/ContentShieldAdminPage.tsx`

## FILES TO MODIFY
- `platform/src/pages/v2/neighborhoods/NeighborhoodBuilderPage.tsx` — add shield validation
- `platform/src/pages/v2/neighborhoods/TrunkMirrorPage.tsx` — add shield validation
- `platform/src/pages/v2/neighborhoods/NeighborhoodDetailPage.tsx` — add PlatformRulesBadge + CSS sandbox
- Routes — add Harper review + content shield admin routes
- Sidebar — add "Harper Review" under Governance section

## CONSTRAINTS
- Platform rules badge MUST be un-hideable by custom CSS
- Content validation runs server-side (trigger) AND client-side (preview)
- Reviewers MUST complete the full checklist before approving
- Block severity = hard reject (Supabase throws error)
- Flag severity = allowed but marked non-compliant + Harper score penalty
- All blocked attempts logged to audit table (content hash only, not raw content)
- Prohibited patterns table is APPEND-MOSTLY — patterns should rarely be deleted

## DONE WHEN
- [ ] Migration applied cleanly
- [ ] Entering ad copy in a neighborhood description → blocked with clear error
- [ ] Entering `<script>` in custom CSS → blocked
- [ ] Affiliate links in any field → blocked
- [ ] Platform rules badge visible on all neighborhood pages, un-hideable
- [ ] Custom CSS scoped and can't escape container
- [ ] Harper reviewer can approve/reject trunk mirror submissions
- [ ] Content Shield admin can add new patterns
- [ ] Audit log captures all blocks and flags
