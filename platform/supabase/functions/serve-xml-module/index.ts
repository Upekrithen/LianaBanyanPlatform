import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0'

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

    // Get project ID from URL query params
    const url = new URL(req.url)
    const projectId = url.searchParams.get('projectId')
    const apiKey = req.headers.get('x-api-key') || url.searchParams.get('apiKey')
    const origin = req.headers.get('origin') || req.headers.get('referer') || 'unknown'

    if (!projectId) {
      throw new Error('Project ID is required')
    }

    console.log('Serving XML for project:', projectId, 'from origin:', origin)

    // Validate API key if provided
    let validationResult = null
    if (apiKey) {
      const { data, error } = await supabase.rpc('validate_xml_access', {
        _api_key: apiKey,
        _origin: origin
      })

      if (error) {
        console.error('Error validating API key:', error)
      } else if (data && data.length > 0) {
        validationResult = data[0]
      }

      // Log access attempt
      await supabase.from('xml_access_logs').insert({
        credential_id: validationResult?.credential_id || null,
        project_id: projectId,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        origin: origin,
        success: validationResult?.is_valid || false,
        error_message: validationResult?.is_valid ? null : 'Invalid or expired API key'
      })

      if (!validationResult?.is_valid) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired API key' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Fetch the latest XML module for the project
    const { data: module, error: moduleError } = await supabase
      .from('project_modules')
      .select('xml_data, module_version, created_at')
      .eq('project_id', projectId)
      .order('module_version', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (moduleError) {
      console.error('Error fetching XML module:', moduleError)
      throw moduleError
    }

    if (!module) {
      return new Response(
        JSON.stringify({ error: 'No XML module found for this project' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Successfully served XML module version:', module.module_version)

    // Return XML with proper headers
    return new Response(module.xml_data, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'X-Module-Version': module.module_version.toString(),
        'X-Generated-At': module.created_at,
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    })
  } catch (error) {
    console.error('Error serving XML module:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
