import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { upekrithen } from "@/lib/upekrithen-client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { computeInvestorCap } from "@/lib/regcf-investor-cap";
import { createKycAdapter } from "@/lib/kyc";
import { createFundingPortalAdapter } from "@/lib/funding-portal";
import { generatePedestalCertificate } from "@/lib/pedestal-certificate";
import {
  Loader2,
  CheckCircle2,
  Mail,
  FileText,
  DollarSign,
  Shield,
  PenLine,
  CreditCard,
  Award,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Download,
} from "lucide-react";

const STEPS = [
  { key: "email", label: "Email & Consent", icon: Mail },
  { key: "offering", label: "Offering Materials", icon: FileText },
  { key: "qualification", label: "Investor Qualification", icon: DollarSign },
  { key: "kyc", label: "Identity Verification", icon: Shield },
  { key: "bad_actor", label: "Background Check", icon: Shield },
  { key: "esign", label: "Subscription Agreement", icon: PenLine },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "confirmation", label: "Confirmation", icon: Award },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const STATUS_FOR_STEP: Record<StepKey, string> = {
  email: "draft",
  offering: "draft",
  qualification: "draft",
  bad_actor: "kyc_pending",
  kyc: "kyc_pending",
  esign: "subscription_pending",
  payment: "payment_pending",
  confirmation: "issued",
};

function stepIndexFromStatus(status: string): number {
  switch (status) {
    case "draft": return 0;
    case "form_c_accepted": return 2;
    case "kyc_pending": return 3;
    case "kyc_approved": return 5;
    case "kyc_rejected": return 3;
    case "subscription_pending": return 5;
    case "subscription_signed": return 6;
    case "payment_pending": return 6;
    case "payment_completed": return 7;
    case "issued": return 7;
    default: return 0;
  }
}

interface ApplicationRow {
  id: string;
  status: string;
  investor_id: string;
  full_name?: string;
  email?: string;
  income_attested?: number;
  net_worth_attested?: number;
  computed_cap?: number;
  stake_count_requested?: number;
  subscription_amount_usd?: number;
  form_c_accepted_timestamp?: string;
  kyc_provider?: string;
  kyc_result?: Record<string, unknown>;
  bad_actor_check_result?: Record<string, unknown>;
  subscription_agreement_signed_at?: string;
  esign_provider?: string;
  esign_envelope_id?: string;
  payment_intent?: Record<string, unknown>;
}

const CONSENT_TEXT =
  "I consent to proceed with the Pedestal Stake application. I understand this is a securities offering under Regulation Crowdfunding and involves risk of loss.";

const PRICE_PER_STAKE = 100;

export default function PedestalStakeApply() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [app, setApp] = useState<ApplicationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 fields
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [consent, setConsent] = useState(false);

  // Step 2 fields
  const [formCRead, setFormCRead] = useState(false);

  // Step 3 fields
  const [incomeStr, setIncomeStr] = useState("");
  const [netWorthStr, setNetWorthStr] = useState("");
  const [stakeCount, setStakeCount] = useState(1);

  // Step 4/5 KYC
  const [kycStatus, setKycStatus] = useState<string>("");

  // Step 6 e-sign
  const [esignAgreed, setEsignAgreed] = useState(false);

  // Step 7 payment
  const [paymentStatus, setPaymentStatus] = useState<string>("");

  // Step 8 certificate
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  // Load existing application on mount
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    loadApplication();
  }, [user, authLoading]);

  const loadApplication = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await upekrithen()
        .from("pedestal_applications")
        .select("*")
        .eq("investor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const row = data as unknown as ApplicationRow;
        setApp(row);
        setStep(stepIndexFromStatus(row.status));
        setEmail(row.email || user.email || "");
        setFullName(row.full_name || "");
        if (row.income_attested) setIncomeStr(String(row.income_attested));
        if (row.net_worth_attested) setNetWorthStr(String(row.net_worth_attested));
        if (row.stake_count_requested) setStakeCount(row.stake_count_requested);
        if (row.form_c_accepted_timestamp) setFormCRead(true);
        if (row.kyc_provider) setKycStatus(row.kyc_result?.status as string || "");
        if (row.subscription_agreement_signed_at) setEsignAgreed(true);
        if (row.payment_intent && Object.keys(row.payment_intent).length > 0)
          setPaymentStatus((row.payment_intent as Record<string, unknown>).status as string || "");
      } else {
        setEmail(user.email || "");
      }
    } catch (err) {
      console.error("Failed to load application:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ─── Step handlers ─────────────────────────────────────────────

  async function handleStep1Submit() {
    if (!user || !email || !fullName || !consent) return;
    setSubmitting(true);
    try {
      if (app) {
        const { error } = await upekrithen()
          .from("pedestal_applications")
          .update({ email, full_name: fullName, status: "draft" } as never)
          .eq("id", app.id);
        if (error) throw error;
        setApp({ ...app, email, full_name: fullName });
      } else {
        const { data, error } = await upekrithen()
          .from("pedestal_applications")
          .insert({
            investor_id: user.id,
            email,
            full_name: fullName,
            status: "draft",
          } as never)
          .select()
          .single();
        if (error) throw error;
        setApp(data as unknown as ApplicationRow);
      }
      setStep(1);
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStep2Submit() {
    if (!app || !formCRead) return;
    setSubmitting(true);
    try {
      const { error } = await upekrithen()
        .from("pedestal_applications")
        .update({
          form_c_accepted_timestamp: new Date().toISOString(),
          status: "form_c_accepted",
        } as never)
        .eq("id", app.id);
      if (error) throw error;
      setApp({ ...app, form_c_accepted_timestamp: new Date().toISOString(), status: "form_c_accepted" });
      setStep(2);
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStep3Submit() {
    if (!app) return;
    const income = parseInt(incomeStr) || 0;
    const netWorth = parseInt(netWorthStr) || 0;
    const capResult = computeInvestorCap(income, netWorth);
    if (capResult.cap <= 0) {
      toast({ title: "Investment not permitted", description: capResult.rationale, variant: "destructive" });
      return;
    }
    const amount = stakeCount * PRICE_PER_STAKE;
    if (amount > capResult.cap) {
      toast({
        title: "Exceeds investment limit",
        description: `Your limit is $${capResult.cap.toLocaleString()}. Requested: $${amount.toLocaleString()}.`,
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await upekrithen()
        .from("pedestal_applications")
        .update({
          income_attested: income,
          net_worth_attested: netWorth,
          computed_cap: Math.round(capResult.cap),
          stake_count_requested: stakeCount,
          subscription_amount_usd: amount,
          status: "kyc_pending",
        } as never)
        .eq("id", app.id);
      if (error) throw error;
      setApp({
        ...app,
        income_attested: income,
        net_worth_attested: netWorth,
        computed_cap: Math.round(capResult.cap),
        stake_count_requested: stakeCount,
        subscription_amount_usd: amount,
        status: "kyc_pending",
      });
      setStep(3);
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStep4KYC() {
    if (!app || !user) return;
    setSubmitting(true);
    setKycStatus("running");
    try {
      const adapter = createKycAdapter();
      const result = await adapter.verifyIdentity({
        firstName: fullName.split(" ")[0] || "",
        lastName: fullName.split(" ").slice(1).join(" ") || "",
        email,
        dateOfBirth: "1990-01-01",
        address: { street: "", city: "", state: "", zip: "", country: "US" },
      });

      const newStatus = result.status === "verified" && result.badActorCheckResult.passed
        ? "kyc_approved"
        : result.status === "verified"
        ? "kyc_approved"
        : "kyc_rejected";

      const { error } = await upekrithen()
        .from("pedestal_applications")
        .update({
          kyc_provider: adapter.providerName,
          kyc_result: result as never,
          bad_actor_check_result: result.badActorCheckResult as never,
          status: newStatus,
        } as never)
        .eq("id", app.id);
      if (error) throw error;

      setKycStatus(result.status);
      setApp({
        ...app,
        kyc_provider: adapter.providerName,
        kyc_result: result as unknown as Record<string, unknown>,
        bad_actor_check_result: result.badActorCheckResult as unknown as Record<string, unknown>,
        status: newStatus,
      });

      if (newStatus === "kyc_approved") {
        if (!result.badActorCheckResult.passed) {
          setStep(4);
        } else {
          setStep(5);
        }
      } else {
        toast({ title: "KYC Failed", description: "Identity verification was not approved.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "KYC Error", description: String(err), variant: "destructive" });
      setKycStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStep6ESign() {
    if (!app || !esignAgreed) return;
    setSubmitting(true);
    try {
      // Placeholder e-signature flow.
      // HelloSign chosen over DocuSign: lower per-envelope cost for startups,
      // simpler API, and free sandbox with no credit card.
      // When HelloSign is provisioned, replace this block with a real
      // embedded signing session via the HelloSign API.
      const { error } = await upekrithen()
        .from("pedestal_applications")
        .update({
          subscription_agreement_signed_at: new Date().toISOString(),
          esign_provider: "placeholder",
          esign_envelope_id: `placeholder-${Date.now()}`,
          status: "subscription_signed",
        } as never)
        .eq("id", app.id);
      if (error) throw error;
      setApp({
        ...app,
        subscription_agreement_signed_at: new Date().toISOString(),
        esign_provider: "placeholder",
        status: "subscription_signed",
      });
      setStep(6);
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStep7Payment() {
    if (!app) return;
    setSubmitting(true);
    setPaymentStatus("processing");
    try {
      const adapter = createFundingPortalAdapter();
      const result = await adapter.initiatePayment({
        applicationId: app.id,
        investorEmail: email,
        investorName: fullName,
        amountUsd: app.subscription_amount_usd || stakeCount * PRICE_PER_STAKE,
        stakeCount: app.stake_count_requested || stakeCount,
      });

      const { error } = await upekrithen()
        .from("pedestal_applications")
        .update({
          payment_intent: result as never,
          status: "payment_completed",
        } as never)
        .eq("id", app.id);
      if (error) throw error;

      setPaymentStatus(result.status);
      setApp({ ...app, payment_intent: result as unknown as Record<string, unknown>, status: "payment_completed" });
      setStep(7);
    } catch (err) {
      toast({ title: "Payment Error", description: String(err), variant: "destructive" });
      setPaymentStatus("failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStep8Issuance() {
    if (!app || !user) return;
    setSubmitting(true);
    try {
      const issuedAt = new Date().toISOString();
      const stakeNum = app.stake_count_requested || stakeCount;

      // 1. Insert into pedestal_holders
      const { data: holderData, error: holderErr } = await upekrithen()
        .from("pedestal_holders")
        .insert({
          subscription_id: app.id,
          user_id: user.id,
          stake_count: stakeNum,
          full_name: fullName,
          email,
          issued_at: issuedAt,
        } as never)
        .select()
        .single();
      if (holderErr) throw holderErr;
      const holder = holderData as unknown as { holder_id: string };

      // 2. Insert issuance log (immutable audit)
      await upekrithen()
        .from("pedestal_issuance_log")
        .insert({
          holder_id: holder.holder_id,
          action: "initial_issuance",
          actor: "system",
          details: {
            subscription_id: app.id,
            stake_count: stakeNum,
            amount_usd: app.subscription_amount_usd,
            kyc_provider: app.kyc_provider,
          },
        } as never);

      // 3. Increment offering raises cap tracking
      const { data: raiseRows } = await upekrithen()
        .from("regcf_offering_raises")
        .select("*")
        .order("period_start", { ascending: false })
        .limit(1)
        .single();

      if (raiseRows) {
        const r = raiseRows as unknown as {
          id: string;
          cumulative_raised_usd: number;
          holder_count: number;
        };
        await upekrithen()
          .from("regcf_offering_raises")
          .update({
            cumulative_raised_usd: r.cumulative_raised_usd + (app.subscription_amount_usd || 0),
            holder_count: r.holder_count + 1,
            last_updated: new Date().toISOString(),
          } as never)
          .eq("id", r.id);
      }

      // 4. Generate PDF certificate
      const certResult = await generatePedestalCertificate({
        holderName: fullName,
        holderId: holder.holder_id,
        stakeCount: stakeNum,
        issuedAt,
        subscriptionId: app.id,
      });

      // 5. Write certificate URL back to holder
      if (certResult.url) {
        await upekrithen()
          .from("pedestal_holders")
          .update({ certificate_url: certResult.url } as never)
          .eq("holder_id", holder.holder_id);
        setCertificateUrl(certResult.url);
      }

      // 6. Mark application as issued
      await upekrithen()
        .from("pedestal_applications")
        .update({ status: "issued" } as never)
        .eq("id", app.id);

      // 7. Send confirmation email
      supabase.functions
        .invoke("send-transactional-email", {
          body: {
            email,
            type: "membership_confirmed",
            data: {
              recipientName: fullName,
              subject: "Pedestal Stake Issued — Upekrithen LLC",
              body: `Congratulations! ${stakeNum} Pedestal Stake${stakeNum !== 1 ? "s" : ""} have been issued to you. Your certificate is available in your investor dashboard at /my/pedestal-stake. This is a securities transaction under Regulation Crowdfunding. Transfer restrictions apply.`,
            },
          },
        })
        .catch(() => {});

      setApp({ ...app, status: "issued" });
    } catch (err) {
      toast({ title: "Issuance Error", description: String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Auth gate ─────────────────────────────────────────────────

  if (authLoading || loading) {
    return (
      <PortalPageLayout title="Pedestal Stake Application" subtitle="Upekrithen LLC — Reg CF">
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </PortalPageLayout>
    );
  }

  if (!user) {
    return (
      <PortalPageLayout title="Pedestal Stake Application" subtitle="Upekrithen LLC — Reg CF">
        <div className="max-w-lg mx-auto text-center space-y-6 py-12">
          <Shield className="h-16 w-16 mx-auto text-amber-400" />
          <h2 className="text-xl font-semibold">Sign In Required</h2>
          <p className="text-muted-foreground">
            You must be signed in to apply for Pedestal Stakes.
          </p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </PortalPageLayout>
    );
  }

  // ─── Render ────────────────────────────────────────────────────

  const income = parseInt(incomeStr) || 0;
  const netWorth = parseInt(netWorthStr);
  const capResult = !isNaN(netWorth) ? computeInvestorCap(income, netWorth) : null;
  const totalAmount = stakeCount * PRICE_PER_STAKE;

  return (
    <PortalPageLayout title="Pedestal Stake Application" subtitle="Upekrithen LLC — Reg CF">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <div key={s.key} className="flex items-center gap-1 shrink-0">
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    done
                      ? "bg-green-950/30 text-green-400"
                      : active
                      ? "bg-amber-950/30 text-amber-400"
                      : "bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* ─── Step 1: Email & Consent ──────────────────────────── */}
        {step === 0 && (
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-amber-400" />
                Email & Consent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apply-name">Full Legal Name *</Label>
                <Input
                  id="apply-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As it appears on your government ID"
                  required
                />
              </div>
              <div>
                <Label htmlFor="apply-email">Email *</Label>
                <Input
                  id="apply-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="apply-consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="apply-consent" className="text-xs text-muted-foreground">
                  {CONSENT_TEXT}
                </label>
              </div>
              <Button
                onClick={handleStep1Submit}
                disabled={!email || !fullName || !consent || submitting}
                className="w-full"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ─── Step 2: Offering Materials ───────────────────────── */}
        {step === 1 && (
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" />
                Offering Memorandum & Form C
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-amber-600/20 bg-amber-950/5 p-4 space-y-3">
                <p className="text-sm font-medium text-amber-400">
                  Offering materials coming soon
                </p>
                <p className="text-xs text-muted-foreground">
                  The final Form C and Offering Memorandum are being prepared by
                  counsel. Once available, you will be able to download and review
                  them here before proceeding.
                </p>
                {/* TODO(counsel): Insert final Form C reference language here. Contact: counsel per project_counsel_task_based.md */}
                {/* TODO(counsel): Insert final Offering Memorandum content here. Contact: counsel per project_counsel_task_based.md */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled>
                    <Download className="h-3 w-3 mr-1" /> Form C (pending)
                  </Button>
                  <Button size="sm" variant="outline" disabled>
                    <Download className="h-3 w-3 mr-1" /> Offering Memorandum (pending)
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="form-c-read"
                  checked={formCRead}
                  onChange={(e) => setFormCRead(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="form-c-read" className="text-xs text-muted-foreground">
                  I acknowledge that I will review the Form C and Offering Memorandum
                  in their entirety before completing this application. I understand
                  that investing in securities involves risk of loss and that past
                  performance is not indicative of future results.
                </label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={handleStep2Submit}
                  disabled={!formCRead || submitting}
                  className="flex-1"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Step 3: Investor Qualification ───────────────────── */}
        {step === 2 && (
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-400" />
                Investor Qualification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                SEC Regulation CF requires we determine your investment limit based on
                annual income and net worth. These values are self-declared.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="qual-income">Annual Income (USD) *</Label>
                  <Input
                    id="qual-income"
                    type="number"
                    value={incomeStr}
                    onChange={(e) => setIncomeStr(e.target.value)}
                    placeholder="e.g., 75000"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="qual-networth">Net Worth (USD, excl. primary residence) *</Label>
                  <Input
                    id="qual-networth"
                    type="number"
                    value={netWorthStr}
                    onChange={(e) => setNetWorthStr(e.target.value)}
                    placeholder="e.g., 150000"
                  />
                </div>
              </div>

              {capResult && capResult.cap > 0 && (
                <div className="rounded-lg bg-blue-950/20 border border-blue-600/20 p-3">
                  <p className="text-sm font-medium">
                    Your investment limit: <span className="text-blue-400">${Math.round(capResult.cap).toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{capResult.rationale}</p>
                </div>
              )}

              {capResult && capResult.cap <= 0 && (
                <div className="rounded-lg bg-red-950/20 border border-red-600/20 p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-400">{capResult.rationale}</p>
                </div>
              )}

              <div>
                <Label htmlFor="stake-count">Number of Stakes (${PRICE_PER_STAKE} each)</Label>
                <Input
                  id="stake-count"
                  type="number"
                  value={stakeCount}
                  onChange={(e) => setStakeCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Total: ${totalAmount.toLocaleString()}
                  {capResult && capResult.cap > 0 && totalAmount > capResult.cap && (
                    <span className="text-red-400 ml-2">
                      Exceeds your limit of ${Math.round(capResult.cap).toLocaleString()}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={handleStep3Submit}
                  disabled={
                    !incomeStr || isNaN(netWorth) || !capResult || capResult.cap <= 0 ||
                    totalAmount > capResult.cap || submitting
                  }
                  className="flex-1"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Continue to Identity Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Step 4: KYC ──────────────────────────────────────── */}
        {step === 3 && (
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-400" />
                Identity Verification (KYC)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Federal securities regulations require identity verification before
                you can invest. This check verifies your identity and screens against
                regulatory watchlists.
              </p>

              {kycStatus === "running" && (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying your identity...
                </div>
              )}

              {kycStatus === "verified" && (
                <div className="rounded-lg bg-green-950/20 border border-green-600/20 p-3">
                  <p className="text-sm text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Identity verified
                  </p>
                </div>
              )}

              {kycStatus === "failed" && (
                <div className="rounded-lg bg-red-950/20 border border-red-600/20 p-3">
                  <p className="text-sm text-red-400">
                    Identity verification failed. Please contact support.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                {kycStatus !== "verified" && (
                  <Button
                    onClick={handleStep4KYC}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    Verify My Identity
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Step 5: Bad Actor Check Result ───────────────────── */}
        {step === 4 && (
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-400" />
                Background Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {app?.bad_actor_check_result &&
              !(app.bad_actor_check_result as { passed?: boolean }).passed ? (
                <div className="rounded-lg bg-red-950/20 border border-red-600/20 p-3 space-y-2">
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Background check flagged
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your application has been flagged for manual review. Our compliance
                    team will contact you within 2 business days.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-green-950/20 border border-green-600/20 p-3">
                  <p className="text-sm text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Background check passed
                  </p>
                </div>
              )}

              <Button
                onClick={() => setStep(5)}
                disabled={
                  app?.bad_actor_check_result
                    ? !(app.bad_actor_check_result as { passed?: boolean }).passed
                    : true
                }
                className="w-full"
              >
                Continue to Subscription Agreement
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ─── Step 6: E-Signature ──────────────────────────────── */}
        {step === 5 && (
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenLine className="h-5 w-5 text-amber-400" />
                Subscription Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-amber-600/20 bg-amber-950/5 p-4 space-y-3">
                <p className="text-sm font-medium text-amber-400">
                  E-signature integration pending
                </p>
                <p className="text-xs text-muted-foreground">
                  HelloSign will be integrated for production e-signatures. For now,
                  please review and accept the subscription agreement terms below.
                  The fully executed agreement will be emailed to you once the
                  e-signature provider is provisioned.
                </p>
              </div>

              <div className="rounded-lg border border-border/50 p-4 max-h-48 overflow-y-auto text-xs text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">SUBSCRIPTION AGREEMENT</p>
                <p>
                  By accepting below, I, <strong>{fullName}</strong>, agree to subscribe
                  for <strong>{app?.stake_count_requested || stakeCount}</strong> Pedestal
                  Stake(s) in Upekrithen, LLC at $
                  {PRICE_PER_STAKE} per stake, for a total of $
                  {(app?.subscription_amount_usd || totalAmount).toLocaleString()}.
                </p>
                <p>
                  I understand that: (a) this investment involves a high degree of risk;
                  (b) there is no guarantee of return; (c) Pedestal Stakes are subject
                  to transfer restrictions under Regulation CF; (d) I may lose my entire
                  investment; (e) this investment does not confer any rights in Liana
                  Banyan Corporation.
                </p>
                <p>
                  I confirm that the income and net worth I declared are accurate and
                  that my investment does not exceed my Reg CF annual limit.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="esign-agree"
                  checked={esignAgreed}
                  onChange={(e) => setEsignAgreed(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="esign-agree" className="text-xs text-muted-foreground">
                  I have read and agree to the Subscription Agreement. I understand my
                  electronic acceptance constitutes a legally binding signature.
                </label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={handleStep6ESign}
                  disabled={!esignAgreed || submitting}
                  className="flex-1"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Sign & Continue to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Step 7: Payment ──────────────────────────────────── */}
        {step === 6 && (
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-400" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pedestal Stakes</span>
                  <span>{app?.stake_count_requested || stakeCount} × ${PRICE_PER_STAKE}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${(app?.subscription_amount_usd || totalAmount).toLocaleString()}</span>
                </div>
              </div>

              <div className="rounded-lg border border-amber-600/20 bg-amber-950/5 p-4">
                <p className="text-sm font-medium text-amber-400">
                  Funding portal integration pending
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ACH payment will be processed through a FINRA-registered funding
                  portal (StartEngine / Republic / Wefunder — Founder selects before
                  launch). For now, clicking below records your payment intent.
                </p>
              </div>

              {paymentStatus === "processing" && (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(5)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={handleStep7Payment}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Confirm Payment Intent
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Step 8: Confirmation + Issuance ──────────────────── */}
        {step === 7 && (
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                {app?.status === "issued" ? "Stake Issued!" : "Complete Your Application"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {app?.status === "issued" ? (
                <>
                  <div className="text-center space-y-3">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
                    <h3 className="text-lg font-semibold">
                      {app.stake_count_requested || stakeCount} Pedestal Stake
                      {(app.stake_count_requested || stakeCount) !== 1 ? "s" : ""} Issued
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your certificate has been generated and a confirmation email sent to{" "}
                      <strong>{email}</strong>.
                    </p>
                  </div>

                  {certificateUrl && (
                    <a href={certificateUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-1" /> Download Certificate PDF
                      </Button>
                    </a>
                  )}

                  <Button onClick={() => navigate("/my/pedestal-stake")} className="w-full">
                    Go to Investor Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <div className="rounded-lg bg-green-950/20 border border-green-600/20 p-4 space-y-2">
                    <p className="text-sm text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      All steps completed
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click below to finalize issuance. This will create your
                      Pedestal Stake holder record, generate your certificate, and
                      grant dashboard access.
                    </p>
                  </div>

                  <Button
                    onClick={handleStep8Issuance}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    Finalize Issuance
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* SEC disclaimer */}
        <p className="text-[10px] text-muted-foreground/60 text-center max-w-md mx-auto">
          Securities offered under Regulation Crowdfunding (17 CFR §§ 227.100–227.503).
          Upekrithen, LLC is a separate entity from Liana Banyan Corporation.
          Investing involves risk. You may lose your entire investment.
        </p>
      </div>
    </PortalPageLayout>
  );
}
