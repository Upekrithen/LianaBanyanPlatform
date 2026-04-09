import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Camera,
  CheckCircle,
  XCircle,
  MapPin,
  Plus,
  Image,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BountyRow {
  id: string;
  business_name: string;
  claims_count: number;
  max_claims: number;
  status: string;
}

interface PendingClaim {
  id: string;
  member_id: string;
  social_url: string;
  social_platform: string;
  business_name: string;
  description: string | null;
  status: string;
  created_at: string;
}

export function CaptainPhotoCoverage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [postOpen, setPostOpen] = useState(false);
  const [newBountyName, setNewBountyName] = useState("");
  const [newBountyAddress, setNewBountyAddress] = useState("");

  const { data: bounties } = useQuery({
    queryKey: ["captain-bounties"],
    queryFn: async () => {
      const { data } = await supabase
        .from("photo_bounties" as never)
        .select("id, business_name, claims_count, max_claims, status")
        .order("created_at", { ascending: false });
      return (data ?? []) as BountyRow[];
    },
  });

  const { data: pendingClaims } = useQuery({
    queryKey: ["captain-pending-claims"],
    queryFn: async () => {
      const { data } = await supabase
        .from("photo_bounty_claims" as never)
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(50);
      return (data ?? []) as PendingClaim[];
    },
  });

  const coveredBounties = (bounties ?? []).filter((b) => b.claims_count > 0);
  const uncoveredBounties = (bounties ?? []).filter((b) => b.claims_count === 0);

  const postBountyMutation = useMutation({
    mutationFn: async () => {
      if (!user || !newBountyName.trim()) throw new Error("Name required");
      const { error } = await supabase
        .from("photo_bounties" as never)
        .insert({
          business_name: newBountyName.trim(),
          business_address: newBountyAddress.trim() || null,
          bounty_type: "photography",
          marks_reward: 2,
          max_claims: 10,
          status: "active",
          posted_by: user.id,
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Bounty posted", description: `Photography bounty for "${newBountyName}" is now live.` });
      setNewBountyName("");
      setNewBountyAddress("");
      setPostOpen(false);
      queryClient.invalidateQueries({ queryKey: ["captain-bounties"] });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to post", description: err.message, variant: "destructive" });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ claimId, verdict }: { claimId: string; verdict: "verified" | "rejected" }) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase
        .from("photo_bounty_claims" as never)
        .update({ status: verdict, verified_by: user.id, verified_at: new Date().toISOString() } as never)
        .eq("id", claimId);
      if (error) throw error;
    },
    onSuccess: (_, { verdict }) => {
      toast({ title: verdict === "verified" ? "Claim verified — Marks awarded" : "Claim rejected" });
      queryClient.invalidateQueries({ queryKey: ["captain-pending-claims"] });
      queryClient.invalidateQueries({ queryKey: ["captain-bounties"] });
    },
  });

  const totalBounties = bounties?.length ?? 0;
  const activeBounties = bounties?.filter((b) => b.status === "active").length ?? 0;
  const pendingCount = pendingClaims?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-700 bg-slate-800/30">
          <CardContent className="p-4 text-center">
            <Camera className="w-4 h-4 mx-auto mb-1 text-blue-400" />
            <p className="text-2xl font-bold text-slate-100">{totalBounties}</p>
            <p className="text-xs text-slate-500">Total Bounties</p>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800/30">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
            <p className="text-2xl font-bold text-slate-100">{coveredBounties.length}</p>
            <p className="text-xs text-slate-500">Covered</p>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-amber-400" />
            <p className="text-2xl font-bold text-slate-100">{uncoveredBounties.length}</p>
            <p className="text-xs text-slate-500">Need Photos</p>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800/30">
          <CardContent className="p-4 text-center">
            <Image className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
            <p className="text-2xl font-bold text-slate-100">{pendingCount}</p>
            <p className="text-xs text-slate-500">Pending Review</p>
          </CardContent>
        </Card>
      </div>

      {/* Post Bounty */}
      <div className="flex justify-end">
        <Dialog open={postOpen} onOpenChange={setPostOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" /> Post Bounty
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post Photography Bounty</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input value={newBountyName} onChange={(e) => setNewBountyName(e.target.value)} placeholder="e.g. Rosa's Bakery" />
              </div>
              <div className="space-y-2">
                <Label>Address (optional)</Label>
                <Input value={newBountyAddress} onChange={(e) => setNewBountyAddress(e.target.value)} placeholder="123 Main St" />
              </div>
              <Button
                className="w-full"
                disabled={!newBountyName.trim() || postBountyMutation.isPending}
                onClick={() => postBountyMutation.mutate()}
              >
                {postBountyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                Post Bounty (+2 Marks reward)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Claims Review */}
      {pendingClaims && pendingClaims.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-950/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Claims Awaiting Review ({pendingCount})
            </CardTitle>
            <CardDescription>Verify the photo exists at the social URL, then approve or reject.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingClaims.map((claim) => (
              <div key={claim.id} className="flex items-center gap-3 p-3 rounded bg-slate-800/50 border border-slate-700/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{claim.business_name}</p>
                  <a
                    href={claim.social_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline truncate block"
                  >
                    {claim.social_url}
                  </a>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {claim.social_platform} · {new Date(claim.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 h-8 px-2"
                    onClick={() => verifyMutation.mutate({ claimId: claim.id, verdict: "verified" })}
                    disabled={verifyMutation.isPending}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 px-2"
                    onClick={() => verifyMutation.mutate({ claimId: claim.id, verdict: "rejected" })}
                    disabled={verifyMutation.isPending}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Bounties Without Claims */}
      {uncoveredBounties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Bounties Without Photo Coverage
            </CardTitle>
            <CardDescription>
              These businesses have active bounties but no claims yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {uncoveredBounties.map((b) => (
                <div key={b.id} className="flex items-center gap-2 p-2 rounded bg-slate-800/30 border border-slate-700/30">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{b.business_name}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">No photos</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bounties With Coverage */}
      {coveredBounties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Businesses With Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {coveredBounties.map((b) => (
                <div key={b.id} className="flex items-center gap-2 p-2 rounded bg-emerald-950/20 border border-emerald-800/30">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{b.business_name}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 shrink-0">
                    {b.claims_count} photos
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CaptainPhotoCoverage;
