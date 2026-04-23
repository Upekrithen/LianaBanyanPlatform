import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { upekrithen } from "@/lib/upekrithen-client";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const CONSENT_VERSION = "1.0";
const CONSENT_TEXT =
  "I consent to receive information about the Pedestal Stake offering from Upekrithen LLC. I understand this is not an offer to sell securities and involves no obligation or commitment.";

export default function PedestalStakeEarlyInterest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !consent) return;

    setSubmitting(true);
    try {
      const { error } = await upekrithen().from("pedestal_early_interest").insert({
        email,
        name: name || null,
        user_id: user?.id || null,
        consent_given: true,
        consent_text: CONSENT_TEXT,
        consent_version: CONSENT_VERSION,
        consent_timestamp: new Date().toISOString(),
        source_page: window.location.pathname,
        utm_source: searchParams.get("utm_source") || null,
        utm_medium: searchParams.get("utm_medium") || null,
        utm_campaign: searchParams.get("utm_campaign") || null,
        source: "web",
      } as never);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already registered",
            description: "This email is already on the early-interest list.",
          });
          setSubmitted(true);
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
        toast({
          title: "You're on the list!",
          description: "We'll notify you when the offering opens.",
        });

        // TODO(counsel): Swap email template once counsel provides final copy. Contact: counsel per project_counsel_task_based.md
        supabase.functions
          .invoke("send-transactional-email", {
            body: {
              email,
              type: "membership_confirmed",
              data: {
                recipientName: name || "Investor",
                subject: "Pedestal Stake — Early Interest Confirmed",
                body: "Thank you for registering your early interest in the Pedestal Stake offering from Upekrithen LLC. We will email you when the offering documents and application flow are ready. This is not an offer to sell securities and involves no obligation or commitment of any kind.",
              },
            },
          })
          .catch(() => {});
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to register";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <PortalPageLayout
        title="Early Interest Registered"
        subtitle="Pedestal Stake — Upekrithen LLC"
      >
        <div className="max-w-lg mx-auto text-center space-y-6 py-12">
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
          <h2 className="text-xl font-semibold">You're on the early-interest list</h2>
          <p className="text-muted-foreground">
            We'll email you at <strong>{email}</strong> when the offering documents
            are ready and the application flow opens. No obligation, no commitment.
          </p>
          <Card className="border-amber-600/20 bg-amber-950/5 text-left">
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3 inline mr-1 text-amber-400" />
                An indication of interest involves no obligation or commitment of any kind.
                No money or other consideration is being solicited, and if sent, will not be
                accepted. No offer to buy securities can be accepted and no part of the
                purchase price can be received until the offering statement is qualified.
              </p>
            </CardContent>
          </Card>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout
      title="Register Early Interest"
      subtitle="Pedestal Stake — Upekrithen LLC"
    >
      <div className="max-w-lg mx-auto space-y-6">
        <Card className="border border-border/50">
          <CardContent className="py-6 space-y-4">
            <div className="text-center space-y-2 mb-4">
              <Mail className="h-8 w-8 mx-auto text-amber-400" />
              <p className="text-sm text-muted-foreground">
                Register your interest in the upcoming Pedestal Stake offering.
                We'll notify you when offering documents and the application flow are ready.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="consent" className="text-xs text-muted-foreground">
                  I consent to receive information about the Pedestal Stake offering
                  from Upekrithen LLC. I understand this is not an offer to sell
                  securities and involves no obligation or commitment.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!email || !consent || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Registering...
                  </>
                ) : (
                  "Register Early Interest"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center max-w-md mx-auto">
          This testing-the-waters communication is permitted under SEC Regulation
          Crowdfunding. No money or other consideration is being solicited by this
          communication. An indication of interest involves no obligation or commitment
          of any kind.
        </p>
      </div>
    </PortalPageLayout>
  );
}
