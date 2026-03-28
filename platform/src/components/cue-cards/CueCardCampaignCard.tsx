import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CueCardCampaign } from '@/hooks/useCueCardCampaigns';

interface CueCardCampaignCardProps {
  card: CueCardCampaign;
}

export function CueCardCampaignCard({ card }: CueCardCampaignCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer">
      <CardContent className="p-6 text-center space-y-3">
        <span className="text-5xl block">{card.icon}</span>
        <h3 className="font-bold text-base">{card.title}</h3>
        <p className="text-sm text-muted-foreground">{card.craft_type}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {card.default_production_path}
        </p>
        <Link to={`/projects/create?cue_card=${card.slug}`}>
          <Button className="w-full mt-2">Start This Campaign</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
