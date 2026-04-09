/**
 * QR Entry — Personalized landing for cue card / medallion scans.
 * Card type determines the micro-tour content.
 * After micro-tour → same 3 exits: browse / build / join.
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { MascotBubble } from "@/components/v2/mascot/MascotBubble";
import { LRHCharacter } from "@/components/museum/LRHCharacter";
import { motion } from "framer-motion";

type CardType = "general" | "builder" | "crown" | "academic" | "food" | "hexisle";

const cardTypeConfig: Record<CardType, {
  title: string;
  icon: string;
  stops: Array<{ title: string; message: string }>;
}> = {
  general: {
    title: "An Invitation",
    icon: "🌿",
    stops: [
      { title: "The Deal", message: "You keep 83.3% of everything you sell. The platform takes Cost + 20%. That's it." },
      { title: "16 Programs", message: "That 20% funds food, healthcare, legal protection, education, and 12 more community programs." },
      { title: "Your Turn", message: "Join for $5/year. No hidden fees. No data harvesting. Ever." },
    ],
  },
  builder: {
    title: "The Builder's Pathway",
    icon: "🏗️",
    stops: [
      { title: "What You Keep", message: "Slide the price: on $500, you keep $416.67. On $1,000 you keep $833.33. Always 83.3%." },
      { title: "Open Bounties", message: "Real work, real pay. Browse what needs building and claim a bounty." },
      { title: "Your Storefront", message: "Already sell on Shopify or Etsy? Bring it here. Cost + 20% wrap. Zero setup fee." },
    ],
  },
  crown: {
    title: "A Crown Invitation",
    icon: "👑",
    stops: [
      { title: "The 300", message: "300 named governance seats. Crowns, Board, Captains. Real accountability." },
      { title: "Patent Portfolio", message: "2,224 innovations. 12 provisionals filed. ~2,393 formal claims. The Behemoth." },
      { title: "Governance", message: "Structural Bylaws. Cost cap locked. Price can never increase. This is structural." },
    ],
  },
  academic: {
    title: "The Research Library",
    icon: "📚",
    stops: [
      { title: "Cephas Library", message: "455+ publications. Papers, articles, and micro-posts at three reading depths." },
      { title: "Academic Papers", message: "30+ papers covering cooperative economics, AI governance, and platform design." },
      { title: "Dual Render", message: "Academic Stanford-style or member progressive-disclosure. Same content, your format." },
    ],
  },
  food: {
    title: "The Food Pathway",
    icon: "🍳",
    stops: [
      { title: "Let's Make Dinner", message: "Cook meals for your neighborhood. Keep 83.3%. Real demand, real customers." },
      { title: "Groceries", message: "Cooperative bulk buying. Lower prices through volume. No middleman markup." },
      { title: "Family Table", message: "Shared meal planning for your family, your church, your block. Connected." },
    ],
  },
  hexisle: {
    title: "HexIsle World",
    icon: "🏝️",
    stops: [
      { title: "World Map", message: "7 islands. Each one a different economic system. Explore, build, trade." },
      { title: "Deterministic Combat", message: "No random crits. Strategy wins. Every battle outcome is predictable." },
      { title: "Production", message: "Desktop injection molding, 3D printing, real manufacturing. Make things." },
    ],
  },
};

function detectCardType(cardId: string): CardType {
  const lower = cardId.toLowerCase();
  if (lower.startsWith("crown") || lower.startsWith("cr-")) return "crown";
  if (lower.startsWith("build") || lower.startsWith("bld-")) return "builder";
  if (lower.startsWith("acad") || lower.startsWith("ac-")) return "academic";
  if (lower.startsWith("food") || lower.startsWith("fd-")) return "food";
  if (lower.startsWith("hex") || lower.startsWith("hx-")) return "hexisle";
  return "general";
}

const QREntry = () => {
  const { cardId = "general" } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const [tourStep, setTourStep] = useState(-1); // -1 = landing, 0+ = tour stops
  const cardType = detectCardType(cardId);
  const config = cardTypeConfig[cardType];

  // Landing screen
  if (tourStep === -1) {
    return (
      <MuseumShell hideFabs>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 max-w-md mx-auto">
          <motion.div
            className="w-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-5xl mb-4">{config.icon}</div>
            <div className="text-slate-400 text-xs uppercase tracking-widest mb-2">You've unlocked:</div>
            <h1 className="text-2xl font-bold text-white mb-6">{config.title}</h1>

            <div className="flex items-start gap-3 text-left mb-6">
              <LRHCharacter size={28} />
              <MascotBubble
                message="Someone believes you belong here. Let me show you why."
                showIcon={false}
                maxWidth={280}
              />
            </div>

            <button
              onClick={() => setTourStep(0)}
              className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors mb-3"
            >
              Show me → (3 stops)
            </button>
            <button
              onClick={() => navigate("/browse")}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-600 text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Skip to exploring →
            </button>
          </motion.div>
        </div>
      </MuseumShell>
    );
  }

  const currentStop = config.stops[tourStep];
  const isLast = tourStep === config.stops.length - 1;

  return (
    <MuseumShell hideFabs>
      <div className="min-h-screen flex flex-col px-4 py-6 pb-24 max-w-md mx-auto">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {config.stops.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === tourStep ? "bg-emerald-400" : i < tourStep ? "bg-emerald-700" : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        <motion.div
          key={tourStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col justify-center"
        >
          <div className="flex items-start gap-3 mb-8">
            <LRHCharacter size={36} />
            <MascotBubble
              title={currentStop.title}
              message={currentStop.message}
              maxWidth={300}
              showIcon={false}
            />
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => setTourStep(Math.max(0, tourStep - 1))}
            className={`text-sm text-slate-500 hover:text-slate-300 transition-colors ${tourStep === 0 ? "invisible" : ""}`}
          >
            ← Back
          </button>
          {isLast ? (
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/browse")}
                className="py-2 px-4 rounded-lg border border-slate-600 text-slate-400 text-sm"
              >
                Browse
              </button>
              <button
                onClick={() => navigate("/join")}
                className="py-2 px-4 rounded-lg bg-emerald-600 text-white text-sm"
              >
                Join →
              </button>
            </div>
          ) : (
            <button
              onClick={() => setTourStep(tourStep + 1)}
              className="py-2.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </MuseumShell>
  );
};

export default QREntry;
