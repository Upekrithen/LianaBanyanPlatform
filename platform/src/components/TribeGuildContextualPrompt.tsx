import { Users, Building2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ClanGuildPromptProps {
  context: 'service_signup' | 'challenge' | 'project_start' | 'skill_assignment';
  isClanMember?: boolean;
  hasGuildMemberships?: boolean;
}

export function ClanGuildContextualPrompt({ 
  context, 
  isClanMember = false,
  hasGuildMemberships = false 
}: ClanGuildPromptProps) {
  
  const getContextMessage = () => {
    switch (context) {
      case 'service_signup':
        return 'Providing services? Clans and Guilds amplify your opportunities.';
      case 'challenge':
        return 'Taking on challenges? Team up for better rewards.';
      case 'project_start':
        return 'Starting a project? Leverage collective resources and expertise.';
      case 'skill_assignment':
        return 'Building skills? Join specialized guilds for recognition.';
      default:
        return 'Enhance your experience with Clans and Guilds.';
    }
  };

  const getTribeBenefit = () => {
    switch (context) {
      case 'service_signup':
        return '25% discounts on shared resources from tribe members';
      case 'challenge':
        return 'Pool credits and split rewards with up to 9 tribe members';
      case 'project_start':
        return 'Access tribe equipment and services at discounted rates';
      case 'skill_assignment':
        return 'Learn from experienced tribe members and build reputation together';
    }
  };

  const getGuildBenefit = () => {
    switch (context) {
      case 'service_signup':
        return 'Connect with clients seeking your specific skills';
      case 'challenge':
        return 'Compete as a guild for bonus reputation and visibility';
      case 'project_start':
        return 'Find specialized contractors within your industry guild';
      case 'skill_assignment':
        return 'Build recognized credentials within your skill guild';
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">
              {getContextMessage()}
            </p>
            <p className="text-xs text-muted-foreground">
              Maximize your impact by joining communities
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Tribe Section */}
          {!isClanMember && (
            <CollapsibleSection 
              title="Join or Create a Tribe" 
              defaultExpanded={false}
              variant="card"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">What are Tribes?</p>
                    <p className="text-xs text-muted-foreground">
                      Small teams (2-10 members) who share resources, split rewards, and build together. 
                      Use the medallion referral system to share credits with up to 9 others and form your tribe.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium mb-1">Context Benefit:</p>
                  <p className="text-xs text-muted-foreground">{getTribeBenefit()}</p>
                </div>

                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to="/tribes">Browse Tribes</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to="/member-resources">Create Tribe</Link>
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Share credits from your medallion referral to invite 9 friends and start your tribe!
                </div>
              </div>
            </CollapsibleSection>
          )}

          {isClanMember && (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <Badge variant="outline" className="bg-primary/20">Tribe Member</Badge>
                <span className="text-xs text-muted-foreground">
                  Enjoying 25% resource discounts
                </span>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/tribes">Manage</Link>
              </Button>
            </div>
          )}

          {/* Guild Section */}
          {!hasGuildMemberships && (
            <CollapsibleSection 
              title="Join Professional Guilds" 
              defaultExpanded={false}
              variant="card"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">What are Guilds?</p>
                    <p className="text-xs text-muted-foreground">
                      Industry-specific or skill-based networks that provide professional recognition, 
                      standards, and opportunities. Choose from Divisions, Industries, or Skills.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium mb-1">Context Benefit:</p>
                  <p className="text-xs text-muted-foreground">{getGuildBenefit()}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium mb-1">Divisions</div>
                    <div className="text-muted-foreground">Official LB branches</div>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium mb-1">Industries</div>
                    <div className="text-muted-foreground">Sector networks</div>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium mb-1">Skills</div>
                    <div className="text-muted-foreground">Expertise groups</div>
                  </div>
                </div>

                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/guilds">Explore Guilds</Link>
                </Button>
              </div>
            </CollapsibleSection>
          )}

          {hasGuildMemberships && (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <Badge variant="outline" className="bg-primary/20">Guild Member</Badge>
                <span className="text-xs text-muted-foreground">
                  Professional network active
                </span>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/guilds">Manage</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
