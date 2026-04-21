/**
 * Defense Klaus Submarine Door
 *
 * Ultra-simple email capture page for DefenseKlaus.net
 * "Someone has given you Defense Klaus"
 *
 * Flow:
 * 1. User arrives via referral link
 * 2. Enters email
 * 3. Gets confirmation message
 * 4. Page closes or shows "remember DefenseKlaus.net"
 *
 * No names, no demographics, just an email.
 * They can invoke protection by remembering the domain.
 */

import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Shield, Check, Mail, Heart, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";

export default function DefenseKlausSubmarineDoor() {
  const { referralCode } = useParams<{ referralCode?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [proxyId, setProxyId] = useState<string | null>(null);

  // Parse referral code if present
  const referrerInfo = referralCode ? {
    referrerProxyId: referralCode.split("-").slice(0, -1).join("-"),
    slot: parseInt(referralCode.split("-").pop() || "1"),
  } : null;

  // Hash email for privacy
  const hashEmail = async (emailToHash: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(emailToHash.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0")).join("");
  };

  // Generate proxy ID
  const generateProxyId = (): string => {
    const stored = JSON.parse(localStorage.getItem("dk_vouchers") || "[]");
    const count = stored.length;
    return `DF-${String(count + 1).padStart(7, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const emailHash = await hashEmail(email);
      const newProxyId = generateProxyId();

      // Try to save to database
      const { error } = await supabase
        .from("defense_klaus_vouchers")
        .insert({
          proxy_id: newProxyId,
          email_hash: emailHash,
          voucher_type: "both",
          is_donated: true,
          qr_code_data: JSON.stringify({
            type: "defense_klaus_voucher",
            proxy_id: newProxyId,
            verification: emailHash.substring(0, 8),
            issued: new Date().toISOString(),
            referrer: referrerInfo?.referrerProxyId || null,
          }),
        });

      if (error) {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem("dk_vouchers") || "[]");
        stored.push({
          id: crypto.randomUUID(),
          proxy_id: newProxyId,
          email_hash: emailHash,
          voucher_type: "both",
          is_donated: true,
          referrer: referrerInfo?.referrerProxyId || null,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem("dk_vouchers", JSON.stringify(stored));
      }

      // Update referral status if this came from a referral
      if (referrerInfo) {
        await supabase
          .from("defense_klaus_referrals")
          .update({ status: "accepted", accepted_at: new Date().toISOString() })
          .eq("referrer_proxy_id", referrerInfo.referrerProxyId)
          .eq("slot_number", referrerInfo.slot);
      }

      setProxyId(newProxyId);
      setIsComplete(true);

    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <PortalPageLayout variant="stage" maxWidth="xl" xrayId="defense-klaus-submarine" className="flex flex-col justify-center">
        <Card className="max-w-md w-full bg-gray-900/80 border-green-500/30">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-green-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">You're Protected</h1>
              <p className="text-white/60">
                Your Defense Klaus registration is complete.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <p className="text-sm text-white/80">
                <strong className="text-white">Remember:</strong>
              </p>
              <p className="text-lg font-mono text-purple-400">
                DefenseKlaus.net
              </p>
              <p className="text-xs text-white/50">
                Visit this address if you ever need to invoke your protection.
              </p>
            </div>

            {proxyId && (
              <div className="text-xs text-white/40">
                Your ID: <span className="font-mono">{proxyId}</span>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <p className="text-sm text-white/60">
                You now have <strong className="text-pink-400">2 gift passes</strong> to share.
              </p>
              <Button
                onClick={() => navigate("/initiatives/defense-klaus")}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Heart className="h-4 w-4 mr-2" />
                Share Protection with Others
              </Button>
            </div>

            <p className="text-xs text-white/30 pt-4">
              This window can be closed. Your registration is saved.
            </p>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="defense-klaus-submarine" className="flex flex-col justify-center">
      <Card className="max-w-md w-full bg-gray-900/80 border-purple-500/30">
        <CardContent className="pt-8 pb-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <img
              src="/images/defense-klaus-shield.png"
              alt="Defense Klaus Shield"
              className="h-[200px] w-auto mx-auto drop-shadow-xl"
            />

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">
                Someone has given you
                <br />
                <span className="text-purple-400">Defense Klaus</span>
              </h1>
              {referrerInfo && (
                <p className="text-sm text-white/50">
                  Gift from {referrerInfo.referrerProxyId}
                </p>
              )}
            </div>
          </div>

          {/* What You Get */}
          <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
            <p className="text-white/80 font-semibold">This includes:</p>
            <ul className="text-white/60 space-y-1">
              <li>✓ $6 Safety Bracelet (preorder)</li>
              <li>✓ Legal Defense Fund membership</li>
              <li>✓ $5/year platform membership</li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Enter your email to claim
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/20"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? "Registering..." : "Claim My Protection"}
            </Button>
          </form>

          {/* Privacy Note */}
          <div className="flex items-start gap-2 text-xs text-white/40">
            <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              Only your email is stored (hashed for privacy). No names, no demographics.
              You can invoke your protection anytime by visiting <strong>DefenseKlaus.net</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
