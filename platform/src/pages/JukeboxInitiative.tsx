/**
 * JukeboxInitiative -- Wave 18 mini-app / BP073 W9 (real-data wired)
 *
 * Origin: $47 for 18 million streams. The creator economy does not need new
 * promises. It needs a different structure.
 *
 * Features added in Wave 18:
 *   - Stream Tracker tab: simulated stream counts, royalty dashboard, C20 math
 *   - Discover tab: community surfaces new artists, earns Marks for discovery
 *     with explicit "NOT equity in the artist" disclaimer (securities-clean)
 *   - Artist IP-Ledger entries (content.created on track upload)
 *   - InitiativeWalkthrough + InitiativeCueCard onboarding hook
 *
 * Securities-clean: Marks = participation. Not equity. Not a financial claim
 * on any artist or their royalties.
 *
 * Supabase: jukebox_artist_profiles, jukebox_tracks
 * Migration: 20260603120002_bp073_w9_jukebox_tables.sql
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Music, ShieldCheck, Zap, Users, PlayCircle, Coins, ArrowRight, Star,
  TrendingUp, AlertCircle, BookOpen, Link2, BarChart2, Radio,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { InitiativeWalkthrough } from '@/components/initiatives/InitiativeWalkthrough';
import { InitiativeCueCard } from '@/components/initiatives/InitiativeCueCard';
import { getWalkthrough, getCueCard } from '@/data/initiativeWalkthroughs';
import { addToIPLedger } from '@/lib/nervous-system/ipLedger';
import '@/styles/landing.css';
import { usePageSEO } from "@/hooks/usePageSEO";

// ─── Types ──────────────────────────────────────────────────────────────────

type JukeboxTab = 'lobbying' | 'artists' | 'creators' | 'tracker' | 'discover' | 'walkthrough';

interface JukeboxArtist {
  id: string;
  name: string;
  track: string;
  totalStreams: number;
  /** Simulated total licensing fees collected ($) */
  totalFeesCollected: number;
  ipLedgerSeq: number | null;
  status: 'active' | 'lobbying' | 'locked';
  genre: string;
}

interface DiscoveryEntry {
  id: string;
  artistName: string;
  track: string;
  discoveredBy: string;
  marksEarned: number;
  streams: number;
  submittedAt: string;
}

// ─── Stub Data ───────────────────────────────────────────────────────────────

const ARTIST_ROSTER: JukeboxArtist[] = [
  {
    id: 'artist-001',
    name: "Bruck'lyn",
    track: 'Moonshot',
    totalStreams: 143_200,
    totalFeesCollected: 2_148,
    ipLedgerSeq: 1002,
    status: 'active',
    genre: 'Hip-Hop / Spoken Word',
  },
  {
    id: 'artist-002',
    name: 'The Porch Sessions',
    track: 'Coffee and Cartoons',
    totalStreams: 28_450,
    totalFeesCollected: 426,
    ipLedgerSeq: 1015,
    status: 'active',
    genre: 'Indie Folk',
  },
  {
    id: 'artist-003',
    name: 'Dolly Parton (Remix)',
    track: '9 to 5',
    totalStreams: 0,
    totalFeesCollected: 0,
    ipLedgerSeq: null,
    status: 'lobbying',
    genre: 'Country / Pop',
  },
  {
    id: 'artist-004',
    name: 'Led Zeppelin',
    track: 'Immigrant Song',
    totalStreams: 0,
    totalFeesCollected: 0,
    ipLedgerSeq: null,
    status: 'lobbying',
    genre: 'Rock',
  },
];

const DISCOVERY_ENTRIES: DiscoveryEntry[] = [
  {
    id: 'disc-001',
    artistName: 'Mara Sol',
    track: 'Underpaid Overture',
    discoveredBy: 'Member #0177',
    marksEarned: 15,
    streams: 4_200,
    submittedAt: '2026-04-12',
  },
  {
    id: 'disc-002',
    artistName: 'Freight Train Blues',
    track: 'The Gig Economy Lament',
    discoveredBy: 'Member #0309',
    marksEarned: 20,
    streams: 9_100,
    submittedAt: '2026-05-01',
  },
  {
    id: 'disc-003',
    artistName: 'Renia Vasko',
    track: 'Cooperative',
    discoveredBy: 'Member #0022',
    marksEarned: 35,
    streams: 18_600,
    submittedAt: '2026-05-19',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Cost+20% royalty math: artist keeps 83.3% of every transaction */
function artistPayout(totalFees: number): number {
  return Math.round(totalFees * 0.833 * 100) / 100;
}

function platformCut(totalFees: number): number {
  return Math.round(totalFees * 0.167 * 100) / 100;
}

/** For contrast: what Spotify would pay at $0.0000026 per stream */
function streamingPayout(streams: number): number {
  return Math.round(streams * 0.0000026 * 100) / 100;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function JukeboxInitiative() {
  usePageSEO({
    title: "Jukebox | Liana Banyan",
    description: "A community music platform where artists keep 83.3%. Discover, share, and support local musicians cooperatively.",
    canonical: "https://lianabanyan.com/initiatives/jukebox",
  });
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<JukeboxTab>('lobbying');
  const [loggedEntries, setLoggedEntries] = useState<string[]>([]);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const walkthrough = getWalkthrough('jukebox');
  const cueCard = getCueCard('jukebox');

  const { data: liveArtists = [] } = useQuery({
    queryKey: ["jukebox_artist_profiles"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("jukebox_artist_profiles")
        .select("*")
        .order("stream_count", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const artistRoster: JukeboxArtist[] = liveArtists.length > 0
    ? liveArtists.map((a: any) => ({
        id: a.id,
        name: a.display_name,
        track: a.featured_track ?? "Untitled",
        totalStreams: a.stream_count ?? 0,
        totalFeesCollected: a.earnings_total ?? 0,
        ipLedgerSeq: null,
        status: "active" as const,
        genre: a.genre ?? "Various",
      }))
    : ARTIST_ROSTER;

  async function handleLogArtistUpload(artist: JukeboxArtist) {
    if (artist.ipLedgerSeq !== null || loggingId === artist.id) return;
    setLoggingId(artist.id);
    const entry = await addToIPLedger('content.created', {
      artist_id: artist.id,
      artist_name: artist.name,
      track: artist.track,
      genre: artist.genre,
      jukebox: true,
      royalty_rate: 0.833,
      note: 'JukeBox track upload -- artist IP-Ledger entry. Provenance record.',
    });
    setLoggingId(null);
    if (entry) {
      setLoggedEntries(prev => [...prev, `#${entry.sequence_number} content.created -- "${artist.track}" by ${artist.name}`]);
    }
  }

  return (
    <LaunchConditionOverlay initiativeSlug="jukebox" initiativeName="JukeBox">
      <PortalPageLayout variant="immersive" className="landing-page" xrayId="jukebox-initiative">
        <div className="landing-title">
          <span className="liana">Liana</span>
          <span className="banyan">Banyan</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

          {/* Header */}
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 text-pink-600 border-pink-600">Initiative #15</Badge>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl flex items-center justify-center gap-3">
              <Music className="h-10 w-10 text-pink-600" />
              JukeBox
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              Fair music licensing where artists keep 83.3%. One contract for all. The end of impossible individual negotiations.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded border">
                Origin: $47 for 18 million streams.
              </span>
            </div>
          </div>

          {/* Core Philosophy (always visible summary) */}
          <Card className="mb-8 border-l-4 border-l-pink-500 shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Zap className="h-5 w-5 text-pink-500" />
                The "Moonshot Contract" Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3">
              <p>
                Instead of an artist negotiating 1,000 individual contracts with 1,000 different creators, the artist signs <em>one</em> Moonshot Contract tailored exactly to their wishes. Creators instantly license based on those terms, and the artist gets paid immediately. The platform takes Cost+20%. The artist keeps 83.3%.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-pink-600">
                <TrendingUp className="h-4 w-4" />
                <span>83.3% to artists -- constitutionally locked in the cooperative DNA.</span>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {([
              { key: 'lobbying',   label: 'Active Lobbying',  icon: Users       },
              { key: 'artists',    label: 'For Artists',      icon: Music       },
              { key: 'creators',   label: 'For Creators',     icon: PlayCircle  },
              { key: 'tracker',    label: 'Stream Tracker',   icon: BarChart2   },
              { key: 'discover',   label: 'Discover',         icon: Radio       },
              { key: 'walkthrough',label: 'How it Works',     icon: BookOpen    },
            ] as const).map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeTab === key ? 'default' : 'outline'}
                onClick={() => setActiveTab(key)}
                className={activeTab === key ? 'bg-pink-600 hover:bg-pink-700' : ''}
              >
                <Icon className="mr-2 h-4 w-4" /> {label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-8 mb-16 min-h-[500px]">

            {/* LOBBYING */}
            {activeTab === 'lobbying' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-pink-100 rounded-lg">
                    <Users className="h-8 w-8 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">One Take Wonders and Active Lobbying</h2>
                    <p className="text-muted-foreground/70">How the community pools money to get artists on the platform.</p>
                  </div>
                </div>

                <div className="bg-muted p-6 rounded-lg border border-border mb-8">
                  <h3 className="font-bold text-foreground mb-2">The Process</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>The Founder (or a Creator) records a "One Take Wonder" video on YouTube using a song they want to license.</li>
                    <li>The community votes on the video by pooling Marks/Money into a Lobbying Bounty.</li>
                    <li>Once the bounty is large enough, we approach the Artist with the pooled money plus The Bruck'lyn Package.</li>
                    <li>If the Artist signs the "One Contract," they get the money, and the song is unlocked in the JukeBox for all creators to use.</li>
                  </ol>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-4">Curated Playlists (Active Lobbying)</h3>
                <p className="text-muted-foreground mb-6">
                  Anyone can add their Spotify, YouTube, or Apple Music playlists to their portfolio. We are actively lobbying these artists to join the JukeBox using the Moonshot Contract. Here is the Founder's initial curated seed list:
                </p>

                <div className="bg-card rounded-lg p-4 mb-6 flex items-center justify-between border">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-2">
                      <PlayCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-foreground font-bold">The Official Liana Banyan Playlist</h4>
                      <p className="text-muted-foreground/70 text-sm">Listen on Spotify</p>
                    </div>
                  </div>
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => window.open('https://open.spotify.com/playlist/0yyJMjb6QZTcPbkE1eJDNv?si=c68cdffb7deb4684', '_blank')}
                  >
                    Open Playlist
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">"9 to 5" (Remix)</CardTitle>
                      <CardDescription>Dolly Parton and Pitbull</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-muted-foreground/70">Lobbying Pool</span>
                        <span className="font-bold text-pink-600">$4,250</span>
                      </div>
                      <Progress value={42} className="h-2 mb-4" />
                      <Button variant="outline" className="w-full">Add to Pool</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">"Immigrant Song"</CardTitle>
                      <CardDescription>Led Zeppelin</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-muted-foreground/70">Lobbying Pool</span>
                        <span className="font-bold text-pink-600">$8,100</span>
                      </div>
                      <Progress value={81} className="h-2 mb-4" />
                      <Button variant="outline" className="w-full">Add to Pool</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ARTISTS */}
            {activeTab === 'artists' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <Music className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">For Artists</h2>
                    <p className="text-muted-foreground/70">Your music. Your terms. Your 83.3%.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader>
                      <ShieldCheck className="h-8 w-8 text-emerald-500 mb-2" />
                      <CardTitle>Total Control</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      You set the price for a 30-second clip, a full song, a podcast intro, or a commercial ad. You decide what is allowed, including specific conditions (e.g., "only for startups" or "non-profits only").
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Coins className="h-8 w-8 text-emerald-500 mb-2" />
                      <CardTitle>Keep 83.3%</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      No label skimming. No mystery administrative fees. The platform takes Cost+20%. You keep the rest, paid instantly. Constitutionally locked -- no board vote can change it.
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Zap className="h-8 w-8 text-emerald-500 mb-2" />
                      <CardTitle>Sign Once</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Stop negotiating individual licenses. Sign the master usage contract, and let thousands of creators license your work automatically.
                    </CardContent>
                  </Card>
                </div>

                {/* Crown Section */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 relative overflow-hidden border border-pink-100">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Star className="h-48 w-48" />
                  </div>
                  <div className="relative z-10">
                    <Badge className="bg-pink-500 text-white mb-4">The Crown: Maestro Mentor</Badge>
                    <h2 className="text-2xl font-bold mb-3">Why We Wrote to Taylor Swift</h2>
                    <p className="text-muted-foreground mb-4 max-w-2xl">
                      She spent a decade proving that artists can own their art and still succeed -- if they have enough leverage. But leverage comes from being Taylor Swift. Most musicians will never have it.
                    </p>
                    <p className="text-pink-600 font-medium italic mb-4">
                      "I deserve to own what I make." -- Taylor Swift
                    </p>
                    <p className="text-muted-foreground max-w-2xl">
                      Now the infrastructure exists so everyone can. JukeBox gives that leverage to everyone. We asked her to be the Maestro Mentor -- not to run it day-to-day, but to set the standards that protect artists, because she knows every loophole.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CREATORS */}
            {activeTab === 'creators' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <PlayCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">For Creators</h2>
                    <p className="text-muted-foreground/70">Legal, affordable music for your projects.</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="bg-muted p-4 rounded-lg border border-border flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-foreground">"Moonshot" by Bruck'lyn</h4>
                      <p className="text-sm text-muted-foreground/70">Full Song License (Startup Tier)</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg">$15.00</span>
                      <Button className="bg-pink-600 hover:bg-pink-700">License Now</Button>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg border border-border flex items-center justify-between opacity-50">
                    <div>
                      <h4 className="font-bold text-foreground">"9 to 5"</h4>
                      <p className="text-sm text-muted-foreground/70">Dolly Parton and Pitbull -- Lobbying in progress</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" disabled>Locked -- Add to Lobbying Pool</Button>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg border border-border flex items-center justify-between opacity-50">
                    <div>
                      <h4 className="font-bold text-foreground">"Immigrant Song"</h4>
                      <p className="text-sm text-muted-foreground/70">Led Zeppelin -- Lobbying in progress ($8,100 pooled)</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" disabled>Locked -- Add to Lobbying Pool</Button>
                    </div>
                  </div>
                </div>

                {/* C20 Explanation */}
                <div className="bg-card rounded-2xl p-6 text-center border">
                  <Badge className="bg-emerald-500 text-white mb-3">Just Like The Founder</Badge>
                  <h3 className="text-xl font-bold mb-3">Platform Headquarters Costs and C20</h3>
                  <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                    Liana Banyan takes Cost+20% (C20). "Cost" is the actual overhead -- the Founder's garage, electric, internet, Supabase storage/usage fees, and subscriptions. Total transparency. The same model businesses use for themselves when determining their own C20.
                  </p>
                </div>
              </div>
            )}

            {/* STREAM TRACKER */}
            {activeTab === 'tracker' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <BarChart2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Stream Tracker and Royalty Dashboard</h2>
                    <p className="text-muted-foreground/70">Real-time per-artist royalty tracking. No black box. No quarterly mystery statements.</p>
                  </div>
                </div>

                {/* $47 Context Banner */}
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-rose-800 mb-1">Why This Dashboard Exists</p>
                  <p className="text-sm text-rose-700">
                    A musician with 18 million streams received a quarterly payout of $47. That is $0.0000026 per stream. JukeBox was built on that number. The comparison column below shows exactly what that same stream count would have paid out on a traditional platform.
                  </p>
                </div>

                {/* IP-Ledger Activity Feed */}
                {loggedEntries.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-green-800 mb-2">IP-Ledger Entries Written This Session:</p>
                    <ul className="space-y-1">
                      {loggedEntries.map((e, i) => (
                        <li key={i} className="text-xs text-green-700 font-mono">{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Artist Rows */}
                <div className="space-y-4">
                  {artistRoster.map(artist => {
                    const payout = artistPayout(artist.totalFeesCollected);
                    const cut = platformCut(artist.totalFeesCollected);
                    const legacyPayout = streamingPayout(artist.totalStreams);
                    const isLogging = loggingId === artist.id;

                    return (
                      <Card key={artist.id} data-xray-id={`jukebox-artist-${artist.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-lg">{artist.name}</CardTitle>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    artist.status === 'active'   ? 'border-green-500 text-green-700' :
                                    artist.status === 'lobbying' ? 'border-amber-500 text-amber-700' :
                                                                    'border-red-400 text-red-600'
                                  }`}
                                >
                                  {artist.status}
                                </Badge>
                                {artist.ipLedgerSeq !== null && (
                                  <Badge className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                                    Ledger #{artist.ipLedgerSeq}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                "{artist.track}" &bull; {artist.genre}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLogArtistUpload(artist)}
                              disabled={artist.ipLedgerSeq !== null || isLogging || artist.status !== 'active'}
                            >
                              <Link2 className="mr-1 h-3 w-3" />
                              {artist.ipLedgerSeq !== null ? 'Logged' : isLogging ? 'Logging...' : 'Log Upload'}
                            </Button>
                          </div>
                        </CardHeader>
                        {artist.status === 'active' && (
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                              <div className="bg-muted p-3 rounded-lg">
                                <p className="text-xl font-bold text-foreground">{formatNumber(artist.totalStreams)}</p>
                                <p className="text-xs text-muted-foreground">Total Streams</p>
                              </div>
                              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <p className="text-xl font-bold text-emerald-700">${payout.toLocaleString()}</p>
                                <p className="text-xs text-emerald-600">Artist Payout (83.3%)</p>
                              </div>
                              <div className="bg-muted p-3 rounded-lg">
                                <p className="text-xl font-bold text-muted-foreground">${cut.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Platform Cut (C20)</p>
                              </div>
                              <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                                <p className="text-xl font-bold text-rose-600">${legacyPayout.toFixed(2)}</p>
                                <p className="text-xs text-rose-500">Legacy Streaming Equiv.</p>
                              </div>
                            </div>
                            {artist.totalStreams > 0 && (
                              <div className="mt-3 text-xs text-muted-foreground text-center">
                                JukeBox: <strong className="text-emerald-600">${payout.toLocaleString()}</strong> vs. legacy streaming: <strong className="text-rose-500">${legacyPayout.toFixed(2)}</strong> for the same {formatNumber(artist.totalStreams)} streams.
                              </div>
                            )}
                          </CardContent>
                        )}
                        {artist.status === 'lobbying' && (
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground italic">
                              Lobbying in progress. Once this artist signs the Moonshot Contract, their stream and royalty data will appear here.
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>

                {/* C20 Formula */}
                <div className="mt-6 bg-muted rounded-xl p-4 text-sm">
                  <p className="font-semibold text-foreground mb-1">C20 Royalty Formula</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    Artist payout = transaction_fee x 0.833 &nbsp;|&nbsp; Platform cut = transaction_fee x 0.167 (Cost+20%)
                  </p>
                </div>
              </div>
            )}

            {/* DISCOVER */}
            {activeTab === 'discover' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-violet-100 rounded-lg">
                    <Radio className="h-8 w-8 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Discover</h2>
                    <p className="text-muted-foreground/70">Surface new artists. Earn Marks. Get their music into the JukeBox.</p>
                  </div>
                </div>

                {/* Securities-clean disclaimer -- prominent */}
                <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-300 rounded-xl p-5 mb-6">
                  <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-900 mb-1">Marks Are Not Equity in the Artist</p>
                    <p className="text-sm text-amber-800">
                      Marks earned for discovering and surfacing artists are cooperative participation credits. They are <strong>not equity in the artist</strong>, not a financial interest in their music, not a claim on their royalties, and not an investment of any kind. Marks represent your standing in the Liana Banyan cooperative. They cannot be exchanged for cash and do not entitle you to any share of an artist's earnings.
                    </p>
                    <p className="text-xs text-amber-600 mt-2 italic">
                      See platform canon for full Marks disclosure. Securities-clean by design.
                    </p>
                  </div>
                </div>

                {/* How Discover Works */}
                <div className="bg-muted p-5 rounded-lg border mb-6">
                  <h3 className="font-semibold text-foreground mb-3">How Discover Works</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>You find an artist you believe deserves to be in the JukeBox.</li>
                    <li>You submit their name, track, and a brief note on why they fit the cooperative's values.</li>
                    <li>The community reviews the submission. If the artist is lobbied and signs, you earn Marks proportional to how early you surfaced them.</li>
                    <li>Marks are participation credits only. They reflect your contribution to the community catalog, nothing more.</li>
                  </ol>
                </div>

                {/* Discovery Leaderboard (stub) */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">Recent Discoveries</h3>
                  <div className="space-y-3">
                    {DISCOVERY_ENTRIES.map(entry => (
                      <Card key={entry.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                              <p className="font-semibold text-foreground">{entry.artistName}</p>
                              <p className="text-sm text-muted-foreground">"{entry.track}"</p>
                              <p className="text-xs text-muted-foreground/70 mt-0.5">
                                Surfaced by {entry.discoveredBy} on {entry.submittedAt}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-right">
                              <div>
                                <p className="text-sm font-bold text-violet-600">{entry.marksEarned} Marks</p>
                                <p className="text-xs text-muted-foreground">participation</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-foreground">{formatNumber(entry.streams)}</p>
                                <p className="text-xs text-muted-foreground">streams on JukeBox</p>
                              </div>
                              <Badge variant="outline" className="border-violet-400 text-violet-700 text-xs">Lobbying</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-violet-600 hover:bg-violet-700">
                  <ArrowRight className="mr-2 h-4 w-4" /> Submit an Artist for Discovery
                </Button>

                <p className="text-xs text-center text-muted-foreground/60 mt-3 italic">
                  By submitting an artist, you acknowledge that any Marks earned are cooperative participation credits, not equity in the artist or their work.
                </p>
              </div>
            )}

            {/* WALKTHROUGH */}
            {activeTab === 'walkthrough' && walkthrough && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">How JukeBox Works</h2>
                  <p className="text-muted-foreground mt-1 mb-4">Step-by-step artist and creator onboarding.</p>
                  {walkthrough.originAnecdote && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 mb-6">
                      <p className="text-sm font-semibold text-rose-800 mb-2">Origin Anecdote</p>
                      <p className="text-sm text-rose-700 italic leading-relaxed">
                        "{walkthrough.originAnecdote}"
                      </p>
                    </div>
                  )}
                </div>
                <InitiativeWalkthrough steps={walkthrough.steps} initiativeName="JukeBox" />
                {cueCard && (
                  <div className="max-w-md mt-8">
                    <p className="text-sm font-semibold text-muted-foreground mb-3">Your JukeBox Cue Card</p>
                    <InitiativeCueCard card={cueCard} />
                  </div>
                )}
              </div>
            )}

          </div>

          {/* The Precedent Section */}
          <div className="bg-muted rounded-2xl p-8 mb-16 border border-border">
            <Badge className="bg-muted text-foreground mb-4">The Precedent</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">The Bruck'lyn "Moonshot" Contract</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-3xl">
              Bruck'lyn was the first artist to say yes. In June 2025, he allowed the Founder to use his entire song "Moonshot" free of charge. This established the exact compensation package used to lobby artists:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Cash',      color: 'text-emerald-600', note: 'Immediate licensing fee (83.3% to artist)' },
                { label: 'Credits',   color: 'text-blue-600',    note: 'Full platform value and utility'           },
                { label: 'Marks',     color: 'text-amber-500',   note: 'Backed by $525K IP valuation (participation only -- not equity)' },
                { label: 'Medallion', color: 'text-purple-600',  note: "Founder's Circle membership participation" },
              ].map(item => (
                <div key={item.label} className="bg-card p-4 rounded-lg border border-border shadow-sm">
                  <div className={`text-2xl font-bold ${item.color} mb-1`}>{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.note}</div>
                </div>
              ))}
            </div>
            <div className="bg-card p-6 rounded-lg flex items-center justify-between border">
              <div>
                <h3 className="font-bold text-xl mb-1">Listen to "Moonshot" by Bruck'lyn</h3>
                <p className="text-muted-foreground/70 text-sm">The song that started it all.</p>
              </div>
              <Button
                className="bg-pink-600 hover:bg-pink-700 text-white"
                onClick={() => window.open('https://www.youtube.com/results?search_query=Brucklyn+Moonshot', '_blank')}
              >
                <PlayCircle className="mr-2 h-5 w-5" /> Play on YouTube
              </Button>
            </div>
          </div>

          {/* Bottom compact cue card */}
          {cueCard && activeTab !== 'walkthrough' && (
            <div className="max-w-md mx-auto">
              <InitiativeCueCard card={cueCard} compact />
            </div>
          )}

        </div>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
