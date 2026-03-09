/**
 * MEMBER DASHBOARD - PROGRESSIVE DISCLOSURE
 * ==========================================
 * Uses chalk-line placeholders for undiscovered features.
 * Features are revealed as users explore the platform.
 * 
 * Discovery Categories:
 * - essentials: Always visible (membership, guild stake)
 * - initiatives: Let's Make Dinner, Defense Klaus, etc.
 * - exploration: Crowdfunding, Medallions, Studios
 * - economy: EOI Dashboard, Investments, Equity
 * - governance: Legal, Charitable Loans
 * - tools: Referrals, Badge Reminders
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDiscovery } from '@/hooks/useDiscovery';
import { DiscoverySlot, DiscoveryGated } from '@/components/DiscoverySlot';

// Components
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
import { RealTimeUserStats } from '@/components/RealTimeUserStats';
import { DashboardPortalSwitcher } from '@/components/DashboardPortalSwitcher';
import { PhysicalBadgeReminder } from '@/components/PhysicalBadgeReminder';
import { MembershipStatusCard } from '@/components/MembershipStatusCard';
import NavigateToGuilds from '@/components/NavigateToGuilds';
import { CharitableLoanAccount } from '@/components/CharitableLoanAccount';
import { LegalFormationStatus } from '@/components/LegalFormationStatus';
import { C20BalanceDisplay } from '@/components/C20BalanceDisplay';
import { FreshStartDialog } from '@/components/FreshStartDialog';
import { DeckCardFrame } from '@/components/DeckCardFrame';
import { WispChaseLauncher } from '@/components/WispChaseLauncher';
import { CrowFeatherBadge } from '@/components/CrowFeatherDisplay';
import { CrowFeatherNotification } from '@/components/CrowFeatherNotification';
import { CrowFeather } from '@/lib/crowFeatherService';

// Icons
import { 
  Palette, Users, ExternalLink, Rocket, Award, Utensils, Scale,
  ShoppingBag, ShoppingCart, Briefcase, Mic2, BookOpen, Globe, Wrench,
  ChefHat, Shield, Flame
} from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { discoveryLevel, isLoading: discoveryLoading } = useDiscovery();
  
  const [credits, setCredits] = useState<any>(null);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  const [membershipPaid, setMembershipPaid] = useState<boolean>(false);
  const [showChaseLauncher, setShowChaseLauncher] = useState(false);
  const [crowFeatherEarned, setCrowFeatherEarned] = useState<CrowFeather | null>(null);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    const { data: creditsData } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (creditsData) {
      setCredits({
        ...creditsData,
        total_credits: creditsData.eoi_credits || 0,
        used_credits: creditsData.eoi_used_credits || 0,
        available_credits: (creditsData.eoi_credits || 0) - (creditsData.eoi_used_credits || 0),
      });
      setMembershipPaid(true);
    }

    const { data: ownedProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    setIsProjectOwner(ownedProjects && ownedProjects.length > 0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center gap-2">
          <div>
            <h1 className="text-lg md:text-2xl font-bold truncate">Member Dashboard</h1>
            {!discoveryLoading && (
              <p className="text-xs text-muted-foreground">
                Discovery Level: {discoveryLevel} • Explore to unlock more features
              </p>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {/* Crow Feather Badge */}
            {user && <CrowFeatherBadge userId={user.id} />}
            
            {/* Will-o'-Wisp Chase Mode */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowChaseLauncher(true)}
              className="touch-manipulation text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
              title="Will-o'-Wisp Chase"
            >
              <Flame className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Chase</span>
            </Button>
            <FreshStartDialog />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/themes')}
              className="touch-manipulation"
              title="Customize Portal Theme"
            >
              <Palette className="h-4 w-4" />
            </Button>
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
            {/* ════════════════════════════════════════════════════════════════
                ESSENTIALS - Always visible for authenticated users
               ════════════════════════════════════════════════════════════════ */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Essentials
              </h2>
              
              <MembershipStakePayment 
                hasPaid={membershipPaid} 
                onPaymentSuccess={() => {
                  setMembershipPaid(true);
                  loadUserData();
                }}
              />
              
              <MembershipStatusCard />
              
              {/* C+20 Reciprocity Balance - for business owners */}
              <C20BalanceDisplay variant="full" />
              
              {membershipPaid && <GuildStakeProgression />}
              
              {/* Core Navigation */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <NavigateToGuilds />
                
                <DiscoverySlot
                  slug="crowdfunding-hub"
                  title="Crowdfunding Hub"
                  hint="Visit the Crowdfunding page to discover campaign management tools"
                  discoveryRoute="/crowdfunding"
                  icon={<Rocket className="h-5 w-5" />}
                >
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
                </DiscoverySlot>
                
                <DiscoveryGated slug="medallion-management">
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
                </DiscoveryGated>
              </div>
            </section>

            {/* ════════════════════════════════════════════════════════════════
                INITIATIVES - The Sweet 16
               ════════════════════════════════════════════════════════════════ */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Initiatives
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DiscoverySlot
                  slug="lets-make-dinner"
                  title="Let's Make Dinner"
                  hint="Discover community cooking by visiting the Let's Make Dinner page"
                  discoveryRoute="/initiatives/lets-make-dinner"
                  icon={<Utensils className="h-5 w-5" />}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-primary/20 bg-gradient-to-br from-orange-500/5 to-amber-500/10"
                    onClick={() => navigate('/initiatives/lets-make-dinner')}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-orange-600" />
                        Let's Make Dinner
                      </CardTitle>
                      <CardDescription>
                        Order meals from community cooks
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </DiscoverySlot>
                
                <DiscoverySlot
                  slug="defense-klaus"
                  title="Defense Klaus™"
                  hint="Learn about the safety bracelet funding the Legal Defense Fund"
                  discoveryRoute="/initiatives/defense-klaus"
                  icon={<Shield className="h-5 w-5" />}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-primary/20 bg-gradient-to-br from-purple-500/5 to-pink-500/10"
                    onClick={() => navigate('/initiatives/defense-klaus')}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-600" />
                        Defense Klaus™
                      </CardTitle>
                      <CardDescription>
                        For Someone You Love
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </DiscoverySlot>
                
                <DiscoverySlot
                  slug="lets-get-groceries"
                  title="Let's Get Groceries"
                  hint="Discover bulk grocery ordering for communities"
                  discoveryRoute="/initiatives/lets-get-groceries"
                  icon={<ShoppingCart className="h-5 w-5" />}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-primary/20 bg-gradient-to-br from-green-500/5 to-teal-500/10"
                    onClick={() => navigate('/initiatives/lets-get-groceries')}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                        Let's Get Groceries
                      </CardTitle>
                      <CardDescription>
                        Bulk grocery coordination
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </DiscoverySlot>
                
                <DiscoverySlot
                  slug="lets-go-shopping"
                  title="Let's Go Shopping"
                  hint="Discover the cooperative retail marketplace"
                  discoveryRoute="/initiatives/lets-go-shopping"
                  icon={<ShoppingBag className="h-5 w-5" />}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-primary/20 bg-gradient-to-br from-pink-500/5 to-rose-500/10"
                    onClick={() => navigate('/initiatives/lets-go-shopping')}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-pink-600" />
                        Let's Go Shopping
                      </CardTitle>
                      <CardDescription>
                        Cooperative retail marketplace
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </DiscoverySlot>
              </div>
              
              {/* More initiatives - only show if discovery level is higher */}
              <DiscoveryGated slug="harper-guild">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate('/initiatives/harper-guild')}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                        Harper Guild
                      </CardTitle>
                      <CardDescription>Publishing cooperative</CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate('/initiatives/jukebox')}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mic2 className="h-5 w-5 text-cyan-600" />
                        JukeBox
                      </CardTitle>
                      <CardDescription>Music distribution platform</CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate('/initiatives/didasko')}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                        Didasko
                      </CardTitle>
                      <CardDescription>Academic learning platform</CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate('/initiatives/international')}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        International
                      </CardTitle>
                      <CardDescription>Global cooperative network</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </DiscoveryGated>
            </section>

            {/* ════════════════════════════════════════════════════════════════
                GOVERNANCE - Legal & Financial
               ════════════════════════════════════════════════════════════════ */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Governance
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <DiscoverySlot
                  slug="legal-formation"
                  title="Legal Formation"
                  hint="Discover LLC/C-Corp formation services for your projects"
                  discoveryRoute="/legal-formation"
                  icon={<Scale className="h-5 w-5" />}
                >
                  <LegalFormationStatus />
                </DiscoverySlot>
                
                <DiscoverySlot
                  slug="charitable-loan"
                  title="Charitable Loans"
                  hint="Discover the Charitable Loan Account for community lending"
                  discoveryRoute="/charitable-loans"
                  icon={<Briefcase className="h-5 w-5" />}
                >
                  <CharitableLoanAccount />
                </DiscoverySlot>
              </div>
            </section>

            {/* ════════════════════════════════════════════════════════════════
                ECONOMY - EOI, Credits, Investments
               ════════════════════════════════════════════════════════════════ */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Economy
              </h2>
              
              <DiscoverySlot
                slug="eoi-dashboard"
                title="Expression of Interest"
                hint="Toggle your EOI to discover project investment preferences"
                discoveryRoute="/eoi"
                icon={<Rocket className="h-5 w-5" />}
              >
                <div className="space-y-6">
                  <EOIToggle />
                  <ProjectPreferenceRanking />
                  <EOIDashboard />
                </div>
              </DiscoverySlot>
              
              <DiscoverySlot
                slug="investment-timeline"
                title="Investment Analytics"
                hint="View your investment history and projections"
                discoveryRoute="/portfolio"
                icon={<Briefcase className="h-5 w-5" />}
              >
                <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <RealTimeUserStats />
                  </div>
                  <div className="lg:col-span-1">
                    <InvestmentReportExporter />
                  </div>
                </div>

                <div className="grid gap-4 md:gap-6 lg:grid-cols-2 mt-4">
                  <EquityBreakdownCard />
                  <MilestoneNotifications />
                </div>

                <div className="grid gap-4 md:gap-6 lg:grid-cols-3 mt-4">
                  <div className="lg:col-span-2">
                    <InvestmentTimeline />
                  </div>
                  <div className="lg:col-span-1">
                    <ReferralManager />
                  </div>
                </div>
              </DiscoverySlot>
              
              {/* Credits summary - always visible if user has credits */}
              {credits && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard.credits')}</CardTitle>
                    <CardDescription>
                      ${Number(credits.available_credits || 0).toFixed(2)} {t('dashboard.creditsAvailable')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.useCredits')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* ════════════════════════════════════════════════════════════════
                TOOLS - Utilities and Admin
               ════════════════════════════════════════════════════════════════ */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Tools
              </h2>
              
              <DiscoverySlot
                slug="physical-badge"
                title="Physical Badge"
                hint="Order your physical membership badge"
                discoveryRoute="/badge-order"
                icon={<Award className="h-5 w-5" />}
              >
                <PhysicalBadgeReminder />
              </DiscoverySlot>
              
              {/* Quick navigation */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/marketplace')}>
                  <CardHeader>
                    <CardTitle className="text-sm">{t('dashboard.marketplace')}</CardTitle>
                    <CardDescription className="text-xs">{t('dashboard.browseProjects')}</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/projects')}>
                  <CardHeader>
                    <CardTitle className="text-sm">{t('projects.title')}</CardTitle>
                    <CardDescription className="text-xs">{t('dashboard.viewAllProjects')}</CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/portfolio')}>
                  <CardHeader>
                    <CardTitle className="text-sm">{t('dashboard.myPortfolio')}</CardTitle>
                    <CardDescription className="text-xs">{t('dashboard.trackInvestments')}</CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/medallions')}>
                  <CardHeader>
                    <CardTitle className="text-sm">{t('dashboard.myMedallions')}</CardTitle>
                    <CardDescription className="text-xs">{t('dashboard.viewBadges')}</CardDescription>
                  </CardHeader>
                </Card>
              </div>
              
              {/* Admin buttons */}
              <div className="flex flex-wrap gap-3">
                <DiscoveryGated slug="admin-roles">
                  {isProjectOwner && (
                    <Button
                      variant="outline"
                      onClick={() => navigate("/admin/roles")}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {t('dashboard.roles')}
                    </Button>
                  )}
                </DiscoveryGated>
                
                <Button
                  variant="outline"
                  onClick={() => navigate("/external-services")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('dashboard.externalServices')}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate("/workshop")}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Workshop
                </Button>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="portals">
            <DashboardPortalSwitcher />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Will-o'-Wisp Chase Launcher */}
      <WispChaseLauncher 
        isOpen={showChaseLauncher} 
        onClose={() => setShowChaseLauncher(false)}
        onCrowFeatherEarned={(feather) => setCrowFeatherEarned(feather)}
      />
      
      {/* Crow Feather Notification (shows when a feather is earned) */}
      <CrowFeatherNotification 
        feather={crowFeatherEarned}
        onDismiss={() => setCrowFeatherEarned(null)}
      />
    </div>
  );
}
