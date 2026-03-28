import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Anchor,
  ArrowRight,
  Package,
  TrendingUp,
  Star,
  MapPin,
  Shield,
  Map,
  Megaphone,
  Target,
} from "lucide-react";
import { useCaptain } from "@/hooks/useCaptain";
import { useCaptainOrders } from "@/hooks/useCaptainOrders";
import { CaptainTerritory } from "@/components/captain/CaptainTerritory";
import { CaptainPipeline } from "@/components/captain/CaptainPipeline";
import { CaptainIntelligence } from "@/components/captain/CaptainIntelligence";

const LEVEL_LABELS: Record<string, string> = {
  captain_10: "Captain 10",
  captain_50: "Captain 50",
  captain_100: "Captain 100",
  captain_1000: "Captain 1000",
};

const REP_STARS: Record<number, string> = {
  1: "★☆☆☆☆",
  2: "★★☆☆☆",
  3: "★★★☆☆",
  4: "★★★★☆",
  5: "★★★★★",
};

function reputationToStars(score: number): string {
  if (score >= 90) return REP_STARS[5];
  if (score >= 70) return REP_STARS[4];
  if (score >= 50) return REP_STARS[3];
  if (score >= 30) return REP_STARS[2];
  return REP_STARS[1];
}

export default function CaptainDashboardPage() {
  const navigate = useNavigate();
  const { captain, isCaptain, isLoading } = useCaptain();
  const { data: orders = [] } = useCaptainOrders(captain?.id);
  const [tab, setTab] = useState("territory");

  if (!isLoading && !isCaptain) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="captain-dashboard">
        <div className="text-center py-16 space-y-4">
          <Anchor className="w-16 h-16 mx-auto text-slate-500" />
          <h1 className="text-3xl font-bold">Not a Captain Yet</h1>
          <p className="text-muted-foreground">
            Stake your Marks and claim your region to become a Captain.
          </p>
          <Button onClick={() => navigate("/captain/become")} size="lg" className="bg-blue-600 hover:bg-blue-500">
            Become a Captain <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  if (!captain) return null;

  const activeOrders = orders.filter(o => o.status === "active" || o.status === "shipped");
  const stars = reputationToStars(captain.reputation_score);

  return (
    <PortalPageLayout maxWidth="xl" xrayId="captain-dashboard">
      <div className="space-y-6 py-6">
        {/* War Room Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Anchor className="w-7 h-7 text-blue-400" />
              Captain's Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-400 flex-wrap">
              <span className="text-amber-400 tracking-wide">{stars}</span>
              <Badge variant="outline" className="text-[10px]">
                {LEVEL_LABELS[captain.level]}
              </Badge>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {captain.city}, {captain.region}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/captain/medallion">
              <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
                <Anchor className="w-4 h-4 mr-2" />
                Medallion
              </Button>
            </Link>
            <Link to="/the300">
              <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
                <Shield className="w-4 h-4 mr-2" />
                The 300
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Marks Staked" value={captain.marks_staked.toLocaleString()} icon={<Anchor className="w-4 h-4 text-blue-400" />} />
          <StatCard label="Orders Managed" value={String(captain.orders_managed)} icon={<Package className="w-4 h-4 text-cyan-400" />} />
          <StatCard label="Fulfillment Rate" value={`${captain.fulfillment_rate}%`} icon={<TrendingUp className="w-4 h-4 text-emerald-400" />} />
          <StatCard label="Reputation" value={String(captain.reputation_score)} icon={<Star className="w-4 h-4 text-amber-400" />} />
        </div>

        {/* Tabbed War Room */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="bg-slate-800/60 border border-slate-700">
            <TabsTrigger value="territory" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300 gap-1.5">
              <Map className="w-4 h-4" />
              Territory
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300 gap-1.5">
              <Megaphone className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300 gap-1.5">
              <Target className="w-4 h-4" />
              Intelligence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="territory">
            <CaptainTerritory />
          </TabsContent>

          <TabsContent value="pipeline">
            <CaptainPipeline />
          </TabsContent>

          <TabsContent value="intelligence">
            <CaptainIntelligence />
          </TabsContent>
        </Tabs>

        {/* Tagline */}
        <div className="text-center pt-4 pb-8">
          <blockquote className="text-xl font-bold text-amber-300/80 italic">
            "What you do in little, you do in much."
          </blockquote>
        </div>
      </div>
    </PortalPageLayout>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="border-slate-700 bg-slate-800/30">
      <CardContent className="p-4 text-center">
        <div className="flex justify-center mb-1">{icon}</div>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </CardContent>
    </Card>
  );
}
