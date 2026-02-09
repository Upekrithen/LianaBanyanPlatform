import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0'

interface ValidationResult {
  is_valid: boolean
  project_id: string
  credential_id: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
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
    const apiKey = req.headers.get('x-api-key')
    const origin = req.headers.get('origin') || req.headers.get('referer') || 'unknown'

    if (!projectId) {
      console.error('Missing projectId parameter')
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!apiKey) {
      console.error('Missing API key')
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate API key and check access
    const { data: validationData, error: validationError } = await supabase
      .rpc('validate_xml_access', {
        _api_key: apiKey,
        _origin: origin,
      })
      .single() as { data: ValidationResult | null, error: any }

    if (validationError || !validationData) {
      console.error('Validation error:', validationError)
      await logAccess(supabase, null, projectId, origin, req, false, 'Validation failed')
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!validationData.is_valid) {
      console.error('Invalid API key or origin')
      await logAccess(supabase, null, projectId, origin, req, false, 'Invalid credentials')
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify project matches
    if (validationData.project_id !== projectId) {
      console.error('Project ID mismatch')
      await logAccess(supabase, validationData.credential_id, projectId, origin, req, false, 'Project mismatch')
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the latest XML module for the project
    const { data: moduleData, error: moduleError } = await supabase
      .from('project_modules')
      .select('xml_data, module_version, created_at')
      .eq('project_id', projectId)
      .order('module_version', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (moduleError) {
      console.error('Error fetching module:', moduleError)
      await logAccess(supabase, validationData.credential_id, projectId, origin, req, false, 'Module fetch error')
      return new Response(
        JSON.stringify({ error: 'Failed to fetch XML module' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!moduleData) {
      console.error('No XML module found for project:', projectId)
      await logAccess(supabase, validationData.credential_id, projectId, origin, req, false, 'No module found')
      return new Response(
        JSON.stringify({ error: 'No XML module found for this project' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Log successful access
    await logAccess(supabase, validationData.credential_id, projectId, origin, req, true, null)

    console.log('Successfully served XML module:', {
      projectId,
      version: moduleData.module_version,
      origin,
    })

    // Return XML with proper headers
    return new Response(moduleData.xml_data, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'X-Module-Version': moduleData.module_version.toString(),
        'X-Generated-At': moduleData.created_at,
      },
    })
  } catch (error) {
    console.error('Unexpected error in serve-xml function:', error)
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
