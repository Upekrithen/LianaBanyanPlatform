/**
 * THE BATTERY — Coordinated Social Media Barrage System
 * =====================================================
 * Named after an artillery battery: coordinated, precise, devastating.
 * Load it up, set the schedule, nothing fires until Founder says "As You Wish."
 *
 * Features:
 *   - Load posts for multiple platforms
 *   - Preview before scheduling
 *   - Platform-specific formatting (image limits, character limits, hashtags)
 *   - Master ARM toggle (nothing fires until armed)
 *   - Master FIRE button (Founder confirms with "As You Wish")
 *   - Per-post approval status (draft → approved → scheduled → fired)
 *   - Analytics tracking via social_shares table
 *
 * Supports: Twitter/X, LinkedIn, Bluesky, Threads, Facebook, Instagram, Imgur, Discord
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Calendar, Clock, Image, Send, Eye, Shield, ShieldAlert, Zap, Target, AlertTriangle } from 'lucide-react';
import { AsYouWishConfirm, useConfirmationPhrase } from '@/components/AsYouWishConfirm';
import {
  scheduleLittleRedHenPosts,
  previewPosts,
  PLATFORM_IMAGE_LIMITS,
  type ScheduleOptions
} from '@/scripts/scheduleLittleRedHenPosts';
import {
  previewGambitPosts,
  getGambitDays,
  getGambitPlatforms,
  scheduleOpeningGambitPosts,
  type GambitPost
} from '@/scripts/scheduleOpeningGambitPosts';
import {
  previewGrassrootsPosts,
  getGrassrootsDays,
  getGrassrootsPlatforms,
  scheduleGrassrootsIntelligencePosts,
  type GrassrootsPost
} from '@/scripts/scheduleGrassrootsIntelligencePosts';
import { SchedulingEntryBox } from '@/components/scheduling/SchedulingEntryBox';
import { toLocalDateTimeInput, tomorrowAtNineLocal } from '@/components/scheduling/dateUtils';

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter/X', icon: '𝕏', maxChars: 280 },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', maxChars: 3000 },
  { id: 'bluesky', name: 'Bluesky', icon: '🦋', maxChars: 300 },
  { id: 'threads', name: 'Threads', icon: '🧵', maxChars: 500 },
  { id: 'facebook', name: 'Facebook', icon: '📘', maxChars: 63206 },
  { id: 'instagram', name: 'Instagram', icon: '📸', maxChars: 2200 },
  { id: 'imgur', name: 'Imgur', icon: '🖼️', maxChars: 10000 },
  { id: 'discord', name: 'Discord', icon: '🎮', maxChars: 2000 },
];

type BatteryStatus = 'SAFE' | 'ARMED' | 'FIRING' | 'COMPLETE';
type CampaignType = 'little-red-hen' | 'opening-gambit' | 'grassroots-intelligence';

const CAMPAIGNS = [
  { id: 'little-red-hen' as CampaignType, name: 'Little Red Hen Story', posts: 25, description: '25-post story across 3 acts. Cumulative images build the narrative.' },
  { id: 'opening-gambit' as CampaignType, name: 'Opening Gambit', posts: 18, description: '7-day launch sequence. Pain → Vision → Proof → People → Architecture → Consolidation.' },
  { id: 'grassroots-intelligence' as CampaignType, name: 'Grassroots Intelligence', posts: 15, description: '5-day civic engagement campaign. Broken Petitions → Effort Democracy → Zero Demographics → Muffled Rule → Join.' },
];

export function TheBattery() {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType>('opening-gambit');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'linkedin', 'bluesky']);
  const [intervalHours, setIntervalHours] = useState(24);
  const [startDate, setStartDate] = useState(() => toLocalDateTimeInput(tomorrowAtNineLocal()));
  const [isScheduling, setIsScheduling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus>('SAFE');
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmPhrase = useConfirmationPhrase();

  const henPosts = previewPosts();
  const gambitPosts = previewGambitPosts();
  const grassrootsPosts = previewGrassrootsPosts();
  const activeCampaign = CAMPAIGNS.find(c => c.id === selectedCampaign)!;
  const totalPosts = selectedCampaign === 'little-red-hen' ? henPosts.length
    : selectedCampaign === 'grassroots-intelligence' ? grassrootsPosts.length
    : gambitPosts.length;

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleArm = useCallback(() => {
    if (selectedPlatforms.length === 0) {
      toast.error('No platforms selected — cannot arm');
      return;
    }
    if (batteryStatus === 'SAFE') {
      setBatteryStatus('ARMED');
      toast.success('⚡ Battery ARMED — awaiting fire command');
    } else {
      setBatteryStatus('SAFE');
      toast.info('🛡️ Battery disarmed — standing down');
    }
  }, [batteryStatus, selectedPlatforms]);

  const handleFireRequest = () => {
    if (batteryStatus !== 'ARMED') {
      toast.error('Battery must be ARMED before firing');
      return;
    }
    setShowConfirm(true);
  };

  const handleFire = async () => {
    setShowConfirm(false);
    setBatteryStatus('FIRING');
    setIsScheduling(true);

    try {
      let result: { success: boolean; postsCreated: number; error?: string };

      if (selectedCampaign === 'little-red-hen') {
        result = await scheduleLittleRedHenPosts({
          platforms: selectedPlatforms,
          startDate: new Date(startDate),
          intervalHours,
        });
      } else if (selectedCampaign === 'grassroots-intelligence') {
        result = await scheduleGrassrootsIntelligencePosts({
          launchDate: new Date(startDate),
        });
      } else {
        result = await scheduleOpeningGambitPosts({
          launchDate: new Date(startDate),
        });
      }

      if (result.success) {
        setBatteryStatus('COMPLETE');
        toast.success(`🎯 FIRE MISSION COMPLETE — ${result.postsCreated} posts scheduled (${activeCampaign.name})`);
      } else {
        setBatteryStatus('ARMED');
        toast.error(result.error || 'Fire mission failed — battery remains armed');
      }
    } catch (error) {
      setBatteryStatus('ARMED');
      toast.error('Fire mission aborted — error encountered');
      console.error(error);
    } finally {
      setIsScheduling(false);
    }
  };

  // Status colors
  const statusConfig: Record<BatteryStatus, { color: string; bg: string; icon: typeof Shield; label: string }> = {
    SAFE: { color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/30', icon: Shield, label: 'SAFE' },
    ARMED: { color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', icon: ShieldAlert, label: 'ARMED' },
    FIRING: { color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30', icon: Zap, label: 'FIRING' },
    COMPLETE: { color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30', icon: Target, label: 'COMPLETE' },
  };

  const status = statusConfig[batteryStatus];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Battery Status Header */}
      <Card className={`border-2 ${status.bg}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <StatusIcon className={`w-6 h-6 ${status.color}`} />
              <span>The Battery</span>
              <Badge variant="outline" className={status.color}>
                {status.label}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Label htmlFor="arm-toggle" className={`text-sm font-medium ${status.color}`}>
                {batteryStatus === 'ARMED' ? '⚡ ARMED' : '🛡️ SAFE'}
              </Label>
              <Switch
                id="arm-toggle"
                checked={batteryStatus === 'ARMED'}
                onCheckedChange={handleArm}
                disabled={batteryStatus === 'FIRING'}
              />
            </div>
          </div>
          <CardDescription>
            Coordinated social media barrage system. Load posts, select platforms, ARM when ready.
            Nothing fires until you confirm with "{confirmPhrase}."
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Campaign Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Campaign: {activeCampaign.name}
          </CardTitle>
          <CardDescription>{activeCampaign.description}</CardDescription>
          <div className="flex gap-2 mt-3">
            {CAMPAIGNS.map(campaign => (
              <Button
                key={campaign.id}
                variant={selectedCampaign === campaign.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCampaign(campaign.id)}
                className={selectedCampaign === campaign.id ? 'bg-indigo-600' : ''}
              >
                {campaign.name} ({campaign.posts} posts)
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Target Platforms</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PLATFORMS.map(platform => (
                <div
                  key={platform.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPlatforms.includes(platform.id)
                      ? 'bg-green-500/10 border-green-500'
                      : 'bg-muted/50 border-border hover:border-muted-foreground/30'
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <Checkbox
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={() => togglePlatform(platform.id)}
                  />
                  <span className="text-xl">{platform.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{platform.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {PLATFORM_IMAGE_LIMITS[platform.id] || '∞'} imgs / {platform.maxChars} chars
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Fire Date & Time
              </Label>
              <div className="space-y-2">
                <Input id="startDate" type="datetime-local" value={startDate} readOnly />
                <SchedulingEntryBox
                  contentType="cue_card"
                  contentId={`battery-${selectedCampaign}`}
                  contentTitle={`${activeCampaign.name} Dispatch Window`}
                  target="cue-card-dispatch"
                  defaultDate={new Date(startDate)}
                  triggerLabel="Adjust Schedule"
                  buttonVariant="outline"
                  onSubmitEntry={async (entry) => {
                    setStartDate(toLocalDateTimeInput(entry.scheduledAt));
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="interval" className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                Hours Between Volleys
              </Label>
              <Input
                id="interval"
                type="number"
                min={1}
                max={168}
                value={intervalHours}
                onChange={(e) => setIntervalHours(parseInt(e.target.value) || 24)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {totalPosts} volleys × {intervalHours}h = {Math.round(totalPosts * intervalHours / 24)} day campaign
              </p>
            </div>
          </div>

          <Separator />

          {/* Campaign Summary */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Fire Mission Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Volleys</div>
                <div className="text-xl font-bold">{totalPosts}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Targets</div>
                <div className="text-xl font-bold">{selectedCampaign === 'opening-gambit' ? getGambitPlatforms().length : selectedCampaign === 'grassroots-intelligence' ? getGrassrootsPlatforms().length : selectedPlatforms.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Rounds</div>
                <div className="text-xl font-bold">{selectedCampaign === 'little-red-hen' ? totalPosts * selectedPlatforms.length : totalPosts}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Campaign Duration</div>
                <div className="text-xl font-bold">{selectedCampaign === 'opening-gambit' ? '7d' : selectedCampaign === 'grassroots-intelligence' ? '5d' : `${Math.round(totalPosts * intervalHours / 24)}d`}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide Intel' : 'Preview Intel'}
            </Button>

            {batteryStatus === 'ARMED' && (
              <Button
                onClick={handleFireRequest}
                disabled={isScheduling || selectedPlatforms.length === 0}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                <Zap className="w-4 h-4" />
                {isScheduling ? 'FIRING...' : 'FIRE'}
              </Button>
            )}

            {batteryStatus === 'SAFE' && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <AlertTriangle className="w-4 h-4" />
                ARM the battery to enable fire control
              </div>
            )}

            {batteryStatus === 'COMPLETE' && (
              <Badge className="bg-blue-600 text-white">
                <Target className="w-4 h-4 mr-1" />
                Fire Mission Complete
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Intelligence Report — {activeCampaign.name}</CardTitle>
            <CardDescription>
              All {totalPosts} volleys in the campaign. Review before arming.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {selectedCampaign === 'little-red-hen' ? (
                henPosts.map((post, idx) => (
                  <div key={idx} className="bg-muted/30 rounded-lg p-4 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Volley {post.postNumber}</Badge>
                      <Badge className={
                        post.act === 1 ? 'bg-amber-600' :
                        post.act === 2 ? 'bg-purple-600' :
                        'bg-green-600'
                      }>
                        Act {post.act}: {post.actName}
                      </Badge>
                      <Badge variant="secondary">{post.imageUrls.length} images</Badge>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-foreground/80">{post.content}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {post.imageUrls.slice(0, 4).map((url, i) => (
                        <img key={i} src={url} alt={`Scene ${i + 1}`} className="w-12 h-12 object-cover rounded border" />
                      ))}
                      {post.imageUrls.length > 4 && (
                        <div className="w-12 h-12 rounded border flex items-center justify-center text-xs text-muted-foreground">
                          +{post.imageUrls.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                (selectedCampaign === 'grassroots-intelligence' ? grassrootsPosts : gambitPosts).map((post, idx) => {
                  const dayColors: Record<string, string> = {
                    'The Pain': 'bg-red-600',
                    'The Vision': 'bg-blue-600',
                    'The Proof': 'bg-emerald-600',
                    'The People': 'bg-amber-600',
                    'The Architecture': 'bg-purple-600',
                    'Consolidation': 'bg-slate-600',
                    'Broken Petitions': 'bg-red-600',
                    'Effort Democracy': 'bg-blue-600',
                    'The Data': 'bg-emerald-600',
                    'Architectural Civility': 'bg-purple-600',
                    'Join the Expedition': 'bg-amber-600',
                  };
                  return (
                    <div key={idx} className="bg-muted/30 rounded-lg p-4 border">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline">Post {post.postNumber}</Badge>
                        <Badge className={dayColors[post.dayName] || 'bg-slate-600'}>
                          Day {post.day}: {post.dayName}
                        </Badge>
                        <Badge variant="secondary">{post.platform}</Badge>
                        <Badge variant={post.priority === 'critical' ? 'destructive' : 'outline'}>
                          {post.priority}
                        </Badge>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        {post.title} — {post.scheduledTime}
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-foreground/80 line-clamp-6">{post.content}</p>
                      {post.hashtags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {post.hashtags.map((tag, i) => (
                            <span key={i} className="text-xs text-blue-400">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* As You Wish Confirmation */}
      <AsYouWishConfirm
        open={showConfirm}
        title="Fire the Battery"
        description="This will schedule all posts across selected platforms. Once fired, posts will go live according to the schedule."
        details={[
          { label: "Campaign", value: activeCampaign.name },
          { label: "Volleys", value: `${totalPosts} posts` },
          { label: "Targets", value: selectedCampaign === 'opening-gambit' ? `${getGambitPlatforms().length} platforms` : selectedCampaign === 'grassroots-intelligence' ? `${getGrassrootsPlatforms().length} platforms` : `${selectedPlatforms.length} platforms` },
          { label: "First Volley", value: new Date(startDate).toLocaleString() },
          { label: "Campaign Duration", value: selectedCampaign === 'opening-gambit' ? '7 days' : selectedCampaign === 'grassroots-intelligence' ? '5 days' : `${Math.round(totalPosts * intervalHours / 24)} days` },
        ]}
        onConfirm={handleFire}
        onCancel={() => setShowConfirm(false)}
        variant="caution"
      />
    </div>
  );
}

export default TheBattery;
