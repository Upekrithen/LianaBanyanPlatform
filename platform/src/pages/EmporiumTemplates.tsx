import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { BeaconDropButton } from "@/components/BeaconDropButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Store, Search, Filter, Paintbrush, Download, Ghost,
  ShoppingCart, Star, Eye, Users, Trophy, Sparkles, ArrowLeft, X
} from "lucide-react";
import SlingshotSuggestion from "@/components/slingshot/SlingshotSuggestion";

interface EmporiumItem {
  id: string;
  creator_id: string;
  category: string;
  title: string;
  description: string | null;
  image_url: string;
  price: number | null;
  status: string;
  stamp_rating: number | null;
  battle_id: string | null;
  royalty_uses: number;
  royalty_earnings: number;
  tags: string[] | null;
  created_at: string;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "loteria_card", label: "Loteria Cards" },
  { value: "cue_card_template", label: "Cue Card Templates" },
  { value: "business_card_template", label: "Business Card Templates" },
  { value: "logo", label: "Logos" },
  { value: "menu_template", label: "Menu Templates" },
  { value: "coalition_brand", label: "Coalition Brands" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Used" },
  { value: "rating", label: "Highest Rated" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

export default function EmporiumTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory && CATEGORIES.some(c => c.value === urlCategory) ? urlCategory : "all");
  const [sortBy, setSortBy] = useState("newest");
  const [ghostCredits, setGhostCredits] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<EmporiumItem | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["emporium-templates", selectedCategory, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("arena_submissions" as never)
        .select("*") as any;

      query = query.in("status", ["approved", "in_emporium", "in_battle"]);

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      switch (sortBy) {
        case "popular": query = query.order("royalty_uses", { ascending: false }); break;
        case "rating": query = query.order("stamp_rating", { ascending: false }); break;
        case "price_low": query = query.order("price", { ascending: true }); break;
        case "price_high": query = query.order("price", { ascending: false }); break;
        default: query = query.order("created_at", { ascending: false });
      }

      const { data } = await query.limit(50);
      return (data || []) as EmporiumItem[];
    },
  });

  const filteredTemplates = templates?.filter(t =>
    !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Purchase template — 83.3% to designer, 16.7% to platform
  const purchaseMutation = useMutation({
    mutationFn: async (item: EmporiumItem) => {
      if (!user) throw new Error("Must be logged in");
      if (!item.price) throw new Error("This is a bounty submission — commission the designer instead");

      const designerShare = Number((item.price * 0.833).toFixed(2));

      await supabase.from("arena_submissions" as never).update({
        royalty_uses: item.royalty_uses + 1,
        royalty_earnings: Number(item.royalty_earnings) + designerShare,
      } as never).eq("id", item.id as never);

      return { designerShare, price: item.price };
    },
    onSuccess: (result) => {
      toast({ title: "Template Purchased!", description: `Designer earned ${result.designerShare.toFixed(2)} Credits.` });
      queryClient.invalidateQueries({ queryKey: ["emporium-templates"] });
      setSelectedItem(null);
    },
    onError: (err: Error) => {
      toast({ title: "Purchase failed", description: err.message, variant: "destructive" });
    },
  });

  function handleGhostBuy(itemId: string) {
    setGhostCredits(prev =>
      prev.includes(itemId) ? prev : [...prev, itemId]
    );
  }

  const categoryLabel = (cat: string) =>
    CATEGORIES.find(c => c.value === cat)?.label || cat.replace(/_/g, " ");

  return (
    <PortalPageLayout maxWidth="xl" xrayId="emporium-templates">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <Store className="h-12 w-12 mx-auto mb-3 text-amber-400" />
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-bold" data-xray-id="emporium-title">
            Design Emporium
          </h1>
          <BeaconDropButton compact className="ml-2" />
        </div>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Browse templates from LB designers. Use them for your business, or commission the designer directly.
          Every use earns the designer royalties.
        </p>
      </div>

      {/* Slingshot Suggestion Banner */}
      {user && (
        <div className="mb-4">
          <SlingshotSuggestion onFilterDesigner={(designerId) => setSearchQuery(designerId)} />
        </div>
      )}

      {/* Ghost Credit Banner (non-members) */}
      {!user && ghostCredits.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ghost className="h-6 w-6 text-purple-400" />
              <div>
                <p className="font-semibold">You have {ghostCredits.length} item{ghostCredits.length !== 1 ? "s" : ""} waiting</p>
                <p className="text-sm text-muted-foreground">
                  Join for $5/year to unlock your selections
                </p>
              </div>
            </div>
            <Link to="/membership">
              <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                <Sparkles className="h-4 w-4" /> Join & Unlock
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Conversion prompt at 3+ ghost credits */}
      {!user && ghostCredits.length >= 3 && (
        <Card className="mb-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 animate-pulse">
          <CardContent className="py-4 text-center">
            <p className="text-lg font-bold text-amber-300">
              You clearly have good taste.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {ghostCredits.length} designs saved — $5/year unlocks them all + 83.3% earnings on your own work.
            </p>
            <Link to="/membership">
              <Button className="mt-3 bg-amber-600 hover:bg-amber-700">
                Start Earning
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search designs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading designs...</div>
      ) : !filteredTemplates || filteredTemplates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-8 pb-8 text-center">
            <Paintbrush className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="font-medium text-lg">No Designs Yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first — submit your design in the Arena!
            </p>
            <Link to="/arena">
              <Button variant="outline" className="mt-4 gap-2">
                <Paintbrush className="h-4 w-4" /> Go to Arena
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map(item => (
            <Card key={item.id} className="overflow-hidden hover:scale-[1.01] transition-transform group cursor-pointer" onClick={() => setSelectedItem(item)}>
              {/* Image */}
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />
                {item.battle_id && (
                  <Badge className="absolute top-2 left-2 bg-red-600/90">
                    <Trophy className="h-3 w-3 mr-1" /> Battle Entry
                  </Badge>
                )}
                {item.status === "in_emporium" && (
                  <Badge className="absolute top-2 left-2 bg-amber-600/90">
                    <Star className="h-3 w-3 mr-1" /> Featured
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {categoryLabel(item.category)}
                    </Badge>
                  </div>
                  {item.stamp_rating && (
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-bold">{item.stamp_rating}</span>
                    </div>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" /> {item.royalty_uses} uses
                  </span>
                  <span className="font-bold text-foreground">
                    {item.price ? `${item.price} Credits` : "Bounty submission"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  {user ? (
                    <>
                      <Button size="sm" className="flex-1 gap-1" onClick={() => item.price ? purchaseMutation.mutate(item) : setSelectedItem(item)}>
                        <Download className="h-3 w-3" />
                        {item.price ? "Use Template" : "View"}
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => setSelectedItem(item)}>
                        <Users className="h-3 w-3" />
                        Commission
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => handleGhostBuy(item.id)}
                      disabled={ghostCredits.includes(item.id)}
                    >
                      <Ghost className="h-3 w-3" />
                      {ghostCredits.includes(item.id) ? "Saved" : "Ghost Buy"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Your work is never wasted */}
      <Card className="mt-8 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <Paintbrush className="h-8 w-8 text-emerald-400 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2">Your Work Is Never Wasted</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every design submitted to the Arena — win or lose — gets a permanent Emporium listing,
                an IP Ledger entry, portfolio visibility, and may earn royalties when businesses use it.
                The battle itself is marketing for your skills.
              </p>
              <Link to="/arena" className="inline-block mt-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Paintbrush className="h-4 w-4" /> Submit Your Design
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedItem.title}
                  {selectedItem.status === "in_emporium" && (
                    <Badge className="bg-amber-600"><Trophy className="h-3 w-3 mr-1" /> Battle Winner</Badge>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden bg-muted aspect-video">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline">{categoryLabel(selectedItem.category)}</Badge>
                  {selectedItem.stamp_rating && (
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-bold">{selectedItem.stamp_rating}</span>
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Download className="h-3 w-3" /> Used by {selectedItem.royalty_uses} businesses
                  </span>
                </div>

                {selectedItem.description && (
                  <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                )}

                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}

                <div className="border-t pt-4 space-y-3">
                  {user ? (
                    <>
                      {selectedItem.price ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-lg">{selectedItem.price} Credits</p>
                            <p className="text-xs text-muted-foreground">Designer earns {(selectedItem.price * 0.833).toFixed(2)} Credits (83.3%)</p>
                          </div>
                          <Button
                            onClick={() => purchaseMutation.mutate(selectedItem)}
                            disabled={purchaseMutation.isPending}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            {purchaseMutation.isPending ? "Processing..." : "Use This Template"}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">This designer is available for commissions</p>
                          <Button variant="outline" className="gap-2">
                            <Users className="h-4 w-4" /> Commission This Designer
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="font-medium">Join LB ($5/year) to purchase</p>
                      <Link to="/auth">
                        <Button className="mt-2 gap-2">
                          <Sparkles className="h-4 w-4" /> Join & Unlock
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <p className="text-[10px] text-muted-foreground text-center mt-6 max-w-lg mx-auto">
        Revenue estimates are illustrative only. Designer royalties come from
        the platform's operational share. Creator keeps 83.3%. This is not a speculative instrument.
      </p>
    </PortalPageLayout>
  );
}
