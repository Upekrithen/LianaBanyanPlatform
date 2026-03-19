/**
 * Star Chamber Service — AI Governance System v9.7
 * =================================================
 * Four AI Judges: Oracle, Morpheus, Red Queen, Dredd
 * SCaaS potential: $5-$500/mo
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export type CaseType = "dispute" | "complaint" | "violation" | "appeal";
export type CaseSeverity = "low" | "medium" | "high" | "critical";
export type CaseStatus = "open" | "under_review" | "analysis_complete" | "verdict_reached" | "closed" | "appealed";

export interface StarChamberCase {
  id: string;
  caseNumber: number;
  caseType: CaseType;
  title: string;
  complainantUserId: string | null;
  respondentUserId: string | null;
  description: string;
  evidence: { type: string; description: string; url?: string }[];
  oracleAnalysis: string | null;
  morpheusAnalysis: string | null;
  redQueenAnalysis: string | null;
  dreddVerdict: string | null;
  recommendedAction: string | null;
  finalAction: string | null;
  founderOverride: boolean;
  founderOverrideReason: string | null;
  severity: CaseSeverity;
  status: CaseStatus;
  createdAt: string;
  resolvedAt: string | null;
}

export interface JudgeStats {
  name: string;
  icon: string;
  color: string;
  description: string;
  casesAnalyzed: number;
  agreementRate: number;
  avgTimeHours: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const JUDGES: JudgeStats[] = [
  { name: "Oracle", icon: "Eye", color: "purple", description: "Pattern Detection & Prediction", casesAnalyzed: 47, agreementRate: 89, avgTimeHours: 2.3 },
  { name: "Morpheus", icon: "Brain", color: "blue", description: "Behavior Modeling & Risk", casesAnalyzed: 47, agreementRate: 85, avgTimeHours: 3.1 },
  { name: "Red Queen", icon: "Crown", color: "red", description: "Rule Enforcement & Compliance", casesAnalyzed: 47, agreementRate: 92, avgTimeHours: 1.8 },
  { name: "Dredd", icon: "Gavel", color: "amber", description: "Final Arbitration", casesAnalyzed: 8, agreementRate: 100, avgTimeHours: 6.5 },
];

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const SAMPLE_CASES: StarChamberCase[] = [
  {
    id: "sc1", caseNumber: 1001, caseType: "dispute", title: "Bounty Completion Disagreement — Web Scraper",
    complainantUserId: "u1", respondentUserId: "u2",
    description: "Sponsor claims bounty deliverable does not meet spec. Developer claims specification was ambiguous.",
    evidence: [{ type: "document", description: "Original bounty spec" }, { type: "screenshot", description: "Delivered output" }],
    oracleAnalysis: "Pattern analysis: 73% of bounty disputes involve ambiguous acceptance criteria. Historical resolution favors clarification + partial payment.",
    morpheusAnalysis: "Behavioral profile: Both parties have strong track records. Low flight risk. Mediation recommended.",
    redQueenAnalysis: "Rule check: Bounty Terms §4.2 requires clear and measurable acceptance criteria. The original spec lacks quantitative metrics. Violation of §4.2 by sponsor.",
    dreddVerdict: "Consensus among Oracle, Morpheus, and Red Queen. Dredd not required.",
    recommendedAction: "75% payment to developer + spec revision requirement for future bounties.",
    finalAction: "75% payment released. Template requirement enforced.",
    founderOverride: false, founderOverrideReason: null,
    severity: "high", status: "verdict_reached",
    createdAt: "2026-03-10T08:00:00Z", resolvedAt: "2026-03-12T14:00:00Z",
  },
  {
    id: "sc2", caseNumber: 1002, caseType: "complaint", title: "Poor Quality Production — Ceramic Tiles",
    complainantUserId: "u3", respondentUserId: "u1",
    description: "Received 50 ceramic tiles with visible glazing defects. 12 tiles cracked during water testing.",
    evidence: [{ type: "photo", description: "Cracked tiles" }, { type: "report", description: "Water test results" }],
    oracleAnalysis: "Quality data suggests 24% defect rate — significantly above the 5% threshold for Tereno Certified products.",
    morpheusAnalysis: "Producer has 4.6 average quality score. This batch is an outlier. Likely equipment calibration issue.",
    redQueenAnalysis: null, dreddVerdict: null,
    recommendedAction: null, finalAction: null,
    founderOverride: false, founderOverrideReason: null,
    severity: "medium", status: "under_review",
    createdAt: "2026-03-14T09:00:00Z", resolvedAt: null,
  },
  {
    id: "sc3", caseNumber: 1003, caseType: "violation", title: "Self-STAMP Attempt — Leather Workshop",
    complainantUserId: null, respondentUserId: "u2",
    description: "System flagged: user attempted to STAMP their own production run.",
    evidence: [{ type: "system_log", description: "Audit trail showing self-stamp attempt" }],
    oracleAnalysis: "First-time offense. No prior violations in 6 months of membership.",
    morpheusAnalysis: "User profile indicates new member (3 months). Likely misunderstanding of STAMP rules.",
    redQueenAnalysis: "Clear violation of STAMP Protocol §2.1: No producer may verify their own output. Warning issued.",
    dreddVerdict: null,
    recommendedAction: "Warning + mandatory STAMP training module. No Marks penalty for first offense.",
    finalAction: null,
    founderOverride: false, founderOverrideReason: null,
    severity: "low", status: "analysis_complete",
    createdAt: "2026-03-15T11:00:00Z", resolvedAt: null,
  },
  {
    id: "sc4", caseNumber: 1004, caseType: "appeal", title: "Appeal: Coverage Minutes Penalty",
    complainantUserId: "u1", respondentUserId: null,
    description: "Member appeals 30-day coverage minute reduction. Claims technical issue prevented timely listening compliance.",
    evidence: [{ type: "technical", description: "Browser crash logs" }],
    oracleAnalysis: null, morpheusAnalysis: null, redQueenAnalysis: null, dreddVerdict: null,
    recommendedAction: null, finalAction: null,
    founderOverride: false, founderOverrideReason: null,
    severity: "low", status: "open",
    createdAt: "2026-03-16T07:00:00Z", resolvedAt: null,
  },
  {
    id: "sc5", caseNumber: 1005, caseType: "dispute", title: "Referral Chain Attribution — Cue Card",
    complainantUserId: "u2", respondentUserId: "u3",
    description: "Two members claim credit for referring the same new member.",
    evidence: [{ type: "timestamp", description: "Cue card dispatch log" }, { type: "testimony", description: "New member statement" }],
    oracleAnalysis: "Timestamp data is conclusive: Member A's cue card was dispatched 48 hours before Member B's.",
    morpheusAnalysis: "Both members have good standing. Member B appears genuinely unaware of Member A's prior outreach.",
    redQueenAnalysis: "Cue Card Protocol §1.3: Attribution follows timestamp-verified dispatch order. Member A has priority.",
    dreddVerdict: null,
    recommendedAction: "Member A receives referral credit. Member B receives acknowledgment.",
    finalAction: "Founder agrees. Cue Card timestamp rule upheld.",
    founderOverride: true, founderOverrideReason: "Affirmed AI recommendation. Timestamp rule is clear and must be consistently applied.",
    severity: "medium", status: "closed",
    createdAt: "2026-03-11T10:00:00Z", resolvedAt: "2026-03-13T16:00:00Z",
  },
];

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

export async function fetchCases(): Promise<StarChamberCase[]> {
  try {
    const { data, error } = await supabase
      .from("star_chamber_cases")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data?.length) return SAMPLE_CASES;
    return data.map(mapCase);
  } catch { return SAMPLE_CASES; }
}

export async function fetchUserCases(userId: string): Promise<StarChamberCase[]> {
  try {
    const { data, error } = await supabase
      .from("star_chamber_cases")
      .select("*")
      .or(`complainant_user_id.eq.${userId},respondent_user_id.eq.${userId}`)
      .order("created_at", { ascending: false });
    if (error || !data?.length) return SAMPLE_CASES;
    return data.map(mapCase);
  } catch { return SAMPLE_CASES; }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function createCase(caseData: {
  caseType: CaseType; title: string; description: string; severity: CaseSeverity;
  complainantUserId?: string; respondentUserId?: string; evidence?: { type: string; description: string; url?: string }[];
}): Promise<StarChamberCase | null> {
  try {
    const { data, error } = await supabase.from("star_chamber_cases").insert({
      case_type: caseData.caseType,
      title: caseData.title,
      description: caseData.description,
      severity: caseData.severity,
      complainant_user_id: caseData.complainantUserId || null,
      respondent_user_id: caseData.respondentUserId || null,
      evidence: caseData.evidence || [],
    }).select().single();
    if (error || !data) return null;
    return mapCase(data);
  } catch { return null; }
}

export async function updateCaseStatus(caseId: string, status: CaseStatus): Promise<boolean> {
  try {
    const updates: Record<string, any> = { status };
    if (status === "closed" || status === "verdict_reached") {
      updates.resolved_at = new Date().toISOString();
    }
    const { error } = await supabase.from("star_chamber_cases").update(updates).eq("id", caseId);
    return !error;
  } catch { return false; }
}

export async function addJudgeAnalysis(
  caseId: string,
  judge: "oracle" | "morpheus" | "red_queen" | "dredd",
  analysis: string,
): Promise<boolean> {
  try {
    const field = judge === "dredd" ? "dredd_verdict" : `${judge}_analysis`;
    const { error } = await supabase.from("star_chamber_cases").update({ [field]: analysis }).eq("id", caseId);
    return !error;
  } catch { return false; }
}

export async function setRecommendedAction(caseId: string, action: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("star_chamber_cases").update({
      recommended_action: action,
      status: "analysis_complete",
    }).eq("id", caseId);
    return !error;
  } catch { return false; }
}

export async function setFinalAction(caseId: string, action: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("star_chamber_cases").update({
      final_action: action,
      status: "verdict_reached",
      resolved_at: new Date().toISOString(),
    }).eq("id", caseId);
    return !error;
  } catch { return false; }
}

export async function setFounderOverride(caseId: string, reason: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("star_chamber_cases").update({
      founder_override: true,
      founder_override_reason: reason,
    }).eq("id", caseId);
    return !error;
  } catch { return false; }
}

// ============================================================================
// STATS
// ============================================================================

export async function fetchChamberStats(): Promise<{
  total: number; open: number; resolved: number; overrideRate: number;
}> {
  try {
    const { data, error } = await supabase.from("star_chamber_cases").select("status, founder_override");
    if (error || !data?.length) {
      return { total: SAMPLE_CASES.length, open: 1, resolved: 2, overrideRate: 20 };
    }
    const resolved = data.filter(c => c.status === "closed" || c.status === "verdict_reached").length;
    const overrides = data.filter(c => c.founder_override).length;
    return {
      total: data.length,
      open: data.filter(c => c.status === "open").length,
      resolved,
      overrideRate: data.length > 0 ? Math.round((overrides / data.length) * 100) : 0,
    };
  } catch {
    return { total: SAMPLE_CASES.length, open: 1, resolved: 2, overrideRate: 20 };
  }
}

// ============================================================================
// MAPPERS
// ============================================================================

function mapCase(row: any): StarChamberCase {
  return {
    id: row.id, caseNumber: row.case_number, caseType: row.case_type, title: row.title,
    complainantUserId: row.complainant_user_id, respondentUserId: row.respondent_user_id,
    description: row.description, evidence: row.evidence || [],
    oracleAnalysis: row.oracle_analysis, morpheusAnalysis: row.morpheus_analysis,
    redQueenAnalysis: row.red_queen_analysis, dreddVerdict: row.dredd_verdict,
    recommendedAction: row.recommended_action, finalAction: row.final_action,
    founderOverride: row.founder_override, founderOverrideReason: row.founder_override_reason,
    severity: row.severity, status: row.status,
    createdAt: row.created_at, resolvedAt: row.resolved_at,
  };
}
