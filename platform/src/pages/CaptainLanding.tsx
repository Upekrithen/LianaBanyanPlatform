/**
 * CaptainLanding — /captain on lianabanyan.com
 * "Welcome / Captain / Your Ship, Your Rules"
 * Deep navy/steel blue bridge palette with 6 flipping Deck Cards.
 */

import { PortalDeckCardGrid } from "@/components/PortalDeckCardGrid";
import type { PortalDeckCardConfig } from "@/components/PortalDeckCard";
import { CrossPortalNav } from "@/components/CrossPortalNav";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STEEL = "rgb(96 165 250)";

const DECK_CARDS: PortalDeckCardConfig[] = [
  {
    icon: "🧊",
    title: "Cold Start",
    description:
      "Start with $0 and your garage. Our Cold Start pathway scales from one machine to a full production node. No factory needed.",
    href: "/network/factory-nodes",
    accentColor: STEEL,
  },
  {
    icon: "🚀",
    title: "Turn-Key Business",
    description:
      "10 minutes. That's all it takes to set up your product listing, funding tiers, and production pipeline. Start today.",
    href: "/projects/create",
    accentColor: STEEL,
  },
  {
    icon: "🗺️",
    title: "Treasure Maps",
    description:
      "Your step-by-step path from idea to revenue. Pick your craft, follow the map, hit your milestones.",
    href: "/start",
    accentColor: STEEL,
  },
  {
    icon: "🎨",
    title: "What Will You Make?",
    description:
      "Leather? Terrain? Board games? Food? Digital? Pick a Cue Card and we'll set up everything for your craft.",
    href: "/cue-cards/campaigns",
    accentColor: STEEL,
  },
  {
    icon: "🎪",
    title: "Who's Waiting?",
    description:
      "Real people have already pledged real money for products like yours. See the demand before you commit.",
    href: "/projects?filter=showcase",
    accentColor: STEEL,
  },
  {
    icon: "📊",
    title: "The Numbers",
    description:
      "2,003 innovations. $5/year. You keep 83.3%. We take 20%. No hidden fees. No surprises. See the full picture.",
    href: "/about",
    accentColor: STEEL,
  },
];

export default function CaptainLanding() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-blue-950/60 to-slate-950">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-start px-6 pt-16 pb-12">
        <div className="text-center mb-14">
          <p className="text-6xl font-light tracking-wide text-blue-200/80 leading-tight">
            Welcome
          </p>
          <h1 className="text-8xl sm:text-9xl font-black tracking-tight text-blue-100 leading-none mt-1">
            Captain
          </h1>
          <p className="text-xl text-blue-400/60 mt-4 italic">
            Your Ship, Your Rules
          </p>
        </div>

        <PortalDeckCardGrid cards={DECK_CARDS} accentColor={STEEL} />

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-12">
          <Link to="/auth">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              Sign In / Join — $5/year
            </Button>
          </Link>
          <Link to="/start">
            <Button
              size="lg"
              variant="outline"
              className="border-blue-700/40 text-blue-300 hover:bg-blue-900/30"
            >
              Find Your Path →
            </Button>
          </Link>
        </div>
      </section>

      {/* Cross Portal Nav */}
      <CrossPortalNav />
    </div>
  );
}
