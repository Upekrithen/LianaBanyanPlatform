// Daily News — cooperative morning briefing page
// Data layer: src/lib/dailyNewsService.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Clock,
  Megaphone,
  Users,
  Trophy,
  Star,
  AlertTriangle,
  ShoppingBag,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CurrencyAmount } from "@/components/CreditSymbol";

import {
  type SlideType,
  type NewsSlide,
  type ShowcasePromotion,
  type MilestoneEntry,
  fetchDailySlides,
  fetchHeadlines,
  fetchShowcasePromotions,
  fetchMilestones,
} from "@/lib/dailyNewsService";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isLiveNow(): boolean {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  return h === 11 && m < 30;
}

function getCountdownToNext11AM(): string {
  const now = new Date();
  const target = new Date(now);
  target.setHours(11, 0, 0, 0);
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }
  const diff = target.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Slide gradient map
// ---------------------------------------------------------------------------

const SLIDE_GRADIENTS: Record<SlideType, string> = {
  ANNOUNCEMENT: "from-blue-900/80 via-blue-800/60 to-slate-900/80",
  FEATURED_PRODUCT: "from-amber-900/80 via-amber-800/60 to-slate-900/80",
  NEW_MEMBER: "from-emerald-900/80 via-emerald-800/60 to-slate-900/80",
  MILESTONE: "from-sky-900/80 via-sky-800/60 to-slate-900/80",
  SHOWCASE_PROMOTION: "from-purple-900/80 via-purple-800/60 to-slate-900/80",
  BREAKING_NEWS: "from-red-900/80 via-red-800/60 to-slate-900/80",
};

const SLIDE_ICONS: Record<SlideType, React.ReactNode> = {
  ANNOUNCEMENT: <Megaphone className="h-8 w-8" />,
  FEATURED_PRODUCT: <ShoppingBag className="h-8 w-8" />,
  NEW_MEMBER: <Users className="h-8 w-8" />,
  MILESTONE: <Trophy className="h-8 w-8" />,
  SHOWCASE_PROMOTION: <Star className="h-8 w-8" />,
  BREAKING_NEWS: <AlertTriangle className="h-8 w-8" />,
};

const SLIDE_LABELS: Record<SlideType, string> = {
  ANNOUNCEMENT: "Platform News",
  FEATURED_PRODUCT: "Featured Product",
  NEW_MEMBER: "New Member",
  MILESTONE: "Milestone",
  SHOWCASE_PROMOTION: "Showcase Spotlight",
  BREAKING_NEWS: "Breaking News",
};

// Compact icon variants for the widget
const SLIDE_ICONS_SM: Record<SlideType, React.ReactNode> = {
  ANNOUNCEMENT: <Megaphone className="h-5 w-5" />,
  FEATURED_PRODUCT: <ShoppingBag className="h-5 w-5" />,
  NEW_MEMBER: <Users className="h-5 w-5" />,
  MILESTONE: <Trophy className="h-5 w-5" />,
  SHOWCASE_PROMOTION: <Star className="h-5 w-5" />,
  BREAKING_NEWS: <AlertTriangle className="h-5 w-5" />,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LiveIndicator() {
  const [countdown, setCountdown] = useState(getCountdownToNext11AM());
  const [live, setLive] = useState(isLiveNow());

  useEffect(() => {
    const id = setInterval(() => {
      setLive(isLiveNow());
      if (!isLiveNow()) {
        setCountdown(getCountdownToNext11AM());
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (live) {
    return (
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
        <Badge variant="destructive" className="text-sm font-semibold tracking-wide animate-pulse">
          LIVE NOW
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-slate-400">
      <Clock className="h-4 w-4" />
      <span className="text-sm">Next broadcast: <span className="text-white font-mono font-semibold">{countdown}</span></span>
    </div>
  );
}

function SlideCard({ slide }: { slide: NewsSlide }) {
  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden bg-gradient-to-br ${SLIDE_GRADIENTS[slide.type]} border border-white/10 p-8 md:p-12 min-h-[320px] md:min-h-[380px] flex flex-col justify-between`}
    >
      {/* Type badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 text-white/90">
            {SLIDE_ICONS[slide.type]}
          </div>
          <Badge
            variant="secondary"
            className="bg-white/15 text-white/90 border-white/20 text-xs uppercase tracking-wider"
          >
            {SLIDE_LABELS[slide.type]}
          </Badge>
        </div>
        {slide.isSponsored && (
          <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/30 text-xs">
            Sponsored
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">
          {slide.title}
        </h2>
        <p className="text-base md:text-lg text-white/80 max-w-2xl leading-relaxed">
          {slide.subtitle}
        </p>

        {/* Product price */}
        {slide.type === "FEATURED_PRODUCT" && slide.price != null && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-amber-300">
              <CurrencyAmount amount={slide.price} size={18} />
            </span>
            {slide.storeName && (
              <span className="text-white/60 text-sm">from {slide.storeName}</span>
            )}
          </div>
        )}

        {/* Member info */}
        {slide.type === "NEW_MEMBER" && slide.joinDate && (
          <p className="mt-3 text-sm text-emerald-300/80">
            Joined {slide.joinDate}
          </p>
        )}

        {/* Milestone XP */}
        {slide.type === "MILESTONE" && slide.achievementXP && (
          <p className="mt-3 text-sm text-sky-300/80">
            {slide.achievementXP} XP earned
          </p>
        )}

        {/* Promotion store name */}
        {slide.type === "SHOWCASE_PROMOTION" && slide.storeName && (
          <p className="mt-3 text-sm text-purple-300/80">
            {slide.storeName}
          </p>
        )}
      </div>

      {/* CTA */}
      {slide.ctaLabel && (
        <div className="mt-6">
          <Button
            variant="secondary"
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20"
          >
            {slide.ctaLabel}
          </Button>
        </div>
      )}

      {/* Decorative element */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
    </div>
  );
}

function HeadlineCard({ slide }: { slide: NewsSlide }) {
  return (
    <Card className="bg-slate-800/60 border-slate-700/50 hover:border-slate-600/70 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-md bg-white/10 text-white/70 shrink-0 mt-0.5">
            {SLIDE_ICONS[slide.type]}
          </div>
          <div className="min-w-0">
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wider text-slate-400 border-slate-600 mb-2"
            >
              {SLIDE_LABELS[slide.type]}
            </Badge>
            <h3 className="font-semibold text-white text-sm leading-snug mb-1">
              {slide.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {slide.subtitle}
            </p>
            {slide.price != null && (
              <div className="mt-2 text-amber-400 text-sm font-medium">
                <CurrencyAmount amount={slide.price} size={12} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ShowcaseCard({ promo }: { promo: ShowcasePromotion }) {
  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-slate-800/60 border-purple-700/30 hover:border-purple-600/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
            {promo.isSponsored ? "Sponsored" : "Featured"}
          </Badge>
          {promo.price != null && (
            <span className="text-amber-300 font-semibold">
              <CurrencyAmount amount={promo.price} size={14} />
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">
          {promo.title}
        </h3>
        <p className="text-sm text-slate-400 mb-3">{promo.subtitle}</p>
        {promo.storeName && (
          <p className="text-xs text-purple-400">{promo.storeName}</p>
        )}
        {promo.ctaLabel && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-purple-500/40 text-purple-300 hover:bg-purple-500/20"
          >
            {promo.ctaLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Widget mode — embeddable on homepage or other pages
// ---------------------------------------------------------------------------

export function DailyNewsWidget() {
  const [slides, setSlides] = useState<NewsSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchDailySlides(new Date()).then(setSlides);
  }, []);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (slides.length === 0) return;
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[currentSlide];

  return (
    <Card className="bg-slate-900/80 border-slate-700/50 overflow-hidden">
      <CardContent className="p-0">
        <div
          className={`bg-gradient-to-br ${SLIDE_GRADIENTS[slide.type]} p-5`}
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                The Daily News
              </span>
            </div>
            <div className="flex items-center gap-1">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? "w-4 bg-amber-400"
                      : "w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Slide content */}
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-md bg-white/10 text-white/80 shrink-0">
              {SLIDE_ICONS_SM[slide.type]}
            </div>
            <div className="min-w-0 flex-1">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wider text-white/60 border-white/20 mb-1.5"
              >
                {SLIDE_LABELS[slide.type]}
              </Badge>
              <h3 className="font-semibold text-white text-sm leading-snug mb-1 line-clamp-1">
                {slide.title}
              </h3>
              <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
                {slide.subtitle}
              </p>
            </div>
          </div>

          {/* Link to full page */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <Link
              to="/daily-news"
              className="flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors group"
            >
              Watch The Daily News
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DailyNews() {
  const [slides, setSlides] = useState<NewsSlide[]>([]);
  const [headlines, setHeadlines] = useState<NewsSlide[]>([]);
  const [showcasePromos, setShowcasePromos] = useState<ShowcasePromotion[]>([]);
  const [milestones, setMilestones] = useState<MilestoneEntry[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [live, setLive] = useState(isLiveNow());
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSlides = slides.length;

  // Load data
  useEffect(() => {
    const today = new Date();
    fetchDailySlides(today).then(setSlides);
    fetchHeadlines(today).then(setHeadlines);
    fetchShowcasePromotions(today).then(setShowcasePromos);
    fetchMilestones(today).then(setMilestones);
  }, []);

  // Check live status
  useEffect(() => {
    const id = setInterval(() => setLive(isLiveNow()), 5000);
    return () => clearInterval(id);
  }, []);

  // Auto-advance when live
  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (live && totalSlides > 0) {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 8000);
    }
  }, [live, totalSlides]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [startAutoplay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    startAutoplay(); // Reset timer on manual navigation
  };

  const goPrev = () => {
    if (totalSlides === 0) return;
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
  };
  const goNext = () => {
    if (totalSlides === 0) return;
    goToSlide((currentSlide + 1) % totalSlides);
  };

  // Don't render carousel until slides are loaded
  if (slides.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading The Daily News...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Newspaper className="h-8 w-8 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              The Daily News
            </h1>
          </div>
          <p className="text-slate-400 text-sm md:text-base mb-4">
            Your cooperative morning briefing &mdash; live every day at 11 AM
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <LiveIndicator />
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="text-slate-400 text-sm">{formatDate()}</span>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Main Carousel                                                    */}
        {/* ---------------------------------------------------------------- */}
        <div className="relative mb-12">
          {/* Slide */}
          <div className="overflow-hidden rounded-xl">
            <SlideCard slide={slides[currentSlide]} />
          </div>

          {/* Prev / Next */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-10 w-10"
            onClick={goPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-10 w-10"
            onClick={goNext}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots & counter */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? "w-6 bg-amber-400"
                      : "w-2 bg-slate-600 hover:bg-slate-500"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 font-mono ml-2">
              {currentSlide + 1} of {totalSlides}
            </span>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Today's Headlines                                                */}
        {/* ---------------------------------------------------------------- */}
        {headlines.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Today&apos;s Headlines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {headlines.map((item) => (
                <HeadlineCard key={item.id} slide={item} />
              ))}
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Showcase Spotlight                                               */}
        {/* ---------------------------------------------------------------- */}
        {showcasePromos.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-400" />
              Showcase Spotlight
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showcasePromos.map((promo) => (
                <ShowcaseCard key={promo.id} promo={promo} />
              ))}
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* This Week's Milestones                                           */}
        {/* ---------------------------------------------------------------- */}
        {milestones.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-sky-400" />
              This Week&apos;s Milestones
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {milestones.map((m, i) => (
                <Card
                  key={i}
                  className="bg-sky-900/20 border-sky-700/30 hover:border-sky-600/50 transition-colors"
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-sky-500/20">
                      <Trophy className="h-6 w-6 text-sky-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{m.name}</h3>
                      <p className="text-xs text-sky-300">{m.achievement}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{m.xp} XP</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Want to be featured? CTA                                         */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-8">
          <Card className="bg-gradient-to-br from-amber-900/40 via-slate-800/60 to-purple-900/30 border-amber-700/30">
            <CardContent className="p-8 text-center">
              <Newspaper className="h-10 w-10 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Want to be featured?
              </h2>
              <p className="text-slate-400 mb-2 max-w-lg mx-auto">
                Showcase your store on The Daily News. Get your products,
                milestones, and grand openings in front of every cooperative
                member.
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-300 font-semibold mb-4">
                Starting at <CurrencyAmount amount={10} size={16} className="text-amber-300" /> per feature
              </div>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                Get Featured
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
