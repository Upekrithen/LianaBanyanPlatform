/**
 * LOOKING GLASS — Public Transparency Log
 * =========================================
 * Every governance action, financial decision, and platform change
 * is logged here for public viewing.
 *
 * "Fly on the Wall meets the blockchain — except it's just a database
 * you can actually read." — from Cephas
 *
 * Backend: looking_glass_entries
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Eye, Search, Milestone, FileText, Lightbulb,
  Scale, Shield, Clock, Filter,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PortalPageLayout } from "@/components/PortalPageLayout";

interface LookingGlassEntry {
  id: string;
  entry_type: string;
  title: string;
  body: string | null;
  category: string;
  visibility: string;
  source_agent: string | null;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  milestone: { icon: Milestone, color: "bg-green-500/10 text-green-600 border-green-500/20", label: "Milestone" },
  log: { icon: FileText, color: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Log" },
  decision: { icon: Scale, color: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Decision" },
  alert: { icon: Shield, color: "bg-red-500/10 text-red-600 border-red-500/20", label: "Alert" },
  innovation: { icon: Lightbulb, color: "bg-purple-500/10 text-purple-600 border-purple-500/20", label: "Innovation" },
};

const AGENT_COLORS: Record<string, string> = {
  KNIGHT: "bg-blue-500/10 text-blue-600",
  BISHOP: "bg-green-500/10 text-green-600",
  ROOK: "bg-purple-500/10 text-purple-600",
  PAWN: "bg-amber-500/10 text-amber-600",
  SYSTEM: "bg-red-500/10 text-red-600",
};

export default function LookingGlass() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data: entries, isLoading } = useQuery({
    queryKey: ["looking-glass-entries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("looking_glass_entries")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });
      return (data || []) as LookingGlassEntry[];
    },
  });

  const categories = [...new Set(entries?.map((e) => e.category) || [])];
  const types = [...new Set(entries?.map((e) => e.entry_type) || [])];

  const filtered = entries?.filter((entry) => {
    if (search && !entry.title.toLowerCase().includes(search.toLowerCase()) &&
        !entry.body?.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && entry.category !== categoryFilter) return false;
    if (typeFilter && entry.entry_type !== typeFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <PortalPageLayout maxWidth="xl" xrayId="looking-glass">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="xl" xrayId="looking-glass">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Eye className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Looking Glass</h1>
          <p className="text-muted-foreground">
            Every decision, every milestone, every change — all public, all auditable.
          </p>
        </div>
      </div>

      {/* Transparency Promise */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Structural Bylaw:</strong> All governance actions and financial
            decisions are logged publicly through the Looking Glass. This is constitutionally locked and
            cannot be removed by any vote, any agent, or any executive action.
          </p>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={categoryFilter ? "outline" : "default"}
            size="sm"
            onClick={() => setCategoryFilter(null)}
          >
            All Categories
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {types.map((type) => {
          const config = TYPE_CONFIG[type] || TYPE_CONFIG.log;
          const Icon = config.icon;
          return (
            <Button
              key={type}
              variant={typeFilter === type ? "default" : "outline"}
              size="sm"
              className="gap-1"
              onClick={() => setTypeFilter(type === typeFilter ? null : type)}
            >
              <Icon className="w-3 h-3" />
              {config.label}
            </Button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{entries?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Total Entries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{entries?.filter((e) => e.entry_type === "milestone").length || 0}</div>
            <div className="text-xs text-muted-foreground">Milestones</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{entries?.filter((e) => e.entry_type === "decision").length || 0}</div>
            <div className="text-xs text-muted-foreground">Decisions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Entries Timeline */}
      <div className="space-y-4">
        {filtered?.map((entry) => {
          const config = TYPE_CONFIG[entry.entry_type] || TYPE_CONFIG.log;
          const Icon = config.icon;

          return (
            <Card key={entry.id} className="overflow-hidden">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${config.color} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-foreground">{entry.title}</h3>
                      <div className="flex gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                        {entry.source_agent && (
                          <Badge className={`text-xs ${AGENT_COLORS[entry.source_agent] || "bg-muted"}`}>
                            {entry.source_agent}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {entry.body && (
                      <p className="text-sm text-muted-foreground mt-1">{entry.body}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(entry.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No entries match your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </PortalPageLayout>
  );
}
