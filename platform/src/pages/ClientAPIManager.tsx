import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Copy, Eye, EyeOff, Key, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function ClientAPIManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [credentialName, setCredentialName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [clientSubdomain, setClientSubdomain] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Fetch user's projects
  const { data: projects } = useQuery({
    queryKey: ["user-projects", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, project_sku")
        .eq("owner_id", user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch existing client credentials
  const { data: credentials } = useQuery({
    queryKey: ["client-credentials", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xml_access_credentials")
        .select(`
          *,
          projects(name, project_sku)
        `)
        .ilike("credential_name", "%(Client Instance)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Generate client API key mutation
  const generateKeyMutation = useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      const response = await supabase.functions.invoke("api-generate-client-key", {
        body: {
          project_id: selectedProjectId,
          credential_name: credentialName,
          client_subdomain: clientSubdomain || null,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Client API Key Generated",
        description: "Your client instance API key has been created.",
      });
      setGeneratedKey(data.api_key);
      queryClient.invalidateQueries({ queryKey: ["client-credentials"] });
      setCredentialName("");
      setSelectedProjectId("");
      setClientSubdomain("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="client-api-manager">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client API Management</h1>
          <p className="text-muted-foreground mt-2">
            Generate API keys for remixable client templates
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/project")}>
          Back to Admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What are Client API Keys?</CardTitle>
          <CardDescription>
            Client API keys allow remixable frontend templates to connect to your project data.
            Each remix can display and interact with your projects while keeping data secure on your portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold">✅ What clients CAN do:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View project details and products</li>
                <li>• Submit votes and pledges</li>
                <li>• Display your project data with custom UI</li>
                <li>• Host on their own subdomain</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🔒 What clients CANNOT do:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Modify project data or settings</li>
                <li>• Access user accounts or admin functions</li>
                <li>• See other clients' activity</li>
                <li>• Bypass your security rules</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Client Instances</CardTitle>
              <CardDescription>API keys for remixed templates</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Key className="mr-2 h-4 w-4" />
                  Generate Client API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Client API Key</DialogTitle>
                  <DialogDescription>
                    Create an API key for a new client template instance
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="credential-name">Client Instance Name</Label>
                    <Input
                      id="credential-name"
                      placeholder="e.g., Partner Marketing Site"
                      value={credentialName}
                      onChange={(e) => setCredentialName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Client Subdomain (Optional)</Label>
                    <Input
                      id="subdomain"
                      placeholder="e.g., partner-site"
                      value={clientSubdomain}
                      onChange={(e) => setClientSubdomain(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      If specified, only this subdomain can use the API key
                    </p>
                  </div>
                  {generatedKey && (
                    <div className="space-y-2 p-4 bg-muted rounded-lg">
                      <Label>Your New API Key (Save This!)</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-background p-2 rounded break-all">
                          {generatedKey}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard(generatedKey, "API Key")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-destructive">
                        ⚠️ Save this key now - it won't be shown again!
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => generateKeyMutation.mutate()}
                      disabled={!credentialName || !selectedProjectId || generateKeyMutation.isPending}
                      className="flex-1"
                    >
                      {generateKeyMutation.isPending ? "Generating..." : "Generate Key"}
                    </Button>
                    {generatedKey && (
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Done
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {credentials?.map((cred: any) => (
              <Card key={cred.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{cred.credential_name}</CardTitle>
                      <CardDescription>
                        Project: {cred.projects?.name || "Unknown"}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {cred.usage_count} requests
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">API Key</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 text-xs bg-muted p-2 rounded">
                        {visibleKeys.has(cred.id)
                          ? cred.api_key
                          : "xml_" + "•".repeat(40)}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleKeyVisibility(cred.id)}
                      >
                        {visibleKeys.has(cred.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(cred.api_key, "API Key")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {cred.allowed_origins && cred.allowed_origins.length > 0 && (
                    <div>
                      <Label className="text-xs">Allowed Origins</Label>
                      <div className="text-xs text-muted-foreground mt-1">
                        {cred.allowed_origins.join(", ")}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Last used: {cred.last_used_at ? new Date(cred.last_used_at).toLocaleDateString() : "Never"}
                    </span>
                    <span className={cred.is_active ? "text-green-600" : "text-red-600"}>
                      {cred.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!credentials || credentials.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No client API keys generated yet. Click above to create one.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Setup Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">API Endpoint</h3>
            <code className="block text-xs bg-muted p-2 rounded">
              {`https://ivopsblevxcujagykobj.supabase.co/functions/v1`}
            </code>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Available Functions</h3>
            <ul className="text-sm space-y-1">
              <li><code className="text-xs bg-muted px-1 py-0.5 rounded">/api-list-projects</code> - List all projects</li>
              <li><code className="text-xs bg-muted px-1 py-0.5 rounded">/api-get-project</code> - Get single project details</li>
              <li><code className="text-xs bg-muted px-1 py-0.5 rounded">/api-submit-vote</code> - Submit a vote/pledge</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Example Usage</h3>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`fetch('${window.location.origin}/functions/v1/api-get-project?project_sku=PROJ-001', {
  headers: {
    'x-api-key': 'xml_your_key_here'
  }
})`}
            </pre>
          </div>
          <Button
            variant="outline"
            onClick={() => window.open("/docs/MULTI_TENANT_SETUP.md", "_blank")}
          >
            View Full Documentation
          </Button>
        </CardContent>
      </Card>
      </div>
    </PortalPageLayout>
  );
}
