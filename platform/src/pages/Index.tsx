import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [credits, setCredits] = useState<any>(null);

  useEffect(() => {
    loadUserCredits();
  }, [user]);

  const loadUserCredits = async () => {
    if (!user) return;

    const { data: creditsData } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (creditsData) {
      setCredits(creditsData);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user?.user_metadata?.full_name || user?.email}</CardTitle>
              <CardDescription>
                {credits && Number(credits.total_credits) > 0 
                  ? `You have $${Number(credits.available_credits || 0).toFixed(2)} in credits to vote on products`
                  : 'Accept a project invitation to receive voting credits'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Each dollar equals one vote. Choose which production levels you want to support
                across our product lineup.
              </p>
              <Button onClick={() => navigate('/projects')}>
                Browse Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="text-center space-y-6 p-8 max-w-2xl">
        <h1 className="text-5xl font-bold text-foreground">Liana Banyan</h1>
        <p className="text-xl text-muted-foreground">
          Revolutionary equity-based crowdfunding platform for collaborative project development
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/auth')}>
            Get Started
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
