import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { ArrowLeft, Plus, Trash2, RefreshCw, TrendingUp } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  product_sku: string;
  project_id: string;
  projects: {
    name: string;
  };
}

interface PricingData {
  id: string;
  production_run_id: string;
  units_in_run: number;
  volume_discount_percentage: number;
  calculated_unit_price: number;
  run_start_date: string | null;
  run_end_date: string | null;
  last_sync_at: string;
}

export default function IndustryPricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [pricingData, setPricingData] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [runId, setRunId] = useState('');
  const [units, setUnits] = useState('');
  const [discount, setDiscount] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadUserProducts();
  }, [user]);

  useEffect(() => {
    if (selectedProduct) {
      loadPricingData();
    }
  }, [selectedProduct]);

  const loadUserProducts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('products')
      .select('id, name, product_sku, project_id, projects!inner(name, owner_id)')
      .eq('projects.owner_id', user.id);

    if (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
      return;
    }

    setProducts(data || []);
    if (data && data.length > 0) {
      setSelectedProduct(data[0].id);
    }
  };

  const loadPricingData = async () => {
    if (!selectedProduct) return;

    const { data, error } = await supabase
      .from('industry_pricing_data')
      .select('*')
      .eq('product_id', selectedProduct)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading pricing data:', error);
      toast.error('Failed to load pricing data');
      return;
    }

    setPricingData(data || []);
  };

  const handleAddPricingData = async () => {
    if (!runId || !units || !discount || !unitPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        openOnboard({ reason: "access industry pricing", actionLabel: "Join", membershipIncluded: true });
        return;
      }

      const response = await supabase.functions.invoke('sync-industry-pricing', {
        body: {
          pricing_data: [{
            product_id: selectedProduct,
            production_run_id: runId,
            units_in_run: parseInt(units),
            volume_discount_percentage: parseFloat(discount),
            calculated_unit_price: parseFloat(unitPrice),
            run_start_date: startDate || undefined,
            run_end_date: endDate || undefined,
          }]
        },
      });

      if (response.error) {
        throw response.error;
      }

      toast.success('Pricing data synced successfully');
      
      // Clear form
      setRunId('');
      setUnits('');
      setDiscount('');
      setUnitPrice('');
      setStartDate('');
      setEndDate('');
      
      // Reload data
      loadPricingData();
    } catch (error) {
      console.error('Error syncing pricing data:', error);
      toast.error('Failed to sync pricing data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pricingId: string) => {
    const { error } = await supabase
      .from('industry_pricing_data')
      .delete()
      .eq('id', pricingId);

    if (error) {
      console.error('Error deleting pricing data:', error);
      toast.error('Failed to delete pricing data');
    } else {
      toast.success('Pricing data deleted');
      loadPricingData();
    }
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <h1 className="text-3xl font-bold">Industry Pricing Manager</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Volume Pricing & Production Runs
            </CardTitle>
            <CardDescription>
              Manage production run quantities and volume discount pricing from Industry.LianaBanyan.com
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label>Select Product</Label>
            <select
              className="w-full mt-2 p-2 border rounded-md"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.projects.name} ({product.product_sku || 'No SKU'})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {selectedProductData && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Add Pricing Data</CardTitle>
                <CardDescription>
                  Add new production run pricing for {selectedProductData.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="runId">Production Run ID *</Label>
                    <Input
                      id="runId"
                      placeholder="RUN-2025-001"
                      value={runId}
                      onChange={(e) => setRunId(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="units">Units in Run *</Label>
                    <Input
                      id="units"
                      type="number"
                      placeholder="1000"
                      value={units}
                      onChange={(e) => setUnits(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Volume Discount % *</Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      placeholder="15.50"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Calculated Unit Price *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      placeholder="25.99"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Run Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Run End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleAddPricingData} disabled={loading}>
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Sync Pricing Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Pricing Data</CardTitle>
                <CardDescription>
                  Production runs and pricing for {selectedProductData.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pricingData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No pricing data available for this product
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pricingData.map((pricing) => (
                      <div
                        key={pricing.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{pricing.production_run_id}</div>
                          <div className="text-sm text-muted-foreground">
                            {pricing.units_in_run} units @ ${pricing.calculated_unit_price} 
                            ({pricing.volume_discount_percentage}% discount)
                          </div>
                          {pricing.run_start_date && pricing.run_end_date && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(pricing.run_start_date).toLocaleDateString()} - {new Date(pricing.run_end_date).toLocaleDateString()}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Last synced: {new Date(pricing.last_sync_at).toLocaleString()}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(pricing.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}