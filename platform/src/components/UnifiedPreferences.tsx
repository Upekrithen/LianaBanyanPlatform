import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdvancedThemeSwitcher } from './AdvancedThemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { BackerTrackPrompt } from './BackerTrackPrompt';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

interface UnifiedPreferencesProps {
  className?: string;
}

export function UnifiedPreferences({ className }: UnifiedPreferencesProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [backerTrack, setBackerTrack] = useState<'product_only' | 'backer' | undefined>();
  const [isTribeMember, setIsTribeMember] = useState(false);
  const [hasGuildMemberships, setHasGuildMemberships] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchPreferences = async () => {
      // Fetch contributor track preference
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('marketplace_backer_track')
        .eq('user_id', user.id)
        .single();

      if (prefs?.marketplace_backer_track) {
        setBackerTrack(prefs.marketplace_backer_track as 'product_only' | 'backer');
      }

      // Check tribe membership
      const { data: tribeMembership } = await supabase
        .from('guild_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      setIsTribeMember(!!tribeMembership);

      // Check guild memberships
      const { data: guildMemberships } = await supabase
        .from('guild_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      setHasGuildMemberships(!!guildMemberships && guildMemberships.length > 0);
    };

    fetchPreferences();
  }, [user]);

  const handleTrackChange = async (track: 'product_only' | 'backer') => {
    if (!user) return;

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        marketplace_backer_track: track,
      });

    if (!error) {
      setBackerTrack(track);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('preferences.title', 'Preferences')}</CardTitle>
        <CardDescription>
          {t('preferences.description', 'Customize your experience across all aspects of the platform.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Marketplace Preferences */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Marketplace Participation</label>
          <BackerTrackPrompt
            onSelectTrack={handleTrackChange}
            currentTrack={backerTrack}
          />
        </div>

        <Separator />

        {/* Community Preferences */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Community Memberships</label>

          {/* Tribe Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Tribe</span>
                    <Badge variant={isTribeMember ? "default" : "outline"} className="text-xs">
                      {isTribeMember ? "Member" : "Lone Wolf"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isTribeMember
                      ? "Share resources with up to 9 members"
                      : "Join or create a tribe to unlock benefits"}
                  </p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/tribes">{isTribeMember ? "Manage" : "Browse"}</Link>
              </Button>
            </div>
          </div>

          {/* Guild Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Guilds</span>
                    <Badge variant={hasGuildMemberships ? "default" : "outline"} className="text-xs">
                      {hasGuildMemberships ? "Active" : "None"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {hasGuildMemberships
                      ? "Professional networks and opportunities"
                      : "Join guilds for industry recognition"}
                  </p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/guilds">{hasGuildMemberships ? "Manage" : "Explore"}</Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Appearance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {t('preferences.theme', 'Theme')}
            </label>
          </div>
          <AdvancedThemeSwitcher variant="grid" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('preferences.language', 'Language')}
          </label>
          <LanguageSwitcher />
        </div>
      </CardContent>
    </Card>
  );
}
