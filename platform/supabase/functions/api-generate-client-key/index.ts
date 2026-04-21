import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { project_id, credential_name, client_subdomain } = await req.json();

    if (!project_id || !credential_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user owns the project
    const { data: project } = await supabaseClient
      .from('projects')
      .select('owner_id')
      .eq('id', project_id)
      .single();

    if (!project || project.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized - not project owner' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate API key using service role client for the function
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: apiKey } = await supabase.rpc('generate_api_key');

    // Create credential with client subdomain in allowed origins
    const siteHost = Deno.env.get('SITE_URL') ? new URL(Deno.env.get('SITE_URL')!).hostname : 'lianabanyan.com';
    const allowedOrigins = client_subdomain
      ? [`https://${client_subdomain}.${siteHost}`, `https://${client_subdomain}`]
      : ['*'];

    const { data: credential, error: credError } = await supabase
      .from('xml_access_credentials')
      .insert({
        credential_name: `${credential_name} (Client Instance)`,
        api_key: apiKey,
        project_id,
        allowed_origins: allowedOrigins,
        is_active: true
      })
      .select()
      .single();

    if (credError) throw credError;

    return new Response(JSON.stringify({
      api_key: credential.api_key,
      credential_id: credential.id,
      message: 'Client API key generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in api-generate-client-key:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
