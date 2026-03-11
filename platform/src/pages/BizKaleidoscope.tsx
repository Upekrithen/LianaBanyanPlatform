import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Filter, SlidersHorizontal, Flame, Briefcase, QrCode, ExternalLink } from "lucide-react";

// Seed data for the kaleidoscope — example business cards
const SEED_BUSINESS_CARDS = [
  { id: 1, name: "Springfield Bakery", category: "Food & Beverage", tier: "Flame", zip: "12345", color: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800", link: "https://example.com", isExternal: false },
  { id: 2, name: "TechFix Repair", category: "Services", tier: "Ember", zip: "12345", color: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-200 dark:border-blue-800", link: "https://example.com", isExternal: false },
  { id: 3, name: "Green Thumb Landscaping", category: "Services", tier: "Blaze", zip: "12346", color: "bg-green-100 dark:bg-green-900/30", border: "border-green-200 dark:border-green-800", link: "https://example.com", isExternal: false },
  { id: 4, name: "Artisan Crafts Co.", category: "Retail", tier: "Inferno", zip: "12345", color: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-200 dark:border-purple-800", link: "https://etsy.com/shop/example", isExternal: true, platform: "Etsy" },
  { id: 5, name: "Local Legal Help", category: "Professional", tier: "Ember", zip: "12347", color: "bg-slate-100 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700", link: "https://example.com", isExternal: false },
  { id: 6, name: "Main Street Coffee", category: "Food & Beverage", tier: "Flame", zip: "12345", color: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800", link: "https://example.com", isExternal: false },
  { id: 7, name: "Quick Print Shop", category: "B2B", tier: "Blaze", zip: "12346", color: "bg-indigo-100 dark:bg-indigo-900/30", border: "border-indigo-200 dark:border-indigo-800", link: "https://example.myshopify.com", isExternal: true, platform: "Shopify" },
  { id: 8, name: "Wellness Yoga", category: "Health", tier: "Flame", zip: "12345", color: "bg-teal-100 dark:bg-teal-900/30", border: "border-teal-200 dark:border-teal-800", link: "https://example.com", isExternal: false },
];

export default function BizKaleidoscope() {
  const [zipFilter, setZipFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredCards = SEED_BUSINESS_CARDS.filter(card => {
    if (zipFilter && !card.zip.includes(zipFilter)) return false;
    if (categoryFilter !== "all" && card.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-blue-600" />
            The Kaleidoscope
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
            The only form of advertising we allow. A utilitarian, reference-based directory of local businesses, entirely under your control. 
            <a href="/garage-sales" className="text-blue-600 hover:underline ml-2">View on Local Map →</a>
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border">
          <div className="relative w-40">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Zip Code" 
              className="pl-10 bg-white dark:bg-slate-900"
              value={zipFilter}
              onChange={(e) => setZipFilter(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-white dark:bg-slate-900">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
              <SelectItem value="Services">Services</SelectItem>
              <SelectItem value="Retail">Retail</SelectItem>
              <SelectItem value="Professional">Professional</SelectItem>
              <SelectItem value="B2B">B2B</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="bg-white dark:bg-slate-900">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* The Kaleidoscope Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCards.map((card) => (
          <Card key={card.id} className={`overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer ${card.color} ${card.border}`} onClick={() => window.open(card.link, '_blank')}>
            <CardContent className="p-0">
              <div className="aspect-[1.58/1] relative p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="bg-white/50 dark:bg-black/50 backdrop-blur-sm text-xs font-semibold">
                    {card.category}
                  </Badge>
                  <div className="bg-white/80 dark:bg-black/80 p-1.5 rounded backdrop-blur-sm">
                    <QrCode className="h-8 w-8" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1">
                    {card.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {card.zip}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className={`h-3 w-3 ${
                        card.tier === 'Inferno' ? 'text-red-600' : 
                        card.tier === 'Blaze' ? 'text-orange-600' : 
                        card.tier === 'Flame' ? 'text-orange-500' : 'text-orange-400'
                      }`} /> 
                      {card.tier}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            {card.isExternal && (
              <div className="bg-slate-900 text-white text-xs p-3 border-t border-slate-800">
                <div className="flex items-center gap-1.5 mb-1 font-semibold">
                  <ExternalLink className="h-3 w-3" />
                  Checkout on {card.platform}
                </div>
                <p className="text-slate-300 opacity-90 leading-tight">
                  Cost+20% rebate applied via Liana Banyan Joules upon receipt verification.
                </p>
              </div>
            )}
          </Card>
        ))}
        
        {filteredCards.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No businesses found matching your filters.</p>
            <Button variant="link" onClick={() => { setZipFilter(""); setCategoryFilter("all"); }}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">Why no traditional ads?</h3>
        <p className="text-blue-800/80 dark:text-blue-200/80 max-w-3xl mx-auto text-sm">
          We believe advertising should be a utilitarian reference, not a psychological manipulation. The Kaleidoscope allows consumers to find exactly what they need, when they need it, based on objective filters like location and charitable contribution. No algorithms pushing you to buy things you don't want.
        </p>
      </div>
    </div>
  );
}