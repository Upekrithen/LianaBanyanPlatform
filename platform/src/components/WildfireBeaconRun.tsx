/**
 * WILDFIRE BEACON RUN SYSTEM
 * ==========================
 * Auto-navigating beacon runs that take users through platform pathways.
 * 
 * Features:
 * - Wildfire Mode: Auto-navigate through nodes with configurable timing
 * - Tourist Stop (30 seconds): Pause at each node to explore
 * - On-Resume Mode: Manual advancement between nodes
 * - Magic Carpet Rides: Unlock with Golden Keys (5 per stop)
 * - Red Carpet Rider: Full access to all stop modes
 * - Power User: Mix/match stop modes per node
 * 
 * Each pathway has decision point nodes (e.g., Business = 9 nodes)
 * To unlock Magic Carpet for a 9-stop run = 45 Golden Keys required
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMockData } from "@/contexts/MockDataProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createEvent, updateEvent } from "@/lib/calendarService";
import { extendScenarioPersistence } from "@/lib/beaconPoints";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Flame,
  Play,
  Pause,
  SkipForward,
  Timer,
  MapPin,
  Key,
  Crown,
  Plane,
  Eye,
  Lock,
  Unlock,
  CheckCircle,
  ArrowRight,
  Settings,
  Sparkles,
  Ghost,
  Compass,
  GitBranch,
} from "lucide-react";
import { ContingencyOperatorDialog } from "@/components/contingency/ContingencyOperatorDialog";
import { WhatIfButton } from "@/components/wildfire/WhatIfButton";
import { BeaconRunEndChoices } from "@/components/wildfire/BeaconRunEndChoices";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BeaconNode {
  id: string;
  order: number;
  title: string;
  description: string;
  route: string;
  duration?: number; // seconds to auto-advance (wildfire mode)
  learningLink?: string; // Cephas link to earn Golden Keys
  goldenKeysReward?: number; // Keys earned by completing learning
}

export interface WildfireRun {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: "business" | "initiatives" | "onboarding" | "governance" | "creative" | "custom" | "level-1";
  nodes: BeaconNode[];
  totalNodes: number;
  goldenKeysRequired: number; // 5 per node for Magic Carpet
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  estimatedMinutes: number;
  icon: string;
  interestKey?: string; // Maps to interestMockDataMap for CO integration
}

export type StopMode = "wildfire" | "tourist" | "on-resume" | "custom";

interface NodeStopConfig {
  nodeId: string;
  mode: StopMode;
  customDuration?: number;
}

interface RunState {
  currentNodeIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  startedAt: string | null;
  completedNodes: string[];
  elapsedSeconds: number;
  stopMode: StopMode;
  nodeConfigs: NodeStopConfig[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_WILDFIRE_DURATION = 5; // seconds per node in wildfire mode
const TOURIST_STOP_DURATION = 30; // seconds for tourist stops
const GOLDEN_KEYS_PER_STOP = 5;
const POWER_USER_KEYS_THRESHOLD = 50; // Golden Keys needed for Power User mode

const STOP_MODE_CONFIG = {
  wildfire: {
    name: "Wildfire",
    description: "Auto-advance every 5 seconds",
    icon: Flame,
    color: "text-orange-500",
    requiresAccess: false,
  },
  tourist: {
    name: "Tourist Stop",
    description: "30-second pause at each stop",
    icon: Eye,
    color: "text-blue-500",
    requiresAccess: true, // Red Carpet Rider or Power User
  },
  "on-resume": {
    name: "On Resume",
    description: "Manual advancement only",
    icon: Pause,
    color: "text-purple-500",
    requiresAccess: true,
  },
  custom: {
    name: "Power User",
    description: "Mix and match per node (50+ Golden Keys)",
    icon: Settings,
    color: "text-amber-500",
    requiresAccess: true, // Requires 50+ Golden Keys or Red Carpet Rider
    requiresPowerUser: true, // Special flag for Power User tier
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

function useRedCarpetStatus() {
  const { user } = useAuth();
  
  const { data: isRedCarpetRider } = useQuery({
    queryKey: ["red-carpet-status", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("profiles")
        .select("red_carpet_rider")
        .eq("id", user.id)
        .single();
      if (error) return false;
      return data?.red_carpet_rider === true;
    },
    enabled: !!user,
  });

  return isRedCarpetRider ?? false;
}

function useGoldenKeys() {
  const { user } = useAuth();
  
  const { data: goldenKeys } = useQuery({
    queryKey: ["golden-keys", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from("profiles")
        .select("golden_keys")
        .eq("id", user.id)
        .single();
      if (error) return 0;
      return data?.golden_keys ?? 0;
    },
    enabled: !!user,
  });

  return goldenKeys ?? 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface WildfireBeaconRunProps {
  run: WildfireRun;
  onComplete?: (elapsedSeconds: number) => void;
  onNodeVisit?: (node: BeaconNode, index: number) => void;
  onPickNewInterest?: () => void;
  onGoDeeper?: () => void;
  onContinueTrack?: () => void;
  hasNextRun?: boolean;
}

export function WildfireBeaconRun({ run, onComplete, onNodeVisit, onPickNewInterest, onGoDeeper, onContinueTrack, hasNextRun }: WildfireBeaconRunProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRedCarpetRider = useRedCarpetStatus();
  const goldenKeys = useGoldenKeys();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const calendarEventIdRef = useRef<string | null>(null);

  // Mock Data (Contingency Operators integration)
  const mockData = useMockData();

  const [state, setState] = useState<RunState>({
    currentNodeIndex: 0,
    isRunning: false,
    isPaused: false,
    startedAt: null,
    completedNodes: [],
    elapsedSeconds: 0,
    stopMode: "wildfire",
    nodeConfigs: [],
  });

  const [nodeCountdown, setNodeCountdown] = useState(0);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [showCoDialog, setShowCoDialog] = useState(false);
  const [showEndChoices, setShowEndChoices] = useState(false);
  const [showPostUpdatePrompt, setShowPostUpdatePrompt] = useState(false);

  const currentNode = run.nodes[state.currentNodeIndex];
  const progress = ((state.currentNodeIndex + 1) / run.totalNodes) * 100;
  
  // Access tier checks
  const isPowerUser = goldenKeys >= POWER_USER_KEYS_THRESHOLD;
  const canUsePremiumModes = isRedCarpetRider || goldenKeys >= run.goldenKeysRequired;
  const canUsePowerUserMode = isRedCarpetRider || isPowerUser;

  // Check if Magic Carpet is unlocked for this run
  const magicCarpetUnlocked = goldenKeys >= run.goldenKeysRequired;

  // Get duration for current node based on mode
  const getNodeDuration = useCallback((nodeIndex: number): number => {
    const nodeConfig = state.nodeConfigs.find(c => c.nodeId === run.nodes[nodeIndex]?.id);
    
    if (nodeConfig?.mode === "custom" && nodeConfig.customDuration) {
      return nodeConfig.customDuration;
    }
    
    switch (state.stopMode) {
      case "wildfire":
        return run.nodes[nodeIndex]?.duration ?? DEFAULT_WILDFIRE_DURATION;
      case "tourist":
        return TOURIST_STOP_DURATION;
      case "on-resume":
        return Infinity; // Manual only
      case "custom":
        return nodeConfig?.customDuration ?? DEFAULT_WILDFIRE_DURATION;
      default:
        return DEFAULT_WILDFIRE_DURATION;
    }
  }, [state.stopMode, state.nodeConfigs, run.nodes]);

  // Navigate to current node
  const navigateToNode = useCallback((nodeIndex: number) => {
    const node = run.nodes[nodeIndex];
    if (!node) return;

    onNodeVisit?.(node, nodeIndex);
    navigate(node.route);
    
    const duration = getNodeDuration(nodeIndex);
    setNodeCountdown(duration === Infinity ? 0 : duration);
  }, [run.nodes, navigate, onNodeVisit, getNodeDuration]);

  // Handle CO dialog interactions
  const handleCoApply = useCallback(() => {
    mockData.applyChanges();
    setShowCoDialog(false);
    setShowPostUpdatePrompt(true);
    toast.success("Showcase updated with your custom numbers!", {
      icon: "✨",
    });
  }, [mockData]);

  const handleCoRestart = useCallback(() => {
    mockData.resetAndRestart();
    setShowCoDialog(false);
    // Restart the run from the beginning
    setState(prev => ({
      ...prev,
      currentNodeIndex: 0,
      completedNodes: [],
      elapsedSeconds: 0,
    }));
    navigateToNode(0);
    toast.success("Restarting showcase with your custom numbers!", {
      icon: "🔄",
    });
  }, [mockData, navigateToNode]);

  // Handle restart request from context
  useEffect(() => {
    if (mockData.restartRequested && state.isRunning) {
      setState(prev => ({
        ...prev,
        currentNodeIndex: 0,
        completedNodes: [],
        elapsedSeconds: 0,
      }));
      navigateToNode(0);
      mockData.clearRestartRequest();
    }
  }, [mockData.restartRequested, state.isRunning, navigateToNode, mockData]);

  // Advance to next node
  const advanceToNextNode = useCallback(() => {
    if (state.currentNodeIndex >= run.totalNodes - 1) {
      setState(prev => ({ ...prev, isRunning: false }));
      setShowEndChoices(true);
      onComplete?.(state.elapsedSeconds);
      toast.success(`🎉 Wildfire Run Complete! Time: ${formatTime(state.elapsedSeconds)}`);

      // Extend ghost scenario persistence on run completion
      if (user) {
        extendScenarioPersistence(user.id)
          .then(({ extended, hoursAdded }) => {
            if (extended > 0) {
              toast.info(`📊 ${extended} saved scenario${extended > 1 ? 's' : ''} extended by ${hoursAdded}h`);
            }
          })
          .catch(() => {});
      }

      // Update the start calendar event with end_time + stats
      if (user && calendarEventIdRef.current) {
        updateEvent(calendarEventIdRef.current, {
          end_time: new Date().toISOString(),
        }).catch(() => {});
        calendarEventIdRef.current = null;
      }
      return;
    }

    const nextIndex = state.currentNodeIndex + 1;
    setState(prev => ({
      ...prev,
      currentNodeIndex: nextIndex,
      completedNodes: [...prev.completedNodes, currentNode.id],
    }));
    navigateToNode(nextIndex);
  }, [state.currentNodeIndex, state.elapsedSeconds, run.totalNodes, currentNode, navigateToNode, onComplete]);

  // Start the run
  const startRun = () => {
    if (run.interestKey) {
      mockData.loadMockData(run.interestKey, run.name);
    }

    const startedAt = new Date().toISOString();
    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      startedAt,
    }));
    setShowEndChoices(false);
    navigateToNode(0);
    toast.success(`🔥 Wildfire Run Started: ${run.name}`);

    // Calendar event for logged-in users only
    if (user) {
      createEvent({
        owner_id: user.id,
        calendar_type: 'personal',
        title: `Wildfire Tour: ${run.name}`,
        description: `${run.category} tour — ${run.totalNodes} stops`,
        start_time: startedAt,
        end_time: null,
        all_day: false,
        recurrence_rule: null,
        location: null,
        color: '#f97316',
        source_type: 'beacon',
        source_id: `wildfire_${run.id || run.name}`,
        is_private: false,
        metadata: { run_name: run.name, mode: state.stopMode, total_nodes: run.totalNodes },
      }).then(evt => { calendarEventIdRef.current = evt.id; })
        .catch(() => { /* non-critical */ });
    }
  };

  // Pause/Resume
  const togglePause = () => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  // Skip to next (manual advance)
  const skipToNext = () => {
    advanceToNextNode();
  };

  // Timer effect for elapsed time
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isRunning, state.isPaused]);

  // Countdown effect for auto-advance
  useEffect(() => {
    if (state.isRunning && !state.isPaused && state.stopMode !== "on-resume") {
      countdownRef.current = setInterval(() => {
        setNodeCountdown(prev => {
          if (prev <= 1) {
            advanceToNextNode();
            return getNodeDuration(state.currentNodeIndex + 1);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [state.isRunning, state.isPaused, state.stopMode, state.currentNodeIndex, advanceToNextNode, getNodeDuration]);

  // Change stop mode
  const setStopMode = (mode: StopMode) => {
    const config = STOP_MODE_CONFIG[mode];
    
    // Power User mode requires 50+ Golden Keys or Red Carpet Rider
    if ((config as any).requiresPowerUser && !canUsePowerUserMode) {
      setShowUnlockDialog(true);
      return;
    }
    
    // Other premium modes require run-specific Golden Keys or Red Carpet Rider
    if (config.requiresAccess && !canUsePremiumModes) {
      setShowUnlockDialog(true);
      return;
    }
    
    setState(prev => ({ ...prev, stopMode: mode }));
    setShowModeSelector(false);
  };

  return (
    <>
      {/* Floating Run Controller */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <Card className="border-2 border-orange-500/50 bg-background/95 backdrop-blur shadow-xl">
          <CardContent className="p-4">
            {!state.isRunning ? (
              // Pre-run state
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{run.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {run.totalNodes} stops • ~{run.estimatedMinutes} min
                    </p>
                  </div>
                </div>

                {/* Mode Selection */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Mode:</span>
                  <Select value={state.stopMode} onValueChange={(v) => setStopMode(v as StopMode)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STOP_MODE_CONFIG).map(([key, config]) => {
                        const isPowerUserMode = (config as any).requiresPowerUser;
                        const isLocked = isPowerUserMode 
                          ? !canUsePowerUserMode 
                          : (config.requiresAccess && !canUsePremiumModes);
                        
                        return (
                          <SelectItem 
                            key={key} 
                            value={key}
                            disabled={isLocked}
                          >
                            <div className="flex items-center gap-2">
                              <config.icon className={`w-4 h-4 ${config.color}`} />
                              <span>{config.name}</span>
                              {isLocked && (
                                <Lock className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Golden Keys Status */}
                {!magicCarpetUnlocked && (
                  <div className="flex items-center gap-2 text-sm">
                    <Key className="w-4 h-4 text-amber-500" />
                    <span className="text-muted-foreground">
                      {goldenKeys}/{run.goldenKeysRequired} keys for Magic Carpet
                    </span>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto text-amber-500"
                      onClick={() => setShowUnlockDialog(true)}
                    >
                      Earn Keys
                    </Button>
                  </div>
                )}

                {isRedCarpetRider ? (
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/30">
                    <Crown className="w-3 h-3 mr-1" />
                    Red Carpet Rider — All Modes Unlocked
                  </Badge>
                ) : isPowerUser ? (
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                    <Settings className="w-3 h-3 mr-1" />
                    Power User — Mix/Match Mode Unlocked
                  </Badge>
                ) : null}

                <Button onClick={startRun} className="w-full gap-2 bg-orange-500 hover:bg-orange-600">
                  <Flame className="w-4 h-4" />
                  Start Wildfire Run
                </Button>
              </div>
            ) : (
              // Active run state
              <div className="space-y-3">
                {/* Progress */}
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Stop {state.currentNodeIndex + 1} of {run.totalNodes}</span>
                      <span className="font-mono">{formatTime(state.elapsedSeconds)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>

                {/* Current Node */}
                <div className="p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">{currentNode?.title}</span>
                  </div>
                  {state.stopMode !== "on-resume" && nodeCountdown > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Timer className="w-3 h-3" />
                      Next in {nodeCountdown}s
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePause}
                    className="flex-1"
                  >
                    {state.isPaused ? (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={skipToNext}
                    disabled={state.currentNodeIndex >= run.totalNodes - 1}
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    Skip
                  </Button>
                </div>

                {/* Mode indicator */}
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  {(() => {
                    const config = STOP_MODE_CONFIG[state.stopMode];
                    const Icon = config.icon;
                    return (
                      <>
                        <Icon className={`w-3 h-3 ${config.color}`} />
                        <span>{config.name} Mode</span>
                      </>
                    );
                  })()}
                  {run.interestKey && mockData.currentData && (
                    <span className="ml-2 text-purple-500">
                      • Showcase Active
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unlock Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              Unlock Magic Carpet Rides
            </DialogTitle>
            <DialogDescription>
              Earn Golden Keys to unlock premium stop modes for this run.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Your Golden Keys</span>
                <Badge className="bg-amber-500/20 text-amber-600">
                  <Key className="w-3 h-3 mr-1" />
                  {goldenKeys}
                </Badge>
              </div>
              <Progress
                value={(goldenKeys / run.goldenKeysRequired) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Need {run.goldenKeysRequired} keys ({GOLDEN_KEYS_PER_STOP} per stop × {run.totalNodes} stops)
              </p>
            </div>

            {/* Access Tiers Explanation */}
            <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2">
              <h4 className="font-medium">Access Tiers:</h4>
              <div className="space-y-1 text-muted-foreground">
                <p>• <strong>Free:</strong> Wildfire mode (5s auto-advance)</p>
                <p>• <strong>{run.goldenKeysRequired}+ Keys:</strong> Tourist (30s) & On-Resume (manual)</p>
                <p>• <strong>{POWER_USER_KEYS_THRESHOLD}+ Keys:</strong> Power User (mix/match per node)</p>
                <p>• <strong>Red Carpet Rider:</strong> All modes on all runs</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Ways to Earn Golden Keys:</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    navigate("/cephas");
                    setShowUnlockDialog(false);
                  }}
                >
                  <Compass className="w-4 h-4 text-blue-500" />
                  Complete Cephas Learning Modules
                  <Badge variant="outline" className="ml-auto">+5-10 keys</Badge>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    navigate("/treasure-map");
                    setShowUnlockDialog(false);
                  }}
                >
                  <Ghost className="w-4 h-4 text-purple-500" />
                  Find Treasure Map Cards
                  <Badge variant="outline" className="ml-auto">+1-5 keys</Badge>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    navigate("/RedCarpet");
                    setShowUnlockDialog(false);
                  }}
                >
                  <Crown className="w-4 h-4 text-red-500" />
                  Become a Red Carpet Rider
                  <Badge variant="outline" className="ml-auto">All Unlocked</Badge>
                </Button>
              </div>
            </div>

            {currentNode?.learningLink && (
              <Button
                className="w-full gap-2"
                onClick={() => {
                  window.open(currentNode.learningLink, "_blank");
                  setShowUnlockDialog(false);
                }}
              >
                <Sparkles className="w-4 h-4" />
                Learn About This Stop (+{currentNode.goldenKeysReward ?? 5} keys)
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Contingency Operators: "What If?" Button ── */}
      {state.isRunning && run.interestKey && mockData.currentData && (
        <WhatIfButton
          onClick={() => {
            if (state.isRunning && !state.isPaused) {
              setState(prev => ({ ...prev, isPaused: true }));
            }
            setShowCoDialog(true);
          }}
          isCustomized={mockData.currentData.isCustomized}
        />
      )}

      {/* ── Contingency Operators Dialog ── */}
      {mockData.currentData && (
        <ContingencyOperatorDialog
          isOpen={showCoDialog}
          onClose={() => {
            setShowCoDialog(false);
            // Resume if we auto-paused
            if (state.isPaused) {
              setState(prev => ({ ...prev, isPaused: false }));
            }
          }}
          onApply={handleCoApply}
          onRestart={handleCoRestart}
          fields={mockData.currentData.fields}
          derivations={mockData.currentData.derivations}
          onFieldChange={mockData.updateField}
          onResetToDefaults={mockData.resetToDefaults}
          interestLabel={mockData.currentData.interestLabel}
          isCustomized={mockData.currentData.isCustomized}
        />
      )}

      {/* ── Post-Update Prompt (carry on vs restart) ── */}
      <Dialog open={showPostUpdatePrompt} onOpenChange={setShowPostUpdatePrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-500" />
              Showcase Updated
            </DialogTitle>
            <DialogDescription>
              Your custom numbers are now live in the showcase.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={() => {
                setShowPostUpdatePrompt(false);
                // Resume the run from current point
                setState(prev => ({ ...prev, isPaused: false }));
              }}
              className="gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Carry on with the showcase
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowPostUpdatePrompt(false);
                handleCoRestart();
              }}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Start this run over with my numbers
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── SHOWCASE Badge (visible during customized runs) ── */}
      {state.isRunning && mockData.currentData?.isCustomized && (
        <div className="fixed top-4 right-4 z-[48]">
          <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30 gap-1.5 px-3 py-1.5 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            SHOWCASE — Custom Numbers
          </Badge>
        </div>
      )}

      {/* ── End-of-Run Choices ── */}
      {showEndChoices && (
        <div className="fixed inset-0 z-[51] bg-background/95 backdrop-blur flex items-center justify-center p-6 overflow-y-auto">
          <BeaconRunEndChoices
            runName={run.name}
            runCategory={run.category}
            interestKey={run.interestKey}
            elapsedSeconds={state.elapsedSeconds}
            isCustomized={mockData.currentData?.isCustomized ?? false}
            onPickNewInterest={() => {
              setShowEndChoices(false);
              mockData.unloadMockData();
              if (onPickNewInterest) {
                onPickNewInterest();
              } else {
                navigate("/crows-nest");
              }
            }}
            onGoDeeper={() => {
              setShowEndChoices(false);
              if (onGoDeeper) {
                onGoDeeper();
              } else {
                navigate("/academic-papers");
              }
            }}
            onContinueTrack={() => {
              setShowEndChoices(false);
              if (onContinueTrack) {
                onContinueTrack();
              }
            }}
            onRegister={() => {
              setShowEndChoices(false);
              mockData.unloadMockData();
              navigate("/RedCarpet");
            }}
            hasNextRun={hasNextRun}
          />
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUN PROGRESS CARD (for displaying on pages)
// ═══════════════════════════════════════════════════════════════════════════════

interface RunProgressCardProps {
  run: WildfireRun;
  currentNodeIndex: number;
  isActive: boolean;
}

export function RunProgressCard({ run, currentNodeIndex, isActive }: RunProgressCardProps) {
  const progress = ((currentNodeIndex + 1) / run.totalNodes) * 100;
  const currentNode = run.nodes[currentNodeIndex];

  return (
    <Card className={`border-2 ${isActive ? "border-orange-500/50" : "border-border"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className={`w-5 h-5 ${isActive ? "text-orange-500 animate-pulse" : "text-muted-foreground"}`} />
            {run.name}
          </CardTitle>
          {isActive && (
            <Badge className="bg-orange-500/10 text-orange-500">
              Active
            </Badge>
          )}
        </div>
        <CardDescription>{run.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{currentNodeIndex + 1} / {run.totalNodes}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {currentNode && (
          <div className="p-2 bg-muted/50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">Current: {currentNode.title}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{run.totalNodes} stops</Badge>
          <Badge variant="outline">~{run.estimatedMinutes} min</Badge>
          <Badge variant="outline">{run.difficulty}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════════════════════════

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default WildfireBeaconRun;
