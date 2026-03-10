/**
 * SUBSTACK FEED DISPLAY
 * ======================
 * Displays RSS feed posts from a Substack (or Hugo/RSS) publication.
 *
 * Used on:
 *   - Member Portfolio pages (shows their Substack posts)
 *   - Founder profile (shows cephas.lianabanyan.com articles)
 *   - The Battery Intelligence section (preview Substack targets)
 *
 * Variants:
 *   - "card" — Full card with image thumbnails
 *   - "compact" — Minimal list for sidebar/portfolio
 *   - "inline" — Embedded in content areas
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rss, ExternalLink, Clock, BookOpen, Settings, Check, AlertCircle } from 'lucide-react';
import {
  fetchSubstackFeed,
  normalizeSubstackUrl,
  extractExcerpt,
  relativeTime,
  type SubstackFeed,
  type SubstackPost,
} from '@/lib/substackRSS';

// ============================================================================
// FEED DISPLAY
// ============================================================================

interface SubstackFeedDisplayProps {
  feedUrl: string;
  variant?: 'card' | 'compact' | 'inline';
  maxPosts?: number;
  showHeader?: boolean;
  publicationName?: string;
}

export function SubstackFeedDisplay({
  feedUrl,
  variant = 'card',
  maxPosts = 5,
  showHeader = true,
  publicationName,
}: SubstackFeedDisplayProps) {
  const [feed, setFeed] = useState<SubstackFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!feedUrl) return;
    setLoading(true);
    setError(null);

    fetchSubstackFeed(feedUrl)
      .then(setFeed)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [feedUrl]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
        <Rss className="w-4 h-4 animate-pulse" />
        Loading feed...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500 p-4">
        <AlertCircle className="w-4 h-4" />
        Could not load feed
      </div>
    );
  }

  if (!feed || feed.posts.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
        <BookOpen className="w-4 h-4" />
        No posts yet
      </div>
    );
  }

  const displayPosts = feed.posts.slice(0, maxPosts);
  const name = publicationName || feed.title;

  // Compact variant — minimal list
  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        {showHeader && (
          <div className="flex items-center gap-2 text-sm font-medium mb-3">
            <Rss className="w-4 h-4 text-orange-500" />
            <span>{name}</span>
          </div>
        )}
        {displayPosts.map((post) => (
          <a
            key={post.guid}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate group-hover:text-orange-500 transition-colors">
                {post.title}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {relativeTime(post.pubDate)}
              </div>
            </div>
          </a>
        ))}
      </div>
    );
  }

  // Inline variant — embedded in content
  if (variant === 'inline') {
    return (
      <div className="space-y-3">
        {showHeader && (
          <h4 className="font-semibold flex items-center gap-2">
            <Rss className="w-4 h-4 text-orange-500" />
            Recent from {name}
          </h4>
        )}
        {displayPosts.map((post) => (
          <div key={post.guid} className="flex gap-3 p-3 rounded-lg border bg-card">
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title || "Article image"}
                className="w-16 h-16 rounded object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sm hover:text-orange-500 transition-colors line-clamp-1"
              >
                {post.title}
              </a>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {extractExcerpt(post.description || post.content, 120)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {relativeTime(post.pubDate)}
                </span>
                {post.categories.slice(0, 2).map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-[10px] px-1 py-0">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Card variant — full card display
  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Rss className="w-5 h-5 text-orange-500" />
            {name}
          </CardTitle>
          <CardDescription>
            {feed.description ? extractExcerpt(feed.description, 100) : 'Recent articles'}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {displayPosts.map((post) => (
          <a
            key={post.guid}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-4 p-3 rounded-lg border hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
          >
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title || "Article image"}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm group-hover:text-orange-500 transition-colors line-clamp-2">
                {post.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {extractExcerpt(post.description || post.content, 150)}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {relativeTime(post.pubDate)}
                </span>
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </a>
        ))}
        {feed.posts.length > maxPosts && (
          <a
            href={feed.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-orange-500 hover:text-orange-400 transition-colors py-2"
          >
            View all {feed.posts.length} posts →
          </a>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SUBSTACK PLUG SETUP (Settings component)
// ============================================================================

interface SubstackPlugSetupProps {
  userId: string;
  onSave?: () => void;
}

export function SubstackPlugSetup({ userId, onSave }: SubstackPlugSetupProps) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [saving, setSaving] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const feedUrl = normalizeSubstackUrl(url);
      const feed = await fetchSubstackFeed(feedUrl);
      if (feed.posts.length > 0) {
        setTestResult('success');
        if (!name) setName(feed.title);
      } else {
        setTestResult('error');
      }
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { saveSubstackPlug } = await import('@/lib/substackRSS');
      await saveSubstackPlug(userId, {
        feedUrl: normalizeSubstackUrl(url),
        publicationName: name,
        displayOnProfile: true,
        maxPostsToShow: 5,
      });
      onSave?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rss className="w-5 h-5 text-orange-500" />
          Connect Substack / RSS Feed
        </CardTitle>
        <CardDescription>
          Display your Substack articles on your portfolio. Works with any RSS feed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="substack-url">Publication URL or RSS Feed</Label>
          <Input
            id="substack-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g., yourname.substack.com or https://site.com/feed.xml"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter your Substack URL, publication name, or any RSS feed URL.
          </p>
        </div>

        <div>
          <Label htmlFor="pub-name">Display Name</Label>
          <Input
            id="pub-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Publication Name"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTest} disabled={!url || testing}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          {testResult === 'success' && (
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <Check className="w-4 h-4" /> Feed connected!
            </div>
          )}
          {testResult === 'error' && (
            <div className="flex items-center gap-1 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" /> Could not reach feed
            </div>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={!url || !name || saving || testResult !== 'success'}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Substack Plug'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default SubstackFeedDisplay;
