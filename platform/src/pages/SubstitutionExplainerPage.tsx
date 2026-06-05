/**
 * SubstitutionExplainerPage -- Wave 26 / STAGED ONLY
 * ====================================================
 * Explains how Credits / Marks / Joules substitute for each other
 * within the Cost+20% architecture.
 *
 * STATUS: [PAWN-GATED] -- specific substitution wording and rates require
 * Founder + Pawn ratification before publication.
 * This page is STAGED: all substitution-specific wording shows placeholder text.
 *
 * DO NOT publish specific substitution rates or wording without
 * Founder / Pawn ratification.
 *
 * BP072-W26 / PAWN_PROMPT_SUBSTITUTION_SECURITIES_REVIEW_BP072
 */

import { useTranslation } from "react-i18next";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePageSEO } from "@/hooks/usePageSEO";
import {
  Shield,
  Coins,
  Zap,
  ArrowRight,
  Lock,
  AlertCircle,
  Info,
} from "lucide-react";

// ─── Pawn-Gated placeholder component ────────────────────────────────────────

function PawnGatedBlock({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
      <Lock className="h-4 w-4 text-amber-500 shrink-0" />
      <span className="text-xs text-amber-700 dark:text-amber-400 font-mono italic">
        [PAWN-GATED: {label}]
      </span>
    </div>
  );
}

// ─── Currency Tile ────────────────────────────────────────────────────────────

interface CurrencyTileProps {
  icon: React.ReactNode;
  name: string;
  tagline: string;
  earnedBy: string;
  usedFor: string;
  substitutionNote: React.ReactNode;
  color: string;
}

function CurrencyTile({
  icon,
  name,
  tagline,
  earnedBy,
  usedFor,
  substitutionNote,
  color,
}: CurrencyTileProps) {
  return (
    <Card className={`border-${color}/20`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{tagline}</p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Earned by
          </p>
          <p>{earnedBy}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Used for
          </p>
          <p>{usedFor}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Substitution mechanic
          </p>
          {substitutionNote}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubstitutionExplainerPage() {
  usePageSEO({
    title: "Substitution Explainer | Liana Banyan",
    description: "How cooperative substitution works on Liana Banyan. Understand demand aggregation and substitution protecting member pricing.",
    canonical: "https://lianabanyan.com/substitution-explainer",
  });
  const { t } = useTranslation();
  return (
    <PortalPageLayout maxWidth="lg" xrayId="substitution-explainer">
      <GlobalBreadcrumbs />
      <div className="space-y-6">
        {/* Staged banner */}
        <div className="flex items-start gap-3 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-4">
          <Lock className="mt-0.5 h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
              STAGED PAGE -- Pawn-Gated Wording Pending Ratification
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
              Specific substitution wording, rates, and mechanics require Founder + Pawn
              securities review and 15-language ratification before this page is published.
              All substitution-specific content is shown as placeholder text below.
              Do not distribute this URL without Founder approval.
            </p>
          </div>
        </div>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">Currency Substitution</h1>
            <Badge variant="outline" className="text-xs">STAGED</Badge>
          </div>
          <p className="text-muted-foreground">
            How Credits, Marks, and Joules work together within the cooperative economy.
          </p>
        </div>

        {/* NOT A GUARANTEE */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/8 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">NOT A GUARANTEE.</span> All cooperative
            currencies (Marks, Credits, Joules) are internal platform participation units.
            They are not equity, shares, investment instruments, or guaranteed financial
            returns. Your results depend on your participation level.
            Membership: $5/year flat rate. No tiers.
          </p>
        </div>

        {/* Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4" />
              Overview: Three Currencies, One Economy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              The Liana Banyan cooperative uses three internal currency types.
              Each has a distinct source, purpose, and redemption path. They can substitute
              for each other in specific contexts governed by the Cost+20% architecture.
            </p>
            <p>
              Cost+20% means platform services are priced at actual cost plus 20% overhead.
              The 83.3% creator share flows directly to contributors. Internal currencies
              reduce the Cost+20% price you pay -- they are not cash equivalents.
            </p>
          </CardContent>
        </Card>

        {/* Three currency tiles */}
        <div className="grid gap-4 md:grid-cols-3">
          <CurrencyTile
            icon={<Shield className="h-5 w-5 text-amber-500" />}
            name="Marks"
            color="amber"
            tagline="Participation credits earned through cooperative contributions."
            earnedBy="Completing bounties, mesh participation, governance votes, referrals, content contributions."
            usedFor="Redeeming for Credits (Cost+20% discount). NOT for direct cash payout until gate opens."
            substitutionNote={
              <PawnGatedBlock label="Marks substitution rate and mechanic -- wording pending ratification" />
            }
          />
          <CurrencyTile
            icon={<Coins className="h-5 w-5 text-green-600" />}
            name="Credits"
            color="green"
            tagline="USD-equivalent service credits for Cost+20% purchases."
            earnedBy="Completing bounties (Credits class), redeeming Marks, platform reward events."
            usedFor="Reducing Cost+20% service purchases on the platform. Not transferable externally."
            substitutionNote={
              <PawnGatedBlock label="Credits substitution rate and Joule-conversion mechanic -- wording pending ratification" />
            }
          />
          <CurrencyTile
            icon={<Zap className="h-5 w-5 text-purple-600" />}
            name="Joules"
            color="purple"
            tagline="Energy units representing compute and throughput capacity."
            earnedBy="Platform contributions, mesh node operation, cooperative compute sharing."
            usedFor="Accessing compute-intensive platform features. Substitutes for Credits in some contexts."
            substitutionNote={
              <PawnGatedBlock label="Joules-to-Credits and Joules-to-Marks substitution mechanic -- wording pending ratification" />
            }
          />
        </div>

        {/* Substitution table -- PAWN-GATED */}
        <Card className="border-dashed border-amber-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Substitution Rate Table
              <Badge variant="outline" className="text-xs ml-auto">PAWN-GATED</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs">From</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs">To</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs">Rate</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {[
                    { from: "Marks", to: "Credits" },
                    { from: "Credits", to: "Joules" },
                    { from: "Joules", to: "Credits" },
                    { from: "Marks", to: "Joules" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-dashed">
                      <td className="py-2 pr-4 font-medium">{row.from}</td>
                      <td className="py-2 pr-4">{row.to}</td>
                      <td className="py-2">
                        <PawnGatedBlock label={`${row.from}-to-${row.to} rate pending`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground italic">
              All substitution rates are HELD FOR FOUNDER. They will be published after
              15-language ratification and Pawn securities review.
            </p>
          </CardContent>
        </Card>

        {/* What substitution IS and IS NOT */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700">Substitution IS</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>A way to reduce Cost+20% service prices using earned participation credits.</p>
              <p>An internal accounting mechanism within the cooperative platform.</p>
              <p>Governed by cooperative rules, not financial regulations.</p>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-700">Substitution IS NOT</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>A financial investment, equity instrument, or securities offering.</p>
              <p>A guaranteed return, payout promise, or financial commitment.</p>
              <p>Exchangeable for external currency without specific Founder-approved process.</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link to="/marks/redeem">
              <Shield className="mr-1.5 h-4 w-4" />
              Redeem Marks
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/bounties">
              <Zap className="mr-1.5 h-4 w-4" />
              Earn Marks (Bounties)
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/member">
              View Dashboard
            </Link>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground border-t pt-4">
          STAGED PAGE. Substitution wording: [PAWN-GATED pending ratification].
          Liana Banyan cooperative. Cost+20% architecture. $5/year membership. No tiers.
        </p>
      </div>
    </PortalPageLayout>
  );
}
