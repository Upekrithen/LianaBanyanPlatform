import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Check, Grid, List, Star, Loader2 } from "lucide-react";

const SAMPLE_TEMPLATES = [
  { id: "t1", name: "The Artisan", theme_key: "artisan", description: "Warm earth tones with a craft-focused layout.", primary_color: "#8B4513", secondary_color: "#DEB887", accent_color: "#D2691E", font_family: "Georgia, serif", layout_type: "featured" },
  { id: "t2", name: "The Market Stand", theme_key: "market_stand", description: "Clean and minimal with a farm-market feel.", primary_color: "#2E7D32", secondary_color: "#E8F5E9", accent_color: "#4CAF50", font_family: "Inter, sans-serif", layout_type: "grid" },
  { id: "t3", name: "The Workshop", theme_key: "workshop", description: "Industrial maker aesthetic. Dark theme, tool-forward.", primary_color: "#37474F", secondary_color: "#263238", accent_color: "#FF6F00", font_family: "Roboto Mono, monospace", layout_type: "grid" },
  { id: "t4", name: "The Boutique", theme_key: "boutique", description: "Elegant and refined. Light theme with serif fonts.", primary_color: "#F8F0E3", secondary_color: "#FFFFFF", accent_color: "#C9A96E", font_family: "Playfair Display, serif", layout_type: "featured" },
  { id: "t5", name: "The Digital Den", theme_key: "digital_den", description: "Tech-forward with gradient backgrounds.", primary_color: "#1A1A2E", secondary_color: "#16213E", accent_color: "#0F3460", font_family: "Source Code Pro, monospace", layout_type: "list" },
  { id: "t6", name: "The Kitchen Table", theme_key: "kitchen_table", description: "Homey and warm. Yellows and oranges, feels like home.", primary_color: "#FFF8E1", secondary_color: "#FFECB3", accent_color: "#FF8F00", font_family: "Nunito, sans-serif", layout_type: "grid" },
];

type StoreTemplate = {
  id: string;
  name: string;
  theme_key: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  layout_type: "grid" | "list" | "featured";
};

function LayoutIcon({ type }: { type: string }) {
  if (type === "grid") return <Grid className="h-3.5 w-3.5" />;
  if (type === "list") return <List className="h-3.5 w-3.5" />;
  return <Star className="h-3.5 w-3.5" />;
}

export default function StoreTemplates() {
  const [templates, setTemplates] = useState<StoreTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [useSampleData, setUseSampleData] = useState(false);

  useEffect(() => {
    async function fetchTemplates() {
      const { data, error } = await supabase
        .from("store_templates")
        .select("id, name, theme_key, description, primary_color, secondary_color, accent_color, font_family, layout_type")
        .eq("is_active", true);

      if (error || !data?.length) {
        setTemplates(SAMPLE_TEMPLATES as StoreTemplate[]);
        setUseSampleData(true);
      } else {
        setTemplates(data as StoreTemplate[]);
      }
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  const handleUseTemplate = (id: string) => {
    setSelectedTemplate(id);
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground dark:text-foreground">
          <Palette className="h-7 w-7" />
          Store Templates — Choose Your Look
        </h1>
        {useSampleData && (
          <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30">
            Sample Data
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <Card
            key={t.id}
            className={`relative overflow-hidden transition-all ${
              selectedTemplate === t.id
                ? "ring-2 ring-purple-500 dark:ring-purple-400 shadow-lg"
                : "hover:shadow-md dark:hover:shadow-lg"
            }`}
          >
            {selectedTemplate === t.id && (
              <div className="absolute top-3 right-3 z-10 rounded-full bg-purple-500 p-1 text-white dark:bg-purple-400">
                <Check className="h-4 w-4" />
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t.name}</CardTitle>
              <CardDescription className="text-sm">{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-800 shadow-inner"
                  style={{ backgroundColor: t.primary_color }}
                />
                <div
                  className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-800 shadow-inner"
                  style={{ backgroundColor: t.secondary_color }}
                />
                <div
                  className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-800 shadow-inner"
                  style={{ backgroundColor: t.accent_color }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <LayoutIcon type={t.layout_type} />
                  {t.layout_type}
                </Badge>
                <span className="text-xs text-muted-foreground">{t.font_family}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => handleUseTemplate(t.id)}
              >
                Use This Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
