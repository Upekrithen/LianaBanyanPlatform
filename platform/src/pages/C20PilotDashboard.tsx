/**
 * C+20 PILOT DASHBOARD
 * ====================
 * Innovation #1348: Per-Product C+20 Limits (Toe-Dipping)
 * Innovation #1353: C+20 Sales Promotion Mechanism
 * 
 * The dashboard where business owners can:
 * 1. Add products to C+20 with unit limits
 * 2. See their reciprocity balance growing
 * 3. Track units sold vs. limit per product
 * 4. Get toe-dipping recommendations
 */

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import {
  addProductToC20,
  updateProductC20Config,
  getAnchorC20Products,
  getReciprocitySummary,
  getReciprocityLedger,
  calculateMarginSacrificed,
  C20ProductConfig,
  C20ReciprocitySummary,
  C20ReciprocityLedgerEntry,
  C20_RECIPROCITY_CONSTANTS,
} from '@/lib/c20ReciprocityService';

import { CostPlusBadge } from '@/components/CostPlusBadge';
import { CostPlusJourneyWidget } from '@/components/CostPlusJourneyWidget';

import {
  Plus,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Zap,
  Target,
  Gift,
  History,
  Lightbulb,
  ShoppingBag,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Anchor {
  id: string;
  name: string;
  pricing_policy?: string;
  verified_cost_plus?: boolean;
  cost_plus_compliance_ratio?: number;
  c20_reciprocity_balance?: number;
  c20_total_margin_contributed?: number;
  c20_total_balance_spent?: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function C20PilotDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [products, setProducts] = useState<C20ProductConfig[]>([]);
  const [summary, setSummary] = useState<C20ReciprocitySummary | null>(null);
  const [ledger, setLedger] = useState<C20ReciprocityLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    productSku: '',
    productName: '',
    referencePrice: '',
    costBasis: '',
    maxUnits: '50',
    autoRevert: true,
  });

  // Load data
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get user's anchor (business)
      const { data: anchorData } = await supabase
        .from('anchors')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (anchorData) {
        setAnchor(anchorData as Anchor);
        
        // Load C+20 products
        const productsData = await getAnchorC20Products(anchorData.id);
        setProducts(productsData);
        
        // Load reciprocity summary
        const summaryData = await getReciprocitySummary(anchorData.id);
        setSummary(summaryData);
        
        // Load ledger
        const ledgerData = await getReciprocityLedger(anchorData.id, 20);
        setLedger(ledgerData);
      }
    } catch (error) {
      console.error('Error loading C+20 data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate preview for new product
  const newProductPreview = useMemo(() => {
    const refPrice = parseFloat(newProduct.referencePrice) || 0;
    const cost = parseFloat(newProduct.costBasis) || 0;
    const units = parseInt(newProduct.maxUnits) || 0;
    
    if (refPrice > 0 && cost > 0) {
      const calc = calculateMarginSacrificed(refPrice, cost);
      return {
        ...calc,
        totalMarginSacrificed: calc.marginSacrificed * units,
        totalReciprocityEarned: calc.marginSacrificed * units,
      };
    }
    return null;
  }, [newProduct]);

  // Handle add product
  const handleAddProduct = async () => {
    if (!anchor) return;
    
    const refPrice = parseFloat(newProduct.referencePrice);
    const cost = parseFloat(newProduct.costBasis);
    const maxUnits = newProduct.maxUnits ? parseInt(newProduct.maxUnits) : undefined;
    
    if (!newProduct.productSku || !newProduct.productName || !refPrice || !cost) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    if (cost >= refPrice) {
      toast({
        title: 'Invalid Pricing',
        description: 'Cost basis must be less than reference price.',
        variant: 'destructive',
      });
      return;
    }

    const result = await addProductToC20(anchor.id, {
      productSku: newProduct.productSku,
      productName: newProduct.productName,
      referencePrice: refPrice,
      costBasis: cost,
      maxUnits,
      autoRevert: newProduct.autoRevert,
    });

    if (result) {
      toast({
        title: 'Product Added to C+20!',
        description: `${newProduct.productName} is now available at Cost + 20% pricing.`,
      });
      setAddDialogOpen(false);
      setNewProduct({
        productSku: '',
        productName: '',
        referencePrice: '',
        costBasis: '',
        maxUnits: '50',
        autoRevert: true,
      });
      loadData();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle toggle product enabled
  const handleToggleProduct = async (configId: string, enabled: boolean) => {
    const success = await updateProductC20Config(configId, { enabled });
    if (success) {
      loadData();
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading your C+20 Pilot Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!anchor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-2xl mx-auto">
          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <AlertTitle className="text-amber-300">No Business Found</AlertTitle>
            <AlertDescription className="text-amber-200/80">
              You need to register a business (Anchor) before you can use the C+20 Pilot Program.
              <Button variant="link" className="text-amber-400 p-0 h-auto ml-2">
                Register Your Business →
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">C+20 Pilot Dashboard</h1>
                <p className="text-sm text-slate-400">Toe-dipping into transparent pricing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CostPlusBadge anchor={anchor as any} size="md" />
              <Button onClick={loadData} variant="outline" size="sm" className="border-slate-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Reciprocity Balance */}
          <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-300/80 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Reciprocity Balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">
                {formatCurrency(summary?.reciprocity_balance || anchor.c20_reciprocity_balance || 0)}
              </div>
              <p className="text-xs text-emerald-300/60 mt-1">Available to spend on C+20 products</p>
            </CardContent>
          </Card>

          {/* Total Margin Contributed */}
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-300/80 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Margin Contributed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                {formatCurrency(summary?.total_margin_contributed || anchor.c20_total_margin_contributed || 0)}
              </div>
              <p className="text-xs text-blue-300/60 mt-1">Lifetime margin sacrificed for community</p>
            </CardContent>
          </Card>

          {/* Products at C+20 */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-300/80 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Products at C+20
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {summary?.products_at_c20 || products.filter(p => p.c20_enabled).length}
              </div>
              <p className="text-xs text-purple-300/60 mt-1">Active C+20 products</p>
            </CardContent>
          </Card>

          {/* Units Sold */}
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-300/80 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                C+20 Units Sold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">
                {summary?.total_c20_units_sold || products.reduce((sum, p) => sum + p.c20_units_sold, 0)}
              </div>
              <p className="text-xs text-amber-300/60 mt-1">Total units sold at C+20 pricing</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Product CTA */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-emerald-400" />
                      Your C+20 Products
                    </CardTitle>
                    <CardDescription>
                      Products you've committed to Cost + 20% pricing
                    </CardDescription>
                  </div>
                  <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-emerald-600 hover:bg-emerald-500">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-emerald-400" />
                          Add Product to C+20
                        </DialogTitle>
                        <DialogDescription>
                          Set up a product for Cost + 20% pricing with optional unit limits.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sku" className="text-slate-300">Product SKU *</Label>
                            <Input
                              id="sku"
                              placeholder="e.g., WIDGET-001"
                              value={newProduct.productSku}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, productSku: e.target.value }))}
                              className="bg-slate-800 border-slate-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">Product Name *</Label>
                            <Input
                              id="name"
                              placeholder="e.g., Premium Widget"
                              value={newProduct.productName}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, productName: e.target.value }))}
                              className="bg-slate-800 border-slate-600"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="refPrice" className="text-slate-300">Normal Price *</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <Input
                                id="refPrice"
                                type="number"
                                placeholder="100.00"
                                value={newProduct.referencePrice}
                                onChange={(e) => setNewProduct(prev => ({ ...prev, referencePrice: e.target.value }))}
                                className="bg-slate-800 border-slate-600 pl-9"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cost" className="text-slate-300">Your Cost *</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <Input
                                id="cost"
                                type="number"
                                placeholder="40.00"
                                value={newProduct.costBasis}
                                onChange={(e) => setNewProduct(prev => ({ ...prev, costBasis: e.target.value }))}
                                className="bg-slate-800 border-slate-600 pl-9"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-slate-700" />

                        <div className="space-y-2">
                          <Label htmlFor="maxUnits" className="text-slate-300 flex items-center gap-2">
                            <Target className="w-4 h-4 text-amber-400" />
                            Toe-Dipping Limit (optional)
                          </Label>
                          <Input
                            id="maxUnits"
                            type="number"
                            placeholder="50"
                            value={newProduct.maxUnits}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, maxUnits: e.target.value }))}
                            className="bg-slate-800 border-slate-600"
                          />
                          <p className="text-xs text-slate-500">
                            Leave empty for unlimited. We recommend starting with 25-50 units.
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-slate-300">Auto-Revert When Limit Hit</Label>
                            <p className="text-xs text-slate-500">Automatically return to normal pricing</p>
                          </div>
                          <Switch
                            checked={newProduct.autoRevert}
                            onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, autoRevert: checked }))}
                          />
                        </div>

                        {/* Preview */}
                        {newProductPreview && (
                          <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-amber-400" />
                              Preview
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">C+20 Price</p>
                                <p className="text-emerald-400 font-medium">{formatCurrency(newProductPreview.c20Price)}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Margin Sacrificed/Unit</p>
                                <p className="text-blue-400 font-medium">{formatCurrency(newProductPreview.marginSacrificed)}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Total Margin at Risk</p>
                                <p className="text-amber-400 font-medium">{formatCurrency(newProductPreview.totalMarginSacrificed)}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Reciprocity Earned</p>
                                <p className="text-emerald-400 font-medium">{formatCurrency(newProductPreview.totalReciprocityEarned)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="border-slate-600">
                          Cancel
                        </Button>
                        <Button onClick={handleAddProduct} className="bg-emerald-600 hover:bg-emerald-500">
                          <Plus className="w-4 h-4 mr-2" />
                          Add to C+20
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">No Products Yet</h3>
                    <p className="text-slate-500 mb-4 max-w-md mx-auto">
                      Start your C+20 journey by adding a few products. We recommend starting with 3-10 products 
                      at 25-50 units each to test the waters.
                    </p>
                    <Button onClick={() => setAddDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-500">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onToggle={handleToggleProduct}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sales Promotion Tip */}
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-amber-300 flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Sales Tip: Use C+20 as a Promotion!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  Turn your C+20 commitment into a marketing advantage:
                </p>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-amber-500/20">
                  <p className="text-xl font-bold text-amber-400 text-center">
                    "SALE! First 200 at Cost + 20% pricing!"
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span className="text-slate-400">Creates urgency with limited quantity</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span className="text-slate-400">Demonstrates pricing transparency</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span className="text-slate-400">Builds customer trust</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span className="text-slate-400">Earns you reciprocity balance</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ledger.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    No transactions yet. Add products and make sales to see activity here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {ledger.map((entry) => (
                      <LedgerEntry key={entry.id} entry={entry} formatCurrency={formatCurrency} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Journey & Info */}
          <div className="space-y-6">
            {/* Journey Widget */}
            <CostPlusJourneyWidget anchor={anchor as any} />

            {/* How It Works */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  How Toe-Dipping Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium">Add Products</p>
                    <p className="text-slate-500 text-sm">Choose 3-10 products with healthy margins</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium">Set Limits</p>
                    <p className="text-slate-500 text-sm">Cap at 25-50 units per product</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium">Earn Balance</p>
                    <p className="text-slate-500 text-sm">Every sale earns reciprocity purchasing power</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 text-sm font-bold">4</span>
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium">Auto-Revert</p>
                    <p className="text-slate-500 text-sm">When limits hit, pricing returns to normal</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* The Math */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Percent className="w-5 h-5 text-blue-400" />
                  The Math
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-slate-400 mb-1">Example: $100 item, $40 cost</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Normal margin:</span>
                      <span className="text-slate-300">$60</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">C+20 price:</span>
                      <span className="text-emerald-400">$48</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">C+20 margin:</span>
                      <span className="text-slate-300">$8</span>
                    </div>
                    <Separator className="bg-slate-700 my-2" />
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-400">Margin sacrificed:</span>
                      <span className="text-blue-400">$52</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-400">Reciprocity earned:</span>
                      <span className="text-emerald-400">$52</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-500 text-xs">
                  10 units = $520 reciprocity balance to spend on other C+20 products
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ProductCard({
  product,
  onToggle,
  formatCurrency,
}: {
  product: C20ProductConfig;
  onToggle: (id: string, enabled: boolean) => void;
  formatCurrency: (n: number) => string;
}) {
  const progress = product.c20_max_units 
    ? (product.c20_units_sold / product.c20_max_units) * 100 
    : 0;
  const isComplete = product.c20_max_units && product.c20_units_sold >= product.c20_max_units;

  return (
    <div className={cn(
      "rounded-lg border p-4 transition-all",
      product.c20_enabled 
        ? "bg-slate-800/50 border-slate-700" 
        : "bg-slate-900/30 border-slate-800 opacity-60"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-white truncate">{product.product_name}</h4>
            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
              {product.product_sku}
            </Badge>
            {isComplete && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                Limit Reached
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
            <span>Normal: {formatCurrency(product.reference_price)}</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-emerald-400">C+20: {formatCurrency(product.c20_price)}</span>
            <span className="text-slate-500">|</span>
            <span className="text-blue-400">+{formatCurrency(product.margin_sacrificed_per_unit)}/unit</span>
          </div>

          {product.c20_max_units && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {product.c20_units_sold} / {product.c20_max_units} units sold
                </span>
                <span className="text-slate-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
        </div>

        <Switch
          checked={product.c20_enabled}
          onCheckedChange={(checked) => onToggle(product.id, checked)}
        />
      </div>
    </div>
  );
}

function LedgerEntry({
  entry,
  formatCurrency,
}: {
  entry: C20ReciprocityLedgerEntry;
  formatCurrency: (n: number) => string;
}) {
  const isPositive = entry.transaction_type === 'MARGIN_CONTRIBUTION' || entry.transaction_type === 'JOULE_CONVERSION';
  
  const typeLabels: Record<string, string> = {
    MARGIN_CONTRIBUTION: 'C+20 Sale',
    BALANCE_SPEND: 'Purchase',
    JOULE_CONVERSION: 'Joule Conversion',
    BALANCE_ADJUSTMENT: 'Adjustment',
  };

  const typeIcons: Record<string, React.ReactNode> = {
    MARGIN_CONTRIBUTION: <ArrowUpRight className="w-4 h-4 text-emerald-400" />,
    BALANCE_SPEND: <ArrowDownRight className="w-4 h-4 text-red-400" />,
    JOULE_CONVERSION: <Zap className="w-4 h-4 text-amber-400" />,
    BALANCE_ADJUSTMENT: <RefreshCw className="w-4 h-4 text-blue-400" />,
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
      <div className="flex items-center gap-3">
        {typeIcons[entry.transaction_type]}
        <div>
          <p className="text-sm text-slate-300">{typeLabels[entry.transaction_type]}</p>
          <p className="text-xs text-slate-500">
            {new Date(entry.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn(
          "font-medium",
          isPositive ? "text-emerald-400" : "text-red-400"
        )}>
          {isPositive ? '+' : '-'}{formatCurrency(Math.abs(entry.amount))}
        </p>
        <p className="text-xs text-slate-500">
          Balance: {formatCurrency(entry.balance_after)}
        </p>
      </div>
    </div>
  );
}
