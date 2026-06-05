/**
 * CrownLetterWavesPage — Wave 6 Phase W
 * ========================================
 * Crown-letter publishing waves: Trebor/Schneider + Bingo competitor-welcome
 * per Innovation #52.
 * Route: /outreach/crown-letters
 *
 * This page manages the crown-letter campaign cadence.
 * Stage-only until founder publishes.
 */
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Crown, Users, Clock } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

interface LetterWave {
  id: string;
  name: string;
  recipients: string;
  purpose: string;
  innovationRef?: string;
  status: "draft" | "staged" | "sent" | "held";
  heldReason?: string;
}

const LETTER_WAVES: LetterWave[] = [
  {
    id: "trebor-schneider",
    name: "Trebor / Schneider Letter",
    recipients: "Trebor Scholz (Platform Cooperativism) + Nathan Schneider (scholar)",
    purpose:
      "Introduce LianaBanyan as a working implementation of platform cooperativism. Invite review, critique, and potential academic partnership.",
    status: "staged",
  },
  {
    id: "bingo-competitor-welcome",
    name: "Bingo Competitor Welcome",
    recipients: "Identified cooperative competitors in the food/services space",
    purpose:
      "Per Innovation #52: welcome competitors into the cooperative ecosystem rather than treating them as enemies. The platform gains strength from adjacent cooperatives.",
    innovationRef: "Innovation #52",
    status: "staged",
  },
  {
    id: "ai-gang-letter",
    name: "AI-Gang Scholar Letters",
    recipients: "Scholz, Brynjolfsson, Newmark, Doctorow, Ollama team",
    purpose:
      "Crown letters to key AI/technology scholars inviting them to evaluate the cooperative's AI governance model and MnemosyneC architecture.",
    status: "held",
    heldReason: "Held pending AI-Gang go-live ratification",
  },
  {
    id: "nyt-social",
    name: "NYT + Social Announcement",
    recipients: "New York Times + major social platforms",
    purpose:
      "Public launch announcement. Thursday gate. Held until founder authorizes.",
    status: "held",
    heldReason: "Held - Thursday gate, founder authorization required",
  },
];

const STATUS_STYLES: Record<LetterWave["status"], string> = {
  draft: "border-slate-500/40 text-slate-400 bg-slate-500/10",
  staged: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  sent: "border-green-500/40 text-green-400 bg-green-500/10",
  held: "border-red-500/40 text-red-400 bg-red-500/10",
};

export default function CrownLetterWavesPage() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout variant="stage" xrayId="crown-letter-waves">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Main
        </Button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 text-amber-400" />
          <div>
            <h1 className="text-3xl font-bold">Crown Letter Waves</h1>
            <p className="text-muted-foreground">Outreach cadence for scholars, competitors, and public launch</p>
          </div>
        </div>

        {/* Stage notice */}
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="py-3 flex items-center gap-2 text-sm text-amber-200">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              Letters are staged here for founder review. "Held" letters require explicit
              founder authorization before sending.
            </span>
          </CardContent>
        </Card>

        {/* What Crown Letters Are */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>What Crown Letters Are</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Crown letters are high-trust outreach to individuals whose knowledge, platform,
              or network can meaningfully advance the cooperative mission. They are not mass
              marketing - each letter is specifically researched and personally written.
            </p>
            <p>
              The "crown" in Crown Letters refers to the LianaBanyan canopy - reaching out to
              those who can extend our shelter to more people. Every crown letter invites
              engagement, critique, and genuine partnership.
            </p>
          </CardContent>
        </Card>

        {/* Letter Waves */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Letter Waves</h2>
          {LETTER_WAVES.map((wave) => (
            <Card key={wave.id} className="border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{wave.name}</CardTitle>
                      {wave.innovationRef && (
                        <Badge variant="outline" className="text-xs">{wave.innovationRef}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {wave.recipients}
                    </div>
                  </div>
                  <Badge className={`text-xs shrink-0 ${STATUS_STYLES[wave.status]}`}>
                    {wave.status.charAt(0).toUpperCase() + wave.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{wave.purpose}</p>
                {wave.heldReason && (
                  <p className="text-xs text-red-400 italic">{wave.heldReason}</p>
                )}
                {wave.status === "staged" && (
                  <Button size="sm" variant="outline" disabled>
                    Awaiting Founder Authorization
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Crown letter publishing is gated by founder authorization.
          No letter sends without explicit approval.
        </p>
      </div>
    </PortalPageLayout>
  );
}
