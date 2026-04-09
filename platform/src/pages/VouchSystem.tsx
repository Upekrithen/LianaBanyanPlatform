import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Plus, Heart, Briefcase, Palette, Loader2 } from "lucide-react";
import { toast } from "sonner";

type VouchRow = {
  id: string;
  vouch_type: string;
  vouchee_name: string;
  vouchee_email: string | null;
  reason: string;
  relationship: string;
  strength: number;
  status: string;
  created_at: string | null;
};

const TYPE_META: Record<string, { label: string; icon: typeof Heart; color: string }> = {
  personal: { label: "Personal", icon: Heart, color: "text-rose-400" },
  professional: { label: "Professional", icon: Briefcase, color: "text-blue-400" },
  creator: { label: "Creator", icon: Palette, color: "text-violet-400" },
};

function StrengthDots({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`inline-block w-2 h-2 rounded-full ${n <= value ? "bg-amber-400" : "bg-muted-foreground/20"}`}
        />
      ))}
    </span>
  );
}

export default function VouchSystem() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [vouchType, setVouchType] = useState("personal");
  const [relationship, setRelationship] = useState("");
  const [reason, setReason] = useState("");
  const [strength, setStrength] = useState(3);

  const { data: vouches = [], isLoading } = useQuery({
    queryKey: ["my-vouches", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("vouches" as never)
        .select("*")
        .eq("voucher_user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as VouchRow[];
    },
    enabled: !!user,
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase.from("vouches" as never).insert({
        voucher_user_id: user.id,
        vouchee_name: name.trim(),
        vouchee_email: email.trim() || null,
        vouch_type: vouchType,
        relationship: relationship.trim(),
        reason: reason.trim(),
        strength,
        status: "pending",
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vouch submitted!");
      setName("");
      setEmail("");
      setRelationship("");
      setReason("");
      setStrength(3);
      qc.invalidateQueries({ queryKey: ["my-vouches"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSubmit = name.trim().length > 1 && relationship.trim().length > 1 && reason.trim().length > 5;

  return (
    <PortalPageLayout
      title="Vouch & Recommend"
      subtitle="Your word is your bond — vouch for people you trust"
      maxWidth="lg"
      xrayId="vouch-system"
    >
      <div className="space-y-8 pb-12">
        {/* New Vouch Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5" /> New Vouch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="v-name">Who are you vouching for? *</Label>
                <Input id="v-name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-email">Their email (optional)</Label>
                <Input id="v-email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vouch type *</Label>
                <Select value={vouchType} onValueChange={setVouchType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-rel">Relationship *</Label>
                <Input id="v-rel" placeholder="e.g. Coworker, Friend, Client" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="v-reason">Why do you vouch for them? *</Label>
              <Textarea id="v-reason" placeholder="What makes this person trustworthy and valuable to the community?" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Strength of vouch: {strength}/5</Label>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Casual</span><span>Strong</span>
              </div>
            </div>

            <Button onClick={() => submit.mutate()} disabled={!canSubmit || submit.isPending} className="w-full sm:w-auto">
              {submit.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : "Submit Vouch"}
            </Button>
          </CardContent>
        </Card>

        {/* My Vouches */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <UserCheck className="w-5 h-5" /> My Vouches
          </h2>

          {isLoading ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Loading…</CardContent></Card>
          ) : vouches.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                You haven't vouched for anyone yet. Use the form above to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {vouches.map((v) => {
                const meta = TYPE_META[v.vouch_type] ?? TYPE_META.personal;
                const Icon = meta.icon;
                return (
                  <Card key={v.id}>
                    <CardContent className="pt-5 pb-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{v.vouchee_name}</p>
                          <p className="text-xs text-muted-foreground">{v.relationship}</p>
                        </div>
                        <Badge variant="outline" className={`gap-1 ${meta.color}`}>
                          <Icon className="w-3 h-3" /> {meta.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{v.reason}</p>
                      <div className="flex items-center justify-between pt-1">
                        <StrengthDots value={v.strength} />
                        <Badge
                          variant="outline"
                          className={v.status === "confirmed" ? "border-emerald-500/40 text-emerald-500" : "border-amber-500/40 text-amber-500"}
                        >
                          {v.status}
                        </Badge>
                      </div>
                      {v.created_at && (
                        <p className="text-[10px] text-muted-foreground/60">
                          {new Date(v.created_at).toLocaleDateString()}
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
