/**
 * AccountTypeSettings
 * Scope 27: Account type selector (Personal / Business / Professional)
 * Scope 28: LinkedIn OAuth connection for credential verification
 *
 * Admin note for Supabase: enable LinkedIn (linkedin_oidc) as an OAuth provider
 * in the Supabase Auth dashboard -- requires a LinkedIn app client ID + secret
 * from https://www.linkedin.com/developers/
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Briefcase, Star, Linkedin, CheckCircle, AlertCircle } from 'lucide-react';

type AccountType = 'personal' | 'business' | 'professional';

interface AccountRow {
  account_type: AccountType;
  linkedin_verified: boolean;
  linkedin_headline: string | null;
}

const ACCOUNT_TYPES: { value: AccountType; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: 'personal',
    label: 'Personal',
    description: 'Individual cooperative member.',
    icon: User,
  },
  {
    value: 'business',
    label: 'Business',
    description: 'Organization or company account.',
    icon: Briefcase,
  },
  {
    value: 'professional',
    label: 'Professional (Guild Master)',
    description: 'Guild Master tier -- verified professional with elevated cooperative standing.',
    icon: Star,
  },
];

export function AccountTypeSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [row, setRow] = useState<AccountRow>({ account_type: 'personal', linkedin_verified: false, linkedin_headline: null });
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles' as never)
      .select('account_type, linkedin_verified, linkedin_headline')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRow(data as AccountRow);
        setLoading(false);
      });
  }, [user]);

  const saveAccountType = async (value: AccountType) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles' as never)
      .update({ account_type: value } as never)
      .eq('id', user.id);
    if (error) {
      toast({ title: 'Error saving account type', description: error.message, variant: 'destructive' });
    } else {
      setRow(r => ({ ...r, account_type: value }));
      toast({ title: 'Account type updated' });
    }
    setSaving(false);
  };

  const connectLinkedIn = async () => {
    setConnecting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc' as never,
      options: {
        redirectTo: `${window.location.origin}/settings/profile?linkedin_callback=1`,
        scopes: 'openid profile email',
      },
    });
    if (error) {
      toast({
        title: 'LinkedIn connection failed',
        description: error.message.includes('provider')
          ? 'LinkedIn OAuth is not yet enabled in the Supabase dashboard. An admin must add the LinkedIn OIDC provider (client ID + secret from https://www.linkedin.com/developers/).'
          : error.message,
        variant: 'destructive',
      });
      setConnecting(false);
    }
    // On success: page redirects to LinkedIn, then back via the callback URL.
  };

  if (loading) return null;

  const selectedCfg = ACCOUNT_TYPES.find(t => t.value === row.account_type) || ACCOUNT_TYPES[0];
  const SelectedIcon = selectedCfg.icon;

  return (
    <div className="space-y-4">
      {/* Account Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SelectedIcon className="h-4 w-4" />
            Account Type
          </CardTitle>
          <CardDescription>
            Choose how your cooperative membership is classified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={row.account_type} onValueChange={(v) => saveAccountType(v as AccountType)} disabled={saving}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_TYPES.map(t => {
                const Icon = t.icon;
                return (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{selectedCfg.description}</p>
          <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            <strong>Note:</strong> Marks represent your participation in the cooperative -- not equity, shares, or investment returns.
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn Credential Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Linkedin className="h-4 w-4 text-blue-600" />
            LinkedIn Verified Credential
          </CardTitle>
          <CardDescription>
            Connect your LinkedIn profile to earn an instant professional credential badge on your member profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {row.linkedin_verified ? (
            <div className="space-y-2">
              <Badge className="bg-blue-100 text-blue-800 gap-1">
                <CheckCircle className="h-3 w-3" /> LinkedIn Verified
              </Badge>
              {row.linkedin_headline && (
                <p className="text-sm text-muted-foreground italic">{row.linkedin_headline}</p>
              )}
              <p className="text-xs text-muted-foreground">Your LinkedIn profile is connected. The verified badge appears on your public member profile.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-md p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  LinkedIn OAuth requires admin setup in the Supabase dashboard (LinkedIn OIDC provider, client ID + secret). If the button below fails, contact the cooperative admin.
                </span>
              </div>
              <Button
                variant="outline"
                className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={connectLinkedIn}
                disabled={connecting}
              >
                <Linkedin className="h-4 w-4" />
                {connecting ? 'Connecting...' : 'Connect LinkedIn'}
              </Button>
              <p className="text-xs text-muted-foreground">
                We store only your name and headline. We do not access your connections or post on your behalf.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
