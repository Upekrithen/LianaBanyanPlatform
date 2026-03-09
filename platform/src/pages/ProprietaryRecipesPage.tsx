/**
 * Proprietary Recipes Page
 * ========================
 * Personal recipe portfolio for "secret recipes" that can graduate
 * to the public Pantry upon meeting vetting criteria.
 * 
 * Graduation criteria:
 * - 25+ orders
 * - 4.0+ average rating
 * - No unresolved safety complaints
 * - Maker opts to publish
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lock, 
  Unlock, 
  Star, 
  TrendingUp, 
  Award, 
  Plus,
  ChefHat,
  Eye,
  EyeOff,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProprietaryRecipeForm } from '@/components/ProprietaryRecipeForm';

interface PortfolioRecipe {
  id: string;
  title: string;
  description?: string;
  photo_url?: string;
  recipe_type: 'meal' | 'baked_good' | 'beverage' | 'other';
  cuisine?: string;
  is_proprietary: boolean;
  times_used: number;
  total_orders: number;
  total_servings_sold: number;
  average_rating?: number;
  rating_count: number;
  eligible_for_graduation: boolean;
  graduation_criteria_met_at?: string;
  graduated_to_pantry_id?: string;
  graduated_at?: string;
  created_at: string;
}

export default function ProprietaryRecipesPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch user's portfolio recipes
  const { data: recipes = [], isLoading, refetch } = useQuery({
    queryKey: ['portfolio-recipes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // In production, query user_recipe_portfolio
      // For now, return mock data
      return [] as PortfolioRecipe[];
    },
    enabled: !!user,
  });

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = !searchQuery || 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'proprietary' && recipe.is_proprietary && !recipe.eligible_for_graduation) ||
      (activeTab === 'eligible' && recipe.eligible_for_graduation) ||
      (activeTab === 'graduated' && recipe.graduated_to_pantry_id);
    
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: recipes.length,
    proprietary: recipes.filter(r => r.is_proprietary && !r.eligible_for_graduation).length,
    eligible: recipes.filter(r => r.eligible_for_graduation).length,
    graduated: recipes.filter(r => r.graduated_to_pantry_id).length,
    totalOrders: recipes.reduce((sum, r) => sum + r.total_orders, 0),
  };

  if (!user) {
    return (
      <div className="landing-page min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access your proprietary recipe portfolio.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="landing-page min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Lock className="h-8 w-8" />
              My Recipe Portfolio
            </h1>
            <p className="text-muted-foreground mt-1">
              Your secret recipes. Graduate them to the public Pantry when ready.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Recipe
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Recipes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold flex items-center gap-1">
                <Lock className="h-4 w-4" />
                {stats.proprietary}
              </div>
              <div className="text-sm text-muted-foreground">Secret</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-amber-500 flex items-center gap-1">
                <Award className="h-4 w-4" />
                {stats.eligible}
              </div>
              <div className="text-sm text-muted-foreground">Ready to Graduate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-emerald-500 flex items-center gap-1">
                <Unlock className="h-4 w-4" />
                {stats.graduated}
              </div>
              <div className="text-sm text-muted-foreground">Graduated</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
        </div>

        {/* Graduation Criteria Info */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Recipe Graduation
            </CardTitle>
            <CardDescription>
              Meet these criteria to graduate a recipe to the public Pantry and earn credits from every use!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">25+ Orders</div>
                  <div className="text-xs text-muted-foreground">Proven demand</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">4.0+ Rating</div>
                  <div className="text-xs text-muted-foreground">Quality verified</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ChefHat className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">No Safety Issues</div>
                  <div className="text-xs text-muted-foreground">Clean record</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">Opt to Publish</div>
                  <div className="text-xs text-muted-foreground">Your choice</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="proprietary">
                <Lock className="h-3 w-3 mr-1" />
                Secret ({stats.proprietary})
              </TabsTrigger>
              <TabsTrigger value="eligible">
                <Award className="h-3 w-3 mr-1" />
                Eligible ({stats.eligible})
              </TabsTrigger>
              <TabsTrigger value="graduated">
                <Unlock className="h-3 w-3 mr-1" />
                Graduated ({stats.graduated})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Recipe Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading your recipes...</div>
        ) : filteredRecipes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No recipes yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your secret recipes and start building your portfolio!
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Recipe
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map(recipe => (
              <RecipePortfolioCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {/* Add Recipe Dialog */}
        {showForm && (
          <ProprietaryRecipeForm
            open={showForm}
            onOpenChange={setShowForm}
            onSuccess={() => {
              setShowForm(false);
              refetch();
            }}
          />
        )}
      </div>
    </div>
  );
}

function RecipePortfolioCard({ recipe }: { recipe: PortfolioRecipe }) {
  const graduationProgress = Math.min(100, (recipe.total_orders / 25) * 100);
  const ratingMet = (recipe.average_rating || 0) >= 4.0;

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-lg",
      recipe.eligible_for_graduation && "ring-2 ring-amber-500",
      recipe.graduated_to_pantry_id && "ring-2 ring-emerald-500"
    )}>
      {recipe.photo_url && (
        <div 
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${recipe.photo_url})` }}
        />
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{recipe.title}</CardTitle>
          {recipe.is_proprietary ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <EyeOff className="h-3 w-3" />
              Secret
            </Badge>
          ) : (
            <Badge variant="default" className="flex items-center gap-1 bg-emerald-500">
              <Eye className="h-3 w-3" />
              Public
            </Badge>
          )}
        </div>
        {recipe.description && (
          <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <div className="font-bold">{recipe.total_orders}</div>
            <div className="text-xs text-muted-foreground">Orders</div>
          </div>
          <div>
            <div className="font-bold flex items-center justify-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {recipe.average_rating?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
          <div>
            <div className="font-bold">{recipe.times_used}</div>
            <div className="text-xs text-muted-foreground">Made</div>
          </div>
        </div>

        {/* Graduation Progress */}
        {recipe.is_proprietary && !recipe.graduated_to_pantry_id && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Graduation Progress</span>
              <span>{recipe.total_orders}/25 orders</span>
            </div>
            <Progress value={graduationProgress} className="h-2" />
            <div className="flex gap-2 text-xs">
              {ratingMet ? (
                <Badge variant="outline" className="text-emerald-500 border-emerald-500">
                  Rating: {recipe.average_rating?.toFixed(1)}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Need 4.0+ rating
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Eligible Banner */}
        {recipe.eligible_for_graduation && !recipe.graduated_to_pantry_id && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
            <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
              <Award className="h-4 w-4" />
              Ready to Graduate!
            </div>
            <Button size="sm" className="w-full mt-2">
              Publish to Pantry
            </Button>
          </div>
        )}

        {/* Graduated Banner */}
        {recipe.graduated_to_pantry_id && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2">
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <Unlock className="h-4 w-4" />
              Now in Public Pantry
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Earning credits from every use!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
