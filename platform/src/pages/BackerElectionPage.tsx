/**
 * BackerElectionPage — K156 Feature 2
 * Irrevocable election form for pre-launch backers.
 * Options: Gift Receipt / Credits Election / Community Fund
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Gift, Coins, Heart, ShieldCheck, Lock, FileSignature,
  CheckCircle, AlertTriangle, Loader2,
} from "lucide-react";
import { toast } from "sonner";

type ElectionType = "gift" | "credits" | "community_fund";

const ELECTION_OPTIONS: {
  value: ElectionType;
  label: string;
  icon: typeof Gift;
  description: string;
  detail: string;
}[] = [
  {
    value: "gift",
    label: "Option A: Gift Receipt",
    icon: Gift,
    description: "Contribution treated as a gift. No return expected.",
    detail: "You acknowledge your contribution as a voluntary gift to Liana Banyan Corporation. No goods, services, ownership claims, or credits are owed in return. A simple thank-you acknowledgment will be provided.",
  },
  {
    value: "credits",
    label: "Option B: Credits Election",
    icon: Coins,
    description: "Convert contribution to platform Credits at face value.",
    detail: "Your contribution converts to platform Credits at a 1:1 face-value ratio. Credits may be used for platform services, project sponsorships, and membership renewals.",
  },
  {
    value: "community_fund",
    label: "Option C: Community Fund",
    icon: Heart,
    description: "Direct contribution to the community fund.",
    detail: "Your contribution is directed to the Liana Banyan Community Fund, supporting housing cooperatives, member emergency assistance, and community programs.",
  },
];

function useExistingElection() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["backer-election", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("backer_elections" as never)
        .select("*")
        .eq("member_id", user!.id)
        .maybeSingle();
      return data as { id: string; election_type: ElectionType; amount_cents: number; elected_at: string } | null;
    },
  });
}

export default function BackerElectionPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: existing, isLoading } = useExistingElection();

  const [selected, setSelected] = useState<ElectionType | "">("");
  const [amount, setAmount] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split("T")[0]);
  const [confirmed, setConfirmed] = useState(false);
  const [irrevocableAck, setIrrevocableAck] = useState(false);

  const submitElection = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in required");
      if (!selected) throw new Error("Select an option");
      if (!signatureName.trim()) throw new Error("Digital signature required");
      if (!irrevocableAck) throw new Error("You must acknowledge irrevocability");

      const amountCents = Math.round(parseFloat(amount || "0") * 100);

      const sigHash = btoa(`${user.id}:${selected}:${amountCents}:${signatureDate}:${signatureName}`);

      const { error } = await supabase.from("backer_elections" as never).insert({
        member_id: user.id,
        election_type: selected,
        amount_cents: amountCents,
        signature_hash: sigHash,
        irrevocable: true,
        ip_address: null,
        user_agent: navigator.userAgent,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Election submitted successfully. This election is irrevocable.");
      queryClient.invalidateQueries({ queryKey: ["backer-election"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Submission failed"),
  });

  if (isLoading) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="backer-election-loading">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </PortalPageLayout>
    );
  }

  if (existing) {
    const opt = ELECTION_OPTIONS.find((o) => o.value === existing.election_type);
    const Icon = opt?.icon || Gift;
    return (
      <PortalPageLayout
        title="Backer Election"
        subtitle="Your irrevocable election has been recorded"
        maxWidth="lg"
        xrayId="backer-election-complete"
      >
        <Card className="border-emerald-500/20">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="w-12 h-12 mx-auto text-emerald-500" />
            <h2 className="text-xl font-bold">Election Recorded</h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30">
              <Icon className="w-5 h-5" />
              <span className="font-medium">{opt?.label}</span>
            </div>
            {existing.amount_cents > 0 && (
              <p className="text-muted-foreground">
                Amount: ${(existing.amount_cents / 100).toFixed(2)}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Recorded {new Date(existing.elected_at).toLocaleDateString()}
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60 pt-4 border-t">
              <Lock className="w-3 h-3" />
              <span>This election is irrevocable per the doctrine of promissory estoppel (Restatement §§87-90).</span>
            </div>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  if (!user) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="backer-election-auth">
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Sign in to access the Backer Election Form.</p>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout
      title="Backer Election Form"
      subtitle="Choose how your pre-launch contribution is treated"
      maxWidth="lg"
      xrayId="backer-election-form"
    >
      <div className="space-y-6 pb-12">
        <Card className="border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">This election is irrevocable</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Once submitted, your election cannot be changed, modified, or withdrawn. This is
                  binding under the doctrine of promissory estoppel (Restatement (Second) of Contracts §§87-90).
                  Please review all options carefully before submitting.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Election Options */}
        <RadioGroup value={selected} onValueChange={(v) => setSelected(v as ElectionType)} className="space-y-4">
          {ELECTION_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selected === opt.value;
            return (
              <Card
                key={opt.value}
                className={`cursor-pointer transition-colors ${
                  isSelected ? "border-primary/50 bg-primary/5" : "hover:border-muted-foreground/30"
                }`}
                onClick={() => setSelected(opt.value)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value={opt.value} id={opt.value} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={opt.value} className="text-base font-semibold cursor-pointer flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        {opt.label}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{opt.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{opt.detail}</p>

                      {/* Option-specific legal disclosures */}
                      {opt.value === "credits" && isSelected && (
                        <div className="mt-3 p-3 rounded-lg bg-muted/30 text-[10px] text-muted-foreground/80 space-y-1.5 max-h-80 overflow-y-auto">
                          <p className="font-medium text-xs text-foreground">Legal Notice — Platform Credits Are Not Securities</p>
                          <p>
                            The Platform Credits you may elect to receive under Backer Election Option B are <strong>prepaid service access units</strong> redeemable exclusively within the Liana Banyan platform. They are not, and must not be construed as, securities, equity interests, ownership units, distribution-bearing instruments, cryptocurrency, digital tokens, cash equivalents, or investment contracts of any kind.
                          </p>
                          <p className="font-medium text-[10px] text-foreground/90 mt-1">Howey Test Disavowal</p>
                          <p>
                            Under <em>SEC v. W.J. Howey Co.</em>, 328 U.S. 293 (1946), an instrument is a security if it involves (1) an investment of money, (2) in a common enterprise, (3) with an expectation of profits, (4) derived from the efforts of others. Platform Credits satisfy <strong>none</strong> of these prongs:
                          </p>
                          <p>
                            <strong>1. No investment of money.</strong> Your backer election allocates funds toward prepaid platform services at a locked price — not toward an investment vehicle. Credits are purchased at face value ($1 = 1 Credit) with a constitutionally locked Cost+20% margin.
                          </p>
                          <p>
                            <strong>2. No common enterprise.</strong> Credits are individually held, individually redeemed, and carry no pooled return mechanism. Your Credit balance is not affected by the balances, activity, or outcomes of any other member.
                          </p>
                          <p>
                            <strong>3. No expectation of profits.</strong> Credits do not appreciate, accrue interest, generate yield, or produce returns of any kind. The Cost+20% margin lock is a structural consumer protection — it prevents price inflation, not a promise of value increase. Credits may never be converted to fiat currency. The one-way valve is permanent and irrevocable.
                          </p>
                          <p>
                            <strong>4. No reliance on the efforts of others.</strong> The value of a Credit is fixed at face value and is not dependent on the managerial efforts, business performance, or entrepreneurial success of Liana Banyan Corporation. 83.3% of every transaction flows directly to the creator or service provider.
                          </p>
                          <p className="font-medium text-[10px] text-foreground/90 mt-1">Consumer Protection</p>
                          <p>
                            <strong>Texas DTPA</strong> (Tex. Bus. & Com. Code §17.46) — Credits described accurately as prepaid service access. <strong>California UCL</strong> (Cal. Bus. & Prof. Code §17200) — Credit terms disclosed fully prior to election. <strong>New York GBL</strong> §349 — Clear, conspicuous disclosure of nature, limitations, and irrevocability. <strong>Florida FDUTPA</strong> (Fla. Stat. §501.204) — All material terms disclosed prior to purchase.
                          </p>
                          <p className="font-medium text-[10px] text-foreground/90 mt-1">Irrevocability</p>
                          <p>
                            Once filed, this election is <strong>irrevocable</strong>. Credits may not be refunded, converted to cash, or reallocated to another election option.
                          </p>
                        </div>
                      )}

                      {opt.value === "community_fund" && isSelected && (
                        <div className="mt-3 p-3 rounded-lg bg-muted/30 text-[10px] text-muted-foreground/80 space-y-1.5 max-h-80 overflow-y-auto">
                          <p className="font-medium text-xs text-foreground">Important Tax Disclosure — Community Fund Contribution</p>
                          <p className="font-medium text-[10px] text-foreground/90">Corporate Status</p>
                          <p>
                            Liana Banyan Corporation is organized as a <strong>Wyoming C-Corporation</strong> (EIN: 41-2797446). It is <strong>not</strong> a 501(c)(3) tax-exempt charitable organization, a 501(c)(4) social welfare organization, or any other form of tax-exempt entity under the Internal Revenue Code.
                          </p>
                          <p className="font-medium text-[10px] text-foreground/90 mt-1">No Charitable Tax Deduction</p>
                          <p>Because Liana Banyan Corporation is a for-profit C-Corporation:</p>
                          <p>• <strong>No federal income tax deduction</strong> under Internal Revenue Code §170 is available for contributions made through Backer Election Option C.</p>
                          <p>• Your contribution to the Community Fund is <strong>not</strong> a charitable donation for federal, state, or local tax purposes.</p>
                          <p>• You may <strong>not</strong> claim this contribution as a charitable deduction on any tax return.</p>
                          <p className="font-medium text-[10px] text-foreground/90 mt-1">No Tax Documentation Will Be Issued</p>
                          <p>Liana Banyan Corporation will <strong>not</strong> issue:</p>
                          <p>• <strong>No Form 1099</strong> of any type for Community Fund contributions</p>
                          <p>• <strong>No charitable acknowledgment letter</strong> (as required under §170(f)(8) for qualified charitable contributions — this contribution does not qualify)</p>
                          <p>• <strong>No donation receipt</strong> for tax deduction purposes</p>
                          <p className="font-medium text-[10px] text-foreground/90 mt-1">Annual Reporting</p>
                          <p>
                            Liana Banyan Corporation will report Community Fund usage to all contributors <strong>annually</strong>. This report will detail how Community Fund resources were allocated and deployed during the reporting period. This report is provided for transparency purposes only and does not constitute a tax document.
                          </p>
                          <p className="font-medium text-[10px] text-foreground/90 mt-1">Irrevocability</p>
                          <p>
                            Once filed, this contribution is <strong>irrevocable</strong>. Contributions may not be refunded, redirected, or reallocated to another election option.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </RadioGroup>

        {/* Amount */}
        {selected && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contribution Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="max-w-xs"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the total amount of your pre-launch contribution.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Digital Signature */}
        {selected && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileSignature className="w-5 h-5" />
                Digital Signature
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Legal Name /sig/</Label>
                <Input
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Your full legal name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Date /date/</Label>
                <Input
                  type="date"
                  value={signatureDate}
                  onChange={(e) => setSignatureDate(e.target.value)}
                  className="mt-1 max-w-xs"
                />
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="irrevocable-ack"
                  checked={irrevocableAck}
                  onCheckedChange={(v) => setIrrevocableAck(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="irrevocable-ack" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I understand that this election is <strong>irrevocable</strong> and cannot be changed, modified,
                  or withdrawn after submission. I am making this election voluntarily and with full understanding
                  of the terms described above.
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="confirm-accuracy"
                  checked={confirmed}
                  onCheckedChange={(v) => setConfirmed(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="confirm-accuracy" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I confirm that the information provided is accurate and complete to the best of my knowledge.
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        {selected && (
          <Button
            className="w-full"
            size="lg"
            disabled={!signatureName.trim() || !irrevocableAck || !confirmed || submitElection.isPending}
            onClick={() => submitElection.mutate()}
          >
            {submitElection.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
            ) : (
              <><Lock className="w-5 h-5 mr-2" /> Submit Irrevocable Election</>
            )}
          </Button>
        )}

        {/* Legal footer */}
        <div className="text-[10px] text-muted-foreground/50 max-w-2xl mx-auto text-center leading-relaxed space-y-1">
          <p>
            This digital signature is valid under the Electronic Signatures in Global and National Commerce
            Act (E-SIGN Act, 15 U.S.C. §§ 7001-7006) and the Texas Uniform Electronic Transactions Act
            (TX Bus. & Com. Code §§ 322.001-322.021).
          </p>
          <p>
            Liana Banyan Corporation • EIN 41-2797446 • Wyoming C-Corp
          </p>
        </div>
      </div>
    </PortalPageLayout>
  );
}
