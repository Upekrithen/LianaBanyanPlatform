import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Compass,
  Map,
  Gamepad2,
  Trophy,
  Ghost,
  Search,
  Filter,
  Sparkles,
  Users,
  Clock,
  MapPin,
  ArrowRight,
  Award,
  BookOpen,
  Camera,
  CheckCircle,
  Image,
  Repeat,
  DollarSign,
  Pause,
  XCircle,
  GraduationCap,
  Video,
  Share2,
  CreditCard,
  Plug,
  ExternalLink,
  FileText,
} from "lucide-react";
import { ShipMedallion } from "@/components/ShipMedallion";
import { JourneyMap } from "@/components/JourneyMap";
import { BeaconDropUI } from "@/components/BeaconDropUI";
import { BeaconRunCard, BeaconRunCreator, BeaconRunLeaderboard } from "@/components/BeaconRunGame";
import { HelmContentLibrary } from "@/components/HelmContentLibrary";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useAlcoveProgress } from "@/hooks/useAlcoveProgress";
import { useCaptain } from "@/hooks/useCaptain";
import { GUILDS } from "@/lib/guildChapterSystem";

interface BeaconRun {
  id: string;
  creator_id: string;
  name: string;
  slug: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  beacon_ids: string[];
  total_beacons: number;
  estimated_minutes: number;
  ante_credits: number;
  prize_pool_credits: number;
  times_started: number;
  times_completed: number;
  best_time_seconds: number | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
}

type TreasureProgress = {
  id: string;
  map_id: string;
  current_phase: string;
  current_level: number;
  quiz_score: number | null;
  completed_at: string | null;
  last_activity_at: string;
  phase_data: Record<string, Record<string, boolean>>;
};

const MAP_LABELS: Record<string, string> = {
  "breakfast-runner": "Breakfast Runner",
  "lunch-runner": "Lunch Runner",
  "taco-truck": "Taco Truck",
  "catering": "Catering Coordinator",
  "grocery": "Grocery Runner",
  "service": "Service Business",
  "designer": "LB Designer",
};

const PHASE_COUNT = 4;

function PhotographyHelmStats({ userId }: { userId: string }) {
  const { data: claims } = useQuery({
    queryKey: ["bounty-claims", "helm-stats", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photo_bounty_claims" as never)
        .select("status, marks_awarded")
        .eq("member_id", userId);
      if (error) return [];
      return (data ?? []) as { status: string; marks_awarded: number }[];
    },
  });

  const total = claims?.length ?? 0;
  const verified = claims?.filter((c) => c.status === "verified").length ?? 0;
  const marks = claims?.filter((c) => c.status === "verified").reduce((s, c) => s + c.marks_awarded, 0) ?? 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center">
        <Image className="w-5 h-5 mx-auto mb-1 text-blue-500" />
        <p className="text-lg font-bold">{total}</p>
        <p className="text-[11px] text-muted-foreground">Claimed</p>
      </div>
      <div className="text-center">
        <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
        <p className="text-lg font-bold">{verified}</p>
        <p className="text-[11px] text-muted-foreground">Verified</p>
      </div>
      <div className="text-center">
        <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-500" />
        <p className="text-lg font-bold">{marks}</p>
        <p className="text-[11px] text-muted-foreground">Marks Earned</p>
      </div>
    </div>
  );
}

function PearlDiverHelmStats({ userId }: { userId: string }) {
  const { data: tips } = useQuery({
    queryKey: ["resource-board-tips", "helm-stats", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resource_board_tips" as never)
        .select("marks_awarded, upvotes")
        .eq("member_id", userId);
      if (error) return [];
      return (data ?? []) as { marks_awarded: number; upvotes: number }[];
    },
  });

  const total = tips?.length ?? 0;
  const marks = tips?.reduce((s, t) => s + t.marks_awarded, 0) ?? 0;
  const upvotes = tips?.reduce((s, t) => s + t.upvotes, 0) ?? 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center">
        <Compass className="w-5 h-5 mx-auto mb-1 text-teal-500" />
        <p className="text-lg font-bold">{total}</p>
        <p className="text-[11px] text-muted-foreground">Tips Logged</p>
      </div>
      <div className="text-center">
        <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-500" />
        <p className="text-lg font-bold">{marks}</p>
        <p className="text-[11px] text-muted-foreground">Marks Earned</p>
      </div>
      <div className="text-center">
        <Users className="w-5 h-5 mx-auto mb-1 text-indigo-500" />
        <p className="text-lg font-bold">{upvotes}</p>
        <p className="text-[11px] text-muted-foreground">Upvotes</p>
      </div>
    </div>
  );
}

function SubscriptionHelmStats({ userId }: { userId: string }) {
  const { data: myChannels } = useQuery({
    queryKey: ["subscription-channels", "helm-creator", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_channels" as never)
        .select("id, title, current_subscribers, price, billing_cycle")
        .eq("creator_id", userId)
        .eq("active", true);
      if (error) return [];
      return (data ?? []) as { id: string; title: string; current_subscribers: number; price: number; billing_cycle: string }[];
    },
  });

  const { data: mySubs } = useQuery({
    queryKey: ["channel-subscriptions", "helm-subscriber", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_subscriptions" as never)
        .select("id, status, currency, total_paid, next_billing_at, channel_id")
        .eq("subscriber_id", userId);
      if (error) return [];
      return (data ?? []) as { id: string; status: string; currency: string; total_paid: number; next_billing_at: string | null; channel_id: string }[];
    },
  });

  const channelCount = myChannels?.length ?? 0;
  const totalSubscribers = myChannels?.reduce((s, c) => s + c.current_subscribers, 0) ?? 0;
  const activeSubs = mySubs?.filter((s) => s.status === "active").length ?? 0;
  const totalSpent = mySubs?.reduce((s, sub) => s + sub.total_paid, 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center">
          <Repeat className="w-5 h-5 mx-auto mb-1 text-indigo-500" />
          <p className="text-lg font-bold">{channelCount}</p>
          <p className="text-[11px] text-muted-foreground">My Channels</p>
        </div>
        <div className="text-center">
          <Users className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
          <p className="text-lg font-bold">{totalSubscribers}</p>
          <p className="text-[11px] text-muted-foreground">My Subscribers</p>
        </div>
        <div className="text-center">
          <Sparkles className="w-5 h-5 mx-auto mb-1 text-amber-500" />
          <p className="text-lg font-bold">{activeSubs}</p>
          <p className="text-[11px] text-muted-foreground">Subscribed To</p>
        </div>
        <div className="text-center">
          <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-500" />
          <p className="text-lg font-bold">{totalSpent}</p>
          <p className="text-[11px] text-muted-foreground">Total Spent</p>
        </div>
      </div>
      {myChannels && myChannels.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Channels</p>
          {myChannels.slice(0, 3).map((ch) => (
            <div key={ch.id} className="flex items-center justify-between text-sm bg-muted/40 rounded px-3 py-1.5">
              <span className="truncate">{ch.title}</span>
              <Badge variant="outline" className="text-[10px]">{ch.current_subscribers} subs</Badge>
            </div>
          ))}
        </div>
      )}
      {mySubs && mySubs.filter((s) => s.status === "active").length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Subscriptions</p>
          {mySubs.filter((s) => s.status === "active").slice(0, 3).map((sub) => (
            <div key={sub.id} className="flex items-center justify-between text-sm bg-muted/40 rounded px-3 py-1.5">
              <span className="capitalize text-xs">{sub.currency}</span>
              {sub.next_billing_at && (
                <span className="text-[10px] text-muted-foreground">
                  Next: {new Date(sub.next_billing_at).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeacherHelmStats({ userId }: { userId: string }) {
  const { data: teacherProfile } = useQuery({
    queryKey: ["teacher-profile-helm", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("teacher_profiles" as never)
        .select("id, subjects, hourly_rate, group_rate, pioneer_number, active")
        .eq("member_id", userId)
        .maybeSingle();
      return data as { id: string; subjects: string[]; hourly_rate: number; group_rate: number; pioneer_number: number | null; active: boolean } | null;
    },
  });

  const { data: bookingStats } = useQuery({
    queryKey: ["teacher-booking-stats", teacherProfile?.id],
    enabled: !!teacherProfile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("class_bookings" as never)
        .select("id, booking_type, status, creator_amount, currency")
        .eq("teacher_id", teacherProfile!.id);
      const bookings = (data ?? []) as { id: string; booking_type: string; status: string; creator_amount: number; currency: string }[];
      return {
        total: bookings.length,
        completed: bookings.filter((b) => b.status === "completed").length,
        active: bookings.filter((b) => b.status === "confirmed").length,
        revenue: bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + (b.creator_amount || 0), 0),
      };
    },
  });

  const { data: scheduleCount = 0 } = useQuery({
    queryKey: ["teacher-schedule-count", teacherProfile?.id],
    enabled: !!teacherProfile?.id,
    queryFn: async () => {
      const { count } = await supabase
        .from("teacher_schedule" as never)
        .select("id", { count: "exact", head: true })
        .eq("teacher_id", teacherProfile!.id);
      return count ?? 0;
    },
  });

  if (!teacherProfile) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
        <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-2">
          <div className="font-bold text-lg">{bookingStats?.active ?? 0}</div>
          <div className="text-xs text-muted-foreground">Active Students</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
          <div className="font-bold text-lg">${(bookingStats?.revenue ?? 0).toFixed(0)}</div>
          <div className="text-xs text-muted-foreground">Earned</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
          <div className="font-bold text-lg">{scheduleCount}</div>
          <div className="text-xs text-muted-foreground">Schedule Slots</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2">
          <div className="font-bold text-lg">{bookingStats?.completed ?? 0}</div>
          <div className="text-xs text-muted-foreground">Sessions Taught</div>
        </div>
      </div>
      {teacherProfile.pioneer_number && (
        <Badge className="bg-amber-500 text-white">
          <Award className="h-3 w-3 mr-1" /> Pioneer #{teacherProfile.pioneer_number}
        </Badge>
      )}
    </div>
  );
}

const PIONEER_ROLE_LABELS: Record<string, string> = {
  bounty_photographer: "Bounty Photographer",
  pearl_diver: "Pearl Diver",
  home_teacher: "Home Teacher",
  captain: "Node Captain",
  subscription_creator: "Subscription Creator",
};

interface BonusLogEntry {
  id: string;
  pioneer_id: string;
  role: string;
  tier: string;
  bonus_marks: number;
  billing_month: string;
  status: string;
  created_at: string;
}

const TIER_LABELS: Record<string, string> = {
  founders_circle: "Founders' Circle",
  trailblazer: "Trailblazer",
  pathfinder: "Pathfinder",
  early_adopter: "Early Adopter",
  standard: "Standard",
};

function PioneerHelmStats({ userId }: { userId: string }) {
  const navigate = useNavigate();

  const { data: myPioneers = [] } = useQuery({
    queryKey: ["my-pioneers", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pioneers" as never)
        .select("id, cue_card_role, pioneer_number, tier, monthly_bonus_marks, bonus_duration_months, bonus_started_at, bonus_expires_at, opted_in_showcase, showcase_real_name, medallion_serial, medallion_shipped")
        .eq("member_id", userId);
      if (error) return [];
      return (data ?? []) as {
        id: string; cue_card_role: string; pioneer_number: number; tier: string;
        monthly_bonus_marks: number; bonus_duration_months: number; bonus_started_at: string;
        bonus_expires_at: string | null;
        opted_in_showcase: boolean; showcase_real_name: boolean;
        medallion_serial: string | null; medallion_shipped: boolean;
      }[];
    },
  });

  const { data: bonusLog = [] } = useQuery({
    queryKey: ["pioneer-bonus-log", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pioneer_bonus_log" as never)
        .select("id, pioneer_id, role, tier, bonus_marks, billing_month, status, created_at")
        .eq("member_id", userId)
        .eq("status", "disbursed")
        .order("billing_month", { ascending: false });
      if (error) return [];
      return (data ?? []) as BonusLogEntry[];
    },
  });

  const toggleShowcase = async (pioneerId: string, current: boolean) => {
    await supabase
      .from("pioneers" as never)
      .update({ opted_in_showcase: !current } as never)
      .eq("id", pioneerId);
  };

  const totalBonusActive = myPioneers.filter(
    (p) => p.bonus_expires_at && new Date(p.bonus_expires_at) > new Date()
  ).length;
  const totalMonthlyMarks = myPioneers
    .filter((p) => p.bonus_expires_at && new Date(p.bonus_expires_at) > new Date())
    .reduce((s, p) => s + p.monthly_bonus_marks, 0);
  const totalBonusEarned = bonusLog.reduce((s, b) => s + b.bonus_marks, 0);

  if (myPioneers.length === 0) return null;

  const lastBonus = bonusLog[0] ?? null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2">
          <div className="font-bold text-lg">{myPioneers.length}</div>
          <div className="text-xs text-muted-foreground">Pioneer Roles</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
          <div className="font-bold text-lg">{totalBonusActive}</div>
          <div className="text-xs text-muted-foreground">Active Bonuses</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
          <div className="font-bold text-lg">+{totalMonthlyMarks}</div>
          <div className="text-xs text-muted-foreground">Marks / Month</div>
        </div>
      </div>

      {/* Bonus History Summary */}
      {(lastBonus || totalBonusEarned > 0) && (
        <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-amber-700 dark:text-amber-300">Bonus History</span>
            <Badge variant="secondary" className="text-[10px]">
              {totalBonusEarned} Marks earned
            </Badge>
          </div>
          {lastBonus && (
            <p className="text-xs text-muted-foreground">
              Last bonus: {lastBonus.billing_month} — {lastBonus.bonus_marks} Marks ({TIER_LABELS[lastBonus.tier] ?? lastBonus.tier})
            </p>
          )}
          {myPioneers.map((p) => {
            if (p.bonus_duration_months <= 0 || !p.bonus_started_at) return null;
            const started = new Date(p.bonus_started_at);
            const now = new Date();
            const monthsElapsed = Math.max(0, (now.getFullYear() - started.getFullYear()) * 12 + (now.getMonth() - started.getMonth()));
            const remaining = Math.max(0, p.bonus_duration_months - monthsElapsed);
            const pct = Math.min(100, (monthsElapsed / p.bonus_duration_months) * 100);
            return (
              <div key={p.id} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{PIONEER_ROLE_LABELS[p.cue_card_role] ?? p.cue_card_role}</span>
                  <span>{remaining} of {p.bonus_duration_months} months remaining</span>
                </div>
                <div className="h-1.5 bg-amber-200/50 dark:bg-amber-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        {myPioneers.map((p) => {
          const isActive = p.bonus_expires_at && new Date(p.bonus_expires_at) > new Date();
          const slug = p.cue_card_role.replace(/_/g, "-");
          return (
            <div key={p.id} className="flex items-center justify-between text-sm bg-muted/40 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  #{p.pioneer_number}
                </Badge>
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => navigate(`/pioneers/${slug}/${p.pioneer_number}`)}
                >
                  {PIONEER_ROLE_LABELS[p.cue_card_role] ?? p.cue_card_role}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isActive && (
                  <Badge variant="secondary" className="text-[10px]">
                    +{p.monthly_bonus_marks}/mo
                  </Badge>
                )}
                {p.medallion_serial && (
                  <Badge className="bg-amber-500 text-white text-[10px]">
                    <Award className="w-2.5 h-2.5 mr-0.5" /> Medallion
                  </Badge>
                )}
                <button
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    p.opted_in_showcase
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-700 dark:text-emerald-300"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                  onClick={() => toggleShowcase(p.id, p.opted_in_showcase)}
                >
                  {p.opted_in_showcase ? "Showcased" : "Opt In"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground">
        Opting in to showcase means your Pioneer profile is visible on the public /pioneers page.
        Founders' Circle members who opt in are featured as case studies.
      </p>
    </div>
  );
}

function FreezerNodeHelmStats({ userId }: { userId: string }) {
  const { data: myNode } = useQuery({
    queryKey: ["freezer-node-mine", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("freezer_nodes" as never)
        .select("id, name, pioneer_number, active")
        .eq("operator_id", userId)
        .eq("active", true)
        .maybeSingle();
      if (error) return null;
      return data as { id: string; name: string; pioneer_number: number | null; active: boolean } | null;
    },
  });

  const { data: inventory } = useQuery({
    queryKey: ["freezer-inventory-helm", userId, myNode?.id],
    enabled: !!myNode,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("freezer_inventory" as never)
        .select("id, portions_available, status, expiry_date")
        .eq("node_id", myNode!.id);
      if (error) return [];
      return (data ?? []) as { id: string; portions_available: number; status: string; expiry_date: string }[];
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["freezer-orders-helm", userId, myNode?.id],
    enabled: !!myNode,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("freezer_orders" as never)
        .select("id, status, total_amount")
        .eq("node_id", myNode!.id);
      if (error) return [];
      return (data ?? []) as { id: string; status: string; total_amount: number }[];
    },
  });

  const totalMeals = inventory?.filter((i) => i.status === "available").reduce((s, i) => s + i.portions_available, 0) ?? 0;
  const expiringSoon = inventory?.filter((i) => {
    const days = (new Date(i.expiry_date).getTime() - Date.now()) / 86400000;
    return days > 0 && days < 14;
  }).length ?? 0;
  const completedOrders = orders?.filter((o) => o.status === "completed").length ?? 0;
  const revenue = orders?.filter((o) => o.status === "completed").reduce((s, o) => s + o.total_amount, 0) ?? 0;

  if (!myNode) return <p className="text-sm text-muted-foreground">No Freezer Node registered yet.</p>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
        <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-lg p-2">
          <div className="font-bold text-lg">{totalMeals}</div>
          <div className="text-xs text-muted-foreground">Meals Available</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-2">
          <div className="font-bold text-lg">{expiringSoon}</div>
          <div className="text-xs text-muted-foreground">Expiring Soon</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
          <div className="font-bold text-lg">{completedOrders}</div>
          <div className="text-xs text-muted-foreground">Orders Filled</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
          <div className="font-bold text-lg">${revenue.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground">Revenue</div>
        </div>
      </div>
      {myNode.pioneer_number && myNode.pioneer_number <= 10 && (
        <Badge className="bg-amber-500 text-white">Pioneer #{myNode.pioneer_number}</Badge>
      )}
    </div>
  );
}

function SocialPlugsCard({ userId }: { userId: string }) {
  const navigate = useNavigate();

  const { data: plugs } = useQuery({
    queryKey: ["user-social-plugs", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_social_plugs" as never)
        .select("id, platform, handle, connected")
        .eq("member_id", userId);
      if (error) return [];
      return (data ?? []) as { id: string; platform: string; handle: string; connected: boolean }[];
    },
  });

  const connectedPlugs = plugs?.filter((p) => p.connected) ?? [];
  const connectedCount = connectedPlugs.length;

  const PLATFORM_COLORS: Record<string, string> = {
    instagram: "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
    twitter: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    x: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    linkedin: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    facebook: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    tiktok: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
    youtube: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  };

  return (
    <Card className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-purple-500" />
          Social Plugs
        </CardTitle>
        <CardDescription>
          {connectedCount} platform{connectedCount !== 1 ? "s" : ""} connected
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connectedPlugs.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {connectedPlugs.map((plug) => (
              <Badge
                key={plug.id}
                className={PLATFORM_COLORS[plug.platform.toLowerCase()] ?? "bg-muted text-foreground"}
              >
                <Plug className="w-3 h-3 mr-1" />
                {plug.platform}
                {plug.handle && (
                  <span className="ml-1 opacity-70 text-[10px]">@{plug.handle}</span>
                )}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            No social platforms connected yet. Link your accounts to auto-post and track engagement.
          </p>
        )}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => navigate("/dispatch/settings")}
          >
            <Plug className="w-4 h-4 mr-2" />
            Connect More
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate("/dispatch/compose")}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compose Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CueCardQuickActions({ userId }: { userId: string }) {
  const navigate = useNavigate();

  const { data: cardCount = 0 } = useQuery({
    queryKey: ["cue-card-count", userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("cue_cards" as never)
        .select("id", { count: "exact", head: true })
        .eq("member_id", userId);
      if (error) return 0;
      return count ?? 0;
    },
  });

  return (
    <Card className="mt-8 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-500" />
          Cue Cards
        </CardTitle>
        <CardDescription>
          {cardCount > 0
            ? `${cardCount} card${cardCount !== 1 ? "s" : ""} created`
            : "Create your digital business or calling card"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* QR Code Placeholder */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
          <svg
            viewBox="0 0 100 100"
            className="w-16 h-16 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="100" height="100" fill="white" rx="4" />
            <rect x="10" y="10" width="25" height="25" fill="currentColor" rx="2" />
            <rect x="65" y="10" width="25" height="25" fill="currentColor" rx="2" />
            <rect x="10" y="65" width="25" height="25" fill="currentColor" rx="2" />
            <rect x="14" y="14" width="17" height="17" fill="white" rx="1" />
            <rect x="69" y="14" width="17" height="17" fill="white" rx="1" />
            <rect x="14" y="69" width="17" height="17" fill="white" rx="1" />
            <rect x="18" y="18" width="9" height="9" fill="currentColor" rx="1" />
            <rect x="73" y="18" width="9" height="9" fill="currentColor" rx="1" />
            <rect x="18" y="73" width="9" height="9" fill="currentColor" rx="1" />
            <rect x="42" y="10" width="7" height="7" fill="currentColor" />
            <rect x="42" y="42" width="7" height="7" fill="currentColor" />
            <rect x="52" y="42" width="7" height="7" fill="currentColor" />
            <rect x="42" y="52" width="7" height="7" fill="currentColor" />
            <rect x="65" y="52" width="7" height="7" fill="currentColor" />
            <rect x="75" y="52" width="7" height="7" fill="currentColor" />
            <rect x="65" y="65" width="7" height="7" fill="currentColor" />
            <rect x="80" y="65" width="7" height="7" fill="currentColor" />
            <rect x="52" y="75" width="7" height="7" fill="currentColor" />
            <rect x="65" y="80" width="7" height="7" fill="currentColor" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-emerald-700 dark:text-emerald-300">Your Member QR Code</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Share your referral link — scannable on any Cue Card
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => navigate("/tools/cue-card-generator")}
          >
            <CreditCard className="w-4 h-4" />
            Business Card
          </Button>
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => navigate("/tools/cue-card-v2")}
          >
            <CreditCard className="w-4 h-4" />
            Calling Card
          </Button>
          <Button
            className="gap-1.5"
            onClick={() => navigate("/cue-card/dashboard")}
          >
            <ExternalLink className="w-4 h-4" />
            My Cards
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentCommandCenterCard() {
  const navigate = useNavigate();

  const { data: queueStats } = useQuery({
    queryKey: ["helm-content-queue-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("helm_content_queue" as never)
        .select("status");
      if (error) return { total: 0, approved: 0, pending: 0 };
      const items = (data ?? []) as { status: string }[];
      return {
        total: items.length,
        approved: items.filter((i) => i.status === "approved" || i.status === "published" || i.status === "sent").length,
        pending: items.filter((i) => i.status === "draft" || i.status === "in_review").length,
      };
    },
    staleTime: 60_000,
  });

  if (!queueStats || queueStats.total === 0) return null;

  return (
    <Card
      className="mb-8 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-950/30 dark:to-blue-950/30 border-blue-200 dark:border-blue-800 cursor-pointer hover:border-blue-400 transition-colors"
      onClick={() => navigate("/helm/content")}
    >
      <CardContent className="py-5">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-xl">
            <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Content Command Center</h3>
            <p className="text-sm text-muted-foreground">
              {queueStats.approved}/{queueStats.total} documents reviewed &middot;{" "}
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {queueStats.pending} awaiting your review
              </span>
            </p>
          </div>
          <Button className="shrink-0">
            Open Command Center
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AlcoveLearningCard() {
  const navigate = useNavigate();
  const progress = useAlcoveProgress();

  return (
    <Card
      className="mb-8 bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/30 dark:to-sky-950/30 border-indigo-200 dark:border-indigo-800 cursor-pointer hover:border-indigo-400 transition-colors"
      onClick={() => navigate("/learn")}
    >
      <CardContent className="py-5">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-xl">
            <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Alcove Hallway</h3>
            <p className="text-sm text-muted-foreground">
              Structured learning path: {progress.completedCount}/18 stops comprehended.
            </p>
          </div>
          <Button className="shrink-0">
            Continue Learning
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function HelmPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("journey");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const { isCaptain, captain } = useCaptain();

  const { data: guildMembership } = useQuery({
    queryKey: ['guild-membership', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('guild_members' as never)
        .select('guild_id, chapter_progress, joined_at')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data as { guild_id: string; chapter_progress: number; joined_at: string } | null;
    },
    enabled: !!user,
  });

  const { data: beaconRuns, isLoading: runsLoading } = useQuery({
    queryKey: ["beacon-runs", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beacon_runs")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("times_completed", { ascending: false });

      if (error) throw error;
      return data as BeaconRun[];
    },
  });

  const { data: myRuns } = useQuery({
    queryKey: ["beacon-runs", "my", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("beacon_runs")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BeaconRun[];
    },
    enabled: !!user,
  });

  const { data: treasureProgress } = useQuery({
    queryKey: ["treasure-map-progress-all", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("treasure_map_progress" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("last_activity_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TreasureProgress[];
    },
    enabled: !!user,
  });

  const filteredRuns = beaconRuns?.filter((run) => {
    const matchesSearch = run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || run.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const featuredRuns = filteredRuns?.filter((r) => r.is_featured) || [];
  const regularRuns = filteredRuns?.filter((r) => !r.is_featured) || [];

  return (
    <PortalPageLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Compass className="w-8 h-8" />
            The Helm
          </h1>
          <p className="text-muted-foreground mt-1">
            Your navigation center — Journey maps, beacons, and Beacon Runs
          </p>
        </div>
        <div className="flex gap-2">
          <BeaconDropUI
            currentPath={window.location.pathname}
            currentPageTitle="The Helm"
          />
          {user && <BeaconRunCreator />}
        </div>
      </div>

      {/* Content Command Center Card */}
      <ContentCommandCenterCard />
      <AlcoveLearningCard />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="journey" className="gap-2">
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Journey Map</span>
            <span className="sm:hidden">Map</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Content Library</span>
            <span className="sm:hidden">Library</span>
          </TabsTrigger>
          <TabsTrigger value="runs" className="gap-2">
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">Beacon Runs</span>
            <span className="sm:hidden">Runs</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Leaderboards</span>
            <span className="sm:hidden">Boards</span>
          </TabsTrigger>
        </TabsList>

        {/* Journey Map Tab */}
        <TabsContent value="journey" className="mt-6">
          <JourneyMap />
        </TabsContent>

        {/* Content Library Tab */}
        <TabsContent value="library" className="mt-6">
          <HelmContentLibrary />
        </TabsContent>

        {/* Beacon Runs Tab */}
        <TabsContent value="runs" className="mt-6 space-y-6">
          {/* Ghost Mode Notice */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Ghost className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-medium">Ghost Mode Required</p>
                  <p className="text-sm text-muted-foreground">
                    Beacon Runs can only be created and played in Ghost Mode.
                    Even paying members go Ghost to compete!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search beacon runs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Featured Runs */}
          {featuredRuns.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Featured Runs
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredRuns.map((run) => (
                  <BeaconRunCard key={run.id} run={run} />
                ))}
              </div>
            </div>
          )}

          {/* All Runs */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              All Beacon Runs
            </h3>
            {runsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : regularRuns && regularRuns.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularRuns.map((run) => (
                  <BeaconRunCard key={run.id} run={run} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-medium mb-2">No Beacon Runs Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Be the first to create a Beacon Run course!
                  </p>
                  {user && <BeaconRunCreator />}
                </CardContent>
              </Card>
            )}
          </div>

          {/* My Runs */}
          {user && myRuns && myRuns.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Beacon Runs
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRuns.map((run) => (
                  <BeaconRunCard key={run.id} run={run} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Leaderboards Tab */}
        <TabsContent value="leaderboards" className="mt-6 space-y-6">
          <BeaconRunLeaderboard showGlobalStats />

          {/* Crow Feathers Explanation */}
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🪶</div>
                <div>
                  <h3 className="font-semibold text-lg">Crow Feathers</h3>
                  <p className="text-muted-foreground">
                    Earn Crow Feathers by setting records in Ghost Mode.
                    These are permanent achievements that prove your skill
                    even when you return to normal mode.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">Speed Records</Badge>
                    <Badge variant="outline">First Completions</Badge>
                    <Badge variant="outline">Course Creation</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* My Treasure Map Progress */}
      {user && treasureProgress && treasureProgress.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-amber-500" />
              My Treasure Map Progress
            </CardTitle>
            <CardDescription>Your active journeys and knowledge scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {treasureProgress.map((tp) => {
                const phaseIdx = ["scout", "pitch", "launch", "expand"].indexOf(tp.current_phase);
                const phasesComplete = tp.completed_at ? PHASE_COUNT : Math.max(0, phaseIdx);
                const pct = Math.round((phasesComplete / PHASE_COUNT) * 100);

                return (
                  <Card
                    key={tp.id}
                    className="bg-card/50 border-border hover:border-amber-500/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/treasure-maps/${tp.map_id}`)}
                  >
                    <CardContent className="pt-4 pb-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          {MAP_LABELS[tp.map_id] || tp.map_id}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Lvl {tp.current_level}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="capitalize">{tp.current_phase} phase</span>
                          <span>{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                      {tp.quiz_score != null && (
                        <p className="text-xs text-muted-foreground">
                          Quiz: {tp.quiz_score}/5
                        </p>
                      )}
                      {tp.completed_at && (
                        <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                          Completed
                        </Badge>
                      )}
                      <Button size="sm" variant="ghost" className="w-full text-xs gap-1">
                        Continue <ArrowRight className="w-3 h-3" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medallions Earned */}
      {user && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Medallions Earned
            </CardTitle>
            <CardDescription>
              Physical and digital medallions awarded for platform achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Ship Medallion — first entry, future medallions follow same pattern */}
              <Card className="bg-card/50 border-border hover:border-amber-500/30 transition-colors">
                <CardContent className="pt-6 pb-4 flex flex-col items-center text-center gap-3">
                  <ShipMedallion size="sm" earned={false} remainingLinks={13} />
                  <div>
                    <p className="text-sm font-semibold">Ship Medallion</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Complete all 13 HexIsle campaigns to earn
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Locked
                  </Badge>
                </CardContent>
              </Card>

              {/* Guild Medallion */}
              <Card className={`bg-card/50 border-border transition-colors ${guildMembership ? 'hover:border-amber-500/30' : ''}`}>
                <CardContent className="pt-6 pb-4 flex flex-col items-center text-center gap-3">
                  <div className={`w-[120px] h-[120px] rounded-full flex items-center justify-center text-4xl border-2 ${
                    guildMembership && guildMembership.chapter_progress >= 100
                      ? 'bg-gradient-to-br from-amber-600/40 to-amber-800/40 border-amber-400/50'
                      : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/20'
                  }`}>
                    {GUILDS.find(g => g.id === guildMembership?.guild_id)?.icon || '⚒️'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Guild Medallion</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {guildMembership
                        ? `${GUILDS.find(g => g.id === guildMembership.guild_id)?.name || 'Guild'} — ${Math.round(guildMembership.chapter_progress)}% complete`
                        : 'Join a Guild to begin'}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {guildMembership
                      ? guildMembership.chapter_progress >= 100 ? 'Earned' : 'In Progress'
                      : 'Locked'}
                  </Badge>
                </CardContent>
              </Card>

              {/* Captain Medallion */}
              <Card className={`bg-card/50 border-border transition-colors ${isCaptain ? 'hover:border-amber-500/30' : ''}`}>
                <CardContent className="pt-6 pb-4 flex flex-col items-center text-center gap-3">
                  <div className={`w-[120px] h-[120px] rounded-full flex items-center justify-center text-4xl border-2 ${
                    captain?.medallion_produced
                      ? 'bg-gradient-to-br from-amber-600/40 to-amber-800/40 border-amber-400/50'
                      : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/20'
                  }`}>
                    ⚓
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Captain Medallion</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isCaptain
                        ? `${captain!.level.replace('captain_', 'Captain ')} — ${captain!.orders_managed} orders managed`
                        : 'Reach Captain status to begin'}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {captain?.medallion_produced ? 'Earned' : isCaptain ? 'In Progress' : 'Locked'}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photography Bounties Card */}
      {user && (
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-500" />
              Photography Bounties
            </CardTitle>
            <CardDescription>
              Photograph local businesses, post to social media, earn Marks — zero uploads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotographyHelmStats userId={user.id} />
            <Button
              className="w-full mt-4"
              onClick={() => navigate("/bounty/photography")}
            >
              <Camera className="w-4 h-4 mr-2" />
              Claim New Bounty
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pearl Diver Stats Card */}
      {user && (
        <Card className="mt-8 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-200 dark:border-teal-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-600" />
              Pearl Diver — Resource Board
            </CardTitle>
            <CardDescription>
              Find deals others miss. Log tips, earn Marks, build a following.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PearlDiverHelmStats userId={user.id} />
            <Button
              className="w-full mt-4"
              onClick={() => navigate("/resource-board")}
            >
              <Compass className="w-4 h-4 mr-2" />
              Open Resource Board
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscription Channels Card */}
      {user && (
        <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-indigo-500" />
              Subscription Channels
            </CardTitle>
            <CardDescription>
              Create channels or subscribe to others — Marks, Credits, Joules, or Dollars
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionHelmStats userId={user.id} />
            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1"
                onClick={() => navigate("/subscription-channels")}
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Channels
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/subscription-channels/create")}
              >
                <Repeat className="w-4 h-4 mr-2" />
                Create Channel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cooperative Classroom Card */}
      {user && (
        <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              Cooperative Classroom
            </CardTitle>
            <CardDescription>
              Teach from home via Zoom — group classes & 1-on-1 tutoring. Keep 83.3%.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeacherHelmStats userId={user.id} />
            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1"
                onClick={() => navigate("/classroom")}
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Classroom
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/classroom/setup")}
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Teacher Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pioneer Status Card */}
      {user && (
        <Card className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Pioneer Status
            </CardTitle>
            <CardDescription>
              Your Cue Card Pioneer designations — first adopters earn bonus Marks and recognition.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PioneerHelmStats userId={user.id} />
            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1"
                onClick={() => navigate("/pioneers")}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Pioneer Showcase
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Freezer Node Card */}
      {user && (
        <Card className="mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-cyan-200 dark:border-cyan-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-500" />
              Freezer Node
            </CardTitle>
            <CardDescription>
              Batch-cook meals, freeze in portions, distribute through the cooperative. Keep 83.3%.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FreezerNodeHelmStats userId={user.id} />
            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1"
                onClick={() => navigate("/freezer-nodes")}
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Nodes
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/freezer-nodes/setup")}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Setup Node
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Plugs Card */}
      {user && (
        <SocialPlugsCard userId={user.id} />
      )}

      {/* Cue Card Quick Actions */}
      {user && (
        <CueCardQuickActions userId={user.id} />
      )}

      {/* Footer Info */}
      <Card className="mt-8 bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <Map className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium">Journey Maps</h4>
              <p className="text-sm text-muted-foreground">
                Drop beacons as you explore. Portal back anytime.
              </p>
            </div>
            <div>
              <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium">Beacon Runs</h4>
              <p className="text-sm text-muted-foreground">
                Create and compete in timed courses. Ghost Mode only.
              </p>
            </div>
            <div>
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium">Crow Feathers</h4>
              <p className="text-sm text-muted-foreground">
                Permanent achievements from Ghost Mode records.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}

export default HelmPage;
