-- K171 / B049: Pudding #23 (Hood Uber), 6 Easy Steps V2 Patch, Golden Key Seeds, Canonical Stats
-- Bishop B049 session deliverables

-- ═══════════════════════════════════════════════════════════
-- 1. Canonical Stats Update
-- ═══════════════════════════════════════════════════════════

UPDATE platform_canonical SET value = 2105, updated_at = now() WHERE key = 'innovation_count';
UPDATE platform_canonical SET value = 23, updated_at = now() WHERE key = 'pudding_articles';
UPDATE platform_canonical SET value = 171, updated_at = now() WHERE key = 'knight_sessions';
UPDATE platform_canonical SET value = 49, updated_at = now() WHERE key = 'bishop_sessions';
UPDATE platform_canonical SET value = 5, updated_at = now() WHERE key = 'dirty_dozen_green';


-- ═══════════════════════════════════════════════════════════
-- 2. Pudding Article #23 — Hood Uber Proves the Need
-- ═══════════════════════════════════════════════════════════

INSERT INTO cephas_content_registry (
  slug, title, category, subcategory, source_path, style,
  content_markdown, technical_summary, implementation_status,
  bishop_session, knight_session, innovation_ids
) VALUES (
  'pudding/hood-uber-proves-the-need',
  'Hood Uber Proves the Need. We Built the Fix.',
  'article',
  'pudding',
  'BISHOP_DROPZONE/PUDDING_23_HOOD_UBER_PROVES_THE_NEED.md',
  'pudding',
  $md$# Hood Uber Proves the Need. We Built the Fix.

---

Twenty-one thousand people in San Antonio organized their own rideshare network through Facebook groups. No app. No company. No safety net.

They call it Hood Uber.

A March 2026 news report documented what this looks like in practice: cheaper fares than Uber and Lyft, cash and Venmo payments, drivers working dawn to dark six days a week. One driver was shot over an unpaid fare. Others carry weapons for protection. There are no background checks, no insurance requirements, and no payment guarantees.

This is not a failure of the people involved. This is a failure of the platforms that were supposed to serve them.

## The Gap

Uber and Lyft take 25-40% of every fare. They reject drivers with criminal backgrounds — even nonviolent offenses from years ago. They surge-price during peak demand, which means the people who need rides most pay the most. They classify drivers as independent contractors to avoid benefits. And when the math doesn't work for the driver, the driver leaves — or never signs up at all.

So 21,000 San Antonians built their own system. It works — barely. The fares are cheaper. The community is real. But there's no background check process, no payment protection, no insurance pool, and no safety infrastructure. The gap between "Uber is too expensive and too selective" and "Hood Uber has zero safety" is exactly where a cooperative belongs.

## What Rideshare Routes Does Differently

Rideshare Routes is one of {{charitableInitiatives}} initiatives inside Liana Banyan's cooperative commerce platform. Here's how it closes the gap:

**The driver keeps 83.3%.** Not Uber's 60%. Not Hood Uber's 100%-minus-the-risk-of-getting-shot. A real number, locked in the cooperative charter, constitutionally unchangeable. On a $20 fare, the driver takes home $16.66. The cooperative takes $3.34 to fund operations, safety infrastructure, and charitable initiatives.

**Background verification — without blanket rejection.** Uber's background check is binary: pass or fail. A nonviolent misdemeanor from a decade ago disqualifies you permanently. Rideshare Routes uses tiered verification: driving record, identity confirmation, and community vouching. A person rejected by Uber for their background isn't automatically rejected here — their community can speak to their character. The cooperative decides, not an algorithm.

**Payment before the trip.** Stripe processes payment at booking. The driver never collects cash. No driver gets threatened over a fare. No passenger gets stranded over a payment dispute. The money is settled before the car moves.

**Insurance pooling.** Individual rideshare insurance costs $150-300/month per driver. A cooperative insurance pool spreads that cost across all drivers in the network. At 50 drivers, the per-driver cost drops to a fraction of individual coverage. The cooperative negotiates as a bloc — the same principle that makes Guilds powerful makes insurance affordable.

**Defense Klaus integration.** Every Rideshare Routes driver has access to Defense Klaus — personal safety infrastructure built into the platform. A bracelet with a panic button. A legal defense fund backed by community contributions. GPS sharing with trusted contacts during every trip. A driver working alone at 5 AM doesn't just have a phone — she has a team.

## The Earn-Down Program

Hood Uber drivers use their own cars. When the transmission goes, they're done. No car, no income, no safety net.

Rideshare Routes includes the Earn-Down program: drivers accumulate toward vehicle ownership through their driving revenue. A percentage of every fare (above the {{platformMargin}} margin) flows into an Earn-Down account. Drive long enough, and the car is yours. Not a lease. Not a rental. Ownership. Title in your name.

The cooperative maintains a fleet of vehicles available for Earn-Down. A new driver starts with a cooperative vehicle, pays it off through driving, and owns it outright when the balance reaches zero. The vehicle becomes theirs — not the cooperative's, not a franchisor's, not a fleet company's.

## Why This Matters Beyond San Antonio

Hood Uber isn't unique to San Antonio. Every major American city has informal rideshare networks — Facebook groups, WhatsApp chains, word-of-mouth systems filling the gap that Uber and Lyft created when they priced out drivers and riders simultaneously.

The pattern is the same everywhere: communities self-organizing because platforms failed them, accepting dangerous conditions because the alternative is no transportation at all.

Rideshare Routes isn't just a rideshare service. It's a template. Every city with a Hood Uber problem has a Rideshare Routes solution waiting. The cooperative model is portable: same {{platformMargin}} margin, same driver retention, same safety infrastructure, same Earn-Down program. Replicate the node, and the solution scales.

## The Math

A single Rideshare Routes driver completing 25 trips per day at an average fare of $12:

| | Uber | Hood Uber | Rideshare Routes |
|---|---|---|---|
| Daily gross | $300 | $300 | $300 |
| Platform take | $75-$120 (25-40%) | $0 | $50.10 (16.7%) |
| Driver keeps | $180-$225 | $300 | $249.90 |
| Background check | Binary pass/fail | None | Tiered + community |
| Payment protection | Yes | None | Yes (Stripe pre-pay) |
| Insurance | Driver's burden | None | Cooperative pool |
| Safety infrastructure | Limited | None | Defense Klaus |
| Path to ownership | No | No | Earn-Down |

The driver keeps more than Uber pays, gets the safety that Hood Uber can't provide, and builds toward owning the vehicle. That's not a compromise — that's a better deal on every axis.

## 21,000 People Proved the Demand

The hardest part of launching any new service is proving people want it. Hood Uber already proved it — 21,000 times over, in a single city, with zero marketing budget.

Those 21,000 people aren't a problem to be solved. They're a market that already exists. They already chose community-based transportation over corporate platforms. They just need the infrastructure to make it safe.

That infrastructure is built. The economics are published. The cooperative is ready. And it's headquartered in the same city where 21,000 people proved the demand exists.

They documented the need. We built the fix.

---

*Jonathan Jones*
*{{founderTitle}}, {{entityName}}*
*San Antonio, Texas*

*Help each other help ourselves.*

**FOR THE KEEP.**$md$,
  'Pudding article #23: Hood Uber / Rideshare Routes cooperative transportation with Earn-Down vehicle ownership, Defense Klaus safety, tiered background verification, Stripe pre-pay',
  'live',
  'B049',
  'K171',
  ARRAY['Rideshare Routes', 'Defense Klaus', 'Earn-Down', 'Rally Group']
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  title = EXCLUDED.title,
  technical_summary = EXCLUDED.technical_summary,
  bishop_session = EXCLUDED.bishop_session,
  knight_session = EXCLUDED.knight_session,
  innovation_ids = EXCLUDED.innovation_ids,
  updated_at = now();


-- ═══════════════════════════════════════════════════════════
-- 3. Patch "6 Easy Steps" V2 — Insert Rideshare Routes in Step 3
-- ═══════════════════════════════════════════════════════════

UPDATE cephas_content_registry
SET content_markdown = REPLACE(
  content_markdown,
  '**LifeLine Medications** is prescription access at cost plus 20%',
  E'**Rideshare Routes** is cooperative transportation. In March 2026, a San Antonio news outlet documented over 21,000 residents using informal community ridesharing organized through Facebook groups — with no background checks, no payment protection, and a driver who was shot over an unpaid fare. The demand for affordable community transportation is proven. The infrastructure to make it safe doesn''t exist yet — until now. Rideshare Routes charges {{platformMargin}}. The driver keeps {{creatorRetention}}. Payment is processed by Stripe before the trip — no cash disputes. Background verification uses tiered assessment with community vouching, not Uber''s binary pass/fail. The Earn-Down program lets drivers accumulate toward owning the vehicle they drive. Defense Klaus provides panic buttons and legal defense for drivers working alone. The safe version of what 21,000 San Antonians built on faith.\n\n**LifeLine Medications** is prescription access at cost plus 20%'
),
updated_at = now()
WHERE slug = 'six-easy-steps';


-- ═══════════════════════════════════════════════════════════
-- 4. Create golden_key_answers table + Seed answers
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.golden_key_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  key_word TEXT NOT NULL,
  clue_hint TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT golden_key_answers_article_slug_key UNIQUE (article_slug)
);

ALTER TABLE public.golden_key_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active golden key answers"
  ON public.golden_key_answers FOR SELECT
  USING (active = true);

CREATE POLICY "Admins manage golden key answers"
  ON public.golden_key_answers FOR ALL
  USING (public.is_admin());

INSERT INTO golden_key_answers (article_slug, key_word, clue_hint, active, created_at) VALUES
  ('pudding/zero-storage-full-income', 'REGISTRAR', 'The platform isn''t a landlord. It''s a ___', true, now()),
  ('pudding/pearl-diver-neighborhood-intelligence', 'PEARL', 'What do you call the diver who finds deals?', true, now()),
  ('pudding/five-dollar-classroom', 'CLASSROOM', 'What costs $5 and creates a career?', true, now()),
  ('pudding/why-the-first-ten-matter', 'TEN', 'What''s the maximum number of pioneers in the top tier?', true, now()),
  ('pudding/four-currencies-one-subscription', '83.3', 'What percentage does the creator keep?', true, now()),
  ('pudding/hood-uber-proves-the-need', 'ROUTES', 'The cooperative rideshare is called Rideshare ___', true, now())
ON CONFLICT (article_slug) DO UPDATE SET
  key_word = EXCLUDED.key_word,
  clue_hint = EXCLUDED.clue_hint,
  active = true,
  updated_at = now();
