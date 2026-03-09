import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Award, 
  Shield, 
  Users, 
  Sword, 
  Trophy, 
  Star,
  Crown,
  Target,
  Zap,
  ChefHat,
  Flame,
  Heart,
  ShoppingCart,
  Utensils
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FOOD_BADGES, getLevelDescription } from '@/lib/badgeAwards';

interface UnifiedBadgeDisplayProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

export function UnifiedBadgeDisplay({ userId, size = 'md', compact = false }: UnifiedBadgeDisplayProps) {
  const { data: achievements } = useQuery({
    queryKey: ['user-badge-achievements', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_badge_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('visible_on_badge', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: guildMemberships } = useQuery({
    queryKey: ['user-guilds', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          *,
          guilds (name, guild_type)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const { data: clanMemberships } = useQuery({
    queryKey: ['user-clans', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          *,
          clans (display_name, name)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const { data: progression } = useQuery({
    queryKey: ['user-progression', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_guild_progression')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const categoryIcons = {
    lb_achievement: Crown,
    guild: Shield,
    lone_wolf: Sword,
    skill: Target,
    clan: Users,
    food: Utensils,
    delivery: ShoppingCart,
  };

  // Food badge icons mapping
  const foodBadgeIcons: Record<string, any> = {
    cooking_spoon: Utensils,
    hot_pepper: Flame,
    chef_hat: ChefHat,
    meal_saver: Heart,
    grocery_runner: ShoppingCart,
  };

  // Filter food-related achievements
  const foodAchievements = achievements?.filter(
    a => a.achievement_category === 'food' || a.achievement_category === 'delivery'
  ) || [];

  const achievementsByCategory = achievements?.reduce((acc, achievement) => {
    const category = achievement.achievement_category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {achievements?.slice(0, 5).map((achievement) => {
          const Icon = categoryIcons[achievement.achievement_category as keyof typeof categoryIcons] || Award;
          return (
            <div
              key={achievement.id}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary",
                sizeClasses[size]
              )}
              title={achievement.achievement_name}
            >
              <Icon className={iconSizes[size]} />
              {achievement.achievement_level && (
                <span className="font-semibold">{achievement.achievement_level}</span>
              )}
            </div>
          );
        })}
        {(achievements?.length || 0) > 5 && (
          <div className={cn(
            "inline-flex items-center px-2 py-1 rounded-full bg-muted text-muted-foreground",
            sizeClasses[size]
          )}>
            +{achievements!.length - 5}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Military-Style Badge Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 mb-3 shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-bold text-lg">Achievement Badge</h3>
          <p className="text-sm text-muted-foreground">Complete Record</p>
        </div>

        <Separator className="mb-6" />

        {/* Achievements by Category */}
        <div className="space-y-4">
          {/* LB Achievements */}
          {achievementsByCategory?.lb_achievement && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold">LB Honors</span>
              </div>
              <div className="flex flex-wrap gap-2 ml-6">
                {achievementsByCategory.lb_achievement.map((achievement) => (
                  <Badge key={achievement.id} variant="secondary" className="gap-1">
                    <Star className="w-3 h-3" />
                    {achievement.achievement_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Guild Memberships */}
          {guildMemberships && guildMemberships.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold">Guild Affiliations</span>
              </div>
              <div className="flex flex-wrap gap-2 ml-6">
                {guildMemberships.map((membership) => (
                  <Badge key={membership.id} variant="outline" className="gap-1">
                    <Users className="w-3 h-3" />
                    {membership.guilds?.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Lone Wolf Progression */}
          {progression && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sword className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold">Independent Rank</span>
              </div>
              <div className="ml-6">
                <Badge variant="secondary" className="gap-1">
                  <Zap className="w-3 h-3" />
                  Class {progression.current_class} {progression.current_tier}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {progression.completed_contracts} contracts completed
                </p>
              </div>
            </div>
          )}

          {/* Skill Certifications */}
          {achievementsByCategory?.skill && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold">Skill Certifications</span>
              </div>
              <div className="flex flex-wrap gap-2 ml-6">
                {achievementsByCategory.skill.map((achievement) => (
                  <Badge key={achievement.id} variant="secondary">
                    {achievement.achievement_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Clan Memberships */}
          {clanMemberships && clanMemberships.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold">Clan Affiliations</span>
              </div>
              <div className="flex flex-wrap gap-2 ml-6">
                {clanMemberships.map((membership) => (
                  <Badge key={membership.id} variant="outline" className="gap-1">
                    {membership.clans?.display_name || membership.clans?.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Food Ecosystem Badges */}
          {foodAchievements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold">Food Ecosystem</span>
              </div>
              <div className="flex flex-wrap gap-2 ml-6">
                {foodAchievements.map((achievement) => {
                  // Find matching badge definition
                  const badgeId = achievement.achievement_name.toLowerCase().replace(/ /g, '_');
                  const Icon = foodBadgeIcons[badgeId] || Utensils;
                  const level = achievement.achievement_level;
                  
                  // Determine badge color based on type
                  let badgeColor = 'bg-amber-500/20 text-amber-500';
                  if (badgeId === 'hot_pepper') badgeColor = 'bg-rose-500/20 text-rose-500';
                  if (badgeId === 'meal_saver') badgeColor = 'bg-red-500/20 text-red-500';
                  if (badgeId === 'grocery_runner') badgeColor = 'bg-emerald-500/20 text-emerald-500';
                  if (badgeId === 'chef_hat') badgeColor = 'bg-white/20 text-white';
                  
                  return (
                    <Badge 
                      key={achievement.id} 
                      className={cn("gap-1 border-0", badgeColor)}
                      title={level ? getLevelDescription(badgeId, level) : ''}
                    >
                      <Icon className="w-3 h-3" />
                      {achievement.achievement_name}
                      {level && level > 0 && (
                        <span className="font-bold ml-1">
                          {'🥄'.repeat(Math.min(level, 5))}
                        </span>
                      )}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <Separator className="my-6" />
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-bold text-lg">{achievements?.length || 0}</div>
            <div className="text-muted-foreground">Achievements</div>
          </div>
          <div>
            <div className="font-bold text-lg">{guildMemberships?.length || 0}</div>
            <div className="text-muted-foreground">Guilds</div>
          </div>
          <div>
            <div className="font-bold text-lg">{clanMemberships?.length || 0}</div>
            <div className="text-muted-foreground">Clans</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}