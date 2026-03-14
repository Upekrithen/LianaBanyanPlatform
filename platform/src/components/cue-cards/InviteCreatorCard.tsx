/**
 * Invite Creator Card — "Know a maker? Invite them." + modal to send referral
 * Creates creator_referrals row; shows global referral count and active tier.
 * data-xray-id: invite-creator-card
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Send } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "etsy", label: "Etsy" },
  { value: "tiktok", label: "TikTok" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];

const TIER_MAX_KEYS = [
  "creator_referral_tier_1_max",
  "creator_referral_tier_2_max",
  "creator_referral_tier_3_max",
  "creator_referral_tier_4_max",
  "creator_referral_tier_5_max",
];
const TIER_NAME_KEYS = [
  "creator_referral_tier_1_name",
  "creator_referral_tier_2_name",
  "creator_referral_tier_3_name",
  "creator_referral_tier_4_name",
  "creator_referral_tier_5_name",
  "creator_referral_tier_6_name",
];

export function InviteCreatorCard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "etsy" | "tiktok" | "email" | "other">("instagram");
  const [message, setMessage] = useState("");

  const { data: globalCount } = useQuery({
    queryKey: ["creator-referrals-global-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("creator_referrals")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: tierConfig } = useQuery({
    queryKey: ["creator-referral-tier-config"],
    queryFn: async () => {
      const keys = [...TIER_MAX_KEYS, ...TIER_NAME_KEYS];
      const { data } = await supabase
        .from("dna_lock")
        .select("parameter_key, parameter_value")
        .in("parameter_key", keys);
      const map: Record<string, string> = {};
      data?.forEach((r: { parameter_key: string; parameter_value: string }) => {
        map[r.parameter_key] = r.parameter_value;
      });
      return map;
    },
  });

  const activeTierIndex = (() => {
    const count = globalCount ?? 0;
    for (let i = 0; i < TIER_MAX_KEYS.length; i++) {
      const max = parseInt(tierConfig?.[TIER_MAX_KEYS[i]] ?? "0", 10);
      if (count < max) return i;
    }
    return 5;
  })();
  const activeTierName = tierConfig?.[TIER_NAME_KEYS[activeTierIndex]] ?? "Ambassador";

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to invite creators");
      const trimmed = handle.trim();
      if (!trimmed) throw new Error("Enter a creator handle or email");
      const { error } = await supabase.from("creator_referrals").insert({
        referrer_id: user.id,
        referred_handle: trimmed,
        referred_platform: platform,
        cue_card_sent_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation sent. They'll get your cue card link.");
      queryClient.invalidateQueries({ queryKey: ["creator-referrals-global-count"] });
      setOpen(false);
      setHandle("");
      setMessage("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to send"),
  });

  const previewUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join/creator${user ? `?ref=${encodeURIComponent((user as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name ?? "A member")}` : ""}`
    : "/join/creator";

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10" data-xray-id="invite-creator-card">
        <CardContent className="py-6 px-6 space-y-3">
          <p className="text-sm font-medium">
            Know a maker? Invite them. Be one of the first 100 to bring a creator and earn Pioneer rewards.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Global referrals: <strong className="text-foreground">{globalCount ?? 0}</strong></span>
            <span>·</span>
            <span>Active tier: <strong className="text-foreground">{activeTierName}</strong></span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (user ? setOpen(true) : toast.info("Sign in to invite creators"))}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite a Creator
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Invite a Creator
            </DialogTitle>
            <DialogDescription>
              Send them a link to the Creator Pitch page. When they join, you may earn referral rewards (service value for participation).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="invite-handle">Creator handle or email</Label>
              <Input
                id="invite-handle"
                placeholder="@username or email"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(v: "instagram" | "etsy" | "tiktok" | "email" | "other") => setPlatform(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="invite-message">Personal message (optional)</Label>
              <Textarea
                id="invite-message"
                placeholder="Add a note for them..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-xs">
              <p className="font-medium text-muted-foreground mb-1">Preview: they'll see</p>
              <p className="break-all text-foreground">{previewUrl}</p>
            </div>
            <Button
              className="w-full gap-2"
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending || !handle.trim()}
            >
              <Send className="w-4 h-4" />
              {sendMutation.isPending ? "Sending…" : "Send Invitation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
