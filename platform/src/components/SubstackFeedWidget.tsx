/**
 * SUBSTACK FEED WIDGET
 * ====================
 * Displays a member's Substack newsletter posts in their profile/portfolio.
 * Fetches RSS feed, caches results (30-min TTL), shows latest posts with
 * title, date, and description preview.
 *
 * Usage:
 *   <SubstackFeedWidget substackUrl="lianabanyan" />
 *   <SubstackFeedWidget substackUrl="https://custom-domain.com" maxPosts={3} />
 *
 * Used in: Portfolio, Profile pages, Rally Group member cards
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Rss, RefreshCw, Clock, BookOpen } from "lucide-react";
import {
  fetchSubstackFeedCached,
  extractPublicationName,
  type SubstackFeed,
  type SubstackPost,
} from "@/lib/substackRssService";

interface SubstackFeedWidgetProps {
  substackUrl: string;
  maxPosts?: number;
  compact?: boolean;          // Smaller variant for sidebars
  showHeader?: boolean;       // Show newsletter title bar
  className?: string;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateString;
  }
}

function PostItem({ post, compact }: { post: SubstackPost; compact: boolean }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div
        className={`${
          compact ? "py-2" : "py-3"
        } border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors rounded-md px-2 -mx-2`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4
              className={`font-medium text-foreground group-hover:text-primary transition-colors leading-snug ${
                compact ? "text-sm" : "text-base"
              }`}
            >
              {post.title}
            </h4>
            {!compact && post.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {post.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatDate(post.pubDate)}
              </span>
              {post.categories.length > 0 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {post.categories[0]}
                </Badge>
              )}
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
        </div>
      </div>
    </a>
  );
}

export function SubstackFeedWidget({
  substackUrl,
  maxPosts = 5,
  compact = false,
  showHeader = true,
  className = "",
}: SubstackFeedWidgetProps) {
  const [feed, setFeed] = useState<SubstackFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        // Clear cache by fetching fresh
        const { fetchSubstackFeed } = await import("@/lib/substackRssService");
        const freshFeed = await fetchSubstackFeed(substackUrl, maxPosts);
        const { cacheFeed } = await import("@/lib/substackRssService");
        cacheFeed(substackUrl, freshFeed);
        setFeed(freshFeed);
      } else {
        const cachedFeed = await fetchSubstackFeedCached(substackUrl, maxPosts);
        setFeed(cachedFeed);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [substackUrl, maxPosts]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-4/5" />
            <div className="h-3 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center">
          <Rss className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Could not load newsletter feed
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLoading(true);
              setError(null);
              loadFeed();
            }}
            className="mt-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!feed || feed.posts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No posts yet</p>
        </CardContent>
      </Card>
    );
  }

  const publicationName = extractPublicationName(substackUrl);

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className={compact ? "pb-2 pt-4 px-4" : "pb-3"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded">
                <Rss className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className={compact ? "text-sm" : "text-base"}>
                  {feed.title}
                </CardTitle>
                {!compact && (
                  <CardDescription className="text-xs">
                    @{publicationName} on Substack
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadFeed(true)}
                disabled={refreshing}
                className="h-7 w-7 p-0"
              >
                <RefreshCw
                  className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <a
                href={feed.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={compact ? "px-4 pb-4 pt-0" : "pt-0"}>
        {feed.posts.map((post) => (
          <PostItem key={post.guid || post.link} post={post} compact={compact} />
        ))}
      </CardContent>
    </Card>
  );
}

export default SubstackFeedWidget;
