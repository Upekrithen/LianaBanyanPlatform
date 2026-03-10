/**
 * SNOW DOOR BEACONS — The Northern Path Map
 * ==========================================
 * Visual beacon chain from Founder's Keep to the Summit.
 * Each beacon shows its status (locked/active/completed).
 * Active beacon shows challenge + "Complete" button.
 * Chain completion reveals the Teleportation Deck Card.
 *
 * Snowflake visual: four corners of each beacon card
 * have tiny snowflake indicators that fill as you progress.
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Snowflake,
  Lock,
  CheckCircle2,
  ArrowDown,
  Sparkles,
  Zap,
  Award,
  Loader2,
  ExternalLink,
  MapPin,
} from "lucide-react";
import {
  type BeaconPoint,
  type BeaconProgress as BeaconProgressType,
  type TeleportationDeckCard,
  getBeaconPoints,
  getUserBeaconProgress,
  completeBeacon,
  getTeleportationCard,
  getChainProgress,
  BEACON_CHAIN,
} from "@/lib/beaconPoints";
import { toast } from "sonner";

// ─── Props ───

interface SnowDoorBeaconsProps {
  /** If true, the Snow Door has been unlocked (beacon 1 can be auto-completed) */
  snowDoorUnlocked?: boolean;
  className?: string;
}

// ─── Component ───

export default function SnowDoorBeacons({
  snowDoorUnlocked = false,
  className = "",
}: SnowDoorBeaconsProps) {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();

  const [beacons, setBeacons] = useState<BeaconPoint[]>([]);
  const [progress, setProgress] = useState<BeaconProgressType[]>([]);
  const [teleCard, setTeleCard] = useState<TeleportationDeckCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ─── Load data ───
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [beaconData, progressData, card] = await Promise.all([
          getBeaconPoints().catch(() => []),
          user ? getUserBeaconProgress().catch(() => []) : Promise.resolve([]),
          user ? getTeleportationCard().catch(() => null) : Promise.resolve(null),
        ]);
        setBeacons(beaconData);
        setProgress(progressData);
        setTeleCard(card);
      } catch (err) {
        console.error("Failed to load beacons:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  // ─── Auto-complete beacon 1 if Snow Door was just unlocked ───
  useEffect(() => {
    if (!snowDoorUnlocked || !user || beacons.length === 0) return;
    const firstBeacon = beacons.find((b) => b.beaconNumber === 1);
    if (!firstBeacon) return;
    const alreadyDone = progress.some(
      (p) => p.beaconId === firstBeacon.id && p.isCompleted,
    );
    if (alreadyDone) return;

    // Auto-complete beacon 1
    completeBeacon(firstBeacon.id, { auto: true, trigger: "snow_door_unlock" })
      .then((res) => {
        setProgress((prev) => [...prev, res.progress]);
        toast.success(
          `Beacon 1: ${firstBeacon.name} — Snowflake Key earned! +${res.joulesEarned} Joules`,
        );
      })
      .catch(() => {
        // Silently fail — they might have already completed it
      });
  }, [snowDoorUnlocked, user, beacons, progress]);

  // ─── Complete a beacon manually ───
  const handleComplete = async (beaconId: string) => {
    if (!user) {
      openOnboard({
        reason: "advance along the Northern Path and earn Snowflake Keys",
        actionLabel: "Join to Earn Keys",
      });
      return;
    }

    setCompletingId(beaconId);
    try {
      const res = await completeBeacon(beaconId, {
        manual: true,
        completedVia: "beacon_map",
      });
      setProgress((prev) => {
        const filtered = prev.filter((p) => p.beaconId !== beaconId);
        return [...filtered, res.progress];
      });

      if (res.isChainComplete && res.teleportationCard) {
        setTeleCard(res.teleportationCard);
        toast.success(
          "The Northern Path is complete! Teleportation Deck Card earned!",
          { duration: 5000 },
        );
      } else {
        const beacon = beacons.find((b) => b.id === beaconId);
        toast.success(
          `${beacon?.name || "Beacon"} complete! +${res.joulesEarned} Joules${
            res.marksEarned > 0 ? ` +${res.marksEarned} Marks` : ""
          }`,
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to complete beacon");
    } finally {
      setCompletingId(null);
    }
  };

  // ─── Derived state ───
  const completedIds = new Set(
    progress.filter((p) => p.isCompleted).map((p) => p.beaconId),
  );
  const chainInfo = getChainProgress(beacons, progress);

  // Determine which beacon is the "active" one (next to complete)
  const activeBeaconNumber = beacons.reduce((acc, b) => {
    if (completedIds.has(b.id) && b.beaconNumber >= acc) {
      return b.beaconNumber + 1;
    }
    return acc;
  }, 1);

  // Use static BEACON_CHAIN as fallback if beacons haven't loaded
  const displayBeacons =
    beacons.length > 0
      ? beacons
      : BEACON_CHAIN.map((b) => ({
          id: `static-${b.number}`,
          beaconNumber: b.number,
          name: b.name,
          description: "",
          icon: b.icon,
          challengeType: "",
          challengeDescription: b.challengeDescription,
          challengeRequirement: {},
          joulesReward: 0,
          marksReward: 0,
          snowflakeKeyName: null,
          latitudeHint: b.latitudeHint,
          loreText: null,
          isActive: true,
        }));

  // ═══════════════════════════════
  // RENDER
  // ═══════════════════════════════

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading the Northern Path...
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ═══ HEADER ═══ */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
          <Snowflake className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            The Northern Path
          </span>
          <Snowflake className="h-4 w-4 text-blue-400" />
        </div>
        <p className="text-xs text-muted-foreground">
          Seven beacons. Earn Snowflake Keys. Unlock teleportation.
        </p>
      </div>

      {/* ═══ PROGRESS BAR ═══ */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{chainInfo.completed}/{chainInfo.total} beacons</span>
          <span>{chainInfo.percentage}%</span>
        </div>
        <Progress value={chainInfo.percentage} className="h-2" />
      </div>

      {/* ═══ BEACON CHAIN ═══ */}
      <div className="space-y-1">
        {displayBeacons.map((beacon, index) => {
          const isCompleted = completedIds.has(beacon.id);
          const isActive = beacon.beaconNumber === activeBeaconNumber;
          const isLocked = beacon.beaconNumber > activeBeaconNumber;
          const isExpanded = expandedId === beacon.id;
          const isCompleting = completingId === beacon.id;

          return (
            <React.Fragment key={beacon.id}>
              {/* Connection line */}
              {index > 0 && (
                <div className="flex justify-center">
                  <div
                    className={`w-0.5 h-6 ${
                      isCompleted || isActive
                        ? "bg-blue-400"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  />
                </div>
              )}

              {/* Beacon card */}
              <Card
                className={`transition-all cursor-pointer ${
                  isCompleted
                    ? "border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10"
                    : isActive
                      ? "border-blue-500/40 bg-blue-50/30 dark:bg-blue-950/20 shadow-md ring-1 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 opacity-60"
                }`}
                onClick={() =>
                  setExpandedId(isExpanded ? null : beacon.id)
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Status icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                        isCompleted
                          ? "bg-emerald-500/20"
                          : isActive
                            ? "bg-blue-500/20 animate-pulse"
                            : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : isLocked ? (
                        <Lock className="h-4 w-4 text-slate-400" />
                      ) : (
                        <span>{beacon.icon}</span>
                      )}
                    </div>

                    {/* Beacon info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-semibold text-sm ${
                            isLocked
                              ? "text-slate-400"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {beacon.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            isCompleted
                              ? "border-emerald-500/30 text-emerald-600"
                              : isActive
                                ? "border-blue-500/30 text-blue-600"
                                : ""
                          }`}
                        >
                          {beacon.latitudeHint || `Beacon ${beacon.beaconNumber}`}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {beacon.challengeDescription}
                      </p>
                    </div>

                    {/* Rewards badges */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {beacon.joulesReward > 0 && (
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[9px]">
                          <Zap className="h-2.5 w-2.5 mr-0.5" />
                          {beacon.joulesReward}J
                        </Badge>
                      )}
                      {beacon.marksReward > 0 && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px]">
                          <Award className="h-2.5 w-2.5 mr-0.5" />
                          {beacon.marksReward}M
                        </Badge>
                      )}
                      {isCompleted && beacon.snowflakeKeyName && (
                        <Snowflake className="h-3.5 w-3.5 text-blue-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Description */}
                      {beacon.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                          {beacon.description}
                        </p>
                      )}

                      {/* Lore text */}
                      {beacon.loreText && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                          {beacon.loreText}
                        </p>
                      )}

                      {/* Snowflake Key */}
                      {beacon.snowflakeKeyName && (
                        <div className="flex items-center gap-2 text-xs">
                          <Snowflake className="h-3.5 w-3.5 text-blue-400" />
                          <span
                            className={
                              isCompleted
                                ? "text-blue-600 font-medium"
                                : "text-muted-foreground"
                            }
                          >
                            {isCompleted ? "Earned: " : "Earn: "}
                            {beacon.snowflakeKeyName}
                          </span>
                        </div>
                      )}

                      {/* Action button for active beacon */}
                      {isActive && !isCompleted && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComplete(beacon.id);
                          }}
                          disabled={isCompleting}
                          className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white w-full"
                        >
                          {isCompleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <MapPin className="h-3.5 w-3.5" />
                          )}
                          {isCompleting
                            ? "Completing..."
                            : `Complete: ${beacon.challengeDescription}`}
                        </Button>
                      )}

                      {/* Completed badge */}
                      {isCompleted && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Beacon complete
                          {progress.find((p) => p.beaconId === beacon.id)
                            ?.completedAt && (
                            <span className="text-muted-foreground">
                              ·{" "}
                              {new Date(
                                progress.find(
                                  (p) => p.beaconId === beacon.id,
                                )!.completedAt!,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Locked message */}
                      {isLocked && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Lock className="h-3.5 w-3.5" />
                          Complete Beacon {beacon.beaconNumber - 1} to unlock
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </React.Fragment>
          );
        })}
      </div>

      {/* ═══ TELEPORTATION DECK CARD ═══ */}
      {teleCard ? (
        <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 mt-6">
          <CardContent className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {teleCard.cardName}
            </h3>
            <Badge className="mt-1 bg-purple-500/10 text-purple-600 border-purple-500/20">
              {teleCard.cardTier} Deck Card
            </Badge>
            <p className="text-sm text-muted-foreground mt-3">
              Fast-travel to any beacon on the Northern Path. The wind carries you.
            </p>
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
              <span>{teleCard.beaconsCompleted} beacons complete</span>
              <span>·</span>
              <span>{teleCard.totalUses} uses</span>
            </div>
          </CardContent>
        </Card>
      ) : chainInfo.completed > 0 && chainInfo.completed < chainInfo.total ? (
        /* Teaser for incomplete chain */
        <div className="text-center mt-4 p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
          <Sparkles className="h-5 w-5 mx-auto text-purple-400 mb-2" />
          <p className="text-xs text-muted-foreground">
            Complete all 7 beacons to earn the{" "}
            <span className="text-purple-600 font-medium">
              Teleportation Deck Card
            </span>
            — permanent fast-travel across the platform.
          </p>
        </div>
      ) : null}
    </div>
  );
}
