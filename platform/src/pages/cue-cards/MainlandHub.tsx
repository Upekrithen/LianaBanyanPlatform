import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Landmark, Scale, Shield, ArrowRight, Map, MapPin } from "lucide-react";
import { useNavigate } from 'react-router-dom';

import { LarkWrapper } from '@/components/builder/LarkWrapper';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function MainlandHub() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout>
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-6 border-b border-slate-800 pb-12">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4">
            The Staging Area
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-100">
            The Mainland
          </h1>
          <p className="text-2xl text-slate-400 font-light max-w-3xl mx-auto">
            The 12 Cities Megalopolis. This is where the cooperative economy is governed, structured, and staged before venturing into the 7 Islands.
          </p>
        </div>

        {/* The Core Hubs */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          <LarkWrapper componentId="mainland-tower-of-peace" bountyCredits={100}>
            <Card className="bg-slate-900 border-slate-800 hover:border-amber-500/50 transition-all h-full flex flex-col cursor-pointer" onClick={() => navigate('/tower-of-peace')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                  <Landmark className="w-6 h-6 text-amber-500" />
                </div>
                <CardTitle className="text-xl text-slate-100">The Tower of Peace</CardTitle>
                <CardDescription className="text-slate-400">
                  The intellectual staging area. Home to the 9 Economic Laws and Academic Peer Review.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-6">
                <div className="text-amber-500 text-sm font-medium flex items-center">
                  Enter the Tower <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </LarkWrapper>

          <LarkWrapper componentId="mainland-senate" bountyCredits={100}>
            <Card className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-all h-full flex flex-col cursor-pointer" onClick={() => navigate('/senate')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Scale className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle className="text-xl text-slate-100">The Hexagon Senate</CardTitle>
                <CardDescription className="text-slate-400">
                  The governance hub. Where The 300 gather to vote, propose changes, and manage the DNA Lock.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-6">
                <div className="text-purple-500 text-sm font-medium flex items-center">
                  Enter the Senate <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </LarkWrapper>

          <LarkWrapper componentId="mainland-larder" bountyCredits={100}>
            <Card className="bg-slate-900 border-slate-800 hover:border-green-500/50 transition-all h-full flex flex-col cursor-pointer" onClick={() => navigate('/initiatives')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle className="text-xl text-slate-100">The Main Larder</CardTitle>
                <CardDescription className="text-slate-400">
                  The distribution center for the 16 Charitable Initiatives. Where the 20% margin goes to work.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-6">
                <div className="text-green-500 text-sm font-medium flex items-center">
                  View Initiatives <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </LarkWrapper>

          <LarkWrapper componentId="mainland-salt-mines" bountyCredits={100}>
            <Card className="bg-slate-900 border-slate-800 hover:border-orange-500/50 transition-all h-full flex flex-col cursor-pointer" onClick={() => navigate('/salt-mines')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-orange-500" />
                </div>
                <CardTitle className="text-xl text-slate-100">The Salt Mines</CardTitle>
                <CardDescription className="text-slate-400">
                  The centralized hub for work offerings, job postings, and bounties.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-6">
                <div className="text-orange-500 text-sm font-medium flex items-center">
                  Find Work <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </LarkWrapper>

          <LarkWrapper componentId="mainland-hall-of-records" bountyCredits={100}>
            <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-all h-full flex flex-col cursor-pointer" onClick={() => navigate('/hall-of-records')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="text-xl text-slate-100">The Hall of Records</CardTitle>
                <CardDescription className="text-slate-400">
                  Home to the 16 Patent Pedestals and the Immutable IP Ledger.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-6">
                <div className="text-blue-500 text-sm font-medium flex items-center">
                  View Patents <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </LarkWrapper>

          <LarkWrapper componentId="mainland-islands-gateway" bountyCredits={100}>
            <Card className="bg-slate-900 border-slate-800 hover:border-cyan-500/50 transition-all h-full flex flex-col cursor-pointer" onClick={() => navigate('/hexisle')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                  <Map className="w-6 h-6 text-cyan-500" />
                </div>
                <CardTitle className="text-xl text-slate-100">Gateway to the 7 Islands</CardTitle>
                <CardDescription className="text-slate-400">
                  Leave the Mainland and enter the Proving Grounds: Harvest, Navigate, Engineer, Battle, Seek, Magic, and Train.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-6">
                <div className="text-cyan-500 text-sm font-medium flex items-center">
                  To the Islands <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </LarkWrapper>

        </div>
      </div>
    </PortalPageLayout>
  );
}
