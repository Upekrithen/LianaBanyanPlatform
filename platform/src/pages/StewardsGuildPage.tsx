/**
 * StewardsGuildPage — Wave 6 Phase V
 * =====================================
 * The Stewards Guild member interface.
 * Route: /stewards-guild
 *
 * Stewards are senior cooperative members who onboard new members,
 * resolve disputes, and guide community health.
 */
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Shield, Star, BookOpen, MessageSquare, ArrowRight, CheckCircle, Crown, Vote } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

interface StewardRole {
  id: string;
  icon: React.ElementType;
  name: string;
  description: string;
  responsibilities: string[];
  requiredStanding: string;
  earns: string;
  color: string;
}

const STEWARD_ROLES: StewardRole[] = [
  {
    id: "welcome-steward",
    icon: Users,
    name: "Welcome Steward",
    description:
      "Welcome Stewards guide new members through their first 30 days. They answer questions, make introductions, and help new members find their first initiative or bounty.",
    responsibilities: [
      "1:1 onboarding session with each assigned new member",
      "Answer questions within 24 hours",
      "Introduce new member to relevant initiative leads",
      "30-day check-in to confirm engagement",
    ],
    requiredStanding: "3+ months membership, good standing",
    earns: "5 Marks per new member guided to first contribution",
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  },
  {
    id: "dispute-steward",
    icon: Shield,
    name: "Dispute Steward",
    description:
      "Dispute Stewards mediate conflicts between members before they escalate to Harper Guild review. Most disputes are resolved at this level - quickly and without formal process.",
    responsibilities: [
      "Respond to dispute requests within 48 hours",
      "Facilitate neutral mediation sessions",
      "Document resolution outcomes",
      "Escalate to Harper Guild when resolution is not reached",
    ],
    requiredStanding: "6+ months membership, 10+ Marks earned, no active disputes",
    earns: "8 Marks per resolved dispute",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  },
  {
    id: "community-steward",
    icon: Star,
    name: "Community Health Steward",
    description:
      "Community Health Stewards monitor the overall health of their initiative area or neighborhood cluster. They surface emerging issues early and coordinate community responses.",
    responsibilities: [
      "Weekly review of assigned initiative activity metrics",
      "Flag declining engagement or quality issues",
      "Organize community events and check-ins",
      "Report community health to the Stewards Guild council",
    ],
    requiredStanding: "9+ months membership, Welcome Steward completion",
    earns: "15 Marks per month for active community stewardship",
    color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  },
  {
    id: "onboarding-steward",
    icon: BookOpen,
    name: "Onboarding Curriculum Steward",
    description:
      "Curriculum Stewards maintain and improve the member onboarding materials. They test the onboarding flow, identify confusion points, and update content.",
    responsibilities: [
      "Monthly review of onboarding completion rates",
      "Identify and fix content gaps",
      "Test new member experience personally each quarter",
      "Propose curriculum improvements as sub-bounties",
    ],
    requiredStanding: "6+ months membership, completed full onboarding curriculum",
    earns: "10 Marks per accepted curriculum improvement",
    color: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
  },
];

export default function StewardsGuildPage() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout variant="stage" xrayId="stewards-guild">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Main
        </Button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Stewards Guild</h1>
            <p className="text-muted-foreground">The member interface for cooperative community health</p>
          </div>
        </div>

        {/* What is the Stewards Guild */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4 text-sm text-muted-foreground space-y-2">
            <p>
              The Stewards Guild is the human layer of the cooperative. While the platform handles
              transactions and the Harper Guild handles audits, Stewards handle the things that
              require judgment, warmth, and community knowledge.
            </p>
            <p>
              Stewards are senior members who have demonstrated commitment and care for the community.
              Stewardship is a calling, not a job title. You can serve in multiple Steward roles as
              your time and skills allow.
            </p>
          </CardContent>
        </Card>

        {/* Roles */}
        <div className="grid gap-6 sm:grid-cols-2">
          {STEWARD_ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.id} className={`border-2 bg-gradient-to-br ${role.color}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                    <CardTitle className="text-base">{role.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Responsibilities:</p>
                    <ul className="space-y-1">
                      {role.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-muted-foreground/70">
                      <span className="font-medium text-muted-foreground">Standing required:</span>{" "}
                      {role.requiredStanding}
                    </p>
                    <p className="text-amber-400">
                      <span className="font-medium">Earns:</span> {role.earns}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Guild Council */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>The Stewards Guild Council</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Active Stewards from all four roles form the Guild Council. The Council meets monthly
              to review community health metrics, address escalated issues, and propose policy
              changes to the cooperative.
            </p>
            <p>
              Council proposals that reach a 2/3 vote are submitted to the broader membership for
              ratification. The Council does not have unilateral power - it serves the community,
              not the reverse.
            </p>
          </CardContent>
        </Card>

        {/* Board Representatives -- Wave 11 / Phase E5 */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle>Board Representatives</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              The Stewards Guild Council holds 2 seats on the cooperative Board of Directors.
              Representatives are elected by the Guild Council -- not appointed by staff or the Founder.
            </p>
            <div className="space-y-2">
              <div className="p-3 rounded bg-muted/30 space-y-1">
                <p className="font-medium text-foreground">Election process</p>
                <ol className="space-y-1 text-xs list-decimal list-inside">
                  <li>Any active Steward in good standing may be nominated</li>
                  <li>Nominations require a second from another active Steward</li>
                  <li>The full Guild Council votes (14-day window)</li>
                  <li>The two candidates with most support votes earn the seats</li>
                  <li>1-year terms, renewable once consecutively</li>
                </ol>
              </div>
              <div className="p-3 rounded bg-muted/30 space-y-1">
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  <Vote className="w-3.5 h-3.5 text-primary" />
                  Board representative responsibilities
                </p>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                    Represent Steward Guild interests in Board deliberations
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                    Report Board decisions back to the Guild Council monthly
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                    Propose Guild-originated policy changes to the Board
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                    Vote on Board-level governance items (non-financial)
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/governance/voting")}
                className="gap-2 text-xs"
              >
                <Vote className="w-3.5 h-3.5" />
                View Council Elections
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/governance")}
                className="gap-2 text-xs"
              >
                <Crown className="w-3.5 h-3.5" />
                Board Composition
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex gap-3 flex-wrap">
          <Button className="gap-2">
            Apply to Become a Steward
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate("/initiatives")}>
            Browse Initiatives
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Steward roles are open to all qualifying members.
          Marks earned through Stewardship represent cooperative participation, not equity.
        </p>
      </div>
    </PortalPageLayout>
  );
}
