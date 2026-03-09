import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe2, Key, ArrowRight, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DurinsDoor() {
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === 'friend' || password.toLowerCase() === 'mellon') {
      setIsOpen(true);
      toast({
        title: "The Door Opens",
        description: "Welcome to the Hall of Records.",
      });
    } else {
      toast({
        title: "The Door Remains Shut",
        description: "Speak friend and enter.",
        variant: "destructive"
      });
    }
  };

  if (isOpen) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 flex flex-col items-center justify-center">
        <div className="max-w-3xl text-center space-y-8 animate-in fade-in zoom-in duration-1000">
          <Unlock className="w-20 h-20 mx-auto text-amber-500" />
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-amber-400">
            The Hall of Records
          </h1>
          <p className="text-xl text-slate-300">
            You have bypassed the standard onboarding. Welcome to the international staging ground and the immutable ledger.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-12 text-left">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-400">
                  <Globe2 className="w-5 h-5" />
                  International Portal
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm space-y-4">
                <p>
                  Liana Banyan is designed to cross borders without friction. The 12 Cities are global. 
                </p>
                <Button variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-950">
                  Select Language / Region
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-400">
                  <Key className="w-5 h-5" />
                  Code Breaker Bounties
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm space-y-4">
                <p>
                  You found the hidden door. Now find the bugs. We pay Credits for verified vulnerabilities and architectural improvements.
                </p>
                <Button variant="outline" className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-950">
                  View Active Bounties
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        
        <Lock className="w-16 h-16 mx-auto text-slate-700" />
        
        <div className="space-y-2">
          <h1 className="text-3xl font-serif tracking-widest text-slate-400">
            DURIN'S DOOR
          </h1>
          <p className="text-slate-600 font-serif italic">
            "Speak friend and enter."
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-8">
          <Input 
            type="password"
            placeholder="Enter the word..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-slate-900 border-slate-800 text-center text-lg tracking-widest focus:border-slate-600 transition-colors"
          />
          <Button type="submit" variant="ghost" className="text-slate-500 hover:text-slate-300">
            Speak
          </Button>
        </form>

      </div>
    </div>
  );
}
