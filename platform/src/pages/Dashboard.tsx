import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReferralManager } from '@/components/ReferralManager';
import { EOIToggle } from '@/components/EOIToggle';
import { EOIDashboard } from '@/components/EOIDashboard';
import { MembershipStakePayment } from '@/components/MembershipStakePayment';
import { GuildStakeProgression } from '@/components/GuildStakeProgression';
import { ProjectPreferenceRanking } from '@/components/ProjectPreferenceRanking';
import { InvestmentTimeline } from '@/components/InvestmentTimeline';
import { EquityBreakdownCard } from '@/components/EquityBreakdownCard';
import { InvestmentReportExporter } from '@/components/InvestmentReportExporter';
import { MilestoneNotifications } from '@/components/MilestoneNotifications';
import { RealTimeProductStats } from '@/components/RealTimeProductStats';
import { RealTimeUserStats } from '@/components/RealTimeUserStats';
import { DashboardPortalSwitcher } from '@/components/DashboardPortalSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { PhysicalBadgeReminder } from '@/components/PhysicalBadgeReminder';
import { MembershipStatusCard } from '@/components/MembershipStatusCard';
import NavigateToGuilds from '@/components/NavigateToGuilds';
import { CharitableLoanAccount } from '@/components/CharitableLoanAccount';
import { LegalFormationStatus } from '@/components/LegalFormationStatus';
import { Palette, Users, ExternalLink, Rocket, Award, Utensils, Scale } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [credits, setCredits] = useState<any>(null);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  const [membershipPaid, setMembershipPaid] = useState<boolean>(false);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    // Load credits and membership status
    const { data: creditsData } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (creditsData) {
      setCredits(creditsData);
      setMembershipPaid(creditsData.membership_stake_paid || false);
    }

    // Check if user is project owner
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'project_owner']);

    setIsProjectOwner(roles && roles.length > 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center gap-2">
          <h1 className="text-lg md:text-2xl font-bold truncate">Member Dashboard</h1>
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/workshop')}
              className="touch-manipulation"
            >
              Workshop
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/themes')}
              className="touch-manipulation"
              title="Customize Portal Theme"
            >
              <Palette className="h-4 w-4" />
            </Button>
            {isProjectOwner && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/project')}
                  className="touch-manipulation hidden sm:flex"
                  size="sm"
                >
                  Project Admin
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/roles')}
                  className="touch-manipulation hidden sm:flex"
                  size="sm"
                >
                  Roles
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              onClick={signOut}
              className="touch-manipulation"
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-4 md:py-8">
        <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 h-auto">
            <TabsTrigger value="overview" className="touch-manipulation">{t('dashboard.myDashboard')}</TabsTrigger>
            <TabsTrigger value="portals" className="touch-manipulation">{t('dashboard.portalAccess')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <MembershipStakePayment 
              hasPaid={membershipPaid} 
              onPaymentSuccess={() => {
                setMembershipPaid(true);
                loadUserData();
              }}
            />
            
            <MembershipStatusCard />
            
            {membershipPaid && <GuildStakeProgression />}
            
            {/* Quick Access Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              <NavigateToGuilds />
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-primary/20 bg-gradient-to-br from-green-500/5 to-emerald-500/10"
                onClick={() => navigate('/crowdfunding')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-green-600" />
                    Crowdfunding Hub
                  </CardTitle>
                  <CardDescription>
                    Manage Kickstarter, Indiegogo, and other platform integrations
                  </CardDescription>
                </CardHeader>
              </Card>
              
              {isProjectOwner && (
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-primary/20 bg-gradient-to-br from-amber-500/5 to-yellow-500/10"
                  onClick={() => navigate('/medallion-management')}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      Medallion Management
                    </CardTitle>
                    <CardDescription>
                      Design, track, and verify project medallions
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
            
            <PhysicalBadgeReminder />
            
            {/* Legal & Financial Services */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <LegalFormationStatus />
              <CharitableLoanAccount />
            </div>
            
            {/* Initiative Projects Quick Access */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-primary/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/10"
                onClick={() => navigate('/initiatives/lets-make-dinner')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-blue-600" />
                    Let's Make Dinner
                  </CardTitle>
                  <CardDescription>
                    Order meals from community cooks or offer your own
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-primary/20 bg-gradient-to-br from-purple-500/5 to-pink-500/10"
                onClick={() => navigate('/initiatives/defense-claws')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-purple-600" />
                    Defense Claws
                  </CardTitle>
                  <CardDescription>
                    Safety bracelet funding LB Legal Defense Fund
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
            
            <div className="space-y-6 mb-6">
              <EOIToggle />
              <ProjectPreferenceRanking />
              <EOIDashboard />
            </div>
            
            <div className="grid gap-4 md:gap-6 lg:grid-cols-3 mb-4 md:mb-6">
              <div className="lg:col-span-2">
                <RealTimeUserStats />
              </div>
              <div className="lg:col-span-1">
                <InvestmentReportExporter />
              </div>
            </div>

            <div className="grid gap-4 md:gap-6 lg:grid-cols-2 mb-4 md:mb-6">
              <EquityBreakdownCard />
              <MilestoneNotifications />
            </div>

            <div className="grid gap-4 md:gap-6 lg:grid-cols-3 mb-4 md:mb-6">
              <div className="lg:col-span-2">
                <InvestmentTimeline />
              </div>
              <div className="lg:col-span-1">
                <ReferralManager />
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/marketplace')}>
                <CardHeader>
                  <CardTitle>{t('dashboard.marketplace')}</CardTitle>
                  <CardDescription>{t('dashboard.browseProjects')}</CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/projects')}>
                <CardHeader>
                  <CardTitle>{t('projects.title')}</CardTitle>
                  <CardDescription>{t('dashboard.viewAllProjects')}</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/portfolio')}>
                <CardHeader>
                  <CardTitle>{t('dashboard.myPortfolio')}</CardTitle>
                  <CardDescription>{t('dashboard.trackInvestments')}</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/medallions')}>
                <CardHeader>
                  <CardTitle>{t('dashboard.myMedallions')}</CardTitle>
                  <CardDescription>{t('dashboard.viewBadges')}</CardDescription>
                </CardHeader>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 mt-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{t('dashboard.credits')}</CardTitle>
                  <CardDescription>
                    {credits ? `$${Number(credits.available_credits || 0).toFixed(2)} ${t('dashboard.creditsAvailable')}` : t('common.loading')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.useCredits')}
                  </p>
                  {credits && Number(credits.total_credits) === 0 && (
                    <p className="text-xs text-amber-600 mt-2">
                      {t('dashboard.noCredits')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Admin & Member Tools */}
            <div className="flex flex-wrap gap-3 mt-6">
              {isProjectOwner && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/roles")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {t('dashboard.roles')}
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => navigate("/external-services")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('dashboard.externalServices')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="portals">
            <DashboardPortalSwitcher />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
