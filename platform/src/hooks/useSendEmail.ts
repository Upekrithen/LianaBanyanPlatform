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

export function useSendEmail() {
  return useMutation({
    mutationFn: async ({ email, type, data }: SendEmailParams) => {
      const { data: result, error } = await supabase.functions.invoke(
        'send-transactional-email',
        { body: { email, type, data } }
      );
      if (error) throw error;
      return result;
    },
  });
}
