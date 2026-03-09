import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  ArrowLeft,
  Info,
  AlertTriangle,
  CheckCircle,
  Lock,
  Gamepad2,
  User,
  Megaphone,
  Gift,
  Gem,
  BookOpen,
  Map,
  Pencil,
} from "lucide-react";

type BeaconColor = "green" | "blue" | "yellow" | "red" | "purple" | "orange";

interface BeaconType {
  color: BeaconColor;
  name: string;
  meaning: string;
  icon: React.ElementType;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

const BEACON_TYPES: BeaconType[] = [
  {
    color: "green",
    name: "Return",
    meaning: "I want to come back",
    icon: ArrowLeft,
    bgClass: "bg-green-500",
    textClass: "text-green-700",
    borderClass: "border-green-500",
  },
  {
    color: "blue",
    name: "Important",
    meaning: "This is key information",
    icon: Info,
    bgClass: "bg-blue-500",
    textClass: "text-blue-700",
    borderClass: "border-blue-500",
  },
  {
    color: "yellow",
    name: "Decision",
    meaning: "Major fork / caution",
    icon: AlertTriangle,
    bgClass: "bg-yellow-500",
    textClass: "text-yellow-700",
    borderClass: "border-yellow-500",
  },
  {
    color: "red",
    name: "Blocked",
    meaning: "Need help to proceed",
    icon: Lock,
    bgClass: "bg-red-500",
    textClass: "text-red-700",
    borderClass: "border-red-500",
  },
  {
    color: "purple",
    name: "Complete",
    meaning: "Fully explored this branch",
    icon: CheckCircle,
    bgClass: "bg-purple-500",
    textClass: "text-purple-700",
    borderClass: "border-purple-500",
  },
  {
    color: "orange",
    name: "Custom",
    meaning: "Special purpose (Orange Protocol)",
    icon: MapPin,
    bgClass: "bg-orange-500",
    textClass: "text-orange-700",
    borderClass: "border-orange-500",
  },
];

type OrangeSubtype = 
  | "game_marker"
  | "share_person"
  | "social_cue"
  | "gift"
  | "treasure"
  | "learning"
  | "trade_route"
  | "custom";

interface OrangeOption {
  subtype: OrangeSubtype;
  icon: React.ElementType;
  label: string;
  description: string;
}

const ORANGE_OPTIONS: OrangeOption[] = [
  { subtype: "game_marker", icon: Gamepad2, label: "Beacon Run", description: "Part of a game route" },
  { subtype: "share_person", icon: User, label: "Share with...", description: "Named recipient" },
  { subtype: "social_cue", icon: Megaphone, label: "Social Post", description: "Queue for social media" },
  { subtype: "gift", icon: Gift, label: "Gift Beacon", description: "Drop for someone to find" },
  { subtype: "treasure", icon: Gem, label: "Treasure Cache", description: "Valuable resource location" },
  { subtype: "learning", icon: BookOpen, label: "Learning Moment", description: "Educational content" },
  { subtype: "trade_route", icon: Map, label: "Trade Route", description: "Part of treasure map" },
  { subtype: "custom", icon: Pencil, label: "Custom", description: "Write your own label" },
];

interface BeaconDropUIProps {
  currentPath: string;
  currentPageTitle?: string;
  onBeaconDropped?: (beacon: any) => void;
}

export function BeaconDropUI({
  currentPath,
  currentPageTitle,
  onBeaconDropped,
}: BeaconDropUIProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<BeaconColor | null>(null);
  const [orangeSubtype, setOrangeSubtype] = useState<OrangeSubtype | null>(null);
  const [note, setNote] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [shareWithName, setShareWithName] = useState("");

  const dropBeacon = useMutation({
    mutationFn: async () => {
      if (!user || !selectedColor) throw new Error("Must select a beacon color");

      const beaconData = {
        user_id: user.id,
        beacon_color: selectedColor,
        path: currentPath,
        page_title: currentPageTitle || currentPath,
        note: note || null,
        orange_subtype: selectedColor === "orange" ? orangeSubtype : null,
        orange_payload: selectedColor === "orange" ? {
          custom_label: customLabel || null,
          share_with: shareWithName || null,
        } : null,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("beacons")
        .insert(beaconData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const beaconType = BEACON_TYPES.find(b => b.color === selectedColor);
      toast.success(`${beaconType?.name} beacon dropped!`, {
        description: `Marked: ${currentPageTitle || currentPath}`,
      });
      queryClient.invalidateQueries({ queryKey: ["user-beacons"] });
      onBeaconDropped?.(data);
      resetForm();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to drop beacon: ${error.message}`);
    },
  });

  const resetForm = () => {
    setSelectedColor(null);
    setOrangeSubtype(null);
    setNote("");
    setCustomLabel("");
    setShareWithName("");
  };

  const handleDrop = () => {
    if (!selectedColor) {
      toast.error("Please select a beacon color");
      return;
    }
    if (selectedColor === "orange" && !orangeSubtype) {
      toast.error("Please select what this orange beacon is for");
      return;
    }
    dropBeacon.mutate();
  };

  const selectedBeaconType = BEACON_TYPES.find(b => b.color === selectedColor);
  const selectedOrangeOption = ORANGE_OPTIONS.find(o => o.subtype === orangeSubtype);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MapPin className="w-4 h-4" />
          Drop Beacon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Drop a Beacon
          </DialogTitle>
          <DialogDescription>
            Mark this location: <span className="font-medium">{currentPageTitle || currentPath}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Beacon Color Selection */}
          <div>
            <Label className="mb-2 block">Select Beacon Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {BEACON_TYPES.map((beacon) => {
                const Icon = beacon.icon;
                const isSelected = selectedColor === beacon.color;

                return (
                  <button
                    key={beacon.color}
                    onClick={() => {
                      setSelectedColor(beacon.color);
                      if (beacon.color !== "orange") {
                        setOrangeSubtype(null);
                      }
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `${beacon.borderClass} bg-opacity-10 ${beacon.bgClass}/10`
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full ${beacon.bgClass} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className={`text-xs font-medium ${isSelected ? beacon.textClass : ""}`}>
                        {beacon.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Beacon Info */}
          {selectedBeaconType && (
            <Card className={`border-2 ${selectedBeaconType.borderClass}`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${selectedBeaconType.bgClass} flex items-center justify-center`}>
                    <selectedBeaconType.icon className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedBeaconType.name} Beacon</p>
                    <p className="text-xs text-muted-foreground">{selectedBeaconType.meaning}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orange Protocol Options */}
          {selectedColor === "orange" && (
            <div>
              <Label className="mb-2 block">What's this beacon for?</Label>
              <div className="grid grid-cols-4 gap-2">
                {ORANGE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = orangeSubtype === option.subtype;

                  return (
                    <Popover key={option.subtype}>
                      <PopoverTrigger asChild>
                        <button
                          onClick={() => setOrangeSubtype(option.subtype)}
                          className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                            isSelected
                              ? "border-orange-500 bg-orange-50"
                              : "border-muted hover:border-orange-300"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? "text-orange-600" : "text-muted-foreground"}`} />
                          <span className="text-xs">{option.label}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="w-auto p-2">
                        <p className="text-xs">{option.description}</p>
                      </PopoverContent>
                    </Popover>
                  );
                })}
              </div>

              {/* Orange-specific inputs */}
              {orangeSubtype === "share_person" && (
                <div className="mt-3">
                  <Label>Share with (name)</Label>
                  <Input
                    placeholder="e.g., Cousin Sal"
                    value={shareWithName}
                    onChange={(e) => setShareWithName(e.target.value)}
                  />
                </div>
              )}

              {orangeSubtype === "custom" && (
                <div className="mt-3">
                  <Label>Custom Label</Label>
                  <Input
                    placeholder="What's this beacon for?"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <div>
            <Label>Add a note (optional)</Label>
            <Textarea
              placeholder="Why are you marking this location?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          {/* Drop Button */}
          <Button
            className="w-full"
            onClick={handleDrop}
            disabled={!selectedColor || (selectedColor === "orange" && !orangeSubtype) || dropBeacon.isPending}
          >
            {dropBeacon.isPending ? "Dropping..." : "Drop Beacon"}
          </Button>

          {/* Info */}
          <p className="text-xs text-center text-muted-foreground">
            Beacons help you navigate back to important locations. View all your beacons in the Helm.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BeaconIndicator({ color, size = "sm" }: { color: BeaconColor; size?: "sm" | "md" | "lg" }) {
  const beacon = BEACON_TYPES.find(b => b.color === color);
  if (!beacon) return null;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const Icon = beacon.icon;

  return (
    <div className={`${sizeClasses[size]} rounded-full ${beacon.bgClass} flex items-center justify-center`}>
      <Icon className={`${size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"} text-white`} />
    </div>
  );
}

export default BeaconDropUI;
