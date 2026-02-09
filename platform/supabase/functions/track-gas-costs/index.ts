import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0'
import { createPublicClient, http } from 'https://esm.sh/viem@2.38.0'
import { base, baseSepolia } from 'https://esm.sh/viem@2.38.0/chains'

Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { txHash, projectId, network = 'base' } = await req.json()

    if (!txHash || !projectId) {
      return new Response('Missing required fields', { status: 400 })
    }

    // Setup viem client
    const chain = network === 'base' ? base : baseSepolia
    const publicClient = createPublicClient({
      chain,
      transport: http(),
    })

    // Get transaction receipt
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    })

    if (!receipt) {
      return new Response('Transaction not found', { status: 404 })
    }

    // Get gas price
    const tx = await publicClient.getTransaction({
      hash: txHash as `0x${string}`,
    })

    // Calculate cost
    const gasUsed = receipt.gasUsed
    const gasPrice = tx.gasPrice || BigInt(0)
    const ethCost = Number(gasUsed * gasPrice) / 1e18
    const usdCost = ethCost * 2500 // Approximate ETH price

    // Determine transaction type
    let transactionType = 'transfer'
    if (receipt.contractAddress) {
      transactionType = 'contract_deploy'
    } else if (receipt.logs.length > 10) {
      transactionType = 'batch_mint'
    }

    // Background task: Record in database
    const backgroundTask = async () => {
      try {
        await supabaseClient.rpc('allocate_gas_from_pool', {
          _project_id: projectId,
          _transaction_type: transactionType,
          _gas_cost_usd: usdCost,
          _tx_hash: txHash,
          _notes: 'Auto-tracked transaction',
        })
      } catch (err) {
        console.error('Background task error:', err)
      }
    }

    backgroundTask() // Fire and forget

    return new Response(
      JSON.stringify({
        success: true,
        gasUsed: gasUsed.toString(),
        gasPriceGwei: (Number(gasPrice) / 1e9).toFixed(2),
        costETH: ethCost.toFixed(6),
        costUSD: usdCost.toFixed(2),
        transactionType,
        blockNumber: receipt.blockNumber.toString(),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
