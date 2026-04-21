/**
 * BEACON DROP BUTTON
 * ==================
 * The six-color beacon system with Orange Protocol for user-defined purposes.
 *
 * Colors:
 * - 🟢 Green: Return ("I want to come back")
 * - 🔵 Blue: Important ("This is key information")
 * - 🟡 Yellow: Decision ("Major fork / caution")
 * - 🔴 Red: Blocked ("Need help to proceed")
 * - 🟣 Purple: Complete ("Fully explored this branch")
 * - 🟠 Orange: Custom (User-defined via Orange Protocol)
 *
 * Orange Protocol subtypes:
 * - Game Marker, Share with Person, Social Cue Card, Gift Beacon,
 *   Treasure Cache, Learning Moment, Trade Route, Custom
 */

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MapPin,
  ArrowLeft,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Sparkles,
  Gamepad2,
  User,
  Share2,
  Gift,
  Gem,
  BookOpen,
  Map,
  Pencil,
  Lightbulb,
  Navigation,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";

const ONBOARDING_KEY = 'lb_beacon_onboarding_complete';

// Beacon color definitions
export const BEACON_COLORS = {
  green: { name: 'Return', icon: ArrowLeft, color: '#22c55e', meaning: 'I want to come back' },
  blue: { name: 'Important', icon: Info, color: '#3b82f6', meaning: 'This is key information' },
  yellow: { name: 'Decision', icon: AlertTriangle, color: '#eab308', meaning: 'Major fork / caution' },
  red: { name: 'Blocked', icon: XCircle, color: '#ef4444', meaning: 'Need help to proceed' },
  purple: { name: 'Complete', icon: CheckCircle, color: '#a855f7', meaning: 'Fully explored this branch' },
  orange: { name: 'Custom', icon: Sparkles, color: '#f97316', meaning: 'User-defined purpose' },
} as const;

// Orange Protocol subtypes
export const ORANGE_SUBTYPES = {
  game_marker: { name: 'Game Marker', icon: Gamepad2, description: 'Beacon Run waypoint' },
  share_person: { name: 'Share with Person', icon: User, description: 'Send to someone specific' },
  social_cue: { name: 'Social Cue Card', icon: Share2, description: 'Queue for social media' },
  gift: { name: 'Gift Beacon', icon: Gift, description: 'Drop for someone to find' },
  treasure: { name: 'Treasure Cache', icon: Gem, description: 'Mark a valuable resource' },
  learning: { name: 'Learning Moment', icon: BookOpen, description: 'Educational content' },
  trade_route: { name: 'Trade Route', icon: Map, description: 'Part of a treasure map' },
  custom: { name: 'Custom', icon: Pencil, description: 'Write your own label' },
} as const;

type BeaconColor = keyof typeof BEACON_COLORS;
type OrangeSubtype = keyof typeof ORANGE_SUBTYPES;

interface BeaconDropButtonProps {
  /** Current location path (defaults to window.location.pathname) */
  locationPath?: string;
  /** Compact mode (just icon) */
  compact?: boolean;
  /** Custom class name */
  className?: string;
  /** Callback after successful drop */
  onDrop?: (beacon: any) => void;
  /** Whether user is in Ghost Mode (for Beacon Runs) */
  isGhostMode?: boolean;
  /** User's current beacon number (for sequential numbering) */
  beaconNumber?: number;
}

export function BeaconDropButton({
  locationPath,
  compact = false,
  className = '',
  onDrop,
  isGhostMode = false,
  beaconNumber,
}: BeaconDropButtonProps) {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'onboarding' | 'color' | 'orange' | 'details'>('color');
  const [selectedColor, setSelectedColor] = useState<BeaconColor>('green');
  const [selectedOrangeSubtype, setSelectedOrangeSubtype] = useState<OrangeSubtype>('game_marker');
  const [customLabel, setCustomLabel] = useState('');
  const [beaconName, setBeaconName] = useState('');
  const [beaconNotes, setBeaconNotes] = useState('');
  const [shareWith, setShareWith] = useState('');
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY) === 'true';
    setHasSeenOnboarding(seen);
  }, []);

  const currentPath = locationPath || (typeof window !== 'undefined' ? window.location.pathname : '/');

  // Drop beacon mutation
  const dropBeacon = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in to drop beacons');

      const beaconData: any = {
        user_id: user.id,
        name: beaconName || `${BEACON_COLORS[selectedColor].name} Beacon`,
        icon: getBeaconEmoji(selectedColor),
        beacon_type: 'personal',
        beacon_color: selectedColor,
        location_type: 'page',
        location_path: currentPath,
        notes: beaconNotes || null,
        beacon_number: beaconNumber,
      };

      // Add Orange Protocol data if orange
      if (selectedColor === 'orange') {
        beaconData.orange_subtype = selectedOrangeSubtype;
        beaconData.orange_payload = {
          subtype: selectedOrangeSubtype,
          customLabel: selectedOrangeSubtype === 'custom' ? customLabel : null,
          shareWith: selectedOrangeSubtype === 'share_person' ? shareWith : null,
          isGameMarker: selectedOrangeSubtype === 'game_marker',
          isTradeRoute: selectedOrangeSubtype === 'trade_route',
        };
      }

      const { data, error } = await supabase
        .from('beacons')
        .insert(beaconData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`${BEACON_COLORS[selectedColor].name} beacon dropped!`);
      queryClient.invalidateQueries({ queryKey: ['my-beacons'] });
      setOpen(false);
      resetForm();
      onDrop?.(data);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setStep(hasSeenOnboarding ? 'color' : 'onboarding');
    setSelectedColor('green');
    setSelectedOrangeSubtype('game_marker');
    setCustomLabel('');
    setBeaconName('');
    setBeaconNotes('');
    setShareWith('');
    setDontShowAgain(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setStep(hasSeenOnboarding ? 'color' : 'onboarding');
    }
  };

  const handleOnboardingContinue = () => {
    if (dontShowAgain) {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setHasSeenOnboarding(true);
    }
    setStep('color');
  };

  const getBeaconEmoji = (color: BeaconColor): string => {
    const emojis: Record<BeaconColor, string> = {
      green: '🟢',
      blue: '🔵',
      yellow: '🟡',
      red: '🔴',
      purple: '🟣',
      orange: '🟠',
    };
    return emojis[color];
  };

  const handleColorSelect = (color: BeaconColor) => {
    setSelectedColor(color);
    if (color === 'orange') {
      setStep('orange');
    } else {
      setStep('details');
    }
  };

  const handleOrangeSelect = (subtype: OrangeSubtype) => {
    setSelectedOrangeSubtype(subtype);
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'details' && selectedColor === 'orange') {
      setStep('orange');
    } else if (step === 'details' || step === 'orange') {
      setStep('color');
    }
  };

  if (!user) {
    return (
      <Button
        variant="outline"
        size={compact ? 'icon' : 'default'}
        className={className}
        onClick={() => { openOnboard({ reason: "drop beacons", actionLabel: "Join", membershipIncluded: true }); return; }}
      >
        <MapPin className={compact ? 'w-4 h-4' : 'w-4 h-4 mr-2'} />
        {!compact && 'Drop Beacon'}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={compact ? 'icon' : 'default'}
          className={`${className} ${isGhostMode ? 'border-purple-500/50 hover:border-purple-500' : ''}`}
        >
          <MapPin className={compact ? 'w-4 h-4' : 'w-4 h-4 mr-2'} />
          {!compact && (isGhostMode ? 'Drop Game Beacon' : 'Drop Beacon')}
          {beaconNumber && (
            <Badge variant="secondary" className="ml-2">
              #{beaconNumber}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'onboarding' ? (
              <>
                <Lightbulb className="w-5 h-5 text-amber-500" />
                What Are Beacons?
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                {step === 'color' && 'Choose Beacon Type'}
                {step === 'orange' && '🟠 Orange Protocol'}
                {step === 'details' && `${getBeaconEmoji(selectedColor)} ${BEACON_COLORS[selectedColor].name} Beacon`}
              </>
            )}
          </DialogTitle>
          {step === 'onboarding' && (
            <DialogDescription>
              Your personal navigation system for the platform
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Step 0: Onboarding Explainer */}
        {step === 'onboarding' && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <Navigation className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Beacons are personal markers you drop on pages to find your way back.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Think of them like bookmarks with meaning — each color tells you WHY you marked this spot.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">The Six Colors</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(BEACON_COLORS) as [BeaconColor, typeof BEACON_COLORS[BeaconColor]][]).map(
                  ([color, config]) => (
                    <div
                      key={color}
                      className="flex items-center gap-2 p-2 rounded-lg"
                      style={{ backgroundColor: `${config.color}10` }}
                    >
                      <span className="text-lg">{getBeaconEmoji(color as BeaconColor)}</span>
                      <div>
                        <p className="text-xs font-medium" style={{ color: config.color }}>
                          {config.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{config.meaning}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <p className="text-xs font-medium">How to use beacons:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Drop a beacon on any page you want to remember</li>
                <li>Choose a color that matches your intent</li>
                <li>Return anytime via the Helm (your navigation center)</li>
              </ol>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="dont-show-again"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              />
              <label
                htmlFor="dont-show-again"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Don't show this again
              </label>
            </div>

            <Button onClick={handleOnboardingContinue} className="w-full">
              Got it — Let's Drop a Beacon
            </Button>
          </div>
        )}

        {/* Step 1: Color Selection */}
        {step === 'color' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              What kind of marker do you want to drop here?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(BEACON_COLORS) as [BeaconColor, typeof BEACON_COLORS[BeaconColor]][]).map(
                ([color, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`
                        p-3 rounded-lg border-2 text-left transition-all
                        hover:shadow-md hover:scale-[1.02]
                        ${color === 'orange' ? 'col-span-2 border-dashed' : ''}
                      `}
                      style={{
                        borderColor: `${config.color}40`,
                        backgroundColor: `${config.color}10`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getBeaconEmoji(color as BeaconColor)}</span>
                        <div>
                          <p className="font-medium" style={{ color: config.color }}>
                            {config.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{config.meaning}</p>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* Step 2: Orange Protocol Selection */}
        {step === 'orange' && (
          <div className="space-y-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="mb-2">
              ← Back to colors
            </Button>
            <p className="text-sm text-muted-foreground">
              What's this orange beacon for?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(ORANGE_SUBTYPES) as [OrangeSubtype, typeof ORANGE_SUBTYPES[OrangeSubtype]][]).map(
                ([subtype, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={subtype}
                      onClick={() => handleOrangeSelect(subtype)}
                      className={`
                        p-3 rounded-lg border text-left transition-all
                        hover:shadow-md hover:border-orange-500/50 hover:bg-orange-500/5
                        ${subtype === 'game_marker' && isGhostMode ? 'border-orange-500 bg-orange-500/10' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="font-medium text-sm">{config.name}</p>
                          <p className="text-xs text-muted-foreground">{config.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 'details' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              dropBeacon.mutate();
            }}
            className="space-y-4"
          >
            <Button variant="ghost" size="sm" onClick={handleBack} className="mb-2">
              ← Back
            </Button>

            {/* Location display */}
            <div className="p-2 rounded bg-muted/50 text-xs font-mono">
              📍 {currentPath}
            </div>

            {/* Beacon name */}
            <div>
              <Label htmlFor="beacon-name">Beacon Name</Label>
              <Input
                id="beacon-name"
                value={beaconName}
                onChange={(e) => setBeaconName(e.target.value)}
                placeholder={`${BEACON_COLORS[selectedColor].name} beacon at ${currentPath.split('/').pop() || 'here'}`}
              />
            </div>

            {/* Orange-specific fields */}
            {selectedColor === 'orange' && selectedOrangeSubtype === 'custom' && (
              <div>
                <Label htmlFor="custom-label">Custom Label</Label>
                <Input
                  id="custom-label"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="What's this beacon for?"
                />
              </div>
            )}

            {selectedColor === 'orange' && selectedOrangeSubtype === 'share_person' && (
              <div>
                <Label htmlFor="share-with">Share With</Label>
                <Input
                  id="share-with"
                  value={shareWith}
                  onChange={(e) => setShareWith(e.target.value)}
                  placeholder="Username or email"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="beacon-notes">Notes (optional)</Label>
              <Textarea
                id="beacon-notes"
                value={beaconNotes}
                onChange={(e) => setBeaconNotes(e.target.value)}
                placeholder="Why are you marking this spot?"
                rows={2}
              />
            </div>

            {/* Ghost Mode indicator */}
            {isGhostMode && (
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm font-medium text-purple-400 flex items-center gap-2">
                  👻 Ghost Mode Active
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This beacon will be part of your Beacon Run game route.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={dropBeacon.isPending}
              style={{
                backgroundColor: BEACON_COLORS[selectedColor].color,
              }}
            >
              {dropBeacon.isPending ? 'Dropping...' : `Drop ${getBeaconEmoji(selectedColor)} Beacon`}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BeaconDropButton;
