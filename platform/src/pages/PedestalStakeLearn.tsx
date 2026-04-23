import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield,
  TrendingUp,
  FileText,
  AlertTriangle,
  Scale,
  ArrowRight,
  Building2,
  Lock,
  Users,
  ExternalLink,
} from "lucide-react";
import { RegCFCapCalculator } from "@/components/pedestal/RegCFCapCalculator";

export default function PedestalStakeLearn() {
  const { data: raiseData } = useQuery({
    queryKey: ["pedestal-raise-tracking"],
    queryFn: async () => {
      const { data } = await supabase
        .from("pedestal_raise_tracking" as never)
        .select("*")
        .order("period_start", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as { cumulative_raised_usd: number; annual_cap_usd: number; holder_count: number } | null;
    },
  });

  return (
    <PortalPageLayout
      title="Pedestal Stakes"
      subtitle="Participate in Upekrithen LLC's patent-portfolio revenue"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Hero */}
        <section className="text-center space-y-4 py-6">
          <Building2 className="h-12 w-12 mx-auto text-amber-400" />
          <h2 className="text-2xl font-bold">What Is a Pedestal Stake?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A Pedestal Stake is a participation interest in <strong>Upekrithen LLC</strong>,
            the entity that manages the Liana Banyan patent portfolio. Stake holders receive
            a proportional share of patent-portfolio cash-flow distributions.
          </p>
        </section>

        {/* Two-track separation notice */}
        <Card className="border-amber-600/30 bg-amber-950/10">
          <CardContent className="py-4 flex items-start gap-3">
            <Scale className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-400">Two-Track Economy</p>
              <p className="text-sm text-foreground/80">
                Pedestal Stakes are issued by <strong>Upekrithen LLC</strong> — a separate entity
                from Liana Banyan Corporation. Holding a Pedestal Stake does <strong>not</strong>{" "}
                grant voting rights in the Liana Banyan cooperative. These are separate tracks by design.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key facts grid */}
        <section className="grid sm:grid-cols-2 gap-4">
          <FactCard
            icon={FileText}
            title="Regulation CF Offering"
            description="This offering is conducted under SEC Regulation Crowdfunding. Up to $5M per 12-month period. Open to all investors (accredited and non-accredited)."
          />
          <FactCard
            icon={Shield}
            title="FINRA-Registered Intermediary"
            description="All transactions go through a registered funding portal or broker-dealer. Upekrithen LLC does not handle investor funds directly."
          />
          <FactCard
            icon={TrendingUp}
            title="Cash-Flow Distributions"
            description="Stake holders receive proportional distributions from patent-portfolio revenue. Distribution frequency determined by the operating agreement."
          />
          <FactCard
            icon={Lock}
            title="Transfer Restrictions"
            description="Pedestal Stakes are illiquid. Transfer restrictions apply per Reg CF rules. These are not freely tradeable securities."
          />
        </section>

        {/* Risk factors */}
        <Card className="border-red-600/20 bg-red-950/5">
          <CardContent className="py-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <h3 className="font-semibold text-red-400">Risk Factors</h3>
            </div>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>• Investing in Pedestal Stakes involves substantial risk, including the potential loss of your entire investment.</li>
              <li>• Pedestal Stakes are illiquid — you may not be able to sell or transfer them.</li>
              <li>• Patent-portfolio revenue is not guaranteed. Distributions depend on licensing, enforcement, and market conditions.</li>
              <li>• Past performance of the patent portfolio does not guarantee future results.</li>
              <li>• This is not investment advice. Consult your own financial advisor before investing.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Investor cap calculator */}
        <RegCFCapCalculator />

        {/* TODO(counsel): Insert final Form C reference language here. Contact: counsel per project_counsel_task_based.md */}
        {/* TODO(counsel): Insert final Offering Memorandum content here. Contact: counsel per project_counsel_task_based.md */}
        {/* TODO(counsel): Insert risk-factors block here. Contact: counsel per project_counsel_task_based.md */}
        <Card className="border border-border/50">
          <CardContent className="py-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" /> Offering Documents
            </h3>
            <p className="text-sm text-muted-foreground">
              The Form C filing and Offering Memorandum will be available here once the
              offering launches through our registered intermediary. Early-interest signups
              will be notified when documents are ready for review.
            </p>
            <div className="flex gap-2 opacity-50">
              <Button size="sm" variant="outline" disabled>
                Form C <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" disabled>
                Offering Memorandum <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Raise progress (public transparency) */}
        {raiseData && (
          <Card className="border border-border/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Annual Raise Progress</span>
                <span className="text-xs text-muted-foreground">
                  ${(raiseData.cumulative_raised_usd || 0).toLocaleString()} / ${(raiseData.annual_cap_usd || 5000000).toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      ((raiseData.cumulative_raised_usd || 0) / (raiseData.annual_cap_usd || 5000000)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {raiseData.holder_count || 0} investors — Reg CF annual cap: $5,000,000
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTAs */}
        <section className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link to="/pedestal-stake/early-interest">
            <Button size="lg" className="w-full sm:w-auto">
              <Users className="mr-2 h-4 w-4" />
              Register Early Interest
            </Button>
          </Link>
          <Link to="/pedestal-stake/apply">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Apply Now <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </section>

        <p className="text-xs text-muted-foreground text-center max-w-xl mx-auto">
          This page is for informational purposes only. No money or other consideration
          is being solicited by this communication. No offer to buy securities will be
          accepted until an offering statement is qualified. An indication of interest
          involves no obligation or commitment of any kind.
        </p>
      </div>
    </PortalPageLayout>
  );
}

function FactCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card className="border border-border/50">
      <CardContent className="py-4 space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-amber-400" />
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
