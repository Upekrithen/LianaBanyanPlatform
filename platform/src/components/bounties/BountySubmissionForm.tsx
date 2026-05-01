/**
 * BountySubmissionForm — community member submits work for a Bounty
 * KN088 / BP009.
 * Calls the bounty-submission-receive edge function, which routes to
 * bounty-furnace-verify for gear-tooth-fit scoring.
 * data-xray-id: bounty-submission-form
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { FeaturedBounty } from "@/data/featured_bounties_bp009";

interface BountySubmissionFormProps {
  bounty: FeaturedBounty;
  bountyDbId?: string;
  onSuccess?: () => void;
}

interface SubmissionResult {
  submissionId: string;
  status: string;
  furnaceScore: number | null;
}

export function BountySubmissionForm({
  bounty,
  bountyDbId,
  onSuccess,
}: BountySubmissionFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [hardwarePlatform, setHardwarePlatform] = useState("");
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const submitMutation = useMutation<SubmissionResult, Error>({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to submit a Bounty");
      if (!title.trim()) throw new Error("Give your submission a title");
      if (!description.trim()) throw new Error("Describe your work and evidence");

      const { data, error } = await supabase.functions.invoke("bounty-submission-receive", {
        body: {
          bounty_slug: bounty.slug,
          bounty_db_id: bountyDbId ?? null,
          submitter_id: user.id,
          title: title.trim(),
          description: description.trim(),
          evidence_url: evidenceUrl.trim() || null,
          hardware_platform: hardwarePlatform.trim() || null,
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error ?? "Submission failed");

      return {
        submissionId: data.submission_id,
        status: data.status,
        furnaceScore: data.furnace_score ?? null,
      };
    },
    onSuccess: (res) => {
      setResult(res);
      queryClient.invalidateQueries({ queryKey: ["bounty-submissions", bounty.slug] });
      onSuccess?.();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!user) {
    return (
      <Card className="border-dashed" data-xray-id="bounty-submission-form">
        <CardContent className="py-8 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Sign in to submit work for this Bounty.</p>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <Card className="border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20" data-xray-id="bounty-submission-form">
        <CardContent className="py-8 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="font-semibold">Submission received</p>
          <p className="text-sm text-muted-foreground">
            Status: <strong>{result.status}</strong>
            {result.furnaceScore != null && (
              <span> · Furnace score: <strong>{result.furnaceScore.toFixed(2)}</strong></span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            You'll be notified when Furnace verification completes.
            Marks vest upon approval.
          </p>
          <Badge variant="outline" className="text-xs">ID: {result.submissionId.slice(0, 8)}…</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-xray-id="bounty-submission-form">
      <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground border border-border/50">
        <strong>Submission requirements:</strong>{" "}
        {bounty.submissionRequirements}
      </div>

      <div>
        <Label htmlFor="bsf-title">Submission title</Label>
        <Input
          id="bsf-title"
          placeholder="E.g. Raspberry Pi LED demo — Haiku tier, 99.3% reliability"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="bsf-desc">Description of your work and evidence</Label>
        <Textarea
          id="bsf-desc"
          placeholder="Describe what you built, how you verified it, and what results you got. Be specific — Furnace will score this against the requirements."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
          rows={5}
        />
      </div>

      <div>
        <Label htmlFor="bsf-url">Evidence URL (video, GitHub, report)</Label>
        <Input
          id="bsf-url"
          placeholder="https://github.com/you/repo or https://youtu.be/…"
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
          className="mt-1"
          type="url"
        />
      </div>

      {(bounty.slug === "raspberry-pi-led-hardware-control" ||
        bounty.slug === "cross-silicon-benchmark" ||
        bounty.slug === "hardware-control-safety-case" ||
        bounty.slug === "anthropic-compatible-lb-frame-demo") && (
        <div>
          <Label htmlFor="bsf-hw">Hardware platform</Label>
          <Input
            id="bsf-hw"
            placeholder="E.g. Raspberry Pi 4B, NVIDIA H100, Apple M4"
            value={hardwarePlatform}
            onChange={(e) => setHardwarePlatform(e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      <Button
        className="w-full gap-2"
        onClick={() => submitMutation.mutate()}
        disabled={submitMutation.isPending || !title.trim() || !description.trim()}
      >
        <Send className="w-4 h-4" />
        {submitMutation.isPending ? "Submitting…" : `Submit for ${bounty.rewardMarks.toLocaleString()} Marks`}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Marks are closed-loop cooperative participation allocation — no fiat redemption, ever.
        Furnace gear-tooth-fit verification runs automatically on submission.
      </p>
    </div>
  );
}
