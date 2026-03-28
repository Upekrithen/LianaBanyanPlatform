/**
 * EarmarkCredits — /earmark on .org
 * Interface for members to earmark their credits to specific causes.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Target, Heart, MapPin, Users, Loader2,
  CheckCircle2, Plus
} from "lucide-react";

const INITIATIVE_OPTIONS = [
  { id: "lmd", label: "Let's Make Dinner", type: "initiative" as const },
  { id: "lgg", label: "Let's Get Groceries", type: "initiative" as const },
  { id: "lgs", label: "Let's Go Shopping", type: "initiative" as const },
  { id: "mission-one", label: "Mission ONE General", type: "initiative" as const },
  { id: "family-table", label: "The Family Table", type: "initiative" as const },
  { id: "health-accords", label: "Tatiana Health Accords", type: "initiative" as const },
  { id: "defense-klaus", label: "Defense Klaus", type: "initiative" as const },
  { id: "rally-group", label: "Rally Group", type: "initiative" as const },
];

const AREA_OPTIONS = [
  { id: "san-antonio-tx", label: "San Antonio, TX", type: "area" as const },
  { id: "austin-tx", label: "Austin, TX", type: "area" as const },
  { id: "national", label: "Wherever Needed Most", type: "area" as const },
];

interface EarmarkRow {
  id: string;
  amount_cents: number;
  target_type: string;
  target_label: string;
  status: string;
  created_at: string;
}

export default function EarmarkCredits() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<{ id: string; label: string; type: string } | null>(null);

  const { data: myEarmarks = [], isLoading } = useQuery({
    queryKey: ["my-earmarks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("earmarked_credits" as never)
        .select("*")
        .order("created_at", { ascending: false }) as { data: EarmarkRow[] | null; error: unknown };
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createEarmark = useMutation({
    mutationFn: async () => {
      if (!user?.id || !selectedTarget || !amount) throw new Error("Missing fields");
      const cents = Math.round(parseFloat(amount) * 100);
      if (cents <= 0 || isNaN(cents)) throw new Error("Invalid amount");

      const { error } = await supabase.from("earmarked_credits" as never).insert({
        member_id: user.id,
        amount_cents: cents,
        target_type: selectedTarget.type,
        target_id: selectedTarget.id,
        target_label: selectedTarget.label,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Credits earmarked successfully!");
      setAmount("");
      setSelectedTarget(null);
      qc.invalidateQueries({ queryKey: ["my-earmarks"] });
      qc.invalidateQueries({ queryKey: ["gleaners-corner"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const totalEarmarked = myEarmarks.reduce((s, r) => s + r.amount_cents, 0);
  const activeEarmarks = myEarmarks.filter((r) => r.status === "active");
  const deployedEarmarks = myEarmarks.filter((r) => r.status === "deployed");

  const fmt = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  if (!user) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Target className="w-12 h-12 mx-auto text-emerald-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign in to Earmark Credits</h2>
        <p className="text-muted-foreground mb-4">
          Members can direct their credits to the causes they care about.
        </p>
        <Button asChild>
          <a href="/auth">Sign In — $5/year</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Target className="w-7 h-7 text-emerald-400" />
          Earmark Your Credits
        </h1>
        <p className="text-muted-foreground mt-1">
          Direct your credits to the initiatives and areas you care about most.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{fmt(totalEarmarked)}</p>
            <p className="text-xs text-muted-foreground">Total Earmarked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{activeEarmarks.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-500">{deployedEarmarks.length}</p>
            <p className="text-xs text-muted-foreground">Deployed</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Earmark */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Earmark
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Initiative Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Choose an Initiative</Label>
            <div className="flex flex-wrap gap-2">
              {INITIATIVE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedTarget(opt)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    selectedTarget?.id === opt.id
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  <Heart className="w-3 h-3 inline mr-1" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Area Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">...or Choose an Area</Label>
            <div className="flex flex-wrap gap-2">
              {AREA_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedTarget(opt)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    selectedTarget?.id === opt.id
                      ? "bg-violet-500/20 border-violet-500 text-violet-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="earmark-amount">Amount ($)</Label>
              <Input
                id="earmark-amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="25.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              onClick={() => createEarmark.mutate()}
              disabled={!selectedTarget || !amount || createEarmark.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {createEarmark.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Earmark Credits</>
              )}
            </Button>
          </div>

          {selectedTarget && amount && (
            <p className="text-xs text-muted-foreground">
              Earmarking ${parseFloat(amount || "0").toFixed(2)} to {selectedTarget.label}
            </p>
          )}
        </CardContent>
      </Card>

      {/* My Earmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Earmarks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : myEarmarks.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                You haven't earmarked any credits yet. Choose an initiative or area above.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {myEarmarks.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{e.target_label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{fmt(e.amount_cents)}</span>
                    <Badge
                      className={
                        e.status === "deployed"
                          ? "bg-green-600 text-white"
                          : e.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-zinc-700 text-zinc-400"
                      }
                    >
                      {e.status === "deployed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {e.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
