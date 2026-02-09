import { useAuth } from '@/contexts/AuthContext';
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

  const { data: userProjects, isLoading } = useQuery({
    queryKey: ['user-medallion-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get all projects user has eligibility for
      const { data: eligibility, error } = await supabase
        .from('medallion_eligibility')
        .select(`
          *,
          projects:project_id (
            id,
            name,
            description,
            project_sku
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return eligibility || [];
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            Please log in to view your medallions.
          </AlertDescription>
        </Alert>
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
