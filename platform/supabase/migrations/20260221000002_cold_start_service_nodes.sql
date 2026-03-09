-- COLD START THESEUS: Service Node System
-- =========================================
-- Economic Law #9: Pre-ordered capacity scheduling eliminates startup risk
-- 
-- Core Principle: Risk = 0 when Demand(pre-sold) ≥ Capacity(scheduled) × 0.5
-- 
-- Node Types:
-- - Church kitchens (unused weekdays)
-- - Food truck operators (provide license)
-- - Closed restaurants (off-hours)
-- - Home kitchens (cottage food laws)
-- - Shared facilities (pooled resources)

-- Service Node Types
CREATE TABLE IF NOT EXISTS service_node_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    initiative_id UUID REFERENCES initiatives(id),
    capacity_unit TEXT NOT NULL DEFAULT 'jobs', -- 'meals', 'jobs', 'sessions', etc.
    min_presale_percent INTEGER NOT NULL DEFAULT 50, -- The 50% rule
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Nodes (the actual locations/operations)
CREATE TABLE IF NOT EXISTS service_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_type_id UUID REFERENCES service_node_types(id),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Location
    zip_code TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'USA',
    address TEXT,
    geo_lat DECIMAL(10, 8),
    geo_lng DECIMAL(11, 8),
    
    -- Infrastructure
    infrastructure_type TEXT NOT NULL, -- 'church_kitchen', 'food_truck', 'restaurant', 'home_kitchen', 'shared_facility'
    infrastructure_details JSONB DEFAULT '{}',
    
    -- Capacity
    weekly_capacity INTEGER NOT NULL DEFAULT 100, -- e.g., 100 meals/week
    presold_capacity INTEGER DEFAULT 0,
    reserved_capacity INTEGER DEFAULT 0, -- 50% for surge/redundancy
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending_activation',
    -- pending_activation: Collecting demand
    -- activating: 50% threshold reached, setting up
    -- active: Operating
    -- paused: Temporarily inactive
    -- closed: Permanently closed
    
    activation_threshold INTEGER, -- Auto-calculated: weekly_capacity * 0.5
    activation_date DATE,
    
    -- Ownership
    owner_id UUID REFERENCES auth.users(id),
    captain_id UUID REFERENCES auth.users(id), -- License holder
    
    -- Economics
    platform_fee_percent DECIMAL(5, 2) DEFAULT 20.00, -- Cost + 20%
    creator_share_percent DECIMAL(5, 2) DEFAULT 83.33,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Node Leadership (Captains, XOs, Guild Members)
CREATE TABLE IF NOT EXISTS node_leadership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES service_nodes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    role TEXT NOT NULL, -- 'captain', 'xo', 'guild_member', 'volunteer'
    
    -- License info (for Captains)
    license_type TEXT, -- 'food_truck', 'commercial_kitchen', 'cottage_food', 'restaurant'
    license_number TEXT,
    license_expiry DATE,
    license_verified BOOLEAN DEFAULT FALSE,
    
    -- Rotation
    rotation_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Compensation clarity
    is_platform_employee BOOLEAN DEFAULT FALSE, -- Always false per patent
    owns_project BOOLEAN DEFAULT TRUE, -- They own their project
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-Orders (Ghost Credits → Soft Pledge → Hard Order)
CREATE TABLE IF NOT EXISTS node_preorders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES service_nodes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    -- Order details
    service_type TEXT, -- 'meal', 'delivery', 'catering', etc.
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Commitment phase
    phase TEXT NOT NULL DEFAULT 'ghost',
    -- ghost: Interest signal (fake credits)
    -- soft_pledge: Committed, refundable
    -- hard_order: Non-refundable, 50% paid
    
    -- Payment
    upfront_amount DECIMAL(10, 2) DEFAULT 0, -- 50% at hard_order
    completion_amount DECIMAL(10, 2) DEFAULT 0, -- 50% on delivery
    upfront_paid BOOLEAN DEFAULT FALSE,
    completion_paid BOOLEAN DEFAULT FALSE,
    
    -- Scheduling
    requested_date DATE,
    requested_time TIME,
    scheduled_date DATE,
    scheduled_time TIME,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending',
    -- pending: Awaiting node activation
    -- scheduled: Node active, order scheduled
    -- in_progress: Being prepared
    -- ready: Ready for pickup/delivery
    -- completed: Delivered, completion payment collected
    -- cancelled: Cancelled (refund if soft_pledge)
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demand Aggregation (Ghost Credits accumulation)
CREATE TABLE IF NOT EXISTS demand_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zip_code TEXT NOT NULL,
    service_type TEXT NOT NULL, -- 'meal_delivery', 'catering', 'baked_goods', etc.
    user_id UUID REFERENCES auth.users(id),
    
    -- Ghost credits used
    ghost_credits_spent INTEGER DEFAULT 0,
    marks_pledged DECIMAL(10, 2) DEFAULT 0,
    
    -- Demand details
    requested_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'one_time'
    max_price_willing DECIMAL(10, 2),
    dietary_requirements TEXT[],
    notes TEXT,
    
    -- Aggregation
    is_aggregated BOOLEAN DEFAULT FALSE,
    aggregated_into_node_id UUID REFERENCES service_nodes(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Node Activation Log (tracks the "shifting into gear" moment)
CREATE TABLE IF NOT EXISTS node_activation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES service_nodes(id) ON DELETE CASCADE,
    
    -- Metrics at activation
    presold_count INTEGER NOT NULL,
    presold_percent DECIMAL(5, 2) NOT NULL,
    total_demand_signals INTEGER,
    upfront_revenue DECIMAL(10, 2),
    
    -- The moment
    activation_timestamp TIMESTAMPTZ DEFAULT NOW(),
    activated_by UUID REFERENCES auth.users(id),
    
    -- Notes
    notes TEXT
);

-- Seed service node types for Let's Make Dinner
INSERT INTO service_node_types (code, name, description, capacity_unit, min_presale_percent)
VALUES 
    ('lmd_kitchen', 'Let''s Make Dinner Kitchen', 'Community kitchen node for meal preparation', 'meals', 50),
    ('lmd_delivery', 'Let''s Make Dinner Delivery', 'Delivery node for meal distribution', 'deliveries', 50),
    ('lmb_bakery', 'Let''s Make Bread Bakery', 'Community bakery node for baked goods', 'items', 50),
    ('lgg_hub', 'Let''s Get Groceries Hub', 'Grocery coordination and distribution hub', 'orders', 50),
    ('lgs_shop', 'Let''s Go Shopping Store', 'Community retail coordination node', 'orders', 50)
ON CONFLICT (code) DO NOTHING;

-- Function to calculate activation threshold
CREATE OR REPLACE FUNCTION calculate_activation_threshold()
RETURNS TRIGGER AS $$
BEGIN
    NEW.activation_threshold := CEIL(NEW.weekly_capacity * 0.5);
    NEW.reserved_capacity := CEIL(NEW.weekly_capacity * 0.5);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate thresholds
DROP TRIGGER IF EXISTS set_activation_threshold ON service_nodes;
CREATE TRIGGER set_activation_threshold
    BEFORE INSERT OR UPDATE OF weekly_capacity ON service_nodes
    FOR EACH ROW
    EXECUTE FUNCTION calculate_activation_threshold();

-- Function to check if node should activate
CREATE OR REPLACE FUNCTION check_node_activation()
RETURNS TRIGGER AS $$
DECLARE
    node_record RECORD;
    presold_count INTEGER;
BEGIN
    -- Get the node
    SELECT * INTO node_record FROM service_nodes WHERE id = NEW.node_id;
    
    -- Only check if node is pending activation
    IF node_record.status != 'pending_activation' THEN
        RETURN NEW;
    END IF;
    
    -- Count hard orders for this node
    SELECT COUNT(*) INTO presold_count
    FROM node_preorders
    WHERE node_id = NEW.node_id
    AND phase = 'hard_order'
    AND status = 'pending';
    
    -- Check if threshold reached
    IF presold_count >= node_record.activation_threshold THEN
        -- Activate the node!
        UPDATE service_nodes
        SET status = 'activating',
            presold_capacity = presold_count,
            activation_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = NEW.node_id;
        
        -- Log the activation
        INSERT INTO node_activation_log (
            node_id,
            presold_count,
            presold_percent,
            upfront_revenue,
            notes
        )
        SELECT 
            NEW.node_id,
            presold_count,
            (presold_count::DECIMAL / node_record.activation_threshold) * 100,
            SUM(upfront_amount),
            'Automatic activation: 50% threshold reached'
        FROM node_preorders
        WHERE node_id = NEW.node_id
        AND phase = 'hard_order';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check activation on new hard orders
DROP TRIGGER IF EXISTS check_activation_on_preorder ON node_preorders;
CREATE TRIGGER check_activation_on_preorder
    AFTER INSERT OR UPDATE OF phase ON node_preorders
    FOR EACH ROW
    WHEN (NEW.phase = 'hard_order')
    EXECUTE FUNCTION check_node_activation();

-- View for node status dashboard
CREATE OR REPLACE VIEW node_status_dashboard AS
SELECT 
    sn.id,
    sn.name,
    sn.zip_code,
    sn.city,
    sn.state,
    sn.infrastructure_type,
    sn.weekly_capacity,
    sn.activation_threshold,
    sn.status,
    snt.name as node_type_name,
    snt.capacity_unit,
    
    -- Demand metrics
    (SELECT COUNT(*) FROM demand_signals ds WHERE ds.zip_code = sn.zip_code AND NOT ds.is_aggregated) as pending_demand_signals,
    
    -- Pre-order metrics
    (SELECT COUNT(*) FROM node_preorders np WHERE np.node_id = sn.id AND np.phase = 'ghost') as ghost_interest,
    (SELECT COUNT(*) FROM node_preorders np WHERE np.node_id = sn.id AND np.phase = 'soft_pledge') as soft_pledges,
    (SELECT COUNT(*) FROM node_preorders np WHERE np.node_id = sn.id AND np.phase = 'hard_order') as hard_orders,
    
    -- Progress to activation
    CASE 
        WHEN sn.activation_threshold > 0 THEN
            ROUND(
                (SELECT COUNT(*)::DECIMAL FROM node_preorders np 
                 WHERE np.node_id = sn.id AND np.phase = 'hard_order') 
                / sn.activation_threshold * 100, 1
            )
        ELSE 0
    END as activation_progress_percent,
    
    -- Revenue metrics
    (SELECT COALESCE(SUM(upfront_amount), 0) FROM node_preorders np 
     WHERE np.node_id = sn.id AND np.upfront_paid = TRUE) as collected_upfront,
    
    -- Leadership
    (SELECT display_name FROM profiles p 
     JOIN node_leadership nl ON nl.user_id = p.id 
     WHERE nl.node_id = sn.id AND nl.role = 'captain' AND nl.is_active = TRUE
     LIMIT 1) as captain_name

FROM service_nodes sn
LEFT JOIN service_node_types snt ON sn.node_type_id = snt.id;

-- RLS Policies
ALTER TABLE service_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_preorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_signals ENABLE ROW LEVEL SECURITY;

-- Anyone can view active nodes
CREATE POLICY "Anyone can view active nodes"
    ON service_nodes FOR SELECT
    USING (status IN ('active', 'activating', 'pending_activation'));

-- Node owners and captains can update their nodes
CREATE POLICY "Owners and captains can update nodes"
    ON service_nodes FOR UPDATE
    USING (
        auth.uid() = owner_id 
        OR auth.uid() = captain_id
        OR EXISTS (
            SELECT 1 FROM node_leadership nl 
            WHERE nl.node_id = id 
            AND nl.user_id = auth.uid() 
            AND nl.role IN ('captain', 'xo')
        )
    );

-- Anyone can create demand signals
CREATE POLICY "Anyone can create demand signals"
    ON demand_signals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can view their own demand signals
CREATE POLICY "Users can view own demand signals"
    ON demand_signals FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create and view their own preorders
CREATE POLICY "Users can manage own preorders"
    ON node_preorders FOR ALL
    USING (auth.uid() = user_id);

-- Leadership visible to node members
CREATE POLICY "Leadership visible to members"
    ON node_leadership FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM service_nodes sn 
            WHERE sn.id = node_id 
            AND (sn.owner_id = auth.uid() OR sn.captain_id = auth.uid())
        )
        OR user_id = auth.uid()
    );

COMMENT ON TABLE service_nodes IS 'Cold Start Theseus: Decentralized service nodes with 50% pre-sale activation threshold';
COMMENT ON TABLE node_preorders IS 'Three-phase demand crystallization: Ghost → Soft Pledge → Hard Order';
COMMENT ON TABLE demand_signals IS 'Ghost Credits demand aggregation before node creation';
