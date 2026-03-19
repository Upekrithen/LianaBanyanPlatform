import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Sparkles, Wrench, Shirt, Coffee, Car, ShieldCheck, Plus, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import '@/styles/landing.css';
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';

export default function HouseholdConciergePage() {
  const navigate = useNavigate();

  return (
    <LaunchConditionOverlay initiativeSlug="household-concierge" initiativeName="Household Concierge">
    <div className="landing-page min-h-screen bg-slate-50">
      <div className="landing-title">
        <span className="liana">Liana</span>
        <span className="banyan">Banyan</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <Badge variant="outline" className="mb-4 text-emerald-600 border-emerald-600 bg-emerald-50">Initiative #4</Badge>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Home className="h-10 w-10 text-emerald-600" />
              Household Concierge
            </h1>
            <p className="mt-2 text-xl text-slate-600">
              Like having a shared Butler for the neighborhood. Stackable, volume-priced local services.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border shadow-sm">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-slate-500">Your Neighborhood</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> 85004 (Phoenix)
              </span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-8 h-auto p-1 bg-slate-200/50">
            <TabsTrigger value="dashboard" className="py-3 text-base data-[state=active]:bg-white">
              <Sparkles className="w-4 h-4 mr-2" /> My Stack
            </TabsTrigger>
            <TabsTrigger value="services" className="py-3 text-base data-[state=active]:bg-white">
              <Plus className="w-4 h-4 mr-2" /> Add Services
            </TabsTrigger>
            <TabsTrigger value="provider" className="py-3 text-base data-[state=active]:bg-white">
              <Wrench className="w-4 h-4 mr-2" /> Become a Provider
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Active Subscriptions */}
              <div className="md:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Active Services</h2>
                
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Shirt className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Weekly Laundry (Wash & Fold)</h3>
                          <p className="text-sm text-slate-500">Provider: Sarah's Suds (Node #442)</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-sm font-medium">Next Pickup</p>
                        <p className="text-sm text-slate-600">Tuesday, 8:00 AM (Front Porch)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Rate</p>
                        <p className="text-sm text-slate-600">\ / bag (Volume Discount)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-100 rounded-lg">
                          <Wrench className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Monthly Preventative Maintenance</h3>
                          <p className="text-sm text-slate-500">Provider: Mike The Fixer (Node #891)</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-sm font-medium">Next Visit</p>
                        <p className="text-sm text-slate-600">Friday, 10:00 AM (HVAC Filters)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Rate</p>
                        <p className="text-sm text-slate-600">\ / month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stack Summary */}
              <div className="space-y-6">
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-emerald-900">Stack Savings</CardTitle>
                    <CardDescription className="text-emerald-700">Because your providers do the whole block at once.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-800">Standard Market Rate:</span>
                      <span className="line-through text-emerald-600/60">\/mo</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-emerald-900">Your Stack Rate:</span>
                      <span className="text-emerald-700">\/mo</span>
                    </div>
                    <Progress value={52} className="h-2 bg-emerald-200" indicatorClassName="bg-emerald-500" />
                    <p className="text-xs text-emerald-600 text-center">You are saving 52% via neighborhood volume.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-blue-500" />
                      Santa Ever After
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    All concierge providers are background-checked and operate under the <strong>Santa Ever After Protocol</strong>. Funds are held in escrow and only released when you verify the service was completed via the "Handshake" code.
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Available in 85004</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:border-emerald-500 transition-colors cursor-pointer group">
                <CardHeader>
                  <Car className="h-8 w-8 text-slate-700 mb-2 group-hover:text-emerald-600 transition-colors" />
                  <CardTitle>Auto Concierge</CardTitle>
                  <CardDescription>Oil changes & detailing in your driveway.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  <div className="flex justify-between items-center mb-2">
                    <span>Neighborhood Rate:</span>
                    <span className="font-bold text-emerald-600">\/mo</span>
                  </div>
                  <Progress value={80} className="h-1.5 mb-1" />
                  <p className="text-xs text-slate-400">4 more neighbors needed for next discount tier.</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Add to Stack</Button>
                </CardFooter>
              </Card>

              <Card className="hover:border-emerald-500 transition-colors cursor-pointer group">
                <CardHeader>
                  <Coffee className="h-8 w-8 text-amber-700 mb-2 group-hover:text-emerald-600 transition-colors" />
                  <CardTitle>Local Coffee Roaster</CardTitle>
                  <CardDescription>Fresh beans dropped on your porch weekly.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  <div className="flex justify-between items-center mb-2">
                    <span>Neighborhood Rate:</span>
                    <span className="font-bold text-emerald-600">\/bag</span>
                  </div>
                  <Progress value={100} className="h-1.5 mb-1" indicatorClassName="bg-emerald-500" />
                  <p className="text-xs text-emerald-600">Maximum volume discount reached!</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Add to Stack</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="provider">
            <Card className="bg-slate-900 text-white border-none">
              <CardContent className="p-12 text-center">
                <Wrench className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">Own Your Neighborhood Route</h2>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
                  Stop driving across town for single jobs. Claim a neighborhood, build a dense route, and keep 83.3% of every transaction. The platform handles the billing, scheduling, and routing.
                </p>
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white border-none" onClick={() => navigate('/service-node/register')}>
                  Register as a Service Node <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </LaunchConditionOverlay>
  );
}
