/**
 * Cast — The ensemble gallery of all Liana Banyan mascot characters.
 * ====================================================================
 * Pokédex-style page where users can meet the full cast on their own
 * terms. Click any character to see their bio, domain, and when
 * they'll show up. Host + 12 specialists + 4 specials = 16 characters.
 *
 * Route: /cast (museum portal)
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import {
  listMascots,
  type MascotDefinition,
} from "@/data/mascots";
import { Mascot } from "@/components/museum/Mascot";

const domainLabels: Record<string, string> = {
  host: "Host",
  why: "The Why",
  math: "The Math",
  mechanics: "The Mechanics",
  story: "The Story",
  governance: "The Rules",
  craft: "The Craft",
  community: "The People",
  trust: "Safety & Trust",
  money: "Real Money",
  discovery: "Finding Things",
  future: "The Roadmap",
  learning: "Teaching",
  ghost: "Ghost World",
  founder: "Founder Voice",
  historian: "The Museum",
  critic: "The Skeptic",
};

const Cast = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<MascotDefinition | null>(null);
  const all = listMascots();

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{
        background: "#0f172a",
        color: "#faf5eb",
        fontFamily: "'Source Sans 3', sans-serif",
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-800/50 transition-colors"
            style={{ color: "rgba(250,245,235,0.7)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1
            style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: 700,
              color: "#38a169",
            }}
          >
            The Cast
          </h1>
          <div style={{ width: 64 }} />
        </div>

        <p
          className="text-center mb-8 text-sm italic"
          style={{ color: "rgba(250,245,235,0.6)", maxWidth: "640px", margin: "0 auto 2rem" }}
        >
          The Little Red Hen hosts Liana Banyan. When she needs a deeper
          explanation, she brings in one of these specialists. Each one owns
          a <em>type</em> of knowledge — not a platform role. That's why the
          same character can show up in three different pipelines and it
          always makes sense.
        </p>

        {/* 4-column grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {all.map((m) => (
            <motion.button
              key={m.id}
              type="button"
              onClick={() => setSelected(m)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: "rgba(15, 23, 42, 0.6)",
                border: `1.5px solid ${
                  m.kind === "host"
                    ? "rgba(214, 158, 46, 0.45)"
                    : m.kind === "special"
                      ? "rgba(139, 92, 246, 0.35)"
                      : "rgba(56, 161, 105, 0.3)"
                }`,
              }}
            >
              <div className="flex items-start gap-3 mb-2">
                <Mascot
                  id={m.id}
                  size={56}
                  disableHover
                  respondToXRay={false}
                  hologramDelay={((all.indexOf(m) % 6) as 0 | 1 | 2 | 3 | 4 | 5)}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="font-bold text-sm leading-tight"
                    style={{ color: "#faf5eb" }}
                  >
                    {m.name}
                  </div>
                  <div
                    className="text-[11px] italic mt-0.5"
                    style={{ color: "rgba(56, 161, 105, 0.8)" }}
                  >
                    {m.title}
                  </div>
                </div>
              </div>
              <div
                className="text-[11px] leading-snug mt-2"
                style={{ color: "rgba(250,245,235,0.55)" }}
              >
                {m.oneLiner}
              </div>
              <div
                className="text-[10px] uppercase tracking-wider mt-2 font-semibold"
                style={{
                  color:
                    m.kind === "host"
                      ? "#d69e2e"
                      : m.kind === "special"
                        ? "#a78bfa"
                        : "#38a169",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {domainLabels[m.domain] ?? m.domain}
                {m.artStatus === "placeholder" && (
                  <span
                    className="ml-2 normal-case"
                    style={{ color: "rgba(250,245,235,0.35)" }}
                  >
                    · sketch
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Detail modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
              style={{ background: "rgba(0,0,0,0.75)" }}
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="rounded-2xl p-6 max-w-lg w-full relative"
                style={{
                  background: "rgba(15, 23, 42, 0.97)",
                  border: "1.5px solid rgba(56, 161, 105, 0.45)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 rounded-full p-1.5 transition-colors hover:bg-slate-800"
                  style={{ color: "rgba(250,245,235,0.7)" }}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4 mb-4">
                  <Mascot
                    id={selected.id}
                    size={96}
                    disableHover
                    respondToXRay={false}
                  />
                  <div className="flex-1 pt-1">
                    <h2
                      style={{
                        fontFamily: "'Crimson Pro', Georgia, serif",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#38a169",
                        lineHeight: 1.1,
                      }}
                    >
                      {selected.name}
                    </h2>
                    <div
                      className="text-sm italic mt-0.5"
                      style={{ color: "rgba(250,245,235,0.65)" }}
                    >
                      {selected.title}
                    </div>
                    <div
                      className="text-[11px] uppercase tracking-wider mt-2 font-semibold"
                      style={{
                        color: "#d69e2e",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      Domain: {domainLabels[selected.domain] ?? selected.domain}
                    </div>
                  </div>
                </div>

                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "#faf5eb" }}
                >
                  {selected.bio}
                </p>

                {selected.lrhIntro && (
                  <div
                    className="rounded-lg p-3 text-[12px] italic"
                    style={{
                      background: "rgba(214, 158, 46, 0.08)",
                      border: "1px solid rgba(214, 158, 46, 0.25)",
                      color: "rgba(250,245,235,0.75)",
                    }}
                  >
                    <span style={{ color: "#d69e2e", fontWeight: 600 }}>
                      LRH summons them like this:
                    </span>{" "}
                    <span>"{selected.lrhIntro}"</span>
                  </div>
                )}

                {selected.artStatus === "placeholder" && (
                  <div
                    className="mt-3 text-[10px] text-center italic"
                    style={{ color: "rgba(250,245,235,0.4)" }}
                  >
                    Art in progress — this character's final portrait is on
                    the way.
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Cast;
