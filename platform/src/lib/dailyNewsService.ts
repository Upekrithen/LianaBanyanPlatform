// ---------------------------------------------------------------------------
// Daily News Service
// Supabase-ready data layer for The Daily News page.
// TODO: Wire to Supabase daily_news_slides table when migration is created.
// ---------------------------------------------------------------------------

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
// Service functions
// ---------------------------------------------------------------------------

/**
 * Fetch the daily news slides for a given date.
 * Currently returns sample data. When Supabase is wired, this will query
 * the `daily_news_slides` table.
 */
export async function fetchDailySlides(_date: Date): Promise<NewsSlide[]> {
  // TODO(SUPABASE): Replace with real query:
  // const { data, error } = await supabase
  //   .from('daily_news_slides')
  //   .select('*')
  //   .eq('publish_date', date.toISOString().split('T')[0])
  //   .order('sort_order', { ascending: true });
  // if (error) throw error;
  // return data as NewsSlide[];

  return SAMPLE_SLIDES;
}

/**
 * Fetch headline slides for a given date.
 */
export async function fetchHeadlines(_date: Date): Promise<NewsSlide[]> {
  // TODO(SUPABASE): Replace with real query:
  // const { data, error } = await supabase
  //   .from('daily_news_headlines')
  //   .select('*')
  //   .eq('publish_date', date.toISOString().split('T')[0])
  //   .order('sort_order', { ascending: true });
  // if (error) throw error;
  // return data as NewsSlide[];

  return SAMPLE_HEADLINES;
}

/**
 * Fetch showcase promotions for a given date.
 * Returns slides of type SHOWCASE_PROMOTION or FEATURED_PRODUCT.
 */
export async function fetchShowcasePromotions(_date: Date): Promise<ShowcasePromotion[]> {
  // TODO(SUPABASE): Replace with real query:
  // const { data, error } = await supabase
  //   .from('daily_news_slides')
  //   .select('id, store_name, title, subtitle, price, is_sponsored, cta_label, cta_url')
  //   .eq('publish_date', date.toISOString().split('T')[0])
  //   .in('type', ['SHOWCASE_PROMOTION', 'FEATURED_PRODUCT'])
  //   .order('sort_order', { ascending: true });
  // if (error) throw error;
  // return data as ShowcasePromotion[];

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

/**
 * Fetch milestone entries for the current week.
 */
export async function fetchMilestones(_date: Date): Promise<MilestoneEntry[]> {
  // TODO(SUPABASE): Replace with real query:
  // const weekStart = new Date(date);
  // weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  // const { data, error } = await supabase
  //   .from('member_milestones')
  //   .select('name, achievement, xp')
  //   .gte('achieved_at', weekStart.toISOString())
  //   .order('achieved_at', { ascending: false });
  // if (error) throw error;
  // return data as MilestoneEntry[];

  return SAMPLE_MILESTONES;
}
