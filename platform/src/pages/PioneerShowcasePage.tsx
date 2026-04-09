import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Award,
  Camera,
  Compass,
  Crown,
  Gift,
  GraduationCap,
  Rocket,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

interface Pioneer {
  id: string;
  member_id: string;
  cue_card_role: string;
  pioneer_number: number;
  tier: string;
  monthly_bonus_marks: number;
  bonus_expires_at: string | null;
  opted_in_showcase: boolean;
  showcase_real_name: boolean;
  showcase_story: string | null;
  medallion_serial: string | null;
  created_at: string;
}

const ROLE_META: Record<string, { label: string; icon: typeof Camera; color: string }> = {
  bounty_photographer: { label: "Bounty Photographer", icon: Camera, color: "blue" },
  pearl_diver: { label: "Pearl Diver", icon: Compass, color: "teal" },
  home_teacher: { label: "Home Teacher", icon: GraduationCap, color: "indigo" },
  captain: { label: "Node Captain", icon: Star, color: "amber" },
  subscription_creator: { label: "Subscription Creator", icon: Zap, color: "purple" },
};

const TIER_CONFIG: Record<string, { label: string; badge: string; icon: typeof Crown }> = {
  founders_circle: { label: "Founders' Circle", badge: "bg-amber-500 text-white", icon: Crown },
  trailblazer: { label: "Trailblazer", badge: "bg-blue-500 text-white", icon: Rocket },
  pathfinder: { label: "Pathfinder", badge: "bg-emerald-500 text-white", icon: Compass },
  early_adopter: { label: "Early Adopter", badge: "bg-slate-500 text-white", icon: Star },
  standard: { label: "Standard", badge: "bg-gray-400 text-white", icon: Users },
};

function PioneerCard({ pioneer }: { pioneer: Pioneer }) {
  const navigate = useNavigate();
  const role = ROLE_META[pioneer.cue_card_role] ?? { label: pioneer.cue_card_role, icon: Award, color: "gray" };
  const tier = TIER_CONFIG[pioneer.tier] ?? TIER_CONFIG.standard;
  const RoleIcon = role.icon;
  const TierIcon = tier.icon;
  const isActive = pioneer.bonus_expires_at ? new Date(pioneer.bonus_expires_at) > new Date() : false;
  const slug = pioneer.cue_card_role.replace(/_/g, "-");

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow border-l-4"
      style={{ borderLeftColor: `var(--${role.color}-500, #6366f1)` }}
      onClick={() => navigate(`/pioneers/${slug}/${pioneer.pioneer_number}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge className={tier.badge}>
            <TierIcon className="w-3 h-3 mr-1" />
            {tier.label}
          </Badge>
          <span className="text-2xl font-bold text-muted-foreground">
            #{pioneer.pioneer_number}
          </span>
        </div>
        <CardTitle className="flex items-center gap-2 text-base mt-2">
          <RoleIcon className="w-4 h-4" />
          {role.label}
        </CardTitle>
        {pioneer.opted_in_showcase && pioneer.showcase_story && (
          <CardDescription className="line-clamp-2">
            {pioneer.showcase_story}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {pioneer.medallion_serial && (
            <Badge variant="outline" className="text-[10px]">
              <Award className="w-2.5 h-2.5 mr-0.5" />
              {pioneer.medallion_serial}
            </Badge>
          )}
          {isActive && pioneer.monthly_bonus_marks > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              +{pioneer.monthly_bonus_marks} Marks/mo
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Since {new Date(pioneer.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}

function RoleProgressBar({ role, pioneers }: { role: string; pioneers: Pioneer[] }) {
  const rolePioneers = pioneers.filter((p) => p.cue_card_role === role);
  const foundersCount = rolePioneers.filter((p) => p.tier === "founders_circle").length;
  const totalCount = rolePioneers.length;
  const meta = ROLE_META[role] ?? { label: role, icon: Award, color: "gray" };
  const Icon = meta.icon;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="font-medium text-sm">{meta.label}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {totalCount} pioneer{totalCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Founders' Circle</span>
          <span>{foundersCount} / 10 slots filled</span>
        </div>
        <Progress value={(foundersCount / 10) * 100} className="h-2" />
        {foundersCount < 10 && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {10 - foundersCount} Founders' Circle slot{10 - foundersCount !== 1 ? "s" : ""} remaining!
          </p>
        )}
      </div>
    </Card>
  );
}

const TIER_LABEL_MAP: Record<string, string> = {
  founders_circle: "Founders' Circle",
  trailblazer: "Trailblazer",
  pathfinder: "Pathfinder",
  early_adopter: "Early Adopter",
  standard: "Standard",
};

function MyBonusHistory({ userId }: { userId: string }) {
  const { data: bonusLog = [] } = useQuery({
    queryKey: ["pioneer-bonus-log", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pioneer_bonus_log" as never)
        .select("id, role, tier, bonus_marks, billing_month, status, created_at")
        .eq("member_id", userId)
        .eq("status", "disbursed")
        .order("billing_month", { ascending: false });
      if (error) return [];
      return (data ?? []) as {
        id: string; role: string; tier: string; bonus_marks: number;
        billing_month: string; status: string; created_at: string;
      }[];
    },
  });

  const { data: myPioneers = [] } = useQuery({
    queryKey: ["my-pioneers-showcase", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pioneers" as never)
        .select("id, cue_card_role, tier, bonus_duration_months, bonus_started_at")
        .eq("member_id", userId)
        .gt("monthly_bonus_marks", 0);
      if (error) return [];
      return (data ?? []) as {
        id: string; cue_card_role: string; tier: string;
        bonus_duration_months: number; bonus_started_at: string;
      }[];
    },
  });

  if (bonusLog.length === 0 && myPioneers.length === 0) return null;

  const totalEarned = bonusLog.reduce((s, b) => s + b.bonus_marks, 0);
  const lastBonus = bonusLog[0] ?? null;

  return (
    <Card className="mt-8 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-green-600" />
          My Pioneer Bonus History
        </CardTitle>
        <CardDescription>
          {totalEarned > 0
            ? `You've earned ${totalEarned} Marks from pioneer bonuses.`
            : "Your pioneer bonuses will appear here after the first monthly disbursement."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastBonus && (
          <div className="flex items-center gap-4 text-sm">
            <div className="bg-white dark:bg-black/20 rounded-lg p-3 text-center flex-1">
              <p className="text-lg font-bold text-green-600">{lastBonus.bonus_marks}</p>
              <p className="text-[10px] text-muted-foreground">Last Bonus (Marks)</p>
            </div>
            <div className="bg-white dark:bg-black/20 rounded-lg p-3 text-center flex-1">
              <p className="text-lg font-bold">{lastBonus.billing_month}</p>
              <p className="text-[10px] text-muted-foreground">Last Month</p>
            </div>
            <div className="bg-white dark:bg-black/20 rounded-lg p-3 text-center flex-1">
              <p className="text-lg font-bold text-amber-600">{totalEarned}</p>
              <p className="text-[10px] text-muted-foreground">Total Earned</p>
            </div>
          </div>
        )}

        {myPioneers.map((p) => {
          if (p.bonus_duration_months <= 0) return null;
          const started = new Date(p.bonus_started_at);
          const now = new Date();
          const elapsed = Math.max(0, (now.getFullYear() - started.getFullYear()) * 12 + (now.getMonth() - started.getMonth()));
          const remaining = Math.max(0, p.bonus_duration_months - elapsed);
          const pct = Math.min(100, (elapsed / p.bonus_duration_months) * 100);
          const roleMeta = ROLE_META[p.cue_card_role];
          return (
            <div key={p.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{roleMeta?.label ?? p.cue_card_role} ({TIER_LABEL_MAP[p.tier] ?? p.tier})</span>
                <span className="text-muted-foreground">{remaining} of {p.bonus_duration_months} months remaining</span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          );
        })}

        {bonusLog.length > 3 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              View all {bonusLog.length} disbursements
            </summary>
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
              {bonusLog.map((b) => (
                <div key={b.id} className="flex justify-between bg-muted/30 rounded px-2 py-1">
                  <span>{b.billing_month} — {ROLE_META[b.role]?.label ?? b.role}</span>
                  <span className="font-medium">+{b.bonus_marks} Marks</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

export function PioneerShowcasePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: pioneers = [], isLoading } = useQuery({
    queryKey: ["pioneers-showcase"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pioneers" as never)
        .select("*")
        .order("pioneer_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Pioneer[];
    },
  });

  const roles = [...new Set(pioneers.map((p) => p.cue_card_role))];
  const allRoles = Object.keys(ROLE_META);
  const displayRoles = [...new Set([...allRoles, ...roles])];

  const filtered = roleFilter === "all"
    ? pioneers
    : pioneers.filter((p) => p.cue_card_role === roleFilter);

  const founderSlots = allRoles.reduce((acc, role) => {
    const count = pioneers.filter((p) => p.cue_card_role === role && p.tier === "founders_circle").length;
    return acc + (10 - count);
  }, 0);

  return (
    <PortalPageLayout
      title="Pioneer Showcase"
      subtitle="The first to prove it. Their stories recruit the next wave."
    >
      {/* Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-1 text-amber-500" />
          <p className="text-2xl font-bold">{pioneers.length}</p>
          <p className="text-xs text-muted-foreground">Total Pioneers</p>
        </Card>
        <Card className="p-4 text-center">
          <Crown className="w-6 h-6 mx-auto mb-1 text-amber-500" />
          <p className="text-2xl font-bold">
            {pioneers.filter((p) => p.tier === "founders_circle").length}
          </p>
          <p className="text-xs text-muted-foreground">Founders' Circle</p>
        </Card>
        <Card className="p-4 text-center">
          <Users className="w-6 h-6 mx-auto mb-1 text-blue-500" />
          <p className="text-2xl font-bold">{roles.length}</p>
          <p className="text-xs text-muted-foreground">Active Roles</p>
        </Card>
        <Card className="p-4 text-center">
          <Zap className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
          <p className="text-2xl font-bold">{founderSlots}</p>
          <p className="text-xs text-muted-foreground">Founders' Slots Open</p>
        </Card>
      </div>

      {/* Role Progress Bars */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {displayRoles.map((role) => (
          <RoleProgressBar key={role} role={role} pioneers={pioneers} />
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {displayRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_META[role]?.label ?? role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {user && (
          <Button variant="outline" onClick={() => navigate("/dashboard/helm")}>
            <Award className="w-4 h-4 mr-2" />
            Check My Pioneer Status
          </Button>
        )}
      </div>

      {/* Pioneer Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No pioneers yet for this role</h3>
          <p className="text-muted-foreground mb-4">
            Be the first! Complete your first action in a Cue Card role to claim your Pioneer number.
          </p>
          <Button onClick={() => navigate("/dashboard/cue-cards")}>
            Browse Cue Card Roles
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pioneer) => (
            <PioneerCard key={pioneer.id} pioneer={pioneer} />
          ))}
        </div>
      )}

      {/* My Bonus History (logged-in pioneers only) */}
      {user && <MyBonusHistory userId={user.id} />}

      {/* Become a Pioneer CTA */}
      <Card className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Become a Pioneer
          </CardTitle>
          <CardDescription>
            The first 10 adopters for each Cue Card role earn Founders' Circle status — 50 Marks/month
            for 12 months, a physical medallion, and permanent showcase placement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-5 gap-3 mb-4">
            {[
              { tier: "Founders' Circle", range: "#1–10", bonus: "50 Marks/mo × 12", badge: "bg-amber-500" },
              { tier: "Trailblazer", range: "#11–100", bonus: "25 Marks/mo × 6", badge: "bg-blue-500" },
              { tier: "Pathfinder", range: "#101–500", bonus: "10 Marks/mo × 3", badge: "bg-emerald-500" },
              { tier: "Early Adopter", range: "#501–1,000", bonus: "5 Marks (one-time)", badge: "bg-slate-500" },
              { tier: "Standard", range: "#1,001+", bonus: "Role validated!", badge: "bg-gray-400" },
            ].map((t) => (
              <div key={t.tier} className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
                <Badge className={`${t.badge} text-white text-[10px] mb-1`}>{t.tier}</Badge>
                <p className="text-sm font-medium">{t.range}</p>
                <p className="text-[11px] text-muted-foreground">{t.bonus}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Pioneer status is automatically assigned when you complete your first action in any Cue Card role.
            The flywheel: pioneer proves it → story recruits next wave → statistics prove viability → role is self-sustaining.
          </p>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}

export default PioneerShowcasePage;
