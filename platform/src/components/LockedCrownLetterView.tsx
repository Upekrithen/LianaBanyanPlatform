import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Unlock, Mail, ShieldCheck } from "lucide-react";
import { CROWN_LETTERS } from '@/data/crownLetters';
import { RECIPIENTS } from '@/data/redCarpetRecipients';

interface LockedCrownLetterViewProps {
  recipientId: string;
}

export function LockedCrownLetterView({ recipientId }: LockedCrownLetterViewProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const recipient = RECIPIENTS.find(r => r.id === recipientId);
  const letterContent = CROWN_LETTERS[recipientId];

  if (!recipient || !letterContent) {
    return (
      <Card className="max-w-3xl mx-auto bg-slate-900 border-slate-800">
        <CardContent className="p-8 text-center text-slate-400">
          Letter not found or not yet available for this recipient.
        </CardContent>
      </Card>
    );
  }

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple domain check for demonstration (in a real app, this would use the backend verification)
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (recipient.emailDomains.includes(domain) || recipient.knownEmails?.includes(email.toLowerCase())) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Email domain not recognized for this specific letter. Please use your official organization email.');
    }
  };

  if (!isUnlocked) {
    return (
      <Card className="max-w-2xl mx-auto bg-slate-900 border-amber-500/30 shadow-lg shadow-amber-500/5">
        <CardHeader className="text-center border-b border-slate-800 pb-6">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <CardTitle className="text-2xl text-slate-100">Locked Crown Letter</CardTitle>
          <p className="text-slate-400 mt-2">
            This letter is specifically addressed to <strong>{recipient.name}</strong>.
          </p>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm text-slate-300">
            <p className="mb-2"><strong>Purpose:</strong> {recipient.purpose}</p>
            <p><strong>Category:</strong> {recipient.categoryLabel}</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-1 block">Verify Identity</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input 
                  type="email" 
                  placeholder="Enter your official email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-950 border-slate-700 h-12"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <Button type="submit" className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-semibold">
              Unlock Letter
            </Button>
          </form>
          
          <p className="text-xs text-center text-slate-500">
            This is a secure communication. Access is restricted to recognized domains.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto bg-white text-slate-900 border-0 shadow-2xl">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6 rounded-t-xl flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Verified Access</span>
          </div>
          <CardTitle className="text-2xl font-serif">Crown Letter: {recipient.name}</CardTitle>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="border-amber-200 text-amber-800 bg-amber-50">
            {recipient.crownTitle || recipient.categoryLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-8 md:p-12">
        <div className="prose prose-slate max-w-none prose-headings:font-serif prose-h1:text-3xl prose-h2:text-2xl prose-p:leading-relaxed prose-a:text-blue-600">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {letterContent}
          </ReactMarkdown>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200 flex justify-center">
          <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8">
            Reply to Founder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
