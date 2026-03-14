/**
 * DelegationResponseButtons — Crown letter delegation: Accept, Vouch For, Recommend, Pass Along, Advisory
 * Creates delegation_actions rows and displays chain.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, UserPlus, ThumbsUp, Share2, HelpCircle, GitBranch } from "lucide-react";
import { toast } from "sonner";

const ACTION_TYPES = [
  { type: "accept" as const, label: "Accept", icon: CheckCircle2, color: "bg-green-600 hover:bg-green-700" },
  { type: "vouch_for" as const, label: "Vouch For", icon: UserPlus, color: "bg-blue-600 hover:bg-blue-700" },
  { type: "recommend" as const, label: "Recommend", icon: ThumbsUp, color: "bg-indigo-600 hover:bg-indigo-700" },
  { type: "pass_along" as const, label: "Pass Along", icon: Share2, color: "bg-slate-600 hover:bg-slate-700" },
  { type: "advisory" as const, label: "Advisory", icon: HelpCircle, color: "bg-amber-600 hover:bg-amber-700" },
];

interface DelegationResponseButtonsProps {
  invitationId: string;
  recipientId: string;
  recipientName: string;
  verifiedEmail?: string;
  verifiedActorName?: string;
}

export function DelegationResponseButtons({
  invitationId,
  recipientId,
  recipientName,
  verifiedEmail,
  verifiedActorName,
}: DelegationResponseButtonsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogAction, setDialogAction] = useState<typeof ACTION_TYPES[number]["type"] | null>(null);
  const [targetName, setTargetName] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [targetExpertise, setTargetExpertise] = useState("");
  const [unknownNeedDescription, setUnknownNeedDescription] = useState("");
  const [notes, setNotes] = useState("");

  const { data: actions } = useQuery({
    queryKey: ["delegation-actions", invitationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delegation_actions")
        .select("id, action_type, actor_name, actor_email, target_name, target_expertise, is_unknown_need, unknown_need_description, chain_depth, status, created_at")
        .eq("invitation_id", invitationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!invitationId,
  });

  const insertMutation = useMutation({
    mutationFn: async (payload: {
      action_type: string;
      target_name?: string;
      target_email?: string;
      target_expertise?: string;
      is_unknown_need?: boolean;
      unknown_need_description?: string;
      notes?: string;
      parent_delegation_id?: string;
      chain_depth?: number;
    }) => {
      const { data, error } = await supabase.from("delegation_actions").insert({
        invitation_id: invitationId,
        actor_id: user?.id ?? null,
        actor_name: verifiedActorName || (user as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name ?? null,
        actor_email: verifiedEmail ?? (user as { email?: string })?.email ?? null,
        action_type: payload.action_type,
        target_name: payload.target_name || null,
        target_email: payload.target_email || null,
        target_expertise: payload.target_expertise || null,
        is_unknown_need: payload.is_unknown_need ?? false,
        unknown_need_description: payload.unknown_need_description || null,
        notes: payload.notes || null,
        parent_delegation_id: payload.parent_delegation_id ?? null,
        chain_depth: payload.chain_depth ?? 0,
        status: payload.action_type === "accept" ? "accepted" : "pending",
      }).select("id").single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delegation-actions", invitationId] });
      setDialogAction(null);
      setTargetName("");
      setTargetEmail("");
      setTargetExpertise("");
      setUnknownNeedDescription("");
      setNotes("");
      toast.success("Response recorded.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to submit"),
  });

  const handleSubmit = () => {
    if (!dialogAction) return;
    if (dialogAction === "vouch_for" || dialogAction === "recommend") {
      if (!targetName.trim()) {
        toast.error("Please enter the name of the person you're vouching for.");
        return;
      }
    }
    if (dialogAction === "advisory" && !unknownNeedDescription.trim()) {
      toast.error("Please describe the need (e.g. 'You'll also need a shipping expert').");
      return;
    }
    insertMutation.mutate({
      action_type: dialogAction,
      target_name: targetName.trim() || undefined,
      target_email: targetEmail.trim() || undefined,
      target_expertise: targetExpertise.trim() || undefined,
      is_unknown_need: dialogAction === "advisory",
      unknown_need_description: dialogAction === "advisory" ? unknownNeedDescription.trim() : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4" data-xray-id="delegation-response-buttons">
      <div className="flex flex-wrap gap-2">
        {ACTION_TYPES.map(({ type, label, icon: Icon, color }) => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            className={color}
            onClick={() => setDialogAction(type)}
          >
            <Icon className="w-4 h-4 mr-1" />
            {label}
          </Button>
        ))}
      </div>

      {actions && actions.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <GitBranch className="w-4 h-4" />
              Delegation chain
            </h4>
            <ul className="space-y-2 text-sm">
              {actions.map((a: { id: string; action_type: string; actor_name?: string; target_name?: string; unknown_need_description?: string; chain_depth?: number }) => (
                <li key={a.id} className="flex items-start gap-2">
                  <span className="font-medium">{a.action_type.replace("_", " ")}</span>
                  {a.actor_name && <span>by {a.actor_name}</span>}
                  {a.target_name && <span>→ {a.target_name}</span>}
                  {a.unknown_need_description && <span>— {a.unknown_need_description}</span>}
                  {a.chain_depth != null && a.chain_depth > 0 && (
                    <span className="text-muted-foreground">(depth {a.chain_depth})</span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!dialogAction} onOpenChange={(open) => !open && setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction && ACTION_TYPES.find((a) => a.type === dialogAction)?.label}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "advisory"
                ? "Flag a need without nominating anyone (e.g. \"You'll also need a shipping expert\")."
                : dialogAction === "vouch_for" || dialogAction === "recommend"
                  ? "Who would you like to suggest?"
                  : "Add optional notes."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {(dialogAction === "vouch_for" || dialogAction === "recommend") && (
              <>
                <div>
                  <Label>Name *</Label>
                  <Input value={targetName} onChange={(e) => setTargetName(e.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <Label>Expertise / skill</Label>
                  <Input value={targetExpertise} onChange={(e) => setTargetExpertise(e.target.value)} placeholder="e.g. logistics, legal" />
                </div>
              </>
            )}
            {dialogAction === "advisory" && (
              <div>
                <Label>Describe the need *</Label>
                <Input
                  value={unknownNeedDescription}
                  onChange={(e) => setUnknownNeedDescription(e.target.value)}
                  placeholder="e.g. You'll also need a shipping expert"
                />
              </div>
            )}
            <div>
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional context" rows={2} />
            </div>
            <Button onClick={handleSubmit} disabled={insertMutation.isPending}>
              {insertMutation.isPending ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
