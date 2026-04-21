/**
 * GROCERY BOX PAGE
 * =================
 * Full-page experience for configuring a Grocery Box order.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Sparkles } from "lucide-react";
import { GroceryBoxConfigurator } from "@/components/GroceryBoxConfigurator";
import { useToast } from "@/hooks/use-toast";

export default function GroceryBoxPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = (config: any) => {
    setIsComplete(true);
    toast({
      title: "Box Added to Cart!",
      description: `${config.size.name} box with ${config.chain.name} chain`,
    });

    setTimeout(() => {
      navigate('/initiatives/lets-get-groceries');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/?view=initiatives')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Initiatives</span>
          </button>

          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-400" />
            <span className="font-bold text-white">Grocery Box</span>
          </div>

          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {!isComplete ? (
          <>
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 mb-4">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-300 text-sm">Zero Waste Meal Planning</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Build Your Grocery Box
              </h1>
              <p className="text-white/60 max-w-xl mx-auto">
                Pre-cut ingredients, refrigerator-ready, with meal chains that use every ingredient.
                Cost+20% pricing — no hidden markups.
              </p>
            </motion.div>

            {/* Configurator */}
            <GroceryBoxConfigurator onComplete={handleComplete} />
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Box Added!</h2>
            <p className="text-white/60">Redirecting to Let's Get Groceries...</p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-white/40 text-sm border-t border-white/10">
        <p>© 2026 Liana Banyan Corporation</p>
        <p className="mt-1">Part of the Meal Ecosystem</p>
      </footer>
    </div>
  );
}
