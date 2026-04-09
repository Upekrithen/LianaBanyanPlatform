import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, CheckCircle2, Shield, Scale, Users, Cpu, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CURRENT_VERSION = "1.0";

function Section({ icon: Icon, title, children }: { icon: typeof Shield; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" /> {title}
      </h3>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function MemberAgreement() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const { data: acceptance, isLoading } = useQuery({
    queryKey: ["member-agreement-acceptance", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("member_agreement_acceptances" as never)
        .select("*")
        .eq("user_id", user.id)
        .eq("agreement_version", CURRENT_VERSION)
        .maybeSingle();
      if (error && (error as any).code !== "PGRST116") throw error;
      return data as { id: string; accepted_at: string | null; agreement_version: string } | null;
    },
    enabled: !!user,
  });

  const accept = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to accept");
      const { error } = await supabase.from("member_agreement_acceptances" as never).insert({
        user_id: user.id,
        agreement_version: CURRENT_VERSION,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Member Agreement accepted!");
      setConfirming(false);
      qc.invalidateQueries({ queryKey: ["member-agreement-acceptance"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const alreadyAccepted = !!acceptance?.accepted_at;

  return (
    <PortalPageLayout
      title="Member Agreement"
      subtitle="The cooperative compact — plain language, real commitment"
      maxWidth="md"
      xrayId="member-agreement"
    >
      <div className="space-y-6 pb-12">
        {/* Acceptance status */}
        {alreadyAccepted && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                You accepted version {CURRENT_VERSION} on{" "}
                {new Date(acceptance!.accepted_at!).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        )}

        {/* Agreement body */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Liana Banyan Member Agreement
              <Badge variant="outline" className="ml-auto text-xs">v{CURRENT_VERSION}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Section icon={Shield} title="Core Principles">
              <p>Liana Banyan is a collaborative network built on principles of ethical innovation, transparent governance, and mutual growth.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>LB maintains political neutrality in all operations.</li>
                <li>Decisions are guided by ethical considerations and community benefit.</li>
                <li>We reject human rights violations, illegal activities, and harmful applications.</li>
              </ul>
            </Section>

            <Separator />

            <Section icon={Users} title="Collaborative Growth">
              <ul className="list-disc pl-5 space-y-1">
                <li>Members rise together through guild and clan systems.</li>
                <li>Success is shared through transparent participation and credit mechanisms.</li>
                <li>Individual achievement strengthens the entire network.</li>
              </ul>
            </Section>

            <Separator />

            <Section icon={Scale} title="Transparent Governance">
              <ul className="list-disc pl-5 space-y-1">
                <li>All major decisions follow clear, documented processes.</li>
                <li>Members have visibility into operational practices.</li>
                <li>Charter violations are subject to community arbitration.</li>
              </ul>
            </Section>

            <Separator />

            <Section icon={Cpu} title="AI & Technology Policy">
              <p>AI is recognized as a powerful tool for human inspiration. Final artwork and creative assets must be human-created. AI may assist human artists but cannot replace human authorship.</p>
            </Section>

            <Separator />

            <Section icon={Scale} title="Amendment Process">
              <p>This agreement may be amended through proposal by any guild member at Journeyman tier or above, a 30-day community discussion period, a 2/3 majority vote by Master-tier members, and final ratification by the founding council.</p>
            </Section>

            <Separator />

            <Section icon={Shield} title="Enforcement">
              <p>Violations are addressed through mediation for minor infractions, arbitration for major disputes, community review for systemic issues, and potential sanctions including warnings, suspension, or removal.</p>
            </Section>
          </CardContent>
        </Card>

        {/* Accept button */}
        {user && !alreadyAccepted && (
          <Card className="border-primary/30">
            <CardContent className="pt-6 space-y-4">
              {!confirming ? (
                <Button onClick={() => setConfirming(true)} className="w-full" size="lg" disabled={isLoading}>
                  I Accept This Agreement
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    By clicking confirm, you agree to the terms of the Liana Banyan Member Agreement v{CURRENT_VERSION}.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setConfirming(false)}>Cancel</Button>
                    <Button className="flex-1" onClick={() => accept.mutate()} disabled={accept.isPending}>
                      {accept.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming…</> : "Confirm Acceptance"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              Sign in to accept the Member Agreement.
            </CardContent>
          </Card>
        )}
      </div>
    </PortalPageLayout>
  );
}
