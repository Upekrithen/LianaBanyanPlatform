-- ============================================================================
-- BUSINESS SIMULATION TEMPLATES
-- Seeds factor templates for all 16 initiatives + Custom
-- For use with Contingency Operators (Innovation #1188)
-- ============================================================================

-- Drop existing policies first (idempotent)
DROP POLICY IF EXISTS "templates_select" ON public.co_factor_templates;

-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.co_factor_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  factors jsonb NOT NULL DEFAULT '[]'::jsonb,
  category text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.co_factor_templates ENABLE ROW LEVEL SECURITY;

-- Allow all to read
CREATE POLICY "templates_select" ON public.co_factor_templates
  FOR SELECT USING (true);

-- ============================================================================
-- FOOD & HOME INITIATIVES
-- ============================================================================

-- Let's Make Dinner
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'Let''s Make Dinner',
  'Neighbors feeding neighbors - Cost+20% meal delivery',
  'food',
  true,
  '[
    {"name": "Order Volume", "weight": 0.25, "description": "Number of meal orders per week"},
    {"name": "Average Order Value", "weight": 0.20, "description": "Typical order amount ($25-$50)"},
    {"name": "Cook Availability", "weight": 0.15, "description": "Hours available for cooking"},
    {"name": "Delivery Range", "weight": 0.10, "description": "Geographic service area"},
    {"name": "Customer Retention", "weight": 0.15, "description": "Repeat customer rate"},
    {"name": "Food Cost", "weight": 0.15, "description": "Ingredient costs as % of price"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Let's Get Groceries
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'Let''s Get Groceries',
  'Volume purchasing power through demand aggregation',
  'food',
  true,
  '[
    {"name": "Order Aggregation", "weight": 0.25, "description": "Volume discount from pooling"},
    {"name": "Delivery Efficiency", "weight": 0.20, "description": "Orders per delivery run"},
    {"name": "Supplier Relationships", "weight": 0.15, "description": "Wholesale pricing access"},
    {"name": "Inventory Turnover", "weight": 0.15, "description": "Fresh stock management"},
    {"name": "Customer Density", "weight": 0.15, "description": "Households per square mile"},
    {"name": "Basket Size", "weight": 0.10, "description": "Items per order"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Let's Go Shopping
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'Let''s Go Shopping',
  'Cooperative buying power with volume discount tiers',
  'food',
  true,
  '[
    {"name": "Group Size", "weight": 0.25, "description": "Members in buying group"},
    {"name": "Category Diversity", "weight": 0.15, "description": "Product categories covered"},
    {"name": "Vendor Negotiation", "weight": 0.20, "description": "Discount levels achieved (5-20%)"},
    {"name": "Order Coordination", "weight": 0.15, "description": "Logistics efficiency"},
    {"name": "Member Participation", "weight": 0.15, "description": "Active member ratio"},
    {"name": "Volume Tier", "weight": 0.10, "description": "Current discount tier"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Household Concierge
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'Household Concierge',
  'World-class home management services',
  'food',
  true,
  '[
    {"name": "Service Hours", "weight": 0.25, "description": "Hours of service per client"},
    {"name": "Client Retention", "weight": 0.20, "description": "Long-term relationship rate"},
    {"name": "Service Range", "weight": 0.15, "description": "Types of services offered"},
    {"name": "Referral Rate", "weight": 0.15, "description": "New clients from referrals"},
    {"name": "Premium Services", "weight": 0.15, "description": "High-margin service mix"},
    {"name": "Scheduling Efficiency", "weight": 0.10, "description": "Utilization of time"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- The Family Table
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'The Family Table',
  'Intergenerational connection + Do The Swoop',
  'food',
  true,
  '[
    {"name": "Meal Planning", "weight": 0.20, "description": "Weekly meal coordination"},
    {"name": "Family Participation", "weight": 0.20, "description": "Household engagement"},
    {"name": "Dietary Compliance", "weight": 0.15, "description": "Special needs accommodation"},
    {"name": "Waste Reduction", "weight": 0.15, "description": "Food waste minimization"},
    {"name": "Swoop Success", "weight": 0.15, "description": "Last-mile delivery wins"},
    {"name": "Community Integration", "weight": 0.15, "description": "Cross-household sharing"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- HEALTH & SAFETY INITIATIVES
-- ============================================================================

-- LifeLine Medications
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'LifeLine Medications',
  'Affordable prescriptions through community pooling',
  'health',
  true,
  '[
    {"name": "Medication Pool Size", "weight": 0.25, "description": "Formulary breadth"},
    {"name": "Savings Rate", "weight": 0.25, "description": "Discount vs retail"},
    {"name": "Compliance Rate", "weight": 0.20, "description": "Prescription adherence"},
    {"name": "Bulk Purchasing", "weight": 0.15, "description": "Volume discount levels"},
    {"name": "Distribution Efficiency", "weight": 0.15, "description": "Delivery logistics"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- MSA
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'MSA',
  'Medical savings accounts for community health',
  'health',
  true,
  '[
    {"name": "Account Balance", "weight": 0.25, "description": "Average account size"},
    {"name": "Contribution Rate", "weight": 0.20, "description": "Regular deposits"},
    {"name": "Utilization Rate", "weight": 0.20, "description": "Funds used for care"},
    {"name": "Network Discounts", "weight": 0.20, "description": "Provider savings"},
    {"name": "Member Growth", "weight": 0.15, "description": "New account signups"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Defense Klaus
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'Defense Klaus',
  'Personal safety devices - For Someone You Love',
  'health',
  true,
  '[
    {"name": "Product Sales", "weight": 0.25, "description": "Device unit sales"},
    {"name": "Subscription Revenue", "weight": 0.20, "description": "Monitoring services"},
    {"name": "Network Coverage", "weight": 0.15, "description": "Response availability"},
    {"name": "Device Reliability", "weight": 0.15, "description": "Uptime and performance"},
    {"name": "Training Completion", "weight": 0.15, "description": "User preparedness"},
    {"name": "Response Time", "weight": 0.10, "description": "Emergency response speed"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Rally Group
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'Rally Group',
  'Crisis response everywhere - volunteer network',
  'health',
  true,
  '[
    {"name": "Volunteer Availability", "weight": 0.25, "description": "Active responders"},
    {"name": "Response Time", "weight": 0.25, "description": "Minutes to arrival"},
    {"name": "Geographic Coverage", "weight": 0.20, "description": "Service area density"},
    {"name": "Training Level", "weight": 0.15, "description": "Responder certification"},
    {"name": "Community Trust", "weight": 0.15, "description": "Public confidence"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FINANCE & WORK INITIATIVES
-- ============================================================================

-- VSL
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'VSL',
  'Village savings & loans - community finance',
  'finance',
  true,
  '[
    {"name": "Savings Pool", "weight": 0.25, "description": "Total community savings"},
    {"name": "Loan Repayment", "weight": 0.25, "description": "On-time repayment rate"},
    {"name": "Member Participation", "weight": 0.20, "description": "Active savers ratio"},
    {"name": "Interest Spread", "weight": 0.15, "description": "Lending margin"},
    {"name": "Default Rate", "weight": 0.15, "description": "Non-performing loans"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Let's Make Bread
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'Let''s Make Bread',
  'Cooperative manufacturing - 3/5 platform, 2/5 personal',
  'finance',
  true,
  '[
    {"name": "Production Capacity", "weight": 0.20, "description": "Items per week capability"},
    {"name": "Material Costs", "weight": 0.20, "description": "Raw material expenses"},
    {"name": "Rush Order Ratio", "weight": 0.15, "description": "50% premium orders"},
    {"name": "Equipment Utilization", "weight": 0.15, "description": "Machine uptime"},
    {"name": "Quality Rejection Rate", "weight": 0.10, "description": "Failed prints/items"},
    {"name": "Personal Time Allocation", "weight": 0.20, "description": "2/5 days for own projects"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Harper Guild
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'Harper Guild',
  'HR & ethics review services',
  'finance',
  true,
  '[
    {"name": "Review Volume", "weight": 0.25, "description": "Cases reviewed per week"},
    {"name": "Quality Score", "weight": 0.25, "description": "Review accuracy rating"},
    {"name": "Turnaround Time", "weight": 0.20, "description": "Review completion speed"},
    {"name": "Specialization", "weight": 0.15, "description": "Expertise depth"},
    {"name": "Reputation", "weight": 0.15, "description": "Community trust score"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CREATIVE & LEARNING INITIATIVES
-- ============================================================================

-- JukeBox
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'JukeBox',
  'Fair music licensing - 83.3% to artists',
  'creative',
  true,
  '[
    {"name": "Catalog Size", "weight": 0.20, "description": "Tracks available"},
    {"name": "Licensing Revenue", "weight": 0.25, "description": "Per-play earnings"},
    {"name": "Artist Payout", "weight": 0.20, "description": "83.3% to creators"},
    {"name": "Platform Plays", "weight": 0.20, "description": "Monthly streams"},
    {"name": "New Submissions", "weight": 0.15, "description": "Catalog growth"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Didasko
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'Didasko (Academic)',
  'BOUNTY K-12 curriculum platform',
  'creative',
  true,
  '[
    {"name": "Content Quality", "weight": 0.25, "description": "Curriculum effectiveness"},
    {"name": "Student Engagement", "weight": 0.20, "description": "Completion rates"},
    {"name": "Teacher Adoption", "weight": 0.20, "description": "Educator uptake"},
    {"name": "Assessment Results", "weight": 0.20, "description": "Learning outcomes"},
    {"name": "Content Volume", "weight": 0.15, "description": "Lessons available"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GROWTH INITIATIVES
-- ============================================================================

-- International
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'International',
  'Global connection with PPP-adjusted economics',
  'growth',
  true,
  '[
    {"name": "Regional Coverage", "weight": 0.25, "description": "Countries served"},
    {"name": "Currency Conversion", "weight": 0.15, "description": "PPP adjustments"},
    {"name": "Localization", "weight": 0.20, "description": "Language/culture fit"},
    {"name": "Regulatory Compliance", "weight": 0.20, "description": "Legal clearance"},
    {"name": "Partner Network", "weight": 0.20, "description": "Local collaborators"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Brass Tacks
INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'Brass Tacks',
  'Medallion sponsorship - Johnny Appleseed program',
  'growth',
  true,
  '[
    {"name": "Sponsor Signups", "weight": 0.30, "description": "New Johnny Appleseeds"},
    {"name": "Sponsored Members", "weight": 0.25, "description": "Seedlings planted"},
    {"name": "Conversion Rate", "weight": 0.20, "description": "Seedlings to full members"},
    {"name": "Sponsor Retention", "weight": 0.15, "description": "Continuing sponsors"},
    {"name": "Network Effect", "weight": 0.10, "description": "Referral multiplier"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CUSTOM BUSINESS TEMPLATE
-- ============================================================================

INSERT INTO public.co_factor_templates (name, description, category, is_default, factors)
VALUES (
  'Custom Business',
  'Your own business idea with platform economics',
  'custom',
  true,
  '[
    {"name": "Market Demand", "weight": 0.20, "description": "Customer need strength"},
    {"name": "Competitive Position", "weight": 0.15, "description": "Market differentiation"},
    {"name": "Operational Efficiency", "weight": 0.20, "description": "Cost management"},
    {"name": "Customer Acquisition", "weight": 0.20, "description": "Growth capability"},
    {"name": "Revenue Stability", "weight": 0.15, "description": "Income consistency"},
    {"name": "Scalability", "weight": 0.10, "description": "Growth potential"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENT
-- ============================================================================
COMMENT ON TABLE public.co_factor_templates IS 'Business simulation factor templates for all 16 Sweet Sixteen initiatives plus Custom. Used by Contingency Operators (Innovation #1188) for what-if scenario testing.';
