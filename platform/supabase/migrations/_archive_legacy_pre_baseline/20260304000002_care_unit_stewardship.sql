-- Migration: Care Unit & Stewardship System
-- Date: 2026-03-04
-- Description: Adds tables for Initiative Deployment Thresholds, AI Advisors, and Human Accountability

-- 1. Initiative Care Units (Tracking Spark to Wildfire tiers)
CREATE TABLE IF NOT EXISTS public.initiative_care_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id TEXT NOT NULL, -- e.g., 'santa_ever_after', 'lets_make_dinner'
    name TEXT NOT NULL,
    current_tier TEXT NOT NULL DEFAULT 'SPARK', -- SPARK, EMBER, FLAME, FIRE, BLAZE, INFERNO, WILDFIRE
    cu_definition TEXT NOT NULL, -- e.g., '1 gift funded', '1 meal served'
    cost_per_cu NUMERIC NOT NULL DEFAULT 0,
    total_cu_funded INTEGER NOT NULL DEFAULT 0,
    total_cu_deployed INTEGER NOT NULL DEFAULT 0,
    ai_advisor_name TEXT NOT NULL, -- e.g., 'DANEEL', 'JARVIS'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Stewardship Applications (The Vetting Process)
CREATE TABLE IF NOT EXISTS public.stewardship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    initiative_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, vetting, approved, rejected
    legal_name TEXT NOT NULL,
    id_verified BOOLEAN NOT NULL DEFAULT FALSE,
    background_summary TEXT,
    scenario_responses JSONB, -- Answers to "what would you do if..."
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Stewardship Backers (The Six-Person Verification & Pledge)
CREATE TABLE IF NOT EXISTS public.stewardship_backers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.stewardship_applications(id) ON DELETE CASCADE,
    backer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL, -- 'known' (family/friend) or 'unknown' (community verifier)
    pledge_amount_credits NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pledged', -- pledged, escrowed, released, forfeited
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Command Paths (Transfer of Authority)
CREATE TABLE IF NOT EXISTS public.command_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id TEXT NOT NULL,
    current_steward_id UUID REFERENCES auth.users(id), -- Can be null if Founder holds it
    delegation_level TEXT NOT NULL DEFAULT 'full_steward', -- full_steward, operations_rep, communications_rep
    transferred_at TIMESTAMPTZ,
    probation_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.initiative_care_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_backers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.command_paths ENABLE ROW LEVEL SECURITY;

-- Basic read access for public data
CREATE POLICY "Public can view initiative care units" ON public.initiative_care_units FOR SELECT USING (true);
CREATE POLICY "Public can view command paths" ON public.command_paths FOR SELECT USING (true);

-- Users can view their own applications and pledges
CREATE POLICY "Users can view own applications" ON public.stewardship_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own pledges" ON public.stewardship_backers FOR SELECT USING (auth.uid() = backer_user_id);
