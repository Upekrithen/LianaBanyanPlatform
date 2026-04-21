import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { projectId } = await req.json()

    if (!projectId) {
      throw new Error('Project ID is required')
    }

    console.log('Generating project module for project:', projectId)

    // Fetch project data with all related information
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        products (
          *,
          production_levels (*)
        )
      `)
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('Error fetching project:', projectError)
      throw projectError
    }

    // Get current funding snapshot
    const { data: funding } = await supabase
      .from('project_funding')
      .select('*')
      .eq('project_id', projectId)
      .single()

    // Build XML structure
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<ProjectModule timestamp="' + new Date().toISOString() + '">\n'
    xml += '  <Metadata>\n'
    xml += '    <ProjectSKU>' + xmlEscape(project.project_sku || 'PENDING') + '</ProjectSKU>\n'
    xml += '    <ProjectName>' + xmlEscape(project.name) + '</ProjectName>\n'
    xml += '    <Description>' + xmlEscape(project.description || '') + '</Description>\n'
    xml += '    <DetailedDescription>' + xmlEscape(project.detailed_description || '') + '</DetailedDescription>\n'
    xml += '    <CreatedAt>' + project.created_at + '</CreatedAt>\n'
    xml += '  </Metadata>\n'

    if (funding) {
      xml += '  <Funding>\n'
      xml += '    <TotalPot>' + funding.total_pot + '</TotalPot>\n'
      xml += '    <AllocatedCredits>' + funding.allocated_credits + '</AllocatedCredits>\n'
      xml += '    <AvailablePot>' + (funding.total_pot - funding.allocated_credits) + '</AvailablePot>\n'
      xml += '    <CreditPerUser>' + funding.credit_per_user + '</CreditPerUser>\n'
      xml += '  </Funding>\n'
    }

    xml += '  <Products>\n'
    for (const product of project.products || []) {
      xml += '    <Product>\n'
      xml += '      <ProductSKU>' + xmlEscape(product.product_sku || 'PENDING') + '</ProductSKU>\n'
      xml += '      <Name>' + xmlEscape(product.name) + '</Name>\n'
      xml += '      <Description>' + xmlEscape(product.description || '') + '</Description>\n'
      xml += '      <Details>' + xmlEscape(product.details || '') + '</Details>\n'
      xml += '      <ProductionLevels>\n'

      for (const level of product.production_levels || []) {
        xml += '        <Level>\n'
        xml += '          <LevelNumber>' + level.level_number + '</LevelNumber>\n'
        xml += '          <LevelName>' + xmlEscape(level.level_name) + '</LevelName>\n'
        xml += '          <UnitsCount>' + level.units_count + '</UnitsCount>\n'
        xml += '          <UnitPrice>' + level.unit_price + '</UnitPrice>\n'
        xml += '          <VotesNeeded>' + (level.votes_needed || 0) + '</VotesNeeded>\n'
        xml += '          <CurrentVotes>' + level.current_votes + '</CurrentVotes>\n'
        xml += '          <VolumeDiscountPercent>' +
          ((level.votes_needed > 0 ? (level.current_votes / level.votes_needed) * 100 : 0).toFixed(2)) +
          '</VolumeDiscountPercent>\n'
        xml += '        </Level>\n'
      }

      xml += '      </ProductionLevels>\n'
      xml += '    </Product>\n'
    }
    xml += '  </Products>\n'
    xml += '</ProjectModule>'

    // Store the module in the ledger
    const moduleVersion = await getNextModuleVersion(supabase, projectId)

    await supabase.from('project_modules').insert({
      project_id: projectId,
      module_version: moduleVersion,
      xml_data: xml,
      funding_snapshot: funding || {},
    })

    console.log('Project module generated successfully')

    return new Response(
      JSON.stringify({
        success: true,
        xml,
        version: moduleVersion,
        generated_at: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
      }
    )
  } catch (error) {
    console.error('Error generating project module:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
      }
    )
  }
})

// Helper function to escape XML special characters
function xmlEscape(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Helper function to get the next module version number
async function getNextModuleVersion(supabase: any, projectId: string): Promise<number> {
  const { data, error } = await supabase
    .from('project_modules')
    .select('module_version')
    .eq('project_id', projectId)
    .order('module_version', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching module version:', error)
    return 1
  }

  return data ? data.module_version + 1 : 1
}
