/**
 * HELM COMPACT MODE + HUD METERS
 * ================================
 * A floating widget that persists as you navigate.
 *
 * Contains:
 * - Crow Feathers meter (visible after finding Mirror)
 * - Reputation/MARKS meter (visible after earning rep)
 * - Quick-access Compass minimap
 * - "Open Bridge" button to go full-page
 * - Mobile bookshelf access
 *
 * The Helm = your portable controller. Like a mobile device to your mainframe.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getMemberCurrency, type MemberCurrency } from "@/lib/currencyService";
import { hasCoreItem } from "@/hooks/useDiscoveryTracker";
import { Compass, Feather, Star, ChevronUp, ChevronDown, X, Maximize2, Lightbulb, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BeaconLanternCard } from "./BeaconLanternCard";

const LANTERN_VISIBLE_KEY = 'lb_lantern_visible';

export function HelmCompact() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [currency, setCurrency] = useState<MemberCurrency | null>(null);
  const [hasMirror, setHasMirror] = useState(false);
  const [hasCompass, setHasCompass] = useState(false);
  const [feathers, setFeathers] = useState(0);
  const [showPageTools, setShowPageTools] = useState(true);
  const [showLantern, setShowLantern] = useState(false);

  useEffect(() => {
    setHasMirror(hasCoreItem("mirror"));
    setHasCompass(hasCoreItem("compass"));

    // Ghost feathers from localStorage
    try {
      const ghostState = JSON.parse(localStorage.getItem("lb_treasure_map_game") || "{}");
      setFeathers(ghostState.totalFeathers || 0);
    } catch {}

    if (user) loadCurrency();
    
    // Check page tools visibility setting (default to hidden)
    const checkPageTools = () => {
      const stored = localStorage.getItem('lb_show_page_tools');
      setShowPageTools(stored === 'true'); // Only show if explicitly set to 'true'
    };
    checkPageTools();
    
    // Check lantern visibility
    const savedLantern = localStorage.getItem(LANTERN_VISIBLE_KEY);
    if (savedLantern === 'true') {
      setShowLantern(true);
    }
    
    // Listen for storage changes (when user toggles in Index.tsx)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'lb_show_page_tools') {
        setShowPageTools(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);
    
    // Also listen for custom event for same-tab updates
    const handleCustomEvent = () => checkPageTools();
    window.addEventListener('lb_page_tools_changed', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lb_page_tools_changed', handleCustomEvent);
    };
  }, [user]);

  const loadCurrency = async () => {
    const data = await getMemberCurrency();
    if (data) {
      setCurrency(data);
      // Use MARKS as feathers for members
      setFeathers(data.marks || 0);
    }
  };

  const toggleLantern = () => {
    const newValue = !showLantern;
    setShowLantern(newValue);
    localStorage.setItem(LANTERN_VISIBLE_KEY, String(newValue));
  };

  // Don't show until at least one core item is found
  // Also hide if page tools are toggled off
  if (!hasMirror && !hasCompass) return null;
  if (!showPageTools) return null;

  return (
    <>
      {/* Beacon Lantern Card - draggable color selector */}
      {showLantern && (
        <BeaconLanternCard 
          onClose={() => {
            setShowLantern(false);
            localStorage.setItem(LANTERN_VISIBLE_KEY, 'false');
          }}
          initialVisible={true}
        />
      )}
      
      <div className="fixed bottom-20 right-4 z-50">
        {/* Collapsed: just the Helm icon */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-12 h-12 rounded-full bg-card border-2 border-primary/30 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            title="Open Helm"
          >
            <Compass className="w-6 h-6 text-primary" />
          </button>
        )}

      {/* Expanded: HUD meters + controls */}
      {expanded && (
        <div className="w-56 bg-card/95 backdrop-blur-lg border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-xs font-medium text-foreground">The Helm</span>
            <div className="flex gap-1">
              <button
                onClick={() => { setExpanded(false); navigate("/the-helm"); }}
                className="p-1 hover:bg-muted rounded"
                title="Open Bridge (full view)"
              >
                <Maximize2 className="w-3 h-3 text-muted-foreground" />
              </button>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* HUD Meters */}
          <div className="p-3 space-y-3">
            {/* Crow Feathers / MARKS meter */}
            {hasMirror && (
              <div className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {user ? "MARKS" : "Feathers"}
                    </span>
                    <span className="text-sm font-bold text-foreground">{feathers}</span>
                  </div>
                  {currency && (
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min((currency.marks / 100) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reputation / Level meter */}
            {currency && currency.marks > 0 && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Level</span>
                    <Badge variant="outline" className="text-[10px] h-4">
                      {currency.markLevel}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Credits display */}
            {currency && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Credits</span>
                <span className="font-medium">{currency.credits}</span>
              </div>
            )}

            {/* Quick nav */}
            <div className="pt-2 border-t border-border space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-7 gap-2"
                onClick={() => { setExpanded(false); navigate("/wildfire-runs"); }}
              >
                <Flame className="w-3 h-3 text-orange-500" />
                Wildfire Runs
              </Button>
              <Button
                variant={showLantern ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start text-xs h-7 gap-2"
                onClick={toggleLantern}
              >
                <Lightbulb className={`w-3 h-3 ${showLantern ? 'text-amber-500' : ''}`} />
                Lantern Mode
                {showLantern && <Badge variant="outline" className="ml-auto text-[8px] h-4">ON</Badge>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-7"
                onClick={() => { setExpanded(false); navigate("/deck"); }}
              >
                Deck Cards
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-7"
                onClick={() => { setExpanded(false); navigate("/hofund"); }}
              >
                Hofund Studio
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-7"
                onClick={() => { setExpanded(false); navigate("/the-helm"); }}
              >
                Open Bridge
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
