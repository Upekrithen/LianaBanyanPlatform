import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, CheckCircle2, Clock, ShieldAlert, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerificationStatus {
  personal: { email: string; status: 'pending' | 'verified' }[];
  community: { id: string; status: 'pending' | 'verified' }[];
}

export const SixPersonVerification: React.FC<{ applicationId: string }> = ({ applicationId }) => {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [status, setStatus] = useState<VerificationStatus>({
    personal: [
      { email: 'sarah.j@example.com', status: 'verified' },
      { email: 'mike.t@example.com', status: 'pending' }
    ],
    community: [
      { id: 'user_123', status: 'verified' },
      { id: 'user_456', status: 'pending' },
      { id: 'user_789', status: 'pending' }
    ]
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    if (status.personal.length >= 3) {
      toast({
        title: "Limit Reached",
        description: "You have already invited 3 personal contacts.",
        variant: "destructive"
      });
      return;
    }

    setStatus(prev => ({
      ...prev,
      personal: [...prev.personal, { email: inviteEmail, status: 'pending' }]
    }));
    setInviteEmail('');
    
    toast({
      title: "Invite Sent",
      description: `Verification invite sent to ${inviteEmail}`,
    });
  };

  const personalVerified = status.personal.filter(p => p.status === 'verified').length;
  const communityVerified = status.community.filter(c => c.status === 'verified').length;

  return (
    <Card className="w-full border-2 border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Six-Person Verification
            </CardTitle>
            <CardDescription>
              Distributed trust without centralized background checks.
            </CardDescription>
          </div>
          <Badge variant={personalVerified + communityVerified === 6 ? "default" : "secondary"}>
            {personalVerified + communityVerified} / 6 Verified
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-8">
        
        {/* Personal Network */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-500" />
              Personal Network (3 Required)
            </h4>
            <span className="text-sm font-medium text-slate-500">{personalVerified}/3</span>
          </div>
          <p className="text-sm text-slate-500">
            Invite 3 people who know you in real life to vouch for your identity and character.
          </p>
          
          <form onSubmit={handleInvite} className="flex gap-2">
            <Input 
              type="email" 
              placeholder="Enter email address..." 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={status.personal.length >= 3}
            />
            <Button type="submit" disabled={status.personal.length >= 3 || !inviteEmail}>
              <Mail className="h-4 w-4 mr-2" /> Invite
            </Button>
          </form>

          <div className="space-y-2">
            {status.personal.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <span className="text-sm font-medium">{p.email}</span>
                {p.status === 'verified' ? (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><CheckCircle2 className="h-3 w-3 mr-1" /> Verified</Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
                )}
              </div>
            ))}
            {status.personal.length === 0 && (
              <div className="text-center py-4 text-sm text-slate-500 border border-dashed rounded-lg">
                No personal invites sent yet.
              </div>
            )}
          </div>
        </div>

        {/* Community Network */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-blue-500" />
              Community Review (3 Required)
            </h4>
            <span className="text-sm font-medium text-slate-500">{communityVerified}/3</span>
          </div>
          <p className="text-sm text-slate-500">
            Three random, verified community members are reviewing your application and scenario responses. You do not need to do anything for this step.
          </p>
          
          <div className="space-y-2">
            {status.community.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <span className="text-sm font-medium text-slate-600">Community Member #{i + 1}</span>
                {c.status === 'verified' ? (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-500"><Clock className="h-3 w-3 mr-1" /> Reviewing</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
