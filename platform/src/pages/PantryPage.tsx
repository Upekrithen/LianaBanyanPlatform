/**
 * THE PANTRY — Recipe Repository
 * ===============================
 * Browse and add recipes. Creators earn fractional credits per use.
 * 
 * Features:
 * - Browse recipes by category, cuisine, allergens
 * - Add recipes with photo, ingredients, steps
 * - Mark "I made this" to vote
 * - Earn credits with diminishing returns + $500 cap
 * - Cooking Spoon / Hot Pepper badges
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { RecipeSubmissionForm } from "@/components/RecipeSubmissionForm";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeBountyBanner } from "@/components/RecipeBountyBanner";
import { DeckCardFrame } from "@/components/DeckCardFrame";
import { 
  ChefHat, Search, Filter, Clock, Users, Star, ArrowLeft, Plus, BookOpen, Award
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CREDIT_CONSTANTS, formatCredits } from "@/lib/pantryCredits";
import '@/styles/landing.css';

interface PantryRecipe {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  total_time_minutes: number | null;
  servings: number;
  difficulty: string | null;
  cuisine: string | null;
  meal_type: string | null;
  dietary_tags: string[];
  allergens: string[];
  vote_count: number;
  make_count: number;
  is_approved: boolean;
  created_at: string;
}

const CUISINE_FILTERS = [
  'All', 'American', 'Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 
  'Thai', 'Mediterranean', 'Soul Food', 'French', 'Korean', 'Vietnamese'
];

const MEAL_TYPES = [
  'All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer', 'Side'
];

export default function PantryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedMealType, setSelectedMealType] = useState("All");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [preselectedCuisine, setPreselectedCuisine] = useState('');
  const [preselectedMealType, setPreselectedMealType] = useState('');

  // Handler for bounty banner clicks
  const handleBountyClick = (cuisine: string, mealType: string) => {
    setPreselectedCuisine(cuisine);
    setPreselectedMealType(mealType);
    setShowSubmitForm(true);
  };

  // Fetch approved recipes
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['pantry-recipes', selectedCuisine, selectedMealType, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('pantry_recipes')
        .select('*')
        .eq('is_approved', true)
        .order('vote_count', { ascending: false });

      if (selectedCuisine !== 'All') {
        query = query.ilike('cuisine', `%${selectedCuisine}%`);
      }

      if (selectedMealType !== 'All') {
        query = query.eq('meal_type', selectedMealType.toLowerCase());
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as PantryRecipe[];
    }
  });

  return (
    <div className="landing-page" style={{ minHeight: '100vh' }}>
      {/* Brand Title */}
      <div className="landing-title">
        <span className="liana">Liana</span>
        <span className="banyan">Banyan</span>
      </div>

      {/* Back button - goes to initiatives list on main page */}
      <button 
        onClick={() => navigate('/?view=initiatives')}
        className="ghost-toggle"
        style={{ left: 20 }}
      >
        <ArrowLeft className="inline h-4 w-4 mr-1" />
        Back to Initiatives
      </button>

      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <header className="landing-header" style={{ marginTop: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            <BookOpen className="inline h-12 w-12" style={{ marginRight: '0.5rem' }} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            The Pantry
          </h1>
          <p style={{ opacity: 0.8, maxWidth: 500, margin: '0 auto' }}>
            Community recipe repository. Share recipes, earn credits.
          </p>
          
          {/* Credit Info Banner */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginTop: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-4 py-2">
              <span className="text-emerald-400 font-bold">{formatCredits(CREDIT_CONSTANTS.BASE_RATE)}</span>
              <span className="text-white/70 text-sm ml-2">per use base</span>
            </div>
            <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg px-4 py-2">
              <span className="text-amber-400 font-bold">{CREDIT_CONSTANTS.MAX_VOTE_MULTIPLIER}x</span>
              <span className="text-white/70 text-sm ml-2">for popular recipes</span>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg px-4 py-2">
              <span className="text-purple-400 font-bold">{formatCredits(CREDIT_CONSTANTS.LIFETIME_CAP)}</span>
              <span className="text-white/70 text-sm ml-2">lifetime cap</span>
            </div>
          </div>
        </header>

        {/* Recipe Bounty Banner — shows Shadow Marks opportunities */}
        <div style={{ marginTop: '2rem' }}>
          <RecipeBountyBanner onAddRecipe={handleBountyClick} />
        </div>

        {/* Search & Filters */}
        <div className="trunk-info" style={{ marginTop: '2rem', padding: '1.5rem' }}>
          {/* Search */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          {/* Cuisine Filter */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <Filter className="h-4 w-4 text-purple-300" />
              <span style={{ color: '#c4b5fd', fontSize: '0.9rem' }}>Cuisine</span>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem'
            }}>
              {CUISINE_FILTERS.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    border: selectedCuisine === cuisine 
                      ? '2px solid #a78bfa' 
                      : '1px solid rgba(255,255,255,0.2)',
                    background: selectedCuisine === cuisine 
                      ? 'rgba(167, 139, 250, 0.2)' 
                      : 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Type Filter */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <ChefHat className="h-4 w-4 text-purple-300" />
              <span style={{ color: '#c4b5fd', fontSize: '0.9rem' }}>Meal Type</span>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem'
            }}>
              {MEAL_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedMealType(type)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    border: selectedMealType === type 
                      ? '2px solid #34d399' 
                      : '1px solid rgba(255,255,255,0.2)',
                    background: selectedMealType === type 
                      ? 'rgba(52, 211, 153, 0.2)' 
                      : 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="trunk-info" style={{ marginTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#c4b5fd' }}>
            Recipes
            {selectedCuisine !== 'All' && ` — ${selectedCuisine}`}
            {selectedMealType !== 'All' && ` — ${selectedMealType}`}
          </h2>
          
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
              Loading recipes...
            </div>
          ) : !recipes || recipes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
              <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-40" />
              <p>No recipes found</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Be the first to share a recipe!
              </p>
            </div>
          ) : (
            <div className="path-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}

              {/* Chalk Outline — Add Recipe with Shadow Marks teaser */}
              <div
                className="chalk-outline-slot"
                onClick={() => setShowSubmitForm(true)}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="path-front"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '320px',
                    textAlign: 'center',
                    border: '2px dashed rgba(251, 191, 36, 0.4)',
                    background: 'rgba(251, 191, 36, 0.05)',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                    ✨
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fbbf24' }}>
                    Share a Recipe
                  </h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7, maxWidth: '200px', marginBottom: '0.5rem' }}>
                    Earn Shadow Marks for filling empty shelves
                  </p>
                  <div style={{
                    padding: '0.3rem 0.8rem',
                    background: 'rgba(251, 191, 36, 0.2)',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    color: '#fbbf24',
                    marginBottom: '0.75rem'
                  }}>
                    Up to 50 Shadow Marks
                  </div>
                  <div style={{ 
                    padding: '0.5rem 1rem',
                    border: '1px solid rgba(251, 191, 36, 0.5)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#fbbf24'
                  }}>
                    + Credits per use
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How Credits Work */}
        <div className="trunk-info" style={{ marginTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#c4b5fd' }}>
            How Credits Work
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '1.5rem',
            textAlign: 'center',
            maxWidth: 900,
            margin: '0 auto'
          }}>
            <div style={{ opacity: 0.9 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: '#ddd6fe' }}>Share Recipes</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Add your favorite recipes with photos</p>
            </div>
            <div style={{ opacity: 0.9 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍🍳</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: '#ddd6fe' }}>Others Cook It</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Community members make your recipes</p>
            </div>
            <div style={{ opacity: 0.9 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: '#ddd6fe' }}>Makers Vote</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Only those who cooked it can vote</p>
            </div>
            <div style={{ opacity: 0.9 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: '#ddd6fe' }}>Earn Credits</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Popular recipes earn up to 5x more</p>
            </div>
            <div style={{ opacity: 0.9 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥄</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: '#ddd6fe' }}>Earn Badges</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Cooking Spoon & Hot Pepper levels</p>
            </div>
          </div>
        </div>

        {/* Ghost Banner */}
        {!user && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0,0,0,0.9)',
            padding: '1rem',
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            zIndex: 100,
          }}>
            <span style={{ opacity: 0.7 }}>Exploring as Guest</span>
            <span style={{ margin: '0 1rem', opacity: 0.4 }}>—</span>
            <span style={{ opacity: 0.5 }}>Join to share recipes and earn credits</span>
            <button 
              onClick={() => openOnboard({ reason: "manage your pantry", actionLabel: "Join", membershipIncluded: true })}
              className="btn"
              style={{ marginLeft: '1rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            >
              Join for $5/year
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="landing-footer" style={{ paddingBottom: user ? '2rem' : '5rem' }}>
          <p>© 2026 Liana Banyan Corporation</p>
        </footer>
      </div>

      {/* Recipe Submission Form */}
      {showSubmitForm && (
        <RecipeSubmissionForm 
          open={showSubmitForm} 
          onOpenChange={(open) => {
            setShowSubmitForm(open);
            if (!open) {
              setPreselectedCuisine('');
              setPreselectedMealType('');
            }
          }}
          preselectedCuisine={preselectedCuisine}
          preselectedMealType={preselectedMealType}
        />
      )}
    </div>
  );
}
