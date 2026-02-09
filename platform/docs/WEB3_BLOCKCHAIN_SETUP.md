# Web3 Blockchain Integration Setup

## Overview
This document covers the Base L2 + ERC-1155 blockchain integration for Medallion NFT minting and management.

## Architecture

### Network
- **Primary**: Base (Ethereum L2)
- **Testnet**: Base Sepolia
- **Gas Costs**: ~$0.01-0.05 per transaction
- **Confirmations**: ~2 seconds

### Token Standard
- **ERC-1155**: Multi-token standard
- **Token IDs**:
  - `1`: Seed Funding Medallion
  - `2`: Early Supporter Medallion
  - `3`: Community Builder Medallion
  - `4`: Project Champion Medallion

### Tech Stack
- **wagmi**: React hooks for Ethereum
- **viem**: TypeScript Ethereum library
- **RainbowKit**: Wallet connection UI
- **@tanstack/react-query**: Data fetching (used by wagmi)

## Setup Instructions

### 1. Get WalletConnect Project ID
1. Go to https://cloud.walletconnect.com/
2. Create a new project
3. Copy your Project ID
4. Add to `.env`:
   ```bash
   VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
   ```

### 2. Database Schema
The following tables have been created:

#### `blockchain_gas_costs`
Tracks all blockchain transaction costs:
- `transaction_type`: contract_deploy, batch_mint, transfer, metadata_update
- `total_cost_usd`: Cost in USD
- `funded_from_pool`: Whether paid from LB pool
- `network`: base or base-sepolia

#### `lb_funding_pool` (updated)
New fields:
- `allocated_to_gas`: Total gas spent from pool
- `gas_budget_percentage`: % of pool for gas (default 1%)

#### `medallion_eligibility` (updated)
New blockchain fields:
- `token_contract_address`: ERC-1155 contract address
- `token_id`: Token ID (1-4 for tier)
- `minted_tx_hash`: Mint transaction hash
- `wallet_address`: User's connected wallet

### 3. Gas Fee Management
- **Budget**: 1% of LB funding pool allocated for gas
- **Tracking**: All gas costs recorded in `blockchain_gas_costs` table
- **Function**: `allocate_gas_from_pool()` manages allocation
- **Annual Cost**: ~$10-30 per active project

## Next Steps

### Smart Contract Development
1. **Write ERC-1155 Contract**:
   ```solidity
   // MedallionNFT.sol
   contract MedallionNFT is ERC1155 {
     // Multi-token for different tiers
     // Metadata URIs per token ID
     // Batch minting
     // Access control for project owners
   }
   ```

2. **Deploy to Base Sepolia** (testnet first)
3. **Deploy to Base Mainnet** (production)

### Smart Contract Features Needed
- ✅ ERC-1155 multi-token standard
- ✅ Separate token IDs for each tier
- ✅ Batch minting for efficiency
- ✅ Owner/admin controls
- ⬜ Metadata URIs (IPFS or centralized)
- ⬜ Transfer restrictions (optional)
- ⬜ Royalties (if secondary market)

### Frontend Integration
1. **Wallet Connection**: `WalletConnectButton` component (✅ created)
2. **Mint Interface**: Admin panel for minting
3. **Token Display**: Show user's Medallions
4. **Transaction History**: View past mints/transfers
5. **Gas Dashboard**: `BlockchainGasDashboard` (✅ created)

### Backend Functions Needed
1. **Mint Medallions** (Edge Function):
   - Verify eligibility from database
   - Call contract's `mintBatch()` function
   - Record transaction in `blockchain_gas_costs`
   - Update `medallion_eligibility` with token data

2. **Gas Cost Tracker** (Edge Function):
   - Monitor transaction receipts
   - Calculate USD cost
   - Call `allocate_gas_from_pool()`

3. **Metadata Server**:
   - Serve token metadata (name, image, attributes)
   - Can use IPFS or Lovable storage buckets

## Usage Examples

### Connecting Wallet (Frontend)
```tsx
import { WalletConnectButton } from '@/components/WalletConnectButton';

function MyComponent() {
  return <WalletConnectButton />;
}
```

### Viewing Gas Stats
```tsx
import { BlockchainGasDashboard } from '@/components/BlockchainGasDashboard';

function AdminPanel() {
  return <BlockchainGasDashboard projectId={projectId} />;
}
```

### Allocating Gas from Pool (Backend)
```typescript
// In an edge function
const gasRecordId = await supabase.rpc('allocate_gas_from_pool', {
  _project_id: projectId,
  _transaction_type: 'batch_mint',
  _gas_cost_usd: 1.50,
  _tx_hash: '0x123...',
  _notes: 'Minted 100 Seed Funding Medallions'
});
```

## Security Considerations

1. **Private Keys**: NEVER store private keys in frontend or database
2. **Admin Wallet**: Use a secure wallet (hardware wallet) for contract deployment
3. **Access Control**: Only verified project owners can mint
4. **Gas Budget**: Monitor spending, set alerts if exceeding budget
5. **Contract Audits**: Get smart contract audited before mainnet deployment

## Cost Estimates (Base L2)

| Operation | Gas Cost (USD) | Frequency |
|-----------|----------------|-----------|
| Deploy Contract | $2-5 | Once per project |
| Batch Mint (100) | $0.50-2 | Per funding milestone |
| Single Transfer | $0.01-0.05 | Per user transfer |
| Metadata Update | $0.02-0.10 | Rare |

**Total Annual per Project**: ~$10-30

## Resources

- **Base Docs**: https://docs.base.org/
- **wagmi Docs**: https://wagmi.sh/
- **RainbowKit Docs**: https://www.rainbowkit.com/
- **ERC-1155 Standard**: https://eips.ethereum.org/EIPS/eip-1155
- **BaseScan Explorer**: https://basescan.org/

## Support

For blockchain integration questions:
1. Check wagmi/RainbowKit docs
2. Review Base developer resources
3. Test on Base Sepolia before mainnet
4. Monitor gas costs in dashboard
