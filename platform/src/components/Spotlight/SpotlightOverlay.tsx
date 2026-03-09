import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpotlight, SPOTLIGHT_REGISTRY } from "./SpotlightContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function SpotlightOverlay() {
  const {
    currentSpotlight,
    dismissSpotlight,
    isMember,
  } = useSpotlight();

  const [targetPosition, setTargetPosition] = useState<SpotlightPosition | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const config = currentSpotlight ? SPOTLIGHT_REGISTRY[currentSpotlight] : null;

  useEffect(() => {
    if (!config) {
      setTargetPosition(null);
      return;
    }

    const findElement = () => {
      const element = document.querySelector(config.selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setTargetPosition(null);
      }
    };

    findElement();
    window.addEventListener("resize", findElement);
    window.addEventListener("scroll", findElement);

    return () => {
      window.removeEventListener("resize", findElement);
      window.removeEventListener("scroll", findElement);
    };
  }, [config]);

  const handleDismiss = () => {
    if (currentSpotlight) {
      dismissSpotlight(currentSpotlight, dontShowAgain);
      setDontShowAgain(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") {
      handleDismiss();
    }
  };

  useEffect(() => {
    if (currentSpotlight) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [currentSpotlight, dontShowAgain]);

  if (!currentSpotlight || !config) return null;

  const tooltipPosition = getTooltipPosition(targetPosition, config.position);

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999]"
        onClick={handleDismiss}
      >
        {/* Dark overlay with spotlight cutout */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetPosition && (
                <ellipse
                  cx={targetPosition.left + targetPosition.width / 2}
                  cy={targetPosition.top + targetPosition.height / 2}
                  rx={targetPosition.width / 2 + 20}
                  ry={targetPosition.height / 2 + 20}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Spotlight ring animation */}
        {targetPosition && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute pointer-events-none"
            style={{
              top: targetPosition.top - 20,
              left: targetPosition.left - 20,
              width: targetPosition.width + 40,
              height: targetPosition.height + 40,
            }}
          >
            <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-pulse" />
            <div className="absolute inset-2 rounded-full border border-amber-300/50" />
          </motion.div>
        )}

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bg-slate-900 border border-amber-500/50 rounded-lg shadow-2xl p-4 max-w-sm pointer-events-auto"
          style={tooltipPosition}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <h3 className="text-lg font-bold text-amber-400 mb-2 pr-6">
            {config.title}
          </h3>
          <p className="text-slate-200 mb-4">{config.message}</p>

          <div className="flex items-center justify-between gap-4">
            {isMember && (
              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                <Checkbox
                  checked={dontShowAgain}
                  onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                />
                Don't show again
              </label>
            )}

            <Button
              onClick={handleDismiss}
              className="ml-auto bg-amber-600 hover:bg-amber-500 text-white"
            >
              Got it →
            </Button>
          </div>

          {!isMember && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              Members can turn off spotlights
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function getTooltipPosition(
  target: SpotlightPosition | null,
  position: "top" | "bottom" | "left" | "right"
): React.CSSProperties {
  if (!target) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  const padding = 20;
  const tooltipWidth = 320;

  switch (position) {
    case "top":
      return {
        bottom: `calc(100% - ${target.top - padding}px)`,
        left: Math.max(padding, target.left + target.width / 2 - tooltipWidth / 2),
      };
    case "bottom":
      return {
        top: target.top + target.height + padding,
        left: Math.max(padding, target.left + target.width / 2 - tooltipWidth / 2),
      };
    case "left":
      return {
        top: target.top + target.height / 2,
        right: `calc(100% - ${target.left - padding}px)`,
        transform: "translateY(-50%)",
      };
    case "right":
      return {
        top: target.top + target.height / 2,
        left: target.left + target.width + padding,
        transform: "translateY(-50%)",
      };
    default:
      return {
        top: target.top + target.height + padding,
        left: Math.max(padding, target.left + target.width / 2 - tooltipWidth / 2),
      };
  }
}

export default SpotlightOverlay;
