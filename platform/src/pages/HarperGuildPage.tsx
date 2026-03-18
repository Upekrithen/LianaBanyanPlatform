import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Heart, Eye, AlertTriangle, Users, BookOpen, Star, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';
import '@/styles/landing.css';

export default function HarperGuildPage() {
  const navigate = useNavigate();

  return (
    <LaunchConditionOverlay initiativeSlug="harper-guild" initiativeName="Harper Guild">
    <div className="landing-page min-h-screen bg-slate-50">
      <div className="landing-title">
        <span className="liana">Liana</span>
        <span className="banyan">Banyan</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-slate-600 border-slate-600">Initiative #12</Badge>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl flex items-center justify-center gap-3">
            <BookOpen className="h-10 w-10 text-slate-700" />
            Harper Guild
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
            The Conscience of Liana Banyan. Independent Ethics Checkers and Care Coordinators embedded in every initiative to protect worker wellbeing and maintain cooperative culture.
          </p>
        </div>

        {/* The Core Philosophy */}
        <Card className="mb-12 border-l-4 border-l-slate-700 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6 text-slate-700" />
              Non-Influenceable By Design
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-slate-700 space-y-4">
            <p>
              Traditional HR works for the company, not the employee. The Harper Guild flips this. 
              Harpers are care coordinators embedded in every initiative, but they are <strong>paid by the platform, not by the businesses they serve</strong>.
            </p>
            <p>
              They cannot be fired by the businesses they observe. They report only to the Harper Guild. They are the immune system of the cooperative—independent observers who can identify when something's wrong before it breaks, ensuring that power dynamics never become abusive.
            </p>
          </CardContent>
        </Card>

        {/* The Crown Section */}
        <div className="bg-slate-900 rounded-2xl p-8 mb-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Star className="h-48 w-48" />
          </div>
          <div className="relative z-10">
            <Badge className="bg-slate-500 text-white mb-4">The Crown: Harper Prime Mentor</Badge>
            <h2 className="text-3xl font-bold mb-4">Why We Wrote to Brené Brown</h2>
            <p className="text-slate-300 text-lg mb-6 max-w-3xl">
              Liana Banyan asks workers to be vulnerable: to put their cooking in front of strangers, to create music that might not sell, to start businesses that might fail, and to ask for help when they're struggling.
            </p>
            <p className="text-slate-300 text-lg mb-6 max-w-3xl">
              Vulnerability requires safety. Traditional platforms solve this with surveillance. We solve it with care. We asked Dr. Brené Brown to be the Harper Prime Mentor to help us build care infrastructure at scale—systems that identify when a worker is struggling and ensure the culture doesn't drift from its values.
            </p>
            <p className="text-slate-400 italic">
              "The Harper Guild is infrastructure for courage. It creates the conditions where workers can be vulnerable because someone is watching out for them."
            </p>
          </div>
        </div>

        {/* The "Oops" Code System */}
        <Card className="mb-16 border-t-4 border-t-amber-500 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Activity className="h-6 w-6 text-amber-500" />
              The "Oops" Code System
            </CardTitle>
            <CardDescription className="text-base">Camouflage & Readiness Training</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-700">
              One of the most critical innovations in the Harper Guild is the <strong>"Oops" Code System</strong>. We generate automatic false-positive check-ins—fake wellness alerts that activate the exact same response protocols as real ones. Harpers cannot tell the difference until the check-in is complete.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                <h4 className="font-bold text-amber-900 mb-2">Why We Do It:</h4>
                <ul className="space-y-2 text-amber-800 text-sm">
                  <li className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5 flex-shrink-0" /> <strong>Camouflage:</strong> It normalizes the check-in process so real alerts don't stand out. "We check on everyone, not just you."</li>
                  <li className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5 flex-shrink-0" /> <strong>Readiness:</strong> Keeps responders trained and sharp during low-activity periods.</li>
                  <li className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5 flex-shrink-0" /> <strong>Reliability:</strong> Tests the system continuously to ensure no alert is ever dropped.</li>
                </ul>
              </div>
              <div className="flex items-center justify-center p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <p className="text-lg font-medium text-slate-700 italic">
                  "We'd rather check on you 100 times for nothing than miss the one time you need us."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* College of Hard Knocks / Anecdotes */}
        <div className="text-center bg-slate-100 p-8 rounded-2xl border border-slate-200">
          <Heart className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Born from the College of Hard Knocks</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-6">
            Every humanitarian feature in this platform exists because the Founder or someone he knew needed it and it didn't exist. The Harper Guild isn't abstract corporate theory—it's built from the lived reality of watching systems fail in slow motion, and designing the exact safety net that would have caught the people who fell through the cracks.
          </p>
          <Button variant="outline" onClick={() => window.open('https://cephas.lianabanyan.com/founder-proof', '_blank', 'noopener,noreferrer')}>
            Read the Founder's Anecdotes
          </Button>
        </div>

      </div>
    </div>
    </LaunchConditionOverlay>
  );
}
