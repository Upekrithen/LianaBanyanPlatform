import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark, ArrowRight } from 'lucide-react';

export function BookmarkletInstructions() {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lianabanyan.com';
  const bookmarkletCode = `javascript:void(window.open('${origin}/import?url='+encodeURIComponent(location.href),'_blank'))`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bookmark className="w-4 h-4" />
          One-Click Bookmarklet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Drag this button to your browser&apos;s bookmark bar. Then click it on any product page
          (Reddit, Etsy, Instagram, etc.) to instantly import it as a project.
        </p>

        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <a
            href={bookmarkletCode}
            onClick={e => e.preventDefault()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm cursor-grab active:cursor-grabbing shadow-sm hover:shadow"
            draggable
          >
            <Bookmark className="w-4 h-4" />
            Import to LB
          </a>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Drag this to your bookmark bar</span>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium">How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Drag the &ldquo;Import to LB&rdquo; button to your bookmark bar</li>
            <li>Find something cool on Reddit, Etsy, or any website</li>
            <li>Click the bookmarklet in your browser</li>
            <li>A new tab opens with the product pre-filled as a project</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
