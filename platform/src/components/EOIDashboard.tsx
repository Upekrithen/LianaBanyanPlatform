import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Calendar, Bell } from "lucide-react";
import { format } from "date-fns";
import { EOIVestingDashboard } from "./EOIVestingDashboard";
import { LBFundingPoolDisplay } from "./LBFundingPoolDisplay";

interface EOIData {
  eoi_credits: number;
  eoi_used_credits: number;
  eoi_conversion_rate: number;
  eoi_last_conversion_at: string | null;
  total_credits: number;
  used_credits: number;
}

export function EOIDashboard() {
  const { user } = useAuth();
  const [eoiData, setEOIData] = useState<EOIData | null>(null);
  const [showEOI, setShowEOI] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Load preferences
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("show_eoi_data")
        .eq("user_id", user.id)
        .maybeSingle();

      if (prefs?.show_eoi_data) {
        setShowEOI(true);
        
        // Load EOI credit data
        const { data: credits } = await supabase
          .from("user_credits")
          .select("eoi_credits, eoi_used_credits, eoi_conversion_rate, eoi_last_conversion_at, total_credits, used_credits")
          .eq("user_id", user.id)
          .single();

        if (credits) {
          setEOIData(credits);
        }
      }
    };

    loadData();

    // Listen for EOI toggle changes
    const handleToggle = (e: CustomEvent) => {
      setShowEOI(e.detail.showEOI);
      if (e.detail.showEOI) {
        loadData();
      }
    };

    window.addEventListener('eoi-toggle-changed', handleToggle as EventListener);
    return () => {
      window.removeEventListener('eoi-toggle-changed', handleToggle as EventListener);
    };
  }, [user]);

  if (!showEOI || !eoiData) return null;

  const availableEOI = eoiData.eoi_credits - eoiData.eoi_used_credits;
  const eoiProgress = (eoiData.eoi_used_credits / eoiData.eoi_credits) * 100;
  const dailyConversion = eoiData.eoi_credits * eoiData.eoi_conversion_rate;
  const daysToConvert = Math.ceil(eoiData.eoi_credits / dailyConversion);

  return (
    <div className="space-y-6">
      {/* LB Funding Pool */}
      <LBFundingPoolDisplay />
      
      {/* EOI Credits Overview */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>EOI Credits Dashboard</CardTitle>
            </div>
            <Badge variant="secondary" className="font-mono">
              {availableEOI.toFixed(2)} / {eoiData.eoi_credits.toFixed(2)}
            </Badge>
          </div>
          <CardDescription>
            Expression of Interest - Test scenarios with ghost credits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Real vs EOI Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Real Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(eoiData.total_credits - eoiData.used_credits).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Available for actual pledges</p>
              </CardContent>
            </Card>
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  EOI Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{availableEOI.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Ghost credits for testing</p>
              </CardContent>
            </Card>
          </div>

          {/* EOI Usage Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">EOI Credits Used</span>
              <span className="font-medium">{eoiProgress.toFixed(1)}%</span>
            </div>
            <Progress value={eoiProgress} className="h-2" />
          </div>

          {/* Conversion Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Daily Conversion
              </div>
              <div className="text-lg font-semibold">{dailyConversion.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {(eoiData.eoi_conversion_rate * 100).toFixed(1)}% per day
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Days to Convert
              </div>
              <div className="text-lg font-semibold">{daysToConvert}</div>
              <p className="text-xs text-muted-foreground">
                At current rate
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Bell className="h-3 w-3" />
                Last Conversion
              </div>
              <div className="text-sm font-medium">
                {eoiData.eoi_last_conversion_at 
                  ? format(new Date(eoiData.eoi_last_conversion_at), "MMM d, HH:mm")
                  : "Never"}
              </div>
            </div>
          </div>


          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <p className="font-medium mb-1">How EOI Credits Work:</p>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>• Use EOI credits to test pledges without spending real credits</li>
              <li>• EOI pledges show as "ghost" data in aggregate analytics</li>
              <li>• {(eoiData.eoi_conversion_rate * 100).toFixed(1)}% of EOI credits convert to real credits daily</li>
              <li>• You'll receive reminders before daily conversions</li>
              <li>• Toggle visibility anytime to compare scenarios</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Vesting Schedules */}
      <EOIVestingDashboard />
    </div>
  );
}
