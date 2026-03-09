/**
 * SUBSTACK RSS FEED INTEGRATION
 * ==============================
 * Fetches and parses Substack RSS feeds for display in member portfolios.
 *
 * Substack doesn't offer traditional OAuth — it provides RSS feeds at:
 *   https://{publication}.substack.com/feed
 *
 * This utility:
 *   1. Fetches the RSS XML via a CORS proxy or Edge Function
 *   2. Parses it into structured post objects
 *   3. Caches results in localStorage with TTL
 *   4. Integrates with the Social Plug system as a "content_feed" type
 *
 * For Founder's Cephas site: https://cephas.lianabanyan.com/index.xml
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content: string;
  author: string;
  categories: string[];
  imageUrl?: string;
  guid: string;
}

export interface SubstackFeed {
  title: string;
  description: string;
  link: string;
  language: string;
  lastBuildDate: string;
  posts: SubstackPost[];
}

export interface SubstackPlugConfig {
  feedUrl: string;
  publicationName: string;
  displayOnProfile: boolean;
  maxPostsToShow: number;
}

// ============================================================================
// CACHE
// ============================================================================

const CACHE_KEY_PREFIX = 'lb_substack_feed_';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  feed: SubstackFeed;
  timestamp: number;
}

function getCached(feedUrl: string): SubstackFeed | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + btoa(feedUrl));
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY_PREFIX + btoa(feedUrl));
      return null;
    }
    return entry.feed;
  } catch {
    return null;
  }
}

function setCache(feedUrl: string, feed: SubstackFeed): void {
  try {
    const entry: CacheEntry = { feed, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY_PREFIX + btoa(feedUrl), JSON.stringify(entry));
  } catch {
    // localStorage full — silently fail
  }
}

// ============================================================================
// RSS PARSING
// ============================================================================

/**
 * Parse RSS XML string into SubstackFeed
 */
function parseRSSXml(xmlString: string): SubstackFeed {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const channel = doc.querySelector('channel');
  if (!channel) throw new Error('Invalid RSS feed: no channel element');

  const feed: SubstackFeed = {
    title: channel.querySelector('title')?.textContent || '',
    description: channel.querySelector('description')?.textContent || '',
    link: channel.querySelector('link')?.textContent || '',
    language: channel.querySelector('language')?.textContent || 'en',
    lastBuildDate: channel.querySelector('lastBuildDate')?.textContent || '',
    posts: [],
  };

  const items = channel.querySelectorAll('item');
  items.forEach((item) => {
    // Extract first image from content for thumbnail
    const content = item.querySelector('content\\:encoded, encoded')?.textContent || '';
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);

    const post: SubstackPost = {
      title: item.querySelector('title')?.textContent || '',
      link: item.querySelector('link')?.textContent || '',
      pubDate: item.querySelector('pubDate')?.textContent || '',
      description: item.querySelector('description')?.textContent || '',
      content: content,
      author: item.querySelector('author, dc\\:creator, creator')?.textContent || '',
      categories: Array.from(item.querySelectorAll('category')).map(c => c.textContent || ''),
      imageUrl: imgMatch?.[1],
      guid: item.querySelector('guid')?.textContent || item.querySelector('link')?.textContent || '',
    };

    feed.posts.push(post);
  });

  return feed;
}

// ============================================================================
// FETCH
// ============================================================================

/**
 * Fetch a Substack (or any RSS) feed.
 * Uses Supabase Edge Function as CORS proxy if direct fetch fails.
 */
export async function fetchSubstackFeed(feedUrl: string): Promise<SubstackFeed> {
  // Check cache first
  const cached = getCached(feedUrl);
  if (cached) return cached;

  let xmlString: string;

  try {
    // Try direct fetch first (works for same-origin or CORS-enabled feeds)
    const response = await fetch(feedUrl, {
      headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    xmlString = await response.text();
  } catch {
    // Fall back to Edge Function proxy
    try {
      const { data, error } = await supabase.functions.invoke('fetch-rss', {
        body: { url: feedUrl },
      });
      if (error) throw error;
      xmlString = data.xml;
    } catch (proxyError) {
      console.error('RSS fetch failed (both direct and proxy):', proxyError);
      throw new Error(`Could not fetch RSS feed from ${feedUrl}`);
    }
  }

  const feed = parseRSSXml(xmlString);
  setCache(feedUrl, feed);
  return feed;
}

// ============================================================================
// PLUG MANAGEMENT
// ============================================================================

/**
 * Save Substack configuration for a user
 */
export async function saveSubstackPlug(
  userId: string,
  config: SubstackPlugConfig
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_social_plugs')
    .upsert({
      user_id: userId,
      platform: 'substack',
      is_enabled: config.displayOnProfile,
      platform_username: config.publicationName,
      platform_user_id: config.feedUrl,
      plug_features: {
        feed_url: config.feedUrl,
        max_posts: config.maxPostsToShow,
        content_feed: true,
      },
    }, {
      onConflict: 'user_id,platform',
    });

  if (error) {
    console.error('Error saving Substack plug:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Get Substack configuration for a user
 */
export async function getSubstackPlug(userId: string): Promise<SubstackPlugConfig | null> {
  const { data, error } = await supabase
    .from('user_social_plugs')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', 'substack')
    .single();

  if (error || !data) return null;

  return {
    feedUrl: data.platform_user_id || '',
    publicationName: data.platform_username || '',
    displayOnProfile: data.is_enabled,
    maxPostsToShow: data.plug_features?.max_posts || 5,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Validate a Substack URL and normalize to feed URL
 */
export function normalizeSubstackUrl(url: string): string {
  let normalized = url.trim();

  // Handle bare publication names
  if (!normalized.includes('.') && !normalized.includes('/')) {
    normalized = `https://${normalized}.substack.com/feed`;
  }

  // Ensure protocol
  if (!normalized.startsWith('http')) {
    normalized = 'https://' + normalized;
  }

  // Ensure /feed suffix for substack.com URLs
  if (normalized.includes('substack.com') && !normalized.endsWith('/feed')) {
    normalized = normalized.replace(/\/?$/, '/feed');
  }

  // Handle Hugo RSS (cephas.lianabanyan.com/index.xml already works)

  return normalized;
}

/**
 * Extract a clean excerpt from HTML content
 */
export function extractExcerpt(htmlContent: string, maxLength: number = 200): string {
  // Strip HTML tags
  const text = htmlContent.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function relativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}
