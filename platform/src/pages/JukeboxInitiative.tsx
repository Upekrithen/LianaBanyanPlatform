import React, { useState } from 'react';
import { Music, ShieldCheck, Zap, Users, PlayCircle, Coins, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import '@/styles/landing.css';

export default function JukeboxInitiative() {
  const [activeTab, setActiveTab] = useState<'lobbying' | 'artists' | 'creators'>('lobbying');

  return (
    <div className="landing-page min-h-screen bg-slate-50">
      <div className="landing-title">
        <span className="liana">Liana</span>
        <span className="banyan">Banyan</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-pink-600 border-pink-600">Initiative #13</Badge>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl flex items-center justify-center gap-3">
            <Music className="h-10 w-10 text-pink-600" />
            JukeBox
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
            Fair music licensing where artists keep 83.3%. One contract for all. 
            The end of impossible individual negotiations.
          </p>
        </div>

        {/* The Core Philosophy */}
        <Card className="mb-12 border-l-4 border-l-pink-500 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-pink-500" />
              The "Moonshot Contract" Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-slate-700 space-y-4">
            <p>
              Creators want to use great songs in their work (commercials, movies, crowdfund campaigns, rallies), but they don't own the rights, don't know how to get them, and don't have the money for traditional licensing. 
            </p>
            <p>
              <strong>The JukeBox solves this.</strong> Instead of an artist having to negotiate 1,000 individual contracts with 1,000 different creators, the artist signs <em>one</em> Moonshot Contract tailored exactly to their wishes. They can set different conditions for different uses: a 30-second clip for YouTube, a full song for a podcast, or a special rate exclusively for startups. 
            </p>
            <p>
              Creators can then instantly license the music based on those exact terms, and the artist gets paid immediately.
            </p>
          </CardContent>
        </Card>

        {/* The Crown Section */}
        <div className="bg-slate-900 rounded-2xl p-8 mb-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Star className="h-48 w-48" />
          </div>
          <div className="relative z-10">
            <Badge className="bg-pink-500 text-white mb-4">The Crown: Maestro Mentor</Badge>
            <h2 className="text-3xl font-bold mb-4">Why We Wrote to Taylor Swift</h2>
            <p className="text-slate-300 text-lg mb-6 max-w-3xl">
              She spent a decade proving that artists can own their art and still succeed—if they have enough leverage. But leverage comes from being Taylor Swift. Most musicians will never have it. 
            </p>
            <p className="text-slate-300 text-lg mb-6 max-w-3xl">
              The kid uploading to SoundCloud. The cover band licensing songs for a local commercial. The indie artist whose song gets used in a YouTube video. They're stuck choosing between exposure (no payment) and obscurity (no audience). The system gives them nothing because they have no leverage to demand anything.
            </p>
            <p className="text-pink-400 text-xl font-medium italic mb-6">
              "I deserve to own what I make." — Taylor Swift
            </p>
            <p className="text-slate-300 text-lg max-w-3xl">
              Now the infrastructure exists so <strong>everyone can</strong>. JukeBox gives that leverage to everyone. We asked her to be the Maestro Mentor—not to run it day-to-day, but to set the standards that protect artists, because she knows every loophole.
            </p>
          </div>
        </div>

        {/* The Precedent */}
        <div className="bg-slate-50 rounded-2xl p-8 mb-16 border border-slate-200">
          <Badge className="bg-slate-800 text-white mb-4">The Precedent</Badge>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">The Bruck'lyn "Moonshot" Contract</h2>
          <p className="text-slate-600 text-lg mb-6 max-w-3xl">
            Bruck'lyn was the first artist to say yes. In June 2025, he allowed the Founder to use his entire song "Moonshot" free of charge. The Founder hasn't given him anything yet, or even notified him of its use—he wants Bruck'lyn to find out at launch. But this established the exact compensation package we use to lobby artists, backed by the Founder's actual IP valuation ($525K development valuation):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-emerald-600 mb-1">Cash</div>
              <div className="text-sm text-slate-600">Immediate licensing fee (83.3% to artist)</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-1">Credits</div>
              <div className="text-sm text-slate-600">Full platform value & utility</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-amber-500 mb-1">Marks</div>
              <div className="text-sm text-slate-600">Backed by tangible IP valuation ($525K dev valuation)</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-purple-600 mb-1">Medallion</div>
              <div className="text-sm text-slate-600">Founder's Circle membership participation</div>
            </div>
          </div>
          
          <div className="bg-slate-900 text-white p-6 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl mb-1">Listen to "Moonshot" by Bruck'lyn</h3>
              <p className="text-slate-400 text-sm">The song that started it all.</p>
            </div>
            <Button 
              className="bg-pink-600 hover:bg-pink-700 text-white"
              onClick={() => window.open('https://www.youtube.com/results?search_query=Brucklyn+Moonshot', '_blank')}
            >
              <PlayCircle className="mr-2 h-5 w-5" /> Play on YouTube
            </Button>
          </div>
        </div>

        {/* Interactive Dashboard Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button 
            variant={activeTab === 'lobbying' ? 'default' : 'outline'}
            onClick={() => setActiveTab('lobbying')}
            className={activeTab === 'lobbying' ? 'bg-pink-600' : ''}
          >
            <Users className="mr-2 h-4 w-4" /> Active Lobbying (One Take Wonders)
          </Button>
          <Button 
            variant={activeTab === 'artists' ? 'default' : 'outline'}
            onClick={() => setActiveTab('artists')}
            className={activeTab === 'artists' ? 'bg-pink-600' : ''}
          >
            <Music className="mr-2 h-4 w-4" /> For Artists
          </Button>
          <Button 
            variant={activeTab === 'creators' ? 'default' : 'outline'}
            onClick={() => setActiveTab('creators')}
            className={activeTab === 'creators' ? 'bg-pink-600' : ''}
          >
            <PlayCircle className="mr-2 h-4 w-4" /> For Creators
          </Button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-16 min-h-[500px]">
          
          {activeTab === 'lobbying' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <Users className="h-8 w-8 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">One Take Wonders & Active Lobbying</h2>
                  <p className="text-slate-500">How the community pools money to get artists on the platform.</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8">
                <h3 className="font-bold text-slate-900 mb-2">The Process</h3>
                <ol className="list-decimal list-inside space-y-2 text-slate-700">
                  <li>The Founder (or a Creator) records a "One Take Wonder" video on YouTube using a song they want to license.</li>
                  <li>The community votes on the video by pooling Marks/Money into a Lobbying Bounty.</li>
                  <li>Once the bounty is large enough, we approach the Artist with the pooled money + The Bruck'lyn Package.</li>
                  <li>If the Artist signs the "One Contract," they get the money, and the song is unlocked in the JukeBox for all creators to use.</li>
                </ol>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-4">Curated Playlists (Active Lobbying)</h3>
              <p className="text-slate-600 mb-6">
                Anyone can add their Spotify, YouTube, or Apple Music playlists to their portfolio. We are actively lobbying these artists to join the JukeBox using the Moonshot Contract. Here is the Founder's initial curated seed list:
              </p>
              
              <div className="bg-slate-900 rounded-lg p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 rounded-full p-2">
                    <PlayCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">The Official Liana Banyan Playlist</h4>
                    <p className="text-slate-400 text-sm">Listen on Spotify</p>
                  </div>
                </div>
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => window.open('https://open.spotify.com/playlist/0yyJMjb6QZTcPbkE1eJDNv?si=c68cdffb7deb4684', '_blank')}
                >
                  Open Playlist
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Example Lobbying Cards */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">"9 to 5" (Remix)</CardTitle>
                    <CardDescription>Dolly Parton & Pitbull</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-500">Lobbying Pool</span>
                      <span className="font-bold text-pink-600">$4,250</span>
                    </div>
                    <Progress value={42} className="h-2 mb-4" />
                    <Button variant="outline" className="w-full">Add to Pool</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">"Immigrant Song"</CardTitle>
                    <CardDescription>Led Zeppelin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-500">Lobbying Pool</span>
                      <span className="font-bold text-pink-600">$8,100</span>
                    </div>
                    <Progress value={81} className="h-2 mb-4" />
                    <Button variant="outline" className="w-full">Add to Pool</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'artists' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Music className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">For Artists</h2>
                  <p className="text-slate-500">Your music. Your terms. Your 83.3%.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <ShieldCheck className="h-8 w-8 text-emerald-500 mb-2" />
                    <CardTitle>Total Control</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    You set the price for a 30-second clip, a full song, a podcast intro, or a commercial ad. You decide what is allowed, including specific conditions (e.g., "only for startups" or "non-profits only").
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Coins className="h-8 w-8 text-emerald-500 mb-2" />
                    <CardTitle>Keep 83.3%</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    No label skimming. No mystery administrative fees. The platform takes Cost + 20%. You keep the rest, paid instantly.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Zap className="h-8 w-8 text-emerald-500 mb-2" />
                    <CardTitle>Sign Once</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    Stop negotiating individual licenses. Sign the master usage contract, and let thousands of creators license your work automatically.
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'creators' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <PlayCircle className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">For Creators</h2>
                  <p className="text-slate-500">Legal, affordable music for your projects.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">"Moonshot" by Bruck'lyn</h4>
                    <p className="text-sm text-slate-500">Full Song License (Startup Tier)</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">$15.00</span>
                    <Button>License Now</Button>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between opacity-50">
                  <div>
                    <h4 className="font-bold text-slate-900">"9 to 5"</h4>
                    <p className="text-sm text-slate-500">Dolly Parton & Pitbull</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" disabled>Locked</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* C20 & Headquarters Costs */}
        <div className="bg-slate-900 rounded-2xl p-8 mb-16 text-white text-center">
          <Badge className="bg-emerald-500 text-white mb-4">Just Like The Founder</Badge>
          <h2 className="text-3xl font-bold mb-4">Platform Headquarters Costs & C20</h2>
          <p className="text-slate-300 text-lg mb-6 max-w-3xl mx-auto">
            Liana Banyan takes Cost + 20% (C20). What is "Cost"? Just like the Founder, it's the actual overhead. The Founder has a YouTube channel for Liana Banyan. When it monetizes, that money pays for the platform headquarters (the Founder's garage, electric, internet, Supabase storage/usage fees, and subscriptions). 
          </p>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            This is the exact same model businesses use for themselves when determining their own costs for C20. Total transparency.
          </p>
        </div>

      </div>
    </div>
  );
}
