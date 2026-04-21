import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Pill, Stethoscope, HeartPulse, ShieldAlert, CheckCircle2, ArrowRight, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function HealthAccordsPage() {
  const navigate = useNavigate();

  return (
    <LaunchConditionOverlay initiativeSlug="health-accords" initiativeName="Tatiana Schlossburg Health Accords">
    <PortalPageLayout maxWidth="xl" xrayId="health-accords-page">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-rose-600 rounded-full text-white">
          <Activity className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground dark:text-white">Tatiana Schlossberg Health Accords</h1>
          <p className="text-lg text-muted-foreground dark:text-muted-foreground">
            Affordable prescriptions, navigating medical systems, and RNA help.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Core Philosophy */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/10">
            <CardHeader>
              <Badge variant="outline" className="w-fit bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/50 dark:text-rose-300 mb-2">
                "A true selfless act always sparks another."
              </Badge>
              <CardTitle className="text-2xl text-rose-900 dark:text-rose-400">
                The System is Failing. Let's Build a New One.
              </CardTitle>
              <CardDescription className="text-base text-foreground dark:text-slate-300 mt-2">
                Named in honor of Tatiana Schlossberg, who had the courage to name the system that was failing her. We are building a way for communities to pool their purchasing power for medications and health products, the same way they can for groceries.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 font-bold text-lg">1</div>
                <div>
                  <h4 className="text-xl font-bold text-foreground dark:text-white mb-2 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-rose-500" /> Affordable Prescriptions (LifeLine)
                  </h4>
                  <p className="text-muted-foreground dark:text-muted-foreground mb-3">
                    We use Anonymous Volume Aggregation to group demand for essential medications. By pooling our purchasing power, we bypass the extractive middlemen and secure wholesale pricing for the community.
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-500" /> Transparent pricing: Cost + 20%</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-500" /> Crown Target: Alex Oshmyansky (Cost Plus Drugs)</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 font-bold text-lg">2</div>
                <div>
                  <h4 className="text-xl font-bold text-foreground dark:text-white mb-2 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-blue-500" /> Navigating Medical Systems
                  </h4>
                  <p className="text-muted-foreground dark:text-muted-foreground mb-3">
                    The healthcare system is intentionally opaque. We provide community-vetted guides, advocates, and "Curators" who help you navigate insurance, billing disputes, and finding the right care without getting bankrupted.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 font-bold text-lg">3</div>
                <div>
                  <h4 className="text-xl font-bold text-foreground dark:text-white mb-2 flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-emerald-500" /> RNA / Medical Professional Help
                  </h4>
                  <p className="text-muted-foreground dark:text-muted-foreground mb-3">
                    Register with local RNAs or medical professionals (without formal medical advice liability) who can help you understand what you need, find cheaper alternatives for "Y", and provide guidance when you are overwhelmed.
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Action Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crown: Apothecary Mentor</CardTitle>
              <CardDescription>Target: Alex Oshmyansky</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                We have written to Alex Oshmyansky, the person who helped Mark Cuban build Cost Plus Drugs from a cold call, asking him to be the Crown of this initiative.
              </p>
              <p>
                We need someone who understands how to turn outrage into operational reality, with deep knowledge of pharmaceutical supply chains and a commitment to cooperative structures.
              </p>
              <div className="p-3 bg-muted dark:bg-slate-800 rounded-lg border text-xs">
                <strong>Status:</strong> Letter Sent. Awaiting Response.
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2">
                Read the Crown Letter <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Get Involved</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white justify-start gap-2">
                <Pill className="h-4 w-4" /> Request a Medication
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <UserPlus className="h-4 w-4" /> Register as a Guide / RNA
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
