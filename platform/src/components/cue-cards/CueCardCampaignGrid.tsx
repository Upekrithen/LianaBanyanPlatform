import { useCueCardCampaigns } from '@/hooks/useCueCardCampaigns';
import { CueCardCampaignCard } from './CueCardCampaignCard';
import { Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function CueCardCampaignGrid() {
  const { data: cards = [], isLoading } = useCueCardCampaigns();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-52 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center">
        <Rocket className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
        <h3 className="text-lg font-medium mb-1">No campaigns yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
          Campaigns are how creators launch projects on Liana Banyan. Be the first to start one!
        </p>
        <Link to="/projects/create">
          <Button size="sm">
            <Rocket className="w-4 h-4 mr-2" />
            Start a Project
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <CueCardCampaignCard key={card.id} card={card} />
      ))}
    </div>
  );
}
