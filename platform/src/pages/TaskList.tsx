import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Download, CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { PlantLifecycleView } from "@/components/PlantLifecycleView";
import { TestFlowManager } from "@/components/TestFlowManager";
import { TaskSpecCard } from "@/components/TaskSpecCard";
import { NavigationMap } from "@/components/NavigationMap";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import TASKS_MD from "../../TASKS.md?raw";
import { PortalPageLayout } from '@/components/PortalPageLayout';

const TaskList = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch actual tasks from database
  const { data: dbTasks, isLoading } = useQuery({
    queryKey: ['project-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*, projects(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch reference tasks from database (replaces static array)
  const { data: referenceTasks, isLoading: isLoadingReferenceTasks } = useQuery({
    queryKey: ['reference-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reference_tasks')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Real-time subscription for reference tasks
  useEffect(() => {
    const channel = supabase
      .channel('reference_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reference_tasks'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['reference-tasks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Calculate progress from actual database tasks
  const tasks = referenceTasks?.map((task) => ({
    category: task.category as string,
    status: task.status as string,
    completedDate: task.completed_date as string | null,
    priority: task.priority as string | null,
    dependencies: task.dependencies as string | null,
    description: task.description as string | null,
    items: Array.isArray(task.items)
      ? (task.items as Array<{ id: string; title: string; desc: string; completed: boolean }> )
      : []
  })) || [];

  // Calculate progress from database
  const completedGroupsCount = tasks.filter(t => t.status === 'completed').length;
  const totalGroupsCount = tasks.length;
  const progressPercent = totalGroupsCount ? Math.round((completedGroupsCount / totalGroupsCount) * 100) : 0;

  // Mutation to update task completion status
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const { error } = await supabase
        .from('project_tasks')
        .update({
          status: completed ? 'completed' : 'pending',
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      toast({
        title: "Task Updated",
        description: "Task status has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive"
      });
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = generateTextContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-tasks-reflist-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded",
      description: "REFLIST has been downloaded as a text file.",
    });
  };

  const generateTextContent = () => {
    return `PROJECT TASKS REFERENCE LIST
Generated: ${new Date().toLocaleString()}

====================
1. SUBDOMAIN STORAGE SYSTEM
====================

Portal Architecture Overview:
- Each project can have a dedicated subdomain (e.g., tereno.hexisle.com)
- Subdomains serve as public-facing portals showing project data
- Data pulled from XML modules stored in project_modules table
- Automated daily sync keeps data current

Tasks:
□ 1.1 Database Setup
  - Table: project_subdomains (id, project_id, subdomain, is_active, created_at, updated_at)
  - Unique constraint on subdomain
  - Foreign key to projects table
  - RLS policies for project owners

□ 1.2 Subdomain Management UI
  - Add subdomain configuration in AdminProject page
  - Input field for subdomain name
  - Validation for subdomain availability
  - Display current subdomain status

□ 1.3 SubdomainRouter Component Enhancement
  - Detect subdomain from URL
  - Query project_subdomains table
  - Route to appropriate project portal view
  - Handle subdomain not found scenarios

□ 1.4 Public Portal View
  - Create dedicated portal layout (no sidebar/auth required)
  - Display project information from XML
  - Show all products and production levels
  - Include voting/pledge interface
  - Mobile-responsive design

□ 1.5 DNS & Deployment
  - Wildcard DNS configuration (*.hexisle.com)
  - Update deployment settings for subdomain routing
  - SSL certificate handling for subdomains
  - Testing and validation

====================
2. PROGRESSIVE WEB APP (PWA) FEATURES
====================

□ 2.1 Service Worker Setup
  - Create service worker for offline functionality
  - Cache static assets and API responses
  - Implement background sync for votes/pledges
  - Handle online/offline state transitions

□ 2.2 Manifest Configuration
  - Create manifest.json with app metadata
  - Define icons for various device sizes
  - Set display mode and theme colors
  - Configure start URL and scope

□ 2.3 Install Prompt
  - Detect PWA install capability
  - Show install prompt to users
  - Handle installation events
  - Provide UI feedback

□ 2.4 Offline Mode UI
  - Display offline indicator
  - Queue actions when offline
  - Sync queued actions when back online
  - Show sync status to users

□ 2.5 Push Notifications
  - Set up push notification service
  - Request notification permissions
  - Send notifications for project updates
  - Handle notification clicks

====================
3. AUTOMATIC DAILY SYNC
====================

□ 3.1 Edge Function: Daily Sync Scheduler
  - Create Supabase edge function
  - Schedule daily execution (cron job)
  - Fetch all active projects
  - Generate new XML modules for each project

□ 3.2 Sync Status Tracking
  - Add last_synced_at to projects table
  - Add sync_status field (pending/syncing/completed/failed)
  - Log sync attempts and results
  - Display sync status in admin UI

□ 3.3 Manual Sync Trigger
  - Add "Sync Now" button in AdminProject
  - Call generate-project-module function
  - Show progress indicator
  - Display success/error messages

□ 3.4 Sync Conflict Resolution
  - Handle concurrent sync attempts
  - Version conflict detection
  - Rollback mechanism for failed syncs
  - Audit trail for sync operations

□ 3.5 Notification System
  - Email notifications for sync failures
  - Dashboard alerts for project owners
  - Sync summary reports
  - Error logging and monitoring

====================
4. REAL-TIME DYNAMIC CALCULATIONS DISPLAY
====================

□ 4.1 Real-time Vote/Pledge Updates
  - Implement Supabase Realtime subscriptions
  - Subscribe to production_levels changes
  - Subscribe to user_votes changes
  - Auto-update UI without page refresh

□ 4.2 Dynamic Metrics Display
  - Current votes vs. votes needed
  - Volume discount percentage
  - Units remaining until next level
  - Funding progress indicators

□ 4.3 Live Leaderboard
  - Top contributors by project
  - Top products by votes
  - Recent activity feed
  - Animated transitions

□ 4.4 Visual Indicators
  - Progress bars with animations
  - Milestone celebrations (confetti, etc.)
  - Threshold notifications
  - Color-coded status indicators

□ 4.5 Performance Optimization
  - Debounce real-time updates
  - Batch multiple updates
  - Optimize re-renders
  - Lazy load heavy components

====================
5. ENHANCED BLOCKCHAIN FEATURES ✅
====================

✓ 5.1 NFT Integration
  - ERC-1155 multi-token standard deployed
  - Medallion minting via edge function
  - 4 tiers (Bronze/Silver/Gold/Platinum)
  - Integrated with eligibility system

✓ 5.2 Smart Contract Interaction
  - Custom ERC-1155 contract deployed on Base
  - Batch minting with gas estimation
  - Automated gas allocation from LB pool
  - Transaction tracking and error handling

✓ 5.3 Wallet Connection
  - RainbowKit integration complete
  - WalletConnectButton component
  - Multi-wallet support (MetaMask, Coinbase, etc.)
  - Network switching (Base/Base Sepolia)

✓ 5.4 Token Economics
  - Gas costs funded from LB pool (1%)
  - Medallion tiers with supply limits
  - blockchain_gas_costs tracking table
  - Real-time gas budget monitoring

✓ 5.5 Blockchain Explorer
  - BaseScan integration with direct links
  - QR codes for mobile verification
  - Transaction hash tracking
  - Verification badges and metadata display

====================
6. MEMBER DASHBOARD ENHANCEMENTS
====================

□ 6.1 Personalized Dashboard
  - Display subscribed projects
  - Show contribution summary
  - Track voting history
  - Display earned rewards/tokens

□ 6.2 Activity Feed
  - Recent votes and pledges
  - Project updates and milestones
  - Community announcements
  - Personalized recommendations

□ 6.3 Analytics & Insights
  - Contribution performance charts
  - Project growth metrics
  - Comparative analysis
  - Service value projections

□ 6.4 Social Features
  - Follow other members
  - Share achievements
  - Comment on projects
  - Private messaging

□ 6.5 Gamification
  - Achievement badges
  - Reputation points
  - Leaderboards
  - Challenges and quests

====================
TOTAL TASKS: 36
====================

PRIORITY LEVELS:
- HIGH: Subdomain Storage System (Items 1.1-1.5)
- HIGH: Automatic Daily Sync (Items 3.1-3.3)
- MEDIUM: Real-time Calculations (Items 4.1-4.4)
- MEDIUM: PWA Features (Items 2.1-2.3)
- LOW: Blockchain Features (Items 5.1-5.5)
- LOW: Member Dashboard Enhancements (Items 6.1-6.5)

DEPENDENCIES:
- Subdomain system must be complete before portal view
- Daily sync requires working XML generation
- Real-time features require Realtime enabled on tables
- PWA requires service worker before offline mode
- Blockchain requires wallet connection first

ESTIMATED TIMELINE:
- Phase 1 (Weeks 1-2): Subdomain system + Daily sync
- Phase 2 (Weeks 3-4): Real-time features + PWA basics
- Phase 3 (Weeks 5-6): Advanced PWA + Member dashboard
- Phase 4 (Weeks 7-8): Blockchain integration
`;
  };

  const taskSpecs: Record<string, any> = {
    "5. BLOCKCHAIN INFRASTRUCTURE 🔥": {
      criticalDecisions: [
        "Choose blockchain network: Base (Ethereum L2) for low gas fees vs Ethereum mainnet for security",
        "NFT standard selection: ERC-721 for unique medallions vs ERC-1155 for batch minting efficiency",
        "Wallet integration strategy: RainbowKit (multi-wallet) vs single provider like MetaMask",
        "Gas fee coverage: Project pays initially vs users pay own fees from the start"
      ],
      technicalSpecs: [
        "Smart Contract Stack: MedallionNFT (ERC-721), EquityRegistry, IPLockbox contracts",
        "Frontend: wagmi + viem for Web3 interactions, RainbowKit for wallet connection",
        "Backend: Edge functions for minting coordination, metadata generation, and QR code linking",
        "Testing: Base Sepolia testnet before mainnet deployment",
        "Storage: IPFS for NFT metadata, Supabase for off-chain QR/user data mapping"
      ],
      suggestions: [
        "Start with Base Sepolia testnet to avoid mainnet costs during development",
        "Use Thirdweb SDK for rapid smart contract deployment and testing",
        "Implement gasless transactions using relayers for better UX",
        "Create medallion preview/simulator before actual minting",
        "Set up blockchain event listeners for automatic database sync"
      ],
      risks: [
        "Gas fee volatility could make minting expensive during network congestion",
        "Smart contract bugs are immutable - thorough auditing required",
        "Wallet adoption barrier for non-crypto users",
        "Regulatory compliance for participation-backed tokens varies by jurisdiction"
      ]
    },
    "3. AUTOMATIC DAILY SYNC": {
      criticalDecisions: [
        "Sync frequency: Daily at specific time vs continuous micro-syncs throughout the day",
        "Conflict resolution: Last-write-wins vs manual review for conflicting changes",
        "Failure handling: Retry logic vs alert-and-skip to next project",
        "Version control: Keep all historical XMLs vs only latest + previous"
      ],
      technicalSpecs: [
        "Supabase Edge Function with pg_cron scheduler (cron.schedule)",
        "Database: Add sync_status, last_synced_at, sync_attempt_count to projects table",
        "Logging: Create sync_audit_log table for tracking all sync operations",
        "Edge Function endpoint: /sync-all-projects (cron) and /sync-project/:id (manual)",
        "Rate limiting: Batch processing to avoid overwhelming database"
      ],
      suggestions: [
        "Schedule sync at 2 AM UTC when traffic is lowest",
        "Implement incremental sync - only process projects with changes since last sync",
        "Add webhook notifications to Slack/Discord for sync failures",
        "Create admin dashboard showing sync health metrics",
        "Cache frequently accessed XML data to reduce database load"
      ],
      risks: [
        "Sync failures could leave data stale for 24+ hours",
        "High project count could cause sync to exceed edge function timeout",
        "Concurrent manual sync + auto sync could cause race conditions"
      ]
    },
    "4. REAL-TIME DYNAMIC CALCULATIONS DISPLAY": {
      criticalDecisions: [
        "Update strategy: Push all changes vs only broadcast deltas to reduce bandwidth",
        "Subscription scope: Per-project channels vs global channel with filtering",
        "Debounce timing: Update UI every 500ms vs 2 seconds for heavy activity",
        "Fallback behavior: Polling every 10s when websocket fails vs show stale warning"
      ],
      technicalSpecs: [
        "Enable Realtime: ALTER PUBLICATION supabase_realtime ADD TABLE production_levels, user_votes",
        "Client subscriptions: supabase.channel().on('postgres_changes', {table: 'production_levels'})",
        "State management: React Query for caching + Realtime for live updates",
        "Optimistic updates: Show changes immediately, rollback on error",
        "Connection management: Auto-reconnect on disconnect, exponential backoff"
      ],
      suggestions: [
        "Use React Query mutations with onMutate for instant UI feedback",
        "Batch multiple rapid updates within 1 second window",
        "Show connection status indicator (connected/reconnecting/offline)",
        "Implement progressive enhancement - works without realtime, better with it",
        "Add animation on vote count changes for visual feedback"
      ],
      risks: [
        "High vote volume could overwhelm clients with update messages",
        "Websocket connections consume server resources - monitor limits",
        "Stale data if client loses connection and doesn't detect it"
      ]
    },
    "2. PROGRESSIVE WEB APP (PWA) FEATURES": {
      criticalDecisions: [
        "Caching strategy: Network-first vs Cache-first vs Stale-while-revalidate",
        "Offline data: Store all projects locally vs only subscribed projects",
        "Update frequency: Check for app updates on every launch vs weekly",
        "Storage limits: What to cache when reaching browser quota (5-50MB typical)"
      ],
      technicalSpecs: [
        "Service Worker: Workbox library for lifecycle management and caching strategies",
        "Manifest: manifest.json with display: 'standalone', icons 192x192 and 512x512",
        "Offline detection: navigator.onLine + fetch() error handling",
        "Background Sync: Queue failed requests, sync when connection restored",
        "Push API: Service worker push event listener + notification display"
      ],
      suggestions: [
        "Start with basic SW caching static assets (HTML, CSS, JS, images)",
        "Use Workbox's GenerateSW for automatic precaching config",
        "Implement 'Add to Home Screen' prompt after 2+ visits",
        "Cache API responses in IndexedDB for offline access",
        "Show offline banner and queue indicator when network unavailable"
      ],
      risks: [
        "Service worker bugs can break entire app - need kill switch",
        "Cached assets can become stale if update strategy fails",
        "Push notification permissions often denied by users",
        "iOS PWA support lags behind Android"
      ]
    },
    "6. MEMBER DASHBOARD ENHANCEMENTS": {
      criticalDecisions: [
        "Data aggregation: Real-time calculations vs pre-computed daily rollups",
        "Social features scope: Public profiles vs invite-only connections",
        "Gamification rewards: Blockchain tokens vs platform-only points",
        "Analytics depth: Basic metrics vs advanced predictive modeling"
      ],
      technicalSpecs: [
        "Dashboard data: Aggregate queries joining user_votes, medallion_eligibility, pledges",
        "Charts library: Recharts for React integration and responsive design",
        "Social tables: user_follows, user_comments, direct_messages with RLS policies",
        "Gamification: achievements table, user_reputation computed column",
        "Notifications: In-app notification_queue table + real-time subscription"
      ],
      suggestions: [
        "Use React Query for dashboard data with staleTime: 60000 (1 min)",
        "Implement infinite scroll for activity feed using cursor pagination",
        "Add export functionality for contribution history (CSV/PDF)",
        "Create achievement unlock animations with confetti library",
        "Build recommendation engine based on user voting patterns"
      ],
      risks: [
        "Complex aggregation queries could slow dashboard load times",
        "Social features need robust moderation tools",
        "Gamification could encourage spam if not balanced properly"
      ]
    },
    "1. SUBDOMAIN STORAGE SYSTEM ✅": {
      criticalDecisions: [
        "✅ Subdomain pattern: project-specific (tereno.hexisle.com) vs generic (portal.hexisle.com?id=X)",
        "✅ DNS provider: Cloudflare for easy wildcard DNS + SSL",
        "✅ Routing: Client-side detection vs server-side redirect",
        "✅ Data access: Public XML endpoint vs authenticated API calls"
      ],
      technicalSpecs: [
        "✅ Database: project_subdomains table with unique constraint on subdomain",
        "✅ DNS: Wildcard CNAME (*.hexisle.com) pointing to Firebase hosting",
        "✅ Routing: SubdomainRouter component checking window.location.hostname",
        "✅ SSL: Automatic certificate generation via Cloudflare",
        "✅ Portal: Dedicated ProjectPortal component without auth requirements"
      ],
      suggestions: [
        "✅ Implemented subdomain validation regex: ^[a-z0-9-]{3,63}$",
        "✅ Added subdomain availability check before save",
        "✅ Created public portal view with voting interface",
        "✅ Set up wildcard DNS and SSL certificates",
        "✅ Added analytics tracking for subdomain visits"
      ],
      risks: []
    }
  };


  return (
    <PortalPageLayout>
      <div className="flex justify-between items-start mb-6 print:mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Project Management</h1>
          <p className="text-muted-foreground">Task lists and site structure overview</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={handlePrint} size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Completed summary sourced from TASKS.md */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>Synced from TASKS.md (authoritative)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{completedGroupsCount}</div>
              <div className="text-sm text-muted-foreground">Completed Groups</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{totalGroupsCount}</div>
              <div className="text-sm text-muted-foreground">Total Groups</div>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{progressPercent}%</div>
              <div className="text-sm text-green-700">Progress</div>
            </div>
          </div>
          {tasks.filter(t => t.status === 'completed').length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Completed Task Groups</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {tasks.filter(t => t.status === 'completed').map((task) => (
                  <li key={task.category} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{task.category}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="tasks">Project Tasks</TabsTrigger>
          <TabsTrigger value="sitemap">Site Map</TabsTrigger>
          <TabsTrigger value="lifecycle">Project Lifecycle</TabsTrigger>
          <TabsTrigger value="remix">Remix</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="testflows">User Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <div className="space-y-6">
            {/* Dynamic Decision Questions Section */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ✅ Strategic Decisions Status
                </CardTitle>
                <CardDescription>
                  All crucial decisions (Q1-Q9) have been confirmed and implemented
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {/* Q1 - Equipment & Tax Strategy */}
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Q1: Equipment Cost Recovery Model</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong className="text-green-700 dark:text-green-400">RESOLVED: Option B - Deferred Recovery</strong>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Equipment costs tracked and converted to participation credits upon project completion.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Q2-Q9 Summary */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">Additional Confirmed Decisions (Q2-Q9)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span><strong>Q2:</strong> Journeyman promotion criteria defined</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span><strong>Q3:</strong> IP royalty split structure implemented (70/30 with progression)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span><strong>Q4:</strong> Guild leadership roles established</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span><strong>Q5-Q7:</strong> Node operator revenue & career progression models set</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span><strong>Q8:</strong> Reputation system fully specified (tiers, scoring, thresholds)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span><strong>Q9:</strong> Video production timeline confirmed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Tasks Section */}
            {!isLoading && dbTasks && dbTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Project Tasks</CardTitle>
                  <CardDescription>Real-time tasks from your project database</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dbTasks.map((task: any) => (
                      <div key={task.id} className="flex gap-3 items-start p-4 border rounded-lg">
                        <button
                          onClick={() => updateTaskMutation.mutate({
                            taskId: task.id,
                            completed: task.status !== 'completed'
                          })}
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h4>
                            <Badge variant={task.priority === 'high' ? 'destructive' : 'outline'}>
                              {task.priority}
                            </Badge>
                            <Badge>{task.status}</Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                          )}
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            {task.projects?.name && <span>Project: {task.projects.name}</span>}
                            {task.assigned_to && <span>Assigned: {task.assigned_to}</span>}
                            {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reference Task Groups */}
          {isLoadingReferenceTasks ? (
            <Card>
              <CardContent className="p-6">
                <p>Loading reference tasks...</p>
              </CardContent>
            </Card>
          ) : tasks.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">No reference tasks found.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {tasks.map((section, idx) => (
          <div key={idx} className="space-y-4">
          <Card className="print:shadow-none print:border print:break-inside-avoid">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{section.category}</CardTitle>
                <div className="flex gap-2">
                  {section.status === "completed" && (
                    <Badge variant="default" className="bg-green-600">
                      Completed {section.completedDate}
                    </Badge>
                  )}
                  {section.priority && section.status !== "completed" && (
                    <Badge variant={section.priority === "Critical" ? "destructive" : "outline"}>
                      Priority: {section.priority}
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription>{section.description}</CardDescription>
              {section.dependencies && (
                <div className="text-sm text-muted-foreground mt-2 font-medium">
                  📋 Dependencies: {section.dependencies}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.id} className="flex gap-3 print:break-inside-avoid">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold print:border print:border-gray-300 ${
                      item.completed ? 'bg-green-100 text-green-700' : 'bg-primary/10'
                    }`}>
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.id} - {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Technical Specification Card */}
          {taskSpecs[section.category] && (
            <div className="mt-4">
              <TaskSpecCard
                category={section.category}
                spec={taskSpecs[section.category]}
              />
            </div>
          )}
        </div>
        ))}

        <Card className="print:shadow-none print:border print:break-inside-avoid">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{completedGroupsCount}</div>
                <div className="text-sm text-muted-foreground">Completed Groups</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{totalGroupsCount}</div>
                <div className="text-sm text-muted-foreground">Total Groups</div>
              </div>
              <div className="p-4 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{progressPercent}%</div>
                <div className="text-sm text-green-700">Progress</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Priority Levels</h4>
                <ul className="space-y-1 text-sm">
                  <li className="line-through text-muted-foreground"><span className="font-medium">✅ COMPLETED:</span> Subdomain Storage System (Items 1.1-1.5)</li>
                  <li><span className="font-medium">HIGH:</span> Automatic Daily Sync (Items 3.1-3.3)</li>
                  <li><span className="font-medium">HIGH:</span> Real-time Calculations (Items 4.1-4.4)</li>
                  <li><span className="font-medium">MEDIUM:</span> PWA Features (Items 2.1-2.3)</li>
                  <li><span className="font-medium">MEDIUM:</span> Blockchain Features (Items 5.1-5.5)</li>
                  <li><span className="font-medium">MEDIUM:</span> Member Dashboard Enhancements (Items 6.1-6.5)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Estimated Timeline</h4>
                <ul className="space-y-1 text-sm">
                  <li><span className="font-medium">Phase 1 (Weeks 1-2):</span> Subdomain system + Daily sync</li>
                  <li><span className="font-medium">Phase 2 (Weeks 3-4):</span> Real-time features + PWA basics</li>
                  <li><span className="font-medium">Phase 3 (Weeks 5-6):</span> Advanced PWA + Member dashboard</li>
                  <li><span className="font-medium">Phase 4 (Weeks 7-8):</span> Blockchain integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
            </>
          )}
          </div>
        </TabsContent>

        <TabsContent value="sitemap">
          <Tabs defaultValue="structure" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="structure">Structure Map</TabsTrigger>
              <TabsTrigger value="navigation">Navigation Map</TabsTrigger>
            </TabsList>

            <TabsContent value="structure">
              <Card>
                <CardHeader>
                  <CardTitle>Application Site Map</CardTitle>
                  <CardDescription>
                    Visual representation of the application structure and routing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MermaidDiagram chart={`graph TD
    Root["/  - Home Landing Page"]
    Auth["/auth - Authentication"]

    Root --> Dashboard["/dashboard - Dashboard"]
    Root --> Projects["/projects - Projects List"]
    Root --> Marketplace["/marketplace - Marketplace"]
    Root --> Portfolio["/portfolio - User Portfolio"]

    Projects --> ProjectView["/project/:slug - Project Detail"]
    ProjectView --> ProductDetail["/project/:slug/product/:id - Product Detail"]

    Root --> AdminSection["Admin Section"]

    AdminSection --> AdminProject["/admin-project - Project Admin"]
    AdminSection --> CreateProject["/create-project - Create New Project"]
    AdminSection --> Credentials["/credential-management - Credential Management"]
    AdminSection --> Subdomain["/subdomain-manager - Subdomain Manager"]
    AdminSection --> IndustryPricing["/industry-pricing - Industry Pricing Data"]

    Root --> UtilitySection["Utility Tools"]

    UtilitySection --> Simulator["/simulator - Production Simulator"]
    UtilitySection --> TaskLog["/task-log - Task Log"]
    UtilitySection --> SampleXML["/sample-xml - Sample Data XML"]
    UtilitySection --> TaskListPage["/task-list - Task List Reference"]

    Root --> NotFound["/* - 404 Not Found"]

    style Root fill:#4f46e5,stroke:#4338ca,color:#fff
    style AdminSection fill:#dc2626,stroke:#b91c1c,color:#fff
    style UtilitySection fill:#059669,stroke:#047857,color:#fff
    style Dashboard fill:#0891b2,stroke:#0e7490,color:#fff
    style Projects fill:#0891b2,stroke:#0e7490,color:#fff
    style Marketplace fill:#0891b2,stroke:#0e7490,color:#fff
    style Portfolio fill:#0891b2,stroke:#0e7490,color:#fff`} />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Main User Routes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• Home / Landing Page</li>
                      <li>• Dashboard</li>
                      <li>• Projects List → Project Detail → Product Detail</li>
                      <li>• Marketplace</li>
                      <li>• Portfolio</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Admin Section</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• Project Admin & Creation</li>
                      <li>• Credential Management</li>
                      <li>• Subdomain Configuration</li>
                      <li>• Industry Pricing Data</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Utility Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>• Production Simulator</li>
                      <li>• Task Log</li>
                      <li>• Task List & Reference</li>
                      <li>• Sample XML Viewer</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
            </TabsContent>

            <TabsContent value="navigation">
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Navigation Map</CardTitle>
                  <CardDescription>
                    Clickable map of all features and their locations across portals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NavigationMap />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="lifecycle">
          <Card>
            <CardHeader>
              <CardTitle>Project Lifecycle Tracker</CardTitle>
              <CardDescription>Track your project's progress from idea to delivery using our plant growth metaphor</CardDescription>
            </CardHeader>
            <CardContent>
              <PlantLifecycleView projectId="demo-project-id" isOwner={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remix">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Tenant Template System</CardTitle>
              <CardDescription>Process for creating remixable client templates that connect to this central API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">1. Central API Setup ✅</h4>
                    <p className="text-sm text-muted-foreground">Created four API endpoints: api-get-project, api-list-projects, api-submit-vote, and api-generate-client-key</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">2. Client API Key Generation ✅</h4>
                    <p className="text-sm text-muted-foreground">Built Client API Manager page at /admin/client-api for generating and managing client instance API keys</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Circle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">3. Create Template Project</h4>
                    <p className="text-sm text-muted-foreground">Fork the platform codebase to create a blank frontend template, remove backend logic, add API connection code</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Circle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">4. Template Configuration</h4>
                    <p className="text-sm text-muted-foreground">Add environment variables for API URL and client key, implement API client wrapper, create example components</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Circle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">5. Test Client Template</h4>
                    <p className="text-sm text-muted-foreground">Generate test API key, configure template with key, verify data fetching, test vote submission, check error handling</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Circle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">6. Documentation</h4>
                    <p className="text-sm text-muted-foreground">Write setup guide for template users, document API endpoints and responses, create example use cases, add troubleshooting section</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Circle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">7. Deploy & Monitor</h4>
                    <p className="text-sm text-muted-foreground">Deploy template project publicly, monitor API usage and performance, gather feedback from template users, iterate on improvements</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Template Code</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Complete client template with API client, example pages, and setup guide:
                  </p>
                  <a
                    href="/template-setup"
                    className="text-sm text-primary underline hover:no-underline"
                  >
                    View Template Setup Guide →
                  </a>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Architecture documentation:
                  </p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">docs/MULTI_TENANT_SETUP.md</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Capabilities Summary</CardTitle>
                <CardDescription>
                  Comprehensive overview of the IP Blockchain Ledger System's features and functionalities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Core Platform Features</h3>
                    <div className="space-y-3 ml-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Multi-Tenant Architecture</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Subdomain-based project isolation (subdomain.domain.com routing)</li>
                          <li>• Secure lockbox XML data storage per project</li>
                          <li>• Custom theme management with live theme switching per project</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Project Management</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Project creation with custom slugs and metadata</li>
                          <li>• Product catalog within projects (multiple products per project)</li>
                          <li>• Production level tracking (units, pricing tiers)</li>
                          <li>• Funding progress calculations and visualization</li>
                          <li>• Project lifecycle stages with milestone tracking</li>
                          <li>• Project administration and permissions</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Medallion Funding System</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Special "Medallion" product required for project activation</li>
                          <li>• Funding threshold tracking for Medallion completion</li>
                          <li>• Visual badges indicating Medallion funding status</li>
                          <li>• Automated navigation to Medallion product details</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">User Engagement & Voting</h3>
                    <div className="space-y-3 ml-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Democratic Voting Mechanism</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Credit-based voting system for products</li>
                          <li>• User credit allocation and tracking</li>
                          <li>• Vote submission with real-time updates</li>
                          <li>• Production level advancement through voting</li>
                          <li>• Vote history and analytics</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Contract Positions</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Position application system</li>
                          <li>• Position management interface</li>
                          <li>• Role-based access and applications</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Data & Integration Layer</h3>
                    <div className="space-y-3 ml-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">XML Generation & Blockchain Integration</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Automated XML module generation for projects</li>
                          <li>• Secure lockbox XML storage per subdomain</li>
                          <li>• Sample data XML templates</li>
                          <li>• Edge functions for XML serving and data synchronization</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">API Management</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Client API key generation</li>
                          <li>• Secure credential management</li>
                          <li>• Project-specific API access</li>
                          <li>• RESTful endpoints for external integrations</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Content & Commerce</h3>
                    <div className="space-y-3 ml-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Marketplace</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Product discovery and browsing</li>
                          <li>• Product detail pages with images</li>
                          <li>• Portfolio management</li>
                          <li>• Industry-specific pricing models</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Dynamic Theming</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Custom CSS theme upload per project</li>
                          <li>• Theme carousel/preview system</li>
                          <li>• Default and custom theme support</li>
                          <li>• Live theme application</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Administrative Features</h3>
                    <div className="space-y-3 ml-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Project Administration</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Admin project dashboard</li>
                          <li>• Task management and task logs</li>
                          <li>• Subdomain configuration</li>
                          <li>• Template setup system</li>
                          <li>• Position management interface</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Data Management</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Industry pricing synchronization</li>
                          <li>• Real-time dynamic calculations (in progress)</li>
                          <li>• Automatic daily data sync capabilities</li>
                          <li>• Circular category visualization</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Technical Infrastructure</h3>
                    <div className="space-y-3 ml-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Authentication & Security</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• User authentication with Supabase</li>
                          <li>• Row-level security policies</li>
                          <li>• Protected routes</li>
                          <li>• Credential encryption</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Progressive Web App Features (In Progress)</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Offline capabilities</li>
                          <li>• Mobile-responsive design</li>
                          <li>• Enhanced user experience optimizations</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Visual Components</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Plant lifecycle visualization</li>
                          <li>• Mermaid diagram rendering</li>
                          <li>• Image upload handling</li>
                          <li>• Circular category displays</li>
                          <li>• Task lists with status tracking</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Integration Capabilities</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Supabase backend integration</li>
                      <li>• Edge function serverless compute</li>
                      <li>• Real-time data synchronization</li>
                      <li>• File storage for themes and images</li>
                      <li>• Analytics and usage tracking</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Purpose</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This platform serves as a comprehensive blockchain-enabled project funding and management system
                  with democratic voting, multi-tenant architecture, and extensive customization capabilities.
                  It enables project creators to build communities around their ideas, fund production through
                  collective voting, and manage the entire lifecycle from concept to delivery.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testflows">
          <TestFlowManager />
        </TabsContent>
      </Tabs>

      <style>{`
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border { border: 1px solid #e5e7eb !important; }
          .print\\:break-inside-avoid { break-inside: avoid; }
          @page { margin: 1cm; }
        }
      `}</style>
    </PortalPageLayout>
  );
};

export default TaskList;
