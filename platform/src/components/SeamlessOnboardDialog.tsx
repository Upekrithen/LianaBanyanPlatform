/**
 * SEAMLESS ONBOARD DIALOG — No Barriers
 * =======================================
 * The universal inline onboarding component. Instead of redirecting to /auth,
 * this dialog pops up when an unauthenticated user tries to take a protected action.
 *
 * Philosophy: Show everything. Gate nothing. When they're ready to act,
 * make signing up as effortless as possible — and immediately do what they
 * were trying to do.
 *
 * Features:
 * - Inline signup/login (no page navigation)
 * - Optional combined payment (e.g., $505 = $5 membership + $500 sponsorship)
 * - Remembers what action they were trying to take
 * - Completes the action automatically after auth
 * - Mobile-responsive
 * - Can be used from any page
 *
 * Usage:
 *   const { openOnboard } = useSeamlessOnboard();
 *   onClick={() => {
 *     if (!user) {
 *       openOnboard({
 *         reason: "sponsor memberships",
 *         actionLabel: "Sponsor $500",
 *         membershipIncluded: true,
 *         additionalAmount: 500,
 *         additionalLabel: "Sponsorship",
 *         onComplete: () => { triggerCheckout(500); }
 *       });
 *       return;
 *     }
 *     triggerCheckout(500);
 *   }}
 */

import { useState, useCallback, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles, Shield, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OnboardConfig {
  /** Why we need them to sign up — shown in the dialog subtitle */
  reason: string;
  /** Label for the action button after signup (e.g., "Sponsor $500") */
  actionLabel?: string;
  /** If true, shows $5 membership as part of the flow */
  membershipIncluded?: boolean;
  /** Additional dollar amount being charged (e.g., sponsorship amount) */
  additionalAmount?: number;
  /** Label for the additional charge (e.g., "Sponsorship") */
  additionalLabel?: string;
  /** Called after successful signup/login — your action proceeds */
  onComplete?: () => void;
  /** Red Carpet grant token (marks grant as used) */
  grantToken?: string;
  /** Cue card click token (for conversion tracking) */
  clickToken?: string;
  /** Introducer/referrer user ID (creates referral record) */
  introducer_user_id?: string;
  /** Business card ID (for attribution) */
  cardId?: string;
  /** Node type (food, local-business, etc.) */
  nodeType?: string;
  /** Called after successful auth with userId and introducerId */
  onAuthSuccess?: (userId: string, introducerId: string | null) => void;
}

interface SeamlessOnboardContextType {
  openOnboard: (config: OnboardConfig) => void;
  isOpen: boolean;
}

const SeamlessOnboardContext = createContext<SeamlessOnboardContextType>({
  openOnboard: () => {},
  isOpen: false,
});

export function useSeamlessOnboard() {
  return useContext(SeamlessOnboardContext);
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function SeamlessOnboardProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<OnboardConfig | null>(null);

  const openOnboard = useCallback((cfg: OnboardConfig) => {
    setConfig(cfg);
    setOpen(true);
  }, []);

  return (
    <SeamlessOnboardContext.Provider value={{ openOnboard, isOpen: open }}>
      {children}
      {config && (
        <SeamlessOnboardDialogInner
          open={open}
          onOpenChange={setOpen}
          config={config}
        />
      )}
    </SeamlessOnboardContext.Provider>
  );
}

// ─── Dialog Component ───────────────────────────────────────────────────────

function SeamlessOnboardDialogInner({
  open,
  onOpenChange,
  config,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: OnboardConfig;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [step, setStep] = useState<"auth" | "ready">("auth");

  const emailSchema = z.string().email("Please enter a valid email address");
  const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

  // If user is already logged in (e.g., they just authenticated), move to ready
  if (user && step === "auth") {
    setStep("ready");
  }

  const totalAmount = (config.membershipIncluded ? 5 : 0) + (config.additionalAmount || 0);

  // Helper: execute post-auth writes (referral tracking, onboarding path, etc.)
  const executePostAuthWrites = async (userId: string) => {
    let referralRowId: string | null = null;

    // Write 1: Mark Red Carpet grant as used (if grantToken provided)
    if (config.grantToken) {
      try {
        await supabase.rpc('mark_red_carpet_grant_used', { p_grant_token: config.grantToken });
      } catch (error) {
        console.error('Failed to mark grant as used:', error);
        // Non-blocking: auth succeeded, attribution write failed
      }
    }

    // Write 2: Insert mc_onboarding_paths row
    try {
      await supabase.from('mc_onboarding_paths').upsert({
        user_id: userId,
        current_step: 1,
        path_variant: 'standard',
        started_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('Failed to record onboarding path:', error);
      // Non-blocking
    }

    // Write 4: Create creator_referrals record (if introducer_user_id provided)
    // (Execute before Write 3 so we have referralRowId)
    if (config.introducer_user_id) {
      try {
        const { data: referralRow, error } = await supabase.from('creator_referrals').insert({
          referrer_id: config.introducer_user_id,
          introducer_user_id: config.introducer_user_id,
          referred_handle: email || '',
          referred_platform: 'email',
          cue_card_sent_at: new Date().toISOString(),
          referred_user_id: userId,
          business_node_type: config.nodeType || null,
          business_card_id: config.cardId || null,
          first_seen_at: new Date().toISOString(),
        }).select('id').single();

        if (!error && referralRow) {
          referralRowId = referralRow.id;
        }
      } catch (error) {
        console.error('Failed to create referral record:', error);
        // Non-blocking
      }
    }

    // Write 3: Mark cue_card_share_clicks as converted (if both grantToken AND clickToken)
    if (config.grantToken && config.clickToken && referralRowId) {
      try {
        await supabase
          .from('cue_card_share_clicks')
          .update({
            converted: true,
            conversion_event_id: referralRowId,
          })
          .eq('click_token', config.clickToken);
      } catch (error) {
        console.error('Failed to mark share click as converted:', error);
        // Non-blocking
      }
    }

    // Fire onAuthSuccess callback if provided
    config.onAuthSuccess?.(userId, config.introducer_user_id || null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (!fullName.trim()) {
        toast.error("Please enter your name");
        return;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
        data: { full_name: fullName },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Sign up failed. Please try again.");
    } else {
      toast.success("Account created! Check your email to verify.");

      // Execute post-auth writes (referral tracking, onboarding path, etc.)
      if (data.user) {
        await executePostAuthWrites(data.user.id);
      }

      setStep("ready");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Sign in failed. Please check your credentials.");
    } else {
      toast.success("Signed in!");

      // Execute post-auth writes (referral tracking, onboarding path, etc.)
      if (data.user) {
        await executePostAuthWrites(data.user.id);
      }

      setStep("ready");
    }
  };

  const handleProceed = () => {
    onOpenChange(false);
    // Run the completion callback (triggers the original action)
    if (config.onComplete) {
      // Small delay to let dialog close and auth state propagate
      setTimeout(() => config.onComplete?.(), 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "auth" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-500" />
                Quick Signup to {config.reason}
              </DialogTitle>
              <DialogDescription>
                {totalAmount > 0 ? (
                  <span>
                    Create your account, then we'll handle payment.{" "}
                    <span className="font-medium text-foreground">
                      No barriers — takes 30 seconds.
                    </span>
                  </span>
                ) : (
                  "Create your account to continue. No barriers — takes 30 seconds."
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Cost breakdown if there's a payment */}
            {totalAmount > 0 && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-1.5">
                <p className="text-xs font-medium text-green-700 dark:text-green-400">What you'll pay:</p>
                {config.membershipIncluded && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Membership ($5/year){" "}
                      <a href="/economics" className="text-primary underline text-xs" target="_blank">
                        learn more
                      </a>
                    </span>
                    <span className="font-medium">$5</span>
                  </div>
                )}
                {config.additionalAmount && config.additionalAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{config.additionalLabel || "Payment"}</span>
                    <span className="font-medium">${config.additionalAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-green-500/20 pt-1.5">
                  <span>Total</span>
                  <span className="text-green-700 dark:text-green-400">${totalAmount}</span>
                </div>
              </div>
            )}

            <Tabs defaultValue="signup" className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">New Account</TabsTrigger>
                <TabsTrigger value="signin">I Have an Account</TabsTrigger>
              </TabsList>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="onboard-name">Full Name</Label>
                    <Input
                      id="onboard-name"
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="onboard-email">Email</Label>
                    <Input
                      id="onboard-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="onboard-password">Password</Label>
                    <Input
                      id="onboard-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-500" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Account...</>
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="onboard-signin-email">Email</Label>
                    <Input
                      id="onboard-signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="onboard-signin-password">Password</Label>
                    <Input
                      id="onboard-signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing In...</>
                    ) : (
                      <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-[10px] text-center text-muted-foreground mt-1">
              <Shield className="w-3 h-3 inline mr-1" />
              $5/year membership. 83.3% of every transaction goes to creators. No hidden fees.
            </p>
          </>
        ) : (
          /* Step 2: Ready to proceed */
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                You're In!
              </DialogTitle>
              <DialogDescription>
                {totalAmount > 0
                  ? `Your account is ready. Click below to complete your $${totalAmount} payment.`
                  : "Your account is ready. Click below to continue."}
              </DialogDescription>
            </DialogHeader>

            {totalAmount > 0 && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                {config.membershipIncluded && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Membership</span>
                    <span>$5</span>
                  </div>
                )}
                {config.additionalAmount && config.additionalAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{config.additionalLabel || "Payment"}</span>
                    <span>${config.additionalAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-green-500/20 pt-1.5 mt-1.5">
                  <span>Total</span>
                  <span className="text-green-700 dark:text-green-400">${totalAmount}</span>
                </div>
              </div>
            )}

            <Button onClick={handleProceed} className="w-full bg-green-600 hover:bg-green-500">
              {config.actionLabel || "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
