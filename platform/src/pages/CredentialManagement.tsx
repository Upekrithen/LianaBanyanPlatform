import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Copy, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PortalPageLayout } from '@/components/PortalPageLayout';

const CredentialManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newCredential, setNewCredential] = useState({ name: '', origins: '', projectId: '' });
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch user's projects
  const { data: projects } = useQuery({
    queryKey: ['user-projects'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .select('id, name, project_sku')
        .eq('owner_id', user.id);

      if (error) throw error;
      return data;
    },
  });

  // Fetch credentials
  const { data: credentials, isLoading } = useQuery({
    queryKey: ['xml-credentials'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('xml_access_credentials')
        .select(`
          *,
          projects (name, project_sku)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create credential mutation
  const createCredential = useMutation({
    mutationFn: async () => {
      const { data: apiKeyData, error: apiKeyError } = await supabase.rpc('generate_api_key');
      if (apiKeyError) throw apiKeyError;

      const originsArray = newCredential.origins
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);

      const { error } = await supabase
        .from('xml_access_credentials')
        .insert({
          project_id: newCredential.projectId,
          credential_name: newCredential.name,
          api_key: apiKeyData,
          allowed_origins: originsArray.length > 0 ? originsArray : null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xml-credentials'] });
      setNewCredential({ name: '', origins: '', projectId: '' });
      setIsDialogOpen(false);
      toast({
        title: 'Success',
        description: 'API credential created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete credential mutation
  const deleteCredential = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('xml_access_credentials')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xml-credentials'] });
      toast({
        title: 'Success',
        description: 'Credential deleted successfully',
      });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    });
  };

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="credential-management">
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">XML Access Credentials</h1>
          <p className="text-muted-foreground">Manage API keys for external site access to your project XML modules</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Credential
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Credential</DialogTitle>
              <DialogDescription>
                Generate a secure API key for external access to your project XML modules
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Credential Name</Label>
                <Input
                  placeholder="e.g., Production Website"
                  value={newCredential.name}
                  onChange={(e) => setNewCredential({ ...newCredential, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Project</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={newCredential.projectId}
                  onChange={(e) => setNewCredential({ ...newCredential, projectId: e.target.value })}
                >
                  <option value="">Select a project</option>
                  {projects?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.project_sku || 'No SKU'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Allowed Origins (comma-separated, optional)</Label>
                <Input
                  placeholder="https://example.com, https://app.example.com"
                  value={newCredential.origins}
                  onChange={(e) => setNewCredential({ ...newCredential, origins: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to allow all origins
                </p>
              </div>
              <Button
                onClick={() => createCredential.mutate()}
                disabled={!newCredential.name || !newCredential.projectId}
                className="w-full"
              >
                Generate API Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Credentials</CardTitle>
          <CardDescription>
            These API keys allow external websites to securely access your XML modules via CORS
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading credentials...</p>
          ) : credentials && credentials.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Origins</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.map((cred: any) => (
                  <TableRow key={cred.id}>
                    <TableCell className="font-medium">{cred.credential_name}</TableCell>
                    <TableCell>{cred.projects?.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs">
                          {showApiKeys[cred.id] ? cred.api_key : '••••••••••••••••'}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleApiKeyVisibility(cred.id)}
                        >
                          {showApiKeys[cred.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(cred.api_key, 'API Key')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cred.allowed_origins?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cred.allowed_origins.map((origin: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {origin}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="outline">All origins</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cred.is_active ? 'default' : 'secondary'}>
                        {cred.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{cred.usage_count || 0} calls</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteCredential.mutate(cred.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No credentials yet. Create one to get started.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Endpoint URL</h3>
            <code className="block bg-muted p-2 rounded text-sm">
              {import.meta.env.VITE_SUPABASE_URL}/functions/v1/serve-xml-module?projectId=YOUR_PROJECT_ID&apiKey=YOUR_API_KEY
            </code>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Example Usage (JavaScript)</h3>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`fetch('${import.meta.env.VITE_SUPABASE_URL}/functions/v1/serve-xml-module?projectId=PROJECT_ID', {
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
})
  .then(res => res.text())
  .then(xml => console.log(xml));`}
            </pre>
          </div>
        </CardContent>
      </Card>
      </div>
    </PortalPageLayout>
  );
};

export default CredentialManagement;
