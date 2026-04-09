# K352: Marketplace Storefront Population — Real Shops, Real Products
# Priority: CRITICAL — the Marketplace page is empty placeholder data
# Bishop: B084 | Date: 2026-04-07

## THE PROBLEM

The Marketplace at lianabanyan.com/marketplace shows placeholder storefronts:
- "Boise Business Cards" (crafts_making, Owner: Captain Mike) — links to nothing
- "Sarah's Sourdough" (food_drink, Owner: Sarah Chen) — links to nothing
- "CodeForge Tools" (digital, Owner: DevGuild) — links to nothing

These are fake. No products, no ordering, no production pipeline. A visitor sees an empty promise.

## OBJECTIVE

Replace placeholders with REAL functional storefronts that demonstrate the entire commerce loop:
1. Browse → 2. Order → 3. Threshold/Date trigger → 4. Production → 5. Delivery

## PHASE 1: Cue Card Business Card Shop

Create a real storefront: **"Liana Banyan Cue Cards & Business Cards"**

This shop sells ACTUAL business cards through the Cue Card system:
- Browse Deck Card designs (the 53+ existing cue card templates)
- Customize with member name, contact info, QR code linking to their Cue Card share page
- Order physical printed cards via the production pipeline
- Cost+20% pricing: e.g., 100 cards at $15 (Cost $12.50 + 20%)
- Production triggers when order threshold (50 orders) OR date (14 days) is reached, whichever first
- Uses the Canister System production model (COGS $81.46/unit at 5K scale — adapt for cards)

### Storefront Data:
```sql
INSERT INTO storefronts (name, slug, type, owner_display_name, description, category)
VALUES (
  'Liana Banyan Cue Cards',
  'lb-cue-cards',
  'digital_physical',
  'Liana Banyan Corporation',
  'Custom business cards featuring your Deck Card design, QR code to your Cue Card share page, and Cost+20% pricing. Order individually or join a batch for lower per-unit cost.',
  'crafts_making'
);
```

### Products:
- Standard Business Cards (100 pack) — $15
- Premium Business Cards (100 pack, foil accent) — $25
- Deck Card Prints (large format, 5x7) — $8
- QR Code Stickers (sheet of 20) — $5

### Production Pipeline:
- Tier 1 (1-49 orders): Print-on-demand via Printful API (already configured in secrets)
- Tier 2 (50+ orders): Batch production at lower COGS
- Threshold display: "23 of 50 orders — join to unlock batch pricing"

## PHASE 2: Flagship Vendor Storefront

Create a demonstration storefront showing how an ESTABLISHED business integrates:

**"Montana Makers Collective"** — a fictional but realistic artisan collective

- Shows the Company Island model (Innovation #2162)
- 20% workforce dedication → 40% discount
- Products: handcrafted goods, leatherwork, woodworking
- Demonstrates the full production level system (6 levels from Seed to Diamond)
- Shows how Cost+20% applies to physical goods
- Includes the Boaz Corner (10% of proceeds above goal → community fund)

## PHASE 3: 47 Instagram Creator Storefronts

The Founder already identified 47 Instagram creators. For each:

1. **Pre-populate a storefront** with:
   - Creator name and profile image (from Instagram public data)
   - Category based on their content (food, crafts, art, photography, etc.)
   - 3-5 placeholder product slots ready for them to customize
   - A "Claim This Storefront" CTA that links to their Red Carpet invitation

2. **Battery Dispatch campaigns** for outreach:
   - Each creator gets a personalized email via `send-transactional-email`
   - Email contains: Red Carpet link, storefront preview link, "We built this for you" message
   - Dispatch scheduled in waves (10 per day over 5 days)

3. **Red Carpet entries** for each creator:
   - `red_carpet_registry` with their name, platform, and curated content path
   - Shows: their pre-built storefront + "How It Works" tutorial + Cost+20% explanation

4. **Letter/business plan for each** (generated from template):
   - "We found your work on Instagram. We built you a storefront. Here's how it works."
   - Includes their specific numbers: "Your [product] at $[price], you keep 83.3% = $[amount]"

### Creator Storefront Template:
```sql
INSERT INTO storefronts (name, slug, type, owner_display_name, description, category, status)
VALUES (
  '[Creator Name]''s Studio',
  '[creator-handle]',
  'crafts_making',
  '[Creator Name]',
  'This storefront was prepared for you by the Liana Banyan community. Claim it to customize your products, pricing, and brand.',
  '[category]',
  'pending_claim'  -- Special status: visible but marked as "awaiting creator"
);
```

## PHASE 4: Remove/Replace Placeholder Storefronts

Delete the fake storefronts:
```sql
DELETE FROM storefronts WHERE slug IN ('boise-business-cards', 'sarahs-sourdough', 'codeforge-tools');
-- Or whatever the actual slugs are
```

Replace the "Storefront highlights" section on the Marketplace page with:
1. "Liana Banyan Cue Cards" (real, orderable)
2. "Montana Makers Collective" (demonstration)
3. First 3 of the 47 creator storefronts (awaiting claim)

## PHASE 5: Production Level Integration

Wire the ordering system to actually track thresholds:

```sql
-- When a product reaches its order threshold:
-- 1. Notify the creator
-- 2. Trigger production via Printful API or manual fulfillment
-- 3. Update product status to "In Production"
-- 4. Estimate delivery date
-- 5. Charge customers (Credits or cash)
```

The production_campaigns table already exists. Wire it to storefront products.

## VALIDATION

1. Visit /marketplace — see real storefronts with real products
2. Click a product — see price, Cost+20% breakdown, order button
3. Order button works (even if it just adds to cart/queue)
4. Threshold display shows progress ("23 of 50 orders")
5. Creator storefronts show "Claim This Storefront" CTA
6. Battery Dispatch has campaigns for 47 creators

## REFERENCE

- Storefronts: `storefronts` table + `storefront_items` + `storefront_products`
- Production: `production_campaigns` + `production_orders`
- Cue Cards: `cue_card_campaigns` + `stamped_cue_cards`
- Printful: API token in Supabase secrets (PRINTFUL_API_TOKEN)
- Battery Dispatch: `member_scheduled_posts` + dispatch edge functions
- Red Carpet: `red_carpet_registry` + `red_carpet_recipients`
- Cost+20%: platformMarginPct = 20, creatorKeepsPct = 83.3
- 47 Instagram creators: Founder has the list (ask for it or check Pawn research)

## NOTE ON THE 47 CREATORS

The Founder identified these creators on Instagram. Pawn may have research on them. Check:
- BISHOP_DROPZONE for any creator lists
- Pawn batches for Instagram outreach research
- The existing `red_carpet_registry` for any creator entries

If the list isn't in the codebase, the Founder needs to provide the 47 handles/names.
