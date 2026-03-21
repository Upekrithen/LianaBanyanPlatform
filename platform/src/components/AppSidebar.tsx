import { Home, FolderKanban, ShoppingBag, Briefcase, Settings, FileCode, FlaskConical, ScrollText, FileX, PlusCircle, ListChecks, Globe, TrendingUp, Plug, Code, BookOpen, Award, Users, AlertTriangle, DollarSign, BarChart3, ShieldCheck, UserPlus, Wrench, Swords, Shield, HandshakeIcon, Map, Store, Newspaper, Send, Flag, Rocket, Trophy, Brain, Palette, Radio, Ghost, FileSignature, Star, Hammer, UserCheck, Timer, Heart, Sprout, Link2, Crosshair, Gift, Anchor, Scale, Factory, Repeat, Package, Truck } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { detectPortal } from "@/utils/portalDetector";
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

// Marketplace Portal Navigation
const marketplaceMainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
  { title: "Main Square", url: "/main-square", icon: Store },
  { title: "Portfolio", url: "/portfolio", icon: Briefcase },
  { title: "Medallions", url: "/medallions", icon: Award },
  { title: "HexIsle", url: "/hexisle-dashboard", icon: Map },
  { title: "Guilds", url: "/guilds", icon: Swords },
  { title: "Clans", url: "/clans", icon: Shield },
  { title: "Peer Contracts", url: "/peer-contracts", icon: HandshakeIcon },
  { title: "Daily News", url: "/daily-news", icon: Newspaper },
  { title: "BandWagon", url: "/bandwagon", icon: Rocket },
  { title: "Subscriptions", url: "/subscriptions", icon: Repeat },
  { title: "Storefront Builder", url: "/tools/storefront-builder", icon: Store },
  { title: "Provider Dashboard", url: "/dashboard/provider", icon: Package },
  { title: "Runner Dashboard", url: "/dashboard/runner", icon: Truck },
  { title: "Political Expedition", url: "/political-expedition", icon: Flag },
  { title: "XP Leaderboard", url: "/xp-leaderboard", icon: Trophy },
  { title: "Steward Command Post", url: "/steward", icon: Shield },
  { title: "Store Templates", url: "/store-templates", icon: Palette },
  { title: "Showcase Promotion", url: "/showcase-promotion", icon: Star },
  { title: "Ghost World Mall", url: "/ghost-world/mall", icon: Ghost },
  { title: "Creator Draft Pick", url: "/creator-draft-pick", icon: UserPlus },
  { title: "Crew Call", url: "/crew-call", icon: Hammer },
  { title: "Vouch & Recommend", url: "/vouch", icon: Heart },
  { title: "Chain Voting", url: "/chain-voting", icon: Link2 },
  { title: "Coverage Minutes", url: "/coverage-minutes", icon: Timer },
  { title: "Member Agreement", url: "/member-agreement", icon: FileSignature },
  { title: "Onboarding", url: "/onboarding/trickle", icon: UserCheck },
  { title: "Creator Showcase", url: "/creators", icon: Palette },
  { title: "Gleaner's Corner", url: "/gleaners-corner", icon: Sprout },
  { title: "Sponsorship Guide", url: "/sponsorship-guide", icon: BookOpen },
  { title: "Register IP", url: "/ip/register", icon: ShieldCheck },
  { title: "C+20 Reciprocity", url: "/c-plus-20", icon: Scale },
  { title: "Santa Ever After", url: "/santa", icon: Gift },
  { title: "Node Captain", url: "/node-captain", icon: Anchor },
  { title: "Star Chamber", url: "/star-chamber", icon: Scale },
  { title: "Tereno Certification", url: "/tereno-certification", icon: Award },
  { title: "The Forge", url: "/the-forge", icon: Factory },
  { title: "Proteus Anchor", url: "/proteus-anchor", icon: Anchor },
  { title: "Maker Spotlight", url: "/maker-spotlight", icon: Star },
  { title: "Designed to Be Broken", url: "/designed-to-be-broken", icon: Hammer },
];

const marketplaceAdminItems = [
  { title: "Create Project", url: "/admin/project/create", icon: PlusCircle, requiresOwner: true },
  { title: "Failure Queue", url: "/admin/failure-queue", icon: AlertTriangle, requiresAdmin: true },
  { title: "Template Setup", url: "/template-setup", icon: Code, requiresAdmin: true },
  { title: "Industry Pricing", url: "/admin/industry-pricing", icon: TrendingUp, requiresAdmin: true },
  { title: "Simulator", url: "/simulator", icon: FlaskConical, requiresAdmin: true },
  { title: "Task Log", url: "/task-log", icon: ScrollText, requiresAdmin: true },
  { title: "Sample XML", url: "/sample-xml", icon: FileX, requiresAdmin: true },
  { title: "Send Lists", url: "/send-lists", icon: Send, requiresAdmin: true },
  { title: "Q&A Intelligence", url: "/moneypenny/qa", icon: Brain, requiresAdmin: true },
  { title: "Social Command", url: "/moneypenny/social", icon: Radio, requiresAdmin: true },
  { title: "Circle Testing", url: "/testing/circles", icon: Crosshair, requiresAdmin: true },
];

// Business Portal Navigation
const businessMainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Workshop", url: "/workshop", icon: Wrench },
  { title: "Briefcase", url: "/briefcase", icon: Briefcase },
  { title: "Open Positions", url: "/positions", icon: Briefcase },
  { title: "Member Resources", url: "/member-resources", icon: Users },
  { title: "Agent Onboarding", url: "/agent-onboarding", icon: UserPlus },
];

const businessManagementItems = [
  { title: "Manage Positions", url: "/manage-positions", icon: Settings, requiresOwner: true },
  { title: "Create Project", url: "/create-project", icon: PlusCircle, requiresOwner: true },
  { title: "Task List", url: "/task-list", icon: ListChecks, requiresAdmin: true },
  { title: "Task Log", url: "/task-log", icon: ScrollText, requiresAdmin: true },
  { title: "Subdomain Manager", url: "/subdomain-manager", icon: Globe, requiresAdmin: true },
  { title: "Client API", url: "/client-api-manager", icon: Plug, requiresAdmin: true },
  { title: "Credentials", url: "/credential-management", icon: FileCode, requiresAdmin: true },
];

// Non-Profit Portal Navigation
const nonprofitMainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Funding Pool", url: "/funding-pool", icon: DollarSign },
  { title: "EOI Vesting", url: "/eoi-vesting", icon: BarChart3 },
  { title: "Gas Tracking", url: "/gas-tracking", icon: TrendingUp },
  { title: "Member Benefits", url: "/member-benefits", icon: Users },
];

// Network Portal Navigation
const networkMainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Industry Pricing", url: "/industry-pricing", icon: TrendingUp },
  { title: "XML Lockbox", url: "/xml-lockbox", icon: FileCode },
  { title: "Client API", url: "/client-api-manager", icon: Plug, requiresAdmin: true },
  { title: "Credentials", url: "/credential-management", icon: FileCode, requiresAdmin: true },
  { title: "Subdomain Manager", url: "/subdomain-manager", icon: Globe, requiresAdmin: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, isProjectOwner, isLoading } = useUserRole();
  const portal = detectPortal();

  const getNavCls = (path: string) => {
    const isActive = location.pathname === path || 
                     (path === "/projects" && location.pathname.startsWith("/project/"));
    return isActive 
      ? "bg-primary/10 text-primary font-medium" 
      : "hover:bg-muted/50";
  };

  const filterByRole = (items: any[]) => {
    return items.filter(item => {
      if (item.requiresAdmin && !isAdmin) return false;
      if (item.requiresOwner && !isProjectOwner && !isAdmin) return false;
      return true;
    });
  };

  if (!user) return null;

  // Select navigation items based on current portal
  let mainItems: any[] = [];
  let secondaryItems: any[] = [];
  let secondaryLabel = "Admin";

  switch (portal) {
    case 'marketplace':
      mainItems = marketplaceMainItems;
      secondaryItems = filterByRole(marketplaceAdminItems);
      secondaryLabel = "Admin";
      break;
    case 'business':
      mainItems = businessMainItems;
      secondaryItems = filterByRole(businessManagementItems);
      secondaryLabel = "Management";
      break;
    case 'nonprofit':
      mainItems = nonprofitMainItems;
      secondaryItems = [];
      break;
    case 'network':
      mainItems = filterByRole(networkMainItems);
      secondaryItems = [];
      break;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {secondaryItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{secondaryLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
