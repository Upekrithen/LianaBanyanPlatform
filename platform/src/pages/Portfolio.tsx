import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Download, Package, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { BlockchainVerificationBadge } from '@/components/BlockchainVerificationBadge';

export default function Portfolio() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  // Fetch user's subscribed projects
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_project_subscriptions')
        .select(`
          *,
          projects:project_id (
            id,
            name,
            project_sku,
            description,
            products (
              id,
              name,
              product_sku,
              production_levels (
                id,
                level_name,
                level_number,
                current_votes,
                votes_needed,
                unit_price,
                units_count
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch user's vote summary
  const { data: voteSummary } = useQuery({
    queryKey: ['user-vote-summary'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const downloadProjectModule = async (projectId: string, projectName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-project-module', {
        body: { projectId }
      });

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([data.xml], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, '_')}_module.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Project Module downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download Project Module',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              ← Back
            </Button>
            <h1 className="text-2xl font-bold">My Portfolio</h1>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vote Summary</CardTitle>
              <CardDescription>Track your investments across all projects</CardDescription>
            </CardHeader>
            <CardContent>
              {voteSummary ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Credits</p>
                      <p className="text-2xl font-bold">{voteSummary.total_credits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Used Credits</p>
                      <p className="text-2xl font-bold">{voteSummary.used_credits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available Credits</p>
                      <p className="text-2xl font-bold text-primary">
                        {Number(voteSummary.total_credits) - Number(voteSummary.used_credits)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Loading credit information...</p>
              )}
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-semibold mb-4">Subscribed Projects</h2>
            {isLoading ? (
              <p className="text-muted-foreground">Loading your project modules...</p>
            ) : subscriptions && subscriptions.length > 0 ? (
              <div className="grid gap-4">
                {subscriptions.map((sub: any) => (
                  <Card key={sub.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            {sub.projects.name}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {sub.projects.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant="outline">
                            SKU: {sub.projects.project_sku || 'Pending'}
                          </Badge>
                          <BlockchainVerificationBadge 
                            projectId={sub.projects.id}
                            projectSku={sub.projects.project_sku}
                            size="sm"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-4">Products & Production Levels:</p>
                          <div className="space-y-6">
                            {sub.projects.products?.map((product: any) => (
                              <div key={product.id} className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      SKU: {product.product_sku || 'Pending'}
                                    </p>
                                  </div>
                                </div>
                                
                                {product.production_levels && product.production_levels.length > 0 && (
                                  <div className="space-y-4 pl-4">
                                    {product.production_levels
                                      .sort((a: any, b: any) => a.level_number - b.level_number)
                                      .map((level: any) => {
                                        const progress = level.votes_needed > 0 
                                          ? (Number(level.current_votes) / Number(level.votes_needed)) * 100 
                                          : 0;
                                        const isFunded = progress >= 100;
                                        const totalValue = Number(level.unit_price) * Number(level.units_count);
                                        
                                        return (
                                          <div key={level.id} className="space-y-2 p-3 rounded-lg border bg-card">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{level.level_name}</span>
                                                <Badge variant="outline" className="text-xs">
                                                  Level {level.level_number}
                                                </Badge>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-sm font-medium">
                                                  ${Number(level.unit_price).toLocaleString()} / unit
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  {level.units_count} units
                                                </p>
                                              </div>
                                            </div>
                                            
                                            <Progress 
                                              value={Math.min(progress, 100)} 
                                              className={cn(
                                                "h-3",
                                                isFunded && "[&>div]:bg-green-500"
                                              )}
                                            />
                                            
                                            <div className="flex items-center justify-between text-xs">
                                              <span className="text-muted-foreground">
                                                {Number(level.current_votes).toLocaleString()} / {Number(level.votes_needed).toLocaleString()} votes
                                              </span>
                                              <span className={cn(
                                                "font-semibold",
                                                isFunded ? "text-green-500" : "text-muted-foreground"
                                              )}>
                                                Total: ${totalValue.toLocaleString()}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-4 border-t flex-wrap">
                          <div className="text-sm text-muted-foreground">
                            Subscribed: {new Date(sub.subscribed_at).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => navigate(`/blockchain/${sub.projects.id}`)}
                              size="sm"
                              variant="outline"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              View Blockchain
                            </Button>
                            <Button
                              onClick={() => downloadProjectModule(sub.projects.id, sub.projects.name)}
                              size="sm"
                              variant="outline"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Module
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No project subscriptions yet. Vote on projects to see them here!
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/marketplace')}
                  >
                    Browse Projects
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
