/**
 * GOLDEN KEYS SOCIAL — Phase 6
 * =============================
 * Cross-platform sharing for Golden Key achievements.
 *
 * Features:
 * - Share key discoveries to social platforms
 * - Generate shareable achievement cards
 * - Daisy Chain referral tracking
 * - Leaderboard sharing
 * - Achievement badges for social profiles
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import {
  Share2, Twitter, Facebook, Linkedin, Copy, Check, Key,
  Trophy, Feather, Star, Crown, Sparkles, ExternalLink,
  MessageCircle, Send, QrCode, Download, Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Achievement {
  id: string;
  type: 'key_found' | 'circle_complete' | 'ticket_won' | 'multiplier_reached' | 'leaderboard_rank';
  title: string;
  description: string;
  value?: number;
  tier?: string;
  earnedAt: Date;
}

interface ShareConfig {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'bluesky' | 'copy' | 'cuecard';
  achievement: Achievement;
  referralCode?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARE TEXT GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

function generateShareText(achievement: Achievement, referralCode?: string): string {
  const baseUrl = 'https://lianabanyan.com/golden-key-quest';
  const refParam = referralCode ? `?ref=${referralCode}` : '';

  switch (achievement.type) {
    case 'key_found':
      return `🔑 I just found a ${achievement.tier || 'hidden'} Golden Key in the Liana Banyan treasure hunt!\n\n${achievement.value} feathers earned. Can you find the next one?\n\n${baseUrl}${refParam}`;

    case 'circle_complete':
      return `🎯 Circle ${achievement.value} COMPLETE!\n\nI've unlocked all the Golden Keys in this circle. The treasure hunt continues...\n\n${baseUrl}${refParam}`;

    case 'ticket_won':
      return `🎫✨ GOLDEN TICKET WINNER!\n\nI solved the puzzle and won ${achievement.description}!\n\nJoin the hunt: ${baseUrl}${refParam}`;

    case 'multiplier_reached':
      return `⚡ ${achievement.value}x MULTIPLIER UNLOCKED!\n\nMy Golden Key rewards are now multiplied. The streak continues!\n\n${baseUrl}${refParam}`;

    case 'leaderboard_rank':
      return `🏆 Ranked #${achievement.value} on the Golden Key Leaderboard!\n\nHelp each other help ourselves.\n\n${baseUrl}${refParam}`;

    default:
      return `🔑 Join me on the Golden Key Quest at Liana Banyan!\n\n${baseUrl}${refParam}`;
  }
}

function generateHashtags(): string {
  return '#LianaBanyan #GoldenKeyQuest #TreasureHunt #PlatformCooperativism';
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL PLATFORM HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

function shareToTwitter(text: string): void {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + '\n\n' + generateHashtags())}`;
  window.open(url, '_blank', 'width=550,height=420');
}

function shareToFacebook(text: string): void {
  const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=550,height=420');
}

function shareToLinkedIn(text: string): void {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://lianabanyan.com/golden-key-quest')}&summary=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=550,height=420');
}

function shareToBluesky(text: string): void {
  const url = `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=550,height=420');
}

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const tierColors: Record<string, { bg: string; border: string; text: string }> = {
    common: { bg: 'from-gray-500/20', border: 'border-gray-500/40', text: 'text-gray-400' },
    uncommon: { bg: 'from-green-500/20', border: 'border-green-500/40', text: 'text-green-400' },
    rare: { bg: 'from-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400' },
    epic: { bg: 'from-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400' },
    legendary: { bg: 'from-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400' },
  };

  const colors = tierColors[achievement.tier || 'common'];

  const icons: Record<string, React.ReactNode> = {
    key_found: <Key className="h-8 w-8" />,
    circle_complete: <Trophy className="h-8 w-8" />,
    ticket_won: <Gift className="h-8 w-8" />,
    multiplier_reached: <Sparkles className="h-8 w-8" />,
    leaderboard_rank: <Crown className="h-8 w-8" />,
  };

  return (
    <div className={cn(
      "p-4 rounded-xl border-2 bg-gradient-to-br to-transparent",
      colors.bg,
      colors.border
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-white/10", colors.text)}>
          {icons[achievement.type]}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white">{achievement.title}</h3>
          <p className="text-sm text-white/70">{achievement.description}</p>
        </div>
        {achievement.value && (
          <div className="text-right">
            <div className={cn("text-2xl font-bold", colors.text)}>
              {achievement.type === 'leaderboard_rank' ? `#${achievement.value}` : achievement.value}
            </div>
            <div className="text-xs text-white/50">
              {achievement.type === 'key_found' ? 'feathers' :
               achievement.type === 'multiplier_reached' ? 'multiplier' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShareButton({
  platform,
  onClick,
  disabled = false,
}: {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'bluesky' | 'copy';
  onClick: () => void;
  disabled?: boolean;
}) {
  const config = {
    twitter: { icon: Twitter, label: 'Twitter/X', color: 'hover:bg-sky-500/20 hover:border-sky-500' },
    facebook: { icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-600/20 hover:border-blue-600' },
    linkedin: { icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-500/20 hover:border-blue-500' },
    bluesky: { icon: MessageCircle, label: 'Bluesky', color: 'hover:bg-sky-400/20 hover:border-sky-400' },
    copy: { icon: Copy, label: 'Copy', color: 'hover:bg-white/20 hover:border-white/40' },
  };

  const { icon: Icon, label, color } = config[platform];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-white/5 transition-all",
        color,
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function DaisyChainInfo({ referralCode, referralCount }: { referralCode: string; referralCount: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(`https://lianabanyan.com/golden-key-quest?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral link copied!');
  };

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="h-5 w-5 text-purple-400" />
        <h3 className="font-semibold text-white">Daisy Chain Referrals</h3>
      </div>
      <p className="text-sm text-white/70 mb-3">
        Share your referral link. When others find keys using your link, you earn bonus feathers!
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 truncate">
          lianabanyan.com/golden-key-quest?ref={referralCode}
        </div>
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-white/60">Referrals this month:</span>
        <span className="font-bold text-purple-400">{referralCount}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface GoldenKeysSocialProps {
  achievement?: Achievement;
  referralCode?: string;
  referralCount?: number;
  onShare?: (platform: string) => void;
  className?: string;
}

export function GoldenKeysSocial({
  achievement,
  referralCode,
  referralCount = 0,
  onShare,
  className,
}: GoldenKeysSocialProps) {
  const { user } = useAuth();
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate referral code if not provided
  const userReferralCode = referralCode || (user?.id ? user.id.slice(0, 8).toUpperCase() : 'GUEST');

  // Default achievement for demo
  const displayAchievement = achievement || {
    id: 'demo',
    type: 'key_found' as const,
    title: 'Golden Key Found!',
    description: 'You discovered a hidden key',
    value: 50,
    tier: 'rare',
    earnedAt: new Date(),
  };

  const shareText = generateShareText(displayAchievement, userReferralCode);

  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'bluesky' | 'copy') => {
    switch (platform) {
      case 'twitter':
        shareToTwitter(shareText);
        break;
      case 'facebook':
        shareToFacebook(shareText);
        break;
      case 'linkedin':
        shareToLinkedIn(shareText);
        break;
      case 'bluesky':
        shareToBluesky(shareText);
        break;
      case 'copy':
        await copyToClipboard(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied to clipboard!');
        break;
    }
    onShare?.(platform);
  };

  // Log share event
  const logShare = useMutation({
    mutationFn: async (platform: string) => {
      if (!user?.id) return;
      await supabase.from('social_shares').insert({
        user_id: user.id,
        platform,
        content_type: 'golden_key_achievement',
        content_id: displayAchievement.id,
      });
    },
  });

  const handleShareWithLog = (platform: 'twitter' | 'facebook' | 'linkedin' | 'bluesky' | 'copy') => {
    handleShare(platform);
    logShare.mutate(platform);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Achievement Preview */}
      <AchievementCard achievement={displayAchievement} />

      {/* Share Preview Toggle */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="w-full py-2 text-sm text-white/60 hover:text-white/80 transition-all"
      >
        {showPreview ? 'Hide' : 'Show'} share preview
      </button>

      {/* Share Text Preview */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-white/5 border border-white/15">
              <p className="text-sm text-white/80 whitespace-pre-wrap">{shareText}</p>
              <p className="text-xs text-white/50 mt-2">{generateHashtags()}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Buttons */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/60">Share to:</h4>
        <div className="flex flex-wrap gap-2">
          <ShareButton platform="twitter" onClick={() => handleShareWithLog('twitter')} />
          <ShareButton platform="bluesky" onClick={() => handleShareWithLog('bluesky')} />
          <ShareButton platform="linkedin" onClick={() => handleShareWithLog('linkedin')} />
          <ShareButton platform="facebook" onClick={() => handleShareWithLog('facebook')} />
          <ShareButton platform="copy" onClick={() => handleShareWithLog('copy')} />
        </div>
      </div>

      {/* Daisy Chain Referrals */}
      {user && (
        <DaisyChainInfo referralCode={userReferralCode} referralCount={referralCount} />
      )}

      {/* Create Cue Card CTA */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
        <div className="flex items-center gap-3">
          <QrCode className="h-8 w-8 text-amber-400" />
          <div className="flex-1">
            <h4 className="font-semibold text-white">Create a Cue Card</h4>
            <p className="text-sm text-white/70">
              Generate a shareable QR code that tracks referrals automatically
            </p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARE MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ShareAchievementModalProps {
  achievement: Achievement;
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
}

export function ShareAchievementModal({
  achievement,
  isOpen,
  onClose,
  referralCode,
}: ShareAchievementModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 rounded-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-400" />
            Share Achievement
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-all text-white/60"
          >
            ✕
          </button>
        </div>

        <GoldenKeysSocial
          achievement={achievement}
          referralCode={referralCode}
          onShare={() => {}}
        />
      </motion.div>
    </motion.div>
  );
}

export default GoldenKeysSocial;
