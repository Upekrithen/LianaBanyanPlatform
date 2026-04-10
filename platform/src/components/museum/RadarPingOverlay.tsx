/**
 * RadarPingOverlay — Visual ping display for the Archipelago map (K380).
 * Shows active pings as animated radar blips on the map.
 * Each ping type has a distinct visual:
 *   location  → green dot
 *   summon    → orange pulse
 *   alert     → red flash
 *   sos       → red rapid pulse
 *   rally     → gold expanding ring
 *   waypoint  → blue marker
 */
import { motion, AnimatePresence } from "framer-motion";

export interface RadarPing {
  id: string;
  ping_type: "location" | "summon" | "alert" | "sos" | "rally" | "waypoint";
  message?: string;
  island_slug?: string;
  map_x?: number;
  map_y?: number;
  sender_id: string;
  created_at: string;
  read_at?: string;
}

const PING_COLORS: Record<string, string> = {
  location: "#38a169",
  summon: "#f97316",
  alert: "#ef4444",
  sos: "#dc2626",
  rally: "#eab308",
  waypoint: "#3b82f6",
};

const PING_ICONS: Record<string, string> = {
  location: "📍",
  summon: "📡",
  alert: "⚠️",
  sos: "🆘",
  rally: "🏁",
  waypoint: "📌",
};

interface RadarPingOverlayProps {
  pings: RadarPing[];
  onPingClick?: (ping: RadarPing) => void;
}

export function RadarPingOverlay({ pings, onPingClick }: RadarPingOverlayProps) {
  return (
    <AnimatePresence>
      {pings.map((ping) => {
        if (ping.map_x == null || ping.map_y == null) return null;
        const color = PING_COLORS[ping.ping_type] || "#38a169";
        const icon = PING_ICONS[ping.ping_type] || "📍";
        const isUrgent = ping.ping_type === "sos" || ping.ping_type === "alert";

        return (
          <motion.button
            key={ping.id}
            className="absolute z-[6] flex flex-col items-center"
            style={{
              left: `${ping.map_x}%`,
              top: `${ping.map_y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => onPingClick?.(ping)}
            title={ping.message || ping.ping_type}
          >
            {/* Outer pulse */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 28,
                height: 28,
                border: `1.5px solid ${color}`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                scale: [1, 2, 2],
                opacity: [0.6, 0, 0],
              }}
              transition={{
                duration: isUrgent ? 1.2 : 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
            {/* Core */}
            <motion.div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 20,
                height: 20,
                background: `${color}30`,
                border: `1.5px solid ${color}`,
                boxShadow: `0 0 8px ${color}60`,
                fontSize: "0.6rem",
              }}
              animate={isUrgent ? { scale: [1, 1.2, 1] } : {}}
              transition={isUrgent ? { duration: 0.6, repeat: Infinity } : {}}
            >
              {icon}
            </motion.div>
            {/* Message label */}
            {ping.message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1 px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(10,10,10,0.85)",
                  border: `1px solid ${color}40`,
                  fontSize: "0.45rem",
                  color: "rgba(250,245,235,0.7)",
                  fontFamily: "'JetBrains Mono', monospace",
                  maxWidth: 80,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {ping.message}
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </AnimatePresence>
  );
}

/** Mini radar icon for the ping send button */
export function RadarSendButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full ${className}`}
      style={{
        background: "rgba(56, 161, 105, 0.1)",
        border: "1px solid rgba(56, 161, 105, 0.3)",
        color: "#38a169",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.6rem",
        letterSpacing: "0.05em",
      }}
      whileHover={{ scale: 1.05, borderColor: "rgba(56, 161, 105, 0.6)" }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        📡
      </motion.span>
      PING
    </motion.button>
  );
}

export default RadarPingOverlay;
