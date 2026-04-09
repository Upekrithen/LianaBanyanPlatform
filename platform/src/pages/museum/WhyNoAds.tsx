/**
 * WhyNoAds — "No Ads" explanation card back (submarine door #3).
 * Route: /why-no-ads, /why-no-ads/:section
 */
import { useNavigate, useParams } from "react-router-dom";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { motion } from "framer-motion";

const SECTIONS: Record<string, string> = {
  "the-trap": "Ad-funded platforms sell your attention to the highest bidder. They don't optimize for helping you — they optimize for keeping you scrolling. Your data is the product. Your time is the commodity. Every feature is designed to maximize engagement, not value. Liana Banyan rejects this model entirely.",
  "our-engine": "The Furnace verifies every Cue Card before it enters the system. Your $5/year membership arms you with a Deck of shareable cards. The Cue Card Drop seeds 10 physical locations per member. Growth comes from members helping members — not from selling eyeballs to advertisers.",
  "for-you": "No creepy targeting. No algorithmic manipulation. No data harvesting. Earn 25 Marks per referral through genuine connection. Every dollar that would have gone to an ad platform goes directly to members instead. The platform grows because it works, not because it's addictive.",
};

const SECTION_TITLES: Record<string, string> = {
  "the-trap": "The Ad-Funded Trap",
  "our-engine": "Our Engine Instead",
  "for-you": "What It Means For You",
};

const WhyNoAds = () => {
  const navigate = useNavigate();
  const { section } = useParams();

  if (section && SECTIONS[section]) {
    return (
      <DeckCardShell>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col text-left px-1">
          <h2 className="flex items-center gap-2 mb-4 justify-center" style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "clamp(1.1rem, 4vw, 1.4rem)", fontWeight: 700, color: "#faf5eb" }}>
            <span style={{ color: "#dc2626" }}>🚫</span> {SECTION_TITLES[section]}
          </h2>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-sm leading-relaxed" style={{ color: "rgba(250,245,235,0.8)" }}>
              {SECTIONS[section]}
            </p>
          </div>
          <div className="flex gap-3 mt-auto justify-center">
            <button onClick={() => navigate(-1)} className="py-2 px-4 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors">
              ← Back
            </button>
            <button onClick={() => navigate("/library")} className="py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors" style={{ background: "#dc2626" }}>
              Read Full Explanation →
            </button>
          </div>
        </motion.div>
      </DeckCardShell>
    );
  }

  // Three-box overview
  return (
    <DeckCardShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col text-left px-1">
        <h2 className="flex items-center gap-2 mb-4 justify-center" style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "clamp(1.1rem, 4vw, 1.4rem)", fontWeight: 700, color: "#faf5eb" }}>
          <span style={{ color: "#dc2626" }}>🚫</span> Why No Outside Advertising?
        </h2>

        <div className="rounded-lg p-3 mb-2.5 cursor-pointer hover:brightness-110 transition-all" onClick={() => navigate("/why-no-ads/the-trap")} style={{ borderLeft: "3px solid #dc2626", background: "rgba(220, 38, 38, 0.08)" }}>
          <p className="font-bold text-sm" style={{ color: "#faf5eb" }}>The Ad-Funded Trap</p>
          <p className="text-xs mt-1" style={{ color: "rgba(250,245,235,0.6)", lineHeight: 1.5 }}>
            Ad-funded platforms sell your attention. They optimize for addiction, not help.
          </p>
        </div>

        <div className="rounded-lg p-3 mb-2.5 cursor-pointer hover:brightness-110 transition-all" onClick={() => navigate("/why-no-ads/our-engine")} style={{ borderLeft: "3px solid #38a169", background: "rgba(56, 161, 105, 0.08)" }}>
          <p className="font-bold text-sm" style={{ color: "#faf5eb" }}>Our Engine Instead</p>
          <p className="text-xs mt-1" style={{ color: "rgba(250,245,235,0.6)", lineHeight: 1.5 }}>
            <span className="font-semibold" style={{ color: "#faf5eb" }}>The Furnace</span> verifies Cue Cards → <span className="font-semibold" style={{ color: "#faf5eb" }}>$5/yr Deck</span> arms members → <span className="font-semibold" style={{ color: "#faf5eb" }}>The Cue Card Drop</span> seeds 10 locations.
          </p>
        </div>

        <div className="rounded-lg p-3 mb-3 cursor-pointer hover:brightness-110 transition-all" onClick={() => navigate("/why-no-ads/for-you")} style={{ borderLeft: "3px solid #10b981", background: "rgba(16, 185, 129, 0.08)" }}>
          <p className="font-bold text-sm" style={{ color: "#faf5eb" }}>What It Means For You</p>
          <p className="text-xs mt-1" style={{ color: "rgba(250,245,235,0.6)", lineHeight: 1.5 }}>
            No creepy targeting. Earn 25 Marks per referral. Every ad dollar goes to members instead.
          </p>
        </div>

        <div className="flex gap-3 mt-auto justify-center">
          <button onClick={() => navigate(-1)} className="py-2 px-4 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors">
            ← Back
          </button>
          <button onClick={() => navigate("/library")} className="py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors" style={{ background: "#dc2626" }}>
            Read Full Explanation →
          </button>
        </div>
      </motion.div>
    </DeckCardShell>
  );
};

export default WhyNoAds;
