import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting daily EOI credit conversion...')

    // Call the enhanced conversion function with vesting
    const { error: conversionError } = await supabase.rpc('convert_eoi_credits_with_vesting')

    if (conversionError) {
      console.error('Error converting EOI credits:', conversionError)
      throw conversionError
    }

    // Get users who need reminders
    const { data: reminders, error: reminderError } = await supabase.rpc('check_eoi_reminders')

    if (reminderError) {
      console.error('Error checking reminders:', reminderError)
      throw reminderError
    }

    console.log(`Converted EOI credits. ${reminders?.length || 0} reminders needed.`)

    // Update reminder timestamps
    if (reminders && reminders.length > 0) {
      const userIds = reminders.map((r: any) => r.user_id)
      await supabase
        .from('user_credits')
        .update({ eoi_reminder_sent_at: new Date().toISOString() })
        .in('user_id', userIds)
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversions_processed: true,
        reminders_needed: reminders?.length || 0,
        reminder_users: reminders
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in EOI conversion:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
