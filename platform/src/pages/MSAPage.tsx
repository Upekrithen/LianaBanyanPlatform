import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PiggyBank, HeartPulse, Users, ShieldCheck, ArrowRight,
  Plus, Activity, Wallet, Receipt, TrendingUp, Landmark
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function MSAPage() {
  const navigate = useNavigate();
  const [isWildFireTour, setIsWildFireTour] = useState(false);

  return (
    <LaunchConditionOverlay initiativeSlug="msa" initiativeName="MSA (Medical Savings Accounts)">
    <PortalPageLayout maxWidth="xl" xrayId="msa-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <Badge variant="outline" className="mb-4 text-emerald-600 border-emerald-600 bg-emerald-50">Initiative #7</Badge>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <Landmark className="h-10 w-10 text-emerald-600" />
              Medical Savings Accounts (MSA)
            </h1>
            <p className="mt-2 text-xl text-muted-foreground max-w-2xl">
              Cooperative financial infrastructure for your health. Pre-fund your care, share with family, and bypass the insurance labyrinth.
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">WildFire Tour Mode:</span>
              <button
                onClick={() => setIsWildFireTour(!isWildFireTour)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isWildFireTour ? 'bg-orange-500' : 'bg-muted'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isWildFireTour ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex gap-2">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Add Funds
              </Button>
              <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                <Receipt className="w-4 h-4 mr-2" /> Pay Provider
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1 bg-muted/50">
            <TabsTrigger value="dashboard" className="py-3 text-base data-[state=active]:bg-background">
              <Wallet className="w-4 h-4 mr-2" /> My MSA
            </TabsTrigger>
            <TabsTrigger value="family" className="py-3 text-base data-[state=active]:bg-background">
              <Users className="w-4 h-4 mr-2" /> Family Pool
            </TabsTrigger>
            <TabsTrigger value="accords" className="py-3 text-base data-[state=active]:bg-background">
              <HeartPulse className="w-4 h-4 mr-2" /> Health Accords
            </TabsTrigger>
            <TabsTrigger value="community" className="py-3 text-base data-[state=active]:bg-background">
              <ShieldCheck className="w-4 h-4 mr-2" /> Community Fund
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Balance Card */}
              <Card className="md:col-span-2 border-t-4 border-t-emerald-500 bg-white shadow-md">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Available Balance</p>
                      <h2 className="text-5xl font-bold text-foreground">
                        {isWildFireTour ? '$4,250.00' : '$0.00'}
                      </h2>
                    </div>
                    <Badge className={isWildFireTour ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-slate-100 text-muted-foreground hover:bg-slate-100"}>
                      {isWildFireTour ? 'Active' : 'Pending Deposit'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Monthly Auto-Deposit</p>
                      <p className="text-lg font-semibold">{isWildFireTour ? '$250.00' : '$0.00'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">YTD Savings vs Insurance</p>
                      <p className={`text-lg font-semibold ${isWildFireTour ? 'text-emerald-600' : 'text-muted-foreground/70'}`}>
                        {isWildFireTour ? '+$1,140.00' : '$0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isWildFireTour ? (
                    <>
                      <div className="flex justify-between items-center border-b pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-rose-100 rounded-full">
                            <HeartPulse className="w-4 h-4 text-rose-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Generic Albuterol</p>
                            <p className="text-xs text-muted-foreground">Health Accords</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-foreground">-$14.20</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-full">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Auto-Deposit</p>
                            <p className="text-xs text-muted-foreground">Monthly</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">+$250.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Dr. Smith (Direct Pay)</p>
                            <p className="text-xs text-muted-foreground">Pediatric Visit</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-foreground">-$85.00</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No recent activity.</p>
                      <p className="text-xs mt-1">Fund your MSA to begin.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full text-sm text-muted-foreground" disabled={!isWildFireTour}>
                    View All Transactions
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="family" className="space-y-6">
            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-indigo-500" />
                  The Family Pool
                </CardTitle>
                <CardDescription>
                  Seamlessly share your MSA funds with members of your Family Table.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Authorized Members</h3>
                    {isWildFireTour ? (
                      <>
                        <div className="p-3 bg-muted/50 rounded-lg border flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">D</div>
                            <div>
                              <p className="font-medium">Dad (Primary)</p>
                              <p className="text-xs text-muted-foreground">Full Access</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-white">Admin</Badge>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg border flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold">M</div>
                            <div>
                              <p className="font-medium">Mom</p>
                              <p className="text-xs text-muted-foreground">Full Access</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-white">Admin</Badge>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg border flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">K</div>
                            <div>
                              <p className="font-medium">Daughter (College)</p>
                              <p className="text-xs text-muted-foreground">Limited Access</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-white">Up to $200/mo</Badge>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 bg-muted/50 rounded-lg border text-center text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No family members added.</p>
                        <Button variant="link" className="text-indigo-600 mt-2 h-auto p-0">Invite Members</Button>
                      </div>
                    )}
                  </div>

                  <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex flex-col justify-center">
                    <PiggyBank className="w-12 h-12 text-indigo-400 mb-4" />
                    <h3 className="font-bold text-indigo-900 mb-2">Why Pool Funds?</h3>
                    <p className="text-sm text-indigo-800 mb-4">
                      Instead of individual deductibles that reset every year, the Family Pool treats your household as a single economic unit. Funds never expire, and anyone authorized can draw from them instantly at the pharmacy counter.
                    </p>
                    <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100" onClick={() => navigate('/initiatives/family-table')}>
                      Manage Family Table
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accords" className="space-y-6">
            <Card className="border-l-4 border-l-rose-500">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <HeartPulse className="h-6 w-6 text-rose-500" />
                  Health Accords Integration
                </CardTitle>
                <CardDescription>
                  Your MSA is directly wired to the Tatiana Schlossburg Health Accords for seamless payment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ArrowRight className="w-12 h-12 text-rose-300 mx-auto mb-4 rotate-90 md:rotate-0" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Zero-Friction Prescriptions</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    When you purchase medications produced at Cost+20% through the Health Accords, the system automatically routes the payment through your MSA. No claims, no reimbursements, no PBMs.
                  </p>
                  <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => navigate('/initiatives/tatiana-schlossburg-health-accords')}>
                    Go to Health Accords
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <Card className="bg-slate-900 text-white border-none">
              <CardContent className="p-12 text-center">
                <ShieldCheck className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">The Boaz Principle in Action</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  You can opt-in to automatically round up your MSA transactions to the nearest dollar. These micro-donations go directly into the Community Fund (managed by Rally Group) to help neighbors facing sudden medical crises.
                </p>
                <div className="flex justify-center gap-4">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">
                    Enable Round-Ups
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-slate-700 hover:bg-slate-800" onClick={() => navigate('/initiatives/rally-group')}>
                    View Community Fund
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
