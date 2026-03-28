import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { MatchedFundingBar } from './MatchedFundingBar';
import { EarlyAdopterMeter } from './EarlyAdopterMeter';
import type { TurnKeyProject } from '@/hooks/useTurnKeyProjects';

const TIER_LABELS: Record<string, string> = {
  prototype: 'Prototype',
  early_adopter: 'Early Adopter',
  tier2_500: 'Tier 2',
  tier3_5k: 'Tier 3',
  tier4_mass: 'Tier 4',
};

interface TurnKeyProjectCardProps {
  project: TurnKeyProject;
}

export function TurnKeyProjectCard({ project }: TurnKeyProjectCardProps) {
  const leadImage = project.images?.[0];
  const isShowcased = project.status === 'showcased';

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow group ${isShowcased ? 'border-2 border-amber-400/60' : ''}`}>
      <Link to={`/projects/${project.slug}`}>
        <div className="aspect-[4/3] bg-muted overflow-hidden relative">
          {leadImage ? (
            <img src={leadImage} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground/30">📦</div>
          )}
          {isShowcased && (
            <Badge className="absolute top-2 left-2 bg-amber-500 text-white hover:bg-amber-600 text-[10px] font-bold tracking-wider uppercase">
              Showcase
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/projects/${project.slug}`} className="hover:underline">
            <h3 className="font-semibold text-sm line-clamp-1">{project.title}</h3>
          </Link>
          <Badge variant="secondary" className="text-[10px] shrink-0">{project.category}</Badge>
        </div>

        {isShowcased ? (
          <div className="flex items-center gap-1 text-sm text-amber-600 font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>People want this</span>
          </div>
        ) : (
          <>
            <Badge variant="outline" className="text-[10px]">{TIER_LABELS[project.current_tier] || project.current_tier}</Badge>

            <MatchedFundingBar
              creatorBacking={project.creator_backing_credits}
              communityMatched={project.community_matched}
              matchingCap={project.matching_cap}
              compact
            />

            <EarlyAdopterMeter filled={project.early_adopter_filled} total={project.early_adopter_slots} />
          </>
        )}

        <Link to={`/projects/${project.slug}`}>
          <Button size="sm" className={`w-full mt-1 ${isShowcased ? 'bg-amber-500 hover:bg-amber-600' : ''}`}>
            {isShowcased ? 'Show Your Support' : 'Back This Project'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
