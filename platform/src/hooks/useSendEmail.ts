import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type EmailType =
  | 'welcome'
  | 'pledge_confirmation'
  | 'credit_purchase'
  | 'pledge_cancellation'
  | 'milestone_update'
  | 'project_claimed'
  | 'delivery_confirmation_request'
  | 'contest_entry_received'
  | 'membership_confirmed'
  | 'payout_sent'
  | 'outreach';

interface SendEmailParams {
  email: string;
  type: EmailType;
  data?: Record<string, unknown>;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * K202 (B053): After a successful outreach email, auto-register the recipient
 * in red_carpet_registry so they get Red Carpet access without a code deploy.
 */
async function autoRegisterRedCarpetAccess(
  email: string,
  data?: Record<string, unknown>
): Promise<void> {
  const recipientName = (data?.recipientName as string) || (data?.name as string) || '';
  if (!recipientName) return;

  const slug = generateSlug(recipientName);
  const senderName = (data?.senderName as string) || 'A Liana Banyan member';
  const businessName = (data?.businessName as string) || (data?.organization as string) || '';

  await supabase.from('red_carpet_registry').upsert({
    slug,
    name: recipientName,
    organization: businessName,
    purpose: `Cue Card from ${senderName}`,
    known_emails: [email.toLowerCase()],
    categories: ['cue-card'],
    source: 'cue_card',
    is_active: true,
  }, { onConflict: 'slug' }).then(({ error }) => {
    if (error) console.error('Red carpet auto-register error:', error);
  });
}

export function useSendEmail() {
  return useMutation({
    mutationFn: async ({ email, type, data }: SendEmailParams) => {
      const { data: result, error } = await supabase.functions.invoke(
        'send-transactional-email',
        { body: { email, type, data } }
      );
      if (error) throw error;

      if (type === 'outreach') {
        autoRegisterRedCarpetAccess(email, data).catch(() => {});
      }

      return result;
    },
  });
}
