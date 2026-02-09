import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Radio } from "lucide-react";
import DefenseClawsPreorder from "@/components/DefenseClawsPreorder";
import DefenseClawsCoverageCheck from "@/components/DefenseClawsCoverageCheck";

export default function DefenseClawsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-purple-500" />
        <div>
          <h1 className="text-3xl font-bold">Defense Claws™</h1>
          <p className="text-muted-foreground">
            Personal safety device + Legal Defense Fund for Members
          </p>
        </div>
      </div>

      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/10">
        <CardHeader>
          <CardTitle>What is Defense Claws™?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Defense Claws™ is a $6 personal safety bracelet that provides physical protection AND 
            funds legal defense services for LianaBanyan members. 100% of proceeds go directly to 
            the Legal Defense Fund.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                Product Features
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Bracelet pulls up to become palm claws</li>
                <li>Plastic blades around wrist prevent grasping</li>
                <li>Dull studded edges cut and mark attacker for DNA</li>
                <li>Future: Broadcast monitoring until safe arrival</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Radio className="h-4 w-4 text-purple-500" />
                Legal Defense Coverage
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Sign up anyone with an email (no confirmation sent)</li>
                <li>Coverage activated immediately upon preorder</li>
                <li>Check coverage through LB portal or volunteer line</li>
                <li>Immediate legal services if covered</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="preorder" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preorder">Preorder</TabsTrigger>
          <TabsTrigger value="check">Check Coverage</TabsTrigger>
          <TabsTrigger value="fund">Legal Defense Fund</TabsTrigger>
        </TabsList>

        <TabsContent value="preorder" className="space-y-4">
          <DefenseClawsPreorder />
        </TabsContent>

        <TabsContent value="check" className="space-y-4">
          <DefenseClawsCoverageCheck />
        </TabsContent>

        <TabsContent value="fund" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legal Defense Fund Status</CardTitle>
              <CardDescription>Fund supporting legal services for covered members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Legal Defense Fund statistics and case information will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
