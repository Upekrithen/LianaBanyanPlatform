# KNIGHT SESSION 262 — Preface + Burst Dispatch Pattern
## Bishop B075 | April 4, 2026

---

## MISSION

Implement the "Context + Burst" distribution pattern: before each batch of episodes is dispatched, a preface post fires first providing series context and a link. Batch size and preface style vary by platform.

---

## CONTEXT

Currently `dispatch-crewman-episode` fires individual episodes hourly via a cron job. The Founder wants:

1. A **preface post** before each batch that provides context (series name, chapter, episode range, link to full content)
2. **Platform-specific batching**:
   - **Twitter/X**: Preface + 3 episodes as a thread (4 posts, ~1 second apart)
   - **LinkedIn**: Preface + 1 episode as a single combined post
   - **Other platforms**: Preface + 1 episode (default pattern)
3. Episodes fire immediately after their preface — no gap

---

## STEP 1: Preface Content Table

```sql
CREATE TABLE IF NOT EXISTS episode_preface_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series TEXT NOT NULL, -- 'bst' | 'spoonfuls'
  chapter INT,
  chapter_title TEXT,
  source_description TEXT, -- e.g., "A 52-episode series on self-funding cooperative economics"
  cephas_url TEXT, -- e.g., "cephas.lianabanyan.com/bst/ch9"
  preface_template TEXT NOT NULL, -- Template with {{episode_range}}, {{chapter_title}}, {{cephas_url}} placeholders
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed templates for existing chapters
INSERT INTO episode_preface_templates (series, chapter, chapter_title, source_description, cephas_url, preface_template)
VALUES
  ('bst', 1, 'StarScreaming', 'A 52-episode series on a Founder''s first encounter with AI', 'cephas.lianabanyan.com/bst/ch1',
   '🧵 BST {{episode_range}} — Chapter 1: "StarScreaming"' || E'\n' || 'A Founder''s first encounter with AI — 72 hours that changed everything.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 2, 'The Blizzard', 'A 42-episode series on building through crisis', 'cephas.lianabanyan.com/bst/ch2',
   '🧵 BST {{episode_range}} — Chapter 2: "The Blizzard"' || E'\n' || 'When the ice storm hit and the platform kept building.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 3, 'Genesis', 'A 48-episode series on how the first systems were born', 'cephas.lianabanyan.com/bst/ch3',
   '🧵 BST {{episode_range}} — Chapter 3: "Genesis"' || E'\n' || 'The birth of the vocabulary, the vision, and the first nine systems.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 4, 'AI Cake', 'A 52-episode series on how four AI agents learned to collaborate', 'cephas.lianabanyan.com/bst/ch4',
   '🧵 BST {{episode_range}} — Chapter 4: "AI Cake"' || E'\n' || 'How to bake an AI Cake — four agents, one architecture, zero hallucinations (eventually).' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 5, 'The $5 Career', 'A 52-episode series on six new economic roles for $5/year', 'cephas.lianabanyan.com/bst/ch5',
   '🧵 BST {{episode_range}} — Chapter 5: "The $5 Career"' || E'\n' || 'Six entirely new careers. $5 to start. 83.3% to keep.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 6, 'The WaterWheel', 'A 42-episode series on how every dollar does the work of three', 'cephas.lianabanyan.com/bst/ch6',
   '🧵 BST {{episode_range}} — Chapter 6: "The WaterWheel"' || E'\n' || 'How every dollar does the work of three inside a cooperative economy.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 7, 'The Lighthouse Ladder', 'A 52-episode series on mentoring 100,000 people through 10-person caps', 'cephas.lianabanyan.com/bst/ch7',
   '🧵 BST {{episode_range}} — Chapter 7: "The Lighthouse Ladder"' || E'\n' || 'One to one hundred thousand — through ten honest relationships stacked five levels deep.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 8, 'The Invisible Temperament', 'A 48-episode series on personality without the test', 'cephas.lianabanyan.com/bst/ch8',
   '🧵 BST {{episode_range}} — Chapter 8: "The Invisible Temperament"' || E'\n' || 'How the platform learns who you are without asking — and gives you the off switch.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('bst', 9, 'Self-Funding Economics', 'A 52-episode series on killing the need for venture capital', 'cephas.lianabanyan.com/bst/ch9',
   '🧵 BST {{episode_range}} — Chapter 9: "Self-Funding Economics"' || E'\n' || 'Uber lost $31B before profit. We made money on transaction one. Cost+20%. Forever.' || E'\n' || 'Full story: {{cephas_url}}' || E'\n' || '↓'),
  ('spoonfuls', NULL, NULL, 'Bite-sized insights from the Proof is in the Pudding series', 'cephas.lianabanyan.com/pudding',
   '🥄 A Spoonful of Cephas' || E'\n' || 'From the "Proof is in the Pudding" series — accessible explanations of cooperative economics.' || E'\n' || 'Full series: {{cephas_url}}');
```

---

## STEP 2: Platform Dispatch Configuration

Add a `dispatch_platform_config` table (or extend `dispatch_platform_accounts` from K251):

```sql
CREATE TABLE IF NOT EXISTS dispatch_platform_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE, -- 'twitter', 'linkedin', 'facebook', 'instagram', 'threads', 'bluesky'
  batch_size INT NOT NULL DEFAULT 1, -- episodes per burst
  include_preface BOOLEAN NOT NULL DEFAULT true,
  preface_style TEXT NOT NULL DEFAULT 'separate', -- 'separate' (own post) | 'inline' (prepended to first episode)
  post_delay_ms INT NOT NULL DEFAULT 1000, -- delay between posts in a burst (ms)
  max_chars INT, -- platform character limit (NULL = no limit)
  thread_support BOOLEAN NOT NULL DEFAULT false, -- can this platform thread?
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO dispatch_platform_config (platform, batch_size, preface_style, post_delay_ms, max_chars, thread_support)
VALUES
  ('twitter', 3, 'separate', 1000, 280, true),
  ('linkedin', 1, 'inline', 0, 3000, false),
  ('facebook', 1, 'separate', 1000, NULL, false),
  ('instagram', 1, 'inline', 0, 2200, false),
  ('threads', 2, 'separate', 1000, 500, true),
  ('bluesky', 2, 'separate', 1000, 300, true);
```

---

## STEP 3: Update dispatch-crewman-episode Edge Function

Modify `platform/supabase/functions/dispatch-crewman-episode/index.ts`:

### Current behavior:
- Cron fires hourly
- Picks next episode by `scheduled_for <= NOW()` or unscheduled fallback
- Dispatches to each platform individually

### New behavior:

```typescript
// 1. Determine what to dispatch
const episodesToDispatch = await getNextEpisodeBatch();

// 2. For each active platform:
for (const platform of activePlatforms) {
  const config = await getPlatformConfig(platform.name);
  const batchSize = config.batch_size;

  // 3. Get the batch of episodes for this platform
  const batch = episodesToDispatch.slice(0, batchSize);

  if (batch.length === 0) continue;

  // 4. Generate preface
  if (config.include_preface) {
    const preface = generatePreface(batch, config);

    if (config.preface_style === 'separate') {
      // Post preface as its own post
      await dispatchPost(platform, preface);
      await delay(config.post_delay_ms);
    }
    // 'inline' style prepends to first episode in step 5
  }

  // 5. Dispatch episodes
  for (let i = 0; i < batch.length; i++) {
    let content = batch[i].content;

    // Inline preface on first episode
    if (i === 0 && config.preface_style === 'inline') {
      const preface = generatePreface(batch, config);
      content = preface + '\n\n' + content;
    }

    // Append hashtags
    content += '\n\n#CrewmanSix #AFoundersAIJourney #LianaBanyan';

    await dispatchPost(platform, content, {
      threadId: i === 0 ? null : threadId, // thread on supported platforms
      replyTo: i === 0 ? null : previousPostId,
    });

    if (i < batch.length - 1) {
      await delay(config.post_delay_ms);
    }
  }
}
```

### generatePreface function:

```typescript
function generatePreface(
  episodes: Episode[],
  config: PlatformConfig
): string {
  const first = episodes[0];
  const last = episodes[episodes.length - 1];

  // Look up preface template
  const template = await getTemplate(first.series, first.chapter);

  if (!template) {
    // Fallback: generic preface
    if (first.series === 'bst') {
      return `🧵 BST Episodes ${first.episode_number}-${last.episode_number} — Chapter ${first.chapter}\nFrom "Blood, Sweat, and Tears: A Founder's AI Journey"\n↓`;
    } else {
      return `🥄 A Spoonful of Cephas\nFrom the "Proof is in the Pudding" series\ncephas.lianabanyan.com/pudding`;
    }
  }

  // Fill template placeholders
  let preface = template.preface_template;
  const episodeRange = episodes.length === 1
    ? `Episode ${first.episode_number}`
    : `Episodes ${first.episode_number}-${last.episode_number}`;

  preface = preface.replace('{{episode_range}}', episodeRange);
  preface = preface.replace('{{chapter_title}}', template.chapter_title || '');
  preface = preface.replace('{{cephas_url}}', template.cephas_url || '');

  return preface;
}
```

### Hourly cron adjustment:

The cron still fires hourly. But now each firing dispatches a BURST:
- Twitter: 1 preface + 3 episodes = 4 posts per hour
- LinkedIn: 1 combined post per hour
- Other: 1 preface + 1 episode = 2 posts per hour

At 3 episodes/hour on Twitter, a 52-episode chapter runs in ~17 hours instead of 52. Adjust cron interval or batch size as needed. **Recommendation**: Keep hourly cron, use batch_size to control velocity per platform.

---

## STEP 4: Spoonfuls Preface Variant

Spoonfuls get a lighter preface since they're designed to stand alone:

```
🥄 A Spoonful of Cephas — from "The Lighthouse Ladder"
Bite-sized insights from the Pudding series.
cephas.lianabanyan.com/pudding/109
```

For Spoonfuls on LinkedIn (inline style), prepend directly:
```
🥄 Spoonful — from "The Lighthouse Ladder" (Pudding #109)

[spoonful text]

Full article: cephas.lianabanyan.com/pudding/109
#Spoonfuls #LianaBanyan
```

---

## STEP 5: Verify

1. **Manual test dispatch**: Call `dispatch-crewman-episode` with a test flag that logs output instead of posting
2. Verify Twitter output: 1 preface + 3 episodes in sequence
3. Verify LinkedIn output: 1 combined preface+episode post
4. Verify preface templates render correctly for all 9 chapters + spoonfuls
5. Verify hashtags are appended correctly
6. `npm run build` passes

---

## ACCEPTANCE CRITERIA

- [ ] `episode_preface_templates` table created and seeded for all 9 BST chapters + spoonfuls
- [ ] `dispatch_platform_config` table created with per-platform batch rules
- [ ] `dispatch-crewman-episode` generates preface before each burst
- [ ] Twitter dispatches: preface + 3 episodes (4 posts, 1s apart)
- [ ] LinkedIn dispatches: inline preface + 1 episode (single post)
- [ ] Spoonfuls get lighter preface variant
- [ ] Fallback preface works if no template exists for a chapter
- [ ] `npm run build` passes

---

## DO NOT

- Change the hourly cron schedule
- Modify episode content (preface is prepended, not inserted into episode text)
- Post to any live social account during testing (use test flag / dry run)
- Remove the existing dispatch logic — extend it
