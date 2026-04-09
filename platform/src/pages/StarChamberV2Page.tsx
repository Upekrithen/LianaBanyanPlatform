import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, ProofStripItem, StickyMobileCTA } from "@/components/v2";
import {
  ActiveCaseDetails,
  ActiveCaseWorkspace,
  AuditEntry,
  AuditTrailTable,
  CaseQueueGrid,
  EscalationLadder,
  FinalRulingCard,
  FourJudgeExplainer,
  JudgeDescriptor,
  JudgeReasoningMatrix,
  StarCase,
} from "@/components/v2/star-chamber";
import { useTourTarget } from "@/hooks/useTourTarget";
import { supabase } from "@/integrations/supabase/client";

const PROOF_STRIP: ProofStripItem[] = [
  "Oracle, Morpheus, Red Queen, Dredd",
  "Claude + Perplexity backends",
  "Areopagus escalation",
  "founder override for exceptional cases",
];

const JUDGES: JudgeDescriptor[] = [
  { name: "Oracle", backend: "Claude", role: "Context integrity and precedent alignment." },
  { name: "Morpheus", backend: "Claude", role: "Scenario framing and impact pathway analysis." },
  { name: "Red Queen", backend: "Perplexity", role: "External signal check and contradiction detection." },
  { name: "Dredd", backend: "Perplexity", role: "Convergence review and ruling discipline." },
];

type CaseRow = {
  id: string;
  case_number: number;
  case_type: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
  oracle_analysis: string | null;
  morpheus_analysis: string | null;
  red_queen_analysis: string | null;
  dredd_verdict: string | null;
  recommended_action: string | null;
  final_action: string | null;
  founder_override: boolean;
  founder_override_reason: string | null;
  resolved_at: string | null;
};

function mapCaseRow(row: CaseRow): ActiveCaseDetails {
  return {
    id: row.id,
    caseNumber: row.case_number,
    title: row.title,
    caseType: row.case_type,
    severity: row.severity,
    status: row.status,
    createdAt: row.created_at,
    description: row.description,
    oracle: row.oracle_analysis,
    morpheus: row.morpheus_analysis,
    redQueen: row.red_queen_analysis,
    dredd: row.dredd_verdict,
    recommendedAction: row.recommended_action,
    finalAction: row.final_action,
    founderOverride: row.founder_override,
    founderOverrideReason: row.founder_override_reason,
    resolvedAt: row.resolved_at,
  };
}

export default function StarChamberV2Page() {
  const tourTarget = useTourTarget("star-chamber");
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  const casesQuery = useQuery({
    queryKey: ["star-chamber-v2-cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("star_chamber_cases")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as CaseRow[];
    },
  });

  const verdictsQuery = useQuery({
    queryKey: ["star-chamber-v2-verdicts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("star_chamber_verdicts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(40);
      if (error) return [];
      return (data ?? []) as Array<{ id: string; created_at: string | null; agent_name: string; decision: string; reasoning: string }>;
    },
  });

  const roundTablesQuery = useQuery({
    queryKey: ["star-chamber-v2-round-tables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("round_tables")
        .select("id,status")
        .eq("status", "active")
        .limit(20);
      if (error) return [];
      return (data ?? []) as Array<{ id: string; status: string }>;
    },
  });

  const activeCases: ActiveCaseDetails[] = useMemo(
    () =>
      (casesQuery.data ?? [])
        .map(mapCaseRow)
        .filter((row) => row.status !== "closed"),
    [casesQuery.data],
  );

  const queueRows: StarCase[] = useMemo(
    () =>
      activeCases.map((row) => ({
        id: row.id,
        caseNumber: row.caseNumber,
        title: row.title,
        caseType: row.caseType,
        severity: row.severity,
        status: row.status,
        createdAt: row.createdAt,
      })),
    [activeCases],
  );

  const selectedCase = useMemo(
    () => activeCases.find((row) => row.id === activeCaseId) ?? activeCases[0] ?? null,
    [activeCaseId, activeCases],
  );

  const auditEntries: AuditEntry[] = useMemo(() => {
    const base: AuditEntry[] = (casesQuery.data ?? []).slice(0, 10).map((row) => ({
      id: `case-${row.id}`,
      timestamp: row.created_at,
      event: `Case #${row.case_number} filed`,
      detail: row.title,
    }));
    const verdictEntries: AuditEntry[] = (verdictsQuery.data ?? []).slice(0, 10).map((row) => ({
      id: `verdict-${row.id}`,
      timestamp: row.created_at ?? new Date().toISOString(),
      event: `${row.agent_name} decision`,
      detail: row.decision,
    }));
    return [...base, ...verdictEntries]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 14);
  }, [casesQuery.data, verdictsQuery.data]);

  return (
    <AppShell
      xrayBase="star-chamber"
      pageTitle="Star Chamber"
      breadcrumbs="Member workspace / Star Chamber"
      hero={
        <Hero
          variant="app"
          eyebrow="Star Chamber"
          headline="Structured review for hard cases."
          body="Star Chamber brings four distinct AI judges into one disciplined review process, with clear reasoning paths, escalation context, and exceptional-case founder override."
          primaryCTA={{ label: "Open active cases", href: "#case-queue-grid" }}
          secondaryCTA={{ label: "How review works", href: "#four-judge-explainer" }}
          proofStrip={PROOF_STRIP}
        />
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />

        <FourJudgeExplainer judges={JUDGES} />
        <CaseQueueGrid items={queueRows} onOpen={setActiveCaseId} />
        <ActiveCaseWorkspace item={selectedCase} />
        <JudgeReasoningMatrix item={selectedCase} />
        <EscalationLadder activeRoundTables={(roundTablesQuery.data ?? []).length} />
        <FinalRulingCard item={selectedCase} />
        <AuditTrailTable entries={auditEntries} />

        <StickyMobileCTA primary={{ label: "Open active cases", href: "#case-queue-grid" }} />
      </div>
    </AppShell>
  );
}
