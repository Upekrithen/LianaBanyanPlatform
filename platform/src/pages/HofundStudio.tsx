/**
 * HOFUND STUDIO
 * =============
 * The combined Hofund Dial + Cue Card Studio.
 *
 * Flow:
 *  1. Member sees their voted projects on the dial
 *  2. Turn the dial → select a project/channel
 *  3. Cue Card templates appear for that channel
 *  4. Personal QR medallion is auto-stamped into the card
 *  5. Share via connected Social Media Plugs
 *
 * Hofund = Heimdall's sword. It controls the Bifrost.
 * This page controls where your QR routes and what you share.
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Radio,
  Copy,
  Check,
  Share2,
  QrCode,
  Settings,
  ChevronLeft,
  ChevronRight,
  Twitter,
  Linkedin,
  Facebook,
  ExternalLink,
  Download,
  Eye,
  Sparkles,
  Zap,
  Plus,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { downloadCardImage, type CardExportOptions } from "@/lib/cueCardExport";
import { schedulePost, getScheduledPosts } from "@/lib/socialOAuth";

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

interface HofundChannel {
  id: string;
  channel_number: number;
  channel_name: string;
  channel_type: string;
  destination_url: string | null;
  project_id: string | null;
  icon: string;
  is_active: boolean;
}

interface CueCardTemplate {
  id: string;
  title: string;
  subtitle: string | null;
  body_text: string;
  hashtags: string[];
  card_style: string;
  twitter_text: string | null;
  linkedin_text: string | null;
  facebook_text: string | null;
  template_type: string;
  initiative_slug: string | null;
  qr_position: string;
  qr_size: number;
  background_type: string;
  background_value: string;
}

interface StampedCard {
  templateId: string;
  customText: string;
  qrDataUrl: string;
}

// ─────────────────────────────────────────────────────────
// DEFAULT CHANNELS
// ─────────────────────────────────────────────────────────

const DEFAULT_CHANNELS: Omit<HofundChannel, "id">[] = [
  { channel_number: 1, channel_name: "My Portfolio", channel_type: "platform", destination_url: "/portfolio", project_id: null, icon: "📂", is_active: true },
  { channel_number: 2, channel_name: "My Projects", channel_type: "platform", destination_url: "/projects", project_id: null, icon: "🚀", is_active: true },
  { channel_number: 3, channel_name: "My Achievements", channel_type: "platform", destination_url: "/medallions", project_id: null, icon: "🏆", is_active: true },
  { channel_number: 4, channel_name: "Platform Home", channel_type: "platform", destination_url: "/", project_id: null, icon: "🏠", is_active: true },
  { channel_number: 5, channel_name: "Custom 1", channel_type: "custom", destination_url: null, project_id: null, icon: "📺", is_active: false },
  { channel_number: 6, channel_name: "Custom 2", channel_type: "custom", destination_url: null, project_id: null, icon: "📺", is_active: false },
  { channel_number: 7, channel_name: "Custom 3", channel_type: "custom", destination_url: null, project_id: null, icon: "📺", is_active: false },
  { channel_number: 8, channel_name: "Custom 4", channel_type: "custom", destination_url: null, project_id: null, icon: "📺", is_active: false },
  { channel_number: 9, channel_name: "Custom 5", channel_type: "custom", destination_url: null, project_id: null, icon: "📺", is_active: false },
  { channel_number: 10, channel_name: "Custom 6", channel_type: "custom", destination_url: null, project_id: null, icon: "📺", is_active: false },
];

// ─────────────────────────────────────────────────────────
// HOFUND DIAL COMPONENT
// ─────────────────────────────────────────────────────────

function HofundDial({
  channels,
  currentChannel,
  onChannelChange,
}: {
  channels: HofundChannel[];
  currentChannel: number;
  onChannelChange: (ch: number) => void;
}) {
  const activeChannel = channels.find((c) => c.channel_number === currentChannel);
  const dialAngle = ((currentChannel - 1) / 9) * 300 - 150; // -150 to +150 degrees

  return (
    <div className="flex flex-col items-center">
      {/* Dial display */}
      <div className="relative w-64 h-64 mb-6">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-border bg-card shadow-xl">
          {/* Channel markers around the edge */}
          {channels.map((ch) => {
            const angle = ((ch.channel_number - 1) / 9) * 300 - 150;
            const radian = (angle - 90) * (Math.PI / 180);
            const x = 50 + 42 * Math.cos(radian);
            const y = 50 + 42 * Math.sin(radian);
            const isActive = ch.channel_number === currentChannel;

            return (
              <button
                key={ch.channel_number}
                onClick={() => ch.is_active && onChannelChange(ch.channel_number)}
                className={`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground scale-125 shadow-lg shadow-primary/30"
                    : ch.is_active
                    ? "bg-muted hover:bg-accent cursor-pointer text-foreground"
                    : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                }`}
                style={{ left: `${x}%`, top: `${y}%` }}
                disabled={!ch.is_active}
                title={ch.channel_name}
              >
                {ch.channel_number}
              </button>
            );
          })}

          {/* Center dial indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-20 h-20">
              {/* Dial knob */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
                <span className="text-2xl">{activeChannel?.icon || "📺"}</span>
              </div>
              {/* Indicator line */}
              <div
                className="absolute top-1/2 left-1/2 w-0.5 h-10 bg-primary origin-bottom transition-transform duration-500 ease-out"
                style={{
                  transform: `translate(-50%, -100%) rotate(${dialAngle}deg)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* HOFUND label */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <Badge variant="outline" className="bg-background text-xs font-mono tracking-widest">
            HOFUND
          </Badge>
        </div>
      </div>

      {/* Current channel info */}
      <div className="text-center space-y-1">
        <p className="text-lg font-bold text-foreground">
          CH {currentChannel}: {activeChannel?.channel_name || "Not Set"}
        </p>
        {activeChannel?.destination_url && (
          <p className="text-sm text-muted-foreground truncate max-w-xs">
            {activeChannel.destination_url}
          </p>
        )}
      </div>

      {/* Quick navigate */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChannelChange(Math.max(1, currentChannel - 1))}
          disabled={currentChannel <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChannelChange(Math.min(10, currentChannel + 1))}
          disabled={currentChannel >= 10}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CUE CARD PREVIEW
// ─────────────────────────────────────────────────────────

function CueCardPreview({
  template,
  memberQrUrl,
  customText,
  onCustomTextChange,
  onStamp,
  isStamped,
}: {
  template: CueCardTemplate;
  memberQrUrl: string;
  customText: string;
  onCustomTextChange: (text: string) => void;
  onStamp: () => void;
  isStamped: boolean;
}) {
  const styleClasses: Record<string, string> = {
    standard: "bg-gradient-to-br from-card to-muted/30",
    bold: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
    minimal: "bg-background",
    quote: "bg-gradient-to-br from-amber-50/10 to-amber-100/5 dark:from-amber-950/20 dark:to-amber-900/10",
  };

  return (
    <Card className={`overflow-hidden border-2 transition-all duration-300 ${
      isStamped ? "border-green-500/30 shadow-lg shadow-green-500/5" : "border-border hover:border-primary/20"
    }`}>
      <div className={`relative p-6 min-h-[280px] ${styleClasses[template.card_style] || styleClasses.standard}`}>
        {/* Card content */}
        <div className="space-y-3 pr-32">
          <h3 className="text-xl font-bold text-foreground">{template.title}</h3>
          {template.subtitle && (
            <p className="text-sm text-primary font-medium">{template.subtitle}</p>
          )}
          {isStamped ? (
            <Textarea
              value={customText}
              onChange={(e) => onCustomTextChange(e.target.value)}
              className="min-h-[80px] bg-transparent border-dashed resize-none text-sm"
              placeholder="Edit text before sharing..."
            />
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">{template.body_text}</p>
          )}
          {template.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.hashtags.map((tag) => (
                <span key={tag} className="text-xs text-primary/70">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* QR stamp zone */}
        <div className={`absolute ${
          template.qr_position === "bottom-right" ? "bottom-4 right-4" :
          template.qr_position === "bottom-left" ? "bottom-4 left-4" :
          template.qr_position === "top-right" ? "top-4 right-4" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        }`}>
          {isStamped ? (
            <div className="w-28 h-28 rounded-lg bg-white p-2 shadow-md border border-border flex flex-col items-center justify-center">
              <QRCodeSVG
                value={memberQrUrl}
                size={96}
                level="H"
                includeMargin={false}
              />
              <p className="text-[6px] text-center text-muted-foreground mt-0.5 font-mono">
                lianabanyan.com
              </p>
            </div>
          ) : (
            <button
              onClick={onStamp}
              className="w-28 h-28 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <QrCode className="w-8 h-8 text-primary/50" />
              <span className="text-xs text-primary/70 font-medium">Stamp QR</span>
            </button>
          )}
        </div>

        {/* Stamped badge */}
        {isStamped && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <Check className="w-3 h-3 mr-1" />
              Stamped
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────
// SOCIAL SHARE BUTTONS
// ─────────────────────────────────────────────────────────

function SocialShareBar({
  template,
  customText,
  shareUrl,
}: {
  template: CueCardTemplate;
  customText: string;
  shareUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const tweetText = encodeURIComponent(template.twitter_text || customText || template.body_text);
  const linkedInText = encodeURIComponent(template.linkedin_text || customText || template.body_text);
  const facebookText = encodeURIComponent(customText || template.body_text);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${facebookText}`,
  };

  const copyToClipboard = async () => {
    const fullText = `${customText || template.body_text}\n\n${shareUrl}`;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => window.open(shareLinks.twitter, "_blank", "width=600,height=400")}
      >
        <Twitter className="w-4 h-4" />
        X / Twitter
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => window.open(shareLinks.linkedin, "_blank", "width=600,height=600")}
      >
        <Linkedin className="w-4 h-4" />
        LinkedIn
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => window.open(shareLinks.facebook, "_blank", "width=600,height=400")}
      >
        <Facebook className="w-4 h-4" />
        Facebook
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied" : "Copy Text"}
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN HOFUND STUDIO PAGE
// ─────────────────────────────────────────────────────────

export default function HofundStudio() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<HofundChannel[]>([]);
  const [currentChannel, setCurrentChannel] = useState(4);
  const [templates, setTemplates] = useState<CueCardTemplate[]>([]);
  const [stampedCards, setStampedCards] = useState<Record<string, StampedCard>>({});
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"studio" | "settings">("studio");

  // Member's QR URL (their RedCarpet herald link)
  const memberQrUrl = user ? `https://lianabanyan.com/RedCarpet?herald=${user.id}` : "";

  useEffect(() => {
    if (user) {
      loadChannels();
      loadTemplates();
    }
  }, [user]);

  const loadChannels = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("hofund_channels")
      .select("*")
      .eq("user_id", user.id)
      .order("channel_number");

    if (error || !data || data.length === 0) {
      // Initialize default channels for new user
      const defaults = DEFAULT_CHANNELS.map((ch) => ({
        ...ch,
        user_id: user.id,
        medallion_id: null,
      }));

      const { data: inserted } = await supabase
        .from("hofund_channels")
        .insert(defaults)
        .select();

      setChannels((inserted as HofundChannel[]) || []);
    } else {
      setChannels(data as HofundChannel[]);
    }

    // Load dial position
    const { data: dialData } = await supabase
      .from("hofund_dial_position")
      .select("current_channel")
      .eq("user_id", user.id)
      .is("medallion_id", null)
      .single();

    if (dialData) {
      setCurrentChannel(dialData.current_channel);
    }

    setIsLoading(false);
  };

  const loadTemplates = async () => {
    const { data } = await supabase
      .from("cue_card_templates")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (data) {
      setTemplates(data as CueCardTemplate[]);
    }
  };

  const handleChannelChange = async (ch: number) => {
    setCurrentChannel(ch);

    if (!user) return;

    // Upsert dial position
    await supabase
      .from("hofund_dial_position")
      .upsert({
        user_id: user.id,
        medallion_id: null,
        current_channel: ch,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,medallion_id",
      });
  };

  const handleStamp = (templateId: string) => {
    setStampedCards((prev) => ({
      ...prev,
      [templateId]: {
        templateId,
        customText: templates.find((t) => t.id === templateId)?.body_text || "",
        qrDataUrl: memberQrUrl,
      },
    }));

    // Record the stamp in the database
    if (user) {
      supabase.from("stamped_cue_cards").insert({
        user_id: user.id,
        template_id: templateId,
        qr_data_url: memberQrUrl,
      });
    }

    toast.success("QR code stamped into cue card!");
  };

  const handleCustomText = (templateId: string, text: string) => {
    setCustomTexts((prev) => ({ ...prev, [templateId]: text }));
    setStampedCards((prev) => ({
      ...prev,
      [templateId]: { ...prev[templateId], customText: text },
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary" />
              Hofund Studio
            </h1>
            <p className="text-muted-foreground mt-1">
              Turn the dial. Pick a card. Stamp your QR. Share with the world.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={view === "studio" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("studio")}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Studio
            </Button>
            <Button
              variant={view === "settings" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("settings")}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Channels
            </Button>
          </div>
        </div>

        {view === "studio" ? (
          <div className="grid lg:grid-cols-[320px_1fr] gap-8">
            {/* LEFT: Hofund Dial */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <HofundDial
                    channels={channels}
                    currentChannel={currentChannel}
                    onChannelChange={handleChannelChange}
                  />
                </CardContent>
              </Card>

              {/* QR destination preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    Your QR Routes To
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground break-all font-mono bg-muted/50 p-3 rounded-lg">
                    {memberQrUrl}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Anyone who scans your QR code or clicks your cue card will land on your personalized RedCarpet page.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT: Cue Card Templates */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  Cue Card Templates
                </h2>
                <Badge variant="outline">
                  {templates.length} available
                </Badge>
              </div>

              {templates.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <QrCode className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No cue card templates available yet.</p>
                    <p className="text-sm mt-1">Templates will appear here when they're created.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {templates.map((template) => {
                    const isStamped = !!stampedCards[template.id];
                    const customText = customTexts[template.id] || template.body_text;

                    return (
                      <div key={template.id} className="space-y-3">
                        <CueCardPreview
                          template={template}
                          memberQrUrl={memberQrUrl}
                          customText={customText}
                          onCustomTextChange={(text) => handleCustomText(template.id, text)}
                          onStamp={() => handleStamp(template.id)}
                          isStamped={isStamped}
                        />

                        {/* Share buttons + export — only show after stamping */}
                        {isStamped && (
                          <div className="pl-2 space-y-3">
                            <p className="text-xs text-muted-foreground mb-2 font-medium">
                              Share this cue card:
                            </p>
                            <SocialShareBar
                              template={template}
                              customText={customText}
                              shareUrl={memberQrUrl}
                            />
                            <div className="flex gap-2 pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={async () => {
                                  try {
                                    await downloadCardImage({
                                      title: template.title,
                                      subtitle: template.subtitle || undefined,
                                      bodyText: customText,
                                      hashtags: template.hashtags,
                                      qrUrl: memberQrUrl,
                                      cardStyle: template.card_style as any,
                                    });
                                    toast.success("Card image downloaded!");
                                  } catch {
                                    toast.error("Failed to export card image");
                                  }
                                }}
                              >
                                <Download className="w-4 h-4" />
                                Download PNG
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={async () => {
                                  // Simple schedule: 1 hour from now
                                  const when = new Date(Date.now() + 60 * 60 * 1000);
                                  const platformChoice = prompt(
                                    "Schedule to which platform? (twitter / linkedin / facebook)",
                                    "twitter"
                                  );
                                  if (!platformChoice) return;
                                  const result = await schedulePost(
                                    platformChoice as any,
                                    customText + "\n\n" + memberQrUrl,
                                    when
                                  );
                                  if (result.success) {
                                    toast.success(`Scheduled for ${when.toLocaleString()}`);
                                  } else {
                                    toast.error("Failed to schedule post");
                                  }
                                }}
                              >
                                <Settings className="w-4 h-4" />
                                Schedule Post
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SETTINGS VIEW: Channel configuration */
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Channel Configuration
            </h2>
            <p className="text-muted-foreground mb-6">
              Configure where your QR code routes for each dial position.
              Channels 1-4 are defaults. Channels 5-10 are customizable.
            </p>

            {channels.map((channel) => (
              <Card key={channel.id || channel.channel_number} className={`${
                channel.channel_number === currentChannel ? "border-primary/30" : ""
              }`}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      channel.channel_number === currentChannel
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}>
                      {channel.channel_number}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{channel.icon}</span>
                        <span className="font-medium text-foreground">{channel.channel_name}</span>
                        {!channel.is_active && (
                          <Badge variant="outline" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      {channel.destination_url && (
                        <p className="text-xs text-muted-foreground truncate">{channel.destination_url}</p>
                      )}
                    </div>

                    {channel.channel_number >= 5 && (
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
