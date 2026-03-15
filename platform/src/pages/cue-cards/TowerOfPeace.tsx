import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Scale, ShieldAlert, Landmark, ArrowRight } from "lucide-react";

import { LarkWrapper } from '@/components/builder/LarkWrapper';

export default function TowerOfPeace() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-serif">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6 border-b border-slate-300 pb-12">
          <Landmark className="w-16 h-16 mx-auto text-slate-700" />
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            The Tower of Peace
          </h1>
          <p className="text-2xl text-slate-600 italic max-w-2xl mx-auto">
            "What is governed is just."
          </p>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto">
            Welcome, Academics, Economists, and Critics. This is the intellectual staging area for the Liana Banyan Platform. We invite your rigorous scrutiny.
          </p>
        </div>

        {/* The Core Thesis */}
        <LarkWrapper componentId="tower-thesis-card" bountyCredits={150}>
          <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="bg-slate-100 border-b border-slate-200">
            <CardTitle className="text-2xl flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-slate-700" />
              A Considered Approach to Sustained Universal Economic Prosperity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6 text-lg leading-relaxed">
            <p>
              The Liana Banyan Platform is built upon a fundamental restructuring of cooperative economics. We assert that it is structurally possible to cure world hunger and achieve sustained prosperity by locking the platform margin at <strong>Cost + 20%</strong> and ensuring the creator retains <strong>83.3%</strong> of all revenue generated.
            </p>
            <p>
              This is not a charity. It is a cooperative commerce corporation utilizing a Three-Gear Currency system (Credits, Marks, Joules) to eliminate speculative extraction while maintaining aggressive market incentives.
            </p>
            <Button className="bg-slate-800 hover:bg-slate-700 text-white w-full md:w-auto">
              Read the Full Academic Paper <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
        </LarkWrapper>

        {/* The 9 Economic Laws & Critiques */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-slate-600" />
                The 9 Economic Laws
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                The immutable laws governing the platform's Yggdrasil architecture, ensuring extraction is structurally impossible.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2"><span className="font-bold">1.</span> The Creator Keeps 83.3%</li>
                <li className="flex items-start gap-2"><span className="font-bold">2.</span> The Platform Margin is Cost+20%</li>
                <li className="flex items-start gap-2"><span className="font-bold">3.</span> Value is Stored Potential (Joules)</li>
                <li className="text-slate-400 italic mt-2">...view all 9 laws</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-slate-900 text-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Anticipated Critiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                We know the claims are massive. We have preemptively addressed the most common economic, sociological, and logistical critiques.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="border-b border-slate-700 pb-2">"How do you prevent inflation of Joules?"</li>
                <li className="border-b border-slate-700 pb-2">"Why won't bad actors exploit the 83.3%?"</li>
                <li className="pb-2">"How does this scale across 12 Cities?"</li>
              </ul>
              <Button variant="link" className="text-amber-400 p-0 mt-2">View All Rebuttals →</Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
