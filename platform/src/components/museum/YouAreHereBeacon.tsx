/**
 * YouAreHereBeacon — Pulsing "YOU ARE HERE" indicator for HexIsle.
 * Renders a concentric-ring radar pulse with text label.
 * Two modes:
 *   - "pin" (default): compact dot + label for map overlay
 *   - "welcome": larger greeting beacon for first-time arrival
 *
 * K379: Introduced as the universal location marker across the Museum.
 */
import { motion } from "framer-motion";

interface YouAreHereBeaconProps {
  mode?: "pin" | "welcome";
  label?: string;
  color?: string;
  className?: string;
}

export function YouAreHereBeacon({
  mode = "pin",
  label = "YOU ARE HERE",
  color = "#38a169",
  className = "",
}: YouAreHereBeaconProps) {
  const isWelcome = mode === "welcome";
  const size = isWelcome ? 80 : 32;

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${color}`, opacity: 0.3 }}
          animate={{ scale: [1, 1.8, 1.8], opacity: [0.4, 0, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
        />
        {/* Mid pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `1.5px solid ${color}`, opacity: 0.3 }}
          animate={{ scale: [1, 1.4, 1.4], opacity: [0.5, 0, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
        />
        {/* Core dot */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: isWelcome ? 24 : 10,
            height: isWelcome ? 24 : 10,
            background: color,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 ${isWelcome ? 20 : 8}px ${color}80`,
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {isWelcome && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 40,
              height: 40,
              border: `1px solid ${color}60`,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            {/* Orbiting pip */}
            <div
              className="absolute rounded-full"
              style={{
                width: 4,
                height: 4,
                background: color,
                top: -2,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          </motion.div>
        )}
      </div>
      {/* Label */}
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: isWelcome ? "0.65rem" : "0.5rem",
          letterSpacing: "0.12em",
          color,
          textShadow: "0 1px 6px rgba(0,0,0,0.8)",
          marginTop: isWelcome ? 8 : 4,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </motion.span>
    </div>
  );
}

export default YouAreHereBeacon;
