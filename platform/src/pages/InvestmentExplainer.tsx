import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROICalculator } from "@/components/ROICalculator";
import { ConversionFlowDiagram } from "@/components/ConversionFlowDiagram";
import { ArrowRight, TrendingUp, Clock, DollarSign, Award } from "lucide-react";

const InvestmentExplainer = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Investment Guide</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Understanding how Kickstarter pledges become equity shares and maximize your returns
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Flow</TabsTrigger>
          <TabsTrigger value="calculator">ROI Calculator</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6" />
                What is a Convertible Note?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                A convertible note is a short-term debt instrument that converts into equity. In Liana Banyan, 
                your Kickstarter pledge acts as a convertible note that can transform into project ownership shares.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-primary/20">
                  <CardHeader>
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Time Commitment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Choose how long you'll wait for returns. Longer commitment = more equity, higher ROI potential.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <TrendingUp className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Equity Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Percentage that converts to shares. Ranges from 10% (short) to 90% (long commitment).
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <DollarSign className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Cash Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Remainder as product credit. Ranges from 90% (short) to 10% (long commitment).
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Formula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-6 rounded-lg font-mono text-sm">
                <div className="space-y-2">
                  <div>Equity % = Investment Amount ÷ (Project Valuation × Discount Rate)</div>
                  <div className="text-muted-foreground">where:</div>
                  <div className="ml-4">• Earlier commitment = Lower valuation = More shares</div>
                  <div className="ml-4">• Higher equity ratio = More conversion to shares</div>
                  <div className="ml-4">• Project growth = Share value increases</div>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Why Early Commitment Wins
                </p>
                <p className="text-sm text-muted-foreground">
                  Early investors get shares at the project's starting valuation. As the project succeeds 
                  and valuation grows, your ownership percentage stays the same, but the value of each share 
                  multiplies. Late investors buy at higher valuations with fewer shares for the same investment.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Flow Tab */}
        <TabsContent value="conversion" className="space-y-6">
          <ConversionFlowDiagram />
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <ROICalculator />
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid gap-6">
            {/* Scenario 1: Early Bird */}
            <Card className="border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">
                  Scenario 1: Early Bird Investor
                </CardTitle>
                <CardDescription>180-day commitment (Maximum equity path)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Initial Investment</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Kickstarter pledge: $500</li>
                      <li>• Time commitment: 180 days</li>
                      <li>• Equity ratio: 90%</li>
                      <li>• Cash ratio: 10%</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Conversion</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• $450 → Equity shares</li>
                      <li>• $50 → Product credits</li>
                      <li>• Project valuation: $10,000</li>
                      <li>• Ownership: 4.5%</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    After 1 Year: Project Growth
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>• Project valuation grows to: $100,000</p>
                    <p>• Your 4.5% ownership = <span className="font-bold text-green-600">$4,500</span></p>
                    <p className="font-bold text-lg mt-2">ROI: 9x return (900% gain)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenario 2: Balanced Investor */}
            <Card className="border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-600 dark:text-blue-400">
                  Scenario 2: Balanced Investor
                </CardTitle>
                <CardDescription>90-day commitment (Moderate equity/cash split)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Initial Investment</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Kickstarter pledge: $500</li>
                      <li>• Time commitment: 90 days</li>
                      <li>• Equity ratio: 50%</li>
                      <li>• Cash ratio: 50%</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Conversion</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• $250 → Equity shares</li>
                      <li>• $250 → Product credits</li>
                      <li>• Project valuation: $30,000</li>
                      <li>• Ownership: 0.83%</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    After 1 Year: Project Growth
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>• Project valuation grows to: $100,000</p>
                    <p>• Your 0.83% ownership = <span className="font-bold text-blue-600">$830</span></p>
                    <p>• Plus $250 product credits</p>
                    <p className="font-bold text-lg mt-2">ROI: 3.32x return (232% gain)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenario 3: Quick Exit */}
            <Card className="border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-amber-600 dark:text-amber-400">
                  Scenario 3: Quick Exit Investor
                </CardTitle>
                <CardDescription>30-day commitment (Minimum equity, maximum cash)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Initial Investment</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Kickstarter pledge: $500</li>
                      <li>• Time commitment: 30 days</li>
                      <li>• Equity ratio: 10%</li>
                      <li>• Cash ratio: 90%</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Conversion</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• $50 → Equity shares</li>
                      <li>• $450 → Product credits</li>
                      <li>• Project valuation: $50,000</li>
                      <li>• Ownership: 0.1%</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    After 1 Year: Project Growth
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>• Project valuation grows to: $100,000</p>
                    <p>• Your 0.1% ownership = <span className="font-bold text-amber-600">$100</span></p>
                    <p>• Plus $450 product credits</p>
                    <p className="font-bold text-lg mt-2">ROI: 2x return on equity portion only (100% gain)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Summary */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>Investment Strategy Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Strategy</th>
                      <th className="text-right p-2">Initial</th>
                      <th className="text-right p-2">Equity</th>
                      <th className="text-right p-2">Credits</th>
                      <th className="text-right p-2">Final Value</th>
                      <th className="text-right p-2">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium text-green-600">Early Bird</td>
                      <td className="text-right p-2">$500</td>
                      <td className="text-right p-2">$4,500</td>
                      <td className="text-right p-2">$50</td>
                      <td className="text-right p-2 font-bold">$4,550</td>
                      <td className="text-right p-2 font-bold text-green-600">9x</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium text-blue-600">Balanced</td>
                      <td className="text-right p-2">$500</td>
                      <td className="text-right p-2">$830</td>
                      <td className="text-right p-2">$250</td>
                      <td className="text-right p-2 font-bold">$1,080</td>
                      <td className="text-right p-2 font-bold text-blue-600">3.3x</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium text-amber-600">Quick Exit</td>
                      <td className="text-right p-2">$500</td>
                      <td className="text-right p-2">$100</td>
                      <td className="text-right p-2">$450</td>
                      <td className="text-right p-2 font-bold">$550</td>
                      <td className="text-right p-2 font-bold text-amber-600">2x*</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                *ROI on equity portion only. Credits maintain original value.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentExplainer;
