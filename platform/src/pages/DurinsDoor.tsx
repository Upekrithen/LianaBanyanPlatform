import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe2, Languages, Key, ArrowRight, ShieldCheck, Search, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export default function DurinsDoor() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [passphrase, setPassphrase] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.toLowerCase() === "speak friend and enter" || passphrase.toLowerCase() === "mellon") {
      setIsUnlocking(true);
      setTimeout(() => {
        setIsUnlocking(false);
        toast({
          title: "Durin's Door Unlocked",
          description: "Welcome to the International Translation Hub.",
        });
        navigate('/salt-mines'); // Or wherever the hidden translation bounties live
      }, 1500);
    } else {
      toast({
        title: "The door remains shut.",
        description: "That is not the correct phrase.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-800 rounded-full text-slate-100">
          <Globe2 className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Durin's Door</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            The International Portal & Translation Hub.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: The Steganographic Door */}
        <div className="space-y-6">
          <Card className="border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50">
            <CardHeader className="text-center pb-2">
              <Key className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <CardTitle className="text-2xl font-serif tracking-widest text-slate-700 dark:text-slate-300">
                The Doors of Durin
              </CardTitle>
              <CardDescription className="text-base mt-2 font-mono">
                "Speak friend and enter."
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-6">
              <form onSubmit={handleUnlock} className="space-y-4">
                <div className="relative">
                  <Input 
                    type="password"
                    placeholder="Enter the passphrase..." 
                    className="text-center text-lg tracking-widest bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                  disabled={isUnlocking || !passphrase}
                >
                  {isUnlocking ? "Unlocking..." : "Push the Stone"}
                </Button>
              </form>
              <p className="text-xs text-center text-slate-500 mt-4">
                A hidden entry point for Code Breakers and VIPs. If you don't know the password, you can still help translate below.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Translation Bounties */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-6 w-6 text-blue-500" />
                Translation Bounties
              </CardTitle>
              <CardDescription>
                Help us localize the 9 Economic Laws and the Yggdrasil architecture. Earn Marks for verified translations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-slate-400" />
                <Input placeholder="Search languages (e.g., Spanish, Mandarin, Hindi)..." className="h-8" />
              </div>

              {[
                { lang: "Spanish (es-MX)", doc: "The 9 Economic Laws", bounty: 500, status: "Open" },
                { lang: "French (fr-FR)", doc: "A Considered Approach...", bounty: 800, status: "Open" },
                { lang: "Mandarin (zh-CN)", doc: "The Little Red Hen Animation", bounty: 300, status: "In Progress" },
              ].map((bounty, i) => (
                <div key={i} className="p-3 border rounded-lg hover:border-blue-300 transition-colors flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-slate-400" />
                      {bounty.doc}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Target: {bounty.lang}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">{bounty.bounty} Marks</div>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {bounty.status}
                    </Badge>
                  </div>
                </div>
              ))}

            </CardContent>
            <CardFooter>
              <Button className="w-full gap-2" variant="outline" onClick={() => navigate('/salt-mines')}>
                View All Translation Bounties <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}