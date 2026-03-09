import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, Scale, Handshake, Shield, ArrowRight, CheckCircle2, FileSignature, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PowerToThePeoplePage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-purple-600 rounded-full text-white">
          <Flag className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Power to the People</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            The Political Expedition. Leave the politics outside. Build the infrastructure inside.
          </p>
        </div>
      </div>

      <div className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl max-w-4xl">
        <p className="text-slate-300 italic text-lg leading-relaxed">
          "But to every mind there openeth,<br />
          A way, and way, and away,<br />
          A high soul climbs the highway,<br />
          And the low soul gropes the low,<br />
          And in between on the misty flats,<br />
          The rest drift to and fro.<br />
          <br />
          But to every man there openeth,<br />
          A high way and a low,<br />
          And every mind decideth,<br />
          The way his soul shall go.<br />
          <br />
          One ship sails East,<br />
          And another West,<br />
          By the self-same winds that blow,<br />
          'Tis the set of the sails<br />
          And not the gales,<br />
          That tells the way we go.<br />
          <br />
          Like the winds of the sea<br />
          Are the waves of time,<br />
          As we journey along through life,<br />
          'Tis the set of the soul,<br />
          That determines the goal,<br />
          And not the calm or the strife."
        </p>
        <p className="text-purple-400 text-sm mt-4 font-medium">— Ella Wheeler Wilcox</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Core Philosophy */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-purple-200 dark:border-purple-900 bg-purple-50/30 dark:bg-purple-950/10">
            <CardHeader>
              <Badge variant="outline" className="w-fit bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 mb-2">
                The Switzerland Protocol
              </Badge>
              <CardTitle className="text-2xl text-purple-900 dark:text-purple-400">
                Helping Each Other Help Ourselves
              </CardTitle>
              <CardDescription className="text-base text-slate-700 dark:text-slate-300 mt-2">
                Liana Banyan is neutral ground. If you want to argue politics, you go "Outside the Gates." Inside, we agree on 16 initiatives that prioritize localism, worker ownership, and family independence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 font-bold text-lg">1</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-purple-500" /> Different Tribes, Shared Infrastructure
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    Outside the gates, people can argue, organize, and campaign as they wish. Inside the gates, our job is quieter: to keep the lights on, and to make sure that when communities build something together, the value stays with them.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 font-bold text-lg">2</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <FileSignature className="h-5 w-5 text-blue-500" /> Petitions & Vote Tracking
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    Elections come and go. What matters in between is what actually gets done. Power to the People is a neutral tracking layer for democracy:
                  </p>
                  <ul className="space-y-1 text-sm text-slate-500">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> People create and sign petitions about specific policies.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> We track how elected officials vote on those items.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> We don’t tell you what to believe. We simply remember, in public, who did what, when.</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 font-bold text-lg">3</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-500" /> Protecting the Keep
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    We do not allow the platform to be weaponized for culture wars. The 16 initiatives are the focus. If a policy helps families get groceries, make dinner, or afford medicine, we support it.
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
              <CardTitle>The Dual-Crown Structure</CardTitle>
              <CardDescription>Anchoring Two Traditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                We are proposing a Dual-Crown structure for this initiative, pairing two non-partisan archetypes who embody our values from different angles:
              </p>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Handshake className="h-4 w-4 text-blue-500" /> The Door-Opening Crown
                </h5>
                <p className="text-xs">
                  Someone whose life work is widening access—cooperatives, community finance, shared digital infrastructure, and people helping people. (e.g., Trebor Scholz, USFWC).
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Flag className="h-4 w-4 text-emerald-500" /> The Builder Crown
                </h5>
                <p className="text-xs">
                  Someone whose life work is building things—local food systems, worker-owned companies, open hardware, and practical independence. (e.g., Dr. Mariaelena Huambachano, NAFSA).
                </p>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 text-xs">
                <strong>Status:</strong> Drafting Dual-Crown Letters
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Council of Crowns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600 mb-2">
                Members can nominate and vote for Crown candidates outside the LB economic core, under the same "leave politics outside, build inside" principle.
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start gap-2">
                <Users className="h-4 w-4" /> Nominate a Crown
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
