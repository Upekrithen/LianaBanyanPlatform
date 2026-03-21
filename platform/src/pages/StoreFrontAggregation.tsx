import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, ShoppingBag, Link as LinkIcon, Plus, Info, CheckCircle2, ArrowRight, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function StoreFrontAggregation() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter your store URL to connect.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      toast({
        title: "Store Connected!",
        description: "We've successfully synced your first 20 items (Cold Start C20).",
      });
      setUrl("");
    }, 2000);
  };

  return (
    <PortalPageLayout>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600 rounded-full text-white">
          <Store className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">StoreFront Aggregation</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            The Shirley Temple Policy: We do more together than apart.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Existing Stores (Rent-Free)</CardTitle>
              <CardDescription>
                Don't rebuild from scratch. Link ALL your disparate storefronts in one place, rent-free. Paste your Shopify, Etsy, Fiverr, or custom URLs below. 
                We'll automatically pull in up to 20 of your top items (even if you only have one!) using our "Cold Start C20" protocol.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="https://your-store.myshopify.com" 
                    className="pl-10"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="relative w-48">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Zip or City" 
                    className="pl-10"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isConnecting ? "Syncing..." : "Connect Store"}
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Shopify', 'Etsy', 'Fiverr', 'Guru'].map((platform) => (
                  <div key={platform} className="border rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                    <ShoppingBag className="h-6 w-6 text-slate-400" />
                    <span className="font-medium text-sm">{platform}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="synced">
            <TabsList className="mb-4">
              <TabsTrigger value="synced">Synced Items (C20)</TabsTrigger>
              <TabsTrigger value="b2b">B2B Business Plans</TabsTrigger>
            </TabsList>
            
            <TabsContent value="synced" className="space-y-4">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-48 h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Store className="h-8 w-8 text-slate-300" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg">Artisan Handcrafted Item {item}</h3>
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700">Shopify Sync</Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          Automatically synced from your external storefront. Changes there reflect here.
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-bold text-lg">$45.00</span>
                        <Button variant="outline" size="sm" className="gap-2">
                          Manage Listing <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="b2b">
              <Card>
                <CardContent className="py-8 text-center text-slate-500">
                  <p>Your B2B business plan letters will appear alongside your storefront items here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Info className="h-5 w-5" />
                The Cold Start C20
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-900/80 dark:text-blue-200/80 space-y-4">
              <p>
                We don't expect you to move your entire business on day one. That's a massive risk.
              </p>
              <p>
                Instead, we use the <strong>Cold Start C20</strong> protocol. We sync just 20 of your best items. You keep your existing storefront, but gain access to the Liana Banyan ecosystem and the 12 Cities.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>Zero duplicate data entry</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>Link multiple stores (Etsy + Shopify + Fiverr)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>Keep your existing fulfillment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>Tap into the Cost+20% margin structure</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ready-Made Bounties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-slate-600 dark:text-slate-400">
                Need help setting up your digital presence? Post a bounty to the Salt Mines for common business needs.
              </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-auto py-2" onClick={() => toast.success("Bounty posted to Salt Mines!")}>
                    <div>
                      <div className="font-medium">WYSIWYG Website Setup</div>
                      <div className="text-xs text-slate-500">Google Sites, Squarespace, Wix</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-auto py-2" onClick={() => toast.success("Bounty posted to Salt Mines!")}>
                    <div>
                      <div className="font-medium">AI App Generation</div>
                      <div className="text-xs text-slate-500">AI-assisted app builders, custom tools</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-auto py-2" onClick={() => toast.success("Bounty posted to Salt Mines!")}>
                    <div>
                      <div className="font-medium">StoreFront Syncing</div>
                      <div className="text-xs text-slate-500">Help linking Etsy/Shopify to .biz</div>
                    </div>
                  </Button>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">QR Cue Card Bounties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-slate-600 dark:text-slate-400">
                Want to drive physical traffic to your aggregated storefront?
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                <p className="font-medium mb-1">1. Get Your Free Digital Card</p>
                <p className="text-xs text-slate-500">Generate a free QR Brand Deck Card for social media.</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                <p className="font-medium mb-1">2. Volume Dump Print Bounty</p>
                <p className="text-xs text-slate-500">Turn your digital card into a physical print run fulfilled by the Salt Mines at Cost+20%.</p>
              </div>
              <Button className="w-full mt-2" variant="outline">
                Generate Digital Card
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalPageLayout>
  );
}
