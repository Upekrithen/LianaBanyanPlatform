import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface RequestMetrics {
  startTime: number;
  bytesTransferred: number;
}

interface ValidationResult {
  is_valid: boolean;
  project_id: string;
  credential_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const metrics: RequestMetrics = {
    startTime: Date.now(),
    bytesTransferred: 0
  };

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract API key from header
    const apiKey = req.headers.get('x-api-key');
    const url = new URL(req.url);
    const projectSku = url.searchParams.get('project');
    const moduleVersion = url.searchParams.get('version');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!projectSku) {
      return new Response(
        JSON.stringify({ error: 'Project SKU required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key and get project
    const { data: validationResult, error: validationError } = await supabase
      .rpc('validate_xml_access', {
        _api_key: apiKey,
        _origin: req.headers.get('origin') || req.headers.get('referer') || 'unknown'
      })
      .single();

    if (validationError || !validationResult || !(validationResult as ValidationResult).is_valid) {
      console.error('API key validation failed:', validationError);
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = validationResult as ValidationResult;
    const projectId = result.project_id;
    const credentialId = result.credential_id;

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, project_sku, name')
      .eq('project_sku', projectSku)
      .maybeSingle();

    if (projectError || !project) {
      console.error('Project not found:', projectError);
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify project matches credential
    if (project.id !== projectId) {
      return new Response(
        JSON.stringify({ error: 'API key not authorized for this project' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get lockbox XML data
    let query = supabase
      .from('project_modules')
      .select('module_version, xml_data, current_hash, is_verified, created_at')
      .eq('project_id', project.id)
      .order('module_version', { ascending: false });

    if (moduleVersion) {
      query = query.eq('module_version', parseInt(moduleVersion));
    } else {
      query = query.limit(1);
    }

    const { data: modules, error: moduleError } = await query;

    if (moduleError) {
      console.error('Module fetch error:', moduleError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch module data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!modules || modules.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No module versions found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const module = modules[0];

    // Build response with blockchain verification
    const responseData = {
      project_sku: project.project_sku,
      project_name: project.name,
      module_version: module.module_version,
      blockchain_verified: module.is_verified,
      hash: module.current_hash,
      generated_at: module.created_at,
      xml_data: module.xml_data
    };

    const responseBody = JSON.stringify(responseData, null, 2);
    metrics.bytesTransferred = new Blob([responseBody]).size;

    // Log API usage in background (non-blocking)
    const responseTimeMs = Date.now() - metrics.startTime;

    // Fire and forget - don't await
    supabase.rpc('log_api_usage', {
      _project_id: project.id,
      _credential_id: credentialId,
      _endpoint: '/serve-network-lockbox',
      _method: req.method,
      _status_code: 200,
      _response_time_ms: responseTimeMs,
      _bytes_transferred: metrics.bytesTransferred,
      _ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      _user_agent: req.headers.get('user-agent')
    }).then(({ error }) => {
      if (error) console.error('Failed to log API usage:', error);
    });

    // Track resource usage for cost attribution
    supabase.rpc('track_resource_usage', {
      _project_id: project.id,
      _portal: 'network',
      _resource_type: 'api_calls',
      _usage_count: 1,
      _cost_usd: 0.001, // $0.001 per API call
      _metadata: {
        endpoint: '/serve-network-lockbox',
        module_version: module.module_version,
        bytes_transferred: metrics.bytesTransferred
      }
    }).then(({ error }) => {
      if (error) console.error('Failed to track resource usage:', error);
    });

    return new Response(responseBody, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Response-Time': `${responseTimeMs}ms`,
        'X-Bytes-Transferred': `${metrics.bytesTransferred}`,
        'X-Module-Version': `${module.module_version}`,
        'X-Blockchain-Verified': `${module.is_verified}`
      }
    });

  } catch (error) {
    console.error('Network lockbox error:', error);

    const responseTimeMs = Date.now() - metrics.startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorBody = JSON.stringify({ error: errorMessage });

    return new Response(errorBody, {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Response-Time': `${responseTimeMs}ms`
      }
    });
  }
});
