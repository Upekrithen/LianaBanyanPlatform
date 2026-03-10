import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Map,
  MapPin,
  ArrowLeft,
  Info,
  AlertTriangle,
  CheckCircle,
  Lock,
  Navigation,
  Clock,
  Trash2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { BeaconIndicator } from "./BeaconDropUI";

type BeaconColor = "green" | "blue" | "yellow" | "red" | "purple" | "orange";

interface Beacon {
  id: string;
  user_id: string;
  beacon_color: BeaconColor;
  beacon_number: number;
  path: string;
  page_title: string;
  note: string | null;
  orange_subtype: string | null;
  orange_payload: any;
  created_at: string;
}

const BEACON_COLORS: Record<BeaconColor, { bg: string; border: string; text: string; name: string }> = {
  green: { bg: "bg-green-500", border: "border-green-500", text: "text-green-700", name: "Return" },
  blue: { bg: "bg-blue-500", border: "border-blue-500", text: "text-blue-700", name: "Important" },
  yellow: { bg: "bg-yellow-500", border: "border-yellow-500", text: "text-yellow-700", name: "Decision" },
  red: { bg: "bg-red-500", border: "border-red-500", text: "text-red-700", name: "Blocked" },
  purple: { bg: "bg-purple-500", border: "border-purple-500", text: "text-purple-700", name: "Complete" },
  orange: { bg: "bg-orange-500", border: "border-orange-500", text: "text-orange-700", name: "Custom" },
};

export function JourneyMap() {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const navigate = useNavigate();
  const [selectedBeacon, setSelectedBeacon] = useState<Beacon | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data: beacons, isLoading } = useQuery({
    queryKey: ["user-beacons", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("beacons")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Beacon[];
    },
    enabled: !!user,
  });

  // Group beacons by path prefix for visualization
  const groupedBeacons = useMemo(() => {
    if (!beacons) return {};

    const groups: Record<string, Beacon[]> = {};
    beacons.forEach((beacon) => {
      const pathParts = beacon.path.split("/").filter(Boolean);
      const groupKey = pathParts[0] || "root";
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(beacon);
    });

    return groups;
  }, [beacons]);

  const stats = useMemo(() => {
    if (!beacons) return { total: 0, byColor: {} as Record<BeaconColor, number> };

    const byColor: Record<BeaconColor, number> = {
      green: 0,
      blue: 0,
      yellow: 0,
      red: 0,
      purple: 0,
      orange: 0,
    };

    beacons.forEach((b) => {
      byColor[b.beacon_color]++;
    });

    return { total: beacons.length, byColor };
  }, [beacons]);

  const handlePortalTo = (beacon: Beacon) => {
    navigate(beacon.path);
    setDetailDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Map className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-3">Your journey map tracks your progress across the platform.</p>
          <Button variant="outline" size="sm" onClick={() => openOnboard({ reason: "Track your journey across the platform", actionLabel: "View Journey Map" })}>
            Get Started
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Map className="w-6 h-6" />
            Your Journey Map
          </h2>
          <p className="text-muted-foreground">
            Navigate back to any beacon you've dropped
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {stats.total} Beacons
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(stats.byColor).map(([color, count]) => {
          if (count === 0) return null;
          const colorConfig = BEACON_COLORS[color as BeaconColor];
          return (
            <Badge
              key={color}
              variant="outline"
              className={`${colorConfig.border} ${colorConfig.text}`}
            >
              <div className={`w-3 h-3 rounded-full ${colorConfig.bg} mr-1`} />
              {count} {colorConfig.name}
            </Badge>
          );
        })}
      </div>

      {/* Journey Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Beacon Trail
          </CardTitle>
          <CardDescription>
            Click any beacon to portal back to that location
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : beacons && beacons.length > 0 ? (
            <div className="space-y-6">
              {/* Linear Trail View */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
                <div className="space-y-4">
                  {beacons.map((beacon, index) => {
                    const colorConfig = BEACON_COLORS[beacon.beacon_color];
                    return (
                      <div
                        key={beacon.id}
                        className="relative pl-10 cursor-pointer group"
                        onClick={() => {
                          setSelectedBeacon(beacon);
                          setDetailDialogOpen(true);
                        }}
                      >
                        {/* Beacon Marker */}
                        <div className={`absolute left-0 w-8 h-8 rounded-full ${colorConfig.bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <span className="text-white text-xs font-bold">
                            #{index + 1}
                          </span>
                        </div>

                        {/* Beacon Card */}
                        <Card className={`border-l-4 ${colorConfig.border} hover:shadow-md transition-shadow`}>
                          <CardContent className="py-3 px-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {beacon.page_title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {beacon.path}
                                </p>
                                {beacon.note && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                    "{beacon.note}"
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <Badge variant="outline" className={`text-xs ${colorConfig.text}`}>
                                  {colorConfig.name}
                                </Badge>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(beacon.created_at)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grouped View */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  By Area
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(groupedBeacons).map(([group, groupBeacons]) => (
                    <Card key={group} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="py-3 px-4">
                        <p className="font-medium capitalize">{group}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {groupBeacons.slice(0, 5).map((b) => (
                            <BeaconIndicator key={b.id} color={b.beacon_color} size="sm" />
                          ))}
                          {groupBeacons.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{groupBeacons.length - 5}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {groupBeacons.length} beacon{groupBeacons.length !== 1 ? "s" : ""}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No beacons yet</h3>
              <p className="text-sm max-w-md mx-auto">
                Drop beacons as you explore to mark important locations.
                You can portal back to any beacon at any time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Beacon Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          {selectedBeacon && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BeaconIndicator color={selectedBeacon.beacon_color} size="md" />
                  {BEACON_COLORS[selectedBeacon.beacon_color].name} Beacon
                </DialogTitle>
                <DialogDescription>
                  Dropped {formatDate(selectedBeacon.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedBeacon.page_title}</p>
                  <p className="text-xs text-muted-foreground">{selectedBeacon.path}</p>
                </div>

                {selectedBeacon.note && (
                  <div>
                    <p className="text-sm text-muted-foreground">Note</p>
                    <p className="text-sm">{selectedBeacon.note}</p>
                  </div>
                )}

                {selectedBeacon.orange_subtype && (
                  <div>
                    <p className="text-sm text-muted-foreground">Orange Protocol</p>
                    <Badge variant="outline" className="text-orange-700 border-orange-500">
                      {selectedBeacon.orange_subtype.replace("_", " ")}
                    </Badge>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handlePortalTo(selectedBeacon)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Portal Here
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Remove beacon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <h4 className="font-medium mb-3">Beacon Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(BEACON_COLORS).map(([color, config]) => (
              <div key={color} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${config.bg}`} />
                <span className="text-sm">{config.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default JourneyMap;
