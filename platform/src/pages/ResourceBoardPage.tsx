import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { DealTipForm } from "@/components/DealTipForm";
import { PioneerBadge } from "@/components/PioneerBadge";
import { usePioneerAssignment } from "@/hooks/usePioneerAssignment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Anchor,
  Search,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Clock,
  CalendarDays,
  Coins,
  Loader2,
  TrendingUp,
  Filter,
  Layers,
  Users,
  Bell,
  CheckCircle,
  ShieldCheck,
  HelpCircle,
  AlertCircle,
  ShoppingCart,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCooperativePurchasing,
  type CooperativePurchase,
} from "@/hooks/useCooperativePurchasing";

interface DealTip {
  id: string;
  member_id: string;
  store_name: string;
  store_location: string | null;
  deal_type: string;
  description: string;
  schedule_recurring: boolean;
  schedule_days: string[] | null;
  schedule_time_hint: string | null;
  stacking_info: string | null;
  confidence: string;
  social_url: string | null;
  marks_awarded: number;
  upvotes: number;
  downvotes: number;
  status: string;
  created_at: string;
  expires_at: string | null;
}

interface MyVote {
  tip_id: string;
  vote: number;
}

const DEAL_TYPE_LABELS: Record<string, string> = {
  clearance: "Clearance",
  discount_day: "Discount Day",
  stacking_combo: "Stacking Combo",
  veterans_military: "Veterans / Military",
  senior: "Senior Discount",
  teacher: "Teacher Discount",
  bulk_deal: "Bulk Deal",
  seasonal: "Seasonal",
  other: "Other",
};

const CONFIDENCE_ICONS: Record<string, typeof ShieldCheck> = {
  verified: ShieldCheck,
  heard: HelpCircle,
  unverified: AlertCircle,
};

const CONFIDENCE_COLORS: Record<string, string> = {
  verified: "text-emerald-500",
  heard: "text-amber-500",
  unverified: "text-red-400",
};

function GroupBuyBanner({
  purchase,
  onJoin,
  onLeave,
  myQty,
  userId,
}: {
  purchase: CooperativePurchase;
  onJoin: (purchaseId: string, qty: number) => void;
  onLeave: (purchaseId: string) => void;
  myQty: number | null;
  userId: string | undefined;
}) {
  const pct = purchase.threshold_quantity > 0
    ? Math.min(100, Math.round((purchase.current_quantity / purchase.threshold_quantity) * 100))
    : 0;
  const met = purchase.status === "threshold_met";

  return (
    <div className={`rounded-lg p-3 space-y-2 ${met ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800" : "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"}`}>
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="flex items-center gap-1.5">
          <ShoppingCart className="w-3.5 h-3.5" />
          Group Buy {met ? "— Threshold Met!" : "Active"}
        </span>
        <span>{purchase.current_quantity}/{purchase.threshold_quantity} joined</span>
      </div>
      <Progress value={pct} className="h-2" />
      {purchase.unit_price_cooperative != null && purchase.unit_price_retail != null && (
        <p className="text-[11px] text-muted-foreground">
          Retail ${purchase.unit_price_retail.toFixed(2)} → Co-op ${purchase.unit_price_cooperative.toFixed(2)}
          {purchase.savings_percentage != null && ` (save ${purchase.savings_percentage}%)`}
        </p>
      )}
      {userId && (
        <div className="flex gap-2 pt-1">
          {myQty != null ? (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onLeave(purchase.id)}>
              Leave Group Buy
            </Button>
          ) : (
            <Button size="sm" className="h-7 text-xs" onClick={() => onJoin(purchase.id, 1)}>
              <ShoppingCart className="w-3 h-3 mr-1" /> Join Group Buy
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function DealTipCard({
  tip,
  myVote,
  onVote,
  votingTipId,
  groupBuy,
  onStartGroupBuy,
  onJoinGroupBuy,
  onLeaveGroupBuy,
  myGroupBuyQty,
  userId,
}: {
  tip: DealTip;
  myVote: number | null;
  onVote: (tipId: string, vote: 1 | -1) => void;
  votingTipId: string | null;
  groupBuy: CooperativePurchase | undefined;
  onStartGroupBuy: (tip: DealTip) => void;
  onJoinGroupBuy: (purchaseId: string, qty: number) => void;
  onLeaveGroupBuy: (purchaseId: string) => void;
  myGroupBuyQty: number | null;
  userId: string | undefined;
}) {
  const ConfIcon = CONFIDENCE_ICONS[tip.confidence] ?? HelpCircle;
  const confColor = CONFIDENCE_COLORS[tip.confidence] ?? "text-muted-foreground";
  const netVotes = tip.upvotes - tip.downvotes;
  const isExpired = tip.expires_at && new Date(tip.expires_at) < new Date();
  const canStartGroupBuy = netVotes >= 5 && !groupBuy && !isExpired;

  return (
    <Card
      className={`hover:border-primary/30 transition-colors ${isExpired ? "opacity-60" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              {tip.store_name}
              <Badge variant="secondary" className="text-xs font-normal">
                {DEAL_TYPE_LABELS[tip.deal_type] ?? tip.deal_type}
              </Badge>
            </CardTitle>
            {tip.store_location && (
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{tip.store_location}</span>
              </CardDescription>
            )}
          </div>
          <Badge className="bg-amber-600/20 text-amber-600 border-amber-500/30 shrink-0">
            +{tip.marks_awarded} M
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{tip.description}</p>

        {/* Schedule info */}
        {tip.schedule_recurring && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
            <CalendarDays className="w-3 h-3" />
            {tip.schedule_days?.map((d) => (
              <Badge key={d} variant="outline" className="text-[10px] px-1.5 py-0">
                {d.slice(0, 3)}
              </Badge>
            ))}
            {tip.schedule_time_hint && (
              <span className="ml-1">· {tip.schedule_time_hint}</span>
            )}
          </div>
        )}

        {/* Stacking info */}
        {tip.stacking_info && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            <span>Stacks: {tip.stacking_info}</span>
          </div>
        )}

        {/* Pearl Influencer social link */}
        {tip.social_url && (
          <a
            href={tip.social_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal-600 hover:underline flex items-center gap-1"
          >
            🤿 Pearl Influencer post →
          </a>
        )}

        {/* Group Buy Banner */}
        {groupBuy && (
          <GroupBuyBanner
            purchase={groupBuy}
            onJoin={onJoinGroupBuy}
            onLeave={onLeaveGroupBuy}
            myQty={myGroupBuyQty}
            userId={userId}
          />
        )}

        {/* Start Group Buy CTA (only when 5+ net upvotes and no active group buy) */}
        {canStartGroupBuy && userId && (
          <Button
            size="sm"
            variant="outline"
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950/50"
            onClick={() => onStartGroupBuy(tip)}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
            Start Group Buy ({netVotes} upvotes — eligible!)
          </Button>
        )}

        {/* Footer: confidence + votes + expiry */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 text-xs ${confColor}`}>
              <ConfIcon className="w-3.5 h-3.5" />
              {tip.confidence}
            </span>
            {tip.expires_at && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {isExpired
                  ? "Expired"
                  : `Exp ${new Date(tip.expires_at).toLocaleDateString()}`}
              </span>
            )}
          </div>

          {/* Voting */}
          <div className="flex items-center gap-1.5">
            <Button
              variant={myVote === 1 ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              disabled={votingTipId === tip.id}
              onClick={() => onVote(tip.id, 1)}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </Button>
            <span
              className={`text-xs font-semibold min-w-[1.5rem] text-center ${
                netVotes > 0
                  ? "text-emerald-600"
                  : netVotes < 0
                    ? "text-red-500"
                    : "text-muted-foreground"
              }`}
            >
              {netVotes > 0 ? `+${netVotes}` : netVotes}
            </span>
            <Button
              variant={myVote === -1 ? "destructive" : "ghost"}
              size="icon"
              className="h-7 w-7"
              disabled={votingTipId === tip.id}
              onClick={() => onVote(tip.id, -1)}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResourceBoardPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("board");
  const { assignPioneer, isNewPioneer } = usePioneerAssignment("pearl_diver");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterConfidence, setFilterConfidence] = useState("all");
  const [votingTipId, setVotingTipId] = useState<string | null>(null);

  // Group Buy state
  const [groupBuyDialog, setGroupBuyDialog] = useState(false);
  const [gbTip, setGbTip] = useState<DealTip | null>(null);
  const [gbTargetQty, setGbTargetQty] = useState("20");
  const [gbThreshold, setGbThreshold] = useState("5");
  const [gbRetailPrice, setGbRetailPrice] = useState("");
  const [gbCoopPrice, setGbCoopPrice] = useState("");

  const {
    groupBuys,
    startGroupBuy,
    joinGroupBuy,
    leaveGroupBuy,
    myParticipation,
  } = useCooperativePurchasing({ status: ["gathering", "threshold_met"] });

  // Fetch tips
  const { data: tips, isLoading } = useQuery({
    queryKey: ["resource-board-tips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resource_board_tips" as never)
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DealTip[];
    },
  });

  // Fetch my votes
  const { data: myVotes } = useQuery({
    queryKey: ["resource-board-votes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("resource_board_votes" as never)
        .select("tip_id, vote")
        .eq("voter_id", user.id);
      if (error) throw error;
      return (data ?? []) as MyVote[];
    },
    enabled: !!user,
  });

  // My tips for stats
  const myTips = tips?.filter((t) => t.member_id === user?.id) ?? [];
  const myTotalMarks = myTips.reduce((s, t) => s + t.marks_awarded, 0);
  const totalUpvotes = myTips.reduce((s, t) => s + t.upvotes, 0);

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ tipId, vote }: { tipId: string; vote: 1 | -1 }) => {
      if (!user) throw new Error("Sign in to vote");
      setVotingTipId(tipId);

      const existing = myVotes?.find((v) => v.tip_id === tipId);

      if (existing) {
        if (existing.vote === vote) return;
        const { error } = await supabase
          .from("resource_board_votes" as never)
          .update({ vote } as never)
          .eq("tip_id", tipId)
          .eq("voter_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("resource_board_votes" as never)
          .insert({ tip_id: tipId, voter_id: user.id, vote } as never);
        if (error) throw error;
      }

      const oldVote = existing?.vote ?? 0;
      const upDelta = (vote === 1 ? 1 : 0) - (oldVote === 1 ? 1 : 0);
      const downDelta = (vote === -1 ? 1 : 0) - (oldVote === -1 ? 1 : 0);

      const { data: tipRow } = await supabase
        .from("resource_board_tips" as never)
        .select("upvotes, downvotes")
        .eq("id", tipId)
        .single();

      if (tipRow) {
        const r = tipRow as Record<string, number>;
        await supabase
          .from("resource_board_tips" as never)
          .update({
            upvotes: (r.upvotes ?? 0) + upDelta,
            downvotes: (r.downvotes ?? 0) + downDelta,
          } as never)
          .eq("id", tipId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resource-board-tips"] });
      qc.invalidateQueries({ queryKey: ["resource-board-votes", user?.id] });
      setVotingTipId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setVotingTipId(null);
    },
  });

  // Fetch subscriptions for subscriber dashboard
  const { data: mySubscriptions } = useQuery({
    queryKey: ["pearl-diver-subs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("pearl_diver_subscriptions" as never)
        .select("*")
        .eq("subscriber_id", user.id)
        .eq("active", true);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  // Fetch my subscribers (I'm the pearl diver)
  const { data: mySubscribers } = useQuery({
    queryKey: ["pearl-diver-my-subs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("pearl_diver_subscriptions" as never)
        .select("*")
        .eq("pearl_diver_id", user.id)
        .eq("active", true);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  // Filtering
  const filtered = (tips ?? []).filter((tip) => {
    if (filterType !== "all" && tip.deal_type !== filterType) return false;
    if (filterConfidence !== "all" && tip.confidence !== filterConfidence)
      return false;
    if (
      searchQuery &&
      !tip.store_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !tip.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(tip.store_location ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const voteMap = new Map(myVotes?.map((v) => [v.tip_id, v.vote]) ?? []);

  function handleVote(tipId: string, vote: 1 | -1) {
    if (!user) {
      toast.error("Sign in to vote on tips.");
      return;
    }
    voteMutation.mutate({ tipId, vote });
  }

  function openGroupBuyDialog(tip: DealTip) {
    setGbTip(tip);
    setGbRetailPrice("");
    setGbCoopPrice("");
    setGbTargetQty("20");
    setGbThreshold("5");
    setGroupBuyDialog(true);
  }

  function submitGroupBuy() {
    if (!gbTip) return;
    startGroupBuy.mutate(
      {
        tipId: gbTip.id,
        title: `Group Buy: ${gbTip.store_name} — ${gbTip.description.slice(0, 80)}`,
        description: gbTip.description,
        storeName: gbTip.store_name,
        storeLocation: gbTip.store_location ?? undefined,
        unitPriceRetail: gbRetailPrice ? parseFloat(gbRetailPrice) : undefined,
        unitPriceCooperative: gbCoopPrice ? parseFloat(gbCoopPrice) : undefined,
        targetQuantity: parseInt(gbTargetQty) || 20,
        thresholdQuantity: parseInt(gbThreshold) || 5,
      },
      {
        onSuccess: () => {
          toast.success("Group Buy created! Others can now join.");
          setGroupBuyDialog(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleJoinGroupBuy(purchaseId: string, qty: number) {
    if (!user) { toast.error("Sign in to join."); return; }
    joinGroupBuy.mutate(
      { purchaseId, quantity: qty },
      {
        onSuccess: (res) => {
          if (res?.thresholdMet) {
            toast.success("Threshold met! The group buy is ready to order.", { icon: <PartyPopper className="w-4 h-4" /> });
          } else {
            toast.success("You've joined the group buy!");
          }
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleLeaveGroupBuy(purchaseId: string) {
    leaveGroupBuy.mutate(purchaseId, {
      onSuccess: () => toast.info("Left the group buy."),
      onError: (err) => toast.error(err.message),
    });
  }

  const gbMap = new Map(
    groupBuys
      .filter((gb) => gb.tip_id)
      .map((gb) => [gb.tip_id, gb])
  );

  return (
    <PortalPageLayout
      title={
        <span className="flex items-center gap-3">
          <Anchor className="w-8 h-8" />
          Resource Board
          <PioneerBadge role="pearl_diver" />
        </span>
      }
      subtitle="Pearl Diver — Find deals others miss. Get paid for what you already know."
    >
      {/* Stats Banner */}
      {user && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="bg-muted/50">
            <CardContent className="pt-4 text-center">
              <Anchor className="w-6 h-6 mx-auto mb-1 text-teal-500" />
              <p className="text-2xl font-bold">{myTips.length}</p>
              <p className="text-xs text-muted-foreground">Tips Logged</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-4 text-center">
              <Coins className="w-6 h-6 mx-auto mb-1 text-amber-500" />
              <p className="text-2xl font-bold">{myTotalMarks}</p>
              <p className="text-xs text-muted-foreground">Marks Earned</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-4 text-center">
              <ThumbsUp className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
              <p className="text-2xl font-bold">{totalUpvotes}</p>
              <p className="text-xs text-muted-foreground">Upvotes Received</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-1 text-indigo-500" />
              <p className="text-2xl font-bold">
                {(mySubscribers as unknown[])?.length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Subscribers</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="board" className="gap-2">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Resource Board</span>
            <span className="sm:hidden">Board</span>
          </TabsTrigger>
          <TabsTrigger value="log" className="gap-2">
            <Anchor className="w-4 h-4" />
            <span className="hidden sm:inline">Log a Deal</span>
            <span className="sm:hidden">Log</span>
          </TabsTrigger>
          <TabsTrigger value="my-tips" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">My Tips</span>
            <span className="sm:hidden">Mine</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Subscriptions</span>
            <span className="sm:hidden">Subs</span>
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ Resource Board ═══════════ */}
        <TabsContent value="board" className="mt-6 space-y-4">
          {/* How it works */}
          <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-200 dark:border-teal-800">
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                🤿 How Pearl Diving Works
              </h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Shop where you already shop — notice deals, clearance, discount days</li>
                <li>Log your tip here with store, deal type, and schedule info</li>
                <li>Earn 4+ Marks per verified tip, bonus Marks for social posts</li>
                <li>Other members upvote useful tips — you earn +1 Mark per 10 upvotes</li>
              </ol>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stores, descriptions, locations..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Deal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(DEAL_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterConfidence} onValueChange={setFilterConfidence}>
              <SelectTrigger className="w-full sm:w-40">
                <ShieldCheck className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="heard">Heard</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tip Cards */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((tip) => {
                const gb = gbMap.get(tip.id);
                return (
                  <DealTipCard
                    key={tip.id}
                    tip={tip}
                    myVote={voteMap.get(tip.id) ?? null}
                    onVote={handleVote}
                    votingTipId={votingTipId}
                    groupBuy={gb}
                    onStartGroupBuy={openGroupBuyDialog}
                    onJoinGroupBuy={handleJoinGroupBuy}
                    onLeaveGroupBuy={handleLeaveGroupBuy}
                    myGroupBuyQty={gb ? (myParticipation(gb)?.quantity ?? null) : null}
                    userId={user?.id}
                  />
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Anchor className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">
                  {searchQuery || filterType !== "all" || filterConfidence !== "all"
                    ? "No Tips Match Your Filters"
                    : "No Deal Tips Yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || filterType !== "all"
                    ? "Try adjusting your filters."
                    : "Be the first Pearl Diver! Log a deal tip to help everyone save money."}
                </p>
                {!searchQuery && filterType === "all" && (
                  <Button onClick={() => setActiveTab("log")}>
                    <Anchor className="w-4 h-4 mr-2" />
                    Log Your First Tip
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════════ Log a Deal ═══════════ */}
        <TabsContent value="log" className="mt-6">
          <DealTipForm
            onSuccess={async () => {
              qc.invalidateQueries({ queryKey: ["resource-board-tips"] });
              setActiveTab("my-tips");
              if (isNewPioneer) await assignPioneer();
            }}
          />
        </TabsContent>

        {/* ═══════════ My Tips ═══════════ */}
        <TabsContent value="my-tips" className="mt-6 space-y-4">
          {!user ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Sign in to see your tips</p>
              </CardContent>
            </Card>
          ) : myTips.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {myTips.map((tip) => {
                const gb = gbMap.get(tip.id);
                return (
                  <DealTipCard
                    key={tip.id}
                    tip={tip}
                    myVote={voteMap.get(tip.id) ?? null}
                    onVote={handleVote}
                    votingTipId={votingTipId}
                    groupBuy={gb}
                    onStartGroupBuy={openGroupBuyDialog}
                    onJoinGroupBuy={handleJoinGroupBuy}
                    onLeaveGroupBuy={handleLeaveGroupBuy}
                    myGroupBuyQty={gb ? (myParticipation(gb)?.quantity ?? null) : null}
                    userId={user?.id}
                  />
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Anchor className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No Tips Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Log your first deal tip and start earning Marks as a Pearl Diver.
                </p>
                <Button onClick={() => setActiveTab("log")}>
                  <Anchor className="w-4 h-4 mr-2" />
                  Log a Deal
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════════ Subscriptions ═══════════ */}
        <TabsContent value="subscriptions" className="mt-6 space-y-6">
          {!user ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Sign in to manage subscriptions</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* My Subscribers (Pearl Diver side) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    My Subscribers
                  </CardTitle>
                  <CardDescription>
                    Members subscribed to your deal alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(mySubscribers as unknown[])?.length ? (
                    <div className="space-y-3">
                      {(mySubscribers as Record<string, unknown>[]).map(
                        (sub) => (
                          <div
                            key={sub.id as string}
                            className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                Subscriber
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(sub.delivery_preference as string) ?? "daily"}{" "}
                                digest · {sub.geo_radius_km as number}km radius
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {sub.price_per_month as number}{" "}
                              {sub.currency as string}/mo
                            </Badge>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No subscribers yet. Log great tips and they'll come!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* My Subscriptions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Subscribed Pearl Divers
                  </CardTitle>
                  <CardDescription>
                    Pearl Divers whose deal alerts you follow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(mySubscriptions as unknown[])?.length ? (
                    <div className="space-y-3">
                      {(mySubscriptions as Record<string, unknown>[]).map(
                        (sub) => (
                          <div
                            key={sub.id as string}
                            className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                Pearl Diver
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(sub.delivery_preference as string) ?? "daily"}{" "}
                                · {sub.geo_radius_km as number}km radius
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {sub.price_per_month as number}{" "}
                                {sub.currency as string}/mo
                              </Badge>
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      You're not subscribed to any Pearl Divers yet. Find top
                      contributors on the board and subscribe for deal alerts.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Start Group Buy Dialog */}
      <Dialog open={groupBuyDialog} onOpenChange={setGroupBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Start Group Buy
            </DialogTitle>
            <DialogDescription>
              Organize a cooperative purchase from this deal tip. Other members can join once created.
            </DialogDescription>
          </DialogHeader>
          {gbTip && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-medium">{gbTip.store_name}</p>
                {gbTip.store_location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {gbTip.store_location}
                  </p>
                )}
                <p className="text-muted-foreground mt-1">{gbTip.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Quantity</Label>
                  <Input type="number" min="2" value={gbTargetQty} onChange={(e) => setGbTargetQty(e.target.value)} />
                </div>
                <div>
                  <Label>Threshold to Activate</Label>
                  <Input type="number" min="2" value={gbThreshold} onChange={(e) => setGbThreshold(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground mt-1">Min members before ordering</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Retail Unit Price ($)</Label>
                  <Input type="number" step="0.01" min="0" placeholder="e.g. 2.50" value={gbRetailPrice} onChange={(e) => setGbRetailPrice(e.target.value)} />
                </div>
                <div>
                  <Label>Cooperative Unit Price ($)</Label>
                  <Input type="number" step="0.01" min="0" placeholder="e.g. 1.60" value={gbCoopPrice} onChange={(e) => setGbCoopPrice(e.target.value)} />
                </div>
              </div>
              {gbRetailPrice && gbCoopPrice && parseFloat(gbRetailPrice) > 0 && (
                <p className="text-sm text-emerald-600 font-medium">
                  Savings: {((1 - parseFloat(gbCoopPrice) / parseFloat(gbRetailPrice)) * 100).toFixed(1)}% off retail
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Expires in 72 hours. Volume discounts from bulk pricing tiers (5+: 5%, 10+: 10%, 20+: 15%, 40+: 20%) apply automatically.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupBuyDialog(false)}>Cancel</Button>
            <Button onClick={submitGroupBuy} disabled={startGroupBuy.isPending}>
              {startGroupBuy.isPending ? "Creating..." : "Create Group Buy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalPageLayout>
  );
}

export default ResourceBoardPage;
