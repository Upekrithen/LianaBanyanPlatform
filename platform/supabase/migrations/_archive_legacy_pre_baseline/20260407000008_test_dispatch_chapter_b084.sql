-- B084: Test dispatch chapter — "Pudding Highlights — Test Batch"
-- Stages 5 test episodes from Puddings #160-#164 across 3 platforms
-- to verify the Battery Dispatch pipeline end-to-end.
-- Chapter number 999 chosen to avoid collision with production chapters.

---------------------------------------------------
-- 1. INSERT TEST CHAPTER
---------------------------------------------------
INSERT INTO public.crewman_chapters (
  id, chapter_number, title, source_document,
  episode_count, status, stream_started_at
)
VALUES (
  'a0000000-b084-4000-9999-000000000001',
  999,
  'Pudding Highlights — Test Batch',
  'cephas_puddings:160-164',
  15,            -- 5 puddings × 3 platforms
  'streaming',   -- active for dispatch
  now()
);

---------------------------------------------------
-- 2. INSERT 5 EPISODES × 3 PLATFORMS (twitter, linkedin, bluesky)
---------------------------------------------------

-- Helper: each episode gets a sequence_number per platform.
-- Twitter variants are trimmed to ~280 chars.
-- LinkedIn and Bluesky get the full version.

INSERT INTO public.crewman_episodes (
  chapter_id, sequence_number, content, source_reference,
  tags, platform, channel, status
)
VALUES
  -- ── Pudding #160 — The Ratchet ─────────────────────────
  (
    'a0000000-b084-4000-9999-000000000001', 1,
    'A credit you earn today is worth the same tomorrow. Not because someone promises it — because the system locks it in place. The one-way valve means your value only goes up. /cephas/pudding/the-ratchet-why-your-credits-never-lose-value',
    'cephas_puddings:160',
    ARRAY['pudding', 'credits', 'ratchet', 'test'],
    'twitter', 'spoonfuls', 'queued'
  ),
  (
    'a0000000-b084-4000-9999-000000000001', 1,
    'A credit you earn today is worth the same tomorrow. Not because someone promises it — because the system locks it in place. The one-way valve architecture prevents Credit deflation. Credits enter the cooperative domain and never convert back to fiat. That is not a policy. That is physics. Read more: /cephas/pudding/the-ratchet-why-your-credits-never-lose-value',
    'cephas_puddings:160',
    ARRAY['pudding', 'credits', 'ratchet', 'test'],
    'linkedin', 'spoonfuls', 'queued'
  ),
  (
    'a0000000-b084-4000-9999-000000000001', 1,
    'A credit you earn today is worth the same tomorrow. Not because someone promises it — because the system locks it in place. The one-way valve architecture prevents Credit deflation. Credits enter the cooperative domain and never convert back to fiat. That is not a policy. That is physics. Read more: /cephas/pudding/the-ratchet-why-your-credits-never-lose-value',
    'cephas_puddings:160',
    ARRAY['pudding', 'credits', 'ratchet', 'test'],
    'bluesky', 'spoonfuls', 'queued'
  ),

  -- ── Pudding #161 — Your Castle Ready on Day One ────────
  (
    'a0000000-b084-4000-9999-000000000001', 2,
    'Most platforms hand you a blank page and say good luck. Liana Banyan hands you a castle with the lights already on. Cold Start means you earn from day one. /cephas/pudding/your-castle-ready-on-day-one',
    'cephas_puddings:161',
    ARRAY['pudding', 'cold-start', 'helm', 'test'],
    'twitter', 'spoonfuls', 'queued'
  ),
  (
    'a0000000-b084-4000-9999-000000000001', 2,
    'Most platforms hand you a blank page and say good luck. Liana Banyan hands you a castle with the lights already on. The Cold Start architecture gives new members a fully functional Helm, pre-wired connections, and immediate earning pathways from first login. No setup grind. No empty dashboard. Read more: /cephas/pudding/your-castle-ready-on-day-one',
    'cephas_puddings:161',
    ARRAY['pudding', 'cold-start', 'helm', 'test'],
    'linkedin', 'spoonfuls', 'queued'
  ),
  (
    'a0000000-b084-4000-9999-000000000001', 2,
    'Most platforms hand you a blank page and say good luck. Liana Banyan hands you a castle with the lights already on. The Cold Start architecture gives new members a fully functional Helm, pre-wired connections, and immediate earning pathways from first login. No setup grind. No empty dashboard. Read more: /cephas/pudding/your-castle-ready-on-day-one',
    'cephas_puddings:161',
    ARRAY['pudding', 'cold-start', 'helm', 'test'],
    'bluesky', 'spoonfuls', 'queued'
  ),

  -- ── Pudding #162 — The Board Game Lobby ────────────────
  (
    'a0000000-b084-4000-9999-000000000001', 3,
    'Imagine walking into a board game cafe. You do not sit at a random table — you browse the lobbies. Crew Call works the same way. Find your team before the game starts. /cephas/pudding/the-board-game-lobby-how-teams-form',
    'cephas_puddings:162',
    ARRAY['pudding', 'crew-call', 'teams', 'test'],
    'twitter', 'spoonfuls', 'queued'
  ),
  (
    'a0000000-b084-4000-9999-000000000001', 3,
    'Imagine walking into a board game cafe. You do not sit down at a random table. You browse the lobbies. The Crew Call system works the same way — project creators post skill needs and members browse, match, and join teams before work begins. No cold emails. No awkward pitches. Just a lobby where the right people find each other. Read more: /cephas/pudding/the-board-game-lobby-how-teams-form',
    'cephas_puddings:162',
    ARRAY['pudding', 'crew-call', 'teams', 'test'],
    'linkedin', 'spoonfuls', 'queued'
  ),
  (
    'a0000000-b084-4000-9999-000000000001', 3,
    'Imagine walking into a board game cafe. You do not sit down at a random table. You browse the lobbies. The Crew Call system works the same way — project creators post skill needs and members browse, match, and join teams before work begins. No cold emails. No awkward pitches. Just a lobby where the right people find each other. Read more: /cephas/pudding/the-board-game-lobby-how-teams-form',
    'cephas_puddings:162',
    ARRAY['pudding', 'crew-call', 'teams', 'test'],
    'bluesky', 'spoonfuls', 'queued'
  ),

  -- ── Pudding #163 — The Red Queen ───────────────────────
  (
    'a0000000-b084-4000-9999-000000000001', 4,
    'The Red Queen does not manage you. She manages the information around you so you can manage yourself. Your personal AI manager — without the micromanagement. /cephas/pudding/the-red-queen-your-personal-ai-manager',
    'cephas_puddings:163',
    ARRAY['pudding', 'ai-nanny', 'red-queen', 'test'],
    'twitter', 'spoonfuls', 'queued'
  ),
  (
    'a0000000-b084-4000-9999-000000000001', 4,
    'The Red Queen does not manage you. She manages the information around you so you can manage yourself. She curates tasks, filters noise, and surfaces opportunities — without replacing human agency. Think of her as a personal AI manager who respects that you are the one in charge. Read more: /cephas/pudding/the-red-queen-your-personal-ai-manager',
    'cephas_puddings:163',
    ARRAY['pudding', 'ai-nanny', 'red-queen', 'test'],
    'linkedin', 'spoonfuls', 'queued'
  ),
  (
    'a0000000-b084-4000-9999-000000000001', 4,
    'The Red Queen does not manage you. She manages the information around you so you can manage yourself. She curates tasks, filters noise, and surfaces opportunities — without replacing human agency. Think of her as a personal AI manager who respects that you are the one in charge. Read more: /cephas/pudding/the-red-queen-your-personal-ai-manager',
    'cephas_puddings:163',
    ARRAY['pudding', 'ai-nanny', 'red-queen', 'test'],
    'bluesky', 'spoonfuls', 'queued'
  ),

  -- ── Pudding #164 — Portal Doors ────────────────────────
  (
    'a0000000-b084-4000-9999-000000000001', 5,
    'You belong to a Guild. You belong to a Tribe. You run a Bridge. You live in a Helm. These are not separate apps — they are portal doors in the same building. /cephas/pudding/portal-doors-how-you-navigate-between-communities',
    'cephas_puddings:164',
    ARRAY['pudding', 'portals', 'navigation', 'test'],
    'twitter', 'spoonfuls', 'queued'
  ),
  (
    'a0000000-b084-4000-9999-000000000001', 5,
    'You belong to a Guild. You belong to a Tribe. You run a Bridge. You live in a Helm. These are not separate apps — they are portal doors in the same building. Nine portal surfaces let you navigate seamlessly between .com, .biz, .org, .net, and specialty domains without losing context or identity. One member. Many doors. Read more: /cephas/pudding/portal-doors-how-you-navigate-between-communities',
    'cephas_puddings:164',
    ARRAY['pudding', 'portals', 'navigation', 'test'],
    'linkedin', 'spoonfuls', 'queued'
  ),
  (
    'a0000000-b084-4000-9999-000000000001', 5,
    'You belong to a Guild. You belong to a Tribe. You run a Bridge. You live in a Helm. These are not separate apps — they are portal doors in the same building. Nine portal surfaces let you navigate seamlessly between .com, .biz, .org, .net, and specialty domains without losing context or identity. One member. Many doors. Read more: /cephas/pudding/portal-doors-how-you-navigate-between-communities',
    'cephas_puddings:164',
    ARRAY['pudding', 'portals', 'navigation', 'test'],
    'bluesky', 'spoonfuls', 'queued'
  );
