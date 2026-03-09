/**
 * SWOOP VOTING — Service Waiting On Operational Participation
 * ============================================================
 * Implements the 500-vote threshold for initiatives to go live.
 * Members vote with Credits to signal demand before services launch.
 *
 * Key Features:
 * - 500-vote minimum threshold for initiative activation
 * - Credit-weighted voting (1 Credit = 1 vote)
 * - Progress visualization toward threshold
 * - Automatic activation trigger when threshold reached
 * - Vote history and participant list
 *
 * Used by: MSA, Tatiana Schlossburg Health Accords, and other initiatives
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Vote, Users, Target, Rocket, CheckCircle, Clock,
  TrendingUp, Coins, AlertCircle, Sparkles, PartyPopper
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface SWOOPInitiative {
  id: string;
  initiative_slug: string;
  initiative_name: string;
  description: string;
  threshold: number;
  current_votes: number;
  status: "waiting" | "active" | "paused" | "completed";
  activation_date?: string;
  created_at: string;
}

interface SWOOPVote {
  id: string;
  user_id: string;
  initiative_id: string;
  credit_amount: number;
  display_name: string;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_THRESHOLD = 500;

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS RING COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

function ProgressRing({ progress, size = 120, strokeWidth = 8 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  const getColor = () => {
    if (progress >= 100) return "#22c55e"; // green
    if (progress >= 75) return "#eab308"; // yellow
    if (progress >= 50) return "#f97316"; // orange
    return "#3b82f6"; // blue
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{Math.min(progress, 100).toFixed(0)}%</span>
        <span className="text-xs text-muted-foreground">to launch</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOTE DIALOG COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface VoteDialogProps {
  initiative: SWOOPInitiative;
  userBalance: number;
  onVote: (amount: number) => void;
  isVoting: boolean;
}

function VoteDialog({ initiative, userBalance, onVote, isVoting }: VoteDialogProps) {
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);

  const handleVote = () => {
    const voteAmount = Number(amount);
    if (voteAmount > 0 && voteAmount <= userBalance) {
      onVote(voteAmount);
      setOpen(false);
      setAmount("");
    }
  };

  const remainingToThreshold = Math.max(0, initiative.threshold - initiative.current_votes);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={initiative.status !== "waiting"}>
          <Vote className="h-4 w-4" />
          Vote to Launch
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vote for {initiative.initiative_name}</DialogTitle>
          <DialogDescription>
            Pledge Credits to help reach the {initiative.threshold}-vote threshold
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Progress */}
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-3xl font-bold">
              {initiative.current_votes} / {initiative.threshold}
            </div>
            <div className="text-sm text-muted-foreground">
              {remainingToThreshold} more votes needed
            </div>
          </div>

          {/* Vote Amount */}
          <div className="space-y-2">
            <Label>Your Vote (Credits)</Label>
            <Input
              type="number"
              min={1}
              max={userBalance}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Your balance: {userBalance} Credits</span>
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setAmount(String(Math.min(userBalance, remainingToThreshold)))}
              >
                Vote remaining ({Math.min(userBalance, remainingToThreshold)})
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-700">What happens to your Credits?</p>
                <p className="text-blue-600/80 mt-1">
                  Your Credits are pledged, not spent. If the initiative launches, they become
                  your initial service credits. If it doesn't reach threshold, they're returned.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleVote}
            disabled={!amount || Number(amount) <= 0 || Number(amount) > userBalance || isVoting}
          >
            {isVoting ? "Voting..." : "Pledge Credits"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SWOOP VOTING COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface SWOOPVotingProps {
  initiativeSlug: string;
  initiativeName: string;
  description: string;
  threshold?: number;
  showVoters?: boolean;
  compact?: boolean;
  className?: string;
}

export function SWOOPVoting({
  initiativeSlug,
  initiativeName,
  description,
  threshold = DEFAULT_THRESHOLD,
  showVoters = true,
  compact = false,
  className,
}: SWOOPVotingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch initiative status
  const { data: initiative, isLoading } = useQuery({
    queryKey: ["swoop-initiative", initiativeSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("swoop_initiatives")
        .select("*")
        .eq("initiative_slug", initiativeSlug)
        .single();

      if (error && error.code === "PGRST116") {
        // Initiative doesn't exist yet, create it
        const { data: newInit, error: createError } = await supabase
          .from("swoop_initiatives")
          .insert({
            initiative_slug: initiativeSlug,
            initiative_name: initiativeName,
            description,
            threshold,
            current_votes: 0,
            status: "waiting",
          })
          .select()
          .single();

        if (createError) throw createError;
        return newInit as SWOOPInitiative;
      }

      if (error) throw error;
      return data as SWOOPInitiative;
    },
  });

  // Fetch user's balance
  const { data: balance } = useQuery({
    queryKey: ["user-balance", user?.id],
    queryFn: async () => {
      if (!user) return { credits: 0 };
      const { data } = await supabase
        .from("user_balances")
        .select("credits")
        .eq("user_id", user.id)
        .single();
      return data || { credits: 0 };
    },
    enabled: !!user,
  });

  // Fetch user's existing vote
  const { data: myVote } = useQuery({
    queryKey: ["swoop-my-vote", initiativeSlug, user?.id],
    queryFn: async () => {
      if (!user || !initiative) return null;
      const { data } = await supabase
        .from("swoop_votes")
        .select("*")
        .eq("initiative_id", initiative.id)
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user && !!initiative,
  });

  // Fetch recent voters
  const { data: recentVoters } = useQuery({
    queryKey: ["swoop-voters", initiativeSlug],
    queryFn: async () => {
      if (!initiative) return [];
      const { data } = await supabase
        .from("swoop_votes")
        .select("*")
        .eq("initiative_id", initiative.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!initiative && showVoters,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!user || !initiative) throw new Error("Not authenticated");

      const { error } = await supabase.from("swoop_votes").insert({
        initiative_id: initiative.id,
        user_id: user.id,
        credit_amount: amount,
        display_name: user.email?.split("@")[0] || "Anonymous",
      });

      if (error) throw error;

      // Update initiative total
      const newTotal = initiative.current_votes + amount;
      const newStatus = newTotal >= initiative.threshold ? "active" : "waiting";

      await supabase
        .from("swoop_initiatives")
        .update({
          current_votes: newTotal,
          status: newStatus,
          activation_date: newStatus === "active" ? new Date().toISOString() : null,
        })
        .eq("id", initiative.id);

      return { newTotal, activated: newStatus === "active" };
    },
    onSuccess: (result) => {
      if (result.activated) {
        toast({
          title: "🎉 Initiative Activated!",
          description: `${initiativeName} has reached its threshold and is now live!`,
        });
      } else {
        toast({
          title: "Vote Recorded!",
          description: "Your Credits have been pledged to this initiative.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["swoop-initiative", initiativeSlug] });
      queryClient.invalidateQueries({ queryKey: ["swoop-my-vote", initiativeSlug] });
      queryClient.invalidateQueries({ queryKey: ["swoop-voters", initiativeSlug] });
      queryClient.invalidateQueries({ queryKey: ["user-balance"] });
    },
    onError: (error) => {
      toast({
        title: "Vote Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading initiative status...
        </CardContent>
      </Card>
    );
  }

  if (!initiative) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          Initiative not found
        </CardContent>
      </Card>
    );
  }

  const progress = (initiative.current_votes / initiative.threshold) * 100;
  const isActive = initiative.status === "active";
  const userCredits = Number(balance?.credits || 0);

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isActive ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Clock className="h-6 w-6 text-amber-500" />
              )}
              <div>
                <p className="font-medium">{initiativeName}</p>
                <p className="text-sm text-muted-foreground">
                  {isActive ? "Live" : `${initiative.current_votes}/${initiative.threshold} votes`}
                </p>
              </div>
            </div>
            {!isActive && (
              <Progress value={progress} className="w-24 h-2" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isActive ? (
                <Rocket className="h-5 w-5 text-green-500" />
              ) : (
                <Target className="h-5 w-5 text-amber-500" />
              )}
              {initiativeName}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge className={isActive ? "bg-green-500/20 text-green-700" : "bg-amber-500/20 text-amber-700"}>
            {isActive ? "Live" : "Waiting for Votes"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Display */}
        <div className="flex items-center justify-center gap-8">
          <ProgressRing progress={progress} />
          <div className="space-y-2">
            <div className="text-center">
              <div className="text-4xl font-bold">{initiative.current_votes}</div>
              <div className="text-sm text-muted-foreground">of {initiative.threshold} votes</div>
            </div>
            {isActive ? (
              <div className="flex items-center gap-2 text-green-600">
                <PartyPopper className="h-4 w-4" />
                <span className="text-sm font-medium">Threshold Reached!</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center">
                {initiative.threshold - initiative.current_votes} more needed
              </div>
            )}
          </div>
        </div>

        {/* User's Vote Status */}
        {myVote && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                You've pledged {myVote.credit_amount} Credits
              </span>
            </div>
          </div>
        )}

        {/* Recent Voters */}
        {showVoters && recentVoters && recentVoters.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recent Supporters
            </h4>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {recentVoters.map((voter) => (
                  <div
                    key={voter.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {voter.display_name?.slice(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{voter.display_name}</span>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Coins className="h-3 w-3" />
                      {voter.credit_amount}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {isActive ? (
          <Button className="w-full gap-2" variant="outline" disabled>
            <Sparkles className="h-4 w-4" />
            Initiative is Live!
          </Button>
        ) : user ? (
          <VoteDialog
            initiative={initiative}
            userBalance={userCredits}
            onVote={(amount) => voteMutation.mutate(amount)}
            isVoting={voteMutation.isPending}
          />
        ) : (
          <Button className="w-full" variant="outline" disabled>
            Sign in to vote
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default SWOOPVoting;
