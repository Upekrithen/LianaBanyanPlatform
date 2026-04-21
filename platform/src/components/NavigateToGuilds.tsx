import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, ArrowRight } from 'lucide-react';

export default function NavigateToGuilds() {
  const navigate = useNavigate();

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          Ready to Create Your Guild?
        </CardTitle>
        <CardDescription>
          Navigate to the Guilds page to create "Compassionate Capitalists" and start building your collective
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => navigate('/guilds')}
          className="w-full"
          size="lg"
        >
          Go to Guilds Page
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
