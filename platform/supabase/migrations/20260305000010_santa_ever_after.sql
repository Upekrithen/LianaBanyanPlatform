-- Migration: Category 4: Santa Ever After Nomination Protocol
-- Description: Creates the tables for the anti-fraud delivery architecture.

-- 1. santa_nominations
CREATE TABLE IF NOT EXISTS public.santa_nominations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nominator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_address TEXT NOT NULL, -- In a real app, this would be encrypted
    reason_card TEXT NOT NULL, -- "Why They Deserve This"
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'assigned', 'delivered', 'flagged')),
    handshake_code TEXT, -- A 4-digit code generated upon approval
    oops_code TEXT, -- A distress code the recipient can use if they feel unsafe
    jesper_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- The verified local deliverer
    purchaser_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- The person who paid (Purchaser != Deliverer)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.santa_nominations ENABLE ROW LEVEL SECURITY;

-- Nominators can see the nominations they submitted (but they won't see the Jesper's identity)
CREATE POLICY "santa_nominations_select_nominator" 
ON public.santa_nominations FOR SELECT 
USING (nominator_id = (SELECT auth.uid()));

-- Jespers can see nominations assigned to them
CREATE POLICY "santa_nominations_select_jesper" 
ON public.santa_nominations FOR SELECT 
USING (jesper_id = (SELECT auth.uid()));

-- Admins can see all
CREATE POLICY "santa_nominations_select_admin" 
ON public.santa_nominations FOR SELECT 
USING ( (SELECT auth.uid()) IN (SELECT id FROM public.users WHERE role = 'admin') );

-- Anyone authenticated can insert a nomination
CREATE POLICY "santa_nominations_insert" 
ON public.santa_nominations FOR INSERT 
WITH CHECK ( auth.uid() IS NOT NULL );

-- Jespers can update status of their assigned deliveries
CREATE POLICY "santa_nominations_update_jesper" 
ON public.santa_nominations FOR UPDATE 
USING (jesper_id = (SELECT auth.uid()));

-- Admins can update any nomination
CREATE POLICY "santa_nominations_update_admin" 
ON public.santa_nominations FOR UPDATE 
USING ( (SELECT auth.uid()) IN (SELECT id FROM public.users WHERE role = 'admin') );
