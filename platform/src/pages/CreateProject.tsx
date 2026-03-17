import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChalkOutlineOnboarding, CREATOR_INVITE_FIELDS, PRODUCT_PROJECT_FIELDS, ChalkField } from '@/components/ChalkOutlineOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface InviteData {
  id: string;
  creator_handle: string;
  invite_code: string;
  status: string;
}

export default function CreateProject() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const inviteCode = searchParams.get('invite');
  const mode = searchParams.get('mode') || (inviteCode ? 'creator' : 'product');

  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(!!inviteCode);
  const [fields, setFields] = useState<ChalkField[]>(
    mode === 'creator' ? CREATOR_INVITE_FIELDS : PRODUCT_PROJECT_FIELDS
  );

  useEffect(() => {
    if (!inviteCode) { setLoading(false); return; }

    const fetchInvite = async () => {
      const { data, error } = await supabase
        .from('creator_invites' as any)
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (error || !data) {
        toast.error('Invite code not found. You can still create a project.');
        setLoading(false);
        return;
      }

      const invite = data as any as InviteData;
      setInviteData(invite);

      if (invite.status === 'launched') {
        toast.info('This invite has already been used to launch a project.');
      }

      setLoading(false);
    };

    fetchInvite();
  }, [inviteCode]);

  const projectId = inviteCode || (user?.id ? `draft-${user.id}` : `draft-anon-${Date.now()}`);

  const handleSave = useCallback(async (data: Record<string, string>) => {
    try {
      const { error } = await supabase
        .from('project_drafts' as any)
        .upsert({
          id: projectId,
          invite_id: inviteData?.id || null,
          field_data: data,
          progress_percent: Math.round(
            (Object.values(data).filter(v => v.trim().length > 0).length /
             Object.keys(data).length) * 100
          ),
          updated_at: new Date().toISOString(),
        } as any);

      if (error) throw error;
      toast.success('Draft saved to cloud.');
    } catch {
      toast.info('Saved locally. Sign in to save to cloud.');
    }
  }, [projectId, inviteData]);

  const handleLaunch = useCallback(async (data: Record<string, string>) => {
    try {
      const productPayload = {
        title: data.name || data.creator_name || 'Untitled Project',
        description: data.description || data.what_you_make || '',
        category: data.category || data.process || 'Other',
        price: data.price ? parseFloat(data.price) : 0,
        status: 'live',
        creator_id: user?.id || null,
        metadata: {
          source: 'chalk_outline',
          invite_code: inviteCode || null,
          field_data: data,
        },
      };

      const { data: product, error: productError } = await supabase
        .from('products' as any)
        .insert(productPayload as any)
        .select('id')
        .single();

      if (productError) throw productError;

      if (inviteData?.id && product) {
        await supabase
          .from('creator_invites' as any)
          .update({ status: 'launched', project_id: (product as any).id } as any)
          .eq('id', inviteData.id);
      }

      localStorage.removeItem(`chalk-onboard-${projectId}`);
      toast.success('Project launched! Welcome to the cooperative.');
      navigate(`/projects`);
    } catch (err) {
      toast.error('Launch failed. Your draft is saved — try again in a moment.');
      console.error('Launch error:', err);
    }
  }, [user, inviteCode, inviteData, projectId, navigate]);

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading your invite...</p>
        </div>
      </div>
    );
  }

  const preFilledFields = inviteData ? fields.map(f => {
    if (f.id === 'creator_name' && inviteData.creator_handle) {
      return { ...f, placeholder: inviteData.creator_handle };
    }
    if (f.id === 'instagram' && inviteData.creator_handle) {
      return { ...f, placeholder: `@${inviteData.creator_handle}` };
    }
    return f;
  }) : fields;

  return (
    <ChalkOutlineOnboarding
      projectId={projectId}
      fields={preFilledFields}
      onSave={handleSave}
      onLaunch={handleLaunch}
      onClose={handleClose}
      title={inviteData ? `Welcome, ${inviteData.creator_handle}!` : 'Create Your Project'}
      subtitle={inviteData
        ? 'Fill in the chalk outlines to set up your creator profile'
        : 'Fill in the chalk outlines to bring your project to life'
      }
    />
  );
}
