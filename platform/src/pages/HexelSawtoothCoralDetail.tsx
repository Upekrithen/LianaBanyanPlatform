/**
 * HEXEL SAWTOOTH CORAL + TIMING BELT DETAIL PAGE
 * ================================================
 * Week 2 of the weekly Hexel component series.
 * The ratchet mechanism — click-click-click satisfying mechanical feedback.
 *
 * Route: /hexisle/hexels/sawtooth-coral
 * Status: UPCOMING (stub page with teaser content)
 */

import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ArrowRight, Calendar, Clock, Cog, Hexagon,
  ChevronRight, Zap,
} from "lucide-react";
import { WEEKLY_RELEASES } from "@/lib/hexSlottedTopShowcase";

export default function HexelSawtoothCoralDetail() {
  const navigate = useNavigate();
  const release = WEEKLY_RELEASES.find(r => r.partName === "SawtoothCoral + TimingBelt");

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/hexisle")} className="hover:text-foreground transition-colors">
          HexIsle
        </button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate("/hexisle")} className="hover:text-foreground transition-colors">
          Hexels
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">SawtoothCoral + TimingBelt</span>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/20 bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-800 text-white p-8 md:p-12">
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40">
              <Calendar className="w-3 h-3 mr-1" /> Week 2
            </Badge>
            <Badge className="bg-orange-500/15 text-orange-300 border-orange-500/30">
              <Clock className="w-3 h-3 mr-1" /> Coming Soon
            </Badge>
            <Badge className="bg-white/10 text-white/70 border-white/20">
              Stack #10
            </Badge>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-orange-300 via-white to-amber-300 bg-clip-text text-transparent">
            SawtoothCoral + TimingBelt
          </h1>
          <p className="text-xl text-white/80 mb-2">
            The Ratchet Mechanism
          </p>
          <p className="text-base text-white/60 max-w-3xl">
            Click-click-click. The most satisfying sound in tabletop gaming. The SawtoothCoral
            converts continuous rotation into precise, indexed steps. The TimingBelt synchronizes
            the ratchet with the gear train above. Together they give every Hexel its heartbeat.
          </p>
        </div>
      </div>

      {/* Coming Soon Content */}
      <Card className="border-amber-500/20">
        <CardContent className="py-12 text-center">
          <Cog className="w-16 h-16 mx-auto text-amber-500/30 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Full Details Dropping Week 2</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Complete engineering breakdown, dimensional specs, manufacturing path, and
            bounty programs for the SawtoothCoral ratchet mechanism. Print the SlottedTop
            this week &mdash; next week, add the click.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">What It Does</p>
              <p className="font-bold">Ratchet indexing</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Part Count</p>
              <p className="font-bold">2 parts (Coral + Belt)</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Connects To</p>
              <p className="font-bold">MainGear (#11) below, Cradle (#12) above</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teaser: What to do now */}
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
          <Button variant="outline" size="sm" onClick={() => navigate("/hexisle/hexels/slotted-top")} className="mt-2">
            <Hexagon className="w-4 h-4 mr-2" /> Go to SlottedTop Detail Page
          </Button>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => navigate("/hexisle/hexels/slotted-top")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Prev: SlottedTop
        </Button>
        <Button variant="outline" disabled>
          Next: Capstone (Week 3) <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
