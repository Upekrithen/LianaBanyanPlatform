import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = req.headers.get('x-api-key');
    const url = new URL(req.url);
    const projectSku = url.searchParams.get('project_sku');
    const subdomain = url.searchParams.get('subdomain');

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate API key
    const { data: credential } = await supabase
      .from('xml_access_credentials')
      .select('id, project_id, allowed_origins')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .maybeSingle();

    if (!credential) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update usage
    await supabase.rpc('increment_credential_usage', { credential_id: credential.id });

    let projectId = null;

    // Resolve project ID from subdomain if provided
    if (subdomain) {
      const { data: subdomainData } = await supabase
        .from('project_subdomains')
        .select('project_id')
        .eq('subdomain', subdomain.toLowerCase())
        .eq('is_active', true)
        .maybeSingle();

      if (subdomainData) {
        projectId = subdomainData.project_id;
      }
    }

    // Or lookup by project_sku
    if (!projectId && projectSku) {
      const { data: projectData } = await supabase
        .from('projects')
        .select('id')
        .eq('project_sku', projectSku)
        .maybeSingle();

      if (projectData) {
        projectId = projectData.id;
      }
    }

    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch project with related data
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_sections(*),
        project_images(*),
        project_themes(*),
        project_lifecycle_stages(*),
        products(
          *,
          product_images(*),
          production_levels(*)
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(project), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in api-get-project:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
