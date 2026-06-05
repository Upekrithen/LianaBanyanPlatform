/**
 * PedestalNominatePage -- Wave 26 / Pedestal Nomination Flow
 * ===========================================================
 * Member nominates work for Pedestal consideration.
 * Writes to pedestal_vote_canon (nomination record) and IP Ledger.
 * Pedestal -> IP-Ledger tie established.
 *
 * BP072-W26
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Crown, Star, BookOpen, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logPedestalNomination } from "@/lib/nervous-system/ipLedger";

// ─── Types ────────────────────────────────────────────────────────────────────

type PedestalClass = "honorary" | "active" | "legacy" | "nominated";

interface NominationForm {
  recipientName: string;
  recipientSlug: string;
  pedestalClass: PedestalClass;
  workTitle: string;
  workDescription: string;
  workUrl: string;
  bountyRef: string;
  nominationRationale: string;
}

const EMPTY_FORM: NominationForm = {
  recipientName: "",
  recipientSlug: "",
  pedestalClass: "nominated",
  workTitle: "",
  workDescription: "",
  workUrl: "",
  bountyRef: "",
  nominationRationale: "",
};

// ─── Slug generator ───────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

// ─── Submit handler ───────────────────────────────────────────────────────────

async function submitNomination(
  form: NominationForm,
  userId: string,
): Promise<{ ok: boolean; pedestalId?: string; ledgerSeq?: number; error?: string }> {
  // 1. Write nomination to pedestal_vote_canon
  const slug =
    form.recipientSlug || slugify(`${form.workTitle}-${Date.now().toString(36)}`);

  const { data: pedData, error: pedError } = await (supabase
    .from("pedestal_vote_canon" as never)
    .insert({
      recipient_name: form.recipientName || form.workTitle,
      recipient_slug: slug,
      pedestal_class: form.pedestalClass,
      vote_status: "awaiting_initial_outreach",
      notes: form.nominationRationale,
    } as never)
    .select("id")
    .single()) as any;

  if (pedError) return { ok: false, error: pedError.message };

  // 2. Log to IP Ledger -- Pedestal -> IP Ledger tie
  const ledgerEntry = await logPedestalNomination({
    nominatedBy: userId,
    workTitle: form.workTitle,
    workDescription: form.workDescription,
    bountyRef: form.bountyRef || undefined,
  });

  return {
    ok: true,
    pedestalId: pedData?.id,
    ledgerSeq: ledgerEntry?.sequence_number,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PedestalNominatePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<NominationForm>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof NominationForm>(k: K, v: NominationForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => submitNomination(form, user!.id),
    onSuccess: (result) => {
      if (result.ok) {
        setSubmitted(true);
        qc.invalidateQueries({ queryKey: ["pedestal-vote-canon"] });
        toast({
          title: "Nomination submitted!",
          description: `Pedestal nomination logged to IP Ledger (seq #${result.ledgerSeq ?? "pending"}).`,
        });
      } else {
        toast({
          title: "Nomination failed",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({ title: "Nomination failed", variant: "destructive" });
    },
  });

  const isValid =
    form.workTitle.trim().length > 0 &&
    form.workDescription.trim().length > 0 &&
    form.nominationRationale.trim().length > 0;

  if (!user) {
    return (
      <PortalPageLayout maxWidth="md" xrayId="pedestal-nominate">
        <div className="py-20 text-center text-muted-foreground">
          <p>Sign in to nominate work for a Pedestal.</p>
          <Button className="mt-4" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  if (submitted) {
    return (
      <PortalPageLayout maxWidth="md" xrayId="pedestal-nominate-success">
        <GlobalBreadcrumbs />
        <Card className="mt-8">
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h2 className="text-xl font-bold mb-2">Nomination Submitted</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your nomination has been recorded in the IP Ledger and queued for governance
              review. The Pedestal governance council will evaluate the nomination.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link to="/governance/pedestal">
                  <Crown className="mr-1.5 h-4 w-4" />
                  View Governance Pedestals
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setSubmitted(false);
                }}
              >
                Nominate Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="lg" xrayId="pedestal-nominate">
      <GlobalBreadcrumbs />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/governance/pedestal")}
            className="gap-2 -ml-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Governance Pedestals
          </Button>
          <div className="flex items-center gap-3">
            <Crown className="h-7 w-7 text-amber-500" />
            <div>
              <h1 className="text-3xl font-bold">Nominate Work for Pedestal</h1>
              <p className="text-muted-foreground mt-0.5">
                Recognize outstanding cooperative contributions. Nominations are reviewed
                by the governance council and logged to the IP Ledger.
              </p>
            </div>
          </div>
        </div>

        {/* IP Ledger tie notice */}
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 px-4 py-3">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Provenance Record
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
              Every nomination writes an IP Ledger entry establishing contributor attribution.
              IP ownership: contributor retains attribution; platform receives non-exclusive license.
              "Provenance, not legal patent grant."
            </p>
          </div>
        </div>

        {/* NOT A GUARANTEE */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/8 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">NOT A GUARANTEE.</span> Pedestal nominations
            are participation records -- not equity, not financial instruments. Pedestals
            recognize cooperative contribution.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nomination Details</CardTitle>
            <CardDescription>
              Describe the work you are nominating. All fields will appear in the IP Ledger.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Work title */}
            <div className="space-y-1">
              <Label>Work Title *</Label>
              <Input
                value={form.workTitle}
                onChange={(e) => {
                  set("workTitle", e.target.value);
                  set("recipientName", e.target.value);
                  set("recipientSlug", slugify(e.target.value));
                }}
                placeholder="e.g. Spanish localization of membership agreement"
              />
            </div>

            {/* Work description */}
            <div className="space-y-1">
              <Label>Work Description *</Label>
              <Textarea
                rows={3}
                value={form.workDescription}
                onChange={(e) => set("workDescription", e.target.value)}
                placeholder="Describe what was done and why it matters to the cooperative."
              />
            </div>

            {/* Pedestal class */}
            <div className="space-y-1">
              <Label>Pedestal Class</Label>
              <Select
                value={form.pedestalClass}
                onValueChange={(v) => set("pedestalClass", v as PedestalClass)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nominated">Nominated (standard)</SelectItem>
                  <SelectItem value="active">Active (ongoing contribution)</SelectItem>
                  <SelectItem value="honorary">Honorary (exceptional contribution)</SelectItem>
                  <SelectItem value="legacy">Legacy (historical impact)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Work URL */}
            <div className="space-y-1">
              <Label>Work URL (optional)</Label>
              <Input
                value={form.workUrl}
                onChange={(e) => set("workUrl", e.target.value)}
                placeholder="https://... link to the work"
                type="url"
              />
            </div>

            {/* Bounty reference */}
            <div className="space-y-1">
              <Label>Bounty Reference (optional)</Label>
              <Input
                value={form.bountyRef}
                onChange={(e) => set("bountyRef", e.target.value)}
                placeholder="Bounty ID if this work came from a bounty"
              />
              <p className="text-xs text-muted-foreground">
                Linking a bounty reference strengthens the Pedestal - IP-Ledger tie.
              </p>
            </div>

            {/* Rationale */}
            <div className="space-y-1">
              <Label>Nomination Rationale *</Label>
              <Textarea
                rows={4}
                value={form.nominationRationale}
                onChange={(e) => set("nominationRationale", e.target.value)}
                placeholder="Why should this work receive a Pedestal? How did it benefit the cooperative?"
              />
            </div>

            {/* IP attribution preview */}
            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 mb-1">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-medium">IP Ledger Entry Preview</span>
                <Badge variant="outline" className="text-[10px] ml-auto">Provisional</Badge>
              </div>
              <p>
                Type: <span className="font-mono">pedestal.nominated</span>
                {" | "}Nominated by: <span className="font-mono">{user.id.slice(0, 8)}...</span>
                {" | "}Provenance: contributor attribution retained
              </p>
            </div>

            {/* Submit */}
            <Button
              className="w-full gap-2"
              disabled={!isValid || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              <Crown className="h-4 w-4" />
              {mutation.isPending ? "Submitting..." : "Submit Nomination"}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground border-t pt-4">
          Pedestal nominations are governance participation. NOT equity or financial return.
          IP: contributor retains attribution. Platform: non-exclusive license.
        </p>
      </div>
    </PortalPageLayout>
  );
}
