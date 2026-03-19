/**
 * STEWARD COMMAND POST — Full dashboard for campaign management
 * Tier progression, Tri-Source Funding visuals, Pizza Oven batching,
 * Pledged Marks Ledger, and Deferred Compensation summary.
 *
 * Route: /steward (protected)
 * SEC: Deferred compensation for services rendered — not securities.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CurrencyAmount, CurrencyGlyph } from "@/components/CreditSymbol";
import {
  Shield,
  Flame,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Pizza,
  ChevronRight,
  Target,
  BarChart3,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import {
  type StewardTier,
  type Campaign,
  type CampaignStatus,
  type StewardProfile,
  type PledgedMarkEntry,
  type PizzaOvenGroup,
  type DeferredCompensationSummary,
  STEWARD_TIERS,
  SAMPLE_STEWARD_PROFILE,
  SAMPLE_CAMPAIGNS,
  SAMPLE_PLEDGED_MARKS,
  SAMPLE_PIZZA_OVEN_GROUPS,
  SAMPLE_DEFERRED_COMPENSATION,
  fetchStewardProfile,
  fetchStewardCampaigns,
  fetchPledgedMarks,
  fetchPizzaOvenGroups,
  fetchDeferredCompensation,
} from "@/lib/stewardService";

// ============================================================================
// TIER PROGRESSION BAR
// ============================================================================

function TierProgression({ currentTier }: { currentTier: StewardTier }) {
  const currentIndex = STEWARD_TIERS.findIndex(t => t.key === currentTier);

  return (
    <div className="flex items-center gap-1 w-full">
      {STEWARD_TIERS.map((tier, i) => {
        const isActive = i === currentIndex;
        const isPast = i < currentIndex;
        return (
          <div key={tier.key} className="flex items-center flex-1">
            <div
              className={`flex-1 rounded-md px-3 py-2 text-center text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : isPast
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tier.label}
            </div>
            {i < STEWARD_TIERS.length - 1 && (
              <ChevronRight className={`w-4 h-4 mx-0.5 flex-shrink-0 ${isPast ? "text-primary" : "text-muted-foreground/40"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// TRI-SOURCE FUNDING BAR
// ============================================================================

function TriSourceBar({ funding }: { funding: Campaign["funding"] }) {
  const total = funding.total || 1;
  const stewardPct = (funding.stewardPledged / total) * 100;
  const bandWagonPct = (funding.bandWagonBacked / total) * 100;
  const lbPct = (funding.lbAllocationPool / total) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
        <div
          className="bg-red-500 transition-all"
          style={{ width: `${stewardPct}%` }}
          title={`Steward Pledged: ${funding.stewardPledged} Marks`}
        />
        <div
          className="bg-amber-500 transition-all"
          style={{ width: `${bandWagonPct}%` }}
          title={`BandWagon Backed: ${funding.bandWagonBacked} Marks`}
        />
        <div
          className="bg-blue-500 transition-all"
          style={{ width: `${lbPct}%` }}
          title={`LB Allocation: ${funding.lbAllocationPool} Marks`}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Pledged {stewardPct.toFixed(0)}%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          BandWagon {bandWagonPct.toFixed(0)}%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          LB Pool {lbPct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// STATUS BADGE
// ============================================================================

function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/40">Active</Badge>;
    case "completed":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40">Completed</Badge>;
    case "failed":
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/40">Failed</Badge>;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StewardDashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<StewardProfile>(SAMPLE_STEWARD_PROFILE);
  const [campaigns, setCampaigns] = useState<Campaign[]>(SAMPLE_CAMPAIGNS);
  const [pledgedMarks, setPledgedMarks] = useState<PledgedMarkEntry[]>(SAMPLE_PLEDGED_MARKS);
  const [pizzaOvenGroups, setPizzaOvenGroups] = useState<PizzaOvenGroup[]>(SAMPLE_PIZZA_OVEN_GROUPS);
  const [compensation, setCompensation] = useState<DeferredCompensationSummary>(SAMPLE_DEFERRED_COMPENSATION);

  useEffect(() => {
    if (!user?.id) return;
    fetchStewardProfile(user.id).then((p) => { if (p) setProfile(p); });
    fetchStewardCampaigns(user.id).then(setCampaigns);
    fetchPledgedMarks(user.id).then(setPledgedMarks);
    fetchPizzaOvenGroups(user.id).then(setPizzaOvenGroups);
    fetchDeferredCompensation(user.id).then(setCompensation);
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <Card className="bg-slate-900/80 border-slate-800 max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-slate-400 mb-4">Sign in to access the Steward Command Post.</p>
            <Button asChild><Link to="/auth">Sign in</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeCampaigns = campaigns.filter(c => c.status === "active");
  const completedCampaigns = campaigns.filter(c => c.status === "completed");
  const failedCampaigns = campaigns.filter(c => c.status === "failed");

  const escrowedTotal = pledgedMarks
    .filter(p => p.status === "escrowed")
    .reduce((sum, p) => sum + p.amountPledged, 0);
  const availableMarks = profile.maxPledgePerProject * profile.concurrentLimit - escrowedTotal;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" data-xray-id="steward-dashboard">
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                Steward Command Post
              </h1>
              <p className="text-slate-400 mt-1">
                Manage campaigns. Pledge Marks. Earn proportional compensation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-base border-primary text-primary px-3 py-1">
                {STEWARD_TIERS.find(t => t.key === profile.tier)?.label ?? profile.tier}
              </Badge>
              {activeCampaigns.length >= 2 && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 gap-1">
                  <Pizza className="w-3 h-3" />
                  Pizza Oven Hot
                </Badge>
              )}
            </div>
          </div>

          {/* Tier Progression */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-4 pb-4">
              <TierProgression currentTier={profile.tier} />
            </CardContent>
          </Card>
        </header>

        {/* ================================================================ */}
        {/* STATS ROW */}
        {/* ================================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Active Campaigns", value: activeCampaigns.length, icon: Target },
            { label: "Marks Pledged", value: profile.totalMarksPledged, icon: () => <CurrencyGlyph currency="mark" size={20} /> },
            { label: "Marks Released", value: profile.totalMarksReleased, icon: CheckCircle },
            { label: "Success Rate", value: `${(profile.successRate * 100).toFixed(0)}%`, icon: BarChart3 },
            { label: "Compensation Earned", value: profile.totalDeferredCompensation, icon: TrendingUp },
          ].map((stat) => (
            <Card key={stat.label} className="bg-slate-900/60 border-slate-800">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  {typeof stat.icon === "function" ? stat.icon({}) : <stat.icon className="w-4 h-4 text-slate-400" />}
                  <span className="text-xs text-slate-400">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ================================================================ */}
        {/* ACTIVE CAMPAIGNS */}
        {/* ================================================================ */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Active Campaigns
          </h2>
          {activeCampaigns.length === 0 ? (
            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="py-8 text-center text-slate-400">
                No active campaigns. Start managing a project to begin.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeCampaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-slate-900/60 border-slate-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">
                          <Link to={campaign.projectLink} className="hover:text-primary transition-colors">
                            {campaign.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1">
                          Started {new Date(campaign.startedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <CampaignStatusBadge status={campaign.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TriSourceBar funding={campaign.funding} />

                    {/* Deferred Compensation Calculator */}
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-1">
                      <p className="text-xs text-slate-400 font-medium">Deferred Compensation</p>
                      <p className="text-sm">
                        You pledged <span className="text-red-400 font-semibold">{(campaign.pledgeRatio * 100).toFixed(0)}%</span>
                        {" "}of total funding.
                        {campaign.pledgeRatio >= 0.5 ? " You earn a proportional premium." : " LB covers the majority."}
                      </p>
                      <p className="text-xs text-slate-500">
                        LB covers {((1 - campaign.pledgeRatio) * 100).toFixed(0)}% — your compensation scales with commitment.
                      </p>
                    </div>

                    {campaign.pizzaOvenGroup && (
                      <div className="flex items-center gap-2 text-xs text-amber-400">
                        <Pizza className="w-3 h-3" />
                        Batched in: {campaign.pizzaOvenGroup}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Completed / Failed summary */}
          {(completedCampaigns.length > 0 || failedCampaigns.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {completedCampaigns.map(c => (
                <Card key={c.id} className="bg-slate-900/60 border-slate-800">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Completed {c.completedAt ? new Date(c.completedAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </div>
                    <TriSourceBar funding={c.funding} />
                    <p className="text-xs text-green-400 mt-2">
                      Earned <CurrencyAmount amount={c.deferredCompensation} currency="mark" size={12} className="text-green-400" /> deferred compensation
                    </p>
                  </CardContent>
                </Card>
              ))}
              {failedCampaigns.map(c => (
                <Card key={c.id} className="bg-slate-900/60 border-slate-800">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Failed {c.completedAt ? new Date(c.completedAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    </div>
                    <TriSourceBar funding={c.funding} />
                    <p className="text-xs text-red-400 mt-2">Pledged Marks absorbed. Compensation forfeited.</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ================================================================ */}
        {/* THE PIZZA OVEN */}
        {/* ================================================================ */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Pizza className="w-5 h-5 text-amber-500" />
            The Pizza Oven
          </h2>
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 italic">
                &ldquo;If you heated the oven for one pizza, cook more while it&rsquo;s hot.&rdquo;
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pizzaOvenGroups.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No batched campaigns yet. When you manage 2+ campaigns that share infrastructure,
                  they group automatically for marginal cost savings.
                </p>
              ) : (
                pizzaOvenGroups.map(group => {
                  const groupCampaigns = campaigns.filter(c => c.pizzaOvenGroup === group.groupName);
                  return (
                    <div key={group.groupName} className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{group.sharedInfrastructure}</p>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
                          {group.marginalCostSavings}% savings
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {groupCampaigns.map(c => (
                          <div key={c.id} className="flex items-center gap-2 text-sm text-slate-300">
                            <Pizza className="w-3 h-3 text-amber-500" />
                            {c.name}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        Batching these campaigns saves ~{group.marginalCostSavings}% on shared logistics and infrastructure.
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </section>

        {/* ================================================================ */}
        {/* PLEDGED MARKS LEDGER */}
        {/* ================================================================ */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-400" />
            Pledged Marks Ledger
          </h2>
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="text-left py-2 pr-4 font-medium">Campaign</th>
                      <th className="text-right py-2 px-4 font-medium">Pledged</th>
                      <th className="text-center py-2 px-4 font-medium">Status</th>
                      <th className="text-right py-2 px-4 font-medium">Released</th>
                      <th className="text-right py-2 pl-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pledgedMarks.map(entry => (
                      <tr key={entry.id} className="border-b border-slate-800/50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium">{entry.campaignName}</td>
                        <td className="py-2.5 px-4 text-right">
                          <CurrencyAmount amount={entry.amountPledged} currency="mark" size={12} />
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {entry.status === "escrowed" && (
                            <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-xs">
                              <Clock className="w-3 h-3 mr-1" />Escrowed
                            </Badge>
                          )}
                          {entry.status === "released" && (
                            <Badge variant="outline" className="border-green-500/40 text-green-400 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />Released
                            </Badge>
                          )}
                          {entry.status === "absorbed" && (
                            <Badge variant="outline" className="border-red-500/40 text-red-400 text-xs">
                              <XCircle className="w-3 h-3 mr-1" />Absorbed
                            </Badge>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {entry.releasedAmount > 0 ? (
                            <CurrencyAmount amount={entry.releasedAmount} currency="mark" size={12} className="text-green-400" />
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pl-4 text-right text-slate-400">{entry.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Separator className="bg-slate-800 my-3" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Escrowed total</span>
                <CurrencyAmount amount={escrowedTotal} currency="mark" size={14} className="text-amber-400 font-semibold" />
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-400">Available capacity</span>
                <CurrencyAmount amount={Math.max(0, availableMarks)} currency="mark" size={14} className="font-semibold" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ================================================================ */}
        {/* DEFERRED COMPENSATION SUMMARY */}
        {/* ================================================================ */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Deferred Compensation Summary
          </h2>
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-4 space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">Total Earned</p>
                  <p className="text-2xl font-bold text-green-400">
                    <CurrencyAmount amount={compensation.totalEarned} currency="mark" size={18} className="text-green-400" />
                  </p>
                  <p className="text-xs text-slate-500 mt-1">from completed campaigns</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">Total Pending</p>
                  <p className="text-2xl font-bold text-amber-400">
                    <CurrencyAmount amount={compensation.totalPending} currency="mark" size={18} className="text-amber-400" />
                  </p>
                  <p className="text-xs text-slate-500 mt-1">from active campaigns</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">Completed Campaigns</p>
                  <p className="text-2xl font-bold">
                    <CurrencyAmount amount={compensation.fromCompletedCampaigns} currency="mark" size={18} />
                  </p>
                  <p className="text-xs text-slate-500 mt-1">paid out</p>
                </div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-500">
                  This is not salary. This is proportional compensation for services rendered.
                  Compensation scales with your pledge ratio and campaign outcome.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}
