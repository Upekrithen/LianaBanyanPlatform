# KNIGHT SESSION 202 — Red Carpet: Database-Driven Recipient Lookup
## Priority: CRITICAL — Anyone added to DB must be recognized without a code deploy
## Bishop B053
## Depends on: K200 (Cue Cards), K201 (Helm)
## Innovation: #2126 Dynamic Red Carpet Access Registry

---

## CONTEXT

The `findRecipientByEmail()` function in `platform/src/data/redCarpetRecipients.ts` is **hardcoded** — it searches a static TypeScript array of 71 recipients. This means every time we add someone (Amarissa, Diana, new Cue Card recipients), we need a code deploy. That's broken.

**Fix:** Create a `red_carpet_access` table in Supabase, seed it with existing recipients, and make `findRecipientByEmail()` query the database first, falling back to the static array only if the DB query fails.

---

## TASK 1: Create `red_carpet_access` Table

**Migration file:** `supabase/migrations/20260331100001_k202_red_carpet_access.sql`

```sql
-- K202: Red Carpet Dynamic Access Registry
-- Replaces hardcoded recipient lookup with DB-driven system

CREATE TABLE IF NOT EXISTS red_carpet_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  organization TEXT,
  bio TEXT,
  purpose TEXT,                    -- why they're getting red carpet
  why_you TEXT,                    -- personalized "why you" message
  categories TEXT[] DEFAULT '{}',  -- crown, high-value, journalist, etc.
  known_emails TEXT[] DEFAULT '{}',-- exact email matches (lowercase)
  email_domains TEXT[] DEFAULT '{}',-- domain-level matches
  walkthrough_config JSONB DEFAULT '{}', -- per-recipient walkthrough customization
  initiatives TEXT[] DEFAULT '{}', -- which initiatives to highlight
  source TEXT DEFAULT 'manual',    -- manual, cue_card, admin, import
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for email lookup (GIN on array)
CREATE INDEX idx_red_carpet_known_emails ON red_carpet_access USING GIN (known_emails);
CREATE INDEX idx_red_carpet_email_domains ON red_carpet_access USING GIN (email_domains);
CREATE INDEX idx_red_carpet_slug ON red_carpet_access (slug);
CREATE INDEX idx_red_carpet_active ON red_carpet_access (is_active) WHERE is_active = true;

-- RLS: Anyone can read (Red Carpet is public-facing), only service role can write
ALTER TABLE red_carpet_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Red carpet access is publicly readable"
  ON red_carpet_access FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert red carpet access"
  ON red_carpet_access FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role can update red carpet access"
  ON red_carpet_access FOR UPDATE
  USING (auth.role() = 'service_role');

-- Update platform_canonical
UPDATE platform_canonical SET value = '2126', updated_at = now()
WHERE key = 'innovation_count' AND value::int < 2126;

-- Log innovation
INSERT INTO innovation_log (innovation_number, title, description, category, status)
VALUES (2126, 'Dynamic Red Carpet Access Registry', 'Database-driven recipient lookup replacing hardcoded TypeScript array. New recipients added via Cue Cards, admin, or API are recognized immediately without code deploys.', 'infrastructure', 'implemented')
ON CONFLICT (innovation_number) DO NOTHING;
```

---

## TASK 2: Seed Script — Import Existing Recipients

**New file:** `supabase/migrations/20260331100002_k202_red_carpet_seed.sql`

Read the existing `RECIPIENTS` array from `platform/src/data/redCarpetRecipients.ts` and generate INSERT statements for ALL 71 recipients. Each recipient has:

- `slug` (from the object key / name slugified)
- `name`, `title`, `organization`, `bio`, `purpose`, `whyYou`
- `categories` (array)
- `knownEmails` (array — these go into `known_emails`)
- `emailDomains` (array — these go into `email_domains`)
- `walkthroughConfig` (object → JSONB)
- `initiatives` (array)

**IMPORTANT:** Read the full RECIPIENTS array in `redCarpetRecipients.ts` and generate one INSERT per recipient. Use `ON CONFLICT (slug) DO NOTHING` so the migration is idempotent.

Example pattern:
```sql
INSERT INTO red_carpet_access (slug, name, title, organization, bio, purpose, why_you, categories, known_emails, email_domains, walkthrough_config, initiatives, source)
VALUES (
  'warren-buffett',
  'Warren Buffett',
  'Chairman & CEO',
  'Berkshire Hathaway',
  'The Oracle of Omaha...',
  'French Fleet / $ask initiative',
  'Because you understand...',
  ARRAY['crown'],
  ARRAY['wbuffett@berkshirehathaway.com'],
  ARRAY['berkshirehathaway.com'],
  '{"theme": "gold", "showInitiatives": ["french_fleet"]}'::jsonb,
  ARRAY['french_fleet'],
  'import'
)
ON CONFLICT (slug) DO NOTHING;
```

Generate ALL 71 entries by reading the source file.

---

## TASK 3: Async Lookup Function

**Modify:** `platform/src/data/redCarpetRecipients.ts`

Add a new async function that queries the database FIRST, then falls back to the static array:

```typescript
import { supabase } from '@/lib/supabaseClient';

/**
 * Database-first recipient lookup. Falls back to static array if DB unavailable.
 */
export async function findRecipientByEmailAsync(email: string): Promise<RedCarpetRecipient | null> {
  const normalized = email.toLowerCase().trim();
  const domain = normalized.split('@')[1];
  
  try {
    // 1. Try exact email match in DB
    const { data: exactMatch } = await supabase
      .from('red_carpet_access')
      .select('*')
      .filter('known_emails', 'cs', `{${normalized}}`)
      .eq('is_active', true)
      .limit(1)
      .single();
    
    if (exactMatch) return mapDbToRecipient(exactMatch);
    
    // 2. Try domain match in DB
    if (domain) {
      const { data: domainMatch } = await supabase
        .from('red_carpet_access')
        .select('*')
        .filter('email_domains', 'cs', `{${domain}}`)
        .eq('is_active', true)
        .limit(1)
        .single();
      
      if (domainMatch) return mapDbToRecipient(domainMatch);
    }
    
    // 3. Fallback to static array (during transition / if DB down)
    return findRecipientByEmail(normalized);
  } catch {
    // DB unavailable — use static fallback
    return findRecipientByEmail(normalized);
  }
}

/**
 * Maps a database row to the RedCarpetRecipient interface used by components.
 */
function mapDbToRecipient(row: any): RedCarpetRecipient {
  return {
    name: row.name,
    slug: row.slug,
    title: row.title || '',
    organization: row.organization || '',
    bio: row.bio || '',
    purpose: row.purpose || '',
    whyYou: row.why_you || '',
    categories: row.categories || [],
    knownEmails: row.known_emails || [],
    emailDomains: row.email_domains || [],
    walkthroughConfig: row.walkthrough_config || {},
    initiatives: row.initiatives || [],
  };
}
```

### Update Red Carpet Page

**Modify:** `platform/src/pages/RedCarpet.tsx`

Replace the synchronous `findRecipientByEmail()` call with `findRecipientByEmailAsync()`:

```typescript
// BEFORE:
const recipient = findRecipientByEmail(email);

// AFTER:
const [recipient, setRecipient] = useState<RedCarpetRecipient | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (email) {
    findRecipientByEmailAsync(email)
      .then(setRecipient)
      .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, [email]);
```

Add a brief loading state (spinner or skeleton) while the DB query runs. Keep the existing component logic — just make the lookup async.

Also update `findRecipientBySlug` with a similar async version that queries `red_carpet_access` by slug.

---

## TASK 4: Cue Card → Red Carpet Access Auto-Insert

When a Cue Card email is sent (via `send-transactional-email` edge function with type 'outreach'), the recipient should automatically get an entry in `red_carpet_access`.

**Modify:** The cue card sending flow. After the email sends successfully, insert into `red_carpet_access`:

```typescript
// After successful cue card email send:
await supabase.from('red_carpet_access').upsert({
  slug: generateSlug(recipientName),
  name: recipientName,
  organization: businessName || '',
  purpose: `Cue Card from ${senderName}`,
  known_emails: [recipientEmail.toLowerCase()],
  categories: ['cue-card'],
  source: 'cue_card',
  is_active: true,
}, { onConflict: 'slug' });
```

This way, ANYONE who receives a Cue Card email automatically gets Red Carpet access without a deploy.

---

## VERIFICATION

1. Run migration — `red_carpet_access` table created with 71 seeded recipients
2. Visit `/red-carpet?email=test@berkshirehathaway.com` → Buffett's Red Carpet loads (from DB)
3. Add a NEW email via Supabase dashboard → visit Red Carpet → recognized WITHOUT deploy
4. Kill DB connection (simulate) → fallback to static array works
5. Send a Cue Card → recipient auto-added to `red_carpet_access`
6. Existing slug lookups (`/red-carpet?for=warren-buffett`) still work

---

## DEPLOY

```powershell
cd platform; npx supabase db push; npm run build; firebase deploy --only hosting -P default
```

---

*Knight Session 202 — Bishop B053*
*No more deploys to add a name. The database IS the guest list.*
*FOR THE KEEP!*
