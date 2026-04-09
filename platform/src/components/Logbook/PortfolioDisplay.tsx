import React, { useState } from "react";
import { useLogbook } from "./LogbookContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Map,
  FileText,
  Package,
  Users,
  Coins,
  Sword,
  Building,
  Trophy,
  Settings,
  Lock,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ScrollType = "maps" | "notes" | "inventory" | "contacts" | "treasury" | "equipment" | "memberships" | "achievements" | "settings";

interface ScrollConfig {
  id: ScrollType;
  icon: React.ElementType;
  label: string;
  color: string;
}

const SCROLLS: ScrollConfig[] = [
  { id: "maps", icon: Map, label: "Maps", color: "text-blue-400" },
  { id: "notes", icon: FileText, label: "Notes", color: "text-amber-400" },
  { id: "inventory", icon: Package, label: "Inventory", color: "text-green-400" },
  { id: "contacts", icon: Users, label: "Contacts", color: "text-purple-400" },
  { id: "treasury", icon: Coins, label: "Treasury", color: "text-yellow-400" },
  { id: "equipment", icon: Sword, label: "Equipment", color: "text-red-400" },
  { id: "memberships", icon: Building, label: "Members", color: "text-cyan-400" },
  { id: "achievements", icon: Trophy, label: "Achieve", color: "text-orange-400" },
  { id: "settings", icon: Settings, label: "Settings", color: "text-slate-400" },
];

export function PortfolioDisplay() {
  const { portfolio, isMember, exportLogbook } = useLogbook();
  const [activeScroll, setActiveScroll] = useState<ScrollType>("inventory");

  if (!isMember) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-slate-500" />
            Portfolio
          </CardTitle>
          <CardDescription>
            Members-only persistent storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="grid grid-cols-5 gap-2 mb-6 opacity-50">
              {SCROLLS.slice(0, 5).map((scroll) => (
                <div key={scroll.id} className="text-center p-2">
                  <scroll.icon className={cn("h-6 w-6 mx-auto", scroll.color)} />
                  <span className="text-xs">{scroll.label}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mb-6 opacity-50">
              {SCROLLS.slice(5).map((scroll) => (
                <div key={scroll.id} className="text-center p-2">
                  <scroll.icon className={cn("h-6 w-6 mx-auto", scroll.color)} />
                  <span className="text-xs">{scroll.label}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              Your Portfolio keeps everything forever.
              <br />
              Never lose your progress again.
            </p>
            <Button className="bg-amber-600 hover:bg-amber-500">
              Become a Member - $5/year
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              📖 Your Portfolio
            </CardTitle>
            <CardDescription>
              Cloud-synced • Never lose progress
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportLogbook}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {SCROLLS.slice(0, 5).map((scroll) => (
            <button
              key={scroll.id}
              onClick={() => setActiveScroll(scroll.id)}
              className={cn(
                "text-center p-2 rounded-lg transition-colors",
                activeScroll === scroll.id
                  ? "bg-slate-700"
                  : "hover:bg-slate-800/50"
              )}
            >
              <scroll.icon className={cn("h-6 w-6 mx-auto", scroll.color)} />
              <span className="text-xs">{scroll.label}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {SCROLLS.slice(5).map((scroll) => (
            <button
              key={scroll.id}
              onClick={() => setActiveScroll(scroll.id)}
              className={cn(
                "text-center p-2 rounded-lg transition-colors",
                activeScroll === scroll.id
                  ? "bg-slate-700"
                  : "hover:bg-slate-800/50"
              )}
            >
              <scroll.icon className={cn("h-6 w-6 mx-auto", scroll.color)} />
              <span className="text-xs">{scroll.label}</span>
            </button>
          ))}
        </div>

        <div className="border border-amber-500/30 rounded-lg p-4 bg-slate-900/50">
          <ScrollContent scroll={activeScroll} portfolio={portfolio} />
        </div>
      </CardContent>
    </Card>
  );
}

function ScrollContent({
  scroll,
  portfolio,
}: {
  scroll: ScrollType;
  portfolio: {
    maps: { id: string; locationId: string; discoveredAt: Date; notes?: string; isTreasureMap: boolean }[];
    notes: { id: string; title: string; content: string; createdAt: Date; updatedAt: Date }[];
    inventory: { id: string; type: string; name: string; quantity: number; acquiredAt: Date }[];
    contacts: { id: string; name: string; relationship: string; addedAt: Date }[];
    achievements: { id: string; name: string; description: string; earnedAt: Date; icon: string }[];
    lastSync: Date;
  } | null;
}) {
  if (!portfolio) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Loading portfolio...
      </div>
    );
  }

  switch (scroll) {
    case "inventory":
      return (
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {portfolio.inventory.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No items in inventory yet
              </p>
            ) : (
              portfolio.inventory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-slate-800/30 rounded"
                >
                  <span>{item.name}</span>
                  <Badge>{item.quantity}</Badge>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      );

    case "maps":
      return (
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {portfolio.maps.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No maps discovered yet
              </p>
            ) : (
              portfolio.maps.map((map) => (
                <div
                  key={map.id}
                  className="flex items-center justify-between p-2 bg-slate-800/30 rounded"
                >
                  <div>
                    <span>{map.locationId}</span>
                    {map.isTreasureMap && (
                      <Badge className="ml-2" variant="outline">
                        Treasure
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {map.discoveredAt.toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      );

    case "notes":
      return (
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {portfolio.notes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No notes saved yet
              </p>
            ) : (
              portfolio.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-2 bg-slate-800/30 rounded"
                >
                  <div className="font-medium">{note.title}</div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      );

    case "achievements":
      return (
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {portfolio.achievements.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No achievements earned yet
              </p>
            ) : (
              portfolio.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-2 bg-slate-800/30 rounded"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <div className="font-medium">{achievement.name}</div>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      );

    default:
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No items to display yet.</p>
        </div>
      );
  }
}

export default PortfolioDisplay;
