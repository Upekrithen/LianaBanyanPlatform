import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExpandableBlock, DataVizBar } from "@/components/pudding";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import {
  ArrowRight,
  Shield,
  Users,
  Coins,
  Lock,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Award,
  FileText,
  Heart,
  Scale,
  Lightbulb,
  Newspaper,
  UserPlus,
  QrCode,
  Share2,
} from "lucide-react";
import {
  findRecipientByEmail,
  findRecipientBySlug,
  findPressOutlet,
  getRecipientDomainHints,
  PLATFORM_STATS,
  type Recipient,
  type PressOutlet,
} from "@/data/redCarpetRecipients";
import { supabase } from "@/integrations/supabase/client";
import { recordClick, recordGhostClick, generateShareId } from "@/lib/cueCardClickTracking";
import { 
  resolveRedCarpetContext, 
  recordPromotionClick,
  type RedCarpetContext 
} from "@/lib/cueCardDestinationService";

import { LockedCrownLetterView } from "@/components/LockedCrownLetterView";

// ---------------------------------------------------------
// ENTRY MODES � How someone arrived at RedCarpet
// ---------------------------------------------------------

type EntryMode =
  | "email"        // Typed email on landing page
  | "slug"         // Direct link: /RedCarpet/michael-seibel
  | "herald"       // Herald/cue card: ?herald=MEMBER_ID
  | "cuecard"      // Cue card share: ?cue=SHARE_ID&template=TEMPLATE_ID&sharer=SHARER_ID
  | "referral"     // Referral code: ?ref=REF-XXXXX
  | "press"        // Press junket: ?press=techcrunch
  | "card"         // QR medallion scan: ?card=MEDALLION_ID
  | "unknown";     // Unrecognized / general visitor

interface HeraldInfo {
  memberName: string;
  memberSince: string;
  message?: string;
}

interface ReferralInfo {
  referrerName: string;
  creditAmount: number;
  referralCode: string;
}

interface CueCardClickInfo {
  shareId: string;
  templateId: string;
  sharerId: string;
  sharerName: string;
  templateTitle: string;
  clicksRecorded: number;
  locksUnlocked: number;
  isFullyUnlocked: boolean;
  platform: string;
}

// ---------------------------------------------------------
// ANIMATED SECTION COMPONENT
// ---------------------------------------------------------

function FadeInSection({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------
// STAT CARD
// ---------------------------------------------------------

function StatCard({
  icon: Icon,
  value,
  label,
  highlight = false,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 ${
        highlight
          ? "bg-primary/10 border-2 border-primary/30 shadow-lg shadow-primary/5"
          : "bg-card border border-border"
      }`}
    >
      <Icon
        className={`w-8 h-8 mx-auto mb-3 ${
          highlight ? "text-primary" : "text-muted-foreground"
        }`}
      />
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

// ---------------------------------------------------------
// CROWN JEWEL CARD
// ---------------------------------------------------------

function CrownJewelCard({
  number,
  name,
  description,
}: {
  number: number;
  name: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-bold text-primary">#{number}</span>
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{name}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// HERALD INVITATION BANNER
// ---------------------------------------------------------

function HeraldBanner({ herald }: { herald: HeraldInfo }) {
  return (
    <FadeInSection>
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-primary font-medium mb-1">
                  You were invited by
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  {herald.memberName}
                </h3>
                <p className="text-muted-foreground mt-1">
                  Member since {herald.memberSince}
                  {herald.message && ` � "${herald.message}"`}
                </p>
              </div>
              <div className="ml-auto flex-shrink-0">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  <Share2 className="w-3 h-3 mr-1" />
                  Herald Invitation
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </FadeInSection>
  );
}

// ---------------------------------------------------------
// CONTEXTUAL CONTENT DISPLAY (Innovation #1355-#1362)
// ---------------------------------------------------------

function ContextualContentDisplay({ context }: { context: RedCarpetContext }) {
  const { displayMode, heraldName, projects, categorySlug, isOwnProject, trustScore } = context;

  return (
    <FadeInSection>
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Herald banner with context info */}
          <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-primary font-medium mb-1">
                  {isOwnProject ? 'Shared by' : 'Promoted by'}
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  {heraldName}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {displayMode === 'single_project' && 'Showing you a specific project'}
                  {displayMode === 'project_chooser' && `Showing you ${projects.length} projects to explore`}
                  {displayMode === 'category_browse' && `Showing you ${categorySlug} projects`}
                  {displayMode === 'portfolio' && 'Showing you their full portfolio'}
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {trustScore >= 90 && (
                  <Badge variant="outline" className="border-green-500/30 text-green-600">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project display based on mode */}
          {displayMode === 'single_project' && projects.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-foreground">{projects[0].name}</h4>
                    {projects[0].description && (
                      <p className="text-muted-foreground mt-2">{projects[0].description}</p>
                    )}
                    <Button className="mt-4" asChild>
                      <a href={`/projects/${projects[0].id}`}>
                        View Project <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {displayMode === 'project_chooser' && projects.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">
                {heraldName} wants to show you these projects:
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-foreground">{project.name}</h5>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <Button variant="link" className="mt-2 p-0 h-auto" asChild>
                        <a href={`/projects/${project.id}`}>
                          Learn more <ArrowRight className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {displayMode === 'category_browse' && categorySlug && (
            <Card>
              <CardContent className="p-6 text-center">
                <h4 className="text-xl font-bold text-foreground mb-2">
                  Explore {categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} Projects
                </h4>
                <p className="text-muted-foreground mb-4">
                  {heraldName} is supporting projects in this category
                </p>
                <Button asChild>
                  <a href={`/initiatives?category=${categorySlug}`}>
                    Browse Category <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </FadeInSection>
  );
}

// ---------------------------------------------------------
// REFERRAL CREDIT BANNER
// ---------------------------------------------------------

function ReferralBanner({ referral }: { referral: ReferralInfo }) {
  return (
    <FadeInSection>
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-2 border-green-500/20 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <Coins className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium mb-1">
                  Referred by {referral.referrerName}
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  ${referral.creditAmount.toFixed(2)} in shared credits waiting
                </h3>
                <p className="text-muted-foreground mt-1">
                  Join and use code <code className="font-mono bg-muted px-2 py-0.5 rounded text-sm">{referral.referralCode}</code> to claim your matched credits toward a medallion.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </FadeInSection>
  );
}

// ---------------------------------------------------------
// PRESS LANDING BANNER
// ---------------------------------------------------------

function PressBanner({ outlet }: { outlet: PressOutlet }) {
  return (
    <FadeInSection>
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 text-base px-4 py-1.5 border-primary/30">
            <Newspaper className="w-4 h-4 mr-2" />
            Press Room
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Welcome, {outlet.name}.
          </h2>
          <p className="text-xl text-primary font-medium mb-4">
            {outlet.tagline}
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {outlet.angle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 h-14 px-8 text-lg rounded-xl">
              <FileText className="w-5 h-5" />
              Press Kit
            </Button>
            <Button size="lg" variant="outline" className="gap-2 h-14 px-8 text-lg rounded-xl"
              onClick={() => window.open("https://the2ndsecond.com/press/", "_blank")}>
              Full Press Room
              <ExternalLink className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </FadeInSection>
  );
}

// ---------------------------------------------------------
// CUE CARD CLICK BANNER � Shows click tracking progress
// ---------------------------------------------------------

function CueCardClickBanner({ info }: { info: CueCardClickInfo }) {
  const locksRemaining = 4 - info.locksUnlocked;
  const clicksPerLock = 5;
  const clicksToNextLock = clicksPerLock - (info.clicksRecorded % clicksPerLock);
  
  return (
    <FadeInSection>
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-2 border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Share2 className="w-8 h-8 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-purple-600 font-medium mb-1">
                    Shared by {info.sharerName}
                  </p>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {info.templateTitle}
                  </h3>
                  <p className="text-muted-foreground">
                    Your click helps unlock a Deck Card! 
                    {info.isFullyUnlocked 
                      ? " The card is now fully unlocked!" 
                      : ` ${locksRemaining} lock${locksRemaining !== 1 ? 's' : ''} remaining.`}
                  </p>
                  
                  {/* Progress visualization */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex gap-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div 
                          key={i}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                            i < info.locksUnlocked 
                              ? 'bg-purple-500/20 text-purple-500' 
                              : 'bg-muted/50 text-muted-foreground'
                          }`}
                        >
                          {i < info.locksUnlocked ? '??' : '??'}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {info.clicksRecorded} click{info.clicksRecorded !== 1 ? 's' : ''} recorded
                      {!info.isFullyUnlocked && ` � ${clicksToNextLock} more to unlock next`}
                    </div>
                  </div>
                  
                  {info.isFullyUnlocked && (
                    <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {info.sharerName} earned a Candle Burst reward thanks to shares like yours!
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Platform badge */}
              <div className="mt-4 flex justify-end">
                <Badge variant="outline" className="border-purple-500/30 text-purple-600">
                  via {info.platform === 'tiktok' ? 'TikTok' : 
                       info.platform === 'facebook' ? 'Facebook' :
                       info.platform === 'twitter' ? 'Twitter' :
                       info.platform === 'linkedin' ? 'LinkedIn' : 'Direct Link'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </FadeInSection>
  );
}

// ---------------------------------------------------------
// MEDALLION QR SCAN BANNER
// ---------------------------------------------------------

function MedallionScanBanner({ cardId }: { cardId: string }) {
  return (
    <FadeInSection>
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-2 border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-amber-600 font-medium mb-1">
                  Medallion Verified
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  You scanned an authentic Liana Banyan Medallion
                </h3>
                <p className="text-muted-foreground mt-1">
                  Card ID: <code className="font-mono bg-muted px-2 py-0.5 rounded text-sm">{cardId}</code> � This cue card was shared by a verified member.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </FadeInSection>
  );
}

// ---------------------------------------------------------
// MAIN RED CARPET PAGE � UNIVERSAL FRONT DOOR
// ---------------------------------------------------------

export default function RedCarpet() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();

  const [email, setEmail] = useState("");
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [pressOutlet, setPressOutlet] = useState<PressOutlet | null>(null);
  const [heraldInfo, setHeraldInfo] = useState<HeraldInfo | null>(null);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [cueCardClickInfo, setCueCardClickInfo] = useState<CueCardClickInfo | null>(null);
  const [medallionCardId, setMedallionCardId] = useState<string | null>(null);
  const [entryMode, setEntryMode] = useState<EntryMode>("unknown");
  const [showContent, setShowContent] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Contextual routing state (Innovation #1355-#1362)
  const [contextualContent, setContextualContent] = useState<RedCarpetContext | null>(null);

  // Verification state
  const [verificationStep, setVerificationStep] = useState<"email" | "code" | "verified">("email");
  const [verificationCode, setVerificationCode] = useState("");
  const [accessId, setAccessId] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null); // dev only
  const [domainMatched, setDomainMatched] = useState(false);

  // --- SILENT PAGE VIEW LOGGER ---
  const logPageView = async (mode: EntryMode, recipientData?: Recipient | null, extra?: Record<string, string | null>) => {
    try {
      await supabase.from("red_carpet_access").insert({
        entry_mode: mode,
        recipient_id: recipientData?.id || null,
        recipient_name: recipientData?.name || null,
        category: recipientData?.category || null,
        user_agent: navigator.userAgent,
        referrer_url: document.referrer || null,
        ...extra,
      });
    } catch (err) {
      console.error("RedCarpet log error:", err);
    }
  };

  // --- DETECT ENTRY MODE ON MOUNT ---
  useEffect(() => {
    // Priority 1: URL slug ? direct recipient link (TRUSTED � log silently)
    if (slug) {
      const found = findRecipientBySlug(slug);
      if (found) {
        setRecipient(found);
        setEntryMode("slug");
        setShowContent(true);
        logPageView("slug", found);
        return;
      }
    }

    // Priority 2: ?press=outlet ? press junket
    const pressParam = searchParams.get("press");
    if (pressParam) {
      const outlet = findPressOutlet(pressParam);
      if (outlet) {
        setPressOutlet(outlet);
        setEntryMode("press");
        setShowContent(true);
        logPageView("press", null, { press_outlet_id: outlet.id });
        return;
      }
    }

    // Priority 3: ?cue=SHARE_ID ? Cue Card share with click tracking
    const cueParam = searchParams.get("cue");
    const templateParam = searchParams.get("template");
    const sharerParam = searchParams.get("sharer");
    const platformParam = searchParams.get("platform") || "direct";
    
    if (cueParam && templateParam && sharerParam) {
      setEntryMode("cuecard");
      processCueCardClick(cueParam, templateParam, sharerParam, platformParam);
      setShowContent(true);
      logPageView("cuecard", null, { 
        share_id: cueParam, 
        template_id: templateParam, 
        sharer_id: sharerParam,
        platform: platformParam
      } as any);
      return;
    }

    // Priority 4: ?herald=MEMBER_ID ? cue card / social share
    // NEW: Also check for ?ctx=CONTEXT_ID for contextual routing
    const heraldParam = searchParams.get("herald");
    const ctxParam = searchParams.get("ctx");
    if (heraldParam) {
      setEntryMode("herald");
      if (ctxParam) {
        // Contextual routing � load destination-specific content
        loadContextualContent(heraldParam, ctxParam);
      } else {
        // Legacy � show full portfolio
        loadHeraldInfo(heraldParam);
      }
      setShowContent(true);
      logPageView("herald", null, { 
        herald_member_id: heraldParam,
        context_id: ctxParam || undefined
      } as any);
      return;
    }

    // Priority 5: ?ref=REFERRAL_CODE ? referral credit link
    const refParam = searchParams.get("ref");
    if (refParam) {
      setEntryMode("referral");
      loadReferralInfo(refParam);
      setShowContent(true);
      logPageView("referral", null, { referral_code: refParam });
      return;
    }

    // Priority 6: ?card=MEDALLION_ID ? QR medallion scan
    const cardParam = searchParams.get("card");
    if (cardParam) {
      setMedallionCardId(cardParam);
      setEntryMode("card");
      setShowContent(true);
      logPageView("card", null, { medallion_card_id: cardParam });
      return;
    }

    // Default: email entry mode
    setEntryMode("email");
  }, [slug, searchParams]);

  // --- PROCESS CUE CARD CLICK ---
  const processCueCardClick = async (
    shareId: string, 
    templateId: string, 
    sharerId: string,
    platform: string
  ) => {
    try {
      // Get current user (if logged in) or generate ghost ID
      const { data: { user } } = await supabase.auth.getUser();
      const clickerId = user?.id || null;
      const clickerGhostId = !user ? `ghost_${Date.now()}_${Math.random().toString(36).slice(2)}` : null;

      // Record the click
      const result = await recordClick({
        shareId,
        templateId,
        sharerId,
        clickerId: clickerId || undefined,
        clickerGhostId: clickerGhostId || undefined,
        platform: platform as any
      });

      // Get sharer info
      const { data: sharerProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", sharerId)
        .single();

      // Get template info
      const { data: template } = await supabase
        .from("cue_card_templates")
        .select("title")
        .eq("id", templateId)
        .single();

      setCueCardClickInfo({
        shareId,
        templateId,
        sharerId,
        sharerName: sharerProfile?.full_name || "A Liana Banyan Member",
        templateTitle: template?.title || "Cue Card",
        clicksRecorded: result.totalClicks || 1,
        locksUnlocked: result.locksUnlocked || 0,
        isFullyUnlocked: result.isFullyUnlocked || false,
        platform
      });

      // Also load herald info for display
      loadHeraldInfo(sharerId);

    } catch (err) {
      console.error("Error processing cue card click:", err);
      // Still show content even if click tracking fails
      loadHeraldInfo(sharerId);
    }
  };

  // --- LOAD HERALD (MEMBER) INFO ---
  const loadHeraldInfo = async (memberId: string) => {
    try {
      // Real table: profiles (id uuid, email, full_name, avatar_url, created_at, updated_at, last_active_at, activity_streak_days, total_transactions)
      const { data } = await supabase
        .from("profiles")
        .select("full_name, created_at")
        .eq("id", memberId)
        .single();

      if (data) {
        setHeraldInfo({
          memberName: data.full_name || "A Liana Banyan Member",
          memberSince: new Date(data.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
        });
      } else {
        setHeraldInfo({
          memberName: "A Liana Banyan Member",
          memberSince: "2026",
        });
      }
    } catch {
      setHeraldInfo({
        memberName: "A Liana Banyan Member",
        memberSince: "2026",
      });
    }
  };

  // --- LOAD CONTEXTUAL CONTENT (Innovation #1355-#1362) ---
  const loadContextualContent = async (heraldId: string, contextId: string) => {
    try {
      const context = await resolveRedCarpetContext(heraldId, contextId);
      
      if (context) {
        setContextualContent(context);
        setHeraldInfo({
          memberName: context.heraldName,
          memberSince: "Member", // Could fetch actual date if needed
        });
        
        // Record promotion attribution if not own project
        if (!context.isOwnProject && context.destination?.project_ids?.length) {
          const { data: { user } } = await supabase.auth.getUser();
          for (const projectId of context.destination.project_ids) {
            await recordPromotionClick(
              heraldId,
              projectId,
              contextId,
              {
                clickerId: user?.id,
                clickerGhostId: !user ? `ghost_${Date.now()}` : undefined,
                clickSource: 'qr_scan',
              }
            );
          }
        }
      } else {
        // Fallback to regular herald info
        loadHeraldInfo(heraldId);
      }
    } catch (err) {
      console.error("Error loading contextual content:", err);
      loadHeraldInfo(heraldId);
    }
  };

  // --- LOAD REFERRAL INFO ---
  const loadReferralInfo = async (refCode: string) => {
    try {
      // Real table: referrals (id, referrer_id, referred_email, referred_id, status, source_pool_id, referred_at, converted_at, created_at)
      const { data } = await supabase
        .from("referrals")
        .select("referrer_id, status")
        .eq("id", refCode)
        .eq("status", "pending")
        .single();

      if (data) {
        // Get referrer name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", data.referrer_id)
          .single();

        setReferralInfo({
          referrerName: profile?.full_name || "A Member",
          creditAmount: 10,
          referralCode: refCode,
        });
      } else {
        setReferralInfo({
          referrerName: "A Member",
          creditAmount: 10,
          referralCode: refCode,
        });
      }
    } catch {
      setReferralInfo({
        referrerName: "A Member",
        creditAmount: 10,
        referralCode: refCode,
      });
    }
  };

  // --- EMAIL SUBMIT HANDLER (with domain verification) ---
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSearching(true);
    setVerificationError(null);

    // Check for domain match
    const found = findRecipientByEmail(email);

    if (found) {
      // DOMAIN MATCHED � Send verification code
      setRecipient(found);
      setDomainMatched(true);

      try {
        const domain = email.toLowerCase().split("@")[1];
        const response = await supabase.functions.invoke("red-carpet-verify", {
          body: {
            action: "send-code",
            email: email.toLowerCase().trim(),
            domain,
            recipientId: found.id,
            recipientName: found.name,
            category: found.category,
          },
        });

        if (response.error) throw response.error;

        const data = response.data;
        setAccessId(data.accessId);
        setVerificationStep("code");

        // In dev mode, show the code for testing
        if (data.devCode) {
          setDevCode(data.devCode);
        }
      } catch (err) {
        console.error("Verification send error:", err);
        // Fallback: show content anyway but log the attempt
        setEntryMode("email");
        setShowContent(true);
        logPageView("email", found, { email: email.toLowerCase(), domain: email.split("@")[1] });
      }
    } else {
      // NO DOMAIN MATCH � General visitor, show content immediately
      setEntryMode("unknown");
      setShowContent(true);
      logPageView("unknown", null, { email: email.toLowerCase(), domain: email.split("@")[1] });
    }

    setIsSearching(false);
  };

  // --- VERIFICATION CODE SUBMIT ---
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim() || !accessId) return;

    setIsSearching(true);
    setVerificationError(null);

    try {
      const response = await supabase.functions.invoke("red-carpet-verify", {
        body: {
          action: "verify-code",
          accessId,
          code: verificationCode.trim(),
        },
      });

      if (response.error) throw response.error;

      const data = response.data;

      if (data.verified) {
        // SUCCESS
        setVerificationStep("verified");
        setEntryMode("email");
        setShowContent(true);
        setDevCode(null);

        setTimeout(() => {
          contentRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else if (data.error) {
        setVerificationError(data.error);
      }
    } catch (err: any) {
      const errorBody = err?.message || "Verification failed. Please try again.";
      setVerificationError(errorBody);
    }

    setIsSearching(false);
  };

  // --- SHAREABLE URL GENERATOR ---
  const getShareableUrl = () => {
    if (recipient) return `https://lianabanyan.com/RedCarpet/${recipient.id}`;
    return "https://lianabanyan.com/RedCarpet";
  };

  // Should we show the email form? Only in default email mode before submission
  const showEmailForm = entryMode === "email" && !showContent;
  // Should we show the hero at all? Not for direct modes that skip to content
  const showHero = entryMode === "email" || entryMode === "unknown";

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* --------------------------------------------------- */}
      {/* HERO SECTION � THE ENTRANCE                        */}
      {/* --------------------------------------------------- */}
      {showHero && (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Your personalized walkthrough awaits
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight mb-4">
                Liana Banyan
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-light">
                Member-owned. Community-governed. Cost + 20% locked forever.
              </p>
            </div>

            {/* Email input � Step 1: Enter email */}
            {showEmailForm && verificationStep === "email" && (
              <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your work email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 text-lg px-6 rounded-xl border-2 border-border focus:border-primary/50 bg-card/80 backdrop-blur"
                    disabled={isSearching}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg rounded-xl gap-2"
                  disabled={isSearching || !email.trim()}
                >
                  {isSearching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Preparing your walkthrough...
                    </>
                  ) : (
                    <>
                      Begin
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  No account required. Just enter your email and we'll show you what we built.
                </p>
              </form>
            )}

            {/* Verification code � Step 2: Domain matched, enter code */}
            {verificationStep === "code" && domainMatched && (
              <div className="max-w-md mx-auto space-y-6">
                <div className="p-6 rounded-xl bg-card/80 backdrop-blur border-2 border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">We recognize your organization.</p>
                      <p className="text-sm text-muted-foreground">
                        We've prepared something special for {recipient?.name || "you"}.
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    A verification code has been sent to <span className="font-medium text-foreground">{email}</span>.
                    Enter it below to continue.
                  </p>

                  {/* Domain hint for recipients with multiple recognized domains */}
                  {recipient && getRecipientDomainHints(recipient) && (
                    <p className="text-xs text-muted-foreground/80 mb-4 p-2 rounded bg-muted/30">
                      We recognize addresses from: <span className="font-medium">{getRecipientDomainHints(recipient)}</span>
                    </p>
                  )}

                  <form onSubmit={handleCodeSubmit} className="space-y-3">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value.replace(/\D/g, ""));
                        setVerificationError(null);
                      }}
                      className="h-14 text-2xl text-center tracking-[0.5em] font-mono rounded-xl border-2 border-border focus:border-primary/50"
                      disabled={isSearching}
                      autoFocus
                    />

                    {verificationError && (
                      <div className="text-center space-y-1">
                        <p className="text-sm text-destructive">{verificationError}</p>
                        <p className="text-xs text-muted-foreground">
                          Need help? Contact{" "}
                          <a href="mailto:Founder@LianaBanyan.com" className="underline">Founder@LianaBanyan.com</a>
                          {" "}or call{" "}
                          <a href="tel:+14065781232" className="underline">406-578-1232</a>
                        </p>
                      </div>
                    )}

                    {devCode && (
                      <p className="text-xs text-amber-500 text-center bg-amber-500/10 rounded-lg p-2">
                        Dev mode � code: <span className="font-mono font-bold">{devCode}</span>
                      </p>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 text-lg rounded-xl gap-2"
                      disabled={isSearching || verificationCode.length !== 6}
                    >
                      {isSearching ? (
                        <>
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Continue
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>

                  <button
                    onClick={() => {
                      setVerificationStep("email");
                      setVerificationCode("");
                      setVerificationError(null);
                      setDevCode(null);
                      setEmail("");
                      setDomainMatched(false);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground mt-3 underline"
                  >
                    Use a different email
                  </button>

                  {/* Show recognized domains as a hint */}
                  {recipient && getRecipientDomainHints(recipient) && (
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      Recognized domains: {getRecipientDomainHints(recipient)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Scroll indicator */}
            {!showContent && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <ChevronDown className="w-6 h-6 text-muted-foreground/50" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* --------------------------------------------------- */}
      {/* CONTEXTUAL BANNERS � Based on entry mode            */}
      {/* --------------------------------------------------- */}
      {showContent && (
        <div ref={contentRef} className="pb-24">

          {/* Cue Card click tracking banner */}
          {entryMode === "cuecard" && cueCardClickInfo && (
            <CueCardClickBanner info={cueCardClickInfo} />
          )}

          {/* Contextual content display (Innovation #1355-#1362) */}
          {entryMode === "herald" && contextualContent && (
            <ContextualContentDisplay context={contextualContent} />
          )}

          {/* Herald invitation banner (legacy, or when cue card info not available) */}
          {entryMode === "herald" && heraldInfo && !contextualContent && (
            <HeraldBanner herald={heraldInfo} />
          )}
          
          {/* Also show herald banner for cuecard mode if we have the info */}
          {entryMode === "cuecard" && heraldInfo && !cueCardClickInfo && (
            <HeraldBanner herald={heraldInfo} />
          )}

          {/* Referral credit banner */}
          {entryMode === "referral" && referralInfo && (
            <ReferralBanner referral={referralInfo} />
          )}

          {/* Press outlet banner */}
          {entryMode === "press" && pressOutlet && (
            <PressBanner outlet={pressOutlet} />
          )}

          {/* Medallion QR scan banner */}
          {entryMode === "card" && medallionCardId && (
            <MedallionScanBanner cardId={medallionCardId} />
          )}

          {/* --- WELCOME BANNER (Recipient or General) --- */}
          {entryMode !== "press" && (
            <FadeInSection>
              <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                  {recipient ? (
                    <>
                      <Badge variant="outline" className="mb-6 text-base px-4 py-1.5 border-primary/30">
                        <span className="mr-2">{recipient.icon}</span>
                        {recipient.categoryLabel}
                      </Badge>
                      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        {entryMode === "slug"
                          ? `Welcome, ${recipient.name.split(" ")[0]}.`
                          : `We've been expecting you, ${recipient.name.split(" ")[0]}.`}
                      </h2>
                      {recipient.crownTitle && (
                        <p className="text-xl text-primary font-medium mb-4">
                          {recipient.crownTitle} � {recipient.initiative?.name}
                        </p>
                      )}
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {recipient.whyYou}
                      </p>
                    </>
                  ) : (
                    <>
                      <Badge variant="outline" className="mb-6 text-base px-4 py-1.5 border-primary/30">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Welcome
                      </Badge>
                      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        {entryMode === "herald"
                          ? "Someone believes you belong here."
                          : entryMode === "referral"
                          ? "You've been invited to something real."
                          : entryMode === "card"
                          ? "You found us."
                          : "We'd love to meet you."}
                      </h2>
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {entryMode === "herald"
                          ? "A Liana Banyan member shared this with you because they think you'd value what we're building. Here's what it is and why it matters."
                          : entryMode === "referral"
                          ? `Someone shared credits with you � real value on a cooperative platform. Join, use the code, and you'll both earn toward a medallion. Here's what you're joining.`
                          : entryMode === "card"
                          ? "You scanned a real Liana Banyan medallion. That means someone in your world is already part of this. Here's what they're part of."
                          : "We don't recognize that email yet � but that doesn't mean you're not important. Here's what we're building and why it matters."}
                      </p>
                    </>
                  )}
                </div>
              </section>
            </FadeInSection>
          )}

          {/* --- INITIATIVE SPOTLIGHT (if recipient has one) --- */}
          {recipient?.initiative && (
            <FadeInSection delay={200}>
              <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto">
                  <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardContent className="p-8 md:p-12">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Award className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">
                            {recipient.initiative.name}
                          </h3>
                          <p className="text-primary font-medium">
                            {recipient.initiative.tagline}
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {recipient.initiative.description}
                      </p>
                      {recipient.crownTitle && (
                        <div className="mt-6 p-4 rounded-lg bg-background/50 border border-border">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Your role:</span>{" "}
                            As {recipient.crownTitle}, you would lead this initiative �
                            setting vision, guiding strategy, and ensuring it serves the
                            community it was built for. One Crown, One Offer, One Leader.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </section>
            </FadeInSection>
          )}

          {/* --- THE LITTLE RED HEN (Press/Red Carpet Metaphor) --- */}
          <FadeInSection delay={250}>
            <section className="py-16 px-6">
              <div className="max-w-4xl mx-auto">
                <Card className="overflow-hidden border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
                  <CardContent className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="flex-1 space-y-4">
                        <Badge variant="outline" className="text-orange-500 border-orange-500/30">
                          The Core Philosophy
                        </Badge>
                        <h3 className="text-3xl font-bold text-foreground">
                          The Little Red Hen
                        </h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          "Who will help me plant the seed? Who will help me harvest the wheat? Who will help me bake the bread?"
                        </p>
                        <p className="text-muted-foreground">
                          In the old story, the hen does all the work while the others watch, but they all want to eat the bread. 
                          On this platform, the rules are different. <strong>If you help bake the bread, you get to eat the bread.</strong>
                        </p>
                        <p className="text-muted-foreground">
                          That is why the creator/worker keeps <strong>83.3%</strong>. That is why the platform margin is locked at <strong>Cost + 20%</strong>. 
                          We built an economic engine that structurally prevents extraction and rewards the people actually doing the work.
                        </p>
                      </div>
                      <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 bg-orange-500/10 rounded-xl border border-orange-500/20 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
                          <div className="text-5xl font-bold text-orange-500">83.3%</div>
                          <div className="text-xs font-mono text-orange-400/80 text-center px-4">Creator/Worker share<br/>locked forever</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </FadeInSection>

          {/* --- THE ECONOMICS --- */}
          <FadeInSection delay={300}>
            <section className="py-16 px-6 bg-card/30">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-foreground mb-3">
                    The Economics That Cannot Change
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    These numbers are constitutionally locked by DNA Lock � no vote, no board, no CEO can ever alter them.
                  </p>
                </div>

                {/* Visual Data Bar */}
                <div className="mb-8">
                  <DataVizBar
                    title="Revenue Distribution"
                    subtitle="How every dollar is split � locked forever"
                    data={[
                      { label: 'creator/worker keeps', value: 83.3, color: '#22c55e', icon: '??' },
                      { label: 'Platform margin', value: 16.7, color: '#f97316', icon: '???' }
                    ]}
                    maxValue={100}
                    showPercentages={true}
                    height={32}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  <StatCard icon={Coins} value={PLATFORM_STATS.creatorKeeps} label="creator/worker keeps" highlight />
                  <StatCard icon={Lock} value={PLATFORM_STATS.platformMargin} label="Platform margin" highlight />
                  <StatCard icon={Users} value={PLATFORM_STATS.membership} label="Annual membership" />
                  <StatCard icon={Heart} value={String(PLATFORM_STATS.initiatives)} label="Charitable initiatives" />
                </div>

                {/* Expandable transaction breakdown */}
                <ExpandableBlock
                  title="How it works on a $500 transaction"
                  subtitle="Click to see the exact breakdown"
                  preview="Creator/Worker receives $416.67 (83.3%), Platform keeps $83.33..."
                  accentColor="#22c55e"
                >
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-green-500/10">
                      <div className="text-2xl font-bold text-green-600">$416.67</div>
                      <div className="text-sm text-muted-foreground">Creator/Worker receives (83.3%)</div>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-500/10">
                      <div className="text-2xl font-bold text-orange-600">$83.33</div>
                      <div className="text-sm text-muted-foreground">Platform margin (Cost + 20%)</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-foreground">$0.00</div>
                      <div className="text-sm text-muted-foreground">Hidden fees, forever</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    This split is protected by <strong>DNA Lock</strong> � a constitutional mechanism that makes these percentages 
                    immutable. No vote, no board decision, no CEO can ever change them.
                  </p>
                </ExpandableBlock>
              </div>
            </section>
          </FadeInSection>

          {/* --- THREE WEBSITES --- */}
          <FadeInSection delay={100}>
            <section className="py-16 px-6">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-foreground mb-3">
                    Three Commercial Websites Fund Sixteen Charitable Initiatives
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    A baked-in 20% "Cost of Doing Good" margin. No donations required. Commerce funds community.
                  </p>
                </div>

                <div className="space-y-4">
                  <ExpandableBlock
                    title="?? LianaBanyan.com � The Marketplace"
                    subtitle="Creators sell, members buy. 83.3% to creators and workers, always."
                    preview="Click to learn about the cooperative marketplace..."
                    accentColor="#22c55e"
                  >
                    <p className="text-muted-foreground mb-4">
                      The main platform where creators list products and services at Cost + 20%. Every transaction 
                      guarantees 83.3% goes directly to the creator � no hidden fees, no surprise deductions.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>Physical products, digital goods, and services</li>
                      <li>Transparent pricing on every listing</li>
                      <li>Built-in reputation and medallion system</li>
                      <li>Cooperative membership � members participate in the platform</li>
                    </ul>
                  </ExpandableBlock>

                  <ExpandableBlock
                    title="?? LianaBanyan.net � The Network"
                    subtitle="People and portfolios connecting � like LinkedIn, but cooperative."
                    preview="Click to learn about the professional network..."
                    accentColor="#3b82f6"
                  >
                    <p className="text-muted-foreground mb-4">
                      A professional network where your reputation is portable and your data belongs to you. 
                      Connect with other members, showcase your work, and find opportunities.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>Portable reputation across the platform</li>
                      <li>No algorithmic manipulation of your feed</li>
                      <li>Your data stays yours � export anytime</li>
                      <li>Guild and tribe connections</li>
                    </ul>
                  </ExpandableBlock>

                  <ExpandableBlock
                    title="?? LianaBanyan.biz � The Business Portal"
                    subtitle="Organizations connecting with cooperative infrastructure."
                    preview="Click to learn about business integration..."
                    accentColor="#8b5cf6"
                  >
                    <p className="text-muted-foreground mb-4">
                      For businesses that want to participate in the cooperative economy. Access wholesale 
                      pricing, connect with suppliers, and integrate with the platform's infrastructure.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>B2B marketplace with Cost + 20% pricing</li>
                      <li>Supplier and vendor connections</li>
                      <li>API access for integration</li>
                      <li>Bulk purchasing coordination</li>
                    </ul>
                  </ExpandableBlock>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">+ LianaBanyan.org</span> � The charitable portal. 
                    Where the 20% margin goes to work across 16 initiatives.
                  </p>
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* BEACON MECHANISM SECTION */}
          <FadeInSection delay={100}>
            <section className="py-16 px-6 bg-amber-950/20 border-y border-amber-500/20">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 mb-6">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-amber-400">Map Your Own Path</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  For Academics, Press, and the Curious: Map your own path for others to reference and follow using our Beacon Mechanism.
                </p>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="p-6 bg-card rounded-xl border border-border">
                    <div className="text-2xl mb-3">??</div>
                    <h3 className="font-bold text-lg mb-2">Drop Beacons</h3>
                    <p className="text-sm text-muted-foreground">
                      As you explore the 2,007+ innovations and 16 initiatives, drop beacons to mark your place. Like fireflies in the forest, they guide your way back.
                    </p>
                  </div>
                  <div className="p-6 bg-card rounded-xl border border-border">
                    <div className="text-2xl mb-3">??</div>
                    <h3 className="font-bold text-lg mb-2">Link Implementations</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Every academic paper, patent claim, and UI component is linked. Follow the breadcrumbs from the theoretical architecture directly to the working code.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate('/papers')} className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Academic Papers
                    </Button>
                  </div>
                  <div className="p-6 bg-card rounded-xl border border-border">
                    <div className="text-2xl mb-3">???</div>
                    <h3 className="font-bold text-lg mb-2">Share Your Map</h3>
                    <p className="text-sm text-muted-foreground">
                      Publish your beacon trail. Let your readers, students, or colleagues follow your exact path through the Yggdrasil architecture.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* --- PATENT PORTFOLIO --- */}
          <FadeInSection delay={100}>
            <section className="py-16 px-6 bg-card/30">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-foreground mb-3">
                    {PLATFORM_STATS.innovations} Innovations. 8 With No Prior Art.
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    We deep-dived 130 innovations against the U.S. Patent Office. Eight survived with zero relevant prior art. These are the Crown Jewels.
                  </p>
                </div>

                {/* Stats first for context */}
                <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={Lightbulb} value={PLATFORM_STATS.innovations} label="Total innovations" />
                  <StatCard icon={Shield} value={String(PLATFORM_STATS.crownJewels)} label="Crown Jewels" highlight />
                  <StatCard icon={FileText} value={String(PLATFORM_STATS.plannedFilings)} label="Planned filings" />
                  <StatCard icon={Award} value={PLATFORM_STATS.portfolioValue} label="Portfolio value" />
                </div>

                {/* Crown Jewels as expandable blocks */}
                <ExpandableBlock
                  title="?? The 8 Crown Jewel Patents"
                  subtitle="Zero prior art found � completely novel innovations"
                  preview="PPP/Economic Equity Differential, Seedling Guarantee, Tereno Hydraulic, The 300 Framework..."
                  accentColor="#eab308"
                  defaultExpanded={false}
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <CrownJewelCard number={1} name="PPP / Economic Equity Differential" description="Three-tier currency with global purchasing power parity adjustment. No existing system combines these." />
                    <CrownJewelCard number={2} name="Seedling Guarantee" description="Crowdfunding with guarantee protection and cascade attribution. No platform offers this." />
                    <CrownJewelCard number={3} name="Tereno Hydraulic" description="Water-powered physical computing platform with digital state sync. Physics and imagination." />
                    <CrownJewelCard number={4} name="The 300 Framework" description="Hard-coded organization size limits with overflow mechanics. Governance by design, not policy." />
                    <CrownJewelCard number={5} name="DNA Lock" description="Immutable constitutional economics. No vote can change Cost+20% or 83.3%. Ever." />
                    <CrownJewelCard number={6} name="Steward / Red Queen" description="Dual governance: rotating executive + permanent constitutional guardian." />
                    <CrownJewelCard number={7} name="Boaz Principle" description="Biblical gleaning economics applied to digital platforms. Mandatory surplus sharing." />
                    <CrownJewelCard number={8} name="Harbor Defense" description="Copyleft mechanism for patents. Defensive patent pool with automatic grant-back." />
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-yellow-600">Why "Crown Jewels"?</strong> These 8 innovations had zero relevant prior art 
                      in USPTO searches. They represent genuinely novel approaches that no one has patented before.
                    </p>
                  </div>
                </ExpandableBlock>
              </div>
            </section>
          </FadeInSection>

          {/* --- THE GOLDEN KEY --- */}
          <FadeInSection delay={100}>
            <section className="py-16 px-6">
              <div className="max-w-3xl mx-auto text-center">
                <div className="text-5xl mb-6">???</div>
                <h3 className="text-3xl font-bold text-foreground mb-4">The Golden Key</h3>
                <blockquote className="text-2xl md:text-3xl text-foreground font-light italic leading-relaxed mb-6">
                  "Help each other help ourselves."
                </blockquote>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Every decision � Cost+20%, 83.3% to creators and workers, DNA Lock, The 300, all 16 initiatives � flows from this single principle. It's not a slogan. It's the architectural specification.
                </p>
              </div>
            </section>
          </FadeInSection>

          {/* --- THE FOUNDER --- */}
          <FadeInSection delay={100}>
            <section className="py-16 px-6 bg-card/30">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-foreground mb-4">37 Years in the Making</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    Built by a 53-year-old ARNG veteran (Infantry + Aviation), father of eight, with 21 years in IT development. 
                    This system has been in development since 1989 � not as software, but as a philosophy.
                  </p>
                </div>

                <div className="space-y-4">
                  <ExpandableBlock
                    title="??? The Founder's Background"
                    subtitle="ARNG veteran, pilot, developer, father of eight"
                    preview="FAA Commercial Rotary Wing IFR rating, Chess top 0.4% globally..."
                    accentColor="#22c55e"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Military & Aviation</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>� U.S. Army Infantry (11B)</li>
                          <li>� U.S. Army Aviation (15A)</li>
                          <li>� FAA Commercial Rotary Wing IFR</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Professional</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>� 21 years IT development</li>
                          <li>� Chess: top 0.4% globally (2080s rating)</li>
                          <li>� Father of eight children</li>
                        </ul>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Funded with half a family's emergency savings. No VC. No angels. No strings. 
                      Just a man who prays for potatoes at the end of a hoe handle.
                    </p>
                  </ExpandableBlock>

                  <ExpandableBlock
                    title="??? Legal Entity & Structure"
                    subtitle="Corporation with constitutional protections"
                    preview="LIANA BANYAN CORPORATION � Legal structure details..."
                    accentColor="#3b82f6"
                  >
                    <div className="p-4 rounded-lg bg-background border border-border mb-4">
                      <div className="text-sm text-muted-foreground mb-1">Legal Entity</div>
                      <div className="font-semibold text-foreground">LIANA BANYAN CORPORATION</div>
                      <div className="text-sm text-muted-foreground">Cooperative Commerce Corporation</div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Wyoming was chosen for its strong corporate privacy protections and business-friendly environment. 
                      The C-Corp structure allows for future cooperative conversion while maintaining constitutional protections.
                    </p>
                  </ExpandableBlock>

                  <ExpandableBlock
                    title="?? The Sweet Sixteen Initiatives"
                    subtitle="16 charitable initiatives funded by the 20% margin"
                    preview="Let's Make Dinner, Let's Get Groceries, Defense Klaus, Rally Group..."
                    accentColor="#8b5cf6"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm"><strong>Food & Home:</strong> Let's Make Dinner, Let's Get Groceries, Let's Go Shopping, Household Concierge, The Family Table</div>
                        <div className="text-sm"><strong>Health:</strong> Tatiana Schlossburg Health Accords, MSA</div>
                        <div className="text-sm"><strong>Protection:</strong> Defense Klaus ("For Someone You Love")</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm"><strong>Community:</strong> Rally Group, VSL, Let's Make Bread</div>
                        <div className="text-sm"><strong>Creative:</strong> Harper Guild, JukeBox</div>
                        <div className="text-sm"><strong>Education:</strong> Didasko (Academic)</div>
                        <div className="text-sm"><strong>Growth:</strong> International, Brass Tacks</div>
                      </div>
                    </div>
                  </ExpandableBlock>

                  <div className="p-4 rounded-lg bg-background border border-border text-center">
                    <div className="text-sm text-muted-foreground mb-2">Full Documentation</div>
                    <a
                      href="/cephas/under-the-hood"
                      className="text-primary hover:underline flex items-center gap-1 justify-center"
                    >
                      Cephas � Under the Hood
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      105 technical documents. Everything is transparent. Everything is public.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </FadeInSection>

          {/* --- CALL TO ACTION � Context-sensitive --- */}
          <FadeInSection delay={100}>
            <section className="py-20 px-6">
              <div className="max-w-4xl mx-auto">
                {recipient?.category === "crown" ? (
                  <LockedCrownLetterView recipientId={recipient.id} />
                ) : recipient ? (
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-foreground mb-4">
                      {recipient.name.split(" ")[0]}, this was built for you.
                    </h3>
                    <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                      {recipient.category === "journalist"
                        ? "This is the platform story you've been waiting to write. Reply to the letter and we'll give you everything � numbers, patents, architecture, the founder's story. On the record."
                        : recipient.category === "academic"
                        ? "Your research validates what we've built. Reply to the letter and we'll share our academic papers, patent research, and full data set. Peer review welcome."
                        : recipient.category === "blessing"
                        ? "You don't need to run anything. Just know we're building this with the same spirit you've lived your whole life. If it resonates, a word from you means more than you know."
                        : "Reply to the letter. No scheduling, no salespeople. Just the economics, the architecture, and your hardest questions answered."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button size="lg" className="gap-2 h-14 px-8 text-lg rounded-xl">
                        <Heart className="w-5 h-5" />
                        Reply to Your Letter
                      </Button>
                      <Button size="lg" variant="outline" className="gap-2 h-14 px-8 text-lg rounded-xl"
                        onClick={() => window.open("https://the2ndsecond.com/under-the-hood/", "_blank")}>
                        Explore Everything
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-foreground mb-4">
                      {entryMode === "herald" || entryMode === "referral" || entryMode === "card"
                        ? "Ready to join?"
                        : "See yourself in this?"}
                    </h3>
                    <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                      {entryMode === "referral" && referralInfo
                        ? `Join now and use code ${referralInfo.referralCode} to claim $${referralInfo.creditAmount.toFixed(2)} in shared credits. Membership is $5/year.`
                        : "We're looking for people who want to help each other help ourselves. Membership is $5/year. No gatekeeping. No extraction. Just community."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button size="lg" className="gap-2 h-14 px-8 text-lg rounded-xl"
                        onClick={() => navigate("/ghost")}>
                        ?? Explore First
                      </Button>
                      <Button size="lg" variant="outline" className="gap-2 h-14 px-8 text-lg rounded-xl"
                        onClick={() => openOnboard({ reason: "join Liana Banyan", actionLabel: "Join", membershipIncluded: true })}>
                        <Users className="w-5 h-5" />
                        {entryMode === "referral" ? "Join & Claim Credits" : "Join for $5/year"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      No account needed to explore. Browse everything. Find Golden Keys. Join when you're ready.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </FadeInSection>

          {/* --- FOOTER --- */}
          <footer className="py-8 px-6 border-t border-border">
            <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
              <p className="mb-2">LIANA BANYAN CORPORATION</p>
              <p>
                {PLATFORM_STATS.innovations} innovations � {PLATFORM_STATS.crownJewels} Crown Jewel patents �{" "}
                {PLATFORM_STATS.initiatives} charitable initiatives � {PLATFORM_STATS.creatorKeeps} to creators and workers
              </p>
              <p className="mt-4 text-xs text-muted-foreground/60">"Help each other help ourselves."</p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
