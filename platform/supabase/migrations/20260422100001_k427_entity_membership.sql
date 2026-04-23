-- K427 Workstream 2: Entity Membership Tier
-- Cooperative-scoped entity membership (NOT securities, NOT Pedestal Stake)
-- Separate from individual $5/yr membership

-- Entity profiles
CREATE TABLE IF NOT EXISTS entity_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('small_business', 'medium', 'enterprise', 'nonprofit')),
    ein TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'US',
    postal_code TEXT,
    primary_contact_user_id UUID REFERENCES auth.users(id),
    primary_contact_name TEXT NOT NULL,
    primary_contact_email TEXT NOT NULL,
    primary_contact_title TEXT,
    tier_price_usd INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled', 'pledged_commons')),
    kyc_provider TEXT,
    kyc_reference_id TEXT,
    kyc_status TEXT DEFAULT 'not_started' CHECK (kyc_status IN ('not_started', 'pending', 'approved', 'rejected', 'manual_review')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    contract_signed_at TIMESTAMPTZ,
    contract_version TEXT DEFAULT 'stub_v1',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Entity seats (designated employees)
CREATE TABLE IF NOT EXISTS entity_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entity_memberships(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    email TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'removed')),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    removed_at TIMESTAMPTZ
);

-- Seat limits per tier
CREATE TABLE IF NOT EXISTS entity_tier_config (
    tier TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    price_usd INTEGER NOT NULL,
    max_seats INTEGER NOT NULL,
    description TEXT
);

INSERT INTO entity_tier_config (tier, display_name, price_usd, max_seats, description) VALUES
    ('small_business', 'Small Business', 99, 10, 'For teams under 10 employees'),
    ('medium', 'Medium', 499, 100, 'For organizations with 10-100 employees'),
    ('enterprise', 'Enterprise', 2999, 1000, 'For organizations with 100+ employees'),
    ('nonprofit', 'Nonprofit', 0, 50, 'Free under Pledged Commons grant — AGPL + Pledge')
ON CONFLICT (tier) DO NOTHING;

-- Immutable audit log for entity membership actions
CREATE TABLE IF NOT EXISTS entity_membership_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entity_memberships(id),
    action TEXT NOT NULL,
    actor_user_id UUID REFERENCES auth.users(id),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_entity_memberships_status ON entity_memberships(status);
CREATE INDEX IF NOT EXISTS idx_entity_memberships_type ON entity_memberships(entity_type);
CREATE INDEX IF NOT EXISTS idx_entity_memberships_contact ON entity_memberships(primary_contact_user_id);
CREATE INDEX IF NOT EXISTS idx_entity_seats_entity ON entity_seats(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_seats_user ON entity_seats(user_id);
CREATE INDEX IF NOT EXISTS idx_entity_seats_email ON entity_seats(email);
CREATE INDEX IF NOT EXISTS idx_entity_audit_entity ON entity_membership_audit(entity_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_entity_membership_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_entity_membership_updated_at ON entity_memberships;
CREATE TRIGGER trg_entity_membership_updated_at
    BEFORE UPDATE ON entity_memberships
    FOR EACH ROW EXECUTE FUNCTION update_entity_membership_updated_at();

-- RLS
ALTER TABLE entity_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_tier_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_membership_audit ENABLE ROW LEVEL SECURITY;

-- Tier config: public read
DROP POLICY IF EXISTS "tier_config_public_read" ON entity_tier_config;
CREATE POLICY "tier_config_public_read" ON entity_tier_config FOR SELECT USING (true);

-- Entity memberships: contact user can read/update own entity
DROP POLICY IF EXISTS "entity_membership_own_read" ON entity_memberships;
CREATE POLICY "entity_membership_own_read" ON entity_memberships
    FOR SELECT USING (primary_contact_user_id = auth.uid());
DROP POLICY IF EXISTS "entity_membership_own_update" ON entity_memberships;
CREATE POLICY "entity_membership_own_update" ON entity_memberships
    FOR UPDATE USING (primary_contact_user_id = auth.uid());
DROP POLICY IF EXISTS "entity_membership_insert" ON entity_memberships;
CREATE POLICY "entity_membership_insert" ON entity_memberships
    FOR INSERT WITH CHECK (primary_contact_user_id = auth.uid());

-- Seats: entity admin or seat owner can read; entity admin can manage
DROP POLICY IF EXISTS "entity_seats_entity_read" ON entity_seats;
CREATE POLICY "entity_seats_entity_read" ON entity_seats
    FOR SELECT USING (
        entity_id IN (SELECT id FROM entity_memberships WHERE primary_contact_user_id = auth.uid())
        OR user_id = auth.uid()
    );
DROP POLICY IF EXISTS "entity_seats_entity_insert" ON entity_seats;
CREATE POLICY "entity_seats_entity_insert" ON entity_seats
    FOR INSERT WITH CHECK (
        entity_id IN (SELECT id FROM entity_memberships WHERE primary_contact_user_id = auth.uid())
    );
DROP POLICY IF EXISTS "entity_seats_entity_update" ON entity_seats;
CREATE POLICY "entity_seats_entity_update" ON entity_seats
    FOR UPDATE USING (
        entity_id IN (SELECT id FROM entity_memberships WHERE primary_contact_user_id = auth.uid())
    );

-- Audit: write-only for system, read for entity contact
DROP POLICY IF EXISTS "entity_audit_read" ON entity_membership_audit;
CREATE POLICY "entity_audit_read" ON entity_membership_audit
    FOR SELECT USING (
        entity_id IN (SELECT id FROM entity_memberships WHERE primary_contact_user_id = auth.uid())
    );
DROP POLICY IF EXISTS "entity_audit_insert" ON entity_membership_audit;
CREATE POLICY "entity_audit_insert" ON entity_membership_audit
    FOR INSERT WITH CHECK (true);
