import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PricingData {
  product_id: string
  production_run_id: string
  units_in_run: number
  volume_discount_percentage: number
  calculated_unit_price: number
  run_start_date?: string
  run_end_date?: string
}

serve(async (req) => {
  console.log('Industry pricing sync request received:', req.method)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { pricing_data } = await req.json() as { pricing_data: PricingData[] }

    if (!pricing_data || !Array.isArray(pricing_data)) {
      return new Response(
        JSON.stringify({ error: 'Invalid pricing data format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Processing ${pricing_data.length} pricing records`)

    const results = []
    const errors = []

    // Use service role for the sync operation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    for (const pricingRecord of pricing_data) {
      try {
        // Verify user has access to this product's project
        const { data: product } = await supabase
          .from('products')
          .select('project_id, projects!inner(owner_id)')
          .eq('id', pricingRecord.product_id)
          .single()

        if (!product || (product.projects as any).owner_id !== userData.user.id) {
          errors.push({
            product_id: pricingRecord.product_id,
            error: 'Unauthorized to update this product'
          })
          continue
        }

        // Sync pricing data
        const { data, error } = await supabaseAdmin
          .rpc('sync_industry_pricing_data', {
            _product_id: pricingRecord.product_id,
            _production_run_id: pricingRecord.production_run_id,
            _units: pricingRecord.units_in_run,
            _discount_pct: pricingRecord.volume_discount_percentage,
            _unit_price: pricingRecord.calculated_unit_price,
            _run_start: pricingRecord.run_start_date || null,
            _run_end: pricingRecord.run_end_date || null
          })

        if (error) {
          console.error('Error syncing pricing data:', error)
          errors.push({
            product_id: pricingRecord.product_id,
            error: error.message
          })
        } else {
          results.push({
            product_id: pricingRecord.product_id,
            pricing_id: data,
            status: 'synced'
          })
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('Error processing pricing record:', err)
        errors.push({
          product_id: pricingRecord.product_id,
          error: errorMessage
        })
      }
    }

    console.log(`Sync complete: ${results.length} successful, ${errors.length} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        synced: results.length,
        error_count: errors.length,
        results,
        error_details: errors.length > 0 ? errors : undefined
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Unexpected error in sync-industry-pricing function:', error)
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
