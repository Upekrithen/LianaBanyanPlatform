/**
 * MikeyBusinessPlanTemplate -- BP072 Wave 3 / Scope 12
 * =====================================================
 * Reusable step-by-step business-plan get-started template.
 * Mikey is the first instance; every future bounty-to-hire can
 * use this template as a starting point.
 *
 * "Improving the template earns Marks" -- contributions to the
 * template itself can be submitted as a sub-bounty.
 *
 * Securities-clean: Marks = participation, not equity or guaranteed payout.
 *
 * Usage:
 *   <MikeyBusinessPlanTemplate
 *     instanceName="Mikey"
 *     focus="Local Business Development"
 *     founderNote="First cooperative hire. Learning-by-doing business planning."
 *   />
 *
 * The template is also exported as a plain-markdown string for PDF export.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CheckCircle, Circle, Download, Star, AlertCircle } from "lucide-react";

export interface BusinessPlanTemplateProps {
  instanceName: string;
  focus: string;
  founderNote?: string;
  showSubBountyOption?: boolean;
}

interface BizPlanStep {
  id: number;
  label: string;
  prompt: string;
  example: string;
  earnsMarksNote: string;
}

const TEMPLATE_STEPS: BizPlanStep[] = [
  {
    id: 1,
    label: "The Problem I'm Solving",
    prompt:
      "Describe the specific problem you are solving in one paragraph. " +
      "Who is affected? How are they currently dealing with it?",
    example:
      "Example: 'Local plumbers in my area spend 6 hours/week chasing unpaid invoices. " +
      "Most use paper invoices and have no system for follow-up.'",
    earnsMarksNote:
      "Clear problem statements that reference real people and real friction earn Marks for specificity.",
  },
  {
    id: 2,
    label: "Who I'm Serving (First 10 Customers)",
    prompt:
      "Name your first 10 hypothetical or actual customers. Be specific: person or business type, " +
      "location, and why they would pay for your solution.",
    example:
      "Example: '1. Mike's Plumbing (San Antonio, TX) -- 2-person shop, no invoicing software. " +
      "2. Maria's Catering (local) -- runs on Excel, loses track of deposits.'",
    earnsMarksNote:
      "Specific customer names and contexts (even hypothetical) earn more Marks than generic segments.",
  },
  {
    id: 3,
    label: "What I'm Offering (One Sentence)",
    prompt:
      "State your offering in one sentence. Format: 'I help [WHO] do [WHAT] so they can [OUTCOME].'",
    example:
      "Example: 'I help local service providers automate invoice follow-up so they get paid " +
      "faster without spending hours on the phone.'",
    earnsMarksNote:
      "One-sentence clarity is a skill. Revisions that tighten the sentence earn Marks.",
  },
  {
    id: 4,
    label: "How I Make Money (Cost+20% model)",
    prompt:
      "Describe your pricing model. How does Cost+20% apply to your work? " +
      "What are your direct costs? What is the 20% platform margin? " +
      "What does the customer pay and what do you keep (83.3%)?",
    example:
      "Example: 'My direct cost to serve one client = $50/month (my time + software). " +
      "Platform price = $50 x 1.20 = $60/month. Customer pays $60. " +
      "I keep $50 (83.3%). Platform keeps $10 (16.7%, which covers infrastructure + 20% margin).'",
    earnsMarksNote:
      "Accurate Cost+20% math earns Marks. Errors in the math flag for correction (also earns Marks for the reviewer).",
  },
  {
    id: 5,
    label: "My First 90 Days (Milestones)",
    prompt:
      "List 3 milestones for your first 90 days. Each milestone should be verifiable " +
      "(something that can be confirmed by a second person).",
    example:
      "Example: 'Day 30: First paying client signed. Day 60: First invoice follow-up automated. " +
      "Day 90: Second client onboarded, first Marks earned from sub-bounty.'",
    earnsMarksNote:
      "Milestones that reference bounties or sub-bounties within the cooperative earn extra Marks.",
  },
  {
    id: 6,
    label: "What Help I Need (Sub-Bounty Opportunities)",
    prompt:
      "List 1-3 tasks you could post as sub-bounties within the cooperative. " +
      "Other members completing these tasks earns them Marks.",
    example:
      "Example: '1. Design a one-page client intake form (2 Marks). " +
      "2. Translate this business plan to Spanish (3 Marks). " +
      "3. Find 3 local service businesses who want a demo (5 Marks).'",
    earnsMarksNote:
      "Well-defined sub-bounties that actually get picked up and completed " +
      "earn the template author relationship Marks.",
  },
];

export function MikeyBusinessPlanTemplate({
  instanceName,
  focus,
  founderNote,
  showSubBountyOption = true,
}: BusinessPlanTemplateProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const setAnswer = (id: number, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const toggleDone = (id: number) =>
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const exportMarkdown = () => {
    const lines: string[] = [
      `# Business Plan: ${instanceName}`,
      `## Focus Area: ${focus}`,
      "",
    ];
    if (founderNote) {
      lines.push(`> ${founderNote}`);
      lines.push("");
    }
    for (const step of TEMPLATE_STEPS) {
      lines.push(`## ${step.id}. ${step.label}`);
      lines.push("");
      lines.push(answers[step.id] || "[not yet answered]");
      lines.push("");
    }
    lines.push("---");
    lines.push(
      "_Marks represent participation in the Liana Banyan cooperative -- " +
        "not equity, shares, or guaranteed financial return._"
    );

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${instanceName.toLowerCase().replace(/\s+/g, "-")}-business-plan.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progress = completedSteps.size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs">
            Business Plan Template
          </Badge>
          <Badge className="bg-emerald-100 text-emerald-700 text-xs">
            Instance: {instanceName}
          </Badge>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{focus}</h2>
        {founderNote && (
          <p className="text-sm text-slate-500 mt-1 italic">{founderNote}</p>
        )}
        <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{progress} of {TEMPLATE_STEPS.length} steps marked done</span>
        </div>
      </div>

      {/* Steps */}
      {TEMPLATE_STEPS.map((step) => {
        const done = completedSteps.has(step.id);
        return (
          <Card key={step.id} className={done ? "border-emerald-200 bg-emerald-50/30" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleDone(step.id)}
                  aria-label={done ? "Mark as incomplete" : "Mark as done"}
                  className="mt-0.5 shrink-0"
                >
                  {done ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </button>
                <CardTitle className="text-base">
                  {step.id}. {step.label}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pl-11">
              <p className="text-sm text-slate-600 leading-relaxed">{step.prompt}</p>
              <Textarea
                rows={4}
                value={answers[step.id] || ""}
                onChange={(e) => setAnswer(step.id, e.target.value)}
                placeholder={step.example}
                className="text-sm"
                aria-label={`Answer for: ${step.label}`}
              />
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded">
                <Star className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                <span>{step.earnsMarksNote}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Sub-bounty note */}
      {showSubBountyOption && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-dashed border-slate-200">
          <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div className="text-sm text-slate-500">
            <strong className="text-slate-700">Improving this template earns Marks.</strong>{" "}
            If you find a step confusing, add clarity, or discover a step that belongs here
            but is missing -- submit a sub-bounty. Other members reviewing and approving your
            improvement also earn Marks.
          </div>
        </div>
      )}

      {/* Export */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={exportMarkdown} className="gap-2">
          <Download className="w-4 h-4" />
          Export as Markdown
        </Button>
        <span className="text-xs text-slate-400">
          Marks disclosure: Marks = cooperative participation, not equity or guaranteed return.
        </span>
      </div>
    </div>
  );
}
