import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function PhysicalBadgeReminder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const { data: milestones } = useQuery({
    queryKey: ['member-milestones', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('member_project_milestones')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: hasBadge } = useQuery({
    queryKey: ['has-physical-badge', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('physical_badge_designs')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!user,
  });

  // Don't show if:
  // - User not logged in
  // - Already has a badge
  // - Hasn't completed at least 3 projects
  // - Already completed first 10 projects
  // - User dismissed the reminder
  if (
    !user ||
    hasBadge ||
    !milestones ||
    milestones.project_count < 3 ||
    milestones.first_10_completed ||
    dismissed
  ) {
    return null;
  }

  const progressPercentage = Math.min((milestones.project_count / 10) * 100, 100);

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
      <CardContent className="pt-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => setDismissed(true)}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
            <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Create Your Physical Member Badge
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Recommended within your first 10 projects. Physical badges feature a QR code linking 
                to your public profile, showcasing your achievements and credentials.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-700 dark:text-amber-300">
                  Progress: {milestones.project_count}/10 projects
                </span>
                <span className="text-amber-700 dark:text-amber-300 font-medium">
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-amber-200 dark:bg-amber-900 rounded-full h-2">
                <div
                  className="bg-amber-500 dark:bg-amber-600 rounded-full h-2 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <Button
              onClick={() => navigate('/profile-settings')}
              className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              Design Your Badge
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}