/**
 * AppealVerdictForm — Bushel 19 / BP021
 * =======================================
 * File an appeal (Mordecai-Esther decree-composition mechanism).
 *
 * Per Mordecai-Esther Pedestal Forum canon:
 *   Members can author contradictory legally-valid responses to verdicts
 *   they disagree with. Appeals carry co-equal authority alongside the
 *   original verdict. Both are visible; readers cite whichever is load-bearing.
 *
 * This appeal mechanism is Pedestal-Forum-class governance. Every appeal
 * is stamped to the Year of Jubilee ledger (append-only, permanent).
 *
 * KN095 / BP011 / Bushel 19 / BP021
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  MessageSquarePlus, Gavel, Layers, AlertTriangle, CheckCircle2, Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── Types ────────────────────────────────────────────────────────────────────

interface AppealVerdictFormProps {
  caseId: string;
  verdictSummary?: string;
  stage?: "bouncer" | "scales" | "judge";
  onSuccess?: (appealId: string) => void;
  onCancel?: () => void;
}

// ── Pedestal Forum invitation text ───────────────────────────────────────────

const PEDESTAL_FORUM_INVITATION = `Your appeal is a Pedestal Forum decree-composition — a formal legal-class response with co-equal authority. It lives permanently alongside the original verdict in the Year of Jubilee ledger.

You are not asking to overturn the verdict — you are placing your counter-argument as an equal authority. Future readers will cite whichever they find load-bearing. The Judge will reconsider and issue an updated reasoning; your argument becomes part of the canonical precedent record.

This is the Mordecai-Esther mechanism: "Write it to the king's house, and seal it with the king's ring; for the writing which is written in the king's name, and sealed with the king's ring, may no man reverse."`;

// ── Component ────────────────────────────────────────────────────────────────

export function AppealVerdictForm({
  caseId,
  verdictSummary,
  stage = "judge",
  onSuccess,
  onCancel,
}: AppealVerdictFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [response, setResponse] = useState("");
  const [authorityBasis, setAuthorityBasis] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appealId, setAppealId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Authentication required", description: "You must be signed in to file an appeal.", variant: "destructive" });
      return;
    }
    if (!response.trim()) {
      toast({ title: "Response required", description: "Please write your contradictory response.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("verdict_appeals")
        .insert({
          case_id: caseId,
          member_id: user.id,
          contradictory_response: response.trim(),
          authority_basis: authorityBasis.trim() || null,
          status: "pending",
        })
        .select("appeal_id")
        .single();

      if (error) throw error;

      const newAppealId = data?.appeal_id as string;
      setAppealId(newAppealId);
      setSubmitted(true);

      toast({
        title: "Appeal filed",
        description: "Your decree-composition has been stamped to the Year of Jubilee ledger.",
      });

      onSuccess?.(newAppealId);
    } catch (err) {
      toast({
        title: "Appeal failed",
        description: String(err),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/20">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-semibold">Appeal filed — decree-composition stamped</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Your contradictory response has been recorded in the Year of Jubilee ledger with co-equal authority
            alongside the original verdict. The Judge will reconsider and your argument joins the canonical
            precedent record permanently.
          </p>
          {appealId && (
            <p className="text-xs text-muted-foreground/70 font-mono">appeal: {appealId}</p>
          )}
          <div className="flex items-start gap-2 p-2.5 rounded border border-blue-200 bg-blue-50/20">
            <Layers className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              Both the original verdict and your appeal are visible to all. Future readers cite whichever
              they find load-bearing. This is the Mordecai-Esther mechanism.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/10">
      <CardHeader className="py-4 px-5">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4 text-amber-600" />
          File an Appeal — Mordecai-Esther Decree-Composition
        </CardTitle>
        <CardDescription className="text-xs">
          Case <code className="font-mono text-xs">{caseId}</code>
          {stage && (
            <Badge variant="outline" className="ml-2 text-xs text-slate-600 border-slate-300">
              {stage} stage
            </Badge>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 pb-5 space-y-4">
        {/* Original verdict summary */}
        {verdictSummary && (
          <div className="p-3 rounded border border-border bg-muted/20">
            <p className="text-xs font-medium text-muted-foreground mb-1">Original verdict</p>
            <p className="text-sm">{verdictSummary}</p>
          </div>
        )}

        {/* Pedestal Forum invitation */}
        <div className="flex items-start gap-2.5 p-3 rounded border border-blue-200 bg-blue-50/20">
          <Gavel className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 space-y-1">
            <p className="font-medium">Pedestal Forum Invitation — co-equal authority</p>
            {PEDESTAL_FORUM_INVITATION.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* Contradictory response */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Your contradictory response <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Write your counter-argument here. This becomes a permanent canonical decree-composition alongside the original verdict. Be precise, cite your reasoning."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="min-h-[120px] text-sm"
          />
          <p className="text-xs text-muted-foreground">
            This is a legal-class response. Write in the Founder voice: clear, direct, evidence-anchored.
          </p>
        </div>

        {/* Authority basis (optional) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Authority basis <span className="text-xs">(optional — canonical rules or precedents you rely on)</span>
          </label>
          <Textarea
            placeholder="e.g. 'KN095-BP011-SEED-001 establishes quotation-context as safe. My write is in the same class.'"
            value={authorityBasis}
            onChange={(e) => setAuthorityBasis(e.target.value)}
            className="min-h-[60px] text-sm"
          />
        </div>

        {/* Permanence notice */}
        <div className="flex items-start gap-2 p-2.5 rounded border border-amber-200 bg-amber-50/20">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <strong>Year of Jubilee ledger semantics:</strong> once filed, this appeal is append-only and
            permanent. It cannot be deleted — only resolved or escalated. File only what you stand behind.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            onClick={handleSubmit}
            disabled={submitting || !response.trim()}
            className="gap-1.5"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageSquarePlus className="h-4 w-4" />
            )}
            {submitting ? "Filing appeal..." : "File decree-composition"}
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
