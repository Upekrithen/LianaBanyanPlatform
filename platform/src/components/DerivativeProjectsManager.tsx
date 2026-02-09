import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, TrendingUp, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { CreateDerivativeProjectDialog } from "./CreateDerivativeProjectDialog";

interface DerivativeProjectsManagerProps {
  projectId: string;
  projectName: string;
}

export const DerivativeProjectsManager = ({ projectId, projectName }: DerivativeProjectsManagerProps) => {
  const { data: derivatives, isLoading: derivativesLoading } = useQuery({
    queryKey: ['derivative-projects', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, owner:profiles!projects_owner_id_fkey(full_name, email)')
        .eq('parent_project_id', projectId);

      if (error) throw error;
      return data;
    }
  });

  const { data: parentProject, isLoading: parentLoading } = useQuery({
    queryKey: ['parent-project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('parent_project_id, derivative_type, derivative_status, royalty_percentage')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      
      // Get parent name separately
      if (data?.parent_project_id) {
        const { data: parentData } = await supabase
          .from('projects')
          .select('name')
          .eq('id', data.parent_project_id)
          .single();
        
        return { ...data, parent_name: parentData?.name };
      }
      
      return data;
    }
  });

  const { data: royalties, isLoading: royaltiesLoading } = useQuery({
    queryKey: ['derivative-royalties', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('derivative_royalties')
        .select('*')
        .or(`derivative_project_id.eq.${projectId},parent_project_id.eq.${projectId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (derivativesLoading || parentLoading || royaltiesLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const isDerivative = !!parentProject?.parent_project_id;
  const hasDerivatives = derivatives && derivatives.length > 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'suspended': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const totalRoyaltiesEarned = royalties
    ?.filter(r => r.parent_project_id === projectId && r.payment_status === 'paid')
    .reduce((sum, r) => sum + Number(r.royalty_amount), 0) || 0;

  const totalRoyaltiesPaid = royalties
    ?.filter(r => r.derivative_project_id === projectId && r.payment_status === 'paid')
    .reduce((sum, r) => sum + Number(r.royalty_amount), 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Accessory Trunk Ecosystem
        </CardTitle>
        <CardDescription>
          {isDerivative 
            ? `This is a derivative of ${(parentProject as any).parent_name}` 
            : 'Manage derivative projects based on this trunk'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={isDerivative ? 'parent' : 'derivatives'}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="derivatives">
              Derivatives {hasDerivatives && `(${derivatives.length})`}
            </TabsTrigger>
            <TabsTrigger value="royalties">
              Royalties
            </TabsTrigger>
          </TabsList>

          <TabsContent value="derivatives" className="space-y-4">
            {isDerivative && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Parent Trunk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{(parentProject as any).parent_name}</span>
                      <Badge variant={getStatusVariant(parentProject.derivative_status)}>
                        {getStatusIcon(parentProject.derivative_status)}
                        <span className="ml-1">{parentProject.derivative_status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Type:</span>
                      <span className="capitalize">{parentProject.derivative_type?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Royalty Rate:</span>
                      <span className="font-medium">{parentProject.royalty_percentage}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isDerivative && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {hasDerivatives 
                    ? 'Projects derived from this trunk:' 
                    : 'No derivative projects yet'}
                </p>
                <CreateDerivativeProjectDialog 
                  parentProjectId={projectId}
                  parentProjectName={projectName}
                />
              </div>
            )}

            {hasDerivatives && (
              <div className="space-y-3">
                {derivatives.map((derivative) => (
                  <Card key={derivative.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{derivative.name}</h4>
                          <Badge variant={getStatusVariant(derivative.derivative_status)}>
                            {getStatusIcon(derivative.derivative_status)}
                            <span className="ml-1">{derivative.derivative_status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{derivative.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Owner:</span>
                            <span className="ml-2 font-medium">{derivative.owner?.full_name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Royalty:</span>
                            <span className="ml-2 font-medium">{derivative.royalty_percentage}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="ml-2 capitalize">{derivative.derivative_type?.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="royalties" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>Royalties Earned</span>
                    </div>
                    <div className="text-2xl font-bold">${totalRoyaltiesEarned.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      From {derivatives?.length || 0} derivative{derivatives?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {isDerivative && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Royalties Paid</span>
                      </div>
                      <div className="text-2xl font-bold">${totalRoyaltiesPaid.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        To {(parentProject as any).parent_name}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {royalties && royalties.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recent Transactions</h4>
                {royalties.slice(0, 5).map((royalty) => (
                  <Card key={royalty.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            ${Number(royalty.royalty_amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {royalty.royalty_percentage}% of ${Number(royalty.revenue_amount).toFixed(2)}
                          </p>
                        </div>
                        <Badge variant={royalty.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {royalty.payment_status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
