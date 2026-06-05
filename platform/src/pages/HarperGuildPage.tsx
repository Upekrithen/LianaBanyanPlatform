/**
 * HarperGuildPage -- Wave 18 mini-app / BP073 W9 (real-data wired)
 *
 * The Harper Guild serves two intertwined roles drawn from history:
 *   1. Ethics enforcement and care coordination (non-influenceable watchdogs)
 *   2. Creative guild for writers, artists, and musicians (IP-Ledger tracked)
 *
 * Features added in Wave 18:
 *   - Creative project coordination with typed stubs
 *   - IP-Ledger integration (content.created + branch.merge for co-authorship)
 *   - Marks for creative work (participation rewards, not equity)
 *   - Brand Stamp on every published output
 *   - Bounty poster commissions via BountyPosterGenerator link
 *   - InitiativeWalkthrough + InitiativeCueCard onboarding hook
 *
 * Supabase: guild_master_profiles
 * Migration: 20260603120001_bp073_w9_guild_master_profiles.sql
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Heart, Eye, Users, BookOpen, Star, Activity,
  Pen, Music, Brush, GitMerge, FileCheck, Plus, Link2, Award, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { InitiativeWalkthrough } from '@/components/initiatives/InitiativeWalkthrough';
import { InitiativeCueCard } from '@/components/initiatives/InitiativeCueCard';
import { getWalkthrough, getCueCard } from '@/data/initiativeWalkthroughs';
import { addToIPLedger, recordBranchMerge } from '@/lib/nervous-system/ipLedger';
import '@/styles/landing.css';
import { usePageSEO } from "@/hooks/usePageSEO";

// ─── Types ──────────────────────────────────────────────────────────────────

type CreativeRole = 'writer' | 'artist' | 'musician' | 'researcher';
type ProjectStatus = 'open' | 'in-progress' | 'published';

interface CreativeProject {
  id: string;
  title: string;
  type: CreativeRole;
  description: string;
  contributors: string[];
  marksReward: number;
  status: ProjectStatus;
  ipLedgerSeq: number | null;
  brandStamp: boolean;
  coAuthors: string[];
}

type HarperTab = 'overview' | 'projects' | 'commissions' | 'walkthrough';

// ─── Stub Data ───────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<CreativeRole, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
}> = {
  writer:     { icon: Pen,      label: 'Writer',         color: 'text-indigo-500' },
  artist:     { icon: Brush,    label: 'Visual Artist',  color: 'text-violet-500' },
  musician:   { icon: Music,    label: 'Musician',       color: 'text-pink-500'   },
  researcher: { icon: BookOpen, label: 'Researcher',     color: 'text-teal-500'   },
};

const STUB_PROJECTS: CreativeProject[] = [
  {
    id: 'proj-001',
    title: 'Cooperative Origin Stories: Volume 1',
    type: 'writer',
    description:
      'A collection of essays from platform members about why they joined. Each submitted story is logged on the IP-Ledger as a content.created entry with Brand Stamp on publication.',
    contributors: ['Member #0042', 'Member #0117', 'Member #0209'],
    marksReward: 50,
    status: 'in-progress',
    ipLedgerSeq: 1041,
    brandStamp: true,
    coAuthors: ['Member #0042', 'Member #0117'],
  },
  {
    id: 'proj-002',
    title: 'Liana Banyan Illustrated Almanac',
    type: 'artist',
    description:
      'Artists illustrating the 16 Sweet Sixteen initiatives. Each illustration is a branch.merge ledger entry crediting both the illustrator and the editorial reviewer.',
    contributors: ['Member #0088'],
    marksReward: 120,
    status: 'open',
    ipLedgerSeq: null,
    brandStamp: false,
    coAuthors: [],
  },
  {
    id: 'proj-003',
    title: 'Platform Anthem (Fork Competition)',
    type: 'musician',
    description:
      'Members submit original compositions. Community votes via branch.fork. The winning track receives 500 Marks and an automatic JukeBox catalog listing at Cost+20%.',
    contributors: ['Member #0315', 'Member #0201'],
    marksReward: 500,
    status: 'open',
    ipLedgerSeq: null,
    brandStamp: false,
    coAuthors: [],
  },
  {
    id: 'proj-004',
    title: 'Ethics Case Studies: Year One',
    type: 'researcher',
    description:
      'Documented ethics investigations from the first operational year, anonymized and published as cooperative learning resources. IP-Ledger entry on completion.',
    contributors: ['Member #0501', 'Member #0203'],
    marksReward: 80,
    status: 'published',
    ipLedgerSeq: 982,
    brandStamp: true,
    coAuthors: ['Member #0501', 'Member #0203'],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function HarperGuildPage() {
  usePageSEO({
    title: "Harper Guild | Liana Banyan",
    description: "A cooperative guild for writers and storytellers. Publish, share, and earn with 83.3% going to the creator.",
    canonical: "https://lianabanyan.com/initiatives/harper-guild",
  });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<HarperTab>('overview');
  const [loggedEntries, setLoggedEntries] = useState<string[]>([]);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const walkthrough = getWalkthrough('harper-guild');
  const cueCard = getCueCard('harper-guild');

  const { data: liveProjects = [] } = useQuery({
    queryKey: ["guild_master_profiles", "harper_guild"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("guild_master_profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const allProjects: CreativeProject[] = liveProjects.length > 0
    ? liveProjects.map((gm: any) => ({
        id: gm.id,
        title: `${gm.display_name} — ${gm.specialty}`,
        type: "writer" as const,
        description: gm.bio ?? "Guild member creative work.",
        contributors: [gm.display_name],
        marksReward: 25,
        status: "in-progress" as const,
        ipLedgerSeq: null,
        brandStamp: false,
        coAuthors: [],
      }))
    : STUB_PROJECTS;

  async function handleLogContribution(project: CreativeProject) {
    if (project.ipLedgerSeq !== null || loggingId === project.id) return;
    setLoggingId(project.id);
    const entry = await addToIPLedger('content.created', {
      project_id: project.id,
      title: project.title,
      type: project.type,
      brand_stamp: true,
      harper_guild: true,
      submitted_at: new Date().toISOString(),
      note: 'Harper Guild creative contribution -- provenance record.',
    });
    setLoggingId(null);
    if (entry) {
      setLoggedEntries(prev => [...prev, `#${entry.sequence_number} content.created -- "${project.title}"`]);
    }
  }

  async function handleRecordCoAuthor(project: CreativeProject) {
    if (project.coAuthors.length < 2 || loggingId === project.id) return;
    setLoggingId(project.id);
    const entry = await recordBranchMerge({
      baseInnovationRef: 14,
      branchId: `hg-${project.id}-branch-a`,
      mergedBranchId: `hg-${project.id}-branch-b`,
      coAuthors: project.coAuthors,
      summary: `Co-author merge: "${project.title}"`,
    });
    setLoggingId(null);
    if (entry) {
      setLoggedEntries(prev => [...prev, `#${entry.sequence_number} branch.merge -- "${project.title}" (${project.coAuthors.join(', ')})`]);
    }
  }

  return (
    <LaunchConditionOverlay initiativeSlug="harper-guild" initiativeName="Harper Guild">
      <PortalPageLayout variant="immersive" className="landing-page" xrayId="harper-guild-page">
        <div className="landing-title">
          <span className="liana">Liana</span>
          <span className="banyan">Banyan</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

          {/* Header */}
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 text-muted-foreground border-border">Initiative #14</Badge>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl flex items-center justify-center gap-3">
              <BookOpen className="h-10 w-10 text-indigo-500" />
              Harper Guild
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              The conscience and creative core of Liana Banyan. Ethics watchdogs, truth-carriers, and the cooperative's writers, artists, and musicians -- all in one guild.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {([
              { key: 'overview',    label: 'Guild Overview',    icon: Shield    },
              { key: 'projects',    label: 'Creative Projects', icon: GitMerge  },
              { key: 'commissions', label: 'Commissions',       icon: FileCheck },
              { key: 'walkthrough', label: 'How it Works',      icon: Activity  },
            ] as const).map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeTab === key ? 'default' : 'outline'}
                onClick={() => setActiveTab(key)}
                className={activeTab === key ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              >
                <Icon className="mr-2 h-4 w-4" /> {label}
              </Button>
            ))}
          </div>

          {/* ── Tab Content ─────────────────────────────────────────────────── */}
          <div className="min-h-[500px]">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-300">

                {/* Non-influenceable card */}
                <Card className="border-l-4 border-l-indigo-500 shadow-lg bg-card">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Shield className="h-6 w-6 text-indigo-500" />
                      Non-Influenceable By Design
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-lg text-muted-foreground space-y-4">
                    <p>
                      Traditional HR works for the company, not the employee. The Harper Guild flips this. Harpers are care coordinators embedded in every initiative, but they are <strong>paid by the platform, not by the businesses they serve</strong>.
                    </p>
                    <p>
                      They cannot be fired by the businesses they observe. They report only to the Harper Guild. They are the immune system of the cooperative -- independent observers who identify when something is wrong before it breaks.
                    </p>
                  </CardContent>
                </Card>

                {/* The dual role */}
                <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Music className="h-5 w-5 text-violet-500" />
                      The Historical Harper: Both Roles at Once
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      In medieval courts, the harper was the only person who could walk freely between enemies. Protected by their art, they carried true information. No court owned the harper. The truth was the credential.
                    </p>
                    <p>
                      On Liana Banyan, the Harper Guild preserves both roles: <strong>ethics watchdogs</strong> who carry true information across the platform, and <strong>creative stewards</strong> -- writers, artists, and musicians -- who make that culture worth protecting.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-white p-4 rounded-lg border border-indigo-100 flex items-start gap-3">
                        <Shield className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground text-sm">Ethics and Care</p>
                          <p className="text-xs text-muted-foreground">Independent auditors, fact-finders, and care coordinators. Non-influenceable by any business.</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-violet-100 flex items-start gap-3">
                        <Pen className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground text-sm">Creative Guild</p>
                          <p className="text-xs text-muted-foreground">Writers, artists, and musicians whose work is IP-Ledger tracked and Brand Stamped on every output.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Crown Section */}
                <div className="bg-card rounded-2xl p-8 relative overflow-hidden border">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Star className="h-48 w-48" />
                  </div>
                  <div className="relative z-10">
                    <Badge className="bg-indigo-100 text-indigo-800 mb-4">The Crown: Harper Prime Mentor</Badge>
                    <h2 className="text-3xl font-bold mb-4">Why We Wrote to Brene Brown</h2>
                    <p className="text-muted-foreground text-lg mb-4 max-w-3xl">
                      Liana Banyan asks workers to be vulnerable: to put their cooking in front of strangers, to create music that might not sell, to start businesses that might fail, and to ask for help when they are struggling.
                    </p>
                    <p className="text-muted-foreground text-lg max-w-3xl">
                      Vulnerability requires safety. We asked Dr. Brene Brown to be the Harper Prime Mentor to help us build care infrastructure at scale -- systems that identify when a worker is struggling and ensure the culture does not drift from its values.
                    </p>
                    <p className="text-muted-foreground/70 italic mt-4">
                      "The Harper Guild is infrastructure for courage. It creates the conditions where workers can be vulnerable because someone is watching out for them."
                    </p>
                  </div>
                </div>

                {/* Oops Code System */}
                <Card className="border-t-4 border-t-amber-500">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Activity className="h-6 w-6 text-amber-500" />
                      The "Oops" Code System
                    </CardTitle>
                    <CardDescription>Camouflage and Readiness Training</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      The Harper Guild generates automatic false-positive check-ins -- fake wellness alerts that activate the exact same response protocols as real ones. Harpers cannot tell the difference until the check-in is complete.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-sm space-y-2 text-amber-800">
                        <p className="font-bold">Why We Do It:</p>
                        <div className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5 shrink-0" /><p><strong>Camouflage:</strong> Normalizes check-ins so real alerts do not stand out.</p></div>
                        <div className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5 shrink-0" /><p><strong>Readiness:</strong> Keeps responders trained during low-activity periods.</p></div>
                        <div className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5 shrink-0" /><p><strong>Reliability:</strong> Tests the system continuously.</p></div>
                      </div>
                      <div className="flex items-center justify-center p-4 bg-muted rounded-lg border text-center">
                        <p className="text-sm font-medium text-muted-foreground italic">
                          "We'd rather check on you 100 times for nothing than miss the one time you need us."
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Harper Tiers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Users className="h-5 w-5 text-indigo-500" />
                      Harper Tiers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { rank: 'Harper',         tenure: '6+ months track record',     powers: 'Triage, review, issue warnings.' },
                        { rank: 'Senior Harper',  tenure: '90+ days as Harper',         powers: 'Temporary suspensions up to 30 days, review appeals.' },
                        { rank: 'Harper Elder',   tenure: '365+ days as Senior Harper', powers: 'Permanent bans, Underground Railroad access.' },
                      ].map(tier => (
                        <div key={tier.rank} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                          <Badge variant="outline" className="shrink-0 mt-0.5">{tier.rank}</Badge>
                          <div>
                            <p className="text-sm font-medium text-foreground">{tier.powers}</p>
                            <p className="text-xs text-muted-foreground">{tier.tenure}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-4 italic">
                      Harper status is earned, not applied for. The algorithm watches your contribution quality. No committees, no favoritism.
                    </p>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button variant="outline" onClick={() => navigate('/cephas/founder-proof')}>
                    <Heart className="mr-2 h-4 w-4 text-rose-500" />
                    Read the Founder's Anecdotes
                  </Button>
                </div>
              </div>
            )}

            {/* CREATIVE PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Creative Projects</h2>
                    <p className="text-muted-foreground mt-1">
                      Every contribution is logged on the IP-Ledger. Co-authors tracked via branch.merge. Brand Stamp on every published output.
                    </p>
                  </div>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => navigate('/bounty-poster-generator')}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Post a Commission
                  </Button>
                </div>

                {/* IP-Ledger Activity Feed */}
                {loggedEntries.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <FileCheck className="h-4 w-4" /> IP-Ledger Entries Written This Session:
                    </p>
                    <ul className="space-y-1">
                      {loggedEntries.map((e, i) => (
                        <li key={i} className="text-xs text-green-700 font-mono">{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Project Cards */}
                <div className="space-y-4">
                  {allProjects.map(project => {
                    const RoleIcon = ROLE_CONFIG[project.type].icon;
                    const isLogging = loggingId === project.id;
                    return (
                      <Card key={project.id} data-xray-id={`harper-project-${project.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                                <RoleIcon className={`h-5 w-5 ${ROLE_CONFIG[project.type].color}`} />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{project.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant="outline" className="text-xs">{ROLE_CONFIG[project.type].label}</Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      project.status === 'published'   ? 'border-green-500 text-green-700' :
                                      project.status === 'in-progress' ? 'border-amber-500 text-amber-700' :
                                                                          'border-blue-500 text-blue-700'
                                    }`}
                                  >
                                    {project.status}
                                  </Badge>
                                  {project.brandStamp && (
                                    <Badge className="text-xs bg-indigo-100 text-indigo-700 border border-indigo-200">
                                      <Award className="h-3 w-3 mr-1" /> Brand Stamped
                                    </Badge>
                                  )}
                                  {project.ipLedgerSeq !== null && (
                                    <Badge className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                                      Ledger #{project.ipLedgerSeq}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-indigo-600">{project.marksReward} Marks</p>
                              <p className="text-xs text-muted-foreground">participation reward</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              {project.contributors.length > 0 ? project.contributors.join(', ') : 'No contributors yet -- be the first.'}
                            </span>
                          </div>
                          {project.coAuthors.length > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              <GitMerge className="h-4 w-4 text-violet-500 shrink-0" />
                              <span className="text-xs text-violet-700">
                                Co-authors: {project.coAuthors.join(', ')}
                              </span>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLogContribution(project)}
                            disabled={project.ipLedgerSeq !== null || isLogging}
                          >
                            <Link2 className="mr-1 h-3 w-3" />
                            {project.ipLedgerSeq !== null ? 'Logged to Ledger' : isLogging ? 'Logging...' : 'Log to IP-Ledger'}
                          </Button>
                          {project.coAuthors.length >= 2 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRecordCoAuthor(project)}
                              disabled={isLogging}
                            >
                              <GitMerge className="mr-1 h-3 w-3" /> Record Co-Author Merge
                            </Button>
                          )}
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                            Join Project
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>

                {/* Attribution Model Explainer */}
                <div className="bg-muted rounded-xl p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-indigo-500" /> IP-Ledger Attribution Model
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Every creative contribution is logged with a hash-chained IP-Ledger entry. Co-authorship uses the branch.merge model -- both creators are credited permanently. Brand Stamp is applied to every published output.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-card p-3 rounded-lg border">
                      <p className="font-mono font-semibold text-indigo-600 mb-1">content.created</p>
                      <p className="text-muted-foreground">Single author. Timestamped, hash-chained, Brand Stamped on publication.</p>
                    </div>
                    <div className="bg-card p-3 rounded-lg border">
                      <p className="font-mono font-semibold text-violet-600 mb-1">branch.merge</p>
                      <p className="text-muted-foreground">Co-author merge. Both credited. Neither can be erased from the chain.</p>
                    </div>
                    <div className="bg-card p-3 rounded-lg border">
                      <p className="font-mono font-semibold text-pink-600 mb-1">branch.fork</p>
                      <p className="text-muted-foreground">Competing versions. Community votes. Winner canonized on ledger.</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-3 italic">
                    Provenance records only. Not a legal patent grant. Counsel-gated before any Contributor Contract is enforceable.
                  </p>
                </div>
              </div>
            )}

            {/* COMMISSIONS */}
            {activeTab === 'commissions' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Creative Commissions</h2>
                  <p className="text-muted-foreground mt-1">
                    Post bounty commissions for creative work. Writers, artists, musicians, and researchers respond. IP-Ledger tracks every completed bounty. Brand Stamp on every output.
                  </p>
                </div>

                {/* Marks disclaimer */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">
                    <strong>Marks are participation credits.</strong> Marks earned for Harper Guild creative work represent your cooperative standing and contribution history. They are not equity in any output, not an investment return, and not a financial claim on any project. See platform canon for full Marks disclosure.
                  </p>
                </div>

                {/* Commission Class Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      type:        'writer'   as CreativeRole,
                      title:       'Content Writing',
                      reward:      'Credits',
                      description: 'Blog posts, essays, platform documentation, member stories. IP ownership belongs to the poster unless negotiated otherwise.',
                      template:    'content',
                    },
                    {
                      type:        'artist'   as CreativeRole,
                      title:       'Visual Design',
                      reward:      'Credits',
                      description: 'Illustrations, initiative artwork, Brand Stamp assets. Brand Stamp applied to all published visual output.',
                      template:    'design',
                    },
                    {
                      type:        'musician' as CreativeRole,
                      title:       'Music Commissions',
                      reward:      'Credits + JukeBox listing',
                      description: 'Original compositions, platform audio identity, JukeBox catalog entries. Artist keeps 83.3% on all future licensing.',
                      template:    'content',
                    },
                    {
                      type:        'researcher' as CreativeRole,
                      title:       'Research Bounties',
                      reward:      'Credits',
                      description: 'Market analysis, competitive research, canon documentation. Submitted work logged on IP-Ledger immediately.',
                      template:    'research',
                    },
                    {
                      type:        'writer'   as CreativeRole,
                      title:       'Translation',
                      reward:      'Marks',
                      description: 'Localize platform content, initiative descriptions, cue cards. Marks reward per accepted translation unit.',
                      template:    'translation',
                    },
                    {
                      type:        'artist'   as CreativeRole,
                      title:       'UX & Accessibility',
                      reward:      'Credits',
                      description: 'Accessibility improvements, UX enhancements, mobile design. Platform-owned output with full contributor attribution.',
                      template:    'design',
                    },
                  ].map((commission, i) => {
                    const RoleIcon = ROLE_CONFIG[commission.type].icon;
                    return (
                      <Card key={i} className="flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <RoleIcon className={`h-5 w-5 ${ROLE_CONFIG[commission.type].color}`} />
                            <CardTitle className="text-base">{commission.title}</CardTitle>
                          </div>
                          <Badge variant="outline" className="w-fit text-xs">{commission.reward}</Badge>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <p className="text-sm text-muted-foreground">{commission.description}</p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate(`/bounty-poster-generator?template=${commission.template}`)}
                          >
                            Create Bounty Poster
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>

                {/* Brand Stamp Info */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-indigo-900 mb-2">Brand Stamp on Every Output</h3>
                      <p className="text-sm text-indigo-800 mb-3">
                        All Harper Guild creative output receives a Brand Stamp. The stamp includes the IP-Ledger sequence number, contributor names, and the cooperative co-authorship agreement. This is a permanent, public record of who made what.
                      </p>
                      <p className="text-xs text-indigo-600 italic">
                        Marks earned for creative commissions are participation rewards. Not investment returns. Not equity in any output.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => navigate('/bounty-poster-generator')}
                  >
                    Open Bounty Poster Generator
                  </Button>
                </div>
              </div>
            )}

            {/* WALKTHROUGH */}
            {activeTab === 'walkthrough' && walkthrough && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">How the Harper Guild Works</h2>
                  <p className="text-muted-foreground mt-1 mb-4">Step-by-step member onboarding.</p>
                  {walkthrough.originAnecdote && (
                    <div className="bg-muted p-5 rounded-xl border border-border mb-4">
                      <p className="text-sm font-semibold text-muted-foreground mb-2">Origin Anecdote</p>
                      <p className="text-sm text-muted-foreground italic leading-relaxed">
                        "{walkthrough.originAnecdote}"
                      </p>
                    </div>
                  )}
                </div>
                <InitiativeWalkthrough steps={walkthrough.steps} initiativeName="Harper Guild" />
                {cueCard && (
                  <div className="max-w-md">
                    <p className="text-sm font-semibold text-muted-foreground mb-3">Your Harper Guild Cue Card</p>
                    <InitiativeCueCard card={cueCard} />
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Bottom compact cue card -- always visible except on walkthrough tab */}
          {cueCard && activeTab !== 'walkthrough' && (
            <div className="mt-12 max-w-md mx-auto">
              <InitiativeCueCard card={cueCard} compact />
            </div>
          )}

        </div>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
