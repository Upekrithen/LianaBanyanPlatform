/**
 * ANCHOR BEACON SYSTEM
 * ====================
 * Drop breadcrumbs anywhere in the platform that:
 * 1. Link to contextual cue cards
 * 2. Enable on-the-fly Dispatch via social, SMS, email
 * 3. Support scheduled dispatch via Hofund's scheduling tool
 * 
 * "Drop an Anchor Beacon → Share cue cards AT WILL, ON THE FLY"
 * 
 * MULTI-ACCOUNT SUPPORT (Feb 2026):
 * - Members can connect up to 6 accounts per platform
 * - Checkboxes allow selecting multiple accounts to post to
 * - Example: Post to Official + Silly + Friends accounts at once
 * 
 * This component provides:
 * - AnchorBeacon: A droppable beacon that opens a card dialog
 * - CueCardDispatch: Share/dispatch cue cards to any connected channel
 * - InfoFlipCard: Accordion-style expandable info cards with + buttons
 * - InfoCarousel: Forward/backward navigation between named subjects
 */

import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Anchor,
  ChevronLeft,
  ChevronRight,
  Plus,
  Share2,
  Send,
  Mail,
  MessageSquare,
  Twitter,
  Linkedin,
  Facebook,
  Calendar,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Info,
  Download,
  Star,
  User,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getAllAccounts, 
  postToMultipleAccounts, 
  type SocialAccount,
  type SocialPlatform,
} from '@/lib/socialOAuth';

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

export interface CueCard {
  id: string;
  title: string;
  subtitle?: string;
  front: string;
  back: string;
  category: string;
  tags: string[];
}

export interface InfoSection {
  id: string;
  title: string;
  icon?: React.ReactNode;
  summary: string;
  content: React.ReactNode;
  cueCards?: CueCard[];  // Cards contextually linked to this section
}

export interface DispatchChannel {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'social' | 'email' | 'sms' | 'copy' | 'custom';
  connected?: boolean;
}

// ─────────────────────────────────────────────────────────
// PLATFORM ICONS
// ─────────────────────────────────────────────────────────

const PLATFORM_ICONS: Record<SocialPlatform, React.ReactNode> = {
  twitter: <Twitter className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  bluesky: <span className="w-4 h-4 text-blue-500 font-bold text-xs">🦋</span>,
  threads: <span className="w-4 h-4 font-bold text-xs">@</span>,
  tiktok: <span className="w-4 h-4 font-bold text-xs">♪</span>,
  instagram: <span className="w-4 h-4 font-bold text-xs">📷</span>,
};

const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  twitter: 'bg-sky-500/10 border-sky-500/30',
  linkedin: 'bg-blue-600/10 border-blue-600/30',
  facebook: 'bg-blue-500/10 border-blue-500/30',
  bluesky: 'bg-sky-400/10 border-sky-400/30',
  threads: 'bg-gray-500/10 border-gray-500/30',
  tiktok: 'bg-pink-500/10 border-pink-500/30',
  instagram: 'bg-purple-500/10 border-purple-500/30',
};

// ─────────────────────────────────────────────────────────
// DISPATCH CHANNELS (for non-OAuth methods)
// ─────────────────────────────────────────────────────────

const DEFAULT_DISPATCH_CHANNELS: DispatchChannel[] = [
  { id: 'email', name: 'Email', icon: <Mail className="w-4 h-4" />, type: 'email', connected: true },
  { id: 'sms', name: 'SMS', icon: <MessageSquare className="w-4 h-4" />, type: 'sms', connected: true },
  { id: 'copy', name: 'Copy Link', icon: <Copy className="w-4 h-4" />, type: 'copy', connected: true },
];

// ─────────────────────────────────────────────────────────
// ANCHOR BEACON COMPONENT
// ─────────────────────────────────────────────────────────

interface AnchorBeaconProps {
  /** The cards to show when this beacon is activated */
  cards: CueCard[];
  /** Label shown next to the beacon */
  label?: string;
  /** Optional badge text */
  badge?: string;
  /** Custom dispatch channels (uses defaults if not provided) */
  channels?: DispatchChannel[];
  /** Compact mode (just the icon) */
  compact?: boolean;
  className?: string;
}

export function AnchorBeacon({
  cards,
  label,
  badge,
  channels = DEFAULT_DISPATCH_CHANNELS,
  compact = false,
  className = '',
}: AnchorBeaconProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors ${className}`}
        title="Drop Anchor — Share cue cards"
      >
        <Anchor className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
        {!compact && label && <span className="text-sm">{label}</span>}
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </button>

      <CueCardDispatchDialog
        open={open}
        onOpenChange={setOpen}
        cards={cards}
        channels={channels}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────
// CUE CARD DISPATCH DIALOG (Multi-Account Support)
// ─────────────────────────────────────────────────────────

interface CueCardDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: CueCard[];
  channels?: DispatchChannel[];
}

export function CueCardDispatchDialog({
  open,
  onOpenChange,
  cards,
  channels = DEFAULT_DISPATCH_CHANNELS,
}: CueCardDispatchDialogProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Multi-account state
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(new Set());
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const currentCard = cards[currentCardIndex];

  // Load connected accounts when dialog opens
  useEffect(() => {
    if (open) {
      loadAccounts();
    }
  }, [open]);

  const loadAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const accounts = await getAllAccounts();
      setConnectedAccounts(accounts);
      // Pre-select default accounts
      const defaultIds = new Set(
        accounts.filter(a => a.isDefault).map(a => a.id)
      );
      setSelectedAccountIds(defaultIds);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handlePrevCard = useCallback(() => {
    setCurrentCardIndex((i) => (i > 0 ? i - 1 : cards.length - 1));
  }, [cards.length]);

  const handleNextCard = useCallback(() => {
    setCurrentCardIndex((i) => (i < cards.length - 1 ? i + 1 : 0));
  }, [cards.length]);

  const toggleAccount = (accountId: string) => {
    setSelectedAccountIds(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  const selectAllForPlatform = (platform: SocialPlatform) => {
    const platformAccounts = connectedAccounts.filter(a => a.platform === platform);
    setSelectedAccountIds(prev => {
      const next = new Set(prev);
      platformAccounts.forEach(a => next.add(a.id));
      return next;
    });
  };

  const deselectAllForPlatform = (platform: SocialPlatform) => {
    const platformAccounts = connectedAccounts.filter(a => a.platform === platform);
    setSelectedAccountIds(prev => {
      const next = new Set(prev);
      platformAccounts.forEach(a => next.delete(a.id));
      return next;
    });
  };

  // Post to all selected accounts
  const handlePostToSelected = async () => {
    if (selectedAccountIds.size === 0) {
      toast.error('Select at least one account to post to');
      return;
    }

    const shareUrl = `https://lianabanyan.com/card/${currentCard?.id || 'share'}`;
    const shareText = customMessage || currentCard?.front || '';
    const fullText = `${shareText}\n\n${shareUrl}`;

    setIsPosting(true);
    try {
      const results = await postToMultipleAccounts(
        Array.from(selectedAccountIds),
        fullText
      );

      const successes = results.filter(r => r.success);
      const failures = results.filter(r => !r.success);

      if (successes.length > 0) {
        toast.success(`Posted to ${successes.length} account${successes.length > 1 ? 's' : ''}!`);
      }
      if (failures.length > 0) {
        toast.error(`Failed on ${failures.length} account${failures.length > 1 ? 's' : ''}`);
      }
    } catch (err) {
      toast.error('Failed to post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDispatch = async (channel: DispatchChannel) => {
    const shareUrl = `https://lianabanyan.com/card/${currentCard?.id || 'share'}`;
    const shareText = customMessage || currentCard?.front || '';

    switch (channel.type) {
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(currentCard?.title || 'Check this out')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_blank');
        toast.success('Email opened!');
        break;

      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        toast.success('SMS opened!');
        break;

      case 'copy':
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Link copied!');
        break;
    }
  };

  const handleScheduleDispatch = () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error('Please select date and time');
      return;
    }
    toast.success(`Dispatch scheduled for ${scheduleDate} at ${scheduleTime}`);
    setShowSchedule(false);
    setScheduleDate('');
    setScheduleTime('');
  };

  // Group accounts by platform
  const accountsByPlatform = connectedAccounts.reduce((acc, account) => {
    if (!acc[account.platform]) {
      acc[account.platform] = [];
    }
    acc[account.platform].push(account);
    return acc;
  }, {} as Record<SocialPlatform, SocialAccount[]>);

  if (!currentCard) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-primary" />
            Dispatch Cue Cards
            <Badge variant="outline" className="ml-2">
              {currentCardIndex + 1} / {cards.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Card Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevCard}
              disabled={cards.length <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex-1 text-center">
              <div className="text-sm text-muted-foreground">Current Card</div>
              <div className="font-medium">{currentCard.title}</div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextCard}
              disabled={cards.length <= 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Card Preview */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{currentCard.title}</h3>
                {currentCard.subtitle && (
                  <p className="text-sm text-muted-foreground">{currentCard.subtitle}</p>
                )}
              </div>
              <Badge>{currentCard.category}</Badge>
            </div>
            <pre className="text-sm whitespace-pre-wrap font-sans bg-background/50 p-3 rounded">
              {currentCard.front}
            </pre>
            <div className="flex flex-wrap gap-1">
              {currentCard.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Custom Message (optional)
            </label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add your own message..."
              rows={2}
            />
          </div>

          {/* Connected Social Accounts (Multi-Account) */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium flex items-center gap-2">
                <Send className="w-4 h-4" />
                Post to Social Accounts
                {selectedAccountIds.size > 0 && (
                  <Badge variant="secondary">{selectedAccountIds.size} selected</Badge>
                )}
              </div>
              {selectedAccountIds.size > 0 && (
                <Button
                  size="sm"
                  onClick={handlePostToSelected}
                  disabled={isPosting}
                >
                  {isPosting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Post to {selectedAccountIds.size} Account{selectedAccountIds.size > 1 ? 's' : ''}
                </Button>
              )}
            </div>

            {isLoadingAccounts ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading accounts...</span>
              </div>
            ) : connectedAccounts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No social accounts connected yet.</p>
                <p className="text-xs">Connect accounts in your Portfolio settings.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(Object.entries(accountsByPlatform) as [SocialPlatform, SocialAccount[]][]).map(([platform, accounts]) => (
                  <div key={platform} className={`rounded-lg border p-3 ${PLATFORM_COLORS[platform]}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {PLATFORM_ICONS[platform]}
                        <span className="font-medium capitalize">{platform}</span>
                        <Badge variant="outline" className="text-xs">
                          {accounts.length} account{accounts.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => selectAllForPlatform(platform)}
                        >
                          All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => deselectAllForPlatform(platform)}
                        >
                          None
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {accounts.map((account) => (
                        <label
                          key={account.id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-background/50 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedAccountIds.has(account.id)}
                            onCheckedChange={() => toggleAccount(account.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              {account.isDefault && (
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              )}
                              <span className="font-medium text-sm truncate">
                                {account.accountNickname || account.accountHandle || 'Account'}
                              </span>
                            </div>
                            {account.accountHandle && account.accountNickname && (
                              <span className="text-xs text-muted-foreground truncate block">
                                {account.accountHandle}
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Other Dispatch Channels (Email, SMS, Copy) */}
          <div>
            <div className="text-sm font-medium mb-2 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Other Ways to Share
            </div>
            <div className="grid grid-cols-3 gap-2">
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={channel.id === 'copy' && copied ? 'default' : 'outline'}
                  size="sm"
                  className="flex flex-col h-auto py-2"
                  onClick={() => handleDispatch(channel)}
                  disabled={!channel.connected}
                >
                  {channel.id === 'copy' && copied ? (
                    <Check className="w-4 h-4 mb-1" />
                  ) : (
                    <span className="mb-1">{channel.icon}</span>
                  )}
                  <span className="text-xs">{channel.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Schedule Dispatch */}
          <div className="border-t pt-4">
            {!showSchedule ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowSchedule(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Dispatch
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowSchedule(false)}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleScheduleDispatch}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Download Option */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Image
            </Button>
            <Button variant="outline" className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Hofund
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────
// INFO FLIP CARD (Expandable Accordion with + button)
// ─────────────────────────────────────────────────────────

interface InfoFlipCardProps {
  sections: InfoSection[];
  /** Default section to expand */
  defaultExpanded?: string;
  /** Show navigation arrows */
  showNavigation?: boolean;
  /** Callback when a section's Anchor Beacon is clicked */
  onAnchorClick?: (section: InfoSection) => void;
  className?: string;
}

export function InfoFlipCard({
  sections,
  defaultExpanded,
  showNavigation = true,
  onAnchorClick,
  className = '',
}: InfoFlipCardProps) {
  const [currentIndex, setCurrentIndex] = useState(
    defaultExpanded ? sections.findIndex((s) => s.id === defaultExpanded) : 0
  );
  const [expandedSection, setExpandedSection] = useState<string | undefined>(defaultExpanded);

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
    setCurrentIndex(newIndex);
    setExpandedSection(sections[newIndex].id);
  };

  const handleNext = () => {
    const newIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setExpandedSection(sections[newIndex].id);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Navigation Header */}
      {showNavigation && sections.length > 1 && (
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-2">
          <Button variant="ghost" size="sm" onClick={handlePrev}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{sections[currentIndex]?.title}</span>
            <span className="mx-2">·</span>
            <span>{currentIndex + 1} of {sections.length}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Accordion Sections */}
      <Accordion
        type="single"
        collapsible
        value={expandedSection}
        onValueChange={setExpandedSection}
        className="w-full"
      >
        {sections.map((section, index) => (
          <AccordionItem key={section.id} value={section.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 flex-1">
                {section.icon && (
                  <span className="flex-shrink-0">{section.icon}</span>
                )}
                <div className="flex-1 text-left">
                  <div className="font-medium">{section.title}</div>
                  <div className="text-xs text-muted-foreground">{section.summary}</div>
                </div>
                {section.cueCards && section.cueCards.length > 0 && (
                  <Badge variant="outline" className="mr-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {section.cueCards.length} cards
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {section.content}
              </div>

              {/* Anchor Beacon for this section */}
              {section.cueCards && section.cueCards.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <AnchorBeacon
                    cards={section.cueCards}
                    label="Share this section"
                    badge={`${section.cueCards.length} cards`}
                  />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ANCHOR BEACON EXPLAINER (For the back of an explainer flipcard)
// ─────────────────────────────────────────────────────────

export function AnchorBeaconExplainer() {
  return (
    <div className="space-y-4 text-sm">
      <h4 className="font-bold text-base">Anchor Beacons: Share AT WILL, ON THE FLY</h4>
      
      <p>
        Drop an Anchor Beacon anywhere you want to share context with someone. 
        Each beacon links to relevant cue cards that can be:
      </p>
      
      <ul className="space-y-2">
        <li className="flex items-start gap-2">
          <Send className="w-4 h-4 mt-0.5 text-primary" />
          <span><strong>Dispatched</strong> — Send via Twitter, LinkedIn, Facebook, Email, or SMS</span>
        </li>
        <li className="flex items-start gap-2">
          <Calendar className="w-4 h-4 mt-0.5 text-primary" />
          <span><strong>Scheduled</strong> — Use the Scheduled Dispatch Tool to queue for later</span>
        </li>
        <li className="flex items-start gap-2">
          <Copy className="w-4 h-4 mt-0.5 text-primary" />
          <span><strong>Copied</strong> — Grab the link to paste anywhere</span>
        </li>
        <li className="flex items-start gap-2">
          <Download className="w-4 h-4 mt-0.5 text-primary" />
          <span><strong>Downloaded</strong> — Save as image for offline sharing</span>
        </li>
      </ul>

      <div className="bg-primary/10 p-3 rounded-lg">
        <p className="font-medium text-primary">Connected Portfolio Integration</p>
        <p className="text-xs mt-1">
          Any social accounts you've connected in your portfolio (Discord, Bluesky, TikTok, 
          Instagram, etc.) automatically appear as dispatch options.
        </p>
      </div>

      <p className="text-muted-foreground text-xs">
        One of a thousand streams to get where you want to go. 
        Drop breadcrumbs. Share knowledge. Build together.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────

export { DEFAULT_DISPATCH_CHANNELS };
