/**
 * BandWagon Service — Project Backing System
 * ============================================
 * Members back projects with Marks to earn Service Allocation Authority (SAA).
 * "This is not an investment return. This is earned authority to allocate
 *  cooperative resources based on demonstrated judgment."
 *
 * Core mechanics:
 *  - Back projects with Marks -> project succeeds -> earn increased SAA
 *  - Taste Ranger progression: Scout -> Ranger -> Curator -> TasteMaker -> Patron -> Luminary
 *  - First-100 Rule: first 100 backers share influence proportionally
 *  - Positive-only QA: promotes, doesn't ding
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export type ProjectStatus = "active" | "funded" | "succeeded" | "failed";

export interface BandWagonProject {
  id: string;
  name: string;
  stewardName: string;
  description: string;
  category: string;
  goalMarks: number;
  backedMarks: number;
  backerCount: number;
  daysRemaining: number;
  status: ProjectStatus;
  createdAt: string;
}

export interface Backing {
  id: string;
  projectId: string;
  projectName: string;
  pledgeAmount: number;
  status: ProjectStatus;
  saaEarned: number;
  backedAt: string;
}

export type TasteRangerTierName =
  | "Scout"
  | "Ranger"
  | "Curator"
  | "TasteMaker"
  | "Patron"
  | "Luminary";

export interface TasteRangerTier {
  name: TasteRangerTierName;
  minBackings: number;
  minSAA: number;
  color: string;
  glowColor: string;
}

export interface TasteRangerProfile {
  currentTier: TasteRangerTierName;
  totalBackings: number;
  successfulBackings: number;
  nextTierName: TasteRangerTierName | null;
  nextTierRequirement: number;
}

export interface ServiceAllocationAuthority {
  score: number;
  allocationBudget: number;
  allocationUsed: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TASTE_RANGER_TIERS: TasteRangerTier[] = [
  { name: "Scout",      minBackings: 0,  minSAA: 0,    color: "bg-stone-600",   glowColor: "shadow-stone-500/50" },
  { name: "Ranger",     minBackings: 1,  minSAA: 10,   color: "bg-green-700",   glowColor: "shadow-green-500/50" },
  { name: "Curator",    minBackings: 5,  minSAA: 50,   color: "bg-blue-600",    glowColor: "shadow-blue-500/50" },
  { name: "TasteMaker", minBackings: 15, minSAA: 200,  color: "bg-purple-600",  glowColor: "shadow-purple-500/50" },
  { name: "Patron",     minBackings: 50, minSAA: 1000, color: "bg-amber-500",   glowColor: "shadow-amber-400/50" },
  { name: "Luminary",   minBackings: 100,minSAA: 5000, color: "bg-gradient-to-r from-amber-400 to-yellow-300", glowColor: "shadow-yellow-400/60" },
];

export const PROJECT_CATEGORIES = [
  "Production",
  "Education",
  "Food & Dining",
  "Craftsmanship",
  "Technology",
  "Services",
] as const;

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const SAMPLE_PROJECTS: BandWagonProject[] = [
  {
    id: "bw-001",
    name: "Boise Business Card Run",
    stewardName: "Captain Mike",
    description: "First production run of Liana Banyan business cards for the Boise ambassador network. High-quality letterpress on cotton stock with QR-coded cue card backs.",
    category: "Production",
    goalMarks: 500,
    backedMarks: 340,
    backerCount: 67,
    daysRemaining: 12,
    status: "active",
    createdAt: "2026-03-06T00:00:00Z",
  },
  {
    id: "bw-002",
    name: "Sourdough Starter Kit Production",
    stewardName: "Sarah Chen",
    description: "Producing 200 sourdough starter kits with locally sourced flour, glass jars, and step-by-step recipe cards. A gateway product for Let's Make Dinner.",
    category: "Food & Dining",
    goalMarks: 200,
    backedMarks: 195,
    backerCount: 89,
    daysRemaining: 3,
    status: "active",
    createdAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "bw-003",
    name: "Harbor Woodworks Custom Table Set",
    stewardName: "Jake Morrison",
    description: "Handcrafted dining table and bench set using reclaimed timber. First certified product from the Harbor Woodworks guild workshop.",
    category: "Craftsmanship",
    goalMarks: 1200,
    backedMarks: 450,
    backerCount: 23,
    daysRemaining: 28,
    status: "active",
    createdAt: "2026-02-18T00:00:00Z",
  },
  {
    id: "bw-004",
    name: "Didasko Math Tutoring Pilot",
    stewardName: "Academy Guild",
    description: "Launch the first cohort of peer-to-peer math tutoring sessions through the Didasko initiative. Covers materials, scheduling tools, and tutor compensation.",
    category: "Education",
    goalMarks: 300,
    backedMarks: 300,
    backerCount: 100,
    daysRemaining: 0,
    status: "funded",
    createdAt: "2026-02-10T00:00:00Z",
  },
  {
    id: "bw-005",
    name: "Mountain View Meal Prep Launch",
    stewardName: "Fresh Crew",
    description: "Weekly meal prep service for busy families. Locally sourced ingredients, reusable containers, and flexible subscription options.",
    category: "Food & Dining",
    goalMarks: 400,
    backedMarks: 120,
    backerCount: 15,
    daysRemaining: 21,
    status: "active",
    createdAt: "2026-02-25T00:00:00Z",
  },
  {
    id: "bw-006",
    name: "CodeForge Dev Tools Bundle",
    stewardName: "DevGuild",
    description: "Open-source developer toolkit for cooperative platform builders. Includes API wrappers, testing harnesses, and deployment scripts.",
    category: "Technology",
    goalMarks: 800,
    backedMarks: 0,
    backerCount: 0,
    daysRemaining: 30,
    status: "active",
    createdAt: "2026-03-18T00:00:00Z",
  },
];

export const SAMPLE_BACKINGS: Backing[] = [
  {
    id: "back-001",
    projectId: "bw-001",
    projectName: "Boise Business Card Run",
    pledgeAmount: 25,
    status: "active",
    saaEarned: 0,
    backedAt: "2026-03-08T00:00:00Z",
  },
  {
    id: "back-002",
    projectId: "bw-002",
    projectName: "Sourdough Starter Kit Production",
    pledgeAmount: 10,
    status: "active",
    saaEarned: 0,
    backedAt: "2026-03-04T00:00:00Z",
  },
  {
    id: "back-003",
    projectId: "bw-004",
    projectName: "Didasko Math Tutoring Pilot",
    pledgeAmount: 15,
    status: "funded",
    saaEarned: 22,
    backedAt: "2026-02-12T00:00:00Z",
  },
];

export const SAMPLE_TASTE_RANGER: TasteRangerProfile = {
  currentTier: "Ranger",
  totalBackings: 3,
  successfulBackings: 1,
  nextTierName: "Curator",
  nextTierRequirement: 5,
};

export const SAMPLE_SAA: ServiceAllocationAuthority = {
  score: 22,
  allocationBudget: 50,
  allocationUsed: 35,
};

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/** Fetch active BandWagon projects */
export async function fetchActiveProjects(): Promise<BandWagonProject[]> {
  // TODO(SUPABASE): Replace with real query once bandwagon_projects table exists
  // const { data, error } = await supabase
  //   .from('bandwagon_projects')
  //   .select('*')
  //   .in('status', ['active', 'funded'])
  //   .order('created_at', { ascending: false });
  return SAMPLE_PROJECTS;
}

/** Fetch a user's backing history */
export async function fetchUserBackings(userId: string): Promise<Backing[]> {
  // TODO(SUPABASE): Replace with real query once bandwagon_backings table exists
  // const { data, error } = await supabase
  //   .from('bandwagon_backings')
  //   .select('*, bandwagon_projects(name, status)')
  //   .eq('user_id', userId)
  //   .order('backed_at', { ascending: false });
  return SAMPLE_BACKINGS;
}

/** Fetch Taste Ranger profile for a user */
export async function fetchTasteRangerProfile(userId: string): Promise<TasteRangerProfile> {
  // TODO(SUPABASE): Compute from bandwagon_backings aggregate
  // const { data, error } = await supabase
  //   .rpc('get_taste_ranger_profile', { p_user_id: userId });
  return SAMPLE_TASTE_RANGER;
}

/** Fetch SAA for a user */
export async function fetchSAA(userId: string): Promise<ServiceAllocationAuthority> {
  // TODO(SUPABASE): Compute from successful backings
  // const { data, error } = await supabase
  //   .rpc('get_service_allocation_authority', { p_user_id: userId });
  return SAMPLE_SAA;
}

/** Back a project with Marks */
export async function backProject(
  projectId: string,
  markAmount: number
): Promise<{ success: boolean; message: string }> {
  // TODO(SUPABASE): Insert into bandwagon_backings, update project totals
  // const { data, error } = await supabase
  //   .from('bandwagon_backings')
  //   .insert({ project_id: projectId, amount: markAmount, user_id: userId });
  console.log(`[BandWagon] Backing project ${projectId} with ${markAmount} Marks`);
  return { success: true, message: "Backing recorded (sample mode)" };
}
