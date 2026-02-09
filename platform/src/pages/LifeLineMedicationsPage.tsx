import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Factory, Heart } from "lucide-react";
import LifeLineMedicationsRequest from "@/components/LifeLineMedicationsRequest";

export default function LifeLineMedicationsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Pill className="h-8 w-8 text-emerald-500" />
        <div>
          <h1 className="text-3xl font-bold">LifeLine Medications</h1>
          <p className="text-muted-foreground">
            Affordable medications through ethical manufacturing
          </p>
        </div>
      </div>

      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/10">
        <CardHeader>
          <CardTitle>What is LifeLine Medications?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            LifeLine Medications is more than a pharmaceutical assistance program—it's a commitment to 
            starting ethical medication production businesses that serve members at cost plus 20%.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Factory className="h-4 w-4 text-emerald-500" />
                Our Approach
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Research and identify needed medications</li>
                <li>Start production businesses for those medications</li>
                <li>Manufacture at ethical costs (cost + 20%)</li>
                <li>Example: affordable insulin production</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-emerald-500" />
                Long-Term Impact
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Not just buying meds—making them affordable</li>
                <li>Sustainable pricing model for members</li>
                <li>Cap on assistance is production capability</li>
                <li>Building healthcare infrastructure for members</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="request" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="request">Request Assistance</TabsTrigger>
          <TabsTrigger value="medications">Available Medications</TabsTrigger>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          <LifeLineMedicationsRequest />
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Medications</CardTitle>
              <CardDescription>Medications we currently produce or are researching</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Medication catalog will appear here as production businesses launch.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Requests</CardTitle>
              <CardDescription>Track your medication assistance requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Your requests will appear here once submitted.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
