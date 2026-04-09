# KNIGHT SESSION 119: One-Click Social Import + Bridge-to-Local

## Brief
Call `brief_me("one-click social import, bridge to local, reddit discord integration, external service linking")`

## Context
K116: Turn-Key + Cue Cards (DEPLOYED). K117: Red Carpet Pre-Population (demand signals). K118: Treasure Maps + "What do you want to do?" flow. K119 completes the onboarding trilogy with the fastest possible creator path: see a Reddit post, click one button, and it becomes a Turn-Key project on the platform.

This combines two innovations:
- **#1944 One-Click Social Import**: External Post → Turn-Key Project Template in 1 click
- **#1947 Bridge-to-Local**: Link external services (Etsy, Square, personal websites) to the platform so creators don't have to abandon their existing tools

Canonical stats: 1,989 innovations | 1,511 claims | 10 provisionals | 22 production systems

**CRITICAL RULE:** Platform tokens/credits are NOT securities. Never use investment language.

## Deliverable 1: Social Import Data Model

### Migration: `20260326000014_social_import.sql`
```sql
-- Source imports
CREATE TABLE IF NOT EXISTS social_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  source_platform TEXT NOT NULL CHECK (source_platform IN ('reddit', 'discord', 'instagram', 'etsy', 'twitter', 'tiktok', 'website', 'manual')),
  source_url TEXT NOT NULL,
  source_title TEXT,
  source_description TEXT,
  source_images JSONB DEFAULT '[]',
  
  -- Import status
  status TEXT DEFAULT 'imported' CHECK (status IN ('imported', 'draft', 'converted')),
  
  -- If converted to a Turn-Key project
  project_id UUID REFERENCES turnkey_projects(id),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bridge-to-Local: External service connections
CREATE TABLE IF NOT EXISTS creator_bridges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('etsy', 'shopify', 'square', 'stripe', 'paypal', 'website', 'instagram_shop', 'facebook_marketplace')),
  service_url TEXT NOT NULL,
  display_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, service_type)
);

ALTER TABLE social_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_bridges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own imports" ON social_imports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bridges" ON creator_bridges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view bridges" ON creator_bridges FOR SELECT USING (true);
```

## Deliverable 2: Social Import Flow

### The One-Click Path

**Entry Point 1: Browser Bookmarklet**
- User drags a bookmarklet to their browser bar
- On any page (Reddit post, Etsy listing, Instagram post), click bookmarklet
- Opens `/import?url=[encoded_url]` in a new tab
- Platform auto-extracts: title, description, images, source platform

**Entry Point 2: Paste URL**
- Page: `/import`
- Single text input: "Paste a link to your product, post, or listing"
- On paste: auto-detect platform, extract metadata via OpenGraph/meta tags
- Show preview of extracted content

**Entry Point 3: From Red Carpet Showcase**
- Admin pastes URL in showcase admin → auto-extracts for pre-population

### Components
- `SocialImportPage.tsx` — The `/import` page with URL input + preview
- `ImportPreview.tsx` — Shows extracted title, description, images from source
- `ImportToProjectWizard.tsx` — Converts import → Turn-Key project (2 steps: confirm extracted data → select Cue Card → launch)
- `BookmarkletInstructions.tsx` — Drag-and-drop bookmarklet setup guide

### Hooks
- `useExtractFromUrl(url)` — server-side extraction of title, description, images from URL (via Supabase Edge Function)
- `useCreateImport()` — save import record
- `useConvertImport(importId)` — convert import to Turn-Key project

### Supabase Edge Function: `extract-url-metadata`
```typescript
// Fetches URL, extracts OpenGraph meta tags
// Returns: { title, description, images[], platform, source_url }
// Works for: Reddit (og:title, og:description, og:image)
//            Etsy (og:title, og:description, product images)
//            Instagram (og:title, og:description, og:image)
//            Any page with OpenGraph tags
```

## Deliverable 3: Bridge-to-Local Setup

### Creator Profile → "Connected Services" Section

On the creator's profile/dashboard, add a "Connected Services" panel:

```
┌─────────────────────────────────────────────────────┐
│  🔗 Connected Services                               │
│                                                       │
│  Connect your existing shop so customers can find     │
│  you everywhere.                                      │
│                                                       │
│  ✅ Etsy — "JonesLeatherCo" [Edit] [Remove]          │
│  ✅ Personal Website — jonesleather.com [Edit]        │
│  ○  Square — Not connected [Connect →]                │
│  ○  Shopify — Not connected [Connect →]               │
│  ○  Instagram Shop — Not connected [Connect →]        │
│                                                       │
│  [+ Add Another Service]                              │
└─────────────────────────────────────────────────────┘
```

### How Bridges Display on Project Pages

On a Turn-Key project detail page, connected services show as:
```
Also available on:
[Etsy icon] Etsy  |  [Globe icon] jonesleather.com  |  [Square icon] Square
```

These are outbound links — we're SENDING traffic to the creator's other shops, not capturing it. This is the platform's value proposition: "We help you sell more, everywhere."

### Components
- `ConnectedServices.tsx` — Dashboard panel for managing bridges
- `AddBridgeModal.tsx` — Form to connect a new service (type, URL, display name)
- `BridgeLinks.tsx` — Display component for project pages showing connected services
- `BridgeVerification.tsx` — Simple verification flow (paste URL → we check it loads → verified)

### Hooks
- `useCreatorBridges(userId)` — fetch bridges for a creator
- `useManageBridge()` — create/update/delete bridge connections

## Deliverable 4: Integration Points

### Turn-Key Project Detail → Bridge Links
- Add `BridgeLinks` component below the project description
- Only shows if creator has connected services
- Styled as subtle, helpful links (not competing with the backing CTA)

### Import → Wizard Pre-Fill
- When importing from a URL, auto-detect if the source platform matches a Cue Card
- Pre-fill the Turn-Key wizard: title, description, category, images
- User just confirms and clicks "Launch"

### Red Carpet Admin → Import Integration
- On the admin showcase page (/admin/showcase from K117), the URL extraction uses the same Edge Function
- Admin pastes URL → metadata extracted → pre-fills showcase form

### Treasure Map Step 4 → Bridge Setup
- Treasure Map step "Connect Your Existing Shop" links directly to `/dashboard/bridges`

## Deliverable 5: Navigation + Wiring

### App.tsx Routes
```tsx
<Route path="/import" element={<ProtectedRoute><SocialImportPage /></ProtectedRoute>} />
<Route path="/dashboard/bridges" element={<ProtectedRoute><ConnectedServicesPage /></ProtectedRoute>} />
```

### UnifiedNavigation
- Add "Import a Product" → `/import` under Tools/Utilities section

### Canonical Stats
- `innovationCount: 1989` (no change)

## Build + Deploy
Build and deploy all 8 hosting targets + Supabase Edge Function.

## Quality Checks
- [ ] URL paste extracts metadata correctly for Reddit, Etsy, Instagram
- [ ] Import converts to Turn-Key project with pre-filled data
- [ ] Bridge connections save and display on project pages
- [ ] Bridge links are outbound (open in new tab)
- [ ] Bookmarklet works from Reddit and Etsy
- [ ] Import from Red Carpet admin uses same extraction
- [ ] All 8 Firebase targets deployed

## FOR THE KEEP.
