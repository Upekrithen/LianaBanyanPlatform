/**
 * BEACON EXPLAINER PAGE
 * =====================
 * Public landing page for QR code scans and shared Cue Cards.
 * Explains the beacon system and invites users to join.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  ArrowLeft, 
  Navigation, 
  Compass, 
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle,
} from 'lucide-react';
import { BEACON_COLORS } from '@/components/BeaconDropButton';

type BeaconColor = keyof typeof BEACON_COLORS;

const getBeaconEmoji = (color: BeaconColor): string => {
  const emojis: Record<BeaconColor, string> = {
    green: '🟢',
    blue: '🔵',
    yellow: '🟡',
    red: '🔴',
    purple: '🟣',
    orange: '🟠',
  };
  return emojis[color];
};

export default function BeaconExplainer() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Badge variant="outline" className="gap-1">
            <Navigation className="w-3 h-3" />
            Navigation Guide
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 mb-6 shadow-lg">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            The Beacon System
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Personal navigation markers that help you find your way back to what matters.
          </p>
        </div>

        {/* What Are Beacons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              What Are Beacons?
            </CardTitle>
            <CardDescription>
              Your personal breadcrumb trail through the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Beacons are colored markers you can drop on any page. Unlike bookmarks, 
              each color carries meaning — telling your future self <em>why</em> you marked this spot.
            </p>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm font-medium mb-2">Think of beacons like:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>📍 Pins on a map you're exploring</li>
                <li>🔖 Bookmarks with built-in context</li>
                <li>🧭 A personal navigation system</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* The Six Colors */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>The Six Colors</CardTitle>
            <CardDescription>
              Each color has a specific meaning to help you navigate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {(Object.entries(BEACON_COLORS) as [BeaconColor, typeof BEACON_COLORS[BeaconColor]][]).map(
                ([color, config]) => {
                  const Icon = config.icon;
                  return (
                    <div
                      key={color}
                      className="flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50"
                      style={{ borderColor: `${config.color}30` }}
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                        style={{ backgroundColor: `${config.color}15` }}
                      >
                        {getBeaconEmoji(color as BeaconColor)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold" style={{ color: config.color }}>
                            {config.name}
                          </h3>
                          <Icon className="w-4 h-4" style={{ color: config.color }} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {config.meaning}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>

        {/* How To Use */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              How To Use Beacons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                  1
                </div>
                <div>
                  <h4 className="font-medium mb-1">Drop a Beacon</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "Drop Beacon" on any page. Choose a color that matches why you're marking this spot.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                  2
                </div>
                <div>
                  <h4 className="font-medium mb-1">Add Context (Optional)</h4>
                  <p className="text-sm text-muted-foreground">
                    Give your beacon a name or note. Future you will thank present you.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                  3
                </div>
                <div>
                  <h4 className="font-medium mb-1">Return Via The Helm</h4>
                  <p className="text-sm text-muted-foreground">
                    Open the Helm (your navigation center) to see all your beacons. Click any beacon to return instantly.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orange Protocol */}
        <Card className="mb-8 border-orange-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🟠</span>
              The Orange Protocol
            </CardTitle>
            <CardDescription>
              Special-purpose beacons for advanced use cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Orange beacons are customizable. Use them for:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '🎮', label: 'Game Markers', desc: 'Beacon Run waypoints' },
                { icon: '👤', label: 'Share with Person', desc: 'Send to someone specific' },
                { icon: '📢', label: 'Social Cue Card', desc: 'Queue for social media' },
                { icon: '🎁', label: 'Gift Beacon', desc: 'Drop for someone to find' },
                { icon: '💎', label: 'Treasure Cache', desc: 'Mark valuable resources' },
                { icon: '📚', label: 'Learning Moment', desc: 'Educational content' },
                { icon: '🗺️', label: 'Trade Route', desc: 'Part of a treasure map' },
                { icon: '✏️', label: 'Custom', desc: 'Write your own label' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {user ? (
                <>
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <h3 className="text-xl font-bold">You're Ready to Navigate!</h3>
                  <p className="text-muted-foreground">
                    Start dropping beacons on pages you want to remember.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => navigate('/the-helm')}>
                      <Compass className="w-4 h-4 mr-2" />
                      Open The Helm
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/')}>
                      Start Exploring
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Users className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="text-xl font-bold">Join the Platform</h3>
                  <p className="text-muted-foreground">
                    Become a member to start using beacons and unlock the full navigation system.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => navigate('/red-carpet')}>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Join for $5/year
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/')}>
                      Explore First
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Membership includes access to all platform features, cooperative IP ownership, and more.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Part of the Liana Banyan navigation system</p>
          <p className="text-xs mt-1">Help each other help ourselves.</p>
        </div>
      </div>
    </div>
  );
}
