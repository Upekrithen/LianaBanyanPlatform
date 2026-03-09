/**
 * SPONSORSHIP CASCADE — 60/10/20/10 System
 * =========================================
 * 25 Credit minimum to sponsor
 * 5K Sponsor Badge for community seeders
 * $10M cap with reset cycle
 * Cloth Pouches (Forever Stamp model)
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TreePine, Users, Gift, Heart, ArrowRight, ArrowDown,
  Award, Coins, Shield, Sparkles, Send, Split, RefreshCw,
  Stamp, Wallet, Target
} from "lucide-react";
import { toast } from "sonner";

interface CascadeProps {
  className?: string;
}

export function SponsorshipCascade({ className }: CascadeProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sponsorAmount, setSponsorAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [showSponsorDialog, setShowSponsorDialog] = useState(false);
  const [showClothPouchDialog, setShowClothPouchDialog] = useState(false);
  const [pouchAmount, setPouchAmount] = useState("");

  // User's balance
  const { data: balance } = useQuery({
    queryKey: ["user-balance", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_balances")
        .select("*")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // User's sponsorships
  const { data: mySponsorships } = useQuery({
    queryKey: ["my-sponsorships", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("sponsorships")
        .select("*")
        .eq("sponsor_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Received sponsorships (cascade potential)
  const { data: receivedSponsorships } = useQuery({
    queryKey: ["received-sponsorships", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("sponsorships")
        .select("*")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Sponsor badge
  const { data: sponsorBadge } = useQuery({
    queryKey: ["sponsor-badge", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("sponsor_badges")
        .select("*")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Cloth pouches
  const { data: clothPouches } = useQuery({
    queryKey: ["cloth-pouches", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("cloth_pouches")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Pool status
  const { data: poolStatus } = useQuery({
    queryKey: ["pool-status"],
    queryFn: async () => {
      const { data } = await supabase
        .from("patent_allocation_pools")
        .select("*")
        .eq("pool_code", "platform_sponsors")
        .single();
      return data;
    },
  });

  // Create sponsorship mutation
  const createSponsorship = useMutation({
    mutationFn: async ({ amount, email }: { amount: number; email: string }) => {
      if (!user) throw new Error("Must be logged in");
      
      const { data, error } = await supabase.rpc("create_sponsorship", {
        p_sponsor_id: user.id,
        p_recipient_email: email,
        p_amount: amount,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Sponsorship created! Invitation sent.");
      queryClient.invalidateQueries({ queryKey: ["my-sponsorships"] });
      queryClient.invalidateQueries({ queryKey: ["user-balance"] });
      queryClient.invalidateQueries({ queryKey: ["sponsor-badge"] });
      setShowSponsorDialog(false);
      setSponsorAmount("");
      setRecipientEmail("");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create sponsorship");
    },
  });

  // Create cloth pouch mutation
  const createClothPouch = useMutation({
    mutationFn: async ({ amount, purpose }: { amount: number; purpose: string }) => {
      if (!user) throw new Error("Must be logged in");
      
      const { data, error } = await supabase.rpc("create_cloth_pouch", {
        p_user_id: user.id,
        p_credit_amount: amount,
        p_purpose: purpose,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Cloth Pouch created! Your service access is locked in.");
      queryClient.invalidateQueries({ queryKey: ["cloth-pouches"] });
      setShowClothPouchDialog(false);
      setPouchAmount("");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create pouch");
    },
  });

  const credits = Number(balance?.credits || 0);
  const canSponsor = credits >= 25;
  const totalSponsored = mySponsorships?.reduce((sum, s) => sum + Number(s.credit_amount), 0) || 0;
  const progressTo5K = Math.min((totalSponsored / 5000) * 100, 100);
  const poolProgress = poolStatus ? (Number(poolStatus.current_allocated) / Number(poolStatus.cap_amount)) * 100 : 0;

  return (
    <div className={className}>
      {/* Cascade Overview */}
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-emerald-500" />
                Sponsorship Cascade
              </CardTitle>
              <CardDescription>
                25 Credits minimum to sponsor. Plant seeds, watch them grow.
              </CardDescription>
            </div>
            {sponsorBadge && (
              <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                <Award className="h-3 w-3 mr-1" />
                5K Community Seeder
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Your Balance */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <Coins className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <div className="text-2xl font-bold">{credits}</div>
              <div className="text-xs text-muted-foreground">Credits</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <Users className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
              <div className="text-2xl font-bold">{mySponsorships?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Sponsored</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <Gift className="h-5 w-5 mx-auto mb-1 text-purple-500" />
              <div className="text-2xl font-bold">{receivedSponsorships?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Received</div>
            </div>
          </div>

          {/* Progress to 5K Badge */}
          {!sponsorBadge && totalSponsored > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to 5K Badge</span>
                <span>{totalSponsored.toFixed(0)} / 5,000 Credits</span>
              </div>
              <Progress value={progressTo5K} className="h-2" />
            </div>
          )}

          {/* Sponsor Button */}
          <Dialog open={showSponsorDialog} onOpenChange={setShowSponsorDialog}>
            <DialogTrigger asChild>
              <Button 
                className="w-full gap-2" 
                disabled={!canSponsor}
                variant={canSponsor ? "default" : "outline"}
              >
                <Heart className="h-4 w-4" />
                {canSponsor ? "Sponsor Someone" : `Need ${25 - credits} more Credits`}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Sponsorship</DialogTitle>
                <DialogDescription>
                  Send Credits to help someone join the platform. They can use them or cascade further.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Recipient Email</Label>
                  <Input
                    type="email"
                    placeholder="friend@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (Credits)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={credits}
                    placeholder="Amount to sponsor"
                    value={sponsorAmount}
                    onChange={(e) => setSponsorAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: {credits} Credits
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSponsorDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createSponsorship.mutate({
                    amount: Number(sponsorAmount),
                    email: recipientEmail,
                  })}
                  disabled={!recipientEmail || !sponsorAmount || Number(sponsorAmount) > credits}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Sponsorship
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Cloth Pouches (Forever Stamps) */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stamp className="h-5 w-5 text-blue-500" />
            Cloth Pouches
          </CardTitle>
          <CardDescription>
            Like Forever Stamps — lock in today's service rate for future use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {clothPouches && clothPouches.length > 0 ? (
            <div className="space-y-2">
              {clothPouches.map((pouch: any) => (
                <div 
                  key={pouch.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <div className="font-medium">{pouch.credit_amount} Credits</div>
                    <div className="text-xs text-muted-foreground">
                      {pouch.purpose} • Created {new Date(pouch.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Invoke
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active pouches. Create one to lock in service access.
            </p>
          )}

          <Dialog open={showClothPouchDialog} onOpenChange={setShowClothPouchDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <Stamp className="h-4 w-4" />
                Create Cloth Pouch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Cloth Pouch</DialogTitle>
                <DialogDescription>
                  Lock in today's service rate. Like a Forever Stamp — same service later, not more service.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm">
                    <strong>What this is:</strong> Prepaid service access — like buying stamps in bulk.
                  </p>
                  <p className="text-sm mt-2 text-muted-foreground">
                    <strong>What this is NOT:</strong> An investment, inflation hedge, or tradeable asset.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Amount (Credits)</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Credits to lock in"
                    value={pouchAmount}
                    onChange={(e) => setPouchAmount(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowClothPouchDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createClothPouch.mutate({
                    amount: Number(pouchAmount),
                    purpose: "service_prepay",
                  })}
                  disabled={!pouchAmount || Number(pouchAmount) <= 0}
                >
                  <Stamp className="h-4 w-4 mr-2" />
                  Create Pouch
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Pool Status */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            60% Platform Pool
          </CardTitle>
          <CardDescription>
            Cycle {poolStatus?.cycle_number || 1} • Resets at $10M
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pool Allocation</span>
              <span>
                ${((poolStatus?.current_allocated || 0) / 1000000).toFixed(2)}M / $10M
              </span>
            </div>
            <Progress value={poolProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              When the pool reaches $10M, it resets and a new cycle begins with the same terms.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Breakdown */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>60/10/20/10 Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm">Platform & Sponsors</span>
              </div>
              <span className="font-bold">60%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Patent Buckets (5K max)</span>
              </div>
              <span className="font-bold">10%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm">Founder Reserve</span>
              </div>
              <span className="font-bold">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm">Prosecution Fund</span>
              </div>
              <span className="font-bold">10%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SponsorshipCascade;
