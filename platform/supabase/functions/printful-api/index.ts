import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const token = Deno.env.get('PRINTFUL_API_TOKEN');
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Printful not configured' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { action, data } = body;

    let endpoint: string;
    let method = 'GET';
    let requestBody: string | undefined;

    switch (action) {
      case 'get_products':
        endpoint = 'https://api.printful.com/products';
        break;

      case 'get_product':
        endpoint = `https://api.printful.com/products/${data.product_id}`;
        break;

      case 'estimate':
        endpoint = 'https://api.printful.com/orders/estimate-costs';
        method = 'POST';
        requestBody = JSON.stringify(data.order);
        break;

      case 'create_order':
        endpoint = `https://api.printful.com/orders?confirm=${data.confirm || false}`;
        method = 'POST';
        requestBody = JSON.stringify(data.order);
        break;

      case 'confirm_order':
        endpoint = `https://api.printful.com/orders/${data.order_id}/confirm`;
        method = 'POST';
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const pfResponse = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...(requestBody ? { body: requestBody } : {}),
    });

    const result = await pfResponse.json();
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
