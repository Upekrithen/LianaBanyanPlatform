import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ActiveBillsList,
  BillItem,
  IssueCategory,
  IssueOption,
  IssuePicker,
  LegislativeStoryPanel,
  LetterStudio,
  LetterTemplateItem,
  RepRecipient,
  SubmissionFlow,
  TemplatePicker,
} from "@/components/v2/political-expedition";

const ISSUE_OPTIONS: IssueOption[] = [
  {
    key: "cooperatives",
    label: "Cooperatives",
    chapterSnippet: "Committee language is shaping how cooperative entities are recognized in local programs.",
  },
  {
    key: "food_security",
    label: "Food Security",
    chapterSnippet: "Funding amendments are deciding whether community distribution channels stay resilient.",
  },
  {
    key: "housing",
    label: "Housing",
    chapterSnippet: "Subsidy and zoning clauses are shifting in ways that affect member housing pathways.",
  },
  {
    key: "small_business",
    label: "Small Business",
    chapterSnippet: "Procurement and compliance language is changing how small operators can participate.",
  },
  {
    key: "transportation",
    label: "Transportation",
    chapterSnippet: "Mobility bills are balancing commuter safety, access, and cooperative delivery logistics.",
  },
];

function topicToIssue(topic: string): IssueCategory {
  if (topic === "cooperative") return "cooperatives";
  return topic as IssueCategory;
}

export default function PoliticalExpeditionV2Page() {
  const { user } = useAuth();
  const tourTarget = useTourTarget("political-expedition");
  const [issue, setIssue] = useState<IssueCategory>("cooperatives");
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [letter, setLetter] = useState("");

  const savedRepsQuery = useQuery({
    queryKey: ["political-v2-saved-reps", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("member_reps")
        .select("rep_id, rep_cache(*)")
        .eq("user_id", user!.id)
        .order("saved_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Array<{ rep_id: string; rep_cache: { name: string; title: string; state: string; district: string | null } }>;
    },
  });

  const billsQuery = useQuery({
    queryKey: ["political-v2-bills", issue, user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tracked_bills")
        .select("id,bill_number,title,summary,status,tags")
        .contains("tags", [issue])
        .order("last_action_date", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        bill_number: string;
        title: string;
        summary: string | null;
        status: string | null;
        tags: string[] | null;
      }>;
    },
  });

  const templatesQuery = useQuery({
    queryKey: ["political-v2-templates"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("rep_letter_templates")
        .select("id,title,topic,template_body")
        .eq("is_active", true);
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; title: string; topic: string; template_body: string }>;
    },
  });

  const recipients = useMemo<RepRecipient[]>(
    () =>
      (savedRepsQuery.data ?? []).map((rep) => ({
        id: rep.rep_id,
        name: rep.rep_cache.name,
        title: rep.rep_cache.title,
        state: rep.rep_cache.state,
        district: rep.rep_cache.district,
      })),
    [savedRepsQuery.data],
  );

  const activeBills = useMemo<BillItem[]>(
    () =>
      (billsQuery.data ?? []).map((bill) => ({
        id: bill.id,
        billNumber: bill.bill_number,
        title: bill.title,
        summary: bill.summary,
        status: bill.status,
        districtTag: recipients[0]?.district ? `${recipients[0]?.state}-${recipients[0]?.district}` : recipients[0]?.state || "District lookup",
      })),
    [billsQuery.data, recipients],
  );

  const templates = useMemo<LetterTemplateItem[]>(
    () =>
      (templatesQuery.data ?? [])
        .map((template) => ({
          id: template.id,
          title: template.title,
          topic: topicToIssue(template.topic),
          templateBody: template.template_body,
        }))
        .filter((template) => ISSUE_OPTIONS.some((option) => option.key === template.topic)),
    [templatesQuery.data],
  );

  const issueTemplates = useMemo(() => templates.filter((template) => template.topic === issue), [templates, issue]);
  const selectedIssueSnippet = ISSUE_OPTIONS.find((option) => option.key === issue)?.chapterSnippet || "";

  const selectedBill = useMemo(() => activeBills.find((bill) => bill.id === selectedBillId) ?? null, [activeBills, selectedBillId]);
  const selectedRecipient = useMemo(
    () => recipients.find((recipient) => recipient.id === selectedRecipientId) ?? null,
    [recipients, selectedRecipientId],
  );

  return (
    <AppShell
      xrayBase="political-expedition"
      pageTitle="Political Expedition"
      breadcrumbs="Member workspace / Civic engagement"
      hero={
        <Hero
          variant="app"
          eyebrow="Don't just follow politics-enter the story"
          headline="From confused scroll to one letter that lands where it counts."
          body="Starts from your concern, narrates you into the legislative story, then sits you down in a letter studio tuned for your issue, district, and bill."
          primaryCTA={{ label: "Pick my issue", href: "#political-expedition-issue-picker-anchor" }}
          secondaryCTA={{ label: "Browse active bills", href: "#political-expedition-bills-anchor" }}
          proofStrip={["Issue cards", "Live chapters", "Letter studio"]}
        />
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />

        <div id="political-expedition-issue-picker-anchor">
          <IssuePicker
            issues={ISSUE_OPTIONS}
            activeIssue={issue}
            onSelect={(nextIssue) => {
              setIssue(nextIssue);
              setSelectedBillId(null);
            }}
          />
        </div>

        <LegislativeStoryPanel issueLabel={ISSUE_OPTIONS.find((item) => item.key === issue)?.label || issue} snippet={selectedIssueSnippet} />

        <div id="political-expedition-bills-anchor">
          <ActiveBillsList bills={activeBills} selectedBillId={selectedBillId} onSelectBill={setSelectedBillId} />
        </div>

        <LetterStudio letter={letter} onLetterChange={setLetter} />

        <TemplatePicker
          templates={issueTemplates}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={(templateId) => {
            setSelectedTemplateId(templateId);
            const selectedTemplate = issueTemplates.find((template) => template.id === templateId);
            if (selectedTemplate) {
              const seeded = `${selectedTemplate.templateBody}\n\nBill reference: ${selectedBill?.billNumber || "[select bill]"}\nDistrict: ${
                selectedRecipient?.district ? `${selectedRecipient.state}-${selectedRecipient.district}` : selectedRecipient?.state || "[select recipient]"
              }\n`;
              setLetter(seeded);
            }
          }}
        />

        <SubmissionFlow
          recipients={recipients}
          selectedRecipientId={selectedRecipientId}
          onSelectRecipient={setSelectedRecipientId}
          onReview={() => {
            if (!selectedBill) {
              toast.error("Select a bill before review.");
              return;
            }
            toast.success("Review ready. Confirm your edits and send.");
          }}
          onSend={() => {
            if (!selectedRecipient || !selectedBill || !letter.trim()) {
              toast.error("Complete issue, bill, recipient, and letter before send.");
              return;
            }
            const subject = encodeURIComponent(`Constituent letter on ${selectedBill.billNumber}`);
            const body = encodeURIComponent(letter);
            window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
          }}
          canReview={Boolean(selectedBillId && selectedRecipientId)}
          canSend={Boolean(selectedBillId && selectedRecipientId && letter.trim())}
        />

        <StickyMobileCTA primary={{ label: letter.trim() ? "Review" : "Continue", href: "#political-expedition-bills-anchor" }} />
      </div>
    </AppShell>
  );
}
