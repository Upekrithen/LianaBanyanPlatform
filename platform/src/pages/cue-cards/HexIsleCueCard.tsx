/**
 * HEXISLE CUE CARD — "Know a Gamer? Know an Engineer?"
 * =====================================================
 * Referral cue card for HexIsle — the gravity-powered gaming system.
 * Front: Hook question + HexIsle branding + QR code
 * Back: Value propositions for gamers and engineers
 *
 * Route: /cue-cards/hexisle
 * QR Target: lianabanyan.com/hexisle
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Hexagon, Gamepad2, Wrench, Download, Trophy,
  ArrowRight, QrCode, Droplets, Cog, Users
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function HexIsleCueCard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referrer = searchParams.get('ref');

  return (
    <PortalPageLayout>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* ─── FRONT OF CARD ─── */}
        <Card className="bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 border-sky-500/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="py-12 px-8 text-center relative z-10">
            {/* Logo area */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-sky-500/20 mb-6">
              <Hexagon className="h-14 w-14 text-sky-400" strokeWidth={1.5} />
            </div>

            <h1
              className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-sky-300 to-emerald-300 bg-clip-text text-transparent"
              style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
            >
              Know a Gamer?
              <br />
              Know an Engineer?
            </h1>

            <p className="text-xl text-slate-300 mb-6 max-w-md mx-auto">
              HexIsle needs both.
            </p>

            {/* QR Code placeholder */}
            <div className="inline-flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl border border-slate-700/50">
              <QrCode className="h-24 w-24 text-slate-300" />
              <span className="text-xs text-slate-500">
                lianabanyan.com/hexisle{referrer ? `?ref=${referrer}` : ''}
              </span>
            </div>

            {referrer && (
              <p className="text-xs text-amber-400/60 mt-3">
                Referred by: {referrer}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ─── BACK OF CARD ─── */}
        <Card className="bg-slate-900/80 border-slate-700">
          <CardContent className="py-8 px-6 space-y-6">

            {/* What is HexIsle */}
            <div className="text-center pb-6 border-b border-slate-700/50">
              <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 mb-3">
                27 Pieces. Pure Mechanics.
              </Badge>
              <h2
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
              >
                HexIsle is a 27-piece gravity-powered gaming system.
              </h2>
              <p className="text-slate-400">
                No batteries. No motors. No electricity. Water and gravity do the work.
              </p>
            </div>

            {/* Two audiences */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Gamers */}
              <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-emerald-300">Gamers</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <Download className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Download STL files and 3D-print Hexel pieces at home</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Cog className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Submit improvements via Piggy-Back — get your name on the piece forever</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Trophy className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Earn Marks and XP by testing, printing, and breaking things</span>
                  </li>
                </ul>
              </div>

              {/* Engineers */}
              <div className="p-5 rounded-xl bg-sky-500/5 border border-sky-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-sky-400" />
                  </div>
                  <h3 className="font-bold text-sky-300">Engineers</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <Droplets className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>Claim Crew Call bounties — hydraulic seals, Tesla Valves, gear optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Cog className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>Help build the Water Table — 420 Hexels, gravity-powered</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>Earn permanent IP Ledger credit for accepted engineering contributions</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500"
                  onClick={() => navigate("/hexisle")}
                >
                  <Hexagon className="w-4 h-4 mr-2" />
                  Explore HexIsle
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={() => navigate("/crew-call")}
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  View Bounties
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={() => navigate("/hexisle/downloads")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download STLs
                </Button>
              </div>

              <p className="text-sm text-amber-400">
                lianabanyan.com/hexisle &nbsp;|&nbsp; $5/year membership
              </p>

              {referrer && (
                <p className="text-xs text-slate-500">
                  Referral tracking active: <code className="text-amber-300/60">?ref={referrer}</code>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-[10px] text-slate-600 text-center">
          HexIsle is part of the Liana Banyan cooperative platform.
          No ads. No data sales. $5/year funds the entire operation.
        </p>
      </div>
    </PortalPageLayout>
  );
}
