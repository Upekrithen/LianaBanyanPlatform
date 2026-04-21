import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill, Factory, Heart, ShieldCheck, FileText, Stethoscope,
  ArrowRight, Search, Activity, AlertCircle, Plus, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { SWOOPVoting } from "@/components/SWOOPVoting";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';

export default function LifeLineMedicationsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <LaunchConditionOverlay initiativeSlug="lifeline-medications" initiativeName="LifeLine Medications">
    <PortalPageLayout maxWidth="xl" xrayId="lifeline-medications-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <Badge variant="outline" className="mb-4 text-rose-600 border-rose-600 bg-rose-50">Initiative #6</Badge>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <Pill className="h-10 w-10 text-rose-600" />
              Tatiana Schlossburg Health Accords
            </h1>
            <p className="mt-2 text-xl text-muted-foreground max-w-2xl">
              Affordable prescriptions, navigating medical systems, and ethical manufacturing at Cost+20%.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white">
              <Stethoscope className="w-4 h-4 mr-2" /> Request RNA Help
            </Button>
            <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
              <FileText className="w-4 h-4 mr-2" /> Upload Prescription
            </Button>
          </div>
        </div>

        {/* SWOOP Voting Section */}
        <div className="mb-12">
          <SWOOPVoting
            initiativeSlug="tatiana-schlossburg-health-accords"
            initiativeName="Tatiana Schlossburg Health Accords"
            description="Vote to launch the physical manufacturing arm of this initiative. 500 votes needed to activate."
            threshold={500}
          />
        </div>

        <Tabs defaultValue="pharmacy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1 bg-muted/50">
            <TabsTrigger value="pharmacy" className="py-3 text-base data-[state=active]:bg-background">
              <Pill className="w-4 h-4 mr-2" /> Cost+20% Pharmacy
            </TabsTrigger>
            <TabsTrigger value="navigator" className="py-3 text-base data-[state=active]:bg-background">
              <Stethoscope className="w-4 h-4 mr-2" /> Medical Navigators
            </TabsTrigger>
            <TabsTrigger value="manufacturing" className="py-3 text-base data-[state=active]:bg-background">
              <Factory className="w-4 h-4 mr-2" /> Manufacturing
            </TabsTrigger>
            <TabsTrigger value="msa" className="py-3 text-base data-[state=active]:bg-background">
              <Activity className="w-4 h-4 mr-2" /> MSA Integration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pharmacy" className="space-y-6">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for medications (e.g., Insulin, Albuterol, Lisinopril)..."
                className="pl-12 h-14 text-lg bg-white border-border shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:border-rose-500 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">In Stock</Badge>
                  </div>
                  <CardTitle>Insulin Glargine</CardTitle>
                  <CardDescription>5x 3mL pens (100 units/mL)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-muted-foreground line-through">
                      <span>Standard Market Rate:</span>
                      <span>\.00</span>
                    </div>
                    <div className="flex justify-between font-bold text-rose-700 text-lg border-t pt-2">
                      <span>Cost+20% Rate:</span>
                      <span>\.50</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Transfer Prescription</Button>
                </CardFooter>
              </Card>

              <Card className="hover:border-rose-500 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Manufacturing Queue</Badge>
                  </div>
                  <CardTitle>Albuterol Sulfate</CardTitle>
                  <CardDescription>HFA Inhalation Aerosol</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-muted-foreground line-through">
                      <span>Standard Market Rate:</span>
                      <span>\.00</span>
                    </div>
                    <div className="flex justify-between font-bold text-rose-700 text-lg border-t pt-2">
                      <span>Target C+20% Rate:</span>
                      <span>\.20</span>
                    </div>
                    <Progress value={85} className="h-1.5 mt-2" />
                    <p className="text-xs text-muted-foreground text-center">85% of funding reached for production run</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Pledge to Fund</Button>
                </CardFooter>
              </Card>

              <Card className="bg-slate-900 text-white border-none">
                <CardContent className="p-8 text-center flex flex-col justify-center h-full">
                  <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">The Mark Cuban Model</h3>
                  <p className="text-sm text-slate-300 mb-4">
                    We bypass pharmacy benefit managers (PBMs) entirely. We buy directly from manufacturers, or we manufacture it ourselves.
                  </p>
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white border-none w-full">
                    Read the Philosophy
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="navigator" className="space-y-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Stethoscope className="h-6 w-6 text-blue-500" />
                  Registered Nurse Advocates (RNA)
                </CardTitle>
                <CardDescription>
                  The medical system is a labyrinth designed to exhaust you. Let our advocates guide you.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">What an RNA does for you:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                      <span><strong>Bill Auditing:</strong> Reviewing hospital bills for upcoding and errors (average savings: 35%).</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                      <span><strong>Prior Authorizations:</strong> Fighting insurance denials on your behalf.</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                      <span><strong>Care Coordination:</strong> Ensuring your specialists are actually talking to each other.</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-muted/50 p-6 rounded-xl border border-border flex flex-col justify-center items-center text-center">
                  <AlertCircle className="w-10 h-10 text-amber-500 mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Facing a Medical Crisis?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Do not fight the system alone while fighting for your health. Connect with an RNA immediately.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                    Request an Advocate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manufacturing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Factory className="h-6 w-6 text-foreground" />
                  The Manufacturing Pipeline
                </CardTitle>
                <CardDescription>
                  We don't just negotiate prices. We build the infrastructure to produce it ourselves.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">Project: Open Source EpiPen</h3>
                      <Badge variant="outline" className="text-amber-600 border-amber-600">Phase 2: Prototyping</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Developing a reusable, reliable auto-injector mechanism that bypasses existing patent thickets, utilizing the Brass Tacks manufacturing network.
                    </p>
                    <Progress value={45} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Funding: \,000 / \,000</span>
                      <span>Estimated Completion: Q4 2026</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">Project: Generic Salbutamol (Albuterol)</h3>
                      <Badge variant="outline" className="text-blue-600 border-blue-600">Phase 4: FDA Approval</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Finalizing ANDA (Abbreviated New Drug Application) submission for generic albuterol inhalers.
                    </p>
                    <Progress value={85} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Funding: Fully Funded</span>
                      <span>Estimated Completion: Q2 2026</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="msa">
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-emerald-800">
                  <Activity className="h-6 w-6 text-emerald-600" />
                  MSA Integration
                </CardTitle>
                <CardDescription className="text-emerald-600/80">
                  Medical Savings Accounts tied directly to the Health Accords.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-emerald-900 mb-2">Seamless Payment Routing</h3>
                  <p className="text-emerald-700 max-w-md mx-auto mb-6">
                    When you purchase medications through the Health Accords, the system automatically routes the payment through your MSA, ensuring tax compliance and preserving your cash flow.
                  </p>
                  <Button variant="outline" className="border-emerald-500 text-emerald-700 hover:bg-emerald-100" onClick={() => navigate('/initiatives/msa')}>
                    Manage Your MSA
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
