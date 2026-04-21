import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Users, Zap } from "lucide-react";
import { format } from "date-fns";

interface WaveSelectionCardProps {
  wave: {
    id: string;
    wave_number: number;
    wave_name?: string;
    base_price_multiplier: number;
    total_wave_capacity: number;
    units_allocated: number;
    units_reserved_fcfs: number;
    estimated_fulfillment_date?: string;
    status: string;
    surge_active?: boolean;
    surge_multiplier?: number;
    demand_score?: number;
    has_dormant_capacity?: boolean;
    dormant_days?: number;
    dormant_activated?: boolean;
  };
  basePrice: number;
  onSelect: (waveId: string) => void;
  isSelected?: boolean;
  isFcfsSlot?: boolean;
}

export const WaveSelectionCard = ({
  wave,
  basePrice,
  onSelect,
  isSelected = false,
  isFcfsSlot = false
}: WaveSelectionCardProps) => {
  // Apply surge pricing for waves 1-3 if surge is active
  const surgeMultiplier = wave.surge_active && wave.wave_number <= 3 && !isFcfsSlot
    ? (wave.surge_multiplier || 1.5)
    : 1.0;

  const effectiveMultiplier = wave.base_price_multiplier * surgeMultiplier;
  const wavePrice = isFcfsSlot ? basePrice : basePrice * effectiveMultiplier;
  const premiumAmount = wavePrice - basePrice;
  const availableSlots = wave.total_wave_capacity - wave.units_allocated;
  const fcfsSlots = Math.floor(wave.total_wave_capacity / 3); // 1/3 reserved for FCFS
  const fcfsRemaining = Math.max(0, fcfsSlots - wave.units_reserved_fcfs);
  const capacityPercent = (wave.units_allocated / wave.total_wave_capacity) * 100;

  const isPremiumWave = effectiveMultiplier > 1.0;
  const isEarlyWave = wave.wave_number <= 3;
  const isSurgeActive = wave.surge_active && wave.wave_number <= 3;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(wave.id)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">
              Wave {wave.wave_number}
              {wave.wave_name && `: ${wave.wave_name}`}
            </CardTitle>
            {isEarlyWave && (
              <Badge variant="default" className="gap-1">
                <Zap className="h-3 w-3" />
                Early Access
              </Badge>
            )}
            {isSurgeActive && (
              <Badge variant="destructive" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Surge Pricing
              </Badge>
            )}
            {isFcfsSlot && (
              <Badge variant="secondary" className="gap-1">
                FCFS - Base Price
              </Badge>
            )}
            {wave.has_dormant_capacity && (
              <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
                <Zap className="h-3 w-3" />
                +{wave.dormant_days} Reserve Days
              </Badge>
            )}
          </div>
          {wave.status === 'active' && (
            <Badge variant="secondary">Active</Badge>
          )}
        </div>
        <CardDescription>
          {wave.estimated_fulfillment_date && (
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              Est. fulfillment: {format(new Date(wave.estimated_fulfillment_date), 'MMM dd, yyyy')}
            </div>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">${wavePrice.toFixed(2)}</span>
            {isPremiumWave && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                +${premiumAmount.toFixed(2)} {isSurgeActive ? 'surge' : 'premium'}
              </div>
            )}
          </div>
          {isSurgeActive && !isFcfsSlot && (
            <p className="text-sm text-destructive font-medium">
              High demand! {((surgeMultiplier - 1) * 100).toFixed(0)}% surge pricing active
            </p>
          )}
          {isFcfsSlot && (
            <p className="text-sm text-primary font-medium">
              Base price guaranteed - FCFS slot
            </p>
          )}
          {!isPremiumWave && wave.wave_number > 3 && (
            <p className="text-sm text-muted-foreground">
              Save ${(basePrice * ((wave.wave_number - 1) * 0.1)).toFixed(2)} by choosing later wave
            </p>
          )}
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Capacity
            </span>
            <span className="font-medium">
              {availableSlots.toLocaleString()} / {wave.total_wave_capacity.toLocaleString()} available
            </span>
          </div>
          <Progress value={capacityPercent} className="h-2" />
        </div>

        {/* FCFS Slots */}
        {fcfsRemaining > 0 && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm font-medium">
              {fcfsRemaining.toLocaleString()} First-Come-First-Serve slots available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Base price ({basePrice.toFixed(2)}) - No surge pricing
            </p>
            <p className="text-xs text-muted-foreground">
              Reserved for community members and early supporters
            </p>
          </div>
        )}

        {/* Dormant Capacity Feature */}
        {wave.has_dormant_capacity && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg space-y-1">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              🎯 50K Tier Unlocked - Reserve Capacity Available
            </p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• {wave.dormant_days} days of emergency reserve capacity</li>
              <li>• Activates only if needed (rare)</li>
              <li>• Protects against unexpected surges</li>
              {wave.dormant_activated && (
                <li className="text-amber-600 dark:text-amber-400 font-medium">
                  ⚡ Reserve capacity currently activated
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Premium benefits */}
        {isPremiumWave && (
          <div className="p-3 bg-accent/50 rounded-lg space-y-1">
            <p className="text-sm font-medium">Premium Wave Benefits:</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Earliest possible fulfillment</li>
              <li>• Priority production queue</li>
              <li>• Funds expansion of production nodes</li>
            </ul>
          </div>
        )}

        {/* Action */}
        <Button
          className="w-full"
          variant={isSelected ? "default" : "outline"}
          onClick={() => onSelect(wave.id)}
        >
          {isSelected ? 'Selected' : 'Select Wave'}
        </Button>
      </CardContent>
    </Card>
  );
};
