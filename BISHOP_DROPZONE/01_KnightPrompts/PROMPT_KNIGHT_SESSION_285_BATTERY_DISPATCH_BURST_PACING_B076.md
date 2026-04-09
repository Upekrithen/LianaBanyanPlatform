# KNIGHT SESSION 276 — Battery Dispatch Burst Pacing & Size Update
## Bishop B076 | April 4, 2026
## Source: Pawn B48 Distribution Strategy Analysis

---

## Mission

Update the Battery Dispatch system to match platform algorithm incentives per Pawn B48 research. Three specific changes:

1. **X (Twitter)**: Change burst pacing from 1-second spacing to **15–45 second randomized jitter**
2. **X burst size**: Expand from 3 posts to **4–7 posts** per burst (configurable per chapter type)
3. **Threads**: Expand from 2 episodes to **3–5 posts** per burst

## Why This Matters

Pawn B48 surfaced that 1-second spacing on X reads as bot-like to the algorithm and risks distribution penalties. Industry data shows 15–60 seconds between posts is the "human" norm in viral thread case studies. Expanding burst size matches the 5–15 tweet sweet spot that 2025–2026 creators use to win CTR.

Current Banyan behavior is structurally correct (episodic, series-based) but the specific pacing/sizing parameters are below optimal.

---

## Implementation

### Part 1 — Inspect current Battery Dispatch system

Locate the Battery Dispatch code. Likely locations:
- `platform/supabase/functions/battery-dispatch-*` (edge functions)
- `platform/supabase/migrations/*battery*`
- Any scheduling/cron infra related to BST/Spoonfuls/Skipping Stones distribution

Identify:
- Where burst spacing is configured (hardcoded seconds, table column, env var)
- Where burst size is configured (per-platform)
- Platform targeting (X, Threads, LinkedIn, Meta)

### Part 2 — Schema change

Add configurable pacing + sizing to the battery dispatch config table (create if missing):

```sql
CREATE TABLE IF NOT EXISTS public.battery_dispatch_platform_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE CHECK (platform IN ('x','threads','linkedin','facebook','instagram')),
  min_burst_size INTEGER NOT NULL DEFAULT 1,
  max_burst_size INTEGER NOT NULL DEFAULT 1,
  min_spacing_seconds INTEGER NOT NULL DEFAULT 1,
  max_spacing_seconds INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.battery_dispatch_platform_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read dispatch config" ON public.battery_dispatch_platform_config FOR SELECT USING (true);

-- Seed canonical values from Pawn B48 recommendations
INSERT INTO public.battery_dispatch_platform_config
  (platform, min_burst_size, max_burst_size, min_spacing_seconds, max_spacing_seconds, notes)
VALUES
  ('x',         4, 7,  15, 45, 'Pawn B48: avoid 1-sec bot detection; 4-7 post sweet spot for CTR'),
  ('threads',   3, 5,  20, 60, 'Pawn B48: conversational depth, reply-first'),
  ('linkedin',  1, 2, 300, 600, 'Pawn B48: 1-2 larger posts, spread for morning peak'),
  ('facebook',  1, 2, 300, 600, 'Pawn B48: visual series framing'),
  ('instagram', 1, 2, 300, 600, 'Pawn B48: Reels/episodic')
ON CONFLICT (platform) DO UPDATE SET
  min_burst_size = EXCLUDED.min_burst_size,
  max_burst_size = EXCLUDED.max_burst_size,
  min_spacing_seconds = EXCLUDED.min_spacing_seconds,
  max_spacing_seconds = EXCLUDED.max_spacing_seconds,
  notes = EXCLUDED.notes,
  updated_at = now();
```

### Part 3 — Update Battery Dispatch logic

Modify the dispatch edge function (or scheduler) to:

1. **Read platform config from DB** (not hardcoded constants)
2. **Randomize spacing** within `[min_spacing_seconds, max_spacing_seconds]` using uniform distribution (prevents obvious patterns)
3. **Randomize burst size** within `[min_burst_size, max_burst_size]` per dispatch event
4. **Respect burst size when staging** — if a chapter has 48 episodes and X max_burst_size=7, that's ~7 bursts

Pseudocode:
```ts
const config = await getPlatformConfig(platform);  // from battery_dispatch_platform_config
const burstSize = randInt(config.min_burst_size, config.max_burst_size);
const episodes = getNextEpisodes(chapterId, burstSize);
let delay = 0;
for (const ep of episodes) {
  await scheduleAt(ep, now + delay);
  const spacing = randInt(config.min_spacing_seconds, config.max_spacing_seconds);
  delay += spacing * 1000;
}
```

### Part 4 — Backward compatibility

If the current dispatch system has in-flight scheduled posts using old spacing, **do not disturb them**. The new config applies to dispatches queued AFTER the migration.

### Part 5 — Verification

After deploy:
1. Run a test dispatch on X with a known test chapter
2. Verify actual post timestamps match 15–45 sec jitter (not 1 sec)
3. Verify burst size falls within 4–7 (randomized)
4. Spot-check Threads dispatch produces 3–5 post bursts
5. Query `battery_dispatch_platform_config` to confirm seed values loaded

---

## Deliverables

1. **Migration**: `platform/supabase/migrations/20260404000030_battery_dispatch_platform_config.sql`
2. **Code changes**: update Battery Dispatch edge function to read config + randomize
3. **Verification report**: confirm test dispatch matches new pacing/sizing
4. **Report via session log**: what was changed, what was preserved, what needs Founder review

---

## Context References

- **Pawn B48 analysis**: `BISHOP_DROPZONE/PAWN_B48_DISTRIBUTION_STRATEGY_ANALYSIS.md` (§3 Burst Size Recommendations, §8 Implementation)
- **Canonical context**: `BISHOP_DROPZONE/PAWN_B47_CANONICAL_CONTEXT_BLOCK_B076.md`

*Knight: execute end-to-end. FOR THE KEEP.*
