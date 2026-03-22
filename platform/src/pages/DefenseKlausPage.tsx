import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Heart, Radio, Scale, BellRing, MapPin, Users,
  AlertTriangle, ShieldCheck, Gift, ArrowRight, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SWOOPVoting } from "@/components/SWOOPVoting";
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { BeaconDropButton } from '@/components/BeaconDropButton';
import '@/styles/landing.css';

export default function DefenseKlausPage() {
  const navigate = useNavigate();

  return (
    <LaunchConditionOverlay initiativeSlug="defense-klaus" initiativeName="Defense Klaus">
    <PortalPageLayout variant="immersive" className="landing-page" xrayId="defense-klaus-page">
      <div className="landing-title">
        <span className="liana">Liana</span>
        <span className="banyan">Banyan</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <Badge variant="outline" className="mb-4 text-red-600 border-red-600 bg-red-50">Initiative #8</Badge>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-4 flex-wrap">
              <img src="/images/defense-klaus-shield.png" alt="Defense Klaus Shield" className="h-[120px] w-auto drop-shadow-lg" />
              Defense Klaus
              <BeaconDropButton compact className="ml-2" />
            </h1>
            <p className="mt-2 text-xl text-muted-foreground max-w-2xl">
              "For Someone You Love." Personal safety fashion, 24/7 monitoring, and a pooled legal defense fund for the vulnerable.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Gift className="w-4 h-4 mr-2" /> Gift a Bracelet (\)
            </Button>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              <AlertTriangle className="w-4 h-4 mr-2" /> Emergency Trigger
            </Button>
          </div>
        </div>

        {/* "I Need a Hero" Permanent Banner */}
        <div className="mb-8 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 50%, #450a0a 100%)' }}>
          <div className="px-6 py-5 flex items-center gap-5 text-white">
            <img src="/images/defense-klaus-shield.png" alt="" className="h-12 w-auto flex-shrink-0 drop-shadow-md" />
            <div className="flex-1 text-center">
            <p className="text-2xl font-bold tracking-tight mb-1">$5/Week: &ldquo;I Need a Hero&rdquo;</p>
            <p className="text-red-200 text-sm mb-3">
              3 Elves + 3 Spotters minimum per activation. Never respond alone.<br />
              Your $5 subscription funds the standing bounty.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                className="bg-white text-red-900 hover:bg-red-50 font-semibold"
                onClick={() => navigate('/defense-klaus/subscribe')}
              >
                Sign Up
              </Button>
              <Button
                variant="outline"
                className="border-red-300 text-white hover:bg-red-900/50"
                onClick={() => {
                  document.getElementById('dk-how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </div>
            </div>
          </div>
        </div>

        {/* SWOOP Voting Section */}
        <div className="mb-12">
          <SWOOPVoting
            initiativeSlug="defense-klaus"
            initiativeName="Defense Klaus"
            description="Vote to launch the physical manufacturing of the Defense Klaus bracelets. 500 votes needed to activate."
            threshold={500}
          />
        </div>

        <Tabs defaultValue="network" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1 bg-muted">
            <TabsTrigger value="network" className="py-3 text-base data-[state=active]:bg-white">
              <Heart className="w-4 h-4 mr-2" /> My Network
            </TabsTrigger>
            <TabsTrigger value="gift" className="py-3 text-base data-[state=active]:bg-white">
              <Gift className="w-4 h-4 mr-2" /> Gift a Bracelet
            </TabsTrigger>
            <TabsTrigger value="legal" className="py-3 text-base data-[state=active]:bg-white">
              <Scale className="w-4 h-4 mr-2" /> Legal Defense Fund
            </TabsTrigger>
            <TabsTrigger value="response" className="py-3 text-base data-[state=active]:bg-white">
              <Radio className="w-4 h-4 mr-2" /> Emergency Response
            </TabsTrigger>
          </TabsList>

          <TabsContent value="network" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Protected Loved Ones</h2>
                
                <Card className="border-l-4 border-l-emerald-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-lg">M</div>
                        <div>
                          <h3 className="font-bold text-lg">Mom</h3>
                          <p className="text-sm text-muted-foreground/70">Home Base System</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Armed
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center bg-muted p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground/70" />
                        <span className="text-sm text-muted-foreground">Last Ping: 10 mins ago (Home)</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600">View Status</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-lg">S</div>
                        <div>
                          <h3 className="font-bold text-lg">Sarah (College)</h3>
                          <p className="text-sm text-muted-foreground/70">Wearable Bracelet</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Active
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center bg-muted p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground/70" />
                        <span className="text-sm text-muted-foreground">Last Ping: 2 mins ago (Campus)</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600">View Status</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-900 flex items-center gap-2">
                      <BellRing className="h-5 w-5" />
                      Digital Chalkboard
                    </CardTitle>
                    <CardDescription className="text-red-700">Passive check-in system.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-800 mb-4">
                      If Sarah doesn't interact with her phone or bracelet for 12 hours, the system automatically alerts you. No active check-ins required.
                    </p>
                    <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-100">
                      Configure Thresholds
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gift" className="space-y-6">
            <Card className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 bg-card flex flex-col justify-center">
                  <Heart className="h-12 w-12 text-red-400 mb-6" />
                  <h2 className="text-3xl font-bold mb-4">The Gift of Defense</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    It becomes so standard that receiving one isn't a declaration of a crisis, but just a commonplace gift of love.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Physical NFC/Bluetooth Bracelet</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>1 Year of 24/7 Monitoring</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Access to Legal Defense Fund</span>
                    </li>
                  </ul>
                </div>
                <div className="p-8 flex flex-col justify-center bg-white">
                  <div className="text-center mb-8">
                    <span className="text-5xl font-bold text-foreground">\.00</span>
                    <span className="text-muted-foreground/70 ml-2">/ voucher</span>
                  </div>
                  <div className="space-y-4">
                    <Button className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 text-white">
                      Purchase Voucher
                    </Button>
                    <p className="text-sm text-center text-muted-foreground/70">
                      You will receive a digital voucher to email to your loved one. They enter their shipping address privately.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Scale className="h-6 w-6 text-muted-foreground" />
                  Pooled Legal Defense Fund
                </CardTitle>
                <CardDescription>
                  When one of us is attacked, they face the resources of all of us.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-muted rounded-xl border text-center">
                    <p className="text-sm text-muted-foreground/70 mb-2">Current Fund Pool</p>
                    <p className="text-3xl font-bold text-emerald-600">\.2M</p>
                  </div>
                  <div className="p-6 bg-muted rounded-xl border text-center">
                    <p className="text-sm text-muted-foreground/70 mb-2">Active Cases</p>
                    <p className="text-3xl font-bold text-foreground">14</p>
                  </div>
                  <div className="p-6 bg-muted rounded-xl border text-center">
                    <p className="text-sm text-muted-foreground/70 mb-2">Retained Firms</p>
                    <p className="text-3xl font-bold text-foreground">8</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">How it Works</h3>
                  <p className="text-muted-foreground">
                    A portion of every Defense Klaus subscription goes into the central Legal Defense Fund. If a member with an active bracelet is assaulted, stalked, or harassed, they do not have to pay out of pocket to file a restraining order or pursue civil litigation. The platform retains the law firm on their behalf.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="response">
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-red-800">
                  <Radio className="h-6 w-6 text-red-600" />
                  The Underground Railroad
                </CardTitle>
                <CardDescription className="text-red-600/80">
                  Community-powered crisis extraction.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-red-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-900 mb-2">Become an Extraction Node</h3>
                  <p className="text-red-700 max-w-md mx-auto mb-6">
                    Verified members can volunteer to be "Extraction Nodes." If a Defense Klaus user triggers an emergency in your area, you receive a silent ping to provide immediate safe harbor or transportation.
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Apply for Verification
                  </Button>
                  <p className="text-xs text-red-500 mt-4">Requires Level 3 Background Check and 6-Person Verification.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
