import { Star, Coins, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WantThisButton } from './WantThisButton';
import { ShowcaseCommentForm } from './ShowcaseCommentForm';
import type { ShowcaseDemand } from '@/hooks/useShowcaseDemand';

interface DemandSignalPanelProps {
  demand: ShowcaseDemand;
  projectId: string;
  onPledgeClick: () => void;
}

export function DemandSignalPanel({ demand, projectId, onPledgeClick }: DemandSignalPanelProps) {
  const { wantCount, pledgeTotal, pledgerCount, comments } = demand;
  const visibleComments = comments.slice(0, 10);

  const pledgePercent = Math.min(100, (pledgeTotal / Math.max(pledgeTotal, 1000)) * 100);

  return (
    <div className="space-y-4">
      {/* Want count */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-2xl font-bold">{wantCount.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">people want this</span>
          </div>
          <WantThisButton projectId={projectId} currentlyWanted={demand.userWanted} />
        </CardContent>
      </Card>

      {/* Pledge ring */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-600" />
            <span className="text-2xl font-bold">{pledgeTotal.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">Credits pledged</span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${pledgePercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{pledgerCount} {pledgerCount === 1 ? 'person' : 'people'} pledged</p>
          <Button onClick={onPledgeClick} className="w-full bg-amber-600 hover:bg-amber-700">
            <Coins className="w-4 h-4 mr-2" /> Pledge Credits
          </Button>
        </CardContent>
      </Card>

      {/* Comments feed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          {visibleComments.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {visibleComments.map(c => (
                <div key={c.id} className="text-sm border-l-2 border-amber-300 pl-3 py-1">
                  <p className="text-foreground">{c.comment_text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {comments.length > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  + {comments.length - 10} more comments
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
          )}
          <ShowcaseCommentForm projectId={projectId} />
        </CardContent>
      </Card>
    </div>
  );
}
