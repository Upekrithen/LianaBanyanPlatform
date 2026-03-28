/**
 * CampaignPledgeModal — Pledge Flow for Kickstarter Campaigns
 * =============================================================
 * Triggered from "Back This Campaign" or "Select This Tier".
 * Supports Credits (on-platform) or redirect to external Kickstarter URL.
 * On success: chain extends, coin animation, bonus display.
 *
 * K146 / Bishop 036
 */

import React, { useState } from "react";
import {
  usePledge,
  useChainStatus,
  REWARD_TIERS,
  type RewardTier,
  type KickstarterCampaign,
} from "@/hooks/useKickstarterCampaigns";
import { useAuth } from "@/contexts/AuthContext";
import {
  Link2, ExternalLink, Zap, Check, X, CreditCard, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface CampaignPledgeModalProps {
  campaign: KickstarterCampaign;
  preselectedTier?: string;
  onClose: () => void;
}

export const CampaignPledgeModal: React.FC<CampaignPledgeModalProps> = ({
  campaign,
  preselectedTier,
  onClose,
}) => {
  const { user } = useAuth();
  const { chainLength, bonusPerLink } = useChainStatus();
  const pledge = usePledge();
  const [selectedTier, setSelectedTier] = useState<string>(
    preselectedTier ?? "single"
  );
  const [paymentMethod, setPaymentMethod] = useState<"credits" | "external">(
    "credits"
  );
  const [success, setSuccess] = useState<{
    position: number;
    bonus: number;
  } | null>(null);

  const tier = REWARD_TIERS.find((t) => t.id === selectedTier) ?? REWARD_TIERS[1];
  const effectivePrice =
    tier.earlyBirdPrice && campaign.backer_count < (tier.earlyBirdLimit ?? 0)
      ? tier.earlyBirdPrice
      : tier.price;

  const handlePledge = async () => {
    if (!user) {
      toast.error("Please sign in to back this campaign");
      return;
    }

    if (paymentMethod === "external" && campaign.kickstarter_url) {
      window.open(
        `${campaign.kickstarter_url}?ref=lianabanyan&tier=${selectedTier}`,
        "_blank"
      );
      onClose();
      return;
    }

    try {
      const result = await pledge.mutateAsync({
        campaignId: campaign.id,
        tierId: selectedTier,
        amount: effectivePrice,
      });
      setSuccess(result);
      toast.success(
        `Link ${result.position} earned! Chain bonus now ${result.bonus}%`
      );
    } catch (err: any) {
      if (err?.message?.includes("duplicate")) {
        toast.error("You've already backed this campaign");
      } else {
        toast.error("Pledge failed — please try again");
      }
    }
  };

  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-zinc-900 border border-emerald-500/40 rounded-2xl p-8 max-w-md w-full mx-4 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-6xl mb-4 animate-bounce">🔗</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Link {success.position} Earned!
          </h2>
          <p className="text-emerald-400 text-lg font-semibold mb-1">
            Chain bonus now {success.bonus}%
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Chain timer reset to 14 days. Keep backing to grow your bonus!
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white">
              Back: {campaign.title}
            </h2>
            <p className="text-xs text-muted-foreground">
              Campaign {campaign.campaign_number} of 13
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chain Preview */}
        <div className="mx-5 mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 text-sm">
            <Link2 className="h-4 w-4 text-amber-400" />
            <span className="text-amber-200">
              Current chain: {chainLength} links → {chainLength * bonusPerLink}%
              bonus
            </span>
          </div>
          <p className="text-xs text-amber-300/60 mt-1">
            This pledge adds Link {chainLength + 1} →{" "}
            {(chainLength + 1) * bonusPerLink}% bonus
          </p>
        </div>

        {/* Tier Selection */}
        <div className="p-5 space-y-2">
          <h3 className="text-sm font-semibold text-white mb-3">
            Select Tier
          </h3>
          {REWARD_TIERS.map((t) => {
            const isEarlyBird =
              t.earlyBirdPrice &&
              campaign.backer_count < (t.earlyBirdLimit ?? 0);
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedTier === t.id
                    ? "border-cyan-500/50 bg-cyan-500/10"
                    : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white text-sm">
                    {t.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {isEarlyBird && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                        Early Bird
                      </span>
                    )}
                    <span className="text-sm font-bold text-white">
                      {isEarlyBird ? (
                        <>
                          <span className="line-through text-muted-foreground mr-1">
                            ${t.price}
                          </span>
                          ${t.earlyBirdPrice}
                        </>
                      ) : (
                        `$${t.price}`
                      )}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.description}
                </p>
                {selectedTier === t.id && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.includes.map((item) => (
                      <span
                        key={item}
                        className="text-xs bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Payment Method */}
        <div className="px-5 pb-4 space-y-2">
          <h3 className="text-sm font-semibold text-white mb-2">
            Payment Method
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMethod("credits")}
              className={`p-3 rounded-lg border text-center transition-all ${
                paymentMethod === "credits"
                  ? "border-cyan-500/50 bg-cyan-500/10"
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <CreditCard className="h-5 w-5 mx-auto mb-1 text-cyan-400" />
              <span className="text-xs text-white font-medium">
                Platform Credits
              </span>
            </button>
            <button
              onClick={() => setPaymentMethod("external")}
              className={`p-3 rounded-lg border text-center transition-all ${
                paymentMethod === "external"
                  ? "border-cyan-500/50 bg-cyan-500/10"
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <ExternalLink className="h-5 w-5 mx-auto mb-1 text-amber-400" />
              <span className="text-xs text-white font-medium">
                Kickstarter
              </span>
            </button>
          </div>
        </div>

        {/* Pledge Button */}
        <div className="p-5 border-t border-zinc-800">
          <button
            onClick={handlePledge}
            disabled={pledge.isPending}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pledge.isPending ? (
              <span className="animate-pulse">Processing...</span>
            ) : paymentMethod === "external" ? (
              <>
                <ExternalLink className="h-4 w-4" />
                Back on Kickstarter — ${effectivePrice}
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Pledge ${effectivePrice} Credits
              </>
            )}
          </button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Every tier includes a Chain Link — 5% stacking bonus
          </p>
        </div>
      </div>
    </div>
  );
};
