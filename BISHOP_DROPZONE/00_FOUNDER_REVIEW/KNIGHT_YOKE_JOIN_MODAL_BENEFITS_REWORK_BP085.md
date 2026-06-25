# KNIGHT YOKE — JOIN MODAL BENEFITS REWORK · BP085
**Dispatched by Bishop · SEG Sonnet 4.6 · 2026-06-17**

---

## PREAMBLE (BP084 HARD BINDING — VERBATIM)

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## SCOPE

Replace the 3-radio intent barrier ("Use it / Build with it / Contribute") on the `mnemosynec.ai/proofs/storm/` membership modal with a brief benefits bullet list. Keep every other line of current copy verbatim. Preserve the dead-click fix from the chained prior yoke. Investigate whether radio-value intent data has any downstream consumers — if so, relocate capture to post-checkout; if not, remove cleanly.

**Composes-on-top-of:** `KNIGHT_YOKE_JOIN_BUTTON_DEAD_FIX_BP085.md` — THAT YOKE MUST LAND GREEN BEFORE THIS ONE BEGINS. Knight chains dispatch in order: dead-fix first → benefits rework second.

---

## CURRENT MODAL STATE (do not alter these lines)

```
The receipts are public.
The full audit trail is for members.
$5/year. Funds the substrate.
Your membership is the cooperative.
```

**REMOVE (barrier — these 3 radios go away):**
```
◯ Use it — I want to use Mnemosyne for my own work
◯ Build with it — I'm a developer / engineer
◯ Contribute — I want to add knowledge to the substrate
```

**KEEP VERBATIM:**
```
[Join the Cooperative →]
Maybe later
```

---

## TARGET MODAL COPY (Founder-approved voice · empirical · no hype)

```
Join the Cooperative — $5/year

The receipts are public.
The full audit trail is for members.
$5/year. Funds the substrate.
Your membership is the cooperative.

• Full audit trail — member-only access to the deep /proofs/ archive
• Vote in the cooperative — governance, realm-name decisions, leader confirms
• Earn Marks — adversarial testing, knowledge contributions, eblet mints (Code Breakers Guild eligible)
• Co-authorship eligibility on the next patent bag (PROV_23 — real attribution, not gestural credit)
• Mesh Test access — live when we hit 1,000 members, shooting for this week

Cancel anytime.

[Join the Cooperative →]
Maybe later
```

**Notes on copy decisions:**
- 5 bullets selected (within 4-6 cap): audit trail + vote + Marks + PROV_23 + Mesh Test. Omitted "Volume Pricing" and "Funds the substrate" — the latter is already in the 4-line standing copy directly above.
- PROV_23 phrased as "co-authorship eligibility on the next patent bag" — NOT "your name will be on the patent." Truth-Always: PROV_23 has not filed yet. Eligibility is the present fact; authorship confirmation is future.
- "Cancel anytime." = plain period, single line, below bullets, above CTA. Reduces friction without lying.
- Headline "Join the Cooperative — $5/year" replaces nothing — it's a new modal-top h2 or strong that didn't exist before (Knight confirms in SEG-1 read of actual template).
- "Cooperative" framing throughout — NOT "subscription."
- "Funds the substrate" kept verbatim in the 4-line standing block.

---

## 5 SEGs

---

### SEG-1 · Locate the Modal Template

**Model:** Sonnet 4.6
**Mission:** Find the exact file(s) that render the storm/ membership modal.

**Steps:**
1. Check `themes/PaperMod/layouts/partials/` for any file named `proof-membership-modal`, `membership-modal`, `join-modal`, or similar.
2. Check `content/proofs/storm/` for any shortcode invocation (`{{< membership-modal >}}` or similar).
3. Check `layouts/shortcodes/` for membership or join shortcodes.
4. Check `static/js/` and `assets/js/` for any JS that programmatically injects modal HTML.
5. Read the found file(s) in full — capture the exact current 3-radio HTML block.
6. Return: absolute file path(s) + line numbers of the radio block + full current HTML of just the modal form section.

**Sharp return:** `SEG1_MODAL_TEMPLATE_FOUND` = GREEN (path + lines confirmed) | RED (not found — escalate to Knight manual search)

---

### SEG-2 · Audit Radio-Value Downstream Consumers

**Model:** Sonnet 4.6
**Mission:** Determine whether the 3 intent-radio values are consumed anywhere downstream. If yes, document consumers so Knight can decide: drop entirely OR move to post-checkout survey.

**Search targets:**

*Cephas Hugo JS (`static/js/`, `assets/js/`, `themes/PaperMod/assets/js/`):*
- Grep for: `use_it`, `build_with_it`, `contribute`, `intent`, `member_class`, `memberClass`, `intentClass`, `radio`, `selectedIntent`
- Also grep for the Stripe checkout initiation call — does it POST any intent field?

*Supabase Edge Functions (check local `platform/supabase/functions/` directory):*
- `create-mnemosynec-checkout/index.ts` — does it accept or pass an `intent` param to Stripe metadata?
- `stripe-webhook/index.ts` — does it read `intent` from Stripe session metadata and write it to a table?
- Any other edge function referencing intent/member_class.

*Supabase DB schema (use psql via canonical safe subshell pattern — STATUTES §4):*
```bash
(eval "$(grep -E '^SUPABASE_DB_URL=' 'C:\Users\Administrator\.claude\state\secrets\22May2026.env')"; \
 psql "$SUPABASE_DB_URL" -c "\d member_profiles")
```
- Does `member_profiles` have an `intent_class` or `member_class` or `role` column populated from the radio?

**Decision tree:**
- If NO consumers found anywhere → field is dead weight. Remove cleanly. No post-checkout survey needed.
- If consumers found → document each one. Knight decides (default: move capture to post-checkout optional survey per Founder direction, do NOT block join flow).

**Sharp return:** `SEG2_INTENT_AUDIT` = GREEN (no consumers — safe to remove) | YELLOW (consumers found, documented, Knight decides) | RED (psql unreachable — schema check blocked)

---

### SEG-3 · Apply the Rework

**Model:** Sonnet 4.6
**Mission:** Surgically replace the 3-radio block with the benefits bullet list. Touch nothing else.

**Inputs:** SEG-1 file path + line range of radio block.

**Exact replacement:**

Remove this block (or equivalent HTML):
```html
<div class="member-intent-radios">
  <label><input type="radio" name="intent" value="use_it"> Use it — I want to use Mnemosyne for my own work</label>
  <label><input type="radio" name="intent" value="build_with_it"> Build with it — I'm a developer / engineer</label>
  <label><input type="radio" name="intent" value="contribute"> Contribute — I want to add knowledge to the substrate</label>
</div>
```
(Knight adapts to the actual HTML found by SEG-1 — the above is illustrative.)

Insert in its place:
```html
<ul class="member-benefits">
  <li>Full audit trail — member-only access to the deep /proofs/ archive</li>
  <li>Vote in the cooperative — governance, realm-name decisions, leader confirms</li>
  <li>Earn Marks — adversarial testing, knowledge contributions, eblet mints (Code Breakers Guild eligible)</li>
  <li>Co-authorship eligibility on the next patent bag (PROV_23 — real attribution, not gestural credit)</li>
  <li>Mesh Test access — live when we hit 1,000 members, shooting for this week</li>
</ul>
<p class="member-cancel-note">Cancel anytime.</p>
```

**CSS to add** (in the modal's associated stylesheet or inline `<style>` block if no separate file):
```css
.member-benefits {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 1rem 0;
  text-align: left;
  font-size: 0.95rem;
  line-height: 1.6;
}
.member-benefits li {
  margin-bottom: 0.4rem;
}
.member-cancel-note {
  font-size: 0.85rem;
  color: var(--secondary, #888);
  margin: 0.5rem 0 1.25rem 0;
  text-align: center;
}
/* NEVER SCROLL SIDEWAYS — BP081 HARD BINDING */
.member-benefits {
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
```

**Also:** If SEG-2 found NO downstream consumers of the radio values, also remove:
- Any `<form>` wrapper that only existed to capture radio state
- Any JS `document.querySelector('[name="intent"]')` references in the modal's JS handler
- Any `intent` field being appended to the Stripe checkout fetch body

**If SEG-2 found consumers:** leave radio HTML in place temporarily. Flag for SEG-4 post-checkout survey path instead. Knight adds a code comment: `<!-- INTENT RADIO: consumers exist — migrating to post-checkout survey per BP085 -->` and hides it with `display:none` pending SEG-4.

**Sharp return:** `SEG3_REWORK_APPLIED` = GREEN (file edited, diff confirmed) | RED (edit failed or conflict with dead-click fix patch)

---

### SEG-4 · Post-Checkout Intent Survey (Conditional — Only If SEG-2 Found Consumers)

**Model:** Sonnet 4.6
**Mission:** If and only if SEG-2 surfaced downstream consumers of intent-class data, add a 1-question optional survey to the post-checkout welcome page.

**Trigger:** SEG2_INTENT_AUDIT = YELLOW (consumers exist)
**Skip:** If SEG2_INTENT_AUDIT = GREEN, mark this SEG as N/A and return GREEN immediately.

**Locate success_url landing page:**
- Check Stripe checkout creation in `create-mnemosynec-checkout/index.ts` for `success_url` value.
- Likely `/welcome`, `/joined`, `/membership/confirmed`, or similar Hugo page.
- If no dedicated page exists, Knight creates `content/welcome.md` with a minimal layout.

**Add to the welcome/success page:**
```html
<div class="intent-survey" id="intent-survey">
  <p><strong>Quick question</strong> (optional — helps us personalize your experience):</p>
  <p>What brings you to the cooperative?</p>
  <label><input type="radio" name="post_intent" value="use_it"> I want to use Mnemosyne for my own work</label><br>
  <label><input type="radio" name="post_intent" value="build_with_it"> I'm a developer / engineer</label><br>
  <label><input type="radio" name="post_intent" value="contribute"> I want to add knowledge to the substrate</label><br>
  <br>
  <button id="intent-submit">Save</button>
  <a href="#" id="intent-skip" style="margin-left:1rem;font-size:0.85rem;">Skip</a>
</div>
```

**JS behavior:**
- "Save" → POST to existing member-update Edge Function with `{ intent_class: value }` → hide survey div → show thank-you line.
- "Skip" → hide survey div immediately, no POST.
- Survey hidden by default if `intent_class` already set in member profile (idempotent).

**Sharp return:** `SEG4_POST_CHECKOUT_SURVEY` = GREEN (added or N/A) | RED (success_url page not found and couldn't create)

---

### SEG-5 · Deploy + Verify

**Model:** Sonnet 4.6
**Mission:** Build, deploy, and verify the live modal reflects the rework.

**Gate check:** This SEG MUST NOT run until:
- `KNIGHT_YOKE_JOIN_BUTTON_DEAD_FIX_BP085.md` is confirmed GREEN (dead-click fix deployed)
- SEG-3 above is GREEN

**Step 1 — Hugo build:**
```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform
hugo --minify --config config-mnemosynec.toml
```
Exit 0 required. Any Hugo error → STOP, fix, re-run. Do NOT deploy a broken build.

**Step 2 — Firebase deploy:**
```powershell
firebase deploy --only hosting:mnemosyne
```
Exit 0 required. Capture deploy URL from output.

**Step 3 — Live incognito verify (Chrome MCP or manual):**

Open `mnemosynec.ai/proofs/storm/` in fresh incognito. Trigger the membership modal. Confirm ALL of the following:

| Check | Pass condition |
|-------|---------------|
| Modal opens | Modal renders without JS error |
| 3 radios GONE | No `<input type="radio">` visible in modal |
| Benefits list renders | 5 bullets visible in correct order |
| "Cancel anytime." present | Appears below bullets, above CTA |
| CTA works | "Join the Cooperative →" click initiates Stripe checkout (gated on dead-click fix) |
| "Maybe later" works | Click closes modal / dismisses |
| Mobile responsive | At 390px width — no horizontal scroll (NEVER SCROLL SIDEWAYS canon) |
| No JS console errors | DevTools console clean on modal open |

**Sharp return:** `SEG5_DEPLOY_VERIFIED` = GREEN (all 8 checks pass) | YELLOW (deployed, partial — list which checks failed) | RED (build or deploy failed)

---

## 5 SHARPS RETURN TABLE

Knight pastes this table into yoke-return with each cell filled:

| Sharp | Description | Status | Notes |
|-------|-------------|--------|-------|
| `SEG1_MODAL_TEMPLATE_FOUND` | Modal template file located + radio block line range confirmed | ⬜ TBD | |
| `SEG2_INTENT_AUDIT` | Downstream consumers of radio intent values audited | ⬜ TBD | GREEN=remove clean · YELLOW=consumers found · RED=psql blocked |
| `SEG3_REWORK_APPLIED` | 3-radio block replaced with benefits list in source | ⬜ TBD | |
| `SEG4_POST_CHECKOUT_SURVEY` | Post-checkout survey added (or N/A if no consumers) | ⬜ TBD | N/A if SEG2=GREEN |
| `SEG5_DEPLOY_VERIFIED` | Hugo build + Firebase deploy + 8-point live verify | ⬜ TBD | |

**All 5 Sharps GREEN = yoke complete. Any RED = Knight stops and reports blocker to Bishop.**

---

## CONSTRAINTS CHECKLIST (Knight verifies each before closing yoke)

- [ ] Sonnet 4.6 used for ALL SEGs — never Composer, never Opus, never Haiku
- [ ] "$5/year" verbatim in modal copy
- [ ] "Cooperative" framing — NOT "subscription" anywhere in modal
- [ ] "Your membership is the cooperative" preserved verbatim (in the 4-line standing block)
- [ ] "Funds the substrate" preserved verbatim (in the 4-line standing block)
- [ ] PROV_23 benefit phrased as "co-authorship eligibility on the next patent bag" — NOT as a granted fact
- [ ] No tokens-as-securities language anywhere added
- [ ] NEVER SCROLL SIDEWAYS — mobile responsive verify at 390px (SEG-5 check 7)
- [ ] Truth-Always — no future promises stated as present facts
- [ ] Dead-click fix yoke confirmed GREEN before this yoke begins SEG-3+

---

## TRUTH-ALWAYS NOTE

If PROV_23 has filed by the time this yoke executes, Knight may upgrade the bullet to:
`• Your name on the I.P. you contribute (PROV_23 co-authorship — real attribution, not gestural credit)`

But only if Knight can confirm filing receipt in hand. Until then: "eligibility" is the correct word. Do not upgrade on assumption.

---

## ESTIMATED KNIGHT RUNTIME

~45–75 minutes total across 5 SEGs:
- SEG-1: 5 min (file locate + read)
- SEG-2: 15 min (grep sweep + psql schema check)
- SEG-3: 10 min (surgical edit)
- SEG-4: 10 min (conditional — likely N/A, 0 min if SEG-2 GREEN)
- SEG-5: 15–35 min (build + deploy + live verify + mobile check)

Estimate assumes no Hugo build errors and no Firebase auth issues. Add 20 min buffer if either surfaces.

---

## PASTE-READY KNIGHT WAKE

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

Read this yoke in full before dispatching any SEG:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_JOIN_MODAL_BENEFITS_REWORK_BP085.md

CHAIN DEPENDENCY: Confirm KNIGHT_YOKE_JOIN_BUTTON_DEAD_FIX_BP085.md is GREEN before executing SEG-3, SEG-4, or SEG-5.

MISSION: Replace the 3-radio intent barrier on mnemosynec.ai/proofs/storm/ membership modal with a 5-bullet benefits list. No marketing fluff — plain, empirical copy per Founder voice. Audit radio-value downstream consumers first (SEG-2) — if none, remove cleanly; if any, relocate to optional post-checkout survey (SEG-4).

Dispatch SEGs in order: SEG-1 → SEG-2 → SEG-3 (if prior two GREEN) → SEG-4 (conditional) → SEG-5 (only after dead-click fix confirmed GREEN).

Return yoke-complete report with all 5 Sharps filled. Report "Sonnet 4.6" verbatim in your return.
```

---

*Yoke composed by Bishop SEG · Sonnet 4.6 · BP085 · 2026-06-17*
*Composes with: [[canon_knight_yoke_preamble_sonnet_46_segs_orchestrator_no_composer_bp084]] · [[feedback_only_sonnet_4_6_for_segs_ever_bp081]] · [[canon_truth_integrity_chain_dependency_argument_eblet_chronos_bp084]] · [[feedback_never_scroll_sideways_ux_canon_bp081]]*
