/**
 * CHEF MARKETPLACE PAGE
 * ======================
 * Browse and hire member chefs for meal preparation.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChefHat, Sparkles, DollarSign, Shield, Flame } from "lucide-react";
import { ChefMarketplace } from "@/components/ChefMarketplace";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useToast } from "@/hooks/use-toast";

export default function ChefMarketplacePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBookChef = (chef: any) => {
    toast({
      title: "Booking Request Sent!",
      description: `${chef.name} will respond within 24 hours`,
    });
  };

  return (
    <PortalPageLayout variant="stage" maxWidth="full" xrayId="chef-marketplace">
      <header className="sticky top-0 z-50 -mx-4 sm:-mx-6 -mt-8 sm:-mt-12 px-4 sm:px-6 pt-8 sm:pt-12 mb-0 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between py-3">
          <button
            onClick={() => navigate('/?view=initiatives')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Initiatives</span>
          </button>

          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-rose-400" />
            <span className="font-bold text-foreground">Chef Marketplace</span>
          </div>

          <button
            onClick={() => navigate('/initiatives/lets-make-dinner/become-chef')}
            className="px-4 py-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-medium hover:bg-rose-500/30 transition-all"
          >
            Become a Chef
          </button>
        </div>
      </header>

      <main className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/20 border border-rose-500/40 mb-4">
            <Sparkles className="h-4 w-4 text-rose-400" />
            <span className="text-rose-300 text-sm">Part of Let's Make Dinner</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Hire a Member Chef
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Verified chefs in your neighborhood ready to prepare delicious meals. They keep 83.3% — always.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span>All Chefs Verified</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <span>Chefs Keep 83.3%</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="h-5 w-5 text-orange-400" />
              <span>Kindling Partners Give Back</span>
            </div>
          </div>
        </motion.div>

        <ChefMarketplace onBookChef={handleBookChef} />
      </main>

      <footer className="py-8 text-center text-muted-foreground text-sm border-t border-border">
        <p>© 2026 Liana Banyan Corporation</p>
        <p className="mt-1">Crown: Maneet Chauhan</p>
      </footer>
    </PortalPageLayout>
  );
}
