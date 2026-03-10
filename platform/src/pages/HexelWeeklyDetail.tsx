/**
 * HEXEL WEEKLY DETAIL — Generic Detail Page
 * ==========================================
 * Data-driven detail page for ALL Hexel weekly releases.
 * Reads the :slug URL param and renders engineering teaser content
 * from WEEKLY_RELEASES + PIECE_TEASERS data.
 *
 * For released weeks with custom pages (SlottedTop, SawtoothCoral),
 * specific routes take precedence over this generic catch-all.
 *
 * Route: /hexisle/hexels/:slug
 * Data: src/lib/hexSlottedTopShowcase.ts
 */

import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Cog,
  Hexagon,
  ChevronRight,
  Zap,
  Wrench,
  Box,
  ArrowUpDown,
  Lightbulb,
} from "lucide-react";
import {
  WEEKLY_RELEASES,
  HEXEL_STACK,
  getPieceTeaserBySlug,
  getAdjacentReleases,
} from "@/lib/hexSlottedTopShowcase";

// ─── Status Badge Colors ─────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  released: { bg: "bg-green-500/20", text: "text-green-400", label: "Released" },
  upcoming: { bg: "bg-amber-500/15", text: "text-amber-300", label: "Coming Soon" },
  planned: { bg: "bg-white/10", text: "text-white/60", label: "Planned" },
};

// ─── Component ────────────────────────────────────────────────────────────

export default function HexelWeeklyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  if (!slug) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-muted-foreground">No piece specified.</p>
        <Button variant="outline" onClick={() => navigate("/hexisle")} className="mt-4">
          Back to HexIsle
        </Button>
      </div>
    );
  }

  // Look up release + teaser data
  const { prev, current, next } = getAdjacentReleases(slug);
  const teaser = getPieceTeaserBySlug(slug);

  // If we can't find this piece, show not-found
  if (!current) {
    return (
      <div className="container mx-auto p-6 text-center space-y-4">
        <Cog className="w-16 h-16 mx-auto text-muted-foreground/30" />
        <h1 className="text-2xl font-bold">Piece Not Found</h1>
        <p className="text-muted-foreground">
          No Hexel component matches &ldquo;{slug}&rdquo;.
        </p>
        <Button variant="outline" onClick={() => navigate("/hexisle")}>
          Back to HexIsle
        </Button>
      </div>
    );
  }

  // Stack piece data from HEXEL_STACK
  const stackPiece = HEXEL_STACK.find(
    p => p.position === current.stackPosition,
  );

  const status = STATUS_STYLES[current.status] ?? STATUS_STYLES.planned;

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/hexisle")}
          className="hover:text-foreground transition-colors"
        >
          HexIsle
        </button>
        <ChevronRight className="w-3 h-3" />
        <button
          onClick={() => navigate("/hexisle")}
          className="hover:text-foreground transition-colors"
        >
          Hexels
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{current.partName}</span>
      </div>

      {/* Hero */}
      <div
        className={`relative overflow-hidden rounded-xl border-2 border-${teaser?.accentColor ?? "slate"}-500/20 bg-gradient-to-br ${teaser?.gradientFrom ?? "from-slate-900"} ${teaser?.gradientVia ?? "via-slate-700/20"} to-slate-800 text-white p-8 md:p-12`}
      >
        <div className="relative">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge className={`${status.bg} ${status.text} border-${teaser?.accentColor ?? "slate"}-500/40`}>
              <Calendar className="w-3 h-3 mr-1" /> Week {current.week}
            </Badge>
            <Badge className={`${status.bg} ${status.text} border-${teaser?.accentColor ?? "slate"}-500/30`}>
              <Clock className="w-3 h-3 mr-1" /> {status.label}
            </Badge>
            <Badge className="bg-white/10 text-white/70 border-white/20">
              Stack #{current.stackPosition}
            </Badge>
          </div>

          <div className="flex items-center gap-4 mb-3">
            {teaser?.heroIcon && (
              <span className="text-4xl md:text-5xl">{teaser.heroIcon}</span>
            )}
            <div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white/90 via-white to-white/70 bg-clip-text text-transparent">
                {current.partName}
              </h1>
              {teaser && (
                <p className="text-xl text-white/80 mt-1">{teaser.tagline}</p>
              )}
            </div>
          </div>

          <p className="text-base text-white/60 max-w-3xl">
            {teaser?.longDescription ?? current.description}
          </p>
        </div>
      </div>

      {/* Engineering Overview Cards */}
      {teaser && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`border-${teaser.accentColor}-500/20`}>
            <CardContent className="py-6 text-center">
              <Cog className={`w-8 h-8 mx-auto text-${teaser.accentColor}-500/50 mb-2`} />
              <p className="text-xs text-muted-foreground">What It Does</p>
              <p className="font-bold mt-1">{teaser.whatItDoes}</p>
            </CardContent>
          </Card>

          <Card className={`border-${teaser.accentColor}-500/20`}>
            <CardContent className="py-6 text-center">
              <Box className={`w-8 h-8 mx-auto text-${teaser.accentColor}-500/50 mb-2`} />
              <p className="text-xs text-muted-foreground">Part Count</p>
              <p className="font-bold mt-1">{teaser.partCount}</p>
            </CardContent>
          </Card>

          <Card className={`border-${teaser.accentColor}-500/20`}>
            <CardContent className="py-6 text-center">
              <ArrowUpDown className={`w-8 h-8 mx-auto text-${teaser.accentColor}-500/50 mb-2`} />
              <p className="text-xs text-muted-foreground">Connects To</p>
              <p className="font-bold mt-1 text-sm">
                {teaser.connectsAbove} above
              </p>
              <p className="font-bold text-sm text-muted-foreground">
                {teaser.connectsBelow} below
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Key Engineering Highlights */}
      {teaser && teaser.keyEngineering.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Engineering Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {teaser.keyEngineering.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
            {teaser.manufacturingHint && (
              <div className="mt-4 pt-4 border-t flex items-start gap-2">
                <Wrench className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground italic">
                  {teaser.manufacturingHint}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Coming Soon / Full Details Card */}
      {current.status !== "released" && (
        <Card className={`border-${teaser?.accentColor ?? "slate"}-500/20`}>
          <CardContent className="py-12 text-center">
            <Cog className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              Full Details Dropping Week {current.week}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Complete engineering breakdown, dimensional specs, manufacturing path, and
              bounty programs for the {current.partName}. Each weekly release adds another
              layer of functionality to the Hexel stack.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stack Position Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Hexagon className="w-5 h-5 text-purple-500" />
            Position in the 14-Piece Hexel Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {[...HEXEL_STACK].reverse().map((piece) => {
              const isCurrent = piece.position === current.stackPosition;
              const release = WEEKLY_RELEASES.find(
                r => r.stackPosition === piece.position,
              );
              return (
                <div
                  key={piece.position}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isCurrent
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <span
                    className={`w-6 text-center text-xs font-mono ${
                      isCurrent ? "font-bold text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {piece.position}
                  </span>
                  <span
                    className={`flex-1 text-sm ${
                      isCurrent ? "font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {piece.name}
                    {isCurrent && " ← YOU ARE HERE"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {piece.role.length > 40
                      ? piece.role.substring(0, 40) + "..."
                      : piece.role}
                  </span>
                  {release && (
                    <Badge
                      variant="outline"
                      className="text-[9px] py-0"
                    >
                      Wk {release.week}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Get Started Now */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-500" />
            While You Wait: Get Started with SlottedTop
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            The SlottedTop is live now. Download the STL, print it, and snap on your existing
            hex terrain tiles. BattleTech, WarHex, Green Stuff World &mdash; they all fit.
          </p>
          <p>
            Earn <strong>Credits</strong> by printing and testing. Submit fit reports.
            Photograph your terrain tiles on the SlottedTop. The best testers get
            early access to each weekly release.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/hexisle/hexels/slotted-top")}
            className="mt-2"
          >
            <Hexagon className="w-4 h-4 mr-2" /> Go to SlottedTop Detail Page
          </Button>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        {prev ? (
          <Button
            variant="outline"
            onClick={() => navigate(prev.detailPageRoute)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Prev: {prev.partName} (Week {prev.week})
          </Button>
        ) : (
          <div />
        )}

        {next ? (
          <Button
            variant="outline"
            onClick={() => navigate(next.detailPageRoute)}
          >
            Next: {next.partName} (Week {next.week})
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Final Piece <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
