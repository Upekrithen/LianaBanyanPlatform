/**
 * DESIGN BATTLE CARD — Competitive Bounty Display
 * ================================================
 * Shows active Design Battles with participant info, pot size, and voting.
 * Auto-triggered when 2+ people sign up for the same bounty.
 *
 * Features:
 * - Mixed currency ante display (Credits, Marks, Joules)
 * - GAP rate conversion indicator
 * - Countdown timer to battle end
 * - Participant avatars and submission status
 * - Vote button for community members
 * - Winner payout preview (50% of net pot)
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { spendCoverageMinutes } from "@/lib/discourse/coverageMinutesDB";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Swords, Clock, Users, Coins, Sparkles, Zap,
  Trophy, Vote, ExternalLink, CheckCircle, AlertCircle,
  Flame, Target
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface DesignBattle {
  id: string;
  bounty_id: string;
  bounty_title: string;
  status: "pending" | "active" | "voting" | "completed" | "cancelled";
  skill_tier: string;
  timeframe: string;
  starts_at: string;
  ends_at: string;
  min_ante_credits: number;
  min_ante_marks: number;
  min_ante_joules: number;
  total_pot: number;
  platform_cut: number;
  net_pot: number;
  winner_payout: number;
  community_votes: number;
  participant_count: number;
  winner_id: string | null;
}

interface Participant {
  id: string;
  user_id: string;
  display_name: string;
  ante_original: { credits: number; marks: number; joules: number };
  ante_credit_equivalent: number;
  gap_rate_used: number;
  submission_url: string | null;
  submitted_at: string | null;
  vote_count: number;
  rank: number | null;
  payout: number | null;
  crow_feather_earned: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getTimeRemaining(endDate: string): string {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "pending": return "bg-yellow-500/20 text-yellow-700";
    case "active": return "bg-green-500/20 text-green-700";
    case "voting": return "bg-blue-500/20 text-blue-700";
    case "completed": return "bg-gray-500/20 text-gray-700";
    case "cancelled": return "bg-red-500/20 text-red-700";
    default: return "bg-gray-500/20 text-gray-700";
  }
}

function getSkillTierColor(tier: string): string {
  switch (tier) {
    case "novice": return "bg-green-100 text-green-800";
    case "apprentice": return "bg-blue-100 text-blue-800";
    case "journeyman": return "bg-purple-100 text-purple-800";
    case "expert": return "bg-orange-100 text-orange-800";
    case "master": return "bg-red-100 text-red-800";
    case "grandmaster": return "bg-yellow-100 text-yellow-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANTE DISPLAY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface AnteDisplayProps {
  ante: { credits: number; marks: number; joules: number };
  creditEquivalent: number;
  gapRate: number;
}

function AnteDisplay({ ante, creditEquivalent, gapRate }: AnteDisplayProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm">
        {ante.credits > 0 && (
          <span className="flex items-center gap-1">
            <Coins className="h-3 w-3 text-yellow-600" />
            {ante.credits}
          </span>
        )}
        {ante.marks > 0 && (
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-purple-600" />
            {ante.marks}
          </span>
        )}
        {ante.joules > 0 && (
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-blue-600" />
            {ante.joules}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        = {creditEquivalent.toFixed(2)} Credits @ GAP {gapRate}x
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICIPANT ROW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ParticipantRowProps {
  participant: Participant;
  isVoting: boolean;
  hasVoted: boolean;
  onVote: (participantId: string) => void;
}

function ParticipantRow({ participant, isVoting, hasVoted, onVote }: ParticipantRowProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{participant.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{participant.display_name}</p>
          <AnteDisplay
            ante={participant.ante_original}
            creditEquivalent={participant.ante_credit_equivalent}
            gapRate={participant.gap_rate_used}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {participant.submission_url ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <a href={participant.submission_url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </TooltipTrigger>
            <TooltipContent>View Submission</TooltipContent>
          </Tooltip>
        ) : (
          <Badge variant="outline" className="text-xs">Pending</Badge>
        )}

        {participant.crow_feather_earned && (
          <Tooltip>
            <TooltipTrigger>
              <span className="text-lg">🪶</span>
            </TooltipTrigger>
            <TooltipContent>Crow Feather Earned!</TooltipContent>
          </Tooltip>
        )}

        {isVoting && !hasVoted && (
          <Button size="sm" variant="outline" onClick={() => onVote(participant.id)}>
            <Vote className="h-4 w-4 mr-1" />
            Vote
          </Button>
        )}

        <div className="text-right min-w-[60px]">
          <p className="font-bold">{participant.vote_count}</p>
          <p className="text-xs text-muted-foreground">votes</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// JOIN BATTLE DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

interface JoinBattleDialogProps {
  battle: DesignBattle;
  onJoin: (ante: { credits: number; marks: number; joules: number }) => void;
}

function JoinBattleDialog({ battle, onJoin }: JoinBattleDialogProps) {
  const [credits, setCredits] = useState(battle.min_ante_credits);
  const [marks, setMarks] = useState(battle.min_ante_marks);
  const [joules, setJoules] = useState(battle.min_ante_joules);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Swords className="h-4 w-4" />
          Join Battle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter the Arena</DialogTitle>
          <DialogDescription>
            Set your ante to join {battle.bounty_title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-600" />
              Credits (min: {battle.min_ante_credits})
            </Label>
            <Input
              type="number"
              min={battle.min_ante_credits}
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Marks (min: {battle.min_ante_marks})
            </Label>
            <Input
              type="number"
              min={battle.min_ante_marks}
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              Joules (min: {battle.min_ante_joules})
            </Label>
            <Input
              type="number"
              min={battle.min_ante_joules}
              value={joules}
              onChange={(e) => setJoules(Number(e.target.value))}
            />
          </div>

          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm font-medium">Pot Distribution</p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              <li>• Winner takes 50% of net pot + Crow Feather</li>
              <li>• Platform takes 16.7% margin</li>
              <li>• Runner-ups split remaining 33.3%</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onJoin({ credits, marks, joules })} className="gap-2">
            <Flame className="h-4 w-4" />
            Enter Battle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DESIGN BATTLE CARD
// ═══════════════════════════════════════════════════════════════════════════════

interface DesignBattleCardProps {
  battle: DesignBattle;
  showDetails?: boolean;
}

export function DesignBattleCard({ battle, showDetails = false }: DesignBattleCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(showDetails);

  // Fetch participants
  const { data: participants } = useQuery({
    queryKey: ["battle-participants", battle.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("design_battle_participants")
        .select("*")
        .eq("battle_id", battle.id)
        .order("vote_count", { ascending: false });

      if (error) throw error;
      return data as Participant[];
    },
    enabled: expanded,
  });

  // Check if user has voted
  const { data: hasVoted } = useQuery({
    queryKey: ["battle-vote-check", battle.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("design_battle_votes")
        .select("id")
        .eq("battle_id", battle.id)
        .eq("voter_id", user.id)
        .single();
      return !!data;
    },
    enabled: !!user && battle.status === "voting",
  });

  // Join battle mutation
  const joinMutation = useMutation({
    mutationFn: async (ante: { credits: number; marks: number; joules: number }) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("design_battle_participants").insert({
        battle_id: battle.id,
        user_id: user.id,
        display_name: user.email?.split("@")[0] || "Anonymous",
        ante_original: ante,
        ante_credit_equivalent: ante.credits + ante.marks * 0.5 + ante.joules * 2,
        gap_rate_used: 1.0,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Joined Battle!", description: "Good luck, warrior!" });
      queryClient.invalidateQueries({ queryKey: ["battle-participants", battle.id] });
    },
    onError: (error) => {
      toast({ title: "Failed to join", description: error.message, variant: "destructive" });
    },
  });

  // Vote mutation — costs 1 Coverage Minute
  const voteMutation = useMutation({
    mutationFn: async (participantId: string) => {
      if (!user) throw new Error("Must be logged in");

      // Deduct 1 Coverage Minute for voting
      const spent = await spendCoverageMinutes(
        user.id, 1, "spent_voting",
        `Vote in Design Battle ${battle.id}`,
        battle.id, "design_battle",
      );
      if (!spent) {
        throw new Error("Not enough Coverage Minutes to vote (1 required)");
      }

      const { error } = await supabase.from("design_battle_votes").insert({
        battle_id: battle.id,
        participant_id: participantId,
        voter_id: user.id,
        vote_credits: 1,
      });

      if (error) throw error;

      await supabase.rpc("increment_battle_votes", {
        p_participant_id: participantId,
        p_vote_count: 1,
      });
    },
    onSuccess: () => {
      toast({ title: "Vote Cast!", description: "Your voice has been heard. (1 Coverage Minute spent)" });
      queryClient.invalidateQueries({ queryKey: ["battle-participants", battle.id] });
      queryClient.invalidateQueries({ queryKey: ["battle-vote-check", battle.id] });
    },
    onError: (error) => {
      toast({ title: "Vote failed", description: error.message, variant: "destructive" });
    },
  });

  const isVoting = battle.status === "voting";
  const isActive = battle.status === "active" || battle.status === "pending";
  const timeRemaining = getTimeRemaining(battle.ends_at);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-red-500" />
              {battle.bounty_title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(battle.status)} variant="secondary">
                {battle.status}
              </Badge>
              <Badge className={getSkillTierColor(battle.skill_tier)} variant="secondary">
                {battle.skill_tier}
              </Badge>
            </CardDescription>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Clock className="h-4 w-4" />
              {timeRemaining}
            </div>
            <p className="text-xs text-muted-foreground">{battle.timeframe}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pot Display */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <p className="text-lg font-bold text-yellow-700">{battle.total_pot.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Total Pot</p>
          </div>
          <div className="p-2 rounded-lg bg-green-500/10">
            <p className="text-lg font-bold text-green-700">{battle.net_pot.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Net Pot</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10">
            <p className="text-lg font-bold text-purple-700">{(battle.net_pot * 0.5).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Winner Gets</p>
          </div>
        </div>

        {/* Participant Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{battle.participant_count} warriors</span>
          </div>
          <div className="flex items-center gap-2">
            <Vote className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{battle.community_votes} community votes</span>
          </div>
        </div>

        {/* Expanded Participants */}
        {expanded && participants && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Participants
            </h4>
            {participants.map((p) => (
              <ParticipantRow
                key={p.id}
                participant={p}
                isVoting={isVoting}
                hasVoted={hasVoted || false}
                onVote={(id) => voteMutation.mutate(id)}
              />
            ))}
          </div>
        )}

        {/* Winner Display */}
        {battle.status === "completed" && battle.winner_id && participants && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span className="font-bold">Winner: </span>
              <span>{participants.find(p => p.user_id === battle.winner_id)?.display_name}</span>
              <span className="ml-auto font-bold text-green-600">
                +{battle.winner_payout.toFixed(0)} Credits
              </span>
              <span className="text-lg">🪶</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show Less" : "Show Details"}
        </Button>

        {isActive && user && (
          <JoinBattleDialog battle={battle} onJoin={(ante) => joinMutation.mutate(ante)} />
        )}
      </CardFooter>
    </Card>
  );
}

export default DesignBattleCard;
