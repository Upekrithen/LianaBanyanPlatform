/**
 * MuseumShell — Full-viewport wrapper with zero chrome.
 * No nav bar. No sidebar. No hamburger. Just content + two FABs.
 * LRH bottom-right, Cephas bottom-left.
 * When X-Ray Goggles are ON: cyan tint overlay, hex pattern brightens,
 * XRayPanel annotations appear with connecting lines.
 */
import { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { LRHGuide } from "./LRHGuide";
import { CephasFAB } from "./CephasFAB";
import { XRayPanel } from "./XRayPanel";
import { useXRay } from "./XRayContext";
import { MUSEUM_HOME_ANNOTATIONS } from "./xrayAnnotations";

interface MuseumShellProps {
  children: ReactNode;
  /** Hide the FABs (e.g. during guided tour when LRH is inline) */
  hideFabs?: boolean;
}

/** Muted hex SVG background — warm gold-tinted green */
const hexBgCss = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%232d8a5e' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export function MuseumShell({ children, hideFabs = false }: MuseumShellProps) {
  const { xrayOn, toggleXray } = useXRay();

  return (
    <div
      className="min-h-screen text-slate-100 relative overflow-x-hidden"
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #0d1f3c 100%)" }}
    >
      {/* Hex pattern overlay — brightens in X-Ray mode */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
        style={{ backgroundImage: hexBgCss, backgroundRepeat: "repeat", opacity: xrayOn ? 0.12 : 0.02 }}
      />

      {/* X-Ray cyan tint overlay */}
      {xrayOn && (
        <div
          className="fixed inset-0 pointer-events-none z-[5] transition-opacity duration-500"
          style={{ background: "rgba(34, 211, 238, 0.04)" }}
        />
      )}

      {/* X-Ray mode indicator — clickable to toggle OFF */}
      {xrayOn && (
        <button
          onClick={() => toggleXray()}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full cursor-pointer transition-all duration-200 hover:scale-105"
          style={{
            background: "rgba(34, 211, 238, 0.15)",
            border: "1px solid rgba(34, 211, 238, 0.3)",
          }}
          title="Click to turn off X-Ray Goggles"
        >
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#22d3ee", letterSpacing: "0.1em" }}>
            X-RAY GOGGLES ON
          </span>
        </button>
      )}

      {/* X-Ray annotation panels */}
      <AnimatePresence>
        {xrayOn && MUSEUM_HOME_ANNOTATIONS.map((ann, i) => (
          <XRayPanel key={ann.id} annotation={ann} index={i} />
        ))}
      </AnimatePresence>

      <div className="relative z-10">
        {children}
      </div>
      {!hideFabs && (
        <>
          <LRHGuide />
          <CephasFAB />
        </>
      )}
    </div>
  );
}

export default MuseumShell;
