import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingDown, ShieldCheck, Link as LinkIcon, Users, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

import { LarkWrapper } from '@/components/builder/LarkWrapper';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function BusinessCardPortal() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout>
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-6 border-b border-slate-300 pb-12">
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 mb-4">
            "Do It Here Instead"
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
            The Cooperative Business Card
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            You can design and order business cards anywhere. But if you do it here, you unlock volume discounts, verified provenance, and guaranteed fulfillment.
          </p>
        </div>

        {/* The Pitch */}
        <div className="grid md:grid-cols-2 gap-8">
          <LarkWrapper componentId="biz-card-volume" bountyCredits={150}>
            <Card className="bg-white border-0 shadow-xl h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <TrendingDown className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl">The 6 Production Levels</CardTitle>
                <CardDescription className="text-base mt-2">
                  We pool orders together to hit massive volume discounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-600">
                <p>
                  When you place an order for physical QR Medallion Brand Deck Cards, you set your timeframe.
                  You can actively see how many other orders are in the pipeline.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span>Level 1 (Need it tomorrow)</span>
                    <span className="font-medium">$0.50 / card</span>
                  </li>
                  <li className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span>Level 3 (Need it next week)</span>
                    <span className="font-medium">$0.25 / card</span>
                  </li>
                  <li className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                    <span className="text-green-700 font-medium">Level 6 (Pooled Volume)</span>
                    <span className="text-green-700 font-bold">$0.05 / card</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </LarkWrapper>

          <LarkWrapper componentId="biz-card-collateral" bountyCredits={200}>
            <Card className="bg-slate-900 text-slate-100 border-0 shadow-xl h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-2xl">Captain-Backed Fulfillment</CardTitle>
                <CardDescription className="text-slate-400 text-base mt-2">
                  No scams. No missing orders. Guaranteed by collateral.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-300">
                <p>
                  To place a pooled order, a <strong>Captain</strong> must stamp the Order Assignment Contract with their QR Brand on the Immutable Ledger.
                </p>
                <div className="p-4 bg-blue-950/50 rounded-lg border border-blue-900/50">
                  <h4 className="font-semibold text-blue-400 mb-2">The Collateral Lock</h4>
                  <p className="text-sm">
                    The Captain must put up their own Marks (backed by Joules) equal to the total order value.
                    If the order is not delivered and confirmed by the recipients in the specified timeframe,
                    the Captain's backing Joules are forfeited to the buyers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </LarkWrapper>
        </div>

        {/* The Portfolio Link */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 flex-shrink-0 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-slate-200">
              <CreditCard className="w-12 h-12 text-slate-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">More Than Just Paper</h3>
              <p className="text-slate-600">
                Your physical card features your QR Medallion. When scanned, it links directly to your
                Liana Banyan Portfolio — a mini-site included in your $5/year membership.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" /> Digital Portfolio
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> Network Integration
                </Badge>
              </div>
            </div>
            <Button size="lg" className="w-full md:w-auto shrink-0">
              Start Your Order <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

      </div>
    </PortalPageLayout>
  );
}
