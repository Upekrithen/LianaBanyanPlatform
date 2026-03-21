import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { Clock, TrendingUp } from 'lucide-react';
import { MedallionFundingExplainer } from "@/components/MedallionFundingExplainer";
import { RealTimeProductStats } from "@/components/RealTimeProductStats";
import { PreorderVotingExplainer } from "@/components/PreorderVotingExplainer";
import { BackerTrackPrompt } from "@/components/BackerTrackPrompt";
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface Product {
  id: string;
  name: string;
  description: string;
  product_sku: string;
  details: string;
  productionLevels: ProductionLevel[];
  images: ProductImage[];
}

interface ProductionLevel {
  id: string;
  level_number: number;
  level_name: string;
  units_count: number;
  unit_price: number;
  votes_needed: number;
  current_votes: number;
}

interface ProductImage {
  image_url: string;
  caption: string;
}

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [credits, setCredits] = useState<any>(null);
  const [votes, setVotes] = useState<{ [key: string]: string }>({});
  const [timeCommitments, setTimeCommitments] = useState<{ [key: string]: number }>({});
  const [participationRatios, setParticipationRatios] = useState<{ [key: string]: { participation: number; cash: number } }>({});
  const [votingConfig, setVotingConfig] = useState<any>(null);
  const [projectSlug, setProjectSlug] = useState<string>('');
  const [showExplainer, setShowExplainer] = useState(false);
  const [explainerUnderstood, setExplainerUnderstood] = useState(false);
  const [backerTrack, setBackerTrack] = useState<'product_only' | 'backer' | null>(null);

  const commitmentOptions = votingConfig?.time_commitment_options || [
    { days: 7, label: '1 Week' },
    { days: 14, label: '2 Weeks' },
    { days: 30, label: '1 Month' },
    { days: 60, label: '2 Months' },
    { days: 90, label: '3 Months' },
    { days: 180, label: '6 Months' },
  ];

  useEffect(() => {
    loadProductData();
    loadUserCredits();
    loadUserPreferences();
  }, [productId]);

  const loadUserPreferences = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_preferences')
      .select('marketplace_backer_track')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data?.marketplace_backer_track) {
      setBackerTrack(data.marketplace_backer_track as 'product_only' | 'backer');
    }
    
    // Check if user has seen explainer
    const hasVoted = await supabase
      .from('user_votes')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();
    
    setExplainerUnderstood(!!hasVoted.data);
  };

  const handleTrackSelection = async (track: 'product_only' | 'backer') => {
    if (!user) return;
    
    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        marketplace_backer_track: track
      });
    
    setBackerTrack(track);
    toast.success(`Switched to ${track === 'backer' ? 'Backer' : 'Product-Only'} Track`);
  };

  useEffect(() => {
    if (!votingConfig) return;

    Object.entries(timeCommitments).forEach(([levelId, days]) => {
      const ratioFactor = Math.min(1.0, Math.max(0.0, days / votingConfig.product_lead_time_days));
      const minParticipation = Number(votingConfig.min_participation_ratio);
      const maxParticipation = Number(votingConfig.max_participation_ratio);
      const participation = minParticipation + (ratioFactor * (maxParticipation - minParticipation));
      const cash = 1 - participation;

      setParticipationRatios(prev => ({
        ...prev,
        [levelId]: { participation, cash }
      }));
    });
  }, [timeCommitments, votingConfig]);

  const loadProductData = async () => {
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        production_levels (*),
        product_images (*),
        projects (name)
      `)
      .eq('id', productId)
      .single();

    if (productError) {
      console.error('Error loading product:', productError);
      toast.error('Failed to load product');
      setLoading(false);
      return;
    }

    const formattedProduct = {
      id: productData.id,
      name: productData.name,
      description: productData.description,
      product_sku: productData.product_sku,
      details: productData.details,
      productionLevels: productData.production_levels || [],
      images: productData.product_images || []
    };
    
    setProduct(formattedProduct);
    
    // Set project slug from project name
    if (productData.projects?.name) {
      setProjectSlug(productData.projects.name.toLowerCase());
    }

    // Load voting config for this product's project
    const { data: config } = await supabase
      .from('project_voting_configs')
      .select('*')
      .eq('project_id', productData.project_id)
      .maybeSingle();

    if (config) {
      // Parse time_commitment_options from JSONB
      const parsedOptions = Array.isArray(config.time_commitment_options) 
        ? config.time_commitment_options 
        : JSON.parse(config.time_commitment_options as string);
      
      setVotingConfig({
        ...config,
        time_commitment_options: parsedOptions
      });
    } else {
      // Use defaults if no config exists
      setVotingConfig({
        product_lead_time_days: 180,
        min_participation_ratio: 0.1,
        max_participation_ratio: 0.9,
        time_commitment_options: [
          { days: 7, label: '1 Week' },
          { days: 14, label: '2 Weeks' },
          { days: 30, label: '1 Month' },
          { days: 60, label: '2 Months' },
          { days: 90, label: '3 Months' },
          { days: 180, label: '6 Months' },
        ]
      });
    }
    
    setLoading(false);
  };

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

  const handleVoteChange = (levelId: string, value: string) => {
    setVotes(prev => ({ ...prev, [levelId]: value }));
  };

  const handleCommitmentChange = (levelId: string, days: number) => {
    setTimeCommitments(prev => ({ ...prev, [levelId]: days }));
  };

  const handleSubmitVote = async (levelId: string) => {
    if (!user) {
      openOnboard({ reason: "vote on products", actionLabel: "Join", membershipIncluded: true });
      return;
    }

    // Show explainer on first vote attempt
    if (!explainerUnderstood) {
      setShowExplainer(true);
      return;
    }

    // Prompt for track selection if not set
    if (!backerTrack) {
      toast.error('Please select your marketplace track first');
      return;
    }

    const voteAmount = parseFloat(votes[levelId] || '0');
    if (isNaN(voteAmount) || voteAmount <= 0) {
      toast.error('Please enter a valid vote amount');
      return;
    }

    const availableCredits = Number(credits?.available_credits || 0);
    if (voteAmount > availableCredits) {
      toast.error('Insufficient credits');
      return;
    }

    const timeCommitmentDays = timeCommitments[levelId];
    if (!timeCommitmentDays) {
      toast.error('Please select a time commitment');
      return;
    }

    const ratios = participationRatios[levelId];
    if (!ratios) {
      toast.error('Unable to calculate ratios');
      return;
    }

    const commitmentDeadline = new Date();
    commitmentDeadline.setDate(commitmentDeadline.getDate() + timeCommitmentDays);

    const { error } = await supabase
      .from('user_votes')
      .insert({
        user_id: user.id,
        production_level_id: levelId,
        vote_amount: voteAmount,
        source: 'initial_credit',
        time_commitment_days: timeCommitmentDays,
        commitment_deadline: commitmentDeadline.toISOString(),
        participation_ratio: ratios.participation,
        cash_ratio: ratios.cash,
        status: 'active'
      });

    if (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote');
    } else {
      toast.success(`Vote submitted! ${(ratios.participation * 100).toFixed(0)}% participation, ${(ratios.cash * 100).toFixed(0)}% cash`);
      setVotes(prev => ({ ...prev, [levelId]: '' }));
      setTimeCommitments(prev => ({ ...prev, [levelId]: undefined as any }));
      loadProductData();
      loadUserCredits();
    }
  };

  if (loading) {
    return (
      <PortalPageLayout>
        <p>Loading product...</p>
      </PortalPageLayout>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <PortalPageLayout>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(projectSlug ? `/project/${projectSlug}` : '/projects')}>
              ← Back to Project
            </Button>
            <h1 className="text-2xl font-bold">{product.name}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Backer Track Selection */}
        {user && <BackerTrackPrompt onSelectTrack={handleTrackSelection} currentTrack={backerTrack || undefined} />}
        
        {/* Product Details */}
        <div className="grid gap-8 md:grid-cols-2">
          {product.images.length > 0 && (
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={product.images[0].image_url}
                  alt={product.images[0].caption || product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Real-Time Product Stats */}
            <RealTimeProductStats productId={productId!} />
            
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{product.details}</p>
              </CardContent>
            </Card>

            {credits && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Voting Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Available Credits:</span>
                    <span className="text-2xl font-bold text-primary">
                      ${Number(credits.available_credits || 0).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Production Levels Voting */}
        <Card>
          <CardHeader>
            <CardTitle>Vote on Production Levels</CardTitle>
            <CardDescription>
              Cast your votes to help this product reach production
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.productionLevels.map((level) => {
              const displayUnits = level.level_number === 1 ? 5 : level.units_count;
              const displayPrice = level.level_number === 1 ? 1000.00 : Number(level.unit_price);
              const currentRatios = participationRatios[level.id];
              const selectedCommitment = timeCommitments[level.id];
              
              return (
                <div key={level.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{level.level_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {displayUnits} units @ ${displayPrice.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ${Number(level.current_votes || 0).toFixed(0)} / ${Number(level.votes_needed || 0).toFixed(0)}
                    </span>
                  </div>
                  <Progress 
                    value={
                      level.votes_needed > 0 
                        ? (Number(level.current_votes || 0) / Number(level.votes_needed)) * 100 
                        : 0
                    } 
                  />
                  
                  {/* Time Commitment Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time Commitment
                    </label>
                    <Select
                      value={selectedCommitment?.toString()}
                      onValueChange={(value) => handleCommitmentChange(level.id, parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select commitment period" />
                      </SelectTrigger>
                      <SelectContent>
                        {commitmentOptions.map((option) => (
                          <SelectItem key={option.days} value={option.days.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Participation/Cash Ratio Display */}
                  {currentRatios && (
                    <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        Commitment Allocation
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Participation</div>
                          <div className="text-lg font-bold text-primary">
                            {(currentRatios.participation * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Cash Value</div>
                          <div className="text-lg font-bold">
                            {(currentRatios.cash * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Longer commitment = more participation. If goal isn't met by deadline, votes revert to your account.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={votes[level.id] || ''}
                      onChange={(e) => handleVoteChange(level.id, e.target.value)}
                    />
                    <Button 
                      onClick={() => handleSubmitVote(level.id)}
                      disabled={
                        !votes[level.id] || 
                        parseFloat(votes[level.id]) <= 0 || 
                        !timeCommitments[level.id]
                      }
                    >
                      Vote
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Preorder/Voting Explainer Dialog */}
        <PreorderVotingExplainer 
          open={showExplainer}
          onOpenChange={setShowExplainer}
          onUnderstood={() => setExplainerUnderstood(true)}
        />
      </main>
    </PortalPageLayout>
  );
}
