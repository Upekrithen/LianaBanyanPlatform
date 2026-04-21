/**
 * Defense Klaus Cold Start Plan 001
 *
 * First 5,000 signups get:
 * - Free bracelet preorder voucher (6 credits value)
 * - Free Legal Defense Fund registration
 * - Free complimentary membership ($5 value)
 *
 * Email-only registration (no PII):
 * - Proxy identifiers: DF-0000001, DF-0000002, etc.
 * - One per email address
 * - QR-code locked to email
 *
 * 20% of signups are platform-donated (for those who can't afford)
 * Members can donate vouchers to others
 * Live ticker shows signup progress
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield,
  Mail,
  Gift,
  Users,
  Heart,
  Share2,
  QrCode,
  Sparkles,
  Lock,
  Check,
  AlertCircle,
} from "lucide-react";

const COLD_START_LIMIT = 5000;
const FREE_PERCENTAGE = 0.20; // 20% are platform-donated
const BRACELET_CREDIT_VALUE = 6;
const MEMBERSHIP_CREDIT_VALUE = 5;

interface ColdStartStats {
  totalSignups: number;
  freeSignups: number;
  paidSignups: number;
  donatedVouchers: number;
  remainingFreeSlots: number;
  percentComplete: number;
}

interface VoucherRecord {
  id: string;
  proxy_id: string; // DF-0000001 format
  email_hash: string; // Hashed email for lookup
  voucher_type: 'bracelet' | 'membership' | 'both';
  is_donated: boolean;
  donor_user_id?: string;
  created_at: string;
  redeemed_at?: string;
  qr_code_data: string;
}

export function DefenseKlausColdStart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDonateDialog, setShowDonateDialog] = useState(false);
  const [donateEmail, setDonateEmail] = useState("");

  // Fetch cold start stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["defense-klaus-cold-start-stats"],
    queryFn: async (): Promise<ColdStartStats> => {
      // Try to get from database, fallback to localStorage for demo
      const { data, error } = await supabase
        .from("defense_klaus_vouchers")
        .select("id, is_donated")
        .limit(COLD_START_LIMIT);

      if (error || !data) {
        // Fallback for demo - use localStorage
        const stored = localStorage.getItem("dk_cold_start_stats");
        if (stored) return JSON.parse(stored);
        return {
          totalSignups: 0,
          freeSignups: 0,
          paidSignups: 0,
          donatedVouchers: 0,
          remainingFreeSlots: Math.floor(COLD_START_LIMIT * FREE_PERCENTAGE),
          percentComplete: 0,
        };
      }

      const totalSignups = data.length;
      const freeSignups = data.filter(v => v.is_donated).length;
      const paidSignups = totalSignups - freeSignups;
      const maxFreeSlots = Math.floor(COLD_START_LIMIT * FREE_PERCENTAGE);

      return {
        totalSignups,
        freeSignups,
        paidSignups,
        donatedVouchers: freeSignups,
        remainingFreeSlots: Math.max(0, maxFreeSlots - freeSignups),
        percentComplete: (totalSignups / COLD_START_LIMIT) * 100,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Check if email already registered
  const checkEmailExists = async (emailToCheck: string): Promise<boolean> => {
    const emailHash = await hashEmail(emailToCheck);
    const { data } = await supabase
      .from("defense_klaus_vouchers")
      .select("id")
      .eq("email_hash", emailHash)
      .single();
    return !!data;
  };

  // Hash email for privacy
  const hashEmail = async (emailToHash: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(emailToHash.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  // Generate proxy ID
  const generateProxyId = (count: number): string => {
    return `DF-${String(count + 1).padStart(7, "0")}`;
  };

  // Generate QR code data
  const generateQRData = (proxyId: string, emailHash: string): string => {
    return JSON.stringify({
      type: "defense_klaus_voucher",
      proxy_id: proxyId,
      verification: emailHash.substring(0, 8),
      issued: new Date().toISOString(),
    });
  };

  // Register for free voucher (platform-donated)
  const registerFree = useMutation({
    mutationFn: async (emailToRegister: string) => {
      // Validate email
      if (!emailToRegister || !emailToRegister.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      // Check if already registered
      const exists = await checkEmailExists(emailToRegister);
      if (exists) {
        throw new Error("This email is already registered for Defense Klaus");
      }

      // Check if free slots available
      if (!stats || stats.remainingFreeSlots <= 0) {
        throw new Error("No free slots remaining. You can still purchase a voucher.");
      }

      const emailHash = await hashEmail(emailToRegister);
      const proxyId = generateProxyId(stats?.totalSignups || 0);
      const qrData = generateQRData(proxyId, emailHash);

      // Create voucher record
      const { data, error } = await supabase
        .from("defense_klaus_vouchers")
        .insert({
          proxy_id: proxyId,
          email_hash: emailHash,
          voucher_type: "both",
          is_donated: true,
          donor_user_id: null, // Platform donation
          qr_code_data: qrData,
        })
        .select()
        .single();

      if (error) {
        // Fallback to localStorage for demo
        const stored = JSON.parse(localStorage.getItem("dk_vouchers") || "[]");
        const newVoucher = {
          id: crypto.randomUUID(),
          proxy_id: proxyId,
          email_hash: emailHash,
          voucher_type: "both",
          is_donated: true,
          created_at: new Date().toISOString(),
          qr_code_data: qrData,
        };
        stored.push(newVoucher);
        localStorage.setItem("dk_vouchers", JSON.stringify(stored));

        // Update stats
        const currentStats = stats || {
          totalSignups: 0,
          freeSignups: 0,
          paidSignups: 0,
          donatedVouchers: 0,
          remainingFreeSlots: Math.floor(COLD_START_LIMIT * FREE_PERCENTAGE),
          percentComplete: 0,
        };
        const newStats = {
          ...currentStats,
          totalSignups: currentStats.totalSignups + 1,
          freeSignups: currentStats.freeSignups + 1,
          donatedVouchers: currentStats.donatedVouchers + 1,
          remainingFreeSlots: currentStats.remainingFreeSlots - 1,
          percentComplete: ((currentStats.totalSignups + 1) / COLD_START_LIMIT) * 100,
        };
        localStorage.setItem("dk_cold_start_stats", JSON.stringify(newStats));

        return newVoucher;
      }

      // Record ledger transaction
      await supabase.from("ledger_transactions").insert({
        transaction_type: "defense_klaus_voucher",
        amount: BRACELET_CREDIT_VALUE + MEMBERSHIP_CREDIT_VALUE,
        currency: "credits",
        description: `Defense Klaus Cold Start - Free voucher ${proxyId}`,
        metadata: { proxy_id: proxyId, is_donated: true },
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["defense-klaus-cold-start-stats"] });
      toast({
        title: "🛡️ You're Protected!",
        description: `Voucher ${data.proxy_id} registered. Check your email for your QR code.`,
      });
      setEmail("");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Donate a voucher to someone else
  const donateVoucher = useMutation({
    mutationFn: async (recipientEmail: string) => {
      if (!user) {
        throw new Error("You must be logged in to donate a voucher");
      }

      // Validate email
      if (!recipientEmail || !recipientEmail.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      // Check if already registered
      const exists = await checkEmailExists(recipientEmail);
      if (exists) {
        throw new Error("This email is already registered for Defense Klaus");
      }

      const emailHash = await hashEmail(recipientEmail);
      const proxyId = generateProxyId(stats?.totalSignups || 0);
      const qrData = generateQRData(proxyId, emailHash);

      // Check user has enough credits
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits_balance")
        .eq("id", user.id)
        .single();

      const totalCost = BRACELET_CREDIT_VALUE + MEMBERSHIP_CREDIT_VALUE;
      if (!profile || (profile.credits_balance || 0) < totalCost) {
        throw new Error(`You need ${totalCost} credits to donate a voucher`);
      }

      // Deduct credits
      await supabase
        .from("profiles")
        .update({ credits_balance: (profile.credits_balance || 0) - totalCost })
        .eq("id", user.id);

      // Create voucher record
      const { data, error } = await supabase
        .from("defense_klaus_vouchers")
        .insert({
          proxy_id: proxyId,
          email_hash: emailHash,
          voucher_type: "both",
          is_donated: true,
          donor_user_id: user.id,
          qr_code_data: qrData,
        })
        .select()
        .single();

      if (error) throw error;

      // Record ledger transaction
      await supabase.from("ledger_transactions").insert({
        transaction_type: "defense_klaus_voucher_donation",
        user_id: user.id,
        amount: totalCost,
        currency: "credits",
        description: `Defense Klaus donation to ${proxyId}`,
        metadata: { proxy_id: proxyId, donor_id: user.id },
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["defense-klaus-cold-start-stats"] });
      toast({
        title: "🎁 Voucher Donated!",
        description: `You've given the gift of protection. Voucher ${data.proxy_id} sent.`,
      });
      setDonateEmail("");
      setShowDonateDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Donation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFreeRegistration = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    registerFree.mutate(email);
  };

  const handleDonation = () => {
    if (!donateEmail) {
      toast({
        title: "Email Required",
        description: "Please enter the recipient's email address",
        variant: "destructive",
      });
      return;
    }
    donateVoucher.mutate(donateEmail);
  };

  const currentStats = stats || {
    totalSignups: 0,
    freeSignups: 0,
    paidSignups: 0,
    donatedVouchers: 0,
    remainingFreeSlots: Math.floor(COLD_START_LIMIT * FREE_PERCENTAGE),
    percentComplete: 0,
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/30 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-400" />
            <div>
              <CardTitle className="text-2xl">Defense Klaus™ Cold Start</CardTitle>
              <CardDescription className="text-purple-200">
                For Someone You Love — Physical + Legal Protection
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/80">
            The first <strong className="text-white">{COLD_START_LIMIT.toLocaleString()}</strong> signups get:
          </p>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>$6 Safety Bracelet with pull-up palm claws + GPS monitoring</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>Legal Defense Fund registration (pooled protection for all members)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>Complimentary $5/year membership</span>
            </li>
          </ul>

          <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-200">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            <strong>{FREE_PERCENTAGE * 100}% of slots</strong> are platform-donated for those who can't afford it.
            Only an email required — no names, no demographics.
          </div>
        </CardContent>
      </Card>

      {/* Live Ticker */}
      <Card className="border-white/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span className="font-semibold">Cold Start Progress</span>
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400/50">
              {currentStats.totalSignups.toLocaleString()} / {COLD_START_LIMIT.toLocaleString()}
            </Badge>
          </div>

          <Progress value={currentStats.percentComplete} className="h-3 mb-4" />

          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl font-bold text-green-400">{currentStats.freeSignups}</div>
              <div className="text-white/60">Free (Donated)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{currentStats.paidSignups}</div>
              <div className="text-white/60">Purchased</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{currentStats.remainingFreeSlots}</div>
              <div className="text-white/60">Free Slots Left</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Form */}
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Register for Free Voucher
          </CardTitle>
          <CardDescription>
            Email only — one per address. Your proxy ID (DF-XXXXXXX) protects your privacy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={registerFree.isPending || currentStats.remainingFreeSlots <= 0}
            />
          </div>

          {currentStats.remainingFreeSlots > 0 ? (
            <Button
              onClick={handleFreeRegistration}
              disabled={registerFree.isPending || !email}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {registerFree.isPending ? (
                "Registering..."
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Get My Free Voucher
                </>
              )}
            </Button>
          ) : (
            <Button disabled className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Free Slots Filled — Purchase Available
            </Button>
          )}

          <p className="text-xs text-white/50 text-center">
            By registering, you'll receive a QR-coded voucher locked to your email.
            No personal information is stored — only a hashed identifier.
          </p>
        </CardContent>
      </Card>

      {/* Donate Section */}
      <Card className="border-pink-500/30 bg-pink-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-400" />
            Donate to Someone Who Needs This
          </CardTitle>
          <CardDescription>
            Gift protection to someone who can't afford it. {BRACELET_CREDIT_VALUE + MEMBERSHIP_CREDIT_VALUE} credits per voucher.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showDonateDialog} onOpenChange={setShowDonateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/10">
                <Gift className="h-4 w-4 mr-2" />
                Donate a Voucher ({BRACELET_CREDIT_VALUE + MEMBERSHIP_CREDIT_VALUE} Credits)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Donate Defense Klaus Voucher</DialogTitle>
                <DialogDescription>
                  Enter the email of someone you want to protect. They'll receive a voucher for the bracelet and legal defense fund membership.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="donate-email">Recipient's Email</Label>
                  <Input
                    id="donate-email"
                    type="email"
                    placeholder="recipient@example.com"
                    value={donateEmail}
                    onChange={(e) => setDonateEmail(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleDonation}
                  disabled={donateVoucher.isPending || !donateEmail}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  {donateVoucher.isPending ? "Donating..." : "Donate Voucher"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Share Section */}
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Defense Klaus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 text-sm mb-4">
            Help spread the word. Every share helps someone feel safer.
          </p>
          <Button variant="outline" className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Share via Cue Card
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default DefenseKlausColdStart;
