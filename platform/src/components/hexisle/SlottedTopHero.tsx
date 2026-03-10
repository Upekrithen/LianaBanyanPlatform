/**
 * SLOTTED TOP HERO — Innovation #1552 Flagship Feature
 * =====================================================
 * The headline component for HexIsle. Showcases the Universal Hex Terrain
 * Retention system as THE defining feature of the Hexel piece grammar.
 *
 * "Your hex terrain. Our active mechanics. One snap."
 *
 * Displays: compatibility matrix, dimensional analysis, Gorgon mechanism,
 * trap modes, and the Hexel stack position (#14 of 14 — the crown piece).
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Hexagon, Cog, Shield, Wrench, Award, Crown,
  ChevronDown, ChevronUp, Layers, ArrowRight,
  CheckCircle2, Circle, AlertCircle, Zap,
} from "lucide-react";
import {
  COMPATIBLE_SYSTEMS,
  SLOTTED_TOP_HIGHLIGHTS,
  INNOVATION_1552,
  HEXEL_STACK,
  TRAP_MODES,
  GORGON_MECHANISM,
  ECOSYSTEM_NARRATIVE,
  type HexTerrainSystem,
  type CompatibilityRating,
} from "@/lib/hexSlottedTopShowcase";

// ─── Icon Mapping ──────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Hexagon,
  Cog,
  Shield,
  Wrench,
  Award,
  Crown,
};

// ─── Rating Display ────────────────────────────────────────────────────────

const RATING_CONFIG: Record<CompatibilityRating, { color: string; icon: React.ElementType; label: string }> = {
  perfect: { color: "text-green-500 bg-green-500/10 border-green-500/20", icon: CheckCircle2, label: "Perfect Fit" },
  excellent: { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2, label: "Excellent" },
  good: { color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: Circle, label: "Good" },
  near: { color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: AlertCircle, label: "Near" },
  incompatible: { color: "text-red-500 bg-red-500/10 border-red-500/20", icon: AlertCircle, label: "Incompatible" },
};

// ─── Compatibility Row ─────────────────────────────────────────────────────

function CompatibilityRow({ system }: { system: HexTerrainSystem }) {
  const config = RATING_CONFIG[system.rating];
  const RatingIcon = config.icon;

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <div className={`flex items-center gap-1.5 w-24 shrink-0`}>
        <RatingIcon className={`w-3.5 h-3.5 ${config.color.split(" ")[0]}`} />
        <Badge variant="outline" className={`text-xs ${config.color}`}>
          {config.label}
        </Badge>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{system.name}</p>
        <p className="text-xs text-muted-foreground">{system.company}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono text-sm font-bold">{system.hexSizeMm}mm</p>
        <p className="text-xs text-muted-foreground">
          {system.clearancePerSideMm.toFixed(1)}mm clearance
        </p>
      </div>
    </div>
  );
}

// ─── Hexel Stack Visualization ─────────────────────────────────────────────

function HexelStackMini() {
  return (
    <div className="flex flex-col-reverse gap-0.5">
      {HEXEL_STACK.map((piece) => {
        const isSlottedTop = piece.position === 14;
        return (
          <div
            key={piece.position}
            className={`flex items-center gap-2 px-2 py-0.5 rounded text-xs transition-all ${
              isSlottedTop
                ? "bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-amber-500/30 font-bold text-foreground"
                : "bg-muted/30 text-muted-foreground"
            }`}
          >
            <span className="font-mono w-4 text-right opacity-60">{piece.position}</span>
            <span className={isSlottedTop ? "text-amber-400" : ""}>{piece.name}</span>
            {isSlottedTop && (
              <Badge className="ml-auto bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px] py-0 h-4">
                CROWN
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function SlottedTopHero() {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [showStack, setShowStack] = useState(false);

  return (
    <div className="space-y-4">
      {/* ── HERO BANNER ── */}
      <Card className="overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900/30 text-white">
        <CardContent className="p-0">
          <div className="relative">
            {/* Background hex pattern (CSS) */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            <div className="relative p-6 md:p-8">
              {/* Innovation Badge */}
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40">
                  <Zap className="w-3 h-3 mr-1" />
                  Innovation #1552
                </Badge>
                <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                  Patent Protected
                </Badge>
                <Badge className="bg-white/10 text-white/70 border-white/20">
                  Hexel #14 of 14
                </Badge>
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-amber-300 via-white to-cyan-300 bg-clip-text text-transparent">
                {ECOSYSTEM_NARRATIVE.tagline}
              </h2>
              <p className="text-lg text-white/80 mb-1">
                {ECOSYSTEM_NARRATIVE.subtitle}
              </p>
              <p className="text-sm text-white/60 max-w-3xl mb-6">
                {ECOSYSTEM_NARRATIVE.thesis}
              </p>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {SLOTTED_TOP_HIGHLIGHTS.map((highlight) => {
                  const Icon = ICON_MAP[highlight.icon] || Hexagon;
                  return (
                    <div
                      key={highlight.title}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm hover:bg-white/10 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-amber-400 mb-1" />
                      <div className="font-mono text-lg font-bold text-white">{highlight.stat}</div>
                      <div className="text-xs font-medium text-white/90">{highlight.title}</div>
                      <div className="text-[10px] text-white/50 mt-1 line-clamp-2">{highlight.description}</div>
                    </div>
                  );
                })}
              </div>

              {/* Expand Details */}
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                  {showDetails ? "Hide" : "Show"} Compatibility Matrix
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                  onClick={() => setShowStack(!showStack)}
                >
                  <Layers className="w-4 h-4 mr-1" />
                  {showStack ? "Hide" : "Show"} Hexel Stack
                </Button>
                <Button
                  size="sm"
                  className="bg-amber-500/80 text-white hover:bg-amber-500 ml-auto"
                  onClick={() => navigate("/hexisle/hexels/slotted-top")}
                >
                  Full Detail Page <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── COMPATIBILITY MATRIX (expandable) ── */}
      {showDetails && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left: Compatibility Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Hexagon className="w-4 h-4 text-amber-500" />
                Hex Terrain Compatibility
              </CardTitle>
              <CardDescription>
                SlottedTop retention zone: {INNOVATION_1552.keyDimensions["Retention Zone"]} max diameter
              </CardDescription>
            </CardHeader>
            <CardContent>
              {COMPATIBLE_SYSTEMS.map((system) => (
                <CompatibilityRow key={system.name} system={system} />
              ))}
            </CardContent>
          </Card>

          {/* Right: Dimensions + Mechanism */}
          <div className="space-y-4">
            {/* Key Dimensions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-500" />
                  SlottedTop Dimensions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(INNOVATION_1552.keyDimensions).map(([key, value]) => (
                    <div key={key} className="bg-muted/30 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">{key}</p>
                      <p className="font-mono font-bold text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trap Modes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  Hidden Trap Mechanics
                </CardTitle>
                <CardDescription>
                  Three modes of terrain interaction — all invisible from above
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {TRAP_MODES.map((trap, i) => (
                  <div key={trap.mode} className="flex gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-red-500 text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{trap.mode}</p>
                      <p className="text-xs text-muted-foreground">{trap.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Gorgon Mechanism */}
            <Card className="border-amber-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cog className="w-4 h-4 text-amber-500" />
                  Gorgon Compliant Mechanism
                </CardTitle>
                <CardDescription>
                  {GORGON_MECHANISM.partCount} part. {GORGON_MECHANISM.manufacturing.length} manufacturing methods.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{GORGON_MECHANISM.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {GORGON_MECHANISM.manufacturing.map((method) => (
                    <Badge key={method} variant="outline" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── HEXEL STACK (expandable) ── */}
      {showStack && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              The Hexel Stack — 14-Piece Mechanical Grammar
            </CardTitle>
            <CardDescription>
              Bottom to top. The SlottedTop (#14) is the crown piece — the terrain surface players interact with.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HexelStackMini />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SlottedTopHero;
