/**
 * Concentric Circle Testing Service
 * ===================================
 * Operationalizes the "Help Me Farm" Cue Card strategy by tracking
 * which ring of testers has been activated and their feedback.
 *
 * Rings expand outward from the Founder's immediate family:
 *   Ring 1: Immediate Family (wife + 4 kids at home)
 *   Ring 2: Extended Family (4 grown kids on their own)
 *   Ring 3: Wider Family
 *   Ring 4: Friends
 *   Ring 5: The 300 / Strategic Allies
 *
 * Each ring activates ONLY when the previous ring reaches 80% feedback.
 * "Start close. Listen hard. Expand when ready."
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export type RingStatus = "active" | "ready" | "locked";
export type FeedbackCategory = "bug" | "ux_confusion" | "feature_request" | "praise";
export type BugSeverity = "critical" | "major" | "minor" | "cosmetic";

export interface RingMember {
  id: string;
  name: string;
  ringId: number;
  cueCardSent: boolean;
  cueCardSentDate: string | null;
  signedUp: boolean;
  signedUpDate: string | null;
  testingGoalsCompleted: number;
  testingGoalsTotal: number;
  feedbackGiven: boolean;
  feedbackCount: number;
}

export interface TestingGoal {
  id: string;
  label: string;
  description: string;
}

export interface TestingGoalProgress {
  goalId: string;
  memberId: string;
  completed: boolean;
  completedDate: string | null;
}

export interface FeedbackItem {
  id: string;
  ringId: number;
  memberId: string;
  memberName: string;
  category: FeedbackCategory;
  severity: BugSeverity | null;
  title: string;
  description: string;
  resolved: boolean;
  createdAt: string;
}

export interface Ring {
  id: number;
  name: string;
  description: string;
  color: string;
  glowColor: string;
  bgColor: string;
  borderColor: string;
  status: RingStatus;
  members: RingMember[];
  activatedDate: string | null;
  feedbackCompletionPercent: number;
  projectedSize: number;
  sendListName: string;
}

export interface ExpansionEvent {
  ringId: number;
  ringName: string;
  type: "activated" | "threshold_reached" | "projected";
  date: string;
  description: string;
}

export interface RingStats {
  totalTestersActivated: number;
  feedbackItemsReceived: number;
  bugsFixed: number;
  featuresRequested: number;
  avgTestingMinutes: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ACTIVATION_THRESHOLD = 80; // Ring X activates when Ring X-1 reaches 80% feedback

export const TESTING_GOALS: TestingGoal[] = [
  { id: "profile", label: "Signed up and completed profile", description: "Create an account and fill in basic profile information" },
  { id: "main_square", label: "Browsed Main Square", description: "Visit the Main Square and explore available stores" },
  { id: "visit_stores", label: "Visited at least 3 stores", description: "Click into and browse at least three different store pages" },
  { id: "demand_signal", label: "Used Demand Signaling", description: "Signal demand for at least one product or service" },
  { id: "cue_card", label: "Sent or received a Cue Card", description: "Participate in the Cue Card sharing system" },
  { id: "feedback", label: "Provided feedback via Intercom", description: "Submit at least one piece of feedback about the platform experience" },
];

// ============================================================================
// RING DEFINITIONS
// ============================================================================

export const RING_DEFINITIONS: Omit<Ring, "members" | "feedbackCompletionPercent">[] = [
  {
    id: 1,
    name: "Immediate Family",
    description: "Wife + 4 kids at home. The very first testers who see everything raw.",
    color: "amber",
    glowColor: "rgba(245, 158, 11, 0.6)",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500",
    status: "active",
    activatedDate: "2026-03-18T00:00:00Z",
    projectedSize: 6,
    sendListName: "Family Core — Ring 1",
  },
  {
    id: 2,
    name: "Extended Family",
    description: "4 grown kids on their own. Second wave — they bring fresh adult eyes.",
    color: "amber",
    glowColor: "rgba(251, 191, 36, 0.5)",
    bgColor: "bg-amber-400/15",
    borderColor: "border-amber-400",
    status: "ready",
    activatedDate: null,
    projectedSize: 8,
    sendListName: "Family Extended — Ring 2",
  },
  {
    id: 3,
    name: "Wider Family",
    description: "Aunts, uncles, cousins. The wider family network brings diverse perspectives.",
    color: "blue",
    glowColor: "rgba(59, 130, 246, 0.5)",
    bgColor: "bg-blue-500/15",
    borderColor: "border-blue-500",
    status: "locked",
    activatedDate: null,
    projectedSize: 12,
    sendListName: "Family Wide — Ring 3",
  },
  {
    id: 4,
    name: "Friends",
    description: "Trusted friends and close associates. Real-world stress test begins here.",
    color: "green",
    glowColor: "rgba(34, 197, 94, 0.5)",
    bgColor: "bg-green-500/15",
    borderColor: "border-green-500",
    status: "locked",
    activatedDate: null,
    projectedSize: 20,
    sendListName: "Friends Network — Ring 4",
  },
  {
    id: 5,
    name: "The 300 / Strategic Allies",
    description: "Crown letter recipients and strategic partners. The full launch cohort.",
    color: "purple",
    glowColor: "rgba(168, 85, 247, 0.5)",
    bgColor: "bg-purple-500/15",
    borderColor: "border-purple-500",
    status: "locked",
    activatedDate: null,
    projectedSize: 300,
    sendListName: "The 300 — Ring 5",
  },
];

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_MEMBERS: RingMember[] = [
  // Ring 1 — Immediate Family (6 members, 4 signed up, 3 completed goals)
  { id: "m1", name: "Family Member A", ringId: 1, cueCardSent: true, cueCardSentDate: "2026-03-16", signedUp: true, signedUpDate: "2026-03-16", testingGoalsCompleted: 6, testingGoalsTotal: 6, feedbackGiven: true, feedbackCount: 5 },
  { id: "m2", name: "Family Member B", ringId: 1, cueCardSent: true, cueCardSentDate: "2026-03-16", signedUp: true, signedUpDate: "2026-03-17", testingGoalsCompleted: 5, testingGoalsTotal: 6, feedbackGiven: true, feedbackCount: 4 },
  { id: "m3", name: "Family Member C", ringId: 1, cueCardSent: true, cueCardSentDate: "2026-03-16", signedUp: true, signedUpDate: "2026-03-17", testingGoalsCompleted: 4, testingGoalsTotal: 6, feedbackGiven: true, feedbackCount: 3 },
  { id: "m4", name: "Family Member D", ringId: 1, cueCardSent: true, cueCardSentDate: "2026-03-16", signedUp: true, signedUpDate: "2026-03-18", testingGoalsCompleted: 2, testingGoalsTotal: 6, feedbackGiven: false, feedbackCount: 0 },
  { id: "m5", name: "Family Member E", ringId: 1, cueCardSent: true, cueCardSentDate: "2026-03-17", signedUp: false, signedUpDate: null, testingGoalsCompleted: 0, testingGoalsTotal: 6, feedbackGiven: false, feedbackCount: 0 },
  { id: "m6", name: "Family Member F", ringId: 1, cueCardSent: true, cueCardSentDate: "2026-03-17", signedUp: false, signedUpDate: null, testingGoalsCompleted: 0, testingGoalsTotal: 6, feedbackGiven: false, feedbackCount: 0 },
  // Ring 2 — Extended Family (not activated yet, but members defined)
  { id: "m7", name: "Extended A", ringId: 2, cueCardSent: false, cueCardSentDate: null, signedUp: false, signedUpDate: null, testingGoalsCompleted: 0, testingGoalsTotal: 6, feedbackGiven: false, feedbackCount: 0 },
  { id: "m8", name: "Extended B", ringId: 2, cueCardSent: false, cueCardSentDate: null, signedUp: false, signedUpDate: null, testingGoalsCompleted: 0, testingGoalsTotal: 6, feedbackGiven: false, feedbackCount: 0 },
  { id: "m9", name: "Extended C", ringId: 2, cueCardSent: false, cueCardSentDate: null, signedUp: false, signedUpDate: null, testingGoalsCompleted: 0, testingGoalsTotal: 6, feedbackGiven: false, feedbackCount: 0 },
  { id: "m10", name: "Extended D", ringId: 2, cueCardSent: false, cueCardSentDate: null, signedUp: false, signedUpDate: null, testingGoalsCompleted: 0, testingGoalsTotal: 6, feedbackGiven: false, feedbackCount: 0 },
  { id: "m11", name: "Extended E", ringId: 2, cueCardSent: false, cueCardSentDate: null, signedUp: false, signedUpDate: null, testingGoalsCompleted: 0, testingGoalsTotal: 6, feedbackGiven: false, feedbackCount: 0 },
  { id: "m12", name: "Extended F", ringId: 2, cueCardSent: false, cueCardSentDate: null, signedUp: false, signedUpDate: null, testingGoalsCompleted: 0, testingGoalsTotal: 6, feedbackGiven: false, feedbackCount: 0 },
  { id: "m13", name: "Extended G", ringId: 2, cueCardSent: false, cueCardSentDate: null, signedUp: false, signedUpDate: null, testingGoalsCompleted: 0, testingGoalsTotal: 6, feedbackGiven: false, feedbackCount: 0 },
  { id: "m14", name: "Extended H", ringId: 2, cueCardSent: false, cueCardSentDate: null, signedUp: false, signedUpDate: null, testingGoalsCompleted: 0, testingGoalsTotal: 6, feedbackGiven: false, feedbackCount: 0 },
];

const SAMPLE_FEEDBACK: FeedbackItem[] = [
  // Bugs
  { id: "f1", ringId: 1, memberId: "m1", memberName: "Family Member A", category: "bug", severity: "critical", title: "Login page freezes on mobile Safari", description: "When trying to sign in on iPhone, the page locks up after entering password.", resolved: true, createdAt: "2026-03-16T10:00:00Z" },
  { id: "f2", ringId: 1, memberId: "m1", memberName: "Family Member A", category: "bug", severity: "major", title: "Profile picture upload fails silently", description: "Tried to upload a HEIC photo and nothing happened. No error message.", resolved: true, createdAt: "2026-03-16T14:00:00Z" },
  { id: "f3", ringId: 1, memberId: "m2", memberName: "Family Member B", category: "bug", severity: "minor", title: "Typo on onboarding screen", description: "Step 3 says 'complte' instead of 'complete'.", resolved: true, createdAt: "2026-03-17T09:00:00Z" },
  { id: "f4", ringId: 1, memberId: "m3", memberName: "Family Member C", category: "bug", severity: "major", title: "Demand signal button unresponsive", description: "Clicked the signal button multiple times but count did not increase.", resolved: false, createdAt: "2026-03-17T11:00:00Z" },
  { id: "f5", ringId: 1, memberId: "m1", memberName: "Family Member A", category: "bug", severity: "cosmetic", title: "Footer overlaps content on small screens", description: "On my phone the footer text covers the bottom of the store list.", resolved: true, createdAt: "2026-03-17T15:00:00Z" },
  // UX Confusion
  { id: "f6", ringId: 1, memberId: "m2", memberName: "Family Member B", category: "ux_confusion", severity: null, title: "Did not understand what Marks are", description: "Saw references to Marks but could not figure out what they mean or how to get them.", resolved: false, createdAt: "2026-03-16T16:00:00Z" },
  { id: "f7", ringId: 1, memberId: "m3", memberName: "Family Member C", category: "ux_confusion", severity: null, title: "Main Square navigation confusing", description: "Could not figure out how to get back to the Main Square from a store page.", resolved: false, createdAt: "2026-03-17T10:30:00Z" },
  { id: "f8", ringId: 1, memberId: "m1", memberName: "Family Member A", category: "ux_confusion", severity: null, title: "Cue Card sharing unclear", description: "Tried to share a Cue Card but did not know if it actually sent.", resolved: true, createdAt: "2026-03-17T12:00:00Z" },
  // Feature Requests
  { id: "f9", ringId: 1, memberId: "m2", memberName: "Family Member B", category: "feature_request", severity: null, title: "Want dark mode toggle", description: "The bright white screens are hard on the eyes at night.", resolved: false, createdAt: "2026-03-16T20:00:00Z" },
  { id: "f10", ringId: 1, memberId: "m3", memberName: "Family Member C", category: "feature_request", severity: null, title: "Wish I could save favorite stores", description: "Would be nice to bookmark stores I want to come back to.", resolved: false, createdAt: "2026-03-17T14:00:00Z" },
  { id: "f11", ringId: 1, memberId: "m1", memberName: "Family Member A", category: "feature_request", severity: null, title: "Notification when new stores open", description: "Want to know when new stores appear in the Main Square.", resolved: false, createdAt: "2026-03-18T08:00:00Z" },
  // Praise
  { id: "f12", ringId: 1, memberId: "m1", memberName: "Family Member A", category: "praise", severity: null, title: "Love the onboarding flow", description: "The step-by-step walkthrough was really clear and welcoming. Felt like someone was guiding me.", resolved: false, createdAt: "2026-03-16T11:00:00Z" },
  { id: "f13", ringId: 1, memberId: "m2", memberName: "Family Member B", category: "praise", severity: null, title: "Cue Cards are a great idea", description: "The physical-feeling cards are fun. Makes sharing feel personal.", resolved: false, createdAt: "2026-03-17T09:30:00Z" },
  { id: "f14", ringId: 1, memberId: "m3", memberName: "Family Member C", category: "praise", severity: null, title: "Main Square looks beautiful", description: "The store layouts in Main Square look really professional. Impressed.", resolved: false, createdAt: "2026-03-17T13:00:00Z" },
  { id: "f15", ringId: 1, memberId: "m2", memberName: "Family Member B", category: "praise", severity: null, title: "Demand Signaling is intuitive", description: "Once I figured out Marks, the demand signal concept clicked right away. Clever.", resolved: false, createdAt: "2026-03-18T07:00:00Z" },
];

const SAMPLE_EXPANSION_TIMELINE: ExpansionEvent[] = [
  { ringId: 1, ringName: "Immediate Family", type: "activated", date: "2026-03-18", description: "Ring 1 activated — Cue Cards distributed to immediate family" },
  { ringId: 1, ringName: "Immediate Family", type: "threshold_reached", date: "2026-03-21", description: "Ring 1 reaches 80% feedback (projected)" },
  { ringId: 2, ringName: "Extended Family", type: "projected", date: "2026-03-22", description: "Ring 2 activation (projected)" },
  { ringId: 2, ringName: "Extended Family", type: "projected", date: "2026-03-27", description: "Ring 2 reaches 80% feedback (projected)" },
  { ringId: 3, ringName: "Wider Family", type: "projected", date: "2026-03-28", description: "Ring 3 activation (projected)" },
  { ringId: 4, ringName: "Friends", type: "projected", date: "2026-04-05", description: "Ring 4 activation (projected)" },
  { ringId: 5, ringName: "The 300", type: "projected", date: "2026-04-15", description: "Ring 5 activation (projected)" },
];

// ============================================================================
// DATA ACCESS — Sample data for now, Supabase stubs for live wiring
// ============================================================================

export function getRings(): Ring[] {
  const rings: Ring[] = RING_DEFINITIONS.map((def) => {
    const members = SAMPLE_MEMBERS.filter((m) => m.ringId === def.id);
    const feedbackGivenCount = members.filter((m) => m.feedbackGiven).length;
    const totalMembers = members.length || def.projectedSize;
    const feedbackCompletionPercent =
      totalMembers > 0 ? Math.round((feedbackGivenCount / totalMembers) * 100) : 0;

    return {
      ...def,
      members,
      feedbackCompletionPercent,
    };
  });
  return rings;
}

export function getRingMembers(ringId: number): RingMember[] {
  return SAMPLE_MEMBERS.filter((m) => m.ringId === ringId);
}

export function getFeedbackForRing(ringId: number): FeedbackItem[] {
  return SAMPLE_FEEDBACK.filter((f) => f.ringId === ringId);
}

export function getAllFeedback(): FeedbackItem[] {
  return SAMPLE_FEEDBACK;
}

export function getExpansionTimeline(): ExpansionEvent[] {
  return SAMPLE_EXPANSION_TIMELINE;
}

export function getStats(): RingStats {
  const allMembers = SAMPLE_MEMBERS;
  const activatedMembers = allMembers.filter((m) => m.signedUp);
  const allFeedback = SAMPLE_FEEDBACK;
  const bugsFixed = allFeedback.filter((f) => f.category === "bug" && f.resolved).length;
  const featuresRequested = allFeedback.filter((f) => f.category === "feature_request").length;

  return {
    totalTestersActivated: activatedMembers.length,
    feedbackItemsReceived: allFeedback.length,
    bugsFixed,
    featuresRequested,
    avgTestingMinutes: 42, // sample
  };
}

export function getFeedbackCounts(ringId: number) {
  const feedback = getFeedbackForRing(ringId);
  return {
    bugs: feedback.filter((f) => f.category === "bug").length,
    bugsBySeverity: {
      critical: feedback.filter((f) => f.category === "bug" && f.severity === "critical").length,
      major: feedback.filter((f) => f.category === "bug" && f.severity === "major").length,
      minor: feedback.filter((f) => f.category === "bug" && f.severity === "minor").length,
      cosmetic: feedback.filter((f) => f.category === "bug" && f.severity === "cosmetic").length,
    },
    uxConfusion: feedback.filter((f) => f.category === "ux_confusion").length,
    featureRequests: feedback.filter((f) => f.category === "feature_request").length,
    praise: feedback.filter((f) => f.category === "praise").length,
  };
}

export function canActivateRing(ringId: number): boolean {
  if (ringId <= 1) return true;
  const rings = getRings();
  const prevRing = rings.find((r) => r.id === ringId - 1);
  if (!prevRing) return false;
  return prevRing.feedbackCompletionPercent >= ACTIVATION_THRESHOLD;
}

// ============================================================================
// SUPABASE STUBS — TODO: Wire to live data
// ============================================================================

/** TODO(SUPABASE): Fetch ring members from `concentric_circle_members` table */
export async function fetchRingMembersLive(_ringId: number): Promise<RingMember[]> {
  // const { data, error } = await supabase
  //   .from("concentric_circle_members")
  //   .select("*")
  //   .eq("ring_id", ringId)
  //   .order("name");
  // if (error) throw error;
  // return data;
  void supabase; // Suppress unused import warning
  return [];
}

/** TODO(SUPABASE): Fetch feedback items from `concentric_circle_feedback` table */
export async function fetchFeedbackLive(_ringId: number): Promise<FeedbackItem[]> {
  // const { data, error } = await supabase
  //   .from("concentric_circle_feedback")
  //   .select("*")
  //   .eq("ring_id", ringId)
  //   .order("created_at", { ascending: false });
  // if (error) throw error;
  // return data;
  return [];
}

/** TODO(SUPABASE): Update ring activation status */
export async function activateRingLive(_ringId: number): Promise<void> {
  // const { error } = await supabase
  //   .from("concentric_circle_rings")
  //   .update({ status: "active", activated_date: new Date().toISOString() })
  //   .eq("id", ringId);
  // if (error) throw error;
}

/** TODO(SUPABASE): Record new feedback */
export async function submitFeedbackLive(_feedback: Omit<FeedbackItem, "id" | "createdAt">): Promise<void> {
  // const { error } = await supabase
  //   .from("concentric_circle_feedback")
  //   .insert(feedback);
  // if (error) throw error;
}
