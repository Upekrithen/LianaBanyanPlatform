/**
 * LET'S MAKE DINNER — Chalk-Outline Progressive Disclosure
 * =========================================================
 * NOT tabs and sidebars. NOT a firehose.
 * 
 * Shows available meals with dynamic pricing tiers.
 * Pricing: $5 preorder | $10 day-before | $15 rush
 * Chefs keep 83.3% — locked forever.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { DeckCardFrame } from "@/components/DeckCardFrame";
import { CreateMealOfferingDialog } from "@/components/CreateMealOfferingDialog";
import { MealOrderDialog } from "@/components/MealOrderDialog";
import { MealRequestDialog } from "@/components/MealRequestDialog";
import { calculateMealPrice, formatHoursUntilPickup, getNextTierInfo, type PriceTierInfo } from "@/lib/lmdPricing";
import { DemandAggregationExplainer } from "@/components/DemandAggregationExplainer";
import { AnonymousVolumeExplainer } from "@/components/AnonymousVolumeExplainer";
import { ExpandableBlock, DataVizBar } from "@/components/pudding";
import { ChefHat, Clock, MapPin, Users, Heart, ArrowLeft, Calendar, HelpCircle, Target, Search, ShoppingCart, Coins, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import '@/styles/landing.css';

interface LmdMeal {
  id: string;
  chef_id: string;
  meal_name: string;
  description: string | null;
  cuisine: string | null;
  allergens: string[] | null;
  portions_available: number;
  portions_claimed: number;
  pickup_date: string;
  pickup_time: string | null;
  pickup_location: string | null;
  pickup_instructions: string | null;
  is_charity: boolean;
  status: string;
  lmd_chefs: {
    display_name: string;
    rating: number | null;
    is_verified: boolean;
  } | null;
}

// Generate next 7 days for date strip
function getDateRange(): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(new Date(), i));
  }
  return dates;
}

export default function LetsMakeDinnerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [flippedHowItWorks, setFlippedHowItWorks] = useState<Set<number>>(new Set());
  const dateRange = getDateRange();

  // Fetch meals for selected date
  const { data: meals, isLoading } = useQuery({
    queryKey: ['lmd-meals', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('lmd_meals')
        .select(`
          *,
          lmd_chefs:chef_id (display_name, rating, is_verified)
        `)
        .eq('status', 'available')
        .eq('pickup_date', dateStr)
        .order('pickup_time', { ascending: true });
      
      if (error) throw error;
      return data as LmdMeal[];
    }
  });

  const remaining = (meal: LmdMeal) => meal.portions_available - meal.portions_claimed;

  // Calculate price for each meal
  const getMealPricing = (meal: LmdMeal): PriceTierInfo => {
    return calculateMealPrice(meal.pickup_date, meal.pickup_time, meal.is_charity);
  };

  return (
    <div className="landing-page" style={{ minHeight: '100vh' }}>
      {/* Brand Title — Top Left */}
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

      {/* Help / Explainer button */}
      <button 
        onClick={() => navigate('/initiatives/lets-make-dinner/about')}
        className="ghost-toggle"
        style={{ right: 20, left: 'auto' }}
        title="Learn about the meal ecosystem"
      >
        <HelpCircle className="inline h-4 w-4 mr-1" />
        Learn More
      </button>

      {/* Demand Aggregation Explainer */}
      <DemandAggregationExplainer 
        open={showExplainer} 
        onOpenChange={setShowExplainer}
      />

      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <header className="landing-header" style={{ marginTop: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            <ChefHat className="inline h-12 w-12" style={{ marginRight: '0.5rem' }} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Let's Make Dinner
          </h1>
          <p style={{ opacity: 0.8, maxWidth: 500, margin: '0 auto' }}>
            Home-cooked meals from your community. Chefs keep 83.3%.
          </p>
          
          {/* Pricing Info Banner - Expandable */}
          <div style={{ marginTop: '1.5rem', maxWidth: 600, margin: '1.5rem auto 0' }}>
            <ExpandableBlock
              title="💰 Dynamic Pricing — Order Early, Save More"
              subtitle="Prices change based on how far ahead you order"
              preview="$5 preorder → $10 day before → $15 rush"
              accentColor="#22c55e"
              defaultExpanded={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-4 py-3 text-center flex-1 min-w-[140px]">
                    <div className="text-emerald-400 font-bold text-2xl">$5</div>
                    <div className="text-white/70 text-sm">Preorder (48+ hrs)</div>
                    <div className="text-emerald-300/60 text-xs mt-1">Best value!</div>
                  </div>
                  <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg px-4 py-3 text-center flex-1 min-w-[140px]">
                    <div className="text-amber-400 font-bold text-2xl">$10</div>
                    <div className="text-white/70 text-sm">Day Before (6-48 hrs)</div>
                    <div className="text-amber-300/60 text-xs mt-1">Still saves</div>
                  </div>
                  <div className="bg-rose-500/20 border border-rose-500/40 rounded-lg px-4 py-3 text-center flex-1 min-w-[140px]">
                    <div className="text-rose-400 font-bold text-2xl">$15</div>
                    <div className="text-white/70 text-sm">Rush (under 6 hrs)</div>
                    <div className="text-rose-300/60 text-xs mt-1">Last minute</div>
                  </div>
                </div>
                
                <DataVizBar
                  title="Chef Earnings on $15 Meal"
                  subtitle="Chefs keep 83.3% — locked forever"
                  data={[
                    { label: 'Chef keeps', value: 83.3, color: '#22c55e', icon: '👨‍🍳' },
                    { label: 'Platform (C+20%)', value: 16.7, color: '#f97316', icon: '🏛️' }
                  ]}
                  maxValue={100}
                  showPercentages={true}
                  height={24}
                />
                
                <p style={{ fontSize: '0.85rem', opacity: 0.7, textAlign: 'center' }}>
                  <strong>Why dynamic pricing?</strong> Early orders help chefs plan better, reduce waste, and buy ingredients in bulk.
                </p>
              </div>
            </ExpandableBlock>
          </div>
        </header>

        {/* Date Selector Strip */}
        <div className="trunk-info" style={{ marginTop: '2rem', padding: '1rem 1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <Calendar className="h-5 w-5 text-purple-300" />
            <span style={{ color: '#c4b5fd', fontWeight: 600 }}>Select Pickup Date</span>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
          }}>
            {dateRange.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    border: isSelected 
                      ? '2px solid #a78bfa' 
                      : '2px solid rgba(255,255,255,0.15)',
                    background: isSelected 
                      ? 'rgba(167, 139, 250, 0.2)' 
                      : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    cursor: 'pointer',
                    minWidth: '90px',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    {format(date, 'EEE')}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                    {format(date, 'MMM d')}
                  </div>
                  {isToday && (
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: '#34d399',
                      marginTop: '0.25rem'
                    }}>
                      Today
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meals Grid */}
        <div className="trunk-info" style={{ marginTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#c4b5fd' }}>
            Available Meals — {format(selectedDate, 'EEEE, MMMM d')}
          </h2>
          
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
              Loading meals...
            </div>
          ) : !meals || meals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p style={{ opacity: 0.7 }}>No meals available for {format(selectedDate, 'MMMM d')}</p>
              
              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'center', 
                marginTop: '1.5rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setShowRequestDialog(true)}
                  className="btn"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(168, 85, 247, 0.2)',
                    border: '2px solid rgba(168, 85, 247, 0.5)',
                    color: '#c4b5fd',
                  }}
                >
                  <Target className="h-4 w-4" />
                  Request a Meal
                </button>
                <button
                  onClick={() => setShowOfferDialog(true)}
                  className="btn"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(52, 211, 153, 0.2)',
                    border: '2px solid rgba(52, 211, 153, 0.5)',
                    color: '#6ee7b7',
                  }}
                >
                  <ChefHat className="h-4 w-4" />
                  Offer a Meal
                </button>
              </div>
              
              <p style={{ fontSize: '0.85rem', marginTop: '1rem', opacity: 0.5 }}>
                Request with Marks or be the first chef to offer!
              </p>
            </div>
          ) : (
            <div className="path-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginTop: '1.5rem'
            }}>
              {meals.map((meal) => {
                const pricing = getMealPricing(meal);
                const portionsLeft = remaining(meal);
                const nextTier = getNextTierInfo(pricing.hoursOut);
                
                return (
                  <div
                    key={meal.id}
                    className={cn(
                      "path-front",
                      pricing.tier === 'charity' && "border-rose-500/40"
                    )}
                    style={{
                      position: 'relative',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      background: meal.is_charity 
                        ? 'rgba(244, 63, 94, 0.08)' 
                        : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    {/* Meal Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 600, 
                        lineHeight: 1.2,
                        flex: 1,
                        marginRight: '0.5rem'
                      }}>
                        {meal.meal_name}
                      </h3>
                      <Badge className={cn(pricing.bgColor, pricing.color, "border-0")}>
                        {pricing.tier === 'charity' ? (
                          <>
                            <Heart className="h-3 w-3 mr-1" />
                            Free
                          </>
                        ) : (
                          `$${pricing.price}`
                        )}
                      </Badge>
                    </div>
                    
                    {/* Description */}
                    {(meal.description || meal.cuisine) && (
                      <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.4 }}>
                        {meal.description || meal.cuisine}
                      </p>
                    )}
                    
                    {/* Chef Info */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      opacity: 0.7
                    }}>
                      <ChefHat className="h-4 w-4" />
                      <span>
                        {meal.lmd_chefs?.display_name || 'Community Chef'}
                        {meal.lmd_chefs?.is_verified && ' ✓'}
                      </span>
                    </div>
                    
                    {/* Time & Location */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '1rem',
                      fontSize: '0.85rem',
                      opacity: 0.7,
                      flexWrap: 'wrap'
                    }}>
                      {meal.pickup_time && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock className="h-3.5 w-3.5" />
                          {meal.pickup_time}
                        </div>
                      )}
                      {meal.pickup_location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin className="h-3.5 w-3.5" />
                          {meal.pickup_location.length > 20 
                            ? meal.pickup_location.slice(0, 20) + '...' 
                            : meal.pickup_location}
                        </div>
                      )}
                    </div>
                    
                    {/* Allergens */}
                    {meal.allergens && meal.allergens.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {meal.allergens.map((a) => (
                          <span
                            key={a}
                            style={{
                              padding: '0.2rem 0.5rem',
                              fontSize: '0.7rem',
                              background: 'rgba(255,255,255,0.1)',
                              borderRadius: '4px',
                              opacity: 0.8
                            }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Portions & Price Tier */}
                    <div style={{ 
                      marginTop: 'auto',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Users className="h-4 w-4" />
                          <span style={{ fontWeight: 500 }}>{portionsLeft} left</span>
                        </div>
                        {!meal.is_charity && (
                          <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                            {pricing.label} pricing
                          </span>
                        )}
                      </div>
                      
                      {/* Next tier message */}
                      {nextTier && !meal.is_charity && (
                        <p style={{ 
                          fontSize: '0.75rem', 
                          color: pricing.tier === 'preorder' ? '#34d399' : '#fbbf24',
                          marginBottom: '0.75rem'
                        }}>
                          {nextTier.message}
                        </p>
                      )}
                      
                      {/* Order Button */}
                      <MealOrderDialog
                        mealId={meal.id}
                        mealName={meal.meal_name}
                        mealPrice={pricing.price}
                        providerId={meal.chef_id}
                        pickupDate={meal.pickup_date}
                        pickupTime={meal.pickup_time}
                        isCharity={meal.is_charity}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Chalk Outline — Request a Meal */}
              <div
                className="chalk-outline-slot"
                onClick={() => setShowRequestDialog(true)}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="path-front"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '280px',
                    textAlign: 'center',
                    border: '2px dashed rgba(168, 85, 247, 0.4)',
                    background: 'rgba(168, 85, 247, 0.05)'
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>
                    <Target className="h-12 w-12" style={{ color: '#a78bfa' }} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', opacity: 0.8, color: '#c4b5fd' }}>
                    Request a Meal
                  </h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.5, maxWidth: '200px' }}>
                    Vote with Marks for what you want
                  </p>
                  <div style={{ 
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#a78bfa'
                  }}>
                    <Coins className="h-4 w-4 inline mr-1" />
                    Back with Marks
                  </div>
                </div>
              </div>

              {/* Chalk Outline — Offer a Meal */}
              <div
                className="chalk-outline-slot"
                onClick={() => setShowOfferDialog(true)}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="path-front"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '280px',
                    textAlign: 'center',
                    border: '2px dashed rgba(52, 211, 153, 0.4)',
                    background: 'rgba(52, 211, 153, 0.05)'
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>
                    <ChefHat className="h-12 w-12" style={{ color: '#34d399' }} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', opacity: 0.8, color: '#6ee7b7' }}>
                    Offer a Meal
                  </h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.5, maxWidth: '200px' }}>
                    Share your cooking with the community
                  </p>
                  <div style={{ 
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#34d399'
                  }}>
                    Keep 83.3%
                  </div>
                </div>
              </div>

              {/* Chalk Outline — Start a Node (Cold Start Theseus) */}
              <div
                className="chalk-outline-slot"
                onClick={() => navigate('/initiatives/lets-make-dinner/start-node')}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="path-front"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '280px',
                    textAlign: 'center',
                    border: '2px dashed rgba(251, 191, 36, 0.4)',
                    background: 'rgba(251, 191, 36, 0.05)'
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>
                    <MapPin className="h-12 w-12" style={{ color: '#fbbf24' }} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', opacity: 0.8, color: '#fcd34d' }}>
                    Start a Kitchen Node
                  </h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.5, maxWidth: '200px' }}>
                    Church kitchen? Food truck? Start your own node!
                  </p>
                  <div style={{ 
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    border: '1px solid rgba(251, 191, 36, 0.4)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#fbbf24'
                  }}>
                    Cold Start: 50% Rule
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How It Works — ExpandableBlocks */}
        <div className="trunk-info" style={{ marginTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#c4b5fd' }}>
            How It Works
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1rem',
            maxWidth: 1000,
            margin: '0 auto'
          }}>
            <ExpandableBlock
              title="1️⃣ Browse Meals"
              subtitle="Find home-cooked meals nearby"
              preview="See what neighbors are cooking..."
              accentColor="#8b5cf6"
              defaultExpanded={false}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search className="h-10 w-10 text-purple-300 flex-shrink-0" />
                <div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    See what neighbors are cooking. Filter by cuisine, date, and dietary needs.
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); document.querySelector('.trunk-info')?.scrollIntoView({ behavior: 'smooth' }); }}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: 'rgba(139, 92, 246, 0.3)', 
                      border: '1px solid rgba(139, 92, 246, 0.5)',
                      borderRadius: '8px',
                      color: '#c4b5fd',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Browse Now <ArrowRight className="h-3 w-3 inline ml-1" />
                  </button>
                </div>
              </div>
            </ExpandableBlock>

            <ExpandableBlock
              title="2️⃣ Order Early"
              subtitle="$5 preorder saves you money"
              preview="$5 → $10 → $15 based on timing..."
              accentColor="#22c55e"
              defaultExpanded={false}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Clock className="h-10 w-10 text-emerald-300 flex-shrink-0" />
                <div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    <strong>$5</strong> if ordered 48+ hours ahead<br />
                    <strong>$10</strong> day before<br />
                    <strong>$15</strong> rush (under 6 hours)
                  </p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    Plan ahead and save!
                  </p>
                </div>
              </div>
            </ExpandableBlock>

            <ExpandableBlock
              title="3️⃣ Pick Up Fresh"
              subtitle="Grab at the scheduled time"
              preview="Most pickups are within walking distance..."
              accentColor="#f59e0b"
              defaultExpanded={false}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <MapPin className="h-10 w-10 text-amber-300 flex-shrink-0" />
                <div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    Chefs provide pickup instructions. Most pickups are within walking distance.
                  </p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    Or add delivery as a separate job!
                  </p>
                </div>
              </div>
            </ExpandableBlock>

            <ExpandableBlock
              title="4️⃣ Chefs Earn"
              subtitle="Keep 83.3% — locked forever"
              preview="$15 meal = $12.50 to chef..."
              accentColor="#f43f5e"
              defaultExpanded={false}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Coins className="h-10 w-10 text-rose-300 flex-shrink-0" />
                <div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    $15 meal = <strong>$12.50 to chef</strong><br />
                    Platform takes only Cost + 20%<br />
                    <span style={{ opacity: 0.7 }}>Locked in constitutional bylaws</span>
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowOfferDialog(true); }}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: 'rgba(244, 63, 94, 0.3)', 
                      border: '1px solid rgba(244, 63, 94, 0.5)',
                      borderRadius: '8px',
                      color: '#fda4af',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Start Cooking <ChefHat className="h-3 w-3 inline ml-1" />
                  </button>
                </div>
              </div>
            </ExpandableBlock>
          </div>
        </div>

        {/* Anonymous Volume Aggregation — Why Batch Pricing Changes Everything */}
        <div className="trunk-info" style={{ marginTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#86efac' }}>
            Why Batch Pricing Changes Everything
          </h2>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <AnonymousVolumeExplainer variant="inline" showComparison={false} />
          </div>
        </div>

        {/* Ghost Banner (if not logged in) */}
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
            <span style={{ opacity: 0.5 }}>Join to order or offer meals</span>
            <button 
              onClick={() => openOnboard({ reason: "start cooking and earning", actionLabel: "Join", membershipIncluded: true })}
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

      {/* Offer Meal Dialog */}
      {showOfferDialog && (
        <CreateMealOfferingDialog 
          open={showOfferDialog} 
          onOpenChange={setShowOfferDialog} 
        />
      )}

      {/* Request Meal Dialog */}
      <MealRequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        preselectedDate={selectedDate}
      />
    </div>
  );
}
