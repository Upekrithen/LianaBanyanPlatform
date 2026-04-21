import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Search, Calendar, Clock, Map as MapIcon, ArrowLeft, Tag, Store, Package, Gift, Wrench, Car } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function GarageSalesPage() {
  const navigate = useNavigate();
  const [zipCode, setZipCode] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Marketplace listings table not yet created — honest empty state
  const listings: any[] = [];

  const filteredListings = activeTab === "all"
    ? listings
    : listings.filter((l: any) => l.type === activeTab);

  return (
    <PortalPageLayout maxWidth="xl" xrayId="garage-sales">
      <Button
        variant="ghost"
        onClick={() => navigate('/initiatives/the-family-table')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Family Table
      </Button>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-amber-500 rounded-full text-white">
          <MapIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Neighborhood Market & Map</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Sell anything you own—cars, clothes, businesses, or free items. Find local sales and pay with Marks to support your community.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Find listings near you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Enter Zip Code or City"
                  className="pl-10"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </div>
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                <Search className="h-4 w-4 mr-2" />
                Search Area
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <CardHeader>
              <CardTitle className="text-amber-800 dark:text-amber-400 text-base">Post a Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                List your garage sale, business, or items on the local map. Accept Marks to keep value in the community.
              </p>
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Create Listing
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden border-2 border-slate-200 dark:border-slate-800">
            <div className="h-64 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center relative">
              {/* Mock Map Background */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, slate 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <MapIcon className="h-12 w-12 text-slate-400 mb-2 z-10" />
              <p className="text-slate-500 font-medium z-10">Interactive Map View</p>
              <p className="text-sm text-slate-400 z-10">Showing {filteredListings.length} listings in your area</p>

              {/* Mock Pins */}
              <div className="absolute top-1/4 left-1/4 p-2 bg-white rounded-full shadow-lg animate-bounce"><Store className="h-4 w-4 text-blue-500" /></div>
              <div className="absolute top-1/2 right-1/3 p-2 bg-white rounded-full shadow-lg"><MapPin className="h-4 w-4 text-amber-500" /></div>
              <div className="absolute bottom-1/3 left-1/2 p-2 bg-white rounded-full shadow-lg"><Gift className="h-4 w-4 text-purple-500" /></div>
            </div>
          </Card>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
            <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-4 h-auto">
              <TabsTrigger value="all" className="py-2">All</TabsTrigger>
              <TabsTrigger value="garage_sale" className="py-2">Sales</TabsTrigger>
              <TabsTrigger value="business" className="py-2">Local Biz</TabsTrigger>
              <TabsTrigger value="item" className="py-2">Items</TabsTrigger>
              <TabsTrigger value="vehicle" className="py-2">Vehicles</TabsTrigger>
              <TabsTrigger value="free" className="py-2">Free</TabsTrigger>
              <TabsTrigger value="service" className="py-2">Services</TabsTrigger>
            </TabsList>

            <div className="space-y-4 mt-4">
              {filteredListings.length > 0 ? (
                filteredListings.map((listing: any) => (
                  <Card key={listing.id} className="overflow-hidden hover:border-amber-300 transition-colors">
                    <div className="flex flex-col sm:flex-row">
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold">{listing.title}</h3>
                          {listing.acceptsMarks && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                              Accepts Marks
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4 mt-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{listing.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="border-2 border-dashed border-amber-200 dark:border-amber-800">
                  <CardContent className="py-12 text-center">
                    <MapIcon className="h-10 w-10 mx-auto mb-4 text-amber-400/40" />
                    <h3 className="font-semibold text-lg mb-2">Neighborhood Market</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      No listings yet. List garage sales, local businesses, items for sale, free stuff, and services.
                      Pay with Marks to keep value circulating in your community.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      <Badge variant="outline"><Store className="h-3 w-3 mr-1" /> Local Business</Badge>
                      <Badge variant="outline"><Package className="h-3 w-3 mr-1" /> Items</Badge>
                      <Badge variant="outline"><Gift className="h-3 w-3 mr-1" /> Free Stuff</Badge>
                      <Badge variant="outline"><Wrench className="h-3 w-3 mr-1" /> Services</Badge>
                      <Badge variant="outline"><Car className="h-3 w-3 mr-1" /> Vehicles</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </PortalPageLayout>
  );
}
