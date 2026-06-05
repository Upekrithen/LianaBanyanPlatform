/**
 * ProgressReportCadencePage — Wave 6 Phase W
 * =============================================
 * The regular progress-reporting mechanic for the cooperative.
 * Route: /outreach/progress-report
 *
 * Defines the cadence and format for cooperative progress reports.
 * Not gated - this is the operational reporting structure.
 */
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Calendar, TrendingUp, Users, ArrowRight } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

interface ReportCadence {
  frequency: string;
  name: string;
  audience: string;
  format: string;
  sections: string[];
  color: string;
}

const REPORT_CADENCES: ReportCadence[] = [
  {
    frequency: "Weekly",
    name: "Sprint Report",
    audience: "Internal - Stewards Guild and active contributors",
    format: "Short-form: what shipped, what's blocked, what's next",
    sections: [
      "Scopes completed this week",
      "Active blockers and how they're being resolved",
      "Highlights from Wildfire tour activity",
      "Next 7 days priorities",
    ],
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  },
  {
    frequency: "Monthly",
    name: "Community Health Report",
    audience: "All members - published to /progress",
    format: "Data + narrative: member activity, initiative health, financial transparency",
    sections: [
      "New member count and onboarding completion rate",
      "Initiative activity metrics (transactions, participants)",
      "Marks issued and earned breakdown",
      "Factory node activity and production volume",
      "Stewards Guild community health summary",
    ],
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  },
  {
    frequency: "Quarterly",
    name: "Founder Transparency Report",
    audience: "Public + press + academic partners",
    format: "Full transparency: financials, innovations, member outcomes, platform health",
    sections: [
      "Membership numbers and growth rate",
      "Initiative funding flow (Cost+20% margin allocation)",
      "Canon stat verification (2,270 innovations, 228 Crown Jewels, 21 provisionals)",
      "Marks issuance and redemption (participation metrics)",
      "Spinout formation progress",
      "Platform infrastructure health",
    ],
    color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  },
  {
    frequency: "Annual",
    name: "Cooperative Annual Report",
    audience: "All members + public + potential academic licensing partners",
    format: "Comprehensive annual review: outcomes, finances, member stories, next year plan",
    sections: [
      "Year in review: all 16 initiatives performance",
      "Financial transparency: full margin allocation",
      "Member outcome stories (anonymized consent-based)",
      "Spinout entity status updates",
      "Next year roadmap: member-voted priorities",
      "Benchmark verification status (MnemosyneC / Cardboard Boots)",
    ],
    color: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
  },
];

export default function ProgressReportCadencePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PortalPageLayout variant="stage" xrayId="progress-report-cadence">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Main
        </Button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Progress Report Cadence</h1>
            <p className="text-muted-foreground">The cooperative's regular reporting mechanic</p>
          </div>
        </div>

        {/* Why We Report */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4 text-sm text-muted-foreground space-y-2">
            <p>
              Transparency is not optional for a cooperative. Every member has a right to know
              how the platform is performing, where the margin goes, and whether the
              constitutional promises are being kept.
            </p>
            <p>
              Progress reports are not marketing - they are accountability documents. They
              report what actually happened, including when things did not go as planned.
            </p>
          </CardContent>
        </Card>

        {/* Cadences */}
        <div className="grid gap-6 sm:grid-cols-2">
          {REPORT_CADENCES.map((cadence) => (
            <Card key={cadence.frequency} className={`border-2 bg-gradient-to-br ${cadence.color}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{cadence.frequency}</Badge>
                  <CardTitle className="text-base">{cadence.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Users className="h-3 w-3" />
                  {cadence.audience}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground italic">{cadence.format}</p>
                <div className="space-y-1">
                  <p className="text-xs font-medium">Sections:</p>
                  <ul className="space-y-1">
                    {cadence.sections.map((section, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/50" />
                        {section}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Archive */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Published Reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span>Progress Report 1 (Wave 3)</span>
              <Button size="sm" variant="outline" onClick={() => navigate("/progress-report-1")}>
                View
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="py-4 text-center text-muted-foreground/50 text-xs">
              Future reports will appear here as they are published.
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          All progress reports follow canon numbers: 2,270 innovations / 228 Crown Jewels /
          21 provisionals / 83.3% / Cost+20%.
        </p>
      </div>
    </PortalPageLayout>
  );
}
