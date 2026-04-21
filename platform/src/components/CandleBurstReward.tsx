/**
 * CANDLE BURST REWARD MODAL
 * =========================
 * When a user earns a Candle Burst (from social unlocks, beacon runs, etc.),
 * they choose how to use it:
 *
 * A. Short Burst - 3 candle uses immediately
 * B. Store for Babylon - Accumulate 3 bursts → 1 Mini Black Babylon
 * C. Pair Bonus - Share code with friend, both get 9 uses, then 10, then 2x
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Battery, Users, Copy, Check, X,
  Sparkles, ArrowRight, Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { claimCandleBurstReward, joinPair } from '@/lib/cueCardClickTracking';

interface CandleBurstRewardProps {
  isOpen: boolean;
  onClose: () => void;
  rewardId: string;
  pairCode: string;
  triggerType: 'social_unlock' | 'beacon_run' | 'golden_key' | 'pair_bonus';
  triggerId: string;
  onRewardClaimed?: (choice: 'burst' | 'store' | 'pair', result: any) => void;
}

type RewardChoice = 'burst' | 'store' | 'pair';

export function CandleBurstReward({
  isOpen,
  onClose,
  rewardId,
  pairCode,
  triggerType,
  triggerId,
  onRewardClaimed
}: CandleBurstRewardProps) {
  const [selectedChoice, setSelectedChoice] = useState<RewardChoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPairCode, setShowPairCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinMode, setJoinMode] = useState(false);

  const handleChoiceSelect = async (choice: RewardChoice) => {
    setSelectedChoice(choice);

    if (choice === 'pair') {
      setShowPairCode(true);
      return;
    }

    setIsProcessing(true);

    try {
      const result = await claimCandleBurstReward(rewardId, choice);

      if (result.success) {
        if (choice === 'burst') {
          toast.success(`🕯️ +3 Candle Uses! Explore freely.`);
        } else if (choice === 'store') {
          toast.success(`✨ Stored toward Mini Black Babylon!`);
        }
        onRewardClaimed?.(choice, result);
        onClose();
      } else {
        toast.error('Failed to claim reward');
      }
    } catch (err) {
      console.error('Error claiming reward:', err);
      toast.error('Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPairCode = () => {
    navigator.clipboard.writeText(pairCode);
    setCopied(true);
    toast.success('Pair code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPair = async () => {
    setIsProcessing(true);

    try {
      const result = await claimCandleBurstReward(rewardId, 'pair');

      if (result.success) {
        toast.success(`🤝 Pair code active! Share it with a friend.`);
        onRewardClaimed?.('pair', { ...result, pairCode });
        onClose();
      }
    } catch (err) {
      console.error('Error confirming pair:', err);
      toast.error('Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJoinPair = async () => {
    if (!joinCode.trim()) {
      toast.error('Enter a pair code');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await joinPair(joinCode.trim(), rewardId);

      if (result.success) {
        toast.success(`🎉 Paired! You both get ${result.candleUsesEach} candle uses!`);
        onRewardClaimed?.('pair', result);
        onClose();
      } else {
        toast.error(result.error || 'Invalid pair code');
      }
    } catch (err) {
      console.error('Error joining pair:', err);
      toast.error('Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{
                    x: Math.random() * 400,
                    y: Math.random() * 100,
                    opacity: 0
                  }}
                  animate={{
                    y: -20,
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Candle Burst Earned!</h2>
                  <p className="text-white/80 text-sm">
                    {triggerType === 'social_unlock' && 'Deck Card unlocked through sharing'}
                    {triggerType === 'beacon_run' && 'Beacon Run completed'}
                    {triggerType === 'golden_key' && 'Golden Key puzzle solved'}
                    {triggerType === 'pair_bonus' && 'Pair bonus activated'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {!showPairCode ? (
              <>
                <p className="text-muted-foreground mb-6 text-center">
                  Choose how to use your Candle Burst:
                </p>

                <div className="space-y-3">
                  {/* Option A: Short Burst */}
                  <button
                    onClick={() => handleChoiceSelect('burst')}
                    disabled={isProcessing}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedChoice === 'burst'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-border hover:border-amber-500/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                        <Flame className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Short Burst</h3>
                        <p className="text-sm text-muted-foreground">
                          +3 candle uses immediately. Explore freely.
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-amber-600">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-xs font-medium">Instant gratification</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Option B: Store for Babylon */}
                  <button
                    onClick={() => handleChoiceSelect('store')}
                    disabled={isProcessing}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedChoice === 'store'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-border hover:border-purple-500/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Battery className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Store for Babylon</h3>
                        <p className="text-sm text-muted-foreground">
                          Save toward a Mini Black Babylon (3 bursts = 1 Babylon).
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-purple-600">
                          <ArrowRight className="w-4 h-4" />
                          <span className="text-xs font-medium">Long-term power</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Option C: Pair Bonus */}
                  <button
                    onClick={() => handleChoiceSelect('pair')}
                    disabled={isProcessing}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedChoice === 'pair'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-border hover:border-green-500/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Pair Bonus</h3>
                        <p className="text-sm text-muted-foreground">
                          Share code with a friend. Both get 9 uses, then 10, then 2x next reward!
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-green-600">
                          <Gift className="w-4 h-4" />
                          <span className="text-xs font-medium">Best value with a friend</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Join existing pair option */}
                <div className="mt-6 pt-4 border-t">
                  <button
                    onClick={() => setJoinMode(!joinMode)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Have a pair code? Click to join
                  </button>

                  {joinMode && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        value={joinCode}
                        onChange={e => setJoinCode(e.target.value)}
                        placeholder="Enter pair code (e.g., swift-beacon-123)"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleJoinPair}
                        disabled={isProcessing || !joinCode.trim()}
                      >
                        Join
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Pair Code Display */
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-500" />
                </div>

                <h3 className="text-lg font-semibold mb-2">Your Pair Code</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share this code with a friend. When they join, you both get 9 candle uses!
                </p>

                <div className="bg-muted rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-xl font-mono font-bold text-foreground">
                      {pairCode}
                    </code>
                    <button
                      onClick={handleCopyPairCode}
                      className="p-2 rounded-lg hover:bg-background transition-colors"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-green-500/10 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
                    Pair Progression:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Stage 1: Both get <strong>9 candle uses</strong></li>
                    <li>• Stage 2: Complete another action → <strong>10 uses each</strong></li>
                    <li>• Stage 3: Next reward is <strong>2x for both</strong></li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPairCode(false)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirmPair}
                    disabled={isProcessing}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Pair Choice'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CandleBurstReward;
