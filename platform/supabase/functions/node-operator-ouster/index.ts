// node-operator-ouster · BP085 · Founder-approved MVP schema
// Accepts BP082 vote result → demotes node_operator_status = false (never deletes, never exiles)
// v2 deferred: ouster_pending state

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

    const { user_id, vote_record_id, vote_tier, vote_passed } = await req.json()

    if (!user_id || !vote_record_id || !vote_passed) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }

    // Demote — set node_operator_status = false (NEVER delete, NEVER exile — BP082 ouster canon)
    const { error } = await supabase
      .from('hiring_directors')
      .update({
        node_operator_status: false,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', user_id)

    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      action: 'DEMOTED',
      user_id,
      vote_record_id,
      note: 'Ouster = demote not exile · voluntary handoff keeps Marks + rep (BP082)'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
})
