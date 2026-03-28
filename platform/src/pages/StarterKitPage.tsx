/**
 * StarterKitPage — $100 Business Starter Kit
 * 10,000 kits target. Sponsor or claim.
 * Innovation #2037
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Gift,
  CreditCard,
  Coins,
  BookOpen,
  QrCode,
  Users,
  ArrowRight,
  Shield,
  Rocket,
  Heart,
  CheckCircle2,
} from "lucide-react";

const KIT_COMPONENTS = [
  {
    icon: Users,
    title: "LB Membership (1 Year)",
    value: "$5 value",
    description: "Full cooperative membership — voting rights, marketplace access, patent protection.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: CreditCard,
    title: "LB Card with $50 Preloaded",
    value: "$50 value",
    description: "A programmable card with $50 cash ready to spend or invest in your first project.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Coins,
    title: "500 Starter Marks",
    value: "500 Marks",
    description: "Earned-value tokens to claim bounties, back projects, or build your reputation.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: BookOpen,
    title: "Business Formation Guide",
    value: "Guide",
    description: "Step-by-step walkthrough: sole proprietorship setup, EIN filing, and first-sale checklist.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: QrCode,
    title: "Physical Cue Card with QR",
    value: "Card",
    description: "Your personalized QR-coded card — hand it out, recruit others, grow your business.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
];

export default function StarterKitPage() {
  const navigate = useNavigate();

  // Placeholder stats — will be wired to DB counters
  const [stats] = useState({ sponsored: 0, claimed: 0, businessesStarted: 0 });
  const TARGET = 10_000;
  const pct = Math.min((stats.sponsored / TARGET) * 100, 100);

  return (
    <PortalPageLayout>
      <div className="container mx-auto px-4 py-16 max-w-5xl space-y-16">

        {/* Hero */}
        <div className="text-center space-y-6 py-8">
          <Badge variant="outline" className="text-sm px-4 py-1">Innovation #2037</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            The <span className="text-emerald-500">$100</span> Business Starter Kit
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to become a business owner. Today.
          </p>

          <div className="max-w-md mx-auto space-y-2 pt-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{stats.sponsored.toLocaleString()} of {TARGET.toLocaleString()} kits sponsored</span>
              <span>{pct.toFixed(1)}%</span>
            </div>
            <Progress value={pct} className="h-3" />
          </div>
        </div>

        {/* What's In The Kit */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">What's In The Kit</h2>
            <p className="text-muted-foreground">Five components. One business owner.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {KIT_COMPONENTS.map((item) => (
              <Card key={item.title} className="hover:shadow-md transition-all hover:-translate-y-1">
                <CardContent className="p-6 space-y-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">{item.value}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}

            {/* Total card */}
            <Card className="border-emerald-500/30 bg-emerald-500/5 hover:shadow-md transition-all hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full space-y-3">
                <Gift className="h-10 w-10 text-emerald-500" />
                <p className="text-4xl font-black text-emerald-500">$100</p>
                <p className="text-sm text-muted-foreground">Total kit value — backed by 10 provisional patents and 1,511 formal claims</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sponsor A Kit */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl flex items-center justify-center gap-3">
              <Heart className="h-6 w-6 text-primary" /> Sponsor A Kit
            </CardTitle>
            <CardDescription className="text-base max-w-lg mx-auto">
              Fund a kit for someone who needs it. $100 backs a new business owner.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Backed by our patent portfolio: 10 provisionals, 1,511 formal claims.
            </p>
            <Button size="lg" className="gap-2">
              <Gift className="h-5 w-5" /> Sponsor a Kit — $100
            </Button>
          </CardContent>
        </Card>

        {/* Claim A Kit */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl flex items-center justify-center gap-3">
              <Rocket className="h-6 w-6 text-amber-500" /> Claim A Kit
            </CardTitle>
            <CardDescription className="text-base">
              A kit has been sponsored for you? Claim it now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Creates your account</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Loads your LB Card</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Grants 500 Marks</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Generates your Cue Card</span>
            </div>
            <Button size="lg" variant="outline" className="gap-2">
              Claim Your Kit <ArrowRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Kits Sponsored", value: stats.sponsored, icon: Heart, color: "text-primary" },
            { label: "Kits Claimed", value: stats.claimed, icon: Gift, color: "text-emerald-500" },
            { label: "Businesses Started", value: stats.businessesStarted, icon: Rocket, color: "text-amber-500" },
          ].map((s) => (
            <Card key={s.label} className="text-center">
              <CardContent className="pt-6 space-y-2">
                <s.icon className={`h-8 w-8 mx-auto ${s.color}`} />
                <p className="text-3xl font-bold">{s.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA to production */}
        <div className="text-center pb-8">
          <Button size="lg" className="gap-2" onClick={() => navigate("/production")}>
            Start Your Business <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

      </div>
    </PortalPageLayout>
  );
}
