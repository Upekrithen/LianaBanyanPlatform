import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { detectPortal } from '@/utils/portalDetector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { z } from 'zod';

export default function Auth() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const emailSchema = z.string().email(t('auth.validation.invalidEmail'));
  const passwordSchema = z.string().min(6, t('auth.validation.passwordTooShort'));

  // Where to go after auth — check if there's a stored return path
  const getReturnPath = () => {
    const storedPath = sessionStorage.getItem('lb_auth_return_path');
    if (storedPath && storedPath !== '/auth') {
      sessionStorage.removeItem('lb_auth_return_path');
      return storedPath;
    }
    return null;
  };

  const portal = detectPortal();
  const defaultPostAuth = portal === 'upekrithen' ? '/' : '/dashboard';

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) {
        const returnPath = getReturnPath();
        navigate(returnPath || defaultPostAuth, { replace: true });
      }
    });
    return () => { cancelled = true; };
  }, [navigate, defaultPostAuth]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      
      if (!fullName.trim()) {
        toast.error(t('auth.validation.enterFullName'));
        return;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    setLoading(false);

    if (error) {
      toast.error(t('auth.error.signUp'));
    } else {
      toast.success(t('auth.success.signUp'));

      const returnPath = getReturnPath();
      setTimeout(() => {
        if (returnPath) {
          navigate(returnPath, { replace: true });
        } else if (portal === 'upekrithen') {
          navigate('/', { replace: true });
        } else {
          const domain = email.split('@')[1]?.toLowerCase();
          if (domain === 'stanford.edu' || domain === 'harvard.edu' || domain === 'mit.edu') {
            navigate('/tower-of-peace');
          } else if (domain === 'craigslist.org') {
            navigate('/redcarpet/craig-newmark');
          } else if (domain === 'ycombinator.com') {
            navigate('/redcarpet/michael-seibel');
          } else {
            navigate('/dashboard');
          }
        }
      }, 1000);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(t('auth.error.signIn'));
    } else {
      toast.success(t('auth.success.signIn'));

      const returnPath = getReturnPath();
      if (returnPath) {
        navigate(returnPath, { replace: true });
      } else if (portal === 'upekrithen') {
        navigate('/', { replace: true });
      } else {
        const domain = email.split('@')[1]?.toLowerCase();
        if (domain === 'stanford.edu' || domain === 'harvard.edu' || domain === 'mit.edu') {
          navigate('/tower-of-peace');
        } else if (domain === 'craigslist.org') {
          navigate('/redcarpet/craig-newmark');
        } else if (domain === 'ycombinator.com') {
          navigate('/redcarpet/michael-seibel');
        } else {
          navigate('/dashboard');
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t('auth.title')}</CardTitle>
          <CardDescription className="text-center">
            {t('auth.subtitle', 'Sign in to access your dashboard')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t('auth.email')}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder={t('auth.enterEmail')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">{t('auth.password')}</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.signingIn') : t('auth.signInButton')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{t('auth.fullName')}</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={t('auth.enterFullName')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('auth.email')}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t('auth.enterEmail')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('auth.password')}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.signingUp') : t('auth.signUpButton')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
