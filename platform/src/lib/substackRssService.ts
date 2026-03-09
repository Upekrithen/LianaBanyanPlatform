/**
 * SUBSTACK RSS SERVICE
 * ====================
 * Fetches and parses RSS feeds from Substack newsletters.
 * Used for "Content Plug" — members paste their Substack URL,
 * platform fetches RSS, displays recent posts in Portfolio.
 *
 * Substack RSS feeds follow the pattern:
 *   https://{publication}.substack.com/feed
 *
 * This is a read-only integration — no API key needed.
 * RSS feeds are public by design.
 */

export interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;       // HTML snippet (first ~200 chars)
  creator: string;
  guid: string;
  categories: string[];
}

export interface SubstackFeed {
  title: string;              // Newsletter name
  link: string;               // Substack URL
  description: string;        // Newsletter description
  imageUrl?: string;          // Newsletter avatar
  posts: SubstackPost[];
  lastFetched: string;        // ISO timestamp
}

/**
 * Normalize a Substack URL to its RSS feed URL.
 * Handles various input formats:
 *   - "projectname" → "https://projectname.substack.com/feed"
 *   - "https://projectname.substack.com" → "https://projectname.substack.com/feed"
 *   - "https://projectname.substack.com/feed" → pass through
 *   - "https://custom-domain.com" → "https://custom-domain.com/feed"
 */
export function normalizeSubstackUrl(input: string): string {
  let url = input.trim();

  // If just a handle/name (no dots or slashes), treat as substack subdomain
  if (!url.includes('.') && !url.includes('/')) {
    return `https://${url}.substack.com/feed`;
  }

  // Add protocol if missing
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }

  // Strip trailing slashes
  url = url.replace(/\/+$/, '');

  // Append /feed if not already present
  if (!url.endsWith('/feed')) {
    url = `${url}/feed`;
  }

  return url;
}

/**
 * Extract the publication name from a Substack URL
 */
export function extractPublicationName(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = parsed.hostname;

    // For substack.com subdomains: extract the subdomain
    if (hostname.endsWith('.substack.com')) {
      return hostname.replace('.substack.com', '');
    }

    // For custom domains: use the hostname
    return hostname;
  } catch {
    return url;
  }
}

/**
 * Parse RSS XML into structured SubstackFeed
 */
function parseRssXml(xmlText: string): SubstackFeed {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid RSS feed format');
  }

  const channel = doc.querySelector('channel');
  if (!channel) {
    throw new Error('No RSS channel found');
  }

  // Channel metadata
  const title = channel.querySelector(':scope > title')?.textContent || 'Unknown Newsletter';
  const link = channel.querySelector(':scope > link')?.textContent || '';
  const description = channel.querySelector(':scope > description')?.textContent || '';
  const imageUrl = channel.querySelector(':scope > image > url')?.textContent || undefined;

  // Parse items
  const items = channel.querySelectorAll('item');
  const posts: SubstackPost[] = Array.from(items).map(item => {
    const categories: string[] = [];
    item.querySelectorAll('category').forEach(cat => {
      if (cat.textContent) categories.push(cat.textContent);
    });

    // Get description and truncate HTML to plain text preview
    const rawDescription = item.querySelector('description')?.textContent || '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawDescription;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    const truncated = plainText.slice(0, 200) + (plainText.length > 200 ? '...' : '');

    return {
      title: item.querySelector('title')?.textContent || 'Untitled',
      link: item.querySelector('link')?.textContent || '',
      pubDate: item.querySelector('pubDate')?.textContent || '',
      description: truncated,
      creator: item.querySelector('dc\\:creator, creator')?.textContent || '',
      guid: item.querySelector('guid')?.textContent || '',
      categories,
    };
  });

  return {
    title,
    link,
    description,
    imageUrl,
    posts,
    lastFetched: new Date().toISOString(),
  };
}

/**
 * Fetch a Substack RSS feed.
 *
 * INFRASTRUCTURE NOTE: Direct browser fetch to external RSS feeds
 * will hit CORS restrictions. In production, this should route
 * through a Supabase Edge Function or CORS proxy.
 *
 * For now, we use a public CORS proxy for development.
 * When the Edge Function `fetch-rss` is deployed, swap the
 * CORS_PROXY_URL to the Edge Function URL.
 */
const CORS_PROXY_URL = 'https://api.allorigins.win/raw?url=';

export async function fetchSubstackFeed(
  substackUrl: string,
  maxPosts: number = 5
): Promise<SubstackFeed> {
  const feedUrl = normalizeSubstackUrl(substackUrl);

  // INFRASTRUCTURE NOTE: Replace with Edge Function when available
  // const edgeFunctionUrl = `${supabaseUrl}/functions/v1/fetch-rss?url=${encodeURIComponent(feedUrl)}`;
  const proxyUrl = `${CORS_PROXY_URL}${encodeURIComponent(feedUrl)}`;

  const response = await fetch(proxyUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.status}`);
  }

  const xmlText = await response.text();
  const feed = parseRssXml(xmlText);

  // Limit posts
  feed.posts = feed.posts.slice(0, maxPosts);

  return feed;
}

/**
 * Validate that a URL points to a valid Substack (or RSS) feed
 */
export async function validateSubstackFeed(url: string): Promise<{
  valid: boolean;
  feedTitle?: string;
  postCount?: number;
  error?: string;
}> {
  try {
    const feed = await fetchSubstackFeed(url, 1);
    return {
      valid: true,
      feedTitle: feed.title,
      postCount: feed.posts.length,
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Invalid feed URL',
    };
  }
}

/**
 * Cache key for localStorage caching of RSS feeds
 */
function getCacheKey(url: string): string {
  return `lb_substack_cache_${normalizeSubstackUrl(url)}`;
}

/**
 * Get cached feed data (with 30-minute TTL)
 */
export function getCachedFeed(url: string): SubstackFeed | null {
  try {
    const cached = localStorage.getItem(getCacheKey(url));
    if (!cached) return null;

    const feed: SubstackFeed = JSON.parse(cached);
    const lastFetched = new Date(feed.lastFetched).getTime();
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;

    if (now - lastFetched > thirtyMinutes) {
      localStorage.removeItem(getCacheKey(url));
      return null;
    }

    return feed;
  } catch {
    return null;
  }
}

/**
 * Cache a fetched feed in localStorage
 */
export function cacheFeed(url: string, feed: SubstackFeed): void {
  try {
    localStorage.setItem(getCacheKey(url), JSON.stringify(feed));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/**
 * Fetch with cache — primary entry point for components
 */
export async function fetchSubstackFeedCached(
  url: string,
  maxPosts: number = 5
): Promise<SubstackFeed> {
  const cached = getCachedFeed(url);
  if (cached) return cached;

  const feed = await fetchSubstackFeed(url, maxPosts);
  cacheFeed(url, feed);
  return feed;
}
