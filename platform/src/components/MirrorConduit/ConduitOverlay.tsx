import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMirrorConduit } from "./MirrorContext";

export function ConduitOverlay() {
  const { isTraveling, travelDestination } = useMirrorConduit();

  return (
    <AnimatePresence>
      {isTraveling && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] pointer-events-none"
        >
          {/* Radial blur effect */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 2, opacity: 1 }}
            exit={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-radial from-amber-500/50 via-purple-500/30 to-transparent"
          />

          {/* Mirror shatter effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              animate={{ scale: [1, 1.5, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="relative"
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos((i * Math.PI) / 4) * 200,
                    y: Math.sin((i * Math.PI) / 4) * 200,
                    opacity: 0,
                    rotate: i * 45,
                  }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="absolute w-16 h-20 bg-gradient-to-br from-slate-400 to-slate-600 border border-slate-300"
                  style={{
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                  }}
                />
              ))}
              <span className="text-6xl">🪞</span>
            </motion.div>
          </div>

          {/* Tunnel effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, times: [0, 0.5, 1] }}
            className="absolute inset-0"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 2 + i * 0.5, opacity: [0, 0.5, 0] }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
                className="absolute inset-0 border-2 border-amber-400/30 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "100px",
                  height: "100px",
                }}
              />
            ))}
          </motion.div>

          {/* Destination text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-20 left-0 right-0 text-center"
          >
            <p className="text-amber-400 text-lg font-medium">
              Traveling through the conduit...
            </p>
            {travelDestination && (
              <p className="text-slate-400 text-sm mt-2">
                → {travelDestination.split(":")[0]}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConduitOverlay;
