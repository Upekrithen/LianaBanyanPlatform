/**
 * AIGangStagingPage — Wave 6 Phase W
 * =====================================
 * AI-Gang go-live wiring (post-ratify path).
 * Route: /outreach/ai-gang
 *
 * HELD FOR FOUNDER - staged only, do not publish.
 * This page stages the AI-Gang activation workflow.
 */
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Users, CheckCircle, Circle } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

const AI_GANG_MEMBERS = [
  { name: "Trebor Scholz", role: "Platform Cooperativism scholar", status: "queued" },
  { name: "Erik Brynjolfsson", role: "AI economics researcher", status: "queued" },
  { name: "Craig Newmark", role: "Community tech philanthropist", status: "queued" },
  { name: "Cory Doctorow", role: "Digital rights advocate", status: "queued" },
  { name: "Ollama team", role: "Open-source AI infrastructure", status: "queued" },
];

const RATIFY_GATES = [
  { gate: "Cooperative charter fully ratified", complete: false },
  { gate: "MnemosyneC benchmark published to /proofs", complete: false },
  { gate: "Crown letter wave 1 (Trebor/Schneider) acknowledged", complete: false },
  { gate: "Founder authorizes AI-Gang go-live", complete: false },
];

export default function AIGangStagingPage() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout variant="stage" xrayId="ai-gang-staging">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/outreach/crown-letters")} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Crown Letters
        </Button>

        {/* Held Banner */}
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="py-3 flex items-center gap-2 text-sm text-red-300">
            <Lock className="h-4 w-4 shrink-0" />
            <span>
              <strong>HELD FOR FOUNDER.</strong> AI-Gang go-live requires explicit founder
              authorization post-ratification. This page is staged only - nothing sends without
              the ratify-gate chain completing.
            </span>
          </CardContent>
        </Card>

        {/* Title */}
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">AI-Gang Go-Live (Staged)</h1>
            <p className="text-muted-foreground">Post-ratify activation path for AI-Gang outreach</p>
          </div>
        </div>

        {/* Ratify Gate Chain */}
        <Card>
          <CardHeader>
            <CardTitle>Ratification Gate Chain</CardTitle>
            <p className="text-xs text-muted-foreground">All 4 gates must clear before AI-Gang activates</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {RATIFY_GATES.map((gate, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                {gate.complete ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                )}
                <span className={gate.complete ? "text-foreground" : "text-muted-foreground"}>
                  {gate.gate}
                </span>
                {!gate.complete && (
                  <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                    Pending
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI-Gang Members */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Gang Outreach Queue</CardTitle>
            <p className="text-xs text-muted-foreground">Letters queued - will not send until all gates clear</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {AI_GANG_MEMBERS.map((member) => (
              <div key={member.name} className="flex items-center justify-between gap-3 text-sm py-2 border-b border-border/40 last:border-0">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
                <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400">
                  Queued
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Disabled activation button */}
        <Button disabled className="gap-2">
          <Lock className="h-4 w-4" />
          Activate AI-Gang (Gated - 0 of 4 cleared)
        </Button>
      </div>
    </PortalPageLayout>
  );
}
