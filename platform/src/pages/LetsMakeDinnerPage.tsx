import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LetsMakeDinnerTable } from "@/components/LetsMakeDinnerTable";
import { CreateMealOfferingDialog } from "@/components/CreateMealOfferingDialog";
import { CharitableLoanAccount } from "@/components/CharitableLoanAccount";
import { Utensils, ChefHat, Heart } from "lucide-react";

export default function LetsMakeDinnerPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("order");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Utensils className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Let's Make Dinner</h1>
          <p className="text-muted-foreground">
            Community-powered meal sharing initiative
          </p>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            About This Initiative
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Let's Make Dinner</strong> connects home cooks with community members who need a meal.
            Whether you're offering your cooking skills or looking for a home-cooked meal, this initiative
            brings people together through food.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                For Meal Providers
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Share your cooking with the community</li>
                <li>Set your own prices and availability</li>
                <li>Build reputation through satisfied recipients</li>
                <li>Earn credits or offset your own meal costs</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                For Meal Recipients
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Browse available meals by date</li>
                <li>Pay immediately or use charitable tab</li>
                <li>Repay from future profits (min 5%)</li>
                <li>Request donation or grant coverage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="order">Order Meals</TabsTrigger>
          <TabsTrigger value="offer">Offer Meals</TabsTrigger>
          <TabsTrigger value="account">My Account</TabsTrigger>
        </TabsList>

        <TabsContent value="order" className="space-y-4">
          <LetsMakeDinnerTable />
        </TabsContent>

        <TabsContent value="offer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a Meal Offering</CardTitle>
              <CardDescription>
                Share your cooking with the community. Set your price, portions, and pickup details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateMealOfferingDialog />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <CharitableLoanAccount />
          
          <Card>
            <CardHeader>
              <CardTitle>Repayment Options</CardTitle>
              <CardDescription>
                Manage how you repay meals on your charitable tab
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Automatic Repayment:</strong> When you earn profits from LB projects,
                  your chosen percentage is automatically deducted and applied to your charitable loan balance.
                </p>
                <p>
                  <strong>Manual Donation:</strong> You can make voluntary payments at any time to reduce your balance faster.
                </p>
                <p>
                  <strong>Grant Requests:</strong> If you're experiencing hardship, you can request grant coverage
                  from your Tribe, Guild, or LB's charitable fund.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
