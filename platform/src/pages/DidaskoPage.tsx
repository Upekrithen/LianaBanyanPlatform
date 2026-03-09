import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, Code, BrainCircuit, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DidaskoPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-600 rounded-full text-white">
          <BookOpen className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Didasko</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            The Academic & K-12 Bounty Curriculum. Solving access and ownership in education.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Core Philosophy */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/10">
            <CardHeader>
              <Badge variant="outline" className="w-fit bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/50 dark:text-indigo-300 mb-2">
                Education Through Play
              </Badge>
              <CardTitle className="text-2xl text-indigo-900 dark:text-indigo-400">
                The people who teach should own what they build.
              </CardTitle>
              <CardDescription className="text-base text-slate-700 dark:text-slate-300 mt-2">
                Education platforms extract 50%+ from instructors. Knowledge gets paywalled. Instructors burn out. Didasko is built on the principle that education should be accessible, and the creators/workers keep 83.3% of every transaction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 font-bold text-lg">1</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-indigo-500" /> The K-12 Bounty Curriculum
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    We post bounties for educators to build world-class K-12 curriculum modules. When a student completes a module, the creator gets paid. The platform margin is permanently locked at Cost + 20%.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 font-bold text-lg">2</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Code className="h-5 w-5 text-blue-500" /> HexIsle: STEAM by being STEAM
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    Our flagship physical computing game, HexIsle, uses water-powered mechanics (hydraulics, pneumatics, laminar flow) to teach physics without screens. Kids don't study physics—they use physics to grow palm trees and navigate currents.
                  </p>
                  <ul className="space-y-1 text-sm text-slate-500">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Elementary: Cause/effect, water flow</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Middle School: Hydraulic systems, gear ratios</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> High School: Fluid mechanics, magnetic fields</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 font-bold text-lg">3</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-emerald-500" /> Cooperative Knowledge
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    Instructors create courses and set their prices. Students access quality education at fair prices. Contributors earn Joules (platform future value) for translating and refining materials.
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
              <CardTitle>Crown: Chancellor</CardTitle>
              <CardDescription>Target: Sal Khan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                We have written to Sal Khan (Khan Academy). He spent two decades proving that world-class education can be free. We spent nine years building the economic infrastructure to make it sustainable.
              </p>
              <p>
                He solved access. We are solving ownership. We are asking him to provide strategic guidance as Chancellor of Didasko.
              </p>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border text-xs">
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
                <CardTitle>College of Hard Knocks</CardTitle>
                <CardDescription>Real-world consensus & tutorials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white justify-start gap-2"
                  onClick={() => navigate('/hard-knocks')}
                >
                  <BookOpen className="h-4 w-4" /> Enter the College
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Educator Portal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start gap-2">
                <GraduationCap className="h-4 w-4" /> Claim a Curriculum Bounty
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
