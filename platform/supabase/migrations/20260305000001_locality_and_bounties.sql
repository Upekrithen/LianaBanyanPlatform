-- Migration: Locality & QR Cue Card Bounties
-- Date: 2026-03-05
-- Description: Adds geolocation (lat/long) to businesses and garage sales, and creates schema for QR Cue Card print bounties.

-- 1. Add Locality (Lat/Long) to existing geographic tables
ALTER TABLE public.stewardship_applications 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create Local Listings table (expanded from just garage sales)
CREATE TABLE IF NOT EXISTS public.local_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES auth.users(id),
    listing_type TEXT NOT NULL, -- 'garage_sale', 'item', 'business', 'free', 'service'
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    start_time TIMESTAMPTZ, -- Optional for non-events
    end_time TIMESTAMPTZ,   -- Optional for non-events
    accepts_marks BOOLEAN DEFAULT true,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. QR Cue Card Bounties Schema
CREATE TABLE IF NOT EXISTS public.qr_cue_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id),
    project_id UUID, -- Optional link to a specific project/initiative
    card_type TEXT NOT NULL, -- 'digital', 'physical_pending', 'physical_fulfilled'
    qr_hash TEXT UNIQUE NOT NULL, -- The immutable ledger hash
    design_data JSONB, -- The visual design of the card
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.print_bounties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID REFERENCES public.qr_cue_cards(id),
    requester_id UUID REFERENCES auth.users(id),
    fulfiller_id UUID REFERENCES auth.users(id), -- The Salt Mines worker who prints it
    production_level INTEGER NOT NULL CHECK (production_level BETWEEN 1 AND 6),
    quantity INTEGER NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_marks_locked DECIMAL(10, 2) NOT NULL, -- The Captain's collateral
    status TEXT DEFAULT 'open', -- 'open', 'claimed', 'printing', 'shipped', 'delivered'
    delivery_deadline TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.local_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_cue_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_bounties ENABLE ROW LEVEL SECURITY;
