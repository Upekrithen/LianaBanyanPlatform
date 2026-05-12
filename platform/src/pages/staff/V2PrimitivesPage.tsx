import { useState } from "react";
import { BadgeCheck, Flame, ShieldCheck } from "lucide-react";
import { StaffAccessGate } from "@/components/staff/StaffAccessGate";
import { StaffPageLayout } from "@/components/staff/StaffPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell, FocusShell } from "@/components/shells";
import {
  Hero,
  InformativeLock,
  ProofStrip,
  StickyMobileCTA,
  VersionToggle,
} from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";

const VERSIONS = [
  { id: "glance", label: "At a Glance" },
  { id: "full", label: "Full Read" },
  { id: "academic", label: "Academic" },
];

export default function V2PrimitivesPage() {
  const [activeVersion, setActiveVersion] = useState(VERSIONS[0].id);
  const tourTarget = useTourTarget("wallet");

  return (
    <StaffAccessGate>
      <StaffPageLayout maxWidth="xl" xrayId="staff-v2-primitives">
        <Card>
          <CardHeader>
            <CardTitle>V2 Foundation Primitives</CardTitle>
            <CardDescription>
              K294 visual harness for shared shell and component primitives.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-base font-semibold">Hero (focus variant)</h2>
              <Hero
                variant="focus"
                eyebrow="Welcome Gate"
                headline="Build in public with stable platform primitives."
                body="This focus hero demonstrates the full-width conversion frame used by pre-auth and landing surfaces."
                primaryCTA={{ label: "Start participation", href: "/membership" }}
                secondaryCTA={{ label: "Read doctrine", href: "/staff/v2-primitives" }}
                proofStrip={[
                  "Membership is $5/year",
                  "Creator keeps 83.3%",
                  "Cost + 20% model",
                  "Privacy-first",
                ]}
              />
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold">Hero (app variant)</h2>
              <Hero
                variant="app"
                eyebrow="Workspace Orientation"
                headline="Welcome back to your contribution cockpit."
                body="This compact orientation hero is tuned for post-auth operational pages."
                primaryCTA={{ label: "Open dashboard", href: "/dashboard" }}
                proofStrip={["Daily dispatch", "Member ledger", "Team visibility"]}
              />
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold">ProofStrip</h2>
              <ProofStrip
                items={[
                  { icon: <BadgeCheck className="h-3.5 w-3.5" />, label: "2,130 innovations" },
                  { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "{{provisionalApps}} provisional filings" },
                  { icon: <Flame className="h-3.5 w-3.5" />, label: "35 production systems" },
                  "No ads",
                  "No data selling",
                ]}
              />
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold">InformativeLock</h2>
              <InformativeLock action="launch campaigns" joinHref="/membership" />
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold">VersionToggle</h2>
              <VersionToggle versions={VERSIONS} activeId={activeVersion} onChange={setActiveVersion} />
              <p className="text-sm text-muted-foreground">Active version: {activeVersion}</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold">Tour target hook</h2>
              <div
                {...tourTarget}
                className="inline-flex rounded-md border bg-muted/20 px-3 py-2 text-sm tabular-nums"
              >
                data-tour-target=&quot;wallet&quot;
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold">FocusShell</h2>
              <div className="overflow-hidden rounded-lg border">
                <FocusShell
                  className="min-h-0"
                  seo={{ title: "V2 FocusShell Demo", description: "Focus shell primitive preview." }}
                  hero={
                    <Hero
                      variant="app"
                      eyebrow="FocusShell Hero Slot"
                      headline="Hero slot is full width."
                      body="The content region below stays max-width for readability."
                      primaryCTA={{ label: "Primary action", href: "/membership" }}
                    />
                  }
                >
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      This area demonstrates constrained body width for public and conversion pages.
                    </p>
                  </div>
                </FocusShell>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold">AppShell</h2>
              <div className="overflow-hidden rounded-lg border">
                <AppShell
                  className="min-h-0"
                  pageTitle="Operations Workspace"
                  breadcrumbs="Staff / V2 Primitives / AppShell"
                  hero={<p className="text-sm text-muted-foreground">Orientation strip hero slot.</p>}
                  rightRail={<p className="text-sm text-muted-foreground">Right rail context.</p>}
                >
                  <p className="text-sm">Main content slot for dense workspace tasks.</p>
                </AppShell>
              </div>
            </section>

            <StickyMobileCTA
              primary={{ label: "Join for $5/year", href: "/membership" }}
              secondary={{ label: "View doctrine", href: "/staff/v2-primitives" }}
            />
          </CardContent>
        </Card>
      </StaffPageLayout>
    </StaffAccessGate>
  );
}
