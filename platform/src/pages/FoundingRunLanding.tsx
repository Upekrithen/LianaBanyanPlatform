/**
 * FOUNDING RUN LANDING — HexIsle Pioneer Pre-Order Campaign
 * ==========================================================
 * "You're not just buying miniatures — you're building the playbook."
 *
 * Uses mock data until Supabase migrations for founding_runs land.
 */

import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldCheck, Clock, MessageSquare, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FundingTracker } from "@/components/FundingTracker";
import { BuildJournal, JournalEntry } from "@/components/BuildJournal";

// ── Mock data (will come from Supabase) ──────────────────────────────────

const MOCK_FUNDING = {
  currentAmount: 0,
  targetAmount: 5000,
  backerCount: 0,
  breakdown: { materials: 45, production: 20, shipping: 15, platform: 20 },
};

const MOCK_ITEMS = [
  {
    id: "starter-set",
    name: "Starter Set — 6 Miniatures",
    description: "The core HexIsle character collection: Kai, Mira, Zephyr, Flint, Coral, and Sage. Unpainted, high-detail resin.",
    price: 35,
    image: "/images/hexisle/starter-set.png",
  },
  {
    id: "island-tiles",
    name: "Island Hex Tiles (Set of 12)",
    description: "Modular terrain tiles for building your own archipelago. Interlocking design, durable PLA+.",
    price: 25,
    image: "/images/hexisle/hex-tiles.png",
  },
  {
    id: "slotted-top",
    name: "Slotted Top — Signature Piece",
    description: "The iconic HexIsle spinning top with hex-slot mechanism. Brass insert, weighted for long spin times.",
    price: 15,
    image: "/images/hexisle/slotted-top.png",
  },
  {
    id: "full-collection",
    name: "Full Founding Collection",
    description: "Everything above plus exclusive Pioneer-edition paint guide, display stand, and your name on the Founder's Wall.",
    price: 85,
    image: "/images/hexisle/full-collection.png",
  },
];

const MOCK_JOURNAL: JournalEntry[] = [
  {
    id: "j1",
    date: "2026-03-11",
    title: "Founding Run Announced",
    body: "The first cooperative production run for HexIsle is live. This is how we build the playbook — transparently, together. Every step documented, every dollar accounted for.",
  },
];

// ── Component ────────────────────────────────────────────────────────────

export default function FoundingRunLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        <button
          onClick={() => navigate("/hexisle")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to HexIsle
        </button>

        {/* ── Hero ── */}
        <div className="text-center space-y-6">
          <Badge variant="outline" className="text-amber-500 border-amber-500/30">
            <Star className="w-3 h-3 mr-1" /> Founding Run #1
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Founding Run: HexIsle
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic">
            The first cooperative production run. Built by members. Funded by
            pre-orders. Transparent from seed to shipment.
          </p>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            This is how cooperative commerce works: you commit, we produce,
            everyone sees where the money goes. No middlemen. No mystery. No
            markup beyond the 20% that funds 16 charitable initiatives.
          </p>
          <p className="text-lg font-semibold text-green-500">
            You're not just buying miniatures — you're building the playbook.
          </p>
        </div>

        {/* ── Funding Tracker ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Funding Progress</h2>
          <Card>
            <CardContent className="pt-6">
              <FundingTracker {...MOCK_FUNDING} />
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground text-center">
            Where your money goes — transparent cost breakdown. The 20%
            platform margin funds all 16 Sweet Sixteen charitable initiatives.
          </p>
        </section>

        {/* ── Product Showcase ── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">What You Can Pre-Order</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_ITEMS.map((item) => (
              <Card
                key={item.id}
                className="group hover:border-green-500/50 transition-colors"
              >
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-xl font-bold text-green-500 shrink-0 ml-4">
                      ${item.price}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate("/hexisle/founding-run/order")}
              className="bg-green-600 hover:bg-green-500"
            >
              <Zap className="w-4 h-4 mr-2" />
              Pre-Order Now — Join the Founding Run
            </Button>
          </div>
        </section>

        {/* ── Pioneer's Compact ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            The Pioneer's Compact
          </h2>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-6">
              <p className="font-medium mb-4">
                What to expect as a Founding Run pioneer:
              </p>
              <ul className="space-y-3">
                {[
                  {
                    icon: Clock,
                    text: "Estimated delivery: 8–12 weeks from funding complete",
                  },
                  {
                    icon: MessageSquare,
                    text: "You'll get production updates in the Build Journal (we show everything)",
                  },
                  {
                    icon: ShieldCheck,
                    text: "Timelines may shift — we'll tell you immediately and explain why",
                  },
                  {
                    icon: Star,
                    text: "Your feedback shapes the process for every creator who follows",
                  },
                  {
                    icon: Zap,
                    text: "Pioneer pricing locks in at founding rates permanently",
                  },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-background/50 rounded-lg border border-amber-500/10">
                <p className="text-sm italic text-muted-foreground">
                  "This is our first production run. Every step we figure out
                  becomes the playbook for the next creator. You're not just
                  buying a product — you're building cooperative
                  infrastructure."
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Build Journal ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Build Journal</h2>
          <Card>
            <CardContent className="pt-6">
              <BuildJournal entries={MOCK_JOURNAL} />
            </CardContent>
          </Card>
        </section>

        {/* ── Bottom CTA ── */}
        <div className="text-center space-y-4 pb-8">
          <Button
            size="lg"
            onClick={() => navigate("/hexisle/founding-run/order")}
            className="bg-green-600 hover:bg-green-500"
          >
            <Zap className="w-4 h-4 mr-2" />
            Pre-Order Now
          </Button>
          <p className="text-xs text-muted-foreground">
            $5/year membership required. Pre-order funds held until production
            threshold is met.
          </p>
        </div>
      </div>
    </div>
  );
}
