import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ship, Hammer, Globe2, ArrowRight, ShieldCheck } from "lucide-react";

export default function Canada40K() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-6">
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            The Rescue Fleet
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Canada just canceled 40,000 startup visas.
          </h1>
          <p className="text-2xl text-slate-600 max-w-3xl">
            We are recruiting stranded entrepreneurs to build infrastructure they actually own. They need a platform. We need builders. The alignment is obvious.
          </p>
        </div>

        {/* The Problem / Solution */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Globe2 className="h-6 w-6 text-slate-400" />
                The Broken Promise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600">
              <p>
                Some came from India. Some from Pakistan. Some from Nigeria. They came because Canada promised a path: build a company, create jobs, become Canadian. Then Canada changed its mind.
              </p>
              <p>
                The Canada 40K crisis exposes something broken in how we think about entrepreneurship. International founders have few pathways to participate in the global economy without being extracted from.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-red-950 text-red-50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2 text-red-100">
                <Ship className="h-6 w-6 text-red-400" />
                The Rescue Fleet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-red-200/80">
              <p>
                Liana Banyan is launching a Rescue Fleet. We don't offer visas, but we offer something better: <strong>Ownership.</strong>
              </p>
              <p>
                Whether you are a developer, an educator, or a restaurant owner, we are building a 12-City Megalopolis. You keep 83.3% of the revenue you generate. The platform margin is permanently locked at Cost + 20%.
              </p>
              <Button className="w-full bg-red-600 hover:bg-red-500 text-white mt-4 border-none">
                Join the Fleet <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">How You Can Build Here</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Hammer className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Developers & Engineers</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Claim bounties to build out the platform infrastructure. Earn Credits and fractional IP participation in the code you write.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <ShieldCheck className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Educators & Creators</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Join the Didasko initiative. Build curriculum and tools for the cooperative economy, retaining 83.3% of the value.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Ship className="h-8 w-8 text-amber-500 mb-2" />
                <CardTitle>Local Operators</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Become a Captain for initiatives like Let's Make Dinner in your local area. You run the operations, you keep the margin.
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
