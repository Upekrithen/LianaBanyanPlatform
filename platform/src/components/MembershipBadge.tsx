import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useMembershipStatus, MembershipLevel } from '@/hooks/useMembershipStatus';
import { Key } from 'lucide-react';

const CONFIG: Record<MembershipLevel, { label: string; className: string; cta?: string }> = {
  free: {
    label: 'Free',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/30 cursor-pointer hover:bg-gray-500/20',
    cta: 'Upgrade to Access Key ($5/year)',
  },
  active: {
    label: 'Access Key Active',
    className: 'bg-green-500/10 text-green-600 border-green-500/30',
  },
  expired: {
    label: 'Access Key Expired',
    className: 'bg-red-500/10 text-red-600 border-red-500/30 cursor-pointer hover:bg-red-500/20',
    cta: 'Renew ($5/year)',
  },
  lifetime: {
    label: 'Lifetime Member',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  },
};

export function MembershipBadge({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { status, expiresAt, isLoading } = useMembershipStatus();

  if (isLoading) return null;

  const cfg = CONFIG[status];
  const clickable = status === 'free' || status === 'expired';

  const handleClick = () => {
    if (clickable) navigate('/join');
  };

  if (compact) {
    return (
      <Badge
        variant="outline"
        className={`text-[10px] gap-1 ${cfg.className}`}
        onClick={handleClick}
        data-xray-id="membership-badge"
      >
        <Key className="h-2.5 w-2.5" />
        {cfg.label}
      </Badge>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border ${cfg.className}`}
      onClick={handleClick}
      data-xray-id="membership-badge"
    >
      <Key className="h-3.5 w-3.5 shrink-0" />
      <div className="min-w-0">
        <span className="font-medium">{cfg.label}</span>
        {status === 'active' && expiresAt && (
          <span className="text-muted-foreground ml-1">
            — Expires {new Date(expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
        {cfg.cta && (
          <span className="ml-1 underline">{cfg.cta}</span>
        )}
      </div>
    </div>
  );
}
