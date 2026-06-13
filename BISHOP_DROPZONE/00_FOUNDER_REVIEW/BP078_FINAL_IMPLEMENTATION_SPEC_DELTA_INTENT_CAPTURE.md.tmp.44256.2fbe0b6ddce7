# BP078 Final Implementation Spec — DELTA: Intent capture timing ratification

**Authored:** Bishop, BP078, 2026-06-08
**Source:** Pawn independent cohesion verdict (Perplexity) + Founder ratify
**Affects:** SEG-Z FINAL IMPLEMENTATION SPEC, Section 3 (Knight-wave items 2, 4, and 5)

## Ratified binding

The three-option intent capture ("I need help / I want to help / I want to make money") fires **INSIDE the $5 join flow, never before it.** The success-to-pay arc is the right friction window for one more question. Pre-gating the welcome page or first-run with intent re-creates demographic intake, which Founder killed.

## How this changes Knight's cohesion batch

**Scope 2 (`membership.verifyStatus()` IPC)** — no change. Already shipped (commit b85b657).

**Scope 4 (CheckoutSuccessStep.tsx + buildAuthRelayUrl handoff)** — Knight builds this with the intent capture as a required step BETWEEN Stripe checkout success and the auth-relay redirect to /welcome. Component shape:
- Headline: "You're in. One more thing before we hand you the keys."
- Three large clickable cards (NOT radio buttons): "I need help", "I want to help", "I want to make money"
- Tooltip / 1-sentence subtitle under each card explaining the routing target without being prescriptive
- "Continue" button disabled until one card is selected
- On Continue: write the intent tag to member_profiles (or equivalent Supabase table), then call buildAuthRelayUrl with the intent tag included in the relay payload
- Web platform /welcome route reads the intent tag from the relay token and routes to the appropriate initiative cluster as the default landing

**Scope 5 (UniformInitiativeShell chrome unification)** — when intent tag is present on the member profile, the InitiativeProjectsPage hub displays the matching cluster first with a subtle "matched to your interest" badge. User can still browse all 16. The badge is informational, not restrictive.

## Pawn draft expected

Pawn is being asked to draft the user-facing copy + event taxonomy for the Proof → Join → Path flow. Her draft will include:
- Exact card labels and subtitles for the three intent options
- The "Here is what you just saved" closing line on the Gauntlet results page that triggers FirstStepsView
- Event names + payload schemas for analytics.ts AnalyticsEventType union extensions
- Routing rules per intent (which initiative cluster opens by default)

Bishop will append Pawn's draft to this delta when it lands.

## Routing proposal (Bishop draft, Pawn to refine)

- "I need help" → Step 5 + Step 2: MSA, Tatiana Schlossberg Health Accords, The Family Table, Rally Group
- "I want to help" → Step 3 + Step 6: Defense Klaus, Household Concierge, Harper Guild, Didasko
- "I want to make money" → Step 3 + Step 4: Let's Make Dinner, Let's Get Groceries, VSL, Brass Tacks, JukeBox

## Anti-patterns to enforce in code review

- Do NOT pre-gate the welcome page with intent. Welcome stays guest-friendly.
- Do NOT gate AI proof or Gauntlet on intent. The proof is universal.
- Do NOT make the intent capture optional. An empty tag means default routing, which is what the current join-into-bare-app produces and Pawn rightly called fragmented.

## Cross-references

- Memory: [[feedback-intent-capture-at-join-modal]]
- Pawn verdict source: Perplexity session, BP078, paste-package-surface
- Founder ratify: BP078 chat, post-Pawn-verdict surface
- Composes with: SEG-Z final implementation spec sections 3 and 5
