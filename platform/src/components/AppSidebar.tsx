import { useState } from "react";
import { Home, FolderKanban, ShoppingBag, Briefcase, Settings, FileCode, FlaskConical, ScrollText, FileX, PlusCircle, ListChecks, Globe, TrendingUp, Plug, Code, BookOpen, Award, Users, AlertTriangle, DollarSign, BarChart3, ShieldCheck, UserPlus, Wrench, Swords, Shield, HandshakeIcon, Map, Store, Newspaper, Send, Flag, Rocket, Trophy, Brain, Palette, Radio, Ghost, FileSignature, Star, Hammer, UserCheck, Timer, Heart, Sprout, Link2, Crosshair, Gift, Anchor, Scale, Factory, Repeat, Package, Truck, CreditCard, CalendarDays, Compass, Megaphone, User, GitBranch, Handshake, Banknote, Gavel, Crown, Download, Glasses, Camera, GraduationCap, Snowflake, FileText, ClipboardList, Wallet, ChevronRight, Route, Car, Activity } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { detectPortal } from "@/utils/portalDetector";
import { MembershipBadge } from "@/components/MembershipBadge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// ─── GROUPED Marketplace Navigation (was 96 flat items) ────────────────
// Each section collapses. Only the active section auto-expands.

interface NavItem {
  title: string;
  url: string;
  icon: any;
  requiresAdmin?: boolean;
  requiresOwner?: boolean;
}

interface NavSection {
  label: string;
  icon: any;
  items: NavItem[];
  /** URL prefixes that auto-expand this section */
  matchPrefixes: string[];
}

const MARKETPLACE_SECTIONS: NavSection[] = [
  {
    label: "Helm",
    icon: Compass,
    matchPrefixes: ["/", "/dashboard", "/member", "/wallet", "/buy-credits", "/finances", "/adapt", "/pipeline", "/earnings", "/membership", "/payouts"],
    items: [
      { title: "Home", url: "/", icon: Home },
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "My Profile", url: "/member/me", icon: User },
      { title: "Portfolio", url: "/portfolio", icon: Briefcase },
      { title: "Wallet", url: "/wallet", icon: Wallet },
      { title: "Buy Credits", url: "/buy-credits", icon: CreditCard },
      { title: "Finances", url: "/finances", icon: DollarSign },
      { title: "ADAPT Score", url: "/adapt", icon: BarChart3 },
      { title: "Membership", url: "/dashboard/membership", icon: Crown },
      { title: "Earnings", url: "/dashboard/earnings", icon: DollarSign },
      { title: "Payouts", url: "/dashboard/payouts", icon: Banknote },
    ],
  },
  {
    label: "Create & Sell",
    icon: Rocket,
    matchPrefixes: ["/projects", "/project/", "/production", "/canister", "/marketplace", "/main-square", "/tools/storefront", "/store-templates", "/emporium", "/the-forge", "/proteus", "/ip/"],
    items: [
      { title: "Projects", url: "/projects", icon: FolderKanban },
      { title: "Production", url: "/production", icon: Factory },
      { title: "Canister Configurator", url: "/canister/configurator", icon: Factory },
      { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
      { title: "Main Square", url: "/main-square", icon: Store },
      { title: "Storefront Builder", url: "/tools/storefront-builder", icon: Store },
      { title: "Store Templates", url: "/store-templates", icon: Palette },
      { title: "Design Emporium", url: "/emporium", icon: Palette },
      { title: "The Forge", url: "/the-forge", icon: Factory },
      { title: "Proteus Anchor", url: "/proteus-anchor", icon: Anchor },
      { title: "Register IP", url: "/ip/register", icon: ShieldCheck },
    ],
  },
  {
    label: "Community",
    icon: Users,
    matchPrefixes: ["/guilds", "/tribes", "/clans", "/coalitions", "/crew", "/family", "/peer", "/vouch", "/sponsorship", "/invite"],
    items: [
      { title: "Guilds", url: "/guilds", icon: Swords },
      { title: "Tribes", url: "/tribes", icon: Users },
      { title: "Clans", url: "/clans", icon: Shield },
      { title: "Coalitions", url: "/coalitions", icon: Handshake },
      { title: "Crew Call", url: "/crew-call", icon: Hammer },
      { title: "Crew Tables", url: "/crew-tables", icon: Users },
      { title: "Family Table", url: "/family-table", icon: Users },
      { title: "Peer Contracts", url: "/peer-contracts", icon: HandshakeIcon },
      { title: "Vouch & Recommend", url: "/vouch", icon: Heart },
      { title: "Sponsorship Guide", url: "/sponsorship-guide", icon: BookOpen },
      { title: "Invite Someone", url: "/invite", icon: UserPlus },
    ],
  },
  {
    label: "HexIsle & Games",
    icon: Map,
    matchPrefixes: ["/hexisle", "/campaigns", "/treasure", "/beacons", "/bounty", "/auction", "/design-democracy", "/xp"],
    items: [
      { title: "HexIsle", url: "/hexisle-dashboard", icon: Map },
      { title: "Campaigns", url: "/hexisle/campaigns", icon: Rocket },
      { title: "HexIsle Downloads", url: "/hexisle/downloads", icon: Download },
      { title: "Treasure Maps", url: "/treasure-maps", icon: Map },
      { title: "Treasure Map Builder", url: "/treasure-maps/builder", icon: Map },
      { title: "Beacon Run Creator", url: "/beacons/create", icon: Map },
      { title: "Design Democracy", url: "/design-democracy", icon: Gavel },
      { title: "XP Leaderboard", url: "/xp-leaderboard", icon: Trophy },
      { title: "Bounty Arena", url: "/dashboard/bounty-arena", icon: Trophy },
      { title: "Photo Bounties", url: "/bounty-photography", icon: Camera },
      { title: "Design Auction", url: "/auction", icon: Gavel },
    ],
  },
  {
    label: "Discover",
    icon: Compass,
    matchPrefixes: ["/ghost", "/daily-news", "/bandwagon", "/pioneers", "/creators", "/cold-start", "/maker", "/showcase", "/cephas", "/learn", "/neighborhoods", "/cities"],
    items: [
      { title: "Cold Start", url: "/cold-start", icon: Compass },
      { title: "Ghost World", url: "/ghost-world", icon: Globe },
      { title: "Ghost World Mall", url: "/ghost-world/mall", icon: Ghost },
      { title: "Daily News", url: "/daily-news", icon: Newspaper },
      { title: "BandWagon", url: "/bandwagon", icon: Rocket },
      { title: "Pioneer Showcase", url: "/pioneers", icon: Crown },
      { title: "Creator Showcase", url: "/creators", icon: Palette },
      { title: "Maker Spotlight", url: "/maker-spotlight", icon: Star },
      { title: "Showcase Promotion", url: "/showcase-promotion", icon: Star },
      { title: "Neighborhoods", url: "/neighborhoods", icon: Map },
      { title: "Cities", url: "/cities", icon: Map },
      { title: "Trunk Mirror", url: "/neighborhoods/trunk-mirror", icon: GitBranch },
    ],
  },
  {
    label: "Tools & Content",
    icon: Wrench,
    matchPrefixes: ["/cue-cards", "/dispatch", "/helm", "/calendar", "/recipe", "/content", "/oob", "/pipeline", "/my-improvements", "/v2/ops"],
    items: [
      { title: "Cue Cards", url: "/cue-cards", icon: CreditCard },
      { title: "My Cue Cards", url: "/dashboard/cue-cards", icon: CreditCard },
      { title: "Cue Card Creator", url: "/cue-cards/create", icon: CreditCard },
      { title: "Battery Dispatch", url: "/dispatch/compose", icon: Radio },
      { title: "Dispatch Queue", url: "/dispatch/queue", icon: Send },
      { title: "Helm Actions", url: "/dashboard/helm", icon: Compass },
      { title: "Content Center", url: "/helm/content", icon: FileText },
      { title: "Substrate Browser", url: "/helm/substrate", icon: Wrench },
      { title: "Bushel Dashboard", url: "/helm/bushels", icon: Wrench },
      { title: "Substrate Health", url: "/helm/substrate/health", icon: Activity },
      { title: "Codex Reader", url: "/codex", icon: FileText },
      { title: "Out of Bounds", url: "/dashboard/oob", icon: Megaphone },
      { title: "Calendar", url: "/calendar", icon: CalendarDays },
      { title: "Recipe Pot", url: "/bridge/recipe", icon: Sprout },
      { title: "My Pipeline", url: "/pipeline", icon: GitBranch },
      { title: "My Improvements", url: "/dashboard/my-improvements", icon: Wrench },
      { title: "Dispatch Health", url: "/v2/ops/dispatch-health", icon: Activity },
    ],
  },
  {
    label: "Money & Cards",
    icon: CreditCard,
    matchPrefixes: ["/lb-card", "/fund-card", "/war-chest", "/content-shield", "/coverage", "/medallions", "/chain"],
    items: [
      { title: "Medallions", url: "/medallions", icon: Award },
      { title: "My Chain", url: "/chain", icon: Link2 },
      { title: "LB Card", url: "/lb-card", icon: CreditCard },
      { title: "Card Funding", url: "/dashboard/fund-card", icon: CreditCard },
      { title: "War Chest", url: "/dashboard/war-chest", icon: Shield },
      { title: "Content Shield", url: "/content-shield", icon: Shield },
      { title: "Coverage Minutes", url: "/coverage-minutes", icon: Timer },
      { title: "C+20 Reciprocity", url: "/c-plus-20", icon: Scale },
    ],
  },
  {
    label: "Governance",
    icon: Scale,
    matchPrefixes: ["/star-chamber", "/chain-voting", "/political", "/node-captain", "/steward", "/member-agreement", "/onboarding", "/designed", "/v2/governance"],
    items: [
      { title: "Star Chamber", url: "/star-chamber", icon: Scale },
      { title: "Chain Voting", url: "/chain-voting", icon: Link2 },
      { title: "Harper Review", url: "/v2/governance/harper-review", icon: Shield },
      { title: "Political Expedition", url: "/political-expedition", icon: Flag },
      { title: "Node Captain", url: "/node-captain", icon: Anchor },
      { title: "Steward Command Post", url: "/steward", icon: Shield },
      { title: "Member Agreement", url: "/member-agreement", icon: FileSignature },
      { title: "Gleaner's Corner", url: "/gleaners-corner", icon: Sprout },
      { title: "Santa Ever After", url: "/santa", icon: Gift },
      { title: "Designed to Be Broken", url: "/designed-to-be-broken", icon: Hammer },
    ],
  },
  {
    label: "Services",
    icon: Package,
    matchPrefixes: ["/housing", "/wheels", "/v2/wheels", "/v2/rideshare", "/v2/lemon-lot", "/freezer", "/classroom", "/subscriptions", "/provider", "/runner", "/onboarder", "/tereno", "/creator-draft"],
    items: [
      { title: "Housing", url: "/housing", icon: Home },
      { title: "Local Wheels", url: "/v2/wheels", icon: Truck },
      { title: "Rideshare", url: "/v2/rideshare", icon: Route },
      { title: "Lemon Lot", url: "/v2/lemon-lot", icon: Car },
      { title: "Freezer Nodes", url: "/freezer-nodes", icon: Snowflake },
      { title: "Cooperative Classroom", url: "/classroom", icon: GraduationCap },
      { title: "Subscriptions", url: "/subscriptions", icon: Repeat },
      { title: "Subscription Channels", url: "/subscription-channels", icon: Repeat },
      { title: "Provider Dashboard", url: "/dashboard/provider", icon: Package },
      { title: "Runner Dashboard", url: "/dashboard/runner", icon: Truck },
      { title: "Passive Income", url: "/dashboard/onboarder", icon: DollarSign },
      { title: "Tereno Certification", url: "/tereno-certification", icon: Award },
      { title: "Creator Draft Pick", url: "/creator-draft-pick", icon: UserPlus },
    ],
  },
];

// Admin items (unchanged)
const marketplaceAdminItems: NavItem[] = [
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
  { title: "Social Maven", url: "/staff/social-media", icon: Megaphone, requiresAdmin: true },
  { title: "Founder Contacts", url: "/staff/founder-contacts", icon: UserCheck, requiresAdmin: true },
  { title: "Pudding Analytics", url: "/staff/pudding-analytics", icon: BarChart3, requiresAdmin: true },
  { title: "Circle Testing", url: "/testing/circles", icon: Crosshair, requiresAdmin: true },
  { title: "Piggyback Review", url: "/dashboard/piggyback-review", icon: Wrench, requiresAdmin: true },
  { title: "Trunk Mirror Review", url: "/dashboard/trunk-mirror-review", icon: GitBranch, requiresAdmin: true },
  { title: "Content Shield Admin", url: "/v2/ops/content-shield", icon: Shield, requiresAdmin: true },
  { title: "X-Ray Feedback", url: "/dashboard/xray-feedback", icon: Glasses, requiresAdmin: true },
  { title: "Spice Editor", url: "/staff/spice-editor", icon: Sprout, requiresAdmin: true },
  { title: "Launch Schedule", url: "/staff/launch-schedule", icon: CalendarDays, requiresAdmin: true },
  { title: "Ingestion Monitor", url: "/staff/engagement-ingestion", icon: Timer, requiresAdmin: true },
  { title: "V2 Tracker", url: "/staff/v2-tracker", icon: ClipboardList, requiresAdmin: true },
];

// Other portal navs (unchanged — they're already well-scoped)
const businessMainItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Workshop", url: "/workshop", icon: Wrench },
  { title: "Briefcase", url: "/briefcase", icon: Briefcase },
  { title: "Open Positions", url: "/positions", icon: Briefcase },
  { title: "Member Resources", url: "/member-resources", icon: Users },
  { title: "Agent Onboarding", url: "/agent-onboarding", icon: UserPlus },
];

const businessManagementItems: NavItem[] = [
  { title: "Manage Positions", url: "/manage-positions", icon: Settings, requiresOwner: true },
  { title: "Create Project", url: "/create-project", icon: PlusCircle, requiresOwner: true },
  { title: "Task List", url: "/task-list", icon: ListChecks, requiresAdmin: true },
  { title: "Task Log", url: "/task-log", icon: ScrollText, requiresAdmin: true },
  { title: "Subdomain Manager", url: "/subdomain-manager", icon: Globe, requiresAdmin: true },
  { title: "Client API", url: "/client-api-manager", icon: Plug, requiresAdmin: true },
  { title: "Credentials", url: "/credential-management", icon: FileCode, requiresAdmin: true },
];

const nonprofitMainItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Funding Pool", url: "/funding-pool", icon: DollarSign },
  { title: "EOI Vesting", url: "/eoi-vesting", icon: BarChart3 },
  { title: "Gas Tracking", url: "/gas-tracking", icon: TrendingUp },
  { title: "Member Benefits", url: "/member-benefits", icon: Users },
];

const networkMainItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Industry Pricing", url: "/industry-pricing", icon: TrendingUp },
  { title: "XML Lockbox", url: "/xml-lockbox", icon: FileCode },
  { title: "Client API", url: "/client-api-manager", icon: Plug, requiresAdmin: true },
  { title: "Credentials", url: "/credential-management", icon: FileCode, requiresAdmin: true },
  { title: "Subdomain Manager", url: "/subdomain-manager", icon: Globe, requiresAdmin: true },
];

// ─── Collapsible Section Component ─────────────────────────────────────

function CollapsibleSection({
  section,
  isOpen,
  onToggle,
  getNavCls,
  sidebarState,
}: {
  section: NavSection;
  isOpen: boolean;
  onToggle: () => void;
  getNavCls: (path: string) => string;
  sidebarState: string;
}) {
  const Icon = section.icon;
  const collapsed = sidebarState === "collapsed";

  return (
    <div className="mb-0.5">
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider
                    text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors
                    ${isOpen ? 'text-foreground bg-muted/30' : ''}`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{section.label}</span>
            <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
          </>
        )}
      </button>
      {isOpen && (
        <SidebarMenu className="mt-0.5 ml-1">
          {section.items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} end={item.url === "/"} className={getNavCls(item.url)}>
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      )}
    </div>
  );
}

// ─── Main Sidebar ──────────────────────────────────────────────────────

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, isProjectOwner, isLoading } = useUserRole();
  const portal = detectPortal();

  // ALL sections start collapsed — user clicks to expand. Less overwhelming.
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (label: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const getNavCls = (path: string) => {
    const isActive = location.pathname === path ||
                     (path === "/projects" && location.pathname.startsWith("/project/")) ||
                     (path === "/production" && location.pathname.startsWith("/production/"));
    return isActive
      ? "bg-primary/10 text-primary font-medium"
      : "hover:bg-muted/50";
  };

  const filterByRole = (items: NavItem[]) => {
    return items.filter(item => {
      if (item.requiresAdmin && !isAdmin) return false;
      if (item.requiresOwner && !isProjectOwner && !isAdmin) return false;
      return true;
    });
  };

  if (!user) return null;

  // Non-marketplace portals: keep simple flat navigation (they're already well-scoped)
  if (portal !== 'marketplace') {
    let mainItems: NavItem[] = [];
    let secondaryItems: NavItem[] = [];
    let secondaryLabel = "Admin";

    switch (portal) {
      case 'business':
        mainItems = businessMainItems;
        secondaryItems = filterByRole(businessManagementItems);
        secondaryLabel = "Management";
        break;
      case 'nonprofit':
        mainItems = nonprofitMainItems;
        break;
      case 'network':
        mainItems = filterByRole(networkMainItems);
        break;
      default:
        return null;
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
        {state !== "collapsed" && (
          <SidebarFooter className="p-3">
            <MembershipBadge compact={false} />
          </SidebarFooter>
        )}
      </Sidebar>
    );
  }

  // ─── MARKETPLACE: Collapsible grouped sections ─────────────────────
  const adminItems = filterByRole(marketplaceAdminItems);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="space-y-0.5 py-1">
              {MARKETPLACE_SECTIONS.map((section) => (
                <CollapsibleSection
                  key={section.label}
                  section={section}
                  isOpen={openSections.has(section.label)}
                  onToggle={() => toggleSection(section.label)}
                  getNavCls={getNavCls}
                  sidebarState={state}
                />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
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
      {state !== "collapsed" && (
        <SidebarFooter className="p-3">
          <MembershipBadge compact={false} />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
