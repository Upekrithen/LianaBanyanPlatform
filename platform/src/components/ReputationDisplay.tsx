import { Star, Sun } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface ReputationDisplayProps {
  level1Blocks: number;
  level2Blocks: number;
  level3Blocks: number;
  stars: number;
  suns: number;
  totalInteractions: number;
  positiveInteractions: number;
  negativeInteractions: number;
  overallScore: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ReputationDisplay({
  level1Blocks,
  level2Blocks,
  level3Blocks,
  stars,
  suns,
  totalInteractions,
  positiveInteractions,
  negativeInteractions,
  overallScore,
  size = 'md'
}: ReputationDisplayProps) {
  const blockSizes = {
    sm: { l1: 'h-2 w-2', l2: 'h-3 w-3', l3: 'h-4 w-4', star: 'h-5 w-5', sun: 'h-6 w-6' },
    md: { l1: 'h-3 w-3', l2: 'h-4 w-4', l3: 'h-5 w-5', star: 'h-6 w-6', sun: 'h-8 w-8' },
    lg: { l1: 'h-4 w-4', l2: 'h-5 w-5', l3: 'h-6 w-6', star: 'h-8 w-8', sun: 'h-10 w-10' }
  };

  const sizes = blockSizes[size];
  const positiveRatio = totalInteractions > 0 ? (positiveInteractions / totalInteractions) * 100 : 100;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-2">
          {/* Suns */}
          {suns > 0 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(suns, 10) }).map((_, i) => (
                <Sun key={`sun-${i}`} className={`${sizes.sun} text-yellow-500 fill-yellow-500`} />
              ))}
              {suns > 10 && <span className="text-sm font-bold ml-1">×{suns}</span>}
            </div>
          )}

          {/* Stars */}
          {stars > 0 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(stars, 5) }).map((_, i) => (
                <Star key={`star-${i}`} className={`${sizes.star} text-yellow-400 fill-yellow-400`} />
              ))}
              {stars > 5 && <span className="text-sm font-semibold ml-1">×{stars}</span>}
            </div>
          )}

          {/* Level 3 Blocks (100 blocks) */}
          {level3Blocks > 0 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(level3Blocks, 5) }).map((_, i) => (
                <div key={`l3-${i}`} className={`${sizes.l3} bg-green-600 rounded`} />
              ))}
              {level3Blocks > 5 && <span className="text-xs ml-1">×{level3Blocks}</span>}
            </div>
          )}

          {/* Level 2 Blocks */}
          {level2Blocks > 0 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(level2Blocks, 5) }).map((_, i) => (
                <div key={`l2-${i}`} className={`${sizes.l2} bg-green-500 rounded-sm`} />
              ))}
            </div>
          )}

          {/* Level 1 Blocks */}
          {level1Blocks > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: Math.min(level1Blocks, 5) }).map((_, i) => (
                <div key={`l1-${i}`} className={`${sizes.l1} bg-green-400 rounded-sm`} />
              ))}
            </div>
          )}

          {/* Show placeholder if no reputation yet */}
          {totalInteractions === 0 && (
            <span className="text-muted-foreground text-sm">No ratings yet</span>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Reputation Score</span>
            <span className="text-2xl font-bold text-primary">{overallScore.toFixed(2)}/5.0</span>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total Interactions:</span>
              <span className="font-medium">{totalInteractions}</span>
            </div>
            <div className="flex justify-between">
              <span>Positive:</span>
              <span className="font-medium text-green-600">{positiveInteractions} ({positiveRatio.toFixed(1)}%)</span>
            </div>
            <div className="flex justify-between">
              <span>Negative:</span>
              <span className="font-medium text-red-600">{negativeInteractions}</span>
            </div>
          </div>

          <div className="pt-2 border-t text-xs text-muted-foreground">
            <div className="font-semibold mb-1">Legend:</div>
            <div>☀️ Sun = 625 interactions (individuals) / 6,250 (businesses)</div>
            <div>⭐ Star = 125 interactions (individuals) / 1,250 (businesses)</div>
            <div>■ Level 3 = 25 interactions / 250</div>
            <div>■ Level 2 = 5 interactions / 50</div>
            <div>■ Level 1 = 1 interaction / 10</div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
