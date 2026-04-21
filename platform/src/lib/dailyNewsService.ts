// ---------------------------------------------------------------------------
// Daily News Service
// Supabase-backed data layer for The Daily News page.
// Falls back to sample data when DB returns empty or errors.
// ---------------------------------------------------------------------------

import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SlideType =
  | "ANNOUNCEMENT"
  | "FEATURED_PRODUCT"
  | "NEW_MEMBER"
  | "MILESTONE"
  | "SHOWCASE_PROMOTION"
  | "BREAKING_NEWS";

export interface NewsSlide {
  id: number;
  type: SlideType;
  title: string;
  subtitle: string;
  price?: number;
  storeName?: string;
  memberName?: string;
  joinDate?: string;
  achievementXP?: string;
  isSponsored?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface ShowcasePromotion {
  id: number;
  storeName: string;
  title: string;
  subtitle: string;
  price?: number;
  isSponsored: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface MilestoneEntry {
  name: string;
  achievement: string;
  xp: string;
}

// ---------------------------------------------------------------------------
// Sample data (will be replaced by Supabase queries)
// ---------------------------------------------------------------------------

export const SAMPLE_SLIDES: NewsSlide[] = [
  {
    id: 1,
    type: "ANNOUNCEMENT",
    title: "Welcome to Launch Night!",
    subtitle:
      "The cooperative is officially open. Every journey starts with a single step \u2014 and yours starts here.",
    ctaLabel: "Explore the Platform",
    ctaUrl: "/marketplace",
  },
  {
    id: 2,
    type: "FEATURED_PRODUCT",
    title: "Artisan Business Cards",
    subtitle: "Premium letterpress cards, crafted locally in Boise.",
    price: 25,
    storeName: "Boise Business Cards",
    ctaLabel: "View in Store",
    ctaUrl: "/marketplace",
  },
  {
    id: 3,
    type: "NEW_MEMBER",
    title: "Welcome Sarah Chen!",
    subtitle:
      "Sourdough baker, community builder, and our newest Food & Drink artisan.",
    memberName: "Sarah Chen",
    joinDate: "March 18, 2026",
  },
  {
    id: 4,
    type: "MILESTONE",
    title: "CodeForge Tools hits Silver XP!",
    subtitle: "45,000 XP earned through quality digital tools.",
    achievementXP: "45,000",
    storeName: "CodeForge Tools",
  },
  {
    id: 5,
    type: "SHOWCASE_PROMOTION",
    title: "Harbor Woodworks Grand Opening",
    subtitle:
      "Handcrafted furniture and woodworking \u2014 now open in Main Square.",
    storeName: "Harbor Woodworks",
    isSponsored: true,
    ctaLabel: "Visit Store",
    ctaUrl: "/marketplace",
  },
  {
    id: 6,
    type: "FEATURED_PRODUCT",
    title: "Organic Sourdough Starter Kit",
    subtitle: "Everything you need to bake your own bread at home.",
    price: 15,
    storeName: "Sarah\u2019s Sourdough",
    ctaLabel: "View in Store",
    ctaUrl: "/marketplace",
  },
  {
    id: 7,
    type: "ANNOUNCEMENT",
    title: "Demand Signaling is LIVE",
    subtitle:
      "Tell us what you want. Back it with Marks. Watch it get built.",
    ctaLabel: "Signal Demand",
    ctaUrl: "/demand-signaling",
  },
  {
    id: 8,
    type: "NEW_MEMBER",
    title: "Welcome Mountain View Meals!",
    subtitle:
      "Fresh, local meal prep service joining the cooperative.",
    memberName: "Mountain View Meals",
    joinDate: "March 17, 2026",
  },
];

export const SAMPLE_HEADLINES: NewsSlide[] = [
  {
    id: 101,
    type: "ANNOUNCEMENT",
    title: "Founding Run: First 50 Members",
    subtitle: "Be part of the active feedback cohort with full testing access.",
  },
  {
    id: 102,
    type: "MILESTONE",
    title: "100 Products Listed",
    subtitle: "The marketplace crossed triple digits this week.",
  },
  {
    id: 103,
    type: "FEATURED_PRODUCT",
    title: "Hand-Forged Chef Knife",
    subtitle: "Damascus steel, made in Idaho.",
    price: 180,
    storeName: "Forge & Flame",
  },
  {
    id: 104,
    type: "NEW_MEMBER",
    title: "Welcome Treasure Valley Honey!",
    subtitle: "Raw, unfiltered honey straight from local hives.",
  },
  {
    id: 105,
    type: "ANNOUNCEMENT",
    title: "Ghost World Beta Opens Friday",
    subtitle: "Practice risk-free in the cooperative sandbox.",
  },
  {
    id: 106,
    type: "MILESTONE",
    title: "First Business Swoop!",
    subtitle: "A Patron fully funded a project via allocation authority.",
  },
];

export const SAMPLE_MILESTONES: MilestoneEntry[] = [
  { name: "Harbor Woodworks", achievement: "Gold XP", xp: "12,400" },
  { name: "Sarah\u2019s Sourdough", achievement: "First 10 Orders", xp: "850" },
  { name: "CodeForge Tools", achievement: "Silver XP", xp: "45,000" },
];

// ---------------------------------------------------------------------------
// DB → Frontend mapping helper
// ---------------------------------------------------------------------------

function mapDbSlide(row: any): NewsSlide {
  return {
    id: row.id ?? 0,
    type: row.slide_type as SlideType,
    title: row.title,
    subtitle: row.subtitle ?? "",
    price: row.price != null ? Number(row.price) : undefined,
    storeName: row.store_name ?? undefined,
    isSponsored: row.slide_type === "SHOWCASE_PROMOTION",
    ctaLabel: row.cta_text ?? undefined,
    ctaUrl: row.cta_url ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Service functions — Supabase-backed with sample fallback
// ---------------------------------------------------------------------------

export async function fetchDailySlides(date: Date): Promise<NewsSlide[]> {
  try {
    const dateStr = date.toISOString().split("T")[0];
    const { data } = await supabase
      .from("daily_news_slides")
      .select("*")
      .eq("display_date", dateStr)
      .eq("is_active", true)
      .lt("sort_order", 100)
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) return data.map(mapDbSlide);
  } catch (err) {
    console.error("Failed to fetch daily slides from DB", err);
  }
  return SAMPLE_SLIDES;
}

export async function fetchHeadlines(date: Date): Promise<NewsSlide[]> {
  try {
    const dateStr = date.toISOString().split("T")[0];
    const { data } = await supabase
      .from("daily_news_slides")
      .select("*")
      .eq("display_date", dateStr)
      .eq("is_active", true)
      .gte("sort_order", 100)
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) return data.map(mapDbSlide);
  } catch (err) {
    console.error("Failed to fetch headlines from DB", err);
  }
  return SAMPLE_HEADLINES;
}

export async function fetchShowcasePromotions(date: Date): Promise<ShowcasePromotion[]> {
  try {
    const dateStr = date.toISOString().split("T")[0];
    const { data } = await supabase
      .from("daily_news_slides")
      .select("*")
      .eq("display_date", dateStr)
      .eq("is_active", true)
      .in("slide_type", ["SHOWCASE_PROMOTION", "FEATURED_PRODUCT"])
      .lt("sort_order", 100)
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id ?? 0,
        storeName: row.store_name ?? "",
        title: row.title,
        subtitle: row.subtitle ?? "",
        price: row.price != null ? Number(row.price) : undefined,
        isSponsored: row.slide_type === "SHOWCASE_PROMOTION",
        ctaLabel: row.cta_text ?? undefined,
        ctaUrl: row.cta_url ?? undefined,
      }));
    }
  } catch (err) {
    console.error("Failed to fetch showcase promotions from DB", err);
  }
  return SAMPLE_SLIDES
    .filter((s) => s.type === "SHOWCASE_PROMOTION" || s.type === "FEATURED_PRODUCT")
    .map((s) => ({
      id: s.id,
      storeName: s.storeName ?? "",
      title: s.title,
      subtitle: s.subtitle,
      price: s.price,
      isSponsored: s.isSponsored ?? false,
      ctaLabel: s.ctaLabel,
      ctaUrl: s.ctaUrl,
    }));
}

export async function fetchMilestones(_date: Date): Promise<MilestoneEntry[]> {
  // Milestones come from a different source (member achievements) —
  // no dedicated table yet. Return sample data for now.
  return SAMPLE_MILESTONES;
}
