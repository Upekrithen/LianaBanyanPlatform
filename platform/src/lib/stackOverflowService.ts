/**
 * STACK OVERFLOW / STACK EXCHANGE SERVICE
 * ========================================
 * Community-driven support via Stack Overflow — following Imgur's model.
 *
 * Instead of building a help desk, we leverage Stack Overflow's existing
 * infrastructure: public Q&A, searchable knowledge base, community voting.
 * Engineers monitor the tag, members help members.
 *
 * Two data sources:
 *   1. RSS Feed — simple, no API key needed, cached locally (like Substack)
 *   2. Stack Exchange API v2.3 — richer data, 300 req/day free, 10K with key
 *
 * Tag: "lianabanyan" on Stack Overflow
 * RSS: https://stackoverflow.com/feeds/tag/lianabanyan
 * API: https://api.stackexchange.com/2.3/questions?tagged=lianabanyan&site=stackoverflow
 *
 * Integrates with:
 *   - Didasko (education/learning) — tutorials tagged for discovery
 *   - Harper Guild (truth/verification) — verified answers from engineers
 *   - Dispatch Plugins — support channel for new members
 *   - Cold Start Dashboard — FAQ for onboarding
 *
 * INFRASTRUCTURE NOTE: The Stack Exchange API has built-in CORS support,
 * so no proxy is needed (unlike Substack RSS). The RSS feed may need
 * the same CORS proxy we use for Substack.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SOQuestion {
  question_id: number;
  title: string;
  link: string;
  tags: string[];
  score: number;
  answer_count: number;
  view_count: number;
  is_answered: boolean;
  creation_date: number;         // Unix timestamp
  last_activity_date: number;    // Unix timestamp
  owner: {
    display_name: string;
    profile_image?: string;
    link?: string;
    reputation?: number;
  };
  body_markdown?: string;        // Only with filter=withbody
}

export interface SOAnswer {
  answer_id: number;
  question_id: number;
  score: number;
  is_accepted: boolean;
  creation_date: number;
  owner: {
    display_name: string;
    profile_image?: string;
    reputation?: number;
  };
  body_markdown?: string;
}

export interface SOSearchResult {
  items: SOQuestion[];
  has_more: boolean;
  quota_max: number;
  quota_remaining: number;
}

export interface SORssPost {
  title: string;
  link: string;
  pubDate: string;
  summary: string;
  author: string;
  categories: string[];         // Tags
  id: string;                   // Question ID from guid
}

export interface SORssFeed {
  title: string;
  link: string;
  posts: SORssPost[];
  lastFetched: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Primary tag for Liana Banyan on Stack Overflow */
export const LB_TAG = "lianabanyan";

/** Stack Exchange API v2.3 base URL */
const SE_API_BASE = "https://api.stackexchange.com/2.3";

/** CORS proxy for RSS feed (same one used for Substack) */
const CORS_PROXY_URL = "https://api.allorigins.win/raw?url=";

/** RSS feed URL for our tag */
export const SO_RSS_URL = `https://stackoverflow.com/feeds/tag/${LB_TAG}`;

/** Direct link to ask a new question with our tag pre-filled */
export const SO_ASK_URL = `https://stackoverflow.com/questions/ask?tags=${LB_TAG}`;

/** Direct link to browse all questions with our tag */
export const SO_TAG_URL = `https://stackoverflow.com/questions/tagged/${LB_TAG}`;

/** Cache TTL: 15 minutes for API, 30 minutes for RSS */
const API_CACHE_TTL = 15 * 60 * 1000;
const RSS_CACHE_TTL = 30 * 60 * 1000;

// ─── Stack Exchange API Functions ─────────────────────────────────────────────

/**
 * Fetch questions tagged with our tag from Stack Exchange API.
 * No API key needed for up to 300 requests/day.
 * With a key: 10,000/day (add as VITE_STACKEXCHANGE_KEY when needed).
 *
 * INFRASTRUCTURE NOTE: When quota approaches limits, add a Stack Exchange
 * API key. Register at https://stackapps.com/apps/oauth/register
 * Then set VITE_STACKEXCHANGE_KEY in .env
 */
export async function fetchQuestions(options: {
  tag?: string;
  sort?: "activity" | "votes" | "creation" | "hot";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  filter?: string;
} = {}): Promise<SOSearchResult> {
  const {
    tag = LB_TAG,
    sort = "activity",
    order = "desc",
    page = 1,
    pageSize = 15,
    filter = "default",
  } = options;

  const params = new URLSearchParams({
    tagged: tag,
    sort,
    order,
    page: String(page),
    pagesize: String(pageSize),
    site: "stackoverflow",
    filter,
  });

  // Add API key if available (raises quota from 300 to 10K/day)
  const apiKey = import.meta.env.VITE_STACKEXCHANGE_KEY;
  if (apiKey) {
    params.set("key", apiKey);
  }

  const response = await fetch(`${SE_API_BASE}/questions?${params}`);

  if (!response.ok) {
    throw new Error(`Stack Exchange API error: ${response.status}`);
  }

  const data = await response.json();
  return data as SOSearchResult;
}

/**
 * Fetch a single question with its answers.
 */
export async function fetchQuestionWithAnswers(
  questionId: number
): Promise<{ question: SOQuestion; answers: SOAnswer[] }> {
  const params = new URLSearchParams({
    site: "stackoverflow",
    filter: "withbody",
  });

  const apiKey = import.meta.env.VITE_STACKEXCHANGE_KEY;
  if (apiKey) params.set("key", apiKey);

  const [qResponse, aResponse] = await Promise.all([
    fetch(`${SE_API_BASE}/questions/${questionId}?${params}`),
    fetch(`${SE_API_BASE}/questions/${questionId}/answers?${params}`),
  ]);

  if (!qResponse.ok || !aResponse.ok) {
    throw new Error("Failed to fetch question details");
  }

  const qData = await qResponse.json();
  const aData = await aResponse.json();

  return {
    question: qData.items[0],
    answers: aData.items || [],
  };
}

/**
 * Search questions by keyword within our tag.
 */
export async function searchQuestions(
  query: string,
  tag: string = LB_TAG
): Promise<SOSearchResult> {
  const params = new URLSearchParams({
    tagged: tag,
    intitle: query,
    sort: "relevance",
    order: "desc",
    site: "stackoverflow",
    pagesize: "10",
  });

  const apiKey = import.meta.env.VITE_STACKEXCHANGE_KEY;
  if (apiKey) params.set("key", apiKey);

  const response = await fetch(`${SE_API_BASE}/search?${params}`);

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get tag info (question count, description, etc.)
 */
export async function getTagInfo(tag: string = LB_TAG): Promise<{
  name: string;
  count: number;
  has_synonyms: boolean;
  is_moderator_only: boolean;
} | null> {
  const params = new URLSearchParams({
    site: "stackoverflow",
  });

  const apiKey = import.meta.env.VITE_STACKEXCHANGE_KEY;
  if (apiKey) params.set("key", apiKey);

  const response = await fetch(`${SE_API_BASE}/tags/${tag}/info?${params}`);

  if (!response.ok) return null;

  const data = await response.json();
  return data.items?.[0] || null;
}

// ─── RSS Feed Functions (mirrors Substack pattern) ────────────────────────────

/**
 * Parse Stack Overflow RSS XML into structured posts.
 */
function parseSOFeedXml(xmlText: string): SORssFeed {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("Invalid RSS feed format");
  }

  // Atom feed format (Stack Overflow uses Atom, not RSS)
  const feed = doc.querySelector("feed");
  if (!feed) throw new Error("No Atom feed found");

  const title = feed.querySelector(":scope > title")?.textContent || "Stack Overflow";
  const linkEl = feed.querySelector(':scope > link[rel="alternate"]');
  const link = linkEl?.getAttribute("href") || SO_TAG_URL;

  const entries = feed.querySelectorAll("entry");
  const posts: SORssPost[] = Array.from(entries).map((entry) => {
    const categories: string[] = [];
    entry.querySelectorAll("category").forEach((cat) => {
      const term = cat.getAttribute("term");
      if (term) categories.push(term);
    });

    // Extract plain text from summary HTML
    const rawSummary = entry.querySelector("summary")?.textContent || "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = rawSummary;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    const truncated = plainText.slice(0, 250) + (plainText.length > 250 ? "..." : "");

    // Extract question ID from the id/link
    const entryLink = entry.querySelector('link[rel="alternate"]')?.getAttribute("href") ||
                      entry.querySelector("link")?.getAttribute("href") || "";
    const idMatch = entryLink.match(/questions\/(\d+)/);
    const questionId = idMatch ? idMatch[1] : entry.querySelector("id")?.textContent || "";

    return {
      title: entry.querySelector("title")?.textContent || "Untitled",
      link: entryLink,
      pubDate: entry.querySelector("published")?.textContent ||
               entry.querySelector("updated")?.textContent || "",
      summary: truncated,
      author: entry.querySelector("author > name")?.textContent || "",
      categories,
      id: questionId,
    };
  });

  return {
    title,
    link,
    posts,
    lastFetched: new Date().toISOString(),
  };
}

/**
 * Fetch the Stack Overflow RSS feed for our tag.
 * Uses the same CORS proxy as Substack.
 */
export async function fetchSORssFeed(
  tag: string = LB_TAG,
  maxPosts: number = 10
): Promise<SORssFeed> {
  const feedUrl = `https://stackoverflow.com/feeds/tag/${tag}`;
  const proxyUrl = `${CORS_PROXY_URL}${encodeURIComponent(feedUrl)}`;

  const response = await fetch(proxyUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch SO RSS feed: ${response.status}`);
  }

  const xmlText = await response.text();
  const feed = parseSOFeedXml(xmlText);

  feed.posts = feed.posts.slice(0, maxPosts);
  return feed;
}

// ─── Caching (mirrors Substack pattern) ──────────────────────────────────────

function getRssCacheKey(tag: string): string {
  return `lb_so_rss_cache_${tag}`;
}

function getApiCacheKey(tag: string, sort: string): string {
  return `lb_so_api_cache_${tag}_${sort}`;
}

export function getCachedRssFeed(tag: string = LB_TAG): SORssFeed | null {
  try {
    const cached = localStorage.getItem(getRssCacheKey(tag));
    if (!cached) return null;

    const feed: SORssFeed = JSON.parse(cached);
    const lastFetched = new Date(feed.lastFetched).getTime();
    if (Date.now() - lastFetched > RSS_CACHE_TTL) {
      localStorage.removeItem(getRssCacheKey(tag));
      return null;
    }

    return feed;
  } catch {
    return null;
  }
}

export function cacheRssFeed(tag: string, feed: SORssFeed): void {
  try {
    localStorage.setItem(getRssCacheKey(tag), JSON.stringify(feed));
  } catch {
    // localStorage full — silently fail
  }
}

export function getCachedApiQuestions(
  tag: string = LB_TAG,
  sort: string = "activity"
): SOSearchResult | null {
  try {
    const cached = localStorage.getItem(getApiCacheKey(tag, sort));
    if (!cached) return null;

    const result = JSON.parse(cached);
    if (Date.now() - result._cachedAt > API_CACHE_TTL) {
      localStorage.removeItem(getApiCacheKey(tag, sort));
      return null;
    }

    return result.data as SOSearchResult;
  } catch {
    return null;
  }
}

export function cacheApiQuestions(
  tag: string,
  sort: string,
  data: SOSearchResult
): void {
  try {
    localStorage.setItem(
      getApiCacheKey(tag, sort),
      JSON.stringify({ data, _cachedAt: Date.now() })
    );
  } catch {
    // localStorage full — silently fail
  }
}

/**
 * Fetch with cache — primary entry point for components.
 * Tries API first (richer data), falls back to RSS.
 */
export async function fetchSOQuestionsCached(
  tag: string = LB_TAG,
  sort: "activity" | "votes" | "creation" | "hot" = "activity"
): Promise<SOSearchResult> {
  const cached = getCachedApiQuestions(tag, sort);
  if (cached) return cached;

  try {
    const result = await fetchQuestions({ tag, sort });
    cacheApiQuestions(tag, sort, result);
    return result;
  } catch {
    // API failed — fall back to RSS
    const rssFeed = await fetchSORssFeedCached(tag);
    // Convert RSS posts to API-like format
    return {
      items: rssFeed.posts.map((post) => ({
        question_id: parseInt(post.id) || 0,
        title: post.title,
        link: post.link,
        tags: post.categories,
        score: 0,
        answer_count: 0,
        view_count: 0,
        is_answered: false,
        creation_date: new Date(post.pubDate).getTime() / 1000,
        last_activity_date: new Date(post.pubDate).getTime() / 1000,
        owner: { display_name: post.author },
      })),
      has_more: false,
      quota_max: 0,
      quota_remaining: 0,
    };
  }
}

export async function fetchSORssFeedCached(
  tag: string = LB_TAG,
  maxPosts: number = 10
): Promise<SORssFeed> {
  const cached = getCachedRssFeed(tag);
  if (cached) return cached;

  const feed = await fetchSORssFeed(tag, maxPosts);
  cacheRssFeed(tag, feed);
  return feed;
}

// ─── Helper Utilities ─────────────────────────────────────────────────────────

/**
 * Format a Unix timestamp to relative time
 */
export function formatSODate(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Generate a URL to ask a new question with our tag + optional extra tags
 */
export function generateAskUrl(extraTags: string[] = []): string {
  const tags = [LB_TAG, ...extraTags].slice(0, 5).join(","); // SO max 5 tags
  return `https://stackoverflow.com/questions/ask?tags=${encodeURIComponent(tags)}`;
}

/**
 * Map LB feature areas to suggested SO tags for cross-referencing
 */
export const FEATURE_TAG_MAP: Record<string, string[]> = {
  navigation: [LB_TAG, "react-router", "navigation"],
  portfolio: [LB_TAG, "portfolio", "react"],
  commerce: [LB_TAG, "payment", "stripe"],
  social: [LB_TAG, "oauth", "social-media"],
  governance: [LB_TAG, "voting", "governance"],
  hexisle: [LB_TAG, "game-development", "hexagonal-grid"],
  supabase: [LB_TAG, "supabase", "postgresql"],
  firebase: [LB_TAG, "firebase", "hosting"],
};
