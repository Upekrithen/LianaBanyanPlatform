import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, ExternalLink, Plug, Play, Pause, SkipForward, SkipBack, CheckCircle2, Sparkles, Users, Map, Beaker, ChevronLeft, ChevronRight } from "lucide-react";
import {
  type MakerSpotlight as MakerSpotlightType,
  TIER_LABELS,
  TIER_COLORS,
  CATEGORY_COLORS,
  SLIDESHOW_INTERVAL_MS,
  SLIDE_DURATION_MS,
  SLIDES_PER_SESSION,
  fetchSpotlights,
  getRotatedSpotlights,
} from "@/lib/makerSpotlightService";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// Slideshow states
type ViewMode = "directory" | "slideshow";

export default function MakerSpotlightPage() {
  const { user } = useAuth();
  const [spotlights, setSpotlights] = useState<MakerSpotlightType[]>([]);
  const [rotated, setRotated] = useState<MakerSpotlightType[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("directory");
  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [filterHexisle, setFilterHexisle] = useState(false);
  const [filterSlipCast, setFilterSlipCast] = useState(false);

  // Slideshow state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [isInSession, setIsInSession] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchSpotlights().then(data => {
      setSpotlights(data);
      setRotated(getRotatedSpotlights(data));
    });
  }, []);

  // Slideshow engine
  const startSlideshow = useCallback(() => {
    if (rotated.length === 0) return;
    setViewMode("slideshow");
    setIsPlaying(true);
    setIsInSession(false);
    setSessionIndex(0);
    setCurrentSlide(0);
    setCountdown(Math.floor(SLIDESHOW_INTERVAL_MS / 1000));
  }, [rotated]);

  // Idle countdown (between sessions)
  useEffect(() => {
    if (!isPlaying || isInSession) {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
      return;
    }

    idleTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Start session
          setIsInSession(true);
          setCurrentSlide(sessionIndex * SLIDES_PER_SESSION);
          return Math.floor(SLIDE_DURATION_MS / 1000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (idleTimerRef.current) clearInterval(idleTimerRef.current); };
  }, [isPlaying, isInSession, sessionIndex]);

  // Slide timer (during session)
  useEffect(() => {
    if (!isPlaying || !isInSession) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Next slide or end session
          setCurrentSlide(curr => {
            const sessionStart = sessionIndex * SLIDES_PER_SESSION;
            const sessionEnd = sessionStart + SLIDES_PER_SESSION - 1;
            if (curr >= sessionEnd || curr >= rotated.length - 1) {
              // End session, go to idle
              setIsInSession(false);
              setSessionIndex(s => s + 1);
              setCountdown(Math.floor(SLIDESHOW_INTERVAL_MS / 1000));
              return curr;
            }
            return curr + 1;
          });
          return Math.floor(SLIDE_DURATION_MS / 1000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, isInSession, sessionIndex, rotated.length]);

  const stopSlideshow = () => {
    setIsPlaying(false);
    setIsInSession(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, rotated.length - 1));
    setCountdown(Math.floor(SLIDE_DURATION_MS / 1000));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
    setCountdown(Math.floor(SLIDE_DURATION_MS / 1000));
  };

  // Filter logic
  const filtered = rotated.filter(s => {
    if (filterTier !== null && s.tier !== filterTier) return false;
    if (filterHexisle && !s.hexisleRelevant) return false;
    if (filterSlipCast && !s.slipCastingPioneer) return false;
    return true;
  });

  const currentMaker = rotated[currentSlide] || null;

  return (
    <PortalPageLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-400" />
            I'll Make You Famous!
          </h1>
          <p className="text-slate-400">
            47 makers from our Instagram Factor-y collection. Get Famous. Make Money. Do Good.
          </p>
        </header>

        {/* Cue Card Banner */}
        <Card className="bg-gradient-to-r from-amber-900/40 via-orange-900/30 to-amber-900/40 border-amber-700/50">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-3">
                <h2 className="text-2xl font-bold text-amber-300">Know a Maker? Invite Them.</h2>
                <p className="text-slate-300">
                  Every maker gets a Deck Card — a screenshot of their store or product as the front image,
                  their business info and description, and on the back: a link to their external site
                  (via Slingshot plug) plus their LB project page.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-green-500/20 text-green-400 border-0">83.3% to Creator</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 border-0">Cost+20% Pricing</Badge>
                  <Badge className="bg-amber-500/20 text-amber-400 border-0">$5 Membership</Badge>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-5xl font-black text-amber-400">47</div>
                <p className="text-sm text-amber-300/80">Makers Identified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slideshow Controls */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Maker Slideshow
              </span>
              <div className="flex items-center gap-2">
                {isPlaying && (
                  <Badge className={isInSession ? "bg-green-500/20 text-green-400 border-0" : "bg-slate-500/20 text-slate-400 border-0"}>
                    {isInSession ? `Slide ${currentSlide + 1}` : "Next session in"} — {countdown}s
                  </Badge>
                )}
                {!isPlaying ? (
                  <Button size="sm" onClick={startSlideshow} className="gap-1">
                    <Play className="w-4 h-4" /> Start Slideshow
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={prevSlide}><SkipBack className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => { setIsPlaying(!isPlaying); }}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={nextSlide}><SkipForward className="w-4 h-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => { stopSlideshow(); setViewMode("directory"); }}>Exit</Button>
                  </div>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              Rotates every 3 minutes — 6 slides per session at 30 seconds each. Take manual control anytime.
              Order shifts by 1 at midnight.
            </CardDescription>
          </CardHeader>

          {/* Active Slideshow Display */}
          {viewMode === "slideshow" && currentMaker && (
            <CardContent>
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                {/* Slide Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700">
                  <div
                    className="h-full bg-amber-400 transition-all duration-1000"
                    style={{ width: `${((SLIDE_DURATION_MS / 1000 - countdown) / (SLIDE_DURATION_MS / 1000)) * 100}%` }}
                  />
                </div>

                <div className="p-8 flex flex-col md:flex-row gap-8">
                  {/* Card Front — Maker Image / Placeholder */}
                  <div className="w-full md:w-80 h-64 rounded-lg bg-gradient-to-br from-amber-900/30 to-slate-800 border border-amber-700/30 flex flex-col items-center justify-center">
                    {currentMaker.imageUrl ? (
                      <img src={currentMaker.imageUrl} alt={currentMaker.displayName} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <Star className="w-16 h-16 text-amber-400/40 mb-3" />
                        <p className="text-sm text-amber-400/60">Deck Card Image</p>
                        <p className="text-xs text-slate-500">@{currentMaker.handle}</p>
                      </>
                    )}
                  </div>

                  {/* Card Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-2xl font-bold">{currentMaker.displayName}</h3>
                        {currentMaker.verified && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                      </div>
                      <p className="text-slate-400">@{currentMaker.handle}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${TIER_COLORS[currentMaker.tier]} border text-xs`}>
                        Tier {currentMaker.tier}: {TIER_LABELS[currentMaker.tier]}
                      </Badge>
                      <Badge className={`${CATEGORY_COLORS[currentMaker.category] || "bg-slate-500/20 text-slate-400"} border-0 text-xs`}>
                        {currentMaker.category}
                      </Badge>
                      {currentMaker.hexisleRelevant && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">HexIsle Relevant</Badge>
                      )}
                      {currentMaker.slipCastingPioneer && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-0 text-xs">Slip Casting Pioneer</Badge>
                      )}
                    </div>

                    <p className="text-slate-300">{currentMaker.specialty}</p>
                    <p className="text-sm text-slate-400">{currentMaker.description}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">Best post: <strong className="text-white">{currentMaker.bestPostLikes} likes</strong></span>
                      {currentMaker.sellsOn && (
                        <span className="text-slate-400">Sells on: <strong className="text-green-400">{currentMaker.sellsOn}</strong></span>
                      )}
                    </div>

                    {/* Card Back — Links */}
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" size="sm" className="gap-1" disabled={!currentMaker.externalUrl}>
                        <Plug className="w-4 h-4" /> External Site (via Slingshot)
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1" disabled={!currentMaker.lbProjectUrl}>
                        <ExternalLink className="w-4 h-4" /> LB Project Page
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Slide Navigation */}
                <div className="flex items-center justify-between px-4 pb-4">
                  <Button variant="ghost" size="sm" onClick={prevSlide} disabled={currentSlide === 0}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <span className="text-xs text-slate-500">
                    {currentSlide + 1} of {rotated.length}
                  </span>
                  <Button variant="ghost" size="sm" onClick={nextSlide} disabled={currentSlide >= rotated.length - 1}>
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <Separator className="border-slate-800" />

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filterTier === null ? "default" : "outline"}
            onClick={() => setFilterTier(null)}
          >
            All ({rotated.length})
          </Button>
          {[1, 2, 3].map(t => (
            <Button
              key={t}
              size="sm"
              variant={filterTier === t ? "default" : "outline"}
              onClick={() => setFilterTier(filterTier === t ? null : t)}
            >
              Tier {t}: {TIER_LABELS[t]} ({rotated.filter(s => s.tier === t).length})
            </Button>
          ))}
          <Button
            size="sm"
            variant={filterHexisle ? "default" : "outline"}
            onClick={() => setFilterHexisle(!filterHexisle)}
            className="gap-1"
          >
            <Map className="w-3 h-3" /> HexIsle ({rotated.filter(s => s.hexisleRelevant).length})
          </Button>
          <Button
            size="sm"
            variant={filterSlipCast ? "default" : "outline"}
            onClick={() => setFilterSlipCast(!filterSlipCast)}
            className="gap-1"
          >
            <Beaker className="w-3 h-3" /> Slip Casting ({rotated.filter(s => s.slipCastingPioneer).length})
          </Button>
        </div>

        {/* Directory Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((maker, idx) => (
            <Card
              key={maker.id}
              className="bg-slate-900/60 border-slate-800 hover:border-amber-700/40 transition-colors cursor-pointer"
              onClick={() => {
                setCurrentSlide(rotated.indexOf(maker));
                setViewMode("slideshow");
                setIsPlaying(false);
                setIsInSession(true);
                setCountdown(Math.floor(SLIDE_DURATION_MS / 1000));
              }}
            >
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">#{maker.rotationOrder}</span>
                    <h3 className="font-medium text-sm">{maker.displayName}</h3>
                    {maker.verified && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                  </div>
                  <Badge className={`${TIER_COLORS[maker.tier]} border text-xs`}>
                    T{maker.tier}
                  </Badge>
                </div>

                <p className="text-xs text-slate-400">{maker.specialty}</p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">@{maker.handle}</span>
                  <span className="text-amber-400 font-medium">{maker.bestPostLikes} likes</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge className={`${CATEGORY_COLORS[maker.category] || "bg-slate-500/20 text-slate-400"} border-0 text-xs`}>
                    {maker.category}
                  </Badge>
                  {maker.hexisleRelevant && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">HexIsle</Badge>
                  )}
                  {maker.slipCastingPioneer && (
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-0 text-xs">Slip Cast</Badge>
                  )}
                  {maker.sellsOn && (
                    <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">{maker.sellsOn}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No makers match the current filters.</p>
          </div>
        )}

        <Separator className="border-slate-800" />

        {/* How It Works */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">1</div>
                <h3 className="font-medium">Deck Card Created</h3>
                <p className="text-sm text-slate-400">
                  Screenshot of your store or product becomes your Deck Card front image.
                  Business info and description on the card. External link (via Slingshot plug) and LB project page on the back.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">2</div>
                <h3 className="font-medium">Rotating Slideshow</h3>
                <p className="text-sm text-slate-400">
                  Every 3 minutes, 6 maker slides play at 30 seconds each. Between sessions, LB news fills the space.
                  At midnight, rotation shifts by 1 — everyone gets equal spotlight over time.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">3</div>
                <h3 className="font-medium">Get Famous. Make Money. Do Good.</h3>
                <p className="text-sm text-slate-400">
                  83.3% of every sale goes to you. Cost+20% transparent pricing. $5 membership is all it costs to join.
                  Your products, your prices, your customers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Tiers */}
        <Card className="bg-slate-900/60 border-amber-800/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Six-Tier Referral Rewards
            </CardTitle>
            <CardDescription>
              Invite makers with your Cue Card. Earlier invitations earn higher rewards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { name: "Pioneer", range: "1-100", marks: 10, color: "amber" },
                { name: "Vanguard", range: "101-500", marks: 5, color: "orange" },
                { name: "Pathfinder", range: "501-2K", marks: 3, color: "blue" },
                { name: "Trailblazer", range: "2K-10K", marks: 2, color: "green" },
                { name: "Guide", range: "10K-50K", marks: 1.5, color: "slate" },
                { name: "Ambassador", range: "50K+", marks: 1, color: "slate" },
              ].map(tier => (
                <div key={tier.name} className={`p-3 rounded-lg bg-${tier.color}-900/20 border border-${tier.color}-800/30 text-center`}>
                  <p className="text-xs text-slate-400">{tier.range}</p>
                  <p className="font-bold text-lg">{tier.marks} Marks</p>
                  <p className="text-xs font-medium">{tier.name}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Cue Card must be sent BEFORE maker signs up (timestamp-verified attribution).
              Ambassador tier is the universal floor — everyone gets something, forever.
            </p>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
