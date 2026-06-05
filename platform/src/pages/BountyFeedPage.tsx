/**
 * BountyFeedPage -- Wave 26 / Bounty Discovery Feed
 * ===================================================
 * Open bounties across all initiatives.
 * Each bounty: class badge, Marks/Credits reward, claim button.
 * Claim flow: claim -> work -> submit -> verified -> Marks awarded.
 * Securities-clean: Marks = participation, NOT financial return.
 *
 * BP072-W26
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Paintbrush,
  Code,
  FileText,
  BarChart,
  Coins,
  Shield,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePageSEO } from "@/hooks/usePageSEO";
import {
  getOpenBounties,
  getMemberBountyClaims,
  claimBounty,
  type OpenBounty,
  type BountyClaim,
} from "@/lib/marks/economyService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CLASS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  translation: Globe,
  design: Paintbrush,
  development: Code,
  content: FileText,
  research: BarChart,
};

const CLASS_COLOR: Record<string, string> = {
  translation: "text-blue-600",
  design: "text-purple-600",
  development: "text-green-600",
  content: "text-amber-600",
  research: "text-red-600",
};

const CLASS_LABELS: Record<string, string> = {
  translation: "Translation",
  design: "Design",
  development: "Development",
  content: "Content",
  research: "Research",
};

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Open", variant: "default" },
  claimed: { label: "Claimed", variant: "secondary" },
  submitted: { label: "Under Review", variant: "secondary" },
  verified: { label: "Completed", variant: "outline" },
  rejected: { label: "Rejected", variant: "destructive" },
  expired: { label: "Expired", variant: "destructive" },
};

/** Mock open bounties for display when DB table not yet populated. */
const MOCK_BOUNTIES: OpenBounty[] = [
  {
    id: "b-mock-1",
    title: "Translate Membership Agreement to Spanish",
    description:
      "Localize the $5/year membership agreement and key onboarding strings into Spanish. ~800 words. Platform tone: cooperative, direct, no em-dashes.",
    bounty_class: "translation",
    marks_reward: 500,
    credits_reward: 0,
    compensation_unit: "Marks",
    posted_by: "staff",
    posted_by_handle: "platform-staff",
    initiative_ref: "membership",
    status: "open",
    expires_at: "2026-07-01T00:00:00Z",
    created_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "b-mock-2",
    title: "Design Bounty Poster Template (dark mode variant)",
    description:
      "Create a dark-mode SVG variant of the Bounty Poster template. Must pass WCAG AA contrast. Deliver as SVG + PNG at 2x.",
    bounty_class: "design",
    marks_reward: 0,
    credits_reward: 200,
    compensation_unit: "Credits",
    posted_by: "staff",
    posted_by_handle: "platform-staff",
    status: "open",
    created_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "b-mock-3",
    title: "Build Bounty Claim Status API endpoint",
    description:
      "Implement a Supabase RPC function `get_member_bounty_status(p_member_id)` returning claim counts by status.",
    bounty_class: "development",
    marks_reward: 0,
    credits_reward: 400,
    compensation_unit: "Credits",
    posted_by: "staff",
    posted_by_handle: "platform-staff",
    status: "open",
    created_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "b-mock-4",
    title: "Write Cooperative Economics Explainer (1000 words)",
    description:
      "An accessible 1000-word explainer on how Cost+20% architecture benefits members. Platform tone. No jargon. Suitable for new member onboarding.",
    bounty_class: "content",
    marks_reward: 0,
    credits_reward: 150,
    compensation_unit: "Credits",
    posted_by: "staff",
    posted_by_handle: "platform-staff",
    status: "open",
    created_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "b-mock-5",
    title: "Research: Platform Comparable Cooperative Membership Models",
    description:
      "Identify 10 comparable cooperative platforms with membership pricing. Deliver as structured CSV + 500-word memo summarizing insights.",
    bounty_class: "research",
    marks_reward: 0,
    credits_reward: 300,
    compensation_unit: "Credits",
    posted_by: "staff",
    posted_by_handle: "platform-staff",
    status: "open",
    expires_at: "2026-06-30T00:00:00Z",
    created_at: "2026-06-01T00:00:00Z",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SecuritiesDisclaimerBanner() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/8 px-4 py-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p className="text-xs text-amber-700 dark:text-amber-400">
        <span className="font-semibold">NOT A GUARANTEE.</span> Marks are cooperative
        participation credits -- not equity, shares, or guaranteed financial return. Credits
        are internal platform units. Cost+20% architecture; 83.3% of revenue flows to creators.
        Membership: $5/year flat rate.
      </p>
    </div>
  );
}

function BountyCard({
  bounty,
  existingClaim,
  onClaim,
  claiming,
  userId,
}: {
  bounty: OpenBounty;
  existingClaim?: BountyClaim;
  onClaim: (bountyId: string) => void;
  claiming: boolean;
  userId?: string;
}) {
  const Icon = CLASS_ICON[bounty.bounty_class] ?? FileText;
  const colorClass = CLASS_COLOR[bounty.bounty_class] ?? "text-muted-foreground";
  const statusInfo = STATUS_BADGE[bounty.status] ?? STATUS_BADGE.open;
  const claimStatus = existingClaim ? STATUS_BADGE[existingClaim.status] : null;

  return (
    <Card
      className="flex flex-col hover:border-primary/30 transition-colors"
      data-xray-id={`bounty-card-${bounty.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${colorClass}`} />
            <Badge variant="outline" className="text-xs">
              {CLASS_LABELS[bounty.bounty_class] ?? bounty.bounty_class}
            </Badge>
          </div>
          <Badge variant={statusInfo.variant} className="text-xs shrink-0">
            {statusInfo.label}
          </Badge>
        </div>
        <CardTitle className="text-sm mt-2 leading-snug">{bounty.title}</CardTitle>
        {bounty.posted_by_handle && (
          <CardDescription className="text-xs">
            Posted by @{bounty.posted_by_handle}
            {bounty.initiative_ref && ` · ${bounty.initiative_ref}`}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">{bounty.description}</p>

        {/* Reward */}
        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
          <div className="flex items-center gap-1.5">
            {bounty.compensation_unit === "Marks" ? (
              <Shield className="h-4 w-4 text-amber-500" />
            ) : (
              <Coins className="h-4 w-4 text-green-600" />
            )}
            <span className="text-sm font-semibold">
              {bounty.compensation_unit === "Marks"
                ? bounty.marks_reward
                : bounty.credits_reward}{" "}
              {bounty.compensation_unit}
            </span>
          </div>
          {bounty.expires_at && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Expires{" "}
              {new Date(bounty.expires_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          )}
        </div>

        {/* IP note */}
        <p className="text-xs text-muted-foreground italic">
          Contributor retains attribution. Platform receives non-exclusive license.
          Provenance, not legal patent grant.
        </p>

        {/* CTA */}
        <div className="mt-auto">
          {claimStatus ? (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={claimStatus.variant}>{claimStatus.label}</Badge>
              {existingClaim?.status === "claimed" && (
                <Button size="sm" variant="outline" asChild className="ml-auto gap-1">
                  <Link to={`/bounties/submit/${existingClaim.id}`}>
                    Submit Work
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
              {existingClaim?.status === "verified" && (
                <span className="ml-auto flex items-center gap-1 text-green-600 text-xs font-medium">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {existingClaim.marks_awarded} Marks awarded
                </span>
              )}
            </div>
          ) : bounty.status === "open" && userId ? (
            <Button
              size="sm"
              className="w-full gap-1.5"
              onClick={() => onClaim(bounty.id)}
              disabled={claiming}
            >
              <Zap className="h-3.5 w-3.5" />
              {claiming ? "Claiming..." : "Claim Bounty"}
            </Button>
          ) : !userId ? (
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link to="/login">Sign in to claim</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BountyFeedPage() {
  usePageSEO({
    title: "Bounty Feed | Liana Banyan",
    description: "Live feed of community bounties and cooperative tasks. Earn Marks by completing bounties for your community.",
    canonical: "https://lianabanyan.com/bounty-feed",
  });
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [activeClass, setActiveClass] = useState<string>("all");

  const { data: dbBounties = [], isLoading } = useQuery({
    queryKey: ["open-bounties"],
    queryFn: () => getOpenBounties({ limit: 50 }),
  });

  const { data: myClaims = [] } = useQuery({
    queryKey: ["my-bounty-claims", user?.id],
    queryFn: () => getMemberBountyClaims(user!.id),
    enabled: !!user,
  });

  const claimMutation = useMutation({
    mutationFn: (bountyId: string) =>
      claimBounty({ bountyId, claimantId: user!.id }),
    onSuccess: (result, bountyId) => {
      if (result.ok) {
        toast({ title: "Bounty claimed!", description: "Head to your dashboard to submit your work." });
        qc.invalidateQueries({ queryKey: ["open-bounties"] });
        qc.invalidateQueries({ queryKey: ["my-bounty-claims"] });
      } else {
        toast({ title: "Claim failed", description: result.error, variant: "destructive" });
      }
      setClaimingId(null);
    },
    onError: () => {
      toast({ title: "Claim failed", variant: "destructive" });
      setClaimingId(null);
    },
  });

  const handleClaim = (bountyId: string) => {
    if (!user) return;
    setClaimingId(bountyId);
    claimMutation.mutate(bountyId);
  };

  // Use mock data when DB returns empty (pre-population)
  const bounties: OpenBounty[] = dbBounties.length > 0 ? dbBounties : MOCK_BOUNTIES;

  const claimsMap = new Map(myClaims.map((c) => [c.bounty_id, c]));

  const filtered = bounties.filter((b) => {
    const matchClass = activeClass === "all" || b.bounty_class === activeClass;
    const matchSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSearch;
  });

  const classes = ["all", "translation", "design", "development", "content", "research"];

  return (
    <PortalPageLayout maxWidth="xl" xrayId="bounty-feed">
      <GlobalBreadcrumbs />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="h-7 w-7 text-amber-500" />
              Bounty Feed
            </h1>
            <p className="mt-1 text-muted-foreground">
              Open bounties across all cooperative initiatives. Claim, work, submit, earn.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/bounty-poster-generator">
              Create Bounty Poster
            </Link>
          </Button>
        </div>

        <SecuritiesDisclaimerBanner />

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search bounties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeClass} onValueChange={setActiveClass}>
          <TabsList className="flex-wrap h-auto gap-1">
            {classes.map((cls) => (
              <TabsTrigger key={cls} value={cls} className="capitalize text-xs">
                {cls === "all" ? "All Classes" : CLASS_LABELS[cls] ?? cls}
              </TabsTrigger>
            ))}
          </TabsList>

          {classes.map((cls) => (
            <TabsContent key={cls} value={cls}>
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64 rounded-lg" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Zap className="mx-auto mb-3 h-10 w-10 opacity-25" />
                    <p className="text-sm">No bounties found.</p>
                    <p className="text-xs mt-1">
                      {search ? "Try a different search term." : "Check back soon for new bounties."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((b) => (
                    <BountyCard
                      key={b.id}
                      bounty={b}
                      existingClaim={claimsMap.get(b.id)}
                      onClaim={handleClaim}
                      claiming={claimingId === b.id}
                      userId={user?.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* My active claims */}
        {myClaims.filter((c) => c.status === "claimed" || c.status === "submitted").length > 0 && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                My Active Claims
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myClaims
                .filter((c) => c.status === "claimed" || c.status === "submitted")
                .map((claim) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_BADGE[claim.status].variant} className="text-xs">
                        {STATUS_BADGE[claim.status].label}
                      </Badge>
                      <span className="text-muted-foreground font-mono text-xs">
                        {claim.bounty_id.slice(0, 12)}...
                      </span>
                    </div>
                    {claim.status === "claimed" && (
                      <Button size="sm" variant="outline" asChild className="gap-1">
                        <Link to={`/bounties/submit/${claim.id}`}>
                          Submit Work
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground border-t pt-4">
          Marks = cooperative participation credits. NOT equity, shares, or guaranteed financial return.
          Cost+20% architecture. Membership $5/year flat rate.
        </p>
      </div>
    </PortalPageLayout>
  );
}
