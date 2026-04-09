/**
 * NetworkLanding — lianabanyan.net identity page
 * "ONE / Of Us / Discover Your Crew"
 * Warm amber/gold campfire palette with 6 flipping Deck Cards.
 */

import { PortalDeckCardGrid } from "@/components/PortalDeckCardGrid";
import type { PortalDeckCardConfig } from "@/components/PortalDeckCard";
import { CrossPortalNav } from "@/components/CrossPortalNav";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AMBER = "rgb(245 158 11)";

const DECK_CARDS: PortalDeckCardConfig[] = [
  {
    icon: "⚔️",
    title: "Guilds",
    description:
      "Join a craft-based guild. Leatherworkers, Terrain Builders, Jewelers, Woodworkers — find your people and share your craft.",
    href: "/guilds",
    accentColor: AMBER,
  },
  {
    icon: "🏕️",
    title: "Tribes",
    description:
      "Local and interest-based communities. Find makers near you or connect with people who share your passion.",
    href: "/tribes",
    accentColor: AMBER,
  },
  {
    icon: "🔌",
    title: "Social Plugs",
    description:
      "Connect your Reddit, Discord, Instagram — bring your existing community with you. Your audience follows you here.",
    href: "/import",
    accentColor: AMBER,
  },
  {
    icon: "🎯",
    title: "Project Bounties",
    description:
      "Open requests for help. Someone needs what you can do. Featuring HexIsle terrain bounties and maker challenges.",
    href: "/projects?filter=bounties",
    accentColor: AMBER,
  },
  {
    icon: "✍️",
    title: "Post",
    description:
      "Create a project, bounty, collaboration request, lark, or anything your crew needs to see. Your voice, your stage.",
    href: "/projects/create",
    accentColor: AMBER,
  },
  {
    icon: "🏭",
    title: "Find a Maker",
    description:
      "Who can produce your design? Browse makers with the machines, skills, and capacity you need. Connect and build together.",
    href: "/factory/nodes",
    accentColor: AMBER,
  },
  {
    icon: "⚙️",
    title: "The 2nd Second",
    subtitle: "The Grand Experiment",
    description:
      "The 2nd Second Industrial Revolution — manufacturing that grows from the ground up, funded by the community that uses it.",
    href: "/2nd-second",
    openNewTab: false,
    accentColor: AMBER,
    frontImage: "/images/medallion-ship-side-a.png",
    backImage: "/images/medallion-2nd-second-side-b.png",
  },
];

export default function NetworkLanding() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-950/90 via-stone-950 to-stone-950">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-start px-6 pt-16 pb-12">
        <div className="text-center mb-14">
          <h1 className="text-7xl sm:text-8xl font-bold tracking-tight text-amber-200 leading-none">
            ONE
          </h1>
          <p className="text-5xl sm:text-6xl font-medium text-amber-100/80 mt-1 leading-tight">
            Of Us
          </p>
          <p className="text-xl text-amber-400/60 mt-4">
            Discover Your Crew
          </p>
        </div>

        <PortalDeckCardGrid cards={DECK_CARDS} accentColor={AMBER} />

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-12">
          <Link to="/auth">
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              Sign In / Join — $5/year
            </Button>
          </Link>
          <a href="https://lianabanyan.com/captain">
            <Button
              size="lg"
              variant="outline"
              className="border-amber-700/40 text-amber-300 hover:bg-amber-900/30"
            >
              Captain's Deck →
            </Button>
          </a>
        </div>
      </section>

      {/* Cross Portal Nav */}
      <CrossPortalNav />
    </div>
  );
}
