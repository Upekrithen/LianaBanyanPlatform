/**
 * GUILD HUB — The NOIDs (Named Organizations of Interest & Discipline)
 * =====================================================================
 * Self-selection into communities of interest. No forced questionnaires.
 * Walk in, look around, sit where you want.
 *
 * Features:
 * - 7 founding guilds with descriptions and open positions
 * - The Handshake Protocol (30-day mutual exploration)
 * - Founding Partner search for each guild
 * - Reference Expert recruitment
 * - Cue Card integration for guild recruiting
 *
 * Route: /guilds/hub (separate from /guilds which is the DB-driven list)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Handshake, Shield, Calendar, Clock, Award,
  ArrowRight, Star, ChevronDown, ChevronUp, BookOpen,
  Send, CheckCircle2, Target
} from "lucide-react";
import { GUILDS, HANDSHAKE_PROTOCOL, type Guild, type GuildPosition } from "@/lib/guildSystem";
import { TasteRangerDashboard, FantasyBridge } from "@/components/bandwagon";
import { HANDSHAKE_DOCUMENT } from "@/lib/guildHandshakeProtocol";

// ─── Guild Card Component ──────────────────────────────────────────────────

function GuildCard({ guild, onApply }: { guild: Guild; onApply: (guild: Guild, position: GuildPosition) => void }) {
  const [expanded, setExpanded] = useState(false);
  const openPositions = guild.openPositions.filter(p => p.status === "open");
  const foundingPartner = openPositions.find(p => p.type === "founding_partner");

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: guild.color }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{guild.icon}</span>
            <div>
              <CardTitle className="text-xl">{guild.name}</CardTitle>
              <CardDescription className="italic">{guild.motto}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Users className="w-3 h-3" />
            {openPositions.length} open
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{guild.description}</p>

        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Focus:</span> {guild.focus}
        </div>

        {/* Founding Partner highlight */}
        {foundingPartner && (
          <div
            className="rounded-lg p-4 border-2 border-dashed"
            style={{ borderColor: `${guild.color}40`, background: `${guild.color}08` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4" style={{ color: guild.color }} />
              <span className="font-semibold text-sm">Seeking: {guild.partnerRole}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{guild.partnerDescription}</p>
            <Button
              size="sm"
              className="gap-1"
              style={{ background: guild.color }}
              onClick={() => onApply(guild, foundingPartner)}
            >
              <Handshake className="w-3 h-3" /> Start The Handshake
            </Button>
          </div>
        )}

        {/* Expand to see all positions */}
        {openPositions.length > 1 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Hide" : "View"} all {openPositions.length} positions
          </button>
        )}

        {expanded && (
          <div className="space-y-2">
            {openPositions.map(pos => (
              <div key={pos.id} className="rounded-md bg-muted/50 p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{pos.title}</span>
                  <Badge variant={pos.type === "founding_partner" ? "default" : "secondary"} className="text-[10px]">
                    {pos.type === "founding_partner" ? "Partner" : "Expert"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{pos.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{pos.marksCompensation}</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onApply(guild, pos)}>
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Handshake Protocol Display ────────────────────────────────────────────

function HandshakeProtocolDisplay() {
  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Handshake className="w-6 h-6 text-amber-500" />
          The Handshake — 30-Day Mutual Exploration
        </CardTitle>
        <CardDescription>
          This is not a job interview. This is how we find out if we're good for each other.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-background">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold">{HANDSHAKE_PROTOCOL.durationDays}</div>
            <div className="text-xs text-muted-foreground">Days</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background">
            <Users className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold">{HANDSHAKE_PROTOCOL.totalConversations}</div>
            <div className="text-xs text-muted-foreground">Conversations</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background">
            <Clock className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold">{HANDSHAKE_PROTOCOL.maxHoursPerConversation}h</div>
            <div className="text-xs text-muted-foreground">Max Per Session</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background">
            <Award className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold">{HANDSHAKE_PROTOCOL.marksForParticipation}</div>
            <div className="text-xs text-muted-foreground">Marks Earned</div>
          </div>
        </div>

        {/* Terms */}
        <div>
          <h4 className="font-semibold mb-3 text-sm">The Terms (Set In Stone Before We Speak)</h4>
          <ul className="space-y-2">
            {HANDSHAKE_PROTOCOL.terms.map((term, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Shield className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Founder's commitment */}
        <div className="rounded-lg bg-amber-500/10 p-4 border border-amber-500/20">
          <p className="text-sm italic text-center">
            "{HANDSHAKE_PROTOCOL.founderCommitment}"
          </p>
          <p className="text-xs text-center text-muted-foreground mt-2">— Jonathan Jones, Founder</p>
        </div>

        {/* Three outcomes */}
        <div>
          <h4 className="font-semibold mb-3 text-sm">After 30 Days — Three Possible Outcomes</h4>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
              <h5 className="font-semibold text-sm text-green-500 mb-1">Founding Partner</h5>
              <p className="text-xs text-muted-foreground">Core team. Significant Marks. Deep collaboration. Increasing responsibility.</p>
            </div>
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
              <h5 className="font-semibold text-sm text-blue-500 mb-1">Reference Expert</h5>
              <p className="text-xs text-muted-foreground">Guild standing. Occasional consultation. Marks for contributions. Growing role.</p>
            </div>
            <div className="rounded-lg bg-muted/50 border p-3">
              <h5 className="font-semibold text-sm mb-1">No Fit</h5>
              <p className="text-xs text-muted-foreground">No hard feelings. Keep earned Marks. Door stays open for the future.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Guild Application Dialog ─────────────────────────────────────────────

function GuildApplicationDialog({
  open,
  onOpenChange,
  guild,
  position,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guild: Guild | null;
  position: GuildPosition | null;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [background, setBackground] = useState("");
  const [motivation, setMotivation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user || !guild || !position) return;

      // Record application as a guild_membership with role = "applicant"
      const { error } = await supabase.from("guild_memberships").insert({
        guild_id: guild.id,
        member_id: user.id,
        role: "applicant",
        is_active: false,
      });

      if (error) {
        // If they've already applied, let them know
        if (error.code === "23505") {
          throw new Error("You've already applied to this guild.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Application submitted!",
        description: `Your interest in ${guild?.name} has been recorded. The Handshake begins soon.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Could not submit",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after close animation
    setTimeout(() => {
      setDisplayName("");
      setBackground("");
      setMotivation("");
      setSubmitted(false);
    }, 300);
  };

  if (!guild || !position) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
            <DialogHeader>
              <DialogTitle>You're In the Queue</DialogTitle>
              <DialogDescription>
                Your interest in {guild.name} as {position.title} has been recorded.
                The Handshake Protocol is a 30-day mutual exploration — no tricks, no games.
                You'll hear from us soon.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} className="mt-4">
              Got It
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{guild.icon}</span>
                Apply: {position.title}
              </DialogTitle>
              <DialogDescription>
                {guild.name} — {position.type === "founding_partner"
                  ? "Founding Partner (The Handshake: 30-day mutual exploration)"
                  : "Reference Expert"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Position details */}
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <p className="text-muted-foreground">{position.description}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Compensation:</span> {position.marksCompensation}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Commitment:</span>{" "}
                  {position.commitmentLevel === "full" ? "Full-time" : position.commitmentLevel === "part_time" ? "Part-time" : "Advisory"}
                </p>
              </div>

              {/* Requirements */}
              {position.requirements.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">What we're looking for:</Label>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-0.5">
                    {position.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Application fields */}
              <div>
                <Label htmlFor="app-name">Your name or moniker</Label>
                <Input
                  id="app-name"
                  placeholder="How should we address you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="app-background">Relevant background</Label>
                <Textarea
                  id="app-background"
                  placeholder="What experience, skills, or interests make this a good fit?"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="app-motivation">Why this guild?</Label>
                <Textarea
                  id="app-motivation"
                  placeholder="What draws you to this guild and this role?"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  rows={2}
                />
              </div>

              {/* The Handshake reminder */}
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <p className="text-xs text-muted-foreground">
                  <Handshake className="w-3 h-3 inline mr-1 text-amber-500" />
                  By applying, you're expressing interest in The Handshake — a 30-day mutual exploration.
                  No commitment until both sides agree. Terms are set in stone before we speak.
                </p>
              </div>

              <Button
                onClick={() => submitMutation.mutate()}
                disabled={!displayName.trim() || submitMutation.isPending}
                className="w-full gap-2"
                style={{ background: guild.color }}
              >
                <Send className="w-4 h-4" />
                {submitMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function GuildHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);
  const [applicationDialog, setApplicationDialog] = useState<{
    open: boolean;
    guild: Guild | null;
    position: GuildPosition | null;
  }>({ open: false, guild: null, position: null });

  const handleApply = (guild: Guild, position: GuildPosition) => {
    if (!user) {
      openOnboard({
        reason: `join ${guild.name} as ${position.title}`,
        actionLabel: "Join",
        membershipIncluded: true,
        onComplete: () => {
          // After onboard, open the application dialog
          setApplicationDialog({ open: true, guild, position });
        },
      });
      return;
    }
    setApplicationDialog({ open: true, guild, position });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold">The Guilds</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Named Organizations of Interest & Discipline. Walk in, look around, sit where you want.
          No questionnaires. No forced choices. You choose your guild.
        </p>
        <p className="text-sm text-muted-foreground/70">
          Each guild is seeking a Founding Partner and Reference Experts through The Handshake — a 30-day mutual exploration.
        </p>
      </div>

      <Tabs defaultValue="guilds" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guilds" className="gap-2">
            <Users className="w-4 h-4" /> The 7 Guilds
          </TabsTrigger>
          <TabsTrigger value="handshake" className="gap-2">
            <Handshake className="w-4 h-4" /> The Handshake Protocol
          </TabsTrigger>
          <TabsTrigger value="bandwagon" className="gap-2">
            <Target className="w-4 h-4" /> BandWagon
          </TabsTrigger>
        </TabsList>

        {/* ─── GUILDS TAB ─── */}
        <TabsContent value="guilds" className="space-y-6">
          {/* Philosophy banner */}
          <div className="rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 p-6 text-center">
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Members join guilds based on interest, desire, or occupation — freely, as they see fit.
              I despise being forced to choose before I even know I want to sit down.
              Be in charge of you.
            </p>
          </div>

          {/* Guild grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {GUILDS.map(guild => (
              <GuildCard key={guild.id} guild={guild} onApply={handleApply} />
            ))}
          </div>

          {/* Summary stats */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{GUILDS.length}</div>
                  <div className="text-xs text-muted-foreground">Founding Guilds</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {GUILDS.reduce((sum, g) => sum + g.openPositions.filter(p => p.status === "open").length, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Open Positions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{GUILDS.filter(g => g.openPositions.some(p => p.type === "founding_partner" && p.status === "open")).length}</div>
                  <div className="text-xs text-muted-foreground">Partner Searches</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">30</div>
                  <div className="text-xs text-muted-foreground">Day Handshake</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── BANDWAGON TAB ─── */}
        <TabsContent value="bandwagon" className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Earn allocation authority by identifying and sponsoring high-quality projects. Service Allocation Authority (SAA) and Backed Marks — no investment, no return; you direct cooperative resources.
          </p>
          <TasteRangerDashboard />
          <FantasyBridge />
        </TabsContent>

        {/* ─── HANDSHAKE TAB ─── */}
        <TabsContent value="handshake" className="space-y-6">
          <HandshakeProtocolDisplay />

          {/* Full protocol document sections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {HANDSHAKE_DOCUMENT.title}
              </CardTitle>
              <CardDescription>Version {HANDSHAKE_DOCUMENT.version}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {HANDSHAKE_DOCUMENT.sections.map((section, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="font-semibold text-sm">{section.heading}</h4>
                  <p className="text-sm text-muted-foreground">{section.content}</p>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                      {section.bullets.map((bullet, j) => (
                        <li key={j}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Dialog */}
      <GuildApplicationDialog
        open={applicationDialog.open}
        onOpenChange={(open) => setApplicationDialog(prev => ({ ...prev, open }))}
        guild={applicationDialog.guild}
        position={applicationDialog.position}
      />
    </div>
  );
}
