/**
 * SocialShareBar — Shareable moment generator for ATTI Campaign
 * ==============================================================
 * Provides share buttons for Twitter/X, copy-link, and generic
 * Web Share API. Used after locks, candle bursts, and initiative exploration.
 *
 * SEC-safe: All share text uses service/community language, never financial.
 */

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

// ── Share Content Templates ──

export type ShareMoment = "initiative" | "lock" | "candle_burst" | "general";

interface ShareContent {
  text: string;
  url: string;
  hashtags?: string[];
}

function buildShareContent(
  moment: ShareMoment,
  options: {
    initiativeName?: string;
    locksEarned?: number;
    referrerCode?: string;
    baseUrl?: string;
  } = {}
): ShareContent {
  const base = options.baseUrl || window.location.origin;
  const ref = options.referrerCode ? `?ref=${options.referrerCode}` : "";
  const initiative = options.initiativeName || "the platform";
  const url = `${base}/atti${ref}`;
  const hashtags = ["ATTI", "AllThatThatImplies", "LianaBanyan"];

  switch (moment) {
    case "initiative":
      return {
        text: `I just explored ${initiative} on Liana Banyan — a cooperative platform where creators keep 83.3% of every sale. Check it out:`,
        url,
        hashtags,
      };

    case "lock":
      return {
        text: `I earned ${options.locksEarned || 1} Lock${(options.locksEarned || 1) > 1 ? "s" : ""} exploring Liana Banyan! ${options.locksEarned || 1}/4 toward a Candle Burst. See what this platform is about:`,
        url,
        hashtags: [...hashtags, "CandleBurst"],
      };

    case "candle_burst":
      return {
        text: `Candle Burst! I just unlocked all 4 Locks on Liana Banyan — a cooperative platform where creators keep 83.3%. All That That Implies.`,
        url,
        hashtags: [...hashtags, "CandleBurst"],
      };

    case "general":
    default:
      return {
        text: `Check out Liana Banyan — a cooperative platform where creators keep 83.3% of every sale, backed by 2,097 patent claims. $5/year. No speculation. Just services.`,
        url,
        hashtags,
      };
  }
}

// ── Twitter/X Share URL ──

function getTwitterShareUrl(content: ShareContent): string {
  const params = new URLSearchParams({
    text: content.text,
    url: content.url,
  });
  if (content.hashtags?.length) {
    params.set("hashtags", content.hashtags.join(","));
  }
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

// ── Web Share API check ──

function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}

// ── Component ──

interface SocialShareBarProps {
  moment: ShareMoment;
  initiativeName?: string;
  locksEarned?: number;
  referrerCode?: string;
  /** Called when user shares (for click tracking) */
  onShare?: (platform: string) => void;
  /** Compact mode — just icons, no labels */
  compact?: boolean;
  className?: string;
}

export function SocialShareBar({
  moment,
  initiativeName,
  locksEarned,
  referrerCode,
  onShare,
  compact = false,
  className = "",
}: SocialShareBarProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const content = buildShareContent(moment, {
    initiativeName,
    locksEarned,
    referrerCode,
  });

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.("copy");
      toast({ title: "Link copied!" });
    } catch {
      toast({ title: "Could not copy link", variant: "destructive" });
    }
  }, [content.url, onShare, toast]);

  const handleTwitter = useCallback(() => {
    const url = getTwitterShareUrl(content);
    window.open(url, "_blank", "width=600,height=400");
    onShare?.("twitter");
  }, [content, onShare]);

  const handleWebShare = useCallback(async () => {
    if (!canUseWebShare()) return;
    try {
      await navigator.share({
        title: "Liana Banyan — All That That Implies",
        text: content.text,
        url: content.url,
      });
      onShare?.("native");
    } catch {
      // User cancelled — not an error
    }
  }, [content, onShare]);

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTwitter}
          className="h-8 w-8 p-0 text-white/60 hover:text-blue-400"
          aria-label="Share on Twitter/X"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
          className="h-8 w-8 p-0 text-white/60 hover:text-amber-400"
          aria-label="Copy share link"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        {canUseWebShare() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWebShare}
            className="h-8 w-8 p-0 text-white/60 hover:text-white"
            aria-label="Share via device share menu"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-xs text-white/50 font-medium flex items-center gap-1.5">
        <Share2 className="w-3 h-3" />
        Share this
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTwitter}
          className="border-white/20 text-white hover:bg-blue-500/20 hover:border-blue-400/50 gap-1.5"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Post on X
          <ExternalLink className="w-2.5 h-2.5 opacity-50" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="border-white/20 text-white hover:bg-amber-500/20 hover:border-amber-400/50 gap-1.5"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy Link
            </>
          )}
        </Button>
        {canUseWebShare() && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleWebShare}
            className="border-white/20 text-white hover:bg-white/10 gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
}

export default SocialShareBar;
