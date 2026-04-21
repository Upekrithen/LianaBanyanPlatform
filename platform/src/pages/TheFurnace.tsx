import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShieldCheck, AlertTriangle, Flame, ExternalLink, QrCode, BookOpen, Newspaper, Megaphone, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function TheFurnace() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerify = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a Cue Card hash, URL, or business name to verify.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    // Simulate verification check against the cue_card_registry
    setTimeout(() => {
      setIsVerifying(false);
      // Mock result
      if (searchQuery.toLowerCase().includes("fake")) {
        setVerificationResult({
          status: "counterfeit",
          message: "Warning: This Cue Card is not registered on the Immutable Ledger.",
          trustScore: 12
        });
      } else {
        setVerificationResult({
          status: "verified",
          businessName: "Sample Verified Business",
          tier: "Flame Partner",
          trustScore: 98,
          scans: 1245,
          message: "Verified: This Cue Card is authentic and backed by Liana Banyan IP."
        });
      }
    }, 1500);
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="the-furnace">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-orange-500 rounded-full text-white">
          <Flame className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">The Furnace</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Business Verification & Cue Card Authenticity Engine
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-orange-200 shadow-md">
            <CardHeader className="bg-orange-50/50 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-orange-600" />
                Verify a Cue Card or Business
              </CardTitle>
              <CardDescription>
                Enter the payload hash from a scanned Cue Card or search for a registered business to verify their standing.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Enter Cue Card hash, URL, or business name..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  />
                </div>
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isVerifying ? "Verifying..." : "Verify"}
                </Button>
              </div>

              {verificationResult && (
                <div className={`mt-6 p-6 rounded-lg border ${
                  verificationResult.status === 'verified'
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                    : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                }`}>
                  <div className="flex items-start gap-4">
                    {verificationResult.status === 'verified' ? (
                      <ShieldCheck className="h-8 w-8 text-green-600 mt-1" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-red-600 mt-1" />
                    )}

                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${
                        verificationResult.status === 'verified' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
                      }`}>
                        {verificationResult.status === 'verified' ? 'Authentic & Verified' : 'Suspicious / Counterfeit'}
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 mt-1">
                        {verificationResult.message}
                      </p>

                      {verificationResult.status === 'verified' && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Business Name</p>
                            <p className="font-medium">{verificationResult.businessName}</p>
                          </div>
                          <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Charitable Tier</p>
                            <div className="flex items-center gap-2">
                              <Flame className="h-4 w-4 text-orange-500" />
                              <p className="font-medium">{verificationResult.tier}</p>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Trust Score</p>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${verificationResult.trustScore}%` }}></div>
                              </div>
                              <span className="font-bold text-sm">{verificationResult.trustScore}</span>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Total Scans</p>
                            <p className="font-medium">{verificationResult.scans.toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Verifications</CardTitle>
              <CardDescription>Live feed of Cue Cards passing through The Furnace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded">
                        <QrCode className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Hash: 8f4e...{Math.floor(Math.random() * 9000) + 1000}</p>
                        <p className="text-xs text-slate-500">Just now • San Francisco, CA</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Verified
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-slate-800">
            <CardHeader>
              <CardTitle className="text-orange-400">Why The Furnace?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <p>
                The Furnace is our immutable truth engine. It ensures that every physical Cue Card and every registered business on the platform is exactly who they say they are.
              </p>
              <p>
                By backing our physical cards with IP and verifying them here, we eliminate counterfeits and build a high-trust ecosystem for the 12 Cities.
              </p>
              <Button variant="outline" className="w-full border-slate-700 text-slate-900 bg-white hover:bg-slate-100 mt-2">
                Report a Suspicious Card
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Charitable Tiers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-300" />
                  <span className="text-sm font-medium">Ember Partner</span>
                </div>
                <span className="text-xs text-slate-500">1-2% Donated</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <Flame className="h-4 w-4 text-orange-500 -ml-3" />
                  <span className="text-sm font-medium">Flame Partner</span>
                </div>
                <span className="text-xs text-slate-500">3-4% Donated</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-600" />
                  <Flame className="h-4 w-4 text-orange-600 -ml-3" />
                  <Flame className="h-4 w-4 text-orange-600 -ml-3" />
                  <span className="text-sm font-medium">Blaze Partner</span>
                </div>
                <span className="text-xs text-slate-500">5-9% Donated</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-700" />
                  <Flame className="h-4 w-4 text-orange-700 -ml-3" />
                  <Flame className="h-4 w-4 text-orange-700 -ml-3" />
                  <Flame className="h-4 w-4 text-orange-700 -ml-3" />
                  <span className="text-sm font-medium">Inferno Partner</span>
                </div>
                <span className="text-xs text-slate-500">10%+ Donated</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Who Uses The Furnace?</h2>
        <Tabs defaultValue="academia" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto">
            <TabsTrigger value="academia" className="py-3 flex flex-col gap-2">
              <BookOpen className="h-5 w-5" />
              <span>Academia</span>
            </TabsTrigger>
            <TabsTrigger value="press" className="py-3 flex flex-col gap-2">
              <Newspaper className="h-5 w-5" />
              <span>Journalists & Press</span>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="py-3 flex flex-col gap-2">
              <Megaphone className="h-5 w-5" />
              <span>Marketing & Brands</span>
            </TabsTrigger>
            <TabsTrigger value="consumers" className="py-3 flex flex-col gap-2">
              <Users className="h-5 w-5" />
              <span>Consumers</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="academia" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Verification</CardTitle>
                <CardDescription>Tracing claims to the Immutable Ledger</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  For researchers and academics reviewing the <strong>9 Economic Laws</strong> or platform mechanics, The Furnace provides tamper-proof verification of all claims.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
                  <li>Verify the mathematical distribution of the 83.3% Creator/Worker Share.</li>
                  <li>Audit the Cost+20% margin lock across aggregated storefronts.</li>
                  <li>Trace the provenance of IP and patents backing the physical Cue Cards.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="press" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Press Junket & Journalists</CardTitle>
                <CardDescription>Verifying sources, quotes, and IP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Journalists can use The Furnace to independently verify the authenticity of any Liana Banyan press release, founder quote, or "Red Carpet" invitation they receive.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
                  <li>Scan a physical press pass or Cue Card to confirm it was issued by the platform.</li>
                  <li>Verify the "Little Red Hen" economic claims (Who bakes the bread? Who eats it?).</li>
                  <li>Confirm the exact number of active nodes and Cold Start threshold progress in any given city.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Marketing & Brands</CardTitle>
                <CardDescription>Proving authenticity and preventing greenwashing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Brands linking their storefronts to the `.biz` portal use The Furnace to prove their charitable commitments. We eliminate "greenwashing" by tracking exact donation percentages on the ledger.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
                  <li>Verify a brand's <strong>Kindling Tier</strong> (Ember, Flame, Blaze, Inferno).</li>
                  <li>Prove that physical marketing materials (QR Cue Cards) are backed by real IP Joules.</li>
                  <li>Showcase transparent supply chain and Cost+20% pricing to build consumer trust.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consumers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Everyday Consumers</CardTitle>
                <CardDescription>Knowing exactly who you are buying from</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  When you scan a Liana Banyan Cue Card at a local coffee shop or garage sale, The Furnace tells you exactly who you are dealing with.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
                  <li>Instantly spot counterfeit cards or unverified businesses.</li>
                  <li>See the business's Trust Score before making a purchase.</li>
                  <li>Know exactly how much of your purchase is going to the creator vs. the platform.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </PortalPageLayout>
  );
}
