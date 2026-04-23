-- K308: Storefront Builder draft persistence

CREATE TABLE IF NOT EXISTS storefront_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storefront_type TEXT NOT NULL CHECK (storefront_type IN ('food', 'crafts', 'services', 'digital')),
  template_id TEXT,
  import_source TEXT NOT NULL DEFAULT 'start_fresh' CHECK (import_source IN ('start_fresh', 'etsy', 'shopify')),
  current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 5),
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready_to_publish', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES storefront_drafts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  cost NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'start_fresh' CHECK (source IN ('start_fresh', 'etsy', 'shopify')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE storefront_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Storefront drafts owner select" ON storefront_drafts;
DROP POLICY IF EXISTS "Storefront drafts owner insert" ON storefront_drafts;
DROP POLICY IF EXISTS "Storefront drafts owner update" ON storefront_drafts;
DROP POLICY IF EXISTS "Storefront drafts owner delete" ON storefront_drafts;

CREATE POLICY "Storefront drafts owner select" ON storefront_drafts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Storefront drafts owner insert" ON storefront_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Storefront drafts owner update" ON storefront_drafts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Storefront drafts owner delete" ON storefront_drafts
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Product drafts owner select" ON product_drafts;
DROP POLICY IF EXISTS "Product drafts owner insert" ON product_drafts;
DROP POLICY IF EXISTS "Product drafts owner update" ON product_drafts;
DROP POLICY IF EXISTS "Product drafts owner delete" ON product_drafts;

CREATE POLICY "Product drafts owner select" ON product_drafts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Product drafts owner insert" ON product_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Product drafts owner update" ON product_drafts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Product drafts owner delete" ON product_drafts
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_storefront_drafts_user_status ON storefront_drafts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_storefront_drafts_updated_at ON storefront_drafts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_drafts_draft_id ON product_drafts(draft_id);
