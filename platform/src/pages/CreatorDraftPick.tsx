import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Loader2, Send, UserPlus, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

type DraftPick = {
  id: string;
  creator_name: string;
  creator_handle: string | null;
  platform: string | null;
  specialty: string | null;
  status: string;
  referral_tier: string | null;
  marks_rewarded: number | null;
  cue_card_sent_at: string | null;
  signed_up_at: string | null;
  created_at: string | null;
};

const PLATFORMS = ["Etsy", "Instagram", "TikTok", "YouTube", "Shopify", "Amazon Handmade", "Other"];

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  nominated: { icon: Clock, color: "border-amber-500/40 text-amber-500", label: "Nominated" },
  contacted: { icon: Send, color: "border-blue-500/40 text-blue-500", label: "Contacted" },
  signed_up: { icon: CheckCircle2, color: "border-emerald-500/40 text-emerald-500", label: "Signed Up" },
  declined: { icon: XCircle, color: "border-red-500/40 text-red-500", label: "Declined" },
};

export default function CreatorDraftPick() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState("");
  const [specialty, setSpecialty] = useState("");

  const { data: picks = [], isLoading } = useQuery({
    queryKey: ["my-draft-picks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("creator_draft_picks" as never)
        .select("*")
        .eq("recruiter_user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DraftPick[];
    },
    enabled: !!user,
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase.from("creator_draft_picks" as never).insert({
        recruiter_user_id: user.id,
        creator_name: name.trim(),
        creator_handle: handle.trim() || null,
        platform: platform || null,
        specialty: specialty.trim() || null,
        status: "nominated",
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Creator drafted!");
      setName("");
      setHandle("");
      setPlatform("");
      setSpecialty("");
      qc.invalidateQueries({ queryKey: ["my-draft-picks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PortalPageLayout
      title="Creator Draft Pick"
      subtitle="Recruit the makers who'll build the future"
      maxWidth="lg"
      xrayId="creator-draft-pick"
    >
      <div className="space-y-8 pb-12">
        {/* Explainer */}
        <Card className="bg-gradient-to-br from-violet-500/5 to-transparent border-violet-500/20">
          <CardContent className="pt-6 flex flex-col sm:flex-row gap-6 items-start">
            <UserPlus className="w-10 h-10 text-violet-400 shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">How the Draft Works</h3>
              <p className="text-sm text-muted-foreground">
                Know a talented creator on another platform? Draft them here. When they sign up through your referral,
                you earn <strong>Marks</strong> based on your referral tier: Pioneer (10), Trailblazer (5), Builder (3),
                Networker (2), Ambassador (1). The earlier you recruit, the more you earn.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Draft form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5" /> Draft a Creator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dp-name">Creator name *</Label>
                <Input id="dp-name" placeholder="Full name or brand" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dp-handle">Handle / username</Label>
                <Input id="dp-handle" placeholder="@handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger><SelectValue placeholder="Where are they?" /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dp-spec">Specialty</Label>
                <Input id="dp-spec" placeholder="e.g. Jewelry, Woodwork, Digital Art" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
              </div>
            </div>
            <Button onClick={() => submit.mutate()} disabled={name.trim().length < 2 || submit.isPending} className="w-full sm:w-auto">
              {submit.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Drafting…</> : "Draft Creator"}
            </Button>
          </CardContent>
        </Card>

        {/* My picks */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" /> My Draft Picks
            {picks.length > 0 && <Badge variant="secondary" className="ml-1">{picks.length}</Badge>}
          </h2>

          {isLoading ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Loading…</CardContent></Card>
          ) : picks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No draft picks yet. Nominate a creator above to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {picks.map((p) => {
                const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.nominated;
                const StatusIcon = cfg.icon;
                return (
                  <Card key={p.id}>
                    <CardContent className="pt-5 pb-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{p.creator_name}</p>
                          {p.creator_handle && <p className="text-xs text-muted-foreground">{p.creator_handle}</p>}
                        </div>
                        <Badge variant="outline" className={`gap-1 ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {p.platform && <Badge variant="secondary" className="text-xs">{p.platform}</Badge>}
                        {p.specialty && <Badge variant="outline" className="text-xs">{p.specialty}</Badge>}
                        {p.referral_tier && <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-400">{p.referral_tier}</Badge>}
                      </div>
                      {(p.marks_rewarded ?? 0) > 0 && (
                        <p className="text-xs text-emerald-500 font-medium">+{p.marks_rewarded} Marks earned</p>
                      )}
                      {p.created_at && (
                        <p className="text-[10px] text-muted-foreground/60">
                          Drafted {new Date(p.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PortalPageLayout>
  );
}
