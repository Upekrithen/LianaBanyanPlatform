/**
 * LRHGuide — Floating Action Button for the Little Red Hen mascot.
 * Bottom-RIGHT corner. Three visual states:
 *   1. Default: glasses down (lrh-default.png)
 *   2. Hover: binoculars up (lrh-hover.png)
 *   3. Clicked / X-ray ON: thermal vision (lrh-xray.png)
 */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MascotBubble } from "@/components/v2/mascot/MascotBubble";
import { motion, AnimatePresence } from "framer-motion";
import { useXRay } from "./XRayContext";

const contextMessages: Record<string, { title: string; message: string }> = {
  "/": {
    title: "Welcome!",
    message: "I'm the Little Red Hen. Tap any door to start your journey. Not sure? Start with \"What is this?\" — I'll walk you through it.",
  },
  "/explore": {
    title: "The Tour",
    message: "I'll show you the 5 most important things about Liana Banyan. It takes 90 seconds. Tap to advance at your own pace.",
  },
  "/browse": {
    title: "Ghost World",
    message: "You're browsing freely with Ghost Credits. Nothing is real yet — explore everything. When you're ready, join for $5/year.",
  },
  "/build": {
    title: "Six Pathways",
    message: "Pick the one that feels right. You can always switch later. Each pathway shows real progress — those bars fill as people join.",
  },
  "/join": {
    title: "The Deal",
    message: "$5 a year. You keep 83.3% of everything you earn. No hidden fees. No data harvesting. That's the whole pitch.",
  },
  "/library": {
    title: "Cephas Library",
    message: "455+ publications at three depths. Skim the stones, wade through the articles, or dive into full papers. Your choice.",
  },
};

export function LRHGuide() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { xrayOn, toggleXray, activePanel, setActivePanel } = useXRay();
  const location = useLocation();
  const navigate = useNavigate();

  const characterTeleported = xrayOn && activePanel !== null;

  const basePath = "/" + (location.pathname.split("/")[1] || "");
  const ctx = contextMessages[basePath] || contextMessages["/"];

  // Three states: default → hover → xray
  const imgSrc = xrayOn
    ? "/images/lrh-xray.png"
    : hovered
      ? "/images/lrh-hover.png"
      : "/images/lrh-default.png";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3"
          >
            <MascotBubble
              title={ctx.title}
              message={ctx.message}
              tail
              maxWidth={280}
            >
              <button
                onClick={() => navigate("/explore")}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 mt-1"
              >
                Take the 90-second tour →
              </button>
            </MascotBubble>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          if (characterTeleported) {
            setActivePanel(null);
          } else {
            toggleXray();
            setOpen(!open);
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 overflow-hidden"
        style={{
          background: characterTeleported
            ? "rgba(34, 211, 238, 0.15)"
            : xrayOn ? "rgba(56, 161, 105, 0.9)" : "rgba(214, 158, 46, 0.9)",
          boxShadow: xrayOn
            ? "0 4px 15px rgba(56, 161, 105, 0.3)"
            : "0 4px 15px rgba(214, 158, 46, 0.25)",
          border: characterTeleported ? "2px dashed rgba(34, 211, 238, 0.4)" : "none",
        }}
        aria-label={characterTeleported ? "Recall Little Red Hen" : "Toggle X-Ray Goggles"}
        title={characterTeleported ? "Click to recall LRH" : undefined}
      >
        <AnimatePresence mode="wait">
          {characterTeleported ? (
            <motion.span
              key="ghost"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-cyan-400/40 text-xs"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              ↩
            </motion.span>
          ) : (
            <motion.img
              key="lrh"
              src={imgSrc}
              alt="Little Red Hen"
              className="w-11 h-11 object-contain"
              style={{ marginTop: "2px" }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

export default LRHGuide;
