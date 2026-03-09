import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Award, Lock, CheckCircle, Loader2, TrendingUp, LogOut } from "lucide-react";
import { GuildReentryCalculator } from "./GuildReentryCalculator";
import { useAuth } from "@/contexts/AuthContext";

interface GuildProgression {
  current_tier: string;
  current_class: number;
  total_stake_paid: number;
  experience_hours: number;
  completed_contracts: number;
}

const TIER_COLORS = {
  apprentice: "bg-gray-500",
  journeyman: "bg-blue-500",
  master: "bg-purple-500",
  captain: "bg-amber-500",
};

const STAKE_INFO: Record<string, Record<number, { amount: number; cumulative: number; profitPercent: number }>> = {
  apprentice: {
    1: { amount: 0, cumulative: 0, profitPercent: 40 },
    2: { amount: 0, cumulative: 0, profitPercent: 42 },
    3: { amount: 0, cumulative: 0, profitPercent: 44 },
    4: { amount: 0, cumulative: 0, profitPercent: 46 },
    5: { amount: 0, cumulative: 0, profitPercent: 48 },
    6: { amount: 0, cumulative: 0, profitPercent: 50 },
  },
  journeyman: {
    1: { amount: 500, cumulative: 500, profitPercent: 53 },
    2: { amount: 750, cumulative: 1250, profitPercent: 56 },
    3: { amount: 1000, cumulative: 2250, profitPercent: 59 },
    4: { amount: 1250, cumulative: 3500, profitPercent: 62 },
    5: { amount: 1500, cumulative: 5000, profitPercent: 65 },
    6: { amount: 2000, cumulative: 7000, profitPercent: 68 },
  },
  master: {
    1: { amount: 10000, cumulative: 10000, profitPercent: 71 },
    2: { amount: 5000, cumulative: 15000, profitPercent: 74 },
    3: { amount: 7500, cumulative: 22500, profitPercent: 77 },
    4: { amount: 10000, cumulative: 32500, profitPercent: 80 },
    5: { amount: 15000, cumulative: 47500, profitPercent: 83 },
    6: { amount: 20000, cumulative: 67500, profitPercent: 86 },
  },
};

export const GuildStakeProgression = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [progression, setProgression] = useState<GuildProgression | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (user) {
      loadProgression();
    }
  }, [user]);

  const loadProgression = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_guild_progression")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading progression:", error);
    } else if (data) {
      setProgression(data as GuildProgression);
    } else {
      // Initialize as Apprentice Class 1
      setProgression({
        current_tier: "apprentice",
        current_class: 1,
        total_stake_paid: 0,
        experience_hours: 0,
        completed_contracts: 0,
      });
    }
    setLoading(false);
  };

  const handlePayStake = async (tier: string, classLevel: number) => {
    setPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-guild-stake-checkout", {
        body: { tier, class_level: classLevel },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.url) {
        window.open(data.url, "_blank");
        toast.info("Complete payment to unlock next tier/class");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to create checkout");
    } finally {
      setPaying(false);
    }
  };

  const handleLeaveGuild = async () => {
    if (!user || !progression) return;
    const confirmed = window.confirm('Leave guild? You\'ll keep stake as credits but lose guild benefits.');
    if (!confirmed) return;
    
    try {
      await supabase.from('guild_membership_history').insert({
        user_id: user.id, action: 'left', stake_at_action: progression.total_stake_paid
      });
      await supabase.from('user_guild_progression').update({
        previous_stake_paid: progression.total_stake_paid, left_guild_at: new Date().toISOString()
      }).eq('user_id', user.id);
      toast.success('Left guild. Stake converted to credits.');
      loadProgression();
    } catch (error) {
      toast.error('Failed to leave guild');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progression) return null;

  const currentTier = progression.current_tier;
  const currentClass = progression.current_class;
  const currentInfo = STAKE_INFO[currentTier]?.[currentClass];

  const nextClass = currentClass < 6 ? currentClass + 1 : null;
  const nextTier = currentClass === 6 && currentTier === "apprentice" ? "journeyman" : 
                   currentClass === 6 && currentTier === "journeyman" ? "master" : null;
  
  const nextPayment = nextClass 
    ? STAKE_INFO[currentTier][nextClass]
    : nextTier 
    ? STAKE_INFO[nextTier][1]
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {t('guildProgression.title')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.guildProgression')}
            </CardDescription>
          </div>
          <Badge className={TIER_COLORS[currentTier]}>
            {t(`guildProgression.${currentTier}`)} {t('guild.currentClass')} {currentClass}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Stake Paid</p>
            <p className="text-2xl font-bold">${progression.total_stake_paid.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Platform Benefit Percentage</p>
            <p className="text-2xl font-bold text-green-600">{currentInfo?.profitPercent}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Contracts Completed</p>
            <p className="text-2xl font-bold">{progression.completed_contracts}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Class Progress</span>
            <span className="text-muted-foreground">{currentClass}/6</span>
          </div>
          <Progress value={(currentClass / 6) * 100} />
        </div>

        {/* Next Payment */}
        {nextPayment && (
          <div className="border-t pt-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-semibold">
                  Next: {nextTier ? `${nextTier.charAt(0).toUpperCase() + nextTier.slice(1)} Class 1` : `Class ${nextClass}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Stake: ${nextPayment.amount.toLocaleString()} • 
                  Platform Benefit: {nextPayment.profitPercent}% •
                  Total: ${nextPayment.cumulative.toLocaleString()}
                </p>
              </div>
              <Button 
                onClick={() => handlePayStake(nextTier || currentTier, nextClass || 1)}
                disabled={paying}
                size="sm"
              >
                {paying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Unlock ${nextPayment.amount.toLocaleString()}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={handleLeaveGuild} className="w-full">
          <LogOut className="h-4 w-4 mr-2" />Leave Guild
        </Button>

        {/* Tier Overview */}
        <div className="border-t pt-4 space-y-3">
          <p className="font-semibold text-sm">Guild Tier System</p>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              {currentTier === "apprentice" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4" />}
              <span className={currentTier === "apprentice" ? "font-semibold" : "text-muted-foreground"}>
                Apprentice (6 classes) - No stake required • 40-50% platform benefit
              </span>
            </div>
            <div className="flex items-center gap-2">
              {currentTier === "journeyman" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4" />}
              <span className={currentTier === "journeyman" ? "font-semibold" : "text-muted-foreground"}>
                Journeyman (6 classes) - $7k total stake • 53-68% platform benefit + bonuses
              </span>
            </div>
            <div className="flex items-center gap-2">
              {currentTier === "master" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4" />}
              <span className={currentTier === "master" ? "font-semibold" : "text-muted-foreground"}>
                Master (6 classes) - $67.5k total stake • 71-86% platform benefit + bonuses
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
