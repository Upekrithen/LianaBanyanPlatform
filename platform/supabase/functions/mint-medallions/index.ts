import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0'
import { createPublicClient, createWalletClient, http, parseAbi, encodeFunctionData, getAddress } from 'https://esm.sh/viem@2.38.0'
import { base, baseSepolia } from 'https://esm.sh/viem@2.38.0/chains'
import { privateKeyToAccount } from 'https://esm.sh/viem@2.38.0/accounts'

const MEDALLION_ABI = parseAbi([
  'function mintBatch(address[] to, uint256[] ids, uint256[] amounts, bytes data) external',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
])

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin/project owner
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { projectId, contractAddress, network = 'base' } = await req.json()

    // Verify user owns the project
    const { data: project } = await supabaseClient
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single()

    if (!project || project.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Get eligible users who haven't been minted yet
    const { data: eligibleUsers } = await supabaseClient
      .from('medallion_eligibility')
      .select('user_id, wallet_address, token_id')
      .eq('project_id', projectId)
      .eq('is_eligible', true)
      .eq('medallion_minted', false)
      .not('wallet_address', 'is', null)

    if (!eligibleUsers || eligibleUsers.length === 0) {
      return new Response(JSON.stringify({ message: 'No eligible users to mint' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Prepare batch mint data - validate and checksum addresses
    const addresses = eligibleUsers.map(u => {
      try {
        return getAddress(u.wallet_address!.trim()) as `0x${string}`
      } catch (e) {
        console.error(`Invalid address for user ${u.user_id}:`, u.wallet_address, e)
        throw new Error(`Invalid wallet address: ${u.wallet_address}`)
      }
    })
    const tokenIds = eligibleUsers.map(u => BigInt(u.token_id || 1))
    const amounts = eligibleUsers.map(() => BigInt(1))

    // Setup viem clients
    const chain = network === 'base' ? base : baseSepolia
    const publicClient = createPublicClient({
      chain,
      transport: http(),
    })

    // Get admin wallet from secrets
    let adminPrivateKey = Deno.env.get('ADMIN_WALLET_PRIVATE_KEY')
    if (!adminPrivateKey) {
      return new Response(JSON.stringify({ error: 'Admin wallet not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Clean and format the private key
    adminPrivateKey = adminPrivateKey.trim()
    if (!adminPrivateKey.startsWith('0x')) {
      adminPrivateKey = '0x' + adminPrivateKey
    }

    const account = privateKeyToAccount(adminPrivateKey as `0x${string}`)
    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(),
    })

    // Estimate gas
    const gasEstimate = await publicClient.estimateGas({
      account,
      to: contractAddress,
      data: encodeFunctionData({
        abi: MEDALLION_ABI,
        functionName: 'mintBatch',
        args: [addresses, tokenIds, amounts, '0x'],
      }),
    })

    const gasPrice = await publicClient.getGasPrice()
    const gasCostUSD = Number(gasEstimate * gasPrice) / 1e18 * 2500 // Approximate ETH price

    // Check gas budget
    const { data: pool } = await supabaseClient
      .from('lb_funding_pool')
      .select('total_pool_amount, allocated_to_gas, gas_budget_percentage')
      .single()

    if (pool) {
      const availableGasBudget = (pool.total_pool_amount * pool.gas_budget_percentage / 100) - pool.allocated_to_gas
      if (availableGasBudget < gasCostUSD) {
        return new Response(JSON.stringify({ error: 'Insufficient gas budget' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    // Execute mint
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: MEDALLION_ABI,
      functionName: 'mintBatch',
      args: [addresses, tokenIds, amounts, '0x'],
    })

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    // Background task: Update database
    const backgroundTask = async () => {
      try {
        // Record gas cost
        await supabaseClient.rpc('allocate_gas_from_pool', {
          _project_id: projectId,
          _transaction_type: 'batch_mint',
          _gas_cost_usd: gasCostUSD,
          _tx_hash: hash,
          _notes: `Minted ${eligibleUsers.length} medallions`,
        })

        // Update eligibility records
        for (const user of eligibleUsers) {
          await supabaseClient
            .from('medallion_eligibility')
            .update({
              medallion_minted: true,
              token_contract_address: contractAddress,
              minted_tx_hash: hash,
              minted_block_number: receipt.blockNumber.toString(),
            })
            .eq('user_id', user.user_id)
            .eq('project_id', projectId)
        }
      } catch (err) {
        console.error('Background task error:', err)
      }
    }

    backgroundTask() // Fire and forget

    return new Response(
      JSON.stringify({
        success: true,
        txHash: hash,
        blockNumber: receipt.blockNumber.toString(),
        mintedCount: eligibleUsers.length,
        gasCostUSD,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
