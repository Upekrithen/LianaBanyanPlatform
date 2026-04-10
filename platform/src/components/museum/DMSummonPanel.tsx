/**
 * DMSummonPanel — DM sends summon pings to recruit crew (K384).
 * Wires into RADAR Ping system (K380) with ping_type "summon".
 * Integrates with Campaign Forge (K381) and Campaign Crew roster.
 *
 * Currently uses localStorage for demo; will wire to Supabase
 * radar_pings + campaign_crew tables once migrations are applied.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useXRay } from "./XRayContext";
import {
  Users, Send, Radio, Shield, Swords, Heart,
  Eye, Package, ChevronDown, UserPlus, X,
} from "lucide-react";

const CREW_ROLES = [
  { id: "adventurer", label: "Adventurer", icon: Swords, color: "#d4a855", desc: "The versatile explorer" },
  { id: "scout", label: "Scout", icon: Eye, color: "#4a90d9", desc: "Pathfinder and recon" },
  { id: "healer", label: "Healer", icon: Heart, color: "#27ae60", desc: "Keeps the crew alive" },
  { id: "sentinel", label: "Sentinel", icon: Shield, color: "#8b3a3a", desc: "Defensive specialist" },
  { id: "merchant", label: "Merchant", icon: Package, color: "#f39c12", desc: "Trade and supply" },
] as const;

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  joinedAt: string;
  status: "active" | "benched" | "departed";
}

export interface SummonPing {
  id: string;
  campaignId: string;
  campaignTitle: string;
  message: string;
  sentAt: string;
  respondedCount: number;
}

function getCrewForCampaign(campaignId: string): CrewMember[] {
  try {
    const raw = localStorage.getItem(`campaign_crew_${campaignId}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveCrewForCampaign(campaignId: string, crew: CrewMember[]) {
  localStorage.setItem(`campaign_crew_${campaignId}`, JSON.stringify(crew));
}

function getSummonHistory(campaignId: string): SummonPing[] {
  try {
    const raw = localStorage.getItem(`campaign_summons_${campaignId}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveSummonHistory(campaignId: string, pings: SummonPing[]) {
  localStorage.setItem(`campaign_summons_${campaignId}`, JSON.stringify(pings));
}

interface DMSummonPanelProps {
  campaignId: string;
  campaignTitle: string;
  maxCrew?: number;
  onCrewChange?: (crew: CrewMember[]) => void;
}

export function DMSummonPanel({
  campaignId,
  campaignTitle,
  maxCrew = 6,
  onCrewChange,
}: DMSummonPanelProps) {
  const { xrayOn } = useXRay();
  const [crew, setCrew] = useState<CrewMember[]>(() => getCrewForCampaign(campaignId));
  const [summons, setSummons] = useState<SummonPing[]>(() => getSummonHistory(campaignId));
  const [message, setMessage] = useState("");
  const [showRoster, setShowRoster] = useState(true);
  const [summonSent, setSummonSent] = useState(false);

  const accentColor = xrayOn ? "#22d3ee" : "#f97316";
  const summonColor = "#f97316";

  const sendSummon = useCallback(() => {
    const ping: SummonPing = {
      id: Math.random().toString(36).slice(2, 10),
      campaignId,
      campaignTitle,
      message: message || `${campaignTitle} needs crew!`,
      sentAt: new Date().toISOString(),
      respondedCount: 0,
    };
    const updated = [ping, ...summons];
    setSummons(updated);
    saveSummonHistory(campaignId, updated);
    setMessage("");
    setSummonSent(true);
    setTimeout(() => setSummonSent(false), 2000);

    const activeSummons = JSON.parse(localStorage.getItem("active_summons") || "[]");
    activeSummons.push({
      ...ping,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    localStorage.setItem("active_summons", JSON.stringify(activeSummons));
  }, [campaignId, campaignTitle, message, summons]);

  const removeCrew = useCallback(
    (memberId: string) => {
      const updated = crew.map((m) =>
        m.id === memberId ? { ...m, status: "departed" as const } : m,
      );
      setCrew(updated);
      saveCrewForCampaign(campaignId, updated);
      onCrewChange?.(updated);
    },
    [campaignId, crew, onCrewChange],
  );

  const activeCrew = crew.filter((m) => m.status === "active");

  return (
    <div className="flex flex-col gap-3">
      {/* Summon broadcast section */}
      <div
        className="rounded-lg p-3"
        style={{
          background: `${summonColor}08`,
          border: `1px solid ${summonColor}20`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-4 h-4" style={{ color: summonColor }} />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.08em",
              color: summonColor,
              fontWeight: 700,
            }}
          >
            DM SUMMONING PROTOCOL
          </span>
        </div>

        <div className="flex gap-2 mb-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Rally message (optional)..."
            className="flex-1 px-2 py-1.5 rounded text-xs"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${summonColor}20`,
              color: "rgba(250,245,235,0.7)",
              outline: "none",
              fontSize: "0.65rem",
            }}
          />
          <motion.button
            onClick={sendSummon}
            className="flex items-center gap-1 px-3 py-1.5 rounded"
            style={{
              background: `${summonColor}15`,
              border: `1px solid ${summonColor}40`,
              color: summonColor,
              fontSize: "0.65rem",
              fontFamily: "'JetBrains Mono', monospace",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Send className="w-3 h-3" />
            Summon
          </motion.button>
        </div>

        <AnimatePresence>
          {summonSent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 py-1"
            >
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: summonColor }}
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: 1 }}
              />
              <span style={{ fontSize: "0.55rem", color: summonColor, fontFamily: "'JetBrains Mono', monospace" }}>
                Summon broadcast sent via RADAR
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent summons */}
        {summons.length > 0 && (
          <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${summonColor}10` }}>
            <div style={{ fontSize: "0.5rem", color: "rgba(250,245,235,0.25)", marginBottom: 4 }}>
              Recent broadcasts:
            </div>
            {summons.slice(0, 3).map((s) => (
              <div key={s.id} className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: "0.5rem", color: "rgba(250,245,235,0.2)" }}>📡</span>
                <span style={{ fontSize: "0.5rem", color: "rgba(250,245,235,0.4)", flex: 1 }}>
                  {s.message}
                </span>
                <span style={{ fontSize: "0.45rem", color: "rgba(250,245,235,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {new Date(s.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crew roster */}
      <div
        className="rounded-lg p-3"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${accentColor}15`,
        }}
      >
        <button
          onClick={() => setShowRoster((r) => !r)}
          className="flex items-center justify-between w-full mb-2"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: accentColor }} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.05em",
                color: accentColor,
              }}
            >
              CREW ROSTER
            </span>
            <span
              style={{
                fontSize: "0.55rem",
                color: "rgba(250,245,235,0.3)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {activeCrew.length}/{maxCrew}
            </span>
          </div>
          <motion.div animate={{ rotate: showRoster ? 180 : 0 }}>
            <ChevronDown className="w-3 h-3" style={{ color: "rgba(250,245,235,0.3)" }} />
          </motion.div>
        </button>

        <AnimatePresence>
          {showRoster && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {activeCrew.length === 0 ? (
                <div
                  className="text-center py-3"
                  style={{ color: "rgba(250,245,235,0.3)", fontSize: "0.6rem" }}
                >
                  No crew yet. Send a summon to recruit adventurers.
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {activeCrew.map((member) => {
                    const role = CREW_ROLES.find((r) => r.id === member.role);
                    const Icon = role?.icon || Swords;
                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 p-2 rounded"
                        style={{
                          background: `${role?.color || accentColor}08`,
                          border: `1px solid ${role?.color || accentColor}15`,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: role?.color || accentColor }} />
                        <div className="flex-1 min-w-0">
                          <div style={{ fontSize: "0.6rem", color: "rgba(250,245,235,0.7)", fontWeight: 600 }}>
                            {member.name}
                          </div>
                          <div style={{ fontSize: "0.5rem", color: role?.color || accentColor }}>
                            {role?.label || member.role}
                          </div>
                        </div>
                        <button
                          onClick={() => removeCrew(member.id)}
                          className="p-1 rounded"
                          style={{ color: "rgba(250,245,235,0.2)" }}
                          title="Remove from crew"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * SummonNotification — Player-facing notification for incoming summons.
 * Appears as a floating toast when a DM broadcasts a summon ping.
 * Player can accept (choose role + join crew) or dismiss.
 */
interface SummonNotificationProps {
  campaignId: string;
  campaignTitle: string;
  message: string;
  onAccept: (role: string) => void;
  onDismiss: () => void;
}

export function SummonNotification({
  campaignTitle,
  message,
  onAccept,
  onDismiss,
}: SummonNotificationProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(10,22,40,0.95)",
        border: "1px solid rgba(249,115,22,0.3)",
        boxShadow: "0 8px 32px rgba(249,115,22,0.15), 0 0 60px rgba(249,115,22,0.05)",
        width: "min(340px, 90vw)",
      }}
    >
      {/* Header pulse */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          background: "rgba(249,115,22,0.08)",
          borderBottom: "1px solid rgba(249,115,22,0.15)",
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Radio className="w-4 h-4" style={{ color: "#f97316" }} />
        </motion.div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            color: "#f97316",
          }}
        >
          INCOMING SUMMON
        </span>
        <button onClick={onDismiss} className="ml-auto p-0.5">
          <X className="w-3.5 h-3.5" style={{ color: "rgba(250,245,235,0.3)" }} />
        </button>
      </div>

      <div className="p-3">
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(250,245,235,0.8)", marginBottom: 4, fontFamily: "'Crimson Pro', Georgia, serif" }}>
          {campaignTitle}
        </div>
        <div style={{ fontSize: "0.65rem", color: "rgba(250,245,235,0.5)", marginBottom: 8 }}>
          {message}
        </div>

        {!expanded ? (
          <div className="flex gap-2">
            <motion.button
              onClick={() => setExpanded(true)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg"
              style={{
                background: "rgba(249,115,22,0.12)",
                border: "1px solid rgba(249,115,22,0.35)",
                color: "#f97316",
                fontSize: "0.65rem",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus className="w-3.5 h-3.5" /> Join Crew
            </motion.button>
            <button
              onClick={onDismiss}
              className="px-3 py-2 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(250,245,235,0.08)",
                color: "rgba(250,245,235,0.4)",
                fontSize: "0.65rem",
              }}
            >
              Dismiss
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <div
              style={{
                fontSize: "0.55rem",
                color: "rgba(250,245,235,0.3)",
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 6,
              }}
            >
              CHOOSE YOUR ROLE
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {CREW_ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className="flex flex-col items-center py-2 px-1 rounded"
                    style={{
                      background: isSelected ? `${role.color}18` : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isSelected ? `${role.color}50` : "rgba(250,245,235,0.06)"}`,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Icon className="w-4 h-4 mb-1" style={{ color: role.color }} />
                    <span style={{ fontSize: "0.5rem", color: role.color, fontWeight: 600 }}>{role.label}</span>
                  </button>
                );
              })}
            </div>
            <motion.button
              onClick={() => selectedRole && onAccept(selectedRole)}
              className="w-full flex items-center justify-center gap-1 py-2 rounded-lg"
              style={{
                background: selectedRole ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${selectedRole ? "rgba(249,115,22,0.4)" : "rgba(250,245,235,0.08)"}`,
                color: selectedRole ? "#f97316" : "rgba(250,245,235,0.3)",
                fontSize: "0.65rem",
                fontFamily: "'JetBrains Mono', monospace",
                cursor: selectedRole ? "pointer" : "not-allowed",
              }}
              whileHover={selectedRole ? { scale: 1.02 } : {}}
              whileTap={selectedRole ? { scale: 0.98 } : {}}
            >
              <Swords className="w-3.5 h-3.5" />
              {selectedRole ? `Join as ${CREW_ROLES.find((r) => r.id === selectedRole)?.label}` : "Select a role"}
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * SummonFloatingAlert — Persistent floating notification for active summons.
 * Reads from localStorage active_summons and shows the latest one.
 */
export function SummonFloatingAlert() {
  const [activeSummon, setActiveSummon] = useState<SummonPing | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useState(() => {
    try {
      const raw = localStorage.getItem("active_summons");
      if (raw) {
        const summons = JSON.parse(raw) as (SummonPing & { expiresAt: string })[];
        const active = summons.filter((s) => new Date(s.expiresAt) > new Date());
        if (active.length > 0) setActiveSummon(active[active.length - 1]);
      }
    } catch { /* ignore */ }
  });

  const handleAccept = useCallback(
    (role: string) => {
      if (!activeSummon) return;
      const crew = JSON.parse(localStorage.getItem(`campaign_crew_${activeSummon.campaignId}`) || "[]");
      crew.push({
        id: Math.random().toString(36).slice(2, 10),
        name: `Crew Member ${crew.length + 1}`,
        role,
        joinedAt: new Date().toISOString(),
        status: "active",
      });
      localStorage.setItem(`campaign_crew_${activeSummon.campaignId}`, JSON.stringify(crew));
      setAccepted(true);
      setTimeout(() => setDismissed(true), 1500);
    },
    [activeSummon],
  );

  if (!activeSummon || dismissed) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <AnimatePresence>
        {accepted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="px-4 py-2 rounded-lg"
            style={{
              background: "rgba(39,174,96,0.15)",
              border: "1px solid rgba(39,174,96,0.4)",
              color: "#27ae60",
              fontSize: "0.7rem",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ✓ Joined crew!
          </motion.div>
        ) : (
          <SummonNotification
            campaignId={activeSummon.campaignId}
            campaignTitle={activeSummon.campaignTitle}
            message={activeSummon.message}
            onAccept={handleAccept}
            onDismiss={() => setDismissed(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default DMSummonPanel;
