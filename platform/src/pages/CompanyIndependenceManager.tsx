import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { Loader2, Building2, Award } from 'lucide-react';

export default function CompanyIndependenceManager() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const queryClient = useQueryClient();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('lb_project');
  const [equityBonus, setEquityBonus] = useState<string>('0');
  const [canUseExternal, setCanUseExternal] = useState<boolean>(false);

  const [milestoneType, setMilestoneType] = useState<string>('');
  const [milestoneDescription, setMilestoneDescription] = useState<string>('');

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['all-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, company_status, became_independent_at, independence_equity_bonus, can_use_external_services')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId) throw new Error('No project selected');

      const updateData: any = {
        company_status: newStatus,
        independence_equity_bonus: parseFloat(equityBonus),
        can_use_external_services: canUseExternal,
      };

      if (newStatus === 'independent' && !projects?.find(p => p.id === selectedProjectId)?.became_independent_at) {
        updateData.became_independent_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', selectedProjectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-projects'] });
      toast.success('Company status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const addMilestoneMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId || !milestoneType) throw new Error('Missing required fields');

      const { error } = await supabase
        .from('company_milestones')
        .insert({
          project_id: selectedProjectId,
          milestone_type: milestoneType,
          milestone_description: milestoneDescription,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-projects'] });
      toast.success('Milestone added successfully');
      setMilestoneType('');
      setMilestoneDescription('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add milestone');
    },
  });

  if (roleLoading || projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Company Independence Manager</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Project</CardTitle>
            <CardDescription>Choose a project to manage its independence status</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} - {project.company_status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedProject && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <Badge className="mt-1">{selectedProject.company_status}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Equity Bonus</Label>
                    <div className="font-medium">+{selectedProject.independence_equity_bonus}%</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">External Services</Label>
                    <Badge variant={selectedProject.can_use_external_services ? 'default' : 'secondary'} className="mt-1">
                      {selectedProject.can_use_external_services ? 'Allowed' : 'Restricted'}
                    </Badge>
                  </div>
                  {selectedProject.became_independent_at && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Independent Since</Label>
                      <div className="text-sm">
                        {new Date(selectedProject.became_independent_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>Change company independence status and benefits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Company Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lb_project">LB Project</SelectItem>
                      <SelectItem value="transitioning">Transitioning</SelectItem>
                      <SelectItem value="independent">Independent Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Independence Equity Bonus (%)</Label>
                  <Input
                    type="number"
                    value={equityBonus}
                    onChange={(e) => setEquityBonus(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="external"
                    checked={canUseExternal}
                    onChange={(e) => setCanUseExternal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="external">Allow External Services</Label>
                </div>

                <Button
                  onClick={() => updateStatusMutation.mutate()}
                  disabled={updateStatusMutation.isPending}
                  className="w-full"
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Building2 className="h-4 w-4 mr-2" />
                  )}
                  Update Status
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Milestone</CardTitle>
                <CardDescription>Record company achievement milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Milestone Type</Label>
                  <Input
                    value={milestoneType}
                    onChange={(e) => setMilestoneType(e.target.value)}
                    placeholder="e.g., First Revenue, 100 Users, Series A"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={milestoneDescription}
                    onChange={(e) => setMilestoneDescription(e.target.value)}
                    placeholder="Details about this milestone..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={() => addMilestoneMutation.mutate()}
                  disabled={addMilestoneMutation.isPending || !milestoneType}
                  className="w-full"
                >
                  {addMilestoneMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Award className="h-4 w-4 mr-2" />
                  )}
                  Add Milestone
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
