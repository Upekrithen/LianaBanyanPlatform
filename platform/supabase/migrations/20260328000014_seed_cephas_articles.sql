-- K154 Task 1: Seed article content into cephas_content_registry
-- Inserts roommate-accountability with full content; 6 new entries with metadata (content TBD from Bishop).

-- Step 1: Insert roommate-accountability (full content from Bishop B040)
INSERT INTO cephas_content_registry (
  slug, title, category, style, source_path, implementation_status, bishop_session,
  technical_summary, content_markdown
)
VALUES (
  'roommate-accountability',
  'Your Roommate Score: Accountability That Works',
  'article',
  'pudding',
  'CEPHAS_PUDDING_ROOMMATE_ACCOUNTABILITY.md',
  'live',
  'B040',
  'Cooperative housing accountability system: 5 duties, 4 commitment tiers, Marks escrow, photo-evidenced complaints, 48hr grace period, reciprocal weighted reputation scoring.',
  $content$## This Isn''t Surveillance

> "Whatever you commit to, you do — and the benefits follow."
> — Denken, Founder

### The Problem With Roommates

Everyone has a roommate story. The dishes piling up. The garbage nobody takes out. The bathroom that slowly becomes an archaeological dig.

It''s not that people are terrible. It''s that nobody agreed on the rules up front. Nobody committed. And when nobody committed, nobody''s accountable.

We fixed that.

### How It Works: You Choose Your Level

> **Your Commitment, Your Choice**
>
> When you apply for cooperative housing through Liana Banyan, you pick your commitment level for five household duties. Nobody assigns you anything. Nobody decides for you. **You** decide what you''re willing to do — and how often.
>
> This isn''t a punishment system. It''s a promise system. The only person who sets your bar is you.

---

## The Five Duties + Four Tiers

Every cooperative housing unit tracks five categories of household responsibility:

1. **Dishwashing** — keeping the sink clear
2. **Garbage removal** — taking it out before it becomes a problem
3. **Kitchen hygiene** — counters, stovetop, fridge
4. **Bathroom hygiene** — shared bathrooms stay usable
5. **Common areas** — living room, hallways, shared spaces

For each one, you choose your commitment tier:

| Tier | Frequency | Roommate Score Impact |
|---|---|---|
| **Daily** | Every day | Highest (5 points) |
| **Every-Other-Day** | Every 48 hours | High (4 points) |
| **3x/Week** | Three times per week | Moderate (3 points) |
| **Weekly** | Once per week | Baseline (2 points) |

> **Higher Commitment = Better Placement**
>
> Choose a higher tier and your Roommate Score goes up. A higher score means priority when rooms open up. It doesn''t mean you have to scrub floors daily — it means you CHOSE to, and you followed through. That''s worth something.

---

## The 10 Marks Pledge

### Back Your Word With Marks

Here''s where accountability gets real. When your application is approved, you pledge **10 Marks per week** as an accountability deposit. Those Marks go into escrow — they''re still yours.

**Clean week?** Your Marks stay right where they are. Nobody touches them.

**Valid complaint against you?** Those escrowed Marks go to the housing cooperative fund — NOT to the person who complained.

That last part matters. A lot.

**The flow:** Choose tier → Pledge 10 Marks/week → Follow through → Clean week = Marks stay yours → Complaint upheld = Marks go to cooperative fund

### Why the Cooperative Fund — Not the Complainer?

> **No Incentive to Nitpick**
>
> If your roommate got paid every time they filed a complaint against you, what would happen? They''d find something wrong every single day.
>
> That''s not accountability. That''s a perverse incentive.
>
> Forfeited Marks go to the **housing cooperative fund** — a shared pool that benefits the entire cooperative community. The complainer gets a cleaner kitchen. They don''t get your Marks. That keeps the system honest.

---

## Stamp Complaints: Evidence-Based, Not Drama-Based

### How Complaints Work

If a roommate isn''t following through on their commitment, you can file a **Stamp** — a formal, photo-evidenced complaint. Here''s how:

1. **Take a photo** — the system captures metadata (time, date) so there''s a record
2. **Select the category** — which of the five duties was neglected?
3. **Describe the issue** — brief, factual
4. **Submit the Stamp** — your roommate gets notified immediately

### The 48-Hour Grace Period

> **Fair Process**
>
> Nobody loses Marks on a surprise. When a Stamp is filed, the respondent has **48 hours** to:
>
> - **Accept it** — acknowledge the lapse, forfeit proceeds
> - **Contest it** — upload their own photos and explanation
>
> If contested, a **Steward** (a designated cooperative community mediator) reviews both sides and makes a decision. The Steward''s resolution is final.

### Monthly Safety Cap

**30 Marks/Month Maximum Forfeit** — Three valid complaints triggers Steward review. You''re protected from runaway penalties.

Even if things go sideways, the system has a ceiling. Maximum forfeit: **30 Marks per month**. That''s 3 valid complaints. If you hit 3 in one month, a Steward review is automatically triggered — not to punish you, but to figure out what''s going on and whether additional support or mediation is needed.

Nobody falls off a cliff here. The cap exists to protect you while still maintaining real accountability.

---

## Your Roommate Score

### Four Factors, One Number

Your Roommate Score is a composite rating on a 0–5 scale that feeds directly into Liana Banyan''s reputation system. It''s calculated from four factors:

| Factor | Weight | What It Measures |
|---|---|---|
| **Commitment Level** | 20% | Higher tier chosen = more points |
| **Follow-Through** | 40% | Clean weeks ÷ total weeks |
| **Peer Ratings** | 25% | Roommate reputation ratings (reciprocal) |
| **Tenure** | 15% | Longer active agreement = more trust |

### Reciprocal Grading: Your Weight Depends on Your Weight

> **Chronic Complainers Get Discounted**
>
> When a roommate rates you, their rating is **weighted by their own reputation**. A roommate with a 4.8 score who says you''re great? That carries weight. A roommate with a 1.2 score who files stamps every other day? Their ratings are discounted.
>
> This is mean-average reciprocity. Your credibility AS a rater depends on your own track record. The system self-corrects for bad actors.

---

## Why This Works

### Voluntary, Transparent, and Self-Reinforcing

**Voluntary.** Nobody forces you into a higher tier. Choose weekly if that''s what you can commit to. The system rewards ambition, but it doesn''t punish humility. A weekly commitment, done consistently, builds a great score over time.

**Transparent.** Every rule is published before you apply. The Marks pledge, the complaint process, the grace period, the cap, the score formula — all visible. No hidden penalties. No surprises.

**Self-Reinforcing.** Good roommates attract good roommates. High-score applicants get priority placement in high-score units. The cooperative naturally sorts toward reliability because the system makes reliability visible and valuable.

> "This isn''t surveillance — it''s a system where everyone knows the rules up front."
> — Denken, Founder

---

## The Pitch

**10 Marks/Week** — Pledge your commitment. Follow through. Keep your Marks.

Cooperative housing works when people show up — for themselves and for each other. The Roommate Accountability System doesn''t ask you to be perfect. It asks you to be honest about what you''re willing to do, and then to do it.

Whatever you commit to, you do — and the benefits follow.

Higher score. Priority placement. Better roommates. A cleaner home. All because you said what you''d do and then you did it.

---

## Red Carpet: See It in Action

> **Try the Red Carpet**
>
> Want to see what a cooperative housing application looks like before you commit? Visit the **Red Carpet Showcase** at [lianabanyan.com/showcase](/showcase) to explore the Roommate Accountability System — no membership required. Browse commitment tiers, preview the scoring formula, and see how Marks escrow works. When you''re ready, $5/year gets you in.

---

> **Legal Notice**
>
> Liana Banyan is a cooperative membership platform, not a securities offering. Marks are program credits earned through participation, not purchased securities, and cannot be exchanged for cash or external currency. The Roommate Accountability System is a voluntary program within cooperative housing; participation is optional. Forfeited Marks are transferred to the housing cooperative fund and are not redistributable to individual complainants. Roommate Scores are internal reputation metrics and do not constitute credit scores, financial ratings, or legally binding assessments. The 10 Marks/week pledge, 30 Marks/month cap, and all scoring weights described above are subject to program rules and may be adjusted. Liana Banyan does not use blockchain technology. Records are maintained in a standard verified database ledger.

---

### References

- Ostrom, E. (1990). *Governing the Commons*
- Sazama, G. (2000). *Lessons from the History of Affordable Housing Cooperatives in the United States*
- International Cooperative Alliance — Cooperative Principles (1995, revised 2015)
- Scholz, T., & Schneider, N. (2016). *Ours to Hack and to Own*
$content$
)
ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

-- Step 2: Insert 6 new article entries (metadata only — content pending from Bishop)
INSERT INTO cephas_content_registry (slug, title, category, style, source_path, implementation_status, bishop_session, technical_summary)
VALUES
  ('battery-dispatch-universal-remote',
   'Battery Dispatch: Your Universal Remote',
   'article', 'pudding',
   'CEPHAS_PUDDING_BATTERY_DISPATCH_UNIVERSAL_REMOTE.md',
   'live', 'B041',
   'Social media dispatch system with platform-specific rate limits, compliance stamps, and staggered scheduling across 12 platforms.'),

  ('youre-in-charge-of-you',
   'You''re in Charge of YOU',
   'article', 'pudding',
   'CEPHAS_PUDDING_YOURE_IN_CHARGE_OF_YOU.md',
   'live', 'B041',
   'Cooperative empowerment: members control their data, pricing, and participation level. No algorithmic manipulation.'),

  ('anticipated-critiques',
   'Anticipated Critiques',
   'article', 'pudding',
   'CEPHAS_PUDDING_REWRITE_ANTICIPATED_CRITIQUES.md',
   'live', 'B041',
   'Pre-emptive responses to common criticisms of cooperative platforms, three-currency economics, and decentralized governance.'),

  ('currency-differential',
   'The Currency Differential',
   'article', 'pudding',
   'CEPHAS_PUDDING_REWRITE_CURRENCY_DIFFERENTIAL.md',
   'live', 'B041',
   'How Credits, Marks, and Joules create a triple-layer economic engine that separates immediate value, earned status, and deferred growth.'),

  ('lifeline-medications',
   'Lifeline Medications',
   'article', 'pudding',
   'CEPHAS_PUDDING_REWRITE_LIFELINE_MEDICATIONS.md',
   'live', 'B041',
   'Cooperative medication procurement using aggregated demand and Cost+20% pricing to reduce prescription costs for members.'),

  ('more-than-me',
   'More Than Me',
   'article', 'pudding',
   'CEPHAS_PUDDING_REWRITE_MORE_THAN_ME.md',
   'live', 'B041',
   'The interdependence thesis: why helping each other help ourselves creates compounding returns for everyone in the cooperative.')
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE cephas_content_registry IS
  'K154: Seeded roommate-accountability article with full content. Added 6 new article entries (content pending from Bishop B041).';
