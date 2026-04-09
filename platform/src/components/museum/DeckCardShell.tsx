/**
 * DeckCardShell — Shared card-back wrapper for submarine door pages.
 * Renders a 5:7 aspect-ratio "card back" with hex pattern,
 * corner art, and page-transition animation.
 *
 * Each submarine door page wraps its content in this shell
 * so the visual continuity with the HEOHO front card is preserved.
 */
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { MuseumShell } from "./MuseumShell";
import { useXRay } from "./XRayContext";

/** Hex SVG background */
const hexBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

const cardBg = "#0a1628";

interface DeckCardShellProps {
  children: ReactNode;
}

export function DeckCardShell({ children }: DeckCardShellProps) {
  const { xrayOn } = useXRay();

  return (
    <MuseumShell>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 pb-24 max-w-md mx-auto">
        <motion.div
          className="w-full max-w-sm mx-auto"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{ background: cardBg, aspectRatio: "5/7" }}
          >
            {/* Hex pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: hexBg, backgroundRepeat: "repeat", opacity: 0.03 }}
            />
            {/* Content */}
            <div className="relative z-10 flex flex-col p-5" style={{ aspectRatio: "5/7" }}>
              {children}
            </div>
            {/* Corner art */}
            <CornerArt xrayOn={xrayOn} />
          </div>
        </motion.div>
      </div>
    </MuseumShell>
  );
}

/** CornerArt — LB filigree with Frame Lock keyholes */
function CornerArt({ xrayOn }: { xrayOn: boolean }) {
  const corners: Array<{
    pos: string;
    rotate: string;
    level: number;
    shape: "circle" | "square" | "triangle";
  }> = [
    { pos: "top-2 left-2", rotate: "0", level: 1, shape: "circle" },
    { pos: "top-2 right-2", rotate: "90", level: 2, shape: "square" },
    { pos: "bottom-2 left-2", rotate: "270", level: 3, shape: "triangle" },
    { pos: "bottom-2 right-2", rotate: "180", level: 4, shape: "circle" },
  ];

  return (
    <>
      {corners.map((c) => (
        <div
          key={c.pos}
          className={`absolute ${c.pos} pointer-events-auto`}
          style={{
            width: "36px",
            height: "36px",
            cursor: `url('/cursors/key-${c.level}.png') 4 0, pointer`,
          }}
          title={`Frame Lock — Level ${c.level}`}
        >
          <svg
            viewBox="0 0 60 60"
            style={{ width: "100%", height: "100%", transform: `rotate(${c.rotate}deg)`, opacity: xrayOn ? 0.7 : 0.25, transition: "opacity 0.5s ease" }}
          >
            <path
              d="M2 2 C2 2, 2 20, 8 28 C12 33, 18 35, 28 35 M2 2 C2 2, 20 2, 28 8 C33 12, 35 18, 35 28"
              fill="none" stroke="#38a169" strokeWidth="1.5" strokeLinecap="round"
            />
            <path
              d="M6 6 C6 6, 6 14, 10 18 C13 21, 16 22, 22 22 M6 6 C6 6, 14 6, 18 10 C21 13, 22 16, 22 22"
              fill="none" stroke="#38a169" strokeWidth="1" strokeLinecap="round" opacity="0.6"
            />
            <text x="10" y="16" fill="#38a169" fontSize="7" fontFamily="'JetBrains Mono', monospace" fontWeight="700" opacity="0.5">
              LB
            </text>
            {c.shape === "circle" && (
              <circle cx="22" cy="22" r="3" fill={xrayOn ? "rgba(214,158,46,0.3)" : "none"} stroke={xrayOn ? "#d69e2e" : "#0a1628"} strokeWidth="1" opacity="0.8" style={{ transition: "all 0.5s ease" }} />
            )}
            {c.shape === "square" && (
              <rect x="19" y="19" width="6" height="6" fill={xrayOn ? "rgba(214,158,46,0.3)" : "none"} stroke={xrayOn ? "#d69e2e" : "#0a1628"} strokeWidth="1" opacity="0.8" style={{ transition: "all 0.5s ease" }} />
            )}
            {c.shape === "triangle" && (
              <polygon points="22,18 18.5,25 25.5,25" fill={xrayOn ? "rgba(214,158,46,0.3)" : "none"} stroke={xrayOn ? "#d69e2e" : "#0a1628"} strokeWidth="1" opacity="0.8" style={{ transition: "all 0.5s ease" }} />
            )}
          </svg>
        </div>
      ))}
    </>
  );
}

export default DeckCardShell;
