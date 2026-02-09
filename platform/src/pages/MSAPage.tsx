import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Heart, TrendingUp } from "lucide-react";
import MSAContributionCard from "@/components/MSAContributionCard";

export default function MSAPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-8 w-8 text-amber-500" />
        <div>
          <h1 className="text-3xl font-bold">Medical Savings Account (MSA)</h1>
          <p className="text-muted-foreground">
            Save for healthcare with LB matching your contributions
          </p>
        </div>
      </div>

      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-yellow-500/10">
        <CardHeader>
          <CardTitle>What is the MSA Initiative?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            The Medical Savings Account (MSA) initiative helps LianaBanyan members save for medical expenses
            by automatically contributing a percentage of their earnings to a dedicated healthcare fund.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-amber-500" />
                How It Works
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Choose your contribution percentage (min 1% of earnings)</li>
                <li>LB matches your contribution from organizational profits</li>
                <li>Funds accumulate in your personal MSA</li>
                <li>Use for any medical expenses when needed</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                Benefits
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>LB doubles your contribution with matching funds</li>
                <li>Tax-advantaged healthcare savings</li>
                <li>Build emergency medical fund over time</li>
                <li>Part of LB's commitment to member wellbeing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">My MSA Account</TabsTrigger>
          <TabsTrigger value="history">Contribution History</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <MSAContributionCard />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contribution History</CardTitle>
              <CardDescription>Track your MSA contributions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Contribution history will appear here once you start earning and contributing.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
