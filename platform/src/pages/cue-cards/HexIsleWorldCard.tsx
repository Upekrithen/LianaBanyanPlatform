/**
 * HEXISLE WORLD 3D CUE CARD
 * =========================
 * Landing page for HexIsle 3D World QR Cue Cards.
 * Shows the 7 islands overview, city structures preview,
 * and one-click entry into the immersive 3D archipelago.
 *
 * Route: /cue/hexisle-world
 * QR Target: hexisle.web.app/cue/hexisle-world
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  ArrowRight,
  Mountain,
  Compass,
  Waves,
  Swords,
  Search,
  Sparkles,
  GraduationCap,
  Building2,
  Landmark,
  Map,
  Hexagon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ─── Island Data for Cards ──────────────────────────────────────────────────

const ISLANDS_PREVIEW = [
  { id: 1, name: "Harvest", theme: "Manufacturing", icon: Mountain, color: "#c2b280", blurb: "Desolate beach, rivers, lakes — your journey begins here" },
  { id: 2, name: "Navigate", theme: "Sales", icon: Compass, color: "#4a4a4a", blurb: "Rocky fjords, whirlpools, and shipwrecks" },
  { id: 3, name: "Engineer", theme: "R&D", icon: Waves, color: "#6b4423", blurb: "Fossilized tree stumps rising from the sea" },
  { id: 4, name: "Battle", theme: "Competition", icon: Swords, color: "#2d3748", blurb: "Storm mountain at the center of the world" },
  { id: 5, name: "Seek", theme: "Quality", icon: Search, color: "#7a7a7a", blurb: "Five islets in a caldera ring — find the keys" },
  { id: 6, name: "Magic", theme: "Service", icon: Sparkles, color: "#00ff88", blurb: "Lost city rises from the depths" },
  { id: 7, name: "Train", theme: "Leadership", icon: GraduationCap, color: "#b8d4e3", blurb: "Capsized siege engine in ice, miles long" },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function HexIsleWorldCard() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout>
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-6 border-b border-slate-800 pb-12">
          <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 mb-4">
            HexIsle — Water-Powered Gaming
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
            The Archipelago
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Seven islands. One journey. South to north across an immersive 3D world
            built entirely from hexagonal terrain — like HeroScape brought to life.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-lg px-8"
              onClick={() => navigate("/hexisle/world-3d")}
            >
              <Globe className="w-5 h-5 mr-2" />
              Enter 3D World
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-slate-700 text-slate-300 hover:bg-slate-900"
              onClick={() => navigate("/hexisle/world-map")}
            >
              <Map className="w-5 h-5 mr-2" />
              View 2D Map
            </Button>
          </div>
        </div>

        {/* The Hex Terrain */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-sky-400 mb-2">
            <Hexagon className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Hex Terrain Engine</span>
          </div>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Every inch of terrain is built from hexagonal columns at varying heights.
            Mountains, cliffs, valleys — all visible as stacked hex tiles.
            One hex fits a human warrior. Three hexes span a warhorse.
          </p>
        </div>

        {/* 7 Islands Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ISLANDS_PREVIEW.map((island) => {
            const Icon = island.icon;
            return (
              <Card
                key={island.id}
                className="bg-slate-900/80 border-slate-800 hover:border-slate-600 transition-colors cursor-pointer"
                onClick={() => navigate("/hexisle/world-3d")}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${island.color}33` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: island.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {island.id}. {island.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        {island.theme}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400 italic">
                    {island.blurb}
                  </p>
                </CardContent>
              </Card>
            );
          })}

          {/* City Structures Card */}
          <Card className="bg-gradient-to-br from-amber-950/40 to-slate-900/80 border-amber-700/30 hover:border-amber-600/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-base">City of Verdana</CardTitle>
                  <CardDescription className="text-xs text-amber-500/70">
                    Harvest Island — First City
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 mb-3">
                The Hexagon, The Halls, The Harbor, The Keeps, Guild Towers — all rendered
                as hex-column buildings you can explore.
              </p>
              <div className="flex flex-wrap gap-1">
                {["The Hexagon", "Great Hall", "Harbor", "North Keep", "Guild Towers"].map(b => (
                  <Badge key={b} variant="outline" className="text-[9px] text-amber-400/80 border-amber-700/30">
                    {b}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Row */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-slate-900/50 rounded-lg border border-slate-800">
            <Building2 className="w-8 h-8 text-sky-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm mb-1">All Procedural</h3>
            <p className="text-xs text-slate-500">
              Zero imported 3D models. Every mountain, building, and ocean wave is generated from code.
            </p>
          </div>
          <div className="text-center p-6 bg-slate-900/50 rounded-lg border border-slate-800">
            <Hexagon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm mb-1">Hex-Based Movement</h3>
            <p className="text-xs text-slate-500">
              The entire world grid is hexagonal. Players move hex-by-hex, just like the tabletop game.
            </p>
          </div>
          <div className="text-center p-6 bg-slate-900/50 rounded-lg border border-slate-800">
            <Globe className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm mb-1">60fps in Browser</h3>
            <p className="text-xs text-slate-500">
              InstancedMesh rendering: 7 draw calls per island, not hundreds. Runs smooth on any modern device.
            </p>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="text-center border-t border-slate-800 pt-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-lg px-12"
            onClick={() => navigate("/hexisle/world-3d")}
          >
            <Globe className="w-5 h-5 mr-2" />
            Launch the Archipelago
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-slate-600 text-xs mt-4">
            HexIsle by James Ausbin (Creative Director) — Built on the Liana Banyan Platform
          </p>
        </div>

      </div>
    </PortalPageLayout>
  );
}
