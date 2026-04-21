import { Home, Users, Briefcase, ShoppingBag, Building2, FileText, Settings, LayoutDashboard, Package, DollarSign, UserPlus, BadgeCheck, Network, BarChart3, Code, Palette, Wallet, Award, Users2, Layers, UserCheck, Shield, FileSignature, Library, Wrench, Target, Factory, Eye, Map, Megaphone, TreePine, Tv, Rocket, TrendingUp, Scale, User, CreditCard, Repeat, Truck, Hammer, Crown, Handshake, Download, Link2, Trophy, Coins, Anchor, Plug, PenTool, Store, Utensils, BookOpen } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { detectPortal } from "@/utils/portalDetector";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  portal: string;
  requiresAdmin?: boolean;
  requiresOwner?: boolean;
  requiresMedallion?: boolean;
}

const allNavItems: NavItem[] = [
  // Marketplace (.com)
  { title: "Home", url: "/", icon: Home, portal: "marketplace" },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, portal: "marketplace" },
  { title: "Browse", url: "/marketplace", icon: ShoppingBag, portal: "marketplace" },
  { title: "Products", url: "/products", icon: Package, portal: "marketplace" },
  { title: "Makers", url: "/makers", icon: Hammer, portal: "marketplace" },
  { title: "Creators", url: "/creators", icon: User, portal: "marketplace" },
  { title: "Projects", url: "/projects", icon: Briefcase, portal: "marketplace" },
  { title: "Production Queue", url: "/production-queue", icon: BarChart3, portal: "marketplace" },
  { title: "Guilds", url: "/guilds", icon: Users2, portal: "marketplace" },
  { title: "BandWagon", url: "/guilds/hub?tab=bandwagon", icon: TrendingUp, portal: "marketplace" },
  { title: "Subscriptions", url: "/subscriptions", icon: Repeat, portal: "marketplace" },
  { title: "Subscribe", url: "/subscribe", icon: Crown, portal: "marketplace" },
  { title: "Coalitions", url: "/coalitions", icon: Handshake, portal: "marketplace" },
  { title: "Storefront Builder", url: "/tools/storefront-builder", icon: Building2, portal: "marketplace" },
  { title: "Provider Dashboard", url: "/dashboard/provider", icon: Package, portal: "marketplace" },
  { title: "Runner Dashboard", url: "/dashboard/runner", icon: Truck, portal: "marketplace" },
  { title: "Passive Income", url: "/dashboard/onboarder", icon: DollarSign, portal: "marketplace" },
  { title: "Membership", url: "/dashboard/membership", icon: Crown, portal: "marketplace" },
  { title: "Buy Credits", url: "/buy-credits", icon: Coins, portal: "marketplace" },
  { title: "Earnings", url: "/dashboard/earnings", icon: DollarSign, portal: "marketplace" },
  { title: "Cue Card Generator", url: "/tools/cue-card-generator", icon: CreditCard, portal: "marketplace" },
  { title: "Treasure Maps", url: "/treasure-maps", icon: Map, portal: "marketplace" },
  { title: "Steward", url: "/steward", icon: Shield, portal: "marketplace" },
  { title: "Governance", url: "/governance/proposals", icon: Scale, portal: "marketplace" },
  { title: "Clans", url: "/clans", icon: Shield, portal: "marketplace" },
  { title: "Peer Contracts", url: "/peer-contracts", icon: FileSignature, portal: "marketplace" },
  { title: "All Positions", url: "/positions/browse", icon: Briefcase, portal: "marketplace" },
  { title: "Prototyping", url: "/prototyping", icon: Wrench, portal: "marketplace" },
  { title: "Asset Library", url: "/asset-library", icon: Library, portal: "marketplace" },
  { title: "Pre-Beta Recruits", url: "/pre-beta-recruits", icon: Target, portal: "marketplace", requiresAdmin: true },
  { title: "Manufacturing", url: "/manufacturing", icon: Factory, portal: "marketplace" },
  { title: "Canister System", url: "/factory/canister", icon: Wrench, portal: "marketplace" },
  { title: "Crew Call", url: "/crew-call", icon: Wrench, portal: "marketplace" },
  { title: "Cue Cards", url: "/cue-cards", icon: CreditCard, portal: "marketplace" },
  { title: "Cephas", url: "/cephas", icon: FileText, portal: "marketplace" },
  { title: "Herald", url: "/herald", icon: Megaphone, portal: "marketplace" },
  { title: "Sponsor", url: "/sponsor", icon: TreePine, portal: "marketplace" },
  { title: "Looking Glass", url: "/looking-glass", icon: Eye, portal: "marketplace" },
  { title: "52-Card Hunt", url: "/treasure-map-game", icon: Map, portal: "marketplace" },
  { title: "Hofund Studio", url: "/hofund", icon: Tv, portal: "marketplace" },
  { title: "Start a Project", url: "/cue-cards/campaigns", icon: Rocket, portal: "marketplace" },
  { title: "Captain's Deck", url: "/captain", icon: Anchor, portal: "marketplace" },
  { title: "Become Captain", url: "/captain/become", icon: Anchor, portal: "marketplace" },
  { title: "The 300", url: "/the300", icon: Shield, portal: "marketplace" },
  { title: "Find Your Path", url: "/start", icon: Map, portal: "marketplace" },
  { title: "Import a Product", url: "/import", icon: Download, portal: "marketplace" },
  { title: "Connected Services", url: "/dashboard/bridges", icon: Link2, portal: "marketplace" },
  { title: "Contests", url: "/contests", icon: Trophy, portal: "marketplace" },
  { title: "Theme Gallery", url: "/design/themes", icon: Palette, portal: "marketplace" },
  { title: "Local Campaigns", url: "/campaigns", icon: Store, portal: "marketplace" },
  { title: "Family Table", url: "/family-table", icon: Utensils, portal: "marketplace" },
  { title: "Cookbook", url: "/cookbook", icon: BookOpen, portal: "marketplace" },
  // "Funding Guide" removed — SEC compliance (no speculative-finance language)
  // "Blockchain" removed — not functional, confusing for users
  { title: "My Portfolio", url: "/portfolio", icon: LayoutDashboard, portal: "marketplace" },
  { title: "My Reputation", url: "/reputation", icon: Award, portal: "marketplace" }, // Will be made dynamic
  { title: "Profile Settings", url: "/profile-settings", icon: Settings, portal: "marketplace" },
  // "Cash Out" removed for SEC compliance — credits are not redeemable for cash

  // Business (.biz)
  { title: "Dashboard", url: "/", icon: LayoutDashboard, portal: "business" },
  { title: "The Kaleidoscope", url: "/kaleidoscope", icon: Map, portal: "business" },
  { title: "StoreFront Aggregation", url: "/storefront-aggregation", icon: ShoppingBag, portal: "business" },
  { title: "The Furnace", url: "/the-furnace", icon: Shield, portal: "business" },
  { title: "Maker Dashboard", url: "/dashboard/maker", icon: Hammer, portal: "business" },
  { title: "Position Categories", url: "/position-categories", icon: Layers, portal: "business" },
  { title: "LB Internal Hiring", url: "/lb-positions", icon: UserCheck, portal: "business", requiresAdmin: true },
  { title: "Contract Positions", url: "/positions", icon: Users, portal: "business" },
  { title: "Manage Positions", url: "/manage-positions", icon: UserPlus, portal: "business", requiresOwner: true },
  { title: "Task List", url: "/task-list", icon: FileText, portal: "business", requiresAdmin: true },
  { title: "Task Log", url: "/task-log", icon: BarChart3, portal: "business", requiresAdmin: true },
  { title: "Create Project", url: "/create-project", icon: Package, portal: "business", requiresOwner: true },
  { title: "Subdomain Manager", url: "/subdomain-manager", icon: Network, portal: "business", requiresAdmin: true },
  { title: "Credentials", url: "/credential-management", icon: BadgeCheck, portal: "business", requiresAdmin: true },
  { title: "Client API", url: "/client-api-manager", icon: Code, portal: "business", requiresAdmin: true },
  { title: "Member Resources", url: "/member-resources", icon: FileText, portal: "business" },
  { title: "Theme Management", url: "/themes", icon: Palette, portal: "business", requiresOwner: true },

  // Nonprofit (.org)
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, portal: "nonprofit" },
  { title: "Funding Pool", url: "/funding-pool", icon: DollarSign, portal: "nonprofit", requiresAdmin: true },
  { title: "EOI Vesting", url: "/eoi-vesting", icon: BarChart3, portal: "nonprofit" },
  { title: "Gas Tracking", url: "/gas-tracking", icon: BadgeCheck, portal: "nonprofit", requiresAdmin: true },
  { title: "Member Benefits", url: "/member-resources", icon: FileText, portal: "nonprofit" },

  // Network (.net) — organized around Deck Card categories
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, portal: "network" },
  { title: "Guilds", url: "/guilds", icon: Shield, portal: "network" },
  { title: "Tribes", url: "/tribes", icon: Users2, portal: "network" },
  { title: "B2B Contracts", url: "/b2b-contracts", icon: FileSignature, portal: "network" },
  { title: "Supply Chain", url: "/supply-chain", icon: Truck, portal: "network" },
  { title: "Production Schedules", url: "/production-schedules", icon: Factory, portal: "network" },
  { title: "Manifests", url: "/manifests", icon: Truck, portal: "network" },
  { title: "Industry Pricing", url: "/industry-pricing", icon: DollarSign, portal: "network" },
  { title: "Client API", url: "/client-api-manager", icon: Code, portal: "network", requiresOwner: true },
  { title: "Production Simulator", url: "/simulator", icon: Settings, portal: "network" },
];

export function UnifiedNavigation() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, isProjectOwner } = useUserRole();
  const currentPortal = detectPortal();

  // Check portal access levels
  const { data: portalAccess } = useQuery({
    queryKey: ['portal-access', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [teamMemberResult, medallionResult] = await Promise.all([
        supabase.from('project_member_contracts').select('id').eq('member_id', user.id).eq('status', 'active').limit(1).maybeSingle(),
        supabase.from('member_medallion_collection').select('id').eq('user_id', user.id).limit(1).maybeSingle(),
      ]);

      return {
        marketplace: true, // Always accessible
        business: !!teamMemberResult.data,
        nonprofit: !!medallionResult.data?.is_eligible,
        network: isProjectOwner || isAdmin, // Network requires owner/admin
      };
    },
    enabled: !!user,
  });

  const filterNavItems = (items: NavItem[]) => {
    return items.filter(item => {
      const isCurrentPortal = item.portal === currentPortal;
      const hasPortalAccess = portalAccess?.[item.portal as keyof typeof portalAccess];

      // Always allow current portal to render its nav, even if access check hasn't passed yet
      if (!isCurrentPortal && !hasPortalAccess) return false;

      // Role-based filtering
      if (item.requiresAdmin && !isAdmin) return false;
      if (item.requiresOwner && !isProjectOwner) return false;

      return true;
    });
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  const portalGroups = {
    marketplace: filterNavItems(allNavItems.filter(i => i.portal === 'marketplace')),
    business: filterNavItems(allNavItems.filter(i => i.portal === 'business')),
    nonprofit: filterNavItems(allNavItems.filter(i => i.portal === 'nonprofit')),
    network: filterNavItems(allNavItems.filter(i => i.portal === 'network')),
  };

  const portalLabels: Record<string, string> = {
    marketplace: 'Marketplace',
    business: 'Business',
    nonprofit: 'Non-Profit',
    network: 'Network',
  };

  const handlePortalSwitch = (portal: string) => {
    const domains = {
      marketplace: window.location.origin.replace(/\.(biz|org|net)/, '.com'),
      business: window.location.origin.replace(/\.(com|org|net)/, '.biz'),
      nonprofit: window.location.origin.replace(/\.(com|biz|net)/, '.org'),
      network: window.location.origin.replace(/\.(com|biz|org)/, '.net'),
    };

    window.location.href = domains[portal as keyof typeof domains] + '/dashboard';
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        {!collapsed && user && (
          <div className="p-4">
            <Select value={currentPortal} onValueChange={handlePortalSwitch}>
              <SelectTrigger>
                <SelectValue placeholder={portalLabels[currentPortal] || 'Select Portal'} />
              </SelectTrigger>
              <SelectContent>
                {(portalAccess?.marketplace || currentPortal === 'marketplace') && (
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                )}
                {(portalAccess?.business || currentPortal === 'business') && (
                  <SelectItem value="business">Business</SelectItem>
                )}
                {(portalAccess?.nonprofit || currentPortal === 'nonprofit') && (
                  <SelectItem value="nonprofit">Non-Profit</SelectItem>
                )}
                {(portalAccess?.network || currentPortal === 'network') && (
                  <SelectItem value="network">Network</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {Object.entries(portalGroups).map(([portal, items]) => {
          if (items.length === 0 || portal !== currentPortal) return null;

          return (
            <SidebarGroup key={portal}>
              {!collapsed && (
                <SidebarGroupLabel className="capitalize">{portal}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    // Make reputation URL dynamic with user ID
                    const itemUrl = item.url === '/reputation' && user ? `/reputation/${user.id}` : item.url;

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={itemUrl} end className={getNavCls}>
                            <item.icon className={collapsed ? "h-4 w-4" : "mr-2 h-4 w-4"} />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
