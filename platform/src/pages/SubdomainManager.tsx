import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Globe, Lock, ArrowLeft, Plus, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface Project {
  id: string;
  name: string;
  project_sku: string;
}

interface DomainMapping {
  id: string;
  custom_domain: string;
  subdomain_target: string;
  dns_verified: boolean;
  ssl_provisioned: boolean;
  verification_token: string;
  created_at: string;
}

interface LockboxConfig {
  id: string;
  lockbox_path: string;
  cors_origins: string[];
  is_active: boolean;
}

export default function SubdomainManager() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [customDomain, setCustomDomain] = useState('');
  const [subdomainTarget, setSubdomainTarget] = useState('');
  const [domainMappings, setDomainMappings] = useState<DomainMapping[]>([]);
  const [lockboxConfig, setLockboxConfig] = useState<LockboxConfig | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectData();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('id, name, project_sku')
      .eq('owner_id', user.id);

    if (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
      return;
    }

    setProjects(data || []);
    if (data && data.length > 0) {
      setSelectedProject(data[0].id);
    }
  };

  const loadProjectData = async () => {
    if (!selectedProject) return;

    // Load domain mappings
    const { data: mappings } = await supabase
      .from('project_domain_mappings')
      .select('*')
      .eq('project_id', selectedProject);

    setDomainMappings(mappings || []);

    // Load lockbox config
    const { data: config } = await supabase
      .from('subdomain_lockbox_configs')
      .select('*')
      .eq('project_id', selectedProject)
      .maybeSingle();

    setLockboxConfig(config);
  };

  const handleAddDomainMapping = async () => {
    if (!customDomain || !subdomainTarget) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    const verificationToken = `${selectedProject}_${Date.now()}`.substring(0, 32);

    const { error } = await supabase
      .from('project_domain_mappings')
      .insert({
        project_id: selectedProject,
        custom_domain: customDomain,
        subdomain_target: subdomainTarget,
        verification_token: verificationToken,
      });

    if (error) {
      console.error('Error adding domain mapping:', error);
      toast.error('Failed to add domain mapping');
    } else {
      toast.success('Domain mapping added successfully');
      setCustomDomain('');
      setSubdomainTarget('');
      loadProjectData();
    }

    setLoading(false);
  };

  const handleDeleteMapping = async (mappingId: string) => {
    const { error } = await supabase
      .from('project_domain_mappings')
      .delete()
      .eq('id', mappingId);

    if (error) {
      console.error('Error deleting mapping:', error);
      toast.error('Failed to delete mapping');
    } else {
      toast.success('Mapping deleted');
      loadProjectData();
    }
  };

  const checkDNS = async (domain: string) => {
    try {
      setLoading(true);
      toast.info(`Checking DNS for ${domain}...`);
      
      // Use a DNS-over-HTTPS service to check DNS records
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      const data = await response.json();
      
      if (data.Answer && data.Answer.length > 0) {
        const hasCorrectIP = data.Answer.some((record: any) => 
          record.data === '185.158.133.1' // Replace with your actual IP
        );
        
        if (hasCorrectIP) {
          toast.success('DNS correctly configured!');
        } else {
          toast.warning('DNS found but not pointing to the correct IP');
        }
      } else {
        toast.error('No DNS records found');
      }
    } catch (error) {
      console.error('DNS check error:', error);
      toast.error('Failed to check DNS');
    } finally {
      setLoading(false);
    }
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <PortalPageLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <h1 className="text-3xl font-bold">Subdomain & Domain Manager</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Selection</CardTitle>
            <CardDescription>Choose a project to manage its subdomain configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <Label>Select Project</Label>
            <select
              className="w-full mt-2 p-2 border rounded-md"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.project_sku || 'No SKU'})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {selectedProjectData && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Lockbox Configuration
                </CardTitle>
                <CardDescription>
                  Secure lockbox structure for project {selectedProjectData.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lockboxConfig ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <span className="font-medium">Lockbox Path:</span>
                      <span className="text-muted-foreground">{lockboxConfig.lockbox_path}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <span className="font-medium">Status:</span>
                      <span className={lockboxConfig.is_active ? 'text-green-600' : 'text-red-600'}>
                        {lockboxConfig.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <span className="font-medium">Allowed Origins:</span>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {lockboxConfig.cors_origins.join(', ')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Lockbox automatically configured on project creation</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Custom Domain Mappings
                </CardTitle>
                <CardDescription>
                  Map custom domains to your project subdomain (e.g., hexisle.com → hexisle.projects.lianabanyan.com)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customDomain">Custom Domain</Label>
                    <Input
                      id="customDomain"
                      placeholder="hexisle.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subdomainTarget">Subdomain Target</Label>
                    <Input
                      id="subdomainTarget"
                      placeholder="hexisle.projects.lianabanyan.com"
                      value={subdomainTarget}
                      onChange={(e) => setSubdomainTarget(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddDomainMapping} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Domain Mapping
                  </Button>
                </div>

                {domainMappings.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Existing Mappings</h3>
                    <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded-md">
                      <strong>DNS Setup Instructions:</strong>
                      <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Add an A record for your domain pointing to <code className="bg-background px-1 py-0.5 rounded">185.158.133.1</code></li>
                        <li>For wildcard subdomains (e.g., *.hexisle.com), add an A record for <code className="bg-background px-1 py-0.5 rounded">*</code> pointing to the same IP</li>
                        <li>DNS propagation can take up to 48 hours</li>
                      </ul>
                    </div>
                    {domainMappings.map((mapping) => (
                      <div
                        key={mapping.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="font-medium">{mapping.custom_domain}</div>
                          <div className="text-sm text-muted-foreground">
                            → {mapping.subdomain_target}
                          </div>
                          <div className="flex gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              {mapping.dns_verified ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-600" />
                              )}
                              DNS {mapping.dns_verified ? 'Verified' : 'Not Verified'}
                            </span>
                            <span className="flex items-center gap-1">
                              {mapping.ssl_provisioned ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-600" />
                              )}
                              SSL {mapping.ssl_provisioned ? 'Provisioned' : 'Pending'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => checkDNS(mapping.custom_domain)}
                            disabled={loading}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMapping(mapping.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PortalPageLayout>
  );
}