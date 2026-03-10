import { useAuth } from '@/contexts/AuthContext';
import { useSeamlessOnboard } from '@/components/SeamlessOnboardDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MedallionUserCard } from '@/components/MedallionUserCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Loader2, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { Separator } from '@/components/ui/separator';

export default function MedallionViewer() {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();

  const { data: userProjects, isLoading } = useQuery({
    queryKey: ['user-medallion-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get all medallions in user's collection
      const { data: collection, error } = await supabase
        .from('member_medallion_collection')
        .select(`
          *,
          projects:project_id (
            id,
            name,
            description
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return collection || [];
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-3">View and manage your earned medallion collection.</p>
            <button
              onClick={() => openOnboard({ reason: "View your medallion collection", actionLabel: "View Medallions" })}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Get Started
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Your Medallions</CardTitle>
                <CardDescription>
                  Track your project contributions and membership tokens
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-sm text-muted-foreground mr-3">
                <p className="font-medium">Connect wallet to view on blockchain</p>
              </div>
              <WalletConnectButton />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <Wallet className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              Your medallions are secured on the Base blockchain. Connect your wallet to view them in blockchain explorers or transfer them.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {!userProjects || userProjects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Medallions Yet</h3>
            <p className="text-muted-foreground">
              Support projects to become eligible for medallions and join founding communities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {userProjects.map((eligibility) => (
            <MedallionUserCard
              key={eligibility.id}
              projectId={eligibility.project_id}
              userId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
