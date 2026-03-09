/**
 * Recipe Card Component
 * =====================
 * Displays a recipe in the Pantry grid.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Users, Star, ChefHat, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface RecipeCardProps {
  recipe: PantryRecipe;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-emerald-500/20 text-emerald-400',
  medium: 'bg-amber-500/20 text-amber-400',
  hard: 'bg-orange-500/20 text-orange-400',
  expert: 'bg-rose-500/20 text-rose-400',
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipes/${recipe.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="path-front cursor-pointer hover:border-purple-400/50 transition-all"
      style={{
        position: 'relative',
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Photo */}
      <div 
        style={{
          height: '160px',
          background: recipe.photo_url 
            ? `url(${recipe.photo_url}) center/cover`
            : 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(52,211,153,0.2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!recipe.photo_url && (
          <ChefHat className="h-12 w-12 opacity-30" />
        )}
        
        {/* Badges overlay */}
        <div className="absolute top-2 right-2 flex gap-1">
          {recipe.vote_count > 0 && (
            <Badge className="bg-amber-500/90 text-white border-0">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {recipe.vote_count}
            </Badge>
          )}
          {recipe.make_count > 10 && (
            <Badge className="bg-rose-500/90 text-white border-0">
              <Flame className="h-3 w-3 mr-1" />
              Hot
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Title */}
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: 600, 
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {recipe.title}
        </h3>

        {/* Description */}
        {recipe.description && (
          <p style={{ 
            fontSize: '0.85rem', 
            opacity: 0.7, 
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {recipe.description}
          </p>
        )}

        {/* Meta info */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          fontSize: '0.8rem',
          opacity: 0.6,
          marginTop: 'auto',
          paddingTop: '0.5rem'
        }}>
          {recipe.total_time_minutes && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock className="h-3.5 w-3.5" />
              {recipe.total_time_minutes} min
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Users className="h-3.5 w-3.5" />
            {recipe.servings}
          </div>
          {recipe.difficulty && (
            <Badge className={cn("text-xs border-0", difficultyColors[recipe.difficulty])}>
              {recipe.difficulty}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {(recipe.cuisine || recipe.meal_type || recipe.dietary_tags.length > 0) && (
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {recipe.cuisine && (
              <span style={{
                padding: '0.15rem 0.5rem',
                fontSize: '0.7rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
              }}>
                {recipe.cuisine}
              </span>
            )}
            {recipe.meal_type && (
              <span style={{
                padding: '0.15rem 0.5rem',
                fontSize: '0.7rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
              }}>
                {recipe.meal_type}
              </span>
            )}
            {recipe.dietary_tags.slice(0, 2).map(tag => (
              <span 
                key={tag}
                style={{
                  padding: '0.15rem 0.5rem',
                  fontSize: '0.7rem',
                  background: 'rgba(52,211,153,0.15)',
                  borderRadius: '4px',
                  color: '#34d399',
                }}
              >
                {tag}
              </span>
            ))}
            {recipe.dietary_tags.length > 2 && (
              <span style={{
                padding: '0.15rem 0.5rem',
                fontSize: '0.7rem',
                opacity: 0.5,
              }}>
                +{recipe.dietary_tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Makers count */}
        {recipe.make_count > 0 && (
          <div style={{ 
            fontSize: '0.75rem', 
            opacity: 0.5, 
            textAlign: 'center',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            {recipe.make_count} {recipe.make_count === 1 ? 'person has' : 'people have'} made this
          </div>
        )}
      </div>
    </div>
  );
}
