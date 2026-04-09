/**
 * ChallengePage — K151 Generic Challenge Framework
 * Route: /challenge/:slug
 * Loads challenge config from DB, renders type-specific UI.
 * First implementation: Say It Fast tongue-twister challenge.
 */

import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mic, MicOff, Share2, Trophy, Zap, Users, Shield,
  CheckCircle, ArrowLeft, Loader2, Copy, ExternalLink, UserCircle, Mail,
} from "lucide-react";
import { toast } from "sonner";

interface Challenge {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  type: "skill" | "sweepstakes";
  marks_reward: number;
  max_marks: number;
  referral_bonus: number;
  rules_json: Record<string, unknown>;
  legal_disclaimer: string | null;
  active: boolean;
}

interface ChallengeCompletion {
  id: string;
  challenge_id: string;
  member_id: string;
  platform_dispatched_to: string[];
  marks_awarded: number;
  referral_marks: number;
  verified: boolean;
  completed_at: string;
}

function useChallenge(slug: string) {
  return useQuery({
    queryKey: ["challenge", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges" as never)
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .single();
      if (error) throw error;
      return data as unknown as Challenge;
    },
    enabled: !!slug,
  });
}

function useMyCompletion(challengeId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["challenge-completion", challengeId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("challenge_completions" as never)
        .select("*")
        .eq("challenge_id", challengeId!)
        .eq("member_id", user!.id)
        .maybeSingle();
      return data as unknown as ChallengeCompletion | null;
    },
    enabled: !!challengeId && !!user,
  });
}

function useSocialPlugs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["social-plugs", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_social_plugs" as never)
        .select("platform, username, is_active")
        .eq("user_id", user!.id)
        .eq("is_active", true);
      return (data || []) as Array<{ platform: string; username: string; is_active: boolean }>;
    },
    enabled: !!user,
  });
}

export default function ChallengePage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: challenge, isLoading, error } = useChallenge(slug || "");
  const { data: completion } = useMyCompletion(challenge?.id);
  const { data: plugs = [] } = useSocialPlugs();

  if (isLoading) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="challenge-loading">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </PortalPageLayout>
    );
  }

  if (error || !challenge) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="challenge-not-found">
        <div className="text-center py-20">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-xl font-bold mb-2">Challenge Not Found</h2>
          <p className="text-muted-foreground mb-4">This challenge doesn't exist or is no longer active.</p>
          <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
        </div>
      </PortalPageLayout>
    );
  }

  if (challenge.slug === "say-it-fast") {
    return (
      <SayItFastChallenge
        challenge={challenge}
        completion={completion}
        plugs={plugs}
        user={user}
        queryClient={queryClient}
      />
    );
  }

  return (
    <PortalPageLayout maxWidth="lg" xrayId={`challenge-${challenge.slug}`}>
      <GenericChallengeView challenge={challenge} completion={completion} />
    </PortalPageLayout>
  );
}

function GenericChallengeView({ challenge, completion }: { challenge: Challenge; completion: ChallengeCompletion | null | undefined }) {
  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="text-center">
        <Trophy className="w-12 h-12 mx-auto mb-3 text-amber-500" />
        <h1 className="text-3xl font-bold">{challenge.title}</h1>
        {challenge.subtitle && <p className="text-lg text-muted-foreground mt-1">{challenge.subtitle}</p>}
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">{challenge.description}</p>
          <div className="flex gap-3 mt-4">
            <Badge variant="outline">{challenge.type === "skill" ? "Skill Challenge" : "Sweepstakes"}</Badge>
            <Badge className="bg-amber-500/10 text-amber-600">Up to {challenge.max_marks} Marks</Badge>
          </div>
          {completion && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-emerald-600">Completed! {completion.marks_awarded} Marks earned</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {challenge.legal_disclaimer && (
        <p className="text-[10px] text-muted-foreground/60 max-w-xl mx-auto text-center">
          {challenge.legal_disclaimer}
        </p>
      )}
    </div>
  );
}

function SayItFastChallenge({
  challenge,
  completion,
  plugs,
  user,
  queryClient,
}: {
  challenge: Challenge;
  completion: ChallengeCompletion | null | undefined;
  plugs: Array<{ platform: string; username: string }>;
  user: { id: string } | null;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [referralCode, setReferralCode] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const rules = challenge.rules_json as {
    phrase: string;
    repetitions: number;
    base_marks: number;
    per_platform_marks: number;
    max_platform_bonus: number;
    max_referral_bonus: number;
  };

  const platformBonus = Math.min(selectedPlatforms.size * (rules.per_platform_marks || 2), rules.max_platform_bonus || 10);
  const totalMarks = (rules.base_marks || 5) + platformBonus;

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        setRecorded(true);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast.error("Microphone access required for this challenge");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const submitMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in required");
      const platforms = Array.from(selectedPlatforms);
      const { error } = await supabase.from("challenge_completions" as never).insert({
        challenge_id: challenge.id,
        member_id: user.id,
        platform_dispatched_to: platforms,
        marks_awarded: totalMarks,
        referral_marks: 0,
        referred_by: referralCode || null,
        verified: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Challenge complete! ${totalMarks} Marks earned.`);
      queryClient.invalidateQueries({ queryKey: ["challenge-completion"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Submission failed"),
  });

  const referralLink = user ? `${window.location.origin}/challenge/say-it-fast?ref=${user.id.slice(0, 8)}` : "";

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const alreadyDone = !!completion;

  return (
    <PortalPageLayout maxWidth="lg" xrayId="challenge-say-it-fast">
      <div className="space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">{challenge.title}</h1>
          <p className="text-lg text-muted-foreground mt-1">{challenge.subtitle}</p>
        </div>

        {/* Already completed */}
        {alreadyDone && (
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="pt-6 text-center space-y-3">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-500" />
              <h2 className="text-xl font-bold text-emerald-600">Challenge Complete!</h2>
              <p className="text-muted-foreground">
                You earned <strong>{completion!.marks_awarded} Marks</strong>
                {completion!.platform_dispatched_to?.length
                  ? ` dispatched to ${completion!.platform_dispatched_to.length} platform${completion!.platform_dispatched_to.length > 1 ? "s" : ""}`
                  : ""}
              </p>
              <div className="pt-3 border-t space-y-3">
                <p className="text-sm font-medium mb-2">Share your referral link — earn {challenge.referral_bonus} bonus Marks per friend</p>
                <div className="flex gap-2 max-w-md mx-auto">
                  <Input value={referralLink} readOnly className="text-xs" />
                  <Button size="sm" variant="outline" onClick={copyReferral}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Link
                  to={`/dashboard/dispatch?prefill=sayitfast&challenge_id=${challenge.id}&phrase=${encodeURIComponent((challenge.rules_json as any)?.phrase || challenge.title)}&marks=${completion!.marks_awarded}`}
                  className="block"
                >
                  <Button variant="outline" size="sm" className="w-full max-w-md mx-auto flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Share via Battery Dispatch
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Challenge flow */}
        {!alreadyDone && (
          <>
            {/* The phrase */}
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Say this {rules.repetitions}x fast:</p>
                <blockquote className="text-2xl font-bold italic text-primary px-4">
                  "{rules.phrase}"
                </blockquote>
              </CardContent>
            </Card>

            {/* Step 1: Record */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                  Record Yourself
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!recorded ? (
                  <div className="text-center">
                    <Button
                      size="lg"
                      onClick={recording ? stopRecording : startRecording}
                      className={recording ? "bg-red-600 hover:bg-red-500" : ""}
                    >
                      {recording ? (
                        <><MicOff className="w-5 h-5 mr-2" /> Stop Recording</>
                      ) : (
                        <><Mic className="w-5 h-5 mr-2" /> Start Recording</>
                      )}
                    </Button>
                    {recording && (
                      <p className="text-sm text-red-400 mt-2 animate-pulse">Recording... say it 3x fast!</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium">Recording captured!</span>
                    <Button variant="ghost" size="sm" onClick={() => setRecorded(false)} className="ml-auto text-xs">
                      Re-record
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Dispatch */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  Battery Dispatch
                  <Badge variant="secondary" className="text-xs">+2 Marks/platform</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plugs.length === 0 ? (
                  <div className="text-center py-4">
                    <Share2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground mb-2">Connect social accounts to earn bonus Marks</p>
                    <Link to="/dashboard/plugs">
                      <Button variant="outline" size="sm">Connect Platforms</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {plugs.map((plug) => (
                      <button
                        key={plug.platform}
                        onClick={() => togglePlatform(plug.platform)}
                        className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                          selectedPlatforms.has(plug.platform)
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "border-border hover:border-primary/20"
                        }`}
                      >
                        <div className="font-medium capitalize">{plug.platform}</div>
                        <div className="text-xs text-muted-foreground">@{plug.username}</div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Marks breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Your Marks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base reward</span>
                  <span className="font-medium">{rules.base_marks} Marks</span>
                </div>
                {selectedPlatforms.size > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{selectedPlatforms.size} platform{selectedPlatforms.size > 1 ? "s" : ""} × {rules.per_platform_marks}</span>
                    <span className="font-medium text-amber-600">+{platformBonus} Marks</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">{totalMarks} Marks</span>
                </div>
                <Progress value={(totalMarks / challenge.max_marks) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">Max: {challenge.max_marks} Marks</p>
              </CardContent>
            </Card>

            {/* Referral input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Referred by a friend?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Paste referral code (optional)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="max-w-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  One-level referral: your friend earns {challenge.referral_bonus} Marks. Not MLM — one level only.
                </p>
              </CardContent>
            </Card>

            {/* Submit */}
            {user ? (
              <Button
                className="w-full"
                size="lg"
                disabled={!recorded || submitMut.isPending}
                onClick={() => submitMut.mutate()}
              >
                {submitMut.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <><Trophy className="w-5 h-5 mr-2" /> Complete Challenge — Earn {totalMarks} Marks</>
                )}
              </Button>
            ) : (
              <GuestParticipantCard />
            )}
          </>
        )}

        {/* Legal disclaimer */}
        {challenge.legal_disclaimer && (
          <p className="text-[10px] text-muted-foreground/60 max-w-2xl mx-auto text-center leading-relaxed">
            {challenge.legal_disclaimer}
          </p>
        )}
      </div>
    </PortalPageLayout>
  );
}

function GuestParticipantCard() {
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const createGuestWallet = useMutation({
    mutationFn: async () => {
      if (!guestEmail.trim()) throw new Error("Email required");
      const { error } = await supabase.from("guest_marks_wallets" as never).insert({
        email: guestEmail.trim().toLowerCase(),
        display_name: guestName.trim() || null,
        marks_balance: 0,
      });
      if (error && error.code === "23505") {
        return;
      }
      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Guest wallet created! Your Marks will be held for 90 days.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to create guest wallet"),
  });

  if (submitted) {
    return (
      <Card className="border-emerald-500/20">
        <CardContent className="py-6 text-center space-y-3">
          <CheckCircle className="w-8 h-8 mx-auto text-emerald-500" />
          <p className="font-medium">Guest Wallet Created</p>
          <p className="text-sm text-muted-foreground">
            Marks from this challenge will be held in your guest wallet for 90 days.
            Sign up for a $5/year membership to claim them permanently.
          </p>
          <Link to="/membership">
            <Button size="sm" className="mt-2">Become a Member — $5/year</Button>
          </Link>
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed mt-2">
            Guest Marks are non-transferable and expire in 90 days.
            They are cooperative effort-recognition tokens, not securities or cash equivalents.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-500/20">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
            <UserCircle className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Guest Participant</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          No account needed to participate! Enter your email to create a Guest Marks Wallet.
          Earned Marks are held for 90 days and redeemable toward your first $5/year membership.
        </p>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Display Name (optional)</Label>
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="How you'd like to appear"
              className="mt-1"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => createGuestWallet.mutate()}
            disabled={!guestEmail.trim() || createGuestWallet.isPending}
          >
            {createGuestWallet.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
            ) : (
              <><Mail className="w-4 h-4 mr-2" /> Create Guest Wallet &amp; Participate</>
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
            No purchase, payment, or membership is required to participate or earn Marks.
            Guest Marks are non-transferable cooperative effort-recognition tokens.
            They cannot be sold, traded, or converted to cash. Marks held in a Guest
            Wallet expire after 90 days. To claim Marks permanently, sign up for a
            $5/year membership. Marks are not securities, ownership claims, or speculative
            contracts of any kind.
          </p>
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <p className="text-[10px] text-muted-foreground/60">
            Already have an account?{" "}
            <Link to="/auth" className="text-primary hover:underline">Sign in</Link>
            {" "}to earn Marks directly to your member balance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
