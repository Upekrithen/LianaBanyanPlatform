import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Flag, Scale, Handshake, Shield, ArrowRight, CheckCircle2, FileSignature, Users,
  Vote, Search, MapPin, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle, XCircle,
  Eye, Building2, FileText, Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';

const SAMPLE_REPS = [
  {
    id: 'rep-001',
    name: 'Sarah Mitchell',
    title: 'US Representative',
    district: 'Montana District 1',
    party: 'Independent',
    voteScore: 78,
    keyVotes: { withConstituents: 45, againstConstituents: 12, abstained: 3 },
    recentVotes: [
      { bill: 'HR 1234 - Infrastructure Act', vote: 'YES', aligned: true },
      { bill: 'HR 5678 - Tax Reform', vote: 'NO', aligned: true },
      { bill: 'HR 9012 - Healthcare Access', vote: 'YES', aligned: false },
    ],
    contactInfo: { phone: '202-555-0123', email: 'rep.mitchell@house.gov', office: '123 Capitol St, Helena, MT' }
  },
  {
    id: 'rep-002',
    name: 'James Chen',
    title: 'US Senator',
    district: 'Montana',
    party: 'Democrat',
    voteScore: 65,
    keyVotes: { withConstituents: 38, againstConstituents: 20, abstained: 2 },
    recentVotes: [
      { bill: 'S 456 - Climate Action', vote: 'YES', aligned: true },
      { bill: 'S 789 - Defense Budget', vote: 'YES', aligned: false },
      { bill: 'S 101 - Education Funding', vote: 'YES', aligned: true },
    ],
    contactInfo: { phone: '202-555-0456', email: 'sen.chen@senate.gov', office: '456 Senate Ave, Helena, MT' }
  }
];

const TRACKED_BILLS = [
  {
    id: 'bill-001', number: 'HR 2024', title: 'Worker Ownership Incentive Act',
    status: 'In Committee', relevance: 'HIGH',
    description: 'Tax incentives for companies that transition to worker ownership models.',
    sponsors: 12, cosponsors: 45
  },
  {
    id: 'bill-002', number: 'S 2025', title: 'Cooperative Commerce Enhancement Act',
    status: 'Floor Vote Scheduled', relevance: 'HIGH',
    description: 'Reduces regulatory burden for cooperative business structures.',
    sponsors: 8, cosponsors: 23
  },
  {
    id: 'bill-003', number: 'HR 3030', title: 'Community Food Security Act',
    status: 'Passed House', relevance: 'MEDIUM',
    description: 'Supports local food systems and neighborhood meal sharing programs.',
    sponsors: 5, cosponsors: 89
  }
];

export default function PowerToThePeoplePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'reps' | 'bills' | 'actions'>('reps');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <LaunchConditionOverlay initiativeSlug="power-to-the-people" initiativeName="Power to the People">
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
                Liana Banyan is neutral ground. If you want to argue politics, you go "Outside the Gates." Inside, we agree on 16 initiatives that prioritize localism, worker participation, and family independence.
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
              <CardTitle>The Quad-Crown Structure</CardTitle>
              <CardDescription>Not Left, Not Right — Forward Together</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                Four voices. Four traditions. One shared belief: we need each other. The Quad-Crown proves this isn't partisan — it's human.
              </p>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Handshake className="h-4 w-4 text-blue-500" /> Door-Opening Crown (Left)
                </h5>
                <p className="text-xs">
                  The system should work for everyone. Cooperative economics, worker ownership, systemic access. "You've been saying the system should work for everyone. We built one."
                </p>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Handshake className="h-4 w-4 text-red-500" /> Door-Opening Crown (Right)
                </h5>
                <p className="text-xs">
                  Nobody succeeds alone. Gratitude, immigrant achievement, bipartisan interdependence. "You said you're not a self-made man. Neither is anyone. Welcome home."
                </p>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Flag className="h-4 w-4 text-emerald-500" /> Builder Crown (Culture)
                </h5>
                <p className="text-xs">
                  Radical generosity as a way of life. Zero ego, beloved across all demographics. "You already live this way. Now there's a platform that matches."
                </p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-amber-500" /> Builder Crown (Action)
                </h5>
                <p className="text-xs">
                  Quiet massive philanthropy. Community rebuilding without fanfare. "You rebuild communities after disasters. We're building one before the next one hits."
                </p>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 text-xs">
                <strong>Status:</strong> Quad-Crown Letters Drafted — Awaiting Founder Review
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

      {/* ═══════════════════════════════════════════════════════════════
          POLITICAL EXPEDITION — Operational Tools
          Merged from escape-velocity PoliticalExpeditionPage.tsx
          ═══════════════════════════════════════════════════════════════ */}
      <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Vote className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">The Pnyx — Track Your Representatives</h2>
            <p className="text-slate-600 dark:text-slate-400">Vote FOR people who vote for you.</p>
          </div>
          <Badge variant="outline" className="ml-auto text-amber-600 border-amber-400 dark:text-amber-400">
            Sample Data
          </Badge>
        </div>

        <div className="bg-blue-950/50 border border-blue-800 rounded-lg p-4 mb-6 max-w-2xl">
          <h3 className="text-amber-400 font-semibold flex items-center gap-2 mb-2">
            The Arena Policy
          </h3>
          <p className="text-sm text-slate-300 dark:text-blue-200">
            <strong>Why "Political Expedition"?</strong> Because you are <em>leaving</em> the main platform to discuss politics here.
            Liana Banyan maintains strict neutrality on religion and politics — this arena exists
            <em> outside</em> our cooperative commerce mission so political discourse can happen
            without contaminating the community.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
          <Button
            variant={activeTab === 'reps' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('reps')}
            className={activeTab === 'reps' ? 'bg-blue-600 text-white' : ''}
          >
            <Users className="h-4 w-4 mr-2" />
            Representatives
          </Button>
          <Button
            variant={activeTab === 'bills' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('bills')}
            className={activeTab === 'bills' ? 'bg-blue-600 text-white' : ''}
          >
            <FileText className="h-4 w-4 mr-2" />
            Tracked Bills
          </Button>
          <Button
            variant={activeTab === 'actions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('actions')}
            className={activeTab === 'actions' ? 'bg-blue-600 text-white' : ''}
          >
            <Scale className="h-4 w-4 mr-2" />
            Take Action
          </Button>
        </div>

        {/* Representatives Tab */}
        {activeTab === 'reps' && (
          <div className="space-y-6">
            <div className="flex gap-4 max-w-xl">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                <Input
                  placeholder="Enter your ZIP code to find your representatives"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-500">
                <Search className="h-4 w-4 mr-2" />
                Find Reps
              </Button>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Your Representatives</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {SAMPLE_REPS.map(rep => (
                <Card key={rep.id} className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <Users className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                          <CardTitle className="text-slate-900 dark:text-white">{rep.name}</CardTitle>
                          <CardDescription>{rep.title}</CardDescription>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{rep.party}</Badge>
                            <span className="text-xs text-slate-500">{rep.district}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${
                          rep.voteScore >= 70 ? 'text-green-500' :
                          rep.voteScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {rep.voteScore}%
                        </div>
                        <p className="text-xs text-slate-500">Alignment Score</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/30 rounded">
                        <ThumbsUp className="h-4 w-4 mx-auto text-green-500 mb-1" />
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{rep.keyVotes.withConstituents}</p>
                        <p className="text-xs text-green-700 dark:text-green-300">With You</p>
                      </div>
                      <div className="text-center p-2 bg-red-50 dark:bg-red-900/30 rounded">
                        <ThumbsDown className="h-4 w-4 mx-auto text-red-500 mb-1" />
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{rep.keyVotes.againstConstituents}</p>
                        <p className="text-xs text-red-700 dark:text-red-300">Against You</p>
                      </div>
                      <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                        <AlertCircle className="h-4 w-4 mx-auto text-slate-400 mb-1" />
                        <p className="text-lg font-bold text-slate-600 dark:text-slate-400">{rep.keyVotes.abstained}</p>
                        <p className="text-xs text-slate-500">Abstained</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Recent Votes</p>
                      {rep.recentVotes.map((vote, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded text-sm">
                          <span className="text-slate-700 dark:text-slate-300 truncate flex-1">{vote.bill}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={vote.vote === 'YES' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                              {vote.vote}
                            </Badge>
                            {vote.aligned ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Full Record
                      </Button>
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tracked Bills Tab */}
        {activeTab === 'bills' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Bills We're Tracking</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Legislation relevant to cooperative commerce, worker ownership, and community empowerment.
            </p>
            <div className="space-y-4">
              {TRACKED_BILLS.map(bill => (
                <Card key={bill.id} className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-600 text-white">{bill.number}</Badge>
                          <Badge className={
                            bill.relevance === 'HIGH' ? 'bg-green-600 text-white' :
                            bill.relevance === 'MEDIUM' ? 'bg-yellow-600 text-white' : 'bg-slate-600 text-white'
                          }>
                            {bill.relevance} Priority
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{bill.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{bill.description}</p>
                      </div>
                      <Badge variant="outline">{bill.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{bill.sponsors} Sponsors</span>
                        <span>{bill.cosponsors} Cosponsors</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Track This Bill
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Take Action Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Take Action</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-500/30">
                <CardContent className="pt-6 text-center">
                  <Building2 className="h-12 w-12 mx-auto text-green-600 dark:text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Contact Your Rep</h3>
                  <p className="text-green-800 dark:text-green-200 text-sm mb-4">
                    Call, email, or schedule a meeting with your representatives.
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-500 text-white">
                    Get Contact Info
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-500/30">
                <CardContent className="pt-6 text-center">
                  <Vote className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Register to Vote</h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
                    Check your registration status or register to vote.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                    Check Status
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-500/30">
                <CardContent className="pt-6 text-center">
                  <Users className="h-12 w-12 mx-auto text-purple-600 dark:text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Join the Pnyx</h3>
                  <p className="text-purple-800 dark:text-purple-200 text-sm mb-4">
                    Discuss governance with other citizens in our community.
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white">
                    Join Discussion
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-200 dark:border-blue-500/30 mt-8">
              <CardContent className="py-8 text-center">
                <Scale className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
                <blockquote className="text-xl text-slate-900 dark:text-white font-medium mb-4">
                  "Vote FOR people who vote for you."
                </blockquote>
                <p className="text-slate-600 dark:text-blue-300">
                  The Political Expedition tracks every vote so you can make informed decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center border-t border-slate-200 dark:border-slate-800 pt-8">
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          <strong className="text-slate-900 dark:text-white">Power to the People</strong> — Initiative #15
        </p>
        <p className="text-xs mt-2 text-slate-500">
          "Not left or right. Forward." — Help Each Other Help Ourselves
        </p>
      </div>
    </div>
    </LaunchConditionOverlay>
  );
}
