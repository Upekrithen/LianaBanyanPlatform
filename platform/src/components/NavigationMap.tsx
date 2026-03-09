import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  LayoutDashboard, 
  FolderKanban, 
  ShoppingCart, 
  Briefcase,
  Users,
  Target,
  Award,
  FileText,
  Settings,
  Server,
  Database,
  Code,
  GitBranch,
  TestTube,
  Shield,
  UserPlus,
  Building2,
  Network,
  Workflow
} from "lucide-react";

interface NavLocation {
  id: string;
  title: string;
  path: string;
  icon: React.ElementType;
  category: 'marketplace' | 'business' | 'network' | 'admin' | 'dev';
  description: string;
  connections?: string[]; // IDs of connected locations
}

export function NavigationMap() {
  const navigate = useNavigate();

  const locations: NavLocation[] = [
    // Marketplace Portal
    { id: 'home', title: 'Home', path: '/', icon: Home, category: 'marketplace', description: 'Landing page with membership, guilds, credits', connections: ['dashboard', 'projects', 'marketplace'] },
    { id: 'dashboard', title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'marketplace', description: 'User dashboard with portal access cards', connections: ['portfolio', 'medallions'] },
    { id: 'projects', title: 'Projects', path: '/projects', icon: FolderKanban, category: 'marketplace', description: 'Browse all projects', connections: ['project-view'] },
    { id: 'project-view', title: 'Project Detail', path: '/project/:slug', icon: FileText, category: 'marketplace', description: 'View project details and products', connections: ['product-detail'] },
    { id: 'product-detail', title: 'Product Detail', path: '/project/:slug/product/:id', icon: ShoppingCart, category: 'marketplace', description: 'Product details and voting' },
    { id: 'marketplace', title: 'Marketplace', path: '/marketplace', icon: ShoppingCart, category: 'marketplace', description: 'Browse marketplace catalog' },
    { id: 'portfolio', title: 'Portfolio', path: '/portfolio', icon: Briefcase, category: 'marketplace', description: 'User investment portfolio' },
    { id: 'medallions', title: 'Medallions', path: '/medallions', icon: Award, category: 'marketplace', description: 'View minted medallions' },
    // Withdraw page removed for SEC compliance - credits are not redeemable for cash
    { id: 'guilds', title: 'Guilds', path: '/guilds', icon: Users, category: 'marketplace', description: 'Browse and join guilds' },
    { id: 'production-queue', title: 'Production Queue', path: '/production-queue', icon: Workflow, category: 'marketplace', description: 'View production queue and voting' },
    { id: 'reputation', title: 'Reputation Profile', path: '/reputation/:userId', icon: Award, category: 'marketplace', description: 'User reputation and ratings' },
    
    // Network Portal
    { id: 'ip-register', title: 'IP Registration', path: '/ip/register', icon: Shield, category: 'network', description: 'Register intellectual property', connections: ['guilds'] },
    { id: 'position-categories', title: 'Position Categories', path: '/position-categories', icon: Target, category: 'network', description: 'Browse position categories' },
    { id: 'lb-positions', title: 'LB Positions', path: '/lb-positions', icon: Building2, category: 'network', description: 'Liana Banyan internal positions' },
    
    // Business Portal (.biz routes)
    { id: 'agent-onboarding', title: 'Agent Onboarding', path: '/agent-onboarding', icon: UserPlus, category: 'business', description: 'Onboard new agents with Keirsey assessment', connections: ['manage-positions'] },
    { id: 'manage-positions', title: 'Manage Positions', path: '/manage-positions', icon: Settings, category: 'business', description: 'Create and manage positions' },
    { id: 'positions', title: 'Contract Positions', path: '/positions', icon: FileText, category: 'business', description: 'View and apply to positions', connections: ['manage-positions'] },
    { id: 'admin-project', title: 'Admin Project', path: '/admin-project/:id', icon: Settings, category: 'business', description: 'Project administration', connections: ['create-project'] },
    { id: 'task-list', title: 'Task List', path: '/task-list', icon: FileText, category: 'business', description: 'Development tasks and sitemap' },
    { id: 'subdomain-manager', title: 'Subdomain Manager', path: '/subdomain-manager', icon: Network, category: 'business', description: 'Manage subdomains' },
    { id: 'client-api', title: 'Client API', path: '/client-api-manager', icon: Code, category: 'business', description: 'API key management' },
    { id: 'credentials', title: 'Credentials', path: '/credential-management', icon: Shield, category: 'business', description: 'Credential management' },
    { id: 'member-resources', title: 'Member Resources', path: '/member-resources', icon: FileText, category: 'business', description: 'Member documentation' },
    
    // Admin Routes
    { id: 'create-project', title: 'Create Project', path: '/admin/project/create', icon: FolderKanban, category: 'admin', description: 'Create new project' },
    { id: 'industry-pricing', title: 'Industry Pricing', path: '/admin/industry-pricing', icon: Database, category: 'admin', description: 'Manage industry pricing data' },
    { id: 'template-setup', title: 'Template Setup', path: '/template-setup', icon: Settings, category: 'admin', description: 'Configure templates' },
    
    // Dev Tools
    { id: 'simulator', title: 'Simulator', path: '/simulator', icon: TestTube, category: 'dev', description: 'Production simulator' },
    { id: 'task-log', title: 'Task Log', path: '/task-log', icon: FileText, category: 'dev', description: 'View task logs' },
    { id: 'sample-xml', title: 'Sample XML', path: '/sample-xml', icon: Code, category: 'dev', description: 'Sample data viewer' },
    { id: 'failure-queue', title: 'Failure Queue', path: '/admin/failure-queue', icon: GitBranch, category: 'dev', description: 'Monitor failed operations' },
  ];

  const categories = {
    marketplace: { label: 'Marketplace Portal', color: 'hsl(var(--primary))' },
    business: { label: 'Business Portal (.biz)', color: 'hsl(var(--chart-2))' },
    network: { label: 'Network Portal (.net)', color: 'hsl(var(--chart-3))' },
    admin: { label: 'Admin Routes', color: 'hsl(var(--destructive))' },
    dev: { label: 'Dev Tools', color: 'hsl(var(--chart-4))' },
  };

  const handleNavigate = (path: string) => {
    // Handle dynamic routes
    if (path.includes(':slug')) {
      navigate('/projects'); // Navigate to projects list for project routes
    } else if (path.includes(':id')) {
      navigate(path.split('/:')[0]); // Navigate to base path
    } else if (path.includes(':userId')) {
      navigate('/dashboard'); // Navigate to dashboard for user-specific routes
    } else {
      navigate(path);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap">
        {Object.entries(categories).map(([key, { label, color }]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {locations.map((location) => {
          const Icon = location.icon;
          const categoryColor = categories[location.category].color;
          
          return (
            <Card 
              key={location.id} 
              className="relative overflow-hidden hover:shadow-lg transition-shadow"
              style={{ borderLeft: `4px solid ${categoryColor}` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="p-2 rounded-lg shrink-0"
                    style={{ backgroundColor: `${categoryColor}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: categoryColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 truncate">{location.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {location.description}
                    </p>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded block truncate mb-3">
                      {location.path}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleNavigate(location.path)}
                    >
                      Open
                    </Button>
                  </div>
                </div>
                
                {location.connections && location.connections.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1.5">Connected to:</p>
                    <div className="flex flex-wrap gap-1">
                      {location.connections.map((connId) => {
                        const connLocation = locations.find(l => l.id === connId);
                        return connLocation ? (
                          <span 
                            key={connId}
                            className="text-xs bg-secondary px-2 py-0.5 rounded cursor-pointer hover:bg-secondary/80"
                            onClick={() => handleNavigate(connLocation.path)}
                          >
                            {connLocation.title}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
