/**
 * WhyNoVC — "No V.C." explanation card back (submarine door #4).
 * Route: /why-no-vc, /why-no-vc/:section
 */
import { useNavigate, useParams } from "react-router-dom";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { motion } from "framer-motion";

const WhyNoVC = () => {
  const navigate = useNavigate();
  const { section } = useParams();

  if (section === "the-strings") {
    return (
      <DeckCardShell>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col text-left px-1">
          <h2 className="flex items-center gap-2 mb-4 justify-center" style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "clamp(1.1rem, 4vw, 1.4rem)", fontWeight: 700, color: "#faf5eb" }}>
            <span style={{ color: "#8b5cf6" }}>🛡️</span> V.C. Money Comes With Strings
          </h2>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-sm leading-relaxed" style={{ color: "rgba(250,245,235,0.8)" }}>
              10x return demands force unsustainable growth. Exit pressure means selling you — the member — in 5-7 years to the highest bidder. Each funding round dilutes everyone's stake. The investors' timeline is not your timeline. Their exit is your abandonment. We chose a different path.
            </p>
            <div className="mt-4 p-3 rounded-lg font-mono text-xs" style={{ background: "rgba(124, 58, 237, 0.1)", border: "1px solid rgba(124, 58, 237, 0.25)", color: "rgba(250,245,235,0.7)" }}>
              <div className="mb-1" style={{ color: "#a78bfa" }}>Series A → B → C dilution:</div>
              <div>You start with <span style={{ color: "#faf5eb" }}>100%</span></div>
              <div>Series A (20%): you keep <span style={{ color: "#faf5eb" }}>80%</span></div>
              <div>Series B (20%): you keep <span style={{ color: "#faf5eb" }}>64%</span></div>
              <div>Series C (20%): you keep <span style={{ color: "#d69e2e" }}>51.2%</span></div>
              <div className="mt-2" style={{ color: "rgba(250,245,235,0.4)" }}>Three rounds. Half your company. Gone.</div>
            </div>
          </div>
          <div className="flex gap-3 mt-auto justify-center">
            <button onClick={() => navigate(-1)} className="py-2 px-4 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors">← Back</button>
            <button onClick={() => navigate("/library")} className="py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors" style={{ background: "#7c3aed" }}>Read Full Explanation →</button>
          </div>
        </motion.div>
      </DeckCardShell>
    );
  }

  if (section === "bootstrap") {
    return (
      <DeckCardShell>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col text-left px-1">
          <h2 className="flex items-center gap-2 mb-4 justify-center" style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "clamp(1.1rem, 4vw, 1.4rem)", fontWeight: 700, color: "#faf5eb" }}>
            <span style={{ color: "#8b5cf6" }}>🛡️</span> Patent-Backed Bootstrap
          </h2>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-sm leading-relaxed" style={{ color: "rgba(250,245,235,0.8)" }}>
              12 provisional patent applications. 2,224 innovations. ~2,393 formal claims. Started with $1,000. No burn rate. No investors to please. We control 100% — forever. And WE means YOU are ONE OF US. Every member has a voice. Your early contribution earns permanent credit through Ghost Attribution. The 300 founding members earn Joules — no VC means no dilution of YOUR participation.
            </p>
          </div>
          <div className="flex gap-3 mt-auto justify-center">
            <button onClick={() => navigate(-1)} className="py-2 px-4 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors">← Back</button>
            <button onClick={() => navigate("/library")} className="py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors" style={{ background: "#7c3aed" }}>Read Full Explanation →</button>
          </div>
        </motion.div>
      </DeckCardShell>
    );
  }

  if (section === "the-math") {
    return (
      <DeckCardShell>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col text-left px-1">
          <h2 className="flex items-center gap-2 mb-4 justify-center" style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "clamp(1.1rem, 4vw, 1.4rem)", fontWeight: 700, color: "#faf5eb" }}>
            <span style={{ color: "#8b5cf6" }}>🛡️</span> The Math
          </h2>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-sm leading-relaxed" style={{ color: "rgba(250,245,235,0.8)" }}>
              At Year 10, if we're worth $500M with VC money, we'd own ~$25M. Growing organically, even at half that valuation ($250M), we own ALL of it. Our patent portfolio IS our runway. Micro-entity filing at $65 per provisional. Your early contribution = permanent credit. No dilution. No exit pressure. No selling out.
            </p>
          </div>
          <div className="flex gap-3 mt-auto justify-center">
            <button onClick={() => navigate(-1)} className="py-2 px-4 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors">← Back</button>
            <button onClick={() => navigate("/library")} className="py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors" style={{ background: "#7c3aed" }}>Read Full Explanation →</button>
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
          <span style={{ color: "#8b5cf6" }}>🛡️</span> Why No V.C.?
        </h2>

        <div className="rounded-lg p-3 mb-2.5 cursor-pointer hover:brightness-110 transition-all" onClick={() => navigate("/why-no-vc/the-strings")} style={{ borderLeft: "3px solid #7c3aed", background: "rgba(124, 58, 237, 0.08)" }}>
          <p className="font-bold text-sm" style={{ color: "#faf5eb" }}>V.C. Money Comes With Strings</p>
          <p className="text-xs mt-1" style={{ color: "rgba(250,245,235,0.6)", lineHeight: 1.5 }}>
            10x return demands force unsustainable growth. Exit pressure = selling you in 5-7 years. Each round dilutes everyone.
          </p>
        </div>

        <div className="rounded-lg p-3 mb-2.5 cursor-pointer hover:brightness-110 transition-all" onClick={() => navigate("/why-no-vc/bootstrap")} style={{ borderLeft: "3px solid #38a169", background: "rgba(56, 161, 105, 0.08)" }}>
          <p className="font-bold text-sm" style={{ color: "#faf5eb" }}>Patent-Backed Bootstrap</p>
          <p className="text-xs mt-1" style={{ color: "rgba(250,245,235,0.6)", lineHeight: 1.5 }}>
            <span className="font-semibold" style={{ color: "#faf5eb" }}>12 provisionals, 2,224 innovations.</span> Started with $1K. No burn rate. We control 100% — forever. And WE means <span className="underline font-semibold" style={{ color: "#faf5eb" }}>YOU are ONE OF US</span>.
          </p>
        </div>

        <div className="rounded-lg p-3 mb-3 cursor-pointer hover:brightness-110 transition-all" onClick={() => navigate("/why-no-vc/the-math")} style={{ borderLeft: "3px solid #10b981", background: "rgba(16, 185, 129, 0.08)" }}>
          <p className="font-bold text-sm" style={{ color: "#faf5eb" }}>The Math</p>
          <p className="text-xs mt-1" style={{ color: "rgba(250,245,235,0.6)", lineHeight: 1.5 }}>
            VC at $500M, we'd own ~$25M. Organic at $250M, we own <span className="font-bold italic" style={{ color: "#faf5eb" }}>all of it</span>. Your early contribution = permanent credit.
          </p>
        </div>

        <div className="flex gap-3 mt-auto justify-center">
          <button onClick={() => navigate(-1)} className="py-2 px-4 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors">← Back</button>
          <button onClick={() => navigate("/library")} className="py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors" style={{ background: "#7c3aed" }}>Read Full Explanation →</button>
        </div>
      </motion.div>
    </DeckCardShell>
  );
};

export default WhyNoVC;
