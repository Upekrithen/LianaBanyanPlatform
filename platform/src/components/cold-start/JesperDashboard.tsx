import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, ShieldCheck, AlertTriangle, MapPin, Key, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Seed data for the Jesper Dashboard — initial demo nominations
const SEED_NOMINATIONS = [
  {
    id: 'nom_1',
    recipient_name: 'The Smith Family',
    address: '123 Maple St, Phoenix AZ',
    reason_card: 'Single mother of three, recently lost her job due to illness. Needs groceries and basic supplies for the month.',
    status: 'pending_review',
    purchaser: 'Anonymous Donor (Purchaser != Deliverer)'
  },
  {
    id: 'nom_2',
    recipient_name: 'David R.',
    address: '456 Oak Ln, Phoenix AZ',
    reason_card: 'Elderly neighbor whose heater broke. Needs the "Household Concierge" emergency repair fund applied.',
    status: 'assigned',
    handshake_code: '4829',
    purchaser: 'Local Care Unit Pool'
  }
];

export const JesperDashboard: React.FC = () => {
  const { toast } = useToast();
  const [nominations, setNominations] = useState(SEED_NOMINATIONS);
  const [deliveryCode, setDeliveryCode] = useState('');

  const handleApprove = (id: string) => {
    // Generate a random 4 digit handshake code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    setNominations(prev => prev.map(n =>
      n.id === id ? { ...n, status: 'assigned', handshake_code: code } : n
    ));

    toast({
      title: "Nomination Approved",
      description: `Handshake code ${code} generated. You are now assigned to deliver.`,
    });
  };

  const handleFlag = (id: string) => {
    setNominations(prev => prev.map(n =>
      n.id === id ? { ...n, status: 'flagged' } : n
    ));
    toast({
      title: "Nomination Flagged",
      description: "Sent to the Harper Guild for secondary review.",
      variant: "destructive"
    });
  };

  const handleConfirmDelivery = (id: string, expectedCode: string) => {
    if (deliveryCode === expectedCode) {
      setNominations(prev => prev.map(n =>
        n.id === id ? { ...n, status: 'delivered' } : n
      ));
      setDeliveryCode('');
      toast({
        title: "Delivery Confirmed!",
        description: "Handshake code verified. Funds released to the merchant.",
      });
    } else if (deliveryCode === '9999') { // Mock Oops code
      toast({
        title: "OOPS CODE TRIGGERED",
        description: "Silent alert sent to Harper Guild. Proceeding normally to avoid escalating the situation.",
        variant: "destructive"
      });
      setDeliveryCode('');
    } else {
      toast({
        title: "Invalid Code",
        description: "The handshake code does not match.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full border-2 border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-rose-500" />
              Jesper Delivery Dashboard
            </CardTitle>
            <CardDescription>
              Santa Ever After Protocol. You are the verified local deliverer.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400">
            Purchaser ≠ Deliverer
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="active">Active Deliveries</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {nominations.filter(n => n.status === 'pending_review').map(nom => (
              <Card key={nom.id} className="border-slate-200 shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{nom.recipient_name}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {nom.address}
                      </p>
                    </div>
                    <Badge variant="secondary">Review Required</Badge>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md text-sm italic border-l-4 border-rose-400">
                    "{nom.reason_card}"
                  </div>

                  <div className="text-xs text-slate-500">
                    Funded by: {nom.purchaser}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleApprove(nom.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <ShieldCheck className="h-4 w-4 mr-2" /> Approve & Generate Code
                    </Button>
                    <Button onClick={() => handleFlag(nom.id)} variant="destructive" className="flex-1">
                      <AlertTriangle className="h-4 w-4 mr-2" /> Flag (Suspected Fraud)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {nominations.filter(n => n.status === 'assigned').map(nom => (
              <Card key={nom.id} className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10 shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{nom.recipient_name}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {nom.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">Handshake Code</p>
                      <Badge variant="outline" className="text-lg font-mono tracking-widest bg-white dark:bg-slate-950">
                        {nom.handshake_code}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-blue-100 dark:border-blue-900">
                    <p className="text-sm font-medium mb-2">Confirm Delivery</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code from recipient..."
                        value={deliveryCode}
                        onChange={(e) => setDeliveryCode(e.target.value)}
                        className="font-mono text-center tracking-widest"
                        maxLength={4}
                      />
                      <Button onClick={() => handleConfirmDelivery(nom.id, nom.handshake_code!)}>
                        Verify
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      The recipient must provide the matching Handshake Code to release the funds. If they provide the "Oops Code", act normal and leave immediately.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {nominations.filter(n => n.status === 'delivered').map(nom => (
              <Card key={nom.id} className="border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-sm opacity-70">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold line-through text-slate-500">{nom.recipient_name}</h4>
                    <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3" /> Delivered Successfully
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-800">
                    Closed
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
};
