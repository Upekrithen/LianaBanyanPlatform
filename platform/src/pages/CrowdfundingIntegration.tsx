import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Rocket, 
  Link as LinkIcon, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function CrowdfundingIntegration() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: connections, isLoading } = useQuery({
    queryKey: ['crowdfunding-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crowdfunding_platform_connections')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: syncLog } = useQuery({
    queryKey: ['crowdfunding-sync-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crowdfunding_sync_log')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: pledgeStats } = useQuery({
    queryKey: ['crowdfunding-pledges-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crowdfunding_pledges')
        .select('platform, pledge_amount, is_processed')
        .order('pledge_date', { ascending: false });
      
      if (error) throw error;

      // Calculate statistics
      const total = data.reduce((sum, p) => sum + Number(p.pledge_amount), 0);
      const processed = data.filter(p => p.is_processed).length;
      const byPlatform = data.reduce((acc, p) => {
        acc[p.platform] = (acc[p.platform] || 0) + Number(p.pledge_amount);
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        count: data.length,
        processed,
        pending: data.length - processed,
        byPlatform
      };
    }
  });

  const platforms = [
    {
      id: 'kickstarter',
      name: 'Kickstarter',
      status: 'partial',
      description: 'Webhook and sync functions ready, needs credentials',
      color: 'text-green-600'
    },
    {
      id: 'indiegogo',
      name: 'Indiegogo',
      status: 'pending',
      description: 'Ready for API integration',
      color: 'text-amber-600'
    },
    {
      id: 'patreon',
      name: 'Patreon',
      status: 'pending',
      description: 'OAuth flow setup needed',
      color: 'text-blue-600'
    },
    {
      id: 'backerkit',
      name: 'BackerKit',
      status: 'pending',
      description: 'Fulfillment integration planned',
      color: 'text-purple-600'
    },
    {
      id: 'gofundme',
      name: 'GoFundMe',
      status: 'pending',
      description: 'Manual import available',
      color: 'text-rose-600'
    }
  ];

  return (
    <PortalPageLayout maxWidth="xl" xrayId="crowdfunding">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Rocket className="h-8 w-8" />
            Crowdfunding Platform Integration
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect and sync pledges from major crowdfunding platforms
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Pledges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">
                ${pledgeStats?.total.toLocaleString() || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Backers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">
                {pledgeStats?.count || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span className="text-2xl font-bold">
                {pledgeStats?.processed || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold">
                {pledgeStats?.pending || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="sync">Sync Log</TabsTrigger>
          <TabsTrigger value="manual">Manual Import</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Status</CardTitle>
              <CardDescription>Current integration status for all platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className={`h-5 w-5 ${platform.color}`} />
                    <div>
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {platform.description}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      platform.status === 'partial' ? 'secondary' : 'outline'
                    }
                  >
                    {platform.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pledge Distribution</CardTitle>
              <CardDescription>Total pledges by platform</CardDescription>
            </CardHeader>
            <CardContent>
              {pledgeStats?.byPlatform && Object.keys(pledgeStats.byPlatform).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(pledgeStats.byPlatform).map(([platform, amount]) => (
                    <div
                      key={platform}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="font-medium capitalize">{platform}</span>
                      <span className="text-green-600 font-bold">
                        ${Number(amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No pledge data available yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connect Platforms</CardTitle>
              <CardDescription>
                Add API credentials to connect crowdfunding platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Platform connection UI coming soon. Contact admin to configure API credentials.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Recent synchronization logs</CardDescription>
            </CardHeader>
            <CardContent>
              {syncLog && syncLog.length > 0 ? (
                <div className="space-y-2">
                  {syncLog.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium capitalize">{log.platform}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.started_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            log.status === 'success'
                              ? 'default'
                              : log.status === 'partial'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {log.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {log.pledges_synced} pledges
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No sync logs yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Pledge Import</CardTitle>
              <CardDescription>
                Import pledges manually from CSV or other sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manual import tool coming soon. For now, contact support to bulk import pledge data.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </PortalPageLayout>
  );
}
