import { supabase } from '@/integrations/supabase/client';

interface PrintOrderRow {
  id: string;
  status: string;
  design_data: Record<string, unknown>;
  shipping_address: Record<string, unknown>;
  quantity: number;
  metadata: Record<string, unknown> | null;
  [key: string]: unknown;
}

export async function createPrintOrder(params: {
  userId: string;
  productionLevelId: string;
  quantity: number;
  designData: Record<string, unknown>;
  shippingAddress: Record<string, unknown>;
  creditsCost: number;
}) {
  const { data: order, error } = await (supabase
    .from('print_orders' as never)
    .insert({
      user_id: params.userId,
      production_level_id: params.productionLevelId,
      quantity: params.quantity,
      design_data: params.designData,
      shipping_address: params.shippingAddress,
      credits_cost: params.creditsCost,
      status: 'pending_approval',
      requires_approval: true,
    }) as any)
    .select()
    .single();

  if (error) throw error;
  return order as PrintOrderRow;
}

export async function approvePrintOrder(orderId: string, approvedBy: string) {
  const { data: order, error } = await (supabase
    .from('print_orders' as never)
    .update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    }) as any)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  const typedOrder = order as PrintOrderRow;

  const { data: printfulResult, error: pfError } = await supabase.functions.invoke('printful-api', {
    body: {
      action: 'create_order',
      data: {
        confirm: false,
        order: {
          recipient: typedOrder.shipping_address,
          items: [{
            variant_id: (typedOrder.design_data as any).printful_variant_id,
            quantity: typedOrder.quantity,
            files: (typedOrder.design_data as any).print_files || [],
          }],
        },
      },
    },
  });

  if (pfError) {
    await (supabase
      .from('print_orders' as never)
      .update({ status: 'printful_error', metadata: { error: pfError.message } }) as any)
      .eq('id', orderId);
    throw pfError;
  }

  await (supabase
    .from('print_orders' as never)
    .update({
      status: 'printful_draft',
      metadata: { printful_order_id: printfulResult.result?.id },
    }) as any)
    .eq('id', orderId);

  return { order: typedOrder, printfulResult };
}

export async function confirmPrintfulOrder(orderId: string) {
  const { data: order } = await (supabase
    .from('print_orders' as never)
    .select('metadata') as any)
    .eq('id', orderId)
    .single();

  const typedOrder = order as { metadata: Record<string, unknown> } | null;
  if (!typedOrder?.metadata?.printful_order_id) {
    throw new Error('No Printful order ID found');
  }

  const { data, error } = await supabase.functions.invoke('printful-api', {
    body: {
      action: 'confirm_order',
      data: { order_id: typedOrder.metadata.printful_order_id },
    },
  });

  if (error) throw error;

  await (supabase
    .from('print_orders' as never)
    .update({ status: 'in_production' }) as any)
    .eq('id', orderId);

  return data;
}

export async function getPendingOrders() {
  const { data, error } = await (supabase
    .from('print_orders' as never)
    .select('*') as any)
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as PrintOrderRow[];
}
