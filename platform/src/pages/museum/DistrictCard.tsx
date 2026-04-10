/**
 * DistrictCard — Deck Card for a district within an island.
 * Each district is a Multiverse Iteration — same DeckCardShell,
 * different content. Back describes the district's function,
 * with links to sub-locations.
 *
 * Route: /hexisle/:island/:district
 *
 * Introduced B092.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { useXRay } from "@/components/museum/XRayContext";
import { useArchipelagoTourSafe } from "@/contexts/ArchipelagoTourContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle, ExternalLink } from "lucide-react";
import { DeckCardActions } from "@/components/museum/DeckCardActions";

/** District data for Harvest Island / Verdana */
const DISTRICT_DATA: Record<string, {
  name: string;
  icon: string;
  color: string;
  lore: string;
  realWorld: string;
  keepRooms?: Array<{ name: string; price: string; seats: number }>;
}> = {
  "tower-of-peace": {
    name: "Tower of Peace",
    icon: "🏛️",
    color: "#d4a855",
    lore:
      "Home of the Book of Peace — the sacred repository of all knowledge gathered across " +
      "the islands. Scholars and seekers come here to study the old ways, to find maps " +
      "of forgotten routes, and to learn what those before them discovered.\n\n" +
      "The tower stands at the highest point of Verdana, visible from the harbor below. " +
      "Its light burns through the night, guiding ships home.",
    realWorld:
      "The Tower of Peace maps to Knowledge & Documentation. This is your Cephas Library — " +
      "455+ publications at three reading depths. Here you find papers, articles, and " +
      "Skipping Stones that teach you the platform's architecture.\n\n" +
      "Start here. Read. Then build.",
  },
  hexagon: {
    name: "The Hexagon",
    icon: "⬡",
    color: "#d4a855",
    lore:
      "A walled compound at the center of Verdana. The Hexagon is where the city's " +
      "governance takes place — decisions made, disputes resolved, and the common good " +
      "defended. Six walls, six voices, one purpose.",
    realWorld:
      "The Hexagon maps to Governance. Star Chamber votes, Round Table discussions, " +
      "and the member-governed systems that keep the platform fair. " +
      "Every member has a voice. Every voice has weight.",
  },
  harbor: {
    name: "Harbor District",
    icon: "⚓",
    color: "#4a90d9",
    lore:
      "Where ships arrive and depart. The harbor is the city's lifeline — trade goods flow " +
      "through the docks, crews assemble for expeditions, and news from distant islands " +
      "arrives with every tide. The harbormaster keeps order among the chaos.",
    realWorld:
      "The Harbor maps to Trade & Logistics. Import/export of goods, crew assembly, " +
      "shipping coordination. In Liana Banyan terms: the Lemon Lot, Local Wheels, " +
      "and the distribution network that moves products from makers to members.",
  },
  marketplace: {
    name: "Market Square",
    icon: "🏪",
    color: "#e67e22",
    lore:
      "The beating heart of commerce. Stalls line every street, merchants hawk their " +
      "wares, and the air fills with the sound of haggling. Every guild has representation " +
      "here. Every trade has a fair price — enforced by the Hexagon.",
    realWorld:
      "Market Square maps to Commerce — the Storefront system, Beacons, and the " +
      "Cost+20% pricing model. No extraction. No middlemen inflating prices. " +
      "Creator keeps 83.3%.",
  },
  canteen: {
    name: "The Canteen",
    icon: "🍽️",
    color: "#27ae60",
    lore:
      "Where crews gather to eat, plan their next expedition, and share stories " +
      "of what they've found. The food is simple but filling. The company is what matters.",
    realWorld:
      "The Canteen maps to Crew coordination. Meal prep, Freezer Nodes, " +
      "and the cooperative infrastructure that feeds the community.",
  },
  tavern: {
    name: "The Tavern",
    icon: "🍺",
    color: "#8b6f47",
    lore:
      "More than a drinking hall — the Tavern is the assembly point. " +
      "Ghost World campaigns launch from here. Dungeon Masters gather their crews. " +
      "The Keep rooms upstairs hold game tables and strategy boards.\n\n" +
      "Upstairs, each room is a Keep — a private campaign space where a Dungeon Master " +
      "runs games, drills, and strategy sessions. The bigger the Keep, the bigger the crew.",
    realWorld:
      "The Tavern maps to Assembly & Ghost World staging. " +
      "This is where Keeps are leased, campaigns organized, " +
      "and Dungeon Masters run their crews through practice scenarios.\n\n" +
      "Dungeon Masters lease Keeps to run campaigns. Guild members sub-let. " +
      "Every Keep generates a unique Deck Card that can be shared as a Cue Card to invite players.",
    keepRooms: [
      { name: "Starter Keep", price: "$25/mo", seats: 6 },
      { name: "Guild Keep", price: "$75/mo", seats: 20 },
      { name: "Grand Keep", price: "$250/mo", seats: 50 },
      { name: "Fortress", price: "$1,200/mo", seats: 200 },
    ],
  },
  "canal-quarter": {
    name: "Canal Quarter",
    icon: "🎭",
    color: "#9b59b6",
    lore:
      "Vienna-style canals wind through this quarter. Gondolas carry performers " +
      "between venues. Music drifts from every window. Art adorns every wall.",
    realWorld:
      "Canal Quarter maps to Arts & Entertainment — the Red Carpet system, " +
      "content creation, and the cultural life of the platform.",
  },
  forge: {
    name: "Forge Corner",
    icon: "🔨",
    color: "#e74c3c",
    lore:
      "The sound of hammers on anvils echoes through the streets. Forge Corner " +
      "is where raw materials become useful things — weapons, tools, machinery. " +
      "Every maker starts here.",
    realWorld:
      "Forge Corner maps to Manufacturing & Innovation — the Canister System, " +
      "the Decentralized Factory, desktop injection molding, and the " +
      "maker economy that turns ideas into physical products.",
  },
  garden: {
    name: "The Garden",
    icon: "🌱",
    color: "#2ecc71",
    lore:
      "Terraced plots climb the hillside. Every plant serves a purpose — food, " +
      "medicine, building material. The gardeners tend what matters and let the rest go.",
    realWorld:
      "The Garden maps to Agriculture & Growth — cooperative farming, " +
      "community-supported agriculture, and the patient work of growing things.",
  },
  academy: {
    name: "Academy Terrace",
    icon: "📚",
    color: "#3498db",
    lore:
      "Stone steps lead up to the Academy — a place of learning built into the " +
      "mountainside. Students and teachers work side by side. Knowledge is free. " +
      "Skill is earned.",
    realWorld:
      "Academy Terrace maps to Education — the Cooperative Classroom system, " +
      "Guilds as professional learning communities, and the skill-verification " +
      "system that lets you prove what you know.",
  },
  alchemist: {
    name: "Alchemist's Nook",
    icon: "⚗️",
    color: "#1abc9c",
    lore:
      "Tucked into a quiet corner, the Alchemist experiments with combinations " +
      "no one else has tried. Some explode. Some transform lead into something " +
      "better than gold.",
    realWorld:
      "Alchemist's Nook maps to R&D — research, experimentation, " +
      "and the innovation pipeline that turns wild ideas into patent-worthy systems.",
  },
  common: {
    name: "The Common",
    icon: "🏕️",
    color: "#95a5a6",
    lore:
      "Open ground at the edge of the city. Anyone can gather here. " +
      "Markets spring up, festivals are held, and the community assembles " +
      "when important decisions need all voices.",
    realWorld:
      "The Common maps to Community Assembly — Tribes, family tables, " +
      "and the shared spaces where members connect as people, not just producers.",
  },
};

/** Tour challenge links per district (Harvest / Verdana) */
const TOUR_CHALLENGES: Record<string, { label: string; href: string }> = {
  "tower-of-peace": { label: "Read 3 Cephas articles", href: "/library" },
  harbor: { label: "See the Lemon Lot demo", href: "/marketplace?tour=true" },
  marketplace: { label: "Preview your Storefront", href: "/marketplace?tour=true" },
  forge: { label: "Tour the Canister System factory", href: "/build?tour=true" },
  tavern: { label: "Visit a Keep demo", href: "/browse?tour=true" },
};

const DistrictCard = () => {
  const { island, district } = useParams<{ island: string; district: string }>();
  const navigate = useNavigate();
  const { xrayOn } = useXRay();
  const tour = useArchipelagoTourSafe();
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (district && tour.isTourActive) {
      tour.markDistrictVisited(district);
    }
  }, [district, tour.isTourActive, tour.markDistrictVisited]);

  const data = district ? DISTRICT_DATA[district] : null;
  if (!data) {
    return (
      <DeckCardShell>
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: "rgba(250,245,235,0.5)", fontSize: "0.8rem" }}>District not found.</p>
        </div>
      </DeckCardShell>
    );
  }

  const accentColor = xrayOn ? "#22d3ee" : data.color;
  const backText = xrayOn ? data.realWorld : data.lore;

  return (
    <DeckCardShell>
      <AnimatePresence mode="wait">
        {!flipped ? (
          /* ── FRONT ── */
          <motion.div
            key="front"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col items-center justify-between text-center cursor-pointer"
            onClick={() => setFlipped(true)}
          >
            <div className="w-full flex items-center justify-between">
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/hexisle/${island}`); }}
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: "rgba(250,245,235,0.35)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.7)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.35)")}
              >
                <ArrowLeft className="w-3 h-3" /> {island ? island.charAt(0).toUpperCase() + island.slice(1) : "Island"}
              </button>
              <span className="flex items-center gap-1.5">
                {tour.isTourActive && district && tour.visitedDistricts.includes(district) && (
                  <CheckCircle className="w-3 h-3" style={{ color: "#f97316" }} />
                )}
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.55rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(250,245,235,0.2)",
                  }}
                >
                  District Card
                </span>
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, ${data.color}30, rgba(10,22,40,0.9))`,
                  border: `2px solid ${data.color}35`,
                  boxShadow: `0 0 20px ${data.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  marginBottom: "1rem",
                }}
              >
                {data.icon}
              </div>

              <h1
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "clamp(1.2rem, 4.5vw, 1.5rem)",
                  fontWeight: 700,
                  color: accentColor,
                  marginBottom: "0.25rem",
                  transition: "color 0.5s ease",
                }}
              >
                {data.name}
              </h1>

              <p style={{ color: "rgba(250,245,235,0.4)", fontSize: "0.7rem", fontStyle: "italic", maxWidth: "85%" }}>
                {backText.split(".")[0]}.
              </p>
            </div>

            <div className="flex items-center gap-1.5" style={{ color: "rgba(250,245,235,0.2)", fontSize: "0.6rem" }}>
              <RotateCcw className="w-3 h-3" />
              <span>Tap to read more</span>
            </div>
          </motion.div>
        ) : (
          /* ── BACK ── */
          <motion.div
            key="back"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col text-left"
          >
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

            <div className="flex-1 overflow-y-auto pr-1">
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

            {/* Keep Rooms (Tavern only in X-Ray mode) */}
            {data.keepRooms && xrayOn && (
              <div
                className="mt-2 p-2 rounded-lg"
                style={{ background: "rgba(34,211,238,0.04)", border: "1px solid rgba(34,211,238,0.15)" }}
              >
                <p style={{ fontSize: "0.55rem", color: "#22d3ee", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>
                  KEEP ROOMS
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {data.keepRooms.map((k) => (
                    <div key={k.name} className="p-1.5 rounded" style={{ background: "rgba(34,211,238,0.04)" }}>
                      <div style={{ fontSize: "0.6rem", color: "#22d3ee", fontWeight: 600 }}>{k.name}</div>
                      <div style={{ fontSize: "0.55rem", color: "rgba(250,245,235,0.5)" }}>{k.price} · seats {k.seats}{k.seats >= 200 ? "+" : ""}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tour challenge link */}
            {tour.isTourActive && district && TOUR_CHALLENGES[district] && (
              <button
                onClick={() => navigate(TOUR_CHALLENGES[district].href)}
                className="w-full mt-2 p-2.5 rounded-lg flex items-center justify-between"
                style={{
                  background: "rgba(249, 115, 22, 0.08)",
                  border: "1px solid rgba(249, 115, 22, 0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontSize: "0.7rem", color: "#f97316", fontWeight: 600 }}>
                  {TOUR_CHALLENGES[district].label}
                </span>
                <ExternalLink className="w-3 h-3" style={{ color: "#f97316", opacity: 0.6 }} />
              </button>
            )}

            {/* Bounty hint */}
            <div
              className="mt-2 p-2 rounded-lg"
              style={{
                background: "rgba(212,168,85,0.06)",
                border: "1px solid rgba(212,168,85,0.15)",
              }}
            >
              <p style={{ fontSize: "0.6rem", color: "rgba(201,169,110,0.6)", fontStyle: "italic" }}>
                🎨 Artwork bounty open — Create art for this location and earn Marks.
                3D models can be Twinned for physical production.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <DeckCardActions cardKey={`${island}-${district}`} cardTitle={data?.name} />
    </DeckCardShell>
  );
};

export default DistrictCard;
