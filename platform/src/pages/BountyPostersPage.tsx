/**
 * BountyPostersPage — /bounty/
 * BP082 · Sonnet 4.6 · 2026-06-13
 *
 * "Want to be in charge? Apply here for rewards — really. Check it out." — Founder BP082
 *
 * Seed bounties:
 *   #1 City Steward (HexIsle Shadow World)
 *   #2 Guild Leader (Discord / Reddit Realm Coordinator)
 *   #3 Catacombs Curator (Substrate Contribution)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Trophy,
  MapPin,
  Users,
  Database,
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type TierClass = "founder-seeded" | "marks-ongoing" | "marks-per-action";

interface Bounty {
  id: string;
  icon: React.ReactNode;
  tier: TierClass;
  tierLabel: string;
  reward: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  eligibility: string;
  applyLabel: string;
  applyHref: string;
  footer?: string;
  slots?: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const BOUNTIES: Bounty[] = [
  {
    id: "city-steward",
    icon: <MapPin className="h-5 w-5" />,
    tier: "founder-seeded",
    tierLabel: "Founder-Seeded",
    reward: "500 Credits Bonus + ongoing Marks",
    title: "Become a City Steward in the 12 Cities Project",
    shortDesc:
      "Anchor a HexIsle City for your locale. Manage the local Discord + subreddit, recruit members, and earn Marks for ongoing Stewardship.",
    fullDesc:
      "Anchor a HexIsle City for your locale. You manage the local Discord + subreddit, recruit members, and earn Marks for ongoing Stewardship. First-come basis per locale. Founder seeds 500 Credits for the first 100 Stewards platform-wide. Mikey already claimed Slot #1 (UK). Founder's son holds Slot #2 (San Antonio). Slots #3–100 open.",
    eligibility:
      "Reside in or have strong ties to one of the 300 locales named in the NYT 5% pledge article.",
    applyLabel: "Apply for City Steward",
    applyHref: "/hexisle/recruit/",
    footer:
      "You can hand off the role anytime per voluntary-handoff canon. No pressure to stay forever.",
    slots: "Slots #3–100 open",
  },
  {
    id: "guild-leader",
    icon: <Users className="h-5 w-5" />,
    tier: "marks-ongoing",
    tierLabel: "Marks-Ongoing",
    reward: "Marks per active week",
    title: "Lead a Liana Banyan Plumbing & Mechanics Guild chapter",
    shortDesc:
      "Help members install, fork, or contribute. Moderate the Guild's Discord channel or subreddit. Marks accrue for each verified help interaction.",
    fullDesc:
      "Help members install, fork, or contribute. Moderate the Guild's Discord channel or subreddit. Marks accrue for each verified help interaction. Ousted only by vote — and only from the leadership role, never from the Guild itself. Your earned reputation stays yours.",
    eligibility:
      "Active Liana Banyan member with at least 100 Marks earned. Discord or Reddit connected via MnemosyneC Help Tab.",
    applyLabel: "Apply for Guild Leader",
    applyHref: "/bounty/guild-leader/apply/",
  },
  {
    id: "catacombs-curator",
    icon: <Database className="h-5 w-5" />,
    tier: "marks-per-action",
    tierLabel: "Marks-Per-Action",
    reward: "Marks per eblet (variable)",
    title: "Curate verified install reports and community threads into the Catacombs",
    shortDesc:
      "Use MnemosyneC Search to capture Discord/Reddit threads relevant to version stability + install confidence. Each verified eblet earns Marks.",
    fullDesc:
      "Use MnemosyneC Search to capture Discord/Reddit threads relevant to version stability and install confidence. Each verified eblet earns Marks. Cohen's-kappa-style 3-voter concordance gates write to substrate — only quality knowledge enters the Catacombs. Build the Catacombs underneath the Tower of Peace. The substrate gets cleaner over time, not noisier.",
    eligibility:
      "Active member with Discord OR Reddit connected via MnemosyneC Help Tab OAuth.",
    applyLabel: "Start Curating via Help Tab",
    applyHref: "#catacombs-auto-enroll",
    footer:
      "Automatic enrollment: connect Discord or Reddit in the MnemosyneC Help Tab, then click 📚 Save on any community message.",
  },
];

const TIER_STYLES: Record<TierClass, string> = {
  "founder-seeded":
    "bg-amber-500/10 text-amber-400 border-amber-500/30",
  "marks-ongoing":
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "marks-per-action":
    "bg-sky-500/10 text-sky-400 border-sky-500/30",
};

type FilterTier = "all" | TierClass;

// ─── BountyCard ───────────────────────────────────────────────────────────────

function BountyCard({ bounty }: { bounty: Bounty }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleApply = () => {
    if (bounty.applyHref.startsWith("/")) {
      navigate(bounty.applyHref);
    } else if (bounty.applyHref.startsWith("http")) {
      window.open(bounty.applyHref, "_blank", "noopener,noreferrer");
    } else if (bounty.applyHref === "#catacombs-auto-enroll") {
      // scroll to help section
      document.getElementById("catacombs-help")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Card className="bg-card border-border hover:border-muted-foreground/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="mt-0.5 text-muted-foreground flex-shrink-0">{bounty.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge
                variant="outline"
                className={`text-xs ${TIER_STYLES[bounty.tier]}`}
              >
                {bounty.tierLabel}
              </Badge>
              {bounty.slots && (
                <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                  {bounty.slots}
                </Badge>
              )}
            </div>
            <CardTitle className="text-base leading-snug">{bounty.title}</CardTitle>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span className="text-sm font-semibold">{bounty.reward}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {expanded ? bounty.fullDesc : bounty.shortDesc}
        </p>

        {bounty.fullDesc !== bounty.shortDesc && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
            ) : (
              <><ChevronDown className="h-3.5 w-3.5" /> Read more</>
            )}
          </button>
        )}

        <div className="bg-muted/30 rounded-md px-3 py-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/70">Eligibility: </span>
            {bounty.eligibility}
          </p>
        </div>

        {bounty.footer && (
          <p className="text-xs text-muted-foreground italic">{bounty.footer}</p>
        )}

        <Button
          onClick={handleApply}
          size="sm"
          className="w-full"
          variant={bounty.tier === "founder-seeded" ? "default" : "outline"}
        >
          {bounty.applyLabel}
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── BountyPostersPage ────────────────────────────────────────────────────────

export default function BountyPostersPage() {
  const [filterTier, setFilterTier] = useState<FilterTier>("all");

  const filtered = BOUNTIES.filter(
    (b) => filterTier === "all" || b.tier === filterTier
  );

  return (
    <PortalPageLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h1 className="text-3xl font-bold tracking-tight">Bounty Posters</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Want to be in charge? Apply here for rewards — really. Check it out.
          </p>
        </div>

        {/* ── Reputation-Counts Preamble (Guild Node canon Section F) ── */}
        <Card className="bg-card/60 border-amber-500/20">
          <CardContent className="pt-5 pb-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">Reputation counts.</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              It's not headcount — it's earned weight. Your vote is weighted by the Marks
              you've earned, the bounties you've completed, the answers you've championed,
              the tenure you've served.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Reputation cannot be bought. It can only be earned, gifted, or lost.
            </p>
            <p className="text-sm font-semibold text-foreground">
              Show up. Help out.{" "}
              <span className="text-amber-400">Help Each Other Help Ourselves.</span>
            </p>
          </CardContent>
        </Card>

        {/* ── Filter ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-1">Filter:</span>
          {(
            [
              { value: "all", label: "All Bounties" },
              { value: "founder-seeded", label: "Founder-Seeded" },
              { value: "marks-ongoing", label: "Marks-Ongoing" },
              { value: "marks-per-action", label: "Marks-Per-Action" },
            ] as { value: FilterTier; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilterTier(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterTier === opt.value
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ── Bounty Grid ── */}
        <div className="grid gap-4 sm:grid-cols-1">
          {filtered.length > 0 ? (
            filtered.map((b) => <BountyCard key={b.id} bounty={b} />)
          ) : (
            <p className="text-muted-foreground text-sm py-4">No bounties match this filter.</p>
          )}
        </div>

        <Separator />

        {/* ── Catacombs auto-enroll section ── */}
        <div id="catacombs-help" className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Database className="h-4 w-4 text-sky-400" />
            How to start the Catacombs Curator bounty
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Open <strong className="text-foreground">MnemosyneC</strong> and go to the <strong className="text-foreground">Help tab</strong>.</li>
            <li>Connect Discord or Reddit via the OAuth connect cards.</li>
            <li>Browse community threads. Click <strong className="text-foreground">📚 Save</strong> on any message worth keeping.</li>
            <li>Each verified eblet earns <strong className="text-foreground">+1 Mark</strong>. Three-voter concordance gates substrate entry — quality counts.</li>
          </ol>
          <p className="text-xs text-muted-foreground italic">
            No application form needed — your first 📚 Save click auto-enrolls you.
          </p>
        </div>

        <Separator />

        {/* ── Footer ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground pb-4">
          <p>
            Have an idea for a bounty?{" "}
            <span className="text-muted-foreground/60 italic">
              Bounty-submission form — coming v0.3.
            </span>
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="https://mnemosynec.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              MnemosyneC desktop
            </a>
            <a href="/help-each-other" className="hover:text-foreground transition-colors">
              Help Each Other →
            </a>
            <a href="/join" className="hover:text-foreground transition-colors">
              Join for $5/year →
            </a>
          </div>
        </div>

      </div>
    </PortalPageLayout>
  );
}
