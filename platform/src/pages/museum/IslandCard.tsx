/**
 * IslandCard — Deck Card for a single HexIsle island.
 * Front: Art slideshow with chevron navigation, island name + icon.
 * Back: Lore (Ghost World) OR business description (Real World / X-Ray).
 * Tap to flip. Districts listed on back as sub-card links.
 *
 * Route: /hexisle/:island
 * Sub-routes: /hexisle/:island/:district (DistrictCard)
 *
 * Each island is a Multiverse Iteration of the same Deck Card concept.
 * Introduced B092.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { useXRay } from "@/components/museum/XRayContext";
import { useArchipelagoTourSafe } from "@/contexts/ArchipelagoTourContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, ExternalLink } from "lucide-react";
import "@/components/museum/HologramOverlay.css";

/** Tour link per island — shown on Real World back in tour mode */
const TOUR_LINKS: Record<string, { label: string; href: string }> = {
  harvest: { label: "Try the Storefront Builder", href: "/marketplace?tour=true" },
  navigate: { label: "See the Subscription system", href: "/subscriptions?tour=true" },
  engineer: { label: "Visit the Design Pipeline", href: "/design-pipeline?tour=true" },
  battle: { label: "Check the Game Arena", href: "/hexisle-arena?tour=true" },
  seek: { label: "Browse Quality bounties", href: "/bounties?tour=true" },
  magic: { label: "Explore customer service tools", href: "/crew?tour=true" },
  train: { label: "See the Captain's Dashboard", href: "/captain?tour=true" },
};

/** Island data — lore from Caleb Jones, Creative Director */
const ISLAND_DATA: Record<string, {
  number: number;
  name: string;
  icon: string;
  color: string;
  theme: string;
  skill: string;
  lore: string;
  realWorldDesc: string;
  artImages: string[];
  hologramTier: 1 | 2 | 3 | 4;
  districts: Array<{ name: string; slug: string; desc: string; icon: string }>;
}> = {
  harvest: {
    number: 1,
    name: "Harvest Island",
    icon: "🌾",
    color: "#d4a855",
    theme: "Manufacturing",
    skill: "Production & supply chain",
    artImages: ["/images/hexisle/island-1-harvest.jpg", "/images/hexisle/harvest-concept.jpg"],
    hologramTier: 1,
    lore:
      "You awaken to the sound of waves. An enormous beach stretches before you — desolate and rocky. " +
      "Small shrubs and grasses cling to stones. Shelters cobbled from driftwood and debris, " +
      "filled with starving people. A single thin tree sticks out stubbornly from rocks on a distant hill.\n\n" +
      "You may have been left here to die, but you're not dead yet.\n\n" +
      "In a cave, a strange glow — marked by a star in the sky above it at unknown coordinates. " +
      "This star sighting serves as the plot hook for your entire journey.",
    realWorldDesc:
      "Harvest Island maps to Manufacturing — production, supply chain, and making things real. " +
      "Here you learn the Cold Start pathway for physical products: prototyping, costing, " +
      "sourcing materials, and launching your first production run.\n\n" +
      "The Port City of Verdana awaits. Explore the Tower of Peace, visit the Harbor, " +
      "browse the Marketplace, and find your first Guild.",
    districts: [
      { name: "Tower of Peace", slug: "tower-of-peace", desc: "Home of the Book of Peace. Knowledge begins here.", icon: "🏛️" },
      { name: "The Hexagon", slug: "hexagon", desc: "The walled compound. Heart of governance.", icon: "⬡" },
      { name: "Harbor District", slug: "harbor", desc: "Trade & logistics. Ships arrive and depart.", icon: "⚓" },
      { name: "Market Square", slug: "marketplace", desc: "Commerce hub. Buy, sell, barter.", icon: "🏪" },
      { name: "The Canteen", slug: "canteen", desc: "Where crews gather to eat and plan.", icon: "🍽️" },
      { name: "The Tavern", slug: "tavern", desc: "Assembly point. Ghost World staging ground.", icon: "🍺" },
      { name: "Canal Quarter", slug: "canal-quarter", desc: "Vienna-style canals. Arts & entertainment.", icon: "🎭" },
      { name: "Forge Corner", slug: "forge", desc: "Manufacturing & innovation workshop.", icon: "🔨" },
      { name: "The Garden", slug: "garden", desc: "Agriculture & growth. Tending what matters.", icon: "🌱" },
      { name: "Academy Terrace", slug: "academy", desc: "Education & learning. Skill building.", icon: "📚" },
      { name: "Alchemist's Nook", slug: "alchemist", desc: "Research & experimentation lab.", icon: "⚗️" },
      { name: "The Common", slug: "common", desc: "Community assembly. The people's ground.", icon: "🏕️" },
    ],
  },
  navigate: {
    number: 2, name: "Navigate Island", icon: "🧭", color: "#4a90d9",
    theme: "Sales", skill: "Market navigation & trade",
    artImages: ["/images/hexisle/island-2-navigate.jpg"],
    hologramTier: 2,
    lore:
      "Great walls of rock rise from the sea. A jagged, stark landscape separated by fjords " +
      "that snake through like a maze. Water between them swirls hungrily with whirlpools. " +
      "Skeletal remains of shipwrecks stick out from below. Trees grow from the cliff tops — " +
      "resources accessible only from above.\n\nYou must chart your course through the maze.",
    realWorldDesc:
      "Navigate Island maps to Sales — market navigation, trade routes, and finding your customers. " +
      "Learn to chart market channels, build sales funnels, and navigate competitive waters.",
    districts: [],
  },
  engineer: {
    number: 3, name: "Engineer Island", icon: "⚙️", color: "#6b8e23",
    theme: "R&D", skill: "Research & development",
    artImages: ["/images/hexisle/island-3-engineer.jpg"],
    hologramTier: 3,
    lore:
      "Massive fossilized tree stumps — remains of a once-great forest. Smaller trees grow " +
      "from their empty shells, reaching from one another like bridges. Small creatures cross " +
      "the bridges, appearing apelike and large enough to pose a threat. " +
      "A landscape of towering tree spires connected by organic bridges.",
    realWorldDesc:
      "Engineer Island maps to R&D — research, development, and solving hard problems. " +
      "Build prototypes, test hypotheses, and engineer solutions that last.",
    districts: [],
  },
  battle: {
    number: 4, name: "Battle Island", icon: "⚔️", color: "#8b3a3a",
    theme: "Competition", skill: "Competitive strategy",
    artImages: ["/images/hexisle/island-4-battle.jpg", "/images/hexisle/battle-concept.jpg"],
    hologramTier: 3,
    lore:
      "A dark island permanently covered by storms. A thunderhead castle rises from the clouds. " +
      "Weathered landscape covered in discarded weapons and armor — so plentiful they seem to " +
      "grow from sand like grass. A wailing through the storm; bright eyes gaze from beyond.\n\n" +
      "From the high mountaintop, you can see Island 7 for the first time. " +
      "A lore cave shows a map depicting an island on a cloud.",
    realWorldDesc:
      "Battle Island maps to Competition — competitive strategy, market positioning, and defense. " +
      "Study your competitors, find your advantages, and protect what you've built.",
    districts: [],
  },
  seek: {
    number: 5, name: "Seek Island", icon: "🔑", color: "#9b59b6",
    theme: "Quality", skill: "Quality assurance & testing",
    artImages: ["/images/hexisle/island-5-seek.jpg"],
    hologramTier: 2,
    lore:
      "A chain of 5 islets with distributed keys. Each islet holds one key; " +
      "when all 5 are collected, they combine to open a portal in the center " +
      "of the archipelago. Golden glowing writings line the lore caves.",
    realWorldDesc:
      "Seek Island maps to Quality — assurance, testing, and the relentless pursuit of better. " +
      "Five keys, five quality checkpoints. No shortcuts.",
    districts: [],
  },
  magic: {
    number: 6, name: "Magic Island", icon: "✨", color: "#00bcd4",
    theme: "Service", skill: "Customer service & delight",
    artImages: ["/images/hexisle/island-6-magic.jpg"],
    hologramTier: 1,
    lore:
      "Located beneath the sea in a great bubble. Countless documents depict magic and its uses. " +
      "Written knowledge exists only in ruins — just enough salvageable to allow progression. " +
      "Here you learn to build portals to bypass the forcefield around Island 7.",
    realWorldDesc:
      "Magic Island maps to Service — customer delight, support, and the magic of making people feel valued. " +
      "The knowledge here lets you build portals between your customers and their goals.",
    districts: [],
  },
  train: {
    number: 7, name: "Train Island", icon: "👑", color: "#f39c12",
    theme: "Leadership", skill: "Team building & management",
    artImages: ["/images/hexisle/island-7-train.jpg"],
    hologramTier: 4,
    lore:
      "Surrounded by a great forcefield that cannot be sailed through. " +
      "A lost city where you learn portal-building magic. A massive siege engine lies " +
      "capsized in the water — miles long, larger than any human civilization. " +
      "Strange life forms vanish into portholes. Whispering all around.\n\n" +
      "Deep within: a door that pierces through the dark sea. " +
      "A door that can take you home.",
    realWorldDesc:
      "Train Island maps to Leadership — team building, management, and scaling what works. " +
      "The final skill. Build your crew, lead your guild, and train the next generation.",
    districts: [],
  },
};

const IslandCard = () => {
  const { island } = useParams<{ island: string }>();
  const navigate = useNavigate();
  const { xrayOn } = useXRay();
  const tour = useArchipelagoTourSafe();
  const [flipped, setFlipped] = useState(false);
  const [districtIndex, setDistrictIndex] = useState(0);
  const [artIndex, setArtIndex] = useState(0);

  useEffect(() => {
    if (!island) return;
    const slug = island.toLowerCase();
    try {
      const raw = localStorage.getItem("hexisle_progress");
      const progress = raw ? JSON.parse(raw) : { visitedIslands: [], currentIsland: "" };
      if (!progress.visitedIslands.includes(slug)) {
        progress.visitedIslands.push(slug);
      }
      progress.currentIsland = slug;
      localStorage.setItem("hexisle_progress", JSON.stringify(progress));
    } catch { /* ignore */ }
  }, [island]);

  useEffect(() => {
    if (flipped && island && tour.isTourActive) {
      tour.markIslandFlipped(island.toLowerCase());
    }
  }, [flipped, island, tour.isTourActive, tour.markIslandFlipped]);

  const data = island ? ISLAND_DATA[island.toLowerCase()] : null;
  if (!data) {
    return (
      <DeckCardShell>
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: "rgba(250,245,235,0.5)", fontSize: "0.8rem" }}>Island not found.</p>
        </div>
      </DeckCardShell>
    );
  }

  const accentColor = xrayOn ? "#22d3ee" : data.color;
  const backText = xrayOn ? data.realWorldDesc : data.lore;
  const hasDistricts = data.districts.length > 0;

  return (
    <DeckCardShell>
      <AnimatePresence mode="wait">
        {!flipped ? (
          /* ── FRONT: Island art + name ── */
          <motion.div
            key="front"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col items-center justify-between text-center cursor-pointer"
            onClick={() => setFlipped(true)}
          >
            {/* Top: back nav + iteration badge */}
            <div className="w-full flex items-center justify-between">
              <button
                onClick={(e) => { e.stopPropagation(); navigate("/hexisle"); }}
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: "rgba(250,245,235,0.35)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.7)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.35)")}
              >
                <ArrowLeft className="w-3 h-3" /> Map
              </button>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.55rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(250,245,235,0.25)",
                }}
              >
                Island {data.number} of 7
              </span>
            </div>

            {/* Center: island art slideshow + name */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative flex items-center gap-2 mb-3">
                {data.artImages.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setArtIndex((prev) => (prev - 1 + data.artImages.length) % data.artImages.length); }}
                    className="text-white/30 hover:text-white/70 transition-colors text-xl shrink-0"
                    aria-label="Previous art"
                  >‹</button>
                )}
                <div
                  className={`hologram-character hologram-tier-${data.hologramTier} hologram-delay-${data.number % 6}`}
                  style={{
                    width: "180px",
                    height: "180px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: `2px solid ${data.color}60`,
                    boxShadow: `0 0 30px ${data.color}20, inset 0 0 20px ${data.color}15`,
                    background: `radial-gradient(circle at 40% 35%, ${data.color}30, rgba(10,22,40,0.9))`,
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={artIndex}
                      src={data.artImages[artIndex]}
                      alt={`${data.name} concept art`}
                      className="hologram-target"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </AnimatePresence>
                </div>
                {data.artImages.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setArtIndex((prev) => (prev + 1) % data.artImages.length); }}
                    className="text-white/30 hover:text-white/70 transition-colors text-xl shrink-0"
                    aria-label="Next art"
                  >›</button>
                )}
              </div>
              {data.artImages.length > 1 && (
                <div className="flex gap-1.5 mb-2">
                  {data.artImages.map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full transition-colors"
                      style={{ background: i === artIndex ? data.color : "rgba(250,245,235,0.15)" }}
                    />
                  ))}
                </div>
              )}

              <h1
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "clamp(1.4rem, 5vw, 1.8rem)",
                  fontWeight: 700,
                  color: accentColor,
                  marginBottom: "0.25rem",
                  transition: "color 0.5s ease",
                }}
              >
                {data.name}
              </h1>

              {xrayOn && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.65rem",
                    color: "#22d3ee",
                    letterSpacing: "0.05em",
                  }}
                >
                  {data.theme} — {data.skill}
                </motion.p>
              )}

              {!xrayOn && (
                <p style={{ color: "rgba(250,245,235,0.4)", fontSize: "0.75rem", fontStyle: "italic" }}>
                  {data.lore.split(".")[0]}.
                </p>
              )}
            </div>

            {/* Bottom: tap hint */}
            <div className="flex items-center gap-1.5" style={{ color: "rgba(250,245,235,0.2)", fontSize: "0.6rem" }}>
              <RotateCcw className="w-3 h-3" />
              <span>Tap to flip</span>
            </div>
          </motion.div>
        ) : (
          /* ── BACK: Lore / Business info + district links ── */
          <motion.div
            key="back"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col text-left"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setFlipped(false)}
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: "rgba(250,245,235,0.35)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.7)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.35)")}
              >
                <RotateCcw className="w-3 h-3" /> Flip back
              </button>
              <span style={{ fontSize: "0.55rem", color: accentColor, fontFamily: "'JetBrains Mono', monospace", transition: "color 0.5s ease" }}>
                {xrayOn ? "Real World" : "Ghost World"}
              </span>
            </div>

            {/* Title */}
            <h2
              style={{
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: accentColor,
                marginBottom: "0.5rem",
                transition: "color 0.5s ease",
              }}
            >
              {data.icon} {data.name}
            </h2>

            {/* Description text */}
            <div
              className="flex-1 overflow-y-auto pr-1"
              style={{ maxHeight: hasDistricts ? "120px" : "250px" }}
            >
              {backText.split("\n\n").map((para, i) => (
                <p
                  key={i}
                  style={{
                    color: "rgba(250,245,235,0.7)",
                    fontSize: "0.72rem",
                    lineHeight: 1.6,
                    marginBottom: "0.5rem",
                  }}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Tour feature preview link */}
            {tour.isTourActive && xrayOn && island && TOUR_LINKS[island.toLowerCase()] && (
              <button
                onClick={() => navigate(TOUR_LINKS[island.toLowerCase()].href)}
                className="w-full mt-2 p-2.5 rounded-lg flex items-center justify-between group"
                style={{
                  background: "rgba(249, 115, 22, 0.08)",
                  border: "1px solid rgba(249, 115, 22, 0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontSize: "0.7rem", color: "#f97316", fontWeight: 600 }}>
                  {TOUR_LINKS[island.toLowerCase()].label}
                </span>
                <ExternalLink className="w-3 h-3" style={{ color: "#f97316", opacity: 0.6 }} />
              </button>
            )}

            {/* District links (Harvest only for Phase 1) */}
            {hasDistricts && (
              <div className="mt-2">
                <p
                  style={{
                    fontSize: "0.6rem",
                    color: "rgba(250,245,235,0.3)",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.05em",
                    marginBottom: "0.35rem",
                  }}
                >
                  {xrayOn ? "DISTRICTS — TAP TO EXPLORE" : "LOCATIONS — TAP TO EXPLORE"}
                </p>

                {/* Slideshow through districts with chevrons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDistrictIndex((prev) => (prev - 1 + data.districts.length) % data.districts.length)}
                    style={{ color: "rgba(250,245,235,0.3)", transition: "color 0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.7)")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.3)")}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigate(`/hexisle/${island}/${data.districts[districtIndex].slug}`)}
                    className="flex-1 text-left rounded-lg active:scale-[0.98]"
                    style={{
                      padding: "0.5rem 0.65rem",
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${accentColor}30`,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{data.districts[districtIndex].icon}</span>
                      <div>
                        <div style={{ color: "#faf5eb", fontSize: "0.75rem", fontWeight: 600 }}>
                          {data.districts[districtIndex].name}
                        </div>
                        <div style={{ color: "rgba(250,245,235,0.4)", fontSize: "0.6rem" }}>
                          {data.districts[districtIndex].desc}
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setDistrictIndex((prev) => (prev + 1) % data.districts.length)}
                    style={{ color: "rgba(250,245,235,0.3)", transition: "color 0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.7)")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.3)")}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center mt-1">
                  <span style={{ fontSize: "0.5rem", color: "rgba(250,245,235,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {districtIndex + 1} / {data.districts.length}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DeckCardShell>
  );
};

export default IslandCard;
