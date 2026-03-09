import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const TemplateSetup = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const apiClientCode = `// src/lib/centralApi.ts
const CENTRAL_API_URL = import.meta.env.VITE_CENTRAL_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchFromCentral<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(\`\${CENTRAL_API_URL}/\${endpoint}\`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { error: \`API Error: \${response.status} - \${error}\` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: \`Network Error: \${error instanceof Error ? error.message : 'Unknown error'}\` };
  }
}

export const centralApi = {
  // List all projects
  listProjects: async () => {
    return fetchFromCentral('api-list-projects');
  },

  // Get project details with products and production levels
  getProject: async (projectId: string) => {
    return fetchFromCentral(\`api-get-project?project_id=\${projectId}\`);
  },

  // Submit a vote to a production level
  submitVote: async (productionLevelId: string, amount: number, source: string = 'client_portal') => {
    return fetchFromCentral('api-submit-vote', {
      method: 'POST',
      body: JSON.stringify({
        production_level_id: productionLevelId,
        amount,
        source,
      }),
    });
  },
};`;

  const projectListPageCode = `// src/pages/Projects.tsx
import { useEffect, useState } from 'react';
import { centralApi } from '@/lib/centralApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const { data, error } = await centralApi.listProjects();
    
    if (error) {
      setError(error);
    } else if (data) {
      setProjects(data.projects || []);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error Loading Projects</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Available Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              {project.tagline && (
                <p className="text-sm font-semibold text-primary mt-1">{project.tagline}</p>
              )}
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate(\`/project/\${project.id}\`)}
                className="w-full"
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}`;

  const projectDetailPageCode = `// src/pages/ProjectDetail.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { centralApi } from '@/lib/centralApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voteAmounts, setVoteAmounts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    const { data, error } = await centralApi.getProject(projectId!);
    
    if (error) {
      toast.error(error);
    } else if (data) {
      setProject(data.project);
    }
    
    setLoading(false);
  };

  const handleVote = async (productionLevelId: string) => {
    const amount = parseFloat(voteAmounts[productionLevelId] || '0');
    
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting({ ...submitting, [productionLevelId]: true });
    
    const { data, error } = await centralApi.submitVote(productionLevelId, amount);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Vote submitted successfully!');
      setVoteAmounts({ ...voteAmounts, [productionLevelId]: '' });
      loadProject(); // Reload to get updated vote counts
    }
    
    setSubmitting({ ...submitting, [productionLevelId]: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
      {project.tagline && (
        <p className="text-lg font-semibold text-primary mb-2">{project.tagline}</p>
      )}
      <p className="text-muted-foreground mb-6">{project.description}</p>

      <div className="space-y-6">
        {project.products?.map((product: any) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.production_levels?.map((level: any) => (
                  <div key={level.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{level.level_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {level.units_count} units @ \${level.unit_price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {level.current_votes} / {level.votes_needed} votes
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={voteAmounts[level.id] || ''}
                        onChange={(e) => setVoteAmounts({ ...voteAmounts, [level.id]: e.target.value })}
                        disabled={submitting[level.id]}
                      />
                      <Button
                        onClick={() => handleVote(level.id)}
                        disabled={submitting[level.id]}
                      >
                        {submitting[level.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Vote'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}`;

  const envTemplate = `# Central Portal API Configuration
VITE_CENTRAL_API_URL=https://ivopsblevxcujagykobj.supabase.co/functions/v1
VITE_API_KEY=your-api-key-here`;

  const appRouterCode = `// src/App.tsx - Add these routes
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';

// In your Routes section:
<Route path="/projects" element={<Projects />} />
<Route path="/project/:projectId" element={<ProjectDetail />} />`;

  const setupInstructions = `# Template Setup Instructions

## Step 1: Create New Frontend Project
1. Fork the platform codebase or create a new Vite + React project
2. Choose "Blank Template" or fork this project

## Step 2: Copy Template Files
Copy these files into your new project:
- src/lib/centralApi.ts (API Client)
- src/pages/Projects.tsx (Project List Page)
- src/pages/ProjectDetail.tsx (Project Detail Page)

## Step 3: Configure Environment Variables
1. Create a .env file in your project root
2. Add the API URL and your API key:
   \`\`\`
   VITE_CENTRAL_API_URL=https://ivopsblevxcujagykobj.supabase.co/functions/v1
   VITE_API_KEY=your-generated-api-key
   \`\`\`

## Step 4: Update Routes
Add the new routes to your App.tsx routing configuration

## Step 5: Generate API Key
1. Go to the Central Portal's Client API Manager
2. Generate a new API key for your client instance
3. Copy the key and add it to your .env file

## Step 6: Test
1. Navigate to /projects to see the project list
2. Click on a project to view details and vote

## Architecture
- **Central Portal**: This project (stores data, provides APIs)
- **Client Template**: Your new project (fetches data via API)
- **API Key**: Secure authentication between template and portal

## API Endpoints
- GET /api-list-projects - List all projects
- GET /api-get-project?project_id=xxx - Get project details
- POST /api-submit-vote - Submit a vote

## Security Notes
- API keys are validated on the central portal
- All requests require valid API key in headers
- Keys can be revoked from the Central Portal
- Monitor usage in the Client API Manager`;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Client Template Code</h1>
        <p className="text-muted-foreground">
          Complete template for creating client instances that connect to the central portal
        </p>
      </div>

      <Tabs defaultValue="instructions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="instructions">Setup</TabsTrigger>
          <TabsTrigger value="api">API Client</TabsTrigger>
          <TabsTrigger value="projects">Projects Page</TabsTrigger>
          <TabsTrigger value="detail">Detail Page</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>

        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
              <CardDescription>Follow these steps to create a new client instance</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap">
                {setupInstructions}
              </pre>
              <Button
                className="mt-4"
                onClick={() => copyToClipboard(setupInstructions, "Instructions")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Instructions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>API Client Wrapper</CardTitle>
                  <CardDescription>src/lib/centralApi.ts</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(apiClientCode, "API client code")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                <code>{apiClientCode}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Projects List Page</CardTitle>
                  <CardDescription>src/pages/Projects.tsx</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(projectListPageCode, "Projects page code")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                <code>{projectListPageCode}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detail">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Project Detail Page</CardTitle>
                  <CardDescription>src/pages/ProjectDetail.tsx</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(projectDetailPageCode, "Project detail code")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                <code>{projectDetailPageCode}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Environment Variables</CardTitle>
                    <CardDescription>.env file</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(envTemplate, "Environment template")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  <code>{envTemplate}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Router Configuration</CardTitle>
                    <CardDescription>Add to App.tsx</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(appRouterCode, "Router code")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  <code>{appRouterCode}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-6 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            1. Copy all the code above into a new frontend project
          </p>
          <p className="text-sm">
            2. Generate an API key from the{" "}
            <Link to="/client-api-manager" className="text-primary underline">
              Client API Manager
            </Link>
          </p>
          <p className="text-sm">
            3. Configure the .env file with your API key
          </p>
          <p className="text-sm">
            4. Test the template by navigating to /projects
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateSetup;
