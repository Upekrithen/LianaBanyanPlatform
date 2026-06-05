/**
 * MikeyKickoffPage — Wave 6 Phase V
 * ===================================
 * Mikey's actual project kickoff: business plan instance + bounty posters.
 * Route: /people/mikey-kickoff
 *
 * Uses MikeyBusinessPlanTemplate as the interactive business plan.
 * Securities-clean: Marks = participation, not equity.
 */
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, FileText } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { MikeyBusinessPlanTemplate } from "@/components/bounties/MikeyBusinessPlanTemplate";

const MIKEY_BOUNTY_POSTERS = [
  {
    id: "bp-1",
    title: "Client Intake Form Design",
    description:
      "Design a one-page client intake form for a local service-business onboarding workflow. Clean, professional, fillable PDF.",
    reward: "2 Marks",
    skills: ["Design", "Forms"],
    status: "open",
  },
  {
    id: "bp-2",
    title: "Spanish Translation - Business Plan",
    description:
      "Translate the full business plan document to Spanish. Must maintain technical accuracy of Cost+20% and cooperative terms.",
    reward: "3 Marks",
    skills: ["Translation", "Spanish"],
    status: "open",
  },
  {
    id: "bp-3",
    title: "Local Service Business Prospecting",
    description:
      "Find 3 local service businesses (plumbing, landscaping, cleaning) in San Antonio area who would benefit from cooperative invoicing tools. Provide name, contact, and brief profile.",
    reward: "5 Marks",
    skills: ["Research", "Outreach"],
    status: "open",
  },
];

export default function MikeyKickoffPage() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout variant="stage" xrayId="mikey-kickoff">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/people")} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          People Flows
        </Button>

        {/* Hero */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">First Cooperative Hire</Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Active Project
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">Mikey's Project Kickoff</h1>
          <p className="text-muted-foreground">
            Mikey is the first cooperative member to use the business plan template in a real
            kickoff. This page is his project home - business plan, bounty posters, and milestones.
          </p>
        </div>

        {/* Founder note */}
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="py-4 flex items-start gap-3 text-sm">
            <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-200">Founder Note</p>
              <p className="text-amber-200/70 mt-1">
                First cooperative hire. Mikey is learning-by-doing business planning using the
                Cost+20% template. His business plan and bounty posters are live - other members
                can support him by completing his sub-bounties and earning Marks.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Plan Template */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Mikey's Business Plan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <MikeyBusinessPlanTemplate
              instanceName="Mikey"
              focus="Local Service Business Operations Support"
              founderNote="First cooperative hire. Learning-by-doing business planning."
              showSubBountyOption={true}
            />
          </CardContent>
        </Card>

        {/* Bounty Posters */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Mikey's First Bounty Posters</h2>
          <p className="text-sm text-muted-foreground">
            Complete any of these to earn Marks and help Mikey's project move forward.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {MIKEY_BOUNTY_POSTERS.map((bounty) => (
              <Card key={bounty.id} className="border-dashed border-2 hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm leading-tight">{bounty.title}</CardTitle>
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 shrink-0 text-xs">
                      {bounty.reward}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">{bounty.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {bounty.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                  <Button size="sm" className="w-full">
                    Claim this Bounty
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground/60 text-center border-t border-border pt-4">
          Marks represent participation in the Liana Banyan cooperative - not equity, shares,
          or guaranteed financial return.
        </p>
      </div>
    </PortalPageLayout>
  );
}
