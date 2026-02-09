import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export function MembershipStatusCard() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['membership-status', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('membership_status, membership_activated_at, membership_expires_at')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!profile) return null;

  const expiresAt = profile.membership_expires_at ? new Date(profile.membership_expires_at) : null;
  const daysRemaining = expiresAt ? differenceInDays(expiresAt, new Date()) : 0;
  const totalDays = 30;
  const daysUsed = totalDays - daysRemaining;
  const progressPercentage = (daysUsed / totalDays) * 100;

  const statusConfig = {
    active: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-500',
      label: 'Active',
    },
    expired: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-500',
      label: 'Expired',
    },
    inactive: {
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
      borderColor: 'border-gray-500',
      label: 'Inactive',
    },
  };

  const config = statusConfig[profile.membership_status as keyof typeof statusConfig] || statusConfig.inactive;
  const StatusIcon = config.icon;

  return (
    <Card className={`${config.bgColor} border-2 ${config.borderColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${config.color}`} />
            Free Membership
          </CardTitle>
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        </div>
        <CardDescription>
          {profile.membership_status === 'active' 
            ? 'Your free 30-day membership is active'
            : profile.membership_status === 'expired'
            ? 'Your membership has expired'
            : 'Activate your free membership'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.membership_status === 'active' && expiresAt && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Days Remaining</span>
                <span className="font-semibold">{Math.max(0, daysRemaining)} days</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Expires: <span className="font-medium text-foreground">{format(expiresAt, 'PPP')}</span>
              </p>
              {daysRemaining <= 7 && daysRemaining > 0 && (
                <p className="text-sm font-medium text-amber-600">
                  ⚠️ Check your email for a confirmation link to extend your membership
                </p>
              )}
              {daysRemaining <= 0 && (
                <p className="text-sm font-medium text-red-600">
                  Your membership has expired. Sign up again to reactivate.
                </p>
              )}
            </div>
          </>
        )}

        {profile.membership_status === 'expired' && (
          <p className="text-sm text-muted-foreground">
            Sign up again to get another 30 days of free membership.
          </p>
        )}

        {profile.membership_status === 'inactive' && (
          <p className="text-sm text-muted-foreground">
            Your membership will be automatically activated on your next login.
          </p>
        )}
      </CardContent>
    </Card>
  );
}