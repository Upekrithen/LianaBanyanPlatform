import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { VotingDialog } from '@/components/VotingDialog';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { PlantLifecycleView } from '@/components/PlantLifecycleView';
import { SmartProjectActionButton } from '@/components/SmartProjectActionButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectTestingTab } from '@/components/ProjectTestingTab';
import { DerivativeProjectsManager } from '@/components/DerivativeProjectsManager';
import { ClipboardCheck, LayoutDashboard } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  product_sku: string;
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

interface Project {
  id: string;
  name: string;
  description: string;
  detailed_description: string;
  project_sku: string;
  owner_id?: string | null;
  tagline?: string;
  medallion_funded: boolean;
}

export default function ProjectView() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [credits, setCredits] = useState<any>(null);
  const [votingDialogOpen, setVotingDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  const [lifecycleStage, setLifecycleStage] = useState<any>(null);
  const [medallionProductId, setMedallionProductId] = useState<string | null>(null);

  useEffect(() => {
    if (projectSlug) {
      loadProjectData();
      loadUserCredits();
    }
  }, [projectSlug]);

  useEffect(() => {
    if (project) {
      loadLifecycleStage();
    }
  }, [project]);

  const loadProjectData = async () => {
    if (!projectSlug) return;

    const slug = projectSlug;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    let projectData: Project | null = null;

    // 1) Try by project_sku first (e.g., LB-PLATFORM-001)
    const { data: bySku, error: bySkuError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_sku', slug)
      .maybeSingle();

    if (bySkuError) {
      console.warn('Lookup by project_sku failed:', bySkuError.message);
    }

    if (bySku) projectData = bySku as Project;

    // 2) Try by UUID id
    if (!projectData && uuidRegex.test(slug)) {
      const { data: byId, error: byIdError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', slug)
        .maybeSingle();
      if (byIdError) {
        console.warn('Lookup by id failed:', byIdError.message);
      }
      if (byId) projectData = byId as Project;
    }

    // 3) Fallback: guess name from slug (replace dashes with spaces, title case)
    if (!projectData) {
      const guessedName = slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const { data: byName, error: byNameError } = await supabase
        .from('projects')
        .select('*')
        .ilike('name', guessedName)
        .maybeSingle();

      if (byNameError) {
        console.warn('Lookup by name failed:', byNameError.message);
      }
      if (byName) projectData = byName as Project;
    }

    if (!projectData) {
      setProject(null);
      setLoading(false);
      return;
    }

    setProject(projectData);

    // Check if current user is project owner
    if (user && projectData.owner_id === (user as any).id) {
      setIsProjectOwner(true);
    }

    // Real table: products (id, project_id, name, description, product_sku, base_price, status)
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        production_levels (*)
      `)
      .eq('project_id', projectData.id);

    if (productsError) {
      console.error('Error loading products:', productsError);
      toast.error('Failed to load products');
    } else {
      const formattedProducts = (productsData || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        product_sku: product.product_sku,
        productionLevels: product.production_levels || [],
        images: product.product_images || []
      }));
      setProducts(formattedProducts);
      const medallion = (productsData || []).find((p: any) => p.name === 'Medallion');
      if (medallion) setMedallionProductId(medallion.id);
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

  const loadLifecycleStage = async () => {
    if (!project) return;

    const { data: stageData } = await supabase
      .from('project_lifecycle_stages')
      .select('*')
      .eq('project_id', project.id)
      .single();

    if (stageData) {
      setLifecycleStage(stageData);
    }
  };

  const scrollToLifecycle = () => {
    const element = document.getElementById('lifecycle-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navigateToMedallion = () => {
    if (medallionProductId) {
      navigate(`/project/${projectSlug}/product/${medallionProductId}`);
    } else {
      console.error('Medallion product ID not found');
      toast.error('Medallion product not found in this project');
    }
  };

  const calculateUnitsPreordered = (product: Product) => {
    let totalUnits = 0;
    let currentThresholdLevel = 0;
    
    const sortedLevels = [...product.productionLevels].sort((a, b) => a.level_number - b.level_number);
    
    sortedLevels.forEach((level) => {
      const currentVotes = Number(level.current_votes || 0);
      const votesNeeded = Number(level.votes_needed || 0);
      const displayPrice = level.level_number === 1 ? 1000.00 : Number(level.unit_price);
      
      if (currentVotes >= votesNeeded && votesNeeded > 0) {
        const displayUnits = level.level_number === 1 ? 5 : level.units_count;
        totalUnits += displayUnits;
        currentThresholdLevel = level.level_number;
      } else if (currentVotes > 0 && displayPrice > 0) {
        const unitsFromVotes = Math.floor(currentVotes / displayPrice);
        totalUnits += unitsFromVotes;
      }
    });
    
    return { totalUnits, currentThresholdLevel };
  };

  const calculateProductProgress = (product: Product) => {
    const totalVotes = product.productionLevels.reduce(
      (sum, level) => sum + Number(level.current_votes || 0),
      0
    );
    const totalNeeded = product.productionLevels.reduce(
      (sum, level) => sum + Number(level.votes_needed || 0),
      0
    );
    return totalNeeded > 0 ? (totalVotes / totalNeeded) * 100 : 0;
  };

  const calculateTotalProgress = () => {
    let totalVotes = 0;
    let totalNeeded = 0;

    products.forEach((product) => {
      product.productionLevels.forEach((level) => {
        totalVotes += Number(level.current_votes || 0);
        totalNeeded += Number(level.votes_needed || 0);
      });
    });

    return totalNeeded > 0 ? (totalVotes / totalNeeded) * 100 : 0;
  };

  const getTotalFunding = () => {
    return products.reduce((total, product) => {
      return total + product.productionLevels.reduce(
        (sum, level) => sum + Number(level.current_votes || 0),
        0
      );
    }, 0);
  };

  const getNextStageGoal = () => {
    // Stage funding requirements based on cumulative production levels
    // Stage I (Germination): Medallion Level 1 = 500
    // Stage II (Growth): Medallion Levels 1-3 = 500 + 1125 + 2000 = 3625
    // Stage III (Maturation): Medallion Level 4 + additional products
    // Stage IV (Harvest): All levels funded
    
    const stageMap: Record<string, number> = {
      'germination': 500,      // Level 1 only
      'growth': 3625,          // Levels 1-3
      'maturation': 7125,      // All Medallion levels
      'harvest': getTotalGoal() // All products and levels
    };

    const currentStage = lifecycleStage?.current_stage || 'germination';
    
    // Get next stage goal
    const stages = ['germination', 'growth', 'maturation', 'harvest'];
    const currentIndex = stages.indexOf(currentStage);
    const nextStage = stages[currentIndex + 1] || currentStage;
    
    return stageMap[nextStage] || getTotalGoal();
  };

  const getTotalGoal = () => {
    return products.reduce((total, product) => {
      return total + product.productionLevels.reduce(
        (sum, level) => sum + Number(level.votes_needed || 0),
        0
      );
    }, 0);
  };

  const handleOpenVotingDialog = (product: Product) => {
    setSelectedProduct(product);
    setVotingDialogOpen(true);
  };

  const handleVoteSuccess = () => {
    loadProjectData();
    loadUserCredits();
  };

  if (!projectSlug) {
    return <Navigate to="/projects" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The project "{projectSlug}" doesn't exist in the database.
          </p>
          <Button onClick={() => navigate('/projects')}>
            ← Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              ← Back
            </Button>
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher projectId={project.id} />
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-full overflow-x-hidden">
        {/* Smart Action Button - Context-aware CTA */}
        <div className="flex justify-center">
          <SmartProjectActionButton 
            projectId={project.id} 
            projectName={project.name}
            className="w-full max-w-md"
          />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="overview">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ecosystem">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Ecosystem
            </TabsTrigger>
            <TabsTrigger value="testing">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            {project.tagline && (
              <p className="text-lg font-semibold text-primary mb-2">{project.tagline}</p>
            )}
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{project.detailed_description}</p>
            
            {/* Medallion Funding Status - Critical Prerequisite */}
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${project.medallion_funded ? 'bg-green-50 border-green-500 dark:bg-green-950 hover:border-green-600' : 'bg-amber-50 border-amber-500 dark:bg-amber-950 hover:border-amber-600'}`}
              onClick={navigateToMedallion}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${project.medallion_funded ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {project.medallion_funded ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${project.medallion_funded ? 'text-green-900 dark:text-green-100' : 'text-amber-900 dark:text-amber-100'}`}>
                    {project.medallion_funded ? 'Medallion Funded ✓' : 'Medallion Funding Required'}
                  </h3>
                  <p className={`text-sm ${project.medallion_funded ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                    {project.medallion_funded 
                      ? 'The Medallion has been successfully funded. This project can now proceed to additional products.' 
                      : 'The Medallion is the foundational product representing your stake in this project. It must be funded first as Proof of Interest in order for your project to be viable. Production of any pre-ordered products in this project will begin once the Medallion Funding is complete.'}
                  </p>
                  <p className="text-xs mt-2 font-medium">Click to learn more →</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 cursor-pointer hover:bg-muted/50 p-4 rounded-lg -mx-4 transition-colors" onClick={scrollToLifecycle}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Funding Progress</span>
                <span className="text-muted-foreground">
                  ${getTotalFunding().toFixed(2)} / ${getNextStageGoal().toFixed(2)}
                </span>
              </div>
              <Progress value={(getTotalFunding() / getNextStageGoal()) * 100} />
              <p className="text-xs text-muted-foreground">
                {((getTotalFunding() / getNextStageGoal()) * 100).toFixed(1)}% of next stage funding goal reached
              </p>
              <p className="text-xs font-medium text-primary mt-2">Click to view all lifecycle stages →</p>
            </div>

            <div id="lifecycle-section" className="pt-6 border-t scroll-mt-20">
              <PlantLifecycleView projectId={project.id} isOwner={isProjectOwner} />
            </div>
          </CardContent>
        </Card>

        {/* Contract Positions Link */}
        <Card>
          <CardHeader>
            <CardTitle>Join Our Team</CardTitle>
            <CardDescription>
              Explore available contract positions and opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate(`/project/${project.id}/positions`)}
              className="w-full"
              variant="outline"
            >
              View Open Positions
            </Button>
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

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Products</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products
              .sort((a, b) => {
                // Medallion always first
                if (a.name === 'Medallion') return -1;
                if (b.name === 'Medallion') return 1;
                return 0;
              })
              .map((product) => {
              const { totalUnits, currentThresholdLevel } = calculateUnitsPreordered(product);
              const maxLevel = Math.max(...product.productionLevels.map(l => l.level_number));
              const isMedallion = product.name === 'Medallion';
              
              return (
                <Card key={product.id} className={`overflow-hidden flex flex-col ${isMedallion ? 'ring-2 ring-primary' : ''}`}>
                  {product.images.length > 0 && (
                    <div 
                      className="aspect-square overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/project/${projectSlug}/product/${product.id}`)}
                    >
                      <img
                        src={product.images[0].image_url}
                        alt={product.images[0].caption || product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="cursor-pointer hover:text-primary" onClick={() => navigate(`/project/${projectSlug}/product/${product.id}`)}>
                        {product.name}
                      </CardTitle>
                      {isMedallion && (
                        <span className="px-2 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full whitespace-nowrap">
                          STAKE TOKEN
                        </span>
                      )}
                    </div>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Units Preordered</span>
                        <span className="text-muted-foreground">
                          {totalUnits} units
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Threshold Level</span>
                        <span>Level {currentThresholdLevel} of {maxLevel}</span>
                      </div>
                      <Progress value={calculateProductProgress(product)} />
                    </div>

                    <Button 
                      className="w-full mt-auto"
                      onClick={() => handleOpenVotingDialog(product)}
                    >
                      Vote
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {selectedProduct && (
          <VotingDialog
            open={votingDialogOpen}
            onOpenChange={setVotingDialogOpen}
            productId={selectedProduct.id}
            productName={selectedProduct.name}
            productionLevels={selectedProduct.productionLevels}
            availableCredits={Number(credits?.available_credits || 0)}
            onVoteSuccess={handleVoteSuccess}
          />
        )}
          </TabsContent>

          <TabsContent value="ecosystem" className="mt-6">
            <DerivativeProjectsManager 
              projectId={project.id}
              projectName={project.name}
            />
          </TabsContent>

          <TabsContent value="testing" className="mt-6">
            <ProjectTestingTab projectId={project.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
