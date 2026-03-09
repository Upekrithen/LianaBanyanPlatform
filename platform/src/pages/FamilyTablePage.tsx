import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Calendar, Image as ImageIcon, HeartHandshake, ArrowRight, Users, 
  Lock, Star, Clock, Utensils, ShieldAlert, ShoppingCart, Plus, CheckCircle2,
  FileText, Activity, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import '@/styles/landing.css';

export default function FamilyTablePage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page min-h-screen bg-slate-50">
      <div className="landing-title">
        <span className="liana">Liana</span>
        <span className="banyan">Banyan</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <Badge variant="outline" className="mb-4 text-indigo-600 border-indigo-600 bg-indigo-50">Initiative #5</Badge>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Users className="h-10 w-10 text-indigo-600" />
              The Family Table
            </h1>
            <p className="mt-2 text-xl text-slate-600">
              The private, invite-only operational hub for the people you define as family.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border shadow-sm">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-700 font-bold text-sm">D</div>
              <div className="w-10 h-10 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center text-pink-700 font-bold text-sm">M</div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-700 font-bold text-sm">K</div>
            </div>
            <Button variant="outline" size="sm" className="ml-2">
              <Plus className="w-4 h-4 mr-1" /> Invite
            </Button>
          </div>
        </div>

        <Tabs defaultValue="operations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1 bg-slate-200/50">
            <TabsTrigger value="operations" className="py-3 text-base data-[state=active]:bg-white">
              <Shield className="w-4 h-4 mr-2" /> Daily Ops
            </TabsTrigger>
            <TabsTrigger value="calendar" className="py-3 text-base data-[state=active]:bg-white">
              <Calendar className="w-4 h-4 mr-2" /> Master Calendar
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="py-3 text-base data-[state=active]:bg-white">
              <ImageIcon className="w-4 h-4 mr-2" /> Portfolios
            </TabsTrigger>
            <TabsTrigger value="swoop" className="py-3 text-base data-[state=active]:bg-white">
              <HeartHandshake className="w-4 h-4 mr-2" /> Swoop Receiving
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Let's Make Dinner Integration */}
              <Card className="border-t-4 border-t-orange-500 hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Utensils className="h-6 w-6 text-orange-600" />
                    </div>
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700">Let's Make Dinner</Badge>
                  </div>
                  <CardTitle className="text-xl mt-4">Tonight's Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="font-medium text-slate-900">Lemon Herb Chicken</p>
                      <p className="text-sm text-slate-500">Prep: 15m | Cook: 30m</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Assigned to:</span>
                      <span className="font-medium">Dad (Cooking)</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => navigate('/initiatives/lets-make-dinner')}>
                    Open Meal Planner
                  </Button>
                </CardFooter>
              </Card>

              {/* Let's Get Groceries Integration */}
              <Card className="border-t-4 border-t-emerald-500 hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <ShoppingCart className="h-6 w-6 text-emerald-600" />
                    </div>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">Let's Get Groceries</Badge>
                  </div>
                  <CardTitle className="text-xl mt-4">Shared List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-slate-600 line-through">Milk (2 Gallons)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      <span className="text-sm font-medium">Coffee Beans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      <span className="text-sm font-medium">Paper Towels</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">+ 14 more items synced from Meal Plan</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => navigate('/initiatives/lets-get-groceries')}>
                    Send to Local Captain
                  </Button>
                </CardFooter>
              </Card>

              {/* Defense Klaus Integration */}
              <Card className="border-t-4 border-t-purple-500 hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ShieldAlert className="h-6 w-6 text-purple-600" />
                    </div>
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700">Defense Klaus</Badge>
                  </div>
                  <CardTitle className="text-xl mt-4">Safety Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 bg-emerald-50 rounded border border-emerald-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium">Mom's House</span>
                      </div>
                      <span className="text-xs text-emerald-600">Armed</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="text-sm font-medium">Daughter (College)</span>
                      </div>
                      <span className="text-xs text-slate-500">Bracelet Active</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full text-purple-600 border-purple-200 hover:bg-purple-50" onClick={() => navigate('/initiatives/defense-klaus')}>
                    Manage Security
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-indigo-500" />
                  The Master Calendar
                </CardTitle>
                <CardDescription>
                  The unified, impossible-to-miss scheduling engine for the family.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 text-slate-500">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium">Interactive Calendar View</p>
                    <p className="text-sm">Syncs with Google Calendar, Apple, and Outlook.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-pink-500" />
                    Emotional Portfolios
                  </CardTitle>
                  <CardDescription>The Valentine's Model for shared memories.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg border flex justify-between items-center cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium">2025 Family Vacation</p>
                          <p className="text-xs text-slate-500">Synced from Google Photos</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border flex justify-between items-center cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Letters to the Kids</p>
                          <p className="text-xs text-slate-500">Time-locked until 18th birthdays</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2">
                    <Plus className="w-4 h-4" /> Create New Portfolio
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Financial & Medical Snapshots
                  </CardTitle>
                  <CardDescription>Securely shared critical information.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Medical Savings Account (MSA)</span>
                        <span className="text-emerald-600 font-bold">\,250</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">Emergency Contacts Updated</p>
                        <p className="text-xs text-amber-700 mt-1">Dad updated the primary care physician details yesterday.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="swoop">
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-emerald-800">
                  <HeartHandshake className="h-6 w-6 text-emerald-600" />
                  The Swoop Receiving Dashboard
                </CardTitle>
                <CardDescription className="text-emerald-600/80">
                  When life happens, the community rallies. This is where you receive it, privately.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Active Community Support</h3>
                    <div className="p-4 bg-white rounded-xl border shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Meal Train Active</Badge>
                        <span className="text-sm font-medium text-slate-500">Organized via Rally Group</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                          <span>Tonight (6:00 PM)</span>
                          <span className="font-medium">Lasagna (The Smiths)</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                          <span>Tomorrow (5:30 PM)</span>
                          <span className="font-medium">Tacos (The Johnsons)</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-slate-500">
                          <span>Thursday</span>
                          <span>Open Slot</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Silent Financial Support</h3>
                    <div className="p-4 bg-white rounded-xl border shadow-sm flex flex-col justify-center items-center text-center h-[180px]">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Shield className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-slate-600 text-sm">No active financial Swoops.</p>
                      <p className="text-slate-400 text-xs mt-2">Funds sent via Rally Group appear here silently, without the burden of managing the helpers.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
