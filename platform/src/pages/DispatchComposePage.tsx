import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getUserPlugs, type SocialPlug, type SocialPlatform } from '@/lib/socialPlugSystem';
import { getBatteryDispatchAccessStatus, SOURCE_LABELS } from '@/lib/batteryDispatchAccess';
import { BatteryDispatchUpgradeCard } from '@/components/dispatch/BatteryDispatchUpgradeCard';
import {
  PLATFORM_GUARDRAILS,
  PLATFORM_DISPLAY,
  DISCLOSURE_TEMPLATES,
  DISCORD_PERMISSION_ARCHITECTURE,
  adaptContentForPlatform,
  type DispatchPlatformContent,
  type DispatchMode,
} from '@/lib/dispatchGuardrails';
import { StampToSendModal } from '@/components/dispatch/StampToSendModal';
import { SchedulingEntryBox } from '@/components/scheduling/SchedulingEntryBox';
import { Send, Clock, Layers, FileText, Image, Hash, AlertTriangle, Radio, CheckCircle, Plug, ShieldAlert, Copy, Eye } from 'lucide-react';

const ALL_PLATFORMS: SocialPlatform[] = [
  'twitter', 'tiktok', 'instagram', 'linkedin', 'facebook',
  'discord', 'bluesky', 'threads', 'mastodon', 'youtube', 'substack', 'imgur',
];

export default function DispatchComposePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [baseContent, setBaseContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isPromotional, setIsPromotional] = useState(false);
  const [dispatchMode, setDispatchMode] = useState<DispatchMode>('now');
  const [scheduledTime, setScheduledTime] = useState('');
  const [connectedPlugs, setConnectedPlugs] = useState<SocialPlug[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<SocialPlatform>>(new Set());
  const [showStampModal, setShowStampModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessLoading, setAccessLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeSources, setActiveSources] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    getUserPlugs(user.id).then(plugs => {
      setConnectedPlugs(plugs);
      const enabled = new Set(plugs.filter(p => p.isEnabled).map(p => p.platform));
      setSelectedPlatforms(enabled);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setAccessLoading(true);
    getBatteryDispatchAccessStatus(user.id)
      .then((status) => {
        setHasAccess(status.hasAccess);
        setActiveSources(status.activeSources);
      })
      .finally(() => setAccessLoading(false));
  }, [user]);

  // Handle prefill from Say It Fast or other challenge deep links
  useEffect(() => {
    const prefill = searchParams.get('prefill');
    if (prefill === 'sayitfast') {
      const phrase = searchParams.get('phrase') || '';
      const marks = searchParams.get('marks') || '0';
      const challengeId = searchParams.get('challenge_id') || '';
      setBaseContent(
        `#ad I just completed the Say It Fast challenge on Liana Banyan! 🎙️\n` +
        `I'm a Liana Banyan member and I earn Marks (non-cash recognition) for sharing.\n\n` +
        `Tongue twister: "${phrase}"\n` +
        `Earned: ${marks} Marks\n\n` +
        `Try it yourself: https://lianabanyan.com/challenge/say-it-fast` +
        (challengeId ? `?ref=${challengeId}` : '') +
        `\n\n#SayItFast #LianaBanyan #TongueTwister`
      );
    }
  }, [searchParams]);

  const connectedSet = useMemo(
    () => new Set(connectedPlugs.map(p => p.platform)),
    [connectedPlugs]
  );

  const togglePlatform = useCallback((platform: SocialPlatform) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  }, []);

  const platformContents: DispatchPlatformContent[] = useMemo(() => {
    return Array.from(selectedPlatforms).map(platform => {
      const guardrail = PLATFORM_GUARDRAILS[platform];
      const tags = isPromotional ? guardrail.disclosureTags : [];
      const adapted = adaptContentForPlatform(baseContent, platform, tags);
      return {
        platform,
        content: adapted,
        mediaUrls,
        disclosureTags: tags,
        approved: false,
        skipped: false,
        exceedsLimit: baseContent.length > guardrail.charLimit,
        platformSpecific: {},
      };
    });
  }, [selectedPlatforms, baseContent, mediaUrls, isPromotional]);

  const charCountColor = (platform: SocialPlatform) => {
    const limit = PLATFORM_GUARDRAILS[platform].charLimit;
    const ratio = baseContent.length / limit;
    if (ratio > 1) return 'text-red-500';
    if (ratio > 0.9) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  const handleReviewAndSend = () => {
    if (baseContent.trim().length === 0 || selectedPlatforms.size === 0) return;
    setShowStampModal(true);
  };

  const handleDispatchComplete = () => {
    setShowStampModal(false);
    navigate('/dashboard/dispatch/queue');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Sign in to use Battery Dispatch.</p>
      </div>
    );
  }

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Checking Battery Dispatch access...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return <BatteryDispatchUpgradeCard />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Battery Dispatch</h1>
          <p className="text-sm text-muted-foreground">Compose once, send everywhere — your Universal Remote.</p>
          {activeSources.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Active via: {activeSources.map((source) => SOURCE_LABELS[source as keyof typeof SOURCE_LABELS] ?? source).join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Content Composer */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Compose Your Message</h2>
        </div>

        <textarea
          value={baseContent}
          onChange={(e) => setBaseContent(e.target.value)}
          placeholder="What do you want to share with the world?"
          className="w-full min-h-[160px] rounded-lg border bg-background p-4 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />

        {/* Char counts for selected platforms */}
        {selectedPlatforms.size > 0 && baseContent.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs">
            {Array.from(selectedPlatforms).map(p => (
              <span key={p} className={`flex items-center gap-1 ${charCountColor(p)}`}>
                <span className="font-medium">{PLATFORM_DISPLAY[p].name}:</span>
                {baseContent.length}/{PLATFORM_GUARDRAILS[p].charLimit}
                {baseContent.length > PLATFORM_GUARDRAILS[p].charLimit && (
                  <AlertTriangle className="w-3 h-3" />
                )}
              </span>
            ))}
          </div>
        )}

        {/* Media placeholder */}
        <div className="flex items-center gap-3 pt-2 border-t">
          <button
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border hover:bg-accent"
            onClick={() => {/* Media upload placeholder — will be wired to storage bucket */}}
          >
            <Image className="w-3.5 h-3.5" /> Add Media
          </button>
          <button
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border hover:bg-accent"
            onClick={() => {/* Hashtag suggestion placeholder */}}
          >
            <Hash className="w-3.5 h-3.5" /> Hashtag Suggestions
          </button>
        </div>

        {/* Promotional toggle */}
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPromotional}
            onChange={(e) => setIsPromotional(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span>This content is promotional or incentivized</span>
          {isPromotional && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Disclosure tags will be added
            </span>
          )}
        </label>
      </section>

      {/* Platform Disclosure Guidance — shows when promotional is on and relevant platforms selected */}
      {isPromotional && selectedPlatforms.size > 0 && (() => {
        const templatedPlatforms = Array.from(selectedPlatforms).filter(p => DISCLOSURE_TEMPLATES[p]);
        if (templatedPlatforms.length === 0) return null;
        return (
          <section className="rounded-xl border border-amber-500/30 bg-amber-50/5 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-sm">Platform Disclosure Templates</h2>
              <span className="text-[10px] text-muted-foreground ml-auto">Bishop B042 Legal Review</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Because this content is promotional, the following disclosure copy will be attached or should be manually added to each platform:
            </p>
            <div className="space-y-3">
              {templatedPlatforms.map(platform => {
                const tpl = DISCLOSURE_TEMPLATES[platform]!;
                const display = PLATFORM_DISPLAY[platform];
                return (
                  <div key={platform} className="rounded-lg border bg-card p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{display.icon}</span>
                      <span className="text-sm font-medium">{display.name}</span>
                    </div>
                    {tpl.pinnedComment && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Pinned Comment</p>
                        <div className="relative group">
                          <pre className="text-[10px] text-muted-foreground bg-muted/30 rounded p-2 whitespace-pre-wrap leading-relaxed">{tpl.pinnedComment}</pre>
                          <button
                            onClick={() => navigator.clipboard.writeText(tpl.pinnedComment!)}
                            className="absolute top-1 right-1 p-1 rounded bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}
                    {tpl.firstLines && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <Eye className="w-3 h-3" /> First 3 Lines (always visible)
                        </p>
                        <div className="relative group">
                          <pre className="text-[10px] text-muted-foreground bg-muted/30 rounded p-2 whitespace-pre-wrap leading-relaxed">{tpl.firstLines}</pre>
                          <button
                            onClick={() => navigator.clipboard.writeText(tpl.firstLines!)}
                            className="absolute top-1 right-1 p-1 rounded bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}
                    {tpl.fullParagraph && (
                      <details className="text-[10px]">
                        <summary className="font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground">Full Paragraph (below fold)</summary>
                        <div className="relative group mt-1">
                          <pre className="text-[10px] text-muted-foreground bg-muted/30 rounded p-2 whitespace-pre-wrap leading-relaxed">{tpl.fullParagraph}</pre>
                          <button
                            onClick={() => navigator.clipboard.writeText(tpl.fullParagraph!)}
                            className="absolute top-1 right-1 p-1 rounded bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </details>
                    )}
                    {tpl.preFooter && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Pre-Footer Disclosure</p>
                        <div className="relative group">
                          <pre className="text-[10px] text-muted-foreground bg-muted/30 rounded p-2 whitespace-pre-wrap leading-relaxed">{tpl.preFooter}</pre>
                          <button
                            onClick={() => navigator.clipboard.writeText(tpl.preFooter!)}
                            className="absolute top-1 right-1 p-1 rounded bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}
                    {tpl.humanApprovalGate && (
                      <details className="text-[10px]">
                        <summary className="font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground">Human Approval Gate Language</summary>
                        <div className="relative group mt-1">
                          <pre className="text-[10px] text-muted-foreground bg-muted/30 rounded p-2 whitespace-pre-wrap leading-relaxed">{tpl.humanApprovalGate}</pre>
                          <button
                            onClick={() => navigator.clipboard.writeText(tpl.humanApprovalGate!)}
                            className="absolute top-1 right-1 p-1 rounded bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </details>
                    )}
                    {tpl.verbalNote && (
                      <div className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded p-2 flex items-start gap-1.5">
                        <Radio className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>Recommended verbal in-video disclosure (first 30 seconds): {tpl.verbalNote}</span>
                      </div>
                    )}
                    {tpl.avoidWords.length > 0 && (
                      <div className="text-[10px] text-red-600/70 bg-red-50 dark:bg-red-950/10 rounded p-2">
                        <strong>Never use:</strong> {tpl.avoidWords.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* Discord Permission Guardrails — shows when Discord is selected */}
      {selectedPlatforms.has('discord') && (
        <section className="rounded-xl border border-indigo-500/30 bg-indigo-50/5 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-sm">Discord Permission Guardrails</h2>
            <span className="text-[10px] text-muted-foreground ml-auto">Pawn Legal Review</span>
          </div>
          <div className="space-y-2">
            {Object.entries(DISCORD_PERMISSION_ARCHITECTURE.auditWarnings).map(([key, warning]) => (
              <div key={key} className="text-xs bg-muted/30 rounded p-2">
                {warning}
              </div>
            ))}
          </div>
          <details className="text-xs">
            <summary className="font-medium text-muted-foreground cursor-pointer hover:text-foreground">
              Channel Access by Role ({DISCORD_PERMISSION_ARCHITECTURE.roleHierarchy.length} roles)
            </summary>
            <div className="mt-2 space-y-2">
              {DISCORD_PERMISSION_ARCHITECTURE.roleHierarchy.map((role) => (
                <div key={role.role} className="bg-muted/20 rounded p-2">
                  <div className="font-medium text-indigo-600 dark:text-indigo-400">{role.role}</div>
                  <div className="text-muted-foreground">{role.notes}</div>
                  <div className="text-[10px] mt-1">
                    <span className="text-muted-foreground">Channels: </span>
                    {role.channels.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </details>
          <details className="text-xs">
            <summary className="font-medium text-muted-foreground cursor-pointer hover:text-foreground">
              Bot Permissions (Least Privilege)
            </summary>
            <div className="mt-2 space-y-1">
              <div className="text-green-600 text-[10px]">
                <strong>Required:</strong> {DISCORD_PERMISSION_ARCHITECTURE.botPermissions.required.join(', ')}
              </div>
              <div className="text-red-600 text-[10px]">
                <strong>Prohibited:</strong> {DISCORD_PERMISSION_ARCHITECTURE.botPermissions.prohibited.join(', ')}
              </div>
            </div>
          </details>
        </section>
      )}

      {/* Platform Selector */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Plug className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Select Platforms</h2>
          <span className="text-xs text-muted-foreground ml-auto">
            {selectedPlatforms.size} selected
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ALL_PLATFORMS.map(platform => {
              const display = PLATFORM_DISPLAY[platform];
              const connected = connectedSet.has(platform);
              const selected = selectedPlatforms.has(platform);
              const plug = connectedPlugs.find(p => p.platform === platform);
              const exceeds = baseContent.length > PLATFORM_GUARDRAILS[platform].charLimit;

              return (
                <button
                  key={platform}
                  onClick={() => connected && togglePlatform(platform)}
                  disabled={!connected}
                  className={`
                    relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center
                    ${selected && connected
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-sm'
                      : connected
                        ? 'border-border hover:border-amber-300 hover:bg-accent/50'
                        : 'border-dashed border-muted-foreground/30 opacity-50'
                    }
                  `}
                >
                  <span className="text-2xl leading-none">{display.icon}</span>
                  <span className="text-xs font-medium truncate w-full">{display.name}</span>
                  {connected && plug?.platformUsername && (
                    <span className="text-[10px] text-muted-foreground truncate w-full">
                      @{plug.platformUsername}
                    </span>
                  )}
                  {!connected && (
                    <span className="text-[10px] text-muted-foreground">Connect</span>
                  )}
                  {selected && connected && (
                    <CheckCircle className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-amber-600" />
                  )}
                  {exceeds && selected && (
                    <AlertTriangle className="absolute top-1.5 left-1.5 w-3.5 h-3.5 text-red-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Schedule Options */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Dispatch Timing</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            { mode: 'now' as const, label: 'Send Now', desc: 'Immediate dispatch', icon: Send },
            { mode: 'scheduled' as const, label: 'Schedule', desc: 'Pick a date & time', icon: Clock },
            { mode: 'stagger' as const, label: 'Stagger', desc: 'Auto-space per platform', icon: Layers },
          ]).map(opt => (
            <button
              key={opt.mode}
              onClick={() => setDispatchMode(opt.mode)}
              className={`
                flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left
                ${dispatchMode === opt.mode
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                  : 'border-border hover:border-amber-300'
                }
              `}
            >
              <opt.icon className={`w-5 h-5 ${dispatchMode === opt.mode ? 'text-amber-600' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {dispatchMode === 'scheduled' && (
          <div className="pt-2">
            <label className="block text-sm text-muted-foreground mb-1">Schedule for:</label>
            <div className="flex items-center gap-2">
              <SchedulingEntryBox
                contentType="cue_card"
                contentId={baseContent.trim().slice(0, 48).replace(/\s+/g, "-").toLowerCase() || "battery-dispatch"}
                contentTitle="Battery Dispatch"
                target="cue-card-dispatch"
                triggerLabel={scheduledTime ? "Reschedule" : "Pick Date & Time"}
                buttonVariant="outline"
                onSubmitEntry={async (entry) => {
                  setScheduledTime(entry.scheduledAt.toISOString());
                }}
              />
              {scheduledTime ? (
                <button
                  type="button"
                  onClick={() => setScheduledTime('')}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border"
                >
                  Clear
                </button>
              ) : null}
            </div>
            {scheduledTime ? (
              <p className="text-xs text-muted-foreground mt-2">
                Scheduled: {new Date(scheduledTime).toLocaleString()}
              </p>
            ) : null}
          </div>
        )}

        {dispatchMode === 'stagger' && (
          <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            Stagger mode auto-spaces dispatches using platform-respectful intervals (5-30 min gaps).
            This keeps your accounts healthy and avoids spam flags.
          </p>
        )}
      </section>

      {/* Review & Send CTA */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={() => navigate('/dashboard/dispatch/queue')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View Dispatch Queue →
        </button>
        <button
          onClick={handleReviewAndSend}
          disabled={baseContent.trim().length === 0 || selectedPlatforms.size === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          Review & Send ({selectedPlatforms.size} platform{selectedPlatforms.size !== 1 ? 's' : ''})
        </button>
      </div>

      {/* Stamp-to-Send Modal */}
      {showStampModal && (
        <StampToSendModal
          platformContents={platformContents}
          dispatchMode={dispatchMode}
          scheduledTime={scheduledTime ? new Date(scheduledTime) : undefined}
          userId={user.id}
          onClose={() => setShowStampModal(false)}
          onComplete={handleDispatchComplete}
        />
      )}
    </div>
  );
}
