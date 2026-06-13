# Pawn Strategic Copy + State Machine for Cohesion Scopes 3/4/5

**For:** Knight (cohesion batch Scopes 3, 4, 5)
**From:** Pawn (Perplexity) via Bishop, BP078, 2026-06-08
**Source:** Pawn independent verdict + Founder ratify + Pawn second-pass component-ready spec

**Use this when building:**
- Scope 3: GauntletProofStep.tsx + NetworkValueReveal.tsx
- Scope 4: CheckoutSuccessStep.tsx
- Scope 5: UniformInitiativeShell (intent routing in InitiativeProjectsPage)
- Plus: extending `analytics.ts` AnalyticsEventType union with 5 new events

Truth-Always gate: live metric copy must NOT ship until the run pipeline emits real BMV + p50 latency + sources count. Until then, use the fallback copy block.

---

## 1. Success handoff (Bp067 Step 3 success → Gauntlet)

**Primary button label:** See your proof

**Secondary ghost CTA:** Ask it anything

**One-sentence tease:**
> Run a quick live check on included test data or your own folder and see what this install actually saves in speed, cost, and reach.

**Wiring note:** Replace the current single "Ask it anything" CTA with dual actions. Primary routes directly into Tab 3 (Gauntlet) with a lightweight intro state, NOT the raw tab shell.

---

## 2. ModeSelect copy (new user vs power user conditional)

### New user

**Heading:** Choose what to prove

**Body:** Start with a fast included run, or use your own folder to see results on work that matters to you.

**Mode cards:**

- **Use Included Test Data** — Best first run. Fast, guided, and comparable.
- **Choose Your Own Data** — Point MnemosyneC at a folder and build proof from your own files.
- **Advanced Manual Mode** — Tune sources and run settings yourself.

**Primary CTA after selection:** Run proof

### Power user

**Heading:** Select proof mode

**Body:** Use the included benchmark for a clean baseline, or run against your own substrate for a live read on performance.

**Mode cards:**

- **Included Benchmark** — Fast baseline across standard test inputs.
- **Your Data** — Build from a selected folder and compare on live substrate inputs.
- **Manual** — Direct control over source and run settings.

**Audience switch logic:**
- New user: first Gauntlet entry from first-run spine
- Power user: direct Gauntlet tab entry, OR `forTechies === true`, OR `hasCompletedGauntletOnce === true`

---

## 3. Results-page closer (Gauntlet results → join bridge)

### Live metrics path (only use if metrics.live === true AND all three values present)

**Heading:** Here's what this run just proved

**Body template:**
> This run measured a Banyan Metric of {bmv}, median response time of {p50LatencyMs} ms, and {sourcesCount} live sources in play.

**Bridge sentence:**
> If you want this to extend beyond your own machine into shared mesh capacity, member tools, and cooperative pathways, join Liana Banyan for $5/year.

**Interstitial label (above join CTA):** Next step — Keep this private and local, or turn it into shared capacity.

**Primary CTA:** Join for $5/year

**Secondary CTA:** Keep using MnemosyneC

**Microcopy under primary CTA:**
> $5/year. Cancel anytime. Opens Federation, Helm member tools, and your first cooperative path.

### Fallback path (any live metric missing)

**Heading:** Your private run is working

**Body:** You've confirmed the local path. Next, connect this install to the member layer that extends it into shared tools and Federation.

**Bridge sentence:**
> Join Liana Banyan for $5/year to open Helm, Federation, and your first cooperative path.

Same interstitial + CTAs + microcopy as the live path.

---

## 4. Intent capture (FirstStepsView post-Stripe-success)

**Section heading:** What brings you in first?

**Helper line:** Pick the path you want opened by default. You can explore everything later.

**Three single-select cards (radiogroup pattern, NOT radio rows):**

- **I need help** — Show me the tools and services most likely to save me money, time, or stress first.
- **I want to help** — Show me where I can contribute, host, review, teach, or support other members.
- **I want to make money** — Show me the initiatives with the clearest earning, service, or venture pathways first.

**CTA after selection:** Open my path

**Visual treatment:**
- Three vertical cards on mobile, three-across on desktop
- Entire card clickable
- Selected state: filled border, subtle tinted background, check icon in corner
- Required selection before final routing
- If user already paid and lands without selection, force as first post-checkout step

---

## 5. Post-join routing (intent → initiative cluster)

| Intent | Cluster | Default initiatives | One-action card |
|---|---|---|---|
| I need help | Household and savings | Let's Make Dinner, Let's Get Groceries, Household Concierge | Start with Dinner |
| I want to help | Community contribution | Harper Guild, Didasko, Health Accords | See where help is needed |
| I want to make money | Commerce and work | Let's Go Shopping, Defense Klaus, Let's Make Bread | Open earning-ready initiatives |

**Rationale:**
- "Need help" maps to immediate household relief and practical utility.
- "Want to help" maps to teaching, community stewardship, and care surfaces.
- "Make money" avoids VSL and Brass Tacks as PRIMARY defaults because they are generic-page-only with weak next steps per SEG-O3 + Pawn finding. They appear in the cluster but not as the lead card.

**Routing mechanics after Stripe checkout success:**
1. Save selected intent to `member_profiles.intent_tag` (Supabase) if possible.
2. Open Helm directly, NOT bare app.
3. Set default initiative cluster filter and scroll to top recommended card.
4. Show one-line banner: "Opened for: {intentLabel}. You can change your path anytime."

---

## 6. State machine

```ts
type ProofJoinPathState =
  | 'idle'
  | 'success_handoff'
  | 'mode_select'
  | 'running'
  | 'results'
  | 'first_steps'
  | 'path_routing'
  | 'done'
  | 'frame_exit'
  | 'join_skip';
```

**Transitions:**

- `idle` → `success_handoff` on successful first-run AI answer
- `success_handoff` → `mode_select` on "See your proof"
- `success_handoff` → `frame_exit` on "Ask it anything"
- `mode_select` → `running` on "Run proof"
- `running` → `results` on successful Gauntlet completion
- `results` → `first_steps` on "Join for $5/year"
- `results` → `join_skip` on "Keep using MnemosyneC"
- `first_steps` → `path_routing` on checkout success plus valid intent selection
- `path_routing` → `done` after Helm opens with cluster preselected

---

## 7. Component props (drop-in TypeScript)

### GauntletProofStep

```ts
type GauntletProofStepProps = {
  audience: 'new_user' | 'power_user';
  fromFirstRun: boolean;
  installVersion?: string;
  onOpenModeSelect: () => void;
  onOpenFrame: () => void;
  onRunProof: (mode: 'included' | 'own_data' | 'manual') => void;
  onJoin: () => void;
  onKeepUsing: () => void;
  analytics?: {
    track: (event: AnalyticsEventType, payload?: Record<string, unknown>) => void;
  };
};
```

### CheckoutSuccessStep

Render order: results closer copy → join bridge → hand off to FirstStepsView.

```ts
type CheckoutSuccessStepProps = {
  runId: string;
  mode: 'included' | 'own_data' | 'manual';
  metrics: {
    live: boolean;
    banyanMetric?: number;
    p50LatencyMs?: number;
    sourcesCount?: number;
    stageCount?: number;
  };
  onJoin: () => void;
  onKeepUsing: () => void;
  analytics?: {
    track: (event: AnalyticsEventType, payload?: Record<string, unknown>) => void;
  };
};
```

### FirstStepsView

```ts
type JoinIntent = 'need_help' | 'want_to_help' | 'make_money';

type FirstStepsViewProps = {
  selectedIntent?: JoinIntent | null;
  membershipActive?: boolean;
  onSelectIntent: (intent: JoinIntent) => void;
  onCheckout: (intent: JoinIntent) => void;
  onRoutePath: (intent: JoinIntent) => void;
  analytics?: {
    track: (event: AnalyticsEventType, payload?: Record<string, unknown>) => void;
  };
};
```

### Routing map

```ts
export const intentRoutingMap: Record<JoinIntent, {
  cluster: string;
  initiatives: string[];
  banner: string;
  primaryAction: string;
}> = {
  need_help: {
    cluster: 'household_and_savings',
    initiatives: ['lets-make-dinner', 'lets-get-groceries', 'household-concierge'],
    banner: 'Opened for: I need help. You can change your path anytime.',
    primaryAction: 'Start with Dinner',
  },
  want_to_help: {
    cluster: 'community_contribution',
    initiatives: ['harper-guild', 'didasko', 'health-accords'],
    banner: 'Opened for: I want to help. You can change your path anytime.',
    primaryAction: 'See where help is needed',
  },
  make_money: {
    cluster: 'commerce_and_work',
    initiatives: ['lets-go-shopping', 'defense-klaus', 'lets-make-bread'],
    banner: 'Opened for: I want to make money. You can change your path anytime.',
    primaryAction: 'Open earning-ready initiatives',
  },
};
```

### Live run result schema (what the run pipeline must emit before live copy is safe)

```ts
type LiveRunResult = {
  id: string;
  mode: 'included' | 'own_data' | 'manual';
  metrics: {
    live: boolean;
    banyanMetric?: number;
    p50LatencyMs?: number;
    sourcesCount?: number;
    stageCount?: number;
  };
};
```

Knight needs to wire:
- Real Banyan Metric calculator into completed runs
- Real p50 latency capture
- Real source-count emission
- Single trustworthy `metrics.live` boolean for UI gating

---

## 8. Event taxonomy (extend AnalyticsEventType)

Add these to `platform/src/lib/analytics.ts` AnalyticsEventType union:

```ts
type AnalyticsEventType =
  | 'proof_handoff_clicked'
  | 'proof_handoff_skipped'
  | 'gauntlet_mode_selected'
  | 'gauntlet_live_results_viewed'
  | 'membership_intent_selected'
  | 'membership_path_routed';
```

### proof_handoff_clicked

```ts
{
  source: 'first_run_success',
  cta_label: 'See your proof',
  install_version?: string,
  first_run_completed: true,
  gauntlet_visible: boolean
}
```

### proof_handoff_skipped

```ts
{
  source: 'first_run_success',
  cta_label: 'Ask it anything',
  install_version?: string
}
```

### gauntlet_mode_selected

```ts
{
  source: 'gauntlet_mode_select',
  mode: 'included' | 'own_data' | 'manual',
  audience: 'new_user' | 'power_user',
  from_first_run: boolean,
  for_techies_enabled: boolean
}
```

### gauntlet_live_results_viewed

Fire once per completed run on results-page render.

```ts
{
  source: 'gauntlet_results',
  run_id: string,
  metrics_live: boolean,
  banyan_metric?: number,
  p50_latency_ms?: number,
  sources_count?: number,
  stage_count?: number,
  mode: 'included' | 'own_data' | 'manual'
}
```

### membership_intent_selected

```ts
{
  source: 'first_steps_intent',
  intent: 'need_help' | 'want_to_help' | 'make_money',
  selection_surface: 'join_modal' | 'checkout_success',
  preselected: boolean
}
```

### membership_path_routed

```ts
{
  source: 'post_join_routing',
  intent: 'need_help' | 'want_to_help' | 'make_money',
  destination_surface: 'helm',
  destination_cluster: string,
  destination_initiatives: string[],
  membership_status: 'active'
}
```

---

## 9. Hard wiring rules (Pawn-stated anti-patterns)

1. `GauntletProofStep` is the ONLY way a first-run user enters Gauntlet initially. Closes the "drop into Frame with no next step" gap.
2. `CheckoutSuccessStep` is NOT a generic payment confirmation. It IS the proof closer plus join bridge in one component.
3. `FirstStepsView` requires intent selection before final path routing, but NOT before showing checkout. If checkout happens externally and returns active membership, present intent selection immediately on return.
4. Do NOT surface live proof numbers until the run pipeline emits actual BMV, latency, and sources count from real execution. Use fallback copy until those values are real.
5. For the "make money" route, do NOT default to VSL or Brass Tacks as the primary card. They appear in the cluster but not as the lead.

---

## 10. Bishop binding cross-references

- [[feedback-intent-capture-at-join-modal]] — intent capture is AT the join modal, not before
- BP078_FINAL_IMPLEMENTATION_SPEC.md Section 3 (Knight-wave items 2, 4, 5)
- BP078_FINAL_IMPLEMENTATION_SPEC_DELTA_INTENT_CAPTURE.md — supersedes routing details in this doc if conflict

End of Pawn strategic copy spec.
