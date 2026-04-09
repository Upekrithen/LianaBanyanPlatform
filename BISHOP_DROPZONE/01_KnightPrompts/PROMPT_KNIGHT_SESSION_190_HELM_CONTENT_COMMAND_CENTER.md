# KNIGHT SESSION 190 — Helm Content Command Center
## Bishop B050 | Founder requires granular control over ALL outbound documents
## CRITICAL: This is how the Founder reviews and approves every document before launch

---

## CONTEXT

The Founder wants to read, review, and approve EVERY outbound document from Helm before it goes anywhere. This includes:
- 100+ letters (Crown, outreach, academic, blessing, sponsorship, political, patron)
- 7+ academic papers (3 reading levels each)
- 23 Pudding essays
- 20+ Cephas articles
- 17+ publication pitches
- 6+ cue card templates
- Media posts and social content
- Press materials

Total: ~300 unique documents across letters/, BISHOP_DROPZONE/, Cephas content, 01 MarkupFiles/.

The Founder needs:
1. A reading surface in Helm to view each document
2. A checklist for each: what it is, where it's going, when, format, frequency
3. Ability to approve/reject/edit each one
4. Status tracking (draft → reviewed → approved → sent/published)

---

## DELIVERABLE 1: Database — Content Command Center

**NEW MIGRATION:**

```sql
-- Helm Content Command Center
-- Master registry of ALL outbound content with Founder review workflow

CREATE TABLE IF NOT EXISTS helm_content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN (
    'crown_letter', 'outreach_letter', 'academic_letter', 'blessing_letter',
    'sponsorship_letter', 'patron_letter', 'political_letter',
    'academic_paper', 'pudding_essay', 'cephas_article', 'cue_card',
    'publication_pitch', 'media_post', 'press_material', 'partnership_letter',
    'social_dispatch', 'red_carpet_config'
  )),
  
  -- Content
  content_markdown TEXT, -- Full document content (rendered in Helm)
  source_file_path TEXT, -- Where the .md file lives on disk
  
  -- Destination
  destination TEXT NOT NULL DEFAULT 'review', -- 'cephas', 'email', 'physical_mail', 'social', 'red_carpet', 'press'
  recipient_name TEXT,
  recipient_email TEXT,
  recipient_handle TEXT, -- Social media handle if applicable
  
  -- Scheduling
  send_when TEXT DEFAULT 'opening_gambit', -- 'immediately', 'opening_gambit', 'battery_dispatch_day_N', 'manual', 'recurring'
  send_frequency TEXT, -- 'once', 'daily', 'weekly' (for social dispatches)
  send_format TEXT DEFAULT 'digital', -- 'digital', 'physical', 'both'
  
  -- Review workflow
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'in_review', 'approved', 'rejected', 'sent', 'published', 'archived'
  )),
  founder_reviewed BOOLEAN DEFAULT false,
  founder_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Metadata
  tags TEXT[],
  priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
  wave INTEGER, -- Which wave of Opening Gambit (1-10)
  attachments JSONB DEFAULT '[]', -- [{name, path, type}]
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE helm_content_queue ENABLE ROW LEVEL SECURITY;

-- Only admin/founder can see and manage
CREATE POLICY "Admin can manage content queue"
  ON helm_content_queue FOR ALL
  USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'founder'))
  );

-- Index for filtering
CREATE INDEX idx_helm_content_status ON helm_content_queue(status);
CREATE INDEX idx_helm_content_type ON helm_content_queue(content_type);
CREATE INDEX idx_helm_content_wave ON helm_content_queue(wave);
```

---

## DELIVERABLE 2: Seed Script — Load ALL Documents

**NEW FILE:** `supabase/migrations/XXXXXXXXXX_seed_helm_content_queue.sql`

Write a seed that inserts ALL known documents. Sources:

**Letters (from letters/ directory):**
- Crown letters: ~22 unique recipients → content_type='crown_letter'
- Outreach: ~28 files → 'outreach_letter'
- Academic: ~8 files → 'academic_letter'  
- Blessing: 3 files → 'blessing_letter'
- Sponsorship: 1 file → 'sponsorship_letter'
- Political Expedition: 4 files → 'political_letter'
- Patron: 4 SEC-FIXED files → 'patron_letter'
- Pitches: 17 files → 'publication_pitch'
- Send-now: already in appropriate categories

**Papers (from BISHOP_DROPZONE/):**
- 7 named papers → content_type='academic_paper'
- Include all 3 reading levels where they exist (at_a_glance, more_details, in_depth)

**Pudding (from BISHOP_DROPZONE/ and Cephas content):**
- 23 pudding essays → content_type='pudding_essay'

**Articles (from Cephas content):**
- ~20 articles → content_type='cephas_article'

**Cue Cards:**
- 6 role cue cards → content_type='cue_card'

For each, set:
- `slug` from filename (kebab-case)
- `title` from document header
- `source_file_path` to the actual file location
- `content_markdown` loaded from the file if possible (or leave NULL for Knight to backfill)
- `destination` based on type (letters→'email', papers→'cephas', pitches→'email', etc.)
- `recipient_name` for letters
- `status` = 'draft' for everything (Founder reviews all)
- `wave` based on the B049 Wave 1 manifest assignments
- `priority` based on Crown (1) vs Academic (3) vs Pitch (5)

---

## DELIVERABLE 3: Helm Content Command Center Page

**NEW FILE:** `src/pages/HelmContentCenter.tsx`

A full-featured content management page at `/helm/content`:

### Layout:
- **Header:** "Content Command Center — {X} documents, {Y} approved, {Z} pending review"
- **Filter bar:** Filter by content_type, status, wave, destination, priority
- **Search:** Full-text search across title and content_markdown

### Document List (left panel or main area):
- Card grid or table view (toggle)
- Each card shows: title, type badge, recipient, destination, status badge, wave, priority
- Sort by: priority, type, status, wave, recipient name
- Bulk actions: approve selected, set wave, change status

### Document Reader (right panel or modal):
- Full markdown rendering of the document
- Rendered with proper formatting (headers, tables, lists, bold/italic)
- Use a markdown renderer component (remark or similar — check what's already in the project)

### Review Controls (below reader):
- **Status selector:** draft → in_review → approved → rejected → sent
- **Founder notes:** Free text field for comments/corrections
- **Destination:** dropdown (cephas, email, physical_mail, social, red_carpet, press)
- **Send when:** dropdown (immediately, opening_gambit, battery_dispatch_day_N, manual)
- **Send format:** radio (digital, physical, both)
- **Wave assignment:** number input (1-10)
- **Attachments:** list of assigned attachments with add/remove
- **Approve button** (green, large) — sets status='approved', founder_reviewed=true, approved_at=now()
- **Reject button** (red) — sets status='rejected' with required notes
- **Skip button** (gray) — moves to next document without changing status

### Keyboard shortcuts:
- `A` = approve, `R` = reject, `S` = skip to next, `←`/`→` = prev/next document

---

## DELIVERABLE 4: Helm Integration

**MODIFY:** `HelmPage.tsx`

Add a prominent card at the top of Helm:

```
Content Command Center
{approved}/{total} documents reviewed
{pending} awaiting your review
[Open Command Center →]
```

Link to `/helm/content`.

Also add to sidebar: "Content Center" with FileText icon, under Helm section.

---

## DELIVERABLE 5: Wire Plugs to Helm

**MODIFY:** The Content Command Center page

For documents with `destination='social'` or `send_format='social'`:
- Show "Post via Plugs" button
- Queries `user_social_plugs` for connected platforms
- Shows checkboxes for each connected platform (Instagram, Twitter/X, LinkedIn, etc.)
- "Compose & Schedule" button opens a simplified version of DispatchComposePage
- Or directly link to `/dispatch/compose?content_id={id}` pre-filled with the document content

For cue cards:
- Show "Share Cue Card" button that generates a shareable link + QR code
- Use existing QR generation from CueCardGenerator

---

## DELIVERABLE 6: Stats + Deploy

- Update useCanonicalStats: knightSessions=190
- Build: zero errors
- Deploy all 8 targets

---

## CRITICAL RULES

- Cost + 20% is CONSTITUTIONAL.
- Entity is Liana Banyan CORPORATION. NOT an LLC.
- SEC-clean language in ALL content. No "will earn", "guaranteed returns", "blockchain".
- The Founder reviews EVERYTHING before it goes out. No auto-sending.
- Hugo content also gets updated until one week after Opening Gambit fires.

---

## BUILD + DEPLOY CHECKLIST

```
[ ] helm_content_queue table migration
[ ] Seed ALL documents into queue (~300 rows)
[ ] HelmContentCenter.tsx page with reader + review controls
[ ] Filter/search/sort functionality
[ ] Markdown rendering in reader panel
[ ] Approve/reject/skip workflow
[ ] Keyboard shortcuts
[ ] Wire Plugs for social destinations
[ ] QR sharing for cue cards
[ ] Helm card + sidebar entry
[ ] Update canonical stats
[ ] Build: zero errors
[ ] Deploy all 8 targets
```

---

*Knight Session 190 — Bishop (Foreman), B050*
*Content Command Center — Founder reviews ALL 300 documents before launch.*
*FOR THE KEEP!*