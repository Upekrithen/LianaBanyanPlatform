/**
 * FLY ON THE WALL — Public Transparency Dashboard
 * =================================================
 * Anyone can see platform health. No login required.
 * Shows: member count, transactions, treasury, charitable fund,
 * gleaning metrics, creator retention, and comparison to industry.
 *
 * Backend: platform_metrics, v_current_transparency_metrics,
 * current_metrics, financial_snapshots
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye, Users, TrendingUp, DollarSign, Heart, Shield,
  Activity, BarChart3, Globe, Zap, Clock, Coins,
} from "lucide-react";

export default function FlyOnTheWall() {
  const { data: metrics } = useQuery({
    queryKey: ["transparency-metrics"],
    queryFn: async () => {
      const { data } = await supabase
        .from("v_current_transparency_metrics")
        .select("*")
        .order("period_end", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
  });

  const { data: currentMetrics } = useQuery({
    queryKey: ["current-metrics"],
    queryFn: async () => {
      const { data } = await supabase
        .from("current_metrics")
        .select("*");
      return data || [];
    },
  });

  const { data: innovations } = useQuery({
    queryKey: ["innovation-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("innovation_log")
        .select("id", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: dnaLock } = useQuery({
    queryKey: ["dna-lock-public"],
    queryFn: async () => {
      const { data } = await supabase
        .from("dna_lock")
        .select("parameter_key, parameter_value, description, category")
        .eq("is_locked", true);
      return data || [];
    },
  });

  const m = metrics || {} as any;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Public Transparency</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Fly on the Wall</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything is transparent. Everything is public. No login required.
            This is what we are. Right now. In real time.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-3xl font-bold">{m.total_members || 0}</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
              <div className="text-xs text-green-600 mt-1">
                {m.active_members_30_day || 0} active (30d)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-3xl font-bold">{m.total_transactions || 0}</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <div className="text-3xl font-bold">
                ${Number(m.treasury_balance || 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Treasury</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <div className="text-3xl font-bold">
                ${Number(m.charitable_fund_balance || 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Charitable Fund</div>
            </CardContent>
          </Card>
        </div>

        {/* Innovation + Patent Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="text-3xl font-bold">{innovations || "1,719"}</div>
              <div className="text-sm text-muted-foreground">Documented Innovations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">8</div>
              <div className="text-sm text-muted-foreground">Crown Jewel Patents (No Prior Art)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Globe className="w-8 h-8 mx-auto mb-2 text-cyan-500" />
              <div className="text-3xl font-bold">16</div>
              <div className="text-sm text-muted-foreground">Charitable Initiatives</div>
            </CardContent>
          </Card>
        </div>

        {/* Gleaning / Newcomer Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Newcomer Health
            </CardTitle>
            <CardDescription>How well we support new members (Boaz Principle)</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{m.newcomers_this_period || 0}</div>
              <div className="text-sm text-muted-foreground">New This Period</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {m.avg_time_to_first_transaction_hours
                  ? `${Number(m.avg_time_to_first_transaction_hours).toFixed(0)}h`
                  : "—"}
              </div>
              <div className="text-sm text-muted-foreground">Avg Time to First Transaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {m.newcomer_30_day_retention
                  ? `${(Number(m.newcomer_30_day_retention) * 100).toFixed(0)}%`
                  : "—"}
              </div>
              <div className="text-sm text-muted-foreground">30-Day Retention</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{m.active_gleaners_count || 0}</div>
              <div className="text-sm text-muted-foreground">Active Gleaners</div>
            </div>
          </CardContent>
        </Card>

        {/* Ghost Credits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-blue-500" />
              Ghost Credit Economy
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{Number(m.ghost_credits_total_distributed || 0).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Distributed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Number(m.ghost_credits_total_used || 0).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {m.ghost_credits_conversion_rate
                  ? `${(Number(m.ghost_credits_conversion_rate) * 100).toFixed(1)}%`
                  : "—"}
              </div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
            </div>
          </CardContent>
        </Card>

        {/* DNA Lock — Constitutional Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              DNA Lock — Constitutional Economics
            </CardTitle>
            <CardDescription>
              These parameters are immutable. No vote, no board, no CEO can change them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {dnaLock?.map((param) => (
                <div key={param.parameter_key} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary">{param.parameter_key}</span>
                      <Badge variant="outline" className="text-xs">{param.parameter_value}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{param.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Industry Comparison */}
        {(m.etsy_avg_time_to_first_sale_days || m.kickstarter_avg_project_success_rate) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Industry Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Time to First Sale</div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-bold">Us: {m.our_time_to_first_transaction_days || "—"} days</div>
                  </div>
                  <div className="text-muted-foreground">vs</div>
                  <div>
                    <div className="font-bold">Etsy: {m.etsy_avg_time_to_first_sale_days || "—"} days</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Project Success Rate</div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-bold">
                      Us: {m.our_project_success_rate ? `${(Number(m.our_project_success_rate) * 100).toFixed(0)}%` : "—"}
                    </div>
                  </div>
                  <div className="text-muted-foreground">vs</div>
                  <div>
                    <div className="font-bold">
                      KS: {m.kickstarter_avg_project_success_rate ? `${(Number(m.kickstarter_avg_project_success_rate) * 100).toFixed(0)}%` : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>LIANA BANYAN CORPORATION</p>
          <p className="mt-1">"Help each other help ourselves."</p>
          <p className="mt-2 text-xs">
            Last updated: {m.period_end ? new Date(m.period_end).toLocaleDateString() : "Real-time"}
          </p>
        </div>
      </div>
    </div>
  );
}
