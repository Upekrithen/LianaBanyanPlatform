import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';

const PLATFORM_LABELS: Record<string, string> = {
  reddit: 'Reddit', discord: 'Discord', instagram: 'Instagram', etsy: 'Etsy',
  twitter: 'Twitter/X', tiktok: 'TikTok', website: 'Website', manual: 'Manual',
};

const PLATFORM_COLORS: Record<string, string> = {
  reddit: 'bg-orange-100 text-orange-800', discord: 'bg-indigo-100 text-indigo-800',
  instagram: 'bg-pink-100 text-pink-800', etsy: 'bg-amber-100 text-amber-800',
  twitter: 'bg-sky-100 text-sky-800', tiktok: 'bg-zinc-100 text-zinc-800',
  website: 'bg-emerald-100 text-emerald-800', manual: 'bg-gray-100 text-gray-800',
};

interface ImportPreviewProps {
  title: string;
  description: string;
  images: string[];
  platform: string;
  sourceUrl: string;
  onTitleChange?: (val: string) => void;
  onDescriptionChange?: (val: string) => void;
  editable?: boolean;
}

export function ImportPreview({
  title, description, images, platform, sourceUrl,
  onTitleChange, onDescriptionChange, editable = false,
}: ImportPreviewProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {images.length > 0 && (
          <div className="aspect-video bg-muted overflow-hidden relative">
            <img src={images[0]} alt={title || 'Preview'} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 flex gap-1">
                {images.slice(1, 4).map((img, i) => (
                  <div key={i} className="w-10 h-10 rounded border-2 border-white overflow-hidden shadow-sm">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {images.length > 4 && (
                  <div className="w-10 h-10 rounded border-2 border-white bg-black/50 flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-medium">+{images.length - 4}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {images.length === 0 && (
          <div className="aspect-video bg-muted flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={PLATFORM_COLORS[platform] || 'bg-gray-100 text-gray-800'}>
              {PLATFORM_LABELS[platform] || platform}
            </Badge>
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View source <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {editable ? (
            <input
              type="text"
              value={title}
              onChange={e => onTitleChange?.(e.target.value)}
              placeholder="Product title"
              className="w-full text-lg font-semibold bg-transparent border-b border-dashed border-muted-foreground/30 focus:border-primary outline-none pb-1"
            />
          ) : (
            <h3 className="text-lg font-semibold">{title || 'Untitled'}</h3>
          )}

          {editable ? (
            <textarea
              value={description}
              onChange={e => onDescriptionChange?.(e.target.value)}
              placeholder="Describe this product..."
              rows={3}
              className="w-full text-sm text-muted-foreground bg-transparent border border-dashed border-muted-foreground/30 focus:border-primary outline-none rounded p-2 resize-none"
            />
          ) : (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {description || 'No description extracted.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
