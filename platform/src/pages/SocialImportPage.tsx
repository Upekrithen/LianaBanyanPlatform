import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Link as LinkIcon, Sparkles, History } from 'lucide-react';
import { ImportPreview, ImportToProjectWizard, BookmarkletInstructions } from '@/components/social-import';
import { useExtractFromUrl, useMyImports } from '@/hooks/useSocialImport';
import { Badge } from '@/components/ui/badge';

const PLATFORM_LABELS: Record<string, string> = {
  reddit: 'Reddit', discord: 'Discord', instagram: 'Instagram', etsy: 'Etsy',
  twitter: 'Twitter/X', tiktok: 'TikTok', website: 'Website', manual: 'Manual',
};

export default function SocialImportPage() {
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const { extract, extracting, metadata, setMetadata, error } = useExtractFromUrl();
  const { data: pastImports = [] } = useMyImports();

  useEffect(() => {
    const prefilledUrl = searchParams.get('url');
    if (prefilledUrl) {
      setUrl(prefilledUrl);
      extract(prefilledUrl);
    }
  }, [searchParams]);

  const handleExtract = async () => {
    if (!url.trim()) return;
    await extract(url.trim());
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (pasted && pasted.startsWith('http')) {
      setUrl(pasted);
      setTimeout(() => extract(pasted), 100);
    }
  };

  if (showWizard && metadata) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Create Project from Import</h1>
        <ImportToProjectWizard
          title={metadata.title}
          description={metadata.description}
          images={metadata.images}
          platform={metadata.platform}
          sourceUrl={metadata.source_url}
          onBack={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          Import a Product
        </h1>
        <p className="text-muted-foreground mt-1">
          Paste a link to any product, post, or listing and turn it into a Turn-Key project in one click.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Paste a Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="https://www.reddit.com/r/crafts/comments/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={e => e.key === 'Enter' && handleExtract()}
            />
            <Button onClick={handleExtract} disabled={extracting || !url.trim()}>
              {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Extract'}
            </Button>
          </div>
          {error && <p className="text-sm text-amber-600">{error}</p>}
          <p className="text-xs text-muted-foreground">
            Works with Reddit, Etsy, Instagram, TikTok, Twitter/X, and any page with Open Graph tags.
          </p>
        </CardContent>
      </Card>

      {metadata && (
        <div className="space-y-4">
          <ImportPreview
            title={metadata.title}
            description={metadata.description}
            images={metadata.images}
            platform={metadata.platform}
            sourceUrl={metadata.source_url}
          />
          <Button size="lg" className="w-full" onClick={() => setShowWizard(true)}>
            <Sparkles className="w-4 h-4 mr-2" />
            Convert to Turn-Key Project
          </Button>
        </div>
      )}

      <BookmarkletInstructions />

      {pastImports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Imports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pastImports.slice(0, 5).map(imp => (
              <div key={imp.id} className="flex items-center gap-3 p-2 rounded border text-sm">
                <Badge variant="outline" className="text-xs shrink-0">
                  {PLATFORM_LABELS[imp.source_platform] || imp.source_platform}
                </Badge>
                <span className="truncate flex-1">{imp.source_title || imp.source_url}</span>
                <Badge variant={imp.status === 'converted' ? 'default' : 'secondary'} className="text-xs shrink-0">
                  {imp.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
