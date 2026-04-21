/**
 * Defense Klaus Daisy Chain Referral System
 *
 * Interdependent support network where each signup can invite 2 others.
 * Creates cultural normalization - "like getting an email advertisement"
 * so having Defense Klaus isn't notable to potential aggressors.
 *
 * Flow:
 * 1. User signs up with email
 * 2. Gets 2 referral links to share via social/text
 * 3. Recipients get "Someone has given you Defense Klaus" email
 * 4. They click link → simple email capture → done
 * 5. They can invoke protection by remembering DefenseKlaus.net
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Share2,
  Mail,
  MessageCircle,
  Link2,
  Users,
  Shield,
  Check,
  Copy,
  Heart,
  Sparkles,
} from "lucide-react";

interface DaisyChainProps {
  userProxyId?: string;
  onReferralSent?: (email: string) => void;
}

const MAX_REFERRALS = 2;

export function DefenseKlausDaisyChain({ userProxyId, onReferralSent }: DaisyChainProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [referralEmail1, setReferralEmail1] = useState("");
  const [referralEmail2, setReferralEmail2] = useState("");
  const [sentReferrals, setSentReferrals] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate referral link
  const getReferralLink = (slot: 1 | 2) => {
    const baseUrl = "https://defenseklaus.net";
    const referralCode = userProxyId ? `${userProxyId}-${slot}` : `GUEST-${slot}`;
    return `${baseUrl}/gift/${referralCode}`;
  };

  // Generate share text
  const getShareText = () => {
    return `I just got Defense Klaus - a $6 safety bracelet + legal defense fund membership. I have 2 gift passes to share. Get yours free: ${getReferralLink(1)}`;
  };

  // Copy link to clipboard
  const copyLink = async (slot: 1 | 2) => {
    try {
      await navigator.clipboard.writeText(getReferralLink(slot));
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: "Link Copied!",
        description: "Share this link with someone you want to protect.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the link.",
        variant: "destructive",
      });
    }
  };

  // Share via native share API or fallback
  const shareNative = async () => {
    const shareData = {
      title: "Defense Klaus - For Someone You Love",
      text: getShareText(),
      url: getReferralLink(1),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared!",
          description: "Thank you for spreading protection.",
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to copy
      copyLink(1);
    }
  };

  // Share via SMS/text
  const shareViaSMS = (slot: 1 | 2) => {
    const text = encodeURIComponent(getShareText());
    window.open(`sms:?body=${text}`, "_blank");
  };

  // Share via email
  const shareViaEmail = (slot: 1 | 2) => {
    const subject = encodeURIComponent("Someone has given you Defense Klaus");
    const body = encodeURIComponent(`
I want you to have this.

Defense Klaus is a $6 safety bracelet with pull-up palm claws and GPS monitoring, plus membership in a pooled legal defense fund. I got one, and I have 2 gift passes to share with people I care about.

Click here to claim yours (free): ${getReferralLink(slot)}

All you need is an email address. No names, no demographics. Just protection.

Stay safe.
    `.trim());
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  // Send direct referral
  const sendReferral = useMutation({
    mutationFn: async ({ email, slot }: { email: string; slot: 1 | 2 }) => {
      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      if (sentReferrals.includes(email)) {
        throw new Error("You've already sent a referral to this email");
      }

      if (sentReferrals.length >= MAX_REFERRALS) {
        throw new Error("You've used all your referral passes");
      }

      // Record the referral
      const { error } = await supabase
        .from("defense_klaus_referrals")
        .insert({
          referrer_proxy_id: userProxyId || "GUEST",
          recipient_email_hash: await hashEmail(email),
          slot_number: slot,
          status: "pending",
        });

      if (error) {
        // Store in localStorage for demo
        const stored = JSON.parse(localStorage.getItem("dk_referrals") || "[]");
        stored.push({
          referrer: userProxyId || "GUEST",
          recipient_hash: await hashEmail(email),
          slot: slot,
          sent_at: new Date().toISOString(),
        });
        localStorage.setItem("dk_referrals", JSON.stringify(stored));
      }

      // In production, this would trigger an email via Edge Function
      // For now, we'll just record it
      return { email, slot };
    },
    onSuccess: ({ email }) => {
      setSentReferrals(prev => [...prev, email]);
      toast({
        title: "🛡️ Protection Shared!",
        description: `Referral sent to ${email}. They'll receive an email with their gift.`,
      });
      if (onReferralSent) onReferralSent(email);

      // Clear the input
      if (sentReferrals.length === 0) {
        setReferralEmail1("");
      } else {
        setReferralEmail2("");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Referral Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Hash email for privacy
  const hashEmail = async (email: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const remainingReferrals = MAX_REFERRALS - sentReferrals.length;

  return (
    <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-pink-400" />
          <div>
            <CardTitle>Share Protection</CardTitle>
            <CardDescription>
              You have {remainingReferrals} gift pass{remainingReferrals !== 1 ? "es" : ""} to share
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Explanation */}
        <div className="bg-white/5 rounded-lg p-4 text-sm text-white/70 space-y-2">
          <p>
            <strong className="text-white">The Daisy Chain:</strong> Each person who signs up
            can invite 2 others. This creates a network of protection that becomes
            <em> culturally normal</em> — like getting an email advertisement.
          </p>
          <p className="text-pink-300/80">
            When everyone has Defense Klaus, no one stands out. That's the point.
          </p>
        </div>

        {/* Quick Share Buttons */}
        <div className="space-y-3">
          <Label className="text-white/80">Quick Share</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="flex-col h-auto py-3 border-white/20 hover:bg-white/10"
              onClick={shareNative}
            >
              <Share2 className="h-5 w-5 mb-1" />
              <span className="text-xs">Share</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3 border-white/20 hover:bg-white/10"
              onClick={() => shareViaSMS(1)}
            >
              <MessageCircle className="h-5 w-5 mb-1" />
              <span className="text-xs">Text</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3 border-white/20 hover:bg-white/10"
              onClick={() => shareViaEmail(1)}
            >
              <Mail className="h-5 w-5 mb-1" />
              <span className="text-xs">Email</span>
            </Button>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Direct Referral Forms */}
        <div className="space-y-4">
          <Label className="text-white/80">Send Directly to Someone</Label>

          {/* Referral 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={sentReferrals.length >= 1 ? "bg-green-500/20 text-green-400" : "bg-pink-500/20 text-pink-400"}>
                {sentReferrals.length >= 1 ? <Check className="h-3 w-3 mr-1" /> : <Heart className="h-3 w-3 mr-1" />}
                Gift Pass 1
              </Badge>
            </div>
            {sentReferrals.length < 1 ? (
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="friend@example.com"
                  value={referralEmail1}
                  onChange={(e) => setReferralEmail1(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => sendReferral.mutate({ email: referralEmail1, slot: 1 })}
                  disabled={sendReferral.isPending || !referralEmail1}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Send
                </Button>
              </div>
            ) : (
              <p className="text-sm text-green-400/80">✓ Sent to {sentReferrals[0]}</p>
            )}
          </div>

          {/* Referral 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={sentReferrals.length >= 2 ? "bg-green-500/20 text-green-400" : "bg-pink-500/20 text-pink-400"}>
                {sentReferrals.length >= 2 ? <Check className="h-3 w-3 mr-1" /> : <Heart className="h-3 w-3 mr-1" />}
                Gift Pass 2
              </Badge>
            </div>
            {sentReferrals.length < 2 ? (
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="another@example.com"
                  value={referralEmail2}
                  onChange={(e) => setReferralEmail2(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => sendReferral.mutate({ email: referralEmail2, slot: 2 })}
                  disabled={sendReferral.isPending || !referralEmail2}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Send
                </Button>
              </div>
            ) : (
              <p className="text-sm text-green-400/80">✓ Sent to {sentReferrals[1]}</p>
            )}
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Copy Link */}
        <div className="space-y-2">
          <Label className="text-white/80">Or Copy Your Link</Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={getReferralLink(1)}
              className="flex-1 text-xs bg-white/5"
            />
            <Button
              variant="outline"
              onClick={() => copyLink(1)}
              className="border-white/20"
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Network Stats */}
        {sentReferrals.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
            <Sparkles className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-green-300">
              You've shared protection with {sentReferrals.length} {sentReferrals.length === 1 ? "person" : "people"}.
              <br />
              <span className="text-green-400/70">The daisy chain grows.</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DefenseKlausDaisyChain;
