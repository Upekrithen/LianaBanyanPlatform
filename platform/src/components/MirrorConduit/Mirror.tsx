import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMirrorConduit } from "./MirrorContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MirrorProps {
  location: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  glowColor?: string;
}

export function Mirror({
  location,
  className,
  size = "md",
  glowColor = "amber",
}: MirrorProps) {
  const navigate = useNavigate();
  const {
    getConduitByMirror,
    isConduitDiscovered,
    isConduitCompleted,
    discoverConduit,
    startTravel,
  } = useMirrorConduit();

  const [isHovered, setIsHovered] = useState(false);
  const [showRiddle, setShowRiddle] = useState(false);

  const conduit = getConduitByMirror(location);
  const isDiscovered = conduit ? isConduitDiscovered(conduit.id) : false;
  const isCompleted = conduit ? isConduitCompleted(conduit.id) : false;

  const sizeClasses = {
    sm: "w-12 h-16",
    md: "w-20 h-28",
    lg: "w-32 h-44",
  };

  const handleClick = () => {
    if (!conduit) {
      toast.info("This mirror awaits its match...");
      return;
    }

    if (!isDiscovered) {
      discoverConduit(conduit.id);
      toast.success("Mirror discovered! Find its match to complete the circuit.");
    }

    if (conduit.riddleClue && !isCompleted) {
      setShowRiddle(true);
      return;
    }

    const destination =
      conduit.mirrorALocation === location
        ? conduit.mirrorBLocation
        : conduit.mirrorALocation;

    const [page] = destination.split(":");
    startTravel(location, destination);

    setTimeout(() => {
      navigate(`/${page}`);
    }, 1500);
  };

  return (
    <>
      <motion.div
        className={cn(
          "relative cursor-pointer",
          sizeClasses[size],
          className
        )}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Mirror frame */}
        <div
          className={cn(
            "absolute inset-0 rounded-lg border-4",
            isCompleted
              ? "border-amber-400 shadow-amber-400/50"
              : "border-slate-600",
            "shadow-lg"
          )}
        />

        {/* Mirror surface */}
        <div
          className={cn(
            "absolute inset-1 rounded bg-gradient-to-br overflow-hidden",
            "from-slate-700 via-slate-600 to-slate-800"
          )}
        >
          {/* Reflection effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"
            animate={{
              opacity: isHovered ? 0.4 : 0.2,
            }}
          />

          {/* Glow effect when hovered */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "absolute inset-0",
                  `bg-${glowColor}-500/30`
                )}
              />
            )}
          </AnimatePresence>

          {/* Completed indicator */}
          {isCompleted && (
            <div className="absolute top-1 right-1">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
          )}

          {/* Mirror symbol */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl opacity-50">🪞</span>
          </div>
        </div>

        {/* Hover tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                {isCompleted
                  ? "Conduit Mastered"
                  : isDiscovered
                  ? "Find the match"
                  : "Touch to discover"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Riddle Dialog */}
      <AnimatePresence>
        {showRiddle && conduit?.riddleClue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setShowRiddle(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-amber-500/50 rounded-lg p-6 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <span className="text-4xl mb-4 block">🪞</span>
                <h3 className="text-lg font-medium text-amber-400 mb-4">
                  The Mirror Speaks...
                </h3>
                <p className="text-slate-300 italic mb-6">
                  "{conduit.riddleClue}"
                </p>
                <button
                  onClick={() => setShowRiddle(false)}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  Seek the answer...
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Mirror;
