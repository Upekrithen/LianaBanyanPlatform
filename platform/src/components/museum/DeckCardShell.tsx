/**
 * DeckCardShell — Shared card-back wrapper for submarine door pages.
 * Renders a 5:7 aspect-ratio "card back" with hex pattern,
 * ornate corner art with Frame Lock keyholes, and X-Ray thermal effects.
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
            style={{
              background: cardBg,
              aspectRatio: "5/7",
              border: xrayOn
                ? "1px solid rgba(34, 211, 238, 0.25)"
                : "1px solid transparent",
              boxShadow: xrayOn
                ? "0 0 24px rgba(34, 211, 238, 0.08), inset 0 0 40px rgba(34, 211, 238, 0.03)"
                : "none",
              transition: "border-color 0.5s ease, box-shadow 0.5s ease",
            }}
          >
            {/* Hex pattern — brightens in X-Ray */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: hexBg,
                backgroundRepeat: "repeat",
                opacity: xrayOn ? 0.10 : 0.03,
                transition: "opacity 0.5s ease",
              }}
            />

            {/* X-Ray scan-line overlay */}
            {xrayOn && (
              <div
                className="absolute inset-0 pointer-events-none z-[15]"
                style={{
                  background:
                    "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(34,211,238,0.015) 3px, rgba(34,211,238,0.015) 4px)",
                  transition: "opacity 0.5s ease",
                }}
              />
            )}

            {/* Content */}
            <div className="relative z-10 flex flex-col p-5" style={{ aspectRatio: "5/7" }}>
              {children}
            </div>

            {/* Corner art — z-20 so it renders ABOVE content */}
            <OrnateCornerArt xrayOn={xrayOn} />
          </div>
        </motion.div>
      </div>
    </MuseumShell>
  );
}

/** OrnateCornerArt — Iron-bound filigree with LB monogram + Frame Lock keyholes */
function OrnateCornerArt({ xrayOn }: { xrayOn: boolean }) {
  const corners: Array<{
    pos: string;
    rotate: number;
    level: number;
    shape: "circle" | "square" | "triangle";
  }> = [
    { pos: "top-1 left-1", rotate: 0, level: 1, shape: "circle" },
    { pos: "top-1 right-1", rotate: 90, level: 2, shape: "square" },
    { pos: "bottom-1 left-1", rotate: 270, level: 3, shape: "triangle" },
    { pos: "bottom-1 right-1", rotate: 180, level: 4, shape: "circle" },
  ];

  const strokeColor = xrayOn ? "#22d3ee" : "#38a169";
  const strokeColorFaint = xrayOn ? "rgba(34,211,238,0.4)" : "rgba(56,161,105,0.35)";
  const keyholeStroke = xrayOn ? "#d69e2e" : "#0a1628";
  const keyholeFill = xrayOn ? "rgba(214,158,46,0.3)" : "none";
  const monoColor = xrayOn ? "rgba(34,211,238,0.6)" : "rgba(56,161,105,0.45)";
  const dotColor = xrayOn ? "rgba(34,211,238,0.35)" : "rgba(56,161,105,0.2)";

  return (
    <>
      {corners.map((c) => (
        <div
          key={c.pos}
          className={`absolute ${c.pos} z-20 pointer-events-auto`}
          style={{
            width: "52px",
            height: "52px",
            cursor: `url('/cursors/key-${c.level}.png') 4 0, pointer`,
          }}
          title={`Frame Lock — Level ${c.level}`}
        >
          <svg
            viewBox="0 0 80 80"
            style={{
              width: "100%",
              height: "100%",
              transform: `rotate(${c.rotate}deg)`,
              opacity: xrayOn ? 0.85 : 0.4,
              transition: "opacity 0.5s ease",
            }}
          >
            {/* Iron bracket L-shape */}
            <path
              d="M4 4 L4 32 Q4 36, 8 38 L16 40"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{ transition: "stroke 0.5s ease" }}
            />
            <path
              d="M4 4 L32 4 Q36 4, 38 8 L40 16"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{ transition: "stroke 0.5s ease" }}
            />

            {/* Inner filigree curves */}
            <path
              d="M8 8 C8 8, 8 20, 14 26 C18 30, 24 32, 34 34"
              fill="none"
              stroke={strokeColorFaint}
              strokeWidth="1.2"
              strokeLinecap="round"
              style={{ transition: "stroke 0.5s ease" }}
            />
            <path
              d="M8 8 C8 8, 20 8, 26 14 C30 18, 32 24, 34 34"
              fill="none"
              stroke={strokeColorFaint}
              strokeWidth="1.2"
              strokeLinecap="round"
              style={{ transition: "stroke 0.5s ease" }}
            />

            {/* Decorative scroll curves */}
            <path
              d="M6 18 Q10 22, 16 20 Q20 18, 18 14"
              fill="none"
              stroke={strokeColorFaint}
              strokeWidth="0.8"
              strokeLinecap="round"
              style={{ transition: "stroke 0.5s ease" }}
            />
            <path
              d="M18 6 Q22 10, 20 16 Q18 20, 14 18"
              fill="none"
              stroke={strokeColorFaint}
              strokeWidth="0.8"
              strokeLinecap="round"
              style={{ transition: "stroke 0.5s ease" }}
            />

            {/* Decorative dots along bracket */}
            <circle cx="4" cy="4" r="2" fill={dotColor} style={{ transition: "fill 0.5s ease" }} />
            <circle cx="4" cy="18" r="1.2" fill={dotColor} style={{ transition: "fill 0.5s ease" }} />
            <circle cx="18" cy="4" r="1.2" fill={dotColor} style={{ transition: "fill 0.5s ease" }} />
            <circle cx="12" cy="12" r="1" fill={dotColor} style={{ transition: "fill 0.5s ease" }} />

            {/* LB monogram */}
            <text
              x="14"
              y="24"
              fill={monoColor}
              fontSize="10"
              fontFamily="'Crimson Pro', Georgia, serif"
              fontWeight="700"
              style={{ transition: "fill 0.5s ease" }}
            >
              LB
            </text>

            {/* Keyhole shape at junction */}
            {c.shape === "circle" && (
              <circle
                cx="34" cy="34" r="4"
                fill={keyholeFill}
                stroke={keyholeStroke}
                strokeWidth="1.2"
                style={{ transition: "all 0.5s ease" }}
              />
            )}
            {c.shape === "square" && (
              <rect
                x="30" y="30" width="8" height="8" rx="1"
                fill={keyholeFill}
                stroke={keyholeStroke}
                strokeWidth="1.2"
                style={{ transition: "all 0.5s ease" }}
              />
            )}
            {c.shape === "triangle" && (
              <polygon
                points="34,28 28,38 40,38"
                fill={keyholeFill}
                stroke={keyholeStroke}
                strokeWidth="1.2"
                style={{ transition: "all 0.5s ease" }}
              />
            )}
          </svg>
        </div>
      ))}
    </>
  );
}

export default DeckCardShell;
