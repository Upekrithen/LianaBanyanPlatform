import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Award,
  Calendar,
  Camera,
  Compass,
  Crown,
  GraduationCap,
  QrCode,
  Rocket,
  Star,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";

interface PioneerDetail {
  id: string;
  member_id: string;
  cue_card_role: string;
  pioneer_number: number;
  tier: string;
  monthly_bonus_marks: number;
  bonus_duration_months: number;
  bonus_started_at: string;
  bonus_expires_at: string | null;
  opted_in_showcase: boolean;
  showcase_real_name: boolean;
  showcase_story: string | null;
  medallion_serial: string | null;
  medallion_shipped: boolean;
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
  standard: { label: "Standard", badge: "bg-gray-400 text-white", icon: Trophy },
};

export function PioneerProfilePage() {
  const { role, number } = useParams<{ role: string; number: string }>();
  const navigate = useNavigate();

  const dbRole = role?.replace(/-/g, "_") ?? "";
  const pioneerNum = parseInt(number ?? "0", 10);

  const { data: pioneer, isLoading } = useQuery({
    queryKey: ["pioneer-profile", dbRole, pioneerNum],
    enabled: !!dbRole && pioneerNum > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pioneers" as never)
        .select("*")
        .eq("cue_card_role", dbRole)
        .eq("pioneer_number", pioneerNum)
        .maybeSingle();
      if (error) throw error;
      return data as PioneerDetail | null;
    },
  });

  const { data: roleStats } = useQuery({
    queryKey: ["pioneer-role-stats", dbRole],
    enabled: !!dbRole,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pioneers" as never)
        .select("id, tier")
        .eq("cue_card_role", dbRole);
      if (error) return { total: 0, foundersCount: 0 };
      const all = (data ?? []) as { id: string; tier: string }[];
      return {
        total: all.length,
        foundersCount: all.filter((p) => p.tier === "founders_circle").length,
      };
    },
  });

  const roleMeta = ROLE_META[dbRole] ?? { label: dbRole, icon: Award, color: "gray" };
  const RoleIcon = roleMeta.icon;

  if (isLoading) {
    return (
      <PortalPageLayout title="Loading Pioneer..." subtitle="">
        <div className="animate-pulse space-y-4">
          <Card className="h-64 bg-muted/30" />
          <Card className="h-48 bg-muted/30" />
        </div>
      </PortalPageLayout>
    );
  }

  if (!pioneer) {
    return (
      <PortalPageLayout title="Pioneer Not Found" subtitle="">
        <Card className="p-12 text-center">
          <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">
            Pioneer #{pioneerNum} for {roleMeta.label} doesn't exist yet
          </h3>
          <p className="text-muted-foreground mb-4">
            This slot hasn't been claimed. Be the one to fill it!
          </p>
          <Button onClick={() => navigate("/pioneers")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Showcase
          </Button>
        </Card>
      </PortalPageLayout>
    );
  }

  const tier = TIER_CONFIG[pioneer.tier] ?? TIER_CONFIG.standard;
  const TierIcon = tier.icon;
  const isActive = pioneer.bonus_expires_at
    ? new Date(pioneer.bonus_expires_at) > new Date()
    : false;
  const monthsActive = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(pioneer.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
  );
  const totalBonusEarned = isActive
    ? monthsActive * pioneer.monthly_bonus_marks
    : pioneer.bonus_duration_months * pioneer.monthly_bonus_marks;
  const qrUrl = `${window.location.origin}/pioneers/${role}/${number}`;

  return (
    <PortalPageLayout
      title={`Pioneer #${pioneer.pioneer_number} — ${roleMeta.label}`}
      subtitle={`${tier.label} tier member since ${new Date(pioneer.created_at).toLocaleDateString()}`}
    >
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/pioneers")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Showcase
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Card */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <RoleIcon className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    Pioneer #{pioneer.pioneer_number}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge className={tier.badge}>
                      <TierIcon className="w-3 h-3 mr-1" />
                      {tier.label}
                    </Badge>
                    <span>{roleMeta.label}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                  <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-lg font-bold">{monthsActive}</p>
                  <p className="text-[11px] text-muted-foreground">Months Active</p>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                  <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-lg font-bold">{totalBonusEarned}</p>
                  <p className="text-[11px] text-muted-foreground">Bonus Marks Earned</p>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                  <Timer className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                  <p className="text-lg font-bold">
                    {isActive ? "Active" : "Expired"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Bonus Status</p>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                  <Award className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                  <p className="text-lg font-bold">
                    +{pioneer.monthly_bonus_marks}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Marks / Month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Story */}
          {pioneer.opted_in_showcase && pioneer.showcase_story && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Their Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {pioneer.showcase_story}
                </p>
              </CardContent>
            </Card>
          )}

          {!pioneer.opted_in_showcase && (
            <Card className="bg-muted/30">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  This pioneer hasn't opted in to the public showcase yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Pioneer QR Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-lg text-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUrl)}`}
                  alt={`QR code for Pioneer #${pioneer.pioneer_number}`}
                  className="mx-auto"
                  width={180}
                  height={180}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center break-all">
                {qrUrl}
              </p>
            </CardContent>
          </Card>

          {/* Medallion */}
          {pioneer.medallion_serial && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Physical Medallion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm mb-2">{pioneer.medallion_serial}</p>
                <Badge variant={pioneer.medallion_shipped ? "default" : "outline"}>
                  {pioneer.medallion_shipped ? "Shipped" : "Pending Shipment"}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Role Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {roleMeta.label} Pioneers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span className="font-medium">{roleStats?.total ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Founders' Circle</span>
                <span className="font-medium">{roleStats?.foundersCount ?? 0} / 10</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate("/pioneers")}
              >
                View All Pioneers
              </Button>
            </CardContent>
          </Card>

          {/* Bonus Timeline */}
          {pioneer.monthly_bonus_marks > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Bonus Timeline</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started</span>
                  <span>{new Date(pioneer.bonus_started_at).toLocaleDateString()}</span>
                </div>
                {pioneer.bonus_expires_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires</span>
                    <span>{new Date(pioneer.bonus_expires_at).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span>+{pioneer.monthly_bonus_marks} Marks/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{pioneer.bonus_duration_months} months</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PortalPageLayout>
  );
}

export default PioneerProfilePage;
