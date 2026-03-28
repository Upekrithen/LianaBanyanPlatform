import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Gavel, Play, Pause, Trophy, Clock, ChevronLeft, ChevronRight, Search as SearchIcon } from 'lucide-react';
import { useDesignAuction, type AuctionEntry } from '@/hooks/useXRayBountyArena';

/* ──────────────────────────────────────────────
 * SLIDESHOW VIEWER
 * ────────────────────────────────────────────── */

const AuctionSlideshow: React.FC<{ entries: AuctionEntry[] }> = ({ entries }) => {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const current = entries[idx];
  const displaySec = current?.display_duration_seconds ?? 10;

  const advance = useCallback(() => {
    setIdx((prev) => (prev + 1) % entries.length);
    setCountdown(entries[(idx + 1) % entries.length]?.display_duration_seconds ?? 10);
  }, [entries, idx]);

  useEffect(() => {
    if (!playing || entries.length === 0) return;
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          advance();
          return entries[(idx + 1) % entries.length]?.display_duration_seconds ?? 10;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [playing, entries, advance, idx]);

  useEffect(() => {
    setCountdown(displaySec);
  }, [idx, displaySec]);

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          No entries in today's cycle. Submit a design to compete!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main display card */}
      <Card className="border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {idx + 1} / {entries.length}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {countdown}s
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => { setIdx(Math.max(0, idx - 1)); setCountdown(displaySec); }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPlaying(!playing)}
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => { advance(); }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-1">{current.title}</h2>
            {current.nickname && (
              <p className="text-muted-foreground text-sm">"{current.nickname}"</p>
            )}
            <div className="mt-6 flex items-center justify-center gap-4">
              <div>
                <div className="text-3xl font-black text-amber-400">{current.bid_total}M</div>
                <div className="text-xs text-muted-foreground">total bids</div>
              </div>
              <Button className="gap-1">
                <Gavel className="w-4 h-4" /> Place Bid
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-linear"
              style={{ width: `${((displaySec - countdown) / displaySec) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ──────────────────────────────────────────────
 * MAIN PAGE
 * ────────────────────────────────────────────── */

const DesignAuctionPage: React.FC = () => {
  const { todayAuction, winners } = useDesignAuction();
  const entries = todayAuction.data ?? [];
  const pastWinners = winners.data ?? [];
  const [pref, setPref] = useState<'classic' | 'winner' | 'number' | 'nickname'>('winner');
  const [searchTerm, setSearchTerm] = useState('');

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  const msRemaining = Math.max(0, endOfDay.getTime() - Date.now());
  const hoursLeft = Math.floor(msRemaining / 3_600_000);
  const minsLeft = Math.floor((msRemaining % 3_600_000) / 60_000);

  return (
    <PortalPageLayout
      title="Design Auction"
      subtitle="Vote with your Marks on the best design proposals."
      data-xray-id="design-auction"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main viewer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Cycle ends in <strong className="text-foreground">{hoursLeft}h {minsLeft}m</strong>
          </div>

          <AuctionSlideshow entries={entries} />

          {/* Current Winner */}
          {pastWinners[0] && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" /> Current Displayed Winner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">{pastWinners[0].title}</span>
                    {pastWinners[0].nickname && (
                      <span className="text-muted-foreground text-xs ml-2">"{pastWinners[0].nickname}"</span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                    Displayed until replaced
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — preferences + history */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">My Display Preference</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={pref}
                onValueChange={(v) => setPref(v as typeof pref)}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="classic" id="pref-classic" />
                  <Label htmlFor="pref-classic" className="text-sm">Classic</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="winner" id="pref-winner" />
                  <Label htmlFor="pref-winner" className="text-sm">Current Winner</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="number" id="pref-number" />
                  <Label htmlFor="pref-number" className="text-sm">By Submission #</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="nickname" id="pref-nickname" />
                  <Label htmlFor="pref-nickname" className="text-sm">By Nickname</Label>
                </div>
              </RadioGroup>

              {(pref === 'number' || pref === 'nickname') && (
                <div className="mt-3 relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8 text-sm"
                    placeholder={pref === 'number' ? 'Enter submission #' : 'Search by nickname'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Winner History</CardTitle>
            </CardHeader>
            <CardContent>
              {pastWinners.length === 0 ? (
                <p className="text-xs text-muted-foreground">No history yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pastWinners.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between py-1.5 border-b last:border-0 text-xs"
                    >
                      <span className="font-medium truncate flex-1">{w.title}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-muted-foreground">{w.auction_cycle}</span>
                        <span className="font-bold text-amber-400">{w.bid_total}M</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default DesignAuctionPage;
