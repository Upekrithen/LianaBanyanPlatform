/**
 * BEACON RUN CUE CARD
 * ===================
 * Shareable card for Beacon Runs with click tracking and Frame Lock integration.
 * 
 * The viral loop:
 * 1. Creator finishes a Beacon Run and gets a Cue Card
 * 2. Creator shares to TikTok/social with their QR stamp
 * 3. Friends click the shared link
 * 4. Clicks unlock Frame Locks on the linked Deck Card
 * 5. 20 clicks = full unlock = Candle Burst reward
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Ghost,
  Gamepad2,
  Share2,
  Copy,
  Twitter,
  MapPin,
  Clock,
  Trophy,
  Users,
  Zap,
  CheckCircle,
  ExternalLink,
  QrCode,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { generateShareId, getClickCount } from "@/lib/cueCardClickTracking";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface BeaconRun {
  id: string;
  name: string;
  description?: string;
  total_beacons: number;
  estimated_minutes: number;
  ante_credits: number;
  prize_pool_credits: number;
  creator_id: string;
  creator_name?: string;
  published_at?: string;
  play_count?: number;
  best_time_seconds?: number;
}

interface BeaconRunCueCardProps {
  beaconRun: BeaconRun;
  variant?: "compact" | "full" | "share";
  showShareButton?: boolean;
  onShare?: () => void;
}

export function BeaconRunCueCard({
  beaconRun,
  variant = "full",
  showShareButton = true,
  onShare,
}: BeaconRunCueCardProps) {
  const { user } = useAuth();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const templateId = `beacon-run-${beaconRun.id}`;
  const shareId = user ? generateShareId(user.id, templateId) : null;
  const runUrl = `https://lianabanyan.com/beacon-run/${beaconRun.id}`;
  const shareUrl = shareId ? `${runUrl}?ref=${shareId}` : runUrl;

  // Get click count for this user's shares
  const { data: clickCount = 0, isError: clickError } = useQuery({
    queryKey: ["beacon-run-clicks", user?.id, templateId],
    queryFn: () => user ? getClickCount(user.id, templateId) : 0,
    enabled: !!user,
  });

  const shareText = `🎮 Can you beat my Beacon Run? "${beaconRun.name}" - ${beaconRun.total_beacons} waypoints in Ghost Mode. #BeaconRun #LianaBanyan`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied! Share it to earn clicks.");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
    onShare?.();
  };

  const shareToTikTok = () => {
    // TikTok doesn't have a direct share URL, so copy link and open TikTok
    copyToClipboard();
    toast.info("Link copied! Paste it in your TikTok caption.");
    onShare?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate Frame Lock progress (5 clicks per lock, 4 locks total)
  const locksUnlocked = Math.min(4, Math.floor(clickCount / 5));
  const clicksToNextLock = 5 - (clickCount % 5);
  const isFullyUnlocked = locksUnlocked >= 4;

  if (variant === "compact") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Gamepad2 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{beaconRun.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3 h-3" />
                <span>{beaconRun.total_beacons} waypoints</span>
                <Clock className="w-3 h-3 ml-2" />
                <span>~{beaconRun.estimated_minutes} min</span>
              </div>
            </div>
            <Badge variant="outline" className="border-purple-300 text-purple-600">
              <Ghost className="w-3 h-3 mr-1" />
              Ghost
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        ref={cardRef}
        className="overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-orange-500/50"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              <span className="font-semibold">Beacon Run</span>
            </div>
            <Badge className="bg-purple-600/80 text-white border-purple-400">
              <Ghost className="w-3 h-3 mr-1" />
              Ghost Mode Only
            </Badge>
          </div>
        </div>

        <CardContent className="p-5 space-y-4 text-white">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold">{beaconRun.name}</h2>
            {beaconRun.description && (
              <p className="text-slate-300 mt-1 text-sm line-clamp-2">
                {beaconRun.description}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <MapPin className="w-5 h-5 mx-auto text-orange-400 mb-1" />
              <div className="text-lg font-bold">{beaconRun.total_beacons}</div>
              <div className="text-xs text-slate-400">Waypoints</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 mx-auto text-blue-400 mb-1" />
              <div className="text-lg font-bold">~{beaconRun.estimated_minutes}</div>
              <div className="text-xs text-slate-400">Minutes</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <Trophy className="w-5 h-5 mx-auto text-amber-400 mb-1" />
              <div className="text-lg font-bold">
                {beaconRun.best_time_seconds 
                  ? formatTime(beaconRun.best_time_seconds)
                  : "—"}
              </div>
              <div className="text-xs text-slate-400">Best Time</div>
            </div>
          </div>

          {/* Prize Info */}
          {(beaconRun.ante_credits > 0 || beaconRun.prize_pool_credits > 0) && (
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium">Competition Mode</span>
                </div>
                <div className="text-right">
                  {beaconRun.ante_credits > 0 && (
                    <div className="text-xs text-slate-300">
                      Entry: {beaconRun.ante_credits} Credits
                    </div>
                  )}
                  {beaconRun.prize_pool_credits > 0 && (
                    <div className="text-sm font-bold text-amber-400">
                      Prize: {beaconRun.prize_pool_credits} Credits
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Frame Lock Progress (if user is logged in and has shares) */}
          {user && clickCount > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium">Share Progress</span>
                </div>
                <span className="text-sm text-slate-300">
                  {clickCount} clicks
                </span>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded ${
                      i < locksUnlocked
                        ? "bg-orange-500"
                        : "bg-slate-600"
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {isFullyUnlocked
                  ? "🎉 Fully unlocked! Candle Burst earned!"
                  : `${clicksToNextLock} more clicks to unlock next frame`}
              </div>
            </div>
          )}

          {/* Play Stats */}
          <div className="flex items-center justify-around py-2 border-y border-slate-600">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-400">
                <Users className="w-4 h-4" />
                <span className="font-bold">{beaconRun.play_count || 0}</span>
              </div>
              <span className="text-xs text-slate-400">Players</span>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-300">
                {beaconRun.creator_name || "Anonymous"}
              </div>
              <span className="text-xs text-slate-400">Creator</span>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-400">🪶</div>
              <span className="text-xs text-slate-400">Crow Feathers</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
              <Ghost className="w-4 h-4 mr-2" />
              Play in Ghost Mode
            </Button>
            {showShareButton && (
              <Button
                variant="outline"
                className="border-slate-500 text-white hover:bg-slate-700"
                onClick={() => setShareDialogOpen(true)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-700">
            <p>"The crow remembers what the ghost forgets."</p>
            <p className="font-medium text-slate-400 mt-1">
              lianabanyan.com/beacon-run/{beaconRun.id.slice(0, 8)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-orange-500" />
              Share Beacon Run
            </DialogTitle>
            <DialogDescription>
              Share "{beaconRun.name}" and earn clicks toward your Deck Card unlock!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Click Progress */}
            {user && (
              <div className="bg-slate-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Your Share Progress</span>
                  <Badge variant="outline">
                    {clickCount}/20 clicks
                  </Badge>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 h-3 rounded ${
                        i < locksUnlocked
                          ? "bg-orange-500"
                          : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Every 5 clicks unlocks a Frame Lock. 20 clicks = Candle Burst reward!
                </p>
              </div>
            )}

            {/* Share Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-pink-50 hover:border-pink-300"
                onClick={shareToTikTok}
              >
                <span className="text-xl">📱</span>
                <span className="text-xs">TikTok</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 hover:border-blue-300"
                onClick={shareToTwitter}
              >
                <Twitter className="w-5 h-5 text-blue-400" />
                <span className="text-xs">Twitter</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-slate-50"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
              </Button>
            </div>

            {/* Share Link */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-md px-3 py-2 text-sm truncate font-mono">
                {shareUrl}
              </div>
            </div>

            {/* Share Message */}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Share message:</p>
              <p className="text-sm">{shareText}</p>
            </div>

            {/* QR Code Hint */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <QrCode className="w-4 h-4" />
              <span>Your unique QR stamp is embedded in the share link</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BeaconRunCueCard;
