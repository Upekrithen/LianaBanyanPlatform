-- ═══════════════════════════════════════════════════════════════
-- MILESTONE 10: STOREFRONT AGGREGATION & QR CUE CARD BOUNTIES
-- ═══════════════════════════════════════════════════════════════

-- ─── BIZ STOREFRONTS (Aggregated Items) ───
-- Allows external businesses (Etsy, Shopify, etc.) to list a few
-- items on the .biz portal without full duplicate data entry.
-- Tied to the "Cold Start C20" philosophy.

CREATE TABLE IF NOT EXISTS public.biz_storefront_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id           UUID NOT NULL REFERENCES public.anchors(id) ON DELETE CASCADE,
  owner_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Item details
  external_item_id    TEXT, -- ID from Shopify, Etsy, etc.
  title               TEXT NOT NULL,
  description         TEXT,
  price_cents         INTEGER NOT NULL,
  currency            TEXT DEFAULT 'USD',
  image_url           TEXT,
  external_url        TEXT NOT NULL, -- Direct link to buy on their actual store

  -- C20 / Platform integration
  is_c20_eligible     BOOLEAN DEFAULT false,
  platform_margin_cents INTEGER DEFAULT 0, -- If sold through us, what is the margin?

  -- Status
  status              TEXT DEFAULT 'active', -- active, paused, out_of_stock

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_biz_storefront_items_anchor ON public.biz_storefront_items(anchor_id);
CREATE INDEX idx_biz_storefront_items_owner ON public.biz_storefront_items(owner_id);

-- ─── QR CUE CARD PRINT BOUNTIES ───
-- Converts the 1 free digital QR Cue Card into a physical print bounty
-- fulfilled by the Salt Mines (volume dump).

CREATE TABLE IF NOT EXISTS public.qr_print_bounties (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cue_card_id         UUID NOT NULL REFERENCES public.cue_card_registry(id),
  requester_id        UUID NOT NULL REFERENCES auth.users(id),

  -- Order details
  quantity            INTEGER NOT NULL DEFAULT 250,
  material_type       TEXT DEFAULT 'standard_cardstock', -- standard_cardstock, nfc_plastic, metal
  shipping_address    JSONB NOT NULL,

  -- Financials (Volume Dump Mechanics)
  total_cost_cents    INTEGER NOT NULL,
  platform_margin_cents INTEGER NOT NULL, -- Cost + 20%
  ip_backing_joules   INTEGER DEFAULT 0, -- Joules backing this physical run

  -- Bounty Status (Salt Mines)
  bounty_status       TEXT DEFAULT 'open', -- open, claimed, printing, shipped, delivered
  claimed_by          UUID REFERENCES auth.users(id), -- The Maker/Printer in the Salt Mines
  claimed_at          TIMESTAMPTZ,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qr_print_bounties_status ON public.qr_print_bounties(bounty_status);
CREATE INDEX idx_qr_print_bounties_requester ON public.qr_print_bounties(requester_id);

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.biz_storefront_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_print_bounties ENABLE ROW LEVEL SECURITY;

-- Storefront items: public read, owner write
CREATE POLICY "Anyone can view storefront items" ON public.biz_storefront_items
  FOR SELECT USING (true);
CREATE POLICY "Owners can manage their storefront items" ON public.biz_storefront_items
  FOR ALL USING (auth.uid() = owner_id);

-- QR Print Bounties: public read (for Salt Mines), requester/claimer write
CREATE POLICY "Anyone can view open print bounties" ON public.qr_print_bounties
  FOR SELECT USING (true);
CREATE POLICY "Requesters can create print bounties" ON public.qr_print_bounties
  FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Requesters can view their own bounties" ON public.qr_print_bounties
  FOR SELECT USING (auth.uid() = requester_id);
CREATE POLICY "Claimers can update their claimed bounties" ON public.qr_print_bounties
  FOR UPDATE USING (auth.uid() = claimed_by);
