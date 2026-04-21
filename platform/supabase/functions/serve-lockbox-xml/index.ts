import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0'

interface ValidationResult {
  is_valid: boolean
  project_id: string
  credential_id: string
}

interface LockboxConfig {
  cors_origins: string[]
  security_policy: {
    require_api_key: boolean
    rate_limit_per_hour: number
    allowed_methods: string[]
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
}

serve(async (req) => {
  console.log('Lockbox XML request received:', req.method, req.url)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const url = new URL(req.url)
    const projectId = url.searchParams.get('projectId')
    const subdomain = url.searchParams.get('subdomain')
    const apiKey = req.headers.get('x-api-key')
    const origin = req.headers.get('origin') || req.headers.get('referer') || 'unknown'

    console.log('Request params:', { projectId, subdomain, hasApiKey: !!apiKey, origin })

    // Allow lookup by either projectId or subdomain
    let resolvedProjectId = projectId

    if (!resolvedProjectId && subdomain) {
      console.log('Looking up project by subdomain:', subdomain)
      const { data: subdomainData } = await supabase
        .from('project_subdomains')
        .select('project_id')
        .eq('subdomain', subdomain)
        .eq('is_active', true)
        .maybeSingle()

      if (subdomainData) {
        resolvedProjectId = subdomainData.project_id
        console.log('Found project via subdomain:', resolvedProjectId)
      }
    }

    if (!resolvedProjectId) {
      console.error('Missing project identifier')
      return new Response(
        JSON.stringify({ error: 'Project ID or subdomain is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get lockbox configuration
    const { data: lockboxConfig, error: configError } = await supabase
      .from('subdomain_lockbox_configs')
      .select('*')
      .eq('project_id', resolvedProjectId)
      .eq('is_active', true)
      .maybeSingle() as { data: LockboxConfig | null, error: any }

    if (configError) {
      console.error('Error fetching lockbox config:', configError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch lockbox configuration' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!lockboxConfig) {
      console.error('No active lockbox config found')
      return new Response(
        JSON.stringify({ error: 'Lockbox not configured for this project' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if API key is required
    if (lockboxConfig.security_policy.require_api_key) {
      if (!apiKey) {
        console.error('Missing required API key')
        return new Response(
          JSON.stringify({ error: 'API key is required' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Validate API key
      const { data: validationData, error: validationError } = await supabase
        .rpc('validate_xml_access', {
          _api_key: apiKey,
          _origin: origin,
        })
        .maybeSingle() as { data: ValidationResult | null, error: any }

      if (validationError || !validationData || !validationData.is_valid) {
        console.error('Invalid API key or origin')
        await logAccess(supabase, null, resolvedProjectId, origin, req, false, 'Invalid credentials')
        return new Response(
          JSON.stringify({ error: 'Access denied' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Verify project matches
      if (validationData.project_id !== resolvedProjectId) {
        console.error('Project ID mismatch')
        await logAccess(supabase, validationData.credential_id, resolvedProjectId, origin, req, false, 'Project mismatch')
        return new Response(
          JSON.stringify({ error: 'Access denied' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Generate lockbox XML with industry pricing data
    console.log('Generating lockbox XML for project:', resolvedProjectId)
    const { data: xmlData, error: xmlError } = await supabase
      .rpc('generate_lockbox_xml', {
        _project_id: resolvedProjectId
      })
      .single()

    if (xmlError) {
      console.error('Error generating lockbox XML:', xmlError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate lockbox XML' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Log successful access
    await logAccess(supabase, null, resolvedProjectId, origin, req, true, null)

    console.log('Successfully generated lockbox XML')

    // Return XML with proper headers
    return new Response(String(xmlData), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'X-Lockbox-Generated': new Date().toISOString(),
        'X-Project-ID': resolvedProjectId,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Unexpected error in serve-lockbox-xml function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

// Helper function to log access attempts
async function logAccess(
  supabase: any,
  credentialId: string | null,
  projectId: string,
  origin: string,
  req: Request,
  success: boolean,
  errorMessage: string | null
) {
  try {
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown'

    await supabase.from('xml_access_logs').insert({
      credential_id: credentialId,
      project_id: projectId,
      ip_address: ipAddress,
      user_agent: userAgent,
      origin: origin,
      success: success,
      error_message: errorMessage,
    })
  } catch (error) {
    console.error('Failed to log access:', error)
  }
}
