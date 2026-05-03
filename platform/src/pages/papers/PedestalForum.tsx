/**
 * PedestalForum — Mordecai-Esther Pedestal Forum surface stub
 * ============================================================
 * Bushel 13 / Phase D — BP021 Ratified
 *
 * Composes:
 *   - mordecai_esther_pedestal_forum_decree_composition_paper_collaboration_canon_bp021.eblet.md
 *   - pedestal_forum_section_11_boilerplate_for_all_save_the_world_papers_canon_bp021.eblet.md
 *   - paper_class_a_considered_approach_to_universal_series_12_papers_canon_bp021.eblet.md
 *   - project_year_of_jubilee_ledger_architecture.md (append-only ledger for additions)
 *
 * Mechanism: Mordecai-Esther Decree-Composition Pattern.
 *   The original paper is immutable. Member additions compose alongside with co-equal authority.
 *   Additions can be CONTRADICTORY, EXTENDING, or BOTH. Each addition is permanently stamped.
 *   No editorial-class authority. The composed paper + additions IS the discussion forum.
 *
 * Backend: paper_pedestal_forum_additions table (Supabase migration 20260503150000)
 *
 * Route: /papers/:paperId/pedestal-forum
 *
 * Augur-Pricing exemption: IP-Pedestal / patent-class context; membership-orthogonal.
 */

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  ScrollText,
  PlusCircle,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// ─── Paper registry (canonical 12 + overarching) ────────────────────────────
// Source: paper_class_a_considered_approach_to_universal_series_12_papers_canon_bp021.eblet.md

const PAPERS: Record<string, { title: string; subtitle?: string }> = {
  "1": { title: "A Considered Approach to Universal Sustained Economic Prosperity" },
  "2": { title: "A Considered Approach to DNA-Engineered AI" },
  "3": { title: "A Considered Approach to Universal Abundant Low Cost Energy" },
  "4": { title: "A Considered Approach to Abolishing World Hunger" },
  "5": { title: "A Considered Approach to Decentralized Factory Manufacturing" },
  "6": { title: "A Considered Approach to Resolving Political Conflict" },
  "7": { title: "A Considered Approach to Health Care" },
  "8": {
    title: "A Considered Approach to Engineering Conducted AI",
    subtitle: "The Substrate Orchestra in Symphony",
  },
  "9": { title: "A Considered Approach to Universal Lifelong Learning" },
  "10": { title: "A Considered Approach to Universal Cooperative Shelter" },
  "11": { title: "A Considered Approach to Universal Caregiving" },
  "12": { title: "A Considered Approach to Universal Earth Stewardship" },
  "6-steps": { title: "How to Save the World in 6 Easy Steps" },
};

// ─── Types ───────────────────────────────────────────────────────────────────

type AdditionClass = "contradictory" | "extending" | "both";

interface PedestalAddition {
  id: string;
  paper_id: string;
  author_display_name: string;
  addition_class: AdditionClass;
  title: string;
  body: string;
  created_at: string;
  year_of_jubilee_stamp?: string;
}

// ─── Section 11 boilerplate ──────────────────────────────────────────────────
// Source: pedestal_forum_section_11_boilerplate_for_all_save_the_world_papers_canon_bp021.eblet.md
// Preserve verbatim per canonical boilerplate.

const SECTION_11_COPY = `This paper is published as an immutable original. It will not be revised.

We're inviting collaboration in the manner of the Law of the Medes and Persians — the way Mordecai and Queen Esther bypassed the restrictions of an unchangeable decree by issuing a contradictory, legally valid response that coexisted alongside it.

Each paper in the Save-the-World Series has a Pedestal Forum where members can author additions of co-equal authority — contradictory, extending, or both. Additions don't revise the original; they compose alongside it. Each addition gets its own Pedestal: visibility, ownership, agency. Every addition is stamped to the Year of Jubilee append-only ledger and is permanent.

No editorial-class authority decides which additions matter. The composed paper-plus-additions IS the discussion forum. Readers cite which Pedestal-additions they find load-bearing.

We're publishing what we found and built. Your additions would have co-equal authority to ours. We're not asking you to validate the canon; we're asking you to compose alongside it.

— LB Cooperative`;

// ─── Components ──────────────────────────────────────────────────────────────

function AdditionCard({ addition }: { addition: PedestalAddition }) {
  const [expanded, setExpanded] = useState(false);

  const classColors: Record<AdditionClass, string> = {
    contradictory: "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20",
    extending: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20",
    both: "border-violet-200 dark:border-violet-800 bg-violet-50/30 dark:bg-violet-950/20",
  };
  const classBadge: Record<AdditionClass, string> = {
    contradictory: "Contradictory",
    extending: "Extending",
    both: "Contradictory + Extending",
  };

  return (
    <Card className={cn("border", classColors[addition.addition_class])}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {classBadge[addition.addition_class]}
          </Badge>
          <span className="text-xs text-muted-foreground ml-auto">
            {addition.author_display_name} · {new Date(addition.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm font-semibold">{addition.title}</p>
        <div
          className={cn(
            "text-sm text-muted-foreground leading-relaxed overflow-hidden transition-all",
            expanded ? "max-h-none" : "max-h-24"
          )}
        >
          <p className="whitespace-pre-wrap">{addition.body}</p>
        </div>
        {addition.body.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" /> Read more</>
            )}
          </button>
        )}
        {addition.year_of_jubilee_stamp && (
          <p className="text-xs text-muted-foreground/60 font-mono">
            Jubilee stamp: {addition.year_of_jubilee_stamp}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PedestalForum() {
  const { paperId } = useParams<{ paperId: string }>();
  const { user } = useAuth();

  const [additions, setAdditions] = useState<PedestalAddition[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formClass, setFormClass] = useState<AdditionClass>("extending");
  const [formDisplayName, setFormDisplayName] = useState("");

  const paper = paperId ? PAPERS[paperId] : null;

  async function loadAdditions() {
    if (!paperId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("paper_pedestal_forum_additions")
        .select("*")
        .eq("paper_id", paperId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setAdditions((data as PedestalAddition[]) ?? []);
    } catch {
      // Graceful stub: table may not exist yet in some environments
      setAdditions([]);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }

  async function submitAddition() {
    if (!paperId || !user || !formTitle.trim() || !formBody.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { error } = await supabase
        .from("paper_pedestal_forum_additions")
        .insert({
          paper_id: paperId,
          member_user_id: user.id,
          author_display_name: formDisplayName.trim() || "Anonymous Member",
          addition_class: formClass,
          title: formTitle.trim(),
          body: formBody.trim(),
        });
      if (error) throw error;
      setSubmitSuccess(true);
      setFormTitle("");
      setFormBody("");
      setFormDisplayName("");
      setSubmitOpen(false);
      await loadAdditions();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit addition — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Load on mount if paperId present
  if (!loaded && !loading && paperId) {
    loadAdditions();
  }

  if (!paper) {
    return (
      <PortalPageLayout maxWidth="xl" xrayId="pedestal-forum-404">
        <div className="space-y-4 py-12 text-center">
          <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Paper not found: <code className="text-xs">{paperId}</code></p>
          <Button variant="outline" asChild>
            <Link to="/papers">Browse All Papers</Link>
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="xl" xrayId="pedestal-forum">
      <div className="space-y-8">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <ScrollText className="w-5 h-5 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">Pedestal Forum</Badge>
          </div>
          <h1 className="text-2xl font-bold leading-tight">{paper.title}</h1>
          {paper.subtitle && (
            <p className="text-base text-muted-foreground italic">{paper.subtitle}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Paper #{paperId} of the 12-Paper Save-the-World Series
          </p>
        </div>

        {/* ── Section 11 — Collaboration via Pedestal Forum (canonical) ────── */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Section 11 — Collaboration via Pedestal Forum
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {SECTION_11_COPY}
            </p>
          </CardContent>
        </Card>

        {/* ── Submit new addition ───────────────────────────────────────────── */}
        {user ? (
          <div className="space-y-3">
            <Button
              variant={submitOpen ? "secondary" : "default"}
              onClick={() => { setSubmitOpen(!submitOpen); setSubmitSuccess(false); }}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {submitOpen ? "Cancel" : "Add Your Decree-Composition"}
            </Button>

            {submitSuccess && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Your addition has been stamped to the Pedestal Forum. It is permanent.
              </div>
            )}

            {submitOpen && (
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="addition-class" className="text-sm font-medium">
                      Addition type
                    </Label>
                    <div className="flex gap-2 flex-wrap" id="addition-class">
                      {([
                        ["extending", "Extending"],
                        ["contradictory", "Contradictory"],
                        ["both", "Both"],
                      ] as [AdditionClass, string][]).map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => setFormClass(val)}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs border transition-all",
                            formClass === val
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-muted-foreground/50"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per the Mordecai-Esther Decree-Composition pattern — all three are co-equal
                      in authority with the original paper.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="addition-display-name" className="text-sm font-medium">
                      Display name (optional)
                    </Label>
                    <Input
                      id="addition-display-name"
                      value={formDisplayName}
                      onChange={(e) => setFormDisplayName(e.target.value)}
                      placeholder="Your name or handle (defaults to Anonymous Member)"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="addition-title" className="text-sm font-medium">
                      Addition title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="addition-title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Name your decree-composition addition"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="addition-body" className="text-sm font-medium">
                      Addition body <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="addition-body"
                      value={formBody}
                      onChange={(e) => setFormBody(e.target.value)}
                      placeholder="Your addition — contradictory, extending, or both. Co-equal authority with the original paper."
                      rows={6}
                      className="text-sm"
                    />
                  </div>

                  {submitError && (
                    <div className="flex gap-2 items-start text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {submitError}
                    </div>
                  )}

                  <div className="flex items-center gap-3 justify-end">
                    <p className="text-xs text-muted-foreground italic flex-1">
                      Once stamped, your addition is permanent — append-only ledger, Year of Jubilee.
                    </p>
                    <Button
                      onClick={submitAddition}
                      disabled={submitting || !formTitle.trim() || !formBody.trim()}
                      size="sm"
                    >
                      {submitting ? "Stamping…" : "Stamp to Pedestal Forum"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-5 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Join the cooperative to add a decree-composition to this paper's Pedestal Forum.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/join">
                  Join — $5/year
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Additions list ────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold">
            Pedestal Additions ({additions.length})
          </h2>

          {loading && (
            <p className="text-sm text-muted-foreground">Loading additions…</p>
          )}

          {loaded && additions.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  No additions yet. Be the first to compose alongside this paper.
                </p>
              </CardContent>
            </Card>
          )}

          {additions.map((addition) => (
            <AdditionCard key={addition.id} addition={addition} />
          ))}
        </div>

        {/* ── Back to paper index ───────────────────────────────────────────── */}
        <div className="pt-4 border-t border-border">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/papers">← All Papers</Link>
          </Button>
        </div>

      </div>
    </PortalPageLayout>
  );
}
