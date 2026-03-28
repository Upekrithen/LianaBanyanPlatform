import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCueCardCampaign } from '@/hooks/useCueCardCampaign';
import { ProductionPathVisual } from './ProductionPathVisual';
import { Lightbulb } from 'lucide-react';

export default function CueCardCampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: card, isLoading } = useCueCardCampaign(slug);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>;
  }

  if (!card) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cue Card not found.</div>;
  }

  const descriptionWithHighlights = card.description_template.replace(
    /\[([^\]]+)\]/g,
    '<span class="bg-primary/10 text-primary px-1 rounded font-medium">[$1]</span>'
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <span className="text-6xl block">{card.icon}</span>
        <h1 className="text-2xl font-bold">{card.title}</h1>
        <p className="text-muted-foreground">{card.craft_type}</p>
      </div>

      {/* Description Template */}
      <Card>
        <CardHeader><CardTitle className="text-base">Template</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: descriptionWithHighlights }} />
          <p className="text-xs text-muted-foreground mt-2">Fill in the [bracketed] fields with your details.</p>
        </CardContent>
      </Card>

      {/* Production Path */}
      <Card>
        <CardHeader><CardTitle className="text-base">Production Path</CardTitle></CardHeader>
        <CardContent>
          <ProductionPathVisual path={card.default_production_path} />
        </CardContent>
      </Card>

      {/* Backing Range + Categories */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Recommended Backing</span>
            <span className="font-bold">{card.recommended_backing_min.toLocaleString()} – {card.recommended_backing_max.toLocaleString()} Credits</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Suggested Categories</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {card.suggested_categories.map(cat => (
                <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketing Copy */}
      {card.marketing_copy_template && (
        <Card>
          <CardHeader><CardTitle className="text-base">Marketing Copy</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm italic text-muted-foreground">"{card.marketing_copy_template}"</p>
          </CardContent>
        </Card>
      )}

      {/* Tip */}
      {card.tip_text && (
        <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm">{card.tip_text}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link to={`/projects/create?cue_card=${card.slug}`}>
          <Button size="lg" className="w-full">Use This Cue Card</Button>
        </Link>
        <Link to={`/projects?cue_card=${card.slug}`}>
          <Button variant="outline" size="sm" className="w-full">See Projects Using This Card</Button>
        </Link>
      </div>
    </div>
  );
}
