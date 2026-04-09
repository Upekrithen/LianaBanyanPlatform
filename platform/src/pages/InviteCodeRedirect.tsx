import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { findRecipientByName } from '@/data/redCarpetRecipients';

export default function InviteCodeRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) { navigate('/RedCarpet'); return; }

    (async () => {
      const { data } = await supabase
        .from('red_carpet_recipients' as never)
        .select('recipient_name, walkthrough_type, personalized_greeting')
        .eq('invite_code', code)
        .eq('is_active', true)
        .limit(1)
        .single() as { data: { recipient_name: string; walkthrough_type: string; personalized_greeting: string } | null };

      if (!data) { setNotFound(true); return; }

      const match = findRecipientByName(data.recipient_name);
      if (match) {
        navigate(`/RedCarpet/${match.id}`, { replace: true });
      } else {
        navigate(`/RedCarpet?invite=${code}`, { replace: true });
      }
    })();
  }, [code, navigate]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Invite Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This invite code may have expired or been used. If you received a letter,
            please email{' '}
            <a href="mailto:Founder@LianaBanyan.com" className="text-primary underline">
              Founder@LianaBanyan.com
            </a>{' '}
            and we'll get you in personally.
          </p>
          <button
            onClick={() => navigate('/RedCarpet')}
            className="text-primary underline"
          >
            Visit the general Red Carpet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground">Loading your walkthrough...</div>
    </div>
  );
}
