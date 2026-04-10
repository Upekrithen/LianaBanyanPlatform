/**
 * TourCompletionModal — Shown after all 7 islands flipped.
 * LRH congratulates, recaps skills, $5/year CTA → MembershipPage.
 * K358 / B092.
 */
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useArchipelagoTourSafe } from "@/contexts/ArchipelagoTourContext";

const SKILLS = [
  { island: "Harvest", skill: "Manufacturing", icon: "🌾" },
  { island: "Navigate", skill: "Sales", icon: "🧭" },
  { island: "Engineer", skill: "R&D", icon: "⚙️" },
  { island: "Battle", skill: "Competition", icon: "⚔️" },
  { island: "Seek", skill: "Quality", icon: "🔑" },
  { island: "Magic", skill: "Service", icon: "✨" },
  { island: "Train", skill: "Leadership", icon: "👑" },
];

export function TourCompletionModal() {
  const { showCompletion, dismissCompletion } = useArchipelagoTourSafe();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {showCompletion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1a0e04 0%, #0a1628 50%, #1a0e04 100%)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              boxShadow: "0 0 40px rgba(249, 115, 22, 0.15)",
            }}
          >
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h2
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "#f97316",
                  marginBottom: "0.5rem",
                }}
              >
                Tour Complete!
              </h2>
              <p style={{ color: "rgba(250,245,235,0.7)", fontSize: "0.8rem", lineHeight: 1.6 }}>
                You explored all seven islands of the Archipelago.
              </p>

              <div className="flex flex-wrap justify-center gap-2 my-4">
                {SKILLS.map((s) => (
                  <div
                    key={s.island}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                    style={{
                      background: "rgba(249, 115, 22, 0.08)",
                      border: "1px solid rgba(249, 115, 22, 0.2)",
                    }}
                  >
                    <span className="text-sm">{s.icon}</span>
                    <span style={{ fontSize: "0.65rem", color: "rgba(250,245,235,0.6)" }}>
                      {s.skill}
                    </span>
                  </div>
                ))}
              </div>

              <p
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#faf5eb",
                  margin: "1rem 0 0.5rem",
                }}
              >
                $5/year — that's it. Own your work.
              </p>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => navigate("/join")}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "#f97316",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                  }}
                >
                  Join for $5/year →
                </button>
                <button
                  onClick={dismissCompletion}
                  className="w-full py-2 text-xs transition-colors"
                  style={{ color: "rgba(250,245,235,0.4)" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.7)")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.4)")}
                >
                  Keep exploring
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TourCompletionModal;
