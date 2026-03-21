import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function ProjectLanding() {
  const { projectId, segmentSlug } = useParams();
  const navigate = useNavigate();

  // Fetch landing page content
  const { data: landingPage, isLoading } = useQuery({
    queryKey: ['project-landing', projectId, segmentSlug],
    queryFn: async () => {
      let query = supabase
        .from('project_landing_pages')
        .select('*, projects(*)')
        .eq('project_id', projectId)
        .eq('is_active', true);

      if (segmentSlug) {
        query = query.eq('segment_slug', segmentSlug);
      } else {
        query = query.eq('is_default', true);
      }

      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Fetch project voting status
  const { data: votingStatus } = useQuery({
    queryKey: ['project-voting-status', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_levels')
        .select('*, products!inner(project_id)')
        .eq('products.project_id', projectId)
        .order('level_number', { ascending: true });

      if (error) throw error;

      const totalLevels = data.length;
      const fundedLevels = data.filter(l => l.current_votes >= l.votes_needed).length;
      const currentLevel = data.find(l => l.current_votes < l.votes_needed) || data[data.length - 1];
      
      return {
        totalLevels,
        fundedLevels,
        progressPercentage: totalLevels > 0 ? (fundedLevels / totalLevels) * 100 : 0,
        currentLevel,
        isFullyFunded: fundedLevels === totalLevels && totalLevels > 0,
      };
    },
    enabled: !!projectId,
  });

  const handleCTA = () => {
    if (landingPage?.call_to_action_type === 'vote') {
      navigate(`/product/${landingPage?.projects?.id}`);
    } else if (landingPage?.call_to_action_type === 'browse') {
      navigate('/marketplace');
    }
  };

  if (isLoading) {
    return (
      <PortalPageLayout>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!landingPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Landing Page Not Found</h1>
        <Button asChild>
          <Link to="/marketplace">Browse Marketplace</Link>
        </Button>
      </div>
    );
  }

  const valueProps = Array.isArray(landingPage.value_propositions) 
    ? landingPage.value_propositions 
    : [];
  const features = Array.isArray(landingPage.key_features) 
    ? landingPage.key_features 
    : [];
  const testimonials = Array.isArray(landingPage.testimonials) 
    ? landingPage.testimonials 
    : [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-20 pb-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="mb-4">
                {landingPage.segment_name}
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {landingPage.hero_title}
              </h1>
              {landingPage.hero_subtitle && (
                <p className="text-xl text-muted-foreground">
                  {landingPage.hero_subtitle}
                </p>
              )}
              
              {/* Voting Progress */}
              {votingStatus && (
                <Card className="bg-background/80 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Funding Progress</span>
                        <span className="font-semibold">
                          {votingStatus.fundedLevels} / {votingStatus.totalLevels} Levels
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                          style={{ width: `${votingStatus.progressPercentage}%` }}
                        />
                      </div>
                      {votingStatus.currentLevel && !votingStatus.isFullyFunded && (
                        <p className="text-xs text-muted-foreground">
                          Current: {votingStatus.currentLevel.current_votes} / {votingStatus.currentLevel.votes_needed} votes for {votingStatus.currentLevel.level_name}
                        </p>
                      )}
                      {votingStatus.isFullyFunded && (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-semibold">Fully Funded!</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Button size="lg" onClick={handleCTA} className="group">
                {landingPage.call_to_action_text}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            {landingPage.hero_image_url && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-2xl blur-3xl" />
                <img 
                  src={landingPage.hero_image_url} 
                  alt={landingPage.hero_title}
                  className="relative rounded-2xl shadow-2xl w-full h-auto"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      {landingPage.mission_statement && (
        <section className="py-16 border-b">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {landingPage.mission_statement}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Value Propositions */}
      {valueProps.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Why Join Us?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {valueProps.map((prop: any, index: number) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Star className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{prop.title}</h3>
                        <p className="text-muted-foreground">{prop.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Key Features */}
      {features.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">What Makes Us Special</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {features.map((feature: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    {feature.description && (
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">What People Say</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial: any, index: number) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm mb-4 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.author}</p>
                        {testimonial.role && (
                          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Be Part of Something Amazing?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join {landingPage.projects.name} and help us build the future together.
          </p>
          <Button size="lg" onClick={handleCTA} className="group">
            {landingPage.call_to_action_text}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    </PortalPageLayout>
  );
}