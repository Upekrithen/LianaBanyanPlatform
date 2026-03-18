/**
 * HexIsle Battle Philosophy — "Deterministic Chance" Lore Page
 * =============================================================
 * Game-side: explains how HexIsle mechanics model real consequence
 * Real-life: connects the same mechanics to cooperative economics
 *
 * Paper 8 in the Academic Series. Innovations referenced:
 * #1579, #1580, #1731-#1748
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Target, Crosshair, Shield, Coins, Mountain,
  Swords, BookOpen, ChevronDown, ChevronUp, Sparkles,
  TreePine, Users, BarChart3, Handshake, Shovel, Crown,
  Zap, Scale, ArrowRight, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface PhilosophySection {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  lore: string;          // HexIsle game lore
  realWorld: string;      // Real-life application
  innovations?: number[];
  quoteGame?: string;
  quoteLife?: string;
}

const SECTIONS: PhilosophySection[] = [
  {
    id: "attack-wheel",
    icon: Target,
    title: "The Attack Wheel",
    subtitle: "Chance without randomness",
    lore: "Every character has a continuous rotating attack wheel built into their Rucksack overlay. Push the button — the wheel clicks forward. The pattern is set by your level: Level I always starts miss-miss-hit. Level II: miss-hit (first shot always misses, second hits). Level III: hit-miss-hit-miss (first always hits, then alternates). Level IV: hit-hit-miss-miss. Level V: hit-hit-miss. Level VI: hit-hit-hit-miss. Each level's attacks cost more coins — power scales with price. The wheel never resets. Its position at any moment is the accumulated result of every attack fired since the game began. Everyone can see your level. Everyone knows your pattern. But nobody can track where every wheel points right now, because that depends on the entire history of the game. That is 'chance' — not a die roll, but the aggregate of a thousand prior decisions too complex to fully compute.",
    realWorld: "In business, the 'lucky break' is the same mechanism at scale. Your accumulated experience — every project completed, every skill practiced, every relationship built — positions your wheel. When the critical opportunity arrives, whether you hit or miss was determined long before that moment. The market feels random because no single actor can track the aggregate decisions of every participant. But it is deterministic. Your position was earned.",
    innovations: [1745, 1746],
    quoteGame: "The wheel remembers what the player forgets.",
    quoteLife: "The market remembers what the entrepreneur forgets.",
  },
  {
    id: "arrows-at-trees",
    icon: TreePine,
    title: "Arrows at Trees",
    subtitle: "Practice is pre-spent luck",
    lore: "A Level 1 archer on a miss-miss-hit pattern can fire two arrows at a tree — expending real coins from the attack economy — to guarantee the next shot at an enemy hits. The arrows in the tree accomplished nothing tactical. But they advanced the wheel past the misses. The guaranteed hit was purchased through preparation. Every player at the table can watch this happen. They can count the coins spent. They can see the wheel advance. The 'lucky shot' that follows is visibly, mechanically, undeniably earned.",
    realWorld: "Every entrepreneur who spent years on failed ventures before the breakthrough was shooting arrows at trees. Every musician who practiced scales for a decade before the standing ovation. Every trial lawyer who rehearsed to an empty room. The resources consumed in practice are real — time, money, energy, opportunity cost. But they advance your wheel to the position where, when the moment comes, you hit. The 'overnight success' is someone whose wheel the audience did not watch spinning.",
    innovations: [1747],
    quoteGame: "It is better to practice shooting arrows at trees so that when battle comes, you hit.",
    quoteLife: "It is better to practice shooting arrows at trees so that when business comes, you hit.",
  },
  {
    id: "coin-economy",
    icon: Coins,
    title: "Coins as Physical History",
    subtitle: "Every resource tells a story",
    lore: "Hit points are coins stacked inside the character's boot base, loaded like a Pez dispenser. Each coin powers one rotation of the damage counter. When a rotation completes, the top coin pops out. No coins left — character falls supine. Equipment durability comes from coins in armor and shield slots. Two coins in a shield means it absorbs two hits. Zero coins means a dead shield. Even defeated characters can negotiate: the victor must spend their own coins to activate captured equipment, and the loser can offer coins to ransom pieces back. Every coin in the game is simultaneously currency, fuel, armor, and negotiating leverage — and every coin's position on the board is a physical record of decisions made.",
    realWorld: "In cooperative economics, Pledged Marks are the coins in your boots. When you pledge Marks to a project, you are loading your base with skin in the game — visible to everyone, consumed when you take hits, ejected when the project absorbs damage. The equipment ransom maps to asset recovery: when a project fails, its infrastructure (tools, relationships, knowledge) can be acquired at cost by the next project. Nothing disappears. Everything has provenance. The physical state of your commitments IS your economic ledger.",
    innovations: [1731, 1732, 1744, 1748],
    quoteGame: "The coin in the boot is the truth the die cannot tell.",
    quoteLife: "The mark you pledge is the truth the resume cannot tell.",
  },
  {
    id: "terrain",
    icon: Mountain,
    title: "The Consequence Landscape",
    subtitle: "Terrain is inherited decisions",
    lore: "Terrain hexels have 1 to 6 holes arranged like die faces. Your character's boot protrusions must fit — or the piece falls over. No referee needed. Physics decides. And during gameplay, a player with a shovel can twist-unlock a hexel, exposing the hydraulic and gear mechanisms underneath, then build fortifications, set traps, or lay foundations. The terrain you modify persists. The wall you build in turn 4 is the obstacle your enemy navigates in turn 19. The trap you set is the consequence someone else walks into. The landscape is a living record of every constructive and destructive act by every player.",
    realWorld: "Markets work the same way. The infrastructure built by one generation becomes the inherited constraint for the next. The regulation enacted by one Congress becomes the consequence landscape for every subsequent business. The open-source library you publish becomes the terrain a thousand developers build on. Your 'luck' in finding good infrastructure was someone else's decision to build it. And your decision to modify the terrain — build something new, remove something broken — reshapes the landscape for everyone who comes after.",
    innovations: [1733, 1734, 1740],
    quoteGame: "Dig here, and someone across the board feels it three turns later.",
    quoteLife: "Build here, and someone across the market feels it three years later.",
  },
  {
    id: "cairn-alliances",
    icon: Handshake,
    title: "The Cairn: Trust Made Physical",
    subtitle: "Alliances you can see and break",
    lore: "To ally, you BUILD something. A cairn — stacked coin rolls with shield mounts on all six faces. Each player places their Brand Mark shield on a face and stores coins inside. Everyone at the table can see who is allied, how invested they are, and how hard the alliance is to breach. Each shield absorbs hits based on its coin investment. More shields, more coins, more defense. The reward for betrayal — all coins inside — is also visible. Trust is not a handshake. It is a physical object on the board with calculable cost, calculable defense, and calculable reward for treachery.",
    realWorld: "BandWagon project backing is the cooperative cairn. Multiple participants invest visibly. The defense (project viability) scales with collective investment. The breach reward (asset recovery on failure) is proportional to what was stored. And the shields — the Brand Marks — are reputation artifacts. You can see who backed what, who pledged how much, and whose judgment was vindicated. The 'probability' of a project failing is not random. It is the deterministic output of visible investment levels and known participant capabilities.",
    innovations: [1741, 1742, 1743],
    quoteGame: "A cairn with six shields and sixty coins is a promise you can weigh.",
    quoteLife: "A project with six backers and sixty pledged marks is a promise you can weigh.",
  },
  {
    id: "level-gating",
    icon: Crown,
    title: "Experience as Precision",
    subtitle: "Skill is not just hitting harder",
    lore: "At Level 1, when your attack hits, the DEFENDER chooses where the blow lands — helmet, shield, leg, horse. At Level 3+, the ATTACKER picks. Higher level does not just mean more damage. It means more control. More precision. The ability to direct your effort exactly where it matters. The overlay's Roman numeral tells both players who chooses. No rules lookup. No dispute. Just look at the number.",
    realWorld: "In cooperative economics, demonstrated experience (XP Score, Steward progression) earns not just more capacity — but more authority over where effort lands. A Scout backs projects; a Patron directs exactly which aspect of a project their backing supports. An Apprentice Steward executes tasks; a Grand Steward decides which tasks matter. Experience is not volume. It is precision. And precision is earned through the same aggregate mechanism: every prior success advanced your level, and your level determines your degree of control.",
    innovations: [1746, 1738],
    quoteGame: "A Level I warrior swings. A Level XII warrior chooses.",
    quoteLife: "A newcomer contributes. A veteran directs.",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HexIsleBattlePhilosophy() {
  const [expanded, setExpanded] = useState<string | null>("arrows-at-trees");
  const [viewMode, setViewMode] = useState<"game" | "life" | "both">("both");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link to="/hexisle" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to HexIsle
        </Link>

        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 text-amber-400 border-amber-400/30">
            Paper 8 — Academic Series
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
            Deterministic Chance
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            How HexIsle mechanics reveal that "luck" is the aggregate consequence
            of every decision every player made — on the board and in life.
          </p>
        </div>

        {/* Core Thesis */}
        <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/10 border-amber-500/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="w-8 h-8 text-amber-400 shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-bold text-amber-300 mb-2">The Core Thesis</h2>
                <p className="text-slate-300 leading-relaxed">
                  What games call "chance" (dice, card draws) is a lazy shortcut for something real:
                  the aggregate consequence of prior decisions by all participants, applied to the conditions
                  in which an event takes place. HexIsle eliminates dice and makes this explicit. A deterministic
                  wheel whose position reflects the cumulative history of every attack produces the <em>experience</em> of
                  chance without any randomness. The same principle governs cooperative economics — just with
                  more factors and a lot more players.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          {(["game", "both", "life"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === mode
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600"
              }`}
            >
              {mode === "game" ? "Battle Lore" : mode === "life" ? "Real-Life Application" : "Both Worlds"}
            </button>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTIONS.map((section) => {
            const isExpanded = expanded === section.id;
            const Icon = section.icon;

            return (
              <motion.div
                key={section.id}
                layout
                className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/50"
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : section.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-800/30 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white">{section.title}</h3>
                    <p className="text-sm text-slate-400">{section.subtitle}</p>
                  </div>
                  {section.innovations && (
                    <div className="hidden sm:flex gap-1">
                      {section.innovations.map((n) => (
                        <Badge key={n} variant="outline" className="text-xs text-slate-500 border-slate-700">
                          #{n}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4">
                        {/* Game Lore */}
                        {(viewMode === "game" || viewMode === "both") && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-red-900/10 to-orange-900/10 border border-red-500/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Swords className="w-4 h-4 text-red-400" />
                              <span className="text-sm font-semibold text-red-300">Battle Lore</span>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">{section.lore}</p>
                            {section.quoteGame && (
                              <p className="mt-3 text-xs italic text-amber-400/70 border-l-2 border-amber-500/30 pl-3">
                                "{section.quoteGame}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Real World */}
                        {(viewMode === "life" || viewMode === "both") && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-900/10 to-indigo-900/10 border border-blue-500/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Scale className="w-4 h-4 text-blue-400" />
                              <span className="text-sm font-semibold text-blue-300">Real-Life Application</span>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">{section.realWorld}</p>
                            {section.quoteLife && (
                              <p className="mt-3 text-xs italic text-blue-400/70 border-l-2 border-blue-500/30 pl-3">
                                "{section.quoteLife}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Chess Comparison */}
        <Card className="mt-8 bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              Four Models of Chance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left py-2 pr-4">Dimension</th>
                    <th className="text-left py-2 pr-4">Chess</th>
                    <th className="text-left py-2 pr-4">Catan</th>
                    <th className="text-left py-2 pr-4">D&D</th>
                    <th className="text-left py-2 text-amber-400">HexIsle</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-800">
                    <td className="py-2 pr-4 text-slate-400">Randomness</td>
                    <td className="py-2 pr-4">None</td>
                    <td className="py-2 pr-4">Dice</td>
                    <td className="py-2 pr-4">Dice (all)</td>
                    <td className="py-2 text-amber-300">None</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-2 pr-4 text-slate-400">Information</td>
                    <td className="py-2 pr-4">Perfect</td>
                    <td className="py-2 pr-4">Partial</td>
                    <td className="py-2 pr-4">Partial</td>
                    <td className="py-2 text-amber-300">Perfect</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-2 pr-4 text-slate-400">Freedom</td>
                    <td className="py-2 pr-4">64 squares</td>
                    <td className="py-2 pr-4">Fixed tiles</td>
                    <td className="py-2 pr-4">Narrative</td>
                    <td className="py-2 text-amber-300">Modifiable terrain</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-2 pr-4 text-slate-400">Economy</td>
                    <td className="py-2 pr-4">None</td>
                    <td className="py-2 pr-4">Trade</td>
                    <td className="py-2 pr-4">Loot</td>
                    <td className="py-2 text-amber-300">Coin HP + ransom + cairns</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-2 pr-4 text-slate-400">Preparation</td>
                    <td className="py-2 pr-4">Free (positional)</td>
                    <td className="py-2 pr-4">None</td>
                    <td className="py-2 pr-4">None</td>
                    <td className="py-2 text-amber-300">Costly pre-spending</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-slate-400">Chance model</td>
                    <td className="py-2 pr-4">Eliminated</td>
                    <td className="py-2 pr-4">Externalized</td>
                    <td className="py-2 pr-4">Externalized</td>
                    <td className="py-2 text-amber-300 font-bold">Internalized</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Closing Quote */}
        <div className="mt-10 text-center py-8 border-t border-slate-800">
          <blockquote className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">
            "It is better to practice shooting arrows at trees<br />
            so that when battle comes, you hit."
          </blockquote>
          <p className="text-slate-400 text-sm">
            This is the lesson of the game. It is also the lesson of the platform.
            It is also, we argue, the lesson of economics itself.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-3 mt-6 mb-12">
          <Link
            to="/hexisle"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 text-sm transition-all"
          >
            <Swords className="w-4 h-4" /> HexIsle Portal
          </Link>
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 text-sm transition-all"
          >
            <BookOpen className="w-4 h-4" /> FAQ
          </Link>
          <Link
            to="/cephas"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 text-sm transition-all"
          >
            <ExternalLink className="w-4 h-4" /> Cephas Academic Papers
          </Link>
        </div>
      </div>
    </div>
  );
}
