/**
 * CANDLE BURST — Celebratory Visual Effect
 * ==========================================
 * Animated candle-lighting effect triggered when a user reaches
 * 20 meaningful engagement clicks (4 Locks) during an ATTI session.
 *
 * Innovation #1555: A.T.T.I. Campaign
 * "All That That Implies"
 */

import { useState, useEffect } from "react";
import { Flame, Sparkles, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialShareBar } from "@/components/atti/SocialShareBar";

interface CandleBurstProps {
  isActive: boolean;
  onDismiss: () => void;
  locksEarned: number;
  onRegister?: () => void;
}

export function CandleBurst({
  isActive,
  onDismiss,
  locksEarned,
  onRegister,
}: CandleBurstProps) {
  const [phase, setPhase] = useState<"enter" | "glow" | "exit">("enter");
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; size: number }>>([]);

  useEffect(() => {
    if (!isActive) {
      setPhase("enter");
      return;
    }

    // Generate random particles
    const newParticles = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      size: 0.5 + Math.random() * 1.5,
    }));
    setParticles(newParticles);

    // Phase transitions
    const glowTimer = setTimeout(() => setPhase("glow"), 500);
    const exitTimer = setTimeout(() => setPhase("exit"), 5000);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(exitTimer);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      {/* Dark overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 pointer-events-auto ${
          phase === "enter"
            ? "opacity-0"
            : phase === "glow"
            ? "opacity-100"
            : "opacity-0"
        }`}
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(251,191,36,0.15) 0%, rgba(0,0,0,0.7) 70%)" }}
        onClick={onDismiss}
      />

      {/* Rising particles (candle sparks) */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none"
          style={{
            left: `${p.x}%`,
            bottom: "-10px",
            animation: `candleRise ${3 + p.delay}s ease-out ${p.delay}s forwards`,
            opacity: 0,
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: `${p.size * 8}px`,
              height: `${p.size * 8}px`,
              background: `radial-gradient(circle, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.4) 70%)`,
              boxShadow: `0 0 ${p.size * 6}px rgba(251,191,36,0.5)`,
            }}
          />
        </div>
      ))}

      {/* Central content */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-auto transition-all duration-1000 ${
          phase === "enter"
            ? "opacity-0 scale-90"
            : phase === "glow"
            ? "opacity-100 scale-100"
            : "opacity-0 scale-110"
        }`}
      >
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          {/* Candle icon */}
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto animate-pulse">
              <Flame className="w-12 h-12 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
            </div>
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping" />
          </div>

          {/* Text */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              🕯️ Candle Burst!
            </h2>
            <p className="text-amber-200 text-lg">
              All That That Implies
            </p>
          </div>

          {/* Lock count */}
          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  i < locksEarned
                    ? "bg-amber-500 text-white shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                    : "bg-white/10 text-white/30"
                }`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <Key className="w-5 h-5" />
              </div>
            ))}
          </div>

          <p className="text-white/80 text-sm">
            You've earned {locksEarned} Locks with {locksEarned * 5} meaningful
            interactions. The platform is yours to explore.
          </p>

          {/* Share this moment */}
          <SocialShareBar
            moment="candle_burst"
            locksEarned={locksEarned}
            compact
            className="justify-center"
          />

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            {onRegister && (
              <Button
                onClick={onRegister}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Join the Platform
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onDismiss}
              className="text-white/70 hover:text-white"
            >
              Keep Exploring
            </Button>
          </div>
        </div>
      </div>

      {/* CSS Keyframe for particle animation */}
      <style>{`
        @keyframes candleRise {
          0% {
            opacity: 0;
            transform: translateY(0) scale(1);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-100vh) scale(0.3);
          }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCK INDICATOR — Small inline component for showing lock progress
// ═══════════════════════════════════════════════════════════════════════════════

interface LockProgressProps {
  clicks: number;
  locks: number;
  className?: string;
}

export function LockProgress({ clicks, locks, className = "" }: LockProgressProps) {
  const clicksToNextLock = 5 - (clicks % 5);
  const progress = ((clicks % 5) / 5) * 100;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Lock icons */}
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
              i < locks
                ? "bg-amber-500 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Key className="w-3 h-3" />
          </div>
        ))}
      </div>

      {/* Progress to next lock */}
      {locks < 4 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{clicksToNextLock} to next lock</span>
        </div>
      )}
    </div>
  );
}

export default CandleBurst;
