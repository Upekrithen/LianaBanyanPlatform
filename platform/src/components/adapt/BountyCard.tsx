import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BountyCardProps {
  bounty: {
    id: string;
    title: string;
    description: string;
    reward_credits: number;
    status: string;
    partner_name: string;
    claimed_by?: string;
    completed_at?: string;
  };
  currentUserId?: string;
  isAdmin?: boolean;
  onClaim?: (bountyId: string) => void;
  onStatusChange?: (bountyId: string, newStatus: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-500',
  claimed: 'bg-blue-500',
  in_progress: 'bg-blue-500',
  review: 'bg-purple-500',
  completed: 'bg-gray-400',
  cancelled: 'bg-gray-300',
};

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  claimed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-gray-100 text-gray-500',
};

export function BountyCard({ bounty, currentUserId, isAdmin, onClaim, onStatusChange }: BountyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isMine = currentUserId && bounty.claimed_by === currentUserId;

  return (
    <Card className="overflow-hidden" data-xray-id={`bounty-${bounty.id}`}>
      <div className={cn('w-1.5 absolute left-0 top-0 bottom-0', STATUS_COLORS[bounty.status] ?? 'bg-gray-300')} />
      <CardContent className="p-4 pl-5 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm">{bounty.title}</h3>
            <p className="text-xs text-muted-foreground">{bounty.partner_name}</p>
          </div>
          <Badge className={cn('text-xs flex-shrink-0', STATUS_BADGE[bounty.status])}>
            {bounty.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="mt-2">
          <p className={cn('text-sm text-muted-foreground', !expanded && 'line-clamp-3')}>
            {bounty.description}
          </p>
          {bounty.description && bounty.description.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary flex items-center gap-0.5 mt-1"
            >
              {expanded ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> More</>}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-sm font-semibold">
            <Shield className="h-4 w-4 text-yellow-600" />
            <span>{bounty.reward_credits.toLocaleString()} Credits</span>
          </div>

          <div className="flex gap-2">
            {bounty.status === 'open' && currentUserId && (
              <Button size="sm" variant="default" onClick={() => onClaim?.(bounty.id)}>
                Claim This Bounty
              </Button>
            )}
            {bounty.status === 'claimed' && isMine && (
              <Button size="sm" variant="outline" onClick={() => onStatusChange?.(bounty.id, 'in_progress')}>
                Mark In Progress
              </Button>
            )}
            {bounty.status === 'in_progress' && isMine && (
              <Button size="sm" variant="default" onClick={() => onStatusChange?.(bounty.id, 'review')}>
                Submit for Review
              </Button>
            )}
            {bounty.status === 'review' && isAdmin && (
              <>
                <Button size="sm" variant="default" onClick={() => onStatusChange?.(bounty.id, 'completed')}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => onStatusChange?.(bounty.id, 'in_progress')}>
                  Return
                </Button>
              </>
            )}
          </div>
        </div>

        {bounty.completed_at && (
          <p className="text-xs text-muted-foreground mt-2">
            Completed: {new Date(bounty.completed_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
