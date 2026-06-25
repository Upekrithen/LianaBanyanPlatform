# BLACK MAMBA · YOKE 5 · BP087 WAVE 3
# MULTI-SEG GEMMA DISPATCH · COMPANIES JOINING IN · PREFERENCE INFERENCE UI
# "Consult Don't Rent" made clickable

---

## §0 BRICK WALL PRE-AUTHORIZED SCOPE

Brick Wall pre-authorized scope verbatim:
- (a) Multi-SEG parallel local Gemma dispatch: ipcMain.handle('gemma:multi-seg-dispatch') + MultiSegGemmaPanel.tsx in existing AI tab, spawns N (default 3) Ollama workers, aggregates by confidence variance, returns synthesized answer with variance score
- (b) Companies-Joining-In Cephas page: reads entity_membership WHERE node_type='food' AND status='live', Hugo partial or page template, deployed to both domains, + CompaniesJoiningInTab.tsx in LB Frame
- (c) Preference inference display panel: reads member_preference_inferred table, shows member their inferred preferences, provides toggle to delete or weight-down each preference

Knight ships .sql for any new RLS policies. Bishop applies via psql per §15.
NO new Supabase tables without Bishop migration per §15.

---

## §1 CONTEXT

This yoke closes 3 member-facing surfaces that together make the "Consult Don't Rent" doctrine tangible and clickable. Item (a) lets any member dispatch a question to N parallel local Gemma workers and see the aggregated answer with a variance score - this is the inequality trinity line 3 experience made real in the UI. Item (b) publishes the Companies Joining In transparency surface: every live food node visible to any visitor, no auth, no sponsored ranking. Item (c) gives members visibility into their inferred preferences with edit controls, closing the transparency requirement from canon_preferences_inferred_not_interrogated.

The 3 items are independent and can be delivered by 3 parallel SEG streams.

---

## §2 SEG FAN-OUT

use segs Sonnet 4.6 verbatim

**STREAM 1 · Multi-SEG Gemma Dispatch (SEG-E1 + SEG-E2)**

SEG-E1: IPC handler gemma:multi-seg-dispatch

Create: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\ipc\gemma_multi_seg_ipc.ts

This file registers:

Handler: `gemma:multi-seg-dispatch`

```typescript
ipcMain.handle('gemma:multi-seg-dispatch', async (event, options: {
  question: string;
  workerCount?: number; // default 3
  model?: string; // default 'gemma4:12b'
}) => {
  const { question, workerCount = 3, model = 'gemma4:12b' } = options;
  // Spawn workerCount parallel Ollama calls
  // Each call: POST to http://localhost:11434/api/generate with { model, prompt: question, stream: false }
  // Collect all responses: { response: string, confidence?: number }
  // Compute variance: if responses differ, variance = (# unique responses / workerCount)
  // Synthesize: if all agree, return that answer with variance = 0 (high confidence)
  //             if partial agreement, return majority answer with variance score
  //             if no agreement, return all answers with variance = 1 (escalate to flagship)
  // Return: { synthesized: string, variance: number, workerResponses: string[], model, workerCount }
})
```

Worker calls use Promise.allSettled for parallel execution. No sequential chaining.

Export `registerGemmaMultiSegIPC()` function. Add call to main process entry file following existing registerXxxIPC pattern.

Also add to preload.ts:
```typescript
gemma: {
  multiSegDispatch: (options: { question: string; workerCount?: number; model?: string }) =>
    ipcRenderer.invoke('gemma:multi-seg-dispatch', options)
}
```

Return: file path + main entry call location + preload.ts addition diff.

SEG-E2: MultiSegGemmaPanel.tsx UI component

Create: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\MultiSegGemmaPanel.tsx

Component requirements (~200 lines):
- State: question: string, status: 'idle'|'firing'|'complete'|'error', result: null | { synthesized, variance, workerResponses, model, workerCount }, workerCount: number (1-5 slider or input)
- UI sections:
  1. Header: "Multi-SEG Local Gemma" with subtitle: "Free WITH Substrate > Flagship WITHOUT Substrate"
  2. Worker count selector: number input, default 3, range 1-5, label "Parallel workers"
  3. Question input: textarea, placeholder "Ask anything..."
  4. "Dispatch" button: fires window.amplify.gemma.multiSegDispatch({ question, workerCount })
  5. Result block (shown when complete):
     - Synthesized answer in a readable block
     - Variance score: displayed as "Confidence: [HIGH|MEDIUM|LOW]" (variance 0-0.2=HIGH, 0.2-0.7=MEDIUM, 0.7-1=LOW)
     - "Worker responses" collapsible section showing all N raw responses
     - If variance = 1: show "High variance - consider escalating to flagship" note
  6. Loading state: show "Dispatching to [N] local Gemma workers..." while firing
- TypeScript typed, no implicit any
- Follow existing component className patterns

Add MultiSegGemmaPanel to the existing AI tab in LB Frame. Locate the AI tab component and add MultiSegGemmaPanel as a section or sub-tab.

Return: file path + line count + AI tab file modified.

---

**STREAM 2 · Companies Joining In (SEG-F1 + SEG-F2)**

SEG-F1: Cephas Hugo page

The Companies-Joining-In page reads entity_membership WHERE node_type='food' AND status='live' and renders a list of live food nodes.

Since the Cephas site is Hugo (static), the data fetch must happen at build time OR via client-side JS that calls the Supabase anon API.

Knight selects the client-side approach (consistent with other dynamic Cephas pages):

Create: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas-hugo\content\companies-joining-in.md

Front matter:
```yaml
---
title: "Companies Joining In"
layout: companies-joining-in
description: "Every live member business, listed transparently. No ads. No sponsored placement."
---
```

Create: C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas-hugo\layouts\_default\companies-joining-in.html

Template content:
- Page heading: "Companies Joining In"
- Sub-heading: "Help Each Other Help Ourselves"
- Description paragraph: "Every member business listed here earned their place by joining the cooperative. No paid placement. No sponsored ranking. Listed by join date."
- A div with id="companies-list" that is populated by inline JS
- Inline script: calls Supabase REST API `GET /rest/v1/entity_membership?node_type=eq.food&status=eq.live&select=entity_name,node_type,city,joined_at` with the anon key (use the existing pattern from other Cephas pages that make Supabase calls - find the anon key variable name used in those pages)
- Renders each result as a card: entity_name, city, "Member since [joined_at formatted as Month YYYY]"
- If 0 results: show "No member businesses listed yet. Be the first." with a Join link

Knight checks Cephas-hugo for existing Supabase call patterns before writing the script (look in static/js/ or existing layout files).

RLS requirement: entity_membership needs anon SELECT policy for node_type='food' AND status='live'. Knight writes a .sql and drops to BISHOP_DROPZONE:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\[TIMESTAMP]_entity_membership_anon_select_food_live_BISHOP_APPLY.sql

After Hugo build and Firebase deploy, curl both:
- https://mnemosynec.ai/companies-joining-in/
- https://mnemosynec.org/companies-joining-in/

Gate: both return HTTP 200.

Return: content file path + layout file path + .sql path + curl results.

SEG-F2: CompaniesJoiningInTab.tsx in LB Frame

Create: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\CompaniesJoiningInTab.tsx

Component requirements (~150 lines):
- On mount: calls Supabase from renderer using the existing Supabase client pattern in the codebase (locate it in src/renderer/lib/ or similar)
- Query: `supabase.from('entity_membership').select('entity_name,node_type,city,joined_at').eq('node_type','food').eq('status','live')`
- Renders a list of entity cards matching the Cephas page layout
- Empty state: "No member businesses yet. Be the first."
- Loading state: "Loading member businesses..."
- TypeScript typed

Register as a new tab in LB Frame. Locate the main tab view (not MnemosyneTabView - a higher-level tab container) and add "Companies" tab rendering CompaniesJoiningInTab.

Return: file path + line count + tab registration file modified.

---

**STREAM 3 · Preference Inference Display Panel (SEG-G1 + SEG-G2)**

SEG-G1: RLS policy for member_preference_inferred

Knight reads the member_preference_inferred table definition from supabase/migrations/.

Write .sql for Bishop:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\[TIMESTAMP]_member_preference_inferred_rls_BISHOP_APPLY.sql

Content:
```sql
-- member_preference_inferred RLS
-- Members SELECT and DELETE their own rows. No anon access. Service_role full.
ALTER TABLE member_preference_inferred ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_preference_inferred_authenticated_select_own"
  ON member_preference_inferred
  FOR SELECT
  TO authenticated
  USING (auth.uid() = member_id);

CREATE POLICY "member_preference_inferred_authenticated_delete_own"
  ON member_preference_inferred
  FOR DELETE
  TO authenticated
  USING (auth.uid() = member_id);

CREATE POLICY "member_preference_inferred_authenticated_update_own"
  ON member_preference_inferred
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);
```

If member_preference_inferred uses a column name other than member_id for the user identity (check CREATE TABLE), update the USING clause accordingly and note the actual column name in the return.

Return: .sql path + actual identity column name found.

SEG-G2: PreferenceInferencePanel.tsx

Create: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\PreferenceInferencePanel.tsx

Component requirements (~200 lines):
- Requires authenticated session (use existing auth state from renderer)
- On mount: query `supabase.from('member_preference_inferred').select('*').eq('member_id', session.user.id)`
- Renders list of inferred preferences. Each preference row shows:
  - preference_key (e.g., "cuisine:thai")
  - preference_value or score
  - weight or confidence (if column exists)
  - "Remove" button: calls `supabase.from('member_preference_inferred').delete().eq('id', row.id)`
  - "Weight down" button: calls UPDATE SET weight = weight * 0.5 (or equivalent weight column, adapt to actual schema)
- Header: "Your Inferred Preferences"
- Subheading: "The substrate learned these from your natural interactions. You own them. You can remove or adjust any of them."
- Empty state: "No inferred preferences yet. The substrate learns as you use it."
- After any delete or weight-down: re-fetch and re-render the list
- TypeScript typed. No implicit any.

Add PreferenceInferencePanel to the member account/profile tab in LB Frame. Locate the profile or account tab component and add PreferenceInferencePanel as a section below existing profile content.

Return: file path + line count + profile tab file modified.

---

## §3 FILE TARGETS

New files:
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\ipc\gemma_multi_seg_ipc.ts
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\MultiSegGemmaPanel.tsx
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\CompaniesJoiningInTab.tsx
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\PreferenceInferencePanel.tsx
- C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas-hugo\content\companies-joining-in.md
- C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas-hugo\layouts\_default\companies-joining-in.html

.sql files for Bishop (Knight writes, Bishop applies):
- [TIMESTAMP]_entity_membership_anon_select_food_live_BISHOP_APPLY.sql
- [TIMESTAMP]_member_preference_inferred_rls_BISHOP_APPLY.sql

Edited files:
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\preload.ts (add gemma bridge)
- Main process entry file (add registerGemmaMultiSegIPC call)
- AI tab component (add MultiSegGemmaPanel)
- Main tab container (add Companies tab)
- Profile/account tab (add PreferenceInferencePanel)

---

## §4 ACCEPTANCE GATES

Gate 1: gemma_multi_seg_ipc.ts exists + registerGemmaMultiSegIPC() in main entry + preload.ts has window.amplify.gemma (SEG-E1).
Gate 2: MultiSegGemmaPanel.tsx exists + added to AI tab + tsc exits 0 (SEG-E2).
Gate 3: companies-joining-in.md + companies-joining-in.html layout exist in Cephas-hugo (SEG-F1).
Gate 4: https://mnemosynec.ai/companies-joining-in/ returns HTTP 200 (SEG-F1).
Gate 5: https://mnemosynec.org/companies-joining-in/ returns HTTP 200 (SEG-F1).
Gate 6: CompaniesJoiningInTab.tsx exists + registered in LB Frame tab + tsc exits 0 (SEG-F2).
Gate 7: entity_membership RLS .sql in BISHOP_DROPZONE (SEG-F1).
Gate 8: member_preference_inferred RLS .sql in BISHOP_DROPZONE (SEG-G1).
Gate 9: PreferenceInferencePanel.tsx exists + added to profile tab + tsc exits 0 (SEG-G2).

All 9 gates before Yoke 5 declared GREEN.

---

## §5 DRIFT SURFACE PROTOCOL (BP053 INLINE)

If Ollama is not running on localhost:11434 when SEG-E1 is tested: note this in return but do not block the file creation gates. The handler will fail gracefully at runtime; that is expected behavior.

If entity_membership table does not exist in supabase/migrations/: HALT on SEG-F1 and SEG-F2. Return what was found. Do not create the table. Surface to Founder.

If member_preference_inferred table schema differs significantly from assumptions (e.g., no weight column): adapt the UPDATE statement to match actual schema, note the adaptation, and flag it for Founder review.

If the Cephas site uses a different Supabase call pattern than expected: find the existing pattern, follow it exactly, and note the file where the pattern was found.

Drift = surface to Founder immediately. No silent workarounds.

---

## §6 COMPOSITION

Related canon slugs:
- canon_consult_ai_flagships_dont_rent_the_c40_aircraft_bp085 (multi-SEG Gemma dispatch IS this doctrine clickable)
- canon_free_with_substrate_flagship_inequality_trinity_bp085 (variance=0 result is line 1 of the trinity)
- canon_companies_joining_in_public_page_cooperative_business_transparency_bp086 (item b is the implementation)
- canon_preferences_inferred_not_interrogated_no_questionnaire_substrate_bp086 (item c transparency requirement)
- canon_restaurants_first_substrate_market_application_menus_5_cost_plus_20_items_bp086 (entity_membership food node = restaurants)
- canon_cooperative_substrate_business_launch_built_in_customer_base_preferences_bp086 (Companies Joining In is the member-facing view of Business-Launch-Primitive)
- canon_substitution_rail_fiat_marks_credits_barter_payment_taxonomy_bp086 (preference inference feeds substitution rail personalization)

---

## §7 RETURN TEMPLATE (BP053 §4)

Knight returns one block per stream:

```
YOKE 5 RETURN · BP087 WAVE 3
STREAM 1 · GEMMA DISPATCH:
  SEG-E1: [GREEN|RED] · ipc file: [path] · main entry: [line] · preload: [lines added]
  SEG-E2: [GREEN|RED] · component: [path] · lines: ______ · AI tab modified: [path]
STREAM 2 · COMPANIES JOINING IN:
  SEG-F1: [GREEN|RED] · content: [path] · layout: [path] · RLS .sql: [path] · curl .ai: ______ · curl .org: ______
  SEG-F2: [GREEN|RED] · component: [path] · lines: ______ · tab registered in: [path]
STREAM 3 · PREFERENCE INFERENCE:
  SEG-G1: [GREEN|RED] · RLS .sql: [path] · identity column: ______
  SEG-G2: [GREEN|RED] · component: [path] · lines: ______ · profile tab modified: [path]
YOKE 5 STATUS: [GREEN|AMBER|RED]
AMBER/RED NOTES: ______
```

---

## §8 STATUTES BINDING HEADER

§2 IMMUTABLES: Do not alter relay topology, existing Supabase tables (add RLS policies only), or auth flows. Preference data is member-owned: no reads or writes on behalf of other members.

§3 SONNET 4.6 VERBATIM: use segs Sonnet 4.6 verbatim. All SEG workers run Sonnet 4.6. No model substitution.

§4 ABSOLUTE PATHS: All file operations use absolute paths as listed in §3. No relative paths.

§14 GADGET-FIRST: tsc --noEmit for all TypeScript files. curl for both domain gates. No human-eyeball assertions.

§15 BISHOP-DIRECT-SUPABASE: Knight ships .sql for all RLS policies. Bishop applies via psql. Knight does not run psql. Knight does not touch Supabase directly. This is non-negotiable.
