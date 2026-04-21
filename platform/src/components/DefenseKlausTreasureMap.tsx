/**
 * Defense Klaus Treasure Map
 *
 * Special Deck Card accessible from Defense Klaus for first 5,000 signups
 * Demonstrates the corner lock system with practice currencies
 *
 * Gives:
 * - Practice Joules (SESSION ONLY) for Silver Corner locks (12 each)
 * - Practice Credits (SESSION ONLY) for regular frame locks (6 each)
 * - Shareable Defense Klaus Voucher Deck Card
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Map,
  Sparkles,
  Lock,
  Unlock,
  Coins,
  Gem,
  Share2,
  Gift,
  Shield,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TreasureMapProps {
  onClaimVoucher?: (voucherData: VoucherData) => void;
}

interface VoucherData {
  type: "defense_klaus_voucher";
  practiceJoules: number;
  practiceCredits: number;
  timestamp: string;
}

const PRACTICE_JOULES_GRANT = 48; // 12 per corner lock × 4 corners
const PRACTICE_CREDITS_GRANT = 24; // 6 per side lock × 4 sides
const SILVER_CORNER_COST = 12; // Joules per corner
const SIDE_LOCK_COST = 6; // Credits per side

export function DefenseKlausTreasureMap({ onClaimVoucher }: TreasureMapProps) {
  const { toast } = useToast();

  // Session-only practice currencies
  const [practiceJoules, setPracticeJoules] = useState(0);
  const [practiceCredits, setPracticeCredits] = useState(0);
  const [hasClaimed, setHasClaimed] = useState(false);

  // Lock states for demo card
  const [cornerLocks, setCornerLocks] = useState([true, true, true, true]); // Silver corners
  const [sideLocks, setSideLocks] = useState([true, true, true, true]); // Regular sides
  const [isFlipped, setIsFlipped] = useState(false);

  // Check if already claimed this session
  useEffect(() => {
    const claimed = sessionStorage.getItem("dk_treasure_map_claimed");
    if (claimed) {
      const data = JSON.parse(claimed);
      setPracticeJoules(data.practiceJoules || 0);
      setPracticeCredits(data.practiceCredits || 0);
      setHasClaimed(true);
    }
  }, []);

  const handleClaimTreasure = () => {
    if (hasClaimed) {
      toast({
        title: "Already Claimed",
        description: "You've already claimed your practice currencies this session.",
        variant: "destructive",
      });
      return;
    }

    // Grant practice currencies
    setPracticeJoules(PRACTICE_JOULES_GRANT);
    setPracticeCredits(PRACTICE_CREDITS_GRANT);
    setHasClaimed(true);

    // Store in session
    const voucherData: VoucherData = {
      type: "defense_klaus_voucher",
      practiceJoules: PRACTICE_JOULES_GRANT,
      practiceCredits: PRACTICE_CREDITS_GRANT,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem("dk_treasure_map_claimed", JSON.stringify(voucherData));

    toast({
      title: "🗺️ Treasure Found!",
      description: `You received ${PRACTICE_JOULES_GRANT} Practice Joules and ${PRACTICE_CREDITS_GRANT} Practice Credits for this session!`,
    });

    if (onClaimVoucher) {
      onClaimVoucher(voucherData);
    }
  };

  const handleCornerLockClick = (index: number) => {
    if (!cornerLocks[index]) return; // Already unlocked

    if (practiceJoules < SILVER_CORNER_COST) {
      toast({
        title: "Not Enough Practice Joules",
        description: `Silver corner locks require ${SILVER_CORNER_COST} Practice Joules each.`,
        variant: "destructive",
      });
      return;
    }

    setPracticeJoules(prev => prev - SILVER_CORNER_COST);
    setCornerLocks(prev => {
      const newLocks = [...prev];
      newLocks[index] = false;
      return newLocks;
    });

    toast({
      title: "🔓 Corner Unlocked!",
      description: `Silver corner ${index + 1} unlocked. ${practiceJoules - SILVER_CORNER_COST} Practice Joules remaining.`,
    });
  };

  const handleSideLockClick = (index: number) => {
    if (!sideLocks[index]) return; // Already unlocked

    if (practiceCredits < SIDE_LOCK_COST) {
      toast({
        title: "Not Enough Practice Credits",
        description: `Side locks require ${SIDE_LOCK_COST} Practice Credits each.`,
        variant: "destructive",
      });
      return;
    }

    setPracticeCredits(prev => prev - SIDE_LOCK_COST);
    setSideLocks(prev => {
      const newLocks = [...prev];
      newLocks[index] = false;
      return newLocks;
    });

    toast({
      title: "🔓 Side Lock Opened!",
      description: `Side lock ${index + 1} unlocked. ${practiceCredits - SIDE_LOCK_COST} Practice Credits remaining.`,
    });
  };

  const allUnlocked = !cornerLocks.some(l => l) && !sideLocks.some(l => l);

  return (
    <div className="space-y-6">
      {/* Currency Display */}
      <div className="flex justify-center gap-6">
        <div className="flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-full">
          <Gem className="h-5 w-5 text-amber-400" />
          <span className="font-bold text-amber-400">{practiceJoules}</span>
          <span className="text-xs text-amber-200">Practice Joules</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full">
          <Coins className="h-5 w-5 text-blue-400" />
          <span className="font-bold text-blue-400">{practiceCredits}</span>
          <span className="text-xs text-blue-200">Practice Credits</span>
        </div>
      </div>

      {/* Treasure Map Card */}
      <Card className="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 border-amber-500/30 overflow-hidden">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Map className="h-6 w-6 text-amber-400" />
            <CardTitle className="text-amber-200">Defense Klaus Treasure Map</CardTitle>
          </div>
          <p className="text-sm text-amber-300/70">
            First 5,000 signups receive this special demonstration card
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasClaimed ? (
            <div className="text-center space-y-4">
              <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/30">
                <Sparkles className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-amber-200">Claim Your Practice Currencies</h3>
                <p className="text-sm text-amber-300/70 mt-2">
                  Receive <strong>{PRACTICE_JOULES_GRANT} Practice Joules</strong> and{" "}
                  <strong>{PRACTICE_CREDITS_GRANT} Practice Credits</strong> to learn how
                  the lock system works. These are SESSION ONLY — they disappear when you leave.
                </p>
              </div>
              <Button
                onClick={handleClaimTreasure}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
              >
                <Gift className="h-5 w-5 mr-2" />
                Open the Treasure Map
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Demo Card with Locks */}
              <div className="relative mx-auto" style={{ width: 280, height: 380 }}>
                {/* Card Background */}
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600/80 to-pink-600/80 border-2 border-white/20 shadow-xl cursor-pointer"
                  onClick={() => allUnlocked && setIsFlipped(!isFlipped)}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <Shield className="h-16 w-16 text-white/80 mb-4" />
                    <h3 className="text-xl font-bold text-white">Defense Klaus</h3>
                    <p className="text-sm text-white/70 text-center mt-2">
                      Voucher Card
                    </p>
                    <Badge className="mt-4 bg-white/20">
                      {allUnlocked ? "Click to flip!" : "Unlock all locks to reveal"}
                    </Badge>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-6"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <Star className="h-12 w-12 text-amber-400 mb-3" />
                    <h3 className="text-lg font-bold text-white">Voucher Unlocked!</h3>
                    <p className="text-xs text-white/70 text-center mt-2">
                      This voucher entitles the bearer to:
                    </p>
                    <ul className="text-xs text-white/80 mt-3 space-y-1">
                      <li>✓ Defense Klaus Bracelet ($6 value)</li>
                      <li>✓ Legal Defense Fund Registration</li>
                      <li>✓ Complimentary Membership ($5 value)</li>
                    </ul>
                    <Button size="sm" className="mt-4 bg-white/20 hover:bg-white/30">
                      <Share2 className="h-3 w-3 mr-1" />
                      Share Card
                    </Button>
                  </div>
                </motion.div>

                {/* Silver Corner Locks (rare card feature) */}
                {[
                  { pos: "top-0 left-0 -translate-x-1/2 -translate-y-1/2", idx: 0 },
                  { pos: "top-0 right-0 translate-x-1/2 -translate-y-1/2", idx: 1 },
                  { pos: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2", idx: 2 },
                  { pos: "bottom-0 right-0 translate-x-1/2 translate-y-1/2", idx: 3 },
                ].map(({ pos, idx }) => (
                  <motion.button
                    key={`corner-${idx}`}
                    className={`absolute ${pos} w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      cornerLocks[idx]
                        ? "bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-gray-200 shadow-lg cursor-pointer hover:scale-110"
                        : "bg-green-500/50 border-2 border-green-400"
                    }`}
                    onClick={() => handleCornerLockClick(idx)}
                    whileHover={cornerLocks[idx] ? { scale: 1.1 } : {}}
                    whileTap={cornerLocks[idx] ? { scale: 0.95 } : {}}
                  >
                    {cornerLocks[idx] ? (
                      <Lock className="h-4 w-4 text-gray-700" />
                    ) : (
                      <Unlock className="h-4 w-4 text-green-200" />
                    )}
                  </motion.button>
                ))}

                {/* Side Locks (regular frame locks) */}
                {[
                  { pos: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2", idx: 0 },
                  { pos: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2", idx: 1 },
                  { pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2", idx: 2 },
                  { pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2", idx: 3 },
                ].map(({ pos, idx }) => (
                  <motion.button
                    key={`side-${idx}`}
                    className={`absolute ${pos} w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      sideLocks[idx]
                        ? "bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-300 shadow-md cursor-pointer hover:scale-110"
                        : "bg-green-500/50 border-2 border-green-400"
                    }`}
                    onClick={() => handleSideLockClick(idx)}
                    whileHover={sideLocks[idx] ? { scale: 1.1 } : {}}
                    whileTap={sideLocks[idx] ? { scale: 0.95 } : {}}
                  >
                    {sideLocks[idx] ? (
                      <Lock className="h-3 w-3 text-white" />
                    ) : (
                      <Unlock className="h-3 w-3 text-green-200" />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Instructions */}
              <div className="bg-white/5 rounded-lg p-4 text-sm space-y-2">
                <h4 className="font-semibold text-white">How Lock Types Work:</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 text-gray-300 mb-1">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400" />
                      <strong>Silver Corner Locks</strong>
                    </div>
                    <p className="text-white/60">
                      Ultra-rare cards only. Cost: {SILVER_CORNER_COST} Joules each.
                      Require completing a Harrow to activate.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-blue-300 mb-1">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
                      <strong>Side Frame Locks</strong>
                    </div>
                    <p className="text-white/60">
                      Standard collectible cards. Cost: {SIDE_LOCK_COST} Credits each.
                      Unlock to reveal card content.
                    </p>
                  </div>
                </div>
              </div>

              {allUnlocked && (
                <div className="text-center">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    ✨ All Locks Opened! Click the card to flip and see your voucher.
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card className="border-white/10">
        <CardContent className="pt-6 text-sm text-white/70 space-y-3">
          <p>
            <strong className="text-white">Corner Locks</strong> are reserved for the most rare
            and valuable cards. They are only revealed when that type of card is discovered through
            gameplay. Even if traded, such cards cannot be activated unless you complete the
            <strong className="text-purple-400"> Harrow</strong> assigned to it.
          </p>
          <p className="text-amber-300/80 italic">
            "Earned. Not given."
          </p>
          <p>
            This Treasure Map is an exception — a demonstration of the system for the first 5,000
            Defense Klaus signups. The practice currencies are session-only and cannot be transferred.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default DefenseKlausTreasureMap;
